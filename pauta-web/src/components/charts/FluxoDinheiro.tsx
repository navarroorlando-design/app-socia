import { useState } from 'react';
import { useW } from '../../lib/useW';
import { MONEY, type ParteDinheiro } from '../../domain/base';
import { fmtK, fmtR } from '../../domain/format';

interface Faixa { k: ParteDinheiro; l: string; v: number; s: string; ly: number; lh: number; ry: number; rh: number; ty: number }

/* Fluxo do dinheiro: tudo o que foi bloqueado se divide no que segue bloqueado, no que voltou e no que foi perdido */
export function FluxoDinheiro({ dev, per, hoje, h = 230, titulo = 'Bloqueado em 2026' }: { dev: number; per: number; hoje: number; h?: number; titulo?: string }) {
  const [ref, W] = useW(720);
  const [hov, setHov] = useState<ParteDinheiro | null>(null);
  const tot = dev + per + hoje || 1;
  const nodeW = 10, gap = 18, top = 4, H = h - 8;
  const labW = Math.min(250, W * 0.38), rightX = W - labW - nodeW;
  const partes = ([
    ['bloqueado', 'Ainda bloqueado', hoje, 'nas contas dos contratos'],
    ['devolvido', 'Devolvido aos clientes', dev, 'liberado por decisão judicial'],
    ['perdido', 'Perdido', per, 'transferido a credores'],
  ] as [ParteDinheiro, string, number, string][]).filter(p => p[2] > 0);
  const avail = H - gap * (partes.length - 1);
  let ly = top, ry = top, last = -99;
  const faixas: Faixa[] = partes.map(([k, l, v, s]) => {
    const lh = (v / tot) * H, rh = Math.max(4, (v / tot) * avail);
    const f = { k, l, v, s, ly, lh, ry, rh, ty: 0 };
    ly += lh; ry += rh + gap;
    return f;
  });
  // rótulos com espaço mínimo entre si
  faixas.forEach(f => { f.ty = Math.max(f.ry + f.rh / 2, last + 72); last = f.ty; });
  const hh = Math.max(h, last + 36);
  const mid = (nodeW + rightX) / 2;
  const desc = `${titulo}: ${fmtR(tot)}. ` + faixas.map(f => `${f.l} ${fmtR(f.v)}`).join(', ');
  return (
    <div ref={ref} className="flow">
      <svg className="svgc" width={W} height={hh} viewBox={`0 0 ${W} ${hh}`} role="img" aria-label={desc} onMouseLeave={() => setHov(null)}>
        <rect x="0" y={top} width={nodeW} height={H} rx="2" fill="var(--ink)" />
        {faixas.map((f, i) => (
          <g key={f.k} onMouseEnter={() => setHov(f.k)}>
            <path className="band" style={{ animationDelay: i * 120 + 'ms', opacity: hov && hov !== f.k ? 0.18 : 0.32 }} fill={MONEY[f.k]}
              d={`M${nodeW},${f.ly} C${mid},${f.ly} ${mid},${f.ry} ${rightX},${f.ry} L${rightX},${f.ry + f.rh} C${mid},${f.ry + f.rh} ${mid},${f.ly + f.lh} ${nodeW},${f.ly + f.lh} Z`} />
            <rect x={rightX} y={f.ry} width={nodeW} height={f.rh} rx="2" fill={MONEY[f.k]} />
            <g transform={`translate(${rightX + nodeW + 16},${f.ty})`} style={{ opacity: hov && hov !== f.k ? 0.45 : 1, transition: 'opacity .2s' }}>
              <text y="-14" fontSize="12.5" fill="var(--ink-2)">{f.l}</text>
              <text y="10" fontSize="22" fill="var(--ink)" style={{ fontFamily: 'var(--serif)', fontVariantNumeric: 'lining-nums tabular-nums' }}>{fmtK(f.v)}</text>
              <text y="28" fontSize="12" fill="var(--ink-3)">{Math.round((f.v / tot) * 100)}% · {f.s}</text>
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
