import * as K from './ows-B-lib.mjs'
const { world } = K
const { p, browser } = await world()
const r = await p.evaluate(() => Object.entries(window.PEOPLE).filter(([i, x]) => x.seat && x.seat !== 'FCP').map(([i, x]) => i + '|' + x.cs + '|' + x.seat + '|' + x.q))
console.log(r.join('\n'))
await browser.close()
