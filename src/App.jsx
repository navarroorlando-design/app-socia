import React, { useState, useEffect } from "react";

/* ------------------------------------------------------------------ */
/* Tokens visuais compartilhados por todas as telas                    */
/* ------------------------------------------------------------------ */
const T = {
  ink: "#111827",
  paper: "#F2F3F7",
  brass: "#765614",
  slate: "#245476",
  hairline: "#E3E5EA",
  muted: "#4B5563",
  brick: "#9B2A1C",
};

const GlobalStyle = () => (
  <style>{`
    .font-serif-legal{ font-family:'Lexend', -apple-system, sans-serif; font-weight:600; letter-spacing:-0.015em; }
    .font-sans-ui{ font-family:'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .no-scrollbar::-webkit-scrollbar{ display:none; }
    .app-stage{ min-height:100vh; width:100%; display:flex; align-items:center; justify-content:center; padding:40px 16px; background:#C7C9C3; }
    .app-phone{ width:390px; height:844px; border-radius:3rem; box-shadow:0 25px 50px -12px rgba(0,0,0,.25); }
    @media (max-width: 480px){
      .app-stage{ padding:0; min-height:0; height:100vh; height:100dvh; }
      .app-phone{ width:100%; height:100%; border-radius:0; box-shadow:none; }
      .app-island{ display:none; }
    }
    :focus-visible{ outline:2px solid #111827; outline-offset:2px; }
    .guia-btn:active:not(:disabled){ transform: scale(.97); }
    .guia-btn:disabled{ cursor:not-allowed; }
    .guia-spin{ width:16px; height:16px; border-radius:50%; border:2px solid; animation: gspin .8s linear infinite; }
    @keyframes gspin{ to{ transform: rotate(360deg); } }
    .guia-skel{ border-radius:8px; background: linear-gradient(90deg, #E8EAEF 0%, #F5F6F9 50%, #E8EAEF 100%); background-size: 200% 100%; animation: gshim 1.3s ease-in-out infinite; }
    @keyframes gshim{ from{ background-position: 200% 0; } to{ background-position: -200% 0; } }
    .guia-toast{ animation: gup .22s ease-out; }
    .guia-sheet{ animation: gsheet .26s cubic-bezier(.2,.8,.2,1); }
    @keyframes gup{ from{ opacity:0; transform: translateY(8px); } to{ opacity:1; transform:none; } }
    @keyframes gsheet{ from{ transform: translateY(100%); } to{ transform:none; } }
    @media (prefers-reduced-motion: reduce){ .guia-spin,.guia-skel,.guia-toast,.guia-sheet{ animation:none !important; } .guia-btn{ transition:none !important; } }
  `}</style>
);

/* ------------------------------------------------------------------ */
/* Ícones                                                              */
/* ------------------------------------------------------------------ */
const Icon = ({ children, size = 20, color = T.ink, strokeWidth = 1.7 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
       strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const BackIcon = (p) => <Icon {...p}><path d="M19 12H5M12 19l-7-7 7-7" /></Icon>;
const ChevronIcon = (p) => <Icon {...p}><path d="M9 6l6 6-6 6" /></Icon>;
const HouseIcon = (p) => <Icon {...p}><path d="M4 11.5 12 4l8 7.5" /><path d="M6 10v9a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-9" /></Icon>;
const SparkleIcon = (p) => <Icon {...p}><path d="M12 2 13.5 9 21 12 13.5 15 12 22 10.5 15 3 12 10.5 9Z" /></Icon>;
const BuildingIcon = (p) => <Icon {...p}><rect x="5" y="3" width="14" height="18" rx="1" /><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" /><path d="M9 21v-3h6v3" /></Icon>;
const PersonIcon = (p) => <Icon {...p}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-4 3-6 7-6s7 2 7 6" /></Icon>;
const FolderIcon = (p) => <Icon {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" /></Icon>;
const LockIcon = (p) => <Icon {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></Icon>;
const FlagIcon = (p) => <Icon {...p}><path d="M5 3v18" /><path d="M5 4h11l-2 4 2 4H5" /></Icon>;
const SendIcon = ({ color = T.brass, size = 17 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M3 11l18-8-8 18-2-8-8-2Z" /></svg>
);
const PinIcon = (p) => <Icon {...p}><path d="M12 17v5M8 13l4-9 4 9M5 13h14l-1.5 3h-11Z" /></Icon>;
const CheckIcon = (p) => <Icon {...p}><path d="M5 12l5 5 9-11" /></Icon>;
const StarIcon = ({ filled, size = 18, color = T.brass }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={color}
       strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6Z" />
  </svg>
);

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

/* ------------------------------------------------------------------ */
/* Base de exemplo (gerada de forma determinística)                    */
/* Em produção isso viria da camada de métricas (Legal One + Log de    */
/* Bloqueios). A IA nunca calcula números sozinha: ela chama as        */
/* funções de consulta abaixo e só monta a apresentação.               */
/* ------------------------------------------------------------------ */
const HOJE = new Date(2026, 9, 6);
const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

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

const fmtBRL = (n) => "R$ " + Math.round(n).toLocaleString("pt-BR");
const fmtBRLCurto = (n) => (n >= 1e6 ? "R$ " + (n / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + " mi" : "R$ " + Math.round(n / 1000).toLocaleString("pt-BR") + " mil");
const fmtData = (d) => d.toLocaleDateString("pt-BR");
const diasEntre = (a, b) => Math.round((b - a) / 86400000);
function tempoRelativo(d) {
  const dias = diasEntre(d, HOJE);
  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  if (dias < 7) return `${dias} dias`;
  if (dias < 30) return `${Math.round(dias / 7)} sem`;
  return `${Math.round(dias / 30)} meses`;
}

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

const STATUS_SEM_ID = {
  "Em andamento": "curso", "Em execução": "curso", "Aguardando decisão": "atencao", "Suspenso": "inativo",
  "Julgada": "resolvido", "Levantado": "resolvido", "Ativo": "risco",
};
const semDe = (status) => SEMANTICA.find((x) => x.id === (STATUS_SEM_ID[status] || "inativo"));

const CARD = { background: "#FFFFFF", borderRadius: 18, boxShadow: "0 1px 2px rgba(22,32,43,.06), 0 4px 14px rgba(22,32,43,.05)" };
const LINK = { color: "#111827", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 4 };

/* ------------------------------------------------------------------ */
/* Peças reutilizáveis                                                 */
/* ------------------------------------------------------------------ */
function StatusBar({ tom }) {
  const t = tom && TONS[tom];
  return (
    <div className="flex items-center justify-between px-8 pt-4 pb-1 text-[15px] shrink-0 relative z-20"
         style={t ? { background: t.a, color: "#FFFFFF" } : { color: S.ink }}>
      <span className="font-medium">9:41</span>
      <div className="flex items-center gap-1.5">
        <svg width="17" height="11" viewBox="0 0 18 11" fill="none">
          <rect x="0" y="6" width="3" height="5" rx="0.5" fill="currentColor" />
          <rect x="5" y="4" width="3" height="7" rx="0.5" fill="currentColor" />
          <rect x="10" y="2" width="3" height="9" rx="0.5" fill="currentColor" />
          <rect x="15" y="0" width="3" height="11" rx="0.5" fill="currentColor" />
        </svg>
        <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" />
          <rect x="2" y="2" width="15" height="8" rx="1.5" fill="currentColor" />
          <rect x="22" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}

function BackHeader({ label, onBack }) {
  return (
    <div className="flex items-center px-6 pt-3 pb-1 shrink-0">
      <button onClick={onBack} aria-label={`Voltar para ${label}`} className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "#FFFFFF" }}>
        <BackIcon size={18} color={S.ink} />
      </button>
      <span className="ml-3" style={{ fontFamily: F.ui, fontSize: 16, color: S.texto2 }}>{label}</span>
    </div>
  );
}

function IconBtn({ label, onClick, children }) {
  return (
    <button onClick={onClick} aria-label={label} className="w-11 h-11 rounded-full flex items-center justify-center relative" style={{ background: "#FFFFFF" }}>
      {children}
    </button>
  );
}

function SecLabel({ children, acao, onAcao, primeiro }) {
  return (
    <div className="flex items-baseline justify-between gap-3" style={{ margin: `${primeiro ? 8 : 32}px 0 10px` }}>
      <h2 style={{ fontFamily: F.ui, fontSize: 18, fontWeight: 600, color: S.ink, letterSpacing: "-0.01em" }}>{children}</h2>
      {acao && (onAcao
        ? <button onClick={onAcao} style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 500, color: S.ink, textDecoration: "underline", textUnderlineOffset: 4, flexShrink: 0 }}>{acao}</button>
        : <span style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2, flexShrink: 0 }}>{acao}</span>)}
    </div>
  );
}

function CardRow({ icon, label, value, onClick, last }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 w-full text-left" style={{ padding: "12px 16px", borderBottom: last ? "none" : `1px solid ${S.linha}` }}>
      <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#EEF1F6" }}>{icon}</span>
      <span style={{ fontFamily: F.ui, fontSize: 17, color: S.ink, flex: 1 }}>{label}</span>
      {value && <span style={{ fontFamily: F.ui, fontSize: 16, color: S.texto2, fontVariantNumeric: "tabular-nums" }}>{value}</span>}
      <ChevronIcon size={16} color={S.texto2} strokeWidth={2} />
    </button>
  );
}

