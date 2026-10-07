import React, { useEffect, useRef, useState } from "react";
import { BackIcon, ChartIcon, CheckIcon, ChevronIcon, FolderIcon, LockIcon, PinIcon, SendIcon, SparkleIcon } from "../componentes/icones";
import { Faixa } from "../componentes/ui";
import { CLIENTE_NOME } from "../dados/base";
import { CARD, F, LINK, S, T } from "../estilo/tokens";
import { Resposta, lerSugestoes, textoParaOuvir } from "../ia/Resposta";
import { OuvirBtn } from "../preferencias";
import { Dica } from "../ajuda/Dica";

/* ------------------------- Telas de IA ----------------------------- */
function AskBar({ value, onChange, onSubmit, placeholder, disabled, scopeLabel }) {
  const ativo = value.trim() && !disabled;
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (value.trim() && !disabled) onSubmit(value.trim()); }}>
      {scopeLabel && (
        <div className="flex mb-2">
          <span style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 600, color: S.ia, background: S.iaFundo, borderRadius: 999, padding: "4px 12px" }}>{scopeLabel}</span>
        </div>
      )}
      <div className="busca-campo flex items-center gap-2 pl-4 pr-1.5 rounded-full" style={{ height: 56, background: S.cartao, boxShadow: CARD.boxShadow }}>
        <SparkleIcon size={18} color={S.ia} />
        <input id={scopeLabel ? "ask-org" : "ask-ia"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
               className="flex-1 bg-transparent outline-none min-w-0" style={{ color: S.ink, fontFamily: F.ui, fontSize: 17 }} aria-label="Pergunta para a IA" />
        <button type="submit" disabled={!ativo} aria-label="Enviar pergunta"
                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                style={{ background: ativo ? S.ia : "rgba(31,30,26,0.08)" }}>
          <SendIcon color={ativo ? "#FFFFFF" : S.texto2} size={18} />
        </button>
      </div>
    </form>
  );
}

