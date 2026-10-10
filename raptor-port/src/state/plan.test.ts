import { describe, it, expect, beforeEach } from 'vitest'
import { setSession } from './auth'
import { PEOPLE } from '../engine/people'
import { PLANPUCKS, DAYRMK, setDayRemark, addPlanPuck, editPlanPuck, movePlanPuck, removePlanPuck, clearPlan, planMoveBlock, addPuckPeople, togglePuckPerson, movePuckPerson, movePlanSection } from './plan'
import { INPVIEW, CALMONTH, setInpView, setCalMonth } from './view'
import { undo, redo, histInit, HIST, histApply, resetSession, writeInputs } from './store'
import { histSnap } from './history'

/* The Inputs-calendar's planning layer (state/plan.ts). These tests pin the
   admin gate at the write path, an undo/redo round trip, and what a logout
   does: the calendar VIEW resets, the pucks and remarks stay — they are saved
   squadron data since the storage seam (8 Sep 26), and clearing the memory
   copy on logout destroyed the saved one on the next edit. */
beforeEach(() => {
  setSession({ user: 'a', role: 'admin' })
  clearPlan()
  setInpView('table')
  setCalMonth(null)
})

describe('the write-path gate (canEditSched)', () => {
  it('a member session is refused by every mutator, and nothing changes', () => {
    addPlanPuck('2026-08-24', 'seed') // as admin, so there is something a member could wrongly touch
    setSession({ user: 'user', role: 'main' })
    const id = PLANPUCKS[0].id

    expect(setDayRemark('2026-08-24', 'x')).toBe(false)
    expect(addPlanPuck('2026-08-25', 'x')).toBe(false)
    expect(editPlanPuck(id, 'x')).toBe(false)
    expect(movePlanPuck(id, '2026-08-26')).toBe(false)
    expect(removePlanPuck(id)).toBe(false)

    expect(PLANPUCKS.length).toBe(1)
    expect(PLANPUCKS[0].text).toBe('seed')          // untouched
    expect(Object.keys(DAYRMK).length).toBe(0)
  })

  it('an admin session may use every mutator', () => {
    expect(addPlanPuck('2026-08-24', '  brief the new guy  ')).toBe(true)
    const id = PLANPUCKS[0].id
    expect(PLANPUCKS[0].text).toBe('brief the new guy')   // trimmed
    expect(editPlanPuck(id, 'brief the new guy at 0800')).toBe(true)
    expect(movePlanPuck(id, '2026-08-25')).toBe(true)
    expect(PLANPUCKS[0].date).toBe('2026-08-25')
    expect(setDayRemark('2026-08-25', 'short week')).toBe(true)
    expect(removePlanPuck(id)).toBe(true)
    expect(PLANPUCKS.length).toBe(0)
  })
})

describe('setDayRemark / addPlanPuck refuse blank text', () => {
  it('setDayRemark deletes the key rather than storing an empty string', () => {
    expect(setDayRemark('2026-08-24', '  hello  ')).toBe(true)
    expect(DAYRMK['2026-08-24']).toBe('hello')
    expect(setDayRemark('2026-08-24', '   ')).toBe(true)   // blanking it out is a real change
    expect(Object.prototype.hasOwnProperty.call(DAYRMK, '2026-08-24')).toBe(false)
    /* blanking a day that never had a remark is a no-op, not a change */
    expect(setDayRemark('2026-08-26', '   ')).toBe(false)
  })

  it('addPlanPuck refuses an empty/whitespace-only puck', () => {
    expect(addPlanPuck('2026-08-24', '   ')).toBe(false)
    expect(PLANPUCKS.length).toBe(0)
  })

  it('editPlanPuck refuses to empty out a note that has no people — delete is removePlanPuck\'s job', () => {
    addPlanPuck('2026-08-24', 'brief')
    const id = PLANPUCKS[0].id
    expect(editPlanPuck(id, '   ')).toBe(false)
    expect(PLANPUCKS[0].text).toBe('brief')
  })
})

describe('undo / redo (state/history.ts riding the ordinary snapshot)', () => {
  it('undo walks back a puck add and a day remark, one step per writeInputs call', () => {
    histInit()   // baseline: PLANPUCKS/DAYRMK both empty (cleared in beforeEach)
    writeInputs(() => addPlanPuck('2026-08-24', 'brief the new guy'))
    writeInputs(() => setDayRemark('2026-08-24', 'short week'))

    expect(PLANPUCKS.length).toBe(1)
    expect(DAYRMK['2026-08-24']).toBe('short week')

    undo()   // back over the remark
    expect(DAYRMK['2026-08-24']).toBeUndefined()
    expect(PLANPUCKS.length).toBe(1)   // the puck add is its own, earlier step

    undo()   // back over the add
    expect(PLANPUCKS.length).toBe(0)

    redo()   // forward over the add
    expect(PLANPUCKS.length).toBe(1)
    expect(DAYRMK['2026-08-24']).toBeUndefined()

    redo()   // forward over the remark
    expect(DAYRMK['2026-08-24']).toBe('short week')
  })
})

