// src/state/weekrows.ts
/* A WEEK AS ROWS ([DB-READINESS] group A, phase 1.1 — plan §2.5, §2.9; data-model.md §3 ScheduleWeek, Amendment).
   The app keeps a week in memory as one record (the stash blob — state/store.ts weekStashSnap: `d`, the SCHED short
   fields, `wo`). Storage keeps it as the rows of the tables the IT team is designing, so two people on two days of one
   week never write the same row:

   - the WEEK ROW (`ScheduleWeek`) — the two format stamps, `v` and `am`, and nothing else;
   - seven DAY ROWS (`ScheduleDay`) — the day itself and every field that names it: the marks keyed by slot key, split
     by the day the key names (`c`, `p`, `ad`); every map keyed by day index (`ok`, `sg`, `sb`, `cv`, `dr`, `cd`, `cr`);
     the muted warnings (`wo`, whose key leads with the day);
   - one ISSUANCE ROW per version that ever went out (`Amendment`) — the Original is sequence 0, an AL its number; keyed
     `<verId>~<n>`, n = how many times that version had been withdrawn before it went out (0 the first time), so a
     same-label reissue is a new row beside the old one. APPEND-ONLY: an Unpublish never touches it;
   - one RETRACTION ROW per Unpublish (`AmendmentRetraction`) — who and when; keyed like the issuance it withdraws.

   Not stored: `al` (no reader) and `un` (the requests a scheduler took off — worked out on read from each request's own
   "taken off" mark, F3-02). A key or field that names no single day FAILS the split loudly (RowShapeError): a new SCHED
   field added without a home here is caught the first time the week is saved, never silently dropped.

   The row ids hang off the week's id (dd-mm-yyyy): `` (the week row), `#<di>`, `:is:<verId>~<n>`, `:rx:<verId>~<n>`.
   A version id carries a `#` (`2026-07-13#1`), so an id is read issuance-first (F3-09).

   The same split serves three callers: the command layer's per-day records (state/sched-commit.ts decompose — a day's
   day, book slice and mutes, the week's stamps, each issuance and retraction), the saved-week records of the weeks not
   on screen (state/store.ts weekstashStore), and the stored rows (state/persist.ts, state/rowmap.ts). */
import { keyDay } from '../engine/keys'
import { isValidVerId, parseVerId, verSeq, dayIso } from '../engine/verid'
import { RID_BOOK_VERSION } from '../engine/rowids'
import { AMBOOK_VERSION, retiredEntry } from '../engine/publish'
import { emptyWeek } from '../engine/weeks-data'

export class RowShapeError extends Error {
  constructor(message: string) { super(message); this.name = 'RowShapeError' }
}

/** a week's rows, by the suffix each row's id carries after the week's id → the stored row (JSON) */
export type WeekRows = Record<string, string>

/** the fields of a day's slice of the book, in the order a row writes them */
export const BOOK_BY_KEY = ['c', 'p', 'ad'] as const
export const BOOK_BY_DAY = ['ok', 'sg', 'sb', 'cv', 'dr', 'cd', 'cr'] as const
const BOOK_ORDER = [...BOOK_BY_KEY, ...BOOK_BY_DAY]
/* every field a saved week carries; `al` and `un` are read and dropped */
const KNOWN = new Set(['d', ...BOOK_ORDER, 'a', 'al', 'o', 'v', 'am', 'rt', 'wo', 'un'])
const isDayIx = (k: string) => /^[0-6]$/.test(k)
const isMap = (m: any) => !!m && typeof m === 'object' && !Array.isArray(m)
const has = (o: any, k: string) => Object.prototype.hasOwnProperty.call(o, k)

/** One day's part of a week: the day, its slice of the book, its muted warnings */
export type DayPart = { d: any; book: Record<string, any>; wo: string[] }
/** A week in parts — what the rows hold, as objects */
export type WeekParts = {
  week: { v?: any; am?: any }
  days: DayPart[]
  /** `<verId>~<n>` → the issued record, in the order of day, sequence and n */
  is: Array<[string, any]>
  /** `<verId>~<n>` → the retraction of that issuance */
  rx: Array<[string, any]>
}

/* ---- ids ---------------------------------------------------------------- */

export type RowId =
  | { week: string; kind: 'week' }
  | { week: string; kind: 'day'; di: number }
  | { week: string; kind: 'is' | 'rx'; ver: string; n: number }

