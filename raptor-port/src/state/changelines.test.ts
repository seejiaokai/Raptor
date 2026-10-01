// @vitest-environment jsdom
/* EVERY CHANGE TO AN ABSENCE IS A LINE — ONE, FROM EVERY DOOR ([DRAFT-PENDING], 28 Sep 26 — the owner's D263, "2 yes":
   an input edited, cut by a medical, moved, deleted — each a line saying what changed, who and when; Astra DP-03: ONE
   writer, so no door writes a second; DP-05: a line keeps the span before AND after, and shows on both, never between).

   The writer is the command-stream subscriber (state/changelines.ts). These tests go through the app's own write path
   for inputs (writeInputs / writeInputsBatch — every door's funnel), signed in as the admin. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { storeBackend } from '../engine/hooks'
import { ELOG, elogClear, rowTouches, todayIso, elogFlush, elogLoad } from '../engine/editlog'
import { PEOPLE } from '../engine/people'
import { updatePersonField } from './quals-write'
import { INPUTS } from '../engine/inputs'
import { inpId } from '../engine/inputs'
import { initStore, resetSession, writeInputs, writeInputsBatch } from './store'
import { signIn, sessionFor } from './accounts'
import { elogReason, changeLinesFor, logReversed } from './changelines'
import { installGlobalUndo } from './undo-wire'
import { globalUndo, globalRedo } from '../undo'

const fake = new Map<string, string>()
let ISNAP = ''
beforeAll(() => {
  storeBackend.impl = { getItem: k => (fake.has(k) ? fake.get(k)! : null), setItem: (k, v) => { if (v === 'null') fake.delete(k); else fake.set(k, v) }, keys: () => [...fake.keys()] }
  initStore()
  ISNAP = JSON.stringify(INPUTS)
  resetSession(sessionFor(signIn('ad', 'a') as any))
})
afterAll(() => { storeBackend.impl = null })
beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  /* a fresh history: the lines in memory and their stored rows (one row per line — [DB-READINESS] group A, phase 4.3) */
  elogClear()
  for (const k of [...fake.keys()]) if (k.startsWith('sqn142_elog:')) fake.delete(k)
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
    /* its TYPE, by field, so a deleted input's item keeps its name — "Input · Ranger · LL" (Astra's final read, FR-04) —
       and a reload keeps it */
    expect(l.itype).toBe('LL')
    elogFlush(); elogLoad()
    expect(lines()[0]!.itype, 'kept across a reload').toBe('LL')
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

  /* the line says what a reader sees: stored times rewritten under an all-day record ("all day" before and after) are no
     change to it — a Save that changed nothing wrote "times: all day → all day" ([HIST-PHONE-HIDE] walk, 28 Sep 26) */
  it('times that read the same before and after are no line; a real change of times is one', () => {
    const r = add({ person: 'bane', date: 'Aug 1', yr: 2026, allday: true, type: 'LL', remarks: '' })
    elogClear()
    writeInputs(() => { r.s = 0; r.e = 1439 })
    expect(lines(), 'still all day').toHaveLength(0)
    writeInputs(() => { r.allday = false; r.s = 540; r.e = 660 })
    expect(lines().map(l => [l.from, l.to])).toEqual([['all day', '09:00–11:00']])
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

  it('a publish and a withdrawal are read from the command\'s own boundary: the day and the version', async () => {
    const env: any = { origin: 'user', scope: { module: 'sched' }, changes: [], actor: { role: 'admin' },
      boundary: { kind: 'publish', ids: ['2026-07-14#0'] } }
    changeLinesFor(env)
    changeLinesFor({ ...env, boundary: { kind: 'publish', ids: ['2026-07-14#2'] } })
    changeLinesFor({ ...env, boundary: { kind: 'unpublish', ids: ['2026-07-14#2'] } })
    await turnEnds()
    expect(ELOG.rows.map(r => r.lbl)).toEqual(['Published — the Original', 'Published — AL2', 'AL2 withdrawn'])
    expect(ELOG.rows.every(r => r.date === '2026-07-14' && r.sect === 'day')).toBe(true)
  })

  /* [CHG-BY-ITEM] (Fable F3 / Astra 05): "added to the roster" keeps whose it is, by id, so the changes window files it
     under "Quals · <him>" — never by its words */
  it('a man added to the roster: ONE line keeping whose it is (sub) and what it is (fld "roster")', async () => {
    changeLinesFor({ origin: 'user', scope: { module: 'people' }, actor: { role: 'admin' },
      changes: [{ op: 'put', collection: 'people', id: 'newbie', before: undefined, after: { cs: 'Newbie', q: 'C' } }] } as any)
    await turnEnds()
    expect(ELOG.rows.map(r => [r.lbl, r.sect, r.sub, r.fld])).toEqual([['Newbie · added to the roster', 'quals', 'newbie', 'roster']])
  })

  it('a projection (a reconciler) writes no line, however much it changed', () => {
    changeLinesFor({ origin: 'projection', scope: { module: 'inputs' }, changes: [{ op: 'put', collection: 'inputs', id: 'x', after: { person: 'bane', date: 'Aug 1', type: 'LL' } }] } as any)
    expect(ELOG.rows).toHaveLength(0)
  })
})

/* a line written with no command running is kept at the end of the turn (engine/editlog.ts hold — the group-wide walk's
   finding H2, 30 Sep 26: a line given just BEFORE its command opens rides that command); a test that writes one directly
   waits for the turn to end before it reads the history */
const turnEnds = () => Promise.resolve()

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

  /* the change-recording re-test (28 Sep 26, plan §11.9 widened by walker A2-F5): an Undo line appears only where its
     change wrote a line of its own — a Leave War ⚙ setting, a stage move or a Logic rule writes none, so its Undo wrote
     a lone "Undo —" dated today, in a week nobody opens */
  it('an undo of a change that wrote no line of its own writes none either (A2-F5)', async () => {
    logReversed({ label: 'a Leave War setting', forward: [{ op: 'put', collection: 'lw.config', id: 'all', before: {}, after: { sans: true } }] as any }, 'undo')
    logReversed({ label: 'closing bidding', forward: [{ op: 'put', collection: 'lw.war', id: 'w1', before: { stage: 'open' }, after: { stage: 'closed' } }] as any }, 'redo')
    logReversed({ label: 'a rule on the Logic page', forward: [{ op: 'put', collection: 'settings', id: 'rules', before: null, after: { v: {} } }] as any }, 'undo')
    await turnEnds()
    expect(ELOG.rows).toHaveLength(0)
    logReversed({ label: 'Hex’s quals', forward: [{ op: 'put', collection: 'people', id: 'rocky', before: { cs: 'Hex' }, after: { cs: 'Hex', q: 'B' } }] as any }, 'undo')
    await turnEnds()
    expect(ELOG.rows.map(r => r.lbl)).toEqual(['Undo — Hex’s quals'])
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
