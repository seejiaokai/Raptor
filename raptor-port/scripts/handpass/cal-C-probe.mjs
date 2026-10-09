import { world, toInputs, tid, press, pic, sleep, closeAll, rec } from './cal-C-lib.mjs'
for (const sz of ['desk', 'wide']) {
  const { page } = await world(sz)
  await toInputs(page)
  const m = async tag => console.log(sz, tag, await page.evaluate(() => { const r = e => { if (!e) return null; const b = e.getBoundingClientRect(); return Math.round(b.right) }; const g = document.querySelector('#inGear'), l = document.querySelector('[data-testid="ib-legend"]'); return { vw: innerWidth, docW: document.documentElement.scrollWidth, gearRight: r(g), legendRight: r(l), bodyScrollX: scrollX } }))
  await m('inputs-month')
  await pic(page, sz + '-edge-inputs-month')
  await press(sz, page.locator('#inSansMode')); await tid(page, 'sanscal').waitFor(); await sleep(400)
  console.log(sz, 'sans', await page.evaluate(() => { const r = e => e ? Math.round(e.getBoundingClientRect().right) : null; return { vw: innerWidth, docW: document.documentElement.scrollWidth, gearRight: r(document.querySelector('[data-testid="sc-gear"]')), legendRight: r(document.querySelector('[data-testid="sc-legend"]')) } }))
  await pic(page, sz + '-edge-sans-month')
  await closeAll()
}
