import { world, fileInput, pic, sleep, go, openBoard, oilOn, openCount, tabTo, winState, seatTitle, closeWin, pubDay, credits, savePart } from './aa-B-lib.mjs'
import { groundIdx, putExtra, rowPucks, rowSeat, dragOff } from './aa-B-rows.mjs'
const P = 'dice', G = 'torque', M = 'shaft', W = 'glass'
const log = []
const say = (...a) => { const s = a.join(' '); log.push(s); console.log('  ' + s) }
const out = {}
const w = await world('desk'); w.tag = 's24'
const { page } = w
const f = await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: P, rmk: 'S24', s: '09:00', e: '12:00', oil: 'no' })
const iid = f.rec.iid; say('named duty filed', JSON.stringify(f.rec))
await openBoard(page, 5)
let slot = await groundIdx(page, 'S24'); say('slot', slot)
say('placeholder under the row:', await putExtra(page, slot, 'allavail')); say('typed G:', await putExtra(page, slot, G))
say('row pucks', JSON.stringify(await rowPucks(page, 'S24')))
await oilOn(page, true); await pic(w, 'row')
out.P = await rowSeat(page, 'S24', P); out.G = await rowSeat(page, 'S24', G); say('P seat', JSON.stringify(out.P), 'G seat', JSON.stringify(out.G))
const cnt = page.locator('#schedBoard .sb-arow .oilcount').first()
say('count chip', await cnt.innerText(), '|', await cnt.getAttribute('title'))
await cnt.click(); await sleep(500); await tabTo(page, 'earn')
let s = await winState(page); say('window', `M=${s.seats[M]} W=${s.seats[W]} P=${s.seats[P] || 'not in window'} ${s.tabs[1]}`); out.win = { M: s.seats[M], W: s.seats[W], tab: s.tabs[1] }
await pic(w, 'win'); await closeWin(page)
say('publish ORIG', JSON.stringify(await pubDay(page, 5)))
out.c0 = await credits(page, [P, G, M, W]); say('credits ORIG (expect P none; G,M,W HO)', JSON.stringify(out.c0))
await openBoard(page, 5)
await dragOff(page, 'S24', 'allavail'); say('row pucks after removing the placeholder', JSON.stringify(await rowPucks(page, 'S24')))
await pic(w, 'placeholder-removed')
say('publish AL', JSON.stringify(await pubDay(page, 5)))
out.c1 = await credits(page, [P, G, M, W]); say('credits AL (expect P none, G HO, M,W none)', JSON.stringify(out.c1))
await pic(w, 'lw')
out.errors = w.errors
await w.browser.close()
savePart('s24-run', { out, log })
