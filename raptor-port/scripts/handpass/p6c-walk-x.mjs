/* [DB-READINESS] phase 6 (c) v3 — the FULL check's walk X: a request moved between days and weeks, retyped, handed on
   (1 Oct 26). The promise: every such edit writes the REQUEST only; the day it leaves loses its row and the day it goes to
   gains it when read — the week on screen at once, another week when it is opened or peeked at (§8 items 6, 7), with no
   "Load the week of …" refusal and no "Moved outside the programmed week"; a retype to a kind that never goes on the
   programme takes the row and says so; a request taken off and retyped to another activity goes on at once (§8 item 12);
   a hand-over to a man standing on the row as an extra keeps him once, as the holder, and says so (D271). Run against
   this branch (HP_TAG=p6c) and the build before (c) (HP_TAG=base). */
import { boot, world, fact, saveFacts, fileTimed, handOver, dropLanded, TAG } from './p6-lib.mjs'
import { IS_C, rowsOf, noRid, reqOf, weekRows, switchTo } from './p6c-lib.mjs'
const { L, W } = await boot()
const W2 = await import('./dbrA-W2-lib.mjs')
const { put } = await import('./lib.mjs')
const T = W.table(L, process.env.HP_PHONE ? 'phone' : 'desktop')
const { browser, p, errors } = await world(L)
await W.toastSpy(p)
const THU = 3, FRI = 4, RANGER = 'bane', BOLT = 'yeti'
const rowFacts = async (tag, iid) => { const rs = await rowsOf(p, iid); fact(`${tag}.rows`, noRid(rs)); fact(`${tag}.acc`, (await reqOf(p, iid))?.acc ?? '(gone)'); return rs }
const noWeek = (tag, a) => { const w = weekRows(a); fact(`${tag}.weekRowsWritten`, w); if (IS_C) L.check(`${tag} — a request's command wrote no week row (§11, D450)`, !w.length, w) }
const peekText = () => p.evaluate(() => [...document.querySelectorAll('.day.peek')].map(e => e.innerText.replace(/\s+/g, ' ')).join(' | ').slice(0, 6000))
const toWeek = async (v) => { await p.evaluate(w => window.loadWeek(w), v); await L.sleep(800) }
const setType = async (iid, t) => { if (!(await W2.openEdit(p, iid))) return 'no editor'; await p.locator('#inBody tr.ined [data-ed="type"]').selectOption(t); await p.locator('#inBody tr.ined [data-save]').first().click(); await L.sleep(700)
  for (let i = 0; i < 3; i++) { const nodoc = p.locator('[data-testid="docconf-nodoc"]:visible'); if (await nodoc.count()) { await nodoc.click(); await L.sleep(500); continue } const conf = p.locator('[data-testid="oilconf"]:visible'); if (await conf.count()) { await conf.locator('button').filter({ hasText: /^Yes/ }).first().click().catch(() => {}); await conf.getByRole('button', { name: 'Save', exact: true }).click().catch(() => {}); await L.sleep(600); continue } break }
  return 'saved' }

/* X1 — Saber files a meeting for Ranger on Thu 16 Jul 10:00–11:00 and puts Bolt on its row as a second man */
let iid = null
await T.S(p, 'X1', 'Saber files a meeting for Ranger on Thursday; on the board he adds Bolt to its row', async () => {
  iid = await fileTimed(L, p, { person: RANGER, type: 'Meeting', iso: '2026-07-16', from: '10:00', to: '11:00', remarks: 'P6C MOVER' })
  await W.boardOn(p, THU)
  const ri = (await rowsOf(p, iid))[0]?.ri
  fact('X1.put', await put(p, `[data-fill="g:${THU}.${ri}.+"]`, [BOLT]))
  await W.boardOff(p)
}, { reload: true })
await rowFacts('X1', iid)

