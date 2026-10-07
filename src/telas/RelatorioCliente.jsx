import React, { useState } from "react";
import { CheckIcon, DownloadIcon } from "../componentes/icones";
import { Faixa, SecLabel } from "../componentes/ui";
import { ORGS } from "../dados/base";
import { fmtBRL, fmtBRLCurto, fmtData, HOJE } from "../dados/formato";
import { ORDEM_PROGNOSTICO, encerradosDe, historicoPassivo, resumoContrato, resumoOrg } from "../dados/passivo";

import { GraficoColunas } from "../ia/Graficos";
import { CARD, F, S } from "../estilo/tokens";
import { salvarArquivo } from "../arquivos";

/* ------------------------------------------------------------------ */
/* Relatório de passivo para enviar à OS: prévia, conferência e PDF    */
/* Nada sai do app sem a sócia confirmar que conferiu os valores.      */
/* ------------------------------------------------------------------ */
const ESCRITORIO = "Azevedo dos Reis Advogados & Associados";
const METODO = "Passivo estimado: soma do valor em discussão nos processos ligados a cada contrato de gestão, classificada pelo prognóstico do escritório (provável, possível, remoto). Valores bloqueados são os constritos via SISBAJUD e ainda não levantados. Estimativa sem correção monetária; não constitui provisão contábil.";

function dadosDoRelatorio(orgId, orgao) {
  const r = resumoOrg(orgId);
  const contratos = orgao ? [resumoContrato(orgId, orgao)] : r.contratos;
  const soma = (k) => contratos.reduce((s, c) => s + (k === "total" ? c.passivo.total : k === "bloq" ? c.bloqueadoAtivo : k === "proc" ? c.processos.length : c.passivo[k]), 0);
  // Evolução no ano: fotografia do fim de cada mês, dos contratos do relatório
  const hist = historicoPassivo(contratos.flatMap((c) => c.processos), contratos.flatMap((c) => encerradosDe(orgId, c.orgao)));
  return { hist, cliente: ORGS[orgId].name, orgao, contratos, total: soma("total"), bloq: soma("bloq"), proc: soma("proc"), por: Object.fromEntries(ORDEM_PROGNOSTICO.map((k) => [k, soma(k)])) };
}

