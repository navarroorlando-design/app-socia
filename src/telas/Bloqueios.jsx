import React, { useState } from "react";
import { ChevronDownIcon, ChevronIcon, LockIcon, SearchIcon } from "../componentes/icones";
import { Botao, Etiqueta, Faixa, FolhaInferior, KPIs, LinhaLista, SeletorSegmentado } from "../componentes/ui";
import { BLOQUEIOS_LISTA, ORGS, ORG_ORDER, PROCESSOS_LISTA } from "../dados/base";
import { DIAS_NOVO_LIMITE, DIAS_PARADO_LIMITE, ROTULO_STATUS_BLOQUEIO, SEM_ID_STATUS_BLOQUEIO, statusVisualBloqueio } from "../dados/criterios";
import { diasEntre, fmtBRL, fmtData, HOJE, norm } from "../dados/formato";
import { CARD, F, S, SEMANTICA } from "../estilo/tokens";
import { MarcaOrg } from "../componentes/MarcaOrg";

/* ------------------------------------------------------------------ */
/* Bloqueios (redesenho v3, seção B.5): resumo por cliente que filtra,  */
/* busca, seletor Ativos/Levantados/Todos, seletor de cliente em folha  */
/* inferior, ordenação, agrupar por Mês/Contrato com subtotal. O status */
/* visual (Novo/Parado/Ativo/Levantado) vem de statusVisualBloqueio     */
/* (src/dados/criterios.js) — "Parado" usa o critério do processo       */
/* vinculado, não a data do bloqueio (pendente de confirmar).           */
/* ------------------------------------------------------------------ */
const sem = (id) => SEMANTICA.find((x) => x.id === id);
const processoPorId = (id) => PROCESSOS_LISTA.find((p) => p.id === id);

function semStatus(visual) { return sem(SEM_ID_STATUS_BLOQUEIO[visual]); }

const MES_ANO = (d) => { const t = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }); return t.charAt(0).toUpperCase() + t.slice(1); };

