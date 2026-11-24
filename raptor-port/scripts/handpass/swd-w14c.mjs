// swd-w14c — walker w14c: the reminder over dates and days (B8 (a)–(e), B10, A1, A2, A5, A7, A10; D2391, D2394, D2560,
// D2564, D2341, D2340), each case a fresh world, both sizes.
// Run from raptor-port/, one size a process:  SZ=d W14C_RUN=run1 [ONLY=b8a,a1] node scripts/handpass/swd-w14c.mjs
// Plan: docs/superpowers/briefs/2026-11-25-sans-words-w14-plan.md §B8, §B10, §A. Routes proved by swd-w14c-probe*.mjs and
// the earlier parts' probes (D:/raptor-work/c174-walk/recipes.md). Demo week 1 (read by the probes): Ranger Mon 13 wave + OFT +
// all hands, Thu 16 wave 2 FCP + a ground row, nothing Wed 15, Fri 17 – Sun 19; with week 2 saved his Mon 20 waves count.
import './swd-w14c-env.mjs'
import { writeFileSync } from 'node:fs'
import path from 'node:path'
const Z = await import('./swd-w14c-lib.mjs')
const { K, T, L, RANGER, D, WORDS: Wd, lineIs, remIs, bell, say, sayB, readReminder, need, asR, asS, scene, sleep, remDays, J,
  tickOf, seatOn, fileMe, topBar, tbSay, postAny, withWords, planSim, lineOff, simOff, moveTo, tapAndRead, tapSay, calSays,
  saveWk2, fileAcross, runOf, barLook } = Z
console.log('VERSION swd-w14c 2 · size', process.env.SZ || 'd', '· run', process.env.W14C_RUN || 'run1', '· only', process.env.ONLY || 'all')
const SZ = process.env.SZ || 'd'
const chk = (W, id, what, ok, note, pic) => W.rec(id, what, !!ok, note, pic)
const rec = (W, id, what, note, pic) => W.rec(id, what, 'REC', note, pic)
const nw = (W, id, what, note, pic) => W.rec(id, what, 'NW', note, pic)
const fitChk = (W, id, b) => chk(W, id, 'the bell: every line inside its panel, words wrapped; Mark all read reachable', b.allFit && b.markAll !== 'off screen', `all fit ${b.allFit} · Mark all read ${b.markAll}`, b.pic)
const dupes = b => { const s = b.lines.map(l => l.title + '|' + l.who + '|' + l.body + '|' + l.struck.join('/')); return s.filter((x, i) => s.indexOf(x) !== i) }
const remSays = b => b.rem ? `${b.rem.unread ? 'UNREAD' : 'read'} "${b.rem.title}" / "${b.rem.body}"` : 'no reminder'
const changes = b => b.change.map(say).join(' || ') || 'none'
const live = b => b.change.filter(l => !l.struck.length)
const F17 = 'Fri 17 Jul'
const readRem = (b, title, days) => b.rem && !b.rem.unread && b.lit === false && b.rem.title === title && remDays(b.rem) === days
const litRem = (b, title, days) => b.rem && b.rem.unread && b.lit === true && b.rem.title === title && remDays(b.rem) === days
const at = (p, n) => T.moveClock(p, null, n, 'us', 'us')

