/* [DB-READINESS] group A phase 7 — the FULL check's walk, WALKER B, part 1 (1 Oct 26): the sim brief / debrief flag in
   the ALL AVAIL window (Astra's scenarios 14–19) — desktop, Tuesday 14 Jul, built through the board's own controls.
   The world it leaves after publication is saved (p7-b-state-tue.json, in the scratch folder named by HP_STATE_OUT) so
   the phone part (p7-b-w1p.mjs) opens the SAME world at 390 px.
   Env: HP_URL (the frozen build on :4206), HP_SHOTS, HP_OUT, HP_TAG=p7, HP_STATE_OUT. */
import { boot, fact, facts } from './p6-lib.mjs'
import { handPut } from './seat-lib.mjs'
import * as B from './p7-b-lib.mjs'
const { L, W } = await boot()
const { browser, ctx, p, errors } = await B.world(L)
await W.toastSpy(p)
const DI = 1, TAL = 'haowen', ECHO = 'freak', GC = 'torque', HUNTER = 'prowler', LEDGER = 'drill', NOMAD = 'pike'
const table = []
const row = (id, did, screen, stored, verdict, pics) => { table.push({ id, did, screen, stored, verdict, pics }); console.log(`ROW   ${id} ${verdict} — ${screen}`) }
const pics = []
const pic = async (name, o) => { await L.shot(p, name, o || {}); pics.push(name + '.png'); return name + '.png' }
const wpic = async (name) => { const f = await B.winPic(L, p, name); pics.push(f); return f }
const short = w => ({ title: w.title, one: w.one, from: w.from, foot: w.foot, n: (w.rows || []).length, flagged: B.flagged(w), lost: w.lost, chip: w.chip })
const simFlag = r => !!r && /No time for the (OFT|AMT)/.test(r.why)
const try_ = async (name, fn) => { try { return await fn() } catch (e) { L.check(`${name} — the step ran`, false, String(e && e.stack || e).slice(0, 700)); await pic(`${name}-X-error`).catch(() => {}); return null } }

/* ---------- the fixture: OFT EP-1 10:00–11:00 (Talisman / Echo), a ground row OPS BRIEF with ALL AVAIL ---------- */
await W.boardOn(p, DI)
await try_('B14-setup', async () => {
  await W.boardText(p, `sr:${DI}.oft.0.label`, 'EP-1')
  await W.boardText(p, `sr:${DI}.oft.0.str`, '10:00')
  await W.boardText(p, `sr:${DI}.oft.0.end`, '11:00')
  const ri = await B.addGround(L, W, p, DI, 'OPS BRIEF', '09:45', '09:58')
  fact('B14.put', await handPut(p, `g:${DI}.${ri}.+`, 'allavail'))
  fact('B14.sim', (await B.simModel(p, DI)).oft[0])
  fact('B14.simw', await p.evaluate(d => window.SIMW[d], DI))
})
const OPS = await B.chipItem(p, DI, 'ground', 'OPS BRIEF')
fact('item', OPS)

