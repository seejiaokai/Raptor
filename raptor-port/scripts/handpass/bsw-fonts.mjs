/* [ARROWS-STAY-PUT] (D1122) — the three labels sized by the real font (data-fit): run HP_URL=http://localhost:<port> HP_SHOTS=<folder> [FONT=Verdana] node scripts/handpass/bsw-fonts.mjs.
   The three labels measured under a forced font (FONT env: '' = the app's own; 'Verdana' = a much wider stand-in for
   GitHub's Linux letters). For each: the › arrow's left edge across the values (still = spread <= 0.5px), plus
   whether the Inputs tools row holds one line at 1440 and the board's day strip one line at 1024. */
import { existsSync, mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, SHOTS, login, go } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const FONT = process.env.FONT || ''
const OUT = SHOTS + '/fonts'; mkdirSync(OUT, { recursive: true })
const tag = FONT ? FONT.toLowerCase() : 'own'
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const sleep = ms => new Promise(r => setTimeout(r, ms))
async function world(vp) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2 })
  await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
  if (FONT) await ctx.addInitScript(f => { document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = `html *, html *::after { font-family: ${f} !important }`; document.head.appendChild(s) }) }, FONT)
  const page = await ctx.newPage(); await page.goto(BASE + '/'); await login(page, 'a')
  return { ctx, page }
}
const edge = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); return e ? +e.getBoundingClientRect().left.toFixed(1) : null }, sel)
async function run(page, name, next, label, n) {
  const xs = [], words = []
  for (let i = 0; i <= n; i++) {
    xs.push(await edge(page, next)); words.push(await page.evaluate(s => document.querySelector(s)?.textContent.trim(), label))
    if (i < n) { await page.locator(next).first().click(); await sleep(220) }
  }
  const spread = +(Math.max(...xs) - Math.min(...xs)).toFixed(1)
  console.log(`${spread <= 0.5 ? 'STILL' : 'MOVES'} [${tag}] ${name}: › moved ${spread}px — ${words.slice(0, 13).join(' | ')}`)
}
{ const { ctx, page } = await world({ width: 1440, height: 900 })
  await go(page, 'inputs'); await sleep(600)
  const row = await page.evaluate(() => { const r = document.querySelector('.inputs-top'); const kids = [...r.querySelectorAll(':scope > *, .ic-nav > *')].filter(e => e.offsetParent); const tops = new Set(kids.map(e => Math.round(e.getBoundingClientRect().top))); return { lines: tops.size, h: Math.round(r.getBoundingClientRect().height), mon: Math.round(document.querySelector('.ic-mon').getBoundingClientRect().width) } })
  console.log(`[${tag}] inputs row at 1440: ${JSON.stringify(row)}`)
  await page.screenshot({ path: `${OUT}/${tag}-inputs-1440.png`, clip: { x: 0, y: 0, width: 1440, height: 160 } })
  await run(page, 'inputs month 1440', '#icNext', '.ic-mon', 13)
  const sansTab = page.locator('#inSansMode').first(); await sansTab.click(); await sleep(500)
  const sw = await page.evaluate(() => Math.round(document.querySelector('[data-testid="sc-month"]').getBoundingClientRect().width))
  console.log(`[${tag}] sans month width ${sw}`)
  await page.screenshot({ path: `${OUT}/${tag}-sans-1440.png`, clip: { x: 0, y: 0, width: 1440, height: 160 } })
  await run(page, 'sans month 1440', '[data-testid="sc-next"]', '[data-testid="sc-month"]', 13)
  await ctx.close() }
for (const w of [1440, 1024]) {
  const { ctx, page } = await world({ width: w, height: 864 })
  await go(page, 'editsched'); await page.locator('#eWeek [data-sbday="0"]:visible').first().click(); await page.waitForSelector('#schedBoard'); await sleep(500)
  const strip = await page.evaluate(() => { const ks = [...document.querySelectorAll('#sbDays .sbday')]; return { lines: new Set(ks.map(e => Math.round(e.getBoundingClientRect().top))).size, chips: ks.filter(e => e.dataset.sbtab).map(e => Math.round(e.getBoundingClientRect().width)) } })
  console.log(`[${tag}] board strip at ${w}: ${JSON.stringify(strip)}`)
  await page.screenshot({ path: `${OUT}/${tag}-board-${w}.png`, clip: { x: 0, y: 0, width: w, height: 120 } })
  await run(page, `board week › ${w}`, '#schedBoard [data-sbweek="1"]', '#schedBoard .sbday.on', 8)
  await ctx.close()
}
await browser.close()
