import React, { useState } from "react";
import { fmtBRL, fmtBRLCurto } from "../dados/formato";
import { CARD, DADOS, F, S } from "../estilo/tokens";

/* ------------------------------------------------------------------ */
/* Gráficos dos relatórios da IA                                       */
/* Marcas finas, grade discreta, texto sempre na cor do texto (nunca   */
/* na cor da série), toque mostra o valor exato.                       */
/* ------------------------------------------------------------------ */

// Uma série: oliva. Várias séries: paleta validada (daltonismo e contraste) que não repete as cores de status.
const COR_UNICA = S.oliva;
const CORES_SERIES = ["#2A80AE", "#C9773E", "#7E62A8"];
// Paleta de dados (DADOS), não as cores de status: prognóstico não é "risco" nem "atenção" da
// interface, é um dado com legenda própria (consolidacao.md, item 16).
const COR_PARTE = { Provável: DADOS.prov, Possível: DADOS.poss, Remoto: DADOS.rem };
const corDaParte = (parte, i) => COR_PARTE[parte] || CORES_SERIES[i % CORES_SERIES.length];

const fmt = (v, unidade) => (unidade === "BRL" ? fmtBRL(Number(v) || 0) : Number(v || 0).toLocaleString("pt-BR"));
const fmtCurto = (v, unidade) => (unidade === "BRL" ? fmtBRLCurto(Number(v) || 0) : Number(v || 0).toLocaleString("pt-BR"));

// Marcas de eixo "redondas" (0, 250 mil, 500 mil...)
function ticks(max, n = 4) {
  if (max <= 0) return [0, 1];
  const bruto = max / n, mag = 10 ** Math.floor(Math.log10(bruto));
  const passo = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((p) => p >= bruto) || bruto;
  const out = [];
  for (let v = 0; v <= max + passo * 0.001; v += passo) out.push(v);
  if (out[out.length - 1] < max) out.push(out[out.length - 1] + passo);
  return out;
}

const Moldura = ({ titulo, sub, children, legenda }) => (
  <figure className="my-4" style={{ ...CARD, padding: 18, margin: "16px 0" }}>
    {titulo && <figcaption style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink, lineHeight: 1.3 }}>{titulo}</figcaption>}
    {sub && <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 2 }}>{sub}</p>}
    {legenda && legenda.length > 1 && (
      <div className="flex flex-wrap gap-x-4 gap-y-1.5" style={{ marginTop: 10 }}>
        {legenda.map(([rot, cor]) => (
          <span key={rot} className="inline-flex items-center gap-1.5" style={{ fontFamily: F.ui, fontSize: 14, color: S.ink }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: cor }} />{rot}
          </span>
        ))}
      </div>
    )}
    <div style={{ marginTop: 14 }}>{children}</div>
  </figure>
);

const Dica = ({ children }) => (
  <p role="status" style={{ fontFamily: F.ui, fontSize: 15, color: S.ink, background: S.papel, borderRadius: 12, padding: "8px 12px", marginTop: 12 }}>{children}</p>
);

/* Barras horizontais: rótulo inteiro em cima, barra embaixo, valor na ponta. Com várias séries, barras agrupadas. */
function GraficoBarras({ titulo, sub, categorias, series, unidade }) {
  const [sel, setSel] = useState(null);
  const max = Math.max(...series.flatMap((s) => s.valores.map(Number)), 1);
  const varias = series.length > 1;
  return (
    <Moldura titulo={titulo} sub={sub} legenda={varias ? series.map((s, i) => [s.rotulo, CORES_SERIES[i]]) : null}>
      <div className="flex flex-col" style={{ gap: 14 }}>
        {categorias.map((cat, ci) => (
          <button key={cat} onClick={() => setSel(sel === ci ? null : ci)} className="text-left w-full" aria-pressed={sel === ci}
                  aria-label={`${cat}: ${series.map((s) => `${varias ? s.rotulo + " " : ""}${fmt(s.valores[ci], unidade)}`).join(", ")}`}>
            <span className="block" style={{ fontFamily: F.ui, fontSize: 15, color: S.ink, lineHeight: 1.3 }}>{cat}</span>
            {series.map((s, si) => {
              const v = Number(s.valores[ci]) || 0;
              return (
                <span key={si} className="flex items-center gap-2" style={{ marginTop: si ? 3 : 5 }}>
                  <span className="flex-1 min-w-0">
                    <span className="block" style={{ height: 14, width: `${Math.max(1.5, (v / max) * 100)}%`, background: varias ? CORES_SERIES[si] : COR_UNICA,
                                                      borderRadius: "0 4px 4px 0", opacity: sel === null || sel === ci ? 1 : 0.45 }} />
                  </span>
                  <span style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 600, color: S.ink, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", minWidth: 64, textAlign: "right" }}>{fmtCurto(v, unidade)}</span>
                </span>
              );
            })}
          </button>
        ))}
      </div>
      {sel !== null && <Dica><strong>{categorias[sel]}</strong>: {series.map((s) => `${varias ? s.rotulo + " " : ""}${fmt(s.valores[sel], unidade)}`).join(" · ")}</Dica>}
    </Moldura>
  );
}

