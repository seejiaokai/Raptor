// swd-w12 — walker w12: the SANS reminder (S2, S7, S14, S15, S16, S17, S22, S23), each at both sizes. 24 Nov 26, chat 156.
// Run from raptor-port/, one size a process:  SZ=d W12_RUN=run1 [ONLY=s2a,s7] node scripts/handpass/swd-w12.mjs
// EXPECTED: docs/superpowers/briefs/2026-11-24-sans-words-walk-brief.md (its lines win over Astra's).
// Demo days read first (swd-w12-probe): Ranger — Mon 13, Thu 16 (week 1); Mon 20, Thu 23 (week 2, counted only once that
// week is saved); Hex — Mon 13–Thu 16 (week 1), Mon 20, Wed 22 (week 2); Casper — Mon 13, Tue 14 (week 1), Mon 20 (week 2).
import './swd-w12-env.mjs'
import { writeFileSync } from 'node:fs'
import path from 'node:path'
const Z = await import('./swd-w12-lib.mjs')
const { K, X, T, L, RANGER, HEX, CASPER, D, ISO, WK1, WK2, WORDS: Wd, lineIs, remIs, bell, say, sayB, readReminder, need, asR, asS, post, file, move, tick, seen, filings, scene, sleep, plan, planSim, unplan, remDays, remSay } = Z
console.log('VERSION swd-w12 3 · size', process.env.SZ || 'd', '· run', process.env.W12_RUN || 'run1', '· only', process.env.ONLY || 'all')
const SZ = process.env.SZ || 'd'
const chk = (W, id, what, ok, note, pic) => W.rec(id, what, !!ok, note, pic)
const rec = (W, id, what, note, pic) => W.rec(id, what, 'REC', note, pic)
const fitChk = (W, id, b) => chk(W, id, 'the bell: every line inside its panel, words wrapped, none cut off; Mark all read reachable', b.allFit && (b.markAll === 'in view' || b.markAll === 'none'), `all fit ${b.allFit} · Mark all read ${b.markAll}`, b.pic)
const F17 = 'Fri 17 Jul'
const asH = (p, W) => T.as(p, W, 'hex', 'x')
const unreadOthers = b => b.lines.filter(l => l !== b.rem && l.unread)
const sig = b => `lit ${b.lit} :: ` + b.lines.map(l => `${l.id.replace(/[:~].*$/, '')}|${l.unread ? 'U' : 'R'}|${l.title}|${l.body}|${l.struck.join('/')}`).join(' ## ')
const DOW = { 16: 'Thu', 17: 'Fri', 18: 'Sat', 19: 'Sun', 20: 'Mon', 22: 'Wed', 23: 'Thu' }

/* a tap on his reminder: which SANS day it opens (and + Commitment's state there) */
async function tapOpens(p, W, b, d, id, what) {
  if (!b.rem) { chk(W, id, what, false, 'no reminder to tap: ' + sayB(b), b.pic); return }
  const t = await X.bellTap(p, W, b.rem.id, id.replace(/\./g, '-'))
  const re = new RegExp(`${DOW[d]}\\w*\\s*${d}\\b`, 'i')
  chk(W, id, what, t.page === 'inputs' && t.cal && t.win && re.test(t.win.ttl), `page ${t.page} · ${t.month} · window "${t.win && t.win.ttl}" · + Commitment ${t.win && t.win.add}`, t.pic)
  await T.closeAll(p, W)
}
/* a member moves the week shown on View-only Sched (the week strip on a desktop, "Jump to a date" on a phone) */
async function memberWeek(p, W, mondayIso) {
  await T.closeAll(p, W); await L.go(p, 'viewsched')
  const wk = `${mondayIso.slice(8, 10)}/${mondayIso.slice(5, 7)}/${mondayIso.slice(0, 4)}`
  if ((await p.evaluate(() => window.CURWEEK)) === wk) return wk
  const seg = p.locator(`#weekSeg [data-wk="${wk}"]:visible`).first()
  if (await seg.count()) await W.press(p, seg, 'wk-' + mondayIso)
  else {
    await W.press(p, p.locator('.filt-cal:visible, .wk-cal:visible').first(), 'jump-cal')
    await T.tid(p, 'wcal').first().waitFor({ timeout: 6000 })
    await W.press(p, T.tid(p, 'wcal-day-' + mondayIso).first(), 'wcal-day')
  }
  await sleep(1200)
  return p.evaluate(() => window.CURWEEK)
}

