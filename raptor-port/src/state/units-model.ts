/* UNITS, PLACES, HOMES AND RIGHTS — the pure half (multi-squadron batch 1, step 1; the plan
   docs/superpowers/plans/2026-11-17-multi-sqn-build-batches.md §3.4, refined in HANDOFF's step-1 design).
   Types, the checks a stored row must pass, the ids, the GMT label and the resolvers. No store, no session, no screen:
   state/units.ts reads the rows and runs the commands; state/perms.ts asks these same resolvers at the commit gate, over
   the rows as they stood BEFORE a command, so a command can never grant its own author the right it needs.

   One answer for a person's level in a unit, no fact stored twice: the account's own `role` is its level in its HOME
   unit; a Grant row holds a right in ANOTHER unit only — 'admin' or 'view', never "member" of a squadron he is not in
   (D2094). A master is an admin everywhere. */
import { validIso, addDays } from './flyplan-model'

export const UNIT_PFX = 'unit:'
export const PLACE_PFX = 'place:'
export const UNITPLACE_PFX = 'unitplace:'
export const GRANT_PFX = 'grant:'
export const HOME_PFX = 'home:'
/* every settings prefix these rows live under — the settings layer's row list, the key inventory (storage/keyowner.ts)
   and the write hook that refuses a raw write of them all read this one list */
export const UNIT_ROW_PREFIXES = [UNIT_PFX, PLACE_PFX, UNITPLACE_PFX, GRANT_PFX, HOME_PFX] as const
/* the typed commands (state/units.ts); perms.ts COMMAND_OPS decides who may run each. `account.master` is the accounts'
   own (state/accounts.ts ACCOUNT_TYPES), as the mark lives on the account row. */
export const UNIT_TYPES = ['unit.add', 'unit.place', 'place.set', 'grant.set', 'grant.remove', 'home.set'] as const

export type GrantLevel = 'admin' | 'view'
export type UnitLevel = 'admin' | 'member' | 'view'
export interface Unit { id: string; num: string; kind: 'sqn'; parent?: string }
export interface Place { id: string; name: string; tz: string }
export interface UnitPlace { id: string; unit: string; place: string; from: string }
/* `from` (fix read 7, fault P — Astra's A2, Fable's 2): the day the grant was given, written by units.ts setGrant. Only a
   bell line his move retired reads it (state/notices.ts adminThen, on the move's own day): Plan given after the move must
   not bring that line back. The gate's levelFrom never reads it — a grant counts from the moment it is saved. Absent on
   a grant saved before it was kept (D56): counts from always. */
export interface Grant { id: string; account: string; unit: string; level: GrantLevel; from?: string }
export interface Home { id: string; pid: string; unit: string; from: string }
export interface UnitRows { units: Unit[]; places: Place[]; unitplaces: UnitPlace[]; grants: Grant[]; homes: Home[] }

/* ---- ids: a letter, then base 36 — never a hyphen, a tilde or a dot, so an id can sit inside a key that splits on
   any of them (plan §3.4). `newId` (engine/newid.ts) mints exactly this shape. */
const idOf = (letter: string) => new RegExp(`^${letter}[0-9a-z]+$`)
const UNIT_ID = idOf('u'), PLACE_ID = idOf('p'), UNITPLACE_ID = idOf('up'), GRANT_ID = idOf('g'), HOME_ID = idOf('h')
export const isUnitId = (s: unknown): s is string => typeof s === 'string' && UNIT_ID.test(s)
export const isPlaceId = (s: unknown): s is string => typeof s === 'string' && PLACE_ID.test(s)
const isStr = (s: unknown): s is string => typeof s === 'string' && s.trim() !== ''

/* a unit's number is what a person reads ("142"); short, plain letters and digits */
export const MAX_UNIT_NUM = 12
export const MAX_PLACE_NAME = 60
export const validUnitNum = (s: unknown): s is string => typeof s === 'string' && /^[0-9A-Za-z]{1,12}$/.test(s)

/* A TIME ZONE IS ONE THE BROWSER KNOWS — asked of Intl itself, never a list kept here that could drift from it */
export function validTz(tz: unknown): tz is string {
  if (!isStr(tz)) return false
  try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return true } catch { return false }
}

