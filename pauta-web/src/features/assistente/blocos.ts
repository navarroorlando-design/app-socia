import type { ResultadoConsulta, ResultadoCruzado, ProcessoListado, Unidade, Consulta, ConsultaProcessos } from '../../data/types';
import { D, Hn, procByNum } from '../../domain/base';
import { fmtDL } from '../../domain/format';

/* A resposta do assistente é Markdown com blocos ```grafico, ```acoes e ```sugestoes */
export type Bloco = { k: string; v: string } | { k: 'pending'; v?: undefined };
export function splitBlocks(t: string): Bloco[] {
  const out: Bloco[] = [];
  const re = /```(\w+)[^\n]*\n([\s\S]*?)```/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(t))) {
    if (m.index > last) out.push({ k: 'md', v: t.slice(last, m.index) });
    out.push({ k: m[1], v: m[2] });
    last = re.lastIndex;
  }
  const rest = t.slice(last), open = rest.indexOf('```');
  if (open >= 0) { if (open > 0) out.push({ k: 'md', v: rest.slice(0, open) }); out.push({ k: 'pending' }); }
  else if (rest) out.push({ k: 'md', v: rest });
  return out;
}

export interface SpecGrafico {
  tipo: 'barras' | 'linha' | 'empilhado' | 'indicadores' | 'tabela';
  titulo?: string;
  consulta?: Consulta;
  series?: { rotulo: string; consulta: Consulta }[];
  itens?: { rotulo: string; consulta: Consulta; comparar_com?: Consulta; comparacao?: string; bom_quando?: 'sobe' | 'desce' }[];
  processos?: ConsultaProcessos;
}
type Celula = string | number | null;
export type DadosGrafico =
  | { tipo: 'indicadores'; itens: { rotulo: string; total: number; u: Unidade; delta: { pc: number; bom: boolean; txt: string } | null }[]; csv: Celula[][] }
  | { tipo: 'tabela'; rows: ProcessoListado[]; csv: Celula[][] }
  | { tipo: 'empilhado'; r: ResultadoCruzado; csv: Celula[][] }
  | { tipo: 'linha' | 'barras'; ss: { rotulo: string; consulta: Consulta }[]; rs: ResultadoConsulta[]; cats: string[]; u: Unidade; csv: Celula[][]; val: (r: ResultadoConsulta, c: string) => number | null };

/* Calcula o que um bloco ```grafico desenha: a tabela de dados e o modelo de desenho */
export function dadosGrafico(g: SpecGrafico): DadosGrafico {
  if (g.tipo === 'indicadores') {
    const itens = (g.itens || []).slice(0, 4).map(it => {
      const r = D.ra(it.consulta);
      let delta = null;
      if (it.comparar_com) {
        const r2 = D.ra(it.comparar_com);
        if (r2.total) { const pc = Math.round((r.total / r2.total - 1) * 100); delta = { pc, bom: it.bom_quando === 'sobe' ? pc > 0 : pc < 0, txt: it.comparacao || '' }; }
      }
      return { rotulo: it.rotulo, total: r.total, u: r.unidade, delta };
    });
    return { tipo: 'indicadores', itens, csv: [['Indicador', 'Valor'], ...itens.map(i => [i.rotulo, i.total])] };
  }
  if (g.tipo === 'tabela') {
    const rows = D.i2(g.processos || {});
    return { tipo: 'tabela', rows, csv: [['Processo', 'Cliente', 'Contrato', 'Área', 'Dias parado', 'Em discussão', 'Prognóstico', 'Bloqueado'], ...rows.map(r => [r.numero, r.cliente, r.contrato, r.area, r.dias_parado, r.valor_em_discussao, r.prognostico, r.valor_bloqueado_ativo])] };
  }
  if (g.tipo === 'empilhado') {
    const r = D.o2(g.consulta as Consulta);
    return { tipo: 'empilhado', r, csv: [['Grupo', 'Total', ...r.partes], ...r.grupos.map(x => [x.rotulo, x.total, ...x.valores])] };
  }
  const ss = g.series || [{ rotulo: g.titulo || 'Valor', consulta: g.consulta as Consulta }];
  const rs = ss.map(s => D.ra(s.consulta));
  const cats = g.tipo === 'linha' ? rs[0].grupos.map(x => x.rotulo) : [...new Set(rs.flatMap(r => r.grupos.map(x => x.rotulo)))];
  const val = (r: ResultadoConsulta, c: string) => { const x = r.grupos.find(y => y.rotulo === c); return x ? x.valor : null; };
  return {
    tipo: g.tipo === 'linha' ? 'linha' : 'barras', ss, rs, cats, u: rs[0].unidade, val,
    csv: [['Grupo', ...ss.map(s => s.rotulo || 'Valor')], ...cats.map(c => [c, ...rs.map(r => val(r, c) ?? '')])],
  };
}

export const csvDe = (rows: Celula[][]) =>
  rows.map(r => r.map(v => { const s = v == null ? '' : String(v); return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }).join(';')).join('\n');

/* Converte a resposta em Markdown para baixar: os gráficos viram tabelas com os números calculados */
export function respostaParaMd(pergunta: string, text: string) {
  const partes = splitBlocks(text).map(b => {
    if (b.k === 'md') return (b.v || '').trim();
    if (b.k === 'grafico') {
      try {
        const g = JSON.parse(b.v || '') as SpecGrafico;
        const [h, ...rows] = dadosGrafico(g).csv;
        const fmtV = (v: Celula) => (typeof v === 'number' ? v.toLocaleString('pt-BR') : v ?? '');
        return (g.titulo ? `**${g.titulo}**\n\n` : '') + `| ${h.join(' | ')} |\n| ${h.map(() => '---').join(' | ')} |\n` + rows.map(r => `| ${r.map(fmtV).join(' | ')} |`).join('\n');
      } catch { return ''; }
    }
    if (b.k === 'acoes') {
      try {
        const a = JSON.parse(b.v || '') as { titulo?: string; processos?: string[] };
        return (a.titulo ? `**${a.titulo}**\n\n` : '') + (a.processos || []).map(n => { const p = procByNum(n); return p ? `- ${p.numero} · ${p.cliente} · ${p.desc}` : `- ${n}`; }).join('\n');
      } catch { return ''; }
    }
    return '';
  }).filter(Boolean);
  return `# ${pergunta}\n\n_Pauta Jurídica · Azevedo dos Reis · base de ${fmtDL(Hn)} · dados de exemplo_\n\n${partes.join('\n\n')}\n`;
}
