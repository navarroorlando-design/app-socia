window.DADOS=(function(){
const qe={brass:'#765614',slate:'#565449',brick:'#B42318'};
  function V10hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) (h ^= s.charCodeAt(i)), (h = Math.imul(h, 16777619));
    return h >>> 0;
  }
  var V10BANCOS = [
      ["Banco do Brasil", "001"],
      ["Caixa Econ\xF4mica", "104"],
      ["Ita\xFA", "341"],
      ["Bradesco", "237"],
      ["Santander", "033"],
    ],
    V10FINS = ["Repasse do contrato de gest\xE3o", "Folha de pagamento", "Custeio e fornecedores", "Provis\xE3o trabalhista"];
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
  var Hn = new Date(2026, 9, 6),
    $f = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
    Xt = (t) => "R$ " + Math.round(t).toLocaleString("pt-BR"),
    bn = (t) =>
      t >= 1e6
        ? "R$ " + (t / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + " mi"
        : "R$ " + Math.round(t / 1e3).toLocaleString("pt-BR") + " mil",
    Co = (t) => t.toLocaleDateString("pt-BR"),
    Lr = (t, e) => Math.round((e - t) / 864e5);
  function GS(t) {
    let e = Lr(t, Hn);
    return e <= 0
      ? "hoje"
      : e === 1
        ? "ontem"
        : e < 7
          ? `${e} dias`
          : e < 30
            ? `${Math.round(e / 7)} sem`
            : `${Math.round(e / 30)} meses`;
  }
  function Rl(t) {
    return t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }
  var Zf = 90,
    nc = (t) => t.filter((e) => e.diasParado >= Zf),
    Rp = 7;
  function H1(t, e) {
    return t.status === "Levantado"
      ? t.perdido > 0
        ? t.devolvido > 0
          ? "parcial"
          : "perdido"
        : "levantado"
      : Lr(t.data, Hn) <= Rp
        ? "novo"
        : e && e.diasParado >= Zf
          ? "parado"
          : "ativo";
  }
  var Hv = { novo: "Novo", parado: "Parado", ativo: "Ativo", levantado: "Devolvido", perdido: "Perdido", parcial: "Devolvido em parte" },
    YS = { novo: "risco", parado: "atencao", ativo: "inativo", levantado: "resolvido", perdido: "risco", parcial: "atencao" };
  var fe = {
      afne: {
        name: "AFNE",
        initials: "AF",
        processos: 47,
        bloqueado: "R$ 886.000",
        bloqueadoCurto: "R$ 886k",
        contratos: [
          { orgao: "Munic\xEDpio de Nova Igua\xE7u", vigencia: "2023\u20132027" },
          { orgao: "Munic\xEDpio de Niter\xF3i", vigencia: "2021\u20132025" },
        ],
        feed: [
          { text: "Bloqueio de R$ 18.400 foi levantado", time: "3 h", color: qe.brass },
          { text: "Audi\xEAncia trabalhista remarcada", time: "4 dias", color: qe.slate },
        ],
      },
      gnosis: {
        name: "Instituto Gnosis",
        initials: "IG",
        processos: 91,
        bloqueado: "R$ 1.240.000",
        bloqueadoCurto: "R$ 1,24 mi",
        contratos: [
          { orgao: "Munic\xEDpio do Rio de Janeiro", vigencia: "2022\u20132026" },
          { orgao: "Munic\xEDpio de Duque de Caxias", vigencia: "2023\u20132027" },
        ],
        feed: [{ text: "Decis\xE3o interlocut\xF3ria publicada", time: "40 min", color: qe.brass }],
      },
      fas: {
        name: "FAS",
        initials: "FA",
        processos: 91,
        bloqueado: "R$ 640.000",
        bloqueadoCurto: "R$ 640k",
        contratos: [
          { orgao: "Estado do Rio de Janeiro", vigencia: "2020\u20132026" },
          { orgao: "Munic\xEDpio de S\xE3o Gon\xE7alo", vigencia: "2019\u20132024" },
        ],
        feed: [{ text: "Nova reclama\xE7\xE3o constitucional protocolada no STF", time: "ontem", color: qe.brick }],
      },
      igedes: {
        name: "IGEDES",
        initials: "IGD",
        processos: 34,
        bloqueado: "R$ 210.000",
        bloqueadoCurto: "R$ 210k",
        contratos: [
          { orgao: "Munic\xEDpio de Niter\xF3i", vigencia: "2024\u20132028" },
          { orgao: "Munic\xEDpio de Maric\xE1", vigencia: "2025\u20132029" },
        ],
        feed: [{ text: "Processo administrativo movimentado", time: "2 dias", color: qe.slate }],
      },
    },
    ti = ["afne", "gnosis", "fas", "igedes"],
    Gv = [
      { name: "Instituto Vida Plena", processos: 12 },
      { name: "Associa\xE7\xE3o Caminho Novo", processos: 8 },
      { name: "Centro Social M\xE3os Unidas", processos: 5 },
    ];
  function t2(t) {
    return function () {
      (t |= 0), (t = (t + 1831565813) | 0);
      let e = Math.imul(t ^ (t >>> 15), 1 | t);
      return (e = (e + Math.imul(e ^ (e >>> 7), 61 | e)) ^ e), ((e ^ (e >>> 14)) >>> 0) / 4294967296;
    };
  }
  var ic = t2(20261006),
    G1 = (t) => t[Math.floor(ic() * t.length)],
    Ui = (t, e) => t + Math.floor(ic() * (e - t + 1)),
    di = { afne: "AFNE", gnosis: "Instituto Gnosis", fas: "FAS", igedes: "IGEDES" },
    Ak = {
      afne: ["Munic\xEDpio de Nova Igua\xE7u", "Munic\xEDpio de Niter\xF3i"],
      gnosis: ["Munic\xEDpio do Rio de Janeiro", "Munic\xEDpio de Duque de Caxias"],
      fas: ["Estado do Rio de Janeiro", "Munic\xEDpio de S\xE3o Gon\xE7alo"],
      igedes: ["Munic\xEDpio de Niter\xF3i", "Munic\xEDpio de Maric\xE1"],
    },
    Nk = [
      ["afne", 14],
      ["gnosis", 20],
      ["fas", 16],
      ["igedes", 8],
    ],
    e2 = {
      Trabalhista: [
        "Reclama\xE7\xE3o trabalhista: verbas rescis\xF3rias",
        "Reclama\xE7\xE3o trabalhista: horas extras",
        "Execu\xE7\xE3o trabalhista em fase de liquida\xE7\xE3o",
        "Responsabilidade subsidi\xE1ria do ente p\xFAblico",
      ],
      Cível: [
        "A\xE7\xE3o de cobran\xE7a de repasses em atraso",
        "A\xE7\xE3o indenizat\xF3ria",
        "A\xE7\xE3o declarat\xF3ria contra reajuste contratual",
      ],
      Administrativo: [
        "Mandado de seguran\xE7a",
        "Processo administrativo disciplinar",
        "Tomada de contas no Tribunal de Contas",
      ],
      Constitucional: ["Reclama\xE7\xE3o constitucional no STF (ADPF 664)"],
    },
    Lk = [
      ["Trabalhista", 55],
      ["C\xEDvel", 22],
      ["Administrativo", 16],
      ["Constitucional", 7],
    ],
    $S = (t) => {
      let e = t.reduce((o, i) => o + i[1], 0),
        n = ic() * e;
      for (let [o, i] of t) if ((n -= i) < 0) return o;
      return t[0][0];
    },
    Ck = {
      Trabalhista: [
        "Processo distribu\xEDdo",
        "Audi\xEAncia de concilia\xE7\xE3o realizada",
        "Senten\xE7a publicada",
        "C\xE1lculos de liquida\xE7\xE3o apresentados",
        "Liquida\xE7\xE3o homologada",
        "Bloqueio via SISBAJUD determinado",
      ],
      Cível: [
        "Peti\xE7\xE3o inicial distribu\xEDda",
        "Contesta\xE7\xE3o apresentada",
        "Despacho saneador",
        "Decis\xE3o interlocut\xF3ria publicada",
      ],
      Administrativo: [
        "Processo instaurado",
        "Defesa apresentada",
        "Parecer t\xE9cnico juntado",
        "Aguardando julgamento",
      ],
      Constitucional: [
        "Reclama\xE7\xE3o protocolada no STF",
        "Liminar apreciada",
        "Informa\xE7\xF5es prestadas pela autoridade",
      ],
    };
  function kk(t) {
    let e = t === "Trabalhista" ? "5.01" : t === "Constitucional" ? "1.00" : "8.19";
    return `${String(Ui(1e5, 999999)).padStart(7, "0")}-${Ui(10, 99)}.${G1(["2022", "2023", "2024", "2025"])}.${e}.${String(Ui(1, 299)).padStart(4, "0")}`;
  }
  function oc(t, e = {}) {
    let n = e.clienteId || $S(Nk),
      o = e.area || $S(Lk),
      i = e.desc || G1(e2[o]),
      a = e.diasParado ?? (ic() < 0.22 ? Ui(61, 210) : Ui(0, 55)),
      r = new Date(Hn.getTime() - a * 864e5),
      s = Ck[o],
      l = Math.min(s.length, Ui(2, s.length)),
      c = [];
    for (let d = l - 1, p = new Date(r); d >= 0; d--)
      c.push({ date: Co(p), text: s[d] }), (p = new Date(p.getTime() - Ui(12, 50) * 864e5));
    return {
      id: t,
      numero: kk(o),
      clienteId: n,
      cliente: di[n],
      area: o,
      desc: i,
      contrato: G1(Ak[n]),
      status:
        e.status ||
        (a > 60
          ? G1(["Suspenso", "Aguardando decis\xE3o"])
          : G1(["Em andamento", "Em andamento", "Aguardando decis\xE3o", "Em execu\xE7\xE3o"])),
      diasParado: a,
      ultimaMov: r,
      lastUpdate: e.lastUpdate || GS(r),
      movs: c,
    };
  }
  var Se = [
    oc("p1", {
      clienteId: "afne",
      area: "Trabalhista",
      desc: "Execu\xE7\xE3o trabalhista em fase de liquida\xE7\xE3o",
      status: "Em execu\xE7\xE3o",
      diasParado: 0,
      lastUpdate: "3 h",
    }),
    oc("p2", {
      clienteId: "gnosis",
      area: "C\xEDvel",
      desc: "A\xE7\xE3o c\xEDvel de cobran\xE7a",
      status: "Aguardando decis\xE3o",
      diasParado: 0,
      lastUpdate: "40 min",
    }),
    oc("p3", {
      clienteId: "fas",
      area: "Administrativo",
      desc: "Mandado de seguran\xE7a",
      status: "Em andamento",
      diasParado: 5,
    }),
    oc("p4", {
      clienteId: "afne",
      area: "C\xEDvel",
      desc: "A\xE7\xE3o declarat\xF3ria contra reajuste contratual",
      status: "Em andamento",
      diasParado: 4,
    }),
    oc("p5", {
      clienteId: "igedes",
      area: "Administrativo",
      desc: "Processo administrativo disciplinar",
      status: "Suspenso",
      diasParado: 2,
    }),
    oc("p6", {
      clienteId: "gnosis",
      area: "Administrativo",
      desc: "Defesa em a\xE7\xE3o de improbidade administrativa",
      status: "Aguardando decis\xE3o",
      diasParado: 7,
    }),
    ...Array.from({ length: 52 }, (t, e) => oc("p" + (e + 7))),
  ];
  Se.sort((t, e) => t.diasParado - e.diasParado);
  function Wf(t, e, n = {}) {
    let o = n.valorNum ?? Math.round((e.area === "Trabalhista" ? Ui(8, 120) : Ui(15, 260)) * 1e3 + Ui(0, 9) * 100),
      i = n.mes ?? Ui(0, 9),
      a = new Date(Math.min(new Date(2026, i, Ui(1, 27)).getTime(), Hn.getTime() - Ui(1, 5) * 864e5)),
      r = n.status || (ic() < 0.22 ? "Levantado" : "Ativo"),
      s = [{ date: Co(a), text: "Bloqueio realizado via SISBAJUD" }],
      l = null;
    return (
      r === "Levantado"
        ? ((l = new Date(Math.min(Hn, a.getTime() + Ui(20, 90) * 864e5))),
          s.unshift({ date: Co(l), text: "Valor levantado por decis\xE3o judicial" }))
        : ic() < 0.4 &&
          s.unshift({
            date: Co(new Date(Math.min(Hn, a.getTime() + Ui(10, 40) * 864e5))),
            text: "Pedido de desbloqueio protocolado",
          }),
      {
        id: t,
        processoId: e.id,
        clienteId: e.clienteId,
        cliente: e.cliente,
        contrato: e.contrato,
        area: e.area,
        valorNum: o,
        valor: Xt(o),
        data: a,
        mes: i,
        status: r,
        sistema: "SISBAJUD",
        historico: s,
        liberadoEm: l,
      }
    );
  }
  var V1 = (t) => Se.find((e) => e.id === t),
    Tn = [
      Wf("b1", V1("p1"), { valorNum: 18400, mes: 7, status: "Levantado" }),
      Wf("b2", V1("p2"), { valorNum: 24e4, mes: 8, status: "Ativo" }),
      Wf("b3", V1("p3"), { valorNum: 96e3, mes: 7, status: "Ativo" }),
      Wf("b4", V1("p4"), { valorNum: 62e3, mes: 7, status: "Ativo" }),
      Wf("b5", V1("p5"), { valorNum: 15e3, mes: 8, status: "Ativo" }),
    ];
  {
    let t = Se.filter((e) => e.area !== "Constitucional" && !["p1", "p2", "p3", "p4", "p5"].includes(e.id));
    for (let e = 0; e < 34; e++) Tn.push(Wf("b" + (e + 6), t[Math.floor(ic() * t.length)]));
  }
  V12dinheiro(Tn);
  Tn.sort((t, e) => e.data - t.data);
  var Vv = [
    ["Prov\xE1vel", 35],
    ["Poss\xEDvel", 45],
    ["Remoto", 20],
  ];
  for (let t of Se) {
    let e = t2([...t.id].reduce((i, a) => (i * 31 + a.charCodeAt(0)) | 0, 7)),
      n = { Trabalhista: [15, 180], Cível: [30, 600], Administrativo: [20, 400], Constitucional: null }[t.area];
    t.valorCausa = n ? Math.round(((n[0] + e() * (n[1] - n[0])) * 1e3) / 100) * 100 : 0;
    let o = e() * 100;
    if (
      ((t.prognostico = Vv.find(([, i]) => (o -= i) < 0)[0]),
      (t.entradaMes = e() < 0.55 ? -1 : Math.floor(e() * 10)),
      e() < 0.15 && t.entradaMes < 8)
    ) {
      let i = Vv.map(([a]) => a).filter((a) => a !== t.prognostico);
      t.prognosticoAntes = {
        mes: Math.max(t.entradaMes + 1, 1 + Math.floor(e() * 9)),
        era: i[Math.floor(e() * i.length)],
      };
    }
    e() < 0.12 &&
      t.entradaMes < 8 &&
      t.valorCausa &&
      (t.valorAntes = {
        mes: Math.max(t.entradaMes + 1, 1 + Math.floor(e() * 9)),
        era: Math.round((t.valorCausa * (0.7 + e() * 0.2)) / 100) * 100,
      });
  }
  var $o = [];
  {
    let t = t2(20260),
      e = [
        ["Acordo homologado", "Acordo", 0.28],
        ["Pedido julgado improcedente", "Favor\xE1vel", 0.27],
        ["Extin\xE7\xE3o sem resolu\xE7\xE3o do m\xE9rito", "Favor\xE1vel", 0.13],
        ["Desist\xEAncia da parte autora", "Favor\xE1vel", 0.09],
        ["Pedido julgado procedente", "Desfavor\xE1vel", 0.23],
      ];
    for (let [n, o] of Object.entries(fe))
      for (let i of o.contratos) {
        let a = Math.floor(t() * 3);
        for (let r = 0; r < a; r++) {
          let s = t() * 100,
            l = t(),
            [c, d] = e.find(([, , p]) => (l -= p) < 0) || e[0];
          $o.push({
            id: `enc-${n}-${$o.length}`,
            clienteId: n,
            cliente: di[n],
            contrato: i.orgao,
            area: t() < 0.7 ? "Trabalhista" : "C\xEDvel",
            valorCausa: Math.round((25 + t() * 160) * 10) * 100,
            prognostico: Vv.find(([, p]) => (s -= p) < 0)[0],
            entradaMes: -1,
            saiuMes: 1 + Math.floor(t() * 9),
            motivo: c,
            resultado: d,
          });
        }
      }
  }
  for (let t of $o) {
    let e = t2([...t.id].reduce((n, o) => (n * 31 + o.charCodeAt(0)) | 0, 11));
    t.valorRevertido =
      t.resultado === "Favor\xE1vel"
        ? t.valorCausa
        : t.resultado === "Desfavor\xE1vel"
          ? 0
          : Math.round((t.valorCausa * (0.3 + e() * 0.4)) / 100) * 100;
  }
  var ir = (() => {
    let t = Tn.filter((o) => o.status === "Ativo"),
      e = {};
    for (let o of Object.keys(di)) {
      let i = t.filter((a) => a.clienteId === o).reduce((a, r) => a + r.valorNum, 0);
      e[o] = { bloqueado: i, processos: Se.filter((a) => a.clienteId === o).length };
    }
    let n = Object.keys(e2).map((o) => [o, Se.filter((i) => i.area === o).length]);
    return {
      bloqueadoAtivo: t.reduce((o, i) => o + i.valorNum, 0),
      processos: Se.length,
      parados: nc(Se).length,
      porCliente: e,
      porArea: n,
    };
  })();
  for (let t of Object.keys(fe))
    (fe[t].processos = ir.porCliente[t].processos),
      (fe[t].bloqueado = Xt(ir.porCliente[t].bloqueado)),
      (fe[t].bloqueadoCurto = bn(ir.porCliente[t].bloqueado));
  var Ek = [
      {
        id: "r1",
        clienteId: "fas",
        numero: "Rcl 81.204/RJ",
        status: "Em andamento",
        liminar: "Pendente",
        assunto: "Bloqueio de verbas do contrato de gest\xE3o para pagar d\xEDvida trabalhista",
        paradigma: "ADPF 664",
        ato: "Decis\xE3o da Vara do Trabalho que determinou bloqueio via SISBAJUD na conta do contrato de gest\xE3o.",
        movs: [
          ["06/10/2026", "Reclama\xE7\xE3o protocolada no STF"],
          ["06/10/2026", "Distribu\xEDda por preven\xE7\xE3o"],
        ],
      },
      {
        id: "r2",
        clienteId: "gnosis",
        numero: "Rcl 80.150/RJ",
        status: "Em andamento",
        liminar: "Deferida",
        assunto: "Responsabilidade da OS por verbas trabalhistas de empregados do contrato",
        paradigma: "ADPF 664",
        ato: "Ac\xF3rd\xE3o do TRT que manteve a penhora de valores repassados pelo munic\xEDpio.",
        movs: [
          ["18/09/2026", "Liminar deferida para suspender a penhora"],
          ["02/09/2026", "Informa\xE7\xF5es prestadas pela autoridade reclamada"],
          ["12/08/2026", "Reclama\xE7\xE3o protocolada no STF"],
        ],
      },
      {
        id: "r3",
        clienteId: "afne",
        numero: "Rcl 77.932/RJ",
        status: "Julgada",
        liminar: "Deferida",
        assunto: "Bloqueio de recursos p\xFAblicos vinculados ao contrato de gest\xE3o",
        paradigma: "ADPF 664",
        ato: "Decis\xE3o da Vara do Trabalho que bloqueou valores destinados \xE0 sa\xFAde municipal.",
        movs: [
          ["14/07/2026", "Reclama\xE7\xE3o julgada procedente"],
          ["03/04/2026", "Liminar deferida"],
          ["11/03/2026", "Reclama\xE7\xE3o protocolada no STF"],
        ],
      },
    ],
    za = Ek.map((t) => {
      let e = (o) =>
          Tn.filter((i) => i.processoId === o.id && i.status === "Ativo").reduce((i, a) => i + a.valorNum, 0),
        n = Se.filter((o) => o.clienteId === t.clienteId && o.area === "Trabalhista")
          .sort((o, i) => e(i) - e(o))
          .slice(0, 2);
      return {
        ...t,
        cliente: di[t.clienteId],
        desc: t.assunto,
        processosOrigem: n.map((o) => o.id),
        valorDiscutido: n.reduce((o, i) => o + e(i), 0),
      };
    });
  var Zo = ["Prov\xE1vel", "Poss\xEDvel", "Remoto"];
  function n2(t) {
    let e = { total: 0, Provável: 0, Possível: 0, Remoto: 0 };
    for (let n of t) (e.total += n.valorCausa), (e[n.prognostico] += n.valorCausa);
    return e;
  }
  function Tk(t) {
    let e = Number(String(t).split("\u2013")[1]);
    return e < 2026
      ? { id: "inativo", texto: `Vig\xEAncia encerrada em ${e}` }
      : e === 2026
        ? { id: "atencao", texto: "Vence este ano" }
        : { id: "curso", texto: "Vigente" };
  }
  function Ws(t, e) {
    let n = fe[t].contratos.find((r) => r.orgao === e),
      o = Se.filter((r) => r.clienteId === t && r.contrato === e),
      i = Tn.filter((r) => r.clienteId === t && r.contrato === e),
      a = i.filter((r) => r.status === "Ativo");
    return {
      orgId: t,
      orgao: e,
      vigencia: n.vigencia,
      vigenciaStatus: Tk(n.vigencia),
      processos: o,
      bloqueios: i,
      passivo: n2(o),
      bloqueadoAtivo: a.reduce((r, s) => r + s.valorNum, 0),
      bloqueiosAtivos: a.length,
      levantado: i.reduce((r, s) => r + (s.devolvido || 0), 0),
      perdido: i.reduce((r, s) => r + (s.perdido || 0), 0),
    };
  }
  function aa(t) {
    let e = fe[t].contratos.map((a) => Ws(t, a.orgao)).sort((a, r) => r.passivo.total - a.passivo.total),
      n = Se.filter((a) => a.clienteId === t),
      o = Tn.filter((a) => a.clienteId === t),
      i = o.filter((a) => a.status === "Ativo");
    return {
      contratos: e,
      processos: n,
      bloqueios: o,
      passivo: n2(n),
      bloqueadoAtivo: i.reduce((a, r) => a + r.valorNum, 0),
      bloqueiosAtivos: i.length,
      levantado: o.reduce((a, r) => a + (r.devolvido || 0), 0),
      perdido: o.reduce((a, r) => a + (r.perdido || 0), 0),
    };
  }
  function Xf(t, e = []) {
    let n = [];
    for (let o = 0; o <= Hn.getMonth(); o++) {
      let i = { mes: $f[o], total: 0, Provável: 0, Possível: 0, Remoto: 0 },
        a = (r, s) => {
          (i.total += r), (i[s] += r);
        };
      for (let r of t) {
        if (r.entradaMes > o) continue;
        let s = r.prognosticoAntes && o < r.prognosticoAntes.mes ? r.prognosticoAntes.era : r.prognostico,
          l = r.valorAntes && o < r.valorAntes.mes ? r.valorAntes.era : r.valorCausa;
        a(l, s);
      }
      for (let r of e) r.entradaMes <= o && o < r.saiuMes && a(r.valorCausa, r.prognostico);
      n.push(i);
    }
    return n;
  }
  function XS(t, e = []) {
    let n = Hn.getMonth(),
      o = t.filter((l) => l.entradaMes > 0),
      i = e.filter((l) => l.saiuMes <= n),
      a = t.filter((l) => l.prognosticoAntes && l.prognosticoAntes.mes > 0),
      r = t.filter((l) => l.valorAntes && l.valorAntes.mes > 0),
      s = (l, c = (d) => d.valorCausa) => l.reduce((d, p) => d + c(p), 0);
    return {
      novos: { n: o.length, valor: s(o) },
      saidas: { n: i.length, valor: s(i), lista: i },
      reclassificados: { n: a.length, paraProvavel: a.filter((l) => l.prognostico === "Prov\xE1vel").length },
      atualizados: { n: r.length, valor: s(r, (l) => l.valorCausa - l.valorAntes.era) },
    };
  }
  var ac = (t, e) => $o.filter((n) => n.clienteId === t && (!e || n.contrato === e));
  function KS(t) {
    if (!t) return null;
    let e = String(t).toLowerCase();
    return (
      Object.keys(di).find(
        (n) => e.includes(n) || di[n].toLowerCase().includes(e) || e.includes(di[n].toLowerCase()),
      ) || null
    );
  }
  var Yv = {
      cliente: (t) => t.cliente,
      area: (t) => t.area,
      contrato: (t) => t.contrato,
      status: (t) => t.status,
      prognostico: (t) => t.prognostico,
      mes: (t) => (t.mes !== void 0 ? $f[t.mes] : $f[t.ultimaMov.getMonth()]),
    },
    QS = (t) => (t.mes !== void 0 ? t.mes : t.ultimaMov.getMonth()) + 1;
  function Zv({
    metrica: t,
    cliente: e,
    area: n,
    status_bloqueio: o = "Ativo",
    dias_minimos_parado: i = 60,
    prognostico: a,
    contrato: r,
    mes_inicio: s,
    mes_fim: l,
  }) {
    let c = KS(e),
      d = (p) =>
        (!c || p.clienteId === c) &&
        (!n || p.area.toLowerCase() === String(n).toLowerCase()) &&
        (!r || p.contrato.toLowerCase().includes(String(r).toLowerCase())) &&
        (!s || QS(p) >= Number(s)) &&
        (!l || QS(p) <= Number(l));
    if (t === "valor_bloqueado" || t === "quantidade_bloqueios")
      return {
        linhas: Tn.filter((p) => d(p) && (o === "todos" || p.status === o)),
        valorDe: t === "valor_bloqueado" ? (p) => p.valorNum : () => 1,
        unidade: t === "valor_bloqueado" ? "BRL" : "quantidade",
        cli: c,
      };
    if (t === "valor_perdido" || t === "valor_devolvido") {
      let V12c = t === "valor_perdido" ? "perdido" : "devolvido";
      return {
        linhas: Tn.filter((p) => p[V12c] > 0 && p[V12c + "Em"])
          .map((p) => ({ ...p, mes: p[V12c + "Em"].getMonth() }))
          .filter(d),
        valorDe: (p) => p[V12c],
        unidade: "BRL",
        cli: c,
      };
    }
    if (t === "passivo_estimado")
      return {
        linhas: Se.filter((p) => d(p) && (!a || p.prognostico.toLowerCase() === String(a).toLowerCase())),
        valorDe: (p) => p.valorCausa,
        unidade: "BRL",
        cli: c,
      };
    if (t === "quantidade_processos" || t === "processos_parados")
      return {
        linhas: Se.filter((p) => d(p) && (t !== "processos_parados" || p.diasParado >= Number(i))),
        valorDe: () => 1,
        unidade: "quantidade",
        cli: c,
      };
    throw new Error(
      "M\xE9trica desconhecida. Use valor_bloqueado, quantidade_bloqueios, quantidade_processos, processos_parados ou passivo_estimado.",
    );
  }
  function $v(t, e, n) {
    let o = Yv[n];
    if (!o)
      throw new Error("agrupar_por inv\xE1lido. Use nenhum, cliente, area, contrato, status, prognostico ou mes.");
    let i = new Map();
    if (n === "mes") for (let r = 0; r <= Hn.getMonth(); r++) i.set($f[r], 0);
    for (let r of t) i.set(o(r), (i.get(o(r)) || 0) + e(r));
    let a = [...i].map(([r, s]) => ({ rotulo: r, valor: s }));
    return n !== "mes" && a.sort((r, s) => s.valor - r.valor), a;
  }
  function JS(t) {
    let { linhas: e, cli: n } = Zv({ ...t, prognostico: void 0 }),
      o = $o.filter(
        (r) =>
          (!n || r.clienteId === n) &&
          (!t.area || r.area.toLowerCase() === String(t.area).toLowerCase()) &&
          (!t.contrato || r.contrato.toLowerCase().includes(String(t.contrato).toLowerCase())),
      ),
      i = Xf(e, o),
      a = Zo.find((r) => t.prognostico && r.toLowerCase() === String(t.prognostico).toLowerCase()) || "total";
    return { hist: i, parte: a, cli: n };
  }
  function ra(t) {
    let { metrica: e, agrupar_por: n = "nenhum", area: o, status_bloqueio: i = "Ativo" } = t,
      { linhas: a, valorDe: r, unidade: s, cli: l } = Zv(t);
    if (e === "passivo_estimado" && n === "mes") {
      let { hist: p, parte: g } = JS(t);
      return {
        metrica: e,
        unidade: s,
        observacao: "passivo no fim de cada m\xEAs (evolu\xE7\xE3o)",
        filtros: { cliente: l ? di[l] : "todos", area: o || "todas" },
        total: p[p.length - 1][g],
        grupos: p.map((h) => ({ rotulo: h.mes, valor: h[g] })),
      };
    }
    let c = a.reduce((p, g) => p + r(g), 0),
      d = n && n !== "nenhum" ? $v(a, r, n) : [];
    return {
      metrica: e,
      unidade: s,
      filtros: { cliente: l ? di[l] : "todos", area: o || "todas", status_bloqueio: i },
      total: c,
      grupos: d,
    };
  }
  function o2(t) {
    let { agrupar_por: e, dividir_por: n } = t;
    if (!e || e === "nenhum" || !n) throw new Error("Informe agrupar_por e dividir_por.");
    let { linhas: o, valorDe: i, unidade: a } = Zv(t);
    if (t.metrica === "passivo_estimado" && e === "mes" && n === "prognostico") {
      let { hist: l } = JS(t);
      return {
        metrica: t.metrica,
        unidade: a,
        observacao: "passivo no fim de cada m\xEAs (evolu\xE7\xE3o)",
        partes: Zo,
        grupos: l.map((c) => ({ rotulo: c.mes, total: c.total, valores: Zo.map((d) => c[d]) })),
      };
    }
    let r = $v(o, i, e),
      s = n === "prognostico" ? ["Prov\xE1vel", "Poss\xEDvel", "Remoto"] : $v(o, i, n).map((l) => l.rotulo);
    return {
      metrica: t.metrica,
      unidade: a,
      partes: s,
      grupos: r.map((l) => {
        let c = o.filter((d) => Yv[e](d) === l.rotulo);
        return {
          rotulo: l.rotulo,
          total: l.valor,
          valores: s.map((d) => c.filter((p) => Yv[n](p) === d).reduce((p, g) => p + i(g), 0)),
        };
      }),
    };
  }
  function i2({ cliente: t, area: e, dias_minimos_parado: n = 0, apenas_com_bloqueio_ativo: o = !1, limite: i = 10 }) {
    let a = KS(t),
      r = (s) => Tn.filter((l) => l.processoId === s.id && l.status === "Ativo").reduce((l, c) => l + c.valorNum, 0);
    return Se.filter(
      (s) =>
        (!a || s.clienteId === a) &&
        (!e || s.area.toLowerCase() === String(e).toLowerCase()) &&
        s.diasParado >= Number(n) &&
        (!o || r(s) > 0),
    )
      .sort((s, l) => l.diasParado - s.diasParado)
      .slice(0, Math.min(Number(i) || 10, 25))
      .map((s) => ({
        numero: s.numero,
        cliente: s.cliente,
        contrato: s.contrato,
        area: s.area,
        descricao: s.desc,
        status: s.status,
        dias_parado: s.diasParado,
        valor_em_discussao: s.valorCausa,
        prognostico: s.prognostico,
        valor_bloqueado_ativo: r(s),
      }));
  }
  var a2 = [
      {
        id: "inicio",
        titulo: "Tudo come\xE7a no In\xEDcio",
        texto:
          "O cart\xE3o escuro mostra quanto est\xE1 bloqueado hoje em todos os clientes. Logo abaixo ficam quatro atalhos: Processos, Bloqueios, Passivo e Desempenho. A Reclama\xE7\xE3o constitucional vem numa linha logo depois.",
      },
      {
        id: "os",
        titulo: "Cada cliente, por contrato",
        texto:
          "Na aba Clientes, toque num cliente. A tela abre pelo passivo de cada contrato de gest\xE3o e, depois, pelos bloqueios e pelos processos.",
      },
      {
        id: "ia",
        titulo: "Pergunte com suas palavras",
        texto:
          "Na aba IA, escreva como falaria com um colega ou toque numa sugest\xE3o. A IA monta relat\xF3rios com gr\xE1ficos, e os n\xFAmeros v\xEAm sempre dos sistemas do escrit\xF3rio.",
      },
      {
        id: "pessoal",
        titulo: "Anota\xE7\xF5es e avisos s\xF3 seus",
        texto:
          "Em um processo ou contrato, voc\xEA pode segui-lo, escrever uma anota\xE7\xE3o que s\xF3 voc\xEA v\xEA e tocar em \u201CAvisar se\u2026\u201D para receber um alerta.",
      },
      {
        id: "perfil",
        titulo: "Do seu jeito",
        texto:
          "Em Perfil, voc\xEA aumenta a letra, liga o bot\xE3o Ouvir e escolhe o que aparece no In\xEDcio. Esta explica\xE7\xE3o fica l\xE1, em \u201CComo usar o app\u201D.",
      },
    ],
    RS = {
      inicio: "Passivo e Desempenho ganharam atalhos. Personalize em Perfil.",
      osLista: "Toque num cliente para ver o passivo de cada contrato de gest\xE3o, os bloqueios e os processos dele.",
      osPerfil: "O passivo total do cliente j\xE1 aparece aqui. Toque num contrato para ver o passivo dele.",
      passivo: "Passivo \xE9 o risco estimado pelo advogado. Bloqueado \xE9 o que j\xE1 saiu da conta.",
      desempenho: "Toque num indicador para trocar o gr\xE1fico, e num m\xEAs do gr\xE1fico para ver os n\xFAmeros.",
      contrato:
        "Aqui voc\xEA gera o PDF do passivo para enviar ao cliente e pode pedir um aviso se o passivo passar de um valor.",
      processo:
        "Toque em Seguir processo para receber as movimenta\xE7\xF5es novas. \u201CContar a hist\xF3ria do processo\u201D pede \xE0 IA um resumo por fases.",
    },
    Y1 = [
      {
        id: "passivo",
        pergunta: "O que \xE9 o passivo estimado?",
        resposta:
          "\xC9 a soma do valor em discuss\xE3o nos processos ativos de um contrato de gest\xE3o, separada pelo progn\xF3stico do escrit\xF3rio: prov\xE1vel, poss\xEDvel e remoto. Os bloqueios aparecem \xE0 parte, porque s\xE3o dinheiro que j\xE1 saiu da conta.",
        destino: "passivo",
        rotuloDestino: "Ver o passivo da carteira",
      },
      {
        id: "contrato",
        pergunta: "Onde vejo o passivo de cada contrato de gest\xE3o?",
        passos: [
          "Toque em Clientes, na barra de baixo.",
          "Escolha o cliente.",
          "Toque em Contratos de gest\xE3o, o primeiro cart\xE3o.",
        ],
        destino: "os",
        rotuloDestino: "Abrir a aba Clientes",
      },
      {
        id: "relatorio",
        pergunta: "Como mando o relat\xF3rio de passivo ao cliente?",
        passos: [
          "Abra o cliente na aba Clientes e toque em Contratos de gest\xE3o.",
          "Toque em Relat\xF3rio para o cliente (PDF).",
          "Confira a pr\xE9via, marque a confer\xEAncia e gere o PDF.",
        ],
        destino: "contratos",
        rotuloDestino: "Abrir os contratos de gest\xE3o",
      },
      {
        id: "alerta",
        pergunta: "Como pe\xE7o para ser avisada?",
        resposta:
          "Toque em \u201CAvisar se\u2026\u201D num processo (parado h\xE1 tantos dias), num contrato (passivo acima de um valor) ou nos bloqueios de um cliente (bloqueado acima de um valor). Tamb\xE9m d\xE1 para pedir \xE0 IA: \u201CMe avise se o bloqueado da AFNE passar de R$ 500 mil\u201D. Quando o limite \xE9 passado, chega uma notifica\xE7\xE3o.",
        destino: "alertas",
        rotuloDestino: "Ver meus alertas",
      },
      {
        id: "seguir",
        pergunta: "Como sigo um processo?",
        resposta:
          "Abra o processo e toque em Seguir processo. Os que voc\xEA segue ficam no atalho Sigo, no In\xEDcio, e as movimenta\xE7\xF5es novas chegam como notifica\xE7\xE3o.",
        destino: "acompanhando",
        rotuloDestino: "Ver os que eu sigo",
      },
      {
        id: "anotacao",
        pergunta: "Como fa\xE7o uma anota\xE7\xE3o s\xF3 minha?",
        resposta:
          "Num processo, contrato ou cliente, toque em Adicionar anota\xE7\xE3o pessoal. Ela fica num bloco bege no alto da tela. S\xF3 voc\xEA v\xEA: n\xE3o vai para o Legal One nem para a equipe.",
        destino: "org",
        rotuloDestino: "Abrir um cliente",
      },
      {
        id: "ia",
        pergunta: "Como pergunto \xE0 IA? Posso confiar nos n\xFAmeros?",
        resposta:
          "Na aba IA, escreva a pergunta como falaria com um colega ou toque numa sugest\xE3o. A IA n\xE3o inventa n\xFAmeros: ela consulta os dados do escrit\xF3rio, e o app desenha os gr\xE1ficos com esses dados. Toque num gr\xE1fico para ver o valor exato. Para guardar uma resposta, toque em Fixar: ela vai para Perfil \u2192 Relat\xF3rios fixados.",
        destino: "ia",
        rotuloDestino: "Abrir a IA",
      },
      {
        id: "leitura",
        pergunta: "Como aumento a letra ou ou\xE7o os textos?",
        resposta:
          "Em Perfil \u2192 Leitura, escolha Maior ou Muito maior. Ligue \u201COuvir os resumos da IA\u201D para aparecer o bot\xE3o Ouvir nas respostas.",
        destino: "perfil",
        rotuloDestino: "Abrir Perfil",
      },
      {
        id: "personalizar",
        pergunta: "Como mudo o que aparece no In\xEDcio?",
        resposta:
          "Em Perfil \u2192 Personalizar In\xEDcio, mostre, esconda ou mude a ordem dos blocos. A sauda\xE7\xE3o fica sempre no alto, e o primeiro bloco aparece em destaque, em carv\xE3o.",
        destino: "personalizar",
        rotuloDestino: "Personalizar o In\xEDcio",
      },
      {
        id: "buscar",
        pergunta: "Como acho um processo pelo n\xFAmero?",
        resposta:
          "Toque no atalho Processos, no In\xEDcio, e digite parte do n\xFAmero, o nome do cliente ou uma palavra da descri\xE7\xE3o.",
        destino: "processos",
        rotuloDestino: "Abrir Processos",
      },
      {
        id: "seguranca",
        pergunta: "Como protejo o app se perder o celular?",
        resposta:
          "Em Perfil \u2192 Seguran\xE7a, ligue Abrir com Face ID. O app passa a pedir o rosto sempre que abre. Ali tamb\xE9m d\xE1 para sair da conta.",
        destino: "seguranca",
        rotuloDestino: "Abrir Seguran\xE7a",
      },
      {
        id: "dados",
        pergunta: "De onde v\xEAm os dados?",
        resposta:
          "Dos relat\xF3rios do Legal One e do Log de Bloqueios do escrit\xF3rio, atualizados todos os dias, e das movimenta\xE7\xF5es do DataJud. O app s\xF3 mostra: nada do que voc\xEA faz aqui muda os sistemas. Neste prot\xF3tipo, os dados s\xE3o de exemplo.",
      },
    ],
    r2 = (t) => [t.resposta, ...(t.passos || []).map((e, n) => `${n + 1}. ${e}`)].filter(Boolean).join(" ");
  var zk = {
      not_granted:
        "A IA n\xE3o foi autorizada nesta visualiza\xE7\xE3o. Para usar, permita o acesso ao Claude no menu de permiss\xF5es do app.",
      sampling_disabled: "A IA n\xE3o est\xE1 dispon\xEDvel para esta conta.",
      rate_limited: "Muitas perguntas em pouco tempo. Espere um minuto e tente de novo.",
      session_expired: "Sua sess\xE3o expirou. Entre de novo no Claude e tente outra vez.",
      refused: "A IA n\xE3o respondeu a essa pergunta. Tente reformular.",
      invalid_json: "A resposta da IA veio num formato que o app n\xE3o conseguiu ler. Tente de novo.",
      empty_completion: "A IA n\xE3o trouxe resposta. Tente uma pergunta mais curta.",
      tools_unavailable: "Esta visualiza\xE7\xE3o n\xE3o permite que a IA consulte os dados.",
      prompt_too_large: "A pergunta ficou grande demais. Tente algo mais curto.",
    },
    l2 = (t) => zk[t?.code] || "N\xE3o foi poss\xEDvel falar com a IA agora. Tente de novo em instantes.",
    Fk = (t) => [
      {
        name: "consultar_dados",
        description:
          "Calcula uma m\xE9trica sobre a base do escrit\xF3rio e devolve o total e, se pedido, os grupos. Use SEMPRE esta fun\xE7\xE3o para obter qualquer n\xFAmero; nunca estime valores.",
        inputSchema: {
          type: "object",
          properties: {
            metrica: {
              type: "string",
              enum: [
                "valor_bloqueado",
                "quantidade_bloqueios",
                "quantidade_processos",
                "processos_parados",
                "passivo_estimado",
                "valor_perdido",
                "valor_devolvido",
              ],
              description:
                "passivo_estimado = soma do valor em discuss\xE3o dos processos (o passivo que os clientes perguntam), em BRL",
            },
            agrupar_por: {
              type: "string",
              enum: ["nenhum", "cliente", "area", "contrato", "status", "prognostico", "mes"],
              description:
                "mes = m\xEAs do bloqueio (ou da \xFAltima movimenta\xE7\xE3o, para processos), de Jan at\xE9 o m\xEAs atual de 2026. Com passivo_estimado, mes devolve a EVOLU\xC7\xC3O: o passivo no fim de cada m\xEAs (inclui processos encerrados no ano at\xE9 sa\xEDrem).",
            },
            cliente: { type: "string", description: "AFNE, Instituto Gnosis, FAS ou IGEDES. Omita para a firma toda." },
            area: { type: "string", enum: ["Trabalhista", "C\xEDvel", "Administrativo", "Constitucional"] },
            status_bloqueio: {
              type: "string",
              enum: ["Ativo", "Levantado", "todos"],
              description: "S\xF3 para m\xE9tricas de bloqueio. Padr\xE3o: Ativo.",
            },
            dias_minimos_parado: { type: "number", description: "S\xF3 para processos_parados. Padr\xE3o: 60." },
            prognostico: {
              type: "string",
              enum: ["Prov\xE1vel", "Poss\xEDvel", "Remoto"],
              description: "S\xF3 para passivo_estimado.",
            },
            contrato: {
              type: "string",
              description: "Parte do nome do \xF3rg\xE3o do contrato de gest\xE3o, ex.: Niter\xF3i.",
            },
            mes_inicio: {
              type: "number",
              description:
                "M\xEAs inicial (1 a 12) de 2026, pelo m\xEAs do bloqueio ou da \xFAltima movimenta\xE7\xE3o.",
            },
            mes_fim: { type: "number", description: "M\xEAs final (1 a 12) de 2026." },
          },
          required: ["metrica"],
        },
        execute: (e) => {
          let n =
              {
                valor_bloqueado: "valor bloqueado",
                quantidade_bloqueios: "bloqueios",
                quantidade_processos: "processos",
                processos_parados: "processos parados",
                passivo_estimado: "passivo estimado",
                valor_perdido: "valor perdido",
                valor_devolvido: "valor devolvido",
              }[e.metrica] || "dados",
            o =
              e.agrupar_por && e.agrupar_por !== "nenhum"
                ? ` por ${e.agrupar_por === "area" ? "\xE1rea" : e.agrupar_por === "mes" ? "m\xEAs" : e.agrupar_por}`
                : "";
          return t(`Consultando ${n}${o}${e.cliente ? ` de ${e.cliente}` : ""}`), ra(e);
        },
      },
      {
        name: "consultar_cruzado",
        description:
          "Como consultar_dados, mas em duas dimens\xF5es: para cada grupo de agrupar_por, o valor dividido por dividir_por (ex.: passivo por contrato dividido por progn\xF3stico). Devolve partes e, por grupo, total e valores.",
        inputSchema: {
          type: "object",
          properties: {
            metrica: {
              type: "string",
              enum: [
                "valor_bloqueado",
                "quantidade_bloqueios",
                "quantidade_processos",
                "processos_parados",
                "passivo_estimado",
                "valor_perdido",
                "valor_devolvido",
              ],
            },
            agrupar_por: { type: "string", enum: ["cliente", "area", "contrato", "status", "prognostico", "mes"] },
            dividir_por: { type: "string", enum: ["cliente", "area", "contrato", "status", "prognostico"] },
            cliente: { type: "string" },
            area: { type: "string" },
            contrato: { type: "string" },
            status_bloqueio: { type: "string", enum: ["Ativo", "Levantado", "todos"] },
          },
          required: ["metrica", "agrupar_por", "dividir_por"],
        },
        execute: (e) => (
          t(`Cruzando ${e.agrupar_por} por ${e.dividir_por}${e.cliente ? ` de ${e.cliente}` : ""}`), o2(e)
        ),
      },
      {
        name: "listar_processos",
        description:
          "Lista processos (at\xE9 25) ordenados pelos mais parados, com n\xFAmero, cliente, \xE1rea, status, dias parado e valor bloqueado ativo. Use para tabelas de processos espec\xEDficos.",
        inputSchema: {
          type: "object",
          properties: {
            cliente: { type: "string" },
            area: { type: "string", enum: ["Trabalhista", "C\xEDvel", "Administrativo", "Constitucional"] },
            dias_minimos_parado: { type: "number" },
            apenas_com_bloqueio_ativo: { type: "boolean" },
            limite: { type: "number" },
          },
        },
        execute: (e) => (t(`Listando processos${e.cliente ? ` de ${e.cliente}` : ""}`), i2(e)),
      },
    ];
  function Mk(t) {
    let e = t
      ? `
Esta conversa come\xE7ou na p\xE1gina da organiza\xE7\xE3o ${di[t]}: filtre as consultas por cliente = "${di[t]}", a menos que a s\xF3cia pe\xE7a outra coisa.`
      : "";
    return `Voc\xEA \xE9 o analista de dados do app interno dos s\xF3cios do escrit\xF3rio Azevedo dos Reis Advogados & Associados (Direito do Terceiro Setor: organiza\xE7\xF5es sociais com contratos de gest\xE3o com o poder p\xFAblico). Converse com a s\xF3cia como o Claude conversa no celular: an\xE1lise de verdade, clara e bem organizada. Ela tem dificuldade de ver de perto, ent\xE3o escreva para leitura f\xE1cil.

DADOS
- A base cobre ${ir.processos} processos e ${Tn.length} bloqueios SISBAJUD de 4 clientes (AFNE, Instituto Gnosis, FAS, IGEDES), cada um com contratos de gest\xE3o, com dados de 2026 at\xE9 outubro. Hoje \xE9 06/10/2026. S\xE3o dados de exemplo.
- Todo n\xFAmero que voc\xEA escrever tem de vir das fun\xE7\xF5es consultar_dados, consultar_cruzado ou listar_processos. Nunca invente nem estime. Pode calcular percentuais e diferen\xE7as a partir do que as fun\xE7\xF5es devolverem.
- Para "o passivo subiu ou caiu?", use passivo_estimado com agrupar_por "mes" (evolu\xE7\xE3o m\xEAs a m\xEAs) e desenhe em "linha" ou "empilhado" com dividir_por "prognostico".
- Passivo de um contrato de gest\xE3o = metrica passivo_estimado (valor em discuss\xE3o nos processos, por progn\xF3stico Prov\xE1vel/Poss\xEDvel/Remoto). N\xE3o confunda com valor bloqueado (o que j\xE1 saiu da conta).
- Valor perdido = metrica valor_perdido (dinheiro bloqueado que foi transferido ao credor e n\xE3o volta ao cliente). Valor devolvido = metrica valor_devolvido (liberado de volta ao cliente, inclusive desbloqueios parciais). As duas contam pelo m\xEAs em que aconteceram; use-as quando perguntarem quanto o cliente perdeu ou recuperou.
- Se pedirem algo que a base n\xE3o tem (prazos, honor\xE1rios, partes, outros anos), diga com clareza e ofere\xE7a o que d\xE1 para mostrar.
- Fa\xE7a quantas consultas precisar, em geral de 3 a 8.
- Se a s\xF3cia pedir para ser avisada (bloqueio de um cliente passar de um valor, passivo de um contrato passar de um valor, processo ficar parado X dias), use criar_alerta e confirme em uma frase o que foi criado. Alertas ficam em Perfil \u2192 Meus alertas.

FORMATO DA RESPOSTA (Markdown)
1. Comece com **Resumo:** e 2 ou 3 frases com a resposta direta e o n\xFAmero principal.
2. Depois, um bloco de n\xFAmeros-chave (indicadores), quando houver mais de um n\xFAmero importante.
3. Se\xE7\xF5es com t\xEDtulos curtos (###), cada uma com 1 gr\xE1fico quando ajudar e 1 ou 2 frases dizendo o que o gr\xE1fico mostra. Use listas para pontos de aten\xE7\xE3o.
4. Termine com ### Pr\xF3ximos passos (2 ou 3 sugest\xF5es pr\xE1ticas de acompanhamento, sem prever resultado de processo nem valor de condena\xE7\xE3o).
5. Por \xFAltimo, um bloco de sugest\xF5es com 2 ou 3 perguntas curtas para aprofundar.
Tamanho: o necess\xE1rio para responder bem. Pergunta simples, resposta curta; pergunta de an\xE1lise, relat\xF3rio completo. Portugu\xEAs do Brasil, sem jarg\xE3o de sistema, sem emojis.

GR\xC1FICOS: voc\xEA n\xE3o escreve os n\xFAmeros do gr\xE1fico. Escreve QUAL consulta o app deve desenhar, num bloco cercado assim:
\`\`\`grafico
{"tipo": "barras", "titulo": "Passivo por contrato de gest\xE3o", "consulta": {"metrica": "passivo_estimado", "cliente": "AFNE", "agrupar_por": "contrato"}}
\`\`\`
Tipos:
- "barras": comparar categorias. "consulta" com agrupar_por. Para comparar at\xE9 3 recortes lado a lado, use "series": [{"rotulo": "AFNE", "consulta": {...}}, {"rotulo": "FAS", "consulta": {...}}] com o mesmo agrupar_por.
- "linha": evolu\xE7\xE3o por m\xEAs. agrupar_por "mes". Tamb\xE9m aceita "series".
- "empilhado": cada grupo dividido em partes. "consulta" com agrupar_por e dividir_por (ex.: contrato dividido por prognostico).
- "indicadores": at\xE9 4 n\xFAmeros-chave. "itens": [{"rotulo": "Bloqueado em setembro", "consulta": {...}, "comparar_com": {...}, "comparacao": "vs. agosto", "bom_quando": "desce"}]. comparar_com e bom_quando s\xE3o opcionais; bom_quando \xE9 "sobe" ou "desce" (bloqueio e passivo: desce \xE9 bom).
- "tabela": lista de processos. "processos": par\xE2metros de listar_processos.
As consultas usam exatamente os par\xE2metros das fun\xE7\xF5es (metrica, agrupar_por, dividir_por, cliente, area, contrato, status_bloqueio, prognostico, mes_inicio, mes_fim, dias_minimos_parado). Use no m\xE1ximo 4 gr\xE1ficos por resposta.

COMO USAR O APP: se a s\xF3cia perguntar como fazer algo no pr\xF3prio app, responda em passos curtos e numerados com base no guia abaixo, sem consultar dados, sem gr\xE1ficos e sem o formato de relat\xF3rio (sem Resumo nem Pr\xF3ximos passos). Termine dizendo que o passo a passo tamb\xE9m est\xE1 em Perfil \u2192 Como usar o app. Se o guia n\xE3o cobrir, diga que n\xE3o sabe em vez de inventar um caminho.
${Y1.map((n) => `- ${n.pergunta} ${r2(n)}`).join(`
`)}

CART\xD5ES DE PROCESSOS: quando a resposta apontar processos espec\xEDficos que a s\xF3cia pode querer acompanhar (bloqueios ativos, processos parados, os de maior valor), coloque antes das sugest\xF5es um bloco assim, com at\xE9 6 n\xFAmeros CNJ que vieram de listar_processos:
\`\`\`acoes
{"titulo": "Processos para acompanhar", "processos": ["0000000-00.2026.5.01.0000"]}
\`\`\`
O app mostra cada processo num cart\xE3o com os dados da base e deixa a s\xF3cia seguir o processo ou criar um aviso. N\xE3o repita os mesmos processos numa tabela.

SUGEST\xD5ES no fim, assim:
\`\`\`sugestoes
["E s\xF3 os processos trabalhistas?", "Compare com a FAS"]
\`\`\`${e}`;
  }
  function Dk(t, e) {
    let n = t
      .filter((o) => o.text && o.text.trim() && !(o.role === "assistant" && o.status === "erro"))
      .map((o) => ({ role: o.role, content: o.text }))
      .slice(-12);
    for (; n.length && n[0].role !== "user"; ) n.shift();
    return [{ role: "user", content: Mk(e) }, ...n];
  }
  async function ew(t, e, { clienteId: n, onText: o, onProgress: i, signal: a, ferramentasExtras: r = [] }) {
    let { text: s, truncated: l } = await t(Dk(e, n), {
      tools: [...Fk(i), ...r],
      signal: a,
      onText: o,
      modelTier: "default",
    });
    return { text: s, truncated: l };
  }
  var Rk = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  function qw(t) {
    if (t !== "2026") return null;
    let e = Hn,
      n = e.getMonth(),
      o = Se.length,
      i = Se.filter((h) => h.entradaMes >= 0).length,
      a = $o.length,
      r = o - i + a,
      s = [],
      l = r,
      c = 0,
      d = 0,
      p = 0,
      g = 0;
    for (let h = 0; h <= n; h++) {
      let S = Se.filter((_) => _.entradaMes === h).length,
        N = $o.filter((_) => _.saiuMes === h),
        E = N.filter((_) => _.resultado === "Favor\xE1vel" || _.resultado === "Acordo").length;
      (l += S - N.length), (g += N.length), (p += E);
      let b = Tn.filter(
          (_) =>
            _.status === "Levantado" &&
            _.liberadoEm &&
            _.liberadoEm.getFullYear() === 2026 &&
            _.liberadoEm.getMonth() === h,
        ),
        w = N.reduce((_, Y) => _ + Y.valorCausa, 0),
        A = N.reduce((_, Y) => _ + Y.valorRevertido, 0);
      (d += w),
        (c += A),
        s.push({
          mes: `2026-${String(h + 1).padStart(2, "0")}`,
          rotulo: Rk[h],
          novos: S,
          encerrados: N.length,
          carteira: l,
          favoraveis: E,
          indiceAcumulado: g ? Math.round((p / g) * 100) : null,
          levantadoValor: b.reduce((_, Y) => _ + (Y.devolvido || 0), 0),
          levantadoQtd: b.filter((Y) => Y.devolvido > 0).length,
          emDiscussao: w,
          revertido: A,
          mantido: w - A,
          revertidoAcumulado: d ? Math.round((c / d) * 100) : null,
        });
    }
    return {
      periodo: {
        de: "2026-01-01",
        ate: `2026-${String(n + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}`,
      },
      carteiraInicial: r,
      carteiraHoje: o,
      meses: s,
    };
  }
  function Iw(t) {
    let e = t.meses.reduce((o, i) => o + i.novos, 0),
      n = t.meses.reduce((o, i) => o + i.encerrados, 0);
    return { novos: e, encerrados: n, saldo: e - n };
  }
  function jw() {
    let t = Tn.filter((o) => o.status === "Levantado" && o.liberadoEm && o.devolvido > 0),
      e = t.reduce((o, i) => o + i.devolvido, 0),
      n = t.length ? Math.round(t.reduce((o, i) => o + Math.round((i.liberadoEm - i.data) / 864e5), 0) / t.length) : 0;
    return { qtd: t.length, valor: e, diasMedio: n };
  }
  function Uw(t) {
    let e = t.meses.reduce((o, i) => o + i.emDiscussao, 0),
      n = t.meses.reduce((o, i) => o + i.revertido, 0);
    return { emDiscussao: e, revertido: n, mantido: e - n, pct: e ? Math.round((n / e) * 100) : 0 };
  }
  function Pw(t, e) {
    return t === "area"
      ? Object.keys(e2)
          .filter((o) => o !== "Constitucional")
          .map((o) => ({
            id: o,
            nome: o,
            novos: Se.filter((i) => i.area === o && i.entradaMes >= 0).length,
            encerrados: $o.filter((i) => i.area === o).length,
            emDiscussao: $o.filter((i) => i.area === o).reduce((i, a) => i + a.valorCausa, 0),
            revertido: $o.filter((i) => i.area === o).reduce((i, a) => i + a.valorRevertido, 0),
          }))
          .filter((o) => o.novos || o.encerrados)
      : [...new Set(Se.map((o) => o.clienteId))]
          .map((o) => ({
            id: o,
            nome: e[o],
            novos: Se.filter((i) => i.clienteId === o && i.entradaMes >= 0).length,
            encerrados: $o.filter((i) => i.clienteId === o).length,
            emDiscussao: $o.filter((i) => i.clienteId === o).reduce((i, a) => i + a.valorCausa, 0),
            revertido: $o.filter((i) => i.clienteId === o).reduce((i, a) => i + a.valorRevertido, 0),
          }))
          .filter((o) => o.novos || o.encerrados);
  }
return {nc,Zf,Hn,$f,Xt,bn,Co,Lr,GS,H1,Hv,YS,fe,ti,di,Ak,e2,Se,Tn,$o,ir,Ek,za,Zo,n2,Tk,Ws,aa,Xf,XS,ac,KS,ra,o2,i2,Zv,$v,zk,l2,Fk,Mk,Dk,ew,qw,Iw,jw,Uw,Pw,V10contas,V12data,V12mesLongo,V12fmt,Y1,Vv};
})();