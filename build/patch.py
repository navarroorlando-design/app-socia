"""Aplica as mudanças da versão 10 sobre o bundle formatado do App dos Sócios.

Entrada: bundle.js (bundle publicado em 08/10, formatado com prettier)
Saída:   bundle.out.js
Cada etapa usa substituições exatas e confere quantas vezes o trecho aparece,
para falhar alto se o código de origem não for o esperado.
"""
import re, sys

SRC = "/home/claude/v10/bundle.js"
OUT = "/home/claude/v10/bundle.out.js"
s = open(SRC, encoding="utf-8").read()


def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count:
        sys.exit(f"[patch] esperava {count}x, achei {n}x:\n{old[:300]}")
    s = s.replace(old, new)


def sub(pattern, fn, expect_min=1, flags=0):
    global s
    s2, n = re.subn(pattern, fn, s, flags=flags)
    if n < expect_min:
        sys.exit(f"[patch] regex casou {n}x (mínimo {expect_min}): {pattern[:200]}")
    s = s2
    return n


# =====================================================================
# 1. TIPOGRAFIA — Inter Tight (interface e números) + Newsreader (títulos)
# =====================================================================
SERIF = "'Newsreader', Georgia, 'Times New Roman', serif"
SANS = "'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"

rep(
    """      display: "'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      titulo: "var(--fonte-titulo, 'Lexend'), Georgia, 'Times New Roman', serif",
      ui: "'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",""",
    f"""      display: "{SERIF}",
      titulo: "{SERIF}",
      ui: "{SANS}",""",
)
rep(
    ".font-serif-legal{ font-family:'Lexend', -apple-system, sans-serif; font-weight:600; letter-spacing:-0.015em; }",
    ".font-serif-legal{ font-family:'Newsreader', Georgia, serif; font-weight:500; letter-spacing:-0.02em; }",
)
rep(
    ".font-sans-ui{ font-family:'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }",
    ".font-sans-ui{ font-family:'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-feature-settings:'cv11','ss01'; }",
)


# Títulos (L.titulo / L.display) — Newsreader pede peso 500, não 600/700.
# Iniciais de avatar e o monograma "AR" (tamanho proporcional, "* 0.") ficam em 600.
def _titulos(m):
    obj = m.group(0)
    if "* 0." in obj:
        return obj
    return re.sub(r"fontWeight: (600|700)", "fontWeight: 500", obj)


sub(r"\{[^{}]*fontFamily: L\.(?:titulo|display),[^{}]*\}", _titulos, expect_min=10)


# Números grandes em Inter Tight: peso 500 e espaçamento mais fechado.
def _numeros(m):
    obj = m.group(0)
    obj = obj.replace("fontWeight: 600", "fontWeight: 500")
    if "letterSpacing" in obj:
        obj = re.sub(r'letterSpacing: "[^"]*"', 'letterSpacing: "-0.035em"', obj)
    else:
        obj = obj.replace("fontWeight: 500", 'fontWeight: 500, letterSpacing: "-0.03em"', 1)
    return obj


sub(r"\{[^{}]*fontFamily: L\.ui,[^{}]*fontSize: (?:2[4-9]|3\d|40),[^{}]*\}", _numeros, expect_min=10)

# Subtítulos ### dos relatórios da IA viram títulos editoriais em Newsreader.
rep(
    """                style: {
                  fontFamily: L.ui,
                  fontSize: 19,
                  fontWeight: 600,
                  color: v.ink,
                  margin: "22px 0 6px",
                  letterSpacing: "-0.01em",
                },""",
    """                style: {
                  fontFamily: L.titulo,
                  fontSize: 23,
                  fontWeight: 500,
                  color: v.ink,
                  margin: "26px 0 6px",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                },""",
)

# Amostras "A" do tamanho do texto mostram a fonte de leitura (Inter Tight).
sub(r"fontFamily: L\.display(,(?: letterSpacing: \"-0\.02em\",)? fontSize: 20 \+ [a-zA-Z]+ \* 6)", r"fontFamily: L.ui\1", expect_min=1)
sub(r"(fontFamily: L\.display,\s*letterSpacing: \"-0\.02em\",\s*fontSize: 20 \+ \w+ \* 6)", lambda m: m.group(0).replace("L.display", "L.ui"), expect_min=0)

