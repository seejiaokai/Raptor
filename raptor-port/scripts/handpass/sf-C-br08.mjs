import * as L from './sf-C-lib.mjs'
const { launch, ctxOpen, openBoard, closeBoard, bPut, bType, bf, bPublish, sleep, shot, rec, go, errors, chipLine, weekHead, warnLines, oilOpen, oilClose, oilLine, trackerCredits, trackerClose } = L
const S = 'B8'
const b = await launch()
for (const [kind, label, R, END, seatKey] of [['avalon', 'AVALON NIGHT 19:00-07:00, R 08:00 (after END)', '08:00', '07:00', 'AV'], ['sc', 'SC AM 07:00-13:00, R 14:00 (after END)', '14:00', '13:00', 'SC']]) {
  const { p } = await ctxOpen(b, {})
  await go(p, 'editsched'); await p.evaluate(k => window.addWave(5, k), kind); await sleep(500)
  await openBoard(p, 5)
  const st = [await bPut(p, 5, 0, 0, 0, 'p', ['stiff']), await bPut(p, 5, 0, 0, 2, 'p', ['bane'])]
  await bType(p, bf(5, 0, 0, 'rl'), R)
  const w = await warnLines(p), c = await chipLine(p), h = await weekHead(p, 5)
  await shot(p, `B8-${seatKey}-1-R-after-end`)
  const longDay = w.filter(x => /long work day|rest/i.test(x))
  rec(S, `${label}: unpublished`, 'no negative or 24-hour day; no false long-day note', { w, c, badge: h.badge, longDay }, 'RECORD', `C-B8-${seatKey}-1-R-after-end.png`)
  const hasOil = await oilOpen(p); const ol = hasOil ? await oilLine(p) : 'no OIL button'; await shot(p, `B8-${seatKey}-2-oil`); await oilClose(p)
  rec(S, `${label}: OIL Earn`, 'no OIL beyond END', ol, 'RECORD', `C-B8-${seatKey}-2-oil.png`)
  const pub = await bPublish(p, 5); await closeBoard(p)
  const t = await trackerCredits(p, '18 Jul', `B8-${seatKey}-3-tracker`); await trackerClose(p)
  rec(S, `${label}: published, Leave War tracker`, 'no OIL beyond END; no negative window', { pub, t }, 'RECORD', `C-B8-${seatKey}-3-tracker.png`)
  await p.context().close()
}
rec(S, 'browser error list', 'empty', errors, errors.length ? 'FAIL' : 'PASS')
await b.close()
