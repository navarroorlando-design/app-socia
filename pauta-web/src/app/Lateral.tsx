import type { IconName } from '../components/Icon';
import { Icon } from '../components/Icon';
import { Se, Tn, fe, ti, za, type Go, type View } from '../domain/base';
import type { AI } from '../features/assistente/useAI';

const BASES: [View, string, IconName][] = [
  ['processos', 'Todos os processos', 'scale'],
  ['bloqueios', 'Bloqueios & contas', 'lock'],
  ['clientes', 'Clientes & órgãos', 'building'],
  ['reclamacoes', 'Reclamações & STF', 'landmark'],
  ['desempenho', 'Desempenho', 'trend'],
];
const contagem: Partial<Record<View, number>> = {
  processos: Se.length,
  bloqueios: Tn.filter(b => b.status === 'Ativo').length,
  clientes: ti.length,
  reclamacoes: za.length,
};

export function Lateral({ view, go, ai, dark, toggleTheme }: { view: View; go: Go; ai: AI; dark: boolean; toggleTheme: () => void }) {
  const novaConsulta = () => { ai.nova(); go('ia'); };
  return (
    <aside className="side" aria-label="Navegação">
      <div className="brand"><b>Pauta</b><span>Azevedo dos Reis</span></div>

      <button className="btn ai" style={{ width: '100%', justifyContent: 'flex-start', marginBottom: 10 }} onClick={novaConsulta}>
        <Icon n="plus" s={15} />Nova consulta
      </button>
      <nav className="nav">
        <button className="nv" aria-current={view === 'painel' ? 'page' : undefined} onClick={() => go('painel')}><Icon n="home" s={16} />Painel</button>
      </nav>

      <div className="nav-g eyebrow">Histórico de pautas</div>
      <nav className="nav">
        {ai.convs.length ? ai.convs.slice(0, 6).map(c => (
          <button key={c.id} className="nv" aria-current={view === 'ia' && ai.curId === c.id ? 'page' : undefined} onClick={() => { ai.abrir(c.id); go('ia'); }}>
            <Icon n="msg" s={15} /><span className="tr">{c.titulo || 'Nova conversa'}</span>
          </button>
        )) : <p className="side-empty">Suas consultas ao assistente aparecem aqui.</p>}
        {ai.convs.length > 6 ? <button className="nv quiet" onClick={() => go('ia')}>Ver todas <Icon n="right" s={12} /></button> : null}
      </nav>

      <div className="nav-g eyebrow">Bases de consulta</div>
      <nav className="nav">
        {BASES.map(([k, l, i]) => (
          <button key={k} className="nv" aria-current={view === k ? 'page' : undefined} onClick={() => go(k)}>
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
        <button className="nv" aria-current={view === 'componentes' ? 'page' : undefined} onClick={() => go('componentes')}><Icon n="grid" s={16} />Componentes</button>
        <button className="nv" onClick={toggleTheme}><Icon n={dark ? 'sun' : 'moon'} s={16} />{dark ? 'Tema claro' : 'Tema escuro'}</button>
        <div className="me"><span className="avatar">OM</span><span><b>Orlando</b><small>Somente leitura</small></span></div>
      </div>
    </aside>
  );
}
