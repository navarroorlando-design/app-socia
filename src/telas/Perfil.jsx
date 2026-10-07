import React, { useState } from "react";
import { BellIcon, BuildingIcon, ChevronIcon, FolderIcon, Icon, PersonIcon, SparkleIcon, StarIcon } from "../componentes/icones";
import { Botao, Faixa, Row, SecLabel, Toggle } from "../componentes/ui";
import { ORGS } from "../dados/base";
import { CARD, F, LINK, S } from "../estilo/tokens";
import { Avatar, ESCALAS, INICIAIS } from "../preferencias";

function MenuVA({ unread, followedCount, onClose, onNotificacoes, onAcompanhando, onPerfil, foto, apelido }) {
  const Item = ({ icon, label, value, onClick, last }) => (
    <button onClick={onClick} className="flex items-center gap-3 w-full text-left" style={{ padding: "16px 4px", borderBottom: last ? "none" : `1px solid ${S.linha}` }}>
      {icon}
      <span style={{ fontFamily: F.ui, fontSize: 17, color: S.ink, flex: 1 }}>{label}</span>
      {value}
      <ChevronIcon size={16} color={S.texto2} strokeWidth={2} />
    </button>
  );
  return (
    <div className="absolute inset-0" style={{ zIndex: 60 }}>
      <button aria-label="Fechar menu" onClick={onClose} className="absolute inset-0" style={{ background: "rgba(40,34,24,.38)" }} />
      <div role="dialog" aria-label="Menu da conta" className="guia-sheet absolute left-0 right-0 bottom-0" style={{ background: S.cartao, borderRadius: "24px 24px 0 0", padding: "10px 24px 36px" }}>
        <div className="mx-auto" style={{ width: 40, height: 5, borderRadius: 3, background: S.linha }} />
        <div className="flex items-center gap-3 mt-4 mb-2">
          <Avatar foto={foto} size={52} />
          <div>
            <p style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 22, fontWeight: 500, color: S.ink }}>{apelido || "Sócia"}</p>
            <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2 }}>Azevedo dos Reis Advogados</p>
          </div>
        </div>
        <Item icon={<BellIcon size={21} color={S.ink} />} label="Notificações" onClick={onNotificacoes}
              value={unread > 0 ? <span style={{ background: S.risco, color: "#FFFFFF", fontFamily: F.ui, fontSize: 13, fontWeight: 700, borderRadius: 999, padding: "2px 9px" }}>{unread} novas</span> : null} />
        <Item icon={<StarIcon size={20} color={S.ink} />} label="Processos que acompanho" onClick={onAcompanhando}
              value={<span style={{ fontFamily: F.ui, fontSize: 16, color: S.texto2 }}>{followedCount}</span>} />
        <Item icon={<PersonIcon size={21} color={S.ink} />} label="Perfil e preferências" onClick={onPerfil} last />
      </div>
    </div>
  );
}

