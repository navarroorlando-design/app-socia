# App dos Sócios — Azevedo dos Reis

Protótipo navegável de um app interno, **somente leitura**, para os sócios do escritório
Azevedo dos Reis Advogados & Associados (Direito do Terceiro Setor) acompanharem processos,
bloqueios judiciais (SISBAJUD) e reclamações constitucionais pelo celular.

Usuária principal: uma sócia que **tem dificuldade de ver de perto**. Acessibilidade de leitura
não é detalhe: contraste, tamanho de texto e alvos de toque guiam todas as decisões.

## Estado atual (versão 9)

- Versão de trabalho publicada em https://claude.ai/artifact/CC5B6mT6EASzhR7H6ktshd ("App dos Sócios Neutro").
  A versão anterior, em marinho, ficou em https://claude.ai/artifact/GFoRKY7Ht8UpAKLsqZCnyj.

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
- **Paleta neutra quente (quiet luxury)**, alinhada aos cinzas da logo: fundo `#F2EFE9`, cartões
  `#FFFDF9`, texto `#1A1916` (15:1), apoio `#57544C` (6,6:1). Família de tons: carvão `#1F1E1A`
  (`S.marca`, texto branco), oliva `#565449` (`S.oliva`, texto branco), osso `#D8CFBC` (`S.osso`, texto
  quase preto). Todo texto passa de 4,5:1; nada de texto branco sobre oliva-claro.
- **Cor com significado**, sempre com ícone e palavra: Risco `#9B2A1C`, Atenção `#835000`,
  Em curso `#245476`, Resolvido `#24603F`, Inativo `#4F565B`.
- **Dourado `#765614` é exclusivo da IA.** Status nunca usa dourado.
- **Carvão é a cor da marca** (`S.marca`): cartão principal do Início, bloco de título das telas de
  detalhe e identidade no Perfil, com apoio em osso. Etiquetas sobre o carvão usam fundo claro
  (`sobreCor`). Cor de status só em etiquetas e ícones, nunca no fundo de cartão.
- **Atalhos do Início em tons**: Bloqueios oliva, Sigo osso, Buscar branco, Perguntar latão sólido
  (texto branco, 6,7:1). O dourado da IA nunca vai sobre osso (4,4:1, reprova).
- **Ícones: Iconoir** (MIT), gerados em `src/componentes/icones.jsx`, traço 1,7 (2,1 nas etiquetas).
  Processo = documento (`page`), OS = `city`. **Sem balança, martelo ou colunas**: clichês vetados.
- **Títulos em Lexend.** A serifada foi testada e recusada. `F.titulo` segue existindo (cai na Lexend).
- **Topo**: Início com saudação em duas linhas ("Bom dia" + nome em negrito), cartão principal em carvão
  (valor bloqueado e anel "já levantado") e grade 2×2 de atalhos com detalhe; abas e listas com título
  grande estilo iOS que encolhe ao rolar; detalhes com o título num bloco carvão arredondado e a
  fileira de números-chave logo abaixo, em cartão branco.
- **Cartões com cantos de 24px.** Organizações principais em grade 2×2 (todas visíveis, sem rolagem lateral).
- **Listas dentro de cartão** com `LinhaLista`: ícone num círculo na cor do status, título, detalhe e
  etiqueta. Em listas de processos a etiqueta vai abaixo da descrição (`abaixo`); em bloqueios, à direita.
- **Perfil** com a identidade no bloco carvão. **Aba IA** com o brilho num círculo dourado e sugestões
  com ícone dourado.
- **Subtítulos de seção**: 18pt seminegrito na cor do texto, ação à direita ("Ver todos").
- **Aba IA** em branco com "Pergunte qualquer coisa!" e sugestões; relatórios fixados ficam em
  Perfil → Relatórios fixados.
- **Barra de navegação**: Início, IA, OS, Perfil.

## Organizações: contratos de gestão, bloqueios e processos

O que os clientes (OS) sempre perguntam é **o passivo de cada contrato de gestão**. Por isso a tela
da organização abre pela identidade e pelas três métricas, nesta ordem: **Contratos de gestão**
(passivo estimado), **Bloqueios**, **Processos**. Cada uma tem tela própria, e cada contrato tem a
sua (`src/telas/OrgMetricas.jsx`). O cartão da lista de organizações mostra só o número de processos.

