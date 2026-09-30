/* [DB-READINESS] phase 6 (c) v3 — the FULL check's walk U: a request's row on a day NOT published (1 Oct 26).
   The promise: a request's filing, edit, delete and their Undo / Redo write the REQUEST only; its row on the Ground
   Programme is worked out when the day is read — the same right after, after a reload, for another person; a scheduler's
   own work on the row (a hand-set time, a second man) is his, saved with the day, and an Undo of the request's delete
   brings the row back EXACTLY (same place, same hidden id, the hand-set time and the second man — §8 item 10).
   Run against this branch (HP_TAG=p6c) and the build before (c) (HP_TAG=base); p6-compare.mjs lays the facts side by side. */
import { boot, world, fact, saveFacts, fileTimed, alPanel, TAG } from './p6-lib.mjs'
import { IS_C, rowsOf, noRid, reqOf, weekRows, switchTo } from './p6c-lib.mjs'
const { L, W } = await boot()
const W2 = await import('./dbrA-W2-lib.mjs')
const { put } = await import('./lib.mjs')
const T = W.table(L, process.env.HP_PHONE ? 'phone' : 'desktop')
const { browser, p, errors } = await world(L)
await W.toastSpy(p)
const THU = 3, FRI = 4, RANGER = 'bane', BOLT = 'yeti'
const heads = async (tag, days = [THU, FRI]) => { await W.toEdit(L, p); for (const di of days) { await W.showDay(p, di); fact(`${tag}.head${di}`, await W.head(p, di)) } fact(`${tag}.al`, await alPanel(p)) }
const rowFacts = async (tag, iid) => { const rs = await rowsOf(p, iid); fact(`${tag}.rows`, noRid(rs)); fact(`${tag}.acc`, (await reqOf(p, iid))?.acc ?? '(gone)'); return rs }
const noWeek = (tag, a) => { const w = weekRows(a); fact(`${tag}.weekRowsWritten`, w); if (IS_C) L.check(`${tag} — a request's command wrote no week row (§11, D450)`, !w.length, w) }

/* U1 — Saber files a meeting for Ranger, Thu 16 Jul 10:00–11:00 (the Inputs page). It shows on Thursday's programme. */
let iid = null
const u1 = await T.S(p, 'U1', 'Saber files a meeting for Ranger, Thu 16 Jul 10:00-11:00 (Inputs page)', async () => {
  iid = await fileTimed(L, p, { person: RANGER, type: 'Meeting', iso: '2026-07-16', from: '10:00', to: '11:00', remarks: 'P6C MEETING' })
}, { reload: false, page: 'inputs' })
noWeek('U1', u1)
let r1 = await rowFacts('U1', iid)
L.check('U1 the meeting shows on Thursday\'s Ground Programme, once', r1.length === 1 && r1[0].di === THU, r1)
fact('U1.toasts', await W.toasts(p))
await heads('U1')
await T.pic(p, 'U1-filed-week')
await L.reloadCompare(p, 'U1 reload', 'a', { page: 'editsched' }); await W.toastSpy(p)
const r1b = await rowFacts('U1r', iid)
L.check('U1 after a reload: the same row, the same hidden id', r1b.length === 1 && r1b[0].rid === r1[0].rid && r1b[0].ri === r1[0].ri, { before: r1, after: r1b })

/* U2 — Saber, on Thursday's board: the row's start set by hand to 10:30, and Bolt put on it as a second man */
await W.boardOn(p, THU)
const ri = r1b[0].ri
const u2 = await T.S(p, 'U2', 'Saber on the board: the meeting row\'s start set to 10:30 by hand, Bolt added to it', async () => {
  await W.boardText(p, `gr:${THU}.${ri}.str`, '1030')
  fact('U2.put', await put(p, `[data-fill="g:${THU}.${ri}.+"]`, [BOLT]))
}, { reload: false })
fact('U2.weekRowsWritten', weekRows(u2))
const r2 = await rowFacts('U2', iid)
L.check('U2 the row carries the hand-set 10:30 and Bolt', r2.length === 1 && r2[0].str === '10:30' && r2[0].more.includes(BOLT), r2)
await T.pic(p, 'U2-board-handset')
await W.boardOff(p)
await L.reloadCompare(p, 'U2 reload', 'a', { page: 'editsched' }); await W.toastSpy(p)
const RID = (await rowsOf(p, iid))[0]?.rid

