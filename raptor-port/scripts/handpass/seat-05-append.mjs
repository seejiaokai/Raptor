/* [OIL-SEATS-CAN-EARN] walk — the APPEND door, by drag, on rows that already
   hold people. The roll-call's arm-then-pick gesture did not arm on a filled
   sim row or a filled Common Programme row; this asks whether the DOOR is
   missing or whether the arm just landed on a puck. The honest gesture for
   "add one more body to a full row" is the drag, so that is what is driven. */
import { open, board, tap, shot, STATE } from './lib.mjs'
import { seatHolds, toast } from './seat-lib.mjs'

const di = 5
const { browser, page, errors } = await open({ state: STATE })
await board(page, di)

/* drag a palette puck onto the CELL that holds a row's people */
async function dragToCell(pid, fillKey) {
  const dst = page.locator(`#schedBoard [data-fill="${fillKey}"]:visible`).first()
  if (!await dst.count()) return { err: 'cell not drawn' }
  await dst.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(200)
  const src = page.locator(`#sbRoster .rpuck[data-person="${pid}"]:visible`).first()
  await src.evaluate(e => e.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(150)
  const a = await src.boundingBox()
  const b = await dst.boundingBox()
  if (!a || !b) return { err: 'no box', a, b }
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2)
  await page.mouse.down()
  await page.mouse.move(a.x + 15, a.y + 15, { steps: 4 })
  await page.waitForTimeout(200)
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 10 })
  await page.waitForTimeout(250)
  const mid = await page.evaluate(() => ({
    strip: [...document.querySelectorAll('#schedBoard [data-fill]')].filter(e => {
      const c = getComputedStyle(e); return c.outlineStyle !== 'none' || /over|drop|hot/.test(e.className)
    }).map(e => e.getAttribute('data-fill') + ':' + e.className).slice(0, 3),
  }))
  await page.mouse.up()
  await page.waitForTimeout(600)
  return { mid, said: await toast(page), holds: await seatHolds(page, fillKey) }
}

for (const key of [`s:${di}.oft.0.+`, `s:${di}.amt.1.+`, `a:${di}.1.+`, `g:${di}.0.+`, `d:${di}.0.0.+`]) {
  const before = await seatHolds(page, key)
  const r = await dragToCell('allavail', key)
  console.log(`DRAG-APPEND ${key}\n   before=[${before}] after=[${r.holds}] said=${r.said} ${r.err || ''}`)
}
await shot(page, 'DOOR-04-after-drag-appends')

/* ---- the missing roll-call row: an EMPTY sim passenger slot ------------- */
console.log('\n=== empty AMT passenger slot, created by hand ===')
await tap(page, `[data-sblkadd="${di}"]`)
await page.waitForTimeout(600)
const amt = await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-slot^="s:5.amt"]')]
  .filter(e => e.offsetParent !== null).map(e => e.getAttribute('data-slot')))
console.log('AMT slots now:', amt.join(', '))
const paxKey = amt.find(k => /pax\.0$/.test(k) && !/\.1\.pax/.test(k)) || amt.find(k => /pax\.0$/.test(k))
console.log('using pax slot:', paxKey)
if (paxKey) {
  await tap(page, `[data-slot="${paxKey}"]`)
  await page.waitForTimeout(250)
  const armed = await page.evaluate(() => (window.ARM && window.ARM.key) || null)
  await page.locator('#sbRoster .rpuck[data-person="all"]:visible').first().click()
  await page.waitForTimeout(500)
  console.log('armed=', armed, 'ALL on empty pax slot ->', await seatHolds(page, paxKey))
}
await shot(page, 'DOOR-05-empty-pax-slot')
console.log('\nerrors:', errors.slice(0, 8))
await browser.close()
