// THE LEAVE YEAR — a person's leave figures, one engine every screen reads (the Leave War overhaul's M5a; the build spec
// `docs/superpowers/plans/2026-10-28-lw-m5a-build-spec.md` §1, his rulings D1479, D1224, D1235, D1473, D1474, D1489,
// D1490, D1492).
//
// WHAT IS STORED. For LVE, CCL, FCL, PL, EL and CL, the figure last TYPED from the official leave app (D1479) — the
// figure, for LVE its carried-forward part, the DAY it was typed (the app's today), who typed it, and THE SNAPSHOT: the
// days of his approved leave of that kind as they stood at that moment, a day or a half at a time, never a total. OIL is
// never typed (D1209, D1255) — it stays the OIL tracker's ledger.
//
// HOW A FIGURE IS WORKED OUT (§1.3). For each date, `delta` = what his approved leave charges there NOW less what the
// snapshot charges there NOW — both charged by today's periods, holidays and runs (charge.ts `chargedDays`), so leave
// already approved when he typed never moves the figure, a leave approved since comes off, one shortened or deleted
// gives its days back. The deltas are summed by year (`net`), a date before the typing year counting in the typing year.
//   - CCL, FCL, PL, EL, CL: App bal = typed − every net. No years, no roll-over (D1489).
//   - LVE: two pools, carried forward (CF) and this year's (AN). Each year's net comes off carried-forward first (D1224);
//     days given back first cancel days taken that year and only the rest return to this year's leave, never to CF
//     (reading 18). On each 1 Jan after the typing year, up to this year (D1235, D1474): CF left goes, AN becomes the
//     new CF (nothing if below zero), and the grade's days held on that 1 Jan are added to what was overdrawn (−2 + 33 =
//     31). Days in a year after this one come off the total only (D1479, D1218).
//   - Never typed: read as typed 0 on 1 Jan of the war's first year, snapshot empty (finding 5, reading 4) — an old
//     bare-number opening (demo data, D56) the same, its number as the figure.
// War bal is the same formula with his pending leave counted as approved; Pending = App bal − War bal (D1479).
//
// A DATE NO PERIOD COVERS is charged by the plain rule — a weekday 1, a half .5, Saturday and Sunday 0, no holidays known
// (§1.2, reading 17): `chargedDays` already does that for a date its sources hold no period for (eventdefs.ts
// `isNonWorkingDay` with no day); what was missing was the leave itself, which this module is handed whole (`DayRecs` —
// every absence from the Inputs on every date, and the war's requests).
//
// Pure: no store, no clock — the caller hands in today (the app's, `memberToday`, so a moved test clock and the real one
// never disagree — finding 6).

import { chargedDays, type CountCtx, type LeaveSource, type Taken } from './charge'
import type { CounterName } from './codes'
import type { Ledger, Openings } from './counters'
import { AM, dayView, FULL, overlaps, PM, portionOf, type Contrib, type DayView, type Win } from './dayview'

/** The kinds a person's figure is typed for, in the order the screens list them. */
export type BalKind = 'LVE' | 'CCL' | 'FCL' | 'PL' | 'EL' | 'CL'
export const BAL_KINDS: readonly BalKind[] = Object.freeze(['LVE', 'CCL', 'FCL', 'PL', 'EL', 'CL'] as BalKind[])
export const isBalKind = (k: unknown): k is BalKind => typeof k === 'string' && (BAL_KINDS as readonly string[]).includes(k)
/** the counter each kind is charged to (codes.ts LEAVE_TYPES — LL and OL both spend LVE's `annual`) */
export const KIND_COUNTER: Readonly<Record<BalKind, CounterName>> = Object.freeze({ LVE: 'annual', CCL: 'ccl', FCL: 'fcl', PL: 'pl', EL: 'el', CL: 'cl' })
/* the code a snapshot's day is rebuilt with — for LVE either of LL / OL charges the same and continues the same run */
const KIND_CODE: Readonly<Record<BalKind, string>> = { LVE: 'LL', CCL: 'CCL', FCL: 'FCL', PL: 'PL', EL: 'EL', CL: 'CL' }

/** One day of a snapshot: the date and which part of it — the morning, the afternoon or the whole day. */
export type SnapHalf = 'am' | 'pm' | 'day'
export type SnapEntry = [string, SnapHalf]

