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

// Cor da OS misturada ao creme dos cartões: só um tom de fundo, nunca cor de texto (contraste).
function tomOrg(id, quanto = 0.09) {
  const cor = MARCAS[id]?.cor;
  if (!cor) return S.cartao;
  const a = [1, 3, 5].map((i) => parseInt(cor.slice(i, i + 2), 16)), b = [255, 253, 249];
  return `rgb(${a.map((v, i) => Math.round(b[i] + (v - b[i]) * quanto)).join(",")})`;
}

/* Logo inteiro numa placa branca, com um fio na cor da OS embaixo. */
function LogoOrg({ id, altura = 64 }) {
  const m = MARCAS[id];
  if (!m?.logo) return null;
  return (
    <span className="flex items-center justify-center w-full shrink-0"
          style={{ height: altura, borderRadius: 16, background: "#FFFFFF", padding: "8px 12px 11px", boxShadow: `inset 0 -4px 0 ${m.cor}` }}>
      <img src={m.logo} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
    </span>
  );
}

export { LogoOrg, MarcaOrg, tomOrg };
