/* His question on round 2's build (21 Oct 26): "the edit pencils are slanted bottom right — why did we change to bottom left?"
   The pictures: the Tracker's new drawn pencils (tip down-left, the app's own drawing from the input window's title box,
   D919) beside the typed ✎ the rest of the app prints (tip down-right) — and the drawn pencil MIRRORED, drawn on the app.
   Run: HP_URL=http://localhost:<port> HP_SHOTS=<folder> node scripts/handpass/cr2-pencil.mjs → <folder>/pencil/ */
import { existsSync, mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, SHOTS, login, go } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = SHOTS + '/pencil'; mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const ctx = await browser.newContext({ viewport: { width: 1536, height: 864 }, deviceScaleFactor: 2 })
await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
const page = await ctx.newPage(); await page.goto(BASE + '/'); await login(page, 'a')
async function ring(sels) {
  await page.evaluate(sels => {
    document.querySelectorAll('.zz-ring').forEach(e => e.remove())
    for (const [sel, n] of sels) for (const e of [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().width > 0)) {
      const r = e.getBoundingClientRect(), d = document.createElement('div'); d.className = 'zz-ring'
      d.style.cssText = `position:fixed;left:${r.left - 4}px;top:${r.top - 4}px;width:${r.width + 8}px;height:${r.height + 8}px;border:3px solid #ffb020;border-radius:9px;z-index:99999;pointer-events:none`
      if (n) { const s = document.createElement('span'); s.textContent = n; s.style.cssText = 'position:absolute;left:-3px;top:-24px;background:#ffb020;color:#000;font:800 13px/20px sans-serif;padding:0 7px;border-radius:6px'; d.appendChild(s) }
      document.body.appendChild(d)
    }
  }, sels)
}
const clipOf = async (sel, padX = 40) => { const b = await page.locator(sel).first().boundingBox(); return { x: Math.max(0, b.x - padX), y: Math.max(0, b.y - 34), width: b.width + padX * 2, height: b.height + 52 } }

await go(page, 'tracker'); await sleep(900)
const hdr = { x: 0, y: 40, width: 760, height: 96 }
await ring([['#courseMenuBtn', '1'], ['#sylMenuBtn', '1']]); await page.screenshot({ path: `${OUT}/a-tracker-today.png`, clip: hdr })
/* proposed: the same drawing mirrored, so its tip points down-right like the typed ✎ */
await page.addStyleTag({ content: '#courseMenuBtn .trkglyph,#sylMenuBtn .trkglyph{transform:scaleX(-1)}' }); await sleep(150)
await ring([['#courseMenuBtn', '1'], ['#sylMenuBtn', '1']]); await page.screenshot({ path: `${OUT}/b-tracker-mirrored.png`, clip: hdr })
await go(page, 'quals'); await sleep(400)
await ring([['#qEdit', '2']]); await page.screenshot({ path: `${OUT}/c-quals-typed.png`, clip: await clipOf('#qEdit', 60) })
await go(page, 'logic'); await sleep(400)
await ring([['#lgEdit', '2']]); await page.screenshot({ path: `${OUT}/d-logic-typed.png`, clip: await clipOf('#lgEdit', 60) })
await browser.close(); console.log('done')
