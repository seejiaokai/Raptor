// swd-w11 — walker w11: the change lines (S1, S3, S4, S5, S9, S10, S11, S12, S13), each at both sizes. 24 Nov 26, chat 156.
// Run from raptor-port/, one size a process:  SZ=d W11_RUN=run1 [ONLY=s1a,s3a] node scripts/handpass/swd-w11.mjs
// EXPECTED: docs/superpowers/briefs/2026-11-24-sans-words-walk-brief.md (its lines win over Astra's).
import './swd-w11-env.mjs'
import { writeFileSync } from 'node:fs'
import path from 'node:path'
const K = await import('./swd-w11-lib.mjs')
const { X, T, L, RANGER, HEX, D, WK1, WK2, WORDS: Wd, lineIs, remIs, bell, say, sayB, readReminder, need, asR, asS, post, planRow, file, move, undoPost, chip, tick, seen, filings, scene, sleep } = K
console.log('VERSION swd-w11 4 · size', process.env.SZ || 'd', '· run', process.env.W11_RUN || 'run1', '· only', process.env.ONLY || 'all')
const SZ = process.env.SZ || 'd'
const R2 = 'Mon 20, Thu 23 Jul'
const chk = (W, id, what, ok, note, pic) => W.rec(id, what, !!ok, note, pic)
const rec = (W, id, what, note, pic) => W.rec(id, what, 'REC', note, pic)
const fitChk = (W, id, b) => chk(W, id, 'the bell: every line inside its panel, words wrapped, none cut off; Mark all read reachable', b.allFit && (b.markAll === 'in view' || b.markAll === 'none'), `all fit ${b.allFit} · Mark all read ${b.markAll}`, b.pic)

/* Saber's own bell carries no line of his own action */
async function saberQuiet(p, W, id) {
  const b = await bell(p, W, id)
  chk(W, id, "Saber's bell has no line about his own change", b.opened && b.change.length === 0, sayB(b).slice(0, 400), b.pic)
  await T.closeAll(p, W)
}

/* ---------- S1: date later, then back ---------- */
async function s1(p, W, o) {
  const s = o.id
  await planRow(p, W, WK2, 0, `${s}.f1`)
  await post(p, W, RANGER, D[17], `${s}.f2`)
  await asR(p, W)
  await file(p, W, D[17], o.to, `${s}.f3`)
  const r0 = await readReminder(p, W, 'markall', `${s}-f4`)
  need(W, `${s}.f4`, `Ranger reads his reminder for ${R2} (Mark all read)`, r0.ok && remIs(r0.before.rem, Wd.rem('Fri 17 Jul', R2)), r0.why, r0.pic)
  const f0 = await seen(p, W, D[17], `${s}-f5`)
  need(W, `${s}.f5`, 'his filing shows on Fri 17 before the move', f0.has, f0.words, f0.pic)
  await asS(p, W)
  await move(p, W, D[17], o.move, `${s}.01`)
  await saberQuiet(p, W, `${s}.02`)
  await asR(p, W)
  let b = await bell(p, W, `${s}-03`)
  const e = Wd.A(o.moveWord, o.hid, o.one)
  chk(W, `${s}.03`, `Ranger's bell: one change line, A's exact words for ${o.hid}, unread`, b.change.length === 1 && lineIs(b.change[0], e) && b.change[0].unread, sayB(b), b.pic)
  chk(W, `${s}.04`, 'no struck reminder', b.struck.length === 0, `${b.struck.length} struck`, b.pic)
  chk(W, `${s}.05`, `his live reminder stays, for ${R2}, under the new date`, remIs(b.rem, Wd.rem(o.moveWord, R2)), say(b.rem), b.pic)
  rec(W, `${s}.05r`, 'the live reminder read or unread after the move', say(b.rem), b.pic)
  fitChk(W, `${s}.06`, b)
  const hid = await seen(p, W, D[17], `${s}-07`)
  chk(W, `${s}.07`, 'Fri 17: his filing hidden, the count down by one', !hid.has && +hid.f === +f0.f - 1, `${hid.words} (F was ${f0.f})`, hid.pic)
  const kept = await seen(p, W, o.keep, `${s}-08`)
  chk(W, `${s}.08`, `${o.keep.slice(8)} Jul: ${o.keepShows ? 'his filing stays' : 'nothing filed there'}`, kept.has === o.keepShows, kept.words, kept.pic)
  await asS(p, W)
  await move(p, W, o.move, D[17], `${s}.09`)
  await saberQuiet(p, W, `${s}.10`)
  await asR(p, W)
  b = await bell(p, W, `${s}-11`)
  chk(W, `${s}.11`, 'back on Fri 17: no sentence still says a day is hidden', b.hiddenSaid.length === 0, sayB(b), b.pic)
  chk(W, `${s}.12`, 'no struck line', b.struck.length === 0, `${b.struck.length} struck`, b.pic)
  chk(W, `${s}.13`, `the reminder is back on Fri 17, for ${R2}`, remIs(b.rem, Wd.rem('Fri 17 Jul', R2)), say(b.rem), b.pic)
  rec(W, `${s}.13r`, 'what his change line says after the move back', b.change.map(say).join(' || ') || 'no change line', b.pic)
  const back = await seen(p, W, D[17], `${s}-14`)
  chk(W, `${s}.14`, 'Fri 17: his filing is back and counted, nothing re-entered', back.has && +back.f === +f0.f, `${back.words} (F was ${f0.f})`, back.pic)
  const n = await filings(p)
  chk(W, `${s}.15`, 'one filing in the store, no duplicate', n.length === 1, L.J(n))
}

