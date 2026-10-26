// W1 explore 3 — VERSION 1: build the Delete posting on Hex and look at the Post out sheet
import { openWorld, tools } from './w1-lib.mjs'
const which = process.argv[2] || 'desktop'
const w = await openWorld(which)
const t = tools(w, `w1-${which}-explore3`)
const { page } = w
const H = 'rocky'
const D10 = t.addDays(10), D11 = t.addDays(11)
await t.go('leavewar')
const tap = async (id, iso) => {
  await t.press(`[data-testid="month-${t.monthOf(iso)}"]`); await page.waitForTimeout(700)
  const c = page.locator(`[data-testid="cell-${id}-${iso}"]`).first()
  await c.scrollIntoViewIfNeeded(); await page.waitForTimeout(200)
  await t.press(`[data-testid="cell-${id}-${iso}"]`); await page.waitForTimeout(400)
}
await tap(H, D10)
await t.press('[data-testid="bid-postout"]')
await t.press('[data-testid="po-delete"]')
console.log('po-date', await t.val('[data-testid="po-date"]'), 'confirm text', await t.text('[data-testid="po-confirm"]'))
await t.press('[data-testid="po-confirm"]')
console.log('confirm text after 1', await t.text('[data-testid="po-confirm"]'))
await t.shot('armed')
await t.press('[data-testid="po-confirm"]')
await page.waitForTimeout(500)
console.log('sheet open?', await t.vis('[data-testid="postout-sheet"]'), await t.vis('[data-testid="po-confirm"]'))
console.log('PEOPLE rocky', JSON.stringify(await page.evaluate(() => window.PEOPLE.rocky)).slice(0, 800))
await tap(H, D11)
await t.shot('struck-tap')
const tids = await page.evaluate(() => [...document.querySelectorAll('[data-testid^="postout"]')].map(e => e.getAttribute('data-testid') + '=' + (e.getAttribute('data-value') || '') + ' [' + e.innerText.replace(/\n/g, ' / ').slice(0, 90) + '] pressed=' + e.getAttribute('aria-pressed') + ' cls=' + e.className))
console.log(tids.join('\n'))
console.log('errors', JSON.stringify(w.errors))
await w.browser.close()
