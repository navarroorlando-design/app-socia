import re
src=open('/root/.claude/projects/-home-claude-app-socia/2515eeb8-4228-528e-95b1-17d139fdb229/tool-results/artifact-d679dd3e-1792034576-bf9d.html').read()
def sec(a,b): i=src.index(a); j=src.index(b,i); return src[i:j]
util=sec('/* ---------- Utilidades de animação','/* ---------- Ilustração')
illus=sec('/* ---------- Ilustração','/* ---------- Header')
icons=open('icons.js').read().replace("const P = {","const P = {\n  bookmark:'<path d=\"m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z\"/>',",1)
css=open('base.css').read()+open('extra.css').read()
head='''<title>Pauta Jurídica</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap">
<style>'''+css+'''</style>
<div id="root"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/htm@3.1.1/dist/htm.umd.js"></script>
<script>'''+open('dados.js').read()+'''</script>
<script>
const {useState,useEffect,useRef} = React;
const html = htm.bind(React.createElement);
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
'''+icons+util+illus+open('app.js').read()+'''
</script>
'''
open('pauta.html','w').write(head)
print(len(head))
