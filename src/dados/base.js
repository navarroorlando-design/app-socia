import { HOJE, fmtBRL, fmtBRLCurto, fmtData, tempoRelativo } from "./formato";
import { T } from "../estilo/tokens";

/* ------------------------------------------------------------------ */
/* Dados de exemplo                                                    */
/* ------------------------------------------------------------------ */
const ORGS = {
  afne: {
    name: "AFNE", initials: "AF", processos: 47,
    bloqueado: "R$ 886.000", bloqueadoCurto: "R$ 886k",
    contratos: [
      { orgao: "Município de Nova Iguaçu", vigencia: "2023–2027" },
      { orgao: "Município de Niterói", vigencia: "2021–2025" },
    ],
    feed: [
      { text: "Bloqueio de R$ 18.400 foi levantado", time: "3 h", color: T.brass },
      { text: "Audiência trabalhista remarcada", time: "4 dias", color: T.slate },
    ],
  },
  gnosis: {
    name: "Instituto Gnosis", initials: "IG", processos: 91,
    bloqueado: "R$ 1.240.000", bloqueadoCurto: "R$ 1,24 mi",
    contratos: [{ orgao: "Município do Rio de Janeiro", vigencia: "2022–2026" }],
    feed: [{ text: "Decisão interlocutória publicada", time: "40 min", color: T.brass }],
  },
  fas: {
    name: "FAS", initials: "FA", processos: 91,
    bloqueado: "R$ 640.000", bloqueadoCurto: "R$ 640k",
    contratos: [{ orgao: "Estado do Rio de Janeiro", vigencia: "2020–2026" }],
    feed: [{ text: "Nova reclamação constitucional protocolada no STF", time: "ontem", color: T.brick }],
  },
  igedes: {
    name: "IGEDES", initials: "IGD", processos: 34,
    bloqueado: "R$ 210.000", bloqueadoCurto: "R$ 210k",
    contratos: [{ orgao: "Município de Niterói", vigencia: "2024–2028" }],
    feed: [{ text: "Processo administrativo movimentado", time: "2 dias", color: T.slate }],
  },
};

const ORG_ORDER = ["afne", "gnosis", "fas", "igedes"];

const OUTRAS_ORGS = [
  { name: "Instituto Vida Plena", processos: 12 },
  { name: "Associação Caminho Novo", processos: 8 },
  { name: "Centro Social Mãos Unidas", processos: 5 },
];

function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = rng(20261006);

const pick = (arr) => arr[Math.floor(rand() * arr.length)];

const between = (a, b) => a + Math.floor(rand() * (b - a + 1));

const CLIENTE_NOME = { afne: "AFNE", gnosis: "Instituto Gnosis", fas: "FAS", igedes: "IGEDES" };

const CONTRATOS = {
  afne: ["Município de Nova Iguaçu", "Município de Niterói"],
  gnosis: ["Município do Rio de Janeiro"],
  fas: ["Estado do Rio de Janeiro"],
  igedes: ["Município de Niterói"],
};

const PESO_CLIENTE = [["afne", 14], ["gnosis", 20], ["fas", 16], ["igedes", 8]];

const AREAS = {
  Trabalhista: ["Reclamação trabalhista: verbas rescisórias", "Reclamação trabalhista: horas extras", "Execução trabalhista em fase de liquidação", "Responsabilidade subsidiária do ente público"],
  Cível: ["Ação de cobrança de repasses em atraso", "Ação indenizatória", "Ação declaratória contra reajuste contratual"],
  Administrativo: ["Mandado de segurança", "Processo administrativo disciplinar", "Tomada de contas no Tribunal de Contas"],
  Constitucional: ["Reclamação constitucional no STF (ADPF 664)"],
};

const PESO_AREA = [["Trabalhista", 55], ["Cível", 22], ["Administrativo", 16], ["Constitucional", 7]];

const pesado = (pares) => { const tot = pares.reduce((s, p) => s + p[1], 0); let r = rand() * tot; for (const [k, w] of pares) { if ((r -= w) < 0) return k; } return pares[0][0]; };

