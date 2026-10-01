/* [WARN-HIDE-KEPT] walker A — Tuesday on Edit Schedule: scenarios 21 (the list, both widths), 20 (Static's long day),
   24 (Insights), 23 (the ⓘ popup, working face). One world. Every hide through the list's own ✕ / ↺. */
import { world, openList, readList, tapLine, closeList, pk, marked, sum, insights, typeSum, dayIssues, dayInfo, judge, row, savePart, pic, guard, L, W, TAG } from './wh-a-lib.mjs'
const { browser, p, errors } = await world()
p.setDefaultTimeout(8000)
const TUE = 1, MON = 0, S = '#eWeek'
await L.go(p, 'editsched')
const staticAll = async () => [...await pk(p, `${S} .day[data-day="1"]`, 'wolf'), ...await pk(p, '#eRoster', 'wolf')]

await guard('21a', 'Tuesday, nothing hidden yet', async () => {
  await openList(p, S, TUE)
  const l = await readList(p, S, TUE); const st = await staticAll()
  const f = await pic(p, '21a-tue-before')
  judge('21 (start)', 'Edit Schedule, Tuesday: its issues bar tapped open', [
    ['the bar reads 4 issues · 2 warning', /4 issues/.test(l.bar) && /2 warning/.test(l.bar), l.bar],
    ['four lines, none struck, each with ✕', l.lines.length === 4 && l.lines.every(x => !x.struck && x.btn === '✕')],
    ['Static wears the grey ring and L where he is drawn', marked(st).length >= 2 && marked(st).every(x => x.ring === 'grey' && x.chip === 'L'), sum(st)],
  ], [f])
})
let ins0 = null
await guard('24a', 'Insights before any hide', async () => { ins0 = await insights(p, () => pic(p, '24a-insights-before')); console.log('INS0', JSON.stringify({ total: ins0.total, sub: ins0.tileSub, type: typeSum(ins0), tue: dayIssues(ins0, 'Tuesday'), ld: ins0.byType['Long work day'], st: ins0.hours.Static })) })

