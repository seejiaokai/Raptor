// D1666 (5 Nov 26): the ?savefail test switch on the real build — the app opens as usual on what is saved, signing in works,
// the first save is refused so the "Not saved" band comes up (and the pass reads "Not sent yet"); without the switch, nothing.
// Usage (from raptor-port/): WALK_DIR=<frozen dist> node scripts/handpass/mgb-savefail.mjs
import { chromium, webkit } from '@playwright/test'
import { serveFrozen } from './isr-serve.mjs'
console.log('[mgb-savefail v1]')
const URL = 'http://localhost:4251/'
const OUT = 'docs/img/handpass/2026-11-05-member-guest-build/savefail'
let bad = 0
const say = (ok, what, got) => { if (!ok) bad++; console.log(`${ok ? 'PASS' : 'FAIL'} ${what} — ${JSON.stringify(got)}`) }
for (const [name, engine, opts] of [['phone', webkit, { viewport: { width: 402, height: 874 }, isMobile: true, hasTouch: true }], ['desk', chromium, { viewport: { width: 1536, height: 864 } }]]) {
  const b = await engine.launch()
  const ctx = await b.newContext({ ...opts, deviceScaleFactor: 2 })
  await serveFrozen(ctx, URL)
  const page = await ctx.newPage()
  const errs = []; page.on('pageerror', e => errs.push(e.message))
  /* a stranger asks for access with the switch on */
  await page.goto(URL + '?savefail'); await page.waitForSelector('#luser')
  await page.fill('#luser', 'kite'); await page.fill('#lpass', 'x'); await page.click('#loginForm button[type=submit]')
  await page.waitForSelector('#accessRequest')
  await page.fill('#accCs', 'Kite'); await page.selectOption('#accSeat', 'FCP'); await page.selectOption('#accCat', 'C')
  await page.click('#accSend'); await page.waitForSelector('#accessWaiting')
  const band = await page.waitForSelector('.saveband.is-screen', { timeout: 8000 }).then(() => true, () => false)
  const mark = await page.locator('.pass-state').textContent()
  say(band && mark === 'Not sent yet', `${name}: ?savefail — the band and "Not sent yet"`, { band, mark })
  await page.screenshot({ path: `${OUT}/kite-${name}.png` })
  /* Retry is refused again while the switch is on */
  await page.locator('.saveband.is-screen button').click(); await page.waitForTimeout(1500)
  say(await page.locator('.saveband.is-screen').count() === 1, `${name}: Retry refused again, the band stays`, {})
  /* an admin with the switch on: the app opens as usual on what is saved; a change brings the band */
  await page.locator('#accOut').click(); await page.waitForSelector('#luser')
  await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
  const up = await page.waitForSelector('#vWeek .day, #eWeek .day', { timeout: 10000 }).then(() => true, () => false)
  say(up, `${name}: the app opens with the switch on`, { up })
  await page.evaluate(() => window.go('editsched')); await page.waitForTimeout(800)
  const top = await page.waitForSelector('.topbar > .savestat.failed', { timeout: 8000 }).then(() => true, () => false)
  say(top, `${name}: the band in the top bar`, { top })
  await page.screenshot({ path: `${OUT}/admin-${name}.png` })
  /* without the switch, a fresh tab saves as always */
  const p2 = await ctx.newPage(); await p2.goto(URL); await p2.waitForSelector('#luser')
  await p2.fill('#luser', 'ad'); await p2.fill('#lpass', 'a'); await p2.click('#loginForm button[type=submit]')
  await p2.waitForSelector('#vWeek .day, #eWeek .day', { timeout: 10000 }); await p2.waitForTimeout(1500)
  say(await p2.locator('.savestat.failed, .saveband').count() === 0, `${name}: without the switch, no band`, {})
  say(errs.length === 0, `${name}: no page error`, errs)
  await b.close()
}
console.log(bad ? `${bad} FAIL` : 'all PASS')
process.exit(0)
