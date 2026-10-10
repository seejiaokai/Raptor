import { world, fileInput, pic, sleep, go, openBoard, oilOn, openCount, tabTo, winState, seatTitle, closeWin, pubDay, credits, savePart } from './aa-B-lib.mjs'
import { groundIdx, putExtra, putMain, addGroundRow, slotByRmk, rowPucks, rowSeat, dragOff } from './aa-B-rows.mjs'
const P = 'dice', M = 'shaft', W = 'glass'
const log = []
const say = (...a) => { const s = a.join(' '); log.push(s); console.log('  ' + s) }
const out = {}
const w = await world('desk'); w.tag = 's25'
const { page } = w
const f = await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', rmk: 'S25', s: '09:00', e: '12:00', oil: 'yes' })
await openBoard(page, 5)
await addGroundRow(page, 5, 'S25 SECOND', '10:00', '11:00', 'S25b')
let slot = await groundIdx(page, 'S25')
say('ALL in extras:', await putExtra(page, slot, 'all'))
slot = await groundIdx(page, 'S25'); say('ALL AVAIL repeated in extras:', await putExtra(page, slot, 'allavail'))
slot = await groundIdx(page, 'S25'); say('typed P:', await putExtra(page, slot, P))
const s2 = await slotByRmk(page, 'S25b'); say('P on the second row:', await putMain(page, s2, P))
say('row 1 pucks', JSON.stringify(await rowPucks(page, 'S25'))); say('row 2 pucks', JSON.stringify(await rowPucks(page, 'S25b')))
say('count chips on rows', JSON.stringify(await page.locator('#schedBoard .sb-arow .oilcount').evaluateAll(es => es.map(e => e.innerText + '|' + e.title))))
await pic(w, 'rows')
await oilOn(page, true)
const cnt = page.locator('#schedBoard .sb-arow .oilcount').first()
await cnt.click(); await sleep(500); await tabTo(page, 'earn')
let s = await winState(page); say('window', `P=${s.seats[P] || 'not listed (typed)'} M=${s.seats[M]} ${s.tabs[1]} total=${s.total}`); out.win = { tab: s.tabs[1], total: s.total, Plisted: P in s.seats }
await pic(w, 'win'); await closeWin(page)
say('P seat row1', JSON.stringify(await rowSeat(page, 'S25', P)), 'row2', JSON.stringify(await rowSeat(page, 'S25b', P)))
say('publish ORIG', JSON.stringify(await pubDay(page, 5)))
out.c0 = await credits(page, [P, M, W]); say('credits ORIG (P once, half a day)', JSON.stringify(out.c0)); await pic(w, 'lw0')
await openBoard(page, 5)
await dragOff(page, 'S25', P); say('typed P removed from row 1:', JSON.stringify(await rowPucks(page, 'S25')))
const s3 = await slotByRmk(page, 'S25b')
await page.locator(`#schedBoard [data-grdel="${s3.replace('g:', '')}"]`).first().click(); await sleep(700)
await dragOff(page, 'S25', 'all'); say('ALL removed:', JSON.stringify(await rowPucks(page, 'S25')))
await pic(w, 'sources-removed')
say('publish AL', JSON.stringify(await pubDay(page, 5)))
out.c1 = await credits(page, [P, M, W]); say('credits AL (P keeps half a day via the placeholder that remains)', JSON.stringify(out.c1))
await pic(w, 'lw1')
out.errors = w.errors
await w.browser.close()
savePart('s25-run', { out, log })
