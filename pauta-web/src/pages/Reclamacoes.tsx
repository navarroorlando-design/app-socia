import { useEffect, useState } from 'react';
import type { SetContexto } from '../app/AppCtx';
import { Icon } from '../components/Icon';
import { Etapas, Timeline } from '../components/pecas';
import { bloqAtivo, procById, toneDe, za, type Go } from '../domain/base';
import { fmtK, sum } from '../domain/format';
import { modelo } from '../features/assistente/modelos';

export function Reclamacoes({ go, perguntar, setCtx }: { go: Go; perguntar: (q: string) => void; setCtx: SetContexto }) {
  const [aberta, setAberta] = useState<string | null>(za[0].id);
  useEffect(() => {
    setCtx({ label: 'Reclamações no STF', nota: 'A usuária está vendo as reclamações constitucionais no STF. Use listar_reclamacoes.' });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="page v-in">
      <header className="ph fill-in">
        <div><h1>Reclamações constitucionais</h1><p>{za.length} reclamações no STF com base na ADPF 664, contra bloqueios de verbas dos contratos de gestão. Em discussão: <b>{fmtK(sum(za, r => r.valorDiscutido))}</b>.</p></div>
        <div className="ph-act"><button className="btn ai" onClick={() => perguntar(modelo('stf').p())}><Icon n="sparkle" s={14} />Resumo com o assistente</button></div>
      </header>
      <div className="surface fill-in">
        <ul className="rlist big">
          {za.map(r => {
            const on = aberta === r.id;
            return (
              <li key={r.id} className={on ? 'open' : ''}>
                <button aria-expanded={on} onClick={() => setAberta(on ? null : r.id)}>
                  <span className="mono strong">{r.numero}</span>
                  <span className="rl-t"><b>{r.cliente}</b><small>{r.assunto}</small></span>
                  <Etapas r={r} />
                  <span className="num rl-v">{fmtK(r.valorDiscutido)}</span>
                  <span className="chev"><Icon n="down" s={15} /></span>
                </button>
                {on ? (
                  <div className="rl-body rev">
                    <div>
                      <h4>Ato reclamado</h4><p className="quote">{r.ato}</p>
                      <h4 style={{ marginTop: 22 }}>Processos de origem</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {r.processosOrigem.map(id => {
                          const p = procById(id);
                          return (
                            <button key={id} className="lnk" onClick={() => go('processos', { sel: id })}>
                              <span><span className="mono strong">{p.numero}</span><span className="who-s" style={{ display: 'block' }}>{p.desc} · {fmtK(bloqAtivo(p))} bloqueado</span></span>
                              <Icon n="right" s={14} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <h4>Andamento</h4>
                      <Timeline items={r.movs.map(([d, t]) => ({ date: d, text: t, tone: toneDe(t) || 'acc' }))} />
                      <dl className="dl">
                        <div><dt>Liminar</dt><dd><span className={'st ' + (r.liminar === 'Deferida' ? 'good' : 'warn')}>{r.liminar}</span></dd></div>
                        <div><dt>Paradigma</dt><dd>{r.paradigma}</dd></div>
                      </dl>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
