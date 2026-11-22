/* ALL AVAIL COUNTS A MAN POSTED OUT AS SANS WHO IS PLANNED WITH US — WHATEVER THE LEAVE WAR'S "+ SANS" SWITCH SAYS
   ([FABLE-READ-FAULTS] (i), Astra's code read #1 of 22 Nov 26; fixed 22 Nov 26, chat 141).
   His D27: a SANS man counts in the ALL AVAIL / ALL crowd only when he is planned on our programme that day. His D283:
   posted out as SANS, he becomes SANS on the date and still flies with us. The crowd passed him at its SANS check and
   then dropped him as "posted out": it asked the war's DISPLAY row, whose posting window the "+ SANS" switch shapes
   (store.ts windowFor — off: the window is laid, his old place; on: none). So with the switch off the crowd a published
   day froze, and its OIL, lacked him; with it on he counted. A display switch must never change who is owed OIL (D25).
   Three parts:
   (1) the fault itself, and what it cost him — half a day of OIL for a full Saturday;
   (2) the switch never changes the crowd, in every state a SANS posting can be in;
   (3) what stays as it was (the order's §8 point 7): every other posting is still a departure.
   The fixture is sans-from-date.test.ts's: the demo week of Mon 13 Jul 26, today Wed 15 Jul; id `rocky` is Hex, a WSO. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns, sansOn } from '../engine/people'
import { initStore as raptorInitStore, notify as raptorNotify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED, signOf, dayPendingItems } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { commitSetDayApproved } from '../state/sched-commit'
import { afterSchedMutate } from '../state/view'
import { updatePersonField } from '../state/quals-write'
import { getState, initStore as lwInitStore, setPeople, setPostIn, setShowSans } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { archivePerson, availableFor, postOut, undoPostOut, runOilPass, wireLeaveWarSync } from './sync'

const mem: Record<string, string> = {}
let PEOPLE0 = '', DAYS0 = '', INPUTS0 = ''
const P = (id: string): any => (PEOPLE as any)[id]
const signInAs = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); raptorNotify() }
const TUE = 1, THU = 3, SAT = 5
const MON_ISO = '2026-07-13', TUE_ISO = '2026-07-14', WED_ISO = '2026-07-15', THU_ISO = '2026-07-16', FRI_ISO = '2026-07-17', SAT_ISO = '2026-07-18'
const WIN: [number, number] = [600, 660]                                 // 10:00 to 11:00, inside the event
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
const cell = (p: string, iso: string) => getState().wars[0]!.grid[p]?.[iso]
/* a day holding one thing: a squadron event for ALL AVAIL, 08:00 to 15:00 — so nobody is named on it */
const onlyTheEvent = (di: number) => { const d: any = DAYS[di]; d.waves = []; d.sims = {}; d.dutywaves = []; d.ground = []; d.notes = []; d.allhands = [{ prog: 'SQN EVENT', str: '0800', end: '1500', who: 'ALL AVAIL' }]; afterSchedMutate() }
/* …and one man NAMED on it, for something that does not overlap the event unless told to */
const plan = (di: number, id: string, str = '1600', end = '1700') => { (DAYS[di] as any).ground.push({ prog: 'BRIEFING', str, end, who: id }); afterSchedMutate() }
/* the crowd with "+ SANS" off the war, then on — the switch left off, as the fixture starts */
const crowdBothWays = (iso: string, di: number) => {
  expect(setShowSans(false)).toBe(true); raptorNotify()
  const off = availableFor(iso, WIN, DAYS[di] as any)
  expect(setShowSans(true)).toBe(true); raptorNotify()
  const on = availableFor(iso, WIN, DAYS[di] as any)
  expect(setShowSans(false)).toBe(true); raptorNotify()
  return { off, on }
}

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  PEOPLE0 = JSON.stringify(PEOPLE); DAYS0 = JSON.stringify(DAYS); INPUTS0 = JSON.stringify(INPUTS)
})
afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })
beforeEach(() => {
  vi.setSystemTime(new Date(2026, 6, 15, 9, 0, 0))                       // Wed 15 Jul 26, the demo week
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = { getItem: (k: string) => (k in mem ? mem[k]! : null), setItem: (k: string, v: string) => { mem[k] = v } }
  const p0 = JSON.parse(PEOPLE0)
  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, p0); indexCallsigns()
  DAYS.length = 0; JSON.parse(DAYS0).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(INPUTS0).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.signBind = {}; SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  stashClear()
  lwInitStore(memoryBackend())
  raptorInitStore()
  accountsLoad()
  setPeople(projectPeople())                                            // "+ SANS" off the war: the default
  wireLeaveWarSync()
  signInAs('ad', 'a')
})
afterEach(() => { resetSession(null); vi.restoreAllMocks() })

