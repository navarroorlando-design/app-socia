import { useEffect, useState } from 'react';
import type { SetContexto } from '../app/AppCtx';
import { LineChart } from '../components/charts/LineChart';
import { StackBars } from '../components/charts/StackBars';
import { HBars, Legend } from '../components/charts/simples';
import { $o, D, PROGS, PROG_COR, Se, di } from '../domain/base';
import { fmtK, fmtK0, fmtN, mesLongo, plural, sum } from '../domain/format';

type Periodo = '2026' | '6m' | '3m';

export function Desempenho({ setCtx }: { setCtx: SetContexto }) {
  useEffect(() => {
    setCtx({ label: 'Desempenho', nota: 'A usuária está vendo a tela de Desempenho (carteira, passivo por mês, devolvido e revertido).' });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [per, setPer] = useState<Periodo>('2026');
  const [s1, setS1] = useState<number | null>(null);
  const [s2, setS2] = useState<number | null>(null);
  const [s3, setS3] = useState<number | null>(null);
  const full = D.qw('2026');
  const n = per === '3m' ? 3 : per === '6m' ? 6 : full.meses.length;
  const ini = full.meses.length - n, meses = full.meses.slice(ini);
  const cats = meses.map(m => m.rotulo[0].toUpperCase() + m.rotulo.slice(1));
  const cartIni = ini ? full.meses[ini - 1].carteira : full.carteiraInicial;
  const novos = sum(meses, m => m.novos), encs = sum(meses, m => m.encerrados);
  const devV = sum(meses, m => m.levantadoValor), devQ = sum(meses, m => m.levantadoQtd);
  const disc = sum(meses, m => m.emDiscussao), rev = sum(meses, m => m.revertido);
  const pass = D.Xf(Se, $o).slice(ini);
  const lp = pass[pass.length - 1], fp = pass[0];
  const porArea = D.Pw('area', di).filter(a => a.encerrados), porCli = D.Pw('cliente', di).filter(a => a.encerrados);
  const i1 = s1 ?? pass.length - 1, i2 = s2 ?? meses.length - 1, i3 = s3 ?? meses.length - 1;
  const varP = Math.round((lp.total / fp.total - 1) * 100);
  const saldo = full.carteiraHoje - cartIni;
  return (
    <div className="page v-in">
      <header className="ph fill-in">
        <div>
          <h1>Desempenho</h1>
          <p>
            No período, o passivo estimado {varP >= 0 ? 'subiu' : 'caiu'} <b>{Math.abs(varP)}%</b> e chegou a {fmtK(lp.total)}. Entraram {novos} processos e {encs === 1 ? 'foi encerrado' : 'foram encerrados'} {encs};
            {' '}{fmtK(devV)} voltaram aos clientes em {plural(devQ, 'desbloqueio', 'desbloqueios')}.
          </p>
        </div>
        <div className="ph-act">
          <div className="seg" role="group" aria-label="Período">
            {([['2026', 'Ano todo'], ['6m', '6 meses'], ['3m', '3 meses']] as [Periodo, string][]).map(([k, l]) => <button key={k} aria-pressed={per === k} onClick={() => setPer(k)}>{l}</button>)}
          </div>
        </div>
      </header>
      <section className="pane fill-in">
        <div className="sec-h"><h2>Passivo estimado no fim de cada mês</h2><Legend items={PROGS.map(pg => [pg, PROG_COR[pg]])} /></div>
        <div onMouseLeave={() => setS1(null)}>
          <StackBars h={280} cats={cats} series={PROGS.map(pg => ({ label: pg, color: PROG_COR[pg], vals: pass.map(m => m[pg]) }))} fmt={v => fmtK(v).replace('R$ ', '')} sel={s1} onSel={setS1} label="Passivo estimado por mês e prognóstico" />
        </div>
        <div className="readout">
          <b>{mesLongo(cats[i1])}</b><span>Total <b className="num">{fmtK(pass[i1].total)}</b></span>
          {PROGS.map(pg => <span key={pg}>{pg} <b className="num">{fmtK(pass[i1][pg])}</b></span>)}
        </div>
      </section>
      <div className="row r3 fill-in">
        <section>
          <div className="sec-h"><h2>Carteira</h2><span className="cnt">{full.carteiraHoje} processos hoje · {saldo >= 0 ? '+' : ''}{saldo}</span></div>
          <LineChart h={180} cats={cats} lines={[{ label: 'Carteira', color: 'var(--brand)', vals: meses.map(m => m.carteira) }]} fmt={fmtN} sel={s2} onSel={setS2} label="Processos ativos no fim de cada mês" />
          <div className="readout"><b>{cats[i2]}</b><span><b className="num">{meses[i2].carteira}</b> processos</span><span>+{meses[i2].novos} / −{meses[i2].encerrados}</span></div>
        </section>
        <section>
          <div className="sec-h"><h2>Devolvido aos clientes</h2><span className="cnt">média de {D.jw().diasMedio} dias até liberar</span></div>
          <div onMouseLeave={() => setS3(null)}>
            <StackBars h={180} cats={cats} series={[{ label: 'Devolvido', color: 'var(--m-dev)', vals: meses.map(m => m.levantadoValor) }]} fmt={v => (v ? fmtK(v).replace('R$ ', '') : '')} sel={s3} onSel={setS3} label="Valor devolvido por mês" />
          </div>
          <div className="readout"><b>{cats[i3]}</b><span>{meses[i3].levantadoValor ? <><b className="num">{fmtK(meses[i3].levantadoValor)}</b> em {meses[i3].levantadoQtd}</> : 'nenhum'}</span></div>
        </section>
        <section>
          <div className="sec-h"><h2>Revertido nos encerrados</h2><span className="cnt">{disc ? Math.round((rev / disc) * 100) : 0}% de {fmtK(disc)}</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingTop: 6 }}>
            <div><div className="cnt" style={{ marginBottom: 10 }}>Por área</div><HBars rows={porArea.map(a => ({ label: a.nome, total: a.emDiscussao, vals: [a.revertido, a.emDiscussao - a.revertido] }))} parts colors={['var(--m-dev)', 'var(--line-2)']} fmt={fmtK0} /></div>
            <div><div className="cnt" style={{ marginBottom: 10 }}>Por cliente</div><HBars rows={porCli.map(a => ({ label: a.nome, total: a.emDiscussao, vals: [a.revertido, a.emDiscussao - a.revertido] }))} parts colors={['var(--m-dev)', 'var(--line-2)']} fmt={fmtK0} /></div>
            <Legend items={[['Revertido', 'var(--m-dev)'], ['Mantido', 'var(--line-2)']]} />
          </div>
        </section>
      </div>
    </div>
  );
}
