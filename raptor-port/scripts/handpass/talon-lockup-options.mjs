// The sign-in's claw beside "TALON" — the gap, three ways, for him to pick ([TALON-RENAME], his "the talon page is a bit
// off", 3 Nov 26). The T's upright stands 8px in from its edge (6px on his iPhone), where RAPTOR's R stood at its edge,
// so the claw reads further from the word than it did. A: as built. B: the word's left padding (it only balanced the
// letter spacing after the N) moved to the word's right side as a pull-in — the claw 7px nearer, the pair still centred.
// C: halfway. Each is drawn on the built app at his PC's size (1536 × 864 at 1.25) and his iPhone's (402 × 874 at 3),
// the measured gaps printed and written on the picture.
//   npm run build && node scripts/handpass/talon-lockup-options.mjs [out dir]
import { chromium } from '@playwright/test'
import { preview } from 'vite'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '../..')
const OUT = process.argv[2] || join(ROOT, 'docs/img/handpass/2026-11-03-talon/lockup')
mkdirSync(OUT, { recursive: true })
const PORT = 4295
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OPTIONS = {
  A: '',
  B: '.lb-word{padding-left:0 !important;margin-right:-.19em}',
  C: '.lb-word{padding-left:.095em !important;margin-right:-.095em}',
}
const server = await preview({ root: ROOT, preview: { port: PORT, strictPort: true, open: false }, logLevel: 'silent' })
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
for (const [tag, viewport, dpr] of [['pc', { width: 1536, height: 864 }, 1.25], ['iphone', { width: 402, height: 874 }, 3]]) {
  const pics = []
  for (const [opt, css] of Object.entries(OPTIONS)) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: dpr })
    await page.goto(`http://localhost:${PORT}/?fresh=1`)
    await page.waitForSelector('#luser', { state: 'visible' })
    await page.waitForFunction(() => !document.getElementById('bootclaw'))
    if (css) await page.addStyleTag({ content: css })
    await page.waitForTimeout(150)
    const m = await page.evaluate(() => {
      const g = document.querySelector('.lb-glyph').getBoundingClientRect(), w = document.querySelector('.lb-word')
      const r = document.createRange(); r.setStart(w.firstChild, 0); r.setEnd(w.firstChild, 1)
      const t = r.getBoundingClientRect()
      return { boxGap: Math.round((t.left - g.right) * 10) / 10 }
    })
    const mark = await page.locator('.lb-mark').boundingBox()
    const card = await page.locator('.login-card').boundingBox()
    const clip = { x: card.x - 10, y: mark.y - 24, width: card.width + 20, height: card.y - mark.y + 70 }
    const png = await page.screenshot({ clip })
    pics.push({ opt, gap: m.boxGap, src: 'data:image/png;base64,' + png.toString('base64'), w: clip.width })
    console.log(`${tag} ${opt}: claw to the T's box ${m.boxGap}px`)
    await page.close()
  }
  const sheet = await browser.newPage({ viewport: { width: 1200, height: 400 }, deviceScaleFactor: 2 })
  await sheet.setContent(`<body style="margin:0;background:#1a1d22;color:#e8edf2;font:600 14px -apple-system,system-ui,sans-serif;display:flex;gap:14px;padding:14px;align-items:flex-start">${pics.map(p => `<div style="display:flex;flex-direction:column;gap:6px"><div>${p.opt === 'A' ? 'A — as built' : p.opt === 'B' ? 'B — claw 7px nearer (recommended)' : 'C — halfway'}</div><img src="${p.src}" style="width:${Math.min(360, p.w)}px;display:block;border:1px solid #39424D;border-radius:8px"></div>`).join('')}</body>`)
  await sheet.waitForTimeout(200)
  await sheet.screenshot({ path: join(OUT, `options-${tag}.png`), fullPage: true })
  await sheet.close()
}
await browser.close()
await new Promise(r => server.httpServer.close(r))
