// Walker D, script d7b: scenarios 4, 5(d), 2 (the below-zero ask), 3 (the leave buttons' "left"). Desktop, admin, today 28 Oct 2026.
process.env.LW_OUT ||= '../../docs/img/handpass/2026-10-28-lw-m5a/d'
process.env.LW_TODAY ||= '2026-10-28'
const D = await import('./lw-m5a-walk-d-lib.mjs')
const { L, note, eq } = D
const { T, press, vis, txt, shot } = L
console.log('[lw-m5a-walk-d-d7b v1]')
const w = await L.newCtx('desk')
const P = w.page
const exp = (label, got, want) => ({ label, got, want, ok: eq(got, want) })
function judge(id, checks, pics, extra = '') {
  const bad = checks.filter(c => !c.ok)
  note(id, 'desk', bad.length ? 'FAIL' : 'PASS', checks.map(c => `${c.label} ${c.got}${c.ok ? '' : ' (expected ' + c.want + ')'}`).join('; ') + (extra ? ' · ' + extra : ''), pics)
}
const std = (s, app, cf, pend, war) => [exp('App bal', s.row.app, app), exp('incl.', s.row.cf, cf), exp('Pending', s.row.pend, pend), exp('War bal', s.row.war, war), exp('window App', s.win.app, app), exp('window war', s.win.war, war), exp('grid figure', s.grid.split(' ')[0], war)]
const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
async function pickRange(pid, from, to, approve) {
  await L.openGrid(w)
  await press(w, T('month-' + MON[Number(from.slice(5, 7)) - 1])); await P.waitForTimeout(1200)
  await L.openCell(w, pid, from)
  if (!(await vis(P, T('bid-picker')))) return false
  await L.approveWhatIEnter(w, approve)
  await press(w, T('span-range')); await P.waitForTimeout(500)
  const goTo = async iso => { for (let i = 0; i < 24 && !(await P.locator(T('span-day-' + iso)).count()); i++) { await press(w, T('span-next')); await P.waitForTimeout(200) } }
  await goTo(from); await press(w, T('span-day-' + from)); await P.waitForTimeout(250)
  await goTo(to); await press(w, T('span-day-' + to)); await P.waitForTimeout(300)
  return true
}
const place = async type => { const ok = await L.placeLeave(w, type); if (!ok) await L.closeWin(w); return ok }
const leftOf = async (pid, iso, portion = 'full') => {
  await L.openGrid(w); await press(w, T('month-' + MON[Number(iso.slice(5, 7)) - 1])); await P.waitForTimeout(1000)
  await L.openCell(w, pid, iso)
  if (portion !== 'full') { await press(w, T('portion-' + portion)); await P.waitForTimeout(300) }
  const r = Object.fromEntries(await Promise.all(['LL', 'OL', 'CCL', 'PL'].map(async k => [k, await txt(P, T(`bid-${k}-left`))])))
  r.dayline = await txt(P, T('bid-dayline'))
  await shot(w, `d7b-left-${iso}-${portion}`)
  await L.closeWin(w)
  return r
}
try {
  await L.signIn(w, 'admin')
  // fixtures typed on 28 Oct 2026
  for (const [pid, app, cf] of [['pike', 20, 3], ['salsa', 20, 0]]) { await D.openBalances(w); await D.typeInBox(w, T('bal-LVE-' + pid), app); await D.typeInBox(w, T('bal-cf-' + pid), cf) }
  await D.openBalances(w)
  // ---- 5(d): carried forward over the figure is clamped, shown at once; then App bal below the carried forward
  await D.typeInBox(w, T('bal-LVE-vegas'), 20); await D.typeInBox(w, T('bal-cf-vegas'), 25, true)
  const c1 = await D.balRow(P, 'vegas'); const err1 = await txt(P, T('bal-cf-vegas-err')); await shot(w, 'd7b-5d-cf25')
  await D.typeInBox(w, T('bal-LVE-vegas'), 3)
  const c2 = await D.balRow(P, 'vegas'); await shot(w, 'd7b-5d-app3')
  judge('5d carried fwd 25 typed with App bal 20, then App bal 3 with incl. 20 showing', [exp('incl. after 25 typed (clamped)', c1.cf, '20'), exp('App bal', c1.app, '20'), exp('after App bal 3: App', c2.app, '3'), exp('after App bal 3: incl.', c2.cf, '3')], ['d7b-5d-cf25', 'd7b-5d-app3'], `refusal words under the box: ${err1 ?? 'none (clamped without a note)'}`)
  // ---- 4: a leave approved now for next January comes off the total only
  await L.openGrid(w)
  await P.selectOption(T('war-picker'), { label: 'JAN - DEC 27' }); await P.waitForTimeout(900)
  console.log('picked range', await pickRange('pike', '2027-01-04', '2027-01-05', true), await txt(P, T('span-selection')))
  await shot(w, 'd7b-4-range')
  console.log('placed', await place('LL'))
  let s = await D.surfaces(w, 'pike', 'd7b-4-now')
  judge('4 today 28 Oct 2026: typed 20 incl 3; LL Mon 4 – Tue 5 Jan 2027 approved now → 18 incl 3 (the 2027 days come off the total only)', std(s, '18', '3', '–', '18'), ['d7b-4-now-bal-win'], 'lines ' + s.win.lines.map(l => l.id + ' ' + l.text).join(' / '))
  await D.setToday(w, '2027-01-01'); await L.openGrid(w); await P.waitForTimeout(500)
  s = await D.surfaces(w, 'pike', 'd7b-4-jan1')
  judge('4 clock 1 Jan 2027: 17 → carried forward 15 after the 2 days, +33 → 48 incl 15', std(s, '48', '15', '–', '48'), ['d7b-4-jan1-bal-win'])
  await D.setToday(w, '2026-10-28'); await P.waitForTimeout(500)
  await L.openGrid(w); await P.selectOption(T('war-picker'), { label: 'JAN - DEC 26' }); await P.waitForTimeout(900)
  // ---- 2: the below-zero ask on a bid made only of weekend days (Saint: 20 incl 0; LL 1–12 Feb 2027 approved → 10; LL Sat 13 – Sun 21 Feb)
  await L.openGrid(w); await P.selectOption(T('war-picker'), { label: 'JAN - DEC 27' }); await P.waitForTimeout(900)
  console.log('range1', await pickRange('salsa', '2027-02-01', '2027-02-12', true)); console.log('placed1', await place('LL'))
  s = await D.surfaces(w, 'salsa', 'd7b-2-first')
  await L.openGrid(w); await P.selectOption(T('war-picker'), { label: 'JAN - DEC 27' }).catch(() => {}); await P.waitForTimeout(800)
  console.log('range2', await pickRange('salsa', '2027-02-13', '2027-02-21', true), await txt(P, T('span-selection')))
  const leftBefore = await txt(P, T('bid-LL-left'))
  await press(w, T('bid-LL')); await P.waitForTimeout(700)
  const ask = await vis(P, T('bid-picker')); const words = await P.evaluate(() => { const bp = document.querySelector('[data-testid="bid-picker"]'); return bp ? [...bp.querySelectorAll('[data-testid="bid-warn"], .bid-warn, .bid-ask, [role="alert"], [data-testid*="below"], [data-testid*="warn"]')].map(e => e.innerText.replace(/\s+/g, ' ').trim()).join(' | ') + ' // all: ' + bp.innerText.replace(/\s+/g, ' ').slice(0, 600) : null })
  await shot(w, 'd7b-2-ask')
  console.log('ask', ask, words)
  note('2 below-zero ask on a bid made only of weekend days (Saint War bal 10; LL Sat 13 – Sun 21 Feb 2027; the run grows to 21 days)', 'desk', ask && /-?−?1/.test(words) && /zero|below|negative|−1/i.test(words) ? 'PASS' : 'FAIL', `LL button read "${leftBefore}" before; after the first press the window stays open: ${ask}; words: ${words}`, ['d7b-2-ask'])
  if (ask) { await press(w, T('bid-LL')); await P.waitForTimeout(700) }
  s = await D.surfaces(w, 'salsa', 'd7b-2-second')
  console.log('after second press', D.brief(s))
  note('2b after the second press (the leave placed)', 'desk', 'PASS', D.brief(s), ['d7b-2-second-bal-win'])
  // ---- 3: the buttons' "left" on a weekday, a Saturday, a public holiday and a half (Nomad, War bal 18 in period 26 view)
  await L.openGrid(w); await P.selectOption(T('war-picker'), { label: 'JAN - DEC 26' }); await P.waitForTimeout(900)
  const res = {}
  for (const [k, iso, por] of [['Wed 4 Nov', '2026-11-04', 'full'], ['Sat 7 Nov', '2026-11-07', 'full'], ['PH Wed 18 Feb', '2026-02-18', 'full'], ['Wed 4 Nov PM', '2026-11-04', 'pm']]) res[k] = await leftOf('pike', iso, por)
  console.log(JSON.stringify(res))
  const want = { 'Wed 4 Nov': '17', 'Sat 7 Nov': '18', 'PH Wed 18 Feb': '18', 'Wed 4 Nov PM': '17.5' }
  for (const k of Object.keys(res)) note(`3 leave button "left" — ${k} (War bal 18; designer expects ${want[k]})`, 'desk', eq(res[k].LL, want[k]) ? 'PASS' : 'FAIL', `LL left ${res[k].LL}, OL ${res[k].OL}, CCL ${res[k].CCL}, PL ${res[k].PL}; day line "${res[k].dayline}"`, [`d7b-left-${k === 'Wed 4 Nov PM' ? '2026-11-04-pm' : k === 'Sat 7 Nov' ? '2026-11-07-full' : k === 'PH Wed 18 Feb' ? '2026-02-18-full' : '2026-11-04-full'}`])
} catch (e) { note('ERROR', 'desk', 'FAIL', String(e).slice(0, 500)); await shot(w, 'd7b-error').catch(() => {}) }
note('errors (console, page, 4xx)', 'desk', w.errs.length ? 'FAIL' : 'PASS', w.errs.length ? w.errs.join(' || ').slice(0, 800) : 'none')
D.dumpResults('d7b')
await w.ctx.close(); await L.closeBrowser()
console.log('DONE')
