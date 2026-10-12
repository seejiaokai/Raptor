import { world, toMonth, openDay, FRI } from './on-A-lib.mjs'
const W = await world({ tag: 'X' })
const { page, press } = W
await toMonth(W); await openDay(W, FRI)
await press(page.locator('#icPopAdd'))
await page.waitForSelector('#inpEditPop #inpEditType')
console.log(JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#inpEditPop input, #inpEditPop select, #inpEditPop button, #inpEditPop [data-testid]')].map(e => `${e.tagName} id=${e.id} type=${e.type || ''} tid=${e.getAttribute('data-testid') || ''} val=${(e.value || '').slice(0, 20)} txt=${(e.innerText || '').slice(0, 20)}`).slice(0, 80)), null, 1))
await W.shot('X-editor')
await W.ctx.close(); process.exit(0)
