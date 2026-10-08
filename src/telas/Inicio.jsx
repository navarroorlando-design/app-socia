import React, { useEffect, useRef, useState } from "react";
import { ChevronIcon, FlagIcon, FolderIcon, LockIcon, MoedaIcon, SearchIcon, TendenciaIcon } from "../componentes/icones";
import { Badge, Etiqueta, Faixa, LinhaLista, SecLabel } from "../componentes/ui";
import { BLOQUEIOS_LISTA, ENCERRADOS_2026, ORGS, ORG_ORDER, PROCESSOS_LISTA, RECLAMACOES_LISTA, TOTAIS } from "../dados/base";
import { processosParados } from "../dados/criterios";
import { fmtBRL, fmtBRLCurto, fmtData, norm } from "../dados/formato";
import { CARD, F, LINK, S, SEMANTICA, T, semDe } from "../estilo/tokens";
import { prefersReducedMotion } from "../motion/motion";
import { Avatar } from "../preferencias";
import { FaixaAviso } from "../ajuda/Dica";
import { MarcaOrg } from "../componentes/MarcaOrg";

/* Conta de 0 até o valor final em 900 ms (ease-out), só quando `animar` é true (primeira
   abertura do Início na sessão). Com movimento reduzido, mostra o valor final direto. */
