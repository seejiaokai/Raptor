/* [HUMAN-RETEST] Tracker — re-walk, round three, B: marking, Last Flown,
   deleting a ball, lulls, undo, Reset to doc, the ✎ mark, the course restore
   door and the logout question — each through the app's own controls on the
   rebuilt preview (23 Sep 26), desktop 1440×900, admin.

   W2-F2  a Done-on day retyped key by key is not "today"
   D123   Last Flown = the latest day actually flown; a correction or an
          un-mark pulls it back; a hand-typed day stands until a later flight
   W2-F6  ↶ / ↷ keep the chart where it is
   D124   deleting a ball wipes its marks (a new ball with that code is
          ungraded); a deleted-but-unsaved code cannot be re-added
   W2-F4  a lull period's × asks first
   W2-F5  Copy to… has "Select all"
   w3-F4  "Reset to doc" only where there is a doc; it saves nothing until Save
   R-1    a fonts-only save leaves an untouched built-in unmarked
   D128   a deleted course comes back from ⇅ Reorder courses with its students
   D129   Logout with unsaved chart edits asks Save / Discard / Stay, over the
          Tracker tab, from another page */
import { open, shot, save, log, dlg, reveal, login, toTracker, toPage, DESK } from './trk-lib.mjs'
import { sleep, ball, menu, pickSyl, sylLabels, arrangeOn, arrangeOff, tool, saveLit, addBall, dlgUp, dlgText, showAllRow, pickCourse, courseLabels, crewLabels } from './trk-w1-lib.mjs'
import { typeDate, currency, scrollOf, tapBall, popTitle, lullChips } from './trk-w2-lib.mjs'

const L = log()
const { browser, page, errors } = await open({ size: DESK, who: 'a' })
const ls = async () => (await currency(page)).lastSyll
const closePop = async () => { await page.keyboard.press('Escape'); await sleep(250) }
const grade = async (id, iso, g = 'DCO') => {
  await tapBall(page, id)
  if (iso) await typeDate(page, '#popDoneDate', iso)
  await page.locator('#pop button', { hasText: new RegExp('^\\s*' + g + '\\s*$') }).first().click(); await sleep(350)
}
await pickSyl(page, '2026')

/* ---- W2-F2 ---- */
await grade('TR-2', '2026-09-15')
L.ok('W2-F2 set-up: TR-2 done 15/09 → Last Flown 15/09', await ls() === '2026-09-15', await ls())
await tapBall(page, 'TR-2'); await typeDate(page, '#popDoneDate', '2026-09-17'); await closePop()
const c1 = await currency(page)
await shot(page, 'r3-b1-retyped-day-lastflown', { el: '.c-curr' }).catch(() => shot(page, 'r3-b1-retyped-day-lastflown'))
L.ok('W2-F2: retyping the day key by key sets Last Flown to 17/09, never today', c1.lastSyll === '2026-09-17' && c1.lastCurr === '2026-09-17', JSON.stringify(c1))

/* ---- D123 ---- */
await grade('TR-3', '2026-09-21')
L.ok('D123: a later flight moves Last Flown to 21/09', await ls() === '2026-09-21', await ls())
await tapBall(page, 'TR-3'); await typeDate(page, '#popDoneDate', '2026-09-16'); await closePop()
L.ok('D123: correcting TR-3 to 16/09 pulls Last Flown back to the latest flown (TR-2, 17/09)', await ls() === '2026-09-17', await ls())
await grade('TR-2', null, 'Not done')
L.ok('D123: un-marking TR-2 pulls it back to TR-3 (16/09)', await ls() === '2026-09-16', await ls())
await grade('TR-3', null, 'Not done')
L.ok('D123: nothing flown — Last Flown is empty', !(await ls()), JSON.stringify(await currency(page)))
await typeDate(page, '#lastSyll', '2026-09-30')
await grade('TR-2', '2026-09-21')
L.ok('D123: a day typed by hand (30/09) stands when an older flight is marked', await ls() === '2026-09-30', await ls())
await grade('TR-3', '2026-10-02')
L.ok('D123: a later flight (02/10) moves it', await ls() === '2026-10-02', await ls())
await shot(page, 'r3-b2-lastflown-after-corrections')
for (const id of ['TR-2', 'TR-3']) await grade(id, null, 'Not done')

/* ---- W2-F6 ---- */
await reveal(page, 'BFM-3')
await grade('BFM-3', null)
const s0 = await scrollOf(page)
await page.click('#trUndoBtn'); await sleep(500)
const s1 = await scrollOf(page)
await page.click('#trRedoBtn'); await sleep(500)
const s2 = await scrollOf(page)
await shot(page, 'r3-b3-view-after-undo-redo')
L.ok('W2-F6: ↶ keeps the chart where it is', Math.abs(s1.top - s0.top) <= 2, `${JSON.stringify(s0)} → ${JSON.stringify(s1)}`)
L.ok('W2-F6: ↷ keeps it too', Math.abs(s2.top - s0.top) <= 2, `${JSON.stringify(s0)} → ${JSON.stringify(s2)}`)
await grade('BFM-3', null, 'Not done')

