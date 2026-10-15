import type { ClienteId } from '../../data/types';
import { fe } from '../../domain/base';

/* Relatórios prontos */
export interface Modelo { id: string; t: string; d: string; cli?: boolean; p: (cli?: ClienteId) => string }
export const MODELOS: Modelo[] = [
  { id: 'mensal', t: 'Relatório mensal dos sócios', d: 'Bloqueado, devolvido e perdido, passivo por prognóstico, parados e STF.', p: () => 'Monte o relatório mensal para os sócios de outubro de 2026: bloqueado hoje e como mudou no mês, o que foi devolvido e perdido, a evolução do passivo por prognóstico, os processos parados há mais de 90 dias e a situação das reclamações no STF. Termine com próximos passos.' },
  { id: 'raio', t: 'Raio-x de um cliente', d: 'Passivo por contrato de gestão, bloqueios, perdas e processos de atenção.', cli: true, p: c => `Faça um raio-x do ${fe[c as ClienteId].name}: passivo por contrato de gestão dividido por prognóstico, bloqueios ativos por contrato, o que foi devolvido e perdido em 2026 e os processos que merecem atenção.` },
  { id: 'risco', t: 'Bloqueios que podem virar perda', d: 'Ativos altos ou antigos, em processos de prognóstico provável.', p: () => 'Quais bloqueios ativos correm mais risco de virar perda? Considere valor, tempo bloqueado e prognóstico provável do processo. Mostre os processos em cartões.' },
  { id: 'comparar', t: 'Comparar os quatro clientes', d: 'Passivo, bloqueado, devolvido e perdido lado a lado.', p: () => 'Compare os quatro clientes lado a lado: passivo estimado, valor bloqueado hoje, valor devolvido e valor perdido em 2026.' },
  { id: 'parados', t: 'Processos parados', d: 'Parados há mais de 90 dias, por cliente, e o que pedir à equipe.', p: () => 'Liste os processos parados há mais de 90 dias, agrupe por cliente e sugira o que pedir à equipe em cada caso, sem prever resultado.' },
  { id: 'stf', t: 'Reclamações no STF', d: 'Liminares, valor em discussão e processos de origem.', p: () => 'Resuma as reclamações constitucionais no STF: situação de cada liminar, valor em discussão, processos de origem e o que acompanhar.' },
];
export const modelo = (id: string) => MODELOS.find(m => m.id === id) as Modelo;

