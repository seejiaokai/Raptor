/* w4 probe — WHY does Tuesday not say "This day started earning OIL after it was published"? Declares the PH
   through the war's event row (the app's own door, as w4-08 does) and then RECORDS what the book holds: the
   issued Original's frozen OIL block, and the day's warning codes. Reads only. */
process.env.HP_SHOTS = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-24-amendment/w4/probe'
const L = await import('./w4-lib.mjs')
const { open, STATE, DESK, lwOpen, editWeek } = L
const { browser, page, errors } = await open({ ...DESK, state: STATE })
const snapInfo = () => page.evaluate(() => {
  const out = {}
  for (const di of [1, 5]) {
    const v = window.dayCurVer(di), s = v != null ? window.daySnapOf(di, v) : null
    const ev = s && s.d ? s.d.oilev : undefined
    out[di] = { ver: v, snapHasDay: !!(s && s.d), oilev: ev === undefined ? 'UNDEFINED (no frozen OIL block)' : { earns: ev.earns, keys: Object.keys(ev).slice(0, 12) } }
  }
  out.warnTue = ((window.WARN.byDay || {})[1] || { warns: [] }).warns.map(w => w.code)
  return out
})
await editWeek(page)
console.log('BEFORE the PH', JSON.stringify(await snapInfo()))
await lwOpen(page, '2026-07-14')
await page.locator('[data-testid="event-0-2026-07-14"]').first().click(); await page.waitForTimeout(500)
await page.locator('[data-testid="event-text"]').first().fill('PH')
await page.locator('[data-testid="event-apply"]').first().click(); await page.waitForTimeout(900)
await editWeek(page)
console.log('AFTER the PH', JSON.stringify(await snapInfo()))
/* does the day's warning list catch up by itself? — after a moment, after a schedule edit elsewhere in the
   week (Wednesday's note — a Raptor write re-runs the checks), and after a reload */
await page.waitForTimeout(2000)
console.log('AFTER 2s', JSON.stringify((await snapInfo()).warnTue))
await page.reload(); await L.login(page); await editWeek(page)
console.log('AFTER A RELOAD', JSON.stringify((await snapInfo()).warnTue))
const strip = await page.evaluate(() => { const s = document.querySelector('#eWeek [data-daywarn="1"]'); return s ? s.innerText.replace(/\s+/g, ' ') : 'NO STRIP' })
console.log('the strip after the reload', strip)
console.log('errors', errors)
await browser.close()
