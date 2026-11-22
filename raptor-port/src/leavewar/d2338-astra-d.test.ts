/* ASTRA'S READ OF D2338, FINDING 3 AND ITS TEST D (23 Nov 26 — raptor-port/docs/superpowers/briefs/2026-11-23-d2338-read-astra.md):
   the round-4b F1 fix keeps an archived man with NO war row in the crowd of every day before his archive (D327), read by
   his archive's date. But Restore drops that date, and with no closed stint saved the new post-in date replaced his start:
   the same Tuesday's crowd lost him again — a published day he was named on reading pending, its OIL taken from him
   (D327, D44, D45, D142, D25). His D327: in the crowd on every day he was here; a gap before a later Restore out.
   The case: Mon 13 Jul Saber ticks Hex SANS by hand on Quals, "+ SANS" off, nothing filed — Hex has no war row; Tue 14
   he is named on a briefing 16:00–17:00 (the crowd asked of 10:00–11:00); Fri 17 archived; Mon 20 restored, post-in 20.
   And: the "+ SANS" switch at the archive or at the Restore changes nothing; a second archive and Restore keep both
   stints; a man who never arrived stays out; no war row appears for a man the war never showed; all of it after a
   reload. The fixture is fable-r4b.test.ts's (Astra's own): the demo week of Mon 13 Jul 26; `rocky` is Hex, a WSO. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns } from '../engine/people'
import { initStore as raptorInitStore, notify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { afterSchedMutate } from '../state/view'
import { updatePersonField } from '../state/quals-write'
import { NOTICES } from '../state/notices'
import { getState, initStore as lwInitStore, setPeople, setPostIn, setShowSans } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { archivePerson, availableFor, restoreArchivedPerson, wireLeaveWarSync } from './sync'
import { MemoryBackend } from '../storage/memory'
import { bootApp } from '../boot'

const mem: Record<string, string> = {}
let people0 = '', days0 = '', inputs0 = ''
const on = (day: number) => vi.setSystemTime(new Date(2026, 6, day, 9, 0, 0))
const login = (name: string, pass = 'x') => { resetSession(sessionFor(signIn(name, pass))); notify() }
/* a day with nothing on it but a briefing naming him (Astra's plan) */
function plan(di: number, who = 'rocky') {
  const d: any = DAYS[di]
  d.waves = []; d.sims = {}; d.dutywaves = []; d.notes = []; d.allhands = []
  d.ground = [{ prog: 'BRIEFING', str: '1600', end: '1700', who }]
  afterSchedMutate()
}
const TUE = 1, SAT = 5
const inCrowd = (di: number, iso: string, who: string) => availableFor(iso, [600, 660], DAYS[di] as any).includes(who)
const tue = (who = 'rocky') => inCrowd(TUE, '2026-07-14', who)
const sat = (who = 'rocky') => inCrowd(SAT, '2026-07-18', who)
const hasRow = (who = 'rocky') => getState().people.some(p => p.id === who)
const saved = (who = 'rocky') => { const w: any = getState().postOuts[who]; return w ? { from: w.from, to: w.to, past: w.past || [] } : null }
/* Mon 13: ticked SANS by hand, "+ SANS" off; named Tue and Sat */
function setUp() {
  on(13)
  plan(TUE); plan(SAT)
  expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); notify()
  expect(setShowSans(false)).toBe(true); notify()
  expect(hasRow(), 'SANS with "+ SANS" off: no war row').toBe(false)
  expect(tue()).toBe(true)
}

