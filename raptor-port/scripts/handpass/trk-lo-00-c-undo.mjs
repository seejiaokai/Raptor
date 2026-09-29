/* [TRK-LEFTOVERS] baseline — undo: D (Ctrl+Z right after a pace / End date /
   lull change — does it silently take back an OLDER mark? w2 N3) and E (a date
   typed SLOWLY — over two seconds between the year's digits — into Last Flown
   (Syllabus), Last Flown (Currency), the down-days box and Upchit, then ↶ once:
   a half-typed year on screen? saved? w2 N4; and the grading pop-up's "Done
   on", already fixed — confirm). Desktop 1440x900, admin, a fresh browser.
   Adapted from trk-w2-04-pace.mjs and trk-w2-06-undo-a.mjs. The store is read
   (browser storage) only to CHECK what was saved. */
import { open, shot, save, log, storageDump, DESK } from './trk-lib.mjs'
import { sleep, tapBall, popOpen, popFails, paceCard, typeDate, undoState, stackDepth, wedges, lullChips, currency } from './trk-w2-lib.mjs'

const L = log()
const { browser, page, errors } = await open({ size: DESK, who: 'a' })
const sid = await page.locator('#activeSel').inputValue()
const grade = async label => { await page.locator('#pop button', { hasText: new RegExp('^\\s*' + label + '\\s*$') }).first().click(); await sleep(500) }
/* an empty point on the chart (the svg itself, no ball, no line) — where a
   person clicks to put the keyboard's focus back on the chart */
async function clickEmpty() {
  const p = await page.evaluate(() => {
    const b = document.getElementById('board').getBoundingClientRect()
    for (let fy = 0.15; fy < 0.9; fy += 0.05) for (let fx = 0.05; fx < 0.95; fx += 0.04) {
      const x = b.left + b.width * fx, y = b.top + b.height * fy, el = document.elementFromPoint(x, y)
      if (el && (el.id === 'flowSvg' || el.id === 'board' || (el.tagName.toLowerCase() === 'rect' && el.closest('#flowSvg') && !el.closest('.ball')))) return { x, y }
    }
    return null
  })
  await page.mouse.click(p.x, p.y); await sleep(200)
}
const marksNow = async () => ({ 'ST-01': (await wedges(page, 'ST-01'))[0], 'ACG-01': (await wedges(page, 'ACG-01'))[0], 'ST-02': (await wedges(page, 'ST-02'))[0] })
const stat = () => page.locator('#saveStat').innerText().catch(() => '')
const datesStored = async () => { const d = await storageDump(page); const k = Object.keys(d).find(k => k.endsWith(':d:' + sid)); try { return k ? JSON.parse(d[k]) : null } catch { return d[k] } }
const marksStored = async () => { const d = await storageDump(page); const k = Object.keys(d).find(k => k.endsWith(':m:' + sid)); try { return k ? JSON.parse(d[k]) : null } catch { return d[k] } }

/* three marks, so ↶ has older steps to take */
for (const id of ['ST-01', 'ACG-01', 'ST-02']) { await tapBall(page, id); await grade('DCO'); await page.keyboard.press('Escape').catch(() => {}); await sleep(150) }
L.note('D.0 three marks made (ST-01, ACG-01, ST-02 DCO); ↶ says', JSON.stringify((await undoState(page)).undo) + ' · ' + JSON.stringify(await marksNow()))

/* D1. the pace box */
{ const box = page.locator('#epwIn'); await box.scrollIntoViewIfNeeded(); await box.click({ clickCount: 3 }); await page.keyboard.press('Backspace'); await page.keyboard.type('4', { delay: 60 }); await sleep(400) }
const u1 = await undoState(page)
L.note('D1.1 pace changed to 4: ↶ tooltip just before Ctrl+Z', '"' + u1.undo.t + '"')
await clickEmpty(); await page.keyboard.press('Control+z'); await sleep(600)
const m1 = await marksNow(), p1 = await paceCard(page)
L.note('D1.2 Ctrl+Z on the chart right after the pace change', JSON.stringify({ pace: p1.epw, marks: m1, status: await stat() }))
L.ok('D1.3 Ctrl+Z does NOT silently take back an older mark after a pace change', m1['ST-02'] === '#000000', JSON.stringify({ pace: p1.epw, 'ST-02': m1['ST-02'], status: await stat() }))
await shot(page, 'lo-D-1-ctrlz-after-pace')

