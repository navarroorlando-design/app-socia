import { useEffect, useState } from 'react';
import { Hn } from '../../domain/base';
import { ler, gravar } from '../../lib/store';
import { samplePromise } from '../../lib/claude';
import { ATENCAO } from './regras';
import type { ItemAtencao } from './regras';

const hoje = () => Hn.toISOString().slice(0, 10);
const CHAVE = 'pauta:atencao-ia';

const PROMPT = (candidatos: { idx: number; tipo: string; severidade: number; titulo: string; detalhe: string; valor: number }[]) => `Você vai montar a seção "Atenção agora" do Painel de um sócio de escritório de advocacia — a lista do que merece ação dele agora, não um resumo de tudo.

Abaixo estão os sinais que a base já calculou, cada um com um índice. Escolha até 8, na ordem real de prioridade para quem abre o Painel agora: considere urgência (tempo parado, prazo), risco (prognóstico, valor) e se vários sinais do mesmo cliente ou contrato formam um padrão que vale dizer junto (ex.: "3 dos 4 bloqueios do Instituto Gnosis estão sem pedido"). Pode reescrever o título e o detalhe de forma mais direta e pode agrupar sinais relacionados num só item, mas nunca invente número ou fato que não esteja nos sinais abaixo — cada item que você devolver precisa apontar para pelo menos um índice real.

Sinais:
${JSON.stringify(candidatos)}

Responda só com um array JSON, sem markdown, cada item assim: {"idx": <índice de um dos sinais acima>, "titulo"?: "...", "detalhe"?: "...", "severidade"?: 1|2|3}. Omita "titulo"/"detalhe"/"severidade" quando o original já estiver bom.`;

function parseResposta(texto: string, base: ItemAtencao[]): ItemAtencao[] | null {
  const m = texto.match(/\[[\s\S]*\]/);
  if (!m) return null;
  let bruto: unknown;
  try { bruto = JSON.parse(m[0]); } catch { return null; }
  if (!Array.isArray(bruto)) return null;
  const out: ItemAtencao[] = [];
  for (const item of bruto) {
    if (!item || typeof item !== 'object') continue;
    const { idx, titulo, detalhe, severidade } = item as { idx?: unknown; titulo?: unknown; detalhe?: unknown; severidade?: unknown };
    if (typeof idx !== 'number' || !base[idx]) continue;
    const orig = base[idx];
    const sev = severidade === 1 || severidade === 2 || severidade === 3 ? severidade : orig.sev;
    out.push({
      ...orig,
      sev,
      t: typeof titulo === 'string' && titulo.trim() ? titulo.trim().slice(0, 140) : orig.t,
      s: typeof detalhe === 'string' && detalhe.trim() ? detalhe.trim().slice(0, 140) : orig.s,
    });
  }
  return out.length ? out : null;
}

/* "Atenção agora" priorizado e redigido pela IA a partir dos mesmos sinais das regras (ATENCAO);
   nunca inventa fato novo, só escolhe, ordena e explica. Cacheado por dia; sem IA (fora do claude.ai) usa as regras direto. */
export function useAtencaoIA() {
  const [itens, setItens] = useState<ItemAtencao[]>(() => {
    const cache = ler<{ data: string; itens: ItemAtencao[] } | null>(CHAVE, null);
    return cache && cache.data === hoje() ? cache.itens : ATENCAO;
  });
  const [fonte, setFonte] = useState<'ia' | 'regras'>(() => {
    const cache = ler<{ data: string } | null>(CHAVE, null);
    return cache && cache.data === hoje() ? 'ia' : 'regras';
  });
  const [carregando, setCarregando] = useState(false);

  const montar = async () => {
    const sample = await samplePromise;
    if (!sample || !ATENCAO.length) return;
    setCarregando(true);
    try {
      const candidatos = ATENCAO.map((a, idx) => ({ idx, tipo: a.k, severidade: a.sev, titulo: a.t, detalhe: a.s, valor: a.v }));
      const r = await sample([{ role: 'user', content: PROMPT(candidatos) }], { modelTier: 'quick', cache: false });
      const lista = parseResposta(r.text || '', ATENCAO);
      if (lista) {
        setItens(lista);
        setFonte('ia');
        gravar(CHAVE, { data: hoje(), itens: lista });
      }
    } catch {
      /* mantém as regras; isto é um painel passivo, não uma pergunta do usuário — nunca mostra erro */
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    const cache = ler<{ data: string } | null>(CHAVE, null);
    if (!cache || cache.data !== hoje()) montar();
  }, []);

  return { itens, fonte, carregando, atualizar: montar };
}
