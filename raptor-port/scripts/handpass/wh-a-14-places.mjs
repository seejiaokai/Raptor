/* [WARN-HIDE-KEPT] walker A — every PLACE a man's puck is drawn: scenarios 10 (the ALL AVAIL window, working face),
   11 (a qualification flag: cockpit seat and both crew lists), 12 + 14 (one man on a programme item, two ground items,
   two sims and a duty desk: his same-code clashes hidden one at a time, then his advisories), 13 (Available crew,
   SANS cards, the Unavailable block, Personal Inputs). Fixtures through the board's own seats and crew list. */
import { world, openList, readList, tapLine, boardOpenFold, readBoard, tapBoardLine, pk, marked, sum, judge, row, savePart, pic, guard, warnsOf, availWin, lineIx, L, W, PHONE } from './wh-a-lib.mjs'
import { handPut } from './seat-lib.mjs'
const S = '#eWeek', TUE = 1
const allErrors = []
const dayScope = di => `${S} .day[data-day="${di}"]`
const lit = ps => ps.map(x => ({ ...x, out: /dotted|dashed/.test(x.out) ? x.out : '' }))   /* a solid outline is a highlight, not a flag */

/* ---------- 10 ---------- */
{
  const { browser, p, errors } = await world(); p.setDefaultTimeout(8000)
  await guard('10', 'the ALL AVAIL window', async () => {
    await L.go(p, 'editsched'); await W.boardOn(p, TUE)
    const put = await handPut(p, 'a:1.1.+', 'allavail')
    const man = (w, id) => (w.men || []).find(m => m.id === id) || {}
    const others = (w, ids) => JSON.stringify((w.men || []).filter(m => !ids.includes(m.id)))
    const w0 = await availWin(p, '#schedBoard', () => pic(p, '10a-window-before'), 'salsa')
    await boardOpenFold(p); const b0 = await readBoard(p)
    const ixClash = b0.lines.find(l => /Saint/.test(l.text) && /clash/.test(l.text)).ix, ixBrief = b0.lines.find(l => /Saint/.test(l.text) && /flight brief/.test(l.text)).ix, ixOut = b0.lines.find(l => /Outlaw/.test(l.text)).ix
    /* Saint carries two warnings; the window shows one reason a man. Hide the clash, then the brief advisory. */
    await tapBoardLine(p, TUE, ixClash)
    const w1 = await availWin(p, '#schedBoard', () => pic(p, '10b-window-saint-clash-hidden'), 'salsa')
    await boardOpenFold(p); await tapBoardLine(p, TUE, ixBrief)
    const w2 = await availWin(p, '#schedBoard', () => pic(p, '10c-window-saint-both-hidden'), 'salsa')
    judge('10 (working face, the board)', `Scheduler Board, Tuesday: ALL AVAIL placed on MASS BRIEF (${put.took ? 'placed' : 'NOT placed'}); its count chip tapped → the window; closed; ✕ on Saint's clash, the chip again; ✕ on Saint's "no time for the brief", the chip again`, [
      ['before: Saint is in the window, ringed red, with "VL SAT & APPOINTMENT clash" under him', man(w0, 'salsa').flagged === true && man(w0, 'salsa').ring === 'red' && /clash/.test(man(w0, 'salsa').why), JSON.stringify(man(w0, 'salsa'))],
      ['clash hidden: he falls to amber and the reason under him is now the brief one (the warning still showing); the footer count is unchanged', man(w1, 'salsa').ring === 'amber' && /flight brief/.test(man(w1, 'salsa').why) && w1.nFlagged === w0.nFlagged, `${JSON.stringify(man(w1, 'salsa'))} · "${w1.foot}"`],
      ['both hidden: Saint is STILL in the window', !!man(w2, 'salsa').id && w2.n === w0.n, `${w2.n} men listed (before ${w0.n})`],
      ['both hidden: his puck there is plain and no reason is written under him', man(w2, 'salsa').flagged === false && !man(w2, 'salsa').ring && !man(w2, 'salsa').chip && !man(w2, 'salsa').why, JSON.stringify(man(w2, 'salsa'))],
      ['"N men are flagged" fell by one', w2.nFlagged === w0.nFlagged - 1 && w0.nFlagged > 0, `"${w0.foot}" → "${w2.foot}"`],
      ['the count of available men did not change', w2.count === w0.count && w2.chip === w0.chip, `${w0.count} → ${w2.count} (chip ${w0.chip} → ${w2.chip})`],
      ['the men drawn with a reason in the window number what the footer says', w0.men.filter(m => m.flagged).length === w0.nFlagged && w2.men.filter(m => m.flagged).length === w2.nFlagged, `${w0.men.filter(m => m.flagged).length}/${w0.nFlagged} → ${w2.men.filter(m => m.flagged).length}/${w2.nFlagged}`],
      ['nobody else in the window changed', others(w0, ['salsa']) === others(w2, ['salsa'])],
    ], [w0.pic, w1.pic, w2.pic])
    /* Outlaw: his crew-rest breach hidden — what does the window then say of him? (recorded) */
    await boardOpenFold(p); await tapBoardLine(p, TUE, ixOut)
    const w3 = await availWin(p, '#schedBoard', () => pic(p, '10d-window-outlaw-hidden'), 'casper')
    judge('10 (a man with a second reason of the window\'s own)', '✕ on Outlaw\'s crew-rest line; the chip again', [
      ['his red ring, R and crew-rest reason are gone from the window; he is still listed', !!man(w3, 'casper').id && !man(w3, 'casper').ring && !man(w3, 'casper').chip && !/Crew rest/.test(man(w3, 'casper').why), JSON.stringify(man(w3, 'casper'))],
      ['RECORDED: the window now writes another reason under him — the MASS BRIEF itself sits inside his flight brief (the same reason his formation-mates Warden, Basher and Hex show) — so the footer still counts him', true, `was ${JSON.stringify(man(w0, 'casper'))} · now ${JSON.stringify(man(w3, 'casper'))} · "${w3.foot}"`],
    ], [w3.pic])
    /* the same window from Edit Schedule; then ↺ on Saint's two */
    await W.boardOff(p); await W.showDay(p, TUE)
    const w4 = await availWin(p, dayScope(TUE), () => pic(p, '10e-window-from-week'), 'salsa')
    await openList(p, S, TUE); await tapLine(p, S, TUE, ixClash); await tapLine(p, S, TUE, ixBrief)
    const w5 = await availWin(p, dayScope(TUE), () => pic(p, '10f-window-saint-flagged-again'), 'salsa')
    judge('10 (working face, Edit Schedule; flag again)', 'the board closed; the same chip tapped on Edit Schedule\'s Tuesday; then ↺ on Saint\'s two struck lines and the chip again', [
      ['from Edit Schedule the window says the same: Saint listed, plain, no reason', !!man(w4, 'salsa').id && !man(w4, 'salsa').flagged && !man(w4, 'salsa').ring && !man(w4, 'salsa').why && w4.nFlagged === w3.nFlagged, `${JSON.stringify(man(w4, 'salsa'))} · "${w4.foot}"`],
      ['after ↺: he is ringed red with his clash under him again, and the footer is one higher', man(w5, 'salsa').flagged === true && man(w5, 'salsa').ring === 'red' && /clash/.test(man(w5, 'salsa').why) && w5.nFlagged === w4.nFlagged + 1, `${JSON.stringify(man(w5, 'salsa'))} · "${w5.foot}"`],
    ], [w4.pic, w5.pic])
  }, () => pic(p, '10-error'))
  allErrors.push(...errors); await browser.close()
}

