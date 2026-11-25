// swd-w14a — walker w14a: what counts as planned (C1–C11; D2564, D2565, D2568, D2560), each case a fresh world, both sizes.
// Run from raptor-port/, one size a process:  SZ=d W14A_RUN=run1 [ONLY=c1,c4] node scripts/handpass/swd-w14a.mjs
// Plan: docs/superpowers/briefs/2026-11-25-sans-words-w14-plan.md §C. Routes proved by swd-w14a-probe.mjs (recipes.md).
// Demo days (swd-w12-probe, re-read in c10): Ranger has no demo row Fri 17 – Sun 19; Mon 20 his demo waves; Thu 23 a ground row.
import './swd-w14a-env.mjs'
import { writeFileSync } from 'node:fs'
import path from 'node:path'
const Z = await import('./swd-w14a-lib.mjs')
const { K, X, T, L, W5, RANGER, CASPER, D, WK1, WK2, WORDS: Wd, remIs, bell, say, sayB, readReminder, need, asR, asS, post, scene, sleep, plan, planSim, remDays, remSay, J,
  addLine, lineTimes, armSeat, armZone, crewSay, struckSans, printedAny, warns, warnSay, cx } = Z
console.log('VERSION swd-w14a 8 · size', process.env.SZ || 'd', '· run', process.env.W14A_RUN || 'run1', '· only', process.env.ONLY || 'all')
const SZ = process.env.SZ || 'd'
const chk = (W, id, what, ok, note, pic) => W.rec(id, what, !!ok, note, pic)
const rec = (W, id, what, note, pic) => W.rec(id, what, 'REC', note, pic)
const F17 = 'Fri 17 Jul'
const fitChk = (W, id, b) => chk(W, id, 'the bell: every line inside its panel, words wrapped; Mark all read reachable', b.allFit && b.markAll !== 'off screen', `all fit ${b.allFit} · Mark all read ${b.markAll}`, b.pic)
const others = b => b.lines.filter(l => l !== b.rem)
const DOW = { 17: 'Fri', 18: 'Sat', 19: 'Sun', 20: 'Mon', 21: 'Tue' }

/* a tap on his reminder: which SANS day it opens (swd-w12's tapOpens, copied) */
async function tapOpens(p, W, b, d, id) {
  if (!b.rem) { chk(W, id, `the reminder's tap opens the SANS calendar on ${DOW[d]} ${d} with its window`, false, 'no reminder to tap: ' + sayB(b), b.pic); return }
  const t = await X.bellTap(p, W, b.rem.id, id.replace(/\./g, '-'))
  const re = new RegExp(`${DOW[d]}\\w*\\s*${d}\\b`, 'i')
  chk(W, id, `the reminder's tap opens the SANS calendar on ${DOW[d]} ${d} with its window (D2340)`, t.page === 'inputs' && t.cal && t.win && re.test(t.win.ttl), `page ${t.page} · ${t.month} · window "${t.win && t.win.ttl}" · + Commitment ${t.win && t.win.add}`, t.pic)
  await T.closeAll(p, W)
}
/* Saber's three reads of a day: the crew list (no seat armed), an armed seat (given), the warning list */
async function saberReads(p, W, s, di, dow, arms) {
  await asS(p, W)
  if (di >= 7) await T.gotoWeek(p, W, WK2); else await T.gotoWeek(p, W, WK1)
  const wk = await T.weekCrewOf(p, W, dow, RANGER, `${s}-crew`)
  rec(W, `${s}.ii-a`, `Edit Schedule crew list, ${dow}, no seat armed: Ranger's puck`, `${wk.day} · ${crewSay(wk.c)}`, wk.pic)
  chk(W, `${s}.ii-a2`, 'no reason line printed under his name in the list (D2420)', !printedAny(wk.c), crewSay(wk.c), wk.pic)
  const out = {}
  for (const a of arms) {
    await L.openBoard(p, W, di % 7)
    const r = a.zone ? await armZone(p, W, a.zone, `${s}-${a.tag}`) : await armSeat(p, W, a.key, `${s}-${a.tag}`, false)
    out[a.tag] = r
    rec(W, `${s}.ii-${a.tag}`, `board ${dow}: ${a.what} armed — Ranger's puck (struck? hover title)`, `armed ${r.armed} · ${crewSay(r.c)}`, r.pic)
  }
  const w = await warns(p, W, di % 7, `${s}`)
  rec(W, `${s}.iii`, `the board's warning list for ${dow}`, warnSay(w), w.pic)
  await L.closeBoard(p, W)
  await T.gotoWeek(p, W, WK1)
  return { out, w }
}
/* a timed line nobody is on, for the armed-seat read */
const spareLine = (p, W, di, cs = 'W14X') => addLine(p, W, di, { cs, to: '19:00', ld: '20:00' })
async function seat(p, W, s, di, o = {}) {
  const a = await addLine(p, W, di, { cs: o.cs || 'W14A', to: o.noTimes ? '' : (o.to || '21:00'), ld: o.noTimes ? '' : (o.ld || '22:00') })
  const r = await armSeat(p, W, `${di}.${a.wi}.0.0.p`, `${s}-seat`)
  need(W, `${s}.f2`, `a flying line ${o.noTimes ? 'with NO times' : (o.to || '21:00') + '–' + (o.ld || '22:00')} on day ${di}, its FCP armed and Ranger picked (read back)`, r.placed, `${J(a.f)} · while armed: ${crewSay(r.c)}`, r.pic)
  await L.closeBoard(p, W)
  return a
}
async function ground(p, W, s, di, name = 'W14A BRIEF') {
  await L.openBoard(p, W, di)
  const g = await L.groundRow(p, W, di, name, '21:00', '21:30', RANGER)
  need(W, `${s}.f2g`, `a Ground Programme row "${name}" 21:00–21:30 naming Ranger on day ${di} (read back)`, J(g.row || '').includes(RANGER), J(g.row))
  await L.closeBoard(p, W)
  return g
}

