/* [DB-READINESS] phase 6 (a) — the FULL check's walk: a request handed on with an OIL refusal on its row (30 Sep 26).
   The promise: a hand-over writes the REQUEST only as far as OIL goes (no refusal is cleared off any day — it is ignored on
   read); the screen and the money are as before phase 6: the old holder's refusal stops counting the moment the request
   leaves him, and does NOT come back when the request comes back (A → B → A); one Undo puts back the assignment and the
   refusal together; a reload shows the same. (The hand-over still re-writes the landed ROW on its day — the relink — which
   is step (c)'s, not built.) Run against this branch (HP_TAG=p6) and the build before phase 6 (HP_TAG=base). */
import { boot, world, fact, facts, saveFacts, fileTimed, handOver, oilPucks, oilIsOn, oilButton, oilTap, stored, TAG } from './p6-lib.mjs'
const { L, W } = await boot()
const T = W.table(L, 'desktop')
const { browser, p, errors } = await world(L)
await W.toastSpy(p)
const SAT = 5, WKEY = 'weeks/13-07-2026'
const A = 'yeti', B = 'razer'                       // Bolt, Ridge

/* A1 — a meeting for Bolt on Sat 18 Jul, 09:00–11:00, filed on the Inputs page: it lands on Saturday's ground programme */
let iid = null
await T.S(p, 'A1', 'Bolt files a meeting on Sat 18 Jul 09:00-11:00 (Inputs page)', async () => {
  iid = await fileTimed(L, p, { person: A, type: 'Meeting', iso: '2026-07-18', from: '09:00', to: '11:00', remarks: 'P6A MEETING' })
}, { reload: false, page: 'inputs' })
const item = 'i:' + iid
const rowOf = () => p.evaluate(([di, s]) => (window.DAYS[di].ground || []).filter(r => r.src === s).map(r => ({ who: r.who, more: r.more || [] })), [SAT, iid])
fact('A1.row', await rowOf())
L.check('A1 the meeting landed on Saturday as a ground row of Bolt\'s', (await rowOf()).length === 1 && (await rowOf())[0].who === A, await rowOf())

/* A2 — OIL Earn on Saturday: Bolt's puck on the meeting row switched OFF (a refusal) */
await W.boardOn(p, SAT)
fact('A2.oilbtn', await oilButton(L, p))
fact('A2.pucksBefore', (await oilPucks(p)).filter(x => x.item === item))
await T.S(p, 'A2', 'OIL Earn on Saturday: Bolt switched off on his meeting', async () => { fact('A2.tap', await oilTap(L, p, A, item)) }, { reload: false })
fact('A2.pucks', (await oilPucks(p)).filter(x => x.item === item))
fact('A2.oild', (await stored(p, `${WKEY}#${SAT}`))?.d?.oild || null)
L.check('A2 Bolt reads off on his meeting', (await oilPucks(p)).some(x => x.item === item && x.who === A && !x.on))
await T.pic(p, 'A2-board-oil-bolt-off')
await W.boardOff(p)

/* A3 — hand the meeting to Ridge (the Inputs page's ✎, person) */
await T.S(p, 'A3', 'the meeting handed from Bolt to Ridge', async () => { fact('A3.saved', await handOver(L, p, iid, B)) }, { reload: false, page: 'inputs' })
fact('A3.input', await p.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return { person: r.person, hand: r.hand, leftAt: r.leftAt, acc: r.acc } }, iid))
fact('A3.row', await rowOf())
fact('A3.storedOild', (await stored(p, `${WKEY}#${SAT}`))?.d?.oild || null)
await W.boardOn(p, SAT); if (!(await oilIsOn(p))) await oilButton(L, p)
fact('A3.pucks', (await oilPucks(p)).filter(x => x.item === item))
L.check('A3 Ridge now holds it and EARNS (Bolt\'s refusal is his, not Ridge\'s)', (await oilPucks(p)).some(x => x.item === item && x.who === B && x.on))
await T.pic(p, 'A3-board-oil-ridge')
await W.boardOff(p)

/* A4 — hand it BACK to Bolt: his old refusal must not come back (A → B → A) */
await T.S(p, 'A4', 'the meeting handed back from Ridge to Bolt', async () => { fact('A4.saved', await handOver(L, p, iid, A)) }, { reload: false, page: 'inputs' })
fact('A4.input', await p.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return { person: r.person, hand: r.hand, leftAt: r.leftAt } }, iid))
await W.boardOn(p, SAT); if (!(await oilIsOn(p))) await oilButton(L, p)
fact('A4.pucks', (await oilPucks(p)).filter(x => x.item === item))
L.check('A4 A → B → A: Bolt EARNS again — the refusal made under his first holding is void', (await oilPucks(p)).some(x => x.item === item && x.who === A && x.on))
await T.pic(p, 'A4-board-oil-bolt-back-on')
await W.boardOff(p)

