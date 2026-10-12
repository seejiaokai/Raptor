/* THE PER-PERSON VIEW OF THE INPUTS ([ALL-AVAIL-AS-MEMBER], the plan's §4.2 and step 1; owner D755, D756, D759 —
   docs/superpowers/plans/2026-10-11-one-rule-plan.md). An input is to become ONE record holding the list of its people
   (D756); the rules about ONE MAN'S DAY go on reading one line a person, as a view worked out from the record. Step 1
   builds the view and moves those readers onto it while every stored record is still in the old shape — so this file
   pins the view itself: who is in an input whatever its shape (peopleOf — D756: "an old-shaped record must not break a
   load"), one FROZEN line a named person (the plan's T10: a body that still writes to what it was handed throws
   instead of losing the write), none for ALL AVAIL / ALL (D753: the men behind it are worked out on the day), the
   issued copies on a published face (Fable F2 — D177–D179), and the once-per-pass memo (Fable F10). */
import { describe, it, expect, beforeEach } from 'vitest'
import { INPUTS, peopleOf, namedOf, placeholderOf, inputLines, inputLinesOn, inputReadPass, withFrozenInputs, sansAvailOn, inputsOn } from './inputs'

const keep = INPUTS.slice()
beforeEach(() => { INPUTS.length = 0; keep.forEach(r => INPUTS.push(r)) })

const OLD = { iid: 'i-old', person: 'bane', date: 'Jul 13', allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'staff', mod: '2026-06-29', by: 'saber', at: '2026-06-29T08:00:00Z' }
const NEW = { iid: 'i-new', date: 'Jul 13', allday: false, s: 480, e: 720, type: 'Training', remarks: 'range', mod: '2026-06-20', by: 'saber', hand: 3,
  people: [{ p: 'stiff', by: 'saber', at: 'a', h: 1 }, { p: 'allavail', by: 'saber', at: 'b', h: 2 }, { p: 'freak', by: 'ranger', at: 'c', mod: '2026-07-10', h: 3 }] }

describe('who is in an input, whatever shape it is stored in (D756)', () => {
  it('an old-shaped record reads as a one-person input', () => {
    expect(peopleOf(OLD)).toEqual([{ p: 'bane', by: 'saber', at: '2026-06-29T08:00:00Z', mod: '2026-06-29' }])
    expect(namedOf(OLD).map((e: any) => e.p)).toEqual(['bane'])
    expect(placeholderOf(OLD)).toBeNull()
  })
  it('a record with its people listed answers that list, in the order they joined', () => {
    expect(peopleOf(NEW).map((e: any) => e.p)).toEqual(['stiff', 'allavail', 'freak'])
    expect(namedOf(NEW).map((e: any) => e.p)).toEqual(['stiff', 'freak'])
    expect(placeholderOf(NEW)).toMatchObject({ p: 'allavail' })
  })
  it('an old-shaped record filed for ALL AVAIL names nobody (D753)', () => {
    const ph = { ...OLD, iid: 'i-ph', person: 'allavail' }
    expect(namedOf(ph)).toEqual([])
    expect(placeholderOf(ph)).toMatchObject({ p: 'allavail' })
  })
  it('nothing, or a broken record, has nobody in it — never a throw', () => {
    expect(peopleOf(null)).toEqual([])
    expect(peopleOf(undefined)).toEqual([])
    expect(namedOf({ people: 'not a list' } as any).length).toBe(1)   // read as the old shape: one entry, as today's record is one
  })
})

