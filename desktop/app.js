/* ================= Dados (os mesmos do App dos Sócios) ================= */
const D = window.DADOS;
const {Hn, Se, Tn, fe, ti, di, za, $o, ir} = D;
const fmtK = v => D.bn(v);
const fmtR = v => D.Xt(v);
const fmtN = v => Math.round(v).toLocaleString('pt-BR');
const MESC = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const fmtD = d => d ? `${d.getDate()} ${MESC[d.getMonth()]}` : '—';
const fmtDL = d => d ? d.toLocaleDateString('pt-BR') : '—';
const dia = 864e5;
const AREAS = ['Trabalhista','Cível','Administrativo','Constitucional'];
const AREA_COR = {Trabalhista:'var(--c1)','Cível':'var(--c2)',Administrativo:'var(--c3)',Constitucional:'var(--ink-3)'};
const PROGS = ['Provável','Possível','Remoto'];
const PROG_COR = {'Provável':'var(--bad)','Possível':'var(--warn)','Remoto':'var(--ink-3)'};
const MONEY = {bloqueado:'var(--warn)',devolvido:'var(--good)',perdido:'var(--bad)'};
const TILE = {afne:'t1',gnosis:'t3',fas:'t2',igedes:'t4'};

const procById = id => Se.find(p => p.id === id);
const procByNum = n => Se.find(p => p.numero === n) || Se.find(p => n && p.numero.includes(String(n).trim()));
const bloqDe = p => Tn.filter(b => b.processoId === p.id);
const bloqAtivo = p => bloqDe(p).filter(b => b.status === 'Ativo').reduce((a, b) => a + b.valorNum, 0);
const stB = b => D.H1(b, procById(b.processoId));
const ST_B = {novo:['s-analise','Novo'],ativo:['s-parcial','Bloqueado'],parado:['s-parcial','Bloqueado · parado'],levantado:['s-ok','Devolvido'],perdido:['s-bloq','Perdido'],parcial:['s-perdido','Devolvido em parte']};
const hojeB = b => b.status === 'Ativo' ? b.valorNum : 0;
const sum = (l, f) => l.reduce((a, x) => a + f(x), 0);
const PARADO = 90;
const passivoTotal = sum(Se, p => p.valorCausa);

/* "Seguir processo": guardado só neste navegador */
const SEG_KEY = 'pauta:seguidos';
const lerSeg = () => { try { return new Set(JSON.parse(localStorage.getItem(SEG_KEY) || '[]')); } catch (e) { return new Set(); } };
function useSeguidos(){
  const [s, setS] = useState(lerSeg);
  const toggle = id => setS(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); try { localStorage.setItem(SEG_KEY, JSON.stringify([...n])); } catch (e) {} return n; });
  return [s, toggle];
}

/* Novidades dos últimos 7 dias da base */
const CORTE = new Date(Hn.getTime() - 7 * dia);
const NOVIDADES = (() => {
  const out = [];
  for (const b of Tn) {
    if (b.data >= CORTE) out.push({d:b.data, ic:'lock', tone:'warn', t:`Novo bloqueio de ${fmtR(b.original)}`, s:`${b.cliente} · ${b.contrato}`, go:['bloqueios',{sel:b.id}]});
    if (b.devolvidoEm && b.devolvidoEm >= CORTE) out.push({d:b.devolvidoEm, ic:'check', tone:'good', t:`${fmtR(b.devolvido)} devolvidos ao cliente`, s:`${b.cliente} · ${b.contrato}`, go:['bloqueios',{sel:b.id, aba:'todos'}]});
    if (b.perdidoEm && b.perdidoEm >= CORTE) out.push({d:b.perdidoEm, ic:'x', tone:'bad', t:`${fmtR(b.perdido)} transferidos ao credor`, s:`${b.cliente} · ${b.contrato}`, go:['bloqueios',{sel:b.id, aba:'perda'}]});
  }
  for (const p of Se) if (p.ultimaMov >= CORTE && p.movs[0]) out.push({d:p.ultimaMov, ic:'file', tone:'info', t:p.movs[0].text, s:`${p.cliente} · ${p.desc}`, go:['processos',{sel:p.id}]});
  for (const r of za) for (const [dt, tx] of r.movs) { const d = D.V12data(dt); if (d >= CORTE) out.push({d, ic:'landmark', tone:'acc', t:`${r.numero}: ${tx}`, s:r.cliente, go:['reclamacoes',{}]}); }
  return out.sort((a, b) => b.d - a.d);
})();

/* ================= Gráficos ================= */
function useW(def=640){ const ref=useRef(null); const [w,setW]=useState(def);
  useEffect(()=>{ const el=ref.current; if(!el||!window.ResizeObserver) return; const ro=new ResizeObserver(([e])=>setW(Math.max(260,Math.round(e.contentRect.width)))); ro.observe(el); return ()=>ro.disconnect(); },[]);
  return [ref,w]; }
const fmtK0 = v => v ? fmtK(v) : 'R$ 0';
const quando = s => String(s).replace(/^1 meses$/, '1 mês');
const plural = (n, a, b) => `${n} ${n === 1 ? a : b}`;
function StackBars({cats, series, fmt, h=230, sel, onSel, label}){
  const [ref, W] = useW();
  const top = 22, base = h - 26, n = cats.length;
  const tot = cats.map((_, i) => sum(series, s => s.vals[i] || 0));
  const max = Math.max(1, ...tot) * 1.08;
  const slot = W / n, bw = Math.min(46, slot * .58), sc = (base - top) / max;
  const ticks = [0, .5, 1].map(f => max / 1.08 * f);
  return html`<div ref=${ref}><svg className="svgc" width=${W} height=${h} viewBox=${`0 0 ${W} ${h}`} role="img" aria-label=${label}>
    ${ticks.map((t, k) => html`<line key=${k} x1="0" x2=${W} y1=${base - t * sc} y2=${base - t * sc} stroke="var(--line)" strokeDasharray=${k ? '3 4' : null}/>`)}
    ${cats.map((c, i) => {
      let y = base; const x = i * slot + (slot - bw) / 2; const dim = sel != null && sel !== i;
      return html`<g key=${c} className="hit" onMouseEnter=${() => onSel && onSel(i)} onClick=${() => onSel && onSel(i)}>
        <rect x=${i * slot} y="0" width=${slot} height=${base} fill="transparent"/>
        <g className="bar" style=${{animationDelay: (i * 50) + 'ms', opacity: dim ? .4 : 1}}>
          ${series.map((s, k) => { const v = s.vals[i] || 0, hh = v * sc; if (hh < .5) return null; y -= hh;
            return html`<rect key=${k} x=${x} y=${y + 1} width=${bw} height=${Math.max(0, hh - 2)} rx=${Math.min(6, hh / 2)} fill=${s.color}/>`; })}
        </g>
        ${tot[i] ? html`<text x=${x + bw / 2} y=${base - tot[i] * sc - 7} textAnchor="middle" fontSize="11" fontWeight="500" fill="var(--ink)" style=${{opacity: dim ? .35 : 1}} className="blabel">${fmt(tot[i])}</text>` : null}
        <text x=${x + bw / 2} y=${h - 6} textAnchor="middle" fontSize="11.5" fill=${sel === i ? 'var(--ink)' : 'var(--ink-3)'}>${c}</text>
      </g>`;
    })}
  </svg></div>`;
}

