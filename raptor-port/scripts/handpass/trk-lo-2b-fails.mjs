/* [TRK-LEFTOVERS] walker b — failures.
   C3 + D371: a student's failures on an event are in the order of their DAYS —
   the earliest is the plain code (ST-02), the next ST-02X — on every surface
   (the Failures card's chips, the full list behind its title, the grading
   pop-up's list, the details bubble in ⓘ mode); − takes back the one with the
   latest DAY; ↶ brings it back in place; re-dating in the full list re-orders
   them; an emptied day sorts last.
   C2 + D370: an event marked N.A. leaves the Failures card, its total and the
   full list; the grading pop-up and the details bubble still show its
   failures; + on it is refused with its words; graded again, they come back
   with their days.

     node scripts/handpass/trk-lo-2b-fails.mjs desk|phone

   A fresh browser (the demo world), admin, STUDENT A. Every step asserts the
   RIGHT behaviour; storage is read only to check what was saved. */
import { open, shot, save, log, PHONE, DESK } from './trk-lib.mjs'
import { sleep, failCard, ticks, centreOf } from './trk-w2-lib.mjs'
import { PH, TAG, todayIso, addDays, short, press, pressSel, toInfo, toFlow, tapBall, stored, undoNow, wordsShowing } from './trk-lo-2b-lib.mjs'
import { reveal } from './trk-lib.mjs'

const L = log()
const { browser, page, errors } = await open({ size: PH ? PHONE : DESK, who: 'a', touch: PH })
const T = await todayIso(page)
let pic = 0
const snap = async (what, opts) => { const n = `lo-2b-${TAG}-f${++pic}-${what}`; await shot(page, n, opts); return n }
const markOf = async id => ((await stored(page)).m || {})[id] || null
const fdOf = async id => { const m = await markOf(id); return m ? (m.fd || []).slice(0, m.f || 0) : [] }
const popList = () => page.evaluate(() => [...document.querySelectorAll('#popFailDates .fdate')].map(x => x.textContent.replace(/\s+/g, ' ').trim()))
const popCount = () => page.locator('#failCount').innerText().catch(() => '')
const closePop = async () => { if (await page.locator('#pop').isVisible().catch(() => false)) { await pressSel(page, '#pop .opts button:nth-child(6)'); await sleep(250) } }
const grade = async label => {
  const b = page.locator('#pop button', { hasText: new RegExp('^\\s*' + label.replace(/\./g, '\\.') + '\\s*$') }).first()
  await b.scrollIntoViewIfNeeded(); const r = await b.boundingBox(); await press(page, r.x + r.width / 2, r.y + r.height / 2); await sleep(500)
}
/** the Failed on box, typed as a person does, then left */
async function failedOn(iso) {
  const [y, m, d] = iso.split('-')
  await pressSel(page, '#popFailDate', { dx: 10 })
  await page.keyboard.type(d + m + y, { delay: 60 }); await sleep(250)
  await pressSel(page, '#popTitle'); await sleep(300)
  return page.locator('#popFailDate').inputValue()
}
const plus = async () => { await pressSel(page, '#popFailPlus'); await sleep(500) }
const minus = async () => { await pressSel(page, '#popFailMinus'); await sleep(500) }
/** the Failures card as shown (Info tab on a phone) */
async function card() { await closePop(); await toInfo(page); await page.locator('#failsCard').scrollIntoViewIfNeeded(); return failCard(page) }
const chipsFor = (fc, id) => fc.chips.filter(c => c.t.replace(/X+$/, '') === id).map(c => c.t + ' ' + (c.date || '—'))
/** the full failures list (the card's title) — its rows, then closed with ✕ */
async function fullList({ keepOpen = false, pictureAs = null } = {}) {
  await card()
  await pressSel(page, '#failTitle'); await sleep(400)
  const rows = await page.evaluate(() => [...document.querySelectorAll('#failLog .frow')].map(r => r.querySelector('.failchip').textContent + ' ' + (r.querySelector('input').value || '—')))
  const tot = await page.locator('#failLogTotal').innerText().catch(() => '')
  if (pictureAs) await snap(pictureAs, { el: '#failLog' })
  if (!keepOpen) { await pressSel(page, '#failLogClose'); await sleep(250) }
  return { rows, tot }
}
/** the details bubble for one ball, ⓘ Details mode on then off again */
async function bubble(id, pictureAs = null) {
  await closePop(); await toFlow(page)
  await pressSel(page, '#detailsBtn'); await sleep(300)
  await reveal(page, id)
  const c = await centreOf(page, id)
  await press(page, c.x, c.y); await sleep(400)
  const t = await page.evaluate(() => { const b = document.getElementById('detailBubble'); return b && b.style.display !== 'none' ? b.innerText.replace(/\s+/g, ' ').trim() : null })
  if (pictureAs) await snap(pictureAs)
  await pressSel(page, '#detailsBtn'); await sleep(300)
  return t
}
const ddmm = iso => iso ? short(iso) : 'date not recorded'

