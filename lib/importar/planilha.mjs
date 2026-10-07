/* ------------------------------------------------------------------ */
/* Importação dos relatórios exportados do Legal One (XLSX ou HTML)    */
/* Não há API: alguém exporta o relatório e o app lê o arquivo. Os     */
/* nomes de coluna variam conforme o relatório, então cada campo aceita */
/* vários nomes. O que não for entendido vira "problema", nunca palpite. */
/* ------------------------------------------------------------------ */
import ExcelJS from "exceljs";
import { parse as parseHtml } from "node-html-parser";

const semAcento = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

// Campo do banco → nomes de coluna aceitos (comparados sem acento e sem pontuação)
const COLUNAS_PROCESSOS = {
  numero_cnj: ["numero do processo", "numero cnj", "n cnj", "no cnj", "processo", "numero processo", "numero"],
  pasta: ["pasta", "numero da pasta", "codigo da pasta", "id"],
  cliente: ["cliente", "cliente principal", "organizacao", "parte cliente"],
  contrato: ["contrato de gestao", "contrato", "orgao contratante", "contrato gestao"],
  area: ["area", "area do direito", "natureza", "tipo de acao", "ramo"],
  descricao: ["acao", "objeto", "assunto", "descricao", "titulo", "tipo de acao principal"],
  situacao: ["situacao", "status", "fase"],
  valor_causa: ["valor da causa", "valor causa", "valor envolvido", "valor do pedido", "valor"],
  prognostico: ["prognostico", "risco", "probabilidade de perda", "classificacao de risco"],
  advogado_responsavel: ["responsavel", "advogado responsavel", "advogado", "responsavel principal"],
  ultima_movimentacao: ["data do ultimo andamento", "ultimo andamento", "ultima movimentacao", "data da ultima movimentacao", "atualizado em"],
  ultimo_andamento: ["descricao do ultimo andamento", "andamento", "texto do andamento", "ultimo andamento descricao"],
};

const COLUNAS_BLOQUEIOS = {
  numero_cnj: COLUNAS_PROCESSOS.numero_cnj,
  cliente: COLUNAS_PROCESSOS.cliente,
  valor: ["valor", "valor bloqueado", "valor do bloqueio", "quantia"],
  data_bloqueio: ["data", "data do bloqueio", "data bloqueio"],
  situacao: ["situacao", "status"],
  data_levantamento: ["data do levantamento", "levantado em", "data levantamento"],
};

/* ---------------- leitura das tabelas ---------------- */

// XLSX: devolve linhas (arrays de texto/número/data) da primeira aba com conteúdo
async function linhasDoXlsx(entrada) {
  const wb = new ExcelJS.Workbook();
  if (typeof entrada === "string") await wb.xlsx.readFile(entrada); else await wb.xlsx.load(entrada);
  const aba = wb.worksheets.find((w) => w.actualRowCount > 0);
  if (!aba) return [];
  const linhas = [];
  aba.eachRow({ includeEmpty: false }, (row) => {
    const valores = [];
    row.eachCell({ includeEmpty: true }, (cell, col) => {
      let v = cell.value;
      if (v && typeof v === "object" && !(v instanceof Date)) v = v.result ?? v.text ?? v.richText?.map((t) => t.text).join("") ?? String(v);
      valores[col - 1] = v;
    });
    valores.n = row.number; // número da linha no Excel, para a equipe achar o problema
    linhas.push(valores);
  });
  return linhas;
}

// HTML: a maior <table> da página (relatório "exportar para HTML" ou página salva)
function linhasDoHtml(html) {
  const doc = parseHtml(String(html));
  const tabelas = doc.querySelectorAll("table");
  if (!tabelas.length) return [];
  const maior = tabelas.reduce((a, b) => (b.querySelectorAll("tr").length > a.querySelectorAll("tr").length ? b : a));
  return maior.querySelectorAll("tr").map((tr) => tr.querySelectorAll("th,td").map((c) => c.text.replace(/\s+/g, " ").trim()));
}

// Acha a linha de cabeçalho (a primeira, entre as 15 primeiras, com 3+ colunas reconhecidas)
function mapearCabecalho(linhas, colunas) {
  for (let i = 0; i < Math.min(15, linhas.length); i++) {
    const cab = (linhas[i] || []).map(semAcento);
    const mapa = {};
    for (const [campo, nomes] of Object.entries(colunas)) {
      // prefere nome exato; depois "começa com"
      let idx = cab.findIndex((c) => nomes.includes(c));
      if (idx < 0) idx = cab.findIndex((c) => c && nomes.some((n) => c.startsWith(n)));
      if (idx >= 0 && !Object.values(mapa).includes(idx)) mapa[campo] = idx;
    }
    if (Object.keys(mapa).length >= 3) {
      const usados = new Set(Object.values(mapa));
      return { linhaCabecalho: i, mapa, ignoradas: (linhas[i] || []).filter((c, j) => c && !usados.has(j)).map(String) };
    }
  }
  return null;
}

