import { chromium, launchOptions, world, shot, tid, cell, backToSans, readDayWin, press, isTouch, fileCommit } from './cal-D-lib.mjs'
const browser = await chromium.launch(launchOptions)
const L = (...a) => console.log(...a)
const m = page => page.evaluate(() => {
  const el = document.querySelector('[data-testid="sc-grid"]'), r = el.getBoundingClientRect()
  const days = [...el.querySelectorAll('[data-icday]')]
  const clipped = days.filter(d => [...d.children].some(c => c.scrollHeight > c.clientHeight + 1)).length
  return { top: Math.round(r.top), bottom: Math.round(r.bottom), ownScroll: el.scrollHeight - el.clientHeight, ovY: getComputedStyle(el).overflowY, weeks: el.querySelectorAll('.sc-week').length, weekH: Math.round(el.querySelector('.sc-week').getBoundingClientRect().height), clipped, pageH: document.documentElement.scrollHeight, vh: innerHeight, vw: innerWidth, pageW: document.documentElement.scrollWidth, headOneLine: (() => { const ids = ['sc-prev', 'sc-month', 'sc-next', 'sc-today', 'sc-hl', 'sc-gear'].map(i => document.querySelector(`[data-testid="${i}"]`)); const mids = ids.filter(Boolean).map(e => { const b = e.getBoundingClientRect(); return b.top + b.height / 2 }); return Math.round(Math.max(...mids) - Math.min(...mids)) })() }
})
const inView = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), within: r.left >= 0 && r.top >= 0 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5, vw: innerWidth, vh: innerHeight } }, sel)
for (const size of ['side', 'wide', 'short', 'desk']) {
  const { ctx, page, errors } = await world(browser, size)
  for (const mo of [7, 8]) {
    await backToSans(page, size, 2026, mo); await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(300)
    L(size, 'MONTH', mo, JSON.stringify(await m(page)))
    await shot(page, `sweep-${size}-m${mo}`)
  }
  await backToSans(page, size, 2026, 7)
  await press(size, cell(page, '2026-07-22'), { position: { x: 8, y: 8 } }); await tid(page, 'win-sansday').waitFor(); await page.waitForTimeout(400)
  L(size, 'DAY window', JSON.stringify(await inView(page, '[data-testid="win-sansday"]')))
  await shot(page, `sweep-${size}-day`)
  await press(size, tid(page, 'win-sansday-x')); await page.waitForTimeout(250)
  await press(size, tid(page, 'sc-gear')); await tid(page, 'win-sansset').waitFor(); await page.waitForTimeout(300)
  L(size, 'GEAR window', JSON.stringify(await inView(page, '[data-testid="win-sansset"]')), '| save btn', JSON.stringify(await inView(page, '[data-testid="sset-save"]')))
  await shot(page, `sweep-${size}-gear`)
  await press(size, tid(page, 'sset-cancel')); await page.waitForTimeout(250)
  await press(size, tid(page, 'sc-hl')); await page.waitForTimeout(250)
  L(size, 'HIGHLIGHT menu', JSON.stringify(await inView(page, '[data-testid="sc-hl-menu"]')))
  await shot(page, `sweep-${size}-hl`)
  await page.keyboard.press('Escape')
  L(size, 'errors', errors.join('|'))
  await ctx.close()
}
await browser.close()
