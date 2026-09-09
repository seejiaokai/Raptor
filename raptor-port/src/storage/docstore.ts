/* THE DOCUMENT DRAWER (owner, 8 Sep 26 — "there is no persistence when I
   saved documents on medical"). The supporting photos and PDFs are far too
   big for the ~5 MB text seam every OTHER record shares (a couple of scans
   would overflow it and break ALL saving), so they get their own browser
   drawer: IndexedDB, which stores a Blob natively and has a much larger
   budget. This is the DURABLE half of the state/docs cache — that module's
   in-memory Map stays the synchronous read path the viewer needs in render,
   and this writes through so a reload finds the file still here.

   Per-browser, like everything else at this stage: a document saved here is
   NOT yet visible on another person's browser — that is the shared-database
   step. Fail-soft to match the storage seam: if the drawer will not open
   (private browsing, a locked-down profile), state/docs.docBoot leaves the
   store memory-only and documents behave session-only rather than crashing.

   APPEND-ONLY, like the cache it backs: nothing here deletes a stored file,
   because undo can resurrect the input it belongs to and must find its
   paperwork. Removing a file edits the RECORD's id list, never this store. */
import type { DocDurable, DocRec } from '../state/docs'

const DB_NAME = 'raptor-docs'
const STORE = 'docs'

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('no indexedDB')); return }
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => { req.result.createObjectStore(STORE, { keyPath: 'id' }) }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
    /* a profile that blocks storage can leave open() hanging on a blocked
       upgrade forever — surface it as a rejection so docBoot falls back */
    req.onblocked = () => reject(new Error('indexedDB blocked'))
  })
}

/* the real drawer. `db` is opened lazily and once — load() and every
   write-behind put() share it. */
export function idbDocStore(): DocDurable {
  let dbp: Promise<IDBDatabase> | null = null
  const db = () => (dbp ||= open())
  return {
    load() {
      return db().then(d => new Promise<DocRec[]>((resolve, reject) => {
        const tx = d.transaction(STORE, 'readonly')
        const req = tx.objectStore(STORE).getAll()
        req.onsuccess = () => resolve((req.result || []) as DocRec[])
        req.onerror = () => reject(req.error)
      }))
    },
    /* Returns a promise that RESOLVES when the write is durably committed and
       REJECTS if the transaction errors or aborts (quota, locked profile) —
       observing tx.oncomplete/onerror, not just the request, so the outcome is
       actually known. state/docs stays fire-and-forget at the call site (it
       does not await) but can now surface a failed save instead of losing it
       silently. The file is already in the cache, so a failure only costs this
       file its reload survival, never the session. */
    put(rec: DocRec) {
      return db().then(d => new Promise<void>((resolve, reject) => {
        const tx = d.transaction(STORE, 'readwrite')
        tx.oncomplete = () => resolve()
        tx.onerror = tx.onabort = () => reject(tx.error || new Error('doc write failed'))
        try { tx.objectStore(STORE).put(rec) } catch (e) { reject(e) }
      }))
    },
  }
}
