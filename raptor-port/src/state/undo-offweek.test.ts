// @vitest-environment jsdom
/* [GLOBAL-UNDO] §13 phase 2.6 (C7 / finding I) — an undo whose closure touches a
   week that is NOT loaded applies through the weekstash seam WHILE that week is off
   screen: loadContext skips a weekstash-only week context (so the target never
   becomes CURWEEK and the CURWEEK stash-write guard is only a safety net). Plus the
   weekstash key-family (R3-05): a weekstash key shares with every same-week
   scheduler key, both directions. */
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { SCHED } from '../engine/publish'
import { CURWEEK } from '../engine/waves'
import { stashClear, stashPut, stashHas, stashDrop } from '../engine/weekstash'
import { weekBundle } from '../engine/weeks-data'
import { initStore, writeInputsBatchWith, weekstashStore } from './store'
import { setSession } from './auth'
import * as view from './view'
import { _resetDisclosure } from './disclosure'
import { globalUndo, globalRedo, undoState } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { sharesKeys } from '../undo/derive'
import { installGlobalUndo } from './undo-wire'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const OFFWEEK = '27/07/2026'      // NOT CURWEEK ('13/07/2026')
const stashPlain = (key: string) => stashPut(key, JSON.stringify({ d: weekBundle(key).days }))

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.signBind = {}; SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  setSession({ user: 'ad', role: 'admin' })
  view.selDrop(); view.armDrop()
  initStore()
  stashClear()
  _resetDisclosure()
  _resetTimeline()
  installGlobalUndo()
})
afterEach(() => { _resetTimeline(); stashClear() })

describe('off-week undo through the weekstash seam (C7)', () => {
  it('undoes an off-week stash change WITHOUT loading that week', () => {
    stashPlain(OFFWEEK)
    expect(CURWEEK).toBe('13/07/2026')

    // a command that drops the off-week stash — captured on the timeline
    const ok = writeInputsBatchWith([weekstashStore], () => { stashDrop(OFFWEEK) })
    expect(ok).toBe(true)
    expect(stashHas(OFFWEEK)).toBe(false)
    expect(undoState().canUndo).toBe(true)

    const u = globalUndo()
    expect(u.ok).toBe(true)
    expect(stashHas(OFFWEEK)).toBe(true)        // the off-week stash was restored
    expect(CURWEEK).toBe('13/07/2026')          // …and the week was NEVER loaded (still on 13/07)

    const r = globalRedo()
    expect(r.ok).toBe(true)
    expect(stashHas(OFFWEEK)).toBe(false)
    expect(CURWEEK).toBe('13/07/2026')          // redo also stays off-screen
  })
})

describe('the weekstash key-family (R3-05)', () => {
  it('a weekstash key shares with every same-week scheduler key, both directions', () => {
    const stash = new Set([`weekstash/${OFFWEEK}`])
    const day = new Set([`days/${OFFWEEK}#0`])
    const book = new Set([`sched.book/${OFFWEEK}`])
    expect(sharesKeys(stash, day)).toBe(true)
    expect(sharesKeys(day, stash)).toBe(true)
    expect(sharesKeys(stash, book)).toBe(true)
    // a DIFFERENT week does not share
    expect(sharesKeys(stash, new Set(['days/13/07/2026#0']))).toBe(false)
  })
})
