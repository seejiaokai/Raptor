/* [DB-READINESS] phase 7 — WALKER A, part 3: A7–A13. A Personal row carrying a placeholder (ALL AVAIL) AND a named
   extra (Anvil): edit the request's times; retype Personal → Training and back; Training → Personal; move it to another
   day and back (D468); take it off; delete it; hand it to another member. After each: the chip and the window, Undo,
   Redo, a reload. Each scenario in its own fresh world.   Usage: node p7-a-walk3.mjs [A7 A8 …] */
import { boot, world, fileTimed, oilButton, handOver, dropLanded } from './p6-lib.mjs'
import * as S from './seat-lib.mjs'
import * as A from './p7-a-lib.mjs'
const { L, W } = await boot()
const W2 = await import('./dbrA-W2-lib.mjs')
const only = process.argv.slice(2)
const allErrors = []
const want = id => !only.length || only.includes(id)

/* everything a person can read about the request's row and crowd on day di (and where else it stands) */
async function look(p, tag, iid, di, { pics = true } = {}) {
  const o = { di, day: null }
  const where = await p.evaluate(i => window.DAYS.map((d, k) => (d.ground || []).some(r => r.src === i) ? k : -1).filter(k => k >= 0), iid)
  o.rowsOn = where
  const req = await A.reqOf(p, iid)
  o.req = req ? `${req.type} ${req.date} ${req.allday ? 'all day' : req.s + '-' + req.e} ${req.person} acc=${req.acc}` : '(deleted)'
  await W.boardOn(p, di)
  const row = await A.rowOf(p, di, iid)
  o.row = row ? `who=${row.who} more=${JSON.stringify(row.more || [])} ${row.str}-${row.end}${row.cx ? ' CX' : ''}${row.info ? ' INFO' : ''}${row.kept ? ' KEPT' : ''}` : '(no row)'
  if (row) await A.showRow(p, di, iid)
  const ch = await A.chips(p, '#schedBoard', iid)
  o.chip = ch.map(c => `${c.txt} "${c.title}"`).join(' / ') || '(no chip)'
  o.n = ch[0] ? ch[0].txt : null
  if (pics) await A.pic(L, p, `${tag}-board`)
  if (ch.length) {
    const w = await A.openChip(p, '#schedBoard', iid)
    o.win = w.open ? `"${w.title}" ${w.tabs.length ? w.tabs.join(' | ') : w.one} · "${w.from}"` : 'DID NOT OPEN'
    o.ids = w.open ? w.ids.slice().sort().join(',') : ''
    o.listed = w.n
    if (pics) await A.pic(L, p, `${tag}-window`)
    await A.closeWin(p)
  } else { o.win = '(none)'; o.ids = ''; o.listed = 0 }
  /* OIL Earn (weekend): the earn half */
  if (di >= 5 && row) {
    await oilButton(L, p); await A.showRow(p, di, iid)
    const br = await A.boardRow(p, di, iid)
    o.item = br.item ? `[${br.item.cls}] "${br.item.title}"` : br.err
    o.rowPucks = (br.pucks || []).map(x => `${x.cs}: ${x.earn ? `[${x.earn.cls.replace('seat oilpk', '').trim()}] "${x.earn.title}"` : '—'}`).join(' ; ')
    const chm = await A.chips(p, '#schedBoard', iid)
    o.chipMode = chm.map(c => `${c.txt} "${c.title}"`).join(' / ') || '(no chip)'
    if (chm.length) {
      let w = await A.openChip(p, '#schedBoard', iid)
      const et = w.tabs.findIndex(t => /earns OIL/.test(t))
      if (et >= 0 && !/\[on\]/.test(w.tabs[et])) { await A.winTab(p, et); w = await A.win(p) }
      o.earnTab = w.tabs[et] || '(no earn tab)'
      o.earnMen = `${w.men.filter(m => m.inert).length} inert, ${w.men.filter(m => m.on).length} on, of ${w.n}; e.g. "${w.men[0] ? w.men[0].seatTitle : ''}"`
      o.earnFoot = w.foot
      if (pics) await A.pic(L, p, `${tag}-earn-half`)
      await A.closeWin(p)
    }
    o.oild = await p.evaluate(d => JSON.stringify(window.DAYS[d].oild || null), di)
    await oilButton(L, p)
  }
  await W.boardOff(p); await W.toEdit(L, p); await A.showWeekChip(p, '#eWeek', di, iid)
  const wk = await A.chips(p, `#eWeek .day[data-day="${di}"]`, iid)
  o.week = wk.map(c => c.txt).join('/') || '(no chip)'
  if (pics) await A.pic(L, p, `${tag}-editweek`)
  A.said(`${tag}: day ${di} row ${o.row}; board chip ${o.chip}; window ${o.win} lists ${o.listed}; edit week chip ${o.week}${o.item ? `; OIL Earn item ${o.item}; pucks ${o.rowPucks}; chip ${o.chipMode}; ${o.earnTab || ''} ${o.earnMen || ''}` : ''}`)
  A.data(`${tag}: request ${o.req}; rows on days [${where}]${o.oild !== undefined ? '; OIL decisions ' + o.oild : ''}`)
  return o
}
const sig = o => JSON.stringify([o.rowsOn, o.req, o.row, o.chip, o.ids, o.week, o.item || '', o.rowPucks || '', o.earnTab || '', o.earnMen || ''])
const undo = async (p, tag) => { await W.toEdit(L, p); const u = await W.door(p, 'top', 'undo'); A.said(`${tag}: Undo (top bar "${u.title}") → ${u.pressed ? JSON.stringify(u.toasts) : 'NOT PRESSED ' + JSON.stringify(u)}`); return u }
const redo = async (p, tag) => { await W.toEdit(L, p); const u = await W.door(p, 'top', 'redo'); A.said(`${tag}: Redo (top bar "${u.title}") → ${u.pressed ? JSON.stringify(u.toasts) : 'NOT PRESSED ' + JSON.stringify(u)}`); return u }
async function reload(p, tag) {
  const n0 = L.results.length
  await L.reloadCompare(p, tag, 'a', { page: 'editsched' }); await W.toastSpy(p)
  A.ok(`${tag}: a reload gives back what was there and writes nothing`, L.results.slice(n0).every(r => r.ok), L.results.slice(n0).filter(r => !r.ok))
}
/* the fixture: a timed request for Ranger on day di, ALL AVAIL and Anvil in its extras */
async function setup(p, di, { type = 'Personal', from = '10:00', to = '11:00', remarks }) {
  const iid = await fileTimed(L, p, { person: A.RANGER, type, iso: A.ISO[di], from, to, remarks })
  const req = await A.reqOf(p, iid)
  A.ok(`the ${type} request landed on the Ground Programme`, !!req && req.acc === 'g', req)
  await W.boardOn(p, di)
  const ri = await A.rowIdx(p, di, iid)
  const a = await A.place(S, p, di, ri, 'extras', 'allavail'); A.ok('ALL AVAIL placed in the extras', a.took, a)
  const b = await A.place(S, p, di, ri, 'extras', 'shaft'); A.ok('Anvil (named) placed in the extras', b.took, b)
  return iid
}
/* the standard tail: Undo → as before; Redo → as after; reload → as after */
async function tail(p, id, iid, di0, di1, s0, s1, { undoDay = di0 } = {}) {
  await undo(p, id)
  const s2 = await look(p, `${id}-3-undone`, iid, undoDay)
  A.ok(`${id}: Undo puts back exactly what was there (row, chip, crowd, earn half)`, sig(s2) === sig(s0), { before: JSON.parse(sig(s0)).slice(0, 4), undone: JSON.parse(sig(s2)).slice(0, 4) })
  await redo(p, id)
  const s3 = await look(p, `${id}-4-redone`, iid, di1)
  A.ok(`${id}: Redo gives the changed state again`, sig(s3) === sig(s1), { after: JSON.parse(sig(s1)).slice(0, 4), redone: JSON.parse(sig(s3)).slice(0, 4) })
  await reload(p, id)
  const s4 = await look(p, `${id}-5-reloaded`, iid, di1, { pics: false })
  await A.pic(L, p, `${id}-5-reloaded-editweek`)
  A.ok(`${id}: after the reload, the same`, sig(s4) === sig(s3), { redone: JSON.parse(sig(s3)).slice(0, 4), reloaded: JSON.parse(sig(s4)).slice(0, 4) })
}
async function run(id, did, fn) {
  if (!want(id)) return
  const { browser, p, errors } = await world(L)
  await W.toastSpy(p)
  A.scen(id, did)
  try { await fn(p) } catch (e) { A.ok('the scenario ran', false, String(e && e.stack || e).slice(0, 700)); await A.pic(L, p, `${id}-X-error`).catch(() => {}) }
  A.ok('no console error, page error or 4xx', errors.length === 0, errors.slice(0, 5))
  allErrors.push(...errors.map(e => id + ': ' + e))
  await browser.close()
}

