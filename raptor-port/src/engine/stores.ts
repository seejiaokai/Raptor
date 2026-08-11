import { store } from './hooks'

/* THE SQUADRON'S STORES LIST (owner, 7 Aug 26). Was a const in ui/html.ts;
   it is persisted state with save/load/reset now — which is what `rules` is —
   so it lives in the engine and html.ts goes back to being a builder library.
   That earlier list was itself already a rework (owner, Aug 26): an additive
   set the scheduler built up through a picker, replacing the OLDER fixed
   2TK/TPOD/NAV toggles that came before it. This is the second time the
   stores UI has moved past a fixed set.

   [key,label]: the KEY is what lands in aircraft.opts and must never move
   (a rename that changes it strips the store from every jet carrying it);
   the LABEL is what prints. Order is display-only and drives all three
   places consistently — the chips on the line, the popup, and the CSV.

   Nothing in validate.ts reads a store, so removal carries no hazard and
   needs no arm-before-delete the way EDIT QUALS does. */
/* This ORDER is the owner's (8 Aug 26, set on the deployed site and asked
   for as the default): most-carried first. The KEYS are unchanged — order is
   display-only, so no saved jet config or saved list is affected. */
export const STORE_STD: readonly [string, string][] = Object.freeze([
  ['tpod', 'TPOD'], ['tk2', '2 TKS'], ['nav', 'NAV'],
  ['nc', 'N/C'], ['tks3', '3 TKS'], ['cl', 'CL'],
] as [string, string][])

export const MAX_STORES = 24, MAX_LABEL = 16

export let STORE_CFG: [string, string][] = STORE_STD.map(p => [p[0], p[1]])

/* same derivation as QualsPage's qualKey — non-alphanumerics stripped, not
   replaced, so the charset a key can hold is exactly ^[a-z0-9]+$ */
export const storeKey = (name: string) => name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '')

const KEY_OK = /^[a-z0-9]+$/

export function storesAreStandard() {
  return STORE_CFG.length === STORE_STD.length
    && STORE_CFG.every(([k, l], i) => k === STORE_STD[i]![0] && l === STORE_STD[i]![1])
}

/* ONE JET'S STORES LOAD, in the words the chips print — "TPOD, 2 TKS, MK82×2".
   The edit log's before/after for the `st:` key (editlog.ts), which is why it
   folds the typed bombs text in beside the chips: both are written to the same
   address, because the amendment mark is on the AIRCRAFT and every store on one
   jet is one edit. Logging them separately would give two entries the same
   name, each telling half the story.
   Order follows STORE_CFG, so a squadron that has reordered its list reads its
   own order back. `storesView` in ui/html.ts renders the same thing as markup;
   this one is text, because the engine may not emit HTML and a log row is
   escaped where it is printed. */
export function storesText(o: any): string {
  o = o || {}
  const on = STORE_CFG.filter(([k]) => o[k]).map(([, lab]) => lab)
  if (o.bombs) on.push(String(o.bombs))
  return on.join(', ')
}

export function addStore(name: string): string | null {
  const label = name.trim().toUpperCase()
  const derived = storeKey(name)
  if (!derived) return 'A store needs a letter or a number in its name'
  if (label.length > MAX_LABEL) return `A store name is at most ${MAX_LABEL} characters`
  /* Two of the six shipped keys do NOT equal storeKey(their own label):
     '2 TKS' derives to '2tks' but STORE_STD's entry is keyed 'tk2', and
     '3 TKS'/'tks3' the same way (history: those keys predate storeKey()'s
     derivation rule). Every jet's config is stored under the SHIPPED key
     (a.opts.tk2, a.opts.tks3), never the derived one, so deleting one of
     these two and typing its name back in used to land on a brand-new,
     unreachable entry ('2tks') while every jet kept carrying the old one
     ('tk2') — the removal promise ("add it back and the chips return",
     the toast below and docs/ui-contracts.md §Stores configuration) broke
     silently for exactly these two. Resolve by LABEL against STORE_STD
     first, so re-adding a standard store always lands back on its real
     key — closing the gap without inventing any new persisted state.
     This also fixes a second, subtler bug the mismatch caused even
     WITHOUT a delete: typing "2 TKS" while 'tk2' was already on the list
     used to slip past the duplicate check below (it only compared against
     the derived key '2tks') and appended a second, differently-keyed
     "2 TKS" entry — resolving by label first makes that a correctly
     refused duplicate instead. */
  const std = STORE_STD.find(([, l]) => l === label)
  const k = std ? std[0] : derived
  if (STORE_CFG.some(([x]) => x === k)) return `${label} is already on the list`
  if (STORE_CFG.length >= MAX_STORES) return `The list holds at most ${MAX_STORES} stores`
  STORE_CFG.push([k, label])
  return null
}

export function delStore(key: string): boolean {
  const i = STORE_CFG.findIndex(([k]) => k === key)
  if (i < 0) return false
  STORE_CFG.splice(i, 1)
  return true
}

/* THE KEY NEVER MOVES — see the module note. */
export function renameStore(key: string, label: string): string | null {
  const i = STORE_CFG.findIndex(([k]) => k === key)
  if (i < 0) return `${key} is not on the list`
  const lab = label.trim().toUpperCase()
  if (!lab) return 'A store needs a name'
  if (lab.length > MAX_LABEL) return `A store name is at most ${MAX_LABEL} characters`
  STORE_CFG[i] = [key, lab]
  return null
}

export function moveStore(from: number, to: number): boolean {
  const n = STORE_CFG.length
  if (!Number.isInteger(from) || !Number.isInteger(to)) return false
  if (from < 0 || from >= n || to < 0 || to >= n) return false
  const [row] = STORE_CFG.splice(from, 1)
  STORE_CFG.splice(to, 0, row!)
  return true
}

/* An ordered, renameable list IS its order and its labels, so there is no
   meaningful per-entry diff the way rulesSave has: the whole list is stored,
   and only when it deviates. Standard set → nothing written at all. */
export function storesSave() {
  store.set('stores', storesAreStandard() ? null : STORE_CFG.map(([k, l]) => [k, l]))
}

/* Storage is hand-editable, so it is untrusted input — rulesLoad carries the
   scar comment that explains why (isFinite("840") is true, and a string once
   poisoned the crew-rest maths). Bad entries are dropped; if nothing valid
   survives — the blob was not an array, every row failed validation, or
   there was nothing saved at all — STORE_CFG is set to the standard six
   explicitly, not merely left at whatever it happened to hold already: a
   fresh boot only ever "happens" to already be standard because the
   module initialiser set it that way, and nothing should depend on that
   coincidence (a caller who diverged the live list first, e.g. mid-session
   before a reload-equivalent load, must still land on the standard six,
   the same guarantee the module's own boot gives it). */
export function storesLoad() {
  const raw = store.get('stores', null)
  const seen = new Set<string>()
  const out: [string, string][] = []
  if (Array.isArray(raw)) for (const row of raw) {
    if (out.length >= MAX_STORES) break
    if (!Array.isArray(row) || row.length !== 2) continue
    const [k, l] = row
    if (typeof k !== 'string' || typeof l !== 'string') continue
    if (!KEY_OK.test(k) || seen.has(k)) continue
    const lab = l.trim()
    if (!lab || lab.length > MAX_LABEL) continue
    seen.add(k)
    out.push([k, lab])
  }
  STORE_CFG = out.length ? out : STORE_STD.map(p => [p[0], p[1]])
}

export function storesReset() {
  STORE_CFG = STORE_STD.map(p => [p[0], p[1]])
  store.set('stores', null)
}
