/* Memória do acompanhamento (o que já foi visto de cada processo).
   Em produção: Redis da Upstash, pelo Marketplace do Vercel (variáveis KV_REST_API_URL e KV_REST_API_TOKEN).
   Sem essas variáveis, guarda só enquanto a função estiver de pé (serve para testar). */
import { memoriaEmObjeto } from "./datajud.mjs";

function memoriaRedis(url, token, prefixo = "datajud:") {
  const cmd = async (args) => {
    const r = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(args) });
    if (!r.ok) throw new Error(`Redis respondeu ${r.status}`);
    return (await r.json()).result;
  };
  return {
    get: async (k) => { const v = await cmd(["GET", prefixo + k]); return v ? JSON.parse(v) : null; },
    set: async (k, v) => { await cmd(["SET", prefixo + k, JSON.stringify(v)]); },
  };
}

const temporaria = memoriaEmObjeto();
function memoriaDoAmbiente() {
  const { KV_REST_API_URL: url, KV_REST_API_TOKEN: token } = process.env;
  return url && token ? memoriaRedis(url, token) : temporaria;
}

export { memoriaDoAmbiente, memoriaRedis };
