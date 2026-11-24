// swd-w13 — walker w13: the SANS calendar's doors (S6, S8, S18, S19, S20, S21), the crew list (S24) and the plain-user round,
// each at both sizes. 24 Nov 26, chat 156.
// Run from raptor-port/, one size a process:  SZ=d W13_RUN=run1 [ONLY=s6a,s8a] node scripts/handpass/swd-w13.mjs
// SZ=p runs each scenario on the phone: WebKit 402×874 (taps), or — for a held finger drag only — Chromium 402×874 with real
// fingers over CDP ('phone-chromium'; WebKit's in-page touches drive no pointer events, walk-scripts §4).
// EXPECTED: docs/superpowers/briefs/2026-11-24-sans-words-walk-brief.md (its lines win over Astra's).
// Demo days (w12's probe): Ranger — Mon 13, Thu 16 (week 1); Hex — Mon 13–Thu 16. Demo SANS filings: none on Fri 17–Sun 19.
import './swd-w13-env.mjs'
import { writeFileSync } from 'node:fs'
import path from 'node:path'
const M = await import('./swd-w13-lib.mjs')
const { K, X, T, L, RANGER, HEX, ISO, need, asR, asS, post, tick, seen, scene, sleep, plan } = M
console.log('VERSION swd-w13 2 · size', process.env.SZ || 'd', '· run', process.env.W13_RUN || 'run1', '· only', process.env.ONLY || 'all')
const SZ = process.env.SZ || 'd'
const J = JSON.stringify
const chk = (W, id, what, ok, note, pic) => W.rec(id, what, !!ok, note, pic)
const rec = (W, id, what, note, pic) => W.rec(id, what, 'REC', note, pic)
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const md = iso => `${MON[+iso.slice(5, 7) - 1]} ${+iso.slice(8)}`
const srt = x => String(x).split('+').sort().join('+')
const recIs = (m, who, from, to) => !!m && srt(m.who) === srt(who) && m.date === md(from) && (to && to !== from ? m.end === md(to) : !m.end || m.end === md(from))
const SELF = "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul."
const ADM = 'Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because Ranger is SANS from Fri 17 Jul.'
const SHARED = d => `Hex is SANS from ${d}. Take him out of this offer to add earlier days.`
const ONE = d => `Hex is SANS from ${d}: file SANS availability for days from then`
const mine = async p => (await M.sansRecs(p)).filter(r => r.who.split('+').includes(RANGER))

/* one scenario at one size, a fresh context (a fresh store), the clock installed before load; Saber signed in.
   (sah-w10-lib's run, with the finger-drag phone added) */
async function run(name, szKey, fn, when = '2026-07-15T09:00:00') {
  const sz = szKey === 'pc' ? X.PC : L.SIZES[szKey], W = L.mk(name, sz)
  if (szKey === 'pc') { W.isPhone = true; W.touchCdp = true }
  const { b, ctx, p } = await L.world(sz, W, when)
  try {
    await L.signIn(p, 'ad', 'a')
    W.rec('today', "the app's today (page clock), Saber signed in", null, await L.today(p))
    await fn(p, W, ctx)
  } catch (e) {
    W.rec('ERR', 'script stopped', false, String(e && e.message || e).slice(0, 500), await W.pic(p, 'ERR').catch(() => ''))
  }
  W.rec('errors', 'console / page errors / failed requests', W.errs.length === 0, W.errs.slice(0, 10).join(' || '))
  await b.close()
  writeFileSync(path.join(M.OUT, `results-${name}-${sz.name}.json`), JSON.stringify(L.results.filter(r => r.scn === name && r.size === sz.name), null, 1))
}

/* ---------- the doors: a run of days picked and the input window opened ---------- */
/* door: 'drag' (mouse on a desktop, a held finger on the phone), 'drag-rev', 'keys-enter', 'keys-space', 'cal' (the window's
   own Dates calendar from a valid day's + Commitment). saber: Saber files, Ranger picked in the Person box. */
async function openDoor(p, W, s, o) {
  const a = o.a, b = o.b
  let r, how
  if (o.door === 'drag') { r = await M.drag(p, W, a, b); how = `${W.touchCdp ? 'a held finger' : 'a mouse'} dragged ${md(a)} → ${md(b)}` }
  else if (o.door === 'drag-rev') { r = await M.drag(p, W, b, a); how = `${W.touchCdp ? 'a held finger' : 'a mouse'} dragged ${md(b)} → ${md(a)} (reverse)` }
  else if (o.door === 'keys-enter' || o.door === 'keys-space') {
    const n = Math.round((Date.parse(b) - Date.parse(a)) / 864e5)
    r = await M.keys(p, W, a, n, o.door === 'keys-enter' ? 'Enter' : ' ')
    how = `focus ${md(a)}, Shift+→ ×${n}, ${o.door === 'keys-enter' ? 'Enter' : 'Space'} (picked ${r.picked.join(',')})`
  } else {
    const c = await M.commitOpen(p, W, o.start, s + '-open')
    if (!c.ok) return { opened: false, how: `+ Commitment on ${md(o.start)}: ${c.why}`, pic: c.pic }
    if (o.saber) await X.setWho(p, W, o.who || RANGER)
    for (const d of o.taps || [a, b]) await X.tapWinDate(p, W, d)
    r = { opened: true }
    how = `+ Commitment on ${md(o.start)}${o.saber ? ', Person → ' + (o.whoName || 'Ranger') : ''}, the window's Dates calendar: ${(o.taps || [a, b]).map(md).join(' then ')}`
  }
  if (r.opened && o.saber && o.door !== 'cal') { const w = await X.setWho(p, W, o.who || RANGER); how += ` · Person: ${w}` }
  const form = await X.inpRead(p)
  const dates = await M.winDates(p)
  const pic = await W.pic(p, s + '-form')
  return { opened: !!r.opened, how, form, dates, pic, picked: r.picked }
}
/* the standard cut: Saber posts Ranger SANS from `po` (default Fri 17); Ranger (or Saber for him) picks a..b and presses Add */
async function cut(p, W, o) {
  const s = o.id
  await post(p, W, RANGER, o.po || ISO[17], `${s}.f1`)
  if (!o.saber) await asR(p, W)
  const d = await openDoor(p, W, s, o)
  need(W, `${s}.f2`, `the door: ${d.how}`, d.opened, `window: ${M.winDatesSay(d.dates)} · person ${d.form && d.form.person} · ticks ${d.form && d.form.ticks}`, d.pic)
  if (o.mod) await o.mod(p, W, s)
  const before = await mine(p)
  const a = await M.add(p, W, s + '-01')
  const after = await mine(p)
  const made = a.made.filter(m => m.who.split('+').includes(RANGER))
  chk(W, `${s}.01`, `Add: ONE filing, Ranger, ${md(o.from)}${o.to !== o.from ? ' – ' + md(o.to) : ''} only${o.kinds ? ', ' + o.kinds : ''}`, made.length === 1 && a.made.length === 1 && recIs(made[0], RANGER, o.from, o.to) && (!o.kinds || [...made[0].sans].sort().join('') === [...o.kinds].sort().join('')) && (!o.hours || (made[0].allday === false)), `made ${M.sayRecs(a.made)} · Ranger's filings before ${before.length}, after ${after.length}`, a.pic)
  if (o.words) chk(W, `${s}.02`, `the note's exact words: "${o.words}"`, a.said === o.words && a.shown, `"${a.said}" (shown ${a.shown})`, a.pic)
  else rec(W, `${s}.02`, 'the note, as it reads (RECORD)', `"${a.said}" (shown ${a.shown})`, a.pic)
  chk(W, `${s}.03`, 'the window closed after Add', !a.stayed, `stayed ${a.stayed}`, a.pic)
  for (const e of o.early || []) {
    const v = await seen(p, W, e, `${s}-04-${e.slice(8)}`)
    chk(W, `${s}.04.${e.slice(5)}`, `the SANS month: ${md(e)} (left out) does not list Ranger`, !v.has, v.words, v.pic)
  }
  const v = await seen(p, W, o.from, `${s}-05`)
  chk(W, `${s}.05`, `the SANS month: ${md(o.from)} lists Ranger`, v.has, v.words, v.pic)
  await T.closeAll(p, W)
  return { a, made: made[0] }
}
const door = (id, doorName, extra = {}) => (p, W) => cut(p, W, { id, door: doorName, a: ISO[16], b: ISO[18], start: ISO[17], from: ISO[17], to: ISO[18], early: [ISO[16]], ...extra })