/* X2 — Ranger re-dates it to Friday: Thursday's row goes, Friday's comes — and Bolt? */
await switchTo(L, W2, p, 'm'); await W.toastSpy(p)
const x2 = await T.S(p, 'X2', 'Ranger re-dates his meeting to Fri 17 Jul', async () => { fact('X2.read', await W2.redate(p, iid, '2026-07-17', '2026-07-17')) }, { reload: true, page: 'inputs', who: 'm' })
noWeek('X2', x2)
fact('X2.toasts', await W.toasts(p))
const r2 = await rowFacts('X2', iid)
L.check('X2 the row is on Friday, not Thursday', r2.length === 1 && r2[0].di === FRI, r2)

/* X3 — Ranger re-dates it to Tue 21 Jul, the week after: no refusal, no "Moved outside the programmed week" */
const x3 = await T.S(p, 'X3', 'Ranger re-dates his meeting to Tue 21 Jul (next week)', async () => { fact('X3.read', await W2.redate(p, iid, '2026-07-21', '2026-07-21')) }, { reload: false, page: 'inputs', who: 'm' })
noWeek('X3', x3)
const t3 = await W.toasts(p); fact('X3.toasts', t3)
if (IS_C) L.check('X3 no "Moved outside the programmed week" (§8 item 7)', !t3.some(t => /Moved outside/.test(t)), t3)
fact('X3.req', await reqOf(p, iid))
const r3 = await rowFacts('X3', iid)
L.check('X3 no row on this week any more', r3.length === 0, r3)
await L.reloadCompare(p, 'X3 reload', 'm', { page: 'inputs' }); await W.toastSpy(p)

/* X4 — Saber: the next-week preview on Edit Schedule shows it on Tuesday (§8 item 6); week 2 opened shows it too */
await switchTo(L, W2, p, 'a'); await W.toastSpy(p)
await W.toEdit(L, p)
await p.evaluate(() => { const w = document.querySelector('#eWeek .week') || document.querySelector('#eWeek'); if (w) w.scrollLeft = w.scrollWidth }); await L.sleep(500)
const pk = await peekText(); fact('X4.peekHasIt', /P6C MOVER/.test(pk))
/* the week scrolls sideways under its own control: bring the peek's Tuesday to the front as its scrollbar would */
fact('X4.peekTue', await p.evaluate(() => { const e = document.querySelector('.day.peek[data-peek-day="1"]'); if (!e) return null; const sc = e.closest('.week') || e.parentElement; sc.scrollLeft = Math.max(0, e.offsetLeft - 40); window.scrollTo(0, 0); return e.innerText.replace(/\s+/g, ' ').slice(0, 300) })); await L.sleep(500)
await T.pic(p, 'X4-peek-next-week')
await toWeek('20/07/2026')
const r4 = await rowFacts('X4', iid)
L.check('X4 week 2 opened: the meeting is on Tue 21 Jul', r4.length === 1 && r4[0].di === 1, r4)
await W.toEdit(L, p); await W.showDay(p, 1); await T.pic(p, 'X4-week2-tuesday')
await L.reloadCompare(p, 'X4 reload on week 2', 'a', { page: 'editsched' }); await W.toastSpy(p)
await rowFacts('X4r', iid)

/* X5 — from week 2, Saber moves it back to Thu 16 Jul (its request): week 2 loses it; week 1 opened has it on Thursday */
const x5 = await T.S(p, 'X5', 'from week 2: the meeting re-dated back to Thu 16 Jul', async () => { fact('X5.read', await W2.redate(p, iid, '2026-07-16', '2026-07-16')) }, { reload: false, page: 'inputs' })
noWeek('X5', x5)
fact('X5.toasts', await W.toasts(p))
await rowFacts('X5.w2', iid)
await toWeek('13/07/2026')
const r5 = await rowFacts('X5.w1', iid)
L.check('X5 week 1 opened: the meeting is on Thursday again', r5.length === 1 && r5[0].di === THU, r5)

