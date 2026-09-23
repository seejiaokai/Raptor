/* [HUMAN-RETEST] Tracker — walker w2, walk 2: DONE DATES and LAST FLOWN
   (R47, R50, Fable #40) and the day-first date rule (R51), desktop, admin.

   The flights on the 2026 chart sit far down it (TR-1(P), TR-2 …); each is
   brought into view by scrolling the chart, then pressed on its centre. The
   "Done on" box is typed into; the grades are the pop-up's own buttons. What
   the Currency card SHOWS is read off its boxes; what is STORED is read with
   the Export's own collector (read-only) to check the screen. */
import { open, shot, save, log, DESK } from './trk-lib.mjs'
import { sleep, tapBall, popOpen, popTitle, popFails, currency, typeDate, stored, centreOf } from './trk-w2-lib.mjs'

const L = log()
const { browser, page, errors } = await open({ size: DESK, who: 'a' })
const aId = await page.locator('#activeSel').inputValue()
const markOf = async id => {
  const st = await stored(page); const c = Object.values(st.byCourse)[0]
  for (const b of Object.values(c.bySyllabus || {})) { const m = ((b.marks || {})[aId] || {})[id]; if (m) return m }
  return null
}
const grade = async (id, label) => { await page.locator('#pop button', { hasText: new RegExp('^\\s*' + label + '\\s*$') }).first().click(); await sleep(500) }
const cur0 = await currency(page)
L.note('0. Currency card at the start', JSON.stringify(cur0))

/* ---- 1. DCO lands dated "Done on" (today by default); a flight's day is Last Flown ---- */
await tapBall(page, 'TR-2')
let pf = await popFails(page)
L.ok('1.1 TR-2 pop-up: "Done on (when marked) — sets Last Flown", box = today', /when marked/.test(pf.caption) && /sets Last Flown/.test(pf.caption) && pf.doneOn === '2026-09-23', JSON.stringify({ t: await popTitle(page), cap: pf.caption, box: pf.doneOn }))
await grade('TR-2', 'DCO')
let m = await markOf('TR-2'); let cur = await currency(page)
L.ok('1.2 DCO lands dated today (23/09/26)', m && m.g === 'dco' && m.d === '2026-09-23', JSON.stringify(m))
L.ok('1.3 …and both Last Flown boxes read today', cur.lastSyll === '2026-09-23' && cur.lastCurr === '2026-09-23', JSON.stringify(cur))
await page.locator('.c-curr').scrollIntoViewIfNeeded()
await shot(page, 'w2-02-tr2-dco-lastflown', { el: '.c-curr' })

/* ---- 2. change the box AFTER → the mark is re-dated. Does Last Flown follow the flight back? ---- */
await tapBall(page, 'TR-2')
pf = await popFails(page)
L.ok('2.1 reopened: caption now "Done on — sets Last Flown", box holds the mark\'s day', /^Done on — sets Last Flown/.test(pf.caption) && pf.doneOn === '2026-09-23', JSON.stringify({ cap: pf.caption, box: pf.doneOn }))
const b21 = await typeDate(page, '#popDoneDate', '2026-09-21')
await sleep(300)
m = await markOf('TR-2'); cur = await currency(page)
L.ok('2.2 changing the box after re-dates the mark (21/09/26)', b21 === '2026-09-21' && m.d === '2026-09-21', JSON.stringify(m))
L.ok('2.3 Last Flown follows TR-2 back to 21/09 — the only flight now happened on the 21st (R47: "a flight\'s day is its Last Flown")', cur.lastSyll === '2026-09-21' && cur.lastCurr === '2026-09-21', 'Last Flown (Syllabus) ' + cur.lastSyll + ' · (Currency) ' + cur.lastCurr + ' · ' + JSON.stringify(cur.kv))
await shot(page, 'w2-02-tr2-redated-back')
await page.keyboard.press('Escape'); await sleep(250)

/* ---- 3. an OLDER flight after a newer one: Last Flown does not go back ---- */
const lf0 = (await currency(page)).lastSyll
await tapBall(page, 'TR-3')
const b15 = await typeDate(page, '#popDoneDate', '2026-09-15')
L.ok('3.1 before a grade the box only sets the day the grade will carry (nothing marked yet)', b15 === '2026-09-15' && !(await markOf('TR-3')), 'box=' + b15 + ' mark=' + JSON.stringify(await markOf('TR-3')))
await grade('TR-3', 'DCO')
m = await markOf('TR-3'); cur = await currency(page)
L.ok('3.2 DCO lands dated the CHANGED day (15/09/26)', m && m.d === '2026-09-15', JSON.stringify(m))
L.ok('3.3 marking the older flight does NOT drag Last Flown back', cur.lastSyll === lf0 && cur.lastCurr === lf0, `was ${lf0}, now ${cur.lastSyll} / ${cur.lastCurr}`)