/* Aba IA vazia: boas-vindas, sugestões e, se houver, a conversa em andamento */
function IaAsk({ onAsk, sample, conversa, onContinuar }) {
  const [q, setQ] = useState("");
  const sugestoes = [
    ["Qual o passivo de cada contrato de gestão da AFNE?", ChartIcon],
    ["Quais processos trabalhistas estão parados há mais de 90 dias?", FolderIcon],
    ["Compare o valor bloqueado entre os 4 clientes", LockIcon],
  ];
  const ultimaPergunta = conversa?.msgs.filter((m) => m.role === "user").pop()?.text;
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar" style={{ paddingBottom: 96 }}>
      <div className="flex-1 flex flex-col items-center justify-center px-10 text-center" style={{ minHeight: 220, paddingTop: 16, paddingBottom: 16 }}>
        <span className="flex items-center justify-center" style={{ width: 72, height: 72, borderRadius: 999, background: S.iaFundo }}>
          <SparkleIcon size={32} color={S.ia} strokeWidth={1.7} />
        </span>
        <h1 style={{ fontFamily: F.titulo, letterSpacing: "-0.02em", fontSize: 34, fontWeight: 600, lineHeight: 1.1, color: S.ink, marginTop: 14, textWrap: "balance" }}>Pergunte qualquer coisa!</h1>
        <p style={{ fontFamily: F.ui, fontSize: 16, color: S.texto2, lineHeight: 1.45, marginTop: 10, maxWidth: 300 }}>
          Sobre processos, bloqueios, contratos e clientes. A IA conversa e monta gráficos com os números do escritório.
        </p>
      </div>
      <div className="px-5 shrink-0">
        <Dica id="ia" style={{ marginTop: 0, marginBottom: 12 }} />
        {sample === null && (
          <p className="mb-2 text-center" style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2 }}>A IA responde quando este app é aberto no Claude.</p>
        )}
        {ultimaPergunta && (
          <button onClick={onContinuar} className="w-full text-left flex items-center gap-3 mb-3" style={{ ...CARD, borderRadius: 20, padding: "12px 14px" }}>
            <span className="flex items-center justify-center shrink-0" style={{ width: 38, height: 38, borderRadius: 999, background: S.marca }}><SparkleIcon size={18} color="#FFFFFF" /></span>
            <span className="flex-1 min-w-0">
              <span className="block" style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2 }}>Continuar conversa</span>
              <span className="block" style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ultimaPergunta}</span>
            </span>
            <ChevronIcon size={16} color={S.texto2} strokeWidth={2} />
          </button>
        )}
        <div className="flex flex-col gap-2 mb-3">
          {sugestoes.map(([sg, Ic]) => (
            <button key={sg} onClick={() => onAsk(sg)} disabled={!sample} className="text-left flex items-center gap-3"
                    style={{ ...CARD, borderRadius: 20, padding: "12px 14px", opacity: sample ? 1 : 0.55, fontFamily: F.ui, fontSize: 15, color: S.ink, lineHeight: 1.35 }}>
              <span className="flex items-center justify-center shrink-0" style={{ width: 38, height: 38, borderRadius: 999, background: S.iaFundo }}><Ic size={18} color={S.ia} /></span>
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

/* Uma resposta da IA dentro da conversa */
function MensagemIA({ m, ultima, fixada, onFixar, onSugestao, onTentar }) {
  const pensando = m.status === "pensando";
  const sugestoes = ultima && m.status === "pronta" ? lerSugestoes(m.text) : [];
  return (
    <div className="mt-5" aria-live={ultima ? "polite" : undefined}>
      <p className="flex items-center gap-1.5" style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 600, color: S.ia }}>
        <SparkleIcon size={15} color={S.ia} strokeWidth={2} /> IA do escritório
      </p>
      {(pensando || (m.status === "escrevendo" && !m.text)) && (
        <div className="mt-2">
          <p className="flex items-center gap-2" style={{ fontFamily: F.ui, fontSize: 17, color: S.ink }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: S.ia }} />Analisando…
          </p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {m.progress.map((p, i) => (
              <li key={i} className="flex items-center gap-2" style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2 }}>
                <CheckIcon size={14} color={S.oliva} /> {p}
              </li>
            ))}
          </ul>
          {!m.progress.length && <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 8, lineHeight: 1.45 }}>A IA consulta os dados antes de escrever. Costuma levar de 20 segundos a 1 minuto.</p>}
        </div>
      )}
      {m.text && <Resposta texto={m.text} />}
      {m.truncated && <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 6 }}>A resposta foi cortada por ser longa demais. Peça a continuação ou uma parte de cada vez.</p>}
      {m.status === "erro" && (
        <div className="mt-3" style={{ ...CARD, padding: 16 }}>
          <p style={{ fontFamily: F.ui, fontSize: 16, color: S.ink, lineHeight: 1.45 }}>{m.error}</p>
          {m.retryable && <button onClick={onTentar} className="mt-2" style={{ ...LINK, fontFamily: F.ui, fontSize: 16 }}>Tentar de novo</button>}
        </div>
      )}
      {m.status === "pronta" && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <OuvirBtn texto={textoParaOuvir(m.text)} />
          <button onClick={onFixar} className="mt-3 inline-flex items-center gap-2 rounded-full"
                  style={{ height: 40, padding: "0 16px", fontFamily: F.ui, fontSize: 15, fontWeight: 600, background: fixada ? S.resolvidoFundo : S.cartao, color: fixada ? S.resolvido : S.ink, boxShadow: fixada ? "none" : CARD.boxShadow }}>
            {fixada ? <CheckIcon size={16} color={S.resolvido} /> : <PinIcon size={16} color={S.ink} />}
            {fixada ? "Fixado em Perfil" : "Fixar"}
          </button>
          {m.atualizado && <span style={{ fontFamily: F.ui, fontSize: 13, color: S.texto2, marginTop: 12 }}>{m.atualizado}</span>}
        </div>
      )}
      {sugestoes.length > 0 && (
        <div className="flex flex-col items-start gap-2 mt-4">
          {sugestoes.map((sg) => (
            <button key={sg} onClick={() => onSugestao(sg)} className="text-left inline-flex items-center gap-2"
                    style={{ fontFamily: F.ui, fontSize: 15, color: S.ia, fontWeight: 600, background: S.iaFundo, borderRadius: 16, padding: "9px 14px", lineHeight: 1.3 }}>
              <SparkleIcon size={14} color={S.ia} /> {sg}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* Conversa no formato do app do Claude: pergunta, resposta escrita aos poucos, gráficos no meio do texto */
function IaConversa({ conversa, sample, onEnviar, onParar, onTentar, onFixar, fixadas, onVoltar, onNova }) {
  const [q, setQ] = useState("");
  const rolagem = useRef(null);
  const colado = useRef(true);
  const ocupada = conversa.msgs.some((m) => m.role === "assistant" && (m.status === "pensando" || m.status === "escrevendo"));
  const ultimoTexto = conversa.msgs[conversa.msgs.length - 1]?.text;
  const ultimaPergunta = useRef(null);
  const iUltimaPergunta = conversa.msgs.map((m) => m.role).lastIndexOf("user");
  // Ao abrir ou mandar pergunta, a tela começa na última pergunta (o começo da resposta, não o fim).
  useEffect(() => {
    const el = rolagem.current, alvo = ultimaPergunta.current;
    if (el && alvo) el.scrollTop = alvo.offsetTop - 12;
    colado.current = false;
  }, [conversa.id, iUltimaPergunta]);
  // Enquanto a resposta chega, acompanha só se a sócia estiver no fim da conversa.
  useEffect(() => { const el = rolagem.current; if (el && colado.current) el.scrollTop = el.scrollHeight; }, [ultimoTexto]);
  const aoRolar = () => { const el = rolagem.current; colado.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; };
  return (
    <>
      <div className="flex items-center justify-between gap-2 px-5 pt-3 pb-2 shrink-0">
        <button onClick={onVoltar} aria-label={`Voltar para ${conversa.backLabel || "IA"}`} className="flex items-center gap-2.5 min-w-0">
          <span className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: S.cartao, boxShadow: CARD.boxShadow }}><BackIcon size={18} color={S.ink} /></span>
          <span style={{ fontFamily: F.ui, fontSize: 16, color: S.texto2 }}>{conversa.backLabel || "IA"}</span>
        </button>
        {!conversa.backTo && (
          <button onClick={onNova} style={{ ...LINK, fontFamily: F.ui, fontSize: 15 }}>Nova conversa</button>
        )}
      </div>
      <div ref={rolagem} onScroll={aoRolar} className="flex-1 overflow-y-auto no-scrollbar px-6 pt-2 relative" style={{ paddingBottom: 150 }}>
        {conversa.clienteId && (
          <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginBottom: 4 }}>Sobre {CLIENTE_NOME[conversa.clienteId]}</p>
        )}
        {conversa.msgs.map((m, i) => (m.role === "user" ? (
          <div key={i} ref={i === iUltimaPergunta ? ultimaPergunta : undefined} className="flex justify-end mt-5">
            <p style={{ fontFamily: F.ui, fontSize: 17, lineHeight: 1.4, padding: "12px 16px", borderRadius: "20px 20px 6px 20px", maxWidth: "86%", background: S.marca, color: "#FFFFFF" }}>{m.text}</p>
          </div>
        ) : (
          <MensagemIA key={i} m={m} ultima={i === conversa.msgs.length - 1} fixada={fixadas.has(m.pinId || `${conversa.id}:${i}`)}
                      onFixar={() => onFixar(i)} onSugestao={(t) => onEnviar(t)} onTentar={onTentar} />
        )))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-7 pt-8" style={{ background: `linear-gradient(to top, ${T.paper} calc(100% - 24px), transparent)` }}>
        {ocupada ? (
          <button onClick={onParar} className="w-full rounded-full" style={{ height: 52, background: S.cartao, boxShadow: CARD.boxShadow, fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink }}>Parar</button>
        ) : (
          <AskBar value={q} onChange={setQ} onSubmit={(t) => { onEnviar(t); setQ(""); }} disabled={!sample} placeholder="Pergunte mais…" />
        )}
      </div>
    </>
  );
}

/* Relatórios fixados (respostas guardadas) */
function PastaRelatorios({ pinned, onOpenPinned, onBack }) {
  const resumo = (t) => { const r = (t.match(/\*\*Resumo:\*\*\s*([^\n]+)/)?.[1] || t.split("\n").find((l) => l.trim() && !l.startsWith("```")) || "").replace(/\*\*/g, ""); return r.charAt(0).toUpperCase() + r.slice(1); };
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
      <Faixa bleed={32} onBack={onBack} backLabel="Perfil" titulo="Relatórios fixados"
             sub={pinned.length === 0 ? "Nenhum relatório ainda" : pinned.length === 1 ? "1 relatório guardado" : `${pinned.length} relatórios guardados`} />
      {pinned.length === 0 ? (
        <p style={{ fontFamily: F.ui, fontSize: 16, color: S.texto2, lineHeight: 1.5 }}>
          Numa conversa da aba IA, toque em "Fixar" embaixo de uma resposta. Ela fica guardada aqui para você abrir de novo quando quiser.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {pinned.map((p) => (
            <button key={p.id} onClick={() => onOpenPinned(p)} className="w-full text-left" style={{ ...CARD, padding: 18 }}>
              <p style={{ fontFamily: F.ui, fontSize: 17, fontWeight: 600, color: S.ink, lineHeight: 1.3 }}>{p.question}</p>
              <p style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2, marginTop: 6, lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{resumo(p.text)}</p>
              <p style={{ fontFamily: F.ui, fontSize: 13, color: S.texto2, marginTop: 8 }}>{p.atualizado}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { AskBar, IaAsk, IaConversa, PastaRelatorios };