describe('(i) a man posted out as SANS, planned with us, counts in ALL AVAIL with "+ SANS" off the war', () => {
  it('he is in the crowd of a day after his posting that names him (Astra\'s case)', () => {
    onlyTheEvent(THU); plan(THU, 'rocky')
    expect(postOut('rocky', WED_ISO, 'sans')).toBe(true); raptorNotify()   // SANS from Wed 15 Jul
    expect(getState().showSans, '"+ SANS" is off the war').toBe(false)
    expect(sansOn('rocky', THU_ISO), 'he is SANS on Thu 16 Jul').toBe(true)
    expect(availableFor(THU_ISO, WIN, DAYS[THU] as any), 'planned with us that day, free over the event').toContain('rocky')
  })

  it('a published Saturday credits him the event\'s hours: a full day of OIL, not the half his briefing alone earns', () => {
    onlyTheEvent(SAT); plan(SAT, 'rocky')                                // the event 08:00–15:00, his briefing 16:00–17:00
    expect(postOut('rocky', WED_ISO, 'sans')).toBe(true); raptorNotify()
    sign(SAT); commitSetDayApproved(SAT, true); runOilPass()
    expect(dayPendingItems(SAT).length, 'nothing waits on the published day').toBe(0)
    expect(cell('rocky', SAT_ISO), 'nine hours start to finish on a Saturday').toBe('FO')
  })

  it('turning "+ SANS" on after the day is published leaves it as published: nothing pending, the same OIL', () => {
    onlyTheEvent(SAT); plan(SAT, 'rocky')
    expect(postOut('rocky', WED_ISO, 'sans')).toBe(true); raptorNotify()
    sign(SAT); commitSetDayApproved(SAT, true); runOilPass()
    const before = cell('rocky', SAT_ISO)
    expect(setShowSans(true)).toBe(true); raptorNotify(); runOilPass()
    expect(dayPendingItems(SAT).length, 'a display switch makes no published day pending').toBe(0)
    expect(cell('rocky', SAT_ISO)).toBe(before)
    expect(setShowSans(false)).toBe(true); raptorNotify(); runOilPass()
    expect(dayPendingItems(SAT).length).toBe(0)
    expect(cell('rocky', SAT_ISO)).toBe(before)
  })
})

