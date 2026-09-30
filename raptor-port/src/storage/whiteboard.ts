// src/storage/whiteboard.ts
/* THE WHITEBOARD — the app's working memory, made explicit. Synchronous,
   instant, never throws, never waits. Filled once at boot from
   Backend.loadAll(); everything above it (engine, undo, Leave War sync,
   Tracker) keeps today's synchronous assumptions. The postman subscribes
   here and is the only thing that ever talks to a backend after boot.

   GROUPS ([ARCH-STACK-4] phase 0, design §19–§23). Listeners receive GROUPS,
   not single changes. Outside a transaction every set/delete is its own
   one-entry group (boot, legacy import, reset, seeds — idempotent writes).
   Inside `transaction()` — the command layer opens ONE per outermost command —
   set/delete update the map at once (readers see the new value) but emit
   nothing; at `commit()` the whiteboard emits ONE group = every key whose value
   now differs from its value when the transaction opened (the command's NET
   change, however many times a key was rewritten or by whom). So one command
   reaches storage all-or-nothing. `abort()` and `rollbackTo(savepoint)` put
   touched keys back and emit nothing — a refused command leaves NOTHING in
   storage (§21.1: a store's own rollback resets memory only and never
   re-persists, so the whiteboard has to undo its own writes).

   THE SEAL ([DB-READINESS] group A, phase 4.1 — plan §2.7). One saved group is
   one user action with its causal children, and it carries ONE change-log batch
   (`changes/<batchId>`, the design's `ChangeBatch`) naming every other row in it.
   `setSealer(fn)` installs the one function that builds it: at the outermost
   commit, when the net change is not empty, the sealer is handed the group and
   answers the entries to add — the batch, and any old batch it retires — which
   are written to the map and sent IN THE SAME group, so a batch never reaches
   storage apart from the rows it names. A write outside a transaction (its own
   one-entry group) is never sealed: those are named writers, listed in the
   phase-4.1 test. The whiteboard knows nothing of commands; the state layer's
   sealer does (state/changebatch.ts). */
import { type Collection, type Entry, type Snapshot, emptySnapshot, recordKey, splitKey } from './backend'

export type Change = Entry
export type Listener = (group: Change[]) => void
/** the seal: handed a transaction's net change, answers the entries to add to it (or nothing) */
export type Sealer = (group: readonly Change[]) => Change[] | null

/* the value each key held when a transaction / savepoint first saw it touched;
   undefined = the key did not exist */
type Before = Map<string, string | undefined>
export type Savepoint = { readonly before: Before }

export interface WbTransaction {
  /** §22.1 — every pipeline (the outermost and each drained one) takes one */
  savepoint(): Savepoint
  /** a pipeline refused before its seal: its writes (and only its) go back */
  rollbackTo(sp: Savepoint): void
  /** a pipeline that finished: stop tracking, keep its writes */
  release(sp: Savepoint): void
  /** emit the net change as ONE group (nothing when the net is empty) */
  commit(): void
  /** put every touched key back to its opening value, emit nothing */
  abort(): void
}

export class Whiteboard {
  private map = new Map<string, string>()
  private listeners = new Set<Listener>()
  private open: Before | null = null        // the transaction's opening values
  private depth = 0                          // nested transaction() calls join the outer one
  private points: Before[] = []              // live savepoints, oldest first
  private sealer: Sealer | null = null
  /* each collection's ids, kept beside the map ([DB-READINESS] group A, phase 4): a record kept one row per thing is found
     by listing its collection, on every command (the settings store's guard) — never by scanning every key stored */
  private ids = new Map<string, Set<string>>()

  /** install (or remove, with null) the one sealer every transaction group passes through */
  setSealer(fn: Sealer | null): void { this.sealer = fn }

  /* the ONE pair of raw map writes — the map and the per-collection ids move together */
  private put(k: string, v: string): void {
    if (!this.map.has(k)) { const i = k.indexOf('/'); const c = k.slice(0, i); let s = this.ids.get(c); if (!s) this.ids.set(c, s = new Set()); s.add(k.slice(i + 1)) }
    this.map.set(k, v)
  }
  private drop(k: string): void {
    if (!this.map.delete(k)) return
    const i = k.indexOf('/'); this.ids.get(k.slice(0, i))?.delete(k.slice(i + 1))
  }

  fill(snap: Snapshot): void {
    this.map.clear()
    this.ids.clear()
    for (const c of Object.keys(snap) as Collection[]) {
      for (const id of Object.keys(snap[c])) this.put(recordKey(c, id), snap[c][id])
    }
  }

