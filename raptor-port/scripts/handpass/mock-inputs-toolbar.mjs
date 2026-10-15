/* MOCK-UP for his direction D907 (15 Oct 26): on a phone the Inputs list's "+ Input" and dates buttons move up into the
   row of the calendar / list switch, the filter and the gear, at that row's button height (36). ONE transform on the
   real built page: the two existing nodes are MOVED (not restyled) into `.inputs-top`, after the tabs and before the
   switch, and drawn 36 tall; nothing else changes. Pictures: today and proposed, phone widths 390 (his) and 375 (the
   narrowest iPhone).
   usage: node scripts/handpass/mock-inputs-toolbar.mjs [baseURL] [outDir] — the served build (preview_start raptor-walk) */
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const base = process.argv[2] || 'http://localhost:4173'
const out = process.argv[3] || 'docs/img/handpass/2026-10-15-calendar-step-two/question'
mkdirSync(out, { recursive: true })
const b = await chromium.launch()
const res = {}
async function list(w, h) {
  const ctx = await b.newContext({ baseURL: base, viewport: { width: w, height: h }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
  const p = await ctx.newPage()
  await p.goto('/'); await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await p.waitForTimeout(400)
  await p.evaluate(() => window.go('inputs')); await p.waitForFunction(() => window.CURPAGE === 'inputs'); await p.waitForTimeout(400)
  await p.locator('#inListBtn').tap(); await p.waitForTimeout(400)
  return { ctx, p }
}
/* the transform — returns the measured row, and REFUSES when the premise is gone */
const move = p => p.evaluate(() => {
  const top = document.querySelector('.inputs-top'), views = document.querySelector('.inputs-views')
  const add = document.getElementById('inNew'), range = document.querySelector('.inrange'), rb = document.getElementById('inRangeBtn')
  if (!top || !views || !add || !range) throw new Error('premise gone')
  top.insertBefore(add, views); top.insertBefore(range, views)
  for (const e of [add, rb]) { e.style.height = '36px'; e.style.minHeight = '36px' }
  add.style.marginRight = '8px'
  document.querySelector('.inputs-listtools').style.display = 'none'
  const r = e => { const q = e.getBoundingClientRect(); return [Math.round(q.left), Math.round(q.top), Math.round(q.right), Math.round(q.bottom)] }
  return { add: r(add), range: r(rb), switch: r(views), gear: r(document.getElementById('inGear')), wide: document.documentElement.scrollWidth, vw: innerWidth }
})
for (const [w, h, tag] of [[390, 844, '390'], [375, 667, '375']]) {
  const t = await list(w, h)
  await t.p.screenshot({ path: `${out}/toolbar-today-${tag}.png`, clip: { x: 0, y: 0, width: w, height: 330 } })
  res['proposed-' + tag] = await move(t.p)
  await t.p.waitForTimeout(200)
  await t.p.screenshot({ path: `${out}/toolbar-proposed-${tag}.png`, clip: { x: 0, y: 0, width: w, height: 330 } })
  await t.ctx.close()
}
/* NOT pictured: the dates pop-up on the moved row — it is placed against the old row (.inputs-listtools), which the
   transform hides, so it opened below the screen. The build places it under the button's new row: one requirement the
   design note did not name. */
console.log(JSON.stringify(res))
await b.close()
