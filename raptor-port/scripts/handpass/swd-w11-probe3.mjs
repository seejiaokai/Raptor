// swd-w11-probe3 — the S5 lead checked before it is written up: ticked SANS today AND posted SANS from Fri 17, is Thu 16 a SANS
// day for him (can he file it), and does his reminder name it? window.* only read.
process.env.W11_RUN ||= 'probe3'
await import('./swd-w11-env.mjs')
const K = await import('./swd-w11-lib.mjs')
const { T, L, RANGER, D, WK2 } = K
console.log('VERSION swd-w11-probe3 1')
const SZ = process.env.SZ || 'd'
await T.run('probe3', SZ, K.scene(async (p, W) => {
  await K.tick(p, W, true, 'p.f1')
  console.log('after tick', L.J(await T.rec(p, RANGER)))
  await L.sansGroup(p, W, true, 'p-grp')
  const r = await L.postOut(p, W, RANGER, D[17], 'p.f2'); await T.closeAll(p, W)
  console.log('posted', r.line, 'record', L.J(r.after), L.J(await T.rec(p, RANGER)))
  await K.planRow(p, W, WK2, 0, 'p.f3')
  await K.asR(p, W)
  const b = await K.bell(p, W, 'p-bell')
  console.log('bell', K.sayB(b))
  for (const iso of [D[15], D[16], D[17]]) {
    const r = await T.sansRead(p, W, iso, 'p-day-' + iso.slice(8))
    console.log(iso, '+ Commitment', r.day && r.day.add, '"' + (r.day && r.day.addwhy) + '"', T.cellLine(r.cell))
  }
  const f = await T.file(p, W, D[16], null, ['fly'], null, 'p-file16')
  console.log('file Thu 16:', f.iid ? 'saved ' + L.J(f.made) : 'refused ' + f.refused)
  await T.closeAll(p, W)
  await K.asS(p, W)
  await K.tick(p, W, false, 'p.f4')
  console.log('after untick', L.J(await T.rec(p, RANGER)))
  await K.asR(p, W)
  console.log('bell after untick', K.sayB(await K.bell(p, W, 'p-bell2')))
}))
process.exit(0)
