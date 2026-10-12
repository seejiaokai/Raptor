/* AN INPUT FILED FOR "ALL AVAIL" OR "ALL" — its three structural rules, in ONE body (`[INPUT-ALL-AVAIL]`).

   Owner: D700 ("Can the inputs have an all avail and all selection too? Only allowed for duty and other commitments"),
   D702 (it stands for whoever is free), D711 (not for an overseas duty or a course; one day at a time), D712 (not for
   "Fly with" or "Personal"), D713 (the new kind Event may be filed for it).

   So a placeholder input is (a) of an allowed kind — Training, Meeting, Appointment, Duty, Event, Other; (b) ONE day.
   `placeholderProblem` says what is wrong in a sentence, and every door and the save boundary's hard check ask IT (the
   plan §3.2: docs/superpowers/plans/2026-10-09-input-all-avail-plan.md), so no two of them can disagree about which
   placeholder inputs may exist.

   RE-EXPRESSED FOR STEP 3 OF THE ONE-RULE BUILD (12 Oct 26 — the plan docs/superpowers/plans/2026-10-11-one-rule-plan.md
   §4.1, §4.4). There was a third rule, "(c) alone — never in a group": owner D750 ("'Several people' takes ALL AVAIL /
   ALL, so the puck is one of the input's own people"), D753 and D755 ended it. (a) and (b) STAND — D753 says so of (b)
   in as many words, "offered only where the input is a single day" — and only their WORDS changed, to the plan's
   shorter ones (D726): "ALL AVAIL is for one day", "ALL AVAIL is for Training, Meeting, Appointment, Duty, Event and
   Other". Each case below says which it is: the rule survives (its words changed), or a ruling changed it. The new
   rule's own cases — a placeholder beside named people — are engine/phmember.test.ts; the ones added here are what
   that file does not ask. */
import { describe, expect, it } from 'vitest'
import { INPUT_TYPES, PLACEHOLDER_KINDS, placeholderKind, placeholderProblem, isPlaceholderInput, shapeProblem, namedOf, placeholderOf } from './inputs'

const base = (over: any = {}) => ({ person: 'allavail', type: 'Duty', date: 'Jul 18', yr: 2026, allday: false, s: 540, e: 720, ...over })
/* the same input as the app has written it since the one record (D756): a list of its people */
const listed = (ids: string[], over: any = {}) => ({ type: 'Duty', date: 'Jul 18', yr: 2026, allday: false, s: 540, e: 720, people: ids.map(p => ({ p })), ...over })
const KINDS = 'Training, Meeting, Personal, Appointment, Duty, Event and Other'

describe('D700, D711 (2), D712, D713 — the kinds an ALL / ALL AVAIL input may be', () => {
  /* SEVEN SINCE D778 (12 Oct 26 — "So all avail all can go on personal"): it read "exactly six", without Personal
     (D712, which stands for "Fly with") */
  it('exactly seven: Training, Meeting, Personal, Appointment, Duty, Event, Other', () => {
    expect([...PLACEHOLDER_KINDS]).toEqual(['Training', 'Meeting', 'Personal', 'Appointment', 'Duty', 'Event', 'Other'])
    for (const t of INPUT_TYPES) expect(placeholderKind(t), t).toBe(PLACEHOLDER_KINDS.includes(t))
    expect(placeholderKind(' duty '), 'whatever the case').toBe(true)
    expect(placeholderKind('Nonsense')).toBe(false)
    expect(placeholderKind(undefined)).toBe(false)
  })

  /* THE RULE SURVIVES (D711 (2), D712, D713; kept by D753 reading 3 — "the same six kinds"); only its words changed in
     step 3 — "can be filed only for … or Other" became the plan's "is for … and Other" (§4.4, D726). The whole sentence
     is pinned now, not a part of it. */
  it('every other kind is refused, for both placeholders, with the kinds named', () => {
    for (const person of ['allavail', 'all'])
      for (const t of INPUT_TYPES.filter((x: string) => !PLACEHOLDER_KINDS.includes(x))) {
        const why = placeholderProblem(base({ person, type: t }))
        expect(why, `${person} · ${t} — names the placeholder as the screen does`).toBe(`${person === 'all' ? 'ALL' : 'ALL AVAIL'} is for ${KINDS}`)
      }
  })

  /* ADDED FOR STEP 3: the kind is the INPUT's, so it bars the placeholder whoever stands beside it and wherever in the
     list it joined (D755 (4): "ALL AVAIL on an input … of another kind" is refused with the reason) */
  it('…and the same for a placeholder that is one of several, first or last in the list', () => {
    for (const ph of ['allavail', 'all'])
      for (const t of INPUT_TYPES.filter((x: string) => !PLACEHOLDER_KINDS.includes(x))) {
        const said = `${ph === 'all' ? 'ALL' : 'ALL AVAIL'} is for ${KINDS}`
        expect(placeholderProblem(listed(['bane', ph], { type: t })), `${ph} last · ${t}`).toBe(said)
        expect(placeholderProblem(listed([ph, 'bane', 'pike'], { type: t })), `${ph} first · ${t}`).toBe(said)
      }
  })

  it('each allowed kind passes, for both placeholders', () => {
    for (const person of ['allavail', 'all'])
      for (const t of PLACEHOLDER_KINDS) expect(placeholderProblem(base({ person, type: t })), `${person} · ${t}`).toBe('')
  })
})

