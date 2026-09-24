/* w3 PROBE 2 (24 Sep 26) — can the "Withdraw — confirm" arm be reached through the app's own controls?
   A Saturday earner spends OIL on the Leave War (a bid on weekdays), then Saturday's Unpublish is tapped
   ONCE: does it arm and warn? Explores only; the real walk is w3-03. */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w3'
const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/2026-09-24-amendment-week.json'
const L = await import('./am-lib.mjs')
const { open, editWeek, head, go, shot, toastText } = L
const { browser, page, errors } = await open({ state: STATE })
const log = (k, v) => console.log(k.padEnd(20), typeof v === 'string' ? v : JSON.stringify(v))
const who = process.argv[2] || 'Saber'
const pid = await page.evaluate(cs => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === cs), who)
log('person', `${who} = ${pid}`)
await go(page, 'leavewar'); await page.waitForTimeout(1200)
const mon = page.locator('[data-testid="month-JUL"]')
if (await mon.count()) { await mon.first().click(); await page.waitForTimeout(1200) }
async function press(sel) {
  const el = page.locator(sel).first()
  if (!(await el.count())) return 'no ' + sel
  await el.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'center' }))
  await page.waitForTimeout(300)
  const b = await el.boundingBox(); if (!b) return 'no box'
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
  await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up()
  await page.waitForTimeout(900)
  return 'pressed'
}
const sheets = () => page.evaluate(() => [...document.querySelectorAll('[class*=sheet]')].filter(e => e.offsetParent).map(e => (e.innerText || '').replace(/\s+/g, ' ').slice(0, 500)))
for (const d of ['2026-07-21', '2026-07-22', '2026-07-23']) {
  log('press ' + d, await press(`[data-testid="cell-${pid}-${d}"]`))
  log('sheet', await sheets())
  const b = page.locator('[class*=sheet] button:visible').filter({ hasText: /^OIL$/ }).first()
  if (await b.count()) { await b.click(); await page.waitForTimeout(900) } else log('no OIL button', '')
  await page.keyboard.press('Escape'); await page.waitForTimeout(500)
  log('cell now', await page.evaluate(([p, dd]) => { const c = document.querySelector(`[data-testid="cell-${p}-${dd}"]`); return c ? (c.innerText || '').trim() + ' | ' + c.className.slice(0, 80) : 'none' }, [pid, d]))
}
await shot(page, 'probe-lw-bids')
await editWeek(page)
log('sat head', await head(page, 5))
const u = page.locator('#eWeek [data-unpub="5"]:visible').first()
await u.evaluate(e => e.scrollIntoView({ block: 'center' })); await u.click(); await page.waitForTimeout(800)
log('toast', await toastText(page))
log('sat head after 1 tap', await head(page, 5))
console.log('errors', errors)
await browser.close()
