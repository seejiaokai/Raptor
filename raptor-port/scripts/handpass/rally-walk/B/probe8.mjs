console.log('B probe8 v1')
import { launch, open, sleep } from './lib.mjs'
const b = await launch()
const { ctx, p } = await open(b)
await p.evaluate(() => window.go('editsched')); await sleep(700); await p.evaluate(() => window.openScheduler(1)); await p.waitForSelector('#schedBoard'); await sleep(900)
console.log(await p.evaluate(() => [...document.querySelectorAll('[data-bfld="ff:1.0.0.rl"]')].map(e => { const r = e.getBoundingClientRect(); return e.parentElement.parentElement.className + ' | ' + e.closest('[id]')?.id + ' | ' + Math.round(r.x) + ',' + Math.round(r.y) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' vis=' + (e.offsetParent !== null) })))
await b.close()