describe('Astra 3 / test D — Restore keeps the earlier stint of a man archived with no war row', () => {
  beforeAll(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    people0 = JSON.stringify(PEOPLE); days0 = JSON.stringify(DAYS); inputs0 = JSON.stringify(INPUTS)
  })
  beforeEach(() => {
    on(15)
    for (const k of Object.keys(mem)) delete mem[k]
    storeBackend.impl = { getItem: k => (k in mem ? mem[k]! : null), setItem: (k, v) => { mem[k] = v } }
    for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
    Object.assign(PEOPLE, JSON.parse(people0)); indexCallsigns()
    DAYS.length = 0; DAYS.push(...JSON.parse(days0))
    INPUTS.length = 0; INPUTS.push(...JSON.parse(inputs0))
    NOTICES.length = 0
    Object.assign(SCHED, { pending: {}, changes: {}, added: {}, als: [], al: 0, dayOK: {}, sign: {}, orig: {}, cur: {}, signBind: {}, drafts: {}, curDraft: {}, retired: {}, correcting: {} })
    stashClear()
    lwInitStore(memoryBackend())
    raptorInitStore()
    accountsLoad()
    setPeople(projectPeople())
    wireLeaveWarSync()
    login('ad', 'a')
  })
  afterEach(() => { resetSession(null); vi.restoreAllMocks() })
  afterAll(() => { vi.useRealTimers(); storeBackend.impl = null })

  it('D (Astra\'s own): archived Fri 17, restored Mon 20 — Tuesday still counts him', () => {
    setUp()
    on(17); expect(archivePerson('rocky').bad).toBeNull(); notify()
    expect(hasRow()).toBe(false)
    expect(tue(), 'archived: Tuesday still his (F1)').toBe(true)
    on(20); expect(restoreArchivedPerson('rocky', '2026-07-20')).toBe(true); notify()
    expect(tue(), 'restored: Tuesday still his (D327)').toBe(true)
  })

  it('the gap stays out, the stints are his real ones, and the war shows no row it never showed', () => {
    setUp()
    on(17); expect(archivePerson('rocky').bad).toBeNull(); notify()
    expect(sat(), 'Sat 18, after his archive: out').toBe(false)
    on(20); expect(restoreArchivedPerson('rocky', '2026-07-20')).toBe(true); notify()
    expect(sat(), 'Sat 18, in the gap before the Restore: out').toBe(false)
    expect(saved()).toEqual({ from: '2026-07-20', to: null, past: [{ from: null, to: '2026-07-16' }] })
    expect(hasRow(), '"+ SANS" still off: no row').toBe(false)
  })

  it('"+ SANS" ON at the archive changes nothing', () => {
    setUp()
    expect(setShowSans(true)).toBe(true); notify()
    on(17); expect(archivePerson('rocky').bad).toBeNull(); notify()
    expect(setShowSans(false)).toBe(true); notify()
    expect(tue()).toBe(true); expect(sat()).toBe(false)
    on(20); expect(restoreArchivedPerson('rocky', '2026-07-20')).toBe(true); notify()
    expect(tue()).toBe(true); expect(sat()).toBe(false)
    expect(saved()).toEqual({ from: '2026-07-20', to: null, past: [{ from: null, to: '2026-07-16' }] })
  })

  it('"+ SANS" ON at the Restore changes nothing', () => {
    setUp()
    on(17); expect(archivePerson('rocky').bad).toBeNull(); notify()
    expect(setShowSans(true)).toBe(true); notify()
    on(20); expect(restoreArchivedPerson('rocky', '2026-07-20')).toBe(true); notify()
    expect(tue()).toBe(true); expect(sat()).toBe(false)
    expect(saved()).toEqual({ from: '2026-07-20', to: null, past: [{ from: null, to: '2026-07-16' }] })
    expect(setShowSans(false)).toBe(true); notify()
    expect(tue()).toBe(true); expect(sat()).toBe(false)
  })

  it('a second archive and Restore keep both stints, and the gaps out', () => {
    setUp()
    on(17); expect(archivePerson('rocky').bad).toBeNull(); notify()
    on(20); expect(restoreArchivedPerson('rocky', '2026-07-20')).toBe(true); notify()
    on(23); expect(archivePerson('rocky').bad).toBeNull(); notify()
    expect(tue()).toBe(true)
    on(27); expect(restoreArchivedPerson('rocky', '2026-07-27')).toBe(true); notify()
    expect(tue()).toBe(true); expect(sat()).toBe(false)
    expect(saved()).toEqual({ from: '2026-07-27', to: null, past: [{ from: null, to: '2026-07-16' }, { from: '2026-07-20', to: '2026-07-22' }] })
    expect(hasRow()).toBe(false)
  })

  it('restored the day after his archive closed: the stint reopens, no gap', () => {
    setUp()
    on(17); expect(archivePerson('rocky').bad).toBeNull(); notify()
    expect(restoreArchivedPerson('rocky', '2026-07-17')).toBe(true); notify()
    expect(saved(), 'one stint from always: no window to keep').toBeNull()
    expect(tue()).toBe(true); expect(sat()).toBe(true)
  })

  it('a man who never arrived stays out: posted in for Fri 17, archived Wed 15, restored Mon 20 — Tuesday not his', () => {
    on(13); plan(TUE)
    /* (his post-in set while the war still shows him — its door asks his row) */
    expect(setPostIn('rocky', '2026-07-17')).toBe(true); notify()
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); notify()
    expect(setShowSans(false)).toBe(true); notify()
    expect(tue(), 'not yet arrived').toBe(false)
    on(15); expect(archivePerson('rocky').bad).toBeNull(); notify()
    expect(tue()).toBe(false)
    on(20); expect(restoreArchivedPerson('rocky', '2026-07-20')).toBe(true); notify()
    expect(tue(), 'he was never here on Tuesday').toBe(false)
    expect(saved()?.past).toEqual([])
  })
})