# Guia de estilo: textos que descrevem a tipografia.
rep(
    'nota: "Uma fam\\xEDlia s\\xF3, a Lexend, desenhada para facilitar a leitura. A hierarquia vem do tamanho e do peso. N\\xFAmeros de processo usam a fonte de dados.",',
    'nota: "Newsreader nos t\\xEDtulos, com serifa e tom de documento jur\\xEDdico. Inter Tight na interface, nos valores e no texto de leitura. N\\xFAmeros de processo usam a IBM Plex Mono.",',
)
rep('"T\\xEDtulo de tela \\xB7 Lexend 34 seminegrito"', '"T\\xEDtulo de tela \\xB7 Newsreader 34"')
rep('"Valor em destaque \\xB7 Lexend 40 seminegrito"', '"Valor em destaque \\xB7 Inter Tight 40 m\\xE9dio"')
rep('"Subt\\xEDtulo de se\\xE7\\xE3o \\xB7 Lexend 18 seminegrito"', '"Subt\\xEDtulo de se\\xE7\\xE3o \\xB7 Inter Tight 18 seminegrito"')
rep('"Texto de leitura \\xB7 Lexend 17"', '"Texto de leitura \\xB7 Inter Tight 17"')
rep('"R\\xF3tulo \\xB7 Lexend 15 seminegrito"', '"R\\xF3tulo \\xB7 Inter Tight 15 seminegrito"')
rep('"Apoio \\xB7 Lexend 15"', '"Apoio \\xB7 Inter Tight 15"')
# O valor de destaque do guia passa a usar a fonte de números.
rep(
    """                      fontFamily: L.display,
                      letterSpacing: "-0.02em",
                      fontSize: 40,
                      fontWeight: 500,""",
    """                      fontFamily: L.ui,
                      letterSpacing: "-0.035em",
                      fontSize: 40,
                      fontWeight: 500,""",
)



# =====================================================================
# 2. CÓDIGO NOVO (v10.js) e CSS
# =====================================================================
V10 = open("/home/claude/v10/v10.js", encoding="utf-8").read()
rep("  function lF() {", V10 + "\n  function lF() {")
rep(
    "    @media (prefers-reduced-motion: reduce){ .grafico-desenho{ animation:none !important; } }\n  `,",
    "    @media (prefers-reduced-motion: reduce){ .grafico-desenho{ animation:none !important; } }\n${V10Css}\n  `,",
)

# =====================================================================
# 3. IA — etapas reais com brilho, entrada escalonada, cartões de ação
# =====================================================================
rep(
    """            zt.default.createElement("span", {
              className: "w-2 h-2 rounded-full animate-pulse",
              style: { background: v.ia },
            }),
            "Analisando\\u2026",""",
    """            zt.default.createElement(
              "span",
              { className: "v10-pulsa inline-flex" },
              zt.default.createElement(No, { size: 16, color: v.ia, strokeWidth: 2 }),
            ),
            zt.default.createElement(
              "span",
              { className: "v10-brilho", style: { fontWeight: 500 } },
              t.progress.length ? "Consultando a base\\u2026" : "Analisando a pergunta\\u2026",
            ),""",
)
rep(
    """                {
                  key: c,
                  className: "flex items-center gap-2",
                  style: { fontFamily: L.ui, fontSize: 15, color: v.texto2 },
                },
                zt.default.createElement(j1, { size: 14, color: v.oliva }),
                " ",
                l,""",
    """                {
                  key: c,
                  className: "v10-surge flex items-center gap-2",
                  style: { fontFamily: L.ui, fontSize: 15, color: r && c === t.progress.length - 1 ? v.ink : v.texto2 },
                },
                r && c === t.progress.length - 1
                  ? zt.default.createElement("span", {
                      className: "guia-spin",
                      "aria-hidden": "true",
                      style: { width: 13, height: 13, borderWidth: 2, borderColor: v.oliva, borderTopColor: "transparent" },
                    })
                  : zt.default.createElement(j1, { size: 14, color: v.resolvido }),
                " ",
                l,""",
)
rep(
    "      t.text && zt.default.createElement(m2, { texto: t.text }),",
    """      t.text &&
        t.progress.length > 0 &&
        zt.default.createElement(
          "p",
          { className: "flex items-center gap-1.5", style: { fontFamily: L.ui, fontSize: 14, color: v.texto2, marginTop: 6 } },
          zt.default.createElement(j1, { size: 14, color: v.resolvido }),
          t.progress.length === 1 ? "1 consulta \\xE0 base" : `${t.progress.length} consultas \\xE0 base`,
        ),
      t.text && zt.default.createElement(m2, { texto: t.text, cascata: t.status === "pronta" }),""",
)
rep(
    """  function m2({ texto: t }) {
    return Mn.default.createElement(
      "div",
      null,
      Jv(t).map((e, n) =>
        e.tipo === "md"
          ? Mn.default.createElement(jk, { key: n, linhas: e.linhas })
          : e.tipo === "cerca:grafico"
            ? Mn.default.createElement(Pk, { key: n, corpo: e.corpo })
            : e.tipo === "pendente:grafico"
              ? Mn.default.createElement(fw, { key: n }, "Preparando gr\\xE1fico\\u2026")
              : null,
      ),
    );
  }""",
    """  function m2({ texto: t, cascata: c }) {
    return Mn.default.createElement(
      "div",
      null,
      Jv(t).map((e, n) => {
        let x =
          e.tipo === "md"
            ? Mn.default.createElement(jk, { linhas: e.linhas })
            : e.tipo === "cerca:grafico"
              ? Mn.default.createElement(Pk, { corpo: e.corpo })
              : e.tipo === "cerca:acoes"
                ? Mn.default.createElement(V10Cartoes, { corpo: e.corpo, cascata: c })
                : e.tipo === "pendente:grafico" || e.tipo === "pendente:acoes"
                  ? Mn.default.createElement(
                      fw,
                      null,
                      e.tipo === "pendente:acoes" ? "Preparando os cart\\xF5es\\u2026" : "Preparando gr\\xE1fico\\u2026",
                    )
                  : null;
        return x && Mn.default.createElement("div", { key: n, className: "v10-surge", style: V10atraso(n, c) || void 0 }, x);
      }),
    );
  }""",
)

