import { useState } from 'react';
import { useApp } from '../../app/AppCtx';
import { Icon } from '../../components/Icon';
import { HBars, Legend } from '../../components/charts/simples';
import { LineChart } from '../../components/charts/LineChart';
import { PROG_COR } from '../../domain/base';
import { fmtK, slug } from '../../domain/format';
import { csvDe, dadosGrafico, type DadosGrafico, type SpecGrafico } from './blocos';
import { fmtU } from './ferramentas';

const CORES_S = ['var(--c1)', 'var(--c2)', 'var(--ai)'];

/* Desenha um bloco ```grafico a partir da consulta pedida pelo assistente (os números vêm da base, nunca do texto) */
export function Grafico({ src, onOpen, fixado }: { src: string; onOpen?: (numero: string) => void; fixado?: boolean }) {
  const { pins, togglePin, baixar, dlOk } = useApp();
  const [s, setS] = useState<number | null>(null);
  let g: SpecGrafico, d: DadosGrafico;
  try { g = JSON.parse(src) as SpecGrafico; } catch { return <div className="pending">Gráfico em formato inválido.</div>; }
  try { d = dadosGrafico(g); } catch (e) { return <div className="pending">Não consegui montar este gráfico: {String((e as Error).message || e)}</div>; }
  const pinned = pins.some(p => p.src === src);
  const tools = (
    <div className="gtools">
      {dlOk ? (
        <button className="ibtn" title="Baixar dados (CSV)" aria-label="Baixar dados em CSV" onClick={() => baixar(slug(g.titulo || g.tipo) + '.csv', csvDe(d.csv))}>
          <Icon n="download" s={14} />
        </button>
      ) : null}
      <button className="ibtn" title={pinned ? 'Tirar do Painel' : 'Fixar no Painel'} aria-pressed={pinned} aria-label={pinned ? 'Tirar do Painel' : 'Fixar no Painel'} onClick={() => togglePin(src, g.titulo || 'Indicadores')}>
        <Icon n="pin" s={14} />
      </button>
    </div>
  );
  const head = <div className="gcard-h"><h5>{g.titulo || ''}</h5>{tools}</div>;

  if (d.tipo === 'indicadores') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="gcard-h"><span className="eyebrow">Indicadores</span>{tools}</div>
        <div className="ind">
          {d.itens.map((it, i) => (
            <div key={i}>
              <small>{it.rotulo}</small><b>{fmtU(it.u)(it.total)}</b>
              {it.delta ? <span className={'trend ' + (it.delta.pc === 0 ? 'neutral' : it.delta.bom ? 'good' : 'bad')}>{it.delta.pc > 0 ? '+' : ''}{it.delta.pc}% {it.delta.txt}</span> : null}
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (d.tipo === 'tabela') {
    return (
      <div className="gcard">{head}
        <div className="tbl-wrap" style={{ margin: '0 -20px' }}>
          <table className="sel">
            <thead><tr><th>Processo</th><th>Cliente</th><th>Parado</th><th className="r">Bloqueado</th></tr></thead>
            <tbody>{d.rows.map(r => (
              <tr key={r.numero} onClick={() => onOpen?.(r.numero)}>
                <td><span className="mono">{r.numero}</span><span className="sub">{r.descricao}</span></td>
                <td>{r.cliente}<span className="sub">{r.contrato}</span></td>
                <td className="num">{r.dias_parado} dias</td>
                <td className="r num">{r.valor_bloqueado_ativo ? fmtK(r.valor_bloqueado_ativo) : '—'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    );
  }
  if (d.tipo === 'empilhado') {
    const cores = d.r.partes.map((p, k) => PROG_COR[p] || ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--ai)', 'var(--info)'][k % 5]);
    return (
      <div className="gcard">{head}
        <HBars rows={d.r.grupos.map(x => ({ label: x.rotulo, total: x.total, vals: x.valores }))} parts colors={cores} fmt={fmtU(d.r.unidade)} />
        <Legend items={d.r.partes.map((p, k) => [p, cores[k]])} />
      </div>
    );
  }
  const fmt = fmtU(d.u);
  if (d.tipo === 'linha') {
    const lines = d.rs.map((r, k) => ({ label: d.ss[k].rotulo || '', color: CORES_S[k % 3], vals: d.cats.map(c => d.val(r, c)) }));
    return (
      <div className="gcard">{head}
        <LineChart cats={d.cats} lines={lines} fmt={fmt} sel={s} onSel={setS} label={g.titulo || 'Gráfico de linha'} area={lines.length === 1} h={fixado ? 180 : 210} />
        {lines.length > 1 ? <Legend items={lines.map(l => [l.label, l.color])} /> : null}
        <div className="readout">
          {s == null ? <span>Passe o mouse no gráfico para ler cada mês.</span> : (
            <><b>{d.cats[s]}</b>{lines.map(l => <span key={l.label}>{lines.length > 1 ? l.label + ' ' : ''}<b>{l.vals[s] == null ? 'sem dado' : fmt(l.vals[s] as number)}</b></span>)}</>
          )}
        </div>
      </div>
    );
  }
  if (d.rs.length === 1) {
    return <div className="gcard">{head}<HBars rows={d.rs[0].grupos.slice(0, 12).map(x => ({ label: x.rotulo, value: x.valor }))} fmt={fmt} /></div>;
  }
  return (
    <div className="gcard">{head}
      {d.cats.slice(0, 10).map(c => (
        <div key={c}>
          <div className="who-s" style={{ marginBottom: 6 }}>{c}</div>
          <HBars rows={d.rs.map((r, k) => ({ label: d.ss[k].rotulo, value: d.val(r, c) || 0, color: CORES_S[k % 3] }))} fmt={fmt} />
        </div>
      ))}
      <Legend items={d.ss.map((s2, k) => [s2.rotulo, CORES_S[k % 3]])} />
    </div>
  );
}
