import { world, fileInput, pic, sleep, openBoard, oilOn } from './aa-B-lib.mjs'
import { groundIdx, putMain, rowPucks } from './aa-B-rows.mjs'
const w = await world('desk'); w.tag = 'p22'
const { page } = w
const f = await fileInput(page, { iso: '2026-07-18', kind: 'Duty', person: 'allavail', rmk: 'P22', s: '09:00', e: '12:00', oil: 'yes' })
await openBoard(page, 5)
const slot = await groundIdx(page, 'P22')
console.log('replace main by shaft:', await putMain(page, slot, 'shaft'))
console.log('row pucks', JSON.stringify(await rowPucks(page, 'P22')))
console.log('input record person/oil:', await page.evaluate(i => { const x = window.INPUTS.find(v => v.iid === i); return x.person + ' ' + JSON.stringify(x.oil) }, f.rec.iid))
await oilOn(page, true)
console.log('seat', await page.evaluate(() => [...document.querySelectorAll('#schedBoard .sb-arow .seat.oilpk')].map(e => e.dataset.oilp + ':' + e.className.match(/\b(on|off|inert)\b/)[0] + ':' + e.title.slice(0, 80)).join(' ; ')))
await w.browser.close()