/* ---- 4. a later one moves it ---- */
await tapBall(page, 'TR-4')
await typeDate(page, '#popDoneDate', '2026-09-24')
await grade('TR-4', 'DCO')
m = await markOf('TR-4'); cur = await currency(page)
L.ok('4.1 a later flight (24/09) moves Last Flown forward', m && m.d === '2026-09-24' && cur.lastSyll === '2026-09-24' && cur.lastCurr === '2026-09-24', JSON.stringify({ m, cur: [cur.lastSyll, cur.lastCurr] }))

/* ---- 5. DPCO and Marginal land dated too ---- */
await tapBall(page, 'TR-5(P)')
await typeDate(page, '#popDoneDate', '2026-09-22')
await grade('TR-5(P)', 'DPCO')
m = await markOf('TR-5(P)')
L.ok('5.1 DPCO lands dated the box\'s day (22/09/26)', m && m.g === 'dpco' && m.d === '2026-09-22', JSON.stringify(m))
await tapBall(page, 'TR-1(P)')
await grade('TR-1(P)', 'Marginal')
m = await markOf('TR-1(P)')
L.ok('5.2 Marginal lands dated today', m && m.g === 'marg' && m.d === '2026-09-23', JSON.stringify(m))

/* ---- 6. Not done / N.A. drop the day ---- */
await tapBall(page, 'TR-3')
await grade('TR-3', 'Not done')
m = await markOf('TR-3')
L.ok('6.1 Not done drops TR-3\'s day', !m || (!m.d && (m.g === 0 || m.g === '0')), JSON.stringify(m))
await tapBall(page, 'TR-3')
pf = await popFails(page)
L.ok('6.2 reopened, TR-3 reads "Done on (when marked)" with today in the box', /when marked/.test(pf.caption) && pf.doneOn === '2026-09-23', JSON.stringify({ cap: pf.caption, box: pf.doneOn }))
await page.keyboard.press('Escape'); await sleep(200)
await tapBall(page, 'TR-4')
await grade('TR-4', 'N.A.')
m = await markOf('TR-4'); cur = await currency(page)
L.ok('6.3 N.A. drops TR-4\'s day', m && m.g === 'na' && !m.d, JSON.stringify(m))
L.ok('6.4 with TR-4 (the 24/09 flight) no longer flown, Last Flown no longer claims 24/09', cur.lastSyll !== '2026-09-24', 'Last Flown (Syllabus) ' + cur.lastSyll + ' · (Currency) ' + cur.lastCurr + ' — flights still marked done: TR-2 21/09, TR-5(P) 22/09, TR-1(P) 23/09')
await page.locator('.c-curr').scrollIntoViewIfNeeded()
await shot(page, 'w2-02-after-na-lastflown')

/* ---- 7. the details bubble: the mark's day, day first (R51) ---- */
await page.click('#detailsBtn'); await sleep(250)
for (const id of ['TR-5(P)', 'TR-2']) {
  const { reveal } = await import('./trk-lib.mjs'); await reveal(page, id)
  const c = await centreOf(page, id); await page.mouse.move(c.x, c.y); await sleep(120); await page.mouse.move(c.x + 1, c.y + 1); await sleep(400)
  const bub = await page.evaluate(() => { const b = document.getElementById('detailBubble'); return b && b.style.display !== 'none' ? b.innerText.replace(/\s+/g, ' ') : '(no bubble)' })
  L.ok(`7. Details bubble on ${id} gives the mark's day, dd/mm/yy`, /on \d\d\/\d\d\/\d\d/.test(bub), bub)
  if (id === 'TR-5(P)') await shot(page, 'w2-03-details-bubble-day')
}
await page.click('#detailsBtn'); await sleep(250)
/* the lines the Currency card writes itself (days since …) */
L.note('8. the Currency card\'s own lines', JSON.stringify((await currency(page)).kv))
save('w2-02-dates', { rows: L.rows, errors })
console.log(`errors ${errors.length}: ${errors.slice(0, 6).join(' | ')}`)
await browser.close()
