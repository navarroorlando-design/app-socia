import React, { useState } from "react";
import { StatusBar, TabBar } from "./componentes/ui";
import { BLOQUEIOS_LISTA, CLIENTE_NOME, ORG_ORDER, PROCESSOS_LISTA } from "./dados/base";
import { GlobalStyle } from "./estilo/GlobalStyle";
import { T, tomDeStatus } from "./estilo/tokens";
import { PINNED_INICIAIS, erroTexto, gerarRelatorio, useSample } from "./ia/motor";
import { PrefsContext, gravarPref, lerPref } from "./preferencias";
import { BloqueioDetalhe } from "./telas/BloqueioDetalhe";
import { BuscaGlobal } from "./telas/BuscaGlobal";
import { GuiaEstilo } from "./telas/GuiaEstilo";
import { IaAsk, IaReport, PastaRelatorios } from "./telas/Ia";
import { AcompanhandoLista, InicioFeed, ListaGenerica } from "./telas/Inicio";
import { INITIAL_NOTIFS, NotifPrefs, NotificacoesCentral } from "./telas/Notificacoes";
import { OsLista, OsPerfil } from "./telas/Organizacoes";
import { MenuVA, OrdemClientes, PerfilUsuaria } from "./telas/Perfil";
import { ProcessoDetalhe } from "./telas/ProcessoDetalhe";