/* ---------- S2: different days, the same count ---------- */
async function s2(p, W, o) {
  const s = o.id
  await post(p, W, RANGER, D[17], `${s}.f1`)
  for (const [i, d] of o.plan.entries()) await plan(p, W, d, `${s}.f2${'abc'[i]}`)
  await asR(p, W)
  const r0 = await readReminder(p, W, 'markall', `${s}-f3`)
  need(W, `${s}.f3`, `Ranger reads his reminder for ${o.before} (Mark all read)`, r0.ok && remIs(r0.before.rem, Wd.rem(F17, o.before)), r0.why + ' · was ' + say(r0.before.rem), r0.pic)
  await asS(p, W)
  await unplan(p, W, o.drop, `${s}.01`)
  await asR(p, W)
  let b = await bell(p, W, `${s}-02`)
  chk(W, `${s}.02`, `Sat 18 dropped: the reminder now names ${o.mid}`, remIs(b.rem, Wd.rem(F17, o.mid)), remSay(b), b.pic)
  chk(W, `${s}.03`, 'a day dropping off leaves the reminder READ and the bell not lit', !!b.rem && !b.rem.unread && b.lit === false, remSay(b), b.pic)
  await asS(p, W)
  await plan(p, W, o.add, `${s}.04`)
  await asR(p, W)
  b = await bell(p, W, `${s}-05`)
  chk(W, `${s}.05`, `${o.add} Jul newly planned: the reminder names ${o.after} — the same count as before (${o.before.split(',').length})`, remIs(b.rem, Wd.rem(F17, o.after)) && remDays(b.rem).split(',').length === o.before.split(',').length, remSay(b), b.pic)
  chk(W, `${s}.06`, 'the reminder line ITSELF is unread again', !!b.rem && b.rem.unread, remSay(b), b.pic)
  chk(W, `${s}.07`, 'his bell is lit', b.lit === true, remSay(b), b.pic)
  chk(W, `${s}.08`, 'no other unread line that could be what lights the bell', unreadOthers(b).length === 0, remSay(b), b.pic)
  fitChk(W, `${s}.08f`, b)
  await tapOpens(p, W, b, o.first, `${s}.09`, `a tap on the reminder opens the first day it names, ${o.first} Jul`)
}

/* ---------- S7: two men's bells stay apart ---------- */
async function s7(p, W) {
  const s = 's7'
  await T.closeAll(p, W)
  await L.usersOpen(p, W)
  const acc = await p.evaluate(id => { const r = document.querySelector(`#accList [data-person="${id}"]`); return r ? (r.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160) : 'no row' }, HEX)
  const ap = await W.pic(p, 's7-f0-users')
  rec(W, `${s}.f0`, 'Admin → Users: Hex\'s row (the demo already gives him a member sign-in, "hex"; nothing to add)', acc, ap)
  await post(p, W, RANGER, D[17], `${s}.f1`)
  await post(p, W, HEX, D[18], `${s}.f2`)
  await plan(p, W, 17, `${s}.f3`)
  await plan(p, W, 19, `${s}.f4`, { id: HEX, name: 'W12 HEX' })
  await asR(p, W)
  let b = await bell(p, W, `${s}-f5`)
  need(W, `${s}.f5`, "Ranger's reminder: Fri 17, unread", remIs(b.rem, Wd.rem(F17, 'Fri 17 Jul')) && b.rem.unread, remSay(b), b.pic)
  let hs = await asH(p, W)
  b = await bell(p, W, `${s}-f6`)
  need(W, `${s}.f6`, `Hex signs in (${hs}); his reminder: SANS from Sat 18, Sun 19, unread`, /Hex/.test(hs) && remIs(b.rem, Wd.rem('Sat 18 Jul', 'Sun 19 Jul')) && b.rem.unread, remSay(b), b.pic)
  await asR(p, W)
  const r1 = await readReminder(p, W, 'markall', `${s}-01`)
  chk(W, `${s}.01`, 'Ranger presses Mark all read: his reminder is read', r1.ok, r1.why, r1.pic)
  await asH(p, W)
  b = await bell(p, W, `${s}-02`)
  chk(W, `${s}.02`, "Hex's reminder is still unread, his bell lit — Ranger's reading did not read it", !!b.rem && b.rem.unread && b.lit === true, remSay(b), b.pic)
  chk(W, `${s}.03`, "Hex's bell carries none of Ranger's date, title or days", !b.lines.some(l => /Fri 17/.test(l.title + l.body)), sayB(b), b.pic)
  await asS(p, W)
  await plan(p, W, 18, `${s}.04`, { id: HEX, name: 'W12 HEX2' })
  await asR(p, W)
  b = await bell(p, W, `${s}-05`)
  chk(W, `${s}.05`, "a day added for Hex only: Ranger's reminder unchanged (Fri 17), still read, his bell not lit", remIs(b.rem, Wd.rem(F17, 'Fri 17 Jul')) && !b.rem.unread && b.lit === false, remSay(b), b.pic)
  await asH(p, W)
  b = await bell(p, W, `${s}-06`)
  chk(W, `${s}.06`, "Hex's reminder now names Sat 18, Sun 19, unread", remIs(b.rem, Wd.rem('Sat 18 Jul', 'Sat 18, Sun 19 Jul')) && b.rem.unread, remSay(b), b.pic)
  fitChk(W, `${s}.06f`, b)
  if (b.rem) await X.bellTap(p, W, b.rem.id, 's7-07')
  await T.closeAll(p, W)
  b = await bell(p, W, `${s}-07`)
  chk(W, `${s}.07`, 'Hex taps his reminder: it is read', !!b.rem && !b.rem.unread, remSay(b), b.pic)
  await asS(p, W)
  await plan(p, W, 18, `${s}.08`)
  await asR(p, W)
  b = await bell(p, W, `${s}-09`)
  chk(W, `${s}.09`, "a day added for Ranger only: his reminder names Fri 17, Sat 18, unread, bell lit", remIs(b.rem, Wd.rem(F17, 'Fri 17, Sat 18 Jul')) && b.rem.unread && b.lit === true, remSay(b), b.pic)
  chk(W, `${s}.10`, "Ranger's bell carries none of Hex's title or Sun 19", !b.lines.some(l => /Sun 19|SANS from Sat 18/.test(l.title + l.body)), sayB(b), b.pic)
  await asH(p, W)
  b = await bell(p, W, `${s}-11`)
  chk(W, `${s}.11`, "Hex's reminder unchanged (Sat 18, Sun 19), still read, his bell not lit", remIs(b.rem, Wd.rem('Sat 18 Jul', 'Sat 18, Sun 19 Jul')) && !b.rem.unread && b.lit === false, remSay(b), b.pic)
  chk(W, `${s}.12`, "Hex's bell carries none of Ranger's date or Fri 17", !b.lines.some(l => /Fri 17/.test(l.title + l.body)), sayB(b), b.pic)
}

