/* [ARCH-STACK] Step 2 follow-up #1 — routing the REMAINING scheduler writes
   through commit(), the ROUND-2 (Rev 3) regressions. The phase-2b publish path is
   pinned in publish-commit.test.ts; this file pins the follow-up:
     - the lagging baseline stays in step (SCHED_BASELINE === histSnap) after boot
       and after every re-sync point (loadWeek / undo / resetSession),
     - the sign READERS are non-mutating (R2-01) so a no-op command emits nothing,
     - the previously-unrouted paths now emit exactly one envelope of their type
       and leave the baseline clean (row C text R2-04, row G stores R2-02,
       row E warn-mute, the afterSchedMutate backstop),
     - the whole-world guard still catches a raw un-enlisted DAYS write (SR-005),
     - the schedBaselineClean() guardrail detects an escape (R2-06).
   ADDITIVE: the legacy histPush/persist path is unchanged; parity stays 728/0. */
import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { SCHED, signOf, daySigned, signShown, signNames, markEdit } from '../engine/publish'
import { txtGet, txtSet } from '../engine/slots'
import { CURWEEK } from '../engine/waves'
import { initStore, loadWeek, resetSession, subscribe } from './store'
import { undo } from './history'
import * as view from './view'
import {
  schedWrite, schedWriteValue, SCHED_TYPES, schedBaselineClean, resyncSchedBaseline,
  commitSchedVoid,
} from './sched-commit'
import { setSession } from './auth'
import { commit, onCommit } from '../command'
import type { CommitEnvelope } from '../command'
import { stashClear } from '../engine/weekstash'

let caught: CommitEnvelope[] = []
let unsub: () => void

beforeEach(() => {
  stashClear()
  for (let i = INPUTS.length - 1; i >= 0; i--) if ((INPUTS[i] as any)._t) INPUTS.splice(i, 1)
  setSession({ user: 'ad', role: 'admin' })
  view.selDrop(); view.armDrop()
  initStore()
  loadWeek('13/07/2026')
  caught = []
  unsub = onCommit(e => caught.push(e))
})
afterEach(() => { unsub() })

describe('the lagging baseline stays in step', () => {
  it('after boot + loadWeek, SCHED_BASELINE === live', () => {
    expect(schedBaselineClean()).toBe(true)
  })

  it('R2-01: reading a day sign strip does NOT materialize SCHED.sign; a no-op command emits nothing', () => {
    expect(SCHED.sign).toEqual({})
    // the three read sites the app hits on every day paint (view week included)
    DAYS.forEach((_: any, di: number) => { daySigned(di); signShown(di); signNames(di) })
    expect(SCHED.sign).toEqual({})          // signAt never inserts
    expect(schedBaselineClean()).toBe(true) // so live never drifted from the baseline
    caught = []
    commitSchedVoid(SCHED_TYPES.mutate, () => {})   // a pure no-op command
    expect(caught.length).toBe(0)                   // emits nothing (design decision #5)
  })

  it('after each re-sync point the baseline is clean and the next command leaks no whole-world diff', () => {
    // loadWeek
    loadWeek('20/07/2026')
    expect(schedBaselineClean()).toBe(true)
    caught = []; commitSchedVoid(SCHED_TYPES.mutate, () => {}); expect(caught.length).toBe(0)
    // undo (after a real routed edit)
    loadWeek('13/07/2026')
    schedWrite(SCHED_TYPES.text, () => { txtSet('dn:0.0', 'X'); markEdit() })
    undo()
    expect(schedBaselineClean()).toBe(true)
    caught = []; commitSchedVoid(SCHED_TYPES.mutate, () => {}); expect(caught.length).toBe(0)
    // resetSession — clears WARNOFF, which rides the baseline (SR-007)
    schedWriteValue(SCHED_TYPES.warnMute, () => view.toggleWarnOff('some.check.key'))
    resetSession({ user: 'ad', role: 'admin' })
    expect(schedBaselineClean()).toBe(true)
    caught = []; commitSchedVoid(SCHED_TYPES.mutate, () => {}); expect(caught.length).toBe(0)
  })
})

