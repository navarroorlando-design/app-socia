import React, { useState } from "react";
import { ChevronIcon, FlagIcon, FolderIcon, LockIcon, TendenciaIcon } from "../componentes/icones";
import { Faixa, Fonte, SecLabel, SeloExemplo } from "../componentes/ui";
import { ORGS, ORG_ORDER, OUTRAS_ORGS, RECLAMACOES_LISTA } from "../dados/base";
import { fmtBRL } from "../dados/formato";
import { FONTE_REAL, realCliente } from "../dados/reais";
import { encerradosDe, resumoOrg } from "../dados/passivo";
import { CARD, DADOS, F, LINK, S, SEMANTICA, T } from "../estilo/tokens";
import { AskBar } from "./Ia";
import { FeedItem } from "./Inicio";
import { ContratoCard } from "./OrgMetricas";
import { Anotacao, BotaoAlerta } from "../pessoal";
import { Dica } from "../ajuda/Dica";
import { LogoOrg, MarcaOrg, tomOrg } from "../componentes/MarcaOrg";
import { MARCAS } from "../componentes/marcas";

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
            const nReal = realCliente(id)?.processos ?? o.processos;
            return (
              <button key={id} onClick={() => onOpenOrg(id)} className="flex flex-col items-start text-left min-w-0"
                      aria-label={`${o.name}: ${nReal} processos`}
                      style={{ ...CARD, padding: 10, gap: 10, background: tomOrg(id) }}>
                {MARCAS[id]?.logo ? <LogoOrg id={id} /> : <MarcaOrg id={id} iniciais={o.initials} size={44} />}
                <span className="block min-w-0 w-full" style={{ padding: "2px 6px 6px" }}>
                  <span className="block" style={{ fontFamily: F.ui, fontSize: 17, fontWeight: 600, color: S.ink, lineHeight: 1.25, minHeight: "2.5em" }}>{o.name}</span>
                  <span className="block" style={{ fontFamily: F.ui, fontSize: 28, fontWeight: 600, color: S.ink, letterSpacing: "-0.02em", marginTop: 8, fontVariantNumeric: "tabular-nums" }}>{nReal.toLocaleString("pt-BR")}</span>
                  <span className="block" style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2 }}>processos</span>
                </span>
              </button>
            );
          })}
        </div>
        <Fonte>{FONTE_REAL}</Fonte>

        <SecLabel>Outras organizações <SeloExemplo /></SecLabel>
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

/* Página única do cliente (redesenho v3, seção B.4): o mesmo componente abre pela aba Clientes,
   pelo Passivo, pelo seletor de cliente dos Bloqueios e pela tela de contrato. */
