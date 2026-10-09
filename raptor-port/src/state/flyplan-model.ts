/* THE FLYING PLAN — its records and the ONE resolver (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.2; owner D617, D618, D622, D626, D627, D631, D636,
   D637, D638, D642).

   Pure: no DOM, no store, no clock. Every date is an ISO string ('2026-01-15') and every piece of date maths goes through
   UTC, never local time — the Leave War's rows read this resolver, and that suite runs under a hostile time zone to prove
   it (leavewar/flyplan-model-tz.test.ts runs the same tests there).

   THREE KINDS OF RECORD, each a settings row of its own (state/flyplan.ts holds the reads and the typed commands):
   - a DAY    `flyday:<iso>`  → what is set for ONE date: its flying class, required pilots, required WSOs — any subset;
   - a RULE   `flyrule:<id>`  → "every Thursday from a date onward", with or without an end;
   - a RUN    `flyrun:<iso>`  → a required figure that RUNS from that date, per seat; `null` ends it for that seat.

   AND ONE RESOLVER, `planFor`. Every surface that shows a day's class, its required figures or how many more are needed
   — the Leave War's Required rows, the SANS calendar, the Inputs calendar's NF tag, Days — calls it. None re-derives:
   two stores hold the facts of one day (the class and the figures here; the holiday and who is available on the Leave
   War), and this is the only place they are joined (the plan's risk 1). */

export type FlyCls = 'day' | 'night' | 'nf' | 'none'
/** what is set for one date; any subset */
export interface FlyDay { cls?: FlyCls; p?: number; w?: number }
/** every <weekday> from a date onward; `wd` 0 = Monday … 6 = Sunday; `until` is its last day, absent = no end */
export interface FlyRule { id: string; wd: number; cls: FlyCls; from: string; until?: string }
/** a figure running from its start date, per seat; null ends the run for that seat; a seat not named is not spoken for */
export interface FlyRun { p?: number | null; w?: number | null }
export interface FlyPlan { days: Record<string, FlyDay>; rules: FlyRule[]; runs: Record<string, FlyRun> }
/** what the Leave War says of a date (leavewar/sync.ts dayFacts): whether a leave period covers it, a public holiday
 *  ('ph') or an Off day ('off'), and who is available per seat — null where no period covers it */
export interface DayFacts { covered: boolean; kind: 'ph' | 'off' | null; availP: number | null; availW: number | null }
/** the SANS people committed to fly on a date, per seat (each counted once — D572) */
export interface SeatCount { p: number; w: number }
export interface Tones { yellowFrom: number; amberFrom: number; redFrom: number }
export type Tone = 'none' | 'yellow' | 'amber' | 'red'
type Seat = 'p' | 'w'
type PerSeat<T> = { p: T; w: T }

/* the row kinds and the command types — HERE, in the module with no imports, because the settings store's own list of
   row kinds is built from them as it loads, and state/flyplan.ts (which imports that store) may not have run yet */
export const FLY_ROW_PREFIXES = ['flyday:', 'flyrule:', 'flyrun:'] as const
export const FLY_TYPES = ['fly.day.set', 'fly.rule.set', 'fly.rule.remove', 'fly.run.set'] as const

export const EMPTY_PLAN: FlyPlan = Object.freeze({ days: Object.freeze({}), rules: Object.freeze([]) as any, runs: Object.freeze({}) }) as FlyPlan
export const DEFAULT_TONES: Readonly<Tones> = Object.freeze({ yellowFrom: 1, amberFrom: 3, redFrom: 5 })
const CLASSES: readonly string[] = ['day', 'night', 'nf', 'none']

/* ---- dates, on ISO strings through UTC -------------------------------------------------------------------------- */
const ISO = /^(\d{4})-(\d{2})-(\d{2})$/
const utc = (iso: string): number => { const m = ISO.exec(iso)!; return Date.UTC(+m[1], +m[2] - 1, +m[3]) }
const isoOf = (ms: number): string => new Date(ms).toISOString().slice(0, 10)
/** a real calendar date written yyyy-mm-dd (2026-02-30 is not one) */
export function validIso(v: unknown): v is string {
  return typeof v === 'string' && ISO.test(v) && isoOf(utc(v)) === v
}
/** Monday = 0 … Sunday = 6 */
export const weekdayOf = (iso: string): number => (new Date(utc(iso)).getUTCDay() + 6) % 7
export const isWeekend = (iso: string): boolean => weekdayOf(iso) >= 5
export const addDays = (iso: string, n: number): string => isoOf(utc(iso) + n * 86400000)
/** every date of a month, 1-based month */
export function monthDates(y: number, m: number): string[] {
  const out: string[] = []
  for (let ms = Date.UTC(y, m - 1, 1); new Date(ms).getUTCMonth() === m - 1; ms += 86400000) out.push(isoOf(ms))
  return out
}

