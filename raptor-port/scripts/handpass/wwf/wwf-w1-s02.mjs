/* wwf w1 scenario 2 — a skipped desk must not erase a real ending; twin fixtures in opposite block order. */
import * as H from './wwf-w1-lib.mjs'
const X = await H.init(process.env.RUN || 's02')
const { say, sleep, row, pic } = X
const w = await X.open({})
const { page } = w
const S = 'S2', SZ = 'desktop'
const crewOf = ls => ls.filter(l => H.crew(l))
// ---- part 1: demo week, Saturday plain duty 07:00-19:00 Ranger, then SC desk 20:00 blank END Ranger; Sunday flight B 06:00
await H.gotoWeek(X, w, '13/07/2026', 'editsched')
const a = await H.makeDesk(X, w, 5, { tpl: '', str: '07:00', end: '19:00', people: ['bane'] })
const b = await H.makeDesk(X, w, 5, { tpl: 'sc', str: '20:00', end: '', people: ['bane'] })
await X.closeBoard(w)
await X.board(w, 6)
const wi = await H.flight2(X, w, 6, { to: '07:20', ld: '08:20', br: '06:00', front: 'bane', rear: null })
await X.closeBoard(w)
say('Saturday blocks', await page.evaluate(() => JSON.stringify(window.DAYS[5].dutywaves.map(b => b.label + '/' + b.sa + ':' + b.rows.slice(0, 1).map(r => r.str + '-' + r.end + '-' + r.id)))))
let ww = await X.weekWarn(w, '#eWeek', 6)
say('P1 Sunday strip', ww.head, JSON.stringify(ww.items))
await pic(w, '01-p1-sunday-strip')
let tr = await X.trace(w, '#eWeek', 5, 'bane')
say('P1 Saturday trace', JSON.stringify(tr))
await pic(w, '02-p1-saturday-trace')
row(S, SZ, 'Saturday: plain duty 07:00-19:00 then SC desk 20:00 END blank (Ranger); Sunday flight B 06:00', 'crew-rest breach from the 19:00 ending: clear 07:00, report 06:00', ww.head + ' ' + JSON.stringify(crewOf(ww.items)) + ' | trace ' + JSON.stringify(tr.items), crewOf(ww.items).some(l => /19:00/.test(l) && /clear 07:00/.test(l)) ? 'PASS' : 'FAIL', 'w1/s02/01-p1-sunday-strip.png')
// ---- part 2: twin fixtures
await H.gotoWeek(X, w, H.MONDAY_WK, 'editsched')
// fixture A: Wed(2)->Thu(3): plain first, then SC ; fixture B: Fri(4)->Sat(5): SC first, then plain
const A1 = await H.makeDesk(X, w, 2, { tpl: '', str: '20:00', end: '', people: ['boosh'] })
const A2 = await H.makeDesk(X, w, 2, { tpl: 'sc', str: '20:00', end: '', people: ['bane'] })
const B1 = await H.makeDesk(X, w, 4, { tpl: 'sc', str: '20:00', end: '', people: ['bane'] })
const B2 = await H.makeDesk(X, w, 4, { tpl: '', str: '20:00', end: '', people: ['boosh'] })
await X.closeBoard(w)
for (const [d, lbl] of [[3, 'A'], [5, 'B']]) {
  await X.board(w, d)
  const wa = await H.flight2(X, w, d, { to: '09:00', ld: '10:00', br: '08:00', front: 'bane', rear: null })
  const wb = await H.flight2(X, w, d, { to: '09:00', ld: '10:00', br: '08:00', front: 'boosh', rear: null }); const sec = 'wave ' + wb
  say('second aircraft seat', sec)
  await X.closeBoard(w)
}
say('Wed blocks', await page.evaluate(() => JSON.stringify(window.DAYS[2].dutywaves.map(b => b.label + '/' + b.sa + ':' + b.rows[0].str + '-' + b.rows[0].end + '-' + b.rows[0].id))))
say('Fri blocks', await page.evaluate(() => JSON.stringify(window.DAYS[4].dutywaves.map(b => b.label + '/' + b.sa + ':' + b.rows[0].str + '-' + b.rows[0].end + '-' + b.rows[0].id))))
for (const [d, lbl, ord] of [[3, 'A', 'plain first, SC second'], [5, 'B', 'SC first, plain second']]) {
  ww = await X.weekWarn(w, '#eWeek', d)
  say(`P2 fixture ${lbl} next-day strip`, ww.head, JSON.stringify(ww.items))
  await pic(w, `0${lbl === 'A' ? 3 : 4}-p2-${lbl}-strip`)
  const havoc = crewOf(ww.items).filter(l => /Havoc/.test(l)), ranger = crewOf(ww.items).filter(l => /Ranger/.test(l))
  row(S, SZ, `twin fixture ${lbl} (${ord}), both START 20:00 END blank; next day flights B 08:00`, 'plain-desk man (Havoc) has a crew-rest line (assumed end 21:00, clear 09:00); SC-desk man (Ranger) none', 'Havoc ' + JSON.stringify(havoc) + ' | Ranger ' + JSON.stringify(ranger), havoc.length === 1 && ranger.length === 0 ? 'PASS' : 'FAIL', `w1/s02/0${lbl === 'A' ? 3 : 4}-p2-${lbl}-strip.png`)
}
await X.fin(w)
