
/* ------------------------------------------------------------------ */
/* Base de exemplo (gerada de forma determinística)                    */
/* Em produção isso viria da camada de métricas (Legal One + Log de    */
/* Bloqueios). A IA nunca calcula números sozinha: ela chama as        */
/* funções de consulta abaixo e só monta a apresentação.               */
/* ------------------------------------------------------------------ */
const HOJE = new Date(2026, 9, 6);

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

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

function norm(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export { HOJE, MESES, diasEntre, fmtBRL, fmtBRLCurto, fmtData, norm, tempoRelativo };
