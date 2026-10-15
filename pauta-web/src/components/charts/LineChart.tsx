import { useW } from '../../lib/useW';
import type { Serie } from './StackBars';

interface Props {
  cats: string[];
  lines: Serie[];
  fmt: (v: number) => string;
  h?: number;
  sel?: number | null;
  onSel?: (i: number | null) => void;
  label: string;
  area?: boolean;
}

/* Linha por mês; meses sem dado viram lacuna, nunca zero */
export function LineChart({ cats, lines, fmt, h = 210, sel = null, onSel, label, area = true }: Props) {
  const [ref, W] = useW();
  const top = 16, base = h - 26, n = cats.length, pad = 14, padL = 52;
  const all = lines.flatMap(l => l.vals.filter((v): v is number => v != null));
  const mx = Math.max(1, ...all), mn = Math.min(0, ...all);
  const sc = (base - top) / ((mx - mn) * 1.06 || 1);
  const X = (i: number) => padL + (n === 1 ? (W - padL - pad) / 2 : (i * (W - padL - pad)) / (n - 1));
  const Y = (v: number) => base - (v - mn) * sc;
  const path = (vals: (number | null)[]) => {
    let d = '', pen = false;
    vals.forEach((v, i) => {
      if (v == null) { pen = false; return; }
      d += (pen ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1);
      pen = true;
    });
    return d;
  };
  const last = lines[0] ? lines[0].vals.length - 1 : 0;
  return (
    <div ref={ref}>
      <svg className="svgc" width={W} height={h} viewBox={`0 0 ${W} ${h}`} role="img" aria-label={label} onMouseLeave={() => onSel?.(null)}>
        {[0, 0.5, 1].map((f, k) => {
          const t = mn + (mx - mn) * f;
          return (
            <g key={k}>
              <line x1={padL} x2={W} y1={Y(t)} y2={Y(t)} stroke="var(--line)" strokeDasharray={k ? '2 4' : undefined} />
              <text x="0" y={Y(t) + 4} fontSize="11" fill="var(--ink-3)" style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(t)}</text>
            </g>
          );
        })}
        {lines.map((l, k) => (
          <g key={k}>
            {area && lines.length === 1 ? <path d={path(l.vals) + ` L${X(n - 1)} ${base} L${X(0)} ${base} Z`} fill={l.color} fillOpacity=".06" className="ribbon" /> : null}
            <path d={path(l.vals)} fill="none" stroke={l.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" pathLength={1} className="draw" />
            {l.vals.map((v, i) => {
              if (v == null || (sel !== i && i !== last)) return null;
              const fim = i === last && sel == null;
              return <circle key={i} cx={X(i)} cy={Y(v)} r="3.5" fill={fim ? 'var(--ai)' : 'var(--surface)'} stroke={fim ? 'var(--ai)' : l.color} strokeWidth="1.6" />;
            })}
          </g>
        ))}
        {sel != null ? <line x1={X(sel)} x2={X(sel)} y1={top - 4} y2={base} stroke="var(--line-3)" /> : null}
        {cats.map((c, i) => (
          <g key={i}>
            <rect className="hit" x={X(i) - W / n / 2} y="0" width={W / n} height={base} fill="transparent" onMouseEnter={() => onSel?.(i)} />
            <text x={X(i)} y={h - 6} textAnchor="middle" fontSize="11.5" fill={sel === i ? 'var(--ink)' : 'var(--ink-3)'}>{c}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