describe('one line a named person', () => {
  it('a line of an old-shaped record is that record, field for field — the same text the reference page is fed', () => {
    const [line] = inputLines([OLD])
    expect(JSON.stringify(line)).toBe(JSON.stringify(OLD))
    expect(Object.keys(line)).toEqual(Object.keys(OLD))
    expect(line).not.toBe(OLD)
  })
  it('a record with no late date gains none', () => {
    const bare = { iid: 'i-b', person: 'bane', date: 'Jul 13', allday: true, type: 'LL', remarks: '' }
    expect(Object.keys(inputLines([bare])[0])).toEqual(Object.keys(bare))
  })
  it('a record of several people gives one line each, the placeholder none, each with his own late date where he has one', () => {
    const lines = inputLines([NEW])
    expect(lines.map((l: any) => l.person)).toEqual(['stiff', 'freak'])
    expect(lines.map((l: any) => l.mod)).toEqual(['2026-06-20', '2026-07-10'])
    expect(lines.every((l: any) => l.iid === 'i-new' && l.type === 'Training' && l.s === 480)).toBe(true)
  })
  it('records keep their order, and their people the order they joined', () => {
    expect(inputLines([NEW, OLD]).map((l: any) => l.person)).toEqual(['stiff', 'freak', 'bane'])
  })
  it('an old-shaped record for ALL AVAIL makes no line', () => {
    expect(inputLines([{ ...OLD, person: 'all' }, OLD]).map((l: any) => l.person)).toEqual(['bane'])
  })
  it('T10 — a line is FROZEN: a body that writes to what it was handed throws, and the record is untouched', () => {
    const [line] = inputLines([OLD]) as any[]
    expect(() => { line.acc = 'g' }).toThrow(TypeError)
    expect(() => { line.remarks = 'changed' }).toThrow(TypeError)
    expect(() => { delete line.mod }).toThrow(TypeError)
    expect((OLD as any).acc).toBeUndefined()
    expect(OLD.remarks).toBe('staff')
  })
  it('the list handed back is frozen too — nobody sorts or trims a view another reader shares', () => {
    const lines = inputLines([OLD, { ...OLD, iid: 'i-2', person: 'salsa' }]) as any[]
    expect(() => lines.push({})).toThrow(TypeError)
    expect(() => lines.reverse()).toThrow(TypeError)
    expect(() => lines.sort((a: any, b: any) => String(b.person).localeCompare(String(a.person)))).toThrow(TypeError)
  })
  it('with no list given it reads the live inputs', () => {
    INPUTS.length = 0; INPUTS.push({ ...OLD }, { ...OLD, iid: 'i-2', person: 'salsa' })
    expect(inputLines().map((l: any) => l.person)).toEqual(['bane', 'salsa'])
  })
})

describe('the lines of one date — the live records, or a published face\'s own copies (Fable F2; D177–D179)', () => {
  beforeEach(() => { INPUTS.length = 0; INPUTS.push({ ...OLD }, { ...OLD, iid: 'i-tue', person: 'salsa', date: 'Jul 14' }) })
  it('a date reads the inputs that cover it', () => {
    expect(inputLinesOn('Jul 13').map((l: any) => l.person)).toEqual(['bane'])
    expect(inputLinesOn('Jul 14').map((l: any) => l.person)).toEqual(['salsa'])
    expect(inputLinesOn('Jul 15')).toEqual([])
  })
  it('it is the per-person view of exactly what inputsOn answers', () => {
    expect(JSON.stringify(inputLinesOn('Jul 13'))).toBe(JSON.stringify(inputsOn('Jul 13')))
  })
  it('on a frozen date it answers from the issued copies, never the live record', () => {
    const issued = { 'Jul 13': { 'i-was': { ...OLD, iid: 'i-was', person: 'vinci' } } }
    withFrozenInputs(issued, () => {
      expect(inputLinesOn('Jul 13').map((l: any) => l.person)).toEqual(['vinci'])
      expect(inputLinesOn('Jul 14').map((l: any) => l.person), 'a date the frame does not hold stays live').toEqual(['salsa'])
    })
    expect(inputLinesOn('Jul 13').map((l: any) => l.person)).toEqual(['bane'])
  })
  it('a shared record frozen on a published face names each of its people there (the plan\'s T11, at the view)', () => {
    withFrozenInputs({ 'Jul 13': { 'i-new': NEW } }, () => {
      expect(inputLinesOn('Jul 13').map((l: any) => l.person)).toEqual(['stiff', 'freak'])
    })
  })
  it('the SANS offer of a man on a day is found by who is IN the input, and handed back as the record itself', () => {
    const one = { iid: 'i-s', person: 'badger', date: 'Jul 13', allday: true, type: 'SANS Availability', sans: { f: true }, remarks: 'am only' }
    const several = { iid: 'i-s2', date: 'Jul 13', allday: true, type: 'SANS Availability', sans: { o: true }, remarks: 'for two', people: [{ p: 'bullet' }, { p: 'vinci' }] }
    INPUTS.push(one, several)
    expect(sansAvailOn('badger', 'Jul 13')).toBe(one)
    expect(sansAvailOn('bullet', 'Jul 13'), 'an offer an admin files for several SANS men is each man\'s (D658)').toBe(several)
    expect(sansAvailOn('vinci', 'Jul 13')).toBe(several)
    expect(sansAvailOn('bane', 'Jul 13')).toBeNull()
  })
})

