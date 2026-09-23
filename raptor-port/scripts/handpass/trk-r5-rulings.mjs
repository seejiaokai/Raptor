/* [HUMAN-RETEST] Tracker — the walk of the owner's last three answers (23 Sep 26):
   D130 deleting a ball also deletes the details typed on it; D131 the course
   delete question says "in this browser"; D132 (unchanged behaviour, confirmed)
   is walked by the smoke suite's write-watch. */
import { open, shot, save, log, dlg, reveal, DESK } from './trk-lib.mjs'
import { sleep, ball, menu, pickSyl, arrangeOn, arrangeOff, tool, saveLit, addBall, dlgUp, dlgText, showAllRow, showAllEdit } from './trk-w1-lib.mjs'

const L = log()
const { browser, page, errors } = await open({ size: DESK, who: 'a' })
await pickSyl(page, '2026')
const doc = await showAllRow(page, 'ACG-06')
await showAllEdit(page, 'ACG-06', { Name: 'TYPED ON 06', Hours: '9 Hrs' })
await arrangeOn(page); await tool(page, '🗑 Delete'); await reveal(page, 'ACG-06'); await ball(page, 'ACG-06').click(); await sleep(300)
await dlg(page, {}); await tool(page, 'Move'); await arrangeOff(page)
await page.click('#saveChanges'); await sleep(700)
await arrangeOn(page); await addBall(page, '+ Acad', 'ACG-06'); await sleep(300); await arrangeOff(page)
if (await saveLit(page)) { await page.click('#saveChanges'); await sleep(700) }
const after = await showAllRow(page, 'ACG-06', { close: false })
await shot(page, 'r5-d130-new-ball-nothing-typed'); await page.click('#saClose')
L.ok('D130: the new ACG-06 carries nothing that was typed on the deleted one', !/TYPED ON 06|9 Hrs/.test(after), `before delete: ${doc.slice(0, 80)} | new ball: ${after.slice(0, 80)}`)
await menu(page, 'course', 'addCourse'); await dlg(page, { value: 'D131 COURSE' }); await sleep(800)
await menu(page, 'course', 'delCourse')
const q = (await dlgUp(page, 1500)) ? await dlgText(page) : '(none)'
await shot(page, 'r5-d131-delete-course-question')
L.ok('D131: the delete question says the course comes back in this browser', /brings it back in this browser/.test(q), q)
await dlg(page, {}); await sleep(600)
save('r5-rulings', { rows: L.rows, errors })
console.log(`errors ${errors.length}: ${errors.slice(0, 4).join(' | ')}`)
await browser.close()
