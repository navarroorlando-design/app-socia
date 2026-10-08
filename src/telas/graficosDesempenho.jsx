import React, { useState } from "react";
import { fmtBRL, fmtBRLCurto } from "../dados/formato";
import { DADOS, F, S } from "../estilo/tokens";
import { ticks } from "../ia/Graficos";

/* ------------------------------------------------------------------ */
/* Gráficos da tela Desempenho (redesenho v3, seção B.7), desenhados à   */
/* mão em SVG, por docs/redesign-v3/ref/especificacao-graficos.md.      */
/* Mesma convenção de interação das outras telas: toque numa coluna      */
/* seleciona o mês e o resumo aparece como texto abaixo do gráfico       */
/* (em vez do toast do protótipo), para ficar igual às demais telas e    */
/* não depender de um componente de toast à parte.                      */
/* ------------------------------------------------------------------ */

const fmtCurtoSemRS = (v) => fmtBRLCurto(v).replace("R$ ", "");
const sinal = (v) => (v > 0 ? `+${v}` : v < 0 ? `−${Math.abs(v)}` : "0");

/* Sparkline dos 4 cards de indicador (seção 1): sem eixos, decorativa. */
function SparkDesempenho({ tipo = "linha", valores, cor = S.ink }) {
  const W = 72, H = 26, pad = 3;
  const n = valores.length;
  const vals = valores.filter((v) => v != null);
  if (!vals.length) {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
        <line x1={pad} y1={H / 2} x2={W - pad} y2={H / 2} stroke={cor} strokeWidth="1.5" strokeDasharray="2 2" opacity=".5" />
      </svg>
    );
  }
  const min = Math.min(...vals), max = Math.max(...vals);
  const x = (i) => pad + (n === 1 ? 0 : (i * (W - pad * 2)) / (n - 1));
  const y = (v) => (max === min ? H / 2 : pad + (1 - (v - min) / (max - min)) * (H - pad * 2));
  if (tipo === "barras") {
    const bw = Math.max(2, ((W - pad * 2) / n) * 0.6);
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
        <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke={cor} strokeWidth="1" opacity=".25" />
        {valores.map((v, i) => (v == null || !v ? null : (
          <rect key={i} x={x(i) - bw / 2} y={y(v)} width={bw} height={Math.max(1, H - pad - y(v))} fill={cor} opacity=".8" rx="1" />
        )))}
      </svg>
    );
  }
  const pts = valores.map((v, i) => (v == null ? null : [x(i), y(v)])).filter(Boolean);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const ultimo = pts[pts.length - 1];
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
      <path d={d} fill="none" stroke={cor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {ultimo && <circle cx={ultimo[0]} cy={ultimo[1]} r="2.2" fill={cor} />}
    </svg>
  );
}

const Legenda = ({ itens }) => (
  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
    {itens.map(([rot, cor, traco]) => (
      <span key={rot} className="inline-flex items-center gap-1.5" style={{ fontFamily: F.ui, fontSize: 14, color: S.ink }}>
        {traco ? <span style={{ width: 12, height: 2, borderRadius: 1, background: cor }} /> : <span style={{ width: 10, height: 10, borderRadius: 3, background: cor }} />}
        {rot}
      </span>
    ))}
  </div>
);

const Leitura = ({ children }) => (
  <p role="status" style={{ fontFamily: F.ui, fontSize: 15, color: S.ink, background: S.papel, borderRadius: 12, padding: "8px 12px", marginTop: 10 }}>{children}</p>
);

const EixoMeses = ({ meses, x, passo = 1 }) => (
  <>
    {meses.map((m, i) => (i % passo === 0 || i === meses.length - 1) && (
      <text key={m.mes} x={x(i)} y={145} textAnchor="middle" fontSize="9.5" fill={S.texto2} fontFamily={F.ui}>{m.rotulo}</text>
    ))}
    <text x={x(0)} y={157} textAnchor="middle" fontSize="8.5" fill={DADOS.rotuloAno} fontFamily={F.ui}>2026</text>
  </>
);

