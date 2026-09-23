/* [HUMAN-RETEST] Tracker — walker w2, walk 1: FAILURES (R42–R46, R48) and the
   N.A. refusal (R52, Fable #8A), on a fresh browser, desktop 1440x900, admin.

   Everything by the app's own controls: a press on the ball's centre opens the
   grading pop-up; the + / − and the "Failed on" box are pressed / typed; the
   Failures card's chips are hovered; its title is pressed; the full list's date
   boxes are typed into; the Crew dropdown is pressed then chosen. */
import { open, shot, save, log, DESK } from './trk-lib.mjs'
import { sleep, tapBall, popOpen, popTitle, popFails, failCard, ticks, wedges, typeDate, clearDate, pickFrom, visibleText, stored } from './trk-w2-lib.mjs'

const L = log()
const { browser, page, errors } = await open({ size: DESK, who: 'a' })
const names = await page.evaluate(() => [...document.querySelectorAll('#activeSel option')].map(o => o.textContent))
L.note('roster', names.join(', ') + ' · crew picked: ' + await page.locator('#activeSel option:checked').innerText())

/* ---- 1. + records on the "Failed on" day; change it before the second + ---- */
await tapBall(page, 'ST-02')
L.ok('1.0 a press on ST-02 opens the grading pop-up', await popOpen(page), await popTitle(page))
let pf = await popFails(page)
L.ok('1.1 "Failed on" starts at today (23 Sep 26)', pf.failOn === '2026-09-23', JSON.stringify(pf))
await page.click('#popFailPlus'); await sleep(400)
pf = await popFails(page)
L.ok('1.2 + records one failure, dated today, listed under the counter', pf.count === '1' && pf.list.length === 1 && /ST-02 23\/09\/26/.test(pf.list[0]), JSON.stringify(pf))
const v = await typeDate(page, '#popFailDate', '2026-09-10')
L.ok('1.3 the "Failed on" box takes a typed day (10/09/2026) and the pop-up stays open', v === '2026-09-10' && await popOpen(page), 'box=' + v)
await page.click('#popFailPlus'); await sleep(400)
pf = await popFails(page)
L.ok('1.4 the second + lands on the CHANGED day: ST-02 23/09/26, ST-02X 10/09/26', pf.count === '2' && /ST-02 23\/09\/26/.test(pf.list[0] || '') && /ST-02X 10\/09\/26/.test(pf.list[1] || ''), JSON.stringify(pf.list))
await shot(page, 'w2-01-pop-two-fails')
L.ok('1.5 the ball wears two red ticks', await ticks(page, 'ST-02') === 2, 'ticks=' + await ticks(page, 'ST-02'))
/* − : which one does it take back — the one recorded LAST (10/09) or the one with the LATEST day (23/09)? */
await page.click('#popFailMinus'); await sleep(400)
pf = await popFails(page)
L.note('1.6 − with two failures [23/09 recorded first, 10/09 recorded second] leaves', JSON.stringify(pf.list) + ' (count ' + pf.count + ')')
L.ok('1.6a − takes one failure back (count 2 → 1)', pf.count === '1', pf.count)
/* put the second back, on 10/09 again (the box still says 10/09) */
await page.click('#popFailPlus'); await sleep(400)
pf = await popFails(page)
L.ok('1.7 + again (box still 10/09) → two failures', pf.count === '2', JSON.stringify(pf.list))
await page.keyboard.press('Escape'); await sleep(250)
L.ok('1.8 Escape closes the pop-up', !(await popOpen(page)))

/* a second event with one failure, so "worst event first" can be seen */
await tapBall(page, 'ACG-01')
await page.click('#popFailPlus'); await sleep(400)
L.note('1.9 ACG-01 +1', JSON.stringify(await popFails(page)))
await page.keyboard.press('Escape'); await sleep(250)

