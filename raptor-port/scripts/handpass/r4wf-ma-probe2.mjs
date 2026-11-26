// r4wf-ma-probe2 — where OIL Earn is on the phone Board (Sat 18 Jul): the ⋯ menu tapped, every visible button listed
import * as A from './r4wf-ma-lib.mjs'
const { L, J, sleep } = A
console.log('r4wf-ma-probe2 v1', A.TAG)
const w = await A.world(); const p = w.page
await L.go(p, 'editsched'); await p.evaluate(() => window.openScheduler(5)); await sleep(900)
const vis = () => p.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetWidth > 0 && b.getBoundingClientRect().top < 200).map(b => `${b.id || ''}|${b.className}|${b.textContent.trim().slice(0, 20)}`))
console.log('top buttons', J(await vis()))
const more = p.locator('#schedBoard button:visible').filter({ hasText: /^\s*(⋯|…|\.\.\.)\s*$/ }).first()
console.log('more count', await more.count(), await more.evaluate(e => e.outerHTML.slice(0, 200)).catch(() => '-'))
await more.tap(); await sleep(800)
console.log('after tap, visible buttons with OIL:', J(await p.evaluate(() => [...document.querySelectorAll('button, [role=menuitem]')].filter(b => b.offsetWidth > 0 && /oil/i.test(b.textContent)).map(b => `${b.id}|${b.className}|${b.textContent.trim()}`))))
console.log('sbOil', J(await p.evaluate(() => { const b = document.querySelector('#sbOil'); const r = b.getBoundingClientRect(); return { w: r.width, h: r.height, disp: getComputedStyle(b).display, par: b.parentElement.className } })))
await p.screenshot({ path: `${L.OUT}/probe2-after-more.png` })
await A.fin('probe2')
