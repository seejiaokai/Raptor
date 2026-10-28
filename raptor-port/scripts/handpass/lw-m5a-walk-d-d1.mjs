// Walker D, script d1: rows 1 and 2 of the spec's money table on Ranger (seed), every desktop surface read; approve, refuse, put back.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/d'
process.env.LW_TODAY ||= '2026-01-25'
const D = await import('./lw-m5a-walk-d-lib.mjs')
const { L, note, eq } = D
const { T, press, vis, txt, shot } = L
console.log('[lw-m5a-walk-d-d1 v1]')
const w = await L.newCtx('desk')
const P = w.page
const exp = (label, got, want) => ({ label, got, want, ok: eq(got, want) })
function judge(id, checks, pics, extra = '') {
  const bad = checks.filter(c => !c.ok)
  note(id, 'desk', bad.length ? 'FAIL' : 'PASS', checks.map(c => `${c.label} ${c.got}${c.ok ? '' : ' (expected ' + c.want + ')'}`).join('; ') + (extra ? ' · ' + extra : ''), pics)
}
try {
  await L.signIn(w, 'admin')
  // ---------- row 1 (the seed IS row 1: typed 17 incl 4, LL 26-27 Jan approved after; 2.5 pending)
  let s = await D.surfaces(w, 'bane', 'd1-row1')
  console.log('row1:', D.brief(s))
  const apprLL = s.appr.filter(t => /LL/.test(t)).join(' | ')
  judge('1-row1 Ranger, seed (D1479 row 1)', [
    exp('App bal', s.row.app, '15'), exp('incl.', s.row.cf, '2'), exp('Pending', s.row.pend, '−2.5'), exp('War bal', s.row.war, '12.5'),
    exp('window App', s.win.app, '15'), exp('window pend', s.win.pend, '−2.5'), exp('window war', s.win.war, '12.5'),
    exp('grid figure', s.grid.split(' ')[0], '12.5'),
    exp('Approvals LVE BAL on the 29 Jan line', /Thu 29 Jan, AM.*?(\d+\.?\d*) P/.exec(s.appr.join(' | '))?.[1], '12.5'),
  ], ['d1-row1-bal-win', 'd1-row1-grid'], 'Approvals LL lines: ' + apprLL)
  // the bid window's "left" for LL on a free day
  await L.openCell(w, 'bane', '2026-02-04')
  const leftLL = await txt(P, T('bid-LL-left')), leftCCL = await txt(P, T('bid-CCL-left'))
  await shot(w, 'd1-row1-bidwin')
  await L.closeWin(w)
  note('3 leave buttons "left" on a free weekday (designer expects 11.5 = War bal − 1; D1144 reading)', 'desk', eq(leftLL, '11.5') ? 'PASS' : 'FAIL', `LL left ${leftLL}, CCL left ${leftCCL} (War bal is 12.5, CCL War bal 2)`, ['d1-row1-bidwin'])
  const ml1 = await D.myLeaveAsMember(w)
  note('1-row1 My leave (Ranger signed in)', 'desk', /LVE 12\.5/.test(ml1) && /5 pending/.test(ml1) ? 'PASS' : 'FAIL', `"${ml1}"`)
  // ---------- approve the 12–13 Feb line (2 days): App falls by its days (CF first), Pending falls, War stays
  await D.apprPress(w, 'bane', '12 – Fri 13 Feb', 'approve')
  await shot(w, 'd1-approve-X-appr')
  s = await D.surfaces(w, 'bane', 'd1-X-approved')
  console.log('X approved:', D.brief(s))
  judge('2a approve 12–13 Feb (2 days)', [
    exp('App bal', s.row.app, '13'), exp('incl.', s.row.cf, '0'), exp('Pending', s.row.pend, '−0.5'), exp('War bal', s.row.war, '12.5'),
    exp('window war', s.win.war, '12.5'), exp('grid figure', s.grid.split(' ')[0], '12.5'),
  ], ['d1-X-approved-bal-win', 'd1-X-approved-grid'])
  // refuse it back: a tap on Refuse on the approved line
  console.log(JSON.stringify(await D.cellAct(w, 'bane', '2026-02-12', 'decide-refuse')))
  s = await D.surfaces(w, 'bane', 'd1-X-refused')
  console.log('X refused:', D.brief(s))
  judge('2b refuse it back (approved → refused)', [
    exp('App bal', s.row.app, '15'), exp('incl.', s.row.cf, '2'), exp('Pending', s.row.pend, '−0.5'), exp('War bal', s.row.war, '14.5'),
  ], ['d1-X-refused-bal-win'])
  // put it back to pending: a second tap on the lit Refuse
  console.log(JSON.stringify(await D.cellAct(w, 'bane', '2026-02-12', 'decide-refuse')))
  s = await D.surfaces(w, 'bane', 'd1-X-pending')
  console.log('X put back:', D.brief(s))
  judge('2c put back to a bid (second tap on the lit Refuse)', [
    exp('App bal', s.row.app, '15'), exp('incl.', s.row.cf, '2'), exp('Pending', s.row.pend, '−2.5'), exp('War bal', s.row.war, '12.5'),
  ], ['d1-X-pending-bal-win'])
  // ---------- row 2: both approved
  await D.apprPress(w, 'bane', '12 – Fri 13 Feb', 'approve')
  await D.apprPress(w, 'bane', '29 Jan, AM', 'approve')
  s = await D.surfaces(w, 'bane', 'd1-row2')
  console.log('row2:', D.brief(s))
  judge('1-row2 both approved (D1479 row 2)', [
    exp('App bal', s.row.app, '12.5'), exp('incl.', s.row.cf, '0'), exp('Pending', s.row.pend, '–'), exp('War bal', s.row.war, '12.5'),
    exp('window war', s.win.war, '12.5'), exp('window pend', s.win.pend, null === s.win.pend ? 'null' : s.win.pend), exp('grid figure', s.grid.split(' ')[0], '12.5'),
  ], ['d1-row2-bal-win', 'd1-row2-grid'], `window pend "${s.win.pend}", taken "${s.win.taken}"`)
  const ml2 = await D.myLeaveAsMember(w)
  note('1-row2 My leave (Ranger signed in)', 'desk', /LVE 12\.5/.test(ml2) ? 'PASS' : 'FAIL', `"${ml2}"`)
  // CCL: approve the 2 Mar CCL; the CCL App bal falls by 1, pending gone, war stays
  const before = s.win.other.CCL
  await D.apprPress(w, 'bane', '2 Mar', 'approve')
  s = await D.surfaces(w, 'bane', 'd1-ccl')
  console.log('CCL approved: before', before, 'after', s.win.other.CCL, 'row', s.row.CCL)
  judge('2d approve the CCL line', [exp('CCL tile before', before, '3 pend −1 war 2'), exp('CCL tile after', s.win.other.CCL, '2'), exp('LVE unchanged', s.row.app, '12.5')], ['d1-ccl-bal-win'])
} catch (e) { note('ERROR', 'desk', 'FAIL', String(e).slice(0, 400)); await shot(w, 'd1-error').catch(() => {}) }
note('errors (console, page, 4xx)', 'desk', w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 800) : 'none')
D.dumpResults('d1')
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