/* ---------- B8 (a) + (b): a day he saw, taken off and put back; then a new day ---------- */
async function b8a(p, W) {
  const s = 'b8a'
  await postAny(p, W, RANGER, D[17], `${s}.f1`)
  await seatOn(p, W, `${s}.f2`, 5)
  await planSim(p, W, 19, 'oft', `${s}.f3`, { label: 'W14C SIM' })
  rec(W, `${s}.f3h`, 'what Ranger holds, week 1 (read)', await T.holds(p, RANGER))
  await asR(p, W)
  const rr = await readReminder(p, W, 'tap', `${s}-f4`)
  need(W, `${s}.f4`, 'Ranger taps his reminder (read) — it names Sat 18, Sun 19', rr.ok && remDays(rr.after.rem) === 'Sat 18, Sun 19 Jul', rr.why, rr.pic)
  await asS(p, W)
  await lineOff(p, W, `${s}.1`, 5)
  await asR(p, W)
  let b = await bell(p, W, `${s}-2`)
  chk(W, `${s}.2`, 'off Sat 18: the reminder "You\'re SANS from Fri 17 Jul." names Sun 19 only, READ, the bell not lit (D2394 2a: a day dropping off never lights)', readRem(b, "You're SANS from Fri 17 Jul.", 'Sun 19 Jul'), sayB(b), b.pic)
  fitChk(W, `${s}.2f`, b)
  await asS(p, W)
  await seatOn(p, W, `${s}.3`, 5)
  await asR(p, W)
  b = await bell(p, W, `${s}-4`)
  chk(W, `${s}.4`, 'seated on Sat 18 again: "Sat 18, Sun 19 Jul", still READ, not lit (D2560: a day he saw, taken off and put back, does not relight)', readRem(b, "You're SANS from Fri 17 Jul.", 'Sat 18, Sun 19 Jul'), sayB(b), b.pic)
  chk(W, `${s}.4d`, 'no SANS change line (nothing he filed was hidden; his posting did not change)', b.change.length === 0, sayB(b), b.pic)
  await T.reload(p, 'us', 'us')
  b = await bell(p, W, `${s}-5`)
  chk(W, `${s}.5`, 'after a reload: the same, READ, not lit', readRem(b, "You're SANS from Fri 17 Jul.", 'Sat 18, Sun 19 Jul'), sayB(b), b.pic)
  await asS(p, W); await asR(p, W)
  b = await bell(p, W, `${s}-6`)
  chk(W, `${s}.6`, 'after signing out and in: the same, READ, not lit', readRem(b, "You're SANS from Fri 17 Jul.", 'Sat 18, Sun 19 Jul'), sayB(b), b.pic)
  /* (b) from (a)'s end: off Sun 19, simmed on Fri 17 — the count stays two, a new day */
  await asS(p, W)
  await simOff(p, W, `${s}.b1`, 6)
  await planSim(p, W, 17, 'oft', `${s}.b2`, { label: 'W14C SIM' })
  await asR(p, W)
  b = await bell(p, W, `${s}-b3`)
  chk(W, `${s}.b3`, '(b) off Sun 19, simmed Fri 17: lit, the reminder UNREAD, "You\'re SANS from Fri 17 Jul." / "You\'re planned on Fri 17, Sat 18 Jul with nothing filed. Tap to file for availability." (D2560: Fri 17 is new)', litRem(b, "You're SANS from Fri 17 Jul.", 'Fri 17, Sat 18 Jul') && remIs(b.rem, Wd.rem(F17, 'Fri 17, Sat 18 Jul')), sayB(b), b.pic)
  fitChk(W, `${s}.b3f`, b)
}

/* ---------- B8 (c): the date moved EARLIER over a day he never saw; A2 (b) the D line's tap; the reminder's tap ---------- */
async function b8c(p, W) {
  const s = 'b8c'
  rec(W, `${s}.f0`, 'what Ranger holds, week 1 (read first): his demo Thu 16 wave 2 FCP', await T.holds(p, RANGER))
  await postAny(p, W, RANGER, D[17], `${s}.f1`)
  await seatOn(p, W, `${s}.f2`, 5)
  await asR(p, W)
  const rr = await readReminder(p, W, 'tap', `${s}-f3`)
  need(W, `${s}.f3`, 'Ranger taps his reminder (read) — it names Sat 18 only', rr.ok && remDays(rr.after.rem) === 'Sat 18 Jul', rr.why, rr.pic)
  await asS(p, W)
  await moveTo(p, W, D[17], D[16], `${s}.1`)
  await asR(p, W)
  const b = await bell(p, W, `${s}-2`)
  chk(W, `${s}.2a`, 'the reminder "You\'re SANS from Thu 16 Jul." / "You\'re planned on Thu 16, Sat 18 Jul with nothing filed. Tap to file for availability.", UNREAD, the bell lit (D2560: Thu 16 was not in it when he read it)', litRem(b, "You're SANS from Thu 16 Jul.", 'Thu 16, Sat 18 Jul') && remIs(b.rem, Wd.rem('Thu 16 Jul', 'Thu 16, Sat 18 Jul')), sayB(b), b.pic)
  const dl = live(b).filter(l => lineIs(l, Wd.D('Thu 16 Jul')))
  chk(W, `${s}.2b`, 'beside it the title alone "Your SANS date moved to Thu 16 Jul. · Saber" (D2391 D — he had read the reminder)', dl.length === 1 && live(b).length === 1, changes(b), b.pic)
  chk(W, `${s}.2c`, 'no hidden sentence; nothing struck', b.hiddenSaid.length === 0 && b.struck.length === 0, sayB(b), b.pic)
  fitChk(W, `${s}.2f`, b)
  if (dl[0]) {
    const t = await tapAndRead(p, W, dl[0].id, `${s}-a2b`)
    rec(W, `${s}.a2b`, 'A2 (b): the D line "Your SANS date moved to Thu 16 Jul. · Saber" tapped — where it opens, whether it turns read, whether the list stays open (NOT RULED)', tapSay(t), t.pic)
    chk(W, `${s}.a2be`, 'A2 (b): no error and no window on a day he cannot file for', !/Couldn|error/i.test(t.toast || '') && (t.win === 'none' || /16|17|18|19|20/.test(t.win)), tapSay(t), t.pic)
  }
  const b2 = await bell(p, W, '')
  if (b2.rem) {
    const t = await tapAndRead(p, W, b2.rem.id, `${s}-3`)
    chk(W, `${s}.3`, 'the reminder\'s tap opens the SANS calendar on Thu 16 with its window (D2340: "its tap opening the SANS calendar on the first day")', t.page === 'inputs' && /^Jul(y)? 2026/i.test(t.month) && /16/.test(t.win) && t.win !== 'none', tapSay(t), t.pic)
    chk(W, `${s}.3r`, 'the reminder is read after the tap', t.line && !t.line.unread, tapSay(t), t.pic)
  } else nw(W, `${s}.3`, 'the reminder\'s tap', 'no reminder to tap: ' + sayB(b2))
}
/* B8 (c) variant: the reminder never read before the move */
async function b8cv(p, W) {
  const s = 'b8cv'
  await postAny(p, W, RANGER, D[17], `${s}.f1`)
  await seatOn(p, W, `${s}.f2`, 5)
  await moveTo(p, W, D[17], D[16], `${s}.1`)
  await asR(p, W)
  const b = await bell(p, W, `${s}-2`)
  chk(W, `${s}.2a`, 'variant, never read: ONE updated reminder, UNREAD, "You\'re SANS from Thu 16 Jul." / "…Thu 16, Sat 18 Jul…" (D2340, D2390)', litRem(b, "You're SANS from Thu 16 Jul.", 'Thu 16, Sat 18 Jul') && b.lines.filter(l => /^sansdue/.test(l.id)).length === 1, sayB(b), b.pic)
  chk(W, `${s}.2b`, 'and NO D line (D2391: a line only when something filed was hidden or he had read the reminder)', b.change.length === 0, sayB(b), b.pic)
  fitChk(W, `${s}.2f`, b)
}