/* ---------- C1–C3: ground row, duty desk, all hands — never planned (D2564) ---------- */
async function cNo(p, W, o) {
  const s = o.id
  await post(p, W, RANGER, D[17], `${s}.f1`)
  let arms = []
  if (o.kind === 'ground') {
    await ground(p, W, s, 5)
    /* a second ground row, nobody on it, to arm (arming his own row reads "already on … not added twice", run1) */
    await L.openBoard(p, W, 5)
    const g2 = await L.groundRow(p, W, 5, 'W14A OTHER', '20:00', '20:30', null)
    await L.closeBoard(p, W)
    arms = [{ tag: 'gr', what: 'a second ground row\'s "+ add" (nobody on it)', zone: `[data-fill="g:5.${g2.ri}.+"]` }]
  } else if (o.kind === 'desk') {
    await L.openBoard(p, W, 5)
    const before = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-fill], #schedBoard [data-slot]')].map(e => e.dataset.fill || e.dataset.slot))
    await W.press(p, L.B('[data-dradd="5.0"]'), 'dradd'); await sleep(600)
    const after = await p.evaluate(() => [...document.querySelectorAll('#schedBoard [data-fill], #schedBoard [data-slot]')].map(e => e.dataset.fill || e.dataset.slot))
    const z = after.filter(k => !before.includes(k)).find(k => /^d:5\.0\./.test(k))
    if (z) await L.armAndPick(p, W, `[data-fill="${z}"], [data-slot="${z}"]`, RANGER, 'duty')
    const h = await T.holds(p, RANGER)
    need(W, `${s}.f2d`, 'Sat 18: duty desk 1 → + Row, the row armed and Ranger picked (read back: what he holds)', /Jul 18:[^|]*dutywaves/.test(h), h, await W.pic(p, `${s}-desk`))
    await L.closeBoard(p, W)
    const n = await p.evaluate(() => (window.DAYS[5].dutywaves[0].rows || []).length)
    arms = [{ tag: 'desk', what: 'a new duty row\'s place', zone: `[data-fill="d:5.0.${n}.+"]`, add: true }]
  } else {
    await L.openBoard(p, W, 4)
    const a = await L.progRow(p, W, 4, 'W14A ALLHANDS', '21:00', '21:30', RANGER)
    need(W, `${s}.f2a`, 'Fri 17: a Common Programme (all hands) row 21:00–21:30 naming Ranger (read back)', J(a.row || '').includes(RANGER), J(a.row))
    /* a second all-hands row, nobody on it, to arm (arming his own row reads "already on … not added twice", run1) */
    await W.press(p, L.B('[data-padd="4"]'), 'add-item2'); await sleep(400)
    const ri2 = await p.evaluate(() => window.DAYS[4].allhands.length - 1)
    await L.typeBox(p, W, `[data-bfld="ap:4.${ri2}.prog"]`, 'W14A OTHER')
    await L.typeBox(p, W, `[data-bfld="ap:4.${ri2}.str"]`, '20:00')
    await L.typeBox(p, W, `[data-bfld="ap:4.${ri2}.end"]`, '20:30')
    arms = [{ tag: 'ah', what: 'a second all-hands row\'s "+ add" (nobody on it)', zone: `[data-fill="a:4.${ri2}.+"]` }]
    await L.closeBoard(p, W)
  }
  const di = o.kind === 'allhands' ? 4 : 5, dow = o.kind === 'allhands' ? 'fri' : 'sat'
  /* a timed flying line nobody is on, for the armed flying seat */
  const x = await spareLine(p, W, di)
  await L.closeBoard(p, W)
  if (o.kind === 'desk') { await L.openBoard(p, W, 5); await W.press(p, L.B('[data-dradd="5.0"]'), 'dradd2'); await sleep(500); await L.closeBoard(p, W) }
  const r = await saberReads(p, W, s, di, dow, [...arms.map(a => ({ ...a })), { tag: 'fly', what: 'a flying seat (an empty timed line)', key: `${di}.${x.wi}.0.0.p` }])
  const z = r.out[arms[0].tag]
  chk(W, `${s}.ii-b`, `armed on the ${o.kind === 'ground' ? 'ground row' : o.kind === 'desk' ? 'duty desk' : 'all-hands row'}: Ranger NOT struck (w13 s24: a ground row takes a SANS man; D2564)`, z && z.c && !struckSans(z.c), crewSay(z && z.c), z && z.pic)
  chk(W, `${s}.iii-b`, 'no SANS warning in the day\'s warning list (D2564)', r.w.sans.length === 0, warnSay(r.w), r.w.pic)
  await asR(p, W)
  const b = await bell(p, W, `${s}-i`)
  chk(W, `${s}.i`, `Ranger's bell: NO SANS reminder, the bell not lit (D2564: a ${o.kind} never puts a day in it)`, !b.rem && b.lit === false, sayB(b), b.pic)
  rec(W, `${s}.i-r`, `anything in his bell about the ${o.kind} (D2566's info line is NOT built — RECORD only)`, sayB(b), b.pic)
  fitChk(W, `${s}.i-f`, b)
}

