/* W4 probe 5 (30 Sep 26) — read-only: why a Leave War box reads "covered" after lwOpen. */
process.env.HP_URL ||= 'http://localhost:4204'
process.env.HP_SHOTS ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-30-dbrA/W4'
process.env.HP_OUT ||= 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/parts/dbrA-W4-probe.json'
const W = await import('./dbrA-W4-lib.mjs')
const { L, A } = W
const b = await L.launch(); const ctx = await L.context(b); const errors = []; const p = await L.page(ctx, errors)
await L.signIn(p, 'a')
await L.go(p, 'admin')
await W.lwOpen(p, '2026-02-10')
const c = p.locator('[data-testid="cell-dice-2026-02-10"]').first()
console.log('count', await c.count())
await c.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
await L.sleep(300)
console.log(JSON.stringify(await c.evaluate(e => { const r = e.getBoundingClientRect(); const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { r: [r.left, r.top, r.width, r.height], vw: innerWidth, vh: innerHeight, h: h ? h.tagName + '.' + h.className : null, sy: scrollY, st: document.scrollingElement.scrollTop } })))
await L.shot(p, '_probe5-lw')
await b.close()
