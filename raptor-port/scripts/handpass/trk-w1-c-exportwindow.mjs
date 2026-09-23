/* [HUMAN-RETEST] Tracker — walker w1, walk C: the EXPORT WINDOW itself
   (Fable #5 / R25, Fable #6, R18, R19).

   4. How many charts are ticked when it opens; is there any way to tick all?
   5. Its own refusals — Charts unticked (Students off), and Charts on with every
      chart unticked: is the message readable ON TOP, or behind the window?
      (document.elementFromPoint at the screen centre and on the message's OK.)
   15. Students is unticked every time the window opens, even after it was ticked
      last time; the done message says which kind of file was written; the
      suggested file name says WITH-STUDENTS when it holds people. */
import { open, shot, save, log, dlg, DESK, sleep, menu, dlgUp, dlgText, exportVia } from './trk-w1-lib.mjs'

const L = log()
const { browser, page, errors } = await open({ size: DESK, who: 'a' })

async function openExport() {
  await page.evaluate(() => { window.showSaveFilePicker = undefined })
  await menu(page, 'file', 'exportBtn'); await page.waitForSelector('#copyModal', { state: 'visible' }); await sleep(200)
}
/* what is ON TOP at a point, in words */
const topAt = (x, y) => page.evaluate(({ x, y }) => {
  const el = document.elementFromPoint(x, y); if (!el) return 'nothing'
  const inDlg = !!el.closest('#dlgModal'), inCopy = !!el.closest('#copyModal')
  return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''} — ${inDlg ? 'INSIDE the message box' : inCopy ? 'inside the Export window' : el.id === 'copyOverlay' ? 'the Export window\'s dimmed backdrop' : el.id === 'dlgOverlay' ? 'the message box\'s backdrop' : 'elsewhere'}`
}, { x, y })

/* is the element actually on top at its own centre (not merely rendered)? */
const onTop = sel => page.evaluate(sel => {
  const el = document.querySelector(sel); if (!el) return false
  const r = el.getBoundingClientRect(); if (!r.width) return false
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
  return !!(hit && hit.closest(sel))
}, sel)

/* ---- 4. the window as it opens ---- */
await openExport()
const offers = (await page.locator('#copySylList label').allInnerTexts()).map(s => s.trim())
const ticked = await page.locator('#copySylList input:checked').count()
const countLine = await page.locator('#copyModal .mini', { hasText: 'Syllabi to include' }).innerText()
const controls = await page.evaluate(() => [...document.querySelectorAll('#copyModal button, #copyModal input')].map(e => e.tagName === 'BUTTON' ? 'button "' + e.innerText.trim() + '"' : 'tick-box ' + (e.id || (e.parentElement && e.parentElement.innerText.trim()))))
await shot(page, 'w1-04-export-open')
L.note('4: the Export window offers', `${offers.join(' · ')} — "${countLine}"`)
L.ok('4: every chart is ticked when it opens (a backup made in good faith carries everything)', ticked === offers.length, `${ticked} of ${offers.length} ticked (the chart on screen only)`)
L.ok('4: there is a way to tick every chart at once', controls.some(c => /\ball\b|every|select/i.test(c)), 'controls in the window: ' + controls.join(', '))

/* ---- 5a. refusal: Charts unticked, Students off ---- */
await page.click('#copyCharts'); await sleep(150)
await page.click('#copyOk'); await sleep(500)
const up1 = await dlgUp(page, 1500)
const msg1 = up1 ? await dlgText(page) : '(no message)'
const vw = page.viewportSize()
const centre1 = await topAt(vw.width / 2, vw.height / 2)
const okBox1 = await page.locator('#dlgOk').boundingBox().catch(() => null)
const onOk1 = okBox1 ? await topAt(okBox1.x + okBox1.width / 2, okBox1.y + okBox1.height / 2) : '(no OK button)'
await shot(page, 'w1-05-refusal-charts-unticked')
L.note('5a: the refusal the app raised', msg1)
L.ok('5a: the refusal is readable ON TOP (the screen centre is the message box)', /INSIDE the message box/.test(centre1), `at the screen centre: ${centre1}; at the message's OK button: ${onOk1}`)
/* what a person does next: press where the message's OK would be */
const ticksBefore = await page.evaluate(() => [...document.querySelectorAll('#copySylList input')].map(i => i.checked))
if (okBox1) { await page.mouse.click(okBox1.x + okBox1.width / 2, okBox1.y + okBox1.height / 2); await sleep(400) }
const ticksAfter = await page.evaluate(() => [...document.querySelectorAll('#copySylList input')].map(i => i.checked))
L.note('5a: after pressing where the message\'s OK is', `Export window ${await page.locator('#copyModal').isVisible() ? 'still open' : 'CLOSED'}; message ${await onTop('#dlgModal') ? 'now ON TOP' : 'still hidden behind the Export window'}; the press ${JSON.stringify(ticksBefore) !== JSON.stringify(ticksAfter) ? 'TOGGLED a chart tick-box in the Export window (' + JSON.stringify(ticksBefore) + ' → ' + JSON.stringify(ticksAfter) + ')' : 'changed no tick-box'}`)
await shot(page, 'w1-05-refusal-after-press')
/* the way out a person finds: Cancel the Export window — then the message shows */
await page.click('#copyCancel'); await sleep(400)
L.note('5a: after Cancel on the Export window', (await onTop('#dlgModal')) ? `the message is on top only now: "${(await dlgText(page)).replace(/\s+/g, ' ')}"` : 'no message on top')
await shot(page, 'w1-05-refusal-after-cancel-a')
if (await onTop('#dlgModal')) await dlg(page, { ok: true })

/* ---- 5b. refusal: Charts ticked, every chart unticked ---- */
await openExport()
for (const cb of await page.locator('#copySylList input').all()) if (await cb.isChecked()) await cb.click()
await page.click('#copyOk'); await sleep(500)
const up2 = await dlgUp(page, 1500)
const msg2 = up2 ? await dlgText(page) : '(no message)'
const centre2 = await topAt(vw.width / 2, vw.height / 2)
const okBox2 = await page.locator('#dlgOk').boundingBox().catch(() => null)
const onOk2 = okBox2 ? await topAt(okBox2.x + okBox2.width / 2, okBox2.y + okBox2.height / 2) : '(no OK button)'
await shot(page, 'w1-05-refusal-no-chart-ticked')
L.note('5b: the refusal the app raised', msg2)
L.ok('5b: the refusal is readable ON TOP', /INSIDE the message box/.test(centre2), `at the screen centre: ${centre2}; at the message's OK button: ${onOk2}`)
/* a second press on Export while the message waits unseen */
await page.click('#copyOk'); await sleep(400)
L.note('5b: pressing Export again while the message waits', `message on top: ${await onTop('#dlgModal') ? 'yes' : 'NO'}; Export window open: ${await page.locator('#copyModal').isVisible()}`)
await page.click('#copyCancel'); await sleep(400)
const after2 = await onTop('#dlgModal')
await shot(page, 'w1-05-refusal-after-cancel-b')
L.note('5b: after Cancel on the Export window', after2 ? `the message is on top only now: "${(await dlgText(page)).replace(/\s+/g, ' ')}"` : 'no message on top')
if (after2) await dlg(page, { ok: true })
if (await dlgUp(page, 700) && await onTop('#dlgModal')) L.note('5b: another message was queued', (await dlg(page, { ok: true })).text)

/* ---- 15. Students & courses: unticked every time; the done message; the file name ---- */
await openExport()
const s0 = await page.isChecked('#copyStudents')
await page.click('#copyStudents'); await sleep(150)
const warnOn = await page.locator('#copyWarn').innerText()
await shot(page, 'w1-15-students-ticked')
await page.click('#copyCancel'); await sleep(300)
await openExport()
const s1 = await page.isChecked('#copyStudents')
await page.click('#copyCancel'); await sleep(300)
L.ok('15: Students is unticked when the window opens, and again after ticking it and cancelling', !s0 && !s1, `first open ${s0 ? 'TICKED' : 'unticked'}; after tick + Cancel, reopened ${s1 ? 'TICKED' : 'unticked'}; the warning line when ticked: "${warnOn}"`)

const withS = await exportVia(page, { tick: 'as-opened', students: true })
L.ok('15: a file WITH students: suggested name says WITH-STUDENTS (R19)', /WITH-STUDENTS/.test(withS.suggested), withS.suggested)
L.ok('15: …and the done message warns it holds names and marks (R18)', /CONTAINS student names and marks/i.test(withS.conf), withS.conf)
L.note('15: the file carries', `charts: ${withS.json.charts ? Object.keys(withS.json.charts.syllabi || {}).length + ' chart(s)' : 'none'}; students: ${withS.json.students ? Object.keys(withS.json.students.byCourse || {}).length + ' course(s)' : 'none'}`)
await openExport()
const s2 = await page.isChecked('#copyStudents')
await shot(page, 'w1-15-reopened-after-students-export')
await page.click('#copyCancel'); await sleep(300)
L.ok('15: after an export WITH students, the next open has Students unticked again', !s2, s2 ? 'TICKED' : 'unticked')
const chartsOnly = await exportVia(page, { tick: 'as-opened' })
L.ok('15: a charts-only file: plain name, and the done message says charts only', !/WITH-STUDENTS/.test(chartsOnly.suggested) && /charts only/i.test(chartsOnly.conf), `${chartsOnly.suggested} — "${chartsOnly.conf}"`)
L.ok('15: the charts-only file names nobody', !chartsOnly.json.students, chartsOnly.json.students ? 'it HAS a students block' : 'no students block')

save('w1-c-exportwindow', { rows: L.rows, offers, controls, msg1, msg2, errors })
console.log(`errors ${errors.length}: ${errors.slice(0, 4).join(' | ')}`)
await browser.close()
