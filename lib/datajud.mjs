/* ------------------------------------------------------------------ */
/* DataJud (CNJ): busca de movimentações pela API Pública              */
/* Documentação: https://datajud-wiki.cnj.jus.br/api-publica/          */
/* A API é por tribunal (um endereço para cada) e usa uma chave        */
/* pública divulgada pelo CNJ, que pode mudar: confira no wiki e       */
/* defina DATAJUD_API_KEY quando mudar.                                */
/* ------------------------------------------------------------------ */
const BASE = "https://api-publica.datajud.cnj.jus.br";
const CHAVE_PUBLICA = "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";

// Ordem das UFs no código TR da numeração única (Justiça Estadual e Eleitoral).
const UFS = ["ac", "al", "ap", "am", "ba", "ce", "dft", "es", "go", "ma", "mt", "ms", "mg", "pa", "pb", "pr", "pe", "pi", "rj", "rn", "rs", "ro", "rr", "sc", "se", "sp", "to"];

/** Só os 20 dígitos do número CNJ (NNNNNNN-DD.AAAA.J.TR.OOOO). */
function limparNumero(cnj) {
  const d = String(cnj || "").replace(/\D/g, "");
  if (d.length !== 20) throw new Error(`Número CNJ inválido: ${cnj}`);
  return d;
}

/** Descobre o índice do tribunal na API a partir dos segmentos J (justiça) e TR (tribunal). */
function aliasDoTribunal(cnj) {
  const d = limparNumero(cnj);
  const j = d[13], tr = Number(d.slice(14, 16));
  switch (j) {
    case "3": return "stj";
    case "4": return `trf${tr}`;
    case "5": return tr === 0 ? "tst" : `trt${tr}`;
    case "6": return tr === 0 ? "tse" : `tre-${UFS[tr - 1] === "dft" ? "df" : UFS[tr - 1]}`;
    case "7": return "stm";
    case "8": return UFS[tr - 1] === "dft" ? "tjdft" : `tj${UFS[tr - 1]}`;
    case "9": return { 13: "tjmmg", 21: "tjmrs", 26: "tjmsp" }[tr] || null;
    default: return null; // 1 = STF e 2 = CNJ não estão na API pública
  }
}

/** Junta os graus (1º grau, 2º grau...) num histórico só, do mais recente ao mais antigo, sem repetir. */
function normalizar(hits) {
  const vistos = new Set();
  const movimentos = [];
  let cabecalho = null;
  for (const h of hits || []) {
    const s = h._source || h;
    cabecalho ||= {
      numero: s.numeroProcesso, tribunal: s.tribunal, classe: s.classe?.nome, assuntos: (s.assuntos || []).map((a) => a.nome).filter(Boolean),
      orgaoJulgador: s.orgaoJulgador?.nome, dataAjuizamento: s.dataAjuizamento, atualizadoEm: s.dataHoraUltimaAtualizacao,
    };
    for (const m of s.movimentos || []) {
      const chave = `${m.dataHora}|${m.codigo}|${s.grau}`;
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      movimentos.push({
        id: chave, data: m.dataHora, codigo: m.codigo, nome: m.nome, grau: s.grau,
        orgao: m.orgaoJulgador?.nomeOrgao || s.orgaoJulgador?.nome || null,
        complementos: (m.complementosTabelados || []).map((c) => [c.nome, c.descricao || c.valor].filter(Boolean).join(": ")).filter(Boolean),
      });
    }
  }
  movimentos.sort((a, b) => String(b.data).localeCompare(String(a.data)));
  return { cabecalho, movimentos };
}

/** Busca um processo no DataJud. Lança erro com mensagem clara quando não dá. */
async function buscarProcesso(cnj, { apiKey = process.env.DATAJUD_API_KEY || CHAVE_PUBLICA, fetchFn = fetch, timeoutMs = 20000 } = {}) {
  const alias = aliasDoTribunal(cnj);
  if (!alias) throw new Error(`Tribunal fora da API pública do DataJud: ${cnj}`);
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const r = await fetchFn(`${BASE}/api_publica_${alias}/_search`, {
      method: "POST", signal: ctl.signal,
      headers: { Authorization: `APIKey ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: { match: { numeroProcesso: limparNumero(cnj) } }, size: 10 }),
    });
    if (!r.ok) throw new Error(`DataJud respondeu ${r.status} para ${cnj} (${alias})`);
    const json = await r.json();
    return { alias, ...normalizar(json?.hits?.hits) };
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------------------------------------------ */
/* Acompanhamento: compara com o que já foi visto e devolve o que é novo */
/* `memoria` guarda por processo os ids de movimento já vistos:          */
/*   { get(cnj) -> Promise<{vistos: string[], verificadoEm}> , set(cnj, estado) } */
/* ------------------------------------------------------------------ */
async function verificarAtualizacoes(processos, memoria, { buscar = buscarProcesso, pausaMs = 400 } = {}) {
  const resultado = [];
  for (const cnj of processos) {
    try {
      const { cabecalho, movimentos } = await buscar(cnj);
      const antes = (await memoria.get(cnj)) || null;
      const vistos = new Set(antes?.vistos || []);
      // Primeira verificação: registra o histórico sem avisar (senão tudo pareceria novo).
      const novos = antes ? movimentos.filter((m) => !vistos.has(m.id)) : [];
      await memoria.set(cnj, { vistos: movimentos.map((m) => m.id).slice(0, 500), verificadoEm: new Date().toISOString() });
      resultado.push({ cnj, ok: true, primeiraVez: !antes, novos, classe: cabecalho?.classe || null });
    } catch (e) {
      resultado.push({ cnj, ok: false, erro: e.message });
    }
    if (pausaMs) await new Promise((r) => setTimeout(r, pausaMs)); // educado com a API pública
  }
  return resultado;
}

/** Memória simples em objeto (testes e uso local). */
function memoriaEmObjeto(obj = {}) {
  return { dados: obj, get: async (k) => obj[k] || null, set: async (k, v) => { obj[k] = v; } };
}

export { aliasDoTribunal, buscarProcesso, limparNumero, memoriaEmObjeto, normalizar, verificarAtualizacoes };