/* ---------- C4: a cockpit seat with times — planned ---------- */
async function c4(p, W) {
  const s = 'c4'
  await post(p, W, RANGER, D[17], `${s}.f1`)
  await seat(p, W, s, 5)
  const x = await spareLine(p, W, 5)
  const r = await saberReads(p, W, s, 5, 'sat', [{ tag: 'fly', what: 'a second timed line\'s FCP', key: `5.${x.wi}.0.0.p` }])
  chk(W, `${s}.ii-b`, 'the armed flying seat strikes him in SANS Avail (D2564: the same the crew list greys)', struckSans(r.out.fly.c), crewSay(r.out.fly.c), r.out.fly.pic)
  rec(W, `${s}.iii-b`, 'the warning list beside the reminder: does it carry a SANS line for Sat 18? (plan: "the warning reads" — RECORD, a candidate if absent)', warnSay(r.w), r.w.pic)
  await asR(p, W)
  let b = await bell(p, W, `${s}-i`)
  chk(W, `${s}.i`, 'ONE reminder, unread, the bell lit: "You\'re SANS from Fri 17 Jul." / "You\'re planned on Sat 18 Jul with nothing filed. Tap to file for availability." (D2564, D2340, D2390)', remIs(b.rem, Wd.rem(F17, 'Sat 18 Jul')) && b.rem.unread && b.lit === true && b.lines.filter(l => /^sansdue/.test(l.id)).length === 1, sayB(b), b.pic)
  fitChk(W, `${s}.i-f`, b)
  await tapOpens(p, W, b, 18, `${s}.tap`)
  await K.file(p, W, D[18], null, `${s}.file`)
  b = await bell(p, W, `${s}-after`)
  chk(W, `${s}.after`, 'Ranger files Sat 18 (Fly): the reminder goes, no take-back line, no SANS change line', !b.rem && b.change.length === 0 && b.struck.length === 0, sayB(b), b.pic)
}

/* ---------- C5: an OFT / AMT box — planned; the filing's kind ---------- */
async function c5(p, W, o) {
  const s = o.id
  await post(p, W, RANGER, D[17], `${s}.f1`)
  await planSim(p, W, 19, o.kind, `${s}.f2`)
  await T.gotoWeek(p, W, WK1)
  const ad = await T.W5.addSim(p, W, 6, o.kind, 'W14X SIM', '19:00', '19:45')
  await L.closeBoard(p, W)
  const r = await saberReads(p, W, s, 6, 'sun', [{ tag: 'sim', what: `a second ${o.kind.toUpperCase()} box's place`, zone: `[data-fill="s:6.${o.kind}.${ad.ri}.+"]` }])
  chk(W, `${s}.ii-b`, `the armed ${o.kind.toUpperCase()} box strikes him in SANS Avail (D2564)`, struckSans(r.out.sim.c), crewSay(r.out.sim.c), r.out.sim.pic)
  rec(W, `${s}.iii-b`, 'the warning list beside the reminder (RECORD)', warnSay(r.w), r.w.pic)
  await asR(p, W)
  let b = await bell(p, W, `${s}-i`)
  chk(W, `${s}.i`, `ONE reminder naming Sun 19, unread, the bell lit (D2564: "a sim (OFT, AMT)")`, remIs(b.rem, Wd.rem(F17, 'Sun 19 Jul')) && b.rem.unread && b.lit === true, sayB(b), b.pic)
  fitChk(W, `${s}.i-f`, b)
  const kinds = o.fileKinds
  const f = await T.file(p, W, D[19], null, kinds, null, `${s}-file`)
  need(W, `${s}.file`, `Ranger files Sun 19 with ${kinds.join('+').toUpperCase()} only`, !!f.iid, f.iid ? J(f.made) : f.refused, f.pic)
  await T.closeAll(p, W)
  b = await bell(p, W, `${s}-after`)
  if (o.match) chk(W, `${s}.after`, `filed ${kinds.join('+').toUpperCase()} only: the reminder goes`, !b.rem, sayB(b), b.pic)
  else rec(W, `${s}.after`, `filed ${kinds.join('+').toUpperCase()} only for a ${o.kind.toUpperCase()} day: whether the reminder goes (no ruling matches a filing's kind to the seat — RECORD)`, sayB(b), b.pic)
}