describe('worked out once per pass, never kept across a write (Fable F10)', () => {
  beforeEach(() => { INPUTS.length = 0; INPUTS.push({ ...OLD }) })
  it('outside a pass every ask is fresh', () => {
    expect(inputLinesOn('Jul 13')).not.toBe(inputLinesOn('Jul 13'))
    expect(inputLines()).not.toBe(inputLines())
  })
  it('inside a pass one date is worked out once, and the whole list once', () => {
    inputReadPass(() => {
      expect(inputLinesOn('Jul 13')).toBe(inputLinesOn('Jul 13'))
      expect(inputLines()).toBe(inputLines())
      expect(inputLinesOn('Jul 14')).not.toBe(inputLinesOn('Jul 13'))
    })
  })
  it('a list handed in is never served from the pass', () => {
    inputReadPass(() => { const own = [OLD]; expect(inputLines(own)).not.toBe(inputLines(own)) })
  })
  it('a write after the pass is seen by the next ask — nothing outlives the pass', () => {
    const first = inputReadPass(() => inputLinesOn('Jul 13'))
    INPUTS[0].remarks = 'moved'
    expect((first[0] as any).remarks).toBe('staff')
    expect((inputLinesOn('Jul 13')[0] as any).remarks).toBe('moved')
    inputReadPass(() => { expect((inputLinesOn('Jul 13')[0] as any).remarks).toBe('moved') })
  })
  it('a pass inside a pass shares the outer one, and only the outermost ends it', () => {
    inputReadPass(() => {
      const a = inputLinesOn('Jul 13')
      inputReadPass(() => { expect(inputLinesOn('Jul 13')).toBe(a) })
      expect(inputLinesOn('Jul 13'), 'still the outer pass').toBe(a)
    })
  })
  it('a published face entered inside a pass is never served the working copy\'s answer, nor the reverse', () => {
    inputReadPass(() => {
      const live = inputLinesOn('Jul 13')
      withFrozenInputs({ 'Jul 13': { 'i-was': { ...OLD, iid: 'i-was', person: 'vinci' } } }, () => {
        const face = inputLinesOn('Jul 13')
        expect(face.map((l: any) => l.person)).toEqual(['vinci'])
        expect(inputLinesOn('Jul 13'), 'the face, once').toBe(face)
      })
      expect(inputLinesOn('Jul 13'), 'the working copy again').toBe(live)
    })
  })
  it('a date no calendar can read is worked out fresh each time, as inputsOn reads it', () => {
    INPUTS.push({ ...OLD, iid: 'i-odd', date: 'someday' })
    inputReadPass(() => {
      expect(inputLinesOn('someday').map((l: any) => l.iid)).toEqual(['i-odd'])
      expect(inputLinesOn('someday')).not.toBe(inputLinesOn('someday'))
    })
  })
})