/* THE RULE SURVIVES (D711 (3); D753: "it is offered only where the input is a single day"); its words changed in step 3 —
   "is filed one day at a time" became the plan's "is for one day" (§4.4). */
describe('D711 (3), D753 — one day', () => {
  it('an end date after the start is refused', () => {
    expect(placeholderProblem(base({ endDate: 'Jul 19' }))).toBe('ALL AVAIL is for one day')
    expect(placeholderProblem(base({ person: 'all', endDate: 'Jul 20' }))).toBe('ALL is for one day')
  })
  it('an end date that IS the start is one day', () => {
    expect(placeholderProblem(base({ endDate: 'Jul 18' }))).toBe('')
    expect(placeholderProblem(base({ endDate: undefined }))).toBe('')
  })
  it('across a New Year the labels differ and so do the days — refused', () => {
    expect(placeholderProblem(base({ date: 'Dec 31', endDate: 'Jan 1 2027' }))).toBe('ALL AVAIL is for one day')
  })
  /* ADDED FOR STEP 3 (D753 reading 2 — a shared input may run several days, an ALL AVAIL one may not: "on a longer input
     the picker does not offer the puck and says why") */
  it('a shared input of several days is fine WITHOUT a placeholder, and refused with one beside its people', () => {
    expect(shapeProblem(listed(['bane', 'pike'], { endDate: 'Jul 20' }))).toBe('')
    expect(shapeProblem(listed(['bane', 'pike', 'allavail'], { endDate: 'Jul 20' }))).toBe('ALL AVAIL is for one day')
    expect(shapeProblem(listed(['all', 'bane'], { endDate: 'Jul 19' }))).toBe('ALL is for one day')
    expect(shapeProblem(listed(['bane', 'pike', 'allavail'], { date: 'Dec 31', endDate: 'Jan 1 2027' }))).toBe('ALL AVAIL is for one day')
  })
})

/* A RULING CHANGED THIS RULE (owner D750, D753, D755 — step 3 of the one-rule build). The describe was "never in a group
   — it already stands for whoever is free", and its one case pinned `placeholderProblem` refusing any record carrying a
   group mark (`grp`) or a group filer (`grpBy`) with "ALL AVAIL is filed on its own — it already stands for whoever is
   free". D750: "'Several people' takes ALL AVAIL / ALL, so the puck is one of the input's own people and is tied to no
   man"; D755: "whoever stands on it — a named person or ALL AVAIL / ALL … — is in the input". What D753 keeps of
   "alone" is only this: "an input takes ALL or ALL AVAIL, never both".
   AND ITS SUBJECT IS GONE besides: `grp` / `grpBy` left the record with the one record (D756 — the plan §4.1), so a
   "group mark" is no longer how several people share an input; the list of its people is. */