/* …and all of it after a reload: a real saved store (the demo world on a memory backend), booted twice as main.tsx boots it */
describe('Astra 3 — after a reload', () => {
  async function boot(be: MemoryBackend) {
    const p = bootApp(be)
    const settled = p.then(() => null, (e: unknown) => e)
    await vi.advanceTimersByTimeAsync(be.latency + 1)
    const err = await settled
    if (err) throw err
    return p
  }
  const flush = async (p: Awaited<ReturnType<typeof boot>>) => { await vi.advanceTimersByTimeAsync(2000); await p.postman.flush() }
  beforeEach(() => { vi.useFakeTimers(); on(13) })
  afterEach(() => { resetSession(null); vi.useRealTimers() })

  /* Two men of the demo world: Echo (`freak`, a WSO) has nothing on the war before the archive, so the archive keeps no
     window and he never has a row — Astra's path; Hex (`rocky`) has a war record of 10 Mar and an OIL award, a past on
     the war, so the archive closes his stint and keeps his row — the ordinary path. Both, every step reloaded. */
  it.each([['freak', false], ['rocky', true]] as const)('%s: archived, restored, archived and restored again, each step reloaded: Tuesday his, the gaps out, the row as it was', async (who, row) => {
    const be = new MemoryBackend()
    let app = await boot(be)
    login('ad', 'a')
    plan(TUE, who); plan(SAT, who)
    expect(updatePersonField(who, { tick: 'san' })).toBeNull(); notify()
    expect(setShowSans(false)).toBe(true); notify()
    expect(tue(who)).toBe(true)
    await flush(app)
    const step = async (fn: () => void) => { fn(); notify(); await flush(app); app = await boot(be); login('ad', 'a'); plan(TUE, who); plan(SAT, who) }
    on(17); await step(() => expect(archivePerson(who).bad).toBeNull())
    expect(tue(who)).toBe(true); expect(sat(who)).toBe(false); expect(hasRow(who)).toBe(row)
    on(20); await step(() => expect(restoreArchivedPerson(who, '2026-07-20')).toBe(true))
    expect(tue(who)).toBe(true); expect(sat(who)).toBe(false)
    if (!row) expect(hasRow(who)).toBe(false)
    on(23); await step(() => expect(archivePerson(who).bad).toBeNull())
    on(27); await step(() => expect(restoreArchivedPerson(who, '2026-07-27')).toBe(true))
    expect(tue(who)).toBe(true); expect(sat(who)).toBe(false)
    if (!row) expect(hasRow(who)).toBe(false)
    expect(saved(who)).toEqual({ from: '2026-07-27', to: null, past: [{ from: null, to: '2026-07-16' }, { from: '2026-07-20', to: '2026-07-22' }] })
  })
})
