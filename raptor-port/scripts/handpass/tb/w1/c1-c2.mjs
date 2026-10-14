import * as F from './fx.mjs'
const { L } = F
console.log('w1 c1-c2 v1')
const w = await L.world('phone')
const p = w.page
const ok = (id, expected, saw, pass) => L.row('W1', id, expected, typeof saw === 'string' ? saw : JSON.stringify(saw), pass ? 'PASS' : 'FAIL')
try {
  const f = await F.fileLeaveFable(w)
  console.log('filed', JSON.stringify(f))
  await F.publishSat(w)
  await F.toWar(w)
  await L.sleep(500)
  const n = await F.readNote(p)
  console.log('NOTE', JSON.stringify(n))
  const r = n.rows && n.rows[0]
  ok('C1', 'one clash, list open; row Fable · Sat 18 Jul · Change the leave on Inputs › ; Weekend/PH work earns FO, but the day holds LL; line "⚠ 1 clash with the schedule" + Hide', { line: n.line, expanded: n.expanded, rows: n.rows && n.rows.map(x => [x.who, x.day, x.go, x.what]) },
    !!r && n.rows.length === 1 && n.expanded === 'true' && r.who === 'Fable' && r.day === 'Sat 18 Jul' && r.go === 'Change the leave on Inputs ›' && /^Weekend\/PH work earns \*?FO\*?, but the day holds LL$/.test(r.what) && n.line === '⚠ 1 clash with the schedule Hide')
  await L.pic(w, 'c1-phone-one-clash-open')
  // C2: tap the row
  await w.press('[data-testid="clash-row-0"]'); await L.sleep(800)
  const d = await F.dialogNow(p)
  const lwDlg = await p.evaluate(() => [...document.querySelectorAll('#page-leavewar [role="dialog"]')].filter(e => e.getBoundingClientRect().width > 0).length)
  const win = await p.evaluate(() => { const s = document.querySelector('[data-testid="win-inputedit"]'); if (!s) return null; const ps = s.querySelector('#inpEditPerson'), ts = s.querySelector('#inpEditType'); return { person: ps && ps.options[ps.selectedIndex].text, type: ts && ts.value } })
  console.log('window', JSON.stringify(win))
  const sd = !!win && win.person === 'Fable' && win.type === 'LL'
  console.log('C2 dialogs', JSON.stringify(d), 'lwDialogs', lwDlg)
  ok('C2', 'now on Inputs page, that leave\'s own window open (names Fable and LL), nothing else opened on the Leave War', { page: d.page, window: win, dialogs: d.dialogs.map(x => [x.tid, x.parent, x.head]), leaveWarDialogs: lwDlg }, d.page === 'inputs' && !!sd && lwDlg === 0)
  await L.pic(w, 'c2-phone-tap-opens-leave-window')
} finally { await L.close(w) }