/** A figure as last typed (§1.1, the build spec §3 `lw.balance`). */
export interface TypedBal {
  amount: number
  /** LVE only: how much of `amount` is carried forward */
  cf?: number
  /** the app's today when it was typed */
  day: string
  /** who typed it — the person's id */
  by: string
  /** his approved leave of this kind as it stood then, sorted by date then half */
  snap: SnapEntry[]
}
/** pid → kind → the figure last typed */
export type Balances = Record<string, Partial<Record<BalKind, TypedBal>>>

/** A leave grade of the squadron's list (D1229, D1234). `days` is dated so a change counts from the next 1 Jan (D1490);
 *  a deleted grade keeps its days and the day it went (`goneFrom`), so a 1 Jan before it still reads them (finding 11). */
export interface GradeDef { id: string; name: string; order: number; days: { n: number; from: string }[]; goneFrom?: string }
/** A person's grade over time: `id` null is "No grade"; `from` the day it was set (D1490 — it counts from the next 1 Jan). */
export interface GradeEntry { id: string | null; from: string }
export type GradeHists = Record<string, GradeEntry[]>

/** The list the squadron starts with (D1229), FIXED ids so a man's grade never points at nothing after a reload. */
const EVER = '0001-01-01'
export const START_GRADES: readonly GradeDef[] = Object.freeze([
  { id: 'sp', name: 'Senior pilot', order: 0, days: [{ n: 36, from: EVER }] },
  { id: 'jp', name: 'Junior pilot', order: 1, days: [{ n: 33, from: EVER }] },
  { id: 'sw', name: 'Senior WSO', order: 2, days: [{ n: 21, from: EVER }] },
  { id: 'jw', name: 'Junior WSO', order: 3, days: [{ n: 18, from: EVER }] },
  { id: 'opsa', name: 'Ops A', order: 4, days: [{ n: 14, from: EVER }] },
])

/** date → every record of one person there: his absences from the Inputs (approved leave, medical, courses …) and the
 *  war's requests. Credits and notices may ride along; nothing here charges them. */
export type DayRecs = ReadonlyMap<string, readonly Contrib[]>

/** Everything beyond one man's days that a figure needs. */
export interface LeaveYearWorld {
  /** the wars — read ONLY for their periods (which days are holidays); their views are never read here */
  wars: readonly LeaveSource[]
  /** the event types and the roster (who is a pilot — the 15-day run), off-roster identities included (§4) */
  ctx: CountCtx
  /** the app's today, yyyy-mm-dd */
  today: string
  balances: Balances
  /** the old bare-number openings — read once as never-typed figures (demo data, D56); OIL's are never read here */
  openings: Openings
  ledger: Ledger
  grades: readonly GradeDef[]
  gradeHist: GradeHists
}

const yearOf = (d: string): number => Number(d.slice(0, 4))
const jan1 = (y: number): string => `${String(y).padStart(4, '0')}-01-01`
/* figures are halves; summing them can leave 1e-15 dust or a −0 */
const tidy = (x: number): number => Math.round(x * 1e6) / 1e6 || 0

/** The year a never-typed figure starts in: the war's earliest period's, else today's (finding 5). */
export function startYear(w: Pick<LeaveYearWorld, 'wars' | 'today'>): number {
  let y = yearOf(w.today)
  for (const s of w.wars) if (s.period && yearOf(s.period.start) < y) y = yearOf(s.period.start)
  return y
}

/* the wars as period-only sources — what `chargedDays` reads holidays from — remembered per wars array */
const PERIOD_ONLY = new WeakMap<readonly LeaveSource[], LeaveSource[]>()
function periodSources(wars: readonly LeaveSource[]): LeaveSource[] {
  let hit = PERIOD_ONLY.get(wars)
  if (!hit) {
    hit = wars.map(w => ({ grid: {}, states: {}, views: {}, ...(w.period ? { period: w.period } : {}) }))
    PERIOD_ONLY.set(wars, hit)
  }
  return hit
}

/** A person's day views of the records `keep` lets through. */
function viewRow(days: DayRecs, keep: (c: Contrib) => boolean): Record<string, DayView> {
  const out: Record<string, DayView> = {}
  for (const [date, list] of days) {
    const kept = list.filter(keep)
    if (kept.length) out[date] = dayView(kept)
  }
  return out
}
const isApproved = (c: Contrib) => c.kind === 'absence'
const isApprovedOrPending = (c: Contrib) => c.kind === 'absence' || (c.kind === 'request' && c.state !== 'refused')

