import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis } from 'recharts';
import { ChartContainer, type ChartConfig } from '../ui/chart';
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

interface TotalLabelProps { x?: number | string; y?: number | string; width?: number | string; index?: number }

/* Barras empilhadas por categoria, com Recharts: hover/clique numa barra seleciona a leitura abaixo do gráfico */
export function StackBars({ cats, series, fmt, h = 220, sel = null, onSel, label }: Props) {
  const data = cats.map((c, i) => ({
    cat: c,
    tot: sum(series, s => s.vals[i] || 0),
    ...Object.fromEntries(series.map(s => [s.label, s.vals[i] || 0])),
  }));
  const config: ChartConfig = Object.fromEntries(series.map(s => [s.label, { label: s.label, color: s.color }]));

  const totalLabel = ({ x, y, width, index }: TotalLabelProps) => {
    if (index == null) return undefined;
    const tot = data[index].tot;
    if (!tot) return undefined;
    return (
      <text
        x={Number(x ?? 0) + Number(width ?? 0) / 2}
        y={Number(y ?? 0) - 8}
        textAnchor="middle"
        fontSize={11}
        fill={sel === index ? 'var(--ink)' : 'var(--ink-3)'}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {fmt(tot)}
      </text>
    );
  };

  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height: h }} role="img" aria-label={label}>
      <BarChart data={data} margin={{ top: 22, right: 4, bottom: 4, left: 4 }}>
        <CartesianGrid vertical={false} strokeDasharray="2 4" stroke="var(--line)" />
        <XAxis dataKey="cat" tickLine={false} axisLine={false} tickMargin={10} fontSize={11.5} tick={{ fill: 'var(--ink-3)' }} />
        {series.map((s, k) => (
          <Bar
            key={s.label}
            dataKey={s.label}
            stackId="v"
            fill={s.color}
            maxBarSize={34}
            radius={k === series.length - 1 ? [1.5, 1.5, 0, 0] : 0}
            onMouseEnter={(_, i) => onSel?.(i)}
            onClick={(_, i) => onSel?.(i)}
          >
            {data.map((_, i) => (
              <Cell key={i} fillOpacity={sel == null || sel === i ? 1 : 0.35} style={{ transition: 'opacity .2s' }} />
            ))}
            {k === series.length - 1 ? <LabelList dataKey={s.label} content={totalLabel} /> : null}
          </Bar>
        ))}
      </BarChart>
    </ChartContainer>
  );
}
