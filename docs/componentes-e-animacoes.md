# Componentes e animações extraídos dos vídeos

Referência única do que tiramos dos dois reels e de como virou código. Use este arquivo antes de criar uma tela nova, para reaproveitar o nome, a anatomia e o tempo de cada peça em vez de reinventar.

Última atualização: 15/10/2026 (versão 12).

## Fontes

| Vídeo | O que mostra | Duração |
|---|---|---|
| **Vídeo 1 — FlowAI** (reel de tanjimislam27) | Dashboard de automação de workflows com IA, em tema claro. Painel de notificações que abre pela direita. | 15,9 s |
| **Vídeo 2 — Buildex** (reel de sujon.co e oripioagency) | CRM imobiliário com IA. Caixa "Intelligent Box" que leva a uma conversa, depois a cartões, um modal de ação e uma confirmação. | 35,6 s |
| **Vídeo 3 — App de saúde** (reel de 60fps.design) | Grade de quatro blocos coloridos (atividade, coração, sono, passos). Cada bloco cresce até virar a própria tela. | 12,8 s |
| **Vídeo 4 — Fernly** (reel de prem465135) | Painel de projetos em verde. Números que acompanham mudanças, odômetro, cartões que se reorganizam ao filtrar, gráfico com leitura pelo dedo, troca de período. | 30,4 s |

Onde isso foi aplicado:

- **Pauta Jurídica**: painel de escritório no estilo do Buildex, com o fluxo de IA completo e demonstração automática.
- **App dos Sócios, versão 10**: os padrões dos vídeos 1 e 2 adaptados à paleta osso/latão/oliva e à tipografia Inter Tight + Newsreader. Componentes com prefixo `V10`.
- **App dos Sócios, versão 11**: os padrões dos vídeos 3 e 4 e uma revisão de espaço nas telas. Componentes com prefixo `V11`.
- **App dos Sócios, versão 12**: zoom dos gráficos, caminho do dinheiro em cada bloqueio e resumo "Desde a sua última visita". Componentes com prefixo `V12`.

---

## 1. Inventário de componentes

Granularidade do Semantic IxD: controles atômicos → widgets → arquétipo de tela.

### Vídeo 1 — FlowAI

**Arquétipo:** Executive Dashboard com sidebar fixa e painel lateral sob demanda.

| Componente | Nível | Anatomia | Estados vistos |
|---|---|---|---|
| `SidebarNav` | Widget | Logo; grupo "Workspaces" (Dashboard, Workflow Library com badge 28, Workflow Canvas, Templates, Analytics, Team Members com badge 35+, Integrations); grupo "Agent Managements" (Settings, Help, Appearance com toggle de tema); lista "Workflow Runs" com ponto colorido; uso "885/1000" com botão Upgrade; perfil no rodapé | Item ativo em pílula cinza; badges azul e verde |
| `TopBar` | Widget | Breadcrumb; `InputSearch`; botão "Ask AI" com ícone de brilho; sino com badge | Sino ativo (preto) quando o painel está aberto |
| `StatCard` | Widget | Ícone pequeno, rótulo, número grande, rodapé com variação "+12% from last week" | Variação verde ou vermelha |
| `WorkflowTable` | Widget | Nome com ponto colorido, Trigger, Total Runs, Success %, Last Run com relógio, Status em pílula "Active", ações View/Edit | Success % em verde, âmbar ou vermelho conforme a faixa |
| `TemplateCard` | Widget | Ilustração, título, badge de status, avatares | Active, Paused |
| `NotificationDrawer` | Widget | Título "Notification", "Mark all read", fechar; abas segmentadas All/Error/Success/Info com contador; itens com ícone de status, título, descrição truncada, tempo e chip do tipo | Aba ativa em cartão branco sobre trilho cinza |
| `ButtonPrimary` | Controle | Pílula preta com ícone "+" ("Created Workflow") | — |
| `DateChip` | Controle | Pílula branca com calendário ("27 April, 2026") | — |

