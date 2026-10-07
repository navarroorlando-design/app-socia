// Gera os ícones do app (PWA e tela de início do iPhone) a partir de um SVG.
// Uso: node scripts/gerar_icones.js  (precisa do Playwright com Chromium)
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const fonte = fs.readFileSync(require.resolve("@fontsource/lexend/files/lexend-latin-600-normal.woff2")).toString("base64");

// Monograma "AR" branco sobre o carvão da marca, com traço em osso. `margem` encolhe o desenho para a zona segura do ícone maskable.
const svg = (lado, { margem = 0, raio = 0 } = {}) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 100 100">
  <style>@font-face{font-family:L;src:url(data:font/woff2;base64,${fonte})}</style>
  <rect width="100" height="100" rx="${raio}" fill="#1F1E1A"/>
  <g transform="translate(50 50) scale(${1 - margem}) translate(-50 -50)">
    <text x="50" y="62" text-anchor="middle" font-family="L" font-weight="600" font-size="38" letter-spacing="-1" fill="#FFFFFF">AR</text>
    <rect x="30" y="72" width="40" height="3" rx="1.5" fill="#D8CFBC"/>
  </g>
</svg>`;

const saidas = [
  ["public/icon-192.png", 192, {}],
  ["public/icon-512.png", 512, {}],
  ["public/icon-maskable-512.png", 512, { margem: 0.2 }],
  ["app/apple-icon.png", 180, {}],
];

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || "/opt/pw-browsers/chromium" });
  const page = await browser.newPage();
  for (const [arq, lado, op] of saidas) {
    await page.setViewportSize({ width: lado, height: lado });
    await page.setContent(`<body style="margin:0">${svg(lado, op)}</body>`);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.resolve(arq), clip: { x: 0, y: 0, width: lado, height: lado } });
    console.log(arq);
  }
  fs.writeFileSync("app/icon.svg", svg(64, { raio: 14 }).trim());
  console.log("app/icon.svg");
  await browser.close();
})();
