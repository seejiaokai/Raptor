/* Which requests have the door, and what takes it away. */
import { open, board, tap } from './lib.mjs'
const STATE = 'C:/Users/User/projects/Raptor/raptor-port/docs/handpass/state-sat.json'
const { browser, page, errors } = await open({ state: STATE })
await board(page, 5)
const survey = async (tag) => await page.evaluate((t) => {
  const rows = [...document.querySelectorAll('#schedBoard .sb-arow.inprow, #schedBoard .sbi-row')]
    .filter(e => e.offsetParent)
  return {
    tag: t,
    oilModeOn: !!document.querySelector('#schedBoard .oilon, #schedBoard [data-oilitem]'),
    rows: rows.length,
    withDoor: rows.filter(r => r.querySelector('[data-inpedit]')).length,
    withOilCell: rows.filter(r => r.querySelector('[data-oilitem]')).length,
    sample: rows.slice(0, 14).map(r => ({
      txt: (r.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 58),
      door: !!r.querySelector('[data-inpedit]'),
      oil: !!r.querySelector('[data-oilitem]'),
    })),
  }
}, tag)
const before = await survey('mode OFF')
await tap(page, '#sbOil')
await page.waitForTimeout(800)
const during = await survey('mode ON')
console.log(JSON.stringify({ before, during }, null, 1))
console.log('errors:', errors.slice(0, 4))
await browser.close()
