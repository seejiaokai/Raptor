// Walker C, C1 - ALL AVAIL dragged off (desktop 1440x900).
import * as L from './or-C-lib.mjs'
import * as L2 from './or-C-lib2.mjs'
const { browser, page: p, errs } = await L.openWorld()
const DI = 5, ISO = '2026-07-18'
const j = o => JSON.stringify(o)
const duty = (await L.fileInput(p, { type: 'Duty', person: 'Ranger', from: ISO, to: ISO, timed: ['09:00', '12:00'], oil: 'yes' }))[0]
const two = (await L.fileInput(p, { type: 'Training', person: 'Hex', from: ISO, to: '2026-07-19', timed: ['13:00', '14:00'], title: 'Two day course', oil: 'no' }))[0]
console.log('filed', j(duty), j(two))
const day = () => p.locator('#eWeek .day:not(.peek)').nth(DI)
async function view() { await L.goEdit(p); await day().locator('.sec-grnd').first().scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, 150)); await p.waitForTimeout(300) }
const rowOfDuty = () => L.rowIdx(p, DI, duty.iid)
const dutyDesk = () => p.evaluate(di => window.DAYS[di].dutywaves.map(b => b.rows.map(r => r.role + '|' + JSON.stringify(r.id) + '|more:' + JSON.stringify(r.more || []))).flat(), DI)
const state = async () => ({ row: j(await L.rowData(p, DI, duty.iid)), input: j((await L.rec(p, duty.iid)).people), desk: j(await dutyDesk()) })

await view()
const ri = await rowOfDuty(), rj = await L.rowIdx(p, DI, two.iid)
console.log('rows', ri, rj)
// fixture: ALL AVAIL from the crew list onto the row's + add
let m = await L.toastMark(p)
await L.drag(p, p.locator('#eRoster .rpuck[data-person="allavail"]:visible').first(), day().locator(`[data-fill="g:${DI}.${ri}.+"] .addz`).first())
console.log('fixture drop toast:', await L.toastsSince(p, m), j(await state()))
await L.shot(p, 'c1-0-fixture')

// (a) ALL AVAIL from the row onto a duty desk
const aaSrc = () => day().locator(`[data-fill="g:${DI}.${ri}.+"] [data-person="allavail"]`).first()
const deskZone = () => day().locator(`[data-fill="d:${DI}.0.0.+"] .addz`).first()
console.log('boxes', j(await aaSrc().boundingBox()), j(await deskZone().boundingBox()))
m = await L.toastMark(p)
await L.drag(p, aaSrc(), deskZone())
const a1 = { toast: await L.toastsSince(p, m), ...(await state()) }
console.log('(a) after drag to desk', j(a1))
await L.shot(p, 'c1-a-desk')
// OIL Earn on the desk: does ALL AVAIL count by default there?
await L.oilOn(p, DI, true)
const oilDesk = await L.oilAll(p)
console.log('(a) OIL Earn items', j(oilDesk))
const chipDesk = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-oilsent]')].filter(e => e.offsetParent).map(e => e.getAttribute('data-oilsent') + '|' + e.textContent.trim() + '|' + (e.getAttribute('title') || '').slice(0, 90)))
console.log('(a) crowd chips', j(chipDesk))
await L.shot(p, 'c1-a-desk-oil')
await L.oilOn(p, DI, false)
const surfA = await L2.surfaces(p, { di: DI, iso: ISO, iid: duty.iid })
console.log('(a) surfaces', j(surfA))
// U / R
await L.goEdit(p)
const u = await L.undoRedo(p, 'undo')
const a2 = { used: u.used, toast: await L.toastNow(p), ...(await state()) }
console.log('(a) UNDO', j(a2))
await view(); await L.shot(p, 'c1-a-undo')
const r = await L.undoRedo(p, 'redo')
const a3 = { used: r.used, ...(await state()) }
console.log('(a) REDO', j(a3))
// back to the row for (b)
const u2 = await L.undoRedo(p, 'undo')
console.log('(a) UNDO again to restore the fixture', j(await state()))

// (b) onto the row of the TWO-DAY input
await view()
const two0 = await L.rowData(p, DI, two.iid)
const before = j(await state()) + j(await L.rec(p, two.iid))
console.log('two-day row before', j(two0))
const twoZone = day().locator(`[data-fill="g:${DI}.${rj}.+"] .addz`).first()
console.log('boxes b', j(await aaSrc().boundingBox()), j(await twoZone.boundingBox()))
m = await L.toastMark(p)
await L.drag(p, aaSrc(), twoZone)
const b1 = { toast: await L.toastsSince(p, m), ...(await state()), two: j(await L.rowData(p, DI, two.iid)), twoInput: j((await L.rec(p, two.iid)).people) }
console.log('(b) after', j(b1), 'unchanged:', before === j(await state()) + j(await L.rec(p, two.iid)))
await L.shot(p, 'c1-b-refused')

// (c) to empty space
await view()
const gh = day().locator('.sec-grnd').first()
const gb = await gh.boundingBox(); console.log('ground box', j(gb))
// an empty spot: the gap just above the Ground Programme heading
const nearHead = await day().getByText('GROUND PROGRAMME').first().boundingBox()
const empty = { x: nearHead.x + nearHead.width + 120, y: nearHead.y + 4 }
console.log('empty spot', j(empty), 'element there:', await p.evaluate(e => { const x = document.elementFromPoint(e.x, e.y); return x ? x.tagName + '.' + x.className : null }, empty))
m = await L.toastMark(p)
await L.drag(p, aaSrc(), empty)
const c1 = { toast: await L.toastsSince(p, m), ...(await state()) }
console.log('(c) after', j(c1))
await L.shot(p, 'c1-c-nowhere')
const surfC = await L2.surfaces(p, { di: DI, iso: ISO, iid: duty.iid })
console.log('(c) surfaces', j(surfC))
const wC = await L2.readWindow(p, { iso: ISO, iid: duty.iid })
console.log('(c) window', j({ people: wC.people, ph: wC.ph }))
console.log('ERRORS', errs.join(' | ') || 'none')
await browser.close()
