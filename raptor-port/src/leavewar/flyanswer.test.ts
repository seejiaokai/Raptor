// @vitest-environment jsdom
/* ONE DAY, ONE ANSWER — the two stores joined in ONE place (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.1, §3.2, risk 1; owner D617, D627, D637).

   A day's flying class and its required pilots and WSOs are the scheduler's settings rows; its holiday and who is
   available are the Leave War's; the SANS committed to fly are inputs. `flyAnswer(iso)` hands all three to the ONE
   resolver (state/flyplan-model.ts planFor) and `flyMonth` does a month of it. Every screen that shows a day's class,
   its required figures or how many more are needed asks here — the war's Required rows, the SANS calendar, the
   Inputs calendar's tags, Days — so two screens can never show two answers for one day.

   The resolver's own rules are pinned by state/flyplan-model.suite.ts; what is pinned HERE is the join: the real
   figure typed by an admin, the war's real count, a real SANS commitment, a real holiday and a real half day of leave
   arriving at one number. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { PEOPLE } from '../engine/people'
import { INPUTS, inpId, mintInpIds } from '../engine/inputs'
import { initStore as raptorInitStore } from '../state/store'
import { setSession } from '../state/auth'
import { setFlyDays, setFlyRun, saveTones, sansFly as planSansFly } from '../state/flyplan'
import { getState, initStore as lwInitStore, setDayEvent, setPeople, setRole } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { fileAbsence } from './testkit'
import { dayFacts, flyAnswer, flyMonth, sansFly, syncAbsences } from './sync'

const mem = new Map<string, string>()
beforeEach(() => {
  mem.clear()
  storeBackend.impl = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { if (v === 'null') mem.delete(k); else mem.set(k, v) }, keys: () => [...mem.keys()] } as any
  raptorInitStore()
  setSession({ user: 'admin-test', role: 'admin' })
  lwInitStore(memoryBackend())
  setRole('admin')
  /* the war's roster as the app projects it from the scheduler's people — SANS left off, as "Show SANS" starts */
  setPeople(projectPeople())
})
afterEach(() => { setSession(null); storeBackend.impl = null })

const TUE = '2026-10-06', WED = '2026-10-07', THU = '2026-10-08', FRI = '2026-10-09'
const sansId = (seat: 'FCP' | 'RCP'): string =>
  Object.keys(PEOPLE).find(id => { const p = (PEOPLE as any)[id]; return p.san && p.seat === seat && !p.archived && !p.special })!
const pilotId = (): string => getState().people.find(p => p.seat === 'pilot' && !p.pers)!.id
function commit(person: string, date: string, sans: Record<string, boolean>): void {
  const row: any = { person, type: 'SANS Availability', date, yr: 2026, sans, allday: true, remarks: '' }
  inpId(row); INPUTS.push(row); mintInpIds()
  syncAbsences()
}

