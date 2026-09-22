/* RE-WALK 2 — D50: a sim row always shows one spare seat, even when full.
   The walk's finding 3: a full sim row had no empty seat and no drop strip, so
   the drag a scheduler would make landed on a seated man and replaced him with
   nothing on screen to say so.
   Driven through the app's own controls: fill a sim row to capacity through its
   own seats, then look for the door. */
import { open, board, shot, STATE } from './lib.mjs'

const { browser, page, errors } = await open({ state: STATE })
const DI = 5
await board(page, DI)

/* what the OFT and AMT rows look like now */
const read = () => page.evaluate(() => {
  const out = []
  for (const cell of document.querySelectorAll('#schedBoard .sb-panel.simr .ppl.fcprcp')) {
    if (cell.offsetParent === null) continue
    const row = cell.closest('.sb-arow')
    const name = (row && row.querySelector('.ain') || {}).value || '(unnamed)'
    out.push({
      row: name,
      fill: cell.dataset.fill || '',
      seated: cell.querySelectorAll('.puck[data-person]').length,
      empty: cell.querySelectorAll('.sb-slot.empty').length,
      slots: [...cell.querySelectorAll('.sb-slot.empty')].map(s => s.dataset.slot),
    })
  }
  return out
})

console.log('SIM ROWS as they stand:')
for (const r of await read()) console.log('  ', JSON.stringify(r))
await shot(page, 'RW-02-sim-rows-before')

/* fill one row right up through its OWN seats, then ask again */
const target = (await read()).find(r => r.empty > 0)
if (!target) { console.log('nothing to fill — every sim row is already full'); }
else {
  console.log('\nfilling', target.row, 'through its own empty seats:', target.slots.join(' '))
  for (const slot of target.slots) {
    await page.evaluate((s) => { window.armSlot(s) }, slot)
    await page.waitForTimeout(150)
    const armed = await page.evaluate(() => window.armedKey())
    if (armed !== slot) { console.log('  !! tapping', slot, 'did not arm it (armed:', armed, ')'); continue }
    const who = await page.evaluate(() => {
      const p = document.querySelector('#sbRoster .rpuck[data-person]')
      return p ? p.dataset.person : null
    })
    await page.evaluate(([s, w]) => { window.setSlotVal(s, w); window.afterSchedMutate() }, [slot, who])
    await page.waitForTimeout(250)
    console.log('  seated', who, 'in', slot)
  }
  await page.waitForTimeout(600)
  console.log('\nTHE SAME ROWS, now that one is full:')
  for (const r of await read()) console.log('  ', JSON.stringify(r))
  await shot(page, 'RW-02-sim-row-full-still-has-a-seat')

  const after = (await read()).find(r => r.fill === target.fill)
  console.log('\nthe filled row holds', after.seated, 'people and still offers', after.empty, 'empty seat(s):', after.slots.join(' '))
  /* and the door is a real one — arm it and put somebody in it */
  if (after.slots.length) {
    await page.evaluate((s) => { window.armSlot(s) }, after.slots[0])
    await page.waitForTimeout(200)
    console.log('the spare seat ARMS:', await page.evaluate(() => window.armedKey()) === after.slots[0])
  }
}

console.log('\nerrors:', errors.slice(0, 6))
await browser.close()
