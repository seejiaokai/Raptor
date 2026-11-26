// bell190-c S4 (desktop): inputs filed from the Leave War for Ranger — OD over a dragged run (27-29 Jul), CSE from the
// one-day window (3 Aug), Other whole day (5 Aug) and AM (6 Aug) and Attach (7 Aug) from the window's ⋯, CSE for Ranger and
// Saber together (10-11 Aug) [F40, F41, A29, A30]; then Piston's approved LL offered a Move onto another day of Ranger's
// row [F43]. Ranger's bell read; each line tapped [A45].
const L = await import('./bell190-c-lib.mjs')
console.log('bell190-c-s4 v1')
const w = await L.newWorld('desk')
const P = w.page
async function step(label, fn, pic) {
  const before = await L.notices(w)
  const r = await fn()
  const nw = L.newSince(before, await L.notices(w))
  console.log(`-- ${label}: ${JSON.stringify(r)} ; new lines ${nw.length}`); nw.forEach(n => console.log('   ' + L.fmt(n)))
  if (pic) await L.shot(w, pic)
  return nw
}
const winText = () => P.evaluate(() => { const p = document.querySelector('[data-testid="bid-picker"], [data-testid="select-sheet"]'); if (p && p.getBoundingClientRect().height > 0) return 'WAR WINDOW: ' + p.innerText.replace(/\s+/g, ' ').trim().slice(0, 200); const s = document.querySelector('#inpEditSave'); if (s && s.getBoundingClientRect().height > 0) return 'INPUT WINDOW open'; return null })
await L.signIn(w, 'ad', 'a'); await L.toWar(w)
const d = ['2026-07-27', '2026-07-28', '2026-07-29', '2026-08-03', '2026-08-05', '2026-08-06', '2026-08-07', '2026-08-10', '2026-08-11']
console.log('Ranger before:', JSON.stringify(await Promise.all(d.map(async x => x.slice(5) + '=' + await L.cellText(w, 'bane', x)))))
await step('OD, dragged 27-29 Jul', async () => {
  const open = await L.drag(w, ['bane', '2026-07-27'], ['bane', '2026-07-29'])
  await L.tap(w, L.T('sel-file-OD')); await P.waitForTimeout(800)
  const t = await winText(); await L.shot(w, 'c-s4-01-after-OD')
  return { open, after: t, cells: await Promise.all(['2026-07-27', '2026-07-29'].map(x => L.cellText(w, 'bane', x))) }
}, null)
await step('CSE, one-day window 3 Aug', async () => {
  await L.openCell(w, 'bane', '2026-08-03')
  await L.tap(w, L.T('bid-file-CSE')); await P.waitForTimeout(800)
  const t = await winText(); await L.shot(w, 'c-s4-02-after-CSE')
  return { after: t, cell: await L.cellText(w, 'bane', '2026-08-03') }
}, null)
for (const [day, portion, btn, name] of [['2026-08-05', 'full', 'OTH', 'Other whole day'], ['2026-08-06', 'am', 'OTH', 'Other AM'], ['2026-08-07', 'full', 'ATCH', 'Attach']]) {
  await step(`${name}, ${day}`, async () => {
    await L.openCell(w, 'bane', day)
    if (portion === 'am') await L.tap(w, L.T('portion-am'))
    await L.tap(w, L.T('bid-more')); await P.waitForTimeout(300)
    await L.tap(w, L.T('bid-file-' + btn)); await P.waitForTimeout(800)
    let t = await winText()
    await L.shot(w, `c-s4-03-after-${btn}-${day.slice(8)}`)
    let saved = null
    if (t === 'INPUT WINDOW open') { await L.tap(w, '#inpEditSave'); await P.waitForTimeout(700); saved = await winText() }
    await L.closeWin(w)
    return { after: t, afterSave: saved, cell: await L.cellText(w, 'bane', day) }
  }, null)
}
await step('CSE for Ranger and Saber together, dragged 10-11 Aug', async () => {
  const open = await L.drag(w, ['bane', '2026-08-10'], ['stiff', '2026-08-11'])
  const who = await P.locator(L.T('sel-who')).innerText().catch(() => null)
  await L.tap(w, L.T('sel-file-CSE')); await P.waitForTimeout(800)
  const t = await winText(); await L.shot(w, 'c-s4-04-after-CSE-two')
  return { open, who, after: t, cells: [await L.cellText(w, 'bane', '2026-08-10'), await L.cellText(w, 'stiff', '2026-08-10')] }
}, null)
const ins = await P.evaluate(() => (window.INPUTS || []).filter(r => r && /2026-0[78]/.test(r.date || '') && JSON.stringify(r).includes('bane')).map(r => ({ iid: r.iid, type: r.type, date: r.date, end: r.endDate || null, people: (r.people || []).map(p => p.p), title: r.title || r.name || null })))
console.log('inputs for Ranger in Jul/Aug:', JSON.stringify(ins))
// F43 — Piston's approved LL on 17 Aug, Move, then a tap on Ranger's 18 Aug
await step('Piston LL 17 Aug, Auto-approve ON', async () => {
  await L.openCell(w, 'pump', '2026-08-17'); const a = await L.setAuto(w, true); const p = await L.place(w, 'LL'); await L.closeWin(w)
  return { autoOn: a, ...p, cell: await L.cellText(w, 'pump', '2026-08-17') }
}, null)
await step('Move Piston\'s 17 Aug LL: tap Ranger\'s 18 Aug', async () => {
  await L.openCell(w, 'pump', '2026-08-17')
  if (!(await L.vis(P, L.T('decide-shift')))) { await L.closeWin(w); return { offered: false } }
  await L.tap(w, L.T('decide-shift')); await P.waitForTimeout(450)
  const b0 = await P.locator(L.T('move-banner')).innerText().catch(() => null)
  await L.tap(w, L.T('cell-bane-2026-08-18')); await P.waitForTimeout(700)
  const b1 = await P.locator(L.T('move-banner')).innerText().catch(() => null)
  await L.shot(w, 'c-s4-05-move-tap-ranger-18')
  const conf = await L.vis(P, L.T('move-confirm'))
  if (conf) { await L.tap(w, L.T('move-confirm')); await P.waitForTimeout(500) }
  if (await L.vis(P, L.T('move-cancel'))) { await L.tap(w, L.T('move-cancel')); await P.waitForTimeout(300) }
  await L.closeWin(w)
  return { offered: true, banner0: b0, banner1: b1, confirmShown: conf, piston17: await L.cellText(w, 'pump', '2026-08-17'), piston18: await L.cellText(w, 'pump', '2026-08-18'), ranger18: await L.cellText(w, 'bane', '2026-08-18') }
}, 'c-s4-06-after-move')
console.log('Saber lines in store:', (await L.notices(w)).filter(n => n.to === 'stiff').length)
await L.signOut(w); await L.signIn(w, 'us', 'us')
const rb = await L.bell(w, 'c-s4-07-ranger-bell')
console.log('Ranger bell:', JSON.stringify({ lit: rb.lit && rb.lit.cls, lines: rb.lines.map(l => [l.unread, l.text]) }, null, 1))
let i = 0
for (const ln of rb.lines) {
  i++
  if (i > 1) await L.bell(w, null)
  const where = await L.tapLine(w, ln.id, `c-s4-1${i}-tap-line${i}`)
  const head = where.inputWindow ? await P.evaluate(() => { const s = document.querySelector('#inpEditSave'); const win = s && s.closest('.floatwin, .modal, [role=dialog], .win'); return win ? win.innerText.replace(/\s+/g, ' ').trim().slice(0, 140) : null }) : null
  console.log(`tap line ${i} "${ln.text}" ->`, JSON.stringify(where), head ? 'window reads: ' + head : '')
  if (where.inputWindow) await L.closeInput(w)
}
console.log('errors', w.errs)
await L.closeAll()
