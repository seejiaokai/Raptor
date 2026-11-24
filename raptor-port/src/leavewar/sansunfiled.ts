/* HIS SANS DAYS WITH NOTHING FILED — THE LINE HIS OWN BELL WORKS OUT (owner D2338, 22 Nov 26 — "Should we tell the user
   too": yes; "on that date his bell tells him the planned days with nothing filed, a tap opening the SANS calendar"; built
   without a drawing first on his D2339).

   A man posted out as SANS from a date ahead can be named on our programme for days past that date before it comes (D2329),
   and nobody can file his SANS availability until it does: who may be filed for SANS goes by who is SANS today (D2327). So
   on the posting's date — once the posting has run and he is SANS — his bell lists the days he is planned with us and has
   filed nothing for, a tap opening the SANS calendar on the first of them (ui/topstate.ts openNotice).

   THE AGENT'S READINGS, TOLD TO HIM (D2338's row): the man himself only, never an admin's bell; not before the posting's
   date; one line naming the days. And the build's (his to change): the days are those from the posting's date on, today
   on — a day gone by is no longer one to file — of the weeks the app holds (the week loaded and the saved weeks of his own
   squadron); "planned with us" is ALL AVAIL's own SANS read, named anywhere on that day's programme (engine/avail.ts
   dayEngaged); the line is worked out from the schedule as it stands, never stored — the "off the manpower" line's way
   (leavewar/sync.ts postedLines, D1690, D1696) — so it shrinks as he files and goes once every day is filed, and goes with
   the posting if it is taken back or his SANS is taken off. Since his D2394 (23 Nov 26) it reaches every SANS man planned
   with nothing filed, however he became SANS (2b), and its id names its days, so once read it stays read while days only
   drop off and lights his bell again for a newly planned day (2a — planOf and readOf, below).

   A NEW FILE, NOT sync.ts (the night of 22–23 Nov 26: another chat's work was changing sync.ts heavily) — the war's half
   is read only here, through its own store; the one line in sync.ts is the bell's list gaining this one. */
import { store } from '../engine/hooks'
import { PEOPLE, sansFiler, sansOnP } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { UNIT } from '../engine/unitview'
import { stashKeys, stashDays } from '../engine/weekstash'
import { dayIso } from '../engine/verid'
import { dayEngaged } from '../engine/avail'
import { sansAvailOn, INPUTS, isSansAvail, namedOf, inputSpanIso } from '../engine/inputs'
import { homeUnitOf, rosterOf } from '../engine/roster'
import { getVersion as raptorVersion } from '../state/store'
import { effectiveToday } from '../state/person-delete'
import { NOTICES, noticeSansBack, type Notice, type SansBackHow } from '../state/notices'
import { seenOf, seenSavedOf, NOTICESEEN_PFX } from '../state/noticeseen'
import { me } from '../state/perms'
import { setSansTickWatch } from '../state/quals-write'
import { schedStore, resyncBeforeEnlist, schedApplyEnd } from '../state/sched-commit'
import { commitProjection, onCommit, onPipelineBegin, activeEnvelope, type Txn } from '../command'
import { settingsStore } from '../state/people-settings-commit'
import { getState } from './state/store'
import { addDays, outcomeOf } from './engine'

/* FROM THE MOMENT HIS SANS POSTING IS SAVED (owner D2340, 23 Nov 26 — "his bell line comes when the posting is saved —
   'You're SANS from Fri 17 Jul. You're planned on Sat 18, Mon 20 Jul with nothing filed. Tap to file.'"; it narrows D2338,
   which waited for the posting's date, when he could first be filed for — D2340 lets him be filed for from the save).
   The first day of HIS SANS posting as saved, run or not yet run, or null (a posting taken back, gone or of another
   outcome is no longer his SANS posting). */
