/* [DB-READINESS] phase 6 (c) v3 — the FULL check's walk P: a request's row on a PUBLISHED day (1 Oct 26).
   The promise: a member's filing, edit and delete on a published day write the REQUEST only; the day reads them pending
   (16 Sep 26, D177 / D178, D103: the four sign-offs fall) — right after, after a reload, and for the scheduler who signs
   in next; A → B → A and delete → Undo come back to nothing pending with no mark left; a request filed since and taken
   off reads nothing (D174); the issued request's delete is ONE pending change (D114); loading the issued version back puts
   the deleted request's row back and names it (D363), after a reload too; a request filed since stays on the programme
   through the load (§8 item 9). Run against this branch (HP_TAG=p6c) and the build before (c) (HP_TAG=base). */
import { boot, world, fact, saveFacts, fileTimed, alPanel, changesList, accBtn, dropLanded, TAG } from './p6-lib.mjs'
import { IS_C, rowsOf, noRid, reqOf, weekRows, switchTo } from './p6c-lib.mjs'
const { L, W } = await boot()
const W2 = await import('./dbrA-W2-lib.mjs')
const T = W.table(L, process.env.HP_PHONE ? 'phone' : 'desktop')
const { browser, p, errors } = await world(L)
await W.toastSpy(p)
const THU = 3, RANGER = 'bane'
const heads = async (tag) => { await W.toEdit(L, p); await W.showDay(p, THU); fact(`${tag}.head`, await W.head(p, THU)); fact(`${tag}.al`, await alPanel(p)) }
const pend = (tag) => p.evaluate(di => { const S = window.SCHED; const ks = o => Object.keys(o || {}).filter(k => { const m = /^[a-z]+:(\d+)/.exec(k) || /^(\d+)\./.exec(k); return m && +m[1] === di }).length; return { pending: ks(S.pending), changes: ks(S.changes), added: ks(S.added) } }, THU).then(v => { fact(`${tag}.marks`, v); return v })
const rowFacts = async (tag, iid) => { const rs = await rowsOf(p, iid); fact(`${tag}.rows`, noRid(rs)); return rs }
const noWeek = (tag, a) => { const w = weekRows(a); fact(`${tag}.weekRowsWritten`, w); if (IS_C) L.check(`${tag} — a request's command wrote no week row (§11, D450)`, !w.length, w) }

/* P0 — Saber files a meeting for Ranger (Thu 16 Jul 10:00–11:00), signs Thursday and publishes it: the meeting is issued */
let iss = null
await T.S(p, 'P0', 'Saber files a meeting for Ranger on Thursday, then signs and publishes Thursday', async () => {
  iss = await fileTimed(L, p, { person: RANGER, type: 'Meeting', iso: '2026-07-16', from: '10:00', to: '11:00', remarks: 'P6C ISSUED' })
  await W.toEdit(L, p); await W.showDay(p, THU)
  fact('P0.sign', await W.signDay(p, THU)); fact('P0.pub', await W.publishDay(p, THU))
}, { reload: false })
await rowFacts('P0', iss)
await heads('P0')
const RID0 = (await rowsOf(p, iss))[0]?.rid

/* P0b — the ISSUED meeting's start moved 10:00 → 10:30 (its request, the Inputs page ✎), then back: one pending, the mark
   on what changed; back to as issued, nothing pending (D98) */
const setStartA = async (iid, t) => { if (!(await W2.openEdit(p, iid))) return 'no editor'; await p.locator('#inBody tr.ined [data-ed="stime"]').fill(t); await p.locator('#inBody tr.ined [data-save]').first().click(); await L.sleep(700); return 'saved' }
const p0b = await T.S(p, 'P0b', 'the issued meeting\'s start moved to 10:30 (its request)', async () => { fact('P0b.save', await setStartA(iss, '10:30')) }, { reload: false, page: 'inputs' })
noWeek('P0b', p0b)
await rowFacts('P0b', iss); await pend('P0b')
await heads('P0b')
fact('P0b.list', await changesList(L, p, THU))
await W.boardOn(p, THU); await W.focus(p, '#schedBoard .sb-panel.grnd'); await T.pic(p, 'P0b-issued-retimed-board'); await W.boardOff(p)
await L.reloadCompare(p, 'P0b reload', 'a', { page: 'editsched' }); await W.toastSpy(p)
await heads('P0br')
await L.step(p, 'P0c the issued meeting back to 10:00', async () => fact('P0c.save', await setStartA(iss, '10:00')))
const r0c = await rowFacts('P0c', iss); await pend('P0c')
await heads('P0c')
L.check('P0c back to as issued: the issued row and its id, nothing pending (D98)', r0c.length === 1 && r0c[0].rid === RID0 && !/pending/.test((await W.head(p, THU)).pending || ''), { r0c, head: await W.head(p, THU) })

