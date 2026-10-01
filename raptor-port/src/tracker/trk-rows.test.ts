// @vitest-environment jsdom
/* [DB-READINESS] group A, phase 5b (owner D462, 30 Sep 26: "every Tracker record that holds several people's or several
   charts' work is saved one piece per thing"; D464 — his charts, syllabi and every ball's typed details are his own work
   and are KEPT: the one-time conversion carries every chart, its layout and every ball's details across, tested before
   and after). Driven on the REAL Tracker, as several browsers over ONE stand-in shared store: each client is its own
   copy of the Tracker (a fresh module instance, as a second browser would have), reading and writing the same store.

   - two people add two students to one course and chart at the same moment — both remain;
   - two people edit two different charts at the same moment — both remain;
   - the course order and the student order are kept across a reload;
   - the chart a person has open is HIS OWN place (D376 reading 5): it is never written into the course's shared plan,
     so the next person does not open on it (the finding filed in phase 4 — `OUTSTANDING.md` `[DB-READINESS]`);
   - after a save the store holds rows, never the old whole-list records;
   - his browser's old records, converted once at boot (the fold), read and EXPORT exactly as they did before. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Whiteboard } from '../storage/whiteboard'
import { trackerTarget } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { bootStorage } from '../storage/boot'
import { FOLD_FORMAT, targetFormat } from '../storage/fold'
import { SCHEMA_VERSION } from '../storage/reset'
import { readSchema } from '../storage/schema'
import '../boot'   /* the app's own boot module: every converter the fold needs is registered by what it imports */

const tick = () => new Promise(r => setTimeout(r, 0))
const until = async (f: () => any) => { for (let i = 0; i < 800; i++) { if (f()) return; await tick() } throw new Error('timed out waiting for the Tracker') }

/* ONE CLIENT: a fresh copy of the Tracker (its own memory, its own command layer), on the shared store — a browser */
async function client(wb: Whiteboard, who?: string): Promise<any> {
  vi.resetModules()
  const core: any = await import('./app/core.js')
  const st: any = await import('./storage.js')
  const people: any = await import('./people.js')
  st.useStorageImpl(trackerTarget(wb))
  if (who) people.setWhoamiId(() => who)
  await core.init()
  await core.whenLoaded()
  return core
}
async function addStudent(core: any, name: string) {
  const p = core.addStudent(); await until(() => core.dlg); core.dlgClose(name); await p; await core.whenLoaded()
}
async function addCourse(core: any, name: string) {
  const p = core.addCourse(); await until(() => core.dlg); core.dlgClose(name); await p; await core.whenLoaded()
}
/* a structural chart edit — one ball added through the chart's own list editor — then ✓ Save changes */
async function addBall(core: any, id: string) {
  const arr = JSON.parse(JSON.stringify(core.SYL))
  arr.push({ id, type: 'sim', seq: 999, prereqs: [], phase: arr.length ? arr[0].phase : 'P' })
  expect(await core.saveSylText(JSON.stringify(arr))).toBeNull()
  await core.persistSyl()
  await core.whenLoaded()
}
const names = (core: any) => core.roster.map((r: any) => r.name)

let board: HTMLDivElement
beforeEach(() => { localStorage.clear(); board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board) })
afterEach(() => { board.remove() })

describe('two people at the same moment, on one course and chart', () => {
  it('each adds a student — BOTH remain, and every reader sees them in the same order', async () => {
    const wb = new Whiteboard()
    const a = await client(wb)
    const b = await client(wb)                 // opened before either add: its copy of the list has neither
    expect(names(a)).toEqual(['STUDENT A', 'STUDENT B'])
    await addStudent(a, 'ALPHA')
    await addStudent(b, 'BRAVO')
    const c = await client(wb)
    expect([...names(c)].sort()).toEqual(['ALPHA', 'BRAVO', 'STUDENT A', 'STUDENT B'])
    expect(names(c).slice(0, 2)).toEqual(['STUDENT A', 'STUDENT B'])
    const d = await client(wb)
    expect(names(d)).toEqual(names(c))
  })

  it('one removes a student while the other adds one — the removal stays, the addition stays', async () => {
    const wb = new Whiteboard()
    const a = await client(wb)
    const b = await client(wb)
    const gone = a.roster.find((r: any) => r.name === 'STUDENT B').id
    const p = a.removeStudent(gone); await until(() => a.dlg); a.dlgClose(true); await p; await a.whenLoaded()
    await addStudent(b, 'CHARLIE')             // b still holds STUDENT B in its copy — its save must not bring him back
    const c = await client(wb)
    expect(names(c)).toEqual(['STUDENT A', 'CHARLIE'])
  })
})

