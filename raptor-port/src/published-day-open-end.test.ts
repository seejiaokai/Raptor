// @vitest-environment jsdom
/* A PUBLISHED DAY'S ROW WITH NO END KEEPS THE LENGTH IT WAS PUBLISHED UNDER (owner D2028, 13 Nov 26 — "Questions 1 and 2
   as recommended": "the published day keeps its 1h until its next amendment, with no pending mark"). His case: a
   published Saturday's "Briefing" at 09:00 with no end, ALL AVAIL on it; "Any other row" 1h → 2h on the Logic page.
   Three readers took today's setting (the plan: docs/superpowers/plans/2026-11-13-d2028-open-end-published-plan.md):
   the ALL AVAIL window's title, the crowd behind the placeholder on the working copy — which read "1 pending" from the
   Logic change alone wherever the two crowds differ — and every other placeholder's crowd, through who is busy.
   The crowd resolver here is the app's own rule for who is busy (avail.ts personBusy), over four named men — the Leave
   War's resolver (leavewar/sync.ts availableFor) asks the same body. Harness from published-day-logic-reads.test.ts. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './engine/data'
import { INPUTS } from './engine/inputs'
import { SCHED, setSign, setDayApproved, publishALDay, dayDelta, daySigned, dayCurVer, daySnapOf } from './engine/publish'
import { VCONF, SHIFT_HARD } from './engine/rules'
import { HOOKS } from './engine/hooks'
import { validate } from './engine/validate'
import { personBusy } from './engine/avail'
import { ensureRowIds } from './engine/rowids'
import { rowItemKey } from './engine/oil'
import { oilEvidenceOf, oilSentOf } from './engine/oilev'
import { oilItemLabel } from './ui/oilmode'
import { withChipWorld } from './ui/html'
import { setSession } from './state/auth'

const saved = { d: JSON.stringify(DAYS), i: JSON.stringify(INPUTS), book: JSON.stringify(SCHED), v: { ...VCONF }, s: { ...SHIFT_HARD },
  earn: HOOKS.oilEarningDay, iso: HOOKS.oilDayISO, sent: HOOKS.oilSentinel, hk: HOOKS.hiddenKeys }
const TUE = 1, WED = 2
const MEN = ['bane', 'ignite', 'stiff', 'pump']
const day = (di: number): any => DAYS[di]
const sign = (di: number) => { setSign(di, 'cur', 'ignite'); setSign(di, 'sked', 'bane'); setSign(di, 'plan', 'stiff'); setSign(di, 'appr', 'pump') }
const publish = (di: number) => { validate(); sign(di); setDayApproved(di, true); validate(); sign(di) }
const item = (r: any) => rowItemKey(r.rid)
const crowd = (di: number, r: any) => [...oilSentOf(oilEvidenceOf(di), item(r)).people].sort()
const title = (di: number, r: any) => oilItemLabel(di, item(r)).when
const issuedTitle = (di: number, r: any, ver?: any) => withChipWorld(di, ver || dayCurVer(di), true, () => oilItemLabel(di, item(r)).when)
const issuedCrowd = (di: number, r: any, ver?: any) => [...(((daySnapOf(di, ver || dayCurVer(di)) as any).d.oilev.sent || {})[item(r)] || [])].sort()

/* his case on Tuesday: "Briefing" 09:00, no end, ALL AVAIL; bane has a ground row 10:15–10:45, so the one-hour crowd
   holds him and the two-hour crowd does not */
function hisCase(di: number) {
  day(di).allhands.push({ prog: 'Briefing', str: '09:00', end: '', who: ['allavail'] })
  day(di).ground.push({ prog: 'DENTAL', str: '10:15', end: '10:45', who: 'bane' })
  ensureRowIds(DAYS)
  return day(di).allhands[0]
}

beforeEach(() => {
  Object.assign(VCONF, saved.v, { openEnd: 60, simLen: 90, step: 60, dekit: 30 })
  Object.assign(SHIFT_HARD, saved.s)
  DAYS.forEach((d: any) => Object.assign(d, { waves: [], sims: { amt: [], oft: [] }, ground: [], allhands: [], dutywaves: [], oild: undefined }))
  INPUTS.splice(0); Object.assign(SCHED, { orig: {}, cur: {}, als: [], pending: {}, changes: {}, added: {}, dayOK: {}, sign: {}, signBind: {}, retired: {}, correcting: {}, drafts: {}, curDraft: {} })
  setSession({ user: 'ad', role: 'admin' } as any)
  HOOKS.hiddenKeys = null
  HOOKS.oilEarningDay = () => false                       // a weekday: nobody earns, the crowd is all the day's OIL block holds (D44)
  HOOKS.oilDayISO = (di: number) => `2026-07-${14 + di}`
  HOOKS.oilSentinel = (_iso: string, win: [number, number], d: any) =>
    MEN.filter(id => !personBusy(d, id).some((w: [number, number]) => w[0] < win[1] && win[0] < w[1]))
})
afterEach(() => {
  HOOKS.oilEarningDay = saved.earn; HOOKS.oilDayISO = saved.iso; HOOKS.oilSentinel = saved.sent; HOOKS.hiddenKeys = saved.hk
  DAYS.splice(0, DAYS.length, ...JSON.parse(saved.d)); INPUTS.splice(0, INPUTS.length, ...JSON.parse(saved.i))
  Object.keys(SCHED).forEach(k => delete (SCHED as any)[k]); Object.assign(SCHED, JSON.parse(saved.book)); Object.assign(VCONF, saved.v)
  Object.assign(SHIFT_HARD, saved.s)
  validate(); setSession(null)
})

