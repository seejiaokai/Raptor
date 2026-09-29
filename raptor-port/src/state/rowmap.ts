// src/state/rowmap.ts
/* THE ROW MAPPER AND THE STREAM CONSUMER ([DB-READINESS] group A, phase 0 — plan §2.2; Astra A-03,
   R2-03). This is the command layer's long-planned "fold subscriber" (command/registry.ts header,
   docs/undo-contract.md §0), built.

   Group A makes every stored record one row of one table in the design. Rows are written FROM THE
   COMMAND STREAM: at phase 9 of every command — after its envelope exists, before its outer whiteboard
   transaction seals — each change the command made to a logical record is mapped through ONE pure
   function to the stored row(s) it lives in, and written to the whiteboard inside that transaction, so
   the rows reach storage in the command's ONE all-or-nothing group.

   Two rules the design stands on:
   - a row is REMOVED only for an explicit `delete` change — a mapper that answers a put with a remove
     is refused, so no row is ever deleted by inference (a stale client editing one record can never
     remove another);
   - the same stored row named twice in one envelope: a put beats a remove, and the later put wins.

   Phase 0 registers NO mapper: the consumer is wired and runs, and writes nothing. Each later phase
   registers its own logical collection's mapper (phase 1 the schedule, 2 inputs / people / the
   planning calendar, 3 the Leave War, 5b the Tracker) as it stops writing that collection's big blob. */
import type { Collection } from '../storage/backend'
import type { Whiteboard } from '../storage/whiteboard'
import type { Change, CommitEnvelope, LogicalCollection } from '../command/types'
import { onCommit } from '../command'

/** one stored row to write: a value, or null = remove it */
export type RowWrite = { collection: Collection; id: string; value: string | null }
export type Mapper = (c: Change) => RowWrite[]

const MAPPERS = new Map<LogicalCollection, Mapper>()

export function mappedCollections(): LogicalCollection[] { return [...MAPPERS.keys()] }

/** the stored rows one logical change lands in ([] for a collection no phase maps yet) */
export function mapChange(c: Change): RowWrite[] {
  const m = MAPPERS.get(c.collection)
  if (!m) return []
  const rows = m(c)
  if (c.op === 'put' && rows.some(r => r.value === null)) {
    throw new Error(`rowmap: the ${c.collection} mapper removed a row for a put of ${c.id} — a row is removed only by an explicit delete`)
  }
  return rows
}

/** every row one envelope's changes land in, each stored row once (a put beats a remove; the later put wins) */
export function mapEnvelope(changes: readonly Change[]): RowWrite[] {
  const out = new Map<string, RowWrite>()
  for (const c of changes) {
    for (const r of mapChange(c)) {
      const k = `${r.collection}/${r.id}`
      const had = out.get(k)
      if (had && had.value !== null && r.value === null) continue
      out.delete(k)
      out.set(k, r)
    }
  }
  return [...out.values()]
}

/** Subscribe the consumer to the command stream; returns the unsubscribe. Called once, from wirePersist. */
export function wireRowConsumer(wb: Whiteboard): () => void {
  return onCommit((env: CommitEnvelope) => {
    if (env.emit === false) return                   // a remote change applies silently — never echoed back (design §3.3)
    for (const r of mapEnvelope(env.changes)) {
      if (r.value === null) wb.delete(r.collection, r.id)
      else wb.set(r.collection, r.id, r.value)
    }
  })
}

/** test-only */
export function _setMapperForTest(c: LogicalCollection, m: Mapper): void { MAPPERS.set(c, m) }
export function _clearMappersForTest(): void { MAPPERS.clear() }
