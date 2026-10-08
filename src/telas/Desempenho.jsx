import React from "react";
import { Faixa, SecLabel } from "../componentes/ui";
import { ENCERRADOS_2026, ORG_ORDER, ORGS, CLIENTE_NOME } from "../dados/base";
import { CARD, DADOS, F, S } from "../estilo/tokens";
import { MarcaOrg } from "../componentes/MarcaOrg";

/* ------------------------------------------------------------------ */
/* Desempenho: resultado dos processos encerrados em 2026. Separada do  */
/* Passivo no redesenho v3 (Passo 6); o conteúdo em si (índice de êxito, */
/* por cliente) ainda é o mesmo — a reconstrução com os 4 cartões de     */
/* indicador e os gráficos da seção B.7 é o Passo 7.                    */
/* ------------------------------------------------------------------ */
// Categorias simplificadas: o que o encerramento significou para o escritório/cliente.
// Nesta base de exemplo, por QUANTIDADE de processos. A unidade certa (quantidade ou valor)
// e os nomes das categorias ainda precisam ser validados com o escritório.
// Paleta de dados (DADOS), não as cores de status: resultado de processo não é "risco" nem "atenção"
// da interface, é um dado com legenda própria (consolidacao.md, item 16).
const RESULTADOS = [
  { id: "Favorável", nome: "Favorável", cor: DADOS.fav },
  { id: "Acordo", nome: "Acordo", cor: DADOS.aco },
  { id: "Desfavorável", nome: "Desfavorável", cor: DADOS.desf },
];

function Desempenho({ onBack }) {
  const total = ENCERRADOS_2026.length;
  const porResultado = RESULTADOS.map((r) => ({ ...r, n: ENCERRADOS_2026.filter((e) => e.resultado === r.id).length }));
  const pctFavoravel = total ? Math.round(((porResultado[0].n + porResultado[1].n) / total) * 100) : 0;
  const porCliente = ORG_ORDER
    .map((id) => ({ id, n: ENCERRADOS_2026.filter((e) => e.clienteId === id).length, porResultado: RESULTADOS.map((r) => ENCERRADOS_2026.filter((e) => e.clienteId === id && e.resultado === r.id).length) }))
    .filter((o) => o.n > 0);
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-8" style={{ paddingBottom: 60 }}>
      <Faixa bleed={32} onBack={onBack} backLabel="Início" eyebrow="Todos os clientes" titulo="Desempenho"
             sub={`${total} processos encerrados em 2026`} />
      {total === 0 ? (
        <p style={{ fontFamily: F.ui, fontSize: 16, color: S.texto2, lineHeight: 1.5 }}>Nenhum processo encerrado em 2026 ainda.</p>
      ) : (
        <>
          <div style={{ ...CARD, padding: 18 }}>
            <p style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2 }}>Índice de êxito em 2026</p>
            <p style={{ fontFamily: F.ui, fontSize: 36, fontWeight: 600, color: S.ink, letterSpacing: "-0.03em", marginTop: 2 }}>{pctFavoravel}%</p>
            <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, marginTop: 2 }}>{total} processos encerrados · favorável ou com acordo</p>
            <div className="flex mt-4" style={{ height: 16, gap: 2 }}>
              {porResultado.map((r) => r.n > 0 && (
                <span key={r.id} style={{ flex: r.n, background: r.cor, borderRadius: 4 }} />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
              {porResultado.map((r) => (
                <span key={r.id} className="inline-flex items-center gap-1.5" style={{ fontFamily: F.ui, fontSize: 14, color: S.ink }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: r.cor }} />{r.nome} · {r.n}
                </span>
              ))}
            </div>
          </div>

          <SecLabel>Por cliente</SecLabel>
          <div className="flex flex-col gap-3">
            {porCliente.map((o) => (
              <div key={o.id} style={{ ...CARD, padding: 16 }}>
                <div className="flex items-center gap-3">
                  <MarcaOrg id={o.id} iniciais={ORGS[o.id].initials} size={36} />
                  <span className="flex-1 min-w-0" style={{ fontFamily: F.ui, fontSize: 16, fontWeight: 600, color: S.ink }}>{CLIENTE_NOME[o.id]}</span>
                  <span style={{ fontFamily: F.ui, fontSize: 15, color: S.texto2 }}>{o.n} {o.n === 1 ? "encerrado" : "encerrados"}</span>
                </div>
                <div className="flex mt-3" style={{ height: 10, gap: 2 }}>
                  {RESULTADOS.map((r, i) => o.porResultado[i] > 0 && <span key={r.id} style={{ flex: o.porResultado[i], background: r.cor, borderRadius: 3 }} />)}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: F.ui, fontSize: 14, color: S.texto2, lineHeight: 1.45, marginTop: 14 }}>
            Favorável: pedido improcedente, extinção ou desistência da parte contrária. Acordo: encerrado por acordo homologado.
            Desfavorável: pedido julgado procedente. Contagem por quantidade de processos, não por valor. Dados de exemplo.
          </p>
        </>
      )}
    </div>
  );
}

export { Desempenho };