describe('the previously-unrouted paths now emit exactly one envelope', () => {
  it('row C (R2-04): a routed text write emits ONE sched.text envelope + a days change, baseline clean', () => {
    caught = []
    schedWrite(SCHED_TYPES.text, () => { txtSet('dn:0.0', 'ROUTED NOTE'); markEdit() })
    expect(caught.length).toBe(1)
    expect(caught[0].type).toBe('sched.text')
    expect(caught[0].changes.some(c => c.collection === 'days')).toBe(true)
    expect(txtGet('dn:0.0')).toBe('ROUTED NOTE')
    expect(schedBaselineClean()).toBe(true)
    // a FOLLOWING command carries no leftover text change (the R2-04 mis-attribution window is closed)
    caught = []
    commitSchedVoid(SCHED_TYPES.mutate, () => {})
    expect(caught.length).toBe(0)
  })

  it('row G (R2-02): a stores loadout write emits ONE sched.stores envelope with a days change', () => {
    const a: any = DAYS[0].waves[0].formations[0].aircraft[0]
    caught = []
    schedWrite(SCHED_TYPES.stores, () => {
      a.opts = a.opts || {}
      const was = a.opts.tk2 ? 'TK2' : ''
      a.opts.tk2 = !a.opts.tk2
      markEdit('st:0.0.0.0', was, a.opts.tk2 ? 'TK2' : '')
    })
    expect(caught.length).toBe(1)
    expect(caught[0].type).toBe('sched.stores')
    expect(caught[0].changes.some(c => c.collection === 'days')).toBe(true)
    expect(schedBaselineClean()).toBe(true)
  })

  it('row E: a warn-mute emits ONE sched.warnMute envelope with a sched.mutes change', () => {
    caught = []
    const shown = schedWriteValue(SCHED_TYPES.warnMute, () => view.toggleWarnOff('CREW_REST|0'))
    expect(shown).toBe(false)                 // first toggle hides it (schedWriteValue carried the bool back — R2-11)
    expect(caught.length).toBe(1)
    expect(caught[0].type).toBe('sched.warnMute')
    expect(caught[0].changes.some(c => c.collection === 'sched.mutes')).toBe(true)
    expect(schedBaselineClean()).toBe(true)
  })

  it('the backstop: a board mutation + afterSchedMutate (idle) opens a sched.mutate envelope capturing it', () => {
    // mutate the model in place, exactly as a board handler does, THEN reach the epilogue
    DAYS[0].waves[0].formations[0].aircraft[0].cs = 'BACKSTOP'
    caught = []
    view.afterSchedMutate()                   // the wired backstop self-wraps in sched.mutate
    expect(caught.length).toBe(1)
    expect(caught[0].type).toBe('sched.mutate')
    expect(caught[0].changes.some(c => c.collection === 'days')).toBe(true)
    expect(schedBaselineClean()).toBe(true)
  })
})

describe('the guard + the guardrail', () => {
  it('SR-005: a raw un-enlisted DAYS mutation inside a command fails the guard and is restored', () => {
    const before = DAYS[0].waves[0].formations[0].aircraft[0].cs
    caught = []
    // a command that mutates DAYS WITHOUT enlisting schedStore — the whole-world
    // guard must catch it (only possible because signature() stays LIVE, SR-005)
    const res = commit({
      type: SCHED_TYPES.mutate,
      scope: { module: 'sched', weekId: CURWEEK },
      apply: () => { DAYS[0].waves[0].formations[0].aircraft[0].cs = 'RAW-UNENLISTED' },
    })
    expect((res as any).ok).toBe(false)
    expect(DAYS[0].waves[0].formations[0].aircraft[0].cs).toBe(before)   // restored
    expect(caught.length).toBe(0)                                        // nothing emitted
    expect(schedBaselineClean()).toBe(true)
  })

  it('R2-06: schedBaselineClean() detects an escape (a durable write that opened no command)', () => {
    expect(schedBaselineClean()).toBe(true)
    DAYS[0].waves[0].formations[0].aircraft[0].cs = 'ESCAPED'   // raw, no command
    expect(schedBaselineClean()).toBe(false)                    // the guardrail catches it
    resyncSchedBaseline()
    expect(schedBaselineClean()).toBe(true)
  })

  it('F-01: a command a listener fires DURING loadWeek does not diff the old week against the new', () => {
    // the Leave War sync is a real notify-listener that opens a scheduler command;
    // if it runs while the baseline still holds the previous week, its envelope
    // would carry a spurious WHOLE-WEEK diff (book/orig/als only differ ACROSS weeks;
    // a load-time landing delta touches only 'days').
    loadWeek('20/07/2026')      // start on week 2 (its days read 'Jul 20'..)
    caught = []
    let fired = false
    const un = subscribe(() => { if (fired) return; fired = true; commitSchedVoid(SCHED_TYPES.mutate, () => {}) })
    loadWeek('13/07/2026')      // swap back to week 1 — the listener fires mid-load
    un()
    // the bug: a command whose BEFORE-image is the OLD week (dt 'Jul 20') because the
    // baseline still lagged a whole week. A load-time landing delta diffs the NEW week
    // (before.dt 'Jul 13'), so it never trips this.
    const oldWeekLeak = caught.flatMap(e => e.changes).some((c: any) =>
      c.collection === 'days' && c.before && c.before.dt === 'Jul 20')
    expect(oldWeekLeak, 'no load-time command diffed against the OLD week').toBe(false)
    expect(schedBaselineClean()).toBe(true)
  })
})
