  /* ===================================================================
     VERSÃO 12
     - Zoom dos gráficos: o gráfico abre em tela cheia, desenhado de novo maior
     - Caminho do dinheiro: cada bloqueio separa o que segue bloqueado, o que
       foi devolvido ao cliente e o que foi perdido (transferido ao credor)
     - "Desde a sua última visita" no topo da Início
     =================================================================== */
  var V12h = Ct.default.createElement,
    V12Css = `
    .v12-barra-x{ transform-origin: left center; animation: v12x .7s cubic-bezier(.2,.8,.2,1) both; }
    @keyframes v12x{ from{ transform: scaleX(0); } }
    .v12-traco{ stroke-dasharray:1; stroke-dashoffset:1; animation: v11traco .5s cubic-bezier(.4,0,.2,1) forwards; }
    .v12-fade{ animation: v10fade .3s both; }
    .v12-conteudo{ animation: v10fade .25s .18s both; }
    @media (prefers-reduced-motion: reduce){
      .v12-barra-x,.v12-fade,.v12-conteudo{ animation:none !important; }
      .v12-traco{ animation:none !important; stroke-dashoffset:0 !important; }
    }
  `;

  /* ---------- Datas e formatos ---------- */
  var V12MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"],
    V12CURTOS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  function V12data(s) {
    let [d, m, a] = String(s).split("/").map(Number);
    return new Date(a, m - 1, d);
  }
  function V12mesLongo(r, comAno = !0) {
    let i = V12CURTOS.indexOf(String(r).toLowerCase().slice(0, 3));
    if (i < 0) return String(r);
    let m = V12MESES[i];
    return m[0].toUpperCase() + m.slice(1) + (comAno ? " de 2026" : "");
  }
  function V12fmt(x, u, curto) {
    if (x == null || isNaN(x)) return "sem dado";
    if (u === "%") return Math.round(x) + "%";
    if (u === "BRL") return curto ? bn(x) : Xt(x);
    return Number(x).toLocaleString("pt-BR");
  }

  /* ---------- Caminho do dinheiro (dados) ----------
     Determinístico pelo id do bloqueio, sem mexer na sequência aleatória da base.
     - original: quanto foi bloqueado
     - devolvido: quanto voltou ao cliente (levantamento total ou parcial)
     - perdido: quanto foi transferido ao credor e não volta
     - valorNum continua sendo o que está bloqueado hoje (Ativo) ou o original (Levantado) */
  function V12dinheiro(lista) {
    let dia = 864e5,
      // Data de um evento entre `ini` e `fim` dias depois do bloqueio; se passar de hoje,
      // cai proporcionalmente no intervalo que existe, para não amontoar tudo na véspera.
      depois = (b, h, ini, fim) => {
        let quer = (ini + (h % (fim - ini))) * dia,
          cabe = Hn.getTime() - dia - b.data.getTime();
        return new Date(b.data.getTime() + (quer <= cabe ? quer : Math.max(0, cabe) * (0.35 + (h % 50) / 100)));
      },
      cem = (x) => Math.max(100, Math.round(x / 100) * 100),
      ordena = (b) => b.historico.sort((x, y) => V12data(y.date) - V12data(x.date));
    for (let b of lista) {
      let h = V10hash(b.id + "|dinheiro"),
        r = h % 100,
        fr = 0.2 + ((h >>> 8) % 45) / 100;
      (b.original = b.valorNum), (b.devolvido = 0), (b.perdido = 0), (b.devolvidoEm = null), (b.perdidoEm = null);
      if (b.status === "Levantado") {
        let idx = b.historico.findIndex((x) => /levantado/i.test(x.text));
        b.id !== "b1" &&
          (!b.liberadoEm || b.liberadoEm.getTime() >= Hn.getTime() - dia) &&
          ((b.liberadoEm = depois(b, h >>> 3, 20, 90)), idx >= 0 && (b.historico[idx].date = Co(b.liberadoEm)));
        let fim = b.liberadoEm,
          tira = () => idx >= 0 && b.historico.splice(idx, 1);
        if (b.id !== "b1" && r < 18) {
          (b.perdido = b.valorNum), (b.perdidoEm = fim), tira();
          b.historico.push({ date: Co(fim), text: `${Xt(b.perdido)} transferidos ao credor por ordem judicial (perdido)` });
        } else if (b.id !== "b1" && r < 45) {
          (b.perdido = cem(b.valorNum * fr)), (b.devolvido = b.valorNum - b.perdido), (b.perdidoEm = fim), (b.devolvidoEm = fim), tira();
          b.historico.push(
            { date: Co(fim), text: `${Xt(b.devolvido)} liberados para o cliente` },
            { date: Co(fim), text: `${Xt(b.perdido)} transferidos ao credor (perdido)` },
          );
        } else (b.devolvido = b.valorNum), (b.devolvidoEm = fim);
      } else if (Hn.getTime() - b.data.getTime() < 8 * dia) {
        // bloqueio recente demais para já ter desbloqueio parcial ou transferência
      } else if (r < 22) {
        let q = cem(b.valorNum * fr * 0.8),
          em = depois(b, h >>> 4, 8, 40);
        (b.devolvido = q), (b.devolvidoEm = em), (b.original = b.valorNum + q);
        b.historico.push({ date: Co(em), text: `Desbloqueio parcial: ${Xt(q)} liberados para o cliente` });
      } else if (r < 34) {
        let q = cem(b.valorNum * fr * 0.6),
          em = depois(b, h >>> 4, 8, 40);
        (b.perdido = q), (b.perdidoEm = em), (b.original = b.valorNum + q);
        b.historico.push({ date: Co(em), text: `Transferência parcial ao credor: ${Xt(q)} (perdido)` });
      }
      ordena(b);
      let ultimo = b.historico[b.historico.length - 1];
      ultimo && /realizado via SISBAJUD/.test(ultimo.text) && (ultimo.text = `Bloqueio de ${Xt(b.original)} realizado via SISBAJUD`);
    }
  }
  var V12COR = { bloqueado: "#B5832A", devolvido: "#2F7A4D", perdido: "#B42318" };

  /* ---------- Caminho do dinheiro (tela) ---------- */
  function V12Caminho({ b: t, compacto: e }) {
    let hoje = t.status === "Ativo" ? t.valorNum : 0,
      partes = [
        ["perdido", "Perdido", "transferido ao credor", t.perdido, t.perdidoEm],
        ["devolvido", "Devolvido ao cliente", null, t.devolvido, t.devolvidoEm],
        ["bloqueado", "Ainda bloqueado", null, hoje, null],
      ],
      tot = t.original || 1;
    return V12h(
      "div",
      { style: { ...Tt, padding: 18, marginTop: e ? 12 : 12 } },
      V12h(
        "div",
        { className: "flex items-baseline justify-between gap-2" },
        V12h("p", { style: { fontFamily: L.ui, fontSize: 16, fontWeight: 600, color: v.ink } }, "Caminho do dinheiro"),
        V12h("p", { style: { fontFamily: L.ui, fontSize: 14, color: v.texto2, whiteSpace: "nowrap" } }, `${Xt(t.original)} bloqueados`),
      ),
      V12h(
        "div",
        {
          className: "flex",
          role: "img",
          "aria-label": partes.filter((p) => p[3] > 0).map((p) => `${p[1]} ${Xt(p[3])}`).join(", "),
          style: { height: 14, gap: 3, marginTop: 12, borderRadius: 999, overflow: "hidden", background: v.linha },
        },
        partes
          .filter((p) => p[3] > 0)
          .map((p, i) =>
            V12h("span", {
              key: p[0],
              className: "v12-barra-x",
              style: { flex: p[3] / tot, minWidth: 6, background: V12COR[p[0]], animationDelay: `${150 + i * 120}ms` },
            }),
          ),
      ),
      V12h(
        "div",
        { className: "flex flex-col", style: { marginTop: 12, gap: 10 } },
        partes.map((p) =>
          V12h(
            "div",
            { key: p[0], className: "flex items-center gap-3", style: { opacity: p[3] > 0 ? 1 : 0.55 } },
            V12h("span", { className: "shrink-0", style: { width: 12, height: 12, borderRadius: 4, background: V12COR[p[0]] } }),
            V12h(
              "span",
              { className: "flex-1 min-w-0" },
              V12h("span", { className: "block", style: { fontFamily: L.ui, fontSize: 16, color: v.ink } }, p[1]),
              (p[2] || p[4]) &&
                V12h(
                  "span",
                  { className: "block", style: { fontFamily: L.ui, fontSize: 13, color: v.texto2 } },
                  [p[2], p[4] && p[3] > 0 ? `em ${Co(p[4])}` : null].filter(Boolean).join(" · "),
                ),
            ),
            V12h(
              "span",
              {
                style: {
                  fontFamily: L.ui,
                  fontSize: 17,
                  fontWeight: 600,
                  color: p[3] > 0 && p[0] === "perdido" ? v.risco : v.ink,
                  fontVariantNumeric: "tabular-nums",
                  whiteSpace: "nowrap",
                },
              },
              p[3] > 0 ? Xt(p[3]) : "—",
            ),
          ),
        ),
      ),
    );
  }

  /* Linha "devolvido · perdido" para blocos escuros */
  function V12LinhaPerdas({ devolvido: t, perdido: e }) {
    let item = (rot, val, cor) =>
      V12h(
        "div",
        { className: "flex-1 min-w-0" },
        V12h("p", { style: { fontFamily: L.ui, fontSize: 13, color: v.marcaTexto2 } }, rot),
        V12h(
          "p",
          { style: { fontFamily: L.ui, fontSize: 18, fontWeight: 600, color: cor, fontVariantNumeric: "tabular-nums", marginTop: 2 } },
          V11h(V11Odo, { texto: Xt(val) }),
        ),
      );
    return V12h(
      "div",
      { className: "flex gap-3", style: { marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.16)" } },
      item("Devolvido em 2026", t, "#9FD5B4"),
      item("Perdido em 2026", e, "#F4A79C"),
    );
  }

  /* ---------- Desde a sua última visita ---------- */
  var V12visita = (() => {
    let ant = null;
    try {
      ant = localStorage.getItem("socios:ultimaVisita");
    } catch {}
    let salvar = () => {
      try {
        localStorage.setItem("socios:ultimaVisita", new Date().toISOString());
      } catch {}
    };
    typeof document < "u" &&
      (document.addEventListener("visibilitychange", () => document.visibilityState === "hidden" && salvar()),
      addEventListener("pagehide", salvar));
    let d = ant ? new Date(ant) : null;
    return { anterior: d && !isNaN(d) ? d : null };
  })();
  function V12Novidades({ seguidos: t, onList: e, onAcompanhando: n }) {
    let ant = V12visita.anterior,
      dias = ant ? Math.min(30, Math.max(1, Math.ceil((Date.now() - ant.getTime()) / 864e5))) : 7,
      ini = Hn.getTime() - dias * 864e5,
      dentro = (d) => d && d.getTime() > ini && d.getTime() <= Hn.getTime(),
      novos = Tn.filter((b) => dentro(b.data)),
      dev = Tn.filter((b) => b.devolvido > 0 && dentro(b.devolvidoEm)),
      perd = Tn.filter((b) => b.perdido > 0 && dentro(b.perdidoEm)),
      stf = za.flatMap((r) => r.movs.filter((m) => dentro(V12data(m[0]))).map((m) => ({ r, data: m[0], texto: m[1] }))),
      ids = new Set(t.map((p) => p.id)),
      segMov = t.filter((p) => dentro(p.ultimaMov)),
      outros = Se.filter((p) => !ids.has(p.id) && dentro(p.ultimaMov)),
      soma = (l, c) => l.reduce((a, b) => a + b[c], 0),
      bus = V10Bus.atual,
      linhas = [
        novos.length && {
          k: "novos",
          cor: v.risco,
          fundo: v.riscoFundo,
          Icone: qo,
          texto: novos.length === 1 ? "1 bloqueio novo" : `${novos.length} bloqueios novos`,
          valor: bn(soma(novos, "original")),
          ir: () => bus && bus.abrirBloqueios("Ativo"),
        },
        perd.length && {
          k: "perd",
          cor: v.risco,
          fundo: v.riscoFundo,
          Icone: Jl,
          tipoIcone: "alerta",
          texto: "Perdido para credores",
          valor: bn(soma(perd, "perdido")),
          ir: () => bus && bus.abrirBloqueios("perda"),
        },
        dev.length && {
          k: "dev",
          cor: v.resolvido,
          fundo: v.resolvidoFundo,
          Icone: j1,
          texto: "Devolvido aos clientes",
          valor: bn(soma(dev, "devolvido")),
          ir: () => bus && bus.abrirBloqueios("Levantado"),
        },
        stf.length && {
          k: "stf",
          cor: v.atencao,
          fundo: v.atencaoFundo,
          Icone: Vs,
          texto: stf.length === 1 ? "1 movimentação no STF" : `${stf.length} movimentações no STF`,
          sub: `${stf[0].r.numero}: ${stf[0].texto}`,
          ir: () => e("reclamacoes"),
        },
        segMov.length && {
          k: "seg",
          cor: v.curso,
          fundo: v.cursoFundo,
          Icone: Lo,
          texto: segMov.length === 1 ? "1 processo que você segue" : `${segMov.length} processos que você segue`,
          sub: "tiveram movimentação",
          ir: n,
        },
        outros.length && {
          k: "outros",
          cor: v.inativo,
          fundo: v.inativoFundo,
          Icone: Lo,
          texto: outros.length === 1 ? "1 outro processo movimentado" : `${outros.length} outros processos movimentados`,
          ir: () => e("movimentacoes"),
        },
      ].filter(Boolean),
      quando = ant
        ? ant.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" }) +
          " às " +
          ant.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
        : null;
    return V12h(
      "section",
      { className: "mt-4", "aria-label": ant ? "Desde a sua última visita" : "Na última semana", style: { ...Tt, padding: "16px 16px 6px" } },
      V12h(
        "p",
        { style: { fontFamily: L.titulo, fontSize: 22, fontWeight: 500, letterSpacing: "-0.015em", color: v.ink } },
        ant ? "Desde a sua última visita" : "Na última semana",
      ),
      V12h(
        "p",
        { style: { fontFamily: L.ui, fontSize: 14, color: v.texto2, marginTop: 2 } },
        quando ? quando.charAt(0).toUpperCase() + quando.slice(1) : "Na próxima visita, o resumo começa de onde você parou",
      ),
      linhas.length === 0
        ? V12h(
            "p",
            { style: { fontFamily: L.ui, fontSize: 16, color: v.texto2, padding: "14px 0 12px" } },
            "Nada novo desde a sua última visita.",
          )
        : V12h(
            "div",
            { style: { marginTop: 8 } },
            linhas.map((x, i) =>
              V12h(
                "button",
                {
                  key: x.k,
                  onClick: x.ir,
                  className: "v10-surge w-full text-left flex items-center gap-3 pressable",
                  style: { animationDelay: `${i * 70}ms`, padding: "11px 0", borderTop: i ? `1px solid ${v.linha}` : "none" },
                },
                V12h(
                  "span",
                  { className: "shrink-0 flex items-center justify-center", style: { width: 38, height: 38, borderRadius: 999, background: x.fundo } },
                  x.tipoIcone ? V12h(Jl, { tipo: x.tipoIcone, cor: x.cor, size: 17 }) : V12h(x.Icone, { size: 17, color: x.cor, strokeWidth: 2 }),
                ),
                V12h(
                  "span",
                  { className: "flex-1 min-w-0" },
                  V12h("span", { className: "block", style: { fontFamily: L.ui, fontSize: 16, color: v.ink, lineHeight: 1.3 } }, x.texto),
                  x.sub &&
                    V12h(
                      "span",
                      {
                        className: "block",
                        style: { fontFamily: L.ui, fontSize: 13, color: v.texto2, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
                      },
                      x.sub,
                    ),
                ),
                x.valor &&
                  V12h(
                    "span",
                    { style: { fontFamily: L.ui, fontSize: 16, fontWeight: 600, color: x.cor, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" } },
                    x.valor,
                  ),
                V12h(io, { size: 14, color: v.texto2, strokeWidth: 2 }),
              ),
            ),
          ),
    );
  }

  /* ---------- Zoom dos gráficos ---------- */
  var V12zoomBus = { set: null },
    V12Lupa = (t) =>
      V12h(pn, { ...t }, V12h("circle", { cx: 10.5, cy: 10.5, r: 6.5 }), V12h("path", { d: "M15.5 15.5L20 20M10.5 8v5M8 10.5h5" })),
    V12Fechar = (t) => V12h(pn, { ...t }, V12h("path", { d: "M6 6L18 18M18 6L6 18" }));
  function V12ampliar(dados, el) {
    let de = el && V11ret(el);
    V12zoomBus.set && V12zoomBus.set({ id: Date.now(), dados, de });
  }
  function V12BotaoAmpliar({ dados: t }) {
    return V12h(
      "button",
      {
        onClick: (e) => V12ampliar(t, e.currentTarget.closest("figure") || e.currentTarget),
        "aria-label": `Ampliar o gráfico${t.titulo ? ": " + t.titulo : ""}`,
        className: "absolute flex items-center justify-center pressable",
        style: { top: 10, right: 10, width: 44, height: 44, borderRadius: 999, background: v.papel, zIndex: 2 },
      },
      V12h(V12Lupa, { size: 20, color: v.ink, strokeWidth: 1.9 }),
    );
  }
  function V12AmpliarDesempenho({ sel: t, meses: e }) {
    let rot = e.map((m) => m.rotulo),
      d = {
        exito: { estilo: "linha", titulo: "Índice de êxito acumulado", unidade: "%", series: [{ rotulo: "Índice de êxito", cor: v.ink, valores: e.map((m) => m.indiceAcumulado) }] },
        novos: {
          estilo: "barras",
          titulo: "Novos e encerrados por mês",
          unidade: "quantidade",
          series: [
            { rotulo: "Novos", cor: Pe.novos, valores: e.map((m) => m.novos) },
            { rotulo: "Encerrados", cor: "#8F897F", valores: e.map((m) => m.encerrados) },
          ],
        },
        levantados: { estilo: "barras", titulo: "Valor devolvido por mês", unidade: "BRL", series: [{ rotulo: "Devolvido", cor: v.resolvido, valores: e.map((m) => m.levantadoValor) }] },
        revertido: {
          estilo: "empilhado",
          titulo: "Valor revertido e mantido por mês",
          unidade: "BRL",
          series: [
            { rotulo: "Revertido", cor: Pe.fav, valores: e.map((m) => m.revertido) },
            { rotulo: "Mantido", cor: Pe.desf, valores: e.map((m) => m.mantido) },
          ],
        },
      }[t];
    return d
      ? V12h(
          "button",
          {
            onClick: (x) => V12ampliar({ tipo: "tempo", rotulos: rot, ...d }, x.currentTarget),
            className: "w-full inline-flex items-center justify-center gap-2 pressable",
            style: { marginTop: 14, height: 48, borderRadius: 14, background: v.cartao, boxShadow: `inset 0 0 0 1.5px ${v.ink}`, fontFamily: L.ui, fontSize: 16, fontWeight: 600, color: v.ink },
          },
          V12h(V12Lupa, { size: 19, color: v.ink, strokeWidth: 1.9 }),
          "Ampliar o gráfico",
        )
      : null;
  }

  function V12Zoom() {
    let [z, setZ] = (0, Ct.useState)(null),
      ref = (0, Ct.useRef)(null),
      saindo = (0, Ct.useRef)(!1);
    (0, Ct.useEffect)(() => ((V12zoomBus.set = (x) => ((saindo.current = !1), setZ(x))), () => (V12zoomBus.set = null)), []);
    let px = (o) => ({ left: o.left + "px", top: o.top + "px", width: o.width + "px", height: o.height + "px" }),
      cheio = (o) => ({ left: "0px", top: "0px", width: o.pw + "px", height: o.ph + "px" });
    (0, Ct.useLayoutEffect)(() => {
      let el = ref.current;
      if (!z || !el || !z.de || ns()) return;
      let a = el.animate(
        [
          { ...px(z.de), borderRadius: "24px" },
          { ...cheio(z.de), borderRadius: "0px" },
        ],
        { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" },
      );
      return () => a.cancel();
    }, [z && z.id]);
    let fechar = () => {
      let el = ref.current;
      if (!el || saindo.current) return;
      saindo.current = !0;
      if (!z.de || ns()) return setZ(null);
      let a = el.animate(
        [
          { ...cheio(z.de), borderRadius: "0px", opacity: 1 },
          { ...px(z.de), borderRadius: "24px", opacity: 0.4 },
        ],
        { duration: 340, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" },
      );
      a.onfinish = () => setZ(null);
    };
    (0, Ct.useEffect)(() => {
      if (!z) return;
      let k = (e) => e.key === "Escape" && fechar();
      return addEventListener("keydown", k), () => removeEventListener("keydown", k);
    }, [z && z.id]);
    return z
      ? V12h(
          "div",
          {
            ref,
            role: "dialog",
            "aria-modal": "true",
            "aria-label": z.dados.titulo || "Gráfico ampliado",
            style: { position: "absolute", left: 0, top: 0, width: "100%", height: "100%", zIndex: 90, background: v.papel, overflow: "hidden" },
          },
          V12h(V12ZoomConteudo, { key: z.id, dados: z.dados, onFechar: fechar }),
        )
      : null;
  }

  function V12ZoomConteudo({ dados: D, onFechar: fechar }) {
    let tempo = D.tipo === "tempo",
      total = D.rotulos.length,
      [faixa, setFaixa] = (0, Ct.useState)([0, total - 1]),
      [sel, setSel] = (0, Ct.useState)(total - 1),
      [ini, fim] = faixa,
      n = fim - ini + 1,
      foco = (0, Ct.useRef)(null),
      gesto = (0, Ct.useRef)({ pts: new Map(), d0: 0, n0: 0, c0: 0, toque: 0, tx: 0 });
    (0, Ct.useEffect)(() => {
      foco.current && foco.current.focus();
    }, []);
    let escolher = (i) => {
        i = Math.max(ini, Math.min(fim, i));
        i !== sel && (setSel(i), (() => { try { navigator.vibrate && navigator.vibrate(4); } catch {} })());
      },
      janela = (a, b) => {
        a = Math.max(0, a), (b = Math.min(total - 1, b));
        setFaixa([a, b]), setSel((s) => Math.max(a, Math.min(b, s)));
      },
      ultimos = (k) => janela(total - Math.min(k, total), total - 1),
      vals = D.series.map((s) => ({ ...s, v: s.valores[sel] })),
      soma = vals.reduce((a, s) => a + (Number(s.v) || 0), 0),
      unico = D.series.length === 1,
      empil = D.estilo === "empilhado",
      principal = empil ? soma : vals[0].v,
      anterior = tempo && sel > 0 ? (empil ? D.series.reduce((a, s) => a + (Number(s.valores[sel - 1]) || 0), 0) : D.series[0].valores[sel - 1]) : null,
      delta = (() => {
        if (anterior == null || principal == null || (!unico && !empil)) return null;
        let d = principal - anterior;
        if (!d) return `Igual a ${V12mesLongo(D.rotulos[sel - 1], !1).toLowerCase()}`;
        let pct = anterior ? Math.round((d / anterior) * 100) : null,
          q = D.unidade === "%" ? `${Math.abs(Math.round(d))} pontos` : pct !== null ? `${Math.abs(pct)}%` : V12fmt(Math.abs(d), D.unidade, !0);
        return `${d > 0 ? "▲" : "▼"} ${q} em relação a ${V12mesLongo(D.rotulos[sel - 1], !1).toLowerCase()}`;
      })();

    /* geometria do gráfico */
    let W = 350,
      H = 330,
      pL = 60,
      pR = 14,
      pT = 18,
      pB = 36,
      pw = W - pL - pR,
      ph = H - pT - pB,
      idxs = Array.from({ length: n }, (_, k) => ini + k),
      maxV = Math.max(1, ...idxs.map((k) => (empil ? D.series.reduce((a, s) => a + (Number(s.valores[k]) || 0), 0) : Math.max(...D.series.map((s) => Number(s.valores[k]) || 0))))),
      ticks = W1(D.unidade === "%" ? Math.max(maxV, 10) : maxV),
      topo = ticks[ticks.length - 1],
      y = (val) => pT + (1 - (Number(val) || 0) / topo) * ph,
      linha = D.estilo === "linha",
      slot = pw / n,
      xc = (k) => (linha ? pL + (n === 1 ? pw / 2 : ((k - ini) * pw) / (n - 1)) : pL + (k - ini + 0.5) * slot),
      paraIndice = (xv) => (linha ? ini + Math.round(((xv - pL) / pw) * (n - 1 || 1)) : ini + Math.floor((xv - pL) / slot)),
      xDe = (ev) => {
        let r = ev.currentTarget.getBoundingClientRect();
        return ((ev.clientX - r.left) / r.width) * W;
      },
      passoRot = n > 8 ? 2 : 1;
    let down = (ev) => {
        let g = gesto.current,
          xv = xDe(ev);
        ev.currentTarget.setPointerCapture && ev.currentTarget.setPointerCapture(ev.pointerId);
        g.pts.set(ev.pointerId, xv);
        if (g.pts.size === 2) {
          let [a, b] = [...g.pts.values()];
          (g.d0 = Math.abs(a - b)), (g.n0 = n), (g.c0 = ini + (n - 1) / 2);
          return;
        }
        let agora = Date.now();
        if (agora - g.toque < 320 && Math.abs(xv - g.tx) < 40) {
          janela(0, total - 1), (g.toque = 0);
          return;
        }
        (g.toque = agora), (g.tx = xv), escolher(paraIndice(xv));
      },
      move = (ev) => {
        let g = gesto.current;
        if (!g.pts.has(ev.pointerId)) return;
        let xv = xDe(ev);
        g.pts.set(ev.pointerId, xv);
        if (g.pts.size >= 2 && g.d0 > 12) {
          let [a, b] = [...g.pts.values()],
            esc = Math.abs(a - b) / g.d0,
            novo = Math.max(Math.min(3, total), Math.min(total, Math.round(g.n0 / esc)));
          if (novo !== n) {
            let a0 = Math.round(g.c0 - (novo - 1) / 2);
            a0 = Math.max(0, Math.min(total - novo, a0));
            janela(a0, a0 + novo - 1);
          }
          return;
        }
        g.pts.size === 1 && escolher(paraIndice(xv));
      },
      up = (ev) => {
        let g = gesto.current;
        g.pts.delete(ev.pointerId), g.pts.size < 2 && (g.d0 = 0);
      };

    let grande = (txt, cor) =>
      V12h(
        "p",
        { style: { fontFamily: L.ui, fontSize: 44, fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.05, color: cor || v.ink, fontVariantNumeric: "tabular-nums", marginTop: 4 } },
        txt,
      );
    let chave = `${ini}-${fim}`,
      grafico = tempo
        ? V12h(
            "svg",
            {
              viewBox: `0 0 ${W} ${H}`,
              width: "100%",
              role: "img",
              "aria-label": `${D.titulo || "Gráfico"}. ${idxs.map((k) => `${V12mesLongo(D.rotulos[k], !1)}: ${D.series.map((s) => (unico ? "" : s.rotulo + " ") + V12fmt(s.valores[k], D.unidade)).join(", ")}`).join(". ")}`,
              style: { display: "block", touchAction: "none", userSelect: "none", overflow: "visible" },
              onPointerDown: down,
              onPointerMove: move,
              onPointerUp: up,
              onPointerCancel: up,
            },
            ticks.map((tk) =>
              V12h(
                "g",
                { key: tk },
                V12h("line", { x1: pL, x2: W - pR, y1: y(tk), y2: y(tk), stroke: v.linha, strokeWidth: 1 }),
                V12h("text", { x: pL - 8, y: y(tk) + 5, textAnchor: "end", fontSize: 15, fill: v.texto2, fontFamily: L.ui }, V12fmt(tk, D.unidade, !0).replace("R$ ", "")),
              ),
            ),
            V12h("line", { x1: xc(sel), x2: xc(sel), y1: pT, y2: H - pB, stroke: v.ink, strokeWidth: 1.2, opacity: 0.35 }),
            V12h(
              "g",
              { key: chave, className: "v12-fade" },
              linha
                ? D.series.map((s, si) => {
                    // Meses sem dado ficam como intervalo na linha, não como zero.
                    let tem = (k) => s.valores[k] != null && !isNaN(s.valores[k]),
                      pts = idxs.filter(tem).map((k) => [xc(k), y(s.valores[k])]),
                      d = idxs
                        .map((k, i) => (tem(k) ? `${i && tem(idxs[i - 1]) ? "L" : "M"}${xc(k).toFixed(1)},${y(s.valores[k]).toFixed(1)}` : ""))
                        .join(" ");
                    return pts.length
                      ? V12h(
                          "g",
                          { key: s.rotulo },
                          unico &&
                            pts.length > 1 &&
                            V12h("path", { d: `M${pts[0][0]},${H - pB} ${pts.map((p) => `L${p[0]},${p[1]}`).join(" ")} L${pts[pts.length - 1][0]},${H - pB} Z`, fill: s.cor, opacity: 0.09 }),
                          V12h("path", { d, pathLength: 1, className: "v12-traco", fill: "none", stroke: s.cor, strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" }),
                          idxs.filter(tem).map((k) => V12h("circle", { key: k, cx: xc(k), cy: y(s.valores[k]), r: k === sel ? 8 : 4.5, fill: k === sel ? s.cor : v.cartao, stroke: s.cor, strokeWidth: 2.5 })),
                        )
                      : null;
                  })
                : idxs.map((k) => {
                    let largura = slot * 0.62,
                      on = k === sel;
                    if (empil) {
                      let acc = 0;
                      return V12h(
                        "g",
                        { key: k, opacity: on ? 1 : 0.5 },
                        D.series.map((s) => {
                          let val = Number(s.valores[k]) || 0,
                            y1 = y(acc + val),
                            y0 = y(acc);
                          return (acc += val), V12h("rect", { key: s.rotulo, x: xc(k) - largura / 2, y: y1, width: largura, height: Math.max(0, y0 - y1 - 1.5), rx: 5, fill: s.cor });
                        }),
                      );
                    }
                    let bw = largura / D.series.length;
                    return V12h(
                      "g",
                      { key: k, opacity: on ? 1 : 0.5 },
                      D.series.map((s, si) => {
                        let val = Number(s.valores[k]) || 0;
                        return V12h("rect", { key: s.rotulo, x: xc(k) - largura / 2 + si * bw + 1, y: y(val), width: Math.max(2, bw - 2), height: Math.max(0, H - pB - y(val)), rx: 5, fill: s.cor });
                      }),
                    );
                  }),
            ),
            idxs.map((k, i) =>
              k === sel || ((i % passoRot === 0 || k === fim) && (passoRot === 1 || Math.abs(k - sel) !== 1))
                ? V12h(
                    "text",
                    { key: "r" + k, x: xc(k), y: H - pB + 24, textAnchor: "middle", fontSize: 15, fontWeight: k === sel ? 700 : 400, fill: k === sel ? v.ink : v.texto2, fontFamily: L.ui },
                    String(D.rotulos[k]).charAt(0).toUpperCase() + String(D.rotulos[k]).slice(1, 3),
                  )
                : null,
            ),
          )
        : V12h(
            "div",
            { className: "flex flex-col", style: { gap: 6 } },
            D.rotulos.map((r, k) => {
              let tot = empil ? D.series.reduce((a, s) => a + (Number(s.valores[k]) || 0), 0) : Math.max(...D.series.map((s) => Number(s.valores[k]) || 0)),
                max = Math.max(1, ...D.rotulos.map((_, j) => (empil ? D.series.reduce((a, s) => a + (Number(s.valores[j]) || 0), 0) : Math.max(...D.series.map((s) => Number(s.valores[j]) || 0))))),
                on = k === sel;
              return V12h(
                "button",
                {
                  key: r,
                  onClick: () => setSel(k),
                  "aria-pressed": on,
                  className: "w-full text-left pressable",
                  style: { padding: "12px 14px", borderRadius: 16, background: on ? v.cartao : "transparent", boxShadow: on ? Tt.boxShadow : "none" },
                },
                V12h(
                  "span",
                  { className: "flex items-baseline justify-between gap-2" },
                  V12h("span", { style: { fontFamily: L.ui, fontSize: 17, fontWeight: on ? 600 : 400, color: v.ink } }, r),
                  V12h("span", { style: { fontFamily: L.ui, fontSize: 17, fontWeight: 600, color: v.ink, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" } }, V12fmt(tot, D.unidade, !0)),
                ),
                empil || unico
                  ? V12h(
                      "span",
                      { className: "flex", style: { marginTop: 8, height: 14, gap: 2, width: `${Math.max(2, (tot / max) * 100)}%` } },
                      D.series.map((s, si) =>
                        (Number(s.valores[k]) || 0) > 0
                          ? V12h("span", {
                              key: s.rotulo,
                              className: "v12-barra-x",
                              style: { flex: Number(s.valores[k]) || 0, background: s.cor, borderRadius: si === D.series.length - 1 ? "0 5px 5px 0" : 0, animationDelay: `${k * 40}ms` },
                            })
                          : null,
                      ),
                    )
                  : D.series.map((s) =>
                      V12h("span", {
                        key: s.rotulo,
                        className: "block v12-barra-x",
                        style: { marginTop: 5, height: 10, borderRadius: 5, background: s.cor, width: `${Math.max(1, ((Number(s.valores[k]) || 0) / max) * 100)}%`, animationDelay: `${k * 40}ms` },
                      }),
                    ),
              );
            }),
          );

    return V12h(
      "div",
      { className: "v12-conteudo flex flex-col", style: { height: "100%" } },
      V12h(
        "div",
        { className: "flex items-center gap-3 px-5 shrink-0", style: { paddingTop: 52, paddingBottom: 6 } },
        V12h(
          "button",
          {
            ref: foco,
            onClick: fechar,
            "aria-label": "Fechar o gráfico ampliado",
            className: "shrink-0 flex items-center justify-center pressable",
            style: { width: 44, height: 44, borderRadius: 999, background: v.cartao, boxShadow: Tt.boxShadow },
          },
          V12h(V12Fechar, { size: 20, color: v.ink, strokeWidth: 2 }),
        ),
        V12h(
          "p",
          { className: "min-w-0", style: { fontFamily: L.titulo, fontSize: 22, fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.15, color: v.ink } },
          D.titulo || "Gráfico",
        ),
      ),
      V12h(
        "div",
        { className: "flex-1 overflow-y-auto no-scrollbar px-5", style: { paddingBottom: 40 } },
        V12h(
          "div",
          { "aria-live": "polite", style: { padding: "10px 0 14px", minHeight: 120 } },
          V12h("p", { style: { fontFamily: L.ui, fontSize: 17, color: v.texto2 } }, tempo ? V12mesLongo(D.rotulos[sel]) : D.rotulos[sel]),
          unico || empil
            ? principal == null || isNaN(principal)
              ? V12h("p", { style: { fontFamily: L.ui, fontSize: 26, fontWeight: 500, color: v.texto2, marginTop: 8 } }, "Sem dado neste mês")
              : grande(V12fmt(principal, D.unidade))
            : V12h(
                "div",
                { className: "flex flex-col", style: { gap: 4, marginTop: 6 } },
                vals.map((s) =>
                  V12h(
                    "p",
                    { key: s.rotulo, className: "flex items-center gap-2", style: { fontFamily: L.ui, fontSize: 24, fontWeight: 500, color: v.ink, fontVariantNumeric: "tabular-nums" } },
                    V12h("span", { style: { width: 12, height: 12, borderRadius: 4, background: s.cor } }),
                    V12h("span", { style: { fontSize: 17, fontWeight: 400, color: v.texto2, minWidth: 92 } }, s.rotulo),
                    V12fmt(s.v, D.unidade),
                  ),
                ),
              ),
          empil &&
            V12h(
              "p",
              { style: { fontFamily: L.ui, fontSize: 15, color: v.texto2, marginTop: 6 } },
              vals.filter((s) => Number(s.v) > 0).map((s) => `${s.rotulo} ${V12fmt(s.v, D.unidade, !0)}`).join(" · ") || "Nada no mês",
            ),
          delta && V12h("p", { style: { fontFamily: L.ui, fontSize: 16, color: v.texto2, marginTop: 6 } }, delta),
        ),
        V12h("div", { style: { ...Tt, padding: tempo ? "14px 10px 8px 4px" : 8 } }, grafico),
        !unico &&
          V12h(
            "div",
            { className: "flex flex-wrap", style: { gap: "6px 16px", marginTop: 12 } },
            D.series.map((s) =>
              V12h(
                "span",
                { key: s.rotulo, className: "inline-flex items-center gap-2", style: { fontFamily: L.ui, fontSize: 16, color: v.ink } },
                V12h("span", { style: { width: 12, height: 12, borderRadius: 4, background: s.cor } }),
                s.rotulo,
              ),
            ),
          ),
        tempo &&
          total > 3 &&
          V12h(
            Ct.default.Fragment,
            null,
            V12h(
              "div",
              { className: "flex items-center gap-2", style: { marginTop: 16 } },
              V12h(
                "div",
                { className: "flex-1" },
                V12h(Zs, {
                  itens: [
                    { id: "tudo", label: "Tudo" },
                    ...(total > 6 ? [{ id: "6", label: "6 meses" }] : []),
                    { id: "3", label: "3 meses" },
                  ],
                  ativo: n === total ? "tudo" : n === 6 && fim === total - 1 ? "6" : n === 3 && fim === total - 1 ? "3" : "",
                  onChange: (id) => (id === "tudo" ? janela(0, total - 1) : ultimos(Number(id))),
                  label: "Período do gráfico",
                }),
              ),
            ),
            n < total &&
              V12h(
                "div",
                { className: "flex gap-2", style: { marginTop: 10 } },
                V12h("div", { className: "flex-1" }, V12h(Ye, { variante: "secundario", disabled: ini === 0, onClick: () => janela(ini - 1, fim - 1) }, "◀ Antes")),
                V12h("div", { className: "flex-1" }, V12h(Ye, { variante: "secundario", disabled: fim === total - 1, onClick: () => janela(ini + 1, fim + 1) }, "Depois ▶")),
              ),
            V12h(
              "p",
              { style: { fontFamily: L.ui, fontSize: 15, color: v.texto2, marginTop: 14, lineHeight: 1.45 } },
              "Arraste o dedo sobre o gráfico para ler cada mês. Use dois dedos para aproximar ou afastar; toque duas vezes para ver tudo.",
            ),
          ),
        !tempo &&
          V12h("p", { style: { fontFamily: L.ui, fontSize: 15, color: v.texto2, marginTop: 14 } }, "Toque numa linha para ver o valor no topo."),
      ),
    );
  }
