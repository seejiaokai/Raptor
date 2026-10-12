/* ALL AVAIL / ALL AS ONE OF AN INPUT'S OWN PEOPLE — WHAT ONE RECORD MAY HOLD ([ALL-AVAIL-AS-MEMBER] step 3, 12 Oct 26; the
   plan docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.1, §4.4). His rulings:
   D753 — "when ALL AVAIL or ALL is one of a shared input's own people … it is offered only where the input is a single
           day; and an input takes ALL or ALL AVAIL, never both";
   D755 — "a row that came from an input IS the input: whoever stands on it — a named person or ALL AVAIL / ALL … — is
           in the input"; (4) "where it cannot apply the drop is refused with the reason — ALL AVAIL on an input longer
           than a day or of another kind, other people on a Personal input";
   D712, D713 — the six kinds; D711 (3) — one day; D655 reading 4 — a medical entry is one person's.

   UNTIL THIS STEP a placeholder was "filed on its own": the one body (inputs.ts placeholderProblem) refused it beside
   anyone. That clause is gone; its other rules stand — and the same body still says them for every door: the people
   picker, the input's window, the row on the schedule, the save boundary. The words are the plan's, the shortest that
   are still understood (D726, D765 reading 5). */
import { describe, it, expect } from 'vitest'
import { placeholderProblem, shapeProblem, isPlaceholderInput, namedOf, placeholderOf, inputLines, inpDetailKey } from './inputs'

const one = (over: any = {}) => ({ type: 'Training', date: 'Jul 18', yr: 2026, people: [{ p: 'bane' }, { p: 'allavail' }], ...over })

describe('a placeholder may be one of an input\'s people (D753, D755)', () => {
  it('a named person and ALL AVAIL in one single-day Training: nothing is wrong with it', () => {
    expect(placeholderProblem(one())).toBe('')
    expect(shapeProblem(one())).toBe('')
    expect(isPlaceholderInput(one())).toBe(true)
  })
  it('several named people and ALL: nothing wrong either — and ALL AVAIL alone, as before', () => {
    expect(shapeProblem(one({ people: [{ p: 'bane' }, { p: 'pike' }, { p: 'split' }, { p: 'all' }] }))).toBe('')
    expect(shapeProblem(one({ people: [{ p: 'allavail' }] }))).toBe('')
    expect(shapeProblem({ type: 'Training', date: 'Jul 18', yr: 2026, person: 'allavail' }), 'the old shape').toBe('')
  })
  it('each of the six kinds takes it', () => {
    for (const type of ['Training', 'Meeting', 'Appointment', 'Duty', 'Event', 'Other'])
      expect(shapeProblem(one({ type })), type).toBe('')
  })
  it('the rules read it as they read the record: a line a NAMED person, none for the placeholder', () => {
    expect(inputLines([one({ iid: 'i1' })]).map((l: any) => l.person)).toEqual(['bane'])
    expect(namedOf(one()).map((e: any) => e.p)).toEqual(['bane'])
    expect(placeholderOf(one()).p).toBe('allavail')
  })
  it('who is in it is part of what it says — with ALL AVAIL in it, it says something else (D178)', () => {
    expect(inpDetailKey(one())).not.toBe(inpDetailKey(one({ people: [{ p: 'bane' }] })))
    expect(inpDetailKey(one()), 'the order they joined in is no part of it').toBe(inpDetailKey(one({ people: [{ p: 'allavail' }, { p: 'bane' }] })))
  })
})

describe('where it cannot apply, the one body says why (D753, D755 (4))', () => {
  it('ALL and ALL AVAIL together — never both', () => {
    expect(shapeProblem(one({ people: [{ p: 'bane' }, { p: 'allavail' }, { p: 'all' }] }))).toBe('This input already has ALL AVAIL')
    expect(shapeProblem(one({ people: [{ p: 'all' }, { p: 'allavail' }] }))).toBe('This input already has ALL')
  })
  it('an input longer than a day', () => {
    expect(placeholderProblem(one({ endDate: 'Jul 20' }))).toBe('ALL AVAIL is for one day')
    expect(shapeProblem(one({ endDate: 'Jul 20', people: [{ p: 'bane' }, { p: 'all' }] }))).toBe('ALL is for one day')
    expect(placeholderProblem(one({ endDate: 'Jul 18' })), 'an end on its own day is one day').toBe('')
  })
  it('a kind that is not one of the six', () => {
    const why = 'ALL AVAIL is for Training, Meeting, Personal, Appointment, Duty, Event and Other'
    expect(placeholderProblem(one({ type: 'OL' }))).toBe(why)
    expect(placeholderProblem(one({ type: 'OD' }))).toBe(why)
    expect(placeholderProblem(one({ type: 'Fly with' }))).toBe(why)
  })
  /* A NAMED RULING CHANGED THIS CASE (D776 "A2", D778 — 12 Oct 26). It read "a Personal input is one person's own —
     nobody beside him, a placeholder included" (D755 (4), D712). A Personal input is now the same as an Event for
     everything about people: several people, and ALL AVAIL / ALL on a one-day one. */
  it('a Personal input holds several people, and a placeholder, as an Event does (D776, D778)', () => {
    expect(shapeProblem(one({ type: 'Personal' }))).toBe('')
    expect(shapeProblem(one({ type: 'Personal', people: [{ p: 'bane' }, { p: 'pike' }] }))).toBe('')
    expect(shapeProblem(one({ type: 'Personal', people: [{ p: 'bane' }, { p: 'pike' }, { p: 'allavail' }] }))).toBe('')
  })
  it('never under Unavailable — that names a real person\'s day', () => {
    expect(placeholderProblem(one({ acc: 'u' }))).toMatch(/cannot be filed under Unavailable/)
  })
  it('an input with no placeholder is not this body\'s to judge', () => {
    expect(placeholderProblem(one({ people: [{ p: 'bane' }, { p: 'pike' }], endDate: 'Jul 20', type: 'OL' }))).toBe('')
  })
})
