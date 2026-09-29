// THE WALK, part 3 — the re-walk of what the two final code reads' fixes touched ([OIL-AWARD-IS-A-GRANT], 29 Sep 26;
// docs/handpass/2026-09-29-oil-award-final-{astra,fable}.md): X1 the tracker refuses an award over 365 days (OA-001 / F4),
// X2 a correction's "given by" survives its edit (OA-002), X3 an award with no reason says so in the tracker (F1), X4 Undo
// names both when one Delete took a bid and an award (OA-003). Assertions of the right behaviour: PASS means correct.
//   Serve first (from raptor-port/): npm run build && npx vite preview --port 4183
//   Then (from raptor-port/): WALK_PORT=4183 node scripts/handpass/oa/oa-walk3.mjs <outdir> [desktop|phone|both]
import { chromium, devices } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'

const OUT = process.argv[2] || 'walk3-out'
const WHICH = process.argv[3] || 'both'
mkdirSync(OUT, { recursive: true })
const BASE = `http://localhost:${process.env.WALK_PORT || 4183}/`
const log = []
let pass = 0, fail = 0
const say = (...a) => { const s = a.join(' '); log.push(s); console.log(s) }
const check = (what, ok, detail = '') => { if (ok) pass++; else fail++; say(`${ok ? 'PASS' : 'FAIL'} ${what}${detail ? ' — ' + detail : ''}`) }
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

async function signIn(page, u, p) {
  await page.goto(BASE)
  await page.fill('#luser', u); await page.fill('#lpass', p); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
}
async function toWar(page) {
  await page.evaluate(() => window.go('leavewar'))
  await page.waitForFunction(() => window.CURPAGE === 'leavewar')
  await page.waitForSelector('[data-testid="row-slipway"]')
  const bar = page.locator('[data-testid="figures-toggle"]')
  if (await bar.count() && (await bar.getAttribute('aria-expanded')) === 'true') await bar.click()
}
async function toDay(page, pid, d) {
  await page.locator(`[data-testid="month-${MON[+d.slice(5, 7) - 1]}"]`).click()
  await page.waitForSelector(`[data-testid="cell-${pid}-${d}"]`, { timeout: 8000 })
  await page.locator(`[data-testid="cell-${pid}-${d}"]`).scrollIntoViewIfNeeded()
  await page.waitForTimeout(250)
}
const cellText = async (page, pid, d) => ((await page.locator(`[data-testid="cell-${pid}-${d}"]`).innerText().catch(() => '(none)'))).replace(/\s+/g, ' ')
const txt = async (page, tid) => (await page.locator(`[data-testid="${tid}"]`).count()) ? (await page.locator(`[data-testid="${tid}"]`).first().innerText()).trim() : '(absent)'
const esc = async page => { for (let i = 0; i < 3; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(120) } }
/* the tracker's credit bar: pick names, amount, reason, optional given by; the date is today (the bar's own default) */
async function trackerCredit(page, ids, amt, reason, given = '') {
  await page.locator('[data-testid="oil-tracker"]').click()
  await page.waitForSelector('[data-testid="oil-sheet"]')
  for (const id of ids) { await page.locator(`[data-testid="oil-name-${id}"]`).scrollIntoViewIfNeeded(); await page.locator(`[data-testid="oil-name-${id}"]`).click() }
  await page.locator('[data-testid="oil-amt"]').fill(String(amt))
  await page.locator('[data-testid="oil-reason"]').fill(reason)
  if (given) await page.locator('[data-testid="oil-given"]').fill(given)
  await page.locator('[data-testid="oil-credit-save"]').click()
  await page.waitForTimeout(300)
}
const closeTracker = async page => { if (await page.locator('[data-testid="oil-close"]').count()) await page.locator('[data-testid="oil-close"]').click(); await page.waitForTimeout(150) }
const store = page => page.evaluate(() => 0)   // placeholder so a page stays referenced

