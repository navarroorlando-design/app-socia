/* ------------------------------------------------------------------ */
/* Critério de "parado" usado no chip do Início e na futura tela        */
/* Parados (redesenho v3, Passo 5). Hoje: processo sem movimentação há  */
/* 90+ dias (diasParado). TODO confirmar com dados reais: o app         */
/* original provavelmente conta pela falta de movimentação do           */
/* BLOQUEIO, não do processo (docs/redesign-v3/consolidacao.md, item 8).*/
/* Fica num só lugar para trocar fácil quando a sócia confirmar.        */
/* ------------------------------------------------------------------ */
const DIAS_PARADO_LIMITE = 90;

const processosParados = (lista) => lista.filter((p) => p.diasParado >= DIAS_PARADO_LIMITE);

export { DIAS_PARADO_LIMITE, processosParados };
