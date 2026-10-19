console.log('B probe10 v1')
import { launch, open, sleep, shot, tap } from './lib.mjs'
const b = await launch()
const { ctx, p } = await open(b)
await tap(p, p.locator('#burger'), { block: 'nearest' }); await sleep(400)
console.log(await p.evaluate(() => [...document.querySelectorAll('[data-go],[data-page],.nav a,.nav button,#menu button,nav button')].filter(e => e.offsetParent !== null).map(e => (e.dataset.go || e.dataset.page || '') + '|' + e.textContent.trim().slice(0, 25))))
console.log(await shot(p, 'probe10-menu'))
await b.close()
