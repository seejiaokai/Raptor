/* HIS SANS DAYS WITH NOTHING FILED — THE LINE HIS OWN BELL WORKS OUT (owner D2338, 22 Nov 26 — "Should we tell the user
   too": yes; "on that date his bell tells him the planned days with nothing filed, a tap opening the SANS calendar"; built
   without a drawing first on his D2339).

   A man posted out as SANS from a date ahead can be named on our programme for days past that date before it comes (D2329).
   Since D2340 he may be filed for from the moment the posting is saved, and his bell lists from then the days he is planned
   with us and has filed nothing for, a tap opening the SANS calendar on the first of them (ui/topstate.ts openNotice).

   THE AGENT'S READINGS, TOLD TO HIM (D2338's row): the man himself only, never an admin's bell; not before the posting's
   date (since D2340, from the moment it is saved — below); one line naming the days. And the build's (his to change): the days are those from the posting's date on, today
   on — a day gone by is no longer one to file — of the weeks the app holds (the week loaded and the saved weeks of his own
   squadron); the line is worked out from the schedule as it stands, never stored — the "off the manpower" line's way
   (leavewar/sync.ts postedLines, D1690, D1696) — so it shrinks as he files and goes once every day is filed, and goes with
   the posting if it is taken back or his SANS is taken off. Since his D2394 (23 Nov 26) it reaches every SANS man planned
   with nothing filed, however he became SANS (2b), and its id names its days, so once read it stays read while days only
   drop off, or a day he saw comes back, and lights his bell again only for a day not in it when he read it (2a as his
   D2560 of 24 Nov 26 narrowed it — readOf, below).
   "PLANNED" IS HIS RULING NOW, NOT A READING (his D2564, 24 Nov 26): a day is in the line only where he is in a flying
   seat or a sim (OFT, AMT) with nothing filed — the only things SANS availability covers, the same the checks and an
   armed seat ask it of (engine/avail.ts daySansSeats). The first build read it as "named anywhere on that day's
   programme" (dayEngaged) and said so only here, marked "his to change" and never put to him: a ground programme row, a
   duty desk or all hands put a day in his reminder that he could file nothing for (docs/bug-check-order.md §7.11,
   lesson 32).

   A NEW FILE, NOT sync.ts (the night of 22–23 Nov 26: another chat's work was changing sync.ts heavily) — the war's half
   is read only here, through its own store; the one line in sync.ts is the bell's list gaining this one. */
import { PEOPLE, sansFiler, sansOnP } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { UNIT } from '../engine/unitview'
import { stashKeys, stashDays, stashGet } from '../engine/weekstash'
import { dayIso } from '../engine/verid'
import { daySansSeats } from '../engine/avail'
import { weekDatesAbs } from '../engine/weeks-data'
import { sansAvailOn, INPUTS, isSansAvail, namedOf, inputSpanIso } from '../engine/inputs'
import { homeUnitOf, rosterOf } from '../engine/roster'
import { getVersion as raptorVersion } from '../state/store'
import { effectiveToday } from '../state/person-delete'
import { NOTICES, noticeSansBack, setSansFiledProbe, sansRetracted, type Notice, type SansBackHow } from '../state/notices'
import { seenOf, seenSavedOf, hasReadSaved, reminderDays, NOTICESEEN_PFX } from '../state/noticeseen'
import { me } from '../state/perms'
import { setSansTickWatch } from '../state/quals-write'
import { schedStore, resyncBeforeEnlist, schedApplyEnd } from '../state/sched-commit'
import { onPipelineBegin, activeEnvelope, type Txn } from '../command'
import type { Change, CommitEnvelope } from '../command/types'
import { deepEqual } from '../command/util'
import { deletedSig } from '../engine/overlay'
import { applyingRestore } from '../undo/timeline'
import { setSansUndoTold } from '../state/perms'
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
  // any: as above — the records are untyped
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
   the loaded week's rows, the week on screen and the squadron in view.
   …AND EACH MAN'S HOME SQUADRON BY DATE (round 3 — Astra's F2): which squadron's week a request lands on is its first
   named man's home on its first day (engine/overlay.ts landingRequests → engine/inputs.ts inputOnDay), so a man moved
   to 149 from a date takes his Meeting past that date off 142's saved weeks — and with every other part of the key
   unchanged his reminder went on naming the day. The requests, the men deleted, the loaded rows and the homes are one
   signature the overlay keeps (landingSig), so a reading it grows is in this key by itself.
   …BUT NOT A PLAIN ROW OF THE WEEK ON SCREEN (round 3 — the Opus read's O3-2, measured: about 150 ms over 40 held weeks
   for one briefing row added): only a row a request landed tells a held week anything, so the loaded rows' part names
   only those (engine/overlay.ts loadedSrcSig).
   …AND SINCE HIS D2564 (24 Nov 26, round 5 — Astra's round-4 F1, measured: 14,440 week reads, about 150 ms, for one change
   of the week on screen over 40 held weeks) NONE OF THE REQUESTS' PARTS, NOR THE WEEK ON SCREEN: the reminder now asks
   only who is in a flying seat or a sim (daySansSeats), and nothing the reading works out on the way puts a man in one or
   takes him out — a request lands, moves or leaves a GROUND row only (engine/overlay.ts reconcileRequestRows,
   landRequests → placeRequestRow), and a man's home squadron only decides whose week that row lands on. The one thing
   worked out on read that does reach a seat is a deleted man taken off from his cutoff (overlayDeletedWeek), so the men
   deleted stay in the key, with the squadron in view. The week on screen reached the reading only through each day's
   LABEL, written under the year on screen ("Dec 28", or "Dec 28 2026" from a 2027 week) and read back to ask what he
   filed; a held day is now asked by a label that always carries its year (engine/weeks-data.ts weekDatesAbs), which
   reads the same from any week. So a change of week, a request filed or deleted, a home changed: no held week is read
   again (leavewar/sans-planned-r5.test.ts counts the reads and holds each answer to a fresh one). */
