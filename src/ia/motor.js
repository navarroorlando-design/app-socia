import React, { useState, useEffect } from "react";
import { BLOQUEIOS_LISTA, CLIENTE_NOME, TOTAIS } from "../dados/base";
import { consultarCruzado, consultarDados, listarProcessos } from "../dados/consultas";
import { PERGUNTAS, textoDaPergunta } from "../ajuda/conteudo";

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
        contrato: { type: "string", description: "Parte do nome do órgão do contrato de gestão, ex.: Niterói." },
        mes_inicio: { type: "number", description: "Mês inicial (1 a 12) de 2026, pelo mês do bloqueio ou da última movimentação." },
        mes_fim: { type: "number", description: "Mês final (1 a 12) de 2026." },
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
    name: "consultar_cruzado",
    description: "Como consultar_dados, mas em duas dimensões: para cada grupo de agrupar_por, o valor dividido por dividir_por (ex.: passivo por contrato dividido por prognóstico). Devolve partes e, por grupo, total e valores.",
    inputSchema: {
      type: "object",
      properties: {
        metrica: { type: "string", enum: ["valor_bloqueado", "quantidade_bloqueios", "quantidade_processos", "processos_parados", "passivo_estimado"] },
        agrupar_por: { type: "string", enum: ["cliente", "area", "contrato", "status", "prognostico", "mes"] },
        dividir_por: { type: "string", enum: ["cliente", "area", "contrato", "status", "prognostico"] },
        cliente: { type: "string" }, area: { type: "string" }, contrato: { type: "string" },
        status_bloqueio: { type: "string", enum: ["Ativo", "Levantado", "todos"] },
      },
      required: ["metrica", "agrupar_por", "dividir_por"],
    },
    execute: (input) => { onProgress(`Cruzando ${input.agrupar_por} por ${input.dividir_por}${input.cliente ? ` de ${input.cliente}` : ""}`); return consultarCruzado(input); },
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

/* ------------------------------------------------------------------ */
/* Conversa com a IA (formato do app do Claude)                        */
/* As regras vão num primeiro turno fixo; o histórico vem depois.      */
/* ------------------------------------------------------------------ */
function regras(clienteId) {
  const escopo = clienteId ? `\nEsta conversa começou na página da organização ${CLIENTE_NOME[clienteId]}: filtre as consultas por cliente = "${CLIENTE_NOME[clienteId]}", a menos que a sócia peça outra coisa.` : "";
  return `Você é o analista de dados do app interno dos sócios do escritório Azevedo dos Reis Advogados & Associados (Direito do Terceiro Setor: organizações sociais com contratos de gestão com o poder público). Converse com a sócia como o Claude conversa no celular: análise de verdade, clara e bem organizada. Ela tem dificuldade de ver de perto, então escreva para leitura fácil.

DADOS
- A base cobre ${TOTAIS.processos} processos e ${BLOQUEIOS_LISTA.length} bloqueios SISBAJUD de 4 clientes (AFNE, Instituto Gnosis, FAS, IGEDES), cada um com contratos de gestão, com dados de 2026 até outubro. Hoje é 06/10/2026. São dados de exemplo.
- Todo número que você escrever tem de vir das funções consultar_dados, consultar_cruzado ou listar_processos. Nunca invente nem estime. Pode calcular percentuais e diferenças a partir do que as funções devolverem.
- Passivo de um contrato de gestão = metrica passivo_estimado (valor em discussão nos processos, por prognóstico Provável/Possível/Remoto). Não confunda com valor bloqueado (o que já saiu da conta).
- Se pedirem algo que a base não tem (prazos, honorários, partes, outros anos), diga com clareza e ofereça o que dá para mostrar.
- Faça quantas consultas precisar, em geral de 3 a 8.
- Se a sócia pedir para ser avisada (bloqueio de um cliente passar de um valor, passivo de um contrato passar de um valor, processo ficar parado X dias), use criar_alerta e confirme em uma frase o que foi criado. Alertas ficam em Perfil → Meus alertas.

FORMATO DA RESPOSTA (Markdown)
1. Comece com **Resumo:** e 2 ou 3 frases com a resposta direta e o número principal.
2. Depois, um bloco de números-chave (indicadores), quando houver mais de um número importante.
3. Seções com títulos curtos (###), cada uma com 1 gráfico quando ajudar e 1 ou 2 frases dizendo o que o gráfico mostra. Use listas para pontos de atenção.
4. Termine com ### Próximos passos (2 ou 3 sugestões práticas de acompanhamento, sem prever resultado de processo nem valor de condenação).
5. Por último, um bloco de sugestões com 2 ou 3 perguntas curtas para aprofundar.
Tamanho: o necessário para responder bem. Pergunta simples, resposta curta; pergunta de análise, relatório completo. Português do Brasil, sem jargão de sistema, sem emojis.

GRÁFICOS: você não escreve os números do gráfico. Escreve QUAL consulta o app deve desenhar, num bloco cercado assim:
\`\`\`grafico
{"tipo": "barras", "titulo": "Passivo por contrato de gestão", "consulta": {"metrica": "passivo_estimado", "cliente": "AFNE", "agrupar_por": "contrato"}}
\`\`\`
Tipos:
- "barras": comparar categorias. "consulta" com agrupar_por. Para comparar até 3 recortes lado a lado, use "series": [{"rotulo": "AFNE", "consulta": {...}}, {"rotulo": "FAS", "consulta": {...}}] com o mesmo agrupar_por.
- "linha": evolução por mês. agrupar_por "mes". Também aceita "series".
- "empilhado": cada grupo dividido em partes. "consulta" com agrupar_por e dividir_por (ex.: contrato dividido por prognostico).
- "indicadores": até 4 números-chave. "itens": [{"rotulo": "Bloqueado em setembro", "consulta": {...}, "comparar_com": {...}, "comparacao": "vs. agosto", "bom_quando": "desce"}]. comparar_com e bom_quando são opcionais; bom_quando é "sobe" ou "desce" (bloqueio e passivo: desce é bom).
- "tabela": lista de processos. "processos": parâmetros de listar_processos.
As consultas usam exatamente os parâmetros das funções (metrica, agrupar_por, dividir_por, cliente, area, contrato, status_bloqueio, prognostico, mes_inicio, mes_fim, dias_minimos_parado). Use no máximo 4 gráficos por resposta.

COMO USAR O APP: se a sócia perguntar como fazer algo no próprio app, responda em passos curtos e numerados com base no guia abaixo, sem consultar dados, sem gráficos e sem o formato de relatório (sem Resumo nem Próximos passos). Termine dizendo que o passo a passo também está em Perfil → Como usar o app. Se o guia não cobrir, diga que não sabe em vez de inventar um caminho.
${PERGUNTAS.map((p) => `- ${p.pergunta} ${textoDaPergunta(p)}`).join("\n")}

SUGESTÕES no fim, assim:
\`\`\`sugestoes
["E só os processos trabalhistas?", "Compare com a FAS"]
\`\`\`${escopo}`;
}

