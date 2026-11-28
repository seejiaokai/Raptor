// NS — his question of 25 Nov 26 on the end-time guard rail: "What if no start time is indicated. Will it flag the same".
// The rule as drawn (draw-g.mjs) outlines only a missing END. These pictures show how the same rule would look if a
// missing START were flagged too, the way his first words put it ("every item must have a start and end time").
//
// Drawn on the REAL running app by .claude/skills/brainstorming/mockups-on-the-real-app.md, with kit.mjs. Every "today"
// frame is the app as it draws itself after staging through its own controls; every "proposed" frame adds only ONE
// class, `gw-notime`, to empty time boxes the app drew (the same rule as draw-g.mjs's `gw-noend`: the app's resting
// `.badtm` edge in its warning red, `--hard` #F0555F), or raises the app's own grey "Blocked:" note with drafted words.
//
// Staging, on the DESKTOP only, through the app's own boxes (one tap, select all, Backspace, Enter), on Thursday 16 Jul:
//   (a) wave 1 VL SAT keeps its four crew and its landing 14:10; its take-off 12:45 is cleared;
//   (b) the 1st-wave SXO desk keeps Shaft; its START 08:00 and END 14:00 are cleared;
//   (c) the OFT's first EP-4 (Haowen, Plasma) keeps its END 10:30; its START 09:00 is cleared;
//   and the demo's two AMT lines typed with a start and no end (BRIEF 11:00, DEBRIEF 12:30) are given ends, 11:30 and
//   13:00, so the day holds exactly the three items the drafted refusal counts. The store then goes to the phone.
// Also pictured, unstaged: Monday 13 Jul's ATTACH row for Bruise, the ONE item of the demo week as it ships that has
// something on it and no start — an all-day input landed with no times by design.
//
// The refusal words are a DRAFT owed a fresh Fable review (D2441), tagged so on the picture.
// Run from raptor-port/, against the build served on a free port:
//   GW_URL=http://localhost:4795/ node docs/mock/2026-11-25-guardrail-wording/draw-no-start.mjs
import * as K from './kit.mjs'
import path from 'node:path'
import { mkdirSync, renameSync } from 'node:fs'
const OUT = path.join(K.IMG, 'no-start'); mkdirSync(OUT, { recursive: true })
const NOTIME_CSS = `.gw-notime{box-shadow:inset 0 0 0 1px var(--hard)!important;border-radius:4px}
input.tm.gw-notime{border-color:var(--hard)!important;box-shadow:none!important}`
export const W = {
  sign: n => `Blocked: ${n} items are missing a time, each outlined in red. Type the times, then sign.`,
  publish: n => `Blocked: ${n} items are missing a time, each outlined in red. Thursday was not published.`,
}
const DI = 3
const TO = `#eWeek [data-txt="ff:${DI}.0.0.to"]`, LD = `#eWeek [data-txt="ff:${DI}.0.0.ld"]`, CS = `#eWeek [data-txt="ff:${DI}.0.0.cs"]`
const SEATP = `#eWeek [data-slot="${DI}.0.0.0.p"]`, SEATW = `#eWeek [data-slot="${DI}.0.0.0.w"]`
const DSTR = `#eWeek [data-txt="dr:${DI}.0.1.str"]`, DEND = `#eWeek [data-txt="dr:${DI}.0.1.end"]`, DROLE = `#eWeek [data-txt="dr:${DI}.0.1.role"]`, DESK = `#eWeek [data-slot="d:${DI}.0.1"]`
const SSTR = `#eWeek [data-txt="sr:${DI}.oft.0.str"]`, SEND = `#eWeek [data-txt="sr:${DI}.oft.0.end"]`, SLAB = `#eWeek [data-txt="sr:${DI}.oft.0.label"]`
const SIGN = `#eWeek [data-signbar="${DI}"]`, BEAK = `#eWeek [data-beak="${DI}"]`, DOW = `#eWeek .dow[data-crewday="${DI}"], #eWeek .dow[data-dayinfo="${DI}"]`
const RED = [TO, DSTR, DEND, SSTR]

async function shot(p, sz, name, sels, pad) {
  const f = await K.shot(p, sz, name, sels, pad)
  renameSync(path.join(K.IMG, f), path.join(OUT, f))
}
const red = (p, sels) => p.evaluate(sels => sels.forEach(s => [...document.querySelectorAll(s)].forEach(e => e.classList.add('gw-notime'))), sels)
const unred = p => p.evaluate(() => document.querySelectorAll('.gw-notime').forEach(e => e.classList.remove('gw-notime')))
const scrollTo = (p, sel) => p.evaluate(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getBoundingClientRect().width > 0); e && e.scrollIntoView({ block: 'center', inline: 'nearest' }) }, sel)