/* A7 — the request's times edited (Tuesday: the crowd differs by the hour on a flying day) */
await run('A7', 'Personal (Ranger, Tue 14 Jul 10:00–11:00) with ALL AVAIL + Anvil in the extras; on the Inputs page its ✎ editor: times → 14:00–15:30, Save; Undo; Redo; reload', async p => {
  const di = A.TUE
  const iid = await setup(p, di, { remarks: 'P7 A7' })
  const s0 = await look(p, 'A7-1-before', iid, di)
  const e = await A.editReq(L, W2, p, iid, { stime: '14:00', etime: '15:30' })
  A.said('editor: ' + JSON.stringify(e) + '; toasts ' + JSON.stringify(await W.toasts(p)))
  const s1 = await look(p, 'A7-2-after', iid, di)
  A.ok('the row and the window now read 14:00–15:30', /14:00-15:30/.test(s1.row) && /14:00–15:30/.test(s1.win), { row: s1.row, win: s1.win })
  A.ok('the placeholder and the named extra stay on the row', /allavail/.test(s1.row) && /shaft/.test(s1.row), s1.row)
  A.ok('the chip still shows, and its number is the window\'s list', !!s1.n && String(s1.listed) === s1.n, { chip: s1.n, listed: s1.listed })
  A.said(`the crowd before ${s0.n} (10:00–11:00) and after ${s1.n} (14:00–15:30); same men: ${s0.ids === s1.ids}`)
  A.ok('the crowd was worked out again for the new window (a different list on this flying day)', s0.ids !== s1.ids, { before: s0.n, after: s1.n })
  await tail(p, 'A7', iid, di, di, s0, s1)
})

