// bell190-c S3b (desktop): Kilo (added on Admin -> Users) sits in the OPS P group under Gambit, far from Ranger, so the
// several-people drag is walked over Gambit's and Kilo's rows — Kilo's bell read on screen, Gambit's in the store [F38, A26];
// Kilo's approved LL then offered a Move toward Ranger's row [F43]; Kilo posted out (Delete) from 14 Dec, then the same
// drag over both on 15-16 Dec, where Kilo's part should be kept back [A27, F39].
const L = await import('./bell190-c-lib.mjs')
console.log('bell190-c-s3b v1')
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
const pickerText = () => P.evaluate(() => { const p = document.querySelector('[data-testid="bid-picker"], [data-testid="select-sheet"]'); return p ? p.innerText.replace(/\s+/g, ' ').trim().slice(0, 300) : null })
await L.signIn(w, 'ad', 'a')
await P.evaluate(() => window.go('admin')); await P.waitForTimeout(1200)
await P.fill('#accAddCs', 'Kilo'); await P.fill('#accAddIni', 'KL')
await P.selectOption('#accAddSeat', 'FCP'); await P.waitForTimeout(300)
await P.selectOption('#accAddCat', 'C')
await P.fill('#accAddName', 'kilo')
await P.click('#accAddPostIn'); await P.waitForTimeout(400)
for (let i = 0; i < 14 && !/January 2026/.test(await P.locator(L.T('dcal-title')).innerText()); i++) { await P.click(L.T('dcal-prev')); await P.waitForTimeout(150) }
await P.click(L.T('dcal-day-2026-01-01')); await P.waitForTimeout(300)
console.log('post-in reads:', (await P.locator('#accAddPostIn').innerText()).replace(/\s+/g, ' '))
await P.click('#accAdd'); await P.waitForTimeout(800)
const kp = await P.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k] && window.PEOPLE[k].cs === 'Kilo' && !window.PEOPLE[k].deleted) || null)
console.log('Kilo pid:', kp, 'Admin row:', await P.evaluate(pid => { const e = document.querySelector(`#page-admin [data-person="${pid}"]`); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null }, kp))
await L.toWar(w)
const order = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].map(e => e.dataset.testid.slice(4)))
const iK = order.indexOf(kp)
console.log('Kilo row', iK, 'above him:', order[iK - 1], 'below him:', order[iK + 1])
const nb = order[iK - 1]
const cells = async (d) => [nb + ':' + await L.cellText(w, nb, d), 'kilo:' + await L.cellText(w, kp, d)]
console.log('2/3 Dec before:', JSON.stringify([...(await cells('2026-12-02')), ...(await cells('2026-12-03'))]))
await step('(a) drag Gambit..Kilo 2-3 Dec, LL, Auto-approve ON', async () => {
  const open = await L.drag(w, [nb, '2026-12-02'], [kp, '2026-12-03'])
  const who = await P.locator(L.T('sel-who')).innerText().catch(() => null)
  const span = await P.locator(L.T('sel-span')).innerText().catch(() => null)
  const a = await L.setAuto(w, true, 'sel')
  await L.shot(w, 'c-s3b-01-sheet-gambit-kilo')
  const p = await L.place(w, 'LL', 'sel')
  if (!p.closed) console.log('   sheet still open:', await pickerText())
  return { open, who, span, autoOn: a, ...p, after: [...(await cells('2026-12-02')), ...(await cells('2026-12-03'))] }
}, 'c-s3b-02-placed')
await step('(d0) Kilo LL 10 Dec, Auto-approve ON', async () => {
  await L.openCell(w, kp, '2026-12-10'); const a = await L.setAuto(w, true); const p = await L.place(w, 'LL')
  const t = p.closed ? null : await pickerText()
  await L.closeWin(w)
  return { autoOn: a, ...p, windowText: t, cell: await L.cellText(w, kp, '2026-12-10') }
}, null)
await step('(d) Move: Kilo\'s 10 Dec LL toward Ranger\'s row', async () => {
  await L.openCell(w, kp, '2026-12-10')
  const offered = await L.vis(P, L.T('decide-shift'))
  if (!offered) { const t = await pickerText(); await L.closeWin(w); return { offered, windowText: t } }
  await L.tap(w, L.T('decide-shift')); await P.waitForTimeout(450)
  const banner0 = await P.locator(L.T('move-banner')).innerText().catch(() => null)
  await L.shot(w, 'c-s3b-03-move-banner')
  await L.reach(w, 'bane', '2026-12-10')
  await L.tap(w, L.T('cell-bane-2026-12-10')); await P.waitForTimeout(700)
  const banner1 = await P.locator(L.T('move-banner')).innerText().catch(() => null)
  const opened = await pickerText()
  await L.shot(w, 'c-s3b-04-move-tap-on-ranger')
  if (await L.vis(P, L.T('move-confirm'))) { await L.tap(w, L.T('move-confirm')); await P.waitForTimeout(500) }
  if (await L.vis(P, L.T('move-cancel'))) { await L.tap(w, L.T('move-cancel')); await P.waitForTimeout(300) }
  await L.closeWin(w)
  return { offered, banner0, banner1, opened, kilo: await L.cellText(w, kp, '2026-12-10'), ranger: await L.cellText(w, 'bane', '2026-12-10') }
}, 'c-s3b-05-after-move')
const po = await (async () => {
  await L.openCell(w, kp, '2026-12-14')
  await L.tap(w, L.T('bid-more')); await P.waitForTimeout(250)
  await L.tap(w, L.T('bid-postout')); await P.waitForTimeout(400)
  if ((await P.locator(L.T('po-delete')).getAttribute('aria-pressed')) !== 'true') await L.tap(w, L.T('po-delete'))
  const line = await P.locator(L.T('po-line')).innerText().catch(() => null)
  await L.tap(w, L.T('po-confirm')); await P.waitForTimeout(300)
  if (await L.vis(P, L.T('po-delete-go'))) { await L.tap(w, L.T('po-delete-go')); await P.waitForTimeout(600) }
  await L.closeWin(w)
  return { line, cls15: await P.evaluate(s => document.querySelector(s)?.className, L.T(`cell-${kp}-2026-12-15`)) }
})()
console.log('posting out:', JSON.stringify(po))
await L.shot(w, 'c-s3b-06-posted-out')
console.log('15/16 Dec before:', JSON.stringify([...(await cells('2026-12-15')), ...(await cells('2026-12-16'))]))
await step('(e) drag Gambit..Kilo 15-16 Dec, LL, Auto-approve ON (Kilo posted out from 14 Dec)', async () => {
  const open = await L.drag(w, [nb, '2026-12-15'], [kp, '2026-12-16'])
  const who = await P.locator(L.T('sel-who')).innerText().catch(() => null)
  const a = open ? await L.setAuto(w, true, 'sel') : null
  if (open) await L.shot(w, 'c-s3b-07-sheet-mixed')
  const p = open ? await L.place(w, 'LL', 'sel') : null
  const t = p && !p.closed ? await pickerText() : null
  await L.shot(w, 'c-s3b-08-after-mixed-press')
  await L.closeWin(w)
  return { open, who, autoOn: a, ...p, windowText: t, after: [...(await cells('2026-12-15')), ...(await cells('2026-12-16'))] }
}, 'c-s3b-09-placed-mixed')
const pend = await P.evaluate(pid => (window.INPUTS || []).filter(r => r && JSON.stringify(r).includes(pid) && /2026-12-1[56]/.test(JSON.stringify(r))).map(r => ({ type: r.type, date: r.date, lw: r.lw || null })), kp)
console.log('Kilo inputs on 15/16 Dec:', JSON.stringify(pend))
console.log('STORE, every line this run:'); (await L.notices(w)).forEach(n => console.log('   ' + L.fmt(n)))
await L.signOut(w); await L.signIn(w, 'kilo', 'k')
const kb = await L.bell(w, 'c-s3b-10-kilo-bell')
console.log('Kilo bell:', JSON.stringify({ lit: kb.lit && kb.lit.cls, lines: kb.lines.map(l => [l.unread, l.text]), list: kb.list }, null, 1))
if (kb.lines[0]) console.log('Kilo tap line 1 ->', JSON.stringify(await L.tapLine(w, kb.lines[0].id, 'c-s3b-11-kilo-tap-line1')))
console.log('errors', w.errs)
await L.closeAll()
