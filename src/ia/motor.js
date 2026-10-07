import React, { useState, useEffect } from "react";
import { BLOQUEIOS_LISTA, CLIENTE_NOME, TOTAIS } from "../dados/base";
import { consultarDados, listarProcessos } from "../dados/consultas";

/* ------------------------------------------------------------------ */
/* IA real: o Claude escolhe a apresentação, o app calcula os números  */
/* ------------------------------------------------------------------ */
const samplePromise = (typeof window !== "undefined" && window.claude && window.claude.use)
  ? window.claude.use("sample").catch(() => null)
  : Promise.resolve(null);

function useSample() {
  const [sample, setSample] = useState(undefined); // undefined = carregando, null = indisponível
  useEffect(() => { let vivo = true; samplePromise.then((s) => { if (vivo) setSample(() => s); }); return () => { vivo = false; }; }, []);
  return sample;
}

const ERRO_COPY = {
  not_granted: "A IA não foi autorizada nesta visualização. Para usar, permita o acesso ao Claude no menu de permissões do app.",
  sampling_disabled: "A IA não está disponível para esta conta.",
  rate_limited: "Muitas perguntas em pouco tempo. Espere um minuto e tente de novo.",
  session_expired: "Sua sessão expirou. Entre de novo no Claude e tente outra vez.",
  refused: "A IA não respondeu a essa pergunta. Tente reformular.",
  invalid_json: "A resposta da IA veio num formato que o app não conseguiu ler. Tente de novo.",
  empty_completion: "A IA não trouxe resposta. Tente uma pergunta mais curta.",
  tools_unavailable: "Esta visualização não permite que a IA consulte os dados.",
  prompt_too_large: "A pergunta ficou grande demais. Tente algo mais curto.",
};

const erroTexto = (e) => ERRO_COPY[e?.code] || "Não foi possível falar com a IA agora. Tente de novo em instantes.";

const TOOLS_DEF = (onProgress) => [
  {
    name: "consultar_dados",
    description: "Calcula uma métrica sobre a base do escritório e devolve o total e, se pedido, os grupos. Use SEMPRE esta função para obter qualquer número; nunca estime valores.",
    inputSchema: {
      type: "object",
      properties: {
        metrica: { type: "string", enum: ["valor_bloqueado", "quantidade_bloqueios", "quantidade_processos", "processos_parados", "passivo_estimado"], description: "passivo_estimado = soma do valor em discussão dos processos (o passivo que os clientes perguntam), em BRL" },
        agrupar_por: { type: "string", enum: ["nenhum", "cliente", "area", "contrato", "status", "prognostico", "mes"], description: "mes = mês do bloqueio (ou da última movimentação, para processos), de Jan até o mês atual de 2026" },
        cliente: { type: "string", description: "AFNE, Instituto Gnosis, FAS ou IGEDES. Omita para a firma toda." },
        area: { type: "string", enum: ["Trabalhista", "Cível", "Administrativo", "Constitucional"] },
        status_bloqueio: { type: "string", enum: ["Ativo", "Levantado", "todos"], description: "Só para métricas de bloqueio. Padrão: Ativo." },
        dias_minimos_parado: { type: "number", description: "Só para processos_parados. Padrão: 60." },
        prognostico: { type: "string", enum: ["Provável", "Possível", "Remoto"], description: "Só para passivo_estimado." },
      },
      required: ["metrica"],
    },
    execute: (input) => {
      const rot = { valor_bloqueado: "valor bloqueado", quantidade_bloqueios: "bloqueios", quantidade_processos: "processos", processos_parados: "processos parados", passivo_estimado: "passivo estimado" }[input.metrica] || "dados";
      const por = input.agrupar_por && input.agrupar_por !== "nenhum" ? ` por ${input.agrupar_por === "area" ? "área" : input.agrupar_por === "mes" ? "mês" : input.agrupar_por}` : "";
      onProgress(`Consultando ${rot}${por}${input.cliente ? ` de ${input.cliente}` : ""}`);
      return consultarDados(input);
    },
  },
  {
    name: "listar_processos",
    description: "Lista processos (até 25) ordenados pelos mais parados, com número, cliente, área, status, dias parado e valor bloqueado ativo. Use para tabelas de processos específicos.",
    inputSchema: {
      type: "object",
      properties: {
        cliente: { type: "string" },
        area: { type: "string", enum: ["Trabalhista", "Cível", "Administrativo", "Constitucional"] },
        dias_minimos_parado: { type: "number" },
        apenas_com_bloqueio_ativo: { type: "boolean" },
        limite: { type: "number" },
      },
    },
    execute: (input) => { onProgress(`Listando processos${input.cliente ? ` de ${input.cliente}` : ""}`); return listarProcessos(input); },
  },
];

