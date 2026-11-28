// lwdl-walk-pur.mjs — walks the plain-user round of deciding: open, close, approve, change his mind, Approvals, Approve all, Undo. From the lw-decide-look walk of 28 Nov 26 ([LW-DECIDE-LOOK], his D2881); run from raptor-port/.
// The plain-user round (bug-check order §7.0a): an admin's everyday deciding, start to finish — open a day, every way to
// close it, approve, change his mind, refuse; Approvals through a few lines, a request's dates and the slim bar's ✕ and
// Back, Approve all, Undo — with the grid cell and the Approvals counts looked at after each.
import { run, signIn, press, openCell, isOpen, place, cellState, readDecide, pic, T, sleep, closeBrowsers } from './lwdl-lib.mjs'
const counts = page => page.evaluate(() => ({ tab: document.querySelector('[data-testid="lw-tab-approvals"]')?.innerText.replace(/\s+/g, ' '), sub: document.querySelector('[data-testid="appr-sub"]')?.innerText, all: document.querySelector('[data-testid="appr-approve-all"]')?.innerText.replace(/\s+/g, ' ') }))
await run('PUR', ['p402', 'desk'], async S => {
  const page = S.page
  await signIn(S)
  const P = 'slipway', D = '2026-02-17'
  await place(page, P, [D], 'LL')
  const tab0 = await counts(page); S.note('tab at start ' + JSON.stringify(tab0))
  // every way to close the window
  await openCell(S, P, D); await press(S, T('bid-cancel')); await sleep(page, 500)
  S.check(!(await isOpen(page)), '✕ closes the window', null)
  await openCell(S, P, D); await page.keyboard.press('Escape'); await sleep(page, 500)
  S.check(!(await isOpen(page)), 'Escape closes the window', null)
  await openCell(S, P, D)
  const scrim = await page.evaluate(() => { const s = document.querySelector('.sheetscrim, [data-testid="sheet-scrim"]'); if (!s) return null; const r = s.getBoundingClientRect(); return { x: r.left + 8, y: r.top + 8 } })
  if (scrim) { if (S.touch) await page.touchscreen.tap(scrim.x, scrim.y); else await page.mouse.click(scrim.x, scrim.y); await sleep(page, 500) }
  S.note('a tap outside the window: open=' + await isOpen(page) + ' (scrim ' + JSON.stringify(scrim) + ')')
  await pic(S, '1-after-tap-outside', [], { full: true })
  if (await isOpen(page)) await press(S, T('bid-cancel'))
  // approve, change his mind, refuse
  await openCell(S, P, D); await pic(S, '2-open', [T('bid-picker')])
  await press(S, T('decide-approve')); await sleep(page, 700)
  S.check((await cellState(page, P, D)) === 'LL:a', 'approve: the cell approved', await cellState(page, P, D))
  S.note('tab after approve ' + JSON.stringify(await counts(page)))
  await pic(S, '3-cell-approved', [T(`cell-${P}-${D}`)], { pad: 40 })
  await openCell(S, P, D); await pic(S, '4-reopen-approved', [T('bid-picker')])
  await press(S, T('decide-refuse')); await sleep(page, 700)
  S.check((await cellState(page, P, D)) === 'LL:r', 'changed his mind: the cell refused', await cellState(page, P, D))
  await pic(S, '5-cell-refused', [T(`cell-${P}-${D}`)], { pad: 40 })
  S.note('tab after refuse ' + JSON.stringify(await counts(page)))
  // Approvals through a few lines
  await press(S, T('lw-tab-approvals')); await sleep(page, 900)
  const c0 = await counts(page); S.note('Approvals at open ' + JSON.stringify(c0))
  const line = i => page.locator('[data-testid="approvals-page"] [data-testid^="appr-line-"]').nth(i)
  const tapL = async (i, w) => { const l = line(i).locator(T('appr-' + w)); await l.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(page, 150); if (S.touch) await l.tap(); else await l.click(); await sleep(page, 500) }
  await tapL(0, 'approve'); await tapL(1, 'refuse'); await tapL(2, 'approve'); await tapL(2, 'refuse')
  const c1 = await counts(page); S.note('after approve 1, refuse 2, approve→refuse 3: ' + JSON.stringify(c1))
  await page.evaluate(() => scrollTo(0, 0))
  await pic(S, '6-approvals-three-decided', [], { full: true })
  // a request's dates, the slim bar's Back
  const who = await line(3).getAttribute('data-testid')
  await line(3).locator(T('appr-dates')).evaluate(e => e.scrollIntoView({ block: 'center' }))
  if (S.touch) await line(3).locator(T('appr-dates')).tap(); else await line(3).locator(T('appr-dates')).click()
  await sleep(page, 1200)
  await pic(S, '7-dates-slim-bar', [], { full: true })
  await press(S, `${T('appr-slim')} .appr-back`).catch(() => press(S, T('appr-back'))); await sleep(page, 900)
  const c2 = await counts(page); S.note('Back to Approvals ' + JSON.stringify(c2))
  S.check(c2.sub === c1.sub, 'Back: the same count, decided lines kept', [c1.sub, c2.sub])
  // the slim bar's ✕
  if (S.touch) await line(4).locator(T('appr-dates')).tap(); else await line(4).locator(T('appr-dates')).click()
  await sleep(page, 1100)
  if (await page.locator(T('appr-slim-x')).count()) { await press(S, T('appr-slim-x')); await sleep(page, 800) }
  S.note('after the slim bar ✕: page ' + await page.evaluate(() => document.querySelector('[data-testid="approvals-page"]:not([hidden])') ? 'Approvals' : 'grid'))
  await pic(S, '8-after-slim-x', [], { full: true })
  await press(S, T('lw-tab-approvals')); await sleep(page, 900)
  // Approve all, then Undo
  const c3 = await counts(page); S.note('Approvals again ' + JSON.stringify(c3))
  await press(S, T('appr-approve-all')); await sleep(page, 400); await press(S, T('appr-approve-all')); await sleep(page, 900)
  const c4 = await counts(page); S.note('after Approve all ' + JSON.stringify(c4))
  await page.evaluate(() => scrollTo(0, 0)); await pic(S, '9-approve-all', [], { full: true })
  await page.locator('#undoBtn').click({ timeout: 4000 }).catch(e => S.note('undo: ' + e.message.split('\n')[0])); await sleep(page, 900)
  const c5 = await counts(page); S.note('after Undo ' + JSON.stringify(c5))
  S.check(c5.sub === c3.sub, 'Undo puts the count back', [c3.sub, c5.sub])
  await pic(S, '10-after-undo', [], { full: true })
  await press(S, T('lw-tab-grid')); await sleep(page, 900)
  S.note('grid: ' + [['wolf', '2026-01-08'], ['bruise', '2026-01-23'], ['bane', '2026-01-29'], [P, D]].map(([p, d]) => p + ' ' + d + ' '))
  for (const [p, d] of [['wolf', '2026-01-08'], ['bruise', '2026-01-23'], ['bane', '2026-01-29'], [P, D]]) S.note(`grid cell ${p} ${d}: ${await cellState(page, p, d)}`)
  S.check((await cellState(page, 'wolf', '2026-01-08')) === 'LL:a' && (await cellState(page, 'bruise', '2026-01-23')) === 'LL:r', 'the grid shows the hand decisions after Undo of Approve all', [await cellState(page, 'wolf', '2026-01-08'), await cellState(page, 'bruise', '2026-01-23')])
  await pic(S, '11-grid-at-end', [T('cell-wolf-2026-01-08'), T('cell-bruise-2026-01-23')], { pad: 40 })
})
await closeBrowsers()