export function sansPostedFrom(pid: string): string | null {
  let w: ReturnType<typeof getState>['postOuts'][string] | undefined
  try { w = getState().postOuts[pid] } catch { return null }
  return w && !w.gone && outcomeOf(w) === 'sans' && typeof w.to === 'string' && w.to ? addDays(w.to, 1) : null
}
/* HIS FILED SANS DAYS AS THEY SHOW NOW (D2341) — every day, today on, one of his SANS availability records covers and he
   is SANS on (the days that record shows on — engine/inputs.ts sansShownOn), first first. What the posting's take-back
   compares, after the change, to say which it hid. Read from the records themselves, whatever week is loaded. */
/* (for every man asked, in ONE pass over the records: every SANS man is asked now, D2394 2b, at the start of every command) */
function sansFiledShown(pids: ReadonlySet<string>, today: string): Map<string, string[]> {
  const sets = new Map<string, Set<string>>()
  // any: an input record is untyped (a verbatim port, src/engine/inputs.ts)
  for (const r of INPUTS as any[]) {
    if (!r || !isSansAvail(r.type)) continue
    const sp = inputSpanIso(r)
    if (!sp) continue
    for (const e of namedOf(r) as Array<{ p?: unknown }>) {
      const pid = String(e.p)
      if (!pids.has(pid)) continue
      // any: the engine's person record is untyped (a verbatim port, src/engine/people.ts)
      const p: any = (PEOPLE as any)[pid]
      if (!p) continue
      let out = sets.get(pid)
      if (!out) sets.set(pid, out = new Set())
      for (let d = sp[0] > today ? sp[0] : today, n = 0; d <= sp[1] && n < 400; d = addDays(d, 1), n++) if (sansOnP(p, d)) out.add(d)
    }
  }
  const res = new Map<string, string[]>()
  for (const [pid, out] of sets) res.set(pid, [...out].sort())
  return res
}

/* The days, first first. Worked out once a change of the app (the store's version, the war's state, the date), never once
   a reading: the bell asks for it on every draw, and only the one man it concerns gets past the first questions. */
let CACHE_VER = -1, CACHE_LW: unknown = null, CACHE_DAY = ''
const CACHE = new Map<string, string[]>()
/* (the weeks held and who each day names, read once a change of the app whoever is asked: every SANS man is asked now, D2394 2b) */
// any: a day of the engine's week is untyped (a verbatim port, src/engine/data.ts)
let WEEKS: Array<[string, any[]]> | null = null
const ENGAGED = new Map<string, ReturnType<typeof dayEngaged>>()
export function sansUnfiledDays(pid: string): string[] {
  const today = effectiveToday()
  let lw: unknown = null
  try { lw = getState() } catch { lw = null }
  const ver = raptorVersion()
  if (ver !== CACHE_VER || lw !== CACHE_LW || today !== CACHE_DAY) { CACHE.clear(); ENGAGED.clear(); WEEKS = null; CACHE_VER = ver; CACHE_LW = lw; CACHE_DAY = today }
  const hit = CACHE.get(pid)
  if (hit) return hit
  const out = unfiledNow(pid, today)
  CACHE.set(pid, out)
  return out
}
// any: a day of the engine's week is untyped (a verbatim port, src/engine/data.ts)
function weeksHeld(): Array<[string, any[]]> {
  if (WEEKS) return WEEKS
  // any: the engine's loaded week is untyped (a verbatim port)
  const out: Array<[string, any[]]> = [[String(CURWEEK), (DAYS as any[]) || []]]
  for (const k of stashKeys()) {
    if (k === String(CURWEEK)) continue
    /* (a saved week that cannot be read holds nothing to name — stashDays answers null) */
    out.push([k, stashDays(k)?.days || []])
  }
  WEEKS = out
  return out
}
function unfiledNow(pid: string, today: string): string[] {
  // any: the engine's person record is untyped (a verbatim port, src/engine/people.ts)
  const p: any = (PEOPLE as any)[pid]
  /* EVERY SANS MAN PLANNED WITH NOTHING FILED (his D2394 2b, 23 Nov 26 — "the need is the same however he became SANS"):
     a man posted out as SANS, from the moment it is saved (D2340), and a man ticked SANS on Quals with no posting */
  if (!p || p.special || p.deleted || p.archived || !sansFiler(p)) return []
  const from = sansPostedFrom(pid)
  /* the days of his OWN squadron's schedule — the inputs read are the schedule in view's (engine/inputs.ts inputsOn), so a
     squadron in view other than his own answers nothing rather than something wrong */
  if (homeUnitOf(pid, today) !== UNIT) return []
  const start = from && from > today ? from : today
  const days: string[] = []
  for (const [wk, list] of weeksHeld()) {
    // any: the same engine day
    list.forEach((d: any, di: number) => {
      if (!d) return
      const iso = dayIso(wk, di)
      if (iso < start || !sansOnP(p, iso)) return
      const key = `${wk}:${di}`
      let named = ENGAGED.get(key)
      if (!named) ENGAGED.set(key, named = dayEngaged(d))
      if (!named.has(pid) || sansAvailOn(pid, d.dt)) return
      days.push(iso)
    })
  }
  return [...new Set(days)].sort()
}

