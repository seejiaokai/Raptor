// @vitest-environment jsdom
/* WHERE UNDO AND REDO LEAVE THE LEAVE WAR'S GRID (owner, D670, 8 Oct 26): "if the change was already in view for the
   undo and redo, the screen should just remain there and show the undo/redo item, instead of snapping the change to the
   left of the screen. I understand if u scroll away from the screen and press undo/redo and it snaps back to 9feb it's
   ok."

   The grid is asked for a day through the store (`focusDay` → `focusDate` / `focusSeq`, read by `Matrix`). There are
   now TWO asks: the plain one — "put this day at the left", what a month button, the under-manned list, a new or a
   switched period want — and "only if it is out of view" (`focusDay(date, { ifHidden: true })` → `focusSoft`), which is
   what Undo and Redo send. What is pinned here is which ask each caller makes; whether a column IS in view is
   ui/inview.test.ts, and that the real grid stays put is the browser gate. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { HOOKS, storeBackend } from '../engine/hooks'
import { initStore as raptorInitStore } from '../state/store'
import { setSession } from '../state/auth'
import { globalRedo, globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { setFlyDays } from '../state/flyplan'
import { setPage } from '../state/view'
import { projectPeople } from './state/raptorRoster'
import { createWar, focusDay, getState, holidayAdd, initStore as lwInitStore, lwHistInit, selectWar, setPeople, setRole } from './state/store'
import { memoryBackend } from './state/storage'
import { wireLeaveWarSync } from './sync'

const toast = HOOKS.toast
const mem = new Map<string, string>()
beforeEach(() => {
  /* the scheduler's settings rows (a day's class) need somewhere to be written */
  mem.clear()
  storeBackend.impl = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => { if (v === 'null') mem.delete(k); else mem.set(k, v) }, keys: () => [...mem.keys()] } as any
  setSession({ user: 'ad', role: 'admin' })
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  HOOKS.toast = () => {}
  setRole('admin')
})
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); setSession(null); storeBackend.impl = null })

const ask = () => { const s = getState(); return { date: s.focusDate, soft: s.focusSoft, seq: s.focusSeq } }

describe('the two asks', () => {
  it('the plain ask is a jump: the day goes to the left wherever it was', () => {
    const n = ask().seq
    focusDay('2026-02-09')
    expect(ask()).toEqual({ date: '2026-02-09', soft: false, seq: n + 1 })
  })
  it('"only if hidden" is the other: the same day, marked soft — and asked twice it is two asks', () => {
    const n = ask().seq
    focusDay('2026-02-09', { ifHidden: true })
    expect(ask()).toEqual({ date: '2026-02-09', soft: true, seq: n + 1 })
    focusDay('2026-02-09', { ifHidden: true })
    expect(ask().seq).toBe(n + 2)
  })
  it('a plain ask after a soft one is plain again — the mark never sticks', () => {
    focusDay('2026-02-09', { ifHidden: true })
    focusDay('2026-03-02')
    expect(ask().soft).toBe(false)
  })
  it('switching the period on screen is a jump, never a soft ask', () => {
    createWar('Next', '2031-01-01', '2031-12-31')
    focusDay('2026-02-09', { ifHidden: true })
    selectWar(getState().wars.find(w => w.period.name === 'Next')!.period.id)
    expect(ask().soft).toBe(false)
    expect(ask().date).toBe('2031-01-01')
  })
})

describe('Undo and Redo ask softly', () => {
  it('a holiday undone, then redone: each lands on its day with the soft ask', () => {
    holidayAdd({ kind: 'ph', name: 'National Day', from: '2026-08-10', to: '2026-08-10' })
    focusDay('2026-01-05')                                   // he is looking somewhere else, by a plain jump
    expect(globalUndo().ok).toBe(true)
    expect(ask()).toMatchObject({ date: '2026-08-10', soft: true })
    focusDay('2026-01-05')
    expect(globalRedo().ok).toBe(true)
    expect(ask()).toMatchObject({ date: '2026-08-10', soft: true })
  })
  it('a Required figure typed on the Leave War, undone: the same', () => {
    setPage('leavewar')
    setFlyDays([{ iso: '2026-02-09', p: 12 }])
    focusDay('2026-01-05')
    expect(globalUndo().ok).toBe(true)
    expect(ask()).toMatchObject({ date: '2026-02-09', soft: true })
  })
})
