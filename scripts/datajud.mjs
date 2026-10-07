#!/usr/bin/env node
/* Consulta o DataJud à mão.
   node scripts/datajud.mjs 0001234-56.2024.5.01.0001          -> mostra as movimentações
   node scripts/datajud.mjs --verificar <cnj> [<cnj> ...]      -> mostra só o que é novo desde a última vez
   (a memória fica em .datajud-memoria.json, fora do git) */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { buscarProcesso, memoriaEmObjeto, verificarAtualizacoes } from "../lib/datajud.mjs";

const args = process.argv.slice(2);
if (!args.length) { console.log("Uso: node scripts/datajud.mjs [--verificar] <número CNJ> ..."); process.exit(1); }

if (args[0] === "--verificar") {
  const arq = ".datajud-memoria.json";
  const memoria = memoriaEmObjeto(existsSync(arq) ? JSON.parse(readFileSync(arq, "utf8")) : {});
  const res = await verificarAtualizacoes(args.slice(1), memoria);
  writeFileSync(arq, JSON.stringify(memoria.dados, null, 2));
  for (const r of res) {
    if (!r.ok) console.log(`✗ ${r.cnj}: ${r.erro}`);
    else if (r.primeiraVez) console.log(`• ${r.cnj}: primeira verificação, histórico guardado`);
    else if (!r.novos.length) console.log(`• ${r.cnj}: nada novo`);
    else { console.log(`★ ${r.cnj}: ${r.novos.length} movimentação(ões) nova(s)`); for (const m of r.novos) console.log(`   ${m.data?.slice(0, 10)}  ${m.nome}${m.complementos.length ? ` (${m.complementos.join("; ")})` : ""}`); }
  }
} else {
  const { alias, cabecalho, movimentos } = await buscarProcesso(args[0]);
  console.log(`${cabecalho?.numero || args[0]} · ${alias.toUpperCase()} · ${cabecalho?.classe || "classe não informada"}`);
  if (cabecalho?.orgaoJulgador) console.log(cabecalho.orgaoJulgador);
  console.log(`${movimentos.length} movimentações (mais recentes primeiro):`);
  for (const m of movimentos.slice(0, 30)) console.log(`  ${m.data?.slice(0, 10)}  ${m.nome}${m.complementos.length ? ` (${m.complementos.join("; ")})` : ""}`);
}