L.note('0 today / crew', T + ' · ' + await page.locator('#activeSel option:checked').innerText() + ' · ' + (PH ? 'phone 390×844 touch' : 'desktop 1440×900'))

/* ===================== C3 — the order of the days ===================== */
const D10 = addDays(T, -10), D20 = addDays(T, -20)
await tapBall(page, 'ST-02')
await plus()                                   // a failure today
L.note('C3.0 + with Failed on as it opens (today)', JSON.stringify(await fdOf('ST-02')) + ' · pop ' + JSON.stringify(await popList()))
L.note('C3.0 Failed on typed ' + short(D10), await failedOn(D10))
await plus()                                   // a failure 10 days back, recorded second
{
  const fd = await fdOf('ST-02'), pl = await popList()
  const n = await snap('pop-two-fails', { el: '#pop' })
  L.ok(`C3.1 stored in the order of the days: ${short(D10)} first, then today`, JSON.stringify(fd) === JSON.stringify([D10, T]), JSON.stringify(fd))
  L.ok(`C3.2 the pop-up's list: ST-02 = ${short(D10)} (the earlier day), ST-02X = ${short(T)} (${n})`, JSON.stringify(pl) === JSON.stringify(['ST-02 ' + short(D10), 'ST-02X ' + short(T)]), JSON.stringify(pl))
  const fc = await card()
  const n2 = await snap('card-two-fails', { el: '#failsCard' })
  L.ok(`C3.3 the Failures card's chips: ST-02 carries ${short(D10)}, ST-02X today (${n2})`, JSON.stringify(chipsFor(fc, 'ST-02')) === JSON.stringify(['ST-02 ' + D10, 'ST-02X ' + T]),
    JSON.stringify(fc.chips.map(c => [c.t, c.date, c.title])) + ' · ' + fc.total)
  const fl = await fullList({ pictureAs: 'fulllist-two-fails' })
  L.ok('C3.4 the full failures list: ST-02 on the earlier day, ST-02X today', JSON.stringify(fl.rows) === JSON.stringify(['ST-02 ' + D10, 'ST-02X ' + T]), JSON.stringify(fl.rows) + ' · ' + fl.tot)
  const bt = await bubble('ST-02', `bubble-two-fails`)
  L.ok('C3.5 the details bubble (ⓘ mode): "ST-02 ' + short(D10) + ' · ST-02X ' + short(T) + '"', !!bt && bt.includes('ST-02 ' + short(D10) + ' · ST-02X ' + short(T)), String(bt))
  L.ok('C3.6 the ball wears two red failure ticks', (await ticks(page, 'ST-02')) === 2, String(await ticks(page, 'ST-02')))
}
/* − takes back the one with the LATEST day (today), though it was recorded first */
await tapBall(page, 'ST-02')
await minus()
{
  const fd = await fdOf('ST-02'), pl = await popList(), u = await undoNow(page)
  const n = await snap('pop-after-minus', { el: '#pop' })
  L.ok(`C3.7 − takes back the latest DAY (today) — ${short(D10)} stays, as the plain ST-02 (${n})`, JSON.stringify(fd) === JSON.stringify([D10]) && JSON.stringify(pl) === JSON.stringify(['ST-02 ' + short(D10)]),
    `stored ${JSON.stringify(fd)} · pop ${JSON.stringify(pl)} · ↶ "${u.t}"`)
}
/* ↶ brings it back, in its place */
await pressSel(page, '#trUndoBtn'); await sleep(600)
{
  const fd = await fdOf('ST-02')
  await tapBall(page, 'ST-02')
  const pl = await popList()
  const n = await snap('pop-after-undo', { el: '#pop' })
  L.ok(`C3.8 ↶ brings today's failure back in place — ST-02 ${short(D10)}, ST-02X ${short(T)} (${n})`, JSON.stringify(fd) === JSON.stringify([D10, T]) && JSON.stringify(pl) === JSON.stringify(['ST-02 ' + short(D10), 'ST-02X ' + short(T)]),
    `stored ${JSON.stringify(fd)} · pop ${JSON.stringify(pl)}`)
}
/* re-dating in the full list re-orders them: ST-02X (today) → 20 days back */
{
  await fullList({ keepOpen: true })
  const sel = '#failLog .frow[data-ev="ST-02"][data-fi="1"] input[type=date]'
  const [y, m, d] = D20.split('-')
  await pressSel(page, sel, { dx: 10 }); await page.keyboard.type(d + m + y, { delay: 60 }); await sleep(250)
  await pressSel(page, '#failLog .lullhd b'); await sleep(500)
  const rows = await page.evaluate(() => [...document.querySelectorAll('#failLog .frow')].map(r => r.querySelector('.failchip').textContent + ' ' + (r.querySelector('input').value || '—')))
  const n = await snap('fulllist-redated', { el: '#failLog' })
  await pressSel(page, '#failLogClose'); await sleep(250)
  const fd = await fdOf('ST-02'), fc = await card()
  L.ok(`C3.9 ST-02X re-dated to ${short(D20)} → the two swap: ST-02 = ${short(D20)}, ST-02X = ${short(D10)} (list, card, store) (${n})`,
    JSON.stringify(rows) === JSON.stringify(['ST-02 ' + D20, 'ST-02X ' + D10]) && JSON.stringify(fd) === JSON.stringify([D20, D10]) && JSON.stringify(chipsFor(fc, 'ST-02')) === JSON.stringify(['ST-02 ' + D20, 'ST-02X ' + D10]),
    `list ${JSON.stringify(rows)} · stored ${JSON.stringify(fd)} · card ${JSON.stringify(chipsFor(fc, 'ST-02'))}`)
}
/* an emptied day sorts last */
{
  await fullList({ keepOpen: true })
  const sel = '#failLog .frow[data-ev="ST-02"][data-fi="0"] input[type=date]'
  await pressSel(page, sel, { dx: 10 })
  for (let k = 0; k < 3; k++) { await page.keyboard.press('Backspace'); await sleep(80); if (k < 2) await page.keyboard.press('ArrowRight') }
  await pressSel(page, '#failLog .lullhd b'); await sleep(500)
  const rows = await page.evaluate(() => [...document.querySelectorAll('#failLog .frow')].map(r => r.querySelector('.failchip').textContent + ' ' + (r.querySelector('input').value || '—')))
  const n = await snap('fulllist-emptied', { el: '#failLog' })
  await pressSel(page, '#failLogClose'); await sleep(250)
  const fd = await fdOf('ST-02'), fc = await card()
  L.ok(`C3.10 ST-02's day (${short(D20)}) emptied → it sorts LAST: ST-02 = ${short(D10)}, ST-02X = no day (${n})`,
    JSON.stringify(rows) === JSON.stringify(['ST-02 ' + D10, 'ST-02X —']) && JSON.stringify(fd) === JSON.stringify([D10, null]),
    `list ${JSON.stringify(rows)} · stored ${JSON.stringify(fd)} · card ${JSON.stringify(fc.chips.filter(c => /^ST-02/.test(c.t)).map(c => [c.t, c.title]))}`)
  const pl = await (async () => { await tapBall(page, 'ST-02'); return popList() })()
  L.ok('C3.11 the pop-up says the same: ST-02 on its day, ST-02X "no date"', JSON.stringify(pl) === JSON.stringify(['ST-02 ' + short(D10), 'ST-02X no date']), JSON.stringify(pl))
  /* − with one dated and one undated: the dated one (the latest DAY) goes */
  await minus()
  const fd2 = await fdOf('ST-02'), pl2 = await popList()
  const n2 = await snap('pop-minus-with-undated', { el: '#pop' })
  L.ok('C3.12 − with one dated and one undated failure takes the DATED one (the latest day), leaving the undated (D371: an undated one only when none has a day)', JSON.stringify(fd2) === JSON.stringify([null]),
    `stored ${JSON.stringify(fd2)} · pop ${JSON.stringify(pl2)} (${n2})`)
  await closePop()
}

