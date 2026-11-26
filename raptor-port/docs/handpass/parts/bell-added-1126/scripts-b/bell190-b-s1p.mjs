// bell190-b scenario group 1 on his iPhone's size (WebKit 402x874): "+ Input" by Saber for Ranger alone from the List,
// and one Meeting for Ranger, Moxie and Saber from a day opened on the calendar; Ranger and Moxie read their bells
// on the phone [F21 phone, F22, A13, A14].
import * as L from './bell190-b-lib.mjs'
console.log('bell190-b-s1p v1')
const P = 'b-s1p'
L.clearPics(P)
const { b, page, errs } = await L.launch('phone')
const log = (...a) => console.log(...a)
log('saber:', await L.as.saber(page))
await L.makeMoxie(page)
const ID = L.ID
await L.goInputs(page)
async function step(key, o) {
  const before = await L.notices(page)
  const r = await L.file(page, { picBefore: `${P}-${key}-window`, ...o })
  const nn = L.newNotices(await L.notices(page), before)
  log(`[${key}] picked=${JSON.stringify(r.ppl)} open=${r.open} asked=${JSON.stringify(r.asked)} rows=${JSON.stringify(r.rows)}`)
  log(`[${key}] new notices (${nn.length}):\n    ${L.fmt(nn)}`)
}
await step('p1', { from: 'list', type: 'Training', title: 'P1 Phone list', people: [ID.Ranger], date: '2026-07-15' })
await L.goInputs(page)
await step('p2', { from: 'day', type: 'Meeting', title: 'P2 Phone day', people: [ID.Ranger, ID.Moxie, ID.Saber], date: '2026-07-15' })
const sb = await L.readBell(page, `${P}-saber-bell`)
log('SABER bell:', L.bellText(sb), JSON.stringify(sb.lit))
await L.signOut(page)
log('ranger:', await L.as.ranger(page))
const rb = await L.readBell(page, `${P}-ranger-bell`)
log('RANGER bell:', L.bellText(rb), JSON.stringify(rb.lit))
const t = await L.tapLine(page, 'P1 Phone list', `${P}-ranger-tap-p1`)
log('RANGER tap P1 ->', JSON.stringify(t))
await L.closeWin(page)
await L.signOut(page)
log('moxie:', await L.as.moxie(page))
const mb = await L.readBell(page, `${P}-moxie-bell`)
log('MOXIE bell:', L.bellText(mb), JSON.stringify(mb.lit))
const t2 = await L.tapLine(page, 'P2 Phone day', `${P}-moxie-tap-p2`)
log('MOXIE tap P2 ->', JSON.stringify(t2))
await L.closeWin(page)
await L.signOut(page)
log('errors', JSON.stringify(errs))
await b.close()
