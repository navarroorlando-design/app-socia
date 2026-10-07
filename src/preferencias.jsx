import React, { useState, useEffect } from "react";
import { F, S } from "./estilo/tokens";

/* ------------------------------------------------------------------ */
/* Perfil, preferências de leitura e avatar                            */
/* ------------------------------------------------------------------ */
const PrefsContext = React.createContext({ lerVoz: false });

const INICIAIS = "VA";

function lerPref(chave, padrao) {
  try { const v = localStorage.getItem("socios:" + chave); return v === null ? padrao : JSON.parse(v); } catch { return padrao; }
}

function gravarPref(chave, valor) {
  try { localStorage.setItem("socios:" + chave, JSON.stringify(valor)); } catch { /* sem armazenamento: só nesta visita */ }
}

function Avatar({ foto, size = 44, badge = 0, claro = false }) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      {foto ? (
        <img src={foto} alt="" className="rounded-full object-cover" style={{ width: size, height: size }} />
      ) : (
        <span className="rounded-full flex items-center justify-center"
              style={{ width: size, height: size, background: claro ? "#FFFFFF" : S.ink, color: claro ? S.ink : "#FFFFFF", fontFamily: F.display, fontSize: size * 0.36, fontWeight: 600, letterSpacing: ".01em" }}>
          {INICIAIS}
        </span>
      )}
      {badge > 0 && (
        <span className="absolute flex items-center justify-center rounded-full"
              style={{ top: -3, right: -3, minWidth: 22, height: 22, padding: "0 5px", background: S.risco, color: "#FFFFFF", fontFamily: F.ui, fontSize: 12, fontWeight: 700, border: `2px solid ${claro ? "#1F1E1A" : S.papel}` }}>
          {badge}
        </span>
      )}
    </span>
  );
}

function OuvirBtn({ texto }) {
  const { lerVoz } = React.useContext(PrefsContext);
  const [falando, setFalando] = useState(false);
  useEffect(() => () => { try { window.speechSynthesis?.cancel(); } catch {} }, []);
  if (!lerVoz || typeof window === "undefined" || !("speechSynthesis" in window) || !texto) return null;
  const alternar = () => {
    try {
      const synth = window.speechSynthesis;
      if (falando) { synth.cancel(); setFalando(false); return; }
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = "pt-BR"; u.rate = 0.95;
      u.onend = () => setFalando(false); u.onerror = () => setFalando(false);
      synth.cancel(); synth.speak(u); setFalando(true);
    } catch { setFalando(false); }
  };
  return (
    <button onClick={alternar} className="mt-3 inline-flex items-center gap-2 rounded-full"
            style={{ background: "#FFFDF9", color: S.ink, fontFamily: F.ui, fontSize: 15, fontWeight: 600, height: 40, padding: "0 16px" }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={S.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {falando ? <path d="M8 5v14M16 5v14" /> : <><path d="M11 5 6 9H3v6h3l5 4Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></>}
      </svg>
      {falando ? "Parar leitura" : "Ouvir"}
    </button>
  );
}

const ESCALAS = [{ id: 1, rotulo: "Padrão" }, { id: 1.12, rotulo: "Maior" }, { id: 1.25, rotulo: "Muito maior" }];

export { Avatar, ESCALAS, INICIAIS, OuvirBtn, PrefsContext, gravarPref, lerPref };