/* ---- D124 ---- */
await tapBall(page, 'ACG-03'); await page.click('#popFailPlus'); await sleep(250)
await page.locator('#pop button', { hasText: /^\s*DCO\s*$/ }).first().click(); await sleep(350)
await arrangeOn(page); await tool(page, '🗑 Delete')
await reveal(page, 'ACG-03'); await ball(page, 'ACG-03').click(); await sleep(300)
const q24 = (await dlgUp(page, 1500)) ? await dlgText(page) : '(no question)'
await shot(page, 'r3-b4-delete-question')
L.ok('D124: the delete question says the marks go at Save changes', /marks on it are removed when you press ✓ Save changes/.test(q24), q24)
await dlg(page, {})
/* the same code again before the save: refused, with the way on */
const qx = await addBall(page, '+ Acad', 'ACG-03'); await sleep(200)
const refusal = (await dlgUp(page, 800)) ? await dlgText(page) : '(none)'
L.ok('D124: a deleted-but-unsaved code waits for the save', /deleted from this chart and that is not saved yet/.test(refusal), refusal)
if (await dlgUp(page, 300)) await dlg(page, {})
await tool(page, 'Move'); await arrangeOff(page)
await page.click('#saveChanges'); await sleep(600)
await arrangeOn(page); await addBall(page, '+ Acad', 'ACG-03'); await sleep(300); await arrangeOff(page)
if (await saveLit(page)) { await page.click('#saveChanges'); await sleep(600) }
await tapBall(page, 'ACG-03')
const popTxt = (await page.locator('#pop').innerText()).replace(/\s+/g, ' ')
await shot(page, 'r3-b4-new-ball-same-code')
L.ok('D124: the new ball with the deleted code is ungraded and carries no failure', /Fails:\s*−\s*0\s*\+/.test(popTxt) && !/Done on\b(?! \(when marked\))/.test(popTxt), popTxt.slice(0, 200))
await closePop()

/* ---- W2-F4 ---- */
await page.click('#setLullBtn'); await sleep(300)
const days = page.locator('.lullcal .day:not(.out)')
await days.nth(9).click(); await sleep(200); await days.nth(13).click(); await sleep(400)
const chipsBefore = await lullChips(page)
await page.locator('#lullChips .lullchip .x').first().click(); await sleep(300)
const q4 = (await dlgUp(page, 1000)) ? await dlgText(page) : '(no question)'
await shot(page, 'r3-b5-lull-remove-question')
L.ok('W2-F4: the × asks first', /Remove .*lull period/.test(q4), q4)
await dlg(page, { ok: false })
L.ok('W2-F4: Cancel keeps it', (await lullChips(page)).length === chipsBefore.length, (await lullChips(page)).join(' | '))
await page.locator('#lullChips .lullchip .x').first().click(); await sleep(300); await dlg(page, {})
L.ok('W2-F4: OK removes it', (await lullChips(page)).length === chipsBefore.length - 1)

/* ---- W2-F5 ---- */
await page.click('#addStu'); await page.waitForSelector('#dlgModal')
await page.fill('#dlgInput', 'THIRD R3'); await page.click('#dlgOk'); await sleep(600)
const crew = await crewLabels(page)
await page.click('#copyLullBtn'); await sleep(300)
const allBox = page.locator('#lullCopyAll')
L.ok('W2-F5: Copy to… has a Select all row', await allBox.count() === 1, `crew: ${crew.join(', ')}`)
if (await allBox.count()) { await allBox.click(); await sleep(200) }
const ticked = await page.locator('#lullCopy .lullpick:not(.lullall) input:checked').count()
await shot(page, 'r3-b6-copy-to-select-all')
L.ok('W2-F5: Select all ticks everyone else', ticked === crew.length - 1, `${ticked} of ${crew.length - 1}`)
await page.click('#lullCopyClose'); await sleep(200)

/* ---- w3-F4 ---- */
await arrangeOn(page); await addBall(page, '+ Acad', 'MY-01'); await sleep(300); await arrangeOff(page)
if (await saveLit(page)) { await page.click('#saveChanges'); await sleep(600) }
await tapBall(page, 'MY-01'); await page.click('#popEditInfo'); await page.waitForSelector('#infoModal')
L.ok('w3-F4: no "Reset to doc" on a ball the user made', await page.locator('#ifReset').count() === 0)
await shot(page, 'r3-b7-no-reset-on-own-ball'); await page.click('#ifCancel'); await sleep(200)
await tapBall(page, 'ACG-01'); await page.click('#popEditInfo'); await page.waitForSelector('#infoModal')
const doc = await page.inputValue('#ifName')
await page.fill('#ifName', 'MINE R3'); await page.click('#ifSave'); await sleep(400)
await tapBall(page, 'ACG-01'); await page.click('#popEditInfo'); await page.waitForSelector('#infoModal')
await page.click('#ifReset'); await sleep(200)
const shown = await page.inputValue('#ifName')
await shot(page, 'r3-b7-reset-fills-boxes')
await page.click('#ifCancel'); await sleep(250)
const row = await showAllRow(page, 'ACG-01')
L.ok('w3-F4: Reset to doc fills the boxes with the doc', shown === doc, `doc "${doc}" shown "${shown}"`)
L.ok('w3-F4: …and Cancel keeps what was saved', /MINE R3/.test(row), row)