### Vídeo 2 — Buildex

**Arquétipo:** Executive Dashboard com navegação em pílulas no topo e uma tela de conversa com IA em tela cheia.

| Componente | Nível | Anatomia | Estados vistos |
|---|---|---|---|
| `TopNavPills` | Widget | Logo; pílulas Dashboard, Listing, Lead, Analytics, Portfolio, Deals, Ask AI; à direita busca, sino com badge, sol/lua e avatar | Ativa em pílula preta |
| `PerformanceCard` | Widget | Barras empilhadas em roxo (3 tons) ligadas por faixas translúcidas; total no topo de cada barra; legenda; à direita uma lista de KPIs (Total Revenue grande, depois Active Leads, Active Listing, Total Closed com variação verde) | — |
| `UpcomingSchedule` | Widget | Faixa de dias da semana com o dia atual em pílula preta; eventos em pílulas com ícone, título, subtítulo, bandeira de prioridade e horário | Prioridade High, Medium, Low |
| `IntelligentBox` | Widget | Cartão **preto** com título e dois botões redondos (brilho e expandir); painel branco interno com 3 chips de sugestão de ícone colorido; ilustração de prédios em matriz de pontos; campo "Ask Anything…" com botão enviar | Botão enviar cinza vazio, preto com texto |
| `ActiveListingTable` | Widget | Foto, nome, endereço, tipo, unidades, custo, avatares de leads, views, status | Available, Pending |
| `ChatBubbleUser` | Controle | Bolha preta alinhada à direita | — |
| `ThinkingIndicator` | Controle | Ícone de brilho mais "Thinking…" | Animado |
| `ResultCardCarousel` | Widget | Saudação pequena, frase-resumo em negrito, explicação; chips de filtro removíveis; botão "Send"; cartões com foto, nome, preço, descrição, quartos, banheiros e área; paginação "3/12" com setas; ações curtir, não curtir e compartilhar | Cartão selecionado com borda roxa |
| `RecommendationModal` | Widget | Resumo do imóvel; "Recommended Leads" com checkbox, avatar, nome, cidade e "% Match" verde; campo de nota com menção `@Client` destacada; Cancel e Next | Leads desmarcados somem; a nota aparece depois da seleção |
| `SuccessModal` | Widget | Check verde grande; "Recommendation sent"; texto; lista de destinatários com "Delivered" verde; View Leads e Done | — |

### Vídeo 3 — App de saúde

**Arquétipo:** grade de blocos (bento) com detalhe em tela cheia.

| Componente | Nível | Anatomia | Estados vistos |
|---|---|---|---|
| `MetricTile` | Widget | Bloco quadrado com cor própria por métrica; ícone ou ilustração grande com o número no centro; três linhas de rótulo e valor embaixo | Selo de check verde no sono |
| `MetricDetail` | Arquétipo | Mesma cor do bloco em tela cheia; abas entre métricas irmãs (Activity, Heart, Sleep, Steps); faixa da semana com valor por dia; número grande; três números secundários; gráfico de barras do dia | Dia atual marcado |
| `DayPager` | Controle | Pílula "Today" com dias anteriores e seguintes | — |

### Vídeo 4 — Fernly

**Arquétipo:** Executive Dashboard com sidebar e várias telas (Tarefas, Calendário, Analytics, Equipe, Ajustes).

| Componente | Nível | Anatomia | Estados vistos |
|---|---|---|---|
| `StatTile` | Widget | Quatro números (Total, Ended, Running, Pending) com seta; o primeiro em verde escuro | Valores que mudam juntos ao criar projeto |
| `ProjectAnalytics` | Widget | Barras arredondadas em pílula, as do passado listradas | — |
| `TimeTracker` | Widget | Cartão verde escuro com textura de linhas; cronômetro grande; pausar e parar | Dígitos rolando |
| `ProgressGauge` | Widget | Meio anel com porcentagem | — |
| `KanbanBoard` | Widget | Colunas Todo, In Progress, In Review, Done | Cartão sendo arrastado |
| `TeamGrid` | Widget | Cartões de pessoa com avatar, cargo e ações; chips de área | Filtro por área |
| `ThroughputChart` | Widget | Área verde com linha deste período e pontilhada do anterior; dica escura com o valor do dia | Linha vertical acompanhando o cursor |
| `PeriodSwitch` | Controle | 7D, 30D, 90D | Números recontando |
| `AccentPicker` | Controle | Forest, Ocean, Plum, Ember | Recolore o app inteiro |

