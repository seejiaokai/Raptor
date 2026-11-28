// Chat A213 — pull request 850's build for GitHub Pages (Vite base /Raptor/, his D2832, D2839) checked served under
// /Raptor/: the page loads, no file missing (no 4xx), no page or console error, he can sign in at his PC's size and his
// iPhone's, Edit Schedule's Legend carries this branch's amber "A" line (D2583). Where the page is a LOCAL build (the
// probe bridge installs only on localhost), it also stages one case and pictures it for his look: Jester (a SANS pilot
// with nothing filed for Mon 13 Jul) put on OFT EP-6 15:00–16:30's rear seat — the board's warning list must read
// "Jester — SANS: no availability filed for today. Planned on OFT EP-6 15:00–16:30" (D2754).
// Run: node scripts/handpass/sans-pages-check.mjs <base url ending /Raptor/> [picture folder]
import { chromium, webkit } from '@playwright/test'
import { existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
const CHROMIUM = process.env.CHROMIUM_PATH || ''
const url = process.argv[2]
const SHOTS = process.argv[3] || ''
if (SHOTS) mkdirSync(SHOTS, { recursive: true })
const out = []
const WANT = 'SANS: no availability filed for today. Planned on OFT EP-6 15:00–16:30'
for (const size of ['desk', 'phone']) {
  const b = size === 'phone' ? await webkit.launch() : await chromium.launch(CHROMIUM && existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {})
  const ctx = await b.newContext(size === 'phone' ? { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { viewport: { width: 1536, height: 864 }, deviceScaleFactor: 1.25 })
  await ctx.clock.setFixedTime(new Date(2026, 6, 13, 9, 0, 0))
  const p = await ctx.newPage()
  const bad = []
  p.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()) })
  p.on('pageerror', e => bad.push('pageerror ' + String(e).slice(0, 160)))
  p.on('console', m => { if (m.type() === 'error') bad.push('console ' + m.text().slice(0, 160)) })
  await p.goto(url); await p.waitForSelector('#luser', { timeout: 30000 })
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 30000 })
  const assets = await p.evaluate(() => [...document.querySelectorAll('script[src],link[href]')].map(e => e.getAttribute('src') || e.getAttribute('href')).filter(s => /assets\//.test(s)))
  await p.evaluate(() => window.go ? window.go('editsched') : null).catch(() => {})
  await p.waitForTimeout(800)
  const legend = await p.evaluate(() => (document.body.innerText || '').includes('advisory — shift, ground or SANS availability') || [...document.querySelectorAll('*')].some(e => (e.textContent || '').includes('shift, ground or SANS availability')))
  const bridge = await p.evaluate(() => typeof window.setSlotVal === 'function' && typeof window.openScheduler === 'function')
  let line = null, pic = ''
  if (bridge && size === 'desk') {
    await p.evaluate(() => { window.setSlotVal('s:0.oft.3.w', 'ipman'); window.afterSchedMutate() })
    await p.evaluate(() => window.openScheduler(0)); await p.waitForSelector('#schedBoard', { timeout: 8000 }); await p.waitForTimeout(900)
    const r = await p.evaluate(want => {
      const els = [...document.querySelectorAll('#schedBoard .sb-warn *')].filter(e => e.children.length === 0 || e.childElementCount <= 2)
      const hit = els.find(e => (e.innerText || e.textContent || '').includes(want))
      if (!hit) return { text: null }
      let row = hit; while (row.parentElement && !(row.parentElement.classList.contains('sb-warn')) && (row.innerText || '').length < 300 && row.getBoundingClientRect().height < 90) { if ((row.parentElement.innerText || '').length > 300) break; row = row.parentElement }
      row.scrollIntoView({ block: 'center' })
      const box = (document.querySelector('#schedBoard .sb-warn') || row).getBoundingClientRect(), rb = row.getBoundingClientRect()
      return { text: (row.innerText || row.textContent).replace(/\s+/g, ' ').trim(), clip: { x: Math.max(0, box.left - 4), y: Math.max(0, rb.top - 70), width: Math.min(box.width + 8, window.innerWidth - Math.max(0, box.left - 4)), height: rb.height + 140 } }
    }, WANT)
    line = r.text
    if (SHOTS && r.clip) { pic = resolve(SHOTS, 'sans-line-desktop.png'); await p.screenshot({ path: pic, clip: r.clip }) }
  }
  if (SHOTS && !bridge) await p.screenshot({ path: resolve(SHOTS, `pages-${size}.png`) })
  out.push({ size, assets: assets.length, base: assets.every(a => a.startsWith('/Raptor/')), legend, bridge, line, pic, bad })
  await b.close()
}
console.log(JSON.stringify(out, null, 1))
const ok = out.every(o => o.bad.length === 0 && o.base && o.assets > 0 && o.legend && (!o.bridge || o.size !== 'desk' || (o.line || '').includes(WANT)))
console.log(ok ? 'PAGES CHECK PASS' : 'PAGES CHECK FAIL')
process.exit(ok ? 0 : 1)