/* B14 — the brief */
let pA = null
await try_('B14', async () => {
  const w = await B.openChip(p, OPS)
  fact('B14.window', short(w)); fact('B14.tal', B.man(w, TAL)); fact('B14.echo', B.man(w, ECHO))
  const clean = (w.rows || []).find(r => !r.flag)
  fact('B14.cleanPaint', clean && clean.paint)
  const want = 'No time for the OFT EP-1 brief — OPS BRIEF sits inside 09:45–10:00'
  const t = B.man(w, TAL), e = B.man(w, ECHO)
  L.check('B14 Talisman and Echo (on the sim) are LISTED for an event in the sim\'s brief minutes', !!t && !!e, short(w))
  L.check('B14 both wear the amber flag with the brief sentence', !!t && !!e && t.flag === 'AMBER' && e.flag === 'AMBER' && t.why === want && e.why === want, { t: t && t.why, e: e && e.why })
  L.check('B14 the flag is PAINTED: the flagged row\'s colours differ from a clean row\'s, and the reason has room on screen', !!t && !!clean && JSON.stringify(t.paint) !== JSON.stringify(clean.paint) && !!t.whyBox && t.whyBox.h > 0 && t.whyBox.w > 0, { flagged: t && t.paint, clean: clean && clean.paint, whyBox: t && t.whyBox })
  await pic('B14-1-board-window-brief'); await wpic('B14-2-window-brief')
  fact('B14.tap', await B.tapMan(p, TAL))
  const w2 = await B.win(p); fact('B14.foot', w2.foot)
  L.check('B14 a tap on Talisman gives the full sentence in the window\'s foot', w2.foot.includes('Talisman') && w2.foot.includes(want), w2.foot)
  await wpic('B14-3-window-foot-after-tap')
  /* B19 (i) — a man not on the sim */
  const others = (w.rows || []).filter(r => r.id !== TAL && r.id !== ECHO)
  const falseFlags = others.filter(simFlag)
  fact('B19.others', { n: others.length, flagged: others.filter(r => r.flag).map(r => `${r.cs}: ${r.why}`) })
  L.check('B19 (i) no man who is not on the sim wears a sim brief / debrief flag', falseFlags.length === 0, falseFlags.map(r => `${r.cs}: ${r.why}`))
  pA = { listed: !!t && !!e, flag: t && t.flag, why: t && t.why, foot: w2.foot, n: w.rows.length, one: w.one, chip: w.chip }
  await B.tapMan(p, TAL)   /* a second tap clears the selection, as on any puck */
})
row('B14', 'Board, Tue 14 Jul: the OFT row retyped EP-1, 10:00–11:00 (Talisman / Echo on it); + Item "OPS BRIEF" 09:45–09:58, ALL AVAIL from the crew list; tapped its count; tapped Talisman in the window',
  pA ? `chip ${pA.chip}; window "${pA.one}"; Talisman and Echo listed, amber, "${pA.why}"; foot after the tap: "${pA.foot}"` : 'step failed', 'n/a (a read)', L.results.filter(r => /^B14/.test(r.name)).every(r => r.ok) ? 'PASS' : 'FAIL', ['B14-1-board-window-brief.png', 'B14-2-window-brief.png', 'B14-3-window-foot-after-tap.png'])

/* B15 — the debrief, the time edited BEHIND the open window */
let pB = null
await try_('B15', async () => {
  await B.setGroundTimes(W, p, DI, 'OPS BRIEF', '11:05', '11:25')
  const w = await B.win(p)
  fact('B15.window', short(w)); fact('B15.tal', B.man(w, TAL))
  const want = 'No time for the OFT EP-1 debrief — OPS BRIEF sits inside 11:00–11:30'
  const t = B.man(w, TAL), e = B.man(w, ECHO)
  L.check('B15 the window stayed open while the time was typed behind it, and its title follows (11:05–11:25)', w.open && /11:05.11:25/.test(w.title), w.title)
  L.check('B15 Talisman and Echo are listed and amber with the DEBRIEF sentence (11:00–11:30)', !!t && !!e && t.flag === 'AMBER' && e.flag === 'AMBER' && t.why === want && e.why === want, { t: t && t.why, e: e && e.why })
  await pic('B15-1-board-window-debrief'); await wpic('B15-2-window-debrief')
  await B.tapMan(p, ECHO)
  const w2 = await B.win(p); fact('B15.foot', w2.foot)
  L.check('B15 a tap on Echo gives the debrief sentence in the foot', w2.foot.includes('Echo') && w2.foot.includes(want), w2.foot)
  await wpic('B15-3-window-foot-after-tap')
  await B.tapMan(p, ECHO)
  pB = { why: t && t.why, title: w.title, foot: w2.foot }
})
row('B15', 'With the window still open, typed the OPS BRIEF\'s times behind it: 11:05–11:25; tapped Echo',
  pB ? `window stayed open, title "${pB.title}"; Talisman and Echo amber, "${pB.why}"; foot: "${pB.foot}"` : 'step failed', 'n/a (a read)', L.results.filter(r => /^B15/.test(r.name)).every(r => r.ok) ? 'PASS' : 'FAIL', ['B15-1-board-window-debrief.png', 'B15-2-window-debrief.png', 'B15-3-window-foot-after-tap.png'])

