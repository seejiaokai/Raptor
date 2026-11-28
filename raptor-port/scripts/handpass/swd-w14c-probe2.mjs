// swd-w14c-probe2 — the second batch of w14c's routes, proved on this build (SZ=d or p): the window's calendar across the
// month's end (Fri 31 Jul → Sat 1 Aug), Ranger's own run (desktop drag / phone window) Sat 18 → Sun 19, his top bar Undo and
// Redo of it, Saber's Undo after a posting move read without pressing, a bell line tapped and read back.
// SZ=d W14C_RUN=probe2 node scripts/handpass/swd-w14c-probe2.mjs
import './swd-w14c-env.mjs'
const Z = await import('./swd-w14c-lib.mjs')
const { T, L, RANGER, D, J, asR, asS, scene, postAny, moveTo, fileMe, fileAcross, runOf, barLook, topBar, tbSay, bell, sayB, tapAndRead, tapSay } = Z
console.log('VERSION swd-w14c-probe2 1 · size', process.env.SZ || 'd')
const r = (W, id, what, note, pic) => W.rec(id, what, 'REC', note, pic)
const recs = p => T.sansInputs(p)
await T.run('probe2', process.env.SZ || 'd', scene(async (p, W) => {
  await postAny(p, W, RANGER, D[17], 'q.1')
  await asR(p, W)
  await fileMe(p, W, 'Ranger', D[17], null, 'q.2')
  await asS(p, W)
  await moveTo(p, W, D[17], D[18], 'q.3')
  const u = await barLook(p)
  r(W, 'q.4', 'Saber\'s top bar Undo after the posting move, read (not pressed)', J(u), await W.pic(p, 'q-4-undo'))
  await asR(p, W)
  const a = await fileAcross(p, W, '2026-07-31', '2026-08-01', 'q-5')
  r(W, 'q.5', 'Ranger: Fri 31 Jul window → › → Sat 1 Aug tapped → Add', J(a), a.pic)
  const g = await runOf(p, W, D[18], D[19], 'q-6')
  r(W, 'q.6', 'Ranger: his own run Sat 18 → Sun 19, Add', `${g.how} · made ${J(g.made)} · said "${g.said}"`, g.pic)
  const t1 = await topBar(p, W, 'undo', RANGER, 'q-7')
  r(W, 'q.7', 'Ranger: the top bar Undo', `${tbSay(t1)} · his SANS filings ${J(await recs(p))}`, t1.pic)
  const t2 = await topBar(p, W, 'redo', RANGER, 'q-8')
  r(W, 'q.8', 'Ranger: the top bar Redo', `${tbSay(t2)} · his SANS filings ${J(await recs(p))}`, t2.pic)
  const b = await bell(p, W, 'q-9')
  r(W, 'q.9', 'Ranger\'s bell', sayB(b), b.pic)
  if (b.change[0]) { const t = await tapAndRead(p, W, b.change[0].id, 'q-10'); r(W, 'q.10', 'the A line tapped', tapSay(t), t.pic) }
}))
process.exit(0)
