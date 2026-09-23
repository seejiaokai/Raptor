/* [HUMAN-RETEST] Tracker — walker w2, walk 4: PACE and END DATES (R54,
   Astra #26), desktop, admin.

   Each student's own pace and two end dates, typed into the Pace card; the
   pace box emptied and retyped; a reload (F5) in the same browser; then what
   ↶ says and does right after a pace / end-date / lull change. */
import { open, shot, save, log, DESK } from './trk-lib.mjs'
import { sleep, tapBall, paceCard, typeDate, pickFrom, undoState, reloadBack, wedges, lullChips } from './trk-w2-lib.mjs'

const L = log()
const { browser, page, errors } = await open({ size: DESK, who: 'a' })
const proj = p => (p.text.match(/(\d\d\/\d\d\/\d\d) projected end/) || [])[1]
const req = p => [...p.text.matchAll(/([\d.]+ \/wk|—|past) req\. pace/g)].map(x => x[1])
async function setPace(v) {
  const box = page.locator('#epwIn'); await box.scrollIntoViewIfNeeded()
  await box.click({ clickCount: 3 }); await sleep(80)
  await page.keyboard.press('Backspace'); await sleep(250)
  const emptied = await box.inputValue()
  await page.keyboard.type(String(v), { delay: 60 }); await sleep(350)
  return { emptied, now: await box.inputValue() }
}

/* ---- 1. A's own pace and end dates ---- */
let A0 = await paceCard(page)
L.note('1.0 A at the start', JSON.stringify({ epw: A0.epw, a: A0.a, b: A0.b, proj: proj(A0) }))
const r1 = await setPace(3)
let A1 = await paceCard(page)
L.ok('1.1 the pace box can be EMPTIED (stays empty, no snap back) and retyped', r1.emptied === '' && r1.now === '3', JSON.stringify(r1))
L.ok('1.2 a new pace moves the projected end', proj(A1) !== proj(A0), `${proj(A0)} → ${proj(A1)}`)
await typeDate(page, '#targetIn', '2026-12-15'); await typeDate(page, '#targetIn2', '2027-01-31')
A1 = await paceCard(page)
L.ok('1.3 End date A and B take typed days and each shows its req. pace', A1.a === '2026-12-15' && A1.b === '2027-01-31' && req(A1).every(x => x !== '—'), JSON.stringify({ a: A1.a, b: A1.b, req: req(A1) }))
await page.locator('.c-pace').scrollIntoViewIfNeeded()
await shot(page, 'w2-06-A-pace', { el: '.c-pace' })

/* ---- 2. B has their own ---- */
await pickFrom(page, '#activeSel', /STUDENT B/)
let B0 = await paceCard(page)
L.ok('2.1 B does not inherit A\'s pace or dates', B0.epw !== '3' && !B0.a && !B0.b, JSON.stringify({ epw: B0.epw, a: B0.a, b: B0.b }))
await setPace(1.5); await typeDate(page, '#targetIn', '2027-03-01')
let B1 = await paceCard(page)
L.note('2.2 B set', JSON.stringify({ epw: B1.epw, a: B1.a, b: B1.b, proj: proj(B1), req: req(B1) }))
await pickFrom(page, '#activeSel', /STUDENT A/)
let A2 = await paceCard(page)
L.ok('2.3 back on A: A\'s own values are still there', A2.epw === '3' && A2.a === '2026-12-15' && A2.b === '2027-01-31', JSON.stringify({ epw: A2.epw, a: A2.a, b: A2.b }))

