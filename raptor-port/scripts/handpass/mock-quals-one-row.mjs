/* MOCK-UP of Quals' one row ([GUIDE-ONE-ROW], D926 — "Quals' Export to Excel, drawn for him before a build") on the
   REAL app — 15 Oct 26. The page's own controls (Enable editing / Save changes / Edit quals, the date box, Export to
   Excel, the filter) today wrap onto two rows on a phone. Drawn: today, and the proposal — one row at the app's row
   height (36), at his phone's size (390 x 844, 3x) and a desktop's (1280 x 800), in both states an admin meets (not
   editing; editing, where Save changes and Edit quals stand in the row).
   The proposal's ONE transform (option A): the date box removed (it changes nothing — no code reads it; a copy of the
   original app's static box), every control at 36 tall, the filter taking what is left of the row; on a phone the
   export button reads "Export" (D910's shorter words). Everything measured, nothing typed in.
   usage: node scripts/handpass/mock-quals-one-row.mjs [baseURL] [outDir] — the served build (preview_start raptor-walk) */
import { createRequire } from 'node:module'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const base = process.argv[2] || 'http://localhost:4173'
const out = process.argv[3] || 'docs/img/handpass/2026-10-15-quals-one-row'
mkdirSync(out, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const errors = []
const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }
const DESK = { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 }
const facts = {}

async function signedIn(dev) {
  const ctx = await b.newContext({ baseURL: base, ...dev })
  const p = await ctx.newPage()
  p.on('pageerror', e => errors.push(e.message))
  await p.goto('/?fresh=1'); await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await p.waitForTimeout(400)
  return { ctx, p }
}
const mark = (p, sels) => p.evaluate(sels => {
  document.querySelectorAll('[data-mock="marker"]').forEach(e => e.remove())
  for (const sel of sels) {
    const els = [...document.querySelectorAll(sel)].filter(e => e.offsetParent !== null)
    if (!els.length) throw new Error('premise gone: ' + sel)
    const rs = els.map(e => e.getBoundingClientRect())
    const l = Math.min(...rs.map(r => r.left)) - 3, t = Math.min(...rs.map(r => r.top)) - 3
    const r = Math.max(...rs.map(r => r.right)) + 3, bt = Math.max(...rs.map(r => r.bottom)) + 3
    const m = document.createElement('div'); m.setAttribute('data-mock', 'marker')
    m.style.cssText = `position:fixed;left:${l}px;top:${t}px;width:${r - l}px;height:${bt - t}px;border:2px dashed #ff8a1c;border-radius:8px;pointer-events:none;z-index:2147483647`
    document.body.appendChild(m)
  }
}, sels)
/* the bar's visible controls: their rows (distinct tops) and sizes */
const measure = p => p.evaluate(() => {
  const bar = document.querySelector('.qbar')
  const els = [...bar.children].filter(e => e.offsetParent !== null && !e.classList.contains('grow'))
  const rs = els.map(e => ({ id: e.id || e.className, top: Math.round(e.getBoundingClientRect().top), h: Math.round(e.getBoundingClientRect().height), w: Math.round(e.getBoundingClientRect().width) }))
  return { barH: Math.round(bar.getBoundingClientRect().height), rows: new Set(rs.map(r => r.top)).size, els: rs }
})
const propose = (p, phone) => p.evaluate(phone => {
  const bar = document.querySelector('.qbar')
  document.getElementById('qDate')?.remove()
  bar.style.flexWrap = 'nowrap'
  for (const e of bar.querySelectorAll(':scope > button')) { e.style.height = '36px'; e.style.paddingTop = '0'; e.style.paddingBottom = '0'; e.style.boxSizing = 'border-box'; e.style.flex = '0 0 auto'; e.style.whiteSpace = 'nowrap' }
  if (phone) { const x = document.getElementById('qExport'); if (x) x.textContent = 'Export' }
  const s = bar.querySelector('.searchbox')
  s.style.height = '36px'; s.style.boxSizing = 'border-box'
  /* a phone: the filter takes what is left of the row; a desktop keeps its filter at its own width, at the right */
  if (phone) { bar.querySelector('.grow')?.remove(); s.style.flex = '1 1 0'; s.style.minWidth = '0'; const i = s.querySelector('input'); i.style.width = '100%'; i.style.minWidth = '0' }
}, phone)

for (const [key, dev] of [['phone', PHONE], ['desk', DESK]]) {
  const phone = key === 'phone'
  for (const state of ['view', 'editing']) {
    const { ctx, p } = await signedIn(dev)
    await p.evaluate(() => window.go('quals')); await p.waitForFunction(() => window.CURPAGE === 'quals'); await p.waitForTimeout(500)
    if (state === 'editing') { await p.click('#qEdit'); await p.waitForSelector('#qSave', { state: 'visible' }); await p.waitForTimeout(200) }
    await p.evaluate(() => window.scrollTo(0, 0))
    const today = await measure(p)
    await mark(p, ['.qbar'])
    const clip = { x: 0, y: 0, width: dev.viewport.width, height: Math.min(dev.viewport.height, phone ? 420 : 300) }
    await p.screenshot({ path: `${out}/${key}-${state}-today.png`, clip })
    await propose(p, phone); await p.waitForTimeout(150)
    const after = await measure(p)
    const overflow = await p.evaluate(() => { const bar = document.querySelector('.qbar'); return [...bar.children].some(e => e.getBoundingClientRect().right > bar.getBoundingClientRect().right - 1) || document.documentElement.scrollWidth > innerWidth })
    const filterW = await p.evaluate(() => Math.round(document.querySelector('.qbar .searchbox').getBoundingClientRect().width))
    await mark(p, ['.qbar'])
    await p.screenshot({ path: `${out}/${key}-${state}-proposed.png`, clip })
    facts[`${key}-${state}`] = { today, after, overflow, filterW }
    await ctx.close()
  }
}
writeFileSync(`${out}/facts.json`, JSON.stringify({ facts, errors }, null, 2))
console.log(JSON.stringify({ facts, errors }, null, 1))
await b.close()
