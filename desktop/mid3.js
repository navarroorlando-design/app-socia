/* ================= Componentes de domínio ================= */

/* O que pede atenção agora: regras simples sobre a base, ordenadas por gravidade e valor */
const ATK = {pedido:['Sem pedido de desbloqueio','lock'], parado:['Parado com bloqueio','clock'], stf:['STF','landmark'], vig:['Contrato terminando','file'], prog:['Prognóstico piorou','trend']};
const ATENCAO = (() => {
  const out = [];
  for (const b of Tn.filter(x => x.status === 'Ativo')) {
    const dias = D.Lr(b.data, Hn), pedido = b.historico.some(h => /pedido de desbloqueio/i.test(h.text));
    if (!pedido && dias >= 15) out.push({k:'pedido', sev: b.valorNum >= 100000 ? 3 : 2, t:`${fmtR(b.valorNum)} bloqueados há ${dias} dias, sem pedido de desbloqueio`, s:`${b.cliente} · ${b.contrato}`, v:b.valorNum, go:['bloqueios', {sel:b.id, aba:'ativos'}]});
  }
  for (const p of Se) { const bl = bloqAtivo(p); if (bl > 0 && p.diasParado >= PARADO) out.push({k:'parado', sev:3, t:`Parado há ${p.diasParado} dias com ${fmtK(bl)} bloqueados`, s:`${p.cliente} · ${p.desc}`, v:bl, go:['processos', {sel:p.id}]}); }
  for (const r of za) if (r.liminar === 'Pendente') out.push({k:'stf', sev:2, t:`${r.numero}: liminar ainda não apreciada`, s:`${r.cliente} · ${fmtK(r.valorDiscutido)} em discussão`, v:r.valorDiscutido, go:['reclamacoes', {}]});
  for (const id of ti) for (const c of fe[id].contratos) if (D.Tk(c.vigencia).id === 'atencao') { const k = D.Ws(id, c.orgao); out.push({k:'vig', sev:1, t:`Contrato com ${c.orgao} termina este ano`, s:`${fe[id].name} · passivo de ${fmtK(k.passivo.total)}`, v:k.passivo.total, go:['clientes', {cli:id}]}); }
  for (const p of Se) if (p.prognosticoAntes && p.prognostico === 'Provável') out.push({k:'prog', sev:2, t:`Prognóstico passou de ${p.prognosticoAntes.era.toLowerCase()} para provável`, s:`${p.cliente} · ${p.desc}`, v:p.valorCausa, go:['processos', {sel:p.id}]});
  return out.sort((a, b) => b.sev - a.sev || b.v - a.v);
})();

function Atencao({go, max = 6}){
  const [f, setF] = useState(null);
  const tipos = Object.keys(ATK).filter(k => ATENCAO.some(a => a.k === k));
  const lista = ATENCAO.filter(a => !f || a.k === f);
  return html`<div className="att">
    <div className="att-f" role="group" aria-label="Filtrar por tipo">
      <button aria-pressed=${!f} onClick=${() => setF(null)}>Tudo <span>${ATENCAO.length}</span></button>
      ${tipos.map(k => html`<button key=${k} aria-pressed=${f === k} onClick=${() => setF(f === k ? null : k)}>${ATK[k][0]} <span>${ATENCAO.filter(a => a.k === k).length}</span></button>`)}
    </div>
    <ol className="att-l">${lista.slice(0, max).map((a, i) => html`<li key=${a.k + i}><button className="att-i" onClick=${() => go(...a.go)} style=${{animationDelay: (i * 40) + 'ms'}}>
      <span className=${'sev s' + a.sev} aria-label=${['', 'Baixa', 'Média', 'Alta'][a.sev] + ' prioridade'}><i></i><i></i><i></i></span>
      <span className="att-ic"><${Icon} n=${ATK[a.k][1]} s=${15}/></span>
      <span className="att-t"><b>${a.t}</b><small>${a.s}</small></span>
      <span className="att-a">Abrir <${Icon} n="right" s=${13}/></span>
    </button></li>`)}</ol>
    ${lista.length > max ? html`<p className="cnt" style=${{margin:'10px 0 0'}}>Mais ${lista.length - max} itens com esse filtro.</p>` : null}
  </div>`;
}

/* Fluxo do dinheiro: tudo o que foi bloqueado se divide no que segue bloqueado, no que voltou e no que foi perdido */
function FluxoDinheiro({dev, per, hoje, h = 230, titulo = 'Bloqueado em 2026'}){
  const [ref, W] = useW(720);
  const [hov, setHov] = useState(null);
  const tot = dev + per + hoje || 1;
  const nodeW = 10, gap = 18, top = 4, H = h - 8;
  const labW = Math.min(250, W * .38), rightX = W - labW - nodeW;
  const parts = [['bloqueado', 'Ainda bloqueado', hoje, 'nas contas dos contratos'], ['devolvido', 'Devolvido aos clientes', dev, 'liberado por decisão judicial'], ['perdido', 'Perdido', per, 'transferido a credores']].filter(p => p[2] > 0);
  const avail = H - gap * (parts.length - 1);
  let ly = top, ry = top;
  const bands = parts.map(([k, l, v, s]) => { const lh = v / tot * H, rh = Math.max(4, v / tot * avail); const b = {k, l, v, s, ly, lh, ry, rh}; ly += lh; ry += rh + gap; return b; });
  // rótulos com espaço mínimo entre si
  let last = -99; bands.forEach(b => { b.ty = Math.max(b.ry + b.rh / 2, last + 54); last = b.ty; });
  const mid = (nodeW + rightX) / 2;
  return html`<div ref=${ref} className="flow">
    <svg className="svgc" width=${W} height=${h} viewBox=${`0 0 ${W} ${h}`} role="img" aria-label=${`${titulo}: ${fmtR(tot)}. ` + bands.map(b => `${b.l} ${fmtR(b.v)}`).join(', ')} onMouseLeave=${() => setHov(null)}>
      <rect x="0" y=${top} width=${nodeW} height=${H} rx="2" fill="var(--ink)"/>
      ${bands.map((b, i) => html`<g key=${b.k} onMouseEnter=${() => setHov(b.k)} style=${{cursor:'default'}}>
        <path className="band" style=${{animationDelay: (i * 120) + 'ms', opacity: hov && hov !== b.k ? .18 : .32}} fill=${MONEY[b.k === 'bloqueado' ? 'bloqueado' : b.k]}
          d=${`M${nodeW},${b.ly} C${mid},${b.ly} ${mid},${b.ry} ${rightX},${b.ry} L${rightX},${b.ry + b.rh} C${mid},${b.ry + b.rh} ${mid},${b.ly + b.lh} ${nodeW},${b.ly + b.lh} Z`}/>
        <rect x=${rightX} y=${b.ry} width=${nodeW} height=${b.rh} rx="2" fill=${MONEY[b.k]}/>
        <g transform=${`translate(${rightX + nodeW + 16},${b.ty})`} style=${{opacity: hov && hov !== b.k ? .45 : 1, transition:'opacity .2s'}}>
          <text y="-14" fontSize="12.5" fill="var(--ink-2)">${b.l}</text>
          <text y="10" fontSize="22" fill="var(--ink)" style=${{fontFamily:'var(--serif)', fontVariantNumeric:'lining-nums tabular-nums'}}>${fmtK(b.v)}</text>
          <text y="28" fontSize="12" fill="var(--ink-3)">${Math.round(b.v / tot * 100)}% · ${b.s}</text>
        </g>
      </g>`)}
    </svg>
  </div>`;
}