function montarPrompt(pergunta, clienteId) {
  const escopo = clienteId ? `\nA sócia está na página da organização ${CLIENTE_NOME[clienteId]}: filtre todas as consultas por cliente = "${CLIENTE_NOME[clienteId]}", a menos que a pergunta peça outra coisa explicitamente.` : "";
  return `Você é o assistente de estatísticas do app interno dos sócios do escritório Azevedo dos Reis Advogados (Direito do Terceiro Setor). Uma sócia fez uma pergunta e você monta um relatório curto para a tela do celular dela.

Regras:
- Todo número do relatório tem de vir das funções consultar_dados ou listar_processos. Nunca invente nem estime valores. Você pode calcular percentuais simples a partir dos números que as funções devolverem.
- A base cobre ${TOTAIS.processos} processos e ${BLOQUEIOS_LISTA.length} bloqueios de 4 clientes (AFNE, Instituto Gnosis, FAS, IGEDES), com dados de 2026 até outubro. Hoje é 06/10/2026.
- Passivo de um contrato de gestão = consultar_dados com metrica passivo_estimado (agrupe por contrato ou prognostico). É o valor em discussão nos processos, não o valor bloqueado; diga isso quando mostrar.
- Se a pergunta pedir algo que a base não tem (prazos, honorários, nomes de partes, outros anos), diga isso num bloco de texto e não force um gráfico.
- Faça poucas consultas: em geral de 1 a 3.
- Escolha os blocos pela forma do dado: um valor único vira "destaque"; uma série ao longo dos meses vira "linha"; comparação entre poucas categorias (até 8) vira "barras"; lista de processos com várias colunas vira "tabela". Termine sempre com um bloco "texto" de 1 a 2 frases com a conclusão principal, em linguagem simples.
- No máximo 5 blocos. Português do Brasil, sem jargão técnico de sistema.${escopo}

Responda só com JSON neste formato:
{"titulo": "título curto do relatório",
 "blocos": [
   {"tipo": "destaque", "rotulo": "o que é o número", "valor": 1234567, "unidade": "BRL" | "quantidade"},
   {"tipo": "linha", "titulo": "...", "rotulos": ["Jan", "Fev"], "valores": [10, 20], "unidade": "BRL" | "quantidade"},
   {"tipo": "barras", "titulo": "...", "itens": [{"rotulo": "...", "valor": 10}], "unidade": "BRL" | "quantidade"},
   {"tipo": "tabela", "titulo": "...", "colunas": ["..."], "linhas": [["...", "..."]]},
   {"tipo": "texto", "texto": "..."}
 ],
 "fontes": ["Log de Bloqueios" e/ou "Legal One"]}

Pergunta da sócia: ${pergunta}`;
}

async function gerarRelatorio(sample, pergunta, { clienteId, onProgress, signal }) {
  const spec = await sample.json(montarPrompt(pergunta, clienteId), { tools: TOOLS_DEF(onProgress), signal, modelTier: "default" });
  if (!spec || !Array.isArray(spec.blocos)) throw { code: "invalid_json" };
  return spec;
}

/* Relatórios pré-calculados para os dois fixados de exemplo */
function relatorioExemploGnosis() {
  const tot = consultarDados({ metrica: "valor_bloqueado", cliente: "Instituto Gnosis" });
  const porArea = consultarDados({ metrica: "valor_bloqueado", cliente: "Instituto Gnosis", agrupar_por: "area" });
  const porMes = consultarDados({ metrica: "valor_bloqueado", cliente: "Instituto Gnosis", agrupar_por: "mes", status_bloqueio: "todos" });
  const maior = porArea.grupos[0];
  return {
    titulo: "Bloqueios ativos do Instituto Gnosis",
    blocos: [
      { tipo: "destaque", rotulo: "Bloqueado hoje", valor: tot.total, unidade: "BRL" },
      { tipo: "linha", titulo: "Novos bloqueios por mês", rotulos: porMes.grupos.map((g) => g.rotulo), valores: porMes.grupos.map((g) => g.valor), unidade: "BRL" },
      { tipo: "barras", titulo: "Por área do direito", itens: porArea.grupos, unidade: "BRL" },
      { tipo: "texto", texto: maior ? `${maior.rotulo} concentra ${Math.round((maior.valor / tot.total) * 100)}% do valor bloqueado do Instituto Gnosis.` : "Não há bloqueios ativos." },
    ],
    fontes: ["Log de Bloqueios"],
  };
}

function relatorioExemploParados() {
  const tot = consultarDados({ metrica: "processos_parados" });
  const porCli = consultarDados({ metrica: "processos_parados", agrupar_por: "cliente" });
  const lista = listarProcessos({ dias_minimos_parado: 60, limite: 6 });
  return {
    titulo: "Processos parados há mais de 60 dias",
    blocos: [
      { tipo: "destaque", rotulo: "Processos parados", valor: tot.total, unidade: "quantidade" },
      { tipo: "barras", titulo: "Por cliente", itens: porCli.grupos, unidade: "quantidade" },
      { tipo: "tabela", titulo: "Os mais antigos", colunas: ["Cliente", "Ação", "Dias parado"], linhas: lista.map((p) => [p.cliente, p.descricao, String(p.dias_parado)]) },
      { tipo: "texto", texto: `${porCli.grupos[0]?.rotulo || "Nenhum cliente"} tem o maior número de processos parados.` },
    ],
    fontes: ["Legal One"],
  };
}

/* ------------------------------------------------------------------ */
/* App                                                                  */
/* ------------------------------------------------------------------ */
const PINNED_INICIAIS = [
  { id: "pin-gnosis", question: "Quanto o Instituto Gnosis tem bloqueado hoje, e em quais áreas?", spec: relatorioExemploGnosis(), atualizado: "Exemplo calculado da base", pinnedExample: true },
  { id: "pin-parados", question: "Quais processos estão parados há mais de 60 dias?", spec: relatorioExemploParados(), atualizado: "Exemplo calculado da base", pinnedExample: true },
];

export { PINNED_INICIAIS, erroTexto, gerarRelatorio, useSample };
