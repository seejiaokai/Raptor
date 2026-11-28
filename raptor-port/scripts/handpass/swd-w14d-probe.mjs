// swd-w14d-probe — the routes w14d needs, proved once on this build before any scenario uses them:
// P9 (a date set no fly through the SANS day's "Days" door → the Calendar window), P10 (a member opening a shared SANS offer:
// does its window let him save?), the edit of a saved filing's dates (B5), a titled input and an LL filed for Ranger and
// changed (D1), and the Scheduler Board's own bell (E).
//   SZ=d|p W14D_RUN=probe node scripts/handpass/swd-w14d-probe.mjs
import './swd-w14d-env.mjs'
const Z = await import('./swd-w14d-lib.mjs')
const { K, X, T, L, M, RANGER, HEX, I, J, need, asR, asS, scene, sleep, postAny, tickOf, run, noFly, editDates, fileIn, editIn, notes, bell, sayB, addState, sayAdd } = Z
console.log('VERSION swd-w14d-probe 2 · size', process.env.SZ || 'd')
const SZ = process.env.SZ || 'd'
const r = (W, id, what, note, pic) => W.rec(id, what, 'REC', note, pic)
await run('probe', SZ, scene(async (p, W) => {
  /* P9 */
  const n = await noFly(p, W, I[17], 'p9')
  r(W, 'p9', 'P9: Saber, SANS day Fri 17 → "Days" → the Calendar window → Fri 17 set no fly', J(n), n.pic)
  const a = await addState(p, W, I[17], 'p9b')
  r(W, 'p9b', 'P9: Fri 17\'s SANS day after (Saber)', sayAdd(a), a.pic)
  if (SZ !== 'd') return
  /* P10 */
  await postAny(p, W, RANGER, I[17], 'p10.1')
  await tickOf(p, W, HEX, true, 'p10.2')
  const f = await T.file(p, W, I[18], [RANGER, HEX], ['fly'], null, 'p10-3')
  need(W, 'p10.3', 'Saber files ONE shared Sat 18 offer for Ranger and Hex', !!f.iid, f.iid ? J(f.made) : f.refused, f.pic)
  await T.closeAll(p, W)
  await asR(p, W)
  await M.onSans(p, W)
  const o = await X.openLine(p, W, I[18], f.iid, 'p10-4')
  r(W, 'p10', 'P10: Ranger opens the shared offer from Sat 18 — what its window offers', o.ok ? J(o.r) : o.why, o.pic)
  await X.closeInp(p, W); await T.closeAll(p, W)
  /* B5's edit: Ranger's own one-man filing Fri 17 – Sat 18, opened, Thu 16 then Sat 18 tapped, Save */
  const g = await T.file(p, W, I[17], null, ['fly'], null, 'p5-1', { endIso: I[18] })
  need(W, 'p5.1', 'Ranger files Fri 17 – Sat 18 (one filing)', !!g.iid, J(g.made), g.pic)
  await T.closeAll(p, W)
  const e = await editDates(p, W, I[17], g.iid, [I[16], I[18]], 'p5-2')
  r(W, 'p5.2', 'B5 route: his filing opened from Fri 17, Thu 16 then Sat 18 tapped, Save', J({ ...e, pic: undefined }), e.pic)
  /* D1's route */
  await asS(p, W)
  const t = await fileIn(p, W, I[27], { type: 'Training', who: RANGER, from: '09:00', to: '10:00', title: 'Training', remarks: 'Bring kit' }, 'pd-1')
  r(W, 'pd.1', 'Saber files a Training for Ranger, Mon 27', J({ ...t, pic: undefined }), t.pic)
  const l = await fileIn(p, W, I[28], { type: 'LL', who: RANGER, span: 'all' }, 'pd-2')
  r(W, 'pd.2', 'Saber files an LL for Ranger, Tue 28', J({ ...l, pic: undefined }), l.pic)
  const c = await editIn(p, W, l.iid, I[28], () => p.selectOption('#inpEditPop #inpEditType', 'OL'), 'pd-3')
  r(W, 'pd.3', 'the LL changed to OL', J({ ...c, pic: undefined }), c.pic)
  r(W, 'pd.3n', 'Ranger\'s notices as stored (read)', J(await notes(p, RANGER)))
  /* the board's own bell */
  await L.openBoard(p, W, 5)
  const bb = await p.evaluate(() => [...document.querySelectorAll('.bellbtn')].map(e => ({ id: e.id, vis: e.getBoundingClientRect().width > 0, inBoard: !!e.closest('#schedBoard') })))
  r(W, 'pe', 'the Scheduler Board open: every bell button and whether it shows', J(bb), await W.pic(p, 'pe-board'))
  await L.closeBoard(p, W)
}))
process.exit(0)
