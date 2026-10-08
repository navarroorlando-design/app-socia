# Guia para aplicar a v3 no app real com o Claude Code

Este guia serve para aplicar no **código existente** do App dos Sócios as mudanças aprovadas no protótipo v3 (`index.html`, nesta pasta). A ideia é **modificar o app, não reconstruí-lo**.

Material de apoio nesta pasta:
- `index.html`: o protótipo de referência. Abra no navegador e use `#home`, `#detail=bloqueios`, `#detail=passivo>org:afne` e `#detail=desempenho`.
- `consolidacao.md`: os conflitos resolvidos e a lista completa de mudanças.
- `ref/especificacao-graficos.md`: a especificação dos gráficos SVG (dados, eixos, cores, acessibilidade). **É a fonte oficial para os gráficos.** Na seção D estão os poucos ajustes de cor da v3.
- `ref/mudancas.md`: o changelog original de Bloqueios, Passivo e Desempenho, com a lista de dados de exemplo.
- `shots/`: prints de referência de cada tela.

> Dica: copie `index.html`, `ref/` e `shots/` para dentro do repositório (por exemplo, em `docs/redesign-v3/`) antes de começar, para o Claude Code poder ler tudo.

---

## A. Prompt principal (colar no Claude Code)

```text
Você vai aplicar um redesenho aprovado ao app EXISTENTE "App dos Sócios" (app mobile para sócios de um
escritório de advocacia; toda a interface em pt-BR). NÃO reconstrua o app, NÃO troque framework, roteador,
gerenciador de estado nem a camada de dados. Modifique os componentes e telas que já existem, reaproveite os
componentes atuais e só crie componentes novos quando não houver equivalente.

Referências (leia antes de mudar qualquer coisa):
- docs/redesign-v3/index.html: protótipo HTML de referência (comportamento, layout, textos, movimento).
- docs/redesign-v3/guia-claude-code.md: especificação por tela, tokens, movimento e critérios de aceite.
- docs/redesign-v3/ref/especificacao-graficos.md: especificação dos gráficos SVG.
- docs/redesign-v3/consolidacao.md: decisões e o que precisa ser confirmado com dados reais.
- docs/redesign-v3/shots/*.png: como cada tela deve ficar.

Regras:
1. Primeiro, mapeie o código: liste onde ficam o Início, as abas, a IA, os Clientes (OS), o Perfil, o
   onboarding/tour, as telas de Bloqueios e Escritório (Passivo/Desempenho), o tema (cores e fontes), a
   navegação e a origem dos dados. Me mostre esse mapa e um plano em passos antes de editar.
2. Trabalhe em passos pequenos, um por vez (o guia sugere 8). Ao fim de cada passo: rode o build, o lint e
   os testes, mostre o diff resumido e pare para eu revisar.
3. Use os dados reais do app. O protótipo tem dados de exemplo; nunca copie números do protótipo para o
   código. Onde o guia diz "confirmar com dados reais", deixe um TODO e me avise.
4. Tokens: centralize cores, raios, espaçamentos, tipografia e durações de movimento no tema existente
   (CSS variables, theme do Tailwind ou equivalente). Não espalhe hex pelo código.
5. Acessibilidade: todo movimento respeita prefers-reduced-motion (ou o "Reduzir movimento" do sistema);
   a escala de texto (1 / 1,15 / 1,3) vale para todas as telas, inclusive os gráficos; os gráficos têm
   role="img" com <title> e <desc>.
6. Cor com significado: vermelho só para "novo" (bloqueio dos últimos 7 dias) e para o badge de avisos;
   âmbar para atenção (parado há mais de 90 dias, vence este ano, delta negativo).
7. Se o app for React/React Native/Tailwind, use os equivalentes indicados no guia
   (Framer Motion/Reanimated, classes Tailwind, etc.), sem adicionar bibliotecas pesadas sem me perguntar.
   Os gráficos são SVG feitos à mão: não adicione biblioteca de gráficos.

Comece pelo Passo 0 (mapeamento + plano), sem alterar arquivos.
```

### A.1 Prompts por passo (aplicar um de cada vez)

**Passo 0: mapeamento (sem editar)**
```text
Passo 0: leia o código e as referências em docs/redesign-v3. Entregue: (1) um mapa de arquivos por tela e
componente; (2) onde estão os tokens do tema; (3) como funciona a navegação (stack/push, abas) e se existe
transição; (4) de onde vêm os dados de bloqueios, passivo, contratos, processos encerrados e novos; (5) a
lista de diferenças entre o app atual e o protótipo v3, tela por tela; (6) riscos. Não edite nada.
```

