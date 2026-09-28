/* The change-recording re-test (28 Sep 26, [HUMAN-RETEST] / [UNDO-ROSTER-SETTINGS] / D148) — the timeline's own rules,
   modelled on the real command engine with fake stores, red first. The plan of record:
   docs/superpowers/plans/2026-09-28-change-recording-plan.md (§4 B1, B3, B6 as amended by §11; §13 A1-F1).
   - B1: a "seen" mark, a waiting person's own request and "OK, seen" on a war notice are never an Undo step.
   - B3 (D350): a step Undo cannot take yet (it writes a man's stints on the war) says so, on the greyed button and as the
     refusal; an older step taken past it says the later one stays (walker A2-F3).
   - B6 (D148): Undo reverses only your own changes; someone else's later change to the same thing refuses and SAYS WHO;
     after saying so once, the next press moves on to your next step, and says so (§11.5).
   - §11.1: the posting pass on its date never folds into the user step whose repaint woke it — it is the app's own
     change, and a refusal names it.
   - A1-F1: a later change that can never be undone is never "undo that first". */
import { describe, it, expect, beforeEach } from 'vitest'
import { commit, commitProjection, definePermission, anyone, installBaselineInvariants, onCommit } from '../command'
import { commitAs, _resetCommandEngine } from '../command/commit'
import { _resetPermissions } from '../command/permissions'
import { _resetInvariants } from '../command/harness'
import { _resetEffectContexts } from '../command/latch'
import { makeStore } from '../command/_fake'
import type { Actor, Command, Scope } from '../command'
import { installUndo, globalUndo, globalRedo, setCutoverModules, registerUndoStore, setUndoHooks, undoState, mayReverse } from './index'
import { _resetTimeline, _timelineEntries } from './timeline'

const A = (role: 'admin' | 'member' | 'system', personId?: string): Actor => ({ id: personId || role, role, personId, session: {} })
const BOSS = A('admin', 'boss')
const NAMES: Record<string, string> = { boss: 'Saber', hawk: 'Hawk', pA: 'Ranger' }

beforeEach(() => {
  _resetCommandEngine(); _resetPermissions(); _resetInvariants(); _resetEffectContexts(); _resetTimeline()
  installBaselineInvariants()
  for (const t of ['test.put', 'changes.seen', 'access.seen', 'person.backSeen', 'access.request', 'lw.ack', 'lw.postout', 'lw.postoutRun', 'remote.put'])
    definePermission(t, anyone)
  installUndo()
  setUndoHooks({ currentActor: () => BOSS, nameOf: (a) => (a.personId ? NAMES[a.personId] || null : null) })
})

function edit(store: any, scope: Scope, mutate: () => void, actor: Actor = BOSS, type = 'test.put') {
  const cmd: Command = { type, scope, apply: (txn) => { txn.enlist(store); mutate() } }
  return commitAs(cmd, { actor, origin: 'user' })
}
function remote(store: any, scope: Scope, mutate: () => void, actor: Actor) {
  return commitAs({ type: 'remote.put', scope, apply: (txn) => { txn.enlist(store); mutate() } }, { actor, origin: 'remote' })
}

describe('B1 — a seen mark, a waiting request, "OK, seen" are never an Undo step', () => {
  for (const type of ['changes.seen', 'access.seen', 'person.backSeen', 'access.request', 'lw.ack']) {
    it(`${type} makes no entry, and Undo still takes the step before it`, () => {
      const s = makeStore('S', 'settings'); s.set('x', { v: 1 })
      registerUndoStore(s.store, ['settings']); setCutoverModules(['settings'])
      edit(s.store, { module: 'settings' }, () => s.set('x', { v: 2 }))
      const n = _timelineEntries().length
      edit(s.store, { module: 'settings' }, () => s.set('seen', { pA: 5 }), BOSS, type)
      expect(_timelineEntries().length).toBe(n)
      expect(undoState().undoLabel).not.toBeNull()
      expect(globalUndo().ok).toBe(true)
      expect(s.get('x')).toEqual({ v: 1 })
      expect(s.get('seen')).toEqual({ pA: 5 })          // the seen mark is not taken back
    })
  }
})

