// swd-w14b — walker w14b: the change lines and the read rule through ticks and postings (B1, B2, B3, B4, B7, B9; D2391,
// D2394, D2560, W12-1, round 1's `ended` mark), each case a fresh world, both sizes.
// Run from raptor-port/, one size a process:  SZ=d W14B_RUN=run1 [ONLY=b1,b4] node scripts/handpass/swd-w14b.mjs
// Plan: docs/superpowers/briefs/2026-11-25-sans-words-w14-plan.md §B. Routes proved by swd-w14b-probe*.mjs, swd-w14a-probe.mjs
// (D:/raptor-work/c174-walk/recipes.md). P6 said NO: the read-then-Undo cases stay test-only (not walked here).
// Demo week 1 (read by the probe): Ranger Thu 16 wave 2 FCP (+ a ground row), nothing Wed 15, Fri 17 – Sun 19;
// Hex Wed 15 and Thu 16 wave RCP seats, nothing Fri 17 – Sun 19.
import './swd-w14b-env.mjs'
import { writeFileSync } from 'node:fs'
import path from 'node:path'
const Z = await import('./swd-w14b-lib.mjs')
const { K, X, T, L, RANGER, HEX, D, WORDS: Wd, lineIs, remIs, bell, say, sayB, readReminder, need, asR, asS, asH, scene, sleep, remDays, J,
  tickOf, seatOn, fileMe, topBar, tbSay, sansOn, postAny, meeting, withWords } = Z
console.log('VERSION swd-w14b 1 · size', process.env.SZ || 'd', '· run', process.env.W14B_RUN || 'run1', '· only', process.env.ONLY || 'all')
const SZ = process.env.SZ || 'd'
const chk = (W, id, what, ok, note, pic) => W.rec(id, what, !!ok, note, pic)
const rec = (W, id, what, note, pic) => W.rec(id, what, 'REC', note, pic)
const F17 = 'Fri 17 Jul'
const fitChk = (W, id, b) => chk(W, id, 'the bell: every line inside its panel, words wrapped; Mark all read reachable', b.allFit && b.markAll !== 'off screen', `all fit ${b.allFit} · Mark all read ${b.markAll}`, b.pic)
const asWho = (p, W, id) => id === HEX ? asH(p, W) : asR(p, W)
const who = id => id === HEX ? 'Hex' : 'Ranger'
/* no two bell lines with the same full words (W12-1) */
const dupes = b => { const s = b.lines.map(l => l.title + '|' + l.who + '|' + l.body + '|' + l.struck.join('/')); return s.filter((x, i) => s.indexOf(x) !== i) }
const remSays = b => b.rem ? `${b.rem.unread ? 'UNREAD' : 'read'} "${b.rem.title}" / "${b.rem.body}"` : 'no reminder'
const changes = b => b.change.map(say).join(' || ') || 'none'
/* the man taps one bell line (it is then read) */
async function tapLine(p, W, l, tag) {
  await bell(p, W, '')
  await X.bellTap(p, W, l.id, tag)
  await T.closeAll(p, W)
}
async function calSays(p, W, iso, tag, man) {
  const s = await K.seen(p, W, iso, tag, man)
  await T.closeAll(p, W)
  return s
}

