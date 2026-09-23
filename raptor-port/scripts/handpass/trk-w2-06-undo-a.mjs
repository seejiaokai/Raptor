/* [HUMAN-RETEST] Tracker — walker w2, walk 6a: UNDO / REDO (R108, R109,
   Astra #23, #25), desktop.

   A. the member's bar: ↶ ↷ there, greyed, a named tooltip, a mark taken back
      and redone.
   B. ONE history, in order: a grade, a failure, the four Currency boxes, a
      chart edit (a ball dragged in edit mode) — ↶ seven times, reading the
      tooltip before each press and the screen after; then ↷ seven times.
   C. undo a mark of a student you have moved away from, with a pop-up open.
   D. quick keystrokes into one date box = one step; slow ones; a failure's day
      edited twice in the full list, one ↶.
   K. does ↶ / ↷ keep the chart where it is (as grading does, R62)? */
import { open, shot, save, log, reveal, DESK } from './trk-lib.mjs'
import { sleep, tapBall, popOpen, popTitle, popFails, currency, typeDate, pickFrom, undoState, stackDepth, wedges, scrollOf, failCard } from './trk-w2-lib.mjs'

const L = log()
const grade = async (page, label) => { await page.locator('#pop button', { hasText: new RegExp('^\\s*' + label + '\\s*$') }).first().click(); await sleep(500) }

/* ---------- A. the member ---------- */
{
  const { browser, page, errors } = await open({ size: DESK, who: 'u' })
  const u0 = await undoState(page)
  L.ok('A.1 member: ↶ ↷ are on the bar, greyed, "Nothing to undo / redo"', u0.undo && u0.redo && u0.undo.off && u0.redo.off && /Nothing to undo/.test(u0.undo.t) && /Nothing to redo/.test(u0.redo.t), JSON.stringify(u0))
  await tapBall(page, 'ST-01'); await grade(page, 'DCO')
  const u1 = await undoState(page)
  L.ok('A.2 member: after a mark, ↶ lights and names it ("Undo the mark on ST-01 for STUDENT A (Ctrl+Z)")', !u1.undo.off && u1.undo.t === 'Undo the mark on ST-01 for STUDENT A (Ctrl+Z)', u1.undo.t)
  await page.locator('#trUndoBtn').hover(); await sleep(300)
  await shot(page, 'w2-08-member-undo-lit')
  await page.click('#trUndoBtn'); await sleep(500)
  const u2 = await undoState(page)
  L.ok('A.3 member: ↶ takes the mark back; ↷ names it ("Redo the mark on ST-01 …(Ctrl+Y)")', (await wedges(page, 'ST-01'))[0] === '#ffffff' && u2.redo.t === 'Redo the mark on ST-01 for STUDENT A (Ctrl+Y)', JSON.stringify(u2))
  await page.click('#trRedoBtn'); await sleep(500)
  L.ok('A.4 member: ↷ puts it back', (await wedges(page, 'ST-01'))[0] === '#000000', JSON.stringify(await wedges(page, 'ST-01')))
  L.note('A errors', JSON.stringify(errors))
  await browser.close()
}

