/* w2-01b — CLOSE-UPS of a pending mark on a published day, the same cells on the edit week and on the
   view page's "Working draft — not issued" peek, at 3× so a 1px outline is legible.
   Rule: ui-contracts §Amendment marks — on the edit surfaces a pending edit is DOTTED in the colour of
   the AL it goes out as (AM19); the view page keeps a NEUTRAL hint (no AL colour, no text-level mark). */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w2'
const L = await import('./w2-lib.mjs')
const { openHi, editWeek, go, put, check, note, summary, viewPick, h, STATE } = L
const { browser, page, errors } = await openHi({ width: 1440, height: 900, state: STATE, dpr: 3 })
await editWeek(page)
/* Tue (Original, nothing pending): an AREA edit (a cell kind) and a PUCK swap (a seat) */
const area = page.locator('#eWeek .day[data-day="1"] .areacell[data-area="1.0.0"]').first()
await area.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
await area.click(); await page.keyboard.press('Control+A'); await page.keyboard.type('EAST', { delay: 15 })
await area.evaluate(e => e.blur()); await page.waitForTimeout(600)
const who0 = await page.evaluate(() => { const s = document.querySelector('#eWeek [data-slot="1.0.0.0.w"] [data-person]'); return s ? s.dataset.person : '' })
/* the shared put() aims at the board whenever the board element exists, so the swap is made there */
await L.board(page, 1)
/* a tap on a FILLED seat selects its man; the scheduler's way to swap is clear (right-click) then fill */
const seat = page.locator('#schedBoard [data-slot="1.0.0.0.w"]:visible').first()
/* try candidates until the new man wears NO warning ring (so the pending hint is not painted over);
   the flagged first attempt is kept as its own picture below */
let got = '', flagged = []
for (const cand of ['freak', 'sufa', 'drill', 'nasty', 'pain', 'quill', 'ledger', 'hex', 'cutter', 'static', 'relay', 'tally', 'wisp', 'echo', 'grit'].filter(x => x !== who0)) {
  await seat.evaluate(e => e.scrollIntoView({ block: 'center' })); await seat.click({ button: 'right' }); await page.waitForTimeout(450)
  got = await put(page, '[data-slot="1.0.0.0.w"]', [cand])
  if (/FAILED/.test(got)) continue
  const ring = await page.evaluate(() => { const p = document.querySelector('#eWeek [data-slot="1.0.0.0.w"] .puck'); return p ? /box(red|dash|dot)/.test(p.className) : null })
  if (!ring) break
  flagged.push(cand)
}
note('setup puck swap on Tue 1.0.0.0.w (board)', `${who0} → ${got} (tried with a warning ring first: ${flagged.join(', ') || 'none'})`)
await L.closeBoard(page); await editWeek(page)
const th = await h(page, 1)
check('setup Tue reads 2 pending', /2\s*pending/.test(th.pending), th.pending)

const styleOf = (root) => page.evaluate(root => {
  const out = {}
  const a = document.querySelector(`${root} .day[data-day="1"] .areacell[data-alp]`)
  if (a) { const s = getComputedStyle(a); out.area = { style: s.outlineStyle, color: s.outlineColor } }
  const seat = document.querySelector(`${root} .day[data-day="1"] .seat[data-alp] .puck`)
  if (seat) { const s = getComputedStyle(seat); out.puck = { outline: s.outlineStyle + ' ' + s.outlineColor, shadow: s.boxShadow } }
  return out
}, root)

/* the edit week: dotted, AL1 cyan */
const ed = await styleOf('#eWeek')
note('edit week marks', JSON.stringify(ed))
check('edit week: pending area cell dotted AL1 cyan (AM19)', ed.area && ed.area.style === 'dotted' && /59, 198, 232/.test(ed.area.color), JSON.stringify(ed.area))
check('edit week: pending puck dotted AL1 cyan (AM19)', ed.puck && /dotted/.test(ed.puck.outline) && /59, 198, 232/.test(ed.puck.outline), JSON.stringify(ed.puck))
const row = '#eWeek .day[data-day="1"] .go .form'
const r1 = page.locator(row).first(); await r1.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(200)
await r1.screenshot({ path: `${process.env.HP_SHOTS}/d-09-closeup-editweek-tue-pending-3x.png` })

/* the view page: working-draft peek */
await go(page, 'viewsched')
await viewPick(page, 1, 'working')
const vw = await styleOf('#vWeek')
note('view working marks', JSON.stringify(vw))
check('view working peek: pending area cell = neutral DASHED beige, no AL colour', vw.area && vw.area.style === 'dashed' && /242, 214, 153/.test(vw.area.color), JSON.stringify(vw.area))
check('view working peek: pending puck = neutral beige ring, no AL colour (no dotted cyan outline)', vw.puck && !/dotted/.test(vw.puck.outline) && /242, 214, 153/.test(vw.puck.shadow), JSON.stringify(vw.puck))
const r2 = page.locator('#vWeek .day[data-day="1"] .go .form').first(); await r2.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(200)
await r2.screenshot({ path: `${process.env.HP_SHOTS}/d-10-closeup-view-working-tue-pending-3x.png` })
/* the same peek with a pending puck that ALSO wears a warning ring (the first candidate, if it was flagged) */
if (flagged.length) {
  await go(page, 'editsched'); await L.board(page, 1)
  await seat.evaluate(e => e.scrollIntoView({ block: 'center' })); await seat.click({ button: 'right' }); await page.waitForTimeout(450)
  const g2 = await put(page, '[data-slot="1.0.0.0.w"]', [flagged[0]])
  await L.closeBoard(page); await go(page, 'viewsched'); await viewPick(page, 1, 'working')
  const vf = await styleOf('#vWeek')
  note('view working peek, a FLAGGED pending puck (' + g2 + ')', JSON.stringify(vf.puck))
  check('view working peek: a pending puck that also wears a warning ring still shows the neutral hint (AM19)', vf.puck && /242, 214, 153/.test(vf.puck.shadow + vf.puck.outline), JSON.stringify(vf.puck))
  const r2b = page.locator('#vWeek .day[data-day="1"] .go .form').first(); await r2b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(200)
  await r2b.screenshot({ path: `${process.env.HP_SHOTS}/d-10b-closeup-view-working-tue-flagged-pending-3x.png` })
  await go(page, 'editsched')
  const r1b = page.locator('#eWeek .day[data-day="1"] .go .form').first(); await r1b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(200)
  await r1b.screenshot({ path: `${process.env.HP_SHOTS}/d-09b-closeup-editweek-tue-flagged-pending-3x.png` })
  await go(page, 'viewsched')
}
/* the issued face: nothing */
await viewPick(page, 1, 'issued')
const vi = await styleOf('#vWeek')
check('view issued face: no pending mark at all', !vi.area && !vi.puck, JSON.stringify(vi))
const r3 = page.locator('#vWeek .day[data-day="1"] .go .form').first(); await r3.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(200)
await r3.screenshot({ path: `${process.env.HP_SHOTS}/d-11-closeup-view-issued-tue-3x.png` })
check('no console errors', errors.length === 0, errors.join(' | ').slice(0, 300))
await browser.close()
process.exitCode = summary('w2-01b-closeup') ? 1 : 0
