/* [WARN-HIDE-KEPT] walker A — kinds of warning on the demo week: scenarios 2 ("also flagged on" with a man focused),
   15 (a crew-pairing line naming two), 16 (the double-turn line naming several), 17 (the same-day tight turn's own
   chip), 19 — its OIL half (a reminder that names nobody). One world each. */
import { world, openList, readList, tapLine, boardOpenFold, readBoard, tapBoardLine, pk, marked, sum, snap, snapDiff, insights, judge, row, savePart, pic, guard, warnsOf, L, W, PHONE } from './wh-a-lib.mjs'
const S = '#eWeek', MON = 0, WED = 2, THU = 3, SAT = 5, SUN = 6
const allErrors = []
const dayScope = di => `${S} .day[data-day="${di}"]`

/* ---------- 2 ---------- */
{
  const { browser, p, errors } = await world(); p.setDefaultTimeout(8000)
  await guard('2', '"also flagged on" with Gambit focused', async () => {
    await L.go(p, 'editsched'); await W.showDay(p, WED)
    const focus = () => p.evaluate(() => ({ open: [...document.querySelectorAll('#eWeek [data-dwbox].open')].map(b => +b.dataset.dwbox), echo: [...document.querySelectorAll('#eWeek .dwecho')].filter(e => e.offsetParent !== null).map(e => e.closest('[data-dwbox]').dataset.dwbox + ': ' + e.innerText.trim()), sel: [...document.querySelectorAll('#eWeek .puck.sel[data-person="bruise"]')].length }))
    const tapPuck = async () => { const g = p.locator(`${dayScope(WED)} .go .puck[data-person="bruise"]`).first(); await g.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(200); await g.click(); await L.sleep(700) }
    const tapOn = async di => { const g = p.locator(`${dayScope(di)} .go .puck[data-person="bruise"]`).first(); await g.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(200); await g.click(); await L.sleep(700) }
    /* drop the selection the way the app does it — a second tap on the selected man — and shut every open box by its bar */
    const clear = async di => { if ((await focus()).sel > 0) await tapOn(di); for (const d of (await focus()).open) { await W.showDay(p, d); await p.locator(`${dayScope(d)} [data-daywarn="${d}"]`).first().click(); await L.sleep(300) } return focus() }
    /* baseline, before any hide: what does a tap on a CLEAN puck of his do? (Tuesday — he flies, unflagged) */
    await W.showDay(p, 1); await tapOn(1)
    const base = await focus(); const fbase = await pic(p, '2-baseline-clean-tuesday-puck-tapped')
    const cleared = await clear(1)
    await W.showDay(p, WED)
    await tapPuck()
    const f1 = await focus(); const wed1 = await readList(p, S, WED); const mon1 = await readList(p, S, MON)
    await W.showDay(p, MON); const fa = await pic(p, '2a-gambit-focused-monday-box'); await W.showDay(p, WED); const fb = await pic(p, '2a-gambit-focused-wednesday-box')
    judge('2 (start)', 'Edit Schedule: a tap on Gambit\'s puck on Wednesday\'s VL ACM line (he is flagged Monday and Wednesday, one warning each)', [
      ['Monday\'s and Wednesday\'s boxes open', f1.open.includes(0) && f1.open.includes(2), f1.open],
      ['Monday\'s box says "Gambit is also flagged on Wed", Wednesday\'s says "… on Mon"', f1.echo.some(e => /^0: Gambit is also flagged on Wed/.test(e)) && f1.echo.some(e => /^2: Gambit is also flagged on Mon/.test(e)), f1.echo],
    ], [fa, fb])
    const ixW = wed1.lines.find(l => /Gambit/.test(l.text)).ix
    const how = await tapLine(p, S, WED, ixW)
    const f2 = await focus(); const wed2 = await readList(p, S, WED); const gW = await pk(p, dayScope(WED), 'bruise')
    await W.showDay(p, MON); const fc = await pic(p, '2b-after-hide-monday-box'); await W.showDay(p, WED); const fd = await pic(p, '2b-after-hide-wednesday')
    judge('2 (hide)', `without clearing the selection: ✕ on Wednesday's only line naming him (${how})`, [
      ['he is still the selected man', f2.sel > 0, f2.sel],
      ['Monday\'s box NO LONGER says he is also flagged on Wed — at once', !f2.echo.some(e => /^0: .*Wed/.test(e)), f2.echo.join(' | ') || '(no echo line)'],
      ['his Wednesday pucks are clean (no ring, no chip)', marked(gW.map(x => ({ ...x, out: '' }))).length === 0 && gW.length >= 1, sum(gW)],
      ['Wednesday\'s list, where it is open, shows his line struck with ↺', (wed2.lines.find(l => /Gambit/.test(l.text)) || {}).struck === true && (wed2.lines.find(l => /Gambit/.test(l.text)) || {}).btn === '↺', JSON.stringify(wed2.lines.map(l => [l.text.slice(0, 30), l.struck, l.btn])).slice(0, 200) + ' open=' + f2.open],
    ], [fc, fd])
    /* ↺, the selection still held */
    let how2 = 'the ↺ was not on screen'
    if ((wed2.lines.find(l => /Gambit/.test(l.text)) || {}).btn === '↺') how2 = await tapLine(p, S, WED, ixW)
    const f3 = await focus()
    await W.showDay(p, MON); const fe = await pic(p, '2c-after-flag-again-monday-box')
    judge('2 (flag again)', `without clearing the selection: ↺ on that line (${how2})`, [
      ['Monday\'s box says "also flagged on Wed" again — at once', f3.echo.some(e => /^0: Gambit is also flagged on Wed/.test(e)), f3.echo.join(' | ') || '(no echo line)'],
      ['Wednesday\'s box says "also flagged on Mon"', f3.echo.some(e => /^2: Gambit is also flagged on Mon/.test(e)), f3.echo],
    ], [fe])
    /* hide again, drop the selection (Escape), tap his clean Wednesday puck afresh */
    await tapLine(p, S, WED, ixW)
    const f4 = await clear(WED)
    await W.showDay(p, WED); await tapPuck()
    const f5 = await focus(); const ff = await pic(p, '2d-clean-puck-tapped')
    await W.showDay(p, MON); const fg = await pic(p, '2d-clean-puck-tapped-monday')
    await clear(WED)
    await openList(p, S, WED); const wed5 = await readList(p, S, WED); const fh = await pic(p, '2e-wednesday-list-opened-directly')
    judge('2 (the clean puck)', 'hidden again; the selection dropped (a second tap on him) and the open boxes shut by their bars; then a fresh tap on his clean Wednesday puck; then Wednesday\'s list opened by its own bar', [
      ['the tap does NOT open Wednesday', !f5.open.includes(2), `open ${JSON.stringify(f5.open)} sel ${f5.sel} (before the tap: open ${JSON.stringify(f4.open)} sel ${f4.sel})`],
      ['it does what a tap on his clean Tuesday puck did before any hide (the baseline)', JSON.stringify(f5.open.filter(x => x !== 2)) === JSON.stringify(base.open.filter(x => x !== 2)) || f5.open.includes(0), `baseline (clean Tuesday puck, nothing hidden) opened ${JSON.stringify(base.open)} echo ${JSON.stringify(base.echo)}; now ${JSON.stringify(f5.open)} (${fbase})`],
      ['no box says he is "also flagged on Wed"', !f5.echo.some(e => /Wed/.test(e)), f5.echo.join(' | ') || '(no echo line)'],
      ['opened directly, Wednesday\'s list still shows his line, struck', (wed5.lines.find(l => /Gambit/.test(l.text)) || {}).struck === true, wed5.bar],
    ], [ff, fg, fh])
  }, () => pic(p, '2-error'))
  allErrors.push(...errors); await browser.close()
}