/* ---------- S3: moved twice before he reads ---------- */
async function s3(p, W, o) {
  const s = o.id
  await post(p, W, RANGER, D[17], `${s}.f1`)
  await asR(p, W)
  await file(p, W, D[17], D[19], `${s}.f2`)
  const f0 = await seen(p, W, D[18], `${s}-f3`)
  need(W, `${s}.f3`, 'his filing shows on Sat 18', f0.has, f0.words, f0.pic)
  await asS(p, W)
  await move(p, W, D[17], D[18], `${s}.01`)
  await move(p, W, D[18], D[20], `${s}.02`)
  /* read as Saber, so Ranger's bell stays unopened */
  for (const [iso, k] of [[D[17], 'a'], [D[18], 'b'], [D[19], 'c']]) {
    const v = await seen(p, W, iso, `${s}-03${k}`)
    chk(W, `${s}.03${k}`, `at Mon 20: ${iso.slice(8)} Jul hidden`, !v.has, v.words, v.pic)
  }
  if (o.peek) {
    await asR(p, W)
    const b = await bell(p, W, `${s}-04`)
    chk(W, `${s}.04`, 'after two moves: ONE change line, the latest title, unread, naming all three days', b.change.length === 1 && lineIs(b.change[0], Wd.A('Mon 20 Jul', 'Fri 17, Sat 18, Sun 19 Jul', false)) && b.change[0].unread, sayB(b), b.pic)
    fitChk(W, `${s}.04f`, b)
    await asS(p, W)
  }
  await move(p, W, D[20], D[18], `${s}.05`)
  await asR(p, W)
  const b = await bell(p, W, `${s}-06`)
  chk(W, `${s}.06`, 'back at Sat 18: ONE change line, the latest title, unread, its body naming only Fri 17', b.change.length === 1 && lineIs(b.change[0], Wd.A('Sat 18 Jul', 'Fri 17 Jul', true)) && b.change[0].unread, sayB(b), b.pic)
  chk(W, `${s}.07`, 'no sentence calls Sat or Sun hidden', !b.lines.some(l => /is hidden/.test(l.body) && /Sat 18|Sun 19/.test(l.body.split('is hidden')[0])), sayB(b), b.pic)
  const fri = await seen(p, W, D[17], `${s}-08`), sat = await seen(p, W, D[18], `${s}-09`), sun = await seen(p, W, D[19], `${s}-10`)
  chk(W, `${s}.08`, 'Fri 17 stays hidden', !fri.has, fri.words, fri.pic)
  chk(W, `${s}.09`, 'Sat 18 is back, counted once', sat.has && +sat.f === +f0.f, `${sat.words} (F was ${f0.f})`, sat.pic)
  chk(W, `${s}.10`, 'Sun 19 is back', sun.has, sun.words, sun.pic)
  const n = await filings(p)
  chk(W, `${s}.11`, 'one filing in the store, no duplicate', n.length === 1, L.J(n))
}

/* ---------- S4: Quals untick, read, Undo, Redo ---------- */
/* Saber keeps his tab (a sign-out clears his Undo list, D148); Ranger looks from a second tab of the same browser, reloaded
   before each look so that it reads what Saber's tab saved (walk-scripts §3). */
