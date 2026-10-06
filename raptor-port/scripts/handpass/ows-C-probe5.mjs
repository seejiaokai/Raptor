import * as C from './ows-C-lib.mjs'
const { L, world, sleep } = C
const { browser, p } = await world()
await L.go(p, 'editsched'); await sleep(500)
console.log(JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('[data-wk]')].map(e => ({ wk: e.dataset.wk, t: e.innerText.trim(), vis: e.offsetParent !== null, par: e.parentElement && (e.parentElement.id || e.parentElement.className) })))))
await browser.close()
