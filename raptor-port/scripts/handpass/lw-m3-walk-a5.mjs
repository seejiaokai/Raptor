// Walker A, scenario 5: admin, ticked, a range across a LOCKED WEEK. The locked-week premise cannot be made through the app's own controls
// (a locked week is a stored week the app cannot read; nothing on screen makes one), so this script records that, and walks the nearest
// reachable thing: a ticked range across a day that already holds approved leave of another kind (Drifter, 1 Jan, OL from an Input).
// usage: node lw-m3-walk-a5.mjs <desktop|phone>
import * as L from './lw-m3-walk-a-lib.mjs'
const size = process.argv[2] || 'desktop'
const tag = `s5-${size === 'phone' ? 'ph' : 'dk'}`
console.log('lw-m3-walk-a5 v1', size, tag)
const w = await L.newCtx(size)
const P = w.page, ID = `5 ${size}/chromium`
const cellS = async (who, iso) => { const b = await L.boxes(w, who, iso); return b && b.boxes.length ? b.boxes.map(x => x.split('|')[1]).join('+') : 'none' }
await L.signInPlain(w, 'admin')
const n0 = (await L.storedInputs(P)).length
const days = ['2026-01-01', '2026-01-02', '2026-01-03']
await L.reachCell(w, 'slipway', days[0])
const before = {}; for (const d of days) before[d] = await cellS('slipway', d)
console.log('before', JSON.stringify(before))
await L.cellShot(w, 'slipway', days[0], tag + '-00-before')
await L.openCellR(w, 'slipway', days[1], w.phone ? tag + '-01-celltap-q' : null)
await L.step(w, tag + '-02-range', L.T('span-range'))
await P.waitForTimeout(400)
// pick 1 Jan then 3 Jan on the window's own calendar
for (const d of [days[0], days[2]]) {
  for (let i = 0; i < 6 && !(await L.vis(P, L.T('span-day-' + d))); i++) { await L.press(w, L.T('span-prev')); await P.waitForTimeout(250) }
  await L.press(w, L.T('span-day-' + d)); await P.waitForTimeout(250)
}
const sel = await L.txt(P, L.T('span-selection'))
await L.shot(w, tag + '-03-range-picked')
const dl = await L.dayline(P)
console.log('range selection', sel, '| dayline', dl)
await L.step(w, tag + '-04-ll1', L.T('bid-LL'))
let note = null
if (await L.vis(P, L.T('bid-picker'))) { note = (await L.winGeom(P)).text.match(/That takes[^|]*/)?.[0]; await L.shot(w, tag + '-04b'); if (note) await L.step(w, tag + '-05-ll2', L.T('bid-LL')) }
await P.waitForTimeout(700)
const open = await L.vis(P, L.T('bid-picker'))
const g = open ? (await L.winGeom(P)).text : null
await L.shot(w, tag + '-06-result')
const after = {}; for (const d of days) after[d] = await cellS('slipway', d)
const n1 = (await L.storedInputs(P)).length
console.log('window still open', open, '| text', g?.slice(0, 400), '| after', JSON.stringify(after), '| inputs', n0, '->', n1, '| note', note)
const verdict = open && /not approved|locked|already/i.test(g || '') ? 'PASS' : 'FAIL'
L.rec(ID + ' (range, ticked, across a day the approval refuses)', size, verdict, `range "${sel}"; before ${JSON.stringify(before)}; after ${JSON.stringify(after)}; window open after: ${open}; window words "${(g || '').match(/(?:[^|]*(?:not approved|locked|already)[^|]*)/)?.[0] || ''}"; stored inputs ${n0} -> ${n1}`, [tag + '-03-range-picked', tag + '-06-result'])
console.log('ERRORS', JSON.stringify(w.errs))
await L.closeBrowser()
