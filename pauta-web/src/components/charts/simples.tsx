import { MONEY } from '../../domain/base';
import { fmtR } from '../../domain/format';

export interface LinhaBarra { label: string; value?: number; total?: number; vals?: number[]; color?: string }

/* Barras horizontais; com `parts`, cada linha se divide nas cores de `colors` */
export function HBars({ rows, fmt, parts, colors = [] }: { rows: LinhaBarra[]; fmt: (v: number) => string; parts?: boolean; colors?: string[] }) {
  const max = Math.max(1, ...rows.map(r => r.total ?? r.value ?? 0));
  return (
    <div className="hb">
      {rows.map((r, i) => {
        const tot = r.total ?? r.value ?? 0;
        return (
          <div className="hb-r" key={r.label + i}>
            <span className="l" title={r.label}>{r.label}</span>
            <span className="hb-t">
              {parts && r.vals
                ? r.vals.map((v, k) => (v > 0 ? <i key={k} style={{ width: (v / max) * 100 + '%', background: colors[k], animationDelay: i * 50 + 'ms' }} /> : null))
                : <i style={{ width: (tot / max) * 100 + '%', background: r.color || 'var(--c1)', animationDelay: i * 50 + 'ms' }} />}
            </span>
            <span className="v">{fmt(tot)}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Legend({ items }: { items: [string, string][] }) {
  return (
    <div className="lg">
      {items.map(([l, c]) => <span key={l}><i style={{ background: c }} />{l}</span>)}
    </div>
  );
}

/* Uma barra só: devolvido, perdido e o que segue bloqueado */
export function MoneyBar({ devolvido = 0, perdido = 0, bloqueado = 0, big }: { devolvido?: number; perdido?: number; bloqueado?: number; big?: boolean }) {
  const t = devolvido + perdido + bloqueado || 1;
  const partes: [number, string][] = [[devolvido, MONEY.devolvido], [perdido, MONEY.perdido], [bloqueado, MONEY.bloqueado]];
  return (
    <div className={'money' + (big ? ' lg2' : '')} role="img" aria-label={`Devolvido ${fmtR(devolvido)}, perdido ${fmtR(perdido)}, ainda bloqueado ${fmtR(bloqueado)}`}>
      {partes.map(([v, c], k) => (v > 0 ? <i key={k} style={{ width: (v / t) * 100 + '%', background: c, animationDelay: k * 100 + 'ms' }} /> : null))}
    </div>
  );
}