/* U3 — Ranger signs in and deletes his meeting (the Inputs page's ✕) */
await switchTo(L, W2, p, 'm'); await W.toastSpy(p)
const u3 = await T.S(p, 'U3', 'Ranger deletes his meeting (Inputs page ✕)', async () => { fact('U3.del', await W2.delReq(p, iid)) }, { reload: false, page: 'inputs', who: 'm' })
noWeek('U3', u3)
fact('U3.toasts', await W.toasts(p))
const r3 = await rowFacts('U3', iid)
L.check('U3 the row is gone from Thursday', r3.length === 0, r3)
await heads('U3')
await T.pic(p, 'U3-deleted-week')

/* U4 — Ranger's Undo (the top bar): the request back, and its row back EXACTLY — place, id, 10:30, Bolt */
await L.go(p, 'inputs')
const u4 = await L.step(p, 'U4 Ranger presses Undo', async () => { fact('U4.undo', await W.door(p, 'top', 'undo')) })
noWeek('U4', u4)
const r4 = await rowFacts('U4', iid)
L.check('U4 Undo: the same row back — same place, same hidden id, the hand-set 10:30 and Bolt (§8 item 10)',
  r4.length === 1 && r4[0].rid === RID && r4[0].ri === ri && r4[0].str === '10:30' && r4[0].more.includes(BOLT), { r4, RID, ri })
await heads('U4')
await T.pic(p, 'U4-undo-row-back')
await L.reloadCompare(p, 'U4 reload (as Ranger)', 'm', { page: 'editsched' }); await W.toastSpy(p)
const r4b = await rowFacts('U4r', iid)
L.check('U4 after a reload: the same', r4b.length === 1 && r4b[0].rid === RID && r4b[0].str === '10:30' && r4b[0].more.includes(BOLT), r4b)

/* U5 — delete again, Undo, then Redo: the row goes; a reload agrees */
await L.go(p, 'inputs')
fact('U5.del', await W2.delReq(p, iid))
fact('U5.undo', await W.door(p, 'top', 'undo'))
fact('U5.afterUndo', noRid(await rowsOf(p, iid)))
const u5 = await L.step(p, 'U5 Ranger presses Redo (the delete again)', async () => { fact('U5.redo', await W.door(p, 'top', 'redo')) })
noWeek('U5', u5)
const r5 = await rowFacts('U5', iid)
L.check('U5 Redo: the row is gone again', r5.length === 0, r5)
await L.reloadCompare(p, 'U5 reload', 'm', { page: 'editsched' }); await W.toastSpy(p)
fact('U5r.rows', noRid(await rowsOf(p, iid)))
await heads('U5r')
await T.pic(p, 'U5-redo-reloaded')

/* U6 — Ranger files a new meeting himself, Thu 16 Jul 13:00–14:00; Saber, who had the week open before, then sees it */
let iid2 = null
const u6 = await T.S(p, 'U6', 'Ranger files a meeting himself, Thu 16 Jul 13:00-14:00', async () => {
  iid2 = await fileTimed(L, p, { type: 'Meeting', iso: '2026-07-16', from: '13:00', to: '14:00', remarks: 'P6C RANGER OWN' })
}, { reload: false, page: 'inputs', who: 'm' })
noWeek('U6', u6)
const r6 = await rowFacts('U6', iid2)
L.check('U6 his meeting shows on Thursday straight away', r6.length === 1 && r6[0].di === THU, r6)
await heads('U6')
await T.pic(p, 'U6-member-filed')