async function ranger2(ctx, W) {
  const p2 = await ctx.newPage()
  p2.on('pageerror', e => W.errs.push('PAGEERROR(tab2) ' + e.message))
  p2.on('console', m => { if (m.type() === 'error') W.errs.push('CONSOLE(tab2) ' + m.text().slice(0, 200)) })
  await p2.goto(L.URL_); await sleep(1200)
  if (!(await p2.locator('#luser:visible').count())) await L.signOut(p2, W)
  await L.signIn(p2, 'us', 'us')
  return p2
}
const look2 = async (p2, W, tag) => { await p2.bringToFront(); await T.reload(p2, 'us', 'us'); return bell(p2, W, tag) }
async function s4(p, W, ctx, o) {
  const s = o.id
  await tick(p, W, true, `${s}.f1`)
  await planRow(p, W, WK2, 0, `${s}.f2`)
  await asR(p, W)
  await file(p, W, o.from, o.to, `${s}.f3`)
  const r0 = await readReminder(p, W, 'markall', `${s}-f4`)
  need(W, `${s}.f4`, 'Ranger reads his reminder (Mark all read)', r0.ok, r0.why, r0.pic)
  rec(W, `${s}.f4r`, 'the reminder he read', say(r0.before.rem), r0.pic)
  const f0 = await seen(p, W, o.from, `${s}-f5`)
  need(W, `${s}.f5`, 'his filing shows before the untick', f0.has, f0.words, f0.pic)
  await asS(p, W)
  await tick(p, W, false, `${s}.01`)
  const p2 = await ranger2(ctx, W)
  let b = await look2(p2, W, `${s}-02`)
  if (o.undoFirst) {
    chk(W, `${s}.02`, "Ranger's bell: C's exact words, unread", b.change.length === 1 && lineIs(b.change[0], Wd.C(o.days, o.one)) && b.change[0].unread, sayB(b), b.pic)
    await T.closeAll(p2, W); await p.bringToFront()
    await W.press(p, '#undoBtn:visible', 'undo'); await sleep(800)
    chk(W, `${s}.03`, 'Saber: top bar Undo gives the tick back', (await T.rec(p, RANGER)).san === true, `${L.J(await T.rec(p, RANGER))} · "${await L.toastSaid(p)}"`, await W.pic(p, `${s}-03`))
    b = await look2(p2, W, `${s}-04`)
    chk(W, `${s}.04`, 'an UNREAD change line simply goes on Undo: no line, nothing struck', b.change.length === 0 && b.struck.length === 0, sayB(b), b.pic)
    const v = await seen(p2, W, o.from, `${s}-05`)
    chk(W, `${s}.05`, 'his filing is back', v.has, v.words, v.pic)
    /* Redo of a line he never read: no read mark in either tab, so this order is free of the two-tab limit */
    await T.closeAll(p2, W); await p.bringToFront()
    await W.press(p, '#redoBtn:visible', 'redo'); await sleep(800)
    chk(W, `${s}.06`, 'Redo takes the tick off again', (await T.rec(p, RANGER)).san === false, `${L.J(await T.rec(p, RANGER))} · "${await L.toastSaid(p)}"`, await W.pic(p, `${s}-06`))
    b = await look2(p2, W, `${s}-07`)
    chk(W, `${s}.07`, "Redo tells him again: C's exact words, one line, unread, the bell lit", b.lit === true && b.change.length === 1 && lineIs(b.change[0], Wd.C(o.days, o.one)) && b.change[0].unread, sayB(b), b.pic)
    const h = await seen(p2, W, o.from, `${s}-08`)
    chk(W, `${s}.08`, 'Redo hides his filing again', !h.has, h.words, h.pic)
    await p2.close()
    return
  }
  chk(W, `${s}.02`, "Ranger's bell: C's exact words, unread", b.change.length === 1 && lineIs(b.change[0], Wd.C(o.days, o.one)) && b.change[0].unread, sayB(b), b.pic)
  chk(W, `${s}.03`, 'no struck reminder; the reminder is gone (he is not SANS)', b.struck.length === 0 && !b.rem, sayB(b), b.pic)
  fitChk(W, `${s}.03f`, b)
  const hid = await seen(p2, W, o.from, `${s}-04`)
  chk(W, `${s}.04`, 'his filing is hidden', !hid.has, hid.words, hid.pic)
  /* he reads the line by a tap on it */
  b = await bell(p2, W, `${s}-05`)
  await X.bellTap(p2, W, b.change[0].id, `${s}-05`)
  await T.closeAll(p2, W)
  b = await bell(p2, W, `${s}-06`)
  chk(W, `${s}.06`, 'Ranger taps the line: it is read', b.change.length === 1 && !b.change[0].unread, sayB(b), b.pic)
  await T.closeAll(p2, W)
  await p.bringToFront()
  const ub = await p.locator('#undoBtn').getAttribute('title')
  await W.press(p, '#undoBtn:visible', 'undo'); await sleep(800)
  chk(W, `${s}.07`, 'his reading does not stop Saber\'s Undo: the tick is back', (await T.rec(p, RANGER)).san === true, `button "${ub}" · ${L.J(await T.rec(p, RANGER))} · "${await L.toastSaid(p)}"`, await W.pic(p, `${s}-07`))
  b = await look2(p2, W, `${s}-08`)
  chk(W, `${s}.08`, 'after Undo no live sentence still says a day is hidden', b.hiddenSaid.length === 0, sayB(b), b.pic)
  W.rec(`${s}.08s`, 'a READ change line shows struck, "taken back · Saber"', 'NW', `cannot be played through the app's controls in one browser: Saber's Undo list clears at a sign-out (D148), and across two tabs his tab does not know what the other tab read (walk-scripts §3). Two-tab reading, not a finding: ${sayB(b)}`, b.pic)
  rec(W, `${s}.08r`, 'the reminder he had read, once Undo brings it back (two-tab staging)', say(b.rem), b.pic)
  const v = await seen(p2, W, o.from, `${s}-09`)
  chk(W, `${s}.09`, 'Undo restores his filing', v.has, v.words, v.pic)
  await T.closeAll(p2, W); await p.bringToFront()
  await W.press(p, '#redoBtn:visible', 'redo'); await sleep(800)
  chk(W, `${s}.10`, 'Redo takes the tick off again', (await T.rec(p, RANGER)).san === false, `${L.J(await T.rec(p, RANGER))} · "${await L.toastSaid(p)}"`, await W.pic(p, `${s}-10`))
  b = await look2(p2, W, `${s}-11`)
  chk(W, `${s}.11`, "Redo tells him again: C's exact words, one line, not struck", b.change.filter(l => !l.struck.length).length === 1 && lineIs(b.change.find(l => !l.struck.length), Wd.C(o.days, o.one)), sayB(b), b.pic)
  rec(W, `${s}.11r`, 'the redone line read or unread', b.change.map(say).join(' || '), b.pic)
  const h2 = await seen(p2, W, o.from, `${s}-12`)
  chk(W, `${s}.12`, 'Redo hides his filing again', !h2.has, h2.words, h2.pic)
  await p2.close()
}

