import { world, done, log, sleep, SAT_DI } from './on-B-lib.mjs'
const w = await world('p568')
const { page } = w
const iid = await w.usualSat()
log('iid', iid, await w.groundNow(), await w.oilOf(iid))
// frame the row: scroll the section to top
const rowSel = i => `#sbBoard [data-move="mv:g.${SAT_DI}.${i}"]`
const puckSel = i => `#sbBoard [data-slot="g:${SAT_DI}.${i}"] .puck`
log('puck counts', await page.locator(puckSel(0)).count(), await page.locator(puckSel(1)).count())
await page.locator(rowSel(0)).evaluate(e => { e.scrollIntoView({ block: 'center' }) })
await sleep(400)
await w.shot('B1-0-board-setup')
log('boxes', await page.locator(puckSel(0)).first().boundingBox(), await page.locator(puckSel(1)).first().boundingBox())
await done(w)
process.exit(0)
