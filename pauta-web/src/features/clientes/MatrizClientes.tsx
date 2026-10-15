import { D, MONEY, PARADO, Se, fe, ti, type Go } from '../../domain/base';
import type { ClienteId, ResumoCliente } from '../../data/types';
import { fmtK, plural } from '../../domain/format';

interface Linha { id: ClienteId; a: ResumoCliente; parados: number }

/* Uma linha por organização; as barras dentro da célula usam a mesma escala da coluna */
export function MatrizClientes({ go }: { go: Go }) {
  const rows: Linha[] = ti.map(id => ({ id, a: D.aa(id), parados: Se.filter(p => p.clienteId === id && p.diasParado >= PARADO).length }));
  const mx = (f: (r: Linha) => number) => Math.max(1, ...rows.map(f));
  const cols: [string, (r: Linha) => number, string][] = [
    ['Passivo estimado', r => r.a.passivo.total, 'var(--info)'],
    ['Bloqueado hoje', r => r.a.bloqueadoAtivo, MONEY.bloqueado],
    ['Devolvido', r => r.a.levantado, MONEY.devolvido],
    ['Perdido', r => r.a.perdido, MONEY.perdido],
  ];
  return (
    <div className="tbl-wrap">
      <table className="sel matrix">
        <thead><tr><th>Organização</th><th className="r">Processos</th>{cols.map(([l]) => <th key={l} className="r">{l}</th>)}</tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} onClick={() => go('clientes', { cli: r.id })}>
              <td><span className="who-n">{fe[r.id].name}</span><span className="sub">{plural(fe[r.id].contratos.length, 'contrato de gestão', 'contratos de gestão')}</span></td>
              <td className="r num">{r.a.processos.length}<span className="sub" style={{ color: r.parados ? 'var(--warn)' : undefined }}>{r.parados ? plural(r.parados, 'parado', 'parados') : 'nenhum parado'}</span></td>
              {cols.map(([l, f, c]) => {
                const v = f(r), m = mx(f);
                return <td key={l} className="r num"><span>{v ? fmtK(v) : '—'}</span><span className="cellbar"><i style={{ width: (v / m) * 100 + '%', background: c }} /></span></td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
