import React, { useState, useEffect } from "react";
import { IconeSem, SparkleIcon, StarIcon } from "../componentes/icones";
import { Badge, Botao, Faixa, KPIs, SecLabel } from "../componentes/ui";
import { BLOQUEIOS_LISTA } from "../dados/base";
import { CARD, F, LINK, S, T, tomDeStatus } from "../estilo/tokens";
import { erroTexto } from "../ia/motor";
import { OuvirBtn } from "../preferencias";

function ProcessoDetalhe({ processo, isFollowing, onToggleFollow, onBack, backLabel = "Processos", sample }) {
  const [resumo, setResumo] = useState({ status: "idle", text: "" });
  const ctlRef = React.useRef(null);
  useEffect(() => () => ctlRef.current?.abort(), []);
  const bloqueios = BLOQUEIOS_LISTA.filter((b) => b.processoId === processo.id);

  const resumir = async () => {
    if (!sample) return;
    const ctl = new AbortController();
    ctlRef.current = ctl;
    setResumo({ status: "thinking", text: "" });
    const dados = {
      numero: processo.numero, cliente: processo.cliente, area: processo.area, acao: processo.desc, status: processo.status,
      contrato_de_gestao: processo.contrato, dias_sem_movimentacao: processo.diasParado,
      movimentacoes_mais_recentes_primeiro: processo.movs,
      bloqueios: bloqueios.map((b) => ({ valor: b.valor, status: b.status, historico: b.historico })),
    };
    try {
      const { text } = await sample(
        `Você ajuda uma sócia de escritório de advocacia a acompanhar processos pelo celular. Resuma em no máximo 2 frases curtas, em português simples, a última movimentação deste processo e o que ela significa na prática para o cliente. Use só os fatos dos dados abaixo; não invente valores, datas ou partes. Responda só com o resumo, sem título.\n\nDados do processo:\n${JSON.stringify(dados)}`,
        { modelTier: "quick", signal: ctl.signal, onText: ({ text }) => setResumo({ status: "streaming", text }) },
      );
      setResumo({ status: "done", text });
    } catch (e) {
      if (e?.code === "cancelled") return;
      setResumo({ status: "error", text: e?.text || "", error: erroTexto(e) });
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
        <Faixa bleed={32} tom={tomDeStatus(processo.status)} onBack={onBack} backLabel={backLabel}
               direita={<Badge text={processo.status} sobreCor />}
               eyebrow={`${processo.cliente} · ${processo.area}`} titulo={processo.desc} tituloSize={28}
               sub={<span style={{ fontFamily: F.dados, fontSize: 14, letterSpacing: ".01em" }}>{processo.numero}</span>}>
          <KPIs itens={[
            ["Última mov.", processo.movs[0]?.date.slice(0, 5) || "—"],
            ["Parado há", processo.diasParado === 0 ? "0 dias" : `${processo.diasParado} ${processo.diasParado === 1 ? "dia" : "dias"}`],
            ["Bloqueios", String(bloqueios.filter((b) => b.status === "Ativo").length)],
          ]} />
          <div className="flex flex-col gap-3 mt-3" style={{ ...CARD, padding: 16 }}>
          {isFollowing ? (
            <button onClick={onToggleFollow} className="guia-btn w-full inline-flex items-center justify-center gap-2"
                    style={{ height: 50, borderRadius: 14, background: S.resolvidoFundo, color: S.resolvido, fontFamily: F.ui, fontSize: 17, fontWeight: 600 }}>
              <IconeSem tipo="check" cor={S.resolvido} size={17} /> Seguindo este processo
            </button>
          ) : (
            <Botao onClick={onToggleFollow}><StarIcon size={17} color="#FFFFFF" /> Seguir processo</Botao>
          )}
          {sample && resumo.status === "idle" && (
            <Botao variante="ia" onClick={resumir}><SparkleIcon size={17} color={S.ia} strokeWidth={2} /> Resumir com a IA</Botao>
          )}
          </div>
        </Faixa>

        {resumo.status !== "idle" && (
          <div className="mt-4" style={{ background: S.iaFundo, borderRadius: 24, padding: 18 }} aria-live="polite">
            <p className="flex items-center gap-1.5" style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 700, color: S.ia, marginBottom: 6 }}>
              <SparkleIcon size={15} color={S.ia} strokeWidth={2} /> Resumo da IA
            </p>
            {resumo.status === "thinking" && (
              <div><div className="guia-skel" style={{ width: "95%", height: 14, background: undefined }} /><div className="guia-skel" style={{ width: "70%", height: 14, marginTop: 8 }} /></div>
            )}
            {resumo.text && <p className="text-[17px] leading-relaxed">{resumo.text}</p>}
            {resumo.status === "error" && (
              <>
                <p className="text-[15px] mt-1" style={{ color: T.muted }}>{resumo.error}</p>
                <button onClick={resumir} className="text-[15px] font-medium mt-2" style={LINK}>Tentar de novo</button>
              </>
            )}
            {resumo.status === "done" && <><p className="text-[14px] mt-2" style={{ color: S.texto2 }}>Gerado a partir das movimentações abaixo.</p><OuvirBtn texto={resumo.text} /></>}
          </div>
        )}

        {bloqueios.length > 0 && (
          <>
            <SecLabel>Bloqueios</SecLabel>
            {bloqueios.map((b, i) => (
              <div key={b.id} className="flex items-center justify-between py-2.5" style={{ borderBottom: i === bloqueios.length - 1 ? "none" : `1px solid ${T.hairline}` }}>
                <span className="text-[16px]" style={{ fontVariantNumeric: "tabular-nums" }}>{b.valor}</span>
                <Badge text={b.status} />
              </div>
            ))}
          </>
        )}

        <SecLabel>Movimentações</SecLabel>
        <div className="relative pl-5">
          <div className="absolute left-[5px] top-1 bottom-1 w-px" style={{ background: T.hairline }} />
          {processo.movs.map((t, i) => (
            <div key={i} className="relative pb-5 last:pb-0">
              <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full" style={{ background: i === 0 ? T.brass : T.slate }} />
              <p className="text-[14px]" style={{ color: T.muted }}>{t.date}</p>
              <p className="text-[16px] mt-0.5">{t.text}</p>
            </div>
          ))}
        </div>

        <SecLabel>Contrato de gestão</SecLabel>
        <p className="text-[16px]">{processo.contrato}</p>
      </div>
    </>
  );
}

export { ProcessoDetalhe };
