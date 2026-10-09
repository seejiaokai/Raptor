import { chromium, launchOptions, world, shot, tid, cell, backToSans, press, isTouch, toMonth } from './cal-D-lib.mjs'
const browser = await chromium.launch(launchOptions)
const L = (...a) => console.log(...a)
const measure = page => page.evaluate(() => {
  const el = document.querySelector('[data-testid="sc-grid"]'), r = el.getBoundingClientRect(), cs = getComputedStyle(el)
  const days = [...el.querySelectorAll('[data-icday]')]
  const clipped = days.filter(d => [...d.children].some(c => c.scrollHeight > c.clientHeight + 1) || d.scrollHeight > d.clientHeight + 1).length
  const week = el.querySelector('.sc-week').getBoundingClientRect().height
  const need = [...days[0].children].reduce((n, c) => n + c.scrollHeight, 0)
  const weeks = el.querySelectorAll('.sc-week').length
  return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), ownScroll: el.scrollHeight - el.clientHeight, maxH: cs.maxHeight, ovY: cs.overflowY, weeks, weekH: Math.round(week), need, clipped, fill: getComputedStyle(el).getPropertyValue('--sc-fill') || getComputedStyle(document.documentElement).getPropertyValue('--sc-fill'), pageH: document.documentElement.scrollHeight, vh: innerHeight, vw: innerWidth, pageW: document.documentElement.scrollWidth, sy: Math.round(scrollY) }
})
const SZ = { a: [390, 568], b: [390, 844] }
for (const [name, y, m] of [['July (5 weeks)', 2026, 7], ['August (6 weeks)', 2026, 8]]) {
  for (const start of ['a', 'b']) {
    const { ctx, page, errors } = await world(browser, start === 'a' ? 'short' : 'phone')
    await backToSans(page, 'phone', y, m)
    await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(400)
    const tag = `${name} start ${SZ[start].join('x')}`
    let g = await measure(page); L(tag, 'AT START', JSON.stringify(g))
    await shot(page, `p411-${m}-${start}-start`)
    // resize while open to the other height, then back
    const other = start === 'a' ? SZ.b : SZ.a
    await page.setViewportSize({ width: other[0], height: other[1] }); await page.waitForTimeout(700); await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(300)
    g = await measure(page); L(tag, `RESIZED -> ${other.join('x')}`, JSON.stringify(g))
    await shot(page, `p411-${m}-${start}-resized`)
    await page.setViewportSize({ width: SZ[start][0], height: SZ[start][1] }); await page.waitForTimeout(700); await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(300)
    const g2 = await measure(page); L(tag, 'RESIZED BACK', JSON.stringify(g2))
    // expand the instructions
    await press('phone', tid(page, 'sc-how')); await page.waitForTimeout(500)
    g = await measure(page); L(tag, 'HOW OPEN', JSON.stringify(g))
    // scroll to the foot
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await page.waitForTimeout(400)
    const foot = await page.evaluate(() => { const r = document.querySelector('[data-testid="sc-grid"]').getBoundingClientRect(); const last = [...document.querySelectorAll('.sc-week')].pop().getBoundingClientRect(); return { gridBottom: Math.round(r.bottom), lastWeekTop: Math.round(last.top), lastWeekBottom: Math.round(last.bottom), vh: innerHeight, sy: Math.round(scrollY), max: document.documentElement.scrollHeight - innerHeight } })
    L(tag, 'FOOT', JSON.stringify(foot))
    await shot(page, `p411-${m}-${start}-foot`)
    L(tag, 'errors', errors.join('|'))
    await ctx.close()
  }
}
await browser.close()
