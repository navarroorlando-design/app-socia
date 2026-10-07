import React, { useState } from "react";
import { StatusBar, TabBar } from "./componentes/ui";
import { BLOQUEIOS_LISTA, CLIENTE_NOME, ORGS, ORG_ORDER, PROCESSOS_LISTA, RECLAMACOES_LISTA } from "./dados/base";
import { GlobalStyle } from "./estilo/GlobalStyle";
import { T, tomDeStatus } from "./estilo/tokens";
import { PINNED_INICIAIS, conversar, erroTexto, useSample } from "./ia/motor";
import { PrefsContext, gravarPref, lerPref } from "./preferencias";
import { BloqueioDetalhe } from "./telas/BloqueioDetalhe";
import { BuscaGlobal } from "./telas/BuscaGlobal";
import { GuiaEstilo } from "./telas/GuiaEstilo";
import { IaAsk, IaConversa, PastaRelatorios } from "./telas/Ia";
import { AcompanhandoLista, InicioFeed, ListaGenerica } from "./telas/Inicio";
import { INITIAL_NOTIFS, NotifPrefs, NotificacoesCentral } from "./telas/Notificacoes";
import { OsLista, OsPerfil } from "./telas/Organizacoes";
import { BloqueiosOrg, ContratoDetalhe, ContratosOrg, ProcessosOrg } from "./telas/OrgMetricas";
import { Carteira, Movimentacoes } from "./telas/Carteira";
import { ReclamacaoDetalhe, ReclamacoesTela } from "./telas/Reclamacoes";
import { RelatorioCliente } from "./telas/RelatorioCliente";
import { AvisoSemInternet, Bloqueio, FluxoEntrada, Seguranca, useConexao } from "./telas/Entrada";
import { MenuVA, OrdemClientes, PerfilUsuaria } from "./telas/Perfil";
import { ProcessoDetalhe } from "./telas/ProcessoDetalhe";

