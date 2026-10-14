import * as F from './fx.mjs'
const { L } = F
console.log('w1 c3 v1')
const w = await L.world('desk')
const p = w.page
const ok = (id, expected, saw, pass) => L.row('W1', id, expected, typeof saw === 'string' ? saw : JSON.stringify(saw), pass ? 'PASS' : 'FAIL')
try {
  const f = await F.fileLeaveFable(w)
  console.log('filed', JSON.stringify(f))
  await F.publishSat(w)
  await F.toWar(w)
  await p.evaluate(() => window.clearToast && window.clearToast())
  await L.sleep(500)
  const n = await F.readNote(p)
  console.log('NOTE', JSON.stringify(n))
  ok('C3a', 'strip inside the stage line: "Fable · Sat 18 Jul · Weekend/PH work earns FO, but the day holds LL. Change the leave on Inputs ›", no dash', { cls: n.cls, inFilters: n.inFilters, strip: n.strip, line: n.line },
    n.cls === 'syncclash' && n.inFilters && n.line === null && n.strip.length === 1 && /^Fable · Sat 18 Jul · Weekend\/PH work earns \*?FO\*?, but the day holds LL\. Change the leave on Inputs ›$/.test(n.strip[0]) && !/[—–-]/.test(n.strip[0].replace(/Sat 18 Jul/, '')))
  await L.pic(w, 'c3-desk-strip')
  await L.pic(w, 'c3-desk-strip-top', { clip: { x: 0, y: 60, width: 1440, height: 190 } })
  // click the instruction
  const go = p.locator('[data-testid="clash-go-0"]')
  console.log('go count', await go.count())
  await go.click(); await L.sleep(800)
  const d = await F.dialogNow(p)
  const win = await p.evaluate(() => { const s = document.querySelector('[data-testid="win-inputedit"]'); if (!s) return null; const ps = s.querySelector('#inpEditPerson'), ts = s.querySelector('#inpEditType'); return { person: ps && ps.options[ps.selectedIndex].text, type: ts && ts.value } })
  const lwDlg = await p.evaluate(() => [...document.querySelectorAll('#page-leavewar [role="dialog"]')].filter(e => e.getBoundingClientRect().width > 0).length)
  ok('C3b', 'clicking the instruction: on Inputs, that leave window open (Fable, LL), nothing on the Leave War', { page: d.page, window: win, leaveWarDialogs: lwDlg }, d.page === 'inputs' && !!win && win.person === 'Fable' && win.type === 'LL' && lwDlg === 0)
  await L.pic(w, 'c3-desk-click-opens-leave-window')
} finally { await L.close(w) }
