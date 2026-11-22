/* msq-j2-w3-probe6 v1 — W3 probe: the Tracker's event pop-up as ad9 (phone) */
process.env.MSQ_WHO = 'w3'
process.env.MSQ_RUN = process.env.MSQ_RUN || 'probe6'
const H = await (await import('./msq-j2-w3-h.mjs')).mk()
const { X, say, sleep } = H
say('msq-j2-w3-probe6 v1')
const w = await X.open({ phone: true, user: 'ad9' })
const { page } = w
await X.L.go(page, 'tracker'); await sleep(2500)
const pt = await page.evaluate(() => {
  const els = [...document.querySelectorAll('#page-tracker *')].filter(e => e.children.length <= 2 && /^ACG-01$/.test(e.textContent.trim()) && e.getBoundingClientRect().width > 2)
  return els.map(e => { const r = e.getBoundingClientRect(); return { tag: e.tagName, cls: String(e.className.baseVal ?? e.className).slice(0, 30), x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) } })
})
say('ACG-01 candidates', JSON.stringify(pt))
const p = pt[0]
await page.touchscreen.tap(p.x, p.y); await sleep(1200)
await X.pic(w, 'p6-01-popup')
say('POPUP:\n' + await H.vis(page, 'body button:not(#burger), body input, body select, body textarea'))
await X.fin(w)
