import type { IconName } from '../../components/Icon';
import { D, PARADO, Se, Tn, bloqAtivo, fe, ti, za, type NavOpts, type View } from '../../domain/base';
import { fmtK, fmtR } from '../../domain/format';

export type Tipo = 'pedido' | 'parado' | 'stf' | 'vig' | 'prog';
export const TIPOS: Record<Tipo, [string, IconName]> = {
  pedido: ['Sem pedido de desbloqueio', 'lock'], parado: ['Parado com bloqueio', 'clock'], stf: ['STF', 'landmark'],
  vig: ['Contrato terminando', 'file'], prog: ['Prognóstico piorou', 'trend'],
};
export interface ItemAtencao { k: Tipo; sev: 1 | 2 | 3; t: string; s: string; v: number; go: [View, NavOpts] }

/* Regras simples sobre a base, ordenadas por gravidade e valor */
export const ATENCAO: ItemAtencao[] = (() => {
  const out: ItemAtencao[] = [];
  for (const b of Tn.filter(x => x.status === 'Ativo')) {
    const dias = D.Lr(b.data, D.Hn), pedido = b.historico.some(h => /pedido de desbloqueio/i.test(h.text));
    if (!pedido && dias >= 15) out.push({ k: 'pedido', sev: b.valorNum >= 100000 ? 3 : 2, t: `${fmtR(b.valorNum)} bloqueados há ${dias} dias, sem pedido de desbloqueio`, s: `${b.cliente} · ${b.contrato}`, v: b.valorNum, go: ['bloqueios', { sel: b.id, aba: 'ativos' }] });
  }
  for (const p of Se) {
    const bl = bloqAtivo(p);
    if (bl > 0 && p.diasParado >= PARADO) out.push({ k: 'parado', sev: 3, t: `Parado há ${p.diasParado} dias com ${fmtK(bl)} bloqueados`, s: `${p.cliente} · ${p.desc}`, v: bl, go: ['processos', { sel: p.id }] });
  }
  for (const r of za) if (r.liminar === 'Pendente') out.push({ k: 'stf', sev: 2, t: `${r.numero}: liminar ainda não apreciada`, s: `${r.cliente} · ${fmtK(r.valorDiscutido)} em discussão`, v: r.valorDiscutido, go: ['reclamacoes', {}] });
  for (const id of ti) for (const c of fe[id].contratos) {
    if (D.Tk(c.vigencia).id === 'atencao') {
      const k = D.Ws(id, c.orgao);
      out.push({ k: 'vig', sev: 1, t: `Contrato com ${c.orgao} termina este ano`, s: `${fe[id].name} · passivo de ${fmtK(k.passivo.total)}`, v: k.passivo.total, go: ['clientes', { cli: id }] });
    }
  }
  for (const p of Se) if (p.prognosticoAntes && p.prognostico === 'Provável') out.push({ k: 'prog', sev: 2, t: `Prognóstico passou de ${p.prognosticoAntes.era.toLowerCase()} para provável`, s: `${p.cliente} · ${p.desc}`, v: p.valorCausa, go: ['processos', { sel: p.id }] });
  return out.sort((a, b) => b.sev - a.sev || b.v - a.v);
})();

