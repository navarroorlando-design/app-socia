import React from "react";
import { FolderIcon, LockIcon } from "../componentes/icones";
import { Faixa, LinhaLista, SecLabel } from "../componentes/ui";
import { BLOQUEIOS_LISTA, PROCESSOS_LISTA } from "../dados/base";
import { diasEntre, fmtData, HOJE } from "../dados/formato";
import { CARD, F, S, semDe } from "../estilo/tokens";

/* ------------------------------------------------------------------ */
/* Movimentações recentes de todos os processos e bloqueios            */
/* ------------------------------------------------------------------ */
function Movimentacoes({ onBack, onOpenProcesso, onOpenBloqueio }) {
  const eventos = [
    ...PROCESSOS_LISTA.map((p) => ({ tipo: "processo", item: p, data: p.ultimaMov, cliente: p.cliente, texto: p.movs[0]?.text || "Movimentação", detalhe: p.desc, sem: semDe(p.status) })),
    ...BLOQUEIOS_LISTA.map((b) => ({ tipo: "bloqueio", item: b, data: b.data, cliente: b.cliente, texto: `Bloqueio de ${b.valor} ${b.status === "Levantado" ? "(já levantado)" : "realizado"}`, detalhe: b.contrato, sem: semDe(b.status) })),
  ].sort((a, b) => b.data - a.data).slice(0, 30);
  const grupo = (d) => { const n = diasEntre(d, HOJE); return n <= 1 ? "Hoje e ontem" : n <= 7 ? "Nesta semana" : "Anteriores"; };
  const grupos = ["Hoje e ontem", "Nesta semana", "Anteriores"].map((g) => [g, eventos.filter((e) => grupo(e.data) === g)]).filter(([, l]) => l.length);
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
      <Faixa bleed={32} onBack={onBack} backLabel="Início" titulo="Movimentações" sub="As mais recentes, de todos os clientes" />
      {grupos.map(([g, lista]) => (
        <div key={g}>
          <SecLabel>{g}</SecLabel>
          <div style={CARD}>
            {lista.map((e, i) => (
              <LinhaLista key={e.tipo + e.item.id} last={i === lista.length - 1} sem={e.sem}
                          onClick={() => (e.tipo === "processo" ? onOpenProcesso(e.item) : onOpenBloqueio(e.item))}
                          icone={e.tipo === "processo" ? <FolderIcon size={18} color={e.sem.cor} /> : <LockIcon size={18} color={e.sem.cor} />}
                          titulo={e.cliente} direita={<span style={{ fontFamily: F.ui, color: S.texto2, fontSize: 14, whiteSpace: "nowrap", paddingTop: 2 }}>{fmtData(e.data).slice(0, 5)}</span>}
                          detalhe={`${e.texto} · ${e.detalhe}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export { Movimentacoes };
