// src/storage/browser.ts
/* THE DEMO-SITE BACKEND — browser storage, per browser, no sharing. Each
   record lives at `raptor:<collection>/<id>`. On the first load of a browser
   that used the site before the seam, the legacy `sqn142_*` (settings) and
   `ocu:*` (Tracker) keys are imported once and written under `raptor:` so
   later loads find them there; legacy keys are never deleted. The unwired
   `leavewar:*` keys are ignored (main.tsx booted Leave War on memory). */
import { type Backend, type Collection, type Entry, type Snapshot, emptySnapshot, isCollection, parseGroup, recordKey, splitKey } from './backend'

export const BROWSER_PREFIX = 'raptor:'
const LEGACY: Array<[string, Collection]> = [['sqn142_', 'settings'], ['ocu:', 'tracker']]
/* the one-time legacy import's own bookkeeping, under a collection loadAll
   skips (`__legacy__` is not a real Collection). `done` is set only after a
   fully-clean import; `ledger` lists the legacy keys already copied, so a
   resume never doubles a record and a record DELETED after it was imported is
   never resurrected. (bug-check, 11 Sep 26 — the old code marked the import
   done on the first raptor: key, so a copy interrupted by a full store hid
   every legacy record it had not reached, for good.) */
const LEGACY_DONE = BROWSER_PREFIX + '__legacy__/done'
const LEGACY_LEDGER = BROWSER_PREFIX + '__legacy__/ledger'
/* written BEFORE the first copy, so a partial import whose ledger write ALSO
   failed on a full store is still recognisable as mid-flight next boot and is
   never mistaken for an existing install (bug-check, 11 Sep 26 — second pass). */
const LEGACY_STARTED = BROWSER_PREFIX + '__legacy__/started'
/* [ARCH-STACK-4] §19.4 / §20.3 — the all-or-nothing journal. ONE key holds the
   whole group being applied (written in ONE setItem), so a crash or a full store
   mid-apply is finished at the next boot. It sits outside every collection
   (`splitKey` finds no collection in it), so loadAll never serves it as a record. */
export const JOURNAL_KEY = BROWSER_PREFIX + '__txn'

function parseKeyList(raw: string | null): string[] {
  if (raw == null) return []
  try { const a = JSON.parse(raw); return Array.isArray(a) ? a.filter(x => typeof x === 'string') : [] } catch (e) { return [] }
}

export class BrowserBackend implements Backend {
  constructor(private ls: Storage = localStorage) {}

  private recovered: Entry[] | null = null

  async loadAll(): Promise<Snapshot> {
    this.replayJournal()
    const snap = emptySnapshot()
    let hasRecords = false
    for (let i = 0; i < this.ls.length; i++) {
      const k = this.ls.key(i)
      if (!k || !k.startsWith(BROWSER_PREFIX)) continue
      const [c, id] = splitKey(k.slice(BROWSER_PREFIX.length))
      if (!isCollection(c)) continue                  // __legacy__ meta keys serve the importer, not the app
      hasRecords = true
      const v = this.ls.getItem(k)
      if (v != null) snap[c][id] = v
    }
    /* the one-time legacy import, grandfathered and resumable. Skipped for good
       once `done` is set; a browser that already held raptor: RECORDS before
       this fix (no ledger) is an existing install and is grandfathered — marked
       done, nothing re-imported — so a since-deleted record is not resurrected. */
    if (this.ls.getItem(LEGACY_DONE) == null) this.importLegacy(snap, hasRecords)
    /* a replay that could not finish: boot on the ACKNOWLEDGED world anyway —
       the journal's values win over the half-applied records (§20.3 FB5-02) */
    if (this.recovered) for (const e of this.recovered) {
      if (e.value === null) delete snap[e.collection][e.id]
      else snap[e.collection][e.id] = e.value
    }
    return snap
  }

  unfinished(): Entry[] | null { return this.recovered }

  /* ONE synchronous block — journal, apply every entry, remove the journal — with
     no await inside (§20.3 FB5-01), so a pagehide flush lands it whole. A failed
     journal write applies nothing (the group retries whole); a failure after it
     leaves the journal for the next boot to finish. */
  async putMany(entries: Entry[]): Promise<void> {
    this.ls.setItem(JOURNAL_KEY, JSON.stringify(entries))
    for (const e of entries) this.apply(e)
    this.ls.removeItem(JOURNAL_KEY)
  }