/* ---- R-1 ---- */
await pickSyl(page, 'A/G - A/A 2026')
await arrangeOn(page); await page.click('#selectAllBtn'); await sleep(200)
await page.fill('#fontIn', '10'); await sleep(300); await arrangeOff(page)
if (await saveLit(page)) { await page.click('#saveChanges'); await sleep(600) }
const agLabel = (await sylLabels(page)).find(s => s.startsWith('A/G'))
L.ok('R-1: a fonts-only save leaves the untouched built-in unmarked', agLabel === 'A/G - A/A 2026', agLabel)
await pickSyl(page, '2026')

/* ---- D128 ---- */
await menu(page, 'course', 'addCourse'); await dlg(page, { value: 'KEEP R3' }); await sleep(800)
await page.click('#addStu'); await page.waitForSelector('#dlgModal'); await page.fill('#dlgInput', 'ALPHA R3'); await page.click('#dlgOk'); await sleep(600)
await grade('ST-01', null)
await menu(page, 'course', 'delCourse')
const q28 = (await dlgUp(page, 1500)) ? await dlgText(page) : '(none)'
L.ok('D128: the delete question names the way back', /Restore in ⇅ Reorder courses brings it back/.test(q28), q28)
await dlg(page, {}); await sleep(800)
L.ok('D128: the course leaves the dropdown', !(await courseLabels(page)).includes('KEEP R3'), (await courseLabels(page)).join(' · '))
await menu(page, 'course', 'ordCourse'); await page.waitForSelector('#ordModal'); await sleep(250)
await shot(page, 'r3-b8-reorder-courses-deleted')
const restoreRow = page.locator('#ordHidden .ordrow').filter({ has: page.locator('.onm', { hasText: 'KEEP R3' }) })
L.ok('D128: ⇅ Reorder courses lists it with ↺ Restore', await restoreRow.count() === 1)
await restoreRow.locator('button').click(); await sleep(400)
await page.click('#ordSave'); await sleep(500)
await pickCourse(page, 'KEEP R3')
const back = await crewLabels(page)
const w = await page.evaluate(() => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === 'ST-01'); return g ? [...g.querySelectorAll('path.wedge')].map(p => p.getAttribute('fill')) : null })
await shot(page, 'r3-b8-course-restored')
L.ok('D128: restored with its student and mark', back.some(n => /ALPHA R3/.test(n)) && (w || []).includes('#000000'), `crew ${back.join(', ')}; ST-01 wedges ${JSON.stringify(w)}`)
await pickCourse(page, '26ABSG')

/* ---- D129 ---- */
const unsaved = async name => { await arrangeOn(page); await addBall(page, '+ Acad', name); await sleep(300); await arrangeOff(page) }
await unsaved('UNSAVED-R3')
await toPage(page, 'editsched')
await page.click('#logout'); await sleep(600)
const onTracker = await page.evaluate(() => window.CURPAGE)
const q29 = (await dlgUp(page, 1500)) ? await dlgText(page) : '(no question)'
const btns29 = await page.locator('#dlgModal button:visible').allInnerTexts()
await shot(page, 'r3-b9-logout-question')
L.ok('D129: Logout from another page asks first, over the Tracker tab', onTracker === 'tracker' && /unsaved chart edits/.test(q29), `page ${onTracker}; "${q29}" [${btns29.join(' / ')}]`)
await page.click('#dlgCancel'); await sleep(400)                                     /* Stay */
L.ok('D129: Stay keeps the session and the edit', await page.locator('#luser').count() === 0 && await ball(page, 'UNSAVED-R3').count() === 1 && await saveLit(page))
await page.click('#logout'); await sleep(500); await page.click('#dlgAlt'); await sleep(800)   /* Discard */
L.ok('D129: Discard logs out', await page.locator('#luser').isVisible().catch(() => false))
await login(page, 'a'); await toTracker(page)
L.ok('D129: …and the next person does not find the draft', await ball(page, 'UNSAVED-R3').count() === 0 && !(await saveLit(page)))
await unsaved('SAVED-R3')
await page.click('#logout'); await sleep(500); await page.click('#dlgOk'); await sleep(900)   /* Save them */
await login(page, 'a'); await toTracker(page)
L.ok('D129: Save them keeps the edit, saved', await ball(page, 'SAVED-R3').count() === 1 && !(await saveLit(page)))

save('r3-b-marking', { rows: L.rows, errors })
console.log(`errors ${errors.length}: ${errors.slice(0, 5).join(' | ')}`)
await browser.close()
