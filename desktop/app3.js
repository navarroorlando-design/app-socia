/* ================= Dados (os mesmos do App dos Sócios) ================= */
const D = window.DADOS;
const {Hn, Se, Tn, fe, ti, di, za, $o, ir} = D;
const fmtK = v => D.bn(v);
const fmtK0 = v => v ? fmtK(v) : 'R$ 0';
const fmtR = v => D.Xt(v);
const fmtN = v => Math.round(v).toLocaleString('pt-BR');
const MESC = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const fmtD = d => d ? `${d.getDate()} ${MESC[d.getMonth()]}` : '—';
const fmtDL = d => d ? d.toLocaleDateString('pt-BR') : '—';
const quando = s => String(s).replace(/^1 meses$/, '1 mês');
const plural = (n, a, b) => `${n} ${n === 1 ? a : b}`;
const dia = 864e5;
const AREAS = ['Trabalhista','Cível','Administrativo','Constitucional'];
const AREA_COR = {Trabalhista:'var(--c1)','Cível':'var(--c2)',Administrativo:'var(--c3)',Constitucional:'var(--ink-4)'};
const PROGS = ['Provável','Possível','Remoto'];
const PROG_COR = {'Provável':'var(--p-prov)','Possível':'var(--p-poss)','Remoto':'var(--p-rem)'};
const MONEY = {bloqueado:'var(--m-bloq)',devolvido:'var(--m-dev)',perdido:'var(--m-per)'};
const sum = (l, f) => l.reduce((a, x) => a + f(x), 0);
const PARADO = 90;

const procById = id => Se.find(p => p.id === id);
const procByNum = n => Se.find(p => p.numero === n) || Se.find(p => n && p.numero.includes(String(n).trim()));
const bloqDe = p => Tn.filter(b => b.processoId === p.id);
const bloqAtivo = p => bloqDe(p).filter(b => b.status === 'Ativo').reduce((a, b) => a + b.valorNum, 0);
const hojeB = b => b.status === 'Ativo' ? b.valorNum : 0;
const stB = b => D.H1(b, procById(b.processoId));
const ST_B = {novo:['info','Novo'],ativo:['bloq','Bloqueado'],parado:['warn','Bloqueado · parado'],levantado:['good','Devolvido'],perdido:['bad','Perdido'],parcial:['warn','Devolvido em parte']};
const passivoTotal = sum(Se, p => p.valorCausa);

/* ================= Guardado neste navegador ================= */
const ler = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } };
const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
function useStore(k, d){
  const [v, setV] = useState(() => ler(k, d));
  const set = f => setV(prev => { const n = typeof f === 'function' ? f(prev) : f; gravar(k, n); return n; });
  return [v, set];
}

/* ================= Novidades ================= */
const CORTE = new Date(Hn.getTime() - 7 * dia);
const NOVIDADES = (() => {
  const out = [];
  for (const b of Tn) {
    if (b.data >= CORTE) out.push({d:b.data, tone:'bloq', t:`Novo bloqueio de ${fmtR(b.original)}`, s:`${b.cliente} · ${b.contrato}`, go:['bloqueios',{sel:b.id, aba:'todos'}]});
    if (b.devolvidoEm && b.devolvidoEm >= CORTE) out.push({d:b.devolvidoEm, tone:'good', t:`${fmtR(b.devolvido)} devolvidos ao cliente`, s:`${b.cliente} · ${b.contrato}`, go:['bloqueios',{sel:b.id, aba:'todos'}]});
    if (b.perdidoEm && b.perdidoEm >= CORTE) out.push({d:b.perdidoEm, tone:'bad', t:`${fmtR(b.perdido)} transferidos ao credor`, s:`${b.cliente} · ${b.contrato}`, go:['bloqueios',{sel:b.id, aba:'perda'}]});
  }
  for (const p of Se) if (p.ultimaMov >= CORTE && p.movs[0]) out.push({d:p.ultimaMov, tone:'info', t:p.movs[0].text, s:`${p.cliente} · ${p.desc}`, go:['processos',{sel:p.id}]});
  for (const r of za) for (const [dt, tx] of r.movs) { const d = D.V12data(dt); if (d >= CORTE) out.push({d, tone:'ai', t:`${r.numero} · ${tx}`, s:r.cliente, go:['reclamacoes',{}]}); }
  return out.sort((a, b) => b.d - a.d);
})();

