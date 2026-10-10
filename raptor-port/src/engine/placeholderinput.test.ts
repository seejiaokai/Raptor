/* AN INPUT FILED FOR "ALL AVAIL" OR "ALL" — its three structural rules, in ONE body (`[INPUT-ALL-AVAIL]`).

   Owner: D700 ("Can the inputs have an all avail and all selection too? Only allowed for duty and other commitments"),
   D702 (it stands for whoever is free), D711 (not for an overseas duty or a course; one day at a time), D712 (not for
   "Fly with" or "Personal"), D713 (the new kind Event may be filed for it).

   So a placeholder input is (a) of an allowed kind — Training, Meeting, Appointment, Duty, Event, Other; (b) ONE day;
   (c) alone — never in a group. `placeholderProblem` says what is wrong in a sentence, and every door and the save
   boundary's hard check ask IT (the plan §3.2: docs/superpowers/plans/2026-10-09-input-all-avail-plan.md), so no two of
   them can disagree about which placeholder inputs may exist. */
import { describe, expect, it } from 'vitest'
import { INPUT_TYPES, PLACEHOLDER_KINDS, placeholderKind, placeholderProblem, isPlaceholderInput } from './inputs'

const base = (over: any = {}) => ({ person: 'allavail', type: 'Duty', date: 'Jul 18', yr: 2026, allday: false, s: 540, e: 720, ...over })

describe('D700, D711 (2), D712, D713 — the kinds an ALL / ALL AVAIL input may be', () => {
  it('exactly six: Training, Meeting, Appointment, Duty, Event, Other', () => {
    expect([...PLACEHOLDER_KINDS]).toEqual(['Training', 'Meeting', 'Appointment', 'Duty', 'Event', 'Other'])
    for (const t of INPUT_TYPES) expect(placeholderKind(t), t).toBe(PLACEHOLDER_KINDS.includes(t))
    expect(placeholderKind(' duty '), 'whatever the case').toBe(true)
    expect(placeholderKind('Nonsense')).toBe(false)
    expect(placeholderKind(undefined)).toBe(false)
  })

  it('every other kind is refused, for both placeholders, with the kinds named', () => {
    for (const person of ['allavail', 'all'])
      for (const t of INPUT_TYPES.filter((x: string) => !PLACEHOLDER_KINDS.includes(x))) {
        const why = placeholderProblem(base({ person, type: t }))
        expect(why, `${person} · ${t}`).toContain('can be filed only for Training, Meeting, Appointment, Duty, Event or Other')
        expect(why.startsWith(person === 'all' ? 'ALL can' : 'ALL AVAIL can'), `${person} · ${t} — names the placeholder as the screen does`).toBe(true)
      }
  })

  it('each allowed kind passes, for both placeholders', () => {
    for (const person of ['allavail', 'all'])
      for (const t of PLACEHOLDER_KINDS) expect(placeholderProblem(base({ person, type: t })), `${person} · ${t}`).toBe('')
  })
})

describe('D711 (3) — one day at a time', () => {
  it('an end date after the start is refused', () => {
    expect(placeholderProblem(base({ endDate: 'Jul 19' }))).toBe('ALL AVAIL is filed one day at a time')
    expect(placeholderProblem(base({ person: 'all', endDate: 'Jul 20' }))).toBe('ALL is filed one day at a time')
  })
  it('an end date that IS the start is one day', () => {
    expect(placeholderProblem(base({ endDate: 'Jul 18' }))).toBe('')
    expect(placeholderProblem(base({ endDate: undefined }))).toBe('')
  })
  it('across a New Year the labels differ and so do the days — refused', () => {
    expect(placeholderProblem(base({ date: 'Dec 31', endDate: 'Jan 1 2027' }))).toBe('ALL AVAIL is filed one day at a time')
  })
})

describe('never in a group — it already stands for whoever is free', () => {
  it('a group mark, or a group filer, is refused', () => {
    const said = 'ALL AVAIL is filed on its own — it already stands for whoever is free'
    expect(placeholderProblem(base({ grp: 'g1', grpBy: 'saber' }))).toBe(said)
    expect(placeholderProblem(base({ grp: 'g1' }))).toBe(said)
    expect(placeholderProblem(base({ grpBy: 'saber' }))).toBe(said)
  })
})

describe('never under Unavailable — that names a real person\'s day (Astra\'s read of the code, 9 Oct 26)', () => {
  it('a placeholder input filed under Unavailable is refused, for both placeholders', () => {
    expect(placeholderProblem(base({ type: 'Other', acc: 'u' }))).toBe('ALL AVAIL cannot be filed under Unavailable — that names a real person\u2019s day')
    expect(placeholderProblem(base({ person: 'all', type: 'Other', acc: 'u' }))).toContain('ALL cannot be filed under Unavailable')
  })
  it('on the programme, taken off it, or not yet landed: fine', () => {
    for (const acc of ['g', 'r', undefined]) expect(placeholderProblem(base({ type: 'Other', acc })), String(acc)).toBe('')
  })
})

describe('it speaks only about a placeholder input', () => {
  it('a named man\'s input of any kind, any length, in any group is none of its business', () => {
    for (const t of INPUT_TYPES)
      expect(placeholderProblem({ person: 'bane', type: t, date: 'Jul 13', endDate: 'Jul 20', grp: 'g', grpBy: 'x', yr: 2026 }), t).toBe('')
    expect(placeholderProblem(null)).toBe('')
    expect(placeholderProblem({})).toBe('')
  })
  it('isPlaceholderInput is the one test of "filed for a placeholder"', () => {
    expect(isPlaceholderInput(base())).toBe(true)
    expect(isPlaceholderInput(base({ person: 'all' }))).toBe(true)
    expect(isPlaceholderInput(base({ person: 'bane' }))).toBe(false)
    expect(isPlaceholderInput(base({ person: 'nobody-here' }))).toBe(false)
    expect(isPlaceholderInput(null)).toBe(false)
  })
})