/** `<verId>~<n>` → its parts, or null (the `~` is the last one; a verId never carries it) */
export function parseVerN(vn: string): { ver: string; n: number } | null {
  const i = vn.lastIndexOf('~')
  if (i < 0) return null
  const ver = vn.slice(0, i), ns = vn.slice(i + 1)
  if (!isValidVerId(ver) || !/^\d+$/.test(ns)) return null
  return { ver, n: +ns }
}

/** what a stored row id names — the issuance / retraction test runs BEFORE the day's `#` (F3-09) */
export function parseRowId(id: string): RowId | null {
  const c = id.indexOf(':')
  if (c >= 0) {
    const week = id.slice(0, c), rest = id.slice(c + 1)
    const kind = rest.startsWith('is:') ? 'is' : rest.startsWith('rx:') ? 'rx' : null
    if (!kind) return null
    const vn = parseVerN(rest.slice(3))
    return vn ? { week, kind, ver: vn.ver, n: vn.n } : null
  }
  const h = id.indexOf('#')
  if (h < 0) return { week: id, kind: 'week' }
  const d = id.slice(h + 1)
  return isDayIx(d) ? { week: id.slice(0, h), kind: 'day', di: +d } : null
}

/** the suffix of a row within its week (the part of the id after the week's id) */
export function rowSuffix(id: RowId): string {
  if (id.kind === 'week') return ''
  if (id.kind === 'day') return `#${id.di}`
  return `:${id.kind}:${id.ver}~${id.n}`
}

/** the day of week `wk` (dd/mm/yyyy) an ISO date falls on, or -1 */
export function dayIndexOf(wk: string, iso: string): number {
  for (let di = 0; di < 7; di++) if (dayIso(wk, di) === iso) return di
  return -1
}

/* ---- the split ---------------------------------------------------------- */

/** a day's book slice in the order a row writes it, empty maps left out */
export function canonicalBook(book: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {}
  for (const f of BOOK_ORDER) {
    if (!has(book, f)) continue
    const v = book[f]
    if ((BOOK_BY_KEY as readonly string[]).includes(f) && (!isMap(v) || !Object.keys(v).length)) continue
    out[f] = v
  }
  return out
}
/** a day row, as stored */
export function dayRowJSON(p: DayPart): string {
  const row: Record<string, any> = { d: p.d, ...canonicalBook(p.book) }
  if (p.wo && p.wo.length) row.wo = p.wo
  return JSON.stringify(row)
}
export const weekRowJSON = (w: { v?: any; am?: any }) => JSON.stringify({ v: w.v, am: w.am })
/** a retraction row — the facts of the Unpublish, never the issued record (it stays in its issuance row) */
export const retractionOf = (e: any) => ({ at: e && e.at, by: e && e.by, restoreSeq: e && e.restoreSeq, logged: !!(e && e.logged) })

/* an issued record rebuilt from a retired entry that predates `rec` (retired by an older build) — best effort */
function issuedFromRetired(e: any, ver: string): any {
  const s = (e && e.snap) || {}, seq = verSeq(ver)
  return seq === 0
    ? { id: ver, d: s.d, c: s.c, fil: s.fil, inp: s.inp, sign: e.sign, w: s.w, pa: s.pa, rv: s.rv }
    : { id: ver, di: e.di, iso: e.iso, seq, snap: s, diff: e.diff, units: e.units, ukinds: e.ukinds, sign: e.sign }
}

const vnOrder = (x: string, y: string) => {
  const a = parseVerN(x)!, b = parseVerN(y)!
  const ai = parseVerId(a.ver), bi = parseVerId(b.ver)
  if (ai.iso !== bi.iso) return ai.iso < bi.iso ? -1 : 1
  if (ai.seq !== bi.seq) return ai.seq - bi.seq
  return a.n - b.n
}

