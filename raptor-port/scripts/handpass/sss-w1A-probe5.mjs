// sss-w1A-probe5 — a sim row with both seats full: what its "+" place draws (children, ".addz", boxes) at this size, and
// whether a tap on the drawn "+" arms it. Run from raptor-port/: SSSA_RUN=probe5 SZ=p node scripts/handpass/sss-w1A-probe5.mjs
import './sss-w1A-env.mjs'
const X = await import('./sss-w1A-lib.mjs')
const { L, W5, J, run, sleep } = X
const SZ = process.env.SZ || 'p'
console.log(`VERSION sss-w1A-probe5 1 · ${SZ}`)
await run('PR5', SZ, async (p, W) => {
  const o = await X.addSimRow(p, W, 4, 'oft', 'PR5 OFT')
  for (const [s, id] of [['p', 'dj'], ['w', 'prowler']]) { await X.armAt(p, W, 4, `[data-slot="s:4.oft.${o.ri}.${s}"]`, 'pr5-' + s); await X.pickNow(p, W, id, 'pr5-' + s); await W5.boardDrawer(p, W, false) }
  await L.openBoard(p, W, 4)
  const d = await p.evaluate(ri => { const z = document.querySelector(`#schedBoard [data-fill="s:4.oft.${ri}.+"]`); if (!z) return 'no zone'; const r = e => { const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)] }; return { zone: r(z), kids: [...z.querySelectorAll('*')].map(e => String(e.className).slice(0, 40) + '|' + (e.dataset.slot || e.dataset.fill || '') + '|' + (e.children.length ? '' : (e.textContent || '').trim().slice(0, 10)) + '|' + r(e).join(',')) } }, o.ri)
  W.rec('dom', 'the "+" place with both seats full', null, J(d))
  const state = () => p.evaluate(() => ({ armed: (window.ARM && window.ARM.key) || null, rings: [...document.querySelectorAll('#schedBoard .oktake')].filter(e => e.getBoundingClientRect().width > 0).length, picked: [...document.querySelectorAll('#schedBoard .puck')].filter(e => e.getBoundingClientRect().width > 0 && /sel|pick|chosen|on\b/.test(String(e.className))).map(e => String(e.className) + ':' + (e.textContent || '').trim()).slice(0, 4), sel: JSON.stringify(window.SEL || window.SELECTED || window.PICK || null) }))
  W.rec('before', 'before any tap on the extras', null, J(await state()), await W.pic(p, 'pr5-before'))
  const x0 = p.locator(`#schedBoard [data-slot="s:4.oft.${o.ri}.x0"]`).first()
  await x0.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(400)
  const hit = await x0.evaluate(e => { const b = e.getBoundingClientRect(); const at = (dx, dy) => { const t = document.elementFromPoint(b.left + b.width * dx, b.top + b.height * dy); return t ? String(t.className).slice(0, 30) + '|' + (t.dataset.slot || (t.closest('[data-slot]') || {}).dataset?.slot || '') : 'none' }; return { box: [b.left, b.top, b.width, b.height].map(Math.round), mid: at(0.5, 0.5), top: at(0.5, 0.1), bottom: at(0.5, 0.9) } })
  W.rec('hit', 'what is under the extra place x0 (its top, middle, bottom)', null, J(hit))
  /* a tap at x0's own bottom edge, by the page's coordinates (pressing the box's lowest point a finger would) */
  const bb = await x0.boundingBox()
  await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height - 2); await sleep(500)
  W.rec('tap-bottom', 'a tap at the bottom of x0', null, J(await state()), await W.pic(p, 'pr5-tapbottom'))
  await X.disarm(p, W); await p.touchscreen.tap(5, 300).catch(() => {}); await sleep(300)
  const r = await X.armAt(p, W, 4, `[data-slot="s:4.oft.${o.ri}.x0"]`, 'pr5-x0')
  W.rec('arm-x0', 'the extra place x0 tapped by its own key', null, J({ armed: r.armed, retry: r.retry, after: await state() }), await W.pic(p, 'pr5-arm-x0'))
  await X.disarm(p, W)
  const r2 = await X.armAt(p, W, 4, `[data-fill="s:4.oft.${o.ri}.+"]`, 'pr5-x')
  W.rec('arm', 'armed by the drawn "+"', null, J({ armed: r2.armed, retry: r2.retry, after: await state() }), await W.pic(p, 'pr5-arm'))
})
process.exit(0)
