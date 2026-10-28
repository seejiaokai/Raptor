/* THE DEMO'S M5a FIGURES (the build spec §8 — "the demo seeded with typed figures, grades, a man with no grade, pending and
   approved leave either side of the typed date, so the walk has them"). Booted the way the app boots (bootseal.test.ts's
   order on the real whiteboard and postman): the first boot lays them on and saves them as rows; the reload reads them
   back whole and does not lay them on twice; Ranger reads the approved drawings' figures (full-m5a-person.mjs RANGER). */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { storeBackend } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { initStore as raptorInitStore, weekStashSnap, weekDirty } from '../state/store'
import { hydrate, wirePersist, leaveWarStarted } from '../state/persist'
import { initStore as lwInitStore, leaveFiguresOf, gradeOf, rawState, getState } from './state/store'
import { demoBalances, installDemoWorld } from './state/demoworld'
import { projectPeople } from './state/raptorRoster'
import { wireLeaveWarSync } from './sync'
import { resyncSchedBaseline } from '../state/sched-commit'
import { bootStorage } from '../storage/boot'
import { settingsAdapter, leavewarAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { openBootGroup } from '../storage/schema'
import { setMemberTodayForTests } from './engine'
import { myLeaveOf } from './ui/myleave'

const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => { vi.useFakeTimers(); INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r)); stashClear(); setMemberTodayForTests('2026-01-25') })
afterEach(() => { vi.useRealTimers(); setMemberTodayForTests('2000-01-01') })

async function boot(be: MemoryBackend, seedDemo = true) {
  const { wb, postman } = await bootStorage(be)
  const group = openBootGroup(wb)
  storeBackend.impl = settingsAdapter(wb)
  hydrate(wb)
  raptorInitStore()
  const had = leaveWarStarted(wb)
  lwInitStore(leavewarAdapter(wb), { started: had })
  installDemoWorld(had, seedDemo)
  resyncSchedBaseline()
  wireLeaveWarSync()
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
  group.seal()
  await postman.flush()
  return { had }
}

describe('the demo world carries the M5a walk\'s figures', () => {
  it('most men typed, every third a CCL, every seventh never typed; grades by seat and band; Outlaw has none', () => {
    const people = projectPeople()
    const d = demoBalances(people)
    const typed = people.filter(p => d.balances[p.id]?.LVE)
    expect(typed.length).toBeGreaterThan(people.length / 2)
    expect(typed.length).toBeLessThan(people.length)                      // some never typed (reading 4)
    expect(people.filter(p => d.balances[p.id]?.CCL).length).toBeGreaterThan(3)
    for (const p of people) {
      const g = d.gradeHist[p.id]![0]!.id
      if (p.id === 'casper') expect(g).toBeNull()
      else if (p.seat === 'gnd') expect(g).toBe('opsa')
      else if (p.seat === 'wso') expect(g).toBe(p.band === 'instructor' ? 'sw' : 'jw')
      else expect(g).toBe(p.band === 'instructor' ? 'sp' : 'jp')
    }
    /* a typed day before some of the seed's approved leave and after the rest: the leave on or before 10 Jan is in the
       snapshot (it takes nothing off), the later leave is not (it comes off) */
    expect(d.balances.slipway!.LVE!.snap).toEqual([['2026-01-01', 'day']])               // RAMP's OL, 1 Jan
    expect(d.balances.dj!.LVE!.snap).toEqual([])                                          // JAGUAR's OL is 16–17 Jan
    expect(d.balances.rocky!.LVE!.amount).toBe(-2)                                        // below zero (D1474's case)
  })

  it('the first boot saves them as rows; the reload reads them back whole, laid on once; Ranger reads the drawings\' figures', async () => {
    const be = new MemoryBackend()
    expect((await boot(be)).had).toBe(false)
    const snap = await be.loadAll()
    expect(snap.leavewar['bal:bane:LVE']).toBeTruthy()
    expect(snap.leavewar['grade:bane']).toBeTruthy()
    const balances = JSON.stringify(rawState().balances), grades = JSON.stringify(rawState().gradeHist)
    expect(gradeOf('casper')).toBeNull()
    expect(gradeOf('bane')?.name).toBe('Senior pilot')

    /* Ranger, as drawn: typed 17 incl. 4 on 5 Jan; 19–21 Jan approved before (in the snapshot), 26–27 Jan since; 29 Jan
       AM and 12–13 Feb pending; CCL 3 with 2 Mar pending */
    const f = leaveFiguresOf('bane')
    expect(f.kinds.LVE).toMatchObject({ app: 15, cf: 2, pending: 2.5, war: 12.5 })
    expect(f.kinds.CCL).toMatchObject({ app: 3, pending: 1, war: 2 })
    expect(f.kinds.PL).toMatchObject({ app: 2, pending: 0.5, war: 1.5 })
    expect(f.kinds.CL).toMatchObject({ app: 1, pending: 1, war: 0 })
    expect(f.kinds.FCL.app).toBe(5)
    expect(f.kinds.EL.app).toBe(4)
    expect(myLeaveOf(getState().wars, 'bane', '2026-01-25').pending).toBe(5)       // 0.5 + 2 LL, 1 CCL, 0.5 PL, 1 CL

    INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r)); stashClear()
    expect((await boot(be)).had).toBe(true)
    expect(JSON.stringify(rawState().balances)).toBe(balances)
    expect(JSON.stringify(rawState().gradeHist)).toBe(grades)
  })

  it('a shared store\'s first boot gets none of it', async () => {
    const be = new MemoryBackend()
    await boot(be, false)
    expect(rawState().balances).toEqual({})
    expect(rawState().gradeHist).toEqual({})
  })
})
