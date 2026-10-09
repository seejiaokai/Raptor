import * as H from './cal-A-lib2.mjs'
const { tid, sleep, eq } = H
const SIZE = process.env.SIZE || 'desk'
const w = await H.world(SIZE)
const o = {}
const DATES = ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17', '2026-07-18', '2026-07-19', '2026-07-20']
const PH = '2026-07-15', OFF = '2026-07-16', NF = '2026-07-17'
// the Off day through the Leave War's own Event row (Event sheet, a preset)
await H.warOpen(w)
await H.warJump(w, OFF)
const ev = await H.cellIn(w, 'event-0-' + OFF)
await w.press(ev); await tid(w.page, 'event-sheet').waitFor(); await sleep(400)
o.presets = await w.page.evaluate(() => [...document.querySelectorAll('[data-testid^="event-quick-"]')].map(b => b.getAttribute('data-testid') + ':' + b.innerText.trim()))
const off = w.page.locator('[data-testid^="event-quick-"]', { hasText: /off/i }).first()
await w.press(off); await sleep(250)
const pEv = await H.pic(w, 'p106-event-sheet')
await w.press(tid(w.page, 'event-apply')); await sleep(800)
// the public holiday through Calendar > Holidays, the no-fly day through the Calendar month
await H.calOpenFromWar(w)
o.addPH = await H.holAdd(w, { kind: 'ph', from: PH })
await H.calSet(w, NF, 'nf')
await H.calClose(w)
// the run: Required P 8 from Mon 13 Jul on
await H.typeReq(w, 'p', '2026-07-13', 8, { run: true })
o.war = {}
for (const d of DATES) o.war[d] = (await H.warText(w, d)).reqP
o.bridge = {}
for (const d of DATES) { const a = (await H.bridge(w, d)); o.bridge[d] = [a.a.req.p, a.a.reqFrom.p, a.f.kind, a.a.cls] }
await H.warJump(w, '2026-07-13')
await H.cellIn(w, 'req-p-2026-07-16')
const p0 = await H.pic(w, 'p106-war-row')
await H.openSans(w); await H.sansGoto(w, '2026-07-13')
o.sans = {}
for (const d of DATES) o.sans[d] = await H.sansCell(w, d)
const p1 = await H.pic(w, 'p106-sans-month')
o.day = {}
for (const d of [PH, NF, '2026-07-18']) { await H.sansOpen(w, d); o.day[d] = await H.sansDayRead(w); await H.sansClose(w) }
await H.calOpenFromSans(w, '2026-07-14')
o.cal = {}
for (const d of DATES) o.cal[d] = await H.calRead(w, d)
const p2 = await H.pic(w, 'p106-calendar')
await H.calClose(w)
const ok = (d, v) => o.war[d] === v
const sansNeedText = d => (o.sans[d].label || '')
H.judge('P1-06', `${SIZE}: Mon 13 - Mon 20 Jul 26: Wed 15 a public holiday (Calendar > Holidays), Thu 16 an Off day (Leave War Event row, preset), Fri 17 no-fly (Calendar month), Sat/Sun left unset; Required P 8 typed "From 13 Jul on"; read on the Leave War row, the SANS month and opened days, and Calendar`, [
  ['the Off day and the holiday saved (no error)', !o.addPH.err && o.bridge[OFF][2] === 'off' && o.bridge[PH][2] === 'ph', [o.addPH, o.bridge[OFF][2], o.bridge[PH][2]]],
  ['Leave War Required P: Mon 13, Tue 14, Mon 20 read 8', ok('2026-07-13', '8') && ok('2026-07-14', '8') && ok('2026-07-20', '8'), [o.war['2026-07-13'], o.war['2026-07-14'], o.war['2026-07-20']]],
  ['Leave War Required P: PH (Wed 15), Off (Thu 16), Sat 18, Sun 19 read a dash; NF (Fri 17) reads NF', ok(PH, '–') && ok(OFF, '–') && ok('2026-07-18', '–') && ok('2026-07-19', '–') && ok(NF, 'NF'), [o.war[PH], o.war[OFF], o.war[NF], o.war['2026-07-18'], o.war['2026-07-19']]],
  ['SANS month: Mon 13, Tue 14, Mon 20 carry a still-needed figure; the other five say no required figure or NF', ['2026-07-13', '2026-07-14', '2026-07-20'].every(d => /Still needed: \d+ pilots/.test(sansNeedText(d))) && [PH, OFF, '2026-07-18', '2026-07-19'].every(d => /No required figure/.test(sansNeedText(d))), DATES.map(d => d.slice(8) + ':' + sansNeedText(d).slice(0, 70))],
  ['SANS NF day (Fri 17): NF tag, still needed zero, OFT and AMT remain drawn', o.sans[NF].tag === 'NF' && /Still needed: 0 pilots, 0 WSOs/.test(sansNeedText(NF)) && /^O /.test(o.sans[NF].o) && /^A /.test(o.sans[NF].a), [o.sans[NF].tag, o.sans[NF].need, o.sans[NF].label]],
  ['SANS opened days: PH shows Required dashes, NF shows Required NF, Sat shows Required dashes', o.day[PH].req[0] === '–' && /^NF/.test(o.day[NF].req[0]) && o.day['2026-07-18'].req[0] === '–', [o.day[PH].req, o.day[NF].req, o.day['2026-07-18'].req]],
  ['Calendar month: PH and OFF tags on 15 and 16, NF lit on 17, D lit on the ordinary weekdays', o.cal[PH].tag === 'PH' && o.cal[OFF].tag === 'OFF' && o.cal[NF].lit === 'NF' && o.cal['2026-07-13'].lit === 'D' && o.cal['2026-07-20'].lit === 'D', [o.cal[PH].tag, o.cal[OFF].tag, o.cal[NF].lit]],
  ['no console or page errors', w.errors.length === 0, w.errors],
], [pEv, p0, p1, p2])
H.savePart('P1-06-' + SIZE, { out: o })
await H.closeAll(w)