/* Seção 2: índice de êxito acumulado, linha de 0 a 100%. */
function GraficoExito({ meses }) {
  const [sel, setSel] = useState(meses.length - 1);
  const W = 320, H = 172, x0 = 32, x1 = 306, topo = 22, base = 132;
  const n = meses.length;
  const x = (i) => x0 + (n === 1 ? 0 : (i * (x1 - x0)) / (n - 1));
  const y = (v) => topo + (1 - v / 100) * (base - topo);
  const comValor = meses.map((m, i) => (m.indiceAcumulado != null ? i : null)).filter((i) => i !== null);
  const passo = (x1 - x0) / Math.max(1, n - 1) >= 24 ? 1 : Math.ceil(n / 4);
  if (!comValor.length) {
    return (
      <div className="grafico-desenho">
        <Legenda itens={[["Índice acumulado", S.ink, true], ["Mês com encerramento", S.ink]]} />
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full mt-3" style={{ height: "auto" }} role="img" aria-label="Índice de êxito. Nenhum processo encerrado no período.">
          {[0, 50, 100].map((t) => (
            <g key={t}><line x1={x0} x2={x1} y1={y(t)} y2={y(t)} stroke={DADOS.grade} strokeWidth="1" /><text x={x0 - 6} y={y(t) + 4} textAnchor="end" fontSize="9.5" fill={DADOS.eixo} fontFamily={F.ui}>{t}%</text></g>
          ))}
          <text x={(x0 + x1) / 2} y={(topo + base) / 2} textAnchor="middle" fontSize="12" fill={S.texto2} fontFamily={F.ui}>Nenhum processo encerrado no período</text>
        </svg>
      </div>
    );
  }
  const d = comValor.map((i, k) => `${k ? "L" : "M"}${x(i).toFixed(1)},${y(meses[i].indiceAcumulado).toFixed(1)}`).join(" ");
  const m = meses[sel];
  return (
    <div className="grafico-desenho">
      <Legenda itens={[["Índice acumulado", S.ink, true], ["Mês com encerramento", S.ink]]} />
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full mt-3" style={{ height: "auto", touchAction: "manipulation" }}
           role="img" aria-labelledby="g-exito-t" aria-describedby="g-exito-d">
        <title id="g-exito-t">Índice de êxito acumulado por mês</title>
        <desc id="g-exito-d">{meses.map((mm) => `${mm.rotulo}: ${mm.indiceAcumulado != null ? mm.indiceAcumulado + "%" : "sem dado"}`).join(", ")}</desc>
        {[0, 50, 100].map((t) => (
          <g key={t}><line x1={x0} x2={x1} y1={y(t)} y2={y(t)} stroke={DADOS.grade} strokeWidth="1" /><text x={x0 - 6} y={y(t) + 4} textAnchor="end" fontSize="9.5" fill={DADOS.eixo} fontFamily={F.ui}>{t}%</text></g>
        ))}
        <path d={d} fill="none" stroke={S.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        {meses.map((mm, i) => {
          if (mm.indiceAcumulado == null) return null;
          const cheio = mm.encerrados > 0;
          return (
            <g key={mm.mes} onClick={() => setSel(i)} style={{ cursor: "pointer" }}>
              <rect x={x(i) - (x1 - x0) / n / 2} y={8} width={(x1 - x0) / n} height={base - 8} fill={i === sel ? "rgba(0,0,0,.035)" : "transparent"} />
              <circle cx={x(i)} cy={y(mm.indiceAcumulado)} r={cheio ? 3 : 2} fill={cheio ? S.ink : "#FFFFFF"} stroke={S.ink} strokeWidth={cheio ? 0 : 1.3} />
              {(n <= 7 || i === 0 || i === n - 1 || i === sel) && (
                <text x={x(i)} y={y(mm.indiceAcumulado) - 7} textAnchor="middle" fontSize="9" fontWeight="600" fill={S.ink} fontFamily={F.ui}>{mm.indiceAcumulado}%</text>
              )}
            </g>
          );
        })}
        <EixoMeses meses={meses} x={x} passo={passo} />
      </svg>
      <Leitura>
        <strong>{m.rotulo}/2026</strong>: {m.encerrados} encerrado{m.encerrados === 1 ? "" : "s"} no mês ({m.favoraveis} {m.favoraveis === 1 ? "favorável" : "favoráveis"}) · acumulado {m.indiceAcumulado}%
      </Leitura>
    </div>
  );
}

/* Seção 3: novos x encerrados (barras pareadas) + carteira (linha). */
function GraficoNovosEncerrados({ meses, carteiraInicial }) {
  const [sel, setSel] = useState(meses.length - 1);
  const W = 320, H = 172, x0 = 24, x1 = 294;
  const baseBarras = 132, topoBarras = 70, baseLinha = 50, topoLinha = 16;
  const n = meses.length;
  const gw = (x1 - x0) / n;
  const cx = (i) => x0 + gw * i + gw / 2;
  const maxBarra = Math.max(2, ...meses.flatMap((m) => [m.novos, m.encerrados]));
  const yB = (v) => baseBarras - (v / maxBarra) * (baseBarras - topoBarras);
  const serieCarteira = [carteiraInicial, ...meses.map((m) => m.carteira)];
  const minC = Math.min(...serieCarteira), maxC = Math.max(...serieCarteira);
  const yL = (v) => (maxC === minC ? (topoLinha + baseLinha) / 2 : baseLinha - ((v - minC) / (maxC - minC)) * (baseLinha - topoLinha));
  const xL = (i) => (i === 0 ? x0 : cx(i - 1));
  const bw = Math.min(9, gw * 0.34);
  const passo = gw >= 24 ? 1 : Math.ceil(n / 5);
  const m = meses[sel];
  const carteiraAntes = sel === 0 ? carteiraInicial : meses[sel - 1].carteira;
  return (
    <div className="grafico-desenho">
      <Legenda itens={[["Novos", DADOS.novos], ["Encerrados", DADOS.enc], ["Carteira ativa", S.ink, true]]} />
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full mt-3" style={{ height: "auto", touchAction: "manipulation" }}
           role="img" aria-labelledby="g-ne-t" aria-describedby="g-ne-d">
        <title id="g-ne-t">Novos e encerrados por mês, e carteira ativa</title>
        <desc id="g-ne-d">{meses.map((mm) => `${mm.rotulo}: ${mm.novos} novos, ${mm.encerrados} encerrados, carteira ${mm.carteira}`).join(", ")}</desc>
        {meses.map((mm, i) => (
          <g key={mm.mes} onClick={() => setSel(i)} style={{ cursor: "pointer" }} opacity={sel === i ? 1 : 0.85}>
            <rect x={cx(i) - gw / 2} y={8} width={gw} height={baseBarras - 8} fill={i === sel ? "rgba(0,0,0,.035)" : "transparent"} />
            {mm.novos > 0 && <rect x={cx(i) - bw - 0.75} y={yB(mm.novos)} width={bw} height={baseBarras - yB(mm.novos)} fill={DADOS.novos} rx="2" />}
            {mm.encerrados > 0 && <rect x={cx(i) + 0.75} y={yB(mm.encerrados)} width={bw} height={baseBarras - yB(mm.encerrados)} fill={DADOS.enc} rx="2" />}
          </g>
        ))}
        <path d={`M${xL(0)},${yL(carteiraInicial) + 0} ${meses.map((mm, i) => `L${xL(i + 1)},${yL(mm.carteira)}`).join(" ")}`} fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinejoin="round" />
        <path d={`M${xL(0)},${yL(carteiraInicial)} ${meses.map((mm, i) => `L${xL(i + 1)},${yL(mm.carteira)}`).join(" ")}`} fill="none" stroke={S.ink} strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx={xL(0)} cy={yL(carteiraInicial)} r="2.8" fill={S.ink} />
        <text x={xL(0)} y={yL(carteiraInicial) - 7} textAnchor="start" fontSize="10" fontWeight="600" fill={S.ink} fontFamily={F.ui}>{carteiraInicial}</text>
        <circle cx={xL(n)} cy={yL(meses[n - 1].carteira)} r="2.8" fill={S.ink} />
        <text x={xL(n)} y={yL(meses[n - 1].carteira) - 7} textAnchor="end" fontSize="10" fontWeight="600" fill={S.ink} fontFamily={F.ui}>{meses[n - 1].carteira}</text>
        <EixoMeses meses={meses} x={cx} passo={passo} />
      </svg>
      <Leitura><strong>{m.rotulo}/2026</strong>: {m.novos} novo{m.novos === 1 ? "" : "s"} · {m.encerrados} encerrado{m.encerrados === 1 ? "" : "s"} · carteira {carteiraAntes} {"→"} {m.carteira}</Leitura>
    </div>
  );
}

/* Seção 4: bloqueios levantados, barras de valor com a quantidade acima. */
function GraficoLevantados({ meses }) {
  const [sel, setSel] = useState(meses.length - 1);
  const W = 320, H = 172, x0 = 42, x1 = 310, topo = 22, base = 132;
  const n = meses.length;
  const gw = (x1 - x0) / n;
  const cx = (i) => x0 + gw * i + gw / 2;
  const tk = ticks(Math.max(...meses.map((m) => m.levantadoValor), 1));
  const yMax = tk[tk.length - 1];
  const y = (v) => base - (v / yMax) * (base - topo);
  const bw = Math.min(16, gw * 0.5);
  const passo = gw >= 24 ? 1 : Math.ceil(n / 5);
  const algum = meses.some((m) => m.levantadoQtd > 0);
  const m = meses[sel];
  return (
    <div className="grafico-desenho">
      <Legenda itens={[["R$ liberado no mês", DADOS.fav]]} />
      <p style={{ fontFamily: F.ui, fontSize: 13, color: S.texto2, marginTop: 2 }}>O número acima da barra é a quantidade de levantamentos.</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full mt-2" style={{ height: "auto", touchAction: "manipulation" }}
           role="img" aria-labelledby="g-lev-t" aria-describedby="g-lev-d">
        <title id="g-lev-t">Valor liberado por mês</title>
        <desc id="g-lev-d">{meses.map((mm) => `${mm.rotulo}: ${mm.levantadoQtd} levantamentos, ${fmtBRL(mm.levantadoValor)}`).join(", ")}</desc>
        {tk.map((t) => (
          <g key={t}><line x1={x0} x2={x1} y1={y(t)} y2={y(t)} stroke={DADOS.grade} strokeWidth="1" /><text x={x0 - 6} y={y(t) + 4} textAnchor="end" fontSize="9.5" fill={DADOS.eixo} fontFamily={F.ui}>{t === 0 ? "0" : fmtCurtoSemRS(t)}</text></g>
        ))}
        {!algum && <text x={(x0 + x1) / 2} y={(topo + base) / 2} textAnchor="middle" fontSize="12" fill={S.texto2} fontFamily={F.ui}>Nenhum levantamento no período</text>}
        {meses.map((mm, i) => (
          <g key={mm.mes} onClick={() => setSel(i)} style={{ cursor: "pointer" }} opacity={sel === i ? 1 : 0.85}>
            <rect x={cx(i) - gw / 2} y={8} width={gw} height={base - 8} fill={i === sel ? "rgba(0,0,0,.035)" : "transparent"} />
            {mm.levantadoQtd > 0 && (
              <>
                <rect x={cx(i) - bw / 2} y={y(mm.levantadoValor)} width={bw} height={base - y(mm.levantadoValor)} fill={DADOS.fav} rx="2.5" />
                <text x={cx(i)} y={y(mm.levantadoValor) - 4} textAnchor="middle" fontSize="9" fontWeight="600" fill={S.ink} fontFamily={F.ui}>{mm.levantadoQtd}</text>
              </>
            )}
          </g>
        ))}
        <EixoMeses meses={meses} x={cx} passo={passo} />
      </svg>
      <Leitura><strong>{m.rotulo}/2026</strong>: {m.levantadoQtd} levantamento{m.levantadoQtd === 1 ? "" : "s"} · {fmtBRL(m.levantadoValor)}</Leitura>
    </div>
  );
}

/* Seção 5: valor revertido, barras empilhadas (revertido embaixo, mantido em cima). */
function GraficoRevertido({ meses }) {
  const [sel, setSel] = useState(meses.length - 1);
  const W = 320, H = 172, x0 = 42, x1 = 310, topo = 18, base = 132;
  const n = meses.length;
  const gw = (x1 - x0) / n;
  const cx = (i) => x0 + gw * i + gw / 2;
  const tk = ticks(Math.max(...meses.map((m) => m.emDiscussao), 1));
  const yMax = tk[tk.length - 1];
  const y = (v) => base - (v / yMax) * (base - topo);
  const bw = Math.min(16, gw * 0.5);
  const passo = gw >= 24 ? 1 : Math.ceil(n / 5);
  const algum = meses.some((m) => m.emDiscussao > 0);
  const m = meses[sel];
  const pct = m.emDiscussao ? Math.round((m.revertido / m.emDiscussao) * 100) : 0;
  return (
    <div className="grafico-desenho">
      <Legenda itens={[["Revertido", DADOS.fav], ["Mantido (condenação ou acordo)", DADOS.desf]]} />
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full mt-3" style={{ height: "auto", touchAction: "manipulation" }}
           role="img" aria-labelledby="g-rev-t" aria-describedby="g-rev-d">
        <title id="g-rev-t">Valor revertido e mantido por mês</title>
        <desc id="g-rev-d">{meses.map((mm) => `${mm.rotulo}: ${fmtBRL(mm.emDiscussao)} em discussão, ${fmtBRL(mm.revertido)} revertido, ${fmtBRL(mm.mantido)} mantido`).join(", ")}</desc>
        {tk.map((t) => (
          <g key={t}><line x1={x0} x2={x1} y1={y(t)} y2={y(t)} stroke={DADOS.grade} strokeWidth="1" /><text x={x0 - 6} y={y(t) + 4} textAnchor="end" fontSize="9.5" fill={DADOS.eixo} fontFamily={F.ui}>{t === 0 ? "0" : fmtCurtoSemRS(t)}</text></g>
        ))}
        {!algum && <text x={(x0 + x1) / 2} y={(topo + base) / 2} textAnchor="middle" fontSize="12" fill={S.texto2} fontFamily={F.ui}>Nenhum processo encerrado no período</text>}
        {meses.map((mm, i) => {
          if (!mm.emDiscussao) return (
            <rect key={mm.mes} onClick={() => setSel(i)} style={{ cursor: "pointer" }} x={cx(i) - gw / 2} y={8} width={gw} height={base - 8} fill={i === sel ? "rgba(0,0,0,.035)" : "transparent"} />
          );
          const yRev = y(mm.revertido), yTotal = y(mm.emDiscussao);
          return (
            <g key={mm.mes} onClick={() => setSel(i)} style={{ cursor: "pointer" }} opacity={sel === i ? 1 : 0.85}>
              <rect x={cx(i) - gw / 2} y={8} width={gw} height={base - 8} fill={i === sel ? "rgba(0,0,0,.035)" : "transparent"} />
              {mm.revertido > 0 && <rect x={cx(i) - bw / 2} y={yRev} width={bw} height={base - yRev} fill={DADOS.fav} rx="2" />}
              {mm.mantido > 0 && <rect x={cx(i) - bw / 2} y={yTotal} width={bw} height={Math.max(0, yRev - yTotal - 1)} fill={DADOS.desf} rx="2" />}
            </g>
          );
        })}
        <EixoMeses meses={meses} x={cx} passo={passo} />
      </svg>
      <Leitura>
        <strong>{m.rotulo}/2026</strong>: {fmtBRL(m.emDiscussao)} em discussão · {fmtBRL(m.revertido)} revertido ({pct}%) · {fmtBRL(m.mantido)} mantido
      </Leitura>
    </div>
  );
}

export { SparkDesempenho, GraficoExito, GraficoNovosEncerrados, GraficoLevantados, GraficoRevertido, sinal, fmtCurtoSemRS };
