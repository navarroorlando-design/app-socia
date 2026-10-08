# Especificação dos gráficos SVG: Desempenho

Gráficos desenhados à mão em SVG inline, sem bibliotecas. A referência é a implementação em `app-socios-redesign.html` (funções `serieMensal`, `chartNovos`, `chartExito`, `chartLev`, `chartRev` e `spark`). Todos os valores são dados de exemplo.

## 0. Base comum

**Fonte de dados.** Uma única série mensal, calculada para o período selecionado (2026 até 08/10, 2025 ou os últimos 12 meses, de 09/10/2025 a 08/10/2026). Cada mês é um bucket do calendário. O primeiro e o último mês podem ser parciais.

```json
{
  "periodo": {"de": "2026-01-01", "ate": "2026-10-08"},
  "carteiraInicial": 53,
  "meses": [
    {"mes": "2026-04", "novos": 1, "encerrados": 1, "carteira": 56,
     "favoraveis": 0, "indiceAcumulado": 33,
     "levantadoValor": 336100, "levantadoQtd": 2,
     "emDiscussao": 95400, "revertido": 34200, "mantido": 61200, "revertidoAcumulado": 72}
  ]
}
```

- `carteira`: processos ativos no fim do mês (no mês corrente, na data de hoje). Cálculo: 58 hoje − novos posteriores + encerrados posteriores.
- `indiceAcumulado` e `revertidoAcumulado`: % acumulado desde o início do período. É `null` até o primeiro encerramento.
- `levantado*`: os levantamentos contam pela **data de liberação**, não pela data do bloqueio.

**Tokens de cor** (os mesmos do protótipo):

| Uso | Hex | Token |
|---|---|---|
| Novos | `#2D5B87` | `--blue` |
| Encerrados | `#B5AEA2` | |
| Linha e pontos | `#1D1C19` | `--ink` |
| Favorável, revertido, liberado | `#4A946A` | `--fav` |
| Mantido (condenação ou acordo) | `#C0472F` | `--desf` |
| Grade | `#ECE7DD` | `--line` |
| Linha de base (zero) | `#CFC8BB` | |
| Texto dos eixos | `#8F897F` | |
| Rótulo do ano | `#AAA397` | |
| Fundo do card | `#FDFCF9` | `--card` |
| Halo da linha | `#FFFFFF` | |

**Moldura dos gráficos grandes.** `viewBox="0 0 320 172"`, `width:100%` e `height:auto`, dentro de um card com padding de 16 px. Fica legível em 390 px de largura.

- A área de barras e linhas termina em `base = 132`.
- O rótulo do mês fica em `y = 145`. O ano fica em `y = 157`, só no primeiro mês e em janeiro.
- A largura de cada coluna é `gw = (x1 − x0) / nº de meses`, e o centro de uma coluna é `x0 + gw·i + gw/2`.

**Tipografia** (Lexend com fallback do sistema):

| Elemento | Tamanho e peso |
|---|---|
| Eixos e meses | 9,5 px |
| Ano | 8,5 px |
| Rótulo de ponto ou barra | 9 px, 600 |
| Valor da carteira | 10 px, 600 |
| Legenda (HTML, acima do SVG) | 11,5 px |

**Formatação pt-BR:**

- Mês: `jan` a `dez`, em minúsculas.
- Eixo de R$: `0`, `200 mil`, `1,5 mi`, sem "R$". A unidade aparece na legenda.
- Tooltip: valor completo, como `R$ 336.100`.
- Percentual inteiro: `44%`.
- Saldo com sinal tipográfico: `+5`, `−1`.

**Escala "redonda" do eixo de R$.** O passo é o menor de {0,5; 1; 2; 2,5; 5; 10} × 10ᵏ que dê no máximo 3 intervalos. O topo é `ceil(máx / passo) × passo`.

**Interação.** Cada mês tem uma coluna transparente de toque, de `y = 8` até a base, com a largura `gw`:

- **Toque:** abre um toast com o resumo do mês.
- **Hover (desktop):** mostra o `<title>` da coluna, com o mesmo texto, e um leve escurecimento (`rgba(0,0,0,.035)`).

**Acessibilidade.** `<svg role="img" aria-labelledby="…">` com `<title>` (nome do gráfico) e `<desc>` (todos os meses em texto, no mesmo formato do toast). Em produção, use IDs únicos por gráfico. No protótipo só aparece um gráfico grande por vez. A legenda é HTML e não depende só de cor: a linha usa um traço e os pontos usam um círculo.

## 1. Sparklines (4 cards de indicador)

- **Propósito:** mostrar a tendência mensal no próprio card, sem eixos. O número do card é a informação principal.
- **Dimensões:** `width="72" height="26" viewBox="0 0 72 26"`, padding de 3. Fica à direita do valor, alinhado pela base.
- **Cor:** `currentColor`.
  - Card normal: `#3A3833` (`--ink2`).
  - Card selecionado, com fundo `#22211E`: `#E8C27A`.
- **Tipos:**

| Card | Forma | Campo |
|---|---|---|
| Índice de êxito | linha | `indiceAcumulado` |
| Novos x encerrados | linha | `carteira` |
| Bloqueios levantados | barras | `levantadoValor` |
| Valor revertido | linha | `revertidoAcumulado` |

