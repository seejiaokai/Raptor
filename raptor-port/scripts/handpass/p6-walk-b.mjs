/* [DB-READINESS] phase 6 (b) — the FULL check's walk: a request filed under Unavailable (30 Sep 26).
   The promise: filing under Unavailable (the → Unavail button on an "Other" request's card), its Undo and the adoption of
   a standing row write the REQUEST only — no pending mark on any day it covers; a published day's count, its pending list
   and its four sign-offs come from the filing itself, exactly as before; Unpublish makes the filing read pending again.
   Run against this branch (HP_TAG=p6) and the build before phase 6 (HP_TAG=base). */
import { boot, world, fact, saveFacts, fileRange, accBtn, dropLanded, alPanel, changesList, TAG } from './p6-lib.mjs'
const { L, W } = await boot()
const T = W.table(L, 'desktop')
const { browser, p, errors } = await world(L)
await W.toastSpy(p)
const THU = 3, FRI = 4, WK = 'weeks/13-07-2026'
const heads = async (tag) => { await W.toEdit(L, p); for (const di of [THU, FRI]) { await W.showDay(p, di); fact(`${tag}.head${di}`, await W.head(p, di)) } fact(`${tag}.al`, await alPanel(p)) }
const dayRows = a => (a && a.put ? a.put.filter(k => k.startsWith(WK + '#')) : [])

/* ---- part 1: days never published ---- */
let iid1 = null
await T.S(p, 'B1', 'an "Other" request for Warden, Thu 16 – Fri 17 Jul, all day (Inputs page)', async () => {
  iid1 = await fileRange(L, p, { person: 'nact', type: 'Other', fromIso: '2026-07-16', toIso: '2026-07-17', remarks: 'P6B OTHER ONE' })
}, { reload: false, page: 'inputs' })
fact('B1.input', await p.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return r ? { person: r.person, type: r.type, date: r.date, end: r.endDate || r.end || null, acc: r.acc || null } : null }, iid1))
await heads('B1')
await W.showDay(p, THU)
fact('B1x.press', await dropLanded(L, p, THU, iid1))   // it landed on the ground programme at filing; the row's ✕ takes it off (acc 'r'), and its card then offers → Ground / → Unavail
fact('B1x.acc', await p.evaluate(i => window.INPUTS.find(x => x.iid === i)?.acc || null, iid1))
await heads('B1x')
const b2 = await T.S(p, 'B2', '→ Unavail on its Thursday card (never-published days)', async () => { fact('B2.press', await accBtn(L, p, THU, iid1, 'u')) }, { reload: false })
fact('B2.dayRowsWritten', dayRows(b2))
fact('B2.acc', await p.evaluate(i => window.INPUTS.find(x => x.iid === i)?.acc || null, iid1))
fact('B2.pendingKeys', await p.evaluate(() => Object.keys(window.SCHED.pending || {}).filter(k => k.startsWith('inp:'))))
await heads('B2')
await T.pic(p, 'B2-filed-unavail')
fact('B2.undo', await W.door(p, 'top', 'undo'))
fact('B2u.acc', await p.evaluate(i => window.INPUTS.find(x => x.iid === i)?.acc || null, iid1))
await heads('B2u')
fact('B2.redo', await W.door(p, 'top', 'redo'))
fact('B2r.acc', await p.evaluate(i => window.INPUTS.find(x => x.iid === i)?.acc || null, iid1))
await heads('B2r')
await L.reloadCompare(p, 'B2 reload', 'a', { page: 'editsched' })
await W.toastSpy(p)
await heads('B2reload')

/* ---- part 2: published Thursday and Friday ---- */
await W.toEdit(L, p)
for (const di of [THU, FRI]) { await W.showDay(p, di); fact(`B3.sign${di}`, await W.signDay(p, di)); fact(`B3.pub${di}`, await W.publishDay(p, di)) }
await heads('B3')
await T.pic(p, 'B3-published')
let iid2 = null
await T.S(p, 'B4', 'published days: an "Other" request for Piston, Thu 16 – Fri 17, filed live', async () => {
  iid2 = await fileRange(L, p, { person: 'pump', type: 'Other', fromIso: '2026-07-16', toIso: '2026-07-17', remarks: 'P6B OTHER TWO' })
}, { reload: false, page: 'inputs' })
await heads('B4')
fact('B4.list3', await changesList(L, p, THU))
await W.showDay(p, THU)
fact('B4.acc', await p.evaluate(i => window.INPUTS.find(x => x.iid === i)?.acc || null, iid2))
fact('B4x.press', await dropLanded(L, p, THU, iid2))
fact('B4x.acc', await p.evaluate(i => window.INPUTS.find(x => x.iid === i)?.acc || null, iid2))
await heads('B4x')
await W.showDay(p, THU)
const b5 = await T.S(p, 'B5', 'published Thursday: → Unavail on Piston\'s card', async () => { fact('B5.press', await accBtn(L, p, THU, iid2, 'u')) }, { reload: false })
fact('B5.dayRowsWritten', dayRows(b5))
fact('B5.pendingKeys', await p.evaluate(() => Object.keys(window.SCHED.pending || {}).filter(k => k.startsWith('inp:'))))
await heads('B5')
fact('B5.list3', await changesList(L, p, THU))
fact('B5.list4', await changesList(L, p, FRI))
await T.pic(p, 'B5-published-filed-unavail')
fact('B5.undo', await W.door(p, 'top', 'undo'))
await heads('B5u')
fact('B5.redo', await W.door(p, 'top', 'redo'))
await heads('B5r')
await L.reloadCompare(p, 'B5 reload', 'a', { page: 'editsched' })
await W.toastSpy(p)
await heads('B5reload')

/* ---- part 3: Friday's AL1 published, then Unpublished — the filing reads pending again ---- */
await W.toEdit(L, p); await W.showDay(p, FRI)
fact('B6.sign', await W.signDay(p, FRI))
fact('B6.al', await W.publishAL(p, FRI))
await heads('B6')
await T.pic(p, 'B6-al1-friday')
fact('B7.unpub', await W.unpublish(p, FRI))
await heads('B7')
fact('B7.list4', await changesList(L, p, FRI))
await T.pic(p, 'B7-unpublished-friday')
await L.reloadCompare(p, 'B7 reload', 'a', { page: 'editsched' })
await heads('B7reload')

/* ---- part 4: take Piston's filing back out of Unavailable (its Undo on the card) on published Thursday ---- */
await W.toEdit(L, p); await W.showDay(p, THU)
const b8 = await T.S(p, 'B8', 'published Thursday: the card\'s Undo takes Piston back out of Unavailable', async () => { fact('B8.press', await accBtn(L, p, THU, iid2, 'x')) }, { reload: false })
fact('B8.dayRowsWritten', dayRows(b8))
await heads('B8')
await L.reloadCompare(p, 'B8 reload', 'a', { page: 'editsched' })
await heads('B8reload')

fact('errors', errors)
saveFacts(process.env.HP_OUT.replace(/\.json$/, '-facts.json'))
L.save({ table: T.T, tag: TAG })
await browser.close()