/* ---------- S5: both ticked and posted ---------- */
/* Ticked SANS, Ranger leaves his Leave War group for the SANS group, hidden until "+ SANS" is on (run 1: no cell). Every door
   is tried in turn and logged (walk-scripts §4): his cell as it stands; "+ SANS" on, then his cell; last, the order turned
   round (the tick off, the posting made, the tick on again) — the same end state, said so in the sheet. */
async function tickAndPost(p, W, iso, s) {
  await tick(p, W, true, `${s}.f1`)
  const tryPost = async tag => { try { await K.warReady(p); const r =await L.postOut(p, W, RANGER, iso, tag); await T.closeAll(p, W); return r } catch (e) { await T.closeAll(p, W).catch(() => {}); return { line: 'stopped: ' + String(e.message).split('\n')[0] } } }
  let r = await tryPost(`${s}.f2a`)
  W.rec(`${s}.f2a`, 'door 1: his Leave War cell as it stands → ⋯ → Post out → SANS', null, `"${r.line}"`, r.pic)
  if (/becomes SANS/.test(r.line || '')) return need(W, `${s}.f2`, `ticked, then posted SANS from ${iso} (door 1)`, true, `"${r.line}"`)
  const g = await L.sansGroup(p, W, true, `${s}-grp`)
  r = await tryPost(`${s}.f2b`)
  W.rec(`${s}.f2b`, `door 2: Leave War ⚙ "+ SANS" on (group shown ${g.group}), then his cell → ⋯ → Post out → SANS`, null, `"${r.line}"`, [g.pic, r.pic].filter(Boolean).join(', '))
  if (/becomes SANS/.test(r.line || '')) return need(W, `${s}.f2`, `ticked, then posted SANS from ${iso} (door 2)`, true, `"${r.line}"`)
  await tick(p, W, false, `${s}.f2c1`)
  await post(p, W, RANGER, iso, `${s}.f2c2`)
  await tick(p, W, true, `${s}.f2c3`)
  W.rec(`${s}.f2`, 'set-up reached by door 3 only: the tick off, the posting made, the tick on again (same end state)', 'REC', 'a ticked man could not be posted out SANS through doors 1 and 2 — RECORDED for the host')
}
async function s5a(p, W) {
  const s = 's5a'
  await tickAndPost(p, W, D[17], s)
  await planRow(p, W, WK2, 0, `${s}.f3`)
  await asR(p, W)
  await file(p, W, D[17], D[18], `${s}.f4`)
  const r0 = await readReminder(p, W, 'markall', `${s}-f5`)
  need(W, `${s}.f5`, 'Ranger reads his reminder', r0.ok, r0.why, r0.pic)
  rec(W, `${s}.f5r`, 'the reminder he read', say(r0.before.rem), r0.pic)
  /* ticked SANS today, he is SANS now: Thu 16 (planned, nothing filed, + Commitment open to him) is an outstanding SANS day,
     and with his date arrived the title is "Your SANS availability is needed." (the brief's words) */
  chk(W, `${s}.f5c`, 'his reminder covers every outstanding SANS day the tick makes — Thu 16, Mon 20, Thu 23 — under "Your SANS availability is needed."', remIs(r0.before.rem, Wd.needed('Thu 16, Mon 20, Thu 23 Jul')), say(r0.before.rem), r0.pic)
  await asS(p, W)
  await move(p, W, D[17], D[18], `${s}.01`)
  await asR(p, W)
  let b = await bell(p, W, `${s}-02`)
  chk(W, `${s}.02`, 'posting moved later, the hand tick stands: no hidden-day body, no "active again"', b.hiddenSaid.length === 0 && b.activeSaid.length === 0, sayB(b), b.pic)
  chk(W, `${s}.03`, 'the live reminder stays, nothing struck', !!b.rem && !b.rem.struck.length && b.struck.length === 0, say(b.rem), b.pic)
  rec(W, `${s}.03r`, 'a change title, if the app owes one', b.change.map(say).join(' || ') || 'no change line', b.pic)
  let v = await seen(p, W, D[17], `${s}-04`)
  chk(W, `${s}.04`, 'Fri 17: his filing still shows (the tick covers it)', v.has, v.words, v.pic)
  await asS(p, W)
  await undoPost(p, W, D[18], `${s}.05`)
  await asR(p, W)
  b = await bell(p, W, `${s}-06`)
  chk(W, `${s}.06`, 'posting removed, the tick stands: no hidden-day body, no "active again"', b.hiddenSaid.length === 0 && b.activeSaid.length === 0, sayB(b), b.pic)
  chk(W, `${s}.07`, 'the live reminder stays, nothing struck', !!b.rem && b.struck.length === 0, say(b.rem), b.pic)
  rec(W, `${s}.07r`, 'a change title, if the app owes one', b.change.map(say).join(' || ') || 'no change line', b.pic)
  v = await seen(p, W, D[18], `${s}-08`)
  chk(W, `${s}.08`, 'Sat 18: his filing still shows', v.has, v.words, v.pic)
}
async function s5b(p, W) {
  const s = 's5b'
  await tickAndPost(p, W, D[17], s)
  await planRow(p, W, WK2, 0, `${s}.f3`)
  await asR(p, W)
  await file(p, W, D[17], D[18], `${s}.f4`)
  const r0 = await readReminder(p, W, 'markall', `${s}-f5`)
  need(W, `${s}.f5`, 'Ranger reads his reminder', r0.ok, r0.why, r0.pic)
  chk(W, `${s}.f5c`, 'his reminder covers every outstanding SANS day the tick makes — Thu 16, Mon 20, Thu 23 — under "Your SANS availability is needed."', remIs(r0.before.rem, Wd.needed('Thu 16, Mon 20, Thu 23 Jul')), say(r0.before.rem), r0.pic)
  await asS(p, W)
  await tick(p, W, false, `${s}.01`)
  await asR(p, W)
  const b = await bell(p, W, `${s}-02`)
  chk(W, `${s}.02`, 'tick off, the posting stands ahead, nothing hidden: NO change line', b.change.length === 0, sayB(b), b.pic)
  chk(W, `${s}.03`, `the reminder stays, on Fri 17, for ${R2}`, remIs(b.rem, Wd.rem('Fri 17 Jul', R2)), say(b.rem), b.pic)
  const v = await seen(p, W, D[17], `${s}-04`), v2 = await seen(p, W, D[18], `${s}-05`)
  chk(W, `${s}.04`, 'Fri 17: his filing still shows', v.has, v.words, v.pic)
  chk(W, `${s}.05`, 'Sat 18: his filing still shows', v2.has, v2.words, v2.pic)
}
async function s5c(p, W) {
  const s = 's5c'
  await tickAndPost(p, W, D[18], s)
  await planRow(p, W, WK2, 0, `${s}.f3`)
  await asR(p, W)
  await file(p, W, D[17], D[18], `${s}.f4`)
  const r0 = await readReminder(p, W, 'markall', `${s}-f5`)
  need(W, `${s}.f5`, 'Ranger reads his reminder', r0.ok, r0.why, r0.pic)
  await asS(p, W)
  await tick(p, W, false, `${s}.01`)
  await asR(p, W)
  const b = await bell(p, W, `${s}-02`)
  const exact = b.change.length === 1 && lineIs(b.change[0], Wd.C('Fri 17 Jul', true))
  rec(W, `${s}.02`, `the tick alone covered Fri 17: expected "You're no longer SANS. · Saber", body naming only Fri 17 (RECORD, an open question) — ${exact ? 'words as expected' : 'WORDS DIFFER'}`, sayB(b), b.pic)
  chk(W, `${s}.03`, 'that line, if any, names only Fri 17', b.hiddenSaid.every(l => !/Sat 18/.test(l.body)), sayB(b), b.pic)
  const v = await seen(p, W, D[17], `${s}-04`), v2 = await seen(p, W, D[18], `${s}-05`)
  chk(W, `${s}.04`, 'Fri 17: hidden (only the tick covered it)', !v.has, v.words, v.pic)
  chk(W, `${s}.05`, 'Sat 18: still shows (the posting covers it)', v2.has, v2.words, v2.pic)
}

