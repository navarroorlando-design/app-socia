import asyncio, os, sys
from playwright.async_api import async_playwright
NM='/home/claude/pj/node_modules/'
MAP={'react.production.min.js':NM+'react/umd/react.production.min.js','react-dom.production.min.js':NM+'react-dom/umd/react-dom.production.min.js','htm.umd.js':NM+'htm/dist/htm.umd.js'}
W=int(os.environ.get('W','1440')); DARK=os.environ.get('DARK'); FULL=not os.environ.get('VP')
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':W,'height':900})
    if DARK: await pg.emulate_media(color_scheme='dark')
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m: m.type=='error' and errs.append(m.text))
    async def route(r):
      u=r.request.url
      for k,v in MAP.items():
        if u.endswith(k): return await r.fulfill(path=v, content_type='application/javascript')
      if 'fonts.g' in u: return await r.fulfill(body='', content_type='text/css')
      await r.continue_()
    await pg.route('**/*',route)
    await pg.add_init_script(open('/home/claude/pj/mock.js').read())
    body=open('/home/claude/pj/pauta.html').read()
    open('/home/claude/pj/prev.html','w').write('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style></head><body>'+body+'</body></html>')
    sfx=('-d' if DARK else '')+('' if W==1440 else '-'+str(W))
    first=True
    for v in sys.argv[1:]:
      if v.startswith('go:'):
        await pg.goto('file:///home/claude/pj/prev.html#'+v[3:]);
        if not first: await pg.reload()
        first=False; await pg.wait_for_timeout(1300); continue
      if v.startswith('click:'):
        await pg.get_by_text(v[6:],exact=False).first.click(); await pg.wait_for_timeout(900); continue
      if v.startswith('css:'):
        await pg.locator(v[4:]).first.click(); await pg.wait_for_timeout(700); continue
      if v.startswith('ask:'):
        sel,txt=v[4:].split('|',1); await pg.fill(sel,txt); await pg.keyboard.press('Enter'); await pg.wait_for_timeout(5500); continue
      if v.startswith('key:'):
        await pg.keyboard.press(v[4:]); await pg.wait_for_timeout(500); continue
      if v.startswith('type:'):
        await pg.keyboard.type(v[5:]); await pg.wait_for_timeout(400); continue
      if v.startswith('wait:'):
        await pg.wait_for_timeout(int(v[5:])); continue
      if v.startswith('shot:'):
        await pg.screenshot(path=f'/home/claude/pj/shots/{v[5:]}{sfx}.png',full_page=FULL); continue
    print('sw',await pg.evaluate('document.documentElement.scrollWidth'))
    print('ERROS',errs or 'nenhum'); await b.close()
asyncio.run(main())
