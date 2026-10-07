import React, { useState, useEffect } from "react";
import { BuildingIcon, IconeSem, LockIcon, SparkleIcon, StarIcon } from "../componentes/icones";
import { Badge, Botao, Faixa, InfoLinha, KPIs, SecLabel } from "../componentes/ui";
import { fmtData } from "../dados/formato";
import { BLOQUEIOS_LISTA, RECLAMACOES_LISTA } from "../dados/base";
import { CARD, F, LINK, S, T, semDe, tomDeStatus } from "../estilo/tokens";
import { erroTexto } from "../ia/motor";
import { OuvirBtn } from "../preferencias";
import { Resposta, textoParaOuvir } from "../ia/Resposta";
import { Anotacao, BotaoAlerta } from "../pessoal";
import { Dica } from "../ajuda/Dica";

function ProcessoDetalhe({ processo, isFollowing, onToggleFollow, onBack, backLabel = "Processos", sample }) {
  const [resumo, setResumo] = useState({ status: "idle", text: "" });
  const ctlRef = React.useRef(null);
  useEffect(() => () => ctlRef.current?.abort(), []);
  const bloqueios = BLOQUEIOS_LISTA.filter((b) => b.processoId === processo.id);

  // "Contar a história": a IA narra o processo por fases, com base nos dados abaixo (sem prever resultado).
  const resumir = async () => {
    if (!sample) return;
    const ctl = new AbortController();
    ctlRef.current = ctl;
    setResumo({ status: "thinking", text: "" });
    const reclamacao = RECLAMACOES_LISTA.find((r) => r.processosOrigem.includes(processo.id));
    const dados = {
      numero: processo.numero, cliente: processo.cliente, contrato_de_gestao: processo.contrato, area: processo.area, acao: processo.desc,
      situacao_atual: processo.status, dias_sem_movimentacao: processo.diasParado,
      valor_em_discussao: processo.valorCausa, prognostico_do_escritorio: processo.prognostico,
      movimentacoes_da_mais_antiga_para_a_mais_recente: [...processo.movs].reverse(),
      bloqueios: bloqueios.map((b) => ({ valor: b.valor, situacao: b.status, historico: b.historico })),
      reclamacao_constitucional_ligada: reclamacao ? { numero: reclamacao.numero, liminar: reclamacao.liminar, situacao: reclamacao.status } : null,
      fonte: "Base de exemplo do app (em produção: DataJud e Legal One)",
    };
    try {
      const { text } = await sample(
        `Você conta a história de um processo para uma sócia de escritório de advocacia (Direito do Terceiro Setor), que lê pelo celular e tem dificuldade de ver de perto.

Escreva em Markdown, em português simples, nesta ordem:
1. **Em uma frase:** onde o processo está hoje e o que isso significa para o cliente.
2. ### Como chegamos até aqui: a história em ordem, agrupada por fases (por exemplo: início, defesa, audiência, sentença, recurso, execução, bloqueio). Cada fase em 1 a 3 frases, citando as datas. Explique termos jurídicos em palavras do dia a dia.
3. ### Dinheiro envolvido: valor em discussão e bloqueios, se houver.
4. ### Próximo passo esperado: o que costuma vir a seguir neste tipo de processo, pelo rito. Não preveja resultado, não estime condenação e não dê o prognóstico como certeza.
Use só os fatos dos dados abaixo. Se faltar informação para alguma fase, diga que o registro não mostra. Não invente datas, valores nem partes. Sem emojis.

Dados do processo:
${JSON.stringify(dados)}`,
        { modelTier: "default", signal: ctl.signal, onText: ({ text }) => setResumo({ status: "streaming", text }) },
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
            <Botao variante="ia" onClick={resumir}><SparkleIcon size={17} color={S.ia} strokeWidth={2} /> Contar a história do processo</Botao>
          )}
          </div>
          <BotaoAlerta base={{ tipo: "processo_parado", processoId: processo.id }} rotulo="Avisar se ficar parado" titulo="Avisar se ficar parado" />
          <Anotacao chave={`processo:${processo.id}`} sobre="este processo" />
        </Faixa>
        <Dica id="processo" />

        {resumo.status !== "idle" && (
          <div className="mt-4" style={{ background: S.iaFundo, borderRadius: 24, padding: 18 }} aria-live="polite">
            <p className="flex items-center gap-1.5" style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 700, color: S.ia, marginBottom: 6 }}>
              <SparkleIcon size={15} color={S.ia} strokeWidth={2} /> A história do processo
            </p>
            {resumo.status === "thinking" && (
              <div><div className="guia-skel" style={{ width: "95%", height: 14, background: undefined }} /><div className="guia-skel" style={{ width: "70%", height: 14, marginTop: 8 }} /></div>
            )}
            {resumo.text && <Resposta texto={resumo.text} />}
            {resumo.status === "error" && (
              <>
                <p className="text-[15px] mt-1" style={{ color: T.muted }}>{resumo.error}</p>
                <button onClick={resumir} className="text-[15px] font-medium mt-2" style={LINK}>Tentar de novo</button>
              </>
            )}
            {resumo.status === "done" && <><p className="text-[14px] mt-2" style={{ color: S.texto2 }}>Contada pela IA a partir das movimentações e dos dados deste processo. Confira as datas na lista abaixo.</p><OuvirBtn texto={textoParaOuvir(resumo.text)} /></>}
          </div>
        )}

        {bloqueios.length > 0 && (
          <>
            <SecLabel>Bloqueios</SecLabel>
            <div style={CARD}>
              {bloqueios.map((b, i) => (
                <div key={b.id} className="flex items-center gap-3" style={{ padding: "14px 16px", borderBottom: i === bloqueios.length - 1 ? "none" : `1px solid ${S.linha}` }}>
                  <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: semDe(b.status).fundo }}>
                    <LockIcon size={18} color={semDe(b.status).cor} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: F.ui, fontSize: 17, fontWeight: 600, color: S.ink, fontVariantNumeric: "tabular-nums" }}>{b.valor}</p>
                    <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2 }}>Bloqueado em {fmtData(b.data)}</p>
                  </div>
                  <Badge text={b.status} />
                </div>
              ))}
            </div>
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
        <div style={CARD}>
          <InfoLinha icone={<BuildingIcon size={18} color={S.curso} />} fundo={S.cursoFundo} rotulo="Órgão contratante" valor={processo.contrato} last />
        </div>
      </div>
    </>
  );
}

export { ProcessoDetalhe };
