# App dos Sócios: o que mudou no redesenho

Protótipo: `app-socios-redesign.html` (abre direto no navegador). Dados de exemplo. Os números de processo são fictícios.

## Início (só a navegação)
- Os atalhos agora são **Processos, Bloqueios, Passivo e Desempenho**. "Escritório" juntava dois assuntos diferentes (risco e resultado), por isso foi dividido em duas telas.
- **Reclamação constitucional** continua no Início, numa linha logo abaixo dos atalhos.
- O resto do Início não mudou. Ele está no protótipo só para dar acesso às telas novas.

## Bloqueios
- **Resumo no topo**: total ativo (R$ 2.625.700), quantidade de bloqueios e divisão **por cliente**, com barra, valor e % de cada um. Tocar num cliente filtra a lista. O sócio vê onde está o dinheiro antes de abrir a lista.
- **A lista abre em "Ativos"**, e o subtítulo, o filtro e a lista mostram o mesmo número. Antes o subtítulo dizia 30 e a lista mostrava 39.
- **Filtro de cliente num seletor** ("Cliente: Todos ▾", que abre uma folha de opções), no lugar das pílulas cortadas na borda da tela. Funciona com qualquer número de clientes.
- **Cada linha mostra a origem**: cliente, contrato (órgão) e número do processo, além do valor e da data. Tocar numa linha abre os detalhes, com atalhos para o contrato.
- **A lista é agrupada por mês, com subtotal**, e um botão troca para **agrupar por contrato**. Também dá para buscar por processo, valor ou órgão e ordenar por Mais recentes ou Maior valor. Um marcador indica o fim da lista.
- **O vermelho ficou só para o que pede ação**: "Novo" marca os bloqueios dos últimos 7 dias. Os ativos normais aparecem em ocre e neutro, e os levantados em verde.

## Passivo (antes era uma aba de "Escritório")
- **Tela própria, com um topo só de passivo**: total estimado e divisão por prognóstico, com legenda, valores e % (Provável, Possível, Remoto). Antes, a barra de três cores não tinha legenda.
- **Passivo e bloqueado aparecem juntos**: o topo, cada cliente e cada contrato mostram quanto já está bloqueado e qual % do passivo isso representa.
- **Por cliente**: tocar num cliente abre a página dele, com os contratos e atalhos para os bloqueios e o desempenho desse cliente.
- **Todos os 8 contratos** aparecem ("Ver todos" e "Mostrar menos"), e dá para ordenar por **Maior passivo** ou **Vence primeiro**. Cada barra tem os valores escritos embaixo.
- **Cada situação tem sua cor**: Vigente em azul, Vence este ano em ocre e Encerrado em cinza. Antes, "Vence este ano" e "Vigência encerrada" tinham a mesma cor.
- **A formatação dos números é a mesma em todo lugar**: valores completos (R$ 1.767.400) dentro da tela. A forma abreviada (R$ 7,57 mi) ficou só nos atalhos do Início.

## Desempenho (antes era uma aba de "Escritório")
- **Tela própria**, com um topo só do índice de êxito.
- **Seletor de período**: 2026, 2025 ou Últimos 12 meses.
- **O índice sempre vem com contexto**: o número de processos ("4 de 9") e a comparação com o período anterior (ex.: "▼ −6 p.p. vs 2025: 50% em 12 processos"). Os números de 2024 e 2025 são inventados.
- **A legenda esconde as categorias zeradas**: "Acordo · 0" não aparece mais.
- **Cada cliente mostra os números** ("1 de 4 favoráveis · 25%"). Tocar num cliente abre a lista de processos encerrados dele, com resultado, data, ação, contrato e número do processo.
- **Nova divisão por área** (Trabalhista, Cível, Administrativo), que também abre a lista de encerrados.

## Geral
- **As dicas podem ser fechadas** (botão "Entendi" ou o ×) e ficam fechadas até o fim da sessão.
- O cabeçalho fica compacto ao rolar e mostra o nome da tela. O botão voltar devolve você ao ponto da tela anterior onde estava.

## Desempenho v2 (vários indicadores)
- **4 cards de indicador no topo (grade 2x2)**, cada um com valor, detalhe, variação contra o período anterior e um mini gráfico da tendência mensal:
  - Índice de êxito: 44%, 4 de 9 encerrados, ▼ −6 p.p. vs 2025.
  - Novos x encerrados: saldo +5, 14 novos · 9 encerrados, carteira 53 → 58.
  - Bloqueios levantados: 9 levantamentos, R$ 840.700, média de 35 dias.
  - Valor revertido: 55%, R$ 634.300 afastados de R$ 1.155.500.
- **Tocar num card seleciona o indicador** (o card fica escuro), e toda a tela abaixo muda para ele: resumo, gráfico, detalhe e lista.
- **Um gráfico SVG por indicador**, desenhado à mão e sem bibliotecas:
  - Êxito: linha mensal do índice acumulado, com os % nos pontos.
  - Novos x encerrados: barras pareadas por mês mais a linha da carteira ativa.
  - Levantados: barras de R$ liberado, com a quantidade em cima.
  - Revertido: barras empilhadas de revertido x mantido.
  - Tocar num mês mostra os números dele. A especificação está em `especificacao-graficos.md`.
- **"Ver por" Cliente ou Área**, mantendo o estilo das linhas com barra e números. Tocar num cliente ou numa área filtra a lista de baixo, e um chip permite limpar o filtro.
- **Abaixo, a lista do que forma o número**: processos encerrados, entradas e saídas, bloqueios levantados ou o valor de cada processo encerrado. Tocar num item abre os detalhes.
- **O seletor de período (2026, 2025, Últimos 12 meses) vale para tudo.** Os levantamentos de 2026 são exatamente os 9 levantados da tela Bloqueios, contados pela data de liberação. Os números de 2024 e 2025 são dados de exemplo inventados.
