// Walker C, C7 - a cancelled input's people are free (desktop 1440x900). One world.
import * as L from './or-C-lib.mjs'
const { browser, page: p, errs } = await L.openWorld()
const j = o => JSON.stringify(o)
const wed = (await L.fileInput(p, { type: 'Training', person: 'Ranger', from: '2026-07-15', to: '2026-07-15', timed: ['10:00', '11:30'], title: 'Gun drill' }))[0]
const sat = (await L.fileInput(p, { type: 'Training', person: 'Ranger', from: '2026-07-18', to: '2026-07-18', timed: ['09:00', '12:00'], title: 'Sat drill', oil: 'yes' }))[0]
console.log('filed', j(wed), j(sat))
async function boardCx(di, iid, why, un) {
  await L.openBoard(p, di)
  const ri = await L.rowIdx(p, di, iid)
  const b = p.locator(`#schedBoard [data-grcx="${di}.${ri}"]`).first(); await b.scrollIntoViewIfNeeded()
  const m = await L.toastMark(p); await b.click(); await p.waitForTimeout(500)
  if (await p.locator('#cxSave').count()) { if (un) await p.locator('#cxUn').click(); else { const q = p.locator(`#cxQuick [data-cxq="${why}"]`).first(); if (await q.count()) await q.click(); await p.locator('#cxSave').click() } await p.waitForTimeout(500) }
  return L.toastsSince(p, m)
}
const warns = async di => { await L.openBoard(p, di); return p.evaluate(() => { const side = document.querySelector('#sbSide'); if (!side) return []; const t = side.innerText || ''; const cut = t.indexOf('PLACEHOLDERS'); return (cut > 0 ? t.slice(0, cut) : t).split(/\r?\n/).map(s => s.trim()).filter(x => x && x !== '✕' && x !== '·') }) }
const mine = ls => j(ls.filter(x => /ranger|gun drill/i.test(x)))

// Wed: Ranger onto the flying seat
await L.goEdit(p)
const rid = await L.csId(p, 'Ranger')
const seat = p.locator('#eWeek .day:not(.peek)').nth(2).locator('[data-slot="2.0.1.0.p"]').first()
await seat.scrollIntoViewIfNeeded(); await p.waitForTimeout(300)
await L.drag(p, p.locator(`#eRoster .rpuck[data-person="${rid}"]:visible`).first(), seat)
console.log('Ranger on the seat:', await p.evaluate(() => window.PEOPLE[window.DAYS[2].waves[0].formations[1].aircraft[0].p]?.cs))
let w = await warns(2); console.log('1 before CX: header', w[0], w[1], '| lines about Ranger / Gun drill:', mine(w))
await L.shot(p, 'c7-1-clash')
let t = await boardCx(2, wed.iid, 'WX'); console.log('2 CX:', t, '| input cx=', (await L.rec(p, wed.iid)).cx)
w = await warns(2); console.log('2 after CX: header', w[0], w[1], '| lines about Ranger / Gun drill:', mine(w))
await L.shot(p, 'c7-2-cancelled')
t = await boardCx(2, wed.iid, null, true); console.log('3 un-cancel:', t, '| input cx=', (await L.rec(p, wed.iid)).cx)
w = await warns(2); console.log('3 after un-cancel: header', w[0], w[1], '| lines about Ranger / Gun drill:', mine(w))
await L.shot(p, 'c7-3-back')

// Saturday: OIL Earn
await L.goEdit(p)
const day = () => p.locator('#eWeek .day:not(.peek)').nth(5)
await day().locator('.sec-grnd').first().scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, 150)); await p.waitForTimeout(300)
const ri = await L.rowIdx(p, 5, sat.iid)
await L.drag(p, p.locator('#eRoster .rpuck[data-person="allavail"]:visible').first(), day().locator(`[data-fill="g:5.${ri}.+"] .addz`).first())
console.log('4 Sat: ALL AVAIL on, input people:', j((await L.rec(p, sat.iid)).people))
const key = `i:${sat.iid}`
const oilRead = async tag => {
  await L.oilOn(p, 5, true)
  const s = await L.oilSeats(p, sat.iid)
  const panel = await p.evaluate(() => { const t = (document.querySelector('#schedBoard').innerText || '').replace(/\s+/g, ' '); const i = t.indexOf('OIL EARN'); return t.slice(i, i + 110) })
  console.log(tag, 'seats:', j(s.seats), '| chip:', j(s.chip), '| panel:', panel, '| all OIL items on the day:', j(await L.oilAll(p)))
  return s
}
await oilRead('4 before CX')
await L.oilOn(p, 5, false)
t = await boardCx(5, sat.iid, 'WX'); console.log('5 Sat CX:', t, '| input cx=', (await L.rec(p, sat.iid)).cx)
await oilRead('5 after CX')
await L.shot(p, 'c7-4-sat-cancelled-oil')
const tt = await p.evaluate(iid => { const c = document.querySelector(`#schedBoard [data-oilsent="i:${iid}"]`); return c ? 'chip still drawn' : 'no ALL AVAIL counter drawn for the input' }, sat.iid)
console.log('5', tt)
await L.oilOn(p, 5, false)
t = await boardCx(5, sat.iid, null, true); console.log('6 Sat un-cancel:', t)
await oilRead('6 after un-cancel')
console.log('ERRORS', errs.join(' | ') || 'none')
await browser.close()
