import React from "react";
import { FlagIcon, FolderIcon } from "../componentes/icones";
import { Badge, Etiqueta, Faixa, InfoLinha, KPIs, LinhaLista, SecLabel } from "../componentes/ui";
import { ORGS, PROCESSOS_LISTA, RECLAMACOES_LISTA } from "../dados/base";
import { fmtBRL, fmtBRLCurto } from "../dados/formato";
import { CARD, F, S, SEMANTICA, semDe, tomDeStatus } from "../estilo/tokens";

/* ------------------------------------------------------------------ */
/* Reclamações constitucionais no STF                                  */
/* ------------------------------------------------------------------ */
const sem = (id) => SEMANTICA.find((x) => x.id === id);
const SEM_LIMINAR = { Deferida: sem("resolvido"), Indeferida: sem("risco"), Pendente: sem("atencao") };

function ListaReclamacoes({ itens, onOpen }) {
  return (
    <div style={CARD}>
      {itens.map((r, i) => (
        <LinhaLista key={r.id} onClick={() => onOpen(r)} last={i === itens.length - 1} sem={semDe(r.status)}
                    icone={<FlagIcon size={18} color={semDe(r.status).cor} />} titulo={`${r.numero} · ${r.cliente}`} detalhe={r.assunto}
                    abaixo={<span className="flex flex-wrap gap-2"><Badge text={r.status} /><Etiqueta s={SEM_LIMINAR[r.liminar]} texto={`Liminar ${r.liminar.toLowerCase()}`} /></span>} />
      ))}
    </div>
  );
}

/* Lista de reclamações: do escritório inteiro ou de uma organização */
function ReclamacoesTela({ orgId, onBack, backLabel, onOpen }) {
  const itens = orgId ? RECLAMACOES_LISTA.filter((r) => r.clienteId === orgId) : RECLAMACOES_LISTA;
  const andamento = itens.filter((r) => r.status !== "Julgada").length;
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
      <Faixa bleed={32} onBack={onBack} backLabel={backLabel} eyebrow={orgId ? ORGS[orgId].name : "Supremo Tribunal Federal"}
             titulo="Reclamações constitucionais" tituloCompacto="Reclamações" tituloSize={30}
             sub={itens.length ? `${andamento} em andamento · ${itens.length - andamento} julgada${itens.length - andamento === 1 ? "" : "s"}` : "Nenhuma reclamação"} />
      {itens.length ? <ListaReclamacoes itens={itens} onOpen={onOpen} />
        : <p style={{ fontFamily: F.ui, fontSize: 16, color: S.texto2, lineHeight: 1.5 }}>Esta organização não tem reclamação constitucional na base.</p>}
    </div>
  );
}

function ReclamacaoDetalhe({ reclamacao: r, onBack, backLabel, onOpenProcesso }) {
  const origem = r.processosOrigem.map((id) => PROCESSOS_LISTA.find((p) => p.id === id)).filter(Boolean);
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
      <Faixa bleed={32} tom={tomDeStatus(r.status)} onBack={onBack} backLabel={backLabel}
             direita={<Badge text={r.status} sobreCor />}
             eyebrow={`${r.cliente} · reclamação constitucional`} titulo={r.numero} tituloSize={32} sub={r.assunto}>
        <KPIs itens={[["Liminar", r.liminar], ["Processos", String(origem.length)], ["Bloqueado", fmtBRLCurto(r.valorDiscutido)]]} />
      </Faixa>

      <SecLabel>O que se discute</SecLabel>
      <div style={{ ...CARD, padding: 18 }}>
        <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2 }}>Ato reclamado</p>
        <p style={{ fontFamily: F.ui, fontSize: 17, color: S.ink, lineHeight: 1.5, marginTop: 4 }}>{r.ato}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Etiqueta s={SEM_LIMINAR[r.liminar]} texto={`Liminar ${r.liminar.toLowerCase()}`} />
        </div>
      </div>
      <div className="mt-3" style={CARD}>
        <InfoLinha icone={<FlagIcon size={18} color={S.curso} />} fundo={S.cursoFundo} rotulo="Precedente invocado" valor={r.paradigma} />
        <InfoLinha icone={<FolderIcon size={18} color={S.curso} />} fundo={S.cursoFundo} rotulo="Valor bloqueado nos processos de origem" valor={fmtBRL(r.valorDiscutido)} last />
      </div>

      {origem.length > 0 && (
        <>
          <SecLabel>Processos de origem</SecLabel>
          <div style={CARD}>
            {origem.map((p, i) => (
              <LinhaLista key={p.id} onClick={() => onOpenProcesso(p)} last={i === origem.length - 1} sem={semDe(p.status)}
                          icone={<FolderIcon size={18} color={semDe(p.status).cor} />} titulo={p.desc} detalhe={`${p.contrato} · ${p.numero}`}
                          abaixo={<Badge text={p.status} />} />
            ))}
          </div>
        </>
      )}

      <SecLabel>Movimentações</SecLabel>
      <div className="relative pl-5">
        <div className="absolute left-[5px] top-1 bottom-1 w-px" style={{ background: S.linha }} />
        {r.movs.map(([data, texto], i) => (
          <div key={i} className="relative pb-5 last:pb-0">
            <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full" style={{ background: i === 0 ? S.marca : S.texto2 }} />
            <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2 }}>{data}</p>
            <p style={{ fontFamily: F.ui, fontSize: 16, color: S.ink, marginTop: 2 }}>{texto}</p>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 20 }}>Dados de exemplo.</p>
    </div>
  );
}

export { ListaReclamacoes, ReclamacaoDetalhe, ReclamacoesTela };