/* ---------- C6: cancelled and un-cancelled (D2568, D2560) ---------- */
async function c6(p, W, o) {
  const s = o.id
  await post(p, W, RANGER, D[17], `${s}.f1`)
  let btn, di, d
  if (o.sim) { await planSim(p, W, 19, 'oft', `${s}.f2`); di = 6; d = 19; const ri = await p.evaluate(() => window.DAYS[6].sims.oft.length - 1); btn = `[data-srcx="6.oft.${ri}"]` }
  else { const a = await seat(p, W, s, 5); di = 5; d = 18; btn = `[data-lcx="5.${a.wi}.0.0"]`; o.key = `5.${a.wi}.0.0.w` }
  await T.gotoWeek(p, W, WK1)
  await asR(p, W)
  let b = await bell(p, W, `${s}-0`)
  chk(W, `${s}.0`, `before the cancel: the reminder names ${DOW[d]} ${d} Jul, unread`, remIs(b.rem, Wd.rem(F17, `${DOW[d]} ${d} Jul`)) && b.rem.unread, sayB(b), b.pic)
  if (o.read) { const rr = await readReminder(p, W, 'markall', `${s}-read`); need(W, `${s}.read`, 'Ranger reads the reminder (Mark all read)', rr.ok, rr.why, rr.pic) }
  await asS(p, W)
  const c1 = await cx(p, W, di, btn, true, `${s}-cx`)
  need(W, `${s}.cx`, `Saber cancels the ${o.sim ? 'OFT box' : 'flying line'} (CX → Cancel line, reason WX)`, c1.ok, c1.why || '', c1.pic)
  await L.closeBoard(p, W)
  if (!o.sim) {
    const r = await saberReads(p, W, `${s}-cxd`, 5, 'sat', [{ tag: 'cxseat', what: 'the cancelled line\'s own RCP seat', key: o.key }])
    chk(W, `${s}.cx-arm`, 'armed onto the cancelled line: the crew list STILL strikes him (D2568: "as built")', struckSans(r.out.cxseat.c), crewSay(r.out.cxseat.c), r.out.cxseat.pic)
    rec(W, `${s}.cx-warn`, 'the warning list on the cancelled line\'s day (D2568 names only the crew list — RECORD)', warnSay(r.w), r.w.pic)
  }
  await asR(p, W)
  b = await bell(p, W, `${s}-1`)
  chk(W, `${s}.1`, `cancelled: ${DOW[d]} ${d} leaves the reminder — the line goes (its only day); no take-back line (D2568)`, !b.rem && b.change.length === 0 && b.struck.length === 0, sayB(b), b.pic)
  await asS(p, W)
  const c2 = await cx(p, W, di, btn, false, `${s}-uncx`)
  need(W, `${s}.uncx`, 'Saber un-cancels it (CX → Un-cancel)', c2.ok, c2.why || '', c2.pic)
  await L.closeBoard(p, W)
  await asR(p, W)
  b = await bell(p, W, `${s}-2`)
  if (o.read) chk(W, `${s}.2`, `un-cancelled after he had read it: ${DOW[d]} ${d} back, still READ, the bell not lit (D2560: a day he saw, put back)`, remIs(b.rem, Wd.rem(F17, `${DOW[d]} ${d} Jul`)) && !b.rem.unread && b.lit === false, sayB(b), b.pic)
  else chk(W, `${s}.2`, `un-cancelled, never read: ${DOW[d]} ${d} back, UNREAD, the bell lit`, remIs(b.rem, Wd.rem(F17, `${DOW[d]} ${d} Jul`)) && b.rem.unread && b.lit === true, sayB(b), b.pic)
}

/* ---------- C7: a line with no times (D2568) ---------- */
async function c7(p, W) {
  const s = 'c7'
  await post(p, W, RANGER, D[17], `${s}.f1`)
  const a = await seat(p, W, s, 5, { noTimes: true })
  const x = await addLine(p, W, 5, { cs: 'W14X' })
  await L.closeBoard(p, W)
  const r = await saberReads(p, W, s, 5, 'sat', [{ tag: 'nt', what: 'a second NO-TIMES line\'s FCP', key: `5.${x.wi}.0.0.p` }])
  rec(W, `${s}.ii-b`, 'armed on a line with no times: is he struck? (the round-5 builder: "an armed seat with no times does not ask"; his reminder names the day — a difference D2568 did not name: finding-candidate if not struck)', crewSay(r.out.nt.c), r.out.nt.pic)
  rec(W, `${s}.iii-b`, 'the warning list (RECORD)', warnSay(r.w), r.w.pic)
  await asR(p, W)
  let b = await bell(p, W, `${s}-i`)
  chk(W, `${s}.i`, 'ONE reminder naming Sat 18, unread, the bell lit (D2568: counts before its times are typed)', remIs(b.rem, Wd.rem(F17, 'Sat 18 Jul')) && b.rem.unread && b.lit === true, sayB(b), b.pic)
  const rr = await readReminder(p, W, 'markall', `${s}-read`)
  need(W, `${s}.read`, 'Ranger reads it (Mark all read)', rr.ok, rr.why, rr.pic)
  await asS(p, W)
  const tm = await lineTimes(p, W, 5, a.wi, '21:00', '22:00')
  need(W, `${s}.times`, 'Saber types the times 21:00–22:00 on his line', tm.to === '21:00' && tm.ld === '22:00', J(tm), await W.pic(p, `${s}-times`))
  const y = await spareLine(p, W, 5, 'W14Y')
  await L.closeBoard(p, W)
  const r2 = await saberReads(p, W, `${s}-t`, 5, 'sat', [{ tag: 'tm', what: 'a timed line\'s FCP', key: `5.${y.wi}.0.0.p` }])
  rec(W, `${s}.ii-c`, 'once a line has times, the armed seat on it: Ranger\'s puck', crewSay(r2.out.tm.c), r2.out.tm.pic)
  await asR(p, W)
  b = await bell(p, W, `${s}-after`)
  chk(W, `${s}.after`, 'times typed: still one line, one Sat 18, READ, the bell not lit (no relight)', remIs(b.rem, Wd.rem(F17, 'Sat 18 Jul')) && !b.rem.unread && b.lit === false && b.lines.filter(l => /^sansdue/.test(l.id)).length === 1, sayB(b), b.pic)
}