---

## 2. Catálogo de animações

Cada animação tem um nome, o gatilho, o que muda, a duração e a curva. As classes `v10-*` estão no App dos Sócios; as do Pauta estão entre parênteses quando o nome é diferente.

| # | Nome | Origem | Gatilho | O que muda | Duração · curva | Onde usamos |
|---|---|---|---|---|---|---|
| A1 | **Surgir do desfoque** (`v10-surge`; Pauta `rev`) | V1 e V2 | Bloco entra na tela | `opacity 0→1`, `translateY 10px→0`, `blur 6px→0` | .6 s · `cubic-bezier(.2,.8,.2,1)` | Seções do relatório da IA, cartões, itens de lista, notificações |
| A2 | **Cascata** | V1 e V2 | Vários itens irmãos entram juntos | A1 com atraso por índice | 80 ms por item, teto de 10 itens | Cartões de processo, linhas da confirmação, grupos de notificação |
| A3 | **Contador** | V1 | Número grande aparece | Valor sobe de 0 até o final | 900–1200 ms · ease-out cúbico | Hero "Bloqueado hoje" (já existia), KPIs do Pauta |
| A4 | **Barra cresce** (`v10-cresce`; Pauta `grow`) | V2 | Gráfico aparece | `scaleY .04→1` a partir da base | .8 s · `cubic-bezier(.2,.8,.2,1)`, 70 ms entre colunas | Gráfico empilhado por mês |
| A5 | **Faixas de ligação** (`v10-faixa`) | V2 | Depois das barras | `opacity 0→1` das faixas entre colunas, na cor do segmento com 17–20 % de opacidade | .7 s com .45 s de atraso | Gráfico empilhado por mês |
| A6 | **Digitação** | V2 | Toque num chip de sugestão | Texto aparece letra por letra, com cursor piscando | 22 ms por letra, +14 ms no espaço, +90 ms na pontuação, ±16 ms aleatório | Caixa "Pergunte à IA" na Início; nota do modal no Pauta |
| A7 | **Botão enviar acende** | V2 | Campo deixa de estar vazio | Fundo cinza → preto, `scale 1→1.06` | .25 s | Caixa da IA, compositor do chat |
| A8 | **Pensando com brilho** (`v10-brilho` + `v10-pulsa`) | V2 | IA começou a responder | Gradiente corre pelo texto; ícone de brilho pulsa e gira 18° | 1,6 s linear infinito · 1,3 s ease-in-out infinito | "Analisando a pergunta…" / "Consultando a base…" |
| A9 | **Etapas reais** | V2 | Cada chamada de função da IA | Nova linha surge (A1); a última tem spinner, as anteriores viram check verde | Spinner 1 s linear | Lista de consultas sob "Consultando a base…"; ao terminar vira "N consultas à base" |
| A10 | **Painel lateral desliza** | V1 | Toque no sino | Painel entra pela direita sobre o conteúdo desfocado | ~.3 s | Pauta (referência); no App dos Sócios virou folha inferior |
| A11 | **Folha inferior** (`guia-sheet`) | adaptação de A10 | Escolher ação | `translateY 100%→0`; fundo com véu e `blur(3px)` | .26 s · `cubic-bezier(.2,.8,.2,1)` | Folha "O que fazer com este processo" |
| A12 | **Modal entra** (Pauta `pop`) | V2 | Abrir recomendação | `scale .94→1`, `translateY 10px→0`, `blur 6px→0` | .42 s · `cubic-bezier(.2,.9,.25,1.05)` | Modal "Medida recomendada" do Pauta |
| A13 | **Marcar checkbox** (`v10-marca`) | V2 | Toque na opção | Fundo vazio → preto; o check se desenha (`stroke-dashoffset 24→0`) | .3 s com .05 s de atraso | Opções da folha de ação |
| A14 | **Check de sucesso** (`v10-pop` + `v10-risco`) | V2 | Ação concluída | Círculo verde `scale .3→1` com salto; anel que se expande e some; o check se desenha | .6 s · `cubic-bezier(.3,1.7,.5,1)`; anel 1,1 s (+.2 s); traço .4 s (+.35 s) | Tela "Pronto" |
| A15 | **Volta com destaque** (`v10-destaque`) | V2 (status na tabela) | Volta à lista depois da ação | Fundo da linha em latão claro `#F2E8D3`, que se apaga | 2,4 s ease-out | "Processos que acompanho" |
| A16 | **Troca de aba** | V1 | Abas Todos/Erros/Sucesso | Conteúdo some e entra (A1 por grupo) | .6 s | Filtros das Notificações |
| A17 | **Zoom entre telas** (Pauta `vin` / `vback`) | V1 e V2 | Painel ↔ conversa | Entrada `scale .985` com desfoque; volta `scale 1.025` com desfoque | .55–.6 s | Pauta |
| A18 | **Toast** (Pauta) | — | Fim do fluxo | Pílula sobe de 12 px com leve salto | .45 s · `cubic-bezier(.2,.9,.3,1.2)` | Pauta: "Tarefa criada para…" |
| A19 | **Bloco vira a tela** (`V11Palco`) | V3 | Toque num atalho da Início | Uma cópia do atalho, na cor dele, cresce até ocupar a tela e some sobre a tela nova. Ao voltar, a tela encolhe até o atalho de origem | Abrir .42 s, fechar .46 s · `cubic-bezier(.2,.8,.2,1)`; o rótulo some nos primeiros .2 s | Atalhos Processos, Bloqueios, Passivo e Desempenho |
| A20 | **Odômetro** (`V11Odo`) | V4 | Valor aparece ou muda | Cada algarismo é uma fita de 0 a 9 que rola até o dígito certo; da direita para a esquerda, 35 ms entre algarismos | .75 s · `cubic-bezier(.2,.8,.2,1)` | Valor bloqueado ao filtrar por cliente; indicadores do Desempenho; página do cliente |
| A21 | **Cartões encontram o lugar** (`V11useFlip`) | V4 | Mudança de filtro | Quem continua desliza da posição antiga para a nova; quem chega surge com leve escala, 40 ms entre itens | .42 s deslizar, .36 s surgir · `cubic-bezier(.2,.8,.2,1)` | Lista de Processos; Notificações |
| A22 | **Linha se desenha** (`v11-traco`) | V4 | Gráfico de linha aparece | O traço avança da esquerda para a direita; a área sob a linha aparece no fim | 1,1 s (+.15 s) · `cubic-bezier(.4,0,.2,1)`; área .6 s (+.9 s) | Gráficos de linha dos relatórios da IA |
| A23 | **Valor no ponto** | V4 | Dedo ou cursor sobre o gráfico | Pílula escura com o valor acompanha o ponto selecionado; desce para baixo do ponto quando falta espaço em cima | Imediato | Gráficos de linha de série única |
| A24 | **Período recontando** | V4 | Troca de período no Desempenho | Os quatro indicadores rolam (A20) para os valores do novo período; os gráficos recomeçam no último mês | Mesma do A20 | Desempenho: 2026, 6 meses, 3 meses |
| A25 | **Abas entre irmãos** (`V11AbasClientes`) | V3 | Toque em outro cliente | A aba ativa vai para o centro da faixa; os números da página rolam para os do novo cliente | Rolagem suave; números como A20 | Página do cliente |
| A26 | **Gráfico ampliado** (`V12Zoom`) | adaptação de A19 | Botão de lupa no canto do gráfico, ou "Ampliar o gráfico" no Desempenho | O cartão do gráfico cresce até a tela inteira e o conteúdo aparece em seguida; ao fechar, encolhe de volta ao cartão | Abrir .42 s · `cubic-bezier(.2,.8,.2,1)`; conteúdo .25 s (+.18 s); fechar .34 s | Todos os gráficos dos relatórios da IA e do Desempenho |
| A27 | **Valor que segue o dedo** | V4 | Arrastar um dedo sobre o gráfico ampliado | O mês e o valor no topo (44 px) mudam enquanto o dedo passa; o ponto escolhido cresce e uma linha vertical marca o mês | Imediato; vibração curta ao trocar de mês, onde o aparelho permite | Gráfico ampliado |
| A28 | **Pinça muda o período** | — | Dois dedos se afastando ou se aproximando | O número de meses visíveis cai ou sobe (mínimo 3), centrado entre os dedos; a linha se redesenha | Redesenho .5 s | Gráfico ampliado; toque duplo volta a mostrar tudo; há botões "Tudo / 6 meses / 3 meses" e "Antes / Depois" para quem não usa gestos |
| A29 | **Caminho do dinheiro** (`V12Caminho`) | — | Abrir um bloqueio | A barra se divide em perdido, devolvido e ainda bloqueado; cada parte cresce da esquerda, 120 ms entre partes | .7 s · `cubic-bezier(.2,.8,.2,1)` | Detalhe e folha do bloqueio |

