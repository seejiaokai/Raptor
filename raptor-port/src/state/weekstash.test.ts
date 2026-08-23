/* @vitest-environment jsdom — loadWeek/initStore pull in the store, which
   wires the engine's HOOKS; loadweek.test.ts uses the same pragma for the
   same reason. */
/* THE PER-WEEK SESSION STASH (engine/weekstash.ts + state/store.ts's
   applyWeekModel/weekStashSnap/weekBaseline/reconcileLandedAcc,
   engine/weekctx.ts's bundle()) — owner-reported bug: a duty added on the
   Sunday of an unauthored week vanished after scrolling to the next week and
   back. Round-trip, pristine-week and cross-week-seeding pins for that
   mechanism. The existing no-bleed pins in loadweek.test.ts are NOT
   duplicated here — they stay the place a plain week switch (no stash
   involved) is pinned; this file re-runs them (see the Build & verify
   report) to confirm the stash work left them green.

   SESSION-ONLY, DELIBERATELY (owner, 23 Aug 26 — see weekstash.ts's own
   header): there is no localStorage envelope at all — a reload forgets every
   week's edits, same as the rest of the app. This file pins that directly
   (no writes ever reach storeBackend) rather than pinning a persistence
   contract that was deliberately removed. */
import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { initStore, loadWeek, afterSchedMutate } from './store'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { markStructuralAdd } from '../engine/publish'
import { validate, WARN } from '../engine/validate'
import { CURWEEK } from '../engine/waves'
import { shiftWeekKey } from '../engine/weeks-data'
import { weekBundle } from '../engine/weeks-data'
import { stashHas, stashPut, stashDays } from '../engine/weekstash'
import { seedRunIn, prevSundaySeed } from '../engine/weekctx'
import { VCONF } from '../engine/rules'
import { storeBackend } from '../engine/hooks'
import * as view from '../state/view'

/* an arbitrary base far from both the real seed weeks (Jul 2026) and each
   other — 10 weeks apart, the same discipline weekctx.test.ts uses so no
   two tests in this file (or a future one added to it) ever touch the same
   week key. */
const BASE = '01/01/2024'
const wkFor = (i: number) => shiftWeekKey(BASE, i * 10)

beforeAll(() => { initStore() })
/* every test is free to load whatever weeks it needs; return to the seed
   week so the next test starts from the same place (crossweek.test.ts's own
   discipline, for the same reason — module state, not per-test). */
afterEach(() => { if (CURWEEK !== '13/07/2026') loadWeek('13/07/2026') })

describe('round trip: an edited week keeps its edit, its amendment marks and its muted warnings', () => {
  it('a duty block added, left, and returned to is still there', () => {
    const WK = wkFor(0)
    loadWeek(WK)
    expect((DAYS[6] as any).dutywaves).toEqual([])   // a blank, unauthored week to start
    ;(DAYS[6] as any).dutywaves.push({ label: 'Duty', rows: [{ role: 'SDO', id: 'waldo', str: '1900', end: '2300' }] })
    markStructuralAdd('dl:6.0')
    afterSchedMutate()
    view.WARNOFF.add('CREW_REST|waldo|dummy')
    loadWeek(wkFor(1))          // leave WK — stashes it (it changed since load)
    loadWeek(WK)                // and back
    expect((DAYS[6] as any).dutywaves[0]).toEqual({ label: 'Duty', rows: [{ role: 'SDO', id: 'waldo', str: '1900', end: '2300' }] })
    expect(SCHED.pending['dl:6.0']).toBe(1)
    expect(SCHED.added['dl:6.0']).toBe(1)
    expect(view.WARNOFF.has('CREW_REST|waldo|dummy'), 'a muted warning stays muted across the round trip').toBe(true)
  })
})

describe('a week nobody touched leaves no stash entry', () => {
  it('visiting and leaving without an edit is pristine — no stash, and the pure seed on return', () => {
    const WK = wkFor(2)
    loadWeek(WK)                // first visit — nothing is mutated
    loadWeek(wkFor(3))          // leave, untouched
    expect(stashHas(WK), 'a pristine week is never stashed').toBe(false)
    loadWeek(WK)                // back — must be the pure seed, not a phantom empty stash entry
    expect(JSON.parse(JSON.stringify(DAYS))).toEqual(weekBundle(WK).days)
  })
})