/* ---- 2. the Failures card ---- */
let fc = await failCard(page)
L.ok('2.1 one chip per failure, worst event first: ST-02, ST-02X, ACG-01', JSON.stringify(fc.chips.map(c => c.t)) === JSON.stringify(['ST-02', 'ST-02X', 'ACG-01']), JSON.stringify(fc.chips.map(c => c.t)))
L.ok('2.2 the total counts FAILURES (3), not events (2)', /3 fails/.test(fc.total), fc.total + ' · heading "' + fc.head + '"')
await page.locator('#failsCard').scrollIntoViewIfNeeded()
await shot(page, 'w2-01-failcard', { el: '#failsCard' })
/* hover a chip → its day */
const chip2 = page.locator('#failChips .failchip').nth(1)
await chip2.hover(); await sleep(350)
const bub = await page.evaluate(() => { const b = document.getElementById('detailBubble'); return b && b.style.display !== 'none' ? b.innerText.replace(/\s+/g, ' ') : '(no bubble)' })
L.ok('2.3 hovering ST-02X shows its day in a bubble (10/09/26)', /10\/09\/26/.test(bub) && /ST-02X/.test(bub), bub)
await shot(page, 'w2-01-chip-hover')
await page.mouse.move(700, 450); await sleep(250)

/* ---- 3. the Failures title → the full list ---- */
await page.locator('#failTitle').click(); await sleep(400)
const logOpen = await page.locator('#failLog').isVisible().catch(() => false)
const rows = await page.evaluate(() => [...document.querySelectorAll('#failLog .frow')].map(r => ({ chip: r.querySelector('.failchip').textContent, d: r.querySelector('input').value, t: r.innerText.replace(/\s+/g, ' ').trim() })))
L.ok('3.1 the Failures title opens the full list, one row + date box per failure', logOpen && rows.length === 3, JSON.stringify(rows))
await shot(page, 'w2-01-faillog')
/* re-date ST-02X (row 2) to 12/09/2026 */
const v2 = await typeDate(page, '#failLog .frow >> nth=1 >> input', '2026-09-12')
await sleep(300)
fc = await failCard(page)
L.ok('3.2 re-dating ST-02X in the list re-dates its chip (12/09/26)', v2 === '2026-09-12' && /12\/09\/26/.test((fc.chips.find(c => c.t === 'ST-02X') || {}).title || ''), 'box=' + v2 + ' chip title="' + ((fc.chips.find(c => c.t === 'ST-02X') || {}).title) + '"')
/* empty the ACG-01 box → undated, not deleted */
const v3 = await clearDate(page, '#failLog .frow >> nth=2 >> input')
await sleep(300)
fc = await failCard(page)
const rows2 = await page.evaluate(() => [...document.querySelectorAll('#failLog .frow')].map(r => r.querySelector('.failchip').textContent + '=' + (r.querySelector('input').value || '(empty)')))
L.ok('3.3 an emptied box leaves the failure UNDATED, not deleted (3 rows, 3 chips, ACG-01 "date not recorded")', v3 === '' && rows2.length === 3 && fc.chips.length === 3 && /date not recorded/.test((fc.chips.find(c => c.t === 'ACG-01') || {}).title || ''), 'box="' + v3 + '" rows ' + JSON.stringify(rows2) + ' chip "' + ((fc.chips.find(c => c.t === 'ACG-01') || {}).title) + '"')
await shot(page, 'w2-01-faillog-after')
await page.keyboard.press('Escape'); await sleep(300)
L.ok('3.4 Escape closes the full list', !(await page.locator('#failLog').isVisible().catch(() => false)))
const st1 = await stored(page)
const aId = await page.locator('#activeSel').inputValue()
const aRec = st1 && Object.values(st1.byCourse)[0]
L.note('3.5 what is stored for STUDENT A (read-only)', JSON.stringify(Object.values((aRec || {}).bySyllabus || {}).map(b => (b.marks || {})[aId])).slice(0, 400))
/* the pop-up's own list follows the re-date */
await tapBall(page, 'ST-02')
pf = await popFails(page)
L.ok('3.6 the ST-02 pop-up list reads the re-dated day (ST-02X 12/09/26)', /ST-02X 12\/09\/26/.test(pf.list.join('|')), JSON.stringify(pf.list))
await page.keyboard.press('Escape'); await sleep(250)

