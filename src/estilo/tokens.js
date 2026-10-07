
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

const STATUS_SEM_ID = {
  "Em andamento": "curso", "Em execução": "curso", "Aguardando decisão": "atencao", "Suspenso": "inativo",
  "Julgada": "resolvido", "Levantado": "resolvido", "Ativo": "risco",
};

const semDe = (status) => SEMANTICA.find((x) => x.id === (STATUS_SEM_ID[status] || "inativo"));

const CARD = { background: "#FFFFFF", borderRadius: 18, boxShadow: "0 1px 2px rgba(22,32,43,.06), 0 4px 14px rgba(22,32,43,.05)" };

const LINK = { color: "#111827", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 4 };

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
  marca: "#1E3A5F", marcaTexto2: "#D3DCE8", marcaTrilho: "rgba(255,255,255,.18)",
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

export { CARD, F, LINK, S, SEMANTICA, T, TONS, semDe, tomDeStatus };
