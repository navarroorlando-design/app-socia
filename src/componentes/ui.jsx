import React, { useState, useEffect } from "react";
import { BackIcon, BuildingIcon, ChevronIcon, HouseIcon, IconeSem, PersonIcon, SparkleIcon } from "./icones";
import { CARD, F, S, T, TONS, semDe } from "../estilo/tokens";

/* ------------------------------------------------------------------ */
/* Peças reutilizáveis                                                 */
/* ------------------------------------------------------------------ */
function StatusBar({ tom }) {
  const t = tom && TONS[tom];
  return (
    <div className="flex items-center justify-between px-8 pt-4 pb-1 text-[15px] shrink-0 relative z-20"
         style={t ? { background: t.a, color: "#FFFFFF" } : { color: S.ink }}>
      <span className="font-medium">9:41</span>
      <div className="flex items-center gap-1.5">
        <svg width="17" height="11" viewBox="0 0 18 11" fill="none">
          <rect x="0" y="6" width="3" height="5" rx="0.5" fill="currentColor" />
          <rect x="5" y="4" width="3" height="7" rx="0.5" fill="currentColor" />
          <rect x="10" y="2" width="3" height="9" rx="0.5" fill="currentColor" />
          <rect x="15" y="0" width="3" height="11" rx="0.5" fill="currentColor" />
        </svg>
        <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" />
          <rect x="2" y="2" width="15" height="8" rx="1.5" fill="currentColor" />
          <rect x="22" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}

function BackHeader({ label, onBack }) {
  return (
    <div className="flex items-center px-6 pt-3 pb-1 shrink-0">
      <button onClick={onBack} aria-label={`Voltar para ${label}`} className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "#FFFDF9" }}>
        <BackIcon size={18} color={S.ink} />
      </button>
      <span className="ml-3" style={{ fontFamily: F.ui, fontSize: 16, color: S.texto2 }}>{label}</span>
    </div>
  );
}

function IconBtn({ label, onClick, children }) {
  return (
    <button onClick={onClick} aria-label={label} className="w-11 h-11 rounded-full flex items-center justify-center relative" style={{ background: "#FFFDF9" }}>
      {children}
    </button>
  );
}

function SecLabel({ children, acao, onAcao, primeiro }) {
  return (
    <div className="flex items-baseline justify-between gap-3" style={{ margin: `${primeiro ? 8 : 32}px 0 10px` }}>
      <h2 style={{ fontFamily: F.ui, fontSize: 18, fontWeight: 600, color: S.ink, letterSpacing: "-0.01em" }}>{children}</h2>
      {acao && (onAcao
        ? <button onClick={onAcao} style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 500, color: S.ink, textDecoration: "underline", textUnderlineOffset: 4, flexShrink: 0 }}>{acao}</button>
        : <span style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2, flexShrink: 0 }}>{acao}</span>)}
    </div>
  );
}

function CardRow({ icon, label, value, onClick, last }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 w-full text-left" style={{ padding: "12px 16px", borderBottom: last ? "none" : `1px solid ${S.linha}` }}>
      <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "#EFEBE2" }}>{icon}</span>
      <span style={{ fontFamily: F.ui, fontSize: 17, color: S.ink, flex: 1 }}>{label}</span>
      {value && <span style={{ fontFamily: F.ui, fontSize: 16, color: S.texto2, fontVariantNumeric: "tabular-nums" }}>{value}</span>}
      <ChevronIcon size={16} color={S.texto2} strokeWidth={2} />
    </button>
  );
}

