// probe: can the admin untick "Approve what I enter" in the one-day window? usage: node lw-m3-walk-c10.mjs <desk|phone> <chromium|webkit>
import * as L from './lw-m3-walk-c-lib.mjs'
const size = process.argv[2] || 'desk', engine = process.argv[3] || 'chromium'
const P = `s26p-${size}-${engine}-`
console.log('lw-m3-walk-c10 v1', size, engine)
L.clearPrefix(P)
const w = await L.newCtx(size, engine)
await L.signIn(w, 'admin')
const { page } = w
await L.gotoMonth(w, 'OCT')
await L.press(w, L.T(L.cellId('stiff', '2026-10-28'))); await page.waitForTimeout(600)
const st = () => page.evaluate(() => { const i = document.querySelector('[data-testid="bid-approve-tick"]'); const l = document.querySelector('[data-testid="bid-approve-tick-label"]'); const r = i.getBoundingClientRect(); const lr = l.getBoundingClientRect(); return { checked: i.checked, input: [r.x, r.y, r.width, r.height].map(Math.round), label: [lr.x, lr.y, lr.width, lr.height].map(Math.round), hit: (() => { const h = document.elementFromPoint(lr.x + lr.width / 2, lr.y + lr.height / 2); return h ? h.tagName + '.' + (h.dataset.testid || h.className) : null })() } })
await page.evaluate(() => { window.__ev = []; const i = document.querySelector('[data-testid="bid-approve-tick"]'); for (const t of ['click', 'change', 'input']) i.addEventListener(t, e => window.__ev.push(t + ':' + i.checked), true); const mo = new MutationObserver(() => window.__ev.push('dom')); mo.observe(i.parentElement, { attributes: true, childList: true, subtree: true }) })
console.log('initial', JSON.stringify(await st()))
await L.shot(w, P + '01-initial')
await L.press(w, L.T('bid-approve-tick-label'), w.phone ? { quick: P + '02-tick-tap' } : {}); await page.waitForTimeout(600)
console.log('after one press on the label', JSON.stringify(await st()))
await L.shot(w, P + '03-after-press')
await L.press(w, L.T('bid-approve-tick'), w.phone ? { quick: P + '04-tick2-tap' } : {}); await page.waitForTimeout(600)
console.log('after one press on the box', JSON.stringify(await st()), 'events', JSON.stringify(await page.evaluate(() => window.__ev)))
await L.shot(w, P + '05-after-press-2')
await page.waitForTimeout(800)
await page.click('[data-testid="bid-approve-tick"]'); await page.waitForTimeout(600)
console.log('after a plain click on the box, then 600ms', JSON.stringify(await st()), 'events', JSON.stringify(await page.evaluate(() => window.__ev)))
console.log('errors', JSON.stringify(w.errs))
await L.closeBrowser()
