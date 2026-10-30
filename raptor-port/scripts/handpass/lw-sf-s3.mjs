// The small fixes of 30 Oct 26 — fix 3, [LW-M1-READ-LEFTOVERS] (2), built on main 23 Oct 26: "This replaces … bid on the Leave
// War" is said only once a filing lands. Scenarios S3-1, S3-3, S3-5, S3-7 of the scenario list, through the Inputs page's own
// input window, the top bar's Undo / Redo and the war's bid window. Every passing note the page says is recorded (the lib's
// __said). Desktop (his PC); SIZE=phone for WebKit.
process.env.LW_OUT ||= '2026-10-30-lw-small-fixes/s3'
process.env.LW_TOASTS ||= '1'
const L = await import('./lw-sf-lib.mjs')
const { T } = L
const SIZE = process.env.SIZE || 'desk'
console.log('[lw-sf-s3 v1]', SIZE)
L.clearOut()
const w = await L.newCtx(SIZE === 'phone' ? 'phone' : 'desk'); const P = w.page
await L.signIn(w, 'admin')
const R = 'bane'
const said = () => P.evaluate(() => window.__said.slice())
const clearSaid = () => P.evaluate(() => { window.__said.length = 0 })
const replaceNotes = async () => (await said()).filter(t => /This replaces/.test(t))
const reqOn = async (who, iso) => ((await L.cellInfo(P, who, iso))?.boxes ?? []).map(b => `${b.text}:${(b.cls.match(/s-\w/) || [])[0]}:${(b.cls.match(/\b(top|bot|whole)\b/) || [])[0]}`)
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
/* the Inputs page: a day of its calendar, "+ Input", the input's own window filled, Save (and "No document" when asked) */
async function fileInput(day, { person, type, start = null, end = null, title = null, span = null }) {
  await P.evaluate(() => window.go('inputs')); await P.waitForTimeout(500)
  if (await P.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await L.press(w, '#inCalBtn')
  await P.waitForSelector('#inpCal')
  for (let i = 0; i < 36 && !(await P.locator(`[data-icday="${day}"]`).count()); i++) {
    const [m, y] = (await P.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const at = +y * 12 + MONTHS.findIndex(x => x.startsWith(m)), want = +day.slice(0, 4) * 12 + (+day.slice(5, 7) - 1)
    await L.press(w, at < want ? '#icNext' : '#icPrev')
  }
  await L.press(w, `#inpCal [data-icday="${day}"]`); await P.waitForTimeout(400)
  await P.locator('button:has-text("+ Input"):visible').first().click(); await P.waitForTimeout(400)
  const win = '[data-testid="win-inputedit"]'
  await P.waitForSelector(`${win} #inpEditType`)
  if (person && await P.locator(`${win} #inpEditPerson`).count()) await P.selectOption(`${win} #inpEditPerson`, person).catch(() => {})
  await P.selectOption(`${win} #inpEditType`, type)
  if (title && await P.locator(`${win} #inpEditOwnTitle`).count()) await P.fill(`${win} #inpEditOwnTitle`, title)
  /* a kind with halves takes the Duration row (All day · AM · PM · Custom); a time box only under Custom */
  if (span && await P.locator(`${win} #inpEditSpan`).count()) { await L.press(w, `${win} #inpEditSpan [data-span="${span}"]`); await P.waitForTimeout(150) }
  const allday = P.locator(`${win} #inpEditAllday`)
  if (start) {
    if (await allday.count() && await allday.isChecked()) await allday.click()
    await P.fill(`${win} #inpEditStart`, start); await P.fill(`${win} #inpEditEnd`, end)
  }
  await clearSaid()
  await L.press(w, '#inpEditSave'); await P.waitForTimeout(500)
  for (const id of ['docconf-nodoc']) if (await L.vis(P, T(id))) { await L.press(w, T(id)); await P.waitForTimeout(500) }
  if (await L.vis(P, T('oilconf'))) { await L.press(w, T('oil-no')); await P.waitForTimeout(150); await L.press(w, T('oilconf-save')); await P.waitForTimeout(500) }
  const stillOpen = await L.vis(P, win)
  const err = stillOpen ? ((await L.txt(P, win)) || '').match(/[^.]*(can.t|refus|not saved)[^.]*\./i)?.[0] || '' : ''
  return { stillOpen, err }
}
async function closeInputWin() { for (const id of ['#inpEditCancel', '#inpEditClose']) if (await L.vis(P, id)) { await L.press(w, id); await P.waitForTimeout(300); break } }
async function pendingBid(who, day, type, half = null) {
  await L.openWar(w); await L.openGrid(w)
  await L.openCell(w, who, day)
  await L.autoApprove(w, false)
  if (half) { await L.press(w, T(`portion-${half}`)); await P.waitForTimeout(150) }
  return L.placeLeave(w, type)
}

/* ---- S3-3 (a): the admin files an LL on the Inputs page over Ranger's pending OL — said once; S3-5 Undo / Redo ---- */
const D1 = '2026-11-17'
await pendingBid(R, D1, 'OL')
const b0 = await reqOn(R, D1)
const f1 = await fileInput(D1, { person: R, type: 'LL' })
const n1 = await replaceNotes(), all1 = await said()
await L.shot(w, 's3-3-a-filed')
await L.openWar(w); await L.reachCell(w, R, D1)
const b1 = await reqOn(R, D1)
await L.rowShot(w, R, '2026-11-16', '2026-11-18', 's3-3-b-grid')
L.rec('S3-3 (a) a filing that lands over another man’s bid says it once', SIZE, !f1.stillOpen && n1.length === 1 && /Ranger.s OL bid/.test(n1[0]) ? 'PASS' : 'FAIL',
  `bid ${b0.join(',')} → after ${b1.join(',')}; notes said: ${JSON.stringify(all1)}`, ['s3-3-a-filed', 's3-3-b-grid'])
await clearSaid()
await L.undo(w)
const nu = await said(), bu = await reqOn(R, D1)
await L.rowShot(w, R, '2026-11-16', '2026-11-18', 's3-5-a-undo')
L.rec('S3-5 Undo of that filing: the bid back, the note not said again', SIZE, bu.some(b => /OL:s-w/.test(b)) && !nu.some(t => /This replaces/.test(t)) ? 'PASS' : 'FAIL',
  `after Undo ${bu.join(',')}; notes said: ${JSON.stringify(nu)}`, ['s3-5-a-undo'])
await clearSaid()
await L.redo(w)
const nr = await said(), br = await reqOn(R, D1)
L.rec('S3-5 Redo', SIZE, nr.filter(t => /This replaces/.test(t)).length <= 1 ? 'RECORDED' : 'FAIL', `after Redo ${br.join(',')}; notes said: ${JSON.stringify(nr)}`, [])

/* ---- S3-1: a filing the gate refuses says nothing of the bid it would have replaced (an admin's; the member's is the unit
   test's — memberclash.test.ts) ---- */
const D2 = '2026-11-18'
const med = await fileInput(D2, { person: R, type: 'ATT C', span: 'am' })
await closeInputWin()
await pendingBid(R, D2, 'OL', 'pm')
const b2 = await reqOn(R, D2)
const f2 = await fileInput(D2, { person: R, type: 'LL' })
const n2 = await said()
await L.shot(w, 's3-1-a-refused')
await closeInputWin()
await L.openWar(w); await L.reachCell(w, R, D2)
const b2b = await reqOn(R, D2)
await L.rowShot(w, R, '2026-11-17', '2026-11-19', 's3-1-b-grid')
L.rec('S3-1 a refused filing: refused, nothing said of the bid, the bid stays', SIZE,
  b2.some(b => /OL:s-w/.test(b)) && (f2.stillOpen || f2.err) && !n2.some(t => /This replaces/.test(t)) && b2b.some(b => /OL:s-w/.test(b)) ? 'PASS' : 'FAIL',
  `medical ${JSON.stringify(med)}; day before ${b2.join(',')}; the LL: ${JSON.stringify(f2)}; notes said: ${JSON.stringify(n2)}; day after ${b2b.join(',')}`, ['s3-1-a-refused', 's3-1-b-grid'])
/* lesson 16: the same leave filed again — still refused, still nothing said */
const f2b = await fileInput(D2, { person: R, type: 'LL' })
const n2b = await said()
await closeInputWin()
L.rec('S3-1 the same filing again (lesson 16)', SIZE, (f2b.stillOpen || f2b.err) && !n2b.some(t => /This replaces/.test(t)) ? 'PASS' : 'FAIL', `${JSON.stringify(f2b)}; said ${JSON.stringify(n2b)}`, [])

/* ---- S3-7: the war's own filings never say it — a course from the bid window over Ranger's pending LL day ---- */
const D3 = '2026-11-24'
await pendingBid(R, D3, 'LL')
await L.openCell(w, R, D3)
await clearSaid()
const cse = await L.vis(P, T('bid-file-CSE'))
if (cse) { await L.press(w, T('bid-file-CSE')); await P.waitForTimeout(600) }
const n3 = await said()
await L.closeWin(w)
const b3 = await reqOn(R, D3)
await L.rowShot(w, R, '2026-11-23', '2026-11-25', 's3-7-a-course')
L.rec('S3-7 the war’s own filing says nothing of the bid', SIZE, cse && !n3.some(t => /This replaces/.test(t)) ? 'PASS' : 'FAIL', `CSE offered ${cse}; day now ${b3.join(',')}; notes said: ${JSON.stringify(n3)}`, ['s3-7-a-course'])

console.log('errors:', w.errs.length ? w.errs : 'none')
L.writeResults('s3-' + SIZE)
await L.closeBrowser()
