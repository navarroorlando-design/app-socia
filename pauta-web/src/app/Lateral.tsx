import { Icon } from '../components/Icon';
import { Se, Tn, fe, ti, za, type Go, type View } from '../domain/base';
import { NAV } from './nav';

const contagem: Partial<Record<View, number>> = {
  processos: Se.length,
  bloqueios: Tn.filter(b => b.status === 'Ativo').length,
  reclamacoes: za.length,
};

export function Lateral({ view, go, dark, toggleTheme }: { view: View; go: Go; dark: boolean; toggleTheme: () => void }) {
  return (
    <aside className="side" aria-label="Navegação">
      <div className="brand"><b>Pauta</b><span>Azevedo dos Reis</span></div>
      <nav className="nav">
        {NAV.map(([k, l, i]) => (
          <button key={k} className={'nv' + (k === 'ia' ? ' ia' : '')} aria-current={view === k ? 'page' : undefined} onClick={() => go(k)}>
            <Icon n={i} s={16} />{l}{contagem[k] != null ? <span className="k">{contagem[k]}</span> : null}
          </button>
        ))}
      </nav>
      <div className="nav-g eyebrow">Clientes</div>
      <nav className="nav">
        {ti.map(id => (
          <button key={id} className="nv" onClick={() => go('clientes', { cli: id })}><span className="cdot" />{fe[id].name}<span className="k">{fe[id].bloqueadoCurto}</span></button>
        ))}
      </nav>
      <div className="side-foot">
        <button className="nv" onClick={toggleTheme}><Icon n={dark ? 'sun' : 'moon'} s={16} />{dark ? 'Tema claro' : 'Tema escuro'}</button>
        <div className="me"><span className="avatar">OM</span><span><b>Orlando</b><small>Somente leitura</small></span></div>
      </div>
    </aside>
  );
}
