// WALKER A — an extra look found while walking 5: does the lit row let go when the Person filter is changed?
import * as L from './ivet-A-lib.mjs'
const { WIN } = L
const lit = p => p.evaluate(() => document.querySelectorAll('#inBody tr.innew, #inList .innew, [data-testid^="inl-row-"].innew').length)
async function run(viewport, touch, who, pass, tag) {
  const { ctx, page } = await L.open(viewport, who, pass, touch)
  await L.toList(page, touch)
  const out = { tag }
  /* a hiding Person filter on: pick Ace if the list has the box visible (phone: open the filters) */
  if (touch) { await page.locator('#inFiltersBtn').tap(); await page.waitForTimeout(200) }
  const before = await page.locator('#inFPerson').inputValue()
  await page.selectOption('#inFPerson', await L.csId(page, 'Wisp')); await page.waitForTimeout(200)
  if (touch) { await page.locator('#inFiltersBtn').tap(); await page.waitForTimeout(200) }
  await L.plus(page, touch)
  await page.selectOption('#inpEditType', 'Meeting'); await L.pick(page, '2026-07-21', touch); await page.fill('#inpEditRmk', 'extra lit')
  const had = await L.ids(page)
  await L.press(touch, page.locator('#inpEditSave')); await page.locator(WIN).waitFor({ state: 'hidden' })
  const made = await L.newest(page, had)
  await page.waitForTimeout(400)
  out.afterSave = { first: await L.rowOf(page, made[0].iid), lit: await lit(page) }
  out.shot1 = await L.shot(page, `X-${tag}-after-save`)
  /* touch the Person filter */
  if (touch && !(await page.locator('#inFPerson').isVisible())) { await page.locator('#inFiltersBtn').tap(); await page.waitForTimeout(250) }
  await page.selectOption('#inFPerson', 'all'); await page.waitForTimeout(400)
  out.afterPersonChange = { row: await L.rowOf(page, made[0].iid), lit: await lit(page) }
  out.shot2 = await L.shot(page, `X-${tag}-after-person-change`)
  out.was = before
  await ctx.close()
  return out
}
const a = await run(L.DESK, false, 'ad', 'a', 'desk')
const b = await run(L.PHONE, true, 'ad', 'a', 'phone')
console.log(JSON.stringify([a, b], null, 1))
await L.browser.close()