function BloqueiosTela({ onBack, onOpenOrg, onOpenParados, onOpenContrato, onOpenProcesso, clienteInicial, contratoInicial }) {
  const [recorte, setRecorte] = useState("Ativo");
  const [clienteFiltro, setClienteFiltroS] = useState(clienteInicial || null);
  const [contratoFiltro, setContratoFiltro] = useState(contratoInicial || null);
  const setClienteFiltro = (id) => { setClienteFiltroS(id); setContratoFiltro(null); };
  const [sheetCliente, setSheetCliente] = useState(false);
  const [bloqueioAberto, setBloqueioAberto] = useState(null);
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState("recentes");
  const [agrupar, setAgrupar] = useState("mes");

  const filtrarContrato = (b) => { setClienteFiltroS(b.clienteId); setContratoFiltro(b.contrato); setBloqueioAberto(null); };
  const verContrato = (b) => { setBloqueioAberto(null); onOpenContrato(b.clienteId, b.contrato); };
  const abrirProcesso = (p) => { setBloqueioAberto(null); onOpenProcesso(p); };

  const comProcesso = BLOQUEIOS_LISTA.map((b) => ({ ...b, processo: processoPorId(b.processoId) }));
  const ativos = comProcesso.filter((b) => b.status === "Ativo");
  const levantados = comProcesso.filter((b) => b.status === "Levantado");
  const totalAtivo = ativos.reduce((s, b) => s + b.valorNum, 0);
  const novos7 = ativos.filter((b) => diasEntre(b.data, HOJE) <= DIAS_NOVO_LIMITE).length;
  const paradosCount = ativos.filter((b) => statusVisualBloqueio(b, b.processo) === "parado").length;

  const porCliente = ORG_ORDER
    .map((id) => {
      const lista = ativos.filter((b) => b.clienteId === id);
      const valor = lista.reduce((s, b) => s + b.valorNum, 0);
      const novos = lista.filter((b) => diasEntre(b.data, HOJE) <= DIAS_NOVO_LIMITE).length;
      return { id, valor, n: lista.length, novos };
    })
    .filter((c) => c.n > 0)
    .sort((a, b) => b.valor - a.valor);
  const maxCliente = Math.max(...porCliente.map((c) => c.valor), 1);

  const contagem = { Ativo: ativos.length, Levantado: levantados.length, todos: comProcesso.length };
  const RECORTES = [
    { id: "Ativo", label: `Ativos (${contagem.Ativo})` },
    { id: "Levantado", label: `Levantados (${contagem.Levantado})` },
    { id: "todos", label: `Todos (${contagem.todos})` },
  ];

  const termo = norm(busca.trim());
  let lista = comProcesso
    .filter((b) => recorte === "todos" || b.status === recorte)
    .filter((b) => !clienteFiltro || b.clienteId === clienteFiltro)
    .filter((b) => !contratoFiltro || b.contrato === contratoFiltro)
    .filter((b) => !termo || norm(`${b.processo?.numero || ""} ${b.valor} ${b.contrato}`).includes(termo));
  lista = [...lista].sort(ordem === "recentes" ? (a, b) => b.data - a.data : (a, b) => b.valorNum - a.valorNum);

  const chaveGrupo = (b) => (agrupar === "contrato" ? b.contrato : MES_ANO(b.data));
  const grupos = [];
  for (const b of lista) {
    const chave = chaveGrupo(b);
    let g = grupos.find((x) => x.chave === chave);
    if (!g) { g = { chave, itens: [] }; grupos.push(g); }
    g.itens.push(b);
  }

  const subtotalValor = lista.reduce((s, b) => s + b.valorNum, 0);
  const escopo = clienteFiltro ? ORGS[clienteFiltro].name : "todos os clientes";

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
      <Faixa bleed={32} bloco onBack={onBack} backLabel="Início" eyebrow="Todos os clientes" titulo="Bloqueios"
             sub={`${lista.length} ${lista.length === 1 ? "bloqueio" : "bloqueios"} · ${escopo}`} />

      {/* topo escuro: total ativo, novos, parados e o resumo por cliente */}
      <div style={{ background: S.marca, borderRadius: 24, padding: 20, marginTop: 4 }}>
        <p style={{ fontFamily: F.ui, fontSize: 15, color: S.marcaTexto2 }}>Bloqueado hoje, todos os clientes</p>
        <p style={{ fontFamily: F.ui, fontSize: 32, fontWeight: 600, color: "#FFFFFF", letterSpacing: "-0.03em", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{fmtBRL(totalAtivo)}</p>
        <p style={{ fontFamily: F.ui, fontSize: 15, color: S.marcaTexto2, marginTop: 6 }}>{ativos.length} bloqueios ativos</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {novos7 > 0 && <Etiqueta s={sem("risco")} texto={`${novos7} novos nos últimos 7 dias`} sobreCor />}
          {paradosCount > 0 && (
            <button onClick={onOpenParados} aria-label={`${paradosCount} bloqueios parados há mais de 90 dias, ver lista`}>
              <Etiqueta s={sem("atencao")} texto={`${paradosCount} parados há 90+ dias`} sobreCor />
            </button>
          )}
        </div>

        {porCliente.length > 0 && (
          <div className="flex flex-col gap-3 mt-4">
            {porCliente.map((c) => {
              const ativo = clienteFiltro === c.id;
              const pct = Math.round((c.valor / totalAtivo) * 100);
              return (
                <button key={c.id} onClick={() => setClienteFiltro(ativo ? null : c.id)} className="w-full text-left pressable">
                  <span className="flex items-baseline justify-between gap-2">
                    <span style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: "#FFFFFF" }}>{ORGS[c.id].name}</span>
                    <span style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: "#FFFFFF", fontVariantNumeric: "tabular-nums" }}>{fmtBRL(c.valor)}</span>
                  </span>
                  <span className="block" style={{ marginTop: 6, height: 8, borderRadius: 999, background: "rgba(255,255,255,.18)" }}>
                    <span className="block" style={{ height: 8, borderRadius: 999, width: `${Math.max(3, pct)}%`, background: ativo ? S.dourado : S.osso }} />
                  </span>
                  <span style={{ fontFamily: F.ui, fontSize: 13, color: S.marcaTexto2, marginTop: 4, display: "block" }}>
                    {c.n} {c.n === 1 ? "bloqueio" : "bloqueios"}{c.novos > 0 ? ` · ${c.novos} novos` : ""} · {pct}%
                  </span>
                </button>
              );
            })}
            {clienteFiltro && (
              <button onClick={() => setClienteFiltro(null)} className="self-start" style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 600, color: S.dourado, textDecoration: "underline", textUnderlineOffset: 4 }}>
                Limpar filtro
              </button>
            )}
          </div>
        )}
      </div>

      {/* busca */}
      <div className="busca-campo flex items-center gap-2 px-4 rounded-full mt-4" style={{ height: 50, background: S.cartao, boxShadow: CARD.boxShadow }}>
        <SearchIcon size={20} color={S.texto2} />
        <input aria-label="Buscar bloqueios" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Processo, valor ou órgão"
               className="flex-1 bg-transparent outline-none text-[17px]" style={{ color: S.ink, fontFamily: F.ui }} />
        {busca && <button onClick={() => setBusca("")} aria-label="Limpar busca" style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.ink }}>Limpar</button>}
      </div>

      <div className="mt-3"><SeletorSegmentado itens={RECORTES} ativo={recorte} onChange={setRecorte} label="Mostrar" /></div>

      <div className="flex items-center gap-2 mt-3">
        <button onClick={() => setSheetCliente(true)} className="flex-1 flex items-center justify-between gap-2 rounded-2xl pressable"
                style={{ ...CARD, height: 48, padding: "0 14px" }}>
          <span style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.ink }}>Cliente: {clienteFiltro ? ORGS[clienteFiltro].name : "Todos"}</span>
          <ChevronDownIcon size={18} color={S.texto2} strokeWidth={2} />
        </button>
      </div>
      {clienteFiltro && (
        <button onClick={() => onOpenOrg(clienteFiltro)} className="mt-2 block" style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 600, color: S.ink, textDecoration: "underline", textUnderlineOffset: 4 }}>
          Abrir a página de {ORGS[clienteFiltro].name} ›
        </button>
      )}
      {contratoFiltro && (
        <div className="flex items-center gap-2 mt-2">
          <span className="rounded-full" style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 600, color: S.ink, background: S.osso, padding: "6px 12px" }}>Contrato: {contratoFiltro}</span>
          <button onClick={() => setContratoFiltro(null)} style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 600, color: S.texto2, textDecoration: "underline", textUnderlineOffset: 4 }}>Limpar</button>
        </div>
      )}

      <div className="flex items-center gap-2 mt-3">
        <div className="flex-1"><SeletorSegmentado itens={[["recentes", "Mais recentes"], ["valor", "Maior valor"]].map(([id, label]) => ({ id, label }))} ativo={ordem} onChange={setOrdem} label="Ordenar por" /></div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <div className="flex-1"><SeletorSegmentado itens={[["mes", "Agrupar por mês"], ["contrato", "Agrupar por contrato"]].map(([id, label]) => ({ id, label }))} ativo={agrupar} onChange={setAgrupar} label="Agrupar" /></div>
      </div>

      {lista.length === 0 ? (
        <p className="mt-4" style={{ fontFamily: F.ui, fontSize: 16, color: S.texto2, lineHeight: 1.5 }}>Nada com esses filtros. Troque o recorte, o cliente ou a busca.</p>
      ) : (
        <>
          {grupos.map((g) => {
            const subtotal = g.itens.reduce((s, b) => s + b.valorNum, 0);
            return (
              <div key={g.chave} className="mt-4">
                <div className="flex items-baseline justify-between gap-2" style={{ margin: "0 0 8px" }}>
                  <h3 style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 700, color: S.ink }}>{g.chave}</h3>
                  <span style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, fontVariantNumeric: "tabular-nums" }}>{g.itens.length} · {fmtBRL(subtotal)}</span>
                </div>
                <div style={CARD}>
                  {g.itens.map((b, i) => {
                    const visual = statusVisualBloqueio(b, b.processo);
                    const s = semStatus(visual);
                    return (
                      <LinhaLista key={b.id} onClick={() => setBloqueioAberto(b)} last={i === g.itens.length - 1} sem={s}
                                  icone={<LockIcon size={18} color={s.cor} />}
                                  titulo={<span style={{ fontSize: 17, fontVariantNumeric: "tabular-nums" }}>{b.valor}</span>}
                                  detalhe={`${b.cliente} · ${b.contrato}`}
                                  abaixo={<span style={{ fontFamily: F.dados, fontSize: 13, color: S.texto2 }}>{b.processo?.numero} · {fmtData(b.data)}</span>}
                                  direita={<Etiqueta s={s} texto={ROTULO_STATUS_BLOQUEIO[visual]} />} />
                    );
                  })}
                </div>
              </div>
            );
          })}
          <p role="status" className="text-center mt-5" style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2 }}>
            Fim da lista · {lista.length} · {fmtBRL(subtotalValor)}
          </p>
        </>
      )}

      {sheetCliente && (
        <FolhaInferior titulo="Cliente" onFechar={() => setSheetCliente(false)}>
          <div className="mt-3" style={CARD}>
            <button onClick={() => { setClienteFiltro(null); setSheetCliente(false); }} className="w-full text-left flex items-center justify-between gap-3"
                    style={{ padding: "14px 16px", borderBottom: `1px solid ${S.linha}` }}>
              <span style={{ fontFamily: F.ui, fontSize: 17, fontWeight: !clienteFiltro ? 700 : 500, color: S.ink }}>Todos os clientes</span>
              <span style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2 }}>{comProcesso.length}</span>
            </button>
            {ORG_ORDER.map((id, i) => {
              const n = comProcesso.filter((b) => b.clienteId === id).length;
              if (n === 0) return null;
              return (
                <div key={id} className="flex items-center gap-3" style={{ padding: "12px 16px", borderBottom: i === ORG_ORDER.length - 1 ? "none" : `1px solid ${S.linha}` }}>
                  <button onClick={() => { setClienteFiltro(id); setSheetCliente(false); }} className="flex-1 flex items-center gap-3 text-left">
                    <MarcaOrg id={id} iniciais={ORGS[id].initials} size={36} />
                    <span className="flex-1 min-w-0">
                      <span className="block" style={{ fontFamily: F.ui, fontSize: 16, fontWeight: clienteFiltro === id ? 700 : 600, color: S.ink }}>{ORGS[id].name}</span>
                      <span className="block" style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2 }}>{n} {n === 1 ? "bloqueio" : "bloqueios"}</span>
                    </span>
                  </button>
                  <button onClick={() => { setSheetCliente(false); onOpenOrg(id); }} className="shrink-0 flex items-center gap-1" style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 600, color: S.ink }}>
                    Página <ChevronIcon size={14} color={S.ink} strokeWidth={2} />
                  </button>
                </div>
              );
            })}
          </div>
        </FolhaInferior>
      )}

      {bloqueioAberto && (
        <DetalheBloqueioFolha bloqueio={bloqueioAberto} onFechar={() => setBloqueioAberto(null)}
                              onFiltrarContrato={filtrarContrato} onVerContrato={verContrato} onAbrirProcesso={abrirProcesso} />
      )}
    </div>
  );
}