/* ---------- C8: a filing deleted (D2565, D2560) ---------- */
async function c8(p, W, o) {
  const s = o.id
  await post(p, W, RANGER, D[17], `${s}.f1`)
  if (o.groundOnly) await ground(p, W, s, 5)
  else { await seat(p, W, s, 5); await planSim(p, W, 19, 'oft', `${s}.f3`) }
  await T.gotoWeek(p, W, WK1)
  await asR(p, W)
  let b = await bell(p, W, `${s}-0`)
  if (o.groundOnly) chk(W, `${s}.0`, 'ground row only: no reminder (D2564)', !b.rem, sayB(b), b.pic)
  if (o.readFirst) { const rr = await readReminder(p, W, 'markall', `${s}-r0`); need(W, `${s}.r0`, 'he reads the reminder naming Sat 18, Sun 19 (Mark all read)', rr.ok && remDays(rr.before.rem) === 'Sat 18, Sun 19 Jul', rr.why, rr.pic) }
  const f = await K.file(p, W, D[18], null, `${s}.file`)
  b = await bell(p, W, `${s}-1`)
  if (o.groundOnly) chk(W, `${s}.1`, 'filed Sat 18: still no reminder', !b.rem, sayB(b), b.pic)
  else rec(W, `${s}.1`, 'filed Sat 18: the reminder (names Sun 19)', sayB(b), b.pic)
  if (!o.groundOnly && !o.readFirst) { const rr = await readReminder(p, W, 'markall', `${s}-r1`); need(W, `${s}.r1`, 'he reads the reminder, now naming Sun 19 only (Mark all read)', rr.ok && remDays(rr.before.rem) === 'Sun 19 Jul', rr.why, rr.pic) }
  if (o.saber) await asS(p, W)
  await T.closeAll(p, W)   /* the bell's list left open covered the SANS month on the phone (run1p2 c8b, c8d) */
  const u = await W5.uncommit(p, W, D[18], f.iid, `${s}-del`)
  need(W, `${s}.del`, `${o.saber ? 'SABER' : 'Ranger'} deletes Ranger's Sat 18 filing (its window's Delete)`, u.ok, u.why || '', u.pic)
  await T.closeAll(p, W)
  if (o.saber) await asR(p, W)
  b = await bell(p, W, `${s}-2`)
  const both = remIs(b.rem, Wd.rem(F17, 'Sat 18, Sun 19 Jul'))
  if (o.groundOnly) chk(W, `${s}.2`, 'deleted: still no reminder at any step (D2564)', !b.rem, sayB(b), b.pic)
  else if (o.readFirst) chk(W, `${s}.2`, 'deleted after he had read Sat 18 in it: "Sat 18, Sun 19 Jul", still READ, not lit (D2560)', both && !b.rem.unread && b.lit === false, sayB(b), b.pic)
  else if (o.saber) rec(W, `${s}.2`, 'Saber deleted it: "Sat 18, Sun 19 Jul" — lit or read? (D2560\'s words: lit; D2565 names only his own delete — RECORD)', sayB(b), b.pic)
  else chk(W, `${s}.2`, 'his own delete of a day he never saw in it: lit, unread, "Sat 18, Sun 19 Jul" (D2565)', both && b.rem.unread && b.lit === true, sayB(b), b.pic)
  if (o.undo) {
    await T.closeAll(p, W)
    const ub = await p.locator('#undoBtn').first().getAttribute('title').catch(() => '')
    await W.press(p, '#undoBtn:visible', 'undo'); await sleep(900)
    b = await bell(p, W, `${s}-3`)
    rec(W, `${s}.3`, `Ranger's top-bar Undo ("${ub}") of the delete: the reminder and its read state (no ruling on an Undo's relight — RECORD)`, sayB(b), b.pic)
  }
}

