import React, { useState } from "react";
import { ChevronIcon, FlagIcon } from "../componentes/icones";
import { Faixa, SecLabel } from "../componentes/ui";
import { ORGS, ORG_ORDER, OUTRAS_ORGS, RECLAMACOES_LISTA } from "../dados/base";
import { fmtBRL, fmtBRLCurto } from "../dados/formato";
import { resumoOrg } from "../dados/passivo";
import { CARD, F, LINK, S, SEMANTICA, T } from "../estilo/tokens";
import { AskBar } from "./Ia";
import { FeedItem } from "./Inicio";
import { ContratoCard } from "./OrgMetricas";
import { Anotacao } from "../pessoal";
import { Dica } from "../ajuda/Dica";
import { MarcaOrg } from "../componentes/MarcaOrg";

/* ------------------------------------------------------------------ */
/* Telas: OS                                                           */
/* ------------------------------------------------------------------ */
function OsLista({ onOpenOrg, ordem = ORG_ORDER }) {
  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 110 }}>
        <Faixa bleed={32} eyebrow="Clientes do escritório" titulo="Organizações" tituloSize={36}
               sub={`${ordem.length} principais e ${OUTRAS_ORGS.length + 14} outras`} />
        <Dica id="osLista" style={{ marginTop: 0 }} />
        <SecLabel>Principais clientes</SecLabel>
        {/* grade 2×2: todos os principais ficam visíveis, sem rolar para o lado */}
        <div className="grid grid-cols-2 gap-3">
          {ordem.map((id) => {
            const o = ORGS[id];
            return (
              <button key={id} onClick={() => onOpenOrg(id)} className="flex flex-col items-start text-left min-w-0"
                      aria-label={`${o.name}: ${o.processos} processos`}
                      style={{ ...CARD, padding: 16, gap: 12 }}>
                <MarcaOrg id={id} iniciais={o.initials} size={44} />
                <span className="block min-w-0 w-full">
                  <span className="block" style={{ fontFamily: F.ui, fontSize: 17, fontWeight: 600, color: S.ink, lineHeight: 1.25, minHeight: "2.5em" }}>{o.name}</span>
                  <span className="block" style={{ fontFamily: F.ui, fontSize: 28, fontWeight: 600, color: S.ink, letterSpacing: "-0.02em", marginTop: 8, fontVariantNumeric: "tabular-nums" }}>{o.processos}</span>
                  <span className="block" style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2 }}>processos</span>
                </span>
              </button>
            );
          })}
        </div>

        <SecLabel>Outras organizações</SecLabel>
        <div style={CARD}>
          {OUTRAS_ORGS.map((o) => (
            <div key={o.name} className="flex items-center justify-between gap-3" style={{ padding: "14px 18px", borderBottom: `1px solid ${S.linha}` }}>
              <p style={{ fontFamily: F.ui, fontSize: 16, color: S.ink }}>{o.name}</p>
              <p style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{o.processos} processos</p>
            </div>
          ))}
          <p style={{ ...LINK, fontFamily: F.ui, fontSize: 16, padding: "14px 18px" }}>Ver mais 14 organizações</p>
        </div>
      </div>
    </>
  );
}