/* Detalhe rápido do bloqueio, em folha inferior (seção B.5): valor, status, dados-chave,
   processo vinculado e histórico, com "Filtrar contrato" (aplica cliente+contrato na lista de
   trás) e "Ver contrato" (empurra a tela do contrato, trocando para a aba Clientes). */
function DetalheBloqueioFolha({ bloqueio, onFechar, onFiltrarContrato, onVerContrato, onAbrirProcesso }) {
  const processo = bloqueio.processo || processoPorId(bloqueio.processoId);
  const visual = statusVisualBloqueio(bloqueio, processo);
  const s = semStatus(visual);
  const dias = diasEntre(bloqueio.data, HOJE);
  return (
    <FolhaInferior titulo="Bloqueio" onFechar={onFechar}>
      <div className="flex items-center justify-between gap-3 mt-3">
        <span style={{ fontFamily: F.ui, fontSize: 28, fontWeight: 600, color: S.ink, fontVariantNumeric: "tabular-nums" }}>{bloqueio.valor}</span>
        <Etiqueta s={s} texto={ROTULO_STATUS_BLOQUEIO[visual]} />
      </div>
      <p style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2, marginTop: 4 }}>{bloqueio.cliente} · {bloqueio.contrato}</p>

      <div className="mt-4">
        <KPIs itens={[
          ["Bloqueado em", fmtData(bloqueio.data).slice(0, 5)],
          ["Há", dias === 1 ? "1 dia" : `${dias} dias`],
          ["Sistema", bloqueio.sistema],
        ]} />
      </div>

      {processo && (
        <button onClick={() => onAbrirProcesso(processo)} className="w-full text-left mt-3 flex items-center gap-3 pressable" style={{ ...CARD, padding: 14 }}>
          <span className="flex-1 min-w-0">
            <span className="block" style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.ink }}>{processo.desc}</span>
            <span className="block" style={{ fontFamily: F.dados, fontSize: 13, color: S.texto2, marginTop: 2 }}>{processo.numero}</span>
          </span>
          <ChevronIcon size={16} color={S.texto2} strokeWidth={2} />
        </button>
      )}

      <p style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 700, color: S.texto2, letterSpacing: ".02em", marginTop: 18 }}>HISTÓRICO</p>
      <div className="relative pl-5 mt-2">
        <div className="absolute left-[5px] top-1 bottom-1 w-px" style={{ background: S.linha }} />
        {bloqueio.historico.map((h, i) => (
          <div key={i} className="relative pb-4 last:pb-0">
            <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full" style={{ background: i === 0 ? s.cor : S.linha }} />
            <p style={{ fontFamily: F.ui, fontSize: 13, color: S.texto2 }}>{h.date}</p>
            <p style={{ fontFamily: F.ui, fontSize: 15, color: S.ink, marginTop: 1 }}>{h.text}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-5">
        {onFiltrarContrato && <div className="flex-1"><Botao variante="secundario" onClick={() => onFiltrarContrato(bloqueio)}>Filtrar contrato</Botao></div>}
        <div className="flex-1"><Botao onClick={() => onVerContrato(bloqueio)}>Ver contrato</Botao></div>
      </div>
    </FolhaInferior>
  );
}

/* Bloqueios ativos cujo processo vinculado está parado (critério em src/dados/criterios.js),
   do mais antigo para o mais novo. TODO confirmar com a sócia se o critério muda para a data
   do bloqueio em vez do processo (ver DIAS_PARADO_LIMITE). */
function BloqueiosParados({ onBack, onOpenContrato, onOpenProcesso }) {
  const [bloqueioAberto, setBloqueioAberto] = useState(null);
  const itens = BLOQUEIOS_LISTA
    .map((b) => ({ ...b, processo: processoPorId(b.processoId) }))
    .filter((b) => statusVisualBloqueio(b, b.processo) === "parado")
    .sort((a, b) => a.data - b.data);
  const abrirProcesso = (p) => { setBloqueioAberto(null); onOpenProcesso(p); };
  const verContrato = (b) => { setBloqueioAberto(null); onOpenContrato(b.clienteId, b.contrato); };
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
      <Faixa bleed={32} onBack={onBack} backLabel="Bloqueios" titulo="Parados há 90+ dias"
             sub={`${itens.length} ${itens.length === 1 ? "bloqueio ativo" : "bloqueios ativos"} sem movimentação no processo`} />
      {itens.length === 0 ? (
        <p style={{ fontFamily: F.ui, fontSize: 16, color: S.texto2, lineHeight: 1.5 }}>Nenhum bloqueio parado há {DIAS_PARADO_LIMITE} dias ou mais.</p>
      ) : (
        <div style={CARD}>
          {itens.map((b, i) => (
            <LinhaLista key={b.id} onClick={() => setBloqueioAberto(b)} last={i === itens.length - 1} sem={sem("atencao")}
                        icone={<LockIcon size={18} color={sem("atencao").cor} />}
                        titulo={<span style={{ fontSize: 17, fontVariantNumeric: "tabular-nums" }}>{b.valor}</span>}
                        detalhe={`${b.cliente} · ${b.contrato}`}
                        abaixo={<Etiqueta s={sem("atencao")} texto={`${b.processo?.diasParado} dias sem movimentação`} />} />
          ))}
        </div>
      )}
      {bloqueioAberto && (
        <DetalheBloqueioFolha bloqueio={bloqueioAberto} onFechar={() => setBloqueioAberto(null)}
                              onVerContrato={verContrato} onAbrirProcesso={abrirProcesso} />
      )}
    </div>
  );
}

export { BloqueiosParados, BloqueiosTela };
