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
import { SCHED, setSign, setDayApproved, publishALDay, dayDelta, daySigned, dayCurVer, daySnapOf, dayPendingItems, dayShownPendCount, unpublishDay } from './engine/publish'
import { loadVersionToWorkingCopy } from './engine/drafts'
import { groundItemKey } from './engine/oil'
import { VCONF, SHIFT_HARD } from './engine/rules'
import { HOOKS } from './engine/hooks'
import { validate } from './engine/validate'
import { personBusy } from './engine/avail'
import { ensureRowIds } from './engine/rowids'
import { rowItemKey } from './engine/oil'
import { oilEvidenceOf, oilSentOf } from './engine/oilev'
import { oilItemLabel } from './ui/oilmode'
import { withChipWorld } from './ui/html'
import { pendItemWords } from './ui/pendlist'
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

/* ── Astra's scenario design (docs/superpowers/briefs/2026-11-13-d2028-scenarios.md): what the first eleven left out ── */

describe('D2028 — the same on every kind of row a placeholder can stand on (scenario 1)', () => {
  const plus20 = (t: string) => { const [h, m] = t.split(':').map(Number); return `${String(h).padStart(2, '0')}:${String(m + 20).padStart(2, '0')}` }
  const KINDS: [string, (d: any) => string, string][] = [
    ['a ground row', d => { d.ground.push({ prog: 'DINNER', str: '09:00', end: '', who: 'allavail' }); ensureRowIds(DAYS); return groundItemKey(d.ground[0]) }, '10:15'],
    ['a duty desk', d => { d.dutywaves.push({ label: 'DUTIES', rows: [{ role: 'SDO', id: 'allavail', str: '09:00', end: '' }] }); ensureRowIds(DAYS); return rowItemKey(d.dutywaves[0].rows[0].rid) }, '10:15'],
    ['a sim seat', d => { d.sims.amt.push({ str: '09:00', end: '', p: 'allavail', w: '' }); ensureRowIds(DAYS); return rowItemKey(d.sims.amt[0].rid) }, '10:35'],
    ['a Common Programme row', d => { d.allhands.push({ prog: 'OPS BRIEF', str: '09:00', end: '', who: ['allavail'] }); ensureRowIds(DAYS); return rowItemKey(d.allhands[0].rid) }, '10:15'],
  ]
  for (const [name, make, busyAt] of KINDS) it(`${name}: both assumed lengths doubled, the day checked twice — nothing waits, the four stay, the crowd is the one it went out with`, () => {
    const key = make(day(TUE))
    day(TUE).ground.push({ prog: 'DENTAL', str: busyAt, end: plus20(busyAt), who: 'bane' }); ensureRowIds(DAYS)
    publish(TUE)
    const people = () => [...oilSentOf(oilEvidenceOf(TUE), key).people].sort()
    expect(people(), 'premise: published with the man busy just past the assumed end').toEqual([...MEN].sort())
    VCONF.openEnd = 120; VCONF.simLen = 180
    for (const pass of ['first', 'second']) {
      validate()
      expect(dayDelta(TUE), `${pass} check`).toEqual([])
      expect(dayPendingItems(TUE), `${pass} check: the pending list`).toEqual([])
      expect(dayShownPendCount(TUE), `${pass} check: the day's count`).toBe(0)
      expect(daySigned(TUE), `${pass} check`).toBe(true)
      expect(people(), `${pass} check`).toEqual([...MEN].sort())
    }
  })
})

describe('D2005 — the dekit time, as the step time (scenario 6)', () => {
  it('bane lands 09:00 (dekit 30 → busy until 09:30); ALL AVAIL 09:45–10:30; dekit 30 → 90 leaves the published day alone', () => {
    day(TUE).waves.push({ label: 'WAVE 1', night: false, intimes: [], traffic: [], formations: [
      { cs: 'VL', msn: 'BFM', to: '08:00', ld: '09:00', br: '', rl: '', aircraft: [{ p: 'bane', w: '', rmks: '', area: '', opts: {} }] }] })
    day(TUE).allhands.push({ prog: 'Tasking', str: '09:45', end: '10:30', who: ['allavail'] })
    ensureRowIds(DAYS)
    const r = day(TUE).allhands[0]; publish(TUE)
    expect(crowd(TUE, r), 'premise: bane free from 09:30').toEqual([...MEN].sort())
    VCONF.dekit = 90; validate(); validate()
    expect(dayDelta(TUE), 'the Logic change alone').toEqual([])
    expect(daySigned(TUE)).toBe(true)
    expect(crowd(TUE, r)).toEqual([...MEN].sort())
  })
})