// any: a day of the engine's week is untyped (a verbatim port, src/engine/data.ts)
type Held = { blob: string | null; sig: string; days: any[]; named: Map<number, ReturnType<typeof daySansSeats>> }
const HELD = new Map<string, Held>()
// any: the same engine day
let WEEKS: Array<[string, any[], Held['named'], string[] | null]> | null = null
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
/* (each entry: the week, its days, who each day seats — kept — and, for a saved week, its days' labels with their year;
   null for the week on screen, whose days carry their own) */
function weeksHeld(today: string): Array<[string, any[], Held['named'], string[] | null]> {
  if (WEEKS) return WEEKS
  const cur = String(CURWEEK)
  // any: the engine's loaded week is untyped (a verbatim port)
  const out: Array<[string, any[], Held['named'], string[] | null]> = [[cur, (DAYS as any[]) || [], new Map(), null]]
  const keep = new Set<string>()
  let sig: string | null = null
  for (const k of stashKeys()) {
    if (k === cur || dayIso(k, 6) < today) continue
    keep.add(k)
    const blob = stashGet(k)
    /* (worked out once a change, and only where a week ahead is held) */
    sig ??= `${deletedSig()}|${UNIT}`
    let h = HELD.get(k)
    /* (a saved week that cannot be read holds nothing to name — stashDays answers null) */
    if (!h || h.blob !== blob || h.sig !== sig) HELD.set(k, h = { blob, sig, days: stashDays(k)?.days || [], named: new Map() })
    out.push([k, h.days, h.named, weekDatesAbs(k)])
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
  for (const [wk, list, namedBy, labels] of weeksHeld(today)) {
    // any: the same engine day
    list.forEach((d: any, di: number) => {
      if (!d) return
      const iso = dayIso(wk, di)
      if (iso < today || !sansOnP(p, iso)) return
      /* PLANNED = IN A FLYING SEAT OR A SIM (his D2564, 24 Nov 26): the only things SANS availability is filed for, and
         what the checks and an armed seat ask it of — never a ground programme row, a duty desk or all hands, which the
         first build counted by reading every row he was busy on (engine/avail.ts daySansSeats, and why) */
      let named = namedBy.get(di)
      if (!named) namedBy.set(di, named = daySansSeats(d))
      if (!named.has(pid) || sansAvailOn(pid, labels ? labels[di] : d.dt)) return
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
   by itself (D2560: only a day not in the reminder when he read it lights it again — a move that brings in such a day
   does, by that day), nor is the date arriving, when the title changes (reading 5).
   ONLY A LINE THAT ENDED IT (the four reads of 0eaacc411 — the Opus read's F1): a posting undone, or a tick taken off, that leaves him SANS by the other cause ended nothing, and a reminder he had
   read came back unread with nothing newly planned. So the writer marks a line `ended` only where, after the change, he has
   no SANS day from today (endedNow, below — the gate checks it), and only those count; a Redo's copy is not another. */
/* …nor one a "taken back" names (round 2's Astra F1): an Undo's line its Redo retracted ended nothing that still stands */
/* …UNLESS ITS REDO HAS PUT IT BACK (round 3 — the Opus read's O3-1): an untick's own line is named by a "taken back" when
   its Undo runs, and that "taken back" stays on his bell when the Redo tells the line "again" — so the untick, back and in
   force, counted for nothing, and a later tick brought his reminder back already read. The last word on a line decides
   (state/notices.ts sansRetracted — the one body the bell reads too). */
function dueBase(pid: string): string {
  const ended = NOTICES.filter(x => {
    const p = x.to === pid ? backPart(x) : null
    return !!p && p.ended === true && !p.again && !sansRetracted(x)
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
/* WHICH DAYS HE HAS SEEN (his D2560, 24 Nov 26 — "1 simpler"; it narrows D2394 2a): after he has read his reminder, it
   lights his bell again ONLY for a day not in it when he read it. A day he already saw, taken off and put back, does not
   relight it — the line still lists the day until he files. So the one thing kept is what he read: the reminder's id
   names the days it held, and his own read record keeps the ids he read (state/noticeseen.ts — never dropped, folded to
   one a reminder). Nothing else is stored, and nothing anyone else writes can light his bell: his read record is his
   alone, whoever runs the command — the app's own projection and an admin's command included, both of which wrote it
   until round 4's security read (SEC-R4-1; state/perms.ts ownershipChecks, the `noticeseen:` block).
   THE HIDDEN "PLANNED AT" MARK IS GONE, WITH ITS PERMISSION CHECKS (the same ruling): each day he was newly put on used
   to carry a stamp, `settings/sansplan:<pid>:<iso>`, written by a projection the gate had to vouch for — where three
   rounds of blind reads found faults, round 3's among them (Astra F1: a member lit another man's reminder by naming a
   finished planning as his projection's cause; the security read's SEC-R3-1 and SEC-R3-2: one man's read record, or the
   planner's own page, froze the stamp so nobody was told again). A row of it left in a store from before is read by
   nothing (demo data, D56). */
/* THE DAYS HE HAS READ OF THIS REMINDER — every day any id of this base in his record names; null when he has read none
   of it */
function readOf(ids: readonly string[], base: string): Set<string> | null {
  const pre = `${base}~`
  let out: Set<string> | null = null
  for (const id of ids) {
    if (!id.startsWith(pre)) continue
    out ??= new Set()
    for (const d of reminderDays(id)) out.add(d)
  }
  return out
}
/* THE ID OF THE LINE AS IT STANDS: the days it names — what his read record keeps once he reads it */
const dueToken = (base: string, days: readonly string[]): string => `${base}~${days.join(',')}`
/* IS THE REMINDER STANDING NOW ONE HE HAS READ (his D2391; the coordinator's reading 2, for him to confirm): a day it names now
   is one he read. A reminder that went earlier gives no title later, even with the same day planned again. */
function dueRead(s: { upto: number; ids: readonly string[] }, base: string, days: readonly string[], at: number): boolean {
  if (at <= s.upto) return true
  const read = readOf(s.ids, base)
  return !!read && days.some(d => read.has(d))
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
  /* (lit again only by a day he has not seen in it — D2560: never by a day dropping off, nor by one he saw coming back,
     whatever took it off and put it back: a planning undone, a filing deleted. Read, it keeps the id he read) */
  const lit = !read || days.some(d => !read.has(d))
  const id = (!lit && ids.find(x => x.startsWith(`${base}~`))) || dueToken(base, days)
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
  const read = !stands && ent.due.length ? dueRead(seen, ent.base, ent.due, ent.at) : false
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
    if (n && !sansRetracted(n)) out.push(n)
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
export function wireSansBackBefore(): void {
  if (BEFORE_WIRED) return
  BEFORE_WIRED = true
  setSansFiledProbe(sansFiledOn)
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
  return dueRead(seen, ent.base, ent.due, ent.at)
}
