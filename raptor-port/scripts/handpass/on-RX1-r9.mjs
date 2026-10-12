import * as L from './on-RX1-lib.mjs'
const W = await L.world({ tag: 'R9' })
const { page, tid, shot, press } = W
const J = o => JSON.stringify(o)
const iid = await L.usualSat(W)
await L.frameBoard(page)
const s0 = { ground: await L.groundNow(page), oil: await L.oilOf(page, iid), undo: await L.undoState(page) }
await L.drag(page, page.locator(L.puckSel(1)), page.locator(L.puckSel(0)))
console.log('question up', await tid('oilconf').count(), await tid('oilconf-lead').innerText().catch(() => 'NO'), 'board visible', await page.locator('#sbBoard').isVisible())
await page.keyboard.press('Escape'); await page.waitForTimeout(800)
const boardVis = await page.locator('#sbBoard').isVisible().catch(() => false)
console.log('after ONE Escape: question', await tid('oilconf').count(), 'bar', await tid('oilbar').count(), await tid('oilbar-text').innerText().catch(() => 'NO'), 'board still open', boardVis, 'SBDAY', await page.evaluate(() => window.SBDAY), 'CURPAGE', await page.evaluate(() => window.CURPAGE))
console.log('nothing changed', J(await L.groundNow(page)) === J(s0.ground), await L.oilOf(page, iid) === s0.oil, (await L.undoState(page)) === s0.undo)
await W.hush(); await shot('RX1-9-1-after-escape'); await W.unhush()
console.log('errors', J(W.errors))
await W.ctx.close(); process.exit(0)
