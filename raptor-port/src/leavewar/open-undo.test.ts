/* D352 (28 Sep 26), narrowed by D1177 (21 Oct 26 — the stages went): the one Undo takes back OPENING OR CLOSING the Leave
   War's dates, AND SAYS SO. Each gesture of the "Open for bidding" window is ONE command of its own type, `lw.open` (the
   red team's B12: a month's tap, a drag across months, a stretch's exact days — one Undo step each), so the bubble, the
   button's hover and the history line can name it — registered with the war's other commands and given its row in
   perms.ts (admin-only, as the stage was — 27 Aug 26), or every opening would be refused (Astra's red team 4, as it was for
   the stage). This file was stage-undo.test.ts, which pinned the stage move's `lw.stage`; renamed with the rule. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS, holds } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { initStore as raptorInitStore } from '../state/store'
import { setSession } from '../state/auth'
import { setPage, CURPAGE } from '../state/view'
import { cmdAuthorize } from '../state/perms'
import { projectPeople } from './state/raptorRoster'
import { openDates, closeDates, setStretch, createWar, clearCells, setBidState, getState, initStore as lwInitStore, lwHistInit, setPeople, setRole, setCell } from './state/store'
import { memoryBackend } from './state/storage'
import { wireLeaveWarSync } from './sync'
import { globalUndo, globalRedo, undoState, bubbleText } from '../undo'
import { _resetTimeline, _timelineEntries } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'

const ISNAP = JSON.stringify(INPUTS)
const DSNAP = JSON.stringify(DAYS)
beforeEach(() => {
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  stashClear()
  setSession({ user: 'ad', role: 'admin' })
  raptorInitStore(); lwInitStore(memoryBackend()); setPeople(projectPeople()); wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  setRole('admin')
})
afterEach(() => { _resetTimeline(); setSession(null) })

/* the seed's y2026 opens 1 Jan – 31 Mar (the brief) */
const open = () => getState().period.open.map(s => ({ ...s }))
const lastEntry = () => _timelineEntries()[_timelineEntries().length - 1]

describe('D352 narrowed by D1177 — opening or closing dates is its own Undo step, lw.open', () => {
  it('open → one lw.open step; Undo closes those days again, Redo opens them again', () => {
    const was = open()
    expect(was).toEqual([{ from: '2026-01-01', to: '2026-03-31' }])
    const n = _timelineEntries().length
    expect(openDates('2026-04-01', '2026-04-30')).toBe('set')
    const now = open()
    expect(now).toEqual([{ from: '2026-01-01', to: '2026-04-30' }])
    expect(_timelineEntries().length).toBe(n + 1)
    expect(lastEntry().type).toBe('lw.open')
    expect(globalUndo().ok).toBe(true)
    expect(open()).toEqual(was)
    expect(globalRedo().ok).toBe(true)
    expect(open()).toEqual(now)
  })
  it('undone from Edit Schedule, it takes you to the Leave War (B7 — AM39b; walker A2-F4)', () => {
    openDates('2026-04-01', '2026-04-30')
    setPage('editsched')
    expect(globalUndo().ok).toBe(true)
    expect(CURPAGE).toBe('leavewar')
  })
  it('closing is lw.open too — one step, and Undo opens the days again', () => {
    const n = _timelineEntries().length
    expect(closeDates('2026-02-01', '2026-02-28')).toBe('set')
    expect(_timelineEntries().length).toBe(n + 1)
    expect(_timelineEntries()[n].type).toBe('lw.open')
    expect(open()).toEqual([{ from: '2026-01-01', to: '2026-01-31' }, { from: '2026-03-01', to: '2026-03-31' }])
    expect(globalUndo().ok).toBe(true)
    expect(open()).toEqual([{ from: '2026-01-01', to: '2026-03-31' }])
  })
  it('a stretch\'s exact days (the calendar, D1172) are ONE step, closing what it loses and opening what it gains', () => {
    const n = _timelineEntries().length
    expect(setStretch({ from: '2026-01-01', to: '2026-03-31' }, '2026-02-01', '2026-05-31')).toBe('set')
    expect(_timelineEntries().length).toBe(n + 1)
    expect(open()).toEqual([{ from: '2026-02-01', to: '2026-05-31' }])
    expect(globalUndo().ok).toBe(true)
    expect(open()).toEqual([{ from: '2026-01-01', to: '2026-03-31' }])
  })
  it('a gesture that changes nothing leaves no step', () => {
    const n = _timelineEntries().length
    expect(openDates('2026-02-01', '2026-02-28')).toBe('unchanged')   // already open
    expect(closeDates('2026-06-01', '2026-06-30')).toBe('unchanged')  // already closed
    expect(_timelineEntries().length).toBe(n)
  })
  it('the command is the admin’s — mapped, never refused for him, refused for a member', () => {
    const actor = (role: any, personId: string) => ({ id: personId, role, personId, session: {} }) as any
    expect(cmdAuthorize('lw.open', actor('admin', 'stiff'))).toBe(true)
    expect(cmdAuthorize('lw.open', actor('member', 'bane'))).toBe(false)
  })
})

