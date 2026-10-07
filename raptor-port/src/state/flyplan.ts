/* THE FLYING PLAN'S STORE — the reads and the typed admin commands (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.1, §3.2; owner D617–D642). The records and the ONE
   resolver are state/flyplan-model.ts; this file is where they are kept and changed.

   WHY THESE ARE THE SCHEDULER'S SETTINGS ROWS and not Leave War records (the plan §3.1): a figure that runs "from a date
   on" and a rule for "every Thursday, no end" outlive any one leave period, while everything the war stores per day lives
   inside one period; and the settings-row path — typed admin commands, a hook that refuses a raw write, a read-back
   check, one row per changed day, the one Undo — is built and tested. The Leave War's rows READ this through one
   re-export in leavewar/sync.ts.

   ROWS (each its own record, `settings/<key>` — state/people-settings-commit.ts SETTINGS_ROW_PREFIXES):
     flyday:<iso>   what is set for one date             fly.day.set   (one date or MANY — a picked block is one Undo step)
     flyrule:<id>   every <weekday> from a date onward   fly.rule.set / fly.rule.remove
     flyrun:<iso>   a figure running from that date      fly.run.set
   KEYS: `sanscalendar` — the three colour figures (settings.sanscalendar); `flynames` — the Required rows' names
   (settings.flynames). All admin only: state/perms.ts COMMAND_OPS, mirrored by docs/data-model.md §11 (D200).

   UNTIL STEP 4 OF THE BUILD the calendar Codex built still reads state/sans-calendar.ts (its `sansday:` rows and a
   two-figure `sanscalendar`); nothing here reads those, and a two-figure colour record reads here as the defaults. That
   module and its rows go when the SANS calendar is re-made on the resolver (the plan §3.10). */
import { store, HOOKS } from '../engine/hooks'
import { INPUTS, isSansAvail, inputCoversDate } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { newId } from '../engine/newid'
import { cmdDeferEffect, type CommitResult } from '../command'
import { commitSettingsIntent } from './people-settings-commit'
import {
  validIso, validFlyDay, validFlyRule, validFlyRun, validTones, trimDay, DEFAULT_TONES,
  type FlyPlan, type FlyDay, type FlyRule, type FlyRun, type FlyCls, type Tones, type SeatCount,
} from './flyplan-model'

export const FLY_NAME_DEFAULTS: Readonly<{ p: string; w: string }> = Object.freeze({ p: 'Required P', w: 'Required W' })
const NAME_MAX = 40
export interface FlySave { ok: boolean; message?: string; id?: string; pending?: Promise<FlySave> }

/* ---- the reads ------------------------------------------------------------------------------------------------------
   The plan is built from the rows once and kept until a row changes. It is dropped by every command below and by
   flyplanLoad — which sits in the settings store's loader list, so a rollback, an Undo and a Redo (each re-derives every
   settings module from the restored store) drop it too, and in the boot. A row that cannot be trusted is read as
   nothing. */