describe('B3 (D350) — a step Undo cannot take yet says why', () => {
  const SAYS = /aren’t undone here/
  it('with only a posting left, the greyed button and the press both say so', () => {
    const po = makeStore('PO', 'lw.postouts')
    registerUndoStore(po.store, ['lw.postouts']); setCutoverModules(['lw'])
    edit(po.store, { module: 'lw', warId: 'w' }, () => po.set('all', { hex: 1 }), BOSS, 'lw.postout')
    const st = undoState()
    expect(st.canUndo).toBe(false)
    expect(st.undoWhy).toMatch(SAYS)
    const r = globalUndo()
    expect(r.ok).toBe(false)
    expect(r.reason).toMatch(SAYS)
    expect(r.reason).toMatch(/A delete is final/)
  })
  it('an older step taken past a posting says the posting stays (A2-F3)', () => {
    const po = makeStore('PO', 'lw.postouts'); const cfg = makeStore('CFG', 'lw.config')
    registerUndoStore(po.store, ['lw.postouts']); registerUndoStore(cfg.store, ['lw.config']); setCutoverModules(['lw'])
    let bubble = ''
    setUndoHooks({ currentActor: () => BOSS, showBubble: (t) => { bubble = t } })
    edit(cfg.store, { module: 'lw', warId: 'w' }, () => cfg.set('all', { sans: true }))
    edit(po.store, { module: 'lw', warId: 'w' }, () => po.set('all', { hex: 1 }), BOSS, 'lw.postout')
    expect(globalUndo().ok).toBe(true)
    expect(cfg.get('all')).toBeUndefined()
    expect(bubble).toMatch(/posting/i)
    expect(bubble).toMatch(/stays/i)
  })
})

describe('B6.1 (D148) — Undo reverses only your own changes', () => {
  it('another person’s entry is passed over, never refused on, never offered — an admin included (Astra 13)', () => {
    const s = makeStore('S', 'settings')
    registerUndoStore(s.store, ['settings']); setCutoverModules(['settings'])
    edit(s.store, { module: 'settings' }, () => s.set('a', { v: 1 }))                // his own
    edit(s.store, { module: 'settings' }, () => s.set('b', { v: 1 }), A('admin', 'hawk'))  // another admin's, same browser list
    expect(mayReverse(_timelineEntries()[1], BOSS)).toBe(false)
    expect(undoState().undoLabel).not.toBeNull()
    expect(globalUndo().ok).toBe(true)
    expect(s.get('a')).toBeUndefined()                    // his own went
    expect(s.get('b')).toEqual({ v: 1 })                  // Hawk's never touched
  })
  it('his own ADMIN step in the member view still refuses "switch back" every press — never skipped (D292, Astra 15)', () => {
    const s = makeStore('S', 'settings')
    registerUndoStore(s.store, ['settings']); setCutoverModules(['settings'])
    edit(s.store, { module: 'settings' }, () => s.set('a', { v: 1 }), A('member', 'boss'))   // his own member step (older)
    edit(s.store, { module: 'settings' }, () => s.set('b', { v: 1 }))                        // his admin step
    setUndoHooks({ currentActor: () => A('member', 'boss') })
    expect(globalUndo().reason).toBe('Switch back to the admin view to undo that.')
    expect(globalUndo().reason).toBe('Switch back to the admin view to undo that.')
    expect(s.get('a')).toEqual({ v: 1 })
    expect(s.get('b')).toEqual({ v: 1 })
  })
})

describe('B6.2–6.5 (D148) — someone else changed the same thing: refuse, and say who', () => {
  it('a remote change on the SAME record refuses naming him; the button stays on (S8, Astra 11)', () => {
    const s = makeStore('S', 'people')
    registerUndoStore(s.store, ['people']); setCutoverModules(['people'])
    edit(s.store, { module: 'people' }, () => s.set('pA', { q: 'C' }))
    remote(s.store, { module: 'people' }, () => s.set('pA', { q: 'B' }), A('admin', 'hawk'))
    expect(_timelineEntries().length).toBe(1)             // the remote change is never his step
    expect(undoState().canUndo).toBe(true)                // never greyed because someone else acted
    const r = globalUndo()
    expect(r.ok).toBe(false)
    expect(r.reason).toMatch(/^Hawk changed this after your action — it can’t be undone now\./)
    expect(s.get('pA')).toEqual({ q: 'B' })
  })
  it('a remote change on a DIFFERENT record never blocks his undo (Astra 12)', () => {
    const s = makeStore('S', 'people')
    registerUndoStore(s.store, ['people']); setCutoverModules(['people'])
    edit(s.store, { module: 'people' }, () => s.set('pA', { q: 'C' }))
    remote(s.store, { module: 'people' }, () => s.set('pB', { q: 'B' }), A('admin', 'hawk'))
    expect(globalUndo().ok).toBe(true)
    expect(s.get('pA')).toBeUndefined()
  })
  it('Redo checks the barrier too — a remote change made while the step was undone refuses the redo, naming him', () => {
    const s = makeStore('S', 'people'); s.set('pA', { q: 'D' })
    registerUndoStore(s.store, ['people']); setCutoverModules(['people'])
    edit(s.store, { module: 'people' }, () => s.set('pA', { q: 'C' }))
    expect(globalUndo().ok).toBe(true)
    remote(s.store, { module: 'people' }, () => s.set('pA', { q: 'B' }), A('admin', 'hawk'))
    const r = globalRedo()
    expect(r.ok).toBe(false)
    expect(r.reason).toMatch(/^Hawk changed this/)
    expect(s.get('pA')).toEqual({ q: 'B' })
  })
  it('the stale-revision refusal is caught BEFORE the snap, in words — never "Try again"', () => {
    const s = makeStore('S', 'settings')
    registerUndoStore(s.store, ['settings']); setCutoverModules(['settings'])
    let snapped = 0
    setUndoHooks({ currentActor: () => BOSS, snapView: () => { snapped++ } })
    edit(s.store, { module: 'settings' }, () => s.set('x', { v: 1 }))
    /* an orphan projection by the app itself (no cause) */
    commitProjection({ type: 'lw.postoutRun', scope: { module: 'settings' }, apply: (txn) => { txn.enlist(s.store); s.set('x', { v: 7 }) } })
    const r = globalUndo()
    expect(r.ok).toBe(false)
    expect(r.reason).toMatch(/^The app changed this after your action \(a posting out ran\)/)
    expect(r.reason).not.toMatch(/Try again/)
    expect(snapped).toBe(0)
  })
})