/* ---------- S8: the shared offer ---------- */
async function s8a(p, W) {
  const s = 's8a'
  await post(p, W, RANGER, ISO[17], `${s}.f1`)
  await post(p, W, HEX, ISO[17], `${s}.f2`)
  const f = await T.file(p, W, ISO[18], [RANGER, HEX], ['fly'], null, `${s}-f3`)
  need(W, `${s}.f3`, 'Saber files ONE shared Sat 18 offer for Ranger and Hex (+ Commitment, Several, both pucks)', !!f.iid, f.iid ? J(f.made) : f.refused, f.pic)
  await T.closeAll(p, W); await M.warReady(p)
  const m = await T.movePo(p, W, HEX, ISO[17], ISO[24], `${s}-f4`)
  need(W, `${s}.f4`, "Saber moves Hex's PO from to Fri 24 on the posting sheet", m.ok && /On 24 Jul/.test(m.line || ''), `"${m.before}" → "${m.line}" ${m.err || ''}`, m.pic)
  await M.onSans(p, W)
  const o = await X.openLine(p, W, ISO[18], f.iid, `${s}-f5`)
  need(W, `${s}.f5`, 'the shared offer opened from Sat 18 (its line)', o.ok, o.ok ? `people ${o.r.picked.join('+') || o.r.person} · several ${o.r.several}` : o.why, o.pic)
  /* (the window's calendar starts a new pick on a tap once a run is whole: Sat 18 then Sun 19 is the extension) */
  await X.tapWinDate(p, W, ISO[18]); await X.tapWinDate(p, W, ISO[19])
  const d1 = await M.winDates(p)
  const pic1 = await W.pic(p, `${s}-01-form`)
  need(W, `${s}.00`, "the window's Dates calendar: Sat 18 then Sun 19 tapped — the offer's dates read Sat 18 – Sun 19", /Jul 18 → Jul 19/.test(d1.read), M.winDatesSay(d1), pic1)
  let a = await M.add(p, W, `${s}-01`)
  const r1 = (await M.sansRecs(p)).find(r => r.iid === f.iid)
  chk(W, `${s}.01`, `Save through Sun 19: refused with "${SHARED('Fri 24 Jul')}"`, a.said === SHARED('Fri 24 Jul'), `"${a.said}" · window stayed ${a.stayed}`, a.pic)
  chk(W, `${s}.02`, 'nothing partly extends: the offer still Sat 18 alone, both men, nothing new made', recIs(r1, `${RANGER}+${HEX}`, ISO[18]) && a.made.length === 0, `offer ${M.sayRecs(r1 ? [r1] : [])} · made ${M.sayRecs(a.made)}`, a.pic)
  if (!a.stayed) { const o2 = await X.openLine(p, W, ISO[18], f.iid, `${s}-02b`); await X.tapWinDate(p, W, ISO[18]); await X.tapWinDate(p, W, ISO[19]); rec(W, `${s}.02b`, 'the window had closed; opened again and Sun 19 tapped', `${o2.ok} ${M.winDatesSay(await M.winDates(p))}`, o2.pic) }
  const w = await X.setWho(p, W, [RANGER])
  const rd = await X.inpRead(p)
  const pic3 = await W.pic(p, `${s}-03-form`)
  chk(W, `${s}.03`, 'Hex taken out under People (his puck pressed off): Ranger alone picked', rd && rd.picked.length === 1 && rd.picked[0] === RANGER, `${w} · picked ${rd && rd.picked.join('+')} · ${M.winDatesSay(await M.winDates(p))}`, pic3)
  a = await M.add(p, W, `${s}-04`)
  const all = await M.sansRecs(p)
  const r2 = all.find(r => r.iid === f.iid)
  rec(W, `${s}.04n`, 'the note after the save (RECORD)', `"${a.said}"`, a.pic)
  chk(W, `${s}.04`, "Save again: Ranger's offer now Sat 18 – Sun 19", recIs(r2, RANGER, ISO[18], ISO[19]) && !a.stayed, `offer ${M.sayRecs(r2 ? [r2] : [])} · window stayed ${a.stayed} · made ${M.sayRecs(a.made)}`, a.pic)
  const hexNew = all.filter(r => r.who.split('+').includes(HEX) && (r.date === 'Jul 19' || r.end === 'Jul 19'))
  chk(W, `${s}.05`, 'Hex receives no new days (no record of his holds Sun 19)', hexNew.length === 0, `Hex's records: ${M.sayRecs(all.filter(r => r.who.split('+').includes(HEX)))}`, a.pic)
  let v = await seen(p, W, ISO[19], `${s}-06`, 'Ranger')
  const v2 = await seen(p, W, ISO[19], `${s}-06b`, 'Hex')
  chk(W, `${s}.06`, 'the SANS month: Sun 19 lists Ranger, not Hex', v.has && !v2.has, v.words, v.pic)
}
/* the one-man case keeps today's refusal: Hex SANS from Fri 24; Saber, from Fri 24's + Commitment, Hex picked, Dates Sat 18 – Sun 19 */
async function s8b(p, W) {
  const s = 's8b'
  await post(p, W, HEX, ISO[24], `${s}.f1`)
  const d = await openDoor(p, W, s, { door: 'cal', start: ISO[24], saber: true, who: HEX, whoName: 'Hex', taps: [ISO[18], ISO[19]] })
  need(W, `${s}.f2`, `the door: ${d.how}`, d.opened && /Hex/.test(d.form.person), `window: ${M.winDatesSay(d.dates)} · person ${d.form && d.form.person}`, d.pic)
  const a = await M.add(p, W, `${s}-01`)
  chk(W, `${s}.01`, `a one-man filing keeps today's words: "${ONE('Fri 24 Jul')}" — no "Take him out"`, a.said === ONE('Fri 24 Jul'), `"${a.said}" · stayed ${a.stayed}`, a.pic)
  chk(W, `${s}.02`, 'nothing saved', a.made.length === 0, `made ${M.sayRecs(a.made)}`, a.pic)
  await X.closeInp(p, W)
  /* Astra's own shape — a one-man Hex offer whose day his later date hides — tried for a door */
  await post(p, W, RANGER, ISO[17], `${s}.f3`)
  const f = await T.file(p, W, ISO[24], HEX, ['fly'], null, `${s}-f4`)
  need(W, `${s}.f4`, 'Saber files a one-man Fri 24 offer for Hex', !!f.iid, f.iid ? J(f.made) : f.refused, f.pic)
  await T.closeAll(p, W); await M.warReady(p)
  const m = await T.movePo(p, W, HEX, ISO[24], '2026-07-25', `${s}-f5`)
  need(W, `${s}.f5`, "Saber moves Hex's PO from to Sat 25", m.ok && /On 25 Jul/.test(m.line || ''), `"${m.before}" → "${m.line}"`, m.pic)
  await M.onSans(p, W)
  const o = await X.openLine(p, W, ISO[24], f.iid, `${s}-03`)
  if (!o.ok) { W.rec(`${s}.03`, "extend a one-man offer whose day his later date hides", 'NW', `its line is hidden on Fri 24 (D2341: hidden everywhere, as if deleted), so no door opens it: ${o.why} · day list "${o.list}"`, o.pic); return }
  await X.tapWinDate(p, W, ISO[24]); await X.tapWinDate(p, W, '2026-07-26')
  const a2 = await M.add(p, W, `${s}-04`)
  chk(W, `${s}.04`, `extending it refused with today's one-man words "${ONE('Sat 25 Jul')}"`, a2.said === ONE('Sat 25 Jul'), `"${a2.said}"`, a2.pic)
}
/* a NEW shared offer whose first picked day is before one man's date: refused whole with the shared words, never trimmed */
async function s8c(p, W) {
  const s = 's8c'
  await post(p, W, RANGER, ISO[17], `${s}.f1`)
  await post(p, W, HEX, ISO[18], `${s}.f2`)
  const c = await M.commitOpen(p, W, ISO[18], `${s}-f3`)
  need(W, `${s}.f3`, '+ Commitment on Sat 18 (both men SANS that day)', c.ok, c.why || '', c.pic)
  const w = await X.setWho(p, W, [RANGER, HEX])
  await X.tapWinDate(p, W, ISO[17]); await X.tapWinDate(p, W, ISO[19])
  const rd = await X.inpRead(p), dd = await M.winDates(p)
  const pic = await W.pic(p, `${s}-f4-form`)
  need(W, `${s}.f4`, 'Several: Ranger and Hex picked; Dates Fri 17 then Sun 19', rd.picked.length === 2 && /Jul 17 → Jul 19/.test(dd.read), `${w} · picked ${rd.picked.join('+')} · ${M.winDatesSay(dd)}`, pic)
  const a = await M.add(p, W, `${s}-01`)
  chk(W, `${s}.01`, `Add: refused whole with "${SHARED('Sat 18 Jul')}"`, a.said === SHARED('Sat 18 Jul'), `"${a.said}" · stayed ${a.stayed}`, a.pic)
  chk(W, `${s}.02`, 'never trimmed: nothing saved, no "Saved" note', a.made.length === 0 && !/^Saved/.test(a.said), `made ${M.sayRecs(a.made)}`, a.pic)
}