function PerfilUsuaria({ onOpenNotifPrefs, onOpenPasta, pinnedCount, onOpenGuia, onOpenOrdem, foto, setFoto, apelido, setApelido, escala, setEscala, lerVoz, setLerVoz }) {
  const fileRef = React.useRef(null);
  const [aviso, setAviso] = useState("");
  const [rascunho, setRascunho] = useState(apelido);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);

  const escolherFoto = (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    if (!/^image\//.test(f.type)) { setAviso("Escolha um arquivo de imagem (JPG ou PNG)."); return; }
    const img = new Image();
    const url = URL.createObjectURL(f);
    img.onload = () => {
      const lado = 256, c = document.createElement("canvas");
      c.width = lado; c.height = lado;
      const ctx = c.getContext("2d");
      const m = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, lado, lado);
      URL.revokeObjectURL(url);
      setFoto(c.toDataURL("image/jpeg", 0.85)); setAviso("Foto atualizada.");
    };
    img.onerror = () => { URL.revokeObjectURL(url); setAviso("Não foi possível abrir essa imagem. Tente outra."); };
    img.src = url;
  };

  const salvarApelido = () => { setApelido(rascunho.trim()); setAviso(rascunho.trim() ? `Saudação atualizada para "${rascunho.trim()}".` : "Saudação sem nome."); };
  const rotulo = { fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.texto2 };

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar px-6" style={{ paddingBottom: 120 }}>
        <Faixa eyebrow="Sua conta" titulo="Perfil" tituloSize={36}>
        {/* identidade no bloco marinho, como o cartão principal do Início */}
        <div className="flex items-center gap-4" style={{ background: S.marca, borderRadius: 24, padding: 22, boxShadow: "0 10px 24px rgba(31,30,26,.22)" }}>
          <Avatar foto={foto} size={72} claro />
          <div className="min-w-0">
            <p style={{ fontFamily: F.titulo, letterSpacing: "-0.02em", fontSize: 24, fontWeight: 600, color: "#FFFFFF", lineHeight: 1.15 }}>{apelido || "Sócia"}</p>
            <p style={{ fontFamily: F.ui, fontSize: 15, color: S.marcaTexto2, marginTop: 4, lineHeight: 1.35 }}>Azevedo dos Reis Advogados &amp; Associados</p>
          </div>
        </div>
        <div className="mt-3" style={{ ...CARD, padding: 20 }}>
          <input ref={fileRef} id="foto-perfil" type="file" accept="image/*" className="hidden" onChange={escolherFoto} />
          <div className="flex gap-2">
            <div className="flex-1"><Botao variante="secundario" onClick={() => fileRef.current?.click()}>{foto ? "Trocar foto" : "Adicionar foto"}</Botao></div>
            {foto && <div className="flex-1"><Botao variante="terciario" onClick={() => { setFoto(null); setAviso("Foto removida. As iniciais voltaram."); }}>Remover</Botao></div>}
          </div>

          <label htmlFor="apelido" className="block mt-5" style={rotulo}>Como prefere ser chamada</label>
          <div className="flex gap-2 mt-2">
            <input id="apelido" value={rascunho} onChange={(e) => setRascunho(e.target.value)} placeholder="Ex.: Dra. Vanessa" maxLength={30}
                   className="flex-1 min-w-0 outline-none" style={{ height: 50, borderRadius: 14, padding: "0 14px", fontFamily: F.ui, fontSize: 17, color: S.ink, background: "#FFFDF9", boxShadow: `inset 0 0 0 1.5px #9A958A` }} />
            <button onClick={salvarApelido} disabled={rascunho.trim() === apelido}
                    style={{ height: 50, borderRadius: 14, padding: "0 18px", fontFamily: F.ui, fontSize: 17, fontWeight: 600, background: rascunho.trim() === apelido ? "#E6E1D6" : S.ink, color: rascunho.trim() === apelido ? "#6B675E" : "#FFFFFF" }}>
              Salvar
            </button>
          </div>
          <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 6 }}>Aparece na saudação do Início.</p>

          <button onClick={() => setMostrarCadastro((v) => !v)} className="mt-4 text-left" style={{ ...LINK, fontFamily: F.ui, fontSize: 15 }}>
            {mostrarCadastro ? "Ocultar dados do cadastro" : "Ver nome do cadastro"}
          </button>
          {mostrarCadastro && (
            <div className="mt-3" style={{ background: S.papel, borderRadius: 14, padding: 14 }}>
              <p style={rotulo}>Nome no cadastro do escritório</p>
              <p style={{ fontFamily: F.ui, fontSize: 17, color: S.ink, marginTop: 2 }}>Iniciais {INICIAIS}</p>
              <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 6, lineHeight: 1.4 }}>
                O nome vem do login do escritório e não muda por aqui. Se estiver errado, peça a correção ao administrador do sistema.
              </p>
            </div>
          )}
          {aviso && <p role="status" style={{ fontFamily: F.ui, fontSize: 15, color: S.resolvido, marginTop: 12, fontWeight: 600 }}>{aviso}</p>}
        </div>

        </Faixa>

        {/* Leitura */}
        <SecLabel>Leitura</SecLabel>
        <div style={{ ...CARD, padding: 20 }}>
          <p style={{ fontFamily: F.ui, fontSize: 17, color: S.ink, fontWeight: 600 }}>Tamanho do texto</p>
          <div className="grid grid-cols-3 gap-2 mt-3" role="radiogroup" aria-label="Tamanho do texto">
            {ESCALAS.map((e, i) => {
              const on = escala === e.id;
              return (
                <button key={e.id} role="radio" aria-checked={on} onClick={() => setEscala(e.id)} className="flex flex-col items-center justify-center rounded-2xl"
                        style={{ height: 76, background: on ? S.ink : S.papel, color: on ? "#FFFFFF" : S.ink }}>
                  <span style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 20 + i * 6, fontWeight: 600, lineHeight: 1 }}>A</span>
                  <span style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 600, marginTop: 6 }}>{e.rotulo}</span>
                </button>
              );
            })}
          </div>
          <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 10 }}>Vale para todas as telas do app.</p>

          <div className="flex items-center gap-4 mt-5 pt-5" style={{ borderTop: `1px solid ${S.linha}` }}>
            <div className="flex-1">
              <p style={{ fontFamily: F.ui, fontSize: 17, color: S.ink, fontWeight: 600 }}>Ouvir os resumos da IA</p>
              <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 2, lineHeight: 1.4 }}>Mostra o botão Ouvir nos resumos e conclusões.</p>
            </div>
            <Toggle on={lerVoz} onChange={() => setLerVoz(!lerVoz)} label="Ouvir os resumos da IA" />
          </div>
        </div>

        {/* Organização */}
        <SecLabel>Organização</SecLabel>
        <div style={CARD}>
          <Row icon={<FolderIcon color={S.ink} />} label="Relatórios fixados" value={String(pinnedCount)} onClick={onOpenPasta} />
          <Row icon={<BuildingIcon color={S.ink} />} label="Ordem dos clientes" onClick={onOpenOrdem} />
          <Row icon={<BellIcon color={S.ink} />} label="Notificações" onClick={onOpenNotifPrefs} last />
        </div>

        <SecLabel>Sobre</SecLabel>
        <div style={CARD}>
          <Row icon={<Icon color={S.ink}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></Icon>} label="Segurança" />
          <Row icon={<SparkleIcon color={S.ink} />} label="Guia de estilo" onClick={onOpenGuia} last />
        </div>
      </div>
    </>
  );
}

