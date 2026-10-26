// probe: the tick, with a mouse press at its coordinates and a log of what changes in the window. usage: node lw-m3-walk-c10b.mjs
import * as L from './lw-m3-walk-c-lib.mjs'
console.log('lw-m3-walk-c10b v1')
const w = await L.newCtx('desk')
await L.signIn(w, 'admin')
const { page } = w
await L.gotoMonth(w, 'OCT')
await L.press(w, L.T(L.cellId('stiff', '2026-10-28'))); await page.waitForTimeout(1500)
await page.evaluate(() => { window.__m = []; const root = document.querySelector('[data-testid="bid-picker"]'); const mo = new MutationObserver(ms => { for (const m of ms) window.__m.push(m.type + ':' + (m.target.className || m.target.nodeName).toString().slice(0, 30) + (m.addedNodes.length ? ' +' + m.addedNodes.length : '') + (m.removedNodes.length ? ' -' + m.removedNodes.length : '')) }); mo.observe(root, { attributes: true, childList: true, subtree: true }); document.addEventListener('click', e => window.__m.push('doc-click on ' + (e.target.dataset?.testid || e.target.nodeName)), true) })
const chk = () => page.evaluate(() => document.querySelector('[data-testid="bid-approve-tick"]').checked)
console.log('before', await chk())
const b = await page.locator('[data-testid="bid-approve-tick"]').boundingBox()
await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2)
await page.waitForTimeout(80); console.log('80 ms after a mouse press on the box:', await chk())
await page.waitForTimeout(700); console.log('780 ms after:', await chk())
console.log('what happened in the window:', JSON.stringify(await page.evaluate(() => window.__m)))
await L.shot(w, 's26p-desk-chromium-06-after-mouse-press')
console.log('errors', JSON.stringify(w.errs))
await L.closeBrowser()