# Instruções da IA para o novo bloco de cartões.
rep(
    """SUGEST\\xD5ES no fim, assim:""",
    """CART\\xD5ES DE PROCESSOS: quando a resposta apontar processos espec\\xEDficos que a s\\xF3cia pode querer acompanhar (bloqueios ativos, processos parados, os de maior valor), coloque antes das sugest\\xF5es um bloco assim, com at\\xE9 6 n\\xFAmeros CNJ que vieram de listar_processos:
\\`\\`\\`acoes
{"titulo": "Processos para acompanhar", "processos": ["0000000-00.2026.5.01.0000"]}
\\`\\`\\`
O app mostra cada processo num cart\\xE3o com os dados da base e deixa a s\\xF3cia seguir o processo ou criar um aviso. N\\xE3o repita os mesmos processos numa tabela.

SUGEST\\xD5ES no fim, assim:""",
)

# Exemplos fixados: cartões em "parados" e gráfico empilhado por mês no Gnosis.
rep(
    """      "### Os mais antigos",
      Xs("grafico", {
        tipo: "tabela",
        titulo: "Parados h\\xE1 mais tempo",
        processos: { dias_minimos_parado: 60, limite: 6 },
      }),""",
    """      "### Os mais antigos",
      "Os seis parados h\\xE1 mais tempo. Toque num cart\\xE3o para seguir o processo ou criar um aviso.",
      Xs("acoes", {
        titulo: "Parados h\\xE1 mais tempo",
        processos: i2({ dias_minimos_parado: 60, limite: 6 }).map((p) => p.numero),
      }),""",
)
rep(
    """      Xs("grafico", {
        tipo: "linha",
        titulo: "Novos bloqueios por m\\xEAs",
        consulta: { metrica: "valor_bloqueado", cliente: t, status_bloqueio: "todos", agrupar_por: "mes" },
      }),""",
    """      Xs("grafico", {
        tipo: "empilhado",
        titulo: "Novos bloqueios por m\\xEAs, por \\xE1rea",
        consulta: {
          metrica: "valor_bloqueado",
          cliente: t,
          status_bloqueio: "todos",
          agrupar_por: "mes",
          dividir_por: "area",
        },
      }),""",
)
# Relatórios de exemplo já salvos no aparelho recebem a versão nova.
rep(
    """        let tt = Fa("fixados", null);
        return Array.isArray(tt) ? tt : nw;""",
    """        let tt = Fa("fixados", null);
        return Array.isArray(tt)
          ? tt.map((x) => (x && x.pinnedExample ? { ...x, text: (nw.find((y) => y.id === x.id) || x).text } : x))
          : nw;""",
)

# Gráfico empilhado por mês usa colunas com faixas.
rep(
    """    if (e === "empilhado") {
      let s = o2(t.consulta);
      return Mn.default.createElement(rw, {""",
    """    if (e === "empilhado" && t.consulta && t.consulta.agrupar_por === "mes") {
      let s = o2(t.consulta);
      return Mn.default.createElement(V10EmpilhadoMes, {
        titulo: t.titulo,
        sub: t.subtitulo,
        partes: s.partes,
        grupos: s.grupos.slice(-12),
        unidade: s.unidade,
      });
    }
    if (e === "empilhado") {
      let s = o2(t.consulta);
      return Mn.default.createElement(rw, {""",
)

# Linhas de tabela de processos na resposta da IA abrem a folha de ação.
rep(
    """  function uw({ titulo: t, linhas: e }) {
    return Wt.default.createElement(
      X1,
      { titulo: t },""",
    """  function uw({ titulo: t, linhas: e }) {
    let V10b = V10Bus.atual;
    return Wt.default.createElement(
      X1,
      { titulo: t, sub: V10b ? "Toque num processo para seguir ou criar um aviso." : void 0 },""",
)
rep(
    """          Wt.default.createElement(
            "div",
            { key: n.numero, style: { padding: "12px 18px", borderTop: `1px solid ${v.linha}` } },""",
    """          Wt.default.createElement(
            V10b ? "button" : "div",
            {
              key: n.numero,
              onClick: V10b ? () => V10b.abrirAcao(V10num(n.numero)?.id) : void 0,
              className: V10b ? "block w-full text-left pressable" : void 0,
              style: { padding: "12px 18px", borderTop: `1px solid ${v.linha}` },
            },""",
)

