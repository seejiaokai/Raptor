// asp-w2 probe 5: an OFT session with ALL AVAIL in its BACK seat — what the seat draws (read only). SZ=d|p
import * as L from './asp-w2-lib.mjs'
const { sleep, J } = L
console.log('asp-w2-probe5 v1')
const sz = L.SIZES[process.env.SZ || 'd']
const W = L.mk('s23probe5', sz)
const { b, p } = await L.world(sz, W)
await L.signIn(p, 'ad', 'a')
await L.openBoard(p, W, 5)
await W.press(p, L.B('[data-sradd="5.oft"]'), 'sim-add')
await L.typeBox(p, W, '[data-bfld="sr:5.oft.0.str"]', '10:00')
await L.typeBox(p, W, '[data-bfld="sr:5.oft.0.end"]', '17:00')
await L.armAndPick(p, W, '[data-slot="s:5.oft.0.w"]', 'allavail', 'simw')
console.log('sim', J(await p.evaluate(() => window.DAYS[5].sims.oft[0])))
const html = await p.evaluate(() => { const s = document.querySelector('#schedBoard [data-slot="s:5.oft.0.w"]'); return s ? s.parentElement.outerHTML.slice(0, 1200) : 'no seat' })
console.log('seat html', html)
const chips = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .oilcount')].map(e => e.dataset.oilsent + ' ' + e.textContent + ' vis=' + (e.getBoundingClientRect().width > 0)))
console.log('all chips', J(chips))
await p.locator('#schedBoard [data-slot="s:5.oft.0.w"]').first().evaluate(e => e.scrollIntoView({ block: 'center' })); await sleep(300)
await W.pic(p, 'backseat')
await b.close()
