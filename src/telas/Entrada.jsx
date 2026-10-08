import React, { useEffect, useState } from "react";
import { EscudoIcon, FaceIdIcon, SairIcon, SemInternetIcon } from "../componentes/icones";
import { Botao, Faixa, SecLabel, Toggle } from "../componentes/ui";
import { CARD, F, S } from "../estilo/tokens";
import { ESCALAS } from "../preferencias";

/* ------------------------------------------------------------------ */
/* Entrada no app: login, primeiro acesso, Face ID e tela de bloqueio  */
/* No protótipo, o login e o Face ID são simulados.                    */
/* ------------------------------------------------------------------ */
const Monograma = ({ tamanho = 84 }) => (
  <span className="flex flex-col items-center justify-center" style={{ width: tamanho, height: tamanho, borderRadius: tamanho * 0.26, background: S.marca }} aria-hidden="true">
    <span style={{ fontFamily: F.display, fontSize: tamanho * 0.36, fontWeight: 600, color: "#FFFFFF", letterSpacing: "-0.02em", lineHeight: 1 }}>AR</span>
    <span style={{ width: tamanho * 0.4, height: 3, borderRadius: 2, background: S.osso, marginTop: tamanho * 0.08 }} />
  </span>
);

const Tela = ({ children }) => (
  <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar px-8" style={{ paddingTop: 24, paddingBottom: 36 }}>{children}</div>
);

function Login({ onEntrar }) {
  const [entrando, setEntrando] = useState(false);
  const entrar = () => { setEntrando(true); setTimeout(onEntrar, 900); };
  return (
    <Tela>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <Monograma />
        <h1 style={{ fontFamily: F.titulo, fontSize: 32, fontWeight: 600, color: S.ink, marginTop: 22, letterSpacing: "-0.02em" }}>App dos Sócios</h1>
        <p style={{ fontFamily: F.ui, fontSize: 16, color: S.texto2, marginTop: 6 }}>Azevedo dos Reis Advogados &amp; Associados</p>
      </div>
      <div className="flex flex-col gap-3">
        <Botao onClick={entrar} loading={entrando}>{entrando ? "Entrando…" : "Entrar com a conta do escritório"}</Botao>
        <p className="flex items-start gap-2" style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, lineHeight: 1.45 }}>
          <EscudoIcon size={18} color={S.texto2} />
          <span>Só sócios do escritório têm acesso. O app apenas mostra informações: nada é alterado nos sistemas.</span>
        </p>
      </div>
    </Tela>
  );
}

function PrimeiroAcesso({ escala, setEscala, lerVoz, setLerVoz, onContinuar }) {
  return (
    <Tela>
      <h1 style={{ fontFamily: F.titulo, fontSize: 30, fontWeight: 600, color: S.ink, marginTop: 8, letterSpacing: "-0.02em", lineHeight: 1.15 }}>Como você prefere ler?</h1>
      <p style={{ fontFamily: F.ui, fontSize: 16, color: S.texto2, marginTop: 8, lineHeight: 1.45 }}>Escolha o tamanho do texto. Dá para mudar depois em Perfil.</p>
      <div className="grid grid-cols-3 gap-2 mt-5" role="radiogroup" aria-label="Tamanho do texto">
        {ESCALAS.map((e, i) => {
          const on = escala === e.id;
          return (
            <button key={e.id} role="radio" aria-checked={on} onClick={() => setEscala(e.id)} className="flex flex-col items-center justify-center gap-1 rounded-2xl"
                    style={{ height: 84, background: on ? S.ink : S.cartao, color: on ? "#FFFFFF" : S.ink, boxShadow: on ? "none" : CARD.boxShadow }}>
              <span style={{ fontFamily: F.display, fontSize: 20 + i * 6, fontWeight: 600, lineHeight: 1 }}>A</span>
              <span style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 600 }}>{e.rotulo}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-4" style={{ ...CARD, padding: 18 }}>
        <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2 }}>Prévia</p>
        <p style={{ fontFamily: F.ui, fontSize: 17, color: S.ink, lineHeight: 1.5, marginTop: 4 }}>A liquidação foi homologada e o valor segue bloqueado até a expedição do alvará.</p>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3" style={{ ...CARD, padding: 18 }}>
        <span>
          <span className="block" style={{ fontFamily: F.ui, fontSize: 17, fontWeight: 600, color: S.ink }}>Ouvir resumos</span>
          <span className="block" style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 2 }}>Mostra o botão "Ouvir" nos resumos da IA</span>
        </span>
        <Toggle on={lerVoz} onChange={() => setLerVoz(!lerVoz)} label="Ouvir resumos" />
      </div>
      <div className="flex-1" />
      <div className="mt-6"><Botao onClick={onContinuar}>Continuar</Botao></div>
    </Tela>
  );
}

function ConfigFaceId({ onAtivar, onPular }) {
  return (
    <Tela>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <span className="flex items-center justify-center" style={{ width: 96, height: 96, borderRadius: 28, background: S.cartao, boxShadow: CARD.boxShadow }}>
          <FaceIdIcon size={52} color={S.ink} strokeWidth={1.4} />
        </span>
        <h1 style={{ fontFamily: F.titulo, fontSize: 28, fontWeight: 600, color: S.ink, marginTop: 22, letterSpacing: "-0.02em", lineHeight: 1.2 }}>Abrir o app com Face ID</h1>
        <p style={{ fontFamily: F.ui, fontSize: 16, color: S.texto2, marginTop: 8, lineHeight: 1.45, maxWidth: 300 }}>
          Os dados dos clientes ficam protegidos se o celular estiver desbloqueado na mão de outra pessoa.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Botao onClick={onAtivar}>Ativar Face ID</Botao>
        <Botao variante="terciario" onClick={onPular}>Agora não</Botao>
        <p className="text-center" style={{ fontFamily: F.ui, fontSize: 13, color: S.texto2, marginTop: 4 }}>No protótipo, o Face ID é simulado.</p>
      </div>
    </Tela>
  );
}

