/* www W3 fix 3 — the long day names its flight. usage: [PHONE=1] node scripts/handpass/www/www-w3-s3.mjs */
const PHONE = process.env.PHONE === '1'
process.env.WWW_RUN ||= 's3-' + (PHONE ? 'p' : 'd')
const H = await import('./www-w3-lib.mjs')
const { X, say, sleep, L } = H
const size = PHONE ? '402' : '1536'
const P = PHONE ? 'p' : 'd'
const w = await X.open({ phone: PHONE })
const { page } = w
const R = (did, exp, saw, v, pic) => X.row('3 long day names its flight', size, did, exp, saw, v, pic)
await X.board(w, X.FRI)
await H.gRow(w, X.FRI, 'EARLY TASK', '06:00', '07:00', 'bane')
const wi = await H.frFlight(w, X.FRI, '17:00', '', 'bane', 'LATE FLT')
const re = /long day/i
const bw = await X.boardWarn(w)
await X.pic(w, `3-a-board-${P}`)
R('Ranger: ground item 06:00-07:00 and flight LATE FLT T/O 17:00 landing blank (no callsign typed); the board long-day line', 'ends "(<callsign and mission> landing assumed 18:00 + 2h debrief assumed)"', JSON.stringify(bw.filter(l => re.test(l))), bw.some(l => re.test(l) && /landing assumed 18:00 \+ 2h debrief assumed\)/.test(l)) ? 'PASS' : 'FAIL', `3-a-board-${P}.png`)
R('RECORD the long-day line whole (no flight callsign)', 'RECORD', JSON.stringify(bw.filter(l => re.test(l))), 'RECORDED', `3-a-board-${P}.png`)
await H.setF(w, `ff:${X.FRI}.${wi}.0.cs`, 'VIPER1')
const bwc = await X.boardWarn(w)
await X.pic(w, `3-a2-callsign-${P}`)
R('typed the flight callsign VIPER1; the long-day line', 'ends "(VIPER1 LATE FLT landing assumed 18:00 + 2h debrief assumed)"', JSON.stringify(bwc.filter(l => re.test(l))), bwc.some(l => /\(VIPER1 LATE FLT landing assumed 18:00 \+ 2h debrief assumed\)/.test(l)) ? 'PASS' : 'FAIL', `3-a2-callsign-${P}.png`)
await X.closeBoard(w)
const ww = await X.weekWarn(w, '#eWeek', X.FRI)
const dd = await X.dayDetails(w, '#eWeek', X.FRI)
await X.pic(w, `3-c-details-${P}`)
await X.closeDayPop(w, 'done')
R('Friday week strip and day details: long-day line', 'RECORD', JSON.stringify({ week: ww.items.filter(l => re.test(l)), details: (dd.items || []).filter(l => re.test(l)) }), 'RECORDED', `3-c-details-${P}.png`)
await X.fin(w)
