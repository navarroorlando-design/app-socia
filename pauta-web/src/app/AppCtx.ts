import { createContext, useContext } from 'react';
import type { ClienteId } from '../data/types';

export interface Fixado { id: string; src: string; titulo: string }

/* Estado compartilhado entre telas: processos seguidos, gráficos fixados no Painel e downloads */
export interface AppCtxValue {
  seg: string[];
  toggleSeg: (id: string) => void;
  pins: Fixado[];
  togglePin: (src: string, titulo: string) => void;
  baixar: (arquivo: string, dados: string) => void;
  dlOk: boolean;
  abrirCanvas: (processoId: string) => void;
}

export const AppCtx = createContext<AppCtxValue>({
  seg: [], toggleSeg: () => {}, pins: [], togglePin: () => {}, baixar: () => {}, dlOk: false, abrirCanvas: () => {},
});
export const useApp = () => useContext(AppCtx);

/* Contexto da tela que o assistente recebe ("este processo", "este cliente") */
export interface ContextoTela { label: string; nota: string; cli?: ClienteId }
export type SetContexto = (c: ContextoTela) => void;