/* ===================== C2 — N.A. and the Failures card ===================== */
const A3 = addDays(T, -3), A1 = addDays(T, -1)
await tapBall(page, 'ACG-01')
await failedOn(A3); await plus()
await failedOn(A1); await plus()
const fdA = await fdOf('ACG-01')
L.note('C2.0 ACG-01: two failures recorded (' + short(A3) + ', ' + short(A1) + ')', JSON.stringify(fdA) + ' · pop ' + JSON.stringify(await popList()))
const before = await card()
const nB = await snap('card-before-na', { el: '#failsCard' })
L.ok(`C2.1 before N.A. the card lists ACG-01 and ACG-01X with their days (${nB})`, JSON.stringify(chipsFor(before, 'ACG-01')) === JSON.stringify(['ACG-01 ' + A3, 'ACG-01X ' + A1]),
  JSON.stringify(before.chips.map(c => c.t)) + ' · ' + before.total)
const totalOf = fc => parseInt((fc.total || '0').trim(), 10) || 0
await tapBall(page, 'ACG-01'); await grade('N.A.')
{
  const fc = await card()
  const n = await snap('card-after-na', { el: '#failsCard' })
  L.ok(`C2.2 marked N.A. → no ACG-01 chip on the card, and the total drops by 2 (${totalOf(before)}→${totalOf(fc)}) (${n})`, chipsFor(fc, 'ACG-01').length === 0 && totalOf(fc) === totalOf(before) - 2,
    JSON.stringify(fc.chips.map(c => c.t)) + ' · total "' + fc.total + '"' + (fc.none ? ' · "none"' : ''))
  const fl = await fullList({ pictureAs: 'fulllist-after-na' })
  L.ok('C2.3 … and none in the full failures list (its count agrees with the card)', !fl.rows.some(r => /^ACG-01/.test(r)) && parseInt(fl.tot, 10) === totalOf(fc), JSON.stringify(fl.rows) + ' · "' + fl.tot + '"')
  await toFlow(page)
  L.ok('C2.4 … and the ball hides its red ticks', (await ticks(page, 'ACG-01')) === 0, String(await ticks(page, 'ACG-01')))
  L.ok('C2.5 the failures are KEPT (stored)', JSON.stringify(await fdOf('ACG-01')) === JSON.stringify(fdA) && (await markOf('ACG-01')).g === 'na', JSON.stringify(await markOf('ACG-01')))
  await tapBall(page, 'ACG-01')
  const pl = await popList(), pc = await popCount()
  const n2 = await snap('pop-na-still-lists', { el: '#pop' })
  L.ok(`C2.6 the grading pop-up still shows them: Fails ${pc}, ${JSON.stringify(pl)} (${n2})`, pc.trim() === '2' && JSON.stringify(pl) === JSON.stringify(['ACG-01 ' + short(A3), 'ACG-01X ' + short(A1)]), `count ${pc} · ${JSON.stringify(pl)}`)
  /* + on an N.A. event is refused with its words */
  await plus()
  const hint = await page.evaluate(() => { const h = document.getElementById('arrhint'); if (!h) return null; const r = h.getBoundingClientRect(); return { t: h.textContent, on: h.classList.contains('on'), vis: r.width > 0 && r.height > 0 && getComputedStyle(h).visibility !== 'hidden' && getComputedStyle(h).display !== 'none', box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] } })
  /* the words are said INSIDE the pop-up too (the walk's F-b5 fix, 28 Sep 26): on a phone the pop-up
     covers the hint line at the top, which is where the first walk found them hidden */
  const words = await wordsShowing(page, '#popFailWarn'), top = await wordsShowing(page, '#arrhint')
  const n3 = await snap('plus-on-na-refused')
  L.note('C2.7a the hint line at the top', JSON.stringify(top))
  L.ok(`C2.7b … and its words can be READ inside the pop-up — nothing drawn over them (${n3})`, words.found && words.covered.length === 0 && /marked N\.A\., so it cannot be failed/.test(words.text || ''), JSON.stringify(words))
  L.ok(`C2.7 + on the N.A. event is refused with its words, on screen (${n3})`, JSON.stringify(await fdOf('ACG-01')) === JSON.stringify(fdA) && (await popCount()).trim() === '2' && !!hint && hint.vis && /ACG-01.*marked N\.A\., so it cannot be failed/.test(hint.t),
    JSON.stringify(hint) + ' · stored ' + JSON.stringify(await fdOf('ACG-01')))
  await closePop()
  const bt = await bubble('ACG-01', 'bubble-na')
  L.ok('C2.8 the details bubble still shows them: "N.A." and "ACG-01 ' + short(A3) + ' · ACG-01X ' + short(A1) + '"', !!bt && /N\.A\./.test(bt) && bt.includes('ACG-01 ' + short(A3) + ' · ACG-01X ' + short(A1)), String(bt))
}
/* graded again → they come back with their days */
await tapBall(page, 'ACG-01'); await grade('Marginal')
{
  const fc = await card()
  const n = await snap('card-after-regrade', { el: '#failsCard' })
  L.ok(`C2.9 graded Marginal → ACG-01 and ACG-01X are back on the card with their days, the total back to ${totalOf(before)} (${n})`, JSON.stringify(chipsFor(fc, 'ACG-01')) === JSON.stringify(['ACG-01 ' + A3, 'ACG-01X ' + A1]) && totalOf(fc) === totalOf(before),
    JSON.stringify(fc.chips.map(c => c.t + ' ' + c.date)) + ' · ' + fc.total)
  const fl = await fullList()
  L.ok('C2.10 … and in the full list', fl.rows.includes('ACG-01 ' + A3) && fl.rows.includes('ACG-01X ' + A1), JSON.stringify(fl.rows))
  await toFlow(page)
  L.ok('C2.11 … and the ball wears its two ticks again', (await ticks(page, 'ACG-01')) === 2, String(await ticks(page, 'ACG-01')))
}

L.ok('no console errors, page errors, failed requests or native dialogs', errors.length === 0, JSON.stringify(errors))
save(`lo-2b-fails-${TAG}`, { rows: L.rows, errors })
await browser.close()
process.exit(L.rows.some(r => r.pass === false) ? 1 : 0)