function TabBar({ active, onChange }) {
  const items = [
    { id: "inicio", label: "Início", Icon: HouseIcon },
    { id: "ia", label: "IA", Icon: SparkleIcon },
    { id: "os", label: "OS", Icon: BuildingIcon },
    { id: "perfil", label: "Perfil", Icon: PersonIcon },
  ];
  return (
    <nav className="absolute bottom-0 left-0 right-0 px-3 pt-2 pb-7" style={{ background: "#FFFFFF", borderTop: `1px solid ${S.linha}` }}>
      <div className="flex items-center justify-between">
        {items.map(({ id, label, Icon: I }) => {
          const isActive = active === id;
          return (
            <button key={id} onClick={() => onChange(id)} aria-current={isActive ? "page" : undefined}
                    className="flex flex-col items-center gap-1 rounded-2xl" style={{ width: 76, padding: "6px 0", background: isActive ? "#E8EAF0" : "transparent" }}>
              <I size={23} color={isActive ? (id === "ia" ? S.iaIcone : S.ink) : S.texto2} strokeWidth={isActive ? 2 : 1.7} />
              <span style={{ fontFamily: F.ui, fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? S.ink : S.texto2 }}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function Row({ icon, label, value, onClick, last }) {
  return <CardRow icon={icon} label={label} value={value} onClick={onClick} last={last} />;
}

function Badge({ text, sobreCor }) {
  return <Etiqueta s={semDe(text)} texto={text} sobreCor={sobreCor} />;
}


/* ------------------------------------------------------------------ */
/* Faixa do topo: título ancorado numa faixa de cor                    */
/* ------------------------------------------------------------------ */
const TONS = {
  marinho:   { a: "#1E3A5F", b: "#14243A", sub: "#D3DCE8" },
  risco:     { a: "#8E2618", b: "#6A1C12", sub: "#F6D9D3" },
  resolvido: { a: "#1F5A3A", b: "#16422B", sub: "#D3EBDD" },
  atencao:   { a: "#7A4A00", b: "#5C3800", sub: "#F6E3C2" },
  curso:     { a: "#22506F", b: "#183A52", sub: "#D3E3EF" },
  inativo:   { a: "#4F565B", b: "#3B4044", sub: "#E3E6E8" },
};
const tomDeStatus = (status) => STATUS_SEM_ID[status] || "inativo";

function InfoLinha({ icone, fundo, rotulo, valor, last }) {
  return (
    <div className="flex items-center gap-3" style={{ padding: "14px 16px", borderBottom: last ? "none" : `1px solid ${S.linha}` }}>
      <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: fundo }}>{icone}</span>
      <div className="min-w-0">
        <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2 }}>{rotulo}</p>
        <p style={{ fontFamily: F.ui, fontSize: 17, fontWeight: 600, color: S.ink }}>{valor}</p>
      </div>
    </div>
  );
}

function Faixa({ tom, bleed = 24, onBack, backLabel, eyebrow, titulo, tituloCompacto, tituloSize = 34, sub, direita, aside, children }) {
  const ref = React.useRef(null);
  const [compacto, setCompacto] = useState(false);
  useEffect(() => {
    const el = ref.current && ref.current.parentElement;
    if (!el) return undefined;
    const on = () => setCompacto(el.scrollTop > 70);
    el.addEventListener("scroll", on, { passive: true });
    on();
    return () => el.removeEventListener("scroll", on);
  }, []);
  const detalhe = !!tom;
  const tituloTexto = tituloCompacto || (typeof titulo === "string" ? titulo : "");
  return (
    <>
      {/* barra fina que aparece ao rolar */}
      <div ref={ref} aria-hidden={!compacto}
           style={{ position: "sticky", top: 0, zIndex: 30, margin: `0 -${bleed}px -56px`, height: 56, padding: `0 ${Math.max(bleed - 10, 12)}px`,
                    display: "flex", alignItems: "center", gap: 6, background: "rgba(242,243,247,.88)", backdropFilter: "saturate(1.6) blur(14px)", WebkitBackdropFilter: "saturate(1.6) blur(14px)",
                    borderBottom: `1px solid ${compacto ? S.linha : "transparent"}`, opacity: compacto ? 1 : 0, pointerEvents: compacto ? "auto" : "none", transition: "opacity .18s ease" }}>
        {onBack && (
          <button onClick={onBack} tabIndex={compacto ? 0 : -1} aria-label={`Voltar para ${backLabel}`} className="w-11 h-11 rounded-full flex items-center justify-center shrink-0">
            <BackIcon size={21} color={S.ink} />
          </button>
        )}
        <p style={{ flex: 1, textAlign: onBack ? "center" : "left", paddingRight: onBack ? 44 : 0, paddingLeft: onBack ? 0 : 10, fontFamily: F.ui, fontSize: 17, fontWeight: 600, color: S.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tituloTexto}</p>
      </div>

      {/* cabeçalho grande */}
      <div style={{ paddingTop: 6 }}>
        {(onBack || (!detalhe && direita)) && (
          <div className="flex items-center justify-between gap-3" style={{ marginBottom: 14 }}>
            {onBack ? (
              <button onClick={onBack} aria-label={`Voltar para ${backLabel}`} className="flex items-center gap-2.5 min-w-0">
                <span className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(17,24,39,.08)" }}>
                  <BackIcon size={18} color={S.ink} />
                </span>
                <span style={{ fontFamily: F.ui, fontSize: 16, color: S.texto2 }}>{backLabel}</span>
              </button>
            ) : <span />}
            {!detalhe && direita}
          </div>
        )}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {eyebrow && <p style={{ fontFamily: F.ui, fontSize: 16, color: S.texto2, lineHeight: 1.35 }}>{eyebrow}</p>}
            <h1 style={{ fontFamily: F.display, fontSize: tituloSize, fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.025em", color: S.ink, marginTop: eyebrow ? 4 : 0, textWrap: "balance" }}>{titulo}</h1>
            {detalhe && direita && <div style={{ marginTop: 12 }}>{direita}</div>}
            {sub && <div style={{ fontFamily: F.ui, fontSize: 16, color: S.texto2, marginTop: 8, lineHeight: 1.4 }}>{sub}</div>}
          </div>
          {aside}
        </div>
      </div>
      {children ? <div style={{ marginTop: 18 }}>{children}</div> : <div style={{ height: 8 }} />}
    </>
  );
}

function KPIs({ itens }) {
  return (
    <div className="flex" style={{ ...CARD, padding: "14px 6px" }}>
      {itens.map(([rotulo, valor], i) => (
        <div key={rotulo} className="flex-1 text-center min-w-0" style={{ borderLeft: i ? `1px solid ${S.linha}` : "none", padding: "0 6px" }}>
          <p style={{ fontFamily: F.ui, fontSize: 13, color: S.texto2 }}>{rotulo}</p>
          <p style={{ fontFamily: F.ui, fontSize: 17, fontWeight: 600, color: S.ink, marginTop: 2, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{valor}</p>
        </div>
      ))}
    </div>
  );
}


/* ------------------------------------------------------------------ */
/* Telas: Início                                                       */
/* ------------------------------------------------------------------ */
function InicioFeed({ onOpenList, onOpenOrg, followedItems, onOpenProcesso, onOpenAcompanhando, onOpenBusca, onOpenMenu, onPerguntar, unreadCount, foto, apelido }) {
  const preview = followedItems.slice(0, 3);
  const parados90 = PROCESSOS_LISTA.filter((p) => p.diasParado >= 90).length;
  const sem = (id) => SEMANTICA.find((x) => x.id === id);
  const agora = new Date();
  const hora = agora.getHours();
  const saudacao = hora < 12 ? "Bom dia," : hora < 18 ? "Boa tarde," : "Boa noite,";
  const data = agora.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const novidades = 5;

  const Atalho = ({ icone, rotulo, onClick, ia }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-2 flex-1 min-w-0">
      <span className="flex items-center justify-center" style={{ width: 60, height: 60, borderRadius: 18, background: ia ? S.iaFundo : "#FFFFFF", boxShadow: ia ? "none" : "0 1px 3px rgba(17,24,39,.08)" }}>{icone}</span>
      <span style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 500, color: S.ink }}>{rotulo}</span>
    </button>
  );

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-6" style={{ paddingBottom: 120 }}>
      {/* saudação em duas linhas + VA */}
      <div className="flex items-center justify-between gap-3" style={{ paddingTop: 10 }}>
        <div className="min-w-0">
          <p style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2 }}>{data.charAt(0).toUpperCase() + data.slice(1)}</p>
          <p style={{ fontFamily: F.ui, fontSize: 17, color: S.texto2, marginTop: 6 }}>{saudacao}</p>
          <p style={{ fontFamily: F.ui, fontSize: 26, fontWeight: 600, color: S.ink, letterSpacing: "-0.02em", lineHeight: 1.15 }}>{apelido || "Sócia"}</p>
        </div>
        <button onClick={onOpenMenu} aria-label={`Menu da conta${unreadCount ? `, ${unreadCount} notificações novas` : ""}`} className="rounded-full shrink-0">
          <Avatar foto={foto} size={54} badge={unreadCount} />
        </button>
      </div>

      {/* cartão-resumo do dia */}
      <div className="mt-5" style={{ ...CARD, padding: 20 }}>
        <p style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2 }}>Bloqueado hoje, todos os clientes</p>
        <p style={{ fontFamily: F.ui, fontSize: 36, fontWeight: 600, color: S.ink, letterSpacing: "-0.03em", lineHeight: 1.1, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{fmtBRL(TOTAIS.bloqueadoAtivo)}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {parados90 > 0 && (
            <button onClick={() => onOpenList("processos")} aria-label={`${parados90} processos parados há mais de 90 dias, ver lista`}>
              <Etiqueta s={sem("risco")} texto={`${parados90} parados há 90 dias`} />
            </button>
          )}
          <button onClick={onOpenAcompanhando} aria-label={`${followedItems.length} processos acompanhados`}>
            <Etiqueta s={sem("curso")} texto={`${followedItems.length} que você segue`} />
          </button>
        </div>
      </div>

      {/* atalhos */}
      <div className="flex gap-2 mt-5">
        <Atalho rotulo="Buscar" onClick={onOpenBusca} icone={<SearchIcon size={24} color={S.ink} />} />
        <Atalho rotulo="Sigo" onClick={onOpenAcompanhando} icone={<StarIcon size={23} color={S.ink} />} />
        <Atalho rotulo="Bloqueios" onClick={() => onOpenList("bloqueios")} icone={<LockIcon size={24} color={S.ink} />} />
        <Atalho rotulo="Perguntar" onClick={onPerguntar} ia icone={<SparkleIcon size={24} color={S.ia} strokeWidth={1.9} />} />
      </div>

      {preview.length > 0 && (
        <>
          <SecLabel acao="Ver todos" onAcao={onOpenAcompanhando}>Processos que você segue</SecLabel>
          <div style={CARD}>
            {preview.map((item, i) => (
              <button key={item.id} onClick={() => onOpenProcesso(item, "feed")} className="w-full text-left flex items-center gap-3"
                      style={{ padding: "14px 16px", borderTop: i ? `1px solid ${S.linha}` : "none" }}>
                <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: semDe(item.status).fundo }}>
                  <FolderIcon size={18} color={semDe(item.status).cor} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink }}>{item.cliente}</p>
                    <span style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, flexShrink: 0 }}>{item.lastUpdate}</span>
                  </div>
                  <p style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2, marginTop: 2, lineHeight: 1.35 }}>{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      <SecLabel acao={`${novidades} novidades`} onAcao={undefined}>Hoje no escritório</SecLabel>
      <div style={CARD}>
        <FeedItem cliente="Instituto Gnosis" text="Decisão interlocutória publicada na ação cível de cobrança" time="40 min" sem={sem("curso")} tag="Movimentação" onClick={() => onOpenOrg("gnosis")} />
        <FeedItem cliente="AFNE" text="Bloqueio de R$ 18.400 foi levantado" time="3 h" sem={sem("resolvido")} tag="Levantado" onClick={() => onOpenOrg("afne")} />
        <FeedItem cliente="FAS" text="Nova reclamação constitucional protocolada no STF" time="ontem" sem={sem("atencao")} tag="Reclamação" onClick={() => onOpenOrg("fas")} />
        <FeedItem cliente="IGEDES" text="Processo administrativo movimentado" time="2 dias" sem={sem("curso")} tag="Movimentação" onClick={() => onOpenOrg("igedes")} />
        <FeedItem cliente="AFNE" text="Audiência trabalhista remarcada" time="4 dias" sem={sem("atencao")} tag="Remarcação" onClick={() => onOpenOrg("afne")} last />
      </div>

      <SecLabel>Navegar por tipo</SecLabel>
      <div style={CARD}>
        <CardRow icon={<FolderIcon size={20} color={S.ink} />} label="Processos" value={TOTAIS.processos.toLocaleString("pt-BR")} onClick={() => onOpenList("processos")} />
        <CardRow icon={<LockIcon size={20} color={S.ink} />} label="Bloqueios ativos" value={fmtBRLCurto(TOTAIS.bloqueadoAtivo)} onClick={() => onOpenList("bloqueios")} />
        <CardRow icon={<FlagIcon size={20} color={S.ink} />} label="Reclamações" value="3" onClick={() => onOpenList("reclamacoes")} last />
      </div>
    </div>
  );
}

function FeedItem({ cliente, text, time, sem, tag, onClick, last }) {
  return (
    <button onClick={onClick} className="w-full text-left" style={{ padding: "14px 18px", borderBottom: last ? "none" : `1px solid ${S.linha}` }}>
      <div className="flex items-center justify-between gap-3">
        <Etiqueta s={sem} texto={tag} />
        <span style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2 }}>{time}</span>
      </div>
      <p style={{ fontFamily: F.ui, fontSize: 16, color: S.ink, marginTop: 8, lineHeight: 1.4 }}>
        {cliente && <span style={{ fontWeight: 600 }}>{cliente}: </span>}{text}
      </p>
    </button>
  );
}

function ListaGenerica({ tipo, onBack, followed, onOpenProcesso, onOpenBloqueio }) {
  const config = {
    processos: { title: "Processos", data: PROCESSOS_LISTA },
    bloqueios: { title: "Bloqueios", data: BLOQUEIOS_LISTA },
    reclamacoes: { title: "Reclamações", data: RECLAMACOES_LISTA },
  }[tipo];
  const isProcessos = tipo === "processos";

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
        <Faixa bleed={32} onBack={onBack} backLabel="Início" titulo={config.title}
               sub={tipo === "bloqueios" ? `${config.data.filter((b) => b.status === "Ativo").length} ativos de ${config.data.length} na base` : `${config.data.length} na base de exemplo`} />
        {config.data.map((item, i) => {
          const border = { borderBottom: i === config.data.length - 1 ? "none" : `1px solid ${T.hairline}` };
          const inner = (
            <>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <p className="text-[16px] font-medium">{item.cliente}</p>
                  {isProcessos && followed.has(item.id) && <StarIcon filled size={12} />}
                </div>
                <Badge text={item.status} />
              </div>
              <p className="text-[15px] mt-1" style={{ color: T.muted }}>{item.desc || item.valor}</p>
            </>
          );
          if (tipo === "bloqueios") {
            return (
              <button key={item.id} onClick={() => onOpenBloqueio(item, "bloqueios")} className="w-full text-left py-3.5" style={border}>
                {inner}
              </button>
            );
          }
          return isProcessos ? (
            <button key={item.id} onClick={() => onOpenProcesso(item, "processos")} className="w-full text-left py-3.5" style={border}>
              {inner}
            </button>
          ) : (
            <div key={i} className="py-3.5" style={border}>{inner}</div>
          );
        })}
      </div>
    </>
  );
}

function AcompanhandoLista({ items, onOpen, onBack }) {
  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
        <Faixa bleed={32} onBack={onBack} backLabel="Início" titulo="Processos que acompanho"
               sub={items.length === 1 ? "1 processo com estrela" : `${items.length} processos com estrela`} />
        {items.length === 0 ? (
          <p className="text-[15px] mt-4" style={{ color: T.muted }}>
            Nenhum processo acompanhado ainda. Toque na estrela dentro de um processo pra começar.
          </p>
        ) : items.map((item, i) => (
          <button key={item.id} onClick={() => onOpen(item)} className="w-full text-left py-3.5"
                  style={{ borderBottom: i === items.length - 1 ? "none" : `1px solid ${T.hairline}` }}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[16px] font-medium">{item.cliente}</p>
              <Badge text={item.status} />
            </div>
            <p className="text-[15px] mt-1" style={{ color: T.muted }}>{item.desc}</p>
          </button>
        ))}
      </div>
    </>
  );
}