**Passo 1: tokens e escala de texto**
```text
Passo 1: adicione ou ajuste os tokens da seção C do guia (cores, incluindo o âmbar novo e a paleta de dados,
raios, espaçamentos, tipografia e o multiplicador de texto --ts = 1 | 1.15 | 1.3, mais --cts para gráficos).
Troque cores escritas direto no código pelos tokens nas telas que vamos mexer. Garanta que a preferência de
tamanho de texto do Perfil afeta todas as telas. Sem mudanças visuais além das cores e da escala. Rode o build.
```

**Passo 2: base de movimento**
```text
Passo 2: implemente a base de movimento da seção D: transição push/pop das telas internas (deslize da
direita 320 ms / volta 280 ms, tela de baixo recua 28%), escala .97 ao tocar em itens tocáveis, o componente
de seletor segmentado com pílula deslizante (280 ms) e um helper `prefersReducedMotion`. Com movimento
reduzido, tudo vira fade curto ou fica instantâneo. Aplique nas telas atuais sem mudar o layout delas.
```

**Passo 3: Início**
```text
Passo 3: aplique a spec do Início (seção B.1): topo com valor, nº de ativos, parados e % levantado
CALCULADOS dos dados de bloqueios; chip "N parados há 90+ dias" em âmbar; faixa de dica fina com ×;
grade 2x2 Processos, Bloqueios, Passivo e Desempenho, mais a linha de largura total da Reclamação
constitucional; remova o atalho "Escritório"; contador e anel animados. Verifique os critérios de aceite.
```

**Passo 4: abas, IA, onboarding, tour e Perfil**
```text
Passo 4: aplique as seções B.2, B.3, B.8 e B.9: aba "OS" vira "Clientes", com pílula deslizante; IA com as
sugestões primeiro e o aviso no rodapé; onboarding sem o "Passo 2 de 3"; texto do passo 1 do tour atualizado;
Guia de estilo e Perfil conforme a spec. Remova os cards de dica com "Entendi" e use a faixa fina.
```

**Passo 5: Bloqueios**
```text
Passo 5: refaça a tela Bloqueios conforme a seção B.5 (abre em Ativos, resumo por cliente no topo que filtra,
busca, seletor de cliente em folha inferior com link para a página do cliente, ordenação, agrupar por
Mês/Contrato com subtotais, linha com processo e órgão, status Novo/Parado/Ativo/Levantado, detalhe em folha
inferior) e crie a tela "Parados há mais de 90 dias". Use os dados reais e o critério de "parado" que eu
confirmar (deixe o critério configurável).
```

**Passo 6: Passivo, página única do cliente e contrato**
```text
Passo 6: separe "Escritório" em Passivo (seção B.6) e Desempenho (próximo passo). Crie a tela Passivo e
unifique a página do cliente: deve existir UM componente/rota de cliente, usado pela aba Clientes, pelo
Passivo, pelo seletor de Bloqueios e pela tela de contrato (seção B.4). Crie a tela de contrato como push.
Redirecione rotas antigas de "Escritório" para Passivo.
```

**Passo 7: Desempenho e gráficos**
```text
Passo 7: implemente o Desempenho (seção B.7) e os gráficos seguindo docs/redesign-v3/ref/especificacao-graficos.md
(mais os ajustes de cor da seção D deste guia): 4 cards com sparkline, gráfico grande por indicador, seletor
de período, "Ver por" Cliente/Área, lista detalhada. Gráficos em SVG à mão, com animação de desenho na
primeira exibição (seção D) e legíveis em texto 1,3.
```

**Passo 8: consistência e QA**
```text
Passo 8: revise o app inteiro com os checklists da seção B e o "confirmar com dados reais" da seção E.
Garanta que o chip do Início, a tela Bloqueios, a lista de Parados e os Avisos mostram o MESMO número de
parados; que o total do topo do Início é igual ao da tela Bloqueios; que vermelho só aparece para "novo" e
no badge. Teste com movimento reduzido e com texto 1,3. Liste o que ficou pendente.
```

---

## B. Especificação por tela e critérios de aceite

### B.1 Início
- O topo escuro aparece logo abaixo da saudação, com "Bloqueado hoje, todos os clientes", o valor total ativo, "N bloqueios ativos", o chip "**N parados há 90+ dias**" (âmbar, ícone de relógio, abre Parados), o chip "3 que você segue" (azul) e o anel "% já levantado".
- Abaixo do topo fica a faixa de dica fina, que pode ser fechada: "Passivo e Desempenho ganharam atalhos. Personalize em Perfil."
- Grade 2x2: **Processos** (card claro, "58 no total"), **Bloqueios** (bege, "30 ativos · R$ 2,63 mi"), **Passivo** (claro, "R$ 7,57 mi estimado") e **Desempenho** (oliva escuro, "44% de êxito em 2026").
- Abaixo da grade, a linha de largura total **Reclamação constitucional** ("3 no STF", com chevron).
- Depois vêm "Hoje no escritório" (3 itens e "Ver tudo") e "Mais detalhes" (Processos por tipo, Seguidos). As duas seções podem ser desligadas em Perfil → Personalizar Início.

