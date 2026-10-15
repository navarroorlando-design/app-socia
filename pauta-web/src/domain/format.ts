import D from '../data/gerador';

export const fmtK = (v: number) => D.bn(v);
export const fmtK0 = (v: number) => (v ? fmtK(v) : 'R$ 0');
export const fmtR = (v: number) => D.Xt(v);
export const fmtN = (v: number) => Math.round(v).toLocaleString('pt-BR');
export const MESC = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
export const fmtD = (d: Date | null) => (d ? `${d.getDate()} ${MESC[d.getMonth()]}` : '—');
export const fmtDL = (d: Date | null) => (d ? d.toLocaleDateString('pt-BR') : '—');
export const quando = (s: string) => String(s).replace(/^1 meses$/, '1 mês');
export const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;
export const sum = <T,>(l: T[], f: (x: T) => number) => l.reduce((a, x) => a + f(x), 0);
export const mesLongo = (rotulo: string, comAno = true) => D.V12mesLongo(rotulo, comAno);
export const slug = (s: string) =>
  (s || 'grafico').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'grafico';
export function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}
