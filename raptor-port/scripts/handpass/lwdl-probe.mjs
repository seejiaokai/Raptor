// lwdl-probe.mjs — walks nothing: a first look at the demo world (who is on the grid, what Approvals holds), logs only. From the lw-decide-look walk of 28 Nov 26 ([LW-DECIDE-LOOK], his D2881); run from raptor-port/.
// lw-decide-look walk — a first look at the world: who is on the grid, what Approvals holds. Logs only.
import { chromium, OUT_DEFAULT } from './lwdl-pw.mjs'
import path from 'node:path'
const OUT = process.env.LWDL_OUT || OUT_DEFAULT
const PORT = process.env.PORT || 4192
const b = await chromium.launch()
const page = await (await b.newContext({ viewport: { width: 1536, height: 864 } })).newPage()
page.on('pageerror', e => console.log('PAGEERR', String(e).slice(0, 200)))
await page.goto(`http://127.0.0.1:${PORT}/?fresh=1`)
await page.waitForSelector('#luser')
await page.evaluate(() => window.lwSetMemberToday('2026-01-02'))
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.evaluate(() => window.lwSetMemberToday('2026-01-02'))
await page.evaluate(() => window.go('leavewar'))
await page.waitForSelector('[data-testid^="row-"]', { state: 'attached', timeout: 20000 })
await page.waitForTimeout(1500)
const rows = await page.$$eval('[data-testid^="row-"]', es => es.map(e => e.dataset.testid.slice(4) + ':' + (e.innerText || '').split('\n')[0].slice(0, 20)))
console.log('rows', rows.length, rows.slice(0, 60).join(' | '))
const months = await page.$$eval('[data-testid^="month-"]', es => es.map(e => e.dataset.testid))
console.log('months', months.join(','))
const cells = await page.$$eval('td[data-testid^="cell-"]', es => es.filter(e => e.querySelector('span.c')).slice(0, 120).map(e => e.dataset.testid.slice(5) + '=' + [...e.querySelectorAll('span.c')].map(s => s.textContent.trim() + ':' + ((s.className.match(/\bs-(\w+)\b/) || [])[1] || '?')).join('+')))
console.log('cells', cells.length, cells.join(' '))
await page.screenshot({ path: path.join(OUT, '_probe-grid.png') })
await page.click('[data-testid="lw-tab-approvals"]'); await page.waitForTimeout(1200)
const lines = await page.$$eval('[data-testid^="appr-line-"]', es => es.map(e => e.dataset.testid + ' :: ' + e.innerText.replace(/\s+/g, ' ').slice(0, 120)))
console.log('appr lines', lines.length); for (const l of lines) console.log('  ' + l)
console.log('appr-sub', await page.locator('[data-testid="appr-sub"]').allInnerTexts())
console.log('approve-all', await page.locator('[data-testid="appr-approve-all"]').allInnerTexts())
console.log('tabs', await page.$$eval('[data-testid^="lw-tab-"]', es => es.map(e => e.dataset.testid + '=' + e.innerText.replace(/\s+/g, ' '))))
await page.screenshot({ path: path.join(OUT, '_probe-appr.png') })
await b.close()