/* three answers that can be told apart: bane busy 10:15, ignite busy 11:15 — the one-hour crowd holds all four, the
   two-hour crowd loses bane, the three-hour crowd loses ignite too */
describe('D2028 — the original at 1h, the amendment at 2h, today at 3h (scenarios 7–9, 11, 12)', () => {
  const H1 = [...MEN].sort(), H2 = ['ignite', 'pump', 'stiff'], H3 = ['pump', 'stiff']
  const T1 = '09:00–10:00 · no end time, an hour assumed', T2 = '09:00–11:00 · no end time, 2 hours assumed', T3 = '09:00–12:00 · no end time, 3 hours assumed'
  const realChange = () => { day(TUE).ground.push({ prog: 'ADMIN', str: '14:00', end: '15:00', who: 'pump' }); ensureRowIds(DAYS); validate() }
  function threeVersions() {
    const r = hisCase(TUE)
    day(TUE).ground.push({ prog: 'MEDICAL', str: '11:15', end: '11:45', who: 'ignite' }); ensureRowIds(DAYS)
    publish(TUE); const orig = dayCurVer(TUE)
    VCONF.openEnd = 120; validate(); realChange()
    sign(TUE); publishALDay(TUE); validate(); sign(TUE)
    const al1 = dayCurVer(TUE)
    VCONF.openEnd = 180; validate()
    return { r, orig, al1 }
  }
  it('the amendment, clean, keeps its 2h on the working copy and its face; the original keeps 1h; looking at either changes nothing', () => {
    const { r, orig, al1 } = threeVersions()
    expect(al1, 'premise: an amendment went out').not.toBe(orig)
    for (const pass of ['first', 'second']) {
      expect(dayDelta(TUE), pass).toEqual([]); expect(daySigned(TUE), pass).toBe(true)
      expect(title(TUE, r), pass).toContain(T2); expect(crowd(TUE, r), pass).toEqual(H2)
      expect(issuedTitle(TUE, r, al1), pass).toContain(T2); expect(issuedCrowd(TUE, r, al1), pass).toEqual(H2)
      expect(withChipWorld(TUE, orig, false, () => oilItemLabel(TUE, item(r)).when), pass).toContain(T1); expect(issuedCrowd(TUE, r, orig), pass).toEqual(H1)
      validate()
    }
  })
  it('a real change waiting previews today\'s 3h; put back, the day is its amendment\'s 2h again — not the original\'s hour', () => {
    const { r } = threeVersions()
    day(TUE).ground.push({ prog: 'ADMIN 2', str: '15:00', end: '16:00', who: 'pump' }); ensureRowIds(DAYS); validate()
    expect(dayPendingItems(TUE).length, 'premise: it waits').toBeGreaterThan(0)
    expect(title(TUE, r)).toContain(T3); expect(crowd(TUE, r)).toEqual(H3)
    expect(issuedTitle(TUE, r), 'View-only Sched').toContain(T2)
    day(TUE).ground.pop(); validate()
    expect(dayPendingItems(TUE)).toEqual([])
    expect(title(TUE, r)).toContain(T2); expect(crowd(TUE, r)).toEqual(H2)
  })
  it('the amendment unpublished: the original is current at 1h, the withdrawn change waits and previews 3h; published again it freezes 3h (D101)', () => {
    const { r, orig } = threeVersions()
    expect(unpublishDay(TUE), 'premise: the amendment came off').toBeTruthy(); validate()
    expect(dayCurVer(TUE)).toBe(orig)
    expect(issuedTitle(TUE, r)).toContain(T1); expect(issuedCrowd(TUE, r)).toEqual(H1)
    expect(dayPendingItems(TUE).length, 'the withdrawn amendment\'s change waits').toBeGreaterThan(0)
    expect(title(TUE, r)).toContain(T3); expect(crowd(TUE, r)).toEqual(H3)
    sign(TUE); publishALDay(TUE); validate()
    expect(dayDelta(TUE)).toEqual([])
    expect(issuedTitle(TUE, r)).toContain(T3); expect(issuedCrowd(TUE, r)).toEqual(H3)
    expect(title(TUE, r)).toContain(T3); expect(crowd(TUE, r)).toEqual(H3)
  })
  it('the original loaded onto the working copy waits and previews 3h; the amendment loaded back is clean at its 2h (D98)', () => {
    const { r, orig, al1 } = threeVersions()
    expect(loadVersionToWorkingCopy(TUE, orig)).not.toBe(false); validate()
    const r0 = day(TUE).allhands[0]
    expect(dayCurVer(TUE), 'what went out is untouched').toBe(al1)
    expect(dayPendingItems(TUE).length).toBeGreaterThan(0)
    expect(title(TUE, r0)).toContain(T3); expect(crowd(TUE, r0)).toEqual(H3)
    expect(loadVersionToWorkingCopy(TUE, al1)).not.toBe(false); validate()
    const r1 = day(TUE).allhands[0]
    expect(item(r1), 'the same row').toBe(item(r))
    expect(dayPendingItems(TUE)).toEqual([])
    expect(title(TUE, r1)).toContain(T2); expect(crowd(TUE, r1)).toEqual(H2)
  })
  it('the day read back as new objects — a reload, a week change — is still clean at its 2h after the next check', () => {
    const { r } = threeVersions()
    // eslint-disable-next-line react-doctor/no-json-parse-stringify-clone -- the day as a reload hands it back: read from its saved JSON, so nothing that rides outside the saved day (the kept settings) can come along
    DAYS.forEach((d: any, i: number) => { DAYS[i] = JSON.parse(JSON.stringify(d)) })
    validate()
    const r1 = day(TUE).allhands[0]
    expect(item(r1)).toBe(item(r))
    for (const pass of ['first', 'second']) {
      expect(dayDelta(TUE), pass).toEqual([]); expect(daySigned(TUE), pass).toBe(true)
      expect(title(TUE, r1), pass).toContain(T2); expect(crowd(TUE, r1), pass).toEqual(H2)
      validate()
    }
  })
  it('a real end typed is a real change (its written time, today\'s settings); cleared again the day is clean at its 2h (scenario 12)', () => {
    const { r } = threeVersions()
    r.end = '09:30'; validate()
    expect(dayPendingItems(TUE).length).toBeGreaterThan(0)
    expect(title(TUE, r)).toContain('09:00–09:30'); expect(title(TUE, r)).not.toContain('assumed')
    r.end = ''; validate()
    expect(dayPendingItems(TUE)).toEqual([])
    expect(title(TUE, r)).toContain(T2); expect(crowd(TUE, r)).toEqual(H2)
  })
})

