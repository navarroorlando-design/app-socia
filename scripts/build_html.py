css = open("dist/out.css").read()
js = open("dist/bundle.js").read().replace("</script", "<\\/script")
html = f"""<title>App dos Sócios</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Lexend:wght@400;500;600;700&display=swap">
<style>{css}
html,body{{height:100%;margin:0;}} body{{background:#C7C9C3;color:#111827;}}
:root{{color-scheme:light;}}
</style>
<div id="root"></div>
<script>{js}</script>
"""
open("dist/app-socios.html", "w").write(html)
open("dist/teste-local.html", "w").write("<meta charset=utf-8>" + html)
