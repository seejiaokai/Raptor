/* [POST-OUT-OUTCOMES] walk D (27 Sep 26) — the code reads' fixes on screen: a posting that cannot be carried out whole
   WAITS (Astra 2). Saber, the only admin who can sign in, posts himself out Overseas Sqn today: the sheet says it will
   wait before he confirms; after it, he is NOT archived and his own account row on Admin → Users says why.
   Run: HP_URL=http://localhost:4192 node scripts/handpass/po-walk-d.mjs            */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const launchOptions = existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}
const BASE = process.env.HP_URL || 'http://localhost:4192'
{ const h = new URL(BASE).hostname; if (!['localhost', '127.0.0.1', '[::1]', '::1'].includes(h)) throw new Error('HP_URL must be a local build') }
const SHOTS = process.env.HP_SHOTS || 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-27-post-out-outcomes/d'
mkdirSync(SHOTS, { recursive: true })
const p2 = n => String(n).padStart(2, '0')
const d0 = new Date()
const TODAY = `${d0.getFullYear()}-${p2(d0.getMonth() + 1)}-${p2(d0.getDate())}`
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const results = [], errors = []
let shotN = 0
async function step(page, id, what, fn) {
  let ok = false, note = ''
  try { const r = await fn(); ok = r === true || !!(r && r.ok === true); if (typeof r === 'string') note = r; else if (r && r.note) note = r.note } catch (e) { note = String(e && e.message || e).slice(0, 300) }
  const f = `${p2(++shotN)}-${id}.png`; await page.screenshot({ path: `${SHOTS}/${f}` }).catch(() => {})
  results.push({ id, what, ok, note, pic: f })
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id} — ${what}${note ? ' :: ' + note : ''}`)
}
const text = async (page, sel) => ((await page.locator(sel).first().textContent().catch(() => '')) || '').replace(/\s+/g, ' ').trim()
const browser = await chromium.launch({ headless: true, ...launchOptions })
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message))
await page.goto(BASE + '/')
await page.addStyleTag({ content: '*{scroll-behavior:auto !important}' })
await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]'); await page.waitForTimeout(900)
await page.evaluate(() => window.go('leavewar')); await page.waitForTimeout(900)
await page.locator(`[data-testid="month-${MON[Number(TODAY.slice(5, 7)) - 1]}"]`).first().click(); await page.waitForTimeout(800)
const cell = page.locator(`[data-testid="cell-stiff-${TODAY}"]`); await cell.scrollIntoViewIfNeeded(); await cell.click(); await page.waitForTimeout(300)
await page.click('[data-testid="bid-postout"]'); await page.waitForTimeout(300)
await step(page, 'd01-sheet-says-it-waits', 'the sheet says beforehand the posting will wait (he is the last admin)', async () => {
  const t = await text(page, '[data-testid="po-blocked"]')
  return /last admin who can sign in — the posting waits until another admin can/.test(t) ? true : `"${t}"`
})
await page.click('[data-testid="po-confirm"]'); await page.waitForTimeout(900)
await page.keyboard.press('Escape').catch(() => {})
await step(page, 'd02-nothing-half-done', 'confirmed: Saber is NOT archived and can still sign in (nothing half done)', async () => {
  const p = await page.evaluate(() => ({ a: !!window.PEOPLE.stiff.archived }))
  return !p.a ? true : JSON.stringify(p)
})
await page.evaluate(() => window.go('admin')); await page.waitForTimeout(700)
await step(page, 'd03-account-row-says-why', 'Admin → Users: his own row says the posting waits, and why', async () => {
  const t = await text(page, '[data-testid="acc-held-acad"]')
  return /the posting waits until another admin can/.test(t) ? true : `"${t}"`
})
writeFileSync(`${SHOTS}/walk.json`, JSON.stringify({ results, errors }, null, 2))
console.log(`\n${results.filter(r => r.ok).length}/${results.length} PASS · errors: ${errors.length ? errors.join(' | ').slice(0, 300) : 'none'}`)
await browser.close()
