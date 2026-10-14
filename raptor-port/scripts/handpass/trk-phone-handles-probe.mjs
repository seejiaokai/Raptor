/* A probe, 15 Oct 26 (the night's walk of D899): on a phone, does an arrow's orange end or its bend square follow a
   finger at all in ✎ Edit lines — away from any edge? Run against any build (the old code too, to tell an older fault
   from the night's change). usage: DL_BASE=http://localhost:4173 DL_SHOTS=<dir> node scripts/handpass/trk-phone-handles-probe.mjs */
import * as L from './dl-lib.mjs'

const w = await L.world('phone')
const p = w.page
try {
  await L.go(w, 'tracker'); await p.waitForSelector('#flowSvg .ball', { timeout: 30000 }); await L.sleep(800)
  await p.locator('[title^="Edit the syllabus"]').first().tap(); await L.sleep(300)
  await w.press('#arrangeBtn'); await p.waitForSelector('#viewport'); await L.sleep(700)
  await p.locator('button:visible', { hasText: /Edit lines$/ }).first().tap(); await L.sleep(400)
  const ar = await p.evaluate(() => {
    const box = document.getElementById('board').getBoundingClientRect()
    for (const e of document.querySelectorAll('#flowSvg .edgehit')) {
      const Ln = e.getTotalLength(); if (Ln < 60) continue
      const q = e.getPointAtLength(Ln / 2), m = e.getScreenCTM(); if (!m) continue
      const x = m.a * q.x + m.c * q.y + m.e, y = m.b * q.x + m.d * q.y + m.f
      if (x > box.left + 80 && x < Math.min(box.right, innerWidth) - 80 && y > box.top + 60 && y < Math.min(box.bottom, innerHeight) - 80) return { x, y }
    }
    return null
  })
  await p.touchscreen.tap(ar.x, ar.y); await L.sleep(500)
  const cdp = await w.ctx.newCDPSession(p)
  const t = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] })
  for (const sel of ['#flowSvg .endhandle[data-end="to"]', '#flowSvg .linehandle']) {
    const c = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, ta: getComputedStyle(e).touchAction } }, sel)
    if (!c) { console.log(sel, 'not drawn'); continue }
    let cancelled = false
    await p.evaluate(() => { window.__pc = 0; window.addEventListener('pointercancel', () => { window.__pc++ }, { once: false }) })
    await t('touchStart', c.x, c.y); await L.sleep(60)
    for (let i = 1; i <= 10; i++) { await t('touchMove', c.x - i * 6, c.y - i * 4); await L.sleep(25) }
    await L.sleep(300)
    const n = await p.evaluate(s => { const e = document.querySelector(s); const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, pc: window.__pc } }, sel)
    cancelled = n.pc > 0
    console.log(`${sel}: from ${Math.round(c.x)},${Math.round(c.y)} (touch-action ${c.ta}); finger to ${Math.round(c.x - 60)},${Math.round(c.y - 40)}; handle now ${Math.round(n.x)},${Math.round(n.y)}; pointercancel ${cancelled}`)
    await t('touchEnd'); await L.sleep(400)
    await p.keyboard.press('Control+z'); await L.sleep(400)
  }
} finally { await L.close(w) }
