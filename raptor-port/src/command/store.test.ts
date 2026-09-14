import { describe, it, expect } from 'vitest'
import { RecordStore } from './store'
import type { Change } from './types'

const put = (collection: string, id: string, after: unknown, baseVersion: number, before: unknown = null): Change =>
  ({ collection, id, op: 'put', before, after, baseVersion })
const del = (collection: string, id: string, before: unknown, baseVersion: number): Change =>
  ({ collection, id, op: 'delete', before, after: null, baseVersion })

describe('RecordStore — versioned in-memory substrate', () => {
  it('reports version 0 / null snapshot for a record that never existed', () => {
    const s = new RecordStore()
    expect(s.currentVersion('inputs', 'i1')).toBe(0)
    expect(s.snapshot('inputs', 'i1')).toBeNull()
  })

  it('a create yields version 1 and a live snapshot', () => {
    const s = new RecordStore()
    const v = s.apply(put('inputs', 'i1', { a: 1 }, 0))
    expect(v).toBe(1)
    expect(s.currentVersion('inputs', 'i1')).toBe(1)
    expect(s.snapshot('inputs', 'i1')).toEqual({ value: { a: 1 }, version: 1, deleted: false })
  })

  it('an update increments the version and replaces the value', () => {
    const s = new RecordStore()
    s.apply(put('inputs', 'i1', { a: 1 }, 0))
    const v = s.apply(put('inputs', 'i1', { a: 2 }, 1, { a: 1 }))
    expect(v).toBe(2)
    expect(s.snapshot('inputs', 'i1')).toEqual({ value: { a: 2 }, version: 2, deleted: false })
  })

  it('a delete leaves a tombstone at a higher version (value null, deleted true)', () => {
    const s = new RecordStore()
    s.apply(put('inputs', 'i1', { a: 1 }, 0))
    const v = s.apply(del('inputs', 'i1', { a: 1 }, 1))
    expect(v).toBe(2)
    expect(s.snapshot('inputs', 'i1')).toEqual({ value: null, version: 2, deleted: true })
    expect(s.currentVersion('inputs', 'i1')).toBe(2) // NOT back to 0 — tombstone keeps the version
  })

  it('restoring a deleted record assigns a FRESH higher version, never reuses the pre-delete one (RC4-306)', () => {
    const s = new RecordStore()
    s.apply(put('inputs', 'i1', { a: 1 }, 0)) // v1
    s.apply(del('inputs', 'i1', { a: 1 }, 1)) // v2 tombstone
    const v = s.apply(put('inputs', 'i1', { a: 1 }, 2)) // restore prior VALUE
    expect(v).toBe(3) // fresh version — a stale baseVersion 1 must never pass a later conflict check
    expect(s.snapshot('inputs', 'i1')).toEqual({ value: { a: 1 }, version: 3, deleted: false })
  })

  it('versions are strictly monotonic per record across every op', () => {
    const s = new RecordStore()
    const versions = [
      s.apply(put('inputs', 'i1', 1, 0)),
      s.apply(put('inputs', 'i1', 2, 1)),
      s.apply(del('inputs', 'i1', 2, 2)),
      s.apply(put('inputs', 'i1', 3, 3)),
    ]
    expect(versions).toEqual([1, 2, 3, 4])
  })

  it('keys are isolated by (collection, id) — same id in two collections does not collide', () => {
    const s = new RecordStore()
    s.apply(put('inputs', 'x', 'A', 0))
    s.apply(put('people', 'x', 'B', 0))
    expect(s.snapshot('inputs', 'x')!.value).toBe('A')
    expect(s.snapshot('people', 'x')!.value).toBe('B')
  })

  it('snapshot returns a copy, not the live record (no external mutation)', () => {
    const s = new RecordStore()
    s.apply(put('inputs', 'i1', { a: 1 }, 0))
    const snap = s.snapshot('inputs', 'i1')!
    snap.version = 999
    expect(s.currentVersion('inputs', 'i1')).toBe(1)
  })
})