function ProcessoDetalhe({ processo, isFollowing, onToggleFollow, onBack, backLabel = "Processos", sample }) {
  const [resumo, setResumo] = useState({ status: "idle", text: "" });
  const ctlRef = React.useRef(null);
  useEffect(() => () => ctlRef.current?.abort(), []);
  const bloqueios = BLOQUEIOS_LISTA.filter((b) => b.processoId === processo.id);

  const resumir = async () => {
    if (!sample) return;
    const ctl = new AbortController();
    ctlRef.current = ctl;
    setResumo({ status: "thinking", text: "" });
    const dados = {
      numero: processo.numero, cliente: processo.cliente, area: processo.area, acao: processo.desc, status: processo.status,
      contrato_de_gestao: processo.contrato, dias_sem_movimentacao: processo.diasParado,
      movimentacoes_mais_recentes_primeiro: processo.movs,
      bloqueios: bloqueios.map((b) => ({ valor: b.valor, status: b.status, historico: b.historico })),
    };
    try {
      const { text } = await sample(
        `Você ajuda uma sócia de escritório de advocacia a acompanhar processos pelo celular. Resuma em no máximo 2 frases curtas, em português simples, a última movimentação deste processo e o que ela significa na prática para o cliente. Use só os fatos dos dados abaixo; não invente valores, datas ou partes. Responda só com o resumo, sem título.\n\nDados do processo:\n${JSON.stringify(dados)}`,
        { modelTier: "quick", signal: ctl.signal, onText: ({ text }) => setResumo({ status: "streaming", text }) },
      );
      setResumo({ status: "done", text });
    } catch (e) {
      if (e?.code === "cancelled") return;
      setResumo({ status: "error", text: e?.text || "", error: erroTexto(e) });
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
        <Faixa bleed={32} tom={tomDeStatus(processo.status)} onBack={onBack} backLabel={backLabel}
               direita={<Badge text={processo.status} />}
               eyebrow={`${processo.cliente} · ${processo.area}`} titulo={processo.desc} tituloSize={28}
               sub={<span style={{ fontFamily: F.dados, fontSize: 14, letterSpacing: ".01em" }}>{processo.numero}</span>}>
          <KPIs itens={[
            ["Última mov.", processo.movs[0]?.date.slice(0, 5) || "—"],
            ["Parado há", processo.diasParado === 0 ? "0 dias" : `${processo.diasParado} ${processo.diasParado === 1 ? "dia" : "dias"}`],
            ["Bloqueios", String(bloqueios.filter((b) => b.status === "Ativo").length)],
          ]} />
          <div className="flex flex-col gap-3 mt-3" style={{ ...CARD, padding: 16 }}>
          {isFollowing ? (
            <button onClick={onToggleFollow} className="guia-btn w-full inline-flex items-center justify-center gap-2"
                    style={{ height: 50, borderRadius: 14, background: S.resolvidoFundo, color: S.resolvido, fontFamily: F.ui, fontSize: 17, fontWeight: 600 }}>
              <IconeSem tipo="check" cor={S.resolvido} size={17} /> Seguindo este processo
            </button>
          ) : (
            <Botao onClick={onToggleFollow}><StarIcon size={17} color="#FFFFFF" /> Seguir processo</Botao>
          )}
          {sample && resumo.status === "idle" && (
            <Botao variante="ia" onClick={resumir}><SparkleIcon size={17} color={S.ia} strokeWidth={2} /> Resumir com a IA</Botao>
          )}
          </div>
        </Faixa>

        {resumo.status !== "idle" && (
          <div className="mt-4" style={{ background: S.iaFundo, borderRadius: 18, padding: 18 }} aria-live="polite">
            <p className="flex items-center gap-1.5" style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 700, color: S.ia, marginBottom: 6 }}>
              <SparkleIcon size={15} color={S.ia} strokeWidth={2} /> Resumo da IA
            </p>
            {resumo.status === "thinking" && (
              <div><div className="guia-skel" style={{ width: "95%", height: 14, background: undefined }} /><div className="guia-skel" style={{ width: "70%", height: 14, marginTop: 8 }} /></div>
            )}
            {resumo.text && <p className="text-[17px] leading-relaxed">{resumo.text}</p>}
            {resumo.status === "error" && (
              <>
                <p className="text-[15px] mt-1" style={{ color: T.muted }}>{resumo.error}</p>
                <button onClick={resumir} className="text-[15px] font-medium mt-2" style={LINK}>Tentar de novo</button>
              </>
            )}
            {resumo.status === "done" && <><p className="text-[14px] mt-2" style={{ color: S.texto2 }}>Gerado a partir das movimentações abaixo.</p><OuvirBtn texto={resumo.text} /></>}
          </div>
        )}

        {bloqueios.length > 0 && (
          <>
            <SecLabel>Bloqueios</SecLabel>
            {bloqueios.map((b, i) => (
              <div key={b.id} className="flex items-center justify-between py-2.5" style={{ borderBottom: i === bloqueios.length - 1 ? "none" : `1px solid ${T.hairline}` }}>
                <span className="text-[16px]" style={{ fontVariantNumeric: "tabular-nums" }}>{b.valor}</span>
                <Badge text={b.status} />
              </div>
            ))}
          </>
        )}

        <SecLabel>Movimentações</SecLabel>
        <div className="relative pl-5">
          <div className="absolute left-[5px] top-1 bottom-1 w-px" style={{ background: T.hairline }} />
          {processo.movs.map((t, i) => (
            <div key={i} className="relative pb-5 last:pb-0">
              <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full" style={{ background: i === 0 ? T.brass : T.slate }} />
              <p className="text-[14px]" style={{ color: T.muted }}>{t.date}</p>
              <p className="text-[16px] mt-0.5">{t.text}</p>
            </div>
          ))}
        </div>

        <SecLabel>Contrato de gestão</SecLabel>
        <p className="text-[16px]">{processo.contrato}</p>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Tela: Detalhe do bloqueio                                           */
/* ------------------------------------------------------------------ */
function BloqueioDetalhe({ bloqueio, onBack, backLabel, onOpenProcesso }) {
  const processo = PROCESSOS_LISTA.find((p) => p.id === bloqueio.processoId);
  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
        <Faixa bleed={32} tom={tomDeStatus(bloqueio.status)} onBack={onBack} backLabel={backLabel}
               direita={<Badge text={bloqueio.status} />}
               eyebrow={bloqueio.cliente} titulo={bloqueio.valor} tituloCompacto={`${bloqueio.cliente} · ${bloqueio.valor}`} tituloSize={42}
               sub={bloqueio.status === "Ativo" ? "Valor ainda bloqueado na conta do cliente" : "Valor já liberado para o cliente"}>
          <KPIs itens={[
            ["Bloqueado em", fmtData(bloqueio.data).slice(0, 5)],
            ["Há", (() => { const d = diasEntre(bloqueio.data, HOJE); return d === 1 ? "1 dia" : `${d} dias`; })()],
            ["Sistema", bloqueio.sistema],
          ]} />
          <div className="mt-3" style={CARD}>
            <InfoLinha icone={<BuildingIcon size={18} color={S.curso} />} fundo={S.cursoFundo} rotulo="Contrato de gestão" valor={bloqueio.contrato} last />
          </div>
        </Faixa>

        {processo && (
          <>
            <SecLabel>Processo vinculado</SecLabel>
            <button onClick={() => onOpenProcesso(processo)} className="w-full text-left p-4 rounded-2xl flex items-center gap-3"
                    style={CARD}>
              <div className="flex-1">
                <p className="text-[16px] font-medium">{processo.desc}</p>
                <p className="text-[14px] mt-1" style={{ color: T.muted }}>{processo.status}</p>
              </div>
              <ChevronIcon size={14} color={T.muted} strokeWidth={2} />
            </button>
          </>
        )}

        <SecLabel>Histórico</SecLabel>
        <div className="relative pl-5">
          <div className="absolute left-[5px] top-1 bottom-1 w-px" style={{ background: T.hairline }} />
          {bloqueio.historico.map((h, i) => (
            <div key={i} className="relative pb-5 last:pb-0">
              <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full" style={{ background: i === 0 ? T.brass : T.slate }} />
              <p className="text-[14px]" style={{ color: T.muted }}>{h.date}</p>
              <p className="text-[16px] mt-0.5">{h.text}</p>
            </div>
          ))}
        </div>

        <p className="text-[13px] mt-8" style={{ color: T.muted }}>Fonte: Log de Bloqueios, sincronizado há 2 horas.</p>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Tela: Busca global                                                  */
/* ------------------------------------------------------------------ */
const SearchIcon = (p) => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></Icon>;

function norm(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function BuscaGlobal({ q, setQ, onBack, onOpenProcesso, onOpenBloqueio, onOpenOrg }) {
  const term = norm(q.trim());

  const orgs = term ? ORG_ORDER.filter((id) => norm(ORGS[id].name).includes(term)) : [];
  const processos = term ? PROCESSOS_LISTA.filter((p) => norm(`${p.cliente} ${p.desc}`).includes(term)) : [];
  const bloqueios = term ? BLOQUEIOS_LISTA.filter((b) => norm(`${b.cliente} ${b.valor} ${b.contrato}`).includes(term)) : [];
  const total = orgs.length + processos.length + bloqueios.length;

  const Section = ({ title, children }) => (
    <>
      <p className="text-[14px] mt-6 mb-1" style={{ color: T.muted }}>{title}</p>
      <div className="flex flex-col">{children}</div>
    </>
  );

  return (
    <>
      <div className="flex items-center gap-2 px-6 pt-3 pb-2 shrink-0">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-full" style={{ background: "white", border: `1px solid ${T.hairline}` }}>
          <SearchIcon size={16} color={T.muted} />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
                 placeholder="Cliente, processo ou valor"
                 className="flex-1 bg-transparent outline-none text-[17px]" style={{ color: T.ink }} />
        </div>
        <button onClick={onBack} className="text-[16px] px-2" style={LINK}>Cancelar</button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-8 pt-2" style={{ paddingBottom: 60 }}>
        {!term && (
          <>
            <SecLabel>Sugestões</SecLabel>
            <div className="flex flex-wrap gap-2">
              {["AFNE", "Gnosis", "trabalhista", "SISBAJUD", "Niterói"].map((s) => (
                <button key={s} onClick={() => setQ(s)} className="text-[15px] px-3 py-1.5 rounded-full" style={{ background: "#FFFFFF" }}>{s}</button>
              ))}
            </div>
          </>
        )}

        {term && total === 0 && (
          <p className="text-[16px] mt-6" style={{ color: T.muted }}>
            Nada encontrado para "{q}". Tente o nome do cliente ou o tipo de ação.
          </p>
        )}

        {orgs.length > 0 && (
          <Section title="Organizações">
            {orgs.map((id) => (
              <button key={id} onClick={() => onOpenOrg(id)} className="flex items-center gap-3 py-3 w-full text-left" style={{ borderBottom: `1px solid ${T.hairline}` }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-serif-legal text-[14px]" style={{ background: T.ink, color: T.paper }}>{ORGS[id].initials}</div>
                <p className="text-[16px] flex-1">{ORGS[id].name}</p>
                <ChevronIcon size={14} color={T.muted} strokeWidth={2} />
              </button>
            ))}
          </Section>
        )}

        {processos.length > 0 && (
          <Section title="Processos">
            {processos.map((p) => (
              <button key={p.id} onClick={() => onOpenProcesso(p)} className="w-full text-left py-3" style={{ borderBottom: `1px solid ${T.hairline}` }}>
                <p className="text-[16px] font-medium">{p.cliente}</p>
                <p className="text-[15px] mt-0.5" style={{ color: T.muted }}>{p.desc}</p>
              </button>
            ))}
          </Section>
        )}

        {bloqueios.length > 0 && (
          <Section title="Bloqueios">
            {bloqueios.map((b) => (
              <button key={b.id} onClick={() => onOpenBloqueio(b)} className="w-full text-left py-3 flex items-center justify-between gap-2" style={{ borderBottom: `1px solid ${T.hairline}` }}>
                <div>
                  <p className="text-[16px] font-medium">{b.cliente}</p>
                  <p className="text-[15px] mt-0.5" style={{ color: T.muted }}>{b.valor}</p>
                </div>
                <Badge text={b.status} />
              </button>
            ))}
          </Section>
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Telas: OS                                                           */
/* ------------------------------------------------------------------ */
function OsLista({ onOpenOrg, ordem = ORG_ORDER }) {
  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 110 }}>
        <Faixa bleed={32} eyebrow="Clientes do escritório" titulo="Organizações" tituloSize={36}
               sub={`${ordem.length} principais e ${OUTRAS_ORGS.length + 14} outras`} />
        <SecLabel>Principais clientes</SecLabel>
        <div className="flex flex-col">
          {ordem.map((id, i) => {
            const o = ORGS[id];
            return (
              <button key={id} onClick={() => onOpenOrg(id)} className="flex items-center gap-3 py-3.5 w-full text-left"
                      style={{ borderBottom: i === ordem.length - 1 ? "none" : `1px solid ${T.hairline}` }}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-serif-legal text-[15px]" style={{ background: T.ink, color: T.paper }}>{o.initials}</div>
                <div className="flex-1">
                  <p className="text-[17px] font-medium">{o.name}</p>
                  <p className="text-[14px] mt-0.5" style={{ color: T.muted }}>{o.processos} processos, {o.bloqueadoCurto} bloqueado</p>
                </div>
                <ChevronIcon size={15} color={T.muted} strokeWidth={2} />
              </button>
            );
          })}
        </div>

        <SecLabel>Outras organizações</SecLabel>
        <div className="flex flex-col">
          {OUTRAS_ORGS.map((o) => (
            <div key={o.name} className="flex items-center justify-between py-2.5" style={{ borderBottom: `1px solid ${T.hairline}` }}>
              <p className="text-[15px]">{o.name}</p>
              <p className="text-[14px]" style={{ color: T.muted, fontVariantNumeric: "tabular-nums" }}>{o.processos}</p>
            </div>
          ))}
          <div className="flex items-center justify-between py-3 mt-1">
            <p className="text-[15px]" style={LINK}>Ver mais 14 organizações</p>
          </div>
        </div>
      </div>
    </>
  );
}

function OsPerfil({ orgId, onBack, sample, onAsk }) {
  const o = ORGS[orgId];
  const [q, setQ] = useState("");
  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 150 }}>
        <Faixa bleed={32} onBack={onBack} backLabel="Organizações"
               eyebrow={`${o.name} · bloqueado hoje`} titulo={o.bloqueado} tituloCompacto={o.name} tituloSize={40} sub={`${o.processos} processos na base`}
               aside={<span className="w-14 h-14 rounded-full flex items-center justify-center shrink-0" style={{ background: S.ink, color: "#FFFFFF", fontFamily: F.display, fontSize: 18, fontWeight: 600 }}>{o.initials}</span>}>
          <KPIs itens={[
            ["Processos", String(o.processos)],
            ["Bloqueios", String(BLOQUEIOS_LISTA.filter((b) => b.clienteId === orgId && b.status === "Ativo").length)],
            ["Contratos", String(o.contratos.length)],
          ]} />
          <div className="mt-3" style={CARD}>
            <p style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.texto2, padding: "14px 18px 0" }}>O que mudou aqui</p>
            {o.feed.map((f, i) => {
              const t = /levantad/i.test(f.text) ? ["resolvido", "Levantado"] : /reclama/i.test(f.text) ? ["atencao", "Reclamação"] : /remarcad/i.test(f.text) ? ["atencao", "Remarcação"] : ["curso", "Movimentação"];
              return <FeedItem key={i} text={f.text} time={f.time} sem={SEMANTICA.find((x) => x.id === t[0])} tag={t[1]} last={i === o.feed.length - 1} />;
            })}
          </div>
        </Faixa>

        <SecLabel>Contratos de gestão</SecLabel>
        <div className="flex flex-col gap-2.5">
          {o.contratos.map((c, i) => {
            const fim = Number(String(c.vigencia).split("–")[1]);
            const st = fim < 2026 ? { s: SEMANTICA.find((x) => x.id === "atencao"), t: `Vigência encerrada em ${fim}` }
                     : fim === 2026 ? { s: SEMANTICA.find((x) => x.id === "atencao"), t: "Vence este ano" }
                     : { s: SEMANTICA.find((x) => x.id === "curso"), t: "Vigente" };
            const destaque = st.s.id === "atencao";
            return (
              <div key={i} style={destaque ? { background: st.s.fundo, borderRadius: 18, padding: 18 } : { ...CARD, padding: 18 }}>
                <p style={{ fontFamily: F.ui, fontSize: 17, fontWeight: 600, color: S.ink }}>{c.orgao}</p>
                <p style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2, marginTop: 2 }}>Vigência {c.vigencia}</p>
                <div className="mt-2.5"><Etiqueta s={st.s} texto={st.t} sobreCor={destaque} /></div>
              </div>
            );
          })}
        </div>

        <SecLabel>Nesta organização</SecLabel>
        <div style={CARD}>
          <Row icon={<FolderIcon size={19} />} label="Processos" value={String(o.processos)} />
          <Row icon={<LockIcon size={19} />} label="Bloqueios" value={o.bloqueadoCurto} />
          <Row icon={<FlagIcon size={19} />} label="Reclamações" value="—" last />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-6 pb-7 pt-5" style={{ background: `linear-gradient(to top, ${T.paper} 70%, transparent)` }}>
        {sample === null && <p className="text-[14px] mb-2" style={{ color: T.muted }}>A IA responde quando este app é aberto no Claude.</p>}
        <AskBar value={q} onChange={setQ} onSubmit={(t) => { onAsk(t); setQ(""); }} disabled={!sample}
                scopeLabel={`Perguntando sobre ${o.name}`} placeholder={`Pergunte sobre ${o.name.startsWith("I") ? "o" : "a"} ${o.name}…`} />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* IA real: o Claude escolhe a apresentação, o app calcula os números  */
/* ------------------------------------------------------------------ */
const samplePromise = (typeof window !== "undefined" && window.claude && window.claude.use)
  ? window.claude.use("sample").catch(() => null)
  : Promise.resolve(null);

function useSample() {
  const [sample, setSample] = useState(undefined); // undefined = carregando, null = indisponível
  useEffect(() => { let vivo = true; samplePromise.then((s) => { if (vivo) setSample(() => s); }); return () => { vivo = false; }; }, []);
  return sample;
}

const ERRO_COPY = {
  not_granted: "A IA não foi autorizada nesta visualização. Para usar, permita o acesso ao Claude no menu de permissões do app.",
  sampling_disabled: "A IA não está disponível para esta conta.",
  rate_limited: "Muitas perguntas em pouco tempo. Espere um minuto e tente de novo.",
  session_expired: "Sua sessão expirou. Entre de novo no Claude e tente outra vez.",
  refused: "A IA não respondeu a essa pergunta. Tente reformular.",
  invalid_json: "A resposta da IA veio num formato que o app não conseguiu ler. Tente de novo.",
  empty_completion: "A IA não trouxe resposta. Tente uma pergunta mais curta.",
  tools_unavailable: "Esta visualização não permite que a IA consulte os dados.",
  prompt_too_large: "A pergunta ficou grande demais. Tente algo mais curto.",
};
const erroTexto = (e) => ERRO_COPY[e?.code] || "Não foi possível falar com a IA agora. Tente de novo em instantes.";