/* THE FRESH OPUS READ, 13 Nov 26 — once something else waits, the list and the screen are one comparison. The pending
   comparison counted the working copy's crowds under the settings the day went out with ALWAYS; the screen (D2013)
   and the amendment itself use today's once anything waits. So the list could carry an OIL line for a change the
   screen did not show and the amendment would not make, and miss the one it would (leavewar/published-open-end-oil). */
describe('D2028 + D2013 — with something else waiting, the pending list is counted under the settings the amendment will go out with', () => {
  const oilItems = (di: number) => dayPendingItems(di).filter((i: any) => i.axis === 'oil')
  it('a row moved so the crowd is the same under today\'s 2h as it went out: no "what this day earns" line, and the amendment freezes the same crowd', () => {
    day(TUE).allhands.push({ prog: 'Briefing', str: '09:00', end: '', who: ['allavail'] })
    day(TUE).ground.push({ prog: 'DENTAL', str: '09:30', end: '09:45', who: 'bane' })
    ensureRowIds(DAYS)
    const r = day(TUE).allhands[0]
    publish(TUE)
    const orig = dayCurVer(TUE)
    expect(issuedCrowd(TUE, r), 'premise: bane out at publication').toEqual(['ignite', 'pump', 'stiff'])
    VCONF.openEnd = 120; validate()
    day(TUE).ground[0].str = '10:15'; day(TUE).ground[0].end = '10:45'; validate()
    expect(crowd(TUE, r), 'premise: the working copy, today\'s 2h, shows the crowd as it went out').toEqual(['ignite', 'pump', 'stiff'])
    expect(dayPendingItems(TUE).length, 'premise: the moved row waits').toBeGreaterThan(0)
    expect(oilItems(TUE), 'no line for a crowd change nobody can see').toEqual([])
    expect(dayDelta(TUE).some((e: any) => String(e.addr).startsWith('oil:'))).toBe(false)
    sign(TUE); publishALDay(TUE); validate()
    expect(issuedCrowd(TUE, r), 'the amendment froze the crowd the original had').toEqual(issuedCrowd(TUE, r, orig))
    expect(dayDelta(TUE)).toEqual([])
  })
  it('an unrelated change waiting: the crowd the new length moves IS listed, and put back the day is clean at its hour', () => {
    const r = hisCase(TUE); publish(TUE)
    VCONF.openEnd = 120; validate()
    expect(dayPendingItems(TUE), 'premise: the Logic change alone').toEqual([])
    day(TUE).allhands.push({ prog: 'Lunch', str: '12:00', end: '13:00', who: ['stiff'] }); ensureRowIds(DAYS); validate()
    expect(crowd(TUE, r), 'the preview, 2h: bane out').toEqual(['ignite', 'pump', 'stiff'])
    expect(oilItems(TUE).length, 'listed: who the puck stands for changes with this amendment').toBe(1)
    day(TUE).allhands.pop(); validate()
    expect(dayPendingItems(TUE), 'put back (D98)').toEqual([]); expect(daySigned(TUE)).toBe(true)
    expect(crowd(TUE, r)).toEqual(MEN.slice().sort())
  })
  /* Astra's read, 13 Nov 26 (its second proof, re-aimed at the fixed comparison): the line's WORDS are read by
     ui/pendlist.ts crowdChange under the settings the working copy is drawn by. Before the fix the comparison counted
     Pump alone (old length) while the words named Pump and Bane (new length); now both count and name what the
     amendment will do — the two men the window no longer lists. */
  /* A GUARD, NOT A PIN (the narrow read of the fix, 13 Nov 26): green on the code before the fix too — it asserts the
     line's words, which ui/pendlist.ts crowdChange writes and the fix did not change. The pins for the comparison are
     the two tests above, each red before the fix. */
  it('a real departure beside the one the new length makes: the line\'s words name the same men the window dropped', () => {
    const r = hisCase(TUE); publish(TUE)
    VCONF.openEnd = 120; validate()
    day(TUE).ground.push({ prog: 'MEDICAL', str: '09:15', end: '09:45', who: 'pump' }); ensureRowIds(DAYS); validate()
    expect(crowd(TUE, r), 'the window: today\'s 2h, without pump and without bane').toEqual(['ignite', 'stiff'])
    const oil = oilItems(TUE)
    expect(oil.length).toBe(1)
    const words: any = pendItemWords(TUE, oil[0] as any)
    expect(words.where).toBe('Briefing · who it stands for'); expect(words.to).toBe('no longer free')
    expect(String(words.from).split(', ').sort(), 'bane is Ranger, pump is Piston — those two and nobody else').toEqual(['Piston', 'Ranger'])
  })
  /* a guard, not a pin: green before the fix too (the narrow read of the fix, 13 Nov 26) */
  it('a change that shows ONLY in who is free (a man gone from the roster) after the Logic change: it waits, and the list is counted as the screen shows it', () => {
    const r = hisCase(TUE); publish(TUE)
    VCONF.openEnd = 120; validate()
    expect(dayDelta(TUE), 'premise: clean').toEqual([])
    const all = HOOKS.oilSentinel
    HOOKS.oilSentinel = (iso: string, win: [number, number], d: any) => (all as any)(iso, win, d).filter((id: string) => id !== 'pump')
    validate()
    expect(daySigned(TUE), 'a real change behind the puck (D44, D103)').toBe(false)
    expect(oilItems(TUE).length).toBe(1)
    expect(crowd(TUE, r), 'the preview: today\'s 2h, without him and without bane').toEqual(['ignite', 'stiff'])
    HOOKS.oilSentinel = all; validate()
    expect(dayDelta(TUE), 'back').toEqual([]); expect(daySigned(TUE)).toBe(true)
    expect(crowd(TUE, r)).toEqual(MEN.slice().sort())
    expect(title(TUE, r)).toContain('09:00–10:00 · no end time, an hour assumed')
  })
})

describe('D2028 — the assumed length made shorter', () => {
  it('published under 2h with bane busy 10:15 (out of the crowd); 2h → 1h leaves him out and the day alone', () => {
    VCONF.openEnd = 120
    const r = hisCase(TUE); publish(TUE)
    expect(crowd(TUE, r), 'premise').toEqual(['ignite', 'pump', 'stiff'])
    VCONF.openEnd = 60; validate(); validate()
    expect(dayDelta(TUE)).toEqual([]); expect(daySigned(TUE)).toBe(true)
    expect(crowd(TUE, r)).toEqual(['ignite', 'pump', 'stiff'])
    expect(title(TUE, r)).toContain('09:00–11:00 · no end time, 2 hours assumed')
  })
})
