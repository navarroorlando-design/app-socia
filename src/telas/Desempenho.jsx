import React, { useState } from "react";
import { Faixa, SecLabel, SeletorSegmentado } from "../componentes/ui";
import { CLIENTE_NOME, ORGS } from "../dados/base";
import { fmtBRL, fmtBRLCurto } from "../dados/formato";
import { serieMensal, resumoNovosEncerrados, resumoLevantamentos, resumoRevertido, porRecorte } from "../dados/desempenho";
import { CARD, F, S } from "../estilo/tokens";
import { MarcaOrg } from "../componentes/MarcaOrg";
import { Dica } from "../ajuda/Dica";
import { SparkDesempenho, GraficoExito, GraficoNovosEncerrados, GraficoLevantados, GraficoRevertido, sinal } from "./graficosDesempenho";

/* ------------------------------------------------------------------ */
/* Desempenho (redesenho v3, seção B.7): 4 indicadores com sparkline,    */
/* cada um abrindo o gráfico mensal correspondente logo abaixo           */
/* (especificacao-graficos.md). A base de exemplo só modela o ano        */
/* calendário de 2026 (entradaMes/saiuMes em src/dados/base.js) — não há  */
/* dado real para 2025 nem para uma janela rolante de 12 meses, então     */
/* esses dois períodos mostram um aviso em vez de números inventados.    */
/* TODO: calcular 2025 e "últimos 12 meses" quando houver histórico real. */
/* ------------------------------------------------------------------ */
const PERIODOS = [{ id: "2026", label: "2026" }, { id: "2025", label: "2025" }, { id: "12m", label: "Últimos 12 meses" }];
const fmtDDMM = (iso) => { const [, m, d] = iso.split("-"); return `${d}/${m}`; };

function Desempenho({ onBack, onOpenBloqueios }) {
  const [periodo, setPeriodo] = useState("2026");
  const [sel, setSel] = useState("exito");
  const [recorte, setRecorte] = useState("cliente");

  const serie = serieMensal(periodo);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
      <Faixa bleed={32} onBack={onBack} backLabel="Início" eyebrow="Indicadores do escritório" titulo="Desempenho"
             sub={serie ? `2026 até ${fmtDDMM(serie.periodo.ate)}` : "Período sem dados de exemplo"} />
      <Dica id="desempenho" style={{ marginTop: 0 }} />

      <div className="mt-4">
        <SeletorSegmentado itens={PERIODOS} ativo={periodo} onChange={setPeriodo} label="Período" />
      </div>

      {!serie ? (
        <div style={{ ...CARD, padding: 18, marginTop: 16 }}>
          <p style={{ fontFamily: F.ui, fontSize: 16, color: S.ink, lineHeight: 1.5 }}>
            Ainda não há dados de exemplo para {periodo === "2025" ? "2025" : "os últimos 12 meses"}.
          </p>
          <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, lineHeight: 1.5, marginTop: 6 }}>
            A base de exemplo só modela o ano de 2026. Em produção, este período viria do histórico real
            do Legal One e do Log de Bloqueios.
          </p>
        </div>
      ) : (
        <ConteudoPeriodo serie={serie} sel={sel} setSel={setSel} recorte={recorte} setRecorte={setRecorte} onOpenBloqueios={onOpenBloqueios} />
      )}
    </div>
  );
}

