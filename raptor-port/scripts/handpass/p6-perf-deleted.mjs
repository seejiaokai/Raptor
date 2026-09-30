/* phase 6 check — what the read-time overlay costs once someone IS deleted (30 Sep 26). `npm run perf` boots the demo, where
   nobody is deleted, so the overlay returns at once and costs nothing there. After a delete it runs on every read of a week
   whose days reach his cutoff — inside validate(), which runs on every keystroke (the crew-rest look-back and look-ahead read
   the neighbouring weeks). Measured: 60 validate() calls before and after two deletes (Hex, Anvil — Admin → Users), the
   median per call, on the build given by HP_URL. Run it on this branch and the build before phase 6. */
import { boot, world } from './p6-lib.mjs'
const { L } = await boot()
const { browser, p } = await world(L)
const time = () => p.evaluate(() => {
  /* the fixed clock coarsens the timer to whole milliseconds, so each sample times 300 calls and divides; median of 5 */
  for (let i = 0; i < 20; i++) window.validate()
  const t = []; for (let k = 0; k < 5; k++) { const a = performance.now(); for (let i = 0; i < 300; i++) window.validate(); t.push((performance.now() - a) / 300) }
  t.sort((x, y) => x - y); return +t[2].toFixed(3)
})
const before = await time()
for (const pid of ['rocky', 'shaft']) {
  await L.go(p, 'admin')
  if (!(await p.locator('#accList').isVisible().catch(() => false))) { await p.locator('.adm-cat', { hasText: 'Users' }).first().click().catch(() => {}); await L.sleep(400) }
  await p.waitForSelector('#accList')
  await p.locator(`#accList [data-person="${pid}"] .acc-tap`).click(); await L.sleep(300)
  await p.locator('#accEdDel').click(); await L.sleep(200); await p.locator('#accEdDel').click(); await L.sleep(900)
}
await L.go(p, 'editsched')
const after = await time()
/* the same on week 2 (a week never saved — the seed branch clones per read) */
await p.evaluate(() => window.loadWeek('20/07/2026')); await L.sleep(800)
const afterW2 = await time()
console.log(JSON.stringify({ url: process.env.HP_URL, deleted: await p.evaluate(() => Object.keys(window.PEOPLE).filter(k => window.PEOPLE[k].deleted)), validateMedianMs: { before, afterTwoDeletes: after, afterTwoDeletesOnWeek2: afterW2 } }))
await browser.close()