/* ---------- S9 / S10: nothing filed, reminder unread / read ---------- */
const AFTER = {
  later: { rem: Wd.rem('Sat 18 Jul', R2), title: 'Your SANS date moved to Sat 18 Jul.' },
  earlier: { rem: Wd.rem('Thu 16 Jul', 'Thu 16, Mon 20, Thu 23 Jul'), title: 'Your SANS date moved to Thu 16 Jul.' },
  undo: { rem: null, title: "You're no longer posted out as SANS." },
  outcome: { rem: null, title: "You're no longer posted out as SANS." },
  untick: { rem: null, title: "You're no longer SANS." },
}
async function change(p, W, kind, sid) {
  if (kind === 'later') return move(p, W, D[17], D[18], sid)
  if (kind === 'earlier') return move(p, W, D[17], D[16], sid)
  if (kind === 'undo') return undoPost(p, W, D[17], sid)
  if (kind === 'outcome') return chip(p, W, D[17], sid)
  return tick(p, W, false, sid)
}
async function s9(p, W, kind, route) {
  const s = (route ? 's10' : 's9') + kind + (route ? '-' + route : '')
  if (kind === 'untick') await tick(p, W, true, `${s}.f1`); else await post(p, W, RANGER, D[17], `${s}.f1`)
  await planRow(p, W, WK2, 0, `${s}.f2`)
  if (route) {
    await asR(p, W)
    const r0 = await readReminder(p, W, route, `${s}-f3`)
    need(W, `${s}.f3`, `Ranger reads his reminder (${route === 'tap' ? 'a tap on the line' : 'Mark all read'})`, r0.ok, r0.why, r0.pic)
    await asS(p, W)
  }
  await change(p, W, kind, `${s}.01`)
  await asR(p, W)
  const b = await bell(p, W, `${s}-02`)
  const a = AFTER[kind]
  if (!route) {
    chk(W, `${s}.02`, 'nothing filed, reminder never read: NO change line', b.change.length === 0, sayB(b), b.pic)
    if (a.rem) chk(W, `${s}.03`, 'the live reminder reflects the days left', remIs(b.rem, a.rem), say(b.rem), b.pic)
    else {
      chk(W, `${s}.03`, 'the obsolete reminder is gone', !b.rem, say(b.rem), b.pic)
      chk(W, `${s}.04`, 'no empty card, no bell lit for nothing', b.lit === false && b.lines.length === 0, sayB(b), b.pic)
    }
  } else {
    chk(W, `${s}.02`, `one change line: "${a.title} · Saber", the title alone, unread`, b.change.length === 1 && lineIs(b.change[0], Wd.bare(a.title)) && b.change[0].unread, sayB(b), b.pic)
    chk(W, `${s}.03`, 'no invented dates, no hidden-day body, nothing struck', b.hiddenSaid.length === 0 && b.struck.length === 0, sayB(b), b.pic)
    if (a.rem) chk(W, `${s}.04`, 'the live reminder stays, updated', remIs(b.rem, a.rem), say(b.rem), b.pic)
    else chk(W, `${s}.04`, 'the reminder is gone', !b.rem, say(b.rem), b.pic)
    fitChk(W, `${s}.05`, b)
  }
}

