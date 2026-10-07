import React from "react";
import { ChevronIcon, SearchIcon } from "../componentes/icones";
import { Badge, SecLabel } from "../componentes/ui";
import { BLOQUEIOS_LISTA, ORGS, ORG_ORDER, PROCESSOS_LISTA } from "../dados/base";
import { norm } from "../dados/formato";
import { LINK, T } from "../estilo/tokens";

function BuscaGlobal({ q, setQ, onBack, onOpenProcesso, onOpenBloqueio, onOpenOrg }) {
  const term = norm(q.trim());

  const orgs = term ? ORG_ORDER.filter((id) => norm(ORGS[id].name).includes(term)) : [];
  const processos = term ? PROCESSOS_LISTA.filter((p) => norm(`${p.cliente} ${p.desc}`).includes(term)) : [];
  const bloqueios = term ? BLOQUEIOS_LISTA.filter((b) => norm(`${b.cliente} ${b.valor} ${b.contrato}`).includes(term)) : [];
  const total = orgs.length + processos.length + bloqueios.length;

  const Section = ({ title, children }) => (
    <>
      <p className="text-[14px] mt-6 mb-1" style={{ color: T.muted }}>{title}</p>
      <div className="flex flex-col">{children}</div>
    </>
  );

  return (
    <>
      <div className="flex items-center gap-2 px-6 pt-3 pb-2 shrink-0">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-full" style={{ background: "white", border: `1px solid ${T.hairline}` }}>
          <SearchIcon size={16} color={T.muted} />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
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
                <button key={s} onClick={() => setQ(s)} className="text-[15px] px-3 py-1.5 rounded-full" style={{ background: "#FFFFFF" }}>{s}</button>
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
            {orgs.map((id) => (
              <button key={id} onClick={() => onOpenOrg(id)} className="flex items-center gap-3 py-3 w-full text-left" style={{ borderBottom: `1px solid ${T.hairline}` }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-serif-legal text-[14px]" style={{ background: T.ink, color: T.paper }}>{ORGS[id].initials}</div>
                <p className="text-[16px] flex-1">{ORGS[id].name}</p>
                <ChevronIcon size={14} color={T.muted} strokeWidth={2} />
              </button>
            ))}
          </Section>
        )}

        {processos.length > 0 && (
          <Section title="Processos">
            {processos.map((p) => (
              <button key={p.id} onClick={() => onOpenProcesso(p)} className="w-full text-left py-3" style={{ borderBottom: `1px solid ${T.hairline}` }}>
                <p className="text-[16px] font-medium">{p.cliente}</p>
                <p className="text-[15px] mt-0.5" style={{ color: T.muted }}>{p.desc}</p>
              </button>
            ))}
          </Section>
        )}

        {bloqueios.length > 0 && (
          <Section title="Bloqueios">
            {bloqueios.map((b) => (
              <button key={b.id} onClick={() => onOpenBloqueio(b)} className="w-full text-left py-3 flex items-center justify-between gap-2" style={{ borderBottom: `1px solid ${T.hairline}` }}>
                <div>
                  <p className="text-[16px] font-medium">{b.cliente}</p>
                  <p className="text-[15px] mt-0.5" style={{ color: T.muted }}>{b.valor}</p>
                </div>
                <Badge text={b.status} />
              </button>
            ))}
          </Section>
        )}
      </div>
    </>
  );
}

export { BuscaGlobal };