describe('the "+ SANS" switch never changes who ALL AVAIL counts', () => {
  it('posted out as SANS and planned with us: in, both ways', () => {
    onlyTheEvent(THU); plan(THU, 'rocky')
    expect(postOut('rocky', WED_ISO, 'sans')).toBe(true); raptorNotify()
    const { off, on } = crowdBothWays(THU_ISO, THU)
    expect(off).toEqual(on)
    expect(off).toContain('rocky')
  })

  it('posted out as SANS and NOT planned with us: out, both ways (D27 — another squadron\'s man that day)', () => {
    onlyTheEvent(THU)
    expect(postOut('rocky', WED_ISO, 'sans')).toBe(true); raptorNotify()
    const { off, on } = crowdBothWays(THU_ISO, THU)
    expect(off).toEqual(on)
    expect(off).not.toContain('rocky')
  })

  it('posted out as SANS, planned with us, but busy over the event: out, both ways', () => {
    onlyTheEvent(THU); plan(THU, 'rocky', '1000', '1100')
    expect(postOut('rocky', WED_ISO, 'sans')).toBe(true); raptorNotify()
    const { off, on } = crowdBothWays(THU_ISO, THU)
    expect(off).toEqual(on)
    expect(off).not.toContain('rocky')
  })

  it('a day BEFORE his posting date: the regular he was, in, both ways (D2313)', () => {
    onlyTheEvent(TUE)
    expect(postOut('rocky', WED_ISO, 'sans')).toBe(true); raptorNotify()
    const { off, on } = crowdBothWays(TUE_ISO, TUE)
    expect(off).toEqual(on)
    expect(off).toContain('rocky')
  })

  it('SANS taken off by hand after the posting: an ordinary man again (D2327), in, both ways — without being named', () => {
    onlyTheEvent(THU)
    expect(postOut('rocky', MON_ISO, 'sans')).toBe(true); raptorNotify()   // SANS from Mon 13 Jul
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()   // off by hand, Wed 15 Jul
    expect(sansOn('rocky', THU_ISO), 'not SANS on Thu 16 Jul').toBe(false)
    const { off, on } = crowdBothWays(THU_ISO, THU)
    expect(off).toEqual(on)
    expect(off).toContain('rocky')
  })

  it('a SANS posting still to come: the same answer both ways on a day past its date', () => {
    onlyTheEvent(SAT); plan(SAT, 'rocky')
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()   // from Fri 17 Jul — today is Wed 15 Jul
    expect(P('rocky').san, 'the posting has not run').toBeFalsy()
    const { off, on } = crowdBothWays(SAT_ISO, SAT)
    expect(off).toEqual(on)
    expect(off, 'not SANS until its date arrives, and posted out from it: out, as it was').not.toContain('rocky')
  })

  it('"Undo post out": the regular he was, in, both ways', () => {
    onlyTheEvent(THU)
    expect(postOut('rocky', WED_ISO, 'sans')).toBe(true); raptorNotify()
    expect(undoPostOut('rocky')).toBe(true); raptorNotify()
    const { off, on } = crowdBothWays(THU_ISO, THU)
    expect(off).toEqual(on)
    expect(off).toContain('rocky')
  })
})

describe('left as it was: every other posting is still a departure', () => {
  it('posted out with no outcome ("off the manpower", D303): out from the date, though named on the day', () => {
    onlyTheEvent(THU); plan(THU, 'rocky')
    expect(postOut('rocky', WED_ISO, 'none')).toBe(true); raptorNotify()
    const { off, on } = crowdBothWays(THU_ISO, THU)
    expect(off).toEqual(on)
    expect(off).not.toContain('rocky')
  })

  it('posted out Overseas Sqn: out from the date, in on the days before it (D327)', () => {
    onlyTheEvent(THU); onlyTheEvent(TUE); plan(THU, 'rocky')
    expect(postOut('rocky', WED_ISO, 'overseas')).toBe(true); raptorNotify()
    expect(availableFor(THU_ISO, WIN, DAYS[THU] as any)).not.toContain('rocky')
    expect(availableFor(TUE_ISO, WIN, DAYS[TUE] as any)).toContain('rocky')
  })

  it('a SANS posting whose date was moved later, not yet run again: out on a day past the new date until it runs', () => {
    onlyTheEvent(SAT); plan(SAT, 'rocky')
    expect(postOut('rocky', WED_ISO, 'sans')).toBe(true); raptorNotify()   // ran today
    expect(postOut('rocky', FRI_ISO, 'sans')).toBe(true); raptorNotify()   // moved to Fri 17 Jul: its tick taken back
    expect(P('rocky').san, 'the tick the posting made is taken back').toBeFalsy()
    const { off, on } = crowdBothWays(SAT_ISO, SAT)
    expect(off).toEqual(on)
    expect(off).not.toContain('rocky')
  })
})

/* THE FRESH OPUS READER'S TWO FINDINGS (22 Nov 26 — docs/superpowers/briefs/2026-11-22-allavail-sans-posted-read-opus.md),
   each failing before the second fix. On a day he is SANS and named on our programme he is ours — his posting window on
   the war does not decide it (his [ALL-AVAIL-REDEF]: "only SANS that are planned on the programmed on that day with us");
   his archive, by its date (D327), his delete and his squadron stints still do. */