/* A TAKE-BACK LINE, NOT ITS "TAKEN BACK" */
// any: a notice part is read by its kind
const backPart = (n: Notice): any => { const p: any = (n.what || [])[0]; return p && p.k === 'sansback' && !p.back ? p : null }
/* THE REMINDER'S ID BEFORE WHAT IT NAMES: the man, and how many lines have told him his SANS ended — so the same posting
   made again is NEWS, the posting line's own way (sync.ts postedLinesOf, [NOTICE-UNDO-RETRACT]). His date moving is not
   (the coordinator's reading of D2394 2a, for him to confirm: only a newly planned day lights it again), nor is the date
   arriving, when the title changes (reading 5). */
function dueBase(pid: string): string {
  const ended = NOTICES.filter(x => {
    const p = x.to === pid ? backPart(x) : null
    return !!p && p.how !== 'later' && p.how !== 'earlier'
  }).length
  return `sansdue:${pid}${ended ? `:${ended}` : ''}`
}
/* A DAY HE WAS NEWLY PUT ON (his D2394 2a, "a newly planned day"; the coordinator's reading 1, for him to confirm: a date
   newly in the list because he was put on the programme that day). What is on the schedule cannot say so afterwards: a day
   dropped and planned again looks as it did, a filing deleted brings a day into the list, another week loaded brings
   its days. So the change that puts him on a day counts it, `settings/sansplan:<pid>:<iso>` = how many times (below,
   wireSansBackBefore), and the reminder's id carries each day's count. One row a man and day, so one person's planning
   never stands in the way of another's Undo. */
const PLAN_PFX = 'sansplan:'
const planKey = (pid: string, iso: string): string => `${PLAN_PFX}${pid}:${iso}`
function planOf(pid: string, iso: string): number {
  const v: unknown = store.get(planKey(pid, iso), 0)
  return typeof v === 'number' && Number.isInteger(v) && v > 0 ? v : 0
}
/* WHAT HE HAS READ OF THIS REMINDER, day by day, each with its count then; null when he has read none of it */
function readOf(ids: readonly string[], base: string): Map<string, number> | null {
  const pre = `${base}~`
  let out: Map<string, number> | null = null
  for (const id of ids) {
    if (!id.startsWith(pre)) continue
    out ??= new Map()
    for (const t of id.slice(pre.length).split(',')) {
      const [d, g] = t.split('.')
      if (d) out.set(d, Math.max(out.get(d) ?? -1, Number(g ?? 0) || 0))
    }
  }
  return out
}
/* THE ID OF THE LINE AS IT STANDS: every day it names, and every day from today he has been counted on — a day he has filed
   for too, so that deleting that filing later brings back a day he already read (reading 1) */
