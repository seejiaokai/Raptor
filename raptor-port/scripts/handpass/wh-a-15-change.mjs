/* [WARN-HIDE-KEPT] walker A — the situation changing and changing back: scenarios 34 (a hidden long day: cleared,
   changed, restored exactly), 26 (the drop message), 35 (saved plans), 36 (day templates). One world each; every
   change through the app's own boxes, drags, plan menu and Templates menu. */
import { handPut } from './seat-lib.mjs'
import { world, openList, readList, tapLine, boardOpenFold, readBoard, tapBoardLine, pk, marked, sum, judge, row, savePart, pic, guard, warnsOf, lineIx, toastNow, L, W, PHONE } from './wh-a-lib.mjs'
const S = '#eWeek', MON = 0, TUE = 1, WED = 2
const allErrors = []
const dayScope = di => `${S} .day[data-day="${di}"]`
const lit = ps => ps.map(x => ({ ...x, out: /dotted|dashed/.test(x.out) ? x.out : '' }))
const bLine = (b, re) => (b.lines || []).find(x => re.test(x.text)) || null
const count = h => +(/(\d+) issues?/.exec(h) || [])[1] || (/No conflicts|No issues/.test(h) ? 0 : null)

/* ---------- 34 ---------- */
{
  const { browser, p, errors } = await world(); p.setDefaultTimeout(8000)
  await guard('34', 'a hidden long day: cleared, changed, restored', async () => {
    await L.go(p, 'editsched'); await W.boardOn(p, TUE); await boardOpenFold(p); await W.toastSpy(p)
    const b0 = await readBoard(p); const l0 = bLine(b0, /Static has a long work day: 13h05, 05:00/)
    await tapBoardLine(p, TUE, l0.ix); await boardOpenFold(p)
    const b1 = await readBoard(p); const f1 = await pic(p, '34a-long-day-hidden')
    await W.toasts(p)
    /* shorten: his OPS-O desk starts 07:00 instead of 05:00 */
    await W.boardText(p, 'dr:1.0.2.str', '07:00'); await boardOpenFold(p)
    const b2 = await readBoard(p); const s2 = lit(await pk(p, '#schedBoard', 'wolf')); const f2 = await pic(p, '34b-day-shortened-warning-gone')
    /* a different long day: 05:30 */
    await W.boardText(p, 'dr:1.0.2.str', '05:30'); await boardOpenFold(p)
    const t3 = await W.toasts(p)
    const b3 = await readBoard(p); const l3 = bLine(b3, /Static has a long work day/); const s3 = lit(await pk(p, '#schedBoard', 'wolf')); const f3 = await pic(p, '34c-different-long-day-shown')
    /* the exact original: 05:00 */
    await W.boardText(p, 'dr:1.0.2.str', '05:00'); await boardOpenFold(p)
    const t4 = await W.toasts(p)
    const b4 = await readBoard(p); const l4 = bLine(b4, /Static has a long work day/); const s4 = lit(await pk(p, '#schedBoard', 'wolf')); const f4 = await pic(p, '34d-exact-original-hidden-again')
    await W.boardOff(p); await openList(p, S, TUE); const wk = await readList(p, S, TUE); const sw = lit(await pk(p, dayScope(TUE), 'wolf')); const f5 = await pic(p, '34e-week-agrees')
    judge('34', 'Scheduler Board, Tuesday: ✕ on Static\'s long work day (13h05, 05:00 → 18:05); then his OPS-O desk\'s start typed 07:00, then 05:30, then 05:00 again', [
      ['hidden: the line is struck, the heading counts 3', (bLine(b1, /Static has a long work day/) || {}).struck === true && count(b1.head) === 3, b1.head],
      ['07:00 — the day is short enough: no long-day line at all, heading 3, Static plain', !bLine(b2, /long work day/) && count(b2.head) === 3 && marked(s2).length === 0, `${b2.head} · ${b2.lines.length} lines · ${sum(s2)}`],
      ['05:30 — a DIFFERENT long day (12h35): the line is back SHOWN (not struck, ✕), heading 4, Static wears grey L', !!l3 && /12h35/.test(l3.text) && l3.struck === false && l3.btn === '✕' && count(b3.head) === 4 && marked(s3).length >= 2 && marked(s3).every(x => x.chip === 'L'), `${l3 ? l3.text.slice(0, 70) : '(no line)'} · ${b3.head} · ${sum(s3)}`],
      ['05:00 — the EXACT original (13h05): it is hidden again by itself — struck, ↺, heading 3, Static plain', !!l4 && /13h05/.test(l4.text) && l4.struck === true && l4.btn === '↺' && count(b4.head) === 3 && marked(s4).length === 0, `${l4 ? l4.text.slice(0, 70) : '(no line)'} · ${b4.head} · ${sum(s4)}`],
      ['Edit Schedule agrees: 3 issues, the long-day line struck, Static plain', /3 issues/.test(wk.bar) && (wk.lines.find(l => /long work day/i.test(l.text)) || {}).struck === true && marked(sw).length === 0, `${wk.bar} · ${sum(sw)}`],
    ], [f1, f2, f3, f4, f5])
    row('34 (what the app said at each change)', 'the toasts after typing 05:30 and after typing 05:00', `05:30 → ${JSON.stringify(t3)} · 05:00 → ${JSON.stringify(t4)}`, 'INFO', [])
  }, () => pic(p, '34-error'))
  allErrors.push(...errors); await browser.close()
}

