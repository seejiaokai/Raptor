/* [OIL-SEATS-CAN-EARN] walk — SURFACES 4: THE NEXT-WEEK PEEK.
   The roll-call says the peek "draws a bare puck, no chip", and the count MUST
   NOT show there, because it is a peek and not the day. Proved by driving: put
   a placeholder on a day of NEXT week through that week's own controls, come
   back to this week, and look at the peek columns — at both widths. */
import { open, go, board, tap, type, shot, STATE } from './lib.mjs'

const { browser, page, errors } = await open({ state: STATE })

const weekNow = () => page.evaluate(() => ({ week: window.CURWEEK,
  days: window.DAYS.map((d, i) => `${i}:${d.dow} ${d.dt}`).join(' | ') }))
await go(page, 'editsched'); await page.waitForTimeout(800)
console.log('this week:', JSON.stringify(await weekNow()))

/* the peek's OWN door: click a preview day to load that week */
const peekN = await page.locator('#eWeek .day.peek').count()
console.log('peek columns drawn beside this week:', peekN)
await page.locator('#eWeek .day.peek').first().click({ timeout: 5000 }).catch(e => console.log('peek click refused:', String(e.message).slice(0, 70)))
await page.waitForTimeout(1500)
console.log('after clicking the first peek day:', JSON.stringify(await weekNow()))

/* put a placeholder on Saturday of THAT week through the board's own controls */
const di = 5
await board(page, di)
const ri = await page.evaluate(d => (window.DAYS[d].ground || []).length, di)
console.log('the far Saturday already carries', ri, 'ground rows; the new one is number', ri)
await tap(page, `[data-gradd="${di}"]`)
await type(page, `[data-bfld="gr:${di}.${ri}.prog"]`, 'PEEK PROBE')
await type(page, `[data-bfld="gr:${di}.${ri}.str"]`, '08:00')
await type(page, `[data-bfld="gr:${di}.${ri}.end"]`, '10:00')
await tap(page, `[data-fill="g:${di}.${ri}.+"]`)
await page.waitForTimeout(200)
const p = page.locator(`#sbRoster .rpuck[data-person="allavail"]:visible`).first()
if (await p.count()) { await p.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(500) }
await page.keyboard.press('Escape'); await page.waitForTimeout(250)
const landed = await page.evaluate(d => {
  const g = (window.DAYS[d].ground || []).find(x => x.prog === 'PEEK PROBE')
  return g ? { prog: g.prog, who: g.who, more: g.more || [] } : 'no row'
}, di)
console.log('the row now on the far week:', JSON.stringify(landed))
await page.locator('#sbClose:visible').first().click().catch(() => {}); await page.waitForTimeout(1000)

/* back one week, so that day is now inside the PEEK */
await go(page, 'editsched'); await page.waitForTimeout(600)
await page.evaluate(() => {
  const b = [...document.querySelectorAll('[data-wk]')].filter(e => e.getBoundingClientRect().width > 0)
  if (b.length) b[0].click()
})
await page.waitForTimeout(1600)
console.log('back to:', JSON.stringify(await weekNow()))

const look = async (root, label) => {
  const r = await page.evaluate(sel => {
    const peeks = [...document.querySelectorAll(`${sel} .day.peek`)]
    const sum = (f) => peeks.reduce((a, q) => a + f(q), 0)
    return {
      n: peeks.length,
      chips: sum(q => q.querySelectorAll('.oilcount').length),
      oilBars: sum(q => q.querySelectorAll('[class*=oilbar]').length),
      dataPerson: sum(q => q.querySelectorAll('[data-person]').length),
      dataSlot: sum(q => q.querySelectorAll('[data-slot],[data-fill]').length),
      sentinelPucks: sum(q => q.querySelectorAll('.puck.allavail').length),
      probeRow: peeks.map(q => {
        const t = q.innerText, i = t.indexOf('PEEK PROBE')
        return i < 0 ? null : t.slice(i, i + 80).replace(/\s+/g, ' ')
      }).filter(Boolean),
    }
  }, root)
  console.log(`\n===== THE PEEK on ${label} =====`)
  console.log('  peek columns:', r.n, '| count chips:', r.chips, '| earn bars:', r.oilBars)
  console.log('  addressable markers in the peek (data-person / data-slot):', r.dataPerson, '/', r.dataSlot)
  console.log('  placeholder pucks drawn:', r.sentinelPucks)
  console.log('  the row we planted, as the peek shows it:', JSON.stringify(r.probeRow))
  return r
}
await look('#eWeek', 'the EDIT WEEK, desktop')
await shot(page, 'SURF-21-peek-editweek-desktop')
await go(page, 'viewsched'); await page.waitForTimeout(900)
await look('#vWeek', 'the VIEW WEEK, desktop')
await shot(page, 'SURF-22-peek-viewweek-desktop')

await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(1200)
await go(page, 'editsched'); await page.waitForTimeout(1000)
await look('#eWeek', 'the EDIT WEEK, phone')
await shot(page, 'SURF-23-peek-editweek-phone')
console.log('\nerrors:', errors.slice(0, 8))
await browser.close()