function dueToken(pid: string, base: string, days: readonly string[], today: string): string {
  const all = new Map<string, number>(days.map(d => [d, planOf(pid, d)]))
  const pre = `${PLAN_PFX}${pid}:`
  for (const k of store.keys(pre)) {
    const d = k.slice(pre.length)
    if (d >= today && !all.has(d)) all.set(d, planOf(pid, d))
  }
  return `${base}~${[...all].sort(([a], [b]) => (a < b ? -1 : 1)).map(([d, g]) => (g ? `${d}.${g}` : d)).join(',')}`
}
/* IS THE REMINDER STANDING NOW ONE HE HAS READ (his D2391; the coordinator's reading 2, for him to confirm): a day it names now
   is one he read. A reminder that went earlier gives no title later, even with the same day planned again. */
function dueRead(s: { upto: number; ids: readonly string[] }, pid: string, base: string, days: readonly string[], at: number): boolean {
  if (at <= s.upto) return true
  const read = readOf(s.ids, base)
  return !!read && days.some(d => read.has(d) && read.get(d)! >= planOf(pid, d))
}

/** HIS BELL'S LINE (state/notices.ts setDerivedNotices, through leavewar/sync.ts): one, or none */
export function sansUnfiledLines(pid: string): Notice[] {
  const days = sansUnfiledDays(pid)
  if (!days.length) return []
  const from = sansPostedFrom(pid)
  /* dated the posting's own midnight, as the posting's line is (sync.ts postedLinesOf) — a moment still to come while the
     posting waits for its date (D2340): the bell prints no age for it (state/notices.ts noticeAge), and "Mark all read"
     reads it by its id (state/noticeseen.ts). A man with no posting: his first such day's. */
  const at = midnightOf(from ?? days[0]!)
  const base = dueBase(pid), today = effectiveToday()
  const ids = seenOf(pid).ids, read = readOf(ids, base)
  /* (lit again only by a day counted since he read it — never by a day dropping off, a filing deleted or a week loaded) */
  const lit = !read || days.some(d => { const g = planOf(pid, d); return g > 0 && g > (read.get(d) ?? -1) })
  const id = (!lit && ids.find(x => x.startsWith(`${base}~`))) || dueToken(pid, base, days, today)
  /* (his date in the title only while it is ahead — D2394 2b, "a man with no SANS date ahead", over D2340's older "the
     words stay the same after the date" by D90; the coordinator's reading 5, for him to confirm. The id does not change) */
  return [{ id, to: pid, by: null, at, iid: '', name: 'Your SANS availability', day: days[0]!, what: [{ k: 'sansdue', days, ...(from && from > today ? { from } : {}) }] }]
}

/* ---- WHEN HIS SANS POSTING OR TICK CHANGES (his D2391, 23 Nov 26; D1693, D1710 — every bell line is taken back by the undo
   of what made it) ----
   The posting's own take-back gathers his live reminder with its other lines (sync.ts postingLinesOf) and hands each to
   retractPostingLines, which asks here first: the reminder is worked out, so with its posting changed nothing makes it any
   more and it simply goes, read or not — `sansLineBack` only says it was this kind, so the posting's own steps skip it.
   NARROWING D1699 FOR THIS LINE ALONE (D2391): it is not struck through. What he is TOLD is one plain stored line, written
   once the change is made, by `sansTakeBack`: to him, unread, by the admin who did it — never to that admin himself — and
   ONLY when the change hid something he filed (D2341; nothing is deleted: engine/inputs.ts sansShownOn) or he had read the
   reminder. Its words are noticeWords' (state/notices.ts sansBackWords). Filing, or a day leaving, is no take-back: the
   live line only shrinks or goes. */
export function sansLineBack(n: Notice): boolean {
  // any: a notice part is read by its kind, the fields differing by kind (state/notices.ts)
  const p: any = (n.what || [])[0]
  return !!p && p.k === 'sansdue'
}
const midnightOf = (iso: string): number => new Date(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)).getTime()
/* what changed of a SANS posting, read from the posting as it now stands (the gate reads the same from the change's
   after-image: sansBackOwed) */
