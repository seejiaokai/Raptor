import * as L from './sf-C-lib.mjs'
const { launch, ctxOpen, openBoard, closeBoard, bPut, bType, bf, bPublish, sleep, shot, rec, go, errors, weekHead, chipLine, oilOpen, oilClose, oilLine, warnLines, bAddFlyingWave } = L
const S = '2b'
const b = await launch()
{
  // (a) weekday repeat: Friday (day 4), unpublished
  const { p } = await ctxOpen(b, {})
  await go(p, 'editsched')
  await p.evaluate(() => window.addWave(4, 'avalon')); await sleep(500)
  await openBoard(p, 4)
  for (const [ai, pid] of [[0, 'stiff'], [1, 'bane'], [2, 'slipway'], [3, 'dj']]) await bPut(p, 4, 0, 0, ai, 'p', [pid])
  await bType(p, bf(4, 0, 0, 'rl'), '18:30')
  const ch = await chipLine(p), hd = await weekHead(p, 4), wl = await warnLines(p)
  const hasOil = await oilOpen(p); const ol = hasOil ? await oilLine(p) : 'NO OIL Earn BUTTON on a weekday board'; await shot(p, '2b-01-weekday-oil'); await oilClose(p)
  await shot(p, '2b-02-weekday-board')
  rec(S, 'AVALON R 18:30 on a weekday (Fri, unpublished)', 'all four lit, badge term, long-day notes, no OIL', { ch, hd, wl, ol }, (ch.match(/\+ON/g) || []).length === 4 && /long work day/.test(wl.join(' ')) ? 'PASS' : 'FAIL', 'C-2b-02-weekday-board.png')
  rec(S, 'OIL Earn on the weekday', 'no OIL (nothing to switch, or all off)', ol, 'RECORD', 'C-2b-01-weekday-oil.png')
  await p.context().close()
}
{
  // (b) Sunday AVALON crossing into next week's Monday
  const { p } = await ctxOpen(b, {})
  await go(p, 'editsched')
  await p.evaluate(() => window.addWave(6, 'avalon')); await sleep(500)
  await openBoard(p, 6)
  const seats = []
  for (const [ai, pid] of [[0, 'stiff'], [1, 'bane'], [2, 'slipway'], [3, 'dj']]) seats.push(await bPut(p, 6, 0, 0, ai, 'p', [pid]))
  await bType(p, bf(6, 0, 0, 'rl'), '18:30')
  const ch = await chipLine(p), wl = await warnLines(p)
  await shot(p, '2b-03-sunday-avalon')
  rec(S, 'AVALON on Sunday with R 18:30', 'lit; long-day note 12h30 into Monday', { seats, ch, wl }, (ch.match(/\+ON/g) || []).length === 4 ? 'PASS' : 'FAIL', 'C-2b-03-sunday-avalon.png')
  await closeBoard(p)
  await go(p, 'editsched')
  // find the first Monday line of the next week via the peek, and who is on it
  const peek = await p.evaluate(() => { const d = document.querySelector('#eWeek .day.peek[data-peek-day="0"]'); return d ? d.innerText.replace(/\s+/g, ' ').slice(0, 400) : null })
  console.log('peek Monday', peek)
  await p.locator('#eWeek .day.peek[data-peek-day="0"]').first().click(); await sleep(1800)
  // is there a warning about last week's Sunday on Monday? seat Ace on Monday's first line
  await openBoard(p, 0)
  const w0 = await warnLines(p)
  const lines = await p.evaluate(() => window.DAYS[0].waves.map((w, gi) => w.formations.map((f, li) => `${gi}.${li} ${f.cs} to=${f.to} rl=${f.rl} ac=${f.aircraft.map(a => (window.PEOPLE[a.p] || {}).cs + '/' + (window.PEOPLE[a.w] || {}).cs).join(',')}`)))
  console.log(JSON.stringify(lines))
  await shot(p, '2b-04-next-week-monday')
  rec(S, 'next week loaded, Monday', 'RECORD whether last week\'s Sunday AVALON is known to Monday\'s crew rest', { w0, lines }, 'RECORD', 'C-2b-04-next-week-monday.png')
  rec(S, 'browser error list', 'empty', errors, errors.length ? 'FAIL' : 'PASS')
  await p.context().close()
}
await b.close()
