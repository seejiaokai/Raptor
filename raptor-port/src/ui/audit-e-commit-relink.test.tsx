// @vitest-environment jsdom
/* AUDIT E — commitInputEdit / removeInput machinery, driven at the engine
   level (no React mount needed: the commit runs through writeInputsBatch and
   the accept machinery in engine/slots.ts, and initStore wires every hook it
   touches). Targets the HANDOFF-listed gaps: the keep / "moved outside the
   programmed week" branch, reassigning an ACCEPTED input to another person,
   moving it to another date, shortening and extending a span, an endDate past
   the last DATES entry, and delete-then-undo coherence for accepted inputs. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { initStore, undo, writeInputs } from '../state/store'
import { INPUTS, DATES, inpId } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { acceptInput, acceptedDay, inpKey } from '../engine/slots'
import { commitInputEdit, removeInput, setInpField, draftOf } from './inputedit'
import { HOOKS } from '../engine/hooks'
import { afterSchedMutate } from '../state/view'
import { PEOPLE } from '../engine/people'

let TOASTS: string[] = []
const groundRows = () => DAYS.flatMap((d: any, di: number) => (d.ground || []).map((r: any) => ({ di, row: r })))
const rowsFor = (inp: any) => groundRows().filter(g => g.row.src === inpKey(inp))

beforeAll(() => {
  initStore()
  HOOKS.toast = (m: any) => { TOASTS.push(String(m)) }
})
beforeEach(() => { TOASTS = [] })

/* plant through the real write so history has a baseline to undo to */
const plant = (r: any) => { writeInputs(() => { inpId(r); INPUTS.unshift(r) }); return r }
const scrap = (r: any) => { const i = INPUTS.indexOf(r); if (i >= 0) removeInput(r) }

describe('commitInputEdit — the keep branch and the moved-outside-week branch', () => {
  it('an edit that still covers the accepted day KEEPS the row on that day', () => {
    const inp: any = plant({ person: 'bane', date: 'Jul 15', endDate: 'Jul 17', allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'keep me', mod: '' })
    expect(acceptInput(4, inp, 'g'), 'accepted on the LAST day of the span').toBe(true)
    afterSchedMutate()
    expect(acceptedDay(inp)).toBe(4)
    const d = draftOf(inp); d.remarks = 'keep me — edited'
    expect(commitInputEdit(inp, d)).toBe(true)
    expect(inp.remarks).toBe('keep me — edited')
    expect(acceptedDay(inp), 'the row stayed on the day it was accepted on').toBe(4)
    expect(rowsFor(inp).length, 'exactly one row').toBe(1)
    expect(TOASTS.join('|')).not.toMatch(/Moved outside/i)
    scrap(inp)
  })

  it('moving the whole input outside the programmed week drops the row and SAYS so', () => {
    const inp: any = plant({ person: 'bane', date: 'Jul 14', allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'leaving', mod: '' })
    expect(acceptInput(1, inp, 'g')).toBe(true)
    afterSchedMutate()
    const key = inpKey(inp)
    const d = draftOf(inp); d.start = '2026-07-25'; d.end = ''
    expect(commitInputEdit(inp, d)).toBe(true)
    expect(inp.date).toBe('Jul 25')
    expect(inp.acc, 'no longer accepted').toBeUndefined()
    expect(groundRows().some(g => g.row.src === key), 'no orphan row on any day').toBe(false)
    expect(rowsFor(inp).length).toBe(0)
    expect(TOASTS.join('|')).toMatch(/Moved outside the programmed week/i)
    writeInputs(() => INPUTS.splice(INPUTS.indexOf(inp), 1))
  })

  it('moving an accepted input to another DATE inside the week moves its row there', () => {
    const inp: any = plant({ person: 'bane', date: 'Jul 13', allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'moving day', mod: '' })
    expect(acceptInput(0, inp, 'g')).toBe(true)
    afterSchedMutate()
    const d = draftOf(inp); d.start = '2026-07-16'
    expect(commitInputEdit(inp, d)).toBe(true)
    expect(acceptedDay(inp), 'the row followed the date').toBe(3)
    expect(rowsFor(inp).length).toBe(1)
    expect((DAYS[0].ground || []).some((r: any) => r.src === inpKey(inp)), 'nothing left on Monday').toBe(false)
    scrap(inp)
  })

  it('shortening a span so the accepted day falls off moves the row to the new start', () => {
    const inp: any = plant({ person: 'bane', date: 'Jul 14', endDate: 'Jul 17', allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'shrinking', mod: '' })
    expect(acceptInput(4, inp, 'g'), 'accepted on Jul 17').toBe(true)
    afterSchedMutate()
    const d = draftOf(inp); d.end = '2026-07-15'
    expect(commitInputEdit(inp, d)).toBe(true)
    expect(inp.endDate).toBe('Jul 15')
    const rows = rowsFor(inp)
    expect(rows.length, 'exactly one row — no orphan on Jul 17').toBe(1)
    expect(rows[0].di, 'moved to the start date').toBe(1)
    scrap(inp)
  })

  it('extending endDate past the last loaded DATES entry neither throws nor moves the row', () => {
    const inp: any = plant({ person: 'bane', date: 'Jul 18', allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'long tail', mod: '' })
    expect(acceptInput(5, inp, 'g')).toBe(true)
    afterSchedMutate()
    const d = draftOf(inp); d.end = '2026-07-30'      // 11 days past the last DATES entry
    expect(commitInputEdit(inp, d)).toBe(true)
    expect(inp.endDate).toBe('Jul 30')
    expect(acceptedDay(inp)).toBe(5)
    expect(rowsFor(inp).length).toBe(1)
    scrap(inp)
  })
})