/* ---------------- conversão dos valores ---------------- */

function cnj(v) {
  const d = String(v ?? "").replace(/\D/g, "");
  if (d.length !== 20) return null;
  return `${d.slice(0, 7)}-${d.slice(7, 9)}.${d.slice(9, 13)}.${d[13]}.${d.slice(14, 16)}.${d.slice(16)}`;
}

function dinheiro(v) {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return Math.round(v * 100) / 100;
  let s = String(v).replace(/[R$\s]/g, "");
  if (/,\d{1,2}$/.test(s)) s = s.replace(/\./g, "").replace(",", "."); // 1.234,56
  else s = s.replace(/,/g, "");                                      // 1,234.56 ou 1234
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN;
}

function data(v) {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "number") return new Date(Math.round((v - 25569) * 86400000)).toISOString().slice(0, 10); // data serial do Excel
  const m = String(v).match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (m) { const a = m[3].length === 2 ? "20" + m[3] : m[3]; return `${a}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`; }
  const iso = String(v).match(/\d{4}-\d{2}-\d{2}/);
  return iso ? iso[0] : NaN;
}

function area(v) {
  const s = semAcento(v);
  if (!s) return null;
  if (s.includes("trabalh")) return "Trabalhista";
  if (s.includes("civel") || s.includes("civil")) return "Cível";
  if (s.includes("administr")) return "Administrativo";
  if (s.includes("constitucion") || s.includes("reclamacao constitucional") || s.includes("stf")) return "Constitucional";
  return NaN;
}

function prognostico(v) {
  const s = semAcento(v);
  if (!s) return null;
  if (s.startsWith("prov")) return "Provável";
  if (s.startsWith("poss")) return "Possível";
  if (s.startsWith("rem")) return "Remoto";
  return NaN;
}

const inativo = (situacao) => /arquiv|baixad|encerrad|extint|finalizad/.test(semAcento(situacao));

/* ---------------- importação ---------------- */

async function lerArquivo(arquivo, nome = "") {
  const ehHtml = /\.html?$/i.test(nome || (typeof arquivo === "string" ? arquivo : "")) || (typeof arquivo !== "string" && /^\s*</.test(Buffer.from(arquivo).subarray(0, 200).toString()));
  if (ehHtml) {
    const { readFile } = await import("node:fs/promises");
    return linhasDoHtml(typeof arquivo === "string" ? await readFile(arquivo, "utf8") : Buffer.from(arquivo).toString("utf8"));
  }
  return linhasDoXlsx(arquivo);
}

/**
 * Importa o relatório de processos. Devolve os processos prontos para o banco e a lista de
 * problemas por linha. Nada é gravado aqui: quem chama decide se confirma a importação.
 */