const TOOLS_DEF = (onProgress) => [
  {
    name: "consultar_dados",
    description: "Calcula uma métrica sobre a base do escritório e devolve o total e, se pedido, os grupos. Use SEMPRE esta função para obter qualquer número; nunca estime valores.",
    inputSchema: {
      type: "object",
      properties: {
        metrica: { type: "string", enum: ["valor_bloqueado", "quantidade_bloqueios", "quantidade_processos", "processos_parados"] },
        agrupar_por: { type: "string", enum: ["nenhum", "cliente", "area", "contrato", "status", "mes"], description: "mes = mês do bloqueio (ou da última movimentação, para processos), de Jan até o mês atual de 2026" },
        cliente: { type: "string", description: "AFNE, Instituto Gnosis, FAS ou IGEDES. Omita para a firma toda." },
        area: { type: "string", enum: ["Trabalhista", "Cível", "Administrativo", "Constitucional"] },
        status_bloqueio: { type: "string", enum: ["Ativo", "Levantado", "todos"], description: "Só para métricas de bloqueio. Padrão: Ativo." },
        dias_minimos_parado: { type: "number", description: "Só para processos_parados. Padrão: 60." },
      },
      required: ["metrica"],
    },
    execute: (input) => {
      const rot = { valor_bloqueado: "valor bloqueado", quantidade_bloqueios: "bloqueios", quantidade_processos: "processos", processos_parados: "processos parados" }[input.metrica] || "dados";
      const por = input.agrupar_por && input.agrupar_por !== "nenhum" ? ` por ${input.agrupar_por === "area" ? "área" : input.agrupar_por === "mes" ? "mês" : input.agrupar_por}` : "";
      onProgress(`Consultando ${rot}${por}${input.cliente ? ` de ${input.cliente}` : ""}`);
      return consultarDados(input);
    },
  },
  {
    name: "listar_processos",
    description: "Lista processos (até 25) ordenados pelos mais parados, com número, cliente, área, status, dias parado e valor bloqueado ativo. Use para tabelas de processos específicos.",
    inputSchema: {
      type: "object",
      properties: {
        cliente: { type: "string" },
        area: { type: "string", enum: ["Trabalhista", "Cível", "Administrativo", "Constitucional"] },
        dias_minimos_parado: { type: "number" },
        apenas_com_bloqueio_ativo: { type: "boolean" },
        limite: { type: "number" },
      },
    },
    execute: (input) => { onProgress(`Listando processos${input.cliente ? ` de ${input.cliente}` : ""}`); return listarProcessos(input); },
  },
];

function montarPrompt(pergunta, clienteId) {
  const escopo = clienteId ? `\nA sócia está na página da organização ${CLIENTE_NOME[clienteId]}: filtre todas as consultas por cliente = "${CLIENTE_NOME[clienteId]}", a menos que a pergunta peça outra coisa explicitamente.` : "";
  return `Você é o assistente de estatísticas do app interno dos sócios do escritório Azevedo dos Reis Advogados (Direito do Terceiro Setor). Uma sócia fez uma pergunta e você monta um relatório curto para a tela do celular dela.

Regras:
- Todo número do relatório tem de vir das funções consultar_dados ou listar_processos. Nunca invente nem estime valores. Você pode calcular percentuais simples a partir dos números que as funções devolverem.
- A base cobre ${TOTAIS.processos} processos e ${BLOQUEIOS_LISTA.length} bloqueios de 4 clientes (AFNE, Instituto Gnosis, FAS, IGEDES), com dados de 2026 até outubro. Hoje é 06/10/2026.
- Se a pergunta pedir algo que a base não tem (prazos, honorários, nomes de partes, outros anos), diga isso num bloco de texto e não force um gráfico.
- Faça poucas consultas: em geral de 1 a 3.
- Escolha os blocos pela forma do dado: um valor único vira "destaque"; uma série ao longo dos meses vira "linha"; comparação entre poucas categorias (até 8) vira "barras"; lista de processos com várias colunas vira "tabela". Termine sempre com um bloco "texto" de 1 a 2 frases com a conclusão principal, em linguagem simples.
- No máximo 5 blocos. Português do Brasil, sem jargão técnico de sistema.${escopo}

Responda só com JSON neste formato:
{"titulo": "título curto do relatório",
 "blocos": [
   {"tipo": "destaque", "rotulo": "o que é o número", "valor": 1234567, "unidade": "BRL" | "quantidade"},
   {"tipo": "linha", "titulo": "...", "rotulos": ["Jan", "Fev"], "valores": [10, 20], "unidade": "BRL" | "quantidade"},
   {"tipo": "barras", "titulo": "...", "itens": [{"rotulo": "...", "valor": 10}], "unidade": "BRL" | "quantidade"},
   {"tipo": "tabela", "titulo": "...", "colunas": ["..."], "linhas": [["...", "..."]]},
   {"tipo": "texto", "texto": "..."}
 ],
 "fontes": ["Log de Bloqueios" e/ou "Legal One"]}

Pergunta da sócia: ${pergunta}`;
}

async function gerarRelatorio(sample, pergunta, { clienteId, onProgress, signal }) {
  const spec = await sample.json(montarPrompt(pergunta, clienteId), { tools: TOOLS_DEF(onProgress), signal, modelTier: "default" });
  if (!spec || !Array.isArray(spec.blocos)) throw { code: "invalid_json" };
  return spec;
}

/* Relatórios pré-calculados para os dois fixados de exemplo */
function relatorioExemploGnosis() {
  const tot = consultarDados({ metrica: "valor_bloqueado", cliente: "Instituto Gnosis" });
  const porArea = consultarDados({ metrica: "valor_bloqueado", cliente: "Instituto Gnosis", agrupar_por: "area" });
  const porMes = consultarDados({ metrica: "valor_bloqueado", cliente: "Instituto Gnosis", agrupar_por: "mes", status_bloqueio: "todos" });
  const maior = porArea.grupos[0];
  return {
    titulo: "Bloqueios ativos do Instituto Gnosis",
    blocos: [
      { tipo: "destaque", rotulo: "Bloqueado hoje", valor: tot.total, unidade: "BRL" },
      { tipo: "linha", titulo: "Novos bloqueios por mês", rotulos: porMes.grupos.map((g) => g.rotulo), valores: porMes.grupos.map((g) => g.valor), unidade: "BRL" },
      { tipo: "barras", titulo: "Por área do direito", itens: porArea.grupos, unidade: "BRL" },
      { tipo: "texto", texto: maior ? `${maior.rotulo} concentra ${Math.round((maior.valor / tot.total) * 100)}% do valor bloqueado do Instituto Gnosis.` : "Não há bloqueios ativos." },
    ],
    fontes: ["Log de Bloqueios"],
  };
}
function relatorioExemploParados() {
  const tot = consultarDados({ metrica: "processos_parados" });
  const porCli = consultarDados({ metrica: "processos_parados", agrupar_por: "cliente" });
  const lista = listarProcessos({ dias_minimos_parado: 60, limite: 6 });
  return {
    titulo: "Processos parados há mais de 60 dias",
    blocos: [
      { tipo: "destaque", rotulo: "Processos parados", valor: tot.total, unidade: "quantidade" },
      { tipo: "barras", titulo: "Por cliente", itens: porCli.grupos, unidade: "quantidade" },
      { tipo: "tabela", titulo: "Os mais antigos", colunas: ["Cliente", "Ação", "Dias parado"], linhas: lista.map((p) => [p.cliente, p.descricao, String(p.dias_parado)]) },
      { tipo: "texto", texto: `${porCli.grupos[0]?.rotulo || "Nenhum cliente"} tem o maior número de processos parados.` },
    ],
    fontes: ["Legal One"],
  };
}

/* ------------------------- Render do relatório --------------------- */
const fmtValor = (v, unidade) => (unidade === "BRL" ? fmtBRL(Number(v) || 0) : Number(v).toLocaleString("pt-BR"));
const fmtValorCurto = (v, unidade) => (unidade === "BRL" ? fmtBRLCurto(Number(v) || 0) : Number(v).toLocaleString("pt-BR"));

function BlocoLinha({ b }) {
  const vals = (b.valores || []).map(Number);
  if (vals.length < 2) return null;
  const W = 300, H = 100, padX = 10, top = 14, bot = 12;
  const max = Math.max(...vals, 1);
  const pts = vals.map((v, i) => [padX + (i * (W - padX * 2)) / (vals.length - 1), top + (1 - v / max) * (H - top - bot)]);
  const poly = pts.map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" ");
  const area = `M${pts[0][0]},${H - bot} ` + pts.map((p) => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + ` L${pts[pts.length - 1][0]},${H - bot} Z`;
  const iMax = vals.indexOf(Math.max(...vals));
  return (
    <div className="p-5 rounded-2xl" style={CARD}>
      <p className="text-[15px] font-medium mb-1">{b.titulo}</p>
      <p className="text-[14px] mb-2" style={{ color: T.muted }}>Pico: {fmtValor(vals[iMax], b.unidade)} em {b.rotulos?.[iMax]}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24" role="img" aria-label={`${b.titulo}. Pico de ${fmtValor(vals[iMax], b.unidade)} em ${b.rotulos?.[iMax]}.`}>
        <line x1={padX} x2={W - padX} y1={H - bot} y2={H - bot} stroke={T.hairline} strokeWidth="1" />
        <path d={area} fill={T.brass} opacity="0.1" />
        <polyline points={poly} fill="none" stroke={T.brass} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={pts[iMax][0]} cy={pts[iMax][1]} r="3.5" fill={T.brass} />
      </svg>
      <div className="flex justify-between mt-1 text-[12px]" style={{ color: T.muted }}>
        {(b.rotulos || []).map((m, i) => <span key={i}>{m}</span>)}
      </div>
    </div>
  );
}

function BlocoBarras({ b }) {
  const itens = (b.itens || []).slice(0, 8);
  const max = Math.max(...itens.map((i) => Number(i.valor) || 0), 1);
  return (
    <div className="p-5 rounded-2xl" style={CARD}>
      <p className="text-[15px] font-medium mb-4">{b.titulo}</p>
      <div className="flex flex-col gap-3.5">
        {itens.map((it, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[14px] w-[96px] shrink-0 leading-tight">{it.rotulo}</span>
            <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(27,36,48,0.08)" }}>
              <div className="h-2 rounded-full" style={{ width: `${Math.max(2, ((Number(it.valor) || 0) / max) * 100)}%`, background: i === 0 ? T.brass : T.slate }} />
            </div>
            <span className="text-[14px] w-[84px] text-right whitespace-nowrap" style={{ color: S.ink, fontVariantNumeric: "tabular-nums" }}>{fmtValorCurto(it.valor, b.unidade)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BlocoTabela({ b }) {
  return (
    <div className="rounded-2xl" style={CARD}>
      <p className="text-[15px] font-medium px-5 pt-5 pb-3">{b.titulo}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-[14px]" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>{(b.colunas || []).map((c, i) => <th key={i} className="text-left font-medium px-5 py-2" style={{ color: T.muted, borderTop: `1px solid ${T.hairline}` }}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {(b.linhas || []).slice(0, 25).map((l, i) => (
              <tr key={i}>{l.map((c, j) => <td key={j} className="px-5 py-2.5 align-top" style={{ borderTop: `1px solid ${T.hairline}`, fontVariantNumeric: "tabular-nums" }}>{String(c)}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RelatorioView({ spec }) {
  return (
    <>
      <h1 className="font-serif-legal text-[24px] leading-tight mt-7">{spec.titulo}</h1>
      <div className="flex flex-col gap-5 mt-5">
        {spec.blocos.map((b, i) => {
          if (b.tipo === "destaque") return (
            <div key={i} style={{ background: S.ink, borderRadius: 20, padding: 20, color: "#FFFFFF" }}>
              <p style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: "#C9CED3" }}>{b.rotulo}</p>
              <p style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 40, fontWeight: 600, lineHeight: 1, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>{fmtValor(b.valor, b.unidade)}</p>
            </div>
          );
          if (b.tipo === "linha") return <BlocoLinha key={i} b={b} />;
          if (b.tipo === "barras") return <BlocoBarras key={i} b={b} />;
          if (b.tipo === "tabela") return <BlocoTabela key={i} b={b} />;
          if (b.tipo === "texto") return (
            <div key={i} style={{ background: S.iaFundo, borderRadius: 18, padding: 18 }}>
              <p className="flex items-center gap-1.5" style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 700, color: S.ia }}>
                <SparkleIcon size={15} color={S.ia} strokeWidth={2} /> Conclusão da IA
              </p>
              <p style={{ fontFamily: F.ui, fontSize: 17, color: S.ink, lineHeight: 1.45, marginTop: 6 }}>{b.texto}</p>
              <OuvirBtn texto={b.texto} />
            </div>
          );
          return null;
        })}
      </div>
      <p className="text-[13px] mt-4" style={{ color: T.muted }}>Fonte: {(spec.fontes || ["Base do escritório"]).join(" e ")}. Dados de exemplo.</p>
    </>
  );
}

/* ------------------------- Telas de IA ----------------------------- */
function AskBar({ value, onChange, onSubmit, placeholder, disabled, scopeLabel }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (value.trim()) onSubmit(value.trim()); }}>
      {scopeLabel && (
        <div className="flex mb-2">
          <span className="text-[13px] px-3 py-1 rounded-full" style={{ background: "rgba(150,118,58,0.12)", color: T.brass }}>{scopeLabel}</span>
        </div>
      )}
      <div className="flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full" style={{ background: "white", border: `1px solid ${T.hairline}` }}>
        <SparkleIcon size={16} color={T.brass} />
        <input id={scopeLabel ? "ask-org" : "ask-ia"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
               className="flex-1 bg-transparent outline-none text-[17px] py-1.5 min-w-0" style={{ color: T.ink }} aria-label="Pergunta para a IA" />
        <button type="submit" disabled={disabled || !value.trim()} aria-label="Enviar pergunta"
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: value.trim() && !disabled ? T.brass : "rgba(27,36,48,0.08)" }}>
          <SendIcon color={value.trim() && !disabled ? "white" : T.muted} size={16} />
        </button>
      </div>
    </form>
  );
}

function IaAsk({ onAsk, sample }) {
  const [q, setQ] = useState("");
  const sugestoes = ["Como evoluíram os bloqueios da AFNE em 2026?", "Quais processos trabalhistas estão parados há mais de 90 dias?", "Compare o valor bloqueado entre os 4 clientes"];
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar" style={{ paddingBottom: 96 }}>
      <div className="flex-1 flex flex-col items-center justify-center px-10 text-center" style={{ minHeight: 220, paddingTop: 16, paddingBottom: 16 }}>
        <SparkleIcon size={30} color={S.iaIcone} strokeWidth={1.6} />
        <h1 style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 34, fontWeight: 600, lineHeight: 1.1, color: S.ink, marginTop: 14, textWrap: "balance" }}>Pergunte qualquer coisa!</h1>
        <p style={{ fontFamily: F.ui, fontSize: 16, color: S.texto2, lineHeight: 1.45, marginTop: 10, maxWidth: 290 }}>
          Sobre processos, bloqueios e clientes. A IA monta o relatório com os números do escritório.
        </p>
      </div>
      <div className="px-5 shrink-0">
        {sample === null && (
          <p className="mb-2 text-center" style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2 }}>A IA responde quando este app é aberto no Claude.</p>
        )}
        <div className="flex flex-col gap-2 mb-3">
          {sugestoes.map((sg) => (
            <button key={sg} onClick={() => onAsk(sg)} disabled={!sample} className="text-left flex items-center gap-3"
                    style={{ ...CARD, borderRadius: 16, padding: "12px 16px", opacity: sample ? 1 : 0.55, fontFamily: F.ui, fontSize: 15, color: S.ink, lineHeight: 1.35 }}>
              <span className="flex-1">{sg}</span>
              <ChevronIcon size={16} color={S.texto2} strokeWidth={2} />
            </button>
          ))}
        </div>
        <AskBar value={q} onChange={setQ} onSubmit={(t) => { onAsk(t); setQ(""); }} disabled={!sample} placeholder="Pergunte sobre os números…" />
      </div>
    </div>
  );
}

