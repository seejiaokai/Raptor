/* [HUMAN-RETEST] Tracker — walker w2, walk 3: LULL PERIODS (R53, R115,
   Fable #13) and the day-first proof (R51: a lull ending on the 31st).

   All through the Lull card: + Set lull period, the calendar's day cells and
   ‹ › arrows, a press on a chip, the chip's ×, ⧉ Copy to… and its ticks.
   Students are added through + Add (typed callsign), a course through the
   Course ✎ menu. */
import { open, shot, save, log, dlg, DESK } from './trk-lib.mjs'
import { sleep, tapBall, lullChips, paceCard, undoState, pickFrom, visibleText } from './trk-w2-lib.mjs'

const L = log()
const { browser, page, errors } = await open({ size: DESK, who: 'a' })
const calOpen = () => page.locator('#lullCal').isVisible().catch(() => false)
const arrows = () => page.evaluate(() => { const b = id => { const r = document.getElementById(id).getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y)] }; return { prev: b('lullPrev'), next: b('lullNext'), month: document.querySelector('#lullCal .cal .hd b').textContent, step: document.getElementById('lullStep').textContent, h: Math.round(document.getElementById('lullCal').getBoundingClientRect().height) } })
/* press a day the way a person does: page the month with ‹ › until that day is
   in the grid AS a day of the shown month, then press it */
const monthsOpened = []
const day = async iso => {
  for (let i = 0; i < 24; i++) {
    const st = await page.evaluate(iso => { const m = document.querySelector('#lullCal .cal .hd b'); const c = document.querySelector(`#lullCal .day[data-iso="${iso}"]`); return { month: m && m.textContent, here: !!c && !c.classList.contains('out') } }, iso)
    if (i === 0) monthsOpened.push(st.month)
    if (st.here) break
    const want = new Date(iso + 'T00:00:00'), shown = new Date('1 ' + st.month)
    await page.click(want < shown ? '#lullPrev' : '#lullNext'); await sleep(150)
  }
  await page.locator(`#lullCal .day[data-iso="${iso}"]`).click(); await sleep(300)
}
const outside = async () => { await page.mouse.click(90, 470); await sleep(350) }   // empty chart, left — the backdrop covers it

/* ---- 1. + Set lull period → calendar; arrows only change month and hold still ---- */
await page.locator('#setLullBtn').scrollIntoViewIfNeeded()
const bPace = await paceCard(page)
await page.click('#setLullBtn'); await sleep(350)
L.ok('1.1 + Set lull period opens the calendar', await calOpen(), (await page.locator('#lullCal .lullhd').innerText()).replace(/\s+/g, ' '))
const a0 = await arrows()
await page.click('#lullNext'); await sleep(200)
const a1 = await arrows()
await page.click('#lullNext'); await sleep(200)
const a2 = await arrows()
await page.click('#lullPrev'); await sleep(200)
const a3 = await arrows()
L.note('1.2 arrows by month', JSON.stringify([a0, a1, a2, a3]))
L.ok('1.3 the month arrows only change month — no day is picked', /Pick the first day/.test(a3.step) && (await lullChips(page)).length === 0, a3.step)
L.ok('1.4 the ‹ › arrows do not move as the month changes (R115)', [a1, a2, a3].every(a => JSON.stringify(a.prev) === JSON.stringify(a0.prev) && JSON.stringify(a.next) === JSON.stringify(a0.next)), [a0, a1, a2, a3].map(a => a.month + ' ‹' + a.prev + ' ›' + a.next).join(' | '))
await shot(page, 'w2-05-cal-open')
/* first click = start (October 20) */
await day('2026-10-20')
const a4 = await arrows()
L.ok('1.5 first click sets the start ("Start 20/10/26 — now pick the last day.")', /Start 20\/10\/26/.test(a4.step), a4.step)
L.ok('1.6 …and the arrows are still where they were after that click', JSON.stringify(a4.prev) === JSON.stringify(a0.prev) && JSON.stringify(a4.next) === JSON.stringify(a0.next), `‹${a0.prev}→${a4.prev} ›${a0.next}→${a4.next} (box height ${a0.h}→${a4.h})`)
await shot(page, 'w2-05-cal-start-picked')
await day('2026-10-31')
L.ok('1.7 second click sets the end — it saves and closes', !(await calOpen()), 'calendar ' + ((await calOpen()) ? 'still open' : 'closed'))
let ch = await lullChips(page)
L.ok('1.8 the chip reads 20/10/26→31/10/26 — day first (R51, a 31st proves it)', ch.length === 1 && ch[0] === '20/10/26→31/10/26', JSON.stringify(ch))
await page.locator('.c-lull').scrollIntoViewIfNeeded()
await shot(page, 'w2-05-chip-31st', { el: '.c-lull' })
const aPace = await paceCard(page)
L.note('1.9 A\'s projected end before → after the lull', `${(bPace.text.match(/(\d\d\/\d\d\/\d\d) projected end/) || [])[1]} → ${(aPace.text.match(/(\d\d\/\d\d\/\d\d) projected end/) || [])[1]}`)

