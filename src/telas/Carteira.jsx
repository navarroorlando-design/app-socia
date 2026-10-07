import React from "react";
import { ChevronIcon, FolderIcon, LockIcon } from "../componentes/icones";
import { Faixa, KPIs, LinhaLista, SecLabel } from "../componentes/ui";
import { BLOQUEIOS_LISTA, ORGS, ORG_ORDER, PROCESSOS_LISTA, TOTAIS } from "../dados/base";
import { diasEntre, fmtBRL, fmtBRLCurto, fmtData, HOJE } from "../dados/formato";
import { resumoOrg, somaPassivo } from "../dados/passivo";
import { CARD, F, S, SEMANTICA, semDe } from "../estilo/tokens";
import { ContratoCard, NOTA_PASSIVO, PassivoBarra } from "./OrgMetricas";
import { MarcaOrg } from "../componentes/MarcaOrg";

/* ------------------------------------------------------------------ */
/* Carteira: passivo de todos os clientes (visão de sócio)             */
/* ------------------------------------------------------------------ */
function Carteira({ onBack, onOpenOrg, onOpenContrato }) {
  const orgs = ORG_ORDER.map((id) => ({ id, ...resumoOrg(id) })).sort((a, b) => b.passivo.total - a.passivo.total);
  const passivo = somaPassivo(PROCESSOS_LISTA);
  const contratos = orgs.flatMap((o) => o.contratos).sort((a, b) => b.passivo.total - a.passivo.total);
  const maxOrg = Math.max(...orgs.map((o) => o.passivo.total), 1);
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
      <Faixa bleed={32} bloco onBack={onBack} backLabel="Início" eyebrow="Carteira do escritório · passivo estimado"
             titulo={fmtBRL(passivo.total)} tituloCompacto="Carteira" tituloSize={36}
             sub={`${orgs.length} clientes · ${contratos.length} contratos de gestão · ${PROCESSOS_LISTA.length} processos`}>
        <div style={{ ...CARD, padding: 18 }}><PassivoBarra passivo={passivo} /></div>
        <div className="mt-3">
          <KPIs itens={[["Bloqueado", fmtBRLCurto(TOTAIS.bloqueadoAtivo)], ["Processos", String(TOTAIS.processos)], ["Parados 60+", String(TOTAIS.parados)]]} />
        </div>
      </Faixa>

      <SecLabel>Por cliente</SecLabel>
      <div style={CARD}>
        {orgs.map((o, i) => (
          <button key={o.id} onClick={() => onOpenOrg(o.id)} className="w-full text-left flex items-center gap-3"
                  style={{ padding: "14px 16px", borderBottom: i === orgs.length - 1 ? "none" : `1px solid ${S.linha}` }}>
            <MarcaOrg id={o.id} iniciais={ORGS[o.id].initials} size={40} />
            <span className="flex-1 min-w-0">
              <span className="flex items-baseline justify-between gap-2">
                <span style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink }}>{ORGS[o.id].name}</span>
                <span style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{fmtBRLCurto(o.passivo.total)}</span>
              </span>
              <span className="block" style={{ marginTop: 8, height: 8, borderRadius: 999, background: S.linha }}>
                <span className="block" style={{ height: 8, borderRadius: 999, width: `${Math.max(2, (o.passivo.total / maxOrg) * 100)}%`, background: S.oliva }} />
              </span>
              <span className="block" style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 6 }}>{o.contratos.length} contratos · {fmtBRLCurto(o.bloqueadoAtivo)} bloqueado</span>
            </span>
            <ChevronIcon size={16} color={S.texto2} strokeWidth={2} />
          </button>
        ))}
      </div>

      <SecLabel>Contratos com maior passivo</SecLabel>
      <div className="flex flex-col gap-3">
        {contratos.slice(0, 5).map((c) => <ContratoCard key={c.orgId + c.orgao} c={c} comCliente onClick={() => onOpenContrato(c.orgId, c.orgao)} />)}
      </div>
      <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, lineHeight: 1.45, marginTop: 14 }}>{NOTA_PASSIVO}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Movimentações recentes de todos os processos e bloqueios            */
/* ------------------------------------------------------------------ */
function Movimentacoes({ onBack, onOpenProcesso, onOpenBloqueio }) {
  const eventos = [
    ...PROCESSOS_LISTA.map((p) => ({ tipo: "processo", item: p, data: p.ultimaMov, cliente: p.cliente, texto: p.movs[0]?.text || "Movimentação", detalhe: p.desc, sem: semDe(p.status) })),
    ...BLOQUEIOS_LISTA.map((b) => ({ tipo: "bloqueio", item: b, data: b.data, cliente: b.cliente, texto: `Bloqueio de ${b.valor} ${b.status === "Levantado" ? "(já levantado)" : "realizado"}`, detalhe: b.contrato, sem: semDe(b.status) })),
  ].sort((a, b) => b.data - a.data).slice(0, 30);
  const grupo = (d) => { const n = diasEntre(d, HOJE); return n <= 1 ? "Hoje e ontem" : n <= 7 ? "Nesta semana" : "Anteriores"; };
  const grupos = ["Hoje e ontem", "Nesta semana", "Anteriores"].map((g) => [g, eventos.filter((e) => grupo(e.data) === g)]).filter(([, l]) => l.length);
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
      <Faixa bleed={32} onBack={onBack} backLabel="Início" titulo="Movimentações" sub="As mais recentes, de todos os clientes" />
      {grupos.map(([g, lista]) => (
        <div key={g}>
          <SecLabel>{g}</SecLabel>
          <div style={CARD}>
            {lista.map((e, i) => (
              <LinhaLista key={e.tipo + e.item.id} last={i === lista.length - 1} sem={e.sem}
                          onClick={() => (e.tipo === "processo" ? onOpenProcesso(e.item) : onOpenBloqueio(e.item))}
                          icone={e.tipo === "processo" ? <FolderIcon size={18} color={e.sem.cor} /> : <LockIcon size={18} color={e.sem.cor} />}
                          titulo={e.cliente} direita={<span style={{ fontFamily: F.ui, color: S.texto2, fontSize: 14, whiteSpace: "nowrap", paddingTop: 2 }}>{fmtData(e.data).slice(0, 5)}</span>}
                          detalhe={`${e.texto} · ${e.detalhe}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export { Carteira, Movimentacoes };
