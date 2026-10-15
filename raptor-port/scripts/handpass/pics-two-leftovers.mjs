/* PICTURES of the two leftovers of calendar step two, for him to place (15 Oct 26) — the app as it is, the place marked,
   nothing drawn in: [TRK-REORDER-FINGER-DRAG] (the Tracker's ⇅ Reorder window — its ▲ ▼ are a phone's only way to move a
   row) and [OIL-CONFIRM-DAYGRID] (the OIL question's "Only some days…" grid — its own small month, not the app's one
   calendar), each on his phone's size, 390 x 844 at 3x; the one calendar opened beside the OIL grid for comparison.
   usage: node scripts/handpass/pics-two-leftovers.mjs [baseURL] [outDir] — the served build (preview_start raptor-walk) */
import { createRequire } from 'node:module'
import { existsSync, mkdirSync } from 'node:fs'
const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const base = process.argv[2] || 'http://localhost:4173'
const out = process.argv[3] || 'docs/img/handpass/2026-10-15-two-leftovers'
mkdirSync(out, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
const errors = []
async function signedIn() {
  const ctx = await b.newContext({ baseURL: base, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 })
  const p = await ctx.newPage()
  p.on('pageerror', e => errors.push(e.message))
  await p.goto('/'); await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await p.waitForTimeout(400)
  return { ctx, p }
}
const mark = (p, sel) => p.evaluate(sel => {
  document.querySelectorAll('[data-mock="marker"]').forEach(e => e.remove())
  const els = [...document.querySelectorAll(sel)]
  if (!els.length) throw new Error('premise gone: ' + sel)
  const rs = els.map(e => e.getBoundingClientRect())
  const l = Math.min(...rs.map(r => r.left)) - 4, t = Math.min(...rs.map(r => r.top)) - 4
  const r = Math.max(...rs.map(r => r.right)) + 4, bt = Math.max(...rs.map(r => r.bottom)) + 4
  const m = document.createElement('div'); m.setAttribute('data-mock', 'marker')
  m.style.cssText = `position:fixed;left:${l}px;top:${t}px;width:${r - l}px;height:${bt - t}px;border:2px dashed #ff8a1c;border-radius:8px;pointer-events:none;z-index:2147483647`
  document.body.appendChild(m)
}, sel)

/* 1 — the Tracker's ⇅ Reorder syllabi window (the syllabus ✎ menu → ⇅ Reorder syllabi) */
{
  const { ctx, p } = await signedIn()
  await p.evaluate(() => window.go('tracker')); await p.waitForTimeout(800)
  await p.locator('#sylMenuBtn').click(); await p.waitForTimeout(200)
  await p.locator('#ordSyl').click(); await p.waitForSelector('#ordModal #ordList .ordrow'); await p.waitForTimeout(300)
  await mark(p, '#ordList .ordrow button[title="Move up"], #ordList .ordrow button[title="Move down"]')
  await p.screenshot({ path: `${out}/1-tracker-reorder-phone.png` })
  await ctx.close()
}
/* 2 — the OIL question's "Only some days…" grid: a Duty over Sat 17 – Sun 18 Oct filed from the Inputs calendar */
{
  const { ctx, p } = await signedIn()
  await p.evaluate(() => window.go('inputs')); await p.waitForFunction(() => window.CURPAGE === 'inputs'); await p.waitForTimeout(400)
  for (let i = 0; i < 40; i++) {
    const [name, year] = (await p.locator('#inpCal .ic-mon').innerText()).trim().toLowerCase().split(/\s+/)
    const d = 2026 * 12 + 9 - (+year * 12 + MONTHS.findIndex(x => name.startsWith(x)))
    if (!d) break
    await p.locator(d > 0 ? '#icNext' : '#icPrev').click()
  }
  await p.locator('#inpCal [data-icday="2026-10-17"]').focus()
  await p.keyboard.press('Shift+ArrowRight'); await p.waitForTimeout(150); await p.keyboard.press('Enter')
  const win = '[data-testid="win-inputedit"]'
  await p.waitForSelector(win + ' #inpEditType')
  await p.selectOption(win + ' #inpEditType', 'Duty'); await p.waitForTimeout(250)
  await p.screenshot({ path: `${out}/2a-the-one-calendar-phone.png` })
  await p.locator(win + ' button.primary').last().click()
  await p.waitForSelector('[data-testid="oilconf"]'); await p.waitForTimeout(250)
  await p.locator('[data-testid="oil-some"]').click(); await p.waitForSelector('[data-testid="oilcal"]'); await p.waitForTimeout(250)
  await mark(p, '[data-testid="oilcal"]')
  await p.screenshot({ path: `${out}/2b-oil-some-days-phone.png` })
  await ctx.close()
}
console.log(JSON.stringify({ errors }))
await b.close()