/* ---------- B, C, D, K. the admin ---------- */
const { browser, page, errors } = await open({ size: DESK, who: 'a' })
/* B. seven different steps */
await tapBall(page, 'ST-01'); await grade(page, 'DCO')                                  // 1 mark
await tapBall(page, 'ST-02'); await page.click('#popFailPlus'); await sleep(400)        // 2 failure
await page.keyboard.press('Escape'); await sleep(200)
{ const b = page.locator('#downDays'); await b.scrollIntoViewIfNeeded(); await b.click(); await page.keyboard.type('2', { delay: 60 }); await sleep(2300) }  // 3 down days
await typeDate(page, '#upchit', '2026-09-20'); await sleep(2300)                       // 4 upchit
await typeDate(page, '#lastSyll', '2026-09-18'); await sleep(2300)                     // 5 Last Flown (Syllabus)
await typeDate(page, '#lastCurr', '2026-09-19'); await sleep(2300)                     // 6 Last Flown (Currency)
const cur6 = await currency(page)
L.note('B.0 the Currency card after the four boxes', JSON.stringify(cur6))
/* 7. a chart edit: Syllabus ✎ → Edit chart layout → drag ACG-05 → Done editing */
await page.click('#sylMenuBtn'); await page.waitForSelector('#arrangeBtn', { state: 'visible' }); await page.click('#arrangeBtn'); await sleep(400)
await reveal(page, 'ACG-05')
const bb = await page.locator('#flowSvg .ball[data-id="ACG-05"]').first().boundingBox()
const pos0 = await page.locator('#flowSvg .ball[data-id="ACG-05"]').first().getAttribute('transform')
await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.mouse.down()
for (let i = 1; i <= 8; i++) await page.mouse.move(bb.x + bb.width / 2 + 10 * i, bb.y + bb.height / 2 + 4 * i)
await page.mouse.up(); await sleep(400)
const pos1 = await page.locator('#flowSvg .ball[data-id="ACG-05"]').first().getAttribute('transform')
await page.click('#sylMenuBtn'); await page.waitForSelector('#arrangeBtn', { state: 'visible' }); await page.click('#arrangeBtn'); await sleep(400)
L.note('B.0b ACG-05 dragged', `${pos0} → ${pos1}; Save changes showing: ${await page.locator('#saveChanges').count()}`)
const d0 = await stackDepth(page)
L.ok('B.1 seven steps are in the one history', d0 && d0.undo === 7, JSON.stringify(d0))
const want = ['a chart edit', 'Last Flown (Currency) for STUDENT A', 'Last Flown (Syllabus) for STUDENT A', 'the upchit date for STUDENT A', 'the down days for STUDENT A', 'the failure count on ST-02 for STUDENT A', 'the mark on ST-01 for STUDENT A']
const seen = [], after = []
for (let i = 0; i < 7; i++) {
  const t = (await undoState(page)).undo.t; seen.push(t)
  await page.click('#trUndoBtn'); await sleep(550)
  const c = await currency(page)
  after.push({ i, save: await page.locator('#saveChanges').count(), acg05: await page.locator('#flowSvg .ball[data-id="ACG-05"]').first().getAttribute('transform'), lastSyll: c.lastSyll, lastCurr: c.lastCurr, down: c.downDays, upchit: c.upchit, st02f: (await failCard(page)).chips.length, st01: (await wedges(page, 'ST-01'))[0] })
  if (i === 0) await shot(page, 'w2-08-undo-chart-edit-lights-save')
}
L.ok('B.2 ↶ ×7 takes them back newest first, each tooltip naming its step', seen.every((t, i) => t === 'Undo ' + want[i] + ' (Ctrl+Z)'), JSON.stringify(seen))
L.note('B.3 the screen after each ↶', JSON.stringify(after))
L.ok('B.4 undoing the chart edit put ACG-05 back and lit ✓ Save changes (R110)', after[0].acg05 === pos0 && after[0].save === 1, JSON.stringify(after[0]))
L.ok('B.5 after ↶ ×7 everything is back to the start (no marks, no failures, empty boxes)', after[6].st01 === '#ffffff' && after[6].st02f === 0 && !after[6].lastSyll && !after[6].lastCurr && !after[6].down && !after[6].upchit, JSON.stringify(after[6]))
const u7 = await undoState(page)
L.ok('B.6 ↶ now greyed', u7.undo.off, JSON.stringify(u7.undo))
const rseen = []
for (let i = 0; i < 7; i++) { rseen.push((await undoState(page)).redo.t); await page.click('#trRedoBtn'); await sleep(550) }
const curR = await currency(page)
L.ok('B.7 ↷ ×7 redoes them oldest first, each named', rseen.every((t, i) => t === 'Redo ' + want[6 - i] + ' (Ctrl+Y)'), JSON.stringify(rseen))
L.ok('B.8 …and everything is back as it was after the seven steps', JSON.stringify([curR.lastSyll, curR.lastCurr, curR.downDays, curR.upchit]) === JSON.stringify([cur6.lastSyll, cur6.lastCurr, cur6.downDays, cur6.upchit]) && (await wedges(page, 'ST-01'))[0] === '#000000' && (await page.locator('#flowSvg .ball[data-id="ACG-05"]').first().getAttribute('transform')) === pos1, JSON.stringify({ cur: [curR.lastSyll, curR.lastCurr, curR.downDays, curR.upchit], st01: (await wedges(page, 'ST-01'))[0] }))

/* C. undo a mark of a student you have moved away from — with a pop-up open */
await tapBall(page, 'ACG-01'); await grade(page, 'DCO')
await pickFrom(page, '#activeSel', /STUDENT B/)
await tapBall(page, 'ST-06')
const popB = await popTitle(page)
await page.keyboard.press('Control+z'); await sleep(600)
L.ok('C.1 Ctrl+Z (pop-up open for B) takes back A\'s ACG-01 mark, switches the Crew picker to A and closes the pop-up', /STUDENT A/.test(await page.locator('#activeSel option:checked').innerText()) && !(await popOpen(page)) && (await wedges(page, 'ACG-01'))[0] === '#ffffff', JSON.stringify({ popWas: popB, crew: await page.locator('#activeSel option:checked').innerText(), popOpen: await popOpen(page), acg01: await wedges(page, 'ACG-01') }))
await shot(page, 'w2-08-undo-switched-crew')