/* Matriz de clientes: uma linha por organização, barras dentro da célula na mesma escala da coluna */
function MatrizClientes({go}){
  const rows = ti.map(id => ({id, a:D.aa(id), parados:Se.filter(p => p.clienteId === id && p.diasParado >= PARADO).length}));
  const mx = f => Math.max(1, ...rows.map(r => f(r)));
  const cols = [
    ['Passivo estimado', r => r.a.passivo.total, 'var(--brand)'],
    ['Bloqueado hoje', r => r.a.bloqueadoAtivo, MONEY.bloqueado],
    ['Devolvido', r => r.a.levantado, MONEY.devolvido],
    ['Perdido', r => r.a.perdido, MONEY.perdido]
  ];
  return html`<div className="tbl-wrap"><table className="sel matrix">
    <thead><tr><th>Organização</th><th className="r">Processos</th>${cols.map(([l]) => html`<th key=${l} className="r">${l}</th>`)}</tr></thead>
    <tbody>${rows.map(r => html`<tr key=${r.id} onClick=${() => go('clientes', {cli:r.id})}>
      <td><span className="who-n">${fe[r.id].name}</span><span className="sub">${plural(fe[r.id].contratos.length, 'contrato de gestão', 'contratos de gestão')}</span></td>
      <td className="r num">${r.a.processos.length}<span className="sub" style=${{color: r.parados ? 'var(--warn)' : null}}>${r.parados ? plural(r.parados, 'parado', 'parados') : 'nenhum parado'}</span></td>
      ${cols.map(([l, f, c]) => { const v = f(r), m = mx(f); return html`<td key=${l} className="r num"><span>${v ? fmtK(v) : '—'}</span><span className="cellbar"><i style=${{width: (v / m * 100) + '%', background:c}}></i></span></td>`; })}
    </tr>`)}</tbody></table></div>`;
}

/* Vigência do contrato com a marca de hoje */
function Vigencia({vig}){
  const [a, b] = String(vig).split('–').map(Number);
  const ini = new Date(a, 0, 1), fim = new Date(b, 11, 31);
  const pct = Math.max(0, Math.min(1, (Hn - ini) / (fim - ini)));
  const enc = Hn > fim;
  return html`<div className="vig" role="img" aria-label=${`Vigência de ${a} a ${b}. ${enc ? 'Encerrada' : Math.round(pct * 100) + '% decorrido'}`}>
    <div className="vig-t"><i style=${{width: pct * 100 + '%'}}></i>${enc ? null : html`<b style=${{left: pct * 100 + '%'}}></b>`}</div>
    <div className="vig-l"><span>${a}</span>${enc ? html`<span>Encerrada em ${b}</span>` : html`<span>Hoje · ${Math.round(pct * 100)}% do prazo</span>`}<span>${b}</span></div>
  </div>`;
}

/* Etapas de uma reclamação constitucional */
function etapasRcl(r){
  const t = r.movs.map(m => m[1].toLowerCase()).join(' | ');
  const st = [
    {l:'Protocolada', ok:/protocolada/.test(t)},
    {l:'Informações', ok:/informaç/.test(t)},
    {l: r.liminar === 'Deferida' ? 'Liminar deferida' : 'Liminar', ok: r.liminar === 'Deferida'},
    {l: r.status === 'Julgada' ? 'Julgada' : 'Julgamento', ok: r.status === 'Julgada'}
  ];
  const lastOk = st.map(s => s.ok).lastIndexOf(true);
  return st.map((s, i) => ({...s, pulou: !s.ok && i < lastOk, atual: !s.ok && i === lastOk + 1}));
}
function Etapas({r, compacto}){
  return html`<ol className=${'steps-h' + (compacto ? ' compact' : '')} aria-label="Etapas">${etapasRcl(r).map((s, i) => html`<li key=${i} className=${s.ok ? 'ok' : s.atual ? 'now' : s.pulou ? 'skip' : ''}>
    <i></i>${compacto ? null : html`<span>${s.l}</span>`}</li>`)}</ol>`;
}

