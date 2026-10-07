import React from "react";
import { MARCAS } from "./marcas";
import { F, S } from "../estilo/tokens";

/* ------------------------------------------------------------------ */
/* Identidade de cada OS: logo do site da organização, ou as iniciais   */
/* em carvão quando não houver logo. Logos ficam sempre sobre fundo    */
/* claro (foram feitos para branco); a cor da OS entra só como detalhe. */
/* ------------------------------------------------------------------ */
function MarcaOrg({ id, iniciais, size = 44, claro = false }) {
  const m = MARCAS[id];
  if (m?.icone || m?.logo) {
    return (
      <span className="flex items-center justify-center shrink-0 overflow-hidden"
            style={{ width: size, height: size, borderRadius: 999, background: "#FFFFFF", boxShadow: claro ? "none" : `inset 0 0 0 1px ${S.linha}` }}>
        <img src={m.icone || m.logo} alt="" style={{ width: "78%", height: "78%", objectFit: "contain" }} />
      </span>
    );
  }
  return (
    <span className="flex items-center justify-center shrink-0"
          style={{ width: size, height: size, borderRadius: 999, background: claro ? "#FFFDF9" : S.marca, color: claro ? S.marca : "#FFFFFF", fontFamily: F.display, fontSize: size * 0.34, fontWeight: 600 }}>
      {iniciais}
    </span>
  );
}

export { MarcaOrg };