/* ---------- B8 (d) + (e): the date moved LATER over a read reminder; A2 (a) the title-alone line's tap; the week change ---------- */
async function b8d(p, W) {
  const s = 'b8d'
  await postAny(p, W, RANGER, D[17], `${s}.f1`)
  await seatOn(p, W, `${s}.f2`, 5)
  await saveWk2(p, W, `${s}.f3`)
  await asR(p, W)
  const rr = await readReminder(p, W, 'tap', `${s}-f4`)
  need(W, `${s}.f4`, 'Ranger taps his reminder (read) — it names Sat 18, Mon 20 (his demo waves, week 2 saved)', rr.ok && remDays(rr.after.rem) === 'Sat 18, Mon 20 Jul', rr.why, rr.pic)
  await asS(p, W)
  await moveTo(p, W, D[17], D[18], `${s}.1`)
  await asR(p, W)
  let b = await bell(p, W, `${s}-2`)
  chk(W, `${s}.2a`, 'moved to Sat 18: the reminder keeps both days, titled "You\'re SANS from Sat 18 Jul.", still READ (D2560 — nothing new)', b.rem && !b.rem.unread && b.rem.title === "You're SANS from Sat 18 Jul." && remDays(b.rem) === 'Sat 18, Mon 20 Jul', remSays(b), b.pic)
  const al = live(b).filter(l => lineIs(l, Wd.D('Sat 18 Jul')))
  chk(W, `${s}.2b`, 'one unread title-alone line "Your SANS date moved to Sat 18 Jul. · Saber" (D2391 A, nothing filed so no body)', al.length === 1 && al[0].unread && live(b).length === 1, changes(b), b.pic)
  chk(W, `${s}.2c`, 'the bell lit (by the unread change line)', b.lit === true, sayB(b), b.pic)
  chk(W, `${s}.2d`, 'his demo Thu 23 (a ground row) never named (D2564)', !/Thu 23/.test(b.rem ? b.rem.body : ''), remSays(b), b.pic)
  fitChk(W, `${s}.2f`, b)
  if (al[0]) {
    const t = await tapAndRead(p, W, al[0].id, `${s}-a2a`)
    rec(W, `${s}.a2a`, 'A2 (a): "Your SANS date moved to Sat 18 Jul. · Saber" (nothing hidden) tapped — where it opens, whether it turns read, whether the list stays open (NOT RULED)', tapSay(t), t.pic)
    chk(W, `${s}.a2ae`, 'A2 (a): no error and no window on a day he cannot file for', !/Couldn|error/i.test(t.toast || '') && (t.win === 'none' || !/Wed 15|Thu 16|Fri 17/.test(t.win)), tapSay(t), t.pic)
  }
  await asS(p, W)
  await moveTo(p, W, D[18], D[19], `${s}.3`)
  await asR(p, W)
  b = await bell(p, W, `${s}-4`)
  chk(W, `${s}.4a`, 'moved to Sun 19: Sat 18 leaves the reminder ("Mon 20 Jul"), titled "You\'re SANS from Sun 19 Jul.", no relight (D2394 2a)', b.rem && !b.rem.unread && b.rem.title === "You're SANS from Sun 19 Jul." && remDays(b.rem) === 'Mon 20 Jul', remSays(b), b.pic)
  chk(W, `${s}.4b`, 'a change line titled "Your SANS date moved to Sun 19 Jul. · Saber"', live(b).some(l => lineIs(l, Wd.D('Sun 19 Jul'))), changes(b), b.pic)
  rec(W, `${s}.4r`, 'ONE change line or two (the coordinator\'s reading) — RECORD', `${b.change.length}: ${changes(b)} · lit ${b.lit}`, b.pic)
  chk(W, `${s}.4d`, 'his demo Thu 23 never named; no two lines alike', !/Thu 23/.test(b.rem ? b.rem.body : '') && dupes(b).length === 0, sayB(b), b.pic)
  fitChk(W, `${s}.4f`, b)
  /* (e) the week change: Saber turns Edit Schedule two weeks on and back, twice; Ranger reloads */
  const before = { rem: b.rem ? { t: b.rem.title, d: remDays(b.rem), u: b.rem.unread } : null, lit: b.lit }
  await asS(p, W)
  const seen = []
  for (const wk of ['2026-07-27', '2026-07-13', '2026-07-27', '2026-07-13']) seen.push(await T.gotoWeek(p, W, wk))
  rec(W, `${s}.e1`, '(e) Saber: Edit Schedule turned to the week of Mon 27, back, on, back (the week shown after each, read)', J(seen), await W.pic(p, `${s}-e1`))
  await asR(p, W)
  await T.reload(p, 'us', 'us')
  b = await bell(p, W, `${s}-e2`)
  const after = { rem: b.rem ? { t: b.rem.title, d: remDays(b.rem), u: b.rem.unread } : null, lit: b.lit }
  chk(W, `${s}.e2`, '(e) Ranger reloads: the reminder\'s days and its read state unchanged (D2560 — no day new to him)', J(before.rem) === J(after.rem), `before ${J(before)} · after ${J(after)} · ${sayB(b)}`, b.pic)
}

