/* [ARCH-STACK] Step 3 — the timeline property tests (design §12). Drives the REAL
   command engine + fake stores through the timeline: basic undo/redo, N→N→N,
   distinct-key independence, clone-on-write, the out-of-band barrier, mayReverse,
   redo LIFO, eligibility, the causal-closure fold, nav-not-entry, and the derived
   publication barrier (§4/§5/§6.3/§8). */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  commit, onCommit, commitProjection, definePermission, anyone, installBaselineInvariants,
} from '../command'
import { commitAs, _resetCommandEngine } from '../command/commit'
import { _resetPermissions } from '../command/permissions'
import { _resetInvariants } from '../command/harness'
import { _resetEffectContexts } from '../command/latch'
import { makeStore } from '../command/_fake'
import type { Actor, Command, Scope } from '../command'
import {
  installUndo, globalUndo, globalRedo, setCutoverModules, registerUndoStore,
  setUndoHooks, mayReverse, undoState,
} from './index'
import { _resetTimeline, _timelineEntries, _undoConflict, _redoConflict, _pubBar } from './timeline'
import type { UndoEntry } from './types'

const A = (role: 'admin' | 'member' | 'system', personId?: string): Actor =>
  ({ id: personId || role, role, personId, session: {} })

beforeEach(() => {
  _resetCommandEngine()
  _resetPermissions()
  _resetInvariants()
  _resetEffectContexts()
  _resetTimeline()
  installBaselineInvariants()
  definePermission('test.put', anyone)
  installUndo()
  setUndoHooks({ currentActor: () => A('admin', 'boss') })   // default reverting actor
})

/* a forward user commit; `actor` injects a specific WHO (defaults to the admin
   the default currentActor hook reverses as, so undo is permitted). */
function edit(storeKey: any, scope: Scope, mutate: () => void, actor: Actor = A('admin', 'boss'), type = 'test.put') {
  const cmd: Command = { type, scope, apply: (txn) => { txn.enlist(storeKey); mutate() } }
  return commitAs(cmd, { actor, origin: 'user' })
}

describe('basic undo / redo', () => {
  it('undoes an edit back to its prior value and redoes it forward', () => {
    const s = makeStore('S', 'settings'); s.set('x', { v: 1 })
    registerUndoStore(s.store, ['settings']); setCutoverModules(['settings'])
    edit(s.store, { module: 'settings' }, () => s.set('x', { v: 2 }))
    expect(s.get('x')).toEqual({ v: 2 })

    expect(globalUndo().ok).toBe(true)
    expect(s.get('x')).toEqual({ v: 1 })       // recorded before-image restored
    expect(globalRedo().ok).toBe(true)
    expect(s.get('x')).toEqual({ v: 2 })       // forward re-applied
  })

  it('undoes a create with a delete, and restores it on redo', () => {
    const s = makeStore('S', 'settings')
    registerUndoStore(s.store, ['settings']); setCutoverModules(['settings'])
    edit(s.store, { module: 'settings' }, () => s.set('y', { v: 9 }))
    expect(s.get('y')).toEqual({ v: 9 })
    globalUndo()
    expect(s.get('y')).toBeUndefined()         // create → delete
    globalRedo()
    expect(s.get('y')).toEqual({ v: 9 })
  })
})

describe('N edits → N undos → N redos on one record (§4.4)', () => {
  it('walks the whole chain both ways', () => {
    const s = makeStore('S', 'settings'); s.set('x', { v: 0 })
    registerUndoStore(s.store, ['settings']); setCutoverModules(['settings'])
    for (let v = 1; v <= 4; v++) edit(s.store, { module: 'settings' }, () => s.set('x', { v }))
    expect(s.get('x')).toEqual({ v: 4 })
    for (let v = 3; v >= 0; v--) { expect(globalUndo().ok).toBe(true); expect(s.get('x')).toEqual({ v }) }
    for (let v = 1; v <= 4; v++) { expect(globalRedo().ok).toBe(true); expect(s.get('x')).toEqual({ v }) }
  })
})