function postingHow(pid: string, from: string): { how: SansBackHow; to?: string } {
  const now = sansPostedFrom(pid)
  if (now && now !== from) return { how: now > from ? 'later' : 'earlier', to: now }
  let w: ReturnType<typeof getState>['postOuts'][string] | undefined
  try { w = getState().postOuts[pid] } catch { w = undefined }
  return { how: !now && (!w || w.gone || !w.to) ? 'undone' : 'other' }
}
const noted = (pid: string) => (BEFORE && BEFORE.env != null && BEFORE.env === activeEnvelope() ? BEFORE.men.get(pid) : undefined)
/** THE ONE LINE A CHANGE OF HIS SANS OWES HIM (sync.ts takeBack, or the Quals untick — below — inside the change's own
 *  command, after it is made): `from` — his SANS posting's first day as it stood before (null for an untick); `by` — who
 *  changed it. */
export function sansTakeBack(pid: string, from: string | null, by: string | null, at: number): void {
  if (pid === by) return                                 // (he changed it himself: nothing to tell him)
  const ent = noted(pid)
  if (!ent) return
  const read = ent.due.length ? dueRead(seenOf(pid), pid, ent.base, ent.due, ent.at) : false
  const prior = priorTold(pid, seenSavedOf(pid))
  const hid = unionDays(hiddenNow(pid, ent.filed), prior.carried)
  if (!read && !hid.length && !prior.kept) return
  noticeSansBack(pid, by, read ? ent.due : [], from ?? effectiveToday(), at, hid, {
    ...(from ? postingHow(pid, from) : { how: 'untick' as const }),
    ...(prior.over.length ? { over: prior.over } : {}),
    ...(prior.kept && !read ? { kept: true as const } : {}),
  })
}
/* SEVERAL CHANGES BEFORE HE READS (the coordinator's reading 3, for him to confirm): ONE line, the latest. The new line names
   the lines of this kind he has not read (`over`: they stop showing, and come back if its Undo takes it away), carries
   the days they said were hidden that still are, and is `kept` if one of them stood on a reminder he had read, so it
   is still owed once nothing is hidden. Read from his read record as saved. `not` — the line being checked itself. */
function priorTold(pid: string, s: { upto: number; ids: readonly string[] }, not?: unknown): { over: string[]; carried: string[]; kept: boolean } {
  // any: the engine's person record is untyped (a verbatim port, src/engine/people.ts)
  const person: any = (PEOPLE as any)[pid]
  const over: string[] = [], carried = new Set<string>()
  let kept = false
  for (const x of NOTICES) {
    if (x.to !== pid || x.id === not) continue
    const p = backPart(x)
    if (!p || x.at <= s.upto || s.ids.includes(x.id)) continue
    over.push(x.id)
    for (const d of Array.isArray(p.hid) ? p.hid : []) if (!sansOnP(person, d)) carried.add(d)
    if (p.kept || (Array.isArray(p.days) && p.days.length)) kept = true
  }
  return { over, carried: [...carried], kept }
}
const unionDays = (a: readonly string[], b: readonly string[]): string[] => [...new Set([...a, ...b])].sort()
// any: the engine's person record is untyped (a verbatim port, src/engine/people.ts)
const hiddenNow = (pid: string, filed: readonly string[]): string[] => { const p: any = (PEOPLE as any)[pid]; return filed.filter(d => !sansOnP(p, d)) }

/* WHICH CHANGE OWES SUCH A LINE (state/perms.ts, through sync.ts warLinesOwed — chat 147's two code reads: every image of
   any change of a posting record owed one, so an admin's command that MADE a first SANS posting wrote a "taken back" of
   made-up days). Only a real take-back: his record's BEFORE image is a SANS posting — saved, run or not yet run, since
   his line shows from the save (D2340) — and the AFTER image takes it away (Undo post out), moves its date or gives it
   another outcome (D1710 — postOut). Its day is the before image's date. A new posting, or a change that keeps the SANS
   posting as it was (its run on its date; an archive or a restore leaving it), owes none. Pure. */