function OrdemClientes({ ordem, setOrdem, onBack }) {
  const mover = (i, d) => {
    const j = i + d; if (j < 0 || j >= ordem.length) return;
    const n = [...ordem]; [n[i], n[j]] = [n[j], n[i]]; setOrdem(n);
  };
  const SetaBtn = ({ label, onClick, disabled, path }) => (
    <button onClick={onClick} disabled={disabled} aria-label={label} className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: disabled ? "transparent" : S.papel, opacity: disabled ? 0.3 : 1 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={S.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path} /></svg>
    </button>
  );
  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar px-6" style={{ paddingBottom: 60 }}>
        <Faixa onBack={onBack} backLabel="Perfil" titulo="Ordem dos clientes" sub="Os primeiros aparecem no topo da aba OS." />
        <div style={CARD}>
          {ordem.map((id, i) => (
            <div key={id} className="flex items-center gap-3" style={{ padding: "12px 14px 12px 18px", borderBottom: i === ordem.length - 1 ? "none" : `1px solid ${S.linha}` }}>
              <span style={{ fontFamily: F.dados, fontSize: 15, color: S.texto2, width: 18 }}>{i + 1}</span>
              <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: S.ink, color: "#FFFFFF", fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 14 }}>{ORGS[id].initials}</span>
              <span style={{ fontFamily: F.ui, fontSize: 17, color: S.ink, flex: 1, fontWeight: 600 }}>{ORGS[id].name}</span>
              <SetaBtn label={`Subir ${ORGS[id].name}`} onClick={() => mover(i, -1)} disabled={i === 0} path="M6 15l6-6 6 6" />
              <SetaBtn label={`Descer ${ORGS[id].name}`} onClick={() => mover(i, 1)} disabled={i === ordem.length - 1} path="M6 9l6 6 6-6" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export { MenuVA, OrdemClientes, PerfilUsuaria };