- **Passivo estimado** = soma do valor em discussão dos processos do contrato, separada pelo
  prognóstico (Provável, Possível, Remoto). Bloqueios entram à parte, como o que já saiu da conta.
  Cálculo em `src/dados/passivo.js`. Em produção: "valor da causa" e "prognóstico" do Legal One.
  **Definição a validar com o escritório** (pode ser provisão em vez de valor da causa).
- Na base de exemplo, cada processo ganhou `valorCausa` e `prognostico` (gerador próprio por id,
  sem mexer na sequência do resto). A IA consulta com `metrica: "passivo_estimado"`.

## Outras telas (versão 9)

- **Reclamações constitucionais** (`src/telas/Reclamacoes.jsx`): lista geral, lista por organização e
  detalhe (precedente invocado, ato reclamado, liminar, processos de origem, movimentações).
- **Carteira** (`src/telas/Carteira.jsx`): passivo de todos os clientes, aberto pelo bloco de passivo
  do Início. **Movimentações** recentes: o "Ver tudo" de "Hoje no escritório".
- **Listas com filtros**: cliente e recorte (área, parados, status) em chips, mais ordenação.
- **Processos ativos por natureza** no Início (trabalhista, cível, administrativo), cada linha abre a
  lista já filtrada. "Ativo" = não arquivado nem baixado.
- **Entrada** (`src/telas/Entrada.jsx`): login simulado com a conta do escritório, primeiro acesso
  (tamanho do texto, ouvir resumos), Face ID simulado e tela de bloqueio. Perfil → Segurança liga o
  Face ID, bloqueia, sai da conta e simula "sem internet" (aviso no topo, IA desligada).
- **Relatório para o cliente** (`src/telas/RelatorioCliente.jsx`): prévia do passivo por contrato,
  conferência obrigatória e PDF (jsPDF). No claude.ai o arquivo sai pela capacidade `downloads`
  (declarar `capabilities: {sample: {}, downloads: true}` ao publicar); fora dele, baixa direto.

## Funções pessoais da sócia (`src/pessoal.jsx`)

Guardadas no aparelho no protótipo (`lerPref`/`gravarPref`); no app real, no servidor por usuária.
- **Anotações privadas** em processo, contrato e organização (bloco em osso no topo da tela).
- **Alertas sob medida**: processo parado X dias, bloqueado de um cliente acima de R$ X, passivo de um
  contrato acima de R$ X. Criados pelo botão "Avisar se…" ou pedindo à IA (ferramenta `criar_alerta`).
  Ao disparar, viram notificação "Seu alerta". Lista em Perfil → Meus alertas.
- **Personalizar Início**: mostrar, esconder e reordenar os blocos (saudação fica sempre no topo).
- **Contar a história do processo** (`ProcessoDetalhe`): a IA narra por fases, com datas, dinheiro e
  próximo passo de rito, sem prognóstico. Fica profunda quando entrarem DataJud (linha do tempo) e as
  publicações do Legal One (conteúdo das decisões).

## DataJud (movimentações dos processos acompanhados)

- `lib/datajud.mjs`: descobre o tribunal pelo número CNJ, consulta a API Pública do DataJud, junta os
  graus num histórico e devolve só as movimentações ainda não vistas (a primeira verificação apenas
  guarda o histórico). Testes em `tests/datajud.test.mjs` (`npm test`).
- `app/api/cron/datajud/route.js` + `vercel.json` (`crons`): rotina diária no Vercel. Variáveis:
  `CRON_SECRET` (obrigatória), `ACOMPANHADOS` (números CNJ separados por vírgula, até haver banco com o
  "Sigo" de cada sócia), `KV_REST_API_URL`/`KV_REST_API_TOKEN` (Redis da Upstash, memória do que já foi
  visto), `DATAJUD_API_KEY` (opcional; a chave pública do CNJ muda de tempos em tempos).
