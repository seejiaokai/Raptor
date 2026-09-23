/* [HUMAN-RETEST] Tracker — walker w2, walk 6b: UNDO / REDO continued
   (R108–R110, Astra #23, Fable #26), desktop, admin.

   E. alternate ↶ / ↷ across a failure-with-its-day and a grade-with-its-day
      (and a re-dated flight): every state must come back whole — the count
      AND its day, the grade AND its day AND Last Flown.
   F. ↶ greyed after a syllabus switch, a course switch, ✓ Save changes.
   H. NOT undoable — students, details: ↶ never claims them; a removed
      student's steps go with them; a renamed student's steps follow the name. */
import { open, shot, save, log, reveal, dlg, DESK } from './trk-lib.mjs'
import { sleep, tapBall, popOpen, popTitle, popFails, currency, typeDate, pickFrom, undoState, wedges, stored, failCard } from './trk-w2-lib.mjs'

const L = log()
const { browser, page, errors } = await open({ size: DESK, who: 'a' })
const grade = async label => { await page.locator('#pop button', { hasText: new RegExp('^\\s*' + label + '\\s*$') }).first().click(); await sleep(500) }
const aId = await page.locator('#activeSel').inputValue()
const markOf = async id => { const st = await stored(page); const c = Object.values(st.byCourse)[0]; for (const b of Object.values(c.bySyllabus || {})) { const m = ((b.marks || {})[aId] || {})[id]; if (m) return m } return null }
const snap = async () => {
  const c = await currency(page); const f = await failCard(page); const tr2 = await markOf('TR-2'); const st2 = await markOf('ST-02')
  return { st02: st2 ? { f: st2.f, fd: st2.fd, at: st2.at } : null, fchips: f.chips.map(x => x.t + '@' + (x.date || '')), tr2: tr2 ? { g: tr2.g, d: tr2.d || null, at: tr2.at } : null, last: [c.lastSyll, c.lastCurr], undo: (await undoState(page)).undo.t, redo: (await undoState(page)).redo.t }
}

/* ---------- E. alternate across failure+day and grade+day ---------- */
await tapBall(page, 'ST-02')
await typeDate(page, '#popFailDate', '2026-09-11'); await page.click('#popFailPlus'); await sleep(450)
await page.keyboard.press('Escape'); await sleep(250)
const s1 = await snap()
await tapBall(page, 'TR-2')
await typeDate(page, '#popDoneDate', '2026-09-19'); await grade('DCO')
const s2 = await snap()
L.note('E.0 after a failure on 11/09 and TR-2 DCO on 19/09', JSON.stringify(s2))
await page.click('#trUndoBtn'); await sleep(550); const e1 = await snap()
await page.click('#trRedoBtn'); await sleep(550); const e2 = await snap()
await page.click('#trUndoBtn'); await sleep(550); await page.click('#trUndoBtn'); await sleep(550); const e3 = await snap()
await page.click('#trRedoBtn'); await sleep(550); const e4 = await snap()
await page.click('#trRedoBtn'); await sleep(550); const e5 = await snap()
L.ok('E.1 ↶ the grade: TR-2 not done, its day gone, Last Flown back to empty', (!e1.tr2 || !e1.tr2.g) && !e1.last[0] && !e1.last[1], JSON.stringify(e1))
L.ok('E.2 ↷ the grade: TR-2 DCO on 19/09 again, Last Flown 19/09, the SAME stamp', JSON.stringify(e2.tr2) === JSON.stringify(s2.tr2) && e2.last.join() === '2026-09-19,2026-09-19', JSON.stringify(e2))
L.ok('E.3 ↶ ↶: the failure goes too (count 0, no chip)', (!e3.st02 || !e3.st02.f) && e3.fchips.length === 0, JSON.stringify(e3))
L.ok('E.4 ↷: the failure is back WITH ITS DAY (11/09), not today', JSON.stringify(e4.st02) === JSON.stringify(s1.st02) && e4.fchips.join() === 'ST-02@2026-09-11', JSON.stringify(e4))
L.ok('E.5 ↷: the grade is back with its day and Last Flown', JSON.stringify(e5.tr2) === JSON.stringify(s2.tr2) && e5.last.join() === '2026-09-19,2026-09-19', JSON.stringify(e5))
/* a re-dated flight, then ↶ ↷ */
await tapBall(page, 'TR-2'); await typeDate(page, '#popDoneDate', '2026-09-17'); await page.keyboard.press('Escape'); await sleep(300)
const r1 = await snap()
await page.mouse.click(300, 300); await page.click('#trUndoBtn'); await sleep(550); const r2 = await snap()
await page.click('#trRedoBtn'); await sleep(550); const r3 = await snap()
L.ok('E.6 re-dating TR-2 to 17/09 is ONE step named "the date on TR-2"; ↶ → 19/09, ↷ → 17/09', r1.undo === 'Undo the date on TR-2 for STUDENT A (Ctrl+Z)' && r2.tr2.d === '2026-09-19' && r3.tr2.d === '2026-09-17', JSON.stringify({ tip: r1.undo, after: r1.tr2.d, undo: r2.tr2.d, redo: r3.tr2.d, lastFlown: [r1.last, r2.last, r3.last] }))
await tapBall(page, 'TR-2'); const pfb = await popFails(page); await page.keyboard.press('Escape'); await sleep(200)
L.ok('E.7 the pop-up\'s Done on box shows the redone day (17/09)', pfb.doneOn === '2026-09-17', JSON.stringify(pfb))

