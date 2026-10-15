import { useEffect, useState } from 'react';
import type { Area, ClienteId, Processo } from '../data/types';
import { useApp, type SetContexto } from '../app/AppCtx';
import { Icon } from '../components/Icon';
import { MoneyBar } from '../components/charts/simples';
import { Check, Prog, St, Timeline } from '../components/pecas';
import { AREAS, MAXDIAS, PARADO, Se, bloqAtivo, bloqDe, fe, hojeB, procById, stB, ti, toneDe, type Go, type NavOpts } from '../domain/base';
import { MESC, fmtDL, fmtK, fmtK0, fmtR, plural, sum } from '../domain/format';

type Col = 'numero' | 'cliente' | 'parado' | 'valor' | 'bloq';
const COLS: [Col, string, (a: Processo, b: Processo) => number][] = [
  ['numero', 'Processo', (a, b) => a.numero.localeCompare(b.numero)],
  ['cliente', 'Cliente', (a, b) => a.cliente.localeCompare(b.cliente) || a.contrato.localeCompare(b.contrato)],
  ['parado', 'Parado', (a, b) => a.diasParado - b.diasParado],
  ['valor', 'Valor', (a, b) => a.valorCausa - b.valorCausa],
  ['bloq', 'Bloqueado', (a, b) => bloqAtivo(a) - bloqAtivo(b)],
];
type Vis = 'todos' | 'parados' | 'bloq' | 'sigo';

interface Props { opts: NavOpts; go: Go; perguntar: (q: string) => void; setCtx: SetContexto }