# =====================================================================
# 4. INÍCIO — caixa da IA
# =====================================================================
rep(
    'y2 = { resumo: "Bloqueado hoje", atalhos: "Atalhos", detalhes: "Mais detalhes", hoje: "Hoje no escrit\\xF3rio" },',
    'y2 = {\n      resumo: "Bloqueado hoje",\n      ia: "Pergunte \\xE0 IA",\n      atalhos: "Atalhos",\n      detalhes: "Mais detalhes",\n      hoje: "Hoje no escrit\\xF3rio",\n    },',
)
rep(
    """    apelido: S,
    ordem: N = Jf,
  }) {""",
    """    apelido: S,
    ordem: N = Jf,
    onPerguntarIA: V10perg,
  }) {""",
)
rep(
    """      G = {
        resumo: ht.default.createElement(""",
    """      G = {
        ia: V10perg
          ? ht.default.createElement(V10CaixaIA, { onPerguntar: (q) => V10Bus.atual && V10Bus.atual.perguntar(q) })
          : null,
        resumo: ht.default.createElement(""",
)
# Ordem salva sem o bloco novo: insere "ia" logo depois do resumo, sem apagar a personalização.
rep(
    """        let tt = Fa("inicio", Jf),
          Ft = Array.isArray(tt) ? tt.filter((Ut) => y2[Ut.id]) : [];
        return Jf.every((Ut) => Ft.some((Qe) => Qe.id === Ut.id)) ? Ft : Jf;""",
    """        let tt = Fa("inicio", Jf),
          Ft = Array.isArray(tt) ? tt.filter((Ut) => y2[Ut.id]) : [];
        if (!Ft.length) return Jf;
        Jf.forEach((Ut, Qe) => {
          if (!Ft.some((Le) => Le.id === Ut.id)) {
            let Oo = Qe ? Ft.findIndex((Le) => Le.id === Jf[Qe - 1].id) + 1 : 0;
            Ft.splice(Oo, 0, { ...Ut });
          }
        });
        return Ft;""",
)

# =====================================================================
# 5. APP — estado da folha de ação, destaque na volta, ligação com a Início
# =====================================================================
rep(
    """      [X, ct] = (0, Ct.useState)("processos"),""",
    """      [X, ct] = (0, Ct.useState)("processos"),
      [V10acao, V10setAcao] = (0, Ct.useState)(null),
      [V10dest, V10setDest] = (0, Ct.useState)(null),""",
)
# O barramento é atualizado a cada render do App, antes dos filhos lerem.
rep(
    """      ol = i === "feed" || l === "list" || (n === "ia" && at === "ask") || (n === "perfil" && I === "main");
    return Ct.default.createElement(""",
    """      ol = i === "feed" || l === "list" || (n === "ia" && at === "ask") || (n === "perfil" && I === "main");
    V10Bus.atual = {
      seguidos: Z,
      alternarSeguir: mt,
      alertas: ye,
      criarAlerta: Ei.criarAlerta,
      abrirAcao: (tt) => tt && V10setAcao(tt),
      abrirProcesso: (tt) => Gn(tt, "acompanhando"),
      irAcompanhando: (tt) => {
        o("inicio"), a("acompanhando"), V10setDest(tt), setTimeout(() => V10setDest(null), 2600);
      },
      irAlertas: () => Lc("alertas"),
      // A Início fica guardada pela transição de telas; a pergunta passa pelo barramento para usar o estado atual.
      perguntar: (tt) => Dr(tt, { nova: !0 }),
    };
    return Ct.default.createElement(""",
)
rep(
    "                Ct.default.createElement(HS, null),",
    """                Ct.default.createElement(HS, null),
                V10acao &&
                  Ct.default.createElement(V10Folha, {
                    key: V10acao,
                    processoId: V10acao,
                    onFechar: () => V10setAcao(null),
                  }),""",
)
rep(
    """                                  ordem: Bn,
                                  foto: Ht,
                                  apelido: re,
                                }),""",
    """                                  ordem: Bn,
                                  foto: Ht,
                                  apelido: re,
                                  onPerguntarIA: !0,
                                }),""",
)
rep(
    """                                Ct.default.createElement(bw, {
                                  items: ps,""",
    """                                Ct.default.createElement(bw, {
                                  destaque: V10dest,
                                  items: ps,""",
)
rep(
    """  function bw({ items: t, onOpen: e, onBack: n }) {""",
    """  function bw({ items: t, onOpen: e, onBack: n, destaque: V10d }) {""",
)
rep(
    """              t.map((o, i) =>
                ht.default.createElement(Ai, {
                  key: o.id,
                  onClick: () => e(o),
                  last: i === t.length - 1,
                  sem: En(o.status),
                  icone: ht.default.createElement(Lo, { size: 18, color: En(o.status).cor }),
                  titulo: o.cliente,
                  detalhe: o.desc,
                  abaixo: ht.default.createElement(_i, { text: o.status }),
                }),
              ),""",
    """              t.map((o, i) =>
                ht.default.createElement(
                  "div",
                  {
                    key: o.id,
                    className: V10d === o.id ? "v10-destaque" : void 0,
                    style: { borderRadius: i === 0 ? "24px 24px 0 0" : i === t.length - 1 ? "0 0 24px 24px" : 0 },
                  },
                  ht.default.createElement(Ai, {
                    onClick: () => e(o),
                    last: i === t.length - 1,
                    sem: En(o.status),
                    icone: ht.default.createElement(Lo, { size: 18, color: En(o.status).cor }),
                    titulo: o.cliente,
                    detalhe: o.desc,
                    abaixo: ht.default.createElement(_i, { text: o.status }),
                  }),
                ),
              ),""",
)

