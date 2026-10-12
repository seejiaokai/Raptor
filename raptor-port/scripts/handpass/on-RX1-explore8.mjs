import * as L from './on-RX1-lib.mjs'
const W = await L.world({ tag: 'x8' })
const { page, tid, shot, press } = W
const J = o => JSON.stringify(o)
const iid = await L.usualSat(W, { goToBoard: false })
await L.frameGrnd(page)
const ts = () => page.evaluate(() => { const t = document.getElementById('toastEl'); const cs = getComputedStyle(t); const r = t.getBoundingClientRect(); const b = document.querySelector('[data-testid="oilbar"]'); const br = b && b.getBoundingClientRect(); return { txt: t.textContent, op: cs.opacity, y: Math.round(r.top), b: Math.round(r.bottom), x: Math.round(r.left), r: Math.round(r.right), barY: br ? Math.round(br.top) : null, bottomCss: cs.bottom } })
await L.drag(page, page.locator(L.wkSel(1)), page.locator(L.wkSel(0)))
await press(tid('oilconf-cancel'))
await page.waitForTimeout(3500)
console.log('bar up, settled', J(await ts()))
const rmk = page.locator(`#eWeek .day:not(.peek) [data-txt="gr:${L.SAT_DI}.1.rmks"]`)
await rmk.click(); await page.keyboard.type('check radios'); await page.keyboard.press('Tab')
for (let i = 0; i < 10; i++) { console.log('remark', i, J(await ts())); await page.waitForTimeout(100) }
await page.waitForTimeout(2500)
await page.locator('#undoBtn').click()
for (let i = 0; i < 6; i++) { console.log('undo', i, J(await ts())); await page.waitForTimeout(100) }
await shot('RX1-6-x-undo-note')
await W.ctx.close(); process.exit(0)
