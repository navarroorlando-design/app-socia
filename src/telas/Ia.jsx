import React, { useState } from "react";
import { CheckIcon, ChevronIcon, PinIcon, SendIcon, SparkleIcon } from "../componentes/icones";
import { BackHeader, Faixa, Sparkline } from "../componentes/ui";
import { CLIENTE_NOME } from "../dados/base";
import { CARD, F, LINK, S, T } from "../estilo/tokens";
import { RelatorioView, fmtValor } from "../ia/RelatorioView";

/* ------------------------- Telas de IA ----------------------------- */
function AskBar({ value, onChange, onSubmit, placeholder, disabled, scopeLabel }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (value.trim()) onSubmit(value.trim()); }}>
      {scopeLabel && (
        <div className="flex mb-2">
          <span className="text-[13px] px-3 py-1 rounded-full" style={{ background: "rgba(150,118,58,0.12)", color: T.brass }}>{scopeLabel}</span>
        </div>
      )}
      <div className="flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full" style={{ background: "white", border: `1px solid ${T.hairline}` }}>
        <SparkleIcon size={16} color={T.brass} />
        <input id={scopeLabel ? "ask-org" : "ask-ia"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
               className="flex-1 bg-transparent outline-none text-[17px] py-1.5 min-w-0" style={{ color: T.ink }} aria-label="Pergunta para a IA" />
        <button type="submit" disabled={disabled || !value.trim()} aria-label="Enviar pergunta"
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: value.trim() && !disabled ? T.brass : "rgba(27,36,48,0.08)" }}>
          <SendIcon color={value.trim() && !disabled ? "white" : T.muted} size={16} />
        </button>
      </div>
    </form>
  );
}

function IaAsk({ onAsk, sample }) {
  const [q, setQ] = useState("");
  const sugestoes = ["Como evoluíram os bloqueios da AFNE em 2026?", "Quais processos trabalhistas estão parados há mais de 90 dias?", "Compare o valor bloqueado entre os 4 clientes"];
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar" style={{ paddingBottom: 96 }}>
      <div className="flex-1 flex flex-col items-center justify-center px-10 text-center" style={{ minHeight: 220, paddingTop: 16, paddingBottom: 16 }}>
        <SparkleIcon size={30} color={S.iaIcone} strokeWidth={1.6} />
        <h1 style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 34, fontWeight: 600, lineHeight: 1.1, color: S.ink, marginTop: 14, textWrap: "balance" }}>Pergunte qualquer coisa!</h1>
        <p style={{ fontFamily: F.ui, fontSize: 16, color: S.texto2, lineHeight: 1.45, marginTop: 10, maxWidth: 290 }}>
          Sobre processos, bloqueios e clientes. A IA monta o relatório com os números do escritório.
        </p>
      </div>
      <div className="px-5 shrink-0">
        {sample === null && (
          <p className="mb-2 text-center" style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2 }}>A IA responde quando este app é aberto no Claude.</p>
        )}
        <div className="flex flex-col gap-2 mb-3">
          {sugestoes.map((sg) => (
            <button key={sg} onClick={() => onAsk(sg)} disabled={!sample} className="text-left flex items-center gap-3"
                    style={{ ...CARD, borderRadius: 16, padding: "12px 16px", opacity: sample ? 1 : 0.55, fontFamily: F.ui, fontSize: 15, color: S.ink, lineHeight: 1.35 }}>
              <span className="flex-1">{sg}</span>
              <ChevronIcon size={16} color={S.texto2} strokeWidth={2} />
            </button>
          ))}
        </div>
        <AskBar value={q} onChange={setQ} onSubmit={(t) => { onAsk(t); setQ(""); }} disabled={!sample} placeholder="Pergunte sobre os números…" />
      </div>
    </div>
  );
}

