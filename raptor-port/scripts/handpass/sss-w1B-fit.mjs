// sss-w1B-fit — at the phone's 402 width, every printed reason line in the SANS Avail list stays inside its panel: the
// untimed OFT's seat and extra place on the Scheduler Board, the week's OFT row on Edit Schedule, a flying SC seat
// (chat 182, walker B). Run: SZ=p SSSB_RUN=run1/fit node scripts/handpass/sss-w1B-fit.mjs
import './sss-w1B-env.mjs'
const Z = await import('./sss-w1B-lib.mjs')
const { T, L, W5, A, Y, J, RANGER, IPMAN, WK1, armAt, armEAt, setBox, disarm, place, idOf, listOf } = Z
const SZ = process.env.SZ || 'p'
console.log('VERSION sss-w1B-fit 1 · size', SZ)
const fit = (W, id, what, l, pic) => {
  const rows = (l && l.sans) || []
  const printed = rows.filter(x => x.printed)
  W.rec(id, what, printed.length > 0 && printed.every(x => x.inside), `${printed.length} printed reason line(s) of ${rows.length} names · panel ${l && l.panel} · outside: ${printed.filter(x => !x.inside).map(x => `${x.cs} ${x.rw}`).join(', ') || 'none'} · Ranger's "${(printed.find(x => x.id === RANGER) || {}).printed || '-'}" at ${(printed.find(x => x.id === RANGER) || {}).rw || '-'}`, pic)
}
await T.run('fit', SZ, Y.scene(async (p, W) => {
  await Y.postR(p, W, 'fit.post')
  const o = await W5.addSim(p, W, 5, 'oft', 'B OFT', '', '')
  const sc = (await A.addLine(p, W, 5, { kind: 'SC' })).wi
  await setBox(p, W, 5, `[data-bfld="ff:5.${sc}.0.br"]`, '06:30')
  let r = await armAt(p, W, 5, `[data-slot="s:5.oft.${o.ri}.p"]`, 'fit-oftp')
  fit(W, 'fit.oftp', 'Board, untimed OFT front seat armed: every printed reason inside the SANS Avail list', r.ls[RANGER], r.pic)
  await disarm(p, W)
  /* the week's row while it is empty (run1/fit try 1: with both seats taken the tap on the week's row picked nothing) */
  await L.closeBoard(p, W)
  const e = await armEAt(p, W, WK1, `[data-fill="s:5.oft.${o.ri}.+"]`, 'fit-e')
  fit(W, 'fit.e', `Edit Schedule, the week's OFT row picked (${e.armed}): every printed reason inside the crew panel`, e.ls[RANGER], e.pic)
  const ace = await idOf(p, 'Ace'), bas = await idOf(p, 'Basher')
  await place(p, W, 5, `[data-slot="s:5.oft.${o.ri}.p"]`, 'fit-a', ace); await place(p, W, 5, `[data-slot="s:5.oft.${o.ri}.w"]`, 'fit-b', bas)
  r = await armAt(p, W, 5, `[data-slot="s:5.oft.${o.ri}.x0"]`, 'fit-oftx')
  fit(W, 'fit.oftx', `Board, the OFT's extra place armed (${r.via}): every printed reason inside`, r.ls[RANGER], r.pic)
  await disarm(p, W)
  r = await armAt(p, W, 5, `[data-slot="5.${sc}.0.0.p"]`, 'fit-sc')
  const plainRanger = r.ls[RANGER] && r.ls[RANGER].me.length && !Z.sansWords(r.ls[RANGER]).length
  W.rec('fit.sc', 'Board, flying SC AM MAIN FCP armed: Ranger plain (no line to fit) — the panel read', !!plainRanger, `${Y.meSay(r.ls[RANGER])} · ${(r.ls[RANGER].sans || []).filter(x => x.printed).length} printed lines`, r.pic)
  await disarm(p, W)
}))