/* ================= Painel ================= */
function Painel({go, perguntar}){
  const {pins} = useContext(AppCtx);
  const [sel, setSel] = useState(null);
  const [q, setQ] = useState('');
  const meses = MESC.slice(0, Hn.getMonth() + 1).map(m => m[0].toUpperCase() + m.slice(1));
  const series = AREAS.slice(0, 3).map(a => ({label:a, color:AREA_COR[a], vals:meses.map((_, i) => sum(Tn.filter(b => b.mes === i && b.area === a), b => b.original))}));
  const h = sel == null ? meses.length - 1 : sel;
  const ativos = Tn.filter(b => b.status === 'Ativo');
  const parados = D.nc(Se).length;
  const dev = sum(Tn, b => b.devolvido), per = sum(Tn, b => b.perdido), orig = sum(Tn, b => b.original);
  const altas = ATENCAO.filter(a => a.sev === 3).length;
  return html`<div className="page v-in">
    <header className="ph fill-in"><div>
      <h1>${greeting()}, Orlando.</h1>
      <p>${altas ? html`<b>${plural(altas, 'assunto pede', 'assuntos pedem')} atenção hoje.</b> ` : null}${fmtK(ir.bloqueadoAtivo)} seguem bloqueados em ${ativos.length} bloqueios, e ${parados} processos estão parados há mais de ${PARADO} dias.</p>
      <div className="meta"><span>Base de ${fmtDL(Hn)}</span><span>${ti.length} clientes</span><span>${Se.length} processos</span><span>${D.Ws ? sum(ti, id => fe[id].contratos.length) : ''} contratos de gestão</span></div>
    </div></header>

    <form className="askin fill-in" style=${{animationDelay:'40ms'}} onSubmit=${e => { e.preventDefault(); if (q.trim()) { perguntar(q); setQ(''); } }}>
      <svg className="spark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML=${{__html:P.sparkle}}></svg>
      <input id="ask-painel" aria-label="Pergunte ao assistente" placeholder="Pergunte ao assistente, por exemplo: quanto o Instituto Gnosis perdeu em setembro?" value=${q} onInput=${e => setQ(e.target.value)}/>
      <span className="kbd hide-sm">⌘.</span>
      <button type="submit" className=${'send' + (q.trim() ? ' ready' : '')} aria-label="Perguntar" disabled=${!q.trim()}><${Icon} n="up" s=${15} w=${2}/></button>
    </form>

    <div className="split fill-in" style=${{animationDelay:'80ms'}}>
      <section className="pane">
        <div className="sec-h"><h2>Para onde foi o dinheiro bloqueado</h2><button className="link" onClick=${() => go('bloqueios', {aba:'todos'})}>Ver bloqueios <${Icon} n="right" s=${13}/></button></div>
        <div className="flow-head"><span className="fig">${fmtK(orig)}</span><span>bloqueados em 2026, em ${plural(Tn.length, 'bloqueio', 'bloqueios')}</span></div>
        <${FluxoDinheiro} dev=${dev} per=${per} hoje=${ir.bloqueadoAtivo}/>
      </section>
      <section className="pane">
        <div className="sec-h"><h2>Atenção agora</h2><span className="cnt">${plural(ATENCAO.length, 'item', 'itens')}</span></div>
        <${Atencao} go=${go} max=${5}/>
      </section>
    </div>

    ${pins.length ? html`<section className="fill-in" style=${{display:'flex',flexDirection:'column',gap:14}}>
      <div className="sec-h"><h2>Fixados por você</h2><span className="cnt">Recalculados com a base atual</span></div>
      <div className="row r11">${pins.map(p => html`<${Grafico} key=${p.id} src=${p.src} fixado onOpen=${num => { const pr = procByNum(num); pr && go('processos', {sel:pr.id}); }}/>`)}</div>
    </section>` : null}

    <div className="row r21 fill-in" style=${{animationDelay:'120ms'}}>
      <section>
        <div className="sec-h"><h2>Bloqueios por mês</h2><${Legend} items=${series.map(s => [s.label, s.color])}/></div>
        <div onMouseLeave=${() => setSel(null)}><${StackBars} h=${250} cats=${meses} series=${series} fmt=${v => fmtK(v).replace('R$ ', '')} sel=${sel} onSel=${setSel} label="Valor bloqueado por mês, por área, em 2026"/></div>
        <div className="readout"><b>${D.V12mesLongo(meses[h])}</b><span>Total <b className="num">${fmtR(sum(series, s => s.vals[h]))}</b></span>${series.map(s => html`<span key=${s.label}>${s.label} <b className="num">${fmtK0(s.vals[h])}</b></span>`)}</div>
      </section>
      <section>
        <div className="sec-h"><h2>Últimos 7 dias</h2><span className="cnt">${fmtD(CORTE)} a ${fmtD(Hn)}</span></div>
        <ol className="feed">${NOVIDADES.slice(0, 6).map((n, i) => html`<li key=${i}><button onClick=${() => go(...n.go)}>
          <time>${fmtD(n.d)}</time><i className=${'dot ' + n.tone}></i><span><b>${n.t}</b><small>${n.s}</small></span></button></li>`)}</ol>
      </section>
    </div>

    <section className="fill-in" style=${{animationDelay:'160ms'}}>
      <div className="sec-h"><h2>Clientes</h2><button className="link" onClick=${() => go('clientes')}>Abrir clientes <${Icon} n="right" s=${13}/></button></div>
      <div className="surface"><${MatrizClientes} go=${go}/></div>
    </section>

    <section className="fill-in" style=${{animationDelay:'200ms'}}>
      <div className="sec-h"><h2>Reclamações no STF</h2><button className="link" onClick=${() => go('reclamacoes')}>Abrir reclamações <${Icon} n="right" s=${13}/></button></div>
      <div className="surface"><ul className="rlist">${za.map(r => html`<li key=${r.id}><button onClick=${() => go('reclamacoes')}>
        <span className="mono">${r.numero}</span>
        <span className="rl-t"><b>${r.cliente}</b><small>${r.assunto}</small></span>
        <${Etapas} r=${r}/>
        <span className="num rl-v">${fmtK(r.valorDiscutido)}</span>
      </button></li>`)}</ul></div>
    </section>
    <p className="foot">Dados de exemplo, os mesmos do App dos Sócios. Nada do que você faz aqui muda o Legal One.</p>
  </div>`;
}

