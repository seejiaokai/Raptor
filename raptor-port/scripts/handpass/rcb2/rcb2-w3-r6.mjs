/* rcb2-w3 R6 v1 — Astra's scenario 4, ONLY its published Edit Schedule versus View-only part. Sunday 2 Aug (week 27/07, idx 6) 12:00 blank, Monday 3 Aug (week 03/08, idx 0) 04:00-05:00, Ranger.
   usage: [PHONE=1] node rcb2-w3-r6.mjs */
process.env.RCB2_DIST = 'C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/6e376de7-ce28-4b0e-ad14-7848f71c5f9a/scratchpad/frozen-f01e1e416'
process.env.RCB2_BUNDLE = 'index-DDDelbBP.js'
const PHONE = process.env.PHONE === '1'
process.env.RCB2_RUN ||= 'r6-' + (PHONE ? 'p' : 'd') + (process.env.TAG || '1')
const X = await import('./rcb2-w3-lib.mjs')
const { L, say, sleep, SUN } = X
say('rcb2-w3-r6 v1')
const w = await X.open({ phone: PHONE }); const { page, P } = w
const size = PHONE ? '402' : '1536'
const W1 = { v: '27/07/2026', iso: '2026-07-27' }, W2 = { v: '03/08/2026', iso: '2026-08-03' }
const MON = 0
/* the phone's "Jump to a date" calendar opens on July: turn to August first when the week starts in August */
async function pickCal(iso) {
  await X.press(w, '.filt-cal'); await page.waitForSelector('#weekCal:not([hidden]) .airpop-box', { timeout: 5000 })
  for (let i = 0; i < 3 && !(await page.locator(`#weekCal [data-iso="${iso}"]:visible`).count()); i++) {
    const title = await page.locator('#weekCal .dcal-title').first().innerText()
    const next = (iso.startsWith('2026-08') && /July/.test(title)) || (iso.startsWith('2026-07') && /Aug/.test(title) === false && false)
    await X.press(w, `#weekCal button[aria-label="${next ? 'Next month' : 'Previous month'}"]`); await sleep(500)
  }
  await X.press(w, `#weekCal [data-iso="${iso}"]`)
}
async function gw(W) {
  if (await page.evaluate(() => !!document.querySelector('#schedBoard'))) await X.closeBoard(w)
  await L.go(page, 'editsched'); await sleep(300)
  if (!PHONE) await X.press(w, `[data-wk="${W.v}"]`); else await pickCal(W.iso)
  await page.waitForFunction(x => window.CURWEEK === x, W.v, { timeout: 5000 }); await sleep(500)
}
const rest = /crew rest|tight turn|Breaks/i
await gw(W1)
await X.board(w, SUN); const ws = await X.flight(w, SUN, '12:00', '')
const rs = await L.publish(page, SUN); say('publish Sun', JSON.stringify(rs)); await X.pic(w, `r6-0-sun-published-${P}`); await X.closeBoard(w)
await gw(W2)
await X.board(w, MON); const wm = await X.flight(w, MON, '04:00', '05:00')
say('Mon board warn', JSON.stringify(await X.boardWarn(w)))
const rm = await L.publish(page, MON); say('publish Mon', JSON.stringify(rm)); await X.pic(w, `r6-0-mon-published-${P}`); await X.closeBoard(w)
X.row('R6 setup', size, 'Sun 2 Aug 12:00 (landing blank) published; Mon 3 Aug 04:00-05:00 published; Ranger both', 'both published', JSON.stringify({ rs, rm }), rs.published && rm.published ? 'PASS' : 'NOT WALKED', `r6-0-mon-published-${P}.png`)

