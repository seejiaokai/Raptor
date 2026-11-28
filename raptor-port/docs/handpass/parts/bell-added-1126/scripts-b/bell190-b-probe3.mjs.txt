// bell190-b probe 3: the List's "+ Input" window, and a day opened on July's month.
import { createRequire } from 'module'
const require = createRequire(process.cwd() + '/package.json')
const { chromium } = require('playwright')
console.log('bell190-b-probe3 v1')
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
console.log('saber key', await page.evaluate(() => Object.keys(window.PEOPLE).filter(k => window.PEOPLE[k].cs === 'Saber')))
await page.evaluate(() => window.go('inputs'))
await page.waitForFunction(() => window.CURPAGE === 'inputs'); await page.waitForTimeout(800)
const vis = async (label, root) => {
  const out = await page.evaluate((root) => {
    const seen = []
    const base = root ? document.querySelector(root) : document
    if (!base) return ['NO ROOT ' + root]
    for (const e of base.querySelectorAll('button, select, input, textarea, label, [role=tab], [role=switch]')) {
      const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue
      seen.push(`${e.tagName}#${e.id}.${(e.className || '').toString().slice(0, 30)} "${(e.innerText || e.value || e.getAttribute('aria-label') || e.title || '').trim().replace(/\s+/g, ' ').slice(0, 50)}" ${[...e.attributes].filter(a => a.name.startsWith('data-') || a.name === 'type').map(a => a.name + '=' + a.value).join(' ')}`)
    }
    return seen
  }, root)
  console.log('---', label, '\n' + out.join('\n'))
}
await page.click('#inListBtn'); await page.waitForTimeout(500)
await page.screenshot({ path: S + '/probe3-list.png' })
const addBtns = await page.evaluate(() => [...document.querySelectorAll('button')].filter(e => /\+ ?Input/.test(e.innerText) && e.getBoundingClientRect().width > 0).map(e => `${e.id}.${e.className} ${[...e.attributes].map(a => a.name + '=' + a.value).join(' ')}`))
console.log('add buttons', addBtns)
const ab = page.locator('button:visible', { hasText: '+ Input' }).first()
await ab.click(); await page.waitForTimeout(600)
await vis('window', '[data-testid="win-inputedit"]')
await page.screenshot({ path: S + '/probe3-win.png' })
// people select options
console.log('person options', await page.evaluate(() => { const s = document.querySelector('#inpEditPerson'); return s ? [...s.options].slice(0, 6).map(o => o.value + ':' + o.text).join(' | ') + ' ... n=' + s.options.length : 'none' }))
console.log('type options', await page.evaluate(() => { const s = document.querySelector('#inpEditType'); return s ? [...s.options].map(o => o.value).join(',') : 'none' }))
await b.close()
console.log('errors', errs)
