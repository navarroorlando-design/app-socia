import React, { useContext, useState } from "react";
import { BellIcon, ChevronDownIcon, ChevronUpIcon, PersonIcon } from "./componentes/icones";
import { Botao, Faixa, SecLabel, Toggle } from "./componentes/ui";
import { ORGS, PROCESSOS_LISTA } from "./dados/base";
import { fmtBRL } from "./dados/formato";
import { resumoContrato, resumoOrg } from "./dados/passivo";
import { CARD, F, LINK, S } from "./estilo/tokens";

/* ------------------------------------------------------------------ */
/* O que é só da sócia: anotações, alertas e o jeito do Início.        */
/* No protótipo fica guardado no aparelho; no app real, no servidor.   */
/* ------------------------------------------------------------------ */
const PessoalContext = React.createContext(null);
const usePessoal = () => useContext(PessoalContext);

/* ------------------------- Anotações ------------------------------- */
function Anotacao({ chave, sobre }) {
  const { notas, salvarNota } = usePessoal();
  const nota = notas[chave];
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(nota?.texto || "");
  const abrir = () => { setTexto(nota?.texto || ""); setEditando(true); };
  const salvar = () => { salvarNota(chave, texto.trim()); setEditando(false); };
  const id = "nota-" + chave.replace(/[^a-z0-9]/gi, "-");

  if (editando) {
    return (
      <div className="mt-3" style={{ ...CARD, padding: 16 }}>
        <label htmlFor={id} style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.ink }}>Sua anotação sobre {sobre}</label>
        <textarea id={id} value={texto} onChange={(e) => setTexto(e.target.value)} rows={4} maxLength={600} autoFocus
                  placeholder="Ex.: falar com a Dra. Ana sobre a proposta de acordo"
                  className="w-full mt-2 outline-none" style={{ fontFamily: F.ui, fontSize: 17, lineHeight: 1.45, color: S.ink, background: S.papel, borderRadius: 12, padding: 12, border: "none", resize: "vertical" }} />
        <p style={{ fontFamily: F.ui, fontSize: 13, color: S.texto2, marginTop: 4 }}>Só você vê. Não vai para o Legal One nem para a equipe.</p>
        <div className="flex gap-2 mt-3">
          <div className="flex-1"><Botao onClick={salvar}>Salvar</Botao></div>
          <div className="flex-1"><Botao variante="secundario" onClick={() => setEditando(false)}>Cancelar</Botao></div>
        </div>
        {nota && <button onClick={() => { salvarNota(chave, ""); setEditando(false); }} className="mt-3" style={{ ...LINK, fontFamily: F.ui, fontSize: 15, color: S.risco }}>Apagar anotação</button>}
      </div>
    );
  }
  if (!nota) {
    return (
      <button onClick={abrir} className="mt-3 w-full text-left flex items-center gap-3" style={{ ...CARD, padding: "12px 16px", boxShadow: "none", background: "transparent", border: `1.5px dashed ${S.linha}` }}>
        <span style={{ fontFamily: F.ui, fontSize: 22, color: S.texto2, lineHeight: 1 }}>+</span>
        <span style={{ fontFamily: F.ui, fontSize: 16, color: S.ink }}>Adicionar anotação pessoal</span>
      </button>
    );
  }
  return (
    <button onClick={abrir} className="mt-3 w-full text-left" style={{ ...CARD, padding: 16, background: S.osso, boxShadow: "none" }} aria-label="Editar sua anotação">
      <span className="flex items-center gap-1.5" style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 600, color: S.ossoTexto2 }}>
        <PersonIcon size={15} color={S.ossoTexto2} /> Sua anotação · {nota.atualizado}
      </span>
      <span className="block" style={{ fontFamily: F.ui, fontSize: 17, color: S.ink, lineHeight: 1.45, marginTop: 4, whiteSpace: "pre-wrap" }}>{nota.texto}</span>
      <span className="block" style={{ fontFamily: F.ui, fontSize: 14, color: S.ossoTexto2, marginTop: 6, textDecoration: "underline", textUnderlineOffset: 3 }}>Toque para editar</span>
    </button>
  );
}