- [ ] Valor, nº de ativos, nº de parados e % levantado vêm dos dados, sem números fixos no código.
- [ ] Os 4 atalhos 2x2 aparecem sem rolar no texto padrão em 390×844.
- [ ] O atalho "Escritório" não existe mais.
- [ ] O chip de parados é âmbar e o número é o mesmo da tela Parados e dos Avisos.
- [ ] O valor sobe contando e o anel se preenche (900 ms) só na primeira abertura. Com movimento reduzido, aparecem os valores finais.
- [ ] Fechar a dica faz o card encolher e o conteúdo subir, sem pulo. A dica não volta na mesma sessão.

### B.2 Abas
- [ ] As abas são Início, IA, **Clientes** (era "OS") e Perfil.
- [ ] A pílula de destaque desliza até a aba ativa (320 ms) e o conteúdo troca com fade (≈180 ms).
- [ ] Tocar numa aba com telas empilhadas volta para a raiz da aba.

### B.3 IA
- [ ] As sugestões vêm primeiro, depois o campo de pergunta, e o aviso sobre o Claude fica pequeno no rodapé.
- [ ] Não há card de dica na IA.

### B.4 Clientes e página única do cliente
- A aba Clientes mostra a grade dos 4 principais (logo, nome, nº de processos), "Outras organizações" com 3 itens e "Ver mais N organizações".
- A **página do cliente (uma só)** tem:
  - cabeçalho com o logo do cliente sobre o tom da marca, "N processos" e "N contratos de gestão · N encerrados em 2026";
  - topo escuro com o passivo do cliente (total, barra Provável/Possível/Remoto com legenda, valores, % e "Já bloqueado");
  - "Contratos" em cards, com "Ver todos os N contratos" quando houver mais de 2;
  - "Ver também", com Bloqueios ativos (abre Bloqueios filtrado), Desempenho no ano (abre Desempenho filtrado) e Processos.
- A **tela do contrato** (push) mostra órgão, vigência e situação, o passivo por prognóstico, o bloqueado hoje (valor e quantidade), os processos e os botões "Ver bloqueios" e "Página do cliente".

- [ ] Existe um único componente ou rota de cliente. A aba Clientes, o Passivo, o seletor de Bloqueios e a tela de contrato abrem a mesma tela.
- [ ] "Página do cliente", quando aberta a partir do contrato do próprio cliente, volta para a página em vez de empilhar outra.
- [ ] Os contadores de processos do cabeçalho e dos contratos vêm dos dados, e o total do cliente é igual à soma dos contratos dele (AFNE 19, Gnosis 20, FAS 13, IGEDES 6, total 58).

### B.5 Bloqueios
- O cabeçalho é "Todos os clientes / Bloqueios", com o subtítulo dinâmico "N bloqueios ativos · escopo".
- O topo escuro mostra o total ativo, "N bloqueios ativos · N novos nos últimos 7 dias" e o link "N parados há mais de 90 dias". O resumo **por cliente** tem barra, valor, nº de bloqueios, nº de novos e % do total. Tocar num cliente filtra, e "limpar filtro" desfaz.
- Há busca (processo, valor ou órgão) e o seletor **Ativos / Levantados / Todos** com contagem e pílula deslizante. A tela abre em Ativos.
- "Cliente: Todos ▾" abre uma folha inferior com os clientes (nº e valor), e cada opção tem "Página ›". Com um cliente filtrado, aparece o link "Abrir a página de X ›".
- A ordenação é Mais recentes ou Maior valor. **Agrupar** por Mês ou Contrato, com subtotal por grupo e "Fim da lista · N · R$".
- Cada linha mostra o valor e o status (**Novo** em vermelho, **Parado · N dias** em âmbar, Ativo em cinza, Levantado em verde), "Cliente · contrato" e "Proc. nº · data".
- O detalhe abre em folha inferior (situação, data, dias, cliente, contrato, processo), com "Filtrar contrato" e "Ver contrato".
- A tela **Parados há mais de 90 dias** lista os bloqueios parados, do mais antigo para o mais novo.