# =====================================================================
# 6. CONTRATO DE GESTÃO — contas bancárias
# =====================================================================
rep(
    """      yt.default.createElement(ge, null, "Processos deste contrato"),""",
    """      yt.default.createElement(V10Contas, { orgId: t, orgao: e, bloqueios: d.bloqueios, onOpenBloqueio: a }),
      yt.default.createElement(ge, null, "Processos deste contrato"),""",
)

# =====================================================================
# 7. NOTIFICAÇÕES — filtro por tipo, com contagem e entrada escalonada
# =====================================================================
rep(
    """  function Aw({ notifs: t, onOpen: e, onMarkAll: n, onBack: o }) {
    let [i, a] = (0, He.useState)("todas"),
      r = t.filter((c) => !c.read).length,
      s = i === "todas" ? t : t.filter((c) => !c.read),""",
    """  var V10GRUPOS = [
      ["todos", "Todos"],
      ["bloqueios", "Bloqueios"],
      ["movs", "Movimenta\\xE7\\xF5es"],
      ["stf", "STF"],
      ["avisos", "Avisos e IA"],
    ],
    V10grupo = (c) =>
      c.type === "bloqueio"
        ? "bloqueios"
        : c.type === "movimentacao"
          ? "movs"
          : c.type === "reclamacao"
            ? "stf"
            : "avisos";
  function Aw({ notifs: t, onOpen: e, onMarkAll: n, onBack: o }) {
    let [i, a] = (0, He.useState)("todas"),
      [V10t, V10setT] = (0, He.useState)("todos"),
      r = t.filter((c) => !c.read).length,
      V10base = i === "todas" ? t : t.filter((c) => !c.read),
      s = V10t === "todos" ? V10base : V10base.filter((c) => V10grupo(c) === V10t),""",
)
rep(
    """        l.length === 0 &&
          He.default.createElement(
            "p",
            { className: "text-[16px] mt-6", style: { color: qe.muted } },
            "Tudo lido. Novas movimenta\\xE7\\xF5es aparecem aqui.",
          ),""",
    """        He.default.createElement(
          "div",
          {
            role: "group",
            "aria-label": "Filtrar por tipo",
            className: "v10-trilho flex overflow-x-auto",
            style: { gap: 8, margin: "14px -32px 0", padding: "2px 32px 4px" },
          },
          V10GRUPOS.map(([c, d]) => {
            let q = c === "todos" ? V10base.length : V10base.filter((x) => V10grupo(x) === c).length,
              on = V10t === c;
            return He.default.createElement(
              "button",
              {
                key: c,
                onClick: () => V10setT(c),
                "aria-pressed": on,
                className: "shrink-0 inline-flex items-center pressable",
                style: {
                  gap: 8,
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
              d,
              He.default.createElement(
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
            );
          }),
        ),
        l.length === 0 &&
          He.default.createElement(
            "p",
            { className: "text-[16px] mt-6", style: { color: qe.muted } },
            V10t === "todos" ? "Tudo lido. Novas movimenta\\xE7\\xF5es aparecem aqui." : "Nada deste tipo por aqui.",
          ),""",
)
rep(
    """        l.map(([c, d]) =>
          He.default.createElement(
            "div",
            { key: c },
            He.default.createElement(ge, null, c),""",
    """        l.map(([c, d], V10i) =>
          He.default.createElement(
            "div",
            { key: `${c}-${V10t}-${i}`, className: "v10-surge", style: { animationDelay: `${V10i * 90}ms` } },
            He.default.createElement(ge, null, c),""",
)


# =====================================================================
# 8. CORREÇÃO — a transição de telas (P1) guardava a tela atual congelada.
#    Sintoma: a conversa com a IA ficava parada em "Analisando…" e mudanças
#    de estado na mesma tela (estrela de seguir, etc.) não apareciam.
#    A tela atual passa a usar sempre os filhos mais recentes.
# =====================================================================
rep(
    """            style: { background: qe.paper, zIndex: p.chave === c ? 2 : 1 },
          },
          p.node,""",
    """            style: { background: qe.paper, zIndex: p.chave === c ? 2 : 1 },
          },
          p.chave === t ? o : p.node,""",
)


# =====================================================================
# VERSÃO 11
# =====================================================================
def rep_in(ini, fim, old, new, count=1):
    """Substitui só dentro do trecho entre `ini` e `fim` (para nomes que se repetem)."""
    global s
    a = s.index(ini)
    b = s.index(fim, a)
    trecho = s[a:b]
    n = trecho.count(old)
    if n != count:
        sys.exit(f"[patch] (trecho {ini[:30]}) esperava {count}x, achei {n}x:\n{old[:200]}")
    s = s[:a] + trecho.replace(old, new) + s[b:]


V11 = open("/home/claude/v10/v11.js", encoding="utf-8").read()
rep("  function lF() {", V11 + "\n  function lF() {")
rep("${V10Css}\n  `,", "${V10Css}\n${V11Css}\n  `,")