/* ------------------------- Alertas --------------------------------- */
const proc = (id) => PROCESSOS_LISTA.find((p) => p.id === id);
const TIPOS_ALERTA = {
  processo_parado: {
    atual: (a) => proc(a.processoId)?.diasParado ?? 0,
    disparou: (a) => (proc(a.processoId)?.diasParado ?? 0) >= a.limite,
    texto: (a) => `${proc(a.processoId)?.cliente}: avisar se "${proc(a.processoId)?.desc}" ficar ${a.limite} dias ou mais sem movimentação`,
    aviso: (a) => `"${proc(a.processoId)?.desc}" está há ${proc(a.processoId)?.diasParado} dias sem movimentação`,
    cliente: (a) => proc(a.processoId)?.cliente,
    alvo: (a) => ({ kind: "processo", id: a.processoId }),
  },
  bloqueio_cliente: {
    atual: (a) => resumoOrg(a.orgId).bloqueadoAtivo,
    disparou: (a) => resumoOrg(a.orgId).bloqueadoAtivo > a.limite,
    texto: (a) => `${ORGS[a.orgId].name}: avisar se o valor bloqueado passar de ${fmtBRL(a.limite)}`,
    aviso: (a) => `O valor bloqueado passou de ${fmtBRL(a.limite)}: hoje são ${fmtBRL(resumoOrg(a.orgId).bloqueadoAtivo)}`,
    cliente: (a) => ORGS[a.orgId].name,
    alvo: (a) => ({ kind: "org", id: a.orgId }),
  },
  passivo_contrato: {
    atual: (a) => resumoContrato(a.orgId, a.orgao).passivo.total,
    disparou: (a) => resumoContrato(a.orgId, a.orgao).passivo.total > a.limite,
    texto: (a) => `${ORGS[a.orgId].name} · ${a.orgao}: avisar se o passivo passar de ${fmtBRL(a.limite)}`,
    aviso: (a) => `O passivo do contrato com ${a.orgao} passou de ${fmtBRL(a.limite)}: hoje são ${fmtBRL(resumoContrato(a.orgId, a.orgao).passivo.total)}`,
    cliente: (a) => ORGS[a.orgId].name,
    alvo: (a) => ({ kind: "contrato", id: a.orgId, orgao: a.orgao }),
  },
};
const mesmoAlvo = (a, b) => a.tipo === b.tipo && a.processoId === b.processoId && a.orgId === b.orgId && a.orgao === b.orgao;

// Valores sugeridos acima do atual, arredondados (50 mil abaixo de 1 mi, 100 mil acima).
function sugestoesValor(atual) {
  const passo = atual >= 1e6 ? 100000 : 50000;
  const r = (v) => Math.max(passo, Math.ceil(v / passo) * passo);
  return [...new Set([r(atual * 1.1), r(atual * 1.25), r(atual * 1.5)])];
}

