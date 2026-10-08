
/* ------------------------------------------------------------------ */
/* Tokens visuais compartilhados por todas as telas                    */
/* ------------------------------------------------------------------ */
const T = {
  ink: "#1A1916",
  paper: "#F2EFE9",
  brass: "#765614",
  slate: "#245476",
  hairline: "#E6E1D6",
  muted: "#57544C",
  brick: "#9B2A1C",
};

const STATUS_SEM_ID = {
  "Em andamento": "curso", "Em execução": "curso", "Aguardando decisão": "atencao", "Suspenso": "inativo",
  "Julgada": "resolvido", "Levantado": "resolvido",
  // Bloqueio ativo comum (redesenho v3, Passo 5): cinza. "Novo" e "Parado" são status visuais à
  // parte, calculados por statusVisualBloqueio (src/dados/criterios.js), não por este mapa.
  "Ativo": "inativo",
};

const semDe = (status) => SEMANTICA.find((x) => x.id === (STATUS_SEM_ID[status] || "inativo"));

const CARD = { background: "#FFFDF9", borderRadius: 24, boxShadow: "0 1px 2px rgba(40,34,24,.06), 0 4px 14px rgba(40,34,24,.05)" };

const LINK = { color: "#1A1916", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 4 };

/* ------------------------------------------------------------------ */
/* Faixa do topo: título ancorado numa faixa de cor                    */
/* ------------------------------------------------------------------ */
const TONS = {
  marinho:   { a: "#1F1E1A", b: "#14243A", sub: "#D8CFBC" },
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
  papel: "#F2EFE9", cartao: "#FFFDF9", linha: "#E6E1D6",
  ink: "#1A1916", texto2: "#57544C",
  ia: "#765614", iaFundo: "#F2E8D3", iaIcone: "#96763A",
  // Cores do redesenho v3 (docs/redesign-v3): risco/vermelho significa só "novo" (bloqueio dos
  // últimos 7 dias) e o badge de avisos — nunca "ativo comum" (isso é inativo/cinza).
  risco: "#B42318", riscoFundo: "#FBEAE8",
  resolvido: "#2F7A4D", resolvidoFundo: "#E6F2EA",
  atencao: "#865708", atencaoFundo: "#F4E4C2",
  curso: "#1F4E8C", cursoFundo: "#E8EFF8",
  inativo: "#5E5A53", inativoFundo: "#E7E3DB",
  marca: "#1F1E1A", marcaTexto2: "#D8CFBC", marcaTrilho: "rgba(255,255,255,.18)",
  oliva: "#565449", osso: "#D8CFBC", ossoTexto2: "#4A473F",
  dourado: "#E8C27A", // âmbar sobre fundo escuro: link "N parados" no topo, filtro ativo, card selecionado
};

/* Paleta de dados do redesenho v3: só para gráficos e barras de dados (prognóstico, resultado dos
   processos), sempre com legenda ao lado — nunca como cor de status isolada nem como texto solto.
   Fica separada de `S` de propósito, para não se confundir com "cor com significado" da interface. */
const DADOS = {
  prov: "#C0472F", poss: "#CC9433", rem: "#8E99A5",         // prognóstico: Provável, Possível, Remoto
  fav: "#4A946A", aco: "#CC9433", desf: "#C0472F",          // desempenho: Favorável, Acordo, Desfavorável
  novos: "#2D5B87", enc: "#B5AEA2",                         // novos x encerrados (Desempenho)
  grade: "#ECE7DD", base: "#CFC8BB", eixo: "#8F897F", rotuloAno: "#AAA397", // eixos e grade dos gráficos
};

const F = {
  display: "'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  // Títulos grandes (saudação, título das telas). A variável permite testar outra fonte sem rebuild.
  titulo: "var(--fonte-titulo, 'Lexend'), Georgia, 'Times New Roman', serif",
  ui: "'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  dados: "'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace",
};

const SEMANTICA = [
  { id: "risco", nome: "Risco", uso: "Novo (bloqueio dos últimos 7 dias), badge de avisos", cor: S.risco, fundo: S.riscoFundo, ratio: "5,7:1", icone: "alerta" },
  { id: "atencao", nome: "Atenção", uso: "Aguardando decisão, parado há mais de 90 dias, vence este ano, delta negativo", cor: S.atencao, fundo: S.atencaoFundo, ratio: "5,4:1", icone: "relogio" },
  { id: "curso", nome: "Em curso", uso: "Em andamento, em execução, seguindo, vigente", cor: S.curso, fundo: S.cursoFundo, ratio: "7,2:1", icone: "seta" },
  { id: "resolvido", nome: "Resolvido", uso: "Valor levantado, decisão favorável", cor: S.resolvido, fundo: S.resolvidoFundo, ratio: "4,6:1", icone: "check" },
  { id: "inativo", nome: "Inativo", uso: "Suspenso, arquivado, ativo comum, encerrado", cor: S.inativo, fundo: S.inativoFundo, ratio: "6,0:1", icone: "pausa" },
];

export { CARD, DADOS, F, LINK, S, SEMANTICA, T, TONS, semDe, tomDeStatus };
