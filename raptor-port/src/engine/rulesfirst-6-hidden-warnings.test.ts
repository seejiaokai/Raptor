// @vitest-environment jsdom
/* RULES-FIRST REVIEW, family 6 — hidden warnings and the issue counts (W62–W67)
   ([ENGINE-RULES-REVIEW], D1983, 11 Nov 26). One test per worklist item (two where the ruling has two sharp edges), each
   led by the ruling's own words, on a small made-up week through the app's own doors: the ✕ / ↺'s own write
   (state/view.ts toggleWarnOff on warnMuteKey), validate(), the published book (setSign, setDayApproved, publishALDay),
   and every reader that COUNTS — the week's day bar (dayWarnHTML), the board's panel (boardWarnHTML), the ⓘ day details
   (dayInfoHTML) and Insights (computeInsights). Items an existing test already holds whole are named in the review's
   results, not repeated here. Harness: the earlier families' (every day emptied, the inputs cleared, the book reset, the
   roster restored), plus the working copy's hides cleared and an admin signed in, since only a scheduler hides. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS, isLateInput } from './inputs'
import { SCHED, setSign, setDayApproved, publishALDay, dayDelta, daySigned, dayInputsFrozen } from './publish'
import { VCONF } from './rules'
import { PEOPLE } from './people'
import { HOOKS } from './hooks'
import { validate, workingWarn, rawWarn, officialWarn, sevOf, chipOf } from './validate'
import { computeInsights } from './insights'
import { slotBar } from './avail'
import { setSlotVal } from './slots'
import { ensureRowIds } from './rowids'
import * as view from '../state/view'
import { setSession } from '../state/auth'
import { flagDrop, warnDelta } from '../state/dropflag'
import { dayWarnHTML, dayInfoHTML, fltNoLenShown } from '../ui/html'
import { boardWarnHTML } from '../ui/board'

const saved = { d: JSON.stringify(DAYS), i: JSON.stringify(INPUTS), book: JSON.stringify(SCHED), v: { ...VCONF }, p: JSON.stringify(PEOPLE) }
const MON = 0, TUE = 1
const day = (di: number): any => DAYS[di]
const ac = (p = '', w = '', rmks = '') => ({ p, w, rmks, area: '', opts: {} })
const form = (o: any = {}) => ({ cs: 'VL', msn: 'BFM', to: '12:00', ld: '13:00', br: '', rl: '', aircraft: [ac('bane')], ...o })
const wave = (forms: any[] = [form()], o: any = {}) => ({ label: 'WAVE 1', night: false, intimes: [], traffic: [], formations: forms, ...o })
const ground = (di: number, who: string, str: string, end: string, prog = 'BRIEFING') => { day(di).ground.push({ prog, str, end, who, more: [] }); return day(di).ground.length - 1 }
const ws = (di: number) => ((workingWarn().byDay[di] || {}).warns || []) as any[]
const find = (di: number, code: string, id?: string) => ws(di).find((w: any) => w.code === code && (!id || (w.who || []).includes(id)))
/* the ✕ / ↺ on a line — the write ui/interactions.ts runs inside its command */
const tap = (w: any) => { expect(w, 'the warning to hide is there').toBeTruthy(); return view.toggleWarnOff(view.warnMuteKey(w)) }
const sign = (di: number) => { setSign(di, 'cur', 'ignite'); setSign(di, 'sked', 'bane'); setSign(di, 'plan', 'stiff'); setSign(di, 'appr', 'pump') }
/* published, then the four signed again on the day as published — bound to "nothing pending", as the app's own sign-off of a published day is (a publish uses up the signatures it went out on) */
const publish = (di: number) => { validate(); sign(di); setDayApproved(di, true); validate(); sign(di) }
/* every place that COUNTS a day's issues, read the way each draws it */
function counts(di: number) {
  const n = (h: string, re: RegExp) => { const m = re.exec(h); return m ? +m[1]! : 0 }
  const week = n(dayWarnHTML(di), /⚠ (\d+) issue/), board = n(boardWarnHTML(di), /⚠ (\d+) issue/)
  const info = dayInfoHTML(di), sev = (k: string) => n(info, new RegExp(`<b class="${k}">(\\d+) `))
  const ins = computeInsights()
  return { week, board, info: sev('hard') + sev('adv') + sev('note'), insightsDay: ins.dayStats[di].warns, insightsWeek: ins.issues }
}
/* the day bar's colour, on the week and on the board */
const weekColour = (di: number) => (/class="daywarn ([a-z]+)"/.exec(dayWarnHTML(di)) || [])[1]
const boardColour = (di: number) => (/<div class="wh ([a-z]+)"/.exec(boardWarnHTML(di)) || [])[1]

