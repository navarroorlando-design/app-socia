import { useEffect, useState } from 'react';
import type { Bloqueio, Processo } from '../../data/types';
import { useApp } from '../../app/AppCtx';
import { Icon } from '../../components/Icon';
import { MoneyBar } from '../../components/charts/simples';
import { Prog, St, Timeline } from '../../components/pecas';
import { PARADO, bloqAtivo, bloqDe, hojeB, procById, stB, toneDe, type Go } from '../../domain/base';
import { fmtDL, fmtR, plural } from '../../domain/format';
import { samplePromise } from '../../lib/claude';
import { MD } from '../assistente/Mensagens';

type Aba = 'resumo' | 'movs' | 'bloq' | 'rascunho';

const modeloEstatico = (p: Processo, ativos: Bloqueio[]) => {
  const lista = ativos.length
    ? ativos.map(b => `- ${fmtR(b.original)}, bloqueados desde ${fmtDL(b.data)} (${b.sistema}), sem devolução até o momento.`).join('\n')
    : '- Nenhum bloqueio ativo identificado neste processo no momento.';
  return `**Minuta — Pedido de Desbloqueio**

Processo ${p.numero} · ${p.cliente} · ${p.contrato}

Requer o(a) peticionante o desbloqueio dos valores constritos nestes autos, pelos motivos a seguir:

${lista}

Os valores seguem retidos sem decisão que justifique a manutenção da constrição, causando prejuízo à parte. Requer-se o desbloqueio imediato e a liberação em favor da parte requerente, ou, subsidiariamente, a manifestação fundamentada sobre a necessidade de manutenção do bloqueio.

*Rascunho gerado a partir dos dados deste processo — revise e complete os fundamentos antes de protocolar.*`;
};

