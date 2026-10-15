import { useState } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { useApp } from '../app/AppCtx';
import { Icon, ICON_PATHS } from '../components/Icon';
import { FluxoDinheiro } from '../components/charts/FluxoDinheiro';
import { StackBars } from '../components/charts/StackBars';
import { Legend } from '../components/charts/simples';
import { Etapas } from '../components/pecas';
import { AREAS, AREA_COR, CORTE, D, Hn, NOVIDADES, PARADO, Se, Tn, fe, ir, procByNum, ti, za, type Go } from '../domain/base';
import { MESC, fmtD, fmtDL, fmtK, fmtK0, fmtR, greeting, mesLongo, plural, sum } from '../domain/format';
import { Atencao } from '../features/atencao/Atencao';
import { ATENCAO } from '../features/atencao/regras';
import { useAtencaoIA } from '../features/atencao/useAtencaoIA';
import { MatrizClientes } from '../features/clientes/MatrizClientes';
import { Grafico } from '../features/assistente/Grafico';
import { modelo } from '../features/assistente/modelos';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

export function Painel({ go, perguntar }: { go: Go; perguntar: (q: string) => void }) {
  const { pins } = useApp();
  const [sel, setSel] = useState<number | null>(null);
  const [q, setQ] = useState('');
  const atencaoIA = useAtencaoIA();
  const meses = MESC.slice(0, Hn.getMonth() + 1).map(m => m[0].toUpperCase() + m.slice(1));
  const series = AREAS.slice(0, 3).map(a => ({ label: a, color: AREA_COR[a], vals: meses.map((_, i) => sum(Tn.filter(b => b.mes === i && b.area === a), b => b.original)) }));
  const h = sel == null ? meses.length - 1 : sel;
  const ativos = Tn.filter(b => b.status === 'Ativo');
  const parados = D.nc(Se).length;
  const dev = sum(Tn, b => b.devolvido), per = sum(Tn, b => b.perdido), orig = sum(Tn, b => b.original);
  const altas = atencaoIA.itens.filter(a => a.sev === 3).length;
  const contratos = sum(ti, id => fe[id].contratos.length);
  const abrirNum = (num: string) => { const pr = procByNum(num); if (pr) go('processos', { sel: pr.id }); };
  const semPedido = ATENCAO.filter(a => a.k === 'pedido').length;
  const stfPendentes = za.filter(r => r.liminar === 'Pendente').length;
  const clienteTop = ti.map(id => ({ id, bloq: D.aa(id).bloqueadoAtivo })).sort((a, b) => b.bloq - a.bloq)[0];
  const chips: { ic: string; t: string; q: string }[] = [
    { ic: '🔴', t: `${plural(semPedido, 'bloqueio', 'bloqueios')} sem pedido há +15 dias`, q: 'Quais bloqueios ativos estão há mais de 15 dias sem pedido de desbloqueio protocolado? Mostre os processos em cartões, do maior valor para o menor.' },
    { ic: '⚖️', t: `${plural(stfPendentes, 'liminar pendente', 'liminares pendentes')} no STF`, q: modelo('stf').p() },
    { ic: '📊', t: 'Balanço de êxito e retenção do mês', q: 'Monte um balanço do mês: o que foi devolvido e perdido, a variação do valor bloqueado e o índice de êxito e retenção da carteira.' },
    { ic: '🏢', t: `Dossiê: ${fe[clienteTop.id].name}`, q: modelo('raio').p(clienteTop.id) },
  ];
  return (
    <div className="page v-in">
      <div className="hero fill-in">
        <header className="ph">
          <div>
            <h1>{greeting()}, Orlando.</h1>
            <p>
              {altas ? <b>{plural(altas, 'assunto pede', 'assuntos pedem')} atenção hoje. </b> : null}
              {fmtK(ir.bloqueadoAtivo)} seguem bloqueados em {ativos.length} bloqueios, e {parados} processos estão parados há mais de {PARADO} dias.
            </p>
          </div>
        </header>

        <form className="askin" onSubmit={e => { e.preventDefault(); if (q.trim()) { perguntar(q); setQ(''); } }}>
          <svg className="spark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON_PATHS.sparkle }} />
          <input id="ask-painel" aria-label="Pergunte ao assistente" placeholder="Pergunte ao assistente, por exemplo: quanto o Instituto Gnosis perdeu em setembro?" value={q} onChange={e => setQ(e.target.value)} />
          <span className="kbd hide-sm">⌘.</span>
          <Button type="submit" size="icon" variant={q.trim() ? 'ai' : 'secondary'} className="rounded-sm" aria-label="Perguntar" disabled={!q.trim()}>
            <Icon n="up" s={15} w={2} />
          </Button>
        </form>
        <div className="chips">
          {chips.map((c, i) => (
            <button key={i} className="sug" onClick={() => perguntar(c.q)}><span aria-hidden="true">{c.ic}</span>{c.t}</button>
          ))}
        </div>
        <div className="meta"><span>Base de {fmtDL(Hn)}</span><span>{ti.length} clientes</span><span>{Se.length} processos</span><span>{contratos} contratos de gestão</span></div>
      </div>

      <div className="split fill-in" style={{ animationDelay: '80ms' }}>
        <section className="pane">
          <div className="sec-h"><h2>Para onde foi o dinheiro bloqueado</h2><button className="link" onClick={() => go('bloqueios', { aba: 'todos' })}>Ver bloqueios <Icon n="right" s={13} /></button></div>
          <div className="flow-head"><span className="fig">{fmtK(orig)}</span><span>bloqueados em 2026, em {plural(Tn.length, 'bloqueio', 'bloqueios')}</span></div>
          <FluxoDinheiro dev={dev} per={per} hoje={ir.bloqueadoAtivo} />
        </section>
        <section className="pane">
          <div className="sec-h">
            <h2>Atenção agora</h2>
            <span className="grow" />
            {atencaoIA.fonte === 'ia' ? (
              <Badge variant="ai"><Sparkles className="size-3" />Priorizado pela IA</Badge>
            ) : <span className="cnt">{plural(atencaoIA.itens.length, 'item', 'itens')}</span>}
            <button className="ibtn" title="Atualizar com a IA" aria-label="Atualizar priorização com a IA" onClick={atencaoIA.atualizar} disabled={atencaoIA.carregando}>
              <RefreshCw className={'size-[15px]' + (atencaoIA.carregando ? ' animate-spin' : '')} />
            </button>
          </div>
          <Atencao go={go} itens={atencaoIA.itens} max={5} />
        </section>
      </div>

      {pins.length ? (
        <section className="fill-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="sec-h"><h2>Fixados por você</h2><span className="cnt">Recalculados com a base atual</span></div>
          <div className="row r11">{pins.map(p => <Grafico key={p.id} src={p.src} fixado onOpen={abrirNum} />)}</div>
        </section>
      ) : null}

      <div className="row r21 fill-in" style={{ animationDelay: '120ms' }}>
        <section>
          <div className="sec-h"><h2>Bloqueios por mês</h2><Legend items={series.map(s => [s.label, s.color])} /></div>
          <div onMouseLeave={() => setSel(null)}>
            <StackBars h={250} cats={meses} series={series} fmt={v => fmtK(v).replace('R$ ', '')} sel={sel} onSel={setSel} label="Valor bloqueado por mês, por área, em 2026" />
          </div>
          <div className="readout">
            <b>{mesLongo(meses[h])}</b><span>Total <b className="num">{fmtR(sum(series, s => s.vals[h]))}</b></span>
            {series.map(s => <span key={s.label}>{s.label} <b className="num">{fmtK0(s.vals[h])}</b></span>)}
          </div>
        </section>
        <section>
          <div className="sec-h"><h2>Últimos 7 dias</h2><span className="cnt">{fmtD(CORTE)} a {fmtD(Hn)}</span></div>
          <ol className="feed">
            {NOVIDADES.slice(0, 6).map((n, i) => (
              <li key={i}><button onClick={() => go(...n.go)}><time>{fmtD(n.d)}</time><i className={'dot ' + n.tone} /><span><b>{n.t}</b><small>{n.s}</small></span></button></li>
            ))}
          </ol>
        </section>
      </div>

      <section className="fill-in" style={{ animationDelay: '160ms' }}>
        <div className="sec-h"><h2>Clientes</h2><button className="link" onClick={() => go('clientes')}>Abrir clientes <Icon n="right" s={13} /></button></div>
        <div className="surface"><MatrizClientes go={go} /></div>
      </section>

      <section className="fill-in" style={{ animationDelay: '200ms' }}>
        <div className="sec-h"><h2>Reclamações no STF</h2><button className="link" onClick={() => go('reclamacoes')}>Abrir reclamações <Icon n="right" s={13} /></button></div>
        <div className="surface">
          <ul className="rlist">
            {za.map(r => (
              <li key={r.id}>
                <button onClick={() => go('reclamacoes')}>
                  <span className="mono">{r.numero}</span>
                  <span className="rl-t"><b>{r.cliente}</b><small>{r.assunto}</small></span>
                  <Etapas r={r} />
                  <span className="num rl-v">{fmtK(r.valorDiscutido)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <p className="foot">Dados de exemplo, os mesmos do App dos Sócios. Nada do que você faz aqui muda o Legal One.</p>
    </div>
  );
}
