/* S03 — a downchit Mon–Wed, then an Upchit effective Tuesday; X on blank seats Mon, Tue (flying line and duty desk), Wed */
import * as T from './bta-B-lib.mjs'
const { K, B, C, L, W, ID, CSN, TUE, MON, WED, sleep, R, pic } = T
const t = T.mk('s03')
const { browser, p, errors } = await K.fresh()
try {
  const mon = await T.blankLine(p, MON)
  const tue = await T.blankLine(p, TUE)
  const duty = await T.blankRow(p, 'duty', TUE)
  const wed = await T.blankLine(p, WED)
  const seats = `Mon blank line took ${mon.took}; Tue blank line took ${tue.took}; Tue new duty row (no name, no times) took ${duty.took}; Wed blank line took ${wed.took}`
  const b = { mon: await T.see(p, 'S03-0-mon', { di: MON }), tue: await T.see(p, 'S03-0-tue', { di: TUE }), wed: await T.see(p, 'S03-0-wed', { di: WED }) }
  t.add('S03.0', `fresh world; ${seats}; nothing filed yet`, `Mon ${T.says(b.mon)} || Tue ${T.says(b.tue)} || Wed ${T.says(b.wed)}`, b.mon.held.length + b.tue.held.length + b.wed.held.length === 0 ? 'PASS' : 'FAIL', [...b.tue.pics])

  const f = await T.file(p, { type: 'ATT C', di: MON, toDi: WED, allday: true, remarks: 'Flu' })
  const r1 = await T.rec(p, f.iid)
  const a = { mon: await T.see(p, 'S03-1-mon', { di: MON }), tue: await T.see(p, 'S03-1-tue', { di: TUE }), wed: await T.see(p, 'S03-1-wed', { di: WED }) }
  const okA = a.tue.held.some(x => /DNIF_FLY/.test(x)) && a.tue.held.some(x => /Downchit but tasked — this row/.test(x)) && a.mon.held.some(x => /Downchit but planned to fly/.test(x)) && a.wed.held.some(x => /Downchit but planned to fly/.test(x))
  t.add('S03.1', `Inputs page: ATT C Mon 13 → Wed 15 July filed for ${CSN}, All day, remarks Flu (stored: ${r1}; asked ${f.asked.join(',') || 'nothing'})`, `Mon ${T.says(a.mon)} || Tue ${T.says(a.tue)} || Wed ${T.says(a.wed)}`, okA ? 'PASS' : 'FAIL', [...a.tue.pics, ...a.mon.pics])

  const u = await T.file(p, { type: 'Upchit', di: TUE, allday: true, remarks: 'Fit again' })
  const r2 = await T.rec(p, u.iid)
  const all = await T.recAll(p)
  const c = { mon: await T.see(p, 'S03-2-mon', { di: MON }), tue: await T.see(p, 'S03-2-tue', { di: TUE }), wed: await T.see(p, 'S03-2-wed', { di: WED }) }
  const tueClean = c.tue.held.length === 0 && c.tue.lines.length === 0 && !c.tue.ring
  const monDown = c.mon.held.some(x => /Downchit but planned to fly/.test(x))
  t.add('S03.2', `Inputs page: an Upchit filed for ${CSN} effective Tuesday 14 July (stored: ${r2}; asked ${u.asked.join(',') || 'nothing'}; the Upchit sheet read "${u.upSheet}"; all his inputs now: ${JSON.stringify(all)})`,
    `Mon ${T.says(c.mon)} || Tue ${T.says(c.tue)} || Wed ${T.says(c.wed)}`, tueClean && monDown ? 'PASS' : 'FAIL', [u.upPic, ...c.tue.pics, ...c.mon.pics, ...c.wed.pics])
  t.add('S03.2a', 'Upchit: any "Upchit clashes" / "Upchit but tasked" line anywhere in the three days', JSON.stringify([...c.mon.held, ...c.tue.held, ...c.wed.held].filter(x => /Upchit/i.test(x))) || 'none', [...c.mon.held, ...c.tue.held, ...c.wed.held].some(x => /Upchit/i.test(x)) ? 'FAIL' : 'PASS')

  await B.reloadAs(p, 'a'); await B.toEdit(p)
  const d = { mon: await T.see(p, 'S03-3-mon', { di: MON }), tue: await T.see(p, 'S03-3-tue', { di: TUE }), wed: await T.see(p, 'S03-3-wed', { di: WED }) }
  t.add('S03.3', 'the page reloaded and signed in again', `Mon ${T.says(d.mon)} || Tue ${T.says(d.tue)} || Wed ${T.says(d.wed)}`,
    d.tue.held.length === 0 && d.mon.held.some(x => /Downchit but planned to fly/.test(x)) ? 'PASS' : 'FAIL', [...d.tue.pics])
} catch (e) { R('S03', 'script', String(e.stack || e).slice(0, 700), 'FAIL', [await pic(p, 'S03-X')]) }
R('S03.err', 'browser errors', errors.join(' | ') || 'none', errors.length ? 'FAIL' : 'PASS')
await browser.close()
T.done('bta-B-s03')
