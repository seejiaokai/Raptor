/* [WARN-HIDE-KEPT] walker A — scenarios 18 (a man with two severities), 22 (the board's list, both widths), 25 (the two
   lists share one hide; a struck row still lights its crew). Three worlds. */
import { world, openList, readList, tapLine, closeList, boardOpenFold, readBoard, tapBoardLine, pk, marked, sum, judge, row, savePart, pic, guard, L, W, PHONE } from './wh-a-lib.mjs'
const TUE = 1, S = '#eWeek'
const allErrors = []
const saint = async (p, scope = `${S} .day[data-day="1"]`) => pk(p, scope, 'salsa')
const barPaint = p => p.evaluate(() => { const b = document.querySelector('#eWeek .day[data-day="1"] .daywarn'); const c = getComputedStyle(b); return b.className + ' border ' + c.borderTopColor })

/* ---------- 18 ---------- */
{
  const { browser, p, errors } = await world(); p.setDefaultTimeout(8000)
  await guard('18', 'Saint: a clash and an advisory', async () => {
    await L.go(p, 'editsched'); await openList(p, S, TUE)
    const s0 = await saint(p), b0 = await barPaint(p)
    await p.evaluate(() => { const e = document.querySelector('#eWeek .day[data-day="1"] .go .puck[data-person="salsa"]'); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }); await L.sleep(250)
    const f0 = await pic(p, '18a-saint-red')
    /* Outlaw's breach first, so Saint's clash is the day's only red */
    await openList(p, S, TUE); await tapLine(p, S, TUE, 1)
    const b1 = await barPaint(p), l1 = await readList(p, S, TUE)
    await tapLine(p, S, TUE, 0)
    const l2 = await readList(p, S, TUE), b2 = await barPaint(p), s2 = await saint(p)
    await W.showDay(p, TUE); const f1 = await pic(p, '18b-bar-amber')
    await p.evaluate(() => { const e = document.querySelector('#eWeek .day[data-day="1"] .go .puck[data-person="salsa"]'); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }); await L.sleep(250)
    const f2 = await pic(p, '18b-saint-amber')
    judge('18 (clash hidden)', 'Edit Schedule, Tuesday: ✕ on Outlaw\'s crew-rest line, then ✕ on Saint\'s clash (the advisory "no time for the brief" left showing)', [
      ['before: Saint wears the red ring and C on every copy', s0.length >= 2 && s0.every(x => x.ring === 'red' && /C/.test(x.chip)), sum(s0)],
      ['before, and with only Outlaw\'s hidden, the bar is red', /hard/.test(b0) && /hard/.test(b1), `${b0} → ${b1} (${l1.bar})`],
      ['after: every copy of Saint is AMBER — not red, not plain', s2.length >= 2 && s2.every(x => x.ring === 'amber'), sum(s2)],
      ['after: the bar is amber and reads 2 issues with no "warning" count', /adv/.test(b2) && !/hard/.test(b2) && /2 issues/.test(l2.bar) && !/warning/.test(l2.bar), `${b2} | ${l2.bar}`],
    ], [f0, f1, f2])
    await openList(p, S, TUE); await tapLine(p, S, TUE, 2)
    const l3 = await readList(p, S, TUE), b3 = await barPaint(p), s3 = await saint(p), sr = await pk(p, '#eRoster', 'salsa')
    await W.showDay(p, TUE); const f3 = await pic(p, '18c-bar-note-only')
    await p.evaluate(() => { const e = document.querySelector('#eWeek .day[data-day="1"] .go .puck[data-person="salsa"]'); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }); await L.sleep(250)
    const f4 = await pic(p, '18c-saint-plain')
    judge('18 (advisory hidden too)', '✕ on Saint\'s "no time for the brief" as well', [
      ['every copy of Saint is plain (week and the crew list)', marked([...s3, ...sr]).length === 0 && s3.length >= 2, sum([...s3, ...sr])],
      ['the bar is no longer red or amber and reads 1 issue', !/hard|adv/.test(b3.split(' border')[0]) && /1 issue\b/.test(l3.bar), `${b3} | ${l3.bar}`],
    ], [f3, f4])
  }, () => pic(p, '18-error'))
  allErrors.push(...errors); await browser.close()
}

