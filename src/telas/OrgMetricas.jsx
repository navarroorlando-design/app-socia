import React from "react";
import { ChevronIcon, DownloadIcon, FolderIcon, LockIcon } from "../componentes/icones";
import { Badge, Etiqueta, Faixa, KPIs, LinhaLista, SecLabel } from "../componentes/ui";
import { ORGS } from "../dados/base";
import { fmtBRL, fmtBRLCurto, fmtData } from "../dados/formato";
import { ORDEM_PROGNOSTICO, resumoContrato, resumoOrg } from "../dados/passivo";
import { CARD, F, S, SEMANTICA, semDe } from "../estilo/tokens";
import { Anotacao, BotaoAlerta } from "../pessoal";

/* ------------------------------------------------------------------ */
/* Organização: contratos de gestão (passivo), bloqueios e processos   */
/* ------------------------------------------------------------------ */
const sem = (id) => SEMANTICA.find((x) => x.id === id);
const SEM_PROGNOSTICO = { Provável: sem("risco"), Possível: sem("atencao"), Remoto: sem("inativo") };
const NOTA_PASSIVO = "Passivo estimado: soma do valor em discussão nos processos do contrato, pelo prognóstico do advogado. Bloqueios são o que já saiu da conta. Dados de exemplo.";

/* Barra empilhada do passivo por prognóstico, com legenda em palavras */
function PassivoBarra({ passivo, legenda = true }) {
  const total = passivo.total || 1;
  return (
    <div>
      <div className="flex w-full overflow-hidden" style={{ height: 10, borderRadius: 999, background: S.linha, gap: 2 }}
           role="img" aria-label={ORDEM_PROGNOSTICO.map((k) => `${k}: ${fmtBRL(passivo[k])}`).join(", ")}>
        {ORDEM_PROGNOSTICO.filter((k) => passivo[k] > 0).map((k) => (
          <span key={k} style={{ width: `${(passivo[k] / total) * 100}%`, background: SEM_PROGNOSTICO[k].cor }} />
        ))}
      </div>
      {legenda && (
        <div className="flex flex-col gap-1.5 mt-3">
          {ORDEM_PROGNOSTICO.map((k) => (
            <div key={k} className="flex items-center gap-2">
              <span className="shrink-0" style={{ width: 10, height: 10, borderRadius: 3, background: SEM_PROGNOSTICO[k].cor }} />
              <span style={{ fontFamily: F.ui, fontSize: 15, color: S.ink, flex: 1 }}>{k}</span>
              <span style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.ink, fontVariantNumeric: "tabular-nums" }}>{fmtBRL(passivo[k])}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Cartão de um contrato de gestão: o passivo é a primeira coisa */
function ContratoCard({ c, onClick, comCliente }) {
  return (
    <button onClick={onClick} className="w-full text-left" style={{ ...CARD, padding: 18 }}
            aria-label={`${c.orgao}: passivo estimado ${fmtBRL(c.passivo.total)}, ${c.processos.length} processos`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {comCliente && <p style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 600, color: S.texto2, marginBottom: 2 }}>{ORGS[c.orgId].name}</p>}
          <p style={{ fontFamily: F.ui, fontSize: 17, fontWeight: 600, color: S.ink, lineHeight: 1.3 }}>{c.orgao}</p>
          <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 2 }}>Vigência {c.vigencia}</p>
        </div>
        <ChevronIcon size={18} color={S.texto2} strokeWidth={2} />
      </div>
      <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 14 }}>Passivo estimado</p>
      <p style={{ fontFamily: F.ui, fontSize: 26, fontWeight: 600, color: S.ink, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", marginBottom: 10 }}>{fmtBRL(c.passivo.total)}</p>
      <PassivoBarra passivo={c.passivo} legenda={false} />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-3">
        <span style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2 }}>{c.processos.length} processos · {fmtBRLCurto(c.bloqueadoAtivo)} bloqueado</span>
        <Etiqueta s={sem(c.vigenciaStatus.id)} texto={c.vigenciaStatus.texto} />
      </div>
    </button>
  );
}

