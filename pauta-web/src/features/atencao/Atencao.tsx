import { useState } from 'react';
import { Icon } from '../../components/Icon';
import type { Go } from '../../domain/base';
import { TIPOS, type ItemAtencao, type Tipo } from './regras';

const NIVEL = ['', 'Baixa', 'Média', 'Alta'];

export function Atencao({ go, itens, max = 6 }: { go: Go; itens: ItemAtencao[]; max?: number }) {
  const [f, setF] = useState<Tipo | null>(null);
  const tipos = (Object.keys(TIPOS) as Tipo[]).filter(k => itens.some(a => a.k === k));
  const lista = itens.filter(a => !f || a.k === f);
  return (
    <div className="att">
      <div className="att-f" role="group" aria-label="Filtrar por tipo">
        <button aria-pressed={!f} onClick={() => setF(null)}>Tudo <span>{itens.length}</span></button>
        {tipos.map(k => (
          <button key={k} aria-pressed={f === k} onClick={() => setF(f === k ? null : k)}>{TIPOS[k][0]} <span>{itens.filter(a => a.k === k).length}</span></button>
        ))}
      </div>
      <ol className="att-l">
        {lista.slice(0, max).map((a, i) => (
          <li key={a.k + i}>
            <button className="att-i" onClick={() => go(...a.go)} style={{ animationDelay: i * 40 + 'ms' }}>
              <span className={'sev s' + a.sev} aria-label={NIVEL[a.sev] + ' prioridade'}><i /><i /><i /></span>
              <span className="att-ic"><Icon n={TIPOS[a.k][1]} s={15} /></span>
              <span className="att-t"><b>{a.t}</b><small>{a.s}</small></span>
              <span className="att-a">Abrir <Icon n="right" s={13} /></span>
            </button>
          </li>
        ))}
      </ol>
      {lista.length > max ? <p className="cnt" style={{ margin: '10px 0 0' }}>Mais {lista.length - max} itens com esse filtro.</p> : null}
      {!lista.length ? <p className="empty">Nada pedindo atenção com esse filtro.</p> : null}
    </div>
  );
}