function PastaRelatorios({ pinned, onOpenPinned, onBack }) {
  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
        <Faixa bleed={32} onBack={onBack} backLabel="Perfil" titulo="Relatórios fixados"
               sub={pinned.length === 0 ? "Nenhum relatório ainda" : pinned.length === 1 ? "1 relatório guardado" : `${pinned.length} relatórios guardados`} />
        {pinned.length === 0 ? (
          <p className="text-[16px] leading-relaxed" style={{ color: T.muted }}>
            Faça uma pergunta na aba IA e toque em "Fixar relatório". Ele fica guardado aqui para você abrir de novo quando quiser.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {pinned.map((p) => {
              const destaque = p.spec.blocos.find((b) => b.tipo === "destaque");
              const linha = p.spec.blocos.find((b) => b.tipo === "linha");
              return (
                <button key={p.id} onClick={() => onOpenPinned(p)} className="w-full text-left p-4 rounded-2xl" style={CARD}>
                  <p className="text-[16px] font-medium leading-snug">{p.spec.titulo}</p>
                  <div className="flex items-end justify-between mt-2 gap-3">
                    <div>
                      {destaque && <p className="font-serif-legal text-[24px] leading-none">{fmtValor(destaque.valor, destaque.unidade)}</p>}
                      <p className="text-[14px] mt-1.5" style={{ color: T.muted }}>{p.atualizado}</p>
                    </div>
                    {linha && <Sparkline values={linha.valores.map(Number)} />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function IaReport({ job, isPinned, onTogglePin, onStop, onRetry, onRefresh, onBack }) {
  const pensando = job.status === "thinking";
  return (
    <>
      <BackHeader label={job.backLabel || "Estatísticas"} onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar px-8 pt-4" style={{ paddingBottom: 170 }}>
        <div className="flex justify-end">
          <p className="text-[17px] leading-snug px-4 py-3 rounded-2xl max-w-[86%]" style={{ background: T.ink, color: T.paper }}>{job.question}</p>
        </div>
        <p className="text-[13px] text-right mt-1.5" style={{ color: T.muted }}>
          {job.clienteId ? `Sobre ${CLIENTE_NOME[job.clienteId]}` : ""}{job.clienteId && job.atualizado ? " · " : ""}{job.atualizado || ""}
        </p>

        {pensando && (
          <div className="mt-7" aria-live="polite">
            <p className="text-[17px] flex items-center gap-2"><span className="w-2 h-2 rounded-full animate-pulse" style={{ background: T.brass }} />Pensando…</p>
            <ul className="mt-3 flex flex-col gap-1.5">
              {job.progress.map((p, i) => (
                <li key={i} className="text-[15px] flex items-center gap-2" style={{ color: T.muted }}>
                  <CheckIcon size={13} color={T.slate} /> {p}
                </li>
              ))}
            </ul>
            <p className="text-[14px] mt-4 leading-relaxed" style={{ color: T.muted }}>A IA consulta os dados e monta o relatório. Costuma levar de 20 segundos a 1 minuto.</p>
          </div>
        )}

        {job.status === "error" && (
          <div className="mt-7 p-4 rounded-2xl" style={CARD}>
            <p className="text-[16px] leading-relaxed">{job.error}</p>
            {job.retryable && <button onClick={onRetry} className="mt-3 text-[16px] font-medium" style={LINK}>Tentar de novo</button>}
          </div>
        )}

        {job.status === "done" && job.spec && <RelatorioView spec={job.spec} />}
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-6 pb-7 pt-5 flex flex-col gap-2" style={{ background: `linear-gradient(to top, ${T.paper} 70%, transparent)` }}>
        {pensando && (
          <button onClick={onStop} className="w-full py-3.5 rounded-full text-[16px] font-medium" style={{ background: "#FFFFFF", color: T.ink }}>Parar</button>
        )}
        {job.status === "done" && (
          <>
            {job.pinnedExample && onRefresh && (
              <button onClick={onRefresh} className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-[16px]" style={LINK}>
                <SparkleIcon size={15} color={S.ia} /> Refazer com a IA
              </button>
            )}
            <button onClick={onTogglePin}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-[16px] font-medium"
                    style={isPinned ? { background: S.resolvidoFundo, color: S.resolvido, height: 50, borderRadius: 14 } : { background: S.ink, color: "white", height: 50, borderRadius: 14 }}>
              {isPinned ? <CheckIcon size={16} color={S.resolvido} /> : <PinIcon size={16} color="white" />}
              {isPinned ? "Guardado em Perfil, Relatórios fixados" : "Fixar relatório"}
            </button>
          </>
        )}
      </div>
    </>
  );
}

function Sparkline({ values, color = T.brass }) {
  if (!values || values.length < 2) return null;
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => `${(3 + (i * 74) / (values.length - 1)).toFixed(1)},${(29 - (v / max) * 26).toFixed(1)}`).join(" ");
  return (
    <svg width="80" height="32" viewBox="0 0 80 32" aria-hidden="true">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Notificações                                                        */
/* ------------------------------------------------------------------ */
const BellIcon = (p) => <Icon {...p}><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15Z" /><path d="M10 20a2 2 0 0 0 4 0" /></Icon>;
const ChartIcon = (p) => <Icon {...p}><rect x="4" y="12" width="4" height="8" rx="0.5" /><rect x="10" y="7" width="4" height="13" rx="0.5" /><rect x="16" y="3" width="4" height="17" rx="0.5" /></Icon>;
const SunIcon = (p) => <Icon {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Icon>;

const NOTIF_TYPES = {
  movimentacao: { label: "Movimentação", Icon: FolderIcon, color: "#245476" },
  bloqueio: { label: "Bloqueio levantado", Icon: LockIcon, color: "#24603F" },
  reclamacao: { label: "Reclamação", Icon: FlagIcon, color: "#835000" },
  relatorio: { label: "Relatório da IA", Icon: ChartIcon, color: "#765614" },
  resumo: { label: "Resumo diário", Icon: SunIcon, color: "#4F565B" },
};

const INITIAL_NOTIFS = [
  { id: "n1", type: "movimentacao", cliente: "Instituto Gnosis", text: "Decisão interlocutória publicada na ação cível de cobrança", time: "40 min", group: "Hoje", read: false, target: { kind: "processo", id: "p2" } },
  { id: "n2", type: "bloqueio", cliente: "AFNE", text: "Bloqueio de R$ 18.400 foi levantado", time: "3 h", group: "Hoje", read: false, target: { kind: "bloqueio", id: "b1" } },
  { id: "n3", type: "relatorio", cliente: "Instituto Gnosis", text: "Relatório fixado de bloqueios ativos foi atualizado", time: "5 h", group: "Hoje", read: false, target: { kind: "report", id: "pin-gnosis" } },
  { id: "n4", type: "resumo", cliente: null, text: "4 movimentações ontem nos processos que você acompanha", time: "8:00", group: "Ontem", read: true, target: { kind: "acompanhando" } },
  { id: "n5", type: "reclamacao", cliente: "FAS", text: "Nova reclamação constitucional protocolada no STF", time: "ontem", group: "Ontem", read: true, target: { kind: "org", id: "fas" } },
  { id: "n6", type: "movimentacao", cliente: "AFNE", text: "Audiência trabalhista remarcada na ação declaratória", time: "4 dias", group: "Anteriores", read: true, target: { kind: "processo", id: "p4" } },
];

function NotificacoesCentral({ notifs, onOpen, onMarkAll, onBack }) {
  const [filter, setFilter] = useState("todas");
  const unread = notifs.filter((n) => !n.read).length;
  const visible = filter === "todas" ? notifs : notifs.filter((n) => !n.read);
  const groups = ["Hoje", "Ontem", "Anteriores"].map((g) => [g, visible.filter((n) => n.group === g)]).filter(([, items]) => items.length);

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
        <Faixa bleed={32} onBack={onBack} backLabel="Início" titulo="Notificações"
               sub={
                 <div className="flex flex-col items-start gap-2 mt-1">
                   <span>{unread === 0 ? "Tudo lido" : unread === 1 ? "1 não lida" : `${unread} não lidas`}</span>
                   <div className="flex gap-1 p-1 rounded-full mt-1" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(17,24,39,.08)" }}>
                     {[["todas", "Todas"], ["nao-lidas", "Não lidas"]].map(([id, label]) => (
                       <button key={id} onClick={() => setFilter(id)} aria-pressed={filter === id} className="text-[15px] px-4 py-2 rounded-full whitespace-nowrap font-semibold"
                               style={filter === id ? { background: S.ink, color: "#FFFFFF" } : { color: S.ink }}>{label}</button>
                     ))}
                   </div>
                   {unread > 0 && (
                     <button onClick={onMarkAll} className="text-[15px] py-1.5 font-semibold" style={LINK}>Marcar todas como lidas</button>
                   )}
                 </div>
               } />
        {groups.length === 0 && (
          <p className="text-[16px] mt-6" style={{ color: T.muted }}>Tudo lido. Novas movimentações aparecem aqui.</p>
        )}
        {groups.map(([g, items]) => (
          <div key={g}>
            <p className="text-[14px] mt-5 mb-1" style={{ color: T.muted }}>{g}</p>
            {items.map((n, i) => {
              const t = NOTIF_TYPES[n.type];
              return (
                <button key={n.id} onClick={() => onOpen(n)} className="w-full text-left flex items-start gap-3 py-3.5"
                        style={{ borderBottom: i === items.length - 1 ? "none" : `1px solid ${T.hairline}` }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 relative" style={{ background: `${t.color}1A` }}>
                    <t.Icon size={17} color={t.color} />
                    {!n.read && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" style={{ background: T.brass, border: `2px solid ${T.paper}` }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[14px]" style={{ color: t.color }}>{t.label}</p>
                      <span className="text-[13px] shrink-0" style={{ color: T.muted }}>{n.time}</span>
                    </div>
                    <p className={`text-[16px] leading-snug mt-0.5 ${n.read ? "" : "font-medium"}`}>
                      {n.cliente && <span className="font-medium">{n.cliente}: </span>}{n.text}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Tela: Perfil (usuária) e preferências de notificação                */
/* ------------------------------------------------------------------ */
function Toggle({ on, onChange, label }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={onChange}
            className="w-[51px] h-[31px] rounded-full p-[2px] flex shrink-0 transition-colors"
            style={{ background: on ? T.brass : "rgba(27,36,48,0.18)", justifyContent: on ? "flex-end" : "flex-start" }}>
      <span className="w-[27px] h-[27px] rounded-full bg-white" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Perfil, preferências de leitura e avatar                            */
/* ------------------------------------------------------------------ */
const PrefsContext = React.createContext({ lerVoz: false });
const INICIAIS = "VA";

function lerPref(chave, padrao) {
  try { const v = localStorage.getItem("socios:" + chave); return v === null ? padrao : JSON.parse(v); } catch { return padrao; }
}
function gravarPref(chave, valor) {
  try { localStorage.setItem("socios:" + chave, JSON.stringify(valor)); } catch { /* sem armazenamento: só nesta visita */ }
}

function Avatar({ foto, size = 44, badge = 0, claro = false }) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      {foto ? (
        <img src={foto} alt="" className="rounded-full object-cover" style={{ width: size, height: size }} />
      ) : (
        <span className="rounded-full flex items-center justify-center"
              style={{ width: size, height: size, background: claro ? "#FFFFFF" : S.ink, color: claro ? S.ink : "#FFFFFF", fontFamily: F.display, fontSize: size * 0.36, fontWeight: 600, letterSpacing: ".01em" }}>
          {INICIAIS}
        </span>
      )}
      {badge > 0 && (
        <span className="absolute flex items-center justify-center rounded-full"
              style={{ top: -3, right: -3, minWidth: 22, height: 22, padding: "0 5px", background: S.risco, color: "#FFFFFF", fontFamily: F.ui, fontSize: 12, fontWeight: 700, border: `2px solid ${claro ? "#1E3A5F" : S.papel}` }}>
          {badge}
        </span>
      )}
    </span>
  );
}

function OuvirBtn({ texto }) {
  const { lerVoz } = React.useContext(PrefsContext);
  const [falando, setFalando] = useState(false);
  useEffect(() => () => { try { window.speechSynthesis?.cancel(); } catch {} }, []);
  if (!lerVoz || typeof window === "undefined" || !("speechSynthesis" in window) || !texto) return null;
  const alternar = () => {
    try {
      const synth = window.speechSynthesis;
      if (falando) { synth.cancel(); setFalando(false); return; }
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = "pt-BR"; u.rate = 0.95;
      u.onend = () => setFalando(false); u.onerror = () => setFalando(false);
      synth.cancel(); synth.speak(u); setFalando(true);
    } catch { setFalando(false); }
  };
  return (
    <button onClick={alternar} className="mt-3 inline-flex items-center gap-2 rounded-full"
            style={{ background: "#FFFFFF", color: S.ink, fontFamily: F.ui, fontSize: 15, fontWeight: 600, height: 40, padding: "0 16px" }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={S.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {falando ? <path d="M8 5v14M16 5v14" /> : <><path d="M11 5 6 9H3v6h3l5 4Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></>}
      </svg>
      {falando ? "Parar leitura" : "Ouvir"}
    </button>
  );
}

function MenuVA({ unread, followedCount, onClose, onNotificacoes, onAcompanhando, onPerfil, foto, apelido }) {
  const Item = ({ icon, label, value, onClick, last }) => (
    <button onClick={onClick} className="flex items-center gap-3 w-full text-left" style={{ padding: "16px 4px", borderBottom: last ? "none" : `1px solid ${S.linha}` }}>
      {icon}
      <span style={{ fontFamily: F.ui, fontSize: 17, color: S.ink, flex: 1 }}>{label}</span>
      {value}
      <ChevronIcon size={16} color={S.texto2} strokeWidth={2} />
    </button>
  );
  return (
    <div className="absolute inset-0" style={{ zIndex: 60 }}>
      <button aria-label="Fechar menu" onClick={onClose} className="absolute inset-0" style={{ background: "rgba(22,32,43,.38)" }} />
      <div role="dialog" aria-label="Menu da conta" className="guia-sheet absolute left-0 right-0 bottom-0" style={{ background: S.cartao, borderRadius: "24px 24px 0 0", padding: "10px 24px 36px" }}>
        <div className="mx-auto" style={{ width: 40, height: 5, borderRadius: 3, background: S.linha }} />
        <div className="flex items-center gap-3 mt-4 mb-2">
          <Avatar foto={foto} size={52} />
          <div>
            <p style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 22, fontWeight: 500, color: S.ink }}>{apelido || "Sócia"}</p>
            <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2 }}>Azevedo dos Reis Advogados</p>
          </div>
        </div>
        <Item icon={<BellIcon size={21} color={S.ink} />} label="Notificações" onClick={onNotificacoes}
              value={unread > 0 ? <span style={{ background: S.risco, color: "#FFFFFF", fontFamily: F.ui, fontSize: 13, fontWeight: 700, borderRadius: 999, padding: "2px 9px" }}>{unread} novas</span> : null} />
        <Item icon={<StarIcon size={20} color={S.ink} />} label="Processos que acompanho" onClick={onAcompanhando}
              value={<span style={{ fontFamily: F.ui, fontSize: 16, color: S.texto2 }}>{followedCount}</span>} />
        <Item icon={<PersonIcon size={21} color={S.ink} />} label="Perfil e preferências" onClick={onPerfil} last />
      </div>
    </div>
  );
}

const ESCALAS = [{ id: 1, rotulo: "Padrão" }, { id: 1.12, rotulo: "Maior" }, { id: 1.25, rotulo: "Muito maior" }];

function PerfilUsuaria({ onOpenNotifPrefs, onOpenPasta, pinnedCount, onOpenGuia, onOpenOrdem, foto, setFoto, apelido, setApelido, escala, setEscala, lerVoz, setLerVoz }) {
  const fileRef = React.useRef(null);
  const [aviso, setAviso] = useState("");
  const [rascunho, setRascunho] = useState(apelido);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);

  const escolherFoto = (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    if (!/^image\//.test(f.type)) { setAviso("Escolha um arquivo de imagem (JPG ou PNG)."); return; }
    const img = new Image();
    const url = URL.createObjectURL(f);
    img.onload = () => {
      const lado = 256, c = document.createElement("canvas");
      c.width = lado; c.height = lado;
      const ctx = c.getContext("2d");
      const m = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, lado, lado);
      URL.revokeObjectURL(url);
      setFoto(c.toDataURL("image/jpeg", 0.85)); setAviso("Foto atualizada.");
    };
    img.onerror = () => { URL.revokeObjectURL(url); setAviso("Não foi possível abrir essa imagem. Tente outra."); };
    img.src = url;
  };

  const salvarApelido = () => { setApelido(rascunho.trim()); setAviso(rascunho.trim() ? `Saudação atualizada para "${rascunho.trim()}".` : "Saudação sem nome."); };
  const rotulo = { fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.texto2 };

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar px-6" style={{ paddingBottom: 120 }}>
        <Faixa eyebrow="Sua conta" titulo="Perfil" tituloSize={36}>
        <div style={{ ...CARD, padding: 20 }}>
          <div className="flex items-center gap-4">
            <Avatar foto={foto} size={72} />
            <div className="min-w-0">
              <p style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 24, fontWeight: 500, color: S.ink, lineHeight: 1.15 }}>{apelido || "Sócia"}</p>
              <p style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2, marginTop: 2 }}>Azevedo dos Reis Advogados &amp; Associados</p>
            </div>
          </div>
          <input ref={fileRef} id="foto-perfil" type="file" accept="image/*" className="hidden" onChange={escolherFoto} />
          <div className="flex gap-2 mt-4">
            <div className="flex-1"><Botao variante="secundario" onClick={() => fileRef.current?.click()}>{foto ? "Trocar foto" : "Adicionar foto"}</Botao></div>
            {foto && <div className="flex-1"><Botao variante="terciario" onClick={() => { setFoto(null); setAviso("Foto removida. As iniciais voltaram."); }}>Remover</Botao></div>}
          </div>

          <label htmlFor="apelido" className="block mt-5" style={rotulo}>Como prefere ser chamada</label>
          <div className="flex gap-2 mt-2">
            <input id="apelido" value={rascunho} onChange={(e) => setRascunho(e.target.value)} placeholder="Ex.: Dra. Vanessa" maxLength={30}
                   className="flex-1 min-w-0 outline-none" style={{ height: 50, borderRadius: 14, padding: "0 14px", fontFamily: F.ui, fontSize: 17, color: S.ink, background: "#FFFFFF", boxShadow: `inset 0 0 0 1.5px #9CA3AF` }} />
            <button onClick={salvarApelido} disabled={rascunho.trim() === apelido}
                    style={{ height: 50, borderRadius: 14, padding: "0 18px", fontFamily: F.ui, fontSize: 17, fontWeight: 600, background: rascunho.trim() === apelido ? "#E5E7E8" : S.ink, color: rascunho.trim() === apelido ? "#6A7075" : "#FFFFFF" }}>
              Salvar
            </button>
          </div>
          <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 6 }}>Aparece na saudação do Início.</p>

          <button onClick={() => setMostrarCadastro((v) => !v)} className="mt-4 text-left" style={{ ...LINK, fontFamily: F.ui, fontSize: 15 }}>
            {mostrarCadastro ? "Ocultar dados do cadastro" : "Ver nome do cadastro"}
          </button>
          {mostrarCadastro && (
            <div className="mt-3" style={{ background: S.papel, borderRadius: 14, padding: 14 }}>
              <p style={rotulo}>Nome no cadastro do escritório</p>
              <p style={{ fontFamily: F.ui, fontSize: 17, color: S.ink, marginTop: 2 }}>Iniciais {INICIAIS}</p>
              <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 6, lineHeight: 1.4 }}>
                O nome vem do login do escritório e não muda por aqui. Se estiver errado, peça a correção ao administrador do sistema.
              </p>
            </div>
          )}
          {aviso && <p role="status" style={{ fontFamily: F.ui, fontSize: 15, color: S.resolvido, marginTop: 12, fontWeight: 600 }}>{aviso}</p>}
        </div>

        </Faixa>

        {/* Leitura */}
        <SecLabel>Leitura</SecLabel>
        <div style={{ ...CARD, padding: 20 }}>
          <p style={{ fontFamily: F.ui, fontSize: 17, color: S.ink, fontWeight: 600 }}>Tamanho do texto</p>
          <div className="grid grid-cols-3 gap-2 mt-3" role="radiogroup" aria-label="Tamanho do texto">
            {ESCALAS.map((e, i) => {
              const on = escala === e.id;
              return (
                <button key={e.id} role="radio" aria-checked={on} onClick={() => setEscala(e.id)} className="flex flex-col items-center justify-center rounded-2xl"
                        style={{ height: 76, background: on ? S.ink : S.papel, color: on ? "#FFFFFF" : S.ink }}>
                  <span style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 20 + i * 6, fontWeight: 600, lineHeight: 1 }}>A</span>
                  <span style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 600, marginTop: 6 }}>{e.rotulo}</span>
                </button>
              );
            })}
          </div>
          <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 10 }}>Vale para todas as telas do app.</p>

          <div className="flex items-center gap-4 mt-5 pt-5" style={{ borderTop: `1px solid ${S.linha}` }}>
            <div className="flex-1">
              <p style={{ fontFamily: F.ui, fontSize: 17, color: S.ink, fontWeight: 600 }}>Ouvir os resumos da IA</p>
              <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 2, lineHeight: 1.4 }}>Mostra o botão Ouvir nos resumos e conclusões.</p>
            </div>
            <Toggle on={lerVoz} onChange={() => setLerVoz(!lerVoz)} label="Ouvir os resumos da IA" />
          </div>
        </div>

        {/* Organização */}
        <SecLabel>Organização</SecLabel>
        <div style={CARD}>
          <Row icon={<FolderIcon color={S.ink} />} label="Relatórios fixados" value={String(pinnedCount)} onClick={onOpenPasta} />
          <Row icon={<BuildingIcon color={S.ink} />} label="Ordem dos clientes" onClick={onOpenOrdem} />
          <Row icon={<BellIcon color={S.ink} />} label="Notificações" onClick={onOpenNotifPrefs} last />
        </div>

        <SecLabel>Sobre</SecLabel>
        <div style={CARD}>
          <Row icon={<Icon color={S.ink}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></Icon>} label="Segurança" />
          <Row icon={<SparkleIcon color={S.ink} />} label="Guia de estilo" onClick={onOpenGuia} last />
        </div>
      </div>
    </>
  );
}

