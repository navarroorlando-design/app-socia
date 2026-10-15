import { useState } from 'react';

/* Preferências e anotações guardadas só neste navegador */
export function ler<T>(chave: string, padrao: T): T {
  try {
    const v = localStorage.getItem(chave);
    return v ? (JSON.parse(v) as T) : padrao;
  } catch {
    return padrao;
  }
}
export function gravar(chave: string, valor: unknown) {
  try { localStorage.setItem(chave, JSON.stringify(valor)); } catch { /* armazenamento indisponível */ }
}
export function useStore<T>(chave: string, padrao: T) {
  const [v, setV] = useState<T>(() => ler(chave, padrao));
  const set = (f: T | ((prev: T) => T)) =>
    setV(prev => {
      const n = typeof f === 'function' ? (f as (p: T) => T)(prev) : f;
      gravar(chave, n);
      return n;
    });
  return [v, set] as const;
}
