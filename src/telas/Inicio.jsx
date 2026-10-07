import React from "react";
import { FlagIcon, FolderIcon, LockIcon, SearchIcon, SparkleIcon, StarIcon } from "../componentes/icones";
import { Badge, CardRow, Etiqueta, Faixa, SecLabel } from "../componentes/ui";
import { BLOQUEIOS_LISTA, PROCESSOS_LISTA, RECLAMACOES_LISTA, TOTAIS } from "../dados/base";
import { fmtBRL, fmtBRLCurto } from "../dados/formato";
import { CARD, F, S, SEMANTICA, T, semDe } from "../estilo/tokens";
import { Avatar } from "../preferencias";

/* ------------------------------------------------------------------ */
/* Telas: Início                                                       */
/* ------------------------------------------------------------------ */
function InicioFeed({ onOpenList, onOpenOrg, followedItems, onOpenProcesso, onOpenAcompanhando, onOpenBusca, onOpenMenu, onPerguntar, unreadCount, foto, apelido }) {
  const preview = followedItems.slice(0, 3);
  const parados90 = PROCESSOS_LISTA.filter((p) => p.diasParado >= 90).length;
  const sem = (id) => SEMANTICA.find((x) => x.id === id);
  const agora = new Date();
  const hora = agora.getHours();
  const saudacao = hora < 12 ? "Bom dia," : hora < 18 ? "Boa tarde," : "Boa noite,";
  const data = agora.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const novidades = 5;

  const Atalho = ({ icone, rotulo, onClick, ia }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-2 flex-1 min-w-0">
      <span className="flex items-center justify-center" style={{ width: 60, height: 60, borderRadius: 18, background: ia ? S.iaFundo : "#FFFFFF", boxShadow: ia ? "none" : "0 1px 3px rgba(17,24,39,.08)" }}>{icone}</span>
      <span style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 500, color: S.ink }}>{rotulo}</span>
    </button>
  );

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-6" style={{ paddingBottom: 120 }}>
      {/* saudação em duas linhas + VA */}
      <div className="flex items-center justify-between gap-3" style={{ paddingTop: 10 }}>
        <div className="min-w-0">
          <p style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2 }}>{data.charAt(0).toUpperCase() + data.slice(1)}</p>
          <p style={{ fontFamily: F.ui, fontSize: 17, color: S.texto2, marginTop: 6 }}>{saudacao}</p>
          <p style={{ fontFamily: F.ui, fontSize: 26, fontWeight: 600, color: S.ink, letterSpacing: "-0.02em", lineHeight: 1.15 }}>{apelido || "Sócia"}</p>
        </div>
        <button onClick={onOpenMenu} aria-label={`Menu da conta${unreadCount ? `, ${unreadCount} notificações novas` : ""}`} className="rounded-full shrink-0">
          <Avatar foto={foto} size={54} badge={unreadCount} />
        </button>
      </div>

      {/* cartão-resumo do dia */}
      <div className="mt-5" style={{ ...CARD, padding: 20 }}>
        <p style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2 }}>Bloqueado hoje, todos os clientes</p>
        <p style={{ fontFamily: F.ui, fontSize: 36, fontWeight: 600, color: S.ink, letterSpacing: "-0.03em", lineHeight: 1.1, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{fmtBRL(TOTAIS.bloqueadoAtivo)}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {parados90 > 0 && (
            <button onClick={() => onOpenList("processos")} aria-label={`${parados90} processos parados há mais de 90 dias, ver lista`}>
              <Etiqueta s={sem("risco")} texto={`${parados90} parados há 90 dias`} />
            </button>
          )}
          <button onClick={onOpenAcompanhando} aria-label={`${followedItems.length} processos acompanhados`}>
            <Etiqueta s={sem("curso")} texto={`${followedItems.length} que você segue`} />
          </button>
        </div>
      </div>

      {/* atalhos */}
      <div className="flex gap-2 mt-5">
        <Atalho rotulo="Buscar" onClick={onOpenBusca} icone={<SearchIcon size={24} color={S.ink} />} />
        <Atalho rotulo="Sigo" onClick={onOpenAcompanhando} icone={<StarIcon size={23} color={S.ink} />} />
        <Atalho rotulo="Bloqueios" onClick={() => onOpenList("bloqueios")} icone={<LockIcon size={24} color={S.ink} />} />
        <Atalho rotulo="Perguntar" onClick={onPerguntar} ia icone={<SparkleIcon size={24} color={S.ia} strokeWidth={1.9} />} />
      </div>

      {preview.length > 0 && (
        <>
          <SecLabel acao="Ver todos" onAcao={onOpenAcompanhando}>Processos que você segue</SecLabel>
          <div style={CARD}>
            {preview.map((item, i) => (
              <button key={item.id} onClick={() => onOpenProcesso(item, "feed")} className="w-full text-left flex items-center gap-3"
                      style={{ padding: "14px 16px", borderTop: i ? `1px solid ${S.linha}` : "none" }}>
                <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: semDe(item.status).fundo }}>
                  <FolderIcon size={18} color={semDe(item.status).cor} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink }}>{item.cliente}</p>
                    <span style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, flexShrink: 0 }}>{item.lastUpdate}</span>
                  </div>
                  <p style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2, marginTop: 2, lineHeight: 1.35 }}>{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      <SecLabel acao={`${novidades} novidades`} onAcao={undefined}>Hoje no escritório</SecLabel>
      <div style={CARD}>
        <FeedItem cliente="Instituto Gnosis" text="Decisão interlocutória publicada na ação cível de cobrança" time="40 min" sem={sem("curso")} tag="Movimentação" onClick={() => onOpenOrg("gnosis")} />
        <FeedItem cliente="AFNE" text="Bloqueio de R$ 18.400 foi levantado" time="3 h" sem={sem("resolvido")} tag="Levantado" onClick={() => onOpenOrg("afne")} />
        <FeedItem cliente="FAS" text="Nova reclamação constitucional protocolada no STF" time="ontem" sem={sem("atencao")} tag="Reclamação" onClick={() => onOpenOrg("fas")} />
        <FeedItem cliente="IGEDES" text="Processo administrativo movimentado" time="2 dias" sem={sem("curso")} tag="Movimentação" onClick={() => onOpenOrg("igedes")} />
        <FeedItem cliente="AFNE" text="Audiência trabalhista remarcada" time="4 dias" sem={sem("atencao")} tag="Remarcação" onClick={() => onOpenOrg("afne")} last />
      </div>

      <SecLabel>Navegar por tipo</SecLabel>
      <div style={CARD}>
        <CardRow icon={<FolderIcon size={20} color={S.ink} />} label="Processos" value={TOTAIS.processos.toLocaleString("pt-BR")} onClick={() => onOpenList("processos")} />
        <CardRow icon={<LockIcon size={20} color={S.ink} />} label="Bloqueios ativos" value={fmtBRLCurto(TOTAIS.bloqueadoAtivo)} onClick={() => onOpenList("bloqueios")} />
        <CardRow icon={<FlagIcon size={20} color={S.ink} />} label="Reclamações" value="3" onClick={() => onOpenList("reclamacoes")} last />
      </div>
    </div>
  );
}

