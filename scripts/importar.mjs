#!/usr/bin/env node
/* Testa a leitura de um relatório exportado do Legal One, sem gravar nada.
   npm run importar -- processos caminho/relatorio.xlsx
   npm run importar -- bloqueios caminho/log-bloqueios.xlsx
   Mostra quais colunas foram reconhecidas, um resumo e os problemas por linha. */
import { importarBloqueios, importarProcessos } from "../lib/importar/planilha.mjs";

const [tipo, arquivo] = process.argv.slice(2);
if (!["processos", "bloqueios"].includes(tipo) || !arquivo) {
  console.log("Uso: npm run importar -- processos|bloqueios <arquivo .xlsx ou .html>");
  process.exit(1);
}
const r = tipo === "processos" ? await importarProcessos(arquivo) : await importarBloqueios(arquivo);
if (!r.ok) { console.log("✗", r.erro); process.exit(2); }
if (r.colunas) {
  console.log("Colunas reconhecidas:");
  for (const [campo, nome] of Object.entries(r.colunas.reconhecidas)) console.log(`  ${campo.padEnd(22)} ← "${nome}"`);
  if (r.colunas.ignoradas.length) console.log("Colunas ignoradas:", r.colunas.ignoradas.join(", "));
}
console.log("\nResumo:", JSON.stringify(r.resumo, null, 2));
console.log(`\n${r.problemas.length} problema(s):`);
for (const p of r.problemas.slice(0, 50)) console.log(`  linha ${p.linha} · ${p.campo}: ${p.mensagem}`);
if (r.problemas.length > 50) console.log(`  … e mais ${r.problemas.length - 50}`);
