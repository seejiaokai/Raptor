/* w3 item 13, follow-up 2: the width band where the first structure edit
   wraps the bar, and whether it happens WHILE arranging (the chart sliding
   under the pointer between two clicks of an edit). Admin and member (the
   member has no ⇪ File on this build, so their bar is shorter). */
import { open, shot, save, log } from './trk-lib.mjs'
import { sleep, menuItem, dlg, box } from './trk-w3-lib.mjs'

const L = log()
const band = []
for (const who of ['a', 'u']) {
  for (const width of [1200, 1230, 1260, 1280, 1300, 1320, 1340]) {
    const { browser, page } = await open({ size: { width, height: 800 }, who })
    await menuItem(page, 'syl', 'arrangeBtn')
    const h0 = await box(page, '#page-tracker header'), b0 = await box(page, '#board')
    await page.locator('#arrTools button', { hasText: '+ Test' }).click(); await sleep(250); await dlg(page, { value: 'W' + width }); await sleep(400)
    const h1 = await box(page, '#page-tracker header'), b1 = await box(page, '#board')
    const moved = b1.y - b0.y
    band.push(`${who === 'a' ? 'admin' : 'member'} ${width}: bar ${h0.h}→${h1.h}, chart ${moved ? 'moved ' + moved + 'px' : 'still'}`)
    if (moved && (width === 1280)) await shot(page, `w3-13c-${who === 'a' ? 'admin' : 'member'}-1280-after-first-edit`)
    await browser.close()
  }
}
L.note('while arranging, the first structure edit (+ Test)', band.join(' · '))
const hit = band.filter(s => /moved/.test(s))
L.ok('no desktop width makes the chart slide when ✓ Save changes first appears', !hit.length, hit.join(' · ') || 'none')
save('w3-13c-save-wrap', { rows: L.rows })
