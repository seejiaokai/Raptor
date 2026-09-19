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
   re-persists, so the whiteboard has to undo its own writes). */
import { type Collection, type Entry, type Snapshot, emptySnapshot, recordKey, splitKey } from './backend'

export type Change = Entry
export type Listener = (group: Change[]) => void

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

  fill(snap: Snapshot): void {
    this.map.clear()
    for (const c of Object.keys(snap) as Collection[]) {
      for (const id of Object.keys(snap[c])) this.map.set(recordKey(c, id), snap[c][id])
    }
  }

  get(collection: Collection, id: string): string | null {
    return this.map.get(recordKey(collection, id)) ?? null
  }

  has(collection: Collection, id: string): boolean {
    return this.map.has(recordKey(collection, id))
  }

  keys(collection: Collection): string[] {
    const prefix = collection + '/'
    const out: string[] = []
    for (const k of this.map.keys()) if (k.startsWith(prefix)) out.push(k.slice(prefix.length))
    return out
  }

  /** true when the stored value changed (a same-value set is silent). */
  set(collection: Collection, id: string, value: string): boolean {
    const k = recordKey(collection, id)
    if (this.map.get(k) === value) return false
    this.touch(k)
    this.map.set(k, value)
    if (!this.open) this.emit([{ collection, id, value }])
    return true
  }

  delete(collection: Collection, id: string): boolean {
    const k = recordKey(collection, id)
    if (!this.map.has(k)) return false
    this.touch(k)
    this.map.delete(k)
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
      if (was === undefined) this.map.delete(k)
      else this.map.set(k, was)
    }
  }

  private emit(group: Change[]): void {
    for (const l of [...this.listeners]) {
      try { l(group) } catch (e) { console.error('whiteboard listener threw', e) }
    }
  }
}
