/* THE DAY PANEL'S READER (owner D1143, D1198; the Leave War overhaul's M3, batch 6). A tap on a date's heading opens
   that day: whether it is open for bidding, its events, its figures — the Required and Available rows, then every
   Manning row with its amber or red — and who is away, one line a person. Read here, off the period HOLDING the date
   (never only the one on screen — B3), on the SAME bodies the grid draws: `evaluateDay` for the Manning rows, the war's
   own views for who is away (`DayView.away` — what lowers manning, D998). The scheduler's half (the Required figures, the
   Available rows' verdicts) comes in from sync.ts by its caller, so this file never reaches across the seam. Never a
   remark (D1143): a line carries the kind, the dates, the days and the state, and nothing anyone typed. */

import { addDays, inSquadron, memberToday, type Person } from '../engine'
import { evaluateDay, type Verdict } from '../engine/evaluate'
import { warHolding } from '../engine/wars'
import type { Contrib, DayView } from '../engine/dayview'
import { displayRoster, getState, isDayOpen } from './store'
import type { MergedWar } from './merge'

export interface AwayLine {
  personId: string
  callsign: string
  /** the stored notation of what takes him away: `LL`, `*LL` a morning, `LL*` an afternoon */
  code: string
  /** approved (an absence — leave, a medical, a course, an overseas duty) or a bid still pending */
  state: 'approved' | 'pending'
  /** the run it belongs to: its first and last day */
  from: string
  to: string
  /** what the run is worth in days, halves as .5 */
  days: number
}
export interface ManningLine { id: string; label: string; have: number; level: '' | 'amber' | 'red' }
export interface DayPanelData {
  iso: string
  /** a period holds the date — without one every figure is unknown (a dash, never 0) */
  covered: boolean
  /** open for bidding for whoever reads it */
  open: boolean
  /** the day's events, their full words, one line each */
  events: string[]
  manning: ManningLine[]
  away: AwayLine[]
}

const lvl = (v: Verdict): '' | 'amber' | 'red' => (v === 'ok' ? '' : v)
const halfOf = (code: string) => (code.startsWith('*') || code.endsWith('*') ? 0.5 : 1)

/** what takes a man away on a day: his top absence, else his top bid not refused — never a credit or a notice */
function awayRecord(v: DayView): Contrib | null {
  return v.all.find(c => c.kind === 'absence') ?? v.all.find(c => c.kind === 'request' && c.state !== 'refused') ?? null
}
const notation = (c: Contrib) => (c.win[0] === 0 && c.win[1] === 720 ? `*${c.code}` : c.win[0] === 721 ? `${c.code}*` : c.code)

/** The run a record belongs to: the days next to it the same person spends on the same record (an absence: the same
 *  Input; a bid: the same code and state) — stopping at the edge of the period's views. */
function runOf(war: MergedWar, personId: string, date: string, c: Contrib): { from: string; to: string; days: number } {
  const same = (d: string) => {
    const v = war.views[personId]?.[d]
    const o = v ? awayRecord(v) : null
    if (!o) return null
    if (c.kind === 'absence') return o.kind === 'absence' && o.id === c.id ? o : null
    return o.kind === 'request' && o.code === c.code && o.state === c.state ? o : null
  }
  let from = date, to = date, days = halfOf(notation(c))
  for (let d = addDays(date, -1), o = same(d); o; d = addDays(d, -1), o = same(d)) { from = d; days += halfOf(notation(o)) }
  for (let d = addDays(date, 1), o = same(d); o; d = addDays(d, 1), o = same(d)) { to = d; days += halfOf(notation(o)) }
  return { from, to, days }
}

export function dayPanelData(iso: string): DayPanelData {
  const st = getState()
  const war = warHolding(st.wars, iso) as MergedWar | undefined
  const member = st.role !== 'admin'
  const open = !!war && isDayOpen(iso) && !(member && iso < memberToday())
  if (!war) return { iso, covered: false, open: false, events: [], manning: [], away: [] }
  const day = war.period.days.find(d => d.date === iso)
  const events = (day?.events ?? []).map(e => String(e ?? '').trim()).filter(Boolean)
  const verdict = evaluateDay(st.people, war.grid, war.states, st.requirements, iso, war.views)
  const manning = verdict.results.map(r => ({ id: r.ruleId, label: r.label, have: r.have, level: lvl(r.verdict) }))
  /* sorted as the grid's rows are — the page order (displayRoster), ground crew included only where away */
  const order: Person[] = displayRoster()
  const away: AwayLine[] = []
  for (const p of order) {
    if (!inSquadron(p, iso)) continue
    const v = war.views[p.id]?.[iso]
    if (!v || !(v.away > 0)) continue
    const c = awayRecord(v)
    if (!c) continue
    const run = runOf(war, p.id, iso, c)
    away.push({ personId: p.id, callsign: p.callsign, code: notation(c), state: c.kind === 'absence' ? 'approved' : 'pending', ...run })
  }
  return { iso, covered: true, open, events, manning, away }
}