beforeEach(() => {
  Object.assign(VCONF, { briefLead: 140, step: 60, dekit: 30, reportLead: 180, debrief: 120, crewRest: 720, longDay: 720, maxRun: 6, tightTurn: 60 })
  DAYS.forEach((d: any) => Object.assign(d, { waves: [], sims: { amt: [], oft: [] }, ground: [], allhands: [], dutywaves: [] }))
  INPUTS.splice(0); Object.assign(SCHED, { orig: {}, cur: {}, als: [], pending: {}, changes: {}, dayOK: {}, sign: {} })
  view.WARNOFF.clear(); setSession({ user: 'ad', role: 'admin' })
})
afterEach(() => {
  view.WARNOFF.clear()
  DAYS.splice(0, DAYS.length, ...JSON.parse(saved.d)); INPUTS.splice(0, INPUTS.length, ...JSON.parse(saved.i))
  Object.keys(SCHED).forEach(k => delete SCHED[k]); Object.assign(SCHED, JSON.parse(saved.book)); Object.assign(VCONF, saved.v)
  const p0 = JSON.parse(saved.p); Object.keys(PEOPLE).forEach(k => { if (!(k in p0)) delete (PEOPLE as any)[k] }); Object.assign(PEOPLE, p0)
  validate(); setSession(null)
})

/* Tuesday: one red (Ranger's VL clashes with his BRIEFING), one advisory (BOLT takes off and lands at 15:00), one note
   (Piston's 13h30 office day) — the three severities every counter must agree on */
function threeKinds() {
  day(TUE).waves.push(wave([form(), form({ cs: 'BOLT', to: '15:00', ld: '15:00', aircraft: [ac('stiff')] })]))
  ground(TUE, 'bane', '1200', '1230')
  ground(TUE, 'pump', '0600', '1930', 'OFFICE')
  validate()
}

