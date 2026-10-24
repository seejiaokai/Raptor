// probe: which days of the year read "Not open for bidding" in the panel (admin, desktop, fresh world, nothing opened)
import * as L from './lw-m3-walk-c-lib.mjs'
console.log('lw-m3-walk-c2 v1')
const w = await L.newCtx('desk')
await L.signIn(w, 'admin')
const { page } = w
const res = []
for (const iso of ['2026-01-02', '2026-02-10', '2026-03-10', '2026-04-10', '2026-05-10', '2026-06-10', '2026-07-10', '2026-07-15', '2026-08-10', '2026-09-10', '2026-10-10', '2026-10-22', '2026-10-23', '2026-10-24', '2026-11-10', '2026-12-10']) {
  if (await L.vis(page, L.T('win-lwday-x'))) { await L.press(w, L.T('win-lwday-x')); await page.waitForTimeout(250) }
  await L.press(w, L.T('head-' + iso)); await page.waitForTimeout(400)
  const t = await page.locator(L.T('lwday-body')).first().innerText()
  res.push(iso + ': ' + (/Not open for bidding/.test(t) ? 'NOT-OPEN-LINE' : 'no line') + ' | ' + t.split('\n').slice(0, 2).join('/'))
}
console.log(res.join('\n'))
await L.closeBrowser()