/* ================= Processos ================= */
const COLS_P = [
  ['numero', 'Processo', (a, b) => a.numero.localeCompare(b.numero)],
  ['cliente', 'Cliente', (a, b) => a.cliente.localeCompare(b.cliente) || a.contrato.localeCompare(b.contrato)],
  ['parado', 'Parado', (a, b) => a.diasParado - b.diasParado],
  ['valor', 'Em discussão', (a, b) => a.valorCausa - b.valorCausa],
  ['bloq', 'Bloqueado', (a, b) => bloqAtivo(a) - bloqAtivo(b)]
];
const MAXDIAS = Math.max(...Se.map(p => p.diasParado));
function Processos({opts, go, perguntar, setCtx}){
  const {seg} = useContext(AppCtx);
  const [q, setQ] = useState('');
  const [cli, setCli] = useState(opts.cli || null);
  const [area, setArea] = useState(null);
  const [vis, setVis] = useState(opts.parados ? 'parados' : 'todos');
  const [ordem, setOrdem] = useState(opts.parados ? ['parado', -1] : ['parado', 1]);
  const [agrupar, setAgrupar] = useState(false);
  const [sel, setSel] = useState(opts.sel || null);
  const [marc, setMarc] = useState([]);
  const f = q.trim().toLowerCase();
  const cmp = COLS_P.find(c => c[0] === ordem[0])[2];
  const list = Se.filter(p => (!cli || p.clienteId === cli) && (!area || p.area === area)
    && (vis !== 'parados' || p.diasParado >= PARADO) && (vis !== 'bloq' || bloqAtivo(p) > 0) && (vis !== 'sigo' || seg.includes(p.id))
    && (!f || (p.numero + p.desc + p.cliente + p.contrato + p.status).toLowerCase().includes(f))).sort((a, b) => cmp(a, b) * ordem[1]);
  const cur = (sel && procById(sel)) || list[0];
  useEffect(() => { if (cur) setCtx({label:`Processo ${cur.numero}`, nota:`A usuária está vendo o processo ${cur.numero} (${cur.cliente}, ${cur.contrato}). Se a pergunta falar de "este processo", use ver_processo com esse número.`}); }, [cur && cur.id]);
  const marcar = id => setMarc(m => m.includes(id) ? m.filter(x => x !== id) : m.length >= 8 ? m : [...m, id]);
  const ordenar = k => setOrdem(o => o[0] === k ? [k, -o[1]] : [k, k === 'numero' || k === 'cliente' ? 1 : -1]);
  const grupos = agrupar ? ti.map(id => ({id, ps:list.filter(p => p.clienteId === id)})).filter(g => g.ps.length) : [{id:null, ps:list}];
  const linha = p => { const bl = bloqAtivo(p), on = marc.includes(p.id);
    return html`<tr key=${p.id} aria-selected=${cur && cur.id === p.id} onClick=${() => setSel(p.id)}>
      <td onClick=${e => { e.stopPropagation(); marcar(p.id); }}><button className="cb" role="checkbox" aria-checked=${on} aria-label=${'Selecionar ' + p.numero}>${on ? html`<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>` : null}</button></td>
      <td><span className="mono strong">${p.numero}</span>${seg.includes(p.id) ? html`<span className="seguido" title="Você segue"><${Icon} n="bookmark" s=${11}/></span>` : null}<span className="sub">${p.desc}</span></td>
      <td><span className="who-n">${p.cliente}</span><span className="sub">${p.contrato}</span></td>
      <td><span className=${'aging' + (p.diasParado >= PARADO ? ' late' : '')}><i style=${{width: Math.max(2, p.diasParado / MAXDIAS * 100) + '%'}}></i></span><span className="sub num">${p.diasParado ? plural(p.diasParado, 'dia', 'dias') : 'movimentou hoje'}</span></td>
      <td className="r num">${p.valorCausa ? fmtK(p.valorCausa) : '—'}${p.valorCausa ? html`<span className="sub"><${Prog} p=${p.prognostico}/></span>` : null}</td>
      <td className="r num" style=${{color: bl ? 'var(--ink)' : 'var(--ink-4)'}}>${bl ? fmtK(bl) : '—'}</td>
    </tr>`; };
  return html`<div className="page v-in">
    <header className="ph fill-in"><div><h1>Processos</h1><p>${Se.length} processos dos ${ti.length} clientes. Marque até 8 para o assistente analisar juntos.</p></div></header>
    <div className="filters fill-in">
      <label className="search"><${Icon} n="search" s=${14}/><input id="proc-q" placeholder="Número, cliente ou assunto" value=${q} onInput=${e => setQ(e.target.value)}/></label>
      <div className="seg" role="group" aria-label="Mostrar">${[['todos', 'Todos'], ['parados', `Parados ${PARADO}+`], ['bloq', 'Com bloqueio'], ['sigo', `Sigo · ${seg.length}`]].map(([k, l]) => html`<button key=${k} aria-pressed=${vis === k} onClick=${() => setVis(k)}>${l}</button>`)}</div>
      <label className="select"><span className="sr">Cliente</span><select value=${cli || ''} onChange=${e => setCli(e.target.value || null)}><option value="">Todos os clientes</option>${ti.map(id => html`<option key=${id} value=${id}>${fe[id].name}</option>`)}</select><${Icon} n="down" s=${13}/></label>
      <label className="select"><span className="sr">Área</span><select value=${area || ''} onChange=${e => setArea(e.target.value || null)}><option value="">Todas as áreas</option>${AREAS.map(a => html`<option key=${a} value=${a}>${a}</option>`)}</select><${Icon} n="down" s=${13}/></label>
      <span className="grow"></span>
      <label className="toggle"><input type="checkbox" checked=${agrupar} onChange=${e => setAgrupar(e.target.checked)}/><span></span>Agrupar por cliente</label>
    </div>
    <div className="md">
      <section className="surface fill-in" style=${{animationDelay:'60ms'}}>
        <div className="tbl-wrap"><table className="sel fixed grid">
          <colgroup><col style=${{width:46}}/><col style=${{width:'33%'}}/><col style=${{width:'25%'}}/><col style=${{width:'16%'}}/><col/><col style=${{width:'13%'}}/></colgroup>
          <thead><tr><th><span className="sr">Selecionar</span></th>${COLS_P.map(([k, l]) => html`<th key=${k} className=${k === 'valor' || k === 'bloq' ? 'r' : ''} aria-sort=${ordem[0] === k ? (ordem[1] > 0 ? 'ascending' : 'descending') : 'none'}>
            <button className="th-b" onClick=${() => ordenar(k)}>${l}<span className="arr">${ordem[0] === k ? (ordem[1] > 0 ? '↑' : '↓') : ''}</span></button></th>`)}</tr></thead>
          ${grupos.map(g => html`<tbody key=${g.id || 'all'}>
            ${g.id ? html`<tr className="grp"><td colSpan="6"><b>${fe[g.id].name}</b><span>${plural(g.ps.length, 'processo', 'processos')} · em discussão ${fmtK(sum(g.ps, p => p.valorCausa))} · bloqueado ${fmtK0(sum(g.ps, bloqAtivo))}</span></td></tr>` : null}
            ${g.ps.map(linha)}</tbody>`)}
          ${list.length ? null : html`<tbody><tr><td colSpan="6" className="empty">Nenhum processo com esses filtros.</td></tr></tbody>`}
        </table></div>
        <div className="tfoot"><span>${list.length} de ${Se.length} processos</span><span>Em discussão <b className="num">${fmtK(sum(list, p => p.valorCausa))}</b></span><span>Bloqueado <b className="num">${fmtK0(sum(list, bloqAtivo))}</b></span></div>
      </section>
      <aside className="surface panel fill-in" style=${{animationDelay:'120ms'}}>${cur ? html`<${ProcDetail} key=${cur.id} p=${cur} go=${go} perguntar=${perguntar}/>` : html`<div className="empty">Nenhum processo selecionado.</div>`}</aside>
    </div>
    ${marc.length ? html`<div className="selbar"><div>
      <span>${plural(marc.length, 'processo selecionado', 'processos selecionados')}</span>
      <button className="btn ai sm" onClick=${() => { perguntar(`Analise estes processos: ${marc.map(id => procById(id).numero).join(', ')}. Para cada um, diga a situação, os bloqueios e o que aconteceu com o dinheiro, há quanto tempo está parado e o que pedir à equipe. Use ver_processo em cada número e feche com uma comparação entre eles.`); setMarc([]); }}><${Icon} n="sparkle" s=${13}/>Analisar com o assistente</button>
      <button className="btn quiet sm" onClick=${() => setMarc([])}>Limpar</button></div></div>` : null}
  </div>`;
}
function ProcDetail({p, go, perguntar}){
  const {seg, toggleSeg} = useContext(AppCtx);
  const [tab, setTab] = useState('resumo');
  const bl = bloqDe(p), seguindo = seg.includes(p.id);
  return html`<div className="rev">
    <div className="dh">
      <span className="mono">${p.numero}</span>
      <h3>${p.desc}</h3>
      <span className="meta2">${p.cliente} · ${p.contrato} · ${p.area}</span>
      <div className="dacts">
        <button className=${'btn sm ' + (seguindo ? 'on' : 'ghost')} onClick=${() => toggleSeg(p.id)} aria-pressed=${seguindo}><${Icon} n="bookmark" s=${13}/>${seguindo ? 'Seguindo' : 'Seguir'}</button>
        <button className="btn ai sm" onClick=${() => perguntar(`Conte a história do processo ${p.numero} por fases, com as datas das movimentações e o que aconteceu com os bloqueios.`)}><${Icon} n="sparkle" s=${13}/>Contar a história</button>
      </div>
    </div>
    <div className="ptabs" role="tablist">${[['resumo', 'Resumo'], ['movs', `Movimentações · ${p.movs.length}`], ['bloq', `Bloqueios · ${bl.length}`]].map(([k, l]) => html`<button key=${k} role="tab" aria-selected=${tab === k} onClick=${() => setTab(k)}>${l}</button>`)}</div>
    ${tab === 'resumo' ? html`<dl className="dl">
      <div><dt>Situação</dt><dd>${p.status}</dd></div>
      <div><dt>Última movimentação</dt><dd className="num">${fmtDL(p.ultimaMov)} · ${p.movs[0] ? p.movs[0].text : ''}</dd></div>
      <div><dt>Parado há</dt><dd style=${{color: p.diasParado >= PARADO ? 'var(--warn)' : null}}>${p.diasParado ? plural(p.diasParado, 'dia', 'dias') : 'Movimentou hoje'}</dd></div>
      <div><dt>Em discussão</dt><dd className="num">${p.valorCausa ? fmtR(p.valorCausa) : '—'}</dd></div>
      <div><dt>Prognóstico</dt><dd>${p.valorCausa ? html`<${Prog} p=${p.prognostico}/>` : '—'}${p.prognosticoAntes ? html` <span className="cnt">(era ${p.prognosticoAntes.era.toLowerCase()} até ${MESC[p.prognosticoAntes.mes]})</span>` : null}</dd></div>
      <div><dt>Bloqueado hoje</dt><dd className="num">${bloqAtivo(p) ? fmtR(bloqAtivo(p)) : 'Nada'}</dd></div>
    </dl>` : tab === 'movs' ? html`<div style=${{paddingTop:18}}><${Timeline} items=${p.movs.map(m => ({date:m.date, text:m.text, tone:toneDe(m.text)}))}/></div>`
    : html`<div style=${{display:'flex',flexDirection:'column',gap:10,paddingTop:18}}>${bl.length ? bl.map(b => html`<button key=${b.id} className="rowbtn" onClick=${() => go('bloqueios', {sel:b.id, aba:'todos'})}>
        <div className="r"><span className="num" style=${{fontFamily:'var(--serif)',fontSize:19}}>${fmtR(b.original)}</span><${St} k=${stB(b)}/></div>
        <${MoneyBar} devolvido=${b.devolvido} perdido=${b.perdido} bloqueado=${hojeB(b)}/>
        <div className="r who-s"><span>Bloqueado em ${fmtDL(b.data)}</span><span>Ver passos →</span></div></button>`) : html`<p className="empty">Nenhum bloqueio neste processo.</p>`}</div>`}
  </div>`;
}