async function gerarPdf(d) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const M = 18, W = 210 - M * 2;
  let y = 22;
  const linha = (t, { tam = 10, negrito = false, cor = [26, 25, 22], esp = 5 } = {}) => {
    doc.setFont("helvetica", negrito ? "bold" : "normal"); doc.setFontSize(tam); doc.setTextColor(...cor);
    const partes = doc.splitTextToSize(t, W);
    doc.text(partes, M, y); y += partes.length * esp;
  };
  linha(ESCRITORIO.toUpperCase(), { tam: 9, negrito: true, cor: [87, 84, 76] });
  y += 2;
  y += 2;
  linha("Relatório de passivo por contrato de gestão", { tam: 17, negrito: true, esp: 8 });
  linha(`${d.cliente}${d.orgao ? ` · ${d.orgao}` : ""}`, { tam: 12, esp: 6 });
  linha(`Posição em ${fmtData(HOJE)}`, { tam: 10, cor: [87, 84, 76] });
  y += 4; doc.setDrawColor(230, 225, 214); doc.line(M, y, M + W, y); y += 8;

  linha("Passivo estimado total", { tam: 10, cor: [87, 84, 76] });
  y += 5;
  linha(fmtBRL(d.total), { tam: 22, negrito: true, esp: 9 });
  linha(`${d.contratos.length} contrato(s) de gestão · ${d.proc} processos · ${fmtBRL(d.bloq)} bloqueado`, { tam: 10, cor: [87, 84, 76] });
  y += 6;

  // tabela
  const cols = [["Contrato de gestão", 62], ["Provável", 27], ["Possível", 27], ["Remoto", 24], ["Total", 34]];
  const cab = () => {
    doc.setFillColor(242, 239, 233); doc.rect(M, y - 5, W, 8, "F");
    let x = M + 2; doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(26, 25, 22);
    cols.forEach(([t, w], i) => { doc.text(t, i ? x + w - 4 : x, y, { align: i ? "right" : "left" }); x += w; });
    y += 8;
  };
  cab();
  doc.setFont("helvetica", "normal");
  for (const c of d.contratos) {
    const nome = doc.splitTextToSize(c.orgao, cols[0][1] - 4);
    let x = M + 2;
    doc.setFontSize(9.5);
    doc.text(nome, x, y); x += cols[0][1];
    [c.passivo["Provável"], c.passivo["Possível"], c.passivo.Remoto, c.passivo.total].forEach((v, i) => {
      doc.setFont("helvetica", i === 3 ? "bold" : "normal");
      doc.text(fmtBRL(v), x + cols[i + 1][1] - 4, y, { align: "right" }); x += cols[i + 1][1];
    });
    doc.setFont("helvetica", "normal");
    y += Math.max(nome.length * 4.5, 5) + 1;
    doc.setFontSize(8.5); doc.setTextColor(87, 84, 76);
    doc.text(`Vigência ${c.vigencia} · ${c.processos.length} processos · ${fmtBRL(c.bloqueadoAtivo)} bloqueado`, M + 2, y); doc.setTextColor(26, 25, 22);
    y += 4; doc.setDrawColor(230, 225, 214); doc.line(M, y, M + W, y); y += 6;
  }
  // Evolução do passivo no ano: colunas empilhadas por prognóstico
  if (d.hist.length > 1) {
    if (y > 200) { doc.addPage(); y = 22; }
    const ini = d.hist[0].total, fim = d.hist[d.hist.length - 1].total, pct = ini ? Math.round(((fim - ini) / ini) * 100) : 0;
    y += 2;
    linha("Evolução do passivo em 2026", { tam: 11, negrito: true, esp: 5.5 });
    linha(`De ${fmtBRL(ini)} no fim de janeiro para ${fmtBRL(fim)} hoje (${pct > 0 ? "+" : ""}${pct}%). Valor no último dia de cada mês.`, { tam: 9, cor: [87, 84, 76], esp: 4.5 });
    y += 3;
    const CORES = { Provável: [155, 42, 28], Possível: [131, 80, 0], Remoto: [79, 86, 91] };
    const altura = 42, topo = y, max = Math.max(...d.hist.map((h) => h.total), 1);
    const larg = W / d.hist.length, bw = Math.min(9, larg * 0.6);
    doc.setDrawColor(230, 225, 214); doc.line(M, topo + altura, M + W, topo + altura);
    d.hist.forEach((h, i) => {
      const cx = M + larg * i + larg / 2;
      let acc = 0;
      for (const k of ORDEM_PROGNOSTICO) {
        const hh = (h[k] / max) * altura; if (hh <= 0) continue;
        doc.setFillColor(...CORES[k]); doc.rect(cx - bw / 2, topo + altura - acc - hh, bw, Math.max(0.2, hh - 0.4), "F"); acc += hh;
      }
      doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(87, 84, 76);
      doc.text(h.mes, cx, topo + altura + 4.5, { align: "center" });
      if (i === 0 || i === d.hist.length - 1) { doc.setTextColor(26, 25, 22); doc.text(fmtBRLCurto(h.total), cx, topo + altura - acc - 1.5, { align: "center" }); }
    });
    y = topo + altura + 10;
    let lx = M;
    ORDEM_PROGNOSTICO.forEach((k) => { doc.setFillColor(...CORES[k]); doc.rect(lx, y - 2.6, 3, 3, "F"); doc.setTextColor(26, 25, 22); doc.text(k, lx + 4.5, y); lx += 26; });
    y += 8;
  }
  y += 4;
  linha("Como ler este relatório", { tam: 10, negrito: true });
  linha(METODO, { tam: 9, cor: [87, 84, 76], esp: 4.5 });
  y += 4;
  linha("Documento de uso exclusivo do cliente. Dados de exemplo do protótipo.", { tam: 8.5, cor: [87, 84, 76] });
  return doc.output("blob");
}

