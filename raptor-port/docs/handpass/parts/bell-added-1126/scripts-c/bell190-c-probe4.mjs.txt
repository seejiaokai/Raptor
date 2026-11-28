// bell190-c probe 4: Admin -> Users add form; try 'hex' sign-in with an arbitrary password.
import { createRequire } from 'module'
const require = createRequire(process.cwd() + '/package.json')
const { chromium } = require('playwright')
console.log('bell190-c-probe4 v1')
const URL = 'http://localhost:4190/'
const OUT = process.argv[2]
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1536, height: 864 } })
const page = await ctx.newPage()
const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
await page.goto(URL); await page.waitForSelector('#luser')
await page.fill('#luser', 'hex'); await page.fill('#lpass', 'zz')
await page.click('#loginForm button[type=submit]')
const ok = await page.waitForSelector('#notifyBell', { timeout: 4000 }).then(() => true).catch(() => false)
console.log('hex/zz signs in?', ok, ok ? await page.evaluate(() => document.querySelector('#logout') && 1) : await page.evaluate(() => document.body.innerText.slice(0, 200)))
if (ok) { await page.click('#logout'); await page.waitForSelector('#luser') }
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#notifyBell')
await page.evaluate(() => window.go('admin'))
await page.waitForTimeout(1500)
const adds = await page.evaluate(() => [...document.querySelectorAll('#page-admin button, #page-admin a')].filter(e => /add|\+|new/i.test(e.innerText || '')).map(e => e.tagName + (e.id ? '#' + e.id : '') + ':' + e.innerText.replace(/\s+/g, ' ').trim().slice(0, 40) + ' h=' + Math.round(e.getBoundingClientRect().height)).join(' | '))
console.log('add-ish', adds)
console.log('errors', errs)
await b.close()
