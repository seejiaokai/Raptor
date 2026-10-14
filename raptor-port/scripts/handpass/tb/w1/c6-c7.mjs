import * as F from './fx.mjs'
const { L } = F
console.log('w1 c6-c7 v1')
const w = await L.world('phone')
const p = w.page
const ok = (id, expected, saw, pass) => L.row('W1', id, expected, typeof saw === 'string' ? saw : JSON.stringify(saw), pass ? 'PASS' : 'FAIL')
try {
  const fx = await F.c6Fixture(w, { pics: 'c6-phone' })
  console.log('crew', JSON.stringify(fx.crew), 'set1', JSON.stringify(fx.set1), 'set2', JSON.stringify(fx.set2))
  const { n1, n2 } = fx
  console.log('n1', JSON.stringify({ line: n1.line, expanded: n1.expanded, rows: n1.rows.length }), 'n2', JSON.stringify({ line: n2.line, expanded: n2.expanded, rows: n2.rows.length }))
  ok('C6', 'one clash: list open with no tap; then with the second clash (nothing pressed) the list is closed and the line reads "⚠ 2 clashes with the schedule Show"',
    { one: { line: n1.line, expanded: n1.expanded, rows: n1.rows.length }, two: { line: n2.line, expanded: n2.expanded, rows: n2.rows.length } },
    n1.expanded === 'true' && n1.rows.length === 1 && n2.expanded === 'false' && n2.rows.length === 0 && n2.line === '⚠ 2 clashes with the schedule Show')
  await L.pic(w, 'c6-phone-two-closed')
  // C7
  const seq = []
  await w.press('[data-testid="clash-line"]'); await L.sleep(300); let n = await F.readNote(p); seq.push(['tap1', n.expanded, n.rows.length, n.line])
  await L.pic(w, 'c7-phone-tap1-open')
  await w.press('[data-testid="clash-line"]'); await L.sleep(300); n = await F.readNote(p); seq.push(['tap2', n.expanded, n.rows.length, n.line])
  await L.pic(w, 'c7-phone-tap2-closed')
  await w.press('[data-testid="clash-line"]'); await L.sleep(300); n = await F.readNote(p); seq.push(['tap3', n.expanded, n.rows.length, n.line])
  await L.pic(w, 'c7-phone-tap3-open')
  await L.go(w, 'editsched'); await L.go(w, 'leavewar'); await L.sleep(600)
  n = await F.readNote(p); seq.push(['after another page', n.expanded, n.rows.length, n.line])
  await L.pic(w, 'c7-phone-after-another-page')
  ok('C7', 'tap1 opens, tap2 closes, tap3 opens (in place); after Edit Schedule and back the list is still open', seq,
    seq[0][1] === 'true' && seq[0][2] === 2 && seq[1][1] === 'false' && seq[1][2] === 0 && seq[2][1] === 'true' && seq[2][2] === 2 && seq[3][1] === 'true' && seq[3][2] === 2)
} finally { await L.close(w) }
