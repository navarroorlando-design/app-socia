import React, { useContext, useRef, useState } from "react";
import { DicaIcon } from "../componentes/icones";
import { EASE, prefersReducedMotion } from "../motion/motion";
import { CARD, F, S } from "../estilo/tokens";
import { OuvirBtn } from "../preferencias";
import { DICAS } from "./conteudo";

/* ------------------------------------------------------------------ */
/* Dica de primeira vez: um cartão em osso no alto da tela, com uma    */
/* frase e "Entendi". Some depois disso. Perfil → Como usar o app →    */
/* "Mostrar as dicas de novo" traz todas de volta.                     */
/* ------------------------------------------------------------------ */
// mini: true dentro das miniaturas do tour, para as dicas não aparecerem lá.
const AjudaContext = React.createContext({ vistas: [], marcar: () => {}, mini: false });

function Dica({ id, style }) {
  const { vistas, marcar, mini } = useContext(AjudaContext);
  const texto = DICAS[id];
  if (mini || !texto || vistas.includes(id)) return null;
  return (
    <div role="note" aria-label="Dica" className="guia-toast" style={{ ...CARD, background: S.osso, boxShadow: "none", padding: 18, marginTop: 16, ...style }}>
      <p className="flex items-center gap-2" style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 700, color: S.ossoTexto2 }}>
        <DicaIcon size={18} color={S.ossoTexto2} strokeWidth={1.9} /> Dica
      </p>
      <p style={{ fontFamily: F.ui, fontSize: 17, color: S.ink, lineHeight: 1.45, marginTop: 6 }}>{texto}</p>
      <div className="flex flex-wrap items-end gap-3">
        <button onClick={() => marcar(id)} className="mt-3 rounded-full"
                style={{ height: 44, padding: "0 22px", background: S.ink, color: "#FFFFFF", fontFamily: F.ui, fontSize: 16, fontWeight: 600 }}>
          Entendi
        </button>
        <OuvirBtn texto={texto} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Faixa de dica fina, com × (redesenho v3, consolidacao.md item 2):   */
/* troca os cartões com "Entendi". Fechada some com um encolhe-e-sobe  */
/* (360 ms) e fica fechada só até o fim da sessão (estado do chamador, */
/* não grava no aparelho).                                             */
/* ------------------------------------------------------------------ */
function FaixaAviso({ children, onFechar, style }) {
  const ref = useRef(null);
  const [fechando, setFechando] = useState(false);
  const fechar = () => {
    const el = ref.current;
    if (fechando || !el) { onFechar(); return; }
    setFechando(true);
    if (prefersReducedMotion()) { onFechar(); return; }
    el.animate([
      { height: `${el.offsetHeight}px`, opacity: 1, marginTop: getComputedStyle(el).marginTop },
      { height: "0px", opacity: 0, marginTop: "0px" },
    ], { duration: 360, easing: EASE, fill: "forwards" }).finished.then(onFechar).catch(onFechar);
  };
  return (
    <div ref={ref} role="note" aria-label="Dica" className="flex items-start gap-2.5" style={{ background: S.osso, borderRadius: 16, padding: "12px 14px", marginTop: 16, overflow: "hidden", ...style }}>
      <span style={{ marginTop: 1 }}><DicaIcon size={18} color={S.ossoTexto2} strokeWidth={1.9} /></span>
      <p className="flex-1" style={{ fontFamily: F.ui, fontSize: 15, color: S.ink, lineHeight: 1.4 }}>{children}</p>
      <button onClick={fechar} aria-label="Fechar dica" className="shrink-0 flex items-center justify-center pressable"
              style={{ width: 28, height: 28, borderRadius: 999, fontFamily: F.ui, fontSize: 18, lineHeight: 1, color: S.ossoTexto2 }}>
        ×
      </button>
    </div>
  );
}

export { AjudaContext, Dica, FaixaAviso };
