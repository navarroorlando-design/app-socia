import React, { useState } from "react";
import { ChartIcon, FlagIcon, FolderIcon, LockIcon, SunIcon } from "../componentes/icones";
import { Faixa, SecLabel, Toggle } from "../componentes/ui";
import { LINK, S, T } from "../estilo/tokens";

const NOTIF_TYPES = {
  movimentacao: { label: "Movimentação", Icon: FolderIcon, color: "#245476" },
  bloqueio: { label: "Bloqueio levantado", Icon: LockIcon, color: "#24603F" },
  reclamacao: { label: "Reclamação", Icon: FlagIcon, color: "#835000" },
  relatorio: { label: "Relatório da IA", Icon: ChartIcon, color: "#765614" },
  resumo: { label: "Resumo diário", Icon: SunIcon, color: "#4F565B" },
};

const INITIAL_NOTIFS = [
  { id: "n1", type: "movimentacao", cliente: "Instituto Gnosis", text: "Decisão interlocutória publicada na ação cível de cobrança", time: "40 min", group: "Hoje", read: false, target: { kind: "processo", id: "p2" } },
  { id: "n2", type: "bloqueio", cliente: "AFNE", text: "Bloqueio de R$ 18.400 foi levantado", time: "3 h", group: "Hoje", read: false, target: { kind: "bloqueio", id: "b1" } },
  { id: "n3", type: "relatorio", cliente: "Instituto Gnosis", text: "Relatório fixado de bloqueios ativos foi atualizado", time: "5 h", group: "Hoje", read: false, target: { kind: "report", id: "pin-gnosis" } },
  { id: "n4", type: "resumo", cliente: null, text: "4 movimentações ontem nos processos que você acompanha", time: "8:00", group: "Ontem", read: true, target: { kind: "acompanhando" } },
  { id: "n5", type: "reclamacao", cliente: "FAS", text: "Nova reclamação constitucional protocolada no STF", time: "ontem", group: "Ontem", read: true, target: { kind: "org", id: "fas" } },
  { id: "n6", type: "movimentacao", cliente: "AFNE", text: "Audiência trabalhista remarcada na ação declaratória", time: "4 dias", group: "Anteriores", read: true, target: { kind: "processo", id: "p4" } },
];

function NotificacoesCentral({ notifs, onOpen, onMarkAll, onBack }) {
  const [filter, setFilter] = useState("todas");
  const unread = notifs.filter((n) => !n.read).length;
  const visible = filter === "todas" ? notifs : notifs.filter((n) => !n.read);
  const groups = ["Hoje", "Ontem", "Anteriores"].map((g) => [g, visible.filter((n) => n.group === g)]).filter(([, items]) => items.length);

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
        <Faixa bleed={32} onBack={onBack} backLabel="Início" titulo="Notificações"
               sub={
                 <div className="flex flex-col items-start gap-2 mt-1">
                   <span>{unread === 0 ? "Tudo lido" : unread === 1 ? "1 não lida" : `${unread} não lidas`}</span>
                   <div className="flex gap-1 p-1 rounded-full mt-1" style={{ background: "#FFFFFF", boxShadow: "0 1px 3px rgba(17,24,39,.08)" }}>
                     {[["todas", "Todas"], ["nao-lidas", "Não lidas"]].map(([id, label]) => (
                       <button key={id} onClick={() => setFilter(id)} aria-pressed={filter === id} className="text-[15px] px-4 py-2 rounded-full whitespace-nowrap font-semibold"
                               style={filter === id ? { background: S.ink, color: "#FFFFFF" } : { color: S.ink }}>{label}</button>
                     ))}
                   </div>
                   {unread > 0 && (
                     <button onClick={onMarkAll} className="text-[15px] py-1.5 font-semibold" style={LINK}>Marcar todas como lidas</button>
                   )}
                 </div>
               } />
        {groups.length === 0 && (
          <p className="text-[16px] mt-6" style={{ color: T.muted }}>Tudo lido. Novas movimentações aparecem aqui.</p>
        )}
        {groups.map(([g, items]) => (
          <div key={g}>
            <p className="text-[14px] mt-5 mb-1" style={{ color: T.muted }}>{g}</p>
            {items.map((n, i) => {
              const t = NOTIF_TYPES[n.type];
              return (
                <button key={n.id} onClick={() => onOpen(n)} className="w-full text-left flex items-start gap-3 py-3.5"
                        style={{ borderBottom: i === items.length - 1 ? "none" : `1px solid ${T.hairline}` }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 relative" style={{ background: `${t.color}1A` }}>
                    <t.Icon size={17} color={t.color} />
                    {!n.read && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" style={{ background: T.brass, border: `2px solid ${T.paper}` }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[14px]" style={{ color: t.color }}>{t.label}</p>
                      <span className="text-[13px] shrink-0" style={{ color: T.muted }}>{n.time}</span>
                    </div>
                    <p className={`text-[16px] leading-snug mt-0.5 ${n.read ? "" : "font-medium"}`}>
                      {n.cliente && <span className="font-medium">{n.cliente}: </span>}{n.text}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

function NotifPrefs({ onBack }) {
  const [prefs, setPrefs] = useState({ acompanhados: true, bloqueios: true, reclamacoes: true, relatorios: true, resumo: true, firma: false });
  const flip = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }));
  const items = [
    ["acompanhados", "Processos que acompanho", "Qualquer movimentação nos processos com estrela."],
    ["bloqueios", "Bloqueios", "Novos bloqueios e levantamentos de valores."],
    ["reclamacoes", "Reclamações constitucionais", "Protocolos e julgamentos no STF."],
    ["relatorios", "Relatórios fixados", "Quando um número de um relatório fixado mudar."],
  ];
  const ToggleRow = ([k, title, desc], last) => (
    <div key={k} className="flex items-center gap-4 py-4" style={{ borderBottom: last ? "none" : `1px solid ${T.hairline}` }}>
      <div className="flex-1">
        <p className="text-[17px]">{title}</p>
        <p className="text-[14px] mt-0.5 leading-snug" style={{ color: T.muted }}>{desc}</p>
      </div>
      <Toggle on={prefs[k]} onChange={() => flip(k)} label={title} />
    </div>
  );

  return (
    <>
      <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
        <Faixa bleed={32} onBack={onBack} backLabel="Perfil" titulo="Notificações" sub="Escolha sobre o que quer ser avisada" />

        <SecLabel>Me avise sobre</SecLabel>
        {items.map((it, i) => ToggleRow(it, i === items.length - 1))}

        <SecLabel>Resumo</SecLabel>
        {ToggleRow(["resumo", "Resumo diário", "Um único aviso por dia com tudo o que mudou, em vez de vários."], !prefs.resumo)}
        {prefs.resumo && (
          <div className="flex items-center justify-between py-4">
            <p className="text-[17px]">Horário</p>
            <span className="text-[17px] px-3 py-1.5 rounded-lg" style={{ background: "#FFFFFF", fontVariantNumeric: "tabular-nums" }}>8:00</span>
          </div>
        )}

        <SecLabel>Abrangência</SecLabel>
        {ToggleRow(["firma", "Toda a firma", "Movimentações de todos os 1.245 processos. Pode gerar muitos avisos por dia."], true)}
      </div>
    </>
  );
}

export { INITIAL_NOTIFS, NotifPrefs, NotificacoesCentral };
