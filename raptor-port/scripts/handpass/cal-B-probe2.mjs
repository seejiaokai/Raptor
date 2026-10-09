import * as B from './cal-B-lib.mjs'
const w = await B.world(process.argv[2] || 'desk')
const p = w.page
const info = async () => p.evaluate(() => {
  const e = document.querySelector('[data-testid="cell-slipway-2026-01-06"]'); const wrap = document.querySelector('.mx-wrap')
  const r = e ? e.getBoundingClientRect() : null
  return { cell: r && { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) }, wrapScroll: wrap && [wrap.scrollLeft, wrap.scrollWidth, wrap.clientWidth], pageScroll: [scrollX, scrollY], wrapCls: wrap && wrap.className }
})
console.log('start', JSON.stringify(await info()))
await p.evaluate(() => document.querySelector('[data-testid="cell-slipway-2026-01-06"]').scrollIntoView({ block: 'center', inline: 'center' }))
await B.sleep(400)
console.log('after scrollIntoView', JSON.stringify(await info()))
await B.press(w, B.tid(w, 'month-JAN')); await B.sleep(700)
console.log('after JAN button', JSON.stringify(await info()))
await B.pic(p, 'probe-' + w.key + '-2')
await B.close(w)
