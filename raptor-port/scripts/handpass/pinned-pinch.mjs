// THE PINNED PARTS UNDER A PINCH (his D1518 — "at all zooms"; §7.11 lessons 13 and 15; [PINNED-LEAK-SWEEP], 30 Oct 26). Every
// surface that has its own pinch on a phone — the Leave War grid, Balances, the OIL tracker, Quals, the board's desktop layout
// and the Tracker's chart — is scrolled part-way down its list, then pinched by two real fingers over Chrome's touch input
// (Input.dispatchTouchEvent, the fingers drifting down as a person's do), out and then in. The pinned-part probe
// (pinned-probe.mjs: covered, see-through, gap) is run with the fingers still down, mid-pinch, and again after the lift; a
// picture is taken at each. Chrome only: WebKit has no touch input from outside the page, so what his iPhone draws mid-pinch
// is not proved here (the evidence sheet says so).
//   node scripts/handpass/pinned-pinch.mjs <dist> <out-dir> [surface,…]
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { serveDist, LAUNCH } from '../drawcheck/lib.mjs'
import { PROBE, MARK } from './pinned-probe.mjs'
const require = createRequire(import.meta.url)
const { chromium } = require('@playwright/test')
const [, , DIST = 'dist', OUT = 'C:/pinned-pinch', ONLY] = process.argv
mkdirSync(OUT, { recursive: true })
console.log('pinned-pinch v1')
const sleep = ms => new Promise(r => setTimeout(r, ms))
const go = async (p, pg) => { await p.evaluate(x => window.go(x), pg); await p.waitForFunction(x => window.CURPAGE === x, pg); await sleep(800) }
/* each surface: how to reach it with its list part-way down, and the box the fingers land in */
const SURFACES = [
  ['lw-grid', async p => { await go(p, 'leavewar'); await p.waitForSelector('[data-testid="lw-tab-grid"]'); await sleep(900); await p.evaluate(() => window.scrollTo(0, Math.round((document.scrollingElement.scrollHeight - innerHeight) * 0.45))); await sleep(500) }, '.mx-wrap'],
  ['lw-balances', async p => { await go(p, 'leavewar'); await p.locator('[data-testid="lw-tab-balances"]').tap(); await p.waitForSelector('.bp-cols'); await sleep(500); await p.locator('.bp-hs').evaluate(e => { e.scrollTop = 420 }); await sleep(300) }, '.bp-hs'],
  ['lw-oil', async p => { await go(p, 'leavewar'); await p.locator('[data-testid="oil-tracker"]').tap(); await p.waitForSelector('[data-testid="oil-list"]'); await sleep(700); await p.locator('[data-testid="oil-list"]').evaluate(e => { e.scrollTop = (e.scrollHeight - e.clientHeight) / 2 }); await sleep(300) }, '[data-testid="oil-list"]'],
  ['quals', async p => { await go(p, 'quals'); await p.waitForSelector('#qtbl td.qname'); await p.evaluate(() => window.scrollTo(0, 420)); await sleep(500) }, '.qwrap'],
  ['board-wide', async p => {
    await go(p, 'editsched'); await p.locator('#eWeek [data-sbday="0"]:visible').first().tap()
    await p.waitForSelector('#schedBoard:not([hidden])'); await sleep(400)
    await p.locator('#sbMore').tap(); await p.locator('#sbMoreWide').tap(); await p.waitForSelector('#schedBoard.sb-wide'); await sleep(400)
    await p.evaluate(() => { const b = document.getElementById('schedBoard'); b.scrollTop = (b.scrollHeight - b.clientHeight) * 0.4 }); await sleep(300)
  }, '#schedBoard .sb-main'],
  ['tracker', async p => { await go(p, 'tracker'); await sleep(2200); await p.evaluate(() => { const b = document.getElementById('board'); if (b) b.scrollTop = (b.scrollHeight - b.clientHeight) * 0.4 }); await sleep(300) }, '#board'],
]
const results = []
const b = await chromium.launch(LAUNCH)
for (const [name, reach, box] of SURFACES) {
  if (ONLY && !ONLY.split(',').includes(name)) continue
  const ctx = await b.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true, timezoneId: 'Asia/Singapore' })
  await serveDist(ctx, 'http://localhost:4195', DIST)
  const p = await ctx.newPage()
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)))
  try {
    await p.goto('http://localhost:4195/')
    await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a'); await p.click('#loginForm button[type=submit]')
    await p.waitForSelector('#vWeek .day', { timeout: 20000 })
    await reach(p)
    const cdp = await ctx.newCDPSession(p)
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x: Math.round(x), y: Math.round(y), id: i + 1 })) })
    for (const [dir, d0, d1] of [['out', 230, 80], ['in', 90, 250]]) {
      const q = await p.locator(box).first().evaluate(e => { const r = e.getBoundingClientRect(); return { x: r.left, y: Math.max(r.top, 0), w: r.width, h: Math.min(r.bottom, innerHeight) - Math.max(r.top, 0) } })
      const cx = q.x + q.w / 2, cy = q.y + q.h * 0.45
      const at = i => { const d = d0 + (d1 - d0) * i / 10, dy = i * 4; return [[cx - d / 2, cy + dy], [cx + d / 2, cy + dy * 1.3]] }
      await MARK(p)
      await touch('touchStart', [at(0)[0]]); await sleep(30)
      await touch('touchStart', at(0)); await sleep(30)
      for (let i = 1; i <= 10; i++) { await touch('touchMove', at(i)); await sleep(20) }
      await sleep(120)
      const mid = await p.evaluate(PROBE, { spill: null })
      await p.screenshot({ path: join(OUT, `${name}-${dir}-mid.png`) })
      results.push({ surface: name, dir, when: 'mid-pinch', leaks: mid.leaks, parts: mid.seen.length })
      await touch('touchEnd', []); await sleep(500)
      await MARK(p)
      const after = await p.evaluate(PROBE, { spill: null })
      await p.screenshot({ path: join(OUT, `${name}-${dir}-lift.png`) })
      results.push({ surface: name, dir, when: 'after the lift', leaks: after.leaks, parts: after.seen.length })
    }
  } catch (e) { results.push({ surface: name, when: 'ERR', error: String(e).slice(0, 300), leaks: [] }) }
  results.push({ surface: name, when: 'page errors', errors: errs, leaks: [] })
  await ctx.close()
}
await b.close()
writeFileSync(join(OUT, 'pinch.json'), JSON.stringify(results, null, 1))
for (const r of results) {
  if (r.when === 'ERR') { console.log('NOT WALKED', r.surface, r.error); continue }
  if (r.when === 'page errors') { if (r.errors.length) console.log('PAGE ERRORS', r.surface, r.errors.join(' / ')); continue }
  const kinds = new Map()
  for (const l of r.leaks) { const k = `${l.kind} ${l.P} ← ${l.hit}`; kinds.set(k, (kinds.get(k) || 0) + 1) }
  console.log(`${r.surface} pinch ${r.dir}, ${r.when}: ${r.parts} pinned parts, ${r.leaks.length} leak points${kinds.size ? ' — ' + [...kinds].map(([k, n]) => `${k} ×${n}`).join('; ') : ''}`)
}
console.log('DONE')