describe('clone-on-write — a later edit never mutates a recorded inverse', () => {
  it('undo restores the value at the time of THAT edit', () => {
    const s = makeStore('S', 'settings'); s.set('x', { v: 1 })
    registerUndoStore(s.store, ['settings']); setCutoverModules(['settings'])
    edit(s.store, { module: 'settings' }, () => s.set('x', { v: 2 }))
    edit(s.store, { module: 'settings' }, () => s.set('x', { v: 3 }))
    globalUndo(); expect(s.get('x')).toEqual({ v: 2 })   // not corrupted to 3
    globalUndo(); expect(s.get('x')).toEqual({ v: 1 })
  })
})

describe('distinct records are independent', () => {
  it('undoes each without disturbing the other', () => {
    const s = makeStore('S', 'settings')
    registerUndoStore(s.store, ['settings']); setCutoverModules(['settings'])
    edit(s.store, { module: 'settings' }, () => s.set('a', { v: 1 }))
    edit(s.store, { module: 'settings' }, () => s.set('b', { v: 2 }))
    globalUndo(); expect(s.get('b')).toBeUndefined(); expect(s.get('a')).toEqual({ v: 1 })
    globalUndo(); expect(s.get('a')).toBeUndefined()
  })
})

describe('out-of-band barrier refuses undo through an unaccounted change (§4.1)', () => {
  it('an orphan projection between two edits blocks undoing the earlier one', () => {
    const s = makeStore('S', 'settings'); s.set('x', { v: 1 })
    registerUndoStore(s.store, ['settings']); setCutoverModules(['settings'])
    definePermission('proj.put', anyone)
    edit(s.store, { module: 'settings' }, () => s.set('x', { v: 2 }))          // entry1
    // an orphan projection (no causedBy) bumps x's revision out of band
    commitProjection({ type: 'proj.put', scope: { module: 'settings' }, apply: (txn) => { txn.enlist(s.store); s.set('x', { v: 99 }) } })
    edit(s.store, { module: 'settings' }, () => s.set('x', { v: 3 }))          // entry2
    // undo of the newest (entry2) is fine — its base already includes the orphan
    expect(globalUndo().ok).toBe(true)
    expect(s.get('x')).toEqual({ v: 99 })
    // undo of entry1 is refused: an out-of-band change sits behind it
    const r = globalUndo()
    expect(r.ok).toBe(false)
    expect(r.reason).toMatch(/changed this after/i)
  })
})

describe('mayReverse — actor identity + ownership (§5)', () => {
  const entryFor = (): UndoEntry => _timelineEntries()[_timelineEntries().length - 1]
  it('admin may reverse anything; a member may reverse their OWN, not others’, not admin’s', () => {
    const s = makeStore('S', 'inputs')
    registerUndoStore(s.store, ['inputs']); setCutoverModules(['inputs'])
    // a member (pA) files their own input
    edit(s.store, { module: 'inputs' }, () => s.set('i1', { person: 'pA', v: 1 }), A('member', 'pA'))
    const e = entryFor()
    expect(mayReverse(e, A('admin'))).toBe(true)               // admin: yes
    expect(mayReverse(e, A('member', 'pA'))).toBe(true)        // same member: yes
    expect(mayReverse(e, A('member', 'pB'))).toBe(false)       // another member: no
  })
  it('a member (or admin viewing-as-member) may NOT undo an admin decision', () => {
    const s = makeStore('S', 'settings')
    registerUndoStore(s.store, ['settings']); setCutoverModules(['settings'])
    edit(s.store, { module: 'settings' }, () => s.set('x', { v: 1 }), A('admin', 'boss'))
    const e = entryFor()
    expect(mayReverse(e, A('member', 'boss'))).toBe(false)     // view-as-member of the SAME person: no
    expect(mayReverse(e, A('member', 'pC'))).toBe(false)
  })
  it('globalUndo refuses when the current actor may not reverse', () => {
    const s = makeStore('S', 'settings')
    registerUndoStore(s.store, ['settings']); setCutoverModules(['settings'])
    edit(s.store, { module: 'settings' }, () => s.set('x', { v: 1 }), A('admin', 'boss'))
    setUndoHooks({ currentActor: () => A('member', 'someone') })
    const r = globalUndo()
    expect(r.ok).toBe(false)
    expect(r.reason).toMatch(/someone else/i)
  })
})

