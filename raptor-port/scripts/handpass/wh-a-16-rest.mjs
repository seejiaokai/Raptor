/* [WARN-HIDE-KEPT] walker A — the remaining kinds: the DASHED crew-rest ring (a "late show" line), the overnight tight
   turn (scenario 17's second half), and an SC SPARE seat (scenario 8's other exempt kind). Fixtures typed into the
   week's own boxes / built with the board's "+ Wave". One world each. */
import { world, openList, readList, tapLine, closeList, boardOpenFold, readBoard, tapBoardLine, pk, marked, sum, judge, row, savePart, pic, guard, warnsOf, addWave, lineIx, L, W, PHONE } from './wh-a-lib.mjs'
import { handPut } from './seat-lib.mjs'
const S = '#eWeek', MON = 0, TUE = 1
const allErrors = []
const dayScope = di => `${S} .day[data-day="${di}"]`
const nolit = ps => ps.map(x => ({ ...x, ring: x.out && /solid/.test(x.out) ? '' : x.ring, out: /dotted|dashed/.test(x.out) ? x.out : '' }))

/* ---------- the dashed ring; the overnight tight turn ---------- */
{
  const { browser, p, errors } = await world(); p.setDefaultTimeout(8000)
  const outlaw = async () => ({ tue: await pk(p, dayScope(TUE), 'casper'), mon: await pk(p, dayScope(MON), 'casper'), list: await pk(p, '#eRoster', 'casper') })
  const mine = () => warnsOf(p, TUE).then(w => w.filter(x => x.who.includes('casper')))
  await guard('dash', 'the dashed crew-rest ring', async () => {
    await L.go(p, 'editsched'); await W.showDay(p, TUE)
    await W.weekText(p, 'ff:1.0.0.to', '12:00'); await W.weekText(p, 'ff:1.0.0.ld', '13:25'); await W.weekText(p, 'fr:1.0.0.1', '2A: BFM-6 LATE SHOW')
    const m0 = await mine(); const o0 = await outlaw()
    await p.evaluate(() => document.querySelector('#eWeek .day[data-day="1"] .go .form').scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(250)
    const f0 = await pic(p, 'D1-outlaw-dashed-ring')
    await openList(p, S, TUE); const l0 = await readList(p, S, TUE); const ix = lineIx(l0, /Crew rest breach/)
    const how = await tapLine(p, S, TUE, ix)
    const l1 = await readList(p, S, TUE); const o1 = await outlaw()
    await p.evaluate(() => document.querySelector('#eWeek .day[data-day="1"] .go .form').scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(250)
    const f1 = await pic(p, 'D2-outlaw-dash-gone')
    await W.showDay(p, MON); await p.evaluate(() => { const e = document.querySelector('#eWeek .day[data-day="0"] .go .puck[data-person="casper"]'); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }); await L.sleep(250)
    const f1b = await pic(p, 'D2-monday-dotted-gone')
    await openList(p, S, TUE); const how2 = await tapLine(p, S, TUE, ix); await closeList(p, S, TUE); await p.mouse.click(5, 300); await L.sleep(300); const o2 = await outlaw()
    await p.evaluate(() => document.querySelector('#eWeek .day[data-day="1"] .go .form').scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(250)
    const f2 = await pic(p, 'D3-outlaw-dash-back')
    const fly = o => o.tue.filter(x => x.where === 'flying line')
    judge('WH3 — the dashed ring (a sanctioned late show)', `Edit Schedule, Tuesday: Outlaw's line retimed (take-off 12:00, landing 13:25) and its remark typed "… LATE SHOW" — his crew-rest breach is then drawn as a DASHED red ring; ✕ on the crew-rest line (${how}); then ↺ (${how2})`, [
      ['set up: his Tuesday seat wears a dashed red ring with R; Monday wears the dotted "breaks Tuesday" mark', fly(o0).some(x => /dashed red/.test(x.out) && x.chip === 'R') && o0.mon.some(x => /dotted/.test(x.out)), `Tue ${sum(o0.tue)} | Mon ${sum(o0.mon)} | ${m0.map(w => w.code + ': ' + w.msg.slice(-60)).join(' / ')}`],
      ['hidden: no dashed ring, no ring, no R on any Tuesday copy or in the crew list', marked(nolit([...o1.tue, ...o1.list])).length === 0 && o1.tue.length >= 1, `Tue ${sum(o1.tue)} | list ${sum(o1.list)}`],
      ['hidden: Monday\'s dotted mark is gone too', marked(nolit(o1.mon)).length === 0, `Mon ${sum(o1.mon)}`],
      ['hidden: the bar fell by one and the line is struck with ↺', count(l1.bar) === count(l0.bar) - 1 && (l1.lines.find(l => l.ix === ix) || {}).struck === true, `${l0.bar} → ${l1.bar}`],
      ['flagged again: the dashed ring and R are back, and Monday\'s dotted mark', fly(o2).some(x => /dashed red/.test(x.out) && x.chip === 'R') && o2.mon.some(x => /dotted/.test(x.out)), `Tue ${sum(o2.tue)} | Mon ${sum(o2.mon)}`],
    ], [f0, f1, f1b, f2])
  }, () => pic(p, 'D-error'))
  await guard('17-overnight', 'the overnight tight turn', async () => {
    /* his wave's in-time moved to 11:00 (the in-time line typed over): no breach now, but the 3h report still falls inside rest */
    await W.showDay(p, TUE); await W.weekText(p, 'ff:1.0.0.to', '13:10'); await W.weekText(p, 'ff:1.0.0.ld', '14:35')
    const it = p.locator(`${dayScope(TUE)} [data-itline="1|0|0"]`).first(); await it.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await it.click(); await p.keyboard.press('Control+A'); await p.keyboard.type('11:00H: FIRST WAVE VL IN TIME + WX/NOTAMS', { delay: 6 }); await it.evaluate(e => e.blur()); await L.sleep(500)
    const m0 = await mine(); const o0 = await outlaw()
    await openList(p, S, TUE); const l0 = await readList(p, S, TUE); const ix = lineIx(l0, /Tight turning/)
    if (ix < 0) { row('17 (overnight tight turn)', 'Edit Schedule, Tuesday: Outlaw\'s wave in-time typed 11:00 (take-off 12:00) to turn his breach into a tight turn', `no "Tight turning — crew rest" line appeared: ${m0.map(w => w.code + ': ' + w.msg.slice(0, 80)).join(' / ') || 'nothing names him'}`, 'NOT WALKED (the fixture did not raise the note)', [await pic(p, '17o-no-tight-turn')]); return }
    await p.evaluate(() => document.querySelector('#eWeek .day[data-day="1"] .go .form').scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(250)
    const f0 = await pic(p, '17o-a-outlaw-tt')
    await openList(p, S, TUE); const how = await tapLine(p, S, TUE, ix)
    const l1 = await readList(p, S, TUE); const o1 = await outlaw()
    await p.evaluate(() => document.querySelector('#eWeek .day[data-day="1"] .go .form').scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(250)
    const f1 = await pic(p, '17o-b-outlaw-tt-gone')
    await W.boardOn(p, TUE); await boardOpenFold(p); const b1 = await readBoard(p); const ob = await pk(p, '#schedBoard', 'casper'); const f1b = await pic(p, '17o-b-board')
    const how2 = await tapBoardLine(p, TUE, ix); const ob2 = await pk(p, '#schedBoard', 'casper'); await W.boardOff(p); const o2 = await outlaw()
    judge('17 (overnight tight turn)', `Edit Schedule, Tuesday: the line retimed again (take-off 13:10, so its brief is 10:50) and the wave's in-time line typed over as 11:00 — the breach becomes "Tight turning — crew rest"; ✕ on it (${how}); board opened; ↺ there (${how2})`, [
      ['set up: a "Tight turning" advisory names Outlaw and the breach is gone; his seat wears TT with no ring', m0.some(w => w.code === 'CREW_TIGHT') && !m0.some(w => w.code === 'CREW_REST') && o0.tue.some(x => x.chip === 'TT'), `${m0.map(w => w.code).join()} · Tue ${sum(o0.tue)}`],
      ['hidden: no TT on any copy — week, crew list', ![...o1.tue, ...o1.list].some(x => /TT/.test(x.chip)) && marked(nolit([...o1.tue, ...o1.list])).length === 0, `Tue ${sum(o1.tue)} | list ${sum(o1.list)}`],
      ['hidden: the bar fell by one; the line is struck with ↺', count(l1.bar) === count(l0.bar) - 1 && (l1.lines.find(l => l.ix === ix) || {}).struck === true, `${l0.bar} → ${l1.bar}`],
      ['the board agrees: line struck, no TT on any copy there', (b1.lines.find(l => l.ix === ix) || {}).struck === true && !ob.some(x => /TT/.test(x.chip)), `${b1.head} · ${sum(ob)}`],
      ['flagged again on the board: TT is back on the board and on the week', ob2.some(x => x.chip === 'TT') && o2.tue.some(x => x.chip === 'TT'), `board ${sum(ob2)} | week ${sum(o2.tue)}`],
    ], [f0, f1, f1b])
    row('17 (TURN and the overnight note on ONE man)', 'not built', 'the same-day tight turn (Wednesday: Trident, Relay) and the overnight note (Tuesday: Outlaw) were walked on different men; each hide moved only its own chip', 'NOT WALKED (one man carrying both at once was not built)', [])
  }, () => pic(p, '17o-error'))
  allErrors.push(...errors); await browser.close()
}

/* ---------- an SC SPARE seat ---------- */
{
  const { browser, p, errors } = await world(); p.setDefaultTimeout(8000)
  const at = (ps, re) => ps.filter(x => re.test(x.slot) || re.test(x.where))
  await guard('8-spare', 'an SC SPARE seat', async () => {
    await L.go(p, 'editsched'); await W.boardOn(p, TUE)
    const aw = await addWave(p, TUE, 'SC')
    const seat = await p.evaluate(() => { const g = [...document.querySelectorAll('#schedBoard .sb-go')].pop(); const ln = [...g.querySelectorAll('.sb-line')].find(l => /SPARE/.test(l.innerText)); const s = ln && ln.querySelector('[data-slot$=".p"]'); return s ? s.dataset.slot : null })
    if (!seat) { row('8 (SC SPARE)', `Scheduler Board, Tuesday: "+ Wave" → SC (${aw})`, 'no line marked SPARE was found in the new SC wave', 'NOT WALKED (no SPARE line found)', [await pic(p, '8s-no-spare')]); return }
    const put1 = await handPut(p, seat, 'sufa'); const put2 = await handPut(p, 'g:1.0.+', 'sufa'); await boardOpenFold(p)
    const w0 = (await warnsOf(p, TUE)).filter(w => w.who.includes('sufa')); const form = seat.split('.').slice(0, 3).join('.'); const own = w0.filter(w => w.key === seat || w.key === form || w.key.startsWith(form + '.'))
    const pre = seat.split('.').slice(0, 2).join('\\.')
    const reSeat = new RegExp('^' + pre + '\\.')
    const g0 = await pk(p, '#schedBoard', 'sufa')
    await p.evaluate(k => { const e = document.querySelector(`#schedBoard [data-slot="${k}"]`); if (e) e.scrollIntoView({ block: 'center' }) }, seat); await L.sleep(250)
    const f0 = await pic(p, '8s-a-board-spare-flagged')
    for (let i = 0; i < 6; i++) { const b = await readBoard(p); const l = b.lines.find(x => !x.struck && /Grit/.test(x.text) && own.some(w => x.text.includes(w.msg.slice(0, 30)))); if (!l) break; await tapBoardLine(p, TUE, l.ix); await boardOpenFold(p) }
    const g1 = await pk(p, '#schedBoard', 'sufa')
    await p.evaluate(k => { const e = document.querySelector(`#schedBoard [data-slot="${k}"]`); if (e) e.scrollIntoView({ block: 'center' }) }, seat); await L.sleep(250)
    const f1 = await pic(p, '8s-b-board-own-hidden')
    await W.boardOff(p); const gw = await pk(p, dayScope(TUE), 'sufa')
    await p.evaluate(k => { const e = document.querySelector(`#eWeek [data-slot="${k}"]`); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }, seat); await L.sleep(250)
    const f2 = await pic(p, '8s-c-week-own-hidden')
    const left = (await warnsOf(p, TUE)).filter(w => w.who.includes('sufa') && !w.off)
    judge('8 (SC SPARE — Edit Schedule)', `Scheduler Board, Tuesday: "+ Wave" → SC (${aw}); Grit picked onto a SPARE line's front seat ${seat} (${put1.took ? 'seated' : 'NOT seated: ' + (put1.msg || '')}) and onto the first ground item (${put2.took ? 'added' : 'NOT added'}); ✕ on every line anchored to the spare seat (${own.length}); board closed`, [
      ['the spare seat raised warnings of its own, and he carries another elsewhere', own.length >= 1 && w0.length > own.length, w0.map(w => w.code + '@' + w.key).join(' | ')],
      ['Edit Schedule: the spare copy is PLAIN once its own are hidden', at(gw, reSeat).length >= 1 && marked(nolit(at(gw, reSeat))).length === 0, sum(at(gw, reSeat))],
      ['Edit Schedule: his ground copy is still ringed red', at(gw, /^g:/).some(x => x.ring === 'red') && left.length >= 1, `${sum(at(gw, /^g:/))} · still showing: ${left.map(w => w.code + '@' + w.key).join()}`],
    ], [f0, f2])
    row('8 (SC SPARE — the board)', 'the same moment, read on the board before it was closed', `the board drew the spare copy ${sum(at(g1, reSeat)) || '(not found)'} (before the hides: ${sum(at(g0, reSeat))}); his ground copy ${sum(at(g1, /^g:/))}`, marked(nolit(at(g1, reSeat))).length === 0 ? 'PASS' : 'FAIL (same as finding 1: the board rings an exempt flying seat with his flags from elsewhere)', [f1])
  }, () => pic(p, '8s-error'))
  allErrors.push(...errors); await browser.close()
}
function count(h) { return +(/(\d+) issues?/.exec(h) || [])[1] || (/No conflicts|No issues/.test(h) ? 0 : null) }
console.log('ERRORS', JSON.stringify(allErrors))
if (allErrors.length) row('errors (16-rest)', 'the browser\'s error list through this file', allErrors.join(' | ').slice(0, 600), 'FAIL', [])
savePart('16-rest', { errors: allErrors })