/* ---- 2. tap a chip → reopens to change; the arrows mid-selection ---- */
await page.locator('#lullChips .lullchip').first().click(); await sleep(350)
const hd2 = (await page.locator('#lullCal .lullhd').innerText().catch(() => '')).replace(/\s+/g, ' ')
const a5 = await arrows()
L.ok('2.1 tapping the chip reopens the calendar to CHANGE it, on the period\'s month', /Change lull period/.test(hd2) && /October 2026/.test(a5.month), hd2 + ' · ' + a5.month)
await day('2026-10-22'); await page.click('#lullNext'); await sleep(200)
const a6 = await arrows()
L.ok('2.2 a month arrow pressed between the two clicks keeps the start', /Start 22\/10\/26/.test(a6.step), a6.step + ' · ' + a6.month)
await day('2026-11-02')
ch = await lullChips(page)
L.ok('2.3 the period is changed, not added (22/10/26→02/11/26)', ch.length === 1 && ch[0] === '22/10/26→02/11/26', JSON.stringify(ch))

/* ---- 3. Escape / a press OUTSIDE close without saving half a period ---- */
await page.click('#setLullBtn'); await sleep(300)
await day('2026-09-28')
await page.keyboard.press('Escape'); await sleep(300)
ch = await lullChips(page)
L.ok('3.1 Escape after only the first click closes it and saves nothing', !(await calOpen()) && ch.length === 1, JSON.stringify(ch))
await page.click('#setLullBtn'); await sleep(300)
await day('2026-09-28')
await shot(page, 'w2-05-half-picked-before-outside')
await outside()
ch = await lullChips(page)
L.ok('3.2 a press OUTSIDE after only the first click closes it and saves nothing', !(await calOpen()) && ch.length === 1, JSON.stringify(ch))
await page.locator('#lullChips .lullchip').first().click(); await sleep(300)
await day('2026-12-01'); await outside()
ch = await lullChips(page)
L.ok('3.3 changing an existing period, half-picked then outside: the period is untouched', !(await calOpen()) && ch[0] === '22/10/26→02/11/26', JSON.stringify(ch))

/* ---- 4. the × on a chip — does it ask; can ↶ bring it back? ---- */
await page.click('#setLullBtn'); await sleep(300); await day('2026-12-07'); await day('2026-12-11')
await tapBall(page, 'ST-01'); await page.locator('#pop button', { hasText: 'DCO' }).click(); await sleep(450)   // something for ↶ to hold
ch = await lullChips(page)
L.note('4.0 two periods + a mark on ST-01', JSON.stringify(ch) + ' · ↶ ' + JSON.stringify((await undoState(page)).undo))
await page.locator('#lullChips .lullchip').nth(1).scrollIntoViewIfNeeded()
await page.locator('#lullChips .lullchip >> nth=1 >> .x').click(); await sleep(400)
const asked = await page.locator('#dlgModal').isVisible().catch(() => false)
ch = await lullChips(page)
const u4 = await undoState(page)
L.ok('4.1 the × on a lull chip asks before removing the period', asked, asked ? 'a question came up' : 'no question — gone at once: ' + JSON.stringify(ch))
L.note('4.2 ↶ after the × says', JSON.stringify(u4.undo))
await page.click('#trUndoBtn'); await sleep(500)
const ch4 = await lullChips(page)
const st01 = await page.evaluate(() => { const g = [...document.querySelectorAll('#flowSvg .ball')].find(x => x.dataset.id === 'ST-01'); return g ? [...g.querySelectorAll('path.wedge')].map(p => p.getAttribute('fill')) : null })
L.ok('4.3 ↶ brings the removed period back', ch4.length === 2, `periods ${JSON.stringify(ch4)} · what ↶ did instead: ST-01 wedges now ${JSON.stringify(st01)}`)
await page.locator('.c-lull').scrollIntoViewIfNeeded()
await shot(page, 'w2-05-after-x-and-undo')