/* ---------- B10: the date arrives, a day goes by, a move after the date ---------- */
async function b10(p, W) {
  const s = 'b10'
  await postAny(p, W, RANGER, D[17], `${s}.f1`)
  await seatOn(p, W, `${s}.f2`, 5)
  await saveWk2(p, W, `${s}.f3`)
  await asR(p, W)
  const rr = await readReminder(p, W, 'tap', `${s}-f4`)
  need(W, `${s}.f4`, 'Ranger taps his reminder on Wed 15 (read) — "Sat 18, Mon 20 Jul"', rr.ok && remDays(rr.after.rem) === 'Sat 18, Mon 20 Jul', rr.why, rr.pic)
  let t = await at(p, '2026-07-17T09:00:00')
  W.rec(`${s}.1t`, 'clock Fri 17 09:00, reloaded, Ranger signed in — the app\'s today', null, t)
  let b = await bell(p, W, `${s}-1`)
  chk(W, `${s}.1`, '1. Fri 17: the title "Your SANS availability is needed." (D2394 2b), the same days "Sat 18, Mon 20 Jul", still READ, not lit (D2560)', readRem(b, 'Your SANS availability is needed.', 'Sat 18, Mon 20 Jul'), sayB(b), b.pic)
  fitChk(W, `${s}.1f`, b)
  t = await at(p, '2026-07-19T09:00:00')
  W.rec(`${s}.2t`, 'clock Sun 19 09:00, reloaded — the app\'s today', null, t)
  b = await bell(p, W, `${s}-2`)
  rec(W, `${s}.2`, '2. Sun 19: Sat 18, now past — gone from the line or not (no ruling names a past day); read / lit', `${remSays(b)} · lit ${b.lit}`, b.pic)
  chk(W, `${s}.2n`, '2. no relight for a day dropping off (D2394 2a): not lit, the reminder (if any) read', b.lit === false && (!b.rem || !b.rem.unread), sayB(b), b.pic)
  await asS(p, W)
  await K.warReady(p)
  const m = await T.movePo(p, W, RANGER, D[17], '2026-07-21', `${s}-3`)
  rec(W, `${s}.3`, '3. Saber (Sun 19) opens the Post out sheet from his Fri 17 cell and moves the posting to Tue 21 — whether the sheet lets a begun posting move (P11)', J({ ok: m.ok, kind: m.kind, before: m.before, line: m.line, err: m.err, rec: m.rec }), m.pic)
  const moved = m.ok && /On 21 /.test(m.line || '')
  await asR(p, W)
  b = await bell(p, W, `${s}-4`)
  if (moved) {
    chk(W, `${s}.4a`, '4. one title-alone line "Your SANS date moved to Tue 21 Jul. · Saber" (D2391 A; he had read the reminder)', live(b).filter(l => lineIs(l, Wd.D('Tue 21 Jul'))).length === 1 && live(b).length === 1, sayB(b), b.pic)
    chk(W, `${s}.4b`, '4. Mon 20 leaves the reminder (he is no longer SANS on it)', !b.rem || !/Mon 20/.test(b.rem.body), remSays(b), b.pic)
    rec(W, `${s}.4r`, '4. the whole bell', sayB(b), b.pic)
    fitChk(W, `${s}.4f`, b)
  } else rec(W, `${s}.4`, '4. the sheet did not move it — Ranger\'s bell', sayB(b), b.pic)
}
/* B10 step 5 (lesson 29): the page left open as Ranger across midnight, no reload */
async function b10m(p, W) {
  const s = 'b10m'
  await postAny(p, W, RANGER, D[17], `${s}.f1`)
  await seatOn(p, W, `${s}.f2`, 5)
  await asR(p, W)
  await p.clock.setSystemTime(new Date('2026-07-16T23:59:30'))
  await sleep(1500)
  W.rec(`${s}.0t`, 'the clock set to Thu 16 23:59:30 with the page open as Ranger (no reload) — the page\'s today', null, await L.today(p))
  let b = await bell(p, W, `${s}-1`)
  chk(W, `${s}.1`, 'Thu 16 23:59: the reminder "You\'re SANS from Fri 17 Jul." / "…Sat 18 Jul…", UNREAD', b.rem && b.rem.unread && b.rem.title === "You're SANS from Fri 17 Jul." && remDays(b.rem) === 'Sat 18 Jul', sayB(b), b.pic)
  await T.closeAll(p, W)
  await sleep(45000)
  W.rec(`${s}.2t`, 'the clock left running 45 s, past midnight, no reload — the page\'s today', null, await L.today(p))
  b = await bell(p, W, `${s}-2`)
  rec(W, `${s}.2`, 'just past midnight, NO reload: whether the title changed to "Your SANS availability is needed." (lesson 29; no ruling on when) — RECORD', `${remSays(b)} · lit ${b.lit}`, b.pic)
  await T.closeAll(p, W)
  await p.clock.setSystemTime(new Date('2026-07-17T00:01:00'))
  await sleep(1500)
  b = await bell(p, W, `${s}-3`)
  rec(W, `${s}.3`, 'Fri 17 00:01, still no reload — RECORD the title', `${await L.today(p)} · ${remSays(b)} · lit ${b.lit}`, b.pic)
  await T.reload(p, 'us', 'us')
  b = await bell(p, W, `${s}-4`)
  chk(W, `${s}.4`, 'after a reload on Fri 17: "Your SANS availability is needed." (D2394 2b), Sat 18 named', b.rem && b.rem.title === 'Your SANS availability is needed.' && remDays(b.rem) === 'Sat 18 Jul', sayB(b), b.pic)
}

