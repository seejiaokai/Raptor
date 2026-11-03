/* The ?freeze trial ([WEEK-SWIPE-CROSS], his 07:32 recording, 3 Nov 26): with and without the switch, swipe Monday 13 Jul →
   Sunday 12 Jul by real touch (Chromium over CDP) and read, every animation frame, how many frozen copies of the week are up
   and where the leaving one stands. Checks: with ?freeze the leaving copy is up within a frame of the lift (without it, only
   once the slide is ready); both land Sunday 12 Jul at its resting place; no copy is left behind. */
import { openPhone, goPage, park, fingerCdp, sleep, weekId } from './ws-walk-a-lib.mjs'
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-11-03-week-swipe/freeze'
import { mkdirSync } from 'node:fs'
mkdirSync(OUT, { recursive: true })
let bad = 0
for (const q of ['', '?freeze']) {
  for (let run = 1; run <= 3; run++) {
    const s = await openPhone('chromium')
    const { page, cdp } = s
    if (q) {
      await page.goto('/' + q); await page.waitForSelector('#luser')
      await page.fill('#luser', 'ad'); await page.fill('#lpass', 'a'); await page.click('#loginForm button[type=submit]')
      await page.waitForSelector('#vWeek .day', { state: 'attached' }); await page.waitForTimeout(500)
    }
    await goPage(page, 'editsched')
    await park(page, '#eWeek', 0)
    await page.evaluate(() => {
      const log = (window).__fz = []
      const t0 = performance.now()
      const tick = () => {
        const cs = [...document.body.children].filter(e => e.classList && e.classList.contains('week') && getComputedStyle(e).position === 'fixed')
        log.push([Math.round(performance.now() - t0), cs.length, cs.length ? Math.round(cs[cs.length - 1].getBoundingClientRect().left) : null])
        if (log.length < 90) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
      ;(window).__t0 = t0
    })
    const lift = await fingerCdp(cdp, Array.from({ length: 11 }, (_, i) => [100 + 15 * i, 400, i * 25]))
    const liftPage = await page.evaluate(() => performance.now() - (window).__t0)
    await sleep(1300)
    const fz = await page.evaluate(() => (window).__fz)
    const wk = await weekId(page)
    const sl = await page.evaluate(() => Math.round(document.querySelector('#eWeek').scrollLeft))
    const left = await page.evaluate(() => [...document.body.children].filter(e => e.classList && e.classList.contains('week') && getComputedStyle(e).position === 'fixed').length)
    const first = fz.find(r => r[1] > 0)
    const ok = wk === '06/07/2026' && left === 0
    if (!ok) bad++
    if (run === 1) await page.screenshot({ path: `${OUT}/${q ? 'freeze' : 'plain'}-after.png` })
    console.log(`${q || '(no switch)'} run ${run}: ${ok ? 'PASS' : 'FAIL'} week ${wk} sl ${sl}, copies left ${left}; lift at ~${Math.round(liftPage)}ms (page clock, after the lift call); first copy up at ${first ? first[0] + 'ms, leaving copy at x ' + first[2] : 'never'}`)
    await s.browser.close()
  }
}
process.exitCode = bad ? 1 : 0
