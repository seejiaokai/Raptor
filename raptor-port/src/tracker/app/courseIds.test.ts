// src/tracker/app/courseIds.test.ts
/* The pure course-id converter (ARCH-STACK 1B-i, 13 Sep 26): used by the
   once-per-browser migration (core.js migrateCourseIds) and by file import
   (applyStudents), so the two cannot drift. Mirrors app/ids.test.ts. */
import { describe, expect, it } from 'vitest'
import {
  isCourseEntry, isCourseId, isReservedCourseName, mintCourseId,
  reconcileCourseIds, upgradeCourses,
} from './courseIds.js'

describe('mintCourseId / isCourseId', () => {
  it('mints a c-prefixed base36 id that passes the grammar', () => {
    const id = mintCourseId()
    expect(id).toMatch(/^c[0-9a-z]+$/)
    expect(isCourseId(id)).toBe(true)
  })
  it('rejects ids with a separator or reserved shape', () => {
    expect(isCourseId('master:lay')).toBe(false)   // review CSID-07 — would clobber v3:master:lay:*
    expect(isCourseId('26ABSG')).toBe(false)        // a course NAME is not an id
    expect(isCourseId('')).toBe(false)
    expect(isCourseId('cABC')).toBe(false)          // upper-case not in base36 lowercase
  })
})

describe('isReservedCourseName', () => {
  it('flags the reserved namespaces, case-insensitively, trimmed', () => {
    for (const n of ['courses', 'LINKS', 'Master', ' lay ', 'Syllabus Edit'])
      expect(isReservedCourseName(n)).toBe(true)
    for (const n of ['26ABSG', 'COURSE A', 'masterclass'])
      expect(isReservedCourseName(n)).toBe(false)
  })
})

describe('upgradeCourses (v1 name-keyed → v2 id-keyed)', () => {
  const v1 = () => ({
    courses: ['ALPHA', 'BRAVO'],
    byCourse: { ALPHA: { plan: { sylName: 'A' } }, BRAVO: { plan: { sylName: 'B' } } },
  })
  it('mints an id per string course and re-keys byCourse + links', () => {
    const { students, links, map } = upgradeCourses(v1(), { ALPHA: { STU: 'p1' } })
    const a = map.ALPHA, b = map.BRAVO
    expect(a).toMatch(/^c[0-9a-z]+$/); expect(b).toMatch(/^c[0-9a-z]+$/); expect(a).not.toBe(b)
    expect(students.courses).toEqual([{ id: a, name: 'ALPHA' }, { id: b, name: 'BRAVO' }])
    expect(students.byCourse[a]).toEqual({ plan: { sylName: 'A' } })
    expect(students.byCourse[b]).toEqual({ plan: { sylName: 'B' } })
    expect(links).toEqual({ [a]: { STU: 'p1' } })
  })
  it('keeps a v2 entry id and re-keys by it; links null when absent', () => {
    const v2 = { courses: [{ id: 'cfixed', name: 'ALPHA' }], byCourse: { cfixed: { plan: {} } } }
    const { students, links, map } = upgradeCourses(v2, null)
    expect(map.cfixed).toBe('cfixed')
    expect(students.courses).toEqual([{ id: 'cfixed', name: 'ALPHA' }])
    expect(students.byCourse.cfixed).toEqual({ plan: {} })
    expect(links).toBeNull()
  })
  it('refuses a duplicate course name / id', () => {
    expect(() => upgradeCourses({ courses: ['A', 'A'], byCourse: {} }, null)).toThrow(/twice/)
    expect(() => upgradeCourses({ courses: [{ id: 'c1', name: 'A' }, { id: 'c1', name: 'B' }], byCourse: {} }, null)).toThrow(/twice/)
  })
  it('does not mutate its input', () => {
    const src = v1(); const copy = JSON.parse(JSON.stringify(src))
    upgradeCourses(src, null); expect(src).toEqual(copy)
  })
})

describe('reconcileCourseIds (store id wins)', () => {
  const store = [{ id: 'cSTORE', name: 'ALPHA' }]
  it('a file course whose NAME matches the store adopts the store id, re-keying byCourse + links', () => {
    const file = { courses: [{ id: 'cFILE', name: 'ALPHA' }], byCourse: { cFILE: { plan: { x: 1 } } } }
    const { students, links, remapped, conflicts } = reconcileCourseIds(file, { cFILE: { STU: 'p1' } }, store)
    expect(conflicts).toEqual([])
    expect(remapped).toEqual({ cFILE: 'cSTORE' })
    expect(students.courses).toEqual([{ id: 'cSTORE', name: 'ALPHA' }])
    expect(students.byCourse.cSTORE).toEqual({ plan: { x: 1 } })
    expect(links).toEqual({ cSTORE: { STU: 'p1' } })
  })
  it('a file course whose ID the store already has is kept as-is (id match wins over name)', () => {
    // store has ALPHA=cSTORE; file has the SAME id under a renamed label -> keep the id, no remap
    const file = { courses: [{ id: 'cSTORE', name: 'BRAVO' }], byCourse: { cSTORE: { plan: {} } } }
    const { students, remapped, conflicts } = reconcileCourseIds(file, null, store)
    expect(conflicts).toEqual([])
    expect(remapped).toEqual({})
    expect(students.courses).toEqual([{ id: 'cSTORE', name: 'BRAVO' }])
  })
  it('Astra CSID-06 counterexample: export ALPHA=c1, rename→BRAVO, add ALPHA=c2, import backup → conflict, refused', () => {
    // store now: BRAVO=c1 (the renamed original) and ALPHA=c2 (a new course reusing the label)
    const store2 = [{ id: 'c1', name: 'BRAVO' }, { id: 'c2', name: 'ALPHA' }]
    // the backup file still calls the original ALPHA=c1
    const file = { courses: [{ id: 'c1', name: 'ALPHA' }], byCourse: { c1: { plan: {} } } }
    const { conflicts } = reconcileCourseIds(file, null, store2)
    // c1 is an id-match (kept as c1=the store's BRAVO), but its NAME 'ALPHA' now
    // belongs to c2 — a name/id contradiction the caller must refuse.
    expect(conflicts.length).toBe(1)
    expect(conflicts[0].name).toBe('ALPHA')
  })
  it('two file courses cannot map onto one store id (reserve targets file-wide)', () => {
    const store3 = [{ id: 'cS', name: 'ALPHA' }]
    const file = { courses: [{ id: 'cF1', name: 'ALPHA' }, { id: 'cF2', name: 'ALPHA' }], byCourse: {} }
    // fileFormat would refuse a dup name before this, but the belt must not
    // silently collapse both onto cS: the first takes it, the second keeps its own id.
    const { remapped } = reconcileCourseIds(file, null, store3)
    const dests = file.courses.map(c => remapped[c.id] || c.id)  // each course's resolved destination id
    expect(dests).toEqual(['cS', 'cF2'])                          // first takes cS, second keeps its own
    expect(new Set(dests).size).toBe(dests.length)               // no two share a destination id
  })
})
