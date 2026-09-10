// src/tracker/app/ids.test.ts
/* The one converter from name keys to enrolment ids (stable-ids, 10 Sep 26):
   used once per course at load (core.js migrateIds) and on every import
   (applyStudents), so the two paths cannot drift. */
import { describe, expect, it } from 'vitest'
import { isEntry, mintId, upgradeCourseBlock } from './ids.js'

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
  it('isEntry and mintId', () => {
    expect(isEntry({ id: 'x', name: 'N' })).toBe(true); expect(isEntry('N')).toBe(false); expect(isEntry({ id: '', name: 'N' })).toBe(false)
    expect(mintId()).not.toBe(mintId())
  })
})