function TabBar({ active, onChange }) {
  const items = [
    { id: "inicio", label: "Início", Icon: HouseIcon },
    { id: "ia", label: "IA", Icon: SparkleIcon },
    { id: "os", label: "OS", Icon: BuildingIcon },
    { id: "perfil", label: "Perfil", Icon: PersonIcon },
  ];
  return (
    <nav className="absolute bottom-0 left-0 right-0 px-3 pt-2 pb-7" style={{ background: "#FFFDF9", borderTop: `1px solid ${S.linha}` }}>
      <div className="flex items-center justify-between">
        {items.map(({ id, label, Icon: I }) => {
          const isActive = active === id;
          return (
            <button key={id} onClick={() => onChange(id)} aria-current={isActive ? "page" : undefined}
                    className="flex flex-col items-center gap-1 rounded-2xl" style={{ width: 76, padding: "6px 0", background: isActive ? "#EAE6DD" : "transparent" }}>
              <I size={23} color={isActive ? (id === "ia" ? S.iaIcone : S.ink) : S.texto2} strokeWidth={isActive ? 2 : 1.7} />
              <span style={{ fontFamily: F.ui, fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? S.ink : S.texto2 }}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function Row({ icon, label, value, onClick, last }) {
  return <CardRow icon={icon} label={label} value={value} onClick={onClick} last={last} />;
}

function Badge({ text, sobreCor }) {
  return <Etiqueta s={semDe(text)} texto={text} sobreCor={sobreCor} />;
}

function InfoLinha({ icone, fundo, rotulo, valor, last }) {
  return (
    <div className="flex items-center gap-3" style={{ padding: "14px 16px", borderBottom: last ? "none" : `1px solid ${S.linha}` }}>
      <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: fundo }}>{icone}</span>
      <div className="min-w-0">
        <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2 }}>{rotulo}</p>
        <p style={{ fontFamily: F.ui, fontSize: 17, fontWeight: 600, color: S.ink }}>{valor}</p>
      </div>
    </div>
  );
}

/* Linha de lista dentro de cartão: ícone num círculo na cor do status, texto, etiqueta à direita */
function LinhaLista({ icone, sem, titulo, extra, detalhe, direita, abaixo, onClick, last }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag onClick={onClick} className="w-full text-left flex items-start gap-3"
         style={{ padding: "14px 16px", borderBottom: last ? "none" : `1px solid ${S.linha}` }}>
      <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: sem.fundo }}>{icone}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="flex items-center gap-1.5 min-w-0" style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink, lineHeight: 1.3, paddingTop: 2 }}>{titulo}{extra}</p>
          {direita}
        </div>
        {detalhe && <p style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2, marginTop: 3, lineHeight: 1.35 }}>{detalhe}</p>}
        {abaixo && <div style={{ marginTop: 8 }}>{abaixo}</div>}
      </div>
    </Tag>
  );
}

