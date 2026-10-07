import React from "react";
import { SparkleIcon } from "../componentes/icones";
import { fmtBRL, fmtBRLCurto } from "../dados/formato";
import { CARD, F, S, T } from "../estilo/tokens";
import { OuvirBtn } from "../preferencias";

/* ------------------------- Render do relatório --------------------- */
const fmtValor = (v, unidade) => (unidade === "BRL" ? fmtBRL(Number(v) || 0) : Number(v).toLocaleString("pt-BR"));

const fmtValorCurto = (v, unidade) => (unidade === "BRL" ? fmtBRLCurto(Number(v) || 0) : Number(v).toLocaleString("pt-BR"));

function BlocoLinha({ b }) {
  const vals = (b.valores || []).map(Number);
  if (vals.length < 2) return null;
  const W = 300, H = 100, padX = 10, top = 14, bot = 12;
  const max = Math.max(...vals, 1);
  const pts = vals.map((v, i) => [padX + (i * (W - padX * 2)) / (vals.length - 1), top + (1 - v / max) * (H - top - bot)]);
  const poly = pts.map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" ");
  const area = `M${pts[0][0]},${H - bot} ` + pts.map((p) => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + ` L${pts[pts.length - 1][0]},${H - bot} Z`;
  const iMax = vals.indexOf(Math.max(...vals));
  return (
    <div className="p-5 rounded-2xl" style={CARD}>
      <p className="text-[15px] font-medium mb-1">{b.titulo}</p>
      <p className="text-[14px] mb-2" style={{ color: T.muted }}>Pico: {fmtValor(vals[iMax], b.unidade)} em {b.rotulos?.[iMax]}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24" role="img" aria-label={`${b.titulo}. Pico de ${fmtValor(vals[iMax], b.unidade)} em ${b.rotulos?.[iMax]}.`}>
        <line x1={padX} x2={W - padX} y1={H - bot} y2={H - bot} stroke={T.hairline} strokeWidth="1" />
        <path d={area} fill={T.brass} opacity="0.1" />
        <polyline points={poly} fill="none" stroke={T.brass} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={pts[iMax][0]} cy={pts[iMax][1]} r="3.5" fill={T.brass} />
      </svg>
      <div className="flex justify-between mt-1 text-[12px]" style={{ color: T.muted }}>
        {(b.rotulos || []).map((m, i) => <span key={i}>{m}</span>)}
      </div>
    </div>
  );
}

function BlocoBarras({ b }) {
  const itens = (b.itens || []).slice(0, 8);
  const max = Math.max(...itens.map((i) => Number(i.valor) || 0), 1);
  return (
    <div className="p-5 rounded-2xl" style={CARD}>
      <p className="text-[15px] font-medium mb-4">{b.titulo}</p>
      <div className="flex flex-col gap-3.5">
        {itens.map((it, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[14px] w-[96px] shrink-0 leading-tight">{it.rotulo}</span>
            <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(27,36,48,0.08)" }}>
              <div className="h-2 rounded-full" style={{ width: `${Math.max(2, ((Number(it.valor) || 0) / max) * 100)}%`, background: i === 0 ? T.brass : T.slate }} />
            </div>
            <span className="text-[14px] w-[84px] text-right whitespace-nowrap" style={{ color: S.ink, fontVariantNumeric: "tabular-nums" }}>{fmtValorCurto(it.valor, b.unidade)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BlocoTabela({ b }) {
  return (
    <div className="rounded-2xl" style={CARD}>
      <p className="text-[15px] font-medium px-5 pt-5 pb-3">{b.titulo}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-[14px]" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>{(b.colunas || []).map((c, i) => <th key={i} className="text-left font-medium px-5 py-2" style={{ color: T.muted, borderTop: `1px solid ${T.hairline}` }}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {(b.linhas || []).slice(0, 25).map((l, i) => (
              <tr key={i}>{l.map((c, j) => <td key={j} className="px-5 py-2.5 align-top" style={{ borderTop: `1px solid ${T.hairline}`, fontVariantNumeric: "tabular-nums" }}>{String(c)}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RelatorioView({ spec }) {
  return (
    <>
      <h1 className="font-serif-legal text-[24px] leading-tight mt-7">{spec.titulo}</h1>
      <div className="flex flex-col gap-5 mt-5">
        {spec.blocos.map((b, i) => {
          if (b.tipo === "destaque") return (
            <div key={i} style={{ background: S.ink, borderRadius: 20, padding: 20, color: "#FFFFFF" }}>
              <p style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: "#C9CED3" }}>{b.rotulo}</p>
              <p style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 40, fontWeight: 600, lineHeight: 1, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>{fmtValor(b.valor, b.unidade)}</p>
            </div>
          );
          if (b.tipo === "linha") return <BlocoLinha key={i} b={b} />;
          if (b.tipo === "barras") return <BlocoBarras key={i} b={b} />;
          if (b.tipo === "tabela") return <BlocoTabela key={i} b={b} />;
          if (b.tipo === "texto") return (
            <div key={i} style={{ background: S.iaFundo, borderRadius: 24, padding: 18 }}>
              <p className="flex items-center gap-1.5" style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 700, color: S.ia }}>
                <SparkleIcon size={15} color={S.ia} strokeWidth={2} /> Conclusão da IA
              </p>
              <p style={{ fontFamily: F.ui, fontSize: 17, color: S.ink, lineHeight: 1.45, marginTop: 6 }}>{b.texto}</p>
              <OuvirBtn texto={b.texto} />
            </div>
          );
          return null;
        })}
      </div>
      <p className="text-[13px] mt-4" style={{ color: T.muted }}>Fonte: {(spec.fontes || ["Base do escritório"]).join(" e ")}. Dados de exemplo.</p>
    </>
  );
}

export { RelatorioView, fmtValor };
