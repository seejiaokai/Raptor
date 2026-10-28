// Walker D, script d8: scenario 11(b) — a leave in a year with no period, then the period created; and a kind change on the Inputs page. Desktop, admin, today 5 Nov 2026.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/d'
process.env.LW_TODAY ||= '2026-11-05'
const D = await import('./lw-m5a-walk-d-lib.mjs')
const { L, note, eq } = D
const { T, press, vis, txt, shot } = L
console.log('[lw-m5a-walk-d-d8 v1]')
const w = await L.newCtx('desk')
const P = w.page
const exp = (label, got, want) => ({ label, got, want, ok: eq(got, want) })
function judge(id, checks, pics, extra = '') {
  const bad = checks.filter(c => !c.ok)
  note(id, 'desk', bad.length ? 'FAIL' : 'PASS', checks.map(c => `${c.label} ${c.got}${c.ok ? '' : ' (expected ' + c.want + ')'}`).join('; ') + (extra ? ' · ' + extra : ''), pics)
}
try {
  await L.signIn(w, 'admin'); await D.openBalances(w)
  await D.typeInBox(w, T('bal-LVE-pike'), 20); await D.typeInBox(w, T('bal-cf-pike'), 0)
  const f = await D.fileInput(w, 'Nomad', 'LL', '2027-12-31', '2028-01-03')
  console.log('filed', JSON.stringify(f))
  await L.openWar(w, 'admin')
  let s = await D.surfaces(w, 'pike', 'd8-11b-before')
  judge('11b typed 20 (Nov 2026); LL Fri 31 Dec 2027 – Mon 3 Jan 2028 filed on the Inputs page with no 2028 period: −2 by the plain rule', [exp('App bal', s.row.app, '18'), exp('window App', s.win.app, '18')], ['d8-11b-before-bal-win'], 'lines ' + s.win.lines.map(l => l.id + ' ' + l.text).join(' / '))
  // create the 2028 period with the picker's "+ New period"
  await L.openGrid(w)
  const opts = await P.locator(T('war-picker')).evaluate(s => [...s.options].map(o => o.value + '=' + o.textContent).join(' | '))
  console.log('picker options', opts)
  await P.selectOption(T('war-picker'), { label: '+ New period' }); await P.waitForTimeout(900)
  await shot(w, 'd8-newperiod')
  await press(w, T('war-day-2028-01-01')); await P.waitForTimeout(300)
  for (let i = 0; i < 12 && !(await P.locator(T('war-day-2028-12-31')).count()); i++) { await press(w, T('war-next')); await P.waitForTimeout(200) }
  await press(w, T('war-day-2028-12-31')); await P.waitForTimeout(300)
  console.log('range', await txt(P, T('war-selection')))
  await shot(w, 'd8-newperiod-range')
  await press(w, T('war-name')); await P.keyboard.type('JAN - DEC 28', { delay: 20 }); await P.waitForTimeout(300)
  await press(w, T('war-create')); await P.waitForTimeout(1200)
  await shot(w, 'd8-after-create'); console.log('options now', await P.locator('select[data-testid="war-picker"]').evaluate(s => [...s.options].map(o => o.textContent).join(' / '))); console.log('sheet still open', await vis(P, T('war-sheet')), 'period now', await P.locator('select[data-testid="war-picker"]').evaluate(s => s.options[s.selectedIndex]?.textContent))
  s = await D.surfaces(w, 'pike', 'd8-11b-created')
  judge('11b the 2028 period created (1 Jan – 31 Dec 28, no holiday yet): nothing that was counted the same way moves', [exp('App bal', s.row.app, '18')], ['d8-11b-created-bal-win'])
  // 3 Jan 2028 a holiday (the Event row's PH preset in the new period)
  await L.openGrid(w); await P.selectOption('select[data-testid="war-picker"]', { label: 'JAN - DEC 28' }); await P.waitForTimeout(900); await press(w, T('month-JAN')); await P.waitForTimeout(1000)
  await press(w, T('event-0-2028-01-03')); await P.waitForTimeout(700)
  await press(w, T('event-quick-0')); await P.waitForTimeout(300)
  await press(w, T('event-apply')); await P.waitForTimeout(900)
  s = await D.surfaces(w, 'pike', 'd8-11b-ph')
  judge('11b 3 Jan 2028 made a public holiday in the new period: the day comes back (+1)', [exp('App bal', s.row.app, '19'), exp('window App', s.win.app, '19')], ['d8-11b-ph-bal-win'], 'lines ' + s.win.lines.map(l => l.id + ' ' + l.text).join(' / '))
} catch (e) { note('ERROR', 'desk', 'FAIL', String(e).slice(0, 500)); await shot(w, 'd8-error').catch(() => {}) }
note('errors (console, page, 4xx)', 'desk', w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 800) : 'none')
D.dumpResults('d8')
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
