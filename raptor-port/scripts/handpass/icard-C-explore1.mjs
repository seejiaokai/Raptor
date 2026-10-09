import * as L from './icard-C-lib.mjs'
const w = await L.world('desk', 'ad')
const p = w.page
await L.go(p, 'inputs')
await L.toCal(w)
await p.locator('[data-testid="in-gear"]').click(); await L.sleep(600)
await L.pic(w, 'x1-gear')
console.log(await p.evaluate(() => [...document.querySelectorAll('[data-testid]')].filter(e => e.offsetParent && /iset|days|settings/.test(e.dataset.testid)).map(e => e.dataset.testid + ' | ' + e.innerText.slice(0, 40).replace(/\n/g, ' '))))
console.log(await p.evaluate(() => [...document.querySelectorAll('button')].filter(e => e.offsetParent && /Calendar/i.test(e.innerText)).map(e => e.id + ' | ' + (e.dataset.testid || '') + ' | ' + e.innerText.slice(0, 40))))
console.log(w.errors)
await w.browser.close()
