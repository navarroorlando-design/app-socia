import D from '../data/gerador';
import type { Area, Bloqueio, ClienteId, EstadoBloqueio, Processo, Prognostico } from '../data/types';
import { fmtR, sum } from './format';

export { D };
export const { Hn, Se, Tn, fe, ti, di, za, $o, ir } = D;

export const DIA = 864e5;
export const PARADO = 90;
export const AREAS: Area[] = ['Trabalhista', 'Cível', 'Administrativo', 'Constitucional'];
export const AREA_COR: Record<Area, string> = { Trabalhista: 'var(--c1)', 'Cível': 'var(--c2)', Administrativo: 'var(--c3)', Constitucional: 'var(--ink-4)' };
export const PROGS: Prognostico[] = ['Provável', 'Possível', 'Remoto'];
export const PROG_COR: Record<string, string> = { 'Provável': 'var(--p-prov)', 'Possível': 'var(--p-poss)', 'Remoto': 'var(--p-rem)' };
export type ParteDinheiro = 'bloqueado' | 'devolvido' | 'perdido';
export const MONEY: Record<ParteDinheiro, string> = { bloqueado: 'var(--m-bloq)', devolvido: 'var(--m-dev)', perdido: 'var(--m-per)' };

export const procById = (id: string) => Se.find(p => p.id === id) as Processo;
export const procByNum = (n: string) => Se.find(p => p.numero === n) || Se.find(p => !!n && p.numero.includes(String(n).trim()));
export const bloqDe = (p: Processo) => Tn.filter(b => b.processoId === p.id);
export const bloqAtivo = (p: Processo) => sum(bloqDe(p).filter(b => b.status === 'Ativo'), b => b.valorNum);
export const hojeB = (b: Bloqueio) => (b.status === 'Ativo' ? b.valorNum : 0);
export const stB = (b: Bloqueio): EstadoBloqueio => D.H1(b, procById(b.processoId));
export const ST_B: Record<EstadoBloqueio, [string, string]> = {
  novo: ['info', 'Novo'], ativo: ['bloq', 'Bloqueado'], parado: ['warn', 'Bloqueado · parado'],
  levantado: ['good', 'Devolvido'], perdido: ['bad', 'Perdido'], parcial: ['warn', 'Devolvido em parte'],
};
export const passivoTotal = sum(Se, p => p.valorCausa);
export const MAXDIAS = Math.max(...Se.map(p => p.diasParado));
export const toneDe = (t: string) =>
  /perdid|credor/i.test(t) ? 'bad' : /liberad|levantad|devolv|deferid|procedente/i.test(t) ? 'good' : /bloqueio/i.test(t) ? 'warn' : '';

/* Telas e o que cada uma recebe ao ser aberta */
export type View = 'painel' | 'processos' | 'bloqueios' | 'clientes' | 'reclamacoes' | 'desempenho' | 'ia' | 'componentes';
export interface NavOpts { sel?: string; cli?: ClienteId; aba?: string; parados?: boolean }
export type Go = (view: View, opts?: NavOpts) => void;

/* Novidades dos últimos 7 dias da base */
export const CORTE = new Date(Hn.getTime() - 7 * DIA);
export type Tom = 'bloq' | 'good' | 'bad' | 'info' | 'ai';
export interface Novidade { d: Date; tone: Tom; t: string; s: string; go: [View, NavOpts] }
export const NOVIDADES: Novidade[] = (() => {
  const out: Novidade[] = [];
  for (const b of Tn) {
    if (b.data >= CORTE) out.push({ d: b.data, tone: 'bloq', t: `Novo bloqueio de ${fmtR(b.original)}`, s: `${b.cliente} · ${b.contrato}`, go: ['bloqueios', { sel: b.id, aba: 'todos' }] });
    if (b.devolvidoEm && b.devolvidoEm >= CORTE) out.push({ d: b.devolvidoEm, tone: 'good', t: `${fmtR(b.devolvido)} devolvidos ao cliente`, s: `${b.cliente} · ${b.contrato}`, go: ['bloqueios', { sel: b.id, aba: 'todos' }] });
    if (b.perdidoEm && b.perdidoEm >= CORTE) out.push({ d: b.perdidoEm, tone: 'bad', t: `${fmtR(b.perdido)} transferidos ao credor`, s: `${b.cliente} · ${b.contrato}`, go: ['bloqueios', { sel: b.id, aba: 'perda' }] });
  }
  for (const p of Se) if (p.ultimaMov >= CORTE && p.movs[0]) out.push({ d: p.ultimaMov, tone: 'info', t: p.movs[0].text, s: `${p.cliente} · ${p.desc}`, go: ['processos', { sel: p.id }] });
  for (const r of za) for (const [dt, tx] of r.movs) {
    const d = D.V12data(dt);
    if (d >= CORTE) out.push({ d, tone: 'ai', t: `${r.numero} · ${tx}`, s: r.cliente, go: ['reclamacoes', {}] });
  }
  return out.sort((a, b) => +b.d - +a.d);
})();
