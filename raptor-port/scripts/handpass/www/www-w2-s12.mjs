/* www W2 scenario 12: specialised writers and short names: issues heading, a puck's flag title, Insights "Conflicts by type",
   the Logic check names; "Tight turning" beside "Tight turn"; the double-turn line.
   usage (from raptor-port/): [PHONE=1] node scripts/handpass/www/www-w2-s12.mjs */
const PHONE = process.env.PHONE === '1'
process.env.WWW_RUN ||= 's12-' + (PHONE ? 'p' : 'd')
const H = await import('./www-w2-lib2.mjs')
const { X, say, sleep, L } = H
const P = PHONE ? 'p' : 'd', size = PHONE ? '402' : '1536'
const R = (did, exp, saw, v, pic) => X.row('12 writers and short names', size, did, exp, saw, v, pic)
say('www-w2-s12 v1', size)
const w = await X.open({ phone: PHONE })
const { page } = w
const FRI = X.FRI, SAT = X.SAT
await X.board(w, FRI)
const w1 = await H.frFlight(w, FRI, '12:00', '', 'bane', 'VL BFM')
const w2 = await H.frFlight(w, FRI, '14:00', '', 'bane', 'RU')
await H.gRow(w, FRI, 'BRIEFING', '13:10', '13:20', 'bane')
// a puck's flag title
const titles = await page.evaluate(() => [...document.querySelectorAll('#schedBoard .puck.warn')].filter(e => e.getBoundingClientRect().width && /Ranger/.test(e.innerText)).map(e => e.title).slice(0, 3))
const issuesHead = await page.evaluate(() => { const e = document.querySelector('#schedBoard #sbWarn, #schedBoard #sbSide'); return e ? e.innerText.replace(/[\s ]+/g, ' ').slice(0, 150) : '' })
await X.pic(w, `12-1-puck-title-${P}`)
R('a flagged Ranger puck on the board: its title (tooltip/whole-puck description)', 'RECORD; the short check names (Conflict, Tight turn, Misses ... debrief), no "Clash"', JSON.stringify(titles), titles.some(t => /Clash/.test(t)) ? 'FAIL' : 'RECORDED', `12-1-puck-title-${P}.png`)
R('the issues heading', 'RECORD', issuesHead, /Clash/.test(issuesHead) ? 'FAIL' : 'RECORDED', `12-1-puck-title-${P}.png`)
const bwl = await H.bwf(w, /Ranger/)
R('double-turn line', '"1 person is double turning: Ranger" unchanged', JSON.stringify(bwl.filter(l => /double/.test(l))), bwl.some(l => /1 person is double turning: Ranger/.test(l)) ? 'PASS' : 'FAIL', `12-1-puck-title-${P}.png`)
// next-day Tight turning: a Saturday flight 04:00 for Ranger, no report typed
await X.closeBoard(w)
await X.board(w, SAT)
await H.frFlight(w, SAT, '06:00', '', 'bane', 'EARLY SAT')
const sat = await H.bwf(w, /Ranger/)
await X.pic(w, `12-2-tight-turning-${P}`)
R('Saturday flight 06:00 for Ranger (Friday ends late), no report typed', 'a "Tight turning" advisory (not "Tight turn"); RECORD whole', JSON.stringify(sat), sat.some(l => /Tight turning/.test(l)) ? 'PASS' : 'RECORDED', `12-2-tight-turning-${P}.png`)
{
  const sw = await page.evaluate(() => window.DAYS[5].waves.length - 1)
  await H.setF(w, `ff:${SAT}.${sw}.0.to`, '07:00')
  await H.setF(w, `ff:${SAT}.${sw}.0.rl`, '06:00')
  const s2 = await H.bwf(w, /Ranger/)
  await X.pic(w, `12-2b-tight-turning-rally-${P}`)
  R('Saturday flight T/O 07:00 with a rally typed 06:00 (usual report 04:00 would be short, typed 06:00 clears)', 'a "Tight turning" advisory, RECORD whole; no Crew rest warning', JSON.stringify(s2), s2.some(l => /Tight turning/.test(l)) ? 'PASS' : 'RECORDED', `12-2b-tight-turning-rally-${P}.png`)
}
// Friday seen on its own: the same-day Tight turn
await X.closeBoard(w)
const ww = await X.weekWarn(w, '#eWeek', FRI)
await X.pic(w, `12-3-week-friday-${P}`)
R('Friday week strip: heads and lines (Tight turn same day; the Saturday trace is on Friday as "Breaks Saturday")', 'RECORD both names', JSON.stringify(ww.items.filter(l => /Ranger/.test(l))) + ' head: ' + ww.head, ww.items.some(l => /Tight turn:/.test(l)) ? 'PASS' : 'RECORDED', `12-3-week-friday-${P}.png`)
// Insights: Conflicts by type
await X.board(w, FRI)
const ins = await H.insightsLines(w, '12-4')
const ct = ins.findIndex(l => /Conflicts by type/i.test(l))
R('Insights: "Conflicts by type" heading with its figures', 'heading against its figures (lesson 9): the categories use the short names', ct < 0 ? 'NO HEADING; ' + JSON.stringify(ins.filter(l => /onflict|lash|turn|rest/i.test(l))) : JSON.stringify(ins.slice(ct, ct + 14)), ct < 0 ? 'NOT WALKED' : 'RECORDED', `12-4-insights-${P}.png`)
await H.closeInsights(w)
await X.closeBoard(w)
// Logic check names
await L.go(page, 'logic'); await sleep(600)
const lg = await page.evaluate(() => document.body.innerText.split(/\r?\n/).map(s => s.replace(/[\s ]+/g, ' ').trim()).filter(s => /Conflict|Clash|Tight|crew rest|Crew rest|double|Double|Misses|Overlap/.test(s)).slice(0, 40))
await X.pic(w, `12-5-logic-${P}`)
R('Logic page: the check names and lines naming conflicts, tight turns, crew rest', 'RECORD; "Tight turning" and "Tight turn" are two checks; no "Clash"', JSON.stringify(lg), lg.some(s => /Clash/.test(s)) ? 'FAIL' : 'RECORDED', `12-5-logic-${P}.png`)
await X.fin(w)
