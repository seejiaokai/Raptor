// THE WALK for [OIL-AWARD-IS-A-GRANT] with D400–D402 (29 Sep 26) — evidence sheet docs/handpass/2026-09-29-oil-award.md.
// Drives the real production build at desktop (1440x900) and phone (iPhone 13), admin then member, through the surfaces
// of the roll-call (§3 of the sheet): the seeded awards on the grid, the bid sheet's read-back, a tracker credit drawn on
// the grid at once (D402), the tracker's one editor (the date read only — D260), two awards on one day (the tap list),
// the OIL breakdown (earned / awarded / corrections — D400), a Delete from the day's list and its Undo, and a member's
// own award (D261) against another man's. Written as ASSERTIONS of the right behaviour: a PASS line means correct.
//   Serve first (from raptor-port/): npm run build && npx vite preview --port 4183
//   Then (from raptor-port/): WALK_PORT=4183 node scripts/handpass/oa/oa-walk.mjs <outdir> [desktop|phone|both]
import { chromium, devices } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'

const OUT = process.argv[2] || 'walk-out'
const WHICH = process.argv[3] || 'both'
mkdirSync(OUT, { recursive: true })
const BASE = `http://localhost:${process.env.WALK_PORT || 4183}/`
const log = []
let pass = 0, fail = 0
const say = (...a) => { const s = a.join(' '); log.push(s); console.log(s) }
const check = (what, ok, detail = '') => { if (ok) pass++; else fail++; say(`${ok ? 'PASS' : 'FAIL'} ${what}${detail ? ' — ' + detail : ''}`) }

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
async function month(page, m, cell) {
  await page.locator(`[data-testid="month-${m}"]`).click()
  await page.waitForSelector(`[data-testid="${cell}"]`, { timeout: 8000 })
  await page.locator(`[data-testid="${cell}"]`).scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
}
const cellText = (page, pid, d) => page.locator(`[data-testid="cell-${pid}-${d}"]`).innerText().catch(() => '(none)')
const txt = async (page, tid) => (await page.locator(`[data-testid="${tid}"]`).count()) ? (await page.locator(`[data-testid="${tid}"]`).first().innerText()).trim() : '(absent)'
async function closeSheets(page) {
  for (let i = 0; i < 3; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(120) }
}

