// src/storage/browser.ts
/* THE DEMO-SITE BACKEND — browser storage, per browser, no sharing. Each
   record lives at `raptor:<collection>/<id>`. On the first load of a browser
   that used the site before the seam, the legacy `sqn142_*` (settings) and
   `ocu:*` (Tracker) keys are imported once and written under `raptor:` so
   later loads find them there; legacy keys are never deleted. The unwired
   `leavewar:*` keys are ignored (main.tsx booted Leave War on memory). */
import { type Backend, type Collection, type Snapshot, emptySnapshot, isCollection, recordKey, splitKey } from './backend'

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
function parseKeyList(raw: string | null): string[] {
  if (raw == null) return []
  try { const a = JSON.parse(raw); return Array.isArray(a) ? a.filter(x => typeof x === 'string') : [] } catch (e) { return [] }
}

export class BrowserBackend implements Backend {
  constructor(private ls: Storage = localStorage) {}

  async loadAll(): Promise<Snapshot> {
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
    return snap
  }

  async put(collection: Collection, id: string, json: string): Promise<void> {
    this.ls.setItem(BROWSER_PREFIX + recordKey(collection, id), json)   // a throw rejects → postman retries
  }

  async remove(collection: Collection, id: string): Promise<void> {
    this.ls.removeItem(BROWSER_PREFIX + recordKey(collection, id))
  }

  private importLegacy(snap: Snapshot, hasRecords: boolean): void {
    const ledgerRaw = this.ls.getItem(LEGACY_LEDGER)
    /* No ledger but real records already here → an EXISTING install whose
       one-time import ran under the old code (or never needed to). Grandfather
       it: mark done, import nothing. Only a ledger (which only this importer
       writes) means an import is genuinely mid-flight and should resume. */
    if (ledgerRaw == null && hasRecords) { this.markLegacyDone(); return }
    const done = new Set<string>(parseKeyList(ledgerRaw))
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
        try { this.ls.setItem(BROWSER_PREFIX + recordKey(c, id), v); done.add(k); changed = true }
        catch (e) { clean = false }                           // out of space: leave it for the next boot to resume
      }
    }
    if (changed) { try { this.ls.setItem(LEGACY_LEDGER, JSON.stringify([...done])) } catch (e) { clean = false } }
    if (clean) this.markLegacyDone()                          // a fully-clean pass: never import again
  }

  private markLegacyDone(): void { try { this.ls.setItem(LEGACY_DONE, '1') } catch (e) { /* full store: retries next boot */ } }
}
