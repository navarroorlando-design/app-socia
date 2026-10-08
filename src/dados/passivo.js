import { BLOQUEIOS_LISTA, ENCERRADOS_2026, ORGS, PROCESSOS_LISTA } from "./base";
import { HOJE, MESES } from "./formato";

/* ------------------------------------------------------------------ */
/* Passivo por contrato de gestão                                      */
/* Passivo estimado = soma do valor em discussão dos processos ligados */
/* ao contrato, separada pelo prognóstico. Bloqueios entram à parte,   */
/* como o valor já retirado da conta.                                  */
/* ------------------------------------------------------------------ */
const ORDEM_PROGNOSTICO = ["Provável", "Possível", "Remoto"];

function somaPassivo(processos) {
  const r = { total: 0, Provável: 0, Possível: 0, Remoto: 0 };
  for (const p of processos) { r.total += p.valorCausa; r[p.prognostico] += p.valorCausa; }
  return r;
}

function statusVigencia(vigencia) {
  const fim = Number(String(vigencia).split("–")[1]);
  // Cores do redesenho v3 (seção B.6): Vigente em azul, Vence este ano em âmbar, Encerrado em
  // cinza — antes "encerrada" também caía em âmbar, confundindo com "vence este ano".
  if (fim < 2026) return { id: "inativo", texto: `Vigência encerrada em ${fim}` };
  if (fim === 2026) return { id: "atencao", texto: "Vence este ano" };
  return { id: "curso", texto: "Vigente" };
}

function resumoContrato(orgId, orgao) {
  const c = ORGS[orgId].contratos.find((x) => x.orgao === orgao);
  const processos = PROCESSOS_LISTA.filter((p) => p.clienteId === orgId && p.contrato === orgao);
  const bloqueios = BLOQUEIOS_LISTA.filter((b) => b.clienteId === orgId && b.contrato === orgao);
  const ativos = bloqueios.filter((b) => b.status === "Ativo");
  return {
    orgId, orgao, vigencia: c.vigencia, vigenciaStatus: statusVigencia(c.vigencia),
    processos, bloqueios,
    passivo: somaPassivo(processos),
    bloqueadoAtivo: ativos.reduce((s, b) => s + b.valorNum, 0),
    bloqueiosAtivos: ativos.length,
    levantado: bloqueios.filter((b) => b.status === "Levantado").reduce((s, b) => s + b.valorNum, 0),
  };
}

function resumoOrg(orgId) {
  const contratos = ORGS[orgId].contratos.map((c) => resumoContrato(orgId, c.orgao)).sort((a, b) => b.passivo.total - a.passivo.total);
  const processos = PROCESSOS_LISTA.filter((p) => p.clienteId === orgId);
  const bloqueios = BLOQUEIOS_LISTA.filter((b) => b.clienteId === orgId);
  const ativos = bloqueios.filter((b) => b.status === "Ativo");
  return {
    contratos, processos, bloqueios,
    passivo: somaPassivo(processos),
    bloqueadoAtivo: ativos.reduce((s, b) => s + b.valorNum, 0),
    bloqueiosAtivos: ativos.length,
    levantado: bloqueios.filter((b) => b.status === "Levantado").reduce((s, b) => s + b.valorNum, 0),
  };
}

/* Evolução do passivo: a "fotografia" no fim de cada mês de 2026, até o mês atual.
   Em produção, essas fotografias são gravadas a cada importação (tabela passivo_mensal),
   porque o relatório do Legal One só traz o valor de hoje. O último mês é igual ao passivo atual. */
function historicoPassivo(processos, encerrados = []) {
  const meses = [];
  for (let m = 0; m <= HOJE.getMonth(); m++) {
    const r = { mes: MESES[m], total: 0, Provável: 0, Possível: 0, Remoto: 0 };
    const somar = (valor, prog) => { r.total += valor; r[prog] += valor; };
    for (const p of processos) {
      if (p.entradaMes > m) continue;
      const prog = p.prognosticoAntes && m < p.prognosticoAntes.mes ? p.prognosticoAntes.era : p.prognostico;
      const valor = p.valorAntes && m < p.valorAntes.mes ? p.valorAntes.era : p.valorCausa;
      somar(valor, prog);
    }
    for (const e of encerrados) if (e.entradaMes <= m && m < e.saiuMes) somar(e.valorCausa, e.prognostico);
    meses.push(r);
  }
  return meses;
}

/* O que explica a diferença entre janeiro e hoje, para a frase de leitura do gráfico. */
function motivosVariacao(processos, encerrados = []) {
  const ate = HOJE.getMonth();
  const novos = processos.filter((p) => p.entradaMes > 0);
  const saidas = encerrados.filter((e) => e.saiuMes <= ate);
  const reclass = processos.filter((p) => p.prognosticoAntes && p.prognosticoAntes.mes > 0);
  const atualiz = processos.filter((p) => p.valorAntes && p.valorAntes.mes > 0);
  const soma = (xs, f = (x) => x.valorCausa) => xs.reduce((s, x) => s + f(x), 0);
  return {
    novos: { n: novos.length, valor: soma(novos) },
    saidas: { n: saidas.length, valor: soma(saidas), lista: saidas },
    reclassificados: { n: reclass.length, paraProvavel: reclass.filter((p) => p.prognostico === "Provável").length },
    atualizados: { n: atualiz.length, valor: soma(atualiz, (p) => p.valorCausa - p.valorAntes.era) },
  };
}

const encerradosDe = (orgId, orgao) => ENCERRADOS_2026.filter((e) => e.clienteId === orgId && (!orgao || e.contrato === orgao));

export { ORDEM_PROGNOSTICO, encerradosDe, historicoPassivo, motivosVariacao, resumoContrato, resumoOrg, somaPassivo, statusVigencia };
