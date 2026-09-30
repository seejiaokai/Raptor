/* [DB-READINESS] phase 6 (c) v3 — the FULL check's walk O: OIL (earned leave, D25) on a weekend request's row (1 Oct 26).
   The money case of round 3 (Astra 1): a weekend request's row CANCELLED on a published Saturday; the request moved away,
   the issued version loaded back (its row returns as a dead kept row, D363), then the request moved to Sunday, where it
   lands. The dead cancelled Saturday row is not the request's row: Sunday's row earns, in the OIL Earn mode and in the
   day's worked figures, right after and after a reload; and when Sunday is published, what it credits. Run against this
   branch (HP_TAG=p6c) and the build before (c) (HP_TAG=base). */
import { boot, world, fact, saveFacts, fileTimed, oilPucks, oilIsOn, oilButton, TAG } from './p6-lib.mjs'
import { rowsOf, noRid, reqOf } from './p6c-lib.mjs'
const { L, W } = await boot()
const W2 = await import('./dbrA-W2-lib.mjs')
const T = W.table(L, process.env.HP_PHONE ? 'phone' : 'desktop')
const { browser, p, errors } = await world(L)
await W.toastSpy(p)
const SAT = 5, SUN = 6, BOLT = 'yeti'
const rowFacts = async (tag, iid) => { const rs = await rowsOf(p, iid); fact(`${tag}.rows`, noRid(rs)); fact(`${tag}.acc`, (await reqOf(p, iid))?.acc ?? '(gone)'); return rs }
const figs = async (tag, di) => { const f = await p.evaluate(d => { const o = window.oilDayFigures(d) || {}; return o['yeti'] || null }, di); fact(`${tag}.boltFigure${di}`, f); return f }
const oilOn = async (tag, di, item) => { await W.boardOn(p, di); if (!(await oilIsOn(p))) await oilButton(L, p); const x = (await oilPucks(p)).filter(q => q.item === item); fact(`${tag}.pucks${di}`, x); return x }
const oilOff = async () => { if (await oilIsOn(p)) await oilButton(L, p); await W.boardOff(p) }

/* O1 — Saber files a Training for Bolt on Sat 18 Jul 10:00–11:00: it lands on Saturday; Bolt earns there */
let iid = null
await T.S(p, 'O1', 'Saber files a Training for Bolt on Sat 18 Jul 10:00-11:00 (Inputs page)', async () => {
  iid = await fileTimed(L, p, { person: BOLT, type: 'Training', iso: '2026-07-18', from: '10:00', to: '11:00', remarks: 'P6C WEEKEND COURSE' })
}, { reload: false, page: 'inputs' })
const item = 'i:' + iid
await rowFacts('O1', iid)
await figs('O1', SAT)
await oilOn('O1', SAT, item); await W.focus(p, '#schedBoard .sb-panel.grnd'); await T.pic(p, 'O1-saturday-oil'); await oilOff()

/* O2 — Saber cancels the row (CX on the board), signs and publishes Saturday */
await W.boardOn(p, SAT)
await T.S(p, 'O2', 'Saber cancels the Training row on Saturday (CX) and publishes Saturday', async () => {
  const ri = (await rowsOf(p, iid))[0]?.ri
  const cx = p.locator(`#schedBoard [data-grcx="${SAT}.${ri}"]:visible`).first()
  fact('O2.cx', (await cx.count()) ? (await cx.evaluate(e => e.scrollIntoView({ block: 'center' })), await cx.click(), 'pressed') : 'no CX')
  await L.sleep(500)
  /* the CX opens its "Cancel this item" sheet (a reason, or blank for a plain CX): its own "Cancel line" confirms */
  const ok = p.locator('button:visible', { hasText: /^Cancel line$/ }).first()
  fact('O2.confirm', (await ok.count()) ? (await ok.click(), 'confirmed') : 'no sheet')
  await L.sleep(600)
  fact('O2.sign', await W.signDay(p, SAT)); fact('O2.pub', await W.publishDay(p, SAT))
}, { reload: false })
await W.boardOff(p)
await rowFacts('O2', iid)
await figs('O2', SAT)

/* O3 — the request moved away to Sat 25 Jul; the issued Saturday loaded back: its cancelled row returns, dead (D363) */
await L.step(p, 'O3 the Training re-dated to Sat 25 Jul', async () => fact('O3.read', await W2.redate(p, iid, '2026-07-25', '2026-07-25')))
await rowFacts('O3', iid)
await W.toEdit(L, p)
const ISSUED = await p.evaluate(d => window.dayCurVer(d), SAT)
await T.S(p, 'O3b', 'Saber loads Saturday\'s issued version onto the working copy', async () => {
  await W.showDay(p, SAT)
  const menu = p.locator(`#eWeek [data-planmenu="${SAT}"]:visible`).first()
  if (!(await menu.count())) return fact('O3b.load', 'no plan selector')
  await menu.click(); await L.sleep(400)
  const pv = p.locator(`[data-planpv="${ISSUED}"]:visible`).first()
  if (!(await pv.count())) return fact('O3b.load', 'no issued version')
  await pv.click(); await L.sleep(500)
  const said = []
  for (let i = 0; i < 2; i++) { const b = p.locator(`[data-restore="${SAT}"]:visible`).first(); if (!(await b.count())) break; said.push((await b.innerText()).trim()); await b.click(); await L.sleep(700) }
  fact('O3b.load', said)
}, { reload: false })
fact('O3b.toasts', await W.toasts(p))
await rowFacts('O3b', iid)

/* O4 — the request moved to Sun 19 Jul: it lands on Sunday; Saturday keeps the dead cancelled row */
await L.step(p, 'O4 the Training re-dated to Sun 19 Jul', async () => fact('O4.read', await W2.redate(p, iid, '2026-07-19', '2026-07-19')))
const r4 = await rowFacts('O4', iid)
L.check('O4 a row on Sunday, and Saturday\'s dead cancelled row stays', r4.some(r => r.di === SUN && !r.cx) && r4.some(r => r.di === SAT && r.cx), r4)
const f4 = await figs('O4', SUN)
const pk4 = await oilOn('O4', SUN, item); await W.focus(p, '#schedBoard .sb-panel.grnd'); await T.pic(p, 'O4-sunday-oil'); await oilOff()
L.check('O4 Bolt EARNS on Sunday (the dead row on Saturday is not his row)', !!f4 && pk4.some(q => q.who === BOLT && q.on), { f4, pk4 })
await L.reloadCompare(p, 'O4 reload', 'a', { page: 'editsched' }); await W.toastSpy(p)
const f4r = await figs('O4r', SUN)
L.check('O4 after a reload: Bolt still earns on Sunday', !!f4r, f4r)
await rowFacts('O4r', iid)

/* O5 — Sunday published: what it credits Bolt */
await W.toEdit(L, p); await W.showDay(p, SUN)
await T.S(p, 'O5', 'Saber signs and publishes Sunday', async () => { fact('O5.sign', await W.signDay(p, SUN)); fact('O5.pub', await W.publishDay(p, SUN)) }, { reload: true })
await figs('O5', SUN)
fact('O5.frozen', await p.evaluate(d => { const e = window.DAYS[d].oilev; return e ? JSON.stringify(e).includes('yeti') : null }, SUN))
await W.showDay(p, SUN); await T.pic(p, 'O5-sunday-published')

fact('errors', errors)
saveFacts(process.env.HP_OUT.replace(/\.json$/, '-facts.json'))
L.save({ table: T.T, tag: TAG })
await browser.close()
