/* w3 item 13, follow-up: at 1440 the save corner grows 172 → 291px when
   ✓ Save changes appears, and the spacer absorbs it. At a narrower desktop
   window, does that growth wrap the bar — the header growing and the chart
   sliding down under the pointer, which the slot's own comment says it exists
   to prevent? Widths from 1060 (just above the phone layout) to 1440. */
import { open, shot, save, log } from './trk-lib.mjs'
import { sleep, menuItem, dlg, box } from './trk-w3-lib.mjs'

const L = log()
for (const width of [1060, 1150, 1250, 1350]) {
  const { browser, page, errors } = await open({ size: { width, height: 900 }, who: 'a' })
  const h0 = await box(page, '#page-tracker header'), b0 = await box(page, '#board')
  await menuItem(page, 'syl', 'arrangeBtn')
  await page.locator('#arrTools button', { hasText: '+ Test' }).click(); await sleep(250); await dlg(page, { value: 'W' + width }); await sleep(300)
  await menuItem(page, 'syl', 'arrangeBtn')
  const h1 = await box(page, '#page-tracker header'), b1 = await box(page, '#board')
  L.ok(`${width}px: ✓ Save changes appears — the bar keeps its height and the chart does not move`, h0.h === h1.h && b0.y === b1.y, `bar ${h0.h} → ${h1.h}px; chart top ${b0.y} → ${b1.y}`)
  await shot(page, `w3-13b-${width}-save-shown`, { el: '#page-tracker header' })
  L.note(`${width} errors`, errors.join(' | ') || 'none')
  await browser.close()
}
save('w3-13b-save-widths', { rows: L.rows })
