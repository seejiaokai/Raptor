/* ---- THE SUPPORTING-DOCUMENT STORE (owner, 27 Aug 26) ---------------------
   A medical input (ATT C / ATT B / OML / HL / Upchit) does not go in without
   its supporting document; this is where the documents live.

   SESSION-ONLY AND IN MEMORY, deliberately (owner, 27 Aug 26 — "session
   only ... eventually it will go to a database"): the inputs these documents
   belong to are themselves session-only, and a document that outlived its
   input would be exactly the mixed-memory confusion the INPUTS/Leave-War
   lockstep exists to prevent. NOT on HOOKS.storeBackend — that seam is a
   ~5MB JSON/localStorage budget that swallows quota errors, which is the
   wrong home for photos and PDFs. The `docBackend` indirection below is the
   seam the future shared database replaces, storeBackend's own shape.

   The map is APPEND-ONLY for the session: deleting an input does NOT revoke
   its document, because undo can resurrect the input (state/history.ts
   snapshots INPUTS wholesale) and it must find its paperwork still here.
   Input records carry only the `docId` string — never a blob, or every
   history snapshot would copy it.

   Object URLs are NOT minted here: the viewer mints one on open and revokes
   it on close, so nothing leaks per stored file. */
const mem = new Map<string, { name: string, mime: string, size: number, blob: Blob }>()
export const docBackend: any = { impl: mem }

/* accepted uploads: photos and PDFs, capped so one fat scan cannot eat the
   session's memory. The limit is stated in the refusal, per the
   missing-input doctrine (a default or a bound the user can see). */
export const DOC_MAX = 8 * 1024 * 1024
export const docAccepts = (mime: any) => /^image\//.test(String(mime || '')) || String(mime || '') === 'application/pdf'

let seq = 0
/* store one file; returns the id the input record carries, or '' with a
   toastable reason in `why` when refused */
export function docAdd(file: { name?: any, type?: any, size?: any } & Blob): { id: string, why: string } {
  if (!file) return { id: '', why: 'No file was chosen' }
  if (!docAccepts(file.type)) return { id: '', why: 'That file is not a photo or a PDF' }
  if (+file.size > DOC_MAX) return { id: '', why: 'That file is over 8 MB — attach a smaller photo or PDF' }
  const id = 'doc' + (++seq)
  docBackend.impl.set(id, { name: String(file.name || 'document'), mime: String(file.type), size: +file.size, blob: file })
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