/* ================= Bloqueios ================= */
const ABAS = [['ativos', 'Ativos', b => b.status === 'Ativo'], ['encerrados', 'Encerrados', b => b.status === 'Levantado'], ['perda', 'Com perda', b => b.perdido > 0], ['todos', 'Todos', () => true]];
function Bloqueios({opts, go, setCtx}){
  const [aba, setAba] = useState(opts.aba || (opts.sel ? 'todos' : 'ativos'));
  const [cli, setCli] = useState(opts.cli || null);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(opts.sel || null);
  const fA = ABAS.find(a => a[0] === aba)[2];
  const base = Tn.filter(b => !cli || b.clienteId === cli);
  const f = q.trim().toLowerCase();
  const list = base.filter(fA).filter(b => !f || (b.cliente + b.contrato + procById(b.processoId).numero + b.area).toLowerCase().includes(f));
  const cur = (sel && Tn.find(b => b.id === sel)) || list[0];
  useEffect(() => { if (cur) setCtx({label:`Bloqueio de ${fmtR(cur.original)}`, cli:cur.clienteId, nota:`A usuária está vendo um bloqueio de ${fmtR(cur.original)} em ${fmtDL(cur.data)}, do ${cur.cliente} (${cur.contrato}), no processo ${procById(cur.processoId).numero}. Hoje bloqueado: ${fmtR(hojeB(cur))}; devolvido ${fmtR(cur.devolvido)}; perdido ${fmtR(cur.perdido)}. Para detalhes use ver_processo.`}); }, [cur && cur.id]);
  const hoje = sum(base, hojeB), dev = sum(base, b => b.devolvido), per = sum(base, b => b.perdido), orig = sum(base, b => b.original);
  return html`<div className="page v-in">
    <header className="ph fill-in"><div><h1>Bloqueios</h1><p>${plural(Tn.length, 'bloqueio', 'bloqueios')} SISBAJUD em 2026 e o caminho de cada real: o que segue bloqueado, o que voltou ao cliente e o que foi perdido.</p></div>
      <div className="ph-act"><label className="select"><span className="sr">Cliente</span><select value=${cli || ''} onChange=${e => { setCli(e.target.value || null); setSel(null); }}><option value="">Todos os clientes</option>${ti.map(id => html`<option key=${id} value=${id}>${fe[id].name}</option>`)}</select><${Icon} n="down" s=${13}/></label></div></header>
    <section className="pane fill-in" key=${'f' + cli}>
      <div className="flow-head"><span className="fig">${fmtK(orig)}</span><span>bloqueados${cli ? ' do ' + fe[cli].name : ''} em ${plural(base.length, 'bloqueio', 'bloqueios')}</span></div>
      <${FluxoDinheiro} dev=${dev} per=${per} hoje=${hoje} h=${210}/>
    </section>
    <div className="md">
      <section className="surface fill-in" style=${{animationDelay:'80ms'}}>
        <div className="filters" style=${{padding:'14px 16px',margin:0,borderBottom:'1px solid var(--line)'}}>
          <div className="seg" role="group" aria-label="Situação">${ABAS.map(([k, l, fn]) => html`<button key=${k} aria-pressed=${aba === k} onClick=${() => { setAba(k); setSel(null); }}>${l}<span className="cnt">${base.filter(fn).length}</span></button>`)}</div>
          <span className="grow"></span>
          <label className="search"><${Icon} n="search" s=${14}/><input id="bloq-q" placeholder="Cliente, contrato ou processo" value=${q} onInput=${e => setQ(e.target.value)}/></label>
        </div>
        <div className="tbl-wrap"><table className="sel fixed grid">
          <colgroup><col style=${{width:84}}/><col/><col className="hide-md" style=${{width:'24%'}}/><col style=${{width:'16%'}}/><col style=${{width:'16%'}}/><col style=${{width:'19%'}}/></colgroup>
          <thead><tr><th>Data</th><th>Cliente · contrato</th><th className="hide-md">Processo</th><th className="r">Bloqueado</th><th className="r">Hoje</th><th>Situação</th></tr></thead>
          <tbody>${list.map(b => html`<tr key=${b.id} aria-selected=${cur && cur.id === b.id} onClick=${() => setSel(b.id)}>
            <td className="num muted">${fmtD(b.data)}</td>
            <td><span className="who-n">${b.cliente}</span><span className="sub">${b.contrato}</span></td>
            <td className="hide-md"><span className="mono">${procById(b.processoId).numero}</span><span className="sub">${b.area}</span></td>
            <td className="r num">${fmtR(b.original)}<span className="sub"><${MoneyBar} devolvido=${b.devolvido} perdido=${b.perdido} bloqueado=${hojeB(b)}/></span></td>
            <td className="r num" style=${{color: hojeB(b) ? 'var(--ink)' : 'var(--ink-4)'}}>${hojeB(b) ? fmtR(hojeB(b)) : '—'}</td>
            <td><${St} k=${stB(b)}/></td></tr>`)}
            ${list.length ? null : html`<tr><td colSpan="6" className="empty">Nenhum bloqueio aqui.</td></tr>`}</tbody>
        </table></div>
        <div className="tfoot"><span>${plural(list.length, 'bloqueio', 'bloqueios')}</span><span>Bloqueado <b className="num">${fmtK(sum(list, b => b.original))}</b></span><span>Hoje <b className="num">${fmtK0(sum(list, hojeB))}</b></span></div>
      </section>
      <aside className="surface panel fill-in" style=${{animationDelay:'140ms'}}>${cur ? html`<${BloqDetail} key=${cur.id} b=${cur} go=${go}/>` : html`<div className="empty">Nenhum bloqueio selecionado.</div>`}</aside>
    </div>
  </div>`;
}
function BloqDetail({b, go}){
  const p = procById(b.processoId);
  const contas = D.V10contas(b.clienteId, b.contrato, Tn.filter(x => x.clienteId === b.clienteId && x.contrato === b.contrato));
  const conta = contas.find(c => c.bloqueios.includes(b));
  const passos = b.historico.slice().reverse().map(h => ({date:h.date, text:h.text, tone:toneDe(h.text)}));
  passos.push({date:'Hoje', text: hojeB(b) ? `${fmtR(hojeB(b))} seguem bloqueados` : 'Nada segue bloqueado', tone: hojeB(b) ? 'warn now' : 'good now'});
  return html`<div className="rev">
    <div className="dh">
      <span className="meta2">Bloqueio SISBAJUD de ${fmtDL(b.data)}</span>
      <h3 className="num" style=${{fontSize:32}}>${fmtR(b.original)}</h3>
      <span className="meta2">${b.cliente} · ${b.contrato}</span>
      <div style=${{marginTop:4}}><${St} k=${stB(b)}/></div>
    </div>
    <div className="dsec"><h4>Caminho do dinheiro</h4>
      <${MoneyBar} big devolvido=${b.devolvido} perdido=${b.perdido} bloqueado=${hojeB(b)}/>
      <div className="mrows">${[['perdido', 'Perdido', b.perdido, b.perdidoEm], ['devolvido', 'Devolvido ao cliente', b.devolvido, b.devolvidoEm], ['bloqueado', 'Ainda bloqueado', hojeB(b), null]].map(([k, l, v, em]) => html`<div className="mrow" key=${k} style=${{opacity: v ? 1 : .5}}>
        <i style=${{background: MONEY[k]}}></i><span>${l}${em && v ? html`<small>em ${fmtDL(em)}</small>` : null}</span><span className="num">${v ? fmtR(v) : 'R$ 0'}</span></div>`)}</div>
    </div>
    <div className="dsec"><h4>Passo a passo</h4><${Timeline} items=${passos}/></div>
    ${conta ? html`<div className="dsec"><h4>Conta atingida</h4>
      <dl className="dl" style=${{paddingTop:0}}><div><dt>Banco</dt><dd>${conta.banco} · ag. ${conta.agencia} · c/c ${conta.final}</dd></div><div><dt>Finalidade</dt><dd>${conta.fim} · ${plural(conta.bloqueios.length, 'bloqueio', 'bloqueios')} no ano</dd></div></dl></div>` : null}
    <div className="dsec"><h4>Processo</h4>
      <button className="lnk" onClick=${() => go('processos', {sel:p.id})}><span><span className="mono strong">${p.numero}</span><span className="who-s" style=${{display:'block'}}>${p.desc}</span></span><${Icon} n="right" s=${15}/></button></div>
  </div>`;
}

