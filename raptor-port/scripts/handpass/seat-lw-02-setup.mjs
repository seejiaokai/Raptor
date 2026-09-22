/* [OIL-SEATS-CAN-EARN] walk — the LEAVE WAR side, step 1: build the money.
   Plants the crowd on the NEW surface (a duty desk) on the everything-Saturday
   and on the Sunday, beside a man NAMED directly on a row as the control, then
   publishes both days. Saves the world so the reads that follow all start from
   this one, identical, published state.

   Both placeholder pucks are walked — ALL AVAIL on the Saturday, ALL on the
   Sunday — because wiring one and forgetting the other is the exact shape this
   build must avoid.

   Long row on the Saturday (08:00-18:00) so the crowd must read FO; short row
   on the Sunday (09:00-12:00) so it must read HO. One ≤6h/>6h test per person
   per day over the day's whole envelope, so the two cannot share a day. */
import { open, board, tap, type, shot, publish, oilMode, readDay, closeBoard, STATE } from './lib.mjs'
import { handPut, seatHolds, allPucks, allSwitches } from './seat-lib.mjs'

const SAT = 5, SUN = 6
const OUT = 'C:/Users/User/projects/Raptor/raptor-port/docs/img/handpass/2026-09-22-oil-seats'
const { browser, page, errors } = await open({ state: STATE })

/* ---------- SATURDAY --------------------------------------------------- */
await board(page, SAT)

/* the CONTROL first, so the crowd that follows naturally excludes him: a man
   named straight onto a row, the way the app has always credited people. */
await tap(page, `[data-gradd="${SAT}"]`)
await type(page, `[data-bfld="gr:${SAT}.5.prog"]`, 'KEY CONTROL')
await type(page, `[data-bfld="gr:${SAT}.5.str"]`, '08:00')
await type(page, `[data-bfld="gr:${SAT}.5.end"]`, '18:00')
const ctl = await handPut(page, `g:${SAT}.5.+`, 'pump')      // Piston IP
console.log('CONTROL (Piston named on KEY CONTROL 08:00-18:00):', JSON.stringify(ctl))

/* the CROWD on a plain duty desk — the owner's Sunday desk, the headline of
   this change. Before it, a placeholder here silently counted nobody. */
await tap(page, `[data-dradd="${SAT}.0"]`)
await type(page, `[data-bfld="dr:${SAT}.0.3.role"]`, 'SAT DESK')
await type(page, `[data-bfld="dr:${SAT}.0.3.str"]`, '08:00')
await type(page, `[data-bfld="dr:${SAT}.0.3.end"]`, '18:00')
const crowdSat = await handPut(page, `d:${SAT}.0.3.+`, 'allavail')
console.log('CROWD SAT (ALL AVAIL on SAT DESK 08:00-18:00):', JSON.stringify(crowdSat))
await shot(page, 'LW-03-sat-rows-built')

/* who the crowd stands for, read inside the mode through OIL8's opened pucks */
await oilMode(page, true)
await page.waitForTimeout(600)
const pucksSat = await allPucks(page)
const swSat = (await allSwitches(page)).filter(s => /SAT DESK|KEY CONTROL/.test(s.txt))
console.log('SAT switches on the two new rows:', JSON.stringify(swSat))
console.log('SAT crowd opens into', pucksSat.length, 'pucks:', pucksSat.map(p => p.cs + (p.on ? '' : '(off)')).join(' '))
await shot(page, 'LW-04-sat-mode-on')
await oilMode(page, false)

const pubSat = await publish(page, SAT)
console.log('PUBLISH SAT:', JSON.stringify(pubSat))
await shot(page, 'LW-05-sat-published')

/* ---------- SUNDAY ------------------------------------------------------ */
await board(page, SUN)
await tap(page, `[data-dradd="${SUN}.0"]`)
const nrows = await page.evaluate(i => (window.DAYS[i].dutywaves[0].rows || []).length, SUN)
const ri = nrows - 1
await type(page, `[data-bfld="dr:${SUN}.0.${ri}.role"]`, 'SUN DESK')
await type(page, `[data-bfld="dr:${SUN}.0.${ri}.str"]`, '09:00')
await type(page, `[data-bfld="dr:${SUN}.0.${ri}.end"]`, '12:00')
const crowdSun = await handPut(page, `d:${SUN}.0.${ri}.+`, 'all')
console.log('CROWD SUN (ALL on SUN DESK 09:00-12:00, row', ri + '):', JSON.stringify(crowdSun))
await oilMode(page, true)
await page.waitForTimeout(600)
const pucksSun = await allPucks(page)
console.log('SUN crowd opens into', pucksSun.length, 'pucks:', pucksSun.map(p => p.cs + (p.on ? '' : '(off)')).join(' '))
await shot(page, 'LW-06-sun-mode-on')
await oilMode(page, false)
const pubSun = await publish(page, SUN)
console.log('PUBLISH SUN:', JSON.stringify(pubSun))

await closeBoard(page)
await page.waitForTimeout(800)
await page.context().storageState({ path: OUT + '/state-lw-published.json' })
console.log('\nsaved world ->', OUT + '/state-lw-published.json')
console.log('errors:', errors.slice(0, 10))
await browser.close()