/* ---------- S18: the greyed + Commitment ---------- */
async function addState(p, W, iso, tag) {
  const pg = await M.sday(p, W, iso)
  const pic = await W.pic(p, tag)
  await X.sansX(p, W)
  return { add: pg.win ? pg.win.add : 'no window', why: pg.win ? pg.win.addwhy : '', pic }
}
const say18 = r => `+ Commitment ${r.add}${r.why ? ' · "' + r.why + '"' : ' · no words'}`
async function s18a(p, W) {
  const s = 's18a'
  await post(p, W, RANGER, ISO[17], `${s}.f1`)
  await asR(p, W)
  for (const [d, n] of [[16, '01'], [15, '02']]) {
    const r = await addState(p, W, ISO[d], `${s}-${n}`)
    chk(W, `${s}.${n}`, `Ranger opens ${md(ISO[d])}: + Commitment greyed, "You're SANS from Fri 17 Jul."`, r.add === 'greyed' && r.why === "You're SANS from Fri 17 Jul.", say18(r), r.pic)
  }
  let r = await addState(p, W, ISO[17], `${s}-03`)
  chk(W, `${s}.03`, 'Ranger opens Fri 17: + Commitment enabled, no hint', r.add === 'enabled' && !r.why, say18(r), r.pic)
  await asS(p, W)
  for (const [d, n] of [[16, '04'], [17, '05']]) {
    r = await addState(p, W, ISO[d], `${s}-${n}`)
    chk(W, `${s}.${n}`, `Saber opens ${md(ISO[d])}: + Commitment enabled, no admin hint`, r.add === 'enabled' && !r.why, say18(r), r.pic)
  }
  const t = await T.moveClock(p, W, '2026-07-18T09:00:00', 'us', 'us')
  rec(W, `${s}.06`, "the clock moved through Fri 17 to Sat 18 09:00, reloaded, Ranger signed in: the app's today", t)
  r = await addState(p, W, ISO[16], `${s}-07`)
  chk(W, `${s}.07`, 'after the date: Thu 16 still not open to him (greyed)', r.add === 'greyed', say18(r), r.pic)
  rec(W, `${s}.07w`, "after the date: Thu 16's words (RECORD)", say18(r), r.pic)
  r = await addState(p, W, ISO[18], `${s}-08`)
  chk(W, `${s}.08`, 'after the date: Sat 18 (today) enabled, no hint', r.add === 'enabled' && !r.why, say18(r), r.pic)
  r = await addState(p, W, ISO[17], `${s}-09`)
  rec(W, `${s}.09`, 'after the date: Fri 17 (yesterday, his first SANS day) (RECORD)', say18(r), r.pic)
  r = await addState(p, W, ISO[19], `${s}-10`)
  chk(W, `${s}.10`, 'after the date: Sun 19 enabled, no hint', r.add === 'enabled' && !r.why, say18(r), r.pic)
}
async function s18b(p, W) {
  const s = 's18b'
  rec(W, `${s}.f1`, "Ranger's record (read): no posting, no tick", J(await T.rec(p, RANGER)))
  await asR(p, W)
  for (const [d, n] of [[16, '01'], [17, '02']]) {
    const r = await addState(p, W, ISO[d], `${s}-${n}`)
    chk(W, `${s}.${n}`, `Ranger, not SANS, opens ${md(ISO[d])}: greyed, "SANS aircrew add their availability here."`, r.add === 'greyed' && r.why === 'SANS aircrew add their availability here.', say18(r), r.pic)
  }
  await asS(p, W)
  for (const [d, n] of [[16, '03'], [17, '04']]) {
    const r = await addState(p, W, ISO[d], `${s}-${n}`)
    chk(W, `${s}.${n}`, `Saber opens ${md(ISO[d])}: enabled, no hint`, r.add === 'enabled' && !r.why, say18(r), r.pic)
  }
}

