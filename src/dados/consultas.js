import { BLOQUEIOS_LISTA, CLIENTE_NOME, PROCESSOS_LISTA } from "./base";
import { HOJE, MESES } from "./formato";

/* ---------------------- Funções de consulta ------------------------ */
function normCliente(c) {
  if (!c) return null;
  const s = String(c).toLowerCase();
  return Object.keys(CLIENTE_NOME).find((k) => s.includes(k) || CLIENTE_NOME[k].toLowerCase().includes(s) || s.includes(CLIENTE_NOME[k].toLowerCase())) || null;
}

function consultarDados({ metrica, agrupar_por = "nenhum", cliente, area, status_bloqueio = "Ativo", dias_minimos_parado = 60 }) {
  const cli = normCliente(cliente);
  const areaOk = (x) => !area || x.area.toLowerCase() === String(area).toLowerCase();
  const cliOk = (x) => !cli || x.clienteId === cli;
  let linhas, valorDe, unidade;
  if (metrica === "valor_bloqueado" || metrica === "quantidade_bloqueios") {
    linhas = BLOQUEIOS_LISTA.filter((b) => cliOk(b) && areaOk(b) && (status_bloqueio === "todos" || b.status === status_bloqueio));
    valorDe = metrica === "valor_bloqueado" ? (b) => b.valorNum : () => 1;
    unidade = metrica === "valor_bloqueado" ? "BRL" : "quantidade";
  } else if (metrica === "quantidade_processos" || metrica === "processos_parados") {
    linhas = PROCESSOS_LISTA.filter((p) => cliOk(p) && areaOk(p) && (metrica !== "processos_parados" || p.diasParado >= Number(dias_minimos_parado)));
    valorDe = () => 1;
    unidade = "quantidade";
  } else {
    throw new Error("Métrica desconhecida. Use valor_bloqueado, quantidade_bloqueios, quantidade_processos ou processos_parados.");
  }
  const total = linhas.reduce((s, x) => s + valorDe(x), 0);
  let grupos = [];
  if (agrupar_por && agrupar_por !== "nenhum") {
    const chave = {
      cliente: (x) => x.cliente, area: (x) => x.area, contrato: (x) => x.contrato, status: (x) => x.status,
      mes: (x) => (x.mes !== undefined ? MESES[x.mes] : MESES[x.ultimaMov.getMonth()]),
    }[agrupar_por];
    if (!chave) throw new Error("agrupar_por inválido. Use nenhum, cliente, area, contrato, status ou mes.");
    const mapa = new Map();
    if (agrupar_por === "mes") for (let m = 0; m <= HOJE.getMonth(); m++) mapa.set(MESES[m], 0);
    for (const x of linhas) mapa.set(chave(x), (mapa.get(chave(x)) || 0) + valorDe(x));
    grupos = [...mapa].map(([rotulo, valor]) => ({ rotulo, valor }));
    if (agrupar_por !== "mes") grupos.sort((a, b) => b.valor - a.valor);
  }
  return { metrica, unidade, filtros: { cliente: cli ? CLIENTE_NOME[cli] : "todos", area: area || "todas", status_bloqueio }, total, grupos };
}

function listarProcessos({ cliente, area, dias_minimos_parado = 0, apenas_com_bloqueio_ativo = false, limite = 10 }) {
  const cli = normCliente(cliente);
  const ativo = (p) => BLOQUEIOS_LISTA.filter((b) => b.processoId === p.id && b.status === "Ativo").reduce((s, b) => s + b.valorNum, 0);
  return PROCESSOS_LISTA
    .filter((p) => (!cli || p.clienteId === cli) && (!area || p.area.toLowerCase() === String(area).toLowerCase()) && p.diasParado >= Number(dias_minimos_parado) && (!apenas_com_bloqueio_ativo || ativo(p) > 0))
    .sort((a, b) => b.diasParado - a.diasParado)
    .slice(0, Math.min(Number(limite) || 10, 25))
    .map((p) => ({ numero: p.numero, cliente: p.cliente, area: p.area, descricao: p.desc, status: p.status, dias_parado: p.diasParado, valor_bloqueado_ativo: ativo(p) }));
}

export { consultarDados, listarProcessos };
