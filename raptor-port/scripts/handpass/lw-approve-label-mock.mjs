// His question of 28 Oct 26: a shorter way to write "Approve what I enter" (the admin's switch in the bid window's title bar,
// D1147, D1187, D1302) with the same meaning. Drawn on the real app: the admin's bid window on an empty weekday, the title
// bar cropped, the switch's words replaced by hand for each option. WebKit at his iPhone's 402 x 874 and Chromium at his
// PC's 1536 x 730 at 1.25. Nothing in the app changes.
// Run from raptor-port/ against the build served on PORT (default 4173): node scripts/handpass/lw-approve-label-mock.mjs
import { webkit, chromium, devices } from '@playwright/test'
import path from 'node:path'
import { mkdirSync } from 'node:fs'
const PORT = process.env.PORT || 4173
const OUT = path.resolve('docs/img/handpass/2026-10-28-lw-approve-label')
mkdirSync(OUT, { recursive: true })
const OPTIONS = [['now', null], ['a', 'Auto-approve'], ['b', 'Approve on entry'], ['c', 'Approve as I add']]
let problems = 0
async function run(name, launcher, opts) {
  const b = await launcher.launch()
  const P = await (await b.newContext(opts)).newPage()
  P.on('pageerror', e => { problems++; console.log(name, 'page error: ' + String(e).slice(0, 160)) })
  await P.goto(`http://localhost:${PORT}/?fresh=1`); await P.waitForSelector('#luser')
  await P.fill('#luser', 'ad'); await P.fill('#lpass', 'a'); await P.click('#loginForm button[type=submit]')
  await P.waitForSelector('#vWeek .day', { state: 'attached' })
  await P.evaluate(() => window.go('leavewar')); await P.waitForSelector('[data-testid="lw-tab-approvals"]')
  await P.waitForTimeout(1500)
  const tid = await P.evaluate(() => {
    const row = [...document.querySelectorAll('#page-leavewar tr[data-testid^="row-"]')].find(r => /^Ran/.test(r.querySelector('.who')?.textContent?.trim() || ''))
    const w = document.querySelector('#page-leavewar .mx-wrap').getBoundingClientRect()
    const cells = [...row.querySelectorAll('td[data-testid^="cell-"]')].filter(c => { const r = c.getBoundingClientRect(); return r.left > w.left + 140 && r.right < innerWidth - 10 && !c.className.includes('weekend') && !c.textContent.trim() })
    return cells[2]?.dataset.testid
  })
  await P.click(`[data-testid="${tid}"]`)
  await P.waitForSelector('[data-testid="bid-picker"]'); await P.waitForTimeout(500)
  for (const [key, words] of OPTIONS) {
    if (words) await P.evaluate((w) => {
      const sw = document.querySelector('[data-testid="bid-approve-tick"]')
      const t = [...sw.childNodes].filter(n => n.nodeType === 3).pop(); t.textContent = w
    }, words)
    await P.waitForTimeout(150)
    const r = await P.evaluate(() => {
      const s = document.querySelector('[data-testid="bid-picker"]').getBoundingClientRect()
      const sw = document.querySelector('[data-testid="bid-approve-tick"]').getBoundingClientRect()
      return { x: s.left, y: s.top, w: s.width, h: Math.min(s.height, sw.bottom - s.top + 60) }
    })
    await P.screenshot({ path: path.join(OUT, `${name}-${key}.png`), clip: { x: r.x, y: r.y, width: r.w, height: r.h } })
    const fit = await P.evaluate(() => { const sw = document.querySelector('[data-testid="bid-approve-tick"]'); return sw.scrollWidth <= sw.clientWidth + 1 && sw.getBoundingClientRect().height < 40 })
    console.log(name, key, words || '(as built)', fit ? 'one line' : 'WRAPS')
  }
  await b.close()
}
await run('phone', webkit, { ...devices['iPhone 13'], viewport: { width: 402, height: 874 }, deviceScaleFactor: 3 })
await run('desk', chromium, { viewport: { width: 1536, height: 730 }, deviceScaleFactor: 1.25 })
console.log(problems ? `${problems} page errors` : 'no page errors')
