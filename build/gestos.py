"""Testa os gestos do zoom: arrastar um dedo (ler mês), pinça (aproximar) e toque duplo (ver tudo)."""
import asyncio
from playwright.async_api import async_playwright

URL = "file:///home/claude/v10/teste.html"
OUT = "/home/claude/v10/shots"


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": 430, "height": 900}, device_scale_factor=2, has_touch=True, is_mobile=True)
        pg = await ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script(
            "try{localStorage.setItem('socios:acesso',JSON.stringify({entrou:true,faceId:false}));localStorage.setItem('socios:tourVisto','true')}catch(e){}"
        )
        await pg.goto(URL)
        await pg.wait_for_timeout(1200)
        await pg.evaluate("document.querySelectorAll('.overflow-y-auto').forEach(e=>{if(e.offsetParent)e.scrollTop=700})")
        await pg.wait_for_timeout(300)
        await pg.get_by_text("Desempenho", exact=True).first.click()
        await pg.wait_for_timeout(1300)
        await pg.get_by_text("Ampliar o gráfico").first.click()
        await pg.wait_for_timeout(900)
        svg = pg.locator('[role=dialog] svg[role=img]')
        box = await svg.bounding_box()
        cdp = await ctx.new_cdp_session(pg)
        y = box["y"] + box["height"] * 0.55

        async def toque(tipo, pts):
            await cdp.send("Input.dispatchTouchEvent", {"type": tipo, "touchPoints": [{"x": x, "y": y, "id": i} for i, x in enumerate(pts)]})

        # 1) arrastar um dedo da direita para o meio: o valor do topo acompanha
        x0 = box["x"] + box["width"] * 0.95
        await toque("touchStart", [x0])
        for k in range(1, 9):
            await toque("touchMove", [x0 - k * box["width"] * 0.06])
            await pg.wait_for_timeout(30)
        mes1 = await pg.locator('[role=dialog] [aria-live=polite] p').first.inner_text()
        await pg.screenshot(path=f"{OUT}/k1-arrasto.png")
        await toque("touchEnd", [])
        await pg.wait_for_timeout(400)

        # 2) pinça: dois dedos se afastando no meio do gráfico
        c = box["x"] + box["width"] * 0.6
        await toque("touchStart", [c - 20, c + 20])
        for k in range(1, 10):
            await toque("touchMove", [c - 20 - k * 14, c + 20 + k * 14])
            await pg.wait_for_timeout(30)
        await toque("touchEnd", [])
        await pg.wait_for_timeout(600)
        rotulos = await svg.locator("text").evaluate_all("l=>l.map(e=>e.textContent)")
        await pg.screenshot(path=f"{OUT}/k2-pinca.png")

        # 3) toque duplo: volta a mostrar tudo
        await toque("touchStart", [c]); await toque("touchEnd", [])
        await pg.wait_for_timeout(120)
        await toque("touchStart", [c]); await toque("touchEnd", [])
        await pg.wait_for_timeout(600)
        rotulos2 = await svg.locator("text").evaluate_all("l=>l.map(e=>e.textContent)")
        await pg.screenshot(path=f"{OUT}/k3-duplo.png")

        meses = lambda r: [t for t in r if t and t[:1].isalpha()]
        print("mês após arrastar:", mes1)
        print("meses após pinça:", meses(rotulos))
        print("meses após toque duplo:", meses(rotulos2))
        print("ERROS:", errs or "nenhum")
        await b.close()


asyncio.run(main())
