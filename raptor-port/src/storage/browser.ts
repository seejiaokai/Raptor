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

export class BrowserBackend implements Backend {
  constructor(private ls: Storage = localStorage) {}

  async loadAll(): Promise<Snapshot> {
    const snap = emptySnapshot()
    let found = false
    for (let i = 0; i < this.ls.length; i++) {
      const k = this.ls.key(i)
      if (!k || !k.startsWith(BROWSER_PREFIX)) continue
      found = true
      const [c, id] = splitKey(k.slice(BROWSER_PREFIX.length))
      if (!isCollection(c)) continue
      const v = this.ls.getItem(k)
      if (v != null) snap[c][id] = v
    }
    if (!found) this.importLegacy(snap)
    return snap
  }

  async put(collection: Collection, id: string, json: string): Promise<void> {
    this.ls.setItem(BROWSER_PREFIX + recordKey(collection, id), json)   // a throw rejects → postman retries
  }

  async remove(collection: Collection, id: string): Promise<void> {
    this.ls.removeItem(BROWSER_PREFIX + recordKey(collection, id))
  }

  private importLegacy(snap: Snapshot): void {
    const keys: string[] = []
    for (let i = 0; i < this.ls.length; i++) { const k = this.ls.key(i); if (k) keys.push(k) }
    for (const k of keys) {
      for (const [prefix, c] of LEGACY) {
        if (!k.startsWith(prefix)) continue
        const id = k.slice(prefix.length)
        const v = this.ls.getItem(k)
        if (v == null) continue
        snap[c][id] = v
        try { this.ls.setItem(BROWSER_PREFIX + recordKey(c, id), v) } catch (e) { /* read-only store: import still serves this boot */ }
      }
    }
  }
}
