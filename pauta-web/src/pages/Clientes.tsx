import { useEffect, useState } from 'react';
import type { ClienteId, ResumoContrato } from '../data/types';
import type { SetContexto } from '../app/AppCtx';
import { Icon } from '../components/Icon';
import { FluxoDinheiro } from '../components/charts/FluxoDinheiro';
import { Legend } from '../components/charts/simples';
import { Vigencia } from '../components/pecas';
import { D, PARADO, PROGS, PROG_COR, fe, hojeB, ti, type Go, type NavOpts } from '../domain/base';
import { MESC, fmtK, fmtK0, plural, sum } from '../domain/format';
import { modelo } from '../features/assistente/modelos';

export function Clientes({ opts, go, perguntar, setCtx }: { opts: NavOpts; go: Go; perguntar: (q: string) => void; setCtx: SetContexto }) {
  const [cli, setCli] = useState<ClienteId>(opts.cli || 'gnosis');
  const a = D.aa(cli), c = fe[cli], enc = D.ac(cli);
  useEffect(() => {
    setCtx({ label: c.name, cli, nota: `A usuária está vendo a página do cliente ${c.name}. Filtre as consultas por esse cliente, a menos que ela peça outra coisa.` });
  }, [cli]); // eslint-disable-line react-hooks/exhaustive-deps
  const parados = a.processos.filter(p => p.diasParado >= PARADO).length;
  return (
    <div className="page v-in">
      <nav className="tabs fill-in" aria-label="Clientes">
        {ti.map(id => <button key={id} aria-current={cli === id} onClick={() => setCli(id)}>{fe[id].name}</button>)}
      </nav>
      <header className="ph fill-in" key={'h' + cli}>
        <div>
          <h1>{c.name}</h1>
          <p>
            Passivo estimado de <b>{fmtK(a.passivo.total)}</b> em {plural(a.processos.length, 'processo', 'processos')}{parados ? `, ${parados} parados há mais de ${PARADO} dias` : ''}.
            {' '}Hoje há <b>{fmtK0(a.bloqueadoAtivo)}</b> bloqueados; em 2026 voltaram {fmtK0(a.levantado)} e foram perdidos {fmtK0(a.perdido)}.
          </p>
        </div>
        <div className="ph-act">
          <button className="btn ghost" onClick={() => go('processos', { cli })}><Icon n="scale" s={14} />Processos</button>
          <button className="btn ai" onClick={() => perguntar(modelo('raio').p(cli))}><Icon n="sparkle" s={14} />Raio-x com o assistente</button>
        </div>
      </header>
      <div className="pane fill-in" key={'m' + cli} style={{ paddingBottom: 12 }}>
        <div className="sec-h"><h2>Dinheiro bloqueado do cliente</h2></div>
        <FluxoDinheiro dev={a.levantado} per={a.perdido} hoje={a.bloqueadoAtivo} h={170} />
      </div>
      <section key={'c' + cli} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="sec-h"><h2>Contratos de gestão</h2><span className="cnt">{a.contratos.length}</span></div>
        {a.contratos.map((k, i) => <Contrato key={k.orgao} k={k} i={i} />)}
      </section>
      <section key={'e' + cli}>
        <div className="sec-h"><h2>Encerrados em 2026</h2><span className="cnt">Quanto estava em discussão e quanto foi revertido a favor do cliente</span></div>
        <div className="surface">
          {enc.length ? (
            <div className="tbl-wrap">
              <table className="grid">
                <thead><tr><th>Contrato</th><th className="hide-md">Área</th><th>Como terminou</th><th>Resultado</th><th className="r">Em discussão</th><th className="r">Revertido</th></tr></thead>
                <tbody>
                  {enc.map(e => (
                    <tr key={e.id}>
                      <td>{e.contrato}</td><td className="hide-md muted">{e.area}</td><td>{e.motivo}<span className="sub">em {MESC[e.saiuMes]}</span></td>
                      <td><span className={'st ' + (e.resultado === 'Favorável' ? 'good' : e.resultado === 'Acordo' ? 'info' : 'bad')}>{e.resultado}</span></td>
                      <td className="r num">{fmtK(e.valorCausa)}</td><td className="r num">{fmtK0(e.valorRevertido)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="empty">Nenhum processo encerrado este ano.</div>}
        </div>
      </section>
    </div>
  );
}

function Contrato({ k, i }: { k: ResumoContrato; i: number }) {
  const contas = D.V10contas(k.orgId, k.orgao, k.bloqueios);
  const vs = k.vigenciaStatus;
  return (
    <article className="contract fill-in" style={{ animationDelay: 60 + i * 80 + 'ms' }}>
      <div className="ct-a">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
          <h3>{k.orgao}</h3><span className={'st ' + (vs.id === 'curso' ? 'good' : vs.id === 'atencao' ? 'warn' : '')}>{vs.texto}</span>
        </div>
        <Vigencia vig={k.vigencia} />
        <dl className="dl cols">
          <div><dt>Processos</dt><dd className="num">{k.processos.length}</dd></div>
          <div><dt>Bloqueado hoje</dt><dd className="num">{k.bloqueadoAtivo ? fmtK(k.bloqueadoAtivo) : 'Nada'}</dd></div>
          <div><dt>Devolvido</dt><dd className="num" style={{ color: k.levantado ? 'var(--good)' : undefined }}>{k.levantado ? fmtK(k.levantado) : 'Nada'}</dd></div>
          <div><dt>Perdido</dt><dd className="num" style={{ color: k.perdido ? 'var(--bad)' : undefined }}>{k.perdido ? fmtK(k.perdido) : 'Nada'}</dd></div>
        </dl>
      </div>
      <div className="ct-b">
        <div className="ct-pass"><span>Passivo estimado</span><span className="fig sm">{fmtK(k.passivo.total)}</span></div>
        <div className="hb-t" style={{ height: 10 }}>
          {PROGS.map((pg, j) => (k.passivo[pg] ? <i key={pg} style={{ width: (k.passivo[pg] / (k.passivo.total || 1)) * 100 + '%', background: PROG_COR[pg], animationDelay: j * 90 + 'ms' }} /> : null))}
        </div>
        <div style={{ marginTop: 10 }}><Legend items={PROGS.map(pg => [`${pg} ${fmtK(k.passivo[pg])}`, PROG_COR[pg]])} /></div>
        <table className="accts">
          <thead><tr><th>Conta</th><th>Finalidade</th><th className="r">Bloqueado</th></tr></thead>
          <tbody>
            {contas.map(ct => {
              const at = sum(ct.bloqueios, hojeB);
              return (
                <tr key={ct.id}>
                  <td>{ct.banco}<span className="sub">c/c {ct.final}</span></td>
                  <td className="muted">{ct.fim}</td>
                  <td className="r num">{at ? fmtK(at) : <span className="muted">—</span>}<span className="sub">{plural(ct.bloqueios.length, 'bloqueio', 'bloqueios')}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}