type LooseRec = Record<string, unknown>
const loose = (x: unknown): LooseRec | null => (x && typeof x === 'object' && !Array.isArray(x) ? (x as LooseRec) : null)
export type SansBackOwed = { day: string; how: SansBackHow; to?: string }
/* what the AFTER image makes of the posting of `day` (D2391's A, B, D, E — the writer's postingHow, read from the change) */
function howOfAfter(a: LooseRec | null, day: string): { how: SansBackHow; to?: string } {
  const on = !!a && !a.gone && typeof a.to === 'string' && !!a.to
  if (on && outcomeOf(a as { poOutcome?: unknown; poArchive?: boolean }) === 'sans') {
    const to = addDays(a!.to as string, 1)
    if (to !== day) return { how: to > day ? 'later' : 'earlier', to }
    return { how: 'other' }
  }
  return { how: on ? 'other' : 'undone' }
}
export function sansBackOwed(c: { collection: string; op: string; before?: unknown; after?: unknown }): SansBackOwed | null {
  if (c.collection !== 'lw.postouts') return null
  const b = loose(c.before)
  if (!b || b.gone || typeof b.to !== 'string' || !b.to || outcomeOf(b as { poOutcome?: unknown; poArchive?: boolean }) !== 'sans') return null
  const day = addDays(b.to, 1)
  const a = loose(c.op === 'delete' ? null : c.after)
  /* A RUN POSTING: its AFTER image no longer that run — gone, or its run mark (`poDone`) no longer that date — the store
     clears it whenever the date or the outcome changes (state/store.ts setPostOut `same`), so a move and another outcome
     both read so. An archive by hand rewrites the record (outcome "overseas", the archive's own body) but keeps its run
     mark: it is no take-back of the posting and owes none; neither does a restore that leaves the run as it was. */
  if (b.poDone === day) return !!a && !a.gone && typeof a.to === 'string' && a.poDone === day ? null : { day, ...howOfAfter(a, day) }
  /* A POSTING NOT YET RUN (D2340): taken away, its date moved, or another outcome. Its run on its own date keeps it. */
  const kept = !!a && !a.gone && a.to === b.to && outcomeOf(a as { poOutcome?: unknown; poArchive?: boolean }) === 'sans'
  return kept ? null : { day, ...howOfAfter(a, day) }
}
/* HIS QUALS SANS TICK TAKEN OFF (D2391's C): owed by a change of his person record from SANS to not, on the day it is made
   — never by a posting's own take-back, which lifts the tick it put on and owes its own line (sansBackOwed, above). */
export function sansUntickOwed(c: { collection: string; id: string; op: string; before?: unknown; after?: unknown },
  changes: ReadonlyArray<{ collection: string; id: string }>): SansBackOwed | null {
  if (c.collection !== 'people' || c.op === 'delete') return null
  const b = loose(c.before), a = loose(c.after)
  if (!b || !a || !b.san || a.san) return null
  if (changes.some(x => x.collection === 'lw.postouts' && String(x.id) === String(c.id))) return null
  return { day: effectiveToday(), how: 'untick' }
}
/* HIS LIVE LINE'S DAYS AND HIS FILED DAYS AS THEY STOOD WHEN THE COMMAND BEGAN (chat 147's re-reads — Astra's R1, the
   security reader's SEC2-1; D2341): the struck line keeps what his line SAID (D1693, D1699, D1710), and what was hidden is
   what showed before and does not now — and the gate runs after the posting has changed, when neither can be asked of
   the world any more. So at the start of every person's command, before its body runs, each man with a SANS posting
   saved or a SANS tick (D2394 2b, D2391's C) has noted here his live line's days (sansUnfiledDays — what postingLinesOf
   hands the writer at the same moment), his filed days as they show (sansFiledShown), and his reminder's id before its
   days, with the command they belong to; the writer and the gate both read these, and the gate compares exactly. A command
   they were not noted for (no person's, or a later one) has none and owes no line. The live days come from the day's
   cache and the filed days from one pass over the records. */
