import React, { useState } from "react";
import { AjudaContext } from "../ajuda/Dica";
import { PASSOS_TOUR, PERGUNTAS, textoDaPergunta } from "../ajuda/conteudo";
import { ChevronDownIcon, ChevronIcon, ChevronUpIcon, DicaIcon, PlayIcon, SparkleIcon } from "../componentes/icones";
import { Botao, Faixa, SecLabel } from "../componentes/ui";
import { ORG_ORDER, PROCESSOS_LISTA } from "../dados/base";
import { CARD, F, S } from "../estilo/tokens";
import { OuvirBtn } from "../preferencias";
import { InicioFeed } from "./Inicio";
import { IaAsk } from "./Ia";
import { OsPerfil } from "./Organizacoes";
import { PerfilUsuaria } from "./Perfil";
import { ProcessoDetalhe } from "./ProcessoDetalhe";

/* ------------------------------------------------------------------ */
/* Tutorial do app: tour de boas-vindas e Perfil → Como usar o app.    */
/* As dicas de primeira vez ficam em src/ajuda/Dica.jsx.               */
/* ------------------------------------------------------------------ */
const nada = () => {};
const ESC = 0.5, LARG = 390;

/* Miniatura: a tela de verdade, reduzida e sem toque, com a parte que importa
   recortada por uma moldura clara (o resto fica mais escuro). Medidas em px da tela cheia. */
function Miniatura({ children, deslocar = 0, altura = 640, foco }) {
  return (
    <div aria-hidden="true" inert style={{ position: "relative", width: LARG * ESC + 12, height: altura * ESC + 12, borderRadius: 26, background: S.marca, padding: 6, flexShrink: 0 }}>
      <div style={{ position: "relative", width: LARG * ESC, height: altura * ESC, borderRadius: 20, overflow: "hidden", background: S.papel }}>
        <div className="flex flex-col" style={{ width: LARG, height: altura + deslocar, transform: `scale(${ESC}) translateY(${-deslocar}px)`, transformOrigin: "top left", pointerEvents: "none" }}>
          <AjudaContext.Provider value={{ vistas: [], marcar: nada, mini: true }}>{children}</AjudaContext.Provider>
        </div>
        {foco && (
          <div style={{ position: "absolute", left: foco.x * ESC, top: (foco.y - deslocar) * ESC, width: foco.w * ESC, height: foco.h * ESC,
                        borderRadius: 14, boxShadow: "0 0 0 3px #FFFFFF, 0 0 0 999px rgba(26,25,22,.45)" }} />
        )}
      </div>
    </div>
  );
}

function miniaturas({ apelido, foto, escala, lerVoz }) {
  const proc = PROCESSOS_LISTA[0];
  return {
    inicio: (
      <Miniatura foco={{ x: 16, y: 128, w: 358, h: 520 }}>
        <InicioFeed onOpenList={nada} onOpenProcessos={nada} onOpenOrg={nada} followedItems={PROCESSOS_LISTA.slice(0, 3)} onOpenProcesso={nada} onOpenBloqueio={nada}
          onOpenReclamacao={nada} onOpenAcompanhando={nada} onOpenBusca={nada} onOpenMenu={nada} onPerguntar={nada} unreadCount={0} foto={foto} apelido={apelido} />
      </Miniatura>
    ),
    os: (
      <Miniatura foco={{ x: 24, y: 230, w: 342, h: 252 }} deslocar={40}>
        <OsPerfil orgId={ORG_ORDER[0]} onBack={nada} sample={null} onAsk={nada} onOpenContratos={nada} onOpenContrato={nada}
          onOpenBloqueios={nada} onOpenProcessos={nada} onOpenReclamacoes={nada} />
      </Miniatura>
    ),
    ia: (
      <Miniatura foco={{ x: 12, y: 236, w: 366, h: 354 }}>
        <IaAsk onAsk={nada} sample={{}} conversa={null} onContinuar={nada} />
      </Miniatura>
    ),
    pessoal: (
      <Miniatura foco={{ x: 24, y: 330, w: 342, h: 290 }} deslocar={100}>
        <ProcessoDetalhe processo={proc} isFollowing={false} onToggleFollow={nada} onBack={nada} backLabel="Processos" sample={{}} />
      </Miniatura>
    ),
    perfil: (
      <Miniatura foco={{ x: 16, y: 560, w: 358, h: 300 }} altura={640} deslocar={420}>
        <PerfilUsuaria onOpenNotifPrefs={nada} onOpenSeguranca={nada} onOpenAlertas={nada} onOpenPersonalizar={nada} onOpenPasta={nada} pinnedCount={0}
          onOpenGuia={nada} onOpenOrdem={nada} onOpenAjuda={nada} foto={foto} setFoto={nada} apelido={apelido} setApelido={nada}
          escala={escala} setEscala={nada} lerVoz={lerVoz} setLerVoz={nada} />
      </Miniatura>
    ),
  };
}

