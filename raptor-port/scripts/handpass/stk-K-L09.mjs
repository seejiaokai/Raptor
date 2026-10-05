import * as K from './stk-K-lib.mjs'
const { L, W, H, p2 } = K
const size = process.env.K_SIZE || 'desk'
const phone = size === 'phone'
const { browser, p, errors } = await H.world({ who: 'a', phone })
const pid = await p.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, v]) => [k, v.cs])))
const csOf = k => pid[k]
console.log('nasty', csOf('nasty'), 'sufa', csOf('sufa'), 'dj', csOf('dj'))

const CASES = [
  { id: 'oil', testid: 'oilconf', fill: { person: csOf('dj'), type: 'Duty', iso: '2026-07-18', remarks: 'L09 weekend duty' } },
  { id: 'upchit', testid: 'upconf', fill: { person: csOf('sufa'), type: 'Upchit', iso: '2026-07-15', remarks: 'L09 upchit' } },
  { id: 'medclash', testid: 'medclash', fill: { person: csOf('sufa'), type: 'ATT B', iso: '2026-07-16', toIso: '2026-07-19', remarks: 'L09 clash' } },
  { id: 'nodoc', testid: 'docconf', fill: { person: csOf('glass'), type: 'ATT B', iso: '2026-07-21', remarks: 'L09 nodoc' } },
]
const geomOf = async (testid) => K.winGeom(p, testid)
const ONLY = (process.env.K_ONLY || '').split(',').filter(Boolean)
for (const c of CASES.filter(c => !ONLY.length || ONLY.includes(c.id))) {
  console.log('\n######', c.id)
  await K.fileOpen(p, c.fill)
  // some windows can chain (clash then doc); look for the one we want
  let open = await K.winOpen(p, c.testid)
  for (let i = 0; i < 3 && !open; i++) {
    const nd = p.locator('[data-testid="docconf-nodoc"]:visible')
    if (await nd.count()) { await nd.click(); await K.sleep(600) } else break
    open = await K.winOpen(p, c.testid)
  }
  if (!open) {
    // report which testids are on screen
    const ids = await p.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => e.offsetParent !== null || getComputedStyle(e).position === 'fixed').map(e => e.dataset.testid))
    console.log('wanted window not open; on screen:', ids)
    K.note('L-09', c.id, 'filed ' + JSON.stringify(c.fill), 'window did not open; testids on screen: ' + ids.join(','), 'NOT WALKED (window did not open)')
    await p.keyboard.press('Escape'); await K.sleep(400)
    continue
  }
  const g = await geomOf(c.testid)
  console.log('geom', JSON.stringify(g))
  const pic0 = await K.pic(p, `L09${process.env.K_RUN||""}-${size}-${c.id}-open`)
  // (a) press on text inside the window, drag past its edge, release on the surround
  const hx = g.head[0] + g.head[2] / 2 > g.box[0] + g.box[2] - 10 ? g.head[0] + 20 : g.head[0] + 30
  const hy = g.head[1] + g.head[3] / 2
  // a release point on the surround, outside the box
  const rx = g.box[0] > 40 ? g.box[0] / 2 : (g.box[0] + g.box[2] + (g.surround[2] - g.box[0] - g.box[2]) / 2)
  const ry = g.box[1] > 40 ? g.box[1] / 2 : g.box[1] + g.box[3] / 2
  const hit = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.className || e.tagName) : null }, [rx, ry])
  console.log('press', hx, hy, 'release', rx, ry, 'surround hit class:', hit)
  await p.mouse.move(hx, hy)
  await p.mouse.down()
  await p.mouse.move((hx + rx) / 2, (hy + ry) / 2, { steps: 8 })
  await p.mouse.move(rx, ry, { steps: 8 })
  await p.mouse.up()
  await K.sleep(500)
  const afterDrag = await K.winOpen(p, c.testid)
  const pic1 = await K.pic(p, `L09${process.env.K_RUN||""}-${size}-${c.id}-afterdrag`)
  console.log('after drag out: open =', afterDrag)
  let afterClick = null, pic2 = null
  if (afterDrag) {
    // (b) plain click on the surround
    await p.mouse.click(rx, ry)
    await K.sleep(500)
    afterClick = await K.winOpen(p, c.testid)
    pic2 = await K.pic(p, `L09${process.env.K_RUN||""}-${size}-${c.id}-afterclick`)
    console.log('after plain click on surround: open =', afterClick)
  }
  // what is left on screen / any record written
  const n = await p.evaluate(() => window.INPUTS.length)
  K.note('L-09', `${c.id}-${size}`, `Inputs form: ${JSON.stringify(c.fill)}; pressed at (${Math.round(hx)},${Math.round(hy)}) on header text "${g.headText}", dragged to surround (${Math.round(rx)},${Math.round(ry)}), released`,
    `window "${g.headText}"; box ${JSON.stringify(g.box)}; after drag-out window ${afterDrag ? 'STILL OPEN' : 'CLOSED'}; ` + (afterDrag ? `then plain click on surround: window ${afterClick ? 'STILL OPEN' : 'CLOSED'}` : '(plain click not tried - already closed)') + `; INPUTS now ${n}`,
    afterDrag ? 'PASS(drag)' : 'FAIL(drag)', [pic0, pic1, pic2].filter(Boolean))
  // clean up: cancel whatever is open without writing
  for (let i = 0; i < 3; i++) { if (await K.winOpen(p, c.testid)) { await p.keyboard.press('Escape'); await K.sleep(400) } }
  // if the editor stays open on the form, nothing written
}
K.flush()
await browser.close()
console.log('errors', K.errList(errors))
