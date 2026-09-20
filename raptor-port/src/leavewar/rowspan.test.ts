// A PERSON'S ROW SPANS THEIR RECORDS, not just their posting window
// (CURRENT-STATE item B; owner, 20 Sep 26 — records may be dated before
// someone posts in and after they post out, "because those dates are official
// dates. But they can be for e.g still taking leave after or before they post
// in or out").
//
// The defect this closes: a man posted out in January with clearing leave in
// September was CHARGED for that leave and could not be seen, because the row
// filter dropped him the moment the visible months passed his posting-out date
// (the 19 Aug 26 rule, "once I hit the next month the row disappears"). The
// money and the screen disagreed. That older rule is NARROWED, not reversed —
// a row with nothing out there still disappears exactly as it did.
//
// The three constraints both reviewers insisted on are what these tests pin:
//   1. It is a DISPLAY span and NOTHING else — the person's own dates are
//      untouched, so every manning count still reads zero for him out there.
//      Widening the dates would put a posted-out man back into the counts.
//   2. It is computed ONCE per merge and cached with the grid, so it costs
//      nothing per repaint.
//   3. MONTH granularity, so scrolling inside a month never reshuffles rows.
//
// The hidden tail of a record running past midnight is deliberately NOT a
// record for this purpose: it is never shown and never charged on the second
// date, so there is nothing out there to be visible for.

import { beforeEach, describe, expect, it } from 'vitest'
import { countsFor, inSquadron } from './engine'
import { getState, initStore, setPostIn, setPostOut, setRole } from './state/store'
import { absencesAt } from './state/merge'
import { memoryBackend } from './state/storage'
import { fileAbsence } from './testkit'
import { syncAbsences } from './sync'

beforeEach(() => {
  initStore(memoryBackend())
  setRole('admin')
})

const anId = () => getState().people[0]!.id
/* Someone the demo world has filed nothing for, so the span under test is the
   one this test put there. person[0] carries seeded January leave. */
const cleanId = () => getState().people.find(p => !getState().spans.get(p.id))!.id
const person = (id: string) => getState().people.find(x => x.id === id)!
const span = (id: string) => getState().spans.get(id)

describe("a person's row reaches their records", () => {
  it('a man posted out in January with clearing leave in September still has a September row', () => {
    const id = anId()
    setPostOut(id, '2026-02-01')          // last day in the squadron is 31 Jan
    fileAbsence(id, 'LL', '2026-09-07', '2026-09-11')
    expect(person(id).to).toBe('2026-01-31')
    expect(span(id)!.last).toBe('2026-09')
  })

  it('…and the same at the other end, before he posts in', () => {
    const id = cleanId()
    setPostIn(id, '2026-06-15')
    fileAbsence(id, 'LL', '2026-03-02')
    expect(span(id)!.first).toBe('2026-03')
  })

  it('the official dates never move, so manning still reads zero out there', () => {
    // Constraint 1 — the whole reason this is a display span. If the fix had
    // widened his posting dates instead, a posted-out man would be back in the
    // manning counts, a worse bug than the one being fixed.
    const id = anId()
    const total = (d: string) => {
      const s = getState()
      const c = countsFor(s.people, s.grid, s.states, d)
      return c.byCategory.IP + c.byCategory.OPSP + c.byCategory.IWSO + c.byCategory.OPSW
    }
    const before = total('2026-09-07')
    setPostOut(id, '2026-02-01')
    fileAbsence(id, 'LL', '2026-09-07')
    expect(inSquadron(person(id), '2026-09-07')).toBe(false)
    expect(total('2026-09-07')).toBe(before - 1)
    expect(person(id).to).toBe('2026-01-31')
  })

  it('nothing reaches past the posting dates on its own — the 19 Aug rule is narrowed, not reversed', () => {
    // A man with no records outside his window keeps a span that stays inside
    // it, so his row still disappears once the months pass his posting-out
    // date exactly as it did before.
    const id = cleanId()
    expect(span(id)).toBeUndefined()          // nothing filed at all
    setPostOut(id, '2026-06-01')              // last day in is 31 May
    fileAbsence(id, 'LL', '2026-03-02')       // inside the window
    expect(span(id)).toEqual({ first: '2026-03', last: '2026-03' })
  })

  it('is month-granular, so scrolling inside a month cannot reshuffle the rows', () => {
    const id = cleanId()
    fileAbsence(id, 'LL', '2026-09-14')
    expect(span(id)).toEqual({ first: '2026-09', last: '2026-09' })
  })

  it('the hidden tail of a record running past midnight does not extend the row', () => {
    // An overnight medical spills onto the next date for CLASH purposes only —
    // it is never shown and never charged there. A row must not appear for it.
    const id = cleanId()
    const row = fileAbsence(id, 'ATTC', '2026-09-30')
    row.s = 20 * 60
    row.e = 26 * 60            // 02:00 the next morning
    delete row.allday
    syncAbsences()
    // The tail IS there — it has to be, for the clash test on the 1st…
    expect(absencesAt(id, '2026-10-01').some(c => c.spill)).toBe(true)
    // …and it shows nothing on that date, so the row does not reach October.
    expect(getState().views[id]?.['2026-10-01']?.all.length ?? 0).toBe(0)
    expect(span(id)!.last).toBe('2026-09')
  })

  it('is computed once per merge and handed back as the same object', () => {
    // Constraint 2. `getState()` caches on (raw state, absence version), so two
    // reads with nothing changed in between must return the very same map —
    // this is what keeps it off the per-repaint path.
    const id = cleanId()
    fileAbsence(id, 'LL', '2026-09-14')
    expect(getState().spans).toBe(getState().spans)
  })
})