function AppSociosPrototype() {
  const sample = useSample();
  const abrirGuia = typeof location !== "undefined" && location.hash === "#guia";
  const [tab, setTab] = useState(abrirGuia ? "perfil" : "inicio");
  const [inicioView, setInicioView] = useState("feed");
  const [osView, setOsView] = useState("list");
  const [selectedOrg, setSelectedOrg] = useState("afne");
  // Telas da organização: contratos, contrato, bloqueios, processos e os detalhes abertos a partir delas.
  const [selectedContrato, setSelectedContrato] = useState(null);
  const [contratoOrigin, setContratoOrigin] = useState("profile");
  const [osDetalheOrigin, setOsDetalheOrigin] = useState("profile");
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
  const [selectedReclamacao, setSelectedReclamacao] = useState(null);
  const [reclamacaoOrigin, setReclamacaoOrigin] = useState("reclamacoes");

  const [pinned, setPinned] = useState(PINNED_INICIAIS);
  // Conversa com a IA: { id, clienteId, backTo, backLabel, msgs: [{ role, text, status, progress, error }] }
  const [conversa, setConversa] = useState(null);
  const ctlRef = React.useRef(null);

  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);
  const [foto, setFotoS] = useState(() => lerPref("foto", null));
  const [apelido, setApelidoS] = useState(() => lerPref("apelido", ""));
  const [escala, setEscalaS] = useState(() => lerPref("escala", 1));
  const [lerVoz, setLerVozS] = useState(() => lerPref("lerVoz", false));
  const [ordem, setOrdemS] = useState(() => { const o = lerPref("ordem", ORG_ORDER); return Array.isArray(o) && o.length === ORG_ORDER.length ? o : ORG_ORDER; });
  const [menuVA, setMenuVA] = useState(false);
  // Entrada (login simulado, Face ID) e conexão
  const [acesso, setAcessoS] = useState(() => lerPref("acesso", { entrou: false, faceId: false }));
  const setAcesso = (a) => { setAcessoS(a); gravarPref("acesso", a); };
  const [bloqueado, setBloqueado] = useState(() => !!(acesso.entrou && acesso.faceId));
  const [semInternetSim, setSemInternetSim] = useState(false);
  const online = useConexao(semInternetSim);
  const [desde] = useState(() => new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
  const [relatorioOrgao, setRelatorioOrgao] = useState(null);
  const [recorteLista, setRecorteLista] = useState("todos");
  const [relatorioOrigin, setRelatorioOrigin] = useState("contratos");
  const comPersistencia = (set, chave) => (v) => { set(v); gravarPref(chave, v); };
  const setFoto = comPersistencia(setFotoS, "foto"), setApelido = comPersistencia(setApelidoS, "apelido"),
        setEscala = comPersistencia(setEscalaS, "escala"), setLerVoz = comPersistencia(setLerVozS, "lerVoz"), setOrdem = comPersistencia(setOrdemS, "ordem");
  const unreadCount = notifs.filter((n) => !n.read).length;

  const openProcesso = (item, origin) => { setTab("inicio"); setSelectedProcesso(item); setDetalheOrigin(origin); setInicioView("detalhe"); };
  const openBloqueio = (item, origin) => { setTab("inicio"); setSelectedBloqueio(item); setBloqueioOrigin(origin); setInicioView("bloqueio"); };
  const openReclamacao = (item, origin) => { setTab("inicio"); setSelectedReclamacao(item); setReclamacaoOrigin(origin); setInicioView("reclamacao"); };
  const backLabels = { feed: "Início", processos: "Processos", bloqueios: "Bloqueios", acompanhando: "Acompanhando", busca: "Busca", bloqueio: "Bloqueio", notificacoes: "Notificações", movimentacoes: "Movimentações", reclamacoes: "Reclamações", reclamacao: "Reclamação" };
  const followedItemsFull = PROCESSOS_LISTA.filter((p) => followed.has(p.id));

  const changeTab = (t) => {
    setTab(t);
    if (t === "inicio") setInicioView("feed");
    if (t === "os") setOsView("list");
    if (t === "ia") setIaView(conversa && !conversa.backTo ? "conversa" : "ask");
    if (t === "perfil") setPerfilView("main");
  };
  const openOrg = (id) => { setSelectedOrg(id); setTab("os"); setOsView("profile"); };
  const openContrato = (orgao, origem) => { setSelectedContrato(orgao); setContratoOrigin(origem); setOsView("contrato"); };
  const openOsDetalhe = (tipo, item, origem) => {
    if (tipo === "processo") setSelectedProcesso(item); else setSelectedBloqueio(item);
    setOsDetalheOrigin(origem); setOsView(tipo);
  };
  const osLabels = { profile: ORGS[selectedOrg]?.name, contratos: "Contratos de gestão", contrato: selectedContrato, bloqueios: "Bloqueios", processos: "Processos", bloqueio: "Bloqueio", reclamacoes: "Reclamações", reclamacao: "Reclamação" };
  const openContratoDe = (orgId, orgao) => { setSelectedOrg(orgId); setTab("os"); setSelectedContrato(orgao); setContratoOrigin("profile"); setOsView("contrato"); };

  /* ---- IA: conversa no formato do app do Claude ---- */
  const enviar = async (texto, opts = {}) => {
    ctlRef.current?.abort();
    const ctl = new AbortController();
    ctlRef.current = ctl;
    const base = opts.nova || !conversa
      ? { id: "c" + Date.now(), clienteId: opts.clienteId || null, backTo: opts.backTo || null, backLabel: opts.backLabel || null, msgs: [] }
      : conversa;
    const msgs = [...base.msgs, { role: "user", text: texto }, { role: "assistant", text: "", status: "pensando", progress: [] }];
    const id = base.id, idx = msgs.length - 1;
    setConversa({ ...base, msgs });
    setTab("ia"); setIaView("conversa");
    const muda = (f) => setConversa((c) => (c && c.id === id ? { ...c, msgs: c.msgs.map((m, i) => (i === idx ? { ...m, ...f(m) } : m)) } : c));
    if (!online) { muda(() => ({ status: "erro", error: "Sem internet. A IA volta a responder quando a conexão voltar.", retryable: true })); return; }
    if (!sample) { muda(() => ({ status: "erro", error: "A IA responde quando este app é aberto no Claude.", retryable: false })); return; }
    try {
      const { text, truncated } = await conversar(sample, msgs.slice(0, -1), {
        clienteId: base.clienteId, signal: ctl.signal,
        onText: ({ text }) => muda(() => ({ text, status: "escrevendo" })),
        onProgress: (p) => muda((m) => ({ progress: [...m.progress, p] })),
      });
      muda(() => ({ text, truncated, status: "pronta" }));
    } catch (e) {
      const parcial = e?.text || "";
      if (e?.code === "cancelled") { muda(() => ({ text: parcial, status: parcial ? "pronta" : "erro", error: "Você parou esta resposta.", retryable: true })); return; }
      muda(() => ({ text: e?.code === "refused" ? "" : parcial, status: "erro", error: erroTexto(e), retryable: !["not_granted", "sampling_disabled", "tools_unavailable"].includes(e?.code) }));
    }
  };
  const tentarDeNovo = () => {
    if (!conversa) return;
    const iu = conversa.msgs.map((m) => m.role).lastIndexOf("user");
    const pergunta = conversa.msgs[iu].text;
    setConversa((c) => ({ ...c, msgs: c.msgs.slice(0, iu) }));
    setTimeout(() => enviar(pergunta), 0);
  };
  const fixadas = new Set(pinned.map((p) => p.id));
  const fixarResposta = (i) => {
    const m = conversa.msgs[i], chave = m.pinId || `${conversa.id}:${i}`;
    if (fixadas.has(chave)) { setPinned((ps) => ps.filter((p) => p.id !== chave)); return; }
    const pergunta = conversa.msgs.slice(0, i).filter((x) => x.role === "user").pop()?.text || "Relatório da IA";
    setPinned((ps) => [{ id: chave, question: pergunta, text: m.text, clienteId: conversa.clienteId, atualizado: "Fixado agora" }, ...ps]);
  };
  const openPinned = (p, from = "pasta") => {
    const backs = { pasta: "Relatórios fixados", notificacoes: "Notificações" };
    setConversa({ id: "fix-" + p.id, clienteId: p.clienteId || null, backTo: from, backLabel: backs[from],
                  msgs: [{ role: "user", text: p.question }, { role: "assistant", text: p.text, status: "pronta", progress: [], atualizado: p.atualizado, pinId: p.id }] });
    setTab("ia"); setIaView("conversa");
  };
  const voltarDaConversa = () => {
    ctlRef.current?.abort();
    if (conversa?.backTo === "os") { setTab("os"); setOsView("profile"); }
    else if (conversa?.backTo === "pasta") { setTab("perfil"); setPerfilView("pasta"); }
    else if (conversa?.backTo === "notificacoes") { setTab("inicio"); setInicioView("notificacoes"); }
    else setIaView("ask");
  };

  const openNotif = (n) => {
    setNotifs((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    const { kind, id } = n.target;
    if (kind === "processo") openProcesso(PROCESSOS_LISTA.find((p) => p.id === id), "notificacoes");
    if (kind === "bloqueio") openBloqueio(BLOQUEIOS_LISTA.find((b) => b.id === id), "notificacoes");
    if (kind === "report") { const p = pinned.find((x) => x.id === id); if (p) openPinned(p, "notificacoes"); }
    if (kind === "org") openOrg(id);
    if (kind === "reclamacao") openReclamacao(RECLAMACOES_LISTA.find((r) => r.id === id), "notificacoes");
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
        {!acesso.entrou ? (
          <FluxoEntrada escala={escala} setEscala={setEscala} lerVoz={lerVoz} setLerVoz={setLerVoz}
            onConcluir={(faceId) => setAcesso({ entrou: true, faceId })} />
        ) : bloqueado ? (
          <Bloqueio onDesbloquear={() => setBloqueado(false)} />
        ) : (<>
        {!online && <AvisoSemInternet desde={desde} />}

        {tab === "inicio" && inicioView === "feed" && (
          <InicioFeed
            onOpenList={(v) => { setRecorteLista("todos"); setInicioView(v); }}
            onOpenProcessos={(area) => { setRecorteLista(area); setInicioView("processos"); }}
            onOpenOrg={openOrg}
            followedItems={followedItemsFull}
            onOpenProcesso={openProcesso}
            onOpenBloqueio={openBloqueio}
            onOpenReclamacao={openReclamacao}
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
        {tab === "inicio" && inicioView === "carteira" && (
          <Carteira onBack={() => setInicioView("feed")} onOpenOrg={openOrg} onOpenContrato={openContratoDe} />
        )}
        {tab === "inicio" && inicioView === "movimentacoes" && (
          <Movimentacoes onBack={() => setInicioView("feed")} onOpenProcesso={(p) => openProcesso(p, "movimentacoes")} onOpenBloqueio={(b) => openBloqueio(b, "movimentacoes")} />
        )}
        {tab === "inicio" && inicioView === "reclamacoes" && (
          <ReclamacoesTela onBack={() => setInicioView("feed")} backLabel="Início" onOpen={(r) => openReclamacao(r, "reclamacoes")} />
        )}
        {tab === "inicio" && inicioView === "reclamacao" && selectedReclamacao && (
          <ReclamacaoDetalhe reclamacao={selectedReclamacao} backLabel={backLabels[reclamacaoOrigin]} onBack={() => setInicioView(reclamacaoOrigin)}
            onOpenProcesso={(p) => openProcesso(p, "reclamacao")} />
        )}
        {tab === "inicio" && ["processos", "bloqueios"].includes(inicioView) && (
          <ListaGenerica key={inicioView + recorteLista} tipo={inicioView} recorteInicial={recorteLista} onBack={() => setInicioView("feed")} followed={followed}
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
          <OsPerfil orgId={selectedOrg} onBack={() => setOsView("list")} sample={sample} onAsk={(q) => enviar(q, { nova: true, clienteId: selectedOrg, backTo: "os", backLabel: ORGS[selectedOrg].name })}
            onOpenContratos={() => setOsView("contratos")} onOpenContrato={(c) => openContrato(c, "profile")}
            onOpenBloqueios={() => setOsView("bloqueios")} onOpenProcessos={() => setOsView("processos")} onOpenReclamacoes={() => setOsView("reclamacoes")} />
        )}
        {tab === "os" && osView === "contratos" && (
          <ContratosOrg orgId={selectedOrg} onBack={() => setOsView("profile")} onOpenContrato={(c) => openContrato(c, "contratos")}
            onEnviarCliente={() => { setRelatorioOrgao(null); setRelatorioOrigin("contratos"); setOsView("relatorio"); }} />
        )}
        {tab === "os" && osView === "contrato" && selectedContrato && (
          <ContratoDetalhe key={selectedContrato} orgId={selectedOrg} orgao={selectedContrato} onBack={() => setOsView(contratoOrigin)} backLabel={osLabels[contratoOrigin]}
            onOpenProcesso={(p) => openOsDetalhe("processo", p, "contrato")} onOpenBloqueio={(b) => openOsDetalhe("bloqueio", b, "contrato")}
            onEnviarCliente={() => { setRelatorioOrgao(selectedContrato); setRelatorioOrigin("contrato"); setOsView("relatorio"); }} />
        )}
        {tab === "os" && osView === "relatorio" && (
          <RelatorioCliente key={relatorioOrgao || "todos"} orgId={selectedOrg} orgao={relatorioOrgao} onBack={() => setOsView(relatorioOrigin)} backLabel={osLabels[relatorioOrigin]} />
        )}
        {tab === "os" && osView === "bloqueios" && (
          <BloqueiosOrg orgId={selectedOrg} onBack={() => setOsView("profile")} onOpenContrato={(c) => openContrato(c, "bloqueios")}
            onOpenBloqueio={(b) => openOsDetalhe("bloqueio", b, "bloqueios")} />
        )}
        {tab === "os" && osView === "processos" && (
          <ProcessosOrg orgId={selectedOrg} onBack={() => setOsView("profile")} onOpenContrato={(c) => openContrato(c, "processos")}
            onOpenProcesso={(p) => openOsDetalhe("processo", p, "processos")} />
        )}
        {tab === "os" && osView === "reclamacoes" && (
          <ReclamacoesTela orgId={selectedOrg} onBack={() => setOsView("profile")} backLabel={ORGS[selectedOrg].name}
            onOpen={(r) => { setSelectedReclamacao(r); setOsView("reclamacao"); }} />
        )}
        {tab === "os" && osView === "reclamacao" && selectedReclamacao && (
          <ReclamacaoDetalhe reclamacao={selectedReclamacao} backLabel="Reclamações" onBack={() => setOsView("reclamacoes")}
            onOpenProcesso={(p) => openOsDetalhe("processo", p, "reclamacao")} />
        )}
        {tab === "os" && osView === "processo" && selectedProcesso && (
          <ProcessoDetalhe key={selectedProcesso.id} processo={selectedProcesso} sample={sample}
            isFollowing={followed.has(selectedProcesso.id)} onToggleFollow={() => toggleFollow(selectedProcesso.id)}
            onBack={() => setOsView(osDetalheOrigin)} backLabel={osLabels[osDetalheOrigin]} />
        )}
        {tab === "os" && osView === "bloqueio" && selectedBloqueio && (
          <BloqueioDetalhe bloqueio={selectedBloqueio} backLabel={osLabels[osDetalheOrigin]} onBack={() => setOsView(osDetalheOrigin)}
            onOpenProcesso={(p) => openOsDetalhe("processo", p, "bloqueio")} />
        )}

        {tab === "ia" && iaView === "ask" && (
          <IaAsk onAsk={(q) => enviar(q, { nova: true })} sample={sample} conversa={conversa && !conversa.backTo ? conversa : null} onContinuar={() => setIaView("conversa")} />
        )}
        {tab === "ia" && iaView === "conversa" && conversa && (
          <IaConversa conversa={conversa} sample={sample} onEnviar={(t) => enviar(t)} onParar={() => ctlRef.current?.abort()}
            onTentar={tentarDeNovo} onFixar={fixarResposta} fixadas={fixadas} onVoltar={voltarDaConversa}
            onNova={() => { ctlRef.current?.abort(); setConversa(null); setIaView("ask"); }} />
        )}

        {tab === "perfil" && perfilView === "main" && <PerfilUsuaria onOpenNotifPrefs={() => setPerfilView("notif")} onOpenSeguranca={() => setPerfilView("seguranca")} onOpenPasta={() => setPerfilView("pasta")} pinnedCount={pinned.length} onOpenGuia={() => setPerfilView("guia")}
            onOpenOrdem={() => setPerfilView("ordem")} foto={foto} setFoto={setFoto} apelido={apelido} setApelido={setApelido}
            escala={escala} setEscala={setEscala} lerVoz={lerVoz} setLerVoz={setLerVoz} />}
        {tab === "perfil" && perfilView === "ordem" && <OrdemClientes ordem={ordem} setOrdem={setOrdem} onBack={() => setPerfilView("main")} />}
        {tab === "perfil" && perfilView === "guia" && <GuiaEstilo onBack={() => setPerfilView("main")} />}
        {tab === "perfil" && perfilView === "pasta" && <PastaRelatorios pinned={pinned} onOpenPinned={(p) => openPinned(p, "pasta")} onBack={() => setPerfilView("main")} />}
        {tab === "perfil" && perfilView === "notif" && <NotifPrefs onBack={() => setPerfilView("main")} />}
        {tab === "perfil" && perfilView === "seguranca" && (
          <Seguranca onBack={() => setPerfilView("main")} faceId={acesso.faceId} setFaceId={(v) => setAcesso({ ...acesso, faceId: v })}
            onBloquear={() => setBloqueado(true)} onSair={() => { setAcesso({ entrou: false, faceId: false }); setBloqueado(false); changeTab("inicio"); }}
            semInternetSimulado={semInternetSim} setSemInternetSimulado={setSemInternetSim} />
        )}

        {showTabBar && <TabBar active={tab} onChange={changeTab} />}
        {menuVA && (
          <MenuVA unread={unreadCount} followedCount={followed.size} foto={foto} apelido={apelido} onClose={() => setMenuVA(false)}
            onNotificacoes={() => { setMenuVA(false); setTab("inicio"); setInicioView("notificacoes"); }}
            onAcompanhando={() => { setMenuVA(false); setTab("inicio"); setInicioView("acompanhando"); }}
            onPerfil={() => { setMenuVA(false); changeTab("perfil"); }} />
        )}
        </>)}
        </div>
        </PrefsContext.Provider>
      </div>
    </div>
  );
}
export default AppSociosPrototype;
