import { world, fileInput, pic, sleep, go, openBoard, oilOn, openCount, tabTo, winState, seatTitle, closeWin, pubDay, credits, savePart } from './aa-B-lib.mjs'
import { addGroundRow, putMain, slotByRmk, rowSeat } from './aa-B-rows.mjs'
const P = 'dice', W = 'glass'
const log = []
const say = (...a) => { const s = a.join(' '); log.push(s); console.log('  ' + s) }
const out = {}
const w = await world('desk'); w.tag = 's21'
const { page } = w
const f = await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', rmk: 'S21', s: '09:00', e: '12:00', oil: 'yes' })
const iid = f.rec.iid
await openBoard(page, 5)
const slot = await addGroundRow(page, 5, 'S21 LATER WORK', '15:00', '16:00', 'S21x'); say('added row', slot)
const s2 = await slotByRmk(page, 'S21x'); say('row slot now', s2)
say('put P:', await putMain(page, s2, P))
await oilOn(page, true)
out.pSeat = await rowSeat(page, 'S21x', P); say('P on his own row', JSON.stringify(out.pSeat))
await pic(w, 'rows')
await openCount(page, iid); await tabTo(page, 'earn')
let s = await winState(page); say('crowd window', `P=${s.seats[P]} W=${s.seats[W]} ${s.tabs[1]}`)
out.pTitle = await seatTitle(page, P); out.wTitle = await seatTitle(page, W); say('P title:', out.pTitle); say('W title:', out.wTitle)
await pic(w, 'win')
await closeWin(page)
say('publish ORIG', JSON.stringify(await pubDay(page, 5)))
out.c0 = await credits(page, [P, W]); say('credits after ORIG (expect P full day, W half)', JSON.stringify(out.c0))
await pic(w, 'lw0')
await openBoard(page, 5)
const s3 = await slotByRmk(page, 'S21x')
await page.locator(`#schedBoard [data-grdel="${s3.replace('g:', '')}"]`).first().click(); await sleep(700)
say('deleted P\'s later row; remaining', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld^="gr:5."][data-bfld$=".rmks"]')].map(e => e.value))))
await pic(w, 'after-delete')
out.pre = await credits(page, [P, W]); say('credits before AL (should still be issued figures)', JSON.stringify(out.pre))
await openBoard(page, 5)
say('publish AL', JSON.stringify(await pubDay(page, 5)))
out.c1 = await credits(page, [P, W]); say('credits after AL (expect P half)', JSON.stringify(out.c1))
await pic(w, 'lw1')
out.errors = w.errors
await w.browser.close()
savePart('s21-run', { out, log })
