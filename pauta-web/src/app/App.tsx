import { useEffect, useState } from 'react';
import { AppCtx, type AppCtxValue, type ContextoTela, type Fixado } from './AppCtx';
import { Busca } from './Busca';
import { Lateral } from './Lateral';
import { NAV, NOMES, VIEWS } from './nav';
import { Icon } from '../components/Icon';
import type { NavOpts, View } from '../domain/base';
import { downloadsPromise, type ErroClaude } from '../lib/claude';
import { gravar, ler, useStore } from '../lib/store';
import { AssistentePage, Conversa } from '../features/assistente/Conversa';
import { useAI } from '../features/assistente/useAI';
import { Painel } from '../pages/Painel';
import { Processos } from '../pages/Processos';
import { Bloqueios } from '../pages/Bloqueios';
import { Clientes } from '../pages/Clientes';
import { Reclamacoes } from '../pages/Reclamacoes';
import { Desempenho } from '../pages/Desempenho';
import { Canvas } from '../features/canvas/Canvas';

const temaSalvo = () => { try { return localStorage.getItem('pauta-theme'); } catch { return null; } };

export function App() {
  const [theme, setTheme] = useState<string | null>(temaSalvo);
  const [sysDark, setSysDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [nav, setNav] = useState<{ view: View; opts: NavOpts; n: number }>(() => {
    const h = location.hash.slice(1) as View;
    return { view: VIEWS.includes(h) ? h : 'painel', opts: {}, n: 0 };
  });
  const [busca, setBusca] = useState(false);
  const [dock, setDockState] = useState<boolean>(() => ler('pauta:dock', false));
  const [seg, setSeg] = useStore<string[]>('pauta:seguidos', []);
  const [pins, setPins] = useStore<Fixado[]>('pauta:fixados', []);
  const [toast, setToast] = useState<string | null>(null);
  const [canvasProc, setCanvasProc] = useState<string | null>(null);
  const [dlOk, setDlOk] = useState(false);
  const [ctx, setCtx] = useState<ContextoTela>({ label: 'Painel', nota: '' });
  const ai = useAI();

  const setDock = (v: boolean | ((d: boolean) => boolean)) => setDockState(d => { const n = typeof v === 'function' ? v(d) : v; gravar('pauta:dock', n); return n; });

  useEffect(() => {
    const r = document.documentElement;
    if (theme) r.setAttribute('data-theme', theme); else r.removeAttribute('data-theme');
    try { if (theme) localStorage.setItem('pauta-theme', theme); else localStorage.removeItem('pauta-theme'); } catch { /* sem armazenamento */ }
  }, [theme]);
  useEffect(() => {
    const m = window.matchMedia('(prefers-color-scheme: dark)');
    const f = () => setSysDark(m.matches);
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setBusca(b => !b); }
      if ((e.metaKey || e.ctrlKey) && e.key === '.') { e.preventDefault(); setDock(d => !d); }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);
  useEffect(() => { downloadsPromise.then(d => setDlOk(!!d)); }, []);

  const dark = theme ? theme === 'dark' : sysDark;
  const aviso = (t: string) => { setToast(t); window.setTimeout(() => setToast(x => (x === t ? null : x)), 2800); };
  const go = (view: View, opts: NavOpts = {}) => {
    setNav(n => ({ view, opts, n: n.n + 1 }));
    window.scrollTo({ top: 0, behavior: 'auto' });
    try { history.replaceState(null, '', '#' + view); } catch { /* sem histórico */ }
    if (view === 'painel' || view === 'ia') setCtx({ label: NOMES[view], nota: '' });
  };
  const perguntar = (q: string) => { if (nav.view !== 'ia') setDock(true); ai.ask(q, { ctx: ctx && ctx.nota ? ctx : null }); };

  const ctxValue: AppCtxValue = {
    seg,
    toggleSeg: id => setSeg(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id])),
    pins,
    togglePin: (src, titulo) => {
      const has = pins.find(p => p.src === src);
      aviso(has ? 'Gráfico tirado do Painel' : 'Gráfico fixado no Painel');
      setPins(ps => (has ? ps.filter(p => p.src !== src) : [...ps, { id: 'p' + Date.now().toString(36), src, titulo }].slice(-8)));
    },
    baixar: async (filename, data) => {
      const d = await downloadsPromise;
      if (!d) return aviso('Download indisponível nesta visualização');
      try {
        const r = await d.save({ filename, data });
        if (r?.status === 'saved') aviso('Arquivo salvo');
      } catch (e) {
        const err = e as ErroClaude;
        if (err?.code === 'declined') return;
        aviso(err?.code === 'rate_limited' ? 'Espere um instante e tente de novo' : 'Não foi possível baixar aqui');
      }
    },
    dlOk,
    abrirCanvas: setCanvasProc,
  };

  const { view, opts } = nav;
  const props = { opts, go, perguntar, setCtx };
  const mostraCtx = !!ctx.nota && view !== 'painel' && view !== 'ia' && ctx.label !== NOMES[view];
  return (
    <AppCtx.Provider value={ctxValue}>
      <div className="shell">
        <Lateral view={view} go={go} dark={dark} toggleTheme={() => setTheme(dark ? 'light' : 'dark')} />
        <div className="main">
          <div className="bar">
            <div className="crumb"><span>Pauta</span><span>/</span><b>{NOMES[view]}</b>{mostraCtx ? <><span>/</span><span>{ctx.label}</span></> : null}</div>
            <span className="grow" />
            <button className="kbtn" onClick={() => setBusca(true)} aria-label="Buscar"><Icon n="search" s={14} /><span className="g">Buscar ou perguntar</span><span className="kbd">⌘K</span></button>
            {view !== 'ia' ? <button className="btn ai sm" aria-pressed={dock} onClick={() => setDock(d => !d)} title="Assistente (⌘.)"><Icon n="sparkle" s={14} />Assistente</button> : null}
          </div>
          <nav className="mobnav" aria-label="Seções">
            {NAV.map(([k, l]) => <button key={k} className="fbtn" aria-pressed={view === k} onClick={() => go(k)}>{l}</button>)}
          </nav>
          <main key={view + nav.n}>
            {view === 'painel' ? <Painel go={go} perguntar={perguntar} />
              : view === 'processos' ? <Processos {...props} />
              : view === 'bloqueios' ? <Bloqueios {...props} />
              : view === 'clientes' ? <Clientes {...props} />
              : view === 'reclamacoes' ? <Reclamacoes {...props} />
              : view === 'desempenho' ? <Desempenho setCtx={setCtx} />
              : <AssistentePage ai={ai} go={go} />}
          </main>
        </div>
        {dock && view !== 'ia' ? (
          <aside className="dock" aria-label="Assistente">
            <div className="dock-h">
              <b><Icon n="sparkle" s={15} />Assistente</b><span className="grow" />
              <button className="ibtn" title="Nova conversa" aria-label="Nova conversa" onClick={ai.nova}><Icon n="plus" s={15} /></button>
              <button className="ibtn" title="Abrir em tela cheia" aria-label="Abrir em tela cheia" onClick={() => go('ia')}><Icon n="upright" s={15} /></button>
              <button className="ibtn" title="Fechar (⌘.)" aria-label="Fechar assistente" onClick={() => setDock(false)}><Icon n="x" s={15} /></button>
            </div>
            <div className="dock-body" style={{ display: 'flex', flexDirection: 'column' }}><Conversa ai={ai} go={go} dock ctx={ctx} /></div>
          </aside>
        ) : null}
        {busca ? <Busca onClose={() => setBusca(false)} go={go} perguntar={perguntar} /> : null}
        {canvasProc ? <Canvas processoId={canvasProc} go={go} onClose={() => setCanvasProc(null)} /> : null}
        {toast ? <div className="toast" role="status"><Icon n="check" s={14} w={2} />{toast}</div> : null}
      </div>
    </AppCtx.Provider>
  );
}

