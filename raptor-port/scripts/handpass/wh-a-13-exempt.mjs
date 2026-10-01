/* [WARN-HIDE-KEPT] walker A — scenarios 19 (the nought-minute line and its time boxes), 8 (an exempt AVALON flying
   seat), 9 (an exempt AVALON duty desk). Fixtures through the app's own controls: a typed landing time, the board's
   "+ Wave" / "+ Block", a seat armed and a man picked from the board's crew list. One world each. */
import { world, openList, readList, tapLine, boardOpenFold, readBoard, tapBoardLine, pk, marked, sum, snap, snapDiff, judge, row, savePart, pic, guard, warnsOf, addWave, addBlock, lineIx, L, W, PHONE } from './wh-a-lib.mjs'
import { handPut } from './seat-lib.mjs'
const S = '#eWeek', TUE = 1
const allErrors = []
const dayScope = di => `${S} .day[data-day="${di}"]`
const bIx = (b, re) => { const l = (b.lines || []).find(x => re.test(x.text)); return l ? l.ix : -1 }

/* ---------- 19, the nought-minute half ---------- */
{
  const { browser, p, errors } = await world(); p.setDefaultTimeout(8000)
  /* the two time boxes of Tuesday's first line, as painted on the week, and the board's own take-off / landing boxes */
  const boxesWeek = () => p.evaluate(() => { const f = document.querySelector('#eWeek .day[data-day="1"] .go .form'); return [...f.querySelectorAll('.fcell.bto, .fcell.ld')].map(c => ({ cell: c.classList.contains('ld') ? 'landing' : 'take-off', flagged: /inset/.test(getComputedStyle(c).boxShadow) && getComputedStyle(c).boxShadow !== 'none', shadow: getComputedStyle(c).boxShadow.slice(0, 44), text: c.innerText.replace(/\s+/g, ' ').trim() })) })
  const boxesBoard = () => p.evaluate(() => ['ff:1.0.0.to', 'ff:1.0.0.ld'].map(k => { const e = document.querySelector(`#schedBoard [data-bfld="${k}"]`); if (!e) return { k, none: true }; const c = getComputedStyle(e); const w = getComputedStyle(e.parentElement); return { k, val: e.value, flagged: /229, 168, 59|240, 85, 95/.test(c.borderTopColor) || /inset/.test(c.boxShadow), border: c.borderTopColor, shadow: c.boxShadow.slice(0, 44) } }))
  await guard('19-nought', 'a nought-minute line', async () => {
    await L.go(p, 'editsched'); await W.showDay(p, TUE)
    const clean = await boxesWeek()
    await W.weekText(p, 'ff:1.0.0.ld', '08:40')
    await openList(p, S, TUE); const l0 = await readList(p, S, TUE); const ix = lineIx(l0, /takes off and lands at the same time/)
    const w0 = (await warnsOf(p, TUE)).find(w => w.code === 'FLT_NO_LEN') || {}
    const b0 = await boxesWeek()
    await p.evaluate(() => document.querySelector('#eWeek .day[data-day="1"] .go .form').scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(250)
    const f0 = await pic(p, '19n-a-week-boxes-flagged')
    await W.boardOn(p, TUE); await boardOpenFold(p); const bb0 = await boxesBoard(); const bd0 = await readBoard(p)
    await p.evaluate(() => { const e = document.querySelector('#schedBoard [data-bfld="ff:1.0.0.to"]'); if (e) e.scrollIntoView({ block: 'center' }) }); await L.sleep(250)
    const f0b = await pic(p, '19n-a-board-flagged')
    judge('19 (nought-minute, set up)', 'Edit Schedule, Tuesday: the first line\'s landing time typed the same as its take-off (08:40)', [
      ['a new line "VL takes off and lands at the same time (08:40)" that names no man', ix >= 0 && Array.isArray(w0.who) && w0.who.length === 0, `${l0.bar} · who ${JSON.stringify(w0.who)}`],
      ['the bar rose to 5 issues', /5 issues/.test(l0.bar), l0.bar],
      ['both of that line\'s time boxes are drawn flagged on the week (they were not before)', b0.every(x => x.flagged) && clean.every(x => !x.flagged), JSON.stringify(b0)],
    ], [f0, f0b])
    /* hide it — on Edit Schedule */
    await W.boardOff(p); await openList(p, S, TUE); const how = await tapLine(p, S, TUE, ix)
    const l1 = await readList(p, S, TUE); const b1 = await boxesWeek(); const f1 = await pic(p, '19n-b-week-list-hidden')
    await p.evaluate(() => document.querySelector('#eWeek .day[data-day="1"] .go .form').scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(250)
    const f2 = await pic(p, '19n-b-week-boxes-gone')
    await W.boardOn(p, TUE); await boardOpenFold(p); const bb1 = await boxesBoard(); const bd1 = await readBoard(p)
    await p.evaluate(() => { const e = document.querySelector('#schedBoard [data-bfld="ff:1.0.0.to"]'); if (e) e.scrollIntoView({ block: 'center' }) }); await L.sleep(250)
    const f3 = await pic(p, '19n-b-board-hidden')
    const li = l1.lines.find(x => x.ix === ix) || {}, bi = bd1.lines.find(x => x.ix === ix) || {}
    judge('19 (nought-minute, hidden)', `✕ on that line in Edit Schedule's list (${how}); then the board opened on Tuesday`, [
      ['the bar fell back to 4 issues; the line stays in place, struck, with a reachable ↺', /4 issues/.test(l1.bar) && li.struck && li.btn === '↺' && li.btnTop === true && l1.lines.length === l0.lines.length, l1.bar],
      ['BOTH time boxes lose their flag on the week — not one, both', b1.every(x => !x.flagged), JSON.stringify(b1)],
      ['the times themselves are untouched (08:40 take-off, 08:40 landing)', b1.find(x => x.cell === 'landing').text === '08:40' && /08:40/.test(b1.find(x => x.cell === 'take-off').text), b1.map(x => x.text)],
      ['the board lists the same line struck with ↺ and counts 4', bi.struck && bi.btn === '↺' && /4 issues/.test(bd1.head), bd1.head],
      ['the board\'s own take-off and landing boxes were both drawn flagged before the hide, and neither is now', bb0.every(x => x.flagged) && bb1.every(x => !x.flagged), `before ${bb0.map(x => x.flagged + ' ' + x.border).join(' / ')} | after ${bb1.map(x => x.flagged + ' ' + x.border).join(' / ')}`],
    ], [f1, f2, f3])
    /* flag it again — on the board */
    const how2 = await tapBoardLine(p, TUE, ix); await boardOpenFold(p); const bd2 = await readBoard(p); const bb2 = await boxesBoard()
    await W.boardOff(p); const b2 = await boxesWeek()
    await p.evaluate(() => document.querySelector('#eWeek .day[data-day="1"] .go .form').scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(250)
    const f4 = await pic(p, '19n-c-week-boxes-back')
    await openList(p, S, TUE); const l2 = await readList(p, S, TUE)
    judge('19 (nought-minute, flagged again)', `↺ on the board's struck line (${how2}); the board closed`, [
      ['the board counts 5 again, the line live with ✕', /5 issues/.test(bd2.head) && !(bd2.lines.find(x => x.ix === ix) || {}).struck, bd2.head],
      ['the board\'s take-off and landing boxes are flagged again', bb2.every(x => x.flagged), bb2.map(x => x.flagged + ' ' + x.border).join(' / ')],
      ['both time boxes are flagged again on the week', b2.every(x => x.flagged), JSON.stringify(b2)],
      ['Edit Schedule\'s bar reads 5 issues', /5 issues/.test(l2.bar), l2.bar],
    ], [f4])
  }, () => pic(p, '19n-error'))
  allErrors.push(...errors); await browser.close()
}

/* ---------- 8 ---------- */
{
  const { browser, p, errors } = await world(); p.setDefaultTimeout(8000)
  const grit = async scope => pk(p, scope, 'sufa')
  const at = (ps, re) => ps.filter(x => re.test(x.slot) || re.test(x.where))
  await guard('8', 'an exempt AVALON flying seat', async () => {
    await L.go(p, 'editsched'); await W.boardOn(p, TUE)
    const aw = await addWave(p, TUE, 'AVALON')
    const seat = await p.evaluate(() => { const g = [...document.querySelectorAll('#schedBoard .sb-go')].pop(); const s = g.querySelector('[data-slot$=".0.p"]'); return s ? s.dataset.slot : null })
    const put1 = await handPut(p, seat, 'sufa')
    const put2 = await handPut(p, 'g:1.0.+', 'sufa')
    await boardOpenFold(p)
    const w0 = (await warnsOf(p, TUE)).filter(w => w.who.includes('sufa'))
    const b0 = await readBoard(p); const g0 = await grit('#schedBoard')
    await p.evaluate(k => { const e = document.querySelector(`#schedBoard [data-slot="${k}"]`); if (e) e.scrollIntoView({ block: 'center' }) }, seat); await L.sleep(250)
    const f0 = await pic(p, '8a-board-avalon-grit-flagged')
    const own = w0.filter(w => w.key === seat), other = w0.filter(w => w.key !== seat)
    judge('8 (set up)', `Scheduler Board, Tuesday: "+ Wave" → AVALON (${aw}); its first FCP armed and Grit picked from the crew list (${put1.took ? 'seated' : 'NOT seated'}: "${(put1.msg || '').slice(0, 70)}"); Grit also added to the first ground item (${put2.took ? 'added' : 'NOT added'}) — he is medically down all week and a WSO`, [
      ['the AVALON seat raises several warnings of its own', own.length >= 2, own.map(w => w.code + ' ' + w.msg.slice(0, 40)).join(' | ')],
      ['he carries another warning elsewhere (the ground item)', other.length >= 1, other.map(w => w.code + '@' + w.key + ' ' + w.msg.slice(0, 40)).join(' | ')],
      ['his AVALON copy and his ground copy are both ringed red', at(g0, /^1\.2\./).some(x => x.ring === 'red') && at(g0, /^g:/).some(x => x.ring === 'red'), sum(g0)],
    ], [f0])
    /* hide ONE of the seat's own */
    const one = bIx(b0, /cannot fly FCP/)
    const h1 = await tapBoardLine(p, TUE, one); await boardOpenFold(p)
    const g1 = await grit('#schedBoard'); const b1 = await readBoard(p)
    await p.evaluate(k => { const e = document.querySelector(`#schedBoard [data-slot="${k}"]`); if (e) e.scrollIntoView({ block: 'center' }) }, seat); await L.sleep(250)
    const f1 = await pic(p, '8b-board-one-hidden')
    judge('8 (one of its own hidden)', `on the board: ✕ on "Grit is a WSO — cannot fly FCP (AVALON NIGHT MAIN)" (${h1})`, [
      ['the AVALON copy is still ringed red by the seat\'s other warnings', at(g1, /^1\.2\./).some(x => x.ring === 'red'), sum(at(g1, /^1\.2\./))],
      ['the heading fell by one', +(/(\d+) issues/.exec(b1.head) || [])[1] === +(/(\d+) issues/.exec(b0.head) || [])[1] - 1, `${b0.head} → ${b1.head}`],
    ], [f1])
    /* hide the rest of the seat's own */
    const rest = b1.lines.filter(l => !l.struck && /Grit/.test(l.text) && /AVALON/.test(l.text)).map(l => l.ix)
    for (const ix of rest) { await tapBoardLine(p, TUE, ix); await boardOpenFold(p) }
    const g2 = await grit('#schedBoard'); const b2 = await readBoard(p)
    await p.evaluate(k => { const e = document.querySelector(`#schedBoard [data-slot="${k}"]`); if (e) e.scrollIntoView({ block: 'center' }) }, seat); await L.sleep(250)
    const f2 = await pic(p, '8c-board-avalon-copy-plain')
    await p.evaluate(() => { const e = document.querySelector('#schedBoard [data-fill="g:1.0.+"]'); if (e) e.scrollIntoView({ block: 'center' }) }); await L.sleep(250)
    const f2b = await pic(p, '8c-board-ground-copy-still-red')
    await W.boardOff(p); const gw = await grit(dayScope(TUE)); const gr = await grit('#eRoster')
    await p.evaluate(k => { const e = document.querySelector(`#eWeek [data-slot="${k}"]`) || document.querySelector('#eWeek .day[data-day="1"] .go:last-of-type'); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }, seat); await L.sleep(250)
    const f3 = await pic(p, '8d-week-avalon-copy-plain')
    const stillLive = b2.lines.filter(l => !l.struck && /Grit/.test(l.text)).map(l => l.text.slice(0, 50))
    judge('8 (all of its own hidden — Edit Schedule)', `on the board: ✕ on every remaining line anchored to the AVALON seat (${rest.length} more); the board closed; Edit Schedule read`, [
      ['the AVALON copy is PLAIN — no ring, no chip', at(gw, /^1\.2\./).length >= 1 && marked(at(gw, /^1\.2\./)).length === 0, sum(at(gw, /^1\.2\./))],
      ['the ground copy is still ringed red (its own warning is still shown)', at(gw, /^g:/).some(x => x.ring === 'red') && stillLive.length >= 1, `${sum(at(gw, /^g:/))} · live: ${stillLive.join(' | ')}`],
      ['every other copy of him (crew list, Unavailable row) follows the warning still shown — ringed red', marked([...gr, ...at(gw, /Unavailable/)]).every(x => x.ring === 'red') && marked([...gr, ...at(gw, /Unavailable/)]).length >= 1, sum([...gr, ...at(gw, /Unavailable/)])],
    ], [f3])
    judge('8 (all of its own hidden — the board)', 'the same moment, read on the board before it was closed', [
      ['the AVALON copy is PLAIN — no ring, no chip', at(g2, /^1\.2\./).length >= 1 && marked(at(g2, /^1\.2\./)).length === 0, sum(at(g2, /^1\.2\./)) + ' (the three AVALON lines are struck; the only live line naming him is the one on the ground item)'],
      ['his ground copy is still ringed red', at(g2, /^g:/).some(x => x.ring === 'red'), sum(at(g2, /^g:/))],
    ], [f2, f2b])
    /* flag one again from Edit Schedule */
    await openList(p, S, TUE); const l3 = await readList(p, S, TUE); const back = lineIx({ lines: l3.lines.filter(l => l.struck) }, /SC NIGHT currency|ATT C but on AVALON/)
    const h3 = await tapLine(p, S, TUE, back); const gw3 = await grit(dayScope(TUE))
    await p.evaluate(k => { const e = document.querySelector(`#eWeek [data-slot="${k}"]`); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }, seat); await L.sleep(250)
    const f4 = await pic(p, '8e-week-avalon-copy-red-again')
    judge('8 (flag one again)', `Edit Schedule: ↺ on one of the seat's struck lines (${h3})`, [
      ['the AVALON copy is ringed red again', at(gw3, /^1\.2\./).some(x => x.ring === 'red'), sum(at(gw3, /^1\.2\./))],
    ], [f4])
    /* hide every line naming him, on the board: is anything left on the AVALON copy? */
    await W.boardOn(p, TUE); await boardOpenFold(p)
    for (let i = 0; i < 6; i++) { const b = await readBoard(p); const l = b.lines.find(x => !x.struck && /Grit/.test(x.text)); if (!l) break; await tapBoardLine(p, TUE, l.ix); await boardOpenFold(p) }
    const g5 = await grit('#schedBoard')
    await p.evaluate(k => { const e = document.querySelector(`#schedBoard [data-slot="${k}"]`); if (e) e.scrollIntoView({ block: 'center' }) }, seat); await L.sleep(250)
    const f5 = await pic(p, '8f-board-every-grit-line-hidden')
    judge('8 (every warning naming him hidden — the board)', 'on the board: ✕ on every line still naming Grit, the one on the ground item included', [
      ['every copy of him on the board is plain, the AVALON copy too', g5.length >= 3 && marked(g5).length === 0, sum(g5)],
    ], [f5])
  }, () => pic(p, '8-error'))
  allErrors.push(...errors); await browser.close()
}

/* ---------- 8, the baseline: nothing hidden ---------- */
{
  const { browser, p, errors } = await world(); p.setDefaultTimeout(8000)
  await guard('8-baseline', 'an AVALON seat with nothing hidden', async () => {
    await L.go(p, 'editsched'); await W.boardOn(p, TUE); await addWave(p, TUE, 'AVALON')
    const seat = await p.evaluate(() => { const g = [...document.querySelectorAll('#schedBoard .sb-go')].pop(); const s = g.querySelector('[data-slot$=".0.p"]'); return s ? s.dataset.slot : null })
    const put = await handPut(p, seat, 'salsa')   /* Saint: SC-night current, fit — the AVALON seat raises nothing for him; he has a clash elsewhere on Tuesday */
    const own = (await warnsOf(p, TUE)).filter(w => w.who.includes('salsa') && w.key === seat)
    const gb = await pk(p, '#schedBoard', 'salsa')
    await p.evaluate(k => { const e = document.querySelector(`#schedBoard [data-slot="${k}"]`); if (e) e.scrollIntoView({ block: 'center' }) }, seat); await L.sleep(250)
    const f0 = await pic(p, '8x-baseline-board-saint-on-avalon')
    await W.boardOff(p); const gw = await pk(p, dayScope(TUE), 'salsa')
    await p.evaluate(k => { const e = document.querySelector(`#eWeek [data-slot="${k}"]`); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }, seat); await L.sleep(250)
    const f1 = await pic(p, '8x-baseline-week-saint-on-avalon')
    const sb = gb.filter(x => x.slot === seat), sw = gw.filter(x => x.slot === seat)
    row('8 (baseline — NOTHING hidden)', `a fresh world: "+ Wave" → AVALON; Saint picked onto its first FCP (${put.took ? 'seated' : 'NOT seated'}) — the seat raises ${own.length} warning(s) of its own for him; he has a clash elsewhere on Tuesday`,
      `the BOARD draws his AVALON copy ${sum(sb) || '(not found)'}; EDIT SCHEDULE draws the same seat ${sum(sw) || '(not found)'}. So with nothing hidden the board already rings an AVALON seat with the man's flags from elsewhere and the week does not.`, 'INFO (baseline for finding 1)', [f0, f1])
  }, () => pic(p, '8x-error'))
  allErrors.push(...errors); await browser.close()
}

/* ---------- 9 ---------- */
{
  const { browser, p, errors } = await world(); p.setDefaultTimeout(8000)
  const grit = async scope => pk(p, scope, 'sufa')
  const at = (ps, re) => ps.filter(x => re.test(x.slot) || re.test(x.where))
  await guard('9', 'an exempt AVALON duty desk', async () => {
    await L.go(p, 'editsched'); await W.boardOn(p, TUE)
    const ab = await addBlock(p, TUE, 'AVALON')
    const desk = await p.evaluate(() => { const f = [...document.querySelectorAll('#schedBoard .sb-panel.duty [data-fill]')].map(e => e.dataset.fill); const blocks = [...new Set(f.map(x => x.split('.')[1]))]; const last = blocks[blocks.length - 1]; return f.find(x => x.startsWith(`d:1.${last}.`)) })
    const put1 = await handPut(p, desk, 'sufa')
    /* a normal flying seat for him too: "+" adds a third aircraft to RU BFM; its rear seat is armed and Grit picked */
    const plus = p.locator('#schedBoard [data-lac="1.0.1"]').first(); await plus.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(150); await plus.click(); await L.sleep(600)
    const fly = await p.evaluate(() => { const s = [...document.querySelectorAll('#schedBoard [data-slot^="1.0.1."]')].map(e => e.dataset.slot).filter(k => k.endsWith('.w')); return s[s.length - 1] })
    const put2 = await handPut(p, fly, 'sufa')
    await boardOpenFold(p)
    const w0 = (await warnsOf(p, TUE)).filter(w => w.who.includes('sufa'))
    const dk = desk.replace(/\.\+$/, '')
    const b0 = await readBoard(p); const g0 = await grit('#schedBoard')
    await p.evaluate(k => { const e = document.querySelector(`#schedBoard [data-fill="${k}"]`); if (e) e.scrollIntoView({ block: 'center' }) }, desk); await L.sleep(250)
    const f0 = await pic(p, '9a-board-avalon-desk-flagged')
    const own = w0.filter(w => w.key === dk), other = w0.filter(w => w.key !== dk)
    judge('9 (set up)', `Scheduler Board, Tuesday: "+ Block" → AVALON (${ab}); its first desk armed and Grit picked (${put1.took ? 'seated' : 'NOT seated'}); Grit also put in the rear seat of a third aircraft added to RU BFM with its "+" (${fly}: ${put2.took ? 'seated' : 'NOT seated: ' + (put2.msg || '')})`, [
      ['the desk raises its own availability warning', own.length >= 1, own.map(w => w.code + ' ' + w.msg.slice(0, 50)).join(' | ')],
      ['he is separately flagged on the flying line', other.some(w => /^1\.0\.1\./.test(w.key)), other.map(w => w.code + '@' + w.key).join(' | ')],
      ['desk copy red C; flying copy red', at(g0, /^d:/).some(x => x.ring === 'red' && /C/.test(x.chip)) && at(g0, /^1\.0\.1\./).some(x => x.ring === 'red'), sum(g0)],
    ], [f0])
    const ix = bIx(b0, /ATT C but on \w+.*duty/)
    const h1 = await tapBoardLine(p, TUE, ix); await boardOpenFold(p)
    const g1 = await grit('#schedBoard'); const b1 = await readBoard(p)
    await p.evaluate(k => { const e = document.querySelector(`#schedBoard [data-fill="${k}"]`); if (e) e.scrollIntoView({ block: 'center' }) }, desk); await L.sleep(250)
    const f1 = await pic(p, '9b-board-desk-plain')
    await W.boardOff(p); const gw = await grit(dayScope(TUE))
    await p.evaluate(() => { const e = [...document.querySelectorAll('#eWeek .day[data-day="1"] .sec-duty .puck[data-person="sufa"]')][0]; if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }); await L.sleep(250)
    const f2 = await pic(p, '9c-week-desk-plain')
    await p.evaluate(() => { const e = [...document.querySelectorAll('#eWeek .day[data-day="1"] .go .puck[data-person="sufa"]')][0]; if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }); await L.sleep(250)
    const f3 = await pic(p, '9c-week-flying-still-red')
    const deskLeft = (await warnsOf(p, TUE)).filter(w => w.who.includes('sufa') && w.key === dk && !w.off)
    judge('9', `on the board: ✕ on "Grit — ATT C but on SXO duty — medically down" (${h1}); then the board closed and Edit Schedule read`, [
      ['board: the desk\'s red ring and C are gone' + (deskLeft.length ? ' (the desk still has another shown warning of its own: ' + deskLeft.map(w => w.code).join() + ')' : ''), deskLeft.length ? true : at(g1, /^d:/).length >= 1 && marked(at(g1, /^d:/)).length === 0, sum(at(g1, /^d:/))],
      ['board: his flying-line copy is still ringed red', at(g1, /^1\.0\.1\./).some(x => x.ring === 'red'), sum(at(g1, /^1\.0\.1\./))],
      ['Edit Schedule: the desk copy is plain', deskLeft.length ? true : at(gw, /^d:|duty/).length >= 1 && marked(at(gw, /^d:|duty/)).length === 0, sum(at(gw, /^d:|duty/))],
      ['Edit Schedule: the flying-line copy is still ringed red — week and board agree', at(gw, /^1\.0\.1\./).some(x => x.ring === 'red'), sum(at(gw, /^1\.0\.1\./))],
      ['the line is struck on the board, the heading one lower', (b1.lines.find(l => l.ix === ix) || {}).struck && +(/(\d+) issues/.exec(b1.head) || [])[1] === +(/(\d+) issues/.exec(b0.head) || [])[1] - 1, `${b0.head} → ${b1.head}`],
    ], [f1, f2, f3])
    row('9 (what he carried)', 'for the record: every warning naming Grit after the set-up', w0.map(w => `${w.code}@${w.key}: ${w.msg.slice(0, 60)}`).join(' | '), 'INFO', [])
  }, () => pic(p, '9-error'))
  allErrors.push(...errors); await browser.close()
}
console.log('ERRORS', JSON.stringify(allErrors))
if (allErrors.length) row('errors (13-exempt)', 'the browser\'s error list through this file', allErrors.join(' | ').slice(0, 600), 'FAIL', [])
savePart('13-exempt', { errors: allErrors })