/** a saved week (the stash blob shape) → its parts. Throws RowShapeError on anything that names no single day. */
export function splitParts(b: any, wk: string): WeekParts {
  if (!isMap(b)) throw new RowShapeError('a saved week is not a record')
  for (const k of Object.keys(b)) if (!KNOWN.has(k)) throw new RowShapeError(`the saved week carries a field no row holds: ${k}`)
  if (!Array.isArray(b.d) || b.d.length !== 7) throw new RowShapeError('a saved week is not seven days')
  const days: DayPart[] = b.d.map((d: any) => ({ d, book: {}, wo: [] }))
  for (const f of BOOK_BY_KEY) {
    const m = b[f]
    if (m == null) continue
    if (!isMap(m)) throw new RowShapeError(`${f} is not a map`)
    for (const k of Object.keys(m)) {
      const di = keyDay(k)
      if (!(di >= 0 && di <= 6)) throw new RowShapeError(`${f} carries a key that names no day of the week: ${k}`)
      ;(days[di].book[f] ??= {})[k] = m[k]
    }
  }
  for (const f of BOOK_BY_DAY) {
    const m = b[f]
    if (m == null) continue
    if (!isMap(m)) throw new RowShapeError(`${f} is not a map`)
    for (const k of Object.keys(m)) {
      if (!isDayIx(k)) throw new RowShapeError(`${f} carries a key that is no day of the week: ${k}`)
      days[+k].book[f] = m[k]
    }
  }
  if (b.wo != null) {
    if (!Array.isArray(b.wo)) throw new RowShapeError('wo is not a list')
    for (const k of b.wo) {
      const lead = String(k).split('|')[0]
      if (!isDayIx(lead)) throw new RowShapeError(`a muted warning names no day: ${k}`)
      days[+lead].wo.push(k)
    }
  }
  /* the issuances and their retractions. n = the withdrawals of that version before this issuance went out: a live
     one's is the count so far (the highest retired number — the same count publish.ts nextRetiredN steps on from), a
     retired `<verId>~<m>` was issuance m-1 */
  const retiredN = new Map<string, number>()
  const rtKeys = isMap(b.rt) ? Object.keys(b.rt) : []
  if (b.rt != null && !isMap(b.rt)) throw new RowShapeError('rt is not a map')
  for (const k of rtKeys) {
    const vn = parseVerN(k)
    if (!vn || vn.n < 1) throw new RowShapeError(`a retired entry has no version and number: ${k}`)
    retiredN.set(vn.ver, Math.max(retiredN.get(vn.ver) ?? 0, vn.n))
  }
  const is = new Map<string, any>(), rx = new Map<string, any>()
  const addIs = (vn: string, rec: any) => {
    if (is.has(vn)) throw new RowShapeError(`two issued records for ${vn}`)
    is.set(vn, rec)
  }
  if (b.o != null) {
    if (!isMap(b.o)) throw new RowShapeError('o is not a map')
    for (const k of Object.keys(b.o)) {
      const rec = b.o[k]
      if (!isDayIx(k)) throw new RowShapeError(`an Original is filed under no day: ${k}`)
      if (!rec || !isValidVerId(rec.id) || verSeq(rec.id) !== 0) throw new RowShapeError(`an Original with no version id, day ${k}`)
      addIs(`${rec.id}~${retiredN.get(rec.id) ?? 0}`, rec)
    }
  }
  if (b.a != null) {
    if (!Array.isArray(b.a)) throw new RowShapeError('a is not a list')
    for (const rec of b.a) {
      if (!rec || !isValidVerId(rec.id) || verSeq(rec.id) < 1) throw new RowShapeError('an amendment with no version id')
      if (!(typeof rec.di === 'number' || typeof rec.di === 'string') || !isDayIx(String(rec.di))) throw new RowShapeError(`amendment ${rec.id} names no day`)
      addIs(`${rec.id}~${retiredN.get(rec.id) ?? 0}`, rec)
    }
  }
  for (const k of rtKeys) {
    const { ver, n } = parseVerN(k)!, e = b.rt[k]
    const vn = `${ver}~${n - 1}`
    addIs(vn, e && e.rec ? e.rec : issuedFromRetired(e, ver))
    rx.set(vn, retractionOf(e))
  }
  return {
    week: { v: b.v, am: b.am },
    days,
    is: [...is.keys()].sort(vnOrder).map(k => [k, is.get(k)] as [string, any]),
    rx: [...rx.keys()].sort(vnOrder).map(k => [k, rx.get(k)] as [string, any]),
  }
}

/** parts → rows */
export function partsToRows(p: WeekParts): WeekRows {
  const rows: WeekRows = { '': weekRowJSON(p.week) }
  p.days.forEach((d, di) => { rows[`#${di}`] = dayRowJSON(d) })
  for (const [vn, rec] of p.is) rows[`:is:${vn}`] = JSON.stringify(rec)
  for (const [vn, meta] of p.rx) rows[`:rx:${vn}`] = JSON.stringify(meta)
  return rows
}

/** a saved week → its rows. Throws RowShapeError on anything that names no single day. */
export function splitWeek(b: any, wk: string): WeekRows { return partsToRows(splitParts(b, wk)) }

/* ---- the join ----------------------------------------------------------- */

function parseRow(raw: string, what: string): any {
  let v: any
  try { v = JSON.parse(raw) } catch { throw new RowShapeError(`${what} will not read`) }
  if (!isMap(v)) throw new RowShapeError(`${what} is not a record`)
  return v
}

