// bell190-b probe 5: why the new account's sign-in did not reach the app.
import { createRequire } from 'module'
const require = createRequire(process.cwd() + '/package.json')
const { chromium } = require('playwright')
console.log('bell190-b-probe5 v2')
const URL = 'http://localhost:4190/'
const S = process.argv[2]
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1536, height: 864 } })
const page = await ctx.newPage()
async function signIn(u, p) {
  await page.goto(URL); await page.waitForSelector('#luser')
  await page.fill('#luser', u); await page.fill('#lpass', p)
  await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#notifyBell', { timeout: 8000 }); await page.waitForTimeout(500)
}
await signIn('ad', 'a')
await page.evaluate(() => window.go('admin')); await page.waitForTimeout(800)
console.log('all callsigns', await page.evaluate(() => Object.entries(window.PEOPLE).map(([k, p]) => k + '=' + p.cs + (p.sq ? '/' + p.sq : '')).join(' ')))
await page.fill('#accAddCs', 'Moxie'); await page.fill('#accAddIni', 'MX')
await page.selectOption('#accAddSeat', 'RCP')
await page.selectOption('#accAddCat', 'B')
await page.fill('#accAddName', 'moxie@mail')
await page.waitForTimeout(200)
await page.click('#accAdd'); await page.waitForTimeout(600)
console.log('note', await page.locator('#accAddNote').innerText().catch(() => ''))
console.log('accounts', await page.evaluate(() => JSON.stringify(Object.keys(window).filter(k => /ACC/.test(k)))))
await page.locator('#accFind').fill('Moxie'); await page.waitForTimeout(300)
console.log('row', await page.locator('#accList').innerText())
await page.click('#logout'); await page.waitForSelector('#luser')
await page.fill('#luser', 'moxie@mail'); await page.fill('#lpass', 'x')
await page.click('#loginForm button[type=submit]'); await page.waitForTimeout(1500)
await page.screenshot({ path: S + '/probe5-kestrel.png' })
console.log('screen', (await page.evaluate(() => document.body.innerText)).slice(0, 600))
await b.close()
