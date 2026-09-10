// src/tracker/app/ids.test.ts
/* The one converter from name keys to enrolment ids (stable-ids, 10 Sep 26):
   used once per course at load (core.js migrateIds) and on every import
   (applyStudents), so the two paths cannot drift. */
import { describe, expect, it } from 'vitest'
import { isEntry, mintId, reconcileIds, upgradeCourseBlock } from './ids.js'

const legacy = () => ({
  plan: { sylName: 'A' },
  bySyllabus: {
    A: { roster: ['STUDENT A', 'STUDENT B'], marks: { 'STUDENT A': { 'ST-01': { g: 'dco' } } }, dates: { 'STUDENT B': { lastSyll: '2026-01-01' } } },
    B: { roster: ['STUDENT A'], marks: { 'STUDENT A': { 'ST-02': { g: 'dpco' } } }, dates: {} },
  },
  lulls: { 'STUDENT A': [{ start: '2026-02-01', end: '2026-02-03' }] },
  pace: { 'STUDENT B': { epw: '3' } },
})

describe('upgradeCourseBlock', () => {
  it('turns string rosters into entries — the same name on two syllabi is ONE id — and re-keys every map', () => {
    const { block, ids } = upgradeCourseBlock(legacy(), { 'STUDENT A': 'p1' })
    const a = ids['STUDENT A'], b = ids['STUDENT B']
    expect(a).toMatch(/^s[0-9a-z]+$/); expect(b).toMatch(/^s[0-9a-z]+$/); expect(a).not.toBe(b)
    expect(block.bySyllabus.A.roster).toEqual([{ id: a, name: 'STUDENT A', pid: 'p1' }, { id: b, name: 'STUDENT B' }])
    expect(block.bySyllabus.B.roster).toEqual([{ id: a, name: 'STUDENT A', pid: 'p1' }])
    expect(block.bySyllabus.A.marks).toEqual({ [a]: { 'ST-01': { g: 'dco' } } })
    expect(block.bySyllabus.A.dates).toEqual({ [b]: { lastSyll: '2026-01-01' } })
    expect(block.bySyllabus.B.marks).toEqual({ [a]: { 'ST-02': { g: 'dpco' } } })
    expect(block.lulls).toEqual({ [a]: [{ start: '2026-02-01', end: '2026-02-03' }] })
    expect(block.pace).toEqual({ [b]: { epw: '3' } })
    expect(block.plan).toEqual({ sylName: 'A' })
  })
  it('an entry already an object is kept as it is, its id reused for the same name elsewhere', () => {
    const src: any = legacy(); src.bySyllabus.A.roster[0] = { id: 'sfixed', name: 'STUDENT A' }
    const { block, ids } = upgradeCourseBlock(src, null)
    expect(ids['STUDENT A']).toBe('sfixed')
    expect(block.bySyllabus.B.roster[0]).toEqual({ id: 'sfixed', name: 'STUDENT A' })
    expect(block.bySyllabus.B.marks).toEqual({ sfixed: { 'ST-02': { g: 'dpco' } } })
  })
  it('a link for a name not on any roster is ignored; a non-string entry is dropped', () => {
    const src: any = legacy(); src.bySyllabus.A.roster.push(7)
    const { block } = upgradeCourseBlock(src, { NOBODY: 'p9' })
    expect(block.bySyllabus.A.roster.length).toBe(2)
    expect(block.bySyllabus.A.roster.some((r: any) => r.pid)).toBe(false)
  })
  it('does not mutate its input', () => {
    const src = legacy(); const copy = JSON.parse(JSON.stringify(src))
    upgradeCourseBlock(src, null); expect(src).toEqual(copy)
  })
  it('re-keys ONLY a syllabus whose roster was strings; an entry-keyed syllabus and its maps are left exactly as they are (review finding 5)', () => {
    const src: any = legacy()
    src.bySyllabus.B = { roster: [{ id: 'sfixed', name: 'STUDENT A' }], marks: { sfixed: { 'ST-02': { g: 'dpco' } }, 'STUDENT A': { stray: 1 } }, dates: {} }
    const { block } = upgradeCourseBlock(src, null)
    expect(block.bySyllabus.B.marks).toEqual({ sfixed: { 'ST-02': { g: 'dpco' } }, 'STUDENT A': { stray: 1 } })
    expect(block.bySyllabus.A.marks).toEqual({ sfixed: { 'ST-01': { g: 'dco' } } })
  })
  it('a prototype-named key never leaks through the lookup', () => {
    const src: any = legacy(); src.bySyllabus.A.marks.constructor = { x: 1 }; src.bySyllabus.A.marks.__proto__ = { y: 2 }
    const { block, ids } = upgradeCourseBlock(src, null)
    expect(Object.prototype.hasOwnProperty.call(block.bySyllabus.A.marks, 'constructor')).toBe(true)
    expect(block.bySyllabus.A.marks.constructor).toEqual({ x: 1 })
    expect(Object.keys(block.bySyllabus.A.marks).sort()).toEqual([ids['STUDENT A'], 'constructor'].sort())
  })
  it('refuses a conflict: two entries with one id on a roster, one id with two names across syllabi, two entries with one name on a roster', () => {
    const dup: any = legacy(); dup.bySyllabus.A.roster = [{ id: 's1', name: 'X' }, { id: 's1', name: 'Y' }]
    expect(() => upgradeCourseBlock(dup, null)).toThrow(/id .*s1.* twice on “A”/)
    const two: any = legacy(); two.bySyllabus.A.roster = [{ id: 's1', name: 'X' }]; two.bySyllabus.B.roster = [{ id: 's1', name: 'Z' }]
    expect(() => upgradeCourseBlock(two, null)).toThrow(/s1.* two names/)
    const nm: any = legacy(); nm.bySyllabus.A.roster = [{ id: 's1', name: 'X' }, { id: 's2', name: 'X' }]
    expect(() => upgradeCourseBlock(nm, null)).toThrow(/“X” twice on “A”/)
    const mixed: any = legacy(); mixed.bySyllabus.A.roster = ['X', 'X']
    expect(() => upgradeCourseBlock(mixed, null)).toThrow(/“X” twice on “A”/)
  })
  it('a syllabus literally named "__proto__" round-trips as data, and a mark keyed "__proto__" on an entry-keyed syllabus survives', () => {
    // Object.defineProperty, not assignment: `obj.__proto__ = x` or an
    // object-literal `{'__proto__': x}` key hits the inherited accessor and
    // sets the object's actual prototype instead of creating an own
    // property. defineProperty (like JSON.parse on a real file) always
    // writes a genuine own data property named "__proto__".
    const src: any = legacy()
    src.bySyllabus.C = { roster: [{ id: 'sfixed2', name: 'STUDENT Q' }], marks: {}, dates: {} }
    Object.defineProperty(src.bySyllabus, '__proto__', { value: { roster: ['Q'], marks: {}, dates: {} }, enumerable: true, writable: true, configurable: true })
    Object.defineProperty(src.bySyllabus.C.marks, '__proto__', { value: { g: 'dco' }, enumerable: true, writable: true, configurable: true })
    const { block, ids } = upgradeCourseBlock(src, null)
    expect(Object.prototype.hasOwnProperty.call(block.bySyllabus, '__proto__')).toBe(true)
    expect(block.bySyllabus.__proto__.roster).toEqual([{ id: ids['Q'], name: 'Q' }])
    expect(Object.prototype.hasOwnProperty.call(block.bySyllabus.C.marks, '__proto__')).toBe(true)
    expect(block.bySyllabus.C.marks.__proto__).toEqual({ g: 'dco' })
  })
  it('refuses a roster that is not a list, whether a string or a plain object', () => {
    const strRoster: any = legacy(); strRoster.bySyllabus.A.roster = 'STUDENT A'
    expect(() => upgradeCourseBlock(strRoster, null)).toThrow(/crew list for “A” is not a list/)
    const objRoster: any = legacy(); objRoster.bySyllabus.A.roster = { 0: 'STUDENT A' }
    expect(() => upgradeCourseBlock(objRoster, null)).toThrow(/crew list for “A” is not a list/)
  })
  it('refuses an empty legacy name rather than silently dropping it', () => {
    const src: any = legacy(); src.bySyllabus.A.roster = ['']
    expect(() => upgradeCourseBlock(src, null)).toThrow(/empty name on “A”/)
  })
  it('isEntry and mintId', () => {
    expect(isEntry({ id: 'x', name: 'N' })).toBe(true); expect(isEntry('N')).toBe(false); expect(isEntry({ id: '', name: 'N' })).toBe(false)
    expect(mintId()).not.toBe(mintId())
  })
})