function RelatorioCliente({ orgId, orgao, onBack, backLabel }) {
  const d = dadosDoRelatorio(orgId, orgao);
  const [conferiu, setConferiu] = useState(false);
  const [estado, setEstado] = useState({ fase: "pronto" });
  const nome = `Passivo ${d.cliente}${orgao ? ` - ${orgao}` : ""} ${fmtData(HOJE).replace(/\//g, "-")}.pdf`;
  const baixar = async () => {
    setEstado({ fase: "gerando" });
    try {
      const r = await salvarArquivo(nome, await gerarPdf(d));
      setEstado(r.ok ? { fase: "feito" } : { fase: "erro", msg: r.motivo });
    } catch { setEstado({ fase: "erro", msg: "Não foi possível gerar o PDF. Tente de novo." }); }
  };
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
      <Faixa bleed={32} onBack={onBack} backLabel={backLabel} titulo="Relatório para o cliente" tituloSize={30}
             sub="Confira a prévia. O PDF traz os mesmos valores, em tabela, e a evolução no ano." />

      {/* prévia do documento */}
      <div style={{ ...CARD, borderRadius: 16, padding: 20 }}>
        <p style={{ fontFamily: F.ui, fontSize: 12, fontWeight: 600, letterSpacing: ".06em", color: S.texto2, textTransform: "uppercase" }}>{ESCRITORIO}</p>
        <p style={{ fontFamily: F.ui, fontSize: 19, fontWeight: 600, color: S.ink, marginTop: 10, lineHeight: 1.25 }}>Relatório de passivo por contrato de gestão</p>
        <p style={{ fontFamily: F.ui, fontSize: 15, color: S.ink, marginTop: 4 }}>{d.cliente}{orgao ? ` · ${orgao}` : ""}</p>
        <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2 }}>Posição em {fmtData(HOJE)}</p>
        <div style={{ height: 1, background: S.linha, margin: "14px 0" }} />
        <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2 }}>Passivo estimado total</p>
        <p style={{ fontFamily: F.ui, fontSize: 26, fontWeight: 600, color: S.ink, letterSpacing: "-0.02em" }}>{fmtBRL(d.total)}</p>
        <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2 }}>{d.contratos.length} contrato(s) · {d.proc} processos · {fmtBRL(d.bloq)} bloqueado</p>
        {/* No celular, um bloco por contrato; no PDF, uma tabela com as mesmas colunas */}
        <div style={{ marginTop: 14 }}>
          {d.contratos.map((c) => (
            <div key={c.orgao} style={{ borderTop: `1px solid ${S.linha}`, padding: "12px 0" }}>
              <div className="flex items-baseline justify-between gap-3">
                <p style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.ink, lineHeight: 1.3 }}>{c.orgao}</p>
                <p style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.ink, whiteSpace: "nowrap" }}>{fmtBRL(c.passivo.total)}</p>
              </div>
              <p style={{ fontFamily: F.ui, fontSize: 13, color: S.texto2, marginTop: 2 }}>Vigência {c.vigencia} · {c.processos.length} processos · {fmtBRL(c.bloqueadoAtivo)} bloqueado</p>
              <div className="grid grid-cols-3 gap-2" style={{ marginTop: 8 }}>
                {ORDEM_PROGNOSTICO.map((k) => (
                  <div key={k} style={{ background: S.papel, borderRadius: 10, padding: "6px 8px" }}>
                    <p style={{ fontFamily: F.ui, fontSize: 13, color: S.texto2 }}>{k}</p>
                    <p style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 600, color: S.ink, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{fmtBRL(c.passivo[k])}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {d.hist.length > 1 && (
          <div style={{ borderTop: `1px solid ${S.linha}`, paddingTop: 12 }}>
            <p style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.ink }}>Evolução do passivo em 2026</p>
            <p style={{ fontFamily: F.ui, fontSize: 13, color: S.texto2, marginTop: 2 }}>De {fmtBRLCurto(d.hist[0].total)} em janeiro para {fmtBRLCurto(d.hist[d.hist.length - 1].total)} hoje</p>
            <div style={{ marginTop: 8 }}>
              <GraficoColunas semMoldura titulo="Evolução do passivo" rotulos={d.hist.map((h) => h.mes)} partes={ORDEM_PROGNOSTICO}
                              valores={d.hist.map((h) => ORDEM_PROGNOSTICO.map((k) => h[k]))} unidade="BRL" />
            </div>
          </div>
        )}
        <p style={{ fontFamily: F.ui, fontSize: 13, color: S.texto2, lineHeight: 1.5, marginTop: 14 }}>{METODO}</p>
      </div>

      <SecLabel>Antes de enviar</SecLabel>
      <label htmlFor="conferi" className="flex items-start gap-3" style={{ ...CARD, padding: 16, cursor: "pointer" }}>
        <input id="conferi" type="checkbox" checked={conferiu} onChange={(e) => setConferiu(e.target.checked)} style={{ width: 24, height: 24, marginTop: 2, accentColor: S.marca, flexShrink: 0 }} />
        <span style={{ fontFamily: F.ui, fontSize: 16, color: S.ink, lineHeight: 1.45 }}>Conferi os valores e este relatório pode ser enviado ao cliente.</span>
      </label>
      <button onClick={baixar} disabled={!conferiu || estado.fase === "gerando"} className="w-full inline-flex items-center justify-center gap-2 mt-3"
              style={{ height: 52, borderRadius: 14, fontFamily: F.ui, fontSize: 17, fontWeight: 600, background: conferiu ? S.marca : "#E6E1D6", color: conferiu ? "#FFFFFF" : "#6B675E" }}>
        <DownloadIcon size={20} color={conferiu ? "#FFFFFF" : "#6B675E"} /> {estado.fase === "gerando" ? "Gerando PDF…" : "Baixar PDF"}
      </button>
      {estado.fase === "feito" && (
        <p role="status" className="flex items-center gap-2 mt-3" style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.resolvido }}>
          <CheckIcon size={16} color={S.resolvido} /> PDF pronto. Envie ao cliente pelo e-mail do escritório.
        </p>
      )}
      {estado.fase === "erro" && <p role="status" className="mt-3" style={{ fontFamily: F.ui, fontSize: 15, color: S.risco }}>{estado.msg}</p>}
    </div>
  );
}

export { RelatorioCliente };
