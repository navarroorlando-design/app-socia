import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ExcelJS from "exceljs";
import { gerarModulo, lerTotais } from "../lib/importar/totais.mjs";

// Planilha inventada no mesmo formato da extração real (abas e colunas), sem nenhum dado real.
async function planilha({ contratoExtra } = {}) {
  const wb = new ExcelJS.Workbook();
  wb.addWorksheet("Como ler").addRows([["Processos ativos"], ["Posição do acervo em 03/11/2026. Texto qualquer."]]);
  wb.addWorksheet("Processos").addRows([
    ["Cliente", "Área", "Número", "Descrição", "Contrato", "Status no cadastro", "Data da distribuição", "Data da última publicação", "Valor em discussão (R$)", "Prognóstico", "Parte contrária", "Posição do cliente", "Cidade", "UF", "Localidade", "Ainda bloqueado (R$)", "Já devolvido (R$)", "Pago à outra parte (R$)", "Lançamentos de bloqueio", "Origem do bloqueio"],
    ["AFNE", "Trabalhista", "0000001-11.2024.5.01.0001", "x", "CG 1", "Ativo", null, null, null, null, "Fulano de Tal", "Réu", null, null, "x", 100, 0, 0, 1, "trabalhista AFNE"],
    ["AFNE", "Cível", "0000002-11.2024.8.19.0001", "x", "CG 1", "Ativo", null, null, null, null, "Beltrana", "Réu", null, null, "x", 0, 50, 0, 1, "cível"],
    ["Gnosis", "Trabalhista", "0000003-11.2024.5.01.0001", "x", "CG 2", "Ativo", null, null, null, null, "Ciclano", "Réu", null, null, "x", 200, 0, 0, 2, "trabalhista Gnosis"],
  ]);
  wb.addWorksheet("Métricas").addRows([
    ["Cliente", "Área", "Contrato", "Processos", "Ainda bloqueado (R$)", "Já devolvido (R$)", "Pago à outra parte (R$)", "Processos com bloqueio lançado"],
    ["AFNE", "Cível", "todos os contratos", 1, 0, 50, 0, 1],
    ["AFNE", "Trabalhista", "todos os contratos", 1, 100, 0, 0, 1],
    ["Gnosis", "Trabalhista", "todos os contratos", 1, 200, 0, 0, 1],
    [],
    ["Nota de rodapé que não é linha de cliente."],
  ]);
  wb.addWorksheet("Por contrato").addRows([
    ["Cliente", "Área", "Contrato", "Processos", "Ainda bloqueado (R$)", "Já devolvido (R$)", "Pago à outra parte (R$)"],
    ["AFNE", "Cível", "CG 1", 1, 0, 50, 0],
    ["AFNE", "Trabalhista", "CG 1", 1, 100, 0, 0],
    ["Gnosis", "Trabalhista", contratoExtra || "CG 2", 1, 200, 0, 0],
  ]);
  wb.addWorksheet("Bloqueios sem processo ativo").addRows([
    ["Número no controle de bloqueio", "Origem", "Ainda bloqueado (R$)", "Já devolvido (R$)", "Pago à outra parte (R$)", "Lançamentos"],
    ["0000009-11.2020.5.01.0001", "trabalhista Gnosis", 30, 5, 1, 1],
    ["0000010-11.2020.8.19.0001", "cível", 0, 70, 2, 1],
  ]);
  const dir = await mkdtemp(join(tmpdir(), "totais-"));
  const arq = join(dir, "acervo.xlsx");
  await writeFile(arq, Buffer.from(await wb.xlsx.writeBuffer()));
  return arq;
}

test("soma por cliente, área e contrato, e atribui o bloqueio sem processo ativo pela origem", async () => {
  const t = await lerTotais(await planilha());
  assert.equal(t.referencia, "03/11/2026");
  assert.deepEqual(t.clientes.afne.porArea, { Cível: 1, Trabalhista: 1 });
  assert.equal(t.clientes.afne.processos, 2);
  assert.deepEqual(t.clientes.afne.ativo, { bloqueado: 100, devolvido: 50, pago: 0 });
  assert.equal(t.clientes.afne.comValor, 1);
  assert.deepEqual(t.clientes.afne.contratos[0], { nome: "CG 1", processos: 2, porArea: { Cível: 1, Trabalhista: 1 }, bloqueado: 100, devolvido: 50, pago: 0 });
  assert.deepEqual(t.clientes.gnosis.semProcessoAtivo, { bloqueado: 30, devolvido: 5, pago: 1 });
  assert.equal(t.clientes.gnosis.comValorSemProcessoAtivo, 1);
  assert.deepEqual(t.semProcessoAtivoSemCliente, { bloqueado: 0, devolvido: 70, pago: 2 });
});

test("o módulo gerado não leva número de processo nem nome de parte", async () => {
  const fonte = gerarModulo(await lerTotais(await planilha()), "acervo.xlsx");
  assert.doesNotMatch(fonte, /\d{7}-\d{2}\.\d{4}/);
  for (const nome of ["Fulano", "Beltrana", "Ciclano"]) assert.ok(!fonte.includes(nome), nome);
});

test("recusa gravar se um número de processo aparecer nos totais", async () => {
  const t = await lerTotais(await planilha({ contratoExtra: "Processo 0000003-11.2024.5.01.0001" }));
  assert.throws(() => gerarModulo(t, "acervo.xlsx"), /número de processo/);
});
