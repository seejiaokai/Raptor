// Walker C, C8 - moved to another day with its marks (desktop 1440x900). One world.
import * as L from './or-C-lib.mjs'
import * as L2 from './or-C-lib2.mjs'
const { browser, page: p, errs } = await L.openWorld()
const j = o => JSON.stringify(o)
const WED = 2, THU = 3
const tr = (await L.fileInput(p, { type: 'Training', person: 'Ranger', from: '2026-07-15', to: '2026-07-15', timed: ['14:00', '15:00'], title: 'Gun drill' }))[0]
const iid = tr.iid
console.log('filed', j(tr))
const rowAt = di => p.evaluate(([di, id]) => { const g = (window.DAYS[di].ground || []).find(x => x.src === id); if (!g) return null; const cs = x => window.PEOPLE[x]?.cs || x; return `${g.prog} ${g.str}-${g.end} who=${cs(g.who)} more=${JSON.stringify((g.more || []).map(cs))} flag=${!!g.flag} cx=${!!g.cx} cxr="${g.cxr || ''}" info=${!!g.info}` }, [di, iid])
const inp = async () => { const r = JSON.parse(await L.recRaw(p, iid)); const cs = x => window_cs[x] || x; return `date=${r.date}${r.to ? ' to ' + r.to : ''} people=${j(r.people.map(e => e.p))} flag=${r.flag} cx=${r.cx} cxr=${r.cxr} info=${r.info}` }
const window_cs = await p.evaluate(() => Object.fromEntries(Object.entries(window.PEOPLE).map(([k, v]) => [k, v.cs])))
// Tally from the schedule
await L.goEdit(p)
const day = di => p.locator('#eWeek .day:not(.peek)').nth(di)
let ri = await L.rowIdx(p, WED, iid)
await day(WED).locator(`[data-fill="g:${WED}.${ri}.+"]`).first().scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, 100)); await p.waitForTimeout(300)
let m = await L.toastMark(p)
await L.drag(p, p.locator(`#eRoster .rpuck[data-person="${await L.csId(p, 'Tally')}"]:visible`).first(), day(WED).locator(`[data-fill="g:${WED}.${ri}.+"] .addz`).first())
console.log('Tally added:', await L.toastsSince(p, m), '| INPUT:', await inp())
// red box and CX on the board
async function boardPress(attr, why, un) {
  await L.openBoard(p, WED); ri = await L.rowIdx(p, WED, iid)
  const b = p.locator(`#schedBoard [${attr}="${WED}.${ri}"]`).first(); await b.scrollIntoViewIfNeeded()
  const m0 = await L.toastMark(p); await b.click(); await p.waitForTimeout(500)
  if (attr === 'data-grcx' && await p.locator('#cxSave').count()) { const q = p.locator(`#cxQuick [data-cxq="${why}"]`).first(); if (await q.count()) await q.click(); await p.locator('#cxSave').click(); await p.waitForTimeout(500) }
  return L.toastsSince(p, m0)
}
console.log('red box:', await boardPress('data-grflag'))
console.log('CX:', await boardPress('data-grcx', 'WX'))
console.log('BEFORE the move: Wed row =', await rowAt(WED), '| Thu row =', await rowAt(THU), '| INPUT:', await inp())
await L.goEdit(p); await day(WED).locator('.sec-grnd .pl-row').first().scrollIntoViewIfNeeded(); await L.shot(p, 'c8-1-wed-before')