function AppSociosPrototype() {
  const sample = useSample();
  const abrirGuia = typeof location !== "undefined" && location.hash === "#guia";
  const [tab, setTab] = useState(abrirGuia ? "perfil" : "inicio");
  const [inicioView, setInicioView] = useState("feed");
  const [osView, setOsView] = useState("list");
  const [selectedOrg, setSelectedOrg] = useState("afne");
  const [iaView, setIaView] = useState("ask");
  const [perfilView, setPerfilView] = useState(abrirGuia ? "guia" : "main");

  const [followed, setFollowed] = useState(new Set(["p1", "p2", "p4"]));
  const [selectedProcesso, setSelectedProcesso] = useState(null);
  const [detalheOrigin, setDetalheOrigin] = useState("processos");
  const toggleFollow = (id) => setFollowed((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBloqueio, setSelectedBloqueio] = useState(null);
  const [bloqueioOrigin, setBloqueioOrigin] = useState("bloqueios");

  const [pinned, setPinned] = useState(PINNED_INICIAIS);
  const [job, setJob] = useState(null);
  const ctlRef = React.useRef(null);

  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);
  const [foto, setFotoS] = useState(() => lerPref("foto", null));
  const [apelido, setApelidoS] = useState(() => lerPref("apelido", ""));
  const [escala, setEscalaS] = useState(() => lerPref("escala", 1));
  const [lerVoz, setLerVozS] = useState(() => lerPref("lerVoz", false));
  const [ordem, setOrdemS] = useState(() => { const o = lerPref("ordem", ORG_ORDER); return Array.isArray(o) && o.length === ORG_ORDER.length ? o : ORG_ORDER; });
  const [menuVA, setMenuVA] = useState(false);
  const comPersistencia = (set, chave) => (v) => { set(v); gravarPref(chave, v); };
  const setFoto = comPersistencia(setFotoS, "foto"), setApelido = comPersistencia(setApelidoS, "apelido"),
        setEscala = comPersistencia(setEscalaS, "escala"), setLerVoz = comPersistencia(setLerVozS, "lerVoz"), setOrdem = comPersistencia(setOrdemS, "ordem");
  const unreadCount = notifs.filter((n) => !n.read).length;

  const openProcesso = (item, origin) => { setTab("inicio"); setSelectedProcesso(item); setDetalheOrigin(origin); setInicioView("detalhe"); };
  const openBloqueio = (item, origin) => { setTab("inicio"); setSelectedBloqueio(item); setBloqueioOrigin(origin); setInicioView("bloqueio"); };
  const backLabels = { feed: "Início", processos: "Processos", bloqueios: "Bloqueios", acompanhando: "Acompanhando", busca: "Busca", bloqueio: "Bloqueio", notificacoes: "Notificações" };
  const followedItemsFull = PROCESSOS_LISTA.filter((p) => followed.has(p.id));

  const changeTab = (t) => {
    setTab(t);
    if (t === "inicio") setInicioView("feed");
    if (t === "os") setOsView("list");
    if (t === "ia") setIaView("ask");
    if (t === "perfil") setPerfilView("main");
  };
  const openOrg = (id) => { setSelectedOrg(id); setTab("os"); setOsView("profile"); };

  /* ---- IA ---- */
  const ask = async (question, clienteId = null, extra = {}) => {
    ctlRef.current?.abort();
    const ctl = new AbortController();
    ctlRef.current = ctl;
    const id = "r" + Date.now();
    const base = { id, question, clienteId, status: "thinking", progress: [], spec: null, backLabel: clienteId ? CLIENTE_NOME[clienteId] : "Estatísticas", backTo: clienteId ? "os" : "ia", ...extra };
    setJob(base);
    setTab("ia"); setIaView("report");
    if (!sample) { setJob({ ...base, status: "error", error: "A IA responde quando este app é aberto no Claude.", retryable: false }); return; }
    try {
      const spec = await gerarRelatorio(sample, question, {
        clienteId, signal: ctl.signal,
        onProgress: (p) => setJob((j) => (j && j.id === id ? { ...j, progress: [...j.progress, p] } : j)),
      });
      setJob((j) => (j && j.id === id ? { ...j, status: "done", spec, atualizado: "Gerado agora pela IA" } : j));
      if (extra.pinId) setPinned((ps) => ps.map((p) => (p.id === extra.pinId ? { ...p, spec, atualizado: "Atualizado agora pela IA", pinnedExample: false } : p)));
    } catch (e) {
      if (e?.code === "cancelled") { setJob((j) => (j && j.id === id ? { ...j, status: "error", error: "Você parou esta pergunta.", retryable: true } : j)); return; }
      setJob((j) => (j && j.id === id ? { ...j, status: "error", error: erroTexto(e), retryable: !["not_granted", "sampling_disabled", "tools_unavailable"].includes(e?.code) } : j));
    }
  };

  const openPinned = (p, from = "pasta") => {
    const backs = { pasta: "Relatórios fixados", notificacoes: "Notificações" };
    setJob({ id: p.id, question: p.question, clienteId: p.clienteId || null, status: "done", spec: p.spec, progress: [], atualizado: p.atualizado, pinnedExample: p.pinnedExample, pinId: p.id, backLabel: backs[from], backTo: from });
    setTab("ia"); setIaView("report");
  };
  const jobPinId = job ? (job.pinId || pinned.find((p) => p.sourceJob === job.id)?.id) : null;
  const togglePinJob = () => {
    if (!job) return;
    if (jobPinId) { setPinned((ps) => ps.filter((p) => p.id !== jobPinId)); setJob((j) => ({ ...j, pinId: null })); return; }
    const pin = { id: "pin-" + job.id, sourceJob: job.id, question: job.question, clienteId: job.clienteId, spec: job.spec, atualizado: "Fixado agora" };
    setPinned((ps) => [pin, ...ps]);
    setJob((j) => ({ ...j, pinId: pin.id }));
  };

  const openNotif = (n) => {
    setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    const { kind, id } = n.target;
    if (kind === "processo") openProcesso(PROCESSOS_LISTA.find((p) => p.id === id), "notificacoes");
    if (kind === "bloqueio") openBloqueio(BLOQUEIOS_LISTA.find((b) => b.id === id), "notificacoes");
    if (kind === "report") { const p = pinned.find((x) => x.id === id); if (p) openPinned(p, "notificacoes"); }
    if (kind === "org") openOrg(id);
    if (kind === "acompanhando") setInicioView("acompanhando");
  };

  const tomTopo =
    tab === "ia" ? null :
    tab === "perfil" ? (perfilView === "guia" ? null : "marinho") :
    tab === "os" ? "marinho" :
    inicioView === "busca" ? null :
    inicioView === "detalhe" && selectedProcesso ? tomDeStatus(selectedProcesso.status) :
    inicioView === "bloqueio" && selectedBloqueio ? tomDeStatus(selectedBloqueio.status) :
    "marinho";

  const showTabBar =
    (tab === "inicio" && inicioView === "feed") ||
    (tab === "os" && osView === "list") ||
    (tab === "ia" && iaView === "ask") ||
    (tab === "perfil" && perfilView === "main");

  return (
    <div className="app-stage font-sans-ui">
      <GlobalStyle />
      <div className="app-phone relative flex flex-col overflow-hidden" style={{ background: T.paper, color: T.ink }}>
        <div className="app-island absolute left-1/2 -translate-x-1/2 top-3 w-[110px] h-[30px] rounded-full z-20" style={{ background: T.ink }} />
        <PrefsContext.Provider value={{ lerVoz }}>
        <div className="absolute inset-0 flex flex-col" style={{ zoom: escala }}>
        <StatusBar />

        {tab === "inicio" && inicioView === "feed" && (
          <InicioFeed
            onOpenList={setInicioView}
            onOpenOrg={openOrg}
            followedItems={followedItemsFull}
            onOpenProcesso={openProcesso}
            onOpenAcompanhando={() => setInicioView("acompanhando")}
            onOpenBusca={() => setInicioView("busca")}
            onOpenMenu={() => setMenuVA(true)}
            onPerguntar={() => changeTab("ia")}
            unreadCount={unreadCount}
            foto={foto}
            apelido={apelido}
          />
        )}
        {tab === "inicio" && inicioView === "notificacoes" && (
          <NotificacoesCentral notifs={notifs} onOpen={openNotif}
            onMarkAll={() => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))}
            onBack={() => setInicioView("feed")} />
        )}
        {tab === "inicio" && ["processos", "bloqueios", "reclamacoes"].includes(inicioView) && (
          <ListaGenerica tipo={inicioView} onBack={() => setInicioView("feed")} followed={followed}
                         onOpenProcesso={openProcesso} onOpenBloqueio={openBloqueio} />
        )}
        {tab === "inicio" && inicioView === "busca" && (
          <BuscaGlobal q={searchQuery} setQ={setSearchQuery}
            onBack={() => { setSearchQuery(""); setInicioView("feed"); }}
            onOpenProcesso={(p) => openProcesso(p, "busca")}
            onOpenBloqueio={(b) => openBloqueio(b, "busca")}
            onOpenOrg={openOrg} />
        )}
        {tab === "inicio" && inicioView === "bloqueio" && selectedBloqueio && (
          <BloqueioDetalhe bloqueio={selectedBloqueio} backLabel={backLabels[bloqueioOrigin]}
            onBack={() => setInicioView(bloqueioOrigin)}
            onOpenProcesso={(p) => openProcesso(p, "bloqueio")} />
        )}
        {tab === "inicio" && inicioView === "acompanhando" && (
          <AcompanhandoLista items={followedItemsFull} onOpen={(item) => openProcesso(item, "acompanhando")} onBack={() => setInicioView("feed")} />
        )}
        {tab === "inicio" && inicioView === "detalhe" && selectedProcesso && (
          <ProcessoDetalhe key={selectedProcesso.id} processo={selectedProcesso} sample={sample}
            isFollowing={followed.has(selectedProcesso.id)}
            onToggleFollow={() => toggleFollow(selectedProcesso.id)}
            onBack={() => setInicioView(detalheOrigin)}
            backLabel={backLabels[detalheOrigin]} />
        )}

        {tab === "os" && osView === "list" && <OsLista onOpenOrg={openOrg} ordem={ordem} />}
        {tab === "os" && osView === "profile" && (
          <OsPerfil orgId={selectedOrg} onBack={() => setOsView("list")} sample={sample} onAsk={(q) => ask(q, selectedOrg)} />
        )}

        {tab === "ia" && iaView === "ask" && <IaAsk onAsk={(q) => ask(q)} sample={sample} />}
        {tab === "ia" && iaView === "report" && job && (
          <IaReport job={job} isPinned={!!jobPinId} onTogglePin={togglePinJob}
            onStop={() => ctlRef.current?.abort()}
            onRetry={() => ask(job.question, job.clienteId)}
            onRefresh={sample ? () => ask(job.question, job.clienteId, { pinId: job.pinId }) : null}
            onBack={() => {
              ctlRef.current?.abort();
              if (job.backTo === "os") { setTab("os"); setOsView("profile"); }
              else if (job.backTo === "pasta") { setTab("perfil"); setPerfilView("pasta"); }
              else if (job.backTo === "notificacoes") { setTab("inicio"); setInicioView("notificacoes"); }
              else setIaView("ask");
            }} />
        )}

        {tab === "perfil" && perfilView === "main" && <PerfilUsuaria onOpenNotifPrefs={() => setPerfilView("notif")} onOpenPasta={() => setPerfilView("pasta")} pinnedCount={pinned.length} onOpenGuia={() => setPerfilView("guia")}
            onOpenOrdem={() => setPerfilView("ordem")} foto={foto} setFoto={setFoto} apelido={apelido} setApelido={setApelido}
            escala={escala} setEscala={setEscala} lerVoz={lerVoz} setLerVoz={setLerVoz} />}
        {tab === "perfil" && perfilView === "ordem" && <OrdemClientes ordem={ordem} setOrdem={setOrdem} onBack={() => setPerfilView("main")} />}
        {tab === "perfil" && perfilView === "guia" && <GuiaEstilo onBack={() => setPerfilView("main")} />}
        {tab === "perfil" && perfilView === "pasta" && <PastaRelatorios pinned={pinned} onOpenPinned={(p) => openPinned(p, "pasta")} onBack={() => setPerfilView("main")} />}
        {tab === "perfil" && perfilView === "notif" && <NotifPrefs onBack={() => setPerfilView("main")} />}

        {showTabBar && <TabBar active={tab} onChange={changeTab} />}
        {menuVA && (
          <MenuVA unread={unreadCount} followedCount={followed.size} foto={foto} apelido={apelido} onClose={() => setMenuVA(false)}
            onNotificacoes={() => { setMenuVA(false); setTab("inicio"); setInicioView("notificacoes"); }}
            onAcompanhando={() => { setMenuVA(false); setTab("inicio"); setInicioView("acompanhando"); }}
            onPerfil={() => { setMenuVA(false); changeTab("perfil"); }} />
        )}
        </div>
        </PrefsContext.Provider>
      </div>
    </div>
  );
}
export default AppSociosPrototype;
