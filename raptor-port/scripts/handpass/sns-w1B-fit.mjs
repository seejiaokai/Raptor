// sns-w1B-fit — walker B: at 402 wide (phone), every reason line under a struck SANS name stays inside its crew panel —
// the Scheduler Board's drawer and Edit Schedule's crew panel, a blank Sat 18 flight's FCP and RCP picked (brief: measure it).
import './sns-w1B-env.mjs'
const Y = await import('./sns-w1B-lib.mjs')
const { T, L, WK1, J, postR, blank, armB, disarm, armE, disarmE, listOf, listSay } = Y
const SZ = process.env.SZ || 'p'
await T.run('fit', SZ, async (p, W) => {
  await postR(p, W, 'fit.post')
  const a = await blank(p, W, 5, 'fit.line')
  for (const key of [a.fcp, a.rcp]) {
    const b = await armB(p, W, 5, key, 'fit-b-' + key.slice(-1))
    const rows = (b.l && b.l.sans) || []
    const printed = rows.filter(r => r.printed)
    W.rec('fit.b-' + key.slice(-1), `board drawer, ${key} picked: ${printed.length} reason line(s) printed, each inside the panel (${b.l && b.l.panel})`, printed.length > 0 && printed.every(r => r.inside), printed.map(r => `${r.cs} [${r.rw}] ${r.inside ? 'in' : 'OUT'}`).join(' · '), b.pic)
    await disarm(p, W)
    await L.closeBoard(p, W)
    const e = await armE(p, W, WK1, key, 'fit-e-' + key.slice(-1))
    const er = ((e.l && e.l.sans) || []).filter(r => r.printed)
    W.rec('fit.e-' + key.slice(-1), `Edit Schedule crew panel, ${key} picked: ${er.length} reason line(s) printed, each inside the panel (${e.l && e.l.panel})`, er.length > 0 && er.every(r => r.inside), er.map(r => `${r.cs} [${r.rw}] ${r.inside ? 'in' : 'OUT'}`).join(' · '), e.pic)
    await disarmE(p, W)
  }
})
