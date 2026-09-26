/* D262 walk, phone — what a 900 ms finger press on a day delivers while a chip is picked up (C12's miss): the events
   the page sees, and whether the day is staged. Read only apart from the move itself (cancelled at the end). */
const M = await import('./mv-lib.mjs')
const { browser, page, cdp } = await M.openMv('a')
await M.lwOpen(page, '2026-01-20')
await M.tapCell(page, 'bruise', '2026-01-23')
await M.press(page, 'decide-shift')
await page.waitForTimeout(500)
await page.evaluate(() => { window.__ev = []; for (const t of ['pointerdown', 'pointerup', 'pointercancel', 'contextmenu', 'click', 'touchstart', 'touchend', 'touchcancel']) document.addEventListener(t, e => window.__ev.push(`${t}${e.pointerType ? ':' + e.pointerType : ''}@${Math.round(performance.now())}${e.defaultPrevented ? '(prevented)' : ''}`), true) })
for (const hold of [300, 600, 900]) {
  const p = await M.at(page, 'cell-bruise-2026-01-26')
  await page.evaluate(() => { window.__ev = [] })
  await M.fingerHoldDrag(page, cdp, p, [], { holdMs: hold })
  const ev = await page.evaluate(() => window.__ev)
  console.log(hold, 'ms at', JSON.stringify(p), '→', await M.banner(page), '|', ev.join(' '))
  if (await page.locator('[data-testid="move-confirm"]:visible').count()) { /* un-stage: tap the chip's own day */ const q = await M.at(page, 'cell-bruise-2026-01-23'); await M.tapAt(page, q.x, q.y) }
}
await M.press(page, 'move-cancel')
await browser.close()
