/* The file format's two new refusals and its third block (9 Sep 26, the
   schema-hardening round):
   · a NAME WITH A COLON is refused, naming the part. Course, syllabus and
     student names are segments of the storage key ('v3:' + course + ':' + syl
     + ':m:' + student), so a colon inside one makes the key read as a
     different record. The app refuses it at every typing point (core.js); a
     file carrying one is refused here, before anything is written.
   · `links` — course → student name → Raptor person id — rides beside charts
     and students, is checked like them, and survives the round trip. */
import { describe, expect, it } from 'vitest'
import { buildFile, readFile } from './fileFormat.js'

const chart = (name: string) => ({ order: [name], syllabi: { [name]: [{ id: 'ST-01', type: 'acad', prereqs: [] }] }, layouts: {}, eventInfo: {} })
const people = (course: string, syl: string, who: string) => ({
  courses: [course],
  byCourse: { [course]: { plan: {}, bySyllabus: { [syl]: { roster: [who], marks: { [who]: {} }, dates: { [who]: {} } } } } },
})
const file = (parts: any): any => buildFile({ savedAt: 'x', ...parts })

describe('a name with a colon is refused, naming the part (fileFormat.js)', () => {
  it('a chart name', () => {
    expect(() => readFile(file({ charts: chart('A:B') }))).toThrow(/chart .*“A:B”.*colon/)
  })
  it('a course name', () => {
    expect(() => readFile(file({ students: people('26:A', '2026', 'STUDENT A') }))).toThrow(/course .*“26:A”.*colon/)
  })
  it('a syllabus name on a course', () => {
    expect(() => readFile(file({ students: people('26ABSG', 'x:y', 'STUDENT A') }))).toThrow(/syllabus .*“x:y”.*colon/)
  })
  it('a crew member MAY contain a colon — the name is a label now, not a key (stable ids, 10 Sep 26)', () => {
    const s = people('26ABSG', '2026', 'A: B'); (s.byCourse['26ABSG'] as any).pace = { 'P:Q': {} }
    expect(() => readFile(file({ students: s }))).not.toThrow()
  })
  it('plain names still pass', () => {
    const f = file({ charts: chart('A/G - A/A 2026'), students: people('26ABSG', 'A/G - A/A 2026', "O'BRIEN J") })
    expect(() => readFile(f)).not.toThrow()
  })
})

describe('the roster shape (stable ids, 10 Sep 26)', () => {
  const entries = (course: string, syl: string, roster: any[]) => ({
    courses: [course], byCourse: { [course]: { plan: {}, bySyllabus: { [syl]: { roster, marks: {}, dates: {} } } } },
  })
  it('a legacy string roster still reads', () => {
    expect(() => readFile(file({ students: entries('C', 'S', ['STUDENT A']) }))).not.toThrow()
  })
  it('an entry roster reads — id and name strings, pid optional', () => {
    expect(() => readFile(file({ students: entries('C', 'S', [{ id: 's1', name: 'STUDENT A' }, { id: 's2', name: 'STUDENT B', pid: 'p2' }]) }))).not.toThrow()
  })
  it('a damaged entry is refused, naming the syllabus', () => {
    for (const bad of [{ id: '', name: 'X' }, { id: 's1' }, { name: 'X' }, 5, null])
      expect(() => readFile(file({ students: entries('C', 'S', [bad]) })), JSON.stringify(bad)).toThrow(/crew list for “S”/)
  })
  it('a roster mixing strings and entries is refused', () => {
    expect(() => readFile(file({ students: entries('C', 'S', ['STUDENT A', { id: 's1', name: 'B' }]) }))).toThrow(/crew list for “S”/)
  })
  it('conflicts are refused, naming them: one id twice on a roster, one name twice on a roster, one id under two names across syllabi (review finding 5)', () => {
    expect(() => readFile(file({ students: entries('C', 'S', [{ id: 's1', name: 'A' }, { id: 's1', name: 'B' }]) }))).toThrow(/id s1 twice on “S”/)
    expect(() => readFile(file({ students: entries('C', 'S', [{ id: 's1', name: 'A' }, { id: 's2', name: 'A' }]) }))).toThrow(/“A” twice on “S”/)
    expect(() => readFile(file({ students: entries('C', 'S', ['A', 'A']) }))).toThrow(/“A” twice on “S”/)
    const two: any = entries('C', 'S', [{ id: 's1', name: 'A' }]); two.byCourse.C.bySyllabus.T = { roster: [{ id: 's1', name: 'Z' }], marks: {}, dates: {} }
    expect(() => readFile(file({ students: two }))).toThrow(/id s1 .*two names/)
  })
})

describe('the links block (fileFormat.js)', () => {
  const links = { '26ABSG': { 'STUDENT A': 'bane', 'STUDENT B': 'dj' } }

  it('rides beside charts and students, is flagged in `contains`, and survives the round trip', () => {
    const f = file({ students: people('26ABSG', '2026', 'STUDENT A'), links })
    expect(f.contains).toEqual({ charts: false, students: true, links: true })
    expect(f.links).toEqual(links)
    const r = readFile(JSON.parse(JSON.stringify(f)))
    expect(r.links).toEqual(links)
    expect(r.contains.links).toBe(true)
  })

  it('an older file with no links reads as none', () => {
    const f = file({ charts: chart('2026') })
    expect('links' in f).toBe(false)
    expect(f.contains.links).toBe(false)
    const r = readFile(f)
    expect(r.links).toBeNull()
    expect(r.contains.links).toBe(false)
  })

  it('is refused when it is not course → name → id', () => {
    expect(() => readFile(file({ links: [] }))).toThrow(/links/)
    expect(() => readFile(file({ links: { '26ABSG': 'bane' } }))).toThrow(/links/)
    expect(() => readFile(file({ links: { '26ABSG': { 'STUDENT A': 7 } } }))).toThrow(/links/)
    expect(() => readFile(file({ links: { '26ABSG': { 'STUDENT A': '' } } }))).toThrow(/links/)
  })

  it('refuses a colon in a linked course or crew member name too', () => {
    expect(() => readFile(file({ links: { 'A:B': { 'STUDENT A': 'bane' } } }))).toThrow(/course .*“A:B”.*colon/)
    expect(() => readFile(file({ links: { '26ABSG': { 'A:B': 'bane' } } }))).toThrow(/crew member .*“A:B”.*colon/)
  })
})
