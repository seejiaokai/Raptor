// Walker w9 — the FULL check of claude/allavail-sans-postout-141: the hiding of SANS availability, cause by cause, with
// Astra's reader sweep (S6 posting moved later, S7 Undo post out, S8 the outcome changed, S9 Quals untick, S10 archive and
// restore). 23 Nov 26, chat 152. Brief: docs/superpowers/briefs/2026-11-23-sans-ahead-full-walk-brief.md.
// Run from raptor-port/:  W9_RUN=<run> ONLY=s6d,s6p,... node scripts/handpass/sah-w9.mjs
import './sah-w9-env.mjs'
import { mkdirSync } from 'node:fs'
const X = await import('./sah-w9-lib.mjs')
const { L, S, sleep, J, R } = X
const VERSION = 'sah-w9 v3 (S9: the bell read only after Redo)'
const ONLY = (process.env.ONLY || 's6d,s6p,s7d,s7p,s8d,s8p,s8bd,s8bp,s9d,s9p,s10d,s10p').split(',')
mkdirSync(L.OUT + '/taps', { recursive: true })
console.log(VERSION, L.URL_, L.OUT, ONLY.join(','))

const ALL = 'F/O/A'
const noSans = (pr, shown) => [!/SANS/.test(pr), 'no SANS refusal printed (a full offer, or not SANS that day)']
const exp = (days, f) => Object.fromEntries(days.map(d => [d, f(d)]))
/* the hidden sentence of his bell names exactly the hidden filed days */
const hidSentence = (want, notWant) => b => {
  const s = (b.sans || []).map(l => l.what).join(' ‖ ')
  const m = s.match(/Your SANS availability for ([^‖]*?) is hidden while you're not SANS (that day|those days)\./)
  const ok = !!m && want.every(d => new RegExp('\\b' + d + '\\b').test(m[1])) && notWant.every(d => !new RegExp('\\b' + d + '\\b').test(m[1]))
  return [ok, `a line saying "Your SANS availability for <${want.join(', ')}> … is hidden while you're not SANS ${want.length > 1 ? 'those days' : 'that day'}." (never ${notWant.join(', ') || '—'})`]
}
const recBell = b => ['REC', 'RECORD what his bell shows']

async function postAndFixtures(p, W, tag, from = '2026-07-17') {
  const po = await L.postOut(p, W, R, from, tag + '-po')
  W.rec(tag + '-po', `Leave War: Ranger's ${from} cell → ⋯ → Post out → SANS → Post out (read back)`, /becomes SANS/.test(po.line), `sheet line "${po.line}" · chips ${po.chips1} · record ${J(po.after)}`, po.pic)
  return /becomes SANS/.test(po.line)
}
async function fileRec(p, W, id, start, end, kinds, span, rmk) {
  const f = await X.file(p, W, start, end, kinds, span, rmk, id)
  W.rec(id, `Saber: Inputs → SANS → ${start} → + Commitment, Ranger, ${kinds.join('+')}, ${Array.isArray(span) ? span.join('–') : 'All day'}${end && end !== start ? ', dates to ' + end : ''}, remark "${rmk}", Add (read back)`, !!(f.rec && f.rec.who === R), `dates shown "${f.read}" · record ${J(f.rec)}${f.err ? ' · said "' + f.err + '"' : ''}${f.why ? ' · ' + f.why : ''}`, f.pic)
  return f
}

/* ---------- S6: the posting moved later (17 → 20), then back ---------- */
async function s6(p, W) {
  if (!(await postAndFixtures(p, W, 's6-01'))) return
  const f = await fileRec(p, W, 's6-02', '2026-07-17', '2026-07-21', ['fly', 'oft', 'amt'], 'all', 'W9 S6 offer')
  if (!f.iid) return
  const rec0 = await X.recOf(p, f.iid)
  const wv = await X.wave(p, W, '2026-07-17', 'AA1', '12:00', '13:30')
  const wv2 = await X.wave(p, W, '2026-07-21', 'AB1', '13:00', '14:30')
  const aa = await X.aaRow(p, W, '2026-07-18', 'SQN EVENT', '10:00', '12:00')
  W.rec('s6-03', 'board fixtures: Fri 17 + Wave AA1 12:00–13:30; Tue 21 + Wave AB1 13:00–14:30; Sat 18 Common Programme SQN EVENT 10:00–12:00 for ALL AVAIL (read back; Ranger holds nothing on 17–19 or 21)', !!(wv.f && wv2.f && aa.row && J(aa.row.who).includes('allavail')), `AA1 ${J(wv.f)} · AB1 ${J(wv2.f)} · event ${J(aa.row)}`, await W.pic(p, 's6-03-fixtures'))
  await L.closeBoard(p, W)
  const days = ['2026-07-17', '2026-07-18', '2026-07-19', '2026-07-20', '2026-07-21']
  const cfg = {
    days, iids: [f.iid],
    aa: [{ iso: '2026-07-18', rid: aa.row.rid, nm: 'SQN EVENT 10:00–12:00' }],
    seats: [{ iso: '2026-07-17', id: 'seat17', sel: `[data-slot="4.${wv.wi}.0.0.p"]`, nm: 'AA1 front seat', judge: noSans }, { iso: '2026-07-21', id: 'seat21', sel: `[data-slot="1.${wv2.wi}.0.0.p"]`, nm: 'AB1 front seat', judge: noSans }],
  }
  const A = await X.sweep(p, W, 's6-A', { ...cfg, expect: exp(days, () => ({ shown: true, letters: ALL })), bell: recBell })
  /* the posting moved later: 17 → 20 */
  const sh = await X.sheet(p, W, '2026-07-17', 's6-04')
  const mv = await X.sheetDate(p, W, '2026-07-20', 's6-04')
  const r1 = await X.rangerRec(p)
  W.rec('s6-04', `Ranger's posted-out sheet (${sh.kind}): PO from moved 17 → Mon 20 Jul (the date box, the app's calendar)`, mv.ok && /20 Jul/.test(mv.line + mv.date), `before: line "${sh.line}" date "${sh.date}" chips ${sh.chips} · after: line "${mv.line}" date "${mv.date}"${mv.err ? ' err "' + mv.err + '"' : ''} · record ${J(r1)}`, sh.pic + ', ' + mv.pic)
  await X.sheetClose(p, W)
  const hidden = d => d < '2026-07-20'
  await X.sweep(p, W, 's6-B', { ...cfg, base: A.month, expect: exp(days, d => ({ shown: !hidden(d), letters: ALL })), bell: hidSentence(['17', '18', '19'], ['20', '21']) })
  W.rec('s6-B-rec', 'the filing itself is kept while hidden (read back: one record, unchanged)', J(await X.recOf(p, f.iid)) === J(rec0), J(await X.recOf(p, f.iid)))
  /* back to 17 */
  const sh2 = await X.sheet(p, W, '2026-07-20', 's6-05')
  const mv2 = await X.sheetDate(p, W, '2026-07-17', 's6-05')
  W.rec('s6-05', `Ranger's posted-out sheet (${sh2.kind}, from his 20 Jul cell): PO from moved back 20 → Fri 17 Jul`, mv2.ok && /17 Jul/.test(mv2.line + mv2.date), `before: line "${sh2.line}" · after: line "${mv2.line}" date "${mv2.date}"${mv2.err ? ' err "' + mv2.err + '"' : ''} · record ${J(await X.rangerRec(p))}`, sh2.pic + ', ' + mv2.pic)
  await X.sheetClose(p, W)
  await X.sweep(p, W, 's6-C', { ...cfg, base: A.month, expect: exp(days, () => ({ shown: true, letters: ALL })), bell: recBell })
  const rec1 = await X.recOf(p, f.iid), n = await X.sansInputsOf(p)
  W.rec('s6-C-rec', 'restored by itself: the same one record — activities, hours, remarks and filer unchanged; no duplicate', J(rec1) === J(rec0) && n.length === 1, `before ${J(rec0)} · after ${J(rec1)} · his SANS records ${n.length}`)
}

/* the seat judges for a restricted offer */
const seatFly = (pr, shown) => shown ? [pr === 'SANS — not offering Fly', '"SANS — not offering Fly" (his offer active)'] : [!/SANS/.test(pr), 'no SANS reason (his offer hidden, not SANS that day)']
const seatOft = win => (pr, shown) => shown ? [pr === `SANS — available ${win} only`, `"SANS — available ${win} only" (his offer active)`] : [!/SANS/.test(pr), 'no SANS reason (his offer hidden, not SANS that day)']
const noHidLine = b => { const s = (b.sans || []).map(l => l.what).join(' ‖ '); return [!/is hidden while/.test(s), 'NO "hidden" line (a Quals untick writes none — as built, his question)'] }

/* ---------- S7 / S8: posting 17, filings Fri 17 (OFT 09:00–10:00) and Mon 20 (Fly, All day) ---------- */
async function s78world(p, W, tag) {
  if (!(await postAndFixtures(p, W, tag + '-01'))) return null
  const f17 = await fileRec(p, W, tag + '-02', '2026-07-17', null, ['oft'], ['09:00', '10:00'], `W9 ${tag} Fri`)
  const f20 = await fileRec(p, W, tag + '-03', '2026-07-20', null, ['fly'], 'all', `W9 ${tag} Mon`)
  if (!f17.iid || !f20.iid) return null
  const wv = await X.wave(p, W, '2026-07-17', 'AA1', '12:00', '13:30')
  const op = await X.sim(p, W, '2026-07-17', 'oft', 'OFTP', '14:00', '15:00')
  const aa = await X.aaRow(p, W, '2026-07-17', 'SQN EVENT', '15:30', '16:30')
  W.rec(tag + '-04', 'board fixtures on Fri 17 (Ranger clear all day): + Wave AA1 12:00–13:30; OFT row OFTP 14:00–15:00; Common Programme SQN EVENT 15:30–16:30 for ALL AVAIL (read back)', !!(wv.f && op.r && op.r.str && aa.row && J(aa.row.who).includes('allavail')), `AA1 ${J(wv.f)} · OFTP[${op.ri}] ${J(op.r)} · event ${J(aa.row)}`, await W.pic(p, tag + '-04-fixtures'))
  await L.closeBoard(p, W)
  const iids = [f17.iid, f20.iid]
  const recs0 = J([await X.recOf(p, f17.iid), await X.recOf(p, f20.iid)])
  return {
    iids, recs0, days: ['2026-07-17', '2026-07-20'],
    letters: { '2026-07-17': 'O', '2026-07-20': 'F' },
    aa: [{ iso: '2026-07-17', rid: aa.row.rid, nm: 'SQN EVENT 15:30–16:30' }],
    seats: [{ iso: '2026-07-17', id: 'seatAA1', sel: `[data-slot="4.${wv.wi}.0.0.p"]`, nm: 'AA1 front seat (Fly)', judge: seatFly },
            { iso: '2026-07-17', id: 'seatOFTP', sel: `[data-slot="s:4.oft.${op.ri}.p"]`, nm: 'OFTP 14:00–15:00 seat', judge: seatOft('09:00–10:00') }],
  }
}
const cfgOf = (w, shownFn) => ({ days: w.days, iids: w.iids, aa: w.aa, seats: w.seats, expect: Object.fromEntries(w.days.map(d => [d, { shown: shownFn(d), letters: w.letters[d] }])) })
async function recsSame(p, W, id, w) {
  const now = J(await Promise.all(w.iids.map(i => X.recOf(p, i))))
  const n = await X.sansInputsOf(p)
  W.rec(id, 'the filings themselves kept as filed: the same records (activities, hours, remarks, filer), no duplicate', now === w.recs0 && n.length === w.iids.length, `before ${w.recs0} · now ${now} · his SANS records ${n.length}`)
}

async function s7(p, W) {
  const w = await s78world(p, W, 's7'); if (!w) return
  const A = await X.sweep(p, W, 's7-A', { ...cfgOf(w, () => true), bell: recBell })
  const sh = await X.sheet(p, W, '2026-07-17', 's7-05')
  const undoBtn = p.locator('[data-testid="postout-undo"]:visible').first()
  const has = await undoBtn.count()
  if (has) { await W.press(p, undoBtn, 'postout-undo'); await sleep(700) }
  const st = await X.sheetState(p)
  const r1 = await X.rangerRec(p)
  const pic = await W.pic(p, 's7-05-undone')
  W.rec('s7-05', `Ranger's posted-out sheet (${sh.kind}) → "Undo post out (PO)": the posting gone`, !!has && r1.sanFrom == null && !r1.san, `sheet before: line "${sh.line}" chips ${sh.chips} · after: ${J(st)} · record ${J(r1)}`, sh.pic + ', ' + pic)
  await X.sheetClose(p, W)
  const lw = await L.lwCell(p, W, R, '2026-07-17')
  W.rec('s7-05b', "Leave War: his Fri 17 cell after the undo (read)", !/PO/.test(lw.text), `"${lw.text}"`, await W.pic(p, 's7-05b-cell'))
  await X.sweep(p, W, 's7-B', { ...cfgOf(w, () => false), base: A.month, bell: hidSentence(['17', '20'], []) })
  await recsSame(p, W, 's7-B-rec', w)
  if (!(await postAndFixtures(p, W, 's7-06'))) return
  await X.sweep(p, W, 's7-C', { ...cfgOf(w, () => true), base: A.month, bell: recBell })
  await recsSame(p, W, 's7-C-rec', w)
}

async function chipSans(p, W, tag, cellIso, want) {
  const sh = await X.sheet(p, W, cellIso, tag)
  const chip = p.locator('[data-testid="postout-sans"]:visible').first()
  const has = await chip.count()
  if (has) { await W.press(p, chip, 'postout-sans'); await sleep(700) }
  const st = await X.sheetState(p)
  const r = await X.rangerRec(p)
  const pic = await W.pic(p, tag + '-after')
  await X.sheetClose(p, W)
  return { sh, has, st, r, pic: sh.pic + ', ' + pic }
}
async function s8(p, W) {
  const w = await s78world(p, W, 's8'); if (!w) return
  const A = await X.sweep(p, W, 's8-A', { ...cfgOf(w, () => true), bell: recBell })
  const c1 = await chipSans(p, W, 's8-05', '2026-07-17')
  W.rec('s8-05', `Ranger's posted-out sheet (${c1.sh.kind}): the outcome changed away from SANS by tapping its chosen "✓ SANS" chip again (the sheet's Posting chips — no chip left chosen) (RECORD the control and the line)`, 'REC', `before: chips ${c1.sh.chips} line "${c1.sh.line}" · after: chips ${c1.st.chips} line "${c1.st.line}"${c1.st.err ? ' err "' + c1.st.err + '"' : ''} · record ${J(c1.r)}`, c1.pic)
  W.rec('s8-05b', 'the posting no longer SANS: no chip chosen, his record has no SANS date', !!c1.has && !/sans\[on\]/.test(c1.st.chips) && !c1.r.sanFrom, `chips ${c1.st.chips} · ${J(c1.r)}`)
  await X.sweep(p, W, 's8-B', { ...cfgOf(w, () => false), base: A.month, bell: hidSentence(['17', '20'], []) })
  await recsSame(p, W, 's8-B-rec', w)
  const c2 = await chipSans(p, W, 's8-06', '2026-07-17')
  W.rec('s8-06', `the same sheet: "SANS" tapped again, the same date (17 Jul)`, !!c2.has && /sans\[on\]/.test(c2.st.chips) && /17 Jul/.test(c2.st.line), `before: chips ${c2.sh.chips} line "${c2.sh.line}" · after: chips ${c2.st.chips} line "${c2.st.line}" · record ${J(c2.r)}`, c2.pic)
  await X.sweep(p, W, 's8-C', { ...cfgOf(w, () => true), base: A.month, bell: recBell })
  await recsSame(p, W, 's8-C-rec', w)
}

/* ---------- S8b: the same, once the posting has RUN (fresh set-up; clock to Mon 20) ---------- */
async function s8b(p, W) {
  if (!(await postAndFixtures(p, W, 's8b-01'))) return
  const f20 = await fileRec(p, W, 's8b-02', '2026-07-20', null, ['fly'], 'all', 'W9 s8b Mon')
  const f21 = await fileRec(p, W, 's8b-03', '2026-07-21', null, ['oft'], ['09:00', '10:00'], 'W9 s8b Tue')
  if (!f20.iid || !f21.iid) return
  const wv = await X.wave(p, W, '2026-07-21', 'AB1', '13:00', '14:30')
  const aa = await X.aaRow(p, W, '2026-07-21', 'SQN EVENT', '10:30', '11:30')
  W.rec('s8b-04', 'board fixtures on Tue 21 (Ranger clear): + Wave AB1 13:00–14:30; SQN EVENT 10:30–11:30 for ALL AVAIL (read back)', !!(wv.f && aa.row && J(aa.row.who).includes('allavail')), `AB1 ${J(wv.f)} · event ${J(aa.row)}`, await W.pic(p, 's8b-04-fixtures'))
  await L.closeBoard(p, W)
  const t = await X.moveClock(p, W, '2026-07-20T09:00:00')
  W.rec('s8b-05', "clock set to Mon 20 Jul 09:00 (setSystemTime), page reloaded, Saber signed in: the app's today; Ranger's record (the posting has run)", /Mon Jul 20 2026/.test(t), `${t} · ${J(await X.rangerRec(p))}`)
  const w = { iids: [f20.iid, f21.iid], recs0: J([await X.recOf(p, f20.iid), await X.recOf(p, f21.iid)]), days: ['2026-07-20', '2026-07-21'], letters: { '2026-07-20': 'F', '2026-07-21': 'O' },
    aa: [{ iso: '2026-07-21', rid: aa.row.rid, nm: 'SQN EVENT 10:30–11:30' }], seats: [{ iso: '2026-07-21', id: 'seatAB1', sel: `[data-slot="1.${wv.wi}.0.0.p"]`, nm: 'AB1 front seat (Fly)', judge: seatFly }] }
  const A = await X.sweep(p, W, 's8b-A', { ...cfgOf(w, () => true), bell: recBell })
  const c1 = await chipSans(p, W, 's8b-06', '2026-07-17')
  W.rec('s8b-06', `the RUN posting's sheet (${c1.sh.kind}): "✓ SANS" tapped again — the outcome away from SANS (RECORD what the sheet allows)`, 'REC', `before: chips ${c1.sh.chips} line "${c1.sh.line}"${c1.sh.locked ? ' locked "' + c1.sh.locked + '"' : ''} · after: chips ${c1.st.chips} line "${c1.st.line}"${c1.st.err ? ' err "' + c1.st.err + '"' : ''}${c1.st.blocked ? ' blocked "' + c1.st.blocked + '"' : ''} · record ${J(c1.r)}`, c1.pic)
  if (!c1.has || /sans\[on\]/.test(c1.st.chips)) { W.rec('s8b-07', 'the outcome could not be changed on a run posting — the rest of S8b', 'NW', 'the SANS chip still chosen / not offered'); return }
  await X.sweep(p, W, 's8b-B', { ...cfgOf(w, () => false), base: A.month, bell: hidSentence(['20', '21'], []) })
  await recsSame(p, W, 's8b-B-rec', w)
  const c2 = await chipSans(p, W, 's8b-07', '2026-07-17')
  W.rec('s8b-07', 'the same sheet: "SANS" tapped again, the same date', !!c2.has && /sans\[on\]/.test(c2.st.chips), `after: chips ${c2.st.chips} line "${c2.st.line}" · record ${J(c2.r)}`, c2.pic)
  await X.sweep(p, W, 's8b-C', { ...cfgOf(w, () => true), base: A.month, bell: recBell })
  await recsSame(p, W, 's8b-C-rec', w)
}

/* ---------- S9 / S10 world: posting 17; filings 18 (F all), 20 (O 09–10), 21 (A all), and 23 (F/O/A) or 22 (F) ---------- */
async function s910world(p, W, tag, last) {
  if (!(await postAndFixtures(p, W, tag + '-01'))) return null
  const fs = []
  const plan = [['2026-07-18', ['fly'], 'all', 'F'], ['2026-07-20', ['oft'], ['09:00', '10:00'], 'O'], ['2026-07-21', ['amt'], 'all', 'A'], last]
  for (const [i, [d, k, sp, l]] of plan.entries()) { const f = await fileRec(p, W, `${tag}-0${2 + i}`, d, null, k, sp, `W9 ${tag} ${d.slice(8)}`); if (!f.iid) return null; fs.push(f) }
  const wv = await X.wave(p, W, '2026-07-21', 'AB1', '13:00', '14:30')
  const aa = await X.aaRow(p, W, '2026-07-21', 'SQN EVENT', '10:30', '11:30')
  W.rec(tag + '-06', 'board fixtures on Tue 21 (Ranger clear): + Wave AB1 13:00–14:30; SQN EVENT 10:30–11:30 for ALL AVAIL (read back)', !!(wv.f && aa.row && J(aa.row.who).includes('allavail')), `AB1 ${J(wv.f)} · event ${J(aa.row)}`, await W.pic(p, tag + '-06-fixtures'))
  await L.closeBoard(p, W)
  const t = await X.moveClock(p, W, '2026-07-20T09:00:00')
  W.rec(tag + '-07', "clock set to Mon 20 Jul 09:00 (setSystemTime), reloaded, Saber signed in: the app's today; Ranger's record (the posting has run)", /Mon Jul 20 2026/.test(t), `${t} · ${J(await X.rangerRec(p))}`)
  const days = plan.map(x => x[0])
  return { iids: fs.map(f => f.iid), recs0: J(await Promise.all(fs.map(f => X.recOf(p, f.iid)))), days, letters: Object.fromEntries(plan.map(x => [x[0], x[3]])),
    aa: [{ iso: '2026-07-21', rid: aa.row.rid, nm: 'SQN EVENT 10:30–11:30' }], seats: [{ iso: '2026-07-21', id: 'seatAB1', sel: `[data-slot="1.${wv.wi}.0.0.p"]`, nm: 'AB1 front seat (Fly)', judge: seatFly }] }
}
async function undoRedo(p, W, which, tag) {
  const sel = which === 'undo' ? '#undoBtn:visible' : '#redoBtn:visible'
  const b = p.locator(sel).first()
  if (!(await b.count())) return { ok: false, said: 'no ' + which + ' button', pic: await W.pic(p, tag + '-no' + which) }
  const title = (await b.getAttribute('title').catch(() => '')) || ''
  await W.press(p, b, which); await sleep(700)
  const said = await L.toastSaid(p)
  return { ok: true, title, said, pic: await W.pic(p, tag + '-' + which) }
}
async function s9(p, W) {
  const w = await s910world(p, W, 's9', ['2026-07-23', ['fly', 'oft', 'amt'], 'all', 'F/O/A']); if (!w) return
  const A = await X.sweep(p, W, 's9-A', { ...cfgOf(w, () => true), bell: recBell })
  const q1 = await L.qualsTick(p, W, R, 's9-08')
  W.rec('s9-08', 'Saber: Quals → Pilots → ✎ Edit → Ranger\'s SANS cell (untick) → Done (read back)', q1.st && q1.st.san === false, J(q1.st), q1.pic)
  const hid = d => d >= '2026-07-20'
  await X.sweep(p, W, 's9-B', { ...cfgOf(w, d => !hid(d)), base: A.month, skipBell: 'read at s9-D: a sign-out here would clear the session Undo needs (D148), so his bell waits until after Redo' })
  await recsSame(p, W, 's9-B-rec', w)
  await L.go(p, 'editsched')
  const u = await undoRedo(p, W, 'undo', 's9-09')
  W.rec('s9-09', 'the top bar\'s Undo (same session)', u.ok && (await X.rangerRec(p)).san === true, `button "${u.title}" · note "${u.said}" · record ${J(await X.rangerRec(p))}`, u.pic)
  await X.sweep(p, W, 's9-C', { ...cfgOf(w, () => true), base: A.month, skipBell: 'read at s9-E (a sign-out here would clear the session Redo needs)' })
  await L.go(p, 'editsched')
  const r = await undoRedo(p, W, 'redo', 's9-10')
  W.rec('s9-10', 'the top bar\'s Redo', r.ok && (await X.rangerRec(p)).san === false, `button "${r.title}" · note "${r.said}" · record ${J(await X.rangerRec(p))}`, r.pic)
  await X.sweep(p, W, 's9-D', { ...cfgOf(w, d => !hid(d)), base: A.month, bell: noHidLine })
  const t = await X.moveClock(p, W, '2026-07-23T09:00:00')
  W.rec('s9-11', "clock set to Thu 23 Jul 09:00 (setSystemTime), reloaded, Saber signed in: the app's today", /Thu Jul 23 2026/.test(t), `${t} · ${J(await X.rangerRec(p))}`)
  const q2 = await L.qualsTick(p, W, R, 's9-12')
  W.rec('s9-12', 'Saber: Quals → Ranger\'s SANS ticked again on Thu 23 (read back)', q2.st && q2.st.san === true, J(q2.st), q2.pic)
  await X.sweep(p, W, 's9-E', { ...cfgOf(w, d => d === '2026-07-18' || d === '2026-07-23'), base: A.month, bell: recBell })
  await recsSame(p, W, 's9-E-rec', w)
}

async function restore(p, W, iso, tag) {
  await L.usersOpen(p, W)
  if (!(await p.locator('#accArchList').count())) await W.press(p, '#accArchToggle', 'arch-toggle')
  await W.press(p, `#accArchList [data-person="${R}"] .acc-tap`, 'arch-row')
  const pic0 = await W.pic(p, tag + '-restore-open')
  await W.press(p, '#accArPostIn', 'postin-box')
  const day = p.locator(`[data-iso="${iso}"]:visible`).first()
  if (await day.count()) await W.press(p, day, 'postin-day')
  await sleep(300)
  const val = ((await p.locator('#accArPostIn').innerText().catch(() => '')) || '').replace(/\s+/g, ' ').trim()
  const pic1 = await W.pic(p, tag + '-restore-date')
  await W.press(p, '#accArRestore', 'restore'); await sleep(700)
  const said = await L.toastSaid(p)
  return { val, said, st: await X.rangerRec(p), pic: [pic0, pic1, await W.pic(p, tag + '-restored')].join(', ') }
}
async function s10(p, W) {
  const w = await s910world(p, W, 's10', ['2026-07-22', ['fly'], 'all', 'F']); if (!w) return
  const A = await X.sweep(p, W, 's10-A', { ...cfgOf(w, () => true), bell: recBell })
  const ar = await L.archive(p, W, R, 's10-08')
  W.rec('s10-08', 'Saber: Admin → Users → Ranger → Archive, on Mon 20 (read back)', ar.archived, `note "${ar.said}" · record ${J(await X.rangerRec(p))}`, ar.pic)
  if (!ar.archived) return
  const cB = cfgOf(w, d => false)
  for (const d of w.days) cB.expect[d].absentOk = true
  cB.expect['2026-07-18'] = { rec: true, letters: 'F' }   // a day before the archive: RECORD (not published)
  await X.sweep(p, W, 's10-B', { ...cB, base: A.month, skipBell: 'an archived man has no sign-in (Admin → Users) — his bell cannot be opened' })
  await recsSame(p, W, 's10-B-rec', w)
  const t = await X.moveClock(p, W, '2026-07-22T09:00:00')
  W.rec('s10-09', "clock set to Wed 22 Jul 09:00 (setSystemTime), reloaded, Saber signed in: the app's today", /Wed Jul 22 2026/.test(t), t)
  const rs = await restore(p, W, '2026-07-22', 's10-10')
  W.rec('s10-10', 'Admin → Users → archived → Ranger → Post in Wed 22 Jul → Restore (read back; RECORD his SANS status after)', rs.st.archived === false && /22 Jul/.test(rs.val), `post-in "${rs.val}" · note "${rs.said}" · record ${J(rs.st)}`, rs.pic)
  if (rs.st.archived !== false) return
  const sansNow = !!rs.st.san
  W.rec('s10-10b', 'his SANS status after the restore (RECORD)', 'REC', `SANS ${sansNow} · from ${rs.st.sanFrom}`)
  const w3 = { ...w, days: ['2026-07-20', '2026-07-21', '2026-07-22'] }
  const cC = cfgOf(w3, d => d === '2026-07-22' && sansNow)
  for (const d of w3.days) cC.expect[d].absentOk = true
  await X.sweep(p, W, 's10-C', { ...cC, base: A.month, bell: recBell })
  await recsSame(p, W, 's10-C-rec', w)
}

const FN = { s6, s7, s8, s8b, s9, s10 }
for (const k of ONLY) { const m = k.match(/^(s\d+b?)([dp])$/); if (m && FN[m[1]]) await X.run(m[1], m[2], FN[m[1]]) }
L.saveResults('w9-' + (process.env.W9_RUN || 'run1') + '-' + ONLY.join('_'))
console.log('done')
