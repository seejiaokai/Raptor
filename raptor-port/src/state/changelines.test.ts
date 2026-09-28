// @vitest-environment jsdom
/* EVERY CHANGE TO AN ABSENCE IS A LINE — ONE, FROM EVERY DOOR ([DRAFT-PENDING], 28 Sep 26 — the owner's D263, "2 yes":
   an input edited, cut by a medical, moved, deleted — each a line saying what changed, who and when; Astra DP-03: ONE
   writer, so no door writes a second; DP-05: a line keeps the span before AND after, and shows on both, never between).

   The writer is the command-stream subscriber (state/changelines.ts). These tests go through the app's own write path
   for inputs (writeInputs / writeInputsBatch — every door's funnel), signed in as the admin. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { ELOG, elogClear, rowTouches, todayIso } from '../engine/editlog'
import { PEOPLE } from '../engine/people'
import { updatePersonField } from './quals-write'
import { INPUTS } from '../engine/inputs'
import { inpId } from '../engine/inputs'
import { initStore, resetSession, writeInputs, writeInputsBatch } from './store'
import { signIn, sessionFor } from './accounts'
import { elogReason, changeLinesFor } from './changelines'
import { installGlobalUndo } from './undo-wire'
import { globalUndo, globalRedo } from '../undo'

const fake = new Map<string, string>()
let ISNAP = ''
beforeAll(() => {
  storeBackend.impl = { getItem: k => (fake.has(k) ? fake.get(k)! : null), setItem: (k, v) => { fake.set(k, v) } }
  initStore()
  ISNAP = JSON.stringify(INPUTS)
  resetSession(sessionFor(signIn('ad', 'a') as any))
})
afterAll(() => { storeBackend.impl = null })
beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  elogClear()
})

const add = (row: any) => { writeInputs(() => { inpId(row); INPUTS.unshift(row) }); return row }
const lines = () => ELOG.rows.filter(r => r.iid)

describe('an input', () => {
  it('added: ONE line, on the days it covers, naming whose and what', () => {
    const r = add({ person: 'bane', date: 'Aug 1', endDate: 'Aug 2', yr: 2026, allday: true, type: 'LL', remarks: '' })
    expect(lines()).toHaveLength(1)
    const l = lines()[0]!
    expect(l.iid).toBe(r.iid)
    expect(l.lbl).toContain('Ranger')
    expect(l.lbl).toContain('LL')
    expect(l.lbl).toContain('added')
    expect(rowTouches(l, '2026-08-01')).toBe(true)
    expect(rowTouches(l, '2026-08-02')).toBe(true)
    expect(rowTouches(l, '2026-08-03')).toBe(false)
    expect(l.pid).toBe('stiff')                       // Saber made it
  })

  it('moved to other dates: ONE line, shown on the old days and the new, never on the days between', () => {
    const r = add({ person: 'bane', date: 'Aug 1', endDate: 'Aug 2', yr: 2026, allday: true, type: 'LL', remarks: '' })
    elogClear()
    writeInputs(() => { r.date = 'Aug 6'; r.endDate = 'Aug 7' })
    expect(lines()).toHaveLength(1)
    const l = lines()[0]!
    expect(l.lbl).toContain('dates')
    for (const d of ['2026-08-01', '2026-08-02', '2026-08-06', '2026-08-07']) expect(rowTouches(l, d), d).toBe(true)
    for (const d of ['2026-08-03', '2026-08-04', '2026-08-05']) expect(rowTouches(l, d), d).toBe(false)
  })

  it('handed to another man: ONE line saying from whom to whom', () => {
    const r = add({ person: 'bane', date: 'Aug 1', yr: 2026, allday: true, type: 'LL', remarks: '' })
    elogClear()
    writeInputs(() => { r.person = 'stiff' })
    expect(lines()).toHaveLength(1)
    expect(lines()[0]!.from).toBe('Ranger')
    expect(lines()[0]!.to).toBe('Saber')
  })

  it('its type, times and remarks: one line each thing that changed', () => {
    const r = add({ person: 'bane', date: 'Aug 1', yr: 2026, allday: true, type: 'LL', remarks: '' })
    elogClear()
    writeInputs(() => { r.type = 'OL'; r.remarks = 'family' })
    expect(lines().map(l => l.lbl.split(' · ').pop())).toEqual(['type', 'remarks'])
  })

  it('deleted: ONE line, on the days it covered', () => {
    const r = add({ person: 'bane', date: 'Aug 1', yr: 2026, allday: true, type: 'LL', remarks: '' })
    elogClear()
    writeInputs(() => { INPUTS.splice(INPUTS.indexOf(r), 1) })
    expect(lines()).toHaveLength(1)
    expect(lines()[0]!.lbl).toContain('deleted')
    expect(rowTouches(lines()[0]!, '2026-08-01')).toBe(true)
  })

  it('a door that knows WHY hands its reason to the line, inside its command', () => {
    const row: any = { person: 'bane', date: 'Aug 1', yr: 2026, allday: true, type: 'MC', remarks: '' }
    writeInputsBatch(() => { inpId(row); INPUTS.unshift(row); elogReason(row.iid, 'the tail of a split medical entry') })
    expect(lines()).toHaveLength(1)
    expect(lines()[0]!.lbl).toContain('the tail of a split medical entry')
  })

  it('an edit that changes nothing a person reads writes no line', () => {
    const r = add({ person: 'bane', date: 'Aug 1', yr: 2026, allday: true, type: 'LL', remarks: '' })
    elogClear()
    writeInputs(() => { r.mod = Date.now() })
    expect(lines()).toHaveLength(0)
  })
})

describe('Quals, and a publish or a withdrawal (Fable F3, F5; Astra DP-07)', () => {
  it('a CAT change on Quals is ONE line, "Ranger · CAT", dated the day it was made', () => {
    const was = (PEOPLE as any).bane.q
    const to = was === 'A' ? 'B' : 'A'
    expect(updatePersonField('bane', { cat: to })).toBeNull()
    const q = ELOG.rows.filter(r => r.sect === 'quals')
    expect(q).toHaveLength(1)
    expect(q[0]!.lbl).toBe('Ranger · CAT')
    expect(q[0]!.from).toBe(was)
    expect(q[0]!.to).toBe(to)
    expect(q[0]!.date).toBe(todayIso())
    updatePersonField('bane', { cat: was })
  })

  it('a qualification tick is a line named by its column heading', () => {
    const was = !!(PEOPLE as any).bane.tf
    expect(updatePersonField('bane', { tick: 'tf' })).toBeNull()
    const q = ELOG.rows.filter(r => r.sect === 'quals')
    expect(q.map(r => r.lbl)).toEqual(['Ranger · TF'])
    expect(q[0]!.to).toBe(was ? 'no' : 'yes')
    updatePersonField('bane', { tick: 'tf' })
  })

  it('a publish and a withdrawal are read from the command\'s own boundary: the day and the version', () => {
    const env: any = { origin: 'user', scope: { module: 'sched' }, changes: [], actor: { role: 'admin' },
      boundary: { kind: 'publish', ids: ['2026-07-14#0'] } }
    changeLinesFor(env)
    changeLinesFor({ ...env, boundary: { kind: 'publish', ids: ['2026-07-14#2'] } })
    changeLinesFor({ ...env, boundary: { kind: 'unpublish', ids: ['2026-07-14#2'] } })
    expect(ELOG.rows.map(r => r.lbl)).toEqual(['Published — the Original', 'Published — AL2', 'AL2 withdrawn'])
    expect(ELOG.rows.every(r => r.date === '2026-07-14' && r.sect === 'day')).toBe(true)
  })

  /* [CHG-BY-ITEM] (Fable F3 / Astra 05): "added to the roster" keeps whose it is, by id, so the changes window files it
     under "Quals · <him>" — never by its words */
  it('a man added to the roster: ONE line keeping whose it is (sub) and what it is (fld "roster")', () => {
    changeLinesFor({ origin: 'user', scope: { module: 'people' }, actor: { role: 'admin' },
      changes: [{ op: 'put', collection: 'people', id: 'newbie', before: undefined, after: { cs: 'Newbie', q: 'C' } }] } as any)
    expect(ELOG.rows.map(r => [r.lbl, r.sect, r.sub, r.fld])).toEqual([['Newbie · added to the roster', 'quals', 'newbie', 'roster']])
  })

  it('a projection (a reconciler) writes no line, however much it changed', () => {
    changeLinesFor({ origin: 'projection', scope: { module: 'inputs' }, changes: [{ op: 'put', collection: 'inputs', id: 'x', after: { person: 'bane', date: 'Aug 1', type: 'LL' } }] } as any)
    expect(ELOG.rows).toHaveLength(0)
  })
})

