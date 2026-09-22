/* [OIL-SEATS-CAN-EARN] walk — THE SURFACES, at desktop and phone width.
   bug-check-order.md §7.2/§7.3. Pictures, because a walk that left no picture
   did not happen. Also answers the owner's open question: where do 27 opened
   pucks go in a sim row's people cell on a phone? */
import { open, board, tap, type, shot, oilMode, go, STATE } from './lib.mjs'
import { allChips, allSwitches, allPucks } from './seat-lib.mjs'

const di = 5
const W = Number(process.env.W || 1440), H = Number(process.env.H || 900)
const TAG = W < 700 ? 'phone' : 'desk'
const { browser, page, errors } = await open({ width: W, height: H, state: STATE })
console.log(`=== ${TAG} ${W}x${H} ===`)
await board(page, di)

/* put a placeholder on a SIM row's front seat, by hand, so the phone question
   has a real crowd to answer — the seeded OFT is full, so use the empty AMT
   block's pax slot, created here */
await tap(page, `[data-sblkadd="${di}"]`)
await page.waitForTimeout(700)
/* A SIM BLOCK ARRIVES WITH NO TIMES, and a row with no readable times earns
   nothing — correctly. Type them, or the crowd question is asked of a row that
   was never going to pay anybody. (Cost one run, 22 Sep.) */
await type(page, `[data-bfld="sr:${di}.amt.4.str"]`, '09:00')
await type(page, `[data-bfld="sr:${di}.amt.4.end"]`, '11:00')
const pax = await page.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  return [...b.querySelectorAll('.sb-slot.empty[data-slot*="amt"]')].filter(e => e.offsetParent !== null)
    .map(e => e.getAttribute('data-slot'))
})
console.log('empty AMT pax slots after adding a block:', pax.join(', '))
if (pax[0]) {
  await tap(page, `[data-slot="${pax[0]}"]`)
  await page.waitForTimeout(250)
  const armed = await page.evaluate(() => (window.ARM && window.ARM.key) || null)
  const puck = page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first()
  if (armed && await puck.count()) { await puck.click(); await page.waitForTimeout(600) }
  console.log('armed=', armed, 'sim pax now holds:', await page.evaluate(k => {
    const e = document.querySelector(`#schedBoard [data-slot="${k}"]`)
    return e ? [...e.querySelectorAll('[data-person]')].map(x => x.dataset.person) : 'gone'
  }, pax[0]))
}
await shot(page, `W-${TAG}-01-board-mode-off`)

console.log('\nCHIPS (mode off):')
for (const c of await allChips(page)) console.log('  ', c.txt.padEnd(14), '|', (c.title || '').slice(0, 96))

/* THE MODE HAS TWO DOORS AND ONLY ONE IS EVER VISIBLE — the desktop button
   (#sbOil) and the phone one ([data-oilmode]). lib.mjs's oilMode knows the
   desktop one only, so a phone run hangs on an invisible button. */
async function modeOn() {
  const isOn = () => page.evaluate(() => !!document.querySelector('#schedBoard [data-oilitem]'))
  if (await isOn()) return 'already on'
  for (const sel of ['#sbOil', `[data-oilmode="${di}"]`]) {
    const b = page.locator(sel).first()
    if (await b.count() && await b.isVisible()) { await b.click(); await page.waitForTimeout(800); return 'via ' + sel }
  }
  return 'NO VISIBLE DOOR TO THE MODE'
}
console.log('mode door:', await modeOn())
await page.waitForTimeout(500)
await shot(page, `W-${TAG}-02-board-mode-on`)

/* the SIM row's people cell, with the crowd opened — the owner's question */
const simCell = await page.evaluate(() => {
  const b = document.querySelector('#schedBoard')
  const rows = [...b.querySelectorAll('.pl-row, .sb-arow, tr, .row')].filter(e => e.offsetParent !== null)
  const hit = rows.filter(r => r.querySelectorAll('[data-oilp]').length > 6)
    .sort((a, c) => c.querySelectorAll('[data-oilp]').length - a.querySelectorAll('[data-oilp]').length)[0]
  if (!hit) return 'no crowd row drawn'
  const cell = hit.querySelector('.ppl')
  const r = hit.getBoundingClientRect(), cr = cell ? cell.getBoundingClientRect() : null
  const pk = [...hit.querySelectorAll('[data-oilp]')]
  const boxes = pk.map(e => e.getBoundingClientRect())
  return {
    name: (hit.querySelector('.nm') || {}).innerText || '',
    pucks: pk.length,
    rowH: Math.round(r.height), cellH: cr ? Math.round(cr.height) : null, cellW: cr ? Math.round(cr.width) : null,
    puckRows: new Set(boxes.map(b => Math.round(b.y))).size,
    smallest: Math.round(Math.min(...boxes.map(b => b.width))) + 'x' + Math.round(Math.min(...boxes.map(b => b.height))),
    overflowsRight: boxes.filter(b => cr && b.right > cr.right + 1).length,
    overflowsBelow: boxes.filter(b => cr && b.bottom > cr.bottom + 1).length,
    cellOverflow: cell ? getComputedStyle(cell).overflow : null,
    offScreen: boxes.filter(b => b.right > window.innerWidth || b.bottom > window.innerHeight).length,
  }
})
console.log('\nTHE BIGGEST OPENED CROWD ON SCREEN:', JSON.stringify(simCell, null, 1))
await shot(page, `W-${TAG}-03-crowd-opened`)

/* smallest touch target anywhere in the mode — a phone needs a real one */
const tiny = await page.evaluate(() => {
  const all = [...document.querySelectorAll('#schedBoard [data-oilp], #schedBoard .oilitem, #schedBoard .oilcount')]
    .filter(e => e.offsetParent !== null)
  const b = all.map(e => { const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), what: e.dataset.oilp ? 'puck' : e.className.includes('oilcount') ? 'count' : 'switch', txt: (e.innerText || '').trim().slice(0, 14) } })
  b.sort((x, y) => (x.w * x.h) - (y.w * y.h))
  return { n: b.length, smallest: b.slice(0, 5), under24: b.filter(x => x.h < 24).length, under16: b.filter(x => x.h < 16).length }
})
console.log('TOUCH TARGETS:', JSON.stringify(tiny))

console.log('\nSWITCH STATES:')
for (const s of await allSwitches(page)) if (/earns nothing/.test(s.title) || s.state !== 'on')
  console.log('  ', s.txt.padEnd(12), s.state.padEnd(6), '|', s.title.slice(0, 80))

console.log('\nerrors:', errors.slice(0, 6))
await browser.close()
