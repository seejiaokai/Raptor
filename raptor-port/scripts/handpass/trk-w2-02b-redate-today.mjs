/* [HUMAN-RETEST] Tracker — walker w2, walk 2b: re-typing a done flight's
   "Done on" day — does Last Flown jump to TODAY on the way? (found in walk 6b)

   A listener RECORDS the values the date box passes through while a person
   types (observation only — it sets nothing). */
import { open, shot, save, log, DESK } from './trk-lib.mjs'
import { sleep, tapBall, currency, typeDate, stored, popFails } from './trk-w2-lib.mjs'

const L = log()
const { browser, page, errors } = await open({ size: DESK, who: 'a' })
const aId = await page.locator('#activeSel').inputValue()
const markOf = async id => { const st = await stored(page); const c = Object.values(st.byCourse)[0]; for (const b of Object.values(c.bySyllabus || {})) { const m = ((b.marks || {})[aId] || {})[id]; if (m) return m } return null }
const grade = async label => { await page.locator('#pop button', { hasText: new RegExp('^\\s*' + label + '\\s*$') }).first().click(); await sleep(500) }

/* TR-2 flown on 15/09 (typed BEFORE the grade, so nothing is saved mid-typing) */
await tapBall(page, 'TR-2')
await typeDate(page, '#popDoneDate', '2026-09-15'); await grade('DCO')
L.note('1. TR-2 DCO on 15/09', JSON.stringify({ mark: await markOf('TR-2'), last: (await currency(page)).lastSyll }))
/* reopen and RE-TYPE the day as 17/09 — a later day, still before today */
await tapBall(page, 'TR-2')
await page.evaluate(() => { window.__w2seen = []; document.getElementById('popDoneDate').addEventListener('input', e => window.__w2seen.push(e.target.value)) })
await typeDate(page, '#popDoneDate', '2026-09-17', { delay: 90 })
const seen = await page.evaluate(() => window.__w2seen)
const m = await markOf('TR-2'); const cur = await currency(page)
L.note('2. the values the box passed through while "17092026" was typed', JSON.stringify(seen))
L.ok('3. the mark ends on the typed day (17/09)', m.d === '2026-09-17', JSON.stringify(m))
L.ok('4. Last Flown ends on 17/09 — the flight\'s day — not on TODAY (23/09)', cur.lastSyll === '2026-09-17' && cur.lastCurr === '2026-09-17', `Last Flown (Syllabus) ${cur.lastSyll} · (Currency) ${cur.lastCurr} · ${JSON.stringify(cur.kv)}`)
await shot(page, 'w2-02b-retyped-day-lastflown-today')
await page.keyboard.press('Escape'); await sleep(200)
await page.locator('.c-curr').scrollIntoViewIfNeeded()
await shot(page, 'w2-02b-currency-card-says-today', { el: '.c-curr' })
await page.keyboard.press('Escape'); await sleep(200)
/* the same, typing a day whose month has no leading zero (a November day) */
await tapBall(page, 'TR-3')
await typeDate(page, '#popDoneDate', '2026-09-10'); await grade('DCO')
L.note('5. TR-3 DCO on 10/09 → Last Flown', (await currency(page)).lastSyll)
save('w2-02b-redate-today', { rows: L.rows, errors })
console.log(`errors ${errors.length}: ${errors.slice(0, 6).join(' | ')}`)
await browser.close()