/* ---------- S11: remove the posting, make it again, repeat ---------- */
async function s11(p, W, o) {
  const s = o.id
  await planRow(p, W, WK2, 0, `${s}.f1`)
  await post(p, W, RANGER, D[17], `${s}.f2`)
  await asR(p, W)
  await file(p, W, o.from, o.to, `${s}.f3`)
  const r0 = await readReminder(p, W, 'markall', `${s}-f4`)
  need(W, `${s}.f4`, 'Ranger reads his reminder', r0.ok, r0.why, r0.pic)
  const f0 = await seen(p, W, o.from, `${s}-f5`)
  need(W, `${s}.f5`, 'his filing shows', f0.has, f0.words, f0.pic)
  for (let round = 1; round <= 2; round++) {
    const t = `${s}.r${round}`
    await asS(p, W)
    await undoPost(p, W, D[17], `${t}.01`)
    if (round === 2) {
      const dis = await p.locator('#undoBtn').isDisabled().catch(() => 'no button')
      const title = await p.locator('#undoBtn').getAttribute('title').catch(() => '')
      if (dis === false) { await W.press(p, '#undoBtn:visible', 'toolbar-undo'); await sleep(700) }
      await K.warReady(p)
      const sh = await T.sheet(p, W, RANGER, D[17], `${t}-02`)
      chk(W, `${t}.02`, 'the top bar Undo does not make the posting again', sh.kind !== 'posted-out sheet', `Undo button ${dis === false ? 'pressed' : 'greyed'} "${title}" · his Fri 17 cell opens: ${sh.kind}`, sh.pic)
      await T.closeAll(p, W)
    }
    await asR(p, W)
    let b = await bell(p, W, `${t}-03`)
    const live = b.change.filter(l => !l.struck.length && l.unread)
    chk(W, `${t}.03`, `B's exact words, unread${round === 2 ? ' (owed again on the second cycle)' : ''}`, live.length === 1 && lineIs(live[0], Wd.B(o.days, o.one)), sayB(b), b.pic)
    chk(W, `${t}.04`, 'the reminder is gone, nothing struck', !b.rem && b.struck.length === 0, sayB(b), b.pic)
    fitChk(W, `${t}.04f`, b)
    const hid = await seen(p, W, o.from, `${t}-05`)
    chk(W, `${t}.05`, 'his filing is hidden', !hid.has, hid.words, hid.pic)
    /* round 1: he reads B before the posting comes back */
    if (round === 1) {
      b = await bell(p, W, `${t}-06`)
      await X.bellTap(p, W, b.change.find(l => l.unread).id, `${t}-06`)
      await T.closeAll(p, W)
      b = await bell(p, W, `${t}-07`)
      chk(W, `${t}.07`, 'he reads B: it is read', b.change.length >= 1 && b.change.every(l => !l.unread), sayB(b), b.pic)
      await T.closeAll(p, W)
    }
    await asS(p, W)
    await post(p, W, RANGER, D[17], `${t}.08`)
    await asR(p, W)
    b = await bell(p, W, `${t}-09`)
    chk(W, `${t}.09`, 'posted again: no sentence still says a day is hidden', b.hiddenSaid.length === 0, sayB(b), b.pic)
    chk(W, `${t}.10`, 'nothing struck', b.struck.length === 0, `${b.struck.length} struck`, b.pic)
    rec(W, `${t}.10r`, 'what the bell says after the posting is made again', sayB(b), b.pic)
    const v = await seen(p, W, o.from, `${t}-11`)
    chk(W, `${t}.11`, 'his filing is back without being entered again, counted once', v.has && +v.f === +f0.f, `${v.words} (F was ${f0.f})`, v.pic)
    const n = await filings(p)
    chk(W, `${t}.12`, 'one filing in the store, no duplicate', n.length === 1, L.J(n))
  }
}
/* Ranger and Hex posted separately: taking Ranger's posting off touches only Ranger */
async function s11c(p, W) {
  const s = 's11c'
  await post(p, W, RANGER, D[17], `${s}.f1`)
  await post(p, W, HEX, D[17], `${s}.f2`)
  await asR(p, W)
  await file(p, W, D[17], D[18], `${s}.f3`)
  const hs = await T.as(p, W, 'hex', 'x')
  need(W, `${s}.f4`, 'Hex signs in', /Hex/.test(hs), hs)
  const hf = await T.file(p, W, D[18], null, ['fly'], null, `${s}-f5`)
  need(W, `${s}.f5`, 'Hex files Fly on Sat 18', !!hf.iid, hf.iid ? L.J(hf.made) : hf.refused, hf.pic)
  await T.closeAll(p, W)
  await asS(p, W)
  await undoPost(p, W, D[17], `${s}.01`)
  await asR(p, W)
  let b = await bell(p, W, `${s}-02`)
  chk(W, `${s}.02`, "Ranger: B's exact words", b.change.length === 1 && lineIs(b.change[0], Wd.B('Fri 17, Sat 18 Jul', false)), sayB(b), b.pic)
  await T.as(p, W, 'hex', 'x')
  b = await bell(p, W, `${s}-03`)
  chk(W, `${s}.03`, "Hex's bell has no change line and none of Ranger's dates", b.change.length === 0, sayB(b), b.pic)
  const v = await seen(p, W, D[18], `${s}-04`, 'Hex')
  chk(W, `${s}.04`, "Hex's own filing still shows", v.has, v.words, v.pic)
  await asS(p, W)
  await post(p, W, RANGER, D[17], `${s}.05`)
  const r = await seen(p, W, D[18], `${s}-06`), h = await seen(p, W, D[18], `${s}-07`, 'Hex')
  chk(W, `${s}.06`, "posted again: Ranger's filing is back", r.has, r.words, r.pic)
  chk(W, `${s}.07`, "and Hex's is still there", h.has, h.words, h.pic)
}