/* ---------- A1: moved twice before he reads, then back to the first date ---------- */
async function crewTwo(p, W, s, tag) {
  const out = []
  for (const di of [4, 5]) {
    const c = await T.boardCrewOf(p, W, di, RANGER, `${tag}-crew${di}`)
    const head = await p.evaluate(() => '').catch(() => '')
    out.push(`${di === 4 ? 'Fri 17' : 'Sat 18'}: ${T.crewWhere(c.c)}${head}`)
  }
  return out.join(' · ')
}
async function a1(p, W) {
  const s = 'a1'
  await postAny(p, W, RANGER, D[17], `${s}.f1`)
  await asR(p, W)
  await fileMe(p, W, 'Ranger', D[17], null, `${s}.f2`)
  await fileMe(p, W, 'Ranger', D[18], null, `${s}.f3`)
  const c0 = [await calSays(p, W, D[17], `${s}-f4a`), await calSays(p, W, D[18], `${s}-f4b`)]
  rec(W, `${s}.f4`, 'before: the SANS calendar\'s Fri 17 and Sat 18', c0.map(c => `${c.words} (his ${c.has ? 'shown' : 'hidden'}, F ${c.f})`).join(' · '), c0.map(c => c.pic).join(', '))
  const steps = [
    [D[17], D[18], 'Sat 18', b => { const h = live(b); return h.length === 1 && h[0].unread && lineIs(h[0], Wd.A('Sat 18 Jul', 'Fri 17 Jul', true)) }, '"Your SANS date moved to Sat 18 Jul. · Saber" / "You\'re active until then, so the SANS availability you filed for Fri 17 Jul is hidden. It comes back if you\'re SANS that day again." — one unread line (D2391 A)', [false, true]],
    [D[18], D[20], 'Mon 20', b => live(b).some(l => l.unread && lineIs(l, Wd.A('Mon 20 Jul', 'Fri 17, Sat 18 Jul', false))) && withWords(b, /is hidden/).length === 1, '"…moved to Mon 20 Jul." / "…filed for Fri 17, Sat 18 Jul is hidden. It comes back if you\'re SANS those days again." (D2391 A, plural), unread; one line carries the sentence', [false, false]],
    [D[20], D[17], 'Fri 17', b => b.change.length === 0 && b.lit === false, 'back at Fri 17: NO SANS change line left at all, the bell not lit (D2391; D2394 Q6)', [true, true]],
  ]
  for (let i = 0; i < steps.length; i++) {
    const [from, to, name, ok, words, shown] = steps[i]
    const t = `${s}.${i + 1}`
    await asS(p, W)
    await moveTo(p, W, from, to, `${t}.m`)
    const cr = await crewTwo(p, W, s, t.replace(/\./g, '-'))
    rec(W, `${t}c`, `moved to ${name}: Edit Schedule's crew list (Saber, Scheduler Board, no seat armed) — where Ranger stands on Fri 17 and Sat 18`, cr)
    await asR(p, W)
    const b = await bell(p, W, t.replace(/\./g, '-'))
    chk(W, `${t}a`, `moved to ${name}: ${words}`, ok(b), sayB(b), b.pic)
    rec(W, `${t}r`, `moved to ${name}: every SANS change line (ONE or two — the coordinator's reading)`, `${b.change.length}: ${changes(b)} · lit ${b.lit}`, b.pic)
    chk(W, `${t}d`, 'no two lines with the same full words', dupes(b).length === 0, sayB(b), b.pic)
    fitChk(W, `${t}f`, b)
    const c = [await calSays(p, W, D[17], `${t.replace(/\./g, '-')}-c17`), await calSays(p, W, D[18], `${t.replace(/\./g, '-')}-c18`)]
    chk(W, `${t}k`, `the SANS calendar: Fri 17 ${shown[0] ? 'shown, counted' : 'hidden, not counted'}; Sat 18 ${shown[1] ? 'shown, counted' : 'hidden, not counted'} (D2341)`, c[0].has === shown[0] && c[1].has === shown[1] && (c[0].f >= 1) === shown[0] && (c[1].f >= 1) === shown[1], c.map(x => `${x.words} (his ${x.has ? 'shown' : 'hidden'}, F ${x.f})`).join(' · '), c.map(x => x.pic).join(', '))
  }
}

