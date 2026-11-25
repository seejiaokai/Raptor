// sns-w1B-probe2 — prove the routes on this build: post, blank line Sat 18, arm on the board and on the week, pick, note.
import './sns-w1B-env.mjs'
const Y = await import('./sns-w1B-lib.mjs')
const { T, L, RANGER, IPMAN, WK1, J, postR, blank, armB, pickB, disarm, armE, pickE, disarmE, listE, meSay, listSay } = Y
await T.run('probe2', process.env.SZ || 'd', async (p, W) => {
  await postR(p, W)
  const a = await blank(p, W, 5, 'f')
  const b = await armB(p, W, 5, a.fcp, 'b1')
  W.rec('b1', 'board armed', 'REC', `armed ${b.armed} · Ranger ${meSay(b.l)} · ${listSay(b.l)} · panel ${b.l && b.l.panel}`, b.pic)
  const j = await Y.listOf(p, '#schedBoard', IPMAN)
  W.rec('b1j', 'board armed: Jester', 'REC', meSay(j))
  await disarm(p, W)
  await L.closeBoard(p, W)
  const e = await armE(p, W, WK1, a.fcp, 'e1')
  W.rec('e1', 'week armed', 'REC', `armed ${e.armed} · day ${e.day} · Ranger ${meSay(e.l)} · ${listSay(e.l)} · panel ${e.l && e.l.panel}`, e.pic)
  const k = await pickE(p, W, a.fcp, 'e1')
  W.rec('e1p', 'week pick', 'REC', `placed ${k.placed} · note "${k.toast}"`, k.pic)
  await disarmE(p, W)
  const u = await listE(p, W, WK1, 'sat', 'e2')
  W.rec('e2', 'week unpicked Sat', 'REC', `day ${u.day} · ${meSay(u.l)} · ${listSay(u.l)}`, u.pic)
})
