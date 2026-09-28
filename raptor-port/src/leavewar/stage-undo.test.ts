/* D352 (28 Sep 26) — "Stage keep": the one Undo takes back a Leave War stage move, as today, AND SAYS SO. The stage gets
   its own command type, `lw.stage`, so the bubble, the button's hover and the history line can name it — registered with
   the war's other commands and given its row in perms.ts (admin-only, as the stage is — 27 Aug 26), or every stage move
   would be refused (Astra's red team 4). The change-recording plan §11 item 11. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { initStore as raptorInitStore } from '../state/store'
import { setSession } from '../state/auth'
import { cmdAuthorize } from '../state/perms'
import { projectPeople } from './state/raptorRoster'
import { advanceStage, reopenStage, getState, initStore as lwInitStore, lwHistInit, setPeople, setRole } from './state/store'
import { memoryBackend } from './state/storage'
import { wireLeaveWarSync } from './sync'
import { globalUndo, globalRedo } from '../undo'
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

const stage = () => getState().period.stage

describe('D352 — a stage move is its own Undo step, lw.stage', () => {
  it('advance → one lw.stage step; Undo puts the stage back, Redo moves it on again', () => {
    const was = stage()
    advanceStage()
    const now = stage()
    expect(now).not.toBe(was)
    const last = _timelineEntries()[_timelineEntries().length - 1]
    expect(last.type).toBe('lw.stage')
    expect(globalUndo().ok).toBe(true)
    expect(stage()).toBe(was)
    expect(globalRedo().ok).toBe(true)
    expect(stage()).toBe(now)
  })
  it('the ← step back is lw.stage too', () => {
    advanceStage()
    const n = _timelineEntries().length
    expect(reopenStage()).toBe(true)
    expect(_timelineEntries().length).toBe(n + 1)
    expect(_timelineEntries()[n].type).toBe('lw.stage')
  })
  it('the command is the admin’s — mapped, never refused for him, refused for a member', () => {
    const actor = (role: any, personId: string) => ({ id: personId, role, personId, session: {} }) as any
    expect(cmdAuthorize('lw.stage', actor('admin', 'stiff'))).toBe(true)
    expect(cmdAuthorize('lw.stage', actor('member', 'bane'))).toBe(false)
  })
})