describe('W62 — a hidden warning stays hidden for everyone until someone flags it again: no puck flag, the count drops it and says nothing, its line stays in place struck out (D469, D471, D472, D475)', () => {
  it('D469 / D472: hiding the red on a day of a red, an advisory and a note — the puck goes plain, the line keeps its index carrying `off`, the raw warning is untouched, and EVERY counter (week bar, board panel, ⓘ, Insights by day and by week) reads 2, none saying "hidden"', () => {
    threeKinds()
    const before = counts(TUE)
    expect(before, 'the premise: every counter reads the same 3').toEqual({ week: 3, board: 3, info: 3, insightsDay: 3, insightsWeek: 3 })
    const ix = ws(TUE).findIndex((w: any) => w.code === 'DOUBLE_BOOK')
    expect(sevOf(TUE, 'bane'), 'Ranger rings red before the hide').toBe('hard')
    tap(ws(TUE)[ix])
    expect(ws(TUE)[ix].code, 'the line keeps its place').toBe('DOUBLE_BOOK')
    expect(ws(TUE)[ix].off, '…and carries the hide').toBe(true)
    expect(rawWarn().byDay[TUE].warns.some((w: any) => w.code === 'DOUBLE_BOOK' && !w.off), 'the raw warning (what a version stores and the comparison reads) is never touched').toBe(true)
    expect(sevOf(TUE, 'bane') || null, '"the pucks shouldn\'t have flagging for that specific item"').toBe(null)
    expect(chipOf(TUE, 'bane') || null, 'no chip either').toBe(null)
    expect(counts(TUE), '"it should just show 2 issues" — on every counter').toEqual({ week: 2, board: 2, info: 2, insightsDay: 2, insightsWeek: 2 })
    expect(dayWarnHTML(TUE) + boardWarnHTML(TUE), '"no 1 hidden beside it"').not.toMatch(/\d+ hidden/i)
    /* the grey note hidden too — the counters still agree, one left */
    tap(find(TUE, 'LONGDAY', 'pump'))
    expect(counts(TUE)).toEqual({ week: 1, board: 1, info: 1, insightsDay: 1, insightsWeek: 1 })
    /* "until someone flags it again": the ↺ is the same write — back to 2 */
    tap(find(TUE, 'LONGDAY', 'pump'))
    expect(counts(TUE)).toEqual({ week: 2, board: 2, info: 2, insightsDay: 2, insightsWeek: 2 })
  })

  /* ANSWERED 11 Nov 26 (D2001, the rules check's Q7): a hidden clash stays hidden while the same man is on the same two
     items, whatever their times, and comes back when the man or either item is a different one. Flipped from the as-built
     reading, where a hide was tied to the clash's WORDS and a different line worded the same arrived already hidden. */
  it('D2001 (was 6.U1): the clash moved in time stays hidden; a different line of the same callsign and mission, clashing with the brief at another hour, SHOWS', () => {
    day(TUE).waves.push(wave([form()]))
    const gi = ground(TUE, 'bane', '1200', '1230')
    validate()
    const w0 = find(TUE, 'DOUBLE_BOOK', 'bane')
    expect(w0.msg, 'the clash\'s words carry no time').toBe('VL BFM & BRIEFING clash')
    tap(w0)
    /* the brief slid to 12:30–13:00: still a clash, the same words — still hidden */
    Object.assign(day(TUE).ground[gi], { str: '1230', end: '1300' }); validate()
    expect(find(TUE, 'DOUBLE_BOOK', 'bane').off, 'moved in time, still the same words, still hidden').toBe(true)
    /* Ranger taken off, the brief moved to 15:00, a second VL BFM in a new wave at 15:00 with Ranger on it */
    setSlotVal(`${TUE}.0.0.0.p`, ''); Object.assign(day(TUE).ground[gi], { str: '1500', end: '1530' })
    day(TUE).waves.push(wave([form({ to: '15:00', ld: '16:00' })], { label: 'WAVE 2' })); validate()
    const w2 = find(TUE, 'DOUBLE_BOOK', 'bane')
    expect(w2 && w2.msg, 'a clash of a different line at a different hour, worded the same').toBe('VL BFM & BRIEFING clash')
    expect(w2.off || false, 'D2001: a different line — the clash shows').toBe(false)
    expect(sevOf(TUE, 'bane'), '…and Ranger\'s puck on the new line carries its red flag').toBe('hard')
  })
  it('D2001 edges: the same two items keep the hide through a rename of the line and a re-timed brief; put back on the same line he returns struck (D479); a different man, or the brief replaced by another row, shows', () => {
    day(TUE).waves.push(wave([form({ aircraft: [ac('bane', 'stiff')] })]))
    const gi = ground(TUE, 'bane', '1200', '1230')
    ensureRowIds(DAYS); validate()
    tap(find(TUE, 'DOUBLE_BOOK', 'bane'))
    /* the line renamed and the brief re-timed: the same line and the same row */
    Object.assign(day(TUE).waves[0].formations[0], { cs: 'RAP', msn: 'ACM' }); Object.assign(day(TUE).ground[gi], { str: '1215', end: '1245' }); validate()
    expect(find(TUE, 'DOUBLE_BOOK', 'bane').msg, 'the words changed').toBe('RAP ACM & BRIEFING clash')
    expect(find(TUE, 'DOUBLE_BOOK', 'bane').off, 'the same two items: still hidden').toBe(true)
    /* taken off and put back on the same seat: struck at once (D479) */
    setSlotVal(`${TUE}.0.0.0.p`, ''); validate()
    expect(find(TUE, 'DOUBLE_BOOK', 'bane'), 'off the line, no clash').toBeUndefined()
    setSlotVal(`${TUE}.0.0.0.p`, 'bane'); validate()
    expect(find(TUE, 'DOUBLE_BOOK', 'bane').off, 'put back on the same line: returns struck').toBe(true)
    /* a different man on the same two items shows: his own hide was never made */
    day(TUE).ground[gi].more = ['stiff']; validate()
    expect(find(TUE, 'DOUBLE_BOOK', 'stiff').off || false, 'another man: shows').toBe(false)
    /* the brief deleted and a new BRIEFING row at the same time: a different item — shows */
    day(TUE).ground.splice(gi, 1); ground(TUE, 'bane', '1215', '1245'); ensureRowIds(DAYS); validate()
    expect(find(TUE, 'DOUBLE_BOOK', 'bane').off || false, 'a different row worded the same: shows').toBe(false)
  })

  /* The bug check of 12 Nov 26 (walker W2, Astra 1, the Opus read 1): the rules keep one warning for one man, code and
     wording, so a SECOND clash worded the same as a hidden one — the same line against another BRIEFING row — was folded
     into the hidden warning and arrived hidden. D2001: a different item shows. Each pair is now its own warning (the
     dedupe keeps the pair), so each is hidden by its own two items. A first fix that folded the second pair's items into
     the first warning was read again (the narrow read of the fix): a line hidden while it held both pairs came back
     when one row went — so the pair stays the unit. And the drop's red message counts only what was SHOWN before. */
  const dbl = () => ws(TUE).filter((w: any) => w.code === 'DOUBLE_BOOK' && (w.who || []).includes('bane'))
  it('D2001: a second clash worded the same as a hidden one (the same line against a second BRIEFING row) shows, and Ranger flags; take the second row away and the first stays hidden', () => {
    day(TUE).waves.push(wave([form()]))
    ground(TUE, 'bane', '1200', '1230')
    ensureRowIds(DAYS); validate()
    tap(find(TUE, 'DOUBLE_BOOK', 'bane'))
    expect(sevOf(TUE, 'bane') || null, 'the premise: hidden, no flag').toBe(null)
    const before = workingWarn()
    const g2 = ground(TUE, 'bane', '1230', '1300')
    ensureRowIds(DAYS); validate()
    expect(dbl().map((w: any) => !!w.off), 'two clashes, each its own line: the hidden one stays hidden, the new one shows').toEqual([true, false])
    expect(sevOf(TUE, 'bane'), '…and Ranger\'s puck carries the red flag').toBe('hard')
    expect(warnDelta(before, workingWarn()).filter((w: any) => w.code === 'DOUBLE_BOOK').length, 'the drop names the new clash in red, never the "already on" note of a hidden one (D479)').toBe(1)
    day(TUE).ground.splice(g2, 1); validate()
    expect(dbl().map((w: any) => !!w.off), 'the second row gone: the first clash is hidden as before').toEqual([true])
    expect(sevOf(TUE, 'bane') || null).toBe(null)
  })
  it('D2001: two clashes worded the same from the start — hide both; one row deleted or moved away, the clash left is one he hid and stays hidden', () => {
    day(TUE).waves.push(wave([form()]))
    ground(TUE, 'bane', '1200', '1230'); const g2 = ground(TUE, 'bane', '1230', '1300')
    ensureRowIds(DAYS); validate()
    expect(dbl().length, 'two lines, one a pair').toBe(2)
    tap(dbl()[0]); tap(dbl()[1])
    expect(sevOf(TUE, 'bane') || null, 'both hidden').toBe(null)
    Object.assign(day(TUE).ground[g2], { str: '1500', end: '1530' }); validate()
    expect(dbl().map((w: any) => !!w.off), 'the second row moved away: the first clash, hidden, stays hidden').toEqual([true])
    Object.assign(day(TUE).ground[g2], { str: '1230', end: '1300' }); validate()
    expect(dbl().map((w: any) => !!w.off), 'moved back: the same two items, still hidden (whatever their times)').toEqual([true, true])
    day(TUE).ground.splice(g2, 1); validate()
    expect(dbl().map((w: any) => !!w.off), 'deleted: the one left stays hidden').toEqual([true])
  })

  // RULES-FIRST FINDING 6.1 (11 Nov 26, [ENGINE-RULES-REVIEW]): two lines worded alike share one warning, and hiding it plained only the first line's amber time box — the second kept its flag. Fixed by [RULES-CHECK-FIXES] (F3): the box also asks for a hidden warning in its own words.
  it('6.1 — two flying lines worded the same (no callsign, both in "WAVE 1", both 15:00–15:00): the rules keep ONE warning (the original\'s dedupe); hide it and the amber time box must go from BOTH lines (D469 "the pucks shouldn\'t have flagging for that specific item")', () => {
    day(TUE).waves.push(wave([form({ cs: '', to: '15:00', ld: '15:00' }), form({ cs: '', to: '15:00', ld: '15:00', aircraft: [ac('stiff')] })]))
    validate()
    const fl = ws(TUE).filter((w: any) => w.code === 'FLT_NO_LEN')
    expect(fl.length, 'the original keeps one warning for the two identical lines').toBe(1)
    const f0 = day(TUE).waves[0].formations[0], f1 = day(TUE).waves[0].formations[1]
    expect([fltNoLenShown(TUE, `ff:${TUE}.0.0`, f0), fltNoLenShown(TUE, `ff:${TUE}.0.1`, f1)], 'both lines wear the amber box before the hide').toEqual([true, true])
    tap(fl[0])
    expect(counts(TUE).week, 'the day counts nothing').toBe(0)
    expect([fltNoLenShown(TUE, `ff:${TUE}.0.0`, f0), fltNoLenShown(TUE, `ff:${TUE}.0.1`, f1)], 'hidden: neither line flags').toEqual([false, false])
  })
})

