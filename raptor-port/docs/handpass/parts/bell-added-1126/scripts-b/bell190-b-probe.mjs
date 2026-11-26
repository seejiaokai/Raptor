// bell190-b probe: learn the Inputs page's controls on the running build.
import { createRequire } from 'module'
const require = createRequire(process.cwd() + '/package.json')
const { chromium } = require('playwright')
console.log('bell190-b-probe v1')
const URL = 'http://localhost:4190/'
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1536, height: 864 } })
const page = await ctx.newPage()
const errs = []; page.on('pageerror', e => errs.push(String(e)))
await page.goto(URL); await page.waitForSelector('#luser')
console.log('bundle', await page.evaluate(() => [...document.scripts].map(s => s.src).join(' ')))
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#notifyBell')
await page.waitForTimeout(600)
const info = await page.evaluate(() => {
  const P = window.PEOPLE || []
  return {
    people: (Array.isArray(P) ? P : Object.values(P)).slice(0, 60).map(p => [p.id || p.key, p.cs || p.callsign || p.name, p.role || p.seat, p.sans]),
    notices: (window.NOTICES || []).length,
    noticeSample: (window.NOTICES || []).slice(0, 2),
    inputSample: (window.INPUTS || []).slice(0, 2),
    keys: Object.keys(window).filter(k => /^[A-Z_]{3,}$/.test(k)).slice(0, 80),
  }
})
console.log(JSON.stringify(info, null, 0).slice(0, 5000))
await page.evaluate(() => window.go('inputs'))
await page.waitForFunction(() => window.CURPAGE === 'inputs'); await page.waitForTimeout(800)
const btns = await page.evaluate(() => [...document.querySelectorAll('button, [role=tab], select, input')].filter(e => e.getBoundingClientRect().width > 0).map(e => `${e.tagName}#${e.id}.${(e.className||'').toString().slice(0,40)} [${(e.innerText||e.value||e.getAttribute('aria-label')||'').trim().slice(0,30)}] ${[...e.attributes].filter(a=>a.name.startsWith('data-')).map(a=>a.name+'='+a.value).join(' ')}`))
console.log(btns.join('\n'))
await page.screenshot({ path: process.argv[2] + '/probe-inputs.png' })
console.log('errors', errs)
await b.close()