/* B19 (ii) — outside both windows; and the SIM's own time edited behind the window: the flag follows */
const neg = {}
await try_('B19-outside', async () => {
  for (const [tag, s, e] of [['before', '09:20', '09:40'], ['after', '11:35', '11:55']]) {
    await B.setGroundTimes(W, p, DI, 'OPS BRIEF', s, e)
    const w = await B.win(p)
    const t = B.man(w, TAL), ec = B.man(w, ECHO)
    neg[tag] = { title: w.title, tal: t && { flag: t.flag, why: t.why }, echo: ec && { flag: ec.flag, why: ec.why }, simFlags: (w.rows || []).filter(simFlag).map(r => `${r.cs}: ${r.why}`) }
    fact(`B19.outside.${tag}`, neg[tag])
    L.check(`B19 (ii) ${s}–${e} (outside the brief and the debrief): Talisman and Echo are listed and carry NO sim flag`, !!t && !!ec && !simFlag(t) && !simFlag(ec) && neg[tag].simFlags.length === 0, neg[tag])
    await wpic(`B19-1-window-outside-${tag}`)
  }
  await pic('B19-2-board-outside-after')
})
let follow = null
await try_('B19-follow', async () => {
  await B.setGroundTimes(W, p, DI, 'OPS BRIEF', '09:45', '09:58')
  const a = B.man(await B.win(p), TAL)
  await W.boardText(p, `sr:${DI}.oft.0.str`, '10:30'); await W.boardText(p, `sr:${DI}.oft.0.end`, '11:30')
  const w1 = await B.win(p); const b = B.man(w1, TAL)
  await wpic('B19-3-window-sim-moved-flag-gone')
  await B.setGroundTimes(W, p, DI, 'OPS BRIEF', '10:16', '10:28')
  const w2 = await B.win(p); const c = B.man(w2, TAL)
  await wpic('B19-4-window-sim-moved-flag-follows')
  follow = { simAt1000: a && a.why, simAt1030_eventAt0945: b ? (b.why || '(listed, no flag)') : '(not listed)', simAt1030_eventAt1016: c ? c.why : '(not listed)' }
  fact('B19.follow', follow); fact('B19.follow.simw', await p.evaluate(d => window.SIMW[d], DI))
  L.check('B19 the sim\'s own time edited behind the window: the 09:45 event loses the flag (the brief is now 10:15–10:30)', !!b && !simFlag(b), b)
  L.check('B19 …and an event at 10:16–10:28 takes it: "…sits inside 10:15–10:30"', !!c && c.flag === 'AMBER' && c.why === 'No time for the OFT EP-1 brief — OPS BRIEF sits inside 10:15–10:30', c)
  await W.boardText(p, `sr:${DI}.oft.0.str`, '10:00'); await W.boardText(p, `sr:${DI}.oft.0.end`, '11:00')
  await B.setGroundTimes(W, p, DI, 'OPS BRIEF', '09:45', '09:58')
})

