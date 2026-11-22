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
   not bring that line back — on the move's own day too: a move day counts only a grant held before that day began
   (fix read 8, fault D). The gate's levelFrom never reads it — a grant counts from the moment it is saved. Absent on
   a grant saved before it was kept (D56): counts from always. */
/* `first` (the sign-in kinds review's K3 — D2160, D2191, D2247): the Plan "+ New squadron" gives the squadron's named first
   admin (units.ts addUnit, a master admin's alone). A man who moves squadron joins as a member — save the first admin of
   a new squadron, who moves into it as its admin: adminRoleHolds reads this mark for that, and nothing else does. */
export interface Grant { id: string; account: string; unit: string; level: GrantLevel; from?: string; first?: true }
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
  return { id: v.id, account: v.account, unit: v.unit, level: v.level, ...(validIso(v.from) ? { from: String(v.from) } : {}), ...(v.first === true && v.level === 'admin' ? { first: true as const } : {}) }
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
/* THE SQUADRONS AT A PLACE (batch 1's second half §6 item 3 — D2196, D2299, PG1; §15 D13, R-O8a): every squadron whose
   place that day is it, or whose place row names it from a later day (a move saved for tomorrow counts) — the set an
   admin must be an admin of, every one, to change its time zone; the door (state/units.ts setPlace) and the gate
   (state/perms.ts unitRowViolation) read this one body */
export const unitsAtPlace = (r: UnitRows, placeId: string, iso: string): string[] =>
  r.units.filter(u => placeIdOn(r, u.id, iso) === placeId
    || r.unitplaces.some(x => x.unit === u.id && x.place === placeId && x.from > iso)).map(u => u.id)

/* HOMES INDEXED BY PERSON, ONCE PER SET OF ROWS (the reshape plan §3.2 A-i; C10's measured cost): every read of a man's
   squadron used to filter every home row; a list over a year of days (the Leave War's rosters, Piece D) and a right read
   on a day (Piece B's grantOn) ask it hundreds of times. Kept beside the rows it was built from — rebuilt when a
   different homes list, or the same list grown or shrunk, is handed in (the rows are read, never changed in place). */