describe('two people at the same moment, on two different charts', () => {
  it('each edits a chart — BOTH edits remain', async () => {
    const wb = new Whiteboard()
    const a = await client(wb)
    const b = await client(wb)
    const tx = b.sylIdOf('Tx 2026')
    await b.switchSyllabus(tx)                 // b reads the charts now, before a's edit exists
    const one = a.curSylId()
    await addBall(a, 'AAA-1')
    await addBall(b, 'BBB-1')                  // b's copy of the charts has no AAA-1: its save must not undo a's
    const c = await client(wb)
    expect(c.sylHasOwnDef(one) && (c.customDefs[one] || []).some((e: any) => e.id === 'AAA-1')).toBe(true)
    expect((c.customDefs[tx] || []).some((e: any) => e.id === 'BBB-1')).toBe(true)
  })

  it('each types details on a different ball of one chart — BOTH remain', async () => {
    const wb = new Whiteboard()
    const a = await client(wb)
    const b = await client(wb)
    const [e1, e2] = a.SYL.map((e: any) => e.id)
    await a.saveInfoFor(e1, { name: 'ONE BY A' })
    await b.saveInfoFor(e2, { name: 'TWO BY B' })
    const c = await client(wb)
    expect(c.infoFor(e1).name).toBe('ONE BY A')
    expect(c.infoFor(e2).name).toBe('TWO BY B')
  })
})

describe('order is kept across a reload', () => {
  it('the students\' order and the courses\' order, as they were put', async () => {
    const wb = new Whiteboard()
    const a = await client(wb)
    await addStudent(a, 'ALPHA'); await addStudent(a, 'BRAVO')
    await a.saveCrewOrder(['BRAVO', 'STUDENT A', 'ALPHA', 'STUDENT B'])
    await addCourse(a, '27B'); await addCourse(a, '28C')
    await a.saveCourseOrder(['26ABSG', '28C', '27B'])
    const b = await client(wb)
    expect(b.COURSES.map((c: any) => c.name)).toEqual(['26ABSG', '28C', '27B'])
    await b.switchCourse(b.courseIdOf('26ABSG'))
    expect(names(b)).toEqual(['BRAVO', 'STUDENT A', 'ALPHA', 'STUDENT B'])
  })
})

describe('the chart a person has open is his own place (D376 reading 5) — never the course\'s shared plan', () => {
  it('switching chart does not move anyone else\'s chart; he reopens on his', async () => {
    const wb = new Whiteboard()
    const p1 = await client(wb, 'p1')
    const c = p1.course, shared = p1.curSylId()
    const tx = p1.sylIdOf('Tx 2026')
    await p1.switchSyllabus(tx)
    expect(p1.curSylId()).toBe(tx)
    expect(JSON.parse(wb.get('tracker', `v3:${c}:plan`)!).sylId, 'the course\'s own chart is unchanged').toBe(shared)
    const p2 = await client(wb, 'p2')
    expect(p2.curSylId(), 'the next person opens on the course\'s chart').toBe(shared)
    const back = await client(wb, 'p1')
    expect(back.curSylId(), 'he reopens on his own').toBe(tx)
  })
})

describe('what the store holds after the Tracker has run — rows, never the old whole-list records', () => {
  it('no course list, student list or chart record in one piece; one row per course, enrolment and chart', async () => {
    const wb = new Whiteboard()
    const a = await client(wb)
    await addStudent(a, 'ALPHA')
    await a.saveInfoFor(a.SYL[0].id, { name: 'TYPED' })
    await addBall(a, 'ZZ-1')
    await tick()
    const keys = wb.keys('tracker')
    expect(keys.filter(k => /:roster$/.test(k) || ['v3:courses', 'v3:delcourses', 'v3:master:syls', 'v3:master:sylcat', 'v3:master:sylorder',
      'v3:master:sylhidden', 'v3:master:syltomb', 'v3:master:eventinfo'].includes(k))).toEqual([])
    expect(keys.filter(k => k.startsWith('v3:master:course:'))).toHaveLength(1)
    expect(keys.filter(k => k.includes(':enr:'))).toHaveLength(3)
    expect(keys.filter(k => k.startsWith('v3:master:chart:')).length).toBeGreaterThanOrEqual(4)
    expect(keys.filter(k => k.startsWith('v3:master:info:'))).toHaveLength(1)
  })
})