function ConteudoPeriodo({ serie, sel, setSel, recorte, setRecorte, onOpenBloqueios }) {
  const { meses, carteiraInicial, carteiraHoje } = serie;
  const ultimo = meses[meses.length - 1];
  const totalEncerrados = meses.reduce((s, m) => s + m.encerrados, 0);
  const totalFavoraveis = meses.reduce((s, m) => s + m.favoraveis, 0);
  const resumoNE = resumoNovosEncerrados(serie);
  const resumoLev = resumoLevantamentos();
  const resumoRev = resumoRevertido(serie);

  const cards = [
    {
      id: "exito", nome: "Índice de êxito", valor: `${ultimo.indiceAcumulado ?? 0}%`,
      spark: { tipo: "linha", valores: meses.map((m) => m.indiceAcumulado) },
      detalhe: `${totalFavoraveis} de ${totalEncerrados} encerrados favoráveis ou com acordo`,
    },
    {
      id: "novos", nome: "Novos x encerrados", valor: sinal(resumoNE.saldo),
      spark: { tipo: "linha", valores: meses.map((m) => m.carteira) },
      detalhe: `${resumoNE.novos} novos · ${resumoNE.encerrados} encerrados / carteira ${carteiraInicial} → ${carteiraHoje}`,
    },
    {
      id: "levantados", nome: "Bloqueios levantados", valor: `${resumoLev.qtd}`,
      spark: { tipo: "barras", valores: meses.map((m) => m.levantadoValor) },
      detalhe: `${fmtBRL(resumoLev.valor)} · média de ${resumoLev.diasMedio} dias`,
    },
    {
      id: "revertido", nome: "Valor revertido", valor: `${resumoRev.pct}%`,
      spark: { tipo: "linha", valores: meses.map((m) => m.revertidoAcumulado) },
      detalhe: `${fmtBRL(resumoRev.revertido)} afastados de ${fmtBRL(resumoRev.emDiscussao)}`,
    },
  ];

  const RECORTES = [{ id: "cliente", label: "Cliente" }, { id: "area", label: "Área" }];
  const grupos = (sel === "novos" || sel === "revertido") ? porRecorte(recorte, CLIENTE_NOME) : null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 mt-4">
        {cards.map((c) => {
          const ativo = sel === c.id;
          return (
            <button key={c.id} onClick={() => setSel(c.id)} aria-pressed={ativo} className="text-left pressable"
                    style={{ ...CARD, background: ativo ? S.marca : S.cartao, padding: 16 }}>
              <p style={{ fontFamily: F.ui, fontSize: 13.5, color: ativo ? S.marcaTexto2 : S.texto2, lineHeight: 1.25 }}>{c.nome}</p>
              <div className="flex items-end justify-between gap-2" style={{ marginTop: 4 }}>
                <span style={{ fontFamily: F.ui, fontSize: 26, fontWeight: 600, color: ativo ? "#FFFFFF" : S.ink, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{c.valor}</span>
                <span style={{ color: ativo ? S.dourado : "#3A3833" }}><SparkDesempenho tipo={c.spark.tipo} valores={c.spark.valores} cor="currentColor" /></span>
              </div>
              <p style={{ fontFamily: F.ui, fontSize: 12.5, color: ativo ? S.marcaTexto2 : S.texto2, lineHeight: 1.3, marginTop: 6 }}>{c.detalhe}</p>
            </button>
          );
        })}
      </div>

      {sel === "exito" && (
        <div style={{ ...CARD, padding: 18, marginTop: 16 }}>
          <p style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink, lineHeight: 1.3 }}>Índice de êxito em 2026</p>
          <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 2 }}>{totalFavoraveis} de {totalEncerrados} encerrados favoráveis ou com acordo</p>
          <GraficoExito meses={meses} />
        </div>
      )}

      {sel === "novos" && (
        <div style={{ ...CARD, padding: 18, marginTop: 16 }}>
          <p style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink, lineHeight: 1.3 }}>
            Carteira foi de {carteiraInicial} para {carteiraHoje} processos ({sinal(resumoNE.saldo)})
          </p>
          <GraficoNovosEncerrados meses={meses} carteiraInicial={carteiraInicial} />
          <TotaisTres itens={[["Entraram", resumoNE.novos], ["Encerraram", resumoNE.encerrados], ["Saldo", sinal(resumoNE.saldo)]]} />
          <PorRecorte grupos={grupos} recorte={recorte} setRecorte={setRecorte} itens={RECORTES}
                       render={(g) => <span style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.ink, fontVariantNumeric: "tabular-nums" }}>{sinal(g.novos - g.encerrados)}</span>}
                       ordenarPor={(g) => g.novos - g.encerrados} rotulo="saldo" />
        </div>
      )}

      {sel === "levantados" && (
        <div style={{ ...CARD, padding: 18, marginTop: 16 }}>
          <p style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink, lineHeight: 1.3 }}>Bloqueios levantados em 2026</p>
          <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 2 }}>{resumoLev.qtd} levantamentos · {fmtBRL(resumoLev.valor)}</p>
          <GraficoLevantados meses={meses} />
          <div className="flex items-center justify-between gap-2 mt-3 pt-3" style={{ borderTop: `1px solid ${S.linha}` }}>
            <span style={{ fontFamily: F.ui, fontSize: 15, color: S.ink }}>Tempo médio até levantar</span>
            <span style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.ink }}>{resumoLev.diasMedio} dias</span>
          </div>
          {onOpenBloqueios && (
            <button onClick={onOpenBloqueios} className="w-full text-center mt-3 pressable"
                    style={{ height: 44, borderRadius: 12, fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.ink, background: S.papel }}>
              Ver na tela Bloqueios
            </button>
          )}
        </div>
      )}

      {sel === "revertido" && (
        <div style={{ ...CARD, padding: 18, marginTop: 16 }}>
          <p style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink, lineHeight: 1.3 }}>
            {fmtBRL(resumoRev.revertido)} afastados de {fmtBRL(resumoRev.emDiscussao)} em discussão nos processos encerrados
          </p>
          <GraficoRevertido meses={meses} />
          <TotaisTres itens={[["Em discussão", fmtBRLCurto(resumoRev.emDiscussao)], ["Revertido", fmtBRLCurto(resumoRev.revertido)], ["Mantido", fmtBRLCurto(resumoRev.mantido)]]} />
          <PorRecorte grupos={grupos} recorte={recorte} setRecorte={setRecorte} itens={RECORTES}
                       render={(g) => <span style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.ink, fontVariantNumeric: "tabular-nums" }}>{g.emDiscussao ? Math.round((g.revertido / g.emDiscussao) * 100) : 0}%</span>}
                       ordenarPor={(g) => (g.emDiscussao ? g.revertido / g.emDiscussao : -1)} rotulo="revertido" />
        </div>
      )}

      <p style={{ fontFamily: F.ui, fontSize: 13.5, color: S.texto2, lineHeight: 1.45, marginTop: 14 }}>
        Favorável: pedido improcedente, extinção ou desistência da parte contrária. Acordo: encerrado por acordo
        homologado. Desfavorável: pedido julgado procedente. Dados de exemplo; a comparação com 2025 e os últimos
        12 meses depende de dados reais.
      </p>
    </>
  );
}