describe('redo LIFO (R3-06) + eligibility gate (§7)', () => {
  it('redo re-applies the most-recently-undone entry first', () => {
    const s = makeStore('S', 'settings')
    registerUndoStore(s.store, ['settings']); setCutoverModules(['settings'])
    edit(s.store, { module: 'settings' }, () => s.set('a', { v: 1 }))   // e1
    edit(s.store, { module: 'settings' }, () => s.set('b', { v: 1 }))   // e2
    globalUndo()   // undoes e2 (b)
    globalUndo()   // undoes e1 (a)
    // most-recently-undone is e1 → redo brings back a first
    globalRedo(); expect(s.get('a')).toEqual({ v: 1 }); expect(s.get('b')).toBeUndefined()
    globalRedo(); expect(s.get('b')).toEqual({ v: 1 })
  })
  it('an entry whose module is not cut over is not undoable', () => {
    const s = makeStore('S', 'settings')
    registerUndoStore(s.store, ['settings'])   // registered, but NOT cut over
    edit(s.store, { module: 'settings' }, () => s.set('x', { v: 1 }))
    expect(undoState().canUndo).toBe(false)
    expect(globalUndo().ok).toBe(false)
    setCutoverModules(['settings'])
    expect(undoState().canUndo).toBe(true)
    expect(globalUndo().ok).toBe(true)
  })
})

describe('causal closure — a user action + its projection child = ONE undo (§3.1)', () => {
  it('undo reverses BOTH sides of the closure', () => {
    const sA = makeStore('SA', 'settings')
    const sB = makeStore('SB', 'inputs')
    registerUndoStore(sA.store, ['settings']); registerUndoStore(sB.store, ['inputs'])
    setCutoverModules(['settings', 'inputs'])
    definePermission('proj.put', anyone)
    // when the user edit to A is delivered, a subscriber raises a projection to B
    const off = onCommit((env) => {
      if (env.origin === 'user' && env.type === 'test.put') {
        commitProjection({ type: 'proj.put', scope: { module: 'inputs' }, apply: (txn) => { txn.enlist(sB.store); sB.set('i1', { person: 'pA', v: 7 }) } })
      }
    })
    edit(sA.store, { module: 'settings' }, () => sA.set('x', { v: 5 }))
    off()
    expect(sA.get('x')).toEqual({ v: 5 })
    expect(sB.get('i1')).toEqual({ person: 'pA', v: 7 })
    // ONE undo entry folds both
    expect(_timelineEntries().length).toBe(1)
    expect(_timelineEntries()[0].contexts.some(c => c.kind === 'page' && c.module === 'inputs')).toBe(true)
    globalUndo()
    expect(sA.get('x')).toBeUndefined()
    expect(sB.get('i1')).toBeUndefined()   // the projection child was reversed too
  })
})

describe('deferred collections: non-undoable but still conflict barriers (§7, C1/C2)', () => {
  it('an lw.postouts closure is NOT undoable even though lw is cut over; lw.config IS', () => {
    const po = makeStore('PO', 'lw.postouts')
    const cfg = makeStore('CFG', 'lw.config')
    registerUndoStore(po.store, ['lw.postouts']); registerUndoStore(cfg.store, ['lw.config'])
    setCutoverModules(['lw'])
    definePermission('lw.edit', anyone)
    // a post-out edit — ineligible (its roster reproject is deferred to phase 5)
    commit({ type: 'lw.edit', scope: { module: 'lw' }, apply: (txn) => { txn.enlist(po.store); po.set('all', { x: 1 }) } })
    expect(undoState().canUndo).toBe(false)
    expect(globalUndo().ok).toBe(false)
    // a config edit (figure-hide, colours, order) — eligible, restores cleanly
    commit({ type: 'lw.edit', scope: { module: 'lw' }, apply: (txn) => { txn.enlist(cfg.store); cfg.set('all', { hidden: ['f1'] }) } })
    expect(undoState().canUndo).toBe(true)
  })

  it('an ineligible newer entry sharing a key still BLOCKS undoing an eligible earlier one (C1 — no stale inverse)', () => {
    const s = makeStore('S', 'settings')
    const po = makeStore('PO', 'lw.postouts')
    registerUndoStore(s.store, ['settings']); registerUndoStore(po.store, ['lw.postouts'])
    setCutoverModules(['settings', 'lw'])
    definePermission('mix', anyone)
    s.set('x', { v: 1 })
    edit(s.store, { module: 'settings' }, () => s.set('x', { v: 2 }))               // E1 eligible, key x
    const e1 = _timelineEntries()[0]
    // E2 touches settings/x AND lw.postouts → ineligible (deferred), shares key x
    commit({ type: 'mix', scope: { module: 'settings' }, apply: (txn) => { txn.enlist(s.store); txn.enlist(po.store); s.set('x', { v: 3 }); po.set('all', { y: 1 }) } })
    expect(_undoConflict(e1)).toBeTruthy()          // refuse-whole, never a silent stale apply
    const r = globalUndo()                          // selection skips E2, lands E1, but conflict refuses
    expect(r.ok).toBe(false)
    expect(s.get('x')).toEqual({ v: 3 })            // nothing was overwritten
  })
})