/* ---------- 26 ---------- */
if (PHONE) row('26', 'not walked at phone width', 'a phone has no drag; the board\'s tap-to-place is the phone\'s gesture and it does not replace a seated man', 'NOT WALKED (phone: no drag-and-drop)', [])
else {
  const { browser, p, errors } = await world(); p.setDefaultTimeout(8000)
  await guard('26', 'the drop message', async () => {
    await L.go(p, 'editsched'); await W.boardOn(p, TUE); await boardOpenFold(p); await W.toastSpy(p)
    const SEAT = '1.1.0.1.p'
    const seat = k => p.locator(`#schedBoard [data-slot="${k}"]`).first()
    const fromList = id => p.locator(`#sbRoster .rpuck[data-person="${id}"]:visible`).first()
    const holds = k => p.evaluate(key => [...document.querySelectorAll(`#schedBoard [data-slot="${key}"] .puck[data-person]`)].map(e => e.dataset.person), k)
    const blink = (k, id) => p.evaluate(([key, who]) => { const e = document.querySelector(`#schedBoard [data-slot="${key}"] .puck[data-person="${who}"]`); if (!e) return { none: true }; const c = getComputedStyle(e); return { flagnew: e.classList.contains('flagnew'), anim: c.animationName, cls: e.className } }, [k, id])
    const drop = async (id, k) => { await W.toasts(p); await seat(k).evaluate(e => e.scrollIntoView({ block: 'center' })); await fromList(id).evaluate(e => e.scrollIntoView({ block: 'center' })); await L.sleep(200); await W.drag(p, fromList(id), seat(k)); const bl = await blink(k, id); await L.sleep(250); return { holds: await holds(k), toasts: await W.toasts(p), now: await toastNow(p), blink: bl } }
    /* baseline: nothing hidden — put Anvil over Saint, then Saint back */
    const a0 = await drop('shaft', SEAT); const d0 = await drop('salsa', SEAT)
    await boardOpenFold(p); const b0 = await readBoard(p); const f0 = await pic(p, '26a-baseline-drop-announces')
    const said0 = [...d0.toasts, d0.now].join(' | ')
    judge('26 (baseline — nothing hidden)', 'Scheduler Board, Tuesday: Anvil dragged from the crew list onto Saint\'s VL SAT seat (Saint out), then Saint dragged back onto it', [
      ['Anvil took the seat, then Saint took it back', a0.holds.join() === 'shaft' && d0.holds.join() === 'salsa', `${a0.holds} → ${d0.holds}`],
      ['the drop that recreates his clash ANNOUNCES it (a message naming the clash) and his puck pulses', /clash/i.test(said0) && d0.blink.flagnew === true, `said: ${said0} · puck: ${JSON.stringify(d0.blink)}`],
      ['both his lines are back, live', !!bLine(b0, /Saint — VL SAT & APPOINTMENT clash/) && !bLine(b0, /Saint — VL SAT & APPOINTMENT clash/).struck && count(b0.head) === 4, b0.head],
    ], [f0])
    /* hide both of Saint's lines; take him off; put him back */
    await tapBoardLine(p, TUE, bLine(b0, /Saint — VL SAT & APPOINTMENT clash/).ix); await boardOpenFold(p)
    await tapBoardLine(p, TUE, bLine(await readBoard(p), /Saint — No time for the VL SAT flight brief/).ix); await boardOpenFold(p)
    const a1 = await drop('shaft', SEAT); await boardOpenFold(p); const bGone = await readBoard(p)
    const d1 = await drop('salsa', SEAT); await boardOpenFold(p); const b1 = await readBoard(p); const s1 = lit(await pk(p, '#schedBoard', 'salsa'))
    const f1 = await pic(p, '26b-exact-hidden-clash-recreated-silent')
    const said1 = [...d1.toasts, d1.now].join(' | ')
    const c1 = bLine(b1, /Saint — VL SAT & APPOINTMENT clash/), n1 = bLine(b1, /Saint — No time for the VL SAT flight brief/)
    judge('26 (the exact hidden warning recreated)', '✕ on both of Saint\'s lines; Anvil dragged onto his seat (the two warnings vanish); Saint dragged back onto it — the exact same clash and brief warning again', [
      ['with Saint off the seat his two lines are gone from the list', !bLine(bGone, /Saint/) && a1.holds.join() === 'shaft', `${bGone.head} · ${bGone.lines.length} lines`],
      ['back on the seat: the same two lines return ALREADY struck with ↺ — still hidden', !!c1 && c1.struck && c1.btn === '↺' && !!n1 && n1.struck && n1.btn === '↺', `${c1 ? c1.struck : 'no clash line'} / ${n1 ? n1.struck : 'no brief line'} · ${b1.head}`],
      ['the drop does not repeat the words of the hidden lines (the clash line, the brief line)', !/clash|No time for/i.test(said1), `said: ${said1 || '(nothing)'}`],
      ['the drop raises NO message about that conflict at all (scenario 26: "neither toast nor blink")', !/clash|No time for|already on/i.test(said1), `said: "${said1 || '(nothing)'}" — where the baseline drop said "${said0}", and the drop of Anvil said "${[...a1.toasts, a1.now].join(' | ')}"`],
      ['his puck does not pulse and carries no ring or chip', d1.blink.flagnew === false && marked(s1).length === 0, `${JSON.stringify(d1.blink)} · ${sum(s1)}`],
      ['the heading does not count them', count(b1.head) === count(bGone.head), `${bGone.head} → ${b1.head}`],
    ], [f1])
    /* a genuinely different clash: Saint dragged onto RU ACM's front seat as well */
    const d2 = await drop('salsa', '1.1.1.0.p'); await boardOpenFold(p); const b2 = await readBoard(p); const s2 = lit(await pk(p, '#schedBoard', 'salsa'))
    const f2 = await pic(p, '26c-changed-clash-shown-and-announced')
    const said2 = [...d2.toasts, d2.now].join(' | ')
    const fresh = b2.lines.filter(l => /Saint/.test(l.text) && !l.struck)
    judge('26 (a genuinely changed clash)', 'Saint dragged from the crew list onto RU ACM\'s front seat too (he now sits in two aircraft at 14:40)', [
      ['new lines naming Saint come back SHOWN (live, with ✕)', fresh.length >= 1 && fresh.every(l => l.btn === '✕'), fresh.map(l => l.text.slice(0, 60)).join(' | ')],
      ['the drop announces it', /Saint/.test(said2) && /clash|No time|brief/i.test(said2), `said: ${said2}`],
      ['his pucks are ringed again and the new seat\'s puck pulses', marked(s2).length >= 2 && d2.blink.flagnew === true, `${sum(s2)} · ${JSON.stringify(d2.blink)}`],
      ['the heading rose', count(b2.head) > count(b1.head), `${b1.head} → ${b2.head}`],
    ], [f2])
  }, () => pic(p, '26-error'))
  allErrors.push(...errors); await browser.close()
}

