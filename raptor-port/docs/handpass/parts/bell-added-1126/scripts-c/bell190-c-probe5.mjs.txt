// bell190-c probe 5 v2: the Add person form's fields, then add Kilo (pilot, CAT C, sign-in kilo) and look for him on the war.
import { createRequire } from 'module'
const require = createRequire(process.cwd() + '/package.json')
const { chromium } = require('playwright')
console.log('bell190-c-probe5 v2')
const URL = 'http://localhost:4190/'
const OUT = process.argv[2]
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1536, height: 864 } })
const page = await ctx.newPage()
await page.goto(URL); await page.waitForSelector('#luser')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#notifyBell')
await page.evaluate(() => window.go('admin'))
await page.waitForTimeout(1200)
const f = await page.evaluate(() => { const btn = document.querySelector('#accAdd'); const box = btn.parentElement.parentElement; return [...box.querySelectorAll('input, select, button')].map(e => e.tagName + (e.id ? '#' + e.id : '') + (e.type ? '(' + e.type + ')' : '') + ':' + ((e.placeholder || e.value || e.innerText || '') + '').replace(/\s+/g, ' ').trim().slice(0, 30) + (e.tagName === 'SELECT' ? ' opts=' + [...e.options].map(o => o.value).join(',') : '')).join(' | ') })
console.log('form', f)
await b.close()
