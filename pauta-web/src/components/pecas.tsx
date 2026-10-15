import type { EstadoBloqueio, Prognostico, Reclamacao } from '../data/types';
import { Hn, ST_B } from '../domain/base';
import { etapasRcl } from '../domain/reclamacoes';

/* Estado de um bloqueio: ponto + palavra */
export const St = ({ k }: { k: EstadoBloqueio }) => <span className={'st ' + ST_B[k][0]}>{ST_B[k][1]}</span>;

export const Prog = ({ p }: { p: Prognostico }) => <span className={'prog ' + p}>{p}</span>;

export interface ItemLinha { date: string; text: string; tone?: string }
export function Timeline({ items }: { items: ItemLinha[] }) {
  return (
    <ul className="tl">
      {items.map((m, i) => (
        <li key={i} className={m.tone || ''}><time>{m.date}</time><span className="d" /><span>{m.text}</span></li>
      ))}
    </ul>
  );
}

/* Vigência do contrato de gestão com a marca de hoje */
export function Vigencia({ vig }: { vig: string }) {
  const [a, b] = String(vig).split('–').map(Number);
  const ini = new Date(a, 0, 1), fim = new Date(b, 11, 31);
  const pct = Math.max(0, Math.min(1, (+Hn - +ini) / (+fim - +ini)));
  const enc = Hn > fim;
  return (
    <div className="vig" role="img" aria-label={`Vigência de ${a} a ${b}. ${enc ? 'Encerrada' : Math.round(pct * 100) + '% decorrido'}`}>
      <div className="vig-t"><i style={{ width: pct * 100 + '%' }} />{enc ? null : <b style={{ left: pct * 100 + '%' }} />}</div>
      <div className="vig-l"><span>{a}</span>{enc ? <span>Encerrada em {b}</span> : <span>Hoje · {Math.round(pct * 100)}% do prazo</span>}<span>{b}</span></div>
    </div>
  );
}

export function Etapas({ r }: { r: Reclamacao }) {
  return (
    <ol className="steps-h" aria-label="Etapas">
      {etapasRcl(r).map((s, i) => (
        <li key={i} className={s.ok ? 'ok' : s.atual ? 'now' : s.pulou ? 'skip' : ''}><i /><span>{s.l}</span></li>
      ))}
    </ol>
  );
}

export function Check({ on, label, onClick }: { on: boolean; label: string; onClick?: () => void }) {
  return (
    <button className="cb" role="checkbox" aria-checked={on} aria-label={label} onClick={onClick}>
      {on ? (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
      ) : null}
    </button>
  );
}