/* ---------- S19: the cut's boundaries, Cancel and Undo ---------- */
async function s19c(p, W) {
  /* Fri 31 Jul – Sun 2 Aug, SANS from Sat 1 Aug: the keys across the month's end, and the window's calendar */
  return cut(p, W, { id: 's19c', door: 'keys-enter', po: ISO.a1, a: ISO[31], b: ISO.a2, from: ISO.a1, to: ISO.a2, early: [ISO[31]], words: "Saved Sat 1 – Sun 2 Aug. Fri 31 Jul was left out because you're SANS from Sat 1 Aug." })
}
async function s19d(p, W) {
  /* the same through the window: + Commitment on Sat 1 Aug, ‹ to July, Fri 31, › to August, Sun 2 */
  const s = 's19d'
  await post(p, W, RANGER, ISO.a1, `${s}.f1`)
  await asR(p, W)
  const c = await M.commitOpen(p, W, ISO.a1, s)
  need(W, `${s}.f2`, '+ Commitment on Sat 1 Aug', c.ok, c.why || '', c.pic)
  await W.press(p, '#inpEditPop [data-testid="inpEdCal-prev"]', 'cal-prev'); await sleep(400)
  await X.tapWinDate(p, W, ISO[31])
  await W.press(p, '#inpEditPop [data-testid="inpEdCal-next"]', 'cal-next'); await sleep(400)
  await X.tapWinDate(p, W, ISO.a2)
  const dd = await M.winDates(p)
  need(W, `${s}.f3`, "the window's Dates: ‹, Fri 31 Jul, ›, Sun 2 Aug", /Jul 31 → Aug 2/.test(dd.read), M.winDatesSay(dd), await W.pic(p, s + '-form'))
  const a = await M.add(p, W, `${s}-01`)
  const made = a.made.filter(m => m.who === RANGER)
  chk(W, `${s}.01`, 'Add: ONE filing, Sat 1 – Sun 2 Aug', made.length === 1 && recIs(made[0], RANGER, ISO.a1, ISO.a2), M.sayRecs(a.made), a.pic)
  chk(W, `${s}.02`, `the note: "Saved Sat 1 – Sun 2 Aug. Fri 31 Jul was left out because you're SANS from Sat 1 Aug."`, a.said === "Saved Sat 1 – Sun 2 Aug. Fri 31 Jul was left out because you're SANS from Sat 1 Aug.", `"${a.said}"`, a.pic)
}
async function s19e(p, W) {
  /* the window's dates, hours and Fly/AMT/OFT changed before Add */
  return cut(p, W, { id: 's19e', door: 'drag', a: ISO[16], b: ISO[18], from: ISO[17], to: ISO[19], early: [ISO[16]], kinds: 'oa', hours: true,
    words: "Saved Fri 17 – Sun 19 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul.",
    mod: async (p, W, s) => {
      await X.tapWinDate(p, W, ISO[16]); await X.tapWinDate(p, W, ISO[19])
      for (const [label, want] of [['Fly', false], ['AMT', true], ['OFT', true]]) {
        const cb = p.locator('#inpEditSans label', { hasText: new RegExp('^\\s*' + label + '\\s*$') }).locator('input').first()
        if ((await cb.isChecked()) !== want) { if (W.isPhone) await cb.tap(); else await cb.click(); await sleep(150) }
      }
      await W.press(p, '#inpEditSpan [data-span="custom"]', 'span-custom')
      await p.fill('#inpEditStart', '09:00'); await p.fill('#inpEditEnd', '12:00')
      const r = await X.inpRead(p), dd = await M.winDates(p)
      need(W, `${s}.f3`, "changed before Add: Dates Thu 16 then Sun 19; AMT + OFT, not Fly; Custom 09:00–12:00", /Jul 16 → Jul 19/.test(dd.read) && /AMT✓/.test(r.ticks) && /OFT✓/.test(r.ticks) && !/Fly✓/.test(r.ticks), `${M.winDatesSay(dd)} · ${r.ticks} · ${await p.inputValue('#inpEditStart').catch(() => '?')}–${await p.inputValue('#inpEditEnd').catch(() => '?')}`, await W.pic(p, s + '-changed'))
    } })
}
async function s19f(p, W, o = {}) {
  /* Cancel saves nothing and says nothing */
  const s = o.id || 's19f'
  await post(p, W, RANGER, ISO[17], `${s}.f1`)
  if (!o.saber) await asR(p, W)
  const d = await openDoor(p, W, s, { door: 'drag', a: ISO[16], b: ISO[18], saber: o.saber })
  need(W, `${s}.f2`, `the door: ${d.how}`, d.opened, M.winDatesSay(d.dates), d.pic)
  const before = await M.sansRecs(p)
  await W.press(p, '#inpEditCancel:visible', 'cancel')
  const n = await M.noteNow(p)
  await sleep(500)
  const after = await M.sansRecs(p)
  const pic = await W.pic(p, `${s}-01`)
  chk(W, `${s}.01`, 'Cancel: the window closed, nothing saved', !(await p.locator('#inpEditPop:visible').count()) && after.length === before.length, `records ${before.length} → ${after.length}`, pic)
  chk(W, `${s}.02`, 'no "Saved" note', !/Saved/.test(n.said), `note "${n.said}"`, pic)
  const v = await seen(p, W, ISO[17], `${s}-03`)
  chk(W, `${s}.03`, 'the SANS month: Fri 17 does not list Ranger', !v.has, v.words, v.pic)
}
async function s19g(p, W, o = {}) {
  /* Undo after a successful cut: one Undo step removes the retained filing, never reveals the discarded days; Redo puts back only it */
  const s = o.id || 's19g'
  const r = await cut(p, W, { id: s, door: 'drag', a: ISO[16], b: ISO[18], from: ISO[17], to: ISO[18], early: [ISO[16]], saber: o.saber, words: o.saber ? ADM : SELF })
  await T.closeAll(p, W)
  const ub = await p.locator('#undoBtn').first().getAttribute('title').catch(() => '')
  await W.press(p, '#undoBtn:visible', 'undo'); await sleep(800)
  const said = await L.toastSaid(p)
  let m = await mine(p)
  const pic = await W.pic(p, `${s}-06`)
  chk(W, `${s}.06`, `ONE Undo ("${ub}"): the retained filing gone, nothing left of Ranger's`, m.length === 0, `"${said}" · Ranger's records ${M.sayRecs(m)}`, pic)
  for (const d of [16, 17]) {
    const v = await seen(p, W, ISO[d], `${s}-07-${d}`)
    chk(W, `${s}.07.${d}`, `after Undo: ${md(ISO[d])} lists no Ranger (no discarded early day shows)`, !v.has, v.words, v.pic)
  }
  await T.closeAll(p, W)
  const rb = await p.locator('#redoBtn').first().getAttribute('title').catch(() => '')
  await W.press(p, '#redoBtn:visible', 'redo'); await sleep(800)
  m = await mine(p)
  chk(W, `${s}.08`, `Redo ("${rb}"): the same Fri 17 – Sat 18 filing back, Thu 16 not in it`, m.length === 1 && recIs(m[0], RANGER, ISO[17], ISO[18]), `"${await L.toastSaid(p)}" · ${M.sayRecs(m)}`, await W.pic(p, `${s}-08`))
}

/* ---------- S20: no SANS day in the run; a gap in its middle ---------- */
async function s20a(p, W, o = {}) {
  const s = o.id || 's20a'
  await post(p, W, RANGER, ISO[17], `${s}.f1`)
  if (!o.saber) await asR(p, W)
  const d = await openDoor(p, W, s, { door: 'drag', a: ISO[15], b: ISO[16], saber: o.saber })
  if (!d.opened) {
    const n = await M.noteNow(p)
    rec(W, `${s}.01`, 'Wed 15 – Thu 16 dragged: refused at the calendar door (RECORD the words)', `no window · note "${n.said}"`, d.pic)
    chk(W, `${s}.02`, 'nothing saved, no "Saved" note', (await mine(p)).length === 0 && !/Saved/.test(n.said), `Ranger's records ${M.sayRecs(await mine(p))}`, d.pic)
    return
  }
  rec(W, `${s}.00`, `the door opened: ${d.how}`, M.winDatesSay(d.dates) + ' · ' + (d.form && d.form.person), d.pic)
  const a = await M.add(p, W, `${s}-01`)
  rec(W, `${s}.01`, 'Add on Wed 15 – Thu 16: the refusal as it reads (RECORD; the existing refusal)', `"${a.said}" · stayed ${a.stayed}`, a.pic)
  chk(W, `${s}.02`, 'refused: nothing saved, no "Saved" note, a refusal shown', a.made.length === 0 && !/Saved/.test(a.said) && !!a.said, `made ${M.sayRecs(a.made)}`, a.pic)
}
async function s20c(p, W, o = {}) {
  /* the clock and Quals: SANS Wed 15, not Thu 16, SANS again Fri 17; then Wed 15 – Sat 18 picked */
  const s = o.id || 's20c'
  await tick(p, W, true, `${s}.f1`)
  let t = await T.moveClock(p, W, '2026-07-16T09:00:00')
  rec(W, `${s}.f2`, "the clock moved to Thu 16 09:00, reloaded: the app's today", t)
  await tick(p, W, false, `${s}.f3`)
  t = await T.moveClock(p, W, '2026-07-17T09:00:00')
  rec(W, `${s}.f4`, "the clock moved to Fri 17 09:00, reloaded: the app's today", t)
  await tick(p, W, true, `${s}.f5`)
  if (!o.saber) await asR(p, W)
  const st = []
  for (const d of [15, 16, 17, 18]) { const r = await addState(p, W, ISO[d], `${s}-f6-${d}`); st.push(`${md(ISO[d])}: ${say18(r)}`); if (d === 15) var wed = r; if (d === 16) var thu = r }
  rec(W, `${s}.f6`, "each day's + Commitment, read before the pick (is Wed 15 a SANS day and Thu 16 a gap?)", st.join(' | '))
  const gap = o.saber ? true : (wed.add === 'enabled' && thu.add === 'greyed')
  const d = await openDoor(p, W, s, { door: 'drag', a: ISO[15], b: ISO[18], saber: o.saber })
  if (!d.opened) { const n = await M.noteNow(p); rec(W, `${s}.01`, 'Wed 15 – Sat 18 dragged: no window (RECORD)', `note "${n.said}"`, d.pic); chk(W, `${s}.02`, 'nothing saved', (await mine(p)).length === 0, M.sayRecs(await mine(p)), d.pic); return }
  rec(W, `${s}.00`, `the door: ${d.how}`, M.winDatesSay(d.dates), d.pic)
  const a = await M.add(p, W, `${s}-01`)
  rec(W, `${s}.01`, 'Add on Wed 15 – Sat 18: what it said (RECORD)', `"${a.said}" · stayed ${a.stayed} · made ${M.sayRecs(a.made)}`, a.pic)
  if (!gap) { W.rec(`${s}.02`, 'refused whole because Thu 16 is a gap', 'NW', 'the set-up did not make Wed 15 a SANS day with Thu 16 a gap (see f6)', a.pic); return }
  chk(W, `${s}.02`, 'refused whole: nothing saved (no Fri 17 – Sat 18, no two filings), no "Saved" note', a.made.length === 0 && !/Saved/.test(a.said), `made ${M.sayRecs(a.made)} · note "${a.said}"`, a.pic)
}

