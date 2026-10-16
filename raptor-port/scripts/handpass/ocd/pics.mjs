/* PICTURES FOR HIS LOOK at [OIL-CONFIRM-DAYGRID] (17 Oct 26, D921): the built app, the place marked with a dashed orange
   box — the OIL question's "Only some days…" as the one calendar on his iPhone's size (390 × 844 at 3x) and a desktop's,
   and the count line whose words changed. usage: node scripts/handpass/ocd/pics.mjs (the served build, HP_URL) */
import { existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
const out = fileURLToPath(new URL('../../../docs/img/handpass/2026-10-17-oil-confirm-daygrid/look/', import.meta.url))
mkdirSync(out, { recursive: true })
const BASE = process.env.HP_URL || 'http://localhost:4173'
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
const errors = []
async function ask(size) {
  const ctx = await b.newContext({ baseURL: BASE, ...size })
  const p = await ctx.newPage()
  p.on('pageerror', e => errors.push(e.message))
  await p.goto('/?fresh=1'); await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await p.waitForTimeout(400)
  await p.evaluate(() => window.go('inputs')); await p.waitForFunction(() => window.CURPAGE === 'inputs'); await p.waitForTimeout(300)
  for (let i = 0; i < 40 && !(await p.locator('#inpCal [data-icday="2026-07-17"]').count()); i++) {
    const [name, year] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = 2026 * 12 + 6 - (+year * 12 + MONTHS.findIndex(x => name.startsWith(x)))
    await p.locator(d > 0 ? '#icNext' : '#icPrev').click()
  }
  await p.locator('#inpCal [data-icday="2026-07-17"]').focus()
  await p.keyboard.press('Shift+ArrowRight'); await p.keyboard.press('Shift+ArrowRight'); await p.keyboard.press('Enter')
  const win = '[data-testid="win-inputedit"]'
  await p.waitForSelector(`${win} #inpEditType`)
  await p.selectOption(`${win} #inpEditType`, 'Duty'); await p.fill(`${win} #inpEditOwnTitle`, 'Range weekend')
  await p.locator('#inpEditSave').click(); await p.waitForSelector('[data-testid="oilconf"]')
  await p.locator('[data-testid="oil-some"]').click(); await p.waitForSelector('[data-testid="oilcal"]'); await p.waitForTimeout(250)
  return { ctx, p }
}
const mark = (p, sel) => p.evaluate(sel => {
  document.querySelectorAll('[data-mock="marker"]').forEach(e => e.remove())
  const r = document.querySelector(sel).getBoundingClientRect()
  const m = document.createElement('div'); m.setAttribute('data-mock', 'marker')
  m.style.cssText = `position:fixed;left:${r.left - 5}px;top:${r.top - 5}px;width:${r.width + 10}px;height:${r.height + 10}px;border:2px dashed #ff8a1c;border-radius:10px;pointer-events:none;z-index:2147483647`
  document.body.appendChild(m)
}, sel)
const phone = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 }
{
  const { ctx, p } = await ask(phone)
  await mark(p, '[data-testid="oil-count"]')
  await p.screenshot({ path: out + '1-phone-empty-count-line.png' })
  await p.locator('[data-testid="oilcal-day-2026-07-18"]').tap(); await p.waitForTimeout(150)
  await mark(p, '[data-testid="oilcal"]')
  await p.screenshot({ path: out + '2-phone-saturday-on.png' })
  await ctx.close()
}
{
  const { ctx, p } = await ask({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
  await p.locator('[data-testid="oilcal-day-2026-07-18"]').click(); await p.waitForTimeout(150)
  await mark(p, '[data-testid="oilcal"]')
  await p.screenshot({ path: out + '3-desktop-saturday-on.png' })
  await ctx.close()
}
console.log(JSON.stringify({ errors, out }))
await b.close()
