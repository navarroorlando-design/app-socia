import { createContext, useContext } from 'react';
import type { ClienteId } from '../data/types';

export interface Fixado { id: string; src: string; titulo: string }
export interface AoVivo { src: string; titulo: string; pergunta: string }

/* Estado compartilhado entre telas: processos seguidos, gráficos fixados no Painel e downloads */
export interface AppCtxValue {
  seg: string[];
  toggleSeg: (id: string) => void;
  pins: Fixado[];
  togglePin: (src: string, titulo: string) => void;
  baixar: (arquivo: string, dados: string) => void;
  dlOk: boolean;
  abrirCanvas: (processoId: string) => void;
  abrirBusca: () => void;
  /* Gráfico da resposta mais recente do assistente, em qualquer tela — o Painel reflete a última pergunta relevante sem precisar fixar */
  aoVivo: AoVivo | null;
}

export const AppCtx = createContext<AppCtxValue>({
  seg: [], toggleSeg: () => {}, pins: [], togglePin: () => {}, baixar: () => {}, dlOk: false, abrirCanvas: () => {}, abrirBusca: () => {}, aoVivo: null,
});
export const useApp = () => useContext(AppCtx);

/* Contexto da tela que o assistente recebe ("este processo", "este cliente") */
export interface ContextoTela { label: string; nota: string; cli?: ClienteId }
export type SetContexto = (c: ContextoTela) => void;