/* ---------- S21: the cut cannot get round the save's checks ---------- */
async function s21a(p, W) {
  return refusedCut(p, W, 's21a', async (p, W, s) => {
    for (const label of ['Fly', 'AMT', 'OFT']) {
      const cb = p.locator('#inpEditSans label', { hasText: new RegExp('^\\s*' + label + '\\s*$') }).locator('input').first()
      if (await cb.isChecked()) { if (W.isPhone) await cb.tap(); else await cb.click(); await sleep(150) }
    }
    const r = await X.inpRead(p)
    need(W, `${s}.f3`, 'Fly, AMT and OFT all unticked', !/✓/.test(r.ticks), r.ticks, await W.pic(p, s + '-unticked'))
  })
}
async function s21b(p, W) {
  return refusedCut(p, W, 's21b', null, async (p, W, s) => {
    const f = await K.file(p, W, ISO[18], null, `${s}.f1b`)
    return f
  })
}
async function refusedCut(p, W, s, mod, pre) {
  await post(p, W, RANGER, ISO[17], `${s}.f1`)
  await asR(p, W)
  if (pre) await pre(p, W, s)
  const d = await openDoor(p, W, s, { door: 'drag', a: ISO[16], b: ISO[18] })
  need(W, `${s}.f2`, `the door: ${d.how}`, d.opened, M.winDatesSay(d.dates), d.pic)
  if (mod) await mod(p, W, s)
  const before = await mine(p)
  const a = await M.add(p, W, `${s}-01`)
  const after = await mine(p)
  rec(W, `${s}.01`, 'Add: the refusal as it reads (RECORD)', `"${a.said}" · stayed ${a.stayed}`, a.pic)
  chk(W, `${s}.02`, 'refused: nothing new saved, no "Saved" (clipped-success) note', a.made.length === 0 && after.length === before.length && !/Saved/.test(a.said) && !!a.said, `Ranger's records ${M.sayRecs(before)} → ${M.sayRecs(after)}`, a.pic)
}

/* ---------- S24: the crew list ---------- */
const sansSec = (p, root) => p.evaluate(root => {
  const R = document.querySelector(root); if (!R) return { root: 'none' }
  const sec = [...R.querySelectorAll('.rsans, .rall.rsans')].find(e => e.getBoundingClientRect().width > 0) || R.querySelector('.rsans')
  if (!sec) return { sec: 'none' }
  const vis = e => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 }
  const t = e => (e.textContent || '').replace(/\s+/g, ' ').trim()
  const heads = [...sec.querySelectorAll('.rh, .rh2, h4, .rhd')].filter(vis).map(t)
  const pucks = [...sec.querySelectorAll('.rpuck')].map(e => ({ id: e.dataset.person, struck: /(^|\s)no(\s|$)/.test(e.className), why: e.dataset.why || '', title: e.getAttribute('title') || '', printed: [...e.querySelectorAll('.rwhy')].filter(vis).map(t).join(' / ') }))
  const lines = [...sec.querySelectorAll('*')].filter(e => vis(e) && e.children.length === 0 && /File it|availability filed|Inputs page/i.test(t(e))).map(t)
  return { heads, text: t(sec).slice(0, 400), pucks, lines, free: (t(sec).match(/(\d+) free/) || [])[0] || '' }
}, root)
const secSay = c => c.pucks ? `heads ${J(c.heads)} · "${c.free}" · ${c.pucks.filter(x => [RANGER, HEX].includes(x.id)).map(x => `${x.id === RANGER ? 'Ranger' : 'Hex'}${x.struck ? ' struck' : ''}${x.printed ? ' printed "' + x.printed + '"' : ''}${x.title ? ' title "' + x.title + '"' : ''}`).join('; ')} · reason lines ${J(c.lines)}` : J(c)
async function s24(p, W) {
  const s = 's24'
  await post(p, W, RANGER, ISO[17], `${s}.f1`)
  const q = await L.qualsTick(p, W, HEX, `${s}-f2`)
  need(W, `${s}.f2`, "Saber ticks Hex's SANS on Quals → Edit", q.st && q.st.san === true, J(q.st), q.pic)
  /* Edit Schedule's crew list on Sat 18, no seat picked */
  await L.closeBoard(p, W); await L.go(p, 'editsched')
  const day = await T.S.crewPanelTo(p, W, 'sat')
  await p.evaluate(() => { const e = document.querySelector('.ros-body .rsans'); if (e) e.scrollIntoView({ block: 'center' }) }); await sleep(300)
  let c = await sansSec(p, '.ros-body')
  let pic = (await T.W5.clip(p, W, '.ros-body .rsans', `${s}-01`)) || await W.pic(p, `${s}-01`)
  rec(W, `${s}.00`, `Edit Schedule's crew list on ${day}: the SANS Avail section as it reads`, secSay(c), pic)
  const rg = c.pucks && c.pucks.find(x => x.id === RANGER), hx = c.pucks && c.pucks.find(x => x.id === HEX)
  chk(W, `${s}.01`, 'no seat picked: Ranger and Hex struck, "0 free"', !!rg && !!hx && rg.struck && hx.struck && c.free === '0 free', secSay(c), pic)
  chk(W, `${s}.02`, 'no new reason row or filing instruction: nothing printed under either name, no line "File it…/no availability filed"', !!rg && !rg.printed && !hx.printed && c.lines.length === 0, secSay(c), pic)
  if (!W.isPhone) {
    const pk = p.locator(`.ros-body .rsans .rpuck[data-person="${RANGER}"]`).first()
    await pk.hover().catch(() => {}); await sleep(700)
    const tip = await p.evaluate(() => [...document.querySelectorAll('.tip, [role="tooltip"], .hovertip')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.textContent || '').replace(/\s+/g, ' ').trim()).join(' / '))
    rec(W, `${s}.03`, "desktop hover on Ranger's struck name: what it says (as built)", `title "${rg && rg.title}" · data-why "${rg && rg.why}" · tooltip "${tip}"`, await W.pic(p, `${s}-03-hover`))
  }
  await T.S.crewPanelClose(p, W)
  /* a seat picked: the board's Sat, a Ground Programme row's "+ add" armed */
  await L.openBoard(p, W, 5)
  await T.W5.boardDrawer(p, W, true)
  c = await sansSec(p, '#schedBoard')
  const bpic = (await T.W5.clip(p, W, '#schedBoard .rsans', `${s}-03b`)) || await W.pic(p, `${s}-03b`)
  const brg = c.pucks && c.pucks.find(x => x.id === RANGER), bhx = c.pucks && c.pucks.find(x => x.id === HEX)
  chk(W, `${s}.03b`, "the Scheduler Board's crew list, Sat, no seat picked: both struck, \"0 free\", no reason line printed", !!brg && !!bhx && brg.struck && bhx.struck && c.free === '0 free' && !brg.printed && !bhx.printed && c.lines.length === 0, secSay(c), bpic)
  await T.W5.boardDrawer(p, W, false)
  const g = await L.groundRow(p, W, 5, 'W13 SEAT', '10:00', '11:00', null)
  const ar = await T.W5.armRead(p, W, `[data-fill="g:5.${g.ri}.+"]`, `${s}-04`)
  await T.W5.boardDrawer(p, W, true)
  c = await sansSec(p, '#schedBoard')
  rec(W, `${s}.04`, `a seat picked (armed ${ar.armed}): the board's SANS Avail section as built (struck names' reasons — as built, RECORD)`, secSay(c), ar.pic)
  await T.W5.disarm(p, W)
  await L.closeBoard(p, W)
  /* filing then updates availability: Saber files Sat 18 for Ranger */
  const f = await T.file(p, W, ISO[18], RANGER, ['fly'], null, `${s}-f5`)
  need(W, `${s}.f5`, 'Saber files Sat 18 (Fly, all day) for Ranger', !!f.iid, f.iid ? J(f.made) : f.refused, f.pic)
  await T.closeAll(p, W); await L.go(p, 'editsched')
  await T.S.crewPanelTo(p, W, 'sat')
  await p.evaluate(() => { const e = document.querySelector('.ros-body .rsans'); if (e) e.scrollIntoView({ block: 'center' }) }); await sleep(300)
  c = await sansSec(p, '.ros-body')
  pic = (await T.W5.clip(p, W, '.ros-body .rsans', `${s}-05`)) || await W.pic(p, `${s}-05`)
  const rg2 = c.pucks && c.pucks.find(x => x.id === RANGER)
  chk(W, `${s}.05`, 'after the filing: Ranger not struck, "1 free"; Hex still struck', !!rg2 && !rg2.struck && c.free === '1 free', secSay(c), pic)
  await T.S.crewPanelClose(p, W)
}