function OsPerfil({ orgId, onBack, backLabel = "Clientes", sample, onAsk, onOpenContratos, onOpenContrato, onOpenProcessos, onOpenReclamacoes, onOpenBloqueiosAtivos, onOpenDesempenhoAno }) {
  const o = ORGS[orgId], r = resumoOrg(orgId);
  const reclamacoes = RECLAMACOES_LISTA.filter((x) => x.clienteId === orgId);
  const nEncerrados = encerradosDe(orgId).length;
  const pctBloqueado = r.passivo.total ? Math.round((r.bloqueadoAtivo / r.passivo.total) * 100) : 0;
  const contratosVisiveis = r.contratos.slice(0, 2);
  const [q, setQ] = useState("");
  const real = realCliente(orgId);
  // "Institucional" e "Múltiplos contratos" são agrupamentos do cadastro, não contratos de gestão.
  const contratosReais = real ? real.contratos.filter((k) => !/^(institucional|múltiplos contratos)$/i.test(k.nome)) : [];
  const [verTodosReais, setVerTodosReais] = useState(false);

  const VerTambem = ({ Icone, rotulo, detalhe, onClick }) => (
    <button onClick={onClick} className="flex-1 text-left flex flex-col min-w-0 pressable" style={{ ...CARD, padding: 14 }}>
      <span className="flex items-center justify-center shrink-0" style={{ width: 34, height: 34, borderRadius: 999, background: "#EFEBE2" }}>
        <Icone size={17} color={S.ink} strokeWidth={1.8} />
      </span>
      <span className="block" style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.ink, marginTop: 8 }}>{rotulo}</span>
      <span className="block" style={{ fontFamily: F.ui, fontSize: 13, color: S.texto2, marginTop: 2 }}>{detalhe}</span>
    </button>
  );

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 150 }}>
        <Faixa bleed={32} onBack={onBack} backLabel={backLabel} eyebrow="Cliente" titulo={o.name} tituloCompacto={o.name} tituloSize={32} />

        {/* cabeçalho: logo no tom da organização, processos e contratos/encerrados */}
        <div className="flex items-center gap-3" style={{ ...CARD, background: tomOrg(orgId), boxShadow: "none", padding: 14 }}>
          {MARCAS[orgId]?.logo ? <span style={{ width: 96 }}><LogoOrg id={orgId} altura={52} /></span> : <MarcaOrg id={orgId} iniciais={o.initials} size={48} />}
          <span className="flex-1 min-w-0">
            <span className="block" style={{ fontFamily: F.ui, fontSize: 24, fontWeight: 600, color: S.ink, letterSpacing: "-0.02em" }}>{(real?.processos ?? r.processos.length).toLocaleString("pt-BR")} processos</span>
            <span className="block" style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 2 }}>
              {real ? `${contratosReais.length} ${contratosReais.length === 1 ? "contrato" : "contratos"} no cadastro` : `${r.contratos.length} contratos de gestão`} · {nEncerrados} {nEncerrados === 1 ? "encerrado" : "encerrados"} em 2026 (exemplo)
            </span>
          </span>
        </div>

        {/* topo escuro: passivo do cliente, por prognóstico, e já bloqueado */}
        <div className="mt-4" style={{ background: S.marca, borderRadius: 24, padding: 20 }}>
          <p className="flex items-center gap-2 flex-wrap" style={{ fontFamily: F.ui, fontSize: 15, color: S.marcaTexto2 }}>Passivo estimado · {o.name} <SeloExemplo sobreCor /></p>
          <p style={{ fontFamily: F.ui, fontSize: 32, fontWeight: 600, color: "#FFFFFF", letterSpacing: "-0.03em", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{fmtBRL(r.passivo.total)}</p>
          <p style={{ fontFamily: F.ui, fontSize: 15, color: S.marcaTexto2, marginTop: 6 }}>{r.contratos.length} contratos de gestão · {r.processos.length} processos</p>
          <div className="mt-4">
            <div className="flex w-full overflow-hidden" style={{ height: 10, borderRadius: 999, gap: 2 }}>
              {["Provável", "Possível", "Remoto"].map((k) => (
                <span key={k} style={{ width: `${(r.passivo[k] / (r.passivo.total || 1)) * 100}%`, background: { Provável: DADOS.prov, Possível: DADOS.poss, Remoto: DADOS.rem }[k] }} />
              ))}
            </div>
            <div className="flex flex-col gap-1.5 mt-3">
              {["Provável", "Possível", "Remoto"].map((k) => (
                <div key={k} className="flex items-center gap-2">
                  <span className="shrink-0" style={{ width: 10, height: 10, borderRadius: 3, background: { Provável: DADOS.prov, Possível: DADOS.poss, Remoto: DADOS.rem }[k] }} />
                  <span style={{ fontFamily: F.ui, fontSize: 15, color: "#FFFFFF", flex: 1 }}>{k}</span>
                  <span style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: "#FFFFFF", fontVariantNumeric: "tabular-nums" }}>{fmtBRL(r.passivo[k])}</span>
                  <span style={{ fontFamily: F.ui, fontSize: 14, color: S.marcaTexto2, width: 36, textAlign: "right" }}>{Math.round((r.passivo[k] / (r.passivo.total || 1)) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,.16)" }}>
            <div className="flex items-baseline justify-between gap-2">
              <span style={{ fontFamily: F.ui, fontSize: 15, color: "#FFFFFF" }}>Já bloqueado</span>
              <span style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: "#FFFFFF", fontVariantNumeric: "tabular-nums" }}>
                {fmtBRL(r.bloqueadoAtivo)} <span style={{ color: S.marcaTexto2, fontWeight: 400 }}>{pctBloqueado}%</span>
              </span>
            </div>
            <div className="mt-2" style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,.18)" }}>
              <div style={{ height: 8, borderRadius: 999, width: `${Math.max(2, pctBloqueado)}%`, background: S.osso }} />
            </div>
          </div>
        </div>
        <Dica id="osPerfil" />
        <BotaoAlerta base={{ tipo: "bloqueio_cliente", orgId }} rotulo="Avisar se o bloqueado passar de um valor" titulo="Avisar sobre bloqueios" />
        <Anotacao chave={`org:${orgId}`} sobre={o.name} />

        {real && (
          <>
            <SecLabel>No cadastro</SecLabel>
            <div style={{ ...CARD, padding: 18 }}>
              <div className="flex flex-col" style={{ gap: 6 }}>
                {Object.entries(real.porArea).sort((a, b) => b[1] - a[1]).map(([area, n]) => (
                  <div key={area} className="flex items-baseline justify-between gap-2">
                    <span style={{ fontFamily: F.ui, fontSize: 16, color: S.ink }}>{area}</span>
                    <span style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink, fontVariantNumeric: "tabular-nums" }}>{n.toLocaleString("pt-BR")}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col mt-4 pt-3" style={{ gap: 6, borderTop: `1px solid ${S.linha}` }}>
                {[["Ainda bloqueado", real.bloqueado], ["Já devolvido", real.devolvido], ["Pago à outra parte", real.pago]].map(([rot, v]) => (
                  <div key={rot} className="flex items-baseline justify-between gap-2">
                    <span style={{ fontFamily: F.ui, fontSize: 16, color: S.ink }}>{rot}</span>
                    <span style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink, fontVariantNumeric: "tabular-nums" }}>{fmtBRL(v)}</span>
                  </div>
                ))}
                <span style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2 }}>
                  {real.comValor === 0 ? "Nenhum processo com valor bloqueado" : `${real.comValor} ${real.comValor === 1 ? "processo" : "processos"} com valor bloqueado`}
                </span>
              </div>
              <Fonte style={{ marginTop: 12 }}>{FONTE_REAL}</Fonte>
            </div>

            <SecLabel acao={`${(verTodosReais ? real.contratos : real.contratos.slice(0, 5)).length} de ${real.contratos.length}`}>Por contrato no cadastro</SecLabel>
            <div style={CARD}>
              {(verTodosReais ? real.contratos : real.contratos.slice(0, 5)).map((k, i, arr) => (
                <div key={k.nome} style={{ padding: "14px 18px", borderBottom: i === arr.length - 1 ? "none" : `1px solid ${S.linha}` }}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink, lineHeight: 1.3 }}>{k.nome}</span>
                    <span style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{k.processos} {k.processos === 1 ? "processo" : "processos"}</span>
                  </div>
                  {(k.bloqueado > 0 || k.devolvido > 0 || k.pago > 0) && (
                    <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 4, lineHeight: 1.4 }}>
                      {[k.bloqueado > 0 && `${fmtBRL(k.bloqueado)} bloqueado`, k.devolvido > 0 && `${fmtBRL(k.devolvido)} devolvido`, k.pago > 0 && `${fmtBRL(k.pago)} pago`].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {real.contratos.length > 5 && (
              <button onClick={() => setVerTodosReais((v) => !v)} className="w-full text-center mt-3 pressable"
                      style={{ height: 48, borderRadius: 14, fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink, background: S.cartao, boxShadow: CARD.boxShadow }}>
                {verTodosReais ? "Mostrar menos" : `Ver todos os ${real.contratos.length}`}
              </button>
            )}
          </>
        )}

        <SecLabel acao={r.contratos.length > 2 ? "Ver todos" : undefined} onAcao={onOpenContratos}>Passivo por contrato <SeloExemplo /></SecLabel>
        <div className="flex flex-col gap-3">
          {contratosVisiveis.map((c) => <ContratoCard key={c.orgao} c={c} onClick={() => onOpenContrato(c.orgao)} />)}
        </div>
        {r.contratos.length > 2 && (
          <button onClick={onOpenContratos} className="w-full text-center mt-3"
                  style={{ height: 48, borderRadius: 14, fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink, background: S.cartao, boxShadow: CARD.boxShadow }}>
            Ver todos os {r.contratos.length} contratos
          </button>
        )}

        <SecLabel>Ver também</SecLabel>
        <div className="flex gap-3">
          <VerTambem Icone={LockIcon} rotulo="Bloqueios" detalhe={real ? `${real.comValor} com valor` : `${r.bloqueiosAtivos} ativos`} onClick={onOpenBloqueiosAtivos} />
          <VerTambem Icone={TendenciaIcon} rotulo="Desempenho" detalhe="No ano" onClick={onOpenDesempenhoAno} />
          <VerTambem Icone={FolderIcon} rotulo="Processos" detalhe={`${(real?.processos ?? r.processos.length).toLocaleString("pt-BR")} no total`} onClick={onOpenProcessos} />
        </div>

        <button onClick={onOpenReclamacoes} className="w-full text-left flex items-center gap-3 mt-3" style={{ ...CARD, padding: "14px 16px" }}>
          <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#EFEBE2" }}><FlagIcon size={18} color={S.ink} /></span>
          <span className="flex-1 min-w-0">
            <span className="flex items-center gap-2" style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink }}>Reclamações no STF <SeloExemplo /></span>
            <span className="block" style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2 }}>{reclamacoes.length === 0 ? "Nenhuma" : `${reclamacoes.filter((x) => x.status !== "Julgada").length} em andamento · ${reclamacoes.length} no total`}</span>
          </span>
          <ChevronIcon size={16} color={S.texto2} strokeWidth={2} />
        </button>

        <SecLabel>O que mudou aqui <SeloExemplo /></SecLabel>
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