### Trechos de CSS para copiar

```css
/* A1 — surgir do desfoque */
.v10-surge{ animation: v10surge .6s cubic-bezier(.2,.8,.2,1) both; }
@keyframes v10surge{ from{ opacity:0; transform:translateY(10px); filter:blur(6px); } }

/* A4 + A5 — barras e faixas */
.v10-cresce{ transform-box:fill-box; transform-origin:50% 100%; animation: v10cresce .8s cubic-bezier(.2,.8,.2,1) both; }
@keyframes v10cresce{ from{ transform:scaleY(.04); } }
.v10-faixa{ animation: v10fade .7s .45s both; }
@keyframes v10fade{ from{ opacity:0; } }

/* A8 — pensando com brilho */
.v10-brilho{ background:linear-gradient(90deg,#8C877C 0%,#1A1916 45%,#8C877C 90%); background-size:220% 100%;
  -webkit-background-clip:text; background-clip:text; color:transparent; animation: v10brilho 1.6s linear infinite; }
@keyframes v10brilho{ from{ background-position:120% 0; } to{ background-position:-120% 0; } }
.v10-pulsa{ animation: v10pulsa 1.3s ease-in-out infinite; }
@keyframes v10pulsa{ 50%{ transform:scale(.78) rotate(18deg); opacity:.6; } }

/* A14 — check de sucesso */
.v10-pop{ animation: v10pop .6s cubic-bezier(.3,1.7,.5,1) both; position:relative; }
.v10-pop::after{ content:""; position:absolute; inset:0; border-radius:999px; border:2px solid #2F7A4D; animation: v10anel 1.1s .2s ease-out both; }
@keyframes v10pop{ from{ transform:scale(.3); opacity:0; } }
@keyframes v10anel{ from{ transform:scale(1); opacity:.7; } to{ transform:scale(1.8); opacity:0; } }
.v10-risco path{ stroke-dasharray:24; stroke-dashoffset:24; animation: v10risco .4s .35s ease-out forwards; }
@keyframes v10risco{ to{ stroke-dashoffset:0; } }

/* A15 — volta com destaque */
.v10-destaque{ animation: v10destaque 2.4s ease-out; }
@keyframes v10destaque{ 0%,35%{ background:#F2E8D3; } 100%{ background:transparent; } }

/* Movimento reduzido: tudo para, e o check aparece já desenhado */
@media (prefers-reduced-motion: reduce){
  .v10-surge,.v10-cresce,.v10-faixa,.v10-brilho,.v10-pulsa,.v10-pop,.v10-pop::after,.v10-destaque{ animation:none !important; }
  .v10-brilho{ color:#1A1916; background:none; }
  .v10-risco path{ stroke-dashoffset:0 !important; animation:none !important; }
}
```