describe('one of an input\'s own people (D750, D753, D755) — was "never in a group"', () => {
  it('beside named people it is no problem, for both placeholders and in either place in the list', () => {
    for (const ph of ['allavail', 'all']) {
      expect(placeholderProblem(listed(['bane', ph])), ph).toBe('')
      expect(shapeProblem(listed(['bane', ph])), ph).toBe('')
      expect(shapeProblem(listed([ph, 'bane', 'pike', 'split'])), ph).toBe('')
    }
  })
  it('the sentence that refused it is said by nothing any more', () => {
    for (const r of [listed(['bane', 'allavail']), listed(['allavail', 'bane']), listed(['bane', 'pike', 'all']), base({ grp: 'g1', grpBy: 'saber' })])
      for (const say of [placeholderProblem(r), shapeProblem(r)]) expect(say).not.toMatch(/on its own|already stands for/)
  })
  /* OLD DATA (D56, D759 reading 10 — nothing stored is converted): a record written before the build may still carry
     the retired group fields. They are read by nothing, so such a record is judged as the one-person input it is —
     where the old body refused it for the mark alone. */
  it('a record stored before the build with a group mark on it is judged by its kind and its day alone', () => {
    expect(placeholderProblem(base({ grp: 'g1', grpBy: 'saber' }))).toBe('')
    expect(placeholderProblem(base({ grp: 'g1' }))).toBe('')
    expect(placeholderProblem(base({ grpBy: 'saber' }))).toBe('')
    expect(placeholderProblem(base({ grp: 'g1', grpBy: 'saber', type: 'OD' })), 'its kind still bars it').toBe(`ALL AVAIL is for ${KINDS}`)
    expect(placeholderProblem(base({ grp: 'g1', endDate: 'Jul 19' })), 'and its one day').toBe('ALL AVAIL is for one day')
  })
  it('never both of them, nor the same one twice (D753: "an input takes ALL or ALL AVAIL, never both")', () => {
    expect(shapeProblem(listed(['allavail', 'all']))).toBe('This input already has ALL AVAIL')
    expect(shapeProblem(listed(['bane', 'all', 'pike', 'allavail']))).toBe('This input already has ALL')
    expect(shapeProblem(listed(['bane', 'allavail', 'allavail']))).toBe('This input already has ALL AVAIL')
  })
  it('the placeholder names nobody: the named people are the named people, whatever it stands beside', () => {
    const r = listed(['pike', 'allavail', 'bane'])
    expect(namedOf(r).map((e: any) => e.p)).toEqual(['pike', 'bane'])
    expect(placeholderOf(r).p).toBe('allavail')
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
  /* ADDED FOR STEP 3 (the plan §4.1: "at most ONE placeholder entry … never filed under Unavailable"): the rule is the
     placeholder's, so it holds beside named people too — and a shared Other under Unavailable with no placeholder in it
     is none of this body's business */
  it('…and the same where it is one of several', () => {
    expect(placeholderProblem(listed(['bane', 'allavail'], { type: 'Other', acc: 'u' }))).toBe('ALL AVAIL cannot be filed under Unavailable — that names a real person’s day')
    expect(shapeProblem(listed(['bane', 'pike', 'all'], { type: 'Other', acc: 'u' }))).toContain('ALL cannot be filed under Unavailable')
    expect(shapeProblem(listed(['bane', 'pike'], { type: 'Other', acc: 'u' }))).toBe('')
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
  /* ADDED FOR STEP 3: since a placeholder may be one of several (D750), "filed for a placeholder" is "holds one" — the
     question every body that works out a crowd asks of the record */
  it('…and it answers for a list: true where a placeholder is IN it, wherever it joined; false for named people alone', () => {
    expect(isPlaceholderInput(listed(['allavail']))).toBe(true)
    expect(isPlaceholderInput(listed(['bane', 'pike', 'all']))).toBe(true)
    expect(isPlaceholderInput(listed(['allavail', 'bane']))).toBe(true)
    expect(isPlaceholderInput(listed(['bane', 'pike']))).toBe(false)
    expect(isPlaceholderInput(listed([]))).toBe(false)
  })
})
