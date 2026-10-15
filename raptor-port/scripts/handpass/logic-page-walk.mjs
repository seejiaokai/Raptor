/* WALK of the rewritten Logic page ([LOGIC-PAGE-LAYOUT], owner D928-D933, 15 Oct 26) — on the served build, at his
   phone's size (390 x 844, 3x), the narrowest phone (320) and a desktop (1280 x 800). Every step presses the page's
   real controls (the Filter button and its menu, ✎ Edit, a value's box, a row's own Reset, Reset to standard, a fold's
   summary, a door) and asserts what a person SEES — written as the RIGHT behaviour, so a PASS means correct and a re-run
   is the re-walk (bug-check order §5). Pictures to docs/img/handpass/2026-10-15-logic-medical/ (or argv[3]).
   usage: node scripts/handpass/logic-page-walk.mjs [baseURL] [outDir] */
import { createRequire } from 'node:module'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const base = process.argv[2] || 'http://localhost:4173'
const out = process.argv[3] || 'docs/img/handpass/2026-10-15-logic-medical'
mkdirSync(out, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }
const NARROW = { viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }
const DESK = { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 }
const results = [], errors = []
const ok = (step, pass, note = '') => { results.push({ step, pass: !!pass, note }); console.log((pass ? 'PASS ' : 'FAIL ') + step + (note ? ' — ' + note : '')) }

async function open(dev, user = 'ad', pass = 'a') {
  const ctx = await b.newContext({ baseURL: base, ...dev })
  const p = await ctx.newPage()
  p.on('pageerror', e => errors.push(e.message))
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  await p.goto('/?fresh=1'); await p.fill('#luser', user); await p.fill('#lpass', pass); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await p.waitForTimeout(300)
  await p.evaluate(() => window.go('logic')); await p.waitForSelector('#lgBody .lgset'); await p.waitForTimeout(300)
  return { ctx, p }
}
/* a press as a person makes it: on a phone a tap at the element's middle, after proving it is on screen and on top */
async function press(p, sel, phone) {
  const l = p.locator(sel).first()
  const onTop = await l.evaluate(e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return r.top >= 0 && r.bottom <= innerHeight && !!h && (h === e || e.contains(h)) })
  if (!onTop) { await l.evaluate(e => e.scrollIntoView({ block: 'center' })); await p.waitForTimeout(150) }
  if (phone) await l.tap(); else await l.click()
}
const row = async p => p.evaluate(() => {
  const bar = document.querySelector('.lgbar'), els = [...bar.querySelectorAll('h1,.searchbox,button')].filter(e => e.getClientRects().length && !e.closest('.lgmenu'))
  const rs = els.map(e => { const r = e.getBoundingClientRect(); return { id: e.id || e.className, mid: Math.round(r.top + r.height / 2), right: r.right, h: Math.round(r.height), w: Math.round(r.width) } })
  return { one: Math.max(...rs.map(r => r.mid)) - Math.min(...rs.map(r => r.mid)) <= 2, fits: rs.every(r => r.right <= innerWidth), noSide: document.documentElement.scrollWidth <= innerWidth, btnH: rs.filter(r => /abtn/.test(r.id) || /^lg/.test(r.id)).map(r => r.h), searchW: (rs.find(r => /searchbox/.test(r.id)) || {}).w }
})

