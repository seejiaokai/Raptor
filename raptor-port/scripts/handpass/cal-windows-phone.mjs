/* A LOOK, not a gate (9 Oct 26 — his question from his iPhone, with the SANS settings window two-thirds high: "Why is
   this not full screen height … check what else that opens a window that is not full screen on a phone"). Opens every
   window of the Inputs / SANS calendar job on a phone and prints where it sits: its top, its height as a share of the
   screen, and whether what is in it is taller than it (so it must be scrolled). Saves a picture of each.
   Run against a served build:  node scripts/handpass/cal-windows-phone.mjs [outDir] [height] */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
const CHROMIUM = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
const out = process.argv[2] || 'docs/img/handpass/2026-10-09-cal-windows', H = +(process.argv[3] || 844), W = 390
mkdirSync(out, { recursive: true })
const browser = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const M = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
async function open() {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
  const page = await ctx.newPage()
  await page.goto('http://localhost:4180/?fresh=1')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day')
  await page.evaluate(() => window.go('inputs')); await page.waitForSelector('#inpCal')
  return { ctx, page }
}
async function july(page, label, prev, next) {
  for (let i = 0; i < 40; i++) {
    const [name, year] = (await page.locator(label).innerText()).trim().toLowerCase().split(/\s+/)
    const d = 2026 * 12 + 6 - (+year * 12 + M.findIndex(x => name.startsWith(x)))
    if (!d) return
    await page.locator(d > 0 ? next : prev).click()
  }
}
let n = 0
async function say(page, name, testid) {
  await page.waitForSelector(`[data-testid="${testid}"]`); await page.waitForTimeout(450)
  const r = await page.evaluate(id => {
    const w = document.querySelector(`[data-testid="${id}"]`), b = w.getBoundingClientRect(), vh = window.innerHeight
    const scrollers = [w, ...w.querySelectorAll('*')].filter(e => { const o = getComputedStyle(e).overflowY; return (o === 'auto' || o === 'scroll') && e.scrollHeight > e.clientHeight + 2 })
    return { top: Math.round(b.top), h: Math.round(b.height), share: Math.round(b.height / vh * 100), gapBelow: Math.round(vh - b.bottom), scrolls: scrollers.length ? Math.max(...scrollers.map(e => e.scrollHeight - e.clientHeight)) : 0 }
  }, testid)
  console.log(`${name.padEnd(34)} top ${String(r.top).padStart(3)} · ${String(r.h).padStart(3)} tall = ${r.share}% of the screen · ${r.scrolls ? 'its content is ' + r.scrolls + ' taller than it (scrolls)' : 'all of it shows'}`)
  await page.screenshot({ path: `${out}/${String(++n).padStart(2, '0')}-${name.replace(/[^a-z]+/gi, '-').toLowerCase()}.png` })
}
const shut = async page => { await page.locator('.floatwin.front .win-x, .floatwin .win-x').last().tap(); await page.waitForTimeout(250) }

{ const { ctx, page } = await open(); await july(page, '#inpCal .ic-mon', '#icPrev', '#icNext')
  await page.locator('#inpCal [data-icday="2026-07-16"]').tap({ position: { x: 10, y: 10 } }); await say(page, 'Inputs: a day opened', 'win-inputsday')
  await page.locator('#icPopAdd').tap(); await say(page, 'Inputs: New input', 'win-inputedit'); await ctx.close() }
{ const { ctx, page } = await open()
  await page.locator('#inGear').tap(); await say(page, 'Inputs calendar settings', 'win-inputsset'); await ctx.close() }
{ const { ctx, page } = await open(); await page.locator('#inSansMode').tap(); await page.waitForSelector('[data-testid="sanscal"]')
  await july(page, '[data-testid="sc-month"]', '[data-testid="sc-prev"]', '[data-testid="sc-next"]')
  await page.locator('[data-testid="sanscal"] [data-icday="2026-07-16"], [data-testid="sanscal"] [data-scday="2026-07-16"], [data-testid="sc-day-2026-07-16"]').first().tap({ position: { x: 10, y: 10 } })
  await say(page, 'SANS: a day opened', 'win-sansday')
  await page.locator('[data-testid="sd-add"]').tap(); await say(page, 'SANS: New commitment', 'win-inputedit'); await ctx.close() }
{ const { ctx, page } = await open(); await page.locator('#inSansMode').tap(); await page.waitForSelector('[data-testid="sanscal"]')
  await page.locator('[data-testid="sc-gear"]').tap(); await say(page, 'SANS calendar settings', 'win-sansset')
  await page.locator('[data-testid="win-sansset"] button', { hasText: 'Calendar' }).first().tap(); await say(page, 'Calendar (day / night / no fly)', 'win-days')
  await page.locator('[data-testid="days-wd-3"]').tap(); await say(page, 'Calendar: Every Thursday', 'win-every'); await shut(page)
  const tab = page.locator('[data-testid="days-tabs"] button', { hasText: /holiday/i }); if (await tab.count()) await tab.first().tap()
  await page.locator('[data-testid="hol-add"]').tap(); await say(page, 'Calendar: Add a holiday', 'win-holiday'); await ctx.close() }
await browser.close()
