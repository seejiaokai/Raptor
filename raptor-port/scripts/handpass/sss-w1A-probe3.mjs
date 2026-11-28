// sss-w1A-probe3 — the board's edge scroll while a name is carried: which element scrolls, which way, how fast, when the
// name is held at the bottom edge and at the top edge. Run from raptor-port/: SSSA_RUN=probe3 SZ=d node scripts/handpass/sss-w1A-probe3.mjs
import './sss-w1A-env.mjs'
const X = await import('./sss-w1A-lib.mjs')
const { L, W5, J, run, sleep, addLine } = X
const SZ = process.env.SZ || 'd'
console.log(`VERSION sss-w1A-probe3 1 · ${SZ}`)
await run('PR3', SZ, async (p, W) => {
  const s = await addLine(p, W, 4, { kind: 'SC' })
  const o = await X.addSimRow(p, W, 4, 'oft', 'PR3 OFT')
  await L.openBoard(p, W, 4); await W5.boardDrawer(p, W, true)
  const scrollers = () => p.evaluate(() => [document.scrollingElement, ...document.querySelectorAll('#schedBoard *')].filter(e => e && e.scrollHeight > e.clientHeight + 20 && /auto|scroll/.test(getComputedStyle(e).overflowY) || e === document.scrollingElement).map(e => (e.id ? '#' + e.id : e.tagName + '.' + String(e.className).split(' ')[0]) + ':' + Math.round(e.scrollTop) + '/' + e.scrollHeight))
  const box = sel => p.locator(sel).first().boundingBox()
  W.rec('s0', 'scrollers at rest', null, J(await scrollers()))
  const sc = `#schedBoard [data-slot="4.${s.wi}.0.0.p"]:visible`, of = `#schedBoard [data-slot="s:4.oft.${o.ri}.p"]:visible`
  await p.locator(sc).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
  W.rec('s1', 'SC seat centred: boxes of SC seat and OFT seat', null, J({ sc: await box(sc), of: await box(of), sx: await scrollers() }))
  const src = p.locator(`#schedBoard .rpuck[data-person="ace"], #schedBoard .rpuck[data-person="dj"]`).first()
  const a = await src.boundingBox()
  await p.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await p.mouse.down()
  await p.mouse.move(a.x + a.width / 2 + 8, a.y + a.height / 2 + 8, { steps: 3 })
  const vp = p.viewportSize()
  await p.mouse.move(600, vp.height - 8, { steps: 12 })
  for (let t = 0; t < 30; t++) { await p.mouse.move(600 + (t % 2), vp.height - 8); await sleep(100); if (t % 5 === 0) W.rec('bottom' + t, 'held at the bottom edge', null, J({ of: await box(of), sx: await scrollers() })) }
  await W.pic(p, 'bottom')
  await p.mouse.move(600, 112, { steps: 12 })
  for (let t = 0; t < 20; t++) { await p.mouse.move(600 + (t % 2), 112); await sleep(100); if (t % 5 === 0) W.rec('top' + t, 'held near the top (y 112)', null, J({ of: await box(of), sx: await scrollers() })) }
  await p.mouse.move(vp.width / 2, 30, { steps: 8 }); await p.mouse.up()
  await W.pic(p, 'after1')
  W.rec('a1', 'after the first drag let go over the title: what moved', null, J({ sx: await scrollers(), sc: await X.holdsAt(p, `4.${s.wi}.0.0.p`) }))
  // a name carried FROM a seat: Ace placed on SC AM MAIN 1, then his seated puck carried to the bottom edge
  await X.armAt(p, W, 4, `[data-slot="4.${s.wi}.0.0.p"]`, 'pr3-ace'); await X.pickNow(p, W, 'dj', 'pr3-ace')
  W.rec('a2', 'Ace placed on SC AM MAIN 1', null, J({ placed: await X.holdsAt(p, `4.${s.wi}.0.0.p`) }))
  await L.openBoard(p, W, 4)
  await p.locator(sc).first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
  const b = await p.locator(`${sc} .puck`).first().boundingBox()
  await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await p.mouse.down()
  await p.mouse.move(b.x + b.width / 2 + 8, b.y + b.height / 2 + 8, { steps: 3 })
  for (const y of [vp.height - 8, vp.height - 30, vp.height - 60]) {
    await p.mouse.move(600, y, { steps: 10 })
    for (let t = 0; t < 15; t++) { await p.mouse.move(600 + (t % 2), y); await sleep(100) }
    W.rec('seat' + y, `seat-carried, held at y ${y}`, null, J({ of: await box(of), sx: await scrollers() }))
  }
  await W.pic(p, 'seat-bottom')
  await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 10 }); await sleep(200)
  await p.mouse.up(); await sleep(300)
  W.rec('a3', 'let go back where it started: Ace still on SC AM MAIN 1', null, J({ sc: await X.holdsAt(p, `4.${s.wi}.0.0.p`), sx: await scrollers() }))
})
process.exit(0)