const MOVS = {
  Trabalhista: ["Processo distribuído", "Audiência de conciliação realizada", "Sentença publicada", "Cálculos de liquidação apresentados", "Liquidação homologada", "Bloqueio via SISBAJUD determinado"],
  Cível: ["Petição inicial distribuída", "Contestação apresentada", "Despacho saneador", "Decisão interlocutória publicada"],
  Administrativo: ["Processo instaurado", "Defesa apresentada", "Parecer técnico juntado", "Aguardando julgamento"],
  Constitucional: ["Reclamação protocolada no STF", "Liminar apreciada", "Informações prestadas pela autoridade"],
};

function cnj(area) {
  const seg = area === "Trabalhista" ? "5.01" : area === "Constitucional" ? "1.00" : "8.19";
  return `${String(between(100000, 999999)).padStart(7, "0")}-${between(10, 99)}.${pick(["2022", "2023", "2024", "2025"])}.${seg}.${String(between(1, 299)).padStart(4, "0")}`;
}

function gerarProcesso(id, fixo = {}) {
  const cliente = fixo.clienteId || pesado(PESO_CLIENTE);
  const area = fixo.area || pesado(PESO_AREA);
  const desc = fixo.desc || pick(AREAS[area]);
  const diasParado = fixo.diasParado ?? (rand() < 0.22 ? between(61, 210) : between(0, 55));
  const ultima = new Date(HOJE.getTime() - diasParado * 86400000);
  const passos = MOVS[area];
  const n = Math.min(passos.length, between(2, passos.length));
  const movs = [];
  for (let i = n - 1, d = new Date(ultima); i >= 0; i--) {
    movs.push({ date: fmtData(d), text: passos[i] });
    d = new Date(d.getTime() - between(12, 50) * 86400000);
  }
  return {
    id, numero: cnj(area), clienteId: cliente, cliente: CLIENTE_NOME[cliente], area, desc,
    contrato: pick(CONTRATOS[cliente]),
    status: fixo.status || (diasParado > 60 ? pick(["Suspenso", "Aguardando decisão"]) : pick(["Em andamento", "Em andamento", "Aguardando decisão", "Em execução"])),
    diasParado, ultimaMov: ultima, lastUpdate: fixo.lastUpdate || tempoRelativo(ultima), movs,
  };
}

const PROCESSOS_LISTA = [
  gerarProcesso("p1", { clienteId: "afne", area: "Trabalhista", desc: "Execução trabalhista em fase de liquidação", status: "Em execução", diasParado: 0, lastUpdate: "3 h" }),
  gerarProcesso("p2", { clienteId: "gnosis", area: "Cível", desc: "Ação cível de cobrança", status: "Aguardando decisão", diasParado: 0, lastUpdate: "40 min" }),
  gerarProcesso("p3", { clienteId: "fas", area: "Administrativo", desc: "Mandado de segurança", status: "Em andamento", diasParado: 5 }),
  gerarProcesso("p4", { clienteId: "afne", area: "Cível", desc: "Ação declaratória contra reajuste contratual", status: "Em andamento", diasParado: 4 }),
  gerarProcesso("p5", { clienteId: "igedes", area: "Administrativo", desc: "Processo administrativo disciplinar", status: "Suspenso", diasParado: 2 }),
  gerarProcesso("p6", { clienteId: "gnosis", area: "Administrativo", desc: "Defesa em ação de improbidade administrativa", status: "Aguardando decisão", diasParado: 7 }),
  ...Array.from({ length: 52 }, (_, i) => gerarProcesso("p" + (i + 7))),
];

PROCESSOS_LISTA.sort((a, b) => a.diasParado - b.diasParado);