/* The store's ids win on import (bug-check, 10 Sep 26): a file from another
   browser, or an older name-keyed backup, must land on the enrolments the
   course already has — one id per person — never a second id beside them. */
describe('reconcileIds', () => {
  const file = (): any => ({ plan: {}, lulls: { fA: [1] }, pace: { fA: { epw: '3' }, fB: { epw: '4' } }, bySyllabus: {
    A: { roster: [{ id: 'fA', name: 'ALPHA' }, { id: 'fB', name: 'BRAVO', pid: 'p2' }], marks: { fA: { 'ST-01': { g: 'dco' } }, fB: {} }, dates: { fA: { lastSyll: '2026-01-01' } } } } })
  it('matches by name and rewrites the id everywhere; a link the store knows rides onto the entry', () => {
    const { block, remapped } = reconcileIds(file(), [{ id: 'sA', name: 'ALPHA', pid: 'p1' }])
    expect(remapped).toEqual({ fA: 'sA' })
    expect(block.bySyllabus.A.roster[0]).toEqual({ id: 'sA', name: 'ALPHA', pid: 'p1' })
    expect(block.bySyllabus.A.marks).toEqual({ sA: { 'ST-01': { g: 'dco' } }, fB: {} })
    expect(block.bySyllabus.A.dates).toEqual({ sA: { lastSyll: '2026-01-01' } })
    expect(block.lulls).toEqual({ sA: [1] }); expect(block.pace).toEqual({ sA: { epw: '3' }, fB: { epw: '4' } })
  })
  it('matches by person id before name — a callsign renamed on one side is still one person — and keeps the file’s label', () => {
    const { block, remapped } = reconcileIds(file(), [{ id: 'sB', name: 'BRAVO OLD', pid: 'p2' }])
    expect(remapped).toEqual({ fB: 'sB' })
    expect(block.bySyllabus.A.roster[1]).toEqual({ id: 'sB', name: 'BRAVO', pid: 'p2' })
  })
  it('two different people under one callsign are NOT merged', () => {
    expect(reconcileIds(file(), [{ id: 'sX', name: 'BRAVO', pid: 'p9' }]).remapped).toEqual({})
  })
  it('a store id the file already carries is that entry’s own — nobody else is mapped onto it', () => {
    const f = file(); f.bySyllabus.A.roster[0] = { id: 'sA', name: 'NEW NAME' }; f.bySyllabus.A.marks = { sA: {}, fB: {} }
    f.bySyllabus.A.roster.push({ id: 'fC', name: 'ALPHA' })   // someone else took the old callsign where the file came from
    expect(reconcileIds(f, [{ id: 'sA', name: 'ALPHA' }]).remapped).toEqual({})
  })
  it('a legacy file, once upgraded, lands on the existing ids; nothing to match leaves the block as it is; the input is untouched', () => {
    const up = upgradeCourseBlock({ bySyllabus: { A: { roster: ['ALPHA'], marks: { ALPHA: { 'ST-01': { g: 'dco' } } }, dates: {} } } }, null).block
    const { block } = reconcileIds(up, [{ id: 'sA', name: 'ALPHA' }])
    expect(block.bySyllabus.A.roster).toEqual([{ id: 'sA', name: 'ALPHA' }]); expect(Object.keys(block.bySyllabus.A.marks)).toEqual(['sA'])
    const src = file(), copy = JSON.parse(JSON.stringify(src))
    expect(reconcileIds(src, []).block).toEqual(copy); expect(src).toEqual(copy)
  })
})
