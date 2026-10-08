import React, { useEffect, useRef, useState } from "react";
import { animarPop, animarPush } from "../motion/motion";

/* ------------------------------------------------------------------ */
/* Pilha: base de movimento da seção D do redesenho v3.                 */
/* Não decide navegação — só anima a troca do que a aba já renderiza.   */
/* `chave` identifica a tela atual da aba (ex.: inicioView); `raiz` diz  */
/* se é a tela de partida da aba (equivalente ao `showTabBar` do App).  */
/* Ao abrir uma tela (raiz → não raiz): push. Ao voltar (não raiz →     */
/* raiz): pop. Troca entre telas de partida: sem animação.              */
/* ------------------------------------------------------------------ */
function Pilha({ chave, raiz, children }) {
  const [camadas, setCamadas] = useState(() => [{ chave, node: children }]);
  const refs = useRef({});
  const prevRaiz = useRef(raiz);

  useEffect(() => {
    setCamadas((cs) => {
      const atual = cs[cs.length - 1];
      if (atual.chave === chave) {
        return [...cs.slice(0, -1), { ...atual, node: children }];
      }
      const eraRaiz = prevRaiz.current;
      prevRaiz.current = raiz;
      const tipo = eraRaiz && !raiz ? "push" : !eraRaiz && raiz ? "pop" : null;
      return [...cs.slice(-1), { chave, node: children, tipo }].slice(-2);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  // Tela atual só trocou de conteúdo (mesma chave): nada para animar, mantém o nó atualizado.
  useEffect(() => {
    if (camadas.length === 1) return;
    const anterior = camadas[0], nova = camadas[1];
    if (!nova.tipo) { setCamadas((cs) => cs.slice(-1)); return; }
    const elAnterior = refs.current[anterior.chave];
    const elNova = refs.current[nova.chave];
    if (!elAnterior || !elNova) return;
    let vivo = true;
    const promessa = nova.tipo === "push" ? animarPush(elNova, elAnterior) : animarPop(elAnterior, elNova);
    Promise.resolve(promessa).then(() => { if (vivo) setCamadas((cs) => cs.slice(-1)); });
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camadas.length === 2 ? camadas[1].chave : null]);

  const emTransicao = camadas.length === 2 && camadas[1].tipo;
  const ordenadas = emTransicao && camadas[1].tipo === "pop" ? [camadas[1], camadas[0]] : camadas;

  return (
    <div className="flex-1 min-h-0 relative overflow-hidden">
      {ordenadas.map((c) => (
        <div key={c.chave} ref={(el) => { if (el) refs.current[c.chave] = el; }} className="absolute inset-0 flex flex-col">
          {c.node}
        </div>
      ))}
    </div>
  );
}

export { Pilha };
