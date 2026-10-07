import React from "react";
import { consultarCruzado, consultarDados, listarProcessos } from "../dados/consultas";
import { CARD, F, S } from "../estilo/tokens";
import { GraficoBarras, GraficoEmpilhado, GraficoLinha, Indicadores, TabelaProcessos } from "./Graficos";

/* ------------------------------------------------------------------ */
/* Resposta da IA: Markdown simples + blocos ```grafico e ```sugestoes  */
/* O bloco de gráfico diz QUAL consulta mostrar; o app roda a consulta */
/* e desenha. Nenhum número de gráfico vem escrito pela IA.            */
/* ------------------------------------------------------------------ */

// Divide o texto em blocos. Um bloco cercado ainda aberto (resposta chegando) vira "pendente".
function separar(texto) {
  const blocos = [];
  const linhas = texto.split("\n");
  let i = 0, par = [];
  const fecharPar = () => { if (par.length) { blocos.push({ tipo: "md", linhas: par }); par = []; } };
  while (i < linhas.length) {
    const m = linhas[i].match(/^\s*```\s*(\w+)?\s*$/);
    if (m) {
      fecharPar();
      const tipo = (m[1] || "").toLowerCase(), corpo = [];
      i++;
      while (i < linhas.length && !/^\s*```\s*$/.test(linhas[i])) corpo.push(linhas[i++]);
      blocos.push({ tipo: i < linhas.length ? `cerca:${tipo}` : `pendente:${tipo}`, corpo: corpo.join("\n") });
      i++;
      continue;
    }
    par.push(linhas[i++]);
  }
  fecharPar();
  return blocos;
}