  get(collection: Collection, id: string): string | null {
    return this.map.get(recordKey(collection, id)) ?? null
  }

  has(collection: Collection, id: string): boolean {
    return this.map.has(recordKey(collection, id))
  }

  keys(collection: Collection): string[] {
    const s = this.ids.get(collection)
    return s ? [...s] : []
  }

  /** true when the stored value changed (a same-value set is silent). */
  set(collection: Collection, id: string, value: string): boolean {
    const k = recordKey(collection, id)
    if (this.map.get(k) === value) return false
    this.touch(k)
    this.put(k, value)
    if (!this.open) this.emit([{ collection, id, value }])
    return true
  }

  delete(collection: Collection, id: string): boolean {
    const k = recordKey(collection, id)
    if (!this.map.has(k)) return false
    this.touch(k)
    this.drop(k)
    if (!this.open) this.emit([{ collection, id, value: null }])
    return true
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn)
    return () => { this.listeners.delete(fn) }
  }

  snapshot(): Snapshot {
    const snap = emptySnapshot()
    for (const [k, v] of this.map) {
      const i = k.indexOf('/')
      const c = k.slice(0, i) as Collection
      if (snap[c]) snap[c][k.slice(i + 1)] = v
    }
    return snap
  }

  inTransaction(): boolean { return this.open !== null }

  /** Open (or join) a transaction. A nested call joins the outer one: its
      commit is a no-op and its abort rolls back only what was written since it
      joined — only the outermost commit emits. */
  transaction(): WbTransaction {
    if (this.open) {
      this.depth++
      const sp = this.savepoint()
      let done = false
      const finish = () => { if (!done) { done = true; this.depth-- } }
      return {
        savepoint: () => this.savepoint(),
        rollbackTo: p => this.rollbackTo(p),
        release: p => this.release(p),
        commit: () => { if (done) return; this.release(sp); finish() },
        abort: () => { if (done) return; this.rollbackTo(sp); finish() },
      }
    }
    const open: Before = new Map()
    this.open = open
    this.depth = 1
    this.points = []
    let done = false
    return {
      savepoint: () => this.savepoint(),
      rollbackTo: p => this.rollbackTo(p),
      release: p => this.release(p),
      commit: () => {
        if (done) return
        done = true
        const group: Change[] = []
        for (const [k, was] of open) {
          const now = this.map.get(k)
          if (now === was) continue                 // rewritten back to where it started: not a change
          const [collection, id] = splitKey(k)
          group.push({ collection, id, value: now ?? null })
        }
        this.close()
        /* the seal: its entries go into the map and the SAME group (closed first, so they are plain writes) */
        if (group.length && this.sealer) {
          let extra: Change[] | null = null
          try { extra = this.sealer(group) } catch (e) { console.error('whiteboard sealer threw — group sent without a batch', e) }
          for (const e of extra ?? []) {
            const k = recordKey(e.collection, e.id)
            if (e.value === null) { if (!this.map.has(k)) continue; this.drop(k) }
            else { if (this.map.get(k) === e.value) continue; this.put(k, e.value) }
            group.push(e)
          }
        }
        if (group.length) this.emit(group)
      },
      abort: () => {
        if (done) return
        done = true
        this.restore(open)
        this.close()
      },
    }
  }

  private close(): void { this.open = null; this.depth = 0; this.points = [] }

  private savepoint(): Savepoint {
    const before: Before = new Map()
    if (this.open) this.points.push(before)
    return { before }
  }

  private rollbackTo(sp: Savepoint): void {
    this.restore(sp.before)
    this.release(sp)
  }

  private release(sp: Savepoint): void {
    const i = this.points.indexOf(sp.before)
    if (i >= 0) this.points.splice(i)          // it and every savepoint taken after it
  }

  /* record a key's pre-write value in the transaction and every live savepoint
     that has not seen it yet (first touch wins — that IS the "before") */
  private touch(k: string): void {
    if (!this.open) return
    const was = this.map.get(k)
    if (!this.open.has(k)) this.open.set(k, was)
    for (const p of this.points) if (!p.has(k)) p.set(k, was)
  }

  /* raw map writes — a restore is not itself a change anyone must hear about */
  private restore(before: Before): void {
    for (const [k, was] of before) {
      if (was === undefined) this.drop(k)
      else this.put(k, was)
    }
  }

  private emit(group: Change[]): void {
    for (const l of [...this.listeners]) {
      try { l(group) } catch (e) { console.error('whiteboard listener threw', e) }
    }
  }
}
