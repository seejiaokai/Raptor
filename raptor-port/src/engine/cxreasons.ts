import { store } from './hooks'

/* THE SQUADRON'S CANCEL-REASON TEMPLATES (owner, Aug 26). These are the
   quick-fill chips the CX dialog offers ("WX", "U/S AIRCRAFT", …) so a
   scheduler cancelling a line taps a preset instead of retyping it. Until now
   the list was a frozen const `CX_QUICK` in ui/board.ts; the owner asked to
   add / rename / delete his own, so it becomes persisted config with
   save/load/reset — exactly the shape `stores` and `dutytpl` already are, and
   it lives in the engine beside them for the same reason (the store backend is
   an engine hook).

   UNLIKE stores there is NO stable key: a cancel reason is FREE TEXT. When a
   line is cancelled `cxCommit` copies the chosen string straight onto the row
   as `cxr` (ui/board.ts) — the row keeps its own copy, it does not point back
   at a template. So renaming or deleting a template never disturbs a row that
   was already cancelled with it, and the list is a plain ordered array of
   strings addressed by position. Nothing in validate.ts or the parity
   reference reads it (the seed week has no cancellations), so removal carries
   no hazard and it is parity-neutral — the same footing as the stores list. */
export const CXR_STD: readonly string[] = Object.freeze([
  'WX', 'U/S AIRCRAFT', 'CREW SICK', 'NO AIRSPACE', 'TASKING', 'ENGINEERING', 'SLIPPED',
])

export const MAX_CXR = 24, MAX_CXR_LABEL = 24

export let CXR_CFG: string[] = CXR_STD.map(s => s)

/* the label as it is stored and printed — trimmed, case preserved so a
   squadron can write its own ("Diverted", "Ac swap") rather than being forced
   into the shipped all-caps. Duplicate detection folds case (below), so "WX"
   and "wx" are treated as one reason even though the stored spelling is kept. */
const norm = (s: string) => String(s).trim()

export function cxrAreStandard() {
  return CXR_CFG.length === CXR_STD.length
    && CXR_CFG.every((l, i) => l === CXR_STD[i])
}

export function addCxReason(name: string): string | null {
  const lab = norm(name)
  if (!lab) return 'A cancel reason needs some text'
  if (lab.length > MAX_CXR_LABEL) return `A cancel reason is at most ${MAX_CXR_LABEL} characters`
  if (CXR_CFG.some(l => l.toLowerCase() === lab.toLowerCase())) return `${lab} is already on the list`
  if (CXR_CFG.length >= MAX_CXR) return `The list holds at most ${MAX_CXR} reasons`
  CXR_CFG.push(lab)
  return null
}

export function delCxReason(i: number): boolean {
  if (!Number.isInteger(i) || i < 0 || i >= CXR_CFG.length) return false
  CXR_CFG.splice(i, 1)
  return true
}

/* TWO REASONS CANNOT WEAR ONE SPELLING — the same audit lesson stores learned
   (12 Aug 26): the add path refuses a duplicate, so the rename path must too,
   or the persisted list comes back holding two identical chips with nothing to
   tell them apart. Case is folded for the comparison, kept in the stored value. */
export function renameCxReason(i: number, name: string): string | null {
  if (!Number.isInteger(i) || i < 0 || i >= CXR_CFG.length) return `${i} is not on the list`
  const lab = norm(name)
  if (!lab) return 'A cancel reason needs some text'
  if (lab.length > MAX_CXR_LABEL) return `A cancel reason is at most ${MAX_CXR_LABEL} characters`
  if (CXR_CFG.some((l, j) => j !== i && l.toLowerCase() === lab.toLowerCase())) return `${lab} is already on the list`
  CXR_CFG[i] = lab
  return null
}

export function moveCxReason(from: number, to: number): boolean {
  const n = CXR_CFG.length
  if (!Number.isInteger(from) || !Number.isInteger(to)) return false
  if (from < 0 || from >= n || to < 0 || to >= n) return false
  const [row] = CXR_CFG.splice(from, 1)
  CXR_CFG.splice(to, 0, row!)
  return true
}

/* An ordered list IS its order and its labels — the whole thing is stored, and
   only when it deviates from the shipped set (standard → nothing written), the
   same rule storesSave follows. */
export function cxReasonsSave() {
  store.set('cxreasons', cxrAreStandard() ? null : CXR_CFG.slice())
}

/* Storage is hand-editable and therefore untrusted — the same scar stores and
   rules carry. Non-string, empty, over-long and case-duplicate rows are
   dropped; if nothing valid survives (not an array, all rows bad, or nothing
   saved) CXR_CFG is set to the shipped set explicitly, never merely left at
   whatever it happened to hold. */
export function cxReasonsLoad() {
  const raw = store.get('cxreasons', null)
  const seen = new Set<string>()
  const out: string[] = []
  if (Array.isArray(raw)) for (const row of raw) {
    if (out.length >= MAX_CXR) break
    if (typeof row !== 'string') continue
    const lab = row.trim()
    if (!lab || lab.length > MAX_CXR_LABEL) continue
    const low = lab.toLowerCase()
    if (seen.has(low)) continue
    seen.add(low)
    out.push(lab)
  }
  CXR_CFG = out.length ? out : CXR_STD.map(s => s)
}

export function cxReasonsReset() {
  CXR_CFG = CXR_STD.map(s => s)
  store.set('cxreasons', null)
}