/* ---- 3. a reload keeps both ---- */
await reloadBack(page, 'a')
const who = await page.locator('#activeSel option:checked').innerText()
L.note('3.0 after the reload the Crew picker is on', who)
await pickFrom(page, '#activeSel', /STUDENT A/)
const A3 = await paceCard(page)
await pickFrom(page, '#activeSel', /STUDENT B/)
const B3 = await paceCard(page)
L.ok('3.1 after a reload A keeps 3 /wk, 15/12/26, 31/01/27', A3.epw === '3' && A3.a === '2026-12-15' && A3.b === '2027-01-31', JSON.stringify({ epw: A3.epw, a: A3.a, b: A3.b }))
L.ok('3.2 after a reload B keeps 1.5 /wk, 01/03/27', B3.epw === '1.5' && B3.a === '2027-03-01', JSON.stringify({ epw: B3.epw, a: B3.a, b: B3.b }))
await page.locator('.c-pace').scrollIntoViewIfNeeded()
await shot(page, 'w2-06-B-after-reload', { el: '.c-pace' })

/* ---- 4. ↶ right after a pace / end-date / lull change ---- */
await pickFrom(page, '#activeSel', /STUDENT A/)
await tapBall(page, 'ST-01'); await page.locator('#pop button', { hasText: 'DCO' }).click(); await sleep(450)
await tapBall(page, 'ACG-01'); await page.locator('#pop button', { hasText: 'DCO' }).click(); await sleep(450)
L.note('4.0 two marks made (ST-01, ACG-01); ↶ says', JSON.stringify((await undoState(page)).undo))
await setPace(4)
const u1 = await undoState(page)
L.ok('4.1 after changing the pace, ↶ does NOT claim to undo the pace', !/pace/i.test(u1.undo.t), 'tooltip: "' + u1.undo.t + '"')
await page.mouse.click(300, 300); await sleep(200)                 // focus back on the chart, as a person would before Ctrl+Z
await page.keyboard.press('Control+z'); await sleep(500)
const p4 = await paceCard(page)
const acg = await wedges(page, 'ACG-01')
const stat = await page.locator('#saveStat').innerText().catch(() => '')
L.note('4.2 Ctrl+Z pressed right after the pace change: the pace / ACG-01 / the status line', JSON.stringify({ pace: p4.epw, acg01: acg, status: stat }))
L.ok('4.3 …the pace change is NOT taken back, and a mark made BEFORE it is (ACG-01 → not done), with no word on screen', p4.epw === '4' && acg[0] === '#ffffff', JSON.stringify({ pace: p4.epw, acg01: acg[0], status: stat }))
await shot(page, 'w2-06-ctrlz-after-pace')
await typeDate(page, '#targetIn', '2026-11-30')
const u2 = await undoState(page)
L.note('4.4 after changing End date A, ↶ says', '"' + u2.undo.t + '"')
await page.click('#trUndoBtn'); await sleep(500)
const p5 = await paceCard(page)
L.ok('4.5 ↶ leaves End date A as typed and takes back the ST-01 mark instead (as its tooltip said)', p5.a === '2026-11-30' && (await wedges(page, 'ST-01'))[0] === '#ffffff', JSON.stringify({ a: p5.a, st01: (await wedges(page, 'ST-01'))[0] }))
await page.locator('#setLullBtn').scrollIntoViewIfNeeded()
await page.click('#setLullBtn'); await sleep(300)
const days = await page.evaluate(() => [...document.querySelectorAll('#lullCal .day:not(.out)')].slice(10, 12).map(d => d.dataset.iso))
for (const d of days) { await page.locator(`#lullCal .day[data-iso="${d}"]`).click(); await sleep(300) }
const u3 = await undoState(page)
L.ok('4.6 after adding a lull, ↶ does not claim it (nothing left to undo — greyed)', u3.undo.off, JSON.stringify(u3.undo) + ' lulls ' + JSON.stringify(await lullChips(page)))
await page.locator('.c-pace').scrollIntoViewIfNeeded()
await shot(page, 'w2-06-undo-after-pace-lull')

save('w2-04-pace', { rows: L.rows, errors })
console.log(`errors ${errors.length}: ${errors.slice(0, 6).join(' | ')}`)
await browser.close()
