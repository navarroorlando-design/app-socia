import React, { useState } from "react";
import { ChevronIcon } from "../componentes/icones";
import { Faixa, SecLabel } from "../componentes/ui";
import { CLIENTE_NOME, ENCERRADOS_2026, ORGS, ORG_ORDER, PROCESSOS_LISTA } from "../dados/base";
import { fmtBRL, fmtBRLCurto } from "../dados/formato";
import { resumoOrg, somaPassivo } from "../dados/passivo";
import { CARD, F, S, SEMANTICA, semDe } from "../estilo/tokens";
import { MarcaOrg } from "../componentes/MarcaOrg";
import { ContratoCard, NOTA_PASSIVO, PassivoBarra } from "./OrgMetricas";

/* ------------------------------------------------------------------ */
/* Escritório: visão de todos os clientes, em duas abas.                */
/* Passivo (antiga Carteira) e Desempenho (resultado dos processos      */
/* encerrados). Aberta pelo atalho "Escritório" no Início.              */
/* ------------------------------------------------------------------ */
const sem = (id) => SEMANTICA.find((x) => x.id === id);

function Aba({ ativo, onClick, children }) {
  return (
    <button role="tab" aria-selected={ativo} onClick={onClick} className="flex-1 text-center"
            style={{ height: 44, borderRadius: 12, fontFamily: F.ui, fontSize: 16, fontWeight: ativo ? 700 : 500,
                     background: ativo ? S.marca : S.cartao, color: ativo ? "#FFFFFF" : S.ink,
                     boxShadow: ativo ? "none" : CARD.boxShadow }}>
      {children}
    </button>
  );
}

/* ---------------------------- Passivo ------------------------------ */
function AbaPassivo({ onOpenOrg, onOpenContrato }) {
  const orgs = ORG_ORDER.map((id) => ({ id, ...resumoOrg(id) })).sort((a, b) => b.passivo.total - a.passivo.total);
  const contratos = orgs.flatMap((o) => o.contratos).sort((a, b) => b.passivo.total - a.passivo.total);
  const maxOrg = Math.max(...orgs.map((o) => o.passivo.total), 1);
  return (
    <>
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
    </>
  );
}

/* --------------------------- Desempenho ----------------------------- */
// Categorias simplificadas: o que o encerramento significou para o escritório/cliente.
// Nesta base de exemplo, por QUANTIDADE de processos. A unidade certa (quantidade ou valor)
// e os nomes das categorias ainda precisam ser validados com o escritório.
const RESULTADOS = [
  { id: "Favorável", nome: "Favorável", s: sem("resolvido") },
  { id: "Acordo", nome: "Acordo", s: sem("atencao") },
  { id: "Desfavorável", nome: "Desfavorável", s: sem("risco") },
];

function AbaDesempenho() {
  const total = ENCERRADOS_2026.length;
  const porResultado = RESULTADOS.map((r) => ({ ...r, n: ENCERRADOS_2026.filter((e) => e.resultado === r.id).length }));
  const pctFavoravel = total ? Math.round(((porResultado[0].n + porResultado[1].n) / total) * 100) : 0;
  const porCliente = ORG_ORDER
    .map((id) => ({ id, n: ENCERRADOS_2026.filter((e) => e.clienteId === id).length, porResultado: RESULTADOS.map((r) => ENCERRADOS_2026.filter((e) => e.clienteId === id && e.resultado === r.id).length) }))
    .filter((o) => o.n > 0);
  if (total === 0) {
    return <p style={{ fontFamily: F.ui, fontSize: 16, color: S.texto2, lineHeight: 1.5 }}>Nenhum processo encerrado em 2026 ainda.</p>;
  }
  return (
    <>
      <div style={{ ...CARD, padding: 18 }}>
        <p style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2 }}>Índice de êxito em 2026</p>
        <p style={{ fontFamily: F.ui, fontSize: 36, fontWeight: 600, color: S.ink, letterSpacing: "-0.03em", marginTop: 2 }}>{pctFavoravel}%</p>
        <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 2 }}>{total} processos encerrados · favorável ou com acordo</p>
        <div className="flex mt-4" style={{ height: 16, gap: 2 }}>
          {porResultado.map((r) => r.n > 0 && (
            <span key={r.id} style={{ flex: r.n, background: r.s.cor, borderRadius: 4 }} />
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
          {porResultado.map((r) => (
            <span key={r.id} className="inline-flex items-center gap-1.5" style={{ fontFamily: F.ui, fontSize: 14, color: S.ink }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: r.s.cor }} />{r.nome} · {r.n}
            </span>
          ))}
        </div>
      </div>

      <SecLabel>Por cliente</SecLabel>
      <div className="flex flex-col gap-3">
        {porCliente.map((o) => {
          const max = Math.max(o.n, 1);
          return (
            <div key={o.id} style={{ ...CARD, padding: 16 }}>
              <div className="flex items-center gap-3">
                <MarcaOrg id={o.id} iniciais={ORGS[o.id].initials} size={36} />
                <span className="flex-1 min-w-0" style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink }}>{CLIENTE_NOME[o.id]}</span>
                <span style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2 }}>{o.n} {o.n === 1 ? "encerrado" : "encerrados"}</span>
              </div>
              <div className="flex mt-3" style={{ height: 10, gap: 2 }}>
                {RESULTADOS.map((r, i) => o.porResultado[i] > 0 && <span key={r.id} style={{ flex: o.porResultado[i], background: r.s.cor, borderRadius: 3 }} />)}
              </div>
            </div>
          );
        })}
      </div>
      <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, lineHeight: 1.45, marginTop: 14 }}>
        Favorável: pedido improcedente, extinção ou desistência da parte contrária. Acordo: encerrado por acordo homologado.
        Desfavorável: pedido julgado procedente. Contagem por quantidade de processos, não por valor. Dados de exemplo.
      </p>
    </>
  );
}

/* ------------------------------ Tela --------------------------------- */
function Escritorio({ onBack, onOpenOrg, onOpenContrato }) {
  const [aba, setAba] = useState("passivo");
  const passivo = somaPassivo(PROCESSOS_LISTA);
  const nContratos = Object.values(ORGS).reduce((s, o) => s + o.contratos.length, 0);
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
      <Faixa bleed={32} bloco onBack={onBack} backLabel="Início" eyebrow="Visão do escritório"
             titulo="Escritório" tituloSize={34}
             sub={`${fmtBRL(passivo.total)} de passivo estimado · ${nContratos} contratos de gestão · ${ENCERRADOS_2026.length} processos encerrados em 2026`} />
      <div className="flex gap-2" role="tablist" aria-label="Seções do escritório">
        <Aba ativo={aba === "passivo"} onClick={() => setAba("passivo")}>Passivo</Aba>
        <Aba ativo={aba === "desempenho"} onClick={() => setAba("desempenho")}>Desempenho</Aba>
      </div>
      <div className="mt-4">
        {aba === "passivo" ? <AbaPassivo onOpenOrg={onOpenOrg} onOpenContrato={onOpenContrato} /> : <AbaDesempenho />}
      </div>
    </div>
  );
}

export { Escritorio };