/* B19 (iii) — a ground crewman riding the sim (Ratchet on the first extra), and an aircrew extra (Nomad) beside him */
let gc = null
await try_('B19-groundcrew', async () => {
  await B.closeWin(p)
  const a = await handPut(p, `s:${DI}.oft.0.x0`, GC); fact('B19.gc.put', a)
  const b = await handPut(p, `s:${DI}.oft.0.x1`, NOMAD); fact('B19.nomad.put', b)
  fact('B19.gc.simw', await p.evaluate(d => window.SIMW[d], DI))
  const w = await B.openChip(p, OPS)
  const g = B.man(w, GC), n = B.man(w, NOMAD), t = B.man(w, TAL)
  gc = { ratchetOnSim: a.took, nomadOnSim: b.took, ratchet: g ? { flag: g.flag, why: g.why } : '(not listed)', nomad: n ? { flag: n.flag, why: n.why } : '(not listed)', tal: t && t.why, one: w.one }
  fact('B19.gc', gc)
  L.check('B19 (iii) Ratchet (ground crew) rides the sim and wears no sim flag in the window', a.took && (!g || !simFlag(g)), gc)
  await pic('B19-5-board-groundcrew-on-sim'); await wpic('B19-6-window-groundcrew-on-sim')
  await B.closeWin(p)
})
row('B19', 'OPS BRIEF moved outside both windows (09:20–09:40, 11:35–11:55); the sim\'s own time moved behind the window (10:30–11:30) and back; Ratchet (ground crew) and Nomad put on the sim\'s two extras by tap + crew list; every other man in the window read',
  `outside: ${JSON.stringify(neg.before && neg.before.tal)} / ${JSON.stringify(neg.after && neg.after.tal)}; sim moved: ${JSON.stringify(follow)}; ground crew: ${JSON.stringify(gc)}; others flagged: ${JSON.stringify(facts['B19.others'])}`,
  'n/a (a read)', L.results.filter(r => /^B19/.test(r.name)).every(r => r.ok) ? 'PASS' : 'FAIL', pics.filter(f => /^B19/.test(f)))

/* B16 / B17 — the AMT block: BRIEF 11:00 · BOX 11:30–12:30 (Hunter / Ledger) · DEBRIEF 12:30 */
const amt = {}
await try_('B16', async () => {
  await W.boardText(p, `sr:${DI}.amt.0.str`, '11:00')
  await W.boardText(p, `sr:${DI}.amt.1.str`, '11:30'); await W.boardText(p, `sr:${DI}.amt.1.end`, '12:30')
  await W.boardText(p, `sr:${DI}.amt.2.str`, '12:30')
  fact('B16.put', [await handPut(p, `s:${DI}.amt.1.p`, HUNTER), await handPut(p, `s:${DI}.amt.1.w`, LEDGER)])
  fact('B16.amt', (await B.simModel(p, DI)).amt); fact('B16.simw', await p.evaluate(d => window.SIMW[d], DI))
  await B.setGroundTimes(W, p, DI, 'OPS BRIEF', '11:10', '11:20')
  const w = await B.openChip(p, OPS)
  const h = B.man(w, HUNTER), l = B.man(w, LEDGER)
  const want = 'No time for the AMT brief — OPS BRIEF sits inside 11:00–11:30'
  amt.brief = { title: w.title, hunter: h && h.why, ledger: l && l.why, all: B.flagged(w) }
  fact('B16.window', amt.brief)
  L.check('B16 Hunter and Ledger (AMT BOX) are listed for 11:10–11:20 and amber with the AMT brief sentence (11:00–11:30)', !!h && !!l && h.flag === 'AMBER' && l.flag === 'AMBER' && h.why === want && l.why === want, amt.brief)
  await pic('B16-1-board-window-amt-brief'); await wpic('B16-2-window-amt-brief')
  await B.tapMan(p, HUNTER); amt.briefFoot = (await B.win(p)).foot; fact('B16.foot', amt.briefFoot); await wpic('B16-3-window-amt-brief-foot'); await B.tapMan(p, HUNTER)
  /* no invented lead time: an event just BEFORE the BRIEF row's start is clean */
  await B.setGroundTimes(W, p, DI, 'OPS BRIEF', '10:40', '10:58')
  const w0 = await B.win(p); const h0 = B.man(w0, HUNTER), l0 = B.man(w0, LEDGER)
  amt.lead = { title: w0.title, hunter: h0 ? (h0.why || '(listed, no flag)') : '(not listed)', ledger: l0 ? (l0.why || '(listed, no flag)') : '(not listed)' }
  fact('B16.lead', amt.lead)
  L.check('B16 an event at 10:40–10:58, before the BRIEF row starts: Hunter and Ledger listed, no AMT flag (no lead time invented)', !!h0 && !!l0 && !simFlag(h0) && !simFlag(l0), amt.lead)
  await wpic('B16-4-window-before-amt-brief-clean')
})
row('B16', 'AMT block typed BRIEF 11:00 · BOX 11:30–12:30 · DEBRIEF 12:30; Hunter and Ledger put on the BOX by tap + crew list; OPS BRIEF typed 11:10–11:20, its count tapped, Hunter tapped; then 10:40–10:58 behind the window',
  `${JSON.stringify(amt.brief)}; foot "${amt.briefFoot}"; before the BRIEF row: ${JSON.stringify(amt.lead)}`, 'n/a (a read)', L.results.filter(r => /^B16/.test(r.name)).every(r => r.ok) ? 'PASS' : 'FAIL', pics.filter(f => /^B16/.test(f)))
