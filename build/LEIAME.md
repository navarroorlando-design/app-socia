# Como a versão publicada é montada

O App dos Sócios publicado foi construído a partir do bundle de 08/10, que não tinha o código-fonte neste repositório.
As versões 10 e 11 aplicam mudanças exatas sobre esse bundle formatado.

1. `patch.py` lê o bundle formatado (`bundle.js`), insere `v10.js` e `v11.js` e aplica as substituições. Cada uma confere quantas vezes o trecho aparece e para se o código não for o esperado.
2. `build.py` minifica com esbuild e monta o HTML publicado.
3. `smoke.py` abre o app em Chromium headless e percorre roteiros; `mock.js` simula a IA para testar o fluxo sem o Claude.

O bundle de origem (cerca de 1 MB) não está aqui; ele é a versão publicada do artifact em 08/10.