- **Escala:** cada sparkline vai do mínimo ao máximo da sua própria série. Os pontos `null` são pulados. Série constante fica no meio da altura.
- **Detalhes:** linha de 1,5 px com um ponto final de r 2,2. Barras com 60% da largura do slot, opacidade 0,8 e uma linha de base de opacidade 0,25.
- **Estado vazio:** linha tracejada (`2 2`) com opacidade 0,5.
- **Acessibilidade:** `aria-hidden="true"` e `focusable="false"`. A sparkline é decorativa porque o card já tem o valor, o detalhe e a variação em texto. Tocar no card seleciona o indicador.

## 2. Índice de êxito: linha mensal do índice acumulado

- **Propósito:** mostrar como o índice do período chegou ao número final. O último ponto é igual ao do card (44% em 2026).
- **Paddings:** `x0 = 32`, `x1 = 306`, topo 22, base 132.
- **Eixo Y:** fixo, de 0 a 100%, com grade em 0, 50 e 100 e rótulos `0%`, `50%`, `100%`.
- **Série:** uma polyline de 1,6 px (`#1D1C19`) ligando os meses com valor.
  - Mês com encerramento: ponto cheio de r 3.
  - Mês sem encerramento, que só repete o acumulado: ponto vazado de r 2, com fundo branco.
- **Rótulos:** `NN%` 7 px acima do ponto. São todos exibidos quando `gw ≥ 24`. Caso contrário, aparecem só no primeiro, no último e quando o valor muda.
- **Legenda:** "Índice acumulado" (traço) e "Mês com encerramento" (círculo).
- **Toast:** `set/2026: 2 encerrados no mês (1 favorável) · acumulado 44%`
- **Estado vazio:** o texto central "Nenhum processo encerrado no período" (12 px). A grade continua visível.

## 3. Novos x encerrados: barras pareadas + linha da carteira

- **Propósito:** comparar as entradas e saídas de cada mês e mostrar o efeito delas no tamanho da carteira ativa.
- **Paddings:** `x0 = 24`, `x1 = 294`.
  - Barras na faixa de 70 a 132.
  - Linha da carteira na faixa de 16 a 50, acima das barras, com escala própria.
- **Barras:** largura `min(9, gw × 0,34)` com 1,5 de espaço entre o par.
  - Novos à esquerda (`#2D5B87`), encerrados à direita (`#B5AEA2`), ambos com `rx 2`.
  - Contagem com zero não desenha barra.
- **Eixo Y das barras:** inteiros de 0 a `max(2, maior contagem do mês)`, com grade em cada inteiro.
- **Linha:** do ponto inicial (`carteiraInicial`, na borda x0) até o fim de cada mês.
  - Halo branco de 4 px por baixo e traço de 1,6 px por cima.
  - Pontos de r 2,8 só no início e no fim, com o valor ao lado (`53` … `58`).
  - Escala do mínimo ao máximo da carteira no período. Se for constante, fica no meio da faixa.
- **Legenda:** Novos, Encerrados, Carteira ativa (traço).
- **Toast:** `mai/2026: 2 novos · 1 encerrado · carteira 57`
- **Abaixo do gráfico:** totais em 3 colunas (Entraram, Encerraram, Saldo) e a comparação com o período anterior.
- **Estado vazio:** sem barras, com a linha reta no meio da faixa.

## 4. Bloqueios levantados: barras de R$ liberado

- **Propósito:** mostrar quando o dinheiro foi liberado. A quantidade de levantamentos fica acima de cada barra.
- **Paddings:** `x0 = 42` (espaço para `400 mil`), `x1 = 310`, topo 22, base 132.
- **Eixo Y:** escala redonda de R$ (no exemplo de 2026: 0, 200 mil, 400 mil).
- **Barras:** largura `min(16, gw × 0,5)`, `rx 2,5`, cor `#4A946A`. A quantidade (`2`) aparece 4 px acima, em 9 px e peso 600. Meses sem levantamento ficam sem barra.
- **Legenda:** "R$ liberado no mês" e "número = levantamentos".
- **Toast:** `abr/2026: 2 levantamentos · R$ 336.100`
- **Abaixo do gráfico:** o tempo médio até levantar no período e no período anterior, e um link para a tela Bloqueios.
- **Estado vazio:** "Nenhum levantamento no período".
- **Consistência:** os 9 levantamentos de 2026 somam R$ 840.700 e são exatamente os 9 bloqueios levantados da tela Bloqueios.

## 5. Valor revertido: barras empilhadas por mês

- **Propósito:** mostrar, mês a mês, quanto do valor em discussão nos processos encerrados foi revertido e quanto foi mantido.
- **Paddings:** `x0 = 42`, `x1 = 310`, topo 18, base 132.
- **Eixo Y:** escala redonda de R$ sobre o valor em discussão do mês.
- **Barras:** largura `min(16, gw × 0,5)`.
  - Revertido embaixo (`#4A946A`), mantido em cima (`#C0472F`), com 1 px de separação.
  - A altura total é o valor em discussão.
- **Legenda:** "Revertido" e "Mantido (condenação ou acordo)".
- **Toast:** `jul/2026: R$ 310.000 em discussão · R$ 45.200 revertido (15%) · R$ 264.800 mantido`
- **Abaixo do gráfico:** totais em 3 colunas (Em discussão, Revertido, Mantido), em formato abreviado (`R$ 1,16 mi`), mais a comparação com o período anterior.
- **Estado vazio:** "Nenhum processo encerrado no período".
