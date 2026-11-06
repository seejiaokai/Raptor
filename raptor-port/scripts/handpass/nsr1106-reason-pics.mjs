// [NOTSAVED-REFUSAL-LOOK] a question for him, pictured (D921): the schedule's refusal that carries its own reason —
// "<reason> — nothing was saved" (ui/inputedit.tsx, the save of an input of several people when a check refuses it) — was
// not in his drawing (D1665's list), so it stays amber as built. Pictured as it is and as the grey "Blocked:" note would
// show it, raised through the app's own note with a sample reason over Edit Schedule.
// Usage (from raptor-port/): WALK_DIR=dist MG_OUT=<folder> node scripts/handpass/nsr1106-reason-pics.mjs
import * as L from './mg1105-lib.mjs'
import { join } from 'node:path'
const WHY = 'Ranger is already on leave that day'
for (const size of ['desktop', 'phone']) {
  const sx = size === 'desktop' ? 'desk' : 'phone'
  const { page } = await L.open(size)
  await L.signIn(page, 'ad', 'a')
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(1300)
  const crop = async (name) => { const b = await page.locator('#toastEl').boundingBox(); const vw = page.viewportSize(); const x = Math.max(0, b.x - 30), y = Math.max(0, b.y - 30); await page.screenshot({ path: join(L.OUT, name + '.png'), clip: { x, y, width: Math.min(vw.width - x, b.width + 60), height: Math.min(vw.height - y, b.height + 60) } }) }
  await page.evaluate((w) => window.toast(`${w} — nothing was saved for anyone: take that person off the list, or change it`, 'warn'), WHY); await page.waitForTimeout(300)
  await crop(`Q1-reason-today-${sx}`)
  await page.evaluate((w) => window.toast(`Blocked: ${w}. Nothing was saved for anyone: take that person off the list, or change it.`, 'blocked'), WHY); await page.waitForTimeout(300)
  await crop(`Q1-reason-grey-${sx}`)
  await page.context().close()
}
process.exit(0)