type Noted = { due: string[]; filed: string[]; base: string; at: number }
let BEFORE: { env: unknown; men: Map<string, Noted> } | null = null
let BEFORE_WIRED = false
export function wireSansBackBefore(): void {
  if (BEFORE_WIRED) return
  BEFORE_WIRED = true
  onPipelineBegin(() => {
    const men = new Map<string, Noted>()
    const today = effectiveToday()
    try {
      /* every man a SANS posting names, and every man ticked SANS (D2394 2b, D2391's C) */
      const ids = new Set(Object.keys(getState().postOuts).filter(pid => sansPostedFrom(pid)))
      /* (the squadron in view's roster: his reminder shows only on his own squadron's schedule — unfiledNow) */
      for (const pid of rosterOf(UNIT, today)) {
        // any: the engine's person record is untyped (a verbatim port, src/engine/people.ts)
        const p: any = (PEOPLE as any)[pid]
        if (p && p.san && !p.special) ids.add(pid)
      }
      const filed = sansFiledShown(ids, today)
      for (const pid of ids) {
        const due = [...sansUnfiledDays(pid)], from = sansPostedFrom(pid)
        men.set(pid, { due, filed: filed.get(pid) ?? [], base: dueBase(pid), at: due.length ? midnightOf(from ?? due[0]!) : 0 })
      }
    } catch { /* no war loaded: no line to note */ }
    BEFORE = { env: activeEnvelope(), men }
  })
  /* COUNTING A DAY HE IS NEWLY PUT ON (reading 1, above): a person's change that names him on a day it did not name him on,
     a SANS day of his from today with nothing filed. Written by the app, after the change, never by the person: an Undo
     or a Redo counts nothing, and a day that merely comes into view (a week loaded) is no change. */
  onCommit(env => {
    if (env.origin !== 'user') return
    const owed: Array<[string, string]> = []
    const today = effectiveToday()
    for (const c of env.changes) {
      if (c.collection !== 'days' || c.op === 'delete' || !c.before || !c.after) continue
      const m = /@(\d\d\/\d\d\/\d{4})#(\d+)$/.exec(String(c.id))
      if (!m) continue
      const iso = dayIso(m[1]!, Number(m[2]))
      if (iso < today) continue
      const was = dayEngaged(c.before) as Set<string>
      // any: a day of the engine's week is untyped (a verbatim port, src/engine/data.ts)
      const after: any = c.after
      for (const pid of dayEngaged(after) as Set<string>) {
        if (was.has(pid)) continue
        // any: the engine's person record is untyped (a verbatim port, src/engine/people.ts)
        const p: any = (PEOPLE as any)[pid]
        if (!p || !sansFiler(p) || !sansOnP(p, iso) || homeUnitOf(pid, today) !== UNIT || sansAvailOn(pid, after.dt)) continue
        owed.push([pid, iso])
      }
    }
    if (!owed.length) return
    // any: the settings door's scope is its own file's; a plain module name is what the command layer reads
    commitProjection({ type: 'sans.planned', scope: { module: 'settings' } as any, apply: txn => {
      txn.enlist(settingsStore)
      for (const [pid, iso] of owed) store.set(planKey(pid, iso), planOf(pid, iso) + 1)
    } })
  })
  /* THE QUALS UNTICK TELLS HIM TOO (D2391's C — state/quals-write.ts, which knows nothing of the war): the scheduler store
     joins the people command only where a line may be owed, an admin's untick of a man with something filed or a reminder
     showing, so every other tick is the plain people command it always was */
  setSansTickWatch({
    begin: (pid: string, txn: Txn): boolean => {
      const by = me()
      if (by == null || String(by) === pid) return false
      const ent = noted(pid)
      if (!ent || (!ent.filed.length && !ent.due.length)) return false
      resyncBeforeEnlist(); txn.enlist(schedStore)
      return true
    },
    end: (pid: string): void => {
      const by = me()
      sansTakeBack(pid, null, by != null ? String(by) : null, Date.now())
      schedApplyEnd()
    },
  })
}
const sameDays = (a: readonly unknown[], b: readonly string[]): boolean => a.length === b.length && a.every((d, i) => d === b[i])
/* WHAT THE PERMISSIONS CHECK ASKS OF SUCH A LINE (state/perms.ts, through sync.ts warLineCovered): owed only by that
   take-back (above), to the man himself, on its date; what it says changed (`how`, `to` — D2391) is what this command
   changed, and it is never a "taken back" (`back`, only ever a restore's follow-up); its two lists (`days`, the reminder he
   had read; `hid`, hidden) each a list of distinct ISO dates in order, each on or after that date, at least one of them
   not empty; `days` — if any — EXACTLY the days his live line named when the command began (BEFORE, above), and only where
   he had READ that line by his read record AS SAVED, never this device's copy in memory (the security re-read's SEC2-2):
   the record as it stood before this command where the command changes it (its before-image), else the stored row
   (state/noticeseen.ts seenSavedOf), the reminder's id as it stood before this command; `hid` EXACTLY his filed days that
   showed when the command began and do not now (D2341) — a day made up, or one left out, is refused. One a man and posting
   a command is the gate's own count (state/perms.ts `sansBacks`). */
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/
const isoRun = (x: unknown, from: string): x is string[] => Array.isArray(x)
  && x.every((d, i) => typeof d === 'string' && ISO_DAY.test(d) && d >= from && (i === 0 || d > (x[i - 1] as string)))
