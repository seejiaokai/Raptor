// bell190-b scenario group 1 (desktop): "+ Input" by Saber for Ranger alone, and for several — from the List and from a
// day opened on the calendar [F21, F22, A13, A14].
import * as L from './bell190-b-lib.mjs'
console.log('bell190-b-s1 v1')
const P = 'b-s1'
L.clearPics(P)
const { b, page, errs } = await L.launch('desk')
const log = (...a) => console.log(...a)
log('saber:', await L.as.saber(page))
const mox = await L.makeMoxie(page); log('Moxie made, id', mox)
const ID = L.ID
await L.goInputs(page)
const steps = {}
async function step(key, o) {
  const before = await L.notices(page)
  const r = await L.file(page, { picBefore: `${P}-${key}-window`, ...o })
  const after = await L.notices(page)
  const nn = L.newNotices(after, before)
  log(`[${key}] picked=${JSON.stringify(r.ppl)} open=${r.open} asked=${JSON.stringify(r.asked)} rows=${JSON.stringify(r.rows)}`)
  log(`[${key}] new notices (${nn.length}):\n    ${L.fmt(nn)}`)
  steps[key] = { r, nn }
  await page.waitForTimeout(300)
}
// 1a — List, Training for Ranger alone, Wed 15 Jul (no title, so the line reads the kind)
await step('1a', { from: 'list', type: 'Training', people: [ID.Ranger], date: '2026-07-15' })
// 1b — a day opened on the calendar, Training for Ranger alone, Wed 15 Jul
await step('1b', { from: 'day', type: 'Training', title: 'B1b Day train', people: [ID.Ranger], date: '2026-07-15' })
// 1c — List, one Meeting for Ranger, Moxie and Saber himself
await L.goInputs(page)
await step('1c', { from: 'list', type: 'Meeting', title: 'B1c Meet three', people: [ID.Ranger, ID.Moxie, ID.Saber], date: '2026-07-15' })
// 1d — a day opened on the calendar, one Training for Ranger, Hex and Tally (Saber not in it), Thu 16 Jul
await L.goInputs(page)
await step('1d', { from: 'day', type: 'Training', title: 'B1d Day three', people: [ID.Ranger, ID.Hex, ID.Tally], date: '2026-07-16' })
// 1e — a day opened on the calendar, one Meeting for Ranger, Moxie and Saber, Thu 16 Jul
await L.goInputs(page)
await step('1e', { from: 'day', type: 'Meeting', title: 'B1e Day meet', people: [ID.Ranger, ID.Moxie, ID.Saber], date: '2026-07-16' })
// Saber's own bell — the actor
const sb = await L.readBell(page, `${P}-saber-bell`)
log('SABER bell:', L.bellText(sb), JSON.stringify(sb.lit))
const all = await L.notices(page)
log('store, every line to Saber:', all.filter(n => n.to === ID.Saber).length, ' to Tally:', L.fmt(all.filter(n => n.to === ID.Tally)), ' to Hex:', L.fmt(all.filter(n => n.to === ID.Hex)))
await L.signOut(page)
// Ranger
log('ranger:', await L.as.ranger(page))
const rb = await L.readBell(page, `${P}-ranger-bell`)
log('RANGER bell:', L.bellText(rb), JSON.stringify(rb.lit))
const t1 = await L.tapLine(page, 'B1c', `${P}-ranger-tap-1c`)
log('RANGER tap B1c ->', JSON.stringify(t1))
await L.closeWin(page)
const rb2 = await L.readBell(page, null)
const t2 = await L.tapLine(page, 'Training', `${P}-ranger-tap-1a`)
log('RANGER tap Training (1a) ->', JSON.stringify(t2))
await L.closeWin(page)
await L.signOut(page)
// Moxie
log('moxie:', await L.as.moxie(page))
const mb = await L.readBell(page, `${P}-moxie-bell`)
log('MOXIE bell:', L.bellText(mb), JSON.stringify(mb.lit))
const t3 = await L.tapLine(page, 'B1e', `${P}-moxie-tap-1e`)
log('MOXIE tap B1e ->', JSON.stringify(t3))
await L.closeWin(page)
await L.signOut(page)
// Hex (an existing sign-in on the roster)
log('hex:', await L.as.hex(page))
const hb = await L.readBell(page, `${P}-hex-bell`)
log('HEX bell:', L.bellText(hb), JSON.stringify(hb.lit))
await L.signOut(page)
log('errors', JSON.stringify(errs))
await b.close()
