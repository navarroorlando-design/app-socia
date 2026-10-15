src=open('/root/.claude/projects/-home-claude-app-socia/2515eeb8-4228-528e-95b1-17d139fdb229/tool-results/artifact-d679dd3e-1792034576-bf9d.html').read()
def sec(a,b): i=src.index(a); j=src.index(b,i); return src[i:j]
util=sec('/* ---------- Utilidades de animação','/* ---------- Ilustração')
head='''<title>Pauta Jurídica</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600&family=Newsreader:opsz,wght@6..72,300;6..72,400;6..72,500&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>'''+open('premium.css').read()+open('premium3.css').read()+'''</style>
<div id="root"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/htm@3.1.1/dist/htm.umd.js"></script>
<script>'''+open('dados.js').read()+'''</script>
<script>
const {useState,useEffect,useRef,useContext} = React;
const html = htm.bind(React.createElement);
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
'''+open('icons2.js').read()+util+open('app3.js').read()+'''
</script>
'''
open('pauta.html','w').write(head); print(len(head))