/* P1 — Ranger files a meeting of his own on published Thursday, 14:00–15:00 */
await switchTo(L, W2, p, 'm'); await W.toastSpy(p)
let live = null
const p1 = await T.S(p, 'P1', 'Ranger files a meeting on published Thursday, 14:00-15:00', async () => {
  live = await fileTimed(L, p, { type: 'Meeting', iso: '2026-07-16', from: '14:00', to: '15:00', remarks: 'P6C LIVE' })
}, { reload: false, page: 'inputs', who: 'm' })
noWeek('P1', p1)
const r1 = await rowFacts('P1', live)
L.check('P1 the working copy carries his meeting (16 Sep 26)', r1.length === 1 && r1[0].di === THU, r1)
const m1 = await pend('P1')
L.check('P1 it reads pending on Thursday', m1.pending + m1.added > 0, m1)
await L.go(p, 'viewsched'); await T.pic(p, 'P1-member-viewonly')
fact('P1.faceHasLive', await p.evaluate(() => /P6C LIVE/.test(document.querySelector('#vWeek')?.innerText || '')))
L.check('P1 View-only Sched keeps the issued face (D177 / D178): his new meeting is not on it', !(await p.evaluate(() => /P6C LIVE/.test(document.querySelector('#vWeek')?.innerText || ''))))
await L.reloadCompare(p, 'P1 reload (as Ranger)', 'm', { page: 'inputs' }); await W.toastSpy(p)
await rowFacts('P1r', live); await pend('P1r')

/* P2 — A → B → A: Ranger moves its start 14:00 → 14:30, then back to 14:00 */
const setStart = async (iid, t) => { if (!(await W2.openEdit(p, iid))) return 'no editor'; await p.locator('#inBody tr.ined [data-ed="stime"]').fill(t); await p.locator('#inBody tr.ined [data-save]').first().click(); await L.sleep(700); return 'saved' }
const p2 = await L.step(p, 'P2 Ranger moves his meeting to 14:30', async () => fact('P2.save', await setStart(live, '14:30')))
noWeek('P2', p2)
const r2 = await rowFacts('P2', live); const m2 = await pend('P2')
L.check('P2 the row follows (14:30), still pending', r2.length === 1 && r2[0].str === '14:30' && m2.pending + m2.added > 0, { r2, m2 })
const p2b = await L.step(p, 'P2b Ranger moves it back to 14:00', async () => fact('P2b.save', await setStart(live, '14:00')))
noWeek('P2b', p2b)
const r2b = await rowFacts('P2b', live); const m2b = await pend('P2b')
L.check('P2b A → B → A: the marks are exactly those after the filing (P1)', JSON.stringify(m2b) === JSON.stringify(m1), { m1, m2b })
L.check('P2b the row keeps its id through A → B → A', r2b.length === 1 && r2b[0].rid === r1[0].rid, { r1, r2b })

/* P3 — Ranger deletes it: a request filed since and gone reads nothing (D174 is the taken-off case; a delete too);
   Undo brings it back pending; Redo takes it again; then Undo, so it stays for the scheduler's steps */
const p3 = await L.step(p, 'P3 Ranger deletes his new meeting', async () => fact('P3.del', await W2.delReq(p, live)))
noWeek('P3', p3)
await rowFacts('P3', live); const m3 = await pend('P3')
fact('P3.undo', await W.door(p, 'top', 'undo')); const r3u = await rowFacts('P3u', live); const m3u = await pend('P3u')
L.check('P3 delete → Undo: the same row back and the marks exactly as before the delete', r3u.length === 1 && r3u[0].rid === r1[0].rid && JSON.stringify(m3u) === JSON.stringify(m1), { r3u, m3u, m1 })
fact('P3.redo', await W.door(p, 'top', 'redo')); await rowFacts('P3r', live); const m3r = await pend('P3r')
L.check('P3 Redo: the marks as right after the delete', JSON.stringify(m3r) === JSON.stringify(m3), { m3, m3r })
fact('P3.undo2', await W.door(p, 'top', 'undo')); await rowFacts('P3u2', live)

