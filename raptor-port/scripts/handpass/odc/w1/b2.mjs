// W1 part B2 — scenarios 12 and 16 at 390x844 (touch), a FRESH context (so the rule of 11 does not overlap this one). VERSION 1
import { start, signInAgain, openCalendarWindow, press, shot, text, rect, vis, swipeOn, cardOnTop, pass, rec, summary, results } from './lib.mjs'
console.log('w1/b2.mjs VERSION 1')
const SZ = '390x844'
const L = await start(390, 844)
const { page } = L
const month = () => text(L, '[data-testid="days-month"]')
const step = async (id, fn) => { try { await fn() } catch (e) { rec(id, SZ, 'NOT WALKED', 'the script stopped: ' + String(e).split('\n')[0].slice(0, 200)); await shot(L, `s${id}-STOPPED`).catch(() => {}) } }
const nfList = () => page.evaluate(() => [...document.querySelectorAll('[data-testid^="days-step-"]')].filter(b => /c-nf/.test(b.className)).map(b => b.getAttribute('data-testid').slice(15)))
const nfAll = async () => {
  const out = {}
  out[await month()] = await nfList()
  for (let i = 0; i < 2; i++) { await swipeOn(L, '[data-testid="days-grid"]', -140, 0, 0.5, 0.3); out[await month()] = await nfList() }
  for (let i = 0; i < 2; i++) await swipeOn(L, '[data-testid="days-grid"]', 140, 0, 0.5, 0.3)
  return out
}
await openCalendarWindow(L)

await step('12', async () => {
  await press(L, '[data-testid="days-wd-3"]'); await page.waitForSelector('[data-testid="win-every"]')
  const listed0 = await page.evaluate(() => !!document.querySelector('[data-testid="every-list"]'))
  const fromTxt = await text(L, '[data-testid="every-from"]')
  await press(L, '[data-testid="every-until-date"]')
  const untilBox = await text(L, '[data-testid="every-until"]')
  const fU = await shot(L, 's12-until-box-pick-a-date')
  await press(L, '[data-testid="every-until"]')
  const c = await cardOnTop(L, 'Until')
  const faint = await page.evaluate(() => {
    const d = iso => { const e = document.querySelector(`[data-testid="dcal-day-${iso}"]`); if (!e) return null; const s = getComputedStyle(e), b = getComputedStyle(e.querySelector('b') || e); return { cls: e.className, dis: e.disabled, aria: e.getAttribute('aria-disabled'), op: s.opacity, col: b.color } }
    return { before14: d('2026-10-14'), before10: d('2026-10-10'), from15: d('2026-10-15'), after16: d('2026-10-16'), after22: d('2026-10-22') }
  })
  const f1 = await shot(L, 's12-until-calendar-open')
  await page.locator('[data-testid="dcal-day-2026-10-12"]').tap({ force: true }).catch(() => {}); await page.waitForTimeout(400)
  const stillOpen = await vis(L, '[data-testid="dcal-card"]'), boxAfterEarly = await text(L, '[data-testid="every-until"]')
  const f2 = await shot(L, 's12-after-tap-earlier-date')
  if (stillOpen) { await page.locator('[data-testid="dcal-day-2026-11-12"]').tap().catch(() => {}) }
  /* the later date is in November: move the calendar there first if it is not on screen */
  if (await vis(L, '[data-testid="dcal-card"]')) { await press(L, '[data-testid="dcal-next"]'); await page.locator('[data-testid="dcal-day-2026-11-12"]').tap(); await page.waitForTimeout(400) }
  const gone = !(await vis(L, '[data-testid="dcal-card"]'))
  const untilAfter = await text(L, '[data-testid="every-until"]'), says = await text(L, '[data-testid="every-says"]')
  const f3 = await shot(L, 's12-after-tap-later-date')
  await press(L, '[data-testid="every-save"]'); await page.waitForTimeout(500)
  const nf = await nfAll(); const f4 = await shot(L, 's12-month-after-save')
  await press(L, '[data-testid="days-wd-3"]'); await page.waitForSelector('[data-testid="win-every"]')
  const listed = await page.evaluate(() => (document.querySelector('[data-testid="every-list"]') || {}).innerText || '(no list)')
  const f5 = await shot(L, 's12-window-reopened-list')
  const ok = /^Pick a date/.test(untilBox) && c.onScreen && c.onTop && !stillOpen === false && /^Pick a date/.test(boxAfterEarly) && gone && / to /.test(says) && /ALREADY SET/i.test(listed)
  pass('12', SZ, ok, `From read "${fromTxt}"; new Until box read "${untilBox}"; calendar box ${JSON.stringify({ l: c.l, t: c.t, r: c.r, b: c.b })} on screen ${c.onScreen} on top ${c.onTop}; look of dates (before From: ${JSON.stringify(faint.before14)}; the From date ${JSON.stringify(faint.from15)}; after ${JSON.stringify(faint.after16)}); tap on 12 Oct (before From): calendar ${stillOpen ? 'stayed open' : 'closed'}, Until box read "${boxAfterEarly}"; tap on Thu 12 Nov: calendar gone ${gone}, Until box "${untilAfter}", sentence "${says}"; after Save, NF by month ${JSON.stringify(nf)}; reopened window lists: "${listed.replace(/\s+/g, ' ')}" (list existed before the save: ${listed0})`, f3)
  await press(L, '[data-testid="every-cancel"]')
})
await step('16', async () => {
  const winBefore = await vis(L, '[data-testid="win-every"]')
  await page.reload(); await signInAgain(L)
  await page.waitForTimeout(500)
  const f0 = await shot(L, 's16-after-reload')
  await openCalendarWindow(L)
  const nf = await nfAll()
  await press(L, '[data-testid="days-wd-3"]'); await page.waitForSelector('[data-testid="win-every"]')
  const listed = await page.evaluate(() => (document.querySelector('[data-testid="every-list"]') || {}).innerText || '(no list)')
  const f1 = await shot(L, 's16-every-thursday-after-reload')
  pass('16', SZ, /ALREADY SET/i.test(listed) && /12 Nov/.test(listed), `after reload (signed in again if asked) the Every Thursday window lists "${listed.replace(/\s+/g, ' ')}"; NF by month ${JSON.stringify(nf)}`, f1)
})
console.log('\nRESULTS_JSON ' + JSON.stringify(results))
summary('b2')
await L.browser.close()
