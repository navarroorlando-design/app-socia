import { useEffect, useRef, useState } from 'react';
import { D } from '../../domain/base';
import { ler, useStore } from '../../lib/store';
import { samplePromise, type ErroClaude, type Turno } from '../../lib/claude';
import type { ContextoTela } from '../../app/AppCtx';
import { NOTA_DESKTOP, descParams, ferramentasExtras, resumoDe } from './ferramentas';

export interface Fonte { nome: string; params: string; resumo: string }
export interface Mensagem {
  role: 'user' | 'assistant';
  text: string;
  ctx?: string | null;
  status?: 'streaming' | 'ok' | 'erro';
  steps?: string[];
  fontes?: Fonte[];
  erro?: string;
}
export interface Conversa { id: string; titulo: string; criada: number; msgs: Mensagem[] }

const novaConv = (): Conversa => ({ id: 'c' + Date.now().toString(36), titulo: '', criada: Date.now(), msgs: [] });
const SEM_IA = 'O assistente só responde com o Pauta aberto no Claude. Abra este link no claude.ai para conversar com os dados.';

/* Conversas com o assistente: guarda o histórico, chama o Claude com as ferramentas da base e registra cada consulta */
export function useAI() {
  const [convs, setConvs] = useStore<Conversa[]>('pauta:conversas', []);
  const [curId, setCurId] = useState<string | null>(() => ler<Conversa[]>('pauta:conversas', [])[0]?.id ?? null);
  const [busy, setBusy] = useState(false);
  const [sampleOk, setSampleOk] = useState<boolean | null | undefined>(undefined);
  const ctrl = useRef<AbortController | null>(null);
  const convsRef = useRef(convs);
  convsRef.current = convs;
  useEffect(() => { samplePromise.then(s => setSampleOk(s ? true : null)); }, []);

  const cur = convs.find(c => c.id === curId) || null;
  const patchLast = (id: string, f: (m: Mensagem) => Mensagem) =>
    setConvs(cs => cs.map(c => {
      if (c.id !== id) return c;
      const m = c.msgs.slice();
      m[m.length - 1] = f(m[m.length - 1]);
      return { ...c, msgs: m };
    }));

  const ask = async (q: string, { ctx }: { ctx?: ContextoTela | null } = {}) => {
    const t = (q || '').trim();
    if (!t || busy) return;
    let conv = convsRef.current.find(c => c.id === curId);
    if (!conv) { conv = novaConv(); const nova = conv; setConvs(cs => [nova, ...cs].slice(0, 30)); setCurId(nova.id); }
    const id = conv.id;
    const hist: Mensagem[] = [...conv.msgs, { role: 'user', text: t, ctx: ctx ? ctx.label : null }];
    setConvs(cs => cs
      .map(c => (c.id === id ? { ...c, titulo: c.titulo || t.slice(0, 70), msgs: [...hist, { role: 'assistant' as const, text: '', status: 'streaming' as const, steps: [], fontes: [] }] } : c))
      .sort((a, b) => Number(b.id === id) - Number(a.id === id)));
    setBusy(true);
    const sample = await samplePromise;
    if (!sample) { patchLast(id, m => ({ ...m, status: 'erro', erro: SEM_IA })); setBusy(false); return; }
    const ac = new AbortController();
    ctrl.current = ac;
    const progress = (s: string) => patchLast(id, m => ({ ...m, steps: [...(m.steps || []), s] }));
    const log = (nome: string, params: Record<string, unknown>, r: unknown) =>
      patchLast(id, m => ({ ...m, fontes: [...(m.fontes || []), { nome, params: descParams(params), resumo: resumoDe(r) }] }));
    const tools = [...D.Fk(progress), ...ferramentasExtras(progress)].map(tl => ({
      ...tl,
      execute: (inp: Record<string, unknown>) => { const r = tl.execute(inp); log(tl.name, inp, r); return r; },
    }));
    const turnos: Turno[] = hist.filter(m => m.text && !(m.role === 'assistant' && m.status === 'erro')).map(m => ({ role: m.role, content: m.text })).slice(-12);
    while (turnos.length && turnos[0].role !== 'user') turnos.shift();
    const extra = ctx && ctx.nota ? `\n\nCONTEXTO DA TELA: ${ctx.nota}` : '';
    const input: Turno[] = [
      { role: 'user', content: D.Mk(ctx?.cli || null) + NOTA_DESKTOP + extra },
      { role: 'assistant', content: 'Entendido. Vou consultar a base antes de qualquer número.' },
      ...turnos,
    ];
    try {
      const r = await sample(input, { tools, signal: ac.signal, modelTier: 'default', cache: false, onText: ({ text }) => patchLast(id, m => ({ ...m, text })) });
      patchLast(id, m => ({ ...m, text: r.text || m.text, status: 'ok' }));
    } catch (e) {
      const err = e as ErroClaude;
      if (ac.signal.aborted) patchLast(id, m => ({ ...m, status: m.text ? 'ok' : 'erro', erro: 'Resposta interrompida.' }));
      else patchLast(id, m => ({ ...m, status: 'erro', text: err?.text || m.text, erro: D.l2(err) }));
    } finally {
      setBusy(false);
      ctrl.current = null;
    }
  };
  const stop = () => ctrl.current?.abort();
  const nova = () => { stop(); setCurId(null); };
  const abrir = (id: string) => { if (!busy) setCurId(id); };
  const apagar = (id: string) => { setConvs(cs => cs.filter(c => c.id !== id)); if (id === curId) setCurId(null); };
  return { convs, cur, curId, ask, busy, stop, nova, abrir, apagar, sampleOk };
}
export type AI = ReturnType<typeof useAI>;