/* ---------- 11 ---------- */
{
  const { browser, p, errors } = await world(); p.setDefaultTimeout(8000)
  await guard('11', 'a qualification flag', async () => {
    await L.go(p, 'editsched'); await W.boardOn(p, TUE)
    const plus = p.locator('#schedBoard [data-lac="1.0.1"]').first(); await plus.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(150); await plus.click(); await L.sleep(600)
    const seat = '1.0.1.2.p'; const put = await handPut(p, seat, 'psy')
    const mine = (await warnsOf(p, TUE)).filter(w => w.who.includes('psy'))
    const b0 = lit(await pk(p, '#schedBoard', 'psy'))
    await W.boardOff(p); await W.showDay(p, TUE)
    const w0 = lit([...await pk(p, dayScope(TUE), 'psy'), ...await pk(p, '#eRoster', 'psy')])
    await openList(p, S, TUE); const l0 = await readList(p, S, TUE); const ix = lineIx(l0, /Cutter is a WSO/)
    const how = await tapLine(p, S, TUE, ix)
    const w1 = lit([...await pk(p, dayScope(TUE), 'psy'), ...await pk(p, '#eRoster', 'psy')])
    await p.evaluate(k => { const e = document.querySelector(`#eWeek [data-slot="${k}"]`); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }, seat); await L.sleep(250)
    const f1 = await pic(p, '11a-week-seat-and-crew-list-plain')
    await W.boardOn(p, TUE); const b1 = lit(await pk(p, '#schedBoard', 'psy'))
    await p.evaluate(k => { const e = document.querySelector(`#schedBoard [data-slot="${k}"]`); if (e) e.scrollIntoView({ block: 'center' }) }, seat); await L.sleep(250)
    const f2 = await pic(p, '11b-board-seat-and-crew-list-plain')
    judge('11', `Scheduler Board, Tuesday: "+" adds a third aircraft to RU BFM; its FRONT seat armed and Cutter (a WSO) picked (${put.took ? 'seated' : 'NOT seated'}); board closed; Edit Schedule: ✕ on "Cutter is a WSO — cannot fly FCP" (${how}); board opened again`, [
      ['the qualification flag is his only warning', mine.length === 1 && mine[0].code === 'QUAL', mine.map(w => w.code).join()],
      ['before: red ring and Q on his seat and in both crew lists', marked(w0).length >= 2 && marked(w0).every(x => x.ring === 'red' && x.chip === 'Q') && marked(b0).length >= 2 && marked(b0).every(x => x.chip === 'Q'), `week ${sum(w0)} | board ${sum(b0)}`],
      ['after, Edit Schedule: no copy carries Q or a ring — seat, Available crew, the crew list beside the week', w1.length >= 2 && marked(w1).length === 0 && (PHONE || w1.some(x => /crew list/.test(x.where))), sum(w1)],
      ['after, the board: no copy carries Q or a ring — seat, Available crew, the board\'s crew list', b1.length >= 2 && marked(b1).length === 0 && (PHONE || b1.some(x => /crew list/.test(x.where))), sum(b1)],
    ], [f1, f2])
    await boardOpenFold(p); const how2 = await tapBoardLine(p, TUE, ix); const b2 = lit(await pk(p, '#schedBoard', 'psy'))
    await W.boardOff(p); const w2 = lit([...await pk(p, dayScope(TUE), 'psy'), ...await pk(p, '#eRoster', 'psy')])
    await p.evaluate(k => { const e = document.querySelector(`#eWeek [data-slot="${k}"]`); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }, seat); await L.sleep(250)
    const f3 = await pic(p, '11c-week-q-back')
    judge('11 (flag again)', `↺ on the board's struck line (${how2}); board closed`, [
      ['every copy on the board wears red and Q again', marked(b2).length === b2.length && b2.every(x => x.ring === 'red' && x.chip === 'Q'), sum(b2)],
      ['every copy on Edit Schedule wears red and Q again', marked(w2).length === w2.length && w2.every(x => x.ring === 'red' && x.chip === 'Q'), sum(w2)],
    ], [f3])
  }, () => pic(p, '11-error'))
  allErrors.push(...errors); await browser.close()
}

