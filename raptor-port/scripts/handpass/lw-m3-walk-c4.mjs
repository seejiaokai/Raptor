// Scenario 24: Rearrange on, a heading tap. usage: node lw-m3-walk-c4.mjs <desk|phone> <chromium|webkit>
import * as L from './lw-m3-walk-c-lib.mjs'
const size = process.argv[2] || 'desk', engine = process.argv[3] || 'chromium'
const P = `s24-${size}-${engine}-`
console.log('lw-m3-walk-c4 v1', size, engine)
L.clearPrefix(P)
const w = await L.newCtx(size, engine)
await L.signIn(w, 'admin')
const { page } = w
const state = () => page.evaluate(() => ({
  undoDisabled: document.querySelector('#undoBtn')?.disabled ?? null,
  bar: (document.querySelector('.mx-bar, .lw-bar, [data-testid="grid-bar"]') || {}).innerText || null,
  arranging: !!document.querySelector('.mx-arranging'),
  grips: document.querySelectorAll('.mx-arranging [draggable="true"], .grip, [data-grow]').length,
  selected: document.querySelectorAll('.sel, .selected, .mx-sel, td.sel').length,
  panel: !!document.querySelector('[data-testid="lwday-body"]'),
  panelIso: document.querySelector('[data-testid="lwday-body"]')?.dataset.iso ?? null,
  sheets: [...document.querySelectorAll('[data-testid="bid-picker"], [data-testid="sel-sheet"], .sheet')].filter(e => e.getBoundingClientRect().height > 0).length,
  rowOrder: [...document.querySelectorAll('[data-testid^="row-"]')].slice(0, 6).map(e => e.dataset.testid).join(','),
  text: document.querySelector('#page-leavewar').innerText.slice(0, 160).replace(/\n+/g, ' | '),
}))
await L.gotoMonth(w, 'JUL')
console.log('before', JSON.stringify(await state()))
// turn Rearrange on
await L.press(w, L.T('settings-open')); await page.waitForTimeout(500)
await L.press(w, L.T('settings-rearrange')); await page.waitForTimeout(800)
await L.shot(w, P + '01-rearrange-on')
const on = await state(); console.log('rearrange on', JSON.stringify(on))
if (!on.arranging) console.log('NOTE: arranging class not found - check the picture')
// heading tap
const wr = []
page.on('console', m => { if (/error/i.test(m.type())) wr.push(m.text()) })
await L.press(w, L.T('head-2026-07-15'), w.phone ? { quick: P + '02-heading-tap' } : {}); await page.waitForTimeout(600)
await L.shot(w, P + '03-after-heading-tap')
const aft = await state(); console.log('after heading tap', JSON.stringify(aft))
// a second tap on another heading with the panel open
await L.press(w, L.T('head-2026-07-16'), w.phone ? { quick: P + '04-heading2-tap' } : {}); await page.waitForTimeout(600)
await L.shot(w, P + '05-after-heading2-tap')
console.log('after 2nd heading tap', JSON.stringify(await state()))
// a press-hold-move on a heading (a drag attempt)
if (!w.phone) {
  const b = await page.locator(L.T('head-2026-07-20')).first().boundingBox()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await page.mouse.move(b.x + b.width / 2 + 120, b.y + b.height / 2 + 5, { steps: 6 }); await page.waitForTimeout(150)
  await L.shot(w, P + '06-heading-drag-mid'); await page.mouse.up(); await page.waitForTimeout(500)
  await L.shot(w, P + '07-heading-drag-end')
  console.log('after heading drag', JSON.stringify(await state()))
}
console.log('errors', JSON.stringify(w.errs))
await L.closeBrowser()