describe('a restore-caused projection is out-of-band, NOT folded into the entry (§3.4)', () => {
  it('a reconciler that fires during undo does not become part of the entry or its redo', () => {
    const s = makeStore('S', 'settings')
    registerUndoStore(s.store, ['settings']); setCutoverModules(['settings'])
    definePermission('proj.put', anyone)
    // a user edit to x — ONE entry, forward = [x]
    edit(s.store, { module: 'settings' }, () => s.set('x', { v: 2 }))
    const entry = _timelineEntries()[0]
    expect(entry.forward.length).toBe(1)
    // a subscriber mimics a reconciler that writes a DIFFERENT record y whenever a
    // restore is applied (this is what LW sync does once cut over)
    const off = onCommit((env) => {
      if (env.origin === 'restore') {
        commitProjection({ type: 'proj.put', scope: { module: 'settings' }, apply: (txn) => { txn.enlist(s.store); s.set('y', { v: 100 }) } })
      }
    })
    expect(globalUndo().ok).toBe(true)
    off()
    // the reconciler DID run (out-of-band effect), but it is NOT folded into the entry:
    expect(s.get('y')).toEqual({ v: 100 })
    expect(entry.forward.length).toBe(1)                 // still just [x] — not corrupted
    // and redo replays ONLY the original forward, never the reconciler's write
    s.set('y', { v: 0 })
    expect(globalRedo().ok).toBe(true)
    expect(s.get('x')).toEqual({ v: 2 })
    expect(s.get('y')).toEqual({ v: 0 })                 // redo did not re-apply the folded projection
  })
})

describe('navigation is not an entry (§3.1 R2-10)', () => {
  it('an lw.current-only user envelope creates no undo entry', () => {
    const s = makeStore('LW', 'lw.current')
    registerUndoStore(s.store, ['lw.current']); setCutoverModules(['lw'])
    definePermission('lw.nav', anyone)
    commit({ type: 'lw.nav', scope: { module: 'lw', warId: 'w1' }, apply: (txn) => { txn.enlist(s.store); s.set('all', 'w2') } })
    expect(_timelineEntries().length).toBe(0)
    expect(undoState().canUndo).toBe(false)
  })
})

describe('the derived publication barrier (§6.3)', () => {
  it('an edit behind a later publish of the same day cannot be undone directly', () => {
    const days = makeStore('D', 'days')
    const orig = makeStore('O', 'sched.orig')
    registerUndoStore(days.store, ['days']); registerUndoStore(orig.store, ['sched.orig'])
    setCutoverModules(['sched'])
    definePermission('sched.edit', anyone); definePermission('sched.pub', anyone)
    // edit day W1#0
    commit({ type: 'sched.edit', scope: { module: 'sched', weekId: 'W1' }, apply: (txn) => { txn.enlist(days.store); days.set('W1#0', { marks: 1 }) } })
    const editEntry = _timelineEntries()[0]
    // publish day W1#0 (a boundary entry stamping sched.orig/W1:0)
    commit({
      type: 'sched.pub', scope: { module: 'sched', weekId: 'W1' },
      apply: (txn) => { txn.enlist(orig.store); orig.set('W1:0', { id: 'v1' }); txn.boundary({ kind: 'publish', ids: ['v1'], crossable: true }) },
    })
    // the pub barrier now covers W1#0
    expect(_pubBar().get('W1#0')).toBeDefined()
    // undoing the earlier edit is refused (must unpublish first)
    expect(_undoConflict(editEntry)).toMatch(/published after/i)
  })
})