- [ ] O subtítulo, os contadores e a lista sempre mostram o mesmo número.
- [ ] Vermelho só aparece em bloqueios ativos com 7 dias ou menos.
- [ ] O critério de "parado" fica configurável num lugar só (ver E.1).
- [ ] Os seletores têm pílula deslizante. A lista não pula de rolagem ao trocar filtro.
- [ ] A busca não perde o foco nem a posição do cursor.

### B.6 Passivo
- O topo escuro mostra o passivo estimado total, "N contratos de gestão · N processos", a barra de prognóstico com legenda (Provável, Possível, Remoto: valor e %) e "Já bloqueado" (valor, % e barra).
- "Por cliente" é uma lista ordenada por passivo, com barra proporcional, "N contratos · R$ bloqueado (%)", e abre a página única do cliente.
- "Contratos" mostra 4 de 8, com o seletor **Maior passivo / Vence primeiro** (pílula) e "Ver todos os 8 contratos" / "Mostrar menos". Cada card tem cliente, órgão, vigência, processos, situação (Vigente em azul, Vence este ano em âmbar, Encerrado em cinza), passivo com barra, legenda em 3 colunas e "Bloqueado R$ · % do passivo".

- [ ] Valores completos dentro da tela (R$ 1.767.400). A forma abreviada fica só nos atalhos do Início.
- [ ] "Já bloqueado" do Passivo = total ativo da tela Bloqueios.

### B.7 Desempenho
- Seletor de período: 2026, 2025 ou Últimos 12 meses (pílula). O subtítulo mostra o intervalo.
- 4 cards em grade 2x2: Índice de êxito, Novos x encerrados, Bloqueios levantados e Valor revertido. Cada um tem valor, detalhe, variação contra o período anterior (▲ em verde, ▼ em âmbar) e sparkline. O card selecionado fica escuro, com a sparkline em dourado.
- Abaixo vêm o resumo e o **gráfico do indicador selecionado** (seguir `ref/especificacao-graficos.md`). Tocar num mês mostra o resumo do mês.
- "Por cliente / Por área" com o seletor "Ver por" (pílula). Tocar numa linha filtra a lista de baixo, e um chip limpa o filtro.
- A lista do que forma o número mostra encerrados, entradas e saídas, levantados ou o valor por processo. O detalhe abre em folha inferior.

- [ ] Os 9 levantamentos do ano coincidem com os levantados da tela Bloqueios (contados pela data de liberação).
- [ ] Os gráficos se desenham uma vez por combinação de indicador e período. Com movimento reduzido, já aparecem prontos.
- [ ] Os gráficos ficam legíveis com o texto em 1,3 (os textos do SVG escalam com `--cts`).
- [ ] O pill "Desfavorável" é cinza com um ponto terracota (não usa vermelho de interface).

### B.8 Onboarding e tour
- [ ] O onboarding não mostra "Passo 2 de 3". Só o tour tem "Passo X de 5".
- [ ] O passo 1 do tour diz: "…quatro atalhos: Processos, Bloqueios, Passivo e Desempenho. A Reclamação constitucional vem numa linha logo depois."
- [ ] O passo 5 continua citando "seus 2 relatórios fixados".

### B.9 Perfil
- [ ] Tamanho do texto (Padrão 1, Maior 1,15, Muito maior 1,3) vale para todas as telas, inclusive Bloqueios, Passivo, Desempenho e os gráficos.
- [ ] Relatórios fixados = 2. Personalizar Início liga e desliga "Hoje no escritório" e "Mais detalhes".
- [ ] O Guia de estilo traz as cores com significado (seção C).

---

## C. Tokens de design usados na v3

### Cores
| Token | Hex | Uso |
|---|---|---|
| `--page` | `#D0C9BD` | fundo fora do celular (só no protótipo) |
| `--bg` | `#F2EFE8` | fundo das telas (creme) |
| `--card` | `#FFFDF8` | cards e listas |
| `--beige` | `#DCD3C2` | atalho Bloqueios, ilustrações |
| `--beige2` | `#E9E3D7` | dica, seletor (trilho), pílula das abas, chips claros |
| `--ink` | `#1C1A17` | texto, topo escuro, botões primários, pílula do seletor |
| `--ink2` | `#55504A` | texto secundário |
| `--muted` | `#8A847A` | texto terciário |
| `--line` | `#E6E0D4` | divisórias |
| `--olive` | `#5B574E` | atalho Desempenho, barras neutras |
| `--red` / `--redbg` | `#B42318` / `#FBEAE8` | **novo** (7 dias), badge de avisos |
| `--amber` / `--amberbg` | `#865708` / `#F4E4C2` | **atenção** (novo token): parado há mais de 90 dias, vence este ano, delta negativo |
| `--gold` | `#E8C27A` | âmbar sobre fundo escuro (link de parados, card selecionado, filtro) |
| `--green` / `--greenbg` | `#2F7A4D` / `#E6F2EA` | levantado, favorável |
| `--blue` / `--bluebg` | `#1F4E8C` / `#E8EFF8` | seguindo, vigente |
| `--gray` / `--graybg` | `#5E5A53` / `#E7E3DB` | ativo comum, encerrado |
| Texto em fundo escuro | `#D9D3C8` · `#A9A398` · `#F09A86` (novos) | |

