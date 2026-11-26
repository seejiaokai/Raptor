// bell190-c S1q (phone, WebKit 402x874): the run of three days (27-29 Jul, by the window's "Pick a range") and the half
// day (Wed 5 Aug, AM), Auto-approve ON; Ranger's bell read on the phone; each line tapped. [F35, A24]
const L = await import('./bell190-c-lib.mjs')
console.log('bell190-c-s1q v1')
const w = await L.newWorld('phone')
const P = w.page
const winText = () => P.evaluate(() => { const p = document.querySelector('[data-testid="bid-picker"], [data-testid="select-sheet"]'); return p && p.getBoundingClientRect().height > 0 ? p.innerText.replace(/\s+/g, ' ').trim().slice(0, 260) : null })
async function step(label, fn, pic) {
  const before = await L.notices(w)
  const r = await fn()
  const nw = L.newSince(before, await L.notices(w))
  console.log(`-- ${label}: ${JSON.stringify(r)} ; new lines ${nw.length}`); nw.forEach(n => console.log('   ' + L.fmt(n)))
  if (pic) await L.shot(w, pic)
}
await L.signIn(w, 'ad', 'a'); await L.toWar(w)
console.log('before:', JSON.stringify(await Promise.all(['2026-07-27', '2026-07-28', '2026-07-29', '2026-08-05'].map(d => L.cellText(w, 'bane', d)))))
await step('phone: three days 27-29 Jul by Pick a range', async () => {
  await L.openCell(w, 'bane', '2026-07-27')
  const a = await L.setAuto(w, true)
  await L.tap(w, L.T('span-range'), 'c-s1q-01-range-tap'); await P.waitForTimeout(500)
  const t1 = await winText()
  await L.shot(w, 'c-s1q-02-range-open')
  const ids = await P.evaluate(() => [...document.querySelectorAll('[data-testid="bid-picker"] [data-testid*="2026-07-2"], [data-testid="bid-picker"] [data-testid*="range"]')].map(e => e.dataset.testid).slice(0, 30).join(' '))
  const day29 = await P.evaluate(() => { const e = document.querySelector('[data-testid="bid-picker"] [data-testid$="2026-07-29"]'); return e ? e.dataset.testid : null })
  let p = null
  if (day29) {
    await L.tap(w, `[data-testid="bid-picker"] [data-testid="${day29}"]`, 'c-s1q-03-day29-tap'); await P.waitForTimeout(400)
    await L.shot(w, 'c-s1q-04-range-picked')
    p = await L.place(w, 'LL', 'bid', 'c-s1q-05-LL-tap')
  }
  return { auto: a, ids, day29, ...p, cells: await Promise.all(['2026-07-27', '2026-07-28', '2026-07-29'].map(d => L.cellText(w, 'bane', d))) }
}, 'c-s1q-06-range-placed')
await step('phone: half day AM 5 Aug', async () => {
  await L.openCell(w, 'bane', '2026-08-05')
  const a = await L.setAuto(w, true)
  await L.tap(w, L.T('portion-am'), 'c-s1q-07-am-tap')
  const p = await L.place(w, 'LL')
  return { auto: a, ...p, cell: await L.cellText(w, 'bane', '2026-08-05') }
}, 'c-s1q-08-am-placed')
await L.signOut(w); await L.signIn(w, 'us', 'us'); await L.toWar(w)
const rb = await L.bell(w, 'c-s1q-09-ranger-bell')
console.log('Ranger bell (phone):', JSON.stringify({ lit: rb.lit && rb.lit.cls, lines: rb.lines.map(l => [l.unread, l.text]) }))
let i = 0
for (const ln of rb.lines) {
  i++
  if (i > 1) await L.bell(w, null)
  console.log(`tap line ${i} "${ln.text}" ->`, JSON.stringify(await L.tapLine(w, ln.id, `c-s1q-1${i}-after-line${i}`)))
}
console.log('errors', w.errs)
await L.closeAll()