/* ---------- S14: the reminder goes, then the same day comes back ---------- */
async function s14a(p, W) {
  const s = 's14a'
  await post(p, W, RANGER, D[17], `${s}.f1`)
  await plan(p, W, 18, `${s}.f2`)
  await asR(p, W)
  const r0 = await readReminder(p, W, 'markall', `${s}-f3`)
  need(W, `${s}.f3`, 'Ranger reads his only reminder day, Sat 18', r0.ok && remIs(r0.before.rem, Wd.rem(F17, 'Sat 18 Jul')), r0.why, r0.pic)
  await asS(p, W)
  await unplan(p, W, 18, `${s}.01`)
  await asR(p, W)
  let b = await bell(p, W, `${s}-02`)
  chk(W, `${s}.02`, 'his last engagement on Sat 18 gone: the reminder is gone', !b.rem, sayB(b), b.pic)
  chk(W, `${s}.03`, 'no take-back line: nothing struck, no line left, the bell not lit', b.struck.length === 0 && b.lines.length === 0 && b.lit === false, sayB(b), b.pic)
  await asS(p, W)
  await plan(p, W, 18, `${s}.04`)
  await asR(p, W)
  b = await bell(p, W, `${s}-05`)
  chk(W, `${s}.05`, 'Sat 18 planned again: the reminder comes back, Sat 18, unread, the bell lit', remIs(b.rem, Wd.rem(F17, 'Sat 18 Jul')) && b.rem.unread && b.lit === true, sayB(b), b.pic)
  chk(W, `${s}.06`, 'one reminder, nothing struck', b.lines.filter(l => l.id.startsWith('sansdue')).length === 1 && b.struck.length === 0, sayB(b), b.pic)
  fitChk(W, `${s}.06f`, b)
}
async function s14b(p, W) {
  const s = 's14b'
  await post(p, W, RANGER, D[17], `${s}.f1`)
  await plan(p, W, 18, `${s}.f2`)
  await asR(p, W)
  const r0 = await readReminder(p, W, 'tap', `${s}-f3`)
  need(W, `${s}.f3`, 'Ranger reads his reminder for Sat 18 (a tap on the line)', r0.ok && remIs(r0.before.rem, Wd.rem(F17, 'Sat 18 Jul')), r0.why, r0.pic)
  await asS(p, W)
  await plan(p, W, 18, `${s}.01`, { name: 'W12 TALK', a: '20:00', b: '20:30' })
  await asR(p, W)
  const b = await bell(p, W, `${s}-02`)
  chk(W, `${s}.02`, 'a second engagement on Sat 18: the reminder still names Sat 18 once', remIs(b.rem, Wd.rem(F17, 'Sat 18 Jul')), sayB(b), b.pic)
  chk(W, `${s}.03`, 'it does not relight: still read, the bell not lit', !!b.rem && !b.rem.unread && b.lit === false, sayB(b), b.pic)
}

