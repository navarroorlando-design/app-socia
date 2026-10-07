import { test } from "node:test";
import assert from "node:assert/strict";
import { aliasDoTribunal, limparNumero, memoriaEmObjeto, normalizar, verificarAtualizacoes } from "../lib/datajud.mjs";

test("descobre o tribunal pelo número CNJ", () => {
  assert.equal(aliasDoTribunal("0001234-56.2024.5.01.0001"), "trt1");
  assert.equal(aliasDoTribunal("0001234-56.2024.8.19.0001"), "tjrj");
  assert.equal(aliasDoTribunal("0001234-56.2024.8.07.0001"), "tjdft");
  assert.equal(aliasDoTribunal("0001234-56.2024.4.02.5101"), "trf2");
  assert.equal(aliasDoTribunal("0001234-56.2024.5.00.0000"), "tst");
  assert.equal(aliasDoTribunal("0001234-56.2024.3.00.0000"), "stj");
  assert.equal(aliasDoTribunal("0001234-56.2024.6.19.0001"), "tre-rj");
  assert.equal(aliasDoTribunal("0001234-56.2024.1.00.0000"), null); // STF fora da API pública
  assert.throws(() => limparNumero("123"));
});

const hit = (grau, movs) => ({ _source: { numeroProcesso: "00012345620245010001", grau, tribunal: "TRT1", classe: { nome: "Ação Trabalhista" }, orgaoJulgador: { nome: "1ª Vara do Trabalho" }, movimentos: movs } });

test("junta os graus, tira repetidos e ordena do mais recente", () => {
  const { cabecalho, movimentos } = normalizar([
    hit("G1", [{ codigo: 26, nome: "Distribuição", dataHora: "2024-01-10T10:00:00" }, { codigo: 193, nome: "Sentença", dataHora: "2024-06-01T10:00:00", complementosTabelados: [{ nome: "tipo", descricao: "procedente em parte" }] }]),
    hit("G1", [{ codigo: 26, nome: "Distribuição", dataHora: "2024-01-10T10:00:00" }]),
    hit("G2", [{ codigo: 123, nome: "Recurso ordinário", dataHora: "2024-08-01T10:00:00" }]),
  ]);
  assert.equal(cabecalho.classe, "Ação Trabalhista");
  assert.deepEqual(movimentos.map((m) => m.nome), ["Recurso ordinário", "Sentença", "Distribuição"]);
  assert.deepEqual(movimentos[1].complementos, ["tipo: procedente em parte"]);
});

test("primeira verificação guarda o histórico; a seguinte avisa só o que é novo", async () => {
  const cnj = "0001234-56.2024.5.01.0001";
  let movs = [{ codigo: 26, nome: "Distribuição", dataHora: "2024-01-10T10:00:00" }];
  const buscar = async () => normalizar([hit("G1", movs)]);
  const memoria = memoriaEmObjeto();
  const r1 = await verificarAtualizacoes([cnj], memoria, { buscar, pausaMs: 0 });
  assert.equal(r1[0].primeiraVez, true);
  assert.equal(r1[0].novos.length, 0);
  movs = [...movs, { codigo: 11010, nome: "Bloqueio de valores via SISBAJUD", dataHora: "2024-09-02T09:00:00" }];
  const r2 = await verificarAtualizacoes([cnj], memoria, { buscar, pausaMs: 0 });
  assert.deepEqual(r2[0].novos.map((m) => m.nome), ["Bloqueio de valores via SISBAJUD"]);
  const r3 = await verificarAtualizacoes([cnj], memoria, { buscar, pausaMs: 0 });
  assert.equal(r3[0].novos.length, 0);
});

test("erro de um processo não derruba os outros", async () => {
  const buscar = async (cnj) => { if (cnj.startsWith("9")) throw new Error("falhou"); return normalizar([]); };
  const r = await verificarAtualizacoes(["9001234-56.2024.5.01.0001", "0001234-56.2024.5.01.0001"], memoriaEmObjeto(), { buscar, pausaMs: 0 });
  assert.equal(r[0].ok, false);
  assert.equal(r[1].ok, true);
});
