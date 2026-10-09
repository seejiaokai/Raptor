import { chromium, launchOptions, world, shot, tid, cell, backToSans, press, fileCommit, readDayWin } from './cal-D-lib.mjs'
const browser = await chromium.launch(launchOptions)
const { ctx, page, errors } = await world(browser, 'side')
await backToSans(page, 'side', 2026, 7)
await press('side', cell(page, '2026-07-22'), { position: { x: 8, y: 8 } }); await tid(page, 'win-sansday').waitFor()
await fileCommit(page, 'side', 'vinci', { f: true }); await page.click('#inpEditSave'); await page.waitForTimeout(600)
await page.waitForTimeout(3500)   // let the toast go
const geo = () => page.evaluate(() => {
  const w = document.querySelector('[data-testid="win-sansday"]'), l = w.querySelector('[data-testid="sd-list"]'), r = l.getBoundingClientRect(), wr = w.getBoundingClientRect()
  const row = w.querySelector('[data-testid^="sd-row-"]'), rr = row && row.getBoundingClientRect()
  return { win: [Math.round(wr.top), Math.round(wr.bottom)], list: [Math.round(r.top), Math.round(r.bottom)], listClient: l.clientHeight, row: rr && [Math.round(rr.top), Math.round(rr.bottom)], rowVisibleInWindow: rr ? Math.max(0, Math.min(rr.bottom, wr.bottom) - Math.max(rr.top, wr.top)) : 0, cls: w.className, vh: innerHeight }
})
console.log('one entry, as it opens:', JSON.stringify(await geo()))
await shot(page, 'side-one-entry')
// tap the bar (the phone's pull-up)
await tid(page, 'win-sansday').locator('.win-ttl').tap(); await page.waitForTimeout(500)
console.log('after bar tap:', JSON.stringify(await geo()))
// drag the window by its bar to the top of the screen
const bar = await tid(page, 'win-sansday').locator('.win-bar').boundingBox()
const cdp = await page.context().newCDPSession(page)
const a = { x: Math.round(bar.x + 200), y: Math.round(bar.y + 10) }
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...a, id: 1 }] })
for (let i = 1; i <= 8; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a.x, y: a.y - Math.round((a.y - 6) * i / 8), id: 1 }] }); await page.waitForTimeout(30) }
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
await page.waitForTimeout(500)
console.log('after dragging the bar to the top:', JSON.stringify(await geo()))
await shot(page, 'side-one-entry-dragged')
console.log(errors.join('|'))
await ctx.close(); await browser.close()