function OsPerfil({ orgId, onBack, sample, onAsk, onOpenContratos, onOpenContrato, onOpenBloqueios, onOpenProcessos, onOpenReclamacoes }) {
  const o = ORGS[orgId], r = resumoOrg(orgId);
  const reclamacoes = RECLAMACOES_LISTA.filter((x) => x.clienteId === orgId);
  const [q, setQ] = useState("");
  // Atalho de métrica: contratos (o que o cliente mais pergunta) em destaque, depois bloqueios e processos.
  const Metrica = ({ rotulo, valor, detalhe, onClick, tom, largo }) => {
    const t = { oliva: [S.oliva, "#FFFFFF", "#E6E1D6"], osso: [S.osso, S.ink, S.ossoTexto2], cartao: [S.cartao, S.ink, S.texto2] }[tom];
    return (
      <button onClick={onClick} className={`text-left flex flex-col min-w-0 ${largo ? "col-span-2" : ""}`}
              style={{ ...CARD, background: t[0], boxShadow: tom === "cartao" ? CARD.boxShadow : "none", padding: 16 }}>
        <span className="flex items-center justify-between gap-2 w-full">
          <span style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: t[1] }}>{rotulo}</span>
          <ChevronIcon size={16} color={t[1]} strokeWidth={2} />
        </span>
        <span style={{ fontFamily: F.ui, fontSize: largo ? 28 : 22, fontWeight: 600, color: t[1], letterSpacing: "-0.02em", marginTop: 8, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{valor}</span>
        <span style={{ fontFamily: F.ui, fontSize: 14, color: t[2], marginTop: 2, lineHeight: 1.3 }}>{detalhe}</span>
      </button>
    );
  };
  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 150 }}>
        <Faixa bleed={32} bloco onBack={onBack} backLabel="Organizações"
               eyebrow="Organização social" titulo={o.name} tituloCompacto={o.name} tituloSize={32}
               sub={`${r.contratos.length} contratos de gestão · ${r.processos.length} processos`}
               aside={<MarcaOrg id={orgId} iniciais={o.initials} size={56} claro />}>
          <div className="grid grid-cols-2 gap-3">
            <Metrica largo tom="oliva" rotulo="Contratos de gestão" valor={fmtBRL(r.passivo.total)}
                     detalhe={`Passivo estimado em ${r.contratos.length} contratos`} onClick={onOpenContratos} />
            <Metrica tom="osso" rotulo="Bloqueios" valor={fmtBRLCurto(r.bloqueadoAtivo)} detalhe={`${r.bloqueiosAtivos} ativos`} onClick={onOpenBloqueios} />
            <Metrica tom="cartao" rotulo="Processos" valor={String(r.processos.length)} detalhe={`${r.processos.filter((p) => p.diasParado >= 60).length} parados há 60+ dias`} onClick={onOpenProcessos} />
          </div>
          <button onClick={onOpenReclamacoes} className="w-full text-left flex items-center gap-3 mt-3" style={{ ...CARD, padding: "14px 16px" }}>
            <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#EFEBE2" }}><FlagIcon size={18} color={S.ink} /></span>
            <span className="flex-1 min-w-0">
              <span className="block" style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink }}>Reclamações no STF</span>
              <span className="block" style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2 }}>{reclamacoes.length === 0 ? "Nenhuma" : `${reclamacoes.filter((x) => x.status !== "Julgada").length} em andamento · ${reclamacoes.length} no total`}</span>
            </span>
            <ChevronIcon size={16} color={S.texto2} strokeWidth={2} />
          </button>
          <Anotacao chave={`org:${orgId}`} sobre={o.name} />
        </Faixa>
        <Dica id="osPerfil" />

        <SecLabel acao="Ver todos" onAcao={onOpenContratos}>Passivo por contrato</SecLabel>
        <div className="flex flex-col gap-3">
          {r.contratos.map((c) => <ContratoCard key={c.orgao} c={c} onClick={() => onOpenContrato(c.orgao)} />)}
        </div>

        <SecLabel>O que mudou aqui</SecLabel>
        <div style={CARD}>
          {o.feed.map((f, i) => {
            const t = /levantad/i.test(f.text) ? ["resolvido", "Levantado"] : /reclama/i.test(f.text) ? ["atencao", "Reclamação"] : /remarcad/i.test(f.text) ? ["atencao", "Remarcação"] : ["curso", "Movimentação"];
            return <FeedItem key={i} text={f.text} time={f.time} sem={SEMANTICA.find((x) => x.id === t[0])} tag={t[1]} last={i === o.feed.length - 1} />;
          })}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-6 pb-7 pt-8" style={{ background: `linear-gradient(to top, ${T.paper} calc(100% - 24px), transparent)` }}>
        {sample === null && <p className="text-[14px] mb-2" style={{ color: T.muted }}>A IA responde quando este app é aberto no Claude.</p>}
        <AskBar value={q} onChange={setQ} onSubmit={(t) => { onAsk(t); setQ(""); }} disabled={!sample}
                scopeLabel={`Perguntando sobre ${o.name}`} placeholder={`Pergunte sobre ${o.name.startsWith("I") ? "o" : "a"} ${o.name}…`} />
      </div>
    </>
  );
}

export { OsLista, OsPerfil };