/* ---------- C9: Hex ticked SANS, no date ahead (D2394 2b), with real seats ---------- */
const WD = { 13: 'Mon', 14: 'Tue', 15: 'Wed', 16: 'Thu', 17: 'Fri', 18: 'Sat', 19: 'Sun', 20: 'Mon', 21: 'Tue', 22: 'Wed', 23: 'Thu', 24: 'Fri', 25: 'Sat', 26: 'Sun' }
const daysSay = ds => ds.length ? ds.slice(0, 3).map(d => `${WD[d]} ${d}`).join(', ') + ' Jul' + (ds.length > 3 ? ` and ${ds.length - 3} more` : '') : ''
/* the days of a week a man is in a flying seat or a sim (read only, from what he holds) */
const seatDays = h => h.split(' | ').filter(x => /\.waves\[|\.sims\./.test(x)).map(x => +(/Jul (\d+):/.exec(x) || [])[1]).filter(Boolean)
async function c9(p, W) {
  const s = 'c9', HEXID = Z.HEX
  const asH = () => T.as(p, W, 'hex', 'x')
  const q = await L.qualsTick(p, W, HEXID, `${s}-f1`)
  need(W, `${s}.f1`, 'Saber ticks Hex SANS on Quals (Edit → his SANS → Done)', q.st && q.st.san === true, J(q.st), q.pic)
  await plan(p, W, 20, `${s}.f2`, { id: CASPER, name: 'W14A WK2', a: '22:00', b: '22:30' })
  await T.gotoWeek(p, W, WK1)
  const h1 = await T.holds(p, HEXID)
  await T.gotoWeek(p, W, WK2)
  const h2 = await T.holds(p, HEXID)
  await T.gotoWeek(p, W, WK1)
  rec(W, `${s}.f3`, "Hex's own rows, both weeks (read, before anything is added)", h1 + ' || ' + h2)
  await planSim(p, W, 18, 'oft', `${s}.f4`, { id: HEXID })
  await T.gotoWeek(p, W, WK2)
  await addLine(p, W, 1, { cs: 'W14H', to: '21:00', ld: '22:00' })
  const wi = await p.evaluate(() => window.DAYS[1].waves.length - 1)
  const r = await armSeat(p, W, `1.${wi}.0.0.p`, `${s}-tue`, true, HEXID)
  need(W, `${s}.f5`, 'Tue 21: a flying line 21:00–22:00, Hex in its FCP (read back)', r.placed, crewSay(r.c), r.pic)
  await L.closeBoard(p, W)
  await plan(p, W, 23, `${s}.f6`, { id: HEXID, name: 'W14A THUBRIEF', a: '21:00', b: '21:30' })
  await T.gotoWeek(p, W, WK1)
  const all = [...seatDays(await (async () => { await T.gotoWeek(p, W, WK1); return T.holds(p, HEXID) })()), ...seatDays(await (async () => { await T.gotoWeek(p, W, WK2); return T.holds(p, HEXID) })()).map(d => d < 13 ? d + 31 : d)].filter(d => d >= 15).sort((a, b) => a - b)
  await T.gotoWeek(p, W, WK1)
  const expect = daysSay(all)
  await asH()
  let b = await bell(p, W, `${s}-1`)
  chk(W, `${s}.1`, `Hex's reminder: "Your SANS availability is needed." / "You're planned on ${expect} with nothing filed…" — his seat and sim days from today (read: ${all.join(', ')}); Thu 23 (a ground row only — his demo Wed 22 is a seat, read) never (D2394 2b, D2564)`, !!b.rem && b.rem.title === 'Your SANS availability is needed.' && remDays(b.rem) === expect && b.rem.unread, sayB(b), b.pic)
  chk(W, `${s}.1w`, 'Thu 23 (a ground row only) NOT counted: the day count equals his seat and sim days', !!b.rem && !/Thu 23/.test(b.rem.body) && remDays(b.rem) === expect, sayB(b), b.pic)
  fitChk(W, `${s}.1f`, b)
  const first = all[0]
  const f = await T.file(p, W, `2026-07-${String(first).padStart(2, '0')}`, null, ['fly', 'oft', 'amt'], null, `${s}-file`)
  need(W, `${s}.file`, `Hex files ${WD[first]} ${first} (Fly, OFT, AMT)`, !!f.iid, f.iid ? J(f.made) : f.refused, f.pic)
  await T.closeAll(p, W)
  b = await bell(p, W, `${s}-2`)
  const rest = all.slice(1)
  chk(W, `${s}.2`, `the reminder shrinks to "${daysSay(rest)}", no "and 0 more"`, !!b.rem && remDays(b.rem) === daysSay(rest) && !/and 0 more/.test(b.rem.body), sayB(b), b.pic)
  const rr = await readReminder(p, W, 'markall', `${s}-read`)
  need(W, `${s}.read`, 'Hex reads it (Mark all read)', rr.ok, rr.why, rr.pic)
  await asS(p, W)
  /* Fri 24 is not in swd-w12-lib's day map (run1b stopped there): the same recipe by hand, week 2, day 4 */
  await T.gotoWeek(p, W, WK2)
  const sm = await W5.addSim(p, W, 4, 'oft', 'W14H SIM', '21:00', '21:45')
  await L.armAndPick(p, W, `[data-fill="s:4.oft.${sm.ri}.+"]`, HEXID, 'sim24')
  const sr = await p.evaluate(r => JSON.stringify(window.DAYS[4].sims.oft[r] || null), sm.ri)
  await L.closeBoard(p, W)
  need(W, `${s}.f7`, 'Fri 24: an OFT box 21:00–21:45 naming Hex (read back)', sr.includes(HEXID), sr)
  await T.gotoWeek(p, W, WK1)
  await asH()
  b = await bell(p, W, `${s}-3`)
  chk(W, `${s}.3`, 'Saber sims him on Fri 24 (a day not in it): lit, unread (D2560)', !!b.rem && b.rem.unread && b.lit === true && /Fri 24|more/.test(b.rem.body), sayB(b), b.pic)
  await T.closeAll(p, W)   /* the bell's list left open covered the Quals view buttons on the phone (run1p2) */
  const q2 = await L.qualsTick(p, W, HEXID, `${s}-self`)
  need(W, `${s}.self`, 'Hex unticks HIMSELF on Quals', q2.st && q2.st.san === false, J(q2.st), q2.pic)
  b = await bell(p, W, `${s}-4`)
  chk(W, `${s}.4`, 'his own untick: the reminder goes', !b.rem, sayB(b), b.pic)
  rec(W, `${s}.4r`, 'any line to himself about his own untick (the agent\'s reading, Fable\'s point 8 — RECORD)', sayB(b), b.pic)
}

/* ---------- C10: mixed days and the demo week ---------- */
async function c10(p, W) {
  const s = 'c10'
  await post(p, W, RANGER, D[17], `${s}.f1`)
  await T.gotoWeek(p, W, WK2)
  rec(W, `${s}.f0`, 'Ranger\'s own rows in the week of Mon 20 (read, before anything is added)', await T.holds(p, RANGER))
  await plan(p, W, 20, `${s}.f2`, { id: CASPER, name: 'W14A WK2', a: '22:00', b: '22:30' })
  await asR(p, W)
  let b = await bell(p, W, `${s}-a`)
  chk(W, `${s}.a`, '(a) week 2 saved: the reminder names Mon 20 (his demo waves) and NOT Thu 23 (his demo ground row only) (D2564)', remIs(b.rem, Wd.rem(F17, 'Mon 20 Jul')), sayB(b), b.pic)
  await asS(p, W)
  await ground(p, W, `${s}.b1`, 5)
  await seat(p, W, `${s}.b2`, 5)
  await ground(p, W, `${s}.b3`, 6, 'W14A SUNBRIEF')
  await T.gotoWeek(p, W, WK1)
  await asR(p, W)
  b = await bell(p, W, `${s}-b`)
  chk(W, `${s}.b`, '(b) Sat 18 a ground row AND a seat → named once; Sun 19 a ground row only → never: "Sat 18, Mon 20 Jul"', remIs(b.rem, Wd.rem(F17, 'Sat 18, Mon 20 Jul')), sayB(b), b.pic)
  const rr = await readReminder(p, W, 'markall', `${s}-read`)
  need(W, `${s}.read`, 'he reads it (Mark all read)', rr.ok, rr.why, rr.pic)
  await asS(p, W)
  await seat(p, W, `${s}.c1`, 5, { cs: 'W14C', to: '19:00', ld: '20:00' })
  await asR(p, W)
  b = await bell(p, W, `${s}-c`)
  chk(W, `${s}.c`, '(c) a second seat on Sat 18 after he read: no relight, still READ', remIs(b.rem, Wd.rem(F17, 'Sat 18, Mon 20 Jul')) && !b.rem.unread && b.lit === false, sayB(b), b.pic)
  await asS(p, W)
  await T.gotoWeek(p, W, WK2)
  await ground(p, W, `${s}.d1`, 1, 'W14A TUEBRIEF')
  await T.gotoWeek(p, W, WK1)
  await asR(p, W)
  b = await bell(p, W, `${s}-d1`)
  chk(W, `${s}.d1`, '(d) a ground row on Tue 21: no relight, Tue 21 never named (D2564)', remIs(b.rem, Wd.rem(F17, 'Sat 18, Mon 20 Jul')) && !b.rem.unread && b.lit === false, sayB(b), b.pic)
  await asS(p, W)
  await T.gotoWeek(p, W, WK2)
  await seat(p, W, `${s}.d2`, 1)
  await T.gotoWeek(p, W, WK1)
  await asR(p, W)
  b = await bell(p, W, `${s}-d2`)
  chk(W, `${s}.d2`, '(d) then seated on Tue 21: lit, unread, "Sat 18, Mon 20, Tue 21 Jul" (D2560, D2564)', remIs(b.rem, Wd.rem(F17, 'Sat 18, Mon 20, Tue 21 Jul')) && b.rem.unread && b.lit === true, sayB(b), b.pic)
  fitChk(W, `${s}.d2f`, b)
}

/* ---------- C11: standby seats (SC MAIN / SPARE, AVALON) ---------- */
async function c11(p, W, o) {
  const s = o.id
  await post(p, W, RANGER, D[17], `${s}.f1`)
  const l = await addLine(p, W, 5, { kind: o.kind })
  const ac = await p.evaluate(wi => window.DAYS[5].waves[wi].formations[0].aircraft.map(a => !!a.spare), l.wi)
  const want = o.spare ? ac.indexOf(true) : ac.indexOf(false)
  const other = ac.findIndex((x, i) => i !== want && x === ac[want])
  if (want < 0) { need(W, `${s}.f2`, `an ${o.kind} line with a ${o.spare ? 'SPARE' : 'MAIN'} aircraft`, false, 'spare flags ' + J(ac)); return }
  /* FLIES is ticked on the empty row FIRST, so the armed read below is taken with the row flying and before he is on
     anything (run1: arming a second seat of a line he was already on read "already on …", never the SANS answer) */
  if (o.flies) {
    const k = `5.${l.wi}.0.${want}`
    const fb = p.locator(L.B(`[data-safly="${k}"]`)).first()
    if (await fb.count()) { await W.press(p, fb, 'flies'); await sleep(500) }
    const on = await p.evaluate(k => { const b = document.querySelector(`#schedBoard [data-safly="${k}"]`); return b ? b.getAttribute('aria-pressed') + ' "' + (b.textContent || '').trim() + '"' : 'no FLIES button' }, k)
    need(W, `${s}.flies`, 'the row ticked "FLIES" (the row activated to fly), before anyone is on it', /true/.test(on), on, await W.pic(p, `${s}-flies`))
  }
  const r = await armSeat(p, W, `5.${l.wi}.0.${want}.p`, `${s}-seat`)
  need(W, `${s}.f2`, `Sat 18: + Wave → ${o.kind}; aircraft ${want + 1}'s FCP (${o.spare ? 'SPARE' : 'MAIN'}) armed, then Ranger picked (read back)`, r.placed, `${J(l.f)} · spare flags ${J(ac)} · while armed: ${crewSay(r.c)}`, r.pic)
  await L.closeBoard(p, W)
  const rd = await saberReads(p, W, s, 5, 'sat', [])
  const a = r
  rec(W, `${s}.ii-b`, `the armed ${o.kind} ${o.spare ? 'SPARE' : 'MAIN'} seat${o.flies ? ' (FLIES ticked)' : ''}, read before he was placed: Ranger struck?`, crewSay(a.c), a.pic)
  rec(W, `${s}.iii-b`, 'the warning list (RECORD)', warnSay(rd.w), rd.w.pic)
  await asR(p, W)
  const b = await bell(p, W, `${s}-i`)
  rec(W, `${s}.i`, `Ranger's bell: does the ${o.kind} ${o.spare ? 'SPARE' : 'MAIN'}${o.flies ? ' (flies)' : ''} seat put Sat 18 in his reminder? (NOT RULED whether a standby seat counts — RECORD)`, sayB(b), b.pic)
  const named = !!(b.rem && /Sat 18/.test(remDays(b.rem)))
  const struck = !!(a && struckSans(a.c))
  if (a) chk(W, `${s}.agree`, 'the reminder and the armed seat AGREE (D2564: "the same the crew list greys")', named === struck, `reminder names Sat 18: ${named} · armed seat strikes him: ${struck}`, [b.pic, a.pic].join(', '))
}

const SCN = {
  c1: (p, W) => cNo(p, W, { id: 'c1', kind: 'ground' }),
  c2: (p, W) => cNo(p, W, { id: 'c2', kind: 'desk' }),
  c3: (p, W) => cNo(p, W, { id: 'c3', kind: 'allhands' }),
  c4,
  c5a: (p, W) => c5(p, W, { id: 'c5a', kind: 'oft', fileKinds: ['oft'], match: true }),
  c5b: (p, W) => c5(p, W, { id: 'c5b', kind: 'amt', fileKinds: ['amt'], match: true }),
  c5c: (p, W) => c5(p, W, { id: 'c5c', kind: 'oft', fileKinds: ['fly'], match: false }),
  c6a: (p, W) => c6(p, W, { id: 'c6a', read: false }),
  c6r: (p, W) => c6(p, W, { id: 'c6r', read: true }),
  c6b: (p, W) => c6(p, W, { id: 'c6b', read: false, sim: true }),
  c7,
  c8a: (p, W) => c8(p, W, { id: 'c8a', undo: true }),
  c8b: (p, W) => c8(p, W, { id: 'c8b', readFirst: true }),
  c8c: (p, W) => c8(p, W, { id: 'c8c', saber: true }),
  c8d: (p, W) => c8(p, W, { id: 'c8d', groundOnly: true }),
  c9,
  c10,
  c11a: (p, W) => c11(p, W, { id: 'c11a', kind: 'SC', spare: false }),
  c11b: (p, W) => c11(p, W, { id: 'c11b', kind: 'SC', spare: true }),
  c11c: (p, W) => c11(p, W, { id: 'c11c', kind: 'AVALON', spare: false }),
  c11d: (p, W) => c11(p, W, { id: 'c11d', kind: 'AVALON', spare: false, flies: true }),
}
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : Object.keys(SCN)
for (const n of ONLY) {
  if (!SCN[n]) { console.log('no scenario', n); continue }
  console.log('=== ' + n)
  await T.run(n, SZ, scene(SCN[n]))
  writeFileSync(path.join(process.env.W2_OUT, `results-all-${SZ}.json`), JSON.stringify(L.results, null, 1))
}
const c = k => L.results.filter(r => r.ok === k).length
console.log(`DONE ${SZ}: ${L.results.length} rows · PASS ${c(true)} · FAIL ${c(false)} · RECORDED ${c('REC')} · NOT WALKED ${c('NW')}`)
process.exit(0)
