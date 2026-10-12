import * as L from './on-RX1-lib.mjs'
const W = await L.world({ tag: 'x7' })
const { page, tid, shot, press } = W
const J = o => JSON.stringify(o)
const iid = await L.usualSat(W, { goToBoard: false })
await L.frameGrnd(page)
const ts = () => page.evaluate(() => { const t = document.getElementById('toastEl'); const cs = getComputedStyle(t); return { txt: t.textContent, op: t.style.opacity, cop: cs.opacity, cls: t.className, bottom: cs.bottom, tr: cs.transform, vis: cs.visibility, disp: cs.display } })
console.log('rest', J(await ts()))
const rmk = page.locator(`#eWeek .day:not(.peek) [data-txt="gr:${L.SAT_DI}.1.rmks"]`)
await rmk.click(); await page.keyboard.type('bring helmets'); await page.keyboard.press('Tab')
for (let i = 0; i < 8; i++) { await page.waitForTimeout(150); console.log(i, J(await ts())) }
console.log('toasts', J(await L.toastsAll(page)))
// another note: undo
await page.locator('#undoBtn').click()
for (let i = 0; i < 4; i++) { await page.waitForTimeout(150); console.log('undo', i, J(await ts())) }
console.log('toasts', J(await L.toastsAll(page)))
await W.ctx.close(); process.exit(0)
