/* CALENDAR STEP TWO — a probe of the OIL credit's date box: is its calendar still up a moment after it opened, and what
   takes it down? (the walk's C6 found it gone after its picture). usage as cal2-walk.mjs [desk|phone] */
import * as L from './dl-lib.mjs'
const w = await L.world(process.argv[2] || 'desk')
const p = w.page
const tid = t => `[data-testid="${t}"]`
try {
  await L.go(w, 'leavewar'); await p.waitForSelector('[data-testid^="row-"]'); await L.sleep(600)
  await w.press(tid('oil-tracker')); await p.waitForSelector(tid('oil-sheet'))
  const nm = await p.evaluate(() => document.querySelector('[data-testid^="oil-name-"]')?.getAttribute('data-testid'))
  await w.press(tid(nm)); await p.waitForSelector(tid('oil-date'))
  const b = await p.locator(tid('oil-date')).evaluate(e => { e.scrollIntoView({ block: 'center', inline: 'nearest' }); return null }); await L.sleep(200)
  const at = await p.locator(tid('oil-date')).evaluate(e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
  await p.mouse.click(at.x, at.y)
  for (const ms of [0, 300, 600, 1200, 2500]) {
    await L.sleep(ms)
    console.log(ms, 'card', await p.locator(tid('dcal-card')).count(), 'cal', await p.locator(`${tid('dcal-card')} .dcal`).count(), 'panel', await p.locator(tid('oil-credit-panel')).count())
  }
} finally { await L.close(w) }
