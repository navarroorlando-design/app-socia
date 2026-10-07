import React, { useState, useEffect } from "react";
import { BackIcon, IconeSem, SparkleIcon } from "../componentes/icones";
import { Botao, Cartao, Etiqueta, Secao } from "../componentes/ui";
import { F, S, SEMANTICA } from "../estilo/tokens";

function GuiaEstilo({ onBack }) {
  const [filtros, setFiltros] = useState(new Set(["AFNE"]));
  const [toast, setToast] = useState(null);
  const [sheet, setSheet] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const toastTimer = React.useRef(null);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  const mostrarToast = (t) => { setToast(t); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(null), 2600); };
  const toggleFiltro = (f) => setFiltros((p) => { const n = new Set(p); n.has(f) ? n.delete(f) : n.add(f); return n; });

  const rotulo = { fontFamily: F.ui, fontSize: 13, fontWeight: 600, color: S.texto2, letterSpacing: ".01em" };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative" style={{ background: S.papel }}>
      <div className="flex items-center px-6 pt-3 pb-1 shrink-0">
        <button onClick={onBack} aria-label="Voltar" className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: S.cartao }}>
          <BackIcon size={18} color={S.ink} />
        </button>
        <span className="ml-3" style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2 }}>Perfil</span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-3" style={{ paddingBottom: 80 }}>
        <p style={rotulo}>Sistema visual · versão 4</p>
        <h1 style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 34, fontWeight: 500, color: S.ink, lineHeight: 1.08, marginTop: 6, textWrap: "balance" }}>Guia de estilo</h1>
        <p style={{ fontFamily: F.ui, fontSize: 17, color: S.texto2, lineHeight: 1.45, marginTop: 10 }}>
          A base que vai para todas as telas: tipos, cores com significado e componentes. Todos os textos passam de 4,5:1 de contraste.
        </p>

        {/* ---------------- Tipografia ---------------- */}
        <Secao titulo="Tipografia" nota="Uma família só, a Lexend, desenhada para facilitar a leitura. A hierarquia vem do tamanho e do peso. Números de processo usam a fonte de dados.">
          <Cartao>
            <div className="flex flex-col gap-4">
              <div>
                <p style={rotulo}>Título de tela · Lexend 34 seminegrito</p>
                <p style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 34, fontWeight: 500, color: S.ink, lineHeight: 1.1 }}>O que mudou</p>
              </div>
              <div>
                <p style={rotulo}>Valor em destaque · Lexend 40 seminegrito</p>
                <p style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 40, fontWeight: 600, color: S.ink, lineHeight: 1, fontVariantNumeric: "lining-nums tabular-nums" }}>R$ 1.639.000</p>
              </div>
              <div>
                <p style={rotulo}>Subtítulo de seção · Lexend 18 seminegrito</p>
                <p style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 22, fontWeight: 500, color: S.ink }}>Contratos de gestão</p>
              </div>
              <div>
                <p style={rotulo}>Texto de leitura · Lexend 17</p>
                <p style={{ fontFamily: F.ui, fontSize: 17, color: S.ink, lineHeight: 1.45 }}>A liquidação foi homologada e o valor segue bloqueado até a expedição do alvará.</p>
              </div>
              <div>
                <p style={rotulo}>Rótulo · Lexend 15 seminegrito</p>
                <p style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.ink }}>Execução trabalhista em fase de liquidação</p>
              </div>
              <div>
                <p style={rotulo}>Apoio · Lexend 15</p>
                <p style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2 }}>Última movimentação há 3 dias</p>
              </div>
              <div>
                <p style={rotulo}>Dados · IBM Plex Mono 15</p>
                <p style={{ fontFamily: F.dados, fontSize: 15, color: S.ink }}>0260884-61.2023.5.01.0032</p>
              </div>
            </div>
          </Cartao>
        </Secao>

        {/* ---------------- Cores ---------------- */}
        <Secao titulo="Cores com significado" nota="Cada cor quer dizer uma coisa só, e sempre vem com ícone e palavra. O número ao lado é o contraste do texto sobre o cartão branco.">
          <Cartao style={{ padding: 0 }}>
            {SEMANTICA.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3" style={{ padding: "14px 18px", borderTop: i ? `1px solid ${S.linha}` : "none" }}>
                <div className="flex-1 min-w-0">
                  <Etiqueta s={s} />
                  <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 6, lineHeight: 1.35 }}>{s.uso}</p>
                </div>
                <span style={{ fontFamily: F.dados, fontSize: 13, color: S.ink }}>{s.ratio}</span>
              </div>
            ))}
          </Cartao>
          <Cartao style={{ marginTop: 12, background: S.iaFundo, boxShadow: "none" }}>
            <div className="flex items-start gap-3">
              <span className="shrink-0" style={{ marginTop: 1 }}><SparkleIcon size={20} color={S.iaIcone} strokeWidth={1.8} /></span>
              <div>
                <p style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.ia }}>Dourado é só da IA</p>
                <p style={{ fontFamily: F.ui, fontSize: 15, color: S.ink, lineHeight: 1.45, marginTop: 4 }}>Tudo em dourado foi gerado pela IA: resumos, relatórios e a barra de perguntas. Status nunca usa dourado.</p>
              </div>
            </div>
          </Cartao>
          <div className="flex gap-3 mt-3">
            {[["Fundo", S.papel, "cinza-gelo"], ["Cartão", S.cartao, "branco"], ["Texto", S.ink, "17,7:1"], ["Apoio", S.texto2, "7,6:1"]].map(([n, c, d]) => (
              <div key={n} className="flex-1 min-w-0">
                <div style={{ height: 44, borderRadius: 12, background: c, boxShadow: `inset 0 0 0 1px ${S.linha}` }} />
                <p style={{ fontFamily: F.ui, fontSize: 13, fontWeight: 600, color: S.ink, marginTop: 6 }}>{n}</p>
                <p style={{ fontFamily: F.dados, fontSize: 12, color: S.texto2 }}>{d}</p>
              </div>
            ))}
          </div>
        </Secao>

        {/* ---------------- Cartões coloridos ---------------- */}
        <Secao titulo="Cartões coloridos" nota="A cor do cartão sempre quer dizer algo. Branco é o padrão; os outros três aparecem só quando têm motivo.">
          <div className="flex flex-col gap-3">
            <div style={{ background: S.ink, borderRadius: 20, padding: 20, color: "#FFFFFF" }}>
              <p style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: "#CDC7BB" }}>Escuro · o número principal da tela</p>
              <p style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 34, fontWeight: 500, marginTop: 4 }}>3 processos</p>
              <p style={{ fontFamily: F.ui, fontSize: 15, color: "#E4E7EA", marginTop: 4 }}>No máximo um por tela.</p>
            </div>
            <div style={{ background: S.riscoFundo, borderRadius: 24, padding: 18 }}>
              <div className="flex items-center justify-between gap-3">
                <p style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.ink }}>Semântico · o cartão é sobre um status</p>
              </div>
              <p style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 28, fontWeight: 500, color: S.ink, marginTop: 6 }}>R$ 62.000</p>
              <div className="mt-2"><Etiqueta s={SEMANTICA[0]} texto="Bloqueio ativo" /></div>
            </div>
            <div style={{ background: S.iaFundo, borderRadius: 24, padding: 18 }}>
              <p className="flex items-center gap-1.5" style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 700, color: S.ia }}>
                <SparkleIcon size={15} color={S.ia} strokeWidth={2} /> Dourado · gerado pela IA
              </p>
              <p style={{ fontFamily: F.ui, fontSize: 16, color: S.ink, marginTop: 6, lineHeight: 1.45 }}>Resumos e conclusões dos relatórios.</p>
            </div>
            <Cartao>
              <p style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.ink }}>Branco · todo o resto</p>
              <p style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2, marginTop: 4 }}>Listas, navegação e dados de apoio.</p>
            </Cartao>
          </div>
        </Secao>

        {/* ---------------- Botões ---------------- */}
        <Secao titulo="Botões" nota="50pt de altura, fáceis de acertar. A hierarquia vem do preenchimento, não da cor.">
          <div className="flex flex-col gap-3">
            <Botao onClick={() => mostrarToast("Processo seguido")}>Seguir processo</Botao>
            <Botao variante="secundario" onClick={() => mostrarToast("Lista aberta")}>Ver todos os bloqueios</Botao>
            <Botao variante="ia" onClick={() => { setCarregando(true); setTimeout(() => setCarregando(false), 2200); }}>
              <SparkleIcon size={17} color={S.ia} strokeWidth={2} /> Resumir com a IA
            </Botao>
            <Botao variante="destrutivo" onClick={() => mostrarToast("Relatório removido da pasta")}>Remover relatório</Botao>
            <div className="flex gap-3">
              <div className="flex-1"><Botao disabled>Desabilitado</Botao></div>
              <div className="flex-1"><Botao loading>Enviando</Botao></div>
            </div>
            <div className="flex justify-center"><Botao variante="terciario" full={false}>Marcar todas como lidas</Botao></div>
          </div>
        </Secao>

        {/* ---------------- Indicadores ---------------- */}
        <Secao titulo="Cartão de indicador" nota="A seta e a cor seguem o significado para o escritório: bloqueio que sobe é ruim, mesmo indo para cima.">
          <div className="grid grid-cols-2 gap-3">
            <Cartao>
              <p style={rotulo}>Bloqueado hoje</p>
              <p style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 26, fontWeight: 500, color: S.ink, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>R$ 350 mil</p>
              <p className="flex items-center gap-1 mt-2" style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 600, color: S.risco }}>
                <span aria-hidden="true">▲</span> 12% no mês
              </p>
            </Cartao>
            <Cartao>
              <p style={rotulo}>Parados há 60 dias</p>
              <p style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 26, fontWeight: 500, color: S.ink, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>14</p>
              <p className="flex items-center gap-1 mt-2" style={{ fontFamily: F.ui, fontSize: 14, fontWeight: 600, color: S.resolvido }}>
                <span aria-hidden="true">▼</span> 3 a menos
              </p>
            </Cartao>
          </div>
        </Secao>

        {/* ---------------- Alerta ---------------- */}
        <Secao titulo="Faixa de alerta" nota="Aparece no topo da tela quando algo pede atenção, sempre com uma ação.">
          <div style={{ background: S.riscoFundo, borderRadius: 16, padding: 16 }} role="status">
            <div className="flex gap-3">
              <IconeSem tipo="alerta" cor={S.risco} size={20} />
              <div className="flex-1">
                <p style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.risco }}>3 processos da AFNE parados há mais de 90 dias</p>
                <button className="mt-2" style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, color: S.ink, textDecoration: "underline", textUnderlineOffset: 4 }}>Ver quais são</button>
              </div>
            </div>
          </div>
        </Secao>

        {/* ---------------- Linha de processo ---------------- */}
        <Secao titulo="Linha de processo" nota="Rótulo forte, apoio legível e etiqueta de status alinhada à direita.">
          <Cartao style={{ padding: 0 }}>
            {[
              { c: "AFNE", d: "Execução trabalhista em fase de liquidação", n: "0260884-61.2023.5.01.0032", s: SEMANTICA[2], t: "Em execução" },
              { c: "Instituto Gnosis", d: "Ação cível de cobrança", n: "0817452-33.2024.8.19.0001", s: SEMANTICA[1], t: "Aguardando" },
              { c: "FAS", d: "Mandado de segurança", n: "0042871-90.2025.8.19.0001", s: SEMANTICA[0], t: "Parado 94 dias" },
            ].map((r, i) => (
              <div key={i} style={{ padding: "14px 18px", borderTop: i ? `1px solid ${S.linha}` : "none" }}>
                <div className="flex items-start justify-between gap-3">
                  <p style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink }}>{r.c}</p>
                  <Etiqueta s={r.s} texto={r.t} />
                </div>
                <p style={{ fontFamily: F.ui, fontSize: 15, color: S.ink, marginTop: 2, lineHeight: 1.35 }}>{r.d}</p>
                <p style={{ fontFamily: F.dados, fontSize: 13, color: S.texto2, marginTop: 4 }}>{r.n}</p>
              </div>
            ))}
          </Cartao>
        </Secao>

        {/* ---------------- Chips ---------------- */}
        <Secao titulo="Chips de filtro" nota="Toque para ligar e desligar. O selecionado ganha fundo escuro e marca de check.">
          <div className="flex flex-wrap gap-2">
            {["AFNE", "Instituto Gnosis", "FAS", "IGEDES", "Trabalhista", "Com bloqueio"].map((f) => {
              const on = filtros.has(f);
              return (
                <button key={f} onClick={() => toggleFiltro(f)} aria-pressed={on}
                        className="inline-flex items-center gap-1.5 rounded-full"
                        style={{ fontFamily: F.ui, fontSize: 15, fontWeight: 600, height: 40, padding: "0 14px", background: on ? S.ink : S.cartao, color: on ? "#FFFFFF" : S.ink, boxShadow: on ? "none" : `inset 0 0 0 1.5px ${S.linha}` }}>
                  {on && <IconeSem tipo="check" cor="#FFFFFF" size={14} />}{f}
                </button>
              );
            })}
          </div>
        </Secao>

        {/* ---------------- Carregamento IA ---------------- */}
        <Secao titulo="Carregamento da IA" nota="No lugar de só escrever Pensando, a tela já mostra o formato do relatório que vai chegar. Toque em Resumir com a IA, lá em Botões, para ver.">
          <Cartao>
            {carregando ? (
              <div aria-live="polite" aria-label="A IA está montando o relatório">
                <div className="guia-skel" style={{ width: "40%", height: 14 }} />
                <div className="guia-skel" style={{ width: "70%", height: 34, marginTop: 10 }} />
                <div className="guia-skel" style={{ width: "100%", height: 90, marginTop: 16 }} />
                <div className="guia-skel" style={{ width: "85%", height: 14, marginTop: 16 }} />
                <div className="guia-skel" style={{ width: "60%", height: 14, marginTop: 8 }} />
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <span className="shrink-0" style={{ marginTop: 2 }}><SparkleIcon size={18} color={S.iaIcone} strokeWidth={1.8} /></span>
                <p style={{ fontFamily: F.ui, fontSize: 16, color: S.ink, lineHeight: 1.45 }}>O pico de bloqueios da AFNE foi em julho, puxado por dois processos trabalhistas.</p>
              </div>
            )}
          </Cartao>
        </Secao>

        {/* ---------------- Sheet e toast ---------------- */}
        <Secao titulo="Painel inferior e aviso" nota="O painel reúne ações sem tirar a sócia da tela. O aviso confirma o que aconteceu e some sozinho.">
          <div className="flex flex-col gap-3">
            <Botao variante="secundario" onClick={() => setSheet(true)}>Abrir painel de filtros</Botao>
            <Botao variante="secundario" onClick={() => mostrarToast("Relatório fixado")}>Mostrar aviso</Botao>
          </div>
        </Secao>
      </div>

      {/* toast */}
      {toast && (
        <div className="absolute left-6 right-6 flex justify-center" style={{ bottom: 36, zIndex: 40 }} role="status" aria-live="polite">
          <div className="guia-toast inline-flex items-center gap-2" style={{ background: S.ink, color: "#FFFFFF", fontFamily: F.ui, fontSize: 16, fontWeight: 600, padding: "13px 18px", borderRadius: 14, boxShadow: "0 8px 24px rgba(40,34,24,.25)" }}>
            <IconeSem tipo="check" cor="#7FD3A4" size={17} />{toast}
          </div>
        </div>
      )}

      {/* bottom sheet */}
      {sheet && (
        <div className="absolute inset-0" style={{ zIndex: 50 }}>
          <button aria-label="Fechar painel" onClick={() => setSheet(false)} className="absolute inset-0" style={{ background: "rgba(40,34,24,.38)" }} />
          <div role="dialog" aria-label="Filtros" className="guia-sheet absolute left-0 right-0 bottom-0" style={{ background: S.cartao, borderRadius: "24px 24px 0 0", padding: "10px 24px 34px" }}>
            <div className="mx-auto" style={{ width: 40, height: 5, borderRadius: 3, background: S.linha }} />
            <h3 style={{ fontFamily: F.display, letterSpacing: "-0.02em", fontSize: 24, fontWeight: 500, color: S.ink, marginTop: 14 }}>Filtrar processos</h3>
            <p style={{ ...rotulo, marginTop: 16 }}>Status</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {SEMANTICA.slice(0, 4).map((s) => <Etiqueta key={s.id} s={s} />)}
            </div>
            <p style={{ ...rotulo, marginTop: 18 }}>Ordenar por</p>
            {["Mais parados primeiro", "Maior valor bloqueado", "Movimentação mais recente"].map((o, i) => (
              <label key={o} className="flex items-center justify-between" style={{ padding: "13px 0", borderTop: i ? `1px solid ${S.linha}` : "none", fontFamily: F.ui, fontSize: 17, color: S.ink }}>
                {o}
                <input type="radio" name="ordem" defaultChecked={i === 0} style={{ width: 22, height: 22, accentColor: S.ink }} />
              </label>
            ))}
            <div className="mt-4"><Botao onClick={() => { setSheet(false); mostrarToast("Filtros aplicados"); }}>Aplicar filtros</Botao></div>
          </div>
        </div>
      )}
    </div>
  );
}

export { GuiaEstilo };
