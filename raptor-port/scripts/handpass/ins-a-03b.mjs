/* Scenario 3, a side observation from its fixture: a line whose take-off is typed EARLIER than its wave's in-time gives
   a negative Work-hours figure in the window. Recorded with a picture; a draft Monday, nothing published. */
import * as A from './ins-a-lib.mjs'
const { L, W, MON, row, judge, pic } = A
const S = '3x'
await A.run(S, async p => {
  await A.toEdit(p)
  const i0 = await A.insNow(p)
  await W.boardOn(p, MON)
  const intimes = await p.evaluate(() => window.DAYS[0].waves[1].intimes)
  await A.boxText(p, 'ff:0.1.1.to', '10:00'); await A.boxText(p, 'ff:0.1.1.ld', '11:25')
  const shot = await pic(p, 's3x-monday-board')
  await W.boardOff(p)
  const i1 = await A.insAt(p, 's3x-insights-wisp-bar', 'Wisp')
  const who = ['Piston', 'Relay', 'Outlaw', 'Wisp']
  const neg = A.sec(i1, /Work hours/i).filter(x => /-\d/.test(x))
  judge(`${S}.a`, `fresh world, nothing published. Monday's board: Go 2's RU line T/O 19:20→10:00 and LD 20:45→11:25 (that wave's in-time lines read: ${JSON.stringify(intimes)}); ✓ Done; Insights`, [
    ['no Work-hours figure in the window is negative', neg.length === 0, neg.join(' | ') || 'none'],
  ], [shot, ...i1.shots])
  row(`${S}.a+`, 'the four men on that formation, before → after', who.map(c => `${A.hoursOf(i0, c)} → ${A.hoursOf(i1, c)}`).join(' ; '), 'RECORDED')
  /* the same on the day itself: does Monday's list say anything about it? */
  await A.openList(p, '#eWeek', MON); const l = await A.readList(p, '#eWeek', MON)
  row(`${S}.a++`, 'Monday\'s own issues list after the edit (lines naming Wisp or Outlaw)', (l.lines || []).filter(x => /Wisp|Outlaw/.test(x.text)).map(x => x.text).join(' | ') || 'none', 'RECORDED', [await pic(p, 's3x-monday-list')])
})