/* ---------- S15: every SANS man, no posting ahead ---------- */
const NEED4 = 'Thu 16, Sat 18, Mon 20 Jul and 1 more'
async function s15(p, W, o) {
  const s = o.id
  if (o.self) { await asR(p, W); await tick(p, W, true, `${s}.f1`); await asS(p, W) }
  else await tick(p, W, true, `${s}.f1`)
  rec(W, `${s}.f1r`, "Ranger's record after the tick (read)", L.J(await T.rec(p, RANGER)))
  await asR(p, W)
  let b = await bell(p, W, `${s}-01`)
  chk(W, `${s}.01`, 'ticked, only his demo Thu 16 planned so far: "Your SANS availability is needed." / Thu 16', remIs(b.rem, Wd.needed('Thu 16 Jul')), remSay(b), b.pic)
  chk(W, `${s}.01b`, o.self ? 'he ticked himself: no line telling him of his own change' : 'no change line for the tick', b.change.length === 0, sayB(b), b.pic)
  await asS(p, W)
  await plan(p, W, 18, `${s}.02`)
  await plan(p, W, 20, `${s}.03`)
  await asR(p, W)
  b = await bell(p, W, `${s}-04`)
  chk(W, `${s}.04`, `one reminder: "Your SANS availability is needed." / "You're planned on ${NEED4} with nothing filed. Tap to file for availability."`, remIs(b.rem, Wd.needed(NEED4)) && b.lines.filter(l => l.id.startsWith('sansdue')).length === 1, remSay(b), b.pic)
  chk(W, `${s}.05`, 'it is unread, the bell lit', !!b.rem && b.rem.unread && b.lit === true, remSay(b), b.pic)
  fitChk(W, `${s}.05f`, b)
  await tapOpens(p, W, b, 16, `${s}.06`, 'a tap on it opens the first day, Thu 16')
}
/* a SANS man with no planned day: no reminder (Casper, a member, ticked; he has nothing from Wed 15 in the loaded week) */
async function s15n(p, W) {
  const s = 's15n'
  W.rec(`${s}.f0`, "what Casper holds, week of 13 Jul (read)", null, await T.holds(p, CASPER))
  const q = await L.qualsTick(p, W, CASPER, `${s}-f1`)
  need(W, `${s}.f1`, "Quals → Edit → Casper's SANS ticked → Done", q.st && q.st.san === true, L.J(q.st), q.pic)
  let hs = await T.as(p, W, 'outlaw', 'x')
  let b = await bell(p, W, `${s}-01`)
  chk(W, `${s}.01`, `Casper (badge "${hs}" — his callsign is Outlaw), SANS with no planned day: no reminder, the bell not lit`, /Outlaw/.test(hs) &&!b.rem && b.lit === false, sayB(b), b.pic)
  await asS(p, W)
  await plan(p, W, 18, `${s}.02`, { id: CASPER, name: 'W12 CAS' })
  hs = await T.as(p, W, 'outlaw', 'x')
  b = await bell(p, W, `${s}-03`)
  chk(W, `${s}.03`, 'planned on Sat 18: "Your SANS availability is needed." / Sat 18, unread', remIs(b.rem, Wd.needed('Sat 18 Jul')) && b.rem.unread, remSay(b), b.pic)
}
/* a posted man reaches and passes his SANS date */
async function s15c(p, W) {
  const s = 's15c'
  await post(p, W, RANGER, D[17], `${s}.f1`)
  await plan(p, W, 18, `${s}.f2`)
  await plan(p, W, 20, `${s}.f3`)
  await asR(p, W)
  const r0 = await readReminder(p, W, 'markall', `${s}-f4`)
  need(W, `${s}.f4`, 'Ranger reads his reminder: SANS from Fri 17, Sat 18, Mon 20, Thu 23', r0.ok && remIs(r0.before.rem, Wd.rem(F17, 'Sat 18, Mon 20, Thu 23 Jul')), r0.why, r0.pic)
  for (const [when, k, days] of [['2026-07-17T09:00:00', 'a', 'Sat 18, Mon 20, Thu 23 Jul'], ['2026-07-18T09:00:00', 'b', null]]) {
    const t = await T.moveClock(p, W, when, 'us', 'us')
    W.rec(`${s}.0${k}0`, `the clock moved to ${when} (setSystemTime) and the page reloaded; the app's today`, null, t + ' · week ' + await p.evaluate(() => window.CURWEEK))
    const b = await bell(p, W, `${s}-0${k}1`)
    chk(W, `${s}.0${k}1`, `his date has arrived (${t.slice(0, 10)}): the title is "Your SANS availability is needed."`, !!b.rem && b.rem.title === 'Your SANS availability is needed.' && !b.rem.struck.length, remSay(b), b.pic)
    if (days) chk(W, `${s}.0${k}2`, `the same body: ${days}`, remIs(b.rem, Wd.needed(days)), remSay(b), b.pic)
    else rec(W, `${s}.0${k}2`, 'the body once Sat 18 is today (which days it names)', remSay(b), b.pic)
    chk(W, `${s}.0${k}3`, 'the date arriving alone does not light the bell: the reminder still read, the bell not lit', !!b.rem && !b.rem.unread && b.lit === false, remSay(b), b.pic)
    fitChk(W, `${s}.0${k}4`, b)
  }
}