/* ---------- B1: a man ticked AND posted; the untick with the posting standing ---------- */
async function b1(p, W) {
  const s = 'b1'
  await tickOf(p, W, RANGER, true, `${s}.f1`)
  await sansOn(p, W, `${s}.f2`)
  await postAny(p, W, RANGER, D[17], `${s}.f3`)
  await seatOn(p, W, `${s}.f4`, 5)
  rec(W, `${s}.f5`, 'what Ranger holds, week 1 (read): his demo Thu 16 wave 2 seat stands', await T.holds(p, RANGER))
  await asR(p, W)
  let b = await bell(p, W, `${s}-01`)
  chk(W, `${s}.01`, 'Ranger\'s bell: ONE reminder, unread, naming "Thu 16, Sat 18 Jul" (D2394 2b: SANS by the tick from Wed 15; both flying seats, D2564)', b.rem && b.rem.unread && remDays(b.rem) === 'Thu 16, Sat 18 Jul' && b.lines.filter(l => /^sansdue/.test(l.id)).length === 1, sayB(b), b.pic)
  rec(W, `${s}.01t`, 'its TITLE (NOT RULED; the build\'s reading "Your SANS availability is needed." — he is SANS today)', remSays(b), b.pic)
  fitChk(W, `${s}.01f`, b)
  await fileMe(p, W, 'Ranger', D[16], null, `${s}.f6`)
  await fileMe(p, W, 'Ranger', D[17], null, `${s}.f7`)
  b = await bell(p, W, `${s}-02`)
  chk(W, `${s}.02`, 'after he files Thu 16 and Fri 17 (two filings): the reminder names Sat 18 only', b.rem && remDays(b.rem) === 'Sat 18 Jul', sayB(b), b.pic)
  const rr = await readReminder(p, W, 'tap', `${s}-02r`)
  need(W, `${s}.f8`, 'Ranger taps the reminder (read)', rr.ok, rr.why, rr.pic)
  await asS(p, W)
  await tickOf(p, W, RANGER, false, `${s}.03`)
  rec(W, `${s}.03r`, 'his record after the untick (the posting from Fri 17 stands)', J(await T.rec(p, RANGER)))
  await asR(p, W)
  b = await bell(p, W, `${s}-04`)
  const c = b.change.filter(l => !l.struck.length)
  chk(W, `${s}.04`, 'ONE line, C\'s words for Thu 16 only: "You\'re no longer SANS. · Saber" / "You\'re active again, so the SANS availability you filed for Thu 16 Jul is hidden. It comes back if you\'re SANS that day again." (D2391 C; D2394 Q6)', c.length === 1 && lineIs(c[0], Wd.C('Thu 16 Jul', true)), sayB(b), b.pic)
  rec(W, `${s}.04r`, '"You\'re no longer SANS." for a man still SANS from Fri 17 by his posting (Fable\'s open point 1 — his question)', changes(b), b.pic)
  rec(W, `${s}.04m`, 'his reminder after the untick (still SANS from Fri 17, Sat 18 named)', remSays(b), b.pic)
  chk(W, `${s}.04d`, 'no two lines with the same full words; nothing struck', dupes(b).length === 0 && b.struck.length === 0, sayB(b), b.pic)
  fitChk(W, `${s}.04f`, b)
  const t16 = await calSays(p, W, D[16], `${s}-05`, 'Ranger')
  chk(W, `${s}.05`, 'SANS calendar Thu 16: his filing hidden (D2341 — he is not SANS that day)', !t16.has, t16.words, t16.pic)
  const t17 = await calSays(p, W, D[17], `${s}-06`, 'Ranger')
  chk(W, `${s}.06`, 'SANS calendar Fri 17: his filing still shown and counted (SANS from Fri 17 by his posting)', t17.has && t17.f >= 1, `${t17.words} · F count ${t17.f}`, t17.pic)
}
/* B1 (b): as 1–3, nothing filed before Fri 17, the reminder read — RECORD */
async function b1b(p, W) {
  const s = 'b1b'
  await tickOf(p, W, RANGER, true, `${s}.f1`)
  await sansOn(p, W, `${s}.f2`)
  await postAny(p, W, RANGER, D[17], `${s}.f3`)
  await seatOn(p, W, `${s}.f4`, 5)
  await asR(p, W)
  const rr = await readReminder(p, W, 'markall', `${s}-f5`)
  need(W, `${s}.f5`, 'Ranger reads his reminder (Mark all read), nothing filed', rr.ok, rr.why, rr.pic)
  await asS(p, W)
  await tickOf(p, W, RANGER, false, `${s}.01`)
  await asR(p, W)
  const b = await bell(p, W, `${s}-02`)
  rec(W, `${s}.02`, 'variant (b): Ranger\'s bell after the untick, the posting from Fri 17 standing (w11 recorded no line) — RECORD', sayB(b), b.pic)
  chk(W, `${s}.02d`, 'no two lines with the same full words; nothing struck', dupes(b).length === 0 && b.struck.length === 0, sayB(b), b.pic)
  fitChk(W, `${s}.02f`, b)
}