/* A8 — Personal → Training (Saturday), then back by the editor */
await run('A8', 'Personal (Ranger, Sat 18 Jul 10:00–11:00) with ALL AVAIL + Anvil; ✎ editor: type → Training (the OIL question answered Yes); Undo; Redo; reload; then ✎ type → Personal again', async p => {
  const di = A.SAT
  const iid = await setup(p, di, { remarks: 'P7 A8' })
  const s0 = await look(p, 'A8-1-before', iid, di)
  A.ok('as Personal: 0 earn, every man inert', /0 of/.test(s0.earnTab || '') && /^(\d+) inert, 0 on, of \1;/.test(s0.earnMen || ''), { tab: s0.earnTab, men: s0.earnMen })
  const e = await A.editReq(L, W2, p, iid, { type: 'Training' }, { oil: 'Yes' })
  A.said('editor (type → Training): ' + JSON.stringify(e) + '; toasts ' + JSON.stringify(await W.toasts(p)))
  const s1 = await look(p, 'A8-2-training', iid, di)
  A.ok('as Training the row is still there with both extras', /allavail/.test(s1.row) && /shaft/.test(s1.row), s1.row)
  A.ok('as Training the crowd earns by default (the earn half is no longer 0, men switched on)', !!s1.earnTab && !/ 0 of/.test(s1.earnTab) && / [1-9]\d* on/.test(s1.earnMen || ''), { tab: s1.earnTab, men: s1.earnMen })
  A.ok('as Training the same men are listed', s1.ids === s0.ids, { personal: s0.listed, training: s1.listed })
  await tail(p, 'A8', iid, di, di, s0, s1)
  /* and back, by the editor */
  const e2 = await A.editReq(L, W2, p, iid, { type: 'Personal' })
  A.said('editor (type → Personal again): ' + JSON.stringify(e2) + '; toasts ' + JSON.stringify(await W.toasts(p)))
  const s5 = await look(p, 'A8-6-personal-again', iid, di)
  A.ok('back to Personal: the chip still shows, 0 earn, every man inert, nothing left earning', sig(s5) === sig(s0), { now: [s5.chip, s5.earnTab, s5.earnMen, s5.rowPucks], first: [s0.chip, s0.earnTab, s0.earnMen, s0.rowPucks] })
})

