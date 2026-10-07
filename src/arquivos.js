/* Entrega um arquivo gerado no app. Dentro do claude.ai, pede ao visualizador para salvar
   (capacidade "downloads"); fora dele, baixa direto pelo navegador. */
async function salvarArquivo(nome, blob) {
  const claude = typeof window !== "undefined" ? window.claude : null;
  if (claude && claude.use) {
    const downloads = await claude.use("downloads").catch(() => null);
    if (!downloads) return { ok: false, motivo: "Este visualizador não permite baixar arquivos." };
    try {
      await downloads.save({ filename: nome, data: blob });
      return { ok: true };
    } catch (e) {
      if (e?.code === "declined") return { ok: false, motivo: "Download cancelado." };
      if (e?.code === "rate_limited") return { ok: false, motivo: "Já há um download esperando sua confirmação." };
      return { ok: false, motivo: "Não foi possível baixar o arquivo aqui." };
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = nome;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return { ok: true };
}

export { salvarArquivo };
