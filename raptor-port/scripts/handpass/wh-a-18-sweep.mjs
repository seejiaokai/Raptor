/* [WARN-HIDE-KEPT] walker A — THE SWEEP: every warning line of the demo week's four flying days (Monday 14, Tuesday 4,
   Wednesday 7, Thursday 6 — every KIND the demo raises), hidden ONE AT A TIME through the list's own ✕ on Edit
   Schedule. After each ✕ the box is shut (an open box lights its men) and the day is read as painted:
     - the bar counts exactly one fewer; the line stays in place, struck, with ↺; no other line changes;
     - only the men that warning NAMES change;
     - a named man with no other shown warning is plain on EVERY copy in the day; one with another keeps a mark;
     - a crew-rest breach's dotted mark on the day before goes with it.
   With all hidden: "✓ No issues", no flagged puck anywhere in the day, the board agrees. Then ↺ on each, last to first:
   the day is painted exactly as it started. Finally Insights with the four days hidden. One world. */
import { world, openList, readList, tapLine, closeList, boardOpenFold, readBoard, pk, snap, snapDiff, insights, typeSum, dayIssues, warnsOf, judge, row, savePart, pic, guard, L, W, DAY } from './wh-a-lib.mjs'
const S = '#eWeek'
const FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const { browser, p, errors } = await world(); p.setDefaultTimeout(8000)
const dayScope = di => `${S} .day[data-day="${di}"]`
const count = bar => /No issues/.test(bar) ? 0 : +(/(\d+) issues?/.exec(bar) || [])[1]
await L.go(p, 'editsched')
const ins0 = await insights(p)
await openList(p, S, 0); const mon0 = (await readList(p, S, 0)).lines.filter(x => /^Breaks /.test(x.text)).map(x => x.text.slice(0, 60)); await closeList(p, S, 0)
for (const di of [0, 1, 2, 3]) {
  await guard(`sweep-${DAY[di]}`, `the sweep of ${FULL[di]}`, async () => {
    await W.showDay(p, di)
    const start = await snap(p, dayScope(di)); const startPrev = di > 0 ? await snap(p, dayScope(di - 1)) : {}
    await openList(p, S, di); const l0 = await readList(p, S, di); const w0 = await warnsOf(p, di)
    const n = w0.length; const bad = []; const kinds = new Set(w0.map(w => w.code))
    let prev = start, shown = n
    for (const w of w0) {
      await openList(p, S, di); const how = await tapLine(p, S, di, w.ix)
      const l = await readList(p, S, di); await closeList(p, S, di)
      const now = await snap(p, dayScope(di)); const d = snapDiff(prev, now); const ws = await warnsOf(p, di)
      shown--
      const li = l.lines.find(x => x.ix === w.ix) || {}
      const tag = `${w.code} "${w.msg.slice(0, 34)}"`
      if (how !== 'pressed') bad.push(`${tag}: ${how}`)
      if (count(l.bar) !== shown) bad.push(`${tag}: the bar reads "${l.bar}" — expected ${shown}`)
      if (!(li.struck && li.btn === '↺' && li.btnTop === true)) bad.push(`${tag}: its line is not struck with a reachable ↺ (${JSON.stringify({ struck: li.struck, btn: li.btn, top: li.btnTop })})`)
      if (l.lines.filter(x => !/^Breaks /.test(x.text)).length !== n || l.lines.filter(x => !/^Breaks /.test(x.text)).map(x => x.ix).join() !== l0.lines.filter(x => !/^Breaks /.test(x.text)).map(x => x.ix).join()) bad.push(`${tag}: the list changed length or order`)
      if (l.lines.filter(x => x.struck).length !== n - shown) bad.push(`${tag}: ${l.lines.filter(x => x.struck).length} lines struck, expected ${n - shown}`)
      const strangers = Object.keys(d).filter(id => !w.who.includes(id))
      if (strangers.length) bad.push(`${tag}: a man it does not name changed — ${strangers.map(id => id + ': ' + d[id]).join(' | ').slice(0, 200)}`)
      for (const id of w.who) {
        const others = ws.filter(x => !x.off && x.who.includes(id))
        if (!others.length && now[id]) bad.push(`${tag}: ${id} has no other shown warning but is still drawn ${now[id].join(' ; ').slice(0, 140)}`)
        if (others.length && !now[id]) bad.push(`${tag}: ${id} still has ${others.map(x => x.code).join()} showing but is drawn plain`)
      }
      if (w.code === 'CREW_REST' && di > 0) { const y = await pk(p, dayScope(di - 1), w.who[0]); if (y.some(x => /dotted/.test(x.out))) bad.push(`${tag}: the dotted mark is still on ${FULL[di - 1]}`) }
      prev = now
    }
    /* all hidden */
    await openList(p, S, di); const la = await readList(p, S, di); await W.showDay(p, di); const f1 = await pic(p, `S-${DAY[di]}-all-hidden-list`)
    await closeList(p, S, di); const allRaw = await snap(p, dayScope(di))
    /* a dotted "breaks tomorrow" mark belongs to TOMORROW's crew-rest breach: it must STAY while that one is still shown */
    const tomorrow = di < 6 ? (await warnsOf(p, di + 1)).filter(w => w.code === 'CREW_REST' && !w.off).flatMap(w => w.who) : []
    const all = {}, kept = []
    for (const [id, marks] of Object.entries(allRaw)) { const rest = marks.filter(m => !(tomorrow.includes(id) && /dotted/.test(m))); if (rest.length) all[id] = rest; if (rest.length !== marks.length) kept.push(id) }
    const prevDay = di > 0 ? await snap(p, dayScope(di - 1)) : {}
    await p.evaluate(i => { const e = document.querySelector(`#eWeek .day[data-day="${i}"] [data-secmove$=".waves"]`); if (e) e.scrollIntoView({ block: 'start', inline: 'nearest' }) }, di); await L.sleep(300)
    const f2 = await pic(p, `S-${DAY[di]}-all-hidden-pucks`)
    await W.boardOn(p, di); await boardOpenFold(p); const b = await readBoard(p); const onBoardRaw = await snap(p, '#schedBoard'); const onBoard = {}; for (const [id, marks] of Object.entries(onBoardRaw)) { const rest = marks.filter(m => !(tomorrow.includes(id) && /dotted/.test(m))); if (rest.length) onBoard[id] = rest } const f3 = await pic(p, `S-${DAY[di]}-all-hidden-board`); await W.boardOff(p)
    judge(`sweep — ${FULL[di]} (${n} lines: ${[...kinds].join(', ')})`, `Edit Schedule, ${FULL[di]}: ✕ on each of its ${n} lines, one at a time, the box shut and the day read after each; then the board opened`, [
      [`after every single ✕ (${n} checks): the bar one lower, the line struck in place with ↺, only the men it names changed, each named man plain or still flagged as his other shown warnings say`, bad.length === 0, bad.join(' ‖ ').slice(0, 900) || 'all held'],
      ['all hidden: the bar reads "✓ No issues", quiet, and every line is struck', /✓ No issues/.test(la.bar) && !/hard|adv/.test(la.barCls) && la.lines.filter(x => !/^Breaks /.test(x.text)).length === n && la.lines.filter(x => !/^Breaks /.test(x.text)).every(x => x.struck), la.bar + ' · other rows: ' + JSON.stringify(la.lines.filter(x => /^Breaks /.test(x.text)).map(x => x.text.slice(0, 40) + (x.struck ? ' (struck)' : '') + (x.btn ? ' ' + x.btn : '')))],
      ['all hidden: NOT ONE puck in the day carries a ring, chip or dashed mark of this day', Object.keys(all).length === 0, JSON.stringify(all).slice(0, 300) || 'none'],
      [tomorrow.length ? `…while the dotted mark that belongs to ${FULL[di + 1]}'s crew-rest breach (still shown) STAYS on its man, and the "Breaks ${FULL[di + 1]}" row stays in the list, not struck` : 'no man of this day carries a mark for a breach of the next day (none is shown there)', tomorrow.length ? tomorrow.every(id => kept.includes(id)) && la.lines.some(x => /^Breaks /.test(x.text) && !x.struck) : kept.length === 0, `tomorrow's shown breach names ${JSON.stringify(tomorrow)}; kept dotted on ${JSON.stringify(kept)}`],
      ['all hidden: the day before carries no dotted "breaks" mark from it', !Object.values(prevDay).flat().some(x => /dotted/.test(x)), Object.entries(prevDay).filter(([, v]) => v.some(x => /dotted/.test(x))).map(([k, v]) => k + ': ' + v).join() || 'none'],
      [`the board agrees: "No conflicts flagged for ${FULL[di]} ✓", ${n} struck lines, no flagged puck`, new RegExp(`No conflicts flagged for ${FULL[di]} ✓`).test(b.head) && b.lines.length === n && b.lines.every(x => x.struck && x.btn === '↺') && Object.keys(onBoard).length === 0, `${b.head} · ${JSON.stringify(onBoard).slice(0, 200)}`],
    ], [f1, f2, f3])
    if (di === 1) { await openList(p, S, 0); const m = await readList(p, S, 0); const fb = await pic(p, 'S-monday-list-with-tuesday-breach-hidden'); await closeList(p, S, 0)
      row('21 (the "Breaks Tuesday" row in the list of Monday)', 'with the crew-rest breach of Tuesday hidden: the list of Monday opened', `Monday's list:${m.bar}; rows that begin "Breaks": ${JSON.stringify(m.lines.filter(x => /^Breaks /.test(x.text)).map(x => x.text.slice(0, 60)))}; other rows: ${JSON.stringify(m.other)} — at the start of the walk Monday's list carried: ${JSON.stringify(mon0)}`, m.lines.some(x => /^Breaks Tuesday/.test(x.text)) ? 'FAIL' : 'PASS', [fb]) }
    return { n }
  }, () => pic(p, `S-${DAY[di]}-error`))
}
/* Insights with the four flying days hidden */
await guard('sweep-insights', 'Insights with four days hidden', async () => {
  const ins = await insights(p, () => pic(p, 'S-insights-four-days-hidden'))
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday']
  judge('24 (four whole days hidden)', 'Insights opened with every line of Monday–Thursday hidden', [
    ['"By day" reads "clear" for Monday, Tuesday, Wednesday and Thursday', days.every(d => /clear/.test(ins.byDay[d] || '')), days.map(d => ins.byDay[d]).join(' | ')],
    ['the weekly tile counts only what is still shown (Saturday\'s and Sunday\'s OIL reminders: 2)', ins.total === 2, `${ins0.total} → ${ins.total} (${ins.tileSub})`],
    ['"Conflicts by type" lists only the OIL reminder, 2', typeSum(ins) === 2 && Object.keys(ins.byType).length === 1, JSON.stringify(ins.byType)],
    ['work hours are unchanged for every man', JSON.stringify(ins.hours) === JSON.stringify(ins0.hours)],
  ], [ins.pic])
}, () => pic(p, 'S-insights-error'))
/* flag everything again, last line first, and compare with a fresh world's painting */
await guard('sweep-restore', 'flag everything again', async () => {
  const fresh = await world(); await L.go(fresh.p, 'editsched')
  const bad = []
  for (const di of [0, 1, 2, 3]) { await openList(p, S, di); const l = await readList(p, S, di); for (const x of [...l.lines].reverse()) if (x.btn === '↺') await tapLine(p, S, di, x.ix); await closeList(p, S, di) }
  for (const di of [0, 1, 2, 3]) {
    await openList(p, S, di); const l2 = await readList(p, S, di); await closeList(p, S, di)
    await openList(fresh.p, S, di); const lf = await readList(fresh.p, S, di); await closeList(fresh.p, S, di)
    const mine = await snap(p, dayScope(di)), theirs = await snap(fresh.p, dayScope(di)); const d = snapDiff(theirs, mine)
    if (l2.bar.replace(/collapse ▲|review ▼/, '') !== lf.bar.replace(/collapse ▲|review ▼/, '')) bad.push(`${FULL[di]}: bar "${l2.bar}" vs a fresh world's "${lf.bar}"`)
    if (l2.lines.some(x => x.struck || (x.btn && x.btn !== '✕'))) bad.push(`${FULL[di]}: a line is still struck`)
    if (JSON.stringify(l2.lines.map(x => x.text)) !== JSON.stringify(lf.lines.map(x => x.text))) bad.push(`${FULL[di]}: the list's lines differ from a fresh world's`)
    if (Object.keys(d).length) bad.push(`${FULL[di]}: painted differently from a fresh world — ${JSON.stringify(d).slice(0, 300)}`)
  }
  const ins = await insights(p); await W.showDay(p, 0); const f = await pic(p, 'S-everything-flagged-again')
  await fresh.browser.close()
  judge('sweep — everything flagged again', '↺ on every struck line of the four days, last first; each day compared, puck by puck, with a fresh copy of the demo week', [
    ['each day\'s bar, lines and every flagged puck are exactly as in a world where nothing was ever hidden', bad.length === 0, bad.join(' ‖ ').slice(0, 700) || 'identical'],
    ['Insights is back to its first reading (tile, by type, by day)', ins.total === ins0.total && JSON.stringify(ins.byType) === JSON.stringify(ins0.byType) && JSON.stringify(ins.byDay) === JSON.stringify(ins0.byDay), `${ins.total}`],
  ], [f])
}, () => pic(p, 'S-restore-error'))
console.log('ERRORS', JSON.stringify(errors))
if (errors.length) row('errors (18-sweep)', 'the browser\'s error list through this file', errors.join(' | ').slice(0, 600), 'FAIL', [])
savePart('18-sweep', { errors })
await browser.close()
