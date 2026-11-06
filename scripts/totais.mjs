#!/usr/bin/env node
/* Lê a planilha de processos ativos (Legal One + controle de bloqueio) e grava só os totais
   em src/dados/reais.gerado.js. Rodar de novo a cada extração nova:
   npm run totais -- caminho/Processos_Ativos_Metricas_App_Socios.xlsx */
import { writeFile } from "node:fs/promises";
import { basename } from "node:path";
import { gerarModulo, lerTotais } from "../lib/importar/totais.mjs";

const arquivo = process.argv[2];
if (!arquivo) {
  console.log("Uso: npm run totais -- <planilha .xlsx>");
  process.exit(1);
}
try {
  const totais = await lerTotais(arquivo);
  await writeFile(new URL("../src/dados/reais.gerado.js", import.meta.url), gerarModulo(totais, basename(arquivo)));
  for (const [id, c] of Object.entries(totais.clientes)) {
    console.log(`${id.padEnd(7)} ${String(c.processos).padStart(4)} processos · ${c.contratos.length} contratos · ${c.comValor} com valor bloqueado`);
  }
  console.log(`Posição do acervo: ${totais.referencia}. Gravado em src/dados/reais.gerado.js.`);
} catch (e) {
  console.log("✗", e.message);
  process.exit(2);
}
