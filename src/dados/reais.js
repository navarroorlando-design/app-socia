import { TOTAIS_REAIS } from "./reais.gerado";

/* ------------------------------------------------------------------ */
/* Totais reais do acervo (Legal One + controle de bloqueio), lidos de  */
/* reais.gerado.js (npm run totais). Só existem no nível de cliente,     */
/* área e contrato: o resto do app (cada processo, cada bloqueio com     */
/* data, passivo, prognóstico, parados, encerrados) continua na base de  */
/* exemplo, marcado como "exemplo" na tela.                             */
/*                                                                      */
/* "Bloqueado" soma o que ainda está bloqueado nos processos ativos e    */
/* nos que já saíram do acervo (aba "Bloqueios sem processo ativo"): é o */
/* saldo de verdade. "Devolvido" é o que voltou ao cliente (levantado);  */
/* "pago" é o que foi para a outra parte.                               */
/* ------------------------------------------------------------------ */
const REFERENCIA_REAL = TOTAIS_REAIS.referencia;
const FONTE_REAL = `Legal One e controle de bloqueio · ${REFERENCIA_REAL}`;

function realCliente(id) {
  const c = TOTAIS_REAIS.clientes[id];
  if (!c) return null;
  const { ativo: a, semProcessoAtivo: s } = c;
  return {
    processos: c.processos,
    porArea: c.porArea,
    contratos: c.contratos,
    bloqueado: a.bloqueado + s.bloqueado,
    devolvido: a.devolvido + s.devolvido,
    pago: a.pago + s.pago,
    comValor: c.comValor + c.comValorSemProcessoAtivo,
  };
}

const REAL = (() => {
  const ids = Object.keys(TOTAIS_REAIS.clientes);
  const porCliente = Object.fromEntries(ids.map((id) => [id, realCliente(id)]));
  const lista = Object.values(porCliente);
  const soma = (k) => lista.reduce((t, c) => t + c[k], 0);
  const semCliente = TOTAIS_REAIS.semProcessoAtivoSemCliente;
  const porArea = {};
  for (const c of lista) for (const [area, n] of Object.entries(c.porArea)) porArea[area] = (porArea[area] || 0) + n;
  const bloqueado = soma("bloqueado") + semCliente.bloqueado;
  const devolvido = soma("devolvido") + semCliente.devolvido;
  return {
    porCliente,
    porArea,
    processos: soma("processos"),
    bloqueado,
    devolvido,
    pago: soma("pago") + semCliente.pago,
    comValor: soma("comValor"),
    // Mesma fórmula do guia (levantado ÷ (ativo + levantado)). TODO confirmar com o escritório se
    // "pago à outra parte" deve entrar na conta: hoje fica de fora.
    pctDevolvido: bloqueado + devolvido ? Math.round((devolvido / (bloqueado + devolvido)) * 100) : 0,
  };
})();

/* Função que a IA chama (consultar_totais_reais): devolve os totais reais da firma ou de um
   cliente. Mesmo contrato das outras consultas: a IA nunca é a fonte do número. */
const ID_POR_NOME = { afne: "afne", fas: "fas", gnosis: "gnosis", "instituto gnosis": "gnosis", igedes: "igedes" };

function consultarTotaisReais({ cliente } = {}) {
  const base = { referencia: REFERENCIA_REAL, fonte: FONTE_REAL };
  if (cliente) {
    const id = ID_POR_NOME[String(cliente).trim().toLowerCase()];
    const c = id && REAL.porCliente[id];
    if (!c) return { ...base, erro: `Cliente "${cliente}" não está nos totais reais. Os clientes são AFNE, Instituto Gnosis, FAS e IGEDES.` };
    return {
      ...base, cliente, processos: c.processos, por_area: c.porArea,
      ainda_bloqueado: c.bloqueado, ja_devolvido: c.devolvido, pago_outra_parte: c.pago, processos_com_valor_bloqueado: c.comValor,
      contratos: c.contratos.map((k) => ({ contrato: k.nome, processos: k.processos, ainda_bloqueado: k.bloqueado, ja_devolvido: k.devolvido, pago_outra_parte: k.pago })),
    };
  }
  return {
    ...base, processos: REAL.processos, por_area: REAL.porArea,
    ainda_bloqueado: REAL.bloqueado, ja_devolvido: REAL.devolvido, pago_outra_parte: REAL.pago,
    processos_com_valor_bloqueado: REAL.comValor, percentual_ja_devolvido: REAL.pctDevolvido,
    por_cliente: Object.entries(REAL.porCliente).map(([id, c]) => ({ cliente: id, processos: c.processos, ainda_bloqueado: c.bloqueado, ja_devolvido: c.devolvido, pago_outra_parte: c.pago })),
  };
}

export { FONTE_REAL, REAL, REFERENCIA_REAL, consultarTotaisReais, realCliente };
