// sns-w1A-probe2 — the drop's note: what notes a pick raises (timed control, a blank line's first seat, its second seat),
// and the week's seat route at this size. Run from raptor-port/:  SNSA_RUN=probe2 SZ=d|p node scripts/handpass/sns-w1A-probe2.mjs
import './sns-w1A-env.mjs'
const A = await import('./sns-w1A-lib.mjs')
const { T, L, RANGER, IPMAN, D, post, J, addLine, boardArm, boardPick, say1, sayAll, weekArm, weekPick, crewPics, disarm, noteWatch, notesSeen } = A
console.log('VERSION sns-w1A-probe2 1 · bundle served on', process.env.W2_URL, '· out', A.OUT)
const SZ = process.env.SZ || 'd'
await T.run('probe2', SZ, async (p, W) => {
  await post(p, W, RANGER, D[17], 'p.post')
  const t = await addLine(p, W, 5, { cs: 'SNST', to: '13:00', ld: '14:00' })
  const b = await addLine(p, W, 5, { cs: 'SNSB' })
  W.rec('lines', 'Sat 18: a timed line and a blank line', 'REC', J({ t, b }))
  await noteWatch(p)
  const kt = `5.${t.wi}.0.0.p`
  let r = await boardArm(p, W, 5, kt, 'ct')
  W.rec('ct.arm', 'CONTROL timed line FCP armed', 'REC', `${r.armed} · ${sayAll(r.c)} · Ranger ${say1(r.c, RANGER)}`, await crewPics(p, W, '#schedBoard', RANGER, 'ct-arm'))
  let pk = await boardPick(p, W, kt, RANGER, 'ct')
  W.rec('ct.pick', 'CONTROL Ranger picked onto the timed line', 'REC', `note now "${pk.note}" · notes seen ${J(await notesSeen(p))} · seat "${pk.placed}"`, pk.notePic)
  await noteWatch(p)
  const kb = `5.${b.wi}.0.0.p`
  r = await boardArm(p, W, 5, kb, 'bf')
  W.rec('bf.arm', 'blank line FCP armed', 'REC', `${r.armed} · ${sayAll(r.c)} · Ranger ${say1(r.c, RANGER)} · Jester ${say1(r.c, IPMAN)}`, await crewPics(p, W, '#schedBoard', IPMAN, 'bf-arm'))
  pk = await boardPick(p, W, kb, IPMAN, 'bf')
  W.rec('bf.pick', 'Jester picked onto the blank line FCP (first man on it)', 'REC', `note now "${pk.note}" · notes seen ${J(await notesSeen(p))} · seat "${pk.placed}"`, pk.notePic)
  await noteWatch(p)
  const kr = `5.${b.wi}.0.0.w`
  r = await boardArm(p, W, 5, kr, 'br')
  W.rec('br.arm', 'blank line RCP armed', 'REC', `${r.armed} · ${sayAll(r.c)} · Ranger ${say1(r.c, RANGER)}`, await crewPics(p, W, '#schedBoard', RANGER, 'br-arm'))
  pk = await boardPick(p, W, kr, RANGER, 'br')
  W.rec('br.pick', 'Ranger picked onto the blank line RCP (its no-times warning already up)', 'REC', `note now "${pk.note}" · notes seen ${J(await notesSeen(p))} · seat "${pk.placed}"`, pk.notePic)
  // week route
  const c = await addLine(p, W, 5, { cs: 'SNSC' })
  const kc = `5.${c.wi}.0.0.p`
  await L.closeBoard(p, W)
  const wr = await weekArm(p, W, kc, 'wk')
  W.rec('wk.arm', 'Edit Schedule week: a third blank line FCP pressed', 'REC', `armed ${wr.armed} ${wr.why || ''} · ${sayAll(wr.c)} · Ranger ${say1(wr.c, RANGER)}`, await crewPics(p, W, '.ros-body', RANGER, 'wk-arm'))
})
A.saveRaw('probe2-' + SZ)
process.exit(0)