/* the combined rule worked out on a day's saved record: an item with something on it and a blank start or end */
const missing = (p, di) => p.evaluate(di => {
  const d = window.DAYS[di], t = v => String(v == null ? '' : v).trim(), out = []
  const chk = (kind, name, s, e, ppl, extra) => {
    const has = ppl.filter(Boolean).length || extra.some(x => t(x)) || t(s) || t(e)
    if (has && (!t(s) || !t(e))) out.push(`${kind} ${name}: start "${t(s)}" end "${t(e)}"`)
  }
  ;(d.allhands || []).forEach(r => chk('programme', r.prog, r.str, r.end, [r.who], [r.rmks]))
  ;(d.ground || []).forEach(r => chk('ground', r.prog, r.str, r.end, [r.who], [r.rmks]))
  ;(d.waves || []).forEach(w => w.formations.forEach(f => { if (!f.cx) chk('flight', w.label + ' ' + f.cs, f.to, f.ld, f.aircraft.flatMap(a => [a.p, a.w]), []) }))
  Object.keys(d.sims || {}).forEach(k => d.sims[k].forEach(r => chk('sim ' + k, r.label, r.str, r.end, [r.p, r.w, r.who, ...(r.pax || [])], [r.rmks])))
  ;(d.dutywaves || []).forEach(w => w.rows.forEach(r => chk('duty', r.role, r.str, r.end, [r.id], [])))
  return out
}, di)

async function stage(p) {
  await K.go(p, 'editsched')
  await K.setTxt(p, TO, '')
  await K.setTxt(p, DEND, '')
  await K.setTxt(p, DSTR, '')
  await K.setTxt(p, SSTR, '')
  await K.setTxt(p, `#eWeek [data-txt="sr:${DI}.amt.0.end"]`, '1130')
  await K.setTxt(p, `#eWeek [data-txt="sr:${DI}.amt.2.end"]`, '1300')
  const st = await p.evaluate(di => { const d = window.DAYS[di], f = d.waves[0].formations[0], r = d.dutywaves[0].rows[1], s = d.sims.oft[0]
    return { vl: { cs: f.cs, to: f.to, ld: f.ld, crew: f.aircraft.flatMap(a => [a.p, a.w]) }, desk: { role: r.role, id: r.id, str: r.str, end: r.end },
      oft: { label: s.label, str: s.str, end: s.end, p: s.p, w: s.w }, amt: d.sims.amt.map(x => x.label + ' ' + x.str + '-' + x.end) } }, DI)
  if (st.vl.to !== '' || st.vl.ld === '' || st.desk.id !== 'shaft' || st.desk.str !== '' || st.desk.end !== '' || st.oft.str !== '' || st.oft.end === '') throw new Error('staging did not land: ' + JSON.stringify(st))
  return st
}

/* the desktop stages in a world of its own and hands the store on; every picture, the desktop's too, is drawn from a
   fresh sign-in on that store, so nothing the staging clicks left lit (a picked man's rings) is in a picture */
async function stageWorld() {
  const { b, ctx, p, sz } = await K.world('d')
  await K.signIn(p)
  K.fact('NS', sz.name, 'staged Thursday', await stage(p))
  const f = await K.saveState(ctx, 'ns-staged')
  await b.close()
  return f
}

