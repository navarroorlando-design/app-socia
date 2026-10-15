  /* ===================================================================
     VERSÃO 11 — animações dos vídeos 3 e 4 e melhor uso do espaço
     - Atalho vira a tela (container transform) e volta para o atalho
     - Odômetro: números rolam quando o valor muda
     - Cartões encontram o lugar (FLIP) ao filtrar
     - Linha do gráfico se desenha; valor acompanha o dedo
     - Desempenho por período (3 meses, 6 meses, 2026) recontando
     - Abas entre clientes
     - Lista de processos visível sem precisar buscar
     =================================================================== */
  var V11h = Ct.default.createElement,
    V11Css = `
    .v11-odo{ display:inline-flex; white-space:nowrap; font-variant-numeric: tabular-nums; }
    .v11-odo-col{ display:inline-block; height:1.12em; line-height:1.12em; overflow:hidden; vertical-align:top; }
    .v11-odo-fita{ display:flex; flex-direction:column; transition: transform .75s cubic-bezier(.2,.8,.2,1); }
    .v11-odo-fita > span{ display:block; height:1.12em; line-height:1.12em; text-align:center; }
    .v11-oculto{ position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
    .v11-traco{ stroke-dasharray:1; stroke-dashoffset:1; animation: v11traco 1.1s .15s cubic-bezier(.4,0,.2,1) forwards; }
    @keyframes v11traco{ to{ stroke-dashoffset:0; } }
    .v11-area{ animation: v10fade .6s .9s both; }
    .v11-abas{ scrollbar-width:none; }
    .v11-abas::-webkit-scrollbar{ display:none; }
    @media (prefers-reduced-motion: reduce){
      .v11-odo-fita{ transition:none !important; }
      .v11-traco{ animation:none !important; stroke-dashoffset:0 !important; }
      .v11-area{ animation:none !important; }
    }
  `;

  /* ---------- Odômetro ---------- */
  function V11Odo({ texto: t }) {
    let [pronto, setPronto] = (0, Ct.useState)(ns());
    (0, Ct.useEffect)(() => {
      if (pronto) return;
      let id = requestAnimationFrame(() => requestAnimationFrame(() => setPronto(!0)));
      return () => cancelAnimationFrame(id);
    }, []);
    let chars = String(t).split(""),
      n = chars.length;
    return V11h(
      "span",
      { className: "v11-odo" },
      V11h("span", { className: "v11-oculto" }, t),
      chars.map((c, i) => {
        let k = n - i;
        return /\d/.test(c)
          ? V11h(
              "span",
              { key: "d" + k, className: "v11-odo-col", "aria-hidden": "true" },
              V11h(
                "span",
                {
                  className: "v11-odo-fita",
                  style: {
                    transform: `translateY(${pronto ? -Number(c) * 10 : 0}%)`,
                    transitionDelay: `${Math.min(k, 8) * 35}ms`,
                  },
                },
                "0123456789".split("").map((d) => V11h("span", { key: d }, d)),
              ),
            )
          : V11h("span", { key: "s" + k, className: "v11-odo-col", "aria-hidden": "true" }, c === " " ? "\u00A0" : c);
      }),
    );
  }

  /* ---------- Atalho vira a tela (container transform) ---------- */
  var V11morf = { set: null, ultima: null, cor: null, texto: null };
  function V11ret(el) {
    let palco = document.querySelector("[data-v11-palco]");
    if (!palco || !el) return null;
    let p = palco.getBoundingClientRect(),
      r = el.getBoundingClientRect(),
      z = palco.offsetWidth ? p.width / palco.offsetWidth : 1;
    return {
      left: (r.left - p.left) / z,
      top: (r.top - p.top) / z,
      width: r.width / z,
      height: r.height / z,
      pw: palco.offsetWidth,
      ph: palco.offsetHeight,
    };
  }
  function V11morfar(el, cor, texto, chave, rotulo) {
    V11morf.ultima = chave;
    V11morf.cor = cor;
    V11morf.texto = texto;
    if (!V11morf.set || ns()) return;
    let de = V11ret(el);
    de && V11morf.set({ id: Date.now(), modo: "abre", de, cor, texto, rotulo });
  }
  // Volta da tela para o atalho de onde ela saiu, se foi um atalho que a abriu.
  function V11voltar(chave, navegar) {
    let veioDoAtalho = V11morf.ultima === chave;
    V11morf.ultima = null;
    navegar();
    if (!veioDoAtalho || !V11morf.set || ns()) return;
    let tent = 0,
      procura = () => {
        let el = document.querySelector(`[data-v11-morf="${chave}"]`),
          de = el && V11ret(el);
        if (!de || !de.width) return void (tent++ < 6 && requestAnimationFrame(procura));
        // A Início volta ao topo; leva o atalho para a vista antes de encolher a tela até ele.
        if (de.top < 60 || de.top + de.height > de.ph - 90) {
          el.scrollIntoView({ block: "center" });
          de = V11ret(el);
        }
        de && V11morf.set({ id: Date.now(), modo: "fecha", de, cor: V11morf.cor, texto: V11morf.texto });
      };
    requestAnimationFrame(procura);
  }
  function V11Palco() {
    let [m, setM] = (0, Ct.useState)(null),
      ref = (0, Ct.useRef)(null);
    (0, Ct.useEffect)(() => ((V11morf.set = setM), () => (V11morf.set = null)), []);
    (0, Ct.useLayoutEffect)(() => {
      let el = ref.current;
      if (!m || !el) return;
      let px = (o) => ({ left: o.left + "px", top: o.top + "px", width: o.width + "px", height: o.height + "px" }),
        cheio = { left: 0, top: 0, width: m.de.pw, height: m.de.ph },
        abre = m.modo === "abre",
        quadros = abre
          ? [
              { ...px(m.de), borderRadius: "24px", opacity: 1 },
              { ...px(cheio), borderRadius: "0px", opacity: 1 },
            ]
          : [
              { ...px(cheio), borderRadius: "0px", opacity: 0 },
              { ...px(cheio), borderRadius: "0px", opacity: 1, offset: 0.18 },
              { ...px(m.de), borderRadius: "24px", opacity: 1 },
            ],
        a = el.animate(quadros, { duration: abre ? 420 : 460, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" }),
        rot = el.firstChild;
      rot && rot.animate([{ opacity: abre ? 1 : 0 }, { opacity: abre ? 0 : 1 }], { duration: abre ? 200 : 460, fill: "forwards" });
      let f = null;
      a.onfinish = () => {
        f = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: abre ? 240 : 180, fill: "forwards" });
        f.onfinish = () => setM(null);
      };
      return () => {
        a.cancel(), f && f.cancel();
      };
    }, [m && m.id]);
    return m
      ? V11h(
          "div",
          {
            ref,
            "aria-hidden": "true",
            style: {
              position: "absolute",
              zIndex: 85,
              pointerEvents: "none",
              overflow: "hidden",
              background: m.cor,
              left: m.de.left,
              top: m.de.top,
              width: m.de.width,
              height: m.de.height,
              borderRadius: 24,
              boxShadow: "0 18px 40px rgba(31,30,26,.18)",
            },
          },
          V11h(
            "span",
            {
              style: {
                position: "absolute",
                left: 12,
                bottom: 14,
                fontFamily: L.ui,
                fontSize: 17,
                fontWeight: 600,
                color: m.texto,
                whiteSpace: "nowrap",
              },
            },
            m.rotulo || "",
          ),
        )
      : null;
  }

  /* ---------- Cartões encontram o lugar (FLIP) ---------- */
  // Marque os filhos com data-flip="chave". Ao mudar `chave`, quem ficou desliza até a nova
  // posição e quem chegou surge; quem saiu some sem segurar o layout.
  function V11useFlip(ref, chave) {
    let antes = (0, Ct.useRef)(new Map());
    (0, Ct.useLayoutEffect)(() => {
      let raiz = ref.current;
      if (!raiz) return;
      let itens = raiz.querySelectorAll("[data-flip]"),
        novo = new Map();
      itens.forEach((el) => novo.set(el.getAttribute("data-flip"), el.getBoundingClientRect()));
      if (!ns() && antes.current.size) {
        let i = 0;
        itens.forEach((el) => {
          let k = el.getAttribute("data-flip"),
            a = antes.current.get(k),
            b = novo.get(k);
          if (a) {
            let dx = a.left - b.left,
              dy = a.top - b.top;
            (dx || dy) &&
              el.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: "none" }], {
                duration: 420,
                easing: "cubic-bezier(.2,.8,.2,1)",
              });
          } else
            el.animate(
              [
                { opacity: 0, transform: "scale(.96) translateY(6px)" },
                { opacity: 1, transform: "none" },
              ],
              { duration: 360, delay: 60 + Math.min(i++, 8) * 40, easing: "cubic-bezier(.2,.8,.2,1)", fill: "backwards" },
            );
        });
      }
      antes.current = novo;
    }, [chave]);
  }

  /* ---------- Processos: lista visível desde a entrada ---------- */
  var V11RECORTES = [
    ["todos", "Todos"],
    ["Trabalhista", "Trabalhista"],
    ["C\xEDvel", "C\xEDvel"],
    ["Administrativo", "Administrativo"],
    ["Constitucional", "STF"],
    ["parados", "Parados 90+"],
    ["bloqueio", "Com bloqueio"],
  ];
  function V11ListaProcessos({ onOpen: t, inicial: e }) {
    let [r, setR] = (0, Ct.useState)(V11RECORTES.some((x) => x[0] === e) ? e : "todos"),
      ref = (0, Ct.useRef)(null),
      comBloq = (p) => Tn.some((b) => b.processoId === p.id && b.status === "Ativo"),
      filtra = (k) =>
        Se.filter((p) =>
          k === "todos" ? !0 : k === "parados" ? p.diasParado >= 90 : k === "bloqueio" ? comBloq(p) : p.area === k,
        ),
      lista = filtra(r).sort((a, b) => b.ultimaMov - a.ultimaMov);
    V11useFlip(ref, r);
    return V11h(
      "div",
      null,
      V11h(
        "div",
        {
          className: "v11-abas flex overflow-x-auto",
          role: "group",
          "aria-label": "Filtrar processos",
          style: { gap: 8, margin: "0 -20px", padding: "2px 20px 6px" },
        },
        V11RECORTES.map(([k, rot]) => {
          let on = r === k,
            q = filtra(k).length;
          return q || k === "todos"
            ? V11h(
                "button",
                {
                  key: k,
                  onClick: () => setR(k),
                  "aria-pressed": on,
                  className: "shrink-0 inline-flex items-center pressable",
                  style: {
                    gap: 7,
                    height: 40,
                    padding: "0 8px 0 14px",
                    borderRadius: 999,
                    fontFamily: L.ui,
                    fontSize: 15,
                    fontWeight: 600,
                    background: on ? v.ink : v.cartao,
                    color: on ? "#FFFFFF" : v.ink,
                    boxShadow: on ? "none" : Tt.boxShadow,
                    transition: "background .2s, color .2s",
                  },
                },
                rot,
                V11h(
                  "span",
                  {
                    style: {
                      minWidth: 24,
                      height: 24,
                      padding: "0 7px",
                      borderRadius: 999,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      background: on ? "rgba(255,255,255,.18)" : v.papel,
                      color: on ? "#FFFFFF" : v.texto2,
                    },
                  },
                  q,
                ),
              )
            : null;
        }),
      ),
      V11h(
        "p",
        { style: { fontFamily: L.ui, fontSize: 14, color: v.texto2, margin: "10px 2px 8px" } },
        lista.length === 1 ? "1 processo" : `${lista.length} processos`,
        ", movimenta\xE7\xE3o mais recente primeiro",
      ),
      V11h(
        "div",
        { ref, style: Tt },
        lista.map((p, i) => {
          let b = Tn.filter((x) => x.processoId === p.id && x.status === "Ativo").reduce((a, x) => a + x.valorNum, 0);
          return V11h(
            "div",
            { key: p.id, "data-flip": p.id, style: { background: v.cartao, borderRadius: i === 0 ? "24px 24px 0 0" : i === lista.length - 1 ? "0 0 24px 24px" : 0 } },
            V11h(Ai, {
              onClick: () => t(p, "processos"),
              last: i === lista.length - 1,
              sem: En(p.status),
              icone: V11h(Lo, { size: 18, color: En(p.status).cor }),
              titulo: p.cliente,
              detalhe: p.desc,
              direita: b
                ? V11h(
                    "span",
                    { style: { fontFamily: L.ui, fontSize: 14, fontWeight: 600, color: v.risco, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" } },
                    bn(b),
                  )
                : void 0,
              abaixo: V11h(
                "span",
                { className: "flex flex-wrap items-center", style: { gap: 8 } },
                V11h(_i, { text: p.status }),
                V11h(
                  "span",
                  { style: { fontFamily: L.ui, fontSize: 13, color: p.diasParado >= 90 ? v.atencao : v.texto2 } },
                  p.diasParado === 0 ? "movimentado hoje" : `${p.diasParado} dias parado`,
                ),
              ),
            }),
          );
        }),
      ),
    );
  }

  /* ---------- Abas entre clientes ---------- */
  function V11AbasClientes({ atual: t, onTrocar: e }) {
    let ref = (0, Ct.useRef)(null);
    (0, Ct.useEffect)(() => {
      let el = ref.current && ref.current.querySelector('[aria-selected="true"]');
      el && el.scrollIntoView({ behavior: ns() ? "auto" : "smooth", inline: "center", block: "nearest" });
    }, [t]);
    return V11h(
      "div",
      {
        ref,
        role: "tablist",
        "aria-label": "Trocar de cliente",
        className: "v11-abas flex overflow-x-auto",
        style: { gap: 8, margin: "0 -20px 14px", padding: "2px 20px 4px" },
      },
      ti.map((id) => {
        let on = id === t;
        return V11h(
          "button",
          {
            key: id,
            role: "tab",
            "aria-selected": on,
            onClick: () => !on && e(id),
            className: "shrink-0 inline-flex items-center pressable",
            style: {
              gap: 8,
              height: 44,
              padding: "0 16px 0 6px",
              borderRadius: 999,
              fontFamily: L.ui,
              fontSize: 15,
              fontWeight: 600,
              background: on ? v.ink : v.cartao,
              color: on ? "#FFFFFF" : v.ink,
              boxShadow: on ? "none" : Tt.boxShadow,
              transition: "background .25s, color .25s",
            },
          },
          V11h(Da, { id, iniciais: fe[id].initials, size: 32, claro: on }),
          fe[id].name,
        );
      }),
    );
  }

  /* ---------- Desempenho por período ---------- */
  var V11PERIODOS = [
    { id: "2026", label: "2026" },
    { id: "6m", label: "6 meses" },
    { id: "3m", label: "3 meses" },
  ];
  function V11serie(id) {
    let base = qw("2026");
    if (!base || id === "2026") return base;
    let n = id === "3m" ? 3 : 6,
      ini = Math.max(0, base.meses.length - n),
      meses = base.meses.slice(ini);
    return {
      ...base,
      periodo: { de: `${meses[0].mes}-01`, ate: base.periodo.ate },
      carteiraInicial: ini ? base.meses[ini - 1].carteira : base.carteiraInicial,
      meses,
    };
  }
  function V11levantados(t) {
    let qtd = t.meses.reduce((a, m) => a + m.levantadoQtd, 0),
      valor = t.meses.reduce((a, m) => a + m.levantadoValor, 0);
    return { qtd, valor, diasMedio: jw().diasMedio };
  }
