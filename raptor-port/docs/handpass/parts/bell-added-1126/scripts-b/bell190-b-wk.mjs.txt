// bell190-b: does WebKit open the app on this port?
import { createRequire } from 'module'
const require = createRequire(process.cwd() + '/package.json')
const { webkit } = require('playwright')
console.log('bell190-b-wk v1')
const b = await webkit.launch()
const ctx = await b.newContext({ viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 })
const page = await ctx.newPage()
page.on('requestfailed', r => console.log('failed', r.url(), r.failure()?.errorText))
page.on('console', m => console.log('console', m.type(), m.text().slice(0, 200)))
try { await page.goto('http://localhost:4190/', { waitUntil: 'commit', timeout: 15000 }); console.log('committed') } catch (e) { console.log('goto err', String(e).slice(0, 300)) }
await page.waitForTimeout(5000)
console.log('url', page.url(), 'luser?', await page.locator('#luser').count())
console.log((await page.evaluate(() => document.body ? document.body.innerText.slice(0, 300) : 'no body').catch(e => String(e))))
await page.screenshot({ path: process.argv[2] + '/wk.png' })
await b.close()