/* Barras empilhadas: cada grupo dividido em partes (ex.: passivo por prognóstico), 2px entre segmentos. */
function GraficoEmpilhado({ titulo, sub, partes, grupos, unidade }) {
  const [sel, setSel] = useState(null);
  const max = Math.max(...grupos.map((g) => g.total), 1);
  return (
    <Moldura titulo={titulo} sub={sub} legenda={partes.map((p, i) => [p, corDaParte(p, i)])}>
      <div className="flex flex-col" style={{ gap: 16 }}>
        {grupos.map((g, gi) => (
          <button key={g.rotulo} onClick={() => setSel(sel === gi ? null : gi)} className="text-left w-full" aria-pressed={sel === gi}
                  aria-label={`${g.rotulo}: total ${fmt(g.total, unidade)}. ${partes.map((p, i) => `${p} ${fmt(g.valores[i], unidade)}`).join(", ")}`}>
            <span className="flex items-baseline justify-between gap-2">
              <span style={{ fontFamily: F.ui, fontSize: 15, color: S.ink, lineHeight: 1.3 }}>{g.rotulo}</span>
              <span style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 600, color: S.ink, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{fmtCurto(g.total, unidade)}</span>
            </span>
            <span className="flex" style={{ marginTop: 6, height: 16, width: `${Math.max(2, (g.total / max) * 100)}%`, gap: 2, opacity: sel === null || sel === gi ? 1 : 0.45 }}>
              {partes.map((p, i) => g.valores[i] > 0 && (
                <span key={p} style={{ flex: g.valores[i], background: corDaParte(p, i), borderRadius: i === partes.length - 1 || !g.valores.slice(i + 1).some((x) => x > 0) ? "0 4px 4px 0" : 0 }} />
              ))}
            </span>
          </button>
        ))}
      </div>
      {sel !== null && (
        <Dica><strong>{grupos[sel].rotulo}</strong>: {partes.map((p, i) => `${p} ${fmt(grupos[sel].valores[i], unidade)}`).join(" · ")}</Dica>
      )}
    </Moldura>
  );
}