/* ================= Clientes ================= */
function Clientes({opts, go, perguntar, setCtx}){
  const [cli, setCli] = useState(opts.cli || 'gnosis');
  const a = D.aa(cli), c = fe[cli], enc = D.ac(cli);
  useEffect(() => { setCtx({label:c.name, cli, nota:`A usuária está vendo a página do cliente ${c.name}. Filtre as consultas por esse cliente, a menos que ela peça outra coisa.`}); }, [cli]);
  const parados = a.processos.filter(p => p.diasParado >= PARADO).length;
  return html`<div className="page v-in">
    <nav className="tabs fill-in" aria-label="Clientes">${ti.map(id => html`<button key=${id} aria-current=${cli === id} onClick=${() => setCli(id)}>${fe[id].name}</button>`)}</nav>
    <header className="ph fill-in" key=${'h' + cli}><div><h1>${c.name}</h1>
      <p>Passivo estimado de <b>${fmtK(a.passivo.total)}</b> em ${plural(a.processos.length, 'processo', 'processos')}${parados ? `, ${parados} parados há mais de ${PARADO} dias` : ''}. Hoje há <b>${fmtK0(a.bloqueadoAtivo)}</b> bloqueados; em 2026 voltaram ${fmtK0(a.levantado)} e foram perdidos ${fmtK0(a.perdido)}.</p></div>
      <div className="ph-act"><button className="btn ghost" onClick=${() => go('processos', {cli})}><${Icon} n="scale" s=${14}/>Processos</button>
        <button className="btn ai" onClick=${() => perguntar(MODELOS[1].p(cli))}><${Icon} n="sparkle" s=${14}/>Raio-x com o assistente</button></div></header>
    <div className="pane fill-in" key=${'m' + cli} style=${{paddingBottom:12}}>
      <div className="sec-h"><h2>Dinheiro bloqueado do cliente</h2></div>
      <${FluxoDinheiro} dev=${a.levantado} per=${a.perdido} hoje=${a.bloqueadoAtivo} h=${170}/>
    </div>
    <section key=${'c' + cli} style=${{display:'flex',flexDirection:'column',gap:16}}>
      <div className="sec-h"><h2>Contratos de gestão</h2><span className="cnt">${a.contratos.length}</span></div>
      ${a.contratos.map((k, i) => html`<${Contrato} key=${k.orgao} k=${k} i=${i} go=${go}/>`)}
    </section>
    <section key=${'e' + cli}>
      <div className="sec-h"><h2>Encerrados em 2026</h2><span className="cnt">Quanto estava em discussão e quanto foi revertido a favor do cliente</span></div>
      <div className="surface">${enc.length ? html`<div className="tbl-wrap"><table className="grid">
        <thead><tr><th>Contrato</th><th className="hide-md">Área</th><th>Como terminou</th><th>Resultado</th><th className="r">Em discussão</th><th className="r">Revertido</th></tr></thead>
        <tbody>${enc.map(e => html`<tr key=${e.id}><td>${e.contrato}</td><td className="hide-md muted">${e.area}</td><td>${e.motivo}<span className="sub">em ${MESC[e.saiuMes]}</span></td>
          <td><span className=${'st ' + (e.resultado === 'Favorável' ? 'good' : e.resultado === 'Acordo' ? 'info' : 'bad')}>${e.resultado}</span></td>
          <td className="r num">${fmtK(e.valorCausa)}</td><td className="r num">${fmtK0(e.valorRevertido)}</td></tr>`)}</tbody></table></div>`
        : html`<div className="empty">Nenhum processo encerrado este ano.</div>`}</div>
    </section>
  </div>`;
}
function Contrato({k, i, go}){
  const contas = D.V10contas(k.orgId, k.orgao, k.bloqueios);
  const vs = k.vigenciaStatus;
  return html`<article className="contract fill-in" style=${{animationDelay: (60 + i * 80) + 'ms'}}>
    <div className="ct-a">
      <div style=${{display:'flex',justifyContent:'space-between',gap:12,alignItems:'baseline'}}><h3>${k.orgao}</h3><span className=${'st ' + (vs.id === 'curso' ? 'good' : vs.id === 'atencao' ? 'warn' : '')}>${vs.texto}</span></div>
      <${Vigencia} vig=${k.vigencia}/>
      <dl className="dl cols">
        <div><dt>Processos</dt><dd className="num">${k.processos.length}</dd></div>
        <div><dt>Bloqueado hoje</dt><dd className="num">${k.bloqueadoAtivo ? fmtK(k.bloqueadoAtivo) : 'Nada'}</dd></div>
        <div><dt>Devolvido</dt><dd className="num" style=${{color: k.levantado ? 'var(--good)' : null}}>${k.levantado ? fmtK(k.levantado) : 'Nada'}</dd></div>
        <div><dt>Perdido</dt><dd className="num" style=${{color: k.perdido ? 'var(--bad)' : null}}>${k.perdido ? fmtK(k.perdido) : 'Nada'}</dd></div>
      </dl>
    </div>
    <div className="ct-b">
      <div className="ct-pass"><span>Passivo estimado</span><span className="fig sm">${fmtK(k.passivo.total)}</span></div>
      <div className="hb-t" style=${{height:10}}>${PROGS.map((pg, j) => k.passivo[pg] ? html`<i key=${pg} style=${{width: (k.passivo[pg] / (k.passivo.total || 1) * 100) + '%', background: PROG_COR[pg], animationDelay: (j * 90) + 'ms'}}></i>` : null)}</div>
      <div style=${{marginTop:10}}><${Legend} items=${PROGS.map(pg => [`${pg} ${fmtK(k.passivo[pg])}`, PROG_COR[pg]])}/></div>
      <table className="accts"><thead><tr><th>Conta</th><th>Finalidade</th><th className="r">Bloqueado</th></tr></thead>
        <tbody>${contas.map(ct => { const at = sum(ct.bloqueios, hojeB);
          return html`<tr key=${ct.id}><td>${ct.banco}<span className="sub">c/c ${ct.final}</span></td><td className="muted">${ct.fim}</td><td className="r num">${at ? fmtK(at) : html`<span className="muted">—</span>`}<span className="sub">${plural(ct.bloqueios.length, 'bloqueio', 'bloqueios')}</span></td></tr>`; })}</tbody></table>
    </div>
  </article>`;
}