async function run(kind) {
  const b = await chromium.launch()
  const ctx = kind === 'phone' ? await b.newContext({ ...devices['iPhone 13'] }) : await b.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push('pageerror: ' + e.message))
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()) })
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`) })
  const shot = async name => { await page.screenshot({ path: `${OUT}/${kind}-${name}.png` }); say(`  picture: ${kind}-${name}.png`) }
  const today = await page.evaluate(() => { const d = new Date(); const p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}` }).catch(() => null)

  say(`\n=== ${kind} ===`)
  await signIn(page, 'ad', 'a')
  await toWar(page)

  /* W1 — the seed's hand awards are drawn on the grid (D402), a refused bid behind the one on 19 Jan */
  await month(page, 'JAN', 'cell-slipway-2026-01-03')
  const seen = {}
  for (const [pid, d] of [['slipway', '2026-01-03'], ['prowler', '2026-01-01'], ['prowler', '2026-01-04'], ['divot', '2026-01-03'], ['pike', '2026-01-10'], ['dj', '2026-01-19']]) seen[`${pid} ${d}`] = (await cellText(page, pid, d)).replace(/\s+/g, ' ')
  say('  grid:', JSON.stringify(seen))
  check('W1 the seed awards draw FO / HO on their days', seen['slipway 2026-01-03'].includes('FO') && seen['divot 2026-01-03'].includes('HO') && seen['prowler 2026-01-04'].includes('FO') && seen['pike 2026-01-10'].includes('FO'))
  check('W1 a tracker grant from the seed (DJ 19 Jan) draws FO with the refused bid behind a +1', seen['dj 2026-01-19'].includes('FO') && seen['dj 2026-01-19'].includes('+1'))
  await shot('w1-jan-grid')

  /* W2 — one tap on an award: the bid sheet's read-back and the +OIL button (reason, given by, entered by, days) */
  await page.locator('[data-testid="cell-slipway-2026-01-03"]').click()
  await page.waitForTimeout(300)
  const w2 = { oil: await txt(page, 'bid-oil'), why: await txt(page, 'oil-detail-why'), given: await txt(page, 'oil-detail-given'), entered: await txt(page, 'oil-detail-entered'), days: await txt(page, 'oil-detail-days') }
  say('  sheet:', JSON.stringify(w2))
  check('W2 the +OIL button names the award by its worth', w2.oil.startsWith('FO') && w2.oil.includes('a day'))
  check('W2 the read-back: reason, given by (none typed), entered by, days', w2.why === 'Weekend recovery' && w2.given === 'Not given' && w2.entered === 'SQNCDR' && w2.days === 'a day')
  await shot('w2-sheet')
  await closeSheets(page)

  /* W3 — a credit from the OIL tracker is on the grid at once (D402) */
  await page.locator('[data-testid="oil-tracker"]').click()
  await page.waitForSelector('[data-testid="oil-sheet"]')
  await page.locator('[data-testid="oil-name-pike"]').scrollIntoViewIfNeeded()
  await page.locator('[data-testid="oil-name-pike"]').click()
  await page.locator('[data-testid="oil-amt"]').fill('1')
  await page.locator('[data-testid="oil-reason"]').fill('Walk credit')
  await page.locator('[data-testid="oil-given"]').fill('OC Ops')
  await shot('w3-tracker-credit-bar')
  await page.locator('[data-testid="oil-credit-save"]').click()
  await page.waitForTimeout(300)
  await page.locator('[data-testid="oil-close"]').click()
  const mon = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][+today.slice(5, 7) - 1]
  await month(page, mon, `cell-pike-${today}`)
  const w3 = (await cellText(page, 'pike', today)).replace(/\s+/g, ' ')
  check(`W3 the tracker credit shows on the grid on its date (${today}) at once`, w3.includes('FO'), w3)
  await shot('w3-grid-after-tracker-credit')
  await page.locator(`[data-testid="cell-pike-${today}"]`).click()
  await page.waitForTimeout(300)
  const w3b = { why: await txt(page, 'oil-detail-why'), given: await txt(page, 'oil-detail-given'), entered: await txt(page, 'oil-detail-entered') }
  check('W3 a tap reads it back: reason, given by, who entered it', w3b.why === 'Walk credit' && w3b.given === 'OC Ops' && w3b.entered !== '(absent)', JSON.stringify(w3b))
  await shot('w3-sheet-tracker-award')
  await closeSheets(page)

  /* W4 — the tracker's one editor: the date shown, never changed (D260); the amount changed, the grid follows */
  await page.locator('[data-testid="oil-tracker"]').click()
  await page.waitForSelector('[data-testid="oil-sheet"]')
  const box = page.locator('[data-testid="oil-row-pike"] [data-testid^="oil-entry-ol-"]', { hasText: 'Walk credit' }).first()
  await box.scrollIntoViewIfNeeded()
  await box.click()
  const dateTag = await page.locator('[data-testid="oil-edit-date"]').evaluate(el => el.tagName).catch(() => '(absent)')
  check('W4 the award editor shows its date read only (not a picker button)', dateTag === 'SPAN', dateTag)
  await shot('w4-tracker-editor')
  await page.locator('[data-testid="oil-edit-amt"]').fill('2')
  await page.locator('[data-testid="oil-edit-save"]').click()
  await page.waitForTimeout(300)
  await page.locator('[data-testid="oil-close"]').click()
  await month(page, mon, `cell-pike-${today}`)
  await page.locator(`[data-testid="cell-pike-${today}"]`).click()
  await page.waitForTimeout(300)
  check('W4 the grid reads the new worth', (await txt(page, 'oil-detail-days')) === '2 days', await txt(page, 'oil-detail-days'))
  await closeSheets(page)

  /* W5 — a second award on the same day: the cell marks +1, a tap opens the day's list with each award */
  await page.locator('[data-testid="oil-tracker"]').click()
  await page.locator('[data-testid="oil-name-pike"]').click()
  await page.locator('[data-testid="oil-amt"]').fill('0.5')
  await page.locator('[data-testid="oil-reason"]').fill('Second walk credit')
  await page.locator('[data-testid="oil-credit-save"]').click()
  await page.waitForTimeout(300)
  await page.locator('[data-testid="oil-close"]').click()
  await month(page, mon, `cell-pike-${today}`)
  const w5 = (await cellText(page, 'pike', today)).replace(/\s+/g, ' ')
  check('W5 two awards on one day: the box and a +1', w5.includes('+1'), w5)
  await page.locator(`[data-testid="cell-pike-${today}"]`).click()
  await page.waitForTimeout(300)
  const edits = await page.locator('[data-testid^="dl-oil-edit-"]').count()
  const dels = await page.locator('[data-testid^="dl-clear-"]').count()
  check('W5 the day’s list: each award its own Edit… and Delete', edits === 2 && dels === 2, `edit ${edits}, delete ${dels}`)
  await shot('w5-daylist-two-awards')

  /* W6 — Delete one award from the day's list; Undo brings it back */
  const firstDel = page.locator('[data-testid^="dl-clear-"]').first()
  await firstDel.click(); await page.waitForTimeout(200)
  if (await page.locator('[data-testid^="dl-clear-"]').count() === 2) { await page.locator('[data-testid^="dl-clear-"]').first().click(); await page.waitForTimeout(200) }
  await closeSheets(page)
  const w6a = (await cellText(page, 'pike', today)).replace(/\s+/g, ' ')
  check('W6 one award deleted: the +1 goes, one award stays', !w6a.includes('+1') && /FO|HO/.test(w6a), w6a)
  await page.locator('#undoBtn').click(); await page.waitForTimeout(500)
  const w6b = (await cellText(page, 'pike', today)).replace(/\s+/g, ' ')
  check('W6 Undo brings it back', w6b.includes('+1'), w6b)
  await shot('w6-after-undo')

  /* W7 — the OIL breakdown: earned, awarded, corrections (D400) — SLASH has an award and a correction */
  await page.locator('[data-testid="counter-pick"]').click()
  await page.locator('[data-testid="counter-oil"]').click()
  await page.waitForTimeout(200)
  await page.locator('[data-testid="bal-slash"]').scrollIntoViewIfNeeded()
  await page.locator('[data-testid="bal-slash"]').click()
  await page.waitForSelector('[data-testid="figure-breakdown"]')
  const rows = await page.locator('[data-testid="figure-breakdown"] .crow-top').allInnerTexts()
  say('  breakdown:', JSON.stringify(rows.map(r => r.replace(/\s+/g, ' '))))
  const labels = rows.map(r => r.replace(/[-−\d.\s]+$/g, '').trim())
  check('W7 OIL reads opening · earned · awarded · corrections · taken · Total', JSON.stringify(labels.slice(0, 4)) === JSON.stringify(['opening figure', 'earned by weekend/PH work', 'awarded', 'corrections']), JSON.stringify(labels))
  await shot('w7-breakdown-slash')
  await closeSheets(page)

  /* W8 — give RANGER an award (the member 'us'), then sign in as him: his own opens read only; another man's does not */
  await page.locator('[data-testid="oil-tracker"]').click()
  const rangerName = page.locator('[data-testid="oil-name-bane"]')
  const hasRanger = await rangerName.count()
  if (hasRanger) {
    await rangerName.scrollIntoViewIfNeeded(); await rangerName.click()
    await page.locator('[data-testid="oil-amt"]').fill('1')
    await page.locator('[data-testid="oil-reason"]').fill('Member walk')
    await page.locator('[data-testid="oil-credit-save"]').click(); await page.waitForTimeout(300)
  }
  await page.locator('[data-testid="oil-close"]').click()
  check('W8 Ranger is on the tracker to credit', hasRanger > 0)
  const p2 = await ctx.newPage()
  p2.on('pageerror', e => errors.push('pageerror(member): ' + e.message))
  await signIn(p2, 'us', 'us')
  await toWar(p2)
  await month(p2, mon, `cell-bane-${today}`)
  const own = (await cellText(p2, 'bane', today)).replace(/\s+/g, ' ')
  check('W8 the member sees his own award on the grid', /FO|HO/.test(own), own)
  const other = (await cellText(p2, 'pike', today)).replace(/\s+/g, ' ')
  check('W8 the member sees another man’s award on the grid (every row — D402)', /FO|HO/.test(other), other)
  await p2.locator(`[data-testid="cell-bane-${today}"]`).click(); await p2.waitForTimeout(400)
  const ownOpen = { award: await p2.locator('[data-testid="award-sheet"]').count(), bid: await p2.locator('[data-testid="bid-picker"]').count(), why: await txt(p2, 'oil-detail-why') }
  check('W8 his own award opens, read back (D261)', (ownOpen.award + ownOpen.bid) > 0 && ownOpen.why === 'Member walk', JSON.stringify(ownOpen))
  await p2.screenshot({ path: `${OUT}/${kind}-w8-member-own-award.png` }); say(`  picture: ${kind}-w8-member-own-award.png`)
  for (let i = 0; i < 3; i++) { await p2.keyboard.press('Escape'); await p2.waitForTimeout(120) }
  /* another man's day holding ONE award (Drifter's seeded 3 Jan) opens nothing (D261: "another man's award stays as
     today"); a day of his holding SEVERAL records wears a +n and opens its list for anyone, as every +n day always has —
     the same facts the OIL tracker shows every member (D261: "nothing new is shown"; [LEDGER-READ-ASK]) */
  await p2.locator('[data-testid="month-JAN"]').click()
  await p2.waitForSelector('[data-testid="cell-slipway-2026-01-03"]'); await p2.locator('[data-testid="cell-slipway-2026-01-03"]').scrollIntoViewIfNeeded()
  await p2.locator('[data-testid="cell-slipway-2026-01-03"]').click(); await p2.waitForTimeout(400)
  const otherOpen = await p2.locator('[data-testid="award-sheet"], [data-testid="bid-picker"], [data-testid="daylist"]').count()
  check('W8 another man’s single award opens nothing for a member', otherOpen === 0, String(otherOpen))
  await p2.screenshot({ path: `${OUT}/${kind}-w8-member-other.png` })

  check(`${kind}: no console errors, page errors or 4xx`, errors.length === 0, errors.slice(0, 5).join(' | '))
  await b.close()
}

for (const k of WHICH === 'both' ? ['desktop', 'phone'] : [WHICH]) {
  try { await run(k) } catch (e) { fail++; say(`FAIL ${k}: the walk stopped — ${e.message.split('\n')[0]}`) }
}
say(`\n${pass} passed, ${fail} failed`)
writeFileSync(`${OUT}/walk.log`, log.join('\n'))
