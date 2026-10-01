/* p7 walker C — probe 7 (C33): a Training request on Saturday, where it lands, and which doors reach its name box. */
import { boot, world, fileTimed, accBtn, oilButton, oilPucks } from './p6-lib.mjs'
import * as C from './p7-c-lib.mjs'
const { L, W } = await boot()
const { browser, p, errors } = await world(L)
await C.toastSpy(p)
const SAT = 5
const id = cs => p.evaluate(c => Object.keys(window.PEOPLE).find(k => window.PEOPLE[k].cs === c), cs)
const RANGER = 'bane', BLADE = await id('Blade'), COBRA = await id('Cobra')
console.log('ids', RANGER, BLADE, COBRA, await p.evaluate(() => [...document.querySelectorAll('#inType option')].map(o => o.value)))
const iid = await fileTimed(L, p, { person: RANGER, type: 'Training', iso: '2026-07-18', from: '08:00', to: '16:00', remarks: 'P7 NAMEBOX' })
console.log('filed', iid, JSON.stringify(await p.evaluate(i => window.INPUTS.find(x => x.iid === i), iid)), await C.toasts(p))
await L.shot(p, 'probe7-inputs')
await W.boardOn(p, SAT)
console.log('ground', JSON.stringify(await p.evaluate(() => window.DAYS[5].ground)))
let ri = await p.evaluate(i => window.DAYS[5].ground.findIndex(r => r.src === i), iid)
if (ri < 0) { console.log('accept', await accBtn(L, p, SAT, iid, 'g')); ri = await p.evaluate(i => window.DAYS[5].ground.findIndex(r => r.src === i), iid) }
console.log('row index', ri, JSON.stringify(await p.evaluate(r => window.DAYS[5].ground[r], ri)))
const rowHtml = () => p.evaluate(r => { const e = document.querySelector(`#schedBoard [data-fill="g:5.${r}.+"]`); return e ? e.closest('.sb-arow').outerHTML.slice(0, 1800) : null }, ri)
console.log('ROW', await rowHtml())
const seat = p.locator(`#schedBoard [data-slot="g:5.${ri}"]:visible`).first()
await seat.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(300)
await L.shot(p, 'probe7-row')
// (a) tap the name box
await seat.click(); await L.sleep(300)
console.log('(a) tap name box → armed', await p.evaluate(() => window.armedKey()), await C.toasts(p))
await L.shot(p, 'probe7-a-tapped')
// then tap Blade in the crew list
const bl = p.locator(`#sbRoster .rpuck[data-person="${BLADE}"]:visible`).first()
console.log('blade in list', await bl.count(), await bl.evaluate(e => e.className + ' | ' + e.title).catch(() => null))
await bl.click().catch(e => console.log('click failed', e.message.split('\n')[0])); await L.sleep(500)
console.log('(a) after tapping Blade', JSON.stringify(await p.evaluate(r => window.DAYS[5].ground[r], ri)), await C.toasts(p))
await L.shot(p, 'probe7-a-after')
await p.keyboard.press('Escape'); await L.sleep(200)
// (b) drag Cobra from the crew list onto the name box
try { await W.drag(p, p.locator(`#sbRoster .rpuck[data-person="${COBRA}"]:visible`).first(), p.locator(`#schedBoard [data-slot="g:5.${ri}"]:visible`).first()) } catch (e) { console.log('drag err', e.message.slice(0, 200)) }
console.log('(b) after dragging Cobra onto the name box', JSON.stringify(await p.evaluate(r => window.DAYS[5].ground[r], ri)), await C.toasts(p))
await L.shot(p, 'probe7-b-after')
console.log('request now', JSON.stringify(await p.evaluate(i => window.INPUTS.find(x => x.iid === i), iid)))
console.log('ROW', await rowHtml())
// OIL earn
console.log('oil', await oilButton(L, p), JSON.stringify(await oilPucks(p)))
await L.shot(p, 'probe7-oil')
console.log('oil items', await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilitem]')].filter(e => e.offsetParent !== null).map(e => ({ item: e.dataset.oilitem, p: e.dataset.oilp || null, cls: e.className, title: e.title, txt: (e.innerText || '').trim().slice(0, 40) }))))
console.log('row pucks', await p.evaluate(r => { const e = document.querySelector(`#schedBoard [data-fill="g:5.${r}.+"]`); return e ? [...e.closest('.sb-arow').querySelectorAll('[data-person]')].map(x => ({ p: x.dataset.person, cls: x.className, title: x.title, oilp: x.dataset.oilp || null })) : null }, ri))
console.log('errors', errors)
await browser.close()