/* ---------- 12 + 14 ---------- */
{
  const { browser, p, errors } = await world(); p.setDefaultTimeout(8000)
  await guard('12', 'one man on a programme item, ground items, sims and a duty desk', async () => {
    await L.go(p, 'editsched'); await W.boardOn(p, TUE)
    const places = [['a:1.1.+', 'Common Programme: MASS BRIEF'], ['g:1.2.+', 'ground: MEDICAL APPT (an extra)'], ['g:1.3.+', 'ground: APPOINTMENT (an extra)'], ['s:1.oft.1.+', 'sim: SIMS (EXT SQN)'], ['s:1.amt.1.+', 'sim: BOX'], ['d:1.1.0.+', 'duty desk: 2nd-wave SDO (an extra)']]
    const puts = []; for (const [k] of places) puts.push((await handPut(p, k, 'shaft')).took)
    await boardOpenFold(p)
    const mine = () => warnsOf(p, TUE).then(w => w.filter(x => x.who.includes('shaft')))
    const m0 = await mine(); const clashes = m0.filter(w => w.code === 'DOUBLE_BOOK'), advs = m0.filter(w => w.code !== 'DOUBLE_BOOK')
    const all = async () => ({ board: lit(await pk(p, '#schedBoard', 'shaft')) })
    const a0 = await all()
    await p.evaluate(() => { const e = document.querySelector('#schedBoard [data-fill="d:1.1.0.+"]'); if (e) e.scrollIntoView({ block: 'center' }) }); await L.sleep(250)
    const f0 = await pic(p, '12a-board-anvil-everywhere-red')
    const kinds = new Set(a0.board.map(x => x.where))
    judge('12 (set up)', `Scheduler Board, Tuesday: Anvil picked from the crew list onto ${places.map(x => x[1]).join('; ')} (${puts.filter(Boolean).length} of ${puts.length} landed)`, [
      ['he is drawn on a programme item, a duty desk, a sim, and a ground item (and the crew list)', ['programme', 'duty', 'sim', 'ground'].every(k => kinds.has(k)), [...kinds].join(', ')],
      ['several clash warnings name him, and at least one advisory', clashes.length >= 3 && advs.length >= 1, `${clashes.length} clashes (${clashes.map(w => w.msg.slice(0, 30)).join(' | ')}) · ${advs.map(w => w.code).join()}`],
      ['every copy of him wears the red ring and C', a0.board.every(x => x.ring === 'red' && x.chip === 'C'), sum(a0.board)],
    ], [f0])
    /* hide his clashes one at a time, on the board */
    const steps = []
    for (let i = 0; i < clashes.length; i++) {
      await tapBoardLine(p, TUE, clashes[i].ix); await boardOpenFold(p)
      const b = lit(await pk(p, '#schedBoard', 'shaft')); const left = clashes.length - 1 - i
      steps.push({ left, allRedC: b.every(x => x.ring === 'red' && x.chip === 'C'), anyRedOrC: b.some(x => x.ring === 'red' || x.chip === 'C'), sum: sum(b) })
    }
    const mid = steps.slice(0, -1), last = steps[steps.length - 1]
    await p.evaluate(() => { const e = document.querySelector('#schedBoard [data-fill="d:1.1.0.+"]'); if (e) e.scrollIntoView({ block: 'center' }) }); await L.sleep(250)
    const f1 = await pic(p, '12b-board-all-clashes-hidden-duty')
    await p.evaluate(() => { const e = document.querySelector('#schedBoard [data-fill="s:1.amt.1.+"]'); if (e) e.scrollIntoView({ block: 'center' }) }); await L.sleep(250)
    const f1b = await pic(p, '12b-board-all-clashes-hidden-sims')
    const bd = lit(await pk(p, '#schedBoard', 'shaft'))
    await W.boardOff(p); const wk = lit([...await pk(p, dayScope(TUE), 'shaft'), ...await pk(p, '#eRoster', 'shaft')])
    await p.evaluate(() => { const e = document.querySelector('#eWeek .day[data-day="1"] .sec-duty .puck[data-person="shaft"]'); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }); await L.sleep(250)
    const f2 = await pic(p, '12c-week-all-clashes-hidden')
    judge('12', `on the board: ✕ on each of his ${clashes.length} clash lines, one at a time`, [
      [`while any clash naming him is still showing (${mid.length} checks), EVERY copy keeps the red ring and C`, mid.every(s => s.allRedC), mid.map(s => `${s.left} left: ${s.allRedC}`).join(' · ')],
      ['only after the LAST clash is hidden does the red ring / C leave — and it leaves every copy', last.anyRedOrC === false, last.sum],
      ['Edit Schedule agrees: no copy red or C (programme item, duty desk extra, sims, ground extras, crew list)', wk.length >= 5 && !wk.some(x => x.ring === 'red' || x.chip === 'C'), sum(wk)],
    ], [f1, f1b, f2])
    judge('14 (the clash hidden)', 'the same fixture, read at his 2nd-wave SDO duty desk (a timed desk; he is an extra on it) — he also carries the unrelated "no time for the sim brief / debrief" advisories', [
      ['board: the desk copy fell from red to AMBER (the advisory still showing), not plain', bd.filter(x => x.where === 'duty').length >= 1 && bd.filter(x => x.where === 'duty').every(x => x.ring === 'amber'), sum(bd.filter(x => x.where === 'duty'))],
      ['week: the desk copy is amber too', wk.filter(x => x.where === 'duty').length >= 1 && wk.filter(x => x.where === 'duty').every(x => x.ring === 'amber'), sum(wk.filter(x => x.where === 'duty'))],
    ], [f1, f2])
    /* now the advisories, from Edit Schedule */
    await openList(p, S, TUE)
    for (const a of advs) await tapLine(p, S, TUE, a.ix)
    const wk2 = lit([...await pk(p, dayScope(TUE), 'shaft'), ...await pk(p, '#eRoster', 'shaft')])
    await p.evaluate(() => { const e = document.querySelector('#eWeek .day[data-day="1"] .sec-duty .puck[data-person="shaft"]'); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }); await L.sleep(250)
    const f3 = await pic(p, '14b-week-desk-plain')
    await W.boardOn(p, TUE); const bd2 = lit(await pk(p, '#schedBoard', 'shaft'))
    await p.evaluate(() => { const e = document.querySelector('#schedBoard [data-fill="d:1.1.0.+"]'); if (e) e.scrollIntoView({ block: 'center' }) }); await L.sleep(250)
    const f4 = await pic(p, '14b-board-desk-plain')
    const left = (await mine()).filter(w => !w.off)
    judge('14 (the advisory hidden too)', `Edit Schedule: ✕ on his ${advs.length} advisory line(s); the board opened again`, [
      ['nothing naming him is left showing', left.length === 0, left.map(w => w.code).join() || 'none'],
      ['week: the desk copy — and every other copy — is plain', wk2.length >= 5 && marked(wk2).length === 0, sum(wk2)],
      ['board: the desk copy — and every other copy — is plain', bd2.length >= 5 && marked(bd2).length === 0, sum(bd2)],
    ], [f3, f4])
    row('14 (untimed duty rows)', 'not walked', 'the demo week\'s duty desks all carry times; an untimed desk was not built', 'NOT WALKED (no untimed desk in the demo week; the timed desk and its extra are walked above)', [])
  }, () => pic(p, '12-error'))
  allErrors.push(...errors); await browser.close()
}