function Bloqueio({ onDesbloquear }) {
  const [lendo, setLendo] = useState(false);
  const abrir = () => { setLendo(true); setTimeout(onDesbloquear, 800); };
  return (
    <Tela>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <Monograma tamanho={72} />
        <p style={{ fontFamily: F.ui, fontSize: 17, color: S.ink, marginTop: 18, fontWeight: 600 }}>App dos Sócios</p>
        <p style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2, marginTop: 4 }}>Bloqueado</p>
      </div>
      <button onClick={abrir} className="flex flex-col items-center gap-3 mx-auto" aria-label="Abrir com Face ID">
        <span className="flex items-center justify-center" style={{ width: 84, height: 84, borderRadius: 24, background: lendo ? S.resolvidoFundo : S.cartao, boxShadow: lendo ? "none" : CARD.boxShadow, transition: "background .2s" }}>
          <FaceIdIcon size={46} color={lendo ? S.resolvido : S.ink} strokeWidth={1.4} />
        </span>
        <span style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink }}>{lendo ? "Reconhecendo…" : "Toque para abrir com Face ID"}</span>
      </button>
    </Tela>
  );
}

/* Fluxo do primeiro acesso: login → leitura → Face ID */
function FluxoEntrada({ escala, setEscala, lerVoz, setLerVoz, onConcluir }) {
  const [passo, setPasso] = useState("login");
  if (passo === "login") return <Login onEntrar={() => setPasso("leitura")} />;
  if (passo === "leitura") return <PrimeiroAcesso escala={escala} setEscala={setEscala} lerVoz={lerVoz} setLerVoz={setLerVoz} onContinuar={() => setPasso("faceid")} />;
  return <ConfigFaceId onAtivar={() => onConcluir(true)} onPular={() => onConcluir(false)} />;
}

/* Perfil → Segurança */
function Seguranca({ onBack, faceId, setFaceId, onBloquear, onSair, semInternetSimulado, setSemInternetSimulado }) {
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-6" style={{ paddingBottom: 60 }}>
      <Faixa onBack={onBack} backLabel="Perfil" titulo="Segurança" sub="Como o app protege os dados dos clientes" />
      <div className="flex items-center justify-between gap-3" style={{ ...CARD, padding: 18 }}>
        <span className="flex items-start gap-3">
          <FaceIdIcon size={24} color={S.ink} />
          <span>
            <span className="block" style={{ fontFamily: F.ui, fontSize: 17, fontWeight: 600, color: S.ink }}>Abrir com Face ID</span>
            <span className="block" style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 2 }}>Pede o rosto sempre que o app abre</span>
          </span>
        </span>
        <Toggle on={faceId} onChange={() => setFaceId(!faceId)} label="Abrir com Face ID" />
      </div>
      <div className="flex flex-col gap-2 mt-3">
        {faceId && <Botao variante="secundario" onClick={onBloquear}>Bloquear agora</Botao>}
        <button onClick={onSair} className="w-full inline-flex items-center justify-center gap-2" style={{ height: 50, borderRadius: 14, fontFamily: F.ui, fontSize: 17, fontWeight: 600, color: S.risco, background: S.cartao, boxShadow: `inset 0 0 0 1.5px ${S.risco}` }}>
          <SairIcon size={20} color={S.risco} /> Sair da conta
        </button>
      </div>
      <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, lineHeight: 1.5, marginTop: 14 }}>
        Ao sair, o app volta para a tela de entrada. No app real, o acesso usa a conta do escritório e pode ser cortado pelo administrador.
      </p>
      <SecLabel>Para testar o protótipo</SecLabel>
      <div className="flex items-center justify-between gap-3" style={{ ...CARD, padding: 18 }}>
        <span className="flex items-start gap-3">
          <SemInternetIcon size={24} color={S.ink} />
          <span>
            <span className="block" style={{ fontFamily: F.ui, fontSize: 17, fontWeight: 600, color: S.ink }}>Simular sem internet</span>
            <span className="block" style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 2 }}>Mostra o aviso e desliga a IA</span>
          </span>
        </span>
        <Toggle on={semInternetSimulado} onChange={() => setSemInternetSimulado(!semInternetSimulado)} label="Simular sem internet" />
      </div>
    </div>
  );
}

/* Conexão: sem internet, o app segue mostrando os últimos dados e avisa desde quando */
function useConexao(simulado) {
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine !== false));
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  return online && !simulado;
}

function AvisoSemInternet({ desde }) {
  return (
    <div role="status" className="flex items-start gap-3 shrink-0" style={{ margin: "4px 16px 6px", padding: "10px 14px", borderRadius: 16, background: S.cartao, boxShadow: CARD.boxShadow }}>
      <SemInternetIcon size={20} color={S.atencao} strokeWidth={2} />
      <span style={{ fontFamily: F.ui, fontSize: 14, color: S.ink, lineHeight: 1.4 }}>
        <strong style={{ fontWeight: 600 }}>Sem internet.</strong> Mostrando os dados de hoje, {desde}. Atualiza sozinho quando a conexão voltar.
      </span>
    </div>
  );
}

export { AvisoSemInternet, Bloqueio, FluxoEntrada, Seguranca, useConexao };
