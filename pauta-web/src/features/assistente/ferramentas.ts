import type { Ferramenta, Unidade } from '../../data/types';
import { bloqDe, hojeB, procById, procByNum, za } from '../../domain/base';
import { fmtK, fmtN } from '../../domain/format';

export const fmtU = (u: Unidade) => (u === 'BRL' ? fmtK : fmtN);

/* Instruções que só valem na versão desktop; somam-se ao prompt do App dos Sócios */
export const NOTA_DESKTOP = `

ESTA É A VERSÃO DESKTOP (Pauta Jurídica): a resposta é lida numa tela grande; relatórios podem ter até 4 gráficos e cartões de processos.
- Não existe criar_alerta nesta versão. Se pedirem aviso, diga em uma frase que os avisos ficam no App dos Sócios, no celular.
- Ignore o guia sobre Perfil, letra maior, Face ID e barra de baixo. Se perguntarem como usar, explique pela barra lateral: Painel, Processos, Bloqueios, Clientes, Reclamações, Desempenho e Assistente. Gráficos da resposta podem ser fixados no Painel pelo alfinete e baixados em CSV.
- Para contar a história de um processo ou analisar processos específicos, use ver_processo em cada número e organize por fases com datas, sem prever resultado.
- Para reclamações constitucionais no STF, use listar_reclamacoes.`;

/* Ferramentas que a página oferece além das do App dos Sócios */
export const ferramentasExtras = (progress: (s: string) => void): Ferramenta[] => [
  {
    name: 'ver_processo',
    description: 'Detalhes de um processo pelo número CNJ (ou parte dele): movimentações com datas, bloqueios com histórico e valores.',
    inputSchema: { type: 'object', properties: { numero: { type: 'string' } }, required: ['numero'] },
    execute: inp => {
      const p = procByNum(String(inp.numero || ''));
      if (!p) throw new Error('Processo não encontrado. Confira o número.');
      progress(`Lendo o processo ${p.numero}`);
      return {
        numero: p.numero, cliente: p.cliente, contrato: p.contrato, area: p.area, descricao: p.desc, status: p.status, dias_parado: p.diasParado,
        valor_em_discussao: p.valorCausa, prognostico: p.prognostico, movimentacoes: p.movs,
        bloqueios: bloqDe(p).map(b => ({ valor_bloqueado: b.original, ainda_bloqueado: hojeB(b), devolvido: b.devolvido, perdido: b.perdido, historico: b.historico })),
      };
    },
  },
  {
    name: 'listar_reclamacoes',
    description: 'Reclamações constitucionais no STF: número, cliente, situação, liminar, paradigma, ato reclamado, valor em discussão, processos de origem e andamento.',
    inputSchema: { type: 'object', properties: {} },
    execute: () => {
      progress('Consultando as reclamações no STF');
      return za.map(r => ({
        numero: r.numero, cliente: r.cliente, status: r.status, liminar: r.liminar, paradigma: r.paradigma, assunto: r.assunto, ato_reclamado: r.ato,
        valor_em_discussao: r.valorDiscutido, processos_de_origem: r.processosOrigem.map(id => procById(id).numero),
        andamento: r.movs.map(([d, t]) => ({ data: d, texto: t })),
      }));
    },
  },
];

/* Resumo de cada consulta, mostrado em "De onde vieram os números" */
export function resumoDe(r: unknown): string {
  if (Array.isArray(r)) return `${r.length} itens`;
  const o = r as { total?: number; unidade?: Unidade; grupos?: unknown[]; numero?: string } | null;
  if (o && o.total != null) return fmtU(o.unidade || 'quantidade')(o.total) + (o.grupos && o.grupos.length ? ` em ${o.grupos.length} grupos` : '');
  return o && o.numero ? o.numero : 'ok';
}
const PARAM: Record<string, string> = {
  metrica: 'métrica', agrupar_por: 'por', dividir_por: 'dividido por', cliente: 'cliente', area: 'área', contrato: 'contrato', status_bloqueio: 'situação',
  dias_minimos_parado: 'parado há', prognostico: 'prognóstico', mes_inicio: 'de', mes_fim: 'até', numero: 'processo', limite: 'limite', apenas_com_bloqueio_ativo: 'só com bloqueio',
};
export const descParams = (p: Record<string, unknown>) =>
  Object.entries(p || {})
    .filter(([, v]) => v !== undefined && v !== '' && v !== 'nenhum')
    .map(([k, v]) => `${PARAM[k] || k}: ${v === true ? 'sim' : String(v)}`)
    .join(' · ') || 'sem filtro';
