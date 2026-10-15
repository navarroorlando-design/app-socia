import { useW } from '../../lib/useW';
import { sum } from '../../domain/format';

export interface Serie { label: string; color: string; vals: (number | null)[] }

interface Props {
  cats: string[];
  series: Serie[];
  fmt: (v: number) => string;
  h?: number;
  sel?: number | null;
  onSel?: (i: number) => void;
  label: string;
}

/* Barras empilhadas por categoria; o valor total fica acima de cada barra */
export function StackBars({ cats, series, fmt, h = 220, sel = null, onSel, label }: Props) {
  const [ref, W] = useW();
  const top = 22, base = h - 26, n = cats.length;
  const tot = cats.map((_, i) => sum(series, s => s.vals[i] || 0));
  const max = Math.max(1, ...tot) * 1.1;
  const slot = W / n, bw = Math.min(34, slot * 0.5), sc = (base - top) / max;
  return (
    <div ref={ref}>
      <svg className="svgc" width={W} height={h} viewBox={`0 0 ${W} ${h}`} role="img" aria-label={label}>
        {[0, 0.5, 1].map((f, k) => {
          const y = base - (max / 1.1) * f * sc;
          return <line key={k} x1="0" x2={W} y1={y} y2={y} stroke="var(--line)" strokeDasharray={k ? '2 4' : undefined} />;
        })}
        {cats.map((c, i) => {
          let y = base;
          const x = i * slot + (slot - bw) / 2;
          const dim = sel != null && sel !== i;
          return (
            <g key={c} className="hit" onMouseEnter={() => onSel?.(i)} onClick={() => onSel?.(i)}>
              <rect x={i * slot} y="0" width={slot} height={base} fill="transparent" />
              <g className="bgrp" style={{ animationDelay: i * 40 + 'ms', opacity: dim ? 0.35 : 1, transition: 'opacity .2s' }}>
                {series.map((s, k) => {
                  const v = s.vals[i] || 0, hh = v * sc;
                  if (hh < 0.5) return null;
                  y -= hh;
                  return <rect key={k} x={x} y={y + 0.75} width={bw} height={Math.max(0, hh - 1.5)} rx="1.5" fill={s.color} />;
                })}
              </g>
              {tot[i] ? (
                <text x={x + bw / 2} y={base - tot[i] * sc - 8} textAnchor="middle" fontSize="11" fill={sel === i ? 'var(--ink)' : 'var(--ink-3)'} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {fmt(tot[i])}
                </text>
              ) : null}
              <text x={x + bw / 2} y={h - 6} textAnchor="middle" fontSize="11.5" fill={sel === i ? 'var(--ink)' : 'var(--ink-3)'}>{c}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