// open its window and change the date
await p.evaluate(() => window.go('inputs')); await p.locator('#inCalBtn').waitFor()
if (await p.locator('#inCalBtn').getAttribute('aria-pressed') !== 'true') await p.locator('#inCalBtn').click()
await p.locator('#inpCal').waitFor()
for (let i = 0; i < 12; i++) { const [mm, y] = (await p.locator('#inpCal .ic-mon').textContent()).trim().toLowerCase().split(/\s+/); const at = +y * 12 + L.MONTHS.findIndex(x => x.startsWith(mm)); if (at === 2026 * 12 + 6) break; await p.locator(at < 2026 * 12 + 6 ? '#icNext' : '#icPrev').click() }
await p.locator('[data-icday="2026-07-15"]').focus(); await p.keyboard.press('Enter'); await p.waitForSelector('[data-testid="win-inputsday"]'); await p.waitForTimeout(300)
await p.locator(`.icard[data-popiid="${iid}"]`).first().click(); await p.waitForSelector('#inpEditPop'); await p.waitForTimeout(400)
console.log('window head:', await p.evaluate(() => document.querySelector('[data-testid="win-inputedit"] .win-bar').innerText.replace(/\s+/g, ' ')))
// the date picker: choose Thu 16 Jul (start and end)
await p.locator('#inpEdCal [data-cal="2026-07-16"]').click(); await p.waitForTimeout(200)
console.log('after first click on 16 Jul: date text:', await p.evaluate(() => (document.querySelector('#inpEdCal')?.closest('.inped-f')?.innerText || '').replace(/\s+/g, ' ').slice(0, 120)))
await p.locator('#inpEdCal [data-cal="2026-07-16"]').click(); await p.waitForTimeout(200)
console.log('after second click: date text:', await p.evaluate(() => (document.querySelector('#inpEdCal')?.closest('.inped-f')?.innerText || '').replace(/\s+/g, ' ').slice(0, 120)))
await L.shot(p, 'c8-2-window-date')
m = await L.toastMark(p)
await p.locator('#inpEditSave').click(); await p.waitForTimeout(600)
for (let k = 0; k < 3; k++) { const sheet = p.locator('[data-testid="oilconf"]'); if (await sheet.count()) { console.log('(an OIL question opened)'); break } }
console.log('saved: toast', await L.toastsSince(p, m), '| INPUT:', await inp())
console.log('AFTER the move: Wed row =', await rowAt(WED), '| Thu row =', await rowAt(THU))

// every surface on Thursday and on Wednesday
await L.goEdit(p)
const thuWeek = await p.evaluate(() => { const z = document.querySelectorAll('#eWeek .day:not(.peek)')[3]; return [...z.querySelectorAll('.sec-grnd .pl-row')].map(r => `class="${r.className}" text="${(r.innerText || '').replace(/\s+/g, ' ').trim()}"`).join(' || ') })
const wedWeek = await p.evaluate(() => { const z = document.querySelectorAll('#eWeek .day:not(.peek)')[2]; return [...z.querySelectorAll('.sec-grnd .pl-row, .sec-inp .pl-row')].map(r => (r.innerText || '').replace(/\s+/g, ' ').trim()).filter(t => /gun drill/i.test(t)).join(' || ') || '(nothing of it on Wed ground/inputs)' })
console.log('Thu week ground rows:', thuWeek); console.log('Wed week lines mentioning it:', wedWeek)
await day(THU).locator('.sec-grnd .pl-row').first().scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, 100)); await L.shot(p, 'c8-3-thu-week')
const sThu = await L2.surfaces(p, { di: THU, iso: '2026-07-16', iid })
console.log('Thu surfaces:', j(sThu))
await L.openBoard(p, WED)
console.log('Wed board mentions it?', await p.evaluate(() => /gun drill/i.test(document.querySelector('#schedBoard').innerText) ? 'YES' : 'no'))
await L.openBoard(p, THU)
const brow = await p.evaluate(() => { const rows = [...document.querySelectorAll('#schedBoard .sb-panel.grnd .sb-arow')].filter(e => e.offsetParent); return rows.map(r => `class="${r.className}" inputs=${JSON.stringify([...r.querySelectorAll('input.ain')].map(x => x.value))} names=${JSON.stringify([...r.querySelectorAll('.ppl .puck .nm')].map(x => x.textContent))}`).join(' || ') })
console.log('Thu board ground rows:', brow)
await L.shot(p, 'c8-4-thu-board')
await L.closeBoard(p)
// the calendar: Thursday cancelled; Wednesday has none
await p.evaluate(() => window.go('inputs')); await p.locator('#inpCal').waitFor()
const bars = await p.evaluate(iid => [...document.querySelectorAll(`.ib-bar[data-iid="${iid}"]`)].map(e => ({ day: e.closest('[data-icday]')?.getAttribute('data-icday'), text: e.textContent.trim(), strike: getComputedStyle(e).textDecorationLine, opacity: getComputedStyle(e).opacity, tip: (e.getAttribute('title') || '').replace(/\n/g, ' / ') })), iid)
console.log('calendar bars for the input:', j(bars))
await p.locator('[data-icday="2026-07-16"]').scrollIntoViewIfNeeded(); await L.shot(p, 'c8-5-calendar')

// U / R
const u = await L.undoRedo(p, 'undo'); console.log('UNDO', u.used, '| toast', await L.toastNow(p), '| INPUT:', await inp(), '| Wed row =', await rowAt(WED), '| Thu row =', await rowAt(THU))
const r = await L.undoRedo(p, 'redo'); console.log('REDO', r.used, '| INPUT:', await inp(), '| Wed row =', await rowAt(WED), '| Thu row =', await rowAt(THU))
console.log('ERRORS', errs.join(' | ') || 'none')
await browser.close()