const TotaisTres = ({ itens }) => (
  <div className="grid grid-cols-3 gap-2 mt-4 pt-3" style={{ borderTop: `1px solid ${S.linha}` }}>
    {itens.map(([rot, v]) => (
      <div key={rot}>
        <p style={{ fontFamily: F.ui, fontSize: 12.5, color: S.texto2 }}>{rot}</p>
        <p style={{ fontFamily: F.ui, fontSize: 17, fontWeight: 600, color: S.ink, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{v}</p>
      </div>
    ))}
  </div>
);

function PorRecorte({ grupos, recorte, setRecorte, itens, render, ordenarPor, rotulo }) {
  if (!grupos) return null;
  const ordenados = [...grupos].sort((a, b) => ordenarPor(b) - ordenarPor(a));
  return (
    <>
      <SecLabel acao={null}>Por {recorte === "cliente" ? "cliente" : "área"}</SecLabel>
      <SeletorSegmentado itens={itens} ativo={recorte} onChange={setRecorte} label={`Ver por ${rotulo}`} />
      <div className="flex flex-col gap-2 mt-3">
        {ordenados.map((g) => (
          <div key={g.id} className="flex items-center gap-3" style={{ padding: "10px 2px" }}>
            {recorte === "cliente" && <MarcaOrg id={g.id} iniciais={ORGS[g.id]?.initials} size={32} />}
            <span style={{ fontFamily: F.ui, fontSize: 15, color: S.ink, flex: 1, minWidth: 0 }}>{g.nome}</span>
            {render(g)}
          </div>
        ))}
        {!ordenados.length && <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2 }}>Sem movimento no período.</p>}
      </div>
    </>
  );
}

export { Desempenho };