async function run(key, statePath) {
  const { b, p, sz } = await K.world(key, statePath)
  await K.signIn(p)
  await p.addStyleTag({ content: NOTIME_CSS })

  /* ---------- Monday as it ships: the ATTACH row (the one no-start item of the demo week) ---------- */
  await K.weekDay(p, sz, 0); await K.hideNote(p)
  const att = await p.evaluate(() => { const g = window.DAYS[0].ground; const i = g.findIndex(r => r.prog === 'ATTACH'); return { i, row: g[i] } })
  K.fact('NS', sz.name, 'Monday ATTACH row (as it ships)', att)
  const ASTR = `#eWeek [data-txt="gr:0.${att.i}.str"]`, AEND = `#eWeek [data-txt="gr:0.${att.i}.end"]`, APROG = `#eWeek [data-txt="gr:0.${att.i}.prog"]`, ASLOT = `#eWeek [data-slot="g:0.${att.i}"]`
  if (await p.locator(ASTR).filter({ visible: true }).count()) {
    await scrollTo(p, ASTR); await K.wait(p, 400); await K.neutral(p)
    const asels = [ASTR, AEND, APROG, ASLOT, `#eWeek [data-txt="gr:0.${att.i - 1}.str"]`]
    await K.markEl(p, ASTR, 'D')
    await shot(p, sz, 'ns-d-attach-today', asels, 20)
    await red(p, [ASTR, AEND]); await K.ringsOff(p)
    await shot(p, sz, 'ns-d-attach-if-flagged', asels, 20)
    await K.unmark(p); await unred(p)
  } else K.fact('NS', sz.name, 'Monday ATTACH row', 'its start box is not drawn on the week')

  await K.weekDay(p, sz, DI); await K.hideNote(p)
  const miss = await missing(p, DI)
  K.fact('NS', sz.name, 'Thursday: items a start-and-end rule would flag', miss)
  const warn = await p.evaluate(di => window.WARN.all.filter(w => w.di === di).map(w => w.code + ': ' + w.msg), DI)
  K.fact('NS', sz.name, 'Thursday warnings today', warn)

  /* ---------- (a) the flight: crew seated, no take-off ---------- */
  await scrollTo(p, TO); await K.wait(p, 400); await K.neutral(p)
  const asel = [TO, LD, CS, SEATP, SEATW]
  await K.markEl(p, TO, 'A')
  await shot(p, sz, 'ns-a-flight-today', asel, 24)
  await red(p, [TO]); await K.ringsOff(p)
  await shot(p, sz, 'ns-a-flight-proposed', asel, 24)
  await K.unmark(p); await unred(p)

  /* ---------- (b) the duty desk: a name, no START, no END ---------- */
  await scrollTo(p, DSTR); await K.wait(p, 400); await K.neutral(p)
  const bsel = [DSTR, DEND, DROLE, DESK, `#eWeek [data-txt="dr:${DI}.0.0.role"]`, `#eWeek [data-txt="dr:${DI}.0.2.end"]`]
  await K.markEl(p, DSTR, 'B')
  await shot(p, sz, 'ns-b-desk-today', bsel, 22)
  await red(p, [DSTR, DEND]); await K.ringsOff(p)
  await shot(p, sz, 'ns-b-desk-proposed', bsel, 22)
  await K.unmark(p); await unred(p)

  /* ---------- the sim box: crew, an END, no START (the third item the note counts) ---------- */
  await scrollTo(p, SSTR); await K.wait(p, 400); await K.neutral(p)
  const ssel = [SSTR, SEND, SLAB, `#eWeek [data-slot="s:${DI}.oft.0.p"]`, `#eWeek [data-slot="s:${DI}.oft.0.w"]`]
  await K.markEl(p, SSTR, 'C')
  await shot(p, sz, 'ns-a2-sim-today', ssel, 22)
  await red(p, [SSTR]); await K.ringsOff(p)
  await shot(p, sz, 'ns-a2-sim-proposed', ssel, 22)
  await K.unmark(p); await unred(p)

  /* ---------- (c) the refusal at a sign-off box, and at Publish day (DRAFT words) ---------- */
  await p.evaluate(sel => { const e = document.querySelector(sel); e.scrollIntoView({ block: 'end' }); window.scrollBy(0, 60) }, SIGN); await K.wait(p, 400)
  await red(p, RED)
  const n = miss.length
  await p.evaluate(m => window.toast(m, 'blocked'), W.sign(n)); await K.wait(p, 300); await K.holdNote(p)
  if (await p.evaluate(() => document.getElementById('toastEl').dataset.face || '') !== 'blocked') throw new Error('the note did not take the blocked face')
  await p.evaluate(sel => { const s = document.querySelector(sel).closest('.sgn'); s.classList.add('gwm'); s.setAttribute('data-gwtag', 'Pressed') }, `${SIGN} select[data-sign="cur"]`)
  await K.markEl(p, '#toastEl', 'DRAFT: words owed a Fable review')
  await shot(p, sz, 'ns-c-sign-refused', [DOW, SIGN, '#toastEl'], 12)
  await K.unmark(p); await K.hideNote(p)
  await p.evaluate(m => window.toast(m, 'blocked'), W.publish(n)); await K.wait(p, 300); await K.holdNote(p)
  await K.markEl(p, BEAK, 'Pressed'); await K.markEl(p, '#toastEl', 'DRAFT: words owed a Fable review')
  await shot(p, sz, 'ns-c2-publish-refused', [DOW, BEAK, SIGN, '#toastEl'], 12)
  await K.unmark(p); await K.hideNote(p); await unred(p)

  if (p.errs.length) K.fact('NS', sz.name, 'page errors', p.errs)
  await b.close()
}

const only = (process.env.GW_ONLY || 'd,p').split(',')
/* GW_FROM=1 picks up the store an earlier run staged in the scratch folder */
const state = process.env.GW_FROM ? `${K.STATE}/ns-staged.json` : await stageWorld()
if (only.includes('d')) await run('d', state)
if (only.includes('p')) await run('p', state)
K.saveFacts('no-start'); renameSync(path.join(K.IMG, 'facts-no-start.json'), path.join(OUT, 'facts-no-start.json'))
K.log('done')
