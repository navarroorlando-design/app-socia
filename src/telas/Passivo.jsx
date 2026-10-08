import React, { useState } from "react";
import { Faixa, SecLabel, SeletorSegmentado } from "../componentes/ui";
import { ORGS, ORG_ORDER, PROCESSOS_LISTA, TOTAIS } from "../dados/base";
import { fmtBRL, fmtBRLCurto } from "../dados/formato";
import { resumoOrg, somaPassivo } from "../dados/passivo";
import { CARD, DADOS, F, S } from "../estilo/tokens";
import { MarcaOrg } from "../componentes/MarcaOrg";
import { ContratoCard, NOTA_PASSIVO } from "./OrgMetricas";
import { Dica } from "../ajuda/Dica";

/* ------------------------------------------------------------------ */
/* Passivo (redesenho v3, seção B.6): topo escuro com o passivo de      */
/* todos os clientes, "Por cliente" (abre a página do cliente) e        */
/* "Contratos" (4 de N, com ordenação e "Ver todos"/"Mostrar menos").    */
/* ------------------------------------------------------------------ */
const ORDENS_CONTRATO = [{ id: "passivo", label: "Maior passivo" }, { id: "vigencia", label: "Vence primeiro" }];
const fimVigencia = (v) => Number(String(v).split("–")[1]);

