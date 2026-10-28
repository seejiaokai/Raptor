// His question of 28 Oct 26 (08:57, D1448): a leave of several days decided whole on the grid without a drag-selection, any
// one day still changeable alone. Drawn on the real app in WebKit at his iPhone's 402 x 874, three times over: the bid window
// as built on one day of Trident's four-day LL, then the recommended design — the window opened on the whole leave, a row
// "All 4 days · Tue 13 only" choosing what Approve, Refuse, Move and Delete act on, the grid marking the same days. The
// design is laid over the page by hand; nothing in the app changes.
// Run from raptor-port/ against the build served on PORT (default 4173): node scripts/handpass/lw-whole-leave-mock.mjs
import { webkit, devices } from '@playwright/test'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
const PORT = process.env.PORT || 4173
const OUT = path.resolve('docs/img/handpass/2026-10-28-lw-whole-leave')
mkdirSync(OUT, { recursive: true })
const b = await webkit.launch()
let problems = 0
const ctx = await b.newContext({ ...devices['iPhone 13'], viewport: { width: 402, height: 874 }, deviceScaleFactor: 3 })
const P = await ctx.newPage()
P.on('pageerror', e => { problems++; console.log('page error: ' + String(e).slice(0, 160)) })
await P.goto(`http://localhost:${PORT}/?fresh=1`); await P.waitForSelector('#luser')
await P.fill('#luser', 'ad'); await P.fill('#lpass', 'a'); await P.click('#loginForm button[type=submit]')
await P.waitForSelector('#vWeek .day', { state: 'attached' })
await P.evaluate(() => window.go('leavewar')); await P.waitForSelector('[data-testid="lw-tab-approvals"]')
await P.click('[data-testid="lw-tab-approvals"]'); await P.waitForSelector('[data-testid="approvals-page"]:not([hidden])')
await P.waitForTimeout(400)
if (await P.locator('[data-testid="appr-elsewhere"]').count()) { await P.click('[data-testid="appr-elsewhere"]'); await P.waitForTimeout(500) }
const lines = await P.$$eval('[data-testid="appr-dates"]', els => els.map(e => e.closest('[data-testid^="appr-row"]')?.innerText || e.parentElement.parentElement.innerText).map(s => s.replace(/\s+/g, ' ').slice(0, 50)))
console.log('lines:', lines.join(' | '))
const ix = lines.findIndex(s => /Trident/.test(s))
if (ix < 0) throw new Error('no Trident line')
await P.locator('[data-testid="appr-dates"]').nth(ix).click()
await P.waitForSelector('td.lw-ring'); await P.waitForTimeout(700)
const id = await P.evaluate(() => document.querySelector('td.lw-ring').dataset.testid)
const who = id.replace(/^cell-/, '').replace(/-\d{4}-\d\d-\d\d$/, ''), day0 = id.slice(-10)
console.log('ringed', id)
await P.evaluate(() => document.querySelector('td.lw-ring')?.classList.remove('lw-ring'))
await P.click(`[data-testid="${id}"]`)
await P.waitForSelector('[data-testid="bid-picker"]'); await P.waitForTimeout(500)
/* the day just above the window, as the phone brings it (D1290), so its row shows in the picture */
async function clearRow() { await P.evaluate((tid) => {
  const c = document.querySelector(`[data-testid="${tid}"]`).getBoundingClientRect()
  const s = document.querySelector('[data-testid="bid-picker"]').getBoundingClientRect()
  const dy = c.bottom - s.top + 8
  if (dy <= 0) return
  let el = document.querySelector(`[data-testid="${tid}"]`).parentElement
  while (el && el !== document.body) { const o = getComputedStyle(el).overflowY; if ((o === 'auto' || o === 'scroll') && el.scrollHeight > el.clientHeight) { el.scrollTop += dy; return } el = el.parentElement }
  window.scrollBy(0, dy)
}, id); await P.waitForTimeout(300) }
await clearRow()
console.log('after scroll', JSON.stringify(await P.evaluate((tid) => { const c = document.querySelector(`[data-testid="${tid}"]`).getBoundingClientRect(); const s = document.querySelector('[data-testid="bid-picker"]').getBoundingClientRect(); return { cb: c.bottom, ct: c.top, st: s.top, sy: window.scrollY, sh: document.documentElement.scrollHeight } }, id)))
async function shot(name) {
  const r = await P.evaluate((tid) => {
    const c = document.querySelector(`[data-testid="${tid}"]`).getBoundingClientRect()
    const s = document.querySelector('[data-testid="bid-picker"]').getBoundingClientRect()
    return { top: Math.max(0, c.top - 56), bottom: Math.min(874, s.bottom + 6) }
  }, id)
  await P.screenshot({ path: path.join(OUT, name), clip: { x: 0, y: r.top, width: 402, height: r.bottom - r.top } })
}
await shot('now.png')
/* the recommended design, laid on by hand */
const dates = []
for (let i = 0; i < 4; i++) { const d = new Date(day0 + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + i); dates.push(d.toISOString().slice(0, 10)) }
await P.evaluate(({ who, dates }) => {
  const sheet = document.querySelector('[data-testid="bid-picker"]')
  const whole = [...sheet.querySelectorAll('button')].find(x => x.textContent.trim() === 'Whole day')
  const am = [...sheet.querySelectorAll('button')].find(x => x.textContent.trim() === 'AM')
  const acts = sheet.querySelector('[data-testid="bid-actions"]')
  const row = document.createElement('div')
  row.className = acts.className.replace('bp-acts', '').trim()
  row.id = 'mockScope'
  row.style.cssText = 'display:flex;gap:8px;'
  const a = whole.cloneNode(true); a.textContent = 'All 4 days · 13–16 Apr'; a.style.flex = '1.6'; a.id = 'mAll'
  const c = am.cloneNode(true); c.textContent = 'Tue 13 only'; c.style.flex = '1'; c.id = 'mOne'
  row.append(a, c)
  acts.parentElement.insertBefore(row, acts)
  window.__mock = { whole: whole.className, plain: am.className, who, dates }
}, { who, dates })
async function mode(all) {
  await P.evaluate((all) => {
    const m = window.__mock
    document.getElementById('mAll').className = all ? m.whole : m.plain
    document.getElementById('mOne').className = all ? m.plain : m.whole
    document.querySelector('[data-testid="bid-picker"] .bidsheet-hd .dt').textContent = all ? '13 – 16 Apr' : 'Tue 13 Apr'
    m.dates.forEach((d, i) => document.querySelector(`[data-testid="cell-${m.who}-${d}"]`)?.classList.toggle('selcell', all || i === 0))
  }, all)
  await P.waitForTimeout(150)
  await clearRow()
}
await mode(true); await shot('rec-all.png')
await mode(false); await shot('rec-one.png')
await b.close()
console.log(problems ? `${problems} page errors` : 'no page errors')
