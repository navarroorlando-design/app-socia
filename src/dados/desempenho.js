import { BLOQUEIOS_LISTA, ENCERRADOS_2026, PROCESSOS_LISTA, AREAS } from "./base";
import { HOJE } from "./formato";

/* ------------------------------------------------------------------ */
/* Série mensal para a tela Desempenho (redesenho v3, seção B.7 e        */
/* docs/redesign-v3/ref/especificacao-graficos.md, seção 0).            */
/*                                                                      */
/* A base de exemplo só modela dados reais e computáveis do ano          */
/* calendário de 2026 (entradaMes/saiuMes). Não há base real para 2025   */
/* nem para uma janela rolante de "últimos 12 meses" — por isso          */
/* `serieMensal` só calcula o período "2026"; para os outros dois,       */
/* devolve `null`, e a tela mostra um aviso em vez de inventar números.  */
/* TODO: calcular 2025 e "últimos 12 meses" quando houver histórico real. */
/* ------------------------------------------------------------------ */

const MESES_ABREV = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function serieMensal(periodo) {
  if (periodo !== "2026") return null;

  const hoje = HOJE;
  const mesHoje = hoje.getMonth(); // 9 = outubro, com HOJE em 2026-10-08
  const totalHoje = PROCESSOS_LISTA.length;
  const novosNoPeriodo = PROCESSOS_LISTA.filter((p) => p.entradaMes >= 0).length;
  const encerradosNoPeriodo = ENCERRADOS_2026.length;
  const carteiraInicial = totalHoje - novosNoPeriodo + encerradosNoPeriodo;

  const meses = [];
  let carteira = carteiraInicial, revertidoAc = 0, emDiscussaoAc = 0, favAc = 0, encAc = 0;
  for (let m = 0; m <= mesHoje; m++) {
    const novos = PROCESSOS_LISTA.filter((p) => p.entradaMes === m).length;
    const encDoMes = ENCERRADOS_2026.filter((e) => e.saiuMes === m);
    const favoraveis = encDoMes.filter((e) => e.resultado === "Favorável" || e.resultado === "Acordo").length;
    carteira += novos - encDoMes.length;
    encAc += encDoMes.length;
    favAc += favoraveis;

    const levantados = BLOQUEIOS_LISTA.filter((b) => b.status === "Levantado" && b.liberadoEm && b.liberadoEm.getFullYear() === 2026 && b.liberadoEm.getMonth() === m);
    const emDiscussao = encDoMes.reduce((s, e) => s + e.valorCausa, 0);
    const revertido = encDoMes.reduce((s, e) => s + e.valorRevertido, 0);
    emDiscussaoAc += emDiscussao;
    revertidoAc += revertido;

    meses.push({
      mes: `2026-${String(m + 1).padStart(2, "0")}`,
      rotulo: MESES_ABREV[m],
      novos, encerrados: encDoMes.length, carteira,
      favoraveis, indiceAcumulado: encAc ? Math.round((favAc / encAc) * 100) : null,
      levantadoValor: levantados.reduce((s, b) => s + b.valorNum, 0), levantadoQtd: levantados.length,
      emDiscussao, revertido, mantido: emDiscussao - revertido,
      revertidoAcumulado: emDiscussaoAc ? Math.round((revertidoAc / emDiscussaoAc) * 100) : null,
    });
  }

  return {
    periodo: { de: "2026-01-01", ate: `2026-${String(mesHoje + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}` },
    carteiraInicial, carteiraHoje: totalHoje, meses,
  };
}

/* Resumos usados abaixo de cada gráfico e no "Por cliente"/"Por área". */
function resumoNovosEncerrados(serie) {
  const novos = serie.meses.reduce((s, m) => s + m.novos, 0);
  const encerrados = serie.meses.reduce((s, m) => s + m.encerrados, 0);
  return { novos, encerrados, saldo: novos - encerrados };
}

function resumoLevantamentos() {
  const levantados = BLOQUEIOS_LISTA.filter((b) => b.status === "Levantado" && b.liberadoEm);
  const valor = levantados.reduce((s, b) => s + b.valorNum, 0);
  const diasMedio = levantados.length ? Math.round(levantados.reduce((s, b) => s + Math.round((b.liberadoEm - b.data) / 86400000), 0) / levantados.length) : 0;
  return { qtd: levantados.length, valor, diasMedio };
}

function resumoRevertido(serie) {
  const emDiscussao = serie.meses.reduce((s, m) => s + m.emDiscussao, 0);
  const revertido = serie.meses.reduce((s, m) => s + m.revertido, 0);
  return { emDiscussao, revertido, mantido: emDiscussao - revertido, pct: emDiscussao ? Math.round((revertido / emDiscussao) * 100) : 0 };
}

/* Agrupamentos "Por cliente" / "Por área", para Novos x encerrados e Valor revertido. */
function porRecorte(recorte, clienteNome) {
  if (recorte === "area") {
    return Object.keys(AREAS).filter((a) => a !== "Constitucional").map((area) => ({
      id: area, nome: area,
      novos: PROCESSOS_LISTA.filter((p) => p.area === area && p.entradaMes >= 0).length,
      encerrados: ENCERRADOS_2026.filter((e) => e.area === area).length,
      emDiscussao: ENCERRADOS_2026.filter((e) => e.area === area).reduce((s, e) => s + e.valorCausa, 0),
      revertido: ENCERRADOS_2026.filter((e) => e.area === area).reduce((s, e) => s + e.valorRevertido, 0),
    })).filter((o) => o.novos || o.encerrados);
  }
  const ids = [...new Set(PROCESSOS_LISTA.map((p) => p.clienteId))];
  return ids.map((id) => ({
    id, nome: clienteNome[id],
    novos: PROCESSOS_LISTA.filter((p) => p.clienteId === id && p.entradaMes >= 0).length,
    encerrados: ENCERRADOS_2026.filter((e) => e.clienteId === id).length,
    emDiscussao: ENCERRADOS_2026.filter((e) => e.clienteId === id).reduce((s, e) => s + e.valorCausa, 0),
    revertido: ENCERRADOS_2026.filter((e) => e.clienteId === id).reduce((s, e) => s + e.valorRevertido, 0),
  })).filter((o) => o.novos || o.encerrados);
}

export { serieMensal, resumoNovosEncerrados, resumoLevantamentos, resumoRevertido, porRecorte, MESES_ABREV };