/* ================= Reclamações ================= */
function Reclamacoes({go, perguntar, setCtx}){
  const [aberta, setAberta] = useState(za[0].id);
  useEffect(() => { setCtx({label:'Reclamações no STF', nota:'A usuária está vendo as reclamações constitucionais no STF. Use listar_reclamacoes.'}); }, []);
  return html`<div className="page v-in">
    <header className="ph fill-in"><div><h1>Reclamações constitucionais</h1><p>${za.length} reclamações no STF com base na ADPF 664, contra bloqueios de verbas dos contratos de gestão. Em discussão: <b>${fmtK(sum(za, r => r.valorDiscutido))}</b>.</p></div>
      <div className="ph-act"><button className="btn ai" onClick=${() => perguntar(MODELOS[5].p())}><${Icon} n="sparkle" s=${14}/>Resumo com o assistente</button></div></header>
    <div className="surface fill-in"><ul className="rlist big">${za.map(r => { const on = aberta === r.id;
      return html`<li key=${r.id} className=${on ? 'open' : ''}>
        <button aria-expanded=${on} onClick=${() => setAberta(on ? null : r.id)}>
          <span className="mono strong">${r.numero}</span>
          <span className="rl-t"><b>${r.cliente}</b><small>${r.assunto}</small></span>
          <${Etapas} r=${r}/>
          <span className="num rl-v">${fmtK(r.valorDiscutido)}</span>
          <span className="chev"><${Icon} n="down" s=${15}/></span>
        </button>
        ${on ? html`<div className="rl-body rev">
          <div><h4>Ato reclamado</h4><p className="quote">${r.ato}</p>
            <h4 style=${{marginTop:22}}>Processos de origem</h4>
            <div style=${{display:'flex',flexDirection:'column',gap:6}}>${r.processosOrigem.map(id => { const p = procById(id);
              return html`<button key=${id} className="lnk" onClick=${() => go('processos', {sel:id})}><span><span className="mono strong">${p.numero}</span><span className="who-s" style=${{display:'block'}}>${p.desc} · ${fmtK(bloqAtivo(p))} bloqueado</span></span><${Icon} n="right" s=${14}/></button>`; })}</div></div>
          <div><h4>Andamento</h4><${Timeline} items=${r.movs.map(([d, t]) => ({date:d, text:t, tone:toneDe(t) || 'acc'}))}/>
            <dl className="dl"><div><dt>Liminar</dt><dd><span className=${'st ' + (r.liminar === 'Deferida' ? 'good' : 'warn')}>${r.liminar}</span></dd></div><div><dt>Paradigma</dt><dd>${r.paradigma}</dd></div></dl></div>
        </div>` : null}
      </li>`; })}</ul></div>
  </div>`;
}

