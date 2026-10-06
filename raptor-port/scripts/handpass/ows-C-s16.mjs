/* walker C — S16: withdrawing the ORIGINAL really can strand a take. Flight 12:00–13:00, IN TIME 08:30 (08:30–15:00, 390, FO), published;
   its whole 1 day spent through the Leave War's own sheet; then Unpublish ORIGINAL (the words recorded; confirm; the cell, times, balance; the draft's candidate). */
import * as C from './ows-C-lib.mjs'
const { S, L, W, LW, R, world, judge, row, pic, sleep, SAT } = C
const { browser, p, errors } = await world()
const di = C.SATI, M = 'bane', TAKE = '2026-07-21'
await C.expiryForever(p)
await L.go(p, 'editsched'); await sleep(400)
const w = await C.flyWave(p, di, { cs: 'VIPER', to: '12:00', ld: '13:00', p1: M })
const its = await C.inTime(p, di, w.wi, 'IN TIME 08:30')
const pub = await C.pubOrig(p, di)
const o1 = await C.oilOf(p, M, SAT, 'S16-1')
console.log('O1', C.say(o1))
/* spend the whole day */
await LW.lwOpen(p, TAKE)
const t0 = await LW.tapCell(p, M, TAKE)
const r = await LW.sheetPress(p, 'bid-OIL')
let s = await LW.sheetNow(p); console.log('OIL BID', s.open, (s.text || '').slice(0, 300))
if (s.open === 'bid-picker' && /again/i.test(s.text || '')) { await LW.sheetPress(p, 'bid-OIL'); s = await LW.sheetNow(p); console.log('SECOND', s.open, (s.text || '').slice(0, 300)) }
await LW.closeSheets(p)
const o2 = await C.oilOf(p, M, TAKE, 'S16-2-take', { sheet: false })
const bs = await C.oilOf(p, M, SAT, 'S16-2')
console.log('TAKE', JSON.stringify(o2.cell), 'BAL', bs.bal, bs.row.slice(0, 250))
judge('S16.a', 'Saturday flight VIPER 12:00–13:00, IN TIME 10:00 → typed 08:30, published ORIG; then Leave War, Ranger, Tue 21 Jul, "OIL" (a whole-day take)', [
  ['ORIG, line reads IN TIME 08:30', pub.head.tag === 'ORIG' && /08:?30/.test(its[0]), { tag: pub.head.tag, its }],
  ['FO, worked 08:30–15:00', o1.letters === 'FO' && /08:30.15:00/.test(o1.row), { cell: o1.cell.text, row: o1.row.slice(0, 200) }],
  ['the take is on the grid (OIL)', /OIL/.test(o2.cell.text), o2.cell.text],
  ['balance 0 (earned 1, spent 1)', bs.bal === '0', bs.bal],
], [...o1.pics, ...o2.pics, ...bs.pics])

/* Unpublish the ORIGINAL */
const un = await C.unpublish(p, di)
console.log('UNPUB', JSON.stringify(un))
const o3 = await C.oilOf(p, M, SAT, 'S16-3')
const d3 = await C.dayState(p, di, 'S16-3')
console.log('O3', C.say(o3, d3))
row('S16.words', 'Edit Schedule Saturday: Unpublish pressed on the ORIGINAL (second press if it armed)', `button first "${un.first}", after first "${un.afterFirst}", second press ${un.second}; first spoke: ${JSON.stringify(un.firstToasts)}; second spoke: ${JSON.stringify(un.secondToasts)}`, 'RECORDED', [])
judge('S16.b', 'after the confirmed withdrawal', [
  ['a warning was raised before the withdrawal (it armed and asked a second tap)', un.second === true && /bid against|Heads up/i.test((un.firstToasts || []).join(' ')), un.firstToasts],
  ['the day is a draft again (no ORIG tag, Publish day offered)', !/ORIG|AL/.test(d3.head.tag) || d3.head.tag === '', d3.head.tag],
  ['Leave War: no automatic FO on 18 Jul', !/FO|HO/.test(o3.cell.text), o3.cell.text],
  ['tracker: no worked record 08:30–15:00', !/08:30.15:00/.test(o3.row.replace(/ \[ARCHIVE OPENED\]/, '')) || false, o3.row.slice(0, 220)],
  ['balance −1', o3.bal === '-1' || o3.bal === '−1', o3.bal],
], [...o3.pics, ...d3.pics])
/* the draft's candidate: OIL Earn mode on the board */
await S.toBoard(p, di)
await p.locator('#sbOil').click(); await sleep(800)
const cand = await p.evaluate(m => { const ps = [...document.querySelectorAll('#schedBoard .puck[data-person="' + m + '"]')].filter(e => e.offsetParent !== null && !e.closest('#sbRoster')); return ps.map(e => ({ cls: e.className.slice(0, 120), title: (e.getAttribute('title') || '').slice(0, 200), text: e.innerText.replace(/\s+/g, ' ').trim() })) }, M)
const candPic = await pic(p, 'S16-4-candidate-oilmode')
const top = await p.evaluate(() => ((document.querySelector('#schedBoard .oilmode, #schedBoard .sb-oil, #schedBoard [data-oilday]') || {}).innerText || '').replace(/\s+/g, ' ').slice(0, 300))
await p.locator('#sbOil').click().catch(() => {}); await sleep(400); await S.closeBoard(p)
console.log('CAND', JSON.stringify(cand), top)
judge('S16.c', 'the draft Saturday on the board in OIL Earn mode: Ranger\'s figure (the candidate)', [
  ['Ranger\'s puck wears the full-day (FO) edge/figure', cand.some(x => /oilbar-fo|\bFO\b/.test(x.cls + ' ' + x.title + ' ' + x.text)), cand],
], [candPic])
await C.finish(browser, errors, 'ows-C-s16')
