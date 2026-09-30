// src/state/changebatch.ts
/* THE CHANGE LOG — ONE BATCH PER SAVED GROUP ([DB-READINESS] group A, phase 4.1 — plan §2.7; data-model.md §9, "The
   change log"; Astra R2-05, Fable F2-01/F2-03, F3-10).

   In the database every command's changeset also writes one `ChangeBatch` row, and the 30-second check reads that ONE
   table to learn which rows other people changed — then re-reads those rows once and redraws once. The batch is a PURE
   INVALIDATION LOG: it names rows, never their values or versions:

     changes/<clientBootId>-<first seq>  =  { type, seqs, actorId, at, items: [{ table, key, op }] }

   - ONE saved group = one user action with its causal children = ONE batch. The command layer opens one whiteboard
     transaction per outermost command and everything the action causes (its reducer, its follow-ups drained after it)
     lands inside it; the whiteboard hands the group to the sealer below just before it is sent, and the batch rides in
     the SAME group (storage/whiteboard.ts, the seal) — so a batch never reaches storage without the rows it names.
   - `items` — every other row of the group: its table (storage/tables.ts), its stored key, `put` or `delete` (a delete
     is the tombstone the adapter writes — group B).
   - `seqs` — every command envelope that ran in the group, in order (a user commit raised during delivery joins the
     group but stays its own Undo step); `type` — the OUTERMOST command's, and `actorId` its actor's: the one who acted.
     When that command changed nothing itself and only what it drained did, the batch is named after the first seq that
     landed (F3-10). A group opened by no command (the first boot's own group — storage/schema.ts openBootGroup) is
     `boot`, by the system.
   - `<clientBootId>` (storage/client.ts) is per page life, so two tabs whose command counters both start at 0 never write
     the same batch key.
   - A group written OUTSIDE any transaction is never sealed: each such writer is named, with its reason, in the phase-4.1
     test (state/changebatch-rollcall.test.ts).

   THE STAND-IN KEEPS THE NEWEST 200. The database purges old batches after its change-tracking token's lifetime (§9);
   one browser keeps a count instead, retiring the oldest in the same group that adds the newest — never a separate
   write. A retired batch is not an item of the new one: a batch names data rows only.

   The postman still merges consecutive groups into one send (storage/postman.ts, the pagehide flush relies on it); every
   batch in a merged send survives it. Group B must replace that merge before promising one changeset per command on the
   wire (plan §2.7). */
import type { Whiteboard, Change as WbChange } from '../storage/whiteboard'
import { tableOf } from '../storage/tables'
import { clientBootId } from '../storage/client'
import { onCommit, setTxnWrapper, type TxnInfo, type TxnWrapper } from '../command'

export type BatchItem = { table: string; key: string; op: 'put' | 'delete' }
export type Batch = { type: string; seqs: number[]; actorId: string; at: string; items: BatchItem[] }

const DEFAULT_CAP = 200
let CAP = DEFAULT_CAP
/** test-only: a smaller cap (null = the stand-in's own) */
export function _setBatchCapForTest(n: number | null): void { CAP = n ?? DEFAULT_CAP }

let wired: Whiteboard | null = null
let unsub: (() => void) | null = null
/* the group being built: who opened it, and every envelope that landed in it */
let OPENED: { type: string; actorId: string } | null = null
let SEQS: number[] = []
let NOSEQ = 0
/* the batches in storage, oldest first — read once at wiring, kept as the sealer adds and retires them */
let KEPT: Array<{ id: string; at: string }> = []

const byAge = (a: { id: string; at: string }, b: { id: string; at: string }) => (a.at < b.at ? -1 : a.at > b.at ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0)

function sealer(group: readonly WbChange[]): WbChange[] | null {
  const items: BatchItem[] = []
  for (const c of group) {
    if (c.collection === 'changes') continue
    items.push({ table: tableOf(c.collection, c.id), key: `${c.collection}/${c.id}`, op: c.value === null ? 'delete' : 'put' })
  }
  const opened = OPENED, seqs = SEQS.slice().sort((a, b) => a - b)
  OPENED = null; SEQS = []
  if (!items.length) return null
  const id = `${clientBootId()}-${seqs.length ? seqs[0] : 'g' + ++NOSEQ}`
  const at = new Date().toISOString()
  const batch: Batch = { type: opened ? opened.type : 'boot', seqs, actorId: opened ? opened.actorId : 'system', at, items }
  const out: WbChange[] = [{ collection: 'changes', id, value: JSON.stringify(batch) }]
  KEPT.push({ id, at })
  while (KEPT.length > CAP) out.push({ collection: 'changes', id: KEPT.shift()!.id, value: null })
  return out
}

/* the command layer's transaction door, wrapped: the OUTERMOST dispatch says who opened the group (a nested one joins
   the group already open and says nothing) */
function wrapperFor(wb: Whiteboard): TxnWrapper {
  return {
    transaction(info?: TxnInfo) {
      if (!wb.inTransaction()) {
        OPENED = info ? { type: info.type, actorId: String(info.actor?.id ?? 'system') } : null
        SEQS = []
      }
      return wb.transaction()
    },
  }
}

/** Wire the change log to the whiteboard the app boots on: the command layer's transactions, the sealer, and the
    envelope collector. Idempotent — called by the stream consumer's wiring (state/persist.ts wireRows). */
export function wireChangeBatches(wb: Whiteboard): void {
  if (wired === wb) return
  wired = wb
  OPENED = null; SEQS = []
  KEPT = []
  for (const id of wb.keys('changes')) {
    let at = ''
    try { const v = JSON.parse(wb.get('changes', id) || 'null'); if (v && typeof v.at === 'string') at = v.at } catch { /* an unreadable batch is the oldest */ }
    KEPT.push({ id, at })
  }
  KEPT.sort(byAge)
  setTxnWrapper(wrapperFor(wb))
  wb.setSealer(sealer)
  unsub?.()
  /* every envelope that lands inside a group is one of its seqs (a remote one applies silently and is never echoed back
     — design §3.3) */
  unsub = onCommit(env => { if (env.emit !== false && wb.inTransaction()) SEQS.push(env.seq) })
}
