import * as S from './stk-TS-lib.mjs'
const { L, W, world, pic } = S
const { browser, p, errors } = await world()
await L.go(p, 'editsched')
await S.addFlyWave(p, 4)
await p.locator('#schedBoard [data-lcx="4.0.0.0"]').first().click(); await S.sleep(400)
console.log('cxPop', await p.evaluate(() => document.querySelector('#cxPop')?.innerHTML.slice(0, 1500)))
await pic(p, 'probe10-cx')
await browser.close()
