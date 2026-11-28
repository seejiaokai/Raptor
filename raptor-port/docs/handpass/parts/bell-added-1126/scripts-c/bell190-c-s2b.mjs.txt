// bell190-c S2 (desktop): Auto-approve OFF — a pending LL placed for Ranger (one day 22 Jul; a range 27-29 Jul) [F36, A25];
// then Saber approves 22 Jul from the day window and 27-29 Jul from Approvals [A28]; then Auto-approve ON over Ranger's
// own pending bids — LL over his LL on 9 Dec, OL over his LL on 10 Dec [F37].
const L = await import('./bell190-c-lib.mjs')
console.log('bell190-c-s2 v3')
const w = await L.newWorld('desk')
const log = []
async function step(label, fn, pic) {
  const before = await L.notices(w)
  const r = await fn()
  const nw = L.newSince(before, await L.notices(w))
  console.log(`-- ${label}: ${JSON.stringify(r)} ; new lines ${nw.length}`); nw.forEach(n => console.log('   ' + L.fmt(n)))
  if (pic) await L.shot(w, pic)
  return nw
}
await L.signIn(w, 'ad', 'a'); await L.toWar(w)
console.log('before:', JSON.stringify(['2026-07-22', '2026-07-27', '2026-07-28', '2026-07-29'].map(d => d)), JSON.stringify(await Promise.all(['2026-07-22', '2026-07-27', '2026-07-29'].map(d => L.cellText(w, 'bane', d)))))
await step('pending LL 22 Jul, Auto-approve OFF', async () => {
  await L.openCell(w, 'bane', '2026-07-22')
  const a = await L.setAuto(w, false)
  await L.shot(w, 'c-s2-01-window-off')
  const p = await L.place(w, 'LL')
  return { autoOn: a, ...p, cell: await L.cellText(w, 'bane', '2026-07-22') }
}, 'c-s2-02-pending-placed')
await step('pending LL 27-29 Jul (drag), Auto-approve OFF', async () => {
  const open = await L.drag(w, ['bane', '2026-07-27'], ['bane', '2026-07-29'])
  const a = await L.setAuto(w, false, 'sel')
  const p = await L.place(w, 'LL', 'sel')
  return { open, autoOn: a, ...p, cells: await Promise.all(['2026-07-27', '2026-07-28', '2026-07-29'].map(d => L.cellText(w, 'bane', d))) }
}, 'c-s2-03-range-pending')
await L.signOut(w); await L.signIn(w, 'us', 'us')
const b1 = await L.bell(w, 'c-s2-04-ranger-bell-after-pending')
console.log('Ranger bell after the pending bids:', JSON.stringify({ lit: b1.lit.cls, lines: b1.lines.map(l => l.text), list: b1.list }))
await L.tap(w, '#notifyBell').catch(() => {})
await L.signOut(w); await L.signIn(w, 'ad', 'a'); await L.toWar(w)
await step('approve 22 Jul from the day window', async () => {
  await L.openCell(w, 'bane', '2026-07-22')
  await L.shot(w, 'c-s2-05-day-window-pending')
  await L.tap(w, L.T('decide-approve')); await w.page.waitForTimeout(600)
  await L.closeWin(w)
  return { cell: await L.cellText(w, 'bane', '2026-07-22') }
}, null)
await step('approve 27-29 Jul from Approvals', async () => {
  await L.tap(w, L.T('lw-tab-approvals')); await w.page.waitForSelector(L.T('approvals-page'), { state: 'visible' }); await w.page.waitForTimeout(500)
  const lines = await w.page.evaluate(() => [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid="appr-line-bane"]')].filter(e => e.getBoundingClientRect().height > 0).map(e => e.innerText.replace(/\s+/g, ' ').trim()))
  console.log('   Ranger approvals lines:', JSON.stringify(lines))
  const i = lines.findIndex(t => t.includes('27 – Wed 29 Jul'))
  let pressed = false
  if (i >= 0) {
    pressed = await w.page.evaluate(i => { const l = [...document.querySelectorAll('[data-testid="approvals-page"] [data-testid="appr-line-bane"]')].filter(e => e.getBoundingClientRect().height > 0)[i]; const b = l && l.querySelector('[data-testid="appr-approve"]'); if (!b) return false; b.setAttribute('data-c2', '1'); return true }, i)
    await L.shot(w, 'c-s2-06-approvals-before')
    if (pressed) await L.tap(w, '[data-c2="1"]')
    await w.page.waitForTimeout(600)
  }
  await L.shot(w, 'c-s2-07-approvals-after')
  await L.tap(w, L.T('lw-tab-grid')); await w.page.waitForTimeout(500)
  return { line: i, pressed, cells: await Promise.all(['2026-07-27', '2026-07-28', '2026-07-29'].map(d => L.cellText(w, 'bane', d))) }
}, null)
// F37: Ranger's own bids — Saber first opens August for bidding (the bidding chip's window, its month toggle)
await w.page.evaluate(() => window.scrollTo(0, 0))
await L.tap(w, L.T('open-chip')); await w.page.waitForTimeout(600)
console.log('Dec state before:', await w.page.locator(L.T('od-month-2026-12')).getAttribute('data-state'))
await L.tap(w, L.T('od-month-2026-12')); await w.page.waitForTimeout(400)
console.log('Dec state after:', await w.page.locator(L.T('od-month-2026-12')).getAttribute('data-state'))
await L.shot(w, 'c-s2-075-bidding-dec-open')
await L.tap(w, L.T('open-dates-close')); await w.page.waitForTimeout(400)
await L.signOut(w); await L.signIn(w, 'us', 'us'); await L.toWar(w)
for (const d of ['2026-12-09', '2026-12-10']) {
  const o = await L.openCell(w, 'bane', d)
  const sw = await L.vis(w.page, L.T('bid-approve-tick'))
  const p = await L.place(w, 'LL')
  console.log(`Ranger's own LL bid ${d}: open ${o}, switch shown to him ${sw}, ${JSON.stringify(p)}, cell "${await L.cellText(w, 'bane', d)}"`)
}
await L.shot(w, 'c-s2-08-ranger-own-bids')
await L.signOut(w); await L.signIn(w, 'ad', 'a'); await L.toWar(w)
await step('Auto-approve ON, LL over his pending LL 9 Dec', async () => {
  await L.openCell(w, 'bane', '2026-12-09')
  const a = await L.setAuto(w, true)
  await L.shot(w, 'c-s2-09-window-over-his-bid')
  const p = await L.place(w, 'LL')
  const still = await L.vis(w.page, L.T('bid-picker'))
  await L.closeWin(w)
  return { autoOn: a, ...p, stillOpen: still, cell: await L.cellText(w, 'bane', '2026-12-09') }
}, 'c-s2-10-after-LL-over-bid')
await step('Auto-approve ON, OL over his pending LL 10 Dec', async () => {
  await L.openCell(w, 'bane', '2026-12-10')
  const a = await L.setAuto(w, true)
  const p = await L.place(w, 'OL')
  const still = await L.vis(w.page, L.T('bid-picker'))
  await L.closeWin(w)
  return { autoOn: a, ...p, stillOpen: still, cell: await L.cellText(w, 'bane', '2026-12-10') }
}, 'c-s2-11-after-OL-over-bid')
const saberLines = (await L.notices(w)).filter(n => n.to === 'stiff')
console.log('lines to Saber in the store:', saberLines.length, saberLines.map(L.fmt).join(' || '))
console.log('lines to anyone but Ranger in the store:', (await L.notices(w)).filter(n => n.to !== 'bane').map(L.fmt).join(' || ') || 'none')
await L.signOut(w); await L.signIn(w, 'us', 'us')
const b2 = await L.bell(w, 'c-s2-12-ranger-bell-final')
console.log('Ranger bell final:', JSON.stringify({ lit: b2.lit.cls, lines: b2.lines.map(l => [l.unread, l.text]) }, null, 1))
let i = 0
for (const ln of b2.lines) {
  i++
  if (i > 1) await L.bell(w, null)
  const where = await L.tapLine(w, ln.id, `c-s2-2${i}-tap-line${i}`)
  console.log(`tap line ${i} "${ln.text}" ->`, JSON.stringify(where))
  if (where.inputWindow) await L.closeInput(w)
}
console.log('errors', w.errs)
await L.closeAll()