await guard('21b', 'hide the fourth line', async () => {
  await openList(p, S, TUE)
  const how = await tapLine(p, S, TUE, 3)
  const l = await readList(p, S, TUE)
  await W.showDay(p, TUE); const f1 = await pic(p, '21b-tue-fourth-hidden')
  const st = await staticAll()
  await p.evaluate(() => { const e = document.querySelector('#eWeek .day[data-day="1"] .go .puck[data-person="wolf"]'); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }); await L.sleep(300)
  const f2 = await pic(p, '20-static-pucks-after-hide')
  const l3 = l.lines[3] || {}
  judge('21', `Edit Schedule, Tuesday's list open → ✕ on its fourth line, Static's long work day (${how})`, [
    ['the bar reads 3 issues · 2 warning', /3 issues/.test(l.bar) && /2 warning/.test(l.bar), l.bar],
    ['the count line says nothing about a hidden one', !/hidden/i.test(l.bar) && !l.other.some(o => /hidden/i.test(o)), l.other],
    ['still four lines, the long-day line still FOURTH', l.lines.length === 4 && /Long work day/.test(l3.text || ''), l.lines.map(x => x.text.slice(0, 18))],
    ['that line is painted struck out, the other three are not', l3.struck === true && l.lines.slice(0, 3).every(x => !x.struck)],
    ['its button is now ↺ and a finger lands on it', l3.btn === '↺' && l3.btnTop === true, `${l3.btn} top=${l3.btnTop}`],
    ['its text is darker than a live line', l3.color !== l.lines[0].color, `${l3.color} vs ${l.lines[0].color}`],
  ], [f1])
  judge('20', 'the same hide — every place Static is drawn on Tuesday (his flying seat, his duty desk, the crew list beside the week)', [
    ['he is drawn at least twice', st.length >= 2, sum(st)],
    ['no copy of him carries a ring or the L', marked(st).length === 0, sum(marked(st)) || 'all plain'],
  ], [f2])
})
let ins1 = null
await guard('24b', 'Insights after the hide', async () => {
  ins1 = await insights(p, () => pic(p, '24b-insights-one-hidden'))
  judge('24 (hide)', 'Insights opened from the top bar after hiding Tuesday\'s long-day note', [
    ['the weekly issues tile fell by one', ins1.total === ins0.total - 1, `${ins0.total} → ${ins1.total}`],
    ['"Conflicts by type" fell by one in all, and "Long work day" by one', typeSum(ins1) === typeSum(ins0) - 1 && +ins1.byType['Long work day'] === +ins0.byType['Long work day'] - 1, `sum ${typeSum(ins0)} → ${typeSum(ins1)}; long day ${ins0.byType['Long work day']} → ${ins1.byType['Long work day']}`],
    ['"By day" Tuesday fell by one', dayIssues(ins1, 'Tuesday') === dayIssues(ins0, 'Tuesday') - 1, `${ins0.byDay.Tuesday} → ${ins1.byDay.Tuesday}`],
    ['the three agree with each other', ins1.total === typeSum(ins1) && ins1.total === Object.keys(ins1.byDay).reduce((a, d) => a + (dayIssues(ins1, d) || 0), 0)],
  ], [ins1.pic])
  judge('20 (hours)', 'the same Insights window — Static\'s work hours', [
    ['Static\'s work-hours figure is unchanged', ins1.hours.Static === ins0.hours.Static && !!ins0.hours.Static, `${ins0.hours.Static} → ${ins1.hours.Static}`],
    ['every man\'s work-hours figure is unchanged', JSON.stringify(ins1.hours) === JSON.stringify(ins0.hours)],
  ], [ins1.pic])
})
await guard('23a', 'the ⓘ popup with one hidden', async () => {
  const d = await dayInfo(p, S, TUE, () => pic(p, '23a-dayinfo-one-hidden'))
  judge('23 (one hidden, working face)', 'Edit Schedule, Tuesday\'s ⓘ tapped with the long-day note hidden', [
    ['the counts read 2 warning · 1 advisory and no note', /2 warning/i.test(d.sev) && /1 advisory/i.test(d.sev) && !/note/i.test(d.sev), d.sev],
    ['all four lines are still listed, in place', d.lines.length === 4 && /Long work day/.test(d.lines[3].text), d.lines.map(x => x.text.slice(0, 24))],
    ['the hidden one is painted struck, the others not', d.lines[3].struck && d.lines.slice(0, 3).every(x => !x.struck)],
  ], [d.pic])
})
await guard('24c', 'flag it again; Insights rises', async () => {
  await openList(p, S, TUE); const how = await tapLine(p, S, TUE, 3)
  const l = await readList(p, S, TUE); const st = await staticAll(); const f = await pic(p, '24c-tue-flagged-again')
  const ins2 = await insights(p, () => pic(p, '24c-insights-flagged-again'))
  judge('24 (flag again)', `↺ on the struck line (${how}), then Insights again`, [
    ['the bar is back to 4 issues, the line unstruck with ✕', /4 issues/.test(l.bar) && l.lines[3].struck === false && l.lines[3].btn === '✕', l.bar],
    ['Static wears the grey ring and L again', marked(st).length >= 2 && marked(st).every(x => x.ring === 'grey' && x.chip === 'L'), sum(st)],
    ['tile, by type and by day are all back to the first reading', ins2.total === ins0.total && JSON.stringify(ins2.byType) === JSON.stringify(ins0.byType) && JSON.stringify(ins2.byDay) === JSON.stringify(ins0.byDay), `${ins2.total}`],
  ], [f, ins2.pic])
})
await guard('21c', 'hide all four', async () => {
  await openList(p, S, TUE)
  for (const ix of [3, 0, 1, 2]) await tapLine(p, S, TUE, ix)
  const l = await readList(p, S, TUE)
  await W.showDay(p, TUE); const f1 = await pic(p, '21c-tue-all-hidden-open')
  const who = { Saint: 'salsa', Outlaw: 'casper', Static: 'wolf' }; const left = []
  for (const [cs, id] of Object.entries(who)) { const m = marked([...await pk(p, `${S} .day[data-day="1"]`, id), ...await pk(p, '#eRoster', id)]); if (m.length) left.push(cs + ': ' + sum(m)) }
  const monOutlaw = marked(await pk(p, `${S} .day[data-day="0"]`, 'casper'))
  await closeList(p, S, TUE); const lc = await readList(p, S, TUE); const f2 = await pic(p, '21c-tue-all-hidden-closed')
  const boxOpenAfterClose = await p.evaluate(() => document.querySelector('#eWeek .day[data-day="1"] [data-dwbox="1"]').classList.contains('open'))
  await openList(p, S, TUE); const lo = await readList(p, S, TUE)
  const barCol = await p.evaluate(() => { const b = document.querySelector('#eWeek .day[data-day="1"] .daywarn'); const c = getComputedStyle(b); return c.borderTopColor + ' / ' + c.backgroundColor })
  judge('21 (all hidden)', 'the other three lines hidden too (✕ on each); the bar tapped shut and open again', [
    ['the bar stays and reads "✓ No issues"', /✓ No issues/.test(l.bar), l.bar],
    ['closed, it reads "✓ No issues · tap to review"', /✓ No issues/.test(lc.bar) && /tap to review/.test(lc.bar) && boxOpenAfterClose === false, lc.bar],
    ['the bar is quiet — not red, not amber', !/hard|adv/.test(l.barCls), l.barCls + ' ' + barCol],
    ['tapped, it opens all four lines, each painted struck with a reachable ↺', lo.lines.length === 4 && lo.lines.every(x => x.struck && x.btn === '↺' && x.btnTop === true), lo.lines.map(x => `${x.struck}/${x.btn}/${x.btnTop}`)],
    ['the lines keep their order (clash, crew rest, brief, long day)', /Conflict/.test(lo.lines[0].text) && /Crew rest/.test(lo.lines[1].text) && /flight brief/.test(lo.lines[2].text) && /Long work day/.test(lo.lines[3].text)],
    ['no "N hidden" wording anywhere in the box', !/hidden/i.test(lo.bar + lo.other.join(' '))],
    ['Saint, Outlaw and Static carry no ring or chip on Tuesday', left.length === 0, left.join(' | ') || 'all plain'],
    ['Outlaw\'s dotted "breaks Tuesday" mark on Monday is gone', monOutlaw.length === 0, sum(monOutlaw) || 'plain'],
  ], [f1, f2])
  await W.showDay(p, MON); await p.evaluate(() => { const e = document.querySelector('#eWeek .day[data-day="0"] .go .puck[data-person="casper"]'); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }); await L.sleep(300)
  const f3 = await pic(p, '21c-monday-outlaw-no-dotted')
  row('21 (all hidden) — Monday picture', 'Monday scrolled to Outlaw\'s flying seat with Tuesday\'s crew-rest breach hidden', `Outlaw on Monday: ${sum(await pk(p, `${S} .day[data-day="0"]`, 'casper'))}`, monOutlaw.length ? 'FAIL' : 'PASS', [f3])
})
await guard('23b', 'the ⓘ popup with all hidden', async () => {
  const d = await dayInfo(p, S, TUE, () => pic(p, '23b-dayinfo-all-hidden'))
  judge('23 (all hidden, working face)', 'Edit Schedule, Tuesday\'s ⓘ tapped with all four hidden', [
    ['it says "Nothing flagged" (no severity counts)', /nothing flagged/i.test(d.sev + ' ' + d.under) && !/\d+ (warning|advisory|note)/i.test(d.sev), `${d.sev} | ${d.under}`],
    ['the four lines are still listed, each painted struck', d.lines.length === 4 && d.lines.every(x => x.struck), d.lines.map(x => x.struck)],
  ], [d.pic])
})
console.log('ERRORS', JSON.stringify(errors))
if (errors.length) row('errors (10-tue)', 'the browser\'s error list through this file', errors.join(' | ').slice(0, 600), 'FAIL', [])
savePart('10-tue', { errors })
await browser.close()
