  /* ===================================================================
     VERSÃO 10 — novidades
     - Ações a partir da IA (cartões de processos, folha de ação, confirmação)
     - Caixa da IA na Início, com perguntas digitadas letra por letra
     - Gráfico empilhado por mês com faixas de ligação
     - Contas bancárias do contrato de gestão
     Tudo usa os dados da base; a IA só aponta quais processos mostrar.
     =================================================================== */
  var V10h = Ct.default.createElement,
    V10Bus = { atual: null },
    V10num = (n) => Se.find((p) => p.numero === String(n || "").trim()),
    V10bloq = (p) => Tn.filter((b) => b.processoId === p.id && b.status === "Ativo").reduce((a, b) => a + b.valorNum, 0),
    V10atraso = (i, ativo = !0) => (ativo ? { animationDelay: `${Math.min(i, 10) * 80}ms` } : null),
    V10Relogio = (t) =>
      V10h(pn, { ...t }, V10h("circle", { cx: 12, cy: 12, r: 8.5 }), V10h("path", { d: "M12 7.5V12L15 14" })),
    V10Seta = (t) => V10h(pn, { ...t }, V10h("path", { d: "M12 19V5M6 11L12 5L18 11" })),
    V10Sino = (t) =>
      V10h(
        pn,
        { ...t },
        V10h("path", { d: "M6 9a6 6 0 0 1 12 0c0 6 2.5 8 2.5 8h-17S6 15 6 9Z" }),
        V10h("path", { d: "M10.3 20.5a2 2 0 0 0 3.4 0" }),
      ),
    V10Banco = (t) =>
      V10h(pn, { ...t }, V10h("path", { d: "M3 20h18M5 17V10M9.7 17V10M14.3 17V10M19 17V10M12 3l9 5H3l9-5Z" })),
    V10Css = `
    .v10-surge{ animation: v10surge .6s cubic-bezier(.2,.8,.2,1) both; }
    @keyframes v10surge{ from{ opacity:0; transform: translateY(10px); filter: blur(6px); } to{ opacity:1; transform:none; filter:none; } }
    .v10-cresce{ transform-box: fill-box; transform-origin: 50% 100%; animation: v10cresce .8s cubic-bezier(.2,.8,.2,1) both; }
    @keyframes v10cresce{ from{ transform: scaleY(.04); } }
    .v10-faixa{ animation: v10fade .7s .45s both; }
    @keyframes v10fade{ from{ opacity:0; } }
    .v10-brilho{ background: linear-gradient(90deg, #8C877C 0%, #1A1916 45%, #8C877C 90%); background-size: 220% 100%;
      -webkit-background-clip: text; background-clip: text; color: transparent; animation: v10brilho 1.6s linear infinite; }
    @keyframes v10brilho{ from{ background-position: 120% 0; } to{ background-position: -120% 0; } }
    .v10-gira{ animation: gspin 1s linear infinite; }
    .v10-pulsa{ animation: v10pulsa 1.3s ease-in-out infinite; }
    @keyframes v10pulsa{ 50%{ transform: scale(.78) rotate(18deg); opacity:.6; } }
    .v10-pop{ animation: v10pop .6s cubic-bezier(.3,1.7,.5,1) both; position: relative; }
    .v10-pop::after{ content:""; position:absolute; inset:0; border-radius:999px; border:2px solid #2F7A4D; animation: v10anel 1.1s .2s ease-out both; }
    @keyframes v10pop{ from{ transform: scale(.3); opacity:0; } }
    @keyframes v10anel{ from{ transform: scale(1); opacity:.7; } to{ transform: scale(1.8); opacity:0; } }
    .v10-risco path{ stroke-dasharray: 24; stroke-dashoffset: 24; animation: v10risco .4s .35s ease-out forwards; }
    @keyframes v10risco{ to{ stroke-dashoffset: 0; } }
    .v10-marca path{ stroke-dasharray: 24; stroke-dashoffset: 24; transition: stroke-dashoffset .3s .05s; }
    .v10-marca.on path{ stroke-dashoffset: 0; }
    .v10-destaque{ animation: v10destaque 2.4s ease-out; }
    @keyframes v10destaque{ 0%,35%{ background: #F2E8D3; } 100%{ background: transparent; } }
    .v10-cursor{ display:inline-block; width:1.5px; height:1.05em; background:#1A1916; vertical-align:-3px; margin-left:1px; animation: v10pisca 1s steps(1) infinite; }
    @keyframes v10pisca{ 50%{ opacity:0; } }
    .v10-trilho{ scrollbar-width:none; scroll-snap-type:x mandatory; }
    .v10-trilho::-webkit-scrollbar{ display:none; }
    @media (prefers-reduced-motion: reduce){
      .v10-surge,.v10-cresce,.v10-faixa,.v10-brilho,.v10-pulsa,.v10-pop,.v10-pop::after,.v10-destaque,.v10-cursor,.v10-gira{ animation:none !important; }
      .v10-brilho{ color:#1A1916; background:none; }
      .v10-risco path,.v10-marca path{ stroke-dashoffset:0 !important; animation:none !important; transition:none !important; }
    }
  `;

  // Digita um texto letra por letra; devolve uma função que cancela.
  function V10digitar(texto, set, aoFim) {
    if (ns()) {
      set(texto), aoFim && aoFim();
      return () => {};
    }
    let i = 0,
      vivo = !0,
      passo = () => {
        if (!vivo) return;
        i++, set(texto.slice(0, i));
        if (i >= texto.length) {
          aoFim && aoFim();
          return;
        }
        let c = texto[i - 1];
        setTimeout(passo, 22 + (c === " " ? 14 : 0) + (/[,.?]/.test(c) ? 90 : 0) + Math.random() * 16);
      };
    return passo(), () => {
      vivo = !1;
    };
  }

  /* ---------- Cartões de processos dentro da resposta da IA ---------- */
  function V10Cartoes({ corpo: t, cascata: e }) {
    let ctx = V10Bus.atual,
      [sel, setSel] = (0, Ct.useState)(null),
      dados;
    try {
      dados = JSON.parse(t);
    } catch {
      return null;
    }
    let lista = (dados.processos || [])
      .map((n) => V10num(n))
      .filter(Boolean)
      .slice(0, 6);
    if (!lista.length) return null;
    return V10h(
      "div",
      { style: { margin: "18px 0" } },
      V10h(
        "div",
        { className: "flex items-baseline justify-between gap-2" },
        V10h(
          "p",
          { style: { fontFamily: L.ui, fontSize: 16, fontWeight: 600, color: v.ink } },
          dados.titulo || "Processos para acompanhar",
        ),
        V10h(
          "span",
          { style: { fontFamily: L.ui, fontSize: 13, color: v.texto2, whiteSpace: "nowrap" } },
          lista.length === 1 ? "1 processo" : `${lista.length} processos`,
        ),
      ),
      V10h(
        "p",
        { style: { fontFamily: L.ui, fontSize: 14, color: v.texto2, marginTop: 2 } },
        "Toque num cart\xE3o e escolha o que fazer.",
      ),
      V10h(
        "div",
        {
          className: "v10-trilho flex overflow-x-auto",
          style: { gap: 10, margin: "12px -24px 0", padding: "4px 24px 8px", scrollPaddingInline: 24 },
        },
        lista.map((p, i) => {
          let b = V10bloq(p),
            on = sel === p.id,
            segue = ctx?.seguidos.has(p.id),
            parado = p.diasParado >= 90;
          return V10h(
            "button",
            {
              key: p.id,
              onClick: () => setSel(on ? null : p.id),
              "aria-pressed": on,
              className: "v10-surge text-left shrink-0 flex flex-col pressable",
              style: {
                ...V10atraso(i, e),
                width: 214,
                scrollSnapAlign: "start",
                background: v.cartao,
                borderRadius: 20,
                padding: 6,
                boxShadow: on ? `0 0 0 2px ${v.ink}, 0 0 0 6px rgba(26,25,22,.08)` : Tt.boxShadow,
                transition: "box-shadow .25s ease",
              },
            },
            V10h(
              "span",
              {
                className: "block",
                style: { background: parado ? v.atencaoFundo : v.papel, borderRadius: 15, padding: "12px 12px 10px" },
              },
              V10h(
                "span",
                {
                  className: "block",
                  style: {
                    fontFamily: L.ui,
                    fontSize: 22,
                    fontWeight: 500,
                    letterSpacing: "-0.035em",
                    color: v.ink,
                    fontVariantNumeric: "tabular-nums",
                  },
                },
                bn(b || p.valorCausa || 0),
              ),
              V10h(
                "span",
                { className: "block", style: { fontFamily: L.ui, fontSize: 13, color: v.texto2 } },
                b ? "bloqueado hoje" : "em discuss\xE3o",
              ),
            ),
            V10h(
              "span",
              { className: "block", style: { padding: "10px 8px 4px" } },
              V10h(
                "span",
                { className: "flex items-center gap-1.5", style: { fontFamily: L.ui, fontSize: 15, fontWeight: 600, color: v.ink } },
                p.cliente,
                segue && V10h(Jp, { filled: !0, size: 14, color: v.ia }),
              ),
              V10h(
                "span",
                {
                  className: "block",
                  style: {
                    fontFamily: L.ui,
                    fontSize: 14,
                    color: v.texto2,
                    lineHeight: 1.3,
                    marginTop: 2,
                    height: 36,
                    overflow: "hidden",
                  },
                },
                p.desc,
              ),
              V10h(
                "span",
                { className: "block", style: { fontFamily: L.dados, fontSize: 12, color: v.texto2, marginTop: 6 } },
                p.numero,
              ),
            ),
            V10h(
              "span",
              {
                className: "flex items-center gap-1.5",
                style: {
                  borderTop: `1px solid ${v.linha}`,
                  margin: "8px 2px 0",
                  padding: "8px 6px 4px",
                  fontFamily: L.ui,
                  fontSize: 13,
                  fontWeight: parado ? 600 : 400,
                  color: parado ? v.atencao : v.texto2,
                },
              },
              V10h(V10Relogio, { size: 14, color: parado ? v.atencao : v.texto2 }),
              p.diasParado === 0 ? "Movimentado hoje" : `${p.diasParado} dias parado`,
            ),
          );
        }),
      ),
      V10h(
        "div",
        { className: "v10-surge", style: { ...V10atraso(lista.length, e), marginTop: 6 } },
        V10h(
          Ye,
          { onClick: () => ctx && ctx.abrirAcao(sel), disabled: !sel || !ctx },
          sel ? "Escolher o que fazer" : "Selecione um processo",
        ),
      ),
    );
  }

  /* ---------- Folha de ação: seguir processo e/ou avisar se ficar parado ---------- */
  var V10PRAZOS = [30, 60, 90, 120, 180, 240, 365];
  function V10Opcao({ on: t, onClick: e, titulo: n, detalhe: o, travado: i, children: a }) {
    return V10h(
      "div",
      { className: "flex items-start gap-3" },
      V10h(
        "button",
        {
          role: "checkbox",
          "aria-checked": !!t,
          "aria-label": n,
          disabled: i,
          onClick: e,
          className: "v10-marca shrink-0 flex items-center justify-center" + (t ? " on" : ""),
          style: {
            width: 24,
            height: 24,
            marginTop: 14,
            borderRadius: 7,
            border: `1.75px solid ${t ? v.ink : "#8C877C"}`,
            background: t ? v.ink : "transparent",
            opacity: i ? 0.55 : 1,
            transition: "background .2s, border-color .2s",
          },
        },
        V10h(
          "svg",
          { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "#FFFFFF", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" },
          V10h("path", { d: "M20 6 9 17l-5-5" }),
        ),
      ),
      V10h(
        "div",
        { className: "flex-1 min-w-0", style: { background: v.papel, borderRadius: 16, padding: "12px 14px" } },
        V10h(
          "button",
          { onClick: e, disabled: i, className: "w-full text-left" },
          V10h("span", { className: "block", style: { fontFamily: L.ui, fontSize: 16, fontWeight: 600, color: v.ink } }, n),
          V10h(
            "span",
            { className: "block", style: { fontFamily: L.ui, fontSize: 14, color: v.texto2, marginTop: 2, lineHeight: 1.35 } },
            o,
          ),
        ),
        a,
      ),
    );
  }
  function V10Folha({ processoId: t, onFechar: e }) {
    let ctx = V10Bus.atual,
      p = Se.find((x) => x.id === t),
      jaSegue = ctx.seguidos.has(t),
      opcoes = V10PRAZOS.filter((d) => d > p.diasParado).slice(0, 3),
      jaTemAlerta = ctx.alertas.some((a) => a.tipo === "processo_parado" && a.processoId === t && a.ativo),
      [seguir, setSeguir] = (0, Ct.useState)(!jaSegue),
      [avisar, setAvisar] = (0, Ct.useState)(!jaTemAlerta && opcoes.length > 0),
      [prazo, setPrazo] = (0, Ct.useState)(opcoes[0]),
      [feito, setFeito] = (0, Ct.useState)(null),
      ref = (0, Ct.useRef)(null),
      b = V10bloq(p);
    (0, Ct.useEffect)(() => {
      ref.current && ref.current.focus();
      let k = (ev) => ev.key === "Escape" && e();
      return window.addEventListener("keydown", k), () => window.removeEventListener("keydown", k);
    }, [feito]);
    let confirmar = () => {
        let itens = [];
        seguir && !jaSegue && (ctx.alternarSeguir(t), itens.push(["seguir", "Processo seguido", "Aparece em Processos que acompanho"]));
        avisar &&
          prazo &&
          (ctx.criarAlerta({ tipo: "processo_parado", processoId: t, limite: prazo }),
          itens.push(["alerta", `Aviso de ${prazo} dias parado`, "Fica em Perfil → Meus alertas"]));
        setFeito(itens);
      },
      algo = (seguir && !jaSegue) || (avisar && prazo);
    return V10h(
      "div",
      { className: "absolute inset-0", style: { zIndex: 70 } },
      V10h("button", {
        "aria-label": "Fechar",
        onClick: e,
        className: "absolute inset-0",
        style: { background: "rgba(40,34,24,.42)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)" },
      }),
      V10h(
        "div",
        {
          key: feito ? "feito" : "escolha",
          ref,
          tabIndex: -1,
          role: "dialog",
          "aria-modal": "true",
          "aria-label": feito ? "A\xE7\xE3o conclu\xEDda" : "O que fazer com este processo",
          className: "guia-sheet absolute left-0 right-0 bottom-0 flex flex-col",
          style: {
            background: v.cartao,
            borderRadius: "28px 28px 0 0",
            padding: "10px 24px 34px",
            maxHeight: "88%",
            overflowY: "auto",
            outline: "none",
          },
        },
        V10h("div", { className: "mx-auto shrink-0", style: { width: 40, height: 5, borderRadius: 3, background: v.linha } }),
        feito
          ? V10h(
              Ct.default.Fragment,
              null,
              V10h(
                "div",
                { className: "flex flex-col items-center text-center", style: { marginTop: 18 } },
                V10h(
                  "span",
                  {
                    className: "v10-pop v10-risco flex items-center justify-center",
                    style: { width: 64, height: 64, borderRadius: 999, background: v.resolvido },
                  },
                  V10h(
                    "svg",
                    { width: 30, height: 30, viewBox: "0 0 24 24", fill: "none", stroke: "#FFFFFF", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" },
                    V10h("path", { d: "M20 6 9 17l-5-5" }),
                  ),
                ),
                V10h(
                  "h3",
                  { style: { fontFamily: L.titulo, fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em", color: v.ink, marginTop: 16 } },
                  "Pronto",
                ),
                V10h(
                  "p",
                  { style: { fontFamily: L.ui, fontSize: 16, color: v.texto2, marginTop: 6, lineHeight: 1.4, maxWidth: 300 } },
                  `${p.cliente} \xB7 ${p.desc}. Voc\xEA ser\xE1 avisada aqui no app.`,
                ),
              ),
              V10h(
                "div",
                { style: { ...Tt, background: v.papel, boxShadow: "none", padding: "4px 16px", marginTop: 18 } },
                feito.map(([k, titulo, sub], i) =>
                  V10h(
                    "div",
                    {
                      key: k,
                      className: "v10-surge flex items-center gap-3",
                      style: { animationDelay: `${300 + i * 120}ms`, padding: "12px 0", borderTop: i ? `1px solid ${v.linha}` : "none" },
                    },
                    V10h(
                      "span",
                      { className: "shrink-0 flex items-center justify-center", style: { width: 38, height: 38, borderRadius: 999, background: v.cartao } },
                      k === "seguir" ? V10h(Jp, { filled: !0, size: 17, color: v.ia }) : V10h(V10Sino, { size: 18, color: v.ink }),
                    ),
                    V10h(
                      "span",
                      { className: "flex-1 min-w-0" },
                      V10h("span", { className: "block", style: { fontFamily: L.ui, fontSize: 16, fontWeight: 600, color: v.ink } }, titulo),
                      V10h("span", { className: "block", style: { fontFamily: L.ui, fontSize: 14, color: v.texto2 } }, sub),
                    ),
                    V10h("span", { style: { fontFamily: L.ui, fontSize: 14, fontWeight: 600, color: v.resolvido } }, "Ativo"),
                  ),
                ),
              ),
              V10h(
                "div",
                { className: "flex gap-2", style: { marginTop: 18 } },
                V10h(
                  "div",
                  { className: "flex-1" },
                  V10h(
                    Ye,
                    {
                      variante: "secundario",
                      onClick: () => {
                        e(), feito.some((f) => f[0] === "seguir") ? ctx.irAcompanhando(t) : ctx.irAlertas();
                      },
                    },
                    feito.some((f) => f[0] === "seguir") ? "Ver na lista" : "Ver alertas",
                  ),
                ),
                V10h("div", { className: "flex-1" }, V10h(Ye, { onClick: e }, "Concluir")),
              ),
            )
          : V10h(
              Ct.default.Fragment,
              null,
              V10h(
                "h3",
                { style: { fontFamily: L.titulo, fontSize: 24, fontWeight: 500, letterSpacing: "-0.02em", color: v.ink, marginTop: 14 } },
                "O que fazer com este processo",
              ),
              V10h(
                "div",
                { className: "flex items-center gap-3", style: { ...Tt, background: v.papel, boxShadow: "none", padding: 14, marginTop: 14 } },
                V10h(
                  "span",
                  { className: "shrink-0 flex items-center justify-center", style: { width: 52, height: 52, borderRadius: 14, background: v.cartao } },
                  V10h(Lo, { size: 22, color: v.ink }),
                ),
                V10h(
                  "span",
                  { className: "flex-1 min-w-0" },
                  V10h(
                    "span",
                    { className: "flex items-baseline justify-between gap-2" },
                    V10h("span", { style: { fontFamily: L.ui, fontSize: 16, fontWeight: 600, color: v.ink } }, p.cliente),
                    b > 0 &&
                      V10h(
                        "span",
                        { style: { fontFamily: L.ui, fontSize: 16, fontWeight: 500, color: v.ink, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" } },
                        bn(b),
                      ),
                  ),
                  V10h("span", { className: "block", style: { fontFamily: L.ui, fontSize: 14, color: v.texto2, lineHeight: 1.3, marginTop: 2 } }, p.desc),
                  V10h("span", { className: "block", style: { fontFamily: L.dados, fontSize: 12, color: v.texto2, marginTop: 4 } }, p.numero),
                  V10h(
                    "span",
                    { className: "block", style: { fontFamily: L.ui, fontSize: 13, color: p.diasParado >= 90 ? v.atencao : v.texto2, marginTop: 4 } },
                    p.diasParado === 0 ? "Movimentado hoje" : `${p.diasParado} dias sem movimenta\xE7\xE3o`,
                  ),
                ),
              ),
              V10h(
                "div",
                { className: "flex flex-col", style: { gap: 10, marginTop: 18 } },
                V10h(V10Opcao, {
                  on: jaSegue || seguir,
                  travado: jaSegue,
                  onClick: () => setSeguir(!seguir),
                  titulo: jaSegue ? "Voc\xEA j\xE1 segue este processo" : "Seguir este processo",
                  detalhe: "Cada movimenta\xE7\xE3o chega em Notifica\xE7\xF5es.",
                }),
                opcoes.length > 0 &&
                  V10h(
                    V10Opcao,
                    {
                      on: jaTemAlerta || avisar,
                      travado: jaTemAlerta,
                      onClick: () => setAvisar(!avisar),
                      titulo: jaTemAlerta ? "J\xE1 existe um aviso para este processo" : "Avisar se ficar parado",
                      detalhe: jaTemAlerta ? "Veja em Perfil → Meus alertas." : "Escolha depois de quantos dias sem movimenta\xE7\xE3o.",
                    },
                    !jaTemAlerta &&
                      V10h(
                        "div",
                        { className: "flex flex-wrap", style: { gap: 8, marginTop: 10, opacity: avisar ? 1 : 0.5 } },
                        opcoes.map((d) =>
                          V10h(
                            "button",
                            {
                              key: d,
                              onClick: () => (setPrazo(d), setAvisar(!0)),
                              "aria-pressed": prazo === d,
                              className: "pressable",
                              style: {
                                fontFamily: L.ui,
                                fontSize: 15,
                                fontWeight: 600,
                                padding: "8px 14px",
                                borderRadius: 999,
                                background: prazo === d ? v.ink : v.cartao,
                                color: prazo === d ? "#FFFFFF" : v.ink,
                                boxShadow: prazo === d ? "none" : `inset 0 0 0 1px ${v.linha}`,
                              },
                            },
                            `${d} dias`,
                          ),
                        ),
                      ),
                  ),
              ),
              V10h(
                "div",
                { className: "flex gap-2", style: { marginTop: 20 } },
                V10h("div", { className: "flex-1" }, V10h(Ye, { variante: "secundario", onClick: e }, "Cancelar")),
                V10h("div", { className: "flex-1" }, V10h(Ye, { onClick: confirmar, disabled: !algo }, "Confirmar")),
              ),
              V10h(
                "button",
                {
                  onClick: () => (e(), ctx.abrirProcesso(p)),
                  className: "w-full",
                  style: { ...wi, fontFamily: L.ui, fontSize: 16, marginTop: 14, textAlign: "center" },
                },
                "Abrir o processo",
              ),
            ),
      ),
    );
  }

  /* ---------- Caixa da IA na Início ---------- */
  var V10PERGUNTAS = [
    ["Bloqueios ativos", "Quais bloqueios est\xE3o ativos h\xE1 mais tempo e de quais clientes?"],
    ["Processos parados", "Quais processos est\xE3o parados h\xE1 mais de 90 dias?"],
    ["Passivo por contrato", "Qual contrato de gest\xE3o tem o maior passivo estimado hoje?"],
  ];
  function V10CaixaIA({ onPerguntar: t }) {
    let [texto, setTexto] = (0, Ct.useState)(""),
      [digitando, setDigitando] = (0, Ct.useState)(!1),
      cancela = (0, Ct.useRef)(null),
      pronto = texto.trim().length > 0 && !digitando;
    (0, Ct.useEffect)(() => () => cancela.current && cancela.current(), []);
    let escolher = (q) => {
        cancela.current && cancela.current(), setDigitando(!0);
        cancela.current = V10digitar(q, setTexto, () => setDigitando(!1));
      },
      enviar = () => {
        pronto && (t(texto.trim()), setTexto(""));
      };
    return V10h(
      "section",
      {
        className: "mt-4",
        "aria-label": "Pergunte \xE0 IA",
        style: { ...Tt, background: v.oliva, boxShadow: "0 10px 24px rgba(31,30,26,.16)", padding: 14 },
      },
      V10h(
        "div",
        { className: "flex items-center justify-between gap-2", style: { padding: "4px 4px 12px" } },
        V10h(
          "p",
          { className: "flex items-center gap-2", style: { fontFamily: L.titulo, fontSize: 22, fontWeight: 500, color: "#FFFFFF", letterSpacing: "-0.015em" } },
          V10h(No, { size: 20, color: v.dourado, strokeWidth: 1.8 }),
          "Pergunte \xE0 IA",
        ),
        V10h("span", { style: { fontFamily: L.ui, fontSize: 13, color: "#E6E1D6" } }, "consulta a base"),
      ),
      V10h(
        "div",
        { style: { background: v.cartao, borderRadius: 18, padding: 12 } },
        V10h(
          "div",
          { className: "flex flex-col items-start", style: { gap: 8 } },
          V10PERGUNTAS.map(([r, q], i) =>
            V10h(
              "button",
              {
                key: r,
                onClick: () => escolher(q),
                className: "inline-flex items-center gap-2 pressable",
                style: {
                  fontFamily: L.ui,
                  fontSize: 15,
                  fontWeight: 500,
                  color: v.ink,
                  background: v.papel,
                  borderRadius: 999,
                  padding: "5px 14px 5px 5px",
                },
              },
              V10h(
                "span",
                {
                  className: "shrink-0 flex items-center justify-center",
                  style: { width: 28, height: 28, borderRadius: 999, background: [v.risco, v.atencao, v.curso][i] },
                },
                i === 0
                  ? V10h(Jl, { tipo: "alerta", cor: "#FFFFFF", size: 14 })
                  : i === 1
                    ? V10h(V10Relogio, { size: 15, color: "#FFFFFF", strokeWidth: 2 })
                    : V10h(V10Banco, { size: 15, color: "#FFFFFF", strokeWidth: 2 }),
              ),
              r,
            ),
          ),
        ),
        V10h(
          "form",
          {
            onSubmit: (ev) => (ev.preventDefault(), enviar()),
            className: "flex items-end gap-2",
            style: { marginTop: 12, border: `1px solid ${v.linha}`, borderRadius: 16, padding: "10px 8px 8px 14px" },
          },
          V10h(
            "div",
            { className: "flex-1 min-w-0", style: { minHeight: 44, fontFamily: L.ui, fontSize: 16, lineHeight: 1.4 } },
            digitando
              ? V10h("span", { style: { color: v.ink } }, texto, V10h("span", { className: "v10-cursor" }))
              : V10h("textarea", {
                  id: "v10-pergunta",
                  rows: 2,
                  value: texto,
                  onChange: (ev) => setTexto(ev.target.value),
                  onKeyDown: (ev) => ev.key === "Enter" && !ev.shiftKey && (ev.preventDefault(), enviar()),
                  placeholder: "Escreva ou toque numa sugest\xE3o…",
                  "aria-label": "Pergunta para a IA",
                  className: "w-full bg-transparent outline-none",
                  style: { resize: "none", fontFamily: L.ui, fontSize: 16, color: v.ink, lineHeight: 1.4, border: 0 },
                }),
          ),
          V10h(
            "button",
            {
              type: "submit",
              "aria-label": "Enviar pergunta",
              disabled: !pronto,
              className: "shrink-0 flex items-center justify-center",
              style: {
                width: 40,
                height: 40,
                borderRadius: 999,
                background: pronto ? v.ink : v.linha,
                transform: pronto ? "scale(1.06)" : "none",
                transition: "background .25s, transform .25s",
              },
            },
            V10h(V10Seta, { size: 18, color: pronto ? "#FFFFFF" : "#8C877C", strokeWidth: 2.2 }),
          ),
        ),
      ),
    );
  }

  /* ---------- Gráfico empilhado por mês, com faixas entre as colunas ---------- */
  function V10EmpilhadoMes({ titulo: t, sub: e, partes: n, grupos: o, unidade: i }) {
    let [sel, setSel] = (0, Ct.useState)(o.length - 1),
      W = 320,
      H = 200,
      base = 168,
      topo = 22,
      k = o.length,
      gap = k > 8 ? 8 : 14,
      bw = Math.max(10, (W - 8 - gap * (k - 1)) / k),
      x = (j) => 4 + j * (bw + gap),
      max = Math.max(...o.map((g) => g.total), 1),
      esc = (base - topo) / max,
      geo = o.map((g) => {
        let y = base;
        return n.map((_, p) => {
          let h = (g.valores[p] || 0) * esc,
            r = { y0: y - h, y1: y };
          return (y -= h), r;
        });
      }),
      faixas = [];
    for (let j = 0; j < k - 1; j++)
      n.forEach((parte, p) => {
        let a = geo[j][p],
          b = geo[j + 1][p];
        a.y1 - a.y0 < 0.5 && b.y1 - b.y0 < 0.5 ||
          faixas.push(
            V10h("polygon", {
              key: `${j}-${p}`,
              className: "v10-faixa",
              fill: c2(parte, p),
              fillOpacity: 0.2,
              points: `${x(j) + bw},${a.y0} ${x(j + 1)},${b.y0} ${x(j + 1)},${b.y1} ${x(j) + bw},${a.y1}`,
            }),
          );
      });
    return V10h(
      X1,
      {
        titulo: t,
        sub: e,
        legenda: n.map((l, c) => [l, c2(l, c)]),
        ampliar: {
          tipo: "tempo",
          estilo: "empilhado",
          titulo: t,
          rotulos: o.map((g) => g.rotulo),
          series: n.map((p, c) => ({ rotulo: p, cor: c2(p, c), valores: o.map((g) => g.valores[c]) })),
          unidade: i,
        },
      },
      V10h(
        "svg",
        { viewBox: `0 0 ${W} ${H}`, width: "100%", role: "img", "aria-label": `${t}. Toque numa coluna para ver os valores.`, style: { display: "block", overflow: "visible" } },
        V10h("line", { x1: 0, x2: W, y1: base + 0.5, y2: base + 0.5, stroke: Pe.base }),
        faixas,
        o.map((g, j) =>
          V10h(
            "g",
            { key: g.rotulo, onClick: () => setSel(j), style: { cursor: "pointer" } },
            V10h("rect", { x: x(j) - gap / 2, y: 0, width: bw + gap, height: base, fill: "transparent" }),
            V10h(
              "g",
              { className: "v10-cresce", style: { animationDelay: `${j * 70}ms`, opacity: sel === j ? 1 : 0.62, transition: "opacity .25s" } },
              n.map((parte, p) => {
                let s = geo[j][p],
                  h = Math.max(0, s.y1 - s.y0 - 2);
                return h > 0
                  ? V10h("rect", { key: parte, x: x(j), y: s.y0 + 1, width: bw, height: h, rx: Math.min(5, h / 2, bw / 2), fill: c2(parte, p) })
                  : null;
              }),
            ),
            V10h(
              "text",
              { x: x(j) + bw / 2, y: base + 18, textAnchor: "middle", fontSize: 12, fill: sel === j ? v.ink : Pe.eixo, fontWeight: sel === j ? 600 : 400, fontFamily: L.ui },
              g.rotulo,
            ),
          ),
        ),
        sel !== null &&
          o[sel] &&
          V10h(
            "text",
            {
              x: Math.min(W - 4, Math.max(4, x(sel) + bw / 2)),
              y: Math.max(12, geo[sel][n.length - 1].y0 - 8),
              textAnchor: sel === 0 ? "start" : sel === k - 1 ? "end" : "middle",
              fontSize: 13,
              fontWeight: 600,
              fill: v.ink,
              fontFamily: L.ui,
            },
            nu(o[sel].total, i),
          ),
      ),
      o[sel] &&
        V10h(
          f2,
          null,
          V10h("strong", null, o[sel].rotulo),
          ": ",
          n.map((l, c) => `${l} ${eu(o[sel].valores[c], i)}`).join(" \xB7 "),
        ),
    );
  }

  /* ---------- Contas bancárias do contrato de gestão ---------- */
  var V10BANCOS = [
      ["Banco do Brasil", "001"],
      ["Caixa Econ\xF4mica", "104"],
      ["Ita\xFA", "341"],
      ["Bradesco", "237"],
      ["Santander", "033"],
    ],
    V10FINS = ["Repasse do contrato de gest\xE3o", "Folha de pagamento", "Custeio e fornecedores", "Provis\xE3o trabalhista"];
  function V10hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) (h ^= s.charCodeAt(i)), (h = Math.imul(h, 16777619));
    return h >>> 0;
  }
  function V10contas(orgId, orgao, bloqueios) {
    let h = V10hash(orgId + "|" + orgao),
      n = 2 + (h % 3),
      contas = Array.from({ length: n }, (_, i) => {
        let hh = V10hash(orgao + i),
          [banco, cod] = V10BANCOS[(h + i * 3) % V10BANCOS.length];
        return {
          id: `${orgId}-${i}`,
          banco,
          cod,
          agencia: String(1000 + (hh % 8999)),
          final: String(hh % 10000).padStart(4, "0") + "-" + (hh % 9),
          fim: V10FINS[i % V10FINS.length],
          bloqueios: [],
        };
      });
    // Cada bloqueio cai numa conta; a conta de repasse concentra a maior parte, como na prática.
    return (
      bloqueios.forEach((b) => {
        let r = V10hash(b.id) % 10,
          j = r < 5 ? 0 : 1 + (r % (n - 1));
        contas[j].bloqueios.push(b);
      }),
      contas
    );
  }
  function V10Contas({ orgId: t, orgao: e, bloqueios: n, onOpenBloqueio: o }) {
    let contas = V10contas(t, e, n),
      [aberta, setAberta] = (0, Ct.useState)(null),
      totalAtivo = n.filter((b) => b.status === "Ativo").reduce((a, b) => a + b.valorNum, 0);
    return V10h(
      Ct.default.Fragment,
      null,
      V10h(ge, null, "Contas banc\xE1rias"),
      V10h(
        "p",
        { style: { fontFamily: L.ui, fontSize: 15, color: v.texto2, marginTop: -4, marginBottom: 12, lineHeight: 1.4 } },
        contas.length,
        " contas ligadas a este contrato",
        totalAtivo > 0 ? ` \xB7 ${bn(totalAtivo)} bloqueado hoje` : " \xB7 nenhum bloqueio ativo",
      ),
      V10h(
        "div",
        { style: Tt },
        contas.map((c, i) => {
          let ativo = c.bloqueios.filter((b) => b.status === "Ativo"),
            vAtivo = ativo.reduce((a, b) => a + b.valorNum, 0),
            vLev = c.bloqueios.reduce((a, b) => a + (b.devolvido || 0), 0),
            vPerd = c.bloqueios.reduce((a, b) => a + (b.perdido || 0), 0),
            abre = aberta === c.id;
          return V10h(
            "div",
            { key: c.id, style: { borderTop: i ? `1px solid ${v.linha}` : "none" } },
            V10h(
              "button",
              {
                onClick: () => setAberta(abre ? null : c.id),
                "aria-expanded": abre,
                className: "w-full text-left flex items-center gap-3",
                style: { padding: "14px 16px" },
              },
              V10h(
                "span",
                { className: "shrink-0 flex items-center justify-center", style: { width: 40, height: 40, borderRadius: 999, background: vAtivo ? v.riscoFundo : v.papel } },
                V10h(V10Banco, { size: 18, color: vAtivo ? v.risco : v.ink }),
              ),
              V10h(
                "span",
                { className: "flex-1 min-w-0" },
                V10h("span", { className: "block", style: { fontFamily: L.ui, fontSize: 16, fontWeight: 600, color: v.ink } }, c.banco),
                V10h(
                  "span",
                  { className: "block", style: { fontFamily: L.dados, fontSize: 12.5, color: v.texto2, marginTop: 2 } },
                  `Ag. ${c.agencia} \xB7 C/C ••••${c.final}`,
                ),
                V10h("span", { className: "block", style: { fontFamily: L.ui, fontSize: 14, color: v.texto2, marginTop: 2 } }, c.fim),
              ),
              V10h(
                "span",
                { className: "shrink-0 text-right" },
                V10h(
                  "span",
                  { className: "block", style: { fontFamily: L.ui, fontSize: 15, fontWeight: 600, color: vAtivo ? v.risco : v.resolvido, fontVariantNumeric: "tabular-nums" } },
                  vAtivo ? bn(vAtivo) : "Livre",
                ),
                V10h(
                  "span",
                  { className: "block", style: { fontFamily: L.ui, fontSize: 13, color: v.texto2 } },
                  vAtivo ? (ativo.length === 1 ? "1 bloqueio" : `${ativo.length} bloqueios`) : "sem bloqueio",
                ),
              ),
            ),
            abre &&
              V10h(
                "div",
                { className: "v10-surge", style: { padding: "0 16px 14px 68px" } },
                vLev > 0 &&
                  V10h(
                    "p",
                    { style: { fontFamily: L.ui, fontSize: 14, color: v.resolvido, marginBottom: 4 } },
                    `${bn(vLev)} devolvido nesta conta`,
                  ),
                vPerd > 0 &&
                  V10h(
                    "p",
                    { style: { fontFamily: L.ui, fontSize: 14, color: v.risco, marginBottom: 8 } },
                    `${bn(vPerd)} perdido, transferido ao credor`,
                  ),
                c.bloqueios.length === 0
                  ? V10h("p", { style: { fontFamily: L.ui, fontSize: 14, color: v.texto2 } }, "Nenhum bloqueio registrado nesta conta.")
                  : c.bloqueios.map((b) =>
                      V10h(
                        "button",
                        {
                          key: b.id,
                          onClick: () => o && o(b),
                          className: "w-full text-left flex items-center justify-between gap-2",
                          style: { padding: "8px 0", borderTop: `1px solid ${v.linha}` },
                        },
                        V10h(
                          "span",
                          { style: { fontFamily: L.ui, fontSize: 14, color: v.ink } },
                          Co(b.data),
                          " \xB7 ",
                          V10h(
                            "span",
                            { style: { color: b.status === "Ativo" ? v.atencao : b.perdido > 0 ? v.risco : v.resolvido } },
                            b.status === "Ativo" ? "bloqueado" : b.perdido > 0 ? (b.devolvido > 0 ? "devolvido em parte" : "perdido") : "devolvido",
                          ),
                        ),
                        V10h(
                          "span",
                          { className: "flex items-center gap-1", style: { fontFamily: L.ui, fontSize: 14, fontWeight: 600, color: v.ink, fontVariantNumeric: "tabular-nums" } },
                          b.valor,
                          V10h(io, { size: 14, color: v.texto2 }),
                        ),
                      ),
                    ),
              ),
          );
        }),
      ),
      V10h(
        "p",
        { style: { fontFamily: L.ui, fontSize: 13, color: v.texto2, marginTop: 8 } },
        "Contas de exemplo. No app real, v\xEAm do cadastro do contrato.",
      ),
    );
  }