describe('session-only, deliberately — no localStorage envelope', () => {
  it('editing and leaving a week never writes to storeBackend', () => {
    const mem: Record<string, string> = {}
    const setCalls: string[] = []
    const was = storeBackend.impl
    storeBackend.impl = {
      getItem: (k: string) => (k in mem ? mem[k] : null),
      setItem: (k: string, v: string) => { setCalls.push(k); mem[k] = v },
    }
    try {
      const WK = wkFor(5)
      loadWeek(WK)
      ;(DAYS[6] as any).dutywaves.push({ label: 'Duty', rows: [{ role: 'SDO', id: 'waldo', str: '1900', end: '2300' }] })
      markStructuralAdd('dl:6.0')
      afterSchedMutate()
      loadWeek(wkFor(6))   // leave it — stashed in-session only
      loadWeek(WK)          // and back, still there, with no backend ever touched
      expect((DAYS[6] as any).dutywaves.length).toBe(1)
      expect(setCalls, 'no write of any kind reached storeBackend for the per-week stash').toEqual([])
      expect(mem['sqn142_weeks']).toBeUndefined()
    } finally { storeBackend.impl = was }
  })
})

describe('a garbage stash entry degrades safely for cross-week engine reads', () => {
  /* the only guarded reader of a raw stash string is weekstash.ts's own
     stashDays() — the one weekctx.ts's bundle() (seedRunIn/prevSundaySeed/
     nextMondaySeed, and so ui/peek.ts's preview) goes through for a
     NON-loaded week. A garbage entry can only land here by direct API
     misuse (stashPut is always fed weekStashSnap()'s own JSON.stringify
     output in the real app), but the guard exists for exactly this input
     and never throws inside validate(), which runs on every keystroke. */
  it('stashPut with a non-JSON string leaves stashDays null, and the cross-week seed falls back to the pure blank week', () => {
    const WK = wkFor(7)
    const prevKey = shiftWeekKey(WK, -1)
    stashPut(prevKey, 'not-json-garbage')
    expect(stashDays(prevKey), 'a corrupt blob degrades to "nothing stashed"').toBeNull()
    expect(() => seedRunIn(WK, VCONF.maxRun)).not.toThrow()
    expect(seedRunIn(WK, VCONF.maxRun)).toEqual({})
    expect(prevSundaySeed(WK)).toEqual({ events: [], input: [], dow: 'Sunday', di: null })
  })
})

describe("the owner's reported bug: a Sunday duty on the unauthored week before the seed week", () => {
  it('busts the seed week\'s Monday, and survives leaving and returning to the Sunday itself', () => {
    loadWeek('06/07/2026')
    expect(DAYS.every((d: any) => (d.waves || []).length === 0), 'unauthored — a blank week').toBe(true)
    /* stiff flies Monday's first wave (VL, T/O 12:40, in-time 1200H) — his
       instructed report is well before 11:00, so a Sunday duty ending 23:00
       leaves him short of the 12h crew-rest clock. */
    ;(DAYS[6] as any).dutywaves.push({ label: 'Duty', rows: [{ role: 'SDO', id: 'stiff', str: '1900', end: '2300' }] })
    markStructuralAdd('dl:6.0')
    afterSchedMutate()

    loadWeek('13/07/2026')
    const mon = WARN.byDay.find((g: any) => g.di === 0)
    const hit = (mon.warns || []).find((w: any) =>
      (w.code === 'CREW_REST' || w.code === 'CREW_TIGHT') && (w.who || []).includes('stiff'))
    expect(hit, "Monday flags the breach seeded from the previous week's Sunday").toBeTruthy()
    expect(hit.msg).toContain('Sunday')

    loadWeek('06/07/2026')
    expect((DAYS[6] as any).dutywaves[0].rows.some((r: any) => r.id === 'stiff' && r.end === '2300'),
      'the duty is still there back on the Sunday it was planted on').toBe(true)
  })
})

describe("DAYS_RUN reads a run built entirely from a stashed previous week", () => {
  it("7 days worked in the stashed previous week plus the loaded Monday trips the max-run warning", () => {
    const WK = wkFor(4)
    const prevKey = shiftWeekKey(WK, -1)
    loadWeek(prevKey)
    for (let i = 0; i < 7; i++) {
      const d: any = DAYS[i]
      d.ground = d.ground || []
      d.ground.push({ prog: 'DUTY SPELL', str: '0900', end: '1000', who: 'waldo' })
      markStructuralAdd(`gr:${i}.${d.ground.length - 1}.prog`)
    }
    afterSchedMutate()
    loadWeek(WK)   // leaving prevKey stashes it — it changed since load
    const d0: any = DAYS[0]
    d0.ground = d0.ground || []
    d0.ground.push({ prog: 'DUTY SPELL', str: '0900', end: '1000', who: 'waldo' })
    markStructuralAdd(`gr:0.${d0.ground.length - 1}.prog`)
    afterSchedMutate()
    const r = validate()
    const hit = r.all.find((w: any) => w.code === 'DAYS_RUN' && (w.who || []).includes('waldo') && w.di === 0)
    expect(hit, "the stashed previous week's run reaches Monday's count").toBeTruthy()
    /* seedRunIn only ever walks back VCONF.maxRun days (the standard 6), so
       the 7th of the stashed week's filled days never enters the count —
       6 seeded + Monday itself = 7, one past the limit. */
    expect(hit.msg).toContain('7 days in a row')
  })
})
