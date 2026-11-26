// bell190-b scenario group 4 (desktop): a Personal for Ranger and Hex, then Moxie added [F28, A17]; ALL AVAIL alone and
// ALL filed by a member [F29, A33]; Ranger added by name beside ALL AVAIL, alone and with a named man [A34].
import * as L from './bell190-b-lib.mjs'
console.log('bell190-b-s4 v1')
const P = 'b-s4'
L.clearPics(P)
const { b, page, errs } = await L.launch('desk')
const log = (...a) => console.log(...a)
log('saber:', await L.as.saber(page))
await L.makeMoxie(page)
const ID = L.ID
const iids = {}
async function fileIt(key, o) {
  await L.goInputs(page)
  const before = await L.notices(page)
  const r = await L.file(page, { picBefore: `${P}-${key}-window`, ...o })
  const nn = L.newNotices(await L.notices(page), before)
  iids[key] = r.rows[0]?.iid
  log(`[${key} filed] picked=${JSON.stringify(r.ppl)} open=${r.open} asked=${JSON.stringify(r.asked)} rows=${JSON.stringify(r.rows)}`)
  log(`[${key} filed] new notices (${nn.length}):\n    ${L.fmt(nn)}`)
  if (r.open) { await L.pic(page, `${P}-${key}-still-open`); await L.closeWin(page) }
}
async function addTo(key, ids) {
  await L.goInputs(page)
  await L.openFromList(page, iids[key])
  await L.setPeople(page, ids, true)
  const ppl = await L.chosenPeople(page)
  await L.pic(page, `${P}-${key}-edit`)
  const before = await L.notices(page)
  const r = await L.save(page)
  const nn = L.newNotices(await L.notices(page), before)
  log(`[${key} edit] picked=${JSON.stringify(ppl)} open=${r.open} asked=${JSON.stringify(r.asked)} now=${JSON.stringify(await L.input(page, iids[key]))}`)
  log(`[${key} edit] new notices (${nn.length}):\n    ${L.fmt(nn)}`)
  if (r.open) { await L.pic(page, `${P}-${key}-edit-still-open`); log('   window says', (await page.locator(L.WIN).innerText()).replace(/\s+/g, ' ').slice(0, 300)); await L.closeWin(page) }
}
// 4a: Personal for Ranger and Hex; then Moxie added
await fileIt('4a', { from: 'list', type: 'Personal', title: 'B4a Personal', people: [ID.Ranger, ID.Hex], date: '2026-07-15' })
await addTo('4a', [ID.Ranger, ID.Hex, ID.Moxie])
// 4b: ALL AVAIL alone, a weekday Training
await fileIt('4b', { from: 'list', type: 'Training', title: 'B4b All avail', people: ['allavail'], date: '2026-07-15' })
// 4c (A34): Ranger added by name beside ALL AVAIL (the input of 4b)
await addTo('4b', ['allavail', ID.Ranger])
// 4d (A34): ALL AVAIL with Moxie named; Ranger added by name
await fileIt('4d', { from: 'list', type: 'Training', title: 'B4d Avail Moxie', people: ['allavail', ID.Moxie], date: '2026-07-17' })
await addTo('4d', ['allavail', ID.Moxie, ID.Ranger])
const sb = await L.readBell(page, `${P}-saber-bell`)
log('SABER bell:', L.bellText(sb))
await L.signOut(page)
// 4e (F29): Ranger (member) files a Meeting for ALL on Thu 16 Jul
log('ranger:', await L.as.ranger(page))
await fileIt('4e', { from: 'list', type: 'Meeting', title: 'B4e Ranger ALL', people: ['all'], date: '2026-07-16' })
const all = await L.notices(page)
log('STORE every line about 4b/4e:', L.fmt(all.filter(n => n.iid === iids['4b'] || n.iid === iids['4e'])))
const rb = await L.readBell(page, `${P}-ranger-bell`)
log('RANGER bell:', L.bellText(rb), JSON.stringify(rb.lit))
const t = await L.tapLine(page, 'B4b All avail', `${P}-ranger-tap-4b`)
log('RANGER tap 4b ->', JSON.stringify(t)); await L.closeWin(page)
await L.signOut(page)
for (const [who, fn] of [['moxie', L.as.moxie], ['hex', L.as.hex]]) {
  log(who + ':', await fn(page))
  const r = await L.readBell(page, `${P}-${who}-bell`)
  log(who.toUpperCase() + ' bell:', L.bellText(r), JSON.stringify(r.lit))
  await L.signOut(page)
}
log('errors', JSON.stringify(errs))
await b.close()
