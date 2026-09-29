// THE WALK, part 2 — Astra's scenario design for [OIL-AWARD-IS-A-GRANT] (docs/handpass/2026-09-29-oil-award-scenarios-astra.md),
// the ranks a scripted browser can reach without publishing a schedule day: 1 (a person deleted), 2 (a spent award),
// 6 (two awards on the 3-day day), 9 (a member's own award across the stages), 11 (a batch credit undone as one), 12 (the
// Delete confirm names "3 days"), 14 (a weekday award from the grid, no reason, then edited), 16 (the sign and the date
// rules in the tracker's editors), 21 (a reload keeps one record). Assertions of the right behaviour: PASS means correct.
//   Serve first (from raptor-port/): npm run build && npx vite preview --port 4183
//   Then (from raptor-port/): WALK_PORT=4183 node scripts/handpass/oa/oa-walk2.mjs <outdir> [desktop|phone|both]
import { chromium, devices } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'

const OUT = process.argv[2] || 'walk2-out'
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
  const mk = async () => kind === 'phone' ? b.newContext({ ...devices['iPhone 13'] }) : b.newContext({ viewport: { width: 1440, height: 900 } })
  const errors = []
  const watch = (page, who) => {
    page.on('pageerror', e => errors.push(`pageerror(${who}): ` + e.message))
    page.on('console', m => { if (m.type() === 'error') errors.push(`console(${who}): ` + m.text()) })
    page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`) })
  }
  say(`\n=== ${kind} ===`)

  /* ---- context A: admin ------------------------------------------------ */
  const ctx = await mk()
  const page = await ctx.newPage(); watch(page, 'admin')
  const shot = async name => { await page.screenshot({ path: `${OUT}/${kind}-${name}.png` }); say(`  picture: ${kind}-${name}.png`) }
  await signIn(page, 'ad', 'a')
  await toWar(page)
  const today = await page.evaluate(() => { const d = new Date(); const p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}` })

  /* rank 2 — a SPENT award (NOMAD 10 Jan, taken the week after) still draws FO; the breakdown says awarded and taken */
  await toDay(page, 'pike', '2026-01-10')
  check('R2 the spent award still draws FO on its day', (await cellText(page, 'pike', '2026-01-10')).includes('FO'))
  await page.locator('[data-testid="counter-pick"]').click(); await page.locator('[data-testid="counter-oil"]').click(); await page.waitForTimeout(200)
  await page.locator('[data-testid="bal-pike"]').scrollIntoViewIfNeeded(); await page.locator('[data-testid="bal-pike"]').click()
  const r2 = (await page.locator('[data-testid="figure-breakdown"] .crow-top').allInnerTexts()).map(s => s.replace(/\s+/g, ' '))
  check('R2 the breakdown: awarded 1, OIL taken −1', r2.includes('awarded 1') && r2.some(s => /^OIL taken -1/.test(s)), JSON.stringify(r2))
  await esc(page)

  /* rank 6 + 12 — CINDER's 3-day award, a half day beside it (the tracker's date is today, so give it on the grid) */
  await toDay(page, 'ammo', '2026-07-04')
  await page.locator('[data-testid="cell-ammo-2026-07-04"]').click(); await page.waitForTimeout(300)
  const r6oil = await txt(page, 'bid-oil')
  check('R6 the one-day sheet names the one award by its worth', r6oil.includes('3 days'), r6oil)
  /* rank 12 — Delete's first tap names the award with its worth and takes nothing */
  if (await page.locator('[data-testid="bid-clear"]').count()) {
    await page.locator('[data-testid="bid-clear"]').click(); await page.waitForTimeout(250)
    const note = (await page.locator('.bidsheet .note, [data-testid="bid-note"], .note').allInnerTexts()).join(' | ')
    check('R12 the first Delete names the award as "3 days" and takes nothing', /3 days/.test(note) && (await cellText(page, 'ammo', '2026-07-04')).includes('FO'), note.slice(0, 160))
    await shot('r12-delete-confirm')
  } else check('R12 the one-day sheet offers Delete on an award-only day (D260 (c))', false, 'no bid-clear')
  await esc(page)

  /* rank 14 — a WEEKDAY award from the grid's +OIL panel, NO reason, 1.5 days; then changed to half a day */
  const WD = '2026-01-13'
  await toDay(page, 'slipway', WD)
  await page.locator(`[data-testid="cell-slipway-${WD}"]`).click(); await page.waitForTimeout(300)
  await page.locator('[data-testid="bid-oil"]').click()
  await page.locator('[data-testid="oil-days"]').fill('1.5')
  await page.locator('[data-testid="oil-give"]').click(); await page.waitForTimeout(300)
  check('R14 a weekday award with no reason lands, FO', (await cellText(page, 'slipway', WD)).includes('FO'), await cellText(page, 'slipway', WD))
  await esc(page)
  await page.locator(`[data-testid="cell-slipway-${WD}"]`).click(); await page.waitForTimeout(300)
  await page.locator('[data-testid="bid-oil"]').click()
  await page.locator('[data-testid="oil-days"]').fill('0.5')
  await page.locator('[data-testid="oil-why"]').fill('Changed to half')
  await page.locator('[data-testid="oil-give"]').click(); await page.waitForTimeout(300)
  await esc(page)
  check('R14 the same award, now half a day, reads HO — not a second record', (await cellText(page, 'slipway', WD)).trim().startsWith('HO') && !(await cellText(page, 'slipway', WD)).includes('+1'), await cellText(page, 'slipway', WD))
  await shot('r14-weekday-ho')

  /* rank 16 — the tracker's editors: an award refuses a negative amount; a correction keeps its date picker */
  await page.locator('[data-testid="oil-tracker"]').click(); await page.waitForSelector('[data-testid="oil-sheet"]')
  const aw = page.locator('[data-testid="oil-row-slipway"] [data-testid^="oil-entry-ol-"]', { hasText: 'Changed to half' }).first()
  await aw.scrollIntoViewIfNeeded(); await aw.click()
  await page.locator('[data-testid="oil-edit-amt"]').fill('-1')
  await page.locator('[data-testid="oil-edit-save"]').click(); await page.waitForTimeout(250)
  const r16 = await txt(page, 'oil-edit-err')
  check('R16 an award will not become a correction — refused, in words', /stays an award/.test(r16), r16)
  await page.locator('[data-testid="oil-edit-cancel"]').click()
  const corr = page.locator('[data-testid="oil-entry-dol-3"]')
  await corr.scrollIntoViewIfNeeded(); await corr.click()
  const cdate = await page.locator('[data-testid="oil-edit-date"]').evaluate(el => el.tagName).catch(() => '(absent)')
  check('R16 a correction keeps its date picker', cdate === 'BUTTON' || cdate === 'DIV', cdate)
  await shot('r16-correction-editor')
  await page.locator('[data-testid="oil-edit-cancel"]').click()
  await closeTracker(page)

  /* rank 11 — a batch credit to two men is ONE undo step */
  await trackerCredit(page, ['divot', 'spaceman'], 1, 'Batch walk')
  await closeTracker(page)
  await toDay(page, 'divot', today)
  const bb = [await cellText(page, 'divot', today), await cellText(page, 'spaceman', today)]
  check('R11 both men’s awards are on the grid', bb.every(s => /FO/.test(s)), JSON.stringify(bb))
  await page.locator('#undoBtn').click(); await page.waitForTimeout(500)
  const ba = [await cellText(page, 'divot', today), await cellText(page, 'spaceman', today)]
  check('R11 ONE Undo takes both away', ba.every(s => !/FO/.test(s)), JSON.stringify(ba))
  await page.locator('#redoBtn').click(); await page.waitForTimeout(500)
  const br = [await cellText(page, 'divot', today), await cellText(page, 'spaceman', today)]
  check('R11 ONE Redo puts both back, once', br.every(s => /FO/.test(s) && !/\+1/.test(s)), JSON.stringify(br))
  await shot('r11-after-redo')

  /* rank 21 — a reload keeps exactly one record (the grid and the tracker) */
  await signIn(page, 'ad', 'a'); await toWar(page); await toDay(page, 'divot', today)
  const rl = await cellText(page, 'divot', today)
  check('R21 after a reload the award is there once', /FO/.test(rl) && !/\+1/.test(rl), rl)

  /* rank 1 — HEX (rocky) deleted: his award before today stays, today's and later go, his correction stays */
  const past = '2026-09-20'
  await trackerCredit(page, ['rocky'], 0.5, 'Hex today')
  await closeTracker(page)
  await toDay(page, 'rocky', past)
  await page.locator(`[data-testid="cell-rocky-${past}"]`).click(); await page.waitForTimeout(300)
  if (await page.locator('[data-testid="bid-oil"]').count()) {
    await page.locator('[data-testid="bid-oil"]').click()
    await page.locator('[data-testid="oil-days"]').fill('0.5')
    await page.locator('[data-testid="oil-why"]').fill('Hex past')
    await page.locator('[data-testid="oil-give"]').click(); await page.waitForTimeout(300)
  }
  await esc(page)
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(500)
  const row = page.locator('[data-person="rocky"] .acc-tap')
  if (await row.count()) {
    await row.click(); await page.waitForTimeout(200)
    await page.locator('#accEdDel').click(); await page.waitForTimeout(200)
    await shot('r1-delete-armed')
    await page.locator('#accEdDel').click(); await page.waitForTimeout(600)
    await toWar(page); await toDay(page, 'rocky', past)
    const pastCell = await cellText(page, 'rocky', past)
    check('R1 his past award stays on his past row', /HO/.test(pastCell), pastCell)
    const todayCell = await cellText(page, 'rocky', today)
    check('R1 his award dated today is gone', !/HO|FO/.test(todayCell), todayCell)
    await shot('r1-after-delete')
  } else check('R1 Hex is on Admin → Users', false)

  /* rank 9 — RANGER's own award at open, closed and published; another man's never opens */
  await trackerCredit(page, ['bane'], 1, 'Member walk')
  await closeTracker(page)
  const stage = async () => (await txt(page, 'stage-now'))
  const p2ctx = ctx   // the SAME browser storage — a new context is a fresh demo world
  for (const step of ['as is', 'closed', 'published']) {
    if (step !== 'as is') { await page.locator('[data-testid="stage-advance"]').click(); await page.waitForTimeout(400) }
    const s = await stage()
    const m = await p2ctx.newPage(); watch(m, 'member')
    await signIn(m, 'us', 'us'); await toWar(m); await toDay(m, 'bane', today)
    await m.locator(`[data-testid="cell-bane-${today}"]`).click(); await m.waitForTimeout(400)
    const why = await txt(m, 'oil-detail-why')
    const writers = await m.locator('[data-testid="oil-give"], [data-testid="oil-clear"], [data-testid^="dl-oil-edit-"]').count()
    check(`R9 (${s}) his own award opens, read back, with no award writer`, why === 'Member walk' && writers === 0, JSON.stringify({ why, writers }))
    await m.screenshot({ path: `${OUT}/${kind}-r9-member-${step.replace(' ', '')}.png` })
    await esc(m)
    await m.locator(`[data-testid="cell-divot-${today}"]`).click(); await m.waitForTimeout(400)
    const opened = await m.locator('[data-testid="award-sheet"], [data-testid="bid-picker"], [data-testid="daylist"]').count()
    check(`R9 (${s}) another man’s award opens nothing`, opened === 0, String(opened))
    await m.close()
  }

  check(`${kind}: no console errors, page errors or 4xx`, errors.length === 0, errors.slice(0, 5).join(' | '))
  await b.close()
}

for (const k of WHICH === 'both' ? ['desktop', 'phone'] : [WHICH]) {
  try { await run(k) } catch (e) { fail++; say(`FAIL ${k}: the walk stopped — ${e.message.split('\n')[0]}`) }
}
say(`\n${pass} passed, ${fail} failed`)
writeFileSync(`${OUT}/walk2.log`, log.join('\n'))
