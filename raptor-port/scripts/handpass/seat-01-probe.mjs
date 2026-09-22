/* [OIL-SEATS-CAN-EARN] walk — DOM probe.
   Learn the arm/drop addresses and what the refusal actually says, before the
   roll-call drives them all. */
import { open, board, tap, shot, oilMode, STATE } from './lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)

/* every arm-able address the board is currently drawing */
const doors = await page.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  const grab = (attr) => [...b.querySelectorAll(`[${attr}]`)]
    .filter(e => e.offsetParent !== null)
    .map(e => e.getAttribute(attr))
  return { slot: grab('data-slot'), fill: grab('data-fill') }
})
console.log('SLOTS (' + doors.slot.length + '):'); console.log(' ', doors.slot.join('\n  '))
console.log('\nFILLS (' + doors.fill.length + '):'); console.log(' ', doors.fill.join('\n  '))

/* the palette: are the two sentinels offered? */
const pal = await page.evaluate(() => [...document.querySelectorAll('#sbRoster .rpuck[data-person]')]
  .map(e => e.dataset.person).filter(p => p === 'all' || p === 'allavail'))
console.log('\nsentinels on the board palette:', pal)

await browser.close()