// Monta os turnos: regras + histórico (sem respostas com erro), mantendo as últimas trocas.
function montarTurnos(mensagens, clienteId) {
  const hist = mensagens.filter((m) => m.text && m.text.trim() && !(m.role === "assistant" && m.status === "erro"))
    .map((m) => ({ role: m.role, content: m.text })).slice(-12);
  while (hist.length && hist[0].role !== "user") hist.shift();
  return [{ role: "user", content: regras(clienteId) }, ...hist];
}

async function conversar(sample, mensagens, { clienteId, onText, onProgress, signal, ferramentasExtras = [] }) {
  const { text, truncated } = await sample(montarTurnos(mensagens, clienteId), { tools: [...TOOLS_DEF(onProgress), ...ferramentasExtras], signal, onText, modelTier: "default" });
  return { text, truncated };
}

/* ------------------------------------------------------------------ */
/* Relatórios fixados de exemplo: mesmo formato da conversa, números    */
/* calculados da base na hora                                          */
/* ------------------------------------------------------------------ */
const brl = (v) => "R$ " + Math.round(v).toLocaleString("pt-BR");
const cerca = (tipo, obj) => "```" + tipo + "\n" + JSON.stringify(obj) + "\n```";

function exemploGnosis() {
  const cli = "Instituto Gnosis";
  const tot = consultarDados({ metrica: "valor_bloqueado", cliente: cli });
  const lev = consultarDados({ metrica: "valor_bloqueado", cliente: cli, status_bloqueio: "Levantado" });
  const porArea = consultarDados({ metrica: "valor_bloqueado", cliente: cli, agrupar_por: "area" });
  const porContrato = consultarDados({ metrica: "valor_bloqueado", cliente: cli, agrupar_por: "contrato" });
  const set = consultarDados({ metrica: "valor_bloqueado", cliente: cli, status_bloqueio: "todos", mes_inicio: 9, mes_fim: 9 });
  const ago = consultarDados({ metrica: "valor_bloqueado", cliente: cli, status_bloqueio: "todos", mes_inicio: 8, mes_fim: 8 });
  const area = porArea.grupos[0], contrato = porContrato.grupos[0];
  return [
    `**Resumo:** o Instituto Gnosis tem ${brl(tot.total)} bloqueados hoje. ${area.rotulo} concentra ${Math.round((area.valor / tot.total) * 100)}% desse valor, e o contrato com ${contrato.rotulo} responde por ${brl(contrato.valor)}.`,
    cerca("grafico", { tipo: "indicadores", itens: [
      { rotulo: "Bloqueado hoje", consulta: { metrica: "valor_bloqueado", cliente: cli } },
      { rotulo: "Já levantado", consulta: { metrica: "valor_bloqueado", cliente: cli, status_bloqueio: "Levantado" } },
      { rotulo: "Novos bloqueios em setembro", consulta: { metrica: "valor_bloqueado", cliente: cli, status_bloqueio: "todos", mes_inicio: 9, mes_fim: 9 }, comparar_com: { metrica: "valor_bloqueado", cliente: cli, status_bloqueio: "todos", mes_inicio: 8, mes_fim: 8 }, comparacao: "vs. agosto", bom_quando: "desce" },
    ] }),
    "### Onde está o dinheiro bloqueado",
    `${area.rotulo} lidera, com ${brl(area.valor)}. Toque numa barra para ver o valor exato.`,
    cerca("grafico", { tipo: "barras", titulo: "Bloqueado hoje por área", consulta: { metrica: "valor_bloqueado", cliente: cli, agrupar_por: "area" } }),
    "### Por contrato de gestão",
    cerca("grafico", { tipo: "barras", titulo: "Bloqueado hoje por contrato", consulta: { metrica: "valor_bloqueado", cliente: cli, agrupar_por: "contrato" } }),
    "### Ao longo do ano",
    `Em setembro entraram ${brl(set.total)} em novos bloqueios, contra ${brl(ago.total)} em agosto.`,
    cerca("grafico", { tipo: "linha", titulo: "Novos bloqueios por mês", consulta: { metrica: "valor_bloqueado", cliente: cli, status_bloqueio: "todos", agrupar_por: "mes" } }),
    "### Próximos passos",
    `- Acompanhar os pedidos de desbloqueio do contrato com ${contrato.rotulo}, o maior valor.`,
    `- Revisar os bloqueios trabalhistas mais antigos com a equipe responsável.`,
    `Até hoje, ${brl(lev.total)} já foram levantados.`,
    cerca("sugestoes", ["Qual o passivo do Gnosis por contrato?", "Compare com a AFNE", "Quais bloqueios estão ativos há mais tempo?"]),
  ].join("\n\n");
}

