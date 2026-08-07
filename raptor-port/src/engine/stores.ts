import { store } from './hooks'

/* THE SQUADRON'S STORES LIST (owner, 7 Aug 26). Was a const in ui/html.ts;
   it is persisted state with save/load/reset now — which is what `rules` is —
   so it lives in the engine and html.ts goes back to being a builder library.

   [key,label]: the KEY is what lands in aircraft.opts and must never move
   (a rename that changes it strips the store from every jet carrying it);
   the LABEL is what prints. Order is display-only and drives all three
   places consistently — the chips on the line, the popup, and the CSV.

   Nothing in validate.ts reads a store, so removal carries no hazard and
   needs no arm-before-delete the way EDIT QUALS does. */
export const STORE_STD: readonly [string, string][] = Object.freeze([
  ['nav', 'NAV'], ['nc', 'N/C'], ['tk2', '2 TKS'],
  ['tks3', '3 TKS'], ['tpod', 'TPOD'], ['cl', 'CL'],
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

export function addStore(name: string): string | null {
  const label = name.trim().toUpperCase()
  const k = storeKey(name)
  if (!k) return 'A store needs a letter or a number in its name'
  if (label.length > MAX_LABEL) return `A store name is at most ${MAX_LABEL} characters`
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
   survives, the standard six stand. */
export function storesLoad() {
  const raw = store.get('stores', null)
  if (!Array.isArray(raw)) return
  const seen = new Set<string>()
  const out: [string, string][] = []
  for (const row of raw) {
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
  if (out.length) STORE_CFG = out
}

export function storesReset() {
  STORE_CFG = STORE_STD.map(p => [p[0], p[1]])
  store.set('stores', null)
}