describe('commitInputEdit — reassigning an ACCEPTED input to another person', () => {
  it('relinks the ground row to the new person, leaving nothing of the old', () => {
    const inp: any = plant({ person: 'bane', date: 'Jul 13', allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'handover', mod: '' })
    expect(acceptInput(0, inp, 'g')).toBe(true)
    afterSchedMutate()
    const oldKey = inpKey(inp)
    const d = draftOf(inp); d.person = 'stiff'
    expect(commitInputEdit(inp, d)).toBe(true)
    expect(inp.person).toBe('stiff')
    /* the old person's filed copy is gone — its content key matches nothing */
    expect(groundRows().some(g => g.row.src === oldKey), 'no row keyed to the old person').toBe(false)
    const rows = rowsFor(inp)
    expect(rows.length, 'one row under the new key').toBe(1)
    expect(rows[0].row.who, 'who is the new person\'s CALLSIGN').toBe(PEOPLE.stiff.cs)
    scrap(inp)
  })
})

describe('an Other filed under Unavailable, edited in place', () => {
  it('a remark typed in place does not silently unfile an input whose start date precedes the week', () => {
    /* the input STARTS before the loaded Monday but still covers loaded days —
       exactly the shape inWindow/inputCoversDate exist to keep visible */
    const inp: any = plant({ person: 'bane', date: 'Jul 12', endDate: 'Jul 15', allday: true, s: 0, e: 1439, type: 'Other', remarks: 'errand', mod: '' })
    expect(acceptInput(0, inp, 'u'), 'filed under Unavailable').toBe(true)
    afterSchedMutate()
    expect(inp.acc).toBe('u')
    TOASTS = []
    expect(setInpField(inp, 'rmks', 'errand — updated')).toBe(true)
    expect(inp.remarks).toBe('errand — updated')
    /* nothing moved: the dates are untouched and the input still covers
       Jul 13–15. The filing must survive, and no "moved outside the
       programmed week" refusal belongs on a remark edit. */
    expect(TOASTS.join('|')).not.toMatch(/Moved outside the programmed week/i)
    expect(inp.acc, 'the Unavailable filing survives a remark edit').toBe('u')
    writeInputs(() => INPUTS.splice(INPUTS.indexOf(inp), 1))
  })

  it('the same edit on an in-week start date keeps the filing (control case)', () => {
    const inp: any = plant({ person: 'bane', date: 'Jul 13', endDate: 'Jul 15', allday: true, s: 0, e: 1439, type: 'Other', remarks: 'errand2', mod: '' })
    expect(acceptInput(0, inp, 'u')).toBe(true)
    afterSchedMutate()
    expect(setInpField(inp, 'rmks', 'errand2 — updated')).toBe(true)
    expect(inp.acc).toBe('u')
    writeInputs(() => INPUTS.splice(INPUTS.indexOf(inp), 1))
  })
})

