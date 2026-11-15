/* www W3 fix 1 — the crew-rest line names the take-off. usage: [PHONE=1] node scripts/handpass/www/www-w3-s1.mjs */
const PHONE = process.env.PHONE === '1'
process.env.WWW_RUN ||= 's1-' + (PHONE ? 'p' : 'd')
const H = await import('./www-w3-lib.mjs')
const { X, say, sleep, L } = H
const size = PHONE ? '402' : '1536'
const P = PHONE ? 'p' : 'd'
const w = await X.open({ phone: PHONE })
const { page } = w
const R = (did, exp, saw, v, pic) => X.row('1 crew rest names the take-off', size, did, exp, saw, v, pic)
let MAN = 'bane', CS = 'Ranger'
const busy = await page.evaluate(() => JSON.stringify([window.DAYS[4], window.DAYS[5]]))
if (busy.includes('"bane"')) { [CS, MAN] = await H.freeMan(w, [4, 5]); say('bane busy; using', CS, MAN) }
else say('using Ranger bane')
await X.board(w, X.FRI)
const wm = await H.frFlight(w, X.FRI, '12:00', '', MAN, 'MON FLT')
await X.closeBoard(w)
await X.board(w, X.SAT)
await H.frFlight(w, X.SAT, '04:00', '', MAN, 'TUE FLT')
const who = await page.evaluate(() => [4, 5].map(d => window.PEOPLE[window.DAYS[d].waves.slice(-1)[0].formations[0].aircraft[0].p]?.cs))
await X.closeBoard(w)
R('built ' + CS + ': Friday flight T/O 12:00 landing blank; Saturday flight T/O 04:00', 'both seated', JSON.stringify(who), who[0] === CS && who[1] === CS ? 'PASS' : 'NOT WALKED', '')
const re = /crew rest/i
const a = await H.crLines(w, X.SAT, re, '1-a')
const want = 'Friday T/O 12:00, landing assumed 13:00 (T/O + 1h) + 2h debrief (assumed) → ended 15:00 → clear 03:00'
for (const k of ['week', 'details', 'board'])
  R(`Saturday crew-rest line in the ${k}`, `contains "${want}"`, JSON.stringify(a[k]), a[k].some(l => l.includes(want)) ? 'PASS' : 'FAIL', `1-a-${k}-${P}.png`)
R('RECORD Saturday crew-rest line whole (assumed landing)', 'RECORD', JSON.stringify(a.week), 'RECORDED', `1-a-week-${P}.png`)
// type Friday's landing 12:30
await X.board(w, X.FRI)
await H.setF(w, `ff:${X.FRI}.${wm}.0.ld`, '12:30')
await X.closeBoard(w)
const b = await H.crLines(w, X.SAT, re, '1-b')
const want2 = 'Friday landed 12:30 + 2h debrief (assumed) → ended 14:30 → clear 02:30'
for (const k of ['week', 'details', 'board'])
  R(`Friday landing typed 12:30; Saturday crew-rest line in the ${k}`, `contains "${want2}", no "assumed" landing`, JSON.stringify(b[k]), b[k].some(l => l.includes(want2) && !/landing assumed/.test(l)) ? 'PASS' : 'FAIL', `1-b-${k}-${P}.png`)
R('RECORD Saturday crew-rest line whole (typed landing)', 'RECORD', JSON.stringify(b.week), 'RECORDED', `1-b-week-${P}.png`)
await X.fin(w)
