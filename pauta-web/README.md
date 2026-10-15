# Pauta Jurídica (web)

Versão desktop do App dos Sócios da Azevedo dos Reis. Mostra processos, bloqueios SISBAJUD, contratos de gestão, reclamações no STF e o desempenho da carteira, e tem um assistente que consulta a base.

Stack: **Vite 6 + React 19 + TypeScript (estrito)**. CSS puro com variáveis OKLCH, sem biblioteca de componentes. As fontes são servidas localmente pelo `@fontsource` (Newsreader, Inter Tight e IBM Plex Mono).

## Como rodar

```bash
npm install
npm run dev       # desenvolvimento em http://localhost:5173
npm run build     # typecheck (tsc -b) + build de produção em dist/
npm run preview   # serve o build
npm run lint
```

## Estrutura

```
src/
  data/          tipos da base (types.ts) e o gerador de exemplo (gerador.js + gerador.d.ts)
  domain/        regras e helpers puros: formatação, consultas, novidades, etapas da Rcl
  lib/           armazenamento local, largura de contêiner, acesso às capacidades do Claude
  components/    peças reutilizáveis: ícones, gráficos SVG, status, linha do tempo, vigência
  features/
    assistente/  conversa, ferramentas, blocos de gráfico, relatórios prontos, histórico
    atencao/     regras e lista "Atenção agora"
    clientes/    matriz de clientes
  pages/         Painel, Processos, Bloqueios, Clientes, Reclamações, Desempenho
  app/           casca: barra lateral, busca ⌘K, painel do assistente, contexto compartilhado
  styles/app.css tokens (claro e escuro) e estilos
```

Atalhos: **⌘K** abre a busca; **⌘.** abre e fecha o assistente.

## O que é provisório

1. **Dados.** `src/data/gerador.js` é o gerador com semente fixa extraído do App dos Sócios, por isso os números batem nos dois apps. Para produção, troque-o por chamadas a uma API ligada ao Legal One e ao Log de Bloqueios, mantendo a interface `Base` de `src/data/types.ts`. As telas só dependem desses tipos.
2. **Assistente.** Hoje ele usa a capacidade `sample` do Claude (`src/lib/claude.ts`), que só existe quando o app roda como artefato no claude.ai. Fora dele, o assistente avisa que está indisponível e o resto funciona normalmente. Para rodar fora do Claude, implemente um endpoint no servidor que chame a API da Anthropic com as mesmas ferramentas (`consultar_dados`, `consultar_cruzado`, `listar_processos`, `ver_processo`, `listar_reclamacoes`) e troque `samplePromise` por esse cliente. Nunca coloque a chave da API no navegador.
3. **Downloads** (.md e .csv) usam a capacidade `downloads` do Claude. Num deploy próprio, troque por um `Blob` com download direto.
4. **Seguir processo, gráficos fixados e conversas** ficam no `localStorage` do navegador. Para valer entre aparelhos, mova para o backend.
