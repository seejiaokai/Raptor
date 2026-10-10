import { world, fileInput, pic, sleep, openBoard, oilOn, pubDay, credits, savePart } from './aa-B-lib.mjs'
import { addGroundRow, slotByRmk, putMain } from './aa-B-rows.mjs'
const log = []
const say = (...a) => { const s = a.join(' '); log.push(s); console.log('  ' + s) }
const w = await world('desk'); w.tag = 's54c'
const { page } = w
const f = await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', rmk: 'S54no', s: '09:00', e: '10:00', oil: 'no' })
await openBoard(page, 5)
await addGroundRow(page, 5, 'S54 SEPARATE', '13:00', '16:00', 'S54x')
const sl = await slotByRmk(page, 'S54x'); say('placed on a separate row:', await putMain(page, sl, 'allavail'))
await oilOn(page, true)
say('chips', JSON.stringify(await page.locator('#schedBoard .sb-arow .oilcount').evaluateAll(es => es.map(e => e.innerText + ' | ' + e.title))))
await pic(w, 'rows')
await oilOn(page, false)
say('publish', JSON.stringify(await pubDay(page, 5)))
const c = await credits(page, ['dice', 'shaft', 'torque']); say('credits (Reaper, Anvil, ground man Ratchet): separate 3h row Yes by default; the No request pays none; ground crew stay out', JSON.stringify(c))
await pic(w, 'lw')
// RCP refusal, photographed straight after the pick
await openBoard(page, 5)
await page.locator('#schedBoard [data-wvadd="5"]').first().click(); await sleep(500)
await page.getByRole('button', { name: 'Flying wave', exact: true }).first().click(); await sleep(900)
const z = page.locator('#schedBoard [data-slot="5.0.0.0.w"]').first(); await z.scrollIntoViewIfNeeded(); const b = await z.boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(300)
const ph = page.locator('#sbRoster .rpuck[data-person="allavail"]:visible').first(); await ph.scrollIntoViewIfNeeded(); await ph.click(); await sleep(150)
await pic(w, 'rcp-refusal'); say('RCP seat holds a placeholder?', await page.evaluate(() => !!document.querySelector('#schedBoard [data-slot="5.0.0.0.w"] .puck.allavail')))
say('words on screen', JSON.stringify(await page.evaluate(() => document.body.innerText.split(String.fromCharCode(10)).filter(l => /crew a jet|cannot|can’t/i.test(l)).slice(0, 4))))
savePart('s54c-run', { log, errors: w.errors })
await w.browser.close()