/* D. quick keystrokes into one date box = one step */
let dA = await stackDepth(page)
{ const b = page.locator('#upchit'); await b.scrollIntoViewIfNeeded(); const bx = await b.boundingBox(); await page.mouse.click(bx.x + 10, bx.y + bx.height / 2); await page.keyboard.type('01102026', { delay: 70 }); await sleep(400) }
let dB = await stackDepth(page)
L.ok('D.1 eight quick keystrokes into Upchit = ONE undo step', dB.undo - dA.undo === 1, `stack ${dA.undo} → ${dB.undo}; box ${await page.locator('#upchit').inputValue()}`)
const up0 = cur6.upchit
await page.mouse.click(300, 300); await page.click('#trUndoBtn'); await sleep(500)
L.ok('D.2 one ↶ puts Upchit back to what it held before the typing', (await page.locator('#upchit').inputValue()) === up0, `now ${await page.locator('#upchit').inputValue()} (was ${up0})`)
/* the same box typed SLOWLY — a gap over two seconds between the year's digits */
dA = await stackDepth(page)
{ const b = page.locator('#upchit'); const bx = await b.boundingBox(); await page.mouse.click(bx.x + 10, bx.y + bx.height / 2); await page.keyboard.type('0211', { delay: 70 }); for (const ch of '2026') { await page.keyboard.type(ch); await sleep(2300) } }
dB = await stackDepth(page)
await page.mouse.click(300, 300); await page.click('#trUndoBtn'); await sleep(500)
const slow1 = await page.locator('#upchit').inputValue()
L.note('D.3 typed slowly (2.3 s between the year\'s digits): steps recorded / what one ↶ shows in the box', `${dB.undo - dA.undo} steps; after one ↶ the box holds "${slow1}"`)
await shot(page, 'w2-08-slow-typing-one-undo', { el: '.c-curr' })
/* Astra #25: a failure's day edited twice quickly in the full list, then one ↶ */
await page.locator('#failTitle').scrollIntoViewIfNeeded(); await page.locator('#failTitle').click(); await sleep(350)
const fd0 = await page.locator('#failLog .frow >> nth=0 >> input').inputValue()
await typeDate(page, '#failLog .frow >> nth=0 >> input', '2026-09-12', { delay: 40 })
await typeDate(page, '#failLog .frow >> nth=0 >> input', '2026-09-14', { delay: 40 })
const fd1 = await page.locator('#failLog .frow >> nth=0 >> input').inputValue()
await page.keyboard.press('Escape'); await sleep(250)
await page.mouse.click(300, 300); await page.click('#trUndoBtn'); await sleep(500)
await page.locator('#failTitle').click(); await sleep(350)
const fd2 = await page.locator('#failLog .frow >> nth=0 >> input').inputValue()
L.ok('D.4 a failure\'s day changed twice quickly (→12/09 →14/09), one ↶ returns it to the ORIGINAL day', fd2 === fd0, `original ${fd0} → ${fd1} → after one ↶ ${fd2}`)
await page.keyboard.press('Escape'); await sleep(250)

/* K. does ↶ keep the chart where it is? */
await reveal(page, 'BFM-3'); await sleep(250)
const k0 = await scrollOf(page)
await tapBall(page, 'BFM-3', { noReveal: true }); await grade(page, 'DCO')
const k1 = await scrollOf(page)
await page.click('#trUndoBtn'); await sleep(600)
const k2 = await scrollOf(page)
await shot(page, 'w2-08-view-after-undo')
await page.click('#trRedoBtn'); await sleep(600)
const k3 = await scrollOf(page)
L.ok('K.1 grading far down keeps the view (R62)', JSON.stringify(k0) === JSON.stringify(k1), `${JSON.stringify(k0)} → ${JSON.stringify(k1)}`)
L.ok('K.2 ↶ of that grade keeps the view too (the person is looking at the ball they undid)', JSON.stringify(k1) === JSON.stringify(k2), `${JSON.stringify(k1)} → ↶ ${JSON.stringify(k2)}`)
L.ok('K.3 ↷ keeps the view', JSON.stringify(k2) === JSON.stringify(k3) || JSON.stringify(k1) === JSON.stringify(k3), `→ ↷ ${JSON.stringify(k3)}`)

save('w2-06-undo-a', { rows: L.rows, errors })
console.log(`errors ${errors.length}: ${errors.slice(0, 6).join(' | ')}`)
await browser.close()