describe('a SANS man named with us counts whatever his posting window on the war says — his archive, by its date, still ends it', () => {
  it('F1: archived after a SANS posting, he stays in the crowd of the days before his archive (D327), both ways; out from it', () => {
    onlyTheEvent(TUE); plan(TUE, 'rocky'); onlyTheEvent(THU); plan(THU, 'rocky')
    expect(postOut('rocky', MON_ISO, 'sans')).toBe(true); raptorNotify()   // SANS from Mon 13 Jul
    expect(availableFor(TUE_ISO, WIN, DAYS[TUE] as any), 'before the archive').toContain('rocky')
    expect(archivePerson('rocky').bad).toBeNull(); raptorNotify()          // archived today, Wed 15 Jul
    expect(P('rocky').archived).toBe(true)
    const tue = crowdBothWays(TUE_ISO, TUE)
    expect(tue.off).toEqual(tue.on)
    expect(tue.off, 'Tue 14 Jul, the day before his archive').toContain('rocky')
    const thu = crowdBothWays(THU_ISO, THU)
    expect(thu.off).toEqual(thu.on)
    expect(thu.off, 'Thu 16 Jul, after his archive').not.toContain('rocky')
  })

  it('F1: the crowd a published day before his archive kept still matches — the event\'s OIL is not reopened by the archive', () => {
    onlyTheEvent(TUE); plan(TUE, 'rocky')
    expect(postOut('rocky', MON_ISO, 'sans')).toBe(true); raptorNotify()
    sign(TUE); commitSetDayApproved(TUE, true); runOilPass()
    expect(dayPendingItems(TUE).length).toBe(0)
    const before = availableFor(TUE_ISO, WIN, DAYS[TUE] as any)
    expect(archivePerson('rocky').bad).toBeNull(); raptorNotify(); runOilPass()
    expect(availableFor(TUE_ISO, WIN, DAYS[TUE] as any), 'the crowd as it was published').toEqual(before)
    expect(JSON.stringify(dayPendingItems(TUE)), 'no pending line about who earns OIL').not.toMatch(/oil/i)
  })

  it('F2: a SANS man with a post-in date still to come, named with us before it: the same answer both ways — in', () => {
    onlyTheEvent(THU); plan(THU, 'rocky')
    expect(setPostIn('rocky', FRI_ISO)).toBe(true); raptorNotify()        // posted in from Fri 17 Jul
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()   // SANS by hand, Wed 15 Jul
    expect(sansOn('rocky', THU_ISO)).toBe(true)
    const { off, on } = crowdBothWays(THU_ISO, THU)
    expect(off).toEqual(on)
    expect(off, 'SANS and planned with us that day').toContain('rocky')
  })

  it('a hand-ticked SANS man, archived: in on a day before his archive that names him, out from it, both ways', () => {
    onlyTheEvent(TUE); plan(TUE, 'nick'); onlyTheEvent(THU); plan(THU, 'nick')
    expect(P('nick').san, 'nick is SANS at the start').toBe(true)
    expect(archivePerson('nick').bad).toBeNull(); raptorNotify()
    const tue = crowdBothWays(TUE_ISO, TUE)
    expect(tue.off).toEqual(tue.on)
    expect(tue.off).toContain('nick')
    const thu = crowdBothWays(THU_ISO, THU)
    expect(thu.off).toEqual(thu.on)
    expect(thu.off).not.toContain('nick')
  })

  /* FOUND, NOT FIXED — [FABLE-READ-FAULTS] (m), Astra's code read #1 of this fix (22 Nov 26): posted out as SANS, the tick
     then taken off by hand (an ordinary man of ours again, D2327), then archived days later. The archive rewrites his saved
     posting as an Overseas one that still ends on the SANS posting's date (store.ts stintClosed), so the ordinary days
     between the untick and the archive lose him: a Saturday published with him behind ALL AVAIL reads pending, and its
     next amendment takes his OIL (against D327). The fix changes what the Leave War draws for those days, so it waits for
     his word; this proof turns green — and the `fails` must come off — the day it is fixed. */
  it.fails('(m) NOT FIXED: SANS posting, hand untick, then an archive days later — he stays in the crowd of the days before his archive', () => {
    onlyTheEvent(SAT)
    expect(postOut('rocky', MON_ISO, 'sans')).toBe(true); raptorNotify()            // SANS from Mon 13 Jul
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()   // off by hand, Wed 15 Jul
    expect(availableFor(SAT_ISO, WIN, DAYS[SAT] as any), 'an ordinary man on Sat 18 Jul').toContain('rocky')
    vi.setSystemTime(new Date(2026, 6, 20, 9, 0, 0)); raptorNotify()                // Mon 20 Jul
    expect(archivePerson('rocky').bad).toBeNull(); raptorNotify()
    expect(availableFor(SAT_ISO, WIN, DAYS[SAT] as any), 'Sat 18 Jul, two days before his archive').toContain('rocky')
  })

  /* the narrow read of the second fix (a fresh Opus reader, 22 Nov 26 — …-read-fix2-opus.md): the SANS branch had set aside
     the WHOLE posting window, so a SANS man's real departure — an Overseas or Delete posting still to come, a posting with
     no chip — stopped counting; a day published meanwhile then read pending when the posting ran. Only the END a SANS
     posting or an archive wrote is not a departure; every other posting's date is, for a SANS man as for anyone. */
  it('left as it was: a SANS man with an Overseas Sqn posting still to come, named on a day past its date, is out, both ways', () => {
    onlyTheEvent(SAT); plan(SAT, 'rocky'); onlyTheEvent(THU); plan(THU, 'rocky')
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()   // SANS by hand, Wed 15 Jul
    expect(setShowSans(true)).toBe(true); raptorNotify()                             // a hidden SANS man has no row to post out from
    expect(postOut('rocky', FRI_ISO, 'overseas')).toBe(true); raptorNotify()         // from Fri 17 Jul — not run yet
    expect(P('rocky').archived, 'the posting has not run').toBeFalsy()
    const sat = crowdBothWays(SAT_ISO, SAT)
    expect(sat.off).toEqual(sat.on)
    expect(sat.off, 'Sat 18 Jul is past his posting-out date').not.toContain('rocky')
    const thu = crowdBothWays(THU_ISO, THU)
    expect(thu.off).toEqual(thu.on)
    expect(thu.off, 'Thu 16 Jul, before it: SANS and named with us').toContain('rocky')
  })

  it('left as it was: a SANS man posted out with no chip chosen ("off the manpower", D303), named after it, is out, both ways', () => {
    onlyTheEvent(THU); plan(THU, 'rocky'); onlyTheEvent(SAT); plan(SAT, 'rocky')
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()   // SANS by hand, Wed 15 Jul
    expect(setShowSans(true)).toBe(true); raptorNotify()
    expect(postOut('rocky', FRI_ISO, 'none')).toBe(true); raptorNotify()            // off the manpower from Fri 17 Jul
    const sat = crowdBothWays(SAT_ISO, SAT)
    expect(sat.off).toEqual(sat.on)
    expect(sat.off, 'Sat 18 Jul, after the posting').not.toContain('rocky')
    const thu = crowdBothWays(THU_ISO, THU)
    expect(thu.off).toEqual(thu.on)
    expect(thu.off, 'Thu 16 Jul, before the posting: SANS and named with us').toContain('rocky')
  })

  it('left as it was: a man who is NOT SANS, not yet posted in, is out though named (the posting window still decides)', () => {
    onlyTheEvent(THU); plan(THU, 'rocky')
    expect(setPostIn('rocky', FRI_ISO)).toBe(true); raptorNotify()
    const { off, on } = crowdBothWays(THU_ISO, THU)
    expect(off).toEqual(on)
    expect(off).not.toContain('rocky')
  })
})
