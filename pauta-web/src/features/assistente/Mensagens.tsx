import type { ReactNode } from 'react';
import { useApp } from '../../app/AppCtx';
import { Icon } from '../../components/Icon';
import { Prog } from '../../components/pecas';
import { PARADO, bloqAtivo, procByNum } from '../../domain/base';
import { fmtK, plural, quando, slug } from '../../domain/format';
import { respostaParaMd, splitBlocks } from './blocos';
import { Grafico } from './Grafico';
import type { Conversa } from './useAI';

const inline = (s: string): ReactNode[] =>
  s.split(/(\*\*[^*]+\*\*)/g).map((x, i) => (x.startsWith('**') && x.endsWith('**') ? <strong key={i}>{x.slice(2, -2)}</strong> : x));

/* Markdown simples: títulos, listas, parágrafos e negrito */
export function MD({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let list: { ord: boolean; items: ReactNode[] } | null = null;
  const flush = () => {
    if (list) { const L = list; out.push(L.ord ? <ol key={out.length}>{L.items}</ol> : <ul key={out.length}>{L.items}</ul>); list = null; }
  };
  for (const raw of text.split('\n')) {
    const l = raw.trim();
    let m: RegExpMatchArray | null;
    if (!l) { flush(); continue; }
    if ((m = l.match(/^#{1,4}\s+(.*)/))) { flush(); out.push(<h3 key={out.length}>{inline(m[1])}</h3>); continue; }
    if ((m = l.match(/^[-*•]\s+(.*)/)) || (m = l.match(/^(\d+)[.)]\s+(.*)/))) {
      const ord = /^\d/.test(l), txt = ord ? m[2] : m[1];
      if (!list || list.ord !== ord) { flush(); list = { ord, items: [] }; }
      list.items.push(<li key={list.items.length}>{inline(txt)}</li>);
      continue;
    }
    flush();
    out.push(<p key={out.length}>{inline(l)}</p>);
  }
  flush();
  return <div className="md-t">{out}</div>;
}

/* Cartões de processos apontados pelo assistente (bloco ```acoes) */
export function Acoes({ src, onOpen }: { src: string; onOpen: (numero: string) => void }) {
  const { seg, toggleSeg, abrirCanvas } = useApp();
  let a: { titulo?: string; processos?: string[] };
  try { a = JSON.parse(src); } catch { return null; }
  const ps = (a.processos || []).map(procByNum).filter((p): p is NonNullable<typeof p> => !!p).slice(0, 6);
  if (!ps.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {a.titulo ? <div className="eyebrow">{a.titulo}</div> : null}
      <div className="acs">
        {ps.map((p, i) => {
          const bl = bloqAtivo(p);
          return (
            <div key={p.id} className="ac rev" style={{ animationDelay: i * 60 + 'ms' }}>
              <div className="r"><span className="mono">{p.numero}</span>{p.valorCausa ? <Prog p={p.prognostico} /> : null}</div>
              <div><div className="n">{p.cliente}</div><div className="s">{p.desc}</div></div>
              <div className="r s">
                <span>{p.diasParado >= PARADO ? `Parado há ${p.diasParado} dias` : `Últ. mov. ${quando(p.lastUpdate)}`}</span>
                <span className="num" style={{ color: 'var(--ink)' }}>{bl ? fmtK(bl) + ' bloq.' : 'sem bloqueio'}</span>
              </div>
              <div className="r" style={{ flexWrap: 'wrap' }}>
                <button className="btn ai sm" onClick={() => abrirCanvas(p.id)}><Icon n="panel" s={13} />Ver dossiê no Canvas</button>
                <button className="btn ghost sm" onClick={() => onOpen(p.numero)}>Abrir processo</button>
                <button className={'btn sm ' + (seg.includes(p.id) ? 'on' : 'quiet')} onClick={() => toggleSeg(p.id)}><Icon n="bookmark" s={13} />{seg.includes(p.id) ? 'Seguindo' : 'Seguir'}</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Mensagens({ conv, onOpen, onAsk }: { conv: Conversa; onOpen: (numero: string) => void; onAsk: (q: string) => void }) {
  const { baixar, dlOk } = useApp();
  return (
    <>
      {conv.msgs.map((m, i) => {
        if (m.role === 'user') {
          return <div key={i} className="q">{m.ctx ? <div className="who-s" style={{ marginBottom: 4 }}>Sobre: {m.ctx}</div> : null}{m.text}</div>;
        }
        const pergunta = conv.msgs[i - 1]?.text || 'Resposta';
        const steps = m.steps || [];
        return (
          <div key={i} className="a">
            {m.status === 'erro' ? <div className="err">{m.erro}</div> : null}
            {!m.text && m.status === 'streaming' ? (
              <div>
                <div className="thinking"><Icon n="sparkle" s={16} /><span className="shimmer">Consultando a base…</span></div>
                <div className="steps" style={{ marginTop: 8 }}>
                  {steps.map((s, k) => <span key={k}><Icon n={k < steps.length - 1 ? 'check' : 'clock'} s={12} />{s}</span>)}
                </div>
              </div>
            ) : null}
            {m.text ? splitBlocks(m.text).map((b, k) => {
              if (b.k === 'md') return <MD key={k} text={b.v || ''} />;
              if (b.k === 'grafico') return <Grafico key={k} src={b.v || ''} onOpen={onOpen} />;
              if (b.k === 'acoes') return <Acoes key={k} src={b.v || ''} onOpen={onOpen} />;
              if (b.k === 'sugestoes') {
                if (m.status === 'streaming') return null;
                let s: string[] = [];
                try { s = JSON.parse(b.v || '[]'); } catch { /* bloco incompleto */ }
                return <div key={k} className="sugs">{s.map(x => <button key={x} className="sug" onClick={() => onAsk(x)}><Icon n="sparkle" s={12} />{x}</button>)}</div>;
              }
              if (b.k === 'pending') return <div key={k} className="pending"><Icon n="sparkle" s={14} /><span className="shimmer">Montando o gráfico…</span></div>;
              return null;
            }) : null}
            {m.status === 'ok' && m.text ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {m.fontes && m.fontes.length ? (
                  <details className="fontes">
                    <summary><Icon n="database" s={13} />De onde vieram os números · {plural(m.fontes.length, 'consulta', 'consultas')} à base</summary>
                    <ol>{m.fontes.map((f, k) => <li key={k}><code>{f.nome.replace(/_/g, ' ')} · {f.params}</code><span className="num muted">{f.resumo}</span></li>)}</ol>
                  </details>
                ) : null}
                <div className="acts">
                  <button className="ibtn" title="Copiar texto" aria-label="Copiar texto" onClick={() => { navigator.clipboard?.writeText(m.text).catch(() => {}); }}><Icon n="copy" s={15} /></button>
                  {dlOk ? <button className="ibtn" title="Baixar relatório (.md)" aria-label="Baixar relatório em Markdown" onClick={() => baixar(slug(pergunta) + '.md', respostaParaMd(pergunta, m.text))}><Icon n="download" s={15} /></button> : null}
                  <button className="ibtn" title="Perguntar de novo" aria-label="Perguntar de novo" onClick={() => onAsk(pergunta)}><Icon n="refresh" s={15} /></button>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </>
  );
}
