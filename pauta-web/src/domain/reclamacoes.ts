import type { Reclamacao } from '../data/types';

/* Etapas de uma reclamação constitucional, deduzidas do andamento */
export function etapasRcl(r: Reclamacao) {
  const t = r.movs.map(m => m[1].toLowerCase()).join(' | ');
  const st = [
    { l: 'Protocolada', ok: /protocolada/.test(t) },
    { l: 'Informações', ok: /informaç/.test(t) },
    { l: 'Liminar', ok: r.liminar === 'Deferida' },
    { l: r.status === 'Julgada' ? 'Julgada' : 'Julgamento', ok: r.status === 'Julgada' },
  ];
  const lastOk = st.map(s => s.ok).lastIndexOf(true);
  return st.map((s, i) => ({ ...s, pulou: !s.ok && i < lastOk, atual: !s.ok && i === lastOk + 1 }));
}
