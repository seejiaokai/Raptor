/* A6 — every way out of the OIL mode (Fable S35, Codex 20). */
import { open, board, tap, type, put, shot, publish, go, oilMode } from './lib.mjs'
import { writeFileSync } from 'node:fs'

const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
const { browser, page, errors } = await open({ state: STATE })
const R = {}

const state = () => page.evaluate(() => {
  const root = document.querySelector('#schedBoard')
  if (!root) return { board: 'CLOSED' }
  const vis = e => !!(e && (e.offsetParent || e.getClientRects().length))
  const bar = root.querySelector('.daybar')
  return {
    board: 'OPEN',
    day: ((root.querySelector('.sb-title') || {}).innerText || '').replace(/\n+/g, ' ').trim().slice(0, 40),
    modeChrome: root.querySelectorAll('[data-oilitem], [data-oilp]').length,
    dayBar: bar ? (bar.innerText || '').replace(/\n+/g, ' | ').slice(0, 130) : null,
    dayBarGreen: bar ? bar.className : null,
    oilButtons: [...root.querySelectorAll('[data-oilmode], #sbOil')].filter(vis).map(e => e.innerText.replace(/\n/g, ' ').trim()),
    editableBoxes: [...root.querySelectorAll('input[data-bfld]')].filter(e => !e.disabled).length,
    totalBoxes: root.querySelectorAll('input[data-bfld]').length,
    seatTargets: root.querySelectorAll('[data-slot], [data-fill]').length,
    pending: [...new Set([...root.querySelectorAll('*')].filter(e => !e.children.length && vis(e))
      .map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()).filter(t => t && t.length < 40 && /pending|AL\d|ORIG/.test(t)))],
  }
})
const setEvent = async (date, text) => {
  await go(page, 'leavewar'); await page.waitForTimeout(1200)
  const c = page.locator(`[data-testid="event-0-${date}"]`)
  await c.scrollIntoViewIfNeeded().catch(() => {})
  await c.click(); await page.waitForTimeout(400)
  await page.locator('[data-testid="event-text"]').fill(text)
  await page.locator('[data-testid="event-apply"]').click(); await page.waitForTimeout(700)
  return (await page.locator(`[data-testid="event-0-${date}"]`).innerText()).trim()
}

/* ===== 1. the holiday cleared WHILE the mode is on ===== */
R.ph = await setEvent('2026-07-15', 'PH')
await go(page, 'editsched'); await board(page, 2)
await tap(page, `[data-dradd="2.0"]`)
const ri = await page.evaluate(() => window.DAYS[2].dutywaves[0].rows.length - 1)
await type(page, `[data-bfld="dr:2.0.${ri}.role"]`, 'PH DUTY')
await type(page, `[data-bfld="dr:2.0.${ri}.str"]`, '08:00')
await type(page, `[data-bfld="dr:2.0.${ri}.end"]`, '16:00')
const free = await page.evaluate(() => [...document.querySelectorAll('#sbRoster .rpuck[data-person]')]
  .map(e => e.dataset.person).filter(p => window.PEOPLE[p] && !/^all/i.test(p)).slice(0, 25))
R.wedMan = await put(page, `[data-fill="d:2.0.${ri}.+"]`, free)
await oilMode(page, true)
/* make a decision inside the mode so we can see whether it survives */
const anyPuck = page.locator('#schedBoard [data-oilp]:visible').first()
R.wedDecided = await anyPuck.count() ? await anyPuck.getAttribute('data-oilp') : null
if (R.wedDecided) { await anyPuck.click({ force: true }); await page.waitForTimeout(400) }
R.s1_inMode = await state()
await shot(page, 'G-A6-01-wed-in-mode')
R.phCleared = await setEvent('2026-07-15', '')
R.s1_afterLW = await state()               // board is closed by the page change
await go(page, 'editsched'); await board(page, 2)
R.s1_reopened = await state()
await shot(page, 'G-A6-02-wed-reopened-after-ph-cleared')
/* put the holiday back — do the marks come back with it? */
await setEvent('2026-07-15', 'PH')
await go(page, 'editsched'); await board(page, 2)
R.s1_phBack = await state()
await oilMode(page, true)
R.s1_marksKept = await page.evaluate(w => {
  const e = document.querySelector(`#schedBoard [data-oilp="${w}"]`)
  return e ? { cls: e.className, title: e.getAttribute('title') } : null
}, R.wedDecided)
await shot(page, 'G-A6-03-wed-ph-back-marks')
await oilMode(page, false)
await setEvent('2026-07-15', '')

/* ===== 2. day arrows while in the mode ===== */
await go(page, 'editsched'); await board(page, 5)
await oilMode(page, true)
R.s2_before = await state()
/* the desktop day chips */
const dayChip = (d) => page.locator(`#sbDays [data-sbday="${d}"]:visible, .sb-top [data-sbday="${d}"]:visible, [data-sbday="${d}"]:visible`).last()
await dayChip(6).click({ force: true }).catch(() => {})
await page.waitForTimeout(900)
R.s2_sunday = await state()
await shot(page, 'G-A6-04-stepped-to-sunday-in-mode')
await dayChip(5).click({ force: true }).catch(() => {})
await page.waitForTimeout(900)
R.s2_backToSat = await state()
await shot(page, 'G-A6-05-back-to-saturday')