function Faixa({ tom, bloco, bleed = 24, onBack, backLabel, eyebrow, titulo, tituloCompacto, tituloSize = 34, sub, direita, aside, children }) {
  const ref = React.useRef(null);
  const [compacto, setCompacto] = useState(false);
  useEffect(() => {
    const el = ref.current && ref.current.parentElement;
    if (!el) return undefined;
    const on = () => setCompacto(el.scrollTop > 70);
    el.addEventListener("scroll", on, { passive: true });
    on();
    return () => el.removeEventListener("scroll", on);
  }, []);
  const detalhe = !!tom;
  // Telas de objeto (processo, bloqueio, organização): título num bloco marinho, como o cartão principal do Início.
  const azul = detalhe || !!bloco;
  const tituloTexto = tituloCompacto || (typeof titulo === "string" ? titulo : "");
  return (
    <>
      {/* barra fina que aparece ao rolar */}
      <div ref={ref} aria-hidden={!compacto}
           style={{ position: "sticky", top: 0, zIndex: 30, margin: `0 -${bleed}px -56px`, height: 56, padding: `0 ${Math.max(bleed - 10, 12)}px`,
                    display: "flex", alignItems: "center", gap: 6, background: "rgba(242,239,233,.88)", backdropFilter: "saturate(1.6) blur(14px)", WebkitBackdropFilter: "saturate(1.6) blur(14px)",
                    borderBottom: `1px solid ${compacto ? S.linha : "transparent"}`, opacity: compacto ? 1 : 0, pointerEvents: compacto ? "auto" : "none", transition: "opacity .18s ease" }}>
        {onBack && (
          <button onClick={onBack} tabIndex={compacto ? 0 : -1} aria-label={`Voltar para ${backLabel}`} className="w-11 h-11 rounded-full flex items-center justify-center shrink-0">
            <BackIcon size={21} color={S.ink} />
          </button>
        )}
        <p style={{ flex: 1, textAlign: onBack ? "center" : "left", paddingRight: onBack ? 44 : 0, paddingLeft: onBack ? 0 : 10, fontFamily: F.ui, fontSize: 17, fontWeight: 600, color: S.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tituloTexto}</p>
      </div>

      {/* cabeçalho grande */}
      <div style={{ paddingTop: 6 }}>
        {(onBack || (!detalhe && direita)) && (
          <div className="flex items-center justify-between gap-3" style={{ marginBottom: 14 }}>
            {onBack ? (
              <button onClick={onBack} aria-label={`Voltar para ${backLabel}`} className="flex items-center gap-2.5 min-w-0">
                <span className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: "#FFFDF9", boxShadow: "0 1px 3px rgba(31,30,26,.08)" }}>
                  <BackIcon size={18} color={S.ink} />
                </span>
                <span style={{ fontFamily: F.ui, fontSize: 16, color: S.texto2 }}>{backLabel}</span>
              </button>
            ) : <span />}
            {!detalhe && direita}
          </div>
        )}
        <div className="flex items-start justify-between gap-3"
             style={azul ? { background: S.marca, borderRadius: 24, padding: 22, boxShadow: "0 10px 24px rgba(31,30,26,.22)" } : undefined}>
          <div className="min-w-0">
            {eyebrow && <p style={{ fontFamily: F.ui, fontSize: 16, color: azul ? S.marcaTexto2 : S.texto2, lineHeight: 1.35 }}>{eyebrow}</p>}
            <h1 style={{ fontFamily: F.titulo, fontSize: tituloSize, fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.025em", color: azul ? "#FFFFFF" : S.ink, marginTop: eyebrow ? 4 : 0, textWrap: "balance" }}>{titulo}</h1>
            {detalhe && direita && <div style={{ marginTop: 12 }}>{direita}</div>}
            {sub && <div style={{ fontFamily: F.ui, fontSize: 16, color: azul ? S.marcaTexto2 : S.texto2, marginTop: 8, lineHeight: 1.4 }}>{sub}</div>}
          </div>
          {aside}
        </div>
      </div>
      {children ? <div style={{ marginTop: 18 }}>{children}</div> : <div style={{ height: 8 }} />}
    </>
  );
}

function KPIs({ itens }) {
  return (
    <div className="flex" style={{ ...CARD, padding: "14px 6px" }}>
      {itens.map(([rotulo, valor], i) => (
        <div key={rotulo} className="flex-1 text-center min-w-0" style={{ borderLeft: i ? `1px solid ${S.linha}` : "none", padding: "0 6px" }}>
          <p style={{ fontFamily: F.ui, fontSize: 13, color: S.texto2 }}>{rotulo}</p>
          <p style={{ fontFamily: F.ui, fontSize: 17, fontWeight: 600, color: S.ink, marginTop: 2, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{valor}</p>
        </div>
      ))}
    </div>
  );
}

function Sparkline({ values, color = T.brass }) {
  if (!values || values.length < 2) return null;
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => `${(3 + (i * 74) / (values.length - 1)).toFixed(1)},${(29 - (v / max) * 26).toFixed(1)}`).join(" ");
  return (
    <svg width="80" height="32" viewBox="0 0 80 32" aria-hidden="true">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Tela: Perfil (usuária) e preferências de notificação                */
/* ------------------------------------------------------------------ */
function Toggle({ on, onChange, label }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={onChange}
            className="w-[51px] h-[31px] rounded-full p-[2px] flex shrink-0 transition-colors"
            style={{ background: on ? T.brass : "rgba(31,30,26,0.18)", justifyContent: on ? "flex-end" : "flex-start" }}>
      <span className="w-[27px] h-[27px] rounded-full bg-white" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </button>
  );
}

function Etiqueta({ s, texto, sobreCor }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full shrink-0"
          style={{ background: sobreCor ? "#FFFFFF" : s.fundo, color: s.cor, fontFamily: F.ui, fontSize: 13, fontWeight: 600, padding: "5px 11px 5px 9px" }}>
      <IconeSem tipo={s.icone} cor={s.cor} size={14} />{texto || s.nome}
    </span>
  );
}

function Botao({ variante = "primario", children, onClick, disabled, loading, full = true }) {
  const base = { fontFamily: F.ui, fontSize: 17, fontWeight: 600, height: 50, borderRadius: 14, padding: "0 20px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: full ? "100%" : "auto", transition: "transform .08s ease, background .15s ease" };
  const v = {
    primario: { background: S.ink, color: "#FFFFFF" },
    secundario: { background: S.cartao, color: S.ink, boxShadow: `inset 0 0 0 1.5px ${S.ink}` },
    terciario: { background: "transparent", color: S.ink, textDecoration: "underline", textUnderlineOffset: 4 },
    destrutivo: { background: S.cartao, color: S.risco, boxShadow: `inset 0 0 0 1.5px ${S.risco}` },
    ia: { background: S.iaFundo, color: S.ia },
  }[variante];
  const off = disabled ? { background: "#E5E7E8", color: "#6B675E", boxShadow: "none" } : {};
  return (
    <button onClick={onClick} disabled={disabled || loading} className="guia-btn" style={{ ...base, ...v, ...off }}>
      {loading && <span className="guia-spin" aria-hidden="true" style={{ borderColor: v.color, borderTopColor: "transparent" }} />}
      {children}
    </button>
  );
}

function Secao({ titulo, nota, children }) {
  return (
    <section className="mt-10">
      <h2 style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 24, fontWeight: 500, color: S.ink, lineHeight: 1.15 }}>{titulo}</h2>
      {nota && <p style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2, lineHeight: 1.45, marginTop: 6 }}>{nota}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Cartao({ children, style }) {
  return <div style={{ background: S.cartao, borderRadius: 24, padding: 18, boxShadow: "0 1px 2px rgba(40,34,24,.06), 0 4px 14px rgba(40,34,24,.05)", ...style }}>{children}</div>;
}

export { BackHeader, Badge, Botao, CardRow, Cartao, Etiqueta, Faixa, InfoLinha, KPIs, LinhaLista, Row, SecLabel, Secao, Sparkline, StatusBar, TabBar, Toggle };