/* "GMT+8", "GMT+5:30", "GMT-3", "GMT+0" — worked out by Intl FOR THAT DATE (a place with summer time reads differently
   in January and July), never stored: a stored label would go stale at the first change of the clocks. Read at noon UTC,
   so the date is the same day in every zone. '' for a zone or date that cannot be read. */
export function gmtLabel(tz: string, iso: string): string {
  if (!validTz(tz) || !validIso(iso)) return ''
  const at = new Date(`${iso}T12:00:00Z`)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).formatToParts(at)
  const n = (t: string) => Number(parts.find(p => p.type === t)?.value)
  const local = Date.UTC(n('year'), n('month') - 1, n('day'), n('hour') % 24, n('minute'))
  const mins = Math.round((local - at.getTime()) / 60000)
  const sign = mins < 0 ? '-' : '+', abs = Math.abs(mins)
  return `GMT${sign}${Math.floor(abs / 60)}${abs % 60 ? `:${String(abs % 60).padStart(2, '0')}` : ''}`
}

/* ---- the checks a stored row must pass: the row as it is kept, or null (a row that cannot be trusted is read as
   nothing, as the flying plan's are). `key` is the id after the prefix — a row must sit under its own id. */
export function validUnit(v: any, key?: string): Unit | null {
  if (!v || typeof v !== 'object' || !isUnitId(v.id) || (key != null && v.id !== key)) return null
  if (!validUnitNum(v.num) || v.kind !== 'sqn') return null
  if (v.parent !== undefined && (!isUnitId(v.parent) || v.parent === v.id)) return null
  return { id: v.id, num: v.num, kind: 'sqn', ...(v.parent !== undefined ? { parent: v.parent } : {}) }
}
export function validPlace(v: any, key?: string): Place | null {
  if (!v || typeof v !== 'object' || !isPlaceId(v.id) || (key != null && v.id !== key)) return null
  const name = typeof v.name === 'string' ? v.name.trim() : ''
  if (!name || name.length > MAX_PLACE_NAME || name !== v.name || !validTz(v.tz)) return null
  return { id: v.id, name, tz: v.tz }
}
export function validUnitPlace(v: any, key?: string): UnitPlace | null {
  if (!v || typeof v !== 'object' || typeof v.id !== 'string' || !UNITPLACE_ID.test(v.id) || (key != null && v.id !== key)) return null
  if (!isUnitId(v.unit) || !isPlaceId(v.place) || !validIso(v.from)) return null
  return { id: v.id, unit: v.unit, place: v.place, from: v.from }
}
export function validGrant(v: any, key?: string): Grant | null {
  if (!v || typeof v !== 'object' || typeof v.id !== 'string' || !GRANT_ID.test(v.id) || (key != null && v.id !== key)) return null
  if (!isStr(v.account) || !isUnitId(v.unit) || (v.level !== 'admin' && v.level !== 'view')) return null
  return { id: v.id, account: v.account, unit: v.unit, level: v.level, ...(validIso(v.from) ? { from: String(v.from) } : {}) }
}
export function validHome(v: any, key?: string): Home | null {
  if (!v || typeof v !== 'object' || typeof v.id !== 'string' || !HOME_ID.test(v.id) || (key != null && v.id !== key)) return null
  if (!isStr(v.pid) || !isUnitId(v.unit) || !validIso(v.from)) return null
  return { id: v.id, pid: v.pid, unit: v.unit, from: v.from }
}

/* ---- the rows a store holds, with the seeds under them ----
   As the accounts do: no stored row means the seeded one, held in memory and never written at load; a stored row of the
   same id wins. `entries` — every (key, value) under the five prefixes. */