/** the issued records back into the book's three shapes: the Originals by day, the live amendments, the retired log */
export function issuedBook(is: Array<[string, any]>, rx: Map<string, any>, wk: string): { o: any; a: any[]; rt: any } {
  const o: any = {}, a: any[] = [], rt: any = {}
  const live = new Set<string>()
  for (const [vn, rec] of [...is].sort((x, y) => vnOrder(x[0], y[0]))) {
    const { ver, n } = parseVerN(vn)!
    const { iso, seq } = parseVerId(ver)
    const di = seq === 0 ? dayIndexOf(wk, iso) : +rec.di
    if (!(di >= 0 && di <= 6)) throw new RowShapeError(`issued ${ver} falls on no day of this week`)
    const r = rx.get(vn)
    if (r) { rt[`${ver}~${n + 1}`] = retiredEntry(rec, ver, n + 1, di, r); continue }
    if (live.has(ver)) throw new RowShapeError(`${ver} is out twice with no withdrawal between`)
    live.add(ver)
    if (seq === 0) o[di] = rec
    else a.push(rec)
  }
  for (const vn of rx.keys()) if (!is.some(([k]) => k === vn)) throw new RowShapeError(`a withdrawal of ${vn} with no issuance`)
  return { o, a, rt }
}

/** rows → parts. A missing week row reads as the current stamps; a missing day row as a blank day. Throws on a row
    that will not read or an id that names nothing. */
export function rowsToParts(rows: WeekRows, wk: string): WeekParts {
  const week = has(rows, '') ? parseRow(rows[''], 'the week row') : { v: RID_BOOK_VERSION, am: AMBOOK_VERSION }
  let blank: any[] | null = null
  const days: DayPart[] = []
  for (let di = 0; di < 7; di++) {
    const raw = rows[`#${di}`]
    if (raw == null) {
      blank ??= emptyWeek(wk).days
      days.push({ d: blank[di], book: {}, wo: [] })
      continue
    }
    const r = parseRow(raw, `day row ${di}`)
    if (!isMap(r.d)) throw new RowShapeError(`day row ${di} has no day`)
    const book: Record<string, any> = {}
    for (const f of BOOK_ORDER) if (has(r, f)) book[f] = r[f]
    days.push({ d: r.d, book, wo: Array.isArray(r.wo) ? r.wo : [] })
  }
  const is: Array<[string, any]> = [], rx: Array<[string, any]> = []
  for (const suffix of Object.keys(rows)) {
    if (suffix === '' || /^#[0-6]$/.test(suffix)) continue
    const id = parseRowId(`w${suffix}`)
    if (!id || (id.kind !== 'is' && id.kind !== 'rx')) throw new RowShapeError(`a row this week cannot place: ${suffix}`)
    const val = parseRow(rows[suffix], `row ${suffix}`)
    ;(id.kind === 'is' ? is : rx).push([`${id.ver}~${id.n}`, val])
  }
  return { week: { v: week.v, am: week.am }, days, is: is.sort((x, y) => vnOrder(x[0], y[0])), rx: rx.sort((x, y) => vnOrder(x[0], y[0])) }
}

/** parts → the saved week (the stash blob shape, without `al` / `un`) */
export function joinParts(p: WeekParts, wk: string): any {
  const c: any = {}, pn: any = {}, ad: any = {}
  const byDay: Record<string, any> = { ok: {}, sg: {}, sb: {}, cv: {}, dr: {}, cd: {}, cr: {} }
  const wo: string[] = []
  p.days.forEach((day, di) => {
    const b = day.book
    if (isMap(b.c)) Object.assign(c, b.c)
    if (isMap(b.p)) Object.assign(pn, b.p)
    if (isMap(b.ad)) Object.assign(ad, b.ad)
    for (const f of BOOK_BY_DAY) if (has(b, f)) byDay[f][di] = b[f]
    for (const k of day.wo) wo.push(k)
  })
  const { o, a, rt } = issuedBook(p.is, new Map(p.rx), wk)
  return {
    d: p.days.map(x => x.d), c, p: pn, ad, a, ok: byDay.ok, sg: byDay.sg, sb: byDay.sb, o, cv: byDay.cv,
    dr: byDay.dr, cd: byDay.cd, v: p.week.v, am: p.week.am, rt, cr: byDay.cr, wo,
  }
}

/** a week's rows → the saved week. Throws on a row that will not read. */
export function joinWeek(rows: WeekRows, wk: string): any { return joinParts(rowsToParts(rows, wk), wk) }
