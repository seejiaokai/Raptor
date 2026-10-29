// Calibrates the stand-in for his iPhone's spill (D1518, D1519): the Balances list let draw outside its box and slid up under
// the bar, as a row drawn past the list's top edge is. On the build before the fix something of the list must answer, and
// show, inside the bar (the stand-in reproduces the fault); on the fixed build nothing may. WebKit and Chromium, admin and
// member, the search line open. Pictures the bar's area.   node scripts/handpass/lw-bal-spill-calib.mjs <dist> <out-dir>
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { serveDist, LAUNCH } from '../drawcheck/lib.mjs'
const require = createRequire(import.meta.url)
const { webkit, chromium } = require('@playwright/test')
const [, , DIST = 'dist', OUT = 'C:/dcm5bdraw/spill'] = process.argv
mkdirSync(OUT, { recursive: true })
const ORIGIN = 'http://localhost:4196'
const res = {}
for (const eng of ['webkit', 'chromium']) for (const [who, user, pass] of [['admin', 'ad', 'a'], ['member', 'us', 'us']]) {
  const b = await (eng === 'webkit' ? webkit : chromium).launch(eng === 'chromium' ? LAUNCH : {})
  const ctx = await b.newContext({ viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, hasTouch: true, timezoneId: 'Asia/Singapore' })
  await serveDist(ctx, ORIGIN, DIST)
  const p = await ctx.newPage()
  await p.clock.setFixedTime(new Date('2026-01-08T09:00:00+08:00'))
  await p.goto(ORIGIN + '/')
  await p.fill('#luser', user); await p.fill('#lpass', pass); await p.click('#loginForm button[type=submit]')
  await p.waitForSelector('#vWeek .day', { timeout: 20000 })
  await p.evaluate(() => window.go('leavewar')); await p.waitForSelector('[data-testid="lw-tab-balances"]', { timeout: 20000 })
  await p.locator('[data-testid="lw-tab-balances"]').tap(); await p.waitForSelector('.bp-cols'); await p.waitForTimeout(500)
  await p.locator('[data-testid="bal-search-open"]').tap(); await p.waitForTimeout(300)
  await p.evaluate(() => document.activeElement?.blur())
  const r = await p.evaluate(() => {
    const hs = document.querySelector('.bp-hs'), zoom = document.querySelector('.bp-zoom')
    zoom.style.zoom = '0.85'; hs.style.overflow = 'visible'; zoom.style.translate = '0px -260px'
    const out = []
    for (const sel of ['.bp-bar', '.bp-lk2', '.bp-srchline']) {
      const el = document.querySelector(sel); if (!el) continue
      const q = el.getBoundingClientRect()
      for (const y of [q.bottom - 2, q.bottom - 6, q.top + q.height / 2]) for (const x of [q.left + 150, q.left + q.width / 2, q.right - 20]) {
        const h = document.elementFromPoint(x, y)
        if (!h || !el.contains(h)) out.push(`${sel}@${Math.round(x)},${Math.round(y)}:${h ? (h.className || h.tagName) : '-'}`)
      }
    }
    const top = document.querySelector('.bp-bar').getBoundingClientRect().top
    return { out, top }
  })
  await p.screenshot({ path: join(OUT, `${eng}-${who}.png`), clip: { x: 0, y: r.top - 4, width: 402, height: 110 } })
  res[`${eng}-${who}`] = r.out
  await ctx.close(); await b.close()
}
writeFileSync(join(OUT, 'calib.json'), JSON.stringify(res, null, 1))
for (const [k, v] of Object.entries(res)) console.log(k, v.length ? `LIST SHOWS IN THE BAR at ${v.length} points, e.g. ${v[0]}` : 'bar solid at every point')
