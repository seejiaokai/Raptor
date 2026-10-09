import * as C from './it-C-lib.mjs'
const { row, sleep } = C
const size = process.argv[2] || 'desk'
const variant = process.argv[3] || 'A'
const w = await C.world(size, 'ad', { fresh: false })
const p = w.page
const rg = await C.pid(p, 'Ranger')
const pics = []
const sc = await C.scShift(w, 4, rg)
console.log('SC', JSON.stringify(sc))
const spec = {
  A: { first: { type: 'Training', title: 'Meeting', rmk: 'a53' }, second: { type: 'Meeting', rmk: 'b53' }, name: 'MEETING', what: 'Training titled "Meeting" first, then a Meeting' },
  B: { first: { type: 'Meeting', rmk: 'b53' }, second: { type: 'Training', title: 'Meeting', rmk: 'a53' }, name: 'MEETING', what: 'a Meeting first, then Training titled "Meeting"' },
  C: { first: { type: 'Event', title: 'Same name', rmk: 'a53' }, second: { type: 'Event', title: 'Same name', rmk: 'b53' }, name: 'SAME NAME', what: 'two separately filed Events titled "Same name"' },
}[variant]
await C.fileNew(w, { iso: '2026-07-17', person: rg, s: '10:00', e: '11:00', ...spec.first })
const mid = await C.warnAll(p, 4)
await C.fileNew(w, { iso: '2026-07-17', person: rg, s: '10:00', e: '11:00', ...spec.second })
const recs = [...await C.recAll(p, { remarks: 'a53' }), ...await C.recAll(p, { remarks: 'b53' })]
const all = (await C.warnAll(p, 4)).filter(x => x.code !== 'CREW_REST')
await C.openBoard(w, 4)
const side = (await C.warnLines(p)).filter(x => !/Crew rest/.test(x)).slice(0, 8)
const ring = await p.evaluate(() => { const s = document.querySelector('#schedBoard [data-slot="4.0.0.0.p"] .puck'); return s ? (s.className.replace(/\s+/g, ' ') + ' | ' + (s.title || '')) : 'no puck' })
// does the board list both commitments?
const boardRows = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-bfld^="gr:4."][data-bfld$=".prog"]')].map(x => (x.value || x.textContent || '').trim()))
await p.locator('#sbSide').scrollIntoViewIfNeeded().catch(() => {})
pics.push(await C.pic(w, `s53-${variant}-board`))
// open the warning list (tap to review) if collapsed
const wl = p.locator('#sbSide').getByText(/tap to review/).first(); if (await wl.count()) { await C.press(w, wl).catch(() => {}); await sleep(500); pics.push(await C.pic(w, `s53-${variant}-warnlist`)) }
const side2 = (await C.warnLines(p)).filter(x => !/Crew rest/.test(x)).slice(0, 10)
await C.closeBoard(p)
// both visible on the Inputs day card
await C.go(p, 'inputs'); const cal = p.locator('#inCalBtn'); if (await cal.count() && await cal.isVisible().catch(() => false)) await cal.click().catch(() => {})
await C.month(p, 2026, 7)
const cell = p.locator('#inpCal [data-icday="2026-07-17"]'); if (w.touch) await cell.tap({ position: { x: 8, y: 8 } }); else await cell.click({ position: { x: 8, y: 8 } }); await sleep(400)
const cards = await p.evaluate(() => [...document.querySelectorAll('[data-testid^="idy-row-"]')].map(c => c.innerText.replace(/\s+/g, ' ').trim()))
pics.push(await C.pic(w, `s53-${variant}-daycard`))
await C.closeWins(p)
// the week's Ground Programme (Edit Schedule), Friday
await C.go(p, 'editsched')
const weekRows = await p.evaluate(() => [...document.querySelectorAll('#eWeek .day[data-day="4"] .pl-row.gr-frominput')].map(r => (r.querySelector(':scope > .nm')?.innerText || '').replace(/\s+/g, ' ').trim()))
await p.evaluate(() => document.querySelector('#eWeek .day[data-day="4"] .pl-row.gr-frominput')?.scrollIntoView({ block: 'center' })); await sleep(400)
pics.push(await C.pic(w, `s53-${variant}-week`))
const joined = JSON.stringify(all.map(x => x.msg)) + JSON.stringify(side2)
const two = new RegExp('two items called ' + spec.name + ' at once', 'i').test(joined)
const hard = all.filter(x => x.sev === 'hard').map(x => x.msg), soft = all.filter(x => x.sev !== 'hard').map(x => `${x.sev}: ${x.msg}`)
const ok = recs.length === 2 && cards.length >= 2 && two
row(53, size, 'admin', ok ? 'PASS' : 'FAIL',
  `[${variant}: ${spec.what}] Ranger on SC AM 07:00-13:00 Fri 17 Jul, both 10:00-11:00. Records saved ${recs.length} (${recs.map(r => r.type + ' "' + (r.title || '') + '"').join(' + ')}). After the first alone: ${mid.filter(x => x.code !== 'CREW_REST').map(x => x.sev + ': ' + x.msg).join(' ; ') || 'nothing'}. After both: hard [${hard.join(' ; ')}], other [${soft.join(' ; ')}]; "two items called ${spec.name} at once" present: ${two}. Warning list on the board: ${JSON.stringify(side2)}. Day card shows ${cards.length} rows: ${JSON.stringify(cards)}. Week's Ground Programme rows on Friday: ${JSON.stringify(weekRows)}. Board name boxes: ${JSON.stringify(boardRows)}. Ring: ${ring}`, pics)
await C.finish(w, `s53-${size}-${variant}`)
