/* [DB-READINESS] phase 6 (a) — the FULL check's walk, part 2: an OIL-earning claim with NO row of its own (a duty filed
   under Unavailable on Sat 18 Jul), refused in the OIL Earn mode, the day published, then handed A → B → A (Astra's
   scenario 9, 30 Sep 26). No landed row, so no relink (step (c)) is involved: phase 6 promises the hand-over writes NO day
   row at all, and the screen — the OIL switch, the day head, the pending list, the Leave War's credit — is as before.
   Run against this branch (HP_TAG=p6) and the build before phase 6 (HP_TAG=base). */
import { boot, world, fact, saveFacts, fileRange, handOver, oilPucks, oilIsOn, oilButton, oilTap, changesList, TAG } from './p6-lib.mjs'
const { L, W } = await boot()
const T = W.table(L, 'desktop')
const { browser, p, errors } = await world(L)
await W.toastSpy(p)
const SAT = 5, WK = 'weeks/13-07-2026'
const A = 'yeti', B = 'razer'
const weekRows = a => (a && a.put ? [...a.put, ...a.del].filter(k => k.startsWith('weeks/')) : [])
const warCell = async (pid) => {
  await L.go(p, 'leavewar'); await L.sleep(700)
  const t = await p.evaluate(id => { const c = document.querySelector(`[data-testid="cell-${id}-2026-07-18"]`); return c ? (c.innerText || '').replace(/\s+/g, ' ').trim() + ' |' + c.className : null }, pid)
  await W.toEdit(L, p)
  return t
}

/* A2-1 — a duty claim for Bolt on Sat 18 Jul (asks for OIL — answered Yes) */
let iid = null
await T.S(p, 'A2-1', 'Bolt files an overseas duty (OD) on Sat 18 Jul (Inputs page; OIL asked — Yes)', async () => {
  iid = await fileRange(L, p, { person: A, type: 'OD', fromIso: '2026-07-18', toIso: '2026-07-18', remarks: 'P6A2 DUTY' })
}, { reload: false, page: 'inputs' })
const item = 'i:' + iid
fact('A2-1.input', await p.evaluate(i => { const r = window.INPUTS.find(x => x.iid === i); return r ? { type: r.type, acc: r.acc || null, oil: r.oil || null } : null }, iid))
fact('A2-1.landed', await p.evaluate(([d, i]) => (window.DAYS[d].ground || []).some(r => r.src === i), [SAT, iid]))

/* A2-2 — OIL Earn on Saturday: the claim's puck (Unavailable panel) switched off */
await W.boardOn(p, SAT)
if (!(await oilIsOn(p))) await oilButton(L, p)
fact('A2-2.before', (await oilPucks(p)).filter(x => x.item === item))
await T.S(p, 'A2-2', 'OIL Earn: Bolt\'s duty claim switched off', async () => { fact('A2-2.tap', await oilTap(L, p, A, item)) }, { reload: false })
fact('A2-2.after', (await oilPucks(p)).filter(x => x.item === item))
await T.pic(p, 'A2-2-claim-off')
await oilButton(L, p)

/* A2-3 — publish Saturday */
fact('A2-3.sign', await W.signDay(p, SAT)); fact('A2-3.pub', await W.publishDay(p, SAT))
fact('A2-3.head', await W.head(p, SAT))
await W.boardOff(p)
fact('A2-3.war', await warCell(A))

/* A2-4 — hand the claim to Ridge: no day row */
const h1 = await T.S(p, 'A2-4', 'the duty claim handed from Bolt to Ridge', async () => { fact('A2-4.saved', await handOver(L, p, iid, B)) }, { reload: false, page: 'inputs' })
fact('A2-4.weekRows', weekRows(h1))
await W.toEdit(L, p); await W.showDay(p, SAT)
fact('A2-4.head', await W.head(p, SAT))
fact('A2-4.list', await changesList(L, p, SAT))
await W.boardOn(p, SAT); if (!(await oilIsOn(p))) await oilButton(L, p)
fact('A2-4.pucks', (await oilPucks(p)).filter(x => x.item === item))
await T.pic(p, 'A2-4-handed-ridge')
await oilButton(L, p); await W.boardOff(p)

/* A2-5 — hand it back to Bolt: his old refusal must not revive; still no day row */
const h2 = await T.S(p, 'A2-5', 'handed back from Ridge to Bolt', async () => { fact('A2-5.saved', await handOver(L, p, iid, A)) }, { reload: false, page: 'inputs' })
fact('A2-5.weekRows', weekRows(h2))
await W.toEdit(L, p); await W.showDay(p, SAT)
fact('A2-5.head', await W.head(p, SAT))
fact('A2-5.list', await changesList(L, p, SAT))
await W.boardOn(p, SAT); if (!(await oilIsOn(p))) await oilButton(L, p)
fact('A2-5.pucks', (await oilPucks(p)).filter(x => x.item === item))
L.check('A2-5 A → B → A: Bolt earns (the refusal from his first holding is void)', (await oilPucks(p)).some(x => x.item === item && x.who === A && x.on))
await T.pic(p, 'A2-5-back-bolt')
await oilButton(L, p); await W.boardOff(p)
fact('A2-5.war', await warCell(A))

/* A2-6 — Undo the hand-back: Ridge holds; Undo again: Bolt holds with the refusal (off) */
await W.toEdit(L, p)
fact('A2-6.u1', await W.door(p, 'top', 'undo')); fact('A2-6.u2', await W.door(p, 'top', 'undo'))
await W.showDay(p, SAT); fact('A2-6.head', await W.head(p, SAT))
await W.boardOn(p, SAT); if (!(await oilIsOn(p))) await oilButton(L, p)
fact('A2-6.pucks', (await oilPucks(p)).filter(x => x.item === item))
L.check('A2-6 two Undos: Bolt holds it with his refusal back (off)', (await oilPucks(p)).some(x => x.item === item && x.who === A && !x.on))
await oilButton(L, p); await W.boardOff(p)
fact('A2-6.r1', await W.door(p, 'top', 'redo')); fact('A2-6.r2', await W.door(p, 'top', 'redo'))
await W.showDay(p, SAT); fact('A2-6.headRedo', await W.head(p, SAT))

/* A2-7 — reload */
await L.reloadCompare(p, 'A2-7 reload', 'a', { page: 'editsched' })
await W.showDay(p, SAT); fact('A2-7.head', await W.head(p, SAT))
await W.boardOn(p, SAT); if (!(await oilIsOn(p))) await oilButton(L, p)
fact('A2-7.pucks', (await oilPucks(p)).filter(x => x.item === item))
await oilButton(L, p); await W.boardOff(p)

fact('errors', errors)
saveFacts(process.env.HP_OUT.replace(/\.json$/, '-facts.json'))
L.save({ table: T.T, tag: TAG })
await browser.close()
