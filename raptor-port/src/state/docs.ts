/* ---- THE SUPPORTING-DOCUMENT STORE (owner, 27 Aug 26) ---------------------
   A medical input (ATT C / ATT B / OML / HL / Upchit) does not go in without
   its supporting document; this is where the documents live.

   AN IN-MEMORY CACHE OVER A DURABLE DRAWER (owner, 8 Sep 26 — "there is no
   persistence when I saved documents on medical"). The Map below is the
   SYNCHRONOUS read path — the viewer reads docGet in render, so it cannot be
   async — and behind it sits a per-browser drawer (`durable`, wired by
   docBoot from main.tsx: IndexedDB on the built site, see storage/docstore).
   docAdd writes through to it and docBoot fills the cache back from it at
   boot, so a reload finds the file still here. Deliberately NOT on
   HOOKS.storeBackend: that seam is a ~5 MB JSON/localStorage budget that a
   couple of photos would overflow, breaking ALL saving — the wrong home for
   blobs, which is why documents get their own drawer. Until 8 Sep 26 the
   drawer was absent and the store was session-only; the storage seam then
   began saving the inputs (and their `docId`) while the blobs still vanished
   on reload, which is the gap this closes. A null drawer (dev, tests,
   ?fresh=1) keeps the old memory-only behaviour.

   The map is APPEND-ONLY: deleting an input does NOT revoke its document,
   because undo can resurrect the input (state/history.ts snapshots INPUTS
   wholesale) and it must find its paperwork still here. Input records carry
   only the `docId` string — never a blob, or every history snapshot would
   copy it.

   Object URLs are NOT minted here: the viewer mints one on open and revokes
   it on close, so nothing leaks per stored file. */
export type DocRec = { id: string, name: string, mime: string, size: number, blob: Blob }
/* the durable drawer behind the cache — implemented by storage/docstore for
   the built site, left null (memory-only) everywhere else */
export interface DocDurable {
  load(): Promise<DocRec[]>
  put(rec: DocRec): void
}
const mem = new Map<string, { name: string, mime: string, size: number, blob: Blob }>()
export const docBackend: any = { impl: mem }

let durable: DocDurable | null = null

/* Boot the durable drawer (main.tsx, browser backend only). Fill the cache
   from it so the viewer's synchronous docGet finds a reloaded file. A null
   store keeps memory-only. Fail-soft: a drawer whose load rejects leaves the
   store memory-only rather than blocking boot — the same posture the storage
   seam takes. (Ids are globally unique at mint, see newDocId, so boot needs
   no counter to advance — a fresh upload can never collide with a stored id.) */
export async function docBoot(store: DocDurable | null): Promise<void> {
  durable = store
  if (!store) return
  let rows: DocRec[]
  try { rows = await store.load() }
  catch { durable = null; return }
  for (const r of rows) {
    /* harden the read like the seam's hydrate does: a corrupt row must not
       reach the viewer, where createObjectURL(non-Blob) throws */
    if (!r || typeof r.id !== 'string' || !(r.blob instanceof Blob)) continue
    docBackend.impl.set(r.id, { name: r.name, mime: r.mime, size: r.size, blob: r.blob })
  }
}

/* accepted uploads: photos and PDFs, capped so one fat scan cannot eat the
   session's memory. The limit is stated in the refusal, per the
   missing-input doctrine (a default or a bound the user can see). */
export const DOC_MAX = 8 * 1024 * 1024
export const docAccepts = (mime: any) => /^image\//.test(String(mime || '')) || String(mime || '') === 'application/pdf'

/* A GLOBALLY-UNIQUE id — never a per-context counter. Two tabs of one browser
   share ONE drawer, and at the shared-database stage two PEOPLE share one file
   store; a sequential `doc1, doc2 …` (reset to 0 every boot) lets any two of
   them mint the SAME id for DIFFERENT files, so the second blob overwrites the
   first under that key and an input then resolves to the WRONG person's
   medical document — a corrupt cross-reference, not a clean overwrite. A random
   id cannot collide across minters. The `doc-` prefix keeps it recognisable;
   the id is opaque everywhere (rowDocIds/docFields carry it as a string), and
   legacy `doc<N>` ids still resolve unchanged. */
function newDocId(): string {
  const c: any = typeof globalThis !== 'undefined' ? (globalThis as any).crypto : undefined
  if (c && typeof c.randomUUID === 'function') return 'doc-' + c.randomUUID()
  return 'doc-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 0xffffffff).toString(36)
}
/* store one file; returns the id the input record carries, or '' with a
   toastable reason in `why` when refused */
export function docAdd(file: { name?: any, type?: any, size?: any } & Blob): { id: string, why: string } {
  if (!file) return { id: '', why: 'No file was chosen' }
  if (!docAccepts(file.type)) return { id: '', why: 'That file is not a photo or a PDF' }
  if (+file.size > DOC_MAX) return { id: '', why: 'That file is over 8 MB — attach a smaller photo or PDF' }
  const id = newDocId()
  const rec = { name: String(file.name || 'document'), mime: String(file.type), size: +file.size, blob: file as Blob }
  docBackend.impl.set(id, rec)
  /* write through to the durable drawer so a reload keeps it — no-op when
     memory-only (dev/tests/?fresh), fire-and-forget otherwise */
  if (durable) durable.put({ id, ...rec })
  return { id, why: '' }
}
export function docGet(id: any) { return (id && docBackend.impl.get(String(id))) || null }
export function docHas(id: any) { return !!docGet(id) }

/* ---- SEVERAL FILES ON ONE ENTRY (owner, 1 Sep 26 — "upload several files
   into a single entry and delete or reupload") ----------------------------
   A record carries `docId` = the FIRST file, exactly as it always has (so
   the Leave-War retain, demoseed, the Inputs-page paperclip and every old
   test keep reading it), plus `docIds` = the full list, present only when
   there is more than one. The pair is minted ONLY by docFields and read
   ONLY through rowDocIds, so the two fields cannot drift apart — no other
   code writes either. Deleting a file edits the RECORD's list; the store
   above stays append-only, because undo can resurrect the record and must
   find its paperwork still here. */
export function rowDocIds(r: any): string[] {
  if (!r) return []
  if (Array.isArray(r.docIds) && r.docIds.length) return r.docIds.map(String)
  return r.docId ? [String(r.docId)] : []
}
export function docFields(ids: any): { docId?: string, docIds?: string[] } {
  const a = (Array.isArray(ids) ? ids : []).map(String).filter(Boolean)
  if (!a.length) return {}
  return a.length === 1 ? { docId: a[0] } : { docId: a[0], docIds: [...a] }
}
