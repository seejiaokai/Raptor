// Admin → Users' side-by-side fields (`.adm-2col`) — each pair's two boxes measured: one height and one line (his lesson 43,
// D1279), at his iPhone's 402 × 874 (WebKit, touch), a narrow 375 and his PC's 1536. His find, 5 Nov 26 (iPhone picture): "Add a
// person" — "PILOT, WSO OR PERSONNEL" broke onto two lines and its box stood lower than CAT's beside it.
// The pairs reached through the app's own controls: Add a person (always there), and a row's editor (Hex's sign-in and role).
// Usage (from raptor-port/): WALK_DIR=<built dist> [AP_OUT=<folder>] node scripts/handpass/adm-pairs-measure.mjs
import { chromium, webkit } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { serveFrozen } from './isr-serve.mjs'

const OUT = process.env.AP_OUT || 'docs/img/handpass/2026-11-05-adm-pairs'
mkdirSync(OUT, { recursive: true })
const URL = 'http://localhost:4395/'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const SIZES = {
  phone: { engine: webkit, opts: { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true } },
  narrow: { engine: webkit, opts: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true } },
  desk: { engine: chromium, opts: { viewport: { width: 1536, height: 864 } } },
}
const rows = []
let bad = 0
for (const [size, s] of Object.entries(SIZES)) {
  const b = await s.engine.launch()
  const ctx = await b.newContext({ ...s.opts, deviceScaleFactor: 2 })
  await serveFrozen(ctx, URL)
  const page = await ctx.newPage()
  await page.goto(URL)
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#vWeek .day', { state: 'attached', timeout: 20000 }); await sleep(800)
  await page.evaluate(() => window.go('admin')); await sleep(600)
  const users = page.locator('.adm-cat').filter({ hasText: 'Users' }).first()
  if (await users.count()) { await users.click(); await sleep(500) }
  await page.locator('#page-admin .acc-row[data-person="rocky"] .acc-tap').click(); await sleep(400)
  const pairs = await page.evaluate(() => [...document.querySelectorAll('#page-admin .adm-2col')].filter(r => r.getBoundingClientRect().height > 0).map(r => {
    const f = [...r.children].filter(c => c.getBoundingClientRect().height > 0)
    const box = c => { const ctl = c.querySelector('input, select, button, [role="button"], .datebox') || c.lastElementChild; const q = ctl.getBoundingClientRect(); return { label: (c.querySelector('label')?.textContent || '').trim(), top: Math.round(q.top), h: Math.round(q.height) } }
    return f.map(box)
  }))
  for (const p of pairs) {
    if (p.length !== 2) continue
    const ok = Math.abs(p[0].top - p[1].top) <= 1 && Math.abs(p[0].h - p[1].h) <= 1
    if (!ok) bad++
    rows.push({ size, ok, a: p[0], b: p[1] })
    console.log(`${ok ? 'PASS' : 'FAIL'} [${size}] "${p[0].label}" top ${p[0].top} h ${p[0].h}  |  "${p[1].label}" top ${p[1].top} h ${p[1].h}`)
  }
  const add = page.locator('#accAddBlock')
  await add.scrollIntoViewIfNeeded(); await sleep(300)
  await add.screenshot({ path: join(OUT, `add-a-person-${size}.png`) })
  await b.close()
}
writeFileSync(join(OUT, 'measure.json'), JSON.stringify(rows, null, 2))
console.log(`${rows.length - bad}/${rows.length} pairs level`)
process.exit(bad ? 1 : 0)