/* ------------------------- Tour de boas-vindas ---------------------- */
function TourBoasVindas({ onFim, apelido, foto, escala, lerVoz }) {
  const [i, setI] = useState(0);
  const [minis] = useState(() => miniaturas({ apelido, foto, escala, lerVoz }));
  const p = PASSOS_TOUR[i], total = PASSOS_TOUR.length, ultimo = i === total - 1;
  return (
    <div className="flex-1 flex flex-col min-h-0" role="dialog" aria-label="Como usar o app">
      <div className="flex items-center justify-between px-6 shrink-0" style={{ minHeight: 52 }}>
        <p aria-live="polite" style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.texto2 }}>Passo {i + 1} de {total}</p>
        <button onClick={onFim} style={{ height: 44, padding: "0 4px", fontFamily: F.ui, fontSize: 17, fontWeight: 600, color: S.ink, textDecoration: "underline", textUnderlineOffset: 4 }}>
          Pular
        </button>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar px-6" style={{ paddingBottom: 12 }}>
        <div className="flex justify-center" style={{ background: S.osso, borderRadius: 24, padding: "18px 0" }}>{minis[p.id]}</div>
        <div className="flex justify-center gap-2 mt-4" aria-hidden="true">
          {PASSOS_TOUR.map((x, j) => (
            <span key={x.id} style={{ width: j === i ? 26 : 10, height: 10, borderRadius: 999, background: j === i ? S.ink : "#C9C2B3", transition: "width .2s" }} />
          ))}
        </div>
        <h1 style={{ fontFamily: F.titulo, fontSize: 28, fontWeight: 600, color: S.ink, letterSpacing: "-0.02em", lineHeight: 1.15, marginTop: 16 }}>{p.titulo}</h1>
        <p style={{ fontFamily: F.ui, fontSize: 17, color: S.ink, lineHeight: 1.5, marginTop: 8 }}>{p.texto}</p>
        <OuvirBtn key={p.id} texto={`${p.titulo}. ${p.texto}`} sempre />
      </div>
      <div className="flex gap-3 px-6 shrink-0" style={{ paddingTop: 10, paddingBottom: 30 }}>
        {i > 0 && <Botao variante="secundario" full={false} onClick={() => setI(i - 1)}>Voltar</Botao>}
        <div className="flex-1"><Botao onClick={() => (ultimo ? onFim() : setI(i + 1))}>{ultimo ? "Começar a usar" : "Próximo"}</Botao></div>
      </div>
    </div>
  );
}

