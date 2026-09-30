/* [DB-READINESS] phase 6 (c) v3 — the FULL check's walk T: two people at once (1 Oct 26). Two tabs over ONE store (the
   stand-in for two devices on one database): Saber (scheduler) in tab A, Ranger (member) in tab B. Neither tab re-reads the
   store while open — exactly the case the day lock is for. The promise: Ranger's request writes only his request, so it
   can never overwrite a day Saber is holding; Saber's save of the day, made without knowing of the request, stores his
   day — and the request's row is worked out when the day is next read (tab A reloaded), pending on a published day.
   Run against this branch (HP_TAG=p6c) and the build before (c) (HP_TAG=base). */
import { boot, world, fact, saveFacts, fileTimed, TAG } from './p6-lib.mjs'
import { IS_C, rowsOf, noRid, weekRows } from './p6c-lib.mjs'
const { L, W } = await boot()
const W2 = await import('./dbrA-W2-lib.mjs')
const T = W.table(L, 'desktop')
const { browser, ctx, p: A, errors } = await world(L)
await W.toastSpy(A)
const B = await L.page(ctx, errors, 'B')
await L.signIn(B, 'm'); await W.toastSpy(B)
const THU = 3, FRI = 4
const stored = (pg, di) => pg.evaluate(d => { const v = localStorage.getItem('raptor:weeks/13-07-2026#' + d); if (!v) return null; const o = JSON.parse(v); const day = o.d || o; return { notes: (day.notes || []).map(n => n.t || n.text || n).join('|').slice(0, 200), ground: (day.ground || []).map(g => `${g.prog}|${g.rmks}`) } }, di)
/* Friday's published state rides its own day row (`ok`, docs/data-schema.md §The week record) */
const book = (pg) => pg.evaluate(d => { const v = localStorage.getItem('raptor:weeks/13-07-2026#' + d); if (!v) return null; const o = JSON.parse(v); return { ok: o.ok ?? null, signed: !!o.sg } }, FRI)

/* T1 — Ranger (tab B) files a meeting on Thursday 13:00–14:00 */
let iid = null
const t1 = await L.step(B, 'T1 tab B: Ranger files a meeting on Thu 16 Jul 13:00-14:00', async () => { iid = await fileTimed(L, B, { type: 'Meeting', iso: '2026-07-16', from: '13:00', to: '14:00', remarks: 'P6C TAB B' }) })
fact('T1.weekRowsWritten', weekRows(t1))
if (IS_C) L.check('T1 his filing wrote no week row', !weekRows(t1).length, weekRows(t1))
fact('T1.storedThu', await stored(B, THU))

/* T2 — Saber (tab A, open since before, never reloaded) types a note on Thursday: his save of the day */
await W.toEdit(L, A)
const t2 = await L.step(A, 'T2 tab A (stale): Saber types a note on Thursday', async () => { await W.weekText(A, `dn:${THU}.0`, 'P6C TAB A NOTE') })
fact('T2.weekRowsWritten', weekRows(t2))
fact('T2.storedThu', await stored(A, THU))
await W.showDay(A, THU); await T.pic(A, 'T2-tabA-stale')

/* T3 — tab A reloaded (the next read): Saber's note AND Ranger's meeting */
await A.reload(); await L.signIn(A, 'a', { goto: false }); await L.settle(A, 700); await W.toastSpy(A)
const r3 = noRid(await rowsOf(A, iid)); fact('T3.rows', r3)
fact('T3.note', await A.evaluate(d => window.txtGet(`dn:${d}.0`), THU))
L.check('T3 after tab A reloads: Saber\'s note stands AND Ranger\'s meeting is on Thursday', /P6C TAB A NOTE/.test(await A.evaluate(d => window.txtGet(`dn:${d}.0`), THU)) && r3.length === 1 && r3[0].di === THU, r3)
await W.toEdit(L, A); await W.showDay(A, THU); await T.pic(A, 'T3-tabA-reloaded')

/* T4 — Saber publishes Friday (tab A); Ranger, whose tab still thinks Friday is not published, files a meeting on it */
await W.showDay(A, FRI)
fact('T4.sign', await W.signDay(A, FRI)); fact('T4.pub', await W.publishDay(A, FRI))
fact('T4.bookAfterPublish', await book(A))
let iid2 = null
const t4 = await L.step(B, 'T4 tab B (stale): Ranger files a meeting on Fri 17 Jul 09:00-10:00', async () => { iid2 = await fileTimed(L, B, { type: 'Meeting', iso: '2026-07-17', from: '09:00', to: '10:00', remarks: 'P6C TAB B FRI' }) })
fact('T4.weekRowsWritten', weekRows(t4))
if (IS_C) L.check('T4 his filing wrote no week row — it cannot touch the published Friday', !weekRows(t4).length, weekRows(t4))
fact('T4.bookAfterFiling', await book(B))
L.check('T4 Friday is still published in the store after his filing', JSON.stringify(await book(B)) === JSON.stringify(await book(A)) && !!(await book(B))?.ok, { a: await book(A), b: await book(B) })

/* T5 — tab A reloaded: Friday still published, his meeting on its working copy, pending (16 Sep 26) */
await A.reload(); await L.signIn(A, 'a', { goto: false }); await L.settle(A, 700); await W.toastSpy(A)
fact('T5.rows', noRid(await rowsOf(A, iid2)))
await W.toEdit(L, A); await W.showDay(A, FRI)
const h5 = await W.head(A, FRI); fact('T5.head', h5)
L.check('T5 Friday: still published, his meeting reads pending, the four fallen', /ORIG/.test(h5.tag) && /1 pending/.test(h5.pending) && W.signsEmpty(h5), h5)
await T.pic(A, 'T5-tabA-friday-pending')

/* T6 — Ranger (tab B, stale) deletes his Thursday meeting; tab A reloaded: gone; Saber's note still there */
const t6 = await L.step(B, 'T6 tab B: Ranger deletes his Thursday meeting', async () => fact('T6.del', await W2.delReq(B, iid)))
fact('T6.weekRowsWritten', weekRows(t6))
await A.reload(); await L.signIn(A, 'a', { goto: false }); await L.settle(A, 700)
fact('T6.rows', noRid(await rowsOf(A, iid)))
L.check('T6 after tab A reloads: the meeting is gone, the note stays', !(await rowsOf(A, iid)).length && /P6C TAB A NOTE/.test(await A.evaluate(d => window.txtGet(`dn:${d}.0`), THU)))
fact('T6.headFri', await (async () => { await W.toEdit(L, A); await W.showDay(A, FRI); return W.head(A, FRI) })())

fact('errors', errors)
saveFacts(process.env.HP_OUT.replace(/\.json$/, '-facts.json'))
L.save({ table: T.T, tag: TAG })
await browser.close()