/* ================= Gráficos ================= */
function useW(def = 640){
  const ref = useRef(null); const [w, setW] = useState(def);
  useEffect(() => { const el = ref.current; if (!el || !window.ResizeObserver) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(240, Math.round(e.contentRect.width)))); ro.observe(el); return () => ro.disconnect(); }, []);
  return [ref, w];
}
function StackBars({cats, series, fmt, h = 220, sel, onSel, label}){
  const [ref, W] = useW();
  const top = 22, base = h - 26, n = cats.length;
  const tot = cats.map((_, i) => sum(series, s => s.vals[i] || 0));
  const max = Math.max(1, ...tot) * 1.1;
  const slot = W / n, bw = Math.min(34, slot * .5), sc = (base - top) / max;
  return html`<div ref=${ref}><svg className="svgc" width=${W} height=${h} viewBox=${`0 0 ${W} ${h}`} role="img" aria-label=${label}>
    ${[0, .5, 1].map((f, k) => html`<line key=${k} x1="0" x2=${W} y1=${base - max / 1.1 * f * sc} y2=${base - max / 1.1 * f * sc} stroke="var(--line)" strokeDasharray=${k ? '2 4' : null}/>`)}
    ${cats.map((c, i) => {
      let y = base; const x = i * slot + (slot - bw) / 2; const dim = sel != null && sel !== i;
      return html`<g key=${c} className="hit" onMouseEnter=${() => onSel && onSel(i)} onClick=${() => onSel && onSel(i)}>
        <rect x=${i * slot} y="0" width=${slot} height=${base} fill="transparent"/>
        <g className="bgrp" style=${{animationDelay: (i * 40) + 'ms', opacity: dim ? .35 : 1, transition:'opacity .2s'}}>
          ${series.map((s, k) => { const v = s.vals[i] || 0, hh = v * sc; if (hh < .5) return null; y -= hh;
            return html`<rect key=${k} x=${x} y=${y + .75} width=${bw} height=${Math.max(0, hh - 1.5)} rx="1.5" fill=${s.color}/>`; })}
        </g>
        ${tot[i] ? html`<text x=${x + bw / 2} y=${base - tot[i] * sc - 8} textAnchor="middle" fontSize="11" fill=${sel === i ? 'var(--ink)' : 'var(--ink-3)'} style=${{fontVariantNumeric:'tabular-nums'}}>${fmt(tot[i])}</text>` : null}
        <text x=${x + bw / 2} y=${h - 6} textAnchor="middle" fontSize="11.5" fill=${sel === i ? 'var(--ink)' : 'var(--ink-3)'}>${c}</text>
      </g>`;
    })}
  </svg></div>`;
}
function LineChart({cats, lines, fmt, h = 210, sel, onSel, label, area = true}){
  const [ref, W] = useW();
  const top = 16, base = h - 26, n = cats.length, pad = 14, padL = 52;
  const all = lines.flatMap(l => l.vals.filter(v => v != null));
  const mx = Math.max(1, ...all), mn = Math.min(0, ...all);
  const sc = (base - top) / ((mx - mn) * 1.06 || 1);
  const X = i => padL + (n === 1 ? (W - padL - pad) / 2 : i * (W - padL - pad) / (n - 1));
  const Y = v => base - (v - mn) * sc;
  const path = vals => { let d = '', pen = false; vals.forEach((v, i) => { if (v == null) { pen = false; return; } d += (pen ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1); pen = true; }); return d; };
  const last = lines[0] ? lines[0].vals.length - 1 : 0;
  return html`<div ref=${ref}><svg className="svgc" width=${W} height=${h} viewBox=${`0 0 ${W} ${h}`} role="img" aria-label=${label} onMouseLeave=${() => onSel && onSel(null)}>
    ${[0, .5, 1].map((f, k) => { const t = mn + (mx - mn) * f; return html`<g key=${k}><line x1=${padL} x2=${W} y1=${Y(t)} y2=${Y(t)} stroke="var(--line)" strokeDasharray=${k ? '2 4' : null}/>
      <text x="0" y=${Y(t) + 4} fontSize="11" fill="var(--ink-3)" style=${{fontVariantNumeric:'tabular-nums'}}>${fmt(t)}</text></g>`; })}
    ${lines.map((l, k) => html`<g key=${k}>
      ${area && lines.length === 1 ? html`<path d=${path(l.vals) + ` L${X(n - 1)} ${base} L${X(0)} ${base} Z`} fill=${l.color} fillOpacity=".06" className="ribbon"/>` : null}
      <path d=${path(l.vals)} fill="none" stroke=${l.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" pathLength="1" className="draw"/>
      ${l.vals.map((v, i) => v == null || (sel !== i && i !== last) ? null : html`<circle key=${i} cx=${X(i)} cy=${Y(v)} r="3.5" fill=${i === last && sel == null ? 'var(--ai)' : 'var(--surface)'} stroke=${i === last && sel == null ? 'var(--ai)' : l.color} strokeWidth="1.6"/>`)}
    </g>`)}
    ${sel != null ? html`<line x1=${X(sel)} x2=${X(sel)} y1=${top - 4} y2=${base} stroke="var(--line-3)"/>` : null}
    ${cats.map((c, i) => html`<g key=${i}><rect className="hit" x=${X(i) - (W / n) / 2} y="0" width=${W / n} height=${base} fill="transparent" onMouseEnter=${() => onSel && onSel(i)}/>
      <text x=${X(i)} y=${h - 6} textAnchor="middle" fontSize="11.5" fill=${sel === i ? 'var(--ink)' : 'var(--ink-3)'}>${c}</text></g>`)}
  </svg></div>`;
}
function HBars({rows, fmt, parts, colors}){
  const max = Math.max(1, ...rows.map(r => r.total ?? r.value));
  return html`<div className="hb">${rows.map((r, i) => { const tot = r.total ?? r.value;
    return html`<div className="hb-r" key=${r.label + i}><span className="l" title=${r.label}>${r.label}</span>
      <span className="hb-t">${parts ? r.vals.map((v, k) => v > 0 ? html`<i key=${k} style=${{width: (v / max * 100) + '%', background: colors[k], animationDelay: (i * 50) + 'ms'}}></i>` : null)
        : html`<i style=${{width: (tot / max * 100) + '%', background: r.color || 'var(--c1)', animationDelay: (i * 50) + 'ms'}}></i>`}</span>
      <span className="v">${fmt(tot)}</span></div>`; })}</div>`;
}
const Legend = ({items}) => html`<div className="lg">${items.map(([l, c]) => html`<span key=${l}><i style=${{background: c}}></i>${l}</span>`)}</div>`;
function MoneyBar({devolvido = 0, perdido = 0, bloqueado = 0, big}){
  const t = devolvido + perdido + bloqueado || 1;
  return html`<div className=${'money' + (big ? ' lg2' : '')} role="img" aria-label=${`Devolvido ${fmtR(devolvido)}, perdido ${fmtR(perdido)}, ainda bloqueado ${fmtR(bloqueado)}`}>
    ${[[devolvido, MONEY.devolvido], [perdido, MONEY.perdido], [bloqueado, MONEY.bloqueado]].map(([v, c], k) => v > 0 ? html`<i key=${k} style=${{width: (v / t * 100) + '%', background: c, animationDelay: (k * 100) + 'ms'}}></i>` : null)}
  </div>`;
}

/* ================= Peças ================= */
const St = ({k}) => html`<span className=${'st ' + ST_B[k][0]}>${ST_B[k][1]}</span>`;
const Prog = ({p}) => html`<span className=${'prog ' + p}>${p}</span>`;
const toneDe = t => /perdid|credor/i.test(t) ? 'bad' : /liberad|levantad|devolv|deferid|procedente/i.test(t) ? 'good' : /bloqueio/i.test(t) ? 'warn' : '';
const Timeline = ({items}) => html`<ul className="tl">${items.map((m, i) => html`<li key=${i} className=${m.tone || ''}><time>${m.date}</time><span className="d"></span><span>${m.text}</span></li>`)}</ul>`;
const Card = ({title, sub, right, children, className = '', delay}) => html`<section className=${'card fill-in ' + className} style=${{animationDelay: delay}}>
  ${title ? html`<div className="card-h"><div><h2>${title}</h2>${sub ? html`<div className="sub">${sub}</div>` : null}</div>${right}</div>` : null}${children}</section>`;
const Fig = ({label, value, fmt, sub, onClick, small}) => html`<button onClick=${onClick} style=${onClick ? null : {cursor:'default'}}>
  <span className="eyebrow">${label}</span><span className=${'fig' + (small ? ' sm' : '')}><${CountUp} to=${value} fmt=${fmt}/></span><span className="figsub">${sub}</span></button>`;
const PH = ({eyebrow, title, desc, children}) => html`<header className="ph fill-in"><div>${eyebrow ? html`<div className="eyebrow">${eyebrow}</div>` : null}<h1>${title}</h1>${desc ? html`<p>${desc}</p>` : null}</div>${children ? html`<div className="ph-act">${children}</div>` : null}</header>`;
const AppCtx = React.createContext({});

/* ================= IA: motor ================= */
const samplePromise = (window.claude && window.claude.use) ? window.claude.use('sample').catch(() => null) : Promise.resolve(null);
const downloadsPromise = (window.claude && window.claude.use) ? window.claude.use('downloads').catch(() => null) : Promise.resolve(null);
const fmtU = u => u === 'BRL' ? fmtK : fmtN;

const NOTA_DESKTOP = `

ESTA É A VERSÃO DESKTOP (Pauta Jurídica): a resposta é lida numa tela grande; relatórios podem ter até 4 gráficos e cartões de processos.
- Não existe criar_alerta nesta versão. Se pedirem aviso, diga em uma frase que os avisos ficam no App dos Sócios, no celular.
- Ignore o guia sobre Perfil, letra maior, Face ID e barra de baixo. Se perguntarem como usar, explique pela barra lateral: Painel, Processos, Bloqueios, Clientes, Reclamações, Desempenho e Assistente. Gráficos da resposta podem ser fixados no Painel pelo alfinete e baixados em CSV.
- Para contar a história de um processo ou analisar processos específicos, use ver_processo em cada número e organize por fases com datas, sem prever resultado.
- Para reclamações constitucionais no STF, use listar_reclamacoes.`;

const ferramentasExtras = progress => [
  {name:'ver_processo', description:'Detalhes de um processo pelo número CNJ (ou parte dele): movimentações com datas, bloqueios com histórico e valores.',
    inputSchema:{type:'object', properties:{numero:{type:'string'}}, required:['numero']},
    execute:({numero}) => { const p = procByNum(numero); if (!p) throw new Error('Processo não encontrado. Confira o número.');
      progress(`Lendo o processo ${p.numero}`);
      return {numero:p.numero, cliente:p.cliente, contrato:p.contrato, area:p.area, descricao:p.desc, status:p.status, dias_parado:p.diasParado,
        valor_em_discussao:p.valorCausa, prognostico:p.prognostico, movimentacoes:p.movs,
        bloqueios:bloqDe(p).map(b => ({valor_bloqueado:b.original, ainda_bloqueado:hojeB(b), devolvido:b.devolvido, perdido:b.perdido, historico:b.historico}))}; }},
  {name:'listar_reclamacoes', description:'Reclamações constitucionais no STF: número, cliente, situação, liminar, paradigma, ato reclamado, valor em discussão, processos de origem e andamento.',
    inputSchema:{type:'object', properties:{}},
    execute:() => { progress('Consultando as reclamações no STF');
      return za.map(r => ({numero:r.numero, cliente:r.cliente, status:r.status, liminar:r.liminar, paradigma:r.paradigma, assunto:r.assunto, ato_reclamado:r.ato,
        valor_em_discussao:r.valorDiscutido, processos_de_origem:r.processosOrigem.map(id => procById(id).numero), andamento:r.movs.map(([d, t]) => ({data:d, texto:t}))})); }}
];
const resumoDe = r => Array.isArray(r) ? `${r.length} itens` : r && r.total != null ? fmtU(r.unidade)(r.total) + (r.grupos && r.grupos.length ? ` em ${r.grupos.length} grupos` : '') : r && r.numero ? r.numero : 'ok';
const PARAM = {metrica:'métrica', agrupar_por:'por', dividir_por:'dividido por', cliente:'cliente', area:'área', contrato:'contrato', status_bloqueio:'situação', dias_minimos_parado:'parado há', prognostico:'prognóstico', mes_inicio:'de', mes_fim:'até', numero:'processo', limite:'limite', apenas_com_bloqueio_ativo:'só com bloqueio'};
const descParams = p => Object.entries(p || {}).filter(([, v]) => v !== undefined && v !== '' && v !== 'nenhum').map(([k, v]) => `${PARAM[k] || k}: ${v === true ? 'sim' : v}`).join(' · ') || 'sem filtro';

const novaConv = () => ({id:'c' + Date.now().toString(36), titulo:'', criada:Date.now(), msgs:[]});
function useAI(){
  const [convs, setConvs] = useStore('pauta:conversas', []);
  const [curId, setCurId] = useState(() => (ler('pauta:conversas', [])[0] || {}).id || null);
  const [busy, setBusy] = useState(false);
  const [sampleOk, setSampleOk] = useState(undefined);
  const ctrl = useRef(null), convsRef = useRef(convs);
  convsRef.current = convs;
  useEffect(() => { samplePromise.then(s => setSampleOk(s ? true : null)); }, []);
  const cur = convs.find(c => c.id === curId) || null;
  const patchConv = (id, f) => setConvs(cs => cs.map(c => c.id === id ? f(c) : c));
  const patchLast = (id, f) => patchConv(id, c => { const m = c.msgs.slice(); m[m.length - 1] = f(m[m.length - 1]); return {...c, msgs:m}; });
  const ask = async (q, {ctx} = {}) => {
    const t = (q || '').trim(); if (!t || busy) return;
    let conv = convsRef.current.find(c => c.id === curId);
    if (!conv) { conv = novaConv(); setConvs(cs => [conv, ...cs].slice(0, 30)); setCurId(conv.id); }
    const id = conv.id;
    const hist = [...conv.msgs, {role:'user', text:t, ctx: ctx ? ctx.label : null}];
    setConvs(cs => cs.map(c => c.id === id ? {...c, titulo:c.titulo || t.slice(0, 70), msgs:[...hist, {role:'assistant', text:'', status:'streaming', steps:[], fontes:[]}]} : c).sort((a, b) => (b.id === id) - (a.id === id)));
    setBusy(true);
    const sample = await samplePromise;
    if (!sample) { patchLast(id, m => ({...m, status:'erro', erro:'O assistente só responde com o Pauta aberto no Claude. Abra este link no claude.ai para conversar com os dados.'})); setBusy(false); return; }
    const ac = new AbortController(); ctrl.current = ac;
    const progress = s => patchLast(id, m => ({...m, steps:[...m.steps, s]}));
    const log = (nome, params, r) => patchLast(id, m => ({...m, fontes:[...(m.fontes || []), {nome, params:descParams(params), resumo:resumoDe(r)}]}));
    const tools = [...D.Fk(progress), ...ferramentasExtras(progress)].map(tl => ({...tl, execute:inp => { const r = tl.execute(inp); log(tl.name, inp, r); return r; }}));
    const conv2 = hist.filter(m => m.text && !(m.role === 'assistant' && m.status === 'erro')).map(m => ({role:m.role, content:m.text})).slice(-12);
    while (conv2.length && conv2[0].role !== 'user') conv2.shift();
    const extra = ctx && ctx.nota ? `\n\nCONTEXTO DA TELA: ${ctx.nota}` : '';
    const input = [{role:'user', content:D.Mk(ctx && ctx.cli || null) + NOTA_DESKTOP + extra}, {role:'assistant', content:'Entendido. Vou consultar a base antes de qualquer número.'}, ...conv2];
    try {
      const r = await sample(input, {tools, signal:ac.signal, modelTier:'default', cache:false, onText:({text}) => patchLast(id, m => ({...m, text}))});
      patchLast(id, m => ({...m, text:r.text || m.text, status:'ok'}));
    } catch (e) {
      if (ac.signal.aborted) patchLast(id, m => ({...m, status:m.text ? 'ok' : 'erro', erro:'Resposta interrompida.'}));
      else patchLast(id, m => ({...m, status:'erro', text:e && e.text ? e.text : m.text, erro:D.l2(e)}));
    } finally { setBusy(false); ctrl.current = null; }
  };
  const stop = () => ctrl.current && ctrl.current.abort();
  const nova = () => { stop(); setCurId(null); };
  const abrir = id => { if (!busy) setCurId(id); };
  const apagar = id => { setConvs(cs => cs.filter(c => c.id !== id)); if (id === curId) setCurId(null); };
  return {convs, cur, curId, ask, busy, stop, nova, abrir, apagar, sampleOk};
}

/* ================= IA: resposta ================= */
function splitBlocks(t){
  const out = []; const re = /```(\w+)[^\n]*\n([\s\S]*?)```/g; let last = 0, m;
  while ((m = re.exec(t))) { if (m.index > last) out.push({k:'md', v:t.slice(last, m.index)}); out.push({k:m[1], v:m[2]}); last = re.lastIndex; }
  const rest = t.slice(last), open = rest.indexOf('```');
  if (open >= 0) { if (open > 0) out.push({k:'md', v:rest.slice(0, open)}); out.push({k:'pending'}); }
  else if (rest) out.push({k:'md', v:rest});
  return out;
}
const inline = s => s.split(/(\*\*[^*]+\*\*)/g).map((x, i) => x.startsWith('**') && x.endsWith('**') ? html`<strong key=${i}>${x.slice(2, -2)}</strong>` : x);
function MD({text}){
  const out = []; let list = null;
  const flush = () => { if (list) { out.push(list.ord ? html`<ol key=${out.length}>${list.items}</ol>` : html`<ul key=${out.length}>${list.items}</ul>`); list = null; } };
  for (const raw of text.split('\n')) { const l = raw.trim(); let m;
    if (!l) { flush(); continue; }
    if ((m = l.match(/^#{1,4}\s+(.*)/))) { flush(); out.push(html`<h3 key=${out.length}>${inline(m[1])}</h3>`); continue; }
    if ((m = l.match(/^[-*•]\s+(.*)/)) || (m = l.match(/^(\d+)[.)]\s+(.*)/))) { const ord = /^\d/.test(l); const txt = ord ? m[2] : m[1];
      if (!list || list.ord !== ord) { flush(); list = {ord, items:[]}; } list.items.push(html`<li key=${list.items.length}>${inline(txt)}</li>`); continue; }
    flush(); out.push(html`<p key=${out.length}>${inline(l)}</p>`);
  }
  flush(); return html`<div className="md-t">${out}</div>`;
}

/* Calcula o que um bloco ```grafico desenha: tabela de dados + modelo de desenho */
function dadosGrafico(g){
  if (g.tipo === 'indicadores') { const itens = (g.itens || []).slice(0, 4).map(it => { const r = D.ra(it.consulta); let delta = null;
      if (it.comparar_com) { const r2 = D.ra(it.comparar_com); if (r2.total) { const pc = Math.round((r.total / r2.total - 1) * 100); delta = {pc, bom: it.bom_quando === 'sobe' ? pc > 0 : pc < 0, txt:it.comparacao || ''}; } }
      return {rotulo:it.rotulo, total:r.total, u:r.unidade, delta}; });
    return {tipo:'indicadores', itens, csv:[['Indicador', 'Valor'], ...itens.map(i => [i.rotulo, i.total])]}; }
  if (g.tipo === 'tabela') { const rows = D.i2(g.processos || {});
    return {tipo:'tabela', rows, csv:[['Processo', 'Cliente', 'Contrato', 'Área', 'Dias parado', 'Em discussão', 'Prognóstico', 'Bloqueado'], ...rows.map(r => [r.numero, r.cliente, r.contrato, r.area, r.dias_parado, r.valor_em_discussao, r.prognostico, r.valor_bloqueado_ativo])]}; }
  if (g.tipo === 'empilhado') { const r = D.o2(g.consulta);
    return {tipo:'empilhado', r, csv:[['Grupo', 'Total', ...r.partes], ...r.grupos.map(x => [x.rotulo, x.total, ...x.valores])]}; }
  const ss = g.series || [{rotulo:g.titulo || 'Valor', consulta:g.consulta}]; const rs = ss.map(s => D.ra(s.consulta));
  const cats = g.tipo === 'linha' ? rs[0].grupos.map(x => x.rotulo) : [...new Set(rs.flatMap(r => r.grupos.map(x => x.rotulo)))];
  const val = (r, c) => { const x = r.grupos.find(y => y.rotulo === c); return x ? x.valor : null; };
  return {tipo:g.tipo === 'linha' ? 'linha' : 'barras', ss, rs, cats, u:rs[0].unidade, csv:[['Grupo', ...ss.map(s => s.rotulo || 'Valor')], ...cats.map(c => [c, ...rs.map(r => val(r, c) ?? '')])], val};
}
const csvDe = rows => rows.map(r => r.map(v => { const s = v == null ? '' : String(v); return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }).join(';')).join('\n');
const slug = s => (s || 'grafico').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'grafico';
const CORES_S = ['var(--c1)', 'var(--c2)', 'var(--ai)'];

function Grafico({src, onOpen, fixado, semFerramentas}){
  const {pins, togglePin, baixar, dlOk} = useContext(AppCtx);
  const [s, setS] = useState(null);
  let g, d;
  try { g = JSON.parse(src); } catch (e) { return html`<div className="pending">Gráfico em formato inválido.</div>`; }
  try { d = dadosGrafico(g); } catch (e) { return html`<div className="pending">Não consegui montar este gráfico: ${String(e.message || e)}</div>`; }
  const pinned = pins.some(p => p.src === src);
  const tools = semFerramentas ? null : html`<div className="gtools">
    ${dlOk ? html`<button className="ibtn" title="Baixar dados (CSV)" aria-label="Baixar dados em CSV" onClick=${() => baixar(slug(g.titulo || g.tipo) + '.csv', csvDe(d.csv))}><${Icon} n="download" s=${14}/></button>` : null}
    <button className="ibtn" title=${pinned ? 'Tirar do Painel' : 'Fixar no Painel'} aria-pressed=${pinned} aria-label=${pinned ? 'Tirar do Painel' : 'Fixar no Painel'} onClick=${() => togglePin(src, g.titulo || 'Indicadores')}><${Icon} n="pin" s=${14}/></button></div>`;
  const head = (g.titulo || tools) ? html`<div className="gcard-h"><h5>${g.titulo || ''}</h5>${tools}</div>` : null;
  if (d.tipo === 'indicadores') return html`<div style=${{display:'flex',flexDirection:'column',gap:8}}>${tools ? html`<div className="gcard-h"><span className="eyebrow">Indicadores</span>${tools}</div>` : null}
    <div className="ind">${d.itens.map((it, i) => html`<div key=${i}><small>${it.rotulo}</small><b>${fmtU(it.u)(it.total)}</b>
      ${it.delta ? html`<span className=${'trend ' + (it.delta.pc === 0 ? 'neutral' : it.delta.bom ? 'good' : 'bad')}>${it.delta.pc > 0 ? '+' : ''}${it.delta.pc}% ${it.delta.txt}</span>` : null}</div>`)}</div></div>`;
  if (d.tipo === 'tabela') return html`<div className="gcard">${head}<div className="tbl-wrap" style=${{margin:'0 -20px'}}><table className="sel"><thead><tr><th>Processo</th><th>Cliente</th><th>Parado</th><th className="r">Bloqueado</th></tr></thead>
    <tbody>${d.rows.map(r => html`<tr key=${r.numero} onClick=${() => onOpen && onOpen(r.numero)}><td><span className="mono">${r.numero}</span><span className="sub">${r.descricao}</span></td><td>${r.cliente}<span className="sub">${r.contrato}</span></td><td className="num">${r.dias_parado} dias</td><td className="r num">${r.valor_bloqueado_ativo ? fmtK(r.valor_bloqueado_ativo) : '—'}</td></tr>`)}</tbody></table></div></div>`;
  if (d.tipo === 'empilhado') { const cores = d.r.partes.map((p, k) => PROG_COR[p] || ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--ai)', 'var(--info)'][k % 5]);
    return html`<div className="gcard">${head}<${HBars} rows=${d.r.grupos.map(x => ({label:x.rotulo, total:x.total, vals:x.valores}))} parts colors=${cores} fmt=${fmtU(d.r.unidade)}/><${Legend} items=${d.r.partes.map((p, k) => [p, cores[k]])}/></div>`; }
  const fmt = fmtU(d.u);
  if (d.tipo === 'linha') { const lines = d.rs.map((r, k) => ({label:d.ss[k].rotulo || '', color:CORES_S[k % 3], vals:d.cats.map(c => d.val(r, c))}));
    return html`<div className="gcard">${head}<${LineChart} cats=${d.cats} lines=${lines} fmt=${fmt} sel=${s} onSel=${setS} label=${g.titulo || 'Gráfico de linha'} area=${lines.length === 1} h=${fixado ? 180 : 210}/>
      ${lines.length > 1 ? html`<${Legend} items=${lines.map(l => [l.label, l.color])}/>` : null}
      <div className="readout">${s == null ? html`<span>Passe o mouse no gráfico para ler cada mês.</span>` : html`<b>${d.cats[s]}</b>${lines.map(l => html`<span key=${l.label}>${lines.length > 1 ? l.label + ' ' : ''}<b>${l.vals[s] == null ? 'sem dado' : fmt(l.vals[s])}</b></span>`)}`}</div></div>`; }
  if (d.rs.length === 1) return html`<div className="gcard">${head}<${HBars} rows=${d.rs[0].grupos.slice(0, 12).map(x => ({label:x.rotulo, value:x.valor}))} fmt=${fmt}/></div>`;
  return html`<div className="gcard">${head}${d.cats.slice(0, 10).map(c => html`<div key=${c}><div className="who-s" style=${{marginBottom:6}}>${c}</div>
    <${HBars} rows=${d.rs.map((r, k) => ({label:d.ss[k].rotulo, value:d.val(r, c) || 0, color:CORES_S[k % 3]}))} fmt=${fmt}/></div>`)}<${Legend} items=${d.ss.map((s2, k) => [s2.rotulo, CORES_S[k % 3]])}/></div>`;
}
function Acoes({src, onOpen}){
  const {seg, toggleSeg} = useContext(AppCtx);
  let a; try { a = JSON.parse(src); } catch (e) { return null; }
  const ps = (a.processos || []).map(procByNum).filter(Boolean).slice(0, 6);
  if (!ps.length) return null;
  return html`<div style=${{display:'flex',flexDirection:'column',gap:10}}>${a.titulo ? html`<div className="eyebrow">${a.titulo}</div>` : null}<div className="acs">${ps.map((p, i) => { const bl = bloqAtivo(p);
    return html`<div key=${p.id} className="ac rev" style=${{animationDelay: (i * 60) + 'ms'}}>
      <div className="r"><span className="mono">${p.numero}</span>${p.valorCausa ? html`<${Prog} p=${p.prognostico}/>` : null}</div>
      <div><div className="n">${p.cliente}</div><div className="s">${p.desc}</div></div>
      <div className="r s"><span>${p.diasParado >= PARADO ? `Parado há ${p.diasParado} dias` : `Últ. mov. ${quando(p.lastUpdate)}`}</span><span className="num" style=${{color:'var(--ink)'}}>${bl ? fmtK(bl) + ' bloq.' : 'sem bloqueio'}</span></div>
      <div className="r"><button className="btn ghost sm" onClick=${() => onOpen(p.numero)}>Abrir processo</button>
        <button className=${'btn sm ' + (seg.includes(p.id) ? 'on' : 'quiet')} onClick=${() => toggleSeg(p.id)}><${Icon} n="bookmark" s=${13}/>${seg.includes(p.id) ? 'Seguindo' : 'Seguir'}</button></div>
    </div>`; })}</div></div>`;
}
/* Converte a resposta em Markdown para baixar: gráficos viram tabelas com os números calculados */
function respostaParaMd(pergunta, text){
  const partes = splitBlocks(text).map(b => {
    if (b.k === 'md') return b.v.trim();
    if (b.k === 'grafico') { try { const g = JSON.parse(b.v); const d = dadosGrafico(g); const [h, ...rows] = d.csv;
      const fmtV = v => typeof v === 'number' ? v.toLocaleString('pt-BR') : v;
      return (g.titulo ? `**${g.titulo}**\n\n` : '') + `| ${h.join(' | ')} |\n| ${h.map(() => '---').join(' | ')} |\n` + rows.map(r => `| ${r.map(fmtV).join(' | ')} |`).join('\n'); } catch (e) { return ''; } }
    if (b.k === 'acoes') { try { const a = JSON.parse(b.v); return (a.titulo ? `**${a.titulo}**\n\n` : '') + (a.processos || []).map(n => { const p = procByNum(n); return p ? `- ${p.numero} · ${p.cliente} · ${p.desc}` : `- ${n}`; }).join('\n'); } catch (e) { return ''; } }
    return '';
  }).filter(Boolean);
  return `# ${pergunta}\n\n_Pauta Jurídica · Azevedo dos Reis · base de ${fmtDL(Hn)} · dados de exemplo_\n\n${partes.join('\n\n')}\n`;
}

function Mensagens({conv, onOpen, onAsk, dock}){
  const {baixar, dlOk} = useContext(AppCtx);
  return conv.msgs.map((m, i) => m.role === 'user'
    ? html`<div key=${i} className="q">${m.ctx ? html`<div className="who-s" style=${{marginBottom:4}}>Sobre: ${m.ctx}</div>` : null}${m.text}</div>`
    : html`<div key=${i} className="a">
      ${m.status === 'erro' ? html`<div className="err">${m.erro}</div>` : null}
      ${!m.text && m.status === 'streaming' ? html`<div><div className="thinking"><${Icon} n="sparkle" s=${16}/><span className="shimmer">Consultando a base…</span></div>
        <div className="steps" style=${{marginTop:8}}>${m.steps.map((s, k) => html`<span key=${k}><${Icon} n=${k < m.steps.length - 1 ? 'check' : 'clock'} s=${12}/>${s}</span>`)}</div></div>` : null}
      ${m.text ? splitBlocks(m.text).map((b, k) => {
        if (b.k === 'md') return html`<${MD} key=${k} text=${b.v}/>`;
        if (b.k === 'grafico') return html`<${Grafico} key=${k} src=${b.v} onOpen=${onOpen}/>`;
        if (b.k === 'acoes') return html`<${Acoes} key=${k} src=${b.v} onOpen=${onOpen}/>`;
        if (b.k === 'sugestoes') { if (m.status === 'streaming') return null; let s = []; try { s = JSON.parse(b.v); } catch (e) {}
          return html`<div key=${k} className="sugs">${s.map(x => html`<button key=${x} className="sug" onClick=${() => onAsk(x)}><${Icon} n="sparkle" s=${12}/>${x}</button>`)}</div>`; }
        if (b.k === 'pending') return html`<div key=${k} className="pending"><${Icon} n="sparkle" s=${14}/><span className="shimmer">Montando o gráfico…</span></div>`;
        return null; }) : null}
      ${m.status === 'ok' && m.text ? html`<div style=${{display:'flex',flexDirection:'column',gap:8}}>
        ${m.fontes && m.fontes.length ? html`<details className="fontes"><summary><${Icon} n="database" s=${13}/>De onde vieram os números · ${plural(m.fontes.length, 'consulta', 'consultas')} à base</summary>
          <ol>${m.fontes.map((f, k) => html`<li key=${k}><code>${f.nome.replace(/_/g, ' ')} · ${f.params}</code><span className="num muted">${f.resumo}</span></li>`)}</ol></details>` : null}
        <div className="acts">
          <button className="ibtn" title="Copiar texto" aria-label="Copiar texto" onClick=${() => { try { navigator.clipboard.writeText(m.text).catch(() => {}); } catch (e) {} }}><${Icon} n="copy" s=${15}/></button>
          ${dlOk ? html`<button className="ibtn" title="Baixar relatório (.md)" aria-label="Baixar relatório em Markdown" onClick=${() => baixar(slug(conv.msgs[i - 1].text) + '.md', respostaParaMd(conv.msgs[i - 1].text, m.text))}><${Icon} n="download" s=${15}/></button>` : null}
          <button className="ibtn" title="Perguntar de novo" aria-label="Perguntar de novo" onClick=${() => onAsk(conv.msgs[i - 1].text)}><${Icon} n="refresh" s=${15}/></button>
        </div></div>` : null}
    </div>`);
}

/* ================= IA: relatórios prontos ================= */
const MODELOS = [
  {id:'mensal', t:'Relatório mensal dos sócios', d:'Bloqueado, devolvido e perdido, passivo por prognóstico, parados e STF.', p:() => 'Monte o relatório mensal para os sócios de outubro de 2026: bloqueado hoje e como mudou no mês, o que foi devolvido e perdido, a evolução do passivo por prognóstico, os processos parados há mais de 90 dias e a situação das reclamações no STF. Termine com próximos passos.'},
  {id:'raio', t:'Raio-x de um cliente', d:'Passivo por contrato de gestão, bloqueios, perdas e processos de atenção.', cli:true, p:c => `Faça um raio-x do ${fe[c].name}: passivo por contrato de gestão dividido por prognóstico, bloqueios ativos por contrato, o que foi devolvido e perdido em 2026 e os processos que merecem atenção.`},
  {id:'risco', t:'Bloqueios que podem virar perda', d:'Ativos altos ou antigos, em processos de prognóstico provável.', p:() => 'Quais bloqueios ativos correm mais risco de virar perda? Considere valor, tempo bloqueado e prognóstico provável do processo. Mostre os processos em cartões.'},
  {id:'comparar', t:'Comparar os quatro clientes', d:'Passivo, bloqueado, devolvido e perdido lado a lado.', p:() => 'Compare os quatro clientes lado a lado: passivo estimado, valor bloqueado hoje, valor devolvido e valor perdido em 2026.'},
  {id:'parados', t:'Processos parados', d:'Parados há mais de 90 dias, por cliente, e o que pedir à equipe.', p:() => 'Liste os processos parados há mais de 90 dias, agrupe por cliente e sugira o que pedir à equipe em cada caso, sem prever resultado.'},
  {id:'stf', t:'Reclamações no STF', d:'Liminares, valor em discussão e processos de origem.', p:() => 'Resuma as reclamações constitucionais no STF: situação de cada liminar, valor em discussão, processos de origem e o que acompanhar.'}
];
function Modelos({onAsk, limite}){
  const [pick, setPick] = useState(null);
  const lista = limite ? MODELOS.slice(0, limite) : MODELOS;
  return html`<div style=${{display:'flex',flexDirection:'column',gap:10}}>
    <div className="tgrid">${lista.map(m => html`<button key=${m.id} className="tcard" onClick=${() => m.cli ? setPick(p => p === m.id ? null : m.id) : onAsk(m.p())} aria-expanded=${m.cli ? pick === m.id : null}>
      <b><${Icon} n="book" s=${14}/>${m.t}</b><small>${m.d}</small>
      ${m.cli && pick === m.id ? html`<span className="chips" style=${{marginTop:8}} onClick=${e => e.stopPropagation()}>${ti.map(id => html`<span key=${id} role="button" tabIndex="0" className="fbtn" onClick=${() => { setPick(null); onAsk(m.p(id)); }} onKeyDown=${e => { if (e.key === 'Enter') { setPick(null); onAsk(m.p(id)); } }}>${fe[id].name}</span>`)}</span>` : null}
    </button>`)}</div></div>`;
}

function Composer({onAsk, busy, stop, ctx, setUsarCtx, usarCtx, autoFocus}){
  const [t, setT] = useState('');
  const ref = useRef(null);
  useEffect(() => { autoFocus && ref.current && ref.current.focus(); }, []);
  const ready = t.trim() && !busy;
  const enviar = () => { if (!ready) return; onAsk(t); setT(''); };
  return html`<div className="composer-w"><form className="composer" onSubmit=${e => { e.preventDefault(); enviar(); }}>
    <textarea ref=${ref} id=${'cmp-' + (autoFocus ? 'p' : 'd')} rows="2" aria-label="Pergunta ao assistente" placeholder="Pergunte como falaria com um colega" value=${t} onInput=${e => setT(e.target.value)}
      onKeyDown=${e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); } }}></textarea>
    <div className="comp-row">
      <div style=${{minWidth:0,display:'flex',gap:6}}>${ctx && ctx.nota ? html`<span className=${'ctx' + (usarCtx ? ' ai' : '')}><${Icon} n="layers" s=${12}/><span>${usarCtx ? ctx.label : 'Sem contexto da tela'}</span>
        <button type="button" aria-label=${usarCtx ? 'Não usar o contexto da tela' : 'Usar o contexto da tela'} onClick=${() => setUsarCtx(v => !v)}><${Icon} n=${usarCtx ? 'x' : 'plus'} s=${11}/></button></span>`
        : html`<span className="ctx"><${Icon} n="lock" s=${11}/><span>Só leitura</span></span>`}</div>
      <div style=${{display:'flex',gap:6,alignItems:'center'}}>${busy ? html`<button type="button" className="btn quiet sm" onClick=${stop}>Parar</button>` : null}
        <button type="submit" className=${'send' + (ready ? ' ready' : '')} aria-label="Enviar" disabled=${!ready}><${Icon} n="up" s=${15} w=${2}/></button></div>
    </div></form></div>`;
}

function Conversa({ai, go, dock, ctx}){
  const [usarCtx, setUsarCtx] = useState(true);
  const endRef = useRef(null);
  const n = ai.cur ? ai.cur.msgs.length : 0;
  const lastLen = ai.cur && ai.cur.msgs[n - 1] ? (ai.cur.msgs[n - 1].text || '').length : 0;
  useEffect(() => { endRef.current && endRef.current.scrollIntoView({block:'end', behavior:'auto'}); }, [n, Math.floor(lastLen / 400)]);
  const onOpen = num => { const p = procByNum(num); if (p) go('processos', {sel:p.id}); };
  const ask = q => ai.ask(q, {ctx: usarCtx && ctx && ctx.nota ? ctx : null});
  return html`<div className="thread-wrap" style=${{flex:1,minHeight:0}}>
    ${!ai.cur || !ai.cur.msgs.length ? html`<div className="idle">
      <div className="eyebrow" style=${{color:'var(--ai-ink)'}}>Assistente</div>
      <h2>O que você quer saber da carteira?</h2>
      <p>O assistente consulta a base do escritório e desenha os gráficos com esses números. Comece por um relatório pronto ou escreva sua pergunta.</p>
      <${Modelos} onAsk=${ask} limite=${dock ? 4 : 0}/>
      ${ai.sampleOk === null ? html`<div className="err">O assistente só responde com o Pauta aberto no Claude. Abra este link no claude.ai para conversar com os dados.</div>` : null}
    </div>` : html`<div className=${'thread' + (dock ? ' indock' : '')}><${Mensagens} conv=${ai.cur} onOpen=${onOpen} onAsk=${ask} dock=${dock}/><div ref=${endRef}></div></div>`}
    <${Composer} onAsk=${ask} busy=${ai.busy} stop=${ai.stop} ctx=${ctx} usarCtx=${usarCtx} setUsarCtx=${setUsarCtx} autoFocus=${!dock}/>
  </div>`;
}

function IAPage({ai, go}){
  const hoje = ai.convs;
  return html`<div className="ia-page v-in">
    <aside className="hist" aria-label="Conversas">
      <button className="btn ghost" onClick=${ai.nova} style=${{justifyContent:'flex-start'}}><${Icon} n="plus" s=${14}/>Nova conversa</button>
      <h4 className="eyebrow">Conversas</h4>
      ${hoje.length ? hoje.map(c => html`<div key=${c.id} style=${{display:'flex'}}><button className="hi" aria-current=${c.id === ai.curId} onClick=${() => ai.abrir(c.id)}><${Icon} n="msg" s=${13}/><span>${c.titulo || 'Nova conversa'}</span></button>
        <button className="ibtn x" style=${{width:28,height:32}} aria-label=${'Apagar conversa: ' + (c.titulo || '')} onClick=${() => ai.apagar(c.id)}><${Icon} n="trash" s=${13}/></button></div>`) : html`<p className="who-s" style=${{padding:'0 10px'}}>As conversas ficam guardadas neste navegador.</p>`}
    </aside>
    <div style=${{display:'flex',flexDirection:'column',minWidth:0}}><${Conversa} ai=${ai} go=${go}/></div>
  </div>`;
}

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
  let last = -99; bands.forEach(b => { b.ty = Math.max(b.ry + b.rh / 2, last + 72); last = b.ty; });
  const hh = Math.max(h, last + 36);
  const mid = (nodeW + rightX) / 2;
  return html`<div ref=${ref} className="flow">
    <svg className="svgc" width=${W} height=${hh} viewBox=${`0 0 ${W} ${hh}`} role="img" aria-label=${`${titulo}: ${fmtR(tot)}. ` + bands.map(b => `${b.l} ${fmtR(b.v)}`).join(', ')} onMouseLeave=${() => setHov(null)}>
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
    {l:'Liminar', ok: r.liminar === 'Deferida'},
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
  ['valor', 'Valor', (a, b) => a.valorCausa - b.valorCausa],
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
      <td><span className=${'aging' + (p.diasParado >= PARADO ? ' late' : '')}><i style=${{width: Math.max(2, p.diasParado / MAXDIAS * 100) + '%'}}></i></span><span className="sub num">${p.diasParado ? plural(p.diasParado, 'dia', 'dias') : 'hoje'}</span></td>
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
          <colgroup><col style=${{width:44}}/><col style=${{width:'32%'}}/><col style=${{width:'22%'}}/><col style=${{width:'12%'}}/><col style=${{width:'17%'}}/><col style=${{width:'17%'}}/></colgroup>
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

/* ================= Busca (⌘K) ================= */
function Busca({onClose, go, perguntar}){
  const [q, setQ] = useState(''); const [i, setI] = useState(0); const ref = useRef(null);
  useEffect(() => { ref.current && ref.current.focus(); }, []);
  const f = q.trim().toLowerCase();
  const itens = [
    ...(!f ? NAV.map(([k, l, ic]) => ({g:'Ir para', t:l, s:'', ic, go:[k, {}]})) : []),
    ...ti.filter(id => f && fe[id].name.toLowerCase().includes(f)).map(id => ({g:'Clientes', t:fe[id].name, s:`${fe[id].contratos.length} contratos · ${fe[id].bloqueado} bloqueado`, ic:'building', go:['clientes', {cli:id}]})),
    ...za.filter(r => f && (r.numero + r.cliente + r.assunto).toLowerCase().includes(f)).map(r => ({g:'Reclamações', t:r.numero, s:r.assunto, ic:'landmark', go:['reclamacoes', {}]})),
    ...Se.filter(p => f && (p.numero + p.desc + p.cliente + p.contrato).toLowerCase().includes(f)).slice(0, 8).map(p => ({g:'Processos', t:p.numero, s:`${p.cliente} · ${p.desc}`, ic:'scale', mono:true, go:['processos', {sel:p.id}]})),
    ...(f ? [{g:'Assistente', t:`Perguntar: “${q.trim()}”`, s:'Consulta a base do escritório', ic:'sparkle', ia:q.trim()}] : [])
  ];
  const abrir = it => { onClose(); it.ia ? perguntar(it.ia) : go(...it.go); };
  let ult = null;
  return html`<div className="cmd" onClick=${e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="cmd-box" role="dialog" aria-modal="true" aria-label="Buscar">
      <div className="cmd-in"><${Icon} n="search" s=${17}/><input ref=${ref} id="busca" placeholder="Buscar processo, cliente, reclamação ou perguntar" value=${q}
        onInput=${e => { setQ(e.target.value); setI(0); }}
        onKeyDown=${e => { if (e.key === 'Escape') onClose(); else if (e.key === 'ArrowDown') { e.preventDefault(); setI(x => Math.min(x + 1, itens.length - 1)); } else if (e.key === 'ArrowUp') { e.preventDefault(); setI(x => Math.max(x - 1, 0)); } else if (e.key === 'Enter' && itens[i]) abrir(itens[i]); }}/><span className="kbd">esc</span></div>
      <div className="cmd-l">${itens.map((it, k) => { const head = it.g !== ult; ult = it.g;
        return html`<div key=${k}>${head ? html`<div className="cmd-g eyebrow">${it.g}</div>` : null}
          <button className="cmd-i" aria-selected=${k === i} onMouseEnter=${() => setI(k)} onClick=${() => abrir(it)}><${Icon} n=${it.ic} s=${15}/>
            <span style=${{minWidth:0}}><span className=${it.mono ? 'mono' : ''} style=${{color:'var(--ink)'}}>${it.t}</span>${it.s ? html`<small>${it.s}</small>` : null}</span></button></div>`; })}
        ${itens.length ? null : html`<div className="empty">Nada encontrado.</div>`}</div>
    </div></div>`;
}

/* ================= Casca ================= */
const NAV = [['painel','Painel','home'],['processos','Processos','scale'],['bloqueios','Bloqueios','lock'],['clientes','Clientes','building'],['reclamacoes','Reclamações','landmark'],['desempenho','Desempenho','trend'],['ia','Assistente','sparkle']];
const NOMES = Object.fromEntries(NAV.map(([k, l]) => [k, l]));
function Lateral({view, go, dark, toggleTheme}){
  return html`<aside className="side" aria-label="Navegação">
    <div className="brand"><b>Pauta</b><span>Azevedo dos Reis</span></div>
    <nav className="nav">${NAV.map(([k, l, i]) => html`<button key=${k} className=${'nv' + (k === 'ia' ? ' ia' : '')} aria-current=${view === k ? 'page' : null} onClick=${() => go(k)}><${Icon} n=${i} s=${16}/>${l}
      ${k === 'processos' ? html`<span className="k">${Se.length}</span>` : k === 'bloqueios' ? html`<span className="k">${Tn.filter(b => b.status === 'Ativo').length}</span>` : k === 'reclamacoes' ? html`<span className="k">${za.length}</span>` : null}</button>`)}</nav>
    <div className="nav-g eyebrow">Clientes</div>
    <nav className="nav">${ti.map(id => html`<button key=${id} className="nv" onClick=${() => go('clientes', {cli:id})}><span className="cdot"></span>${fe[id].name}<span className="k">${fe[id].bloqueadoCurto}</span></button>`)}</nav>
    <div className="side-foot">
      <button className="nv" onClick=${toggleTheme}><${Icon} n=${dark ? 'sun' : 'moon'} s=${16}/>${dark ? 'Tema claro' : 'Tema escuro'}</button>
      <div className="me"><span className="avatar">OM</span><span><b>Orlando</b><small>Somente leitura</small></span></div>
    </div>
  </aside>`;
}
function greeting(){ const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; }
const VIEWS = NAV.map(n => n[0]);

function App(){
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('pauta-theme'); } catch (e) { return null; } });
  const [sysDark, setSysDark] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
  const ini = (location.hash || '').slice(1);
  const [nav, setNav] = useState({view: VIEWS.includes(ini) ? ini : 'painel', opts:{}, n:0});
  const [busca, setBusca] = useState(false);
  const [dock, setDock] = useState(() => ler('pauta:dock', false));
  const [seg, setSeg] = useStore('pauta:seguidos', []);
  const [pins, setPins] = useStore('pauta:fixados', []);
  const [toast, setToast] = useState(null);
  const [dlOk, setDlOk] = useState(false);
  const [ctx, setCtx] = useState({label:'Painel', nota:''});
  const ai = useAI();
  useEffect(() => { const r = document.documentElement; if (theme) r.setAttribute('data-theme', theme); else r.removeAttribute('data-theme'); try { theme ? localStorage.setItem('pauta-theme', theme) : localStorage.removeItem('pauta-theme'); } catch (e) {} }, [theme]);
  useEffect(() => { const m = window.matchMedia('(prefers-color-scheme: dark)'); const f = () => setSysDark(m.matches); m.addEventListener('change', f); return () => m.removeEventListener('change', f); }, []);
  useEffect(() => { const k = e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setBusca(b => !b); } if ((e.metaKey || e.ctrlKey) && e.key === '.') { e.preventDefault(); abrirDock(d => !d); } }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);
  useEffect(() => { downloadsPromise.then(d => setDlOk(!!d)); }, []);
  const dark = theme ? theme === 'dark' : sysDark;
  const aviso = t => { setToast(t); clearTimeout(aviso.t); aviso.t = setTimeout(() => setToast(null), 2800); };
  const abrirDock = v => setDock(d => { const n = typeof v === 'function' ? v(d) : v; gravar('pauta:dock', n); return n; });
  const go = (view, opts = {}) => { setNav(n => ({view, opts, n:n.n + 1})); window.scrollTo({top:0, behavior:'auto'}); try { history.replaceState(null, '', '#' + view); } catch (e) {}
    if (view === 'painel' || view === 'ia') setCtx({label:NOMES[view], nota:''}); };
  const perguntar = q => { if (nav.view !== 'ia') abrirDock(true); ai.ask(q, {ctx: ctx && ctx.nota ? ctx : null}); };
  const toggleSeg = id => setSeg(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const togglePin = (src, titulo) => setPins(ps => { const has = ps.find(p => p.src === src); if (has) { aviso('Gráfico tirado do Painel'); return ps.filter(p => p !== has); } aviso('Gráfico fixado no Painel'); return [...ps, {id:'p' + Date.now().toString(36), src, titulo}].slice(-8); });
  const baixar = async (filename, data) => { const d = await downloadsPromise; if (!d) return aviso('Download indisponível nesta visualização');
    try { const r = await d.save({filename, data}); if (r && r.status === 'saved') aviso('Arquivo salvo'); } catch (e) { if (e && e.code === 'declined') return; aviso(e && e.code === 'rate_limited' ? 'Espere um instante e tente de novo' : 'Não foi possível baixar aqui'); } };
  const {view, opts} = nav;
  const props = {opts, go, perguntar, setCtx};
  const ctxValue = {seg, toggleSeg, pins, togglePin, baixar, dlOk};
  const crumb = view === 'clientes' && opts.cli ? [NOMES[view], fe[opts.cli].name] : [NOMES[view]];
  return html`<${AppCtx.Provider} value=${ctxValue}><div className="shell">
    <${Lateral} view=${view} go=${go} dark=${dark} toggleTheme=${() => setTheme(dark ? 'light' : 'dark')}/>
    <div className="main">
      <div className="bar">
        <div className="crumb"><span>Pauta</span><span>/</span><b>${crumb[0]}</b>${ctx && ctx.nota && view !== 'painel' && view !== 'ia' && ctx.label !== NOMES[view] ? html`<span>/</span><span>${ctx.label}</span>` : null}</div>
        <span className="grow"></span>
        <button className="kbtn" onClick=${() => setBusca(true)} aria-label="Buscar"><${Icon} n="search" s=${14}/><span className="g">Buscar ou perguntar</span><span className="kbd">⌘K</span></button>
        ${view !== 'ia' ? html`<button className="btn ai sm" aria-pressed=${dock} onClick=${() => abrirDock(d => !d)} title="Assistente (⌘.)"><${Icon} n="sparkle" s=${14}/>Assistente</button>` : null}
      </div>
      <nav className="mobnav" aria-label="Seções">${NAV.map(([k, l]) => html`<button key=${k} className="fbtn" aria-pressed=${view === k} onClick=${() => go(k)}>${l}</button>`)}</nav>
      <main key=${view + nav.n}>
        ${view === 'painel' ? html`<${Painel} go=${go} perguntar=${perguntar}/>`
        : view === 'processos' ? html`<${Processos} ...${props}/>`
        : view === 'bloqueios' ? html`<${Bloqueios} ...${props}/>`
        : view === 'clientes' ? html`<${Clientes} ...${props}/>`
        : view === 'reclamacoes' ? html`<${Reclamacoes} ...${props}/>`
        : view === 'desempenho' ? html`<${Desempenho} ...${props}/>`
        : html`<${IAPage} ai=${ai} go=${go}/>`}
      </main>
    </div>
    ${dock && view !== 'ia' ? html`<aside className="dock" aria-label="Assistente">
      <div className="dock-h"><b><${Icon} n="sparkle" s=${15}/>Assistente</b><span className="grow"></span>
        <button className="ibtn" title="Nova conversa" aria-label="Nova conversa" onClick=${ai.nova}><${Icon} n="plus" s=${15}/></button>
        <button className="ibtn" title="Abrir em tela cheia" aria-label="Abrir em tela cheia" onClick=${() => go('ia')}><${Icon} n="upright" s=${15}/></button>
        <button className="ibtn" title="Fechar (⌘.)" aria-label="Fechar assistente" onClick=${() => abrirDock(false)}><${Icon} n="x" s=${15}/></button></div>
      <div className="dock-body" style=${{display:'flex',flexDirection:'column'}}><${Conversa} ai=${ai} go=${go} dock ctx=${ctx}/></div>
    </aside>` : null}
    ${busca ? html`<${Busca} onClose=${() => setBusca(false)} go=${go} perguntar=${perguntar}/>` : null}
    ${toast ? html`<div className="toast" role="status"><${Icon} n="check" s=${14} w=${2}/>${toast}</div>` : null}
  </div><//>`;
}
ReactDOM.createRoot(document.getElementById('root')).render(html`<${App}/>`);
