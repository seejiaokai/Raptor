/* walker C — scenario 4 (desktop only — the preview is not drawn on a phone): the next-week preview's red time boxes
   follow a DRAFT next Monday's own hide. Setup: on Monday 20 Jul the RU BFM line's landing typed equal to its take-off
   (08:40) in the week's own time box → the "take-off and landing are the same" line and two red time boxes. */
import * as C from './wh-c-lib.mjs'
const { H } = C, { L, W } = H
const RE = /take-off and landing are the same/i
const { browser, p, errors } = await H.world({ who: 'a' })
const both = async tag => {
  await L.go(p, 'editsched'); await C.toWeek(p, C.WK1)
  const e = await C.peekLook(p, '#eWeek'); const pe = await H.pic(p, `04-${tag}-preview-edit`)
  await L.go(p, 'viewsched'); const v = await C.peekLook(p, '#vWeek'); const pv = await H.pic(p, `04-${tag}-preview-view`)
  await L.go(p, 'editsched')
  return { e, v, pics: [pe, pv] }
}
const mon = async () => { await L.go(p, 'editsched'); await C.toWeek(p, C.WK2); await W.showDay(p, 0); return { s: await C.see(p, '#eWeek', 0, RE), red: await C.weekRed(p, '#eWeek', 0) } }
try {
  if (H.PHONE) { H.row('4', 'the next-week preview', 'not drawn on a phone', 'NOT WALKED (desktop only — the preview is not drawn on a phone)'); throw new Error('phone') }
  await L.go(p, 'editsched')
  const p0 = await both('0')
  await C.toWeek(p, C.WK2); await W.showDay(p, 0)
  const m00 = await mon()
  await W.weekText(p, 'ff:0.0.1.ld', '0840'); await L.settle(p)
  const m0 = await mon()
  const picM0 = await C.picLine(p, '#eWeek', 0, m0.s.line ? m0.s.line.ix : 0, '04-1-monday-nought-line')
  await p.evaluate(() => { const e = document.querySelector('#eWeek .day[data-day="0"] .fcell.badtm'); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }); await L.sleep(250)
  const picM0b = await H.pic(p, '04-1b-monday-red-boxes')
  const p1 = await both('1')
  H.judge('4.1', 'week of 20 Jul, Monday: typed 08:40 into the RU BFM line\'s landing box (= its take-off); then the week of 13 Jul: the preview to the right of Sunday', [
    ['before the edit: no such line, no red box, and the preview (drawn) had no red box', !m00.s.line && m00.red === 0 && p0.e.drawn && p0.e.n === 0, JSON.stringify({ red: m00.red, preview: p0.e.n, drawn: p0.e.drawn })],
    ['Monday raises the "take-off and landing are the same" line, plain, with ✕', !!m0.s.line && !m0.s.line.struck && m0.s.line.btn === '✕', m0.s.bar],
    ['Monday\'s own two time boxes are red', m0.red === 2, m0.red],
    ['the preview (Edit Schedule) draws both red boxes, painted differently from a plain time box', p1.e.n === 2 && p1.e.differs === true, JSON.stringify(p1.e.cells) + ' vs plain: ' + p1.e.plainPaint],
    ['the preview (View-only Sched) draws both red boxes', p1.v.n === 2, JSON.stringify(p1.v.cells.map(c => c.txt))],
  ], [picM0, picM0b, ...p1.pics])
  const IX = m0.s.line.ix

  await mon(); await H.tapLine(p, '#eWeek', 0, IX); await L.settle(p)
  const m1 = await mon()
  const picM1 = await C.picLine(p, '#eWeek', 0, IX, '04-2-monday-hidden')
  const p2 = await both('2')
  H.judge('4.2', '✕ on Monday 20 Jul\'s nought-minute line (Monday a draft); back to the week of 13 Jul', [
    ['Monday: the line struck, ↺', !!m1.s.line && m1.s.line.struck && m1.s.line.btn === '↺', m1.s.bar], ['Monday\'s own red boxes are gone', m1.red === 0, m1.red],
    ['the preview (Edit Schedule) has NO red box — both gone', p2.e.drawn && p2.e.n === 0, JSON.stringify(p2.e.cells)], ['the preview (View-only Sched) has no red box', p2.v.drawn && p2.v.n === 0, JSON.stringify(p2.v.cells)],
  ], [picM1, ...p2.pics])

  await H.reloadAs(p, 'a')
  const p3 = await both('3')
  H.judge('4.3', 'reloaded (the app opens on the week of 13 Jul; the week of 20 Jul not opened in this sitting)', [['the preview (Edit Schedule) has no red box', p3.e.drawn && p3.e.n === 0, p3.e.n], ['the preview (View-only Sched) has no red box', p3.v.drawn && p3.v.n === 0, p3.v.n]], p3.pics)

  await mon(); await H.tapLine(p, '#eWeek', 0, IX); await L.settle(p)                 // ↺
  const co = await C.see(p, '#eWeek', 0, /CO approval required/i)
  await H.tapLine(p, '#eWeek', 0, co.line.ix); await L.settle(p)                      // an unrelated hide
  const m2 = await mon()
  const p4 = await both('4')
  H.judge('4.4', '↺ on the nought-minute line; and an UNRELATED ✕ (Monday\'s "CO approval required"); back to the week of 13 Jul', [
    ['Monday: the nought-minute line plain again, its two boxes red again', !m2.s.line.struck && m2.red === 2, m2.s.bar + ' · red ' + m2.red],
    ['the preview (Edit Schedule) draws both red boxes again — the unrelated hide took nothing', p4.e.n === 2, p4.e.n], ['the preview (View-only Sched) too', p4.v.n === 2, p4.v.n],
  ], p4.pics)
  await H.reloadAs(p, 'a')
  const p5 = await both('5')
  H.judge('4.5', 'reloaded', [['the preview still draws both red boxes (Edit Schedule and View-only Sched)', p5.e.n === 2 && p5.v.n === 2, JSON.stringify([p5.e.n, p5.v.n])]], p5.pics)
} catch (e) { if (String(e.message) !== 'phone') H.row('4.X', 'the script', String(e && e.stack || e).slice(0, 700), 'FAIL', [await H.pic(p, '04-X-error')]) }
C.done('04', errors)
await browser.close()