async function run(kind) {
  const b = await chromium.launch()
  const ctx = kind === 'phone' ? await b.newContext({ ...devices['iPhone 13'] }) : await b.newContext({ viewport: { width: 1440, height: 900 } })
  const errors = []
  const page = await ctx.newPage()
  page.on('pageerror', e => errors.push('pageerror: ' + e.message))
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`) })
  const shot = async name => { await page.screenshot({ path: `${OUT}/${kind}-${name}.png` }); say(`  picture: ${kind}-${name}.png`) }
  say(`\n=== ${kind} ===`)
  await signIn(page, 'ad', 'a')
  await toWar(page)
  /* the war's saved ledger, read back from the browser's own storage (a built site persists) */
  const ledger = () => page.evaluate(() => {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (/leavewar/.test(k) && /ledger/.test(k)) { try { const v = JSON.parse(localStorage.getItem(k)); return Array.isArray(v) ? v : (JSON.parse(v) ?? []) } catch { return [] } }
    }
    return null
  })

  /* X1 — the tracker's credit bar refuses 365.5 days, in words, and saves nothing */
  const n0 = (await ledger() ?? []).length
  await trackerCredit(page, ['slipway'], 365.5, 'Too much')
  const x1 = await txt(page, 'oil-credit-err')
  check('X1 the tracker refuses an award over 365 days, in words', /more than 365 days/.test(x1) && (await ledger() ?? []).length === n0, x1)
  await shot('x1-over-365')

  /* X2 — a correction given with a "given by", then its reason edited: the "given by" is still stored */
  await page.locator('[data-testid="oil-amt"]').fill('-1')
  await page.locator('[data-testid="oil-reason"]').fill('Walk fix')
  await page.locator('[data-testid="oil-given"]').fill('OC Ops')
  await page.locator('[data-testid="oil-credit-save"]').click(); await page.waitForTimeout(300)
  const before = (await ledger() ?? []).find(e => e.reason === 'Walk fix')
  const corr = page.locator('[data-testid="oil-row-slipway"] .oil-e.corr', { hasText: 'Walk fix' }).first()
  await corr.scrollIntoViewIfNeeded(); await corr.click()
  await page.locator('[data-testid="oil-edit-reason"]').fill('Walk fix edited')
  await shot('x2-correction-editor')
  await page.locator('[data-testid="oil-edit-save"]').click(); await page.waitForTimeout(300)
  const after = (await ledger() ?? []).find(e => e.id === before?.id)
  check('X2 a correction keeps its "given by" through an edit', before?.givenBy === 'OC Ops' && after?.reason === 'Walk fix edited' && after?.givenBy === 'OC Ops',
    JSON.stringify({ before: before?.givenBy, after: after?.givenBy, reason: after?.reason }))
  await closeTracker(page)

  /* X3 — an award given on the grid with no reason: the tracker's box says so, and that a tap adds one */
  const WD = '2026-01-13'
  await toDay(page, 'slipway', WD)
  await page.locator(`[data-testid="cell-slipway-${WD}"]`).click(); await page.waitForTimeout(300)
  await page.locator('[data-testid="bid-oil"]').click()
  await page.locator('[data-testid="oil-days"]').fill('1')
  await page.locator('[data-testid="oil-give"]').click(); await page.waitForTimeout(300)
  await esc(page)
  await page.locator('[data-testid="oil-tracker"]').click(); await page.waitForSelector('[data-testid="oil-sheet"]')
  const nr = page.locator('[data-testid="oil-row-slipway"] [data-testid^="oil-noreason-"]').first()
  const x3 = (await nr.count()) ? (await nr.scrollIntoViewIfNeeded(), (await nr.innerText()).trim()) : '(absent)'
  check('X3 an award with no reason says "no reason — tap to add one"', x3 === 'no reason — tap to add one', x3)
  await shot('x3-no-reason')
  await closeTracker(page)

  /* X4 — Cinder's day holds ONE record, his 3-day award: Delete takes it, and Undo keeps the award's own words */
  await toDay(page, 'ammo', '2026-07-04')
  await page.locator('[data-testid="cell-ammo-2026-07-04"]').click(); await page.waitForTimeout(300)
  await page.locator('[data-testid="bid-clear"]').click(); await page.waitForTimeout(250)
  await page.locator('[data-testid="bid-clear"]').click(); await page.waitForTimeout(400)
  await esc(page)
  const gone = await cellText(page, 'ammo', '2026-07-04')
  const x4 = await page.locator('#undoBtn').getAttribute('title')
  check('X4 Delete took the award', !/FO/.test(gone), gone)
  check('X4 an award alone keeps its own words — "… OIL award"', /OIL award$/.test(x4 ?? '') && !/bid/.test(x4 ?? ''), x4)
  await page.locator('#undoBtn').click(); await page.waitForTimeout(500)
  check('X4 Undo brings the award back', /FO/.test(await cellText(page, 'ammo', '2026-07-04')), await cellText(page, 'ammo', '2026-07-04'))

  /* X5 — DJ's 19 Jan holds a refused bid AND an award: a dragged block's Delete takes both (D260), and Undo names both
     (OA-003). Desktop only — the phone's touch-hold drag is not what a scripted mouse drives (as in the browser tests). */
  if (kind === 'desktop') {
    await toDay(page, 'dj', '2026-01-19')
    const sheet = page.locator('[data-testid="select-sheet"]')
    for (let i = 0; i < 5 && !(await sheet.isVisible()); i++) {
      const a = (await page.locator('[data-testid="cell-dj-2026-01-19"]').boundingBox())
      const z = (await page.locator('[data-testid="cell-dj-2026-01-20"]').boundingBox())
      await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down()
      await page.mouse.move(a.x + a.width / 2 + 8, a.y + a.height / 2)
      await page.mouse.move(z.x + z.width / 2, z.y + z.height / 2, { steps: 6 }); await page.mouse.up()
      await page.waitForTimeout(600)
    }
    await page.locator('[data-testid="sel-delete"]').click(); await page.waitForTimeout(250)
    await shot('x5-delete-armed')
    await page.locator('[data-testid="sel-delete"]').click(); await page.waitForTimeout(500)
    const x5 = await page.locator('#undoBtn').getAttribute('title')
    check('X5 the dragged Delete took the bid and the award', (await cellText(page, 'dj', '2026-01-19')).trim() === '', await cellText(page, 'dj', '2026-01-19'))
    check('X5 Undo names both — "… bid and OIL award"', /bid and OIL award/.test(x5 ?? ''), x5)
    await page.locator('#undoBtn').click(); await page.waitForTimeout(500)
    check('X5 Undo brings both back — FO with the bid behind a +1', /FO/.test(await cellText(page, 'dj', '2026-01-19')) && /\+1/.test(await cellText(page, 'dj', '2026-01-19')), await cellText(page, 'dj', '2026-01-19'))
    await shot('x5-after-undo')
  }

  check(`${kind}: no console errors, page errors or 4xx`, errors.length === 0, errors.slice(0, 5).join(' | '))
  await b.close()
}

for (const k of WHICH === 'both' ? ['desktop', 'phone'] : [WHICH]) {
  try { await run(k) } catch (e) { fail++; say(`FAIL ${k}: the walk stopped — ${e.message.split('\n')[0]}`) }
}
say(`\n${pass} passed, ${fail} failed`)
writeFileSync(`${OUT}/walk3.log`, log.join('\n'))
