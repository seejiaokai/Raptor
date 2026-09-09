// src/storage/memory.ts
/* THE MOCK DATABASE — what sits behind the whiteboard in development and in
   every test. A clean start every time, plus the knobs the timing tests turn:
   latency (the letter takes time), failNext (the post office is down),
   dropOne (a letter is lost but acknowledged), shuffle (letters arrive out
   of order), and a journal of every call for assertions. */
import { type Backend, type Collection, type Snapshot, emptySnapshot } from './backend'

export type JournalEntry = { op: 'loadAll' | 'put' | 'remove'; collection?: Collection; id?: string; at: number }

export class MemoryBackend implements Backend {
  latency = 0
  shuffle = false
  journal: JournalEntry[] = []
  private data: Snapshot = emptySnapshot()
  private failing = 0
  private dropping = 0
  private seq = 0

  seed(partial: Partial<Snapshot>): void {
    for (const c of Object.keys(partial) as Collection[]) Object.assign(this.data[c], partial[c])
  }
  failNext(n: number): void { this.failing = n }
  dropOne(): void { this.dropping += 1 }
  /** test-only read, no latency, no journal */
  peek(collection: Collection, id: string): string | null {
    return this.data[collection][id] ?? null
  }

  async loadAll(): Promise<Snapshot> {
    await this.wait()
    this.journal.push({ op: 'loadAll', at: ++this.seq })
    this.check()
    return JSON.parse(JSON.stringify(this.data))
  }

  async put(collection: Collection, id: string, json: string): Promise<void> {
    await this.wait()
    this.journal.push({ op: 'put', collection, id, at: ++this.seq })
    this.check()
    if (this.dropping > 0) { this.dropping -= 1; return }
    this.data[collection][id] = json
  }

  async remove(collection: Collection, id: string): Promise<void> {
    await this.wait()
    this.journal.push({ op: 'remove', collection, id, at: ++this.seq })
    this.check()
    delete this.data[collection][id]
  }

  private check(): void {
    if (this.failing > 0) { this.failing -= 1; throw new Error('MemoryBackend: simulated failure') }
  }

  private wait(): Promise<void> {
    const extra = this.shuffle && this.latency > 0 ? Math.floor(Math.random() * this.latency) : 0
    const ms = this.latency + extra
    return ms > 0 ? new Promise(r => setTimeout(r, ms)) : Promise.resolve()
  }
}
