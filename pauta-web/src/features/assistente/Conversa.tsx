import { useEffect, useRef, useState } from 'react';
import type { ClienteId } from '../../data/types';
import type { ContextoTela } from '../../app/AppCtx';
import { Icon } from '../../components/Icon';
import { fe, procByNum, ti, type Go } from '../../domain/base';
import { MODELOS, type Modelo } from './modelos';
import { Mensagens } from './Mensagens';
import type { AI } from './useAI';

function Modelos({ onAsk, limite }: { onAsk: (q: string) => void; limite?: number }) {
  const [pick, setPick] = useState<string | null>(null);
  const lista = limite ? MODELOS.slice(0, limite) : MODELOS;
  const escolher = (m: Modelo, c: ClienteId) => { setPick(null); onAsk(m.p(c)); };
  const abrir = (m: Modelo) => { if (m.cli) setPick(p => (p === m.id ? null : m.id)); else onAsk(m.p()); };
  return (
    <div className="tgrid">
      {lista.map(m => (
        <div key={m.id} className="tcard" role="button" tabIndex={0} aria-expanded={m.cli ? pick === m.id : undefined}
          onClick={() => abrir(m)}
          onKeyDown={e => { if (e.key === 'Enter' && e.target === e.currentTarget) abrir(m); }}>
          <b><Icon n="book" s={14} />{m.t}</b><small>{m.d}</small>
          {m.cli && pick === m.id ? (
            <span className="chips" style={{ marginTop: 8 }} onClick={e => e.stopPropagation()}>
              {ti.map(id => <button key={id} className="fbtn" onClick={() => escolher(m, id)}>{fe[id].name}</button>)}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function Composer({ onAsk, busy, stop, ctx, usarCtx, setUsarCtx, autoFocus }: {
  onAsk: (q: string) => void; busy: boolean; stop: () => void; ctx?: ContextoTela; usarCtx: boolean; setUsarCtx: (f: (v: boolean) => boolean) => void; autoFocus?: boolean;
}) {
  const [t, setT] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (autoFocus) ref.current?.focus(); }, [autoFocus]);
  const ready = !!t.trim() && !busy;
  const enviar = () => { if (!ready) return; onAsk(t); setT(''); };
  return (
    <div className="composer-w">
      <form className="composer" onSubmit={e => { e.preventDefault(); enviar(); }}>
        <textarea ref={ref} id={'cmp-' + (autoFocus ? 'p' : 'd')} rows={2} aria-label="Pergunta ao assistente" placeholder="Pergunte como falaria com um colega" value={t}
          onChange={e => setT(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); } }} />
        <div className="comp-row">
          <div style={{ minWidth: 0, display: 'flex', gap: 6 }}>
            {ctx && ctx.nota ? (
              <span className={'ctx' + (usarCtx ? ' ai' : '')}><Icon n="layers" s={12} /><span>{usarCtx ? ctx.label : 'Sem contexto da tela'}</span>
                <button type="button" aria-label={usarCtx ? 'Não usar o contexto da tela' : 'Usar o contexto da tela'} onClick={() => setUsarCtx(v => !v)}><Icon n={usarCtx ? 'x' : 'plus'} s={11} /></button>
              </span>
            ) : <span className="ctx"><Icon n="lock" s={11} /><span>Só leitura</span></span>}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {busy ? <button type="button" className="btn quiet sm" onClick={stop}>Parar</button> : null}
            <button type="submit" className={'send' + (ready ? ' ready' : '')} aria-label="Enviar" disabled={!ready}><Icon n="up" s={15} w={2} /></button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* Conversa com o assistente: usada no painel lateral e na tela cheia */
export function Conversa({ ai, go, dock, ctx }: { ai: AI; go: Go; dock?: boolean; ctx?: ContextoTela }) {
  const [usarCtx, setUsarCtx] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const n = ai.cur ? ai.cur.msgs.length : 0;
  const lastLen = ai.cur?.msgs[n - 1]?.text.length || 0;
  const passo = Math.floor(lastLen / 400);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end', behavior: 'auto' }); }, [n, passo]);
  const onOpen = (num: string) => { const p = procByNum(num); if (p) go('processos', { sel: p.id }); };
  const ask = (q: string) => ai.ask(q, { ctx: usarCtx && ctx && ctx.nota ? ctx : null });
  return (
    <div className="thread-wrap" style={{ flex: 1, minHeight: 0 }}>
      {!ai.cur || !ai.cur.msgs.length ? (
        <div className="idle">
          <div className="eyebrow" style={{ color: 'var(--ai-ink)' }}>Assistente</div>
          <h2>O que você quer saber da carteira?</h2>
          <p>O assistente consulta a base do escritório e desenha os gráficos com esses números. Comece por um relatório pronto ou escreva sua pergunta.</p>
          <Modelos onAsk={ask} limite={dock ? 4 : 0} />
          {ai.sampleOk === null ? <div className="err">O assistente só responde com o Pauta aberto no Claude. Fora dele, ligue o app a um backend (veja o LEIAME).</div> : null}
        </div>
      ) : (
        <div className={'thread' + (dock ? ' indock' : '')}><Mensagens conv={ai.cur} onOpen={onOpen} onAsk={ask} /><div ref={endRef} /></div>
      )}
      <Composer onAsk={ask} busy={ai.busy} stop={ai.stop} ctx={ctx} usarCtx={usarCtx} setUsarCtx={setUsarCtx} autoFocus={!dock} />
    </div>
  );
}

export function AssistentePage({ ai, go }: { ai: AI; go: Go }) {
  return (
    <div className="ia-page v-in">
      <aside className="hist" aria-label="Conversas">
        <button className="btn ghost" onClick={ai.nova} style={{ justifyContent: 'flex-start' }}><Icon n="plus" s={14} />Nova conversa</button>
        <h4 className="eyebrow">Conversas</h4>
        {ai.convs.length ? ai.convs.map(c => (
          <div key={c.id} style={{ display: 'flex' }}>
            <button className="hi" aria-current={c.id === ai.curId} onClick={() => ai.abrir(c.id)}><Icon n="msg" s={13} /><span>{c.titulo || 'Nova conversa'}</span></button>
            <button className="ibtn x" style={{ width: 28, height: 32 }} aria-label={'Apagar conversa: ' + (c.titulo || '')} onClick={() => ai.apagar(c.id)}><Icon n="trash" s={13} /></button>
          </div>
        )) : <p className="who-s" style={{ padding: '0 10px' }}>As conversas ficam guardadas neste navegador.</p>}
      </aside>
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}><Conversa ai={ai} go={go} /></div>
    </div>
  );
}