/* ---------- the plain-user round (§7.0a) ---------- */
async function pu1(p, W) {
  const s = 'pu1'
  await post(p, W, RANGER, ISO[17], `${s}.f1`)
  await plan(p, W, 18, `${s}.f2`, { name: 'W13 BRIEF' })
  await asR(p, W)
  /* the bell: open, close each way, tap the line */
  let b = await K.bell(p, W, `${s}-01`)
  chk(W, `${s}.01`, 'the bell opens: his reminder, unread, bell lit', !!b.rem && b.rem.unread && b.lit === true, K.sayB(b), b.pic)
  chk(W, `${s}.02`, 'closed by Escape', (await X.bellShut(p, 'escape', W)) === 'closed', '', await W.pic(p, `${s}-02`))
  await W.press(p, '.bellbtn:visible', 'bell'); await p.waitForSelector('[data-testid="bell-list"]', { timeout: 5000 }).catch(() => {})
  chk(W, `${s}.03`, 'closed by pressing the bell again', (await X.bellShut(p, 'bell', W)) === 'closed', '', await W.pic(p, `${s}-03`))
  await W.press(p, '.bellbtn:visible', 'bell'); await p.waitForSelector('[data-testid="bell-list"]', { timeout: 5000 }).catch(() => {})
  chk(W, `${s}.04`, 'closed by a tap outside it (the screen\'s lower left)', (await X.bellShut(p, 'out', W)) === 'closed', `page now ${await p.evaluate(() => window.CURPAGE)}`, await W.pic(p, `${s}-04`))
  b = await K.bell(p, W, `${s}-05`)
  const t = await X.bellTap(p, W, b.rem.id, `${s}-05`)
  chk(W, `${s}.05`, 'a tap on the reminder opens the SANS tab on Sat 18, its + Commitment open to him', t.page === 'inputs' && t.cal && t.win && /Sat\s*18/.test(t.win.ttl) && t.win.add === 'enabled', `page ${t.page} · ${t.month} · window "${t.win && t.win.ttl}" · + Commitment ${t.win && t.win.add}`, t.pic)
  /* the SANS day window: ✕, Escape, a press outside it; on the phone its pull-up bar */
  chk(W, `${s}.06`, 'the SANS day window closed by its ✕', (await X.sansX(p, W, 'x')) === 'closed', '', await W.pic(p, `${s}-06`))
  await M.sday(p, W, ISO[18])
  chk(W, `${s}.07`, 'closed by Escape', (await X.sansX(p, W, 'esc')) === 'closed', '', await W.pic(p, `${s}-07`))
  await M.sday(p, W, ISO[18])
  if (!W.isPhone) {
    const c19 = p.locator(`[data-testid="sc-day-${ISO[19]}"]`).first()
    await c19.click({ position: { x: 8, y: 8 } }); await sleep(600)
    const pg = await X.sansPage(p)
    chk(W, `${s}.08`, 'a press outside it, on Sun 19 of the month: the page acts (the window shows Sun 19) and the window stays (D641/D642)', !!pg.win && /Sun\s*19/.test(pg.win.ttl), `window "${pg.win && pg.win.ttl}"`, await W.pic(p, `${s}-08`))
  } else {
    const h0 = await p.evaluate(() => { const w = [...document.querySelectorAll('[data-testid="win-sansday"]')].find(e => e.getBoundingClientRect().width > 0); return w ? Math.round(w.getBoundingClientRect().height) : 0 })
    const bar = await p.evaluate(() => { const w = [...document.querySelectorAll('[data-testid="win-sansday"]')].find(e => e.getBoundingClientRect().width > 0); if (!w) return null; const c = w.querySelector('.win-grab, .win-bar, .sd-top, .win-hd, .win-head'); return c ? { cls: c.className, box: (r => [r.x, r.y, r.width, r.height].map(Math.round))(c.getBoundingClientRect()) } : null })
    const geo = () => p.evaluate(() => { const w = [...document.querySelectorAll('[data-testid="win-sansday"]')].find(e => e.getBoundingClientRect().width > 0); if (!w) return 'gone'; const r = w.getBoundingClientRect(); return `top ${Math.round(r.y)} height ${Math.round(r.height)}` })
    if (bar) {
      /* a tap on the bar, then the bar's six-dot grip dragged down and back up (a press held and moved; WebKit's mouse — its
         in-page touches drive no pointer events, walk-scripts §4) */
      await p.touchscreen.tap(bar.box[0] + 200, bar.box[1] + 20); await sleep(60)
      await p.screenshot({ path: path.join(M.OUT, 'taps', `${s}-bar1-now-phone.png`) }); await sleep(600)
      const g1 = await geo()
      const gx = bar.box[0] + 16, gy = bar.box[1] + 26
      await p.mouse.move(gx, gy); await p.mouse.down(); for (let i = 1; i <= 8; i++) { await p.mouse.move(gx, gy + 36 * i); await sleep(30) } await sleep(90); await p.mouse.up(); await sleep(600)
      const g2 = await geo(); const pic1 = await W.pic(p, `${s}-08a`)
      const top = await p.evaluate(() => { const w = [...document.querySelectorAll('[data-testid="win-sansday"]')].find(e => e.getBoundingClientRect().width > 0); return w ? w.getBoundingClientRect().y : 0 })
      await p.mouse.move(gx, top + 26); await p.mouse.down(); for (let i = 1; i <= 8; i++) { await p.mouse.move(gx, top + 26 - 36 * i); await sleep(30) } await sleep(90); await p.mouse.up(); await sleep(600)
      const g3 = await geo()
      rec(W, `${s}.08`, "the phone window's top bar (six-dot grip): tapped, then dragged down 288 and back up (D648, as built; RECORD)", `bar ${J(bar)} · at open ${h0}px tall · after the tap ${g1} · dragged down ${g2} · dragged back ${g3}`, pic1 + ', ' + await W.pic(p, `${s}-08b`))
    } else rec(W, `${s}.08`, "the phone's pull-up bar", 'no bar element found by .win-grab/.win-bar/.sd-top/.win-hd', await W.pic(p, `${s}-08`))
  }
  await X.sansX(p, W)
  /* + Commitment's window: Cancel, ✕, Escape, ✕ with words typed, Add */
  const before = (await M.sansRecs(p)).length
  let c = await M.commitOpen(p, W, ISO[18], `${s}-09`)
  await W.press(p, '#inpEditCancel:visible', 'cancel'); await sleep(400)
  chk(W, `${s}.09`, '+ Commitment → Cancel: the window closed, nothing made', c.ok && !(await p.locator('#inpEditPop:visible').count()) && (await M.sansRecs(p)).length === before, `opened ${c.ok}`, c.pic + ', ' + await W.pic(p, `${s}-09-after`))
  c = await M.commitOpen(p, W, ISO[18], `${s}-10`)
  await W.press(p, '[data-testid="win-inputedit-x"]:visible', 'inp-x'); await sleep(400)
  chk(W, `${s}.10`, '+ Commitment → ✕ (nothing typed): closed at once, no question', !(await p.locator('#inpEditPop:visible').count()) && !(await p.locator('[data-testid="inped-escask-go"]:visible').count()), '', await W.pic(p, `${s}-10-after`))
  c = await M.commitOpen(p, W, ISO[18], `${s}-11`)
  await p.keyboard.press('Escape'); await sleep(500)
  chk(W, `${s}.11`, '+ Commitment → Escape: closed', !(await p.locator('#inpEditPop:visible').count()), '', await W.pic(p, `${s}-11-after`))
  c = await M.commitOpen(p, W, ISO[18], `${s}-12`)
  await p.fill('#inpEditRmk', 'W13 NOTE').catch(() => {})
  await W.press(p, '[data-testid="win-inputedit-x"]:visible', 'inp-x'); await sleep(400)
  const ask = await p.locator('[data-testid="inped-escask-go"]:visible').count()
  const askWords = M.clean(await p.locator('[data-testid="inped-escask-go"]:visible').first().evaluate(e => (e.closest('[role="dialog"], .escask, .inped-escask') || e.parentElement).textContent).catch(() => ''))
  const pic12 = await W.pic(p, `${s}-12-ask`)
  chk(W, `${s}.12`, '+ Commitment → a remark typed → ✕: "Close it and lose them?" asked at the ✕', ask > 0, `ask shown ${ask} · "${askWords}"`, pic12)
  if (ask) { await W.press(p, '[data-testid="inped-escask-go"]:visible', 'discard'); await sleep(400) }
  chk(W, `${s}.12b`, 'answered to close: the window gone, nothing made', !(await p.locator('#inpEditPop:visible').count()) && (await M.sansRecs(p)).length === before, '', await W.pic(p, `${s}-12-after`))
  c = await M.commitOpen(p, W, ISO[18], `${s}-13`)
  const a = await M.add(p, W, `${s}-13`)
  const made = a.made.filter(m => m.who === RANGER)
  const pg = await X.sansPage(p)
  chk(W, `${s}.13`, '+ Commitment → Add: one Sat 18 filing; the day lists it', made.length === 1 && recIs(made[0], RANGER, ISO[18]) && pg.win && pg.win.iids.includes(made[0].iid), `made ${M.sayRecs(a.made)} · note "${a.said}" · day lines ${pg.win && pg.win.iids.join(',')}`, a.pic)
  b = await K.bell(p, W, `${s}-14`)
  chk(W, `${s}.14`, 'the bell: his reminder gone now Sat 18 is filed, no take-back line', !b.rem && b.struck.length === 0, K.sayB(b), b.pic)
  await T.closeAll(p, W)
  /* open the saved commitment, delete it, Undo */
  const o = await X.openLine(p, W, ISO[18], made[0] && made[0].iid, `${s}-15`)
  chk(W, `${s}.15`, 'the saved commitment opens from its day, with Delete', o.ok && o.r && o.r.del, o.ok ? `${o.r.person} · ${o.r.ticks} · del ${o.r.del}` : o.why, o.pic)
  if (o.ok) {
    await W.press(p, '#inpEditDel:visible', 'delete'); await sleep(700)
    const gone = !(await M.sansRecs(p)).some(r => r.iid === made[0].iid)
    const pg2 = await X.sansPage(p)
    chk(W, `${s}.16`, 'Delete: the filing gone, the day no longer lists it', gone && (!pg2.win || !pg2.win.iids.includes(made[0].iid)), `note "${await L.toastSaid(p)}" · day lines ${pg2.win && pg2.win.iids.join(',')}`, await W.pic(p, `${s}-16`))
    await T.closeAll(p, W)
    const ub = await p.locator('#undoBtn').first().getAttribute('title').catch(() => '')
    await W.press(p, '#undoBtn:visible', 'undo'); await sleep(800)
    const back = (await M.sansRecs(p)).some(r => r.iid === made[0].iid)
    chk(W, `${s}.17`, `Undo ("${ub}"): the filing back`, back, `"${await L.toastSaid(p)}"`, await W.pic(p, `${s}-17`))
  }
  /* as Saber: the other places that should show his Sat 18 filing */
  await asS(p, W)
  let v = await seen(p, W, ISO[18], `${s}-18`)
  chk(W, `${s}.18`, 'the SANS month: Sat 18 lists Ranger, its F count counting him', v.has, v.words, v.pic)
  await T.closeAll(p, W)
  const wc = await T.weekCrewOf(p, W, 'sat', RANGER, `${s}-19`)
  chk(W, `${s}.19`, "Edit Schedule's crew list, Sat: Ranger under SANS Avail, not struck", T.inSansAvail(wc.c) && !wc.c.pucks.some(x => x.shown && x.where === 'SANS Avail' && x.struck), `${wc.day} · ${T.crewWhere(wc.c)}`, wc.pic)
  const bc = await T.boardCrewOf(p, W, 5, RANGER, `${s}-20`)
  chk(W, `${s}.20`, "the Scheduler Board's crew list, Sat: Ranger under SANS Avail", T.inSansAvail(bc.c), T.crewWhere(bc.c), bc.pic)
  await L.closeBoard(p, W)
  await L.go(p, 'viewsched')
  const vs = await p.evaluate(id => { const t = e => (e.textContent || '').replace(/\s+/g, ' ').trim(); return [...document.querySelectorAll('#vWeek .rsans, #vWeek [class*="sans"]')].filter(e => e.getBoundingClientRect().width > 0).map(t).join(' / ').slice(0, 200) || 'no SANS section drawn' }, RANGER)
  rec(W, `${s}.21`, 'View-only Sched: what it shows of SANS availability (the crew panels never reach it, as ruled)', vs, await W.pic(p, `${s}-21`))
  await L.go(p, 'editsched')
  await W.press(p, '#histBtn:visible', 'hist'); await sleep(900)
  const cw = await p.evaluate(() => { const w = [...document.querySelectorAll('.chgwin')].find(e => e.getBoundingClientRect().width > 0); return w ? (w.innerText || '').replace(/\s+/g, ' ').slice(0, 500) : 'no window' })
  const cwPic = await W.pic(p, `${s}-22`)
  rec(W, `${s}.22`, 'the changes window (Edit Schedule\'s clock): what it lists (RECORD)', cw, cwPic)
  await p.keyboard.press('Escape'); await sleep(500)
  chk(W, `${s}.23`, 'the changes window closed by Escape', !(await p.evaluate(() => [...document.querySelectorAll('.chgwin')].some(e => e.getBoundingClientRect().width > 0))), '', await W.pic(p, `${s}-23`))
}
/* Saber: the Leave War's Post out sheet — open, ✕, Escape, a tap outside, post out, the posted-out sheet, Undo post out */
async function poOpen(p, W, tag) {
  await M.warReady(p)
  const c = (await L.lwCell(p, W, HEX, ISO[24])).cell
  if (!c) return false
  await W.press(p, c, 'cell'); await sleep(300)
  await W.press(p, '[data-testid="bid-more"]:visible', 'more')
  await W.press(p, '[data-testid="bid-postout"]:visible', 'postout'); await sleep(300)
  return !!(await p.locator('[data-testid="po-confirm"]:visible').count())
}
const sheetUp = p => p.locator('[data-testid="bid-picker"]:visible, [data-testid="postout-sheet"]:visible').count()
async function pu2(p, W) {
  const s = 'pu2'
  let o = await poOpen(p, W, s)
  const pic0 = await W.pic(p, `${s}-01`)
  await W.press(p, '[data-testid="bid-cancel"]:visible', 'sheet-x'); await sleep(500)
  chk(W, `${s}.01`, "Hex's Fri 24 → ⋯ → Post out: the sheet opens; its ✕ closes it", o && !(await sheetUp(p)), `opened ${o}`, pic0 + ', ' + await W.pic(p, `${s}-01-after`))
  o = await poOpen(p, W, s)
  await p.keyboard.press('Escape'); await sleep(600)
  chk(W, `${s}.02`, 'opened again; Escape closes it', o && !(await sheetUp(p)), `opened ${o}`, await W.pic(p, `${s}-02-after`))
  o = await poOpen(p, W, s)
  const box = await p.locator('[data-testid="bid-picker"]:visible').first().boundingBox().catch(() => null)
  const vp = p.viewportSize()
  /* a point outside the sheet: above it on the phone (a sheet from the foot), at the left on a desktop */
  const pt = box ? (box.y > 120 ? [Math.round(vp.width / 2), Math.round(box.y / 2)] : [Math.max(8, Math.round(box.x / 2)), Math.round(vp.height / 2)]) : [10, 10]
  const at = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.className || e.tagName) + '' : 'nothing' }, pt)
  if (W.isPhone) await p.touchscreen.tap(pt[0], pt[1]); else await p.mouse.click(pt[0], pt[1])
  await sleep(600)
  const still = await sheetUp(p)
  rec(W, `${s}.03`, `opened again; a press outside it at ${pt.join(',')} (on "${String(at).slice(0, 40)}"): what happened (RECORD)`, `sheet still up ${still > 0}`, await W.pic(p, `${s}-03-after`))
  if (still) { await W.press(p, '[data-testid="bid-cancel"]:visible', 'sheet-x'); await sleep(400) }
  const r = await L.postOut(p, W, HEX, ISO[24], `${s}-04`)
  chk(W, `${s}.04`, 'Post out → SANS → Post out: Hex SANS from Fri 24', /becomes SANS/.test(r.line || ''), `"${r.line}" ${J(r.after)}`, r.pic)
  let sh = await T.sheet(p, W, HEX, ISO[24], `${s}-05`)
  await W.press(p, '[data-testid="postout-cancel"]:visible', 'po-x'); await sleep(500)
  chk(W, `${s}.05`, 'his PO cell opens the posted-out sheet; its ✕ closes it', sh.kind === 'posted-out sheet' && !(await sheetUp(p)), `${sh.kind} · "${sh.line}"`, sh.pic)
  sh = await T.sheet(p, W, HEX, ISO[24], `${s}-06`)
  await p.keyboard.press('Escape'); await sleep(600)
  chk(W, `${s}.06`, 'opened again; Escape closes it', sh.kind === 'posted-out sheet' && !(await sheetUp(p)), sh.kind, await W.pic(p, `${s}-06-after`))
  const u = await T.undoPo(p, W, HEX, ISO[24], `${s}-07`)
  const cell = (await L.lwCell(p, W, HEX, ISO[24])).text
  chk(W, `${s}.07`, 'Undo post out: the posting gone, his Fri 24 cell no longer PO', u.ok && !u.err && !/PO/.test(cell), `"${u.before}" · cell "${cell}" · ${u.err || ''}`, u.pic)
  /* the bell after Undo post out: Saber is told nothing of his own action */
  const b = await K.bell(p, W, `${s}-08`)
  chk(W, `${s}.08`, "Saber's own bell: no line about Hex's posting (his own action)", !b.lines.some(l => /Hex/.test(l.title + l.body + l.all) && /post/i.test(l.title + l.body + l.all)), K.sayB(b).slice(0, 400), b.pic)
}

