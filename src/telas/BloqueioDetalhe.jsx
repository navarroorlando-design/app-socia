import React from "react";
import { BuildingIcon, ChevronIcon } from "../componentes/icones";
import { Badge, Faixa, InfoLinha, KPIs, SecLabel } from "../componentes/ui";
import { PROCESSOS_LISTA } from "../dados/base";
import { HOJE, diasEntre, fmtData } from "../dados/formato";
import { CARD, S, T, tomDeStatus } from "../estilo/tokens";

/* ------------------------------------------------------------------ */
/* Tela: Detalhe do bloqueio                                           */
/* ------------------------------------------------------------------ */
function BloqueioDetalhe({ bloqueio, onBack, backLabel, onOpenProcesso }) {
  const processo = PROCESSOS_LISTA.find((p) => p.id === bloqueio.processoId);
  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
        <Faixa bleed={32} tom={tomDeStatus(bloqueio.status)} onBack={onBack} backLabel={backLabel}
               direita={<Badge text={bloqueio.status} />}
               eyebrow={bloqueio.cliente} titulo={bloqueio.valor} tituloCompacto={`${bloqueio.cliente} · ${bloqueio.valor}`} tituloSize={42}
               sub={bloqueio.status === "Ativo" ? "Valor ainda bloqueado na conta do cliente" : "Valor já liberado para o cliente"}>
          <KPIs itens={[
            ["Bloqueado em", fmtData(bloqueio.data).slice(0, 5)],
            ["Há", (() => { const d = diasEntre(bloqueio.data, HOJE); return d === 1 ? "1 dia" : `${d} dias`; })()],
            ["Sistema", bloqueio.sistema],
          ]} />
          <div className="mt-3" style={CARD}>
            <InfoLinha icone={<BuildingIcon size={18} color={S.curso} />} fundo={S.cursoFundo} rotulo="Contrato de gestão" valor={bloqueio.contrato} last />
          </div>
        </Faixa>

        {processo && (
          <>
            <SecLabel>Processo vinculado</SecLabel>
            <button onClick={() => onOpenProcesso(processo)} className="w-full text-left p-4 rounded-2xl flex items-center gap-3"
                    style={CARD}>
              <div className="flex-1">
                <p className="text-[16px] font-medium">{processo.desc}</p>
                <p className="text-[14px] mt-1" style={{ color: T.muted }}>{processo.status}</p>
              </div>
              <ChevronIcon size={14} color={T.muted} strokeWidth={2} />
            </button>
          </>
        )}

        <SecLabel>Histórico</SecLabel>
        <div className="relative pl-5">
          <div className="absolute left-[5px] top-1 bottom-1 w-px" style={{ background: T.hairline }} />
          {bloqueio.historico.map((h, i) => (
            <div key={i} className="relative pb-5 last:pb-0">
              <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full" style={{ background: i === 0 ? T.brass : T.slate }} />
              <p className="text-[14px]" style={{ color: T.muted }}>{h.date}</p>
              <p className="text-[16px] mt-0.5">{h.text}</p>
            </div>
          ))}
        </div>

        <p className="text-[13px] mt-8" style={{ color: T.muted }}>Fonte: Log de Bloqueios, sincronizado há 2 horas.</p>
      </div>
    </>
  );
}

export { BloqueioDetalhe };