/** What a row charges, date by date, under today's periods, holidays and runs. */
function chargesOf(w: LeaveYearWorld, pid: string, row: Record<string, DayView>): Map<string, Taken[]> {
  return chargedDays([...periodSources(w.wars), { grid: {}, states: {}, views: { [pid]: row } }], pid, w.ctx)
}
function amountsFor(charges: Map<string, Taken[]>, counter: CounterName): Map<string, number> {
  const out = new Map<string, number>()
  for (const [date, list] of charges) {
    let n = 0
    for (const t of list) if (t.counter === counter) n += t.amount
    if (n) out.set(date, n)
  }
  return out
}

/** THE SNAPSHOT the store keeps with a typed figure (§1.1): his approved leave of `kind` as it stands, a day or a half at
 *  a time, before any weekend or holiday rule — what each day's leave takes, as its day view charges it. Sorted by date,
 *  then half. Deterministic, so the gate can rebuild it and compare (the build spec §3, finding 9). */
export function snapshotOf(days: DayRecs, kind: BalKind): SnapEntry[] {
  const counter = KIND_COUNTER[kind]
  const out: SnapEntry[] = []
  for (const date of [...days.keys()].sort()) {
    const approved = days.get(date)!.filter(isApproved)
    if (!approved.length) continue
    let am = false, pm = false
    for (const ch of dayView(approved).charges) {
      if (ch.counter !== counter) continue
      if (ch.amount >= 1) { am = true; pm = true } else if (ch.half === 'am') am = true; else pm = true
    }
    if (am && pm) out.push([date, 'day'])
    else if (am) out.push([date, 'am'])
    else if (pm) out.push([date, 'pm'])
  }
  return out
}
const HALF_RANK: Record<SnapHalf, number> = { am: 0, pm: 1, day: 2 }
/** two snapshots the same, compared sorted by date then half */
export function sameSnapshot(a: readonly SnapEntry[], b: readonly SnapEntry[]): boolean {
  const key = (s: readonly SnapEntry[]) => s.slice().sort((x, y) => (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : HALF_RANK[x[1]] - HALF_RANK[y[1]])).map(e => `${e[0]}${e[1]}`).join(',')
  return a.length === b.length && key(a) === key(b)
}
/* a snapshot as the day views it stood for, so it can be charged NOW like today's leave */
function snapRow(snap: readonly SnapEntry[], kind: BalKind): Record<string, DayView> {
  const out: Record<string, DayView> = {}
  const code = KIND_CODE[kind]
  for (const [date, half] of snap) {
    const win: Win = half === 'am' ? AM : half === 'pm' ? PM : FULL
    out[date] = dayView([{ id: `snap:${date}:${half}`, kind: 'absence', code, win, lw: true }])
  }
  return out
}

/** The figure a kind starts from: the one typed, else an old bare-number opening, else 0 — the never-typed two on 1 Jan
 *  of the war's first year with an empty snapshot (finding 5). */
export function typedOrStart(w: LeaveYearWorld, pid: string, kind: BalKind): TypedBal {
  const t = w.balances[pid]?.[kind]
  if (t) return t
  const old = w.openings[pid]?.[KIND_COUNTER[kind]]
  return { amount: typeof old === 'number' && Number.isFinite(old) ? old : 0, cf: 0, day: jan1(startYear(w)), by: '', snap: [] }
}

/** The days a person's grade adds on 1 Jan of `y` (D1235, D1474 — none for no grade; D1490 — the grade and its days as
 *  they held on that 1 Jan). */
export function gradeDaysOn(w: Pick<LeaveYearWorld, 'grades' | 'gradeHist'>, pid: string, y: number): number {
  const on = jan1(y)
  const id = gradeOn(w, pid, on)
  if (!id) return 0
  const g = w.grades.find(x => x.id === id)
  if (!g || (g.goneFrom && g.goneFrom <= on)) return 0
  let n = 0
  for (const d of g.days) if (d.from <= on) n = d.n
  return n
}
/** His grade's id on a day (null for none). */
export function gradeOn(w: Pick<LeaveYearWorld, 'gradeHist'>, pid: string, day: string): string | null {
  let id: string | null = null
  for (const e of w.gradeHist[pid] ?? []) if (e.from <= day) id = e.id
  return id
}

