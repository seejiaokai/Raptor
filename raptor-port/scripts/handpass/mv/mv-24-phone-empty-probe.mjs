/* D262 re-walk, phone — where an "empty area outside the grid" is on a phone (the grid fills the width; its margins are
   a few pixels and a finger there is snapped to the grid's edge): the labels in the bars above it. Read only. */
const M = await import('./mv-lib.mjs')
const { browser, page } = await M.openMv('a')
await M.lwOpen(page, '2026-01-20')
await M.tapCell(page, 'bruise', '2026-01-23')
await M.press(page, 'decide-shift')
await page.waitForTimeout(500)
await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(400)
const cands = await page.evaluate(() => [...document.querySelectorAll('section.page *')].filter(e => e.children.length === 0 && /^(BIDDING ON|UNDER-MANNED|STAGE|PERIOD)$/i.test((e.textContent || '').trim())).map(e => { const b = e.getBoundingClientRect(); return { t: e.textContent.trim(), x: Math.round(b.left + b.width / 2), y: Math.round(b.top + b.height / 2) } }))
console.log(JSON.stringify(cands))
for (const c of cands) {
  if (!(await M.banner(page))) { await M.tapCell(page, 'bruise', '2026-01-23'); await M.press(page, 'decide-shift'); await page.waitForTimeout(500); await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(400) }
  await page.evaluate(() => { window.__t = '' ; document.addEventListener('click', e => { window.__t = (e.target.getAttribute && (e.target.getAttribute('data-testid') || e.target.className)) || e.target.tagName }, { capture: true, once: true }) })
  await M.tapAt(page, c.x, c.y)
  console.log(c.t, '→ target', await page.evaluate(() => window.__t), '| move on:', !!(await M.banner(page)))
}
await browser.close()