/* ---------- S16: filing shrinks the reminder, no take-back ---------- */
async function s16(p, W, o) {
  const s = o.id
  await post(p, W, RANGER, D[17], `${s}.f1`)
  await plan(p, W, 18, `${s}.f2`)
  await plan(p, W, 20, `${s}.f3`)
  await asR(p, W)
  let b = await bell(p, W, `${s}-f4`)
  need(W, `${s}.f4`, 'his reminder: Sat 18, Mon 20, Thu 23', remIs(b.rem, Wd.rem(F17, 'Sat 18, Mon 20, Thu 23 Jul')), remSay(b), b.pic)
  await tapOpens(p, W, b, 18, `${s}.01`, 'a tap on it opens the first day, Sat 18')
  const steps = [[18, 'Mon 20, Thu 23 Jul', 20], [20, 'Thu 23 Jul', 23], [23, null, null]]
  for (const [i, [d, left, next]] of steps.entries()) {
    const n = 2 + i * 4
    if (o.saber) await asS(p, W)
    const f = await T.file(p, W, ISO[d], o.saber ? RANGER : null, o.kinds(d), o.span(d), `${s}-${n}`)
    chk(W, `${s}.${n}`, `${o.saber ? 'Saber files for Ranger' : 'Ranger files'} ${o.what(d)} on ${d} Jul by + Commitment → Add`, !!f.iid, f.iid ? L.J(f.made) : f.refused, f.pic)
    await T.closeAll(p, W)
    if (o.saber) await asR(p, W)
    b = await bell(p, W, `${s}-${n + 1}`)
    if (left) {
      chk(W, `${s}.${n + 1}`, `${d} Jul leaves the reminder: it names ${left}`, remIs(b.rem, Wd.rem(F17, left)), remSay(b), b.pic)
      chk(W, `${s}.${n + 2}`, 'no take-back line, nothing struck', b.struck.length === 0 && b.change.length === 0, sayB(b), b.pic)
      rec(W, `${s}.${n + 2}r`, 'the reminder read or unread after a filing', say(b.rem), b.pic)
      await tapOpens(p, W, b, next, `${s}.${n + 3}`, `a tap opens the first day left, ${next} Jul`)
    } else {
      chk(W, `${s}.${n + 1}`, 'the last day filed: the reminder is gone', !b.rem, sayB(b), b.pic)
      /* Saber filing for him sends him the ordinary "You were added · Saber" lines (one a filing): those are not about the
         reminder, so the judge is no reminder line, nothing struck, no change line, and no line left but those */
      const others = b.lines.filter(l => !/You were added/.test(l.body))
      chk(W, `${s}.${n + 2}`, o.saber ? 'no take-back line: nothing struck, no reminder or change line; only the ordinary "You were added · Saber" lines of his filings remain' : 'no take-back line: nothing struck, no line left, the bell not lit', b.struck.length === 0 && b.change.length === 0 && (o.saber ? others.length === 0 : b.lines.length === 0 && b.lit === false), sayB(b), b.pic)
    }
  }
}
/* a filing deleted after he read the reminder (RECORD: the host expects it does NOT relight) */
async function s16d(p, W) {
  const s = 's16d'
  await post(p, W, RANGER, D[17], `${s}.f1`)
  await plan(p, W, 18, `${s}.f2`)
  await plan(p, W, 20, `${s}.f3`)
  await asR(p, W)
  const f = await file(p, W, D[18], D[18], `${s}.f4`)
  const r0 = await readReminder(p, W, 'markall', `${s}-f5`)
  need(W, `${s}.f5`, 'Ranger reads his reminder: Mon 20, Thu 23 (Sat 18 filed)', r0.ok && remIs(r0.before.rem, Wd.rem(F17, 'Mon 20, Thu 23 Jul')), r0.why, r0.pic)
  const u = await T.W5.uncommit(p, W, D[18], f.iid, `${s}-01`)
  need(W, `${s}.01`, 'Ranger opens his Sat 18 filing and presses Delete', u.ok, '', u.pic)
  await T.closeAll(p, W)
  const b = await bell(p, W, `${s}-02`)
  chk(W, `${s}.02`, 'the reminder names Sat 18 again: Sat 18, Mon 20, Thu 23', remIs(b.rem, Wd.rem(F17, 'Sat 18, Mon 20, Thu 23 Jul')), remSay(b), b.pic)
  const asExp = !!b.rem && !b.rem.unread && b.lit === false
  rec(W, `${s}.03`, `deleting a filing after he read: does the reminder relight? (host's EXPECTED: no) — ${asExp ? 'matches: stays read, bell not lit' : 'DIFFERS from the host\'s expectation'}`, remSay(b), b.pic)
  chk(W, `${s}.04`, 'nothing struck', b.struck.length === 0, sayB(b), b.pic)
}

/* ---------- S17: other saved weeks, the order, duplicate engagements ---------- */
async function s17(p, W, o) {
  const s = o.id
  await post(p, W, RANGER, D[17], `${s}.f1`)
  const sat = async () => { await plan(p, W, 18, `${s}.f2a`); await plan(p, W, 18, `${s}.f2b`, { name: 'W12 TALK', a: '20:00', b: '20:30' }) }
  const nxt = async () => { await plan(p, W, 20, `${s}.f3a`); await planSim(p, W, 23, 'oft', `${s}.f3b`) }
  if (o.nextFirst) { await nxt(); await sat() } else { await sat(); await nxt() }
  W.rec(`${s}.f4`, "what Ranger holds, week of 13 Jul (read)", null, await T.holds(p, RANGER))
  await asR(p, W)
  let b = await bell(p, W, `${s}-01`)
  chk(W, `${s}.01`, 'three distinct dates in date order, the saved week included: "Sat 18, Mon 20, Thu 23 Jul"', remIs(b.rem, Wd.rem(F17, 'Sat 18, Mon 20, Thu 23 Jul')), remSay(b), b.pic)
  chk(W, `${s}.02`, 'one reminder line, unread', b.lines.filter(l => l.id.startsWith('sansdue')).length === 1 && !!b.rem && b.rem.unread, sayB(b), b.pic)
  fitChk(W, `${s}.02f`, b)
  await tapOpens(p, W, b, 18, `${s}.03`, 'a tap opens the first date, Sat 18')
  b = await bell(p, W, `${s}-04`)
  chk(W, `${s}.04`, 'after the tap the reminder is read', !!b.rem && !b.rem.unread, remSay(b), b.pic)
  await T.closeAll(p, W)
  const w2 = await memberWeek(p, W, WK2)
  b = await bell(p, W, `${s}-05`)
  chk(W, `${s}.05`, `Ranger moves View-only Sched to the week of 20 Jul (${w2}): the reminder does not relight`, /20\/07/.test(w2) && remIs(b.rem, Wd.rem(F17, 'Sat 18, Mon 20, Thu 23 Jul')) && !b.rem.unread && b.lit === false, remSay(b), b.pic)
  await T.closeAll(p, W)
  const w1 = await memberWeek(p, W, WK1)
  b = await bell(p, W, `${s}-06`)
  chk(W, `${s}.06`, `back to the week of 13 Jul (${w1}): still read, the same three dates`, /13\/07/.test(w1) && remIs(b.rem, Wd.rem(F17, 'Sat 18, Mon 20, Thu 23 Jul')) && !b.rem.unread && b.lit === false, remSay(b), b.pic)
}

