// bell190-b probe 2: the Inputs page's own controls, a day opened, and "+ Input"'s window.
import { createRequire } from 'module'
const require = createRequire(process.cwd() + '/package.json')
const { chromium } = require('playwright')
console.log('bell190-b-probe2 v1')
const URL = 'http://localhost:4190/'
const S = process.argv[2]
const b = await chromium.launch()
const ctx = await b.newContext({ viewport: { width: 1536, height: 864 } })
const page = await ctx.newPage()
const errs = []; page.on('pageerror', e => errs.push(String(e)))
await page.goto(URL); await page.waitForSelector('#luser')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#notifyBell')
await page.waitForTimeout(600)
console.log(await page.evaluate(() => { const P = window.PEOPLE; const ks = Object.keys(P); return JSON.stringify([ks.slice(0, 5), P[ks[0]], ks.filter(k => /tally|hex|ranger|saber/i.test(k) || /Tally|Hex/.test(JSON.stringify(P[k]))).map(k => [k, P[k].cs || P[k].name])]).slice(0, 1500) }))
await page.evaluate(() => window.go('inputs'))
await page.waitForFunction(() => window.CURPAGE === 'inputs'); await page.waitForTimeout(800)
const vis = async (label) => {
  const out = await page.evaluate(() => {
    const seen = []
    for (const e of document.querySelectorAll('button, select, input, textarea, [role=tab], [data-icday]')) {
      const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue
      const t = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
      if (!t || !(t === e || e.contains(t) || t.contains(e))) continue
      if (e.matches('[data-icday]') && seen.filter(s => s.startsWith('[icday')).length > 3) continue
      seen.push(`${e.matches('[data-icday]') ? '[icday ' + e.getAttribute('data-icday') + '] ' : ''}${e.tagName}#${e.id}.${(e.className || '').toString().slice(0, 30)} "${(e.innerText || e.value || e.getAttribute('aria-label') || e.title || '').trim().replace(/\s+/g, ' ').slice(0, 40)}" ${[...e.attributes].filter(a => a.name.startsWith('data-')).map(a => a.name + '=' + a.value).join(' ')}`)
    }
    return seen
  })
  console.log('---', label, '\n' + out.join('\n'))
}
await vis('inputs page')
await page.screenshot({ path: S + '/probe2-a.png' })
// the month heading
console.log('month', await page.locator('#inpCal .ic-mon').innerText().catch(e => 'no ic-mon'))
await b.close()
console.log('errors', errs)
