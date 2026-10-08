/* ------------------------------------------------------------------ */
/* Movimento base do redesenho v3 (docs/redesign-v3, seção D).          */
/* Mesmos valores do guia; sem Framer Motion — CSS + Web Animations API */
/* API, como os trechos do próprio guia. EASE precisa ficar igual ao    */
/* --ease do GlobalStyle.jsx (usado pelo CSS, não dá para ler de lá).   */
/* ------------------------------------------------------------------ */
const EASE = "cubic-bezier(0.2,0,0,1)";
const EASE_OUT = "cubic-bezier(.2,.7,.2,1)";
const EASE_IN = "cubic-bezier(.4,0,1,1)";

function prefersReducedMotion() {
  return typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Chama cb(matches) sempre que a preferência mudar (ex.: a sócia liga "Reduzir movimento" com o app aberto).
function aoMudarReducedMotion(cb) {
  if (typeof matchMedia === "undefined") return () => {};
  const mq = matchMedia("(prefers-reduced-motion: reduce)");
  const ouvinte = () => cb(mq.matches);
  if (mq.addEventListener) mq.addEventListener("change", ouvinte); else mq.addListener(ouvinte);
  return () => (mq.removeEventListener ? mq.removeEventListener("change", ouvinte) : mq.removeListener(ouvinte));
}

// Abrir uma tela interna (push): desliza da direita; a tela de baixo recua 28% e escurece 6%.
function animarPush(entra, base) {
  if (prefersReducedMotion()) {
    return entra.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, fill: "both" }).finished;
  }
  const a = entra.animate([{ transform: "translateX(100%)" }, { transform: "none" }], { duration: 320, easing: EASE, fill: "both" });
  if (base) {
    base.animate([{ transform: "none", filter: "brightness(1)" }, { transform: "translateX(-28%)", filter: "brightness(.94)" }],
      { duration: 320, easing: EASE, fill: "forwards" });
  }
  return a.finished;
}

// Voltar (pop): o caminho inverso, um pouco mais rápido.
function animarPop(sai, base) {
  if (prefersReducedMotion()) {
    return sai.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, fill: "both" }).finished;
  }
  if (base) {
    base.animate([{ transform: "translateX(-28%)", filter: "brightness(.94)" }, { transform: "none", filter: "brightness(1)" }],
      { duration: 280, easing: EASE, fill: "forwards" });
  }
  const a = sai.animate([{ transform: "none" }, { transform: "translateX(100%)" }], { duration: 280, easing: EASE, fill: "both" });
  return a.finished;
}

export { EASE, EASE_IN, EASE_OUT, aoMudarReducedMotion, animarPop, animarPush, prefersReducedMotion };