function JanelaAlerta({ base, titulo, onFechar }) {
  const { criarAlerta } = usePessoal();
  const t = TIPOS_ALERTA[base.tipo];
  const dias = base.tipo === "processo_parado";
  const atual = t.atual(base);
  const opcoes = dias ? [30, 60, 90, 120] : sugestoesValor(atual);
  const [limite, setLimite] = useState(opcoes[dias ? 1 : 0]);
  const [outro, setOutro] = useState("");
  const valorFinal = outro ? Number(String(outro).replace(/\D/g, "")) : limite;
  return (
    <div className="absolute inset-0" style={{ zIndex: 60 }}>
      <button aria-label="Fechar" onClick={onFechar} className="absolute inset-0" style={{ background: "rgba(40,34,24,.38)" }} />
      <div role="dialog" aria-label={titulo} className="guia-sheet absolute left-0 right-0 bottom-0" style={{ background: S.cartao, borderRadius: "24px 24px 0 0", padding: "10px 24px 34px" }}>
        <div className="mx-auto" style={{ width: 40, height: 5, borderRadius: 3, background: S.linha }} />
        <p className="flex items-center gap-2 mt-4" style={{ fontFamily: F.ui, fontSize: 19, fontWeight: 600, color: S.ink }}><BellIcon size={20} color={S.ink} /> {titulo}</p>
        <p style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2, marginTop: 6 }}>Hoje: {dias ? `${atual} dias sem movimentação` : fmtBRL(atual)}</p>
        <p style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.ink, marginTop: 16 }}>{dias ? "Avisar quando ficar parado" : "Avisar quando passar de"}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {opcoes.map((v) => {
            const on = !outro && limite === v;
            return (
              <button key={v} onClick={() => { setOutro(""); setLimite(v); }} aria-pressed={on} className="rounded-full"
                      style={{ height: 44, padding: "0 16px", fontFamily: F.ui, fontSize: 16, fontWeight: 600, background: on ? S.marca : S.papel, color: on ? "#FFFFFF" : S.ink }}>
                {dias ? `${v} dias` : fmtBRL(v)}
              </button>
            );
          })}
        </div>
        {!dias && (
          <label className="flex items-center gap-2 mt-3" style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2 }}>
            Outro valor (R$)
            <input id="alerta-outro" inputMode="numeric" value={outro} onChange={(e) => setOutro(e.target.value.replace(/\D/g, ""))} placeholder="ex.: 1500000"
                   className="flex-1 min-w-0 outline-none" style={{ height: 44, borderRadius: 12, padding: "0 12px", fontFamily: F.ui, fontSize: 16, color: S.ink, background: S.papel, border: "none" }} />
          </label>
        )}
        <div className="mt-5">
          <Botao disabled={!valorFinal} onClick={() => { criarAlerta({ ...base, limite: valorFinal }); onFechar(); }}>Criar alerta</Botao>
        </div>
        <p style={{ fontFamily: F.ui, fontSize: 13, color: S.texto2, marginTop: 10, textAlign: "center" }}>O aviso aparece em Notificações. No app real, chega também no celular.</p>
      </div>
    </div>
  );
}

/* Botão "Avisar se…" usado nas telas de processo, bloqueios e contrato */
function BotaoAlerta({ base, rotulo, titulo }) {
  const { alertas } = usePessoal();
  const [aberto, setAberto] = useState(false);
  const existente = alertas.find((a) => mesmoAlvo(a, base));
  return (
    <>
      <button onClick={() => setAberto(true)} className="w-full text-left flex items-center gap-3 mt-3" style={{ ...CARD, padding: "12px 16px" }}>
        <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: existente ? S.resolvidoFundo : "#EFEBE2" }}>
          <BellIcon size={18} color={existente ? S.resolvido : S.ink} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block" style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink }}>{existente ? "Alerta ativo" : rotulo}</span>
          {existente && <span className="block" style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2 }}>{base.tipo === "processo_parado" ? `Parado ${existente.limite} dias ou mais` : `Acima de ${fmtBRL(existente.limite)}`} · toque para mudar</span>}
        </span>
      </button>
      {aberto && <JanelaAlerta base={base} titulo={titulo} onFechar={() => setAberto(false)} />}
    </>
  );
}

