// a real drag with the mouse: down, small move, move in steps, pause, up. `to` is a locator or {x,y}.
export async function drag(p, fromLoc, to, { steps = 14, wait = 150, nudge = 0 } = {}) {
  await fromLoc.waitFor({ state: 'visible', timeout: 10000 })
  if (to.x == null) await to.scrollIntoViewIfNeeded().catch(() => {})
  const vh = p.viewportSize().height
  let fb = await fromLoc.boundingBox()
  if (!fb || fb.y < 0 || fb.y + fb.height > vh) { await fromLoc.scrollIntoViewIfNeeded().catch(() => {}); fb = await fromLoc.boundingBox() }
  if (!fb) throw new Error('drag: no box for source')
  const fx = fb.x + fb.width / 2, fy = fb.y + fb.height / 2
  const target = async () => { if (to.x != null) return { x: to.x, y: to.y }; const tb = await to.boundingBox(); if (!tb) throw new Error('drag: no box for target'); return { x: tb.x + tb.width / 2 + nudge, y: tb.y + tb.height / 2 } }
  await p.mouse.move(fx, fy); await p.mouse.down()
  await p.mouse.move(fx + 6, fy + 6, { steps: 3 })
  const t = await target()
  const info = { from: { x: Math.round(fx), y: Math.round(fy) }, to: { x: Math.round(t.x), y: Math.round(t.y) } }
  await p.mouse.move(t.x, t.y, { steps })
  await p.waitForTimeout(wait)
  await p.mouse.move(t.x + 1, t.y + 1)
  await p.waitForTimeout(wait)
  await p.mouse.up()
  await p.waitForTimeout(600)
  return info
}