/* ================= Desempenho ================= */
function Desempenho({setCtx}){
  useEffect(() => { setCtx({label:'Desempenho', nota:'A usuária está vendo a tela de Desempenho (carteira, passivo por mês, devolvido e revertido).'}); }, []);
  const [per, setPer] = useState('2026');
  const [s1, setS1] = useState(null), [s2, setS2] = useState(null), [s3, setS3] = useState(null);
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
  return html`<div className="page v-in">
    <header className="ph fill-in"><div><h1>Desempenho</h1>
      <p>No período, o passivo estimado ${varP >= 0 ? 'subiu' : 'caiu'} <b>${Math.abs(varP)}%</b> e chegou a ${fmtK(lp.total)}. Entraram ${novos} processos e ${plural(encs, 'foi encerrado', 'foram encerrados')} ${encs}; ${fmtK(devV)} voltaram aos clientes em ${plural(devQ, 'desbloqueio', 'desbloqueios')}.</p></div>
      <div className="ph-act"><div className="seg" role="group" aria-label="Período">${[['2026', 'Ano todo'], ['6m', '6 meses'], ['3m', '3 meses']].map(([k, l]) => html`<button key=${k} aria-pressed=${per === k} onClick=${() => setPer(k)}>${l}</button>`)}</div></div></header>
    <section className="pane fill-in">
      <div className="sec-h"><h2>Passivo estimado no fim de cada mês</h2><${Legend} items=${PROGS.map(pg => [pg, PROG_COR[pg]])}/></div>
      <div onMouseLeave=${() => setS1(null)}><${StackBars} h=${280} cats=${cats} series=${PROGS.map(pg => ({label:pg, color:PROG_COR[pg], vals:pass.map(m => m[pg])}))} fmt=${v => fmtK(v).replace('R$ ', '')} sel=${s1} onSel=${setS1} label="Passivo estimado por mês e prognóstico"/></div>
      <div className="readout"><b>${D.V12mesLongo(cats[i1])}</b><span>Total <b className="num">${fmtK(pass[i1].total)}</b></span>${PROGS.map(pg => html`<span key=${pg}>${pg} <b className="num">${fmtK(pass[i1][pg])}</b></span>`)}</div>
    </section>
    <div className="row r3 fill-in">
      <section>
        <div className="sec-h"><h2>Carteira</h2><span className="cnt">${full.carteiraHoje} processos hoje · ${full.carteiraHoje - cartIni >= 0 ? '+' : ''}${full.carteiraHoje - cartIni}</span></div>
        <${LineChart} h=${180} cats=${cats} lines=${[{label:'Carteira', color:'var(--brand)', vals:meses.map(m => m.carteira)}]} fmt=${fmtN} sel=${s2} onSel=${setS2} label="Processos ativos no fim de cada mês"/>
        <div className="readout"><b>${cats[i2]}</b><span><b className="num">${meses[i2].carteira}</b> processos</span><span>+${meses[i2].novos} / −${meses[i2].encerrados}</span></div>
      </section>
      <section>
        <div className="sec-h"><h2>Devolvido aos clientes</h2><span className="cnt">média de ${D.jw().diasMedio} dias até liberar</span></div>
        <div onMouseLeave=${() => setS3(null)}><${StackBars} h=${180} cats=${cats} series=${[{label:'Devolvido', color:'var(--m-dev)', vals:meses.map(m => m.levantadoValor)}]} fmt=${v => v ? fmtK(v).replace('R$ ', '') : ''} sel=${s3} onSel=${setS3} label="Valor devolvido por mês"/></div>
        <div className="readout"><b>${cats[i3]}</b><span>${meses[i3].levantadoValor ? html`<b className="num">${fmtK(meses[i3].levantadoValor)}</b> em ${meses[i3].levantadoQtd}` : 'nenhum'}</span></div>
      </section>
      <section>
        <div className="sec-h"><h2>Revertido nos encerrados</h2><span className="cnt">${disc ? Math.round(rev / disc * 100) : 0}% de ${fmtK(disc)}</span></div>
        <div style=${{display:'flex',flexDirection:'column',gap:18,paddingTop:6}}>
          <div><div className="cnt" style=${{marginBottom:10}}>Por área</div><${HBars} rows=${porArea.map(a => ({label:a.nome, total:a.emDiscussao, vals:[a.revertido, a.emDiscussao - a.revertido]}))} parts colors=${['var(--m-dev)', 'var(--line-2)']} fmt=${fmtK0}/></div>
          <div><div className="cnt" style=${{marginBottom:10}}>Por cliente</div><${HBars} rows=${porCli.map(a => ({label:a.nome, total:a.emDiscussao, vals:[a.revertido, a.emDiscussao - a.revertido]}))} parts colors=${['var(--m-dev)', 'var(--line-2)']} fmt=${fmtK0}/></div>
          <${Legend} items=${[['Revertido', 'var(--m-dev)'], ['Mantido', 'var(--line-2)']]}/>
        </div>
      </section>
    </div>
  </div>`;
}

