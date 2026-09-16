/* [ARCH-STACK] Step 2 — the record-oriented storage door contract + MemoryDoor
   test-double (design §3.6, §2.5).

   The Door is the ONE record-oriented storage seam later steps consume:
   get/put/delete(collection,id,{version}) + subscribe. A versioned put that
   loses the race is REJECTED (a 412-equivalent) so the caller re-reads —
   modelling the two-tab / shared-client conflict the Dataverse adapter faces at
   Step 5. At Step 2 the real backend is NOT attached (persistence stays legacy
   and additive); MemoryDoor exercises the conflict + atomicity contract in
   tests only.
*/
import type { LogicalCollection } from './types'
import { deepClone } from './util'

export interface DoorRecord {
  collection: LogicalCollection
  id: string
  value: unknown
  version: number
}
export type DoorResult =
  | { ok: true; version: number }
  | { ok: false; reason: 'conflict'; current: number }

export interface Door {
  get(collection: LogicalCollection, id: string): DoorRecord | undefined
  /* a put with `expect` set applies only if the stored version matches; a
     mismatch is a conflict (412), the caller re-reads. `expect` undefined =
     create-or-blind-overwrite (used by seed/restore). */
  put(collection: LogicalCollection, id: string, value: unknown, expect?: number): DoorResult
  delete(collection: LogicalCollection, id: string, expect?: number): DoorResult
  subscribe(fn: (rec: DoorRecord | { deleted: true; collection: LogicalCollection; id: string }) => void): () => void
}

export class MemoryDoor implements Door {
  private map = new Map<string, DoorRecord>()
  private subs: Array<(rec: any) => void> = []
  /* test knob: force the NEXT put/delete to conflict, to exercise the re-read
     path without a second live writer. */
  failNext = false

  private k(c: string, id: string) { return `${c}/${id}` }

  get(collection: LogicalCollection, id: string): DoorRecord | undefined {
    const r = this.map.get(this.k(collection, id))
    return r ? deepClone(r) : undefined
  }

  put(collection: LogicalCollection, id: string, value: unknown, expect?: number): DoorResult {
    const key = this.k(collection, id)
    const cur = this.map.get(key)
    if (this.failNext) { this.failNext = false; return { ok: false, reason: 'conflict', current: cur ? cur.version : 0 } }
    if (expect != null) {
      const curV = cur ? cur.version : 0
      if (curV !== expect) return { ok: false, reason: 'conflict', current: curV }
    }
    const version = (cur ? cur.version : 0) + 1
    const rec: DoorRecord = { collection, id, value: deepClone(value), version }
    this.map.set(key, rec)
    this.subs.forEach(f => f(deepClone(rec)))
    return { ok: true, version }
  }

  delete(collection: LogicalCollection, id: string, expect?: number): DoorResult {
    const key = this.k(collection, id)
    const cur = this.map.get(key)
    if (this.failNext) { this.failNext = false; return { ok: false, reason: 'conflict', current: cur ? cur.version : 0 } }
    if (expect != null) {
      const curV = cur ? cur.version : 0
      if (curV !== expect) return { ok: false, reason: 'conflict', current: curV }
    }
    this.map.delete(key)
    this.subs.forEach(f => f({ deleted: true, collection, id }))
    return { ok: true, version: cur ? cur.version : 0 }
  }

  subscribe(fn: (rec: any) => void): () => void {
    this.subs.push(fn)
    return () => { const i = this.subs.indexOf(fn); if (i >= 0) this.subs.splice(i, 1) }
  }

  /* test helper: current version of a record (0 = absent) */
  versionOf(collection: LogicalCollection, id: string): number {
    const r = this.map.get(this.k(collection, id))
    return r ? r.version : 0
  }
}