function PastaRelatorios({ pinned, onOpenPinned, onBack }) {
  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
        <Faixa bleed={32} onBack={onBack} backLabel="Perfil" titulo="Relatórios fixados"
               sub={pinned.length === 0 ? "Nenhum relatório ainda" : pinned.length === 1 ? "1 relatório guardado" : `${pinned.length} relatórios guardados`} />
        {pinned.length === 0 ? (
          <p className="text-[16px] leading-relaxed" style={{ color: T.muted }}>
            Faça uma pergunta na aba IA e toque em "Fixar relatório". Ele fica guardado aqui para você abrir de novo quando quiser.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {pinned.map((p) => {
              const destaque = p.spec.blocos.find((b) => b.tipo === "destaque");
              const linha = p.spec.blocos.find((b) => b.tipo === "linha");
              return (
                <button key={p.id} onClick={() => onOpenPinned(p)} className="w-full text-left p-4 rounded-2xl" style={CARD}>
                  <p className="text-[16px] font-medium leading-snug">{p.spec.titulo}</p>
                  <div className="flex items-end justify-between mt-2 gap-3">
                    <div>
                      {destaque && <p className="font-serif-legal text-[24px] leading-none">{fmtValor(destaque.valor, destaque.unidade)}</p>}
                      <p className="text-[14px] mt-1.5" style={{ color: T.muted }}>{p.atualizado}</p>
                    </div>
                    {linha && <Sparkline values={linha.valores.map(Number)} />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function IaReport({ job, isPinned, onTogglePin, onStop, onRetry, onRefresh, onBack }) {
  const pensando = job.status === "thinking";
  return (
    <>
      <BackHeader label={job.backLabel || "Estatísticas"} onBack={onBack} />
      <div className="flex-1 overflow-y-auto no-scrollbar px-8 pt-4" style={{ paddingBottom: 170 }}>
        <div className="flex justify-end">
          <p className="text-[17px] leading-snug px-4 py-3 rounded-2xl max-w-[86%]" style={{ background: T.ink, color: T.paper }}>{job.question}</p>
        </div>
        <p className="text-[13px] text-right mt-1.5" style={{ color: T.muted }}>
          {job.clienteId ? `Sobre ${CLIENTE_NOME[job.clienteId]}` : ""}{job.clienteId && job.atualizado ? " · " : ""}{job.atualizado || ""}
        </p>

        {pensando && (
          <div className="mt-7" aria-live="polite">
            <p className="text-[17px] flex items-center gap-2"><span className="w-2 h-2 rounded-full animate-pulse" style={{ background: T.brass }} />Pensando…</p>
            <ul className="mt-3 flex flex-col gap-1.5">
              {job.progress.map((p, i) => (
                <li key={i} className="text-[15px] flex items-center gap-2" style={{ color: T.muted }}>
                  <CheckIcon size={13} color={T.slate} /> {p}
                </li>
              ))}
            </ul>
            <p className="text-[14px] mt-4 leading-relaxed" style={{ color: T.muted }}>A IA consulta os dados e monta o relatório. Costuma levar de 20 segundos a 1 minuto.</p>
          </div>
        )}

        {job.status === "error" && (
          <div className="mt-7 p-4 rounded-2xl" style={CARD}>
            <p className="text-[16px] leading-relaxed">{job.error}</p>
            {job.retryable && <button onClick={onRetry} className="mt-3 text-[16px] font-medium" style={LINK}>Tentar de novo</button>}
          </div>
        )}

        {job.status === "done" && job.spec && <RelatorioView spec={job.spec} />}
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-6 pb-7 pt-5 flex flex-col gap-2" style={{ background: `linear-gradient(to top, ${T.paper} 70%, transparent)` }}>
        {pensando && (
          <button onClick={onStop} className="w-full py-3.5 rounded-full text-[16px] font-medium" style={{ background: "#FFFFFF", color: T.ink }}>Parar</button>
        )}
        {job.status === "done" && (
          <>
            {job.pinnedExample && onRefresh && (
              <button onClick={onRefresh} className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-[16px]" style={LINK}>
                <SparkleIcon size={15} color={S.ia} /> Refazer com a IA
              </button>
            )}
            <button onClick={onTogglePin}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-[16px] font-medium"
                    style={isPinned ? { background: S.resolvidoFundo, color: S.resolvido, height: 50, borderRadius: 14 } : { background: S.ink, color: "white", height: 50, borderRadius: 14 }}>
              {isPinned ? <CheckIcon size={16} color={S.resolvido} /> : <PinIcon size={16} color="white" />}
              {isPinned ? "Guardado em Perfil, Relatórios fixados" : "Fixar relatório"}
            </button>
          </>
        )}
      </div>
    </>
  );
}

export { AskBar, IaAsk, IaReport, PastaRelatorios };