describe('removeInput — filed copies and undo coherence', () => {
  it('deleting an accepted input removes the row, and ONE undo brings both back', () => {
    const inp: any = plant({ person: 'stiff', date: 'Jul 13', allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'undo me', mod: '' })
    expect(acceptInput(0, inp, 'g')).toBe(true)
    afterSchedMutate()
    const key = inpKey(inp)
    expect(removeInput(inp)).toBe(true)
    expect(INPUTS.indexOf(inp)).toBe(-1)
    expect(groundRows().some(g => g.row.src === key), 'row gone with it').toBe(false)
    undo()
    /* histApply rebuilds the arrays from JSON, so find by content */
    const back: any = INPUTS.find((r: any) => r.remarks === 'undo me')
    expect(back, 'the input is back').toBeTruthy()
    expect(back.acc, 'still accepted').toBe('g')
    expect(groundRows().some(g => g.row.src === key), 'and so is its ground row').toBe(true)
    /* clean up through the real path */
    removeInput(back)
  })

  it('deleting a multi-day Unavailable filing marks an inert key on every loaded day it spans', () => {
    const inp: any = plant({ person: 'stiff', date: 'Jul 14', endDate: 'Jul 16', allday: true, s: 0, e: 1439, type: 'Other', remarks: 'span file', mod: '' })
    expect(acceptInput(1, inp, 'u')).toBe(true)
    afterSchedMutate()
    const token = inp.iid
    const keys = () => Object.keys(SCHED.pending).filter(k => k.startsWith('inp:') && k.endsWith('.' + token))
    expect(keys().sort(), 'filing marked Jul 14, 15 and 16').toEqual([`inp:1.${token}`, `inp:2.${token}`, `inp:3.${token}`])
    expect(removeInput(inp)).toBe(true)
    /* the unfiling re-marks the same inert keys — they stay pending for the
       next AL rather than vanishing from the amendment machinery */
    expect(keys().sort()).toEqual([`inp:1.${token}`, `inp:2.${token}`, `inp:3.${token}`])
    expect(INPUTS.indexOf(inp)).toBe(-1)
  })
})

/* What the relink DISCARDS — a probe documenting current behaviour, reported
   as a SUSPECT in the audit: the re-accept mints a FRESH row, so anything a
   scheduler did to the promoted row itself (extra crew dropped in via more[],
   a red flag, a CX, hand-edited times) is silently thrown away by ANY edit of
   the source input, including a member retouching their own remark. */
describe('the relink regenerates the row (probe)', () => {
  it('scheduler additions on the promoted row do not survive an input edit', () => {
    const inp: any = plant({ person: 'stiff', date: 'Jul 13', allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'probe', mod: '' })
    expect(acceptInput(0, inp, 'g')).toBe(true)
    afterSchedMutate()
    const row = rowsFor(inp)[0].row
    row.more = ['bane']; row.flag = 1
    const d = draftOf(inp); d.remarks = 'probe — retouched'
    expect(commitInputEdit(inp, d)).toBe(true)
    const fresh = rowsFor(inp)[0].row
    /* current behaviour: the row is rebuilt from the input alone */
    expect(fresh.more, 'extra crew dropped by the relink (current behaviour)').toBeUndefined()
    expect(fresh.flag, 'the red flag dropped by the relink (current behaviour)').toBeUndefined()
    scrap(inp)
  })
})