async function importarProcessos(arquivo, { nome } = {}) {
  const linhas = await lerArquivo(arquivo, nome);
  const cab = mapearCabecalho(linhas, COLUNAS_PROCESSOS);
  if (!cab) return { ok: false, erro: "Não encontrei o cabeçalho do relatório (procurei colunas como Número do processo, Cliente, Situação).", processos: [], problemas: [] };
  const { mapa, linhaCabecalho, ignoradas } = cab;
  const pega = (l, campo) => (mapa[campo] === undefined ? undefined : l[mapa[campo]]);
  const processos = [], problemas = [], vistos = new Set();

  linhas.slice(linhaCabecalho + 1).forEach((l, i) => {
    const linha = l?.n ?? linhaCabecalho + i + 2; // número da linha como aparece no Excel
    if (!l || l.every((c) => c === undefined || c === null || String(c).trim() === "")) return;
    const num = cnj(pega(l, "numero_cnj"));
    const pasta = pega(l, "pasta") ? String(pega(l, "pasta")).trim() : null;
    if (!num && !pasta) { problemas.push({ linha, campo: "número do processo", mensagem: "sem número CNJ válido nem pasta; linha ignorada" }); return; }
    const chave = num || pasta;
    if (vistos.has(chave)) { problemas.push({ linha, campo: "número do processo", mensagem: `repetido (${chave}); mantida a primeira linha` }); return; }
    vistos.add(chave);

    const p = {
      numero_cnj: num, pasta,
      cliente: pega(l, "cliente") ? String(pega(l, "cliente")).trim() : null,
      contrato: pega(l, "contrato") ? String(pega(l, "contrato")).trim() : null,
      area: area(pega(l, "area")),
      descricao: String(pega(l, "descricao") ?? "").trim() || null,
      situacao: String(pega(l, "situacao") ?? "").trim() || null,
      valor_causa: dinheiro(pega(l, "valor_causa")),
      prognostico: prognostico(pega(l, "prognostico")),
      advogado_responsavel: pega(l, "advogado_responsavel") ? String(pega(l, "advogado_responsavel")).trim() : null,
      ultima_movimentacao: data(pega(l, "ultima_movimentacao")),
      ultimo_andamento: pega(l, "ultimo_andamento") ? String(pega(l, "ultimo_andamento")).trim() : null,
    };
    // valores que vieram mas não foram entendidos: avisa e deixa em branco
    for (const [campo, rotulo] of [["area", "área"], ["valor_causa", "valor da causa"], ["prognostico", "prognóstico"], ["ultima_movimentacao", "data do último andamento"]]) {
      if (Number.isNaN(p[campo])) { problemas.push({ linha, campo: rotulo, mensagem: `não entendi "${pega(l, campo)}"; ficou em branco` }); p[campo] = null; }
    }
    if (!p.cliente) problemas.push({ linha, campo: "cliente", mensagem: "sem cliente; o processo entra, mas fica fora das telas de organização" });
    if (num && pega(l, "numero_cnj") && !cnj(pega(l, "numero_cnj"))) problemas.push({ linha, campo: "número do processo", mensagem: "número fora do padrão CNJ" });
    p.ativo = !inativo(p.situacao);
    processos.push(p);
  });

  return {
    ok: true, processos, problemas,
    colunas: { reconhecidas: Object.fromEntries(Object.entries(mapa).map(([c, i]) => [c, String(linhas[linhaCabecalho][i])])), ignoradas },
    resumo: {
      linhas: processos.length,
      ativos: processos.filter((p) => p.ativo).length,
      porArea: processos.reduce((m, p) => ((m[p.area || "sem área"] = (m[p.area || "sem área"] || 0) + 1), m), {}),
      semContrato: processos.filter((p) => !p.contrato).length,
      semPrognostico: processos.filter((p) => !p.prognostico).length,
    },
  };
}

/** Importa o Log de Bloqueios (planilha ou HTML). */
async function importarBloqueios(arquivo, { nome } = {}) {
  const linhas = await lerArquivo(arquivo, nome);
  const cab = mapearCabecalho(linhas, COLUNAS_BLOQUEIOS);
  if (!cab) return { ok: false, erro: "Não encontrei o cabeçalho do Log de Bloqueios (procurei Processo, Valor, Data, Situação).", bloqueios: [], problemas: [] };
  const { mapa, linhaCabecalho } = cab;
  const pega = (l, campo) => (mapa[campo] === undefined ? undefined : l[mapa[campo]]);
  const bloqueios = [], problemas = [];
  linhas.slice(linhaCabecalho + 1).forEach((l, i) => {
    const linha = l?.n ?? linhaCabecalho + i + 2;
    if (!l || l.every((c) => c === undefined || c === null || String(c).trim() === "")) return;
    const num = cnj(pega(l, "numero_cnj"));
    const valor = dinheiro(pega(l, "valor"));
    const quando = data(pega(l, "data_bloqueio"));
    if (!num) { problemas.push({ linha, campo: "processo", mensagem: "sem número CNJ válido; linha ignorada" }); return; }
    if (!(valor > 0)) { problemas.push({ linha, campo: "valor", mensagem: `valor inválido "${pega(l, "valor")}"; linha ignorada` }); return; }
    if (!quando || Number.isNaN(quando)) { problemas.push({ linha, campo: "data", mensagem: `data inválida "${pega(l, "data_bloqueio")}"; linha ignorada` }); return; }
    const sit = semAcento(pega(l, "situacao"));
    const levantamento = data(pega(l, "data_levantamento"));
    bloqueios.push({
      numero_cnj: num, valor, data_bloqueio: quando,
      situacao: sit.startsWith("levant") || sit.startsWith("liber") || (levantamento && !Number.isNaN(levantamento)) ? "Levantado" : "Ativo",
      data_levantamento: Number.isNaN(levantamento) ? null : levantamento,
      origem_id: `${num}|${quando}|${valor}`,
    });
  });
  return { ok: true, bloqueios, problemas, resumo: { linhas: bloqueios.length, ativos: bloqueios.filter((b) => b.situacao === "Ativo").length } };
}

export { cnj, data, dinheiro, importarBloqueios, importarProcessos, linhasDoHtml, mapearCabecalho, semAcento, COLUNAS_PROCESSOS };
