// @vitest-environment jsdom
/* THE PLANNING CALENDAR'S ONE IDENTITY, THROUGH UNDO, IN BOTH DIRECTIONS (the reshape plan
   docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md §3.2 A-ii "The Inputs calendar" — "Through Undo, in both
   directions", Fable 3, Opus 4 of round 3; its tests §3.4 "The planning calendar's one identity"; §10: helper "undo & roles"
   at the per-record store's commit, through the store layer — the same through the Inputs calendar's page is helper "own
   pages"' last item).

   A note is ONE record, `plan/<unit>@pp:<id>`, whichever calendar holds it: the loaded squadron's (PLANPUCKS, the schedule
   store's) or a squadron not loaded (its stored half, state/plan-foreign.ts). The timeline mapped a record to its store by
   collection alone, so an Undo of a note of a squadron not loaded went to the schedule store, which refuses another
   squadron's planning record: the Undo failed. The timeline now picks the store per record. The world:
   test-support/msq-world.ts. */
import { describe, it, expect, afterEach, vi } from 'vitest'
import { useMsqWorld, signInAs, PID, ACCT } from '../test-support/msq-world'
import { switchUnit, forgetUnitPlans, writeInputs } from './store'
import { PLANPUCKS, addPlanPuck, editPlanPuck } from './plan'
import { storedPlan, storedCalendar, keptPlan, setPlanStoreDoor } from './plan-foreign'
import { SCHED_TYPES, schedStore, resyncBeforeEnlist, schedApplyEnd } from './sched-commit'
import { persistWb } from './persist'
import { setGrant } from './units'
import { setPage } from './view'
import { commit, CmdRefused } from '../command'
import { commitAs } from '../command/commit'
import { Whiteboard } from '../storage/whiteboard'
import { wireRows } from './persist'
import { beforeEach } from 'vitest'
import { UNIT, BOOT_UNIT } from '../engine/unitview'
import { globalUndo, globalRedo, _timelineEntries } from '../undo/timeline'

useMsqWorld()
/* the saved copy: the app's whiteboard with its row writer wired, as on a built site (state/persist.ts wireRows) */
beforeEach(() => { wireRows(new Whiteboard()) })
afterEach(() => { if (UNIT !== BOOT_UNIT) switchUnit(BOOT_UNIT); forgetUnitPlans(); PLANPUCKS.length = 0; setPlanStoreDoor(() => persistWb()); vi.restoreAllMocks() })

const lastEntry = () => { const es = _timelineEntries(); return es[es.length - 1]! }
/* a note on the calendar loaded, through the page's own door (InputsCal.tsx: writeInputs → addPlanPuck) */
function noteOn142(text: string): string {
  expect(UNIT).toBe('u142')
  expect(writeInputs(() => addPlanPuck('2026-07-20', text, []))).toBe(true)
  return PLANPUCKS.find((p: any) => p.text === text)!.id
}
/* an edit of a note of a squadron NOT loaded, through its stored half — what the Inputs calendar's page does for the
   page's own squadron while another schedule is picked (helper "own pages", item 4) */
function editStored(unit: string, id: string, text: string): any {
  const s = storedPlan(unit)
  return commit({
    type: SCHED_TYPES.inputsWrite, scope: { module: 'inputs' }, meta: null,
    apply: (txn: any) => { s.join(txn, [`pp:${id}`]); s.put(`pp:${id}`, { ...(s.get(`pp:${id}`) as any), text }) },
  })
}
/* the note as each copy holds it: the saved row, the page's kept copy of a squadron not loaded, the calendar loaded */
const savedRow = (unit: string, id: string): any => { const v = persistWb()!.get('plan', `${unit}@pp:${id}`); return v ? JSON.parse(v) : null }
const kept = (unit: string, id: string): any => keptPlan(unit)?.pucks.find((p: any) => String(p.id) === id) ?? null
const loaded = (id: string): any => PLANPUCKS.find((p: any) => String(p.id) === id) ?? null

