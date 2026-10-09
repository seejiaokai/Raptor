// Scenario 29 - Title, then publish. usage: node it-B-s29.mjs desk
import * as L from './it-B-lib.mjs'
const size = process.argv[2] || 'desk'
const DI = 2, ISO = '2026-07-15'
const W = await L.mk(size)
const p = W.page
const ranger = await L.csId(p, 'Ranger'), basher = await L.csId(p, 'Basher')
const tag = `s29-${size}`
await L.fileInput(W, { iso: ISO, type: 'Event', person: ranger, s: '09:00', e: '10:00', title: 'Sports day', rmk: 'titled one' })
await L.fileInput(W, { iso: ISO, type: 'Event', person: basher, s: '11:00', e: '12:00', rmk: 'untitled one' })
const pub = await L.pubDay(W, DI)
console.log('pub', JSON.stringify(pub))
async function read(t) {
  const S = await L.snap(W, DI, { focus: 'sports day|^event$', pic: t })
  await L.openBoard(W, DI)
  const rows = await L.boardRows(p)
  await L.boardFocus(p, 'sports day|^event$')
  await L.shot(p, t + '-board')
  await L.closeBoard(p)
  return { S, rows }
}
const good = ({ S, rows }) => {
  const e = S.f.rows.map(r => r.name + '[' + r.kind + ']').sort().join('|'), v = S.v.rows.map(r => r.name + '[' + r.kind + ']').sort().join('|')
  const want = 'EVENT[]|SPORTS DAY[EVENT]'
  const b = rows.filter(r => /sports day|^event$/i.test(r.name)).map(r => r.name + '[' + r.kind.toUpperCase() + ']').sort().join('|')
  return { ok: e === want && v === want && b === want && !S.f.pend.length && !S.f.nys, e, v, b }
}
const r1 = await read(tag + '-1published'); const g1 = good(r1)
L.row('29', size, 'admin', g1.ok ? 'PASS' : 'FAIL', `published after titling: week ${g1.e} | view-only ${g1.v} | board ${g1.b} | pending ${r1.S.f.pend.join(',') || '0'} | not-yet-signed ${r1.S.f.nys ? 'YES' : 'no'}`, [tag + '-1published-edit.png', tag + '-1published-view.png', tag + '-1published-board.png'])
await L.reload(W)
const r2 = await read(tag + '-2reload'); const g2 = good(r2)
L.row('29', size, 'admin', g2.ok ? 'PASS' : 'FAIL', `after reload: week ${g2.e} | view-only ${g2.v} | board ${g2.b} | pending ${r2.S.f.pend.join(',') || '0'}`, [tag + '-2reload-edit.png', tag + '-2reload-view.png', tag + '-2reload-board.png'])
await W.browser.close()
L.saveRows('s29-' + size)
console.log('ERRORS', L.ERRS)