function exemploParados() {
  const tot = consultarDados({ metrica: "processos_parados" });
  const porCli = consultarDados({ metrica: "processos_parados", agrupar_por: "cliente" });
  const lider = porCli.grupos[0];
  return [
    `**Resumo:** ${tot.total} processos estão parados há mais de 60 dias. ${lider.rotulo} tem a maior parte (${lider.valor}).`,
    cerca("grafico", { tipo: "barras", titulo: "Processos parados há mais de 60 dias, por cliente", consulta: { metrica: "processos_parados", agrupar_por: "cliente" } }),
    "### Por área",
    cerca("grafico", { tipo: "barras", titulo: "Por área do direito", consulta: { metrica: "processos_parados", agrupar_por: "area" } }),
    "### Os mais antigos",
    cerca("grafico", { tipo: "tabela", titulo: "Parados há mais tempo", processos: { dias_minimos_parado: 60, limite: 6 } }),
    "### Próximos passos",
    "- Pedir à equipe um despacho de impulso nos processos parados há mais de 120 dias.",
    `- Começar pelos processos de ${lider.rotulo}.`,
    cerca("sugestoes", ["Quais desses têm bloqueio ativo?", "E só os trabalhistas?"]),
  ].join("\n\n");
}

const PINNED_INICIAIS = [
  { id: "pin-gnosis", question: "Quanto o Instituto Gnosis tem bloqueado hoje, e em quais áreas?", text: exemploGnosis(), atualizado: "Exemplo calculado da base", pinnedExample: true },
  { id: "pin-parados", question: "Quais processos estão parados há mais de 60 dias?", text: exemploParados(), atualizado: "Exemplo calculado da base", pinnedExample: true },
];

export { PINNED_INICIAIS, conversar, erroTexto, useSample };
