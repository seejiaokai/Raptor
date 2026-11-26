// bell190-c probe 3: Admin -> Users, the add-a-person form's controls.
import { createRequire } from 'module'
const require = createRequire(process.cwd() + '/package.json')
const { chromium } = require('playwright')
console.log('bell190-c-probe3 v1')
const URL = 'http://localhost:4190/'
const OUT = process.argv[2]
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1536, height: 864 } })
const page = await ctx.newPage()
const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
await page.goto(URL); await page.waitForSelector('#luser')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#notifyBell')
await page.evaluate(() => window.go('admin'))
await page.waitForTimeout(1500)
const ctl = await page.evaluate(() => [...document.querySelectorAll('#page-admin button, #page-admin input, #page-admin select, #page-admin [role=tab]')].filter(e => e.getBoundingClientRect().height > 0).slice(0, 60).map(e => e.tagName + (e.id ? '#' + e.id : '') + (e.dataset.testid ? '[' + e.dataset.testid + ']' : '') + (e.name ? '{' + e.name + '}' : '') + ':' + ((e.innerText || e.placeholder || e.value || '') + '').replace(/\s+/g, ' ').trim().slice(0, 30)).join(' | '))
console.log('admin controls', ctl)
await page.screenshot({ path: OUT + '/probe3-admin.png' })
console.log('errors', errs)
await b.close()