/* ---------- F. ↶ greyed after switches and Save changes ---------- */
await tapBall(page, 'ST-01'); await grade('DCO')
const f0 = await undoState(page)
await pickFrom(page, '#sylSel', /^Tx 2026/)
const f1 = await undoState(page)
await pickFrom(page, '#sylSel', /^2026/)
const f2 = await undoState(page)
L.ok('F.1 a syllabus switch greys ↶ and ↷ (and they stay greyed on the way back)', !f0.undo.off && f1.undo.off && f1.redo.off && f2.undo.off && f2.redo.off, JSON.stringify({ before: f0.undo.t, onTx: [f1.undo.t, f1.redo.t], back: [f2.undo.t, f2.redo.t] }))
await tapBall(page, 'ST-03'); await grade('DCO')
const f3 = await undoState(page)
await page.click('#courseMenuBtn'); await page.waitForSelector('#addCourse', { state: 'visible' }); await page.click('#addCourse'); await sleep(250)
await dlg(page, { value: 'UNDO CRS' }); await sleep(900)
const f4 = await undoState(page)
await pickFrom(page, '#courseSel', /^26ABSG$/)
const f5 = await undoState(page)
L.ok('F.2 a course switch greys ↶ (new course, and back on 26ABSG)', !f3.undo.off && f4.undo.off && f5.undo.off && f5.redo.off, JSON.stringify({ before: f3.undo.t, newCourse: f4.undo.t, back: f5.undo.t }))
await tapBall(page, 'ST-04'); await grade('DCO')
await page.click('#sylMenuBtn'); await page.waitForSelector('#arrangeBtn', { state: 'visible' }); await page.click('#arrangeBtn'); await sleep(400)
await page.locator('#arrTools button', { hasText: '+ Acad' }).click(); await sleep(300)
if (await page.locator('#dlgModal').isVisible().catch(() => false)) await dlg(page, { value: 'UND-1' })
await sleep(300)
await page.click('#sylMenuBtn'); await page.waitForSelector('#arrangeBtn', { state: 'visible' }); await page.click('#arrangeBtn'); await sleep(400)
const f6 = await undoState(page)
await page.click('#saveChanges'); await sleep(600)
const f7 = await undoState(page)
L.ok('F.3 ✓ Save changes greys ↶ — the chart edit AND the mark made before it', f6.undo.t === 'Undo a chart edit (Ctrl+Z)' && f7.undo.off && f7.redo.off, JSON.stringify({ before: f6.undo.t, after: [f7.undo.t, f7.redo.t] }))
await shot(page, 'w2-08-greyed-after-save')