/* ---- 5. ⧉ Copy to… (with select all?) replaces the others' periods ---- */
/* give B a period of their own first, and add a third student, typed */
await pickFrom(page, '#activeSel', /STUDENT B/)
const bPaceB0 = await paceCard(page)
L.ok('5.0 A lull belongs to ONE student: B has none of A\'s periods', (await lullChips(page)).length === 0, JSON.stringify(await lullChips(page)))
await page.locator('#setLullBtn').scrollIntoViewIfNeeded()
await page.click('#setLullBtn'); await sleep(300); await day('2026-09-29'); await day('2026-09-30')
L.note('5.1 B\'s own period', JSON.stringify(await lullChips(page)))
await page.locator('#addStu').scrollIntoViewIfNeeded(); await page.click('#addStu'); await sleep(300)
await dlg(page, { value: 'VISITOR' }); await sleep(700)
await pickFrom(page, '#activeSel', /STUDENT A/)
await page.locator('#copyLullBtn').scrollIntoViewIfNeeded()
await page.click('#copyLullBtn'); await sleep(350)
const copyUi = await page.evaluate(() => { const c = document.getElementById('lullCopy'); return c ? { text: c.innerText.replace(/\s+/g, ' '), boxes: [...c.querySelectorAll('input[type=checkbox]')].map(i => i.parentElement.textContent.trim()), buttons: [...c.querySelectorAll('button')].map(b => b.textContent.trim() + (b.disabled ? ' [disabled]' : '')) } : null })
L.ok('5.2 ⧉ Copy to… lists the other students with a tick each', copyUi && copyUi.boxes.length === 2, JSON.stringify(copyUi))
L.ok('5.3 …and a SELECT ALL (R53: "ticks other students (with select all)")', copyUi && (copyUi.boxes.some(b => /all/i.test(b)) || copyUi.buttons.some(b => /all/i.test(b))), 'boxes ' + JSON.stringify(copyUi && copyUi.boxes) + ' buttons ' + JSON.stringify(copyUi && copyUi.buttons))
await shot(page, 'w2-05-copy-to')
await page.locator('#lullCopy label', { hasText: 'STUDENT B' }).click(); await sleep(200)
await page.click('#lullCopyOk'); await sleep(500)
await pickFrom(page, '#activeSel', /STUDENT B/)
const bLulls = await lullChips(page)
L.ok('5.4 Copy REPLACES B\'s periods with a copy of A\'s', JSON.stringify(bLulls) === JSON.stringify(['22/10/26→02/11/26']), JSON.stringify(bLulls))
await pickFrom(page, '#activeSel', /VISITOR/)
L.ok('5.5 the unticked VISITOR is untouched', (await lullChips(page)).length === 0, JSON.stringify(await lullChips(page)))

/* ---- 6. Copy is disabled with one student ---- */
await page.click('#courseMenuBtn'); await page.waitForSelector('#addCourse', { state: 'visible' }); await page.click('#addCourse'); await sleep(250)
await dlg(page, { value: 'SOLO COURSE' }); await sleep(900)
await page.locator('#addStu').scrollIntoViewIfNeeded(); await page.click('#addStu'); await sleep(300)
await dlg(page, { value: 'SOLO' }); await sleep(800)
const cp = await page.evaluate(() => { const b = document.getElementById('copyLullBtn'); return b ? { disabled: b.disabled, title: b.title } : null })
L.ok('6.1 with one student, ⧉ Copy to… is disabled', cp && cp.disabled, JSON.stringify(cp))
await page.locator('.c-lull').scrollIntoViewIfNeeded()
await shot(page, 'w2-05-copy-disabled-one-student', { el: '.c-lull' })

L.note('9. the month the calendar showed when each pick began (it opens on the last month looked at)', JSON.stringify(monthsOpened))
save('w2-03-lulls', { rows: L.rows, errors })
console.log(`errors ${errors.length}: ${errors.slice(0, 6).join(' | ')}`)
await browser.close()
