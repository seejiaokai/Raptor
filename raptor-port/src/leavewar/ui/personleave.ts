/* ONE PERSON'S LEAVE, ONE LINE A LEAVE — what his person window lists (the Leave War overhaul's M5a, job 1 — D1480, D1148,
   D1327, D1328, D1292, D1231, D1481; the build spec §2.1, §4 "The list"; readings 6 and 7).

   THE LINES. His approved leave is the Inputs (the war stores none of it — the one absence record): one Input, one line,
   its days as the war charges them on its own (Approvals' `ownDays` — a weekend or a holiday 0, a half .5). His pending
   and refused requests are the war's own records, in every period: one line a run of days in a row that share their kind,
   state, words and papers (the store's `reqRunKey` — the run Approvals' `linesOfWar` draws one line for, its days the
   same `ownDays`). Only leave (reading 6): LL, OL, OIL taken, CCL, FCL, PL, EL and CL — a medical, a course, an overseas
   duty and an Other stay on the grid (MED's tile counts the medical days).

   NEW SINCE HIS LAST VISIT (his own window only — D1231, D1481; reading 7): a line someone ELSE changed after the moment
   he last opened his own window wears the dot and a muted "who, when". Read from the records' own stamps — a request's
   `decidedBy` / `decidedAt` and `placedBy` / `placedAt`, an Input's `by` / `at`, `modBy` / `modAt` and `lwBy` — and, for
   what leaves no stamp on what stands (a leave deleted, moved, its kind changed, an approval taken back), the change
   history's machine marks (state/changelines.ts THE MACHINE MARKS — `sub`, `fld`, `pid`, `t`), never its words. A leave
   someone else deleted stays on the list, struck through, for that visit. His own changes are never new. */

import { ELOG, type ELogRow } from '../../engine/editlog'
import { openInputDocs, openRequestDocs, inputById, warIdentityIfHidden } from '../sync'
import { rowDocIds } from '../../state/docs'
import { filerName } from '../../ui/placedline'
import { ownDays } from '../approvals'
import { addDays, memberToday, parseCell } from '../engine'
import { portionOf, type Contrib } from '../engine/dayview'
import type { RequestRec } from '../engine/warrecs'
import { dayRecsOf, getState, rawState, reqRunKey } from '../state/store'

/** the kinds his window lists (reading 6) */
export const LIST_KINDS: ReadonlySet<string> = new Set(['LL', 'OL', 'OIL', 'CCL', 'FCL', 'PL', 'EL', 'CL'])

export type LineState = 'approved' | 'pending' | 'refused' | 'deleted'
export interface PwLine {
  key: string
  /** the kind, no half marks: 'LL' */
  code: string
  state: LineState
  /** the box's look F: filled approved, hollow dashed pending, grey struck refused (a deleted line keeps the look it had) */
  box: 'a' | 'w' | 'r'
  from: string
  to: string
  /** a one-day half: 'AM' / 'PM' */
  half: '' | 'AM' | 'PM'
  days: number
  /** how many papers it carries, and what opens them (D1292) */
  docN: number
  openDocs: (() => void) | null
  /** someone else's change since his last visit: who, when, and the words under the line */
  news: { by: string; at: number; words: string } | null
}

/* ---- words ---- */
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const two = (n: number) => String(n).padStart(2, '0')
const dayOf = (iso: string) => { const t = new Date(`${iso}T12:00:00`); return { w: WDAY[t.getDay()]!, d: t.getDate(), m: MON[t.getMonth()]! } }

/** the dates as the drawing writes them: "Mon 19 – Wed 21 Jan", "Thu 29 Jan, AM", "Fri 30 Jan – Mon 2 Feb" */
export function datesWords(from: string, to: string, half: '' | 'AM' | 'PM' = ''): string {
  const a = dayOf(from), b = dayOf(to)
  if (from === to) return `${a.w} ${a.d} ${a.m}${half ? `, ${half}` : ''}`
  return a.m === b.m && from.slice(0, 4) === to.slice(0, 4) ? `${a.w} ${a.d} – ${b.w} ${b.d} ${a.m}` : `${a.w} ${a.d} ${a.m} – ${b.w} ${b.d} ${b.m}`
}

