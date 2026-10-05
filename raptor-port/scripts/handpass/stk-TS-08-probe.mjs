import * as S from './stk-TS-lib.mjs'
const { L, W, world, pic } = S
const { browser, p, errors } = await world({ phone: true })
await L.go(p, 'editsched')
await S.sleep(600)
await p.evaluate(() => window.scrollTo(0, 0)); await S.sleep(300)
await pic(p, 'probe2-phone-top')
console.log('scrollY', await p.evaluate(() => scrollY))
await p.locator('#burger').click(); await S.sleep(500)
await pic(p, 'probe2-phone-drawer')
console.log('drawer', await p.evaluate(() => document.querySelector('#drawer, #drawerNav')?.parentElement?.innerText.replace(/\s+/g, ' ').slice(0, 600)))
console.log('insight btn', await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => /insight/i.test(b.innerText + b.id + b.title)).map(b => b.id + '|' + b.innerText.trim() + '|vis=' + (b.offsetParent !== null) + '|' + JSON.stringify(b.getBoundingClientRect()))))
console.log('errors', errors)
await browser.close()