describe('B6.7 (§11.5) — said once, then the next press moves on, and says so', () => {
  it('first press names who and the next step; second press takes the next step; the blocked one still guards older steps', () => {
    const s = makeStore('S', 'people')
    registerUndoStore(s.store, ['people']); setCutoverModules(['people'])
    edit(s.store, { module: 'people' }, () => s.set('pB', { q: 'A' }))            // e1 — his, on pB (older)
    edit(s.store, { module: 'people' }, () => s.set('pA', { q: 'C' }))            // e2 — his, on pA
    remote(s.store, { module: 'people' }, () => s.set('pA', { q: 'B' }), A('admin', 'hawk'))
    const r1 = globalUndo()
    expect(r1.ok).toBe(false)
    expect(r1.reason).toMatch(/^Hawk changed this after your action — it can’t be undone now\. Press Undo again for: /)
    expect(undoState().canUndo).toBe(true)
    const r2 = globalUndo()
    expect(r2.ok).toBe(true)                                // e1 taken
    expect(s.get('pB')).toBeUndefined()
    expect(s.get('pA')).toEqual({ q: 'B' })                 // Hawk's value untouched
    expect(_timelineEntries()[1].undone).toBe(false)        // the blocked step stays, guarding
  })
})

describe('§11.1 — the posting pass never folds into the step whose repaint woke it', () => {
  it('a user edit whose delivery runs the pass keeps its own closure and stays undoable', () => {
    const ppl = makeStore('P', 'people'); const po = makeStore('PO', 'lw.postouts')
    registerUndoStore(ppl.store, ['people']); registerUndoStore(po.store, ['lw.postouts'])
    setCutoverModules(['people', 'lw'])
    const off = onCommit((env) => {
      if (env.origin === 'user' && env.type === 'test.put')
        commitProjection({ type: 'lw.postoutRun', scope: { module: 'people' }, apply: (txn) => { txn.enlist(ppl.store); txn.enlist(po.store); ppl.set('hex', { archived: true }); po.set('all', { hex: 'ran' }) } })
    })
    edit(ppl.store, { module: 'people' }, () => ppl.set('outlaw', { nvg: true }))
    off()
    const e = _timelineEntries()[0]
    expect(e.forward.map(c => c.id)).toEqual(['outlaw'])   // the pass is not in it
    expect(undoState().canUndo).toBe(true)
    expect(globalUndo().ok).toBe(true)
    expect(ppl.get('outlaw')).toBeUndefined()
    expect(ppl.get('hex')).toEqual({ archived: true })     // the pass's archive is not taken back
  })
})

describe('A1-F1 — a later change that can never be undone is never "undo that first"', () => {
  it('a newer step passed over as dead blocks with words that are true', () => {
    const s = makeStore('S', 'settings')
    registerUndoStore(s.store, ['settings']); setCutoverModules(['settings'])
    edit(s.store, { module: 'settings' }, () => s.set('x', { v: 1 }))     // e1
    edit(s.store, { module: 'settings' }, () => s.set('x', { v: 2 }))     // e2 — dead (a deleted man's)
    setUndoHooks({ currentActor: () => BOSS, deadRefusal: (ch) => (ch.some(c => (c.after as any)?.v === 1) ? 'Hex has been deleted — that change can’t be undone' : null) })
    const r = globalUndo()
    expect(r.ok).toBe(false)
    expect(r.reason).not.toMatch(/undo that first/)
    expect(r.reason).toMatch(/can’t be undone/)
  })
})
