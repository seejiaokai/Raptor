// @vitest-environment jsdom
/* [CMDL-FINISH] P2 — the Tracker per-record write() seam (§3, M1/R4-003/R4-004)
   + capture/restore of history & selection (R3-005). Proves: a marks record
   round-trips into the live `marks` let for the loaded course+syllabus, a delete
   removes it, and trkStore.capture/restore snapshot + restore the selection
   (`active`) and the durable-version signature advances. The full pointer-change
   re-derive is foundation consumed by the [GLOBAL-UNDO] step; the vendored smoke
   suite is the comprehensive behaviour check. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import * as core from './app/core.js'
import { commit, definePermission, anyone, isOk } from '../command'
import type { RecordEntry, CommitResult } from '../command'

let board: HTMLDivElement

beforeAll(async () => {
  board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board)
  await core.init()
})
afterAll(() => { board.remove() })
beforeEach(() => { definePermission('test.restore', anyone) })

function restore(entries: RecordEntry[]): CommitResult {
  return commit({
    type: 'test.restore', scope: { module: 'trk', courseId: (core as any).course, sylId: (core as any).curSylId() },
    apply: (txn) => { txn.enlist((core as any).trkStore); (core as any).trkStore.write(entries) },
  })
}

describe('Tracker write() — marks record round-trips into the live let', () => {
  it('puts then deletes a marks record for the loaded course+syllabus', () => {
    const c = (core as any).course, syl = (core as any).curSylId()
    const s = (core as any).active
    expect(s).toBeTruthy()
    const key = `v3:${c}:${syl}:m:${s}`
    let r = restore([{ collection: 'trk.marks', id: key, value: JSON.stringify({ 'ST-01': { g: 2 } }), op: 'put' }])
    expect(isOk(r)).toBe(true)
    expect((core as any).marks[s]).toEqual({ 'ST-01': { g: 2 } })
    r = restore([{ collection: 'trk.marks', id: key, op: 'delete' }])
    expect(isOk(r)).toBe(true)
    expect((core as any).marks[s]).toEqual({})   // absent record re-reads as empty
  })
})

describe('Tracker capture/restore — selection + signature (R3-005/C9)', () => {
  it('restore() puts back the selection captured before a mutation', () => {
    const store = (core as any).trkStore
    const before = (core as any).active
    const other = ((core as any).roster.find((r: any) => r.id !== before) || {}).id
    if (!other) return   // single-student roster — nothing to switch to
    const snap = store.capture()
    ;(core as any).setActive(other)
    expect((core as any).active).toBe(other)
    store.restore(snap)
    expect((core as any).active).toBe(before)   // selection restored (R3-005)
  })

  it('the durable-version signature advances on a write', () => {
    const store = (core as any).trkStore
    const s0 = store.signature()
    const c = (core as any).course, syl = (core as any).curSylId(), st = (core as any).active
    restore([{ collection: 'trk.marks', id: `v3:${c}:${syl}:m:${st}`, value: JSON.stringify({ 'ST-02': { g: 1 } }), op: 'put' }])
    expect(store.signature()).not.toBe(s0)
  })
})