/* U7 — Ranger edits it: words, then the time 13:00 → 13:30 (the ✎ editor) — the row re-made in place */
await L.go(p, 'inputs')
const u7 = await L.step(p, 'U7 Ranger edits his meeting\'s words', async () => { fact('U7.save', await W2.editRemarks(p, iid2, 'P6C RANGER EDITED')) })
noWeek('U7', u7)
const r7 = await rowFacts('U7', iid2)
L.check('U7 the row says the new words, in the same place with the same id', r7.length === 1 && r7[0].rmks === 'P6C RANGER EDITED' && r7[0].rid === r6[0].rid && r7[0].ri === r6[0].ri, { r6, r7 })
if (await W2.openEdit(p, iid2)) {
  await p.locator('#inBody tr.ined [data-ed="stime"]').fill('13:30')
  await p.locator('#inBody tr.ined [data-save]').first().click(); await L.sleep(700)
}
const r7b = await rowFacts('U7t', iid2)
L.check('U7 the time change reaches the row (13:30)', r7b.length === 1 && r7b[0].str === '13:30', r7b)
fact('U7.toasts', await W.toasts(p))
await L.reloadCompare(p, 'U7 reload', 'm', { page: 'editsched' }); await W.toastSpy(p)
fact('U7r.rows', noRid(await rowsOf(p, iid2)))

/* U8 — Ranger re-dates it to Fri 17 Jul: Thursday's row goes, Friday's comes (no "Moved outside the programmed week") */
const u8 = await L.step(p, 'U8 Ranger re-dates his meeting to Fri 17 Jul', async () => { fact('U8.read', await W2.redate(p, iid2, '2026-07-17', '2026-07-17')) })
noWeek('U8', u8)
fact('U8.toasts', await W.toasts(p))
const r8 = await rowFacts('U8', iid2)
L.check('U8 the row is on Friday now, not Thursday', r8.length === 1 && r8[0].di === FRI, r8)
await heads('U8')
await T.pic(p, 'U8-redated-friday')
fact('U8.undo', await W.door(p, 'top', 'undo'))
const r8u = await rowFacts('U8u', iid2)
L.check('U8 Undo: back on Thursday with its old id and place', r8u.length === 1 && r8u[0].di === THU && r8u[0].rid === r7b[0].rid, { r8u, r7b })
await L.reloadCompare(p, 'U8 reload', 'm', { page: 'editsched' }); await W.toastSpy(p)
fact('U8r.rows', noRid(await rowsOf(p, iid2)))

/* U9 — Saber signs in: the week reads the same for him (the other person's view is the same view) */
await switchTo(L, W2, p, 'a'); await W.toastSpy(p)
fact('U9.rows1', noRid(await rowsOf(p, iid)))
fact('U9.rows2', noRid(await rowsOf(p, iid2)))
await heads('U9')
await W.boardOn(p, THU)
await T.pic(p, 'U9-saber-board-thursday')
await W.boardOff(p)
/* U10 — Saber's own change to Thursday (a day note) saves the day: the rows the view shows are stored with it, as they are */
const u10 = await T.S(p, 'U10', 'Saber types a note on Thursday (his save of the day)', async () => { await W.weekText(p, `dn:${THU}.0`, 'P6C HOLDER NOTE') }, { reload: true })
fact('U10.weekRowsWritten', weekRows(u10))
fact('U10.rows1', noRid(await rowsOf(p, iid)))
fact('U10.rows2', noRid(await rowsOf(p, iid2)))
fact('U10.stored', await p.evaluate(([a, b]) => { const v = JSON.parse(localStorage.getItem('raptor:weeks/13-07-2026#3') || 'null'); const g = v && (v.d || v).ground || []; return g.filter(r => r.src === a || r.src === b).map(r => ({ src: r.src === a ? 'first' : 'second', str: r.str, more: r.more || [], kept: !!r.kept })) }, [iid, iid2]))
await heads('U10')

fact('errors', errors)
saveFacts(process.env.HP_OUT.replace(/\.json$/, '-facts.json'))
L.save({ table: T.T, tag: TAG })
await browser.close()
