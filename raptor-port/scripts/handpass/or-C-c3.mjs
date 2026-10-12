// Walker C, C3 - ALL AVAIL on a No (desktop 1440x900).
import * as L from './or-C-lib.mjs'
const { browser, page: p, errs } = await L.openWorld()
const DI = 5, ISO = '2026-07-18'
const j = o => JSON.stringify(o)
const duty = (await L.fileInput(p, { type: 'Duty', person: 'Ranger', from: ISO, to: ISO, timed: ['09:00', '12:00'], oil: 'no' }))[0]
console.log('filed', j(duty), 'record oil:', await L.recRaw(p, duty.iid).then(s => JSON.parse(s).oil && JSON.stringify(JSON.parse(s).oil)))
const day = () => p.locator('#eWeek .day:not(.peek)').nth(DI)
async function view() { await L.goEdit(p); await day().locator('.sec-grnd').first().scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, 150)); await p.waitForTimeout(300) }
const addz = () => day().locator(`[data-fill="g:${DI}.0.+"] .addz`).first()
const aaPuck = () => day().locator(`[data-fill="g:${DI}.0.+"] [data-person="allavail"]`).first()
const roster = id => p.locator(`#eRoster .rpuck[data-person="${id}"]:visible`).first()
async function empty() { const h = await day().getByText('GROUND PROGRAMME').first().boundingBox(); return { x: h.x + h.width + 120, y: h.y + 4 } }
const key = `i:${duty.iid}`
const chipNow = () => p.evaluate(k => { const c = document.querySelector(`#schedBoard [data-oilsent="${k}"]`); return c ? c.textContent.trim() + ' | ' + (c.getAttribute('title') || '') : '(no chip)' }, key)
const dayBar = () => p.evaluate(() => (document.querySelector('#schedBoard .sb-daybar, #schedBoard .sb-top, #schedBoard') || {}).innerText.replace(/\s+/g, ' ').slice(0, 20) && [...document.querySelectorAll('#schedBoard .oil-sum, #schedBoard [class*=oilsum], #schedBoard .oilbar-day')].map(e => e.innerText).join(' | '))
async function readOil(tag) {
  await L.oilOn(p, DI, true)
  const seats = await L.oilSeats(p, duty.iid)
  console.log(tag, 'chip:', await chipNow(), '| seats:', j(seats.seats))
  await L.openCrowd(p, key); await L.crowdTab(p, /earns OIL/i)
  const c = await L.crowd(p)
  console.log(tag, 'crowd tabs', j(c.tabs), '| foot:', c.foot)
  return c
}

await view()
let m = await L.toastMark(p)
await L.drag(p, roster('allavail'), addz())
console.log('ALL AVAIL dropped:', await L.toastsSince(p, m), '| input:', j((await L.rec(p, duty.iid)).people), '| oil on input:', (await L.rec(p, duty.iid)).oil)
let c = await readOil('1 after drop')
await L.shot(p, 'c3-1-no-nobody')
const on = c.rows.find(r => r.cs === 'Reaper')
await L.crowdToggle(p, on.id)
c = await L.crowd(p)
console.log('2 switched ON', on.cs, '| his row', j(c.rows.find(r => r.id === on.id)), '| tabs', j(c.tabs), '| foot:', c.foot)
console.log('2 chip', await chipNow())
await L.shot(p, 'c3-2-one-on')
// count who is on: rows with .seat.oilpk.on
const onList = await p.evaluate(() => [...document.querySelectorAll('.availwin [data-awp] .seat.oilpk')].map(e => (window.PEOPLE[e.getAttribute('data-oilp')] || {}).cs + ':' + (e.classList.contains('on') ? 'on' : 'off')).filter(x => x.endsWith(':on')))
console.log('2 men ON in the crowd:', j(onList))
await L.crowdClose(p); await L.oilOn(p, DI, false)
// take ALL AVAIL off, drop it back
await view()
m = await L.toastMark(p)
await L.drag(p, aaPuck(), await empty())
console.log('3 taken off:', await L.toastsSince(p, m), '| input:', j((await L.rec(p, duty.iid)).people))
await view()
m = await L.toastMark(p)
await L.drag(p, roster('allavail'), addz())
console.log('3 dropped back:', await L.toastsSince(p, m), '| input:', j((await L.rec(p, duty.iid)).people))
c = await readOil('3 after drop back')
const onList2 = await p.evaluate(() => [...document.querySelectorAll('.availwin [data-awp] .seat.oilpk')].map(e => (window.PEOPLE[e.getAttribute('data-oilp')] || {}).cs + ':' + (e.classList.contains('on') ? 'on' : 'off')).filter(x => x.endsWith(':on')))
console.log('3 men ON in the crowd:', j(onList2), '| Reaper row', j(c.rows.find(r => r.id === on.id)))
await L.shot(p, 'c3-3-after-redrop')
console.log('ERRORS', errs.join(' | ') || 'none')
await browser.close()