/* A9 — Training first (a man tapped off in its earn half), then → Personal */
await run('A9', 'Training (Ranger, Sat 18 Jul 10:00–11:00, the OIL question Yes) with ALL AVAIL + Anvil; OIL Earn: one crowd man tapped off; ✎ type → Personal; Undo; Redo; reload', async p => {
  const di = A.SAT
  const iid = await setup(p, di, { type: 'Training', remarks: 'P7 A9' })
  await W.boardOn(p, di); await oilButton(L, p); await A.showRow(p, di, iid)
  let w = await A.openChip(p, '#schedBoard', iid)
  const et = w.tabs.findIndex(t => /earns OIL/.test(t)); if (et >= 0 && !/\[on\]/.test(w.tabs[et])) { await A.winTab(p, et); w = await A.win(p) }
  A.said(`Training, earn half before the tap: ${w.tabs[et]}; first man "${w.men[0] && w.men[0].seatTitle}" [${w.men[0] && w.men[0].seatCls}]`)
  const first = p.locator('.availwin:not([hidden]) [data-awp] .puck').first()
  await first.click(); await L.sleep(500)
  const w2 = await A.win(p)
  A.said(`after tapping ${w.men[0].cs}: ${w2.tabs[et]}; his title now "${w2.men[0].seatTitle}" [${w2.men[0].seatCls}]; toasts ${JSON.stringify(await W.toasts(p))}`)
  A.data('the day\'s OIL decisions after the tap: ' + await p.evaluate(d => JSON.stringify(window.DAYS[d].oild || null), di))
  await A.pic(L, p, 'A9-0-training-one-off')
  await A.closeWin(p); await oilButton(L, p)
  const s0 = await look(p, 'A9-1-training', iid, di)
  A.ok('as Training the crowd earns, one man off', !!s0.earnTab && !/ 0 of/.test(s0.earnTab), { tab: s0.earnTab, men: s0.earnMen })
  const e = await A.editReq(L, W2, p, iid, { type: 'Personal' })
  A.said('editor (type → Personal): ' + JSON.stringify(e) + '; toasts ' + JSON.stringify(await W.toasts(p)))
  const s1 = await look(p, 'A9-2-personal', iid, di)
  A.ok('as Personal: the chip stays, the same men listed', !!s1.n && s1.ids === s0.ids, { training: s0.listed, personal: s1.listed })
  A.ok('as Personal: 0 earn, every man inert — nobody goes on earning from the old Training answer', /0 of/.test(s1.earnTab || '') && /^(\d+) inert, 0 on, of \1;/.test(s1.earnMen || ''), { tab: s1.earnTab, men: s1.earnMen, pucks: s1.rowPucks })
  A.ok('as Personal: the requester\'s and the named extra\'s pucks earn nothing', !/\[on\]|earns OIL — tap/.test(s1.rowPucks || ''), s1.rowPucks)
  await tail(p, 'A9', iid, di, di, s0, s1)
})

/* A10 — moved to another day and back (D468) */
await run('A10', 'Personal (Ranger, Sat 18 Jul 10:00–11:00) with ALL AVAIL + Anvil; ✎ editor: date → Sun 19 Jul; Undo; Redo; reload; then ✎ date → Sat 18 Jul again', async p => {
  const iid = await setup(p, A.SAT, { remarks: 'P7 A10' })
  const s0 = await look(p, 'A10-1-before', iid, A.SAT)
  A.said('editor (date → Sun 19 Jul): ' + await W2.redate(p, iid, A.ISO[A.SUN], A.ISO[A.SUN]) + '; toasts ' + JSON.stringify(await W.toasts(p)))
  const s1 = await look(p, 'A10-2-on-sunday', iid, A.SUN)
  A.ok('the request arrives on Sunday as its member filed it: Ranger alone, no placeholder, no named extra, no chip', /who=bane more=\[\]/.test(s1.row) && s1.chip === '(no chip)' && s1.week === '(no chip)', { row: s1.row, chip: s1.chip })
  const sat = await look(p, 'A10-2b-saturday-after-move', iid, A.SAT)
  A.ok('Saturday carries no chip for the request once it has moved away', sat.chip === '(no chip)' && sat.week === '(no chip)', { row: sat.row, chip: sat.chip, week: sat.week })
  A.data('Saturday\'s ground rows after the move: ' + await p.evaluate(() => JSON.stringify(window.DAYS[5].ground)))
  await tail(p, 'A10', iid, A.SAT, A.SUN, s0, s1)
  /* back to Saturday through the editor: what the scheduler added returns if Saturday has not been saved since */
  A.said('editor (date → Sat 18 Jul again): ' + await W2.redate(p, iid, A.ISO[A.SAT], A.ISO[A.SAT]) + '; toasts ' + JSON.stringify(await W.toasts(p)))
  const s5 = await look(p, 'A10-6-back-on-saturday', iid, A.SAT)
  A.ok('back on Saturday (not saved in between): the placeholder, the named extra and the chip are back (D468)', /allavail/.test(s5.row) && /shaft/.test(s5.row) && s5.n === s0.n, { row: s5.row, chip: s5.chip })
  const sun = await look(p, 'A10-6b-sunday-after-return', iid, A.SUN, { pics: false })
  A.ok('Sunday no longer carries the request\'s row', sun.row === '(no row)', sun.row)
})

