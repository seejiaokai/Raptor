// sns-w1A-probe — walker A's routes proved on this build before any scenario relies on them. Run from raptor-port/:
//   SNSA_RUN=probe SZ=d node scripts/handpass/sns-w1A-probe.mjs
import './sns-w1A-env.mjs'
const A = await import('./sns-w1A-lib.mjs')
const { T, L, RANGER, IPMAN, D, post, sleep, J, addLine, boardArm, boardPick, crewAll, say1, sayAll, weekArm, weekPick, mouseDrag, fingerDrag, crewPics, disarm } = A
console.log('VERSION sns-w1A-probe 1 · bundle served on', process.env.W2_URL, '· out', A.OUT)
const SZ = process.env.SZ || 'd'
await T.run('probe', SZ, async (p, W) => {
  const idx = await p.evaluate(() => [...document.scripts].map(s => s.src).join(' '))
  W.rec('bundle', 'the page loads index-DmZtA8E3.js', /index-DmZtA8E3\.js/.test(idx), idx)
  await post(p, W, RANGER, D[17], 'p.post')
  const a = await addLine(p, W, 5, { cs: 'SNSA' })
  W.rec('line', 'Sat 18 + Wave → Flying wave, no times', a.wi >= 0 ? 'REC' : false, J(a))
  const key = `5.${a.wi}.0.0.p`
  const r = await boardArm(p, W, 5, key, 'arm')
  W.rec('arm', 'board armed FCP: Ranger / Ipman', 'REC', `armed ${r.armed} · ${sayAll(r.c)} · Ranger ${say1(r.c, RANGER)} · Ipman ${say1(r.c, IPMAN)}`, await crewPics(p, W, '#schedBoard', RANGER, 'arm'))
  W.rec('arm.all', 'every puck', 'REC', J(r.c.pucks.map(x => x.id + ':' + x.where + (x.struck ? ':x' : '') + (x.printed ? ':"' + x.printed + '"' : ''))))
  const pk = await boardPick(p, W, key, RANGER, 'pick')
  W.rec('pick', 'Ranger picked: note and seat', 'REC', `note "${pk.note}" · seat holds "${pk.placed}"`, pk.notePic)
  await A.W5.boardDrawer(p, W, false)
  const un = await crewAll(p, '#schedBoard')
  W.rec('unarmed', 'board crew list, nothing armed', 'REC', `${sayAll(un)} · Ranger ${say1(un, RANGER)} · Ipman ${say1(un, IPMAN)}`, await W.pic(p, 'unarmed'))
  // a second line, armed from the week
  const b = await addLine(p, W, 5, { cs: 'SNSB' })
  const k2 = `5.${b.wi}.0.0.p`
  const wr = await weekArm(p, W, k2, 'warm')
  W.rec('warm', 'week seat pressed: crew panel', 'REC', `armed ${wr.armed} · ${wr.why || ''} ${sayAll(wr.c)} · Ranger ${say1(wr.c, RANGER)} · Ipman ${say1(wr.c, IPMAN)}`, await crewPics(p, W, '.ros-body', IPMAN, 'warm'))
  if (wr.armed) { await disarm(p, W) }
  // drag Ipman onto the second line's seat on the board
  await L.openBoard(p, W, 5)
  await A.W5.boardDrawer(p, W, true)
  const src = p.locator(`#schedBoard .rpuck[data-person="${IPMAN}"]:visible`).first()
  const dst = p.locator(`#schedBoard [data-slot="${k2}"]:visible`).first()
  const d = SZ === 'pc' ? await fingerDrag(p, src, dst, 'drag', W) : await mouseDrag(p, src, dst, 'drag', W)
  W.rec('drag', 'Ipman dragged onto the second blank seat', 'REC', `${J(d.hover)} · note "${d.note}" · seat "${await A.seatHolds(p, k2)}"`, [d.hpic, d.npic].join(', '))
})
A.saveRaw('probe-' + SZ)
process.exit(0)
