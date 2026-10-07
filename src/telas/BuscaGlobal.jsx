import React from "react";
import { ChevronIcon, FolderIcon, LockIcon, SearchIcon } from "../componentes/icones";
import { Badge, LinhaLista, SecLabel } from "../componentes/ui";
import { BLOQUEIOS_LISTA, ORGS, ORG_ORDER, PROCESSOS_LISTA } from "../dados/base";
import { norm } from "../dados/formato";
import { CARD, F, LINK, S, T, semDe } from "../estilo/tokens";
import { MarcaOrg } from "../componentes/MarcaOrg";

function BuscaGlobal({ q, setQ, onBack, onOpenProcesso, onOpenBloqueio, onOpenOrg }) {
  const term = norm(q.trim());

  const orgs = term ? ORG_ORDER.filter((id) => norm(ORGS[id].name).includes(term)) : [];
  const processos = term ? PROCESSOS_LISTA.filter((p) => norm(`${p.cliente} ${p.desc}`).includes(term)) : [];
  const bloqueios = term ? BLOQUEIOS_LISTA.filter((b) => norm(`${b.cliente} ${b.valor} ${b.contrato}`).includes(term)) : [];
  const total = orgs.length + processos.length + bloqueios.length;

  const Section = ({ title, children }) => (
    <>
      <SecLabel>{title}</SecLabel>
      <div style={CARD}>{children}</div>
    </>
  );

  return (
    <>
      <div className="flex items-center gap-2 px-6 pt-3 pb-2 shrink-0">
        <div className="busca-campo flex-1 flex items-center gap-2 px-4 rounded-full" style={{ height: 50, background: S.cartao, boxShadow: CARD.boxShadow }}>
          <SearchIcon size={20} color={S.texto2} />
          <input id="busca" aria-label="Buscar" autoFocus value={q} onChange={(e) => setQ(e.target.value)}
                 placeholder="Cliente, processo ou valor"
                 className="flex-1 bg-transparent outline-none text-[17px]" style={{ color: T.ink }} />
        </div>
        <button onClick={onBack} className="text-[16px] px-2" style={LINK}>Cancelar</button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-8 pt-2" style={{ paddingBottom: 60 }}>
        {!term && (
          <>
            <SecLabel>Sugestões</SecLabel>
            <div className="flex flex-wrap gap-2">
              {["AFNE", "Gnosis", "trabalhista", "SISBAJUD", "Niterói"].map((s) => (
                <button key={s} onClick={() => setQ(s)} className="rounded-full" style={{ background: S.cartao, boxShadow: CARD.boxShadow, fontFamily: F.ui, fontSize: 16, color: S.ink, padding: "8px 14px" }}>{s}</button>
              ))}
            </div>
          </>
        )}

        {term && total === 0 && (
          <p className="text-[16px] mt-6" style={{ color: T.muted }}>
            Nada encontrado para "{q}". Tente o nome do cliente ou o tipo de ação.
          </p>
        )}

        {orgs.length > 0 && (
          <Section title="Organizações">
            {orgs.map((id, i) => (
              <button key={id} onClick={() => onOpenOrg(id)} className="flex items-center gap-3 w-full text-left" style={{ padding: "12px 16px", borderBottom: i === orgs.length - 1 ? "none" : `1px solid ${S.linha}` }}>
                <MarcaOrg id={id} iniciais={ORGS[id].initials} size={40} />
                <span className="flex-1" style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink }}>{ORGS[id].name}</span>
                <ChevronIcon size={16} color={S.texto2} strokeWidth={2} />
              </button>
            ))}
          </Section>
        )}

        {processos.length > 0 && (
          <Section title="Processos">
            {processos.map((p, i) => (
              <LinhaLista key={p.id} onClick={() => onOpenProcesso(p)} last={i === processos.length - 1} sem={semDe(p.status)}
                          icone={<FolderIcon size={18} color={semDe(p.status).cor} />} titulo={p.cliente} detalhe={p.desc} abaixo={<Badge text={p.status} />} />
            ))}
          </Section>
        )}

        {bloqueios.length > 0 && (
          <Section title="Bloqueios">
            {bloqueios.map((b, i) => (
              <LinhaLista key={b.id} onClick={() => onOpenBloqueio(b)} last={i === bloqueios.length - 1} sem={semDe(b.status)}
                          icone={<LockIcon size={18} color={semDe(b.status).cor} />} titulo={<span style={{ fontSize: 17, fontVariantNumeric: "tabular-nums" }}>{b.valor}</span>}
                          detalhe={b.cliente} direita={<Badge text={b.status} />} />
            ))}
          </Section>
        )}
      </div>
    </>
  );
}

export { BuscaGlobal };