await try_('B17', async () => {
  await B.setGroundTimes(W, p, DI, 'OPS BRIEF', '12:40', '12:50')
  const w = await B.win(p)
  const h = B.man(w, HUNTER), l = B.man(w, LEDGER)
  const want = 'No time for the AMT debrief — OPS BRIEF sits inside 12:30–13:00'
  amt.debrief = { title: w.title, hunter: h && h.why, ledger: l && l.why, all: B.flagged(w) }
  fact('B17.window', amt.debrief)
  L.check('B17 12:40–12:50: Hunter and Ledger amber with the AMT debrief sentence (12:30–13:00, the DEBRIEF row\'s blank end + 30 min)', !!h && !!l && h.flag === 'AMBER' && h.why === want && l.why === want, amt.debrief)
  await pic('B17-1-board-window-amt-debrief'); await wpic('B17-2-window-amt-debrief')
  /* past the assumed half hour */
  await B.setGroundTimes(W, p, DI, 'OPS BRIEF', '13:05', '13:20')
  const w1 = await B.win(p); const h1 = B.man(w1, HUNTER)
  amt.past = h1 ? (h1.why || '(listed, no flag)') : '(not listed)'
  L.check('B17 13:05–13:20 (past the debrief): Hunter carries no AMT flag', !!h1 && !simFlag(h1), amt.past)
  /* the DEBRIEF row's own END typed: the recorded window is used, nothing added */
  await W.boardText(p, `sr:${DI}.amt.2.end`, '12:45')
  fact('B17.simw.end', await p.evaluate(d => window.SIMW[d], DI))
  await B.setGroundTimes(W, p, DI, 'OPS BRIEF', '12:50', '12:58')
  const w2 = await B.win(p); const h2 = B.man(w2, HUNTER)
  amt.endTyped_outside = h2 ? (h2.why || '(listed, no flag)') : '(not listed)'
  await wpic('B17-3-window-debrief-end-typed-outside')
  await B.setGroundTimes(W, p, DI, 'OPS BRIEF', '12:32', '12:42')
  const w3 = await B.win(p); const h3 = B.man(w3, HUNTER)
  amt.endTyped_inside = h3 ? (h3.why || '(listed, no flag)') : '(not listed)'
  await wpic('B17-4-window-debrief-end-typed-inside')
  fact('B17.endTyped', amt)
  L.check('B17 DEBRIEF row typed 12:30–12:45: an event at 12:50–12:58 is NOT flagged', !!h2 && !simFlag(h2), amt.endTyped_outside)
  L.check('B17 …and one at 12:32–12:42 is: "…sits inside 12:30–12:45"', !!h3 && h3.why === 'No time for the AMT debrief — OPS BRIEF sits inside 12:30–12:45', amt.endTyped_inside)
  await W.boardText(p, `sr:${DI}.amt.2.end`, '')
  await B.closeWin(p)
})
row('B17', 'Behind the window: OPS BRIEF 12:40–12:50; 13:05–13:20; the DEBRIEF row\'s end typed 12:45 then OPS BRIEF 12:50–12:58 and 12:32–12:42; the end blanked again',
  JSON.stringify(amt), 'n/a (a read)', L.results.filter(r => /^B17/.test(r.name)).every(r => r.ok) ? 'PASS' : 'FAIL', pics.filter(f => /^B17/.test(f)))

