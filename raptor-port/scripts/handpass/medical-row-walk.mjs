/* WALK of the Medical tab's one row ([MEDICAL-ONE-ROW], owner D927, 15 Oct 26) on the served build — his phone's size
   (390 x 844, 3x, by touch) and a desktop (1280 x 800, by mouse): the Inputs page, the Medical tab pressed; no heading;
   the as-of button at 36 under the tabs; its picker opened on screen, a date picked; Today joins the row at 36; Today
   pressed. Written as the RIGHT behaviour (a PASS means correct). Pictures beside the Logic page's:
   docs/img/handpass/2026-10-15-logic-medical/. usage: node scripts/handpass/medical-row-walk.mjs [baseURL] [outDir] */
import { createRequire } from 'node:module'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const base = process.argv[2] || 'http://localhost:4173'
const out = process.argv[3] || 'docs/img/handpass/2026-10-15-logic-medical'
mkdirSync(out, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const results = [], errors = []
const ok = (step, pass, note = '') => { results.push({ step, pass: !!pass, note }); console.log((pass ? 'PASS ' : 'FAIL ') + step + (note ? ' — ' + note : '')) }
for (const [key, dev] of [['phone', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }], ['desk', { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 }]]) {
  const phone = key === 'phone'
  const ctx = await b.newContext({ baseURL: base, ...dev }), p = await ctx.newPage()
  p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  await p.goto('/?fresh=1'); await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await p.waitForTimeout(300)
  await p.evaluate(() => window.go('inputs')); await p.waitForSelector('#inMedBtn')
  const press = sel => phone ? p.tap(sel) : p.click(sel)
  await press('#inMedBtn'); await p.waitForSelector('#medView'); await p.waitForTimeout(300)
  const m = await p.evaluate(() => {
    const head = document.querySelector('#medView .ic-head'), cal = document.querySelector('#medCalBtn').getBoundingClientRect(), tab = document.querySelector('#inMedBtn').getBoundingClientRect()
    return { heading: !!head.querySelector('.med-title') || /^\s*Medical/.test(head.textContent), h: Math.round(cal.height), under: cal.top > tab.bottom, inScreen: cal.left >= 0 && cal.right <= innerWidth }
  })
  ok(`${key}: no "Medical" heading; the as-of button at 36, under the tabs, on screen`, !m.heading && m.h === 36 && m.under && m.inScreen, JSON.stringify(m))
  await p.screenshot({ path: `${out}/${key}-medical-row.png` })
  await press('#medCalBtn'); await p.waitForSelector('.med-cal')
  const calIn = await p.evaluate(() => { const r = document.querySelector('.med-cal').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight })
  ok(`${key}: the as-of picker opens inside the screen`, calIn)
  await press('[data-medday="2026-07-03"]'); await p.waitForSelector('#medToday')
  const t = await p.evaluate(() => { const a = document.querySelector('#medCalBtn').getBoundingClientRect(), b = document.querySelector('#medToday').getBoundingClientRect(); return { h: Math.round(b.height), one: Math.abs((a.top + a.height / 2) - (b.top + b.height / 2)) <= 1, label: document.querySelector('#medCalBtn').textContent } })
  ok(`${key}: a date picked, Today joins the row at 36`, t.h === 36 && t.one && /3 Jul/.test(t.label), JSON.stringify(t))
  await p.screenshot({ path: `${out}/${key}-medical-row-today.png` })
  await press('#medToday'); await p.waitForTimeout(200)
  ok(`${key}: Today goes back to now and leaves the row`, await p.evaluate(() => !document.querySelector('#medToday')))
  await ctx.close()
}
ok('no page errors in the console', errors.length === 0, errors.slice(0, 3).join(' | '))
writeFileSync(`${out}/medical-walk.json`, JSON.stringify({ results, errors }, null, 2))
console.log(`${results.filter(r => r.pass).length}/${results.length} PASS`)
await b.close()