describe('HIS OLD RECORDS, converted once at boot — every chart, layout and ball\'s details kept (D464)', () => {
  /* A browser as his is today: the old whole-list records, holding real work of every kind — a built-in he renamed, one
     hidden, one deleted (with details typed on it before), a built-in he edited, a chart of his own (its layout, a
     font, details on a ball whose code carries a colon), two courses and a deleted one, students on two charts (one
     linked to a person), their marks, dates, pace and lull periods, and the flags every upgrade leaves. */
  const OWN = 'sc1hisown', C1 = 'c1aaaaa', C2 = 'c2bbbbb', C3 = 'c3ccccc'
  const S1 = 'sAAAAAA', S2 = 'sBBBBBB', S3 = 'sCCCCCC'
  function oldStore(): Record<string, string> {
    const J = JSON.stringify
    const ownDef = [
      { id: 'H-01', type: 'acad', seq: 0, prereqs: [], phase: 'Ground' },
      { id: 'H-02', type: 'flight', seq: 1, prereqs: ['H-01'], phase: 'Air' },
      { id: 'H:03', type: 'sim', seq: 2, prereqs: ['H-02'], phase: 'Air' },
    ]
    return {
      'v3:seedstamp': '2026-07-22T00:30:11.314Z',
      'v3:courseidmig': '1', 'v3:sylcatmig': '1', 'v3:sylreset': '1',
      'v3:courses': J([{ id: C1, name: '26ABSG' }, { id: C2, name: '27B' }]),
      'v3:delcourses': J([{ id: C3, name: 'OLD' }]),
      'v3:master:sylcat': J([
        { id: 'sb2024', name: '2024', base: '2024' },
        { id: 'sb2026', name: 'MY 2026', base: '2026', userNamed: true },
        { id: 'sbtx2026', name: 'Tx 2026', base: 'Tx 2026' },
        { id: OWN, name: 'HIS OWN: CHART', userNamed: true },
      ]),
      'v3:master:sylorder': J([OWN, 'sb2026', 'sbtx2026', 'sb2024']),
      'v3:master:sylhidden': J(['sb2024']),
      'v3:master:syltomb': J({ sbagaa2026: 1 }),
      'v3:master:syls': J({ [OWN]: ownDef }),
      'v3:master:eventinfo': J({
        [OWN]: { 'H-01': { name: 'Ground school', fmt: 'Lecture', hrs: '2' }, 'H:03': { crew: '2 x F-15', pre: 'after H-02' } },
        sb2026: { 'ST-01': { name: 'HIS WORDS' } },
        sbagaa2026: { 'AG-01': { name: 'typed before it was deleted' } },
      }),
      [`v3:master:lay:${OWN}`]: J({ 'H-01': { x: 60, y: 60 }, 'H-02': { x: 260, y: 152 }, 'H:03': { x: 460, y: 244 }, __font: { 'H-02': 11 }, __lines: [{ id: 'l1', pts: [[1, 2], [3, 4]] }] }),
      'v3:master:lay:sb2026': J({ 'ST-01': { x: 99, y: 88 } }),
      [`v3:${C1}:plan`]: J({ lulls: [], mode: 'pace', epw: 2, target: null, target2: null, sylId: 'sb2026' }),
      [`v3:${C2}:plan`]: J({ lulls: [], mode: 'pace', epw: 3, target: null, target2: null, sylId: OWN }),
      [`v3:${C3}:plan`]: J({ lulls: [], mode: 'pace', epw: 2, target: null, target2: null, sylId: 'sb2026' }),
      [`v3:${C1}:sb2026:roster`]: J([{ id: S1, name: 'ALPHA', pid: 'p1' }, { id: S2, name: 'BRAVO' }]),
      [`v3:${C1}:${OWN}:roster`]: J([{ id: S2, name: 'BRAVO' }]),
      [`v3:${C2}:${OWN}:roster`]: J([{ id: S3, name: 'CHARLIE' }]),
      /* a student list left on a chart that is no longer in the catalogue (nobody enrolled there has a mark) — the export
         still finds it, from its own rows */
      [`v3:${C1}:sc9orphan:roster`]: J([{ id: 'sDDDDDD', name: 'DELTA' }]),
      [`v3:${C1}:sb2026:m:${S1}`]: J({ 'ST-01': { g: 'dco', d: '2026-09-01' } }),
      [`v3:${C1}:sb2026:d:${S1}`]: J({ lastSyll: '2026-09-01', lastCurr: null }),
      [`v3:${C1}:pace:${S1}`]: J({ epw: 3, target: '2027-01-01', target2: null }),
      [`v3:${C1}:lulls:${S2}`]: J([{ start: '2026-10-01', end: '2026-10-05' }]),
      [`v3:${C1}:lastStudent`]: S1,
      [`v3:${C1}:rostermig`]: '1', [`v3:${C1}:idmig`]: '1',
      [`v3:${C2}:rostermig`]: '1', [`v3:${C2}:idmig`]: '1',
      [`v3:${C3}:rostermig`]: '1', [`v3:${C3}:idmig`]: '1',
    }
  }
  const at5 = () => JSON.stringify({ stage: 1, dataFormatVersion: SCHEMA_VERSION, initialized: true, appliedAt: 'x', minClient: SCHEMA_VERSION })
  /* everything the Tracker shows or exports of his work */
  async function picture(core: any) {
    const charts = await core.collectCharts(null, { deleted: true })
    const students = await core.collectStudents()
    return {
      charts, students,
      courses: core.COURSES, deleted: core.deletedCourses(),
      order: core.orderedSylIds(), names: core.orderedSylIds().map((i: string) => core.sylName(i)),
      hidden: core.hiddenBuiltins(),
    }
  }

  it('the app\'s own boot registers every converter: the fold is due at format 5 and the store comes out at 6', () => {
    expect(targetFormat()).toBe(FOLD_FORMAT)
  })

  it('converted, it reads and exports EXACTLY as it did before — every chart, layout, name, order and detail', async () => {
    /* BEFORE: a Tracker reading the old records as they stand */
    const wbOld = new Whiteboard()
    for (const [k, v] of Object.entries(oldStore())) wbOld.set('tracker', k, v)
    const before = await picture(await client(wbOld))

    /* AFTER: the same store through the app's real storage boot, which folds it once */
    const be = new MemoryBackend()
    be.seed({ settings: { schema: at5() }, tracker: oldStore() })
    const { wb } = await bootStorage(be)
    expect(readSchema(be.peek('settings', 'schema'))!.dataFormatVersion).toBe(FOLD_FORMAT)
    for (const k of ['v3:courses', 'v3:delcourses', 'v3:master:sylcat', 'v3:master:syls', 'v3:master:eventinfo', `v3:${C1}:sb2026:roster`])
      expect(be.peek('tracker', k), k + ' converted away').toBeNull()
    const after = await picture(await client(wb))

    expect(after).toEqual(before)
    /* and, spelled out, the things he would miss first */
    expect(after.names).toEqual(['HIS OWN: CHART', 'MY 2026', 'Tx 2026'])
    expect(after.charts.syllabi[OWN].map((e: any) => e.id)).toEqual(['H-01', 'H-02', 'H:03'])
    expect(after.charts.layouts[OWN]['H-02']).toEqual({ x: 260, y: 152 })
    expect(after.charts.layouts[OWN].__font).toEqual({ 'H-02': 11 })
    expect(after.charts.layouts[OWN].__lines).toEqual([{ id: 'l1', pts: [[1, 2], [3, 4]] }])
    expect(after.charts.eventInfoBySyl[OWN]['H:03']).toEqual({ crew: '2 x F-15', pre: 'after H-02' })
    expect(after.charts.eventInfoBySyl.sb2026['ST-01']).toEqual({ name: 'HIS WORDS' })
    expect(after.charts.eventInfoBySyl.sbagaa2026['AG-01']).toEqual({ name: 'typed before it was deleted' })
    expect(after.charts.deleted).toEqual(['sbagaa2026'])
    expect(after.courses.map((c: any) => c.name)).toEqual(['26ABSG', '27B'])
    expect(after.deleted.map((c: any) => c.name)).toEqual(['OLD'])
    expect(after.students.byCourse[C1].bySyllabus.sb2026.roster).toEqual([{ id: S1, name: 'ALPHA', pid: 'p1' }, { id: S2, name: 'BRAVO' }])
    expect(after.students.byCourse[C1].bySyllabus[OWN].roster).toEqual([{ id: S2, name: 'BRAVO' }])
    expect(after.students.byCourse[C1].bySyllabus.sc9orphan.roster, 'a list on a chart no longer in the catalogue').toEqual([{ id: 'sDDDDDD', name: 'DELTA' }])
  })

  it('a second boot finds nothing left to convert and writes nothing', async () => {
    const be = new MemoryBackend()
    be.seed({ settings: { schema: at5() }, tracker: oldStore() })
    await bootStorage(be)
    const n = be.journal.length
    await bootStorage(be)
    expect(be.journal.slice(n).filter(e => e.op !== 'loadAll')).toHaveLength(0)
  })
})
