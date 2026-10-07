import { BLOQUEIOS_LISTA, CLIENTE_NOME, ENCERRADOS_2026, PROCESSOS_LISTA } from "./base";
import { HOJE, MESES } from "./formato";
import { ORDEM_PROGNOSTICO, historicoPassivo } from "./passivo";

/* ---------------------- Funções de consulta ------------------------ */
function normCliente(c) {
  if (!c) return null;
  const s = String(c).toLowerCase();
  return Object.keys(CLIENTE_NOME).find((k) => s.includes(k) || CLIENTE_NOME[k].toLowerCase().includes(s) || s.includes(CLIENTE_NOME[k].toLowerCase())) || null;
}

const CHAVES = {
  cliente: (x) => x.cliente, area: (x) => x.area, contrato: (x) => x.contrato, status: (x) => x.status, prognostico: (x) => x.prognostico,
  mes: (x) => (x.mes !== undefined ? MESES[x.mes] : MESES[x.ultimaMov.getMonth()]),
};
const mesDe = (x) => (x.mes !== undefined ? x.mes : x.ultimaMov.getMonth()) + 1;

/* Seleciona as linhas de uma métrica com os filtros pedidos. mes_inicio/mes_fim (1 a 12) filtram pelo
   mês do bloqueio ou, para processos, da última movimentação. */
function selecionar({ metrica, cliente, area, status_bloqueio = "Ativo", dias_minimos_parado = 60, prognostico, contrato, mes_inicio, mes_fim }) {
  const cli = normCliente(cliente);
  const ok = (x) => (!cli || x.clienteId === cli)
    && (!area || x.area.toLowerCase() === String(area).toLowerCase())
    && (!contrato || x.contrato.toLowerCase().includes(String(contrato).toLowerCase()))
    && (!mes_inicio || mesDe(x) >= Number(mes_inicio)) && (!mes_fim || mesDe(x) <= Number(mes_fim));
  if (metrica === "valor_bloqueado" || metrica === "quantidade_bloqueios") {
    return {
      linhas: BLOQUEIOS_LISTA.filter((b) => ok(b) && (status_bloqueio === "todos" || b.status === status_bloqueio)),
      valorDe: metrica === "valor_bloqueado" ? (b) => b.valorNum : () => 1,
      unidade: metrica === "valor_bloqueado" ? "BRL" : "quantidade", cli,
    };
  }
  if (metrica === "passivo_estimado") {
    return { linhas: PROCESSOS_LISTA.filter((p) => ok(p) && (!prognostico || p.prognostico.toLowerCase() === String(prognostico).toLowerCase())), valorDe: (p) => p.valorCausa, unidade: "BRL", cli };
  }
  if (metrica === "quantidade_processos" || metrica === "processos_parados") {
    return { linhas: PROCESSOS_LISTA.filter((p) => ok(p) && (metrica !== "processos_parados" || p.diasParado >= Number(dias_minimos_parado))), valorDe: () => 1, unidade: "quantidade", cli };
  }
  throw new Error("Métrica desconhecida. Use valor_bloqueado, quantidade_bloqueios, quantidade_processos, processos_parados ou passivo_estimado.");
}

function agrupar(linhas, valorDe, agrupar_por) {
  const chave = CHAVES[agrupar_por];
  if (!chave) throw new Error("agrupar_por inválido. Use nenhum, cliente, area, contrato, status, prognostico ou mes.");
  const mapa = new Map();
  if (agrupar_por === "mes") for (let m = 0; m <= HOJE.getMonth(); m++) mapa.set(MESES[m], 0);
  for (const x of linhas) mapa.set(chave(x), (mapa.get(chave(x)) || 0) + valorDe(x));
  const grupos = [...mapa].map(([rotulo, valor]) => ({ rotulo, valor }));
  if (agrupar_por !== "mes") grupos.sort((a, b) => b.valor - a.valor);
  return grupos;
}

/* Passivo por mês = evolução: o passivo no fim de cada mês de 2026 (não o mês da última movimentação).
   Inclui os processos encerrados no ano até o mês em que saíram. O filtro de prognóstico escolhe a parte
   da fotografia de cada mês (um processo pode ter mudado de prognóstico no ano). */
