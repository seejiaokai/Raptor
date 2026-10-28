// Walker D, script d3: the clock — rows 6, 8, 10, 4, 5 and D1489 on screen. Desktop admin, today starts at 20 Dec 2026.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/d'
process.env.LW_TODAY ||= '2026-12-20'
const D = await import('./lw-m5a-walk-d-lib.mjs')
const { L, note, eq } = D
const { T, press, vis, txt, shot } = L
console.log('[lw-m5a-walk-d-d3 v1]')
const w = await L.newCtx('desk')
const P = w.page
const exp = (label, got, want) => ({ label, got, want, ok: eq(got, want) })
function judge(id, checks, pics, extra = '') {
  const bad = checks.filter(c => !c.ok)
  note(id, 'desk', bad.length ? 'FAIL' : 'PASS', checks.map(c => `${c.label} ${c.got}${c.ok ? '' : ' (expected ' + c.want + ')'}`).join('; ') + (extra ? ' · ' + extra : ''), pics)
}
const std = (s, app, cf, pend, war) => [exp('App bal', s.row.app, app), exp('incl.', s.row.cf, cf), exp('Pending', s.row.pend, pend), exp('War bal', s.row.war, war),
  exp('window App', s.win.app, app), exp('window war', s.win.war, war), exp('grid figure', s.grid.split(' ')[0], war)]