```css
/* A20 — odômetro: cada algarismo é uma fita de 0 a 9 */
.v11-odo-col{ display:inline-block; height:1.12em; line-height:1.12em; overflow:hidden; vertical-align:top; }
.v11-odo-fita{ display:flex; flex-direction:column; transition: transform .75s cubic-bezier(.2,.8,.2,1); }
/* a fita recebe transform: translateY(-dígito * 10%) */

/* A22 — linha que se desenha (o path recebe pathLength="1") */
.v11-traco{ stroke-dasharray:1; stroke-dashoffset:1; animation: v11traco 1.1s .15s cubic-bezier(.4,0,.2,1) forwards; }
@keyframes v11traco{ to{ stroke-dashoffset:0; } }
```

### Bloco vira a tela (A19) e cartões encontram o lugar (A21)

Os dois usam a Web Animations API (`element.animate`) e medem posições com `getBoundingClientRect`.

- **A19:** ao tocar no atalho, guarda a posição dele e desenha por cima de tudo um retângulo na mesma cor, que anima de `left/top/width/height` do atalho até a tela inteira. Na volta, faz o caminho inverso até o atalho com a mesma etiqueta (`data-v11-morf`). Se o atalho estiver fora da vista, rola a Início até ele antes de encolher.
- **A21 (técnica FLIP):** antes de mudar o filtro, guarda a posição de cada item marcado com `data-flip`. Depois da mudança, cada item que continua começa deslocado para a posição antiga e anima até a nova; quem chegou surge.

