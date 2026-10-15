import { useEffect, useState } from 'react';
import type { Bloqueio, ClienteId } from '../data/types';
import type { SetContexto } from '../app/AppCtx';
import { Icon } from '../components/Icon';
import { FluxoDinheiro } from '../components/charts/FluxoDinheiro';
import { MoneyBar } from '../components/charts/simples';
import { St, Timeline } from '../components/pecas';
import { D, MONEY, Tn, fe, hojeB, procById, stB, ti, toneDe, type Go, type NavOpts, type ParteDinheiro } from '../domain/base';
import { fmtD, fmtDL, fmtK, fmtK0, fmtR, plural, sum } from '../domain/format';

type Aba = 'ativos' | 'encerrados' | 'perda' | 'todos';
const ABAS: [Aba, string, (b: Bloqueio) => boolean][] = [
  ['ativos', 'Ativos', b => b.status === 'Ativo'],
  ['encerrados', 'Encerrados', b => b.status === 'Levantado'],
  ['perda', 'Com perda', b => b.perdido > 0],
  ['todos', 'Todos', () => true],
];

export function Bloqueios({ opts, go, setCtx }: { opts: NavOpts; go: Go; setCtx: SetContexto }) {
  const [aba, setAba] = useState<Aba>((opts.aba as Aba) || (opts.sel ? 'todos' : 'ativos'));
  const [cli, setCli] = useState<ClienteId | null>(opts.cli || null);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string | null>(opts.sel || null);
  const fA = ABAS.find(a => a[0] === aba)![2];
  const base = Tn.filter(b => !cli || b.clienteId === cli);
  const f = q.trim().toLowerCase();
  const list = base.filter(fA).filter(b => !f || (b.cliente + b.contrato + procById(b.processoId).numero + b.area).toLowerCase().includes(f));
  const cur = (sel && Tn.find(b => b.id === sel)) || list[0];
  useEffect(() => {
    if (cur) setCtx({
      label: `Bloqueio de ${fmtR(cur.original)}`, cli: cur.clienteId,
      nota: `A usuária está vendo um bloqueio de ${fmtR(cur.original)} em ${fmtDL(cur.data)}, do ${cur.cliente} (${cur.contrato}), no processo ${procById(cur.processoId).numero}. Hoje bloqueado: ${fmtR(hojeB(cur))}; devolvido ${fmtR(cur.devolvido)}; perdido ${fmtR(cur.perdido)}. Para detalhes use ver_processo.`,
    });
  }, [cur?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const hoje = sum(base, hojeB), dev = sum(base, b => b.devolvido), per = sum(base, b => b.perdido), orig = sum(base, b => b.original);
  return (
    <div className="page v-in">
      <header className="ph fill-in">
        <div><h1>Bloqueios</h1><p>{plural(Tn.length, 'bloqueio', 'bloqueios')} SISBAJUD em 2026 e o caminho de cada real: o que segue bloqueado, o que voltou ao cliente e o que foi perdido.</p></div>
        <div className="ph-act">
          <label className="select"><span className="sr">Cliente</span>
            <select value={cli || ''} onChange={e => { setCli((e.target.value || null) as ClienteId | null); setSel(null); }}><option value="">Todos os clientes</option>{ti.map(id => <option key={id} value={id}>{fe[id].name}</option>)}</select>
            <Icon n="down" s={13} />
          </label>
        </div>
      </header>
      <section className="pane fill-in" key={'f' + cli}>
        <div className="flow-head"><span className="fig">{fmtK(orig)}</span><span>bloqueados{cli ? ' do ' + fe[cli].name : ''} em {plural(base.length, 'bloqueio', 'bloqueios')}</span></div>
        <FluxoDinheiro dev={dev} per={per} hoje={hoje} h={210} />
      </section>
      <div className="md">
        <section className="surface fill-in" style={{ animationDelay: '80ms' }}>
          <div className="filters" style={{ padding: '14px 16px', margin: 0, borderBottom: '1px solid var(--line)' }}>
            <div className="seg" role="group" aria-label="Situação">
              {ABAS.map(([k, l, fn]) => <button key={k} aria-pressed={aba === k} onClick={() => { setAba(k); setSel(null); }}>{l}<span className="cnt">{base.filter(fn).length}</span></button>)}
            </div>
            <span className="grow" />
            <label className="search"><Icon n="search" s={14} /><input id="bloq-q" placeholder="Cliente, contrato ou processo" value={q} onChange={e => setQ(e.target.value)} /></label>
          </div>
          <div className="tbl-wrap">
            <table className="sel fixed grid">
              <colgroup><col style={{ width: 86 }} /><col /><col className="hide-md" style={{ width: '24%' }} /><col style={{ width: '16%' }} /><col style={{ width: '16%' }} /><col style={{ width: '19%' }} /></colgroup>
              <thead><tr><th>Data</th><th>Cliente · contrato</th><th className="hide-md">Processo</th><th className="r">Bloqueado</th><th className="r">Hoje</th><th>Situação</th></tr></thead>
              <tbody>
                {list.map(b => (
                  <tr key={b.id} aria-selected={!!cur && cur.id === b.id} onClick={() => setSel(b.id)}>
                    <td className="num muted">{fmtD(b.data)}</td>
                    <td><span className="who-n">{b.cliente}</span><span className="sub">{b.contrato}</span></td>
                    <td className="hide-md"><span className="mono">{procById(b.processoId).numero}</span><span className="sub">{b.area}</span></td>
                    <td className="r num">{fmtR(b.original)}<span className="sub"><MoneyBar devolvido={b.devolvido} perdido={b.perdido} bloqueado={hojeB(b)} /></span></td>
                    <td className="r num" style={{ color: hojeB(b) ? 'var(--ink)' : 'var(--ink-4)' }}>{hojeB(b) ? fmtR(hojeB(b)) : '—'}</td>
                    <td><St k={stB(b)} /></td>
                  </tr>
                ))}
                {list.length ? null : <tr><td colSpan={6} className="empty">Nenhum bloqueio aqui.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="tfoot"><span>{plural(list.length, 'bloqueio', 'bloqueios')}</span><span>Bloqueado <b className="num">{fmtK(sum(list, b => b.original))}</b></span><span>Hoje <b className="num">{fmtK0(sum(list, hojeB))}</b></span></div>
        </section>
        <aside className="surface panel fill-in" style={{ animationDelay: '140ms' }}>
          {cur ? <BloqDetail key={cur.id} b={cur} go={go} /> : <div className="empty">Nenhum bloqueio selecionado.</div>}
        </aside>
      </div>
    </div>
  );
}

function BloqDetail({ b, go }: { b: Bloqueio; go: Go }) {
  const p = procById(b.processoId);
  const contas = D.V10contas(b.clienteId, b.contrato, Tn.filter(x => x.clienteId === b.clienteId && x.contrato === b.contrato));
  const conta = contas.find(c => c.bloqueios.includes(b));
  const passos = b.historico.slice().reverse().map(h => ({ date: h.date, text: h.text, tone: toneDe(h.text) }));
  passos.push({ date: 'Hoje', text: hojeB(b) ? `${fmtR(hojeB(b))} seguem bloqueados` : 'Nada segue bloqueado', tone: hojeB(b) ? 'warn now' : 'good now' });
  const linhas: [ParteDinheiro, string, number, Date | null][] = [['perdido', 'Perdido', b.perdido, b.perdidoEm], ['devolvido', 'Devolvido ao cliente', b.devolvido, b.devolvidoEm], ['bloqueado', 'Ainda bloqueado', hojeB(b), null]];
  return (
    <div className="rev">
      <div className="dh">
        <span className="meta2">Bloqueio SISBAJUD de {fmtDL(b.data)}</span>
        <h3 className="num" style={{ fontSize: 32 }}>{fmtR(b.original)}</h3>
        <span className="meta2">{b.cliente} · {b.contrato}</span>
        <div style={{ marginTop: 4 }}><St k={stB(b)} /></div>
      </div>
      <div className="dsec">
        <h4>Caminho do dinheiro</h4>
        <MoneyBar big devolvido={b.devolvido} perdido={b.perdido} bloqueado={hojeB(b)} />
        <div className="mrows">
          {linhas.map(([k, l, v, em]) => (
            <div className="mrow" key={k} style={{ opacity: v ? 1 : 0.5 }}>
              <i style={{ background: MONEY[k] }} /><span>{l}{em && v ? <small>em {fmtDL(em)}</small> : null}</span><span className="num">{v ? fmtR(v) : 'R$ 0'}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="dsec"><h4>Passo a passo</h4><Timeline items={passos} /></div>
      {conta ? (
        <div className="dsec"><h4>Conta atingida</h4>
          <dl className="dl" style={{ paddingTop: 0 }}>
            <div><dt>Banco</dt><dd>{conta.banco} · ag. {conta.agencia} · c/c {conta.final}</dd></div>
            <div><dt>Finalidade</dt><dd>{conta.fim} · {plural(conta.bloqueios.length, 'bloqueio', 'bloqueios')} no ano</dd></div>
          </dl>
        </div>
      ) : null}
      <div className="dsec"><h4>Processo</h4>
        <button className="lnk" onClick={() => go('processos', { sel: p.id })}><span><span className="mono strong">{p.numero}</span><span className="who-s" style={{ display: 'block' }}>{p.desc}</span></span><Icon n="right" s={15} /></button>
      </div>
    </div>
  );
}
