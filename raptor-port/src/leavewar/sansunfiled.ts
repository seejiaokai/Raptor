/* HIS SANS DAYS WITH NOTHING FILED — THE LINE HIS OWN BELL WORKS OUT (owner D2338, 22 Nov 26 — "Should we tell the user
   too": yes; "on that date his bell tells him the planned days with nothing filed, a tap opening the SANS calendar"; built
   without a drawing first on his D2339).

   A man posted out as SANS from a date ahead can be named on our programme for days past that date before it comes (D2329).
   Since D2340 he may be filed for from the moment the posting is saved, and his bell lists from then the days he is planned
   with us and has filed nothing for, a tap opening the SANS calendar on the first of them (ui/topstate.ts openNotice).

   THE AGENT'S READINGS, TOLD TO HIM (D2338's row): the man himself only, never an admin's bell; not before the posting's
   date (since D2340, from the moment it is saved — below); one line naming the days. And the build's (his to change): the days are those from the posting's date on, today
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
import { stashKeys, stashDays, stashGet } from '../engine/weekstash'
import { dayIso } from '../engine/verid'
import { dayEngaged } from '../engine/avail'
import { sansAvailOn, INPUTS, isSansAvail, namedOf, inputSpanIso } from '../engine/inputs'
import { homeUnitOf, rosterOf } from '../engine/roster'
import { getVersion as raptorVersion } from '../state/store'
import { effectiveToday } from '../state/person-delete'
import { NOTICES, noticeSansBack, setSansFiledProbe, type Notice, type SansBackHow } from '../state/notices'
import { seenOf, seenSavedOf, hasReadSaved, NOTICESEEN_PFX } from '../state/noticeseen'
import { me } from '../state/perms'
import { setSansTickWatch } from '../state/quals-write'
import { schedStore, resyncBeforeEnlist, schedApplyEnd } from '../state/sched-commit'
import { commitProjection, onCommit, onPipelineBegin, activeEnvelope, commandStream, type Txn } from '../command'
import type { Change, CommitEnvelope } from '../command/types'
import { deepEqual } from '../command/util'
import { requestsSig, deletedSig, loadedSrcSig } from '../engine/overlay'
import { applyingRestore } from '../undo/timeline'
import { setSansPlanReplay, setSansPlanOwed, setSansUndoTold } from '../state/perms'
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
/* EVERY SANS AVAILABILITY RECORD, whatever squadron — a man's own SANS records follow him, so this is the one read of the
   whole inputs list this file is allowed (engine/inputsfor-readers.test.ts); both readers below go through it. */
