// THE PINNED-PART SWEEP (his D1518, 29 Oct 26 — "nothing pinned on screen leaks"; [PINNED-LEAK-SWEEP]). Every part that
// stays put while what is under it scrolls — found by the browser itself (a computed position of sticky or fixed), never
// from a list kept by hand — is checked on every page, at several scroll places, on his iPhone's engine and at his PC's
// 125% with the browser zoomed in and out. Three checks at a grid of points inside each pinned part:
//   covered      — something that scrolls is drawn over the pinned part (it does not stand in front);
//   see-through  — no solid fill under the point, from the topmost thing there down to the pinned part (and any pinned
//                  part that carries it), so what scrolls behind shows through;
//   gap          — a pinned part that is stuck against another (a heading under the top bar), and a sliver of what
//                  scrolls shows between the two, 0.4px outside its edge.
// And the forced spill (§7.11 lesson 15): each inner scroll box let draw outside its edge and its content slid 120px up
// and left, the bars outside it asked again — a test browser clips what his iPhone, zoomed, sometimes does not.
// Hit-testing reads every element (pointer-events forced on for the probe only) and skips what is not painted.
//
//   node scripts/handpass/pinned-sweep.mjs <dist> <out-dir> [config,…] [state,…]
//   configs: phone (WebKit 402×874 ×3), desk (Chromium 1536×730 ×1.25 — his PC), deskin (his PC zoomed to 150%:
//            1024×487 ×1.875), deskout (zoomed to 67%: 2293×1090 ×0.8375)
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { serveDist, LAUNCH } from '../drawcheck/lib.mjs'
const require = createRequire(import.meta.url)
const { webkit, chromium } = require('@playwright/test')
const [, , DIST = 'dist', OUT = 'C:/pinned-sweep', ONLYC, ONLYS] = process.argv
mkdirSync(OUT, { recursive: true })
const CONFIGS = {
  phone: { eng: 'webkit', ctx: { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true } },
  desk: { eng: 'chromium', ctx: { viewport: { width: 1536, height: 730 }, deviceScaleFactor: 1.25 } },
  deskin: { eng: 'chromium', ctx: { viewport: { width: 1024, height: 487 }, deviceScaleFactor: 1.875 } },
  deskout: { eng: 'chromium', ctx: { viewport: { width: 2293, height: 1090 }, deviceScaleFactor: 0.8375 } },
}
/* each state: how to reach it from a signed-in admin, then the page it stands on */
const STATES = [
  ['viewsched', async p => { await go(p, 'viewsched') }],
  ['editsched', async p => { await go(p, 'editsched') }],
  ['board', async p => { await go(p, 'editsched'); await p.evaluate(() => window.openScheduler(2)); await p.waitForSelector('.schedboard'); await p.waitForTimeout(800) }],
  ['inputs-cal', async p => { await go(p, 'inputs') }],
  ['inputs-list', async p => { await go(p, 'inputs'); await p.click('#inListBtn'); await p.waitForTimeout(500) }],
  ['quals', async p => { await go(p, 'quals') }],
  ['logic', async p => { await go(p, 'logic') }],
  ['help', async p => { await go(p, 'help') }],
  ['admin', async p => { await go(p, 'admin') }],
  ['lw-grid', async p => { await go(p, 'leavewar'); await p.waitForSelector('[data-testid="lw-tab-grid"]'); await p.waitForTimeout(800) }],
  ['lw-approvals', async p => { await go(p, 'leavewar'); await tap(p, '[data-testid="lw-tab-approvals"]'); await p.waitForTimeout(600) }],
  ['lw-balances', async p => { await go(p, 'leavewar'); await tap(p, '[data-testid="lw-tab-balances"]'); await p.waitForSelector('.bp-cols, .bp-table'); await p.waitForTimeout(600) }],
  ['lw-oil', async p => { await go(p, 'leavewar'); await tap(p, '[data-testid="oil-tracker"]'); await p.waitForTimeout(900) }],
  ['lw-oil-legend', async p => { await go(p, 'leavewar'); await tap(p, '[data-testid="oil-tracker"]'); await p.waitForTimeout(900); await tap(p, '[data-testid="oil-legend"]'); await p.waitForTimeout(400) }],
  ['lw-oil-pick', async p => { await go(p, 'leavewar'); await tap(p, '[data-testid="oil-tracker"]'); await p.waitForTimeout(900); await tap(p, '[data-testid="oil-range-pick"]'); await p.waitForTimeout(400) }],
  ['tracker', async p => { await go(p, 'tracker'); await p.waitForTimeout(2500) }],
  /* the Balances page with its search line open (a third slim line under the bar), and the member's faces: a state whose
     name ends "-m" signs in as the member (us), whose Balances page carries the lock line and whose Quals row edits */
  ['lw-balances-srch', async p => { await go(p, 'leavewar'); await tap(p, '[data-testid="lw-tab-balances"]'); await p.waitForSelector('.bp-cols, .bp-table'); if (await p.locator('[data-testid="bal-search-open"]').count()) { await tap(p, '[data-testid="bal-search-open"]'); await p.waitForTimeout(300); await p.evaluate(() => document.activeElement?.blur()) } }],
  ['lw-balances-m', async p => { await go(p, 'leavewar'); await tap(p, '[data-testid="lw-tab-balances"]'); await p.waitForSelector('.bp-cols, .bp-table'); await p.waitForTimeout(600) }],
  ['lw-grid-m', async p => { await go(p, 'leavewar'); await p.waitForSelector('[data-testid="lw-tab-grid"]'); await p.waitForTimeout(800) }],
  ['quals-m', async p => { await go(p, 'quals') }],
  ['viewsched-m', async p => { await go(p, 'viewsched') }],
]
async function go(p, page) {
  await p.evaluate(pg => window.go(pg), page)
  await p.waitForFunction(pg => window.CURPAGE === pg, page)
  await p.waitForTimeout(700)
}
async function tap(p, sel) {
  const l = p.locator(sel).first()
  await l.waitFor({ timeout: 15000 })
  if (p.__touch) await l.tap(); else await l.click()
}