/* D2. End date A */
await typeDate(page, '#targetIn', '2026-12-15'); await sleep(300)
const u2 = await undoState(page)
L.note('D2.1 End date A typed (15/12/2026): ↶ tooltip just before Ctrl+Z', '"' + u2.undo.t + '"')
await clickEmpty(); await page.keyboard.press('Control+z'); await sleep(600)
const m2 = await marksNow(), p2 = await paceCard(page)
L.note('D2.2 Ctrl+Z right after the End date change', JSON.stringify({ endA: p2.a, marks: m2, status: await stat() }))
L.ok('D2.3 Ctrl+Z does NOT silently take back an older mark after an End date change', JSON.stringify(m2) === JSON.stringify(m1), JSON.stringify({ endA: p2.a, marksBefore: m1, marksAfter: m2 }))
await shot(page, 'lo-D-2-ctrlz-after-enddate')

/* D3. a lull period */
await page.locator('#setLullBtn').scrollIntoViewIfNeeded(); await page.click('#setLullBtn'); await sleep(300)
const days = await page.evaluate(() => [...document.querySelectorAll('#lullCal .day:not(.out)')].slice(10, 12).map(d => d.dataset.iso))
for (const d of days) { await page.locator(`#lullCal .day[data-iso="${d}"]`).click(); await sleep(300) }
const u3 = await undoState(page)
L.note('D3.1 lull period added (' + days.join('→') + '): ↶ tooltip just before Ctrl+Z', '"' + u3.undo.t + '" (greyed ' + u3.undo.off + ') · lulls ' + JSON.stringify(await lullChips(page)))
await clickEmpty(); await page.keyboard.press('Control+z'); await sleep(600)
const m3 = await marksNow()
L.note('D3.2 Ctrl+Z right after the lull period', JSON.stringify({ lulls: await lullChips(page), marks: m3, status: await stat() }))
L.ok('D3.3 Ctrl+Z does NOT silently take back an older mark after a lull period', JSON.stringify(m3) === JSON.stringify(m2), JSON.stringify({ marksBefore: m2, marksAfter: m3 }))
await shot(page, 'lo-D-3-ctrlz-after-lull')
await page.locator('.c-pace').scrollIntoViewIfNeeded()
await shot(page, 'lo-D-4-pace-card', { el: '.c-pace' })