describe('an Undo or a Redo (Astra DP-04)', () => {
  it('a successful Undo is ONE line on the days it touched; the restore itself writes nothing', () => {
    installGlobalUndo()
    const r = add({ person: 'bane', date: 'Aug 1', endDate: 'Aug 2', yr: 2026, allday: true, type: 'LL', remarks: '' })
    elogClear()
    const u = globalUndo()
    expect(u.ok).toBe(true)
    expect(INPUTS.includes(r)).toBe(false)
    expect(ELOG.rows).toHaveLength(1)
    expect(ELOG.rows[0]!.lbl).toMatch(/^Undo/)
    expect(rowTouches(ELOG.rows[0]!, '2026-08-01')).toBe(true)
    expect(rowTouches(ELOG.rows[0]!, '2026-08-02')).toBe(true)
    elogClear()
    expect(globalRedo().ok).toBe(true)
    expect(ELOG.rows.map(x => x.lbl)).toEqual([expect.stringMatching(/^Redo/)])
  })

  it('a refused Undo writes nothing', () => {
    installGlobalUndo()
    elogClear()
    while (globalUndo().ok) { /* spend every step this session holds */ }
    elogClear()
    expect(globalUndo().ok).toBe(false)
    expect(ELOG.rows).toHaveLength(0)
  })
})
