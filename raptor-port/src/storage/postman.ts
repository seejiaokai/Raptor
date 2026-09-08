// src/storage/postman.ts
/* THE POSTMAN — write behind. Watches the whiteboard; every change is a
   letter to the backend. Rules (spec §postman): coalesce per record for
   300 ms (rapid edits to one record collapse into one letter; different
   records never merge); one send in flight per record, in order; on
   failure back off 1s → 2s → 4s … capped at 30s, for ever, never rolling
   the whiteboard back; one status value for the header indicator. */
import type { Backend } from './backend'
import { recordKey } from './backend'
import type { Change, Whiteboard } from './whiteboard'

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'failed'
export type PostmanOptions = { coalesceMs: number; maxBackoffMs: number }

export class Postman {
  private pending = new Map<string, Change>()
  private timers = new Map<string, ReturnType<typeof setTimeout>>()
  private inflight = new Set<string>()
  private failed = new Map<string, number>()
  private listeners = new Set<(s: SaveStatus) => void>()
  private unsub: (() => void) | null = null
  private last: SaveStatus = 'saved'
  private opts: PostmanOptions

  constructor(private backend: Backend, opts?: Partial<PostmanOptions>) {
    this.opts = { coalesceMs: 300, maxBackoffMs: 30000, ...opts }
  }

  attach(wb: Whiteboard): void { this.unsub = wb.subscribe(ch => this.enqueue(ch)) }
  detach(): void { this.unsub?.(); this.unsub = null }

  get status(): SaveStatus {
    if (this.failed.size) return 'failed'
    if (this.inflight.size) return 'saving'
    if (this.pending.size) return 'unsaved'
    return 'saved'
  }
  onStatus(fn: (s: SaveStatus) => void): () => void {
    this.listeners.add(fn)
    return () => { this.listeners.delete(fn) }
  }
  hasWork(): boolean { return this.pending.size > 0 || this.inflight.size > 0 || this.failed.size > 0 }

  /** send everything queued now, ignoring the coalesce wait */
  async flush(): Promise<void> {
    const keys = [...this.pending.keys()]
    for (const k of keys) this.clearTimer(k)
    await Promise.all(keys.map(k => this.send(k)))
  }

  private enqueue(ch: Change): void {
    const key = recordKey(ch.collection, ch.id)
    this.pending.set(key, ch)
    this.clearTimer(key)
    if (!this.inflight.has(key)) this.timers.set(key, setTimeout(() => { void this.send(key) }, this.opts.coalesceMs))
    this.notify()
  }

  private clearTimer(key: string): void {
    const t = this.timers.get(key)
    if (t !== undefined) { clearTimeout(t); this.timers.delete(key) }
  }

  private async send(key: string): Promise<void> {
    this.timers.delete(key)
    if (this.inflight.has(key)) return            // the running send re-checks pending when done
    const ch = this.pending.get(key)
    if (!ch) return
    this.pending.delete(key)
    this.inflight.add(key)
    this.notify()
    try {
      if (ch.value === null) await this.backend.remove(ch.collection, ch.id)
      else await this.backend.put(ch.collection, ch.id, ch.value)
      this.failed.delete(key)
    } catch (e) {
      const n = (this.failed.get(key) ?? 0) + 1
      this.failed.set(key, n)
      if (!this.pending.has(key)) this.pending.set(key, ch)   // a newer value, if any, wins
      this.clearTimer(key)
      const delay = Math.min(this.opts.maxBackoffMs, 1000 * 2 ** (n - 1))
      this.inflight.delete(key)
      this.timers.set(key, setTimeout(() => { void this.send(key) }, delay))
      this.notify()
      return
    }
    this.inflight.delete(key)
    if (this.pending.has(key) && !this.timers.has(key)) {
      this.timers.set(key, setTimeout(() => { void this.send(key) }, this.opts.coalesceMs))
    }
    this.notify()
  }

  private notify(): void {
    const s = this.status
    if (s === this.last) return
    this.last = s
    for (const l of [...this.listeners]) { try { l(s) } catch (e) { console.error('postman listener threw', e) } }
  }
}