/* P4 — Ranger deletes the ISSUED meeting: one pending change (D114); Undo: nothing left of it, the exact row back */
const p4 = await L.step(p, 'P4 Ranger deletes the issued meeting', async () => fact('P4.del', await W2.delReq(p, iss)))
noWeek('P4', p4)
const r4 = await rowFacts('P4', iss); const m4 = await pend('P4')
L.check('P4 its row is gone from the working copy', r4.length === 0, r4)
fact('P4.undo', await W.door(p, 'top', 'undo')); const r4u = await rowFacts('P4u', iss); const m4u = await pend('P4u')
L.check('P4 Undo: the issued row back with its id, and no mark left of the delete (marks as after P1)', r4u.length === 1 && r4u[0].rid === RID0 && JSON.stringify(m4u) === JSON.stringify(m1), { r4u, RID0, m4u, m1 })
fact('P4.redo', await W.door(p, 'top', 'redo')); await rowFacts('P4r', iss); await pend('P4r')
await L.reloadCompare(p, 'P4 reload (as Ranger)', 'm', { page: 'inputs' }); await W.toastSpy(p)
await rowFacts('P4rl.iss', iss); await rowFacts('P4rl.live', live); await pend('P4rl')

/* P5 — Saber signs in: Thursday reads two pending (his meeting filed since; the issued one deleted), the four fallen */
await switchTo(L, W2, p, 'a'); await W.toastSpy(p)
await heads('P5')
fact('P5.list', await changesList(L, p, THU))
await W.toEdit(L, p); await W.showDay(p, THU); await T.pic(p, 'P5-saber-thursday-pending')
await W.boardOn(p, THU); await T.pic(p, 'P5-saber-board'); await W.boardOff(p)

/* P6 — Saber loads the issued version onto the working copy: the deleted meeting's row comes back (D363); Ranger's
   meeting filed since stays on the programme, pending (§8 item 9) — after a reload too */
await W.toEdit(L, p)
const ISSUED = await p.evaluate(d => window.dayCurVer(d), THU)
const p6 = await T.S(p, 'P6', 'Saber loads the issued version of Thursday onto the working copy', async () => {
  const menu = p.locator(`#eWeek [data-planmenu="${THU}"]:visible`).first()
  if (!(await menu.count())) return fact('P6.load', 'no plan selector')
  await menu.click(); await L.sleep(400)
  const pv = p.locator(`[data-planpv="${ISSUED}"]:visible`).first()
  if (!(await pv.count())) return fact('P6.load', 'no issued version in the menu')
  await pv.click(); await L.sleep(500)
  const said = []
  for (let i = 0; i < 2; i++) { const b = p.locator(`[data-restore="${THU}"]:visible`).first(); if (!(await b.count())) break; said.push((await b.innerText()).trim()); await b.click(); await L.sleep(700) }
  fact('P6.load', said)
}, { reload: false })
fact('P6.toasts', await W.toasts(p))
const r6i = await rowFacts('P6.iss', iss), r6l = await rowFacts('P6.live', live)
L.check('P6 the deleted meeting\'s row is back (D363)', r6i.length === 1, r6i)
L.check('P6 Ranger\'s meeting filed since is on the programme (§8 item 9)', r6l.length === 1, r6l)
await heads('P6')
fact('P6.list', await changesList(L, p, THU))
await W.toEdit(L, p); await W.showDay(p, THU); await T.pic(p, 'P6-loaded-issued')
await L.reloadCompare(p, 'P6 reload', 'a', { page: 'editsched' }); await W.toastSpy(p)
const r6ir = await rowFacts('P6r.iss', iss)
L.check('P6 after a reload the deleted meeting\'s row is still there (D363)', r6ir.length === 1, r6ir)
await rowFacts('P6r.live', live)
await heads('P6r')
fact('P6r.list', await changesList(L, p, THU))

/* P7 — Saber's ✕ on Ranger's new meeting row: filed since and taken off is no pending change (D174) */
const p7 = await T.S(p, 'P7', 'Saber takes Ranger\'s new meeting off Thursday (✕ on its row)', async () => { fact('P7.x', await dropLanded(L, p, THU, live)) }, { reload: true })
fact('P7.weekRowsWritten', weekRows(p7))
fact('P7.acc', (await reqOf(p, live))?.acc || null)
await rowFacts('P7', live)
await heads('P7')
fact('P7.list', await changesList(L, p, THU))
await W.toEdit(L, p); await W.showDay(p, THU); await T.pic(p, 'P7-taken-off')

/* P8 — and Accept puts it back, pending again */
const p8 = await T.S(p, 'P8', 'Saber presses Accept on Ranger\'s card', async () => { fact('P8.acc', await accBtn(L, p, THU, live, 'g')) }, { reload: true })
fact('P8.weekRowsWritten', weekRows(p8))
await rowFacts('P8', live)
await heads('P8')

fact('errors', errors)
saveFacts(process.env.HP_OUT.replace(/\.json$/, '-facts.json'))
L.save({ table: T.T, tag: TAG })
await browser.close()
