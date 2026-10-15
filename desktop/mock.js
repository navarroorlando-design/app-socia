(() => {
  const espera = ms => new Promise(r => setTimeout(r, ms));
  const sample = async (msgs, { tools, onText }) => {
    const f = n => tools.find(t => t.name === n);
    await espera(400); f("consultar_dados").execute({ metrica: "valor_bloqueado", agrupar_por: "cliente" });
    await espera(400); const lista = f("listar_processos").execute({ apenas_com_bloqueio_ativo: true, limite: 4 });
    await espera(300); f("ver_processo").execute({ numero: lista[0].numero });
    const t = ["**Resumo:** hoje há bloqueios ativos em quatro clientes. O Instituto Gnosis concentra a maior parte.",
      "```grafico", JSON.stringify({tipo:"indicadores",itens:[{rotulo:"Bloqueado hoje",consulta:{metrica:"valor_bloqueado"}},{rotulo:"Perdido",consulta:{metrica:"valor_perdido"}},{rotulo:"Devolvido",consulta:{metrica:"valor_devolvido"}}]}), "```",
      "### Por cliente", "```grafico", JSON.stringify({tipo:"barras",titulo:"Bloqueado por cliente",consulta:{metrica:"valor_bloqueado",agrupar_por:"cliente"}}), "```",
      "O gráfico mostra o valor ativo de cada cliente.",
      "### Passivo por contrato", "```grafico", JSON.stringify({tipo:"empilhado",titulo:"Passivo por contrato e prognóstico",consulta:{metrica:"passivo_estimado",agrupar_por:"contrato",dividir_por:"prognostico"}}), "```",
      "### Evolução", "```grafico", JSON.stringify({tipo:"linha",titulo:"Passivo mês a mês",consulta:{metrica:"passivo_estimado",agrupar_por:"mes"}}), "```",
      "### Próximos passos", "- Pedir à equipe o andamento dos pedidos de desbloqueio.", "- Rever os contratos com maior passivo provável.",
      "```acoes", JSON.stringify({titulo:"Processos para acompanhar",processos:lista.map(p=>p.numero)}), "```",
      "```sugestoes", JSON.stringify(["E só os trabalhistas?","Compare com setembro"]), "```"].join("\n");
    let acc = ""; for (const ch of t.match(/[\s\S]{1,60}/g)) { acc += ch; onText && onText({ text: acc }); await espera(15); }
    return { text: t, truncated: false };
  };
  window.claude = { use: n => Promise.resolve(n === "sample" ? sample : null) };
})();
