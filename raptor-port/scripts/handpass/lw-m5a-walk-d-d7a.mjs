// Walker D, script d7a: designer's money scenarios on the seed (desktop, admin, 25 Jan 2026): 38, 6, 10, 9, 7+8, 12.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/d'
process.env.LW_TODAY ||= '2026-01-25'
const D = await import('./lw-m5a-walk-d-lib.mjs')
const { L, note, eq } = D
const { T, press, vis, txt, shot } = L
console.log('[lw-m5a-walk-d-d7a v1]')
const w = await L.newCtx('desk')
const P = w.page
const exp = (label, got, want) => ({ label, got, want, ok: eq(got, want) })
function judge(id, checks, pics, extra = '') {
  const bad = checks.filter(c => !c.ok)
  note(id, 'desk', bad.length ? 'FAIL' : 'PASS', checks.map(c => `${c.label} ${c.got}${c.ok ? '' : ' (expected ' + c.want + ')'}`).join('; ') + (extra ? ' · ' + extra : ''), pics)
}
const std = (s, app, cf, pend, war) => [exp('App bal', s.row.app, app), exp('incl.', s.row.cf, cf), exp('Pending', s.row.pend, pend), exp('War bal', s.row.war, war), exp('window App', s.win.app, app), exp('window war', s.win.war, war), exp('grid figure', s.grid.split(' ')[0], war)]
const undoNote = async () => { await L.undo(w); return (await D.notes(P)).join(' | ') }
const redoNote = async () => { await L.redo(w); return (await D.notes(P)).join(' | ') }
const eventPH = async iso => {
  await L.openGrid(w); await press(w, T('month-JAN')); await P.waitForTimeout(900)
  await press(w, T('event-0-' + iso)); await P.waitForTimeout(700)
  await press(w, T('event-quick-0')); await P.waitForTimeout(300)
  await press(w, T('event-apply')); await P.waitForTimeout(900)
}
try {
  await L.signIn(w, 'admin')
  const FROM = Number(process.env.FROM || 0); let r, s
  if (FROM < 7) {
  // ---------- 38 the grid's two lines follow the View period
  await L.openGrid(w)
  const g26 = await D.gridFig(P, 'bane')
  await P.selectOption(T('war-picker'), { label: 'JAN - DEC 27' }); await P.waitForTimeout(900)
  const g27 = await D.gridFig(P, 'bane')
  await shot(w, 'd7a-38-view27')
  await P.selectOption(T('war-picker'), { label: 'JAN - DEC 26' }); await P.waitForTimeout(900)
  judge('38 the grid\'s two lines beside Ranger follow the View period (JAN-DEC 26 → 27 → 26)', [exp('first line (War bal) in View 26', g26.split(' ')[0], '12.5'), exp('first line in View 27', g27.split(' ')[0], '12.5'), exp('second line in View 26', g26.split(' ')[1], '7.5'), exp('second line in View 27 (no LL/OL in 2027)', g27.split(' ')[1] ?? '(none drawn)', '(none drawn)')], ['d7a-38-view27'], `read "${g26}" then "${g27}"`)
  // ---------- 6 correcting only "incl." writes the whole row afresh
  await D.openBalances(w)
  await D.typeInBox(w, T('bal-cf-bane'), 3)
  r = await D.balRow(P, 'bane'); await shot(w, 'd7a-6-incl3')
  const e1 = [exp('after incl. 3: App bal (never 17)', r.app, '15'), exp('incl.', r.cf, '3')]
  await D.typeInBox(w, T('bal-LVE-bane'), 16)
  r = await D.balRow(P, 'bane'); await shot(w, 'd7a-6-app16')
  const e2 = [exp('then App bal 16: App bal', r.app, '16'), exp('incl. stays', r.cf, '3')]
  const n1 = await undoNote(); const a1 = await D.balRow(P, 'bane')
  const n2 = await undoNote(); const a2 = await D.balRow(P, 'bane'); await shot(w, 'd7a-6-undone-twice')
  judge('6 correcting only "incl." then only App bal (row-1 state 15 incl 2)', [...e1, ...e2, exp('Undo once → App', a1.app, '15'), exp('Undo once → incl.', a1.cf, '3'), exp('Undo twice → App', a2.app, '15'), exp('Undo twice → incl.', a2.cf, '2')], ['d7a-6-incl3', 'd7a-6-app16', 'd7a-6-undone-twice'], `Undo notes: "${n1}" then "${n2}"`)
  // ---------- 10 a holiday added after typing: (a) the day in the snapshot, (b) the day approved after typing
  await eventPH('2026-01-20')
  s = await D.surfaces(w, 'bane', 'd7a-10a')
  judge('10a PH added on Tue 20 Jan (inside 19–21 Jan, which stood in the snapshot): App bal unchanged', std(s, '15', '2', '−2.5', '12.5'), ['d7a-10a-bal-win'])
  await eventPH('2026-01-27')
  s = await D.surfaces(w, 'bane', 'd7a-10b')
  judge('10b PH added on Tue 27 Jan (inside 26–27 Jan, approved after typing): App bal +1 at once, no reload', std(s, '16', '3', '−2.5', '13.5'), ['d7a-10b-bal-win', 'd7a-10b-grid'], 'lines ' + s.win.lines.map(l => l.id + ' ' + l.text).join(' / '))
  // ---------- 9 kind changed LL → CCL on an approved leave by the admin (D1460)
  await L.openGrid(w); await press(w, T('month-JAN')); await P.waitForTimeout(900)
  await L.openCell(w, 'bane', '2026-01-26')
  const beforeKind = await txt(P, T('bid-actions'))
  await press(w, T('bid-CCL')); await P.waitForTimeout(800)
  const still = await vis(P, T('bid-picker'))
  await shot(w, 'd7a-9-kind-changed')
  if (still) await L.closeWin(w)
  s = await D.surfaces(w, 'bane', 'd7a-9')
  console.log('kind changed:', still, D.brief(s), s.win.other.CCL, s.win.lines.map(l => l.text).join(' / '))
  judge('9 an approved LL (Mon 26 – Tue 27 Jan, 27th a holiday) turned into CCL by the admin: LVE gives the day back, CCL takes it', [exp('LVE App bal (netting to typed 17)', s.row.app, '17'), exp('incl.', s.row.cf, '4'), exp('CCL tile', s.win.other.CCL.split(' ')[0], '2')], ['d7a-9-kind-changed', 'd7a-9-bal-win'], `actions before "${beforeKind}"; CCL tile "${s.win.other.CCL}"; lines ${s.win.lines.map(l => l.text).join(' / ')}`)
  }
  // ---------- 7 + 8: re-type 20 incl 3; an AM LL on Fri 23 Jan (a half, past); AM LL + PM CCL on Wed 4 Feb
  await D.openBalances(w)
  await D.typeInBox(w, T('bal-LVE-bane'), 20); await D.typeInBox(w, T('bal-cf-bane'), 3)
  r = await D.balRow(P, 'bane'); console.log('retyped 20/3 ->', r.app, r.cf, r.war)
  const okAM = await D.placeBid(w, 'bane', '2026-01-23', 'LL', 'am', { approve: true })
  s = await D.surfaces(w, 'bane', 'd7a-7')
  console.log('half placed', okAM, D.brief(s))
  await D.openBalances(w); const taken = await txt(P, T('bal-view-taken')) // no-op read
  await press(w, T('bal-view-taken')); await P.waitForTimeout(600)
  const ll = await txt(P, T('bal-taken-LL-bane')); await shot(w, 'd7a-7-taken'); await press(w, T('bal-view-bal')); await P.waitForTimeout(500)
  const ml = await D.myLeaveAsMember(w)
  judge('7 a half day everywhere: 20 incl 3 typed, an AM LL on Fri 23 Jan approved (19.5 incl 2.5)', [...std(s, '19.5', '2.5', '−2.5', '17'), exp('Days taken LL (3 + 0.5)', ll, '3.5')], ['d7a-7-bal-win', 'd7a-7-grid', 'd7a-7-taken'], `My leave (Ranger signed in): "${ml}"; Approvals lines ${s.appr.map(t => t.replace(/^\S+ \S+ /, '')).join(' // ')}`)
  const okA = await D.placeBid(w, 'bane', '2026-02-04', 'LL', 'am', { approve: true })
  const okB = await D.placeBid(w, 'bane', '2026-02-04', 'CCL', 'pm', { approve: true })
  s = await D.surfaces(w, 'bane', 'd7a-8')
  console.log('two kinds on one day', okA, okB, D.brief(s), s.win.other.CCL)
  judge('8 AM LL and PM CCL approved on one Wed (4 Feb)', [exp('LVE App bal 19.5 − 0.5', s.row.app, '19'), exp('LVE incl.', s.row.cf, '2'), exp('CCL tile App bal after (3 − 0.5, pending −1 war 1.5)', s.win.other.CCL.split(' ')[0], '2.5')], ['d7a-8-bal-win'], `CCL tile "${s.win.other.CCL}"`)
  // ---------- 12 Approve all, and its Undo
  const ids = ['bane', 'wolf', 'bruise', 'slash', 'slipway']
  await D.openBalances(w)
  const before = {}; for (const id of ids) before[id] = await D.balRow(P, id)
  await D.openAppr(w)
  const nLines = (await L.apprLines(P)).length
  await shot(w, 'd7a-12-before')
  await press(w, T('appr-approve-all')); await P.waitForTimeout(700); await shot(w, 'd7a-12-armed')
  const armedWords = await txt(P, T('appr-approve-all'))
  await press(w, T('appr-approve-all')); await P.waitForTimeout(1000)
  const linesAfter = await L.apprLines(P); await shot(w, 'd7a-12-after')
  await D.openBalances(w)
  const after = {}; for (const id of ids) after[id] = await D.balRow(P, id)
  await shot(w, 'd7a-12-balances')
  const sc0 = await D.where(P)
  const un = await undoNote()
  const back = {}; for (const id of ids) back[id] = await D.balRow(P, id)
  const sc1 = await D.where(P); await shot(w, 'd7a-12-undone')
  const rows = ids.map(id => `${id}: App ${before[id].app} pend ${before[id].pend} war ${before[id].war} → App ${after[id].app} pend ${after[id].pend} war ${after[id].war} → Undo App ${back[id].app} pend ${back[id].pend} war ${back[id].war}`)
  console.log(rows.join('\n'))
  const warKept = ids.every(id => eq(before[id].war, after[id].war))
  const appFell = ids.filter(id => before[id].pend !== '–').every(id => parseFloat(after[id].app.replace('−', '-')) < parseFloat(before[id].app.replace('−', '-')))
  const undoneAll = ids.every(id => eq(before[id].app, back[id].app) && eq(before[id].pend, back[id].pend))
  note('12 Approve all, then one Undo (the Undo from the Balances page)', 'desk', warKept && appFell && undoneAll && JSON.stringify(sc0) === JSON.stringify(sc1) ? 'PASS' : 'FAIL', `${nLines} lines pending; button armed reading "${armedWords}"; War bal kept for all five: ${warKept}; App bal fell for each man who had pending: ${appFell}; one Undo ("${un}") put all back: ${undoneAll}; scroll before/after Undo ${JSON.stringify(sc0)} / ${JSON.stringify(sc1)}; ${rows.join(' || ')}`, ['d7a-12-before', 'd7a-12-after', 'd7a-12-balances', 'd7a-12-undone'])
} catch (e) { note('ERROR', 'desk', 'FAIL', String(e).slice(0, 500)); await shot(w, 'd7a-error').catch(() => {}) }
note('errors (console, page, 4xx)', 'desk', w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 800) : 'none')
D.dumpResults('d7a')
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