/* Perfil → Meus alertas */
function MeusAlertas({ onBack }) {
  const { alertas, removerAlerta, alternarAlerta } = usePessoal();
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-6" style={{ paddingBottom: 60 }}>
      <Faixa onBack={onBack} backLabel="Perfil" titulo="Meus alertas" sub={alertas.length ? `${alertas.filter((a) => a.ativo).length} ligados` : "Nenhum alerta ainda"} />
      {alertas.length === 0 ? (
        <p style={{ fontFamily: F.ui, fontSize: 16, color: S.texto2, lineHeight: 1.5 }}>
          Crie um alerta na tela de um processo ("Avisar se ficar parado"), nos bloqueios de uma organização ou num contrato de gestão. Também dá para pedir à IA: "me avise se o bloqueio da FAS passar de R$ 900 mil".
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {alertas.map((a) => {
            const t = TIPOS_ALERTA[a.tipo];
            return (
              <div key={a.id} style={{ ...CARD, padding: 16 }}>
                <div className="flex items-start justify-between gap-3">
                  <p style={{ fontFamily: F.ui, fontSize: 16, color: S.ink, lineHeight: 1.4 }}>{t.texto(a)}</p>
                  <Toggle on={a.ativo} onChange={() => alternarAlerta(a.id)} label="Alerta ligado" />
                </div>
                <p style={{ fontFamily: F.ui, fontSize: 14, color: a.disparadoEm ? S.atencao : S.texto2, fontWeight: a.disparadoEm ? 600 : 400, marginTop: 6 }}>
                  {a.disparadoEm ? `Disparou ${a.disparadoEm}` : "Ainda não disparou"}
                </p>
                <button onClick={() => removerAlerta(a.id)} className="mt-2" style={{ ...LINK, fontFamily: F.ui, fontSize: 15, color: S.risco }}>Apagar</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* Perfil → Personalizar Início */
function PersonalizarInicio({ onBack, ordem, setOrdem, blocos, padrao }) {
  const mover = (i, d) => { const o = [...ordem]; [o[i], o[i + d]] = [o[i + d], o[i]]; setOrdem(o); };
  const destaque = ordem.find((x) => x.visivel)?.id; // o primeiro bloco visível fica em carvão no Início
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-6" style={{ paddingBottom: 60 }}>
      <Faixa onBack={onBack} backLabel="Perfil" titulo="Personalizar Início" sub="Escolha o que aparece e em que ordem" />
      <div style={CARD}>
        {ordem.map((b, i) => (
          <div key={b.id} className="flex items-center gap-2" style={{ padding: "10px 12px 10px 16px", borderBottom: i === ordem.length - 1 ? "none" : `1px solid ${S.linha}` }}>
            <span className="flex-1 min-w-0">
              <span className="block" style={{ fontFamily: F.ui, fontSize: 16, color: b.visivel ? S.ink : S.texto2, fontWeight: 500 }}>{blocos[b.id]}</span>
              {b.id === destaque && (
                <span className="inline-flex items-center gap-1.5 mt-1" style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 600, color: S.ink }}>
                  <span style={{ width: 12, height: 12, borderRadius: 4, background: S.marca }} aria-hidden="true" /> Em destaque
                </span>
              )}
            </span>
            <button onClick={() => mover(i, -1)} disabled={i === 0} aria-label={`Subir ${blocos[b.id]}`} className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: i === 0 ? "transparent" : S.papel, opacity: i === 0 ? 0.3 : 1 }}><ChevronUpIcon size={20} color={S.ink} strokeWidth={2} /></button>
            <button onClick={() => mover(i, 1)} disabled={i === ordem.length - 1} aria-label={`Descer ${blocos[b.id]}`} className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: i === ordem.length - 1 ? "transparent" : S.papel, opacity: i === ordem.length - 1 ? 0.3 : 1 }}><ChevronDownIcon size={20} color={S.ink} strokeWidth={2} /></button>
            <Toggle on={b.visivel} onChange={() => setOrdem(ordem.map((x) => (x.id === b.id ? { ...x, visivel: !x.visivel } : x)))} label={`Mostrar ${blocos[b.id]}`} />
          </div>
        ))}
      </div>
      <SecLabel>Dica</SecLabel>
      <p style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2, lineHeight: 1.5 }}>A saudação e o seu nome ficam sempre no topo. O primeiro bloco aparece em destaque, em carvão. O que você esconder continua disponível pela busca e pelas outras abas.</p>
      <div className="mt-4"><Botao variante="secundario" onClick={() => setOrdem(padrao)}>Voltar ao padrão</Botao></div>
    </div>
  );
}

export { Anotacao, BotaoAlerta, MeusAlertas, PersonalizarInicio, PessoalContext, TIPOS_ALERTA, mesmoAlvo, usePessoal };
