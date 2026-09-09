// src/storage/whiteboard.ts
/* THE WHITEBOARD — the app's working memory, made explicit. Synchronous,
   instant, never throws, never waits. Filled once at boot from
   Backend.loadAll(); everything above it (engine, undo, Leave War sync,
   Tracker) keeps today's synchronous assumptions. The postman subscribes
   here and is the only thing that ever talks to a backend after boot. */
import { type Collection, type Snapshot, emptySnapshot, recordKey } from './backend'

export type Change = { collection: Collection; id: string; value: string | null }
export type Listener = (change: Change) => void

export class Whiteboard {
  private map = new Map<string, string>()
  private listeners = new Set<Listener>()

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
    this.map.set(k, value)
    this.emit({ collection, id, value })
    return true
  }

  delete(collection: Collection, id: string): boolean {
    const k = recordKey(collection, id)
    if (!this.map.has(k)) return false
    this.map.delete(k)
    this.emit({ collection, id, value: null })
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

  private emit(change: Change): void {
    for (const l of [...this.listeners]) {
      try { l(change) } catch (e) { console.error('whiteboard listener threw', e) }
    }
  }
}