/* ---------- 15 ---------- */
{
  const { browser, p, errors } = await world(); p.setDefaultTimeout(8000)
  await guard('15', 'a crew-pairing warning names two', async () => {
    await L.go(p, 'editsched'); await openList(p, S, THU)
    const l0 = await readList(p, S, THU); const ix = l0.lines.find(l => /Illegal aircrew combination/.test(l.text)).ix
    const s0 = await snap(p, dayScope(THU))
    await p.evaluate(() => { const e = document.querySelector('#eWeek .day[data-day="3"] .go .puck[data-person="bapster"]'); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }); await L.sleep(250)
    const f0 = await pic(p, '15a-thu-pair-before')
    await openList(p, S, THU); await tapLine(p, S, THU, ix)
    const l1 = await readList(p, S, THU); const s1 = await snap(p, dayScope(THU)); const d = snapDiff(s0, s1)
    const f1 = await pic(p, '15b-thu-list-pair-hidden')
    await p.evaluate(() => { const e = document.querySelector('#eWeek .day[data-day="3"] .go .puck[data-person="bapster"]'); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }); await L.sleep(250)
    const f2 = await pic(p, '15b-thu-pair-after')
    const li = l1.lines.find(l => l.ix === ix)
    judge('15', 'Edit Schedule, Thursday: ✕ on "OCU pilot Wildcard with CAT D WSO Pixel — not an authorised combination" (it names both)', [
      ['before: both Wildcard and Pixel are flagged for it', !!s0.bapster && !!s0.badger, `Wildcard ${s0.bapster} | Pixel ${s0.badger}`],
      ['after: BOTH are plain on every copy', !s1.bapster && !s1.badger, `Wildcard ${s1.bapster || 'plain'} | Pixel ${s1.badger || 'plain'}`],
      ['nobody else on Thursday changed', Object.keys(d).every(k => k === 'bapster' || k === 'badger'), JSON.stringify(d).slice(0, 300)],
      ['the struck line still names both', li.struck && /Wildcard/.test(li.text) && /Pixel/.test(li.text), li.text],
      ['the bar fell from 6 issues to 5', /6 issues/.test(l0.bar) && /5 issues/.test(l1.bar), `${l0.bar} → ${l1.bar}`],
    ], [f0, f1, f2])
    /* Wednesday: Nomad + Pixel need CO approval; Nomad also has a hard input clash of his own */
    await openList(p, S, WED); const w0 = await readList(p, S, WED); const wix = w0.lines.find(l => /Nomad/.test(l.text) && /CO approval/.test(l.text)).ix
    const t0 = await snap(p, dayScope(WED)); await tapLine(p, S, WED, wix); const t1 = await snap(p, dayScope(WED)); const td = snapDiff(t0, t1)
    await p.evaluate(() => { const e = document.querySelector('#eWeek .day[data-day="2"] .go .puck[data-person="pike"]'); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }); await L.sleep(250)
    const f3 = await pic(p, '15c-wed-nomad-keeps-his-own')
    judge('15 (an unrelated warning stays)', 'Wednesday: ✕ on "CAT C pilot Nomad with CAT D WSO Pixel … CO approval required" (Nomad also carries his own hard clash with an input)', [
      ['Pixel becomes plain', !t1.badger && !!t0.badger, `${t0.badger} → ${t1.badger || 'plain'}`],
      ['Nomad keeps the red ring of his own warning', !!t1.pike && t1.pike.every(x => /:red\//.test(x)), `${t0.pike} → ${t1.pike}`],
      ['the other pair (Kraken + Otter) is untouched', !td.krait && !td.wrangler && !!t1.krait, `${t1.krait}`],
      ['nobody else on Wednesday changed', Object.keys(td).every(k => k === 'pike' || k === 'badger'), JSON.stringify(td).slice(0, 300)],
    ], [f3])
  }, () => pic(p, '15-error'))
  allErrors.push(...errors); await browser.close()
}

/* ---------- 16 + 17 (same-day half) ---------- */
{
  const { browser, p, errors } = await world(); p.setDefaultTimeout(8000)
  await guard('16', 'the double-turn line names four', async () => {
    await L.go(p, 'editsched'); await openList(p, S, MON)
    const l0 = await readList(p, S, MON); const ix = l0.lines.find(l => /double turning/.test(l.text)).ix
    const s0 = await snap(p, dayScope(MON)); const r0 = await snap(p, '#eRoster')
    await p.evaluate(() => { const e = document.querySelector('#eWeek .day[data-day="0"] .go .puck[data-person="freak"]'); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }); await L.sleep(250)
    const f0 = await pic(p, '16a-mon-dt-before')
    await openList(p, S, MON); await tapLine(p, S, MON, ix)
    const l1 = await readList(p, S, MON); const s1 = await snap(p, dayScope(MON)); const r1 = await snap(p, '#eRoster'); const d = snapDiff(s0, s1)
    await p.evaluate(() => { const e = document.querySelector('#eWeek .day[data-day="0"] .go .puck[data-person="freak"]'); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }); await L.sleep(250)
    const f1 = await pic(p, '16b-mon-dt-after')
    const four = ['stiff', 'freak', 'pump', 'dirty']
    const dt = s => four.filter(id => (s[id] || []).some(x => /DT/.test(x)))
    judge('16', 'Edit Schedule, Monday: ✕ on "4 people are double turning: Saber, Echo, Piston, Relay"', [
      ['before: a DT chip is drawn for the men it names (those not already wearing a stronger mark)', dt(s0).length >= 2, `DT on ${dt(s0).join(', ')} | Saber ${s0.stiff} | Echo ${s0.freak} | Piston ${s0.pump} | Relay ${s0.dirty}`],
      ['after: no DT chip on any of the four — week', dt(s1).length === 0, `Saber ${s1.stiff || 'plain'} | Echo ${s1.freak || 'plain'} | Piston ${s1.pump || 'plain'} | Relay ${s1.dirty || 'plain'}`],
      ['after: no DT chip on any of the four — the crew list beside the week', four.every(id => !(r1[id] || []).some(x => /DT/.test(x))), four.map(id => `${id}: ${r0[id] || 'plain'} → ${r1[id] || 'plain'}`).join(' | ')],
      ['Saber and Piston keep their other flags (red C)', (s1.stiff || []).some(x => /red\/C/.test(x)) && (s1.pump || []).some(x => /red\/C/.test(x))],
      ['no man it does NOT name changed', Object.keys(d).every(k => four.includes(k)), JSON.stringify(d).slice(0, 400)],
      ['the bar fell from 14 to 13 issues; the line is struck in place', /14 issues/.test(l0.bar) && /13 issues/.test(l1.bar) && l1.lines.find(l => l.ix === ix).struck && l1.lines.length === l0.lines.length, `${l0.bar} → ${l1.bar}`],
    ], [f0, f1])
  }, () => pic(p, '16-error'))
  await guard('17', 'the same-day tight turn', async () => {
    await openList(p, S, WED); const l0 = await readList(p, S, WED)
    const tT = l0.lines.find(l => /Tight turn/.test(l.text) && /Trident/.test(l.text)).ix, tR = l0.lines.find(l => /Tight turn/.test(l.text) && /Relay/.test(l.text)).ix, dt = l0.lines.find(l => /double turning/.test(l.text)).ix
    const s0 = await snap(p, dayScope(WED))
    await tapLine(p, S, WED, tT); const s1 = await snap(p, dayScope(WED))
    await p.evaluate(() => { const e = document.querySelector('#eWeek .day[data-day="2"] .go .puck[data-person="harpoon"]'); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }); await L.sleep(250)
    const f1 = await pic(p, '17a-wed-trident-turn-hidden')
    await openList(p, S, WED); await tapLine(p, S, WED, dt); const s2 = await snap(p, dayScope(WED))
    await p.evaluate(() => { const e = document.querySelector('#eWeek .day[data-day="2"] .go .puck[data-person="harpoon"]'); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }); await L.sleep(250)
    const f2 = await pic(p, '17b-wed-double-turn-hidden-too')
    const chips = (s, id) => (s[id] || []).join(' ; ') || 'plain'
    judge('17 (same-day TURN)', 'Wednesday: ✕ on Trident\'s "Tight turn VL ACM→VL BFM", then ✕ on "2 people are double turning: Trident, Relay" (Relay\'s own tight turn left showing)', [
      ['before: Trident and Relay each wear TT', /TT/.test(chips(s0, 'harpoon')) && /TT/.test(chips(s0, 'dirty')), `Trident ${chips(s0, 'harpoon')} | Relay ${chips(s0, 'dirty')}`],
      ['Trident\'s turn hidden: Trident loses TT and falls to the double-turn\'s DT (still showing); Relay keeps TT', !/TT/.test(chips(s1, 'harpoon')) && /DT/.test(chips(s1, 'harpoon')) && /TT/.test(chips(s1, 'dirty')), `Trident ${chips(s1, 'harpoon')} | Relay ${chips(s1, 'dirty')}`],
      ['the double-turn line hidden too: Trident is plain; Relay still wears TT (his own turn)', chips(s2, 'harpoon') === 'plain' && /TT/.test(chips(s2, 'dirty')) && !/DT/.test(chips(s2, 'dirty')), `Trident ${chips(s2, 'harpoon')} | Relay ${chips(s2, 'dirty')}`],
      ['nobody else on Wednesday changed', Object.keys(snapDiff(s0, s2)).every(k => k === 'harpoon' || k === 'dirty'), JSON.stringify(snapDiff(s0, s2)).slice(0, 300)],
    ], [f1, f2])
    row('17 (CREW_TIGHT, the overnight tight turn)', 'not built in this file — see the file wh-a-16 if walked', 'the demo week raises no overnight tight-turn note', 'see 17 (overnight)', [])
  }, () => pic(p, '17-error'))
  allErrors.push(...errors); await browser.close()
}

/* ---------- 19, the OIL half ---------- */
{
  const { browser, p, errors } = await world(); p.setDefaultTimeout(8000)
  await guard('19-oil', 'a reminder that names nobody', async () => {
    await L.go(p, 'editsched'); await openList(p, S, SAT)
    const l0 = await readList(p, S, SAT); const w0 = await warnsOf(p, SAT)
    const s0 = await snap(p, dayScope(SAT)); const ins0 = await insights(p)
    const how = await tapLine(p, S, SAT, 0)
    const l1 = await readList(p, S, SAT); const s1 = await snap(p, dayScope(SAT)); await W.showDay(p, SAT); const f1 = await pic(p, '19a-sat-oil-reminder-hidden')
    const ins1 = await insights(p)
    judge('19 (OIL reminder, Edit Schedule)', `Edit Schedule, Saturday: ✕ on "This day is not published yet, so nobody earns their OIL for it" — a warning that names no man (${how})`, [
      ['before: 1 issue, the line live with ✕', /1 issue\b/.test(l0.bar) && l0.lines.length === 1 && l0.lines[0].btn === '✕' && w0[0].who.length === 0, l0.bar],
      ['after: the bar reads "✓ No issues"', /✓ No issues/.test(l1.bar), l1.bar],
      ['the line is still there, painted struck, with a reachable ↺', l1.lines.length === 1 && l1.lines[0].struck && l1.lines[0].btn === '↺' && l1.lines[0].btnTop === true, JSON.stringify(l1.lines[0]).slice(0, 160)],
      ['no puck on Saturday changed', Object.keys(snapDiff(s0, s1)).length === 0, JSON.stringify(snapDiff(s0, s1))],
      ['Insights: "OIL waiting — this day is not published" fell from 2 to 1, Saturday reads clear', +ins0.byType['OIL waiting — this day is not published'] === 2 && +ins1.byType['OIL waiting — this day is not published'] === 1 && /clear/.test(ins1.byDay.Saturday), `${ins0.byDay.Saturday} → ${ins1.byDay.Saturday}`],
    ], [f1])
    /* the board, Sunday: hide there; then flag Saturday again from the board */
    await W.boardOn(p, SUN); await boardOpenFold(p)
    const b0 = await readBoard(p); const hb = await tapBoardLine(p, SUN, 0); await boardOpenFold(p); const b1 = await readBoard(p); const f2 = await pic(p, '19b-board-sun-oil-reminder-hidden')
    judge('19 (OIL reminder, the board)', `Scheduler Board, Sunday: ✕ on the same reminder (${hb})`, [
      ['before: the heading counts 1', /1 issue/.test(b0.head), b0.head],
      ['after: the heading reads "No conflicts flagged for Sunday ✓"', /No conflicts flagged for Sunday ✓/.test(b1.head), b1.head],
      ['the line is struck with a ↺ a finger lands on', b1.lines.length === 1 && b1.lines[0].struck && b1.lines[0].btn === '↺' && b1.lines[0].btnTop === true, JSON.stringify(b1.lines[0]).slice(0, 160)],
    ], [f2])
    /* to Saturday: the day tab (desktop) or the ‹ arrow (a phone has no tabs) */
    if (await p.locator('#schedBoard [data-sbtab="5"]:visible').count()) await p.locator('#schedBoard [data-sbtab="5"]').first().click(); else await p.locator('#sbPrevDay:visible').first().click()
    await L.sleep(700); await boardOpenFold(p)
    const c0 = await readBoard(p); const hc = await tapBoardLine(p, SAT, 0); await boardOpenFold(p); const c1 = await readBoard(p); const f3 = await pic(p, '19c-board-sat-flagged-again')
    await W.boardOff(p); await openList(p, S, SAT); const l2 = await readList(p, S, SAT); await openList(p, S, SUN); const l3 = await readList(p, S, SUN); const f4 = await pic(p, '19d-week-sat-live-sun-hidden')
    judge('19 (OIL reminder, back and forth)', `the board moved to Saturday by its day tab: the line hidden on Edit Schedule shows struck there; ↺ (${hc}); back on Edit Schedule`, [
      ['the board showed Saturday\'s line struck with ↺ and "No conflicts flagged for Saturday ✓"', c0.lines[0].struck && c0.lines[0].btn === '↺' && /No conflicts flagged for Saturday ✓/.test(c0.head), c0.head],
      ['after ↺ the board counts 1 and the line is live with ✕', /1 issue/.test(c1.head) && !c1.lines[0].struck && c1.lines[0].btn === '✕', c1.head],
      ['Edit Schedule: Saturday is back to 1 issue (live), Sunday reads "✓ No issues" (struck)', /1 issue\b/.test(l2.bar) && !l2.lines[0].struck && /✓ No issues/.test(l3.bar) && l3.lines[0].struck, `${l2.bar} | ${l3.bar}`],
    ], [f3, f4])
  }, () => pic(p, '19-error'))
  allErrors.push(...errors); await browser.close()
}
console.log('ERRORS', JSON.stringify(allErrors))
if (allErrors.length) row('errors (12-kinds)', 'the browser\'s error list through this file', allErrors.join(' | ').slice(0, 600), 'FAIL', [])
savePart('12-kinds', { errors: allErrors })