/* ---------- H. not undoable: students, details ---------- */
await tapBall(page, 'ST-05'); await grade('DCO')
const h0 = (await undoState(page)).undo.t
await page.locator('#addStu').scrollIntoViewIfNeeded(); await page.click('#addStu'); await sleep(300)
await dlg(page, { value: 'NEWBIE' }); await sleep(700)
const h1 = (await undoState(page)).undo.t
L.ok('H.1 + Add is not an undo step: ↶ still names the ST-05 mark', h1 === h0, `${h0} → ${h1} (crew now ${await page.locator('#activeSel option:checked').innerText()})`)
/* NEWBIE marks ST-01, then is removed: their step goes with them */
await tapBall(page, 'ST-01'); await grade('DCO')
const h2 = (await undoState(page)).undo.t
await page.locator('.chips .chip', { hasText: 'NEWBIE' }).locator('[data-rm]').click(); await sleep(300)
const q = await dlg(page, { ok: true }); await sleep(700)
const h3 = await undoState(page)
L.ok('H.2 removing NEWBIE takes their step with them (↶ no longer names NEWBIE)', /NEWBIE/.test(h2) && !/NEWBIE/.test(h3.undo.t), JSON.stringify({ before: h2, question: q.text.replace(/\s+/g, ' '), after: h3.undo.t }))
/* rename A: the step follows the new name */
await pickFrom(page, '#activeSel', /STUDENT A/)
await page.locator('.chips .chip', { hasText: 'STUDENT A' }).locator('[data-ren]').click(); await sleep(300)
await dlg(page, { value: 'ALPHA' }); await sleep(700)
const h4 = (await undoState(page)).undo.t
L.ok('H.3 a rename is not an undo step, and ↶ names the step by the NEW name', h4 === 'Undo the mark on ST-05 for ALPHA (Ctrl+Z)', h4)
/* event details: not undoable */
await tapBall(page, 'ST-05'); await page.click('#popEditInfo'); await sleep(350)
const nm0 = await page.locator('#ifName').inputValue()
await page.fill('#ifName', 'W2 RENAMED EVENT'); await page.click('#ifSave'); await sleep(500)
const h5 = (await undoState(page)).undo.t
await page.mouse.click(300, 300); await page.click('#trUndoBtn'); await sleep(550)
await tapBall(page, 'ST-05'); const infoAfter = await page.locator('#popInfo').innerText().catch(() => ''); await page.keyboard.press('Escape'); await sleep(200)
L.ok('H.4 an event-details save is not an undo step: ↶ names the mark, takes the mark, leaves the new name', h5 === 'Undo the mark on ST-05 for ALPHA (Ctrl+Z)' && /W2 RENAMED EVENT/.test(infoAfter) && (await wedges(page, 'ST-05'))[0] === '#ffffff', JSON.stringify({ tip: h5, was: nm0, details: infoAfter.replace(/\s+/g, ' ').slice(0, 80), st05: await wedges(page, 'ST-05') }))
/* a course rename and a syllabus rename — do they clear ↶? */
await tapBall(page, 'ST-06'); await grade('DCO')
await page.click('#courseMenuBtn'); await page.waitForSelector('#renCourse', { state: 'visible' }); await page.click('#renCourse'); await sleep(250)
await dlg(page, { value: '26ABSG-R' }); await sleep(800)
const h6 = await undoState(page)
await page.click('#sylMenuBtn'); await page.waitForSelector('#renSyl', { state: 'visible' }); await page.click('#renSyl'); await sleep(250)
await dlg(page, { value: '2026 R' }); await sleep(800)
const h7 = await undoState(page)
L.note('H.5 after a COURSE rename / a SYLLABUS rename, ↶ says', JSON.stringify([h6.undo.t, h7.undo.t]))
await shot(page, 'w2-08-after-renames')

save('w2-06-undo-b', { rows: L.rows, errors })
console.log(`errors ${errors.length}: ${errors.slice(0, 6).join(' | ')}`)
await browser.close()
