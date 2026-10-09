/* AN INPUT'S OWN TITLE (owner D715, D716, D717 — 9 Oct 26; `[INPUT-OWN-TITLE]`).

   His words: "select the type of input and it gives the user the option to change the name of the input. Not only to
   event input, most of the inputs title" (D715); the four answers, "As recommended" (D716) — only the "Duty & other
   commitments" kinds take one, the title is the name wherever a name stands, "Other" takes the same box and its
   remarks go back to being plain remarks, the remarks are left as they are; and "Kind kept in sight" (D717).

   The engine's half is three small bodies in engine/inputs.ts — which kinds take a title, what is stored, what the
   name is — and ONE consequence: the row a request lands on the schedule is named by it. Everything that prints an
   input's name already goes through inpLabel, so these pins are what the screens stand on.
   The plan: docs/superpowers/plans/2026-10-09-input-own-title-plan.md. */
import { describe, expect, it } from 'vitest'
import { INPUT_META, INPUT_TYPES, TITLE_MAX, titledKind, titleOf, inpLabel, inpKindTag, typeGroup, goneRequestName, inpDetailKey } from './inputs'
import { requestRowFields, srcvOf } from './overlay'

const inp = (o: any) => ({ iid: 'i1', person: 'split', date: '15 Jul', yr: 2026, s: 480, e: 600, ...o })

describe('which kinds take a title (D716 (1))', () => {
  it('exactly the ten "Duty & other commitments" kinds — never leave, medical, an upchit or SANS availability', () => {
    expect(INPUT_TYPES.filter((t: string) => titledKind(t))).toEqual(
      ['Training', 'CSE', 'Meeting', 'Fly with', 'Personal', 'Appointment', 'Duty', 'Event', 'OD', 'Other'])
  })
  it('every titled kind sits under "Duty & other commitments" in the Type list, and no leave or medical kind does', () => {
    for (const t of INPUT_TYPES) if (titledKind(t)) expect(typeGroup(t)).toBe('other')
    for (const t of INPUT_TYPES) if (['leave', 'med', 'upchit', 'sans'].includes(INPUT_META[t].grp)) expect(titledKind(t)).toBe(false)
  })
  it('reads the kind as the rest of the table does — trimmed, any case; an unknown kind takes none', () => {
    expect(titledKind(' event ')).toBe(true)
    expect(titledKind('Nonsense')).toBe(false)
    expect(titledKind(null)).toBe(false)
  })
})

describe('what is stored (the plan §3.1)', () => {
  it('a typed title is trimmed and its inner runs of white space collapsed', () => {
    expect(titleOf('Event', '  Sports   day \n')).toBe('Sports day')
  })
  it('a title left as the kind’s own name — in any case — stores nothing', () => {
    expect(titleOf('Event', 'Event')).toBe('')
    expect(titleOf('Event', ' EVENT ')).toBe('')
    expect(titleOf('Fly with', 'fly  with')).toBe('')
  })
  it('an empty title stores nothing', () => {
    expect(titleOf('Duty', '')).toBe('')
    expect(titleOf('Duty', '   ')).toBe('')
    expect(titleOf('Duty', null)).toBe('')
  })
  it('a kind that takes no title stores none, whatever was typed', () => {
    expect(titleOf('LL', 'Sports day')).toBe('')
    expect(titleOf('ATT C', 'Sports day')).toBe('')
    expect(titleOf('SANS Availability', 'Sports day')).toBe('')
  })
  it(`is cut to ${40} characters, without a space left at the cut`, () => {
    expect(TITLE_MAX).toBe(40)
    const long = 'A very long title that runs well past the forty characters allowed'
    expect(titleOf('Event', long)).toBe(long.slice(0, 40).trim())
    expect(titleOf('Event', long).length).toBeLessThanOrEqual(40)
  })
})

describe('the name of an input (D716 (2), (3))', () => {
  it('is its title where it has one', () => {
    expect(inpLabel(inp({ type: 'Event', title: 'Sports day' }))).toBe('Sports day')
    expect(inpLabel(inp({ type: 'OD', title: 'Exercise in Darwin' }))).toBe('Exercise in Darwin')
  })
  it('is the kind’s own name where it has none', () => {
    expect(inpLabel(inp({ type: 'Event' }))).toBe('Event')
    expect(inpLabel(inp({ type: 'Event', title: '' }))).toBe('Event')
    expect(inpLabel(inp({ type: 'LL' }))).toBe('LL')
  })
  it('an "Other" is named by its title — and no longer by its remarks, which are plain remarks again', () => {
    expect(inpLabel(inp({ type: 'Other', title: 'Dentist run', remarks: 'back by 1400' }))).toBe('Dentist run')
    expect(inpLabel(inp({ type: 'Other', remarks: 'dentist run' }))).toBe('Other')
    expect(inpLabel(inp({ type: 'Other' }))).toBe('Other')
  })
  it('a title on a record whose kind takes none is ignored', () => {
    expect(inpLabel(inp({ type: 'LL', title: 'Sports day' }))).toBe('LL')
    expect(inpLabel(inp({ type: 'ATT B', title: 'x' }))).toBe('ATT B')
  })
  it('a missing record names nothing', () => {
    expect(inpLabel(null)).toBe('')
    expect(inpLabel(undefined)).toBe('')
  })
})