for (const [key, dev] of [['phone', PHONE], ['desk', DESK]]) {
  const phone = key === 'phone'
  const { ctx, p } = await open(dev)
  let r = await row(p)
  ok(`${key}: the page's controls are one row, inside the screen`, r.one && r.fits && r.noSide, JSON.stringify(r))
  ok(`${key}: settings first, then the checks`, await p.evaluate(() => [...document.querySelectorAll('#lgBody .lgpart')].map(e => e.id).join() === 'lgSettings,lgChecks'))
  ok(`${key}: no engine names or fired counts on the page`, await p.evaluate(() => !/VCONF\.|fired \d+×|not fired this week/.test(document.querySelector('#lgBody').textContent)))
  await p.screenshot({ path: `${out}/${key}-logic-top.png` })
  /* the checks, with the crew-rest fold opened by its own summary */
  await p.evaluate(() => document.querySelector('#lgChecks').scrollIntoView({ block: 'start' })); await p.waitForTimeout(200)
  await press(p, '#lgBody details[data-how="crewrest"] summary', phone); await p.waitForTimeout(150)
  ok(`${key}: the crew-rest "How it works" opens`, await p.evaluate(() => document.querySelector('#lgBody details[data-how="crewrest"]').open))
  await p.evaluate(() => { const e = document.querySelector('#lgBody .lgchk[data-chk="crewrest"]'); const top = document.querySelector('.lgbar').getBoundingClientRect().bottom; scrollBy(0, e.getBoundingClientRect().top - top - 8) }); await p.waitForTimeout(150)
  await p.screenshot({ path: `${out}/${key}-logic-checks-fold.png` })
  /* the filter: the menu, then Warnings only */
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(100)
  await press(p, '#lgFilterBtn', phone); await p.waitForSelector('#lgFilters')
  const menuIn = await p.evaluate(() => { const r = document.querySelector('#lgFilters').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight })
  ok(`${key}: the filter menu opens inside the screen`, menuIn)
  await p.screenshot({ path: `${out}/${key}-logic-filter-menu.png` })
  await press(p, '#lgFilters [data-lgf="hard"]', phone); await p.waitForTimeout(150)
  ok(`${key}: Warnings shows red checks only, the settings hidden, the button says what is on`, await p.evaluate(() => !document.querySelector('#lgSettings') && [...document.querySelectorAll('#lgBody .lgchk')].every(e => e.classList.contains('hard')) && document.querySelector('#lgFilterBtn').textContent === 'Warnings'))
  await p.screenshot({ path: `${out}/${key}-logic-warnings.png` })
  await press(p, '#lgFilterBtn', phone); await press(p, '#lgFilters [data-lgf="all"]', phone); await p.waitForTimeout(150)
  /* editing: Crew rest to 11h — the line under it, the check's name and the crew-rest line follow at once (D932) */
  await press(p, '#lgEdit', phone); await p.waitForSelector('#lgBody input[data-lgset="crewRest"]')
  const box = p.locator('#lgBody input[data-lgset="crewRest"]')
  await box.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await box.fill('11h'); await box.press('Tab'); await p.waitForTimeout(300)
  const after = await p.evaluate(() => ({ std: document.querySelector('#lgBody .lgset.off .lgstd')?.textContent || '', name: document.querySelector('#lgBody .lgchk[data-code="CREW_REST"] .lgnm').textContent, line: document.querySelector('#lgBody .lgchk[data-code="CREW_REST"] .lgwhy').textContent, strip: !document.querySelector('#lgOff').hidden, stamp: document.body.classList.contains('page-rules-off') }))
  ok(`${key}: a changed crew rest shows its standard and its own Reset; the check says 11h; the strip and the stamp are up`, /Standard 12h/.test(after.std) && /Reset/.test(after.std) && /11h/.test(after.name) && /at least 11h/.test(after.line) && after.strip && after.stamp, JSON.stringify(after))
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(100)
  r = await row(p)
  ok(`${key}: editing with a value changed, the row (Done, Reset) is still one row inside the screen`, r.one && r.fits && r.noSide, JSON.stringify(r))
  await p.screenshot({ path: `${out}/${key}-logic-editing.png` })
  /* the row's own Reset puts crew rest back, alone */
  await press(p, '#lgBody .lgset.off [data-lgreset="crewRest"]', phone); await p.waitForTimeout(250)
  ok(`${key}: the row's own Reset puts crew rest back to 12h; nothing is left changed`, await p.evaluate(() => !document.querySelector('#lgBody .lgset.off') && document.querySelector('#lgOff').hidden && !document.body.classList.contains('page-rules-off') && /at least 12h/.test(document.querySelector('#lgBody .lgchk[data-code="CREW_REST"] .lgwhy').textContent)))
  /* the door: the Inputs cut-off's value opens the Inputs calendar's settings window */
  await press(p, '#lgBody [data-lgopen="inputs"]', phone); await p.waitForTimeout(300)
  ok(`${key}: the Inputs cut-off's value opens the Inputs calendar settings`, await p.locator('[data-testid="win-inputsset"]').isVisible())
  await p.locator('[data-testid="iset-cancel"]').click(); await p.waitForTimeout(150)
  await press(p, '#lgDone', phone)
  await ctx.close()
}
/* the narrowest phone, editing with a value changed: Done and Reset still fit with the search */
{
  const { ctx, p } = await open(NARROW)
  await p.tap('#lgEdit'); await p.waitForSelector('#lgBody input[data-lgset="step"]')
  const box = p.locator('#lgBody input[data-lgset="step"]'); await box.fill('1h10'); await box.press('Tab'); await p.waitForTimeout(250)
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(100)
  const r = await row(p)
  ok('320: editing with a value changed, one row, the search still usable', r.one && r.fits && r.noSide && r.searchW >= 44, JSON.stringify(r))
  await p.screenshot({ path: `${out}/narrow-logic-editing.png` })
  await p.tap('#lgReset'); await p.tap('#lgDone')
  await ctx.close()
}
/* a member reads the same page: values only, no box, no door, no Edit */
{
  const { ctx, p } = await open(PHONE, 'us', 'us')
  ok('member: no Edit, no box, no door, the values readable', await p.evaluate(() => document.querySelector('#lgEdit').hidden && !document.querySelector('#lgBody input:not(#lgSearch), #lgBody [data-lgopen], #lgBody [data-lgreset]') && document.querySelectorAll('#lgBody .lgset .val').length > 10))
  await p.screenshot({ path: `${out}/phone-logic-member.png` })
  await ctx.close()
}
ok('no page errors in the console', errors.length === 0, errors.slice(0, 3).join(' | '))
writeFileSync(`${out}/logic-walk.json`, JSON.stringify({ results, errors }, null, 2))
console.log(`${results.filter(r => r.pass).length}/${results.length} PASS`)
await b.close()