**Paleta de dados** (só em gráficos e barras de dados, sempre com legenda): `--prov #C0472F`, `--poss #CC9433`, `--rem #8E99A5`, `--fav #4A946A`, `--aco #CC9433`, `--desf #C0472F`, `--novos #2D5B87`, `--enc #B5AEA2`, `--grid #ECE7DD`, `--base #CFC8BB`, `--axis #8F897F`, rótulo de ano `#AAA397`.

### Raios
Celular 56 · topo escuro 24 · cards e listas 22 · atalhos e KPI 20 · cards de contrato 22 · dica, botões e busca 14–16 · seletor 14 (trilho) / 11 (pílula) · pills e chips 999 · folha inferior 26 (só no topo) · ícones e avatares em círculo · ícone de linha 11.

### Espaçamento
Margem lateral das telas 20 px (24 px no onboarding) · padding de card 16 · gap da grade 10 · cabeçalho de seção 22 px em cima e 10 px embaixo · linhas de lista com 12–13 px vertical e 14–16 px horizontal · cabeçalho fixo das telas internas com 48 px · barra de abas com 84 px · área de toque mínima de 44 px.

### Tipografia
Fonte **Lexend** (300/400/500/600/700), com fallback `ui-rounded, 'SF Pro Rounded', system-ui`. Números com `font-variant-numeric: tabular-nums`.

| Token | Base (px) | Uso |
|---|---|---|
| `--fs-xs` | 11 | rótulos pequenos |
| `--fs-sm` | 12,5 | subtítulos, chips |
| `--fs-md` | 14 | linhas de lista |
| `--fs-body` | 15 | corpo, valores de linha |
| `--fs-lg` | 17 | títulos de seção |
| `--fs-xl` | 21 | saudação, números médios |
| `--fs-2xl` | 28 | título da tela (h1) |
| `--fs-hero` | 32 | valor do topo do Início |
| extras | 11,5 · 12 · 13 · 13,5 · 20 · 25 · 30 | telas novas (valor de KPI 25, topo escuro 30) |
| SVG | 8,5 · 9 · 9,5 · 10 | eixos e rótulos dos gráficos |

**Multiplicador de texto:** `--ts` = **1** (Padrão), **1,15** (Maior) e **1,3** (Muito maior). Todo tamanho é `calc(Npx * var(--ts))`. Nos gráficos, `--cts: calc(1 + (var(--ts) - 1) * .7)`, ou seja, 1 / 1,105 / 1,21. Na barra de abas o texto é limitado a 13 px.

```css
:root{
  --bg:#F2EFE8;--card:#FFFDF8;--beige:#DCD3C2;--beige2:#E9E3D7;--ink:#1C1A17;--ink2:#55504A;--muted:#8A847A;--line:#E6E0D4;--olive:#5B574E;
  --red:#B42318;--redbg:#FBEAE8;--amber:#865708;--amberbg:#F4E4C2;--gold:#E8C27A;--green:#2F7A4D;--greenbg:#E6F2EA;
  --blue:#1F4E8C;--bluebg:#E8EFF8;--gray:#5E5A53;--graybg:#E7E3DB;
  --prov:#C0472F;--poss:#CC9433;--rem:#8E99A5;--fav:#4A946A;--aco:#CC9433;--desf:#C0472F;--novos:#2D5B87;--enc:#B5AEA2;
  --ease:cubic-bezier(0.2,0,0,1);
}
.app{ --ts:1; --cts:calc(1 + (var(--ts) - 1)*.7);
  --fs-xs:calc(11px*var(--ts)); --fs-sm:calc(12.5px*var(--ts)); --fs-md:calc(14px*var(--ts)); --fs-body:calc(15px*var(--ts));
  --fs-lg:calc(17px*var(--ts)); --fs-xl:calc(21px*var(--ts)); --fs-2xl:calc(28px*var(--ts)); --fs-hero:calc(32px*var(--ts)); }
.app[data-text="maior"]{--ts:1.15} .app[data-text="muito-maior"]{--ts:1.3}
```
**Tailwind:** coloque as cores em `theme.extend.colors` (por exemplo `amber: { DEFAULT:'#865708', bg:'#F4E4C2' }`), os raios em `borderRadius` (`card:'22px'`, `hero:'24px'`) e as fontes como `fontSize: { md:'calc(14px*var(--ts))', … }`. A variável `--ts` fica num wrapper (`style={{'--ts': ts}}`). **React Native:** use um `useTextScale()` que devolve `ts` e multiplique os `fontSize` (ou use `PixelRatio`/`allowFontScaling` de forma consistente).