/* ---------- 35 ---------- */
{
  const { browser, p, errors } = await world(); p.setDefaultTimeout(8000)
  await guard('35', 'saved plans', async () => {
    await L.go(p, 'editsched'); await W.showDay(p, TUE)
    const planBtn = () => p.locator(`${dayScope(TUE)} [data-planmenu="1"]`).first()
    const planName = async () => (await planBtn().innerText()).replace(/\s+/g, ' ').replace(/▾/, '').trim()
    const menu = async () => { await W.showDay(p, TUE); await planBtn().evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(150); await planBtn().click(); await L.sleep(400) }
    const altPlan = async () => { await menu(); await p.locator('.wavemenu [data-plandup]:visible').first().click(); await L.sleep(800); return planName() }
    const goPlan = async name => { await menu(); const b = p.locator('.wavemenu button[data-plansel]:visible', { hasText: new RegExp('^' + name) }).first(); if (!(await b.count())) { await p.keyboard.press('Escape'); return 'no such plan in the menu' } await b.click(); await L.sleep(800); return planName() }
    const read = async () => { await openList(p, S, TUE); const l = await readList(p, S, TUE); const ln = l.lines.find(x => /Static has a long work day/.test(x.text)); return { plan: await planName(), bar: l.bar, line: ln ? (ln.struck ? 'struck ↺' : 'live ✕') + ' ' + (/(\d+h\d+)/.exec(ln.text) || [])[1] : 'no long-day line', st: sum(marked(lit(await pk(p, dayScope(TUE), 'wolf')))) || 'plain' } }
    /* on the live day (it becomes "Plan A"): hide Static's long day */
    await openList(p, S, TUE); const l0 = await readList(p, S, TUE); await tapLine(p, S, TUE, lineIx(l0, /Static has a long work day/))
    const rA = await read(); const fA = await pic(p, '35a-plan-a-hidden')
    /* + Alt Plan → "Plan B", a copy that is now the live day: the exact warning exists there too */
    const nB = await altPlan(); const rB0 = await read(); const fB0 = await pic(p, '35b-plan-b-copy')
    /* in Plan B the warning is made to go: his OPS-O desk starts 07:00 (the board's own box) */
    await W.boardOn(p, TUE); await W.boardText(p, 'dr:1.0.2.str', '07:00'); await W.boardOff(p)
    const rB1 = await read(); const fB1 = await pic(p, '35c-plan-b-no-warning')
    /* back to Plan A */
    const nA = await goPlan('Plan A'); const rA2 = await read(); const fA2 = await pic(p, '35d-back-on-plan-a')
    /* a third plan, a copy of A — the exact warning again */
    const nC = await altPlan(); const rC = await read(); const fC = await pic(p, '35e-plan-c-copy-of-a')
    /* B again (nothing), C again */
    const nB2 = await goPlan('Plan B'); const rB2 = await read()
    const nC2 = await goPlan(nC); const rC2 = await read()
    /* flag it again on C; A must show it too — one set of hides for the day, not one a plan */
    await openList(p, S, TUE); const lc = await readList(p, S, TUE); await tapLine(p, S, TUE, lineIx(lc, /Static has a long work day/))
    const rC3 = await read(); const nA3 = await goPlan('Plan A'); const rA3 = await read(); const fA3 = await pic(p, '35f-flagged-again-on-c-shows-on-a')
    judge('35', `Edit Schedule, Tuesday: ✕ on Static's long day on the live day; the plan selector → "+ Alt Plan" (→ "${nB}"); in it his OPS-O desk's start typed 07:00; the selector → Plan A; "+ Alt Plan" again (→ "${nC}"); → Plan B; → ${nC}`, [
      ['live day: hidden (struck), 3 issues', /struck/.test(rA.line) && /3 issues/.test(rA.bar), JSON.stringify(rA)],
      [`"${nB}" (a copy — the exact warning exists): it is hidden there too`, /Plan B/.test(nB) && /struck/.test(rB0.line) && /3 issues/.test(rB0.bar) && rB0.st === 'plain', JSON.stringify(rB0)],
      ['Plan B with the desk at 07:00: no long-day line, 3 issues', rB1.line === 'no long-day line' && /3 issues/.test(rB1.bar), JSON.stringify(rB1)],
      ['back on Plan A: the exact warning is there and still hidden', /Plan A/.test(nA) && /struck.*13h05/.test(rA2.line) && /3 issues/.test(rA2.bar) && rA2.st === 'plain', JSON.stringify(rA2)],
      [`"${nC}" (another copy of A): hidden there as well — the hide was not lost and not duplicated`, /struck.*13h05/.test(rC.line) && /3 issues/.test(rC.bar), JSON.stringify(rC)],
      ['Plan B again: still no line; then the third plan again: still hidden', rB2.line === 'no long-day line' && /struck/.test(rC2.line), `${nB2}: ${JSON.stringify(rB2)} | ${nC2}: ${JSON.stringify(rC2)}`],
    ], [fA, fB0, fB1, fA2, fC])
    judge('35 (one set of hides for the day)', `on "${nC}": ↺ on the struck line; then the selector → Plan A`, [
      ['on the third plan the warning is live again: 4 issues, Static grey L', /live/.test(rC3.line) && /4 issues/.test(rC3.bar) && rC3.st !== 'plain', JSON.stringify(rC3)],
      ['on Plan A it is live too — the plans do not keep separate hides', /Plan A/.test(nA3) && /live/.test(rA3.line) && /4 issues/.test(rA3.bar) && rA3.st !== 'plain', JSON.stringify(rA3)],
    ], [fA3])
  }, () => pic(p, '35-error'))
  allErrors.push(...errors); await browser.close()
}

