/* walker C — scenario 6: Sunday's dotted "Breaks Monday" mark follows next Monday's own hide while that Monday is a DRAFT,
   in both directions of travel. Setup through the board's duty panel: a late duty for Ranger on Sunday 19 Jul (till
   23:00); he flies Monday 20 Jul's first wave. */
import * as C from './wh-c-lib.mjs'
const { H } = C, { L, W } = H
const RE = /Crew rest/i, WHO = 'bane'
const { browser, p, errors } = await H.world({ who: 'a' })
const monLine = async surf => { const s = await C.see(p, surf, 0, /Crew rest.*Ranger|Ranger.*Crew rest/i, WHO); return s }
try {
  await L.go(p, 'editsched'); await C.toWeek(p, C.WK1)
  const sun0 = await C.sundayLook(p, '#eWeek')
  const duty = await C.lateSundayDuty(p)
  const sun1 = await C.sundayLook(p, '#eWeek')
  const pic1 = await C.picSunday(p, '#eWeek', '06-1-sunday-duty-added')
  console.log('DUTY', JSON.stringify(duty), '\nSUN1', JSON.stringify(sun1))
  H.judge('6.1', 'the board on Sunday 19 Jul: duty block → "+ Row", Ranger from the crew list onto it, role and times typed (15:00–23:00); ✓ Done; Edit Schedule, Sunday', [
    ['before the duty his Sunday puck carried no mark and the Sunday list no "Breaks Monday" line', !sun0.dot && !sun0.cr && !sun0.breaks, sun0.cls],
    ['the row took him and its times', !!duty.row && duty.row.who.includes(WHO) && /23:00/.test(duty.row.end), JSON.stringify(duty.row)],
    ['his Sunday puck now wears the dotted mark', sun1.dot, sun1.cls],
    ['with the crew-rest chip (R)', sun1.cr, sun1.chip], ['and the Sunday list has the "Breaks Monday" line for Ranger', sun1.breaks && /Ranger/.test(sun1.box), sun1.box.slice(0, 120)],
  ], [pic1])
  console.log('SUNDAY BOX', sun1.box.slice(0, 500))

  await C.toWeek(p, C.WK2)
  const m0 = await monLine('#eWeek')
  const pic2 = await C.picLine(p, '#eWeek', 0, m0.line ? m0.line.ix : 0, '06-2-monday-crew-rest-line')
  H.judge('6.2', 'week chip "Jul 20": Monday 20 Jul\'s list', [['Monday raises a Crew rest line for Ranger', !!m0.line, m0.lines.map(l => l.text.slice(0, 40)).join(' / ')], ['it is plain, with ✕', !!m0.line && !m0.line.struck && m0.line.btn === '✕'], ['Monday reads 11 issues', m0.n === 11, m0.bar]], [pic2])
  const IX = m0.line.ix
  console.log('MON LINE', m0.line.text)

  /* hide it; look at Sunday from the week before */
  await H.tapLine(p, '#eWeek', 0, IX); await L.settle(p)
  const m1 = await monLine('#eWeek')
  const pic3 = await C.picLine(p, '#eWeek', 0, IX, '06-3-monday-hidden')
  await C.toWeek(p, C.WK1)
  const sun2 = await C.sundayLook(p, '#eWeek')
  const pic4 = await C.picSunday(p, '#eWeek', '06-4-sunday-after-monday-hide')
  await L.go(p, 'viewsched'); const sun2v = await C.sundayLook(p, '#vWeek'); const pic4v = await C.picSunday(p, '#vWeek', '06-5-sunday-viewonly'); await L.go(p, 'editsched')
  H.judge('6.3', '✕ on Monday 20 Jul\'s Crew rest line (a draft Monday); week chip back to "Jul 13"; Sunday on Edit Schedule and on View-only Sched', [
    ['Monday: struck, ↺, 10 issues', m1.n === 10 && !!m1.line && m1.line.struck && m1.line.btn === '↺', m1.bar],
    ['Sunday (Edit Schedule): the dotted mark is gone', !sun2.dot, sun2.cls], ['and the crew-rest chip is gone', !sun2.cr, sun2.chip], ['and the Sunday list no longer has the "Breaks Monday" line', !sun2.breaks, sun2.box.slice(0, 100)],
    ['Ranger is still on the duty row', sun2.pucks.length > 0, sun2.pucks.length],
    ['Sunday (View-only Sched): no dotted mark, no CR chip', !sun2v.dot && !sun2v.cr, sun2v.cls],
  ], [pic3, pic4, pic4v])
  H.row('6.3n', 'Sunday\'s own list after the hide (recorded)', C.sundaySay(sun2) + ' · before the hide: ' + C.sundaySay(sun1), 'RECORDED')

  /* the other direction of travel: a reload lands on the week of 13 Jul without the week of 20 Jul ever being opened */
  await H.reloadAs(p, 'a'); await L.go(p, 'editsched')
  const wk = await p.evaluate(() => window.CURWEEK)
  const sun3 = await C.sundayLook(p, '#eWeek')
  const pic5 = await C.picSunday(p, '#eWeek', '06-6-sunday-after-reload')
  H.judge('6.4', 'reloaded (the app opens on the week of 13 Jul — the week of 20 Jul not opened in this sitting); Sunday', [['the app opened on 13 Jul', wk === C.WK1, wk], ['no dotted mark', !sun3.dot, sun3.cls], ['no crew-rest chip', !sun3.cr, sun3.chip], ['no "Breaks Monday" line', !sun3.breaks, sun3.box.slice(0, 100)]], [pic5])

  /* an unrelated hide must not bring it back or matter: flag Monday again, then hide something else on Monday */
  await C.toWeek(p, C.WK2)
  await C.see(p, '#eWeek', 0, RE)
  await H.tapLine(p, '#eWeek', 0, IX); await L.settle(p)                         // ↺
  const m2 = await monLine('#eWeek')
  await C.toWeek(p, C.WK1)
  const sun4 = await C.sundayLook(p, '#eWeek')
  const pic6 = await C.picSunday(p, '#eWeek', '06-7-sunday-after-flag-again')
  H.judge('6.5', 'week of 20 Jul: ↺ on the struck Crew rest line; back to 13 Jul; Sunday', [['Monday: plain again, 11 issues', m2.n === 11 && !m2.line.struck, m2.bar], ['Sunday: the dotted mark is back', sun4.dot, sun4.cls], ['with the crew-rest chip', sun4.cr, sun4.chip], ['and the "Breaks Monday" line', sun4.breaks]], [pic6])
  await H.reloadAs(p, 'a'); await L.go(p, 'editsched')
  const sun5 = await C.sundayLook(p, '#eWeek')
  H.judge('6.6', 'reloaded again; Sunday', [['the dotted mark, the chip and the "Breaks Monday" line are still there', sun5.dot && sun5.cr && sun5.breaks, sun5.cls]], [await C.picSunday(p, '#eWeek', '06-8-sunday-flagged-reload')])

  /* an unrelated hide: Monday 20 Jul's CO-approval line, and Sunday's own OIL reminder */
  await C.toWeek(p, C.WK2)
  const co = await C.see(p, '#eWeek', 0, /CO approval required/i)
  await H.tapLine(p, '#eWeek', 0, co.line.ix); await L.settle(p)
  const m3 = await monLine('#eWeek')
  await C.toWeek(p, C.WK1)
  const sun6 = await C.sundayLook(p, '#eWeek')
  const oil = await C.see(p, '#eWeek', 6, /not published yet/i)
  let sun7 = null
  if (oil.line) { await H.tapLine(p, '#eWeek', 6, oil.line.ix); await L.settle(p); sun7 = await C.sundayLook(p, '#eWeek') }
  const pic7 = await C.picSunday(p, '#eWeek', '06-9-sunday-after-unrelated-hides')
  H.judge('6.7', 'unrelated hides: ✕ on Monday 20 Jul\'s "CO approval required" line; then ✕ on Sunday 19 Jul\'s own OIL reminder; Sunday', [['Monday\'s Crew rest line still plain (10 issues: 11 less the unrelated one)', m3.n === 10 && !m3.line.struck, m3.bar], ['Sunday keeps the dotted mark and CR chip after the unrelated Monday hide', sun6.dot && sun6.cr, sun6.cls], ['and after the hide of Sunday\'s own OIL reminder', !!sun7 && sun7.dot && sun7.cr, sun7 ? sun7.cls : 'no OIL reminder line on Sunday']], [pic7])
} catch (e) { H.row('6.X', 'the script', String(e && e.stack || e).slice(0, 700), 'FAIL', [await H.pic(p, '06-X-error')]) }
C.done('06', errors)
await browser.close()