/* A11 — taken off (✕ on its row) */
await run('A11', 'Personal (Ranger, Sat 18 Jul 10:00–11:00) with ALL AVAIL + Anvil; ✕ on its row on the board (taken off); Undo; Redo; reload', async p => {
  const di = A.SAT
  const iid = await setup(p, di, { remarks: 'P7 A11' })
  const s0 = await look(p, 'A11-1-before', iid, di)
  await W.toasts(p)
  A.said('✕ on the row: ' + await dropLanded(L, p, di, iid) + '; the app said ' + JSON.stringify(await W.toasts(p)))
  const s1 = await look(p, 'A11-2-taken-off', iid, di)
  A.ok('taken off: no row, no chip on the board or the edit week, the request reads taken off', s1.row === '(no row)' && s1.chip === '(no chip)' && s1.week === '(no chip)' && /acc=r/.test(s1.req), { row: s1.row, chip: s1.chip, req: s1.req })
  const any = await A.chips(p, `#eWeek .day[data-day="${di}"]`, null)
  A.ok('no orphan chip anywhere on the day', any.length === 0, any)
  await tail(p, 'A11', iid, di, di, s0, s1)
})

/* A12 — deleted on the Inputs page */
await run('A12', 'Personal (Ranger, Sat 18 Jul 10:00–11:00) with ALL AVAIL + Anvil; ✕ on its line on the Inputs page (deleted); Undo; Redo; reload', async p => {
  const di = A.SAT
  const iid = await setup(p, di, { remarks: 'P7 A12' })
  const s0 = await look(p, 'A12-1-before', iid, di)
  await W.toasts(p)
  A.said('✕ on the Inputs line: ' + await W2.delReq(p, iid) + '; the app said ' + JSON.stringify(await W.toasts(p)))
  await A.pic(L, p, 'A12-2-inputs-after-delete')
  const s1 = await look(p, 'A12-2-deleted', iid, di)
  A.ok('deleted: the request is gone, no row, no chip', s1.req === '(deleted)' && s1.row === '(no row)' && s1.chip === '(no chip)' && s1.week === '(no chip)', { req: s1.req, row: s1.row, chip: s1.chip })
  const any = await A.chips(p, `#eWeek .day[data-day="${di}"]`, null)
  A.ok('no orphan chip anywhere on the day', any.length === 0, any)
  await tail(p, 'A12', iid, di, di, s0, s1)
})

/* A13 — handed to another member */
await run('A13', 'Personal (Ranger, Sat 18 Jul 10:00–11:00) with ALL AVAIL + Anvil; ✎ editor: person → Cobra, Save; Undo; Redo; reload', async p => {
  const di = A.SAT
  const iid = await setup(p, di, { remarks: 'P7 A13' })
  const s0 = await look(p, 'A13-1-before', iid, di)
  A.said('editor (person → Cobra): ' + await handOver(L, p, iid, 'taipan') + '; toasts ' + JSON.stringify(await W.toasts(p)))
  const s1 = await look(p, 'A13-2-handed-over', iid, di)
  A.ok('the row is now Cobra\'s; the placeholder and Anvil stay on it', /who=taipan/.test(s1.row) && /allavail/.test(s1.row) && /shaft/.test(s1.row), s1.row)
  A.ok('the chip still shows and matches its window', !!s1.n && String(s1.listed) === s1.n, { chip: s1.chip, listed: s1.listed })
  const ids1 = s1.ids.split(','), ids0 = s0.ids.split(',')
  A.said(`crowd before ${s0.n}, after ${s1.n}; Ranger listed after: ${ids1.includes('bane')}; Cobra listed before / after: ${ids0.includes('taipan')} / ${ids1.includes('taipan')}`)
  A.ok('Cobra (the new holder) leaves the crowd and Ranger (free again) joins it', ids0.includes('taipan') && !ids1.includes('taipan') && !ids0.includes('bane') && ids1.includes('bane'), { cobraBefore: ids0.includes('taipan'), cobraAfter: ids1.includes('taipan'), rangerBefore: ids0.includes('bane'), rangerAfter: ids1.includes('bane') })
  A.ok('still a Personal request: 0 earn, every man inert', /0 of/.test(s1.earnTab || '') && /^(\d+) inert, 0 on, of \1;/.test(s1.earnMen || ''), { tab: s1.earnTab, men: s1.earnMen, pucks: s1.rowPucks })
  await tail(p, 'A13', iid, di, di, s0, s1)
})

A.saveRows(process.env.HP_OUT.replace(/\.json$/, `-walk3${only.length ? '-' + only.join('') : ''}.json`), { errors: allErrors })