/** a stored moment against the app's today: "today 08:40", "yesterday 08:40", "26 Jan 08:40", "26 Dec 25 08:40" */
export function whenWords(ms: number, today: string = memberToday()): string {
  const d = new Date(ms)
  const iso = `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`
  const hm = `${two(d.getHours())}:${two(d.getMinutes())}`
  if (iso === today) return `today ${hm}`
  if (iso === addDays(today, -1)) return `yesterday ${hm}`
  return `${d.getDate()} ${MON[d.getMonth()]}${String(d.getFullYear()) !== today.slice(0, 4) ? ` ${two(d.getFullYear() % 100)}` : ''} ${hm}`
}

/** a person's callsign by his id — on the war, off its roster (a SANS man while SANS is off), or on the app's people */
export function callsignOf(id: unknown): string {
  const s = String(id ?? '')
  const p = getState().people.find(x => x.id === s) ?? warIdentityIfHidden(s)
  return p?.callsign ? String(p.callsign) : filerName(s)
}

/* ---- the lines ---- */
const notation = (code: string, part: 'am' | 'pm' | 'full') => (part === 'am' ? `*${code}` : part === 'pm' ? `${code}*` : code)
const halfOf = (p: string): '' | 'AM' | 'PM' => (p === 'am' ? 'AM' : p === 'pm' ? 'PM' : '')
const overlaps = (a0: string, a1: string, b0: string, b1: string) => a0 <= b1 && b0 <= a1

/** someone else's change, after the moment, or null — the latest of those offered */
type Cand = { who: unknown; at: unknown; verb: string }
function newest(cands: Cand[], me: string, since: number | null): PwLine['news'] {
  if (since === null) return null
  let best: { who: string; at: number; verb: string } | null = null
  for (const c of cands) {
    const who = c.who == null ? '' : String(c.who)
    const at = typeof c.at === 'number' && Number.isFinite(c.at) ? c.at : NaN
    if (!who || who === me || !(at > since)) continue
    if (!best || at >= best.at) best = { who, at, verb: c.verb }
  }
  return best ? { by: best.who, at: best.at, words: `${best.verb} by ${callsignOf(best.who)} · ${whenWords(best.at)}` } : null
}

/* the machine marks of his leave someone else left (changelines.ts — read by their fields, never their words) */
function marksOf(pid: string, me: string, since: number | null): ELogRow[] {
  if (since === null) return []
  return ELOG.rows.filter(r => String(r.sub ?? '') === pid && r.pid != null && String(r.pid) !== me && r.t > since &&
    (r.fld === 'deleted' || r.fld === 'moved' || r.fld === 'kind' || r.fld === 'back'))
}
const markVerb = (r: ELogRow) => (r.fld === 'moved' ? 'moved' : r.fld === 'kind' ? `changed from ${parseCell(r.from)?.type ?? r.from}` : 'put back to a bid')
/* A MARK LIGHTS ONLY THE LINE OF ITS OWN LEAVE (the code read's 3, 29 Oct 26: a CL bid re-typed to FCL on a day whose
   morning held his approved LL dotted the LL line too, "changed from CL"). A mark is his line's when it names its Input
   (an Input's own mark always counts), or when its dates overlap the line's AND its leave is the line's kind — and, where
   both are halves of a day, the same half. `itype` is the leave as it stands after ('kind': the code after, the line's). */
const markCands = (marks: ELogRow[], from: string, to: string, code: string, half: '' | 'AM' | 'PM', iid?: string): Cand[] =>
  marks.filter(r => {
    if (r.fld === 'deleted' || !r.date) return false
    if (iid && (r.iid === iid || (r.iids ?? []).includes(iid))) return true
    if (!overlaps(r.date, r.end ?? r.date, from, to)) return false
    const cell = parseCell(r.itype ?? '')
    if (!cell || cell.type !== code) return false
    const markHalf = halfOf(cell.portion)
    return !(half && markHalf && half !== markHalf)
  }).map(r => ({ who: r.pid, at: r.t, verb: markVerb(r) }))

/**
 * EVERY LINE OF ONE PERSON'S LEAVE, oldest first, every year (the year picker chooses — `inYear`). `since` is the moment
 * his own window was last opened before this visit (0 — never), or null where nothing is new: another man's window, or
 * his own opened by someone else (D1231). `me` is whoever is reading — his own changes are never new.
 */
