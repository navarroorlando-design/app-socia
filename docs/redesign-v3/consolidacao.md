# App dos Sócios v3: consolidação das duas propostas

**Arquivo:** `index.html` (um arquivo só, abre direto do disco). Os atalhos de revisão são `#home`, `#clientes`, `#perfil`, `#detail=bloqueios`, `#detail=passivo>org:afne` e `#detail=desempenho`.

**Base:** a v2 do Designer (`app-socios-v2/index.html`), que já tinha o fluxo completo, o sistema de movimento e a escala de texto. As telas, os dados e os gráficos do Grok Bot (`prototype/app-socios-redesign.html`) foram portados para dentro dela. As referências originais estão em `ref/mudancas.md` e `ref/especificacao-graficos.md`.

**Verificação:** feita com Chromium headless pelo `shoot.js`. Não houve erros no console. Os prints estão em `shots/`.

---

## 1. Conflitos encontrados e como foram resolvidos

### Os acordados no chat
| # | Conflito | Resolução |
|---|---|---|
| 1 | **Grade de atalhos.** A v2 tinha Processos, Bloqueios, Reclamação e Escritório. O Grok Bot usava Processos, Bloqueios, Passivo e Desempenho. | Ficou a grade 2x2 com **Processos, Bloqueios, Passivo e Desempenho**. **Reclamação constitucional** virou uma linha de largura total logo abaixo. O atalho "Escritório" saiu. Na medição feita no tamanho de texto padrão, a grade termina em 501 px e a barra de abas começa em 614 px, então os 4 atalhos aparecem sem rolar. |
| 2 | **Dicas.** A v2 usava uma faixa fina com ×. O Grok Bot usava um card com "Entendi" e ×. | A faixa fina com × ficou em todas as telas (Início, Bloqueios, Passivo e Desempenho). Os cards com "Entendi" saíram. A dica fechada continua fechada até o fim da sessão. |
| 3 | **Duas páginas de cliente.** A v2 tinha uma pela aba Clientes e o Grok Bot outra pelo Passivo. | Agora existe **uma tela só** (`org:<id>`). Ela tem cabeçalho com logo, contagem de processos, contratos e encerrados em 2026, o topo de passivo do cliente, a lista de contratos (com "Ver todos" quando passa de 2) e a seção "Ver também" com Bloqueios, Desempenho e Processos. Ela abre pela aba Clientes, pelo Passivo, pelo seletor de cliente dos Bloqueios ("Página ›" e "Abrir a página de…"), pelo contrato ("Página do cliente") e pelos eventos. O teste automático comparou o HTML das duas entradas e ele é **idêntico**. |
| 4 | **Significado do vermelho.** | **Vermelho = novo** (bloqueio dos últimos 7 dias). O chip "parados" do Início passou para **âmbar**. A mesma regra vale no app todo (detalhes na seção 2). O badge de avisos no avatar continua vermelho, porque é um badge do sistema. |
| 5 | **Movimento.** As telas do Grok Bot só trocavam o conteúdo, sem transição. | Bloqueios, Passivo, Desempenho, página de cliente, contrato e parados entram deslizando da direita, e voltar faz o caminho inverso. Botões e cards encolhem ao toque. Gráficos, sparklines e barras se desenham na primeira vez em 600 ms com ease-out. Os seletores (Ativos/Levantados/Todos, Mês/Contrato, Cliente/Área, período e ordenação dos contratos) têm uma pílula deslizante. Com "Reduzir movimento" ligado, tudo vira fade ou aparece pronto. |
| 6 | **Tamanho do texto.** As telas do Grok Bot usavam px fixos. | Todos os tamanhos passaram a usar `calc(Npx × --ts)`. Nos gráficos, o texto cresce 70% do multiplicador (`--cts`) para continuar legível sem encavalar. Conferido em Muito maior nos prints 10 a 13. |
| 7 | **Tour.** O passo 1 citava "Escritório". | O texto passou a ser: "…quatro atalhos: Processos, Bloqueios, Passivo e Desempenho. A Reclamação constitucional vem numa linha logo depois." Os relatórios fixados continuam sendo 2. |

