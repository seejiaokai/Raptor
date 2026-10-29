// The Balances page's bar and heading row on a phone, through a real pinch (his picture of 29 Oct 26 — D1518, D1519): in
// WebKit, the iPhone's engine, two fingers (touch events carrying two touches — WebKit's test browser has no touch
// constructor) pinch the list out and in, part-way down, the fingers drifting as a person's do (§7.11 lesson 13). Pictures
// the band from the bar to the first row mid-pinch, just after the lift, settled, and after a scroll; and measures where the
// heading strip and its words are drawn against the scroller's top.
//   node scripts/handpass/lw-bal-gap-pinch.mjs <dist> <out-dir>
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { serveDist } from '../drawcheck/lib.mjs'
const require = createRequire(import.meta.url)
const { webkit } = require('@playwright/test')
const [, , DIST = 'dist', OUT = 'C:/dcm5bdraw/gappinch'] = process.argv
mkdirSync(OUT, { recursive: true })
const ORIGIN = 'http://localhost:4199'
const out = {}
const finger = (p, type, pts) => p.evaluate(({ type, pts }) => {
  const t = pts.map((q, i) => ({ identifier: i + 1, clientX: q.x, clientY: q.y, pageX: q.x, pageY: q.y, target: document.elementFromPoint(q.x, q.y) }))
  const e = new Event(type, { bubbles: true, cancelable: true })
  Object.defineProperty(e, 'touches', { value: type === 'touchend' ? [] : t })
  Object.defineProperty(e, 'changedTouches', { value: t })
  ;(t[0]?.target || document.querySelector('.bp-hs')).dispatchEvent(e)
}, { type, pts })
const read = p => p.evaluate(() => {
  const hs = document.querySelector('.bp-hs'), cols = document.querySelector('.bp-cols'), w = cols.querySelector('span:nth-child(2)')
  const r = e => e.getBoundingClientRect()
  return { hsTop: +r(hs).top.toFixed(1), strip: +r(cols).top.toFixed(1), words: +r(w).top.toFixed(1), zoom: document.querySelector('.bp-zoom').style.zoom || '1', st: hs.scrollTop, translate: cols.style.translate || '', tf: document.querySelector('.bp-zoom').style.transform || '' }
})
for (const [who, user, pass] of [['admin', 'ad', 'a'], ['member', 'us', 'us']]) {
  const b = await webkit.launch()
  const vp = { width: 402, height: 874 }
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 3, hasTouch: true, timezoneId: 'Asia/Singapore' })
  await serveDist(ctx, ORIGIN, DIST)
  const p = await ctx.newPage()
  const errs = []; p.on('pageerror', e => errs.push(e.message))
  await p.clock.setFixedTime(new Date('2026-01-08T09:00:00+08:00'))
  await p.goto(ORIGIN + '/')
  await p.fill('#luser', user); await p.fill('#lpass', pass); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { timeout: 20000 })
  await p.evaluate(() => window.go('leavewar')); await p.waitForSelector('[data-testid="lw-tab-balances"]', { timeout: 20000 })
  await p.locator('[data-testid="lw-tab-balances"]').tap(); await p.waitForSelector('.bp-cols'); await p.waitForTimeout(600)
  const shot = async name => {
    const g = await read(p)
    out[`${who}-${name}`] = g
    await p.screenshot({ path: join(OUT, `${who}-${name}.png`), clip: { x: 0, y: Math.max(0, g.hsTop - 30), width: vp.width, height: 110 } })
  }
  for (const [run, startTop, k1] of [['out-mid', 300, 0.62], ['out-top', 0, 0.7], ['in-mid', 500, 1.25]]) {
    await p.locator('.bp-hs').evaluate((e, t) => { e.scrollTop = t }, startTop); await p.waitForTimeout(250)
    const box = await p.locator('.bp-hs').boundingBox()
    const cx = box.x + box.width / 2, cy = box.y + 260
    const d0 = 200
    const pts = (k, drift) => [{ x: cx - d0 / 2 * k + drift, y: cy - 30 * k + drift * 1.3 }, { x: cx + d0 / 2 * k + drift, y: cy + 30 * k + drift * 1.6 }]
    await finger(p, 'touchstart', pts(1, 0))
    const N = 10
    for (let i = 1; i <= N; i++) { await finger(p, 'touchmove', pts(1 + (k1 - 1) * i / N, i * 4)); await p.waitForTimeout(30) }
    await p.waitForTimeout(120); await shot(`${run}-1mid`)
    await finger(p, 'touchend', pts(k1, N * 4))
    await p.waitForTimeout(40); await shot(`${run}-2lift`)
    await p.waitForTimeout(600); await shot(`${run}-3settled`)
    await p.locator('.bp-hs').evaluate(e => { e.scrollTop += 173 }); await p.waitForTimeout(300); await shot(`${run}-4scrolled`)
  }
  out[`${who}-errors`] = errs
  await ctx.close(); await b.close()
}
writeFileSync(join(OUT, 'probe.json'), JSON.stringify(out, null, 1))
for (const [k, v] of Object.entries(out)) console.log(k, JSON.stringify(v))