describe('D2028 — his case: a published day\'s "Briefing" 09:00 with no end, ALL AVAIL on it; "Any other row" 1h → 2h', () => {
  it('premise: published under 1h, the window reads an hour and the crowd holds the man busy at 10:15', () => {
    const r = hisCase(TUE); publish(TUE)
    expect(title(TUE, r)).toContain('09:00–10:00 · no end time, an hour assumed')
    expect(crowd(TUE, r)).toEqual([...MEN].sort())
    expect(issuedCrowd(TUE, r)).toEqual([...MEN].sort())
    expect(dayDelta(TUE)).toEqual([])
  })
  it('the Logic change alone raises no pending mark and takes no sign-off down', () => {
    const r = hisCase(TUE); publish(TUE)
    expect(daySigned(TUE), 'premise: signed').toBe(true)
    VCONF.openEnd = 120; validate()
    expect(dayDelta(TUE), 'nothing waits on the published day').toEqual([])
    expect(daySigned(TUE), 'the four stay').toBe(true)
    expect(crowd(TUE, r), 'Edit Schedule and the board: the crowd it went out with').toEqual([...MEN].sort())
  })
  it('the window keeps "an hour assumed" — on the issued face and on the working copy nothing waits on', () => {
    const r = hisCase(TUE); publish(TUE)
    VCONF.openEnd = 120; validate()
    expect(issuedTitle(TUE, r), 'View-only Sched').toContain('09:00–10:00 · no end time, an hour assumed')
    expect(title(TUE, r), 'Edit Schedule, the board').toContain('09:00–10:00 · no end time, an hour assumed')
  })
  it('a day not yet published takes the new length at once', () => {
    const r = hisCase(WED); validate()
    VCONF.openEnd = 120; validate()
    expect(title(WED, r)).toContain('09:00–11:00 · no end time, 2 hours assumed')
    expect(crowd(WED, r)).toEqual(['ignite', 'pump', 'stiff'])
  })
  it('once something else waits, the working copy previews the next amendment under today\'s 2h (D2013); put back, it is the published hour again and nothing waits (D98)', () => {
    const r = hisCase(TUE); publish(TUE)
    VCONF.openEnd = 120; validate()
    day(TUE).ground.push({ prog: 'ADMIN', str: '14:00', end: '15:00', who: 'pump' }); ensureRowIds(DAYS); validate()
    expect(dayDelta(TUE).length, 'premise: the added row waits').toBeGreaterThan(0)
    expect(title(TUE, r), 'the next amendment, today\'s setting').toContain('09:00–11:00 · no end time, 2 hours assumed')
    expect(crowd(TUE, r)).toEqual(['ignite', 'pump', 'stiff'])
    expect(issuedTitle(TUE, r), 'View-only Sched keeps what went out').toContain('09:00–10:00 · no end time, an hour assumed')
    day(TUE).ground.pop(); validate()
    expect(dayDelta(TUE), 'back to what was published').toEqual([])
    expect(title(TUE, r)).toContain('09:00–10:00 · no end time, an hour assumed')
    expect(crowd(TUE, r)).toEqual([...MEN].sort())
  })
  it('the next amendment goes out under today\'s 2h — its crowd frozen over two hours — and the original, looked at, keeps its hour', () => {
    const r = hisCase(TUE); publish(TUE)
    const orig = dayCurVer(TUE)
    VCONF.openEnd = 120; validate()
    day(TUE).ground.push({ prog: 'ADMIN', str: '14:00', end: '15:00', who: 'pump' }); ensureRowIds(DAYS); validate()
    sign(TUE); publishALDay(TUE); validate()
    expect(dayCurVer(TUE), 'premise: a new version went out').not.toBe(orig)
    expect(issuedTitle(TUE, r)).toContain('09:00–11:00 · no end time, 2 hours assumed')
    expect(issuedCrowd(TUE, r)).toEqual(['ignite', 'pump', 'stiff'])
    expect(dayDelta(TUE)).toEqual([])
    expect(withChipWorld(TUE, orig, false, () => oilItemLabel(TUE, item(r)).when), 'a look at the original').toContain('09:00–10:00 · no end time, an hour assumed')
    expect(issuedCrowd(TUE, r, orig)).toEqual([...MEN].sort())
  })
})