async function goView(W) {
  await L.go(page, 'viewsched'); await sleep(500)
  if (!PHONE) await page.locator(`[data-wk="${W.v}"]:visible`).first().click().catch(() => {})
  else await pickCal(W.iso)
  await sleep(600)
  return page.evaluate(() => window.CURWEEK)
}
const pendOf = (root, d) => page.evaluate(([r, i]) => [...document.querySelectorAll(`${r} .day[data-day="${i}"] .dpend, ${r} .day[data-day="${i}"] .dpendbtn`)].filter(e => e.offsetWidth).map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(t => /pending/i.test(t)), [root, d])
async function readSet(tag) {
  const o = {}
  // Edit: Monday's own warning, pending; Sunday's forward trace
  await gw(W2)
  const em = await X.weekWarn(w, '#eWeek', MON); o.editMon = em.items.filter(l => rest.test(l)); o.editMonPend = await pendOf('#eWeek', MON)
  const edd = await X.dayDetails(w, '#eWeek', MON); o.editMonDD = (edd.items || []).filter(l => rest.test(l)); await X.pic(w, `r6-${tag}-edit-mon-daydet-${P}`); await X.closeDayPop(w, 'done')
  await X.pic(w, `r6-${tag}-edit-mon-${P}`)
  await gw(W1)
  const tr = await X.trace(w, '#eWeek', SUN); o.editSunTrace = tr.items
  const esp = await pendOf('#eWeek', SUN); o.editSunPend = esp
  await X.pic(w, `r6-${tag}-edit-sun-${P}`)
  // View-only
  const cur2 = await goView(W2)
  const vm = await X.weekWarn(w, '#vWeek', MON); o.viewMon = vm.items.filter(l => rest.test(l)); o.viewMonHead = vm.head; o.viewCur2 = cur2
  const vdd = await X.dayDetails(w, '#vWeek', MON); o.viewMonDD = (vdd.items || []).filter(l => rest.test(l)); await X.pic(w, `r6-${tag}-view-mon-daydet-${P}`); await X.closeDayPop(w, 'done')
  await X.pic(w, `r6-${tag}-view-mon-${P}`)
  const cur1 = await goView(W1)
  const vtr = await X.trace(w, '#vWeek', SUN); o.viewSunTrace = vtr.items; o.viewCur1 = cur1
  await X.pic(w, `r6-${tag}-view-sun-${P}`)
  say('READ', tag, JSON.stringify(o)); return o
}
const BL = /took off 12:00 with no landing typed.*ended 14:00.*clear at 02:00/
const a = await readSet('1-published')
X.row('R6 1 both published, nothing pending', size, "Monday's crew rest line in Edit and View-only; Sunday's forward trace", 'both read take-off 12:00, no landing typed, ended 14:00, clear 02:00; Monday not pending', JSON.stringify(a), a.editMon.some(l => BL.test(l)) && a.viewMon.some(l => BL.test(l)) && !a.editMonPend.length ? 'PASS' : 'FAIL', `r6-1-edit-mon-${P}.png`)
X.row('R6 1b Sunday trace', size, 'Edit and View-only Sunday forward trace (puck tapped)', 'RECORD', JSON.stringify({ edit: a.editSunTrace, view: a.viewSunTrace }), 'RECORDED', `r6-1-view-sun-${P}.png`)
// unissued Sunday change: landing 12:30 in the working copy
await gw(W1)
await X.board(w, SUN); await X.typeIn(w, `[data-bfld="ff:${SUN}.${ws}.0.ld"]`, '12:30'); await X.pic(w, `r6-2-sun-edited-board-${P}`); await X.closeBoard(w)
const b = await readSet('2-sun-unissued')
const WORK = /landed 12:30.*ended 14:30.*clear at 02:30/
X.row('R6 2 Edit uses the working Sunday', size, "Monday (Edit) after an unissued Sunday landing 12:30", 'Edit reads the working neighbour: landed 12:30, ended 14:30, clear 02:30; Monday itself not pending', JSON.stringify({ editMon: b.editMon, editMonDD: b.editMonDD, pend: b.editMonPend, sunPend: b.editSunPend, trace: b.editSunTrace }), b.editMon.some(l => WORK.test(l)) && !b.editMonPend.length ? 'PASS' : 'FAIL', `r6-2-edit-mon-${P}.png`)
X.row('R6 2 View-only uses the issued Sunday', size, "Monday (View-only) while Sunday's change is unissued", 'View-only reads the ISSUED neighbour: no landing typed, ended 14:00, clear 02:00 (never the unissued 12:30)', JSON.stringify({ viewMon: b.viewMon, viewMonDD: b.viewMonDD, viewSunTrace: b.viewSunTrace }), b.viewMon.some(l => BL.test(l)) && !b.viewMon.some(l => /12:30/.test(l)) ? 'PASS' : 'FAIL', `r6-2-view-mon-${P}.png`)
await X.fin(w)
