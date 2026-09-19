// src/storage/memory.ts
/* THE MOCK DATABASE — what sits behind the whiteboard in development and in
   every test. A clean start every time, plus the knobs the timing tests turn:
   latency (the letter takes time), failNext (the post office is down),
   dropOne (a letter is lost but acknowledged), shuffle (letters arrive out
   of order), and a journal of every call for assertions. */
import { type Backend, type Collection, type Entry, type Snapshot, emptySnapshot } from './backend'

/* `group` numbers the putMany call an entry arrived in (one number per group),
   so a test can assert which records travelled together. */
export type JournalEntry = { op: 'loadAll' | 'put' | 'remove'; collection?: Collection; id?: string; at: number; group?: number }

export class MemoryBackend implements Backend {
  latency = 0
  shuffle = false
  journal: JournalEntry[] = []
  private data: Snapshot = emptySnapshot()
  private failing = 0
  private dropping = 0
  private seq = 0
  private groups = 0
  /* the all-or-nothing journal (§20.3), modelled the same way the Browser
     backend stores it, so one contract suite drives both */
  private txn: Entry[] | null = null
  private recovered: Entry[] | null = null
  private crashAfter: number | null = null
  private replayFailing = 0

  seed(partial: Partial<Snapshot>): void {
    for (const c of Object.keys(partial) as Collection[]) Object.assign(this.data[c], partial[c])
  }
  failNext(n: number): void { this.failing = n }
  /** the next putMany "crashes" after applying k entries: the journal stays,
      the call rejects — the tab died mid-apply */
  crashNextAfter(k: number): void { this.crashAfter = k }
  /** the next n boot replays of the journal fail (storage still full) */
  failReplay(n: number): void { this.replayFailing = n }
  /** test-only: the stored journal, or null */
  peekJournal(): Entry[] | null { return this.txn ? JSON.parse(JSON.stringify(this.txn)) : null }
  dropOne(): void { this.dropping += 1 }
  /** test-only read, no latency, no journal */
  peek(collection: Collection, id: string): string | null {
    return this.data[collection][id] ?? null
  }

  async loadAll(): Promise<Snapshot> {
    await this.wait()
    this.journal.push({ op: 'loadAll', at: ++this.seq })
    this.check()
    /* replay an unfinished group BEFORE reading anything (§19.4); if the replay
       fails, keep the journal and overlay it onto what is returned so the app
       boots on the acknowledged world (§20.3, FB5-02) */
    this.recovered = null
    if (this.txn) {
      if (this.replayFailing > 0) { this.replayFailing -= 1; this.recovered = this.txn }
      else { for (const e of this.txn) this.apply(e); this.txn = null }
    }
    const snap: Snapshot = JSON.parse(JSON.stringify(this.data))
    if (this.recovered) for (const e of this.recovered) {
      if (e.value === null) delete snap[e.collection][e.id]
      else snap[e.collection][e.id] = e.value
    }
    return snap
  }

  unfinished(): Entry[] | null { return this.recovered ? JSON.parse(JSON.stringify(this.recovered)) : null }

  async writeJournal(group: Entry[] | null): Promise<void> {
    this.check()
    this.txn = group && group.length ? JSON.parse(JSON.stringify(group)) : null
    this.recovered = this.txn
  }

  async putMany(entries: Entry[]): Promise<void> {
    await this.wait()
    const g = ++this.groups
    for (const e of entries) this.journal.push({ op: e.value === null ? 'remove' : 'put', collection: e.collection, id: e.id, at: ++this.seq, group: g })
    this.check()                                   // the journal write itself failed: nothing applied
    if (this.dropping > 0) { this.dropping -= 1; return }
    this.txn = JSON.parse(JSON.stringify(entries))
    const k = this.crashAfter
    this.crashAfter = null
    for (let i = 0; i < entries.length; i++) {
      if (k !== null && i >= k) throw new Error('MemoryBackend: simulated crash mid-apply')
      this.apply(entries[i])
    }
    this.txn = null
  }

  private apply(e: Entry): void {
    if (e.value === null) delete this.data[e.collection][e.id]
    else this.data[e.collection][e.id] = e.value
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