function LineChart({cats, lines, fmt, h=220, sel, onSel, label, area=true}){
  const [ref, W] = useW();
  const top = 20, base = h - 26, n = cats.length, pad = 18, padL = 44;
  const all = lines.flatMap(l => l.vals.filter(v => v != null));
  const mx = Math.max(1, ...all), mn = Math.min(0, ...all);
  const sc = (base - top) / ((mx - mn) * 1.08 || 1);
  const X = i => padL + (n === 1 ? (W - padL - pad) / 2 : i * (W - padL - pad) / (n - 1));
  const Y = v => base - (v - mn) * sc;
  const path = vals => { let d = '', pen = false; vals.forEach((v, i) => { if (v == null) { pen = false; return; } d += (pen ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1); pen = true; }); return d; };
  const ticks = [0, .5, 1].map(f => mn + (mx - mn) * f);
  return html`<div ref=${ref}><svg className="svgc" width=${W} height=${h} viewBox=${`0 0 ${W} ${h}`} role="img" aria-label=${label} onMouseLeave=${() => onSel && onSel(null)}>
    ${ticks.map((t, k) => html`<g key=${k}><line x1=${padL} x2=${W} y1=${Y(t)} y2=${Y(t)} stroke="var(--line)" strokeDasharray=${k ? '3 4' : null}/>
      <text x="0" y=${Y(t) + 4} fontSize="10.5" fill="var(--ink-3)">${fmt(t)}</text></g>`)}
    ${lines.map((l, k) => html`<g key=${k}>
      ${area && lines.length === 1 ? html`<path d=${path(l.vals) + ` L${X(n - 1)} ${base} L${X(0)} ${base} Z`} fill=${l.color} fillOpacity=".09" className="ribbon"/>` : null}
      <path d=${path(l.vals)} fill="none" stroke=${l.color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" pathLength="1" className="draw"/>
      ${l.vals.map((v, i) => v == null ? null : html`<circle key=${i} cx=${X(i)} cy=${Y(v)} r=${sel === i ? 5 : 3} fill="var(--surface)" stroke=${l.color} strokeWidth="2"/>`)}
    </g>`)}
    ${sel != null ? html`<line x1=${X(sel)} x2=${X(sel)} y1=${top - 6} y2=${base} stroke="var(--ink-3)" strokeDasharray="2 3"/>` : null}
    ${cats.map((c, i) => html`<g key=${i}><rect className="hit" x=${X(i) - (W / n) / 2} y="0" width=${W / n} height=${base} fill="transparent" onMouseEnter=${() => onSel && onSel(i)}/>
      <text x=${X(i)} y=${h - 6} textAnchor="middle" fontSize="11.5" fill=${sel === i ? 'var(--ink)' : 'var(--ink-3)'}>${c}</text></g>`)}
  </svg></div>`;
}

function HBars({rows, fmt, parts, colors}){
  const max = Math.max(1, ...rows.map(r => r.total ?? r.value));
  return html`<div className="hb">
    ${rows.map((r, i) => { const tot = r.total ?? r.value;
      return html`<div className="hb-r" key=${r.label + i}>
        <span className="l" title=${r.label}>${r.label}</span>
        <span className="hb-t">${parts ? r.vals.map((v, k) => v > 0 ? html`<i key=${k} style=${{width: (v / max * 100) + '%', background: colors[k], animationDelay: (i * 60) + 'ms'}}></i>` : null)
          : html`<i style=${{width: (tot / max * 100) + '%', background: r.color || 'var(--accent)', animationDelay: (i * 60) + 'ms'}}></i>`}</span>
        <span className="v num">${fmt(tot)}</span>
      </div>`; })}
  </div>`;
}

function Legend({items}){ return html`<div className="lg">${items.map(([l, c]) => html`<span key=${l}><i style=${{background: c}}></i>${l}</span>`)}</div>`; }

function MoneyBar({devolvido=0, perdido=0, bloqueado=0, big}){
  const t = devolvido + perdido + bloqueado || 1;
  return html`<div className=${'money' + (big ? ' lg2' : '')} role="img" aria-label=${`Devolvido ${fmtR(devolvido)}, perdido ${fmtR(perdido)}, ainda bloqueado ${fmtR(bloqueado)}`}>
    ${[[devolvido, MONEY.devolvido], [perdido, MONEY.perdido], [bloqueado, MONEY.bloqueado]].map(([v, c], k) => v > 0 ? html`<i key=${k} style=${{width: (v / t * 100) + '%', background: c, animationDelay: (k * 120) + 'ms'}}></i>` : null)}
  </div>`;
}

/* ================= Peças ================= */
const Status = ({k}) => html`<span className=${'status ' + ST_B[k][0]}>${ST_B[k][1]}</span>`;
const Prog = ({p}) => html`<span className=${'prog ' + p}>${p}</span>`;
const Tile = ({id, lg}) => html`<span className=${'tile ' + TILE[id] + (lg ? ' lg' : '')}>${fe[id].initials}</span>`;
function Timeline({items}){
  return html`<ul className="tl">${items.map((m, i) => html`<li key=${i} className=${m.tone || ''}><time>${m.date}</time><span className="d"></span><span>${m.text}</span></li>`)}</ul>`;
}
const toneDe = t => /perdid|credor/i.test(t) ? 'bad' : /liberad|levantad|devolv|deferid|procedente/i.test(t) ? 'good' : /bloqueio/i.test(t) ? 'warn' : '';
function Kpi({icon, label, value, fmt, sub, onClick, big, delay}){
  return html`<button className=${'kpi st' + (big ? ' big' : '')} style=${{animationDelay: delay}} onClick=${onClick}>
    <span className="kl"><i><${Icon} n=${icon} s=${15}/></i>${label}</span>
    <span className="kv"><${CountUp} to=${value} fmt=${fmt}/></span>
    <span className="ks">${sub}</span>
  </button>`;
}
function Card({title, right, children, delay, className=''}){
  return html`<section className=${'card st ' + className} style=${{animationDelay: delay}}>
    ${title ? html`<div className="card-h"><h2>${title}</h2>${right}</div>` : null}${children}</section>`;
}

/* ================= Painel ================= */
const PERGUNTAS = [
  {i:'lock', c:'var(--accent)', label:'Bloqueado por cliente', text:'Quanto está bloqueado hoje, por cliente e por contrato de gestão?'},
  {i:'clock', c:'var(--warn)', label:'Processos parados', text:'Quais processos estão parados há mais de 90 dias?'},
  {i:'trend', c:'var(--info)', label:'Perdido e devolvido', text:'Quanto cada cliente perdeu e quanto recuperou em bloqueios este ano?'}
];

function Painel({go, ask, boxText, setBoxText, typeInto}){
  const [sel, setSel] = useState(null);
  const meses = MESC.slice(0, Hn.getMonth() + 1).map(m => m[0].toUpperCase() + m.slice(1));
  const series = AREAS.slice(0, 3).map(a => ({label:a, color:AREA_COR[a], vals:meses.map((_, i) => sum(Tn.filter(b => b.mes === i && b.area === a), b => b.original))}));
  const h = sel == null ? meses.length - 1 : sel;
  const ativos = Tn.filter(b => b.status === 'Ativo');
  const parados = D.nc(Se).length;
  const dev = sum(Tn, b => b.devolvido), per = sum(Tn, b => b.perdido);
  const prov = sum(Se.filter(p => p.prognostico === 'Provável'), p => p.valorCausa);
  const recentes = Tn.slice(0, 7);
  const d = i => (i * 70) + 'ms';
  return html`<div className="view">
    <div className="hello st">
      <div><h1>${greeting()}, Orlando</h1><p>Azevedo dos Reis · Terceiro Setor. Dados do Legal One e do Log de Bloqueios até ${fmtDL(Hn)}.</p></div>
      <div className="hello-act"><span className="chip-date"><${Icon} n="cal" s=${14}/>Base de ${fmtD(Hn)} de 2026</span>
        <button className="btn primary" onClick=${() => go('ia')}><${Icon} n="sparkle" s=${15}/>Pergunte à IA</button></div>
    </div>
    <div className="row r4">
      <${Kpi} big delay=${d(1)} icon="lock" label="Bloqueado hoje" value=${ir.bloqueadoAtivo} fmt=${fmtK} sub=${`${ativos.length} bloqueios ativos em ${ti.length} clientes`} onClick=${() => go('bloqueios', {aba:'ativos'})}/>
      <${Kpi} delay=${d(2)} icon="scale" label="Processos" value=${Se.length} fmt=${fmtN} sub=${html`<span className="delta bad">${parados} parados há ${PARADO}+ dias</span>`} onClick=${() => go('processos', {parados:true})}/>
      <${Kpi} delay=${d(3)} icon="file" label="Passivo estimado" value=${passivoTotal} fmt=${fmtK} sub=${`${fmtK(prov)} com prognóstico provável`} onClick=${() => go('desempenho')}/>
      <${Kpi} delay=${d(4)} icon="trend" label="Perdido em 2026" value=${per} fmt=${fmtK} sub=${html`<span className="delta good">${fmtK(dev)} devolvidos</span>`} onClick=${() => go('bloqueios', {aba:'perda'})}/>
    </div>
    <div className="row r1">
      <${Card} delay=${d(5)} title="Bloqueios por mês e por área" right=${html`<span className="mini"><${Icon} n="cal" s=${13}/>Jan – Out 2026</span>`}>
        <div onMouseLeave=${() => setSel(null)}><${StackBars} cats=${meses} series=${series} fmt=${v => fmtK(v).replace('R$ ', '')} sel=${sel} onSel=${setSel} label="Valor bloqueado por mês, por área, em 2026"/></div>
        <div style=${{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap',marginTop:8}}>
          <${Legend} items=${series.map(s => [s.label, s.color])}/>
        </div>
        <div className="detail" aria-live="polite"><b>${D.V12mesLongo(meses[h])}</b> · bloqueado no mês <b className="num">${fmtR(sum(series, s => s.vals[h]))}</b>
          ${series.map(s => html`<span key=${s.label}> · ${s.label} <b className="num">${fmtK(s.vals[h])}</b></span>`)}</div>
      <//>
      <${Card} delay=${d(6)} title="Novidades da semana" right=${html`<span className="mini">${fmtD(CORTE)} a ${fmtD(Hn)}</span>`}>
        <div className="news">${NOVIDADES.slice(0, 7).map((n, i) => html`<button key=${i} className="nw" style=${{animationDelay: (300 + i * 60) + 'ms'}} onClick=${() => go(...n.go)}>
          <span className=${'ic ' + n.tone}><${Icon} n=${n.ic} s=${15}/></span>
          <span style=${{minWidth:0}}><span className="t">${n.t}</span><span className="s" style=${{display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>${n.s}</span></span>
          <span className="w">${fmtD(n.d)}</span></button>`)}</div>
      <//>
    </div>
    <div className="row r2">
      <${AIBox} delay=${d(7)} text=${boxText} setText=${setBoxText} onSend=${ask} onChip=${t => typeInto(t, setBoxText).catch(() => {})} onOpen=${() => go('ia')}/>
      <${Card} delay=${d(8)} title="Bloqueios recentes" right=${html`<button className="link" onClick=${() => go('bloqueios', {aba:'todos'})}>Ver os ${Tn.length} bloqueios</button>`}>
        <div className="tbl-wrap"><table className="sel">
          <thead><tr><th>Cliente · contrato</th><th>Processo</th><th className="r">Valor</th><th>Data</th><th>Situação</th></tr></thead>
          <tbody>${recentes.map(b => html`<tr key=${b.id} onClick=${() => go('bloqueios', {sel:b.id, aba:'todos'})}>
            <td><div className="who"><${Tile} id=${b.clienteId}/><div><div className="who-n">${b.cliente}</div><div className="who-s">${b.contrato}</div></div></div></td>
            <td className="mono">${b.processoId && procById(b.processoId).numero}</td>
            <td className="r num" style=${{fontWeight:500}}>${fmtR(b.original)}</td>
            <td className="num" style=${{color:'var(--ink-2)'}}>${fmtD(b.data)}</td>
            <td><${Status} k=${stB(b)}/></td></tr>`)}</tbody>
        </table></div>
      <//>
    </div>
    <div className="row r4">${ti.map((id, i) => { const a = D.aa(id);
      return html`<button key=${id} className="cl-card st" style=${{animationDelay: d(9 + i)}} onClick=${() => go('clientes', {cli:id})}>
        <div className="cl-top"><${Tile} id=${id} lg/><div><b>${fe[id].name}</b><small>${fe[id].contratos.length} contratos de gestão</small></div></div>
        <${MoneyBar} devolvido=${a.levantado} perdido=${a.perdido} bloqueado=${a.bloqueadoAtivo}/>
        <div className="cl-nums"><div><small>Processos</small><b className="num">${a.processos.length}</b></div>
          <div><small>Bloqueado</small><b className="num">${fmtK(a.bloqueadoAtivo)}</b></div>
          <div><small>Passivo</small><b className="num">${fmtK(a.passivo.total)}</b></div></div>
      </button>`; })}</div>
    <${Card} delay=${d(13)} title="Reclamações constitucionais no STF" right=${html`<button className="link" onClick=${() => go('reclamacoes')}>Abrir reclamações</button>`}>
      <div className="row r3">${za.map(r => html`<button key=${r.id} className="mini-b" onClick=${() => go('reclamacoes')}>
        <div className="r"><span className="cg-no">${r.numero}</span><span className=${'status ' + (r.liminar === 'Deferida' ? 's-ok' : 's-parcial')}>Liminar ${r.liminar.toLowerCase()}</span></div>
        <div style=${{fontSize:13,fontWeight:500}}>${r.cliente}</div>
        <div className="who-s">${r.assunto}</div>
        <div className="r"><span className="who-s">${r.status} · ${r.paradigma}</span><b className="num" style=${{fontWeight:500,fontSize:13}}>${fmtK(r.valorDiscutido)}</b></div>
      </button>`)}</div>
    <//>
    <p className="foot">Dados de exemplo, os mesmos do App dos Sócios. Nada do que você faz aqui muda o Legal One.</p>
  </div>`;
}

function AIBox({text, setText, onSend, onChip, onOpen, delay}){
  const ready = text.trim().length > 0;
  return html`<section className="ai st" style=${{animationDelay: delay}}>
    <div className="ai-h"><h2>Assistente</h2>
      <div className="ai-btns"><button className="ai-btn" onClick=${onOpen} aria-label="Abrir em tela cheia" title="Abrir em tela cheia"><${Icon} n="upright" s=${15}/></button></div></div>
    <div className="ai-panel">
      <div className="ai-top">
        <div className="sugs">${PERGUNTAS.map(p => html`<button key=${p.label} className="sug" onClick=${() => onChip(p.text)}><span className="sug-ic" style=${{background: p.c}}><${Icon} n=${p.i} s=${13} w=${2}/></span>${p.label}</button>`)}</div>
        <${Courthouse}/>
      </div>
      <form className="box-in" onSubmit=${e => { e.preventDefault(); onSend(text); }}>
        <textarea id="ai-box" rows="2" aria-label="Pergunte ao assistente" placeholder="Pergunte sobre processos, bloqueios ou contratos…" value=${text}
          onInput=${e => setText(e.target.value)} onKeyDown=${e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(text); } }}></textarea>
        <button type="submit" className=${'send' + (ready ? ' ready' : '')} aria-label="Enviar pergunta" disabled=${!ready}><${Icon} n="up" s=${16} w=${2}/></button>
      </form>
    </div>
    <div className="ai-note">A IA consulta os dados do escritório. Ela não inventa números.</div>
  </section>`;
}

/* ================= Processos ================= */
function Processos({opts, go, seg, toggleSeg, ask}){
  const [q, setQ] = useState('');
  const [cli, setCli] = useState(opts.cli || null);
  const [area, setArea] = useState(null);
  const [parados, setParados] = useState(!!opts.parados);
  const [comBloq, setComBloq] = useState(false);
  const [sigo, setSigo] = useState(!!opts.sigo);
  const [ord, setOrd] = useState(opts.parados ? 'parado' : 'recente');
  const [sel, setSel] = useState(opts.sel || null);
  const f = D.Lr ? q.trim().toLowerCase() : '';
  let list = Se.filter(p => (!cli || p.clienteId === cli) && (!area || p.area === area) && (!parados || p.diasParado >= PARADO)
    && (!comBloq || bloqAtivo(p) > 0) && (!sigo || seg.has(p.id))
    && (!f || (p.numero + p.desc + p.cliente + p.contrato + p.status).toLowerCase().includes(f)));
  const ORD = {recente:(a, b) => a.diasParado - b.diasParado, parado:(a, b) => b.diasParado - a.diasParado, valor:(a, b) => b.valorCausa - a.valorCausa, bloq:(a, b) => bloqAtivo(b) - bloqAtivo(a)};
  list = list.slice().sort(ORD[ord]);
  const cur = (sel && procById(sel)) || list[0];
  return html`<div className="view">
    <div className="hello st"><div><h1>Processos</h1><p>${Se.length} processos dos 4 clientes. Clique num processo para ver as movimentações e os bloqueios.</p></div></div>
    <div className="md">
      <${Card} delay="60ms">
        <div className="toolbar">
          <label className="search"><${Icon} n="search" s=${14}/><input id="proc-q" placeholder="Número, cliente ou assunto" value=${q} onInput=${e => setQ(e.target.value)}/></label>
          <div className="chips">${[[null, 'Todos'], ...ti.map(id => [id, fe[id].name])].map(([id, l]) => html`<button key=${l} className="fbtn" aria-pressed=${cli === id} onClick=${() => setCli(id)}>${l}</button>`)}</div>
        </div>
        <div className="toolbar">
          <div className="chips">${[null, ...AREAS].map(a => html`<button key=${a || 't'} className="fbtn" aria-pressed=${area === a} onClick=${() => setArea(a)}>${a || 'Todas as áreas'}</button>`)}</div>
          <span className="grow"></span>
          <div className="chips">
            <button className="fbtn" aria-pressed=${parados} onClick=${() => setParados(v => !v)}><${Icon} n="clock" s=${13}/>Parados ${PARADO}+ dias</button>
            <button className="fbtn" aria-pressed=${comBloq} onClick=${() => setComBloq(v => !v)}><${Icon} n="lock" s=${13}/>Com bloqueio</button>
            <button className="fbtn" aria-pressed=${sigo} onClick=${() => setSigo(v => !v)}><${Icon} n="bookmark" s=${13}/>Sigo <span className="n">${seg.size}</span></button>
          </div>
        </div>
        <div className="toolbar"><span className="cnt">${list.length} de ${Se.length} processos</span><span className="grow"></span>
          <div className="seg" role="group" aria-label="Ordenar">${[['recente', 'Movimentados'], ['parado', 'Mais parados'], ['valor', 'Maior valor'], ['bloq', 'Mais bloqueado']].map(([k, l]) => html`<button key=${k} aria-pressed=${ord === k} onClick=${() => setOrd(k)}>${l}</button>`)}</div></div>
        <div className="tbl-wrap"><table className="sel">
          <thead><tr><th>Processo</th><th>Cliente · contrato</th><th className="hide-md">Área</th><th>Situação</th><th className="r">Em discussão</th><th className="r">Bloqueado</th></tr></thead>
          <tbody>${list.map(p => { const bl = bloqAtivo(p);
            return html`<tr key=${p.id} aria-selected=${cur && cur.id === p.id} onClick=${() => setSel(p.id)}>
              <td><span className="mono">${p.numero}</span>${seg.has(p.id) ? html` <span title="Você segue" style=${{color:'var(--accent)'}}><${Icon} n="bookmark" s=${11}/></span>` : null}<span className="sub">${p.desc}</span></td>
              <td><span className="who-n">${p.cliente}</span><span className="sub">${p.contrato}</span></td>
              <td className="hide-md" style=${{color:'var(--ink-2)'}}>${p.area}</td>
              <td>${p.diasParado >= PARADO ? html`<span className="status s-parcial">Parado há ${p.diasParado} dias</span>` : html`<span className="status s-neutro">${p.status}</span>`}<span className="sub">Últ. mov. ${quando(p.lastUpdate)}</span></td>
              <td className="r num">${p.valorCausa ? fmtK(p.valorCausa) : '—'}<span className="sub" style=${{textAlign:'right'}}>${p.valorCausa ? p.prognostico : ''}</span></td>
              <td className="r num" style=${{fontWeight: bl ? 500 : 400, color: bl ? 'var(--ink)' : 'var(--ink-3)'}}>${bl ? fmtK(bl) : '—'}</td>
            </tr>`; })}
            ${list.length ? null : html`<tr><td colSpan="6" className="empty">Nenhum processo com esses filtros.</td></tr>`}</tbody>
        </table></div>
      <//>
      <aside className="card panel st" style=${{animationDelay:'140ms'}}>${cur ? html`<${ProcDetail} key=${cur.id} p=${cur} go=${go} seg=${seg} toggleSeg=${toggleSeg} ask=${ask}/>` : html`<div className="empty-p">Nenhum processo selecionado.</div>`}</aside>
    </div>
  </div>`;
}

function ProcDetail({p, go, seg, toggleSeg, ask}){
  const bl = bloqDe(p), seguindo = seg.has(p.id);
  return html`<div className="rev">
    <div className="dh">
      <span className="mono">${p.numero}</span>
      <h3>${p.desc}</h3>
      <span className="meta">${p.cliente} · ${p.contrato}</span>
      <div className="dacts">
        <button className=${'btn sm ' + (seguindo ? 'on' : 'ghost')} onClick=${() => toggleSeg(p.id)} aria-pressed=${seguindo}><${Icon} n="bookmark" s=${14}/>${seguindo ? 'Seguindo' : 'Seguir processo'}</button>
        <button className="btn sm ghost" onClick=${() => ask(`Conte a história do processo ${p.numero} por fases, com as datas das movimentações e o que aconteceu com os bloqueios.`)}><${Icon} n="sparkle" s=${14}/>Contar a história</button>
      </div>
    </div>
    <div className="facts">
      <div className="fact"><small>Área</small><b>${p.area}</b></div>
      <div className="fact"><small>Situação</small><b>${p.status}</b></div>
      <div className="fact"><small>Última movimentação</small><b>${fmtDL(p.ultimaMov)}</b></div>
      <div className="fact"><small>Parado há</small><b style=${{color: p.diasParado >= PARADO ? 'var(--warn)' : null}}>${p.diasParado ? p.diasParado + ' dias' : 'Movimentou hoje'}</b></div>
      <div className="fact"><small>Valor em discussão</small><b className="num">${p.valorCausa ? fmtR(p.valorCausa) : '—'}</b></div>
      <div className="fact"><small>Prognóstico</small><b>${p.valorCausa ? html`<${Prog} p=${p.prognostico}/>` : '—'}</b>
        ${p.prognosticoAntes ? html`<small>Era ${p.prognosticoAntes.era.toLowerCase()} até ${MESC[p.prognosticoAntes.mes]}</small>` : null}</div>
    </div>
    ${bl.length ? html`<div className="dsec"><h4>Bloqueios neste processo <span className="cnt">${bl.length}</span></h4>
      <div style=${{display:'flex',flexDirection:'column',gap:8}}>${bl.map(b => html`<button key=${b.id} className="mini-b" onClick=${() => go('bloqueios', {sel:b.id, aba:'todos'})}>
        <div className="r"><b className="num" style=${{fontWeight:500}}>${fmtR(b.original)}</b><${Status} k=${stB(b)}/></div>
        <${MoneyBar} devolvido=${b.devolvido} perdido=${b.perdido} bloqueado=${hojeB(b)}/>
        <div className="r who-s"><span>Bloqueado em ${fmtDL(b.data)}</span><span>Ver caminho do dinheiro →</span></div>
      </button>`)}</div></div>` : null}
    <div className="dsec"><h4>Movimentações</h4>
      <${Timeline} items=${p.movs.map(m => ({date:m.date, text:m.text, tone:toneDe(m.text)}))}/></div>
  </div>`;
}

/* ================= Bloqueios ================= */
const ABAS = [['ativos', 'Ativos', b => b.status === 'Ativo'], ['encerrados', 'Encerrados', b => b.status === 'Levantado'], ['perda', 'Com perda', b => b.perdido > 0], ['todos', 'Todos', () => true]];
function Bloqueios({opts, go}){
  const [aba, setAba] = useState(opts.aba || (opts.sel ? 'todos' : 'ativos'));
  const [cli, setCli] = useState(opts.cli || null);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(opts.sel || null);
  const fA = ABAS.find(a => a[0] === aba)[2];
  const base = Tn.filter(b => !cli || b.clienteId === cli);
  const f = q.trim().toLowerCase();
  const list = base.filter(fA).filter(b => !f || (b.cliente + b.contrato + procById(b.processoId).numero + b.area).toLowerCase().includes(f));
  const cur = (sel && Tn.find(b => b.id === sel)) || list[0];
  const hoje = sum(base, hojeB), dev = sum(base, b => b.devolvido), per = sum(base, b => b.perdido), orig = sum(base, b => b.original);
  return html`<div className="view">
    <div className="hello st"><div><h1>Bloqueios</h1><p>${Tn.length} bloqueios SISBAJUD em 2026. Para cada um, o caminho do dinheiro: o que ainda está bloqueado, o que voltou ao cliente e o que foi perdido.</p></div></div>
    <div className="row r4">
      <div className="kpi st" style=${{cursor:'default',animationDelay:'40ms'}}><span className="kl"><i><${Icon} n="lock" s=${15}/></i>Bloqueado em 2026</span><span className="kv"><${CountUp} to=${orig} fmt=${fmtK}/></span><span className="ks">${base.length} bloqueios${cli ? ' de ' + fe[cli].name : ''}</span></div>
      <div className="kpi st" style=${{cursor:'default',animationDelay:'90ms'}}><span className="kl"><i style=${{color:MONEY.bloqueado}}><${Icon} n="lock" s=${15}/></i>Ainda bloqueado</span><span className="kv"><${CountUp} to=${hoje} fmt=${fmtK}/></span><span className="ks">${Math.round(hoje / orig * 100)}% do total</span></div>
      <div className="kpi st" style=${{cursor:'default',animationDelay:'140ms'}}><span className="kl"><i style=${{color:MONEY.devolvido}}><${Icon} n="check" s=${15}/></i>Devolvido ao cliente</span><span className="kv"><${CountUp} to=${dev} fmt=${fmtK}/></span><span className="ks">${Math.round(dev / orig * 100)}% do total</span></div>
      <div className="kpi st" style=${{cursor:'default',animationDelay:'190ms'}}><span className="kl"><i style=${{color:MONEY.perdido}}><${Icon} n="x" s=${15}/></i>Perdido</span><span className="kv"><${CountUp} to=${per} fmt=${fmtK}/></span><span className="ks">${Math.round(per / orig * 100)}% do total, transferido ao credor</span></div>
    </div>
    <div className="card st" style=${{animationDelay:'220ms',padding:'16px 20px'}}>
      <${MoneyBar} big devolvido=${dev} perdido=${per} bloqueado=${hoje}/>
      <div style=${{marginTop:10}}><${Legend} items=${[['Devolvido', MONEY.devolvido], ['Perdido', MONEY.perdido], ['Ainda bloqueado', MONEY.bloqueado]]}/></div>
    </div>
    <div className="md">
      <${Card} delay="260ms">
        <div className="toolbar">
          <div className="seg" role="group" aria-label="Situação">${ABAS.map(([k, l, fn]) => html`<button key=${k} aria-pressed=${aba === k} onClick=${() => { setAba(k); setSel(null); }}>${l} <span className="cnt">${base.filter(fn).length}</span></button>`)}</div>
          <span className="grow"></span>
          <label className="search"><${Icon} n="search" s=${14}/><input id="bloq-q" placeholder="Cliente, contrato ou processo" value=${q} onInput=${e => setQ(e.target.value)}/></label>
        </div>
        <div className="toolbar"><div className="chips">${[[null, 'Todos os clientes'], ...ti.map(id => [id, fe[id].name])].map(([id, l]) => html`<button key=${l} className="fbtn" aria-pressed=${cli === id} onClick=${() => { setCli(id); setSel(null); }}>${l}</button>`)}</div></div>
        <div className="tbl-wrap"><table className="sel">
          <thead><tr><th>Data</th><th>Cliente · contrato</th><th className="hide-md">Processo</th><th className="r">Bloqueado</th><th className="r">Hoje</th><th>Situação</th></tr></thead>
          <tbody>${list.map(b => html`<tr key=${b.id} aria-selected=${cur && cur.id === b.id} onClick=${() => setSel(b.id)}>
            <td className="num" style=${{color:'var(--ink-2)'}}>${fmtD(b.data)}</td>
            <td><div className="who"><${Tile} id=${b.clienteId}/><div><div className="who-n">${b.cliente}</div><div className="who-s">${b.contrato}</div></div></div></td>
            <td className="hide-md"><span className="mono">${procById(b.processoId).numero}</span><span className="sub">${b.area}</span></td>
            <td className="r num">${fmtR(b.original)}</td>
            <td className="r num" style=${{fontWeight:500,color: hojeB(b) ? 'var(--ink)' : 'var(--ink-3)'}}>${hojeB(b) ? fmtR(hojeB(b)) : '—'}</td>
            <td><${Status} k=${stB(b)}/></td></tr>`)}
            ${list.length ? null : html`<tr><td colSpan="6" className="empty">Nenhum bloqueio aqui.</td></tr>`}</tbody>
        </table></div>
      <//>
      <aside className="card panel st" style=${{animationDelay:'320ms'}}>${cur ? html`<${BloqDetail} key=${cur.id} b=${cur} go=${go}/>` : html`<div className="empty-p">Nenhum bloqueio selecionado.</div>`}</aside>
    </div>
  </div>`;
}

function BloqDetail({b, go}){
  const p = procById(b.processoId);
  const contas = D.V10contas(b.clienteId, b.contrato, Tn.filter(x => x.clienteId === b.clienteId && x.contrato === b.contrato));
  const conta = contas.find(c => c.bloqueios.includes(b));
  const rows = [['perdido', 'Perdido', 'transferido ao credor', b.perdido, b.perdidoEm], ['devolvido', 'Devolvido ao cliente', 'liberado por decisão judicial', b.devolvido, b.devolvidoEm], ['bloqueado', 'Ainda bloqueado', 'na conta do contrato', hojeB(b), null]];
  return html`<div className="rev">
    <div className="dh">
      <span className="who-s">Bloqueio SISBAJUD · ${fmtDL(b.data)}</span>
      <h3 className="num" style=${{fontSize:26}}>${fmtR(b.original)}</h3>
      <span className="meta">${b.cliente} · ${b.contrato}</span>
      <div><${Status} k=${stB(b)}/></div>
    </div>
    <div className="dsec"><h4>Caminho do dinheiro</h4>
      <${MoneyBar} big devolvido=${b.devolvido} perdido=${b.perdido} bloqueado=${hojeB(b)}/>
      <div className="mrows">${rows.map(([k, l, s, v, em]) => html`<div className="mrow" key=${k} style=${{opacity: v ? 1 : .45}}>
        <i style=${{background: MONEY[k]}}></i><span>${l}<small>${v ? (em ? `${s} em ${fmtDL(em)}` : s) : 'nada'}</small></span><b className="num">${v ? fmtR(v) : 'R$ 0'}</b></div>`)}</div>
    </div>
    ${conta ? html`<div className="dsec"><h4>Conta atingida</h4>
      <div className="acct" style=${{borderTop:0}}><span className="bk"><${Icon} n="landmark" s=${16}/></span>
        <span>${conta.banco} · ag. ${conta.agencia} · c/c ${conta.final}<small>${conta.fim}</small></span><span className="cnt">${conta.bloqueios.length} bloqueios</span></div></div>` : null}
    <div className="dsec"><h4>Histórico</h4><${Timeline} items=${b.historico.map(h => ({date:h.date, text:h.text, tone:toneDe(h.text)}))}/></div>
    <div className="dsec"><h4>Processo</h4>
      <button className="lnk" onClick=${() => go('processos', {sel:p.id})}><span><span className="mono">${p.numero}</span><span className="who-s" style=${{display:'block'}}>${p.desc}</span></span><${Icon} n="right" s=${15}/></button></div>
  </div>`;
}

/* ================= Clientes ================= */
function Clientes({opts, go, ask}){
  const [cli, setCli] = useState(opts.cli || 'gnosis');
  const a = D.aa(cli), c = fe[cli];
  const enc = D.ac(cli);
  return html`<div className="view">
    <div className="hello st"><div><h1>Clientes</h1><p>Organizações sociais e seus contratos de gestão: passivo, bloqueios e contas de cada contrato.</p></div></div>
    <div className="cl-layout">
      <nav className="cl-side st" aria-label="Clientes" style=${{animationDelay:'40ms'}}>${ti.map(id => { const x = D.aa(id);
        return html`<button key=${id} className="cl-tab" aria-current=${cli === id} onClick=${() => setCli(id)}><${Tile} id=${id}/><span><b>${fe[id].name}</b><small>${x.processos.length} processos · ${fmtK(x.bloqueadoAtivo)}</small></span></button>`; })}</nav>
      <div className="view" key=${cli}>
        <div className="card rev" style=${{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
          <${Tile} id=${cli} lg/>
          <div style=${{flex:1,minWidth:200}}><div style=${{fontSize:20,fontWeight:500,letterSpacing:'-.02em'}}>${c.name}</div><div className="who-s">${c.contratos.length} contratos de gestão · ${a.processos.length} processos</div></div>
          <button className="btn ghost sm" onClick=${() => go('processos', {cli})}><${Icon} n="scale" s=${14}/>Ver processos</button>
          <button className="btn primary sm" onClick=${() => ask(`Faça um resumo do ${c.name}: passivo por contrato de gestão, bloqueios ativos e o que foi perdido e devolvido em 2026.`, cli)}><${Icon} n="sparkle" s=${14}/>Resumo com a IA</button>
        </div>
        <div className="row r4">
          <div className="kpi rev" style=${{cursor:'default'}}><span className="kl">Passivo estimado</span><span className="kv num">${fmtK(a.passivo.total)}</span><span className="ks">${fmtK(a.passivo['Provável'])} provável</span></div>
          <div className="kpi rev" style=${{cursor:'default',animationDelay:'60ms'}}><span className="kl">Bloqueado hoje</span><span className="kv num">${fmtK(a.bloqueadoAtivo)}</span><span className="ks">${a.bloqueiosAtivos} bloqueios ativos</span></div>
          <div className="kpi rev" style=${{cursor:'default',animationDelay:'120ms'}}><span className="kl">Devolvido</span><span className="kv num" style=${{color:'var(--good)'}}>${a.levantado ? fmtK(a.levantado) : 'Nada'}</span><span className="ks">em 2026</span></div>
          <div className="kpi rev" style=${{cursor:'default',animationDelay:'180ms'}}><span className="kl">Perdido</span><span className="kv num" style=${{color: a.perdido ? 'var(--bad)' : null}}>${a.perdido ? fmtK(a.perdido) : 'Nada'}</span><span className="ks">transferido ao credor</span></div>
        </div>
        <div className="row r11">${a.contratos.map((k, i) => html`<${Contrato} key=${k.orgao} k=${k} i=${i} go=${go}/>`)}</div>
        <${Card} title="Processos encerrados em 2026" right=${html`<span className="cnt">${enc.length}</span>`}>
          ${enc.length ? html`<div className="tbl-wrap"><table>
            <thead><tr><th>Contrato</th><th>Área</th><th>Como terminou</th><th>Resultado</th><th className="r">Em discussão</th><th className="r">Revertido</th></tr></thead>
            <tbody>${enc.map(e => html`<tr key=${e.id}><td>${e.contrato}</td><td style=${{color:'var(--ink-2)'}}>${e.area}</td><td>${e.motivo}<span className="sub">em ${MESC[e.saiuMes]}</span></td>
              <td><span className=${'status ' + (e.resultado === 'Favorável' ? 's-ok' : e.resultado === 'Acordo' ? 's-analise' : 's-bloq')}>${e.resultado}</span></td>
              <td className="r num">${fmtK(e.valorCausa)}</td><td className="r num" style=${{fontWeight:500}}>${fmtK0(e.valorRevertido)}</td></tr>`)}</tbody></table></div>`
          : html`<div className="empty-p">Nenhum processo encerrado este ano.</div>`}
        <//>
      </div>
    </div>
  </div>`;
}

function Contrato({k, i, go}){
  const contas = D.V10contas(k.orgId, k.orgao, k.bloqueios);
  const vs = k.vigenciaStatus;
  return html`<article className="cg2 rev" style=${{animationDelay: (200 + i * 90) + 'ms'}}>
    <div style=${{display:'flex',justifyContent:'space-between',gap:10,alignItems:'flex-start'}}>
      <div><span className="who-s">Contrato de gestão · ${k.vigencia}</span><h3>${k.orgao}</h3></div>
      <span className=${'status ' + (vs.id === 'curso' ? 's-ok' : vs.id === 'atencao' ? 's-parcial' : 's-neutro')}>${vs.texto}</span>
    </div>
    <div><div style=${{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:8}}><span className="who-s">Passivo estimado</span><b className="num" style=${{fontWeight:500,fontSize:18}}>${fmtK(k.passivo.total)}</b></div>
      <div className="hb-t" style=${{height:10}}>${PROGS.map((pg, j) => k.passivo[pg] ? html`<i key=${pg} style=${{width: (k.passivo[pg] / (k.passivo.total || 1) * 100) + '%', background: PROG_COR[pg], animationDelay: (j * 100) + 'ms'}}></i>` : null)}</div>
      <div style=${{marginTop:8}}><${Legend} items=${PROGS.map(pg => [`${pg} ${fmtK(k.passivo[pg])}`, PROG_COR[pg]])}/></div></div>
    <div className="nums4" style=${{borderTop:'1px solid var(--line)',paddingTop:12}}>
      <div><small>Processos</small><b className="num">${k.processos.length}</b></div>
      <div><small>Bloqueado hoje</small><b className="num">${k.bloqueadoAtivo ? fmtK(k.bloqueadoAtivo) : 'Nada'}</b></div>
      <div><small>Devolvido</small><b className="num" style=${{color: k.levantado ? 'var(--good)' : null}}>${k.levantado ? fmtK(k.levantado) : 'Nada'}</b></div>
      <div><small>Perdido</small><b className="num" style=${{color: k.perdido ? 'var(--bad)' : null}}>${k.perdido ? fmtK(k.perdido) : 'Nada'}</b></div>
    </div>
    <div><div className="who-s" style=${{marginBottom:2}}>Contas bancárias do contrato</div>
      ${contas.map(ct => { const at = sum(ct.bloqueios, hojeB);
        return html`<div className="acct" key=${ct.id}><span className="bk"><${Icon} n="landmark" s=${15}/></span>
          <span>${ct.banco} · c/c ${ct.final}<small>${ct.fim} · ag. ${ct.agencia}</small></span>
          <span style=${{textAlign:'right'}}>${at ? html`<b className="num" style=${{fontWeight:500,color:'var(--warn)'}}>${fmtK(at)}</b>` : html`<span className="cnt">sem bloqueio</span>`}<small className="cnt" style=${{display:'block'}}>${ct.bloqueios.length} bloqueios no ano</small></span></div>`; })}
    </div>
    <button className="link" style=${{alignSelf:'flex-start'}} onClick=${() => go('bloqueios', {cli:k.orgId, aba:'todos'})}>Ver bloqueios deste cliente</button>
  </article>`;
}

/* ================= Reclamações ================= */
function Reclamacoes({go}){
  return html`<div className="view">
    <div className="hello st"><div><h1>Reclamações constitucionais</h1><p>${za.length} reclamações no STF com base na ADPF 664, contra bloqueios de verbas dos contratos de gestão.</p></div></div>
    <div className="row r3">${za.map((r, i) => html`<article key=${r.id} className="rcl st" style=${{animationDelay: (60 + i * 90) + 'ms'}}>
      <div style=${{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}><span className="rcl-n">${r.numero}</span><span className=${'status ' + (r.status === 'Julgada' ? 's-ok' : 's-analise')}>${r.status}</span></div>
      <div><div style=${{fontSize:16,fontWeight:500,letterSpacing:'-.01em'}}>${r.cliente}</div><div className="who-s">Paradigma: ${r.paradigma}</div></div>
      <p>${r.assunto}</p>
      <div className="facts" style=${{padding:0}}>
        <div className="fact"><small>Liminar</small><b><span className=${'status ' + (r.liminar === 'Deferida' ? 's-ok' : 's-parcial')}>${r.liminar}</span></b></div>
        <div className="fact"><small>Valor em discussão</small><b className="num">${fmtR(r.valorDiscutido)}</b></div>
      </div>
      <p className="q"><b style=${{fontWeight:500,color:'var(--ink)'}}>Ato reclamado.</b> ${r.ato}</p>
      <div><div className="who-s" style=${{marginBottom:6}}>Processos de origem</div>
        <div style=${{display:'flex',flexDirection:'column',gap:6}}>${r.processosOrigem.map(id => { const p = procById(id);
          return html`<button key=${id} className="lnk" onClick=${() => go('processos', {sel:id})}><span><span className="mono">${p.numero}</span><span className="who-s" style=${{display:'block'}}>${p.desc} · bloqueado ${fmtK(bloqAtivo(p))}</span></span><${Icon} n="right" s=${15}/></button>`; })}</div></div>
      <div><div className="who-s" style=${{marginBottom:8}}>Andamento</div><${Timeline} items=${r.movs.map(([d, t]) => ({date:d, text:t, tone:toneDe(t) || 'acc'}))}/></div>
    </article>`)}</div>
  </div>`;
}

/* ================= Desempenho ================= */
function Desempenho(){
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
  const ult = meses[meses.length - 1];
  const pass = D.Xf(Se, $o).slice(ini);
  const lp = pass[pass.length - 1], fp = pass[0];
  const porArea = D.Pw('area', di), porCli = D.Pw('cliente', di);
  const det = (i, fn) => i == null ? null : fn(i);
  return html`<div className="view">
    <div className="hello st"><div><h1>Desempenho</h1><p>Como a carteira se moveu em 2026: entradas, encerramentos, valores revertidos e o dinheiro que voltou aos clientes.</p></div>
      <div className="seg" role="group" aria-label="Período">${[['2026', 'Ano todo'], ['6m', '6 meses'], ['3m', '3 meses']].map(([k, l]) => html`<button key=${k} aria-pressed=${per === k} onClick=${() => setPer(k)}>${l}</button>`)}</div></div>
    <div className="row r4">
      <div className="kpi st" style=${{cursor:'default'}}><span className="kl"><i><${Icon} n="scale" s=${15}/></i>Carteira hoje</span><span className="kv num">${full.carteiraHoje} processos</span><span className="ks"><span className=${'delta ' + (full.carteiraHoje - cartIni > 0 ? 'neutral' : 'good')}>${full.carteiraHoje - cartIni >= 0 ? '+' : ''}${full.carteiraHoje - cartIni} no período</span></span></div>
      <div className="kpi st" style=${{cursor:'default',animationDelay:'60ms'}}><span className="kl"><i><${Icon} n="plus" s=${15}/></i>Entradas e saídas</span><span className="kv num">${novos} / ${encs}</span><span className="ks">novos / encerrados</span></div>
      <div className="kpi st" style=${{cursor:'default',animationDelay:'120ms'}}><span className="kl"><i style=${{color:'var(--good)'}}><${Icon} n="check" s=${15}/></i>Devolvido aos clientes</span><span className="kv num">${fmtK(devV)}</span><span className="ks">${devQ} desbloqueios · média de ${D.jw().diasMedio} dias</span></div>
      <div className="kpi st" style=${{cursor:'default',animationDelay:'180ms'}}><span className="kl"><i><${Icon} n="trend" s=${15}/></i>Revertido nos encerrados</span><span className="kv num">${disc ? Math.round(rev / disc * 100) : 0}%</span><span className="ks">${fmtK(rev)} de ${fmtK(disc)} em discussão</span></div>
    </div>
    <div className="row r11">
      <${Card} delay="220ms" title="Passivo estimado no fim de cada mês" right=${html`<span className=${'delta ' + (lp.total > fp.total ? 'bad' : 'good')}>${lp.total > fp.total ? '+' : ''}${Math.round((lp.total / fp.total - 1) * 100)}% no período</span>`}>
        <div onMouseLeave=${() => setS1(null)}><${StackBars} cats=${cats} series=${PROGS.map(pg => ({label:pg, color:PROG_COR[pg], vals:pass.map(m => m[pg])}))} fmt=${v => fmtK(v).replace('R$ ', '')} sel=${s1} onSel=${setS1} label="Passivo estimado por mês e prognóstico"/></div>
        <div style=${{marginTop:8}}><${Legend} items=${PROGS.map(pg => [pg, PROG_COR[pg]])}/></div>
        <div className="detail">${det(s1 ?? pass.length - 1, i => html`<b>${D.V12mesLongo(cats[i])}</b> · total <b className="num">${fmtR(pass[i].total)}</b>${PROGS.map(pg => html`<span key=${pg}> · ${pg} <b className="num">${fmtK(pass[i][pg])}</b></span>`)}`)}</div>
      <//>
      <${Card} delay="280ms" title="Carteira de processos">
        <${LineChart} cats=${cats} lines=${[{label:'Carteira', color:'var(--accent)', vals:meses.map(m => m.carteira)}]} fmt=${fmtN} sel=${s2} onSel=${setS2} label="Processos ativos no fim de cada mês"/>
        <div className="detail">${det(s2 ?? meses.length - 1, i => html`<b>${D.V12mesLongo(cats[i])}</b> · <b className="num">${meses[i].carteira}</b> processos · ${meses[i].novos} entraram · ${meses[i].encerrados} encerrados${meses[i].indiceAcumulado != null ? ` · ${meses[i].indiceAcumulado}% favoráveis no acumulado` : ''}`)}</div>
      <//>
    </div>
    <div className="row r11">
      <${Card} delay="320ms" title="Dinheiro devolvido aos clientes por mês">
        <div onMouseLeave=${() => setS3(null)}><${StackBars} cats=${cats} series=${[{label:'Devolvido', color:'var(--good)', vals:meses.map(m => m.levantadoValor)}]} fmt=${v => v ? fmtK(v).replace('R$ ', '') : ''} sel=${s3} onSel=${setS3} label="Valor devolvido por mês"/></div>
        <div className="detail">${det(s3 ?? meses.length - 1, i => html`<b>${D.V12mesLongo(cats[i])}</b> · ${meses[i].levantadoValor ? html`<b className="num">${fmtR(meses[i].levantadoValor)}</b> em ${meses[i].levantadoQtd} desbloqueios` : 'nenhum desbloqueio no mês'}`)}</div>
      <//>
      <${Card} delay="360ms" title="Encerrados em 2026: em discussão e revertido">
        <div className="who-s" style=${{marginBottom:10}}>Por área</div>
        <${HBars} rows=${porArea.filter(a => a.encerrados).map(a => ({label:`${a.nome} · ${plural(a.encerrados, 'encerrado', 'encerrados')}`, total:a.emDiscussao, vals:[a.revertido, a.emDiscussao - a.revertido]}))} parts colors=${['var(--good)', 'var(--surface-3)']} fmt=${fmtK}/>
        <div className="who-s" style=${{margin:'16px 0 10px'}}>Por cliente</div>
        <${HBars} rows=${porCli.filter(a => a.encerrados).map(a => ({label:`${a.nome} · ${plural(a.encerrados, 'encerrado', 'encerrados')}`, total:a.emDiscussao, vals:[a.revertido, a.emDiscussao - a.revertido]}))} parts colors=${['var(--good)', 'var(--surface-3)']} fmt=${fmtK}/>
        <div style=${{marginTop:12}}><${Legend} items=${[['Revertido a favor do cliente', 'var(--good)'], ['Mantido', 'var(--surface-3)']]}/></div>
      <//>
    </div>
  </div>`;
}

/* ================= IA ================= */
const NOTA_DESKTOP = `

ESTA É A VERSÃO DESKTOP (Pauta Jurídica): a resposta é lida numa tela grande, então relatórios podem ter até 4 gráficos e cartões de processos.
- Não existe criar_alerta nesta versão. Se pedirem aviso, diga em uma frase que os avisos ficam no App dos Sócios, no celular.
- Ignore o guia sobre Perfil, letra maior, Face ID e barra de baixo. Se perguntarem como usar, explique pelas abas do topo: Painel, Processos, Bloqueios, Clientes, Reclamações, Desempenho e Pergunte à IA.
- Para contar a história de um processo, use ver_processo e organize por fases com as datas das movimentações e dos bloqueios, sem prever resultado.`;

const ferramentaProcesso = progress => ({
  name:'ver_processo',
  description:'Detalhes de um processo pelo número CNJ (ou parte dele): movimentações com datas, bloqueios com histórico e valores. Use para contar a história de um processo.',
  inputSchema:{type:'object', properties:{numero:{type:'string'}}, required:['numero']},
  execute:({numero}) => {
    const p = procByNum(numero); if (!p) throw new Error('Processo não encontrado. Confira o número.');
    progress(`Lendo o processo ${p.numero}`);
    return {numero:p.numero, cliente:p.cliente, contrato:p.contrato, area:p.area, descricao:p.desc, status:p.status, dias_parado:p.diasParado,
      valor_em_discussao:p.valorCausa, prognostico:p.prognostico, movimentacoes:p.movs,
      bloqueios:bloqDe(p).map(b => ({valor_bloqueado:b.original, ainda_bloqueado:hojeB(b), devolvido:b.devolvido, perdido:b.perdido, historico:b.historico}))};
  }
});

const samplePromise = (window.claude && window.claude.use) ? window.claude.use('sample').catch(() => null) : Promise.resolve(null);

function splitBlocks(t){
  const out = []; const re = /```(\w+)[^\n]*\n([\s\S]*?)```/g; let last = 0, m;
  while ((m = re.exec(t))) { if (m.index > last) out.push({k:'md', v:t.slice(last, m.index)}); out.push({k:m[1], v:m[2]}); last = re.lastIndex; }
  const rest = t.slice(last), open = rest.indexOf('```');
  if (open >= 0) { if (open > 0) out.push({k:'md', v:rest.slice(0, open)}); out.push({k:'pending'}); }
  else if (rest) out.push({k:'md', v:rest});
  return out;
}
function inline(s){ return s.split(/(\*\*[^*]+\*\*)/g).map((x, i) => x.startsWith('**') && x.endsWith('**') ? html`<strong key=${i}>${x.slice(2, -2)}</strong>` : x); }
function MD({text}){
  const lines = text.split('\n'); const out = []; let list = null;
  const flush = () => { if (list) { out.push(list.ord ? html`<ol key=${out.length}>${list.items}</ol>` : html`<ul key=${out.length}>${list.items}</ul>`); list = null; } };
  for (const raw of lines) { const l = raw.trim();
    if (!l) { flush(); continue; }
    let m;
    if ((m = l.match(/^#{1,4}\s+(.*)/))) { flush(); out.push(html`<h3 key=${out.length}>${inline(m[1])}</h3>`); continue; }
    if ((m = l.match(/^[-*•]\s+(.*)/)) || (m = l.match(/^(\d+)[.)]\s+(.*)/))) { const ord = /^\d/.test(l); const txt = ord ? m[2] : m[1];
      if (!list || list.ord !== ord) { flush(); list = {ord, items:[]}; } list.items.push(html`<li key=${list.items.length}>${inline(txt)}</li>`); continue; }
    flush(); out.push(html`<p key=${out.length}>${inline(l)}</p>`);
  }
  flush(); return html`<div className="md-t">${out}</div>`;
}
const fmtU = u => u === 'BRL' ? fmtK : fmtN;

function Grafico({src, onOpen}){
  let g; try { g = JSON.parse(src); } catch (e) { return html`<div className="pending">Gráfico em formato inválido.</div>`; }
  try {
    if (g.tipo === 'indicadores') return html`<div className="ind">${(g.itens || []).slice(0, 4).map((it, i) => { const r = D.ra(it.consulta);
      let delta = null;
      if (it.comparar_com) { const r2 = D.ra(it.comparar_com); if (r2.total) { const pc = Math.round((r.total / r2.total - 1) * 100); const bom = it.bom_quando === 'sobe' ? pc > 0 : pc < 0;
        delta = html`<span className=${'delta ' + (pc === 0 ? 'neutral' : bom ? 'good' : 'bad')}>${pc > 0 ? '+' : ''}${pc}% ${it.comparacao || ''}</span>`; } }
      return html`<div key=${i}><small>${it.rotulo}</small><b className="num">${fmtU(r.unidade)(r.total)}</b>${delta}</div>`; })}</div>`;
    if (g.tipo === 'tabela') { const rows = D.i2(g.processos || {});
      return html`<div className="gcard">${g.titulo ? html`<h5>${g.titulo}</h5>` : null}<div className="tbl-wrap"><table className="sel"><thead><tr><th>Processo</th><th>Cliente</th><th>Parado</th><th className="r">Bloqueado</th></tr></thead>
        <tbody>${rows.map(r => html`<tr key=${r.numero} onClick=${() => onOpen(r.numero)}><td><span className="mono">${r.numero}</span><span className="sub">${r.descricao}</span></td><td>${r.cliente}<span className="sub">${r.contrato}</span></td><td className="num">${r.dias_parado} dias</td><td className="r num">${r.valor_bloqueado_ativo ? fmtK(r.valor_bloqueado_ativo) : '—'}</td></tr>`)}</tbody></table></div></div>`; }
    if (g.tipo === 'empilhado') { const r = D.o2(g.consulta); const cores = r.partes.map((p, k) => PROG_COR[p] || ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--info)', 'var(--warn)'][k % 5]);
      return html`<div className="gcard">${g.titulo ? html`<h5>${g.titulo}</h5>` : null}
        <${HBars} rows=${r.grupos.map(x => ({label:x.rotulo, total:x.total, vals:x.valores}))} parts colors=${cores} fmt=${fmtU(r.unidade)}/>
        <${Legend} items=${r.partes.map((p, k) => [p, cores[k]])}/></div>`; }
    if (g.tipo === 'linha') { const ss = g.series || [{rotulo:g.titulo, consulta:g.consulta}]; const rs = ss.map(s => D.ra(s.consulta));
      const cats = rs[0].grupos.map(x => x.rotulo); const cores = ['var(--accent)', 'var(--info)', 'var(--warn)'];
      return html`<${GLinha} titulo=${g.titulo} cats=${cats} lines=${rs.map((r, k) => ({label:ss[k].rotulo || '', color:cores[k % 3], vals:cats.map(c => (r.grupos.find(x => x.rotulo === c) || {}).valor ?? null)}))} fmt=${fmtU(rs[0].unidade)} multi=${ss.length > 1}/>`; }
    /* barras */
    const ss = g.series || [{rotulo:'', consulta:g.consulta}]; const rs = ss.map(s => D.ra(s.consulta)); const u = fmtU(rs[0].unidade);
    if (rs.length === 1) return html`<div className="gcard">${g.titulo ? html`<h5>${g.titulo}</h5>` : null}<${HBars} rows=${rs[0].grupos.slice(0, 12).map(x => ({label:x.rotulo, value:x.valor}))} fmt=${u}/></div>`;
    const labels = [...new Set(rs.flatMap(r => r.grupos.map(x => x.rotulo)))]; const cores = ['var(--c1)', 'var(--c2)', 'var(--info)'];
    return html`<div className="gcard">${g.titulo ? html`<h5>${g.titulo}</h5>` : null}
      ${labels.slice(0, 10).map(l => html`<div key=${l}><div className="who-s" style=${{marginBottom:6}}>${l}</div><${HBars} rows=${rs.map((r, k) => ({label:ss[k].rotulo, value:(r.grupos.find(x => x.rotulo === l) || {valor:0}).valor, color:cores[k]}))} fmt=${u}/></div>`)}
      <${Legend} items=${ss.map((s, k) => [s.rotulo, cores[k]])}/></div>`;
  } catch (e) { return html`<div className="pending">Não consegui montar este gráfico: ${String(e.message || e)}</div>`; }
}
function GLinha({titulo, cats, lines, fmt, multi}){
  const [s, setS] = useState(null);
  return html`<div className="gcard">${titulo ? html`<h5>${titulo}</h5>` : null}
    <${LineChart} cats=${cats} lines=${lines} fmt=${fmt} sel=${s} onSel=${setS} label=${titulo || 'Gráfico de linha'} area=${!multi}/>
    ${multi ? html`<${Legend} items=${lines.map(l => [l.label, l.color])}/>` : null}
    ${s != null ? html`<div className="detail"><b>${cats[s]}</b>${lines.map(l => html`<span key=${l.label}> · ${l.label} <b className="num">${l.vals[s] == null ? 'sem dado' : fmt(l.vals[s])}</b></span>`)}</div>` : null}</div>`;
}
function Acoes({src, onOpen, seg, toggleSeg}){
  let a; try { a = JSON.parse(src); } catch (e) { return null; }
  const ps = (a.processos || []).map(procByNum).filter(Boolean).slice(0, 6);
  if (!ps.length) return null;
  return html`<div className="gcard">${a.titulo ? html`<h5>${a.titulo}</h5>` : null}<div className="acs">${ps.map((p, i) => { const bl = bloqAtivo(p);
    return html`<div key=${p.id} className="ac" style=${{animationDelay: (i * 80) + 'ms'}}>
      <div className="r"><span className="mono">${p.numero}</span>${p.valorCausa ? html`<${Prog} p=${p.prognostico}/>` : null}</div>
      <div><div className="n">${p.cliente}</div><div className="s">${p.desc}</div></div>
      <div className="r s"><span>${p.diasParado >= PARADO ? `Parado há ${p.diasParado} dias` : `Últ. mov. ${quando(p.lastUpdate)}`}</span><b className="num" style=${{color: bl ? 'var(--warn)' : 'var(--ink-3)', fontWeight:500}}>${bl ? fmtK(bl) + ' bloqueado' : 'sem bloqueio'}</b></div>
      <div className="r"><button className="btn sm ghost" onClick=${() => onOpen(p.numero)}>Abrir processo</button>
        <button className=${'btn sm ' + (seg.has(p.id) ? 'on' : 'ghost')} onClick=${() => toggleSeg(p.id)}><${Icon} n="bookmark" s=${13}/>${seg.has(p.id) ? 'Seguindo' : 'Seguir'}</button></div>
    </div>`; })}</div></div>`;
}
function Resposta({text, onOpen, onAsk, seg, toggleSeg, done}){
  return splitBlocks(text).map((b, i) => {
    if (b.k === 'md') return html`<${MD} key=${i} text=${b.v}/>`;
    if (b.k === 'grafico') return html`<${Grafico} key=${i} src=${b.v} onOpen=${onOpen}/>`;
    if (b.k === 'acoes') return html`<${Acoes} key=${i} src=${b.v} onOpen=${onOpen} seg=${seg} toggleSeg=${toggleSeg}/>`;
    if (b.k === 'sugestoes') { let s = []; try { s = JSON.parse(b.v); } catch (e) {}
      return done ? html`<div key=${i} className="sugs" style=${{flexDirection:'row',flexWrap:'wrap'}}>${s.map(x => html`<button key=${x} className="sug" onClick=${() => onAsk(x)}><span className="sug-ic" style=${{background:'var(--accent)'}}><${Icon} n="sparkle" s=${12}/></span>${x}</button>`)}</div>` : null; }
    if (b.k === 'pending') return html`<div key=${i} className="pending"><${Icon} n="sparkle" s=${14}/><span className="shimmer">Montando o gráfico…</span></div>`;
    return null;
  });
}

const SUGESTOES = [
  'Quanto está bloqueado hoje, por cliente?',
  'Quais processos estão parados há mais de 90 dias?',
  'Quanto cada cliente perdeu e recuperou em bloqueios em 2026?',
  'Como evoluiu o passivo estimado este ano, por prognóstico?'
];

function IA({chat, go, seg, toggleSeg}){
  const {msgs, ask, busy, ctx, setCtx, text, setText, stop, sampleOk} = chat;
  const endRef = useRef(null);
  useEffect(() => { endRef.current && endRef.current.scrollIntoView({block:'end', behavior:REDUCED ? 'auto' : 'smooth'}); }, [msgs.length]);
  const ready = text.trim().length > 0 && !busy;
  const onOpen = num => { const p = procByNum(num); if (p) go('processos', {sel:p.id}); };
  return html`<section className="chat st">
    <div className="chat-bar">
      <span className="ctx"><${Icon} n="sparkle" s=${16}/>Analista de dados do escritório</span>
      <div style=${{display:'flex',gap:8,alignItems:'center'}}>
        ${ctx ? html`<span className="ctxchip">Só ${fe[ctx].name}<button aria-label="Toda a firma" onClick=${() => setCtx(null)}><${Icon} n="x" s=${12}/></button></span>` : html`<span className="ctxchip" style=${{paddingRight:12}}>Toda a firma</span>`}
        ${msgs.length ? html`<button className="btn ghost sm" onClick=${chat.reset}><${Icon} n="refresh" s=${13}/>Nova conversa</button>` : null}
      </div>
    </div>
    ${!msgs.length ? html`<div className="idle rev">
      <span className="sug-ic" style=${{background:'var(--accent)',width:44,height:44}}><${Icon} n="sparkle" s=${20}/></span>
      <h2>Pergunte sobre processos, bloqueios e contratos</h2>
      <p className="who-s" style=${{maxWidth:'52ch',margin:0}}>A IA consulta a base do escritório e o app desenha os gráficos com esses dados. Os números nunca vêm da cabeça dela.</p>
      <div className="sugs">${SUGESTOES.map(s => html`<button key=${s} className="sug" onClick=${() => ask(s)}><span className="sug-ic" style=${{background:'var(--accent)'}}><${Icon} n="sparkle" s=${12}/></span>${s}</button>`)}</div>
      ${sampleOk === null ? html`<div className="err" style=${{maxWidth:520}}>A IA só responde com o app aberto no Claude. Abra este link no claude.ai para conversar com os dados.</div>` : null}
    </div>` : html`<div className="thread">
      ${msgs.map((m, i) => m.role === 'user' ? html`<div key=${i} className="bubble">${m.text}</div>` : html`<div key=${i} className="msg-a">
        ${m.status === 'erro' ? html`<div className="err">${m.erro}</div>` : null}
        ${!m.text && m.status === 'streaming' ? html`<div>
          <div className="thinking"><${Icon} n="sparkle" s=${16}/><span className="shimmer">Pensando…</span></div>
          <div className="steps2">${m.steps.map((s, k) => html`<span key=${k}><${Icon} n=${k < m.steps.length - 1 ? 'check' : 'clock'} s=${12}/>${s}</span>`)}</div></div>` : null}
        ${m.text ? html`${m.steps.length ? html`<div className="ans-hi">${m.steps.length} ${m.steps.length === 1 ? 'consulta' : 'consultas'} à base do escritório</div>` : null}
          <${Resposta} text=${m.text} onOpen=${onOpen} onAsk=${ask} seg=${seg} toggleSeg=${toggleSeg} done=${m.status !== 'streaming'}/>` : null}
        ${m.status === 'ok' ? html`<div className="acts"><div>
          <button className="ibtn" aria-label="Copiar resposta" onClick=${() => { try { navigator.clipboard.writeText(m.text).catch(() => {}); } catch (e) {} }}><${Icon} n="copy" s=${15}/></button>
          <button className="ibtn" aria-label="Perguntar de novo" onClick=${() => ask(msgs[i - 1].text)}><${Icon} n="refresh" s=${15}/></button></div></div>` : null}
      </div>`)}
      <div ref=${endRef}></div>
    </div>`}
    <form className="composer" onSubmit=${e => { e.preventDefault(); if (ready) ask(text); }}>
      <textarea id="chat-box" rows="2" aria-label="Nova pergunta" placeholder="Pergunte como falaria com um colega" value=${text} onInput=${e => setText(e.target.value)}
        onKeyDown=${e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (ready) ask(text); } }}></textarea>
      <div className="comp-row"><div><span className="model"><${Icon} n="lock" s=${12}/>Só leitura: nada muda no Legal One</span></div>
        <div>${busy ? html`<button type="button" className="btn ghost sm" onClick=${stop}>Parar</button>` : null}
          <button type="submit" className=${'send' + (ready ? ' ready' : '')} aria-label="Enviar" disabled=${!ready}><${Icon} n="up" s=${15} w=${2}/></button></div></div>
    </form>
  </section>`;
}

function useChat(){
  const [msgs, setMsgs] = useState([]);
  const [busy, setBusy] = useState(false);
  const [ctx, setCtx] = useState(null);
  const [text, setText] = useState('');
  const [sampleOk, setSampleOk] = useState(undefined);
  const ctrl = useRef(null), msgsRef = useRef(msgs), ctxRef = useRef(ctx);
  msgsRef.current = msgs; ctxRef.current = ctx;
  useEffect(() => { samplePromise.then(s => setSampleOk(s ? true : null)); }, []);
  const patchLast = f => setMsgs(ms => { const c = ms.slice(); c[c.length - 1] = f(c[c.length - 1]); return c; });
  const ask = async (q, cli) => {
    const t = (q || '').trim(); if (!t || busy) return;
    if (cli !== undefined) { setCtx(cli); ctxRef.current = cli; }
    setText('');
    const hist = [...msgsRef.current, {role:'user', text:t}];
    setMsgs([...hist, {role:'assistant', text:'', status:'streaming', steps:[]}]);
    setBusy(true);
    const sample = await samplePromise;
    if (!sample) { patchLast(m => ({...m, status:'erro', erro:'A IA só responde com o app aberto no Claude. Abra este link no claude.ai para conversar com os dados.'})); setBusy(false); return; }
    const ac = new AbortController(); ctrl.current = ac;
    const progress = s => patchLast(m => ({...m, steps:[...m.steps, s]}));
    const conv = hist.filter(m => m.text && !(m.role === 'assistant' && m.status === 'erro')).map(m => ({role:m.role, content:m.text})).slice(-12);
    while (conv.length && conv[0].role !== 'user') conv.shift();
    const input = [{role:'user', content:D.Mk(ctxRef.current) + NOTA_DESKTOP}, {role:'assistant', content:'Entendido. Vou consultar a base antes de qualquer número.'}, ...conv];
    try {
      const r = await sample(input, {tools:[...D.Fk(progress), ferramentaProcesso(progress)], signal:ac.signal, modelTier:'default', cache:false,
        onText:({text}) => patchLast(m => ({...m, text}))});
      patchLast(m => ({...m, text:r.text || m.text, status:'ok'}));
    } catch (e) {
      if (ac.signal.aborted) patchLast(m => ({...m, status: m.text ? 'ok' : 'erro', erro:'Resposta interrompida.'}));
      else patchLast(m => ({...m, status:'erro', text:e && e.text ? e.text : m.text, erro:D.l2(e)}));
    } finally { setBusy(false); ctrl.current = null; }
  };
  const stop = () => ctrl.current && ctrl.current.abort();
  const reset = () => { stop(); setMsgs([]); };
  return {msgs, ask, busy, ctx, setCtx, text, setText, stop, reset, sampleOk};
}

/* ================= Busca (⌘K) ================= */
function Busca({onClose, go}){
  const [q, setQ] = useState(''); const [i, setI] = useState(0); const ref = useRef(null);
  useEffect(() => { ref.current && ref.current.focus(); }, []);
  const f = q.trim().toLowerCase();
  const itens = [
    ...ti.filter(id => !f || fe[id].name.toLowerCase().includes(f)).map(id => ({g:'Clientes', t:fe[id].name, s:`${fe[id].contratos.length} contratos · ${fe[id].bloqueado} bloqueado`, ic:'building', go:['clientes', {cli:id}]})),
    ...za.filter(r => f && (r.numero + r.cliente + r.assunto).toLowerCase().includes(f)).map(r => ({g:'Reclamações', t:r.numero, s:r.assunto, ic:'landmark', go:['reclamacoes', {}]})),
    ...Se.filter(p => f && (p.numero + p.desc + p.cliente + p.contrato).toLowerCase().includes(f)).slice(0, 8).map(p => ({g:'Processos', t:p.numero, s:`${p.cliente} · ${p.desc}`, ic:'scale', go:['processos', {sel:p.id}]})),
    ...(f ? [{g:'IA', t:`Perguntar à IA: “${q.trim()}”`, s:'Consulta a base do escritório', ic:'sparkle', ia:q.trim()}] : [])
  ];
  const abrir = it => { onClose(); it.ia ? go('ia', {pergunta:it.ia}) : go(...it.go); };
  let ult = null;
  return html`<div className="cmd" onClick=${e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="cmd-box" role="dialog" aria-modal="true" aria-label="Buscar">
      <div className="cmd-in"><${Icon} n="search" s=${18}/><input ref=${ref} id="busca" placeholder="Buscar processo, cliente ou reclamação" value=${q}
        onInput=${e => { setQ(e.target.value); setI(0); }}
        onKeyDown=${e => { if (e.key === 'Escape') onClose(); else if (e.key === 'ArrowDown') { e.preventDefault(); setI(x => Math.min(x + 1, itens.length - 1)); } else if (e.key === 'ArrowUp') { e.preventDefault(); setI(x => Math.max(x - 1, 0)); } else if (e.key === 'Enter' && itens[i]) abrir(itens[i]); }}/><span className="kbd">esc</span></div>
      <div className="cmd-l">${itens.map((it, k) => { const head = it.g !== ult; ult = it.g;
        return html`<div key=${k}>${head ? html`<div className="cmd-g">${it.g}</div>` : null}
          <button className="cmd-i" aria-selected=${k === i} onMouseEnter=${() => setI(k)} onClick=${() => abrir(it)}><span className="ev-ic" style=${{width:32,height:32}}><${Icon} n=${it.ic} s=${15}/></span>
            <span style=${{minWidth:0}}><span className=${it.g === 'Processos' ? 'mono' : ''} style=${{color:'var(--ink)'}}>${it.t}</span><small style=${{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>${it.s}</small></span></button></div>`; })}
        ${itens.length ? null : html`<div className="empty-p">Nada encontrado.</div>`}</div>
    </div></div>`;
}

/* ================= App ================= */
const NAV = [['painel','Painel','grid'],['processos','Processos','scale'],['bloqueios','Bloqueios','lock'],['clientes','Clientes','building'],['reclamacoes','Reclamações','landmark'],['desempenho','Desempenho','trend'],['ia','Pergunte à IA','sparkle']];
function Header({active, onNav, dark, toggleTheme, onBusca}){
  return html`<header className="top">
    <div className="brand"><${Logo}/><span>Pauta</span></div>
    <nav className="nav" aria-label="Seções">
      ${NAV.map(([k, l, i]) => html`<button key=${k} className=${'pill' + (active === k ? ' on' : '')} onClick=${() => onNav(k)} aria-current=${active === k ? 'page' : null}>
        ${(k === 'painel' || k === 'ia') ? html`<${Icon} n=${i} s=${14}/>` : null}${l}</button>`)}
    </nav>
    <div className="tools">
      <button className="searchbtn" onClick=${onBusca} aria-label="Buscar"><${Icon} n="search" s=${15}/><span className="g">Buscar</span><span className="kbd">⌘K</span></button>
      <button className="round" aria-label=${dark ? 'Usar tema claro' : 'Usar tema escuro'} onClick=${toggleTheme}><${Icon} n=${dark ? 'sun' : 'moon'}/></button>
      <div className="avatar" title="Orlando">OM</div>
    </div>
  </header>`;
}
function greeting(){ const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; }
const sysDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;
const VIEWS = NAV.map(n => n[0]);

function App(){
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('pauta-theme'); } catch (e) { return null; } });
  const [sysIsDark, setSysIsDark] = useState(sysDark());
  const ini = (location.hash || '').slice(1);
  const [nav, setNav] = useState({view: VIEWS.includes(ini) ? ini : 'painel', opts:{}, n:0});
  const [boxText, setBoxText] = useState('');
  const [busca, setBusca] = useState(false);
  const [seg, toggleSeg] = useSeguidos();
  const chat = useChat();
  const typeTok = useRef(null);
  useEffect(() => { const r = document.documentElement; if (theme) r.setAttribute('data-theme', theme); else r.removeAttribute('data-theme'); try { theme ? localStorage.setItem('pauta-theme', theme) : localStorage.removeItem('pauta-theme'); } catch (e) {} }, [theme]);
  useEffect(() => { const m = window.matchMedia('(prefers-color-scheme: dark)'); const f = () => setSysIsDark(m.matches); m.addEventListener('change', f); return () => m.removeEventListener('change', f); }, []);
  useEffect(() => { const k = e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setBusca(b => !b); } }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);
  const dark = theme ? theme === 'dark' : sysIsDark;
  const go = (view, opts = {}) => {
    setNav(n => ({view, opts, n:n.n + 1})); window.scrollTo({top:0, behavior:'auto'});
    try { history.replaceState(null, '', '#' + view); } catch (e) {}
    if (view === 'ia' && opts.pergunta) chat.ask(opts.pergunta, opts.cli);
  };
  const ask = (t, cli) => { if (!(t || '').trim()) return; if (typeTok.current) typeTok.current.stop = true; setBoxText(''); go('ia'); chat.ask(t, cli); };
  const typeInto = (text, set) => { if (typeTok.current) typeTok.current.stop = true; const tok = {stop:false}; typeTok.current = tok; return typeText(text, set, tok, 22); };
  const {view, opts} = nav;
  const props = {opts, go, seg, toggleSeg, ask};
  return html`<div className="app">
    <${Header} active=${view} onNav=${k => go(k)} dark=${dark} toggleTheme=${() => setTheme(dark ? 'light' : 'dark')} onBusca=${() => setBusca(true)}/>
    <main className="v-in" key=${view + nav.n}>
      ${view === 'painel' ? html`<${Painel} go=${go} ask=${ask} boxText=${boxText} setBoxText=${setBoxText} typeInto=${typeInto}/>`
      : view === 'processos' ? html`<${Processos} ...${props}/>`
      : view === 'bloqueios' ? html`<${Bloqueios} ...${props}/>`
      : view === 'clientes' ? html`<${Clientes} ...${props}/>`
      : view === 'reclamacoes' ? html`<${Reclamacoes} go=${go}/>`
      : view === 'desempenho' ? html`<${Desempenho}/>`
      : html`<${IA} chat=${chat} go=${go} seg=${seg} toggleSeg=${toggleSeg}/>`}
    </main>
    ${busca ? html`<${Busca} onClose=${() => setBusca(false)} go=${go}/>` : null}
  </div>`;
}
ReactDOM.createRoot(document.getElementById('root')).render(html`<${App}/>`);