### Digitação (A6) em JavaScript

```js
// Digita um texto letra por letra; devolve uma função que cancela.
function digitar(texto, set, aoFim) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { set(texto); aoFim?.(); return () => {}; }
  let i = 0, vivo = true;
  const passo = () => {
    if (!vivo) return;
    i++; set(texto.slice(0, i));
    if (i >= texto.length) return aoFim?.();
    const c = texto[i - 1];
    setTimeout(passo, 22 + (c === " " ? 14 : 0) + (/[,.?]/.test(c) ? 90 : 0) + Math.random() * 16);
  };
  passo();
  return () => { vivo = false; };
}
```

### Regras de uso

- **Cascata só na primeira vez.** O relatório da IA aplica atraso por índice apenas quando abre pronto (relatório fixado). Durante a escrita ao vivo, cada bloco surge sem atraso, conforme chega.
- **Um momento forte por fluxo.** O salto do check (A14) é reservado à conclusão de uma ação. Não usar em carregamentos comuns.
- **Movimento reduzido sempre respeitado.** Toda classe nova entra no bloco `prefers-reduced-motion`.
- **Animação nunca esconde informação.** Nada fica em `opacity: 0` esperando rolagem; a tela parada já mostra tudo.
- **Odômetro só onde o número muda.** Usar em valores que a sócia pode alterar com um toque (filtro, período, cliente). Leitores de tela recebem o valor completo, não os algarismos soltos.
- **Bloco vira a tela só a partir de um bloco.** A transição de volta acontece apenas quando a tela foi aberta por um atalho; vindo de outro lugar, a volta é a comum.

---

## 3. Padrão de IA: pedido → ação → confirmação

O que fez a IA do Buildex parecer inteligente não foi um efeito isolado, foram três camadas de retorno em sequência.

1. **Pedido.** Chips de sugestão digitam a pergunta (A6) e o botão acende (A7). A pergunta vira bolha escura à direita.
2. **Trabalho visível.** "Consultando a base…" com brilho (A8) e a lista de consultas reais (A9). No App dos Sócios, as etapas vêm das funções que a IA chama (`consultar_dados`, `consultar_cruzado`, `listar_processos`), não de um texto inventado.
3. **Resultado acionável.** Resumo, gráficos e cartões em cascata (A1, A2). O cartão é selecionável e um botão "Escolher o que fazer" abre a folha de ação (A11).
4. **Confirmação.** Check verde (A14), lista do que foi feito com status "Ativo", e um caminho de volta que destaca o item alterado (A15).

