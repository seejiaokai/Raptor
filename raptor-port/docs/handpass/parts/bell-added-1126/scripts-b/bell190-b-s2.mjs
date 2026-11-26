// bell190-b scenario group 2 (desktop): an existing input's own window — Ranger added, opened from the List, a calendar
// bar and a day's card [F23, A15]; one save that takes one man off and adds two [A16]; a filer not in it told [F24, A21].
import * as L from './bell190-b-lib.mjs'
console.log('bell190-b-s2 v1')
const P = 'b-s2'
L.clearPics(P)
const { b, page, errs } = await L.launch('desk')
const log = (...a) => console.log(...a)
log('saber:', await L.as.saber(page))
await L.makeMoxie(page)
const ID = L.ID
await L.goInputs(page)
const iids = {}
async function fileIt(key, o) {
  const before = await L.notices(page)
  const r = await L.file(page, o)
  const nn = L.newNotices(await L.notices(page), before)
  iids[key] = r.rows[0]?.iid
  log(`[${key} filed] rows=${JSON.stringify(r.rows)} notices(${nn.length}): ${L.fmt(nn)}`)
}
async function editIt(key, route, iso, ids) {
  await L.goInputs(page)
  const iid = iids[key]
  if (route === 'list') {
    try { await L.openFromList(page, iid) } catch (e) {
      await L.pic(page, `${P}-${key}-list-missing`)
      const found = await page.evaluate(iid => [...document.querySelectorAll(`[data-iid="${iid}"]`)].map(e => e.tagName + '.' + e.className + ' w=' + e.getBoundingClientRect().width), iid)
      log(`[${key}] NOT FOUND on the List as a visible row; elements with its id: ${JSON.stringify(found)}; list filter person=${await page.locator('#inFPerson').inputValue().catch(() => '?')}`)
      await L.goInputs(page); route = 'bar'; await L.openFromBar(page, iid, iso)
    }
  }
  else if (route === 'bar') await L.openFromBar(page, iid, iso)
  else await L.openFromDayCard(page, iid, iso)
  await L.pic(page, `${P}-${key}-opened-${route}`)
  await L.setPeople(page, ids, true)
  const ppl = await L.chosenPeople(page)
  await L.pic(page, `${P}-${key}-edited`)
  const before = await L.notices(page)
  const r = await L.save(page)
  const nn = L.newNotices(await L.notices(page), before)
  log(`[${key} edit via ${route}] picked=${JSON.stringify(ppl)} open=${r.open} asked=${JSON.stringify(r.asked)} now=${JSON.stringify(await L.input(page, iid))}`)
  log(`[${key} edit] new notices (${nn.length}):\n    ${L.fmt(nn)}`)
  if (r.open) await L.closeWin(page)
}
// 2a: Tally alone; Saber adds Ranger from the List
await fileIt('2a', { from: 'list', type: 'Training', title: 'B2a Tally solo', people: [ID.Tally], date: '2026-07-15' })
await editIt('2a', 'list', '2026-07-15', [ID.Tally, ID.Ranger])
// 2b: Hex alone; Saber adds Ranger from a calendar bar
await L.goInputs(page)
await fileIt('2b', { from: 'list', type: 'Training', title: 'B2b Hex solo', people: [ID.Hex], date: '2026-07-16' })
await editIt('2b', 'bar', '2026-07-16', [ID.Hex, ID.Ranger])
// 2c: Moxie and Hex share a Meeting; Saber adds Ranger from the opened day's card
await L.goInputs(page)
await fileIt('2c', { from: 'list', type: 'Meeting', title: 'B2c Mox Hex', people: [ID.Moxie, ID.Hex], date: '2026-07-17' })
await editIt('2c', 'day', '2026-07-17', [ID.Moxie, ID.Hex, ID.Ranger])
// 2d (A16): Hex and Tally; one save takes Tally off and adds Ranger and Moxie
await L.goInputs(page)
await fileIt('2d', { from: 'list', type: 'Training', title: 'B2d Swap', people: [ID.Hex, ID.Tally], date: '2026-07-15' })
await editIt('2d', 'list', '2026-07-15', [ID.Hex, ID.Ranger, ID.Moxie])
// Saber, the actor, has nothing
const sb = await L.readBell(page, `${P}-saber-bell`)
log('SABER bell:', L.bellText(sb))
await L.signOut(page)
// 2e (F24, A21): Ranger files a Meeting for Tally only; Saber then adds Moxie in its window
log('ranger:', await L.as.ranger(page))
await L.goInputs(page)
{ const before = await L.notices(page)
  const r = await L.file(page, { from: 'list', type: 'Meeting', title: 'B2e Ranger files', people: [ID.Tally], date: '2026-07-20', picBefore: `${P}-2e-ranger-window` })
  iids['2e'] = r.rows[0]?.iid
  const nn = L.newNotices(await L.notices(page), before)
  log(`[2e filed by Ranger] open=${r.open} asked=${JSON.stringify(r.asked)} rows=${JSON.stringify(r.rows)} notices(${nn.length}): ${L.fmt(nn)}`)
  if (r.open) { await L.pic(page, `${P}-2e-ranger-refused`); await L.closeWin(page) } }
await L.signOut(page)
log('saber:', await L.as.saber(page))
await L.goInputs(page)
if (iids['2e']) await editIt('2e', 'list', '2026-07-20', [ID.Tally, ID.Moxie])
const all = await L.notices(page)
log('STORE Tally:', L.fmt(all.filter(n => n.to === ID.Tally)))
log('STORE Saber count:', all.filter(n => n.to === ID.Saber).length)
await L.signOut(page)
for (const [who, fn] of [['ranger', L.as.ranger], ['moxie', L.as.moxie], ['hex', L.as.hex]]) {
  log(who + ':', await fn(page))
  const r = await L.readBell(page, `${P}-${who}-bell`)
  log(who.toUpperCase() + ' bell:', L.bellText(r), JSON.stringify(r.lit))
  if (who === 'ranger') { const t = await L.tapLine(page, 'B2b Hex solo', `${P}-ranger-tap-2b`); log('RANGER tap 2b ->', JSON.stringify(t)); await L.closeWin(page)
    await L.readBell(page, null); const t2 = await L.tapLine(page, 'B2e Ranger files', `${P}-ranger-tap-2e`); log('RANGER tap 2e ->', JSON.stringify(t2)); await L.closeWin(page) }
  if (who === 'hex') { const t = await L.tapLine(page, 'B2d Swap', `${P}-hex-tap-2d`); log('HEX tap 2d ->', JSON.stringify(t)); await L.closeWin(page) }
  await L.signOut(page)
}
log('errors', JSON.stringify(errs))
await b.close()
