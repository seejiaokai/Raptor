// @vitest-environment jsdom
/* [TRK-FILE-TRANSFER-SPLIT] — the boundary of the Tracker's file import (17 Oct 26, D493, D775).
   The 13 Oct 26 look stopped the whole export / import move at Astra's own stop condition (it would
   need a catch-all "core context"), and left this much to move: the steps of an import that touch
   nothing of the store — the file's normalising (`normalizeImport`), the chart comparison
   (`sameDef`) and the students block's re-keying (`remapStudentsSyl`) — now in `app/fileTransfer.js`
   beside the file format. The one thing they read of the store, the chart catalogue, is handed in.
   Written BEFORE the move, as the item asked, and run against both sides of it:
   · the module stands alone — no store, no storage, no browser;
   · what it decides, case by case (a v2 file upgraded, a store id winning by name, a clash refused,
     a dangling student reference refused while the charts still import, the file never mutated);
   · core's own `normalizeImport` is the module's, given the live catalogue;
   · end to end through File → Export and File → Import: a whole backup brought back into the same
     store changes no record and no id; a refused file writes nothing. */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import * as core from './app/core.js'
import * as FT from './app/fileTransfer.js'
import { initStore, resetSession } from '../state/store'

const C: any = core
const F: any = FT
const tick = () => new Promise(r => setTimeout(r, 0))
const until = async (f: () => any) => { for (let i = 0; i < 800; i++) { if (f()) return; await tick() } throw new Error('timed out waiting for the app') }
const answer = async (v: any) => { await until(() => C.dlg); C.dlgClose(v) }
const ev = (id: string) => ({ id, type: 'acad', prereqs: [] })

