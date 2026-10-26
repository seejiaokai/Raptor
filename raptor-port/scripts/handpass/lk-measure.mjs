/* [FLOATWIN-TWO-LINE-BAR] — the measurement first (21 Oct 26, the look-and-keys night job): how tall is the top bar
   on each schedule page at each desktop width, and where do the changes window and the ALL AVAIL window open?
   Run: HP_URL=http://localhost:4296 HP_SHOTS=<folder> node scripts/handpass/lk-measure.mjs */
console.log('lk-measure v1')
const { open, go, shot } = await import('./lib.mjs')

const widths = [621, 700, 820, 900, 1024, 1100, 1200, 1280, 1366, 1400, 1440, 1536, 1600, 1920]
const pages = ['editsched', 'viewsched']
const { browser, page, errors } = await open({ width: 1400, height: 900 })
const out = []
for (const pg of pages) {
  await go(page, pg)
  for (const w of widths) {
    await page.setViewportSize({ width: w, height: 900 })
    await page.waitForTimeout(250)
    const m = await page.evaluate(() => {
      const bars = [...document.querySelectorAll('.topbar')].filter(b => b.offsetHeight)
      const b = bars[0]
      if (!b) return null
      const r = b.getBoundingClientRect()
      /* how many lines the bar's own children run to: distinct tops of its visible children */
      const tops = new Set([...b.children].filter(c => c.offsetWidth).map(c => Math.round(c.getBoundingClientRect().top / 8)))
      return { bottom: Math.round(r.bottom * 10) / 10, height: Math.round(r.height), rows: tops.size }
    })
    out.push({ pg, w, ...m })
  }
}
for (const o of out) console.log(`${o.pg.padEnd(10)} w=${String(o.w).padStart(4)}  bar bottom=${o.bottom}  height=${o.height}  child-rows=${o.rows}`)
await page.setViewportSize({ width: 1400, height: 900 })
await go(page, 'editsched')
await page.waitForTimeout(300)
await shot(page, 'before-editsched-1400-bar')
console.log('errors:', errors.length ? errors : 'none')
await browser.close()