  async writeJournal(group: Entry[] | null): Promise<void> {
    if (group && group.length) this.ls.setItem(JOURNAL_KEY, JSON.stringify(group))
    else this.ls.removeItem(JOURNAL_KEY)
    this.recovered = group && group.length ? group : null
  }

  private apply(e: Entry): void {
    const k = BROWSER_PREFIX + recordKey(e.collection, e.id)
    if (e.value === null) this.ls.removeItem(k)
    else this.ls.setItem(k, e.value)
  }

  /* finish an unfinished group BEFORE anything is read. Each entry is tried on
     its own; if any still fails the journal is KEPT (the next boot tries again)
     and the group is reported as unfinished. A malformed journal is dropped. */
  private replayJournal(): void {
    this.recovered = null
    const raw = this.ls.getItem(JOURNAL_KEY)
    if (raw == null) return
    const group = parseGroup(raw)
    if (!group) { this.ls.removeItem(JOURNAL_KEY); return }
    let clean = true
    for (const e of group) { try { this.apply(e) } catch (err) { clean = false } }
    if (clean) this.ls.removeItem(JOURNAL_KEY)
    else this.recovered = group
  }

  async put(collection: Collection, id: string, json: string): Promise<void> {
    this.ls.setItem(BROWSER_PREFIX + recordKey(collection, id), json)   // a throw rejects → postman retries
  }

  async remove(collection: Collection, id: string): Promise<void> {
    this.ls.removeItem(BROWSER_PREFIX + recordKey(collection, id))
  }

  private importLegacy(snap: Snapshot, hasRecords: boolean): void {
    const ledgerRaw = this.ls.getItem(LEGACY_LEDGER)
    const started = this.ls.getItem(LEGACY_STARTED) != null
    /* No ledger, no `started` marker, but real records already here → an
       EXISTING install whose one-time import ran under the old code (or never
       needed to). Grandfather it: mark done, import nothing. Either bookkeeping
       key (ledger OR started — both written only by this importer) means an
       import is genuinely mid-flight and must RESUME, even one whose ledger
       write itself failed on a full store, so it is never mistaken for an
       existing install. */
    if (ledgerRaw == null && !started && hasRecords) { this.markLegacyDone(); return }
    const done = new Set<string>(parseKeyList(ledgerRaw))
    /* stamp the attempt BEFORE copying anything, so a copy that persists a
       record but then cannot persist the ledger is still resumable next boot.
       Persisting a record is GATED on this marker being durable (already set,
       or written now): that keeps the invariant "a persisted record implies the
       marker is present", so the next boot can never see records with neither
       marker nor ledger and wrongly grandfather them — even if the store's quota
       failures were non-monotonic (a small write failing while a later larger
       one somehow succeeded). If the marker cannot be written the store is full:
       serve legacy from memory this boot, persist nothing, and retry next boot.
       KNOWN, ACCEPTED trade-off (Astra 2nd pass): if a record IS persisted but
       its ledger write then fails, and the user deletes that just-migrated
       record before the next boot, it is re-copied — resume without a durable
       ledger cannot tell "not yet copied" from "copied then deleted". The
       resurrection guarantee is firm once the ledger persists; this window is
       only a record migrated seconds earlier on an already-full store. */
    let canPersist = started
    if (!started) { try { this.ls.setItem(LEGACY_STARTED, '1'); canPersist = true } catch (e) { canPersist = false } }
    const keys: string[] = []
    for (let i = 0; i < this.ls.length; i++) { const k = this.ls.key(i); if (k) keys.push(k) }
    let clean = true, changed = false
    for (const k of keys) {
      for (const [prefix, c] of LEGACY) {
        if (!k.startsWith(prefix) || done.has(k)) continue   // already imported once — a later delete stays deleted
        const id = k.slice(prefix.length)
        const v = this.ls.getItem(k)
        if (v == null) continue
        snap[c][id] = v                                       // serve it THIS boot regardless
        if (!canPersist) { clean = false; continue }          // no durable marker → persist nothing; retry next boot
        try { this.ls.setItem(BROWSER_PREFIX + recordKey(c, id), v); done.add(k); changed = true }
        catch (e) { clean = false }                           // out of space: leave it for the next boot to resume
      }
    }
    if (changed) { try { this.ls.setItem(LEGACY_LEDGER, JSON.stringify([...done])) } catch (e) { clean = false } }
    if (clean) this.markLegacyDone()                          // a fully-clean pass: never import again
  }

  private markLegacyDone(): void { try { this.ls.setItem(LEGACY_DONE, '1') } catch (e) { /* full store: retries next boot */ } }
}