describe('W63 — with a warning hidden the bar\'s colour follows what is left, a man keeps the flag of the warning still showing, and a hidden crew-rest warning drops the dotted mark on the day before (D475)', () => {
  it('hide the only red: the week\'s bar AND the board\'s heading turn amber; hide the advisory too: both grey (the note left)', () => {
    threeKinds()
    expect([weekColour(TUE), boardColour(TUE)]).toEqual(['hard', 'hard'])
    tap(find(TUE, 'DOUBLE_BOOK', 'bane'))
    expect([weekColour(TUE), boardColour(TUE)], '"hide the only red one and it turns amber"').toEqual(['adv', 'adv'])
    tap(find(TUE, 'FLT_NO_LEN'))
    expect([weekColour(TUE), boardColour(TUE)]).toEqual(['note', 'note'])
  })

  /* where D475's dotted mark meets D183 (the mark is LIVE on a published face) and D471 (a hide on a published day waits) */
  function breach() {
    day(MON).waves.push(wave([form({ cs: 'LATE', to: '20:00', ld: '21:00' })]))   // Ranger's Monday ends 23:00 (debrief 2h)
    day(TUE).waves.push(wave([form({ to: '12:00', ld: '13:00' })]))               // reports 09:00 Tuesday: 10h of rest
    validate()
    expect(find(TUE, 'CREW_REST', 'bane'), 'the premise: Tuesday\'s crew-rest breach').toBeTruthy()
    expect(workingWarn().trace[MON]?.bane, 'and Monday\'s dotted "breaks tomorrow\'s crew rest" mark').toBeTruthy()
    expect(officialWarn().trace[MON]?.bane).toBeTruthy()
  }
  it('the breach\'s day (Tuesday) PUBLISHED: the hide waits there, so the published face keeps Monday\'s dotted mark until the amendment, while Edit Schedule drops it at once', () => {
    breach(); publish(TUE)
    tap(find(TUE, 'CREW_REST', 'bane'))
    expect(workingWarn().trace[MON]?.bane || null, 'Edit Schedule (the working copy): the mark goes with the hide').toBe(null)
    expect(officialWarn().trace[MON]?.bane, 'View-only Sched: the mark follows Tuesday\'s ISSUED hides — still there').toBeTruthy()
    expect(dayDelta(TUE).length, 'the hide reads pending on Tuesday (D471)').toBeGreaterThan(0)
    sign(TUE); publishALDay(TUE); validate()
    expect(officialWarn().trace[MON]?.bane || null, 'the amendment out: the face drops it too').toBe(null)
  })
  it('the day before (Monday) PUBLISHED, the breach\'s day a draft: the hide is at once, so the published Monday drops its live dotted mark at once — and Monday reads nothing pending (D183: the mark is not stored, not compared)', () => {
    breach(); publish(MON)
    tap(find(TUE, 'CREW_REST', 'bane'))
    expect(officialWarn().trace[MON]?.bane || null, 'the face of published Monday').toBe(null)
    expect(dayDelta(MON), 'Monday has nothing waiting').toEqual([])
    expect(daySigned(MON), 'its four sign-offs stand').toBe(true)
  })
})

