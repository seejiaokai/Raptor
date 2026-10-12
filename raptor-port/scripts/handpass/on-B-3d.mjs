import { world, done, log, rec, sleep, SAT_DI } from './on-B-lib.mjs'
const w = await world('p844')
const { page, tid, press } = w
const iid = await w.usualSat()
const rangerPuck = page.locator(`#sbBoard [data-slot="g:${SAT_DI}.0"] .puck`).first()
await rangerPuck.evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(400)
const info = await page.evaluate(sd => {
  const seat = document.querySelector(`#sbBoard [data-slot="g:${sd}.0"]`); const ppl = seat.closest('.ppl, [data-fill]')
  const r = seat.getBoundingClientRect(), p = seat.querySelector('.puck').getBoundingClientRect(), q = ppl.getBoundingClientRect()
  return { seat: [r.x, r.y, r.width, r.height], puck: [p.x, p.y, p.width, p.height], ppl: [q.x, q.y, q.width, q.height], cls: seat.className, pcls: ppl.className }
}, SAT_DI)
log('geom', info)
const armed = () => page.evaluate(() => ({ rosArm: !!document.querySelector('.ros-arm'), armTxt: (document.querySelector('.ros-arm')?.innerText || '').replace(/\s+/g, ' ').slice(0, 80), drawer: [...document.querySelectorAll('#sbRoster')].some(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.left < innerWidth - 20 }) }))
const tx = info.ppl[0] + 125, ty = info.ppl[1] + info.ppl[3] / 2
await page.touchscreen.tap(tx, ty); await sleep(900)
log('tap seat blank at', [tx, ty], await armed())
await w.shot('B3d-1-seat-blank-tap')
await done(w); process.exit(0)
