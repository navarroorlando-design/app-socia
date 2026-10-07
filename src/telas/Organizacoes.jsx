import React, { useState } from "react";
import { ChevronIcon, FlagIcon, FolderIcon, LockIcon } from "../componentes/icones";
import { Etiqueta, Faixa, KPIs, Row, SecLabel } from "../componentes/ui";
import { BLOQUEIOS_LISTA, ORGS, ORG_ORDER, OUTRAS_ORGS } from "../dados/base";
import { CARD, F, LINK, S, SEMANTICA, T } from "../estilo/tokens";
import { AskBar } from "./Ia";
import { FeedItem } from "./Inicio";

/* ------------------------------------------------------------------ */
/* Telas: OS                                                           */
/* ------------------------------------------------------------------ */
function OsLista({ onOpenOrg, ordem = ORG_ORDER }) {
  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 110 }}>
        <Faixa bleed={32} eyebrow="Clientes do escritório" titulo="Organizações" tituloSize={36}
               sub={`${ordem.length} principais e ${OUTRAS_ORGS.length + 14} outras`} />
        <SecLabel>Principais clientes</SecLabel>
        <div className="flex flex-col">
          {ordem.map((id, i) => {
            const o = ORGS[id];
            return (
              <button key={id} onClick={() => onOpenOrg(id)} className="flex items-center gap-3 py-3.5 w-full text-left"
                      style={{ borderBottom: i === ordem.length - 1 ? "none" : `1px solid ${T.hairline}` }}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-serif-legal text-[15px]" style={{ background: T.ink, color: T.paper }}>{o.initials}</div>
                <div className="flex-1">
                  <p className="text-[17px] font-medium">{o.name}</p>
                  <p className="text-[14px] mt-0.5" style={{ color: T.muted }}>{o.processos} processos, {o.bloqueadoCurto} bloqueado</p>
                </div>
                <ChevronIcon size={15} color={T.muted} strokeWidth={2} />
              </button>
            );
          })}
        </div>

        <SecLabel>Outras organizações</SecLabel>
        <div className="flex flex-col">
          {OUTRAS_ORGS.map((o) => (
            <div key={o.name} className="flex items-center justify-between py-2.5" style={{ borderBottom: `1px solid ${T.hairline}` }}>
              <p className="text-[15px]">{o.name}</p>
              <p className="text-[14px]" style={{ color: T.muted, fontVariantNumeric: "tabular-nums" }}>{o.processos}</p>
            </div>
          ))}
          <div className="flex items-center justify-between py-3 mt-1">
            <p className="text-[15px]" style={LINK}>Ver mais 14 organizações</p>
          </div>
        </div>
      </div>
    </>
  );
}

function OsPerfil({ orgId, onBack, sample, onAsk }) {
  const o = ORGS[orgId];
  const [q, setQ] = useState("");
  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 150 }}>
        <Faixa bleed={32} onBack={onBack} backLabel="Organizações"
               eyebrow={`${o.name} · bloqueado hoje`} titulo={o.bloqueado} tituloCompacto={o.name} tituloSize={40} sub={`${o.processos} processos na base`}
               aside={<span className="w-14 h-14 rounded-full flex items-center justify-center shrink-0" style={{ background: S.ink, color: "#FFFFFF", fontFamily: F.display, fontSize: 18, fontWeight: 600 }}>{o.initials}</span>}>
          <KPIs itens={[
            ["Processos", String(o.processos)],
            ["Bloqueios", String(BLOQUEIOS_LISTA.filter((b) => b.clienteId === orgId && b.status === "Ativo").length)],
            ["Contratos", String(o.contratos.length)],
          ]} />
          <div className="mt-3" style={CARD}>
            <p style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.texto2, padding: "14px 18px 0" }}>O que mudou aqui</p>
            {o.feed.map((f, i) => {
              const t = /levantad/i.test(f.text) ? ["resolvido", "Levantado"] : /reclama/i.test(f.text) ? ["atencao", "Reclamação"] : /remarcad/i.test(f.text) ? ["atencao", "Remarcação"] : ["curso", "Movimentação"];
              return <FeedItem key={i} text={f.text} time={f.time} sem={SEMANTICA.find((x) => x.id === t[0])} tag={t[1]} last={i === o.feed.length - 1} />;
            })}
          </div>
        </Faixa>

        <SecLabel>Contratos de gestão</SecLabel>
        <div className="flex flex-col gap-2.5">
          {o.contratos.map((c, i) => {
            const fim = Number(String(c.vigencia).split("–")[1]);
            const st = fim < 2026 ? { s: SEMANTICA.find((x) => x.id === "atencao"), t: `Vigência encerrada em ${fim}` }
                     : fim === 2026 ? { s: SEMANTICA.find((x) => x.id === "atencao"), t: "Vence este ano" }
                     : { s: SEMANTICA.find((x) => x.id === "curso"), t: "Vigente" };
            const destaque = st.s.id === "atencao";
            return (
              <div key={i} style={destaque ? { background: st.s.fundo, borderRadius: 18, padding: 18 } : { ...CARD, padding: 18 }}>
                <p style={{ fontFamily: F.ui, fontSize: 17, fontWeight: 600, color: S.ink }}>{c.orgao}</p>
                <p style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2, marginTop: 2 }}>Vigência {c.vigencia}</p>
                <div className="mt-2.5"><Etiqueta s={st.s} texto={st.t} sobreCor={destaque} /></div>
              </div>
            );
          })}
        </div>

        <SecLabel>Nesta organização</SecLabel>
        <div style={CARD}>
          <Row icon={<FolderIcon size={19} />} label="Processos" value={String(o.processos)} />
          <Row icon={<LockIcon size={19} />} label="Bloqueios" value={o.bloqueadoCurto} />
          <Row icon={<FlagIcon size={19} />} label="Reclamações" value="—" last />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-6 pb-7 pt-5" style={{ background: `linear-gradient(to top, ${T.paper} 70%, transparent)` }}>
        {sample === null && <p className="text-[14px] mb-2" style={{ color: T.muted }}>A IA responde quando este app é aberto no Claude.</p>}
        <AskBar value={q} onChange={setQ} onSubmit={(t) => { onAsk(t); setQ(""); }} disabled={!sample}
                scopeLabel={`Perguntando sobre ${o.name}`} placeholder={`Pergunte sobre ${o.name.startsWith("I") ? "o" : "a"} ${o.name}…`} />
      </div>
    </>
  );
}

export { OsLista, OsPerfil };
