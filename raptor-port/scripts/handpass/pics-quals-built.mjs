/* PICTURES for his look at Quals' one row as BUILT ([GUIDE-ONE-ROW], D935, 16 Oct 26), the place talked about marked
   (D853, D921) — on the served build: the row at his phone's size (390, 3x) not editing and with Edit quals on, and a
   desktop's; then the two things put to him with it: (1) at the narrowest phones (320) while editing, the filter left
   with no room to type; (2) arriving at Quals on a phone from the schedule, the page lands scrolled and the row is
   above the screen (an older behaviour, not this change's). Nothing typed in, nothing changed but the scroll a person
   would make. usage: node scripts/handpass/pics-quals-built.mjs [baseURL] [outDir] */
import { createRequire } from 'node:module'
import { existsSync, mkdirSync } from 'node:fs'
const require = createRequire(import.meta.url)
const { chromium } = require('playwright')
const base = process.argv[2] || 'http://localhost:4173'
const out = process.argv[3] || 'docs/img/handpass/2026-10-16-quals-one-row/look'
mkdirSync(out, { recursive: true })
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
const b = await chromium.launch(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
const phone = w => ({ viewport: { width: w, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3 })
async function open(dev, top = true) {
  const ctx = await b.newContext({ baseURL: base, ...dev }), p = await ctx.newPage()
  await p.goto('/?fresh=1'); await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached' }); await p.waitForTimeout(800)
  if (dev.isMobile) { await p.tap('#burger'); await p.waitForTimeout(300); await p.getByText('Quals', { exact: true }).locator('visible=true').first().tap() }
  else await p.click('.nav a[data-page="quals"]')
  await p.waitForSelector('#qtbl td.qname'); await p.waitForTimeout(300)
  if (top) { await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(150) }
  return { ctx, p }
}
const mark = (p, sel, pad = 3) => p.evaluate(([sel, pad]) => {
  document.querySelectorAll('[data-mock="marker"]').forEach(e => e.remove())
  const r = typeof sel === 'string' ? document.querySelector(sel).getBoundingClientRect() : sel
  const m = document.createElement('div'); m.setAttribute('data-mock', 'marker')
  m.style.cssText = `position:fixed;left:${r.left - pad}px;top:${r.top - pad}px;width:${r.width + 2 * pad}px;height:${r.height + 2 * pad}px;border:2px dashed #ff8a1c;border-radius:9px;pointer-events:none;z-index:2147483647`
  document.body.appendChild(m)
}, [sel, pad])
const clip = (p, h) => ({ x: 0, y: 0, width: p.viewportSize().width, height: h })

let { ctx, p } = await open(phone(390))
await mark(p, '.qbar'); await p.screenshot({ path: `${out}/a-phone-row.png`, clip: clip(p, 330) })
await p.tap('#qEdit'); await p.waitForTimeout(150); await p.tap('#qEditQuals'); await p.waitForTimeout(200)
await mark(p, '.qbar'); await p.screenshot({ path: `${out}/b-phone-editquals.png`, clip: clip(p, 330) })
await ctx.close()
;({ ctx, p } = await open({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 }))
await mark(p, '.qbar'); await p.screenshot({ path: `${out}/c-desk-row.png`, clip: clip(p, 330) })
await ctx.close()
;({ ctx, p } = await open(phone(320)))
await p.tap('#qEdit'); await p.waitForTimeout(150); await p.tap('#qEditQuals'); await p.waitForTimeout(200)
await mark(p, '.qbar .searchbox'); await p.screenshot({ path: `${out}/q1-narrow-filter.png`, clip: clip(p, 330) })
await ctx.close()
;({ ctx, p } = await open(phone(390), false))
const y = await p.evaluate(() => scrollY)
const head = await p.evaluate(() => { const t = document.querySelector('.topbar') || document.querySelector('header'); const r = t.getBoundingClientRect(); return { left: 8, top: r.bottom + 4, width: innerWidth - 16, height: 40 } })
await mark(p, head, 0); await p.screenshot({ path: `${out}/q2-arrives-scrolled.png`, clip: clip(p, 520) })
console.log('arrived scrolled by', y)
await ctx.close(); await b.close()