---

## D. Movimento

`EASE = cubic-bezier(0.2, 0, 0, 1)` · `EASE_OUT = cubic-bezier(.2,.7,.2,1)` · `EASE_IN = cubic-bezier(.4,0,1,1)`

| Interação | Propriedade | Duração (ms) | Curva | Com movimento reduzido |
|---|---|---|---|---|
| Abrir tela interna (push) | `transform: translateX(100%→0)`. A tela de baixo vai a `translateX(-28%)` com `brightness(.94)` | 320 | EASE | fade 0→1 em 160 |
| Voltar (pop) | o inverso (100% / 0) | 280 | EASE | fade 1→0 em 140 |
| Trocar de aba | sai com `opacity`, entra com `opacity` + `scale(.985→1)` (atraso de 80) | 90 / 180 | EASE_IN / EASE | fade de 120 |
| Pílula da barra de abas | `transform: translateX(n·100%)` | 320 | EASE | instantâneo |
| Seletor segmentado (pílula) | `transform: translateX` + `width` | 280 | EASE | instantâneo |
| Toque | `transform: scale(.97)` | 180 | EASE | `opacity:.75`, sem escala |
| Contador do Início | número de 0 → valor | 900 | ease-out cúbico | valor final + fade de 200 |
| Anel % levantado | `stroke-dashoffset` C → C·(1−p) | 900 | ease-out cúbico | valor final |
| Linha do gráfico e sparkline | `stroke-dashoffset` len → 0 | 600 (atraso de 240 após o push) | EASE_OUT | já desenhado |
| Barras do gráfico | `transform: scaleY(0→1)`, origem embaixo, defasagem de 25 ms (até 12) | 600 | EASE_OUT | já desenhado |
| Pontos e rótulos do gráfico | `opacity 0→1` (atraso de +380) | 250 | ease | visíveis |
| Barras horizontais (resumo, contratos) | `transform: scaleX(0→1)`, origem à esquerda, defasagem de 20 ms | 600 | EASE_OUT | visíveis |
| Fechar dica | opacidade (até 35%), depois `height`/`margin` → 0 e `scale(.96)` | 360 | EASE | fade de 150 |
| Folha inferior abrir / fechar | overlay `opacity` + folha `translateY(100%↔0)` | 200 / 320 · 180 / 240 | ease / EASE · EASE_IN | fade de 160 / 140 |
| Título no cabeçalho fixo | `opacity` quando a rolagem passa de 56 px | 200 | ease | igual |
| Troca de fluxo (login → onboarding → tour → app) | `opacity` + `scale(1.015→1)` | 320 | EASE | fade de 160 |
| Passos de onboarding e tour | sai 24 px / entra 24 px + `opacity` | 140–160 / 260 | EASE_IN / EASE | fade de 160 |

**Regra:** a animação de desenho roda **só na primeira exibição** de cada gráfico (chave = indicador + período). Trocar de filtro não redesenha o que já foi visto.

### Trechos para copiar

**Toque e movimento reduzido**
```css
.pressable{transition:transform .18s var(--ease),background-color .18s var(--ease),opacity .18s}
.pressable:active{transform:scale(.97)}
@media (prefers-reduced-motion: reduce){ .pressable:active{transform:none;opacity:.75} *{scroll-behavior:auto} }
```

**Push e pop (Web Animations API)**
```js
const EASE='cubic-bezier(0.2,0,0,1)', RM=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function pushAnim(screen, under){
  if(RM()) return screen.animate([{opacity:0},{opacity:1}],{duration:160});
  screen.animate([{transform:'translateX(100%)'},{transform:'none'}],{duration:320,easing:EASE});
  under.animate([{transform:'none',filter:'brightness(1)'},{transform:'translateX(-28%)',filter:'brightness(.94)'}],{duration:320,easing:EASE,fill:'forwards'});
}
function popAnim(screen, under){
  if(RM()) return screen.animate([{opacity:1},{opacity:0}],{duration:140}).finished;
  under.getAnimations().forEach(a=>a.cancel());
  under.animate([{transform:'translateX(-28%)',filter:'brightness(.94)'},{transform:'none',filter:'brightness(1)'}],{duration:280,easing:EASE});
  return screen.animate([{transform:'none'},{transform:'translateX(100%)'}],{duration:280,easing:EASE,fill:'forwards'}).finished;
}
```
*React:* Framer Motion `AnimatePresence` com `initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{duration:.32, ease:[0.2,0,0,1]}}` e `useReducedMotion()`. *React Native:* `@react-navigation/native-stack` (`animation:'slide_from_right'`, ou `'fade'` se `AccessibilityInfo.isReduceMotionEnabled()`).