const HOMES_BY = new WeakMap<Home[], { n: number; by: Map<string, Home[]> }>()
function homesOf(r: UnitRows, pid: string): Home[] {
  let ix = HOMES_BY.get(r.homes)
  if (!ix || ix.n !== r.homes.length) {
    const by = new Map<string, Home[]>()
    for (const h of r.homes) { const l = by.get(h.pid); if (l) l.push(h); else by.set(h.pid, [h]) }
    for (const l of by.values()) l.sort((a, b) => (a.from < b.from ? -1 : a.from > b.from ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    ix = { n: r.homes.length, by }
    HOMES_BY.set(r.homes, ix)
  }
  return ix.by.get(pid) ?? []
}
/* a person's home unit on a date; `fallback` for a person with no home row — the demo's 142, a shared store's null */
export const homeUnitOn = (r: UnitRows, pid: string, iso: string, fallback: string | null): string | null =>
  atOn(homesOf(r, pid), iso)?.unit ?? fallback

/* THE DAYS HIS SQUADRON CHANGES (the reshape plan §3.2 A-i — Fable 7): every day `d` with `a < d <= b` on which his
   squadron, as `homeUnitOn` resolves it, differs from the day before. Never a row's date as such: the baseline row
   units.ts setHome writes for a man with none (his squadron of today, from today), a second row of the same squadron, a
   same-day take-back and a first placing are no change — his first row reaches back over every day before it, so the day
   before it already reads that row. Only a row's own date can start a change, so only those dates are looked at. */
export function homeChangesIn(r: UnitRows, pid: string, a: string, b: string, fallback: string | null): string[] {
  const out: string[] = []
  const days = [...new Set(homesOf(r, pid).map(h => h.from))].filter(d => d > a && d <= b).sort()
  for (const d of days) if (homeUnitOn(r, pid, d, fallback) !== homeUnitOn(r, pid, addDays(d, -1), fallback)) out.push(d)
  return out
}

/* HIS STINTS IN A UNIT (the reshape plan §3.2 A-i, for the Leave War's year-long rosters — A1): the runs of days his
   squadron is `unit`, oldest first. `from` null — the run reaches back over every day before his first row (atOn's
   rule); `to` null — it runs on with no end; else `to` is the day before the change that ends it. A man with no row is
   the fallback's for ever. */
export interface Stint { from: string | null; to: string | null }
export function stintsIn(r: UnitRows, pid: string, unit: string, fallback: string | null): Stint[] {
  const mine = homesOf(r, pid)
  if (!mine.length) return fallback === unit ? [{ from: null, to: null }] : []
  /* the squadron each date starts (rows of one date: the later id wins, as atOn — the list is sorted that way) */
  const starts: Array<{ from: string; unit: string }> = []
  for (const h of mine) {
    const last = starts[starts.length - 1]
    if (last && last.from === h.from) last.unit = h.unit
    else starts.push({ from: h.from, unit: h.unit })
  }
  const out: Stint[] = []
  for (let i = 0; i < starts.length; i++) {
    if (starts[i]!.unit !== unit) continue
    if (i > 0 && starts[i - 1]!.unit === unit) continue   // the same run, carried on
    let j = i
    while (j + 1 < starts.length && starts[j + 1]!.unit === unit) j++
    const next = starts[j + 1]
    out.push({ from: i === 0 ? null : starts[i]!.from, to: next ? addDays(next.from, -1) : null })
  }
  return out
}
/* every row of an account in a unit, holding or ended — the row loader's and the drops' view (a reader asking whether a
   right HOLDS asks grantOn below) */
export const grantsIn = (r: UnitRows, account: string, unit: string): Grant[] =>
  r.grants.filter(g => g.account === account && g.unit === unit)

/* A RIGHT'S START — the later of its own day and the day its account was linked to its man (`pidFrom`); a right with no
   day counts from always (D56), a link with no day likewise. '' — from always. */
export const grantStart = (g: Pick<Grant, 'from'>, pidFrom: string | undefined): string => {
  const a = typeof g.from === 'string' ? g.from : '', b = typeof pidFrom === 'string' ? pidFrom : ''
  return a > b ? a : b
}
/* THE READING RULE (the reshape plan §4.3, Piece B; his D2203, D2243 — Q4 answered "the start of his move day"): the right
   of an account in a unit HOLDING on `iso`, or none. A right holds on `iso` when its start (grantStart) is on or before
   `iso`, and its account's man's squadron does not change on any day after its start up to `iso` (homeChangesIn — a
   change is his resolved squadron differing from the day before, never a row's date as such). So a right ends at the start
   of the day his squadron changes — whether he leaves for another squadron or joins the right's own — and never holds
   again: no end is stored, and none is needed. Where two rows hold at once (a gate refuses it; two writers at one moment
   could store it) the later start wins, then the later id. `acct` — the account as the caller has it, its link day
   included (the type requires the key, so every account built by hand says what it carries). */
export interface GrantHolder { id: string; pid: string; pidFrom: string | undefined }
/* does this one row hold on `iso` for that account (the rule above, one row) */
export function grantHolds(r: UnitRows, acct: GrantHolder, g: Pick<Grant, 'from'>, iso: string, fallback: string | null): boolean {
  const s = grantStart(g, acct.pidFrom)
  return !(s && s > iso) && !homeChangesIn(r, acct.pid, s, iso, fallback).length
}
export function grantOn(r: UnitRows, acct: GrantHolder, unit: string, iso: string, fallback: string | null): Grant | undefined {
  let best: Grant | undefined, bestStart = ''
  for (const g of grantsIn(r, acct.id, unit)) {
    if (!grantHolds(r, acct, g, iso, fallback)) continue
    const s = grantStart(g, acct.pidFrom)
    if (!best || s > bestStart || (s === bestStart && g.id > best.id)) { best = g; bestStart = s }
  }
  return best
}

/* ONE CHECK FOR HOMES AND PLACES (the reshape plan §4.3, Piece B — D2238's "dated rows under one check"; R4 a, b; K1). A
   command's rows before against after, on today and every row's `from` in either image — a man's squadron, or a
   squadron's place, changes only on those (a first row reaches back over every day before it, atOn):
   1. NEVER A DAY ALREADY BEGUN — a difference on a day before tomorrow is refused (D2119; D2160 R7 for a place), save a
      first placing from today (a man, or a squadron, with none at all on that day before). A squadron made or removed
      whole by the command is not judged here (the master-only rule and "a unit removed while still named" judge it —
      "+ New squadron", its Undo and its Redo; Fable F7, Opus M3); nor a man the command itself makes (his first home is
      the squadron rows' own check).
   2. WHO — a man's squadron changing on a day: an admin, on today, of the squadron he LEAVES that day (`adminOn`) — or, in
      the Undo of his own step (`takeBack`), where the change keeps the man that day in the squadron he is in today (a
      move not yet begun, taken back), an admin of that one; the squadron he joins is never asked (K4 — his D2160; only a first placing is, by the row's own check in
      perms.ts unitRowViolation). A place row's squadron: its row's own check.
   3. NOBODY MOVES HIMSELF (the blind read's R1 — the agent's reading, as Archive and Delete refuse "yourself"): `self`, the
      actor's own person, never has his squadron changed by his own command.
   Pure: the gate (perms.ts) calls it once for the command; the doors may call it on their draft. Its code is turned into
   words by the caller; the gate's reason is never shown on screen. */
export type DatedBreach =
  | { code: 'begun'; kind: 'home' | 'place'; who: string; date: string }
  | { code: 'first-past'; kind: 'home' | 'place'; who: string; date: string }
  | { code: 'leaves'; who: string; unit: string; date: string }
  | { code: 'self'; who: string; date: string }
export function datedRowsBreach(before: UnitRows, after: UnitRows, today: string, opts: {
  pids: Iterable<string>; units: Iterable<string>; made?: ReadonlySet<string>; self?: string | null
  adminOn?: (unit: string) => boolean; takeBack?: boolean; fallback: string | null
}): DatedBreach | null {
  const tomorrow = moveFrom(today)
  const datesOf = (rows: Array<{ from: string }>) => [...new Set([today, ...rows.map(x => x.from).filter(d => typeof d === 'string')])].sort()
  for (const pid of new Set(opts.pids)) {
    if (opts.made?.has(pid)) continue
    for (const d of datesOf([...homesOf(before, pid), ...homesOf(after, pid)])) {
      const was = homeUnitOn(before, pid, d, opts.fallback), now = homeUnitOn(after, pid, d, opts.fallback)
      if (was === now) continue
      if (was == null) { if (d < today) return { code: 'first-past', kind: 'home', who: pid, date: d }; continue }
      if (d < tomorrow) return { code: 'begun', kind: 'home', who: pid, date: d }
      if (opts.self != null && pid === opts.self) return { code: 'self', who: pid, date: d }
      /* (K4 — D2160, "Undo before the date cancels it": his own move, not yet begun, is taken back by its maker's Undo —
         `takeBack`, a verified replay of his own step (D148) — as an admin of the squadron the man is in TODAY, the day
         keeping him where he is. 142's admin who moved his own man to 149 from tomorrow could not undo it: on that day the
         rows already read 149, whose admin he is not. Never a hand-made change: a move the master admin saved is not 142's
         plain admin's to cancel — the full check's F2, state/units-sqn-fixread.test.ts) */
      const here = opts.takeBack ? homeUnitOn(before, pid, today, opts.fallback) : null
      if (opts.adminOn && !opts.adminOn(was) && !(here != null && now === here && opts.adminOn(here))) return { code: 'leaves', who: pid, unit: was, date: d }
    }
  }
  for (const u of new Set(opts.units)) {
    if (!unitIn(before, u) || !unitIn(after, u)) continue
    for (const d of datesOf([...before.unitplaces, ...after.unitplaces].filter(x => x.unit === u))) {
      const was = placeIdOn(before, u, d), now = placeIdOn(after, u, d)
      if (was === now) continue
      if (was == null) { if (d < today) return { code: 'first-past', kind: 'place', who: u, date: d }; continue }
      if (d < tomorrow) return { code: 'begun', kind: 'place', who: u, date: d }
    }
  }
  return null
}

/* an ACCOUNT RECORD whose role is admin — data, never the session's role in force (perms.ts keeps that); the one reading
   for the files that judge an account record without the accounts list (units.ts, notices.ts, lastadmin.ts — D200 (3)) */
export const isAdminRole = (a: { role?: unknown } | null | undefined): boolean => !!a && a.role === 'admin'

/* AN ACCOUNT'S LEVEL IN A UNIT ON A DATE — the one answer (plan §3.4, refined): a master is admin everywhere; in his home
   unit an account's level is its own role ('admin', or 'member' for the account role 'main'); elsewhere the right that
   holds that day (grantOn); otherwise none. Plan is an admin's (the Plan audit's PA2 — D2201, D785): an `admin` right on
   an account whose role is not admin reads as no right. `acct` — the account as the caller has it (the live list, or
   the image before a command), its `role` the role the caller reads (the role in force at the gate — R7). */
/* THE SQUADRON AN ADMIN ROLE WAS GIVEN IN (the sign-in kinds review's K3 — his D2160, the transfer: "he joins as a member,
   his access, admin rights and Scheduler tick in the old squadron end on the date"). The role rides the account, and the
   home branch below read it in ANY home, so 142's admin moved to 149 arrived as 149's admin. An account's admin role now
   counts at home only in the squadron it was given in (`adminOf`), from the day it was given (`adminFrom`), and only
   while his squadron has not changed since — the grants' own reading rule (grantHolds): it ends at the start of his move
   day and never holds again, no end stored, so no Undo and no restore brings it back; in the squadron he joins he is a
   member until one of its admins, or a master admin, makes him an admin there (accounts.ts updateAccount writes the
   record anew). An account with no record (every seeded one; a row stored before the record was kept — D56): the
   squadron of his first home row, from always — the squadron he is in when this lands, for every man who has not moved.
   THE FIRST ADMIN OF A NEW SQUADRON (D2191, D2247) moves into it as its admin: the Plan "+ New squadron" gave him carries
   `first`, and it counts at home there where that Plan held on the day before he arrived. */
export interface LevelAccount extends GrantHolder { role: string; master?: boolean; adminOf?: string; adminFrom?: string }
export function adminRoleHolds(acct: LevelAccount, unit: string, iso: string, r: UnitRows, fallback: string | null): boolean {
  const given = acct.adminOf ?? homeUnitOn(r, acct.pid, '', fallback)
  const from = acct.adminOf != null && typeof acct.adminFrom === 'string' ? acct.adminFrom : ''
  /* (never before the day it was given — fix read 2, Fable 2's F3: a record dated ahead held on every day before it) */
  if (given === unit && from <= iso && !homeChangesIn(r, acct.pid, from, iso, fallback).length) return true
  /* the first admin, arrived: the day his squadron last changed, and his `first` Plan of it holding the day before */
  const arrived = homeChangesIn(r, acct.pid, '', iso, fallback).at(-1)
  if (!arrived) return false
  const eve = addDays(arrived, -1)
  return r.grants.some(g => g.account === acct.id && g.unit === unit && g.level === 'admin' && g.first === true && grantHolds(r, acct, g, eve, fallback))
}
/* THE SQUADRON A SCHEDULER TICK WAS GIVEN IN (core line 4, 22 Nov 26 — the same ruling, D2160: his "Scheduler tick in the
   old squadron end[s] on the date"). The tick rides the person (`quals.sched`), so the squadron he joined read it as its
   own. It is read as the admin role above: it counts in the squadron it was given in (the person's `schedOf`), from the
   day it was given (`schedFrom`), while his squadron has not changed since — ending at the start of his move day, no end
   stored. A person with no record (every seeded one; a tick stored before the record was kept — D56): the squadron of
   his first home row, from always. In the squadron he joins he carries none until one of its admins ticks him there
   (state/quals-write.ts writes the record anew). Asked by the sign-off boxes (engine/publish.ts signPeople). */
export function schedTickHolds(p: { schedOf?: unknown; schedFrom?: unknown } | null | undefined, pid: string, unit: string, iso: string, r: UnitRows, fallback: string | null): boolean {
  const rec = typeof p?.schedOf === 'string' && p.schedOf ? p.schedOf : null
  const given = rec ?? homeUnitOn(r, pid, '', fallback)
  const from = rec != null && typeof p?.schedFrom === 'string' ? p.schedFrom : ''
  /* (never before the day it was given — fix read 2, Fable 2's F3) */
  return given === unit && from <= iso && !homeChangesIn(r, pid, from, iso, fallback).length
}
/* (K1 — his D2253: a master admin in the member view is "a member of his own squadron holding View of the squadrons he
   could edit" — the mark answers admin only for a role that is admin, the role in force at the gate; View writes nothing) */
export function levelFrom(acct: LevelAccount | null | undefined, unit: string, iso: string, r: UnitRows, fallback: string | null): UnitLevel | null {
  if (!acct) return null
  const home = homeUnitOn(r, acct.pid, iso, fallback) === unit
  if (acct.master) return acct.role === 'admin' ? 'admin' : home ? 'member' : 'view'
  if (home) return acct.role === 'admin' && adminRoleHolds(acct, unit, iso, r, fallback) ? 'admin' : 'member'
  const g = grantOn(r, acct, unit, iso, fallback)
  if (!g) return null
  /* (…and an admin is one whose role counts in the squadron he is at home in that day — K3: an admin who moved squadron
     is a member there, and a member holds no Plan, D2250) */
  if (g.level === 'admin') {
    const h = homeUnitOn(r, acct.pid, iso, fallback)
    if (acct.role !== 'admin' || (h != null && !adminRoleHolds(acct, h, iso, r, fallback))) return null
  }
  return g.level
}

/* the date a move counts from: the next day's start (D2119) — a move typed today never rewrites today */
export const moveFrom = (today: string): string => addDays(today, 1)