# ---- Espaço: margens laterais de 32/24 px para 20 px ----
rep('className: "flex-1 overflow-y-auto no-scrollbar px-8"', 'className: "flex-1 overflow-y-auto no-scrollbar px-5"', 21)
rep('className: "flex-1 overflow-y-auto no-scrollbar px-6"', 'className: "flex-1 overflow-y-auto no-scrollbar px-5"', 8)
rep('className: "flex-1 overflow-y-auto no-scrollbar px-6 pt-3"', 'className: "flex-1 overflow-y-auto no-scrollbar px-5 pt-3"')
rep('className: "flex-1 overflow-y-auto no-scrollbar px-6 pt-2 relative"', 'className: "flex-1 overflow-y-auto no-scrollbar px-5 pt-2 relative"')
rep('className: "flex-1 flex flex-col overflow-y-auto no-scrollbar px-8"', 'className: "flex-1 flex flex-col overflow-y-auto no-scrollbar px-5"')
rep('className: "absolute bottom-0 left-0 right-0 px-6 pb-7 pt-8"', 'className: "absolute bottom-0 left-0 right-0 px-5 pb-7 pt-8"')
rep("bleed: 32,", "bleed: 20,", 21)
rep("    bleed: n = 24,", "    bleed: n = 20,")
rep('style: { gap: 8, margin: "14px -32px 0", padding: "2px 32px 4px" },', 'style: { gap: 8, margin: "14px -20px 0", padding: "2px 20px 4px" },')
rep('style: { gap: 10, margin: "12px -24px 0", padding: "4px 24px 8px", scrollPaddingInline: 24 },',
    'style: { gap: 10, margin: "12px -20px 0", padding: "4px 20px 8px", scrollPaddingInline: 20 },')

# ---- Bloqueios: um só bloco escuro; o valor segue o cliente escolhido ----
rep(
    """      Lt.default.createElement(Fe, {
        bleed: 20,
        bloco: !0,
        onBack: t,
        backLabel: "In\\xEDcio",
        eyebrow: "Todos os clientes",
        titulo: "Bloqueios",""",
    """      Lt.default.createElement(Fe, {
        bleed: 20,
        onBack: t,
        backLabel: "In\\xEDcio",
        titulo: "Bloqueios",""",
)
rep(
    """          { style: { fontFamily: L.ui, fontSize: 15, color: v.marcaTexto2 } },
          "Bloqueado hoje, todos os clientes",
        ),
        Lt.default.createElement(
          "p",
          {
            style: {
              fontFamily: L.ui,
              fontSize: 32,
              fontWeight: 500,
              color: "#FFFFFF",
              letterSpacing: "-0.035em",
              marginTop: 4,
              fontVariantNumeric: "tabular-nums",
            },
          },
          Xt(X),
        ),
        Lt.default.createElement(
          "p",
          { style: { fontFamily: L.ui, fontSize: 15, color: v.marcaTexto2, marginTop: 6 } },
          B.length,
          " bloqueios ativos",
        ),""",
    """          { style: { fontFamily: L.ui, fontSize: 15, color: v.marcaTexto2 } },
          c ? `Bloqueado hoje \\xB7 ${fe[c].name}` : "Bloqueado hoje, todos os clientes",
        ),
        Lt.default.createElement(
          "p",
          {
            style: {
              fontFamily: L.ui,
              fontSize: 32,
              fontWeight: 500,
              color: "#FFFFFF",
              letterSpacing: "-0.035em",
              marginTop: 4,
              fontVariantNumeric: "tabular-nums",
            },
          },
          V11h(V11Odo, { texto: Xt(c ? (pt.find((V11x) => V11x.id === c) || { valor: 0 }).valor : X) }),
        ),
        Lt.default.createElement(
          "p",
          { style: { fontFamily: L.ui, fontSize: 15, color: v.marcaTexto2, marginTop: 6 } },
          c ? (pt.find((V11x) => V11x.id === c) || { n: 0 }).n : B.length,
          " bloqueios ativos",
        ),""",
)

# ---- Processos: lista e filtros visíveis antes de buscar ----
rep(
    "  function yw({ onBack: t, onOpenOrg: e, onOpenProcesso: n, onOpenBloqueio: o }) {\n    return ht.default.createElement(Yk, { onBack: t, onOpenProcesso: n, onOpenBloqueio: o, onOpenOrg: e });",
    "  function yw({ onBack: t, onOpenOrg: e, onOpenProcesso: n, onOpenBloqueio: o, recorteInicial: V11r }) {\n    return ht.default.createElement(Yk, { onBack: t, onOpenProcesso: n, onOpenBloqueio: o, onOpenOrg: e, inicial: V11r });",
)
rep(
    "  function Yk({ onBack: t, onOpenProcesso: e, onOpenBloqueio: n, onOpenOrg: o }) {",
    "  function Yk({ onBack: t, onOpenProcesso: e, onOpenBloqueio: n, onOpenOrg: o, inicial: V11ini }) {",
)
rep_in(
    "  function Yk({",
    "  function yw({",
    """        !r &&
          ht.default.createElement(
            ht.default.Fragment,
            null,
            ht.default.createElement(ge, null, "Sugest\\xF5es"),""",
    """        !r && V11h(V11ListaProcessos, { onOpen: e, inicial: V11ini }),
        !1 &&
          ht.default.createElement(
            ht.default.Fragment,
            null,
            ht.default.createElement(ge, null, "Sugest\\xF5es"),""",
)

