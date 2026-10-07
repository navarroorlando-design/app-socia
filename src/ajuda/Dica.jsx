import React, { useContext } from "react";
import { DicaIcon } from "../componentes/icones";
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

export { AjudaContext, Dica };