describe('one day, one answer', () => {
  it('a day nobody has set is day flying with no required figure, so nothing is needed or known', () => {
    expect(flyAnswer(TUE)).toMatchObject({ iso: TUE, kind: null, cls: 'day', clsFrom: 'default', req: { p: null, w: null }, need: { p: null, w: null }, tone: 'none' })
  })

  it('still needed = the required figure, less those the Leave War shows available', () => {
    const f = dayFacts(TUE)
    expect(f.availP).toBeGreaterThan(0)
    expect(setFlyDays([{ iso: TUE, p: f.availP! + 3, w: f.availW! }]).ok).toBe(true)
    expect(flyAnswer(TUE)).toMatchObject({ req: { p: f.availP! + 3, w: f.availW! }, need: { p: 3, w: 0 }, tone: 'amber' })
  })

  it('…less the SANS committed to fly, each seat by itself', () => {
    const f = dayFacts(WED)
    setFlyDays([{ iso: WED, p: f.availP! + 3, w: f.availW! + 1 }])
    expect(flyAnswer(WED).need).toEqual({ p: 3, w: 1 })
    commit(sansId('FCP'), 'Oct 7', { f: true })
    expect(sansFly(WED)).toEqual({ p: 1, w: 0 })
    expect(flyAnswer(WED)).toMatchObject({ need: { p: 2, w: 1 }, tone: 'amber' })
    commit(sansId('RCP'), 'Oct 7', { f: true })
    expect(flyAnswer(WED)).toMatchObject({ need: { p: 2, w: 0 }, tone: 'yellow' })
    /* a SANS man offering OFT only takes nothing off the need */
    const other = Object.keys(PEOPLE).find(id => { const p = (PEOPLE as any)[id]; return p.san && p.seat === 'FCP' && !p.archived && id !== sansId('FCP') })
    if (other) { commit(other, 'Oct 7', { o: true }); expect(flyAnswer(WED).need.p).toBe(2) }
  })

  it('a SANS man is in the SANS count and never in the Leave War’s — nobody is counted twice', () => {
    const before = dayFacts(THU)
    commit(sansId('FCP'), 'Oct 8', { f: true })
    expect(dayFacts(THU).availP).toBe(before.availP)
    expect(sansFly(THU).p).toBe(1)
  })

  it('a half day of leave is half a man: the need is rounded UP', () => {
    const f = dayFacts(THU)
    setFlyDays([{ iso: THU, p: f.availP! }])
    expect(flyAnswer(THU).need.p).toBe(0)
    fileAbsence(pilotId(), '*LL', THU)
    expect(dayFacts(THU).availP).toBe(f.availP! - 0.5)
    expect(flyAnswer(THU).need.p).toBe(1)
  })

  it('a public holiday shows its tag instead of a class; a running figure skips it and a typed one holds', () => {
    expect(setFlyRun('2026-10-05', { p: 40, w: 40 }).ok).toBe(true)
    expect(flyAnswer(FRI).req).toEqual({ p: 40, w: 40 })
    setDayEvent(FRI, 0, 'PH')
    expect(flyAnswer(FRI)).toMatchObject({ kind: 'ph', cls: null, req: { p: null, w: null }, need: { p: null, w: null }, tone: 'none' })
    setFlyDays([{ iso: FRI, p: 4 }])
    expect(flyAnswer(FRI)).toMatchObject({ kind: 'ph', req: { p: 4, w: null }, reqFrom: { p: 'date', w: null } })
    /* the next ordinary day carries the run on */
    expect(flyAnswer('2026-10-12').req).toEqual({ p: 40, w: 40 })
  })

  it('an Off day does the same; No Leave does not', () => {
    setFlyRun('2026-10-05', { p: 40 })
    setDayEvent(TUE, 0, 'Off day')
    setDayEvent(WED, 0, 'No Leave')
    expect(flyAnswer(TUE)).toMatchObject({ kind: 'off', cls: null, req: { p: null } })
    expect(flyAnswer(WED)).toMatchObject({ kind: null, cls: 'day', req: { p: 40 } })
  })

  it('a no-fly day needs nobody, whatever is typed under it', () => {
    setFlyDays([{ iso: TUE, cls: 'nf', p: 99, w: 99 }])
    expect(flyAnswer(TUE)).toMatchObject({ cls: 'nf', req: { p: 0, w: 0 }, reqFrom: { p: 'nf', w: 'nf' }, need: { p: 0, w: 0 }, tone: 'none' })
  })

  it('a date no leave period covers has its figure but an unknown need', () => {
    setFlyDays([{ iso: '2028-03-01', p: 12, w: 12 }])
    expect(flyAnswer('2028-03-01')).toMatchObject({ req: { p: 12, w: 12 }, need: { p: null, w: null }, tone: 'none' })
  })

  it('the colour follows the three figures an admin set', () => {
    const f = dayFacts(TUE)
    setFlyDays([{ iso: TUE, p: f.availP! + 2 }])
    expect(flyAnswer(TUE).tone).toBe('yellow')
    expect(saveTones({ yellowFrom: 1, amberFrom: 2, redFrom: 4 }).ok).toBe(true)
    expect(flyAnswer(TUE).tone).toBe('amber')
  })
})

describe('a month of answers', () => {
  it('is the same answer, date by date', () => {
    const f = dayFacts(TUE)
    setFlyDays([{ iso: TUE, p: f.availP! + 5, w: 3 }])
    setDayEvent(FRI, 0, 'PH')
    const m = flyMonth(2026, 10)
    expect(Object.keys(m)).toHaveLength(31)
    for (const iso of Object.keys(m)) expect(m[iso]).toEqual(flyAnswer(iso))
    expect(m[TUE]!.tone).toBe('red')
    expect(m[FRI]!.kind).toBe('ph')
  })

  it('moves when a figure that began BEFORE the month changes', () => {
    const before = JSON.stringify(flyMonth(2026, 3))
    setFlyRun('2026-01-12', { p: 18 })
    const after = flyMonth(2026, 3)
    expect(JSON.stringify(after)).not.toBe(before)
    expect(after['2026-03-02']!.req.p).toBe(18)
    expect(after['2026-03-02']!.runStart.p).toBe('2026-01-12')
  })
})

describe('the Leave War reads the flying plan through this seam', () => {
  it('hands on the plan’s own readers, not copies of them', () => {
    expect(sansFly).toBe(planSansFly)
  })
})
