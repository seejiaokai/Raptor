import * as L from './on-RX1-lib.mjs'
const W = await L.world({ tag: 'R8b' })
const { page, tid, shot, press } = W
const J = o => JSON.stringify(o)
const iid = await L.usualSat(W)
await L.frameBoard(page)
const row = page.locator(L.rowSel(0))
const active = () => page.evaluate(() => { const a = document.activeElement; return a ? a.tagName + '.' + String(a.className).slice(0, 30) + ' [' + (a.getAttribute('data-bfld') || a.id || '') + '] contenteditable=' + a.isContentEditable : 'none' })
const s0 = { ground: await L.groundNow(page), rec: await L.recOf(page, iid), undo: await L.undoState(page) }
// click on the people cell (empty part, right of Ranger's puck)
const ppl = row.locator('.ppl')
const pb = await ppl.boundingBox(); console.log('ppl box', J(pb))
await page.mouse.click(pb.x + pb.width - 12, pb.y + pb.height / 2); await page.waitForTimeout(400)
console.log('after click on the people cell: active', await active(), 'any popup', J(await page.evaluate(() => [...document.querySelectorAll('[data-testid], .airpop-box, .pop, [role=dialog], [role=listbox], datalist')].filter(e => e.getClientRects().length).map(e => e.getAttribute('data-testid') || e.className).slice(0, 8))))
await shot('RX1-8-1-click-people-cell')
await page.keyboard.type('Tally'); await page.keyboard.press('Enter'); await page.waitForTimeout(500)
console.log('after typing Tally+Enter: question', await tid('oilconf').count(), 'ground', J(await L.groundNow(page)), 'toast', await L.toast(page), 'same', J(await L.groundNow(page)) === J(s0.ground), 'active', await active())
await shot('RX1-8-2-after-typing')
// click on Ranger's puck itself
await page.locator(L.puckSel(0)).click(); await page.waitForTimeout(500)
console.log('after click on the puck: active', await active(), 'popups', J(await page.evaluate(() => [...document.querySelectorAll('[data-testid], .airpop-box, .pop, [role=dialog], [role=menu]')].filter(e => e.getClientRects().length).map(e => e.getAttribute('data-testid') || e.className).slice(0, 8))))
await shot('RX1-8-3-click-puck')
await page.keyboard.type('Tally'); await page.keyboard.press('Tab'); await page.waitForTimeout(500)
console.log('after typing on puck: ground', J(await L.groundNow(page)), 'question', await tid('oilconf').count())
// the programme name box: typing there?
console.log('errors', J(W.errors))
await W.ctx.close(); process.exit(0)