/* ---------- S22: reload and sign-out keep the right state ---------- */
/* at each transition: look now, reload, sign out → Saber's bell → sign out → Ranger again; every look the same */
async function cycle(p, W, t, judge) {
  await asR(p, W)
  const b1 = await bell(p, W, `${t}-now`)
  judge(`${t}.a`, 'looked at once', b1)
  await T.closeAll(p, W)
  await T.reload(p, 'us', 'us')
  const b2 = await bell(p, W, `${t}-reload`)
  chk(W, `${t}.b`, 'after a reload: the same lines, the same read marks, the same bell', sig(b2) === sig(b1), sig(b2), b2.pic)
  await asS(p, W)
  const bs = await bell(p, W, `${t}-saber`)
  chk(W, `${t}.c`, "Saber signs in: his bell has none of Ranger's SANS lines", bs.opened && bs.change.length === 0 && !bs.rem, sayB(bs).slice(0, 400), bs.pic)
  await asR(p, W)
  const b3 = await bell(p, W, `${t}-again`)
  chk(W, `${t}.d`, "signed out and in again as Ranger: the same lines and read marks (Saber's sign-in read nothing of his)", sig(b3) === sig(b1), sig(b3), b3.pic)
  await T.closeAll(p, W)
  return b3
}
async function s22a(p, W) {
  const s = 's22a'
  await post(p, W, RANGER, D[17], `${s}.f1`)
  await plan(p, W, 20, `${s}.f2`)
  await asR(p, W)
  await file(p, W, D[17], D[18], `${s}.f3`)
  const r0 = await readReminder(p, W, 'markall', `${s}-f4`)
  need(W, `${s}.f4`, 'Ranger reads his reminder for Mon 20, Thu 23', r0.ok && remIs(r0.before.rem, Wd.rem(F17, 'Mon 20, Thu 23 Jul')), r0.why, r0.pic)
  await asS(p, W)
  await move(p, W, D[17], D[18], `${s}.01`)
  const A = Wd.A('Sat 18 Jul', 'Fri 17 Jul', true)
  let b = await cycle(p, W, `${s}.02`, (id, how, b) => chk(W, id, `moved to Sat 18 (${how}): one change line, A's words, unread; the reminder under Sat 18, read`, b.change.length === 1 && lineIs(b.change[0], A) && b.change[0].unread && remIs(b.rem, Wd.rem('Sat 18 Jul', 'Mon 20, Thu 23 Jul')) && !b.rem.unread, sayB(b), b.pic))
  let v = await seen(p, W, D[17], `${s}-03`)
  chk(W, `${s}.03`, 'after the cycle Fri 17 is still hidden', !v.has, v.words, v.pic)
  await T.closeAll(p, W)
  b = await bell(p, W, `${s}-04`)
  if (b.change[0]) await X.bellTap(p, W, b.change[0].id, 's22a-04')
  await T.closeAll(p, W)
  b = await cycle(p, W, `${s}.05`, (id, how, b) => chk(W, id, `he read A (${how}): A read, no unread line, the bell not lit`, b.change.length === 1 && lineIs(b.change[0], A) && !b.change[0].unread && b.lit === false, sayB(b), b.pic))
  await asS(p, W)
  await move(p, W, D[18], D[17], `${s}.06`)
  b = await cycle(p, W, `${s}.07`, (id, how, b) => {
    chk(W, id, `back on Fri 17 (${how}): no sentence says a day is hidden, nothing struck, the reminder back on Fri 17`, b.hiddenSaid.length === 0 && b.struck.length === 0 && remIs(b.rem, Wd.rem(F17, 'Mon 20, Thu 23 Jul')), sayB(b), b.pic)
    rec(W, id + 'r', 'the change line after the move back', b.change.map(say).join(' || ') || 'no change line', b.pic)
  })
  v = await seen(p, W, D[17], `${s}-08`)
  chk(W, `${s}.08`, 'Fri 17 is back after the cycle', v.has, v.words, v.pic)
  await T.closeAll(p, W)
  /* the sequence again, after the return */
  await asS(p, W)
  await move(p, W, D[17], D[18], `${s}.09`)
  b = await cycle(p, W, `${s}.10`, (id, how, b) => chk(W, id, `moved to Sat 18 again (${how}): ONE change line, A's words, unread — no second copy`, b.change.length === 1 && lineIs(b.change[0], A) && b.change[0].unread, sayB(b), b.pic))
  const n = await filings(p)
  chk(W, `${s}.11`, 'one filing in the store, no duplicate', n.length === 1, L.J(n))
}
async function s22b(p, W) {
  const s = 's22b'
  await tick(p, W, true, `${s}.f1`)
  await plan(p, W, 20, `${s}.f2`)
  await asR(p, W)
  await file(p, W, D[17], D[18], `${s}.f3`)
  const r0 = await readReminder(p, W, 'markall', `${s}-f4`)
  need(W, `${s}.f4`, 'Ranger reads his reminder', r0.ok, r0.why, r0.pic)
  rec(W, `${s}.f4r`, 'the reminder he read', say(r0.before.rem), r0.pic)
  await asS(p, W)
  await tick(p, W, false, `${s}.01`)
  const C = Wd.C('Fri 17, Sat 18 Jul', false)
  let b = await cycle(p, W, `${s}.02`, (id, how, b) => chk(W, id, `the tick taken off (${how}): one line, C's words, unread; no reminder`, b.change.length === 1 && lineIs(b.change[0], C) && b.change[0].unread && !b.rem, sayB(b), b.pic))
  let v = await seen(p, W, D[17], `${s}-03`)
  chk(W, `${s}.03`, 'Fri 17 hidden after the cycle', !v.has, v.words, v.pic)
  await T.closeAll(p, W)
  b = await bell(p, W, `${s}-04`)
  if (b.change[0]) await X.bellTap(p, W, b.change[0].id, 's22b-04')
  await T.closeAll(p, W)
  b = await cycle(p, W, `${s}.05`, (id, how, b) => chk(W, id, `he read C (${how}): read, the bell not lit`, b.change.length === 1 && lineIs(b.change[0], C) && !b.change[0].unread && b.lit === false, sayB(b), b.pic))
  await asS(p, W)
  await tick(p, W, true, `${s}.06`)
  b = await cycle(p, W, `${s}.07`, (id, how, b) => {
    chk(W, id, `ticked again (${how}): no sentence says a day is hidden, nothing struck`, b.hiddenSaid.length === 0 && b.activeSaid.length === 0 && b.struck.length === 0, sayB(b), b.pic)
    rec(W, id + 'r', 'what the bell says once he is SANS again', sayB(b), b.pic)
  })
  v = await seen(p, W, D[17], `${s}-08`)
  chk(W, `${s}.08`, 'Fri 17 back after the cycle', v.has, v.words, v.pic)
  await T.closeAll(p, W)
  await asS(p, W)
  await tick(p, W, false, `${s}.09`)
  b = await cycle(p, W, `${s}.10`, (id, how, b) => chk(W, id, `taken off again (${how}): ONE line, C's words, unread`, b.change.length === 1 && lineIs(b.change[0], C) && b.change[0].unread, sayB(b), b.pic))
  W.rec(`${s}.11`, 'Undo / Redo of the untick inside the reload and sign-out cycle', 'NW', "a sign-out clears Saber's Undo list (D148), so an Undo after the cycle has nothing to take back; Undo/Redo of this untick were walked by w11 (S4) in one sign-in")
}

