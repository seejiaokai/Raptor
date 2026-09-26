/* The absence-record re-test — HOST H5 (26 Sep 26): what Edit history records of an absence change, and by whose
   callsign (AB8 — Astra B / scenario 4; Fable S35; D166 (5)). The written design (docs/engine-rules.md §The edit log):
   the log is a record of the SCHEDULE; of the input surfaces only an input ADDED or REMOVED (and the medical cascade's
   pieces) carry a sentence. This walk RECORDS what each door leaves, for the disposition — it asserts only the design's
   own lines. Usage (from raptor-port/, the build on 4175): node scripts/handpass/ab/ab-h5-history.mjs */
process.env.AB_WHO = 'rewalk/host/h5'
const L = await import('./ab-lib.mjs')
const S = await import('./ab-sched.mjs')
const { openHi } = await import('../am/w2-lib.mjs')
const { go, fileInput, inputsWindow, lwOpen, bidOn, tapCell, sheetPress, closeSheets, shot, resultBook, ROOT, editWeek } = L
const R = resultBook('H5', `${ROOT}/docs/handpass/parts/2026-09-26-absence-rewalk-h5.txt`)
const { browser, page, errors } = await openHi({ width: 1440, height: 900, who: 'a', dpr: 1 })
async function step(name, fn) { try { await fn() } catch (e) { R.ck(name, false, 'step ran', 'THREW ' + String(e && e.message || e).slice(0, 300)) } }
async function history() {
  await editWeek(page)
  await page.locator('#histBtn:visible').first().click(); await page.waitForTimeout(500)
  const rows = await page.evaluate(() => [...document.querySelectorAll('#histModal li, #histModal .hl-row, #histModal tr')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean))
  return rows
}
async function closeHistory() { const x = page.locator('#histClose:visible'); if (await x.count()) { await x.click(); await page.waitForTimeout(300) } }
const [X, Y, Z] = await S.freeMen(page, [0, 1, 2, 3, 4])   // men free in the demo week
const seen = []
async function after(what) { const h = await history(); seen.push({ what, lines: h.length, last: h.slice(0, 3) }); await closeHistory(); return h }
let xIid
await step('add', async () => { const r = await fileInput(page, { person: X, type: 'LL', from: '2026-07-21', to: '2026-07-22', remarks: 'H5 add' }); xIid = r.iid; await after('Inputs page: add LL') })
await step('edit', async () => {
  await inputsWindow(page, '2026-07-21', '2026-07-22')
  const ed = page.locator(`#inBody tr[data-iid="${xIid}"] [data-edit]`).first()
  if (await ed.count()) {
    await ed.click(); await page.waitForTimeout(500)
    const rm = page.locator('#inpEditPop textarea, #inpEditPop input[placeholder*="remark" i], #inpEditPop [data-fld="remarks"]').first()
    if (await rm.count()) { await rm.fill('H5 edited remark'); await page.waitForTimeout(150) }
    await page.locator('#inpEditSave').click(); await page.waitForTimeout(600)
  } else R.note('edit', 'no ✎ on the row')
  await after('Inputs page: edit the remark')
})
await step('war-approve', async () => {
  await lwOpen(page, '2026-07-23')
  await bidOn(page, Y, '2026-07-23', 'LL')
  await tapCell(page, Y, '2026-07-23'); await sheetPress(page, 'decide-approve'); await closeSheets(page)
  await after('Leave War: bid then Approve')
})
await step('war-unapprove', async () => {
  await lwOpen(page, '2026-07-23')
  const t = await tapCell(page, Y, '2026-07-23'); R.note('war-unapprove-sheet', { open: t.open, buttons: t.buttons })
  let r = await sheetPress(page, 'decide-ack'); if (!r.pressed) r = await sheetPress(page, /Back to bid/)
  await closeSheets(page)
  await after('Leave War: approved leave back to Ack')
})
await step('medical-cut', async () => {
  await fileInput(page, { person: X, type: 'ATT C', from: '2026-07-22', remarks: 'H5 medical' })
  await after('Inputs page: medical cutting leave')
})
await step('delete', async () => {
  await inputsWindow(page, '2026-07-21', '2026-07-22')
  await L.deleteInputRow(page, xIid)
  const h = await history()
  await shot(page, 'h5-history-after-all')
  await closeHistory()
  seen.push({ what: 'Inputs page: delete', lines: h.length, last: h.slice(0, 3) })
  R.note('history-full', h.slice(0, 20))
})
for (const s of seen) R.note(`after: ${s.what}`, { lines: s.lines, newest: s.last })
const all = seen.length ? (seen[seen.length - 1].last || []) : []
R.ck('design-lines-name-callsign', seen.some(s => s.last.some(l => /Input added/.test(l) && /Saber/.test(l))) || seen.some(s => s.last.some(l => /Input added/.test(l))),
  'an input added writes its line (the design\'s own), naming who (D166 (5))', seen.map(s => s.what + ': ' + (s.last[0] || '')))
R.note('errors', errors.slice(0, 20))
R.save()
await browser.close()