/* ---------- S12: an earlier date adds an outstanding day ---------- */
async function s12(p, W, o) {
  const s = o.id
  await planRow(p, W, WK1, 5, `${s}.f1`)
  await post(p, W, RANGER, D[17], `${s}.f2`)
  await asR(p, W)
  for (const [i, iso] of (o.filed || []).entries()) await file(p, W, iso, iso, `${s}.f3${'abc'[i]}`)
  const r0 = await readReminder(p, W, 'markall', `${s}-f4`)
  need(W, `${s}.f4`, 'Ranger reads his Sat 18 reminder', r0.ok && remIs(r0.before.rem, Wd.rem('Fri 17 Jul', 'Sat 18 Jul')), r0.why + ' · was ' + say(r0.before.rem), r0.pic)
  await asS(p, W)
  await move(p, W, D[17], D[16], `${s}.01`)
  await asR(p, W)
  const b = await bell(p, W, `${s}-02`)
  chk(W, `${s}.02`, 'D: "Your SANS date moved to Thu 16 Jul. · Saber", the title alone, unread', b.change.length === 1 && lineIs(b.change[0], Wd.D('Thu 16 Jul')) && b.change[0].unread, sayB(b), b.pic)
  chk(W, `${s}.03`, 'the live reminder stays, naming Thu 16 and Sat 18', remIs(b.rem, Wd.rem('Thu 16 Jul', 'Thu 16, Sat 18 Jul')), say(b.rem), b.pic)
  rec(W, `${s}.03r`, 'the live reminder read or unread after the earlier date', say(b.rem), b.pic)
  chk(W, `${s}.04`, 'no hidden-day sentence, nothing struck', b.hiddenSaid.length === 0 && b.struck.length === 0, sayB(b), b.pic)
  fitChk(W, `${s}.04f`, b)
  if (b.rem) {
    const t = await X.bellTap(p, W, b.rem.id, `${s}-05`)
    chk(W, `${s}.05`, 'a tap on the reminder opens the SANS calendar on Thu 16', t.page === 'inputs' && t.cal && t.win && /Thu(rsday)?\s*16/i.test(t.win.ttl), `page ${t.page} · ${t.month} · window "${t.win && t.win.ttl}" · + Commitment ${t.win && t.win.add}`, t.pic)
    await T.closeAll(p, W)
  }
  for (const [i, iso] of (o.filed || []).entries()) {
    const v = await seen(p, W, iso, `${s}-06${'abc'[i]}`)
    chk(W, `${s}.06${'abc'[i]}`, `moving earlier hides nothing: ${iso.slice(8)} Jul still shows`, v.has, v.words, v.pic)
  }
}