/* B8 — the Leave War's own words (walker A2-F1: seven acts all read "a change to the leave board") and the open dates'
   (D352 narrowed by D1177: "Undid: closing bidding 1 Apr – 30 Apr — those days are open again for everyone") */
describe('B8 — the Leave War says what came back', () => {
  it('closing: its own words, the dates, and what those days are now', () => {
    expect(closeDates('2026-01-01', '2026-03-31')).toBe('set')
    expect(undoState().undoLabel).toBe('closing bidding 1 Jan – 31 Mar')
    const r = globalUndo()
    expect(r.ok).toBe(true)
    expect(r.entry!.label).toBe('closing bidding 1 Jan – 31 Mar')
    expect(bubbleText(r.entry!, 'undo')).toBe('Undid: closing bidding 1 Jan – 31 Mar — those days are open again for everyone')
    const r2 = globalRedo()
    expect(r2.ok).toBe(true)
    expect(bubbleText(r2.entry!, 'redo')).toBe('Redid: closing bidding 1 Jan – 31 Mar — those days are closed for everyone')
  })
  it('opening: its own words, the dates, and what those days are now', () => {
    expect(openDates('2026-04-01', '2026-04-30')).toBe('set')
    expect(undoState().undoLabel).toBe('opening bidding 1 Apr – 30 Apr')
    const r = globalUndo()
    expect(r.ok).toBe(true)
    expect(bubbleText(r.entry!, 'undo')).toBe('Undid: opening bidding 1 Apr – 30 Apr — those days are closed again for everyone')
    const r2 = globalRedo()
    expect(r2.ok).toBe(true)
    expect(bubbleText(r2.entry!, 'redo')).toBe('Redid: opening bidding 1 Apr – 30 Apr — those days are open for everyone')
  })
  it('a bid names the man; a setting is "a Leave War setting"; never "leave board"', () => {
    setRole('admin')
    setCell('xray', '2026-07-15', 'LL')
    expect(undoState().undoLabel).toBe('Ryder’s bid')
    expect(undoState().undoLabel).not.toMatch(/leave board/)
  })
  it('removing an approved leave names the man and the leave — not "a change on the Leave War" (the picture check, lw G4)', () => {
    setRole('admin')
    /* the admin decides at any time now (D1177) — no stage step before the approval */
    setCell('xray', '2026-07-15', 'LL')
    setBidState('xray', '2026-07-15', 'approved')
    expect(INPUTS.some((r: any) => holds(r, 'xray') && r.type === 'LL' && r.lw)).toBe(true)
    clearCells([{ personId: 'xray', date: '2026-07-15' }])
    expect(INPUTS.some((r: any) => holds(r, 'xray') && r.type === 'LL' && r.lw)).toBe(false)
    expect(undoState().undoLabel).toBe('removing Ryder’s LL')
  })
  it('a new Leave War period says so — not "taking the war back to a draft" (Fable’s final read, F1)', () => {
    expect(createWar('2029', '2029-01-01', '2029-12-31')).toBe('created')
    expect(undoState().undoLabel).toBe('a new Leave War period')
    const r = globalUndo()
    expect(r.ok).toBe(true)
    expect(bubbleText(r.entry!, 'undo')).not.toMatch(/draft/)
  })
})
