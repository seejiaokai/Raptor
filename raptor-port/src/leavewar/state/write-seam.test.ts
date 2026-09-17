/* [CMDL-FINISH] P2 — the Leave War per-record write() seam (§3, F8/GU-007).
   Proves: cell/bid/war/config records round-trip through write(), put + delete
   both land, and the durable-version signature advances. write() clones the
   state, applies every entry, republishes the derived top-level fields, and
   defers persist+notify to the transaction boundary. Runs in the LW project
   (fixed TZ + jsdom). */
import { beforeEach, describe, expect, it } from 'vitest'
import { initStore, getState, lwStore } from './store'
import { memoryBackend } from './storage'
import { commit, definePermission, anyone, isOk } from '../../command'
import type { RecordEntry, CommitResult } from '../../command'

beforeEach(() => {
  initStore(memoryBackend())
  definePermission('test.restore', anyone)
})

function restore(entries: RecordEntry[]): CommitResult {
  return commit({
    type: 'test.restore', scope: { module: 'lw', warId: getState().period.id },
    apply: (txn) => { txn.enlist(lwStore); lwStore.write!(entries) },
  })
}

describe('LW write() — cell round-trip + create->delete', () => {
  it('puts a cell into the current war then deletes it', () => {
    const warId = getState().period.id
    const pid = getState().people[0].id
    const id = `${warId}:${pid}:2026-01-20`
    let r = restore([{ collection: 'lw.cell', id, value: 'LL', op: 'put' }])
    expect(isOk(r)).toBe(true)
    expect(getState().grid[pid]['2026-01-20']).toBe('LL')
    r = restore([{ collection: 'lw.cell', id, op: 'delete' }])
    expect(isOk(r)).toBe(true)
    expect(getState().grid[pid]?.['2026-01-20']).toBeUndefined()
  })

  it('round-trips the whole record set (records -> write -> identical records)', () => {
    // seed a couple of cells so the set is non-trivial
    const warId = getState().period.id
    const pid = getState().people[0].id
    restore([{ collection: 'lw.cell', id: `${warId}:${pid}:2026-01-21`, value: 'AL', op: 'put' }])
    const before = lwStore.records()
    const entries: RecordEntry[] = [...before.values()].map(e => ({ collection: e.collection, id: e.id, value: e.value, op: 'put' }))
    const r = restore(entries)
    expect(isOk(r)).toBe(true)
    const after = lwStore.records()
    expect([...after.keys()].sort()).toEqual([...before.keys()].sort())
    expect(after.get(`lw.cell/${warId}:${pid}:2026-01-21`)!.value).toBe('AL')
  })

  it('advances the durable-version signature on a persist', () => {
    const s0 = lwStore.signature!()
    restore([{ collection: 'lw.cell', id: `${getState().period.id}:${getState().people[0].id}:2026-01-22`, value: 'LL', op: 'put' }])
    expect(lwStore.signature!()).not.toBe(s0)
  })
})