function OrdemClientes({ ordem, setOrdem, onBack }) {
  const mover = (i, d) => {
    const j = i + d; if (j < 0 || j >= ordem.length) return;
    const n = [...ordem]; [n[i], n[j]] = [n[j], n[i]]; setOrdem(n);
  };
  const SetaBtn = ({ label, onClick, disabled, path }) => (
    <button onClick={onClick} disabled={disabled} aria-label={label} className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: disabled ? "transparent" : S.papel, opacity: disabled ? 0.3 : 1 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={S.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path} /></svg>
    </button>
  );
  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar px-6" style={{ paddingBottom: 60 }}>
        <Faixa onBack={onBack} backLabel="Perfil" titulo="Ordem dos clientes" sub="Os primeiros aparecem no topo da aba OS." />
        <div style={CARD}>
          {ordem.map((id, i) => (
            <div key={id} className="flex items-center gap-3" style={{ padding: "12px 14px 12px 18px", borderBottom: i === ordem.length - 1 ? "none" : `1px solid ${S.linha}` }}>
              <span style={{ fontFamily: F.dados, fontSize: 15, color: S.texto2, width: 18 }}>{i + 1}</span>
              <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: S.ink, color: "#FFFFFF", fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 14 }}>{ORGS[id].initials}</span>
              <span style={{ fontFamily: F.ui, fontSize: 17, color: S.ink, flex: 1, fontWeight: 600 }}>{ORGS[id].name}</span>
              <SetaBtn label={`Subir ${ORGS[id].name}`} onClick={() => mover(i, -1)} disabled={i === 0} path="M6 15l6-6 6 6" />
              <SetaBtn label={`Descer ${ORGS[id].name}`} onClick={() => mover(i, 1)} disabled={i === ordem.length - 1} path="M6 9l6 6 6-6" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function NotifPrefs({ onBack }) {
  const [prefs, setPrefs] = useState({ acompanhados: true, bloqueios: true, reclamacoes: true, relatorios: true, resumo: true, firma: false });
  const flip = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }));
  const items = [
    ["acompanhados", "Processos que acompanho", "Qualquer movimentação nos processos com estrela."],
    ["bloqueios", "Bloqueios", "Novos bloqueios e levantamentos de valores."],
    ["reclamacoes", "Reclamações constitucionais", "Protocolos e julgamentos no STF."],
    ["relatorios", "Relatórios fixados", "Quando um número de um relatório fixado mudar."],
  ];
  const ToggleRow = ([k, title, desc], last) => (
    <div key={k} className="flex items-center gap-4 py-4" style={{ borderBottom: last ? "none" : `1px solid ${T.hairline}` }}>
      <div className="flex-1">
        <p className="text-[17px]">{title}</p>
        <p className="text-[14px] mt-0.5 leading-snug" style={{ color: T.muted }}>{desc}</p>
      </div>
      <Toggle on={prefs[k]} onChange={() => flip(k)} label={title} />
    </div>
  );

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
        <Faixa bleed={32} onBack={onBack} backLabel="Perfil" titulo="Notificações" sub="Escolha sobre o que quer ser avisada" />

        <SecLabel>Me avise sobre</SecLabel>
        {items.map((it, i) => ToggleRow(it, i === items.length - 1))}

        <SecLabel>Resumo</SecLabel>
        {ToggleRow(["resumo", "Resumo diário", "Um único aviso por dia com tudo o que mudou, em vez de vários."], !prefs.resumo)}
        {prefs.resumo && (
          <div className="flex items-center justify-between py-4">
            <p className="text-[17px]">Horário</p>
            <span className="text-[17px] px-3 py-1.5 rounded-lg" style={{ background: "#FFFFFF", fontVariantNumeric: "tabular-nums" }}>8:00</span>
          </div>
        )}

        <SecLabel>Abrangência</SecLabel>
        {ToggleRow(["firma", "Toda a firma", "Movimentações de todos os 1.245 processos. Pode gerar muitos avisos por dia."], true)}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Guia de estilo: proposta do novo sistema visual                     */
/* Contrastes medidos pela fórmula WCAG 2.1                            */
/* ------------------------------------------------------------------ */
const S = {
  papel: "#F2F3F7", cartao: "#FFFFFF", linha: "#E3E5EA",
  ink: "#111827", texto2: "#4B5563",
  ia: "#765614", iaFundo: "#F2E8D3", iaIcone: "#96763A",
  risco: "#9B2A1C", riscoFundo: "#F7E0DA",
  resolvido: "#24603F", resolvidoFundo: "#DCEEE3",
  atencao: "#835000", atencaoFundo: "#F6E6C6",
  curso: "#245476", cursoFundo: "#DBE7F1",
  inativo: "#4F565B", inativoFundo: "#E5E7E8",
};
const F = {
  display: "'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  ui: "'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  dados: "'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace",
};

const SEMANTICA = [
  { id: "risco", nome: "Risco", uso: "Bloqueio ativo, parado há mais de 90 dias", cor: S.risco, fundo: S.riscoFundo, ratio: "7,7:1", icone: "alerta" },
  { id: "atencao", nome: "Atenção", uso: "Aguardando decisão, vigência perto do fim", cor: S.atencao, fundo: S.atencaoFundo, ratio: "6,7:1", icone: "relogio" },
  { id: "curso", nome: "Em curso", uso: "Em andamento, em execução", cor: S.curso, fundo: S.cursoFundo, ratio: "8,1:1", icone: "seta" },
  { id: "resolvido", nome: "Resolvido", uso: "Valor levantado, decisão favorável", cor: S.resolvido, fundo: S.resolvidoFundo, ratio: "7,4:1", icone: "check" },
  { id: "inativo", nome: "Inativo", uso: "Suspenso, arquivado", cor: S.inativo, fundo: S.inativoFundo, ratio: "7,5:1", icone: "pausa" },
];

function IconeSem({ tipo, cor, size = 15 }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: cor, strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (tipo === "alerta") return <svg {...p}><path d="M12 3 2 20h20Z" /><path d="M12 10v4M12 17h.01" /></svg>;
  if (tipo === "relogio") return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
  if (tipo === "seta") return <svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
  if (tipo === "check") return <svg {...p}><path d="M5 12l5 5 9-11" /></svg>;
  return <svg {...p}><path d="M9 5v14M15 5v14" /></svg>;
}

function Etiqueta({ s, texto, sobreCor }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full shrink-0"
          style={{ background: sobreCor ? "#FFFFFF" : s.fundo, color: s.cor, fontFamily: F.ui, fontSize: 13, fontWeight: 600, padding: "5px 11px 5px 9px" }}>
      <IconeSem tipo={s.icone} cor={s.cor} size={14} />{texto || s.nome}
    </span>
  );
}

function Botao({ variante = "primario", children, onClick, disabled, loading, full = true }) {
  const base = { fontFamily: F.ui, fontSize: 17, fontWeight: 600, height: 50, borderRadius: 14, padding: "0 20px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: full ? "100%" : "auto", transition: "transform .08s ease, background .15s ease" };
  const v = {
    primario: { background: S.ink, color: "#FFFFFF" },
    secundario: { background: S.cartao, color: S.ink, boxShadow: `inset 0 0 0 1.5px ${S.ink}` },
    terciario: { background: "transparent", color: S.ink, textDecoration: "underline", textUnderlineOffset: 4 },
    destrutivo: { background: S.cartao, color: S.risco, boxShadow: `inset 0 0 0 1.5px ${S.risco}` },
    ia: { background: S.iaFundo, color: S.ia },
  }[variante];
  const off = disabled ? { background: "#E5E7E8", color: "#6A7075", boxShadow: "none" } : {};
  return (
    <button onClick={onClick} disabled={disabled || loading} className="guia-btn" style={{ ...base, ...v, ...off }}>
      {loading && <span className="guia-spin" aria-hidden="true" style={{ borderColor: v.color, borderTopColor: "transparent" }} />}
      {children}
    </button>
  );
}

function Secao({ titulo, nota, children }) {
  return (
    <section className="mt-10">
      <h2 style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 24, fontWeight: 500, color: S.ink, lineHeight: 1.15 }}>{titulo}</h2>
      {nota && <p style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2, lineHeight: 1.45, marginTop: 6 }}>{nota}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Cartao({ children, style }) {
  return <div style={{ background: S.cartao, borderRadius: 18, padding: 18, boxShadow: "0 1px 2px rgba(22,32,43,.06), 0 4px 14px rgba(22,32,43,.05)", ...style }}>{children}</div>;
}