describe('one direction — a 142 note edited while 149 is picked, then 142 loaded', () => {
  it('then a newer edit by someone else, then Undo: refused as a later change', () => {
    signInAs('saber')
    const id = noteOn142('Range day')
    switchUnit('u149')
    expect((editStored('u142', id, 'Range day — moved') as any).ok).not.toBe(false)
    const mine = lastEntry()
    expect(mine.forward.map(c => c.id)).toEqual([`u142@pp:${id}`])
    switchUnit('u142')
    expect(loaded(id).text).toBe('Range day — moved')
    /* Hunter's newer edit of the same note, on 142's calendar loaded (another person's change reaches this page from the
       command stream — modelled, as the timeline's own tests model it) */
    const r = commitAs({
      type: SCHED_TYPES.inputsWrite, scope: { module: 'inputs' }, meta: null,
      apply: (txn: any) => { resyncBeforeEnlist(); txn.enlist(schedStore); expect(editPlanPuck(id, 'Range day — Hunter')).toBe(true); schedApplyEnd() },
    } as any, { actor: { id: 'acad2', role: 'admin', personId: PID.hunter, session: null } as any, origin: 'remote' })
    expect((r as any).ok, JSON.stringify(r)).not.toBe(false)
    setPage('inputs')
    const u = globalUndo()
    expect(u.ok, 'his step on the stored calendar and the newer edit on the loaded one are one record').toBe(false)
    expect(u.reason).toMatch(/changed this after your action — it can’t be undone now\./)
    expect(loaded(id).text, 'the newer edit stands').toBe('Range day — Hunter')
  })

  it('edit, load, Undo, Redo, reload: the stored copy, the loaded calendar and the screen agree', () => {
    signInAs('saber')
    const id = noteOn142('Range day')
    switchUnit('u149')
    expect((editStored('u142', id, 'Range day — moved') as any).ok).not.toBe(false)
    switchUnit('u142')
    setPage('inputs')
    const u = globalUndo()
    expect(u.ok, JSON.stringify(u.reason)).toBe(true)
    expect([loaded(id).text, savedRow('u142', id).text]).toEqual(['Range day', 'Range day'])
    const r = globalRedo()
    expect(r.ok, JSON.stringify(r.reason)).toBe(true)
    expect([loaded(id).text, savedRow('u142', id).text]).toEqual(['Range day — moved', 'Range day — moved'])
    /* reload: the calendar read again from its saved rows */
    switchUnit('u149'); forgetUnitPlans(); switchUnit('u142')
    expect(loaded(id).text, 'read back from the saved rows').toBe('Range day — moved')
  })
})

describe('the other direction — a 142 plain admin with View of 149 picks 149 and edits a note of his own calendar, not loaded', () => {
  /* Hunter, 142's plain admin, holds View of 149 (given by Saber); his note on 142's calendar, then 149 picked */
  function hunterOn149(): string {
    signInAs('saber')
    expect(setGrant(ACCT.hunter, 'u149', 'view', PID.hunter)).toMatchObject({ ok: true })
    signInAs('hunter')
    const id = noteOn142('Range day')
    switchUnit('u149')
    setPage('inputs')
    return id
  }

  it('a change, its before-image the stored note; Undo puts the note back as it was, stored and cached; Redo', () => {
    const id = hunterOn149()
    expect((editStored('u142', id, 'Range day — moved') as any).ok).not.toBe(false)
    const c = lastEntry().forward.find(x => x.collection === 'plan')!
    expect(c).toMatchObject({ op: 'put', id: `u142@pp:${id}` })
    expect((c.before as any)?.text, 'its before-image is the note as stored — never "created"').toBe('Range day')
    expect([kept('u142', id).text, savedRow('u142', id).text]).toEqual(['Range day — moved', 'Range day — moved'])
    const u = globalUndo()
    expect(u.ok, JSON.stringify(u.reason)).toBe(true)
    expect([kept('u142', id)?.text, savedRow('u142', id)?.text], 'the note as it was, stored and cached — never deleted').toEqual(['Range day', 'Range day'])
    expect(loaded(id), "149's calendar never holds it").toBeNull()
    const r = globalRedo()
    expect(r.ok, JSON.stringify(r.reason)).toBe(true)
    expect([kept('u142', id).text, savedRow('u142', id).text]).toEqual(['Range day — moved', 'Range day — moved'])
    switchUnit('u142')
    expect(loaded(id).text, 'back on 142, the calendar shows it').toBe('Range day — moved')
  })

  it('a restore refused part-way leaves the stored and cached copies untouched', () => {
    const id = hunterOn149()
    expect((editStored('u142', id, 'Range day — moved') as any).ok).not.toBe(false)
    const before = JSON.stringify(storedCalendar('u142'))
    const row = JSON.stringify(savedRow('u142', id))
    /* the stored half writes the note, then the restore is refused inside the same command */
    const s = storedPlan('u142'), write = s.write.bind(s)
    vi.spyOn(s, 'write').mockImplementation((es: any, o?: any) => { write(es, o); throw new CmdRefused('refused after the write') })
    const u = globalUndo()
    expect(u.ok).toBe(false)
    expect(JSON.stringify(storedCalendar('u142')), 'the cached copy untouched').toBe(before)
    expect(JSON.stringify(savedRow('u142', id)), 'the saved row untouched').toBe(row)
    expect(kept('u142', id).text).toBe('Range day — moved')
  })
})
