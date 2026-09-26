/* RETIRED 26 Sep 26 ([ACCOUNTS], Astra R2-5): this checked the GitHub Pages site, gone
   since D59 (23 Sep 26 — the app is viewed on Vercel, behind the owner's own sign-in), and
   it read the probe bridge, which since [ACCOUNTS] is installed on this PC only. "Done"
   is now his look at the live app on Vercel (D143). Kept for its history; it refuses to run. */
throw new Error('live-check.mjs is retired: GitHub Pages is gone (D59) and the probe bridge is localhost-only ([ACCOUNTS]).')
/* The deployed page, not the local preview — the one thing the local build
   cannot prove (a stale cache, a base path wrong as served). */
import { chromium } from '@playwright/test'
const b = await chromium.launch({ headless: true })
const p = await (await b.newContext({ viewport: { width: 1500, height: 950 } })).newPage()
const errs = []
p.on('pageerror', e => errs.push('PAGEERROR ' + e.message))
p.on('response', r => { if (r.status() >= 400) errs.push('HTTP ' + r.status() + ' ' + r.url().slice(-60)) })
await p.goto('https://seejiaokai.github.io/Raptor/', { waitUntil: 'load', timeout: 60000 })
await p.waitForSelector('#luser', { timeout: 30000 })
await p.fill('#luser', 'ad'); await p.fill('#lpass', 'a')
await p.click('#loginForm button[type=submit]')
await p.waitForSelector('#vWeek .day', { state: 'attached', timeout: 30000 })
await p.waitForTimeout(2500)

const out = await p.evaluate(() => {
  const w = window
  const codes = di => { const g = w.WARN?.byDay?.[di]; return ((g && g.warns) || []).map(x => x.code) }
  return {
    built: document.querySelector('script[src]')?.getAttribute('src') || '(none)',
    days: document.querySelectorAll('#vWeek .day[data-day]').length,
    sat: codes(5), sun: codes(6),
    hasOldBlockCode: typeof w.WCODE === 'object' && 'OIL_OLD_BLOCK' in w.WCODE,
    hasNoLenCode: typeof w.WCODE === 'object' && 'FLT_NO_LEN' in w.WCODE,
    noTimesLabel: (w.WCODE || {}).OIL_NO_TIMES || '(none)',
  }
})
console.log('LIVE PAGE — https://seejiaokai.github.io/Raptor/')
console.log('  bundle:', out.built)
console.log('  week drawn:', out.days, 'days')
console.log('  SATURDAY warnings ON ARRIVAL:', out.sat.join(', ') || '(none)')
console.log('  SUNDAY   warnings ON ARRIVAL:', out.sun.join(', ') || '(none)')
console.log('  the new warning is in the build:', out.hasOldBlockCode)
console.log('  the nought-minute warning is in the build:', out.hasNoLenCode)
console.log('  the reworded one reads:', JSON.stringify(out.noTimesLabel))
console.log('  errors:', errs.slice(0, 6))
await p.screenshot({ path: (process.env.HP_SHOTS || '.') + '/LIVE-after-merge.png' })
await b.close()
