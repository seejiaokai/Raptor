// @vitest-environment jsdom
/* THE TRACKER BATCH (D495, 17 Oct 26) — what it SAVES. Plan: docs/superpowers/plans/2026-10-17-tracker-batch-triage.md.
   The Tracker on a real whiteboard (as trk-restore.test.ts), so every assertion reads what was STORED, not memory:
   - D981: a man deleted through Post out leaves every course still running for him — his place on its lists, nothing
     of his record — and stays where all of his events are done or N.A.;
   - [TRK-UNDO-WRITES-DEFAULTS]: the first ↶ of a mark stores no pace, lull list or dates nobody made, and takes the
     marks record away again when there was none;
   - [TRK-SAVE-FAIL-SAYS-SAVED]: the Tracker's corner says no "saved" while Raptor's saver has failed.
   Each was run RED against the code before the batch (the evidence sheet's break list names the lines). */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import * as core from './app/core.js'
import { useStorageImpl, useSaveHealth } from './storage.js'
import { setPeople, setGonePeople } from './people.js'
import { Whiteboard } from '../storage/whiteboard'
import { trackerTarget } from '../storage/adapters'
import { wireRows } from '../state/persist'

const C: any = core
let board: HTMLDivElement
let wb: Whiteboard
const settle = () => new Promise(r => setTimeout(r, 0))
const until = async (f: () => any) => { for (let i = 0; i < 400; i++) { if (f()) return; await settle() } throw new Error('timed out') }
const stored = (k: string) => wb.has('tracker', k)
const rosterKey = (c: string, syl: string) => `v3:${c}:${syl}:roster`
const storedList = async (c: string, syl: string) => JSON.parse((await C.storedRecordForTests(rosterKey(c, syl))) || '[]')
/* + Add, picking a squadron member from the bridge's list */
async function addMember(pid: string) {
  const p = C.addStudent(); await until(() => C.dlg)
  C.dlgClose({ pick: pid }); await p; await C.whenLoaded(); await settle()
}

beforeAll(async () => {
  wb = new Whiteboard()
  wireRows(wb)
  useStorageImpl(trackerTarget(wb))
  board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board)
  setPeople([
    { id: 'pgoA', cs: 'GOA', seat: 'FCP', q: 'OCU', sxo: false },
    { id: 'pgoB', cs: 'GOB', seat: 'RCP', q: 'OCU', sxo: false },
    { id: 'pgoC', cs: 'GOC', seat: 'FCP', q: 'OCU', sxo: false },
    { id: 'pgoD', cs: 'GOD', seat: 'FCP', q: 'OCU', sxo: false },
  ])
  await C.init()
  await C.whenLoaded()
})
afterAll(() => { board.remove(); useStorageImpl(null); useSaveHealth(null) })

describe('D981 — a man deleted through Post out leaves the courses still running for him', () => {
  it('events still to do: he leaves the list (stored), and nothing of his record is erased; a man not deleted stays', async () => {
    const c = C.course, syl = C.curSylId()
    await addMember('pgoA'); await addMember('pgoB')
    const a = C.roster.find((r: any) => r.pid === 'pgoA').id, b = C.roster.find((r: any) => r.pid === 'pgoB').id
    /* one mark for A, so a record of his exists to be kept */
    C.setActive(a, { land: false }); C.openPop(C.SYL[0].id, { clientX: 1, clientY: 1 }); await C.popGrade('dco'); await settle()
    const marksKey = `v3:${c}:${syl}:m:${a}`
    expect(stored(marksKey), 'his mark is stored').toBe(true)
    setGonePeople(['pgoA'])
    await C.whenLoaded(); await settle()
    expect(C.roster.some((r: any) => r.id === a), 'gone from the chart on screen').toBe(false)
    expect((await storedList(c, syl)).some((r: any) => r.id === a), 'gone from the stored list').toBe(false)
    expect((await storedList(c, syl)).some((r: any) => r.id === b), 'the man not deleted stays').toBe(true)
    expect(stored(marksKey), 'his marks are kept, out of sight — never erased (D290, D299)').toBe(true)
    expect(C.active, 'the picker is not left on him').not.toBe(a)
  })

  it('every event done (DCO / DPCO / Marginal) or N.A.: he STAYS, his record kept', async () => {
    const c = C.course, syl = C.curSylId()
    await addMember('pgoC')
    const id = C.roster.find((r: any) => r.pid === 'pgoC').id
    /* his whole chart done — one N.A., one Marginal, one DPCO, the rest DCO (a calculation fixture: his marks, as stored) */
    const all: any = {}
    C.SYL.forEach((e: any, i: number) => { all[e.id] = { g: i === 0 ? 'na' : i === 1 ? 'marg' : i === 2 ? 'dpco' : 'dco', f: 0 } })
    C.marks[id] = all; await C.storeRecordForTests(`v3:${c}:${syl}:m:${id}`, JSON.stringify(all)); await settle()
    setGonePeople(['pgoA', 'pgoC'])
    await C.whenLoaded(); await settle()
    expect(C.roster.some((r: any) => r.id === id), 'he stays on the chart').toBe(true)
    expect((await storedList(c, syl)).some((r: any) => r.id === id), 'and on the stored list').toBe(true)
  })

  it('one event left (not done, not N.A.) is enough to leave; and a course not on screen is left too', async () => {
    const first = C.course, syl = C.curSylId()
    /* a second course, with him on it and nothing marked; then back to the first */
    const pc = C.addCourse(); await until(() => C.dlg); C.dlgClose('GONECRS'); await pc; await C.whenLoaded(); await settle()
    const second = C.course; expect(second).not.toBe(first)
    const sylHere = C.curSylId()
    await addMember('pgoD')
    const d = C.roster.find((r: any) => r.pid === 'pgoD').id
    await C.switchCourse(first); await C.whenLoaded(); await settle()
    expect(C.course).toBe(first)
    /* on the first course, all of his events done but one */
    await addMember('pgoD')
    const d1 = C.roster.find((r: any) => r.pid === 'pgoD').id
    const nearly: any = {}; C.SYL.forEach((e: any, i: number) => { if (i) nearly[e.id] = { g: 'dco', f: 0 } })
    C.marks[d1] = nearly; await C.storeRecordForTests(`v3:${first}:${syl}:m:${d1}`, JSON.stringify(nearly)); await settle()
    setGonePeople(['pgoA', 'pgoC', 'pgoD'])
    await C.whenLoaded(); await settle()
    expect(C.roster.some((r: any) => r.id === d1), 'one event to do: he leaves this course').toBe(false)
    expect((await storedList(second, sylHere)).some((r: any) => r.id === d), 'and the course not on screen').toBe(false)
  })

  it('the bridge only acts on a change: the same list again writes nothing', async () => {
    let n = 0; const off = wb.subscribe(() => { n++ })
    setGonePeople(['pgoD', 'pgoC', 'pgoA'])   /* the same ids, another order */
    await C.whenLoaded(); await settle(); off()
    expect(n, 'nothing saved').toBe(0)
  })
})