/* ---------- 13 ---------- */
{
  const { browser, p, errors } = await world(); p.setDefaultTimeout(8000)
  await guard('13', 'the lower blocks', async () => {
    await L.go(p, 'editsched'); await W.boardOn(p, TUE)
    const pr = await handPut(p, 'g:1.2.+', 'romeo')    /* Rebel: a SANS card on Tuesday; he flies RU ACM 14:40 — MEDICAL APPT 13:30–15:00 clashes */
    const pq = await handPut(p, 'g:1.1.+', 'nasty')    /* Quill: on local leave on Tuesday (an Unavailable row) */
    await W.boardOff(p); await W.showDay(p, TUE)
    const fold = p.locator(`${dayScope(TUE)} [data-pitog="1"]`).first(); await fold.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(150); await fold.click(); await L.sleep(400)
    const blk = async (id, re) => lit(await pk(p, dayScope(TUE), id)).filter(x => re.test(x.where))
    const before = { rebel: await blk('romeo', /SANS/), quill: await blk('nasty', /Unavailable/), saintPI: await blk('salsa', /Personal Inputs/), saintAv: await blk('salsa', /Available/), outlawAv: await blk('casper', /Available/) }
    const all0 = await warnsOf(p, TUE)
    await p.evaluate(() => document.querySelector('#eWeek .day[data-day="1"] [data-secmove="1.inputs"]').scrollIntoView({ block: 'start', inline: 'nearest' })); await L.sleep(300)
    const f0 = await pic(p, '13a-lower-blocks-flagged')
    judge('13 (set up)', `Board, Tuesday: Rebel (a SANS card that day) added to MEDICAL APPT (${pr.took ? 'added' : 'NOT added'}); Quill (on local leave — an Unavailable row) added to FLY W EXT SQN (${pq.took ? 'added' : 'NOT added'}); board closed; Personal Inputs opened by its header`, [
      ['Rebel\'s SANS card puck is flagged', before.rebel.length >= 1 && marked(before.rebel).length >= 1, sum(before.rebel) + ' · ' + all0.filter(w => w.who.includes('romeo')).map(w => w.code).join()],
      ['Quill\'s Unavailable-row puck is flagged', before.quill.length >= 1 && marked(before.quill).length >= 1, sum(before.quill) + ' · ' + all0.filter(w => w.who.includes('nasty')).map(w => w.code).join()],
      ['Saint\'s Personal Inputs puck and his Available-crew puck are flagged', marked(before.saintPI).length >= 1 && marked(before.saintAv).length >= 1, `${sum(before.saintPI)} | ${sum(before.saintAv)}`],
      ['Outlaw\'s Available-crew puck is flagged', marked(before.outlawAv).length >= 1, sum(before.outlawAv)],
    ], [f0])
    /* hide every warning naming each of the four, from Edit Schedule's list */
    await openList(p, S, TUE)
    const hideAll = async id => { const ws = (await warnsOf(p, TUE)).filter(w => w.who.includes(id) && !w.off); for (const w of ws) await tapLine(p, S, TUE, w.ix); return ws.map(w => w.code) }
    const after = {}
    const hr = await hideAll('romeo'); after.rebel = await blk('romeo', /SANS/)
    const hq = await hideAll('nasty'); after.quill = await blk('nasty', /Unavailable/)
    const hs = await hideAll('salsa'); after.saintPI = await blk('salsa', /Personal Inputs/); after.saintAv = await blk('salsa', /Available/)
    const ho = await hideAll('casper'); after.outlawAv = await blk('casper', /Available/)
    const rowsStill = await p.evaluate(() => { const d = document.querySelector('#eWeek .day[data-day="1"]'); const t = s => (d.querySelector(`[data-secmove="1.${s}"]`) || { innerText: '' }).innerText; return { sans: /Rebel/.test(t('sans')), unav: /Quill/.test(t('unav')) && /Local leave/i.test(t('unav')), inputs: /Appointment/i.test(t('inputs')) && /Saint/.test(t('inputs')) } })
    await p.evaluate(() => document.querySelector('#eWeek .day[data-day="1"] [data-secmove="1.inputs"]').scrollIntoView({ block: 'start', inline: 'nearest' })); await L.sleep(300)
    const f1 = await pic(p, '13b-lower-blocks-plain')
    judge('13', `Edit Schedule, Tuesday's list: ✕ on every line naming Rebel (${hr.join()}), Quill (${hq.join()}), Saint (${hs.join()}), Outlaw (${ho.join()})`, [
      ['SANS: Rebel\'s card puck is plain; his card is still there', after.rebel.length >= 1 && marked(after.rebel).length === 0 && rowsStill.sans, sum(after.rebel)],
      ['Unavailable: Quill\'s row puck is plain; the row and his leave are still there', after.quill.length >= 1 && marked(after.quill).length === 0 && rowsStill.unav, sum(after.quill)],
      ['Personal Inputs: Saint\'s puck is plain; his Appointment input is still listed', after.saintPI.length >= 1 && marked(after.saintPI).length === 0 && rowsStill.inputs, sum(after.saintPI)],
      ['Available crew: Saint\'s and Outlaw\'s pucks are plain and still listed', after.saintAv.length >= 1 && marked(after.saintAv).length === 0 && after.outlawAv.length >= 1 && marked(after.outlawAv).length === 0, `${sum(after.saintAv)} | ${sum(after.outlawAv)}`],
    ], [f1])
    /* the same blocks on the board */
    await W.boardOn(p, TUE)
    const bb = { rebel: lit(await pk(p, '#schedBoard', 'romeo')), quill: lit(await pk(p, '#schedBoard', 'nasty')), saint: lit(await pk(p, '#schedBoard', 'salsa')), outlaw: lit(await pk(p, '#schedBoard', 'casper')) }
    await p.evaluate(() => { const e = document.querySelector('#schedBoard .sb-sec[data-secmove="1.avail"]'); if (e) e.scrollIntoView({ block: 'start' }) }); await L.sleep(300)
    const f2 = await pic(p, '13c-board-lower-blocks-plain')
    judge('13 (the board)', 'the board opened on Tuesday: every copy of the four, its lower blocks included', [
      ['no copy of Rebel, Quill, Saint or Outlaw carries a ring or chip', Object.values(bb).every(ps => marked(ps).length === 0), Object.entries(bb).map(([k, v]) => k + ': ' + sum(v)).join(' | ').slice(0, 500)],
      ['the board draws them in its own lower blocks (Available crew / SANS / Unavailable)', bb.rebel.some(x => /SANS/.test(x.where)) && bb.quill.some(x => /Unavailable/.test(x.where)) && bb.saint.some(x => /Available/.test(x.where)), `${[...new Set(Object.values(bb).flat().map(x => x.where))].join(', ')}`],
    ], [f2])
  }, () => pic(p, '13-error'))
  allErrors.push(...errors); await browser.close()
}
console.log('ERRORS', JSON.stringify(allErrors))
if (allErrors.length) row('errors (14-places)', 'the browser\'s error list through this file', allErrors.join(' | ').slice(0, 600), 'FAIL', [])
savePart('14-places', { errors: allErrors })
