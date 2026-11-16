/* www W3 fix 2 probe — is the 120 line raised when Friday is NOT published? usage: [PUB=1] node scripts/handpass/www/www-w3-s2b.mjs */
const PUB = process.env.PUB === '1'
process.env.WWW_RUN ||= 's2b-' + (PUB ? 'pub' : 'unpub')
const H = await import('./www-w3-lib.mjs')
const { X, say, sleep, L } = H
const w = await X.open({ phone: false })
const R = (did, exp, saw, v, pic) => X.row('2b probe', '1536', did, exp, saw, v, pic)
await X.board(w, X.FRI)
await H.frFlight(w, X.FRI, '12:00', '', 'bane', 'FRI FLT')
if (PUB) { const pr = await H.signAndPublish(w, X.FRI); say('published', JSON.stringify(pr.pressed)) }
await X.closeBoard(w)
await X.board(w, X.SAT)
await H.frFlight(w, X.SAT, '06:30', '07:30', 'bane', 'SAT FLT')
await X.closeBoard(w)
for (const len of ['60', '120']) {
  await H.logicOpen(w, true); await H.setSetting(w, 'fltLen', len); await H.logicDone(w)
  await L.go(w.page, 'editsched'); await sleep(400)
  const ww = await X.weekWarn(w, '#eWeek', X.SAT)
  await X.board(w, X.SAT)
  const bw = await X.boardWarn(w)
  await X.pic(w, `probe-${len}`)
  await X.closeBoard(w)
  R('fltLen ' + len, 'RECORD', JSON.stringify({ week: ww.items, board: bw }), 'RECORDED', '')
}
await X.fin(w)