describe('[TRK-UNDO-WRITES-DEFAULTS] — the first ↶ of a mark stores nothing nobody made', () => {
  it('a student with nothing stored: one mark, ↶ — no pace, lull list or dates stored, and his marks record goes again', async () => {
    const c = C.course, syl = C.curSylId()
    /* a student on the list with NO records of his own stored (as a list that came in from a file, or the demo's) */
    /* ...and, as the chart's load fills them (loadStudent), his pace and lull list held in memory at their defaults */
    const id = 'sNEWUNDO'; C.roster.push({ id, name: 'NEW UNDO' }); C.marks[id] = {}; C.dates[id] = { lastSyll: null, lastCurr: null }
    C.pace[id] = { epw: 2, target: null, target2: null }; C.lulls[id] = []
    const k = { m: `v3:${c}:${syl}:m:${id}`, d: `v3:${c}:${syl}:d:${id}`, p: `v3:${c}:pace:${id}`, l: `v3:${c}:lulls:${id}` }
    for (const key of Object.values(k)) expect(stored(key), key + ' not stored before').toBe(false)
    C.setActive(id, { land: false }); C.openPop(C.SYL[0].id, { clientX: 1, clientY: 1 }); await C.popGrade('dco'); await settle()
    expect(stored(k.m), 'the mark stored').toBe(true)
    await C.doUndo(); await settle()
    expect(C.gradeOf(id, C.SYL[0].id), 'the mark taken back').toBe(0)
    expect(stored(k.p), 'no pace stored').toBe(false)
    expect(stored(k.l), 'no lull list stored').toBe(false)
    expect(stored(k.d), 'no dates stored').toBe(false)
    expect(stored(k.m), 'his marks record gone again, not left as {}').toBe(false)
    expect(C.paceOf(id).epw, 'the chart still shows his default pace').toBe(2)
    /* ↷ puts the mark back, stored */
    await C.doRedo(); await settle()
    expect(C.gradeOf(id, C.SYL[0].id)).toBe('dco')
    expect(stored(k.m), 'the mark stored again').toBe(true)
    expect(stored(k.p), 'still no pace nobody set').toBe(false)
  })

  it('a student whose pace IS stored: ↶ of a mark keeps it stored, as it was', async () => {
    const id = 'sNEWUNDO', c = C.course
    await C.setEpw(id, '3'); await settle()
    const pk = `v3:${c}:pace:${id}`
    expect(stored(pk)).toBe(true)
    C.openPop(C.SYL[1].id, { clientX: 1, clientY: 1 }); await C.popGrade('dco'); await settle()
    await C.doUndo(); await settle()
    expect(stored(pk), 'the pace he set is still stored').toBe(true)
    expect(JSON.parse(wb.get('tracker', pk)!).epw).toBe('3')
  })
})

describe('[TRK-SAVE-FAIL-SAYS-SAVED] — no "saved" while the saver has failed', () => {
  it('words that say saved step aside while a save has failed, and come back once it lands', async () => {
    let status = 'saved'; const subs = new Set<() => void>()
    useSaveHealth({ get status() { return status }, onStatus(f: () => void) { subs.add(f); return () => subs.delete(f) } })
    await C.saveOrderList(C.orderedSylNames())
    expect(C.saveWords().text, 'saved, while it is').toMatch(/saved/)
    status = 'failed'; subs.forEach(f => f()); await settle()
    expect(C.saveWords().text, 'nothing says saved while Raptor says Not saved').toBe('')
    status = 'saved'; subs.forEach(f => f()); await settle()
    expect(C.saveWords().text, 'back once Retry has landed').toMatch(/saved/)
  })
})