function evolucaoPassivo(params) {
  const { linhas, cli } = selecionar({ ...params, prognostico: undefined });
  const enc = ENCERRADOS_2026.filter((e) => (!cli || e.clienteId === cli)
    && (!params.area || e.area.toLowerCase() === String(params.area).toLowerCase())
    && (!params.contrato || e.contrato.toLowerCase().includes(String(params.contrato).toLowerCase())));
  const hist = historicoPassivo(linhas, enc);
  const parte = ORDEM_PROGNOSTICO.find((p) => params.prognostico && p.toLowerCase() === String(params.prognostico).toLowerCase()) || "total";
  return { hist, parte, cli };
}

function consultarDados(params) {
  const { metrica, agrupar_por = "nenhum", area, status_bloqueio = "Ativo" } = params;
  const { linhas, valorDe, unidade, cli } = selecionar(params);
  if (metrica === "passivo_estimado" && agrupar_por === "mes") {
    const { hist, parte } = evolucaoPassivo(params);
    return { metrica, unidade, observacao: "passivo no fim de cada mês (evolução)", filtros: { cliente: cli ? CLIENTE_NOME[cli] : "todos", area: area || "todas" },
             total: hist[hist.length - 1][parte], grupos: hist.map((h) => ({ rotulo: h.mes, valor: h[parte] })) };
  }
  const total = linhas.reduce((s, x) => s + valorDe(x), 0);
  const grupos = agrupar_por && agrupar_por !== "nenhum" ? agrupar(linhas, valorDe, agrupar_por) : [];
  return { metrica, unidade, filtros: { cliente: cli ? CLIENTE_NOME[cli] : "todos", area: area || "todas", status_bloqueio }, total, grupos };
}

/* Duas dimensões: para cada grupo de agrupar_por, o valor dividido por dividir_por (barras empilhadas). */
function consultarCruzado(params) {
  const { agrupar_por, dividir_por } = params;
  if (!agrupar_por || agrupar_por === "nenhum" || !dividir_por) throw new Error("Informe agrupar_por e dividir_por.");
  const { linhas, valorDe, unidade } = selecionar(params);
  if (params.metrica === "passivo_estimado" && agrupar_por === "mes" && dividir_por === "prognostico") {
    const { hist } = evolucaoPassivo(params);
    return { metrica: params.metrica, unidade, observacao: "passivo no fim de cada mês (evolução)", partes: ORDEM_PROGNOSTICO,
             grupos: hist.map((h) => ({ rotulo: h.mes, total: h.total, valores: ORDEM_PROGNOSTICO.map((p) => h[p]) })) };
  }
  const grupos = agrupar(linhas, valorDe, agrupar_por);
  const partes = dividir_por === "prognostico" ? ["Provável", "Possível", "Remoto"] : agrupar(linhas, valorDe, dividir_por).map((g) => g.rotulo);
  return {
    metrica: params.metrica, unidade, partes,
    grupos: grupos.map((g) => {
      const doGrupo = linhas.filter((x) => CHAVES[agrupar_por](x) === g.rotulo);
      return { rotulo: g.rotulo, total: g.valor, valores: partes.map((pt) => doGrupo.filter((x) => CHAVES[dividir_por](x) === pt).reduce((s, x) => s + valorDe(x), 0)) };
    }),
  };
}

function listarProcessos({ cliente, area, dias_minimos_parado = 0, apenas_com_bloqueio_ativo = false, limite = 10 }) {
  const cli = normCliente(cliente);
  const ativo = (p) => BLOQUEIOS_LISTA.filter((b) => b.processoId === p.id && b.status === "Ativo").reduce((s, b) => s + b.valorNum, 0);
  return PROCESSOS_LISTA
    .filter((p) => (!cli || p.clienteId === cli) && (!area || p.area.toLowerCase() === String(area).toLowerCase()) && p.diasParado >= Number(dias_minimos_parado) && (!apenas_com_bloqueio_ativo || ativo(p) > 0))
    .sort((a, b) => b.diasParado - a.diasParado)
    .slice(0, Math.min(Number(limite) || 10, 25))
    .map((p) => ({ numero: p.numero, cliente: p.cliente, contrato: p.contrato, area: p.area, descricao: p.desc, status: p.status, dias_parado: p.diasParado, valor_em_discussao: p.valorCausa, prognostico: p.prognostico, valor_bloqueado_ativo: ativo(p) }));
}

export { consultarCruzado, consultarDados, listarProcessos };