function GuiaEstilo({ onBack }) {
  const [filtros, setFiltros] = useState(new Set(["AFNE"]));
  const [toast, setToast] = useState(null);
  const [sheet, setSheet] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const toastTimer = React.useRef(null);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  const mostrarToast = (t) => { setToast(t); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(null), 2600); };
  const toggleFiltro = (f) => setFiltros((p) => { const n = new Set(p); n.has(f) ? n.delete(f) : n.add(f); return n; });

  const rotulo = { fontFamily: F.ui, fontSize: 13, fontWeight: 600, color: S.texto2, letterSpacing: ".01em" };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative" style={{ background: S.papel }}>
      <div className="flex items-center px-6 pt-3 pb-1 shrink-0">
        <button onClick={onBack} aria-label="Voltar" className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: S.cartao }}>
          <BackIcon size={18} color={S.ink} />
        </button>
        <span className="ml-3" style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2 }}>Perfil</span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-3" style={{ paddingBottom: 80 }}>
        <p style={rotulo}>Sistema visual · versão 4</p>
        <h1 style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 34, fontWeight: 500, color: S.ink, lineHeight: 1.08, marginTop: 6, textWrap: "balance" }}>Guia de estilo</h1>
        <p style={{ fontFamily: F.ui, fontSize: 17, color: S.texto2, lineHeight: 1.45, marginTop: 10 }}>
          A base que vai para todas as telas: tipos, cores com significado e componentes. Todos os textos passam de 4,5:1 de contraste.
        </p>

        {/* ---------------- Tipografia ---------------- */}
        <Secao titulo="Tipografia" nota="Uma família só, a Lexend, desenhada para facilitar a leitura. A hierarquia vem do tamanho e do peso. Números de processo usam a fonte de dados.">
          <Cartao>
            <div className="flex flex-col gap-4">
              <div>
                <p style={rotulo}>Título de tela · Lexend 34 seminegrito</p>
                <p style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 34, fontWeight: 500, color: S.ink, lineHeight: 1.1 }}>O que mudou</p>
              </div>
              <div>
                <p style={rotulo}>Valor em destaque · Lexend 40 seminegrito</p>
                <p style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 40, fontWeight: 600, color: S.ink, lineHeight: 1, fontVariantNumeric: "lining-nums tabular-nums" }}>R$ 1.639.000</p>
              </div>
              <div>
                <p style={rotulo}>Subtítulo de seção · Lexend 18 seminegrito</p>
                <p style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 22, fontWeight: 500, color: S.ink }}>Contratos de gestão</p>
              </div>
              <div>
                <p style={rotulo}>Texto de leitura · Lexend 17</p>
                <p style={{ fontFamily: F.ui, fontSize: 17, color: S.ink, lineHeight: 1.45 }}>A liquidação foi homologada e o valor segue bloqueado até a expedição do alvará.</p>
              </div>
              <div>
                <p style={rotulo}>Rótulo · Lexend 15 seminegrito</p>
                <p style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.ink }}>Execução trabalhista em fase de liquidação</p>
              </div>
              <div>
                <p style={rotulo}>Apoio · Lexend 15</p>
                <p style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2 }}>Última movimentação há 3 dias</p>
              </div>
              <div>
                <p style={rotulo}>Dados · IBM Plex Mono 15</p>
                <p style={{ fontFamily: F.dados, fontSize: 15, color: S.ink }}>0260884-61.2023.5.01.0032</p>
              </div>
            </div>
          </Cartao>
        </Secao>

        {/* ---------------- Cores ---------------- */}
        <Secao titulo="Cores com significado" nota="Cada cor quer dizer uma coisa só, e sempre vem com ícone e palavra. O número ao lado é o contraste do texto sobre o cartão branco.">
          <Cartao style={{ padding: 0 }}>
            {SEMANTICA.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3" style={{ padding: "14px 18px", borderTop: i ? `1px solid ${S.linha}` : "none" }}>
                <div className="flex-1 min-w-0">
                  <Etiqueta s={s} />
                  <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 6, lineHeight: 1.35 }}>{s.uso}</p>
                </div>
                <span style={{ fontFamily: F.dados, fontSize: 13, color: S.ink }}>{s.ratio}</span>
              </div>
            ))}
          </Cartao>
          <Cartao style={{ marginTop: 12, background: S.iaFundo, boxShadow: "none" }}>
            <div className="flex items-start gap-3">
              <span className="shrink-0" style={{ marginTop: 1 }}><SparkleIcon size={20} color={S.iaIcone} strokeWidth={1.8} /></span>
              <div>
                <p style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.ia }}>Dourado é só da IA</p>
                <p style={{ fontFamily: F.ui, fontSize: 15, color: S.ink, lineHeight: 1.45, marginTop: 4 }}>Tudo em dourado foi gerado pela IA: resumos, relatórios e a barra de perguntas. Status nunca usa dourado.</p>
              </div>
            </div>
          </Cartao>
          <div className="flex gap-3 mt-3">
            {[["Fundo", S.papel, "cinza-gelo"], ["Cartão", S.cartao, "branco"], ["Texto", S.ink, "17,7:1"], ["Apoio", S.texto2, "7,6:1"]].map(([n, c, d]) => (
              <div key={n} className="flex-1 min-w-0">
                <div style={{ height: 44, borderRadius: 12, background: c, boxShadow: `inset 0 0 0 1px ${S.linha}` }} />
                <p style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 600, color: S.ink, marginTop: 6 }}>{n}</p>
                <p style={{ fontFamily: F.dados, fontSize: 12, color: S.texto2 }}>{d}</p>
              </div>
            ))}
          </div>
        </Secao>

        {/* ---------------- Cartões coloridos ---------------- */}
        <Secao titulo="Cartões coloridos" nota="A cor do cartão sempre quer dizer algo. Branco é o padrão; os outros três aparecem só quando têm motivo.">
          <div className="flex flex-col gap-3">
            <div style={{ background: S.ink, borderRadius: 20, padding: 20, color: "#FFFFFF" }}>
              <p style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: "#C9CED3" }}>Escuro · o número principal da tela</p>
              <p style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 34, fontWeight: 500, marginTop: 4 }}>3 processos</p>
              <p style={{ fontFamily: F.ui, fontSize: 15, color: "#E4E7EA", marginTop: 4 }}>No máximo um por tela.</p>
            </div>
            <div style={{ background: S.riscoFundo, borderRadius: 18, padding: 18 }}>
              <div className="flex items-center justify-between gap-3">
                <p style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.ink }}>Semântico · o cartão é sobre um status</p>
              </div>
              <p style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 28, fontWeight: 500, color: S.ink, marginTop: 6 }}>R$ 62.000</p>
              <div className="mt-2"><Etiqueta s={SEMANTICA[0]} texto="Bloqueio ativo" /></div>
            </div>
            <div style={{ background: S.iaFundo, borderRadius: 18, padding: 18 }}>
              <p className="flex items-center gap-1.5" style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 700, color: S.ia }}>
                <SparkleIcon size={15} color={S.ia} strokeWidth={2} /> Dourado · gerado pela IA
              </p>
              <p style={{ fontFamily: F.ui, fontSize: 16, color: S.ink, marginTop: 6, lineHeight: 1.45 }}>Resumos e conclusões dos relatórios.</p>
            </div>
            <Cartao>
              <p style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.ink }}>Branco · todo o resto</p>
              <p style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2, marginTop: 4 }}>Listas, navegação e dados de apoio.</p>
            </Cartao>
          </div>
        </Secao>

        {/* ---------------- Botões ---------------- */}
        <Secao titulo="Botões" nota="50pt de altura, fáceis de acertar. A hierarquia vem do preenchimento, não da cor.">
          <div className="flex flex-col gap-3">
            <Botao onClick={() => mostrarToast("Processo seguido")}>Seguir processo</Botao>
            <Botao variante="secundario" onClick={() => mostrarToast("Lista aberta")}>Ver todos os bloqueios</Botao>
            <Botao variante="ia" onClick={() => { setCarregando(true); setTimeout(() => setCarregando(false), 2200); }}>
              <SparkleIcon size={17} color={S.ia} strokeWidth={2} /> Resumir com a IA
            </Botao>
            <Botao variante="destrutivo" onClick={() => mostrarToast("Relatório removido da pasta")}>Remover relatório</Botao>
            <div className="flex gap-3">
              <div className="flex-1"><Botao disabled>Desabilitado</Botao></div>
              <div className="flex-1"><Botao loading>Enviando</Botao></div>
            </div>
            <div className="flex justify-center"><Botao variante="terciario" full={false}>Marcar todas como lidas</Botao></div>
          </div>
        </Secao>

        {/* ---------------- Indicadores ---------------- */}
        <Secao titulo="Cartão de indicador" nota="A seta e a cor seguem o significado para o escritório: bloqueio que sobe é ruim, mesmo indo para cima.">
          <div className="grid grid-cols-2 gap-3">
            <Cartao>
              <p style={rotulo}>Bloqueado hoje</p>
              <p style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 26, fontWeight: 500, color: S.ink, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>R$ 350 mil</p>
              <p className="flex items-center gap-1 mt-2" style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 600, color: S.risco }}>
                <span aria-hidden="true">▲</span> 12% no mês
              </p>
            </Cartao>
            <Cartao>
              <p style={rotulo}>Parados há 60 dias</p>
              <p style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 26, fontWeight: 500, color: S.ink, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>14</p>
              <p className="flex items-center gap-1 mt-2" style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 600, color: S.resolvido }}>
                <span aria-hidden="true">▼</span> 3 a menos
              </p>
            </Cartao>
          </div>
        </Secao>

        {/* ---------------- Alerta ---------------- */}
        <Secao titulo="Faixa de alerta" nota="Aparece no topo da tela quando algo pede atenção, sempre com uma ação.">
          <div style={{ background: S.riscoFundo, borderRadius: 16, padding: 16 }} role="status">
            <div className="flex gap-3">
              <IconeSem tipo="alerta" cor={S.risco} size={20} />
              <div className="flex-1">
                <p style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.risco }}>3 processos da AFNE parados há mais de 90 dias</p>
                <button className="mt-2" style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.ink, textDecoration: "underline", textUnderlineOffset: 4 }}>Ver quais são</button>
              </div>
            </div>
          </div>
        </Secao>

        {/* ---------------- Linha de processo ---------------- */}
        <Secao titulo="Linha de processo" nota="Rótulo forte, apoio legível e etiqueta de status alinhada à direita.">
          <Cartao style={{ padding: 0 }}>
            {[
              { c: "AFNE", d: "Execução trabalhista em fase de liquidação", n: "0260884-61.2023.5.01.0032", s: SEMANTICA[2], t: "Em execução" },
              { c: "Instituto Gnosis", d: "Ação cível de cobrança", n: "0817452-33.2024.8.19.0001", s: SEMANTICA[1], t: "Aguardando" },
              { c: "FAS", d: "Mandado de segurança", n: "0042871-90.2025.8.19.0001", s: SEMANTICA[0], t: "Parado 94 dias" },
            ].map((r, i) => (
              <div key={i} style={{ padding: "14px 18px", borderTop: i ? `1px solid ${S.linha}` : "none" }}>
                <div className="flex items-start justify-between gap-3">
                  <p style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink }}>{r.c}</p>
                  <Etiqueta s={r.s} texto={r.t} />
                </div>
                <p style={{ fontFamily: F.ui, fontSize: 15, color: S.ink, marginTop: 2, lineHeight: 1.35 }}>{r.d}</p>
                <p style={{ fontFamily: F.dados, fontSize: 13, color: S.texto2, marginTop: 4 }}>{r.n}</p>
              </div>
            ))}
          </Cartao>
        </Secao>

        {/* ---------------- Chips ---------------- */}
        <Secao titulo="Chips de filtro" nota="Toque para ligar e desligar. O selecionado ganha fundo escuro e marca de check.">
          <div className="flex flex-wrap gap-2">
            {["AFNE", "Instituto Gnosis", "FAS", "IGEDES", "Trabalhista", "Com bloqueio"].map((f) => {
              const on = filtros.has(f);
              return (
                <button key={f} onClick={() => toggleFiltro(f)} aria-pressed={on}
                        className="inline-flex items-center gap-1.5 rounded-full"
                        style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, height: 40, padding: "0 14px", background: on ? S.ink : S.cartao, color: on ? "#FFFFFF" : S.ink, boxShadow: on ? "none" : `inset 0 0 0 1.5px ${S.linha}` }}>
                  {on && <IconeSem tipo="check" cor="#FFFFFF" size={14} />}{f}
                </button>
              );
            })}
          </div>
        </Secao>

        {/* ---------------- Carregamento IA ---------------- */}
        <Secao titulo="Carregamento da IA" nota="No lugar de só escrever Pensando, a tela já mostra o formato do relatório que vai chegar. Toque em Resumir com a IA, lá em Botões, para ver.">
          <Cartao>
            {carregando ? (
              <div aria-live="polite" aria-label="A IA está montando o relatório">
                <div className="guia-skel" style={{ width: "40%", height: 14 }} />
                <div className="guia-skel" style={{ width: "70%", height: 34, marginTop: 10 }} />
                <div className="guia-skel" style={{ width: "100%", height: 90, marginTop: 16 }} />
                <div className="guia-skel" style={{ width: "85%", height: 14, marginTop: 16 }} />
                <div className="guia-skel" style={{ width: "60%", height: 14, marginTop: 8 }} />
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <span className="shrink-0" style={{ marginTop: 2 }}><SparkleIcon size={18} color={S.iaIcone} strokeWidth={1.8} /></span>
                <p style={{ fontFamily: F.ui, fontSize: 16, color: S.ink, lineHeight: 1.45 }}>O pico de bloqueios da AFNE foi em julho, puxado por dois processos trabalhistas.</p>
              </div>
            )}
          </Cartao>
        </Secao>

        {/* ---------------- Sheet e toast ---------------- */}
        <Secao titulo="Painel inferior e aviso" nota="O painel reúne ações sem tirar a sócia da tela. O aviso confirma o que aconteceu e some sozinho.">
          <div className="flex flex-col gap-3">
            <Botao variante="secundario" onClick={() => setSheet(true)}>Abrir painel de filtros</Botao>
            <Botao variante="secundario" onClick={() => mostrarToast("Relatório fixado")}>Mostrar aviso</Botao>
          </div>
        </Secao>
      </div>

      {/* toast */}
      {toast && (
        <div className="absolute left-6 right-6 flex justify-center" style={{ bottom: 36, zIndex: 40 }} role="status" aria-live="polite">
          <div className="guia-toast inline-flex items-center gap-2" style={{ background: S.ink, color: "#FFFFFF", fontFamily: F.ui, fontSize: 16, fontWeight: 600, padding: "13px 18px", borderRadius: 14, boxShadow: "0 8px 24px rgba(22,32,43,.25)" }}>
            <IconeSem tipo="check" cor="#7FD3A4" size={17} />{toast}
          </div>
        </div>
      )}

      {/* bottom sheet */}
      {sheet && (
        <div className="absolute inset-0" style={{ zIndex: 50 }}>
          <button aria-label="Fechar painel" onClick={() => setSheet(false)} className="absolute inset-0" style={{ background: "rgba(22,32,43,.38)" }} />
          <div role="dialog" aria-label="Filtros" className="guia-sheet absolute left-0 right-0 bottom-0" style={{ background: S.cartao, borderRadius: "24px 24px 0 0", padding: "10px 24px 34px" }}>
            <div className="mx-auto" style={{ width: 40, height: 5, borderRadius: 3, background: S.linha }} />
            <h3 style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 24, fontWeight: 500, color: S.ink, marginTop: 14 }}>Filtrar processos</h3>
            <p style={{ ...rotulo, marginTop: 16 }}>Status</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {SEMANTICA.slice(0, 4).map((s) => <Etiqueta key={s.id} s={s} />)}
            </div>
            <p style={{ ...rotulo, marginTop: 18 }}>Ordenar por</p>
            {["Mais parados primeiro", "Maior valor bloqueado", "Movimentação mais recente"].map((o, i) => (
              <label key={o} className="flex items-center justify-between" style={{ padding: "13px 0", borderTop: i ? `1px solid ${S.linha}` : "none", fontFamily: F.ui, fontSize: 17, color: S.ink }}>
                {o}
                <input type="radio" name="ordem" defaultChecked={i === 0} style={{ width: 22, height: 22, accentColor: S.ink }} />
              </label>
            ))}
            <div className="mt-4"><Botao onClick={() => { setSheet(false); mostrarToast("Filtros aplicados"); }}>Aplicar filtros</Botao></div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* App                                                                  */