/* ===== 3. leave the board and come back ===== */
await oilMode(page, true)
R.s3_before = await state()
await go(page, 'viewsched'); await page.waitForTimeout(700)
R.s3_away = await state()
await go(page, 'editsched'); await board(page, 5)
R.s3_back = await state()
await shot(page, 'G-A6-06-board-reopened')
/* and the board's own ✕ Close */
await oilMode(page, true)
const close = page.locator('#schedBoard').getByText(/^✕ Close$|^Close$/).first()
if (await close.count()) { await close.click({ force: true }).catch(() => {}); await page.waitForTimeout(800) }
R.s3_closed = await state()
await board(page, 5)
R.s3_afterClose = await state()
await shot(page, 'G-A6-07-after-close-and-reopen')

/* ===== 4. Undo, past the mode's own gestures ===== */
await oilMode(page, true)
const p1 = page.locator('#schedBoard [data-oilp]:visible').first()
R.s4_who = await p1.getAttribute('data-oilp')
await p1.click({ force: true }); await page.waitForTimeout(400)
R.s4_afterTap = await page.evaluate(w => { const e = document.querySelector(`#schedBoard [data-oilp="${w}"]`); return e && e.className }, R.s4_who)
R.s4_undos = []
for (let i = 0; i < 6; i++) {
  const u = page.locator('#schedBoard button, #sbBoard button').filter({ hasText: /^↶?\s*Undo$/ }).first()
  const btn = await u.count() ? u : page.locator('#sbUndo').first()
  if (!await btn.count()) { R.s4_undos.push('no Undo button'); break }
  if (await btn.isDisabled().catch(() => false)) { R.s4_undos.push('Undo greyed out'); break }
  await btn.click({ force: true }).catch(() => {})
  await page.waitForTimeout(600)
  const s = await state()
  R.s4_undos.push({ step: i + 1, modeChrome: s.modeChrome, oilButtons: s.oilButtons, editable: s.editableBoxes, day: s.day })
}
R.s4_end = await state()
await shot(page, 'G-A6-08-after-six-undos-in-mode')

/* ===== 5. a WEEK step while in the mode (Codex 20) ===== */
await board(page, 5)
await oilMode(page, true)
R.s5_before = await state()
const wk = page.locator('[data-sbweek]:visible')
R.s5_weekBtns = await wk.count()
if (R.s5_weekBtns) { await wk.last().click({ force: true }); await page.waitForTimeout(1400) }
R.s5_nextWeek = await state()
await shot(page, 'G-A6-09-next-week-in-mode')
if (R.s5_weekBtns) { await page.locator('[data-sbweek]:visible').first().click({ force: true }); await page.waitForTimeout(1400) }
R.s5_backWeek = await state()
await shot(page, 'G-A6-10-back-week')

R.errors = errors.slice(0, 12)
writeFileSync('C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/walk-a6.json', JSON.stringify(R, null, 1))
const pr = (n, s) => console.log(`  ${n.padEnd(40)} board=${s.board} day=${(s.day || '').padEnd(22)} modeNodes=${String(s.modeChrome ?? '-').padStart(4)} oilBtn=${JSON.stringify(s.oilButtons || [])} editableBoxes=${s.editableBoxes ?? '-'}/${s.totalBoxes ?? '-'} seats=${s.seatTargets ?? '-'}`)
console.log('PH:', R.ph, '→', R.phCleared, ' man:', R.wedMan)
console.log('=== 1. holiday cleared while in the mode ===')
pr('in the mode on Wednesday', R.s1_inMode); pr('on the Leave War', R.s1_afterLW); pr('board reopened', R.s1_reopened)
pr('holiday put back', R.s1_phBack); console.log('   the decision made in the mode: ' + JSON.stringify(R.s1_marksKept))
console.log('=== 2. day arrows ==='); pr('in the mode on Saturday', R.s2_before); pr('stepped to Sunday', R.s2_sunday); pr('back to Saturday', R.s2_backToSat)
console.log('=== 3. leaving and returning ==='); pr('in the mode', R.s3_before); pr('on View-only', R.s3_away); pr('board reopened', R.s3_back); pr('after ✕ Close', R.s3_closed); pr('reopened again', R.s3_afterClose)
console.log('=== 4. Undo ==='); console.log('   tapped ' + R.s4_who + ' → ' + R.s4_afterTap); R.s4_undos.forEach(u => console.log('   ' + JSON.stringify(u))); pr('after the undos', R.s4_end)
console.log('=== 5. a week step ==='); console.log('   week buttons on the board: ' + R.s5_weekBtns); pr('in the mode', R.s5_before); pr('next week', R.s5_nextWeek); pr('back', R.s5_backWeek)
console.log('errors:', R.errors)
await browser.close()