/* ---------- S23: his own action; other take-backs unchanged ---------- */
async function s23a(p, W) {
  const s = 's23a'
  await tick(p, W, true, `${s}.f1`)
  await asR(p, W)
  await file(p, W, D[17], D[18], `${s}.f2`)
  const r0 = await readReminder(p, W, 'markall', `${s}-f3`)
  need(W, `${s}.f3`, 'Ranger reads his reminder', r0.ok, r0.why, r0.pic)
  await tick(p, W, false, `${s}.01`)
  let b = await bell(p, W, `${s}-02`)
  chk(W, `${s}.02`, 'he unticked himself: no line telling him of his own change, no unread line, the bell not lit', b.change.length === 0 && b.lines.every(l => !l.unread) && b.lit === false, sayB(b), b.pic)
  let v = await seen(p, W, D[17], `${s}-03`)
  chk(W, `${s}.03`, 'his availability changed: Fri 17 hidden', !v.has, v.words, v.pic)
  await T.closeAll(p, W)
  const ub = await p.locator('#undoBtn').first().getAttribute('title').catch(() => '')
  await W.press(p, '#undoBtn:visible', 'undo'); await sleep(800)
  const rr = await T.rec(p, RANGER)
  chk(W, `${s}.04`, 'he presses Undo: the tick is back', rr.san === true, `button "${ub}" · ${L.J(rr)} · "${await L.toastSaid(p)}"`, await W.pic(p, 's23a-04'))
  b = await bell(p, W, `${s}-05`)
  chk(W, `${s}.05`, 'after his Undo: still no line about his own change, nothing struck', b.change.length === 0 && b.struck.length === 0, sayB(b), b.pic)
  v = await seen(p, W, D[17], `${s}-06`)
  chk(W, `${s}.06`, 'Fri 17 is back', v.has, v.words, v.pic)
  await T.closeAll(p, W)
  await asS(p, W)
  b = await bell(p, W, `${s}-07`)
  rec(W, `${s}.07`, "Saber's bell after Ranger's own untick and Undo", sayB(b).slice(0, 500), b.pic)
}
/* an ordinary Meeting input Saber files for Ranger on the Inputs calendar */
async function meeting(p, W, iso, tag) {
  await T.closeAll(p, W)
  await L.go(p, 'inputs')
  if (await p.locator('#inCalMode:visible').count()) await W.press(p, '#inCalMode:visible', 'cal-mode')
  await p.waitForSelector('#inpCal', { timeout: 8000 })
  const day = p.locator(`#inpCal [data-icday="${iso}"]`).first()
  await day.scrollIntoViewIfNeeded()
  if (W.isPhone) await day.tap({ position: { x: 8, y: 8 } }); else await day.click({ position: { x: 8, y: 8 } })
  await sleep(500)
  await W.press(p, '#icPopAdd:visible', 'ic-add')
  await p.waitForSelector('#inpEditPop', { timeout: 6000 }); await sleep(300)
  await p.selectOption('#inpEditType', 'Meeting'); await sleep(200)
  await p.selectOption('#inpEditPerson', RANGER); await sleep(200)
  const ad = p.locator('#inpEditAllday'); if (await ad.count() && await ad.isChecked()) await ad.uncheck()
  if (await p.locator('#inpEditStart').count()) { await p.fill('#inpEditStart', '10:00'); await p.fill('#inpEditEnd', '11:00') }
  await p.fill('#inpEditRmk', 'W12 MEETING').catch(() => {})
  const before = await p.evaluate(() => (window.INPUTS || []).map(r => r.iid))
  const pic0 = await W.pic(p, tag + '-form')
  await W.press(p, '#inpEditSave:visible', 'save'); await sleep(900)
  const nd = p.getByRole('button', { name: 'No document' }); if (await nd.count()) { await nd.first().click().catch(() => {}); await sleep(400) }
  const iid = (await p.evaluate(() => (window.INPUTS || []).map(r => r.iid))).filter(x => !before.includes(x))[0] || null
  const pic = await W.pic(p, tag + '-saved')
  await T.closeAll(p, W)
  return { iid, made: iid ? await T.inp(p, iid) : null, pic: pic0 + ', ' + pic, toast: await L.toastSaid(p) }
}
/* Ranger looks from a second tab of the same browser (reloaded before each look, so it reads what Saber's tab saved) */
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
async function s23b(p, W, ctx, o) {
  const s = o.id
  const m = await meeting(p, W, D[17], `${s}-f1`)
  need(W, `${s}.f1`, 'Saber files an ordinary Meeting for Ranger on Fri 17, 10:00–11:00 (Inputs calendar → + Input)', !!m.iid, L.J(m.made) + ' · "' + m.toast + '"', m.pic)
  const p2 = await ranger2(ctx, W)
  let b = await look2(p2, W, `${s}-01`)
  const mine = b.lines.filter(l => !/^sansdue/.test(l.id) && /W12 MEETING|Meeting|MTG/i.test(l.all + l.body + l.title))
  rec(W, `${s}.01`, "Ranger's bell (second tab): the Meeting's line as it reads", sayB(b), b.pic)
  if (o.read) {
    if (mine[0]) await X.bellTap(p2, W, mine[0].id, `${s}-02`)
    else await W.press(p2, '[data-testid="bell-markall"]:visible', 'markall')
    await T.closeAll(p2, W)
    b = await bell(p2, W, `${s}-02`)
    rec(W, `${s}.02`, 'Ranger reads it (second tab)', sayB(b), b.pic)
  }
  await T.closeAll(p2, W)
  await p.bringToFront()
  const ub = await p.locator('#undoBtn').first().getAttribute('title').catch(() => '')
  await W.press(p, '#undoBtn:visible', 'undo'); await sleep(800)
  const gone = await p.evaluate(i => !(window.INPUTS || []).some(r => r.iid === i), m.iid)
  need(W, `${s}.03`, `Saber presses Undo ("${ub}"): the Meeting is gone`, gone, '"' + await L.toastSaid(p) + '"', await W.pic(p, `${s}-03`))
  b = await look2(p2, W, `${s}-04`)
  if (o.read) W.rec(`${s}.04`, 'the READ Meeting line keeps its struck "taken back" after Saber\'s Undo', 'NW', `cannot be played through the app's controls in one browser: Saber's Undo list clears at a sign-out (D148), and across two tabs his tab does not know what the other tab read (walk-scripts §3). Two-tab reading, not a finding: ${sayB(b)}`, b.pic)
  else rec(W, `${s}.04`, "the UNREAD Meeting line after Saber's Undo (the treatment as it stands)", sayB(b), b.pic)
  await p2.close()
}

