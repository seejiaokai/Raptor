import { describe, it, expect } from 'vitest'
import { CommandCore } from './core'
import { checkStructuralInvariants } from './invariants'
import { inverseChanges } from './undo'
import { sameContent } from './equal'
import type { GateView } from './core'
import type { Change, Command } from './types'

// deterministic PRNG so a failure is reproducible
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
let n = 0
const cmd = (changes: Change[], over: Partial<Command> = {}): Command =>
  ({ id: 'c' + ++n, ts: 0, principal: 'p1', origin: 'causal', kind: 't', changes, ...over })

describe('invariant harness (SEQ-001) — structural HARD invariants hold under random sequences', () => {
  it('random valid command sequences preserve the structural invariants', () => {
    const core = new CommandCore()
    const rand = rng(12345)
    const ids = ['inputs/a', 'inputs/b', 'people/x', 'plan/y']
    for (let step = 0; step < 400; step++) {
      const [collection, id] = ids[Math.floor(rand() * ids.length)].split('/')
      const snap = core.read(collection, id)
      const live = snap && !snap.deleted
      const base = core.currentVersion(collection, id)
      let ch: Change
      if (live && rand() < 0.3) {
        ch = { collection, id, op: 'delete', before: snap!.value, after: null, baseVersion: base }
      } else {
        // always a NEW value so it is never a no-op
        ch = { collection, id, op: 'put', before: live ? snap!.value : null, after: { step }, baseVersion: base }
      }
      const r = core.commit(cmd([ch]))
      expect(r.ok).toBe(true)
    }
    expect(() => checkStructuralInvariants(core)).not.toThrow()
  })

  it('a stale command is ALWAYS rejected and never mutates state (optimistic concurrency holds)', () => {
    const core = new CommandCore()
    const rand = rng(999)
    core.commit(cmd([{ collection: 'inputs', id: 'a', op: 'put', before: null, after: 0, baseVersion: 0 }]))
    for (let step = 0; step < 200; step++) {
      const before = core.read('inputs', 'a')
      const cur = core.currentVersion('inputs', 'a')
      if (rand() < 0.5) {
        // valid write
        core.commit(cmd([{ collection: 'inputs', id: 'a', op: 'put', before: before!.value, after: { step }, baseVersion: cur }]))
      } else {
        // stale write (one behind) — must be rejected, state unchanged
        const r = core.commit(cmd([{ collection: 'inputs', id: 'a', op: 'put', before: before!.value, after: 'STALE', baseVersion: cur - 1 }]))
        expect(r.ok).toBe(false)
        expect(core.read('inputs', 'a')).toEqual(before)
      }
    }
    checkStructuralInvariants(core)
  })

  it('cross-consumer consistency: the derived projection always matches its source (spec §3)', () => {
    const core = new CommandCore()
    const mirror = (v: GateView): Change[] => {
      const inp = v.read('inputs', 'i1')
      const cur = v.read('leavewar', 'p1/d1')
      if (!inp || inp.deleted) {
        return cur && !cur.deleted ? [{ collection: 'leavewar', id: 'p1/d1', op: 'delete', before: cur.value, after: null, baseVersion: v.currentVersion('leavewar', 'p1/d1') }] : []
      }
      const want = { from: (inp.value as { person: string }).person }
      if (cur && !cur.deleted && sameContent(cur.value, want)) return []
      return [{ collection: 'leavewar', id: 'p1/d1', op: 'put', before: cur && !cur.deleted ? cur.value : null, after: want, baseVersion: v.currentVersion('leavewar', 'p1/d1') }]
    }
    core.registerHook(mirror)
    const rand = rng(42)
    for (let step = 0; step < 200; step++) {
      const snap = core.read('inputs', 'i1')
      const live = snap && !snap.deleted
      const base = core.currentVersion('inputs', 'i1')
      if (live && rand() < 0.3) {
        core.commit(cmd([{ collection: 'inputs', id: 'i1', op: 'delete', before: snap!.value, after: null, baseVersion: base }]))
      } else {
        core.commit(cmd([{ collection: 'inputs', id: 'i1', op: 'put', before: live ? snap!.value : null, after: { person: 'P' + step }, baseVersion: base }]))
      }
      // INVARIANT: the leavewar cell mirrors the input exactly, after every command
      const inp = core.read('inputs', 'i1')
      const cell = core.read('leavewar', 'p1/d1')
      if (!inp || inp.deleted) {
        expect(!cell || cell.deleted).toBe(true)
      } else {
        expect(cell!.deleted).toBe(false)
        expect(cell!.value).toEqual({ from: (inp.value as { person: string }).person })
      }
    }
    checkStructuralInvariants(core)
  })

  it('undo restores the prior observable state (round-trip) and keeps invariants', () => {
    const core = new CommandCore()
    core.commit(cmd([{ collection: 'inputs', id: 'a', op: 'put', before: null, after: { v: 1 }, baseVersion: 0 }]))
    const beforeSecond = core.read('inputs', 'a')!.value
    core.commit(cmd([{ collection: 'inputs', id: 'a', op: 'put', before: { v: 1 }, after: { v: 2 }, baseVersion: 1 }]))
    // undo the second command
    const entry = core.stream().at(-1)!
    const r = core.commit(cmd(inverseChanges(entry.causalChanges, core)))
    expect(r.ok).toBe(true)
    expect(core.read('inputs', 'a')!.value).toEqual(beforeSecond) // value restored
    expect(core.currentVersion('inputs', 'a')).toBe(3)            // via a fresh version, not a rewind
    checkStructuralInvariants(core)
  })
})