/* the warning list — a NAMED man on a ground row inside his own sim brief / debrief; a named ground crewman */
const wl = {}
await try_('B19w', async () => {
  const r1 = await B.addGround(L, W, p, DI, 'ADMIN TALK', '09:45', '09:58')
  fact('B19w.put.tal', await handPut(p, `g:${DI}.${r1}.+`, TAL))
  const r2 = await B.addGround(L, W, p, DI, 'GC TASK', '09:46', '09:57')
  fact('B19w.put.gc', await handPut(p, `g:${DI}.${r2}.+`, GC))
  const r3 = await B.addGround(L, W, p, DI, 'AMT TALK', '11:10', '11:20')
  fact('B19w.put.hunter', await handPut(p, `g:${DI}.${r3}.+`, HUNTER))
  const l1 = await B.warnLines(p); wl.brief = l1.filter(s => /Talisman|Ratchet|Hunter|Echo|Nomad/.test(s)); fact('B19w.lines.brief', wl.brief)
  await p.evaluate(() => { const s = document.querySelector('#sbWarn'); if (s) s.scrollIntoView({ block: 'start' }) }); await B.sleep(200)
  await pic('B19w-1-warning-list-named-man-brief')
  L.check('B19w the list reads "Talisman — No time for the OFT EP-1 brief — ADMIN TALK sits inside 09:45–10:00"', l1.includes('Talisman — No time for the OFT EP-1 brief — ADMIN TALK sits inside 09:45–10:00'), wl.brief)
  L.check('B19w the list reads "Hunter — No time for the AMT brief — AMT TALK sits inside 11:00–11:30"', l1.includes('Hunter — No time for the AMT brief — AMT TALK sits inside 11:00–11:30'), wl.brief)
  L.check('B19w no sim brief / debrief line for Ratchet (ground crew, on the sim\'s extras and named on GC TASK 09:46–09:57)', !l1.some(s => /Ratchet — No time for the (OFT|AMT)/.test(s)), l1.filter(s => /Ratchet/.test(s)))
  await B.setGroundTimes(W, p, DI, 'ADMIN TALK', '11:05', '11:25')
  await B.setGroundTimes(W, p, DI, 'AMT TALK', '12:40', '12:50')
  const l2 = await B.warnLines(p); wl.debrief = l2.filter(s => /Talisman|Ratchet|Hunter|Echo|Nomad/.test(s)); fact('B19w.lines.debrief', wl.debrief)
  await p.evaluate(() => { const s = document.querySelector('#sbWarn'); if (s) s.scrollIntoView({ block: 'start' }) }); await B.sleep(200)
  await pic('B19w-2-warning-list-named-man-debrief')
  L.check('B19w the list reads "Talisman — No time for the OFT EP-1 debrief — ADMIN TALK sits inside 11:00–11:30"', l2.includes('Talisman — No time for the OFT EP-1 debrief — ADMIN TALK sits inside 11:00–11:30'), wl.debrief)
  L.check('B19w the list reads "Hunter — No time for the AMT debrief — AMT TALK sits inside 12:30–13:00"', l2.includes('Hunter — No time for the AMT debrief — AMT TALK sits inside 12:30–13:00'), wl.debrief)
  fact('B19w.all', l2)
})
row('B19w', 'Three ground rows added: ADMIN TALK 09:45–09:58 (Talisman named), GC TASK 09:46–09:57 (Ratchet named), AMT TALK 11:10–11:20 (Hunter named); read the day\'s warning list; then ADMIN TALK → 11:05–11:25, AMT TALK → 12:40–12:50',
  `brief: ${JSON.stringify(wl.brief)}; debrief: ${JSON.stringify(wl.debrief)}`, 'n/a (a read)', L.results.filter(r => /^B19w/.test(r.name)).every(r => r.ok) ? 'PASS' : 'FAIL', pics.filter(f => /^B19w/.test(f)))

