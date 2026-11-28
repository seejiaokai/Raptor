// bell190 walker A — group 5b: a Tue–Thu Training draws its Ground Programme row on Tuesday only (group 5 found no Wed row);
// Ranger dropped on that row's "+ add" — one line, not one a day; Wed and Thu pictured. Edit Schedule, desktop.
import * as L from './bell190-a-lib.mjs'
console.log('bell190-a-g5b v1', L.LIBV)
const R = L.recorder('bell190-a-g5b')
const { ID, J } = L
const c = 'A5-tue-thu-ground-on-tue-week-desk'
const tueThu = async w => { for (const iso of [L.TUE, L.THU]) { await w.page.locator(`#inpEdCal [data-iso="${iso}"]`).first().click(); await L.sleep(250) } }
const w = await L.newWorld('desk')
try {
  await L.signIn(w, 'ad')
  const iid = await L.fileInput(w, L.WED, { type: 'Training', people: [ID.Tally, ID.Hex], from: '09:00', to: '11:00', before: tueThu })
  const p = w.page
  await L.go(p, 'editsched')
  const rows = { tue: await L.rowsOf(p, 1, iid), wed: await L.rowsOf(p, 2, iid), thu: await L.rowsOf(p, 3, iid) }
  const pb = 'a-' + c
  /* Wednesday's Ground Programme, pictured: no Training row there */
  await p.evaluate(() => { const e = [...document.querySelectorAll('#eWeek [data-fill^="g:2."]')].find(x => x.getBoundingClientRect().width > 3 && !x.closest('.peek')); if (e) e.scrollIntoView({ block: 'center', inline: 'center' }) }); await L.sleep(300)
  R(c, 'where the several-day input stands on the Ground Programme', 'RECORD', { rec: await L.rec(p, iid), rows: Object.fromEntries(Object.entries(rows).map(([k, v]) => [k, v.map(r => [r.prog, r.who, r.more])])) }, 'A10 wanted Wednesday; the row is drawn on its first day only', [await L.shot(w, pb + '-1-wed-ground')])
  const place = await L.rowPlace(p, 1, iid, null)
  const n0 = await L.allNotices(p)
  const d = await L.drag(w, '#eRoster .rpuck[data-person="bane"]', `#eWeek ${place.sel}`, pb + '-2')
  await L.sleep(600)
  await L.shot(w, pb + '-3-after')
  const fresh = L.newSince(n0, await L.allNotices(p))
  const j = L.judgeLines(fresh, { bane: 'in', nick: 'add:bane', rocky: 'add:bane', stiff: null }, iid)
  R(c, 'Ranger dropped on its Tuesday row: one line each, not one a day', j.ok ? 'PASS' : 'FAIL', { drag: d.ok ? d.under : d.why, note: await L.toast(p), input: (await L.rec(p, iid)).people, judged: j.out }, 'A10')
  const rr = await L.readAs(w, 'us', pb + '-4-ranger', /Training/)
  const m = (rr.bell.lines || []).filter(l => /Training/.test(l.name))
  R(c, 'Ranger\'s bell on screen', m.length === 1 && /^You were added · Saber$/.test(m[0].what) ? 'PASS' : 'FAIL', { lines: (rr.bell.lines || []).map(l => `${l.name} | ${l.day} | ${l.what}`), tap: rr.tap && { type: rr.tap.type, people: rr.tap.people } }, 'one line, its first day (Tue 14 Jul)', [rr.bell.pic, rr.tap?.pic].filter(Boolean))
} catch (e) { R(c, 'script', 'BLOCKED', String(e.stack || e).slice(0, 400)) }
await L.closeAll()
