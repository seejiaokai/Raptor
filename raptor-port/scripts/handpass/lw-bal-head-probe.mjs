// The Balances page's heading row on a phone (his look at M5b, 29 Oct 26 — D1504, D1505): measured in WebKit, the iPhone's
// engine. At rest, what of the rows shows above the heading row; mid-pinch, whether the heading row's dark strip stays with
// its words. Run from raptor-port:  node scripts/handpass/lw-bal-head-probe.mjs <dist> <out-dir>
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { serveDist } from '../drawcheck/lib.mjs'
const require = createRequire(import.meta.url)
const { webkit, chromium } = require('@playwright/test')
const [, , DIST = 'dist', OUT = 'C:/dcm5bdraw/headprobe'] = process.argv
mkdirSync(OUT, { recursive: true })
const ORIGIN = 'http://localhost:4197'
const out = {}
for (const [tag, vp, eng] of [['p402', { width: 402, height: 874 }, 'webkit'], ['p375', { width: 375, height: 812 }, 'webkit'], ['c402', { width: 402, height: 874 }, 'chromium']]) {
  const b = await (eng === 'webkit' ? webkit : chromium).launch()
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 3, hasTouch: true, timezoneId: 'Asia/Singapore', ...(eng === 'chromium' ? { isMobile: true } : {}) })
  await serveDist(ctx, ORIGIN, DIST)
  const p = await ctx.newPage()
  const errs = []; p.on('pageerror', e => errs.push(e.message))
  await p.clock.setFixedTime(new Date('2026-01-08T09:00:00+08:00'))
  await p.goto(ORIGIN + '/')
  await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { timeout: 20000 })
  await p.evaluate(() => window.go('leavewar')); await p.waitForSelector('[data-testid="lw-tab-balances"]', { timeout: 20000 })
  await p.locator('[data-testid="lw-tab-balances"]').tap(); await p.waitForSelector('.bp-cols'); await p.waitForTimeout(600)
  // what the heading row covers, and whether any of the rows is drawn above it inside the scroller
  const at = async () => p.evaluate(() => {
    const hs = document.querySelector('.bp-hs'), cols = document.querySelector('.bp-cols'), bar = document.querySelector('.bp-bar')
    const zoom = document.querySelector('.bp-zoom')
    const r = e => { const q = e.getBoundingClientRect(); return { top: +q.top.toFixed(2), bottom: +q.bottom.toFixed(2), h: +q.height.toFixed(2) } }
    // the first row's highest drawn part still above the heading's top, inside the scroller
    let leak = 0
    for (const el of document.querySelectorAll('.bp-row *, .bp-grp *')) {
      const q = el.getBoundingClientRect()
      if (q.height && q.bottom > r(hs).top && q.top < r(cols).top) leak = Math.max(leak, Math.min(q.bottom, r(cols).top) - Math.max(q.top, r(hs).top))
    }
    return { hs: r(hs), cols: r(cols), bar: bar && r(bar), zoom: zoom.style.zoom || '1', gap: +(r(cols).top - r(hs).top).toFixed(2), leak: +leak.toFixed(2), scrollTop: hs.scrollTop }
  })
  out[tag + '-rest'] = await at()
  await p.screenshot({ path: join(OUT, `${tag}-rest.png`), clip: { x: 0, y: Math.max(0, out[tag + '-rest'].hs.top - 60), width: vp.width, height: 160 } })
  await p.locator('.bp-hs').evaluate(e => { e.scrollTop = 37 }); await p.waitForTimeout(300)
  out[tag + '-scrolled'] = await at()
  await p.locator('.bp-zoom').evaluate(e => { e.style.zoom = '0.62' }); await p.locator('.bp-hs').evaluate(e => { e.scrollTop = 61 }); await p.waitForTimeout(300)
  out[tag + '-zoomedout'] = await at()
  await p.screenshot({ path: join(OUT, `${tag}-zoomedout.png`), clip: { x: 0, y: Math.max(0, out[tag + '-zoomedout'].hs.top - 60), width: vp.width, height: 160 } })
  await p.locator('.bp-zoom').evaluate(e => { e.style.zoom = '' }); await p.locator('.bp-hs').evaluate(e => { e.scrollTop = 0 }); await p.waitForTimeout(200)
  await p.screenshot({ path: join(OUT, `${tag}-scrolled.png`), clip: { x: 0, y: Math.max(0, out[tag + '-scrolled'].hs.top - 60), width: vp.width, height: 160 } })
  if (eng === 'chromium') {
    // mid-pinch: two real fingers (Chrome's touch input), moved apart and held before the lift
    await p.locator('.bp-hs').evaluate(e => { e.scrollTop = 420 }); await p.waitForTimeout(300)
    const box = await p.locator('.bp-hs').boundingBox()
    const cx = box.x + box.width / 2, cy = box.y + 120
    const cdp = await ctx.newCDPSession(p)
    const pts = k => [{ x: cx - 120 + k * 10, y: cy + k * 9, id: 1 }, { x: cx + 120 - k * 10, y: cy + k * 11, id: 2 }]
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts(0) })
    for (let k = 1; k <= 8; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts(k) }); await p.waitForTimeout(30) }
    await p.waitForTimeout(150)
    out[tag + '-midpinch'] = await p.evaluate(() => {
      const cols = document.querySelector('.bp-cols'), span = cols.querySelector('span:nth-child(2)'), hs = document.querySelector('.bp-hs')
      const q = e => e.getBoundingClientRect()
      // what is drawn at the heading words' height, just left of the second heading: the strip, or a row
      const w = q(span), hit = document.elementFromPoint(w.left + 4, w.top + w.height / 2)
      // the heading strip's own box, as drawn (its background), against where its words are held
      const strip = q(cols), sp = q(span)
      const gapAbove = +(sp.top - Math.max(strip.top, q(hs).top)).toFixed(1)
      return { gapAbove, stripCoversWords: strip.top <= sp.top && strip.bottom >= sp.bottom, scroller: +q(hs).top.toFixed(1), strip: { top: +q(cols).top.toFixed(1), bottom: +q(cols).bottom.toFixed(1) }, words: { top: +w.top.toFixed(1), bottom: +w.bottom.toFixed(1) }, under: hit ? (hit.closest('.bp-cols') ? 'heading strip' : hit.closest('.bp-row') ? 'a row' : hit.className) : null, target: document.querySelector('.bp-zoom').style.transform }
    })
    await p.screenshot({ path: join(OUT, `${tag}-midpinch.png`) })
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  }
  out[tag + '-errors'] = errs
  await ctx.close(); await b.close()
}
writeFileSync(join(OUT, 'probe.json'), JSON.stringify(out, null, 1))
console.log(JSON.stringify(out, null, 1))
