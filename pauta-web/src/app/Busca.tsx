import { useEffect, useRef, useState } from 'react';
import { Icon, type IconName } from '../components/Icon';
import { Se, fe, ti, za, type Go, type NavOpts, type View } from '../domain/base';
import { NAV } from './nav';

interface Item { g: string; t: string; s: string; ic: IconName; mono?: boolean; go?: [View, NavOpts]; ia?: string }

/* Busca rápida (⌘K): telas, clientes, reclamações, processos ou uma pergunta ao assistente */
export function Busca({ onClose, go, perguntar }: { onClose: () => void; go: Go; perguntar: (q: string) => void }) {
  const [q, setQ] = useState('');
  const [i, setI] = useState(0);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const f = q.trim().toLowerCase();
  const itens: Item[] = [
    ...(!f ? NAV.map(([k, l, ic]) => ({ g: 'Ir para', t: l, s: '', ic, go: [k, {}] as [View, NavOpts] })) : []),
    ...ti.filter(id => f && fe[id].name.toLowerCase().includes(f)).map(id => ({ g: 'Clientes', t: fe[id].name, s: `${fe[id].contratos.length} contratos · ${fe[id].bloqueado} bloqueado`, ic: 'building' as IconName, go: ['clientes', { cli: id }] as [View, NavOpts] })),
    ...za.filter(r => f && (r.numero + r.cliente + r.assunto).toLowerCase().includes(f)).map(r => ({ g: 'Reclamações', t: r.numero, s: r.assunto, ic: 'landmark' as IconName, go: ['reclamacoes', {}] as [View, NavOpts] })),
    ...Se.filter(p => f && (p.numero + p.desc + p.cliente + p.contrato).toLowerCase().includes(f)).slice(0, 8).map(p => ({ g: 'Processos', t: p.numero, s: `${p.cliente} · ${p.desc}`, ic: 'scale' as IconName, mono: true, go: ['processos', { sel: p.id }] as [View, NavOpts] })),
    ...(f ? [{ g: 'Assistente', t: `Perguntar: “${q.trim()}”`, s: 'Consulta a base do escritório', ic: 'sparkle' as IconName, ia: q.trim() }] : []),
  ];
  const abrir = (it: Item) => { onClose(); if (it.ia) perguntar(it.ia); else if (it.go) go(...it.go); };
  let ult: string | null = null;
  return (
    <div className="cmd" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cmd-box" role="dialog" aria-modal="true" aria-label="Buscar">
        <div className="cmd-in">
          <Icon n="search" s={17} />
          <input ref={ref} id="busca" placeholder="Buscar processo, cliente, reclamação ou perguntar" value={q}
            onChange={e => { setQ(e.target.value); setI(0); }}
            onKeyDown={e => {
              if (e.key === 'Escape') onClose();
              else if (e.key === 'ArrowDown') { e.preventDefault(); setI(x => Math.min(x + 1, itens.length - 1)); }
              else if (e.key === 'ArrowUp') { e.preventDefault(); setI(x => Math.max(x - 1, 0)); }
              else if (e.key === 'Enter' && itens[i]) abrir(itens[i]);
            }} />
          <span className="kbd">esc</span>
        </div>
        <div className="cmd-l">
          {itens.map((it, k) => {
            const head = it.g !== ult;
            ult = it.g;
            return (
              <div key={k}>
                {head ? <div className="cmd-g eyebrow">{it.g}</div> : null}
                <button className="cmd-i" aria-selected={k === i} onMouseEnter={() => setI(k)} onClick={() => abrir(it)}>
                  <Icon n={it.ic} s={15} />
                  <span style={{ minWidth: 0 }}><span className={it.mono ? 'mono' : ''} style={{ color: 'var(--ink)' }}>{it.t}</span>{it.s ? <small>{it.s}</small> : null}</span>
                </button>
              </div>
            );
          })}
          {itens.length ? null : <div className="empty">Nada encontrado.</div>}
        </div>
      </div>
    </div>
  );
}
