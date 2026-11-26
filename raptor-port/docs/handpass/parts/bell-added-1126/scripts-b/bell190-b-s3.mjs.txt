// bell190-b scenario group 3 (desktop): Ranger (member) files a Meeting for Saber and Moxie, and a Personal for Hex and
// Tally [F25, A18]; a member filer adds someone later [A19]; a member who is only IN a shared input tries to add, and
// tries leave for another — RECORD [F27, A20].
import * as L from './bell190-b-lib.mjs'
console.log('bell190-b-s3 v1')
const P = 'b-s3'
L.clearPics(P)
const { b, page, errs } = await L.launch('desk')
const log = (...a) => console.log(...a)
log('saber:', await L.as.saber(page))
await L.makeMoxie(page)
const ID = L.ID
// 3c's start: Saber files a Meeting for Ranger and Hex
await L.goInputs(page)
let before = await L.notices(page)
const r3c = await L.file(page, { from: 'list', type: 'Meeting', title: 'B3c Saber files', people: [ID.Ranger, ID.Hex], date: '2026-07-21' })
const iid3c = r3c.rows[0]?.iid
log('[3c start] rows', JSON.stringify(r3c.rows), 'notices', L.fmt(L.newNotices(await L.notices(page), before)))
await L.signOut(page)
log('ranger:', await L.as.ranger(page))
await L.goInputs(page)
async function step(key, o) {
  const before = await L.notices(page)
  const r = await L.file(page, { picBefore: `${P}-${key}-window`, ...o })
  const nn = L.newNotices(await L.notices(page), before)
  log(`[${key}] picked=${JSON.stringify(r.ppl)} open=${r.open} asked=${JSON.stringify(r.asked)} rows=${JSON.stringify(r.rows)}`)
  log(`[${key}] new notices (${nn.length}):\n    ${L.fmt(nn)}`)
  if (r.open) { await L.pic(page, `${P}-${key}-still-open`); log(`[${key}] window still open, says:`, await page.locator(L.WIN).innerText().then(t => t.replace(/\s+/g, ' ').slice(-300))); await L.closeWin(page) }
  return r
}
await step('3a', { from: 'list', type: 'Meeting', title: 'B3a Ranger for two', people: [ID.Saber, ID.Moxie], date: '2026-07-15' })
await L.goInputs(page)
await step('3a-personal', { from: 'list', type: 'Personal', title: 'B3a Personal two', people: [ID.Hex, ID.Tally], date: '2026-07-16' })
await L.goInputs(page)
const r3b = await step('3b', { from: 'list', type: 'Training', title: 'B3b Ranger and Hex', people: [ID.Ranger, ID.Hex], date: '2026-07-17' })
// 3b: Ranger, the filer, adds Moxie later in its own window
await L.goInputs(page)
await L.openFromList(page, r3b.rows[0].iid)
await L.setPeople(page, [ID.Ranger, ID.Hex, ID.Moxie], true)
await L.pic(page, `${P}-3b-ranger-adds-moxie`)
before = await L.notices(page)
const s3b = await L.save(page)
log(`[3b add] open=${s3b.open} asked=${JSON.stringify(s3b.asked)} now=${JSON.stringify(await L.input(page, r3b.rows[0].iid))}`)
log('[3b add] new notices:\n    ' + L.fmt(L.newNotices(await L.notices(page), before)))
if (s3b.open) await L.closeWin(page)
// 3c: Ranger, only IN Saber's Meeting, opens it and tries to add Tally
await L.goInputs(page)
await L.openFromList(page, iid3c)
await L.pic(page, `${P}-3c-ranger-opens`)
const win3c = await page.evaluate(w => {
  const el = document.querySelector(w)
  const tally = el.querySelector('[data-pp="nick"]')
  return { text: el.innerText.replace(/\s+/g, ' ').slice(-260), save: !!el.querySelector('#inpEditSave'), tallyDisabled: tally ? tally.disabled : 'no puck', several: el.querySelector('[data-testid="pp-several"]')?.getAttribute('aria-checked') }
}, L.WIN)
log('[3c] the window Ranger sees:', JSON.stringify(win3c))
before = await L.notices(page)
const tp = page.locator(`${L.WIN} [data-pp="nick"]`).first()
if (await tp.count()) { await tp.click({ force: true }).catch(e => log('tally press refused:', String(e).slice(0, 120))); await page.waitForTimeout(300) }
await L.pic(page, `${P}-3c-ranger-tries-tally`)
log('[3c] after the press on Tally: pressed=', await tp.getAttribute('aria-pressed').catch(() => '?'), ' chosen=', JSON.stringify(await L.chosenPeople(page)))
if (await page.locator('#inpEditSave').count()) { const s = await L.save(page); log('[3c] save:', JSON.stringify(s)); await L.pic(page, `${P}-3c-after-save`) }
log('[3c] the input now', JSON.stringify(await L.input(page, iid3c)), ' new notices:', L.fmt(L.newNotices(await L.notices(page), before)) || 'none')
await L.closeWin(page)
// 3d (A20): Ranger tries LL for Saber
await L.goInputs(page)
await L.openNewFromList(page)
await L.setType(page, 'LL')
await page.selectOption('#inpEditPerson', ID.Saber).catch(e => log('select Saber refused', String(e).slice(0, 100)))
await page.waitForTimeout(300)
await L.pickDates(page, '2026-07-22')
await L.pic(page, `${P}-3d-ranger-ll-for-saber`)
const opts = await page.evaluate(() => { const s = document.querySelector('#inpEditPerson'); return s ? { value: s.value, hasSaber: [...s.options].some(o => o.value === 'stiff'), n: s.options.length } : 'no person box' })
log('[3d] person box:', JSON.stringify(opts), ' why:', await page.locator('[data-testid="pp-why"]').innerText().catch(() => 'none'))
before = await L.notices(page)
const had = await L.inputIds(page)
const s3d = await L.save(page)
await L.pic(page, `${P}-3d-after-save`)
log('[3d] save:', JSON.stringify(s3d), ' made:', JSON.stringify(await L.made(page, had)), ' notices:', L.fmt(L.newNotices(await L.notices(page), before)) || 'none')
await L.closeWin(page)
const rb = await L.readBell(page, `${P}-ranger-bell`)
log('RANGER bell:', L.bellText(rb))
const all = await L.notices(page)
log('STORE Tally:', L.fmt(all.filter(n => n.to === ID.Tally)))
await L.signOut(page)
for (const [who, fn] of [['saber', L.as.saber], ['moxie', L.as.moxie], ['hex', L.as.hex]]) {
  log(who + ':', await fn(page))
  const r = await L.readBell(page, `${P}-${who}-bell`)
  log(who.toUpperCase() + ' bell:', L.bellText(r), JSON.stringify(r.lit))
  if (who === 'saber') { const t = await L.tapLine(page, 'B3a Ranger for two', `${P}-saber-tap-3a`); log('SABER tap 3a ->', JSON.stringify(t)); await L.closeWin(page) }
  await L.signOut(page)
}
log('errors', JSON.stringify(errs))
await b.close()
