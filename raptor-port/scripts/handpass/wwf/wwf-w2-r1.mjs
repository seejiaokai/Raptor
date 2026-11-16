/* wwf w2 R1 — two desks of one man. usage: [PHONE=1] [ORDER=scfirst|plainfirst] node scripts/handpass/wwf/wwf-w2-r1.mjs */
import * as H from './wwf-w2-lib.mjs'
const PHONE = process.env.PHONE === '1'
const ORDER = process.env.ORDER || 'scfirst'
const RUN = `r1-${ORDER}-${PHONE ? 'p' : 'd'}`
const X = await H.init(RUN, PHONE)
const { say, sleep, row, pic } = X
const w = await X.open({ phone: PHONE })
const { page } = w
const SZ = PHONE ? 'phone' : 'desktop'
const S = 'R1 ' + ORDER
const FRI = 4, SAT = 5
const crewOf = ls => ls.filter(l => H.crew(l))
const P = n => `w2/${RUN}/${n}.png`
await H.gotoWeek(X, w, H.SUNDAY_WK, 'editsched')
const mk = tpl => H.makeDesk(X, w, FRI, { tpl, str: '20:00', end: '', people: ['bane'], role: 'SXO AM' })
const first = await mk(ORDER === 'scfirst' ? 'sc' : '')
await pic(w, '01-first-desk')
const second = await mk(ORDER === 'scfirst' ? '' : 'sc')
await pic(w, '02-both-desks')
const scWi = ORDER === 'scfirst' ? first.wi : second.wi
const blocks = await page.evaluate(d => JSON.stringify(window.DAYS[d].dutywaves.map(b => b.label + '/' + (b.sa || '-') + ':' + b.rows.map(r => r.role + ' ' + r.str + '-' + r.end + ' ' + JSON.stringify(r.id)).join('|'))), FRI)
say('Fri blocks', blocks)
await X.closeBoard(w)
await X.board(w, SAT)
await H.flight2(X, w, SAT, { to: '10:00', ld: '11:00', br: '07:00', front: 'bane', rear: null })
await pic(w, '03-sat-flight')
await X.closeBoard(w)
const read = async tag => {
  await H.gotoWeek(X, w, H.SUNDAY_WK, 'editsched')
  const sat = await X.weekWarn(w, '#eWeek', SAT); const fri = await X.weekWarn(w, '#eWeek', FRI)
  await pic(w, `${tag}-sat-strip`)
  const dd = await X.dayDetails(w, '#eWeek', SAT); await pic(w, `${tag}-sat-details`); await X.closeDayPop(w, 'done')
  say(tag, 'SAT', sat.head, JSON.stringify(sat.items), 'FRI', JSON.stringify(fri.items), 'DET', JSON.stringify(dd.items))
  return { sat, fri, dd }
}
const rangerFri = fri => fri.items.filter(l => /Ranger/.test(l) && /conflict|double|clash|overlap/i.test(l))
let r = await read('04')
let sc = crewOf(r.sat.items).filter(l => /Ranger/.test(l)), dc = crewOf(r.dd.items || []).filter(l => /Ranger/.test(l))
row(S, SZ, 'Fri SC desk + plain desk, SXO AM, 20:00, END blank, Ranger; Sat flight B 07:00 TO 10:00', 'exactly ONE crew-rest line for Ranger naming duty ended 21:00; Friday no self-conflict', `sat lines ${JSON.stringify(sc)} | details ${JSON.stringify(dc)} | Fri self-conflict ${JSON.stringify(rangerFri(r.fri))} | Fri items ${JSON.stringify(r.fri.items)}`, sc.length === 1 && /21:00/.test(sc[0]) && !rangerFri(r.fri).length && dc.length === 1 ? 'PASS' : 'FAIL', P('04-sat-strip'))
// END 23:00 on the SC desk
await H.setEnd(X, w, FRI, scWi, 0, '23:00'); await pic(w, '05-end-2300-board'); await X.closeBoard(w)
r = await read('06')
sc = crewOf(r.sat.items).filter(l => /Ranger/.test(l))
row(S, SZ, 'type SC desk END 23:00', 'crew-rest line now names 23:00 (later end wins), one line', `sat lines ${JSON.stringify(sc)} | Fri self-conflict ${JSON.stringify(rangerFri(r.fri))}`, sc.length === 1 && /23:00/.test(sc[0]) ? 'PASS' : 'FAIL', P('06-sat-strip'))
await H.setEnd(X, w, FRI, scWi, 0, ''); await X.closeBoard(w)
r = await read('07')
sc = crewOf(r.sat.items).filter(l => /Ranger/.test(l))
row(S, SZ, 'clear SC desk END again', 'back to one line naming 21:00', `sat lines ${JSON.stringify(sc)} | Fri self-conflict ${JSON.stringify(rangerFri(r.fri))}`, sc.length === 1 && /21:00/.test(sc[0]) ? 'PASS' : 'FAIL', P('07-sat-strip'))
await X.fin(w)
