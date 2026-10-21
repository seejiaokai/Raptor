/* [ARROWS-STAY-PUT] (D1122) — every ‹ › pair around changing words, measured in the running app: the second arrow's
   left edge (and the first's) across the values the words take, pressed by the arrow itself. A pair is STILL when the
   arrow's left edge never moves by more than half a pixel. Desktop 1536 × 864 and his iPhone's 402 × 874 (touch).
   Run: HP_URL=http://localhost:<port> HP_SHOTS=<folder> node scripts/handpass/bsw-arrows.mjs  → <folder>/arrows/arrows.json */
console.log('bsw-arrows v1')
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, SHOTS, login, go } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const OUT = SHOTS + '/' + (process.env.ARROWS_DIR || 'arrows')
mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const sleep = ms => new Promise(r => setTimeout(r, ms))
const out = []
async function world(vp, touch) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
  await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
  const page = await ctx.newPage(); await page.goto(BASE + '/'); await login(page, 'a')
  return { ctx, page }
}
/* press `next` n times; after each, read the words and both arrows' left edges */
async function pair(page, name, prev, next, label, n, touch, shotSel) {
  const rows = []
  for (let i = 0; i <= n; i++) {
    const m = await page.evaluate(([p, nx, l]) => { const q = s => document.querySelector(s); const a = q(p), b = q(nx), t = q(l); return a && b ? { words: t ? t.textContent.trim() : '', prev: +a.getBoundingClientRect().left.toFixed(1), next: +b.getBoundingClientRect().left.toFixed(1) } : null }, [prev, next, label])
    if (!m) { rows.push({ missing: true }); break }
    rows.push(m)
    if (i === 0 && shotSel) { const b = await page.locator(shotSel).first().boundingBox(); if (b) await page.screenshot({ path: `${OUT}/${name}.png`, clip: { x: Math.max(0, b.x - 8), y: Math.max(0, b.y - 6), width: Math.min(b.width + 16, 700), height: b.height + 12 } }) }
    if (i < n) { const l = page.locator(next).first(); if (touch) await l.tap(); else await l.click(); await sleep(250) }
  }
  const nx = rows.filter(r => !r.missing).map(r => r.next), pv = rows.filter(r => !r.missing).map(r => r.prev)
  const spread = nx.length ? +(Math.max(...nx) - Math.min(...nx)).toFixed(1) : null
  const pspread = pv.length ? +(Math.max(...pv) - Math.min(...pv)).toFixed(1) : null
  const r = { name, still: spread != null && spread <= 0.5 && pspread <= 0.5, spread, pspread, rows }
  out.push(r); console.log(`${r.still ? 'STILL' : 'MOVES'} ${name}: › moved ${spread}px, ‹ ${pspread}px — ${rows.map(x => x.words).join(' | ').slice(0, 160)}`)
}
for (const [vp, touch, tag] of [[{ width: 1536, height: 864 }, false, 'pc'], [{ width: 402, height: 874 }, true, 'phone']]) {
  const { ctx, page } = await world(vp, touch)
  /* Edit Schedule's crew panel ‹ day › (desktop panel; the phone's drawer, opened) */
  await go(page, 'editsched'); await sleep(400)
  if (touch) { await page.locator('.edit-board .eroster .ros-tab').tap(); await sleep(300) }
  await page.evaluate(() => { const b = document.querySelector('.edit-board .eroster [data-crewstep="-1"]'); for (let i = 0; i < 7; i++) b && !b.disabled && b.click() }); await sleep(300)
  await pair(page, `${tag}-crew-day`, '.edit-board .eroster [data-crewstep="-1"]', '.edit-board .eroster [data-crewstep="1"]', '.edit-board .eroster .er-dayname', 6, touch, '.edit-board .eroster .er-h')
  if (touch) { await page.locator('.edit-board .eroster .ros-tab').tap(); await sleep(300) }
  /* the Inputs calendar ‹ month › — twelve months */
  await go(page, 'inputs'); await sleep(500)
  await pair(page, `${tag}-inputs-month`, '#icPrev', '#icNext', '.ic-mon', 12, touch, '.ic-nav')
  /* the SANS calendar ‹ month › */
  const sansTab = page.locator('#inSansMode').first()
  if (await sansTab.count()) { if (touch) await sansTab.tap(); else await sansTab.click(); await sleep(500)
    await pair(page, `${tag}-sans-month`, '[data-testid="sc-prev"]', '[data-testid="sc-next"]', '[data-testid="sc-month"]', 12, touch, '.sc-head') }
  await ctx.close()
}
writeFileSync(`${OUT}/arrows.json`, JSON.stringify(out, null, 1))
await browser.close()