/* ---------- 22 ---------- */
{
  const { browser, p, errors } = await world(); p.setDefaultTimeout(8000)
  await guard('22', 'the board\'s list', async () => {
    await L.go(p, 'editsched'); await W.boardOn(p, TUE); await boardOpenFold(p)
    const b0 = await readBoard(p); const f0 = await pic(p, '22a-board-before')
    /* desktop: drag the splitter between the checks panel and the crew list (make the panel smaller, then bigger) */
    let split = 'phone — no splitter (the panel is a fold)'
    if (!PHONE) {
      const sp = p.locator('#schedBoard .sb-wsplit').first(); const bb = await sp.boundingBox()
      const h0 = await p.evaluate(() => document.querySelector('#sbWarn').getBoundingClientRect().height)
      if (bb) { await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down(); await p.mouse.move(bb.x + bb.width / 2, bb.y - 90, { steps: 6 }); await p.mouse.up(); await L.sleep(300) }
      const h1 = await p.evaluate(() => document.querySelector('#sbWarn').getBoundingClientRect().height)
      split = `panel ${Math.round(h0)}px → ${Math.round(h1)}px`
    }
    const how = await tapBoardLine(p, TUE, 3)
    await boardOpenFold(p)
    const b1 = await readBoard(p); const st = await pk(p, '#schedBoard', 'wolf'); const f1 = await pic(p, '22b-board-fourth-hidden')
    const l3 = b1.lines[3] || {}
    judge('22', `Scheduler Board, Tuesday${PHONE ? ' (the issues fold opened by its heading)' : ' (checks panel resized by its splitter first: ' + split + ')'} → ✕ on the fourth line (${how})`, [
      ['before: the heading counts 4', /4/.test(b0.head), b0.head],
      ['after: the heading counts 3 and says nothing of a hidden one', /3/.test(b1.head) && !/4/.test(b1.head) && !/hidden/i.test(b1.head + b1.other.join(' ')), `${b1.head} | ${b1.other.join(' / ')}`],
      ['still four lines in the same order, the long-day line fourth', b1.lines.length === 4 && /long work day/i.test(l3.text || '') && b1.lines.map(x => x.ix).join() === '0,1,2,3', b1.lines.map(x => x.text.slice(0, 16))],
      ['it is painted struck; the other three are not', l3.struck === true && b1.lines.slice(0, 3).every(x => !x.struck)],
      ['its ↺ is the thing a finger lands on', l3.btn === '↺' && l3.btnTop === true, `${l3.btn} top=${l3.btnTop}`],
      ['Static carries no ring or L anywhere on the board (seat, duty desk, crew list)', st.length >= 2 && marked(st).length === 0, sum(st)],
    ], [f0, f1])
    /* all four hidden */
    for (const ix of [0, 1, 2]) { await tapBoardLine(p, TUE, ix); await boardOpenFold(p) }
    const b2 = await readBoard(p); const f2 = await pic(p, '22c-board-all-hidden')
    let fold = 'desktop — the panel does not fold'; let b3 = b2, f3 = null
    if (PHONE) {
      await p.locator('#schedBoard [data-sbwtog]').first().click(); await L.sleep(300)
      const shut = await readBoard(p); const fShut = await pic(p, '22c-board-all-hidden-fold-shut')
      await p.locator('#schedBoard [data-sbwtog]').first().click(); await L.sleep(300)
      b3 = await readBoard(p); f3 = await pic(p, '22c-board-all-hidden-fold-open-again')
      fold = `shut: ${shut.lines.filter(x => x.shown).length} lines shown; open again: ${b3.lines.filter(x => x.shown).length} (${fShut})`
    } else {
      const sp = p.locator('#schedBoard .sb-wsplit').first(); const bb = await sp.boundingBox()
      if (bb) { await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down(); await p.mouse.move(bb.x + bb.width / 2, bb.y + 160, { steps: 6 }); await p.mouse.up(); await L.sleep(300) }
      b3 = await readBoard(p); f3 = await pic(p, '22c-board-all-hidden-resized')
    }
    const left = []; for (const [cs, id] of [['Saint', 'salsa'], ['Outlaw', 'casper'], ['Static', 'wolf']]) { const m = marked(await pk(p, '#schedBoard', id)); if (m.length) left.push(cs + ': ' + sum(m)) }
    judge('22 (all hidden)', `the other three hidden on the board too; ${PHONE ? 'the fold shut and opened again by its heading' : 'the panel resized again by its splitter'}`, [
      ['the heading reads "No conflicts flagged for Tuesday ✓"', /No conflicts flagged for Tuesday ✓/.test(b2.head), b2.head],
      ['the heading is quiet (not red, not amber)', !/hard|adv/.test(b2.headCls), b2.headCls],
      ['the four struck lines sit under it, in order, each with ↺', b3.lines.length === 4 && b3.lines.every(x => x.struck && x.btn === '↺') && b3.lines.map(x => x.ix).join() === '0,1,2,3'],
      [PHONE ? 'the phone fold still opens (four lines shown), each ↺ topmost' : 'after the resize each ↺ is still the topmost thing at its centre', b3.lines.every(x => x.shown && x.btnTop === true), `${fold} · ${b3.lines.map(x => x.btnTop).join()}`],
      ['Saint, Outlaw and Static are plain everywhere on the board', left.length === 0, left.join(' | ') || 'all plain'],
    ], [f2, f3])
    /* the same count on Edit Schedule */
    await W.boardOff(p); await openList(p, S, TUE); const l = await readList(p, S, TUE); const f4 = await pic(p, '22d-week-after-board-hides')
    judge('22 (agrees with Edit Schedule)', 'the board closed with ✓ Done; Tuesday\'s list on Edit Schedule', [
      ['the week\'s bar reads "✓ No issues" and its four lines are struck, same order', /✓ No issues/.test(l.bar) && l.lines.length === 4 && l.lines.every(x => x.struck), l.bar],
    ], [f4])
  }, () => pic(p, '22-error'))
  allErrors.push(...errors); await browser.close()
}

