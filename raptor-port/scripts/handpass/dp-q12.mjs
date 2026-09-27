/* [DRAFT-PENDING] — pictures for the look card's question 12 (28 Sep 26): what the changes window says after an admin
   DELETES a man who had leave, bids and an OIL award still to come. A — as built: his "deleted" line, each future input,
   each future bid and each OIL award removed, one line each (every line on its own day). B — the alternative: his one
   "deleted" line only. The lines are placed in the history in exactly the words the app writes (state/changelines.ts:
   personLines, inputLines, crossLines), on the week of 28 Sep 26, so one window shows them together; desktop width. */
import { chromium } from '@playwright/test'
import { existsSync, mkdirSync, rmSync } from 'node:fs'

const BASE = process.env.HP_URL || 'http://localhost:4182'
const OUT = (process.env.HP_SHOTS || 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-28-draft-pending') + '/q12'
rmSync(OUT, { recursive: true, force: true }); mkdirSync(OUT, { recursive: true })
const CHROMIUM = '/opt/pw-browsers/chromium'
const browser = await chromium.launch({ headless: true, ...(existsSync(CHROMIUM) ? { executablePath: CHROMIUM } : {}) })
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
const wait = ms => page.waitForTimeout(ms)
await page.goto(BASE + '/?fresh=1')
await page.waitForSelector('#luser'); await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a')
await page.click('#loginForm button[type=submit]'); await page.waitForSelector('#vWeek .day', { state: 'attached' }); await wait(400)
await page.evaluate(() => window.go('editsched')); await wait(400)
await page.evaluate(() => window.loadWeek('28/09/2026')); await wait(600)

const put = (rows) => page.evaluate((rows) => {
  const E = window.ELOG
  E.rows.length = 0
  let t = Date.now() - 60_000
  for (const r of rows) E.rows.push({ seq: E.next++, t: (t += 1000), who: 'Saber', pid: 'stiff', di: null, key: '', from: '', to: '', ...r })
}, rows)
const open = async (name) => {
  await page.evaluate(() => window.go('editsched')); await wait(300)
  if (await page.locator('.chgwin:not([hidden])').count()) { await page.click('.chgwin .win-x'); await wait(200) }
  await page.click('#histBtn'); await wait(400)
  await page.click('.chgwin .win-tab:has-text("All changes")'); await page.click('.chgwin .cw-day:has-text("Week")'); await wait(300)
  await page.locator('.chgwin').screenshot({ path: `${OUT}/${name}.png` })
}

const deleted = { lbl: 'Ranger · deleted', from: 'no', to: 'yes', sect: 'quals', date: '2026-09-28', sub: 'bane', fld: 'deleted' }
/* A — as built */
await put([
  deleted,
  { lbl: 'Ranger · LL deleted · 30 Sep', sect: 'abs', date: '2026-09-30', iid: 'q12a', sub: 'bane' },
  { lbl: 'Leave War · Ranger · LL 1 Oct: bid removed', sect: 'abs', date: '2026-10-01', sub: 'bane' },
  { lbl: 'Leave War · Ranger · LL 2 Oct: bid removed', sect: 'abs', date: '2026-10-02', sub: 'bane' },
  { lbl: 'Leave War · Ranger · FO 3 Oct: OIL award taken away', sect: 'abs', date: '2026-10-03', sub: 'bane' },
])
await open('a-as-built')
/* B — his one line */
await put([deleted])
await open('b-one-line')
console.log('done → ' + OUT)
await browser.close()