/* ---------- B2: Undo post out while the tick stands, then the untick (round 1's `ended` mark; Fable S4) ---------- */
async function b2(p, W) {
  const s = 'b2'
  await tickOf(p, W, HEX, true, `${s}.f1`)
  await sansOn(p, W, `${s}.f2`)
  await postAny(p, W, HEX, D[17], `${s}.f3`)
  await seatOn(p, W, `${s}.f4`, 5, HEX)
  rec(W, `${s}.f5`, 'what Hex holds, week 1 (read): his demo Wed 15 and Thu 16 wave seats', await T.holds(p, HEX))
  await asH(p, W)
  await fileMe(p, W, 'Hex', D[18], null, `${s}.f6`)
  const rr = await readReminder(p, W, 'tap', `${s}-f7`)
  need(W, `${s}.f7`, 'Hex taps his reminder (read) — it names his other seated days', rr.ok, rr.why, rr.pic)
  rec(W, `${s}.f7r`, 'the reminder he read', say(rr.after.rem), rr.pic)
  const days0 = remDays(rr.after.rem)
  const s0 = await calSays(p, W, D[18], `${s}-f8`, 'Hex')
  need(W, `${s}.f8`, 'his Sat 18 filing shows before', s0.has, s0.words, s0.pic)
  await asS(p, W)
  await K.undoPost(p, W, D[17], `${s}.01`, HEX)
  rec(W, `${s}.01r`, 'Hex\'s record after Undo post out (the tick stands)', J(await T.rec(p, HEX)))
  await asH(p, W)
  let b = await bell(p, W, `${s}-02`)
  const s1 = await calSays(p, W, D[18], `${s}-02c`, 'Hex')
  chk(W, `${s}.02a`, 'Sat 18\'s filing still shows and counts (SANS by his tick: D2341)', s1.has && s1.f >= 1, `${s1.words} · F ${s1.f}`, s1.pic)
  chk(W, `${s}.02b`, 'no line says "active again" or "is hidden" (none is hidden: D2391, D2394 Q6)', b.activeSaid.length === 0 && b.hiddenSaid.length === 0, sayB(b), b.pic)
  chk(W, `${s}.02c`, `his reminder still READ, same days "${days0}" (D2560 — no day new to him)`, b.rem && !b.rem.unread && remDays(b.rem) === days0, remSays(b), b.pic)
  chk(W, `${s}.02d`, 'its title "Your SANS availability is needed." (D2394 2b — no date ahead)', b.rem && b.rem.title === 'Your SANS availability is needed.', remSays(b), b.pic)
  rec(W, `${s}.02e`, 'whether a title-alone "You\'re no longer posted out as SANS. · Saber" appears (his open point 1) — RECORD', `${changes(b)} · bell lit ${b.lit}`, b.pic)
  fitChk(W, `${s}.02f`, b)
  await asS(p, W)
  await tickOf(p, W, HEX, false, `${s}.03`)
  await asH(p, W)
  b = await bell(p, W, `${s}-04`)
  chk(W, `${s}.04a`, 'the reminder gone, not struck (D2391)', !b.rem && !b.lines.some(l => l.struck.some(x => /SANS availability is needed|You're planned on/.test(x))), sayB(b), b.pic)
  const c = b.change.filter(l => !l.struck.length && lineIs(l, Wd.C('Sat 18 Jul', true)))
  chk(W, `${s}.04b`, 'a line "You\'re no longer SANS. · Saber" / "You\'re active again, so the SANS availability you filed for Sat 18 Jul is hidden. It comes back if you\'re SANS that day again." (D2391 C)', c.length === 1, sayB(b), b.pic)
  rec(W, `${s}.04c`, 'how many SANS change lines stand in all (one is the coordinator\'s reading, not a ruling) — RECORD', `${b.change.length}: ${changes(b)}`, b.pic)
  chk(W, `${s}.04d`, 'no two lines with the same full words', dupes(b).length === 0, sayB(b), b.pic)
  fitChk(W, `${s}.04f`, b)
  const s2 = await calSays(p, W, D[18], `${s}-05`, 'Hex')
  chk(W, `${s}.05`, 'Sat 18\'s filing hidden now (D2341)', !s2.has, s2.words, s2.pic)
}

/* ---------- B3: his reads of the reminder kept through "Mark all read" ---------- */
async function b3(p, W) {
  const s = 'b3'
  await postAny(p, W, RANGER, D[17], `${s}.f1`)
  await seatOn(p, W, `${s}.f2`, 5)
  await asR(p, W)
  let b = await bell(p, W, `${s}-f3`)
  need(W, `${s}.f3`, 'his reminder stands, unread, naming Sat 18', b.rem && b.rem.unread && remDays(b.rem) === 'Sat 18 Jul', sayB(b), b.pic)
  await W.press(p, '[data-testid="bell-markall"]:visible', 'markall'); await T.closeAll(p, W)
  b = await bell(p, W, `${s}-01`)
  chk(W, `${s}.01`, '1. Mark all read: the reminder READ, the bell not lit', b.rem && !b.rem.unread && b.lit === false, sayB(b), b.pic)
  await asS(p, W)
  const m = await meeting(p, W, '2026-07-27', RANGER, 'W14B MEETING', '10:00', '11:00', `${s}-02m`)
  const ok = m.made.length === 1 && /bane/.test(m.made[0].people)
  if (!ok) W.rec(`${s}.02m`, 'Saber files a Meeting for Ranger on Mon 27 Jul (Inputs calendar → the day → + Input)', 'NW', J(m.made), m.pic)
  else W.rec(`${s}.02m`, 'set-up: Saber files a Meeting for Ranger on Mon 27 Jul, 10:00–11:00 (Inputs calendar → the day → + Input)', true, J(m.made), m.pic)
  await asR(p, W)
  b = await bell(p, W, `${s}-02`)
  const mt = b.lines.filter(l => l !== b.rem && !/^sansdue/.test(l.id))
  chk(W, `${s}.02`, '2. after the Meeting: the reminder still READ (D2560); the Meeting\'s line its own, beside it', b.rem && !b.rem.unread && (ok ? mt.some(l => l.unread) : true), sayB(b), b.pic)
  rec(W, `${s}.02r`, 'the Meeting\'s line, its words (D769\'s shape as narrowed by D2521) and the bell', `bell lit ${b.lit} · ${mt.map(say).join(' || ') || 'none'}`, b.pic)
  fitChk(W, `${s}.02f`, b)
  await W.press(p, '[data-testid="bell-markall"]:visible', 'markall'); await T.closeAll(p, W)
  b = await bell(p, W, `${s}-03a`)
  chk(W, `${s}.03a`, '3. Mark all read again: the reminder READ, the bell not lit', b.rem && !b.rem.unread && b.lit === false, sayB(b), b.pic)
  await T.reload(p, 'us', 'us')
  b = await bell(p, W, `${s}-03b`)
  chk(W, `${s}.03b`, '3. after a reload: the reminder READ, the bell not lit', b.rem && !b.rem.unread && b.lit === false, sayB(b), b.pic)
  await asS(p, W); await asR(p, W)
  b = await bell(p, W, `${s}-03c`)
  chk(W, `${s}.03c`, '3. after signing out and in: the reminder READ, the bell not lit', b.rem && !b.rem.unread && b.lit === false, sayB(b), b.pic)
  await asS(p, W)
  await seatOn(p, W, `${s}.04`, 6)
  await asR(p, W)
  b = await bell(p, W, `${s}-05a`)
  chk(W, `${s}.05a`, '5. seated on Sun 19: lit, the reminder UNREAD, "You\'re SANS from Fri 17 Jul." / "You\'re planned on Sat 18, Sun 19 Jul with nothing filed. Tap to file for availability." (D2560: Sun 19 is new)', remIs(b.rem, Wd.rem(F17, 'Sat 18, Sun 19 Jul')) && b.rem.unread && b.lit === true, sayB(b), b.pic)
  fitChk(W, `${s}.05af`, b)
  const rr = await readReminder(p, W, 'tap', `${s}-05b`)
  chk(W, `${s}.05b`, '5. he taps the reminder: read', rr.ok, rr.why, rr.pic)
  for (const i of [1, 2]) { await bell(p, W, ''); const mk = p.locator('[data-testid="bell-markall"]:visible'); if (await mk.count()) await W.press(p, mk.first(), 'markall' + i); await T.closeAll(p, W) }
  b = await bell(p, W, `${s}-05c`)
  chk(W, `${s}.05c`, '5. Mark all read twice: the reminder READ, the bell not lit', b.rem && !b.rem.unread && b.lit === false, sayB(b), b.pic)
  await T.reload(p, 'us', 'us')
  b = await bell(p, W, `${s}-05d`)
  chk(W, `${s}.05d`, '5. after a reload: the reminder READ, the bell not lit, still "Sat 18, Sun 19 Jul"', b.rem && !b.rem.unread && b.lit === false && remDays(b.rem) === 'Sat 18, Sun 19 Jul', sayB(b), b.pic)
}

/* ---------- B4: an admin's Undo of a tick tells him; Redo takes it back; over and over leaves one true line ---------- */
async function b4(p, W) {
  const s = 'b4'
  await tickOf(p, W, HEX, true, `${s}.f1`)
  await asH(p, W)
  await fileMe(p, W, 'Hex', D[18], null, `${s}.f2`)
  const s0 = await calSays(p, W, D[18], `${s}-f3`, 'Hex')
  need(W, `${s}.f3`, 'his Sat 18 filing shows', s0.has, s0.words, s0.pic)
  await asS(p, W)   // ONE Saber sign-in for all of step 1 (a sign-out clears his Undo list, D148)
  await tickOf(p, W, HEX, false, `${s}.1a`)
  await tickOf(p, W, HEX, true, `${s}.1b`)
  const want = [false, true, false, true, false]
  const ops = ['undo', 'redo', 'undo', 'redo', 'undo']
  for (let i = 0; i < ops.length; i++) {
    const t = await topBar(p, W, ops[i], HEX, `${s}-1${'cdefg'[i]}`)
    chk(W, `${s}.1${'cdefg'[i]}`, `Saber presses the top bar ${ops[i] === 'undo' ? 'Undo' : 'Redo'}: Hex's tick ${want[i] ? 'back on' : 'off'}`, t.pressed && t.after.san === want[i], tbSay(t), t.pic)
  }
  await asH(p, W)
  let b = await bell(p, W, `${s}-2a`)
  const c = b.change.filter(l => !l.struck.length)
  chk(W, `${s}.2a`, '2. exactly the state of "Hex unticked": ONE line "You\'re no longer SANS. · Saber" with Sat 18\'s sentence (D2391 C; W12-1)', c.length === 1 && lineIs(c[0], Wd.C('Sat 18 Jul', true)), sayB(b), b.pic)
  chk(W, `${s}.2b`, '2. never two lines with the same words; nothing struck (an unread line simply goes, D1693)', dupes(b).length === 0 && b.struck.length === 0, sayB(b), b.pic)
  rec(W, `${s}.2r`, '2. every SANS change line and the reminder', `${changes(b)} · ${remSays(b)} · lit ${b.lit}`, b.pic)
  fitChk(W, `${s}.2f`, b)
  const s1 = await calSays(p, W, D[18], `${s}-2c`, 'Hex')
  chk(W, `${s}.2c`, '2. SANS calendar Sat 18: his filing hidden (D2341)', !s1.has, s1.words, s1.pic)
  if (c[0]) await tapLine(p, W, c[0], `${s}-3`)
  b = await bell(p, W, `${s}-3`)
  chk(W, `${s}.3`, '3. Hex reads the line (a tap): it is read', b.change.length >= 1 && b.change.every(l => !l.unread), sayB(b), b.pic)
  await asS(p, W)
  await tickOf(p, W, HEX, true, `${s}.4`)
  await asH(p, W)
  b = await bell(p, W, `${s}-5a`)
  const s2 = await calSays(p, W, D[18], `${s}-5b`, 'Hex')
  chk(W, `${s}.5a`, '5. ticked again: Sat 18 shows again (D2341)', s2.has, s2.words, s2.pic)
  chk(W, `${s}.5b`, '5. the sentence gone: no live line still says Sat 18 is hidden (D2394 Q6)', b.hiddenSaid.length === 0 && b.activeSaid.length === 0, sayB(b), b.pic)
  rec(W, `${s}.5r`, '5. the line\'s title stays (read) or goes — RECORD (Q6\'s "the line with it if nothing is left" — a reading); the reminder read / unread', `${changes(b)} · ${remSays(b)} · lit ${b.lit}`, b.pic)
  fitChk(W, `${s}.5f`, b)
}

/* ---------- B7: the same change made again leaves one line with the sentence (W12-1) ---------- */
async function b7a(p, W) {
  const s = 'b7a'
  const HID = /filed for Fri 17 Jul is hidden/
  await postAny(p, W, RANGER, D[17], `${s}.f1`)
  await seatOn(p, W, `${s}.f2`, 6)
  await asR(p, W)
  await fileMe(p, W, 'Ranger', D[17], D[18], `${s}.f3`)
  const rr = await readReminder(p, W, 'tap', `${s}-f4`)
  need(W, `${s}.f4`, 'Ranger taps his reminder (read) — it names Sun 19', rr.ok && remDays(rr.after.rem) === 'Sun 19 Jul', rr.why, rr.pic)
  const steps = [[D[17], D[18], 'to Sat 18', true], [D[18], D[17], 'back to Fri 17', false], [D[17], D[18], 'to Sat 18 again', true], [D[18], D[17], 'back to Fri 17 again', false], [D[17], D[18], 'to Sat 18 a third time', true]]
  for (let i = 0; i < steps.length; i++) {
    const [from, to, what, hidden] = steps[i]
    const t = `${s}.${i + 1}`
    await asS(p, W)
    await K.move(p, W, from, to, `${t}.m`)
    await asR(p, W)
    const b = await bell(p, W, `${t.replace(/\./g, '-')}`)
    const h = withWords(b, HID)
    if (hidden) chk(W, `${t}a`, `after the move ${what}: exactly ONE line carries "…filed for Fri 17 Jul is hidden…" (W12-1; D2394 Q6), A's words`, h.length === 1 && lineIs(h[0], Wd.A('Sat 18 Jul', 'Fri 17 Jul', true)), sayB(b), b.pic)
    else chk(W, `${t}a`, `after the move ${what}: no live line says Fri 17 is hidden (his filing shows again, D2394 Q6)`, h.length === 0, sayB(b), b.pic)
    chk(W, `${t}b`, 'no two lines with the same full words (W12-1)', dupes(b).length === 0, sayB(b), b.pic)
    chk(W, `${t}c`, 'the reminder for Sun 19 READ throughout (D2560 — no new day)', b.rem && !b.rem.unread && remDays(b.rem) === 'Sun 19 Jul', remSays(b), b.pic)
    rec(W, `${t}r`, 'every SANS change line (older ones titled alone or gone — RECORD which)', `${changes(b)} · lit ${b.lit}`, b.pic)
    fitChk(W, `${t}f`, b)
    if (i === 0 && h[0]) { await tapLine(p, W, h[0], `${s}-1tap`); const b2 = await bell(p, W, `${s}-1tapped`); chk(W, `${s}.1t`, 'Ranger taps the A line: read', withWords(b2, HID).every(l => !l.unread) && withWords(b2, HID).length === 1, sayB(b2), b2.pic) }
  }
  await T.reload(p, 'us', 'us')
  let b = await bell(p, W, `${s}-6`)
  chk(W, `${s}.6`, 'after a reload: still ONE line with the sentence, no two alike, the reminder read', withWords(b, HID).length === 1 && dupes(b).length === 0 && b.rem && !b.rem.unread, sayB(b), b.pic)
  await asS(p, W); await asR(p, W)
  b = await bell(p, W, `${s}-7`)
  chk(W, `${s}.7`, 'after signing out and in: still ONE line with the sentence, no two alike, the reminder read', withWords(b, HID).length === 1 && dupes(b).length === 0 && b.rem && !b.rem.unread, sayB(b), b.pic)
  rec(W, `${s}.7r`, 'the bell at the end', sayB(b), b.pic)
}
async function b7b(p, W) {
  const s = 'b7b'
  const HID = /filed for Fri 17, Sat 18 Jul is hidden/
  await tickOf(p, W, RANGER, true, `${s}.f1`)
  await seatOn(p, W, `${s}.f2`, 6)
  await asR(p, W)
  await fileMe(p, W, 'Ranger', D[17], D[18], `${s}.f3`)
  const rr = await readReminder(p, W, 'tap', `${s}-f4`)
  need(W, `${s}.f4`, 'Ranger taps his reminder (read)', rr.ok, rr.why, rr.pic)
  rec(W, `${s}.f4r`, 'the reminder he read', say(rr.after.rem), rr.pic)
  const seq = [false, true, false, true, false]
  for (let i = 0; i < seq.length; i++) {
    const t = `${s}.${i + 1}`
    await asS(p, W)
    await tickOf(p, W, RANGER, seq[i], `${t}.q`)
    await asR(p, W)
    const b = await bell(p, W, t.replace(/\./g, '-'))
    const h = withWords(b, HID)
    if (!seq[i]) chk(W, `${t}a`, 'unticked: exactly ONE line carries "…filed for Fri 17, Sat 18 Jul is hidden…", C\'s words (W12-1; D2391 C)', h.length === 1 && lineIs(h[0], Wd.C('Fri 17, Sat 18 Jul', false)), sayB(b), b.pic)
    else chk(W, `${t}a`, 'ticked again: no live line says a day is hidden (D2394 Q6)', h.length === 0 && b.hiddenSaid.length === 0, sayB(b), b.pic)
    chk(W, `${t}b`, 'no two lines with the same full words (W12-1)', dupes(b).length === 0, sayB(b), b.pic)
    rec(W, `${t}r`, `${seq[i] ? 'ticked' : 'unticked'}: every SANS change line (older ones titled alone or gone — RECORD which) and the reminder read / unread (B9's question)`, `${changes(b)} · ${remSays(b)} · lit ${b.lit}`, b.pic)
    fitChk(W, `${t}f`, b)
    if (i === 0 && h[0]) { await tapLine(p, W, h[0], `${s}-1tap`); const b2 = await bell(p, W, `${s}-1tapped`); chk(W, `${s}.1t`, 'Ranger reads the C line (a tap): read', withWords(b2, HID).length === 1 && withWords(b2, HID).every(l => !l.unread), sayB(b2), b2.pic) }
  }
  await T.reload(p, 'us', 'us')
  let b = await bell(p, W, `${s}-6`)
  chk(W, `${s}.6`, 'after a reload: still ONE line with the sentence, no two alike', withWords(b, HID).length === 1 && dupes(b).length === 0, sayB(b), b.pic)
  await asS(p, W); await asR(p, W)
  b = await bell(p, W, `${s}-7`)
  chk(W, `${s}.7`, 'after signing out and in: still ONE line with the sentence, no two alike', withWords(b, HID).length === 1 && dupes(b).length === 0, sayB(b), b.pic)
  rec(W, `${s}.7r`, 'the bell at the end', sayB(b), b.pic)
}

/* ---------- B9: a SANS that ends and starts again — is the reminder news? RECORD every step ---------- */
async function b9hex(p, W, o) {
  const s = o.id
  await tickOf(p, W, HEX, true, `${s}.f1`)
  await seatOn(p, W, `${s}.f2`, 5, HEX)
  await asH(p, W)
  const rr = await readReminder(p, W, 'tap', `${s}-f3`)
  need(W, `${s}.f3`, 'Hex taps his reminder (read), nothing filed', rr.ok, rr.why, rr.pic)
  rec(W, `${s}.f3r`, 'the reminder he read', say(rr.after.rem), rr.pic)
  await asS(p, W)
  await tickOf(p, W, HEX, false, `${s}.1`)
  if (o.undo) {
    const u = await topBar(p, W, 'undo', HEX, `${s}-1u`)
    chk(W, `${s}.1u`, 'Saber: the top bar Undo — the tick back on', u.pressed && u.after.san === true, tbSay(u), u.pic)
    const r = await topBar(p, W, 'redo', HEX, `${s}-1r`)
    chk(W, `${s}.1r`, 'Saber: the top bar Redo — the tick off again', r.pressed && r.after.san === false, tbSay(r), r.pic)
  } else {
    await asH(p, W)
    const b = await bell(p, W, `${s}-2`)
    chk(W, `${s}.2`, 'unticked, nothing filed, the reminder read: the title alone "You\'re no longer SANS. · Saber" (D2391 C), the reminder gone', b.change.length === 1 && lineIs(b.change[0], Wd.bare("You're no longer SANS.")) && !b.rem, sayB(b), b.pic)
    rec(W, `${s}.2r`, 'Hex\'s bell, unticked', sayB(b), b.pic)
    fitChk(W, `${s}.2f`, b)
    await asS(p, W)
  }
  await tickOf(p, W, HEX, true, `${s}.3`)
  await asH(p, W)
  const b = await bell(p, W, `${s}-4`)
  rec(W, `${s}.4`, `ticked again${o.undo ? ' (after untick, Undo, Redo)' : ''}: the reminder READ or UNREAD, the bell lit or not (NOT RULED — D2560's letter against the builder's "a new SANS period is news")`, `${remSays(b)} · bell lit ${b.lit}`, b.pic)
  rec(W, `${s}.4b`, 'the whole bell', sayB(b), b.pic)
  chk(W, `${s}.4d`, 'no two lines with the same full words; no live sentence says a day is hidden', dupes(b).length === 0 && b.hiddenSaid.length === 0, sayB(b), b.pic)
  fitChk(W, `${s}.4f`, b)
}
async function b9post(p, W, o) {
  const s = o.id
  await postAny(p, W, RANGER, D[17], `${s}.f1`)
  await seatOn(p, W, `${s}.f2`, 5)
  await asR(p, W)
  const rr = await readReminder(p, W, 'tap', `${s}-f3`)
  need(W, `${s}.f3`, 'Ranger taps his reminder (read), nothing filed', rr.ok, rr.why, rr.pic)
  await asS(p, W)
  if (o.outcome) await K.chip(p, W, D[17], `${s}.1`)
  else await K.undoPost(p, W, D[17], `${s}.1`)
  await asR(p, W)
  let b = await bell(p, W, `${s}-2`)
  const title = "You're no longer posted out as SANS."
  chk(W, `${s}.2`, `${o.outcome ? 'another outcome (the SANS chip off)' : 'Undo post out'}, nothing filed, the reminder read: the title alone "${title} · Saber" (D2391 ${o.outcome ? 'E' : 'B'}), the reminder gone`, b.change.length === 1 && lineIs(b.change[0], Wd.bare(title)) && !b.rem, sayB(b), b.pic)
  rec(W, `${s}.2r`, 'Ranger\'s bell', sayB(b), b.pic)
  fitChk(W, `${s}.2f`, b)
  await asS(p, W)
  if (o.outcome) await K.chip(p, W, D[17], `${s}.3`)
  else await postAny(p, W, RANGER, D[17], `${s}.3`)
  await asR(p, W)
  b = await bell(p, W, `${s}-4`)
  rec(W, `${s}.4`, `${o.outcome ? 'SANS chosen again' : 'posted out again from Fri 17'}: the reminder READ or UNREAD, the bell lit or not (NOT RULED)`, `${remSays(b)} · bell lit ${b.lit}`, b.pic)
  rec(W, `${s}.4b`, 'the whole bell', sayB(b), b.pic)
  chk(W, `${s}.4d`, 'the reminder back with the same words "You\'re SANS from Fri 17 Jul." / Sat 18; no two lines alike', remIs(b.rem, Wd.rem(F17, 'Sat 18 Jul')) && dupes(b).length === 0, sayB(b), b.pic)
  fitChk(W, `${s}.4f`, b)
}

const SCN = {
  b1, b1b, b2, b3, b4, b7a, b7b,
  b9i: (p, W) => b9hex(p, W, { id: 'b9i' }),
  b9ii: (p, W) => b9hex(p, W, { id: 'b9ii', undo: true }),
  b9iii: (p, W) => b9post(p, W, { id: 'b9iii' }),
  b9iv: (p, W) => b9post(p, W, { id: 'b9iv', outcome: true }),
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
