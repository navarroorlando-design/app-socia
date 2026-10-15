"""Abre o app em Chromium headless, entra, percorre as abas e tira prints.

Uso: python3 smoke.py [roteiro]
Sem roteiro: só login + Início + IA + Clientes + Perfil.
"""
import asyncio, sys, json
from playwright.async_api import async_playwright

URL = "file:///home/claude/v10/teste.html"
import os as _os
MOCK = open(_os.environ["MOCK"]).read() if _os.environ.get("MOCK") else None
OUTDIR = "/home/claude/v10/shots"


async def main(steps):
    import os
    os.makedirs(OUTDIR, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 430, "height": 900}, device_scale_factor=2)
        errs = []
        pg.on("pageerror", lambda e: errs.append("pageerror: " + str(e)))
        pg.on("console", lambda m: m.type == "error" and errs.append("console: " + m.text))
        # Estado salvo: já entrou, sem Face ID, tour visto (pula as telas de entrada).
        await pg.add_init_script(
            """try{localStorage.setItem('socios:acesso',JSON.stringify({entrou:true,faceId:false}));
            localStorage.setItem('socios:tourVisto','true');}catch(e){}"""
        )
        if MOCK:
            await pg.add_init_script(MOCK)
        if _os.environ.get("VISITA"):
            await pg.add_init_script("try{localStorage.setItem('socios:ultimaVisita', new Date(Date.now()-%s*864e5).toISOString())}catch(e){}" % _os.environ["VISITA"])
        await pg.goto(_os.environ.get("URL", URL))
        await pg.wait_for_timeout(1200)
        for i, st in enumerate(steps):
            kind = st[0]
            if kind == "click":
                loc = pg.get_by_text(st[1], exact=st[2] if len(st) > 2 else False).first
                try:
                    await loc.click(timeout=4000)
                except Exception as e:
                    errs.append(f"click falhou: {st[1]} ({e.__class__.__name__})")
            elif kind == "role":
                try:
                    await pg.get_by_role(st[1], name=st[2]).first.click(timeout=4000)
                except Exception as e:
                    errs.append(f"role falhou: {st[1]} {st[2]}")
            elif kind == "fill":
                await pg.locator(st[1]).first.fill(st[2])
            elif kind == "eval":
                r = await pg.evaluate(st[1])
                print("eval:", json.dumps(r, ensure_ascii=False)[:600])
            elif kind == "wait":
                await pg.wait_for_timeout(st[1])
            elif kind == "scroll":
                await pg.evaluate(f"document.querySelectorAll('.overflow-y-auto').forEach(e=>{{if(e.offsetParent)e.scrollTop={st[1]}}})")
                await pg.wait_for_timeout(300)
            elif kind == "press":
                await pg.keyboard.press(st[1])
            elif kind == "shot":
                await pg.screenshot(path=f"{OUTDIR}/{st[1]}.png")
                print("shot", st[1])
        print("ERROS:", errs if errs else "nenhum")
        await b.close()


DEFAULT = [
    ("wait", 800), ("shot", "01-inicio"),
    ("role", "button", "IA"), ("wait", 700), ("shot", "02-ia"),
    ("role", "button", "Clientes"), ("wait", 700), ("shot", "03-clientes"),
    ("role", "button", "Perfil"), ("wait", 700), ("shot", "04-perfil"),
]

if __name__ == "__main__":
    steps = json.loads(open(sys.argv[1]).read()) if len(sys.argv) > 1 else DEFAULT
    asyncio.run(main(steps))
