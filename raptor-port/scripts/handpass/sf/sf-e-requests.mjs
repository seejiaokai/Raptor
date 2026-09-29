/* E — [REQ-ORPHAN-ROW] + [REQ-DOOR-WORDS] 2: one request, one row — across WEEKS. A meeting filed for Sun 19 Jul →
   Mon 20 Jul crosses the week line. Its row lands on Sunday (week of 13 Jul); then on the next week:
   E1 Monday does NOT grow a second row for it, and its accept control says where the row is ("On Sun 19 Jul");
   E2 deleting it from the next week is refused, naming the week to load ("Load the week of Sun 19 Jul to delete this
      accepted input") — the request and its row both stay; E3 deleted from Sunday's own week, its row goes with it —
      nothing left with no request behind it.
   Written as the RIGHT behaviour: on `main` Monday gets a second row (or an Accept that makes one). Usage: node sf-e-requests.mjs [outdir-suffix] */
const OUT = 'e-requests' + (process.argv[2] ? '-' + process.argv[2] : '')
process.env.HP_URL ||= 'http://localhost:4174'
process.env.HP_SHOTS ||= new URL(`../../../docs/img/handpass/2026-09-28-small-fixes/${OUT}`, import.meta.url).pathname.replace(/^\/(\w:)/, '$1')
const L = await import('./sf-lib.mjs')
const W4 = await import('../am/w4-lib.mjs')
const { open, go, editWeek, board, closeBoard, openInputs, screen, check, note, summary, SF_STATE, DESK } = L

const rowsOf = (page, iid) => page.evaluate(iid => (window.DAYS || []).map((d, di) => ({ di, dow: d.dow, n: ((d && d.ground) || []).filter(g => g && String(g.src) === String(iid)).length })).filter(x => x.n), iid)
/* the request's own line on the board's Personal Inputs panel: its accept control, whatever it says */
const accCtl = (page, iid) => page.evaluate(iid => {
  const ed = [...document.querySelectorAll(`#schedBoard [data-inpedit="${iid}"]`)].find(e => e.offsetWidth)
  const row = ed && ed.closest('.sb-arow, .sbi-row, .pl-row')
  if (!row) return []
  return [...row.querySelectorAll('.accs > *')].map(e => ({ text: (e.textContent || '').trim(), btn: e.tagName === 'BUTTON' }))
}, iid)
const week = async (page, key) => {
  const chip = page.locator(`.page.on [data-wk="${key}"]:visible`).first()
  if (await chip.count()) await chip.click(); else await page.evaluate(k => window.loadWeek(k), key)
  await page.waitForTimeout(800)
}

const { browser, page, errors } = await open({ ...DESK, state: SF_STATE })
const filed = await W4.fileInput(page, { person: 'bane', type: 'Meeting', from: '2026-07-19', to: '2026-07-20', span: 'custom', start: '09:00', end: '10:00', remarks: 'SF-E MEETING' })
const iid = await page.evaluate(() => { const r = window.INPUTS.find(x => /SF-E MEETING/.test(x.remarks || '')); return r && r.iid })
note('the request filed', JSON.stringify({ filed: filed && filed.said, iid }))
check('setup: the meeting is filed', !!iid, '')

/* its row on Sunday — landed by itself, or accepted the way a scheduler accepts it */
await editWeek(page)
let sun = await rowsOf(page, iid)
if (!sun.some(r => r.di === 6)) {
  const acc = page.locator(`#eWeek button[data-acc="g"][data-accd="6"][data-acck="${iid}"]:visible`).first()
  if (await acc.count()) { await acc.scrollIntoViewIfNeeded(); await acc.click(); await page.waitForTimeout(700) }
  sun = await rowsOf(page, iid)
}
note('rows after Sunday', JSON.stringify(sun))
check('setup: its row stands on Sunday\'s ground programme', sun.length === 1 && sun[0].di === 6 && sun[0].n === 1, JSON.stringify(sun))

/* E1 — the next week */
await week(page, '20/07/2026')
const mon = await rowsOf(page, iid)
await board(page, 0); await openInputs(page, 0)
const ctl = await accCtl(page, iid)
const line = page.locator(`#schedBoard [data-inpedit="${iid}"]:visible`).first()
if (await line.count()) await line.evaluate(e => e.scrollIntoView({ block: 'center' }))
await screen(page, 'e1-next-week-monday-board')
note('E1 next week: rows and the control', JSON.stringify({ mon, ctl }))
check('E1a Monday has NO second row for it', mon.length === 0, JSON.stringify(mon))
check('E1b its control says where the row is, not "Accept"', ctl.some(c => /^On Sun 19 Jul$/.test(c.text)) && !ctl.some(c => c.btn && /Accept/.test(c.text)), JSON.stringify(ctl))

/* E2 — deleting it from the NEXT week, through its own edit window, is refused and names the week to load */
const delOnce = async () => {
  const l = page.locator(`#schedBoard [data-inpedit="${iid}"]:visible`).first()
  if (await l.count()) { await l.evaluate(e => e.scrollIntoView({ block: 'center' })); await l.click(); await page.waitForTimeout(800) }
  await L.installToasts(page)
  const b = page.locator('#inpEditDel:visible').first()
  for (let i = 0; i < 2 && await b.count(); i++) { await b.click(); await page.waitForTimeout(700) }   // a delete that asks again
  const said = await L.takeToasts(page)
  if (await page.locator('#inpEditCancel:visible').count()) await page.locator('#inpEditCancel:visible').click()
  await page.waitForTimeout(300)
  return said
}
const said2 = await delOnce()
await screen(page, 'e2-next-week-delete-refused')
const still = await page.evaluate(iid => window.INPUTS.some(x => x.iid === iid), iid)
note('E2 what the app said', JSON.stringify(said2))
check('E2 the delete from the other week is refused and names where to go', still && said2.some(t => /Load the week of Sun 19 Jul to delete this accepted input/.test(t)), JSON.stringify({ still, said2 }))
await closeBoard(page)

/* E3 — deleted from Sunday's own week, the row goes with it */
await week(page, '13/07/2026')
await go(page, 'editsched'); await page.waitForTimeout(500)
await board(page, 6); await openInputs(page, 6)
const said3 = await delOnce()
const gone = await page.evaluate(iid => !window.INPUTS.some(x => x.iid === iid), iid)
const after = await rowsOf(page, iid)
await screen(page, 'e3-sunday-after-delete')
note('E3 deleted on its own week', JSON.stringify({ said3, gone, after }))
check('E3 the request is deleted from its own week', gone, JSON.stringify(said3))
check('E3 and Sunday\'s row went with it — nothing left with no request behind it', after.length === 0, JSON.stringify(after))

check('no console errors', errors.length === 0, errors.join(' | ').slice(0, 300))
await browser.close()
process.exitCode = summary('sf-e-requests') ? 1 : 0