export function personLeave(pid: string, since: number | null): PwLine[] {
  const me = String(getState().viewer ?? '')
  const marks = marksOf(pid, me, since)
  const out: PwLine[] = []

  /* his approved leave: the Inputs on every date (the absence index is war-agnostic), one Input one line */
  const byInput = new Map<string, { code: string; days: Array<{ date: string; part: 'am' | 'pm' | 'full' }> }>()
  for (const [date, list] of dayRecsOf(pid)) {
    for (const c of list as readonly Contrib[]) {
      if (c.kind !== 'absence' || c.spill || !LIST_KINDS.has(c.code)) continue
      const g = byInput.get(c.id) ?? { code: c.code, days: [] }
      g.days.push({ date, part: portionOf(c.win) })
      byInput.set(c.id, g)
    }
  }
  for (const [iid, g] of byInput) {
    g.days.sort((a, b) => (a.date < b.date ? -1 : 1))
    const from = g.days[0]!.date, to = g.days[g.days.length - 1]!.date
    const row = inputById(iid)
    const docs = row ? rowDocIds(row) : []
    const cands: Cand[] = []
    if (row?.by != null) {
      /* approved on the war names its approver; placed and approved by the same hand (Auto-approve, D1422) says so; filed
         on the Inputs page by someone else is "added" */
      const verb = row.lw ? (row.lwBy != null && String(row.lwBy) === String(row.by) ? 'added and approved' : 'approved') : 'added'
      cands.push({ who: row.by, at: row.at, verb })
    }
    if (row?.modBy != null && typeof row.modAt === 'number' && row.modAt !== row.at) cands.push({ who: row.modBy, at: row.modAt, verb: 'changed' })
    cands.push(...markCands(marks, from, to, g.code, from === to ? halfOf(g.days[0]!.part) : '', iid))
    out.push({
      key: `i:${iid}`, code: g.code, state: 'approved', box: 'a', from, to,
      half: from === to ? halfOf(g.days[0]!.part) : '',
      days: ownDays(pid, g.days.map(d => ({ date: d.date, code: notation(g.code, d.part) }))),
      docN: docs.length, openDocs: docs.length ? () => { openInputDocs(row) } : null,
      news: newest(cands, me, since),
    })
  }

  /* his pending and refused requests, every period: one line a run (Approvals' `linesOfWar`, both states) */
  type Run = { recs: Array<{ date: string; r: RequestRec }> }
  const runs: Array<{ war: string; fresh: Run }> = []
  for (const war of rawState().wars) {
    const byDate = war.recs[pid]
    if (!byDate) continue
    let open = new Map<string, Run>()
    let prev = ''
    for (const date of Object.keys(byDate).sort()) {
      const next = new Map<string, Run>()
      for (const r of byDate[date] ?? []) {
        if (r.kind !== 'request') continue
        const cell = parseCell(r.code)
        if (!cell || !LIST_KINDS.has(cell.type)) continue
        const k = reqRunKey(r)
        const run = prev && addDays(prev, 1) === date ? open.get(k) : undefined
        if (run) { run.recs.push({ date, r }); next.set(k, run); continue }
        const fresh: Run = { recs: [{ date, r }] }
        next.set(k, fresh)
        runs.push({ war: war.period.id, fresh })
      }
      open = next
      prev = date
    }
  }
  for (const { war, fresh } of runs) {
    const first = fresh.recs[0]!, last = fresh.recs[fresh.recs.length - 1]!
    const cell = parseCell(first.r.code)!
    const refused = first.r.state === 'refused'
    const from = first.date, to = last.date
    const docIds = first.r.docIds ?? []
    const cands: Cand[] = []
    for (const { r } of fresh.recs) {
      if (refused) cands.push({ who: r.decidedBy, at: r.decidedAt, verb: 'refused' })
      else cands.push({ who: r.placedBy, at: r.placedAt, verb: 'placed' })
    }
    cands.push(...markCands(marks, from, to, cell.type, from === to ? halfOf(cell.portion) : ''))
    out.push({
      key: `r:${war}:${first.r.id}`, code: cell.type, state: refused ? 'refused' : 'pending', box: refused ? 'r' : 'w', from, to,
      half: from === to ? halfOf(cell.portion) : '',
      days: ownDays(pid, fresh.recs.map(x => ({ date: x.date, code: x.r.code }))),
      docN: docIds.length,
      openDocs: docIds.length ? () => { openRequestDocs({ personId: pid, code: first.r.code, from, to, docIds, remarks: first.r.remarks, placedBy: first.r.placedBy, placedAt: first.r.placedAt }) } : null,
      news: newest(cands, me, since),
    })
  }

  /* what someone else DELETED since his visit, struck through for that visit — one line a leave: the marks of one change
     (one moment, one hand, one kind) on days in a row joined, as the leave they were */
  const gone = marks.filter(r => r.fld === 'deleted' && r.date).sort((a, b) => a.t - b.t || (a.date! < b.date! ? -1 : 1))
  const joined: Array<{ rows: ELogRow[]; from: string; to: string }> = []
  for (const r of gone) {
    const j = joined[joined.length - 1]
    const end = r.end ?? r.date!
    if (j && j.rows[0]!.t === r.t && j.rows[0]!.itype === r.itype && String(j.rows[0]!.pid) === String(r.pid) && addDays(j.to, 1) === r.date) { j.rows.push(r); j.to = end; continue }
    joined.push({ rows: [r], from: r.date!, to: end })
  }
  /* A DELETION TAKEN BACK IS NOT LISTED (the fresh read of the fixes, finding 3, 29 Oct 26). An Undo writes only its
     "Undo — …" line, no machine mark, so the delete's mark outlives it: Saber deleting Ranger's approved LL on the Inputs
     page and pressing Undo left the LL line standing AND a struck "deleted by Saber" line beside it — a leave of his read
     as gone that is not. The war's own delete marks always had the same gap. So a deletion is skipped where what it took
     away stands again: its Input back under its own id (an Undo restores an Input as it was), or — a bid, which has no
     id to match — a line still standing of the same kind (and, for one day, the same half or the whole day) over every
     one of its dates. */
  const standing = out.filter(l => l.state === 'approved' || l.state === 'pending')
  const back = (iid: string | undefined, code: string, from: string, to: string, half: '' | 'AM' | 'PM') =>
    (!!iid && standing.some(l => l.key === `i:${iid}`)) ||
    standing.some(l => l.code === code && l.from <= from && l.to >= to && (!l.half || l.half === half))
  for (const j of joined) {
    const r0 = j.rows[0]!
    const cell = parseCell(r0.itype ?? '')
    if (!cell || !LIST_KINDS.has(cell.type)) continue
    if (back(r0.iid, cell.type, j.from, j.to, j.from === j.to ? halfOf(cell.portion) : '')) continue
    const dates = j.rows.flatMap(r => r.days ?? (() => { const ds: string[] = []; for (let d = r.date!; d <= (r.end ?? r.date!); d = addDays(d, 1)) ds.push(d); return ds })())
    out.push({
      key: `d:${r0.lineId}`, code: cell.type, state: 'deleted', box: r0.iid ? 'a' : 'w', from: j.from, to: j.to,
      half: j.from === j.to ? halfOf(cell.portion) : '',
      days: ownDays(pid, dates.map(date => ({ date, code: r0.itype! }))),
      docN: 0, openDocs: null,
      news: { by: String(r0.pid), at: r0.t, words: `deleted by ${callsignOf(r0.pid)} · ${whenWords(r0.t)}` },
    })
  }

  return out.sort((a, b) => (a.from < b.from ? -1 : a.from > b.from ? 1 : a.key < b.key ? -1 : 1))
}

/** THE YEAR PICKER (D1148): "<this year> and ahead" by default; a past year shows the leave that touches it */
export type YearPick = { year: number; ahead: boolean }
export function inYear(l: Pick<PwLine, 'from' | 'to'>, pick: YearPick): boolean {
  const y0 = `${pick.year}-01-01`, y1 = `${pick.year}-12-31`
  return pick.ahead ? l.to >= y0 : l.from <= y1 && l.to >= y0
}
/** the past years his leave touches, newest first, before this one */
export function pastYears(lines: ReadonlyArray<Pick<PwLine, 'from' | 'to'>>, thisYear: number): number[] {
  const ys = new Set<number>()
  for (const l of lines) for (let y = +l.from.slice(0, 4); y <= +l.to.slice(0, 4); y++) if (y < thisYear) ys.add(y)
  return [...ys].sort((a, b) => b - a)
}
