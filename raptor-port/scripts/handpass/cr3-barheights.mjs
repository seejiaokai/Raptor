/* [UI-CONSISTENCY-LOOK] round 3, D1170 — the Tracker bar's height at nine widths, written to a file, so the walk can set the
   bar after the change beside the bar before it. Run once against a build of the old look (the baseline) and the walk
   compares (`cr3-walk.mjs`, its break test, reads CR3_BAR_BASE). Each width: the bar's height, how many rows it wraps to,
   and every control's height on it.
   Run (CR3_FONT=Arial and CR3_OLD=1 optional — above): HP_URL=http://localhost:<port> node scripts/handpass/cr3-barheights.mjs <out.json> */
import { existsSync, writeFileSync } from 'node:fs'
import { chromium } from '@playwright/test'
const { BASE, login, go } = await import('./lib.mjs')
const CHROMIUM = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium'
export const WIDTHS = [1536, 1440, 1300, 1100, 1051, 1050, 402, 375, 320]
export async function barNow(page) {
  return page.evaluate(() => {
    const hd = document.querySelector('#page-tracker header')
    const items = [...hd.querySelectorAll('.controls>*')].filter(c => c.getBoundingClientRect().height > 0).map(c => c.getBoundingClientRect())
    /* a row is a run of items whose boxes overlap top to bottom (they are centred in their line, so their tops differ) */
    const rows = []; for (const r of items.sort((a, b) => a.top - b.top)) { const row = rows.find(x => r.top < x.b && r.bottom > x.t); if (row) { row.t = Math.min(row.t, r.top); row.b = Math.max(row.b, r.bottom) } else rows.push({ t: r.top, b: r.bottom }) }
    const ctl = [...hd.querySelectorAll('select, button, .findbox')].filter(b => b.getClientRects().length && !b.closest('.menupanel'))
      .map(b => [b.id || b.className, Math.round(b.getBoundingClientRect().height * 10) / 10])
    return { h: Math.round(hd.getBoundingClientRect().height * 10) / 10, rows: rows.length, ctl }
  })
}
if (process.argv[1] && process.argv[1].endsWith('cr3-barheights.mjs')) {
  const out = process.argv[2]; if (!out) throw new Error('give the file to write')
  const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
  const res = {}
  for (const w of WIDTHS) {
    const touch = w < 600
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, deviceScaleFactor: 2, ...(touch ? { isMobile: true, hasTouch: true } : {}) })
    await ctx.clock.install({ time: new Date('2026-07-13T09:00:00') })
    const page = await ctx.newPage()
    await page.goto(BASE + '/'); await login(page, 'a')
    await go(page, 'tracker'); await page.waitForSelector('#flowSvg .ball', { timeout: 20000 }); await page.waitForTimeout(600)
    /* CR3_FONT=Arial: the bar's controls in another font (an iPhone has no Segoe UI — its line is shorter); CR3_OLD=1: the old
       sizes put back on the page (no fixed height on the buttons, the search box or the dropdowns) */
    if (process.env.CR3_FONT) await page.addStyleTag({ content: '#page-tracker header select,#page-tracker header button,#page-tracker header input{font-family:' + process.env.CR3_FONT + '!important}' })
    if (process.env.CR3_OLD) await page.addStyleTag({ content: '#page-tracker header button.sm,#page-tracker header .findbox,#page-tracker header select{height:auto!important}' })
    if (process.env.CR3_FONT || process.env.CR3_OLD) await page.waitForTimeout(200)
    res[w] = await barNow(page)
    console.log(w, JSON.stringify(res[w]))
    await ctx.close()
  }
  await browser.close()
  writeFileSync(out, JSON.stringify(res, null, 1))
}
