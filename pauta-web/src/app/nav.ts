import type { IconName } from '../components/Icon';
import type { View } from '../domain/base';

export const NAV: [View, string, IconName][] = [
  ['painel', 'Painel', 'home'],
  ['processos', 'Processos', 'scale'],
  ['bloqueios', 'Bloqueios', 'lock'],
  ['clientes', 'Clientes', 'building'],
  ['reclamacoes', 'Reclamações', 'landmark'],
  ['desempenho', 'Desempenho', 'trend'],
  ['ia', 'Assistente', 'sparkle'],
];
export const NOMES = Object.fromEntries(NAV.map(([k, l]) => [k, l])) as Record<View, string>;
export const VIEWS = NAV.map(n => n[0]);
