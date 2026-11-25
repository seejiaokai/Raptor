// sss-w1B-probe4 — the phone's sim extra place ("+", instructor / observer) pressed three ways: what lies at its middle,
// and whether each press picks it (chat 182, walker B). Run: SZ=p SSSB_RUN=probe4 node scripts/handpass/sss-w1B-probe4.mjs
import './sss-w1B-env.mjs'
const Z = await import('./sss-w1B-lib.mjs')
const { T, L, W5, Y, J, sleep, place, idOf, OUT, path } = Z
const SZ = process.env.SZ || 'p'
/* 'pc': the same phone size and touch in Chromium, to tell an engine's touch from the app */
L.SIZES.pc = { name: 'phonechromium', eng: L.SIZES.d.eng, launch: L.SIZES.d.launch, opts: { ...L.SIZES.p.opts } }
console.log('VERSION sss-w1B-probe4 1 · size', SZ)
await T.run('p4', SZ, Y.scene(async (p, W) => {
  const m = await W5.addSim(p, W, 6, 'amt', 'B AMT', '', '')
  const ace = await idOf(p, 'Ace'), bas = await idOf(p, 'Basher')
  await place(p, W, 6, `[data-slot="s:6.amt.${m.ri}.p"]`, 'p4-a', ace); await place(p, W, 6, `[data-slot="s:6.amt.${m.ri}.w"]`, 'p4-b', bas)
  await L.openBoard(p, W, 6)
  await Y.disarm(p, W)
  const sel = `#schedBoard [data-slot="s:6.amt.${m.ri}.x0"]`
  const x = p.locator(sel).first()
  await x.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(400)
  const tries = [
    ['locator.tap', async () => x.tap()],
    ['touchscreen.tap at its middle', async () => { const b = await x.boundingBox(); await p.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2) }],
    ['element.click()', async () => x.evaluate(e => e.click())],
  ]
  for (const [nm, fn] of tries) {
    await Y.disarm(p, W)
    const b = await x.boundingBox()
    const top = await p.evaluate(([cx, cy]) => { const t = document.elementFromPoint(cx, cy); return t ? t.tagName + '.' + t.className + ' ' + JSON.stringify(t.dataset) : 'none' }, [b.x + b.width / 2, b.y + b.height / 2])
    await fn(); await sleep(600)
    const armed = await p.evaluate(() => window.ARM && window.ARM.key)
    const cls = await x.getAttribute('class').catch(() => '?')
    W.rec('try-' + nm, 'the extra place pressed by ' + nm, 'REC', `box ${J(b)} · at its middle: ${top} · ARM ${armed} · its class now "${cls}"`, await W.pic(p, 'p4-' + nm.replace(/\W+/g, '')))
  }
  /* the same three on the desktop-only route's sibling: an empty sim seat, as a control */
}))