/* ---- E. slow typing ---- */
async function slowDate(sel, field, ddmm = '0211') {
  await clickEmpty()
  const d0 = await stackDepth(page), before = await page.locator(sel).inputValue()
  const loc = page.locator(sel); await loc.scrollIntoViewIfNeeded(); const bx = await loc.boundingBox()
  await page.mouse.click(bx.x + 10, bx.y + bx.height / 2); await sleep(80)
  await page.keyboard.type(ddmm, { delay: 70 })
  const series = []
  for (const ch of '2026') { await page.keyboard.type(ch); await sleep(2300); const st = await datesStored(); series.push({ box: await loc.inputValue(), stored: st ? st[field] : null }) }
  const d1 = await stackDepth(page)
  await clickEmpty(); await page.click('#trUndoBtn'); await sleep(600)
  const after = await loc.inputValue(), st = await datesStored()
  return { before, series, steps: d1.undo - d0.undo, afterOneUndo: after, storedAfter: st ? st[field] : null }
}
for (const [sel, field, name] of [['#upchit', 'upchit', 'Upchit'], ['#lastCurr', 'lastCurr', 'Last Flown (Currency)'], ['#lastSyll', 'lastSyll', 'Last Flown (Syllabus)']]) {
  const r = await slowDate(sel, field)
  L.note(`E ${name}: typed 02/11 then the year 2026 one digit every 2.3 s`, JSON.stringify(r))
  L.ok(`E ${name}: one ↶ does not leave a half-typed year on screen or in the store`, /^2026-/.test(r.afterOneUndo) || r.afterOneUndo === r.before, `after one ↶ the box reads "${r.afterOneUndo}", stored "${r.storedAfter}", ${r.steps} steps recorded`)
  await page.locator('.c-curr').scrollIntoViewIfNeeded()
  await shot(page, `lo-E-${field}-after-one-undo`, { el: '.c-curr' })
}
/* the down-days box (a number): "12" typed with 2.3 s between the digits */
{
  await clickEmpty()
  const d0 = await stackDepth(page), before = await page.locator('#downDays').inputValue()
  const b = page.locator('#downDays'); await b.scrollIntoViewIfNeeded(); await b.click()
  const series = []
  for (const ch of '12') { await page.keyboard.type(ch); await sleep(2300); const st = await datesStored(); series.push({ box: await b.inputValue(), stored: st ? st.downDays : null }) }
  const d1 = await stackDepth(page)
  await clickEmpty(); await page.click('#trUndoBtn'); await sleep(600)
  const r = { before, series, steps: d1.undo - d0.undo, afterOneUndo: await b.inputValue(), storedAfter: ((await datesStored()) || {}).downDays }
  L.note('E down days: typed "12" one digit every 2.3 s', JSON.stringify(r))
  L.ok('E down days: one ↶ goes back to what the box held before the typing', r.afterOneUndo === r.before, `after one ↶ the box reads "${r.afterOneUndo}" (before "${r.before}"), stored "${r.storedAfter}", ${r.steps} steps`)
  await page.locator('.c-curr').scrollIntoViewIfNeeded()
  await shot(page, 'lo-E-downDays-after-one-undo', { el: '.c-curr' })
}
/* the grading pop-up's "Done on" (fixed for W2-F2 — confirm it stays fixed) */
{
  await tapBall(page, 'TR-2'); await grade('DCO'); await page.keyboard.press('Escape').catch(() => {}); await sleep(200)
  await tapBall(page, 'TR-2')
  const d0 = await stackDepth(page), before = (await popFails(page)).doneOn
  const loc = page.locator('#popDoneDate'); const bx = await loc.boundingBox()
  await page.mouse.click(bx.x + 10, bx.y + bx.height / 2); await sleep(80)
  await page.keyboard.type('2109', { delay: 70 })
  const series = []
  for (const ch of '2026') { await page.keyboard.type(ch); await sleep(2300); const ms = await marksStored(); series.push({ box: await loc.inputValue(), storedDone: ms && ms['TR-2'] ? ms['TR-2'].d : null, lastFlown: (await currency(page)).lastSyll }) }
  const d1 = await stackDepth(page)
  await page.keyboard.press('Escape'); await sleep(250)
  await shot(page, 'lo-E-doneon-before-undo')
  await clickEmpty(); await page.click('#trUndoBtn'); await sleep(600)
  await tapBall(page, 'TR-2')
  const r = { before, series, steps: d1.undo - d0.undo, afterOneUndo: (await popFails(page)).doneOn, storedAfter: ((await marksStored()) || {})['TR-2'], lastFlown: (await currency(page)).lastSyll }
  L.note('E Done on (TR-2, DCO today): typed 21/09 then the year one digit every 2.3 s', JSON.stringify(r))
  L.ok('E Done on: no half-typed year ever saved, one ↶ goes back to the day before the typing', r.series.every(s => !s.storedDone || /^(19|20)\d\d-/.test(s.storedDone)) && r.afterOneUndo === r.before, `series ${JSON.stringify(r.series)} · after one ↶ "${r.afterOneUndo}" (before "${r.before}")`)
  await shot(page, 'lo-E-doneon-after-one-undo')
  await page.keyboard.press('Escape'); await sleep(200)
}

save('lo-C-undo', { rows: L.rows, errors })
console.log('errors', JSON.stringify(errors))
await browser.close()