### Outros conflitos encontrados no cruzamento
| # | Conflito | Resolução |
|---|---|---|
| 8 | **"Parados há 90 dias": 10 x 14.** O Início da v2 (copiado do app original) dizia 10. Na base de 39 bloqueios, que o Grok Bot copiou linha a linha da tela original, **14** bloqueios ativos têm data anterior a 10/07/2026. | A base não foi alterada. O chip do Início, os Avisos e a tela "Parados" agora **calculam o número a partir da base (14)**, e o chip, os Bloqueios e os Avisos concordam entre si. ⚠️ **Confirmar com dados reais:** o app original provavelmente define "parado" como *sem movimentação há 90 dias*, e não pela data do bloqueio. Isso explicaria o 10. |
| 9 | **Totais do topo do Início.** | Batem com a base: 30 ativos, R$ 2.625.700 e 24% já levantado (9 levantados somam R$ 840.700, e 840.700 ÷ 3.466.400 = 24,3%). O Início agora **calcula** esses números a partir da base, em vez de deixá-los escritos no código. |
| 10 | **Processos por cliente.** A aba Clientes (original) mostra AFNE 19, Gnosis 20, FAS 13 e IGEDES 6. Na primeira versão do protótipo do Grok Bot, os contratos de AFNE somavam 17 e os de IGEDES 8. | Não era um erro do original. O original mostra só 5 dos 8 contratos, e os 3 que faltavam (AFNE · Mesquita, IGEDES · Belford Roxo e IGEDES · Itaboraí) foram inventados como placeholders pelo Grok Bot. Os contadores foram corrigidos para Mesquita 8, Belford Roxo 4 e Itaboraí 2. Agora cada cliente bate com a soma dos seus contratos (AFNE 11+8=19, Gnosis 11+9=20, FAS 5+8=13, IGEDES 4+2=6) e o total continua 58. O rótulo provisório "processos nos contratos" voltou a ser "N processos". O `shoot.js` confere essa soma. |
| 11 | **Processos ativos por tipo.** A v2 mostrava Trabalhista 34, Cível 15 e Administrativo 6 (soma 55). O Grok Bot e o original incluíam **Outras áreas 3** (soma 58). | Entrou "Outras áreas · 3". |
| 12 | **Subtítulos dos atalhos.** Na v2 eram "3 em andamento" (Reclamação) e "Por cliente e prazo" (Bloqueios). No original e no Grok Bot, "3 no STF" e "30 ativos". | Ficou como no original: "3 no STF" e "30 ativos · R$ 2,63 mi". Passivo mostra "R$ 7,57 mi estimado" e Desempenho "44% de êxito em 2026", ambos calculados. |
| 13 | **Eventos de "Hoje no escritório"** (textos genéricos da v2) contradiziam a base. "Novo bloqueio · AFNE · há 25 min" não existe na base, onde o mais recente é de 05/10. "Novo processo · IGEDES · há 4 h" também não, porque o último novo é de 30/09. | Esses eventos saíram. Entrou o levantamento real de hoje (R$ 18.400 · AFNE · 08/10). "Ver tudo" ganhou a linha "Nesta semana: 4 bloqueios novos". Os itens "Seguindo" e "Relatório" continuam sendo placeholders. |
| 14 | **Avisos.** O item era "10 bloqueios parados" em vermelho. | O item virou "14 parados" em **âmbar**, e entrou "4 bloqueios novos" em **vermelho**. O total continua 3 avisos, igual ao badge. |
| 15 | **Paleta.** O Grok Bot usava tons próprios: bg #F1EEE7, card #FDFCF9, tinta #1D1C19, topo #22211E, vermelho #A63A2B, azul #2D5B87 e verde #2F6B4B. | Ficaram os tokens da v2/original: bg #F2EFE8, card #FFFDF8, tinta #1C1A17 (inclusive o fundo dos cards escuros), vermelho #B42318, azul #1F4E8C e verde #2F7A4D. Do Grok Bot entraram o **âmbar #865708 / #F4E4C2**, o cinza de status e a paleta de dados dos gráficos, que tem legenda e não se confunde com a interface. |
| 16 | **Vermelho fora da regra nas telas do Grok Bot.** | O avatar da AFNE era vermelho e agora usa o verde da marca (como na v2). O pill "Desfavorável" virou cinza com um ponto terracota. O delta negativo (▼) virou âmbar. Os bloqueios ativos comuns passaram de ocre para **cinza**, e o **âmbar** ficou para "Parado · N dias" e "Vence este ano". Os selos "Novo" (pretos) dos atalhos saíram, porque "Novo" agora tem cor e significado próprios. O terracota (#C0472F) aparece só nos gráficos e barras de dados (Provável, Desfavorável, Mantido), sempre com legenda. |
| 17 | **Cabeçalho.** O Grok Bot tinha um voltar circular e um título compacto ao rolar. A v2 tinha "‹ Tela anterior". | Ficou o "‹ Tela anterior" da v2, com o comportamento do Grok Bot: ao rolar, o cabeçalho fica fixo, mostra o nome da tela e esconde o rótulo do voltar. A posição da tela anterior é preservada, porque a pilha mantém as telas vivas. |
| 18 | **Barra de abas.** O Grok Bot escondia as abas nas telas internas e chamava a aba de "OS". A v2 deixava as abas visíveis e usava "Clientes". | Ficou a v2: abas visíveis e "Clientes". Tocar numa aba fecha a pilha. |
| 19 | **Detalhe do contrato.** O Grok Bot abria numa folha inferior. | Virou uma **tela empurrada** (regra 5), com "Ver bloqueios" e "Página do cliente". Os detalhes rápidos (bloqueio, processo encerrado, processo novo) e o filtro de cliente continuam como folha inferior, agora com o movimento da v2. |
| 20 | **Duas telas de Bloqueios.** A v2 tinha uma tela simples de Bloqueios e uma tela "Escritório". | As duas foram substituídas pelas telas do Grok Bot. A rota antiga `escritorio` redireciona para Passivo. |
| 21 | **Início duplicado.** O Grok Bot tinha uma réplica simplificada do Início. | A réplica foi descartada e ficou o Início da v2, com os atalhos novos. |
| 22 | **Becos sem saída.** Em "Parados" a v2 só mostrava um número. "Outras organizações" tinha nomes genéricos. O Grok Bot respondia avatar, IA, OS e Perfil com "fora do protótipo". | "Parados" agora lista os 14 bloqueios. As 3 primeiras "Outras organizações" usam os nomes e contagens do original (Instituto Vida Plena 12, Associação Caminho Novo 8, Centro Social Mãos Unidas 5), e as outras 14 seguem genéricas. Avatar, IA e Perfil já funcionavam na v2. |
| 23 | **Ordem dos clientes.** O Grok Bot ordenava por valor (Gnosis primeiro). A v2 e o original usavam AFNE, Gnosis, FAS, IGEDES. | A aba Clientes segue a "Ordem dos clientes" do Perfil, como no original. Os resumos de Bloqueios, Passivo e Desempenho ordenam por valor, porque são rankings. |
| 24 | **Formato dos números.** | Valem as regras do Grok Bot: valor completo dentro das telas (R$ 1.767.400) e forma abreviada (R$ 7,57 mi) só nos atalhos e nos totais em 3 colunas do Desempenho. O "R$ 7,57 mi" da tela Escritório da v2 sumiu junto com ela. |
| 25 | **Texto da dica do Início.** A v2 dizia "Personalize o Início". O Grok Bot dizia "Passivo e Desempenho agora têm atalhos". | As duas mensagens foram juntas numa faixa curta: "Passivo e Desempenho ganharam atalhos. Personalize em Perfil." |
| 26 | **Anel e tipografia.** O Grok Bot tinha um anel de 56 px com texto SVG e títulos de 30/24 px fixos. | Ficaram o anel de 66 px da v2 e a escala tipográfica da v2 (Lexend, `--fs-*`). |

---

## 2. Regra de cores (v3)
- **Vermelho #B42318 / #FBEAE8:** *novo*, ou seja, bloqueio ativo dos últimos 7 dias. Também é a cor do badge de avisos do sistema.
- **Âmbar #865708 / #F4E4C2** (dourado #E8C27A sobre fundo escuro): *atenção*. Vale para parado há mais de 90 dias, "Vence este ano", delta negativo e o filtro ativo.
- **Verde #2F7A4D / #E6F2EA:** levantado ou favorável.
- **Azul #1F4E8C / #E8EFF8:** seguindo ou vigente.
- **Cinza #5E5A53 / #E7E3DB:** ativo comum, encerrado ou desfavorável (o pill).
- **Paleta de dados (só em gráficos e barras, sempre com legenda):** Provável e Desfavorável/Mantido #C0472F, Possível e Acordo #CC9433, Remoto #8E99A5, Favorável/Revertido/Liberado #4A946A, Novos #2D5B87, Encerrados #B5AEA2.

---

## 3. Lista completa de mudanças da v3

### Início
- O topo mostra o valor bloqueado logo abaixo da saudação, com valor, nº de ativos, parados e % levantado calculados a partir da base de bloqueios. O valor sobe contando e o anel se preenche.
- Os chips são "**14 parados há 90+ dias**" (âmbar, abre a lista de parados) e "3 que você segue" (azul).
- Há uma faixa de dica fina, que pode ser fechada.
- Atalhos 2x2: Processos (58 no total), Bloqueios (30 ativos · R$ 2,63 mi), Passivo (R$ 7,57 mi estimado) e Desempenho (44% de êxito em 2026). A linha de Reclamação constitucional (3 no STF) vem abaixo.
- "Hoje no escritório" mostra 3 itens e "Ver tudo", que inclui "Nesta semana: 4 bloqueios novos". "Mais detalhes" traz Processos por tipo e Seguidos. As duas seções podem ser desligadas em Perfil → Personalizar Início.
- Avisos (avatar): 4 bloqueios novos, 14 parados e 1 movimentação seguida.

### Abas e IA
- As abas são Início, IA, Clientes e Perfil, com uma pílula deslizante e fade na troca.
- Na IA, as sugestões vêm primeiro e o aviso sobre o Claude fica no rodapé.

### Clientes e página única do cliente
- A grade mostra os 4 principais, com logo e nº de processos. "Outras organizações" tem 3 nomes do original e "Ver mais 14".
- A **página do cliente** tem cabeçalho (logo, processos, contratos, encerrados em 2026), topo de passivo (Provável, Possível, Remoto e já bloqueado), cards de contrato e "Ver também" (Bloqueios ativos filtrados, Desempenho 2026 filtrado e Processos).
- A **tela do contrato** traz o passivo por prognóstico, o bloqueado hoje e os processos, com "Ver bloqueios" (lista filtrada pelo contrato e agrupada por contrato) e "Página do cliente".

### Bloqueios (do Grok Bot, com os ajustes)
- Abre em "Ativos". O subtítulo, os contadores e a lista mostram o mesmo número.
- O topo escuro mostra total ativo, nº de bloqueios, "4 novos nos últimos 7 dias" e o link "14 parados há mais de 90 dias". O resumo por cliente tem barra, valor e %, e tocar num cliente filtra a lista.
- Há busca por processo, valor ou órgão, o seletor Ativos/Levantados/Todos com contagem e pílula deslizante, o seletor de cliente em folha inferior (com "Página ›"), a ordenação Mais recentes ou Maior valor, e o agrupamento por Mês ou Contrato com subtotais e marcador de fim de lista.
- Cada linha mostra valor, cliente · contrato, nº do processo e data. Os status são **Novo** (vermelho), **Parado · N dias** (âmbar), Ativo (cinza) e Levantado (verde).
- O detalhe do bloqueio abre em folha inferior, com "Filtrar contrato" e "Ver contrato".
- Tela nova **Parados há mais de 90 dias**, com a lista dos 14.

### Passivo (do Grok Bot)
- O topo mostra o total estimado (R$ 7.572.900), a divisão Provável, Possível e Remoto com legenda, valores e %, e o "Já bloqueado" (R$ 2.625.700 · 35%).
- "Por cliente" mostra barra de prognóstico, contratos e bloqueado, e abre a página única do cliente.
- "Contratos" mostra 4 de 8, com "Ver todos os 8 contratos" e "Mostrar menos" e a ordenação Maior passivo ou Vence primeiro (pílula deslizante). As situações têm cores próprias: Vigente em azul, Vence este ano em âmbar e Encerrado em cinza.

### Desempenho (do Grok Bot)
- Seletor de período: 2026, 2025 ou Últimos 12 meses.
- 4 cards de indicador (êxito, novos x encerrados, bloqueios levantados e valor revertido), cada um com valor, detalhe, variação e sparkline. O card selecionado fica escuro.
- Um gráfico SVG grande por indicador, que se desenha na primeira vez. Tocar num mês mostra os números num toast.
- "Ver por" Cliente ou Área, com filtro e chip para limpar. Abaixo vem a lista do que forma o número, com detalhes em folha inferior.

### Onboarding, tour e Perfil
- No onboarding saiu o "Passo 2 de 3", e só o tour mantém o "Passo X de 5". O tour tem o passo 1 atualizado.
- Perfil: tamanho do texto (Padrão, Maior, Muito maior) vale para todas as telas, inclusive as novas e os gráficos. Continuam Ouvir resumos, 2 relatórios fixados, Personalizar Início e o Guia de estilo, que agora inclui Âmbar, Levantado e "Cores com significado".

### Movimento (resumo)
- Push com deslize da direita (320 ms) e pop inverso (280 ms).
- Troca de aba com fade (180 ms) e pílula (320 ms).
- Seletores com pílula (280 ms).
- Toque com escala .97.
- Gráficos se desenham em 600 ms.
- Contador e anel do Início em 900 ms.
- Dica encolhe ao fechar (360 ms).
- Folha inferior sobe em 320 ms.
- Tudo respeita "Reduzir movimento".

---

## 4. Confirmar com dados reais
1. **Parados:** 14 pela data do bloqueio x 10 no app original. É preciso definir o critério ("sem movimentação há 90 dias"?).
2. **Eventos de "Hoje no escritório"**, o processo seguido e o relatório atualizado são placeholders.
3. **Desempenho:** os encerrados de 2024 e 2025, as entradas, os valores em discussão e condenação e o histórico de levantamentos de 2024–2025 são **inventados** (o próprio Grok Bot sinaliza isso em `ref/mudancas.md`). As datas de liberação dos 9 levantados também são de exemplo.
4. **Números de processo (CNJ)** são fictícios, gerados de forma determinística.
5. **Outras 14 organizações**, o conteúdo de Reclamação constitucional e as respostas da IA são genéricos.
6. **"3 que você segue"** e os 3 processos seguidos (status) vêm da reconstrução da v2.

**Dados de placeholder (não precisam de confirmação, só de troca pelos reais):** os contratos **AFNE · Município de Mesquita**, **IGEDES · Município de Belford Roxo** e **IGEDES · Município de Itaboraí** não aparecem no app original, que mostra 5 de 8 contratos. Vigência, prognóstico, passivo por contrato e nº de processos (8, 4 e 2) foram criados para fechar com os totais por cliente do original (AFNE R$ 2,21 mi e 19 processos, IGEDES R$ 630 mil e 6 processos).

## 5. Limitações
- A fonte Lexend vem do Google Fonts. Sem internet, o app cai para a fonte arredondada do sistema.
- Testado só no Chromium headless (1024×700, com e sem "Reduzir movimento"). Não foi testado em Safari nem em celular de verdade.
- A busca de Bloqueios re-renderiza a tela a cada tecla (como no protótipo do Grok Bot). Funciona, mas no app real o certo é filtrar só a lista.