/* ---- 4. another student's card shows THEIR record ---- */
await pickFrom(page, '#activeSel', /STUDENT B/)
fc = await failCard(page)
L.ok('4.1 picking STUDENT B: the Failures card is B\'s (none)', fc.none && !fc.chips.length && /STUDENT B/.test(fc.head), fc.head + ' · ' + JSON.stringify(fc.chips.map(c => c.t)))
await tapBall(page, 'ACG-02')
L.note('4.2 pop-up now titled', await popTitle(page))
await page.click('#popFailPlus'); await sleep(400)
await page.keyboard.press('Escape'); await sleep(250)
fc = await failCard(page)
L.ok('4.3 B\'s card shows only B\'s failure (ACG-02, 1 fail)', JSON.stringify(fc.chips.map(c => c.t)) === '["ACG-02"]' && /1 fail\b/.test(fc.total), JSON.stringify(fc.chips.map(c => c.t)) + ' ' + fc.total)
await page.locator('#failsCard').scrollIntoViewIfNeeded()
await shot(page, 'w2-01-B-card', { el: '#failsCard' })
await page.locator('#failChips .failchip').first().hover(); await sleep(350)
const bubB = await page.evaluate(() => { const b = document.getElementById('detailBubble'); return b && b.style.display !== 'none' ? b.innerText.replace(/\s+/g, ' ') : '(no bubble)' })
L.ok('4.4 B\'s chip bubble names B and B\'s day', /STUDENT B/.test(bubB) && /23\/09\/26/.test(bubB), bubB)
await page.mouse.move(700, 450); await sleep(200)
await page.locator('#failTitle').click(); await sleep(350)
const logHead = await page.locator('#failLog .lullhd').innerText().catch(() => '')
const logRowsB = await page.evaluate(() => [...document.querySelectorAll('#failLog .frow')].map(r => r.querySelector('.failchip').textContent))
L.ok('4.5 B\'s full list is B\'s', /STUDENT B/.test(logHead) && JSON.stringify(logRowsB) === '["ACG-02"]', logHead.replace(/\s+/g, ' ') + ' ' + JSON.stringify(logRowsB))
await page.keyboard.press('Escape'); await sleep(250)
await pickFrom(page, '#activeSel', /STUDENT A/)
fc = await failCard(page)
L.ok('4.6 back to A: A\'s record is back (ST-02, ST-02X, ACG-01)', JSON.stringify(fc.chips.map(c => c.t)) === JSON.stringify(['ST-02', 'ST-02X', 'ACG-01']), JSON.stringify(fc.chips.map(c => c.t)))

/* ---- 5. N.A. — ticks hidden, + refused with a message (is it VISIBLE?) ---- */
await tapBall(page, 'ST-02')
await page.locator('#pop button', { hasText: 'N.A.' }).click(); await sleep(450)
L.ok('5.1 ST-02 marked N.A.: no red ticks while N.A.', await ticks(page, 'ST-02') === 0, 'ticks=' + await ticks(page, 'ST-02') + ' wedges ' + JSON.stringify(await wedges(page, 'ST-02')))
await shot(page, 'w2-04-na-no-ticks')
fc = await failCard(page)
L.note('5.2 the Failures card while ST-02 is N.A.', JSON.stringify(fc.chips.map(c => c.t)) + ' ' + fc.total)
await page.locator('#failsCard').scrollIntoViewIfNeeded()
await shot(page, 'w2-04-na-card-still-counts', { el: '#failsCard' })
await tapBall(page, 'ST-02')
const before = await popFails(page)
await page.click('#popFailPlus'); await sleep(250)
await shot(page, 'w2-04-na-plus-pressed')
const after = await popFails(page)
const where = await visibleText(page, 'cannot be failed')
const hint = await page.evaluate(() => { const h = document.getElementById('arrhint'); return h ? { text: h.textContent, display: getComputedStyle(h).display } : null })
L.ok('5.3 + on an N.A. event is refused (count unchanged)', before.count === after.count, `count ${before.count} → ${after.count}`)
L.ok('5.4 …and its refusal "“ST-02” is marked N.A., so it cannot be failed." is VISIBLE somewhere on screen', where.some(w => w.visible), 'found: ' + JSON.stringify(where) + ' · the hint line: ' + JSON.stringify(hint))
await sleep(1900)
L.note('5.5 two seconds later the hint line holds', JSON.stringify(await page.evaluate(() => { const h = document.getElementById('arrhint'); return h ? h.textContent : null })))
/* back to Marginal → ticks return */
await page.locator('#pop button', { hasText: 'Marginal' }).click(); await sleep(450)
L.ok('5.6 back to Marginal → the two ticks return', await ticks(page, 'ST-02') === 2, 'ticks=' + await ticks(page, 'ST-02') + ' wedges ' + JSON.stringify(await wedges(page, 'ST-02')))
await shot(page, 'w2-04-marg-ticks-back')

save('w2-01-failures', { rows: L.rows, errors })
console.log(`errors ${errors.length}: ${errors.slice(0, 6).join(' | ')}`)
await browser.close()
