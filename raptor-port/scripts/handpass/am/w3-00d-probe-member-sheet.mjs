/* w3 PROBE 4 — what a member's own Leave War cell sheet offers (to give the member an undoable change of his own). */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w3'
const L = await import('./w3-lib.mjs')
const { open, STATE, go, shot, watchToasts, toasts } = L
const { browser, page, errors } = await open({ state: STATE, who: 'm' })
await watchToasts(page)
await go(page, 'leavewar'); await page.waitForTimeout(1200)
const me = await page.evaluate(() => ((document.querySelector('[data-testid="lw-viewing"] .vwho') || {}).innerText || '').trim())
const pid = await page.evaluate(c => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === c), me)
console.log('member views as', me, pid)
const mon = page.locator('[data-testid="month-JUL"]'); if (await mon.count()) { await mon.first().click(); await page.waitForTimeout(1000) }
for (const d of ['2026-07-22', '2026-07-27']) {
  const el = page.locator(`[data-testid="cell-${pid}-${d}"]`).first()
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' })); await page.waitForTimeout(300)
  const bx = await el.boundingBox(); await page.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2); await page.mouse.down(); await page.waitForTimeout(100); await page.mouse.up(); await page.waitForTimeout(900)
  console.log(d, JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[class*=sheet]')].filter(e => e.offsetParent).map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 400)))))
  console.log('buttons', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[class*=sheet] button')].filter(e => e.offsetParent).map(e => e.innerText.trim()))))
  await shot(page, 'probe-member-sheet-' + d)
  await page.keyboard.press('Escape'); await page.waitForTimeout(400)
}
console.log('toasts', await toasts(page), 'errors', errors)
await browser.close()
