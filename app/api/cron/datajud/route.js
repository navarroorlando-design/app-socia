import { verificarAtualizacoes } from "../../../../lib/datajud.mjs";
import { memoriaDoAmbiente } from "../../../../lib/memoria.mjs";

/* Rotina automática (Vercel Cron, ver vercel.json): busca no DataJud as movimentações novas dos
   processos acompanhados. Enquanto não há banco com o "Sigo" de cada sócia, a lista vem da variável
   ACOMPANHADOS (números CNJ separados por vírgula). */
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo || req.headers.get("authorization") !== `Bearer ${segredo}`) {
    return Response.json({ erro: "não autorizado" }, { status: 401 });
  }
  const processos = (process.env.ACOMPANHADOS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!processos.length) return Response.json({ verificados: 0, aviso: "Defina ACOMPANHADOS com os números CNJ." });

  const resultado = await verificarAtualizacoes(processos, memoriaDoAmbiente());
  const novidades = resultado.filter((r) => r.ok && r.novos.length);
  // Próximo passo: gravar as novidades no banco e mandar notificação para quem segue o processo.
  return Response.json({
    verificados: resultado.length,
    comNovidade: novidades.map((r) => ({ cnj: r.cnj, novos: r.novos.map((m) => ({ data: m.data, nome: m.nome, complementos: m.complementos })) })),
    erros: resultado.filter((r) => !r.ok).map((r) => ({ cnj: r.cnj, erro: r.erro })),
  });
}
