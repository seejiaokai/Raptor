// shr-c-probe2 v1 — walker C: which window the admin gets on (a) the timed shared leave, typing in its Remarks;
// (b) an all-day shared leave; (c) a war-approved LL for Ranger with Hex added on the Inputs page; (d) a day of two entries.
import * as C from './shr-c-lib.mjs'
const { L, T, J, sleep } = C
console.log('shr-c-probe2 v1')
const w = await C.world(process.env.SZ || 'desk')
const P = w.page
await C.signIn(w, 'ad')
const D = ['Jul 15', 'Jul 16', 'Jul 17', 'Jul 20']
const iid = await C.fileShared(w, 'p2')
await C.toWar(w)
/* (a) */
await C.openCell(w, 'bane', '2026-07-15')
await C.typeInto(w, T('bid-remarks'), 'Probe words')
await P.keyboard.press('Tab'); await sleep(700)
console.log('(a) after Tab: store', J(await C.store(P, ['bane', 'rocky'], D)), 'box', await C.valueOf(P, T('bid-remarks')), 'focus', await C.active(P))
console.log('(a) sheet', J(await C.sheet(P)))
await C.pic(w, 'p2-a-after-tab')
await C.closeAny(w)
console.log('(a) after close: store', J(await C.store(P, ['bane', 'rocky'], D)), 'cells', J(await C.cellSays(P, 'bane', '2026-07-15')), J(await C.cellSays(P, 'rocky', '2026-07-15')))
/* (b) all-day shared leave on Thu 16 */
const iidB = await L.fileInput(w, 'p2b', L.THU, { type: 'LL', people: [L.RANGER, L.HEX] })
console.log('(b) filed', iidB, J(await C.store(P, ['bane', 'rocky'], ['Jul 16'])))
await C.toWar(w)
await C.openCell(w, 'bane', '2026-07-16')
console.log('(b) sheet', J(await C.sheet(P)))
await C.pic(w, 'p2-b-allday-window')
await C.closeAny(w)
/* (c) a war-approved whole-day LL for Ranger on Fri 17 */
await C.openCell(w, 'bane', '2026-07-17')
const sw = P.locator(T('bid-approve-tick'))
console.log('(c) switch', await sw.getAttribute('aria-checked'))
await C.press(w, T('bid-LL')); await sleep(600)
if (await C.vis(P, T('bid-picker'))) { console.log('(c) still open, second tap:', J(await C.sheet(P))); await C.press(w, T('bid-LL')); await sleep(600) }
console.log('(c) placed: store', J(await C.store(P, ['bane', 'rocky'], ['Jul 17'])), 'cell', J(await C.cellSays(P, 'bane', '2026-07-17')))
await C.openCell(w, 'bane', '2026-07-17')
console.log('(c) reopened sheet', J(await C.sheet(P)))
await C.pic(w, 'p2-c-war-approved')
await C.closeAny(w)
/* add Hex on the Inputs page: open the leave from the day's window */
const wid = (await P.evaluate(() => (window.INPUTS || []).filter(r => r.date === 'Jul 17' && ((r.people || []).some(x => x.p === 'bane') || r.person === 'bane')).map(r => r.iid)))[0]
console.log('(c) war leave iid', wid)
try {
  await L.openDay(w, '2026-07-17')
  const card = P.locator(`[data-testid="win-inputsday"] [data-iid="${wid}"], [data-testid="win-inputsday"] [data-popiid="${wid}"]`).first()
  console.log('(c) card count', await card.count())
  await C.press(w, card.first ? `[data-testid="win-inputsday"] [data-iid="${wid}"], [data-testid="win-inputsday"] [data-popiid="${wid}"]` : '')
  await P.locator('#inpEditPop').waitFor({ timeout: 5000 }); await sleep(500)
  const wt = await P.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-testid]')].filter(e => e.getBoundingClientRect().width > 0).map(e => e.dataset.testid).filter(t => !/inpEdCal-day/.test(t)))
  console.log('(c) its window tids', J(wt))
  await C.pic(w, 'p2-c-inputs-window')
  if (await P.locator('#inpEditPop [data-testid="pp-several"]').count()) {
    await C.press(w, '#inpEditPop [data-testid="pp-several"]'); await sleep(300)
    await C.press(w, '#inpEditPop [data-pp="rocky"]'); await sleep(300)
    const lit = await P.evaluate(() => [...document.querySelectorAll('#inpEditPop [data-pp][aria-pressed="true"]')].map(b => b.getAttribute('data-pp')))
    console.log('(c) people lit', J(lit))
    await C.press(w, '#inpEditSave')
    console.log('(c) asked', J(await L.answerAsks(w)), 'note', await L.shownToast(P))
  } else console.log('(c) NO pp-several in the window')
  if (await P.locator('[data-testid="win-inputsday-x"]').count()) await C.press(w, '[data-testid="win-inputsday-x"]')
} catch (e) { console.log('(c) ERROR', String(e).slice(0, 300)) }
console.log('(c) after: store', J(await C.store(P, ['bane', 'rocky'], ['Jul 17'])))
await C.toWar(w)
await C.openCell(w, 'bane', '2026-07-17')
console.log('(c) war window now', J(await C.sheet(P)))
await C.pic(w, 'p2-c-war-after-hex')
await C.closeAny(w)
/* (d) a PM bid on Ranger's 15 Jul, beside the shared AM leave: a day of two entries */
await C.openCell(w, 'bane', '2026-07-15')
if (await C.vis(P, T('bid-LL'))) { await C.press(w, T('bid-LL')); await sleep(600); if (await C.vis(P, T('bid-picker'))) { await C.press(w, T('bid-LL')); await sleep(600) } }
console.log('(d) store', J(await C.store(P, ['bane', 'rocky'], ['Jul 15'])), 'cell', J(await C.cellSays(P, 'bane', '2026-07-15')))
await C.openCell(w, 'bane', '2026-07-15')
console.log('(d) sheet', J(await C.sheet(P)))
await C.pic(w, 'p2-d-two-entries')
await C.closeAny(w)
console.log('ERRORS', J(L.facts.errors))
await L.finish()
