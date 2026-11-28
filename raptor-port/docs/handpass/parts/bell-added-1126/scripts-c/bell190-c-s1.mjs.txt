// bell190-c S1 (desktop): Saber enters LL on Ranger's row with Auto-approve ON — one day (Wed 22 Jul), a run of three
// (Mon 27 – Wed 29 Jul, dragged), a half day (Wed 5 Aug, AM). Ranger's bell read on screen; each line tapped. [F35, A24, A45]
const L = await import('./bell190-c-lib.mjs')
console.log('bell190-c-s1 v1')
const w = await L.newWorld('desk')
await L.signIn(w, 'ad', 'a'); await L.toWar(w)
const all = []
async function step(label, fn, pic) {
  const before = await L.notices(w)
  const r = await fn()
  const after = await L.notices(w)
  const nw = L.newSince(before, after)
  console.log(`-- ${label}: ${JSON.stringify(r)} ; new lines ${nw.length}`); nw.forEach(n => console.log('   ' + L.fmt(n)))
  all.push({ label, r, nw })
  if (pic) await L.shot(w, pic)
  return nw
}
// one day
console.log('22 Jul before:', JSON.stringify(await L.cellText(w, 'bane', '2026-07-22')))
await step('one day LL 22 Jul', async () => {
  await L.openCell(w, 'bane', '2026-07-22')
  const a = await L.setAuto(w, true)
  await L.shot(w, 'c-s1-01-window')
  const p = await L.place(w, 'LL')
  return { auto: a, ...p, cell: await L.cellText(w, 'bane', '2026-07-22') }
}, 'c-s1-02-placed')
// three days by a drag along his row
console.log('27-29 Jul before:', JSON.stringify([await L.cellText(w, 'bane', '2026-07-27'), await L.cellText(w, 'bane', '2026-07-28'), await L.cellText(w, 'bane', '2026-07-29')]))
await step('three days LL 27-29 Jul (drag)', async () => {
  const open = await L.drag(w, ['bane', '2026-07-27'], ['bane', '2026-07-29'])
  const a = await L.setAuto(w, true, 'sel')
  const span = await w.page.locator(L.T('sel-span')).innerText().catch(() => null)
  await L.shot(w, 'c-s1-03-sheet')
  const p = await L.place(w, 'LL', 'sel')
  return { open, auto: a, span, ...p, cells: [await L.cellText(w, 'bane', '2026-07-27'), await L.cellText(w, 'bane', '2026-07-28'), await L.cellText(w, 'bane', '2026-07-29')] }
}, 'c-s1-04-placed')
// a half day
console.log('5 Aug before:', JSON.stringify(await L.cellText(w, 'bane', '2026-08-05')))
await step('half day LL AM 5 Aug', async () => {
  await L.openCell(w, 'bane', '2026-08-05')
  const a = await L.setAuto(w, true)
  await L.tap(w, L.T('portion-am'))
  await L.shot(w, 'c-s1-05-am')
  const p = await L.place(w, 'LL')
  return { auto: a, ...p, cell: await L.cellText(w, 'bane', '2026-08-05') }
}, 'c-s1-06-placed')
const mine = (await L.notices(w)).filter(n => n.to === 'stiff')
console.log('Saber own lines in store:', mine.length)
const sb = await L.bell(w, 'c-s1-07-saber-bell')
console.log('Saber bell on screen:', JSON.stringify(sb))
await L.tap(w, '#notifyBell').catch(() => {})
await L.signOut(w)
await L.signIn(w, 'us', 'us')
const rb = await L.bell(w, 'c-s1-08-ranger-bell')
console.log('Ranger bell:', JSON.stringify(rb, null, 1))
// tap each line in turn
let i = 0
for (const ln of rb.lines) {
  i++
  if (i > 1) { await L.bell(w, null) }
  const where = await L.tapLine(w, ln.id, `c-s1-1${i}-tap-line${i}`)
  console.log(`tap line ${i} "${ln.text}" ->`, JSON.stringify(where))
  await w.page.keyboard.press('Escape').catch(() => {})
  await w.page.waitForTimeout(300)
}
const rb2 = await L.bell(w, 'c-s1-19-ranger-bell-after')
console.log('Ranger bell after taps:', JSON.stringify(rb2.lines.map(l => [l.unread, l.text])))
console.log('errors', w.errs)
await L.closeAll()