/* ---------- A2 (c): a C line with nothing filed, tapped ---------- */
async function a2c(p, W) {
  const s = 'a2c'
  await tickOf(p, W, RANGER, true, `${s}.f1`)
  await seatOn(p, W, `${s}.f2`, 5)
  await asR(p, W)
  const rr = await readReminder(p, W, 'tap', `${s}-f3`)
  need(W, `${s}.f3`, 'Ranger taps his reminder (read), nothing filed', rr.ok, rr.why, rr.pic)
  await asS(p, W)
  await tickOf(p, W, RANGER, false, `${s}.1`)
  await asR(p, W)
  const b = await bell(p, W, `${s}-2`)
  const c = live(b).filter(l => lineIs(l, Wd.bare("You're no longer SANS.")))
  chk(W, `${s}.2`, 'the C line, title alone: "You\'re no longer SANS. · Saber" (D2391 C, nothing filed)', c.length === 1, sayB(b), b.pic)
  fitChk(W, `${s}.2f`, b)
  if (c[0]) {
    const t = await tapAndRead(p, W, c[0].id, `${s}-3`)
    rec(W, `${s}.3`, 'A2 (c): the C line tapped — where it opens, whether it turns read, whether the list stays open (NOT RULED)', tapSay(t), t.pic)
    chk(W, `${s}.3e`, 'A2 (c): no error, and no day window on a day he cannot file for (he is not SANS now)', !/Couldn|error/i.test(t.toast || '') && t.win === 'none', tapSay(t), t.pic)
  }
}

