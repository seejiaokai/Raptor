// bell190 walker A — exploration 1: what the page exposes, who is who, Wednesday's ground rows on Edit Schedule
import { createRequire } from 'module'
const require = createRequire(process.cwd() + '/package.json')
const { chromium } = require('playwright')
console.log('bell190-a-explore1 v1')
const URL = 'http://localhost:4190/'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1536, height: 864 } })
const page = await ctx.newPage()
const errs = []; page.on('pageerror', e => errs.push(String(e)))
await page.goto(URL); await page.waitForSelector('#luser')
console.log('bundle', await page.evaluate(() => [...document.querySelectorAll('script[src]')].map(s => s.src).join(' ')))
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#notifyBell')
await page.waitForTimeout(800)
const info = await page.evaluate(() => {
  const keys = Object.keys(window).filter(k => /notic|bell|INPUT|PEOPLE|DAYS|go$|^go|CUR|openSched|undo|ME|SESSION|user/i.test(k))
  const ppl = Object.entries(window.PEOPLE || {}).map(([id, p]) => `${id}=${p.cs}${p.special ? '*' : ''}${p.role ? '/' + p.role : ''}`)
  return { keys, ppl, cur: window.CURPAGE, notices: (window.NOTICES || []).length, n0: (window.NOTICES || []).slice(-1) }
})
console.log(JSON.stringify(info, null, 1))
await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(1200)
const wk = await page.evaluate(() => {
  const D = window.DAYS || []
  const out = D.map((d, i) => `${i} ${d.date || d.d || d.label || ''} ground=${(d.ground || []).length}`)
  const g = (D[2]?.ground || []).map((r, i) => JSON.stringify(r).slice(0, 200))
  const dom = [...document.querySelectorAll('#eWeek [data-slot^="g:2."], #eWeek [data-fill^="g:2."]')].slice(0, 40).map(e => `${e.tagName}.${String(e.className).slice(0, 30)} slot=${e.getAttribute('data-slot')} fill=${e.getAttribute('data-fill')} w=${Math.round(e.getBoundingClientRect().width)} t="${(e.textContent || '').trim().slice(0, 30)}"`)
  return { out, g, dom, days: document.querySelectorAll('#eWeek .day').length }
})
console.log(JSON.stringify(wk, null, 1))
await page.screenshot({ path: process.argv[2] + '/bell190-a-explore1.png' })
console.log('errors', errs)
await b.close()
