// THE TWO FINAL CODE READS of [OIL-AWARD-IS-A-GRANT] (29 Sep 26) — each finding pinned red first, then fixed.
// Reports: docs/handpass/2026-09-29-oil-award-final-astra.md (OA-001 – OA-004), …-final-fable.md (F1 – F5).

import { beforeEach, describe, expect, it } from 'vitest'
import { describeEntry } from '../undo'
import {
  awardsOnDay, getState, grantOil, grantTo, initStore, lwHistInit, rawState, setCell, setDayAward, setRole,
  updateLedgerEntry,
} from './state/store'
import { memoryBackend } from './state/storage'

const TUE = '2026-01-13'

beforeEach(() => {
  initStore(memoryBackend())
  lwHistInit()
  setRole('admin')
})

describe('OA-001 / F4 — one ceiling for one record: an award is at most 365 days, from every door', () => {
  it('the tracker and the figures bar refuse 365.5; 365 is taken', () => {
    expect(grantOil(['slammed'], 365.5, TUE, 'too much')).toContain('more than 365 days')
    expect(grantTo(['slammed'], 'oil', 365.5, TUE, 'too much')).toContain('more than 365 days')
    expect(grantOil(['slammed'], 365, TUE, 'a year')).toBeNull()
  })

  it('an award given on the grid cannot be raised past it from the tracker, and a refusal changes nothing', () => {
    expect(setDayAward('slammed', TUE, 1)).toBeNull()
    const e = awardsOnDay('slammed', TUE)[0]!
    expect(updateLedgerEntry(e.id, { amount: 365.5 })).toContain('more than 365 days')
    expect(awardsOnDay('slammed', TUE)[0]).toEqual(e)
  })

  it('a correction is not an award — the ceiling is not its rule', () => {
    expect(grantOil(['slammed'], -400, TUE, 'a big correction')).toBeNull()
  })
})

describe('OA-003 — Undo names BOTH when a delete takes a bid and an award', () => {
  const entry = (cellBefore: any[], ledger: any[]) => ({
    seq: 1, type: 'lw.clear', scope: { module: 'lw' }, label: '', forward: [
      { collection: 'lw.cell', id: `y2026:pike:${TUE}`, before: cellBefore, after: [] },
      ...ledger.map(e => ({ collection: 'lw.ledger', id: e.id, before: e, after: undefined })),
    ],
  }) as any
  const bid = { id: 'r1', kind: 'request', code: 'LL', state: 'pending' }
  const award = (id: string) => ({ id, personId: 'slammed', counter: 'oil', amount: 1, date: TUE, reason: '', approvedBy: 'admin' })

  it('a bid and one award: "removing …’s bid and OIL award"', () => {
    expect(describeEntry(entry([bid], [award('ol-a')]))).toMatch(/bid and OIL award$/)
  })
  it('a bid and several awards: the count is said', () => {
    expect(describeEntry(entry([bid], [award('ol-a'), award('ol-b')]))).toMatch(/bid and 2 OIL awards$/)
  })
  it('a bid alone and an award alone keep their own words', () => {
    expect(describeEntry(entry([bid], []))).toMatch(/bid$/)
    expect(describeEntry({ seq: 2, type: 'lw.award', scope: { module: 'lw' }, label: '', forward: [{ collection: 'lw.ledger', id: 'ol-a', before: award('ol-a'), after: undefined }] } as any)).toMatch(/OIL awards?$/)
  })
})

describe('OA-004 / F3 — a man whose awards were entered out of date order is not re-merged by someone else’s write', () => {
  it('his merged row keeps its identity', () => {
    grantOil(['slammed'], 1, '2026-01-13', 'a')
    grantOil(['slammed'], 1, '2026-01-14', 'b')
    grantOil(['slammed'], 1, '2026-01-13', 'c')          // back to the first day
    const before = getState().wars[0]!.views.slammed
    grantOil(['ramp'], 1, '2026-01-15', 'someone else')
    expect(getState().wars[0]!.views.slammed).toBe(before)
    grantTo(['ramp'], 'ccl', 1, '2026-01-15', '')  // a write that is no award at all
    expect(getState().wars[0]!.views.slammed).toBe(before)
  })
})

describe('F2 — a clear on a date no war holds takes nothing', () => {
  it('setCell(…, "") on a day in no war leaves a tracker award there alone', () => {
    const far = '2029-06-05'
    expect(grantOil(['slammed'], 1, far, 'far off')).toBeNull()
    const ledger = rawState().ledger
    expect(setCell('slammed', far, '')).toBe(false)
    expect(rawState().ledger).toBe(ledger)
  })
})