// any: an input record is untyped (a verbatim port, src/engine/inputs.ts)
function sansAvailRecords(): any[] {
  return (INPUTS as any[]).filter(r => r && isSansAvail(r.type))
}
function sansFiledShown(pids: ReadonlySet<string>, today: string): Map<string, string[]> {
  const sets = new Map<string, Set<string>>()
  for (const r of sansAvailRecords()) {
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
   a reading: the bell asks for it on every draw, and every SANS man is asked (D2394 2b) — the first questions turn most
   away, and the weeks held are read once for all of them. */
let CACHE_VER = -1, CACHE_LW: unknown = null, CACHE_DAY = ''
const CACHE = new Map<string, string[]>()
/* THE WEEKS HELD (the four reads of 0eaacc411 — Fable's F5, measured: every change anyone made re-read every edited week
   held, at the start of every command): a saved week that ended before today names no day to file, so it is skipped by its
   key and never read; a saved week ahead is read once and kept, with who each of its days names, until its saved copy
   changes (the copy itself is the mark — engine/weekstash.ts keeps one per week). The loaded week is read afresh once a
   change, as before.
   …AND UNTIL ANYTHING ELSE ITS READING USES CHANGES (round 2 of the reads of f73602f9f — Astra's F3, the Opus read's R1,
   Fable's F1): a saved week is not only its copy — it is worked out on read with the requests as they stand now (one
   landed, edited or deleted from another week), a deleted man taken off, and its days labelled under the year of the week
   on screen (engine/weekstash.ts stashDays → engine/overlay.ts viewOfWeek). Kept by its copy alone, a Meeting deleted
   while another week was loaded still named him, and a day filed across the New Year stayed listed. So the reading is
   kept by everything it reads, as the next-week peek keys its own (ui/peek.ts): the copy, the requests, the men deleted,
   the loaded week's rows, the week on screen and the squadron in view. */
// any: a day of the engine's week is untyped (a verbatim port, src/engine/data.ts)
type Held = { blob: string | null; sig: string; days: any[]; named: Map<number, ReturnType<typeof dayEngaged>> }
const HELD = new Map<string, Held>()
// any: the same engine day
let WEEKS: Array<[string, any[], Held['named']]> | null = null
export function sansUnfiledDays(pid: string): string[] {
  const today = effectiveToday()
  let lw: unknown = null
  try { lw = getState() } catch { lw = null }
  const ver = raptorVersion()
  if (ver !== CACHE_VER || lw !== CACHE_LW || today !== CACHE_DAY) { CACHE.clear(); WEEKS = null; CACHE_VER = ver; CACHE_LW = lw; CACHE_DAY = today }
  const hit = CACHE.get(pid)
  if (hit) return hit
  const out = unfiledNow(pid, today)
  CACHE.set(pid, out)
  return out
}
// any: a day of the engine's week is untyped (a verbatim port, src/engine/data.ts)
function weeksHeld(today: string): Array<[string, any[], Held['named']]> {
  if (WEEKS) return WEEKS
  const cur = String(CURWEEK)
  // any: the engine's loaded week is untyped (a verbatim port)
  const out: Array<[string, any[], Held['named']]> = [[cur, (DAYS as any[]) || [], new Map()]]
  const keep = new Set<string>()
  let sig: string | null = null
  for (const k of stashKeys()) {
    if (k === cur || dayIso(k, 6) < today) continue
    keep.add(k)
    const blob = stashGet(k)
    /* (worked out once a change, and only where a week ahead is held) */
    sig ??= `${deletedSig()}|${requestsSig()}|${loadedSrcSig()}|${cur}|${UNIT}`
    let h = HELD.get(k)
    /* (a saved week that cannot be read holds nothing to name — stashDays answers null) */
    if (!h || h.blob !== blob || h.sig !== sig) HELD.set(k, h = { blob, sig, days: stashDays(k)?.days || [], named: new Map() })
    out.push([k, h.days, h.named])
  }
  for (const k of [...HELD.keys()]) if (!keep.has(k)) HELD.delete(k)
  WEEKS = out
  return out
}
function unfiledNow(pid: string, today: string): string[] {
  // any: the engine's person record is untyped (a verbatim port, src/engine/people.ts)
  const p: any = (PEOPLE as any)[pid]
  /* EVERY SANS MAN PLANNED WITH NOTHING FILED (his D2394 2b, 23 Nov 26 — "the need is the same however he became SANS"):
     a man posted out as SANS, from the moment it is saved (D2340), and a man ticked SANS on Quals with no posting */
  if (!p || p.special || p.deleted || p.archived || !sansFiler(p)) return []
  /* the days of his OWN squadron's schedule — the inputs read are the schedule in view's (engine/inputs.ts inputsOn), so a
     squadron in view other than his own answers nothing rather than something wrong */
  if (homeUnitOf(pid, today) !== UNIT) return []
  /* every SANS day of his from today, by either cause (the walk's W11-1, 24 Nov 26): a man ticked SANS today and posted out
     as SANS from a date ahead is SANS now, by the tick — the days before his posting are his too (sansOnP, below) */
  const days: string[] = []
  for (const [wk, list, namedBy] of weeksHeld(today)) {
    // any: the same engine day
    list.forEach((d: any, di: number) => {
      if (!d) return
      const iso = dayIso(wk, di)
      if (iso < today || !sansOnP(p, iso)) return
      let named = namedBy.get(di)
      if (!named) namedBy.set(di, named = dayEngaged(d))
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
   arriving, when the title changes (reading 5). ONLY A LINE THAT ENDED IT (the four reads of 0eaacc411 — the Opus read's
   F1): a posting undone, or a tick taken off, that leaves him SANS by the other cause ended nothing, and a reminder he had
   read came back unread with nothing newly planned. So the writer marks a line `ended` only where, after the change, he has
   no SANS day from today (endedNow, below — the gate checks it), and only those count; a Redo's copy is not another. */
/* …nor one a "taken back" names (round 2's Astra F1): an Undo's line its Redo retracted ended nothing that still stands */
function dueBase(pid: string): string {
  const ended = NOTICES.filter(x => {
    const p = x.to === pid ? backPart(x) : null
    return !!p && p.ended === true && !p.again && !retracted(x)
  }).length
  return `sansdue:${pid}${ended ? `:${ended}` : ''}`
}
/* after the change: no SANS day of his from today, by any cause (sansFiler: his tick or a posting ahead; sansOnP: a stretch
   still running) */
function endedNow(pid: string): boolean {
  // any: the engine's person record is untyped (a verbatim port, src/engine/people.ts)
  const p: any = (PEOPLE as any)[pid]
  return !p || (!sansFiler(p) && !sansOnP(p, effectiveToday()))
}
/* A DAY HE WAS NEWLY PUT ON (his D2394 2a, "a newly planned day"; the coordinator's reading 1, for him to confirm: a date
   newly in the list because he was put on the programme that day). What is on the schedule cannot say so afterwards: a day
   dropped and planned again looks as it did, a filing deleted brings a day into the list, another week loaded brings
   its days. So the change that puts him on a day marks it, `settings/sansplan:<pid>:<iso>`, and the reminder's id carries
   each day's mark. One row a man and day, so one person's planning never stands in the way of another's Undo.
   THE MARK IS A STAMP THAT ONLY GROWS (the four reads of 0eaacc411 — Fable's F1 and Q-b, Astra #4): it was a count + 1, and
   the mark is part of the planning step, so an Undo took it back to what it was and a fresh planning wrote the same count
   again, which he had already read — his bell stayed dark. Now each marking is newer than every mark before it, on this
   device and in his own read record (nextStamp): an Undo puts back an older one (read), a Redo puts back the one he may
   have read (no news), a fresh planning writes a newer one (lit) — and a man moved between squadrons carries no count to
   collide with. Written only by the app's own projection, or the verified Undo / Redo of a step that holds it (state/perms.ts
   sansPlanViolation; outside every command, never — state/people-settings-commit.ts). */
const PLAN_PFX = 'sansplan:'
const planKey = (pid: string, iso: string): string => `${PLAN_PFX}${pid}:${iso}`
function planOf(pid: string, iso: string): number {
  const v: unknown = store.get(planKey(pid, iso), 0)
  return typeof v === 'number' && Number.isInteger(v) && v > 0 ? v : 0
}
/* WHAT HE HAS READ OF THIS REMINDER, day by day, each with its mark then; null when he has read none of it */
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
    if (d >= today && !all.has(d) && planOf(pid, d) > 0) all.set(d, planOf(pid, d))
  }
  return `${base}~${[...all].sort(([a], [b]) => (a < b ? -1 : 1)).map(([d, g]) => (g ? `${d}.${g}` : d)).join(',')}`
}
/* (newer than every mark this device has written, than the day's mark as it stands, and than any mark of that day he has
   read, under any of his reminders' bases) */
let LAST_STAMP = 0
function nextStamp(pid: string, iso: string): number {
  let read = 0
  for (const id of seenSavedOf(pid).ids) {
    const cut = id.indexOf('~'), base = cut < 0 ? id : id.slice(0, cut)
    if (cut < 0 || (base !== `sansdue:${pid}` && !base.startsWith(`sansdue:${pid}:`))) continue
    for (const t of id.slice(cut + 1).split(',')) { const [d, g] = t.split('.'); if (d === iso) read = Math.max(read, Number(g ?? 0) || 0) }
  }
  LAST_STAMP = Math.max(Date.now(), LAST_STAMP + 1, read + 1, planOf(pid, iso) + 1)
  return LAST_STAMP
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
  /* (his date in the title only while he is not SANS yet: one SANS today by his tick has no SANS date ahead — W11-1) */
  // any: the engine's person record is untyped (a verbatim port, src/engine/people.ts)
  const ahead = !!from && from > today && !sansOnP((PEOPLE as any)[pid], today)
  const ids = seenOf(pid).ids, read = readOf(ids, base)
  /* (lit again only by a day counted since he read it — never by a day dropping off, a filing deleted or a week loaded) */
  const lit = !read || days.some(d => { const g = planOf(pid, d); return g > 0 && g > (read.get(d) ?? -1) })
  const id = (!lit && ids.find(x => x.startsWith(`${base}~`))) || dueToken(pid, base, days, today)
  /* (his date in the title only while it is ahead — D2394 2b, "a man with no SANS date ahead", over D2340's older "the
     words stay the same after the date" by D90; the coordinator's reading 5, for him to confirm. The id does not change) */
  return [{ id, to: pid, by: null, at, iid: '', name: 'Your SANS availability', day: days[0]!, what: [{ k: 'sansdue', days, ...(ahead ? { from } : {}) }] }]
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
  return { how: !w || w.gone || !w.to ? 'undone' : 'other' }
}
const noted = (pid: string) => (BEFORE && BEFORE.env != null && BEFORE.env === activeEnvelope() ? BEFORE.men.get(pid) : undefined)
/** THE ONE LINE A CHANGE OF HIS SANS OWES HIM (sync.ts takeBack, or the Quals untick — below — inside the change's own
 *  command, after it is made): `from` — his SANS posting's first day as it stood before (null for an untick); `by` — who
 *  changed it. */
export function sansTakeBack(pid: string, from: string | null, by: string | null, at: number): void {
  if (pid === by) return                                 // (he changed it himself: nothing to tell him)
  if (from && sansPostedFrom(pid) === from) return       // (still posted out as SANS on that date: nothing changed for him)
  const ent = noted(pid)
  if (!ent) return
  /* HE IS STILL POSTED OUT AS SANS: a tick taken off beside a posting that stands is news only for the days the tick alone
     covered, so a reminder he read owes no "You're no longer SANS." — it still stands, for his posting's days */
  const stands = from === null && stillPosted(pid)
  /* (his read record as saved, as the gate reads it — never this device's copy in memory: Astra #3) */
  const seen = seenSavedOf(pid)
  const read = !stands && ent.due.length ? dueRead(seen, pid, ent.base, ent.due, ent.at) : false
  const prior = priorTold(pid, seen)
  const hid = unionDays(hiddenNow(pid, ent.filed), prior.carried)
  if (!read && !hid.length && (stands || !prior.kept)) return
  const made = noticeSansBack(pid, by, read ? ent.due : [], from ?? effectiveToday(), at, hid, {
    ...(from ? postingHow(pid, from) : { how: 'untick' as const }),
    ...(prior.over.length ? { over: prior.over } : {}),
    ...(prior.kept && !read ? { kept: true as const } : {}),
    ...(endedNow(pid) ? { ended: true as const } : {}),
  })
  if (made) rememberUndoTold(NOTICES[NOTICES.length - 1]!.id)
}
/* ---- THE LINE AN UNDO WROTE, TAKEN BACK BY THE REDO AFTER IT (round 2 of the reads of f73602f9f — Astra's F1, the Opus
   read's R2 and R3, Fable's F2; D1693, D1699: every bell line is taken back by the undo of what made it) ----
   An admin's Undo of a SANS tick he put on, or of a SANS posting (sync.ts warNoticesReversed), tells the man inside the
   restore — a line no step holds, so the Redo after it put his SANS back and left "You're no longer SANS." standing, his
   read reminder lit again by its "ended". Each such line is remembered against the step the Undo undid (the timeline's
   own entry, in memory: the Undo list lives no longer than the session), and the Redo of that step takes it back: gone
   where he has not read it, by his read record as saved; struck "taken back" where he has (retractionOf). The gate lets
   only that through (state/perms.ts SANS_UNDO_TOLD, installed below). */
const UNDO_TOLD = new WeakMap<object, { env: unknown; ids: string[] }>()
const restoreNow = (): ReturnType<typeof applyingRestore> => { const env = activeEnvelope(); return env ? applyingRestore(env) : null }
function rememberUndoTold(id: string): void {
  const a = restoreNow()
  if (!a || a.dir !== 'undo') return
  const env = activeEnvelope()
  let r = UNDO_TOLD.get(a.entry)
  /* (an Undo of the step again starts its own list) */
  if (!r || r.env !== env) UNDO_TOLD.set(a.entry, r = { env, ids: [] })
  r.ids.push(id)
}
/* (a line a later "taken back" names — state/notices.ts reads the same) */
const retracted = (x: Notice): boolean => NOTICES.some(y => {
  // any: a notice part is read by its kind
  const q: any = y.to === x.to ? (y.what || [])[0] : null
  return !!q && q.k === 'sansback' && q.back === true && q.ref === x.id
})
/* what its "taken back" says: its own title, struck (state/notices.ts sansBackWords) — the shape an untick's Undo gives its
   line (sync.ts followUpsFor) */
function retractionOf(n: Notice): { k: 'sansback'; days: string[]; how: SansBackHow; to?: string; back: true; ref: string } {
  // any: a notice part is read by its kind
  const p: any = (n.what || [])[0] || {}
  return { k: 'sansback', days: [], how: p.how as SansBackHow, ...(typeof p.to === 'string' ? { to: p.to } : {}), back: true, ref: n.id }
}
/** THE LINES THIS REDO TAKES BACK (sync.ts warNoticesReversed, inside the restore): those its step's Undo wrote that still
 *  stand, none taken back yet */
export function sansUndoToldNow(): Notice[] {
  const a = restoreNow()
  if (!a || a.dir !== 'redo') return []
  const out: Notice[] = []
  for (const id of UNDO_TOLD.get(a.entry)?.ids ?? []) {
    const n = NOTICES.find(x => x.id === id)
    if (n && !retracted(n)) out.push(n)
  }
  return out
}
/** …and takes them back, inside the restore (the scheduler store enlisted): answers how many lines it wrote or took away */
export function sansRetractUndoTold(lines: readonly Notice[], by: string | null): number {
  let n = 0
  for (const x of lines) {
    if (hasReadSaved(x.to, x)) {
      const { k: _k, days, ...said } = retractionOf(x)
      n += noticeSansBack(x.to, by, days, x.day, Date.now(), [], said) ? 1 : 0
    } else {
      const i = NOTICES.findIndex(y => y.id === x.id)
      if (i >= 0) { NOTICES.splice(i, 1); n++ }
    }
  }
  return n
}
/* his SANS posting still makes him SANS, today or from its date ahead (a run posting whose tick was taken off no longer does) */
function stillPosted(pid: string): boolean {
  const on = sansPostedFrom(pid), today = effectiveToday()
  // any: the engine's person record is untyped (a verbatim port, src/engine/people.ts)
  return !!on && sansOnP((PEOPLE as any)[pid], on > today ? on : today)
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
    return { how: to > day ? 'later' : 'earlier', to }
  }
  return { how: on ? 'other' : 'undone' }
}
export function sansBackOwed(c: { collection: string; op: string; before?: unknown; after?: unknown }): SansBackOwed | null {
  if (c.collection !== 'lw.postouts') return null
  const b = loose(c.before)
  if (!b || b.gone || typeof b.to !== 'string' || !b.to || outcomeOf(b as { poOutcome?: unknown; poArchive?: boolean }) !== 'sans') return null
  const day = addDays(b.to, 1)
  const a = loose(c.op === 'delete' ? null : c.after)
  /* (a posting "date" that is no date moved nothing he could be told: the line would read "moved to .") */
  if (a && typeof a.to === 'string' && a.to && !ISO_DAY.test(a.to)) return null
  /* STILL POSTED OUT AS SANS ON THE SAME DATE, whatever else of the record changed: nothing to tell him, and "You're no
     longer posted out as SANS." would be untrue */
  if (a && !a.gone && a.to === b.to && outcomeOf(a as { poOutcome?: unknown; poArchive?: boolean }) === 'sans') return null
  /* A RUN POSTING: its AFTER image no longer that run — gone, or its run mark (`poDone`) no longer that date — the store
     clears it whenever the date or the outcome changes (state/store.ts setPostOut `same`), so a move and another outcome
     both read so. An archive by hand rewrites the record (outcome "overseas", the archive's own body) but keeps its run
     mark: it is no take-back of the posting and owes none; neither does a restore that leaves the run as it was. */
  if (b.poDone === day) return !!a && !a.gone && typeof a.to === 'string' && a.poDone === day ? null : { day, ...howOfAfter(a, day) }
  /* A POSTING NOT YET RUN (D2340): taken away, its date moved, or another outcome. */
  return { day, ...howOfAfter(a, day) }
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
   cache and the filed days from one pass over the records.
   ONLY WHERE A LINE CAN BE OWED (the four reads of 0eaacc411 — Fable's F5, the Opus read's Q3): a posting and a Quals tick
   change only in a command of the people module (Quals, Admin → Users, the posting sheets), so every other command takes
   an empty note. AND IN A RESTORE TOO (Fable's F2): an admin's Undo of a SANS tick he put on takes the man's SANS away,
   and owes the same line an untick does (sync.ts warNoticesReversed), judged against how things stood as it began. */
type Noted = { due: string[]; filed: string[]; base: string; at: number }
let BEFORE: { env: unknown; men: Map<string, Noted> } | null = null
let BEFORE_WIRED = false
/* HAS HE A SANS AVAILABILITY RECORD COVERING THIS DAY, shown or hidden (the bell's "hidden" sentence asks: state/notices.ts) */
function sansFiledOn(pid: string, iso: string): boolean {
  for (const r of sansAvailRecords()) {
    if (!(namedOf(r) as Array<{ p?: unknown }>).some(e => String(e.p) === pid)) continue
    const sp = inputSpanIso(r)
    if (sp && sp[0] <= iso && iso <= sp[1]) return true
  }
  return false
}
/** THE MARKS A COMMAND OWES (round 2 of the reads of f73602f9f — the security read's RR-SEC-1, the Opus read's R4): `put`, the
 *  row of each (man, day) its change of a day newly names him on — a SANS day of his from today, his own squadron's in
 *  view, nothing filed; `men`, those men; `gone`, the men it deletes, whose rows go with them. The one body the projection
 *  below writes from and the gate (state/perms.ts sansPlanViolation) judges by, asked at the same moment. Pure: it reads. */
export function sansPlanOwed(changes: ReadonlyArray<{ collection: string; id: string; op: string; before?: unknown; after?: unknown }>,
  today: string = effectiveToday()): { put: Set<string>; men: Set<string>; gone: Set<string>; today: string } {
  const put = new Set<string>(), men = new Set<string>(), gone = new Set<string>()
  for (const c of changes) {
    if (c.collection === 'people') {
      const b = loose(c.before), a = loose(c.op === 'delete' ? null : c.after)
      if (b && !b.deleted && (!a || a.deleted)) gone.add(String(c.id))
      continue
    }
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
      put.add(planKey(pid, iso)); men.add(pid)
    }
  }
  /* (a man the same command deletes takes his rows with him, none written) */
  for (const pid of gone) { men.delete(pid); for (const k of [...put]) if (k.startsWith(`${PLAN_PFX}${pid}:`)) put.delete(k) }
  return { put, men, gone, today }
}
/* the rows a command's owed marks take away: every row of a man it deletes, and his rows for days gone by of a man it marks
   (Fable's F6) — only rows that hold a mark */
function planDrops(o: { men: ReadonlySet<string>; gone: ReadonlySet<string>; today: string }): string[] {
  const out: string[] = []
  for (const pid of [...o.gone, ...o.men]) {
    const pre = `${PLAN_PFX}${pid}:`
    for (const k of store.keys(pre)) if ((o.gone.has(pid) || k.slice(pre.length) < o.today) && store.get(k, null) != null) out.push(k)
  }
  return out
}
/* WHICH COMMAND A PROJECTION OF THE MARKS ANSWERS (the gate's probe): a person's own command — every mark it owes; or the
   posting's own run (`lw.postoutRun`, the app's pass — round 2's Astra F4, the Opus read's R5): a man it deletes, with his
   rows, nothing else */
function planOwedBy(cause: CommitEnvelope | null | undefined): ReturnType<typeof sansPlanOwed> | null {
  if (!cause) return null
  if (cause.origin === 'user') return sansPlanOwed(cause.changes)
  if (cause.origin === 'projection' && cause.type === 'lw.postoutRun' && cause.actor?.role === 'system') {
    const o = sansPlanOwed(cause.changes)
    return { put: new Set(), men: new Set(), gone: o.gone, today: o.today }
  }
  return null
}
const PLAN_KEY = /^sansplan:([^:]+):(\d{4}-\d{2}-\d{2})$/
export function wireSansBackBefore(): void {
  if (BEFORE_WIRED) return
  BEFORE_WIRED = true
  setSansFiledProbe(sansFiledOn)
  /* THE MARKS THE COMMAND THAT CAUSED A PROJECTION OWES (the gate's sansPlanViolation asks): found by its `causedBy` in the
     one command stream, never by anything the projection says of itself */
  setSansPlanOwed(env => {
    if (env.causedBy == null) return null
    const s = commandStream()
    let cause: CommitEnvelope | null = null
    for (let i = s.length - 1; i >= 0; i--) if (s[i]!.seq === env.causedBy) { cause = s[i]!; break }
    return planOwedBy(cause)
  })
  /* THE "TAKEN BACK" OF THE LINE A STEP'S UNDO WROTE (the gate's SANS_UNDO_TOLD asks): only in the Redo the timeline is
     applying right now, of the same person's step, of a line that step's Undo wrote — taken away while he has not read it,
     or its one "taken back", word for word, while he has */
  setSansUndoTold((env: CommitEnvelope, c: Change) => {
    const a = applyingRestore(env)
    if (!a || a.dir !== 'redo' || (a.entry.actor.personId ?? null) !== (env.actor?.personId ?? null)) return false
    const told = UNDO_TOLD.get(a.entry)?.ids ?? []
    if (c.collection !== 'notices') return false
    if (c.op === 'delete') {
      const b = loose(c.before)
      return !!b && String(b.id) === String(c.id) && told.includes(String(b.id)) && !hasReadSaved(String(b.to), b as unknown as Notice)
    }
    const n = loose(c.after)
    const ref = n && Array.isArray(n.what) ? loose(n.what[0])?.ref : undefined
    if (!n || c.before != null || typeof ref !== 'string' || !told.includes(ref)) return false
    const was = NOTICES.find(x => x.id === ref)
    if (!was || !hasReadSaved(was.to, was)) return false
    /* (one "taken back" a line) */
    if (NOTICES.filter(y => {
      // any: a notice part is read by its kind
      const q: any = y.to === was.to ? (y.what || [])[0] : null
      return !!q && q.k === 'sansback' && q.back === true && q.ref === ref
    }).length !== 1) return false
    return n.to === was.to && n.name === was.name && n.day === was.day && n.iid === '' && deepEqual(n.what, [retractionOf(was)])
  })
  /* AN UNDO OR REDO OF A STEP THAT HOLDS A PLANNING MARK (the gate's sansPlanViolation asks): only the restore the undo is
     applying right now, of the same person's step, putting the row back exactly as the step recorded it */
  setSansPlanReplay((env, c) => {
    const a = applyingRestore(env)
    if (!a || (a.entry.actor.personId ?? null) !== (env.actor?.personId ?? null)) return false
    let w: (typeof a.changes)[number] | undefined
    for (const x of a.changes) if (x.collection === c.collection && String(x.id) === String(c.id)) w = x
    if (!w) return false
    /* (a row the step made is taken away by the settings store as a write of nothing — engine/hooks.ts store.set) */
    const after = (x: { op: string; after?: unknown }): unknown => (x.op === 'delete' ? null : x.after ?? null)
    return after(w) === after(c)
  })
  onPipelineBegin(env => {
    const men = new Map<string, Noted>()
    if (env.scope?.module !== 'people') { BEFORE = { env, men }; return }
    /* (nothing here may throw: the hook runs before the command's own roll-back path — round 2's Fable Q5 — so today is
       read inside the guard too) */
    try {
      const today = effectiveToday()
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
    BEFORE = { env, men }
  }, ['user', 'restore'])
  /* MARKING A DAY HE IS NEWLY PUT ON (reading 1, above): a person's change that names him on a day it did not name him on,
     a SANS day of his from today with nothing filed. Written by the app, after the change, never by the person, as part of
     the change's own step: its Undo takes the mark back to the older one and its Redo puts it back — neither is news (the
     stamp, above) — and a day that merely comes into view (a week loaded) is no change. The same step drops his marks for
     days gone by, and a man deleted takes his with him (Fable's F6): the reminder reads none of them. */
  onCommit(env => {
    /* (a person's own command, or the posting's own run deleting a man — never a restore: planOwedBy, above) */
    const o = planOwedBy(env)
    if (!o || (!o.put.size && !planDrops(o).length)) return
    // any: the settings door's scope is its own file's; a plain module name is what the command layer reads
    commitProjection({ type: 'sans.planned', scope: { module: 'settings' } as any, apply: txn => {
      txn.enlist(settingsStore)
      /* (worked out again as it runs — the moment the gate judges it, by the same body: a command queued before it may
         have changed what is owed) */
      const now = planOwedBy(env)
      if (!now) return
      for (const k of planDrops(now)) store.set(k, null)
      for (const k of now.put) { const m = PLAN_KEY.exec(k); if (m) store.set(k, nextStamp(m[1]!, m[2]!)) }
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
  if (p.back !== undefined || p.again !== undefined || p.ref !== undefined) return false
  /* (…and it says what changed, always: a fresh line with no `how` read in the older words, or not at all — Astra #2) */
  if (p.how !== o.how || p.to !== o.to) return false
  /* (…and it says it ended his SANS exactly where it did — the reminder's base counts only those: the Opus read's F1) */
  if (p.ended !== undefined && p.ended !== true) return false
  if (!!p.ended !== endedNow(o.who)) return false
  /* (a day it carries from an earlier line may be before this posting's date, and so may a reminder's day his own tick
     covered — W11-1: both are checked exactly, below) */
  const days = p.days, hid = p.hid === undefined ? [] : p.hid
  if (!isoRun(days, '') || !isoRun(hid, '')) return false
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
  /* (a tick taken off beside a posting that stands owes only the days the tick alone covered: sansTakeBack) */
  if (o.how === 'untick' && stillPosted(o.who) && (days.length > 0 || !hid.length)) return false
  if (!days.length) return true
  if (!sameDays(days, ent.due)) return false
  return dueRead(seen, o.who, ent.base, ent.due, ent.at)
}
