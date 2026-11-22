/* ADMIN → USERS — THE FILTER AND A MASTER ADMIN'S GROUPED LIST (batch 1's second half §4 items 1–2; his D2335, D2307 —
   one Filter button by the search, tick groups; D2306 — the Role tick "Plans 149"; D2270 — a master admin's squadrons,
   each under its own heading; D2321 — a chip per squadron however many; D322 — rows only hidden, A to Z kept; the
   drawings docs/mock/2026-11-22-msq-b1-screens/img/nfa–nfd, n1c0, f5c-p). Pure reads, no screen: ui/UsersPanel.tsx draws
   what this answers.

   - Seat, CAT, Role: several ticks in one group mean any of them; the groups combine (all of them).
     Seat — Pilots, WSOs, Personnel (the row's own words, UsersPanel seatText). CAT — the CATs held on the list.
     Role — by his account, as his row's badge reads it (accounts.ts isAdminAccount): "Member" a sign-in that is not an
     admin's; "Admin" an admin who is not a master admin (the drawing's one role each — Saber shows under "Master admin");
     "Plans 149" a man of another squadron holding Plan of the page's squadron that day (R-O4 — the Plan holders the list
     carries); "Master admin". A man with no sign-in holds no role, so a Role tick hides him.
   - Squadron, a master admin's alone: the squadrons in view. None ticked: the page's squadron, as before. Ticked: those
     squadrons' people, each squadron under its heading ("149 · 10"), each group A to Z, a man of a squadron other than
     the page's wearing its grey number (UsersPanel otherSqnOf). A search still finds a man of a squadron not in view
     (5b — to give him View): he shows under his own squadron's heading.
   - The count on the button: one a tick; every squadron ticked counts as one — it is everyone (picture nfc, two of two;
     f5c-p: two of eight are two).
   - The line over the list: "Showing 1 of 61 · Clear" — the rows shown of the rows the list would show with no Seat, CAT
     or Role tick; every squadron of two ticked and nothing else: "Showing both squadrons, grouped · Clear" (picture nfc). */
import { PEOPLE } from '../engine/people'
import { accountOfPid, isAdminAccount, levelAcct } from '../state/accounts'
import { units, unitById, grantOfOn, homeOn } from '../state/units'
import { adminOfUnit } from '../state/perms'
import { usersListOf } from './userslist-model'

export type SeatTick = 'Pilots' | 'WSOs' | 'Personnel'
export type RoleTick = 'member' | 'admin' | 'plans' | 'master'
export interface UsersFilter { seat: SeatTick[]; cat: string[]; role: RoleTick[]; sqn: string[] }
export const NO_FILTER: UsersFilter = { seat: [], cat: [], role: [], sqn: [] }
export type FilterGroup = keyof UsersFilter

export const SEAT_TICKS: SeatTick[] = ['Pilots', 'WSOs', 'Personnel']
export const ROLE_TICKS: RoleTick[] = ['member', 'admin', 'plans', 'master']
/* the CATs in the drawing's order (IP, IW, A, B, C, OCU), the rest of the app's CATs where they fall */
const CAT_ORDER = ['IP', 'IW', 'IR', 'FI', 'A', 'B', 'C', 'D', 'OCU']

const P = (pid: string): any => (PEOPLE as any)[pid]
const num = (u: string): string => String(unitById(u)?.num ?? u)
const byNum = (a: string, b: string) => num(a).localeCompare(num(b), undefined, { numeric: true })
const byCs = (x: string, y: string) => String(P(x)?.cs ?? '').localeCompare(String(P(y)?.cs ?? ''))

export const roleWord = (r: RoleTick, unit: string): string =>
  r === 'member' ? 'Member' : r === 'admin' ? 'Admin' : r === 'plans' ? `Plans ${num(unit)}` : 'Master admin'

export function seatOf(pid: string): SeatTick {
  const p = P(pid)
  return p && (p.pers || p.seat === 'GND') ? 'Personnel' : p && p.seat === 'FCP' ? 'Pilots' : 'WSOs'
}
const catOf = (pid: string): string | null => (seatOf(pid) === 'Personnel' ? null : (P(pid)?.q ? String(P(pid).q) : null))
function rolesOf(pid: string, unit: string, iso: string): RoleTick[] {
  const a = accountOfPid(pid)
  if (!a) return []
  const out: RoleTick[] = []
  if (a.master) out.push('master')
  else if (isAdminAccount(a)) out.push('admin')
  else out.push('member')
  if (homeOn(pid, iso) !== unit && grantOfOn(levelAcct(a), unit, iso)?.level === 'admin') out.push('plans')
  return out
}

