// [LW-PHONE-AWAY-ROW-MISSING] reproduction — the night of 21 Oct 26 (job 2, the Leave War small fixes). VERSION 1
// A man added on Admin → Users with a post-in ten days on, archived the same day, restored with a post-in three weeks
// on: is his row on the Leave War — on a phone (390 × 844) and a desktop (1400 × 900)? Run: node lws-repro6.mjs phone|desktop
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
const WHICH = process.argv[2] || 'phone'
const URL0 = process.env.HP_URL || 'http://localhost:4292/'
const SHOTS = process.env.HP_SHOTS || '.'
mkdirSync(SHOTS, { recursive: true })
const [W, H, TOUCH] = WHICH === 'phone' ? [390, 844, true] : [1400, 900, false]
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: TOUCH, hasTouch: TOUCH })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', e => errors.push('pageerror ' + String(e).slice(0, 200)))
page.on('console', m => { if (m.type() === 'error') errors.push('console ' + m.text().slice(0, 200)) })
await page.goto(URL0 + '?fresh=1')
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
await page.waitForSelector('#vWeek .day', { state: 'attached' })
await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
const press = async sel => { const l = page.locator(sel).first(); if (TOUCH) await l.tap(); else await l.click(); await page.waitForTimeout(260) }
const addDays = n => { const d = new Date(); const u = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate() + n)); return u.toISOString().slice(0, 10) }
const pick = async iso => {
  for (let i = 0; i < 3 && !(await page.locator(`[data-testid="dcal-day-${iso}"]`).count()); i++) await press('[data-testid="dcal-next"]')
  await press(`[data-testid="dcal-day-${iso}"]`)
}
const admin = async () => {
  await page.evaluate(() => window.go('admin')); await page.waitForTimeout(400)
  await page.evaluate(() => { const b = [...document.querySelectorAll('#page-admin button')].find(b => b.getBoundingClientRect().width > 0 && /^Users/.test(b.textContent.trim())); if (b) b.click() })
  await page.waitForTimeout(350)
}
const CS = 'Probey'
const PI1 = addDays(10), PI2 = addDays(21)
const look = async (label, month) => {
  await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(900)
  await press(`[data-testid="month-${month}"]`); await page.waitForTimeout(900)
  const rows = await page.locator('tr[data-testid^="row-"]').count()
  const mine = await page.evaluate(c => [...document.querySelectorAll('tr[data-testid^="row-"] span.cs')].filter(x => x.textContent.trim() === c).map(x => x.closest('tr').getAttribute('data-testid')), CS)
  console.log(`${WHICH} ${label} ${month}: person rows ${rows}; his row ${JSON.stringify(mine)}`)
  return mine
}
await admin()
await page.locator('#accAddPostIn').scrollIntoViewIfNeeded()
await page.fill('#accAddCs', CS); await page.fill('#accAddIni', 'PB')
await page.selectOption('#accAddSeat', 'FCP'); await page.selectOption('#accAddCat', 'C')
await press('#accAddPostIn'); await pick(PI1)
await press('#accAdd'); await page.waitForTimeout(500)
await look('after add, post-in ' + PI1, 'OCT')
await admin()
await page.fill('#accFind', CS); await page.waitForTimeout(300)
await press(`#accList .acc-main:has-text("${CS}")`); await press('#accEdArchive'); await page.waitForTimeout(500)
await page.fill('#accFind', '')
if ((await page.locator('#accArchToggle').getAttribute('aria-expanded')) !== 'true') await press('#accArchToggle')
await press(`#accArchList .acc-main:has-text("${CS}")`)
await press('#accArPostIn'); await pick(PI2)
await press('#accArRestore'); await page.waitForTimeout(700)
const id = await page.evaluate(c => Object.entries(window.PEOPLE).find(([k, v]) => v.cs === c)?.[0], CS)
console.log('his id', id, 'PEOPLE body', JSON.stringify(await page.evaluate(i => window.PEOPLE[i], id)))
const prof = await page.evaluate(i => Object.keys(localStorage).filter(k => k.includes(i)).map(k => k + ' = ' + localStorage.getItem(k).slice(0, 300)), id)
console.log('stored rows naming him', JSON.stringify(prof, null, 1))
const oct = await look('after restore, post-in ' + PI2, 'OCT')
const nov = await look('after restore, post-in ' + PI2, 'NOV')
await page.screenshot({ path: join(SHOTS, `${WHICH}-repro6-nov.png`) })
if (process.env.PROBE) {
  await page.evaluate(() => { const w = document.querySelector('.mx-wrap'); if (w) w.scrollLeft += 60 }); await page.waitForTimeout(800)
  console.log('after a small scroll:', await page.locator('tr[data-testid^="row-"]').count())
  await press('[data-testid="month-DEC"]'); await page.waitForTimeout(900); await press('[data-testid="month-NOV"]'); await page.waitForTimeout(900)
  console.log('after DEC and back to NOV:', await page.locator('tr[data-testid^="row-"]').count())
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(500); await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(900)
  console.log('after leaving and coming back:', await page.locator('tr[data-testid^="row-"]').count())
  await page.reload(); await page.waitForTimeout(500)
}
console.log('errors', JSON.stringify(errors))
await browser.close()