/* ---- what may be stored — refused at the write, ignored at the read ---------------------------------------------- */
const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
const whole = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0
const only = (v: Record<string, unknown>, keys: string[]) => Object.keys(v).every(k => keys.includes(k))
export function validFlyDay(v: unknown): v is FlyDay {
  return isObj(v) && only(v, ['cls', 'p', 'w']) && (v.cls === undefined || CLASSES.includes(v.cls as string)) &&
    (v.p === undefined || whole(v.p)) && (v.w === undefined || whole(v.w))
}
export function validFlyRule(v: unknown): v is FlyRule {
  return isObj(v) && only(v, ['id', 'wd', 'cls', 'from', 'until']) && typeof v.id === 'string' && v.id !== '' &&
    whole(v.wd) && (v.wd as number) <= 6 && CLASSES.includes(v.cls as string) && validIso(v.from) &&
    (v.until === undefined || (validIso(v.until) && (v.until as string) >= (v.from as string)))
}
export function validFlyRun(v: unknown): v is FlyRun {
  const seat = (x: unknown) => x === undefined || x === null || whole(x)
  return isObj(v) && only(v, ['p', 'w']) && Object.keys(v).length > 0 && seat(v.p) && seat(v.w)
}
export function validTones(v: unknown): v is Tones {
  return isObj(v) && only(v, ['yellowFrom', 'amberFrom', 'redFrom']) && whole(v.yellowFrom) && whole(v.amberFrom) && whole(v.redFrom) &&
    (v.yellowFrom as number) >= 1 && (v.amberFrom as number) > (v.yellowFrom as number) && (v.redFrom as number) > (v.amberFrom as number)
}

/* ---- the class ---------------------------------------------------------------------------------------------------- */
/** the weekday rule in force on a date: of those covering it, the one that started latest (a later record wins a tie) */
export function ruleInForce(iso: string, plan: FlyPlan): FlyRule | null {
  const wd = weekdayOf(iso)
  let best: FlyRule | null = null
  for (const r of plan.rules || []) {
    if (!validFlyRule(r) || r.wd !== wd || r.from > iso || (r.until !== undefined && r.until < iso)) continue
    if (!best || r.from >= best.from) best = r
  }
  return best
}
/** what a date's class would be with nothing set for the date itself: its weekday's rule, else day flying on a weekday
 *  and "not set" on a Saturday or Sunday (D631, D642) */
export function inheritedCls(iso: string, plan: FlyPlan): FlyCls {
  const r = ruleInForce(iso, plan)
  return r ? r.cls : isWeekend(iso) ? 'none' : 'day'
}
/** A DAY'S ROW AS IT IS STORED: its class only where it differs from what the date would inherit, and no row at all when
 *  nothing is left — so a date stepped back to its rule leaves nothing behind (null = delete the row) */
export function trimDay(iso: string, day: FlyDay, plan: FlyPlan): FlyDay | null {
  const out: FlyDay = {}
  if (day.cls !== undefined && day.cls !== inheritedCls(iso, plan)) out.cls = day.cls
  if (day.p !== undefined) out.p = day.p
  if (day.w !== undefined) out.w = day.w
  return Object.keys(out).length ? out : null
}
/** the phone's ONE button: day → night → no fly, and on a Saturday or Sunday on to "not set" (D638, D642) */
export function nextCls(cur: FlyCls, weekend: boolean): FlyCls {
  if (cur === 'day') return 'night'
  if (cur === 'night') return 'nf'
  if (cur === 'nf') return weekend ? 'none' : 'day'
  return 'day'
}

export const toneOf = (needed: number, t: Tones): Tone =>
  needed >= t.redFrom ? 'red' : needed >= t.amberFrom ? 'amber' : needed >= t.yellowFrom ? 'yellow' : 'none'