let PLAN: FlyPlan | null = null
export function flyplanLoad(): void { PLAN = null }
export function getFlyPlan(): FlyPlan {
  if (PLAN) return PLAN
  const days: Record<string, FlyDay> = {}, runs: Record<string, FlyRun> = {}, rules: FlyRule[] = []
  for (const k of store.keys('flyday:')) {
    const iso = k.slice(7), v: unknown = store.get(k, null)
    if (validIso(iso) && validFlyDay(v) && Object.keys(v).length) days[iso] = v
  }
  for (const k of store.keys('flyrun:')) {
    const iso = k.slice(7), v: unknown = store.get(k, null)
    if (validIso(iso) && validFlyRun(v)) runs[iso] = v
  }
  for (const k of store.keys('flyrule:')) {
    const v: unknown = store.get(k, null)
    if (validFlyRule(v) && v.id === k.slice(8)) rules.push(v)
  }
  /* a fixed order, so two browsers holding the same rows resolve a tie between two rules the same way */
  rules.sort((a, b) => a.from < b.from ? -1 : a.from > b.from ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  return (PLAN = { days, rules, runs })
}
export function getTones(): Tones {
  const v: unknown = store.get('sanscalendar', null)
  return validTones(v) ? { yellowFrom: v.yellowFrom, amberFrom: v.amberFrom, redFrom: v.redFrom } : { ...DEFAULT_TONES }
}
/** the Required rows' names as the admin set them; a row never named reads its default */
export function getFlyNames(): { p: string; w: string } {
  const v: any = store.get('flynames', null)
  const one = (x: unknown, d: string) => typeof x === 'string' && x.trim() && x.length <= NAME_MAX ? x.trim() : d
  return { p: one(v && v.p, FLY_NAME_DEFAULTS.p), w: one(v && v.w, FLY_NAME_DEFAULTS.w) }
}

/* ---- the one save body ---------------------------------------------------------------------------------------------
   `writes` — each row to put (a value) or take away (null). Every one is read back inside the command: the legacy
   preference writer swallows a backend error, and a figure must never be reported saved unless its exact row is there —
   a mismatch throws, so the command's own capture and rollback own the failure. */
function result(r: CommitResult): FlySave {
  if ('queued' in r) return { ok: false, pending: r.done.then(result) }
  return { ok: r.ok, ...(!r.ok ? { message: r.message || 'This change could not be saved.' } : {}) }
}
function save(type: string, meta: unknown, writes: Array<[string, unknown]>): FlySave {
  const r = result(commitSettingsIntent(type, meta, () => {
    for (const [k, v] of writes) {
      store.set(k, v)
      if (JSON.stringify(store.get(k, null)) !== JSON.stringify(v)) throw new Error('The setting could not be saved. Try again.')
    }
    PLAN = null
    cmdDeferEffect(HOOKS.renderInputs)     // a repaint only: nothing here feeds the warnings
  }))
  PLAN = null
  return r
}
const no = (message: string): FlySave => ({ ok: false, message })

/* ---- a date, or a picked block of dates ----------------------------------------------------------------------------
   A PATCH names only what it changes: a value sets the field, null clears it, a field not named is left as it is. The
   row is then stored as trimDay leaves it — its class only where it differs from what the date would inherit, and no
   row at all when nothing is left. One command for the whole block: a picked rectangle of cells is ONE Undo step. */
export interface FlyDayPatch { iso: string; cls?: FlyCls | null; p?: number | null; w?: number | null }
const PATCH_KEYS = ['iso', 'cls', 'p', 'w']
export function setFlyDays(patches: FlyDayPatch[]): FlySave {
  if (!Array.isArray(patches) || !patches.length) return no('Pick at least one day.')
  const plan = getFlyPlan()
  const next = new Map<string, FlyDay | null>()
  for (const pt of patches) {
    if (!pt || typeof pt !== 'object' || !Object.keys(pt).every(k => PATCH_KEYS.includes(k)) || !validIso(pt.iso)) return no('Choose a valid calendar date.')
    const cur: FlyDay = { ...(next.has(pt.iso) ? next.get(pt.iso) || {} : plan.days[pt.iso] || {}) }
    for (const f of ['cls', 'p', 'w'] as const) {
      if (pt[f] === undefined) continue
      if (pt[f] === null) delete cur[f]
      else (cur as any)[f] = pt[f]
    }
    if (!validFlyDay(cur)) return no('A required figure is a whole number of zero or more; a day is day flying, night flying or no fly.')
    next.set(pt.iso, trimDay(pt.iso, cur, plan))
  }
  const writes: Array<[string, unknown]> = []
  for (const [iso, row] of next) {
    if (JSON.stringify(row) !== JSON.stringify(plan.days[iso] ?? null)) writes.push(['flyday:' + iso, row])
  }
  if (!writes.length) return { ok: true }                        // nothing would change: no command, no Undo step
  return save('fly.day.set', { dates: [...next.keys()] }, writes)
}

/* ---- "every <weekday> from a date onward" -------------------------------------------------------------------------
   A second rule for the same weekday and the same start REPLACES the first (it takes its id), so "every Thursday from
   5 Nov" is one thing he changes, never two rules arguing. */
export function setFlyRule(rule: { wd: number; cls: FlyCls; from: string; until?: string }): FlySave {
  const plan = getFlyPlan()
  const same = rule && plan.rules.find(r => r.wd === rule.wd && r.from === rule.from)
  const row: any = { id: same ? same.id : newId('fr'), wd: rule && rule.wd, cls: rule && rule.cls, from: rule && rule.from }
  if (rule && rule.until !== undefined) row.until = rule.until
  if (!rule || !Object.keys(rule).every(k => ['wd', 'cls', 'from', 'until'].includes(k)) || !validFlyRule(row))
    return no('Choose the weekday, what kind of day it is, and the date it starts — an end date cannot be before the start.')
  const r = save('fly.rule.set', { rule: row.id }, [['flyrule:' + row.id, row]])
  return r.ok ? { ...r, id: row.id } : r
}
export function removeFlyRule(id: string): FlySave {
  if (!getFlyPlan().rules.some(r => r.id === id)) return no('That rule is no longer there.')
  return save('fly.rule.remove', { rule: id }, [['flyrule:' + id, null]])
}

/* ---- a figure that RUNS from a date ---------------------------------------------------------------------------------
   Per seat: a number runs from that date; null ENDS the run for that seat there; a seat not named is left as the row
   has it. dropFlyRun takes a seat's word out of the row again (the earlier run then carries on), and the row goes when
   neither seat is spoken for.

   `clearDay` — what the Leave War's "From <date> on" asks for (the plan §3.3): a figure typed for the date ITSELF wins
   over a run on that date, so a run typed over such a cell would not show on the very day it starts. With the option,
   the date's own figure for each seat the run now SETS is taken away in the same command — one Undo step; a seat the
   run ends (null) and the date's class are left as they are. */
export function setFlyRun(iso: string, patch: FlyRun, opts?: { clearDay?: boolean }): FlySave {
  if (!validIso(iso)) return no('Choose a valid calendar date.')
  if (!validFlyRun(patch)) return no('A required figure is a whole number of zero or more.')
  const plan = getFlyPlan()
  const row: FlyRun = { ...(plan.runs[iso] || {}), ...patch }
  const writes: Array<[string, unknown]> = [['flyrun:' + iso, row]]
  const day = plan.days[iso]
  if (opts && opts.clearDay && day) {
    const next: FlyDay = { ...day }
    for (const s of ['p', 'w'] as const) if (typeof patch[s] === 'number') delete next[s]
    const trimmed = trimDay(iso, next, plan)
    if (JSON.stringify(trimmed) !== JSON.stringify(day)) writes.push(['flyday:' + iso, trimmed])
  }
  return save('fly.run.set', { from: iso }, writes)
}
export function dropFlyRun(iso: string, seats: Array<'p' | 'w'>): FlySave {
  const cur = getFlyPlan().runs[iso]
  if (!validIso(iso) || !cur) return no('No figure starts on that date.')
  const row: FlyRun = { ...cur }
  for (const s of seats || []) delete row[s]
  return save('fly.run.set', { from: iso }, [['flyrun:' + iso, Object.keys(row).length ? row : null]])
}

/* ---- the three colours; the Required rows' names ------------------------------------------------------------------- */
export function saveTones(t: Tones): FlySave {
  if (!validTones(t)) return no('Use whole numbers of 1 or more, each above the last: yellow, then amber, then red.')
  return save('settings.sanscalendar', null, [['sanscalendar', { yellowFrom: t.yellowFrom, amberFrom: t.amberFrom, redFrom: t.redFrom }]])
}
export function saveFlyNames(n: { p: string; w: string }): FlySave {
  const clean = (x: unknown) => typeof x === 'string' ? x.trim() : null
  const p = clean(n && n.p), w = clean(n && n.w)
  if (p == null || w == null || p.length > NAME_MAX || w.length > NAME_MAX) return no(`A row's name is at most ${NAME_MAX} letters.`)
  /* an emptied name goes back to its default; the record goes when both do */
  const row: Record<string, string> = {}
  if (p && p !== FLY_NAME_DEFAULTS.p) row.p = p
  if (w && w !== FLY_NAME_DEFAULTS.w) row.w = w
  return save('settings.flynames', null, [['flynames', Object.keys(row).length ? row : null]])
}

/* ---- the SANS committed, per seat ------------------------------------------------------------------------------------
   still needed = required - those the Leave War shows available - THE SANS COMMITTED TO FLY (D617). This is that third
   figure, and beside it who offered OFT and AMT, which the SANS calendar shows and never subtracts (D570).

   WHO COUNTS: a man the roster marks SANS, on it today (not archived, not deleted), in a flying seat, with a SANS
   availability input covering the date. Each man ONCE a day, however many inputs he filed and however short the
   commitment (D572). No filter of any screen changes it (D581) - it takes none.
   - ONLY a SANS man: the Leave War's Available rows count everyone EXCEPT the SANS (leavewar/engine/availrows.ts), so
     the two are the two halves of one roster - a man who has since stopped being SANS is in the war's count, and
     counting him here as well would count him twice.
   - NOT a man since archived: the count this replaces (ui/sans-calendar-model.ts activityPeopleOn) went by the input
     alone and still counted him.
   The lists are person ids in the order their inputs were filed; the opened day draws their pucks from them. */
export interface SeatIds { p: string[]; w: string[] }
export interface SansCommitted { f: SeatIds; o: SeatIds; a: SeatIds }
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export function sansCommittedOn(iso: string, rows: readonly any[] = INPUTS, people: Record<string, any> = PEOPLE): SansCommitted {
  const out: SansCommitted = { f: { p: [], w: [] }, o: { p: [], w: [] }, a: { p: [], w: [] } }
  if (!validIso(iso)) return out
  /* the date as an input's own label, WITH its year - so it is read the same whatever week is loaded */
  const label = `${MONTH_LABELS[+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)} ${+iso.slice(0, 4)}`
  const seen = { f: new Set<string>(), o: new Set<string>(), a: new Set<string>() }
  for (const r of rows) {
    if (!r || !r.person || !r.sans || !isSansAvail(r.type) || !inputCoversDate(r, label)) continue
    const id = String(r.person), p = people[id]
    if (!p || !p.san || p.archived || p.deleted || p.special || p.pers) continue
    const seat = p.seat === 'FCP' ? 'p' : p.seat === 'RCP' ? 'w' : null
    if (!seat) continue
    for (const act of ['f', 'o', 'a'] as const) {
      if (!r.sans[act] || seen[act].has(id)) continue
      seen[act].add(id)
      out[act][seat].push(id)
    }
  }
  return out
}
/** how many SANS pilots and WSOs have committed to fly on a date - what the resolver subtracts */
export function sansFly(iso: string, rows?: readonly any[], people?: Record<string, any>): SeatCount {
  const f = sansCommittedOn(iso, rows, people).f
  return { p: f.p.length, w: f.w.length }
}