/* ------------------------------------------------------------------ */
const PINNED_INICIAIS = [
  { id: "pin-gnosis", question: "Quanto o Instituto Gnosis tem bloqueado hoje, e em quais áreas?", spec: relatorioExemploGnosis(), atualizado: "Exemplo calculado da base", pinnedExample: true },
  { id: "pin-parados", question: "Quais processos estão parados há mais de 60 dias?", spec: relatorioExemploParados(), atualizado: "Exemplo calculado da base", pinnedExample: true },
];

export default function AppSociosPrototype() {
  const sample = useSample();
  const abrirGuia = typeof location !== "undefined" && location.hash === "#guia";
  const [tab, setTab] = useState(abrirGuia ? "perfil" : "inicio");
  const [inicioView, setInicioView] = useState("feed");
  const [osView, setOsView] = useState("list");
  const [selectedOrg, setSelectedOrg] = useState("afne");
  const [iaView, setIaView] = useState("ask");
  const [perfilView, setPerfilView] = useState(abrirGuia ? "guia" : "main");

  const [followed, setFollowed] = useState(new Set(["p1", "p2", "p4"]));
  const [selectedProcesso, setSelectedProcesso] = useState(null);
  const [detalheOrigin, setDetalheOrigin] = useState("processos");
  const toggleFollow = (id) => setFollowed((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBloqueio, setSelectedBloqueio] = useState(null);
  const [bloqueioOrigin, setBloqueioOrigin] = useState("bloqueios");

  const [pinned, setPinned] = useState(PINNED_INICIAIS);
  const [job, setJob] = useState(null);
  const ctlRef = React.useRef(null);

  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);
  const [foto, setFotoS] = useState(() => lerPref("foto", null));
  const [apelido, setApelidoS] = useState(() => lerPref("apelido", ""));
  const [escala, setEscalaS] = useState(() => lerPref("escala", 1));
  const [lerVoz, setLerVozS] = useState(() => lerPref("lerVoz", false));
  const [ordem, setOrdemS] = useState(() => { const o = lerPref("ordem", ORG_ORDER); return Array.isArray(o) && o.length === ORG_ORDER.length ? o : ORG_ORDER; });
  const [menuVA, setMenuVA] = useState(false);
  const comPersistencia = (set, chave) => (v) => { set(v); gravarPref(chave, v); };
  const setFoto = comPersistencia(setFotoS, "foto"), setApelido = comPersistencia(setApelidoS, "apelido"),
        setEscala = comPersistencia(setEscalaS, "escala"), setLerVoz = comPersistencia(setLerVozS, "lerVoz"), setOrdem = comPersistencia(setOrdemS, "ordem");
  const unreadCount = notifs.filter((n) => !n.read).length;

  const openProcesso = (item, origin) => { setTab("inicio"); setSelectedProcesso(item); setDetalheOrigin(origin); setInicioView("detalhe"); };
  const openBloqueio = (item, origin) => { setTab("inicio"); setSelectedBloqueio(item); setBloqueioOrigin(origin); setInicioView("bloqueio"); };
  const backLabels = { feed: "Início", processos: "Processos", bloqueios: "Bloqueios", acompanhando: "Acompanhando", busca: "Busca", bloqueio: "Bloqueio", notificacoes: "Notificações" };
  const followedItemsFull = PROCESSOS_LISTA.filter((p) => followed.has(p.id));

  const changeTab = (t) => {
    setTab(t);
    if (t === "inicio") setInicioView("feed");
    if (t === "os") setOsView("list");
    if (t === "ia") setIaView("ask");
    if (t === "perfil") setPerfilView("main");
  };
  const openOrg = (id) => { setSelectedOrg(id); setTab("os"); setOsView("profile"); };

  /* ---- IA ---- */
  const ask = async (question, clienteId = null, extra = {}) => {
    ctlRef.current?.abort();
    const ctl = new AbortController();
    ctlRef.current = ctl;
    const id = "r" + Date.now();
    const base = { id, question, clienteId, status: "thinking", progress: [], spec: null, backLabel: clienteId ? CLIENTE_NOME[clienteId] : "Estatísticas", backTo: clienteId ? "os" : "ia", ...extra };
    setJob(base);
    setTab("ia"); setIaView("report");
    if (!sample) { setJob({ ...base, status: "error", error: "A IA responde quando este app é aberto no Claude.", retryable: false }); return; }
    try {
      const spec = await gerarRelatorio(sample, question, {
        clienteId, signal: ctl.signal,
        onProgress: (p) => setJob((j) => (j && j.id === id ? { ...j, progress: [...j.progress, p] } : j)),
      });
      setJob((j) => (j && j.id === id ? { ...j, status: "done", spec, atualizado: "Gerado agora pela IA" } : j));
      if (extra.pinId) setPinned((ps) => ps.map((p) => (p.id === extra.pinId ? { ...p, spec, atualizado: "Atualizado agora pela IA", pinnedExample: false } : p)));
    } catch (e) {
      if (e?.code === "cancelled") { setJob((j) => (j && j.id === id ? { ...j, status: "error", error: "Você parou esta pergunta.", retryable: true } : j)); return; }
      setJob((j) => (j && j.id === id ? { ...j, status: "error", error: erroTexto(e), retryable: !["not_granted", "sampling_disabled", "tools_unavailable"].includes(e?.code) } : j));
    }
  };

  const openPinned = (p, from = "pasta") => {
    const backs = { pasta: "Relatórios fixados", notificacoes: "Notificações" };
    setJob({ id: p.id, question: p.question, clienteId: p.clienteId || null, status: "done", spec: p.spec, progress: [], atualizado: p.atualizado, pinnedExample: p.pinnedExample, pinId: p.id, backLabel: backs[from], backTo: from });
    setTab("ia"); setIaView("report");
  };
  const jobPinId = job ? (job.pinId || pinned.find((p) => p.sourceJob === job.id)?.id) : null;
  const togglePinJob = () => {
    if (!job) return;
    if (jobPinId) { setPinned((ps) => ps.filter((p) => p.id !== jobPinId)); setJob((j) => ({ ...j, pinId: null })); return; }
    const pin = { id: "pin-" + job.id, sourceJob: job.id, question: job.question, clienteId: job.clienteId, spec: job.spec, atualizado: "Fixado agora" };
    setPinned((ps) => [pin, ...ps]);
    setJob((j) => ({ ...j, pinId: pin.id }));
  };

  const openNotif = (n) => {
    setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    const { kind, id } = n.target;
    if (kind === "processo") openProcesso(PROCESSOS_LISTA.find((p) => p.id === id), "notificacoes");
    if (kind === "bloqueio") openBloqueio(BLOQUEIOS_LISTA.find((b) => b.id === id), "notificacoes");
    if (kind === "report") { const p = pinned.find((x) => x.id === id); if (p) openPinned(p, "notificacoes"); }
    if (kind === "org") openOrg(id);
    if (kind === "acompanhando") setInicioView("acompanhando");
  };

  const tomTopo =
    tab === "ia" ? null :
    tab === "perfil" ? (perfilView === "guia" ? null : "marinho") :
    tab === "os" ? "marinho" :
    inicioView === "busca" ? null :
    inicioView === "detalhe" && selectedProcesso ? tomDeStatus(selectedProcesso.status) :
    inicioView === "bloqueio" && selectedBloqueio ? tomDeStatus(selectedBloqueio.status) :
    "marinho";

  const showTabBar =
    (tab === "inicio" && inicioView === "feed") ||
    (tab === "os" && osView === "list") ||
    (tab === "ia" && iaView === "ask") ||
    (tab === "perfil" && perfilView === "main");

  return (
    <div className="app-stage font-sans-ui">
      <GlobalStyle />
      <div className="app-phone relative flex flex-col overflow-hidden" style={{ background: T.paper, color: T.ink }}>
        <div className="app-island absolute left-1/2 -translate-x-1/2 top-3 w-[110px] h-[30px] rounded-full z-20" style={{ background: T.ink }} />
        <PrefsContext.Provider value={{ lerVoz }}>
        <div className="absolute inset-0 flex flex-col" style={{ zoom: escala }}>
        <StatusBar />

        {tab === "inicio" && inicioView === "feed" && (
          <InicioFeed
            onOpenList={setInicioView}
            onOpenOrg={openOrg}
            followedItems={followedItemsFull}
            onOpenProcesso={openProcesso}
            onOpenAcompanhando={() => setInicioView("acompanhando")}
            onOpenBusca={() => setInicioView("busca")}
            onOpenMenu={() => setMenuVA(true)}
            onPerguntar={() => changeTab("ia")}
            unreadCount={unreadCount}
            foto={foto}
            apelido={apelido}
          />
        )}
        {tab === "inicio" && inicioView === "notificacoes" && (
          <NotificacoesCentral notifs={notifs} onOpen={openNotif}
            onMarkAll={() => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))}
            onBack={() => setInicioView("feed")} />
        )}
        {tab === "inicio" && ["processos", "bloqueios", "reclamacoes"].includes(inicioView) && (
          <ListaGenerica tipo={inicioView} onBack={() => setInicioView("feed")} followed={followed}
                         onOpenProcesso={openProcesso} onOpenBloqueio={openBloqueio} />
        )}
        {tab === "inicio" && inicioView === "busca" && (
          <BuscaGlobal q={searchQuery} setQ={setSearchQuery}
            onBack={() => { setSearchQuery(""); setInicioView("feed"); }}
            onOpenProcesso={(p) => openProcesso(p, "busca")}
            onOpenBloqueio={(b) => openBloqueio(b, "busca")}
            onOpenOrg={openOrg} />
        )}
        {tab === "inicio" && inicioView === "bloqueio" && selectedBloqueio && (
          <BloqueioDetalhe bloqueio={selectedBloqueio} backLabel={backLabels[bloqueioOrigin]}
            onBack={() => setInicioView(bloqueioOrigin)}
            onOpenProcesso={(p) => openProcesso(p, "bloqueio")} />
        )}
        {tab === "inicio" && inicioView === "acompanhando" && (
          <AcompanhandoLista items={followedItemsFull} onOpen={(item) => openProcesso(item, "acompanhando")} onBack={() => setInicioView("feed")} />
        )}
        {tab === "inicio" && inicioView === "detalhe" && selectedProcesso && (
          <ProcessoDetalhe key={selectedProcesso.id} processo={selectedProcesso} sample={sample}
            isFollowing={followed.has(selectedProcesso.id)}
            onToggleFollow={() => toggleFollow(selectedProcesso.id)}
            onBack={() => setInicioView(detalheOrigin)}
            backLabel={backLabels[detalheOrigin]} />
        )}

        {tab === "os" && osView === "list" && <OsLista onOpenOrg={openOrg} ordem={ordem} />}
        {tab === "os" && osView === "profile" && (
          <OsPerfil orgId={selectedOrg} onBack={() => setOsView("list")} sample={sample} onAsk={(q) => ask(q, selectedOrg)} />
        )}

        {tab === "ia" && iaView === "ask" && <IaAsk onAsk={(q) => ask(q)} sample={sample} />}
        {tab === "ia" && iaView === "report" && job && (
          <IaReport job={job} isPinned={!!jobPinId} onTogglePin={togglePinJob}
            onStop={() => ctlRef.current?.abort()}
            onRetry={() => ask(job.question, job.clienteId)}
            onRefresh={sample ? () => ask(job.question, job.clienteId, { pinId: job.pinId }) : null}
            onBack={() => {
              ctlRef.current?.abort();
              if (job.backTo === "os") { setTab("os"); setOsView("profile"); }
              else if (job.backTo === "pasta") { setTab("perfil"); setPerfilView("pasta"); }
              else if (job.backTo === "notificacoes") { setTab("inicio"); setInicioView("notificacoes"); }
              else setIaView("ask");
            }} />
        )}

        {tab === "perfil" && perfilView === "main" && <PerfilUsuaria onOpenNotifPrefs={() => setPerfilView("notif")} onOpenPasta={() => setPerfilView("pasta")} pinnedCount={pinned.length} onOpenGuia={() => setPerfilView("guia")}
            onOpenOrdem={() => setPerfilView("ordem")} foto={foto} setFoto={setFoto} apelido={apelido} setApelido={setApelido}
            escala={escala} setEscala={setEscala} lerVoz={lerVoz} setLerVoz={setLerVoz} />}
        {tab === "perfil" && perfilView === "ordem" && <OrdemClientes ordem={ordem} setOrdem={setOrdem} onBack={() => setPerfilView("main")} />}
        {tab === "perfil" && perfilView === "guia" && <GuiaEstilo onBack={() => setPerfilView("main")} />}
        {tab === "perfil" && perfilView === "pasta" && <PastaRelatorios pinned={pinned} onOpenPinned={(p) => openPinned(p, "pasta")} onBack={() => setPerfilView("main")} />}
        {tab === "perfil" && perfilView === "notif" && <NotifPrefs onBack={() => setPerfilView("main")} />}

        {showTabBar && <TabBar active={tab} onChange={changeTab} />}
        {menuVA && (
          <MenuVA unread={unreadCount} followedCount={followed.size} foto={foto} apelido={apelido} onClose={() => setMenuVA(false)}
            onNotificacoes={() => { setMenuVA(false); setTab("inicio"); setInicioView("notificacoes"); }}
            onAcompanhando={() => { setMenuVA(false); setTab("inicio"); setInicioView("acompanhando"); }}
            onPerfil={() => { setMenuVA(false); changeTab("perfil"); }} />
        )}
        </div>
        </PrefsContext.Provider>
      </div>
    </div>
  );
}
