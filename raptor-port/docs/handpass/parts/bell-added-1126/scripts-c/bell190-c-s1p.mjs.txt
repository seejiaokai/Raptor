// bell190-c S1p (phone, WebKit 402x874): Saber enters LL on Ranger's row, Auto-approve ON, Wed 22 Jul, and files OD for
// him on Thu 30 Jul from the same window; Ranger's bell read on the phone; each line tapped. [F35, A24, F40, A30, A45]
const L = await import('./bell190-c-lib.mjs')
console.log('bell190-c-s1p v1')
const w = await L.newWorld('phone')
await L.signIn(w, 'ad', 'a'); await L.toWar(w)
async function step(label, fn, pic) {
  const before = await L.notices(w)
  const r = await fn()
  const nw = L.newSince(before, await L.notices(w))
  console.log(`-- ${label}: ${JSON.stringify(r)} ; new lines ${nw.length}`); nw.forEach(n => console.log('   ' + L.fmt(n)))
  if (pic) await L.shot(w, pic)
}
console.log('22 Jul before:', JSON.stringify(await L.cellText(w, 'bane', '2026-07-22')), '30 Jul before:', JSON.stringify(await L.cellText(w, 'bane', '2026-07-30')))
await step('phone LL 22 Jul', async () => {
  const o = await L.openCell(w, 'bane', '2026-07-22', 'c-s1p-01-cell-tap')
  const a = await L.setAuto(w, true)
  await L.shot(w, 'c-s1p-02-window')
  const p = await L.place(w, 'LL', 'bid', 'c-s1p-03-LL-tap')
  return { open: o, auto: a, ...p, cell: await L.cellText(w, 'bane', '2026-07-22') }
}, 'c-s1p-04-placed')
await step('phone OD 30 Jul', async () => {
  const o = await L.openCell(w, 'bane', '2026-07-30')
  await L.tap(w, L.T('bid-file-OD'), 'c-s1p-05-OD-tap')
  await w.page.waitForTimeout(700)
  return { open: o, picker: await L.vis(w.page, L.T('bid-picker')), cell: await L.cellText(w, 'bane', '2026-07-30') }
}, 'c-s1p-06-od-placed')
await L.signOut(w)
await L.signIn(w, 'us', 'us')
await L.toWar(w).catch(() => {})
const rb = await L.bell(w, 'c-s1p-07-ranger-bell')
console.log('Ranger bell:', JSON.stringify(rb, null, 1))
let i = 0
for (const ln of rb.lines) {
  i++
  if (i > 1) await L.bell(w, `c-s1p-0${7 + i}-ranger-bell-again`)
  const where = await L.tapLine(w, ln.id, `c-s1p-1${i}-after-line${i}`)
  console.log(`tap line ${i} "${ln.text}" ->`, JSON.stringify(where))
  if (where.inputWindow) console.log('   closed the input window by Cancel:', await L.closeInput(w))
  await w.page.waitForTimeout(400)
}
console.log('errors', w.errs)
await L.closeAll()
