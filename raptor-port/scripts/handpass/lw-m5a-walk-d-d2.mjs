// Walker D, script d2: after both LL lines approved — move, delete (leave in the snapshot), a half day, re-type, an Inputs-page leave. Ranger, seed world, today 25 Jan 2026.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/d'
process.env.LW_TODAY ||= '2026-01-25'
const D = await import('./lw-m5a-walk-d-lib.mjs')
const { L, note, eq } = D
const { T, press, vis, txt, shot } = L
console.log('[lw-m5a-walk-d-d2 v1]')
const w = await L.newCtx('desk')
const P = w.page
const exp = (label, got, want) => ({ label, got, want, ok: eq(got, want) })
function judge(id, checks, pics, extra = '') {
  const bad = checks.filter(c => !c.ok)
  note(id, 'desk', bad.length ? 'FAIL' : 'PASS', checks.map(c => `${c.label} ${c.got}${c.ok ? '' : ' (expected ' + c.want + ')'}`).join('; ') + (extra ? ' · ' + extra : ''), pics)
}
const std = (s, app, cf, pend, war) => [exp('App bal', s.row.app, app), exp('incl.', s.row.cf, cf), exp('Pending', s.row.pend, pend), exp('War bal', s.row.war, war),
  exp('window App', s.win.app, app), exp('window war', s.win.war, war), exp('grid figure', s.grid.split(' ')[0], war)]
try {
  await L.signIn(w, 'admin')
  await D.apprPress(w, 'bane', '12 – Fri 13 Feb', 'approve')
  await D.apprPress(w, 'bane', '29 Jan, AM', 'approve')
  let s = await D.surfaces(w, 'bane', 'd2-start')
  judge('2-start both LL approved (fixture)', std(s, '12.5', '0', '–', '12.5'), ['d2-start-bal-win'])
  // MOVE the approved 12–13 Feb onto Sat 14 – Sun 15 Feb
  await L.openGrid(w); await L.openCell(w, 'bane', '2026-02-12')
  await press(w, T('decide-shift')); await P.waitForTimeout(600)
  await L.reachCell(w, 'bane', '2026-02-14')
  await press(w, T('cell-bane-2026-02-14')); await P.waitForTimeout(900)
  s = await D.surfaces(w, 'bane', 'd2-moved')
  console.log('moved:', D.brief(s))
  judge('2e move approved 12–13 Feb onto Sat 14–Sun 15 (days given back; formula: 14.5 incl 1.5)', std(s, '14.5', '1.5', '–', '14.5'), ['d2-moved-bal-win'], 'lines: ' + s.win.lines.map(l => l.text).join(' / '))
  // DELETE the approved 19–21 Jan leave (it stood in the typed snapshot)
  await shot(w, 'd2-before-delete'); console.log('pw open?', !!(await D.pwRead(P)), 'covering:', await P.evaluate(() => { const e = document.querySelector('[data-testid="lw-tab-grid"]').getBoundingClientRect(); const h = document.elementFromPoint(e.x + e.width / 2, e.y + e.height / 2); return h ? h.tagName + '.' + h.className + '#' + (h.dataset.testid || '') : null }))
  await L.openGrid(w); await press(w, T('month-JAN')); await P.waitForTimeout(1000)
  const r = await D.cellAct(w, 'bane', '2026-01-19', 'bid-clear')
  s = await D.surfaces(w, 'bane', 'd2-deleted')
  console.log('deleted:', JSON.stringify(r), D.brief(s))
  judge('2f delete the approved 19–21 Jan leave that stood in the snapshot (+3; netted against 26–27 Jan and 29 Jan AM, typed incl. 4 unchanged: 17.5 incl 4)', std(s, '17.5', '4', '–', '17.5'), ['d2-deleted-bal-win'], 'taken ' + s.win.taken)
  // A HALF DAY: an AM LL on Mon 9 Feb placed by the admin (Auto-approve on)
  const ok = await D.placeBid(w, 'bane', '2026-02-09', 'LL', 'am', { approve: true })
  s = await D.surfaces(w, 'bane', 'd2-half')
  console.log('half:', ok, D.brief(s))
  judge('2g a half day (AM LL Mon 9 Feb placed approved): −0.5, shown .5', std(s, '17', '4', '–', '17'), ['d2-half-bal-win', 'd2-half-grid'], 'half line ' + (s.win.lines.find(l => l.id === '2026-02-09')?.text))
  // RE-TYPE App bal 20 (box on the Balances page)
  await D.openBalances(w)
  await D.typeInBox(w, T('bal-LVE-bane'), 20)
  await shot(w, 'd2-retype')
  s = await D.surfaces(w, 'bane', 'd2-retyped')
  console.log('retyped:', D.brief(s))
  judge('2h re-type App bal 20 (incl. as shown 4): the count starts afresh', std(s, '20', '4', '–', '20'), ['d2-retyped-bal-win'])
  // AN INPUTS-PAGE LEAVE: OL Wed 15 – Thu 16 Jul (lands approved), 2 days
  const f = await D.fileInput(w, 'Ranger', 'OL', '2026-07-15', '2026-07-16')
  await L.openWar(w, 'admin')
  s = await D.surfaces(w, 'bane', 'd2-inputs')
  console.log('inputs-page leave:', JSON.stringify(f), D.brief(s))
  judge('2i an Inputs-page leave filed (OL 15–16 Jul, lands approved): −2, carried fwd first (18 incl 2)', std(s, '18', '2', '–', '18'), ['d2-inputs-bal-win'], 'lines ' + s.win.lines.map(l => l.id + ' ' + l.text).join(' / '))
} catch (e) { note('ERROR', 'desk', 'FAIL', String(e).slice(0, 400)); await shot(w, 'd2-error').catch(() => {}) }
note('errors (console, page, 4xx)', 'desk', w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 800) : 'none')
D.dumpResults('d2')
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