describe('W64 — the amber "already on …" note stays: a drop that recreates a clash already hidden still says once, to the scheduler doing it, that the man is busy then (D479)', () => {
  it('Ranger\'s hidden clash, taken off and put back: no red message (the drop delta is silent, the clash arrives struck), and the fallback note names the brief he is already on', () => {
    day(TUE).waves.push(wave([form()]))
    ground(TUE, 'bane', '1200', '1230', 'APPOINTMENT')
    validate()
    tap(find(TUE, 'DOUBLE_BOOK', 'bane'))
    const key = `${TUE}.0.0.0.p`
    setSlotVal(key, ''); validate()
    expect(find(TUE, 'DOUBLE_BOOK', 'bane'), 'off the line, no clash').toBeFalsy()
    const said: string[] = [], was = HOOKS.toast
    HOOKS.toast = ((m: string) => { said.push(m) }) as any
    try {
      const before = workingWarn()
      setSlotVal(key, 'bane'); validate()
      expect(find(TUE, 'DOUBLE_BOOK', 'bane').off, '"its line back already struck"').toBe(true)
      expect(warnDelta(before, workingWarn()), 'nothing NEW to shout about — the hidden clash is not news').toEqual([])
      expect(flagDrop(before, TUE), 'the drop delta stays silent').toBe(false)
      expect(said, 'no red message').toEqual([])
      /* …so the drop falls back to slotBar, asked of the place he landed on (drag.ts barDrop / view.ts's tap) */
      expect(slotBar('bane', key), '"Saint — already on APPOINTMENT 14:00–16:00" (his example), here Ranger\'s').toMatch(/^already on APPOINTMENT 12:00–12:30/)
    } finally { HOOKS.toast = was }
  })
})

