import { test } from "node:test";
import assert from "node:assert/strict";
import ExcelJS from "exceljs";
import { cnj, data, dinheiro, importarBloqueios, importarProcessos } from "../lib/importar/planilha.mjs";

async function xlsx(linhas) {
  const wb = new ExcelJS.Workbook();
  const aba = wb.addWorksheet("Relatório");
  linhas.forEach((l) => aba.addRow(l));
  return Buffer.from(await wb.xlsx.writeBuffer());
}

test("converte números CNJ, dinheiro e datas nos formatos comuns", () => {
  assert.equal(cnj("00012345620245010001"), "0001234-56.2024.5.01.0001");
  assert.equal(cnj("0001234-56.2024.5.01.0001"), "0001234-56.2024.5.01.0001");
  assert.equal(cnj("123"), null);
  assert.equal(dinheiro("R$ 1.234.567,89"), 1234567.89);
  assert.equal(dinheiro("1,234.50"), 1234.5);
  assert.equal(dinheiro(1500), 1500);
  assert.ok(Number.isNaN(dinheiro("abc")));
  assert.equal(data("07/10/2026"), "2026-10-07");
  assert.equal(data(new Date("2026-10-07T00:00:00Z")), "2026-10-07");
  assert.equal(data(46302), "2026-10-07"); // data serial do Excel
});

test("lê relatório de processos com título antes do cabeçalho e aponta problemas", async () => {
  const arq = await xlsx([
    ["Relatório de Processos - Azevedo dos Reis"],
    ["Gerado em 07/10/2026"],
    [],
    ["Pasta", "Número do Processo", "Cliente", "Contrato de Gestão", "Área", "Ação", "Situação", "Valor da Causa", "Prognóstico", "Responsável", "Data do último andamento", "Coluna estranha"],
    ["P-001", "0001234-56.2024.5.01.0001", "AFNE", "Município de Niterói", "Trabalhista", "Verbas rescisórias", "Em andamento", "R$ 150.000,00", "Provável", "Dra. Ana", new Date("2026-07-01T00:00:00Z"), "x"],
    ["P-002", "0001235-56.2024.8.19.0001", "Instituto Gnosis", "", "Cível", "Cobrança", "Arquivado", 80000, "Remota", "Dr. Paulo", "15/09/2026", "y"],
    ["P-003", "", "FAS", "Estado do RJ", "Tributário", "Execução fiscal", "Em andamento", "muito", "talvez", "", "", ""],
    ["P-001", "0001234-56.2024.5.01.0001", "AFNE", "", "Trabalhista", "Repetida", "Em andamento", 1, "Provável", "", "", ""],
    [],
  ]);
  const r = await importarProcessos(arq, { nome: "processos.xlsx" });
  assert.equal(r.ok, true);
  assert.equal(r.processos.length, 3);
  const [p1, p2, p3] = r.processos;
  assert.equal(p1.numero_cnj, "0001234-56.2024.5.01.0001");
  assert.equal(p1.valor_causa, 150000);
  assert.equal(p1.prognostico, "Provável");
  assert.equal(p1.ultima_movimentacao, "2026-07-01");
  assert.equal(p1.ativo, true);
  assert.equal(p2.ativo, false);            // arquivado
  assert.equal(p2.prognostico, "Remoto");  // "Remota" também vale
  assert.equal(p3.numero_cnj, null);        // sem CNJ, mas com pasta: entra pela pasta
  assert.equal(p3.area, null);              // "Tributário" não é área do app
  assert.deepEqual(r.colunas.ignoradas, ["Coluna estranha"]);
  const msgs = r.problemas.map((x) => `${x.linha}:${x.campo}`);
  assert.ok(msgs.includes("7:área"));
  assert.ok(msgs.includes("7:valor da causa"));
  assert.ok(msgs.includes("7:prognóstico"));
  assert.ok(msgs.includes("8:número do processo")); // repetido
  assert.equal(r.resumo.ativos, 2);
});

test("lê a tabela de uma página HTML exportada", async () => {
  const html = `<html><body><h1>Processos</h1><table><tr><td>menu</td></tr></table>
    <table><thead><tr><th>Nº CNJ</th><th>Cliente</th><th>Situação</th><th>Valor da causa</th></tr></thead>
    <tbody><tr><td>0001236-56.2024.5.01.0001</td><td>IGEDES</td><td>Suspenso</td><td>R$ 26.000,00</td></tr>
    <tr><td>0001237-56.2024.5.01.0001</td><td>IGEDES</td><td>Baixado</td><td>10.000,50</td></tr></tbody></table></body></html>`;
  const r = await importarProcessos(Buffer.from(html), { nome: "relatorio.html" });
  assert.equal(r.ok, true);
  assert.deepEqual(r.processos.map((p) => [p.cliente, p.valor_causa, p.ativo]), [["IGEDES", 26000, true], ["IGEDES", 10000.5, false]]);
});

test("explica quando não acha o cabeçalho", async () => {
  const r = await importarProcessos(await xlsx([["a", "b"], [1, 2]]), { nome: "x.xlsx" });
  assert.equal(r.ok, false);
  assert.match(r.erro, /cabeçalho/);
});

test("lê o Log de Bloqueios", async () => {
  const arq = await xlsx([
    ["Processo", "Cliente", "Valor bloqueado", "Data do bloqueio", "Situação", "Data do levantamento"],
    ["0001234-56.2024.5.01.0001", "AFNE", "R$ 18.400,00", "10/08/2026", "Levantado", "02/09/2026"],
    ["0001235-56.2024.5.01.0001", "FAS", 99600, "01/10/2026", "Ativo", ""],
    ["sem número", "FAS", 1000, "01/10/2026", "Ativo", ""],
    ["0001236-56.2024.5.01.0001", "FAS", "", "01/10/2026", "Ativo", ""],
  ]);
  const r = await importarBloqueios(arq, { nome: "bloqueios.xlsx" });
  assert.equal(r.bloqueios.length, 2);
  assert.deepEqual(r.bloqueios.map((b) => [b.valor, b.situacao]), [[18400, "Levantado"], [99600, "Ativo"]]);
  assert.equal(r.problemas.length, 2);
});
