/* www W2 scenario 5: landing blank -> TBD -> typed -> blank, through the readers; the long day on a second man.
   usage (from raptor-port/): [PHONE=1] node scripts/handpass/www/www-w2-s5.mjs */
const PHONE = process.env.PHONE === '1'
process.env.WWW_RUN ||= 's5-' + (PHONE ? 'p' : 'd')
const H = await import('./www-w2-lib2.mjs')
const { X, say, sleep } = H
const P = PHONE ? 'p' : 'd', size = PHONE ? '402' : '1536'
const R = (did, exp, saw, v, pic) => X.row('5 blank/TBD/typed landing readers', size, did, exp, saw, v, pic)
say('www-w2-s5 v1', size)
const w = await X.open({ phone: PHONE })
const { page } = w
const FRI = X.FRI, SAT = X.SAT
const ace = await page.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === 'Ace'))
say('ace key', ace)
await X.board(w, FRI)
const w1 = await H.frFlight(w, FRI, '12:00', '', 'bane', 'VL BFM')
const w2 = await H.frFlight(w, FRI, '14:00', '', 'bane', 'RU')
const gB = await H.gRow(w, FRI, 'BRIEFING', '13:10', '13:20', 'bane')
const gP = await H.gRow(w, FRI, 'PROBE', '12:40', '12:50', null)
say('ALL AVAIL on probe', await X.seat(w, `[data-fill="g:${FRI}.${gP}.+"]`, 'allavail'))
const gE = await H.gRow(w, FRI, 'EARLY', '06:00', '07:00', ace)
const w3 = await H.frFlight(w, FRI, '18:00', '', ace, 'LATE')
await X.closeBoard(w)
// next day: Ranger ground item 02:30 on Saturday
await X.board(w, SAT)
const gS = await H.frFlight(w, SAT, '04:00', '', 'bane', 'EARLY SAT')
say('SAT bfld keys', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld^="ff:5.0.0"]')].map(e => e.dataset.bfld))))
await X.closeBoard(w)
say('fixture', JSON.stringify({ w1, w2, gB, gP, gE, w3, gS }))
const states = [['blank', '', '', ''], ['TBD', 'TBD', 'TBD', 'TBD'], ['typed', '12:05', '19:30', '14:40'], ['blank again', '', '', '']]
for (const [nm, ld1, ld3, ld2] of states) {
  const tag = nm.replace(/\W+/g, '')
  await X.board(w, FRI)
  await H.setF(w, `ff:${FRI}.${w1}.0.ld`, ld1)
  await H.setF(w, `ff:${FRI}.${w3}.0.ld`, ld3); await H.setF(w, `ff:${FRI}.${w2}.0.ld`, ld2)
  const fri = await H.bwf(w)
  await X.pic(w, `5-${tag}-fri-${P}`)
  const chip = await H.chipRead(w, `g:${FRI}.${gP}`)
  R(`landing ${nm}: Friday's warning list (Ranger two flights + briefing; Ace early item + 18:00 flight)`, nm === 'typed' ? 'typed landing: no "assumed" in the flight-1 lines' : 'lines say "assumed" with T/O + 1h, same for blank and TBD', JSON.stringify(fri), 'RECORDED', `5-${tag}-fri-${P}.png`)
  R(`landing ${nm}: ALL AVAIL count on a 12:40-12:50 row`, 'blank = TBD (Ranger busy); typed 12:05 frees him (count one higher)', `chip ${chip}`, 'RECORDED', '')
  await X.closeBoard(w)
  // the day's own week strip words + Insights read
  await X.board(w, SAT)
  const sat = await H.bwf(w)
  await X.pic(w, `5-${tag}-sat-${P}`)
  R(`landing ${nm}: Saturday's crew-rest line (Ranger flight T/O 04:00)`, nm === 'typed' ? 'says Friday landing 14:40 (no assumed) / no "assumed"' : 'says "landing assumed 13:00 (T/O + 1h)"', JSON.stringify(sat), 'RECORDED', `5-${tag}-sat-${P}.png`)
  const ins = await H.insightsLines(w, `5-${tag}`)
  const ir = ins.flatMap((l, i) => /^(Ranger|Ace)$/.test(l) ? [ins.slice(i, i + 5).join(' / ')] : [])
  R(`landing ${nm}: Insights lines naming Ranger / Ace`, 'RECORD hours; typed differs from blank', JSON.stringify(ir.slice(0, 6)) + ' | heading lines: ' + JSON.stringify(ins.slice(0, 4)), 'RECORDED', `5-${tag}-insights-${P}.png`)
  await H.closeInsights(w)
  await X.closeBoard(w)
}
await X.fin(w)