export function rowsFrom(entries: Iterable<[string, unknown]>, seeds: UnitRows | null): UnitRows {
  const out: UnitRows = { units: [], places: [], unitplaces: [], grants: [], homes: [] }
  for (const [k, v] of entries) {
    /* longest prefix first — never needed today (no prefix starts another), kept so a later one cannot misfile */
    if (k.startsWith(UNITPLACE_PFX)) { const r = validUnitPlace(v, k.slice(UNITPLACE_PFX.length)); if (r) out.unitplaces.push(r) }
    else if (k.startsWith(UNIT_PFX)) { const r = validUnit(v, k.slice(UNIT_PFX.length)); if (r) out.units.push(r) }
    else if (k.startsWith(PLACE_PFX)) { const r = validPlace(v, k.slice(PLACE_PFX.length)); if (r) out.places.push(r) }
    else if (k.startsWith(GRANT_PFX)) { const r = validGrant(v, k.slice(GRANT_PFX.length)); if (r) out.grants.push(r) }
    else if (k.startsWith(HOME_PFX)) { const r = validHome(v, k.slice(HOME_PFX.length)); if (r) out.homes.push(r) }
  }
  if (seeds) {
    const fill = <T extends { id: string }>(mine: T[], seed: T[]) => { const have = new Set(mine.map(r => r.id)); for (const s of seed) if (!have.has(s.id)) mine.push({ ...s }) }
    fill(out.units, seeds.units); fill(out.places, seeds.places); fill(out.unitplaces, seeds.unitplaces)
    fill(out.grants, seeds.grants); fill(out.homes, seeds.homes)
  }
  const byId = (a: { id: string }, b: { id: string }) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  out.units.sort(byId); out.places.sort(byId); out.grants.sort(byId)
  return out
}

/* ---- the resolvers ----
   A dated row holds from its date on, until the next one. Before a person's (or a unit's) FIRST row, that first row holds
   — his first home covers everything before it, so a day he worked before the row was written is never "nowhere" (the
   agent's reading: a home is written when a person is made or the store started, never for a past it has no other
   answer for). Rows of one date: the later id wins (two moves typed the same day — the command replaces instead, so this
   only settles rows two people wrote at once). */
function atOn<R extends { from: string; id: string }>(rows: R[], iso: string): R | null {
  if (!rows.length) return null
  const sorted = [...rows].sort((a, b) => (a.from < b.from ? -1 : a.from > b.from ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
  let hit: R = sorted[0]!
  for (const r of sorted) if (r.from <= iso) hit = r
  return hit
}
export const unitIn = (r: UnitRows, id: string): Unit | undefined => r.units.find(u => u.id === id)
export const placeIn = (r: UnitRows, id: string): Place | undefined => r.places.find(p => p.id === id)
/* the place a unit is at on a date (its place's id), or null for a unit never placed */
export const placeIdOn = (r: UnitRows, unit: string, iso: string): string | null => atOn(r.unitplaces.filter(x => x.unit === unit), iso)?.place ?? null
/* a person's home unit on a date; `fallback` for a person with no home row — the demo's 142, a shared store's null */
export const homeUnitOn = (r: UnitRows, pid: string, iso: string, fallback: string | null): string | null =>
  atOn(r.homes.filter(x => x.pid === pid), iso)?.unit ?? fallback
export const grantIn = (r: UnitRows, account: string, unit: string): Grant | undefined =>
  r.grants.find(g => g.account === account && g.unit === unit)

/* AN ACCOUNT'S LEVEL IN A UNIT ON A DATE — the one answer (plan §3.4, refined): a master is admin everywhere; in his home
   unit an account's level is its own role ('admin', or 'member' for the account role 'main'); elsewhere his grant's;
   otherwise none. `acct` — the account as the caller has it (the live list, or the image before a command). */
export interface LevelAccount { id: string; pid: string; role: string; master?: boolean }
export function levelFrom(acct: LevelAccount | null | undefined, unit: string, iso: string, r: UnitRows, fallback: string | null): UnitLevel | null {
  if (!acct) return null
  if (acct.master) return 'admin'
  if (homeUnitOn(r, acct.pid, iso, fallback) === unit) return acct.role === 'admin' ? 'admin' : 'member'
  return grantIn(r, acct.id, unit)?.level ?? null
}

/* the date a move counts from: the next day's start (D2119) — a move typed today never rewrites today */
export const moveFrom = (today: string): string => addDays(today, 1)