/* Linha ao longo dos meses: grade com valores, 2px, ponto final destacado, toque mostra o mês. */
function GraficoLinha({ titulo, sub, rotulos, series, unidade }) {
  const n = rotulos.length;
  const [sel, setSel] = useState(n - 1);
  const W = 320, H = 190, esq = 52, dir = 14, topo = 12, base = 26;
  const todos = series.flatMap((s) => s.valores.map(Number));
  const tk = ticks(Math.max(...todos, 1));
  const yMax = tk[tk.length - 1];
  const x = (i) => esq + (n === 1 ? 0 : (i * (W - esq - dir)) / (n - 1));
  const y = (v) => topo + (1 - v / yMax) * (H - topo - base);
  const varias = series.length > 1;
  const cor = (si) => (varias ? CORES_SERIES[si] : COR_UNICA);
  const passoRot = n > 8 ? 2 : 1;
  const tocar = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    setSel(Math.max(0, Math.min(n - 1, Math.round(((px - esq) / (W - esq - dir)) * (n - 1)))));
  };
  return (
    <Moldura titulo={titulo} sub={sub} legenda={varias ? series.map((s, i) => [s.rotulo, cor(i)]) : null}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: "auto", touchAction: "pan-y" }} onPointerDown={tocar} onPointerMove={(e) => e.buttons && tocar(e)}
           role="img" aria-label={`${titulo || "Gráfico de linha"}. ${series.map((s) => `${varias ? s.rotulo + ": " : ""}${rotulos.map((r, i) => `${r} ${fmtCurto(s.valores[i], unidade)}`).join(", ")}`).join(". ")}`}>
        {tk.map((t) => (
          <g key={t}>
            <line x1={esq} x2={W - dir} y1={y(t)} y2={y(t)} stroke={S.linha} strokeWidth="1" />
            <text x={esq - 6} y={y(t) + 4} textAnchor="end" fontSize="13" fill={S.texto2} fontFamily={F.ui}>{fmtCurto(t, unidade).replace("R$ ", "")}</text>
          </g>
        ))}
        {rotulos.map((r, i) => i % passoRot === 0 || i === n - 1 ? (
          <text key={r + i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="13" fill={S.texto2} fontFamily={F.ui}>{r}</text>
        ) : null)}
        <line x1={x(sel)} x2={x(sel)} y1={topo} y2={H - base} stroke={S.texto2} strokeWidth="1" opacity="0.5" />
        {series.map((s, si) => {
          const pts = s.valores.map((v, i) => [x(i), y(Number(v) || 0)]);
          const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
          return (
            <g key={si}>
              {!varias && <path d={`${d} L${pts[n - 1][0]},${H - base} L${pts[0][0]},${H - base} Z`} fill={cor(si)} opacity="0.1" />}
              <path d={d} fill="none" stroke={cor(si)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx={pts[sel][0]} cy={pts[sel][1]} r="5" fill={cor(si)} stroke={S.cartao} strokeWidth="2" />
            </g>
          );
        })}
      </svg>
      <Dica><strong>{rotulos[sel]}</strong>: {series.map((s) => `${varias ? s.rotulo + " " : ""}${fmt(s.valores[sel], unidade)}`).join(" · ")}</Dica>
    </Moldura>
  );
}

/* Colunas empilhadas ao longo dos meses (ex.: passivo no fim de cada mês, por prognóstico).
   Toque numa coluna mostra o mês; o último mês começa selecionado. */