/* ---- THE RESOLVER -------------------------------------------------------------------------------------------------- */
export interface DayAnswer {
  iso: string
  weekend: boolean
  /** a public holiday or an Off day, from the Leave War — its tag shows instead of a class */
  kind: 'ph' | 'off' | null
  /** day flying, night flying, no fly, "not set" — or null under a holiday or an Off day */
  cls: FlyCls | null
  /** where the class came from: set for the date, its weekday's rule, or the default */
  clsFrom: 'date' | 'rule' | 'default' | null
  /** required pilots and WSOs; null = no figure */
  req: PerSeat<number | null>
  /** where each figure came from: a no-fly day (reads 0, shows "NF"), typed for the date, a running figure */
  reqFrom: PerSeat<'nf' | 'date' | 'run' | null>
  /** the start date of the run a running figure comes from */
  runStart: PerSeat<string | null>
  /** how many more are needed to fly; null = unknown (no figure, or no leave period covers the date) */
  need: PerSeat<number | null>
  tone: Tone
}
/** the latest run starting on or before a date that NAMES the seat — its value (null = the run was ended) */
function runFor(seat: Seat, iso: string, plan: FlyPlan): { start: string; value: number | null } | null {
  let best: { start: string; value: number | null } | null = null
  for (const start of Object.keys(plan.runs || {})) {
    const r = plan.runs[start]
    if (!validIso(start) || start > iso || !validFlyRun(r) || r[seat] === undefined) continue
    if (!best || start > best.start) best = { start, value: r[seat] as number | null }
  }
  return best
}
export function planFor(iso: string, plan: FlyPlan, facts: DayFacts, sansFly: SeatCount, tones: Tones = DEFAULT_TONES): DayAnswer {
  const weekend = isWeekend(iso)
  const kind = facts.kind
  const stored = plan.days ? plan.days[iso] : undefined
  const day: FlyDay = validIso(iso) && validFlyDay(stored) ? stored : {}
  let cls: FlyCls | null = null, clsFrom: DayAnswer['clsFrom'] = null
  if (!kind) {
    if (day.cls !== undefined) { cls = day.cls; clsFrom = 'date' }
    else { const r = ruleInForce(iso, plan); cls = r ? r.cls : weekend ? 'none' : 'day'; clsFrom = r ? 'rule' : 'default' }
  }
  const req: PerSeat<number | null> = { p: null, w: null }
  const reqFrom: DayAnswer['reqFrom'] = { p: null, w: null }
  const runStart: PerSeat<string | null> = { p: null, w: null }
  const need: PerSeat<number | null> = { p: null, w: null }
  for (const s of ['p', 'w'] as const) {
    /* a no-fly day needs nobody — whatever is typed under it; the typed figure is kept and comes back when it is lifted */
    if (cls === 'nf') { req[s] = 0; reqFrom[s] = 'nf' }
    else if (day[s] !== undefined) { req[s] = day[s] as number; reqFrom[s] = 'date' }
    /* a running figure skips weekends, public holidays and Off days (D637) — a figure typed on such a day holds, above */
    else if (!weekend && !kind) {
      const run = runFor(s, iso, plan)
      if (run && run.value !== null) { req[s] = run.value; reqFrom[s] = 'run'; runStart[s] = run.start }
    }
    const avail = s === 'p' ? facts.availP : facts.availW
    const r = req[s]
    if (r === 0) need[s] = 0
    else if (r !== null && avail !== null && Number.isFinite(avail)) need[s] = Math.max(0, Math.ceil(r - avail - (sansFly[s] || 0)))
  }
  return { iso, weekend, kind, cls, clsFrom, req, reqFrom, runStart, need, tone: toneOf((need.p || 0) + (need.w || 0), tones) }
}

/** A MONTH'S ANSWERS — what the Leave War's rows and the calendars draw for it. A drawn month is repainted when THESE
 *  change, never on "a row dated inside the month changed": a run or a weekday rule that began months earlier moves its
 *  cells, and by building the repaint signal from the answers themselves that is true by construction (the plan §3.3). */
export function monthAnswers(y: number, m: number, plan: FlyPlan, factsOf: (iso: string) => DayFacts,
  sansFlyOf: (iso: string) => SeatCount, tones: Tones = DEFAULT_TONES): Record<string, DayAnswer> {
  const out: Record<string, DayAnswer> = {}
  for (const iso of monthDates(y, m)) out[iso] = planFor(iso, plan, factsOf(iso), sansFlyOf(iso), tones)
  return out
}
