import { chromium } from '@playwright/test'
import { URL0 } from './lib.mjs'
console.log('probe11 VERSION 2')
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage()
await page.goto(URL0); await page.waitForSelector('#luser')
await page.fill('#luser', 'newbie'); await page.fill('#lpass', 'x'); await page.click('#loginForm button[type=submit]'); await page.waitForTimeout(600)
console.log((await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 800))
console.log(await page.$$eval('button, a, input, select', es => es.filter(e => e.getBoundingClientRect().width > 0).map(e => e.tagName + '#' + e.id + ' [' + (e.innerText || e.placeholder || '').trim().slice(0, 40) + ']')))
await page.screenshot({ path: 'docs/img/handpass/2026-10-13-one-date-calendar/w2/probe11.png' })
await b.close()