# ---- Atalhos da Início: viram a tela ----
rep(
    """          "button",
          {
            onClick: Et,
            className: "flex flex-col items-start text-left min-w-0",""",
    """          "button",
          {
            onClick: (V11e) => (V11morfar(V11e.currentTarget, Gt.fundo, Gt.titulo, rt, rt), Et()),
            "data-v11-morf": rt,
            className: "flex flex-col items-start text-left min-w-0",""",
)
rep(
    '                { className: "absolute inset-0 flex flex-col", style: { zoom: Yt } },',
    '                { className: "absolute inset-0 flex flex-col", style: { zoom: Yt }, "data-v11-palco": !0 },',
)
rep(
    """                    onFechar: () => V10setAcao(null),
                  }),""",
    """                    onFechar: () => V10setAcao(null),
                  }),
                Ct.default.createElement(V11Palco, null),""",
)
rep(
    """                                  tipo: i,
                                  recorteInicial: je,
                                  onBack: () => a("feed"),""",
    """                                  tipo: i,
                                  recorteInicial: je,
                                  onBack: () => V11voltar("Processos", () => a("feed")),""",
)
rep(
    """                                Ct.default.createElement(zw, {
                                  onBack: () => {
                                    s(null), a("feed");
                                  },""",
    """                                Ct.default.createElement(zw, {
                                  onBack: () =>
                                    V11voltar("Bloqueios", () => {
                                      s(null), a("feed");
                                    }),""",
)
rep(
    """                                Ct.default.createElement(Bw, {
                                  onBack: () => a("feed"),""",
    """                                Ct.default.createElement(Bw, {
                                  onBack: () => V11voltar("Passivo", () => a("feed")),""",
)
rep(
    """                                Ct.default.createElement(Qw, {
                                  onBack: () => a("feed"),""",
    """                                Ct.default.createElement(Qw, {
                                  onBack: () => V11voltar("Desempenho", () => a("feed")),""",
)

# ---- Desempenho: períodos que existem na base, valores recontando ----
rep("      l = qw(n);\n    return oe.default.createElement(", "      l = V11serie(n);\n    return oe.default.createElement(")
rep(
    'sub: l ? `2026 at\\xE9 ${eE(l.periodo.ate)}` : "Per\\xEDodo sem dados de exemplo",',
    'sub: l ? `${eE(l.periodo.de)} a ${eE(l.periodo.ate)} de 2026` : "Per\\xEDodo sem dados de exemplo",',
)
rep('oe.default.createElement(Zs, { itens: tE, ativo: n, onChange: o, label: "Per\\xEDodo" }),',
    'oe.default.createElement(Zs, { itens: V11PERIODOS, ativo: n, onChange: o, label: "Per\\xEDodo" }),')
rep("      g = Iw(t),\n      h = jw(),", "      g = Iw(t),\n      h = V11levantados(t),")
rep("          valor: `${c.indiceAcumulado ?? 0}%`,", "          valor: `${d ? Math.round((p / d) * 100) : (c.indiceAcumulado ?? 0)}%`,")
rep_in(
    "  function nE({",
    "  var Ww =",
    """                    color: A ? "#FFFFFF" : v.ink,
                    letterSpacing: "-0.035em",
                    fontVariantNumeric: "tabular-nums",
                  },
                },
                w.valor,""",
    """                    color: A ? "#FFFFFF" : v.ink,
                    letterSpacing: "-0.035em",
                    fontVariantNumeric: "tabular-nums",
                  },
                },
                V11h(V11Odo, { texto: w.valor }),""",
)

# ---- Gráfico de linha: traço que se desenha e valor sobre o ponto ----
rep_in(
    "  function sw({",
    "  function d2({",
    """                d: `${Z} L${D[a - 1][0]},${c - h} L${D[0][0]},${c - h} Z`,
                fill: _(I),
                opacity: "0.1",
              }),
            Wt.default.createElement("path", {
              d: Z,
              fill: "none",""",
    """                d: `${Z} L${D[a - 1][0]},${c - h} L${D[0][0]},${c - h} Z`,
                fill: _(I),
                opacity: "0.1",
                className: "v11-area",
              }),
            Wt.default.createElement("path", {
              d: Z,
              pathLength: 1,
              className: "v11-traco",
              fill: "none",""",
)
rep_in(
    "  function sw({",
    "  function d2({",
    """            Wt.default.createElement("circle", {
              cx: D[r][0],
              cy: D[r][1],
              r: "5",
              fill: _(I),
              stroke: v.cartao,
              strokeWidth: "2",
            }),
          );""",
    """            Wt.default.createElement("circle", {
              cx: D[r][0],
              cy: D[r][1],
              r: "5",
              fill: _(I),
              stroke: v.cartao,
              strokeWidth: "2",
            }),
            !A &&
              (() => {
                let V11t = nu(W.valores[r], i),
                  V11w = V11t.length * 7.4 + 18,
                  V11x = Math.max(d, Math.min(l - p - V11w, D[r][0] - V11w / 2)),
                  V11y = D[r][1] - 36 < 0 ? D[r][1] + 12 : D[r][1] - 36;
                return Wt.default.createElement(
                  "g",
                  { style: { pointerEvents: "none" } },
                  Wt.default.createElement("rect", { x: V11x, y: V11y, width: V11w, height: 24, rx: 12, fill: v.marca }),
                  Wt.default.createElement(
                    "text",
                    { x: V11x + V11w / 2, y: V11y + 16.5, textAnchor: "middle", fontSize: "13", fontWeight: 600, fill: "#FFFFFF", fontFamily: L.ui },
                    V11t,
                  ),
                );
              })(),
          );""",
)

