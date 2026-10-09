/* THE INPUT CARD'S FACTS (owner D718–D724, 10 Oct 26 — `[INPUT-LIST-AS-DAY-CARD]`; the plan
   docs/superpowers/plans/2026-10-10-input-card-plan.md §2.1). One pure body says what a card prints — the opened day
   and the phone's list draw whatever it answers, so the two cannot differ.

   D721: every name of a shared input, never "+N". D723: the kind's own name on the top line, always; the title on a row
   of its own only where it is not the kind's name. D720 / D723 / D724: "By Saber" — for one person only where someone
   else placed it; for several people always; never a day or a time. */
import { describe, expect, it } from 'vitest'
import { cardOf, cardWhen, lateNoteOf } from './inputcard-model'

const P: Record<string, any> = {
  a: { cs: 'Ace' }, b: { cs: 'Blade' }, r: { cs: 'Ranger' }, s: { cs: 'Saber' }, z: { cs: 'zulu' },
  allavail: { cs: 'ALL AVAIL', special: true }, all: { cs: 'ALL', special: true },
}
const T = new Date(2026, 6, 10, 9, 30).getTime()
const rec = (over: any) => ({ iid: 'i' + Math.random(), person: 'r', type: 'Duty', date: 'Jul 18', yr: 2026, allday: false, s: 780, e: 900, by: 'r', at: T, ...over })

describe('who it is for', () => {
  it('one person: his callsign', () => {
    expect(cardOf([rec({})], P).names).toBe('Ranger')
  })
  it('a shared input names EVERYONE, A to Z, whatever order the records come in — never "+N" (D721)', () => {
    const rows = ['s', 'z', 'a', 'r', 'b'].map(person => rec({ person, grp: 'g1', grpBy: 's', by: 's' }))
    expect(cardOf(rows, P).names).toBe('Ace, Blade, Ranger, Saber, zulu')
    expect(cardOf(rows, P).names).not.toMatch(/\+\d/)
  })
  it('an input for ALL AVAIL or ALL reads the placeholder’s own name', () => {
    expect(cardOf([rec({ person: 'allavail', by: 's' })], P).names).toBe('ALL AVAIL')
    expect(cardOf([rec({ person: 'all', by: 's' })], P).names).toBe('ALL')
  })
  it('someone no list knows is said by his id, never left blank', () => {
    expect(cardOf([rec({ person: 'p99' })], P).names).toBe('p99')
  })
})

describe('the kind, the title and the remark', () => {
  it('the kind is the kind’s own name — with a title or without', () => {
    expect(cardOf([rec({ type: 'Event', title: 'Sports day' })], P).kind).toBe('Event')
    expect(cardOf([rec({ type: 'Duty' })], P).kind).toBe('Duty')
    expect(cardOf([rec({ type: 'OIL', allday: true })], P).kind).toBe('OIL')
  })
  it('the title is the input’s own, only where it is not the kind’s name (D722, D723)', () => {
    expect(cardOf([rec({ type: 'Event', title: 'Sports day' })], P).title).toBe('Sports day')
    expect(cardOf([rec({ type: 'Event' })], P).title).toBe('')
    expect(cardOf([rec({ type: 'Event', title: 'event' })], P).title, 'the kind’s own name typed back is no title').toBe('')
  })
  it('a title on a kind that takes none is not shown', () => {
    expect(cardOf([rec({ type: 'LL', title: 'Holiday', allday: true })], P).title).toBe('')
  })
  it('the remark is the remark as stored; a blank one is none', () => {
    expect(cardOf([rec({ remarks: 'bring boots' })], P).remark).toBe('bring boots')
    expect(cardOf([rec({ remarks: '   ' })], P).remark).toBe('')
    expect(cardOf([rec({})], P).remark).toBe('')
  })
})