**Seletor segmentado com pílula deslizante**
```html
<div class="seg" role="tablist"><i class="seg-ind"></i>
  <button class="on" role="tab" aria-selected="true">Ativos</button><button role="tab">Levantados</button><button role="tab">Todos</button>
</div>
```
```css
.seg{position:relative;display:flex;background:var(--beige2);border-radius:14px;padding:3px;gap:2px}
.seg-ind{position:absolute;top:3px;bottom:3px;left:0;border-radius:11px;background:var(--ink);pointer-events:none}
.seg button{position:relative;z-index:1;flex:1;padding:8px 6px;border-radius:11px;font-size:calc(13px*var(--ts));color:var(--ink2);transition:color .2s}
.seg button.on{color:#fff}
```
```js
function placeSeg(seg, from){ // from = {x,w} da posição anterior (ou null)
  const b=seg.querySelector('button.on'), ind=seg.querySelector('.seg-ind'), to={x:b.offsetLeft,w:b.offsetWidth};
  ind.style.transform=`translateX(${to.x}px)`; ind.style.width=to.w+'px';
  if(from && !RM()) ind.animate([{transform:`translateX(${from.x}px)`,width:from.w+'px'},{transform:`translateX(${to.x}px)`,width:to.w+'px'}],{duration:280,easing:EASE});
}
// Recalcule ao mudar o tamanho do texto e quando as fontes carregarem (document.fonts.ready).
```
*React:* Framer Motion `<motion.i layoutId="seg-pill" />` dentro do botão ativo. *Tailwind:* `transition-[transform,width] duration-[280ms] ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none`.

**Contador e anel**
```js
function countUp(el, ring, target, pct, C){ // C = 2πr
  const end=C*(1-pct/100), fmt=new Intl.NumberFormat('pt-BR');
  if(RM()){ el.textContent='R$ '+fmt.format(target); ring.setAttribute('stroke-dashoffset',end); return; }
  const t0=performance.now(), dur=900, eo=t=>1-Math.pow(1-t,3);
  (function step(now){ const p=Math.min(1,(now-t0)/dur), e=eo(p);
    el.textContent='R$ '+fmt.format(Math.round(target*e));
    ring.setAttribute('stroke-dashoffset', C-(C-end)*e);
    if(p<1) requestAnimationFrame(step); })(t0);
}
```
```html
<svg width="66" height="66" viewBox="0 0 66 66"><circle cx="33" cy="33" r="27" fill="none" stroke="#3B3731" stroke-width="6"/>
<circle id="ring" cx="33" cy="33" r="27" fill="none" stroke="#FFFDF8" stroke-width="6" stroke-linecap="round"
 stroke-dasharray="169.65" stroke-dashoffset="169.65" transform="rotate(-90 33 33)"/></svg>
```

**Desenho dos gráficos (linhas, barras e barras horizontais)**
```css
.chart rect:not(.hit), .spk rect{transform-box:fill-box;transform-origin:50% 100%}
.track > i, .sbar{transform-origin:left center}
.chart .ax{font-size:calc(9.5px*var(--cts))} .chart .pv{font-size:calc(9px*var(--cts))} .chart .cv{font-size:calc(10px*var(--cts))}
```
```js
function drawIn(root, delay=0){
  if(RM()) return; const E='cubic-bezier(.2,.7,.2,1)', D=600;
  root.querySelectorAll('svg.chart polyline, svg.spk polyline').forEach(pl=>{ const len=pl.getTotalLength();
    pl.style.strokeDasharray=`${len} ${len}`;
    pl.animate([{strokeDashoffset:len},{strokeDashoffset:0}],{duration:D,delay,easing:E,fill:'backwards'})
      .finished.then(()=>pl.style.strokeDasharray=''); });
  root.querySelectorAll('svg.chart rect:not(.hit), svg.spk rect').forEach((r,i)=>
    r.animate([{transform:'scaleY(0)'},{transform:'scaleY(1)'}],{duration:D,delay:delay+Math.min(i,12)*25,easing:E,fill:'backwards'}));
  root.querySelectorAll('svg.chart circle, svg.chart text.pv, svg.chart text.cv').forEach(c=>
    c.animate([{opacity:0},{opacity:1}],{duration:250,delay:delay+380,fill:'backwards'}));
  root.querySelectorAll('.track > i, .sbar').forEach((b,i)=>
    b.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:D,delay:delay+Math.min(i,10)*20,easing:E,fill:'backwards'}));
}
```
*React Native:* `react-native-svg` + Reanimated (`useAnimatedProps` para `strokeDashoffset` e `scaleY`), mantendo a mesma lógica e as mesmas durações.