function Passivo({ onBack, onOpenOrg, onOpenContrato }) {
  const [ordemContratos, setOrdemContratos] = useState("passivo");
  const [verTodos, setVerTodos] = useState(false);

  const passivo = somaPassivo(PROCESSOS_LISTA);
  const nContratos = Object.values(ORGS).reduce((s, o) => s + o.contratos.length, 0);
  const pctBloqueado = passivo.total ? Math.round((TOTAIS.bloqueadoAtivo / passivo.total) * 100) : 0;

  const porCliente = ORG_ORDER
    .map((id) => ({ id, ...resumoOrg(id) }))
    .sort((a, b) => b.passivo.total - a.passivo.total);

  const contratos = ORG_ORDER.flatMap((id) => resumoOrg(id).contratos);
  const ordenados = [...contratos].sort(ordemContratos === "passivo"
    ? (a, b) => b.passivo.total - a.passivo.total
    : (a, b) => fimVigencia(a.vigencia) - fimVigencia(b.vigencia));
  const visiveis = verTodos ? ordenados : ordenados.slice(0, 4);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
      <Faixa bleed={32} onBack={onBack} backLabel="Início" eyebrow="Todos os clientes" titulo="Passivo"
             sub="Risco estimado nos processos dos contratos de gestão" />
      <Dica id="passivo" style={{ marginTop: 0, marginBottom: 16 }} />

      <div style={{ background: S.marca, borderRadius: 24, padding: 20 }}>
        <p style={{ fontFamily: F.ui, fontSize: 15, color: S.marcaTexto2 }}>Passivo estimado · todos os contratos</p>
        <p style={{ fontFamily: F.ui, fontSize: 32, fontWeight: 600, color: "#FFFFFF", letterSpacing: "-0.03em", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{fmtBRL(passivo.total)}</p>
        <p style={{ fontFamily: F.ui, fontSize: 15, color: S.marcaTexto2, marginTop: 6 }}>{nContratos} contratos de gestão · {PROCESSOS_LISTA.length} processos</p>
        <div className="mt-4">
          <div className="flex w-full overflow-hidden" style={{ height: 10, borderRadius: 999, gap: 2 }}>
            {["Provável", "Possível", "Remoto"].map((k) => (
              <span key={k} style={{ width: `${(passivo[k] / (passivo.total || 1)) * 100}%`, background: { Provável: DADOS.prov, Possível: DADOS.poss, Remoto: DADOS.rem }[k] }} />
            ))}
          </div>
          <div className="flex flex-col gap-1.5 mt-3">
            {["Provável", "Possível", "Remoto"].map((k) => (
              <div key={k} className="flex items-center gap-2">
                <span className="shrink-0" style={{ width: 10, height: 10, borderRadius: 3, background: { Provável: DADOS.prov, Possível: DADOS.poss, Remoto: DADOS.rem }[k] }} />
                <span style={{ fontFamily: F.ui, fontSize: 15, color: "#FFFFFF", flex: 1 }}>{k}</span>
                <span style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: "#FFFFFF", fontVariantNumeric: "tabular-nums" }}>{fmtBRL(passivo[k])}</span>
                <span style={{ fontFamily: F.ui, fontSize: 14, color: S.marcaTexto2, width: 36, textAlign: "right" }}>{Math.round((passivo[k] / (passivo.total || 1)) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,.16)" }}>
          <div className="flex items-baseline justify-between gap-2">
            <span style={{ fontFamily: F.ui, fontSize: 15, color: "#FFFFFF" }}>Já bloqueado</span>
            <span style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: "#FFFFFF", fontVariantNumeric: "tabular-nums" }}>{fmtBRL(TOTAIS.bloqueadoAtivo)} <span style={{ color: S.marcaTexto2, fontWeight: 400 }}>{pctBloqueado}%</span></span>
          </div>
          <div className="mt-2" style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,.18)" }}>
            <div style={{ height: 8, borderRadius: 999, width: `${Math.max(2, pctBloqueado)}%`, background: S.osso }} />
          </div>
          <p style={{ fontFamily: F.ui, fontSize: 13, color: S.marcaTexto2, marginTop: 6 }}>do passivo estimado já está retido em bloqueios ativos</p>
        </div>
      </div>

      <SecLabel>Por cliente</SecLabel>
      <div className="flex flex-col gap-3">
        {porCliente.map((o) => {
          const pct = passivo.total ? Math.round((o.passivo.total / passivo.total) * 100) : 0;
          const pctBloqueadoCliente = o.passivo.total ? Math.round((o.bloqueadoAtivo / o.passivo.total) * 100) : 0;
          return (
            <button key={o.id} onClick={() => onOpenOrg(o.id)} className="w-full text-left" style={CARD}>
              <div className="flex items-center gap-3" style={{ padding: 16 }}>
                <MarcaOrg id={o.id} iniciais={ORGS[o.id].initials} size={40} />
                <span className="flex-1 min-w-0">
                  <span className="flex items-baseline justify-between gap-2">
                    <span style={{ fontFamily: F.ui, fontSize: 17, fontWeight: 600, color: S.ink }}>{ORGS[o.id].name}</span>
                    <span style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink, fontVariantNumeric: "tabular-nums" }}>{fmtBRL(o.passivo.total)}</span>
                  </span>
                  <span className="block" style={{ marginTop: 8, height: 8, borderRadius: 999, background: S.linha }}>
                    <span className="block" style={{ height: 8, borderRadius: 999, width: `${Math.max(2, pct)}%`, background: S.oliva }} />
                  </span>
                  <span className="block" style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 6 }}>
                    {o.contratos.length} {o.contratos.length === 1 ? "contrato" : "contratos"} · {fmtBRL(o.bloqueadoAtivo)} bloqueado ({pctBloqueadoCliente}%)
                  </span>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <SecLabel acao={`${visiveis.length} de ${ordenados.length}`}>Contratos</SecLabel>
      <SeletorSegmentado itens={ORDENS_CONTRATO} ativo={ordemContratos} onChange={setOrdemContratos} label="Ordenar contratos" />
      <div className="flex flex-col gap-3 mt-3">
        {visiveis.map((c) => (
          <ContratoCard key={c.orgId + c.orgao} c={c} comCliente legendaCompleta onClick={() => onOpenContrato(c.orgId, c.orgao)} />
        ))}
      </div>
      <button onClick={() => setVerTodos((v) => !v)} className="w-full text-center mt-3"
              style={{ height: 48, borderRadius: 14, fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink, background: S.cartao, boxShadow: CARD.boxShadow }}>
        {verTodos ? "Mostrar menos" : `Ver todos os ${ordenados.length} contratos`}
      </button>

      <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, lineHeight: 1.45, marginTop: 14 }}>{NOTA_PASSIVO}</p>
    </div>
  );
}

export { Passivo };