const SCN = {
  s2a: (p, W) => s2(p, W, { id: 's2a', plan: [18, 19], before: 'Sat 18, Sun 19 Jul', drop: 18, mid: 'Sun 19 Jul', add: 17, after: 'Fri 17, Sun 19 Jul', first: 17 }),
  s2b: (p, W) => s2(p, W, { id: 's2b', plan: [18, 20], before: 'Sat 18, Mon 20, Thu 23 Jul', drop: 18, mid: 'Mon 20, Thu 23 Jul', add: 22, after: 'Mon 20, Wed 22, Thu 23 Jul', first: 20 }),
  s7,
  s14a, s14b,
  s15a: (p, W) => s15(p, W, { id: 's15a', self: false }),
  s15b: (p, W) => s15(p, W, { id: 's15b', self: true }),
  s15n, s15c,
  s16a: (p, W) => s16(p, W, { id: 's16a', saber: false, kinds: () => ['fly'], span: () => null, what: () => 'Fly, all day' }),
  s16b: (p, W) => s16(p, W, { id: 's16b', saber: true, kinds: () => ['fly'], span: () => null, what: () => 'Fly, all day' }),
  s16c: (p, W) => s16(p, W, { id: 's16c', saber: false, kinds: d => d === 18 ? ['oft'] : d === 20 ? ['amt'] : ['fly'], span: d => d === 23 ? ['06:00', '07:00'] : null, what: d => d === 18 ? 'OFT only, all day' : d === 20 ? 'AMT only, all day' : 'Fly 06:00–07:00 (clear of the day\'s work)' }),
  s16d,
  s17a: (p, W) => s17(p, W, { id: 's17a', nextFirst: false }),
  s17b: (p, W) => s17(p, W, { id: 's17b', nextFirst: true }),
  s22a, s22b,
  s23a,
  s23b: (p, W, c) => s23b(p, W, c, { id: 's23b', read: true }),
  s23c: (p, W, c) => s23b(p, W, c, { id: 's23c', read: false }),
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
