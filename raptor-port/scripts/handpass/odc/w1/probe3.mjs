import { start, openCalendarWindow, press, shot, text, rect, vis, cardOnTop } from './lib.mjs'
console.log('probe3 VERSION 1')
const L = await start(390, 844)
const { page } = L
await openCalendarWindow(L)
await press(L, '[data-testid="days-wd-3"]')
await page.waitForSelector('[data-testid="win-every"]')
await press(L, '[data-testid="every-from"]')
console.log(JSON.stringify(await cardOnTop(L, 'From')))
console.log(JSON.stringify(await page.evaluate(() => {
  const c = document.querySelector('[data-testid="dcal-card"]')
  const all = [...c.querySelectorAll('*')].filter(e => e.children.length === 0 || e.getAttribute('data-testid'))
  const cs = e => { const s = getComputedStyle(e); return { fw: s.fontWeight, col: s.color, bg: s.backgroundColor, op: s.opacity } }
  return {
    ids: [...c.querySelectorAll('[data-testid]')].map(e => e.getAttribute('data-testid')).filter(t => !t.startsWith('dcal-day-')),
    title: c.querySelector('[data-testid="dcal-title"]').innerText,
    head: [...c.querySelectorAll('[role=columnheader], .dcal-wd, [class*=wd]')].map(e => ({ t: e.innerText, cls: e.className, ...cs(e) })),
    day5: (e => e && { cls: e.className, aria: e.getAttribute('aria-label'), ...cs(e) })(c.querySelector('[data-testid="dcal-day-2026-10-15"]')),
    day6: (e => e && { cls: e.className, aria: e.getAttribute('aria-label'), ...cs(e) })(c.querySelector('[data-testid="dcal-day-2026-10-14"]')),
    day13: (e => e && { cls: e.className, aria: e.getAttribute('aria-label'), ...cs(e) })(c.querySelector('[data-testid="dcal-day-2026-10-13"]')),
    days: [...c.querySelectorAll('[data-testid^="dcal-day-"]')].slice(0, 3).map(e => e.outerHTML.slice(0, 300)),
  }
}), null, 1))
await shot(L, 'probe3-from')
await L.browser.close()