/* X6 — Ranger retypes it to a leave: the row goes, and the app says why; back to a meeting: it returns */
await switchTo(L, W2, p, 'm'); await W.toastSpy(p)
const x6 = await L.step(p, 'X6 Ranger retypes his meeting to Local leave', async () => fact('X6.save', await setType(iid, 'LL')))
noWeek('X6', x6)
const t6 = await W.toasts(p); fact('X6.toasts', t6)
const r6 = await rowFacts('X6', iid)
L.check('X6 the row is gone', r6.length === 0, r6)
L.check('X6 the app says the row has been removed', t6.some(t => /does not go on the Ground Programme/.test(t)), t6)
const x6b = await L.step(p, 'X6b and back to a meeting', async () => fact('X6b.save', await setType(iid, 'Meeting')))
noWeek('X6b', x6b)
fact('X6b.toasts', await W.toasts(p))
const r6b = await rowFacts('X6b', iid)
L.check('X6b the row is back on Thursday', r6b.length === 1 && r6b[0].di === THU, r6b)
await L.reloadCompare(p, 'X6 reload', 'm', { page: 'inputs' }); await W.toastSpy(p)

/* X7 — Saber takes it off Thursday (✕ on its row); Ranger retypes it to Training: it goes on at once (§8 item 12) */
await switchTo(L, W2, p, 'a'); await W.toastSpy(p)
await T.S(p, 'X7', 'Saber takes the meeting off Thursday (✕ on its row)', async () => { fact('X7.x', await dropLanded(L, p, THU, iid)) }, { reload: true })
await rowFacts('X7', iid)
await switchTo(L, W2, p, 'm'); await W.toastSpy(p)
const x7b = await L.step(p, 'X7b Ranger retypes it to Training', async () => fact('X7b.save', await setType(iid, 'Training')))
noWeek('X7b', x7b)
fact('X7b.toasts', await W.toasts(p))
const r7b = await rowFacts('X7b', iid)
if (IS_C) L.check('X7b retyped to another activity: on the programme at once (§8 item 12)', r7b.length === 1, r7b)
await L.reloadCompare(p, 'X7b reload', 'm', { page: 'inputs' }); await W.toastSpy(p)
await rowFacts('X7br', iid)

/* X8 — Saber hands it to Bolt, who stands on its row as an extra: kept once, as the holder (D271) */
await switchTo(L, W2, p, 'a'); await W.toastSpy(p)
const before8 = await rowsOf(p, iid); fact('X8.before', noRid(before8))
if (!before8.length || !before8[0].more.includes(BOLT)) {
  await W.boardOn(p, THU)
  const ri = (await rowsOf(p, iid))[0]?.ri
  if (ri != null) fact('X8.putBolt', await put(p, `[data-fill="g:${THU}.${ri}.+"]`, [BOLT]))
  await W.boardOff(p)
}
fact('X8.withBolt', noRid(await rowsOf(p, iid)))
const x8 = await T.S(p, 'X8', 'Saber hands the request to Bolt (the Inputs page ✎, person)', async () => { fact('X8.saved', await handOver(L, p, iid, BOLT)) }, { reload: true, page: 'inputs' })
noWeek('X8', x8)
const t8 = await W.toasts(p); fact('X8.toasts', t8)
const r8 = await rowFacts('X8', iid)
L.check('X8 Bolt holds the row, and is not also an extra on it (D271)', r8.length === 1 && r8[0].who === BOLT && !r8[0].more.includes(BOLT), r8)
await W.boardOn(p, THU); await W.focus(p, '#schedBoard .sb-panel.grnd'); await T.pic(p, 'X8-handed-to-bolt'); await W.boardOff(p)

fact('errors', errors)
saveFacts(process.env.HP_OUT.replace(/\.json$/, '-facts.json'))
L.save({ table: T.T, tag: TAG })
await browser.close()