function GraficoColunas({ titulo, sub, rotulos, partes, valores, unidade, semMoldura }) {
  const n = rotulos.length;
  const [sel, setSel] = useState(n - 1);
  const totais = valores.map((v) => v.reduce((s, x) => s + x, 0));
  const W = 320, H = 200, esq = 50, dir = 6, topo = 10, base = 26;
  const tk = ticks(Math.max(...totais, 1));
  const yMax = tk[tk.length - 1];
  const larg = (W - esq - dir) / n, bw = Math.min(20, larg * 0.62);
  const y = (v) => topo + (1 - v / yMax) * (H - topo - base);
  const passoRot = n > 8 ? 2 : 1;
  const conteudo = (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: "auto" }} role="img"
           aria-label={`${titulo || "Colunas por mês"}. ${rotulos.map((r, i) => `${r} ${fmtCurto(totais[i], unidade)}`).join(", ")}`}>
        {tk.map((t) => (
          <g key={t}>
            <line x1={esq} x2={W - dir} y1={y(t)} y2={y(t)} stroke={S.linha} strokeWidth="1" />
            <text x={esq - 6} y={y(t) + 4} textAnchor="end" fontSize="12.5" fill={S.texto2} fontFamily={F.ui}>{fmtCurto(t, unidade).replace("R$ ", "")}</text>
          </g>
        ))}
        {rotulos.map((r, i) => {
          const cx = esq + larg * i + larg / 2;
          let acc = 0;
          return (
            <g key={r + i} onClick={() => setSel(i)} style={{ cursor: "pointer" }} opacity={sel === i ? 1 : 0.55}>
              <rect x={cx - larg / 2} y={topo} width={larg} height={H - topo - base} fill="transparent" />
              {partes.map((p, pi) => {
                const v = valores[i][pi]; if (!v) return null;
                const y0 = y(acc), y1 = y(acc + v); acc += v;
                return <rect key={p} x={cx - bw / 2} y={y1} width={bw} height={Math.max(0, y0 - y1 - 1.5)} fill={corDaParte(p, pi)} rx="2" />;
              })}
              {(i % passoRot === 0 || i === n - 1 || i === sel) && (
                <text x={cx} y={H - 7} textAnchor="middle" fontSize="12.5" fill={sel === i ? S.ink : S.texto2} fontWeight={sel === i ? 600 : 400} fontFamily={F.ui}>{r}</text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-1.5 mt-2" role="group" aria-label="Escolher o mês">
        {rotulos.map((r, i) => (
          <button key={r + i} onClick={() => setSel(i)} aria-pressed={sel === i} className="rounded-full"
                  style={{ minWidth: 44, height: 36, padding: "0 8px", fontFamily: F.ui, fontSize: 14, fontWeight: sel === i ? 600 : 500, background: sel === i ? S.marca : S.papel, color: sel === i ? "#FFFFFF" : S.ink }}>{r}</button>
        ))}
      </div>
      <Dica><strong>{rotulos[sel]}: {fmt(totais[sel], unidade)}</strong>{partes.map((p, i) => ` · ${p} ${fmtCurto(valores[sel][i], unidade)}`).join("")}</Dica>
    </>
  );
  if (semMoldura) return conteudo;
  return <Moldura titulo={titulo} sub={sub} legenda={partes.map((p, i) => [p, corDaParte(p, i)])}>{conteudo}</Moldura>;
}

/* Números-chave com variação. A seta diz a direção; a cor diz se é bom ou ruim para o escritório. */
function Indicadores({ itens }) {
  return (
    <div className="grid grid-cols-2 gap-3" style={{ margin: "16px 0" }}>
      {itens.map((it, i) => {
        const temDelta = it.anterior !== undefined && it.anterior !== null;
        const dif = temDelta ? it.valor - it.anterior : 0;
        const pct = temDelta && it.anterior ? Math.round((dif / it.anterior) * 100) : null;
        const bom = it.bomQuando === "desce" ? dif < 0 : dif > 0;
        const corDelta = dif === 0 ? S.texto2 : bom ? S.resolvido : S.risco;
        return (
          <div key={i} className={itens.length % 2 && i === 0 ? "col-span-2" : ""} style={{ ...CARD, padding: 16 }}>
            <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, lineHeight: 1.3 }}>{it.rotulo}</p>
            <p style={{ fontFamily: F.ui, fontSize: 24, fontWeight: 600, color: S.ink, letterSpacing: "-0.02em", marginTop: 4 }}>{fmt(it.valor, it.unidade)}</p>
            {temDelta && (
              <p style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 600, color: corDelta, marginTop: 4 }}>
                {dif === 0 ? "= igual" : `${dif > 0 ? "▲" : "▼"} ${pct !== null ? `${Math.abs(pct)}%` : fmtCurto(Math.abs(dif), it.unidade)}`}
                <span style={{ fontWeight: 400, color: S.texto2 }}> {it.comparacao || "vs. período anterior"}</span>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* Lista de processos (tabela no celular vira lista) */
function TabelaProcessos({ titulo, linhas }) {
  return (
    <Moldura titulo={titulo}>
      <div style={{ margin: "-4px -18px -18px" }}>
        {linhas.map((p, i) => (
          <div key={p.numero} style={{ padding: "12px 18px", borderTop: `1px solid ${S.linha}` }}>
            <div className="flex items-baseline justify-between gap-2">
              <span style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.ink }}>{p.cliente}</span>
              <span style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, whiteSpace: "nowrap" }}>{p.dias_parado} dias parado</span>
            </div>
            <p style={{ fontFamily: F.ui, fontSize: 15, color: S.ink, marginTop: 2, lineHeight: 1.35 }}>{p.descricao}</p>
            <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 2 }}>
              {p.area} · {p.valor_em_discussao ? fmtBRL(p.valor_em_discussao) : "sem valor"} · prognóstico {String(p.prognostico).toLowerCase()}
              {p.valor_bloqueado_ativo ? ` · ${fmtBRLCurto(p.valor_bloqueado_ativo)} bloqueado` : ""}
            </p>
          </div>
        ))}
      </div>
    </Moldura>
  );
}

export { CORES_SERIES, GraficoBarras, GraficoEmpilhado, GraficoLinha, Indicadores, TabelaProcessos, fmt, fmtCurto, GraficoColunas, ticks };