/* ---------- S13: another outcome ---------- */
async function s13(p, W, o) {
  const s = o.id
  await planRow(p, W, WK2, 0, `${s}.f1`)
  await post(p, W, RANGER, D[17], `${s}.f2`)
  await asR(p, W)
  await file(p, W, D[17], o.to, `${s}.f3`)
  if (o.read) {
    const r0 = await readReminder(p, W, 'markall', `${s}-f4`)
    need(W, `${s}.f4`, 'Ranger reads his reminder', r0.ok, r0.why, r0.pic)
  }
  const f0 = await seen(p, W, D[17], `${s}-f5`)
  need(W, `${s}.f5`, 'his filing shows', f0.has, f0.words, f0.pic)
  await asS(p, W)
  await chip(p, W, D[17], `${s}.01`)
  await saberQuiet(p, W, `${s}.02`)
  const hs = await asR(p, W)
  chk(W, `${s}.03`, 'Ranger can still sign in', /Ranger/.test(hs), hs)
  let b = await bell(p, W, `${s}-04`)
  chk(W, `${s}.04`, "E's exact words, unread", b.change.length === 1 && lineIs(b.change[0], Wd.E(o.days, o.one)) && b.change[0].unread, sayB(b), b.pic)
  chk(W, `${s}.05`, 'no "active again", no reminder, nothing struck', b.activeSaid.length === 0 && !b.rem && b.struck.length === 0, sayB(b), b.pic)
  fitChk(W, `${s}.05f`, b)
  const hid = await seen(p, W, D[17], `${s}-06`)
  chk(W, `${s}.06`, 'his filing is hidden, the count down by one', !hid.has && +hid.f === +f0.f - 1, `${hid.words} (F was ${f0.f})`, hid.pic)
  await asS(p, W)
  await chip(p, W, D[17], `${s}.07`)
  await asR(p, W)
  b = await bell(p, W, `${s}-08`)
  chk(W, `${s}.08`, 'SANS again: no sentence still says a day is hidden', b.hiddenSaid.length === 0, sayB(b), b.pic)
  chk(W, `${s}.09`, `his reminder is back, for ${R2}; nothing struck`, remIs(b.rem, Wd.rem('Fri 17 Jul', R2)) && b.struck.length === 0, sayB(b), b.pic)
  rec(W, `${s}.09r`, 'what the bell says after SANS is chosen again', sayB(b), b.pic)
  const v = await seen(p, W, D[17], `${s}-10`)
  chk(W, `${s}.10`, 'his filing is back, counted once', v.has && +v.f === +f0.f, `${v.words} (F was ${f0.f})`, v.pic)
  const n = await filings(p)
  chk(W, `${s}.11`, 'one filing in the store, no duplicate', n.length === 1, L.J(n))
}

const SCN = {
  s1a: (p, W) => s1(p, W, { id: 's1a', to: D[18], move: D[18], moveWord: 'Sat 18 Jul', hid: 'Fri 17 Jul', one: true, keep: D[18], keepShows: true }),
  s1b: (p, W) => s1(p, W, { id: 's1b', to: D[19], move: D[20], moveWord: 'Mon 20 Jul', hid: 'Fri 17, Sat 18, Sun 19 Jul', one: false, keep: D[19], keepShows: false }),
  s3a: (p, W) => s3(p, W, { id: 's3a', peek: false }),
  s3b: (p, W) => s3(p, W, { id: 's3b', peek: true }),
  s4a: (p, W, c) => s4(p, W, c, { id: 's4a', from: D[17], to: D[18], days: 'Fri 17, Sat 18 Jul', one: false }),
  s4b: (p, W, c) => s4(p, W, c, { id: 's4b', from: D[18], to: D[18], days: 'Sat 18 Jul', one: true }),
  s4c: (p, W, c) => s4(p, W, c, { id: 's4c', from: D[17], to: D[18], days: 'Fri 17, Sat 18 Jul', one: false, undoFirst: true }),
  s5a, s5b, s5c,
  s9later: (p, W) => s9(p, W, 'later'), s9earlier: (p, W) => s9(p, W, 'earlier'), s9undo: (p, W) => s9(p, W, 'undo'), s9outcome: (p, W) => s9(p, W, 'outcome'), s9untick: (p, W) => s9(p, W, 'untick'),
  ...Object.fromEntries(['later', 'earlier', 'undo', 'outcome', 'untick'].flatMap(k => ['tap', 'markall'].map(r => [`s10${k}-${r}`, (p, W) => s9(p, W, k, r)]))),
  s11a: (p, W) => s11(p, W, { id: 's11a', from: D[17], to: D[18], days: 'Fri 17, Sat 18 Jul', one: false }),
  s11b: (p, W) => s11(p, W, { id: 's11b', from: D[18], to: D[18], days: 'Sat 18 Jul', one: true }),
  s11c,
  s12a: (p, W) => s12(p, W, { id: 's12a', filed: [] }),
  s12b: (p, W) => s12(p, W, { id: 's12b', filed: [D[17]] }),
  s12c: (p, W) => s12(p, W, { id: 's12c', filed: [D[17], D[19]] }),
  s13a: (p, W) => s13(p, W, { id: 's13a', to: D[18], days: 'Fri 17, Sat 18 Jul', one: false, read: false }),
  s13b: (p, W) => s13(p, W, { id: 's13b', to: D[17], days: 'Fri 17 Jul', one: true, read: true }),
  s13c: (p, W) => s13(p, W, { id: 's13c', to: D[19], days: 'Fri 17, Sat 18, Sun 19 Jul', one: false, read: true }),
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
