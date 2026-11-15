/* www host — his Ranger's Friday v1 (16 Nov 26): the day of the proposal's §2 (VL BFM T/O 12:00 no landing · BRIEFING
   12:40–13:00 · RU T/O 13:00, landing 14:00), staged as rcb2-w3-r1.mjs staged it, through the board's own controls; the
   lines read on the board, the week strip and the day-details window, pictured to set beside the approved page's
   proposed rows (docs/mock/2026-11-15-warn-words/a2-after-*.png). Then the landing typed (12:30) and read again.
   usage (from raptor-port/): [PHONE=1] node scripts/handpass/www/www-host-friday.mjs */
const PHONE = process.env.PHONE === '1'
process.env.WWW_WHO = 'host'
process.env.WWW_RUN ||= 'friday-' + (PHONE ? 'p' : 'd')
const X = await import('./www-lib.mjs')
const { say, sleep, FRI } = X
say('www-host-friday v2 (the tight turn is "Tight turn:", the TURN check — "Tight turning" is the crew-rest family)')
const w = await X.open({ phone: PHONE })
const { page, P } = w
const size = PHONE ? '402' : '1536'
const mine = a => (a || []).filter(l => /Ranger|VL BFM|\bRU\b|turning/i.test(l))
await X.board(w, FRI)
const wi = await X.flight(w, FRI, '12:00', '', 'bane', { msn: 'VL BFM' })
const g0 = await page.evaluate(d => window.DAYS[d].ground.length, FRI)
await X.press(w, `[data-gradd="${FRI}"]`, { scope: 'board' }); await sleep(400)
await X.typeIn(w, `[data-bfld="gr:${FRI}.${g0}.prog"]`, 'BRIEFING')
await X.typeIn(w, `[data-bfld="gr:${FRI}.${g0}.str"]`, '12:40')
await X.typeIn(w, `[data-bfld="gr:${FRI}.${g0}.end"]`, '13:00')
say('seat ground', await X.seat(w, `[data-fill="g:${FRI}.${g0}.+"]`, 'bane'))
const w2 = await X.flight(w, FRI, '13:00', '14:00', 'bane', { msn: 'RU' })
async function readAll(tag) {
  const bw = mine(await X.boardWarn(w)); say(tag, 'BOARD', JSON.stringify(bw))
  await X.pic(w, `fri-${tag}-board-${P}`)
  await X.closeBoard(w)
  const ww = await X.weekWarn(w, '#eWeek', FRI); say(tag, 'WEEK', ww.head, JSON.stringify(mine(ww.items)))
  await X.pic(w, `fri-${tag}-week-${P}`)
  const dd = await X.dayDetails(w, '#eWeek', FRI); say(tag, 'DAYDET', JSON.stringify(mine(dd.items)))
  await X.pic(w, `fri-${tag}-daydet-${P}`)
  await X.closeDayPop(w)
  return { bw, ww: mine(ww.items), dd: mine(dd.items) }
}
const a = await readAll('a-blank')
const exp = [
  /Conflict: RU \(step 12:00, T\/O 13:00\) & BRIEFING 12:40–13:00/,
  /Conflict: VL BFM \(T\/O 12:00, landing assumed 13:00\) & BRIEFING 12:40–13:00/,
  /Tight turn: VL BFM → RU, 0 min \(needs \d+\)\. VL BFM landing assumed 13:00 \(T\/O \+ 1h\), RU T\/O 13:00/,
]
for (const [k, v] of Object.entries(a)) for (const re of exp)
  X.row('friday blank', size, k, String(re), JSON.stringify(v), v.some(l => re.test(l)) ? 'PASS' : 'FAIL', `fri-a-blank-${k}-${P}.png`)
await X.board(w, FRI)
await X.typeIn(w, `[data-bfld="ff:${FRI}.${wi}.0.ld"]`, '12:30')
const b = await readAll('b-typed')
for (const [k, v] of Object.entries(b)) {
  X.row('friday typed 12:30', size, k, 'no "assumed" on any line', JSON.stringify(v), v.length && v.every(l => !/assumed/.test(l)) ? 'PASS' : 'FAIL', `fri-b-typed-${k}-${P}.png`)
}
say('waves', wi, w2)
await X.fin(w)