import { PROBE, MARK } from './pinned-probe.mjs'

const results = []
for (const [cname, cfg] of Object.entries(CONFIGS)) {
  if (ONLYC && !ONLYC.split(',').includes(cname)) continue
  const b = await (cfg.eng === 'webkit' ? webkit : chromium).launch(cfg.eng === 'chromium' ? LAUNCH : {})
  for (const [sname, reach] of STATES) {
    if (ONLYS && !ONLYS.split(',').includes(sname)) continue
    const ctx = await b.newContext({ ...cfg.ctx, timezoneId: 'Asia/Singapore' })
    const ORIGIN = 'http://localhost:4199'
    await serveDist(ctx, ORIGIN, DIST)
    const p = await ctx.newPage()
    p.__touch = !!cfg.ctx.hasTouch
    const errors = []
    p.on('pageerror', e => errors.push(String(e).slice(0, 160)))
    try {
      await p.goto(ORIGIN + '/')
      const member = sname.endsWith('-m')
      await p.fill('#luser', member ? 'us' : 'ad'); await p.fill('#lpass', member ? 'us' : 'a'); await p.click('#loginForm button[type=submit]')
      await p.waitForSelector('#vWeek .day', { timeout: 20000 })
      await reach(p)
      const max = await p.evaluate(() => document.scrollingElement.scrollHeight - innerHeight)
      const places = max > 40 ? [0, 0.3, 0.6, 0.97].map(f => Math.round(max * f)) : [0]
      for (const [i, y] of places.entries()) {
        if (process.env.SWEEP_LOG) console.log("..", cname, sname, y)
        await p.evaluate(yy => window.scrollTo(0, yy), y)
        await p.waitForTimeout(350)
        await MARK(p)
        const r = await p.evaluate(PROBE, { spill: null })
        results.push({ config: cname, state: sname, place: `y${y}`, ...r, errors: [...errors] })
        if (i === (places.length > 1 ? 1 : 0)) {
          /* the middle place: the inner boxes scrolled half-way too, each let spill in turn, and a picture of every pinned part */
          await p.evaluate(() => {
            for (const e of document.querySelectorAll('section.page.on *')) {
              const c = getComputedStyle(e)
              if (/(auto|scroll)/.test(c.overflowX + c.overflowY) && (e.scrollHeight - e.clientHeight > 40 || e.scrollWidth - e.clientWidth > 40)) {
                e.scrollTop = (e.scrollHeight - e.clientHeight) / 2; e.scrollLeft = (e.scrollWidth - e.clientWidth) / 2
              }
            }
          })
          await p.waitForTimeout(400)
          await MARK(p)
          const mid = await p.evaluate(PROBE, { spill: null })
          results.push({ config: cname, state: sname, place: `y${y}+inner`, ...mid, errors: [...errors] })
          for (let k = 0; k < Math.min(mid.boxes.length, 4); k++) {
            if (process.env.SWEEP_LOG) console.log("..  spill", k, mid.boxes[k])
            const s = await p.evaluate(PROBE, { spill: k, keep: true })
            /* a spill that showed is pictured while it stands: the band above the box, where the leak was read */
            if (s.leaks.length && s.spillBox) {
              const vp = cfg.ctx.viewport, q = s.spillBox
              const x = Math.max(0, q.x - 8), yy = Math.max(0, q.y - 130), w = Math.min(vp.width - x, q.w + 16), h = Math.min(vp.height - yy, 180)
              if (w > 4 && h > 4) await p.screenshot({ path: join(OUT, `${cname}-${sname}-spill${k}.png`), clip: { x, y: yy, width: w, height: h } }).catch(() => {})
            }
            await p.evaluate(() => { if (window.__spillUndo) window.__spillUndo(); window.__spillUndo = null })
            results.push({ config: cname, state: sname, place: `y${y}+spill:${mid.boxes[k]}`, ...s, seen: [], errors: [...errors] })
          }
          let n = 0
          for (const s of mid.seen) {
            if (n++ >= 10) break
            const vp = cfg.ctx.viewport
            const x = Math.max(0, s.x - 8), yy = Math.max(0, s.y - 8)
            const w = Math.min(vp.width - x, s.w + 16), h = Math.min(vp.height - yy, Math.min(s.h, 220) + 16)
            if (w > 4 && h > 4) await p.screenshot({ path: join(OUT, `${cname}-${sname}-${n}.png`), clip: { x, y: yy, width: w, height: h } }).catch(() => {})
          }
        }
      }
    } catch (e) { results.push({ config: cname, state: sname, place: 'ERR', error: String(e).slice(0, 300), leaks: [], seen: [] }) }
    await ctx.close()
  }
  await b.close()
}
writeFileSync(join(OUT, 'sweep.json'), JSON.stringify(results, null, 1))
/* one line for each distinct leak: where, what kind, the part, what showed, how many points */
const agg = new Map()
for (const r of results) for (const l of r.leaks) {
  const k = `${r.config} | ${r.state} | ${l.kind} | ${l.P} | ${l.hit}`
  const a = agg.get(k) || { n: 0, places: new Set(), at: `${l.x},${l.y} P[${l.pr}] hit[${l.hr}]` }
  a.n++; a.places.add(r.place); agg.set(k, a)
}
for (const r of results) if (r.place === 'ERR') console.log('ERROR', r.config, r.state, r.error)
for (const r of results) if (r.errors && r.errors.length && r.place === 'y0') console.log('PAGE ERRORS', r.config, r.state, r.errors.slice(0, 2).join(' / '))
console.log(`${agg.size} distinct leaks`)
for (const [k, a] of [...agg].sort()) console.log(`${k} | ${a.n} pts | ${[...a.places].slice(0, 3).join(' ')} | e.g. ${a.at}`)
const parts = new Set(results.flatMap(r => (r.seen || []).map(s => `${r.state} ${s.P}`)))
console.log(`${parts.size} pinned parts seen (by page)`)
console.log('DONE')