export function sansBackCovered(o: { who: string; day: string; o: string; how?: SansBackHow; to?: string }, n: { id?: unknown; to?: unknown; name?: unknown; day?: unknown; what?: unknown },
  changes: ReadonlyArray<{ collection: string; id: string; op: string; before?: unknown }> = []): boolean {
  if (o.o !== 'sans' || String(n.to) !== o.who || n.day !== o.day || n.name !== 'Your SANS availability') return false
  const p = Array.isArray(n.what) ? loose(n.what[0]) : null
  if (!p) return false
  /* (what it says changed is what this command changed, D2391 — and a "taken back" is only ever a restore's follow-up) */
  if (p.back !== undefined) return false
  if (p.how !== undefined && (p.how !== o.how || p.to !== o.to)) return false
  /* (a day it carries from an earlier line may be before this posting's date: `hid` is checked exactly, below) */
  const days = p.days, hid = p.hid === undefined ? [] : p.hid
  if (!isoRun(days, o.day) || !isoRun(hid, '')) return false
  const ent = noted(o.who)
  if (!ent) return false
  /* (his read record as saved: the before-image where this command changes it) */
  const rec = changes.find(c => c.collection === 'settings' && c.id === NOTICESEEN_PFX + o.who)
  const seen = seenSavedOf(o.who, rec ? { before: rec.before ?? null } : undefined)
  /* what it folds in is exactly his unread lines of this kind, and what it says of them (reading 3) */
  const prior = priorTold(o.who, seen, n.id)
  if (!sameDays(hid, unionDays(hiddenNow(o.who, ent.filed), prior.carried))) return false
  if (!sameDays(p.over === undefined ? [] : (Array.isArray(p.over) ? p.over : [null]), prior.over)) return false
  if (p.kept !== undefined && p.kept !== true) return false
  if (!!p.kept !== (prior.kept && !days.length)) return false
  if (!days.length && !hid.length && !p.kept) return false
  if (!days.length) return true
  if (!sameDays(days, ent.due)) return false
  return dueRead(seen, o.who, ent.base, ent.due, ent.at)
}