describe('the kind kept in sight (D717)', () => {
  it('is the kind’s own name when the input is named by something else', () => {
    expect(inpKindTag(inp({ type: 'Event', title: 'Sports day' }))).toBe('Event')
    expect(inpKindTag(inp({ type: 'Other', title: 'Dentist run' }))).toBe('Other')
  })
  it('is nothing when the input is named by its kind — it looks as it does today', () => {
    expect(inpKindTag(inp({ type: 'Event' }))).toBe('')
    expect(inpKindTag(inp({ type: 'LL' }))).toBe('')
    expect(inpKindTag(inp({ type: 'LL', title: 'Sports day' }))).toBe('')
    expect(inpKindTag(null)).toBe('')
  })
})

describe('the row a request lands on the schedule', () => {
  it('is named by the title, in capitals, and still says which kind it came from', () => {
    const f = requestRowFields(inp({ type: 'Event', title: 'Sports day', remarks: 'bring boots' }))
    expect(f.prog).toBe('SPORTS DAY')
    expect(f.srcType).toBe('Event')
    expect(f.rmks).toBe('bring boots')
  })
  it('an untitled one is named as today', () => {
    expect(requestRowFields(inp({ type: 'Event' })).prog).toBe('EVENT')
  })
  it('an "Other" lands as OTHER with its remarks in the remarks cell — the remark is no longer printed twice', () => {
    const f = requestRowFields(inp({ type: 'Other', remarks: 'dentist run' }))
    expect(f.prog).toBe('OTHER')
    expect(f.rmks).toBe('dentist run')
  })
  it('a change of title alone re-makes the row (its fingerprint moves), so a published day reads it as pending', () => {
    const a = srcvOf(inp({ type: 'Event' })), b = srcvOf(inp({ type: 'Event', title: 'Sports day' }))
    expect(a).not.toBe(b)
    expect(srcvOf(inp({ type: 'Event', title: 'Sports day' }))).toBe(b)
  })
})

describe('a request that is gone is named from the row it left', () => {
  it('by the row’s own name where the request had titled it', () => {
    expect(goneRequestName({ src: 'i1', srcType: 'Event', prog: 'SPORTS DAY' })).toBe('SPORTS DAY')
  })
  it('by its kind, written as a kind is, where it was named by its kind', () => {
    expect(goneRequestName({ src: 'i1', srcType: 'Event', prog: 'EVENT' })).toBe('Event')
    expect(goneRequestName({ src: 'i1', srcType: 'Fly with', prog: '' })).toBe('Fly with')
  })
  it('by whatever the row says when it remembers no kind; nothing for no row', () => {
    expect(goneRequestName({ prog: 'SPORTS DAY' })).toBe('SPORTS DAY')
    expect(goneRequestName(null)).toBe('')
  })
})

describe('what a published day compares of an input (D178) names its title', () => {
  const base = { person: 'split', type: 'OD', allday: true, remarks: '' }
  it('a title makes a different key; another title, another; capitals count', () => {
    const k0 = inpDetailKey(base), k1 = inpDetailKey({ ...base, title: 'Exercise' }), k2 = inpDetailKey({ ...base, title: 'EXERCISE' })
    expect(k1).not.toBe(k0); expect(k2).not.toBe(k1)
  })
  it('no title, an empty one, the kind’s own name, or a title on a kind that takes none: the key it always was', () => {
    const k0 = inpDetailKey(base)
    expect(inpDetailKey({ ...base, title: '' })).toBe(k0)
    expect(inpDetailKey({ ...base, title: ' od ' })).toBe(k0)
    expect(k0).not.toContain('title')
    const ll = { person: 'split', type: 'LL', allday: true, remarks: '' }
    expect(inpDetailKey({ ...ll, title: 'Sports day' })).toBe(inpDetailKey(ll))
  })
})

