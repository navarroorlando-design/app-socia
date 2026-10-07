# App dos Sócios — Azevedo dos Reis

Protótipo navegável de um app interno, **somente leitura**, para os sócios do escritório
Azevedo dos Reis Advogados & Associados (Direito do Terceiro Setor) acompanharem processos,
bloqueios judiciais (SISBAJUD) e reclamações constitucionais pelo celular.

Usuária principal: uma sócia que **tem dificuldade de ver de perto**. Acessibilidade de leitura
não é detalhe: contraste, tamanho de texto e alvos de toque guiam todas as decisões.

## Estado atual (versão 9)

- **App web instalável (PWA) em Next.js 16 + React 19**, a caminho do Vercel (região São Paulo,
  `vercel.json`). Stack escolhida: Next.js no Vercel, servidor próprio chamando a API da Anthropic,
  Postgres como cópia dos números do Legal One e do Log de Bloqueios.
- O mesmo código ainda gera o **artifact do claude.ai** (arquivo HTML único), que usa IA real pela
  capacidade `sample`. `app-socios-publicado.html` é a última versão publicada (v8).
- Fora do claude.ai, `window.claude` não existe: no app Next.js a IA fica desativada até o servidor
  com a API da Anthropic ficar pronto.
- Os dados são uma **base de exemplo determinística** (58 processos, 39 bloqueios, 4 clientes).
  Não há dado real de cliente.

## Como rodar

```
npm install
npm run dev        # app Next.js em http://localhost:3000
npm run build      # build de produção do Next.js
npm run artifact   # gera dist/app-socios.html (artifact do claude.ai)
npm run icones     # regera os ícones do app (precisa do Playwright)
```

As fontes Lexend e IBM Plex Mono vêm do pacote `@fontsource` (servidas pelo próprio app) no Next.js;
o artifact carrega do Google Fonts.

## Estrutura

- `app/`: casca do Next.js. `layout.jsx` (metadados, fontes, viewport), `page.jsx` (renderiza
  `src/App` só no navegador), `manifest.js` (PWA), `icon.svg`/`apple-icon.png`.
- `src/main.jsx`: entrada do artifact (esbuild).
- `src/App.jsx`: estado e navegação.
- `src/estilo/`: `tokens.js` (tokens `T`, `S`, `F`, `SEMANTICA`, `TONS`, `CARD`, `LINK`, `semDe`) e
  `GlobalStyle.jsx` (CSS global, animações, `prefers-reduced-motion`).
- `src/componentes/`: `icones.jsx` (SVG) e `ui.jsx` (peças compartilhadas: `Faixa`, `KPIs`,
  `SecLabel`, `CardRow`, `TabBar`, `Etiqueta`, `Botao`, `Badge`...). `Faixa` é o cabeçalho das telas:
  título grande que vira barra fina ao rolar; com `tom`, vira cabeçalho de objeto.
- `src/dados/`: `formato.js` (datas e moeda), `base.js` (base de exemplo, `TOTAIS`),
  `consultas.js` (`consultarDados`, `listarProcessos`: as funções que a IA chama).
- `src/ia/`: `motor.js` (`useSample`, `TOOLS_DEF`, `montarPrompt`, `gerarRelatorio`, relatórios de
  exemplo) e `RelatorioView.jsx` (blocos `destaque`, `linha`, `barras`, `tabela`, `texto`).
- `src/preferencias.jsx`: preferências guardadas no aparelho, `Avatar`, `OuvirBtn`.
- `src/telas/`: uma tela (ou grupo de telas) por arquivo.

As importações seguem uma direção só: estilo → ícones → dados → IA → telas → App. Manter assim
evita ciclos entre módulos.

## Decisões de design já aprovadas (não reverter sem pedir)

- **Fonte única: Lexend.** Hierarquia por tamanho e peso. Mínimo 13pt; leitura em 16–17pt.
  Números de processo em IBM Plex Mono.
- **Fundo cinza-gelo `#F2F3F7`**, cartões brancos com sombra suave, texto `#111827`
  (16:1 sobre o fundo), apoio `#4B5563`. Todo texto passa de 4,5:1.
- **Cor com significado**, sempre com ícone e palavra: Risco `#9B2A1C`, Atenção `#835000`,
  Em curso `#245476`, Resolvido `#24603F`, Inativo `#4F565B`.
- **Dourado `#765614` é exclusivo da IA.** Status nunca usa dourado.
- **Topo**: Início sem título (saudação em duas linhas, cartão-resumo, 4 atalhos); abas e listas
  com título grande estilo iOS que encolhe ao rolar; detalhes com cabeçalho de objeto
  (cliente, valor/nome, etiqueta de status, fileira de números-chave). Sem faixas coloridas.
- **Subtítulos de seção**: 18pt seminegrito na cor do texto, ação à direita ("Ver todos").
- **Aba IA** em branco com "Pergunte qualquer coisa!" e sugestões; relatórios fixados ficam em
  Perfil → Relatórios fixados.
- **Barra de navegação**: Início, IA, OS, Perfil.

## Regra da IA (arquitetura)

A IA **nunca** é a fonte do número. Ela chama `consultar_dados` / `listar_processos`, que calculam
sobre a base, e só escolhe a apresentação, respondendo um JSON de blocos. Em produção, essas duas
funções passam a consultar a camada de métricas real (Legal One + Log de Bloqueios), sem mudar
o contrato com a IA.

## Próximos passos sugeridos

- Servidor da IA: rota no Next.js que chama a API da Anthropic com as ferramentas
  `consultar_dados` / `listar_processos` executadas no servidor, no lugar da capacidade `sample`.
- Login (Microsoft Entra ID se o escritório usa Microsoft 365; senão, código por e-mail).
- Esconder a barra de status falsa ("9:41") e a moldura de celular quando o app roda num aparelho
  de verdade, respeitando as áreas seguras (`env(safe-area-inset-*)`).
- Ligar os dados reais (Legal One + Log de Bloqueios) numa cópia em Postgres.
- Pendências conhecidas: comparação entre organizações; modo escuro como opção; testar
  "Ouvir resumos" em aparelhos reais.