/* ---------- A5: Undo post out, then posted again from a LATER date, then moved back ---------- */
async function a5(p, W) {
  const s = 'a5'
  await postAny(p, W, RANGER, D[17], `${s}.f1`)
  await asR(p, W)
  await fileMe(p, W, 'Ranger', D[17], null, `${s}.f2`)
  await fileMe(p, W, 'Ranger', D[18], null, `${s}.f3`)
  await asS(p, W)
  await K.undoPost(p, W, D[17], `${s}.1`)
  await asR(p, W)
  let b = await bell(p, W, `${s}-2`)
  const bl = live(b).filter(l => lineIs(l, Wd.B('Fri 17, Sat 18 Jul', false)))
  chk(W, `${s}.2`, 'after Undo post out: "You\'re no longer posted out as SANS. · Saber" / "You\'re active again, so the SANS availability you filed for Fri 17, Sat 18 Jul is hidden. It comes back if you\'re SANS those days again." (D2391 B)', bl.length === 1 && bl[0].unread, sayB(b), b.pic)
  fitChk(W, `${s}.2f`, b)
  if (bl[0]) { const t = await tapAndRead(p, W, bl[0].id, `${s}-2t`); chk(W, `${s}.2t`, 'Ranger taps the B line: read', t.line && !t.line.unread, tapSay(t), t.pic) }
  await asS(p, W)
  await postAny(p, W, RANGER, D[18], `${s}.3`)
  await asR(p, W)
  b = await bell(p, W, `${s}-4`)
  const c18 = await calSays(p, W, D[18], `${s}-4c18`), c17 = await calSays(p, W, D[17], `${s}-4c17`)
  chk(W, `${s}.4a`, 'posted again from Sat 18: Sat 18 shown again and counted; Fri 17 still hidden (D2341)', c18.has && c18.f >= 1 && !c17.has, `${c17.words} (his ${c17.has ? 'shown' : 'hidden'}) · ${c18.words} (his ${c18.has ? 'shown' : 'hidden'})`, c17.pic + ', ' + c18.pic)
  const one = withWords(b, /filed for Fri 17 Jul is hidden\. It comes back if you're SANS that day again\./)
  chk(W, `${s}.4b`, 'the line\'s body names Fri 17 only, singular: "…filed for Fri 17 Jul is hidden. It comes back if you\'re SANS that day again." (D2394 Q6, D2391); no line still names Sat 18 as hidden', one.length === 1 && withWords(b, /Sat 18 Jul is hidden|Fri 17, Sat 18 Jul is hidden/).length === 0, sayB(b), b.pic)
  rec(W, `${s}.4r`, 'the bell lit or not for the shrinking; the title over the shrunk body, no longer true (his question, point 4) — RECORD', `lit ${b.lit} · ${changes(b)} · ${remSays(b)}`, b.pic)
  chk(W, `${s}.4d`, 'no two lines with the same full words', dupes(b).length === 0, sayB(b), b.pic)
  fitChk(W, `${s}.4f`, b)
  await asS(p, W)
  await moveTo(p, W, D[18], D[17], `${s}.5`)
  await asR(p, W)
  b = await bell(p, W, `${s}-6`)
  const d17 = await calSays(p, W, D[17], `${s}-6c17`), d18 = await calSays(p, W, D[18], `${s}-6c18`)
  chk(W, `${s}.6a`, 'moved to Fri 17: both shown and counted (D2341)', d17.has && d18.has && d17.f >= 1 && d18.f >= 1, `${d17.words} · ${d18.words}`, d17.pic + ', ' + d18.pic)
  chk(W, `${s}.6b`, 'the sentence gone: no live line says a day is hidden (D2394 Q6)', b.hiddenSaid.length === 0 && b.activeSaid.length === 0, sayB(b), b.pic)
  rec(W, `${s}.6r`, 'the read line\'s title alone or gone — RECORD', `${b.change.length}: ${changes(b)} · lit ${b.lit}`, b.pic)
  fitChk(W, `${s}.6f`, b)
}

/* ---------- A7: his own run, Undo and Redo beside an unread A line ---------- */
async function a7(p, W) {
  const s = 'a7'
  await postAny(p, W, RANGER, D[17], `${s}.f1`)
  await asR(p, W)
  await fileMe(p, W, 'Ranger', D[17], null, `${s}.f2`)
  await asS(p, W)
  await moveTo(p, W, D[17], D[18], `${s}.1`)
  const u = await barLook(p)
  chk(W, `${s}.2`, 'Saber\'s top bar Undo after the posting move: greyed, saying why (D350: the one undo never takes back a posting)', u.greyed === true && /post/i.test(u.title || ''), J(u), await W.pic(p, `${s}-2`))
  await asR(p, W)
  const r = await runOf(p, W, D[18], D[19], `${s}-3`)
  rec(W, `${s}.3`, 'Ranger (bell not opened): his own run Sat 18 → Sun 19, Add', `${r.how} · made ${J(r.made)} · note "${r.said}"`, r.pic)
  const has = async () => (await T.sansInputs(p)).filter(x => x.date === 'Jul 18').length
  const n0 = await has()
  need(W, `${s}.3n`, 'his Sat 18 – Sun 19 filing saved', n0 === 1, J(await T.sansInputs(p)))
  const t1 = await topBar(p, W, 'undo', RANGER, `${s}-4`)
  chk(W, `${s}.4`, 'his top bar Undo: the run taken back', t1.pressed && (await has()) === 0, `${tbSay(t1)} · filings ${J(await T.sansInputs(p))}`, t1.pic)
  const t2 = await topBar(p, W, 'redo', RANGER, `${s}-5`)
  chk(W, `${s}.5`, 'his top bar Redo: the run back', t2.pressed && (await has()) === 1, `${tbSay(t2)} · filings ${J(await T.sansInputs(p))}`, t2.pic)
  const b = await bell(p, W, `${s}-6`)
  const a = live(b).filter(l => lineIs(l, Wd.A('Sat 18 Jul', 'Fri 17 Jul', true)))
  chk(W, `${s}.6`, 'then the bell: his A line exactly as it was — ONE line, UNREAD, naming Fri 17 only; no second SANS change line (D2391)', a.length === 1 && a[0].unread && b.change.length === 1, sayB(b), b.pic)
  fitChk(W, `${s}.6f`, b)
}

/* ---------- A10: many hidden days, and a hidden day gone by ---------- */
async function a10(p, W) {
  const s = 'a10'
  await postAny(p, W, RANGER, D[17], `${s}.f1`)
  await asR(p, W)
  for (const [d, i] of [[D[17], 2], [D[18], 3], [D[20], 4], ['2026-07-21', 5]]) await fileMe(p, W, 'Ranger', d, null, `${s}.f${i}`)
  const f = await fileAcross(p, W, '2026-07-31', '2026-08-01', `${s}-f6`)
  need(W, `${s}.f6`, 'Ranger files Fri 31 Jul – Sat 1 Aug as one run (the window\'s calendar turned by its ›, Sat 1 Aug tapped)', f.made.length === 1 && /Aug 1|2026-08-01/.test(String(f.made[0].endDate)), `${J(f.made)} · read "${f.read}"`, f.pic)
  await asS(p, W)
  await K.undoPost(p, W, D[17], `${s}.1`)
  await asR(p, W)
  let b = await bell(p, W, `${s}-2`)
  const bl = live(b).filter(l => l.title === "You're no longer posted out as SANS." && l.who === '· Saber')
  chk(W, `${s}.2a`, 'the B title "You\'re no longer posted out as SANS. · Saber", one line, unread', bl.length === 1 && bl[0].unread, sayB(b), b.pic)
  chk(W, `${s}.2b`, 'the D2391 B body\'s shape: "You\'re active again, so the SANS availability you filed for … is hidden. It comes back if you\'re SANS those days again."', bl[0] && /^You're active again, so the SANS availability you filed for .+ is hidden\. It comes back if you're SANS those days again\.$/.test(bl[0].body), sayB(b), b.pic)
  rec(W, `${s}.2r`, 'how a long list of days is said — the exact words (D2342\'s "first three, then and N more" is ruled for the reminder only)', bl[0] ? `"${bl[0].body}"` : 'no line', b.pic)
  fitChk(W, `${s}.2f`, b)
  await at(p, '2026-07-19T09:00:00')
  W.rec(`${s}.3t`, 'clock Sun 19 09:00, reloaded, Ranger signed in — the app\'s today', null, await L.today(p))
  b = await bell(p, W, `${s}-3`)
  const bl2 = live(b).filter(l => l.title === "You're no longer posted out as SANS.")
  rec(W, `${s}.3`, 'Sun 19: whether Fri 17 and Sat 18, now past, leave the sentence (NOT RULED, his question — point 5)', bl2[0] ? `${say(bl2[0])} · lit ${b.lit}` : sayB(b), b.pic)
  chk(W, `${s}.3b`, 'a past day is never the only day said to "come back"', !bl2[0] || !/filed for (Fri 17|Sat 18|Fri 17, Sat 18) Jul is hidden/.test(bl2[0].body), sayB(b), b.pic)
  fitChk(W, `${s}.3f`, b)
}

const SCN = { b8a, b8c, b8cv, b8d, b10, b10m, a1, a2c, a5, a7, a10 }
const WHEN = { b10m: '2026-07-16T21:00:00' }
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : Object.keys(SCN)
for (const n of ONLY) {
  if (!SCN[n]) { console.log('no scenario', n); continue }
  console.log('=== ' + n)
  await T.run(n, SZ, scene(SCN[n]), WHEN[n])
  writeFileSync(path.join(process.env.W2_OUT, `results-all-${SZ}-${process.env.PART || 'x'}.json`), JSON.stringify(L.results, null, 1))
}
const c = k => L.results.filter(r => r.ok === k).length
console.log(`DONE ${SZ}: ${L.results.length} rows · PASS ${c(true)} · FAIL ${c(false)} · RECORDED ${c('REC')} · NOT WALKED ${c('NW')}`)
process.exit(0)
