import * as D from './ows-D-lib.mjs'
const { world, sleep, A, L, P } = D
const { browser, p, errors } = await world()
await L.go(p, 'leavewar'); await sleep(1200)
const top = await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 900))
console.log(top)
const ids = await p.evaluate(() => [...document.querySelectorAll('[data-testid]')].map(e => e.dataset.testid).filter(t => !/^(cell|event)-/.test(t)).slice(0, 60))
console.log(JSON.stringify(ids))
await P(p, 'probe8-lw')
await browser.close()