/* B18 — the issued face: publish the day with the overlap, then move the sim on the working copy */
const iss = {}
await try_('B18', async () => {
  await B.setGroundTimes(W, p, DI, 'OPS BRIEF', '09:45', '09:58')
  const w0 = await B.openChip(p, OPS); iss.before = { one: w0.one, from: w0.from, tal: B.man(w0, TAL), echo: B.man(w0, ECHO), nomad: B.man(w0, NOMAD) }
  fact('B18.working.before', { one: w0.one, from: w0.from, flagged: B.flagged(w0) })
  await B.closeWin(p)
  await p.evaluate(() => window.scrollTo(0, 0))
  iss.sign = await W.signDay(p, DI); iss.pub = await W.publishDay(p, DI); iss.head = await W.head(p, DI)
  fact('B18.publish', { sign: iss.sign, pub: iss.pub, head: iss.head, toasts: await W.toasts(p) })
  await pic('B18-1-board-published')
  await L.settle(p)
  if (process.env.HP_STATE_OUT) await ctx.storageState({ path: process.env.HP_STATE_OUT })
  iss.keys = Object.keys(await L.rows(p)).filter(k => k.startsWith('weeks/'))
  fact('B18.weekRows', iss.keys)
  /* View-only Sched, before any change: the issued window */
  await W.boardOff(p); await L.go(p, 'viewsched'); await W.showDay(p, DI, '#vWeek')
  const v0 = await B.openChip(p, OPS, `#vWeek .day[data-day="${DI}"]`)
  iss.view0 = { chip: v0.chip, chipTitle: v0.chipTitle, one: v0.one, from: v0.from, tal: B.man(v0, TAL), echo: B.man(v0, ECHO), flagged: B.flagged(v0) }
  fact('B18.view.before', { ...iss.view0, tal: iss.view0.tal && iss.view0.tal.why, echo: iss.view0.echo && iss.view0.echo.why })
  await pic('B18-2-viewsched-issued-window'); await wpic('B18-3-viewsched-issued-window-close')
  await B.closeWin(p)
  /* the working copy: the sim moved to 16:30–17:30 — the overlap is gone today */
  await W.boardOn(p, DI)
  await W.boardText(p, `sr:${DI}.oft.0.str`, '16:30'); await W.boardText(p, `sr:${DI}.oft.0.end`, '17:30')
  fact('B18.toasts.move', await W.toasts(p))
  iss.headAfter = await W.head(p, DI); fact('B18.head.after', iss.headAfter)
  fact('B18.simw.after', await p.evaluate(d => window.SIMW[d], DI))
  const w1 = await B.openChip(p, OPS)
  iss.working = { chip: w1.chip, one: w1.one, from: w1.from, tal: B.man(w1, TAL), echo: B.man(w1, ECHO), flagged: B.flagged(w1) }
  fact('B18.working.after', { ...iss.working, tal: iss.working.tal ? (iss.working.tal.why || '(listed, no flag)') : '(not listed)', echo: iss.working.echo ? (iss.working.echo.why || '(listed, no flag)') : '(not listed)' })
  await pic('B18-4-board-working-after-sim-moved'); await wpic('B18-5-window-working-after-sim-moved')
  L.check('B18 the working copy\'s window (sim now 16:30–17:30): Talisman and Echo listed for 09:45–09:58 with NO sim flag', !!iss.working.tal && !!iss.working.echo && !simFlag(iss.working.tal) && !simFlag(iss.working.echo), iss.working.flagged)
  await B.closeWin(p)
  await W.boardOff(p); await L.go(p, 'viewsched'); await W.showDay(p, DI, '#vWeek')
  const v1 = await B.openChip(p, OPS, `#vWeek .day[data-day="${DI}"]`)
  iss.view1 = { chip: v1.chip, chipTitle: v1.chipTitle, one: v1.one, from: v1.from, tal: B.man(v1, TAL), echo: B.man(v1, ECHO), flagged: B.flagged(v1) }
  fact('B18.view.after', { ...iss.view1, tal: iss.view1.tal && iss.view1.tal.why, echo: iss.view1.echo && iss.view1.echo.why })
  const want = 'No time for the OFT EP-1 brief — OPS BRIEF sits inside 09:45–10:00'
  L.check('B18 View-only Sched\'s window still lists Talisman and Echo and flags them from the day AS ISSUED (sim 10:00–11:00)', !!iss.view1.tal && !!iss.view1.echo && iss.view1.tal.flag === 'AMBER' && iss.view1.tal.why === want && iss.view1.echo.why === want, { tal: iss.view1.tal, echo: iss.view1.echo })
  L.check('B18 …and says it is the day as issued', /issued/i.test(iss.view1.from + ' ' + iss.view1.chipTitle), { from: iss.view1.from, title: iss.view1.chipTitle })
  L.check('B18 the issued count did not move with the working copy\'s change', iss.view0.one === iss.view1.one, { before: iss.view0.one, after: iss.view1.one })
  await pic('B18-6-viewsched-issued-window-after-sim-moved'); await wpic('B18-7-viewsched-window-close-after-sim-moved')
  await B.tapMan(p, TAL); iss.viewFoot = (await B.win(p)).foot; fact('B18.view.foot', iss.viewFoot); await wpic('B18-8-viewsched-window-foot')
  await B.closeWin(p)
  /* the edit week (not the board) reads the working copy too */
  await L.go(p, 'editsched'); await W.showDay(p, DI)
  const e1 = await B.openChip(p, OPS, `#eWeek .day[data-day="${DI}"]`)
  iss.editWeek = { chip: e1.chip, one: e1.one, from: e1.from, tal: B.man(e1, TAL) ? (B.man(e1, TAL).why || '(listed, no flag)') : '(not listed)', flagged: B.flagged(e1) }
  fact('B18.editweek', iss.editWeek)
  await pic('B18-9-editweek-working-window')
  await B.closeWin(p)
  /* a reload: the issued face still reads its own record */
  await L.reloadCompare(p, 'B18 reload', 'a', { page: 'viewsched' })
  await W.showDay(p, DI, '#vWeek')
  const v2 = await B.openChip(p, OPS, `#vWeek .day[data-day="${DI}"]`)
  iss.view2 = { one: v2.one, from: v2.from, tal: B.man(v2, TAL) && B.man(v2, TAL).why, echo: B.man(v2, ECHO) && B.man(v2, ECHO).why }
  fact('B18.view.reloaded', iss.view2)
  L.check('B18 after a reload View-only Sched\'s window flags them the same', iss.view2.tal === want && iss.view2.echo === want, iss.view2)
  await pic('B18-10-viewsched-window-after-reload')
  await B.closeWin(p)
})
row('B18', 'OPS BRIEF back at 09:45–09:58; the four sign-off boxes picked, Publish day; View-only Sched → the count → the window; back on the board the sim retyped 16:30–17:30; the board\'s window, the edit week\'s window, View-only Sched\'s window; reload; View-only Sched\'s window again',
  `published: ${JSON.stringify(iss.pub)} head ${JSON.stringify(iss.head && iss.head.tag)}; after the sim moved the day head reads ${JSON.stringify(iss.headAfter && { tag: iss.headAfter.tag, pending: iss.headAfter.pending, signs: iss.headAfter.signs })}; working window: ${JSON.stringify(facts['B18.working.after'])}; View-only Sched before: ${JSON.stringify(facts['B18.view.before'])}; after: ${JSON.stringify(facts['B18.view.after'])}; foot "${iss.viewFoot}"; edit week: ${JSON.stringify(iss.editWeek)}; reloaded: ${JSON.stringify(iss.view2)}`,
  `week rows stored: ${JSON.stringify(iss.keys)}`, L.results.filter(r => /^B18/.test(r.name)).every(r => r.ok) ? 'PASS' : 'FAIL', pics.filter(f => /^B18/.test(f)))

fact('errors', errors)
B.saveSection('w1-sim-flags-desktop', { table, checks: L.results, facts, errors, pics })
console.log(`\n${L.results.filter(r => r.ok).length}/${L.results.length} checks passed; errors: ${errors.length}`)
await browser.close()
