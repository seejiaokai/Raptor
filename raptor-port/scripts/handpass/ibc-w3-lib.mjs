// W3 shared helpers (3 Nov 26): reach a week through "Jump to a date", read what the Leave War holds for a date, file a Duty on a 2029 Saturday.
import * as L from './isr-A-lib.mjs'
export const sleep = ms => new Promise(r => setTimeout(r, ms))
export const MON = L.MONTHS
/* the schedule's "Jump to a date" calendar, paged by its own ‹ › until its title says the wanted month, then the day pressed */
export async function jumpTo(page, tap, iso) {
  await page.locator('button[aria-label="Jump to a date"]:visible').first().click(); await sleep(500)
  const cal = page.locator('#weekCal [data-testid="wcal"]').first()
  await cal.waitFor()
  const want = +iso.slice(0, 4) * 12 + (+iso.slice(5, 7) - 1)
  for (let i = 0; i < 90; i++) {
    const m = (await cal.getAttribute('data-month')) // yyyy-mm
    const have = +m.slice(0, 4) * 12 + (+m.slice(5, 7) - 1)
    if (have === want) break
    await page.locator('#weekCal [data-testid="wcal-' + (have < want ? 'next' : 'prev') + '"]').click(); await sleep(120)
  }
  await sleep(350)
  await page.locator(`#weekCal [data-testid="wcal-day-${iso}"]`).click(); await sleep(900)
}
export const curWeek = page => page.evaluate(() => window.CURWEEK)
/* the Leave War's period names, from its own picker */
export async function warOptions(page) {
  await L.go(page, 'leavewar')
  return page.evaluate(() => { const s = document.querySelector('[data-testid="war-picker"]'); return s ? [...s.options].map(o => o.text.trim()) : null })
}
/* the day's own words about OIL and its period (the advisory + the offer), read from the edit week's day */
export const dayAdvice = (page, di) => page.evaluate(i => {
  const d = document.querySelector(`#eWeek .day[data-day="${i}"]`); if (!d) return null
  const t = e => (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim()
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
  return { create: [...d.querySelectorAll('[data-mkperiod]')].filter(vis).map(t), adv: [...d.querySelectorAll('.witem,.wln')].filter(vis).map(t).filter(x => /OIL|period/i.test(x)).slice(0, 4) }
}, di)
