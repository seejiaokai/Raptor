/* CROSS-WEEK VALIDATION — real-data + integration pins (NO mocking; weekctx's
   synthetic-week suite lives in weekctx.test.ts). Two shipping-safety pins
   (A, B) prove the seed data itself raises nothing new now that the engine
   reads across the week line — the whole point of the cross-week work was to
   close real gaps WITHOUT inventing flags nobody asked for. C pins the
   drift-seam between the two independent ±7-day walkers (weeks-data.ts vs
   ui/weeknav.ts) the owner's own doctrine calls out by name. D pins that a
   non-loaded week's seed read (weekctx.ts, off weekBundle) agrees with what
   the SAME week's data produces when it is actually loaded and read live
   (collectEvents/DAYS) — the coupling RUNLEN's own on-set depends on. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { initStore, loadWeek } from '../state/store'
import { collectEvents } from './events'
import { validate } from './validate'
import { CURWEEK } from './waves'
import { seedRunIn, prevSundaySeed } from './weekctx'
import { VCONF } from './rules'
import { PEOPLE, isSpecial } from './people'
import { shiftWeekKey } from './weeks-data'
import { shiftWeek } from '../ui/weeknav'

/* @vitest-environment jsdom — loadWeek/initStore pull in the store, which
   wires the engine's HOOKS; loadweek.test.ts uses the same pragma for the
   same reason. */

beforeEach(() => { initStore(); loadWeek('13/07/2026') })
/* Mandatory even though vitest isolates test FILES by default (per-file
   worker/module registry) — this file still leaves the app's own module
   instance sitting on whichever week the last test loaded, and any later
   test in THIS file (or a future one added to it) must not inherit that.
   loadWeek itself is the real reset path — it clears SCHED/history/view
   state and re-validates, so this is the same "navigate back to Jul 13"
   a scheduler would actually do. */
afterEach(() => { loadWeek('13/07/2026') })

describe('Test A — real data: loading week 2 seeds nothing that fires on its Monday', () => {
  it('week1 Sunday hands week2 a real seedRunIn count (spaceman), but Monday raises no DAYS_RUN/CREW_REST/CREW_TIGHT', () => {
    loadWeek('20/07/2026')
    expect(CURWEEK).toBe('20/07/2026')
    /* the seed is NOT vacuous — week1's Sunday SDO (spaceman, 0800-1800) really
       is read and really does seed a count of 1. It just never reaches 7, and
       spaceman is nowhere on week2's Monday, so nothing about HIM can fire either. */
    expect(seedRunIn(CURWEEK, VCONF.maxRun)).toEqual({ spaceman: 1 })
    expect(prevSundaySeed(CURWEEK).events).toEqual([
      { id: 'spaceman', s: 480, e: 1080, label: 'SDO duty', kind: 'duty', key: 'd:6.0.0' },
    ])
    const r = validate()
    const di0 = r.byDay.find((x: any) => x.di === 0)
    const codes = (di0.warns || []).map((w: any) => w.code)
    expect(codes).not.toContain('DAYS_RUN')
    expect(codes).not.toContain('CREW_REST')
    expect(codes).not.toContain('CREW_TIGHT')
  })
})

describe('Test B — real data: the default seed week is unaffected (prior week unauthored)', () => {
  it('Sunday stays warning-free and Monday gains no cross-week codes', () => {
    expect(CURWEEK).toBe('13/07/2026')
    /* 06/07/2026 (the Monday before the seed week) was never authored, so both
       seeds come back empty — byte-identical to the pre-cross-week behavior */
    expect(seedRunIn(CURWEEK, VCONF.maxRun)).toEqual({})
    expect(prevSundaySeed(CURWEEK)).toEqual({ events: [], input: [], dow: 'Sunday', di: null })
    const r = validate()
    expect(r.byDay.find((x: any) => x.di === 6).warns).toEqual([])
    const codes = (r.byDay.find((x: any) => x.di === 0).warns || []).map((w: any) => w.code)
    expect(codes).not.toContain('DAYS_RUN')
    expect(codes).not.toContain('CREW_REST')
    expect(codes).not.toContain('CREW_TIGHT')
  })
})

describe('Test C — drift-seam pin: shiftWeekKey (engine) and shiftWeek (ui) must never disagree', () => {
  /* the SAME ±7n-day walk, deliberately implemented twice (weeks-data.ts's own
     comment explains why: the engine stays Date-free, the ui layer uses
     Date.UTC) — a plain agreement table is the whole point of a drift seam. */
  const KEYS = [
    '28/12/2026', // Dec → Jan, a calendar-year rollover
    '26/02/2024', // Feb in a LEAP year — 2024 carries the 29th
    '23/02/2025', // Feb in a NON-leap year
  ]
  const NS = [-3, -2, -1, 1, 2, 3]
  KEYS.forEach(key => {
    describe(`for ${key}`, () => {
      NS.forEach(n => {
        it(`n=${n}`, () => {
          expect(shiftWeekKey(key, n)).toBe(shiftWeek(key, n))
        })
      })
    })
  })
})

describe('Test D — coupling pin: a non-loaded seed read agrees with the same week loaded live', () => {
  it("week1's Sunday on-set, read live off DAYS, is exactly the id set weekctx seeds for week2 from it", () => {
    /* LIVE path: load week1 itself and read its Sunday straight off
       collectEvents()/DAYS — RUNLEN's own on-set predicate, applied by hand */
    loadWeek('13/07/2026')
    const liveIds = new Set(
      collectEvents()[6].events
        .filter((e: any) => e.id && PEOPLE[e.id] && !isSpecial(e.id))
        .map((e: any) => e.id),
    )
    expect(liveIds).toEqual(new Set(['spaceman']))
    /* SEED path: weekctx reads that SAME week1 data through weekBundle, as
       "the week before 20/07", without week1 ever being the loaded week —
       seedRunIn only ever populates keys from k=1 (the nearest day), so its
       key set IS workedSet(week1 Sunday)'s id set, whatever maxRun is. */
    const seeded = seedRunIn('20/07/2026', VCONF.maxRun)
    expect(new Set(Object.keys(seeded))).toEqual(liveIds)
  })
})
