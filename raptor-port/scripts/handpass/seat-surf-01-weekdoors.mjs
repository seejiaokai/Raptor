/* [OIL-SEATS-CAN-EARN] walk — SURFACES. What doors the EDIT WEEK itself has:
   which seat addresses it draws, whether its own palette arms them, and where
   the next-week peek's columns come from. */
import { open, go, tap, shot, STATE } from './lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: STATE })
await go(page, 'editsched'); await page.waitForTimeout(800)

const doors = await page.evaluate(d => {
  const vis = e => e.offsetParent !== null
  const inDay = e => { const c = e.closest('.day'); return c ? c.dataset.di ?? c.getAttribute('data-di') : null }
  const slots = [...document.querySelectorAll('#eWeek [data-slot]')].filter(vis)
    .map(e => e.dataset.slot).filter(k => String(k).includes(`${d}.`) || String(k).includes(`:${d}.`))
  const fills = [...document.querySelectorAll('#eWeek [data-fill]')].filter(vis)
    .map(e => e.dataset.fill).filter(k => String(k).includes(`${d}.`) || String(k).includes(`:${d}.`))
  return {
    slotsAll: [...document.querySelectorAll('#eWeek [data-slot]')].filter(vis).length,
    fillsAll: [...document.querySelectorAll('#eWeek [data-fill]')].filter(vis).length,
    slots: slots.slice(0, 60), fills: fills.slice(0, 60),
    roster: [...document.querySelectorAll('#eRoster .rpuck')].filter(vis).length,
    dayAttrs: [...document.querySelectorAll('#eWeek .day')].slice(0, 10)
      .map(e => ({ cls: e.className.slice(0, 40), ds: JSON.stringify(e.dataset).slice(0, 90) })),
    peek: [...document.querySelectorAll('.peek')].slice(0, 4).map(e => ({
      cls: e.className.slice(0, 60), txt: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 160),
      pucks: e.querySelectorAll('[data-person]').length,
      slots: e.querySelectorAll('[data-slot],[data-fill]').length,
    })),
  }
}, di)
console.log('EDIT WEEK doors: slots(vis)=' + doors.slotsAll, 'fills(vis)=' + doors.fillsAll, 'palette pucks=' + doors.roster)
console.log(' day5 slots:', doors.slots.join(' '))
console.log(' day5 fills:', doors.fills.join(' '))
console.log(' .day attrs:', JSON.stringify(doors.dayAttrs).slice(0, 400))
console.log('\n PEEK blocks (first 4):')
for (const p of doors.peek) console.log('   ', JSON.stringify(p))

/* Where do the peek's columns come from — which week, which day? */
const peekSrc = await page.evaluate(() => {
  const p = document.querySelector('.peek')
  if (!p) return 'no peek'
  const box = p.closest('.day') || p.parentElement
  return { peekHTML: p.outerHTML.slice(0, 900), parentCls: box ? box.className.slice(0, 60) : null }
})
console.log('\n PEEK first block markup:\n', typeof peekSrc === 'string' ? peekSrc : peekSrc.peekHTML)
console.log('\nerrors:', errors.slice(0, 6))
await browser.close()
