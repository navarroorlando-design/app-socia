import React, { useState } from "react";
import { FlagIcon, FolderIcon, LockIcon } from "../componentes/icones";
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
        {/* grade 2×2: todos os principais ficam visíveis, sem rolar para o lado */}
        <div className="grid grid-cols-2 gap-3">
          {ordem.map((id) => {
            const o = ORGS[id];
            return (
              <button key={id} onClick={() => onOpenOrg(id)} className="flex flex-col items-start text-left min-w-0"
                      aria-label={`${o.name}: ${o.bloqueadoCurto} bloqueado, ${o.processos} processos`}
                      style={{ ...CARD, padding: 16, gap: 12 }}>
                <span className="flex items-center justify-center shrink-0" style={{ width: 44, height: 44, borderRadius: 999, background: S.marca, color: "#FFFFFF", fontFamily: F.display, fontSize: 15, fontWeight: 600 }}>{o.initials}</span>
                <span className="block min-w-0 w-full">
                  <span className="block" style={{ fontFamily: F.ui, fontSize: 17, fontWeight: 600, color: S.ink, lineHeight: 1.25, minHeight: "2.5em" }}>{o.name}</span>
                  <span className="block" style={{ fontFamily: F.ui, fontSize: 21, fontWeight: 600, color: S.ink, letterSpacing: "-0.02em", marginTop: 8, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{o.bloqueadoCurto}</span>
                  <span className="block" style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2 }}>bloqueado</span>
                  <span className="block" style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 6 }}>{o.processos} processos</span>
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

function OsPerfil({ orgId, onBack, sample, onAsk }) {
  const o = ORGS[orgId];
  const [q, setQ] = useState("");
  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 150 }}>
        <Faixa bleed={32} bloco onBack={onBack} backLabel="Organizações"
               eyebrow={`${o.name} · bloqueado hoje`} titulo={o.bloqueado} tituloCompacto={o.name} tituloSize={40} sub={`${o.processos} processos na base`}
               aside={<span className="w-14 h-14 rounded-full flex items-center justify-center shrink-0" style={{ background: "#FFFDF9", color: S.marca, fontFamily: F.display, fontSize: 18, fontWeight: 600 }}>{o.initials}</span>}>
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
              <div key={i} style={destaque ? { background: st.s.fundo, borderRadius: 24, padding: 18 } : { ...CARD, padding: 18 }}>
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

      <div className="absolute bottom-0 left-0 right-0 px-6 pb-7 pt-8" style={{ background: `linear-gradient(to top, ${T.paper} calc(100% - 24px), transparent)` }}>
        {sample === null && <p className="text-[14px] mb-2" style={{ color: T.muted }}>A IA responde quando este app é aberto no Claude.</p>}
        <AskBar value={q} onChange={setQ} onSubmit={(t) => { onAsk(t); setQ(""); }} disabled={!sample}
                scopeLabel={`Perguntando sobre ${o.name}`} placeholder={`Pergunte sobre ${o.name.startsWith("I") ? "o" : "a"} ${o.name}…`} />
      </div>
    </>
  );
}

export { OsLista, OsPerfil };