/* a leave across a range, by the bid window's "Pick a range" */
async function placeRange(w, pid, from, to, type, approve) {
  await L.openGrid(w)
  await press(w, T('month-' + ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][Number(from.slice(5, 7)) - 1])); await P.waitForTimeout(1200)
  await L.openCell(w, pid, from)
  if (!(await vis(P, T('bid-picker')))) { console.log('   !! no window'); return false }
  await L.approveWhatIEnter(w, approve)
  await press(w, T('span-range')); await P.waitForTimeout(500)
  const goTo = async iso => {
    for (let i = 0; i < 24 && !(await P.locator(T('span-day-' + iso)).count()); i++) { await press(w, T('span-next')); await P.waitForTimeout(200) }
  }
  await goTo(from); await press(w, T('span-day-' + from)); await P.waitForTimeout(250)
  await goTo(to); await press(w, T('span-day-' + to)); await P.waitForTimeout(300)
  console.log('   range:', await txt(P, T('span-selection')))
  await shot(w, `d3-range-${pid}-${from}`)
  const ok = await L.placeLeave(w, type)
  if (!ok) { console.log('   !! window stayed open'); await L.closeWin(w) }
  return ok
}
const type = async (pid, box, v) => { await D.openBalances(w); await D.typeInBox(w, T(`bal-${box}-${pid}`), v) }
const pidOf = { Saint: 'salsa', Diesel: 'fantom', Casper: 'casper', Vapor: 'vegas', Nomad: 'pike' }
try {
  await L.signIn(w, 'admin')
  await L.openGrid(w)
  console.log('period', await P.locator(T('war-picker')).evaluate(s => s.options[s.selectedIndex]?.textContent), '| options', await P.locator(T('war-picker')).evaluate(s => [...s.options].map(o => o.textContent).join(' | ')))
  // ---- fixtures typed on 20 Dec 2026
  await type('salsa', 'LVE', 23); await type('salsa', 'cf', 3)
  await type('fantom', 'LVE', 10); await type('fantom', 'cf', 4)
  await type('casper', 'LVE', 37); await type('casper', 'cf', 4)
  await type('vegas', 'LVE', -2); await type('vegas', 'cf', 0)
  await type('pike', 'LVE', 30); await type('pike', 'cf', 0)
  for (const [n, pid] of Object.entries(pidOf)) console.log('typed', n, JSON.stringify(await D.balRow(P, pid)))
  await shot(w, 'd3-fixtures-balances')
  // ---- the leaves
  // the war's 2027 period holds no public holiday on 1 Jan in the seed: the spec's row 6 needs one — added by the Event row's PH preset
  await L.openGrid(w); await P.selectOption(T('war-picker'), { label: 'JAN - DEC 27' }); await P.waitForTimeout(900)
  await press(w, T('month-JAN')); await P.waitForTimeout(1000)
  await press(w, T('event-0-2027-01-01')); await P.waitForTimeout(700)
  await press(w, T('event-quick-0')); await P.waitForTimeout(300)
  await press(w, T('event-apply')); await P.waitForTimeout(900)
  await shot(w, 'd3-ph-1jan27')
  console.log('PH on 1 Jan 27 cell reads:', await txt(P, T('event-0-2027-01-01')))
  await P.selectOption(T('war-picker'), { label: 'JAN - DEC 26' }); await P.waitForTimeout(700)
  // probe: can the range picker carry a leave over 31 Dec into the next period? (Gambit)
  const okProbe = await placeRange(w, 'bruise', '2026-12-31', '2027-01-04', 'LL', true)
  const probeLines = (await D.winOf(w, 'bruise')).lines.map(l => l.id + ' ' + l.text).join(' / ')
  note('row6 route: Pick a range from Thu 31 Dec 26 to Mon 4 Jan 27 in the bid window (Gambit)', 'desk', /2027/.test(probeLines) ? 'PASS' : 'FAIL', `selection after picking both ends read as printed above; window placed: ${okProbe}; Gambit's lines after: ${probeLines}`, ['d3-range-bruise-2026-12-31'])
  // row 6 as one leave through the Inputs page (it lands approved, D1166)
  const f6 = await D.fileInput(w, 'Saint', 'LL', '2026-12-31', '2027-01-04')
  console.log('row6 filed on the Inputs page:', JSON.stringify(f6))
  await L.openWar(w, 'admin')
  const ok8 = await placeRange(w, 'fantom', '2026-12-29', '2026-12-30', 'LL', false)
  console.log('placed row8', ok8)
  // ---- 20 Dec reads
  let s = await D.surfaces(w, 'salsa', 'd3-row6-20dec')
  console.log('row6 20 Dec:', D.brief(s))
  judge('row6 20 Dec: 23 incl 3, LL Thu 31 Dec – Mon 4 Jan approved after typing (spec 21 incl 2)', std(s, '21', '2', '–', '21'), ['d3-row6-20dec-bal-win', 'd3-row6-20dec-grid'], 'lines ' + s.win.lines.map(l => l.id + ' ' + l.text).join(' / '))
  s = await D.surfaces(w, 'fantom', 'd3-row8-28dec')
  console.log('row8 20 Dec:', D.brief(s))
  judge('row8 20 Dec: 10 incl 4, LL Tue 29 – Wed 30 Dec pending (spec App 10, Pending −2, War 8)', std(s, '10', '4', '−2', '8'), ['d3-row8-28dec-bal-win', 'd3-row8-28dec-grid'])
  note('row8 Approvals line for Diesel (DAYS 2, LVE BAL 8)', 'desk', /2 days 8 /.test(s.appr.join(' ')) ? 'PASS' : 'FAIL', s.appr.join(' // '))
  // ---- the war's period 27: row 10 (Nomad, Feb 2027)
  await L.openGrid(w)
  await P.selectOption(T('war-picker'), { label: 'JAN - DEC 27' }); await P.waitForTimeout(900)
  const ok10a = await placeRange(w, 'pike', '2027-02-01', '2027-02-12', 'LL', true)
  const ok10b = await placeRange(w, 'pike', '2027-02-13', '2027-02-21', 'LL', false)
  console.log('placed row10', ok10a, ok10b)
  s = await D.surfaces(w, 'pike', 'd3-row10')
  console.log('row10:', D.brief(s))
  judge('row10 (Feb 2027): LL 1–12 Feb approved (10 charged), LL 13–21 Feb pending; run of 21 charges every day (spec App 20, Pending −11, War 9)', std(s, '20', '0', '−11', '9'), ['d3-row10-bal-win', 'd3-row10-grid'], 'Approvals: ' + s.appr.join(' // '))
  note('row10 Approvals DAYS for the bid alone (spec: 5)', 'desk', /Sat 13 – Sun 21 Feb › 5 days/.test(s.appr.join(' ')) ? 'PASS' : 'FAIL', s.appr.join(' // '))
  await L.openCell(w, 'pike', '2027-02-22')
  const l10 = await txt(P, T('bid-LL-left'))
  await shot(w, 'd3-row10-bidwin-22feb'); await L.closeWin(w)
  note('row10 bid window "left" for LL on Mon 22 Feb (spec: War bal − 1 = 8)', 'desk', eq(l10, '8') ? 'PASS' : 'FAIL', `LL left ${l10} (War bal 9)`, ['d3-row10-bidwin-22feb'])
  // ---- the clock: 31 Dec 2026, 1 Jan 2027, 4 Jan 2027
  for (const [iso, tag] of [['2026-12-31', 'd31'], ['2027-01-01', 'j1'], ['2027-01-04', 'j4']]) {
    await D.setToday(w, iso)
    await L.openGrid(w)
    await P.selectOption(T('war-picker'), { label: iso < '2027' ? 'JAN - DEC 26' : 'JAN - DEC 27' }).catch(() => {}); await P.waitForTimeout(700)
    s = await D.surfaces(w, 'salsa', `d3-row6-${tag}`)
    console.log(`row6 ${iso}:`, D.brief(s))
    const want = { d31: ['21', '2'], j1: ['52', '19'], j4: ['52', '19'] }[tag]
    judge(`row6 ${iso} (spec ${want[0]} incl ${want[1]})`, std(s, want[0], want[1], '–', want[0]), [`d3-row6-${tag}-bal-win`, `d3-row6-${tag}-grid`], `window: ${s.win.taken}`)
    s = await D.surfaces(w, 'fantom', `d3-row8-${tag}`)
    console.log(`row8 ${iso}:`, D.brief(s))
    const w8 = { d31: ['10', '4', '−2', '8'], j1: ['39', '6', '–', '39'], j4: ['39', '6', '–', '39'] }[tag]
    judge(`row8 ${iso} (spec App ${w8[0]}, Pending ${w8[2]}, War ${w8[3]})`, std(s, ...w8), [`d3-row8-${tag}-bal-win`])
    if (tag !== 'd31') {
      s = await D.surfaces(w, 'casper', `d3-row4-${tag}`)
      judge(`row4 (no grade, 37 incl 4) ${iso}: spec 33 incl 33`, std(s, '33', '33', '–', '33'), [`d3-row4-${tag}-bal-win`])
      s = await D.surfaces(w, 'vegas', `d3-row5-${tag}`)
      judge(`row5 (−2 left, Junior pilot +33) ${iso}: spec 31 incl 0`, std(s, '31', '0', '–', '31'), [`d3-row5-${tag}-bal-win`])
    }
    if (tag === 'j1') {
      s = await D.surfaces(w, 'pike', 'd3-row10-j1')
      console.log('row10 1 Jan:', D.brief(s))
      note('row10 on 1 Jan 2027 (informational, no spec figure: leave still in Feb)', 'desk', 'PASS', D.brief(s), ['d3-row10-j1-bal-win'])
    }
  }
} catch (e) { note('ERROR', 'desk', 'FAIL', String(e).slice(0, 500)); await shot(w, 'd3-error').catch(() => {}) }
note('errors (console, page, 4xx)', 'desk', w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 800) : 'none')
D.dumpResults('d3')
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