# ---- Notificações: os cartões deslizam ao filtrar ----
rep_in(
    "  function Aw({",
    "  function Nw({",
    """      He.default.createElement(
        "div",
        { className: "flex-1 overflow-y-auto no-scrollbar px-5", style: { paddingBottom: 60 } },""",
    """      He.default.createElement(
        "div",
        { ref: V11ref, className: "flex-1 overflow-y-auto no-scrollbar px-5", style: { paddingBottom: 60 } },""",
)
rep(
    """      s = V10t === "todos" ? V10base : V10base.filter((c) => V10grupo(c) === V10t),""",
    """      s = V10t === "todos" ? V10base : V10base.filter((c) => V10grupo(c) === V10t),
      V11ref = (0, He.useRef)(null),""",
)
rep_in(
    "  function Aw({",
    "  function Nw({",
    """    return He.default.createElement(
      He.default.Fragment,""",
    """    V11useFlip(V11ref, V10t + "|" + i);
    return He.default.createElement(
      He.default.Fragment,""",
)
rep(
    """            { key: `${c}-${V10t}-${i}`, className: "v10-surge", style: { animationDelay: `${V10i * 90}ms` } },""",
    """            { key: c, "data-flip": "grupo-" + c },""",
)
rep_in(
    "  function Aw({",
    "  function Nw({",
    """                  {
                    key: p.id,
                    onClick: () => e(p),""",
    """                  {
                    key: p.id,
                    "data-flip": p.id,
                    onClick: () => e(p),""",
)

# ---- Página do cliente: abas entre clientes e números que rolam ----
rep(
    """    onOpenDesempenhoAno: d,
  }) {
    let p = fe[t],
      g = aa(t),""",
    """    onOpenDesempenhoAno: d,
    onTrocarOrg: V11troca,
  }) {
    let p = fe[t],
      g = aa(t),""",
)
rep(
    """          eyebrow: "Cliente",
          titulo: p.name,
          tituloCompacto: p.name,
          tituloSize: 32,
        }),""",
    """          eyebrow: "Cliente",
          titulo: p.name,
          tituloCompacto: p.name,
          tituloSize: 32,
        }),
        V11troca && V11h(V11AbasClientes, { atual: t, onTrocar: V11troca }),""",
)
rep(
    """                style: { fontFamily: L.ui, fontSize: 24, fontWeight: 500, color: v.ink, letterSpacing: "-0.035em" },
              },
              g.processos.length,
              " processos",""",
    """                style: { fontFamily: L.ui, fontSize: 24, fontWeight: 500, color: v.ink, letterSpacing: "-0.035em" },
              },
              V11h(V11Odo, { texto: String(g.processos.length) }),
              " processos",""",
)
rep_in(
    "  function th({",
    "  function Tw({",
    """            "Passivo estimado \\xB7 ",
            p.name,
          ),
          Vt.default.createElement(
            "p",
            {
              style: {
                fontFamily: L.ui,
                fontSize: 32,
                fontWeight: 500,
                color: "#FFFFFF",
                letterSpacing: "-0.035em",
                marginTop: 4,
                fontVariantNumeric: "tabular-nums",
              },
            },
            Xt(g.passivo.total),""",
    """            "Passivo estimado \\xB7 ",
            p.name,
          ),
          Vt.default.createElement(
            "p",
            {
              style: {
                fontFamily: L.ui,
                fontSize: 32,
                fontWeight: 500,
                color: "#FFFFFF",
                letterSpacing: "-0.035em",
                marginTop: 4,
                fontVariantNumeric: "tabular-nums",
              },
            },
            V11h(V11Odo, { texto: Xt(g.passivo.total) }),""",
)
rep(
    """                                Ct.default.createElement(th, {
                                  orgId: d,""",
    """                                Ct.default.createElement(th, {
                                  orgId: d,
                                  onTrocarOrg: (tt) => p(tt),""",
    2,
)


# Gráficos do Desempenho guardam o mês selecionado; ao trocar de período, recomeçam no último mês.
rep("oe.default.createElement(Gw, { meses: r }),", "oe.default.createElement(Gw, { key: r[0].mes, meses: r }),")
rep("oe.default.createElement(Yw, { meses: r, carteiraInicial: s }),", "oe.default.createElement(Yw, { key: r[0].mes, meses: r, carteiraInicial: s }),")
rep("oe.default.createElement($w, { meses: r }),", "oe.default.createElement($w, { key: r[0].mes, meses: r }),")
rep("oe.default.createElement(Zw, { meses: r }),", "oe.default.createElement(Zw, { key: r[0].mes, meses: r }),")
rep_in("  function nE({", "  function oE(", '"\\xCDndice de \\xEAxito em 2026",', '"\\xCDndice de \\xEAxito no per\\xEDodo",')
open(OUT, "w", encoding="utf-8").write(s)
print("patch ok (v11)")
