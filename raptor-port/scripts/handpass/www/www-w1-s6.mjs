/* www W1 scenario 6 — SC with START and no END. usage: [PHONE=1] node scripts/handpass/www/www-w1-s6.mjs */
const PHONE = process.env.PHONE === '1'
process.env.WWW_RUN ||= 's6-' + (PHONE ? 'p' : 'd')
const H = await import('./www-w1-lib3.mjs')
const { X, say, sleep, L, nrm } = H
const size = PHONE ? '402' : '1536'
const P = PHONE ? 'p' : 'd'
const FRI = X.FRI, SAT = X.SAT
const w = await X.open({ phone: PHONE })
const { page } = w
const R = (did, exp, saw, v, pic) => X.row('6 SC with no END', size, did, exp, saw, v, pic)
const CS = 'Ace'
const MAN = await H.pidOf(page, CS)
say('man', CS, MAN)
await X.board(w, FRI)
// the SC block, row 0: START 20:00, END blank, Ace on it
/* round 2b: D2055 governs a STANDALONE standby wave (the + Wave menu's SC), its START the take-off box and its END the landing
   box; the first run used a duty-block row, which is not that shape (see notes) */
const KIND = process.env.KIND || 'sc'
const bi = await X.addWave(w, FRI, KIND)
await X.typeIn(w, `[data-bfld="ff:${FRI}.${bi}.0.to"]`, '20:00')
await X.typeIn(w, `[data-bfld="ff:${FRI}.${bi}.0.ld"]`, '')
const put = await X.seat(w, `[data-slot="${FRI}.${bi}.0.0.p"]`, MAN)
const row0 = await page.evaluate(([d, b]) => { const f = window.DAYS[d].waves[b].formations[0]; return `${window.DAYS[d].waves[b].label}|${f.to}-${f.ld}|${window.PEOPLE[f.aircraft[0].p]?.cs}` }, [FRI, bi])
const fw = (await X.boardWarn(w)).filter(l => new RegExp(CS + '|SC|END|end', 'i').test(l))
await X.pic(w, `6-1-scrow-${P}`)
R('Friday: SC Shift row SXO AM START 20:00, END blank, ' + CS + ' on it; Friday\'s own warnings', 'RECORD its own END warning', `seat ${put}; row ${row0}; ${JSON.stringify(fw)}`, row0.includes('20:00-') && put === 'ok' ? 'RECORDED' : 'NOT WALKED', `6-1-scrow-${P}.png`)
// Saturday 06:00 ground item
await X.closeBoard(w)
await X.board(w, SAT)
// (a ground item starts no flying day, so the early Saturday task is a flight: T/O 09:00 -> report 06:00)
const sw = await X.flight(w, SAT, '09:00', '10:00', MAN, { msn: 'EARLY FLT' })
const sp = (await page.evaluate(([d, g]) => window.PEOPLE[window.DAYS[d].waves[g].formations[0].aircraft[0].p]?.cs, [SAT, sw])) === CS ? 'ok' : 'FAILED'
await X.closeBoard(w)
const rest = a => (a || []).filter(l => /crew rest/i.test(l) && new RegExp(CS).test(l))
async function readSat(tag) {
  await L.go(page, 'editsched'); await sleep(400)
  const ww = await X.weekWarn(w, '#eWeek', SAT)
  await X.pic(w, `${tag}-satweek-${P}`)
  const dd = await X.dayDetails(w, '#eWeek', SAT)
  await X.pic(w, `${tag}-satdetails-${P}`)
  await X.closeDayPop(w, 'done')
  await X.board(w, SAT)
  const bw = await X.boardWarn(w)
  await X.pic(w, `${tag}-satboard-${P}`)
  await X.closeBoard(w)
  let tr = await X.trace(w, '#eWeek', FRI, MAN); if (!tr.items.length) tr = await X.trace(w, '#eWeek', FRI, MAN)
  await X.pic(w, `${tag}-fritrace-${P}`)
  return { week: rest(ww.items), details: rest(dd.items), board: rest(bw), trace: tr.items }
}
const a = await readSat('6-2noend')
R('Saturday 06:00 item for ' + CS + ' (seat ' + sp + '); START 20:00 / END blank', 'NO crew-rest line on Saturday (week, details, board); no invented end in Friday\'s trace', JSON.stringify(a), !a.week.length && !a.details.length && !a.board.length && !a.trace.some(l => /20:00|ended/.test(l)) ? 'PASS' : 'FAIL', `6-2noend-satweek-${P}.png`)
// END 23:00 typed
await X.board(w, FRI)
await X.typeIn(w, `[data-bfld="ff:${FRI}.${bi}.0.ld"]`, '23:00')
await X.closeBoard(w)
const b = await readSat('6-3end')
R('END 23:00 typed', 'the crew-rest line returns on Saturday (ended 23:00 → clear 11:00, item 06:00)', JSON.stringify(b), b.week.length && b.details.length && b.board.length ? 'PASS' : 'FAIL', `6-3end-satweek-${P}.png`)
// END cleared again
await X.board(w, FRI)
await X.typeIn(w, `[data-bfld="ff:${FRI}.${bi}.0.ld"]`, '')
await X.closeBoard(w)
const c = await readSat('6-4cleared')
R('END cleared again', 'the crew-rest line is gone again', JSON.stringify(c), !c.week.length && !c.details.length && !c.board.length ? 'PASS' : 'FAIL', `6-4cleared-satweek-${P}.png`)
// made to fly: the row's FLIES / flag control (data-drflag) — record what it does
await X.board(w, FRI)
const flInfo = 'B (brief) 19:00 typed on the shift = it flies'
await X.pic(w, `6-5flagbefore-${P}`)
await X.typeIn(w, `[data-bfld="ff:${FRI}.${bi}.0.br"]`, '19:00'); await sleep(600)
const fw2 = (await X.boardWarn(w)).filter(l => new RegExp(CS, 'i').test(l))
const row1 = await page.evaluate(([d, b]) => JSON.stringify(window.DAYS[d].waves[b].formations[0]).slice(0, 200), [FRI, bi])
await X.pic(w, `6-5flag-${P}`)
R('pressed the row\'s flag control (' + JSON.stringify(flInfo) + '); the row, with END blank', 'RECORD what it does and says (a shift that flies, no END)', `row ${row1}; board lines: ${JSON.stringify(fw2)}`, 'RECORDED', `6-5flag-${P}.png`)
await X.closeBoard(w)
const d = await readSat('6-6fly')
R('the flagged row with END blank: Saturday crew rest', 'no crew-rest line (builder\'s reading: flying shift is left out too)', JSON.stringify(d), !d.week.length && !d.details.length && !d.board.length ? 'PASS' : 'FAIL', `6-6fly-satweek-${P}.png`)
await X.board(w, FRI)
await X.typeIn(w, `[data-bfld="ff:${FRI}.${bi}.0.ld"]`, '23:00')
await X.closeBoard(w)
const e = await readSat('6-7flyend')
R('flagged row, END 23:00 typed', 'the crew-rest line returns', JSON.stringify(e), e.week.length || e.board.length ? 'PASS' : 'FAIL', `6-7flyend-satweek-${P}.png`)
await X.fin(w)
