// The board layout's walk, the host's reproduction of walker A's point 1 (chat 11, 8 Nov 26): at 821 wide the RCP
// heading sat 5px right of the back seat's box. Prints, at each width, the two grids' columns and the heading-to-box
// offset of FCP and RCP. Run from raptor-port/ against a served build: `node scripts/handpass/bl-rcp821.mjs`.
import { chromium } from '@playwright/test'
import { existsSync } from 'node:fs'
const BASE = process.env.BASE || 'http://localhost:4180'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const br = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
for (const w of (process.env.WIDTHS || '821,822,830,840,874').split(',').map(Number)) {
  const ctx = await br.newContext({ viewport: { width: w, height: 900 } })
  const page = await ctx.newPage()
  await page.goto(BASE + '/')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
  await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached' })
  let l = page.locator('[data-page="editsched"]:visible')
  if (!(await l.count())) { await page.click('#burger'); await page.waitForTimeout(400); l = page.locator('[data-page="editsched"]:visible') }
  await l.first().click(); await page.waitForTimeout(800)
  await page.click('#eWeek .sb-open[data-sbday="0"]')
  await page.waitForSelector('#schedBoard'); await page.waitForTimeout(700)
  const r = await page.evaluate(() => {
    const h = document.querySelector('.schedboard .sb-lcols'), ln = document.querySelector('.schedboard .sb-line')
    const kids = el => [...el.children].filter(c => getComputedStyle(c).display !== 'none')
    const hk = kids(h), lk = kids(ln)
    const find = (arr, t) => arr.find(c => (c.textContent || '').trim() === t)
    const fh = find(hk, 'FCP'), rh = find(hk, 'RCP')
    const seats = lk.filter(c => c.querySelector('.puck,.sb-seat,[data-k]'))
    return {
      hcols: getComputedStyle(h).gridTemplateColumns, lcols: getComputedStyle(ln).gridTemplateColumns,
      hW: Math.round(h.getBoundingClientRect().width), lW: Math.round(ln.getBoundingClientRect().width),
      fcpHead: fh && Math.round(fh.getBoundingClientRect().left), rcpHead: rh && Math.round(rh.getBoundingClientRect().left),
      seats: [...ln.querySelectorAll('.sb-seatpair > *')].map(c => c.className.split(' ').slice(0,2).join('.') + '@' + Math.round(c.getBoundingClientRect().left) + 'w' + Math.round(c.getBoundingClientRect().width) + (c.offsetParent ? '' : '(np)')).join(' '),
      lineKids: lk.map(c => c.className.split(' ')[0] + '@' + Math.round(c.getBoundingClientRect().left) + 'w' + Math.round(c.getBoundingClientRect().width)).join(' '),
    }
  })
  console.log(w, JSON.stringify(r))
  await ctx.close()
}
await br.close()
