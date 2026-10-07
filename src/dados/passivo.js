import { BLOQUEIOS_LISTA, ORGS, PROCESSOS_LISTA } from "./base";

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
  if (fim < 2026) return { id: "atencao", texto: `Vigência encerrada em ${fim}` };
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

export { ORDEM_PROGNOSTICO, resumoContrato, resumoOrg, somaPassivo, statusVigencia };