export function Processos({ opts, go, perguntar, setCtx }: Props) {
  const { seg } = useApp();
  const [q, setQ] = useState('');
  const [cli, setCli] = useState<ClienteId | null>(opts.cli || null);
  const [area, setArea] = useState<Area | null>(null);
  const [vis, setVis] = useState<Vis>(opts.parados ? 'parados' : 'todos');
  const [ordem, setOrdem] = useState<[Col, 1 | -1]>(opts.parados ? ['parado', -1] : ['parado', 1]);
  const [agrupar, setAgrupar] = useState(false);
  const [sel, setSel] = useState<string | null>(opts.sel || null);
  const [marc, setMarc] = useState<string[]>([]);
  const f = q.trim().toLowerCase();
  const cmp = COLS.find(c => c[0] === ordem[0])![2];
  const list = Se.filter(p => (!cli || p.clienteId === cli) && (!area || p.area === area)
    && (vis !== 'parados' || p.diasParado >= PARADO) && (vis !== 'bloq' || bloqAtivo(p) > 0) && (vis !== 'sigo' || seg.includes(p.id))
    && (!f || (p.numero + p.desc + p.cliente + p.contrato + p.status).toLowerCase().includes(f)))
    .sort((a, b) => cmp(a, b) * ordem[1]);
  const cur = (sel && procById(sel)) || list[0];
  useEffect(() => {
    if (cur) setCtx({ label: `Processo ${cur.numero}`, nota: `A usuária está vendo o processo ${cur.numero} (${cur.cliente}, ${cur.contrato}). Se a pergunta falar de "este processo", use ver_processo com esse número.` });
  }, [cur?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const marcar = (id: string) => setMarc(m => (m.includes(id) ? m.filter(x => x !== id) : m.length >= 8 ? m : [...m, id]));
  const ordenar = (k: Col) => setOrdem(o => (o[0] === k ? [k, o[1] === 1 ? -1 : 1] : [k, k === 'numero' || k === 'cliente' ? 1 : -1]));
  const grupos = agrupar ? ti.map(id => ({ id, ps: list.filter(p => p.clienteId === id) })).filter(g => g.ps.length) : [{ id: null as ClienteId | null, ps: list }];
  const analisar = () => {
    perguntar(`Analise estes processos: ${marc.map(id => procById(id).numero).join(', ')}. Para cada um, diga a situação, os bloqueios e o que aconteceu com o dinheiro, há quanto tempo está parado e o que pedir à equipe. Use ver_processo em cada número e feche com uma comparação entre eles.`);
    setMarc([]);
  };

  const linha = (p: Processo) => {
    const bl = bloqAtivo(p), on = marc.includes(p.id);
    return (
      <tr key={p.id} aria-selected={!!cur && cur.id === p.id} onClick={() => setSel(p.id)}>
        <td onClick={e => { e.stopPropagation(); marcar(p.id); }}><Check on={on} label={'Selecionar ' + p.numero} /></td>
        <td><span className="mono strong">{p.numero}</span>{seg.includes(p.id) ? <span className="seguido" title="Você segue"><Icon n="bookmark" s={11} /></span> : null}<span className="sub">{p.desc}</span></td>
        <td><span className="who-n">{p.cliente}</span><span className="sub">{p.contrato}</span></td>
        <td>
          <span className={'aging' + (p.diasParado >= PARADO ? ' late' : '')}><i style={{ width: Math.max(2, (p.diasParado / MAXDIAS) * 100) + '%' }} /></span>
          <span className="sub num">{p.diasParado ? plural(p.diasParado, 'dia', 'dias') : 'hoje'}</span>
        </td>
        <td className="r num">{p.valorCausa ? fmtK(p.valorCausa) : '—'}{p.valorCausa ? <span className="sub"><Prog p={p.prognostico} /></span> : null}</td>
        <td className="r num" style={{ color: bl ? 'var(--ink)' : 'var(--ink-4)' }}>{bl ? fmtK(bl) : '—'}</td>
      </tr>
    );
  };

  return (
    <div className="page v-in">
      <header className="ph fill-in"><div><h1>Processos</h1><p>{Se.length} processos dos {ti.length} clientes. Marque até 8 para o assistente analisar juntos.</p></div></header>
      <div className="filters fill-in">
        <label className="search"><Icon n="search" s={14} /><input id="proc-q" placeholder="Número, cliente ou assunto" value={q} onChange={e => setQ(e.target.value)} /></label>
        <div className="seg" role="group" aria-label="Mostrar">
          {([['todos', 'Todos'], ['parados', `Parados ${PARADO}+`], ['bloq', 'Com bloqueio'], ['sigo', `Sigo · ${seg.length}`]] as [Vis, string][]).map(([k, l]) => (
            <button key={k} aria-pressed={vis === k} onClick={() => setVis(k)}>{l}</button>
          ))}
        </div>
        <label className="select"><span className="sr">Cliente</span>
          <select value={cli || ''} onChange={e => setCli((e.target.value || null) as ClienteId | null)}><option value="">Todos os clientes</option>{ti.map(id => <option key={id} value={id}>{fe[id].name}</option>)}</select>
          <Icon n="down" s={13} />
        </label>
        <label className="select"><span className="sr">Área</span>
          <select value={area || ''} onChange={e => setArea((e.target.value || null) as Area | null)}><option value="">Todas as áreas</option>{AREAS.map(a => <option key={a} value={a}>{a}</option>)}</select>
          <Icon n="down" s={13} />
        </label>
        <span className="grow" />
        <label className="toggle"><input type="checkbox" checked={agrupar} onChange={e => setAgrupar(e.target.checked)} /><span />Agrupar por cliente</label>
      </div>
      <div className="md">
        <section className="surface fill-in" style={{ animationDelay: '60ms' }}>
          <div className="tbl-wrap">
            <table className="sel fixed grid">
              <colgroup><col style={{ width: 44 }} /><col style={{ width: '32%' }} /><col style={{ width: '22%' }} /><col style={{ width: '12%' }} /><col style={{ width: '17%' }} /><col style={{ width: '17%' }} /></colgroup>
              <thead>
                <tr>
                  <th><span className="sr">Selecionar</span></th>
                  {COLS.map(([k, l]) => (
                    <th key={k} className={k === 'valor' || k === 'bloq' ? 'r' : ''} aria-sort={ordem[0] === k ? (ordem[1] > 0 ? 'ascending' : 'descending') : 'none'}>
                      <button className="th-b" onClick={() => ordenar(k)}>{l}<span className="arr">{ordem[0] === k ? (ordem[1] > 0 ? '↑' : '↓') : ''}</span></button>
                    </th>
                  ))}
                </tr>
              </thead>
              {grupos.map(g => (
                <tbody key={g.id || 'all'}>
                  {g.id ? (
                    <tr className="grp"><td colSpan={6}><b>{fe[g.id].name}</b><span>{plural(g.ps.length, 'processo', 'processos')} · em discussão {fmtK(sum(g.ps, p => p.valorCausa))} · bloqueado {fmtK0(sum(g.ps, bloqAtivo))}</span></td></tr>
                  ) : null}
                  {g.ps.map(linha)}
                </tbody>
              ))}
              {list.length ? null : <tbody><tr><td colSpan={6} className="empty">Nenhum processo com esses filtros.</td></tr></tbody>}
            </table>
          </div>
          <div className="tfoot"><span>{list.length} de {Se.length} processos</span><span>Em discussão <b className="num">{fmtK(sum(list, p => p.valorCausa))}</b></span><span>Bloqueado <b className="num">{fmtK0(sum(list, bloqAtivo))}</b></span></div>
        </section>
        <aside className="surface panel fill-in" style={{ animationDelay: '120ms' }}>
          {cur ? <ProcDetail key={cur.id} p={cur} go={go} perguntar={perguntar} /> : <div className="empty">Nenhum processo selecionado.</div>}
        </aside>
      </div>
      {marc.length ? (
        <div className="selbar"><div>
          <span>{plural(marc.length, 'processo selecionado', 'processos selecionados')}</span>
          <button className="btn ai sm" onClick={analisar}><Icon n="sparkle" s={13} />Analisar com o assistente</button>
          <button className="btn quiet sm" onClick={() => setMarc([])}>Limpar</button>
        </div></div>
      ) : null}
    </div>
  );
}

type Aba = 'resumo' | 'movs' | 'bloq';
function ProcDetail({ p, go, perguntar }: { p: Processo; go: Go; perguntar: (q: string) => void }) {
  const { seg, toggleSeg, abrirCanvas } = useApp();
  const [tab, setTab] = useState<Aba>('resumo');
  const bl = bloqDe(p), seguindo = seg.includes(p.id);
  return (
    <div className="rev">
      <div className="dh">
        <span className="mono">{p.numero}</span>
        <h3>{p.desc}</h3>
        <span className="meta2">{p.cliente} · {p.contrato} · {p.area}</span>
        <div className="dacts">
          <button className={'btn sm ' + (seguindo ? 'on' : 'ghost')} onClick={() => toggleSeg(p.id)} aria-pressed={seguindo}><Icon n="bookmark" s={13} />{seguindo ? 'Seguindo' : 'Seguir'}</button>
          <button className="btn ai sm" onClick={() => perguntar(`Conte a história do processo ${p.numero} por fases, com as datas das movimentações e o que aconteceu com os bloqueios.`)}><Icon n="sparkle" s={13} />Contar a história</button>
          <button className="btn ghost sm" onClick={() => abrirCanvas(p.id)}><Icon n="panel" s={13} />Abrir no Canvas</button>
        </div>
      </div>
      <div className="ptabs" role="tablist">
        {([['resumo', 'Resumo'], ['movs', `Movimentações · ${p.movs.length}`], ['bloq', `Bloqueios · ${bl.length}`]] as [Aba, string][]).map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      {tab === 'resumo' ? (
        <dl className="dl">
          <div><dt>Situação</dt><dd>{p.status}</dd></div>
          <div><dt>Última movimentação</dt><dd className="num">{fmtDL(p.ultimaMov)} · {p.movs[0]?.text}</dd></div>
          <div><dt>Parado há</dt><dd style={{ color: p.diasParado >= PARADO ? 'var(--warn)' : undefined }}>{p.diasParado ? plural(p.diasParado, 'dia', 'dias') : 'Movimentou hoje'}</dd></div>
          <div><dt>Em discussão</dt><dd className="num">{p.valorCausa ? fmtR(p.valorCausa) : '—'}</dd></div>
          <div><dt>Prognóstico</dt><dd>{p.valorCausa ? <Prog p={p.prognostico} /> : '—'}{p.prognosticoAntes ? <span className="cnt"> (era {p.prognosticoAntes.era.toLowerCase()} até {MESC[p.prognosticoAntes.mes]})</span> : null}</dd></div>
          <div><dt>Bloqueado hoje</dt><dd className="num">{bloqAtivo(p) ? fmtR(bloqAtivo(p)) : 'Nada'}</dd></div>
        </dl>
      ) : tab === 'movs' ? (
        <div style={{ paddingTop: 18 }}><Timeline items={p.movs.map(m => ({ date: m.date, text: m.text, tone: toneDe(m.text) }))} /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 18 }}>
          {bl.length ? bl.map(b => (
            <button key={b.id} className="rowbtn" onClick={() => go('bloqueios', { sel: b.id, aba: 'todos' })}>
              <div className="r"><span className="num" style={{ fontFamily: 'var(--serif)', fontSize: 19 }}>{fmtR(b.original)}</span><St k={stB(b)} /></div>
              <MoneyBar devolvido={b.devolvido} perdido={b.perdido} bloqueado={hojeB(b)} />
              <div className="r who-s"><span>Bloqueado em {fmtDL(b.data)}</span><span>Ver passos →</span></div>
            </button>
          )) : <p className="empty">Nenhum bloqueio neste processo.</p>}
        </div>
      )}
    </div>
  );
}