/* A6 — Undo twice (top bar): Ridge holds; then Bolt holds with his refusal back */
await W.toEdit(L, p)
const u1 = await W.door(p, 'top', 'undo'); fact('A6.u1', u1)
fact('A6.after1', await p.evaluate(i => window.INPUTS.find(x => x.iid === i).person, iid))
const u2 = await W.door(p, 'top', 'undo'); fact('A6.u2', u2)
fact('A6.after2', await p.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return { person: r.person, hand: r.hand, leftAt: r.leftAt } }, iid))
await W.boardOn(p, SAT); if (!(await oilIsOn(p))) await oilButton(L, p)
fact('A6.pucks', (await oilPucks(p)).filter(x => x.item === item))
L.check('A6 two Undos: Bolt holds it again and his refusal is back (he reads off)', (await oilPucks(p)).some(x => x.item === item && x.who === A && !x.on))
await T.pic(p, 'A6-undo2-bolt-off-again')
await W.boardOff(p)

/* A7 — Redo twice: back to A → B → A, Bolt earns */
await W.toEdit(L, p)
fact('A7.r1', await W.door(p, 'top', 'redo')); fact('A7.r2', await W.door(p, 'top', 'redo'))
await W.boardOn(p, SAT); if (!(await oilIsOn(p))) await oilButton(L, p)
fact('A7.pucks', (await oilPucks(p)).filter(x => x.item === item))
L.check('A7 two Redos: Bolt earns again', (await oilPucks(p)).some(x => x.item === item && x.who === A && x.on))
await W.boardOff(p)

/* A5 — a reload: the same (Bolt earns) */
await L.reloadCompare(p, 'A5 reload after A → B → A', 'a', { page: 'editsched' })
await W.toastSpy(p)
await W.boardOn(p, SAT); if (!(await oilIsOn(p))) await oilButton(L, p)
fact('A5.pucks', (await oilPucks(p)).filter(x => x.item === item))
L.check('A5 after the reload Bolt still earns', (await oilPucks(p)).some(x => x.item === item && x.who === A && x.on))
await T.pic(p, 'A5-reloaded-bolt-on')
await W.boardOff(p)

/* A8 — a NEW refusal under the current holding counts (the control): Bolt off again; publish Saturday; the money */
await W.boardOn(p, SAT); if (!(await oilIsOn(p))) await oilButton(L, p)
await T.S(p, 'A8', 'Bolt switched off again under the current holding', async () => { fact('A8.tap', await oilTap(L, p, A, item)) }, { reload: false })
fact('A8.pucks', (await oilPucks(p)).filter(x => x.item === item))
L.check('A8 the new refusal counts: Bolt off', (await oilPucks(p)).some(x => x.item === item && x.who === A && !x.on))
await oilButton(L, p)   // leave the mode
fact('A8.sign', await W.signDay(p, SAT))
fact('A8.publish', await W.publishDay(p, SAT))
fact('A8.head', await W.head(p, SAT))
await T.pic(p, 'A8-published')
await W.boardOff(p)

/* A9 — the published Saturday: hand to Ridge (a pending change), then back to Bolt; the day heads and the pending list */
await T.S(p, 'A9', 'published Saturday: the meeting handed to Ridge', async () => { fact('A9.saved', await handOver(L, p, iid, B)) }, { reload: false, page: 'inputs' })
await W.toEdit(L, p); await W.showDay(p, SAT)
fact('A9.head', await W.head(p, SAT))
await W.boardOn(p, SAT)
fact('A9.headBoard', await W.head(p, SAT))
await T.pic(p, 'A9-published-handed-ridge')
await W.boardOff(p)
await T.S(p, 'A10', 'published Saturday: handed back to Bolt', async () => { fact('A10.saved', await handOver(L, p, iid, A)) }, { reload: false, page: 'inputs' })
await W.toEdit(L, p); await W.showDay(p, SAT)
fact('A10.head', await W.head(p, SAT))
await W.boardOn(p, SAT); if (!(await oilIsOn(p))) await oilButton(L, p)
fact('A10.pucks', (await oilPucks(p)).filter(x => x.item === item))
fact('A10.headBoard', await W.head(p, SAT))
await T.pic(p, 'A10-published-back-bolt')
await oilButton(L, p); await W.boardOff(p)
await L.reloadCompare(p, 'A10 reload', 'a', { page: 'editsched' })
fact('A10.headAfterReload', await W.head(p, SAT))

fact('errors', errors)
saveFacts(process.env.HP_OUT.replace(/\.json$/, '-facts.json'))
L.save({ table: T.T, tag: TAG })
await browser.close()
