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
import { sansAvailOn, INPUTS, isSansAvail, namedOf, inputSpanIso } from '../engine/inputs'
import { homeUnitOf } from '../engine/roster'
import { getVersion as raptorVersion } from '../state/store'
import { effectiveToday } from '../state/person-delete'
import { NOTICES, noticeSansBack, type Notice } from '../state/notices'
import { hasRead, hasReadSaved, NOTICESEEN_PFX } from '../state/noticeseen'
import { onPipelineBegin, activeEnvelope } from '../command'
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
function sansFiledShown(pid: string, today: string): string[] {
  // any: the engine's person record is untyped (a verbatim port, src/engine/people.ts)
  const p: any = (PEOPLE as any)[pid]
  if (!p) return []
  const out = new Set<string>()
  // any: an input record is untyped (a verbatim port, src/engine/inputs.ts)
  for (const r of INPUTS as any[]) {
    if (!r || !isSansAvail(r.type) || !namedOf(r).some((e: { p?: unknown }) => String(e.p) === pid)) continue
    const sp = inputSpanIso(r)
    if (!sp) continue
    for (let d = sp[0] > today ? sp[0] : today, n = 0; d <= sp[1] && n < 400; d = addDays(d, 1), n++) if (sansOnP(p, d)) out.add(d)
  }
  return [...out].sort()
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
  /* the line is for a man with a SANS posting saved, from the moment it is saved — he can be filed for from then, for
     days from its date (D2340); a man ticked SANS by hand, with no posting, gets none (as built, his question open) */
  if (!p || p.special || p.deleted || p.archived) return []
  const from = sansPostedFrom(pid)
  if (!from) return []
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
  const from = sansPostedFrom(pid)!
  /* dated the posting's own midnight, as the posting's line is (sync.ts postedLinesOf) — a moment still to come while the
     posting waits for its date (D2340): the bell prints no age for it (state/notices.ts noticeAge), and "Mark all read"
     reads it by its id (state/noticeseen.ts) */
  const at = midnightOf(from)
  /* the id is steady, so his read record holds it — but once a posting's take-back has struck a line of his for this date
     (sansLineBack, below), the same posting made again is NEWS: the id carries how many such struck lines he holds for it,
     so it comes back unread — the posting line's own way (sync.ts postedLinesOf, [NOTICE-UNDO-RETRACT]) */
  const backs = NOTICES.filter(n => n.to === pid && n.day === from && (n.what || [])[0]?.k === 'sansback').length
  return [{ id: `sansdue:${pid}:${from}${backs ? `:${backs}` : ''}`, to: pid, by: null, at, iid: '', name: 'Your SANS availability', day: days[0]!, what: [{ k: 'sansdue', days, from }] }]
}

/* ---- TAKEN BACK WITH ITS POSTING (his D1693, D1699, D1710 — every bell line is taken back by the undo of what made it;
   the "off the manpower" line, also worked out, the same — D1696) ----
   The posting's own take-back gathers this line with its others (sync.ts postingLinesOf) and hands each to
   retractPostingLines, which asks here first: the live line is worked out, so with its posting changed nothing makes it
   any more and it simply goes — `sansLineBack` only says it was this kind, so the posting's own steps skip it. What he is
   TOLD is written once the posting has changed, by `sansTakeBack` (sync.ts takeBack): one stored line to him, unread, by
   the admin who did it — never to that admin himself — carrying
   · what his live line said, struck through, then "taken back · <who>" — where he had READ it (D1699); an unread line
     simply goes, as before;
   · and what the change HID (owner D2341, 23 Nov 26): his SANS availability filed for days that are no longer SANS days
     of his, today on — "Your SANS availability for Sat 18 Jul is hidden while you're not SANS that day." — whether or not
     he had a live line at all, so a hiding is never silent (nothing is deleted: engine/inputs.ts sansShownOn).
   Neither: no line. Filing, or a day leaving, is no take-back: the live line only shrinks or goes. */
export function sansLineBack(n: Notice): boolean {
  // any: a notice part is read by its kind, the fields differing by kind (state/notices.ts)
  const p: any = (n.what || [])[0]
  return !!p && p.k === 'sansdue'
}
const midnightOf = (iso: string): number => new Date(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)).getTime()
/* the id his live line had for the posting of `from`, as it stood before this command put any struck line of its own —
   the struck lines he held for that date counted (sansUnfiledLines); `skip`: the ids this command newly put */
function liveIdBefore(pid: string, from: string, skip: ReadonlySet<string> = new Set()): string {
  const backs = NOTICES.filter(x => x.to === pid && x.day === from && (x.what || [])[0]?.k === 'sansback' && !skip.has(String(x.id))).length
  return `sansdue:${pid}:${from}${backs ? `:${backs}` : ''}`
}
/** THE ONE LINE A TAKE-BACK OWES HIM (sync.ts takeBack, inside the posting's own command, after the posting has changed):
 *  `from` — his SANS posting's first day as it stood before the change; `by` — who changed it. */