/** One kind's figure out of its typed start and the net of each year (§1.3). */
function runYears(kind: BalKind, t: TypedBal, net: Map<number, number>, thisYear: number, grade: (y: number) => number): { total: number; cf: number } {
  const y0 = yearOf(t.day)
  if (kind !== 'LVE') {
    let total = t.amount
    for (const n of net.values()) total -= n
    return { total: tidy(total), cf: 0 }
  }
  let cf = Math.max(0, Math.min(t.cf ?? 0, Math.max(t.amount, 0)))
  let an = t.amount - cf
  /* the year's rule (narrow read 8): taken days off carried-forward first; days given back to this year's leave only */
  const year = (y: number, c: number) => {
    const n = net.get(y) ?? 0
    if (n >= 0) { cf = Math.max(0, c - n); an -= Math.max(0, n - c) }
    else { cf = c; an -= n }
  }
  year(y0, cf)
  for (let y = y0 + 1; y <= thisYear; y++) {
    const newCf = Math.max(0, an)
    an = grade(y) + Math.min(0, an)
    year(y, newCf)
  }
  let later = 0
  for (const [y, n] of net) if (y > Math.max(thisYear, y0)) later += n
  return { total: tidy(cf + an - later), cf: tidy(cf) }
}

/** One kind's figures for a person. `cf` is LVE's carried forward, this year's (0 for every other kind). */
export interface KindFigures { kind: BalKind; app: number; war: number; pending: number; cf: number; typed: TypedBal | null }
export interface PersonFigures {
  kinds: Record<BalKind, KindFigures>
  /** his approved LVE days charged from 1 Jan of this year up to today (the LVE tile's "3 taken") */
  lveTaken: number
  /** medical days this year up to today, calendar days, a half .5 (MED's tile) */
  medTaken: number
  /** when this year's carried forward ends (the tile's "till 31 Dec") */
  cfTill: string
}

/** The records a leave FILL would leave on these dates — the bid windows' "what is left if I place this" and the
 *  below-zero ask (D418), read through the same engine (finding 12). The undecided requests on the half (or halves) the
 *  new one takes are replaced, everything else on the day stays — counters.ts `fillRow`'s rule. */
export interface WhatIf { dates: readonly string[]; code: string; portion?: 'full' | 'am' | 'pm' }
function withWhatIf(days: DayRecs, f: WhatIf | undefined): DayRecs {
  if (!f || !f.dates.length) return days
  const win: Win = f.portion === 'am' ? AM : f.portion === 'pm' ? PM : FULL
  const add = (d: string): Contrib => ({ id: `fill:${d}`, kind: 'request', code: f.code, win, state: 'pending' })
  const out = new Map(days)
  for (const d of f.dates) {
    const kept = (out.get(d) ?? []).filter(c => !(c.kind === 'request' && c.state !== 'refused' && overlaps(c.win, win)))
    out.set(d, [...kept, add(d)])
  }
  return out
}

/** EVERY FIGURE OF ONE PERSON (§1.3–1.4): App bal, carried forward, Pending and War bal for each kind, and the tiles'
 *  taken figures. `whatIf` adds a fill to his pending leave (War bal then answers "what is left if I place this"). */
