/* THE VOIDING RULE FOR AN INPUT'S OIL ANSWERS, AS ONE FUNCTION (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.13, the commit gate's test 3).

   The rule itself is the owner's of 28 Aug 26, and lived inline in the editor's save (ui/inputedit.tsx
   commitInputEdit): the answers are void when the input is retyped out of the kinds that ask, or handed to another
   man; a POSITIVE answer the new hours no longer price is dropped; a "no" (0) stays — hours cannot change a no; a
   change of dates alone keeps them. It is one function now so the check on what a member's command really changed
   (state/perms.ts) can ask the very same question the save answers. */
import { describe, expect, it } from 'vitest'
import { voidedOil } from './oil'

const row = (o: Record<string, any> = {}) => ({ person: 'bane', type: 'Meeting', allday: false, s: 540, e: 600, ...o })
const SAT = '2026-02-14', SUN = '2026-02-15'

describe('voidedOil(before, after) — the answers the app\'s own rule leaves standing', () => {
  it('no answers: nothing to leave', () => {
    expect(voidedOil(row(), row({ e: 720 }))).toBeUndefined()
  })
  it('the hours unchanged: every answer stands', () => {
    const oil = { [SAT]: 0.5, [SUN]: 0 }
    expect(voidedOil(row({ oil }), row({ oil, remarks: 'x' }))).toEqual(oil)
  })
  it('the hours stretched to a full day: the half-day yes is dropped, the no stays', () => {
    const before = row({ oil: { [SAT]: 0.5, [SUN]: 0 } })
    expect(voidedOil(before, row({ allday: true }))).toEqual({ [SUN]: 0 })
  })
  it('a full-day yes cut to a short one is dropped; when nothing is left the record carries none', () => {
    const before = row({ allday: true, oil: { [SAT]: 1 } })
    expect(voidedOil(before, row({ allday: false, s: 540, e: 600 }))).toBeUndefined()
  })
  it('a yes whose hours still price the same amount stands', () => {
    const before = row({ oil: { [SAT]: 0.5 } })
    expect(voidedOil(before, row({ s: 600, e: 700 }))).toEqual({ [SAT]: 0.5 })
  })
  it('handed to another man: all void, a no included', () => {
    const before = row({ oil: { [SAT]: 0.5, [SUN]: 0 } })
    expect(voidedOil(before, row({ person: 'rocky' }))).toBeUndefined()
  })
  it('retyped to a kind that asks nothing: all void', () => {
    const before = row({ oil: { [SAT]: 0.5 } })
    expect(voidedOil(before, row({ type: 'LL' }))).toBeUndefined()
    expect(voidedOil(before, row({ type: 'Personal' }))).toBeUndefined()
  })
  it('a change of dates alone keeps them — an answer for a day no longer covered is inert', () => {
    const before = row({ date: 'Feb 14', oil: { [SAT]: 0.5 } })
    expect(voidedOil(before, row({ date: 'Feb 21' }))).toEqual({ [SAT]: 0.5 })
  })
  it('unreadable hours price nothing: every yes goes', () => {
    const before = row({ oil: { [SAT]: 0.5, [SUN]: 0 } })
    expect(voidedOil(before, row({ s: null, e: null }))).toEqual({ [SUN]: 0 })
  })
  it('never hands back the record\'s own object', () => {
    const oil = { [SAT]: 0.5 }
    const out = voidedOil(row({ oil }), row())
    expect(out).toEqual(oil)
    expect(out).not.toBe(oil)
  })
})