describe('D2028 — the sim twin: a sim with a start and no end, "A sim" 1h30 → 3h', () => {
  it('the published day keeps its crowd, its window and its sign-offs', () => {
    day(TUE).sims.oft.push({ label: 'BFM-9', str: '09:00', end: '', p: 'allavail', w: '', rmks: '' })
    day(TUE).ground.push({ prog: 'DENTAL', str: '10:45', end: '11:15', who: 'bane' })
    ensureRowIds(DAYS)
    const r = day(TUE).sims.oft[0]; publish(TUE)
    const was = title(TUE, r)
    expect(was, 'premise').toContain('09:00–10:30')
    expect(crowd(TUE, r), 'premise').toEqual([...MEN].sort())
    VCONF.simLen = 180; validate()
    expect(dayDelta(TUE)).toEqual([])
    expect(daySigned(TUE)).toBe(true)
    expect(crowd(TUE, r)).toEqual([...MEN].sort())
    expect(title(TUE, r)).toBe(was)
    expect(issuedTitle(TUE, r)).toBe(was)
  })
})

describe('D2028 — another row\'s crowd: a NAMED man on the open-ended row is busy for the published hour, not today\'s', () => {
  it('"Briefing" 09:00 no end holds stiff; a second row 10:15–11:00 holds ALL AVAIL: 1h → 2h leaves its crowd and the day alone', () => {
    day(TUE).allhands.push({ prog: 'Briefing', str: '09:00', end: '', who: ['stiff'] })
    day(TUE).allhands.push({ prog: 'Tasking', str: '10:15', end: '11:00', who: ['allavail'] })
    ensureRowIds(DAYS)
    const r = day(TUE).allhands[1]; publish(TUE)
    expect(crowd(TUE, r), 'premise: stiff is free from 10:00').toEqual([...MEN].sort())
    VCONF.openEnd = 120; validate()
    expect(dayDelta(TUE), 'the Logic change alone').toEqual([])
    expect(daySigned(TUE)).toBe(true)
    expect(crowd(TUE, r)).toEqual([...MEN].sort())
  })
})

describe('D2005 — the same for the step time: a flying man beside a placeholder row', () => {
  it('bane takes off 12:00 (step 60 → busy from 11:00); ALL AVAIL 10:00–10:45; step 60 → 150 leaves the published day alone', () => {
    day(TUE).waves.push({ label: 'WAVE 1', night: false, intimes: [], traffic: [], formations: [
      { cs: 'VL', msn: 'BFM', to: '12:00', ld: '13:00', br: '', rl: '', aircraft: [{ p: 'bane', w: '', rmks: '', area: '', opts: {} }] }] })
    day(TUE).allhands.push({ prog: 'Tasking', str: '10:00', end: '10:45', who: ['allavail'] })
    ensureRowIds(DAYS)
    const r = day(TUE).allhands[0]; publish(TUE)
    expect(crowd(TUE, r), 'premise: bane free until 11:00').toEqual([...MEN].sort())
    VCONF.step = 150; validate()
    expect(dayDelta(TUE), 'the Logic change alone').toEqual([])
    expect(daySigned(TUE)).toBe(true)
    expect(crowd(TUE, r)).toEqual([...MEN].sort())
  })
})

describe('kept as it is — a real change behind the puck still reads pending', () => {
  it('a man behind the puck given a row inside the published hour: the crowd changed, the day reads pending, the four fall (D44, D45, D103)', () => {
    const r = hisCase(TUE); publish(TUE)
    day(TUE).ground.push({ prog: 'ADMIN', str: '09:15', end: '09:45', who: 'pump' }); ensureRowIds(DAYS); validate()
    expect(dayDelta(TUE).length).toBeGreaterThan(0)
    expect(daySigned(TUE)).toBe(false)
    expect(crowd(TUE, r)).toEqual(['bane', 'ignite', 'stiff'])
  })
  it('with the setting changed too, the same real change is still seen', () => {
    const r = hisCase(TUE); publish(TUE)
    VCONF.openEnd = 120; validate()
    day(TUE).ground.push({ prog: 'ADMIN', str: '09:15', end: '09:45', who: 'pump' }); ensureRowIds(DAYS); validate()
    expect(dayDelta(TUE).some((e: any) => String(e.addr).startsWith('oil:')), 'the crowd is part of what waits').toBe(true)
    expect(daySigned(TUE)).toBe(false)
    expect(crowd(TUE, r), 'the next amendment\'s crowd, over today\'s two hours').toEqual(['ignite', 'stiff'])
  })
})