export function personFigures(w: LeaveYearWorld, pid: string, days: DayRecs, whatIf?: WhatIf): PersonFigures {
  const thisYear = yearOf(w.today)
  const pend = withWhatIf(days, whatIf)
  const nowCh = chargesOf(w, pid, viewRow(days, isApproved))
  const warCh = whatIf || [...days.values()].some(l => l.some(c => c.kind === 'request' && c.state !== 'refused'))
    ? chargesOf(w, pid, viewRow(pend, isApprovedOrPending))
    : nowCh
  const grade = (y: number) => gradeDaysOn(w, pid, y)
  const kinds = {} as Record<BalKind, KindFigures>
  for (const kind of BAL_KINDS) {
    const counter = KIND_COUNTER[kind]
    const t = typedOrStart(w, pid, kind)
    const y0 = yearOf(t.day)
    const snap = t.snap.length ? amountsFor(chargesOf(w, pid, snapRow(t.snap, kind)), counter) : new Map<string, number>()
    const netOf = (charges: Map<string, Taken[]>) => {
      const net = new Map<number, number>()
      const now = amountsFor(charges, counter)
      for (const d of new Set([...now.keys(), ...snap.keys()])) {
        const delta = (now.get(d) ?? 0) - (snap.get(d) ?? 0)
        if (!delta) continue
        const y = Math.max(yearOf(d), y0)
        net.set(y, (net.get(y) ?? 0) + delta)
      }
      /* a grant dated on or after the day typed still counts (the build spec §4), as days given back in its year */
      for (const e of w.ledger) {
        if (e.personId !== pid || e.counter !== counter || e.date < t.day) continue
        const y = Math.max(yearOf(e.date), y0)
        net.set(y, (net.get(y) ?? 0) - e.amount)
      }
      return net
    }
    const app = runYears(kind, t, netOf(nowCh), thisYear, grade)
    const war = warCh === nowCh ? app : runYears(kind, t, netOf(warCh), thisYear, grade)
    kinds[kind] = { kind, app: app.total, war: war.total, pending: tidy(app.total - war.total), cf: app.cf, typed: w.balances[pid]?.[kind] ?? null }
  }
  const from = jan1(thisYear)
  let lveTaken = 0
  for (const [d, n] of amountsFor(nowCh, 'annual')) if (d >= from && d <= w.today) lveTaken += n
  return { kinds, lveTaken: tidy(lveTaken), medTaken: calendarDays(days, MED_CODES, from, w.today), cfTill: `${thisYear}-12-31` }
}

const MED_CODES: readonly string[] = ['ATTC', 'HL', 'OML']
/* approved records of these codes, a whole day 1 and a half .5, every day of the week — medical and duty away are not
   charged against a balance, so weekends count (reading 20) */
function calendarDays(days: DayRecs, codes: readonly string[], from: string, to: string): number {
  let n = 0
  for (const [d, list] of days) {
    if (d < from || d > to) continue
    let am = false, pm = false
    for (const c of list) {
      if (c.kind !== 'absence' || c.spill || !codes.includes(c.code)) continue
      const p = portionOf(c.win)
      if (p !== 'pm') am = true
      if (p !== 'am') pm = true
    }
    n += (am ? 0.5 : 0) + (pm ? 0.5 : 0)
  }
  return tidy(n)
}

/** The columns of the Balances page's "Days taken" view (D1484), in its order. */
export const DAYS_TAKEN_COLS = Object.freeze(['LL', 'OL', 'OIL', 'CCL', 'FCL', 'PL', 'EL', 'CL', 'MED', 'CSE', 'OD'] as const)
export type DaysTakenCol = typeof DAYS_TAKEN_COLS[number]

/** DAYS TAKEN over a range (D1484 — the View period), up to today, approved only (reading 20): the leave kinds as charged
 *  (weekends free), MED, CSE and OD as calendar days. */
export function daysTaken(w: LeaveYearWorld, pid: string, days: DayRecs, from: string, to: string): Record<DaysTakenCol, number> {
  const end = to < w.today ? to : w.today
  const out = Object.fromEntries(DAYS_TAKEN_COLS.map(k => [k, 0])) as Record<DaysTakenCol, number>
  if (end < from) return out
  for (const [d, list] of chargesOf(w, pid, viewRow(days, isApproved))) {
    if (d < from || d > end) continue
    for (const t of list) if (t.type in out) out[t.type as DaysTakenCol] += t.amount
  }
  out.MED = calendarDays(days, MED_CODES, from, end)
  out.CSE = calendarDays(days, ['CSE'], from, end)
  out.OD = calendarDays(days, ['OD'], from, end)
  for (const k of DAYS_TAKEN_COLS) out[k] = tidy(out[k])
  return out
}

/** The grid's second line beside a name (§1.4, finding 12): his LL and OL days in the range, approved and pending, as
 *  charged ("12.5 / 7.5" — 5 approved + 2.5 pending). */
export function annualUsedIn(w: LeaveYearWorld, pid: string, days: DayRecs, from: string, to: string): number {
  let n = 0
  for (const [d, list] of chargesOf(w, pid, viewRow(days, isApprovedOrPending))) {
    if (d < from || d > to) continue
    for (const t of list) if (t.type === 'LL' || t.type === 'OL') n += t.amount
  }
  return tidy(n)
}