const Nota = ({ children }) => <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, lineHeight: 1.45, marginTop: 14 }}>{children}</p>;

/* Lista de processos com valor e prognóstico */
function ListaProcessos({ processos, onOpenProcesso }) {
  return (
    <div style={CARD}>
      {processos.map((p, i) => (
        <LinhaLista key={p.id} onClick={() => onOpenProcesso(p)} last={i === processos.length - 1} sem={semDe(p.status)}
                    icone={<FolderIcon size={18} color={semDe(p.status).cor} />} titulo={p.desc}
                    detalhe={`${p.area} · ${p.valorCausa ? fmtBRL(p.valorCausa) : "sem valor"} · prognóstico ${p.prognostico.toLowerCase()}`}
                    abaixo={<Badge text={p.status} />} />
      ))}
    </div>
  );
}

function ListaBloqueios({ bloqueios, onOpenBloqueio, comContrato }) {
  return (
    <div style={CARD}>
      {bloqueios.map((b, i) => (
        <LinhaLista key={b.id} onClick={() => onOpenBloqueio(b)} last={i === bloqueios.length - 1} sem={semDe(b.status)}
                    icone={<LockIcon size={18} color={semDe(b.status).cor} />} titulo={<span style={{ fontSize: 17, fontVariantNumeric: "tabular-nums" }}>{b.valor}</span>}
                    detalhe={comContrato ? `${b.contrato} · ${fmtData(b.data)}` : `Bloqueado em ${fmtData(b.data)}`} direita={<Badge text={b.status} />} />
      ))}
    </div>
  );
}

/* Linhas "por contrato" usadas nas telas de bloqueios e processos */
function PorContrato({ linhas, onOpenContrato }) {
  return (
    <div style={CARD}>
      {linhas.map(([orgao, valor, detalhe], i) => (
        <button key={orgao} onClick={() => onOpenContrato(orgao)} className="w-full text-left flex items-center gap-3"
                style={{ padding: "14px 16px", borderBottom: i === linhas.length - 1 ? "none" : `1px solid ${S.linha}` }}>
          <div className="flex-1 min-w-0">
            <p style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink }}>{orgao}</p>
            <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 2 }}>{detalhe}</p>
          </div>
          <span style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink, fontVariantNumeric: "tabular-nums" }}>{valor}</span>
          <ChevronIcon size={16} color={S.texto2} strokeWidth={2} />
        </button>
      ))}
    </div>
  );
}

/* ---------------- Tela: contratos de gestão da organização ---------------- */
function ContratosOrg({ orgId, onBack, onOpenContrato, onEnviarCliente }) {
  const o = ORGS[orgId], r = resumoOrg(orgId);
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
      <Faixa bleed={32} bloco onBack={onBack} backLabel={o.name} eyebrow={`${o.name} · passivo estimado`}
             titulo={fmtBRL(r.passivo.total)} tituloCompacto="Contratos de gestão" tituloSize={36}
             sub={`${r.contratos.length} contratos de gestão · ${r.processos.length} processos`}>
        <div style={{ ...CARD, padding: 18 }}><PassivoBarra passivo={r.passivo} /></div>
      </Faixa>
      <SecLabel>Por contrato de gestão</SecLabel>
      <div className="flex flex-col gap-3">
        {r.contratos.map((c) => <ContratoCard key={c.orgao} c={c} onClick={() => onOpenContrato(c.orgao)} />)}
      </div>
      {onEnviarCliente && (
        <button onClick={onEnviarCliente} className="w-full inline-flex items-center justify-center gap-2 mt-4"
                style={{ height: 52, borderRadius: 14, fontFamily: F.ui, fontSize: 17, fontWeight: 600, background: S.cartao, color: S.ink, boxShadow: `inset 0 0 0 1.5px ${S.ink}` }}>
          <DownloadIcon size={20} color={S.ink} /> Relatório para o cliente (PDF)
        </button>
      )}
      <Nota>{NOTA_PASSIVO}</Nota>
    </div>
  );
}