function FeedItem({ cliente, text, time, sem, tag, onClick, last }) {
  return (
    <button onClick={onClick} className="w-full text-left" style={{ padding: "14px 18px", borderBottom: last ? "none" : `1px solid ${S.linha}` }}>
      <div className="flex items-center justify-between gap-3">
        <Etiqueta s={sem} texto={tag} />
        <span style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2 }}>{time}</span>
      </div>
      <p style={{ fontFamily: F.ui, fontSize: 16, color: S.ink, marginTop: 8, lineHeight: 1.4 }}>
        {cliente && <span style={{ fontWeight: 600 }}>{cliente}: </span>}{text}
      </p>
    </button>
  );
}

function ListaGenerica({ tipo, onBack, followed, onOpenProcesso, onOpenBloqueio }) {
  const config = {
    processos: { title: "Processos", data: PROCESSOS_LISTA },
    bloqueios: { title: "Bloqueios", data: BLOQUEIOS_LISTA },
    reclamacoes: { title: "Reclamações", data: RECLAMACOES_LISTA },
  }[tipo];
  const isProcessos = tipo === "processos";

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
        <Faixa bleed={32} onBack={onBack} backLabel="Início" titulo={config.title}
               sub={tipo === "bloqueios" ? `${config.data.filter((b) => b.status === "Ativo").length} ativos de ${config.data.length} na base` : `${config.data.length} na base de exemplo`} />
        {config.data.map((item, i) => {
          const border = { borderBottom: i === config.data.length - 1 ? "none" : `1px solid ${T.hairline}` };
          const inner = (
            <>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <p className="text-[16px] font-medium">{item.cliente}</p>
                  {isProcessos && followed.has(item.id) && <StarIcon filled size={12} />}
                </div>
                <Badge text={item.status} />
              </div>
              <p className="text-[15px] mt-1" style={{ color: T.muted }}>{item.desc || item.valor}</p>
            </>
          );
          if (tipo === "bloqueios") {
            return (
              <button key={item.id} onClick={() => onOpenBloqueio(item, "bloqueios")} className="w-full text-left py-3.5" style={border}>
                {inner}
              </button>
            );
          }
          return isProcessos ? (
            <button key={item.id} onClick={() => onOpenProcesso(item, "processos")} className="w-full text-left py-3.5" style={border}>
              {inner}
            </button>
          ) : (
            <div key={i} className="py-3.5" style={border}>{inner}</div>
          );
        })}
      </div>
    </>
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
        ) : items.map((item, i) => (
          <button key={item.id} onClick={() => onOpen(item)} className="w-full text-left py-3.5"
                  style={{ borderBottom: i === items.length - 1 ? "none" : `1px solid ${T.hairline}` }}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[16px] font-medium">{item.cliente}</p>
              <Badge text={item.status} />
            </div>
            <p className="text-[15px] mt-1" style={{ color: T.muted }}>{item.desc}</p>
          </button>
        ))}
      </div>
    </>
  );
}

export { AcompanhandoLista, FeedItem, InicioFeed, ListaGenerica };
