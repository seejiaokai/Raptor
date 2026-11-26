// bell190-c S3 (desktop): a third man with a sign-in (Kilo, added on Admin -> Users), then on the Leave War, Auto-approve ON:
// (a) a drag over Ranger's and Kilo's rows [F38, A26]; (b) Ranger and Saber together [A26]; (c) Ranger's own pending bid
// then OL placed over it [F37b]; (d) Kilo's approved LL moved toward Ranger's row [F43]; (e) Kilo posted out, then a drag
// over both where Kilo's part is kept back [A27, F39].
const L = await import('./bell190-c-lib.mjs')
console.log('bell190-c-s3 v1')
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
await L.signIn(w, 'ad', 'a')
// Kilo, through the app's own form
await P.evaluate(() => window.go('admin')); await P.waitForTimeout(1200)
await P.fill('#accAddCs', 'Kilo'); await P.fill('#accAddIni', 'KL')
await P.selectOption('#accAddSeat', 'FCP'); await P.waitForTimeout(300)
await P.selectOption('#accAddCat', 'C')
await P.fill('#accAddName', 'kilo')
await P.click('#accAddPostIn'); await P.waitForTimeout(400)
for (let i = 0; i < 14; i++) {
  const t = await P.locator(L.T('dcal-title')).innerText()
  if (/January 2026/.test(t)) break
  await P.click(L.T('dcal-prev')); await P.waitForTimeout(150)
}
console.log('post-in calendar on:', await P.locator(L.T('dcal-title')).innerText())
await P.click(L.T('dcal-day-2026-01-01')); await P.waitForTimeout(300)
console.log('post-in reads:', await P.locator('#accAddPostIn').innerText())
await L.shot(w, 'c-s3-01-add-kilo')
await P.click('#accAdd'); await P.waitForTimeout(800)
const kp = await P.evaluate(() => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k] && window.PEOPLE[k].cs === 'Kilo' && !window.PEOPLE[k].deleted) || null)
console.log('Kilo pid:', kp)
await L.shot(w, 'c-s3-02-kilo-added')
await L.toWar(w)
await P.waitForSelector(L.T('row-' + kp), { state: 'attached', timeout: 10000 }).catch(() => console.log('NO ROW for Kilo'))
const order = await P.evaluate(() => [...document.querySelectorAll('[data-testid^="row-"]')].map(e => e.dataset.testid.slice(4)))
const iR = order.indexOf('bane'), iK = order.indexOf(kp)
console.log('row order index Ranger', iR, 'Kilo', iK, 'between:', order.slice(Math.min(iR, iK), Math.max(iR, iK) + 1).join(','))
const block = order.slice(Math.min(iR, iK), Math.max(iR, iK) + 1)
// (a) Ranger + Kilo, 2-3 Dec
console.log('(a) cells before:', JSON.stringify(await Promise.all(block.map(async p => p + ':' + (await L.cellText(w, p, '2026-12-02')) + '/' + (await L.cellText(w, p, '2026-12-03'))))))
const na = await step('(a) drag Ranger..Kilo 2-3 Dec, LL, Auto-approve ON', async () => {
  const open = await L.drag(w, ['bane', '2026-12-02'], [kp, '2026-12-03'])
  const who = await P.locator(L.T('sel-who')).innerText().catch(() => null)
  const span = await P.locator(L.T('sel-span')).innerText().catch(() => null)
  const a = await L.setAuto(w, true, 'sel')
  await L.shot(w, 'c-s3-03-sheet-ranger-kilo')
  const p = await L.place(w, 'LL', 'sel')
  return { open, who, span, autoOn: a, ...p, cells: await Promise.all(block.map(async q => q + ':' + (await L.cellText(w, q, '2026-12-02')) + '/' + (await L.cellText(w, q, '2026-12-03')))) }
}, 'c-s3-04-placed-ranger-kilo')
// (b) Ranger + Saber, 7-8 Dec
await step('(b) drag Ranger..Saber 7-8 Dec, LL, Auto-approve ON', async () => {
  const open = await L.drag(w, ['bane', '2026-12-07'], ['stiff', '2026-12-08'])
  const who = await P.locator(L.T('sel-who')).innerText().catch(() => null)
  const a = await L.setAuto(w, true, 'sel')
  const p = await L.place(w, 'LL', 'sel')
  return { open, who, autoOn: a, ...p, cells: [await L.cellText(w, 'bane', '2026-12-07'), await L.cellText(w, 'stiff', '2026-12-07')] }
}, 'c-s3-05-placed-ranger-saber')
// (d) Kilo's approved LL on 10 Dec, then Move toward Ranger's row
await step('(d0) Kilo LL 10 Dec, Auto-approve ON', async () => {
  await L.openCell(w, kp, '2026-12-10'); const a = await L.setAuto(w, true); const p = await L.place(w, 'LL')
  return { autoOn: a, ...p, cell: await L.cellText(w, kp, '2026-12-10') }
}, null)
await step('(d) Move Kilo\'s 10 Dec LL onto Ranger\'s 10 Dec', async () => {
  await L.openCell(w, kp, '2026-12-10')
  const offered = await L.vis(P, L.T('decide-shift'))
  if (!offered) { await L.closeWin(w); return { offered } }
  await L.tap(w, L.T('decide-shift')); await P.waitForTimeout(450)
  const banner0 = await P.locator(L.T('move-banner')).innerText().catch(() => null)
  await L.shot(w, 'c-s3-06-move-banner')
  await L.reach(w, 'bane', '2026-12-10')
  await L.tap(w, L.T('cell-bane-2026-12-10')); await P.waitForTimeout(600)
  const banner1 = await P.locator(L.T('move-banner')).innerText().catch(() => null)
  const said = await P.evaluate(() => [...document.querySelectorAll('#toastEl, .toast')].map(e => e.innerText.trim()).filter(Boolean).join(' / '))
  await L.shot(w, 'c-s3-07-move-tap-ranger')
  if (await L.vis(P, L.T('move-confirm'))) { await L.tap(w, L.T('move-confirm')); await P.waitForTimeout(500) }
  if (await L.vis(P, L.T('move-cancel'))) { await L.tap(w, L.T('move-cancel')); await P.waitForTimeout(300) }
  await L.closeWin(w)
  return { offered, banner0, banner1, toast: said, kilo: await L.cellText(w, kp, '2026-12-10'), ranger: await L.cellText(w, 'bane', '2026-12-10') }
}, 'c-s3-08-after-move')
// (c) open December for bidding; Ranger bids LL 21 Dec; Saber places OL over it, Auto-approve ON
await P.evaluate(() => window.scrollTo(0, 0))
await L.tap(w, L.T('open-chip')); await P.waitForTimeout(500)
if ((await P.locator(L.T('od-month-2026-12')).getAttribute('data-state')) !== 'open') await L.tap(w, L.T('od-month-2026-12'))
await L.tap(w, L.T('open-dates-close')); await P.waitForTimeout(300)
await L.signOut(w); await L.signIn(w, 'us', 'us'); await L.toWar(w)
await L.openCell(w, 'bane', '2026-12-21'); const rb = await L.place(w, 'LL')
console.log('Ranger own LL bid 21 Dec:', JSON.stringify(rb), await L.cellText(w, 'bane', '2026-12-21'))
await L.signOut(w); await L.signIn(w, 'ad', 'a'); await L.toWar(w)
await step('(c) OL over his pending LL 21 Dec, Auto-approve ON', async () => {
  await L.openCell(w, 'bane', '2026-12-21')
  const a = await L.setAuto(w, true)
  await L.shot(w, 'c-s3-09-window-his-bid')
  const p = await L.place(w, 'OL')
  const still = await L.vis(P, L.T('bid-picker'))
  if (still) await L.shot(w, 'c-s3-10-still-open')
  await L.closeWin(w)
  return { autoOn: a, ...p, stillOpen: still, cell: await L.cellText(w, 'bane', '2026-12-21') }
}, 'c-s3-11-after-OL')
// (e) Kilo posted out (Delete) from 14 Dec; then a drag over Ranger..Kilo 15-16 Dec, LL, Auto-approve ON
const po = await (async () => {
  await L.openCell(w, kp, '2026-12-14')
  await L.tap(w, L.T('bid-more')); await P.waitForTimeout(250)
  await L.tap(w, L.T('bid-postout')); await P.waitForTimeout(400)
  const chip = L.T('po-delete')
  if ((await P.locator(chip).getAttribute('aria-pressed')) !== 'true') await L.tap(w, chip)
  const line = await P.locator(L.T('po-line')).innerText().catch(() => null)
  await L.shot(w, 'c-s3-12-postout')
  await L.tap(w, L.T('po-confirm')); await P.waitForTimeout(300)
  if (await L.vis(P, L.T('po-delete-go'))) { await L.tap(w, L.T('po-delete-go')); await P.waitForTimeout(600) }
  await L.closeWin(w)
  return { line, cls: await P.evaluate(s => document.querySelector(s)?.className, L.T(`cell-${kp}-2026-12-15`)) }
})()
console.log('posting out:', JSON.stringify(po))
await step('(e) drag Ranger..Kilo 15-16 Dec, LL, Auto-approve ON (Kilo posted out from 14 Dec)', async () => {
  const open = await L.drag(w, ['bane', '2026-12-15'], [kp, '2026-12-16'])
  const who = await P.locator(L.T('sel-who')).innerText().catch(() => null)
  const a = await L.setAuto(w, true, 'sel')
  await L.shot(w, 'c-s3-13-sheet-mixed')
  const p = await L.place(w, 'LL', 'sel')
  const said = await P.evaluate(() => [...document.querySelectorAll('#toastEl, .toast, [data-testid="sel-note"]')].map(e => e.innerText.trim()).filter(Boolean).join(' / '))
  await L.closeWin(w)
  return { open, who, autoOn: a, ...p, said, cells: await Promise.all(block.map(async q => q + ':' + (await L.cellText(w, q, '2026-12-15')) + '/' + (await L.cellText(w, q, '2026-12-16')))) }
}, 'c-s3-14-placed-mixed')
const all = await L.notices(w)
console.log('STORE, every line this run:'); all.forEach(n => console.log('   ' + L.fmt(n)))
const sb = await L.bell(w, 'c-s3-15-saber-bell')
console.log('Saber bell:', JSON.stringify(sb.lines.map(l => l.text)), sb.list)
await L.tap(w, '#notifyBell').catch(() => {})
await L.signOut(w); await L.signIn(w, 'kilo', 'k')
const kb = await L.bell(w, 'c-s3-16-kilo-bell')
console.log('Kilo bell:', JSON.stringify({ lit: kb.lit && kb.lit.cls, lines: kb.lines.map(l => [l.unread, l.text]) }, null, 1))
if (kb.lines[0]) console.log('Kilo tap line 1 ->', JSON.stringify(await L.tapLine(w, kb.lines[0].id, 'c-s3-17-kilo-tap-line1')))
await L.signOut(w); await L.signIn(w, 'us', 'us')
const ub = await L.bell(w, 'c-s3-18-ranger-bell')
console.log('Ranger bell:', JSON.stringify({ lit: ub.lit && ub.lit.cls, lines: ub.lines.map(l => [l.unread, l.text]) }, null, 1))
console.log('errors', w.errs)
await L.closeAll()