function gerarBloqueio(id, proc, fixo = {}) {
  const valorNum = fixo.valorNum ?? Math.round((proc.area === "Trabalhista" ? between(8, 120) : between(15, 260)) * 1000 + between(0, 9) * 100);
  const mes = fixo.mes ?? between(0, 9);
  const data = new Date(Math.min(new Date(2026, mes, between(1, 27)).getTime(), HOJE.getTime() - between(1, 5) * 86400000));
  const status = fixo.status || (rand() < 0.22 ? "Levantado" : "Ativo");
  const historico = [{ date: fmtData(data), text: "Bloqueio realizado via SISBAJUD" }];
  if (status === "Levantado") historico.unshift({ date: fmtData(new Date(Math.min(HOJE, data.getTime() + between(20, 90) * 86400000))), text: "Valor levantado por decisão judicial" });
  else if (rand() < 0.4) historico.unshift({ date: fmtData(new Date(Math.min(HOJE, data.getTime() + between(10, 40) * 86400000))), text: "Pedido de desbloqueio protocolado" });
  return {
    id, processoId: proc.id, clienteId: proc.clienteId, cliente: proc.cliente, contrato: proc.contrato, area: proc.area,
    valorNum, valor: fmtBRL(valorNum), data, mes, status, sistema: "SISBAJUD", historico,
  };
}

const porId = (id) => PROCESSOS_LISTA.find((p) => p.id === id);

const BLOQUEIOS_LISTA = [
  gerarBloqueio("b1", porId("p1"), { valorNum: 18400, mes: 7, status: "Levantado" }),
  gerarBloqueio("b2", porId("p2"), { valorNum: 240000, mes: 8, status: "Ativo" }),
  gerarBloqueio("b3", porId("p3"), { valorNum: 96000, mes: 7, status: "Ativo" }),
  gerarBloqueio("b4", porId("p4"), { valorNum: 62000, mes: 7, status: "Ativo" }),
  gerarBloqueio("b5", porId("p5"), { valorNum: 15000, mes: 8, status: "Ativo" }),
];

{
  const candidatos = PROCESSOS_LISTA.filter((p) => p.area !== "Constitucional" && !["p1", "p2", "p3", "p4", "p5"].includes(p.id));
  for (let i = 0; i < 34; i++) BLOQUEIOS_LISTA.push(gerarBloqueio("b" + (i + 6), candidatos[Math.floor(rand() * candidatos.length)]));
}

BLOQUEIOS_LISTA.sort((a, b) => b.data - a.data);

/* Totais derivados da base, usados nas telas fixas */
const TOTAIS = (() => {
  const ativo = BLOQUEIOS_LISTA.filter((b) => b.status === "Ativo");
  const porCliente = {};
  for (const k of Object.keys(CLIENTE_NOME)) {
    const v = ativo.filter((b) => b.clienteId === k).reduce((s, b) => s + b.valorNum, 0);
    porCliente[k] = { bloqueado: v, processos: PROCESSOS_LISTA.filter((p) => p.clienteId === k).length };
  }
  const porArea = Object.keys(AREAS).map((a) => [a, PROCESSOS_LISTA.filter((p) => p.area === a).length]);
  return {
    bloqueadoAtivo: ativo.reduce((s, b) => s + b.valorNum, 0),
    processos: PROCESSOS_LISTA.length,
    parados: PROCESSOS_LISTA.filter((p) => p.diasParado >= 60).length,
    porCliente, porArea,
  };
})();

for (const k of Object.keys(ORGS)) {
  ORGS[k].processos = TOTAIS.porCliente[k].processos;
  ORGS[k].bloqueado = fmtBRL(TOTAIS.porCliente[k].bloqueado);
  ORGS[k].bloqueadoCurto = fmtBRLCurto(TOTAIS.porCliente[k].bloqueado);
}

const RECLAMACOES_LISTA = [
  { cliente: "FAS", desc: "Reclamação constitucional no STF", status: "Em andamento" },
  { cliente: "Instituto Gnosis", desc: "Reclamação 80.150/RJ", status: "Em andamento" },
  { cliente: "AFNE", desc: "Reclamação constitucional (ADPF 664)", status: "Julgada" },
];

export { BLOQUEIOS_LISTA, CLIENTE_NOME, ORGS, ORG_ORDER, OUTRAS_ORGS, PROCESSOS_LISTA, RECLAMACOES_LISTA, TOTAIS };