**Fechar a dica**
```js
function closeTip(t){ const h=t.offsetHeight;
  if(RM()) return t.animate([{opacity:1},{opacity:0}],{duration:150}).finished.then(()=>t.remove());
  t.animate([{height:h+'px',opacity:1,transform:'scale(1)'},{height:h+'px',opacity:0,transform:'scale(.96)',offset:.35},
             {height:'0px',opacity:0,marginTop:'0px',marginBottom:'0px',transform:'scale(.96)'}],
            {duration:360,easing:EASE,fill:'forwards'}).finished.then(()=>t.remove()); }
```

### Ajustes de cor dos gráficos na v3 (sobre `ref/especificacao-graficos.md`)
Vale tudo o que está na especificação (dados, `viewBox 0 0 320 172`, paddings, escalas, toques, `<title>`/`<desc>`, estados vazios). As exceções são estas:
- Linha e pontos: `#1C1A17` (era `#1D1C19`). Fundo do card: `#FFFDF8` (era `#FDFCF9`).
- Os textos do SVG escalam com `--cts` (texto 1,3 → ×1,21).
- Delta negativo nos cards: âmbar (`#865708`, e `#E8C27A` no card escuro), em vez de vermelho.
- "Mantido" no total em 3 colunas usa a cor de dados `#C0472F`, a mesma da legenda.
- Os IDs de `<title>`/`<desc>` são únicos por gráfico (o protótipo usa um contador).

---

## E. Dados: o que é placeholder e o que confirmar

**Confirmar com dados reais**
1. **Critério de "parado".** O protótipo considera parado o bloqueio ativo com data **há mais de 90 dias**, o que dá **14** na base copiada do app original. O Início do app original mostrava **10**. O app real provavelmente usa *sem movimentação há 90 dias*. Defina o critério num lugar só e use o mesmo número no chip do Início, na tela Bloqueios, em Parados e nos Avisos.
2. **Totais do topo.** No protótipo batem com a base (30 ativos, R$ 2.625.700, 24% levantado = R$ 840.700 ÷ R$ 3.466.400). No app real, devem ser **calculados** a partir da mesma fonte da tela Bloqueios.
3. **"Processos ativos por tipo"** precisa incluir "Outras áreas" (3), para somar 58.

**Placeholders do protótipo (substituir por dados reais)**
- Os itens de "Hoje no escritório" (o protótipo usa só o levantamento de 08/10 como real), "3 que você segue" e os status dos processos seguidos.
- Respostas da IA (simuladas), conteúdo de Reclamação constitucional e "Avisos".
- As 14 "Outras organizações" genéricas. As 3 primeiras (Instituto Vida Plena 12, Associação Caminho Novo 8, Centro Social Mãos Unidas 5) vêm do original.
- **Números de processo (CNJ):** fictícios, gerados por semente.
- **Desempenho**, conforme `ref/mudancas.md`: encerrados de 2024 e 2025, processos novos (entradas), valores em discussão e condenação dos encerrados e histórico de levantamentos de 2024–2025 são **inventados**. As datas de liberação dos 9 levantados de 2026 são de exemplo. Os 9 encerrados de 2026 (4 favoráveis, 44%) e os totais de Passivo e Bloqueios vêm do app atual.
- **3 contratos placeholder:** AFNE · Município de Mesquita, IGEDES · Município de Belford Roxo e IGEDES · Município de Itaboraí. O app original mostra só 5 de 8 contratos, então vigência, prognóstico, passivo e nº de processos (8, 4 e 2) desses três foram inventados para fechar com os totais por cliente do original. Os outros 5 contratos (Nova Iguaçu, Duque de Caxias, Município do Rio, Estado do RJ e São Gonçalo) foram copiados do original.

**Fórmulas a manter**
- Novo = ativo com ≤ 7 dias. Parado = (critério confirmado).
- % levantado = levantado ÷ (ativo + levantado).
- Índice de êxito = (favoráveis + acordos) ÷ encerrados.
- Valor revertido = (em discussão − condenação/acordo) ÷ em discussão.
- Carteira no fim do mês = ativos hoje − novos posteriores + encerrados posteriores.
- Levantamentos contam pela **data de liberação**.
