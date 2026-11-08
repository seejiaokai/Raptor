/* THE BUILD BESIDE ITS DRAWING (chat 11, 8 Nov 26 — the drawing check, D1494, D1495, for the board's layout, D1780, D1781).
   The approved drawings were made by scripts/handpass/pr-board.mjs, which measured each drawn option and kept the figures
   in docs/img/handpass/2026-11-07-pictures-round/pr-board-measured.json. This measures the BUILT app the same way (the
   drawing script's own lineMeasure, copied whole) and lists every figure more than 2px from the drawing's:
   - D1781 (drawn option C): the first six jets' lines at 821, 874, 900, 1000, 1099 wide — each line's height, the remarks'
     width, the line's buttons and the back seat inside the formation, nothing cut;
   - D1780 (question 1, drawn option B): his iPhone on its side, 874 × 402, touch — at rest the top 146 tall; scrolled, the
     bar 51 tall, its two parts where the drawing put them; with the keys up (a stand-in keyboard, 200px) the list 151.
   Pictures of the built board cut as the drawing's were, beside them. Usage: node scripts/handpass/bl-drawcheck.mjs <port> */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'

const PORT = process.argv[2] || '4180'
const OUT = 'docs/img/handpass/2026-11-08-board-layout/drawcheck'
mkdirSync(OUT, { recursive: true })
const DRAWN = JSON.parse(readFileSync('docs/img/handpass/2026-11-07-pictures-round/pr-board-measured.json', 'utf8'))
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const TOL = 2
const diffs = [], rows = []
const cmp = (where, what, built, drawn) => {
  const ok = typeof drawn === 'number' ? Math.abs(built - drawn) <= TOL : built === drawn
  rows.push({ where, what, built, drawn, ok }); if (!ok) diffs.push(`${where} ${what}: built ${built}, drawn ${drawn}`)
}
const world = async (vp, touch) => {
  const ctx = await browser.newContext({ viewport: vp, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  const page = await ctx.newPage()
  if (touch) await page.addInitScript(() => {
    class FakeVV extends EventTarget { width = innerWidth; height = innerHeight; offsetTop = 0; offsetLeft = 0; pageTop = 0; pageLeft = 0; scale = 1 }
    const f = new FakeVV(); Object.defineProperty(window, 'visualViewport', { configurable: true, get: () => f }); window.__vv = f
  })
  await page.goto(`http://localhost:${PORT}/`)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  await page.evaluate(() => window.go('editsched')); await page.waitForFunction(() => window.CURPAGE === 'editsched')
  await page.evaluate(() => window.openScheduler(0)); await page.waitForSelector('#schedBoard:not([hidden])'); await page.waitForTimeout(500)
  return { ctx, page }
}
/* pr-board.mjs lineMeasure, whole */
const lineMeasure = page => page.evaluate(() => {
  const ls = [...document.querySelectorAll('#sbBoard .sb-line')].filter(e => e.getBoundingClientRect().height > 0)
  const l = ls[0]; const go = l.closest('.sb-go'); const gr = go.getBoundingClientRect()
  const n = l.querySelector('.nts'), nr = n.getBoundingClientRect()
  const lc = l.querySelector('.lctl').getBoundingClientRect()
  const slots = [...l.querySelectorAll('.sb-slot')].map(e => e.getBoundingClientRect())
  const far = Math.max(...[...l.querySelectorAll('*')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.getBoundingClientRect().right))
  return {
    lineH: Math.round(l.getBoundingClientRect().height), lineW: Math.round(l.getBoundingClientRect().width),
    lineHs: ls.slice(0, 6).map(x => Math.round(x.getBoundingClientRect().height)),
    rmkW: Math.round(nr.width), rmkSeen: Math.round(Math.max(0, Math.min(nr.right, gr.right) - Math.max(nr.left, gr.left))),
    ctlInside: lc.right <= gr.right + 0.5, rcpInside: slots[1] ? slots[1].right <= gr.right + 0.5 : null,
    cutPx: Math.max(0, Math.round(far - gr.right)), sideL: Math.round((document.querySelector('.sb-side') || { getBoundingClientRect: () => ({ left: innerWidth }) }).getBoundingClientRect().left)
  }
})

/* D1781 */
for (const W of [821, 874, 900, 1000, 1099]) {
  const { ctx, page } = await world({ width: W, height: 900 }, false)
  const b = await lineMeasure(page), d = DRAWN.q2.C[W]
  for (const k of ['lineH', 'lineW', 'rmkW', 'rmkSeen', 'ctlInside', 'rcpInside', 'cutPx', 'sideL']) cmp(`${W} wide`, k, b[k], d[k])
  b.lineHs.forEach((h, i) => cmp(`${W} wide`, `line ${i + 1} height`, h, d.lineHs[i]))
  const l = page.locator('#sbBoard .sb-line').filter({ visible: true }).first()
  await l.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300)
  const hb = await page.locator('#sbBoard .sb-lcols').filter({ visible: true }).first().boundingBox()
  const l2 = await page.locator('#sbBoard .sb-line').filter({ visible: true }).nth(1).boundingBox()
  await page.screenshot({ path: `${OUT}/built-${W}.png`, clip: { x: 0, y: Math.max(0, hb.y - 44), width: b.sideL, height: l2.y + l2.height - hb.y + 56 } })
  await ctx.close()
}

/* D1780 */
{
  const { ctx, page } = await world({ width: 874, height: 402 }, true)
  const top = () => page.evaluate(() => {
    const t = document.querySelector('#schedBoard .sb-top').getBoundingClientRect()
    const it = sel => { const e = document.querySelector('#schedBoard .sb-top > ' + sel); const r = e.getBoundingClientRect(); return { t: Math.round(r.top - t.top), b: Math.round(r.bottom - t.top), l: Math.round(r.left), w: Math.round(r.width) } }
    return { topTop: Math.round(t.top), h: Math.round(t.height), bottom: Math.round(t.bottom), actions: it('.sb-actions'), hl: it('.sb-hl') }
  })
  const rest = await top()
  cmp('sideways at rest', 'top height', rest.h, DRAWN.q1.rest.h)
  await page.screenshot({ path: `${OUT}/built-sideways-rest.png` })
  await page.evaluate(() => { document.querySelector('.schedboard').scrollTop = 600 }); await page.waitForTimeout(200)
  const s = await top(), d = DRAWN.q1.foldScrolled
  cmp('sideways scrolled', 'bar on screen (its foot)', s.bottom, d.h)
  const da = d.items.find(i => i.cls === 'sb-actions'), dh = d.items.find(i => i.cls === 'sb-hl')
  for (const k of ['l', 'w']) { cmp('sideways scrolled', `the buttons' ${k}`, s.actions[k], da[k]); cmp('sideways scrolled', `the chips' ${k}`, s.hl[k], dh[k]) }
  cmp('sideways scrolled', "the buttons' top on screen", s.topTop + s.actions.t, da.t)
  await page.screenshot({ path: `${OUT}/built-sideways-scrolled.png` })
  /* the keys up: the drawn box (the first jet's LD) tapped low on the screen, the stand-in keyboard 200px */
  await page.evaluate(() => { document.querySelector('.schedboard').scrollTop = 0 }); await page.waitForTimeout(200)
  const box = page.locator(`#schedBoard [data-fld="${DRAWN.q1.keys.box.fld}"], #schedBoard [data-bfld="${DRAWN.q1.keys.box.fld}"]`).first()
  if (await box.count()) {
    const bb = await box.boundingBox()
    await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + Math.min(bb.height / 2, 8))
    await page.evaluate(() => { const v = window.__vv; v.height = innerHeight - 200; v.dispatchEvent(new Event('resize')) })
    await page.waitForTimeout(700)
    const k = await top()
    cmp('sideways, keys up', 'list shown above the keys', 202 - k.bottom, DRAWN.q1.fold.keys.listShown)
    await page.screenshot({ path: `${OUT}/built-sideways-keys.png` })
  } else diffs.push(`sideways: the drawn box ${DRAWN.q1.keys.box.fld} not found`)
  await ctx.close()
}
writeFileSync(`${OUT}/drawcheck.json`, JSON.stringify({ rows, diffs }, null, 1))
console.log(`${rows.length} figures compared, ${diffs.length} over ${TOL}px:`)
diffs.forEach(x => console.log('  ' + x))
await browser.close()