- `npm run datajud -- <número CNJ>` consulta à mão; `--verificar` mostra só o que é novo.
- Limites: o DataJud recebe os dados dos tribunais com atraso (dias), não traz o texto das decisões,
  não cobre o STF nem processos em segredo de justiça. O plano Hobby do Vercel só roda cron 1 vez por dia.

## Banco de dados (`db/schema.sql`, proposta)

Postgres em quatro partes: (1) **cópia dos sistemas**, preenchida só pela importação das planilhas e pelo DataJud (clientes,
contratos de gestão, processos, movimentações, bloqueios, reclamações); (2) **contas calculadas** em
views (`passivo_por_contrato`, `processos_parados`); (3) **o que é de cada sócia** (preferências,
seguidos, anotações, alertas, notificações, relatórios fixados), protegido por row level security;
(4) **controle e auditoria** (`sincronizacoes`, `datajud_vistos`, que substitui o Redis, e `auditoria`
para LGPD). Conversas com a IA não são guardadas, só o que for fixado. Testado no PGlite.

## Importação do Legal One (sem API)

O contrato do Legal One **não tem API**. Os dados entram por **relatórios exportados** (XLSX ou HTML):
- `lib/importar/planilha.mjs`: `importarProcessos` e `importarBloqueios` acham o cabeçalho (mesmo com
  título antes), reconhecem vários nomes por coluna (`COLUNAS_PROCESSOS`), convertem CNJ, reais e datas
  (inclusive data serial do Excel) e devolvem a lista de problemas por linha (número real da linha do
  Excel). Nada é gravado sem confirmação. Testes em `tests/importar.test.mjs`.
- `npm run importar -- processos|bloqueios <arquivo>` testa um relatório real sem gravar.
- `db/modelos/`: planilhas modelo com as colunas esperadas (geradas da base de exemplo), para a equipe
  montar o relatório salvo no Legal One.
- Chave do processo: número CNJ (ou a pasta, se faltar). O histórico de movimentações vem do DataJud;
  a planilha traz só o último andamento.

## Regra da IA (arquitetura)

A IA **nunca** é a fonte do número. Ela chama `consultar_dados`, `consultar_cruzado` e
`listar_processos` (`src/dados/consultas.js`), que calculam sobre a base. Em produção, essas funções
passam a consultar a camada de métricas real (Legal One + Log de Bloqueios), sem mudar o contrato.

**Formato: conversa como no app do Claude** (`src/telas/Ia.jsx`, `IaConversa`). Resposta em Markdown,
escrita aos poucos (`onText`), com histórico (regras num primeiro turno fixo + últimas 12 mensagens,
`src/ia/motor.js`). Estrutura pedida: **Resumo** em 2–3 frases, números-chave, seções com gráfico e
1–2 frases de leitura, próximos passos (sem prognóstico jurídico) e sugestões de pergunta.

**Gráficos:** a IA escreve só QUAL consulta desenhar, num bloco ```` ```grafico {json} ```` (tipos:
barras, linha, empilhado, indicadores, tabela; `series` para comparar até 3 recortes). O app roda a
consulta e desenha (`src/ia/Resposta.jsx` + `src/ia/Graficos.jsx`), então nenhum número de gráfico
passa pela IA. Sugestões vêm em ```` ```sugestoes [..] ````. Uma série usa oliva; várias usam a paleta
validada azul-aço `#2A80AE`, cobre `#C9773E`, ameixa `#7E62A8` (daltonismo e contraste ok, sem
repetir status). Prognóstico usa as cores de status. Toque no gráfico mostra o valor exato.

## Próximos passos sugeridos

- Servidor da IA: rota no Next.js que chama a API da Anthropic com as ferramentas
  `consultar_dados` / `listar_processos` executadas no servidor, no lugar da capacidade `sample`.
- Login (Microsoft Entra ID se o escritório usa Microsoft 365; senão, código por e-mail).
- Esconder a barra de status falsa ("9:41") e a moldura de celular quando o app roda num aparelho
  de verdade, respeitando as áreas seguras (`env(safe-area-inset-*)`).
- Ligar os dados reais (Legal One + Log de Bloqueios) numa cópia em Postgres.
- Pendências conhecidas: comparação entre organizações; modo escuro como opção; testar
  "Ouvir resumos" em aparelhos reais.