describe('W65 — Insights does not count a hidden warning, by the hides each day\'s LATEST PUBLISHED version went out with; the working copy\'s only for a day not yet published (D472, D478; beside it D477, D482)', () => {
  it('a draft Monday\'s hide moves Insights at once; a published Tuesday\'s waits for its amendment — the day figures, the week\'s total and "by type" alike', () => {
    day(MON).waves.push(wave([form()])); ground(MON, 'bane', '1200', '1230')
    day(TUE).waves.push(wave([form()])); ground(TUE, 'bane', '1200', '1230')
    validate(); publish(TUE)
    let I = computeInsights()
    expect([I.dayStats[MON].warns, I.dayStats[TUE].warns, I.issues, I.byType.DOUBLE_BOOK]).toEqual([1, 1, 2, 2])
    tap(find(MON, 'DOUBLE_BOOK', 'bane')); tap(find(TUE, 'DOUBLE_BOOK', 'bane'))
    I = computeInsights()
    expect([I.dayStats[MON].warns, I.dayStats[TUE].warns, I.issues, I.byType.DOUBLE_BOOK || 0], 'Monday at once; Tuesday held until it goes out').toEqual([0, 1, 1, 1])
    expect(counts(TUE).week, 'Edit Schedule\'s Tuesday bar is the working copy: it drops at once (the page, not Insights)').toBe(0)
    sign(TUE); publishALDay(TUE); validate()
    I = computeInsights()
    expect([I.dayStats[TUE].warns, I.issues, I.byType.DOUBLE_BOOK || 0], 'the amendment out: Tuesday drops too').toEqual([0, 0, 0])
  })
})

describe('W66 — a LATE mark dropped on a published day leaves the issued schedule at once: nothing reads pending and the four sign-offs stay — never waiting, as a hidden warning does (D1621; beside it D1586, D1620, D471)', () => {
  it('Ranger\'s late Meeting on published Tuesday: the drop pends nothing and keeps the four, the issued copy of the input loses the mark at once — while a warning hidden on the same day waits and takes the four down', () => {
    day(TUE).waves.push(wave([form()]))
    const r: any = { person: 'bane', by: 'bane', at: '2026-07-01T08:00:00.000Z', type: 'Meeting', date: 'Jul 14', yr: 2026, allday: false, s: 720, e: 750, remarks: 'D1621', mod: '2026-07-13' }
    INPUTS.push(r); validate()
    expect(isLateInput(r), 'the premise: it is late').toBe(true)
    expect(find(TUE, 'DOUBLE_BOOK', 'bane') || find(TUE, 'INPUT_FLY', 'bane'), 'the premise: it clashes with his VL, so a warning stands on the day').toBeTruthy()
    publish(TUE)
    expect([dayDelta(TUE).length, daySigned(TUE)], 'published, nothing waiting').toEqual([0, true])
    expect(view.setLateOff(r, true), 'the drop (an admin)').toBe(true); validate()
    expect(dayDelta(TUE), '"nothing reads pending"').toEqual([])
    expect(daySigned(TUE), '"the four sign-offs stay"').toBe(true)
    const frozen = Object.values(dayInputsFrozen(TUE)).find((x: any) => x.remarks === 'D1621')
    expect(view.lateShown(frozen), '"leaves the issued schedule at once" — the face\'s copy reads the live drop').toBe(false)
    /* the deliberate opposite, D471: a hide on the same published day waits and takes the four down */
    tap(ws(TUE).find((w: any) => (w.who || []).includes('bane')))
    expect(dayDelta(TUE).length, 'the hide is a change waiting').toBeGreaterThan(0)
    expect(daySigned(TUE), 'and the four fall').toBe(false)
  })
})
