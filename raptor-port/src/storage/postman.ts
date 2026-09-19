// src/storage/postman.ts
/* THE POSTMAN — write behind. Watches the whiteboard and sends what changed to
   the backend.

   GROUPS, ONE AT A TIME ([ARCH-STACK-4] phase 0, design §20.2). The whiteboard
   hands over GROUPS (one per command — its net change). The postman keeps at
   most ONE group in flight and ONE accumulating pending group:
   - a new group MERGES into pending, latest value per key winning. Merging two
     consecutive net changes gives the net change over both, so pending is
     always a consistent world, never half of one command;
   - pending is sent after a 300 ms coalesce wait, as ONE `putMany`;
   - a failed group is merged UNDER pending (pending's newer values win) and
     the result retries with backoff 1s → 2s → 4s … capped at 30s, for ever,
     never rolling the whiteboard back. So a retry is always a superset of the
     group that failed — which is what lets the backend's single journal only
     ever be replaced by a superset (§20.3).
   One status value for the header indicator. */
import type { Backend, Entry } from './backend'
import { recordKey } from './backend'
import type { Change, Whiteboard } from './whiteboard'

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'failed'
export type PostmanOptions = {
  coalesceMs: number
  maxBackoffMs: number
  /** §21.2 — a group the boot replay could not finish: it starts as a FAILED
      group (status "failed" until it lands) and every later write merges over it */
  initialFailed?: Entry[] | null
}

export class Postman {
  private pending = new Map<string, Change>()
  private inflight: Promise<void> | null = null
  private failures = 0
  private timer: ReturnType<typeof setTimeout> | undefined
  private listeners = new Set<(s: SaveStatus) => void>()
  private unsub: (() => void) | null = null
  private last: SaveStatus = 'saved'
  private opts: PostmanOptions

  constructor(private backend: Backend, opts?: Partial<PostmanOptions>) {
    this.opts = { coalesceMs: 300, maxBackoffMs: 30000, ...opts }
    const seed = this.opts.initialFailed
    if (seed && seed.length) {
      for (const e of seed) this.pending.set(recordKey(e.collection, e.id), e)
      this.failures = 1
      this.last = 'failed'
      this.arm(this.backoff())
    }
  }

  attach(wb: Whiteboard): void { this.unsub = wb.subscribe(g => this.enqueue(g)) }
  detach(): void { this.unsub?.(); this.unsub = null }

  get status(): SaveStatus {
    if (this.failures) return 'failed'
    if (this.inflight) return 'saving'
    if (this.pending.size) return 'unsaved'
    return 'saved'
  }
  onStatus(fn: (s: SaveStatus) => void): () => void {
    this.listeners.add(fn)
    return () => { this.listeners.delete(fn) }
  }
  hasWork(): boolean { return this.pending.size > 0 || this.inflight !== null || this.failures > 0 }

  /** send everything queued now, ignoring the coalesce (and backoff) wait. With
      the browser backend the group is written synchronously inside this call,
      which is what makes a pagehide flush safe (§21.4). */
  async flush(): Promise<void> {
    this.disarm()
    if (this.inflight) await this.inflight
    if (this.pending.size) await this.send()
  }

  private enqueue(group: Change[]): void {
    if (!group.length) return
    for (const ch of group) {
      const key = recordKey(ch.collection, ch.id)
      this.pending.delete(key)                  // re-insert: keep "last touched" order
      this.pending.set(key, ch)
    }
    /* waiting out a backoff keeps its timer (a fresh write does not skip it);
       otherwise a new write restarts the coalesce wait */
    if (!this.inflight && !this.failures) this.arm(this.opts.coalesceMs)
    this.notify()
  }

  private arm(ms: number): void {
    this.disarm()
    this.timer = setTimeout(() => { this.timer = undefined; void this.send() }, ms)
  }
  private disarm(): void {
    if (this.timer !== undefined) { clearTimeout(this.timer); this.timer = undefined }
  }
  private backoff(): number {
    return Math.min(this.opts.maxBackoffMs, 1000 * 2 ** Math.max(0, this.failures - 1))
  }

  private send(): Promise<void> {
    if (this.inflight) return this.inflight      // the running send re-checks pending when done
    if (!this.pending.size) return Promise.resolve()
    this.disarm()
    const group = [...this.pending.values()]
    this.pending = new Map()
    const run = (async () => {
      let ok = true
      try {
        await this.backend.putMany(group)
      } catch (e) {
        ok = false
        /* merge the failed group UNDER whatever arrived meanwhile: pending's
           newer values win, and the retry is a superset of the failed group */
        const merged = new Map<string, Change>()
        for (const ch of group) merged.set(recordKey(ch.collection, ch.id), ch)
        for (const [k, ch] of this.pending) { merged.delete(k); merged.set(k, ch) }
        this.pending = merged
        this.failures += 1
      }
      this.inflight = null
      if (ok) {
        this.failures = 0
        if (this.pending.size) this.arm(this.opts.coalesceMs)
      } else {
        this.arm(this.backoff())
      }
      this.notify()
    })()
    this.inflight = run
    this.notify()
    return run
  }

  private notify(): void {
    const s = this.status
    if (s === this.last) return
    this.last = s
    for (const l of [...this.listeners]) { try { l(s) } catch (e) { console.error('postman listener threw', e) } }
  }
}
