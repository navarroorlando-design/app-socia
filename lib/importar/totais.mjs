/* ------------------------------------------------------------------ */
/* Totais reais do acervo (planilha "Processos ativos para as métricas */
/* do App dos Sócios", tirada do Legal One + controle de bloqueio).    */
/*                                                                      */
/* Só sai daqui o que é soma ou contagem por cliente, área e contrato: */
/* o repositório e o link do app são públicos, então número de         */
/* processo e nome de parte nunca entram no código. A aba Processos é  */
/* lida só para contar, por cliente, quantos ainda têm valor bloqueado. */
/* ------------------------------------------------------------------ */
import ExcelJS from "exceljs";

const CLIENTES = { afne: "afne", fas: "fas", gnosis: "gnosis", igedes: "igedes" };
const CNJ = /\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}/;

const chaveCliente = (nome) => CLIENTES[String(nome ?? "").trim().toLowerCase()] || null;
const num = (v) => (typeof v === "number" ? v : Number(v) || 0);
const centavos = (v) => Math.round(num(v) * 100) / 100;
const texto = (c) => {
  const v = c?.value;
  if (v && typeof v === "object") return v.result ?? v.text ?? (v.richText ? v.richText.map((t) => t.text).join("") : "");
  return v;
};

function linhas(ws) {
  const out = [];
  ws.eachRow({ includeEmpty: false }, (row, n) => { if (n > 1) out.push(row.values.slice(1).map((v) => texto({ value: v }))); });
  return out;
}

function aba(wb, nome) {
  const ws = wb.worksheets.find((w) => w.name.trim().toLowerCase() === nome.toLowerCase());
  if (!ws) throw new Error(`A planilha não tem a aba "${nome}".`);
  return ws;
}

const vazio = () => ({ bloqueado: 0, devolvido: 0, pago: 0 });
const somar = (a, b, d, p) => { a.bloqueado += num(b); a.devolvido += num(d); a.pago += num(p); };
const arredondar = (a) => ({ bloqueado: centavos(a.bloqueado), devolvido: centavos(a.devolvido), pago: centavos(a.pago) });

async function lerTotais(arquivo) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(arquivo);

  const notas = linhas(aba(wb, "Como ler")).flat().filter(Boolean).map(String).join(" ");
  const referencia = notas.match(/acervo em (\d{2}\/\d{2}\/\d{4})/)?.[1];
  if (!referencia) throw new Error("Não achei a data de posição do acervo na aba \"Como ler\".");

  const clientes = {};
  const cliente = (id) => (clientes[id] ??= { processos: 0, porArea: {}, ativo: vazio(), semProcessoAtivo: vazio(), comValor: 0, comValorSemProcessoAtivo: 0, contratos: [] });

  // Métricas: cliente × área (todos os contratos)
  for (const [nome, area, , processos, b, d, p] of linhas(aba(wb, "Métricas"))) {
    const id = chaveCliente(nome);
    if (!id || !area || typeof processos !== "number") continue;
    const c = cliente(id);
    c.processos += processos;
    c.porArea[area] = (c.porArea[area] || 0) + processos;
    somar(c.ativo, b, d, p);
  }
  if (!Object.keys(clientes).length) throw new Error("A aba \"Métricas\" não tem nenhuma linha de cliente reconhecida.");

  // Por contrato: cliente × área × contrato
  for (const [nome, area, contrato, processos, b, d, p] of linhas(aba(wb, "Por contrato"))) {
    const id = chaveCliente(nome);
    if (!id || !contrato || typeof processos !== "number") continue;
    const lista = cliente(id).contratos;
    let k = lista.find((x) => x.nome === String(contrato).trim());
    if (!k) { k = { nome: String(contrato).trim(), processos: 0, porArea: {}, ...vazio() }; lista.push(k); }
    k.processos += processos;
    k.porArea[area] = (k.porArea[area] || 0) + processos;
    somar(k, b, d, p);
  }

  // Processos: só a contagem, por cliente, dos que ainda têm valor bloqueado
  const hp = aba(wb, "Processos").getRow(1).values.slice(1).map((v) => String(texto({ value: v }) || "").trim());
  const iCli = hp.indexOf("Cliente"), iBloq = hp.findIndex((h) => /^ainda bloqueado/i.test(h));
  if (iCli < 0 || iBloq < 0) throw new Error("A aba \"Processos\" não tem as colunas Cliente e Ainda bloqueado.");
  for (const r of linhas(aba(wb, "Processos"))) {
    const id = chaveCliente(r[iCli]);
    if (id && num(r[iBloq]) > 0) cliente(id).comValor += 1;
  }

  // Bloqueios ligados a processos que já saíram do acervo ativo: soma por origem
  const semCliente = vazio();
  for (const [, origem, b, d, p] of linhas(aba(wb, "Bloqueios sem processo ativo"))) {
    if (!origem) continue;
    const id = Object.keys(CLIENTES).find((k) => new RegExp(`\\b${k}\\b`).test(String(origem).toLowerCase()));
    if (id) {
      const c = cliente(id);
      somar(c.semProcessoAtivo, b, d, p);
      if (num(b) > 0) c.comValorSemProcessoAtivo += 1;
    } else somar(semCliente, b, d, p);
  }

  for (const c of Object.values(clientes)) {
    c.ativo = arredondar(c.ativo);
    c.semProcessoAtivo = arredondar(c.semProcessoAtivo);
    c.contratos = c.contratos
      .map((k) => ({ ...k, ...arredondar(k) }))
      .sort((a, b) => b.processos - a.processos || a.nome.localeCompare(b.nome, "pt-BR"));
  }
  return { referencia, clientes, semProcessoAtivoSemCliente: arredondar(semCliente) };
}

function gerarModulo(totais, origem) {
  const corpo = JSON.stringify(totais, null, 2);
  if (CNJ.test(corpo)) throw new Error("Os totais trazem um número de processo: nada foi gravado.");
  return `/* Gerado por scripts/totais.mjs a partir de ${origem} (não editar à mão).
   Só totais por cliente, área e contrato: o repositório e o link do app são públicos,
   então número de processo e nome de parte nunca entram aqui. */
const TOTAIS_REAIS = ${corpo};

export { TOTAIS_REAIS };
`;
}

export { gerarModulo, lerTotais };
