import React, { useLayoutEffect, useRef, useState } from "react";
import { animarPop, animarPush } from "../motion/motion";
import { T } from "../estilo/tokens";

/* ------------------------------------------------------------------ */
/* Pilha: base de movimento da seção D do redesenho v3.                 */
/* Não decide navegação — só anima a troca do que a aba já renderiza.   */
/* `chave` identifica a tela atual da aba (ex.: inicioView); `raiz` diz  */
/* se é a tela de partida da aba (equivalente ao `showTabBar` do App).  */
/* Ao abrir uma tela (raiz → não raiz): push. Ao voltar (não raiz →     */
/* raiz): pop. Troca entre telas de partida: sem animação.              */
/*                                                                      */
/* As duas trocas de estado abaixo (montar a camada nova e, no efeito    */
/* seguinte, iniciar a animação dela) usam useLayoutEffect, não          */
/* useEffect: useEffect só roda DEPOIS que o navegador pinta, então        */
/* existia um frame real e visível com a tela nova já montada na          */
/* posição final (sem transform) ANTES da animação começar — nesse frame  */
/* ela cobria a tela antiga por completo, e um instante depois pulava     */
/* para fora (translateX 100%) para só então deslizar de volta, o que      */
/* reaparecia a tela antiga por baixo bem no meio da transição (o bug     */
/* "tela antiga invade a tela nova"). Com useLayoutEffect os dois efeitos  */
/* — e o `.animate()` que eles disparam — rodam de forma síncrona antes   */
/* do primeiro paint, então o navegador só chega a pintar a tela nova já   */
/* no primeiro quadro da animação (translateX(100%) no push), nunca         */
/* parada e inteira no lugar final.                                      */
/* ------------------------------------------------------------------ */
function Pilha({ chave, raiz, className, children }) {
  const [camadas, setCamadas] = useState(() => [{ chave, node: children }]);
  const refs = useRef({});
  const prevRaiz = useRef(raiz);

  useLayoutEffect(() => {
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
  useLayoutEffect(() => {
    if (camadas.length === 1) return;
    const anterior = camadas[0], nova = camadas[1];
    if (!nova.tipo) { setCamadas((cs) => cs.slice(-1)); return; }
    const elAnterior = refs.current[anterior.chave];
    const elNova = refs.current[nova.chave];
    if (!elAnterior || !elNova) return;
    let vivo = true;
    const concluir = () => { if (vivo) setCamadas((cs) => cs.slice(-1)); };
    const promessa = nova.tipo === "push" ? animarPush(elNova, elAnterior) : animarPop(elAnterior, elNova);
    // Timeout de segurança: se a promessa nunca resolver (ex.: a animação foi cancelada por fora),
    // a camada de baixo não fica presa para sempre, visível e bloqueando toque.
    const seguranca = setTimeout(concluir, 700);
    Promise.resolve(promessa).then(() => { clearTimeout(seguranca); concluir(); });
    return () => { vivo = false; clearTimeout(seguranca); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camadas.length === 2 ? camadas[1].chave : null]);

  const emTransicao = camadas.length === 2 && !!camadas[1].tipo;
  // No push, quem entra fica por cima. No pop, quem sai fica por cima (desliza pra direita) até sumir.
  const topoChave = emTransicao ? (camadas[1].tipo === "pop" ? camadas[0].chave : camadas[1].chave) : camadas[camadas.length - 1].chave;
  const ordenadas = emTransicao && camadas[1].tipo === "pop" ? [camadas[1], camadas[0]] : camadas;

  return (
    // pointerEvents:none no contêiner durante a transição ignora todo toque até ela acabar — os
    // filhos não reafirmam "auto" (isso venceria o "none" do pai), de propósito. isolation:isolate
    // cria um novo contexto de empilhamento aqui: sem isso, o z-index das camadas (abaixo) escapava
    // para o contexto do app inteiro e passava na frente de uma tela irmã sem z-index próprio, como
    // a TabBar — e, como as camadas herdam pointerEvents, chegava a bloquear o toque nela.
    <div className={`flex-1 min-h-0 relative overflow-hidden${className ? ` ${className}` : ""}`}
         style={{ pointerEvents: emTransicao ? "none" : "auto", isolation: "isolate" }}>
      {ordenadas.map((c) => (
        <div key={c.chave} ref={(el) => { if (el) refs.current[c.chave] = el; }}
             className="absolute inset-0 flex flex-col"
             style={{ background: T.paper, zIndex: c.chave === topoChave ? 2 : 1 }}>
          {c.node}
        </div>
      ))}
    </div>
  );
}

export { Pilha };