**Regra do App dos Sócios que não muda:** a IA nunca é a fonte do número. No bloco de cartões ela só indica **quais** processos mostrar (números CNJ); valores, dias parado e status vêm da base.

Formato do bloco que a IA escreve:

````
```acoes
{"titulo": "Processos para acompanhar", "processos": ["0000000-00.2026.5.01.0000"]}
```
````

---

## 4. Tokens

### Paleta do Buildex (usada no Pauta)

| Papel | Claro | Escuro |
|---|---|---|
| Fundo da página | `#F2F1F5` | `#0D0C11` |
| Cartão | `#FFFFFF` | `#17161D` |
| Texto / apoio | `#15131A` / `#605D6D` | `#F1EFF6` / `#A7A3B5` |
| Linha | `#E8E6EE` | `#2A2833` |
| Roxo da série (3 tons) | `#6A2C96` · `#9B4FCB` · `#C99BEB` | `#8D4BC5` · `#B07AE4` · `#D6B1F4` |
| Botão principal | preto `#15131A` | claro `#F1EFF6` |
| Caixa da IA | `#15131A` | `#211F29` |
| Bom / ruim / atenção / informação | `#1D9A55` / `#D13C58` / `#B4700C` / `#2E6BD8` | `#43C981` / `#F26E86` / `#E6A645` / `#72A2F6` |

### Paleta do App dos Sócios (inalterada na versão 10)

| Papel | Valor |
|---|---|
| Papel (fundo) | `#F2EFE9` |
| Cartão | `#FFFDF9` |
| Texto / apoio | `#1A1916` / `#57544C` |
| Linha | `#E6E1D6` |
| Marca (hero escuro) | `#1F1E1A` |
| Oliva (caixa da IA na Início) | `#565449` |
| Latão, **exclusivo da IA** | `#765614`, fundo `#F2E8D3` |
| Dourado do ícone da IA sobre fundo escuro | `#E8C27A` |
| Risco / Atenção / Em curso / Resolvido | `#B42318` / `#865708` / `#1F4E8C` / `#2F7A4D` |

### Tipografia

| Projeto | Títulos | Interface e números | Dados (CNJ) |
|---|---|---|---|
| Buildex / Pauta | Inter 500, −0,03em | Inter | — |
| App dos Sócios v10 | **Newsreader** 500, −0,02em (saudação 400 e 500) | **Inter Tight**; valores grandes em 500 com −0,035em e algarismos tabulares | IBM Plex Mono |

A Lexend foi trocada porque as formas arredondadas e largas deixavam o app com cara de material escolar.

### Cores do caminho do dinheiro (versão 12)

| Parte | Cor | Uso |
|---|---|---|
| Ainda bloqueado | `#B5832A` | O que segue preso na conta do cliente |
| Devolvido | `#2F7A4D` | O que voltou ao cliente, inclusive desbloqueio parcial |
| Perdido | `#B42318` | O que foi transferido ao credor e não volta |

Sobre o bloco escuro, devolvido e perdido aparecem em tons claros (`#9FD5B4` e `#F4A79C`) para manter o contraste.

### Espaço (versão 11)

- Margem lateral de **20 px** em todas as telas (era 32 px nas listas e 24 px na Início). No celular de 390 px, cada cartão ganha 24 px de largura.
- **Uma superfície escura por tela.** Em Bloqueios, o título saiu do bloco escuro; o bloco que fica concentra o valor, os chips e a divisão por cliente.
- **Telas de lista mostram a lista ao entrar.** Em Processos, abaixo da busca vêm os filtros com contagem e a lista inteira, em vez de só sugestões.

### Forma

