import { HOJE, diasEntre } from "./formato";

/* ------------------------------------------------------------------ */
/* Critério de "parado" usado no chip do Início, na tela Parados de     */
/* processos e no status "Parado" dos bloqueios (redesenho v3, Passo 5).*/
/* Hoje: processo sem movimentação há 90+ dias (diasParado). TODO       */
/* confirmar com dados reais: o app original provavelmente conta pela   */
/* falta de movimentação do BLOQUEIO, não do processo                   */
/* (docs/redesign-v3/consolidacao.md, item 8).                          */
/* Fica num só lugar para trocar fácil quando a sócia confirmar.        */
/* ------------------------------------------------------------------ */
const DIAS_PARADO_LIMITE = 90;

const processosParados = (lista) => lista.filter((p) => p.diasParado >= DIAS_PARADO_LIMITE);

/* ------------------------------------------------------------------ */
/* Status visual do bloqueio (seção B.5 do guia): um bloqueio ativo só  */
/* é "Novo" (vermelho) nos primeiros dias; "Parado" (âmbar) quando o     */
/* processo dele está parado pelo critério acima; senão é "Ativo"       */
/* comum (cinza). Levantado é sempre verde. Precisa do processo         */
/* vinculado (PROCESSOS_LISTA.find por processoId) para checar o        */
/* "Parado" — passe null se não tiver à mão.                            */
/* ------------------------------------------------------------------ */
const DIAS_NOVO_LIMITE = 7;

function statusVisualBloqueio(bloqueio, processo) {
  if (bloqueio.status === "Levantado") return "levantado";
  if (diasEntre(bloqueio.data, HOJE) <= DIAS_NOVO_LIMITE) return "novo";
  if (processo && processo.diasParado >= DIAS_PARADO_LIMITE) return "parado";
  return "ativo";
}

const ROTULO_STATUS_BLOQUEIO = { novo: "Novo", parado: "Parado", ativo: "Ativo", levantado: "Levantado" };
// Mapeia para os ids de SEMANTICA (src/estilo/tokens.js): risco (vermelho), atencao (âmbar),
// inativo (cinza) e resolvido (verde).
const SEM_ID_STATUS_BLOQUEIO = { novo: "risco", parado: "atencao", ativo: "inativo", levantado: "resolvido" };

export { DIAS_NOVO_LIMITE, DIAS_PARADO_LIMITE, ROTULO_STATUS_BLOQUEIO, SEM_ID_STATUS_BLOQUEIO, processosParados, statusVisualBloqueio };