describe('the module stands alone', () => {
  it('imports nothing but the syllabus-id helpers — no store, no storage, no browser API', () => {
    const src = readFileSync(join(__dirname, 'app', 'fileTransfer.js'), 'utf8')
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
    /* every module it reaches — import … from, export … from, a bare import, a dynamic import() (the blind read, 17 Oct 26) */
    const froms = [...code.matchAll(/\b(?:import|from)\s*\(?\s*['"]([^'"]+)['"]/g)].map(m => m[1])
    expect(froms, 'its only import').toEqual(['./sylIds.js'])
    for (const w of ['window', 'document', 'localStorage', 'indexedDB', 'storage', 'core.js']) expect(code, 'no ' + w).not.toMatch(new RegExp('\\b' + w.replace('.', '\\.') + '\\b'))
  })
})

describe('what an import decides, with the catalogue handed in', () => {
  const v3 = (sylcat: any[], syllabi: any, students: any = null) => ({ version: 3, charts: { sylcat, syllabi, order: Object.keys(syllabi), layouts: {}, eventInfo: {} }, students, links: null })

  it("a file's custom chart takes the store's id for the same name, in the charts and the students alike", () => {
    const parsed = v3([{ id: 'scfile', name: 'NIGHT' }], { scfile: [ev('N-01')] },
      { sylcat: [{ id: 'scfile', name: 'NIGHT' }], courses: ['C1'], byCourse: { C1: { plan: { sylId: 'scfile' }, lulls: {}, pace: {}, bySyllabus: { scfile: { roster: [{ id: 's1', name: 'A' }], marks: {}, dates: {} } } } } })
    const out = F.normalizeImport(parsed, [{ id: 'scstore', name: 'NIGHT' }])
    expect(Object.keys(out.charts.syllabi)).toEqual(['scstore'])
    expect(out.charts.order).toEqual(['scstore'])
    expect(out.charts.sylcat.map((e: any) => e.id)).toEqual(['scstore'])
    expect(Object.keys(out.students.byCourse.C1.bySyllabus)).toEqual(['scstore'])
    expect(out.students.byCourse.C1.plan.sylId).toBe('scstore')
    expect(out.studentsRefused).toBe(false)
    expect(parsed.charts.order, 'the file read is never changed').toEqual(['scfile'])
    expect(Object.keys(parsed.students.byCourse.C1.bySyllabus)).toEqual(['scfile'])
  })

  it('the same file against an empty catalogue keeps its own ids', () => {
    const out = F.normalizeImport(v3([{ id: 'scfile', name: 'NIGHT' }], { scfile: [ev('N-01')] }), [])
    expect(Object.keys(out.charts.syllabi)).toEqual(['scfile'])
  })

  it("a chart whose store namesake is already claimed by another of the file's charts is refused, whole", () => {
    /* the file renames the store's Y (same id) to Z and brings a second, different "Y" */
    const parsed = v3([{ id: 'scy', name: 'Z' }, { id: 'scb', name: 'Y' }], { scy: [ev('Z-01')], scb: [ev('Y-01')] })
    expect(() => F.normalizeImport(parsed, [{ id: 'scy', name: 'Y' }])).toThrow(/syllabus “Y” is a different chart than one already here/)
  })

  it('a v2 charts block is upgraded to ids once, by name', () => {
    const parsed = { version: 2, charts: { order: ['MY CHART'], syllabi: { 'MY CHART': [ev('M-01')] }, layouts: {}, eventInfo: {} }, students: null, links: null }
    const out = F.normalizeImport(parsed, [])
    const id = out.charts.order[0]
    expect(id, 'a minted id, not the name').not.toBe('MY CHART')
    expect(out.charts.sylcat.find((e: any) => e.id === id).name).toBe('MY CHART')
    expect(out.charts.syllabi[id]).toEqual([ev('M-01')])
  })

  it('a student block that points at a chart the file does not describe is refused — the charts still come', () => {
    const parsed = v3([{ id: 'sca', name: 'A' }], { sca: [ev('A-01')] },
      { sylcat: [{ id: 'sca', name: 'A' }], courses: ['C1'], byCourse: { C1: { plan: { sylId: 'scgone' }, lulls: {}, pace: {}, bySyllabus: {} } } })
    const out = F.normalizeImport(parsed, [])
    expect(out.studentsRefused).toBe(true)
    expect(out.students).toBeNull()
    expect(Object.keys(out.charts.syllabi)).toEqual(['sca'])
  })

  it('sameDef ignores only the layout scratch value', () => {
    expect(F.sameDef([{ ...ev('X'), _b: 3 }], [ev('X')])).toBe(true)
    expect(F.sameDef([ev('X')], [ev('Y')])).toBe(false)
    expect(F.sameDef(null, [])).toBe(true)
  })

  it('remapStudentsSyl refuses two blocks landing on one chart, with the older-version message', () => {
    const s = { courses: ['C1'], byCourse: { C1: { plan: {}, bySyllabus: { sca: {}, scb: {} } } } }
    expect(() => F.remapStudentsSyl(s, () => 'scone')).toThrow(F.STUDENT_GUARD_MSG)
  })

  /* the scenario designer's pins (17 Oct 26) — branches the move could not change, pinned for the module's future */
  it('the file it is given is never changed — a deep-frozen file goes through, and the result shares nothing with it', () => {
    const freeze = (o: any): any => { if (o && typeof o === 'object') { Object.values(o).forEach(freeze); Object.freeze(o) } return o }
    const parsed = freeze(v3([{ id: 'scfile', name: 'NIGHT' }], { scfile: [ev('N-01')] },
      { sylcat: [{ id: 'scfile', name: 'NIGHT' }], courses: ['C1'], byCourse: { C1: { plan: { sylId: 'scfile' }, lulls: {}, pace: {}, bySyllabus: { scfile: { roster: [{ id: 's1', name: 'A' }], marks: {}, dates: {} } } } } }))
    const out = F.normalizeImport(parsed, [{ id: 'scstore', name: 'NIGHT' }])
    expect(out.charts.order).toEqual(['scstore'])
    out.charts.syllabi.scstore.push(ev('N-02'))
    out.students.byCourse.C1.bySyllabus.scstore.roster.push({ id: 's2', name: 'B' })
    expect(parsed.charts.syllabi.scfile).toHaveLength(1)
    expect(parsed.students.byCourse.C1.bySyllabus.scfile.roster).toHaveLength(1)
  })

  it("a chart's layout and typed details follow its id with its events", () => {
    const parsed: any = v3([{ id: 'scfile', name: 'NIGHT' }], { scfile: [ev('N-01')] })
    parsed.charts.layouts = { scfile: { 'N-01': { x: 1, y: 2 } } }
    parsed.charts.eventInfoBySyl = { scfile: { 'N-01': { name: 'Night one' } } }
    const out = F.normalizeImport(parsed, [{ id: 'scstore', name: 'NIGHT' }])
    expect(Object.keys(out.charts.layouts)).toEqual(['scstore'])
    expect(out.charts.eventInfoBySyl).toEqual({ scstore: { 'N-01': { name: 'Night one' } } })
  })

  it('a file whose two catalogues name one chart differently is refused', () => {
    const parsed = v3([{ id: 'sca', name: 'A' }], { sca: [ev('A-01')] },
      { sylcat: [{ id: 'sca', name: 'NOT A' }], courses: ['C1'], byCourse: { C1: { plan: { sylId: 'sca' }, lulls: {}, pace: {}, bySyllabus: {} } } })
    expect(() => F.normalizeImport(parsed, [])).toThrow()
  })

  it('a file with no version: its chart is upgraded by name, its students left as they are for the guardrail', () => {
    const students = { courses: ['OLD'], byCourse: { OLD: { plan: { sylName: 'FIRST' }, lulls: {}, pace: {}, bySyllabus: { FIRST: { roster: ['P'], marks: {}, dates: {} } } } } }
    const out = F.normalizeImport({ charts: { order: ['FIRST'], syllabi: { FIRST: [ev('F-01')] }, layouts: {}, eventInfo: {} }, students, links: null }, [])
    expect(out.charts.order[0]).not.toBe('FIRST')
    expect(out.students).toEqual(students)
    expect(out.studentsRefused).toBe(false)
  })
})

describe('end to end, through the File menu', () => {
  beforeAll(async () => {
    initStore()
    resetSession({ user: 'ad', role: 'admin' })
    const board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board)
    await C.init()
  })
  afterAll(() => { document.getElementById('board')?.remove() })

  async function exportAll() {
    let text = ''
    ;(window as any).__pickSaveForTests = async (name: string) => ({ name, createWritable: async () => ({ write: async (t: string) => { text = t }, close: async () => {} }) })
    try {
      await C.openCopy(); C.setCopyPickAll(true); C.setCopyOpt('students', true)
      const p = C.saveCopyClick(); await answer(true); await p
    } finally { delete (window as any).__pickSaveForTests }
    return JSON.parse(text)
  }
  /* answers "Replace it" to every chart already here and yes to bringing the students in; returns every message shown */
  async function importBack(file: any) {
    const seen: string[] = []
    ;(window as any).__pickOpenForTests = async () => ({ name: 'b.json', text: JSON.stringify(file) })
    try {
      const p = C.importClick()
      let done = false
      p.then(() => { done = true })
      for (;;) {
        await until(() => C.dlg || done)
        if (!C.dlg) break
        seen.push(String(C.dlg.msg)); C.dlgClose(true); await tick()
      }
      await p
    } finally { delete (window as any).__pickOpenForTests }
    await C.whenLoaded()
    return seen
  }
  /* every chart, student, mark and id, the catalogue by its entries and the order the screen shows. The catalogue's own
     list order is left out: an import stores it in the file's order (older than this move, and unseen — the Syllabus
     list and ⇅ Reorder follow the chart order, which is compared). */
  const snapshot = async () => JSON.parse(JSON.stringify({ charts: await C.collectCharts(), students: await C.collectStudents(),
    cat: [...C.SYLS].sort((a: any, b: any) => a.id < b.id ? -1 : 1), shown: C.orderedSylIds() }))

  it("core's normalizeImport is the module's, given the live catalogue", async () => {
    const file = await exportAll()
    expect(C.normalizeImport(file)).toEqual(F.normalizeImport(file, C.SYLS))
    /* and with a file the catalogue CHANGES — a chart named like one here, under another browser's id: only the live
       catalogue maps it onto this store's id (an empty or stale one would keep the file's) — the blind read, 17 Oct 26 */
    const p: Promise<any> = C.addSyl(); await answer('BOUNDARY X'); await p; await C.whenLoaded()
    const other = { version: 3, charts: { sylcat: [{ id: 'scfreshx', name: 'BOUNDARY X' }], syllabi: { scfreshx: [ev('X-01')] }, order: ['scfreshx'], layouts: {}, eventInfo: {} }, students: null, links: null }
    expect(C.normalizeImport(other).charts.order).toEqual([C.sylIdOf('BOUNDARY X')])
    expect(C.normalizeImport(other)).toEqual(F.normalizeImport(other, C.SYLS))
  })

  it('a whole backup brought back into the same store changes no record and no id', async () => {
    const before = await snapshot()
    const file = await exportAll()
    expect(file.contains.students, 'the premise: the backup carries the students').toBe(true)
    await importBack(file)
    expect(await snapshot()).toEqual(before)
  })

  it('a refused file writes nothing, and says why', async () => {
    let p: Promise<any> = C.addSyl(); await answer('BOUNDARY Y'); await p; await C.whenLoaded()
    const yId = C.sylIdOf('BOUNDARY Y')
    const before = await snapshot()
    const file = { format: 'ocu-tracker', version: 3, savedAt: '2026-10-17T00:00:00Z', contains: { charts: true, students: false, links: false },
      charts: { sylcat: [{ id: yId, name: 'BOUNDARY Z' }, { id: 'scboundb', name: 'BOUNDARY Y' }], syllabi: { [yId]: [ev('Z-01')], scboundb: [ev('Y-01')] }, order: [yId, 'scboundb'], layouts: {}, eventInfo: {} },
      students: null, links: null }
    const seen = await importBack(file)
    expect(seen.join(' | ')).toMatch(/different chart than one already here/)
    expect(await snapshot()).toEqual(before)
  })
})
