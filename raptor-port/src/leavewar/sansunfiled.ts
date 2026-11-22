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
   the posting if it is taken back or his SANS is taken off. Its id is steady (the man and the posting's date), so once read
   it stays read while its days change.

   A NEW FILE, NOT sync.ts (the night of 22–23 Nov 26: another chat's work was changing sync.ts heavily) — the war's half
   is read only here, through its own store; the one line in sync.ts is the bell's list gaining this one. */
import { PEOPLE, sansOnP } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { UNIT } from '../engine/unitview'
import { stashKeys, stashDays } from '../engine/weekstash'
import { dayIso } from '../engine/verid'
import { dayEngaged } from '../engine/avail'
import { sansAvailOn } from '../engine/inputs'
import { homeUnitOf } from '../engine/roster'
import { getVersion as raptorVersion } from '../state/store'
import { effectiveToday } from '../state/person-delete'
import { NOTICES, noticeSansBack, type Notice } from '../state/notices'
import { hasRead, hasReadSaved, NOTICESEEN_PFX } from '../state/noticeseen'
import { onPipelineBegin, activeEnvelope } from '../command'
import { getState } from './state/store'
import { addDays, outcomeOf } from './engine'

/* the first day of HIS SANS posting that has RUN, or null (sync.ts savedSansRun's test — a posting taken back, gone or of
   another outcome is no longer his SANS posting) */
function sansRunFrom(pid: string): string | null {
  let w: ReturnType<typeof getState>['postOuts'][string] | undefined
  try { w = getState().postOuts[pid] } catch { return null }
  return w && !w.gone && outcomeOf(w) === 'sans' && w.to !== null && w.poDone === addDays(w.to, 1) ? addDays(w.to, 1) : null
}

/* The days, first first. Worked out once a change of the app (the store's version, the war's state, the date), never once
   a reading: the bell asks for it on every draw, and only the one man it concerns gets past the first questions. */
let CACHE_VER = -1, CACHE_LW: unknown = null, CACHE_DAY = ''
const CACHE = new Map<string, string[]>()
export function sansUnfiledDays(pid: string): string[] {
  const today = effectiveToday()
  let lw: unknown = null
  try { lw = getState() } catch { lw = null }
  const ver = raptorVersion()
  if (ver !== CACHE_VER || lw !== CACHE_LW || today !== CACHE_DAY) { CACHE.clear(); CACHE_VER = ver; CACHE_LW = lw; CACHE_DAY = today }
  const hit = CACHE.get(pid)
  if (hit) return hit
  const out = unfiledNow(pid, today)
  CACHE.set(pid, out)
  return out
}
function unfiledNow(pid: string, today: string): string[] {
  // any: the engine's person record is untyped (a verbatim port, src/engine/people.ts)
  const p: any = (PEOPLE as any)[pid]
  /* he can be filed for only while SANS today (D2327), and the line is for a man his SANS posting made SANS */
  if (!p || p.special || p.deleted || p.archived || !p.san) return []
  const from = sansRunFrom(pid)
  if (!from || from > today) return []
  /* the days of his OWN squadron's schedule — the inputs read are the schedule in view's (engine/inputs.ts inputsOn), so a
     squadron in view other than his own answers nothing rather than something wrong */
  if (homeUnitOf(pid, today) !== UNIT) return []
  const start = from > today ? from : today
  const days: string[] = []
  // any: a day of the engine's week is untyped (a verbatim port, src/engine/data.ts)
  const look = (wk: string, list: any[] | null | undefined) => {
    // any: the same engine day
    (list || []).forEach((d: any, di: number) => {
      if (!d) return
      const iso = dayIso(wk, di)
      if (iso < start || !sansOnP(p, iso)) return
      if (!dayEngaged(d).has(pid) || sansAvailOn(pid, d.dt)) return
      days.push(iso)
    })
  }
  // any: the engine's loaded week is untyped (a verbatim port)
  look(String(CURWEEK), DAYS as any[])
  for (const k of stashKeys()) {
    if (k === String(CURWEEK)) continue
    /* (a saved week that cannot be read holds nothing to name — stashDays answers null) */
    look(k, stashDays(k)?.days)
  }
  return [...new Set(days)].sort()
}

/** HIS BELL'S LINE (state/notices.ts setDerivedNotices, through leavewar/sync.ts): one, or none */
export function sansUnfiledLines(pid: string): Notice[] {
  const days = sansUnfiledDays(pid)
  if (!days.length) return []
  const from = sansRunFrom(pid)!
  /* dated the posting's own midnight, as the posting's line is (sync.ts postedLinesOf) */
  const at = new Date(+from.slice(0, 4), +from.slice(5, 7) - 1, +from.slice(8, 10)).getTime()
  /* the id is steady, so his read record holds it — but once a posting's take-back has struck a line of his for this date
     (sansLineBack, below), the same posting made again is NEWS: the id carries how many such struck lines he holds for it,
     so it comes back unread — the posting line's own way (sync.ts postedLinesOf, [NOTICE-UNDO-RETRACT]) */
  const backs = NOTICES.filter(n => n.to === pid && n.day === from && (n.what || [])[0]?.k === 'sansback').length
  return [{ id: `sansdue:${pid}:${from}${backs ? `:${backs}` : ''}`, to: pid, by: null, at, iid: '', name: 'Your SANS availability', day: days[0]!, what: [{ k: 'sansdue', days, from }] }]
}

/* ---- TAKEN BACK WITH ITS POSTING (his D1693, D1699, D1710 — every bell line is taken back by the undo of what made it;
   the "off the manpower" line, also worked out, the same — D1696) ----
   The posting's own take-back gathers this line with its others (sync.ts postingLinesOf) and hands each to
   retractPostingLines, which asks here first: an unread line simply goes (it is worked out — the posting gone, nothing
   makes it); a READ one gets a stored line saying what it said, struck through, then "taken back · <who>", unread, by the
   admin who pressed it — never to him (state/notices.ts noticeSansBack). Filing, or a day leaving, is no take-back: the
   line only shrinks or goes. True when the line was this kind (handled), so the posting's own steps skip it. */
export function sansLineBack(n: Notice, by: string | null, at: number): boolean {
  // any: a notice part is read by its kind, the fields differing by kind (state/notices.ts)
  const p: any = (n.what || [])[0]
  if (!p || p.k !== 'sansdue') return false
  if (n.to !== by && hasRead(n.to, n)) noticeSansBack(n.to, by, Array.isArray(p.days) ? p.days : [], String(p.from || n.day), at)
  return true
}
/* WHICH CHANGE OWES SUCH A LINE (state/perms.ts, through sync.ts warLinesOwed — chat 147's two code reads: every image of
   any change of a posting record owed one, so an admin's command that MADE a first SANS posting wrote a "taken back" of
   made-up days). Only a real take-back: his record's BEFORE image is a SANS posting that has RUN (poDone its date — the
   only posting whose line his bell can have shown, sansRunFrom), and the AFTER image takes it away (Undo post out), moves
   its date or gives it another outcome (D1710 — postOut). Its day is the before image's date. A new posting, one not yet
   run, or a change that keeps the run SANS posting as it was (an archive or a restore leaving it) owes none. Pure. */
type LooseRec = Record<string, unknown>
const loose = (x: unknown): LooseRec | null => (x && typeof x === 'object' && !Array.isArray(x) ? (x as LooseRec) : null)
export function sansBackOwed(c: { collection: string; op: string; before?: unknown; after?: unknown }): string | null {
  if (c.collection !== 'lw.postouts') return null
  const b = loose(c.before)
  if (!b || b.gone || typeof b.to !== 'string' || !b.to || outcomeOf(b as { poOutcome?: unknown; poArchive?: boolean }) !== 'sans') return null
  const day = addDays(b.to, 1)
  if (b.poDone !== day) return null
  /* …and the AFTER image no longer that run: gone, or its run mark (`poDone`) no longer that date — the store clears it
     whenever the date or the outcome changes (state/store.ts setPostOut), so a move and another outcome both read so. An
     archive by hand rewrites the record (outcome "overseas", the archive's own body) but keeps its run mark: it is no
     take-back of the posting and owes none; neither does a restore that leaves the run as it was */
  const a = loose(c.op === 'delete' ? null : c.after)
  const kept = !!a && !a.gone && typeof a.to === 'string' && a.poDone === day
  return kept ? null : day
}
/* HIS LIVE LINE'S DAYS AS THEY STOOD WHEN THE COMMAND BEGAN (chat 147's re-reads — Astra's R1, the security reader's
   SEC2-1): the struck line keeps what his line SAID (D1693, D1699, D1710), and the gate runs after the posting has
   changed, when the line no longer exists to ask — so a list of well-formed later days, made up, passed. So at the start
   of every person's command, before its body runs, the days of each man whose SANS posting has run are noted here
   (sansUnfiledDays — what postingLinesOf hands the writer at the same moment), with the command they belong to; the gate
   compares the struck days with them, exactly. A command they were not noted for (no person's, or a later one) has no
   such days and owes no struck line. Only the men a run SANS posting makes SANS are asked (sansRunFrom), from the day's
   cache — the bell asks the same on every draw. */
let BEFORE: { env: unknown; days: Map<string, string[]> } | null = null
let BEFORE_WIRED = false
export function wireSansBackBefore(): void {
  if (BEFORE_WIRED) return
  BEFORE_WIRED = true
  onPipelineBegin(() => {
    const days = new Map<string, string[]>()
    try {
      for (const pid of Object.keys(getState().postOuts)) if (sansRunFrom(pid)) days.set(pid, [...sansUnfiledDays(pid)])
    } catch { /* no war loaded: no line to note */ }
    BEFORE = { env: activeEnvelope(), days }
  })
}
const sameDays = (a: readonly unknown[], b: readonly string[]): boolean => a.length === b.length && a.every((d, i) => d === b[i])
/* WHAT THE PERMISSIONS CHECK ASKS OF SUCH A LINE (state/perms.ts, through sync.ts warLineCovered): owed only by that
   take-back (above), to the man himself, on its date; its days a non-empty list of distinct ISO dates in order, each on
   or after that date, and EXACTLY the days his live line named when the command began (BEFORE, above); and only where he
   had READ the live line by his read record AS SAVED, never this device's copy in memory (the security re-read's SEC2-2):
   the record as it stood before this command where the command changes it (its before-image), else the stored row
   (state/noticeseen.ts hasReadSaved). Its id as it stood before this command, counting the struck lines he held then
   (sansUnfiledLines). One a man and posting a command is the gate's own count (state/perms.ts `sansBacks`). */
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/
export function sansBackCovered(o: { who: string; day: string; o: string }, n: { id?: unknown; to?: unknown; name?: unknown; day?: unknown; what?: unknown },
  changes: ReadonlyArray<{ collection: string; id: string; op: string; before?: unknown }> = []): boolean {
  if (o.o !== 'sans' || String(n.to) !== o.who || n.day !== o.day || n.name !== 'Your SANS availability') return false
  const p = Array.isArray(n.what) ? loose(n.what[0]) : null
  const days = p ? p.days : null
  if (!Array.isArray(days) || !days.length) return false
  for (let i = 0; i < days.length; i++) {
    const d = days[i]
    if (typeof d !== 'string' || !ISO_DAY.test(d) || d < o.day || (i > 0 && d <= (days[i - 1] as string))) return false
  }
  const said = BEFORE && BEFORE.env != null && BEFORE.env === activeEnvelope() ? BEFORE.days.get(o.who) : undefined
  if (!said || !sameDays(days, said)) return false
  /* the struck lines he held before this command: every stored one of his for this date but those it newly puts */
  const putNow = new Set(changes.filter(c => c.collection === 'notices' && c.op === 'put' && c.before == null).map(c => String(c.id)))
  const backs = NOTICES.filter(x => x.to === o.who && x.day === o.day && (x.what || [])[0]?.k === 'sansback' && !putNow.has(String(x.id))).length
  const at = new Date(+o.day.slice(0, 4), +o.day.slice(5, 7) - 1, +o.day.slice(8, 10)).getTime()
  const rec = changes.find(c => c.collection === 'settings' && c.id === NOTICESEEN_PFX + o.who)
  return hasReadSaved(o.who, { id: `sansdue:${o.who}:${o.day}${backs ? `:${backs}` : ''}`, at }, rec ? { before: rec.before ?? null } : undefined)
}