describe('"By Saber" — who placed it (D720, D723, D724)', () => {
  it('one person, placed by himself: nothing', () => {
    expect(cardOf([rec({ person: 'r', by: 'r' })], P).by).toBe('')
  })
  it('one person, placed by someone else: the filer’s callsign — no "for", no day, no time', () => {
    expect(cardOf([rec({ person: 'r', by: 's' })], P).by).toBe('Saber')
  })
  it('several people: ALWAYS — even where the filer is one of them (D724)', () => {
    const rows = ['a', 's', 'r'].map(person => rec({ person, grp: 'g1', grpBy: 's', by: 's' }))
    expect(cardOf(rows, P).by).toBe('Saber')
  })
  it('several people, filed by someone outside it', () => {
    const rows = ['a', 'r'].map(person => rec({ person, grp: 'g1', grpBy: 's', by: 's' }))
    expect(cardOf(rows, P).by).toBe('Saber')
  })
  it('a shared input’s filer is the entry’s own (`grpBy`) — not whoever added a man later', () => {
    const rows = [rec({ person: 'a', grp: 'g1', grpBy: 's', by: 's' }), rec({ person: 'r', grp: 'g1', grpBy: 's', by: 'b' })]
    expect(cardOf(rows, P).by).toBe('Saber')
  })
  it('an input for ALL AVAIL always says it — its filer is never its person', () => {
    expect(cardOf([rec({ person: 'allavail', by: 's' })], P).by).toBe('Saber')
  })
  it('a record that never recorded who placed it says nothing (D56) — one person or several', () => {
    expect(cardOf([rec({ person: 'r', by: undefined, at: undefined })], P).by).toBe('')
    expect(cardOf(['a', 'r'].map(person => rec({ person, grp: 'g1', by: undefined, at: undefined })), P).by).toBe('')
  })
  it('a filer since taken off every list is still said, in words', () => {
    expect(cardOf([rec({ person: 'r', by: 'gone' })], P).by).toBe('someone no longer listed')
  })
  it('a later change by someone else does not put a name on a man’s own input (the change is in the window — D723)', () => {
    expect(cardOf([rec({ person: 'r', by: 'r', modBy: 's', modAt: T + 5000 })], P).by).toBe('')
  })
})

describe('the colour square', () => {
  it('red for an absence, amber for a duty or a commitment — and for an upchit', () => {
    expect(cardOf([rec({ type: 'LL', allday: true })], P).tone).toBe('red')
    expect(cardOf([rec({ type: 'OIL', allday: true })], P).tone).toBe('red')
    expect(cardOf([rec({ type: 'Duty' })], P).tone).toBe('amb')
    expect(cardOf([rec({ type: 'Upchit', allday: true })], P).tone).toBe('amb')
  })
})

describe('when it is', () => {
  it('its hours, "All day", or a half day', () => {
    expect(cardWhen(rec({ s: 600, e: 660 }), '2026-07-18', '2026-07-18')).toBe('10:00–11:00')
    expect(cardWhen(rec({ allday: true }), '2026-07-18', '2026-07-18')).toBe('All day')
    expect(cardWhen(rec({ allday: false, half: 'am' }), '2026-07-18', '2026-07-18')).toBe('AM')
  })
  it('one that runs on past the day it is shown under says the day it runs till', () => {
    expect(cardWhen(rec({ allday: true }), '2026-07-20', '2026-07-18')).toBe('till 20 Jul')
    expect(cardWhen(rec({ s: 600, e: 660 }), '2026-07-20', '2026-07-18')).toBe('10:00–11:00 · till 20 Jul')
  })
  it('shown under its last day it says its hours', () => {
    expect(cardWhen(rec({ allday: true }), '2026-07-20', '2026-07-20')).toBe('All day')
  })
})

describe('the LATE note (D646)', () => {
  const late = (r: any) => (r.late ? 'after the cut-off, Wed 1 Jul' : '')
  it('nobody late: no note, so no tag', () => {
    expect(lateNoteOf([rec({})], late, P)).toBe('')
  })
  it('one person late: the cut-off he missed', () => {
    expect(lateNoteOf([rec({ late: true })], late, P)).toBe('after the cut-off, Wed 1 Jul')
  })
  it('a shared input, everyone late alike: the one sentence', () => {
    const rows = ['a', 'r'].map(person => rec({ person, late: true }))
    expect(lateNoteOf(rows, late, P)).toBe('after the cut-off, Wed 1 Jul')
  })
  it('a shared input where only some are late names who — a man added later can be late alone', () => {
    const rows = [rec({ person: 'a' }), rec({ person: 'r', late: true }), rec({ person: 'b', late: true })]
    expect(lateNoteOf(rows, late, P)).toBe('Blade, Ranger: after the cut-off, Wed 1 Jul')
  })
  it('…and where their cut-offs differ, each with his own', () => {
    const l2 = (r: any) => (r.late ? `after the cut-off, ${r.late}` : '')
    const rows = [rec({ person: 'a', late: 'Wed 1 Jul' }), rec({ person: 'r', late: 'Wed 8 Jul' })]
    expect(lateNoteOf(rows, l2, P)).toBe('Ace: after the cut-off, Wed 1 Jul · Ranger: after the cut-off, Wed 8 Jul')
  })
})
