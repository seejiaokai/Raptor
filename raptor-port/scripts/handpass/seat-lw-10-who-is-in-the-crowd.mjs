/* [OIL-SEATS-CAN-EARN] walk — the LEAVE WAR side, step 8: who the crowd names.
   Two men the figures put a question against.

   ONE — a man POSTED OUT. The mode draws him inside the desk's crowd, lit as a
   man the desk pays. The war pays him nothing. Two answers to one question,
   both on screen at once, is what the standing order hunts.

   TWO — the GROUND CREW. They are on the war's roster, they can be put on a
   desk BY NAME, and by name they would be paid. Neither placeholder sweeps
   them up. If ALL does not mean all, that is worth the owner's word. */
import { open, board, oilMode, shot, go } from './lib.mjs'
import { allPucks, allSwitches, handPut, seatHolds } from './seat-lib.mjs'
import { tap, type } from './lib.mjs'

const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-22-oil-seats'
const { browser, page, errors } = await open({ state: OUT + '/state-lw-published.json' })

/* ---- ONE: the posted-out man -------------------------------------------- */
const po = await page.evaluate(() => {
  const P = window.PEOPLE, out = []
  for (const [id, p] of Object.entries(P)) if (p.po || p.postOut || p.out || p.left)
    out.push({ id, cs: p.cs, po: p.po || p.postOut || p.out || p.left })
  return out
})
console.log('people the roster marks as posted out:', JSON.stringify(po))
await go(page, 'leavewar')
await page.waitForTimeout(1800)
const torch = await page.evaluate(() => {
  const r = document.querySelector('[data-testid="row-ignite"]')
  const days = ['2026-07-16', '2026-07-17', '2026-07-18', '2026-07-19', '2026-07-20']
  const o = {}
  for (const d of days) { const c = document.querySelector(`[data-testid="cell-ignite-${d}"]`)
    o[d] = c ? (c.innerText || '').replace(/\s+/g, ' ').trim() + ' [' + c.className.slice(0, 40) + ']' : 'NO CELL' }
  const last = document.querySelector('[data-testid="polast-ignite"]')
  return { cells: o, polast: last ? (last.innerText || '').trim() + ' · ' + (last.getAttribute('title') || '') : null,
    rowCls: r ? r.className.slice(0, 50) : null }
})
console.log('TORCH (the posted-out man) across the weekend:', JSON.stringify(torch, null, 1))
await shot(page, 'LW-24-postedout-row')

await board(page, 6)
await oilMode(page, true); await page.waitForTimeout(600)
const sw = (await allSwitches(page)).find(s => /SUN DESK/.test(s.txt))
const crowd = (await allPucks(page)).filter(p => p.item === sw.item)
const t = crowd.find(p => p.cs === 'Torch')
console.log('\nSUNDAY desk crowd size:', crowd.length)
console.log('is the posted-out man drawn inside it?', t ? 'YES — puck ' + (t.on ? 'LIT (the app says this desk pays him)' : 'unlit') : 'no')
console.log('is any ground crewman drawn inside it?', crowd.filter(p => ['Cotter', 'Ratchet', 'Widget'].includes(p.cs)).map(p => p.cs).join(' ') || 'no — none of the three')
await shot(page, 'LW-25-sunday-crowd-opened')
await oilMode(page, false)

/* ---- TWO: can a ground crewman be put on that same desk BY NAME? --------- */
await tap(page, `[data-dradd="6.0"]`)
const ri = await page.evaluate(() => (window.DAYS[6].dutywaves[0].rows || []).length - 1)
await type(page, `[data-bfld="dr:6.0.${ri}.role"]`, 'GND DESK')
await type(page, `[data-bfld="dr:6.0.${ri}.str"]`, '09:00')
await type(page, `[data-bfld="dr:6.0.${ri}.end"]`, '17:00')
const named = await handPut(page, `d:6.0.${ri}.+`, 'spanner')   // Cotter GND
console.log('\nputting a GROUND CREWMAN on a duty desk by name:', JSON.stringify(named))
await shot(page, 'LW-26-groundcrew-named-on-desk')
await oilMode(page, true); await page.waitForTimeout(600)
const sw2 = (await allSwitches(page)).find(s => /GND DESK/.test(s.txt))
console.log('the switch that row offers:', JSON.stringify(sw2))
const c2 = (await allPucks(page)).filter(p => p.item === (sw2 || {}).item)
console.log('the men that row pays:', c2.map(p => p.cs + (p.on ? '' : '(off)')).join(' ') || 'none')
await oilMode(page, false)
console.log('\nerrors:', errors.slice(0, 8))
await browser.close()