const SCN = {
  /* S6 — every door, Ranger himself */
  s6a: { fn: door('s6a', 'drag', { words: SELF }), phone: 'pc' },
  s6b: { fn: door('s6b', 'drag-rev', { words: SELF }), phone: 'pc' },
  s6c: { fn: door('s6c', 'keys-enter', { words: SELF }) },
  s6d: { fn: door('s6d', 'keys-space', { words: SELF }) },
  s6e: { fn: door('s6e', 'cal', { words: SELF }) },
  /* S6 — Saber filing for Ranger */
  s6f: { fn: door('s6f', 'drag', { saber: true, words: ADM }), phone: 'pc' },
  s6g: { fn: door('s6g', 'cal', { saber: true, words: ADM }) },
  s6h: { fn: door('s6h', 'keys-enter', { saber: true, words: ADM }) },
  /* S8 */
  s8a: { fn: s8a }, s8b: { fn: s8b }, s8c: { fn: s8c },
  /* S18 */
  s18a: { fn: s18a }, s18b: { fn: s18b },
  /* S19 */
  s19a: { fn: (p, W) => cut(p, W, { id: 's19a', door: 'drag', po: ISO[18], a: ISO[15], b: ISO[19], from: ISO[18], to: ISO[19], early: [ISO[15], ISO[16], ISO[17]] }), phone: 'pc' },
  s19b: { fn: (p, W) => cut(p, W, { id: 's19b', door: 'drag', a: ISO[16], b: ISO[17], from: ISO[17], to: ISO[17], early: [ISO[16]] }), phone: 'pc' },
  s19c: { fn: s19c }, s19d: { fn: s19d },
  s19e: { fn: s19e, phone: 'pc' },
  s19f: { fn: s19f, phone: 'pc' },
  s19g: { fn: s19g, phone: 'pc' },
  s19h: { fn: (p, W) => s19f(p, W, { id: 's19h', saber: true }), phone: 'pc' },
  s19i: { fn: (p, W) => s19g(p, W, { id: 's19i', saber: true }), phone: 'pc' },
  /* S20 */
  s20a: { fn: s20a, phone: 'pc' }, s20b: { fn: (p, W) => s20a(p, W, { id: 's20b', saber: true }), phone: 'pc' },
  s20c: { fn: s20c, phone: 'pc' }, s20d: { fn: (p, W) => s20c(p, W, { id: 's20d', saber: true }), phone: 'pc' },
  /* S21 */
  s21a: { fn: s21a, phone: 'pc' }, s21b: { fn: s21b, phone: 'pc' },
  /* S24 */
  s24: { fn: s24 },
  /* the plain-user round */
  pu1: { fn: pu1 }, pu2: { fn: pu2 },
}
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : Object.keys(SCN)
for (const n of ONLY) {
  if (!SCN[n]) { console.log('no scenario', n); continue }
  const szKey = SZ === 'd' ? 'd' : (SCN[n].phone || 'p')
  console.log('=== ' + n + ' ' + szKey)
  await run(n, szKey, scene(SCN[n].fn))
  writeFileSync(path.join(M.OUT, `results-all-${SZ}.json`), JSON.stringify(L.results, null, 1))
}
const c = k => L.results.filter(r => r.ok === k).length
console.log(`DONE ${SZ}: ${L.results.length} rows · PASS ${c(true)} · FAIL ${c(false)} · RECORDED ${c('REC')} · NOT WALKED ${c('NW')}`)
process.exit(0)