function Rascunho({ p, ativos }: { p: Processo; ativos: Bloqueio[] }) {
  const [status, setStatus] = useState<'loading' | 'ok'>('loading');
  const [texto, setTexto] = useState('');

  const gerar = async () => {
    setStatus('loading');
    const sample = await samplePromise;
    if (!sample) { setTexto(modeloEstatico(p, ativos)); setStatus('ok'); return; }
    try {
      const r = await sample([{
        role: 'user',
        content: `Redija uma minuta curta e objetiva de petição de desbloqueio para o processo ${p.numero} (${p.cliente}, ${p.contrato}). `
          + `Bloqueios ativos: ${ativos.length ? ativos.map(b => `${fmtR(b.original)} desde ${fmtDL(b.data)}`).join('; ') : 'nenhum bloqueio ativo no momento'}. `
          + 'Use linguagem jurídica formal em português do Brasil, peça o desbloqueio dos valores por falta de fundamento para a manutenção da constrição, cite o tempo de bloqueio e peça celeridade. '
          + 'Devolva só o corpo da minuta em markdown simples, sem comentários antes ou depois.',
      }], { modelTier: 'default', cache: false });
      setTexto(r.text?.trim() || modeloEstatico(p, ativos));
    } catch {
      setTexto(modeloEstatico(p, ativos));
    } finally {
      setStatus('ok');
    }
  };
  useEffect(() => { gerar(); }, [p.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="who-s" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon n="sparkle" s={13} /><span>Rascunho a partir dos dados deste processo. Revise antes de protocolar.</span>
      </div>
      {status === 'loading' ? (
        <div className="thinking"><Icon n="sparkle" s={16} /><span className="shimmer">Redigindo a minuta…</span></div>
      ) : (
        <>
          <div className="md-t" style={{ border: '1px solid var(--line)', borderRadius: 'var(--r2)', padding: 16, background: 'var(--surface)' }}>
            <MD text={texto} />
          </div>
          <div className="acts">
            <button className="ibtn" title="Copiar minuta" aria-label="Copiar minuta" onClick={() => { navigator.clipboard?.writeText(texto).catch(() => {}); }}><Icon n="copy" s={15} /></button>
            <button className="ibtn" title="Gerar de novo" aria-label="Gerar de novo" onClick={gerar}><Icon n="refresh" s={15} /></button>
          </div>
        </>
      )}
    </div>
  );
}

/* Canvas: dossiê de um processo ao lado da conversa — dados, linha do tempo, bloqueios e rascunho de petição */
export function Canvas({ processoId, go, onClose }: { processoId: string; go: Go; onClose: () => void }) {
  const { seg, toggleSeg } = useApp();
  const [tab, setTab] = useState<Aba>('resumo');
  const p = procById(processoId);
  useEffect(() => { setTab('resumo'); }, [processoId]);
  if (!p) return null;
  const bl = bloqDe(p), ativos = bl.filter(b => b.status === 'Ativo'), seguindo = seg.includes(p.id);
  return (
    <aside className="canvas" aria-label={`Dossiê do processo ${p.numero}`}>
      <div className="dock-h">
        <b><Icon n="panel" s={15} />Dossiê</b><span className="grow" />
        <button className="ibtn" title="Abrir processo" aria-label="Abrir processo em tela cheia" onClick={() => { go('processos', { sel: p.id }); onClose(); }}><Icon n="upright" s={15} /></button>
        <button className="ibtn" title="Fechar" aria-label="Fechar dossiê" onClick={onClose}><Icon n="x" s={15} /></button>
      </div>
      <div className="canvas-body">
        <div className="dh">
          <span className="mono">{p.numero}</span>
          <h3>{p.desc}</h3>
          <span className="meta2">{p.cliente} · {p.contrato} · {p.area}</span>
          <div className="dacts">
            <button className={'btn sm ' + (seguindo ? 'on' : 'ghost')} onClick={() => toggleSeg(p.id)} aria-pressed={seguindo}><Icon n="bookmark" s={13} />{seguindo ? 'Seguindo' : 'Seguir'}</button>
          </div>
        </div>
        <div className="ptabs" role="tablist">
          {([['resumo', 'Resumo'], ['movs', `Linha do tempo · ${p.movs.length}`], ['bloq', `Bloqueios · ${bl.length}`], ['rascunho', 'Rascunho']] as [Aba, string][]).map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        {tab === 'resumo' ? (
          <dl className="dl">
            <div><dt>Situação</dt><dd>{p.status}</dd></div>
            <div><dt>Última movimentação</dt><dd className="num">{fmtDL(p.ultimaMov)} · {p.movs[0]?.text}</dd></div>
            <div><dt>Parado há</dt><dd style={{ color: p.diasParado >= PARADO ? 'var(--warn)' : undefined }}>{p.diasParado ? plural(p.diasParado, 'dia', 'dias') : 'Movimentou hoje'}</dd></div>
            <div><dt>Em discussão</dt><dd className="num">{p.valorCausa ? fmtR(p.valorCausa) : '—'}</dd></div>
            <div><dt>Prognóstico</dt><dd>{p.valorCausa ? <Prog p={p.prognostico} /> : '—'}</dd></div>
            <div><dt>Bloqueado hoje</dt><dd className="num">{bloqAtivo(p) ? fmtR(bloqAtivo(p)) : 'Nada'}</dd></div>
          </dl>
        ) : tab === 'movs' ? (
          <div style={{ paddingTop: 18 }}><Timeline items={p.movs.map(m => ({ date: m.date, text: m.text, tone: toneDe(m.text) }))} /></div>
        ) : tab === 'bloq' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 18 }}>
            {bl.length ? bl.map(b => (
              <button key={b.id} className="rowbtn" onClick={() => go('bloqueios', { sel: b.id, aba: 'todos' })}>
                <div className="r"><span className="num" style={{ fontFamily: 'var(--serif)', fontSize: 19 }}>{fmtR(b.original)}</span><St k={stB(b)} /></div>
                <MoneyBar devolvido={b.devolvido} perdido={b.perdido} bloqueado={hojeB(b)} />
                <div className="r who-s"><span>Bloqueado em {fmtDL(b.data)}</span><span>Ver passos →</span></div>
              </button>
            )) : <p className="empty">Nenhum bloqueio neste processo.</p>}
          </div>
        ) : <Rascunho p={p} ativos={ativos} />}
      </div>
    </aside>
  );
}