/* ---------- 25 ---------- */
{
  const { browser, p, errors } = await world(); p.setDefaultTimeout(8000)
  await guard('25', 'one hide, two lists', async () => {
    await L.go(p, 'editsched'); await openList(p, S, TUE)
    /* an OPEN box lights the men its shown lines name; what does it do for a hidden one? */
    const lit0 = { saint: await saint(p), stat: await pk(p, `${S} .day[data-day="1"]`, 'wolf') }
    await tapLine(p, S, TUE, 0)   /* hide Saint's clash on Edit Schedule */
    await tapLine(p, S, TUE, 3)   /* and Static's long day */
    const wk = await readList(p, S, TUE)
    const lit1 = { stat: await pk(p, `${S} .day[data-day="1"]`, 'wolf'), outlaw: await pk(p, `${S} .day[data-day="1"]`, 'casper') }
    const f0 = await pic(p, '25a-week-two-hidden')
    await W.boardOn(p, TUE); await boardOpenFold(p)
    const bd = await readBoard(p); const f1 = await pic(p, '25b-board-shows-same')
    judge('25 (shared)', 'Edit Schedule, Tuesday: ✕ on Saint\'s clash and on Static\'s long day; then the Scheduler Board opened on Tuesday', [
      ['Edit Schedule: lines 1 and 4 struck with ↺, bar 2 issues', wk.lines[0].struck && wk.lines[3].struck && !wk.lines[1].struck && !wk.lines[2].struck && /2 issues/.test(wk.bar), wk.bar],
      ['the board shows the SAME two struck with ↺, the other two live with ✕', bd.lines.length === 4 && bd.lines[0].struck && bd.lines[0].btn === '↺' && bd.lines[3].struck && bd.lines[3].btn === '↺' && !bd.lines[1].struck && bd.lines[1].btn === '✕' && !bd.lines[2].struck, bd.lines.map(x => `${x.struck ? 'struck' : 'live'}${x.btn}`)],
      ['the board\'s heading counts 2', /2/.test(bd.head) && !/4/.test(bd.head), bd.head],
      ['with the week\'s box open, the hidden line\'s man (Static) is NOT lit while a shown line\'s man (Outlaw) is', lit1.stat.every(x => !x.out) && lit1.outlaw.some(x => x.out) && lit0.stat.some(x => x.out), `before Static ${sum(lit0.stat)} | after Static ${sum(lit1.stat)} | Outlaw ${sum(lit1.outlaw)}`],
    ], [f0, f1])
    /* tap the STRUCK row (its words, not its button) on the board */
    const before = await pk(p, '#schedBoard', 'wolf')
    const t = p.locator('#schedBoard .wln[data-wix="3"] .wln-t').first()
    await t.evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(150); await t.click(); await L.sleep(600)
    const after = await pk(p, '#schedBoard', 'wolf')
    const paint = await p.evaluate(() => [...document.querySelectorAll('#schedBoard .puck[data-person="wolf"]')].filter(e => e.offsetParent).map(e => { const c = getComputedStyle(e); const r = e.getBoundingClientRect(); return { cls: e.className, outline: c.outlineStyle + ' ' + c.outlineColor, shadow: c.boxShadow.slice(0, 60), onScreen: r.top >= 0 && r.bottom <= innerHeight } }))
    const stillStruck = (await readBoard(p)).lines[3]
    const f2 = await pic(p, '25c-board-struck-row-tapped')
    judge('25 (a struck row still finds its crew)', 'on the board, a tap on the WORDS of the struck long-day line', [
      ['Static\'s pucks light up (an outline that was not there before the tap)', after.some(x => x.out) && before.every(x => !x.out), `before ${sum(before)} | after ${sum(after)} | ${JSON.stringify(paint).slice(0, 300)}`],
      ['one of his lit pucks is brought on screen', paint.some(x => x.onScreen && !/none/.test(x.outline)), paint.map(x => x.onScreen)],
      ['the line stays struck with ↺ (the tap did not flag it again)', stillStruck.struck && stillStruck.btn === '↺'],
    ], [f2])
    /* ↺ on the board, then back on Edit Schedule */
    await tapBoardLine(p, TUE, 3); await boardOpenFold(p)
    const bd2 = await readBoard(p); const stB = await pk(p, '#schedBoard', 'wolf'); const f3 = await pic(p, '25d-board-flagged-again')
    await W.boardOff(p); await openList(p, S, TUE); const wk2 = await readList(p, S, TUE); const stW = await pk(p, `${S} .day[data-day="1"]`, 'wolf'); const f4 = await pic(p, '25e-week-follows')
    judge('25 (flag again on the other list)', '↺ on that line ON THE BOARD, then the board closed and Edit Schedule\'s list read', [
      ['board: the line is live with ✕, heading counts 3, Static wears the grey ring and L', !bd2.lines[3].struck && bd2.lines[3].btn === '✕' && /3/.test(bd2.head) && marked(stB).length >= 2 && marked(stB).every(x => x.chip === 'L'), `${bd2.head} | ${sum(stB)}`],
      ['Edit Schedule: the same line is live with ✕, bar 3 issues, Saint\'s clash still struck', !wk2.lines[3].struck && wk2.lines[3].btn === '✕' && /3 issues/.test(wk2.bar) && wk2.lines[0].struck, wk2.bar],
      ['Edit Schedule: Static wears the grey ring and L again', marked(stW).length >= 2 && marked(stW).every(x => x.ring === 'grey' && x.chip === 'L'), sum(stW)],
    ], [f3, f4])
  }, () => pic(p, '25-error'))
  allErrors.push(...errors); await browser.close()
}
console.log('ERRORS', JSON.stringify(allErrors))
if (allErrors.length) row('errors (11-board)', 'the browser\'s error list through this file', allErrors.join(' | ').slice(0, 600), 'FAIL', [])
savePart('11-board', { errors: allErrors })