/* the Squadron ticks a viewer may set: a master admin's alone (D2335) — anyone else's are none */
const sqnTicks = (f: UsersFilter, master: boolean): string[] => (master ? f.sqn.filter(u => !!unitById(u)) : [])
/* does this man pass the Seat, CAT and Role ticks (`unit` — the page's squadron, whose Plan "Plans 149" asks)? */
export function keeps(f: UsersFilter, pid: string, unit: string, iso: string): boolean {
  if (f.seat.length && !f.seat.includes(seatOf(pid))) return false
  if (f.cat.length && !f.cat.includes(catOf(pid) ?? '')) return false
  const want = new Set(f.role)
  if (want.size && !rolesOf(pid, unit, iso).some(r => want.has(r))) return false
  return true
}
/* the button's count (D2335 "a set filter lights the button with its count") */
export function filterCount(f: UsersFilter, master: boolean): number {
  const sq = new Set(sqnTicks(f, master))
  const every = sq.size > 0 && units().every(u => sq.has(u.id))
  return f.seat.length + f.cat.length + f.role.length + (every ? 1 : sq.size)
}
export const toggleTick = (f: UsersFilter, g: FilterGroup, v: string): UsersFilter => {
  const on = (f[g] as string[]).includes(v)
  return { ...f, [g]: on ? (f[g] as string[]).filter(x => x !== v) : [...(f[g] as string[]), v] }
}

export interface UsersGroup { unit: string; head: string | null; rows: string[] }
export interface UsersView {
  groups: UsersGroup[]          // the roster rows, one group (head null) or one a squadron
  archived: string[]            // the Archived fold's rows, search and ticks applied
  archivedAll: number           // its count on the fold's button: ticks applied, no search
  people: number                // "People · 61": the squadrons in view's own people
  shown: number; of: number     // the rows shown, of those the list would show with no Seat, CAT or Role tick
  line: string | null           // "Showing 1 of 61" (· Clear drawn beside it), or null with nothing ticked
  cats: string[]                // the CAT chips: the CATs held on the list, a ticked one kept
}
export function usersView(unit: string, iso: string, query: string, f: UsersFilter, master: boolean): UsersView {
  const sq = sqnTicks(f, master)
  const inView = sq.length ? [...sq].sort(byNum) : [unit]
  const grouped = !(inView.length === 1 && inView[0] === unit)
  const lists = inView.map(u => ({ u, l: usersListOf(u, iso, query), all: usersListOf(u, iso, '') }))
  const placed = new Set<string>()
  const rowsOf = new Map<string, string[]>()
  const put = (u: string, pid: string) => { if (placed.has(pid)) return; placed.add(pid); (rowsOf.get(u) ?? rowsOf.set(u, []).get(u)!).push(pid) }
  /* each squadron's own first, so a Plan holder of another squadron in view shows once, under his home */
  for (const { u, l } of lists) for (const pid of l.own) put(u, pid)
  for (const { u, l } of lists) for (const pid of l.planners) put(u, pid)
  /* a search's find of a man of a squadron not in view: under his own squadron when grouped, on the one list when not */
  const found = lists[0]!.l.found
  for (const pid of found) if (!placed.has(pid)) put(grouped ? (homeOn(pid, iso) ?? unit) : unit, pid)
  const units_ = [...rowsOf.keys()].sort(byNum)
  const before = units_.reduce((n, u) => n + rowsOf.get(u)!.length, 0)
  const groups: UsersGroup[] = []
  for (const u of grouped ? units_ : [unit]) {
    const rows = (rowsOf.get(u) ?? []).sort(byCs).filter(pid => keeps(f, pid, unit, iso))
    if (grouped && !rows.length) continue
    groups.push({ unit: u, head: grouped ? `${num(u)} · ${usersListOf(u, iso, '').count}` : null, rows })
  }
  const arch = (ls: string[]) => [...new Set(ls)].sort(byCs).filter(pid => keeps(f, pid, unit, iso))
  const shown = groups.reduce((n, g) => n + g.rows.length, 0)
  const n = filterCount(f, master)
  const onlyBoth = grouped && units().length === 2 && inView.length === 2 && !f.seat.length && !f.cat.length && !f.role.length
  const held = new Set<string>()
  for (const { l, all } of lists) for (const pid of [...all.own, ...all.planners, ...l.found]) { const c = catOf(pid); if (c) held.add(c) }
  for (const c of f.cat) held.add(c)
  return {
    groups,
    archived: arch(lists.flatMap(x => x.l.archived)),
    archivedAll: arch(lists.flatMap(x => x.all.archived)).length,
    people: lists.reduce((t, x) => t + x.l.count, 0),
    shown, of: before,
    line: !n ? null : onlyBoth ? 'Showing both squadrons, grouped' : `Showing ${shown} of ${before}`,
    cats: CAT_ORDER.filter(c => held.has(c)).concat([...held].filter(c => !CAT_ORDER.includes(c)).sort()),
  }
}

/* ADD A PERSON'S "HOME SQUADRON" (§4 item 7 — picture b1-7): the squadrons the signed-in admin is an admin of (his own,
   one he holds Plan of, every one for a master admin — perms.ts adminOfUnit, the door's own test, roster-add.ts
   newHomeProblem), the page's own first, the rest by number */
export function addHomeChoices(unit: string): string[] {
  const mine = units().map(u => u.id).filter(u => adminOfUnit(u)).sort(byNum)
  return mine.includes(unit) ? [unit, ...mine.filter(u => u !== unit)] : mine
}
