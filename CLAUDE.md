# App dos Sócios — Azevedo dos Reis

Protótipo navegável de um app interno, **somente leitura**, para os sócios do escritório
Azevedo dos Reis Advogados & Associados (Direito do Terceiro Setor) acompanharem processos,
bloqueios judiciais (SISBAJUD) e reclamações constitucionais pelo celular.

Usuária principal: uma sócia que **tem dificuldade de ver de perto**. Acessibilidade de leitura
não é detalhe: contraste, tamanho de texto e alvos de toque guiam todas as decisões.

## Estado atual (versão 8)

- Publicado como artifact do claude.ai, com IA real pela capacidade `sample` (o Claude responde
  com a conta de quem abre o link). `app-socios-publicado.html` é a versão publicada.
- Tudo está em **um arquivo**: `src/App.jsx` (React 18 + Tailwind + estilos inline).
- Os dados são uma **base de exemplo determinística** (58 processos, 39 bloqueios, 4 clientes),
  gerada no próprio arquivo. Não há dado real de cliente.

## Como compilar

```
npm install
npm run build                 # gera dist/bundle.js e dist/out.css
python3 scripts/build_html.py # junta tudo em dist/app-socios.html
```

O HTML final carrega a fonte Lexend do Google Fonts. Fora do claude.ai, `window.claude` não existe:
a IA fica desativada e as telas mostram o aviso correspondente.

## Mapa do `src/App.jsx` (seções na ordem do arquivo)

1. **Tokens antigos `T`** e `GlobalStyle` (CSS global, animações, `prefers-reduced-motion`).
2. **Ícones** em SVG.
3. **Base de exemplo**: geração de processos e bloqueios, `consultarDados()` e `listarProcessos()`
   (funções de consulta que a IA chama), `TOTAIS`.
4. **Peças compartilhadas**: `CARD`, `LINK`, `semDe()`, `BackHeader`, `IconBtn`, `SecLabel`
   (subtítulo de seção com ação à direita), `CardRow`, `TabBar`, `Badge`.
5. **`Faixa`**: o cabeçalho das telas (o nome ficou de uma versão anterior). Título grande que
   vira barra fina translúcida ao rolar. Com `tom`, vira cabeçalho de objeto (telas de detalhe).
   `KPIs` é a fileira de números-chave.
6. **Telas**: Início, listas, processo, bloqueio, busca, organizações, perfil da organização.
7. **IA**: `useSample`, `TOOLS_DEF`, `montarPrompt`, `gerarRelatorio`, renderização dos blocos
   do relatório (`destaque`, `linha`, `barras`, `tabela`, `texto`), `IaAsk`, `IaReport`.
8. **Notificações**, **Perfil** (foto, apelido, tamanho do texto, leitura em voz alta, ordem dos
   clientes), **Guia de estilo** (`GuiaEstilo`, tokens `S` e `F`, `SEMANTICA`, `Etiqueta`, `Botao`).
9. **App**: estado e navegação.

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

- Separar `App.jsx` em módulos (dados, IA, componentes, telas) antes de crescer.
- Decidir a plataforma do app real (web/PWA no Vercel, React Native ou SwiftUI) e, com isso,
  trocar a capacidade `sample` por chamadas à API da Anthropic num backend do escritório.
- Ligar os dados reais no lugar da base de exemplo.
- Pendências conhecidas: comparação entre organizações; modo escuro como opção; testar
  "Ouvir resumos" em aparelhos reais.
