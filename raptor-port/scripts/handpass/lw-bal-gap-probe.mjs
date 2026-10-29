// The Balances page's bar and heading row on a phone, at every zoom and scroll (his picture of 29 Oct 26 — D1518, D1519):
// in WebKit, the iPhone's engine, as an admin and as a member, the pinch's zoom set as the pinch sets it, the list scrolled
// to several depths. For each state it pictures the band from the bar's foot to the first row, and reads the pixels of the
// strip between the bar's foot line and the heading words: any pixel there brighter than the heading strip's own dark fill
// is something of the rows showing through. Run from raptor-port:
//   node scripts/handpass/lw-bal-gap-probe.mjs <dist> <out-dir>
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { serveDist } from '../drawcheck/lib.mjs'
const require = createRequire(import.meta.url)
const { webkit } = require('@playwright/test')
const [, , DIST = 'dist', OUT = 'C:/dcm5bdraw/gapprobe'] = process.argv
mkdirSync(OUT, { recursive: true })
const ORIGIN = 'http://localhost:4198'
const out = {}
let bad = 0
for (const [who, user, pass] of [['admin', 'ad', 'a'], ['member', 'us', 'us']]) {
  for (const vp of [{ width: 402, height: 874 }, { width: 375, height: 812 }]) {
    const b = await webkit.launch()
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
    for (const view of ['bal', 'taken']) {
      if (view === 'taken') { await p.locator('[data-testid="bal-view-taken"]').tap(); await p.waitForTimeout(400) }
      for (const zoom of [1, 0.85, 0.7, 0.55]) {
        for (const top of [0, 13, 37, 140, 455, 900]) {
          await p.locator('.bp-zoom').evaluate((e, z) => { e.style.zoom = z === 1 ? '' : String(z) }, zoom)
          await p.locator('.bp-hs').evaluate((e, t) => { e.scrollTop = t }, top)
          await p.waitForTimeout(250)
          const g = await p.evaluate(() => {
            const hs = document.querySelector('.bp-hs'), cols = document.querySelector('.bp-cols')
            const words = cols.querySelector('span:nth-child(2)')
            const r = e => e.getBoundingClientRect()
            return { hsTop: r(hs).top, colsTop: r(cols).top, colsBottom: r(cols).bottom, wordsTop: r(words).top, scrollTop: hs.scrollTop }
          })
          const tag = `${who}-${vp.width}-${view}-z${zoom}-s${top}`
          const clip = { x: 0, y: Math.max(0, g.hsTop - 24), width: vp.width, height: 90 }
          const buf = await p.screenshot({ clip })
          // the band from the scroller's top to the heading words' top, left of the screen's edge to its right, past the
          // names column (whose fill is the same dark): any pixel brighter than the dark fills is a row showing through
          const { lit, maxL } = await p.evaluate(async ({ src, cw, top0, bot0, left }) => {
            const img = new Image(); img.src = src; await img.decode()
            const c = document.createElement('canvas'); c.width = img.width; c.height = img.height
            const x2 = c.getContext('2d'); x2.drawImage(img, 0, 0)
            const sc = img.width / cw, y0 = Math.round(top0 * sc) + 1, y1 = Math.round(bot0 * sc) - 1, xl = Math.round(left * sc)
            if (y1 <= y0) return { lit: 0, maxL: 0 }
            const d = x2.getImageData(xl, y0, img.width - xl, y1 - y0).data
            let lit = 0, maxL = 0
            for (let i = 0; i < d.length; i += 4) { const L = (d[i] + d[i + 1] + d[i + 2]) / 3; if (L > 40) lit++; if (L > maxL) maxL = L }
            return { lit, maxL }
          }, { src: 'data:image/png;base64,' + buf.toString('base64'), cw: clip.width, top0: g.hsTop - clip.y, bot0: g.wordsTop - clip.y, left: 150 })
          const leak = lit > 4
          if (leak) bad++
          out[tag] = { ...g, lit, maxL: Math.round(maxL), leak }
          if (leak || top === 37 || top === 455) writeFileSync(join(OUT, `${tag}${leak ? '-LEAK' : ''}.png`), buf)
        }
      }
      await p.locator('.bp-zoom').evaluate(e => { e.style.zoom = '' })
      await p.locator('.bp-hs').evaluate(e => { e.scrollTop = 0 })
    }
    out[`${who}-${vp.width}-errors`] = errs
    await ctx.close(); await b.close()
  }
}
writeFileSync(join(OUT, 'probe.json'), JSON.stringify(out, null, 1))
const leaks = Object.entries(out).filter(([, v]) => v && v.leak).map(([k, v]) => `${k} lit=${v.lit} max=${v.maxL} cols-hs=${(v.colsTop - v.hsTop).toFixed(1)}`)
console.log(leaks.length ? `LEAKS ${leaks.length}:\n` + leaks.join('\n') : 'no leak in any state')
console.log('errors', Object.entries(out).filter(([k]) => k.endsWith('errors')).map(([k, v]) => `${k}:${v.length}`).join(' '))