describe('resetSession resets the calendar view and keeps the plan', () => {
  it('an admin plans a month, logs out — the next session opens on the table view with the plan still there', () => {
    addPlanPuck('2026-08-24', 'brief the new guy')
    setDayRemark('2026-08-24', 'short week')
    setInpView('cal')
    setCalMonth({ y: 2026, m: 8 })

    resetSession(null)                              // logout
    resetSession({ user: 'user', role: 'main' })     // next login, same tab

    expect(PLANPUCKS.length).toBe(1)
    expect(DAYRMK['2026-08-24']).toBe('short week')
    expect(INPVIEW).toBe('cal') // D580: fresh session opens calendar first.
    expect(CALMONTH).toBe(null)
  })
})

/* A NOTE CARRIES ITS OWN PUCKS (owner D684, 9 Oct 26 — "For the +note, perhaps just have a function to add pucks on the
   text written, instead of a +pucks button"; D695 — a note may hold people and no words). ONE kind of section: words,
   people, or both — and one with neither is not kept. What the old pucks row did (his asks of 22–24 Aug 26: a gap
   where a man is taken off, a swap, a batch from the picker) a note's people do. */
describe('a note carries its own pucks (D684, D695)', () => {
  const last = () => PLANPUCKS[0]
  it('a note is made with words, with people, or with both — never with neither', () => {
    expect(addPlanPuck('2026-08-24', 'brief the new guys', ['bane', 'yeti', 'bane'])).toBe(true)
    expect(last().text).toBe('brief the new guys')
    expect(last().ids, 'the picker’s batch, each man once').toEqual(['bane', 'yeti'])
    expect(last().kind, 'one kind of section: no kind is written').toBeUndefined()
    expect(addPlanPuck('2026-08-24', '', ['vinci'])).toBe(true)          // people and no words (D695)
    expect(last().text).toBe(''); expect(last().ids).toEqual(['vinci'])
    expect(addPlanPuck('2026-08-24', '  ', [])).toBe(false)              // neither: not kept
    expect(addPlanPuck('2026-08-24', '', ['', ''])).toBe(false)
    expect(PLANPUCKS.length).toBe(2)
  })
  it('people are added to a note that was written, and removal leaves a GAP', () => {
    addPlanPuck('2026-08-24', 'a note')
    const sec = last()
    expect(togglePuckPerson(sec.id, 'bane')).toBe(true)
    expect(togglePuckPerson(sec.id, 'yeti')).toBe(true)
    expect(sec.ids).toEqual(['bane', 'yeti'])
    /* removing a NON-last person blanks its slot so the survivors keep their grid positions (owner, 24 Aug 26) */
    expect(togglePuckPerson(sec.id, 'bane')).toBe(true)
    expect(sec.ids).toEqual(['', 'yeti'])
    /* the last man off a note WITH words: the note stays, its words alone */
    expect(togglePuckPerson(sec.id, 'yeti')).toBe(true)
    expect(sec.ids).toEqual([])
    expect(PLANPUCKS.includes(sec)).toBe(true)
    expect(togglePuckPerson(sec.id, '')).toBe(false)
  })
  it('the last man off a note with NO words takes the note with him — one with neither is not kept', () => {
    addPlanPuck('2026-08-24', '', ['bane', 'yeti'])
    const sec = last()
    expect(togglePuckPerson(sec.id, 'bane')).toBe(true)
    expect(PLANPUCKS.includes(sec)).toBe(true)
    expect(togglePuckPerson(sec.id, 'yeti')).toBe(true)
    expect(PLANPUCKS.includes(sec)).toBe(false)
  })
  it('the words of a note with people may be taken away, and put back later (D695: "the pencil adds words later")', () => {
    addPlanPuck('2026-08-24', 'words', ['bane'])
    const sec = last()
    expect(editPlanPuck(sec.id, '   ')).toBe(true)
    expect(sec.text).toBe(''); expect(sec.ids).toEqual(['bane'])
    expect(editPlanPuck(sec.id, 'words again')).toBe(true)
    expect(sec.text).toBe('words again')
  })
  it('togglePuckPerson keeps an internal gap but trims a trailing one', () => {
    addPlanPuck('2026-08-24', 'n', ['bane', 'yeti', 'vinci'])
    const sec = last()
    expect(togglePuckPerson(sec.id, 'yeti')).toBe(true)     // middle → gap kept
    expect(sec.ids).toEqual(['bane', '', 'vinci'])
    expect(togglePuckPerson(sec.id, 'vinci')).toBe(true)    // now-last → trailing blanks trimmed
    expect(sec.ids).toEqual(['bane'])
  })
  /* dragging one puck onto another SWAPS them; dragging onto an empty slot MOVES it there (owner, 24 Aug 26) */
  it('movePuckPerson swaps two slots, and moving onto a blank rides the gap back', () => {
    addPlanPuck('2026-08-24', '', ['bane', 'yeti', 'vinci'])
    const sec = last()
    expect(movePuckPerson(sec.id, 0, 2)).toBe(true)         // swap the ends
    expect(sec.ids).toEqual(['vinci', 'yeti', 'bane'])
    togglePuckPerson(sec.id, 'yeti')                        // blank the middle
    expect(sec.ids).toEqual(['vinci', '', 'bane'])
    expect(movePuckPerson(sec.id, 0, 1)).toBe(true)         // move onto the gap
    expect(sec.ids).toEqual(['', 'vinci', 'bane'])          // the blank rode back to slot 0
    expect(movePuckPerson(sec.id, 1, 1)).toBe(false)        // same slot → no-op
    expect(movePuckPerson(sec.id, 1, 9)).toBe(false)        // out of range → no-op
    expect(sec.ids).toEqual(['', 'vinci', 'bane'])
  })
  it('movePuckPerson trims a trailing blank when the last puck moves earlier', () => {
    addPlanPuck('2026-08-24', 'n', ['bane', 'yeti', 'vinci'])
    const sec = last()
    togglePuckPerson(sec.id, 'yeti')                        // ['bane','','vinci']
    expect(movePuckPerson(sec.id, 2, 1)).toBe(true)         // last onto the middle gap
    expect(sec.ids).toEqual(['bane', 'vinci'])              // slot 2 empties, trailing → trimmed
  })
  it('addPuckPeople adds only the not-yet-seated, to any note, and reports whether anything landed', () => {
    addPlanPuck('2026-08-24', 'a note that had no people')
    const sec = last()
    expect(addPuckPeople(sec.id, ['yeti', 'bane', 'yeti'])).toBe(true)
    expect(sec.ids).toEqual(['yeti', 'bane'])
    expect(addPuckPeople(sec.id, ['yeti', 'bane'])).toBe(false)          // all present → no-op
    expect(addPuckPeople('no-such-row', ['bane'])).toBe(false)
  })
  it('a record saved as the old pucks row (kind "pucks") is a note with people and no words — it still loads and works (D56)', () => {
    PLANPUCKS.push({ id: 'ppOld', date: '2026-08-24', kind: 'pucks', ids: ['bane', 'yeti'] })
    expect(addPuckPeople('ppOld', ['vinci'])).toBe(true)
    expect(editPlanPuck('ppOld', 'now with words')).toBe(true)
    const sec = PLANPUCKS.find((p: any) => p.id === 'ppOld')
    expect(sec.ids).toEqual(['bane', 'yeti', 'vinci']); expect(sec.text).toBe('now with words')
  })
  /* Astra's read, 9 Oct 26 (D299): no writer puts a deleted man on a day on or after his delete */
  it('a deleted man is not put on a note on or after his delete — by a move, by a new note, or by an add', () => {
    const was = { ...PEOPLE.bane }
    try {
      addPlanPuck('2026-08-20', 'before', ['bane', 'yeti'])
      const before = last()
      Object.assign(PEOPLE.bane, { deleted: true, deletedFrom: '2026-08-24', archived: true })
      expect(planMoveBlock(before.id, '2026-08-24')).toBe('bane')
      expect(movePlanPuck(before.id, '2026-08-25')).toBe(false)
      expect(before.date).toBe('2026-08-20')
      expect(planMoveBlock(before.id, '2026-08-23')).toBe(null)
      expect(addPlanPuck('2026-08-26', 'after', ['bane', 'yeti'])).toBe(true)
      expect(last().ids, 'he is left out of a new note after his delete').toEqual(['yeti'])
      expect(addPuckPeople(last().id, ['bane', 'vinci'])).toBe(true)
      expect(last().ids).toEqual(['yeti', 'vinci'])
      expect(togglePuckPerson(last().id, 'bane'), 'nor added one at a time').toBe(false)
      expect(addPlanPuck('2026-08-26', '', ['bane']), 'a note of him alone is no note').toBe(false)
    } finally { for (const k of Object.keys(PEOPLE.bane)) delete (PEOPLE.bane as any)[k]; Object.assign(PEOPLE.bane, was) }
  })
  it('a member is refused by every mutator of a note’s people', () => {
    addPlanPuck('2026-08-24', 'n', ['bane', 'yeti'])
    const sec = last()
    setSession({ user: 'user', role: 'main' })
    expect(addPlanPuck('2026-08-25', '', ['bane'])).toBe(false)
    expect(addPuckPeople(sec.id, ['vinci'])).toBe(false)
    expect(togglePuckPerson(sec.id, 'bane')).toBe(false)
    expect(movePuckPerson(sec.id, 0, 1)).toBe(false)
    expect(movePlanSection(sec.id, null)).toBe(false)
    expect(sec.ids).toEqual(['bane', 'yeti'])
  })

  it('movePlanSection reorders within one day and refuses a cross-day target', () => {
    /* three sections on one day (note, note, pucks), one on another */
    addPlanPuck('2026-08-24', 'first')   // unshifts
    addPlanPuck('2026-08-24', 'second')  // unshifts above it
    PLANPUCKS.push({ id: 'ppRow', date: '2026-08-24', text: '', ids: ['bane'], kind: 'pucks' })   // a people-only section, at the end
    addPlanPuck('2026-08-25', 'other day')
    const day = () => PLANPUCKS.filter((p: any) => p.date === '2026-08-24').map((p: any) => p.text || p.kind)
    expect(day()).toEqual(['second', 'first', 'pucks'])

    const pucksSec = PLANPUCKS.find((p: any) => p.kind === 'pucks')
    const firstSec = PLANPUCKS.find((p: any) => p.text === 'first')
    const otherSec = PLANPUCKS.find((p: any) => p.text === 'other day')

    /* pucks row to the TOP (before 'second') */
    const secondSec = PLANPUCKS.find((p: any) => p.text === 'second')
    expect(movePlanSection(pucksSec.id, secondSec.id)).toBe(true)
    expect(day()).toEqual(['pucks', 'second', 'first'])

    /* 'second' to the END (beforeId null) */
    expect(movePlanSection(secondSec.id, null)).toBe(true)
    expect(day()).toEqual(['pucks', 'first', 'second'])

    /* a cross-day target is refused, and nothing moves */
    expect(movePlanSection(firstSec.id, otherSec.id)).toBe(false)
    expect(day()).toEqual(['pucks', 'first', 'second'])

    /* before itself / already-in-place are no-ops */
    expect(movePlanSection(firstSec.id, firstSec.id)).toBe(false)
    expect(movePlanSection(pucksSec.id, firstSec.id)).toBe(false) // already directly before it
    expect(day()).toEqual(['pucks', 'first', 'second'])

    /* the other day's own run was never disturbed */
    expect(PLANPUCKS.filter((p: any) => p.date === '2026-08-25').length).toBe(1)
  })

  it('a note’s people ride the undo snapshot like every other planning write', () => {
    histInit()
    writeInputs(() => addPlanPuck('2026-08-24', 'n'))
    const id = PLANPUCKS[0].id
    writeInputs(() => togglePuckPerson(id, 'bane'))
    const sec = () => PLANPUCKS.find((p: any) => p.id === id)
    expect(sec()!.ids).toEqual(['bane'])
    undo()
    expect(sec()!.ids || []).toEqual([])
    undo()
    expect(sec()).toBeUndefined()
    redo(); redo()
    expect(sec()!.ids).toEqual(['bane'])
  })
})

describe('an older snapshot without pp/dm (pre-dates this feature)', () => {
  it('restores both stores to empty rather than throwing', () => {
    histInit()                                  // fresh baseline, pp/dm both empty
    addPlanPuck('2026-08-24', 'brief')          // populate directly, not through history
    expect(PLANPUCKS.length).toBe(1)

    const raw = JSON.parse(histSnap())
    delete raw.pp
    delete raw.dm
    HIST.stack.push(JSON.stringify(raw))
    const i = HIST.stack.length - 1

    expect(() => histApply(i)).not.toThrow()
    expect(PLANPUCKS.length).toBe(0)
    expect(Object.keys(DAYRMK).length).toBe(0)
  })
})