- Raio: cartões 20–24 px; cartões de resultado 18–20 px; pílulas 999 px; checkbox 6–7 px.
- Sombra: suave e única (`0 1px 2px` + `0 4px 14px`), aplicada só no que é objeto separado.
- Ícones: traço fino de 1,7–1,8 px, estilo Lucide.

---

## 5. Mapa no código do App dos Sócios v10

| Componente | Função no código | Onde aparece |
|---|---|---|
| Caixa da IA na Início | `V10CaixaIA` | Bloco "Pergunte à IA", entre o resumo e os atalhos; aceita personalização da ordem |
| Cartões de processos | `V10Cartoes` | Bloco ```` ```acoes ```` dentro do relatório da IA |
| Folha de ação + confirmação | `V10Folha`, `V10Opcao` | Abre por cartão ou por linha de tabela da IA |
| Gráfico empilhado por mês | `V10EmpilhadoMes` | Tipo "empilhado" com `agrupar_por: "mes"` |
| Contas bancárias | `V10Contas`, `V10contas` | Tela do contrato de gestão, antes de "Processos deste contrato" |
| Filtro das notificações | `V10GRUPOS`, `V10grupo` | Notificações: Todos, Bloqueios, Movimentações, STF, Avisos e IA |
| Barramento de ações | `V10Bus` | Liga cartões e folha ao estado do app (seguir, alertas, navegação) |
| Correção da transição | `P1` | A tela atual passa a usar sempre os dados mais recentes |

### Versão 11

| Componente | Função no código | Onde aparece |
|---|---|---|
| Bloco vira a tela | `V11Palco`, `V11morfar`, `V11voltar` | Atalhos da Início ↔ Processos, Bloqueios, Passivo, Desempenho |
| Odômetro | `V11Odo` | Bloqueios, Desempenho, página do cliente |
| Cartões encontram o lugar | `V11useFlip` | Lista de Processos, Notificações |
| Lista de processos com filtros | `V11ListaProcessos`, `V11RECORTES` | Tela Processos: Todos, Trabalhista, Cível, Administrativo, STF, Parados 90+, Com bloqueio |
| Abas entre clientes | `V11AbasClientes` | Página do cliente |
| Desempenho por período | `V11serie`, `V11levantados`, `V11PERIODOS` | 2026, 6 meses, 3 meses |
| Linha que se desenha e valor no ponto | classes `v11-traco` e `v11-area` em `sw` | Gráficos de linha da IA |

### Versão 12

| Componente | Função no código | Onde aparece |
|---|---|---|
| Gráfico ampliado | `V12Zoom`, `V12ZoomConteudo`, `V12BotaoAmpliar`, `V12AmpliarDesempenho` | Lupa nos gráficos (`X1` recebe `ampliar` com os dados normalizados); botão no Desempenho |
| Dados do caminho do dinheiro | `V12dinheiro` | Calculado sobre a base: cada bloqueio ganha `original`, `devolvido`, `perdido` e as datas de cada um |
| Caminho do dinheiro | `V12Caminho` | Detalhe e folha do bloqueio |
| Devolvido e perdido no ano | `V12LinhaPerdas` | Bloco escuro de Bloqueios e da página do cliente |
| Desde a sua última visita | `V12Novidades`, `V12visita` | Primeiro bloco da Início; a última visita é gravada quando o app sai da tela |

Também mudou: a aba "Com perda" em Bloqueios; o estado "Perdido" e "Devolvido em parte" nos bloqueios encerrados; no contrato, os números-chave viraram Bloqueado hoje, Devolvido e Perdido; a IA ganhou as métricas `valor_perdido` e `valor_devolvido`.

### O que ficou de fora, de propósito

- **Kanban e arrastar:** o app é só leitura.
- **Cronômetro:** sem uso no app.
- **Troca de cor de destaque:** a paleta tem significado (latão só para a IA, cores de status fixas).
- **Faixa da semana com valores:** viraria calendário, e a sócia não quer prazos.