function useContarAoAbrir(valorFinal, animar) {
  const [valor, setValor] = useState(animar && !prefersReducedMotion() ? 0 : valorFinal);
  useEffect(() => {
    if (!animar || prefersReducedMotion()) { setValor(valorFinal); return undefined; }
    let raf, inicio;
    const duracao = 900;
    const tick = (t) => {
      if (!inicio) inicio = t;
      const p = Math.min(1, (t - inicio) / duracao);
      setValor(Math.round(valorFinal * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valorFinal]);
  return valor;
}
// Conta como "primeira abertura" só uma vez por sessão do app (zera ao recarregar a página).
let INICIO_JA_ABRIU = false;
// A dica fechada não volta nesta sessão do app (zera ao recarregar a página), mesmo quando o
// Início desmonta e remonta ao trocar de aba — por isso o estado fica fora do componente.
let DICA_INICIO_FECHADA = false;

/* ------------------------------------------------------------------ */
/* Telas: Início                                                       */
/* ------------------------------------------------------------------ */

/* Anel de progresso: percentual no centro, rótulo embaixo (claro: sobre cartão branco) */
function Anel({ pct, rotulo, size = 92, claro }) {
  const r = 38, c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center shrink-0" role="img" aria-label={`${pct}% ${rotulo}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 92 92" aria-hidden="true">
          <circle cx="46" cy="46" r={r} fill="none" stroke={claro ? S.linha : S.marcaTrilho} strokeWidth="8" />
          <circle cx="46" cy="46" r={r} fill="none" stroke={claro ? S.ink : "#FFFFFF"} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${(c * pct) / 100} ${c}`} transform="rotate(-90 46 46)" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center"
              style={{ fontFamily: F.ui, fontSize: 20, fontWeight: 600, color: claro ? S.ink : "#FFFFFF", fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
      </div>
      <span style={{ fontFamily: F.ui, fontSize: 14, color: claro ? S.texto2 : S.marcaTexto2, marginTop: 6 }}>{rotulo}</span>
    </div>
  );
}
const NATUREZAS = ["Trabalhista", "Cível", "Administrativo"];
const INICIO_BLOCOS = { resumo: "Bloqueado hoje", atalhos: "Atalhos", ativos: "Processos ativos", seguidos: "Processos que você segue", hoje: "Hoje no escritório" };
const INICIO_PADRAO = Object.keys(INICIO_BLOCOS).map((id) => ({ id, visivel: true }));

function InicioFeed({ onOpenList, onOpenProcessos, onOpenOrg, onOpenEscritorio, onOpenParados, followedItems, onOpenProcesso, onOpenBloqueio, onOpenReclamacao, onOpenAcompanhando, onOpenMenu, unreadCount, foto, apelido, ordem = INICIO_PADRAO }) {
  const preview = followedItems.slice(0, 3);
  const parados90 = processosParados(PROCESSOS_LISTA).length;
  const sem = (id) => SEMANTICA.find((x) => x.id === id);
  const agora = new Date();
  const hora = agora.getHours();
  const saudacao = hora < 12 ? "Bom dia," : hora < 18 ? "Boa tarde," : "Boa noite,";
  const data = agora.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  // Parte do valor bloqueado em 2026 que já foi levantada (anel do cartão principal).
  const levantado = BLOQUEIOS_LISTA.filter((b) => b.status === "Levantado").reduce((s, b) => s + b.valorNum, 0);
  const pctLevantado = Math.round((levantado / (levantado + TOTAIS.bloqueadoAtivo)) * 100);
  const ativos = BLOQUEIOS_LISTA.filter((b) => b.status === "Ativo").length;
  const passivo = PROCESSOS_LISTA.reduce((soma, p) => soma + p.valorCausa, 0);
  const totalEncerrados2026 = ENCERRADOS_2026.length;
  const pctExito = totalEncerrados2026 ? Math.round((ENCERRADOS_2026.filter((e) => e.resultado === "Favorável" || e.resultado === "Acordo").length / totalEncerrados2026) * 100) : 0;
  const proc = (id) => PROCESSOS_LISTA.find((p) => p.id === id);
  // "Ativo" = não arquivado nem baixado. Na base de exemplo, todos estão ativos.
  const ativosProc = PROCESSOS_LISTA.filter((p) => !["Arquivado", "Baixado"].includes(p.status));
  const outrosProc = ativosProc.filter((p) => !NATUREZAS.includes(p.area)).length;

  // Contador e anel animados: só na primeira abertura do Início na sessão (seção B.1/D).
  const primeiraAbertura = useRef(!INICIO_JA_ABRIU).current;
  useEffect(() => { INICIO_JA_ABRIU = true; }, []);
  const valorAnimado = useContarAoAbrir(TOTAIS.bloqueadoAtivo, primeiraAbertura);
  const pctAnimado = useContarAoAbrir(pctLevantado, primeiraAbertura);

  const [dicaFechada, setDicaFechada] = useState(DICA_INICIO_FECHADA);
  const fecharDica = () => { DICA_INICIO_FECHADA = true; setDicaFechada(true); };

  // O primeiro bloco visível fica em destaque, no carvão da marca; os outros, em cartão branco.
  // Assim, quando a sócia reordena o Início (Perfil → Personalizar Início), o destaque acompanha.
  const primeiro = ordem.find((x) => x.visivel && !(x.id === "seguidos" && preview.length === 0))?.id;
  const tema = (id) => (id === primeiro
    ? { escuro: true, fundo: S.marca, texto: "#FFFFFF", apoio: S.marcaTexto2, linha: "rgba(255,255,255,.16)", trilho: S.marcaTrilho, barra: S.osso, circulo: "rgba(255,255,255,.12)", sombra: "0 10px 24px rgba(31,30,26,.22)" }
    : { escuro: false, fundo: S.cartao, texto: S.ink, apoio: S.texto2, linha: S.linha, trilho: S.linha, barra: S.oliva, circulo: "#EFEBE2", sombra: CARD.boxShadow });
  const caixa = (t) => ({ ...CARD, background: t.fundo, boxShadow: t.sombra });
  const tResumo = tema("resumo"), tAtivos = tema("ativos"), tSeguidos = tema("seguidos"), tHoje = tema("hoje");

  // Tons da família neutra: cada atalho num tom, o latão fica só para a IA.
  const TONS_ATALHO = {
    cartao: { fundo: S.cartao, titulo: S.ink, apoio: S.texto2, circulo: "#EFEBE2", sombra: true },
    osso: { fundo: S.osso, titulo: S.ink, apoio: S.ossoTexto2, circulo: "rgba(255,253,249,.55)" },
    oliva: { fundo: S.oliva, titulo: "#FFFFFF", apoio: "#E6E1D6", circulo: "rgba(255,255,255,.14)" },
  };
  const Atalho = ({ Icone, rotulo, detalhe, onClick, tom = "cartao" }) => {
    const t = TONS_ATALHO[tom];
    return (
      <button onClick={onClick} className="flex flex-col items-start text-left min-w-0"
              style={{ ...CARD, background: t.fundo, boxShadow: t.sombra ? CARD.boxShadow : "none", padding: 12, gap: 8 }}>
        <span className="flex items-center justify-center shrink-0" style={{ width: 38, height: 38, borderRadius: 999, background: t.circulo }}>
          <Icone size={20} color={t.titulo} strokeWidth={1.8} />
        </span>
        <span className="min-w-0">
          <span className="block" style={{ fontFamily: F.ui, fontSize: 17, fontWeight: 600, color: t.titulo }}>{rotulo}</span>
          <span className="block" style={{ fontFamily: F.ui, fontSize: 14, color: t.apoio, marginTop: 2, lineHeight: 1.3 }}>{detalhe}</span>
        </span>
      </button>
    );
  };

  // Blocos do Início: a sócia escolhe quais aparecem e em que ordem (Perfil → Personalizar Início).
  const SECOES = {
    resumo: (<>
      {/* valor bloqueado e quanto já foi levantado (em carvão quando é o primeiro bloco) */}
      <div className="mt-4" style={{ ...caixa(tResumo), padding: 18 }}>
        <p style={{ fontFamily: F.ui, fontSize: 15, color: tResumo.apoio }}>Bloqueado hoje, todos os clientes</p>
        <p style={{ fontFamily: F.ui, fontSize: 36, fontWeight: 600, color: tResumo.texto, letterSpacing: "-0.03em", lineHeight: 1.1, marginTop: 4, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{fmtBRL(valorAnimado)}</p>
        <div className="flex items-end justify-between gap-3 mt-3">
          <div className="min-w-0 flex flex-col items-start gap-1.5">
            <p style={{ fontFamily: F.ui, fontSize: 15, color: tResumo.apoio, marginBottom: 1 }}>{ativos} bloqueios ativos</p>
            {parados90 > 0 && (
              <button onClick={onOpenParados} aria-label={`${parados90} processos parados há mais de 90 dias, ver lista`}>
                <Etiqueta s={sem("atencao")} texto={`${parados90} parados há 90 dias`} sobreCor={tResumo.escuro} />
              </button>
            )}
            <button onClick={onOpenAcompanhando} aria-label={`${followedItems.length} processos acompanhados`}>
              <Etiqueta s={sem("curso")} texto={`${followedItems.length} que você segue`} sobreCor={tResumo.escuro} />
            </button>
          </div>
          <Anel pct={pctAnimado} rotulo="já levantado" size={72} claro={!tResumo.escuro} />
        </div>
      </div>
      {!dicaFechada && (
        <FaixaAviso onFechar={fecharDica} style={{ marginTop: 10, padding: "10px 12px" }}>
          Passivo e Desempenho ganharam atalhos. Personalize em Perfil.
        </FaixaAviso>
      )}
    </>),
    atalhos: (<>
      {/* atalhos em grade 2×2: 4 tipos, sempre o mesmo tamanho */}
      <div className="grid grid-cols-2 gap-2.5 mt-3">
        <Atalho rotulo="Processos" detalhe={`${PROCESSOS_LISTA.length} no total`} onClick={() => onOpenList("processos")} Icone={FolderIcon} tom="cartao" />
        <Atalho rotulo="Bloqueios" detalhe={`${ativos} ativos · ${fmtBRLCurto(TOTAIS.bloqueadoAtivo)}`} onClick={() => onOpenList("bloqueios")} Icone={LockIcon} tom="osso" />
        <Atalho rotulo="Passivo" detalhe={`${fmtBRLCurto(passivo)} estimado`} onClick={() => onOpenEscritorio("passivo")} Icone={MoedaIcon} tom="cartao" />
        <Atalho rotulo="Desempenho" detalhe={`${pctExito}% de êxito em 2026`} onClick={() => onOpenEscritorio("desempenho")} Icone={TendenciaIcon} tom="oliva" />
      </div>
      <button onClick={() => onOpenList("reclamacoes")} className="w-full text-left flex items-center gap-3 mt-3"
              style={{ ...CARD, padding: 16 }} aria-label={`Reclamação constitucional, ${RECLAMACOES_LISTA.length} no STF`}>
        <span className="flex items-center justify-center shrink-0" style={{ width: 42, height: 42, borderRadius: 999, background: "#EFEBE2" }}>
          <FlagIcon size={22} color={S.ink} strokeWidth={1.8} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block" style={{ fontFamily: F.ui, fontSize: 17, fontWeight: 600, color: S.ink }}>Reclamação constitucional</span>
          <span className="block" style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 2 }}>{RECLAMACOES_LISTA.length} no STF</span>
        </span>
        <ChevronIcon size={18} color={S.texto2} strokeWidth={2} />
      </button>
    </>),
    ativos: (<>
      {/* processos ativos do escritório, por natureza */}
      <SecLabel acao="Ver todos" onAcao={() => onOpenProcessos("todos")}>Processos ativos</SecLabel>
      <div style={{ ...caixa(tAtivos), padding: 18 }}>
        <div className="flex items-baseline gap-2">
          <span style={{ fontFamily: F.ui, fontSize: 34, fontWeight: 600, color: tAtivos.texto, letterSpacing: "-0.02em" }}>{ativosProc.length}</span>
          <span style={{ fontFamily: F.ui, fontSize: 16, color: tAtivos.apoio }}>processos em andamento no escritório</span>
        </div>
        <div className="flex flex-col mt-3" style={{ gap: 4 }}>
          {NATUREZAS.map((n) => {
            const qtd = ativosProc.filter((p) => p.area === n).length;
            return (
              <button key={n} onClick={() => onOpenProcessos(n)} className="w-full text-left" style={{ padding: "8px 0" }} aria-label={`${n}: ${qtd} processos, ver lista`}>
                <span className="flex items-baseline justify-between gap-2">
                  <span style={{ fontFamily: F.ui, fontSize: 16, color: tAtivos.texto }}>{n}</span>
                  <span className="flex items-center gap-1.5" style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: tAtivos.texto }}>{qtd}<ChevronIcon size={14} color={tAtivos.apoio} strokeWidth={2} /></span>
                </span>
                <span className="block" style={{ marginTop: 6, height: 8, borderRadius: 999, background: tAtivos.trilho }}>
                  <span className="block" style={{ height: 8, borderRadius: 999, width: `${Math.max(2, (qtd / ativosProc.length) * 100)}%`, background: tAtivos.barra }} />
                </span>
              </button>
            );
          })}
        </div>
        {outrosProc > 0 && <p style={{ fontFamily: F.ui, fontSize: 14, color: tAtivos.apoio, marginTop: 6 }}>Mais {outrosProc} {outrosProc === 1 ? "processo constitucional" : "processos constitucionais"} (reclamações no STF).</p>}
      </div>
    </>),
    seguidos: (<>
      {preview.length > 0 && (
        <>
          <SecLabel acao="Ver todos" onAcao={onOpenAcompanhando}>Processos que você segue</SecLabel>
          <div style={caixa(tSeguidos)}>
            {preview.map((item, i) => (
              <button key={item.id} onClick={() => onOpenProcesso(item, "feed")} className="w-full text-left flex items-center gap-3"
                      style={{ padding: "14px 16px", borderTop: i ? `1px solid ${tSeguidos.linha}` : "none" }}>
                <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: semDe(item.status).fundo }}>
                  <FolderIcon size={18} color={semDe(item.status).cor} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: tSeguidos.texto }}>{item.cliente}</p>
                    <span style={{ fontFamily: F.ui, fontSize: 14, color: tSeguidos.apoio, flexShrink: 0 }}>{item.lastUpdate}</span>
                  </div>
                  <p style={{ fontFamily: F.ui, fontSize: 15, color: tSeguidos.apoio, marginTop: 2, lineHeight: 1.35 }}>{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </>),
    hoje: (<>
      <SecLabel acao="Ver tudo" onAcao={() => onOpenList("movimentacoes")}>Hoje no escritório</SecLabel>
      <div style={caixa(tHoje)}>
        <FeedItem cliente="Instituto Gnosis" text="Decisão interlocutória publicada na ação cível de cobrança" time="40 min" sem={sem("curso")} tag="Movimentação" onClick={() => onOpenProcesso(proc("p2"), "feed")} t={tHoje} />
        <FeedItem cliente="AFNE" text="Bloqueio de R$ 18.400 foi levantado" time="3 h" sem={sem("resolvido")} tag="Levantado" onClick={() => onOpenBloqueio(BLOQUEIOS_LISTA.find((b) => b.id === "b1"), "feed")} t={tHoje} />
        <FeedItem cliente="FAS" text="Nova reclamação constitucional protocolada no STF" time="ontem" sem={sem("atencao")} tag="Reclamação" onClick={() => onOpenReclamacao(RECLAMACOES_LISTA.find((r) => r.id === "r1"), "feed")} t={tHoje} />
        <FeedItem cliente="IGEDES" text="Processo administrativo disciplinar movimentado" time="2 dias" sem={sem("curso")} tag="Movimentação" onClick={() => onOpenProcesso(proc("p5"), "feed")} t={tHoje} />
        <FeedItem cliente="AFNE" text="Audiência trabalhista remarcada na ação declaratória" time="4 dias" sem={sem("atencao")} tag="Remarcação" onClick={() => onOpenProcesso(proc("p4"), "feed")} last t={tHoje} />
      </div>
    </>),
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-6" style={{ paddingBottom: 120 }}>
      {/* saudação em duas linhas + VA */}
      <div className="flex items-center justify-between gap-3" style={{ paddingTop: 10 }}>
        <div className="min-w-0">
          <p style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2 }}>{data.charAt(0).toUpperCase() + data.slice(1)}</p>
          <p style={{ fontFamily: F.titulo, fontSize: 30, fontWeight: 400, color: S.ink, letterSpacing: "-0.02em", lineHeight: 1.1, marginTop: 8 }}>{saudacao.replace(",", "")}</p>
          <p style={{ fontFamily: F.titulo, fontSize: 30, fontWeight: 700, color: S.ink, letterSpacing: "-0.025em", lineHeight: 1.1 }}>{apelido || "Sócia"}</p>
        </div>
        <button onClick={onOpenMenu} aria-label={`Menu da conta${unreadCount ? `, ${unreadCount} notificações novas` : ""}`} className="rounded-full shrink-0">
          <Avatar foto={foto} size={54} badge={unreadCount} />
        </button>
      </div>

      {ordem.filter((x) => x.visivel).map((x) => <React.Fragment key={x.id}>{SECOES[x.id]}</React.Fragment>)}
    </div>
  );
}


function FeedItem({ cliente, text, time, sem, tag, onClick, last, t }) {
  return (
    <button onClick={onClick} className="w-full text-left" style={{ padding: "14px 18px", borderBottom: last ? "none" : `1px solid ${t?.linha || S.linha}` }}>
      <div className="flex items-center justify-between gap-3">
        <Etiqueta s={sem} texto={tag} sobreCor={t?.escuro} />
        <span style={{ fontFamily: F.ui, fontSize: 14, color: t?.apoio || S.texto2 }}>{time}</span>
      </div>
      <p style={{ fontFamily: F.ui, fontSize: 16, color: t?.texto || S.ink, marginTop: 8, lineHeight: 1.4 }}>
        {cliente && <span style={{ fontWeight: 600 }}>{cliente}: </span>}{text}
      </p>
    </button>
  );
}

/* Lista de processos ou bloqueios com filtros rápidos e ordenação */
function Chip({ ativo, onClick, children }) {
  const ref = React.useRef(null);
  // O filtro já escolhido (por exemplo, vindo do Início) aparece na tela, mesmo no fim da faixa.
  React.useEffect(() => { if (ativo && ref.current?.scrollIntoView) ref.current.scrollIntoView({ inline: "center", block: "nearest" }); }, []);
  return (
    <button ref={ref} onClick={onClick} aria-pressed={ativo} className="shrink-0 rounded-full"
            style={{ height: 40, padding: "0 14px", fontFamily: F.ui, fontSize: 15, fontWeight: ativo ? 600 : 500, whiteSpace: "nowrap",
                     background: ativo ? S.marca : S.cartao, color: ativo ? "#FFFFFF" : S.ink, boxShadow: ativo ? "none" : CARD.boxShadow }}>
      {children}
    </button>
  );
}
const LinhaChips = ({ children }) => <div className="flex gap-2 overflow-x-auto no-scrollbar" style={{ margin: "0 -32px", padding: "4px 32px" }}>{children}</div>;

// Processos: não tem mais filtro nem lista estática. É uma página só — o campo de busca já
// mostra, ao digitar, organizações, processos e bloqueios juntos (a mesma lógica de sempre).
const SecaoBusca = ({ title, children }) => (
  <>
    <SecLabel>{title}</SecLabel>
    <div style={CARD}>{children}</div>
  </>
);

function ProcessosTela({ onBack, onOpenProcesso, onOpenBloqueio, onOpenOrg }) {
  const [q, setQ] = useState("");
  const term = norm(q.trim());
  const orgs = term ? ORG_ORDER.filter((id) => norm(ORGS[id].name).includes(term)) : [];
  const processos = term ? PROCESSOS_LISTA.filter((p) => norm(`${p.cliente} ${p.desc}`).includes(term)) : [];
  const bloqueios = term ? BLOQUEIOS_LISTA.filter((b) => norm(`${b.cliente} ${b.valor} ${b.contrato}`).includes(term)) : [];
  const total = orgs.length + processos.length + bloqueios.length;
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
      <Faixa bleed={32} onBack={onBack} backLabel="Início" titulo="Processos" sub={`${PROCESSOS_LISTA.length} na base de exemplo`} />
      <div className="busca-campo flex items-center gap-2 px-4 rounded-full" style={{ height: 50, background: S.cartao, boxShadow: CARD.boxShadow }}>
        <SearchIcon size={20} color={S.texto2} />
        <input id="busca" aria-label="Buscar" value={q} onChange={(e) => setQ(e.target.value)}
               placeholder="Cliente, processo ou valor"
               className="flex-1 bg-transparent outline-none text-[17px]" style={{ color: S.ink, fontFamily: F.ui }} />
        {q && <button onClick={() => setQ("")} aria-label="Limpar busca" style={LINK}>Limpar</button>}
      </div>

      <div className="mt-4">
        {!term && (
          <>
            <SecLabel>Sugestões</SecLabel>
            <div className="flex flex-wrap gap-2">
              {["AFNE", "Gnosis", "trabalhista", "SISBAJUD", "Niterói"].map((s) => (
                <button key={s} onClick={() => setQ(s)} className="rounded-full" style={{ background: S.cartao, boxShadow: CARD.boxShadow, fontFamily: F.ui, fontSize: 16, color: S.ink, padding: "8px 14px" }}>{s}</button>
              ))}
            </div>
          </>
        )}

        {term && total === 0 && (
          <p style={{ fontFamily: F.ui, fontSize: 16, color: S.texto2, lineHeight: 1.45 }}>Nada encontrado para "{q}". Tente o nome do cliente ou o tipo de ação.</p>
        )}

        {orgs.length > 0 && (
          <SecaoBusca title="Organizações">
            {orgs.map((id, i) => (
              <button key={id} onClick={() => onOpenOrg(id)} className="flex items-center gap-3 w-full text-left" style={{ padding: "12px 16px", borderBottom: i === orgs.length - 1 ? "none" : `1px solid ${S.linha}` }}>
                <MarcaOrg id={id} iniciais={ORGS[id].initials} size={40} />
                <span className="flex-1" style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink }}>{ORGS[id].name}</span>
                <ChevronIcon size={16} color={S.texto2} strokeWidth={2} />
              </button>
            ))}
          </SecaoBusca>
        )}

        {processos.length > 0 && (
          <SecaoBusca title="Processos">
            {processos.map((p, i) => (
              <LinhaLista key={p.id} onClick={() => onOpenProcesso(p, "processos")} last={i === processos.length - 1} sem={semDe(p.status)}
                          icone={<FolderIcon size={18} color={semDe(p.status).cor} />} titulo={p.cliente} detalhe={p.desc} abaixo={<Badge text={p.status} />} />
            ))}
          </SecaoBusca>
        )}

        {bloqueios.length > 0 && (
          <SecaoBusca title="Bloqueios">
            {bloqueios.map((b, i) => (
              <LinhaLista key={b.id} onClick={() => onOpenBloqueio(b, "processos")} last={i === bloqueios.length - 1} sem={semDe(b.status)}
                          icone={<LockIcon size={18} color={semDe(b.status).cor} />} titulo={<span style={{ fontSize: 17, fontVariantNumeric: "tabular-nums" }}>{b.valor}</span>}
                          detalhe={b.cliente} direita={<Badge text={b.status} />} />
            ))}
          </SecaoBusca>
        )}
      </div>
    </div>
  );
}

function ListaGenerica({ tipo, onBack, onOpenOrg, followed, onOpenProcesso, onOpenBloqueio }) {
  if (tipo === "processos") return <ProcessosTela onBack={onBack} onOpenProcesso={onOpenProcesso} onOpenBloqueio={onOpenBloqueio} onOpenOrg={onOpenOrg} />;

  const [cliente, setCliente] = useState("todos");
  const [recorte, setRecorte] = useState("todos");
  const [ordem, setOrdem] = useState("recentes");
  const recortes = [["todos", "Todos"], ["Ativo", "Ativos"], ["Levantado", "Levantados"]];
  const ordens = [["recentes", "Mais recentes"], ["valor", "Maior valor"]];
  const lista = BLOQUEIOS_LISTA
    .filter((x) => cliente === "todos" || x.clienteId === cliente)
    .filter((x) => recorte === "todos" || x.status === recorte)
    .sort({ recentes: (a, b) => b.data - a.data, valor: (a, b) => b.valorNum - a.valorNum }[ordem]);
  const ativosTotal = BLOQUEIOS_LISTA.filter((b) => b.status === "Ativo").length;

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
      <Faixa bleed={32} onBack={onBack} backLabel="Início" titulo="Bloqueios"
             sub={`${ativosTotal} ativos de ${BLOQUEIOS_LISTA.length} na base`} />
      <div className="flex flex-col gap-2" role="group" aria-label="Filtros">
        <LinhaChips>
          <Chip ativo={cliente === "todos"} onClick={() => setCliente("todos")}>Todos os clientes</Chip>
          {ORG_ORDER.map((id) => <Chip key={id} ativo={cliente === id} onClick={() => setCliente(id)}>{ORGS[id].name}</Chip>)}
        </LinhaChips>
        <LinhaChips>
          {recortes.map(([id, rot]) => <Chip key={id} ativo={recorte === id} onClick={() => setRecorte(id)}>{rot}</Chip>)}
        </LinhaChips>
      </div>
      <div className="flex items-center justify-between gap-2" style={{ margin: "18px 0 10px" }}>
        <p role="status" style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2 }}>{lista.length} {lista.length === 1 ? "bloqueio" : "bloqueios"}</p>
        <label className="flex items-center gap-2" style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2 }}>
          Ordenar
          <select id={`ordem-${tipo}`} value={ordem} onChange={(e) => setOrdem(e.target.value)}
                  style={{ height: 40, borderRadius: 12, padding: "0 10px", fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.ink, background: S.cartao, boxShadow: CARD.boxShadow, border: "none" }}>
            {ordens.map(([id, rot]) => <option key={id} value={id}>{rot}</option>)}
          </select>
        </label>
      </div>
      {lista.length === 0 ? (
        <p style={{ fontFamily: F.ui, fontSize: 16, color: S.texto2, lineHeight: 1.5 }}>Nada com esses filtros. Toque em "Todos os clientes" ou em outro recorte.</p>
      ) : (
        <div style={CARD}>
          {lista.map((item, i) => (
            <LinhaLista key={item.id} onClick={() => onOpenBloqueio(item, "bloqueios")} last={i === lista.length - 1} sem={semDe(item.status)}
                        icone={<LockIcon size={18} color={semDe(item.status).cor} />} titulo={<span style={{ fontSize: 17, fontVariantNumeric: "tabular-nums" }}>{item.valor}</span>}
                        detalhe={`${item.cliente} · ${fmtData(item.data)}`} direita={<Badge text={item.status} />} />
          ))}
        </div>
      )}
    </div>
  );
}

function AcompanhandoLista({ items, onOpen, onBack }) {
  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
        <Faixa bleed={32} onBack={onBack} backLabel="Início" titulo="Processos que acompanho"
               sub={items.length === 1 ? "1 processo com estrela" : `${items.length} processos com estrela`} />
        {items.length === 0 ? (
          <p className="text-[15px] mt-4" style={{ color: T.muted }}>
            Nenhum processo acompanhado ainda. Toque na estrela dentro de um processo pra começar.
          </p>
        ) : (
          <div style={CARD}>
            {items.map((item, i) => (
              <LinhaLista key={item.id} onClick={() => onOpen(item)} last={i === items.length - 1} sem={semDe(item.status)}
                          icone={<FolderIcon size={18} color={semDe(item.status).cor} />} titulo={item.cliente}
                          detalhe={item.desc} abaixo={<Badge text={item.status} />} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* Parados há 90+ dias (critério centralizado em src/dados/criterios.js): do mais antigo
   para o mais novo, aberta pelo chip do topo do Início (seção B.1). */
function ParadosLista({ onOpen, onBack }) {
  const sem = (id) => SEMANTICA.find((x) => x.id === id);
  const items = processosParados(PROCESSOS_LISTA).sort((a, b) => b.diasParado - a.diasParado);
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
      <Faixa bleed={32} onBack={onBack} backLabel="Início" titulo="Parados há 90+ dias"
             sub={items.length === 1 ? "1 processo sem movimentação" : `${items.length} processos sem movimentação`} />
      {items.length === 0 ? (
        <p style={{ fontFamily: F.ui, fontSize: 16, color: S.texto2, lineHeight: 1.5 }}>Nenhum processo parado há 90 dias ou mais.</p>
      ) : (
        <div style={CARD}>
          {items.map((item, i) => (
            <LinhaLista key={item.id} onClick={() => onOpen(item)} last={i === items.length - 1} sem={semDe(item.status)}
                        icone={<FolderIcon size={18} color={semDe(item.status).cor} />} titulo={item.cliente}
                        detalhe={item.desc} abaixo={<Etiqueta s={sem("atencao")} texto={`${item.diasParado} dias parado`} />} />
          ))}
        </div>
      )}
    </div>
  );
}

export { INICIO_BLOCOS, INICIO_PADRAO, AcompanhandoLista, FeedItem, InicioFeed, ListaGenerica, ParadosLista };
