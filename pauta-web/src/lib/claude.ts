/* Acesso às capacidades do Claude quando o app roda como artefato (claude.ai).
   Fora do Claude, as duas promessas resolvem null e as funções que dependem delas ficam escondidas.
   Para rodar fora do Claude, troque `sample` por uma chamada ao seu backend (veja LEIAME). */
import type { Ferramenta } from '../data/types';

export interface SampleOpcoes {
  tools?: Ferramenta[];
  signal?: AbortSignal;
  modelTier?: 'quick' | 'default' | 'complex';
  cache?: boolean;
  onText?: (p: { text: string; delta: string }) => void;
}
export type Turno = { role: 'user' | 'assistant'; content: string };
export type Sample = (entrada: string | Turno[], opcoes?: SampleOpcoes) => Promise<{ text: string; truncated: boolean }>;
export interface Downloads { save: (p: { filename: string; data: string | Blob | ArrayBuffer }) => Promise<{ status: 'saved' | 'delivered' }> }
export interface ErroClaude { code?: string; message?: string; text?: string }

interface ClaudeGlobal { use: (nome: string) => Promise<unknown> }
const claude = (globalThis as unknown as { claude?: ClaudeGlobal }).claude;

const usar = <T,>(nome: string): Promise<T | null> =>
  claude && claude.use ? claude.use(nome).then(x => (x as T) || null).catch(() => null) : Promise.resolve(null);

export const samplePromise = usar<Sample>('sample');
export const downloadsPromise = usar<Downloads>('downloads');