/* ---------- 36 ---------- */
{
  const { browser, p, errors } = await world(); p.setDefaultTimeout(8000)
  await guard('36', 'day templates', async () => {
    await L.go(p, 'editsched'); await W.showDay(p, MON)
    const tplMenu = async di => { await W.showDay(p, di); const b = p.locator(`${dayScope(di)} [data-daytplopen="${di}"]`).first(); await b.evaluate(e => e.scrollIntoView({ block: 'center', inline: 'nearest' })); await L.sleep(150); await b.click(); await L.sleep(400) }
    const saveTpl = async (di, name) => { await tplMenu(di); await p.locator('.wavemenu button:visible', { hasText: 'Save this day' }).first().click(); await L.sleep(600); const inp = p.locator('#daytplModal input:visible').first(); await inp.fill(name); await p.keyboard.press('Enter'); await L.sleep(400); await p.locator('#daytplModal button:visible', { hasText: /^Done$/ }).first().click(); await L.sleep(400) }
    const applyTpl = async (di, name) => { await tplMenu(di); const b = p.locator('.wavemenu button[data-daytplpick]:visible', { hasText: name }).first(); if (!(await b.count())) return 'no such template in the menu'; await b.click(); await L.sleep(900); const ok = p.locator('button:visible', { hasText: /^(Apply|Replace|Yes|OK|Confirm)/ }).first(); if (await ok.count()) { await ok.click(); await L.sleep(700) } return (await toastNow(p)) || 'applied' }
    const boxes = di => p.evaluate(i => { const f = document.querySelector(`#eWeek .day[data-day="${i}"] .go .form`); return f ? [...f.querySelectorAll('.fcell.bto, .fcell.ld')].map(c => /inset/.test(getComputedStyle(c).boxShadow)) : [] }, di)
    const read = async di => { await openList(p, S, di); const l = await readList(p, S, di); const ln = l.lines.find(x => /takes off and lands at the same time/.test(x.text)); const w = (await warnsOf(p, di)).find(x => x.code === 'FLT_NO_LEN'); return { bar: l.bar, n: l.lines.length, line: ln ? (ln.struck ? 'struck ↺' : 'live ✕') : 'no nought-minute line', boxes: (await boxes(di)).join(), key: w ? w.key : '', msg: w ? w.msg.slice(0, 60) : '' } }
    /* Monday: a nought-minute first line (a warning that needs no crew — a template carries the lines, not the men) */
    const to = (await p.locator(`${S} [data-txt="ff:0.0.0.to"]`).first().innerText()).trim()
    await W.weekText(p, 'ff:0.0.0.ld', to)
    const m0 = await read(MON)
    await tapLine(p, S, MON, lineIx(await readList(p, S, MON), /takes off and lands at the same time/))
    const m1 = await read(MON); await W.showDay(p, MON); const f1 = await pic(p, '36a-monday-nought-minute-hidden')
    await saveTpl(MON, 'MON-A')
    const seatMan = async (di, slot, id) => { await W.boardOn(p, di); const r = await handPut(p, slot, id); await W.boardOff(p); return r.took ? 'seated' : 'NOT seated' }
    const ap1 = await applyTpl(WED, 'MON-A'); const w0 = await read(WED); const st1 = await seatMan(WED, '2.0.0.0.p', 'shaft'); const w1 = await read(WED); await W.showDay(p, WED); const f2 = await pic(p, '36b-wednesday-after-monday-template')
    await p.evaluate(() => { const e = document.querySelector('#eWeek .day[data-day="2"] .go .form'); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }); await L.sleep(250); const f2b = await pic(p, '36b-wednesday-time-boxes')
    judge('36 (the template does not carry the hide to another day)', `Edit Schedule, Monday: the first line's landing typed equal to its take-off (${to}); ✕ on the new "takes off and lands at the same time" line; Templates → "Save this day as a template" (named MON-A); Wednesday: Templates → MON-A ("${ap1}") — the template brings the lines and times without the men (Wednesday then reads: ${w0.line}), so Anvil is picked onto that line's front seat on the board (${st1})`, [
      ['Monday: the line is hidden (struck), its time boxes unflagged', /live/.test(m0.line) && /struck/.test(m1.line) && !/true/.test(m1.boxes), `${JSON.stringify(m0)} → ${JSON.stringify(m1)}`],
      ['Wednesday now carries the same-looking line', w1.line !== 'no nought-minute line', JSON.stringify(w1)],
      ['on Wednesday it is SHOWN — live with ✕, counted, both time boxes flagged', /live/.test(w1.line) && w1.boxes === 'true,true' && /\d+ issues?/.test(w1.bar), JSON.stringify(w1)],
    ], [f1, f2, f2b])
    /* Monday changed away by another template, then back */
    await saveTpl(TUE, 'TUE-A')
    const ap2 = await applyTpl(MON, 'TUE-A'); const m2 = await read(MON); await W.showDay(p, MON); const f3 = await pic(p, '36c-monday-changed-away')
    const ap3 = await applyTpl(MON, 'MON-A'); const m3a = await read(MON); const st3 = await seatMan(MON, '0.0.0.0.p', 'shaft'); const m3 = await read(MON); await W.showDay(p, MON); const f4 = await pic(p, '36d-monday-restored')
    await p.evaluate(() => { const e = document.querySelector('#eWeek .day[data-day="0"] .go .form'); if (e) e.scrollIntoView({ block: 'center', inline: 'nearest' }) }); await L.sleep(250); const f4b = await pic(p, '36d-monday-time-boxes')
    const w2 = await read(WED)
    judge('36 (Monday changed away and back)', `Tuesday saved as a template (TUE-A); Monday: Templates → TUE-A ("${ap2}"); Monday: Templates → MON-A ("${ap3}"; before a man is seated Monday reads: ${m3a.line}); Anvil picked onto its first line's front seat (${st3})`, [
      ['with Tuesday\'s template on it Monday has no nought-minute line', m2.line === 'no nought-minute line', JSON.stringify(m2)],
      ['restored: Monday\'s exact warning is back and ALREADY hidden — struck with ↺, boxes unflagged', /struck/.test(m3.line) && !/true/.test(m3.boxes) && m3.key === m1.key && m3.msg === m1.msg, `${JSON.stringify(m3)} (first: key ${m1.key})`],
      ['Wednesday\'s is still shown', /live/.test(w2.line) && w2.boxes === 'true,true', JSON.stringify(w2)],
    ], [f3, f4, f4b])
  }, () => pic(p, '36-error'))
  allErrors.push(...errors); await browser.close()
}
console.log('ERRORS', JSON.stringify(allErrors))
if (allErrors.length) row('errors (15-change)', 'the browser\'s error list through this file', allErrors.join(' | ').slice(0, 600), 'FAIL', [])
savePart('15-change', { errors: allErrors })
