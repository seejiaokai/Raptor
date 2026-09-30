/* [DB-READINESS] phase 6 (c) v3 — the FULL check's walk K2: a dead kept row on a day its request COVERS (1 Oct 26).
   Astra's final code read, findings 1, 2 and 4: a saved plan brought back after its request was filed under Unavailable
   returns the row kept — dead, although the request covers the day. Through the app's own controls: a weekend Training
   for Ranger with Bolt on its row (Bolt earns, D18); "+ Alt Plan"; ✕ on the row, → Unavail; the first plan brought back.
   The promise: Bolt earns nothing from that dead row (money, D25); published so, then Accepted, "Load onto working copy"
   of the issue puts back the filing AND the dead row, nothing pending (D98). Run against this branch (HP_TAG=p6c); the
   build before (c) has no kept rows (HP_TAG=base shows its own behaviour, for the record). */
import { boot, world, fact, saveFacts, fileTimed, dropLanded, accBtn, oilPucks, oilIsOn, oilButton, TAG } from './p6-lib.mjs'
import { rowsOf, noRid, reqOf, IS_C } from './p6c-lib.mjs'
const { L, W } = await boot()
const { put } = await import('./lib.mjs')
const T = W.table(L, 'desktop')
const { browser, p, errors } = await world(L)
await W.toastSpy(p)
const SAT = 5, RANGER = 'bane', BOLT = 'yeti'
const rowFacts = async (tag, iid) => { const rs = await rowsOf(p, iid); fact(`${tag}.rows`, noRid(rs)); fact(`${tag}.acc`, (await reqOf(p, iid))?.acc ?? '(gone)'); return rs }
const boltFig = async (tag) => { const f = await p.evaluate(d => (window.oilDayFigures(d) || {})['yeti'] || null, SAT); fact(`${tag}.boltFigure`, f); return f }
const planMenu = async () => { await W.toEdit(L, p); await W.showDay(p, SAT); const m = p.locator(`#eWeek [data-planmenu="${SAT}"]:visible`).first(); if (!(await m.count())) return false; await m.click(); await L.sleep(400); return true }

/* K2-1 — a Training for Ranger on Sat 18 Jul 09:00–17:00 (he answers the OIL question yes); Bolt put on its row */
let iid = null
await T.S(p, 'K2-1', 'an "Other" request for Ranger on Saturday; Bolt put on its row', async () => {
  iid = await fileTimed(L, p, { person: RANGER, type: 'Other', iso: '2026-07-18', from: '09:00', to: '17:00', remarks: 'P6C DEAD U' })
  await W.boardOn(p, SAT)
  const ri = (await rowsOf(p, iid))[0]?.ri
  fact('K2-1.put', await put(p, `[data-fill="g:${SAT}.${ri}.+"]`, [BOLT]))
  await W.boardOff(p)
}, { reload: false })
await rowFacts('K2-1', iid)
const f1 = await boltFig('K2-1')
L.check('K2-1 the premise: Bolt earns on the request\'s own row (D18)', !!f1, f1)

/* K2-2 — "+ Alt Plan"; ✕ on the row; → Unavail on its card; the first plan brought back: the row returns, dead */
await T.S(p, 'K2-2', '+ Alt Plan; ✕ on the row; → Unavail; the first plan brought back', async () => {
  if (await planMenu()) { await p.locator('[data-plandup]:visible').first().click(); await L.sleep(700) }
  fact('K2-2.x', await dropLanded(L, p, SAT, iid))
  fact('K2-2.u', await accBtn(L, p, SAT, iid, 'u'))
  await W.boardOff(p)
  if (await planMenu()) { const b = p.locator('[data-plansel]:visible').first(); fact('K2-2.sel', (await b.count()) ? (await b.click(), 'selected') : 'no other plan'); await L.sleep(800) }
}, { reload: true })
fact('K2-2.toasts', await W.toasts(p))
const r2 = await rowFacts('K2-2', iid)
const f2 = await boltFig('K2-2')
if (IS_C) {
  L.check('K2-2 the row is back, kept (dead: its request is under Unavailable)', r2.length === 1 && r2[0].kept && r2[0].more.includes(BOLT), r2)
  L.check('K2-2 Bolt earns NOTHING from it (money — the dead row is not the request\'s)', !f2, f2)
}
await W.boardOn(p, SAT); if (!(await oilIsOn(p))) await oilButton(L, p)
fact('K2-2.pucks', (await oilPucks(p)).filter(q => q.item === 'i:' + iid))
await W.focus(p, '#schedBoard .sb-panel.grnd'); await T.pic(p, 'K2-2-dead-u-row-oil')
await oilButton(L, p); await W.boardOff(p)

/* K2-3 — Saturday published so (the dead row, "Unavailable"); then out of Unavailable and Accepted; the issue loaded back */
await W.toEdit(L, p); await W.showDay(p, SAT)
fact('K2-3.sign', await W.signDay(p, SAT)); fact('K2-3.pub', await W.publishDay(p, SAT))
await T.S(p, 'K2-3', 'the card: out of Unavailable, then Accept', async () => {
  fact('K2-3.x', await accBtn(L, p, SAT, iid, 'x'))
  fact('K2-3.g', await accBtn(L, p, SAT, iid, 'g'))
  await W.boardOff(p)
}, { reload: false })
await rowFacts('K2-3', iid)
fact('K2-3.head', await W.head(p, SAT))
await T.S(p, 'K2-4', 'Saturday\'s issue loaded back onto the working copy', async () => {
  await W.toEdit(L, p); await W.showDay(p, SAT)
  const ver = await p.evaluate(d => window.dayCurVer(d), SAT)
  const m = p.locator(`#eWeek [data-planmenu="${SAT}"]:visible`).first(); await m.click(); await L.sleep(400)
  const pv = p.locator(`[data-planpv="${ver}"]:visible`).first(); if (await pv.count()) { await pv.click(); await L.sleep(500) }
  const said = []
  for (let i = 0; i < 2; i++) { const b = p.locator(`[data-restore="${SAT}"]:visible`).first(); if (!(await b.count())) break; said.push((await b.innerText()).trim() + (await b.isDisabled() ? ' [disabled: ' + (await b.getAttribute('title')) + ']' : '')); await b.click(); await L.sleep(700) }
  fact('K2-4.load', said)
  fact('K2-4.toastsNow', await W.toasts(p))
}, { reload: true })
fact('K2-4.toasts', await W.toasts(p))
const r4 = await rowFacts('K2-4', iid)
await W.toEdit(L, p); await W.showDay(p, SAT)
const h4 = await W.head(p, SAT); fact('K2-4.head', h4)
if (IS_C) L.check('K2-4 as issued: filed under Unavailable, its row back dead, nothing pending (D98)',
  (await reqOf(p, iid))?.acc === 'u' && r4.length === 1 && r4[0].kept && !/pending/.test(h4.pending || ''), { acc: (await reqOf(p, iid))?.acc, r4, h4 })
await T.pic(p, 'K2-4-loaded-as-issued')

fact('errors', errors)
saveFacts(process.env.HP_OUT.replace(/\.json$/, '-facts.json'))
L.save({ table: T.T, tag: TAG })
await browser.close()
