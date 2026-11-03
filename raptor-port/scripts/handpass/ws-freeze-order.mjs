/* The ?freeze trial: the leaving copy is up at the very moment of the lift — in the same task as the touch's end, before the
   next week is built — and without the switch it is not. Touches raised inside the page, so the count is read right after the
   end event, in the same task. */
import { openPhone, goPage, park } from './ws-walk-a-lib.mjs'
let bad = 0
for (const q of ['', '?freeze']) {
  const s = await openPhone('chromium')
  const { page } = s
  if (q) {
    await page.goto('/' + q); await page.waitForSelector('#luser')
    await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
    await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(500)
  }
  await goPage(page, 'editsched')
  await park(page, '#eWeek', 0)
  const r = await page.evaluate(() => {
    const w = document.querySelector('#eWeek')
    const el = document.elementFromPoint(100, 400) || w
    const fire = (type, x) => {
      const ev = new Event(type, { bubbles: true, cancelable: true })
      const t = { identifier: 1, target: el, clientX: x, clientY: 400 }
      Object.defineProperty(ev, 'touches', { value: type === 'touchend' ? [] : [t] })
      Object.defineProperty(ev, 'changedTouches', { value: [t] })
      el.dispatchEvent(ev)
    }
    const copies = () => [...document.body.children].filter(e => e.classList && e.classList.contains('week') && getComputedStyle(e).position === 'fixed')
    const day0 = w.querySelector('.day:not(.peek)').textContent.slice(0, 20)
    fire('touchstart', 100); fire('touchmove', 140); fire('touchmove', 180); fire('touchend', 200)
    const atLift = copies()
    return { atLift: atLift.length, frozenShows: atLift.length ? atLift[0].textContent.slice(0, 20) : null, day0 }
  })
  await page.waitForTimeout(1300)
  const after = await page.evaluate(() => ({ wk: window.CURWEEK, left: [...document.body.children].filter(e => e.classList && e.classList.contains('week') && getComputedStyle(e).position === 'fixed').length }))
  const ok = (q ? r.atLift === 1 && r.frozenShows === r.day0 : r.atLift === 0) && after.wk === '06/07/2026' && after.left === 0
  if (!ok) bad++
  console.log(`${q || '(no switch)'}: ${ok ? 'PASS' : 'FAIL'} copies up at the lift ${r.atLift}${r.frozenShows ? ' showing "' + r.frozenShows.trim() + '"' : ''}; then week ${after.wk}, copies left ${after.left}`)
  await s.browser.close()
}
process.exitCode = bad ? 1 : 0
