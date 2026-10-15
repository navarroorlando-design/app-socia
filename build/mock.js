(() => {
  const espera = (ms) => new Promise((r) => setTimeout(r, ms));
  const sample = async (msgs, { tools, onText }) => {
    const ferramenta = (n) => tools.find((t) => t.name === n);
    await espera(700);
    ferramenta("consultar_dados").execute({ metrica: "processos_parados", agrupar_por: "cliente" });
    await espera(900);
    ferramenta("consultar_dados").execute({ metrica: "valor_bloqueado", agrupar_por: "area" });
    await espera(900);
    const lista = ferramenta("listar_processos").execute({ dias_minimos_parado: 90, limite: 5 });
    await espera(1400);
    const nums = lista.map((p) => p.numero);
    const texto = [
      "**Resumo:** " + lista.length + " processos estão parados há mais de 90 dias. Os cinco mais antigos estão nos cartões abaixo.",
      "```grafico",
      JSON.stringify({ tipo: "indicadores", itens: [
        { rotulo: "Parados há 60+ dias", consulta: { metrica: "processos_parados" } },
        { rotulo: "Bloqueado hoje", consulta: { metrica: "valor_bloqueado" } } ] }),
      "```",
      "### Por cliente",
      "```grafico",
      JSON.stringify({ tipo: "barras", titulo: "Parados por cliente", consulta: { metrica: "processos_parados", agrupar_por: "cliente" } }),
      "```",
      "### Os mais antigos",
      "```acoes",
      JSON.stringify({ titulo: "Parados há mais tempo", processos: nums }),
      "```",
      "### Próximos passos",
      "- Pedir à equipe um despacho de impulso nos mais antigos.",
      "```sugestoes",
      JSON.stringify(["Quais têm bloqueio ativo?", "E só os trabalhistas?"]),
      "```",
    ].join("\n\n");
    for (let i = 40; i < texto.length; i += 60) { onText({ text: texto.slice(0, i) }); await espera(40); }
    onText({ text: texto });
    return { text: texto, truncated: false };
  };
  window.claude = { use: async () => sample };
})();
