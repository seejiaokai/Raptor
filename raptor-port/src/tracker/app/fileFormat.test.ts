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
  it('a crew member on a roster, or filed under marks or dates', () => {
    expect(() => readFile(file({ students: people('26ABSG', '2026', 'A: B') }))).toThrow(/crew member .*“A: B”.*colon/)
    const s = people('26ABSG', '2026', 'STUDENT A')
    s.byCourse['26ABSG'].bySyllabus['2026'].marks['X:Y'] = {}
    expect(() => readFile(file({ students: s }))).toThrow(/crew member .*“X:Y”.*colon/)
  })
  it('plain names still pass', () => {
    const f = file({ charts: chart('A/G - A/A 2026'), students: people('26ABSG', 'A/G - A/A 2026', "O'BRIEN J") })
    expect(() => readFile(f)).not.toThrow()
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