export function sansTakeBack(pid: string, from: string, by: string | null, at: number): void {
  if (pid === by) return                                 // (he changed it himself: nothing to tell him)
  const ent = BEFORE && BEFORE.env != null && BEFORE.env === activeEnvelope() ? BEFORE.men.get(pid) : undefined
  if (!ent) return
  const struck = ent.due.length && hasRead(pid, { id: liveIdBefore(pid, from), at: midnightOf(from) }) ? ent.due : []
  const hid = hiddenNow(pid, ent.filed)
  if (struck.length || hid.length) noticeSansBack(pid, by, struck, from, at, hid)
}
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
export function sansBackOwed(c: { collection: string; op: string; before?: unknown; after?: unknown }): string | null {
  if (c.collection !== 'lw.postouts') return null
  const b = loose(c.before)
  if (!b || b.gone || typeof b.to !== 'string' || !b.to || outcomeOf(b as { poOutcome?: unknown; poArchive?: boolean }) !== 'sans') return null
  const day = addDays(b.to, 1)
  const a = loose(c.op === 'delete' ? null : c.after)
  /* A RUN POSTING: its AFTER image no longer that run — gone, or its run mark (`poDone`) no longer that date — the store
     clears it whenever the date or the outcome changes (state/store.ts setPostOut `same`), so a move and another outcome
     both read so. An archive by hand rewrites the record (outcome "overseas", the archive's own body) but keeps its run
     mark: it is no take-back of the posting and owes none; neither does a restore that leaves the run as it was. */
  if (b.poDone === day) return !!a && !a.gone && typeof a.to === 'string' && a.poDone === day ? null : day
  /* A POSTING NOT YET RUN (D2340): taken away, its date moved, or another outcome. Its run on its own date keeps it. */
  const kept = !!a && !a.gone && a.to === b.to && outcomeOf(a as { poOutcome?: unknown; poArchive?: boolean }) === 'sans'
  return kept ? null : day
}
/* HIS LIVE LINE'S DAYS AND HIS FILED DAYS AS THEY STOOD WHEN THE COMMAND BEGAN (chat 147's re-reads — Astra's R1, the
   security reader's SEC2-1; D2341): the struck line keeps what his line SAID (D1693, D1699, D1710), and what was hidden is
   what showed before and does not now — and the gate runs after the posting has changed, when neither can be asked of
   the world any more. So at the start of every person's command, before its body runs, each man with a SANS posting
   saved has noted here his live line's days (sansUnfiledDays — what postingLinesOf hands the writer at the same moment)
   and his filed days as they show (sansFiledShown), with the command they belong to; the writer and the gate both read
   these, and the gate compares exactly. A command they were not noted for (no person's, or a later one) has none and
   owes no line. Only the men a SANS posting names are asked — a handful — the live days from the day's cache. */
let BEFORE: { env: unknown; men: Map<string, { due: string[]; filed: string[] }> } | null = null
let BEFORE_WIRED = false
export function wireSansBackBefore(): void {
  if (BEFORE_WIRED) return
  BEFORE_WIRED = true
  onPipelineBegin(() => {
    const men = new Map<string, { due: string[]; filed: string[] }>()
    const today = effectiveToday()
    try {
      for (const pid of Object.keys(getState().postOuts)) if (sansPostedFrom(pid)) men.set(pid, { due: [...sansUnfiledDays(pid)], filed: sansFiledShown(pid, today) })
    } catch { /* no war loaded: no line to note */ }
    BEFORE = { env: activeEnvelope(), men }
  })
}
const sameDays = (a: readonly unknown[], b: readonly string[]): boolean => a.length === b.length && a.every((d, i) => d === b[i])
/* WHAT THE PERMISSIONS CHECK ASKS OF SUCH A LINE (state/perms.ts, through sync.ts warLineCovered): owed only by that
   take-back (above), to the man himself, on its date; its two lists (`days`, struck; `hid`, hidden) each a list of
   distinct ISO dates in order, each on or after that date, at least one of them not empty; `days` — if any — EXACTLY the
   days his live line named when the command began (BEFORE, above), and only where he had READ that line by his read
   record AS SAVED, never this device's copy in memory (the security re-read's SEC2-2): the record as it stood before this
   command where the command changes it (its before-image), else the stored row (state/noticeseen.ts hasReadSaved), its
   id as it stood before this command, counting the struck lines he held then; `hid` EXACTLY his filed days that showed
   when the command began and do not now (D2341) — a day made up, or one left out, is refused. One a man and posting a
   command is the gate's own count (state/perms.ts `sansBacks`). */
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/
const isoRun = (x: unknown, from: string): x is string[] => Array.isArray(x)
  && x.every((d, i) => typeof d === 'string' && ISO_DAY.test(d) && d >= from && (i === 0 || d > (x[i - 1] as string)))
export function sansBackCovered(o: { who: string; day: string; o: string }, n: { id?: unknown; to?: unknown; name?: unknown; day?: unknown; what?: unknown },
  changes: ReadonlyArray<{ collection: string; id: string; op: string; before?: unknown }> = []): boolean {
  if (o.o !== 'sans' || String(n.to) !== o.who || n.day !== o.day || n.name !== 'Your SANS availability') return false
  const p = Array.isArray(n.what) ? loose(n.what[0]) : null
  if (!p) return false
  const days = p.days, hid = p.hid === undefined ? [] : p.hid
  if (!isoRun(days, o.day) || !isoRun(hid, o.day) || (!days.length && !hid.length)) return false
  const ent = BEFORE && BEFORE.env != null && BEFORE.env === activeEnvelope() ? BEFORE.men.get(o.who) : undefined
  if (!ent) return false
  if (!sameDays(hid, hiddenNow(o.who, ent.filed))) return false
  if (!days.length) return true
  if (!sameDays(days, ent.due)) return false
  /* the struck lines he held before this command: every stored one of his for this date but those it newly puts */
  const putNow = new Set(changes.filter(c => c.collection === 'notices' && c.op === 'put' && c.before == null).map(c => String(c.id)))
  const rec = changes.find(c => c.collection === 'settings' && c.id === NOTICESEEN_PFX + o.who)
  return hasReadSaved(o.who, { id: liveIdBefore(o.who, o.day, putNow), at: midnightOf(o.day) }, rec ? { before: rec.before ?? null } : undefined)
}