/* ------------------------- Como usar o app -------------------------- */
function Pergunta({ p, aberta, onAlternar, onIr, last }) {
  const id = "resp-" + p.id;
  return (
    <div style={{ borderBottom: last ? "none" : `1px solid ${S.linha}` }}>
      <button onClick={onAlternar} aria-expanded={aberta} aria-controls={id} className="w-full text-left flex items-center gap-3" style={{ minHeight: 60, padding: "14px 18px" }}>
        <span className="flex-1" style={{ fontFamily: F.ui, fontSize: 17, fontWeight: 600, color: S.ink, lineHeight: 1.35 }}>{p.pergunta}</span>
        {aberta ? <ChevronUpIcon size={20} color={S.texto2} strokeWidth={2} /> : <ChevronDownIcon size={20} color={S.texto2} strokeWidth={2} />}
      </button>
      {aberta && (
        <div id={id} style={{ padding: "0 18px 18px" }}>
          {p.resposta && <p style={{ fontFamily: F.ui, fontSize: 17, color: S.ink, lineHeight: 1.5 }}>{p.resposta}</p>}
          {p.passos && (
            <ol className="flex flex-col gap-3" style={{ marginTop: p.resposta ? 12 : 0 }}>
              {p.passos.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex items-center justify-center shrink-0" style={{ width: 30, height: 30, borderRadius: 999, background: S.osso, fontFamily: F.ui, fontSize: 15, fontWeight: 700, color: S.ink }}>{i + 1}</span>
                  <span style={{ fontFamily: F.ui, fontSize: 17, color: S.ink, lineHeight: 1.45, paddingTop: 2 }}>{s}</span>
                </li>
              ))}
            </ol>
          )}
          <OuvirBtn texto={`${p.pergunta} ${textoDaPergunta(p)}`} sempre />
          {p.destino && (
            <div className="mt-3">
              <Botao variante="secundario" onClick={() => onIr(p.destino)}>{p.rotuloDestino} <ChevronIcon size={16} color={S.ink} strokeWidth={2} /></Botao>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ComoUsar({ onBack, onTour, onReativarDicas, onIr, onPerguntar }) {
  const [aberta, setAberta] = useState(null);
  const [aviso, setAviso] = useState("");
  const Acao = ({ Icone, titulo, detalhe, onClick, last }) => (
    <button onClick={onClick} className="w-full text-left flex items-center gap-3" style={{ padding: "14px 18px", minHeight: 64, borderBottom: last ? "none" : `1px solid ${S.linha}` }}>
      <span className="flex items-center justify-center shrink-0" style={{ width: 42, height: 42, borderRadius: 999, background: S.osso }}><Icone size={20} color={S.ink} strokeWidth={1.9} /></span>
      <span className="flex-1 min-w-0">
        <span className="block" style={{ fontFamily: F.ui, fontSize: 17, fontWeight: 600, color: S.ink }}>{titulo}</span>
        <span className="block" style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 2, lineHeight: 1.35 }}>{detalhe}</span>
      </span>
      <ChevronIcon size={16} color={S.texto2} strokeWidth={2} />
    </button>
  );
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-6" style={{ paddingBottom: 60 }}>
      <Faixa onBack={onBack} backLabel="Perfil" titulo="Como usar o app" sub="O passo a passo de cada função, quando precisar." />
      <div style={CARD}>
        <Acao Icone={PlayIcon} titulo="Ver o tour de boas-vindas" detalhe="Cinco telas com o essencial do app" onClick={onTour} />
        <Acao Icone={DicaIcon} titulo="Mostrar as dicas de novo" detalhe="Voltam a aparecer no alto de cada tela" last
              onClick={() => { onReativarDicas(); setAviso("Pronto. As dicas vão aparecer de novo nas telas."); }} />
      </div>
      {aviso && <p role="status" style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.resolvido, marginTop: 10 }}>{aviso}</p>}

      <SecLabel>Perguntas comuns</SecLabel>
      <div style={CARD}>
        {PERGUNTAS.map((p, i) => (
          <Pergunta key={p.id} p={p} aberta={aberta === p.id} onAlternar={() => setAberta(aberta === p.id ? null : p.id)} onIr={onIr} last={i === PERGUNTAS.length - 1} />
        ))}
      </div>

      <div className="mt-6" style={{ ...CARD, background: S.iaFundo, boxShadow: "none", padding: 20 }}>
        <p className="flex items-center gap-2" style={{ fontFamily: F.ui, fontSize: 17, fontWeight: 600, color: S.ia }}>
          <SparkleIcon size={20} color={S.ia} strokeWidth={1.9} /> Também dá para perguntar à IA
        </p>
        <p style={{ fontFamily: F.ui, fontSize: 16, color: S.ink, lineHeight: 1.45, marginTop: 6 }}>
          Por exemplo: “Como mando o relatório de passivo ao cliente?”. Ela explica o caminho em passos curtos.
        </p>
        <button onClick={onPerguntar} className="guia-btn w-full inline-flex items-center justify-center gap-2 mt-4"
                style={{ height: 50, borderRadius: 14, background: S.ia, color: "#FFFFFF", fontFamily: F.ui, fontSize: 17, fontWeight: 600 }}>
          <SparkleIcon size={18} color="#FFFFFF" strokeWidth={1.9} /> Perguntar à IA
        </button>
      </div>
    </div>
  );
}

export { ComoUsar, TourBoasVindas };
