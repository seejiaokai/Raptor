import { open, fileInput, toWeek, toView, shot, saveRes, errs, browser, toast, inputsOf, become, signAndPublish } from './or-L-lib.mjs'
const R = {}
const { ctx, page } = await open('ad', 'a')
R.filed = await fileInput(page, { type: 'Training', person: 'Ranger', from: '2026-07-15', to: '2026-07-15', timed: ['10:00', '11:00'], title: 'L18 training' })
R.pub = await signAndPublish(page)
await become(page, 'Ranger', 'member')
await toView(page)
R.page = await page.evaluate(() => window.CURPAGE)
const openStuff = () => page.evaluate(() => ({
  wins: [...document.querySelectorAll('[data-testid^="win-"], .win, .airpop, [role=dialog], #inpEditPop, .chgwin, .modal, .sheet')].filter(e => e.offsetParent).map(e => (e.dataset.testid || e.id || e.className.toString().slice(0, 30))),
  toast: (document.getElementById('toastEl')?.innerText || '').replace(/\s+/g, ' ').trim(),
  sel: [...document.querySelectorAll('#vWeek .sel, #vWeek .selected, #vWeek .puck.sel, #vWeek [class*=hl-on]')].length,
}))
const day = () => page.locator('#vWeek .day:not(.peek)').nth(2)
R.taps = []
const tap = async (what, loc) => {
  if (!(await loc.count())) { R.taps.push({ what, found: false }); return }
  await loc.scrollIntoViewIfNeeded(); await page.waitForTimeout(250)
  const b = await loc.boundingBox()
  const before = await openStuff()
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await page.waitForTimeout(700)
  const after = await openStuff()
  const tag = what.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  await shot(page, `l18-${tag}`)
  R.taps.push({ what, found: true, before, after })
  await page.keyboard.press('Escape'); await page.waitForTimeout(250)
}
const row = day().locator('.sec-grnd .pl-row', { hasText: 'L18 TRAINING' })
await tap("row name 'L18 TRAINING'", row.locator('.nm .ntx').first())
await tap("Ranger's puck on his row", row.locator('.puck', { hasText: 'Ranger' }).first())
await tap('the row start time', row.locator('.t-s').first())
await tap('the row remark', row.locator('.rmk').first())
await page.evaluate(() => { const d = [...document.querySelectorAll('#vWeek .day:not(.peek)')][2]; const pk = [...d.querySelectorAll('.puck')].find(p => !p.closest('.sec-grnd,.sec-duty,.sec-sim,.sec-unav,.sec-sans,.sec-avail,.sec-inp,.sec-prog') && p.offsetParent); if (pk) pk.setAttribute('data-l18fly', '1') })
await tap("a flying line's puck (first one on the wave)", page.locator('[data-l18fly="1"]').first())
await tap('a duty desk puck', day().locator('.sec-duty .puck').first())

await tap('Personal Inputs line (if drawn)', day().locator('.sec-inp .pl-row, .sec-pinp .pl-row').first())
R.personalInputsDrawnOnView = await day().locator('.sec-inp').count()
saveRes('L18', R)
console.log(JSON.stringify(R, null, 1))
console.log('ERRS', errs.join('\n'))
await browser.close()
