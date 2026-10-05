import * as S from './stk-TS-lib.mjs'
const { L, W, world, pic } = S
const { browser, p, errors } = await world()
await L.go(p, 'editsched')
await p.locator('#insightBtn').click(); await S.sleep(800)
console.log(JSON.stringify(await S.readInsights(p)).slice(0, 4000))
await pic(p, 'probe-insights')
console.log(await p.evaluate(() => document.querySelector('#insightBody').innerHTML.slice(0, 3500)))
console.log('errors', errors)
await browser.close()