/* ---------------- Tela: um contrato de gestão ---------------- */
function ContratoDetalhe({ orgId, orgao, onBack, backLabel, onOpenProcesso, onOpenBloqueio, onEnviarCliente }) {
  const o = ORGS[orgId], c = resumoContrato(orgId, orgao);
  const porArea = ["Trabalhista", "Cível", "Administrativo", "Constitucional"]
    .map((a) => [a, c.processos.filter((p) => p.area === a)])
    .filter(([, ps]) => ps.length)
    .map(([a, ps]) => [a, ps.reduce((s, p) => s + p.valorCausa, 0), ps.length]);
  const maxArea = Math.max(...porArea.map((x) => x[1]), 1);
  const processos = [...c.processos].sort((a, b) => b.valorCausa - a.valorCausa);
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
      <Faixa bleed={32} bloco onBack={onBack} backLabel={backLabel} eyebrow={`${o.name} · contrato de gestão`}
             titulo={orgao} tituloCompacto={orgao} tituloSize={28}
             sub={<span className="flex flex-col items-start gap-2"><span>Vigência {c.vigencia}</span><Etiqueta s={sem(c.vigenciaStatus.id)} texto={c.vigenciaStatus.texto} sobreCor /></span>}>
        <div style={{ ...CARD, padding: 18 }}>
          <p style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2 }}>Passivo estimado</p>
          <p style={{ fontFamily: F.ui, fontSize: 34, fontWeight: 600, color: S.ink, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums", marginBottom: 12 }}>{fmtBRL(c.passivo.total)}</p>
          <PassivoBarra passivo={c.passivo} />
        </div>
        <div className="mt-3">
          <KPIs itens={[["Processos", String(c.processos.length)], ["Bloqueado", fmtBRLCurto(c.bloqueadoAtivo)], ["Levantado", fmtBRLCurto(c.levantado)]]} />
        </div>
      </Faixa>
      {onEnviarCliente && (
        <button onClick={onEnviarCliente} className="w-full inline-flex items-center justify-center gap-2 mt-4"
                style={{ height: 52, borderRadius: 14, fontFamily: F.ui, fontSize: 17, fontWeight: 600, background: S.cartao, color: S.ink, boxShadow: `inset 0 0 0 1.5px ${S.ink}` }}>
          <DownloadIcon size={20} color={S.ink} /> Relatório para o cliente (PDF)
        </button>
      )}
      <BotaoAlerta base={{ tipo: "passivo_contrato", orgId, orgao }} rotulo="Avisar se o passivo passar de um valor" titulo="Avisar sobre o passivo" />
      <Anotacao chave={`contrato:${orgId}:${orgao}`} sobre="este contrato" />

      {porArea.length > 0 && (
        <>
          <SecLabel>Passivo por área</SecLabel>
          <div className="flex flex-col gap-3.5" style={{ ...CARD, padding: 18 }}>
            {porArea.map(([a, v, n]) => (
              <div key={a}>
                <div className="flex items-baseline justify-between gap-2">
                  <span style={{ fontFamily: F.ui, fontSize: 15, color: S.ink }}>{a} <span style={{ color: S.texto2 }}>· {n}</span></span>
                  <span style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.ink, fontVariantNumeric: "tabular-nums" }}>{fmtBRLCurto(v)}</span>
                </div>
                <div className="mt-1.5" style={{ height: 8, borderRadius: 999, background: S.linha }}>
                  <div style={{ height: 8, borderRadius: 999, width: `${Math.max(2, (v / maxArea) * 100)}%`, background: S.oliva }} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <SecLabel>Processos deste contrato</SecLabel>
      {processos.length ? <ListaProcessos processos={processos} onOpenProcesso={onOpenProcesso} />
        : <p style={{ fontFamily: F.ui, fontSize: 16, color: S.texto2 }}>Nenhum processo ligado a este contrato.</p>}

      {c.bloqueios.length > 0 && (
        <>
          <SecLabel>Bloqueios deste contrato</SecLabel>
          <ListaBloqueios bloqueios={c.bloqueios} onOpenBloqueio={onOpenBloqueio} />
        </>
      )}
      <Nota>{NOTA_PASSIVO}</Nota>
    </div>
  );
}

/* ---------------- Tela: bloqueios da organização ---------------- */
function BloqueiosOrg({ orgId, onBack, onOpenContrato, onOpenBloqueio }) {
  const o = ORGS[orgId], r = resumoOrg(orgId);
  const pct = Math.round((r.levantado / ((r.levantado + r.bloqueadoAtivo) || 1)) * 100);
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
      <Faixa bleed={32} bloco onBack={onBack} backLabel={o.name} eyebrow={`${o.name} · bloqueado hoje`}
             titulo={fmtBRL(r.bloqueadoAtivo)} tituloCompacto="Bloqueios" tituloSize={36}
             sub={`${r.bloqueiosAtivos} bloqueios ativos via SISBAJUD`}>
        <KPIs itens={[["Ativo", fmtBRLCurto(r.bloqueadoAtivo)], ["Levantado", fmtBRLCurto(r.levantado)], ["Já liberado", `${pct}%`]]} />
        <BotaoAlerta base={{ tipo: "bloqueio_cliente", orgId }} rotulo="Avisar se o bloqueado passar de um valor" titulo="Avisar sobre bloqueios" />
      </Faixa>
      <SecLabel>Por contrato de gestão</SecLabel>
      <PorContrato onOpenContrato={onOpenContrato}
                   linhas={r.contratos.map((c) => [c.orgao, fmtBRLCurto(c.bloqueadoAtivo), `${c.bloqueiosAtivos} ativos · ${fmtBRLCurto(c.levantado)} levantado`])} />
      <SecLabel>Todos os bloqueios</SecLabel>
      <ListaBloqueios bloqueios={r.bloqueios} onOpenBloqueio={onOpenBloqueio} comContrato />
    </div>
  );
}

/* ---------------- Tela: processos da organização ---------------- */
function ProcessosOrg({ orgId, onBack, onOpenContrato, onOpenProcesso }) {
  const o = ORGS[orgId], r = resumoOrg(orgId);
  const conta = (a) => r.processos.filter((p) => p.area === a).length;
  const parados = r.processos.filter((p) => p.diasParado >= 60).length;
  const processos = [...r.processos].sort((a, b) => b.valorCausa - a.valorCausa);
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
      <Faixa bleed={32} bloco onBack={onBack} backLabel={o.name} eyebrow={`${o.name} · processos`}
             titulo={`${r.processos.length} processos`} tituloCompacto="Processos" tituloSize={36}
             sub={`${parados} parados há mais de 60 dias`}>
        <KPIs itens={[["Trabalhista", String(conta("Trabalhista"))], ["Cível", String(conta("Cível"))], ["Administr.", String(conta("Administrativo"))]]} />
      </Faixa>
      <SecLabel>Por contrato de gestão</SecLabel>
      <PorContrato onOpenContrato={onOpenContrato}
                   linhas={r.contratos.map((c) => [c.orgao, String(c.processos.length), `Passivo ${fmtBRLCurto(c.passivo.total)}`])} />
      <SecLabel>Todos, por valor em discussão</SecLabel>
      <ListaProcessos processos={processos} onOpenProcesso={onOpenProcesso} />
    </div>
  );
}

export { BloqueiosOrg, ContratoCard, ContratoDetalhe, ContratosOrg, NOTA_PASSIVO, PassivoBarra, ProcessosOrg };