// **negrito** dentro de uma linha
const inline = (t) => t.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (/^\*\*[^*]+\*\*$/.test(p) ? <strong key={i} style={{ fontWeight: 600 }}>{p.slice(2, -2)}</strong> : p.replace(/`/g, "")));

const P = { fontFamily: F.ui, fontSize: 17, color: S.ink, lineHeight: 1.55 };

function Markdown({ linhas }) {
  const out = [];
  let lista = null, tabela = null;
  const fecha = () => {
    if (lista) { out.push(lista.ord ? <ol key={out.length} style={{ ...P, paddingLeft: 22, listStyle: "decimal", margin: "8px 0" }}>{lista.itens}</ol> : <ul key={out.length} style={{ ...P, paddingLeft: 22, listStyle: "disc", margin: "8px 0" }}>{lista.itens}</ul>); lista = null; }
    if (tabela) {
      const [cab, ...corpo] = tabela.filter((l) => !/^\s*\|?\s*:?-{2,}/.test(l)).map((l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
      out.push(
        <div key={out.length} className="overflow-x-auto" style={{ ...CARD, margin: "12px 0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: F.ui, fontSize: 15, color: S.ink }}>
            <thead><tr>{cab.map((c, i) => <th key={i} style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600, borderBottom: `1px solid ${S.linha}`, whiteSpace: "nowrap" }}>{inline(c)}</th>)}</tr></thead>
            <tbody>{corpo.map((r, ri) => <tr key={ri}>{r.map((c, i) => <td key={i} style={{ padding: "10px 12px", borderTop: ri ? `1px solid ${S.linha}` : "none", fontVariantNumeric: "tabular-nums" }}>{inline(c)}</td>)}</tr>)}</tbody>
          </table>
        </div>,
      );
      tabela = null;
    }
  };
  for (const l of linhas) {
    if (/^\s*\|/.test(l)) { if (lista) fecha(); (tabela ||= []).push(l); continue; }
    if (tabela) fecha();
    const h = l.match(/^\s*#{1,4}\s+(.*)/);
    const li = l.match(/^\s*[-*•]\s+(.*)/);
    const ol = l.match(/^\s*\d+[.)]\s+(.*)/);
    if (h) { fecha(); out.push(<h3 key={out.length} style={{ fontFamily: F.ui, fontSize: 19, fontWeight: 600, color: S.ink, margin: "22px 0 6px", letterSpacing: "-0.01em" }}>{inline(h[1])}</h3>); }
    else if (li || ol) {
      const ord = !!ol;
      if (lista && lista.ord !== ord) fecha();
      (lista ||= { ord, itens: [] }).itens.push(<li key={lista.itens.length} style={{ margin: "4px 0" }}>{inline((li || ol)[1])}</li>);
    } else if (!l.trim()) fecha();
    else { fecha(); out.push(<p key={out.length} style={{ ...P, margin: "8px 0" }}>{inline(l)}</p>); }
  }
  fecha();
  return <>{out}</>;
}

/* ---------------- Gráficos pedidos pela IA, calculados aqui ---------------- */
const TOP = 8;
function limitar(grupos, unidade) {
  if (grupos.length <= TOP) return grupos;
  const resto = grupos.slice(TOP - 1).reduce((s, g) => s + g.valor, 0);
  return [...grupos.slice(0, TOP - 1), { rotulo: "Outros", valor: resto, unidade }];
}

function montarGrafico(g) {
  const tipo = g.tipo;
  if (tipo === "indicadores") {
    const itens = (g.itens || []).slice(0, 4).map((it) => {
      const atual = consultarDados({ ...it.consulta, agrupar_por: "nenhum" });
      const ant = it.comparar_com ? consultarDados({ ...it.comparar_com, agrupar_por: "nenhum" }).total : undefined;
      return { rotulo: it.rotulo, valor: atual.total, unidade: atual.unidade, anterior: ant, bomQuando: it.bom_quando, comparacao: it.comparacao };
    });
    return <Indicadores itens={itens} />;
  }
  if (tipo === "tabela") {
    return <TabelaProcessos titulo={g.titulo} linhas={listarProcessos(g.processos || g.consulta || {})} />;
  }
  if (tipo === "empilhado") {
    const r = consultarCruzado(g.consulta);
    return <GraficoEmpilhado titulo={g.titulo} sub={g.subtitulo} partes={r.partes} grupos={r.grupos.slice(0, TOP)} unidade={r.unidade} />;
  }
  // barras ou linha, com uma série (consulta) ou várias (series)
  const series = g.series?.length ? g.series.slice(0, 3) : [{ rotulo: g.titulo, consulta: g.consulta }];
  const res = series.map((s) => consultarDados(s.consulta));
  if (!res[0].grupos.length) throw new Error("consulta sem agrupar_por");
  const unidade = res[0].unidade;
  if (tipo === "linha") {
    const rotulos = res[0].grupos.map((x) => x.rotulo);
    return <GraficoLinha titulo={g.titulo} sub={g.subtitulo} rotulos={rotulos} unidade={unidade}
                         series={res.map((r, i) => ({ rotulo: series[i].rotulo, valores: rotulos.map((rt) => r.grupos.find((x) => x.rotulo === rt)?.valor || 0) }))} />;
  }
  const categorias = limitar(res[0].grupos, unidade).map((x) => x.rotulo);
  const valorDe = (r, cat) => (cat === "Outros" ? limitar(r.grupos, unidade).find((x) => x.rotulo === "Outros")?.valor || 0 : r.grupos.find((x) => x.rotulo === cat)?.valor || 0);
  return <GraficoBarras titulo={g.titulo} sub={g.subtitulo} categorias={categorias} unidade={unidade}
                        series={res.map((r, i) => ({ rotulo: series[i].rotulo, valores: categorias.map((c) => valorDe(r, c)) }))} />;
}

const Aviso = ({ children }) => (
  <p style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2, background: S.papel, borderRadius: 14, padding: "12px 14px", margin: "12px 0" }}>{children}</p>
);

function GraficoDaIA({ corpo }) {
  try {
    return montarGrafico(JSON.parse(corpo));
  } catch {
    return <Aviso>Não consegui montar este gráfico com os dados da base.</Aviso>;
  }
}

/* Sugestões de pergunta no fim da resposta */
function lerSugestoes(texto) {
  const b = separar(texto).filter((x) => x.tipo === "cerca:sugestoes").pop();
  if (!b) return [];
  try { const a = JSON.parse(b.corpo); return Array.isArray(a) ? a.map(String).slice(0, 3) : []; } catch { return []; }
}

// Texto corrido para "Ouvir": sem blocos de gráfico nem marcação
function textoParaOuvir(texto) {
  return separar(texto).filter((b) => b.tipo === "md").map((b) => b.linhas.join("\n")).join("\n")
    .replace(/[#*`|]/g, " ").replace(/^\s*[-•]\s+/gm, "").replace(/\s+/g, " ").trim();
}

function Resposta({ texto }) {
  return (
    <div>
      {separar(texto).map((b, i) => {
        if (b.tipo === "md") return <Markdown key={i} linhas={b.linhas} />;
        if (b.tipo === "cerca:grafico") return <GraficoDaIA key={i} corpo={b.corpo} />;
        if (b.tipo === "pendente:grafico") return <Aviso key={i}>Preparando gráfico…</Aviso>;
        return null;
      })}
    </div>
  );
}

export { Resposta, lerSugestoes, textoParaOuvir };
