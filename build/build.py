"""Monta o HTML publicável da versão 10 a partir de bundle.out.js."""
import re, subprocess

head = open("/home/claude/v10/head.html", encoding="utf-8").read()
subprocess.run(
    ["/home/claude/v10/node_modules/.bin/esbuild", "/home/claude/v10/bundle.out.js", "--minify", "--charset=ascii",
     "--outfile=/home/claude/v10/bundle.final.js", "--log-level=warning"],
    check=True,
)
js = open("/home/claude/v10/bundle.final.js", encoding="utf-8").read().replace("</script", "<\\/script")

# O esqueleto <!doctype>…<body> é acrescentado pela publicação; o arquivo começa no <title>.
head = head[head.index("<title>"):]
head = head.replace(
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Lexend:wght@400;500;600;700&display=swap">',
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500'
    '&family=Inter+Tight:wght@400;500;600'
    '&family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&display=swap">',
)
assert "Lexend" not in head, "ainda há Lexend no cabeçalho"
html = head + "<script>" + js + "</script>\n"
open("/home/claude/v10/index.html", "w", encoding="utf-8").write(html)
# Cópia para teste local, com o mesmo esqueleto que a publicação acrescenta.
F = "file:///tmp/claude-0/fonts/node_modules/@fontsource"
faces = ""
for fam, slug, ws in [("Inter Tight", "inter-tight", (400, 500, 600)), ("Newsreader", "newsreader", (400, 500, 600)), ("IBM Plex Mono", "ibm-plex-mono", (400, 500))]:
    for w in ws:
        faces += f"@font-face{{font-family:'{fam}';font-weight:{w};src:url({F}/{slug}/files/{slug}-latin-{w}-normal.woff2) format('woff2')}}"
open("/home/claude/v10/teste.html", "w", encoding="utf-8").write(
    '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>' + faces + '</style></head><body>'
    + html + "</body></html>"
)
print("index.html", len(html))
