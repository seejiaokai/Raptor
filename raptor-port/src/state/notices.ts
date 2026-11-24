/* THE BELL'S NOTICES — "someone changed an input you are in" ([ALL-AVAIL-AS-MEMBER] step 7, 12 Oct 26 —
   `[INPUT-CHANGED-TELL]`; the plan docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.10).

   Owner, D755 (3): "the member is told by his bell when the scheduler adds people to his request, swaps him out or
   changes it". D760: a CX on an input's row cancels the input — "the member is told by his bell". D769 (his look at
   the pictures): the list's SHORTER wording — the input first, in bold, with its date; then what happened and who; its
   age at the right.

   ONE SAVED RECORD A PERSON TOLD: `notices/<id>` = { id, to, by, at, iid, name, day, what } —
     to     the person told (a PEOPLE id);
     by     who made the change (a PEOPLE id), or null where the APP did — a posting on its date, a delete (R12: the
            others in the input are told in plain words, with no name);
     at     when, ms;
     iid    the input, so a tap opens it;
     name   what the input was CALLED when it changed (its title, else its kind) and
     day    its first day then (yyyy-mm-dd) — the line's bold words; kept on the notice because the input may since have
            been renamed, moved or deleted, and the line must still say what it was about;
     what   what happened, as DATA (a list of parts, the one that touches him first) — never a sentence, so the words can
            change without rewriting a stored record, and a renamed person reads by his callsign of today.

   WRITTEN INSIDE THE COMMAND THAT MADE THE CHANGE — `noticePass`, called by the scheduler store's one shared end
   (state/sched-commit.ts applyEnd) with every input as it stood before the command and as it stands now. So a notice is
   part of the same step: the maker's Undo takes it away with his change, and nobody is told "it was undone" (R11).
   It is worked out from the two images, never raised by a door — so no door, today's or tomorrow's, can change an input
   and tell nobody (the reason the row has a belt as well as a door: the plan §4.4).

   WHO IS TOLD: every NAMED person in the input before or after the change, and whoever filed it — never whoever made the
   change, never the men behind ALL AVAIL / ALL (D757), never a man who has left the squadron.

   A NOTICE IS NEVER REWRITTEN ONCE MADE (Fable F9; D148). What a person has READ is his own record
   (state/noticeseen.ts): were reading to write to the notice, the maker's Undo of his change would be refused —
   "Ranger changed this after your action" — by the read of the very person it told. */
import { PEOPLE, sansOnP } from '../engine/people'
import { odOut, isOD, dateOrd, inpLabel, isUnavail, namedOf, placeholderOf, remarksTyped, tillTurned, inputSpanIso, inputSquadrons } from '../engine/inputs'
import { homeHandle } from '../engine/roster'
import { hhmm } from '../engine/time'
import { mayEditSched } from './perms'
import { todayIso, homeOn, homeChangesOn, unitRows, levelOfAccount, grantOfOn } from './units'
import { isAdminRole } from './units-model'
/* (accounts.ts reaches this module through perms.ts; each side calls the other only at run time, never at load) */
import { accountOfPid, isAdminAccount, levelAcct } from './accounts'
import { activeEnvelope } from '../command'

export type NoticePart =
  | { k: 'del' }                                   // the input was deleted
  | { k: 'in' }                                    // HE was put in it (or it was filed for him)
  | { k: 'out' }                                   // HE was taken out of it
  | { k: 'cx'; why?: string }                      // cancelled, with its reason (D760)
  | { k: 'uncx' }                                  // brought back
  | { k: 'off' } | { k: 'on' }                     // taken off the programme / put back on it
  | { k: 'unav' } | { k: 'unavoff' }               // filed under Unavailable / taken out of it (D815)
  | { k: 'when'; a?: string; b?: string; t?: string }   // what it is NOW: its day(s) where they moved, its hours where they did
  | { k: 'add'; who: string[] }                    // others put in — ids; a placeholder is one of them
  | { k: 'rem'; who: string[] }                    // others taken out
  | { k: 'title'; was: string }                    // renamed
  | { k: 'rmk' }                                   // its remark changed
  /* …AND IT REPLACED HIS PENDING LEAVE WAR BID (the overhaul's M4, 9.3a — D1142: "a bid replaced by a clashing input"):
     one line, not two — the Inputs door's own line about the input says it ("You were added · replaces your LL bid"), and
     the war writes none. `c` — the bid's kind as stored (LL, *LL). Noted by the clash gate inside the same command
     (noteReplacedBid, below) */
  | { k: 'rbid'; c: string }
  /* A DAY MADE A PUBLIC HOLIDAY AFTER WHAT STANDS ON IT WAS FILED ([OIL-ASK-NOTIFY] — owner D780: "There should be a notification
     to the schedulers to award oil on those inputs. And should not be silent."; D783 (6): "one bell line a holiday,
     counting only what is left unanswered, a tap opening the list"). ITS OWN KIND OF NOTICE: it is about no one input
     (`iid` is ''), `name` is the holiday's and `day` its first day; `a`..`b` is the run of dates that became non-working.
     IT STORES NO COUNT — how many inputs still need an answer is read live when the bell draws (noticeWords), so what
     an admin answers tells nobody (D781), and a line with nothing left is not listed at all (noticeLive).
     `u` — THE SQUADRON IT WAS WRITTEN FOR (the Plan audit's PB4, the blind read's R3 and R4 — the reshape plan §19, §19b;
     his D2195, D2202): a holiday is its own squadron's, and its line may sit on the bell of an admin of it who is at home in
     another (one holding Plan of it), so what the line counts, the dates it covers, its name and the list it opens are that
     squadron's, never its reader's home's. A line stored before it was carried (D56: demo data) reads its reader's home. */
  | { k: 'oilhol'; a: string; b: string; u?: string }
  /* THE LEAVE WAR'S OWN LINES (the overhaul's M4, batch 9 — owner D1142, D1214, D1216, D1422; the build spec §2). About no
     input (`iid` is ''): `name` is "Your leave" or "Leave War", `day` the first day. Written by the war's own command, so
     its Undo takes them with it (leavewar/state/store.ts tellDecisions / tellOpenings, through leavewar/sync.ts).
     `lw` — a decision on HIS leave: `c` the kind as stored (LL, *LL), `a`..`b` its days, `d` what was done, `to`..`tb`
     where a move took it; `again` — a Redo after a "taken back" line (9.3: a fresh line, so it is unread), `ref` the line
     it repeats (the fixes' M9: shown only while that line stands, and only the newest "again" of it). */
  | { k: 'lw'; c: string; a: string; b: string; d: LwDid; to?: string; tb?: string; again?: true; ref?: string; w?: string }
  /* bidding opened or closed on a stretch (D1214) — `end`: closed because its last date passed (derived, never stored) */
  | { k: 'lwopen'; a: string; b: string; open: boolean; end?: true }
  /* a war line the admin's Undo took back after the member had read it (D1216): `ref` the line it was, `d` what it said */
  | { k: 'lwback'; c?: string; a: string; b: string; d: LwDid | 'open' | 'close'; ref: string; w?: string; to?: string; tb?: string }
  /* A MAN'S POSTING OUT RAN ON ITS DATE ([POSTOUT-RUN-NOTICE] — owner D1546: "So it is not like gone silently"; D1547 A:
     it runs by itself and every admin's bell is told; D1690: the man first, in bold, then "Posted out" and what the
     outcome did; D1691: a deleted man's line opens nothing). About no input (`iid` is ''): `name` is his callsign when it
     ran (read by today's callsign while he is on the roster), `day` the posting's date. `who` — the man; `o` — the outcome
     that ran (`none` — "off the manpower": nothing runs, so that line is worked out by each admin's bell, never stored —
     leavewar/sync.ts postedLines); `acct` — an archived man who held a sign-in (his account was suspended with him).
     Nobody is named as who set it: a posting keeps no such record. */
  | { k: 'po'; who: string; o: PoOutcome; acct?: true }
  /* A POSTING OUT TAKEN BACK ([NOTICE-UNDO-RETRACT] step 1 — owner D1693, D1699): the posting sheet's "Undo post out" took
     back a posting whose line this admin had already READ, so in its place he gets this one, unread, by whoever pressed
     it — the line's own words struck through, then "taken back · Saber" (his idea, D1699). One he had not read simply went;
     the admin who pressed Undo gets none. `who`, `o`, `acct` — as the line it takes back; `day` its posting date. */
  | { k: 'poback'; who: string; o: PoOutcome; acct?: true }
  /* HIS SANS DAYS WITH NOTHING FILED (owner D2338, 22 Nov 26 — "on that date his bell tells him the planned days with nothing
     filed, a tap opening the SANS calendar"). About no input (`iid` is ''): `days` — the days, first first (ISO), from his
     SANS posting's date on, he is planned with us and has filed no SANS availability. Worked out by his own bell from the
     schedule as it stands, never stored (leavewar/sansunfiled.ts), so it shrinks as he files and goes once all are. `from`
     — his SANS posting's date; none for a man ticked SANS with no posting (D2394 2b: "Your SANS availability is needed."). */
  | { k: 'sansdue'; days: string[]; from?: string }
  /* …AND WHEN HIS SANS POSTING OR TICK CHANGES (his D2391, 23 Nov 26: his bell says plainly what changed and what it means,
     NARROWING D1699 for this line alone: the reminder he read is not struck through, it simply goes). A stored line to him,
     by the admin who did it, never to that admin; its `day` the posting's date, or the day of the untick (the gate matches
     it to the change — leavewar/sansunfiled.ts sansBackCovered). `how` — what changed, and so the words (noticeWords):
     `later` / `earlier` his date moved (to `to`), `undone` Undo post out, `other` another outcome, `untick` his Quals SANS
     tick taken off. `days` — the reminder he had READ (else empty): only ever the reason a line is owed, never shown.
     `hid` — his SANS availability the change HID, today on (D2341). `back` — this line is the "taken back" of an untick
     line he had read, its Undo pressed (D1693, D1699). A line with no `how` was written before D2391 (demo data only). */
  | { k: 'sansback'; days: string[]; hid?: string[]; how?: SansBackHow; to?: string; back?: true; over?: string[]; kept?: true; again?: true; ref?: string }

/** what a posting out did on its date, for the admins' bells ([POSTOUT-RUN-NOTICE]) */
export type PoOutcome = 'overseas' | 'delete' | 'sans' | 'none'
/** what changed of his SANS, for his bell (D2391's A–E) */
export type SansBackHow = 'later' | 'earlier' | 'undone' | 'other' | 'untick'

/** what the war did to a man's leave, for his bell (M4 9.1, 9.4a, 9.7) */
export type LwDid = 'approved' | 'refused' | 'repend' | 'putback' | 'moved' | 'deleted' | 'added' | 'bidmoved' | 'biddel' | 'retyped'

export interface Notice {
  id: string
  to: string
  by: string | null
  at: number
  iid: string
  name: string
  day: string
  what: NoticePart[]
  /** TOLD ONLY AS THE INPUT'S FILER (fix read 6, fault C — the fresh Opus read's F2 and F3, Astra's 2): present on an
   *  input's line whose reader was named in the input neither before nor after the change, and told only as its filer
   *  (filerTold); its value the squadrons he was told THROUGH (filerVia — fix read 8, fault R: of those filerUnits reads,
   *  his home while he has not moved since the input was filed, and any he holds a right in). Absent: he was named in it. Written once, by the pass, so the line's leaving his
   *  bell after a move (noticeLeftBell) never has to ask the input as it stands today. */
  fu?: string[]
}

/* the live list — restored IN PLACE by the snapshot (state/history.ts), like the inputs and the planning notes */
export const NOTICES: Notice[] = []

/* ---- working one out ------------------------------------------------------------------------------------------ */
const ids = (r: any): string[] => namedOf(r).map((e: any) => String(e.p))
/** IS AN INPUT'S FILER STILL TOLD OF IT? (his D2223, 19 Nov 26: "after a move, a bell line about an input stays with a man
 *  only where he is named in that input …; a moved admin is no longer told about inputs he filed for his old squadron's
 *  men — the filer is told only while he is still that man's admin or in the input.") The pass told a filer of every
 *  change to what he filed, wherever he had moved — so Hunter, 149's since his move, was still told of each change to a
 *  leave he had filed for Ranger, 142's. Told when he is named in it (`rs` — the input before and after a change); when
 *  it names nobody (an ALL AVAIL input — no man whose squadron to ask); and while, for some man named in it, he is still
 *  in that man's squadron or an admin of it (a master is an admin everywhere, a Plan grant counts). The agent's reading,
 *  told in the closing report: a member who filed for a squadron-mate and never moved is still told — the ruling speaks of
 *  "after a move". The pass, the commit gate (state/perms.ts toldBy) and the read rule (noticeAboutHim) ask this one body.
 *  AN INPUT NAMING NOBODY (an ALL AVAIL one) HAS A SQUADRON TOO (fix read 6, fault A — the security read's SEC6-A, the
 *  fresh Opus read's F1, Astra's 3): it answered "told" whenever nobody was named, so Hunter, 149's since his move, was
 *  still told of every change 142 made to an ALL AVAIL meeting he had filed on a 142 day — and the gate let a forged line
 *  ride to any 149 man through such an input. Its squadron is the one the gate's 7c judges it by (inputUnit, below); he is
 *  told only while it has none, or it is his home, or he is an admin of it. `iso` — the day the filer's own home and level
 *  are read on (today where not given). A named man's home is read on each of the input's own days (filerUnits — his
 *  D2225, fault Q of fix read 7: a filer who never moved stays told for the days still his squadron's). */
export function filerTold(f: string, rs: readonly any[], iso?: string): boolean {
  if (namedIn(rs).has(f)) return true
  return filerVia(f, rs, iso) != null
}
/** THE SQUADRONS A FILER NOT NAMED IN THE INPUT IS TOLD THROUGH — null: he is not told (filerTold). The line the pass
 *  writes him carries exactly these (Notice.fu), and the gate (state/perms.ts filerMarkOk) asks this one body for it.
 *  FIX READ 8, FAULT R (the fresh Opus read's 1 — his D2223, D2225: "a moved admin is no longer told about inputs he filed
 *  for his old squadron's men"; "a filer who never moved stays told"). Fault Q read the named men's homes over the input's
 *  days and toldIn counted the filer's home TODAY against them, so Hunter, 149's since 16 Jul, was told on 17 Jul of a
 *  change to the leave he had filed on 15 Jul for Ranger — Ranger 149's from 25 Jul put 149 among those squadrons — and
 *  the mark, the whole union, put Hunter's new home 149 on a line he got before his move, so his move never retired it
 *  (D2218). Now: his home counts only while he has not moved since the input was filed (movedSince — a filer who never
 *  moved: D2225's home branch, unchanged); a filer who has moved is told only through a right he holds in one of them
 *  (adminThen — the master mark or a Plan grant); and the mark records only the squadrons he was told through, so his
 *  next move judges the line by them alone.
 *  …OR AS AN ADMIN OF THE MAN'S SQUADRON AGAIN (fix read 13, item C — his D2228, 20 Nov 26: "a filer who moved together
 *  with the man he filed for, and is now an admin of the man's new squadron, is told when that input changes"; fix read
 *  9's Q1 — Opus O9-2, Fable 3). Fault R counted a moved filer only through the mark or a grant, never his home's admin
 *  role, so Hunter, who filed Ranger's leave on 15 Jul and moved with him to 149 on 16 Jul as 149's admin, was told
 *  nothing of Kestrel's change on 17 Jul; nor was he once he moved away and back to 142. Now his home today counts too
 *  where he is its admin (his role as it stands when the input changes — the agent's reading in D2228's row) and it is
 *  the named man's home on one of the input's days (filerUnits). A moved member is still told only through a right, and
 *  a moved admin of a squadron that is no named man's on those days is still not told (D2223). The lines he had before
 *  his move still leave his bell on the move day (D2218, noticeLeftBell — unchanged): a line written now is marked with
 *  his home today, so a later move retires it as any other. */
export function filerVia(f: string, rs: readonly any[], iso?: string): string[] | null {
  const us = filerUnits(rs, iso)
  /* (named men with no squadron to ask: nobody to be told through; nobody named and no squadron: told, no squadron) */
  if (!us.length) return namedIn(rs).size ? null : []
  const day = iso ?? todayIso()
  const home = homeOn(f, day)
  const atHome = !!home && !movedSince(f, filedDay(rs), day)
  const acct = accountOfPid(f)
  /* (a moved filer who is an admin of his home today, where that home is the named man's on one of the input's days —
     his D2228: "that man's admin" again, through his home's admin role as it stands now) */
  const homeAdmin = !!home && !atHome && isAdminAccount(acct)
  const via = us.filter(u => (u === home && (atHome || homeAdmin)) || (!!acct && adminThen(acct, u, day, true)))
  return via.length ? via : null
}
/* the day an input was filed — its `at`, written once when it is placed (state/inputstamp.ts stampPlaced) and never by a
   change; the earliest among the images (a command writes the after-image, so a later `at` there never shortens the span).
   None (a record from before the stamp — D56): null. */
function filedDay(rs: readonly any[]): string | null {
  let at: number | null = null
  for (const r of rs) if (r && typeof r.at === 'number' && Number.isFinite(r.at) && (at == null || r.at < at)) at = r.at
  return at == null ? null : dayOfAt(at)
}
/* has his home changed on some day after `from` up to `to`? (his home rows change only on their `from` day) No day to
   count from: no (as before fault R) */
function movedSince(pid: string, from: string | null, to: string): boolean {
  if (from == null) return false
  /* (the home handle's second question — the one body, the reshape plan §3.2 A-i: a change is his resolved squadron
     differing from the day before, never a row's date as such) */
  return homeChangesOn(pid, from, to).length > 0
}
const namedIn = (rs: readonly any[]): Set<string> => {
  const named = new Set<string>()
  for (const r of rs) if (r) for (const p of ids(r)) named.add(p)
  return named
}
/** THE SQUADRONS A FILER'S TELLING IS JUDGED BY (filerTold, above): each named man's home on each of the input's own days,
 *  or, where the input names nobody, the input's own squadron (inputUnit) — before and after a change. Empty: nobody's
 *  squadron to ask.
 *  ON THE INPUT'S DAYS, NOT TODAY (fix read 7, fault Q — his D2225, 19 Nov 26, Q17: "a filer who has not moved stays told …
 *  for the input's days that are still the filer's squadron's"). It read each named man's home today, so Hunter (142's,
 *  never moved), who filed Ranger's leave 23–27 Jul, was told nothing of Saber's change once Ranger was 149's from 25 Jul,
 *  though 23 and 24 Jul are still 142's. The agent's reading, in the ruling's row: a day is the filer's squadron's where
 *  the named man's home that day is it. A moved filer is still not told (D2223): his own home and rights are read on `iso`
 *  (today), in filerVia. The pass, the gate (state/perms.ts toldBy, filerMarkOk) and the line's mark (Notice.fu) read this
 *  one body, so the gate lets ride exactly the line the pass writes, marked with the same squadrons. An input whose dates
 *  cannot be read is judged on today, as before.
 *  EACH IMAGE'S OWN MEN ON ITS OWN DAYS (fix read 14, item B — Astra A1; his D2223, D2228): it crossed every man named in
 *  either image with the days of both, so a change moving Hunter's LL for Ranger on 23 Jul to Casper on 27 Jul counted
 *  Ranger on the 27th — a pair no image ever had — and Ranger, 149's from 25 Jul, told Hunter (149's admin since his move)
 *  through 149, though Ranger on the 23rd and Casper on the 27th are both 142's. Now each image counts as it would alone:
 *  its own named men over its own days, or, naming nobody, its own squadron (inputUnit) — the change touches both. */
export function filerUnits(rs: readonly any[], iso?: string): string[] {
  const named = namedIn(rs)
  const out = new Set<string>()
  if (named.size) {
    for (const r of rs) {
      if (!r) continue
      const own = ids(r)
      if (!own.length) { const u = inputUnit(r); if (u) out.add(u); continue }
      /* (the one body — engine/inputs.ts inputSquadrons, the reshape plan §3.2 A-iii: each named man's squadron on the
         first day and on each day it changes; an input whose dates cannot be read is judged on today) */
      for (const u of inputSquadrons(r, homeHandle(), iso ?? todayIso())) out.add(u)
    }
  } else for (const r of rs) { const u = r ? inputUnit(r) : null; if (u) out.add(u) }
  return [...out]
}
/* an input's first and last day (ISO), from its own date and end date; null where its date cannot be read. An end before
   its start (never written by the app) counts as the start alone, as inputCoversDate covers no day past it. */
const inputSpan = (r: any): readonly [string, string] | null => inputSpanIso(r)
/** THE LEAVES A COMMAND FOLDED INTO ANOTHER (fix read 15 — Astra 1): a Leave War approval that bridges two war-approved
 *  leaves keeps the one before and removes the one after (leavewar/sync.ts, "approving next to leave already approved …
 *  EXTENDS that Input"), so the words typed over the leave after were told to nobody — its record has no image after.
 *  Folded: among the records this command removed (`removed`, their before-images), each war-approved leave of the same
 *  war, kind and people as `a` (the surviving record's after-image) whose days lie within `a`'s. The pass (noticePass)
 *  and the commit gate (state/perms.ts toldBy, filerMarkOk) read the survivor's telling over its own images and these.
 *  …ONLY WHAT THE JOIN ITSELF FOLDS (fix read 16 — all four readers: Astra 1, the Opus reader's 1, Fable's 1, the security
 *  reader's S16-1): the same part of the day as the survivor (the join's own test, leavewar/sync.ts doorApprove `same`),
 *  and only days the survivor GREW over in this command (`b`, its before-image: some day of the removed leave lay outside
 *  it). A Delete, Refuse, Back to bid or Move of one half of a day whose other half stands with other words read the
 *  removed half as folded into the untouched one, wrote a words line on it, and the gate refused the whole action while
 *  the war's window said "done". */
export function foldedInto(a: any, removed: readonly any[], b: any): any[] {
  if (!a || typeof a !== 'object' || !a.lw || !b || typeof b !== 'object') return []
  const span = inputSpan(a)
  const was = inputSpan(b)
  if (!span || !was) return []
  const who = ids(a).slice().sort().join('|')
  const part = (x: any) => `${!!x.allday}|${x.half ?? ''}`
  return removed.filter(x => {
    if (!x || typeof x !== 'object' || x.lw !== a.lw || x.type !== a.type || x.iid === a.iid) return false
    if (ids(x).slice().sort().join('|') !== who || part(x) !== part(a)) return false
    const s = inputSpan(x)
    return !!s && s[0] >= span[0] && s[1] <= span[1] && (s[0] < was[0] || s[1] > was[1])
  })
}
/** THE IMAGES A FILER OF A JOIN'S WORDS IS JUDGED OVER (fix read 16 — Fable's 2): in the pass's words branch for a war
 *  leave, each image before the leave that stands — its own, then each leave folded into it — whose words changed tells
 *  its filer once, the first that names him: the standing leave's filer over all the images, a folded leave's over its own
 *  alone. The gate (state/perms.ts filerMarkOk) asks this so the mark it expects is the pass's. Null where none tells him
 *  (the gate then reads every image, as before). */
export function joinFilerImgs(f: string, b: any, a: any, folded: readonly any[], actor: string | null): any[] | null {
  for (const src of [b, ...folded]) {
    if (!src || typeof src !== 'object') continue
    if (!common(src, a, '').some(x => x.k === 'rmk')) continue
    if (changeFiler(src, src === b ? a : null, actor) === f) return src === b ? [b, a, ...folded] : [src]
  }
  return null
}
/* (homesOver — every squadron a man's home is on over a span — is the one body's now: engine/inputs.ts inputSquadrons,
   on the home handle's changesIn, the reshape plan §3.2 A-i) */
/* AN ADMIN OF IT ON THAT DAY (fix read 7, fault P — Astra's A2, Fable's 2): asked of a past day (noticeLeftBell, a move
   day), the master mark and an admin grant held TODAY answered it, so Plan of 142 (or the master mark) given to Hunter
   after his move to 149 brought back, read or unread, the line his move had retired (D2218, D2223). A grant counts from
   the day it was given (units-model.ts Grant.from), the mark from the day it was set (accounts.ts Account.masterFrom);
   one stored before either was kept counts from always (D56). Here only — the gate's levelFrom asks today. No day: as
   today. (His home's admin role is no right here: a filer at home is told through his home while he has not moved since
   the input was filed — filerVia; one who has moved through the mark or a grant — fix read 8, fault R — or, in
   filerVia alone and on today alone, as an admin of his home again where it is the named man's — D2228.)
   HELD BEFORE THAT DAY BEGAN (fix read 8, fault D — Fable's 2, the fresh Opus read's 2): a move takes effect at the
   start of its day (state/units.ts setHome), so a right counted on its own day (`<=`) brought the retired line back when
   Plan or the mark was given ON the move day, read or unread. A move day now asks a right held before that day began
   (`from < iso`). `now` — the pass asking about this moment (filerVia, on today): a right already given today counts. */
/* HIS FROM THE DAY THE ACCOUNT BECAME HIS (fix read 10, fault D — O10-4, F10-4): a right held through an account is the
   person's only from the later of its own day and the day the account was linked to him (accounts.ts Account.pidFrom),
   so a grant or the mark moved to a moved man by re-linking the account that holds it is a right given that day. */
/* THE RIGHT THAT HOLDS ON THAT DAY (the reshape plan §4.3, Piece B — the bell): the grant read with the reading rule
   (units.ts grantOfOn — ended at the start of the day his squadron changes, D2203, D2243), and still held before that day
   began; Plan is an admin's (PA2 — an `admin` right on an account that is not an admin's is none). */
/* (K3 audited, core line 5, 22 Nov 26 — his D2160: the Plan branch reads the account's bare role, not his level at home.
   No door leaves the two apart: Plan is given only to one who is an admin at home that day (units.ts setGrant —
   accounts.ts adminNow), a Plan held before a move ends at the start of the move day (grantOfOn, D2203), and a moved
   admin is a member until made an admin anew. filerVia's home branch asks isAdminAccount, his level at home today.
   Pinned: state/corelines-bell-moved-admin.test.ts.) */
function adminThen(acct: { id: string; pid: string; role: string; master?: true; masterFrom?: string; pidFrom?: string }, u: string, iso?: string, now = false): boolean {
  if (iso == null) return levelOfAccount(levelAcct(acct), u, todayIso()) === 'admin'
  const later = (from: string | undefined): string | undefined => (!from ? acct.pidFrom : !acct.pidFrom || from > acct.pidFrom ? from : acct.pidFrom)
  const held = (own: string | undefined): boolean => { const from = later(own); return !from || from < iso || (now && from === iso) }
  if (acct.master && held(acct.masterFrom)) return true
  const g = grantOfOn({ id: acct.id, pid: String(acct.pid), pidFrom: acct.pidFrom }, u, iso)
  return !!g && g.level === 'admin' && isAdminRole(acct) && held(g.from)
}
/** THE SQUADRON OF AN INPUT THAT NAMES NOBODY (an ALL AVAIL or ALL one — fix read 6, fault A): its placeholder's filer
 *  first, else the input's own filer, his home on the input's own date (today where it has none). ONE body, asked by the
 *  filer's test above and by the commit gate's 7c (state/perms.ts inputUnitViolation), which reads the homes as the rows
 *  stood before the command — so the home reader is handed in. Null: no filer, or no home to read. */
export function inputUnit(r: any, home: (pid: string, iso: string) => string | null = (p, d) => homeOn(p, d)): string | null {
  if (!r || typeof r !== 'object') return null
  const ph = placeholderOf(r)
  const by = ph && ph.by != null && ph.by !== '' ? ph.by : r.by
  /* (a squadron stamped on it — the C3 slot — answers whatever its filer; else no filer, no squadron, as before) */
  if ((by == null || by === '') && !(typeof r.u === 'string' && r.u)) return null
  /* the one body (engine/inputs.ts inputSquadrons, the reshape plan §3.2 A-iii): its stamp, else its filer's squadron on
     its first day — today where its date cannot be read */
  return inputSquadrons(r, { on: home, changesIn: () => [] }, todayIso())[0] ?? null
}
/** WHO IS TOLD OF A CHANGE AS ITS INPUT'S FILER (fix read 6, fault A — the security read's SEC6-A (2)): the filer as the
 *  input stood BEFORE the change — the after-image's `by` is whatever the command writes, so a forger who sets it to a
 *  149 man would have him told; on a new input only one filed by the actor himself, who is never told of his own act. The
 *  pass (noticePass) and the commit gate (state/perms.ts toldBy) ask this one body. Empty: nobody. */
export function changeFiler(b: any, a: any, actor: string | null): string {
  if (b && typeof b === 'object') return b.by != null && b.by !== '' ? String(b.by) : ''
  if (a && typeof a === 'object' && actor != null && a.by != null && String(a.by) === actor) return actor
  return ''
}
/* the commands the app itself tells in, with no name (a posting on its date, a man deleted — R12): their lines carry no
   maker (state/sched-commit.ts, which tells; state/perms.ts, which lets such a line ride with no `by`) */
export const APP_ACTS: ReadonlySet<string> = new Set(['person.delete', 'lw.postoutRun', 'lw.postout'])
/* THE LINES THE PASS ITSELF WROTE IN THE RUNNING COMMAND (fix read 7, fault M). The pass takes its before-image of the
   inputs as last committed — before an input command's resync takes up a bare write made since (state/sched-commit.ts
   commitInputsWith) — so it may tell, inside this command, of an input this command's own change list does not carry.
   The commit gate refuses an input line the command could not have had from the pass; a line the pass wrote here is the
   pass's by definition, so the gate asks this registry first. Kept by the command's envelope (the one object the pass
   and the gate both see — command/commit.ts activeEnvelope, the hard invariants' `env`), written only by the pass
   (sched-commit.ts tellPass); nothing in an envelope can put an id in it. */
/* how far from the clock a new line's time may be (fix read 7, fault T): written by the app at the moment of the change,
   so a few minutes covers any drift between the command and its check; at the database step the server sets the time */
export const AT_SLACK_MS = 5 * 60 * 1000
const PASS_MADE = new WeakMap<object, ReadonlySet<string>>()
export function notePassMade(env: object, made: ReadonlySet<string>): void { PASS_MADE.set(env, made) }
export function passMade(env: object): ReadonlySet<string> | undefined { return PASS_MADE.get(env) }
/* THE WAR'S LINES THIS COMMAND MINTED (fix read 9, fault D — the security read's SEC9-2): only noticeWar, noticePosting and
   noticePostingBack write a war line (docs/data-model.md §11), yet an admin's ordinary input command put a line of his own
   words in a war line's shape on his own man's bell, and, being "about him", it followed the man to his new squadron for
   good (D2218, D2222). Kept, as passMade is, by the running command's envelope and written only by those three, so the
   commit gate (perms.ts adminOwnerViolation) knows a war line the app wrote from one an envelope merely carries. */
const WAR_MADE = new WeakMap<object, Set<string>>()
function noteWarMade(id: string): void {
  const env = activeEnvelope()
  if (!env) return                                    // outside every command the line is not saved, so not vouched for
  let s = WAR_MADE.get(env)
  if (!s) WAR_MADE.set(env, (s = new Set()))
  s.add(id)
}
export function warMade(env: object): ReadonlySet<string> | undefined { return WAR_MADE.get(env) }
/* THE HOLIDAY'S LINES THIS COMMAND MINTED (fix read 10, fault B — the fresh Opus read's O10-2, the security read's
   SEC10-3): the commit gate let any NEW line made only of holiday parts skip every check, as the holiday's own — so a 142
   admin put a made-up "holiday" line on 149's admin's bell signed as him, or on a member's signed as the master. Kept as
   warMade is, by the running command's envelope, and written only by noticeHoliday: only a line it minted here passes as
   the holiday's own (perms.ts adminOwnerViolation); any other takes the ordinary checks. */
const HOL_MADE = new WeakMap<object, Set<string>>()
function noteHolMade(id: string): void {
  const env = activeEnvelope()
  if (!env) return                                    // outside every command the line is not saved, so not vouched for
  let s = HOL_MADE.get(env)
  if (!s) HOL_MADE.set(env, (s = new Set()))
  s.add(id)
}
export function holMade(env: object): ReadonlySet<string> | undefined { return HOL_MADE.get(env) }
/* (the commit gate's second look at a command, judged against the saved rows — perms.ts storedRowViolation, fix read 11,
   fault A — runs on a COPY of the command's envelope: the copy vouches for exactly the lines the command itself minted,
   no more, so these three registries go to it unchanged) */
export function shareMade(from: object, to: object): void {
  const p = PASS_MADE.get(from), w = WAR_MADE.get(from), h = HOL_MADE.get(from)
  if (p) PASS_MADE.set(to, p)
  if (w) WAR_MADE.set(to, w)
  if (h) HOL_MADE.set(to, h)
}
const phOf = (r: any): string | null => { const p = placeholderOf(r); return p && p.p != null ? String(p.p) : null }
/* yyyy-mm-dd of one of an input's own date labels ("Jul 15", with its year) */
const isoOf = (lbl: any, yr: any): string => {
  const o = dateOrd(lbl, yr)
  if (o == null) return ''
  const y = Math.floor(o / 10000), m = Math.floor((o % 10000) / 100), d = o % 100
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}
const firstDay = (r: any): string => isoOf(r.date, r.yr)
const lastDay = (r: any): string => (r.endDate ? isoOf(r.endDate, r.yr) || firstDay(r) : firstDay(r))
const hours = (r: any): string => (r.allday ? 'all day' : `${hhmm(r.s ?? 0)}–${hhmm(r.e ?? 0)}`) + (r.half ? ` ${r.half}` : '')
/* the remark as a person typed it (engine/inputs.ts remarksTyped — since D948 the date is printed from the dates, never
   written in), and a change of dates is already said as one */
const typed = (r: any): string => remarksTyped(r.remarks, r)
/* is he still someone the app can tell? */
const here = (p: string): boolean => { const x: any = PEOPLE[p]; return !!x && !x.deleted && !x.archived && !x.special }

/* what changed about the INPUT ITSELF, for someone who is in it before and after (or filed it) — in the order a reader
   needs it: is it still on, is it still when he thought, who is in it, what it is called */
export function common(b: any, a: any, him: string): NoticePart[] {
  const out: NoticePart[] = []
  const why = String(a.cxr || '').trim()
  if (a.cx && (!b.cx || String(b.cxr || '').trim() !== why)) out.push(why ? { k: 'cx', why } : { k: 'cx' })
  else if (b.cx && !a.cx) out.push({ k: 'uncx' })
  /* A FILING UNDER UNAVAILABLE IS NOT THE PROGRAMME (owner D815, 13 Oct 26). These two knew only "taken off" against
     everything else, so an Other filed with "→ Unavail" told its man "Back on the programme", and taken out again
     "Taken off the programme" — it was on neither. Asked FIRST; the two lines below keep their meaning. */
  /* an overseas duty stands under Unavailable by its kind, with no mark: put back, or taken out, it is said as a filing is (D1393) */
  const odIn = (x: any) => isOD(x.type) && !odOut(x)
  if (isOD(a.type) && isOD(b.type) && odIn(a) !== odIn(b)) out.push({ k: odIn(a) ? 'unav' : 'unavoff' })
  else if (a.acc === 'u' && b.acc !== 'u') out.push({ k: 'unav' })
  /* …taken out however it is taken out: a Reject, or an Other's Goes to moved back to the programme (the code read's F6 —
     D815's reading that no button does it was overtaken by D1356's Goes to) */
  /* …but not a retype into a kind the Unavailable list shows by itself — a leave, a medical, an overseas duty — which never
     left it (the narrow read's R2) */
  else if (b.acc === 'u' && a.acc !== 'u' && (a.acc === 'r' || !isUnavail(a.type))) out.push({ k: 'unavoff' })
  else if (b.acc !== 'r' && a.acc === 'r') out.push({ k: 'off' })
  else if (b.acc === 'r' && a.acc !== 'r') out.push({ k: 'on' })
  const days = firstDay(b) !== firstDay(a) || lastDay(b) !== lastDay(a)
  const time = hours(b) !== hours(a)
  if (days || time) out.push({ k: 'when', ...(days ? { a: firstDay(a), b: lastDay(a) } : {}), ...(time ? { t: hours(a) } : {}) })
  const was = new Set([...ids(b), phOf(b)].filter(Boolean) as string[]), now = new Set([...ids(a), phOf(a)].filter(Boolean) as string[])
  const add = [...now].filter(p => !was.has(p) && p !== him), rem = [...was].filter(p => !now.has(p) && p !== him)
  if (add.length) out.push({ k: 'add', who: add })
  if (rem.length) out.push({ k: 'rem', who: rem })
  if (inpLabel(b) !== inpLabel(a)) out.push({ k: 'title', was: String(inpLabel(b)) })
  /* …and its till-date tick turned by someone else: what the schedule prints for his remark changed (owner D953 — the
     scenario designer's 5); a flip the dates alone made is the "when" line's */
  const tick = tillTurned(b, a)
  if (typed(b) !== typed(a) || tick) out.push({ k: 'rmk' })
  return out
}

let SEQ = 0
const mint = (at: number): string => `n${at.toString(36)}${(++SEQ).toString(36)}${Math.random().toString(36).slice(2, 5)}`

export interface PassOpts {
  /** who made the change — a PEOPLE id; null where the app did */
  actor: string | null
  /** the app itself took someone out (a posting on its date, a delete): said with no name (R12) */
  app?: boolean
  at?: number
  /** NEVER TOLD TWICE (the overhaul's M4, 9.2 — the red team's B1): the command is one of the Leave War's own, which writes
   *  its ONE line about a leave it approved (state/notices.ts `lw`), so the Inputs page's copy of that leave — cut, moved,
   *  deleted, put back — tells nothing here. A change made on the Inputs page keeps telling him as today (D1166). */
  skipLw?: boolean
  /** the pending Leave War bids this command's inputs replaced (M4 9.3a): input id → person → the bids' kinds */
  replaced?: ReadonlyMap<string, ReadonlyMap<string, readonly string[]>>
}
/* WHICH BIDS A COMMAND'S FILINGS REPLACED (M4 9.3a) — noted by the Leave War's clash gate (leavewar/inputgate.ts
   replaceClashingBids) inside the very command whose input replaced them, read by that command's notice pass
   (state/sched-commit.ts tellPass). Keyed by the command, so a refused command's notes go with it and never reach
   another's line. */
const REPLACED = new WeakMap<object, Map<string, Map<string, string[]>>>()
export function noteReplacedBid(cmd: object | null, iid: string, person: string, code: string): void {
  if (!cmd || !iid) return
  const m = REPLACED.get(cmd) ?? new Map<string, Map<string, string[]>>()
  const byP = m.get(iid) ?? new Map<string, string[]>()
  const cs = byP.get(person) ?? []
  if (!cs.includes(code)) cs.push(code)
  byP.set(person, cs); m.set(iid, byP); REPLACED.set(cmd, m)
}
export function replacedBidsOf(cmd: object | null): ReadonlyMap<string, ReadonlyMap<string, readonly string[]>> | undefined {
  return cmd ? REPLACED.get(cmd) : undefined
}
/** THE PASS — every input before the command (`before`, by id) against the list as it stands; pushes the notices the
 *  change owes onto NOTICES and answers how many. Nothing is told when nothing a reader sees has moved. */
export function noticePass(before: ReadonlyMap<string, any>, live: readonly any[], o: PassOpts): number {
  const at = o.at ?? Date.now()
  const by = o.app ? null : o.actor
  if (!o.app && !by) return 0                         // a change with no person behind it and not the app's own: nobody to name
  const now = new Map<string, any>()
  for (const r of live) if (r && r.iid != null) now.set(String(r.iid), r)
  /* A MAN GIVEN AN INPUT OF HIS OWN OUT OF A SHARED ONE (engine/inputown.ts ownInputOf — a time typed on his own
     Unavailable row, sick leave cutting his part of a shared leave): the new record is HIS part of the old one, so what
     he is told is what changed for him — not "taken off" one and "added" to another */
  const splitFrom = (a: any): any | null => {
    const mine = ids(a)
    if (mine.length !== 1 || phOf(a)) return null
    for (const [iid, b] of before) {
      const after = now.get(iid)
      // eslint-disable-next-line react-doctor/js-set-map-lookups -- each input's own short list of people, made fresh for this one input and searched once for one man
      if (!after || b.type !== a.type || !ids(b).includes(mine[0]!) || ids(after).includes(mine[0]!)) continue
      return b
    }
    return null
  }
  let made = 0
  /* (`fu` — told only as its filer: the squadrons that judgement read, written on the line — fault C, Notice.fu) */
  const tell = (to: string, r: any, what: NoticePart[], fu?: string[]) => {
    if (!what.length || to === o.actor || !here(to)) return
    /* (the bids of his this input replaced on the Leave War — said on this one line, M4 9.3a) */
    const rb = o.replaced?.get(String(r.iid))?.get(to)
    if (rb && rb.length) what = [...what, ...rb.map(c => ({ k: 'rbid' as const, c }))]
    NOTICES.push({ id: mint(at), to, by, at, iid: String(r.iid), name: String(inpLabel(r)), day: firstDay(r), what, ...(fu ? { fu } : {}) })
    made++
  }
  const split = new Map<string, string>()             // old input id → the man split out of it, told under his new one
  for (const [iid, a] of now) {
    if (before.has(iid)) continue
    if (o.skipLw && a.lw) continue
    /* a leave the Leave War approved is told by the war's own page; nothing here */
    if (a.lw) continue
    const from = splitFrom(a)
    /* (who else was in the shared one is no change to HIS part: only what his own input now says differently) */
    if (from) { const him = ids(a)[0]!; split.set(String(from.iid), him); tell(him, a, common(from, a, him).filter(x => x.k !== 'add' && x.k !== 'rem')); continue }
    for (const p of ids(a)) tell(p, a, [{ k: 'in' }])
  }
  /* (the records this command removed, for the leaves it folded into another — foldedInto, fix read 15, Astra 1) */
  const removed: any[] = []
  for (const [iid, b] of before) if (!now.has(iid)) removed.push(b)
  for (const [iid, b] of before) {
    const a = now.get(iid)
    /* (its telling judged over its own images and those of the leaves folded into it — the gate's toldBy and filerMarkOk
       read the same) */
    const imgs = a ? [b, a, ...foldedInto(a, removed, b)] : [b]
    if (o.skipLw && (b.lw || (a && a.lw))) {
      /* …but its REMARK is no line of the war's: the war tells decisions, moves and deletes, never words — so a remark
         changed on a war-approved leave from a war window (the drag window's Remarks, D1341) is told here, once, as it was
         before M4 (the scenario designer's ★7) — to the men in it and to its filer, as the leave's own window tells them
         (fix read 13, item D (2) — Astra's lead: the drag window told the men only, never the admin who filed it; its
         filer only while he is still told of it, the line carrying the squadron he is told through, as below)
         …WHATEVER ELSE THE WAR COMMAND DOES (fix read 14, item C — Astra A2): it fired only on a remark-only change, so the
         drag window's Approve with new words — the words and the decision in one war command (leavewar/ui/SelectSheet.tsx
         decide) — told nobody of the words wherever the decision also changed the leave: approving Ranger's pending bid
         on 28 Jul beside the war-approved LL Hunter filed for him on 27 Jul joins it to that leave (27–28 Jul), so the
         change was a remark AND a date, and Hunter heard nothing of the words. Now the words are told, once, whatever
         else changed with them; the rest stays the war's own line.
         …AND OF EACH LEAVE FOLDED INTO IT (fix read 15 — Astra 1): approving the day between Saber's LL on 27 Jul and the
         LL Hunter filed on 29 Jul, words typed over all three, folds the 29th into the 27th and removes its record — and
         the words on Hunter's leave were told to nobody. Now each folded leave whose words changed tells its filer too,
         on the leave that stands; nobody is told twice, the one who typed them never.
         …ITS FILER JUDGED ON HIS OWN LEAVE'S DAYS (fix read 16 — Fable's 2; fix read 14's item B, each image counted as
         it would be alone): the folded leave's filer was judged over the standing leave's days too, so Hunter, who filed
         Ranger's 29 Jul after Ranger's move to 149 from the 28th, was told on a 142 day his leave never had (D2225: told
         for the input's days still his squadron's). The gate's toldBy and filerMarkOk read the same. */
      if (a && b.lw && a.lw) {
        const named = ids(a)
        const namedSet = new Set(named)
        const sent = new Set<string>()
        for (const src of imgs.filter(x => x !== a)) {
          const rmk = common(src, a, '').filter(x => x.k === 'rmk')
          if (!rmk.length) continue
          for (const p of named) if (!sent.has(p)) { sent.add(p); tell(p, a, rmk) }
          const f = changeFiler(src, src === b ? a : null, by)
          const own = src === b ? imgs : [src]
          if (f && !namedSet.has(f) && !sent.has(f) && filerTold(f, own)) { sent.add(f); tell(f, a, rmk, filerVia(f, own) ?? undefined) }
        }
      }
      continue
    }
    const was = ids(b)
    if (!a) {
      /* (its filer only while he is still told of it — D2223, filerTold above) */
      const f0 = changeFiler(b, null, by)
      const fb = f0 && filerTold(f0, [b]) ? f0 : ''
      /* (…told only as its filer: the line carries the mark — fault C, Notice.fu) */
      const fbOnly = !!fb && !was.includes(fb)
      for (const p of new Set([...was, fb])) if (p) tell(p, b, [{ k: 'del' }], fbOnly && p === fb ? filerVia(fb, [b]) ?? undefined : undefined)
      continue
    }
    const is = ids(a)
    /* (its filer as it stood before the change — fix read 6, fault A: changeFiler, the gate's own list — and only while
       he is still told of it) */
    const f1 = changeFiler(b, a, by)
    const filer = f1 && filerTold(f1, imgs) ? f1 : ''
    const everyone = new Set<string>([...was, ...is, filer])
    const wasIn = new Set(was), isIn = new Set(is)
    let shared: NoticePart[] | null = null
    for (const p of everyone) {
      if (!p) continue
      if (wasIn.has(p) && !isIn.has(p)) { if (split.get(iid) !== p) tell(p, a, [{ k: 'out' }]); continue }
      if (!wasIn.has(p) && isIn.has(p)) { tell(p, a, [{ k: 'in' }]); continue }
      /* in it before and after, or its filer: what changed about the input — the same words for each of them (nobody
         who reaches here was put in or taken out, so nobody is in the lists of who was) */
      const onlyFiler = p === filer && !wasIn.has(p) && !isIn.has(p)
      tell(p, a, shared || (shared = common(b, a, p)), onlyFiler ? filerVia(p, imgs) ?? undefined : undefined)
    }
  }
  return made
}

/* ---- a day made a holiday ([OIL-ASK-NOTIFY]) ------------------------------------------------------------------- */
/** THE HOLIDAY'S NOTICES — one a scheduler, pushed INSIDE the command that made the day a holiday (leavewar/sync.ts
 *  tellHoliday, through the scheduler store's own input command), so that command's Undo takes them away and its Redo
 *  puts them back. `to` — the holiday's own squadron's admins, the one who made the holiday too: what he leaves for
 *  "Later" is on his own bell as well. `unit` — that squadron, carried on the line (PB4, R3, R4). Answers how many were
 *  made. */
export function noticeHoliday(to: readonly string[], by: string | null, name: string, a: string, b: string, unit?: string | null, at: number = Date.now()): number {
  let made = 0
  for (const p of new Set(to.map(String))) {
    if (!here(p)) continue
    const id = mint(at)
    NOTICES.push({ id, to: p, by, at, iid: '', name, day: a, what: [{ k: 'oilhol', a, b, ...(unit ? { u: unit } : {}) }] })
    noteHolMade(id)
    made++
  }
  return made
}
/* how many inputs on a run of dates still need an OIL answer — the Leave War's to say (leavewar/sync.ts oilOpenOn),
   handed over by the sync's wiring so state/ never imports the war (the inputgate-hook way). No reader installed (a
   scheduler-only test): nothing is left. */
/* (`unit` — the squadron the line was written for: its inputs are what it counts — the Plan audit's PB4; before, each
   admin counted his own home's, so Hunter's line of 149's holiday read 0 and was hidden) */
let HOL_LEFT: ((a: string, b: string, unit: string) => number) | null = null
export function setHolidayLeft(fn: ((a: string, b: string, unit: string) => number) | null): void { HOL_LEFT = fn }
/* a holiday line's dates and squadron as stored — its `u` (PB4); a line stored before it was carried (D56) reads its
   reader's home today, the squadron such a line was always counted for */
const holOf = (n: Notice): { a: string; b: string; u: string } | null => {
  const p: any = (n.what || [])[0]
  if (!p || p.k !== 'oilhol') return null
  return { a: String(p.a), b: String(p.b || p.a), u: typeof p.u === 'string' && p.u ? p.u : homeOn(String(n.to), todayIso()) ?? '' }
}
/* THE DAYS OF A NOTICE'S RUN THAT ARE STILL A HOLIDAY — read from the war as it stands, the same way as the count (the
   two code reads of the finished code, 13 Oct 26 — Fable F1, the Opus read F3). A notice keeps the dates as they were
   when it was made; a holiday is then shortened, lengthened, or taken away and made again over other dates, and a line
   that printed its STORED dates named days that were working days again, or stood beside a second line for the same
   holiday. So the stored run is only where to look: what the line says, what it counts, which day it covers and which
   list it opens are all its days that are a holiday NOW. No reader installed: the run as stored. */
/* (`u` — the squadron the line was written for, whose holiday it is: its dates, name, count and list are that squadron's —
   PB4, R4; the reader is handed it, never the loaded war's squadron) */
export type HolidaySpan = { a: string; b: string; /** the holiday's own name NOW ('' — none of its own); absent where no reader is installed */ name?: string; /** the squadron the line was written for — always given by noticeSpan */ u?: string }
let HOL_SPAN: ((a: string, b: string, unit: string) => Omit<HolidaySpan, 'u'> | null) | null = null
export function setHolidaySpan(fn: ((a: string, b: string, unit: string) => Omit<HolidaySpan, 'u'> | null) | null): void { HOL_SPAN = fn }
/** a holiday notice's dates — and its name — as the holiday stands now in its own squadron's war, with that squadron; null for any other notice, and where no day of it is a holiday any more */
export function noticeSpan(n: Notice): HolidaySpan | null {
  const h = holOf(n)
  if (!h) return null
  if (!HOL_SPAN) return h
  const s = HOL_SPAN(h.a, h.b, h.u)
  return s ? { ...s, u: h.u } : null
}
/** how many inputs a holiday's notice still counts — its own squadron's (0 for any other notice) */
export function noticeLeft(n: Notice): number { const s = noticeSpan(n); return s && HOL_LEFT ? HOL_LEFT(s.a, s.b, s.u ?? '') : 0 }

/* ---- a man who moves squadron leaves his old squadron's lines behind (his D2218) ----------------------------------- */
/* the date a moment falls on, as the app's today is read (state/units.ts todayIso — the viewer's own calendar); the commit
   gate reads it too (state/perms.ts lineNotNow — fix read 8, fault N) */
export const dayOfAt = (at: number): string => {
  const d = new Date(at)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
/** IS THIS LINE ABOUT ITS READER HIMSELF? (his D2218: "lines about himself stay with him") — a line about an input (one he
 *  is in or filed: the pass tells nobody else, noticePass), a decision on his own leave and its taking back ("Your leave"),
 *  his own posting. Not: bidding opened or closed on a war, a holiday's OIL question, another man's posting — his
 *  squadron's business, which he was told as one of its people. */
export function noticeAboutHim(n: Pick<Notice, 'to' | 'iid' | 'what' | 'fu'>): boolean {
  if (n.iid) {
    /* AN INPUT'S LINE (his D2223: "a bell line about an input stays with a man only where he is named in that input"):
       his being put in or taken out, or his own bid it replaced, is about him whatever the input says now; otherwise the
       line says itself which it is (Notice.fu, written by the pass): one he was told as named in the input is about him,
       one he was told ONLY as its filer never is by itself — whether it stays is noticeLeftBell's, judged on his move
       day. FIX READ 6, FAULT C (the fresh Opus read's F2 and F3, Astra's 2): this asked the input and the homes as they
       stand TODAY, so a filer line his move had retired came back — the input deleted since (no input: "about him"), he
       moved back, or the named man moved into his squadron — an unread one lighting his bell again. */
    const ws: any[] = n.what || []
    if (!ws.length || ws.some(x => x && (x.k === 'in' || x.k === 'out' || x.k === 'rbid'))) return true
    return !Array.isArray(n.fu)
  }
  const p: any = (n.what || [])[0]
  /* (a line with no part says nothing about him — fix read 10, fault A (e), Fable F10-1: read as his, a made-up line with
     no parts followed a moved man to his new squadron) */
  if (!p) return false
  if (p.k === 'lw') return true
  if (p.k === 'lwback') return p.d !== 'open' && p.d !== 'close'
  if (p.k === 'po' || p.k === 'poback') return String(p.who) === String(n.to)
  /* HIS OWN SANS AVAILABILITY TAKEN BACK (D2338 with his D2218: a line about himself stays and follows him on a move): the
     struck line is a stored record of his own SANS days, always to him (sansunfiled.ts sansBackCovered). His live SANS-days
     line (`sansdue`) is NOT asked here and stays false: it is never stored, but worked out from his home squadron's
     schedule while that squadron is in view, so it goes by itself on a move (sansunfiled.ts unfiledNow). */
  if (p.k === 'sansback') return true
  return false
}
/** HAS THIS LINE LEFT ITS READER'S BELL? (his D2218, 19 Nov 26: "On the day a person moves squadron the old squadron's
 *  bell lines leave his bell, read or unread, never later struck 'taken back'; lines about himself stay with him".) A line
 *  carries no squadron of its own, and needs none: what a man is told as one of a squadron's people he is told while at
 *  home in it, so the squadron a line is his old squadron's business of is his home on the day it was written. From the
 *  first day after that — today or before — on which his home is another squadron, it is off his bell for good, read or
 *  unread, even should he move back: one rule READ by every place that shows a bell (noticeLive, the one body), never a
 *  write — no command touches another squadron's bell for it, and the change history keeps everything. A move is saved
 *  from tomorrow (state/units.ts setHome), so a line already written is never re-dated into the new squadron. */
/* a day before every home row the app writes (the demo's seeds start 2000-01-01, a move from tomorrow) */
const BEFORE_ALL = '0001-01-01'
/* (fix read 9, fault F: how far ahead a line may be dated and still read as written today — a clock set back by minutes) */
const DAY_AHEAD_MS = 24 * 60 * 60 * 1000
export function noticeLeftBell(n: Pick<Notice, 'to' | 'at' | 'iid' | 'what' | 'fu'>, today: string = todayIso()): boolean {
  if (!Number.isFinite(n.at)) return false
  /* (fix read 7, fault T — the security read's SEC7-2: a line dated ahead was "not yet past" for ever and so never left a
     moved man's bell. The gate now refuses a new line not dated now (state/perms.ts lineNotNow); one held before that, or
     put by any other road, counts as left, so the old squadron cannot keep a line on his bell by its date — his D2218)
     ONLY FOR A MAN WHO HAS MOVED, AND ONLY A LINE A MOVE RETIRES (fix read 8, fault B — Opus probe T and Opus 4): this
     took every line dated ahead off every bell — a man who never moved lost his own lines to a clock set back a few
     minutes, and a moved man his lines about himself, which D2218 keeps with him. A line dated ahead has no day to judge
     a move against, so it is read as written before every move he has made up to today, and judged by the one rule
     below (a first home row covers the days before it, units-model.ts atOn, so that day reads his first squadron): a
     man who never moved keeps it; a moved man keeps a line about himself, and a filer's line only while a right still
     tells him (adminThen)
     A FEW MINUTES AHEAD IS WRITTEN TODAY (fix read 9, fault F — Opus O9-4, Fable 4): read as written before every move,
     a line his NEW squadron wrote after the move — bidding opened on 149's war, its clock a few minutes ahead of his —
     left his bell as his old squadron's business, against D2218. A clock set back by minutes is not a line from before
     every move: one dated ahead by less than a day is read as written today, and only one more than a day ahead keeps
     "before every move" (fix read 7's backstop). One exception keeps fix read 8's fault B: a filer's line (his D2223)
     whose squadrons name neither his home today nor one where he holds a right today could not have been written to him
     today (filerVia), so it is read as written before every move, as before. */
  const to = String(n.to)
  const now = Date.now()
  let wrote = n.at > now + DAY_AHEAD_MS ? BEFORE_ALL : dayOfAt(Math.min(n.at, now))
  if (wrote !== BEFORE_ALL && n.at > now + AT_SLACK_MS && n.iid && Array.isArray(n.fu) && n.fu.length) {
    const acct = accountOfPid(to)
    const home = homeOn(to, today)
    if (!n.fu.some(u => u === home || (!!acct && adminThen(acct, u, today, true)))) wrote = BEFORE_ALL
  }
  if (!(wrote < today)) return false
  /* A LINE HE WAS TOLD ONLY AS THE INPUT'S FILER (his D2223 — fix read 6, fault C): judged on the day his home changed,
     against the squadrons the line was written under (Notice.fu) — not told on that day (no longer at home in one, nor an
     admin of one: filerTold's own test, filerVia), it is off his bell for good, read or unread, whatever happens after: the
     input deleted, his moving back, the named man moving. The input is never read for it. Asked on each move day in
     turn, so a filer still told on one (a master, an admin everywhere) is judged again on the next.
     BY HIS RIGHTS ONLY (fix read 8, fault R — his D2223): a filer who has moved is told only through a right he holds,
     so each move day asks the master mark or a Plan grant in the line's squadrons (adminThen), never his home that day —
     his home was what the line was told through before the move, and a move ends that (filerVia). */
  if (n.iid && Array.isArray(n.fu)) {
    const fu = n.fu
    const acct = accountOfPid(to)
    /* (each day his squadron changes — the home handle's second question, the reshape plan §3.2 A-i) */
    for (const d of homeChangesOn(to, wrote, today)) {
      if (fu.length && !(acct && fu.some(u => adminThen(acct, u, d)))) return true
    }
    return false
  }
  const moved = homeChangesOn(to, wrote, today).length > 0
  /* (the move first: it is the cheap question, and asks no input — read for every line each time a bell is drawn) */
  return moved && !noticeAboutHim(n)
}

/** IS THIS NOTICE ONE TO SHOW? Every notice about an input is. A holiday's is only while an input on its dates still
 *  needs an answer — and, where the same dates were made a holiday more than once (made, taken away, made again), only
 *  the NEWEST of them: one line a holiday (D783 (6); Fable's read of the plan, A7). ONE BODY, read by the bell's list,
 *  by what counts as unread (state/noticeseen.ts) and so by whether the bell is lit: a line the list leaves out can
 *  never light it. */
export function noticeLive(n: Notice): boolean {
  /* a line of his old squadron's, once he has moved (D2218 — noticeLeftBell, above) */
  if (noticeLeftBell(n)) return false
  /* ONE BIDDING LINE A STRETCH (M4 9.4): each month tapped in "Open for bidding" is its own command — a newer line of his
     about bidding on dates this one shares takes its place, as the holiday's lines do */
  const o = openOf(n)
  if (o) {
    /* (the lines his bell works out count too: a stretch that ENDED replaces the line that opened it) */
    for (const x of allNoticesFor(n.to)) {
      if (x === n || x.to !== n.to || !(x.at > n.at || (x.at === n.at && x.id > n.id))) continue
      const y = openOf(x)
      if (y && y.a <= o.b && o.a <= y.b) return false
    }
    return true
  }
  /* AN "AGAIN" LINE STANDS WITH THE LINE IT REPEATS (the fixes' M9 — the Opus read's 5; D1216): a Redo's "LL approved again"
     is the follow-up's own line, not the step's, so the next Undo cannot take it; it is shown only while the line it
     repeats is held (the decision stands), and only the newest "again" of that line */
  const w: any = (n.what || [])[0]
  /* HIS SANS LINE WHOSE "HIDDEN" WORDS ARE NO LONGER TRUE (D2394 Q6): see sansBackLeft */
  if (w && w.k === 'sansback' && !sansBackLeft(n)) return false
  if (w && w.k === 'lw' && w.again && w.ref) {
    if (!NOTICES.some(x => x.id === w.ref)) return false
    for (const x of NOTICES) {
      const y: any = x === n || x.to !== n.to ? null : (x.what || [])[0]
      if (y && y.k === 'lw' && y.again && y.ref === w.ref && (x.at > n.at || (x.at === n.at && x.id > n.id))) return false
    }
    return true
  }
  /* A POSTING'S LINE IS A SCHEDULER'S, as a holiday's is (below): it is addressed to an admin and its tap opens Admin →
     Users, so with his member view on (D292) it is neither listed nor counted, and is there again, read or unread as he
     left it, when he switches back */
  if (w && (w.k === 'po' || w.k === 'poback')) return mayEditSched()
  const h = holOf(n)
  if (!h) return true
  /* A SCHEDULER'S LINE, AND ONLY WHILE HE IS ONE (the check's walk, E8 — 13 Oct 26; owner D785, with the reading told to
     him: "the admin's own member view (D292) is a member for as long as it is on"). The notice is addressed to an admin,
     but the list it opens is a scheduler's (ui/OilDayList.tsx refuses anyone else): with the member view on, the bell
     listed the line, stayed lit by it, and a tap on it closed the bell's list and opened nothing. Asked here, in the
     one body, so the list, the unread count and the bell's own tap all agree; switched back, the line is there again,
     unread or read as he left it. */
  if (!mayEditSched()) return false
  const s = noticeSpan(n)
  if (!s || noticeLeft(n) <= 0) return false
  /* ONE LINE A HOLIDAY: a NEWER notice of his whose days, as the holiday stands, hold all of this one's has taken its
     place — the same dates made a holiday twice (A7), a holiday lengthened (the newer one covers more), one taken
     away and made again over fewer days (this one's live days have shrunk to the newer one's). Never on mere overlap:
     days only the older one covers would lose their line. And only a line of the SAME squadron (the blind read's R4;
     D2195, D2202): an admin holding Plan of 149 has 149's line and his own 142's, and 142's holiday on the same day is
     another squadron's holiday, never a newer copy of 149's. */
  for (const x of NOTICES) {
    if (x === n || x.to !== n.to || !(x.at > n.at || (x.at === n.at && x.id > n.id))) continue
    const o = noticeSpan(x)
    if (o && o.u === s.u && o.a <= s.a && s.b <= o.b) return false
  }
  return true
}
/** the holiday line that covers this date for this person, if one is live — the bell's tap asks it (ui/topstate.ts bellTap) */
export function holidayLineOn(pid: string | null | undefined, iso: string): Notice | null {
  if (!pid) return null
  for (const n of NOTICES) { const s = n.to === pid ? noticeSpan(n) : null; if (s && s.a <= iso && iso <= s.b && noticeLive(n)) return n }
  return null
}

/** is a holiday line OF THIS SQUADRON live on this date for ANY scheduler — "the schedulers' bells" (ui/OilDayList.tsx's
 *  foot). A scheduler with no line of his own (his sign-in was off when the holiday was made, or his account is newer) is
 *  still told the truth about the others' (the narrow read of 14 Oct 26, L2). Only the list's own squadron's lines count
 *  (the Plan audit's PB5, the blind read's R4; D2195): a 149 line never promises that what is left of 142's list goes to
 *  a bell — asked of the line's squadron, never of whose rights the reader holds. */
export function holidayLineAny(iso: string, unit: string): boolean {
  for (const n of NOTICES) { const s = noticeSpan(n); if (s && s.u === unit && s.a <= iso && iso <= s.b && noticeLive(n)) return true }
  return false
}

/* ---- the Leave War's lines (M4 batch 9) ---------------------------------------------------------------------- */
/** the name a war line is written under — the war's own business (bidding opened or closed, and its take-back) "Leave
 *  War", a man's leave "Your leave". ONE body: the line's writer (noticeWar) and the follow-up a restore owes
 *  (leavewar/sync.ts followUpsFor, which the commit gate compares a restore's follow-up with — fix read 6, fault B). */
export function warLineName(part: NoticePart): string {
  const p: any = part
  return p.k === 'lwopen' || (p.k === 'lwback' && (p.d === 'open' || p.d === 'close')) ? 'Leave War' : 'Your leave'
}
/** a war line, written inside the war command that made the change (leavewar/sync.ts) — never to whoever did it, never
 *  to a man who has left. Answers how many were made. */
export function noticeWar(to: readonly string[], by: string | null, part: NoticePart, at: number = Date.now()): number {
  const p: any = part
  const name = warLineName(part)
  let made = 0
  for (const who of new Set(to.map(String))) {
    if (!here(who) || (by != null && who === by)) continue
    const id = mint(at)
    NOTICES.push({ id, to: who, by, at, iid: '', name, day: String(p.a), what: [part] })
    noteWarMade(id)
    made++
  }
  return made
}
/* ---- a posting out that ran ([POSTOUT-RUN-NOTICE]) ---------------------------------------------------------- */
/** THE POSTING'S LINES — one an admin, pushed INSIDE the posting pass's own command (leavewar/sync.ts runPoOutcomes, the
 *  scheduler store enlisted), so a refused pass tells nobody; once made it stays as the record that the posting ran (the top
 *  bar's Undo never takes a posting back — D350). `to` — every admin who can sign in (D1547: "each admin's bell"), the man
 *  himself left out by the caller; a man no longer here is told nothing. Answers how many were made. */
export function noticePosting(to: readonly string[], who: string, o: PoOutcome, day: string, acct: boolean, at: number = Date.now()): number {
  const p: any = PEOPLE[who]
  const part: NoticePart = acct && o === 'overseas' ? { k: 'po', who, o, acct: true } : { k: 'po', who, o }
  let made = 0
  for (const t of new Set(to.map(String))) {
    if (!here(t)) continue
    const id = mint(at)
    NOTICES.push({ id, to: t, by: null, at, iid: '', name: p && p.cs ? String(p.cs) : who, day, what: [part] })
    noteWarMade(id)
    made++
  }
  return made
}
/** A POSTING'S LINE TAKEN BACK ([NOTICE-UNDO-RETRACT] step 1 — D1693, D1699): one line to an admin who had read the
 *  posting's line, pushed INSIDE the posting sheet's "Undo post out" command (leavewar/sync.ts retractPostingLines), by the
 *  admin who pressed it — never to him. Its words: the posting's own, struck, then "taken back · Saber" (noticeWords). */
export function noticePostingBack(to: string, by: string | null, who: string, o: PoOutcome, day: string, acct: boolean, at: number = Date.now()): boolean {
  if (!here(to) || (by != null && to === by)) return false
  const p: any = PEOPLE[who]
  const part: NoticePart = acct && o === 'overseas' ? { k: 'poback', who, o, acct: true } : { k: 'poback', who, o }
  const id = mint(at)
  NOTICES.push({ id, to, by, at, iid: '', name: p && p.cs ? String(p.cs) : who, day, what: [part] })
  noteWarMade(id)
  return true
}
/** HIS SANS POSTING OR TICK CHANGED (D2391, with D1693, D1710): one line to him, pushed INSIDE the change's own command
 *  (leavewar/sansunfiled.ts sansTakeBack), by the admin who did it — never to him. `day` — the posting's date, or the day
 *  of the untick; `said` — what changed (`how`, the new date `to`, `back` for an untick's "taken back"). */
export function noticeSansBack(to: string, by: string | null, days: readonly string[], day: string, at: number = Date.now(), hid: readonly string[] = [],
  said: { how?: SansBackHow; to?: string; back?: true; over?: string[]; kept?: true; again?: true; ref?: string } = {}): boolean {
  if (!here(to) || (by != null && to === by)) return false
  const id = mint(at)
  NOTICES.push({ id, to, by, at, iid: '', name: 'Your SANS availability', day, what: [{ k: 'sansback', days: [...days], ...(hid.length ? { hid: [...hid] } : {}), ...said }] })
  noteWarMade(id)
  return true
}
/* THE DAYS A LINE SAYS ARE HIDDEN THAT STILL ARE (D2394 Q6): a day he is SANS on again shows and counts again by itself
   (D2341), so the line stops naming it. Read from his record as it stands, never stored. */
/* …and still filed: a filing taken away since (an Undo, a delete) is not "hidden" any more — it is gone. Asked of the war's
   side (leavewar/sansunfiled.ts sansFiledOn, installed by its wiring), which reads the records; none installed, every day
   named is taken as still filed. */
let SANS_FILED: ((pid: string, iso: string) => boolean) | null = null
export function setSansFiledProbe(fn: ((pid: string, iso: string) => boolean) | null): void { SANS_FILED = fn }
// any: a part read from a stored line, its fields unchecked until here; the engine's person record is untyped
function sansStillHidden(to: string, p: any): string[] {
  const person: any = PEOPLE[to]
  return (Array.isArray(p?.hid) ? sansDays({ days: p.hid }) : []).filter(d => !sansOnP(person, d) && (!SANS_FILED || SANS_FILED(to, d)))
}
/* IS ANYTHING OF THIS LINE LEFT TO SAY? (D2394 Q6 — "the line with it if nothing is left"; the coordinator's reading 3: the
   hidden sentence goes once none of its days is hidden, and the line with it unless something else is owed — a reminder
   he had read (`days`, or `kept` from a line this one replaced).) A line a later one replaced (`over`) no longer shows.
   A "taken back" stays. */
function sansBackLeft(n: Notice): boolean {
  // any: a notice part is read by its kind
  const p: any = (n.what || [])[0]
  if (p.back) return true
  /* (a Redo's line tells again what its line said: it stands only while that line does, and stands in its place) */
  if (p.again && !NOTICES.some(x => x.id === p.ref)) return false
  if (NOTICES.some(x => {
    const q: any = x.to === n.to ? (x.what || [])[0] : null
    return !!q && q.k === 'sansback' && ((q.over as unknown[] | undefined)?.includes(n.id) || (q.again && q.ref === n.id))
  })) return false
  if (Array.isArray(p.hid) && p.hid.length > 0 && sansStillHidden(n.to, p).length > 0) return true
  return !!p.how && (sansDays(p).length > 0 || !!p.kept)
}
/** the posting a line is about, or null — the bell's tap asks it (ui/topstate.ts openNotice) */
export function postOf(n: Pick<Notice, 'what'>): { who: string; o: PoOutcome; acct: boolean } | null {
  const p: any = (n.what || [])[0]
  return p && (p.k === 'po' || p.k === 'poback') ? { who: String(p.who), o: p.o as PoOutcome, acct: !!p.acct } : null
}
/* what the outcome did, in the past (D1690 — the drawing of record docs/mock/2026-11-05-postout-bell/, picture 2b): the
   sheet's own line (leavewar/ui/outcomewords.ts) said as done. A Delete reads "deleted" whether or not he held a sign-in
   (D1690's words — his account goes with him) */
const PO_DID: Record<PoOutcome, (acct: boolean) => string> = {
  overseas: acct => (acct ? 'archived, account suspended' : 'archived'),
  delete: () => 'deleted',
  sans: () => 'now SANS',
  none: () => 'off the manpower',
}

/** is this one of the war's lines? */
export const isWarNotice = (n: Pick<Notice, 'what'>): boolean => { const k = (n.what || [])[0]?.k; return k === 'lw' || k === 'lwopen' || k === 'lwback' }
const openOf = (n: Notice): { a: string; b: string } | null => { const p: any = (n.what || [])[0]; return p && p.k === 'lwopen' ? { a: String(p.a), b: String(p.b || p.a) } : null }

/* THE LINES EACH PERSON'S BELL WORKS OUT FOR ITSELF (M4 9.4 — D1214, the register's P7: a stretch that ends because its
   last date passes closes bidding too). No command runs on that date, so the line is not stored: the war says which
   stretches have ended (leavewar/sync.ts, from the stored periods) and each one is a line of a steady id, read like any
   other. None installed (a scheduler-only test): none. */
let DERIVED: ((pid: string) => Notice[]) | null = null
export function setDerivedNotices(fn: ((pid: string) => Notice[]) | null): void { DERIVED = fn }
/** every notice addressed to this person — the stored ones and the ones his bell works out */
export function allNoticesFor(pid: string): Notice[] {
  const own = NOTICES.filter(n => n.to === pid)
  return DERIVED ? [...own, ...DERIVED(pid)] : own
}

/* ---- reading them --------------------------------------------------------------------------------------------- */
const LIST_MAX = 30
/** one person's notices, newest first — the bell's list (a holiday's line with nothing left to answer is left out
 *  BEFORE the thirty are cut, so it never takes a place from a notice he should see) */
export function noticesFor(pid: string | null | undefined): Notice[] {
  if (!pid) return []
  /* …and a LIVE HOLIDAY LINE IS NEVER ONE OF THE LINES CUT (the Opus read of the finished code, F4 — 13 Oct 26): the
     bell's tap leaves a scheduler's own unanswered input on that day to this line (ui/topstate.ts bellTap), so with
     more than thirty newer notices the line was cut from the list while the tap still deferred to it — his own
     question, and the one list, could no longer be reached from his bell. The thirty are of the other notices. */
  let others = 0
  return allNoticesFor(pid).filter(n => noticeLive(n)).sort((x, y) => y.at - x.at || (x.id < y.id ? 1 : -1)).filter(n => holOf(n) != null || others++ < LIST_MAX)
}

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/* '2026-07-15' → 'Wed 15 Jul' — worked out from the date's own numbers, never through a time zone */
export function noticeDay(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '')
  if (!m) return ''
  const y = +m[1]!, mo = +m[2]!, d = +m[3]!
  return `${DOW[new Date(Date.UTC(y, mo - 1, d)).getUTCDay()]} ${d} ${MON[mo - 1]}`
}
/* a run of dates, as a line's or a window's heading says it: 'Fri 17 Jul'; 'Mon 20 – Tue 21 Jul'; across two months
   'Fri 31 Jul – Sat 1 Aug' */
export function noticeRun(a: string, b?: string | null): string {
  const A = noticeDay(a)
  if (!b || b === a) return A
  const B = noticeDay(b)
  return a.slice(0, 7) === b.slice(0, 7) ? `${A.replace(/ [A-Za-z]{3}$/, '')} – ${B}` : `${A} – ${B}`
}
const cs = (id: string): string => { const p: any = PEOPLE[id]; return p && p.cs ? String(p.cs) : String(id) }
const names = (who: readonly string[]): string => (who.length <= 2 ? who.map(cs).join(', ') : `${who.length} people`)
/* A Leave War code in a bell line (his D1525, 30 Oct 26): its letters, then its half as AM / PM — "LL (AM)" — from the
   stored grammar ("*LL" a morning, "LL*" an afternoon), a whole day the code alone. Only leave rides these lines, never an
   app-credited OIL, so the star here is always the half (the war's own fold is leavewar/engine/codes.ts codeInWords). */
const lwCode = (c: string): string => {
  const t = String(c ?? '').trim()
  if (t.startsWith('*')) return `${t.slice(1)} (AM)`
  if (t.endsWith('*')) return `${t.slice(0, -1)} (PM)`
  return t
}
function partWords(p: NoticePart): string {
  switch (p.k) {
    case 'del': return 'Deleted'
    case 'in': return 'You were added'
    case 'out': return 'You were taken off'
    case 'cx': return p.why ? `Cancelled — ${p.why}` : 'Cancelled'
    case 'uncx': return 'Un-cancelled'
    case 'off': return 'Taken off the programme'
    case 'on': return 'Back on the programme'
    case 'unav': return 'Filed under Unavailable'
    case 'unavoff': return 'Taken out of Unavailable'
    case 'rbid': return `replaces your ${lwCode(p.c)} bid`
    case 'when': {
      const days = p.a ? (p.b && p.b !== p.a ? `${noticeDay(p.a)} – ${noticeDay(p.b)}` : noticeDay(p.a)) : ''
      return 'Now ' + [days, p.t || ''].filter(Boolean).join(' ')
    }
    case 'add': return `${names(p.who)} added`
    case 'rem': return `${names(p.who)} taken off`
    case 'title': return `Renamed — was ${p.was}`
    case 'rmk': return 'Remark changed'
    /* (its count is the line's own, read live: noticeWords) */
    case 'oilhol': return 'Inputs need an OIL answer'
    case 'lw': {
      const c = lwCode(p.c)
      const to = p.to ? noticeRun(p.to, p.tb) : ''
      switch (p.d) {
        case 'approved': return p.again ? `${c} approved again` : `${c} approved`
        case 'refused': return p.again ? `${c} refused again` : `${c} refused`
        case 'repend': return `${c} back to pending`
        case 'putback': return p.again ? `${c} put back to a bid again` : `${c} put back to a bid`
        case 'moved': return `${c} moved to ${to}`
        case 'deleted': return `${c} deleted`
        case 'added': return p.again ? `${c} added and approved again` : `${c} added and approved`
        case 'bidmoved': return `${c} bid moved to ${to}`
        case 'biddel': return `${c} bid deleted`
        /* his D1460: what a pending bid of his was changed to, by someone else */
        case 'retyped': return `${lwCode(p.w || '')} bid changed to ${c}`
      }
      return c
    }
    case 'po': return `Posted out · ${PO_DID[p.o] ? PO_DID[p.o](!!p.acct) : 'off the manpower'}`
    /* "Bidding" with a capital, as his drawing writes it (his D1433, 27 Oct 26) */
    case 'lwopen': return p.end ? 'Bidding closed · its dates ended' : p.open ? 'Bidding open' : 'Bidding closed'
    /* a taken-back line's own words are "taken back"; what it took back is said struck through beside them (backWords) */
    case 'lwback': return 'taken back'
    case 'poback': return 'taken back'
    /* (only an untick line's "taken back" reads so — D1693; every other SANS line has its own words: sansBackWords) */
    case 'sansback': return 'taken back'
    /* (his own words, D2340, D2390 — the old "Planned, no availability filed" was not clear, D2342) */
    case 'sansdue': return `You're planned on ${sansDaysWords(sansDays(p))} with nothing filed. Tap to file for availability.`
  }
}
/* HIS SANS DAYS, AS THE LINE'S DATE (D2338): the first three named, each month once at the end of its run of days, as the
   bell writes a run of dates — "Sat 18 Jul"; "Fri 17, Sat 18 Jul"; across two months "Fri 31 Jul, Sat 1 Aug" */
const SANS_DAYS_NAMED = 3
/* A SANS-DAYS LINE'S DAYS, READ AS THE APP WRITES THEM: ISO date strings only (chat 147's two code reads: a stored line
   whose `days` was a word or a list of numbers broke the whole bell's words, and the bell has no error boundary). The
   gate refuses such a line (state/perms.ts lineMalformed); this is the second wall, so no stored line can throw here. */
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/
// any: a part read from a stored line, its fields unchecked until here
function sansDays(p: any): string[] {
  return p && Array.isArray(p.days) ? p.days.filter((d: unknown): d is string => typeof d === 'string' && ISO_DAY.test(d)) : []
}
/* (past three, "and 2 more" after the dates, part of the list — chat 147's rewording, the agent's reading of D2342) */
export function sansDaysWords(days: readonly string[]): string {
  const shown = days.slice(0, SANS_DAYS_NAMED), more = days.length - shown.length
  return shown.map((d, i) => { const w = noticeDay(d); const next = shown[i + 1]; return next && next.slice(0, 7) === d.slice(0, 7) ? w.replace(/ [A-Za-z]{3}$/, '') : w }).join(', ')
    + (more > 0 ? ` and ${more} more` : '')
}
/** the first of a SANS-days line's days, or null — the bell's tap asks it (ui/topstate.ts openNotice); a taken-back one
 *  opens what the line opened (D1693) */
export function sansDueOf(n: Pick<Notice, 'what'>): string | null {
  const p: any = (n.what || [])[0]
  const days = p && (p.k === 'sansdue' || p.k === 'sansback') ? sansDays(p) : []
  /* (a taken-back line with nothing struck opens the first day it says is hidden — D2341) */
  const hid = p && p.k === 'sansback' && Array.isArray(p.hid) ? sansDays({ days: p.hid }) : []
  return days.length ? days[0]! : hid.length ? hid[0]! : null
}
/* a bidding stretch said without its weekdays — "1 Apr – 30 Jun" (D1214's words) */
function stretchWords(a: string, b: string): string {
  const d = (iso: string) => `${+iso.slice(8, 10)} ${MON[+iso.slice(5, 7) - 1]}`
  return a === b ? d(a) : `${d(a)} – ${d(b)}`
}
/* WHAT A TAKEN-BACK LINE TOOK BACK (his D1699, 5 Nov 26 — "If the post out was taken back shouldn't it show that it's
   striked out?"): the words the line it replaces said, drawn struck through before "taken back · Saber" — "~~LL approved~~
   · taken back · Saber", "~~Posted out · now SANS~~ · taken back · Saber". Rebuilt from the part itself, so the words are
   always the original line's own (one body: partWords). A move made before its line kept where it took the leave reads
   "LL moved" — demo data only (D56). */
function backWords(p: NoticePart): string {
  if (p.k === 'poback') return partWords({ k: 'po', who: p.who, o: p.o, ...(p.acct ? { acct: true as const } : {}) })
  if (p.k !== 'lwback') return ''
  if (p.d === 'open' || p.d === 'close') return partWords({ k: 'lwopen', a: p.a, b: p.b, open: p.d === 'open' })
  if (p.d === 'moved' || p.d === 'bidmoved') {
    if (!p.to) return `${lwCode(p.c || '')} ${p.d === 'moved' ? 'moved' : 'bid moved'}`
  }
  return partWords({ k: 'lw', c: p.c || '', a: p.a, b: p.b, d: p.d, ...(p.w ? { w: p.w } : {}), ...(p.to ? { to: p.to, tb: p.tb } : {}) })
}
/* HIS SANS POSTING OR TICK CHANGED, IN HIS WORDS (D2391's A–E, as drawn: docs/mock/2026-11-24-sans-words/): a bold title,
   who did it beside it in the bell's day style, then one sentence, which names only the days still hidden (D2394 Q6) */
// any: a part read from a stored line, its fields unchecked until here
function sansBackWords(n: Notice, p: any): { name: string; day: string; what: string; who: string; nameStruck?: boolean } {
  const who = n.by ? cs(n.by) : ''
  const title = (): string => {
    const to = typeof p.to === 'string' && ISO_DAY.test(p.to) ? noticeDay(p.to) : ''
    switch (p.how as SansBackHow) {
      case 'later': case 'earlier': return `Your SANS date moved to ${to}.`
      case 'untick': return "You're no longer SANS."
      default: return "You're no longer posted out as SANS."
    }
  }
  /* the "taken back" of an untick line he had read (D1693, D1699): its own title struck through */
  if (p.back) return { name: title(), nameStruck: true, day: '', what: 'taken back', who }
  const hid = sansStillHidden(n.to, p)
  /* (a line written before D2391: the sentence it always had, or nothing) */
  if (!p.how) return { name: n.name, day: '', what: hid.length ? `Your SANS availability for ${sansDaysWords(hid)} is hidden while you're not SANS ${hid.length === 1 ? 'that day' : 'those days'}.` : '', who }
  const list = sansDaysWords(hid), that = hid.length === 1 ? 'that day' : 'those days'
  const back = `It comes back if you're SANS ${that} again.`
  const body = !hid.length ? ''
    /* (moved earlier hides nothing by itself; a day it names here was carried from a line it replaced, and is before his date) */
    : p.how === 'later' || p.how === 'earlier' ? `You're active until then, so the SANS availability you filed for ${list} is hidden. ${back}`
    : p.how === 'other' ? `The SANS availability you filed for ${list} is hidden while you're not SANS ${that}.`
    : `You're active again, so the SANS availability you filed for ${list} is hidden. ${back}`
  return { name: title(), day: who ? `· ${who}` : '', what: body, who: '' }
}
/** A LINE OF THE LIST, IN THE SHORTER WORDING (D769): the input and its date; what happened — the first two things,
 *  where a save changed several — and who did it ('' where the app did). */
export function noticeWords(n: Notice): { name: string; day: string; what: string; who: string; struck?: string; nameStruck?: boolean; more?: string } {
  /* A HOLIDAY'S LINE (D783 (6) — the picture of record, docs/mock/2026-10-12-oil-notify/*-hol-6-bell.png): the holiday
     and its date(s); how many inputs are LEFT to answer, counted now; who made it a holiday */
  const h = holOf(n)
  if (h) {
    const left = noticeLeft(n), s: HolidaySpan = noticeSpan(n) || h
    /* (its name as the holiday is called NOW — a holiday renamed since its notice was made is not called by its old name) */
    return { name: (s.name != null ? s.name : n.name) || 'Public holiday', day: noticeRun(s.a, s.b), what: left === 1 ? '1 input needs an OIL answer' : `${left} inputs need an OIL answer`, who: n.by ? cs(n.by) : '' }
  }
  /* THE WAR'S LINES (M4 batch 9): "Your leave · Mon 19 – Wed 21 Jan · LL approved · Saber"; "Leave War · 1 Apr – 30 Jun ·
     bidding open · Saber" */
  const w: any = (n.what || [])[0]
  if (w && (w.k === 'lw' || w.k === 'lwopen' || w.k === 'lwback')) {
    const bidding = w.k === 'lwopen' || (w.k === 'lwback' && (w.d === 'open' || w.d === 'close'))
    return { name: n.name, day: bidding ? stretchWords(w.a, w.b || w.a) : noticeRun(w.a, w.b), what: partWords(w), who: n.by ? cs(n.by) : '', ...(w.k === 'lwback' ? { struck: backWords(w) } : {}) }
  }
  /* A POSTING'S LINE (D1690 — picture 2b): the man in bold, by his callsign of today (a deleted man keeps his record, so
     his name still reads), the posting's date; "Posted out · archived, account suspended"; nobody named */
  if (w && w.k === 'po') {
    const p: any = PEOPLE[String(w.who)]
    return { name: p && p.cs ? String(p.cs) : n.name, day: noticeDay(n.day), what: partWords(w), who: '' }
  }
  /* …and taken back (D1699): "Ranger · Mon 16 Nov / ~~Posted out · now SANS~~ · taken back · Saber" */
  if (w && w.k === 'poback') {
    const p: any = PEOPLE[String(w.who)]
    return { name: p && p.cs ? String(p.cs) : n.name, day: noticeDay(n.day), what: partWords(w), who: n.by ? cs(n.by) : '', struck: backWords(w) }
  }
  /* HIS SANS DAYS WITH NOTHING FILED (D2338), IN HIS OWN WORDS (D2340, D2342 — "The wording is not clear"; D2390): one
     plain sentence, "You're SANS from Fri 17 Jul. / You're planned on Sat 18, Mon 20 Jul with nothing filed. Tap to file
     for availability."; a man with no SANS date ahead, "Your SANS availability is needed." over the same (D2394 2b);
     nobody named — the app worked it out */
  if (w && w.k === 'sansdue') {
    const from = typeof w.from === 'string' && ISO_DAY.test(w.from) ? w.from : ''
    return { name: from ? `You're SANS from ${noticeDay(from)}.` : 'Your SANS availability is needed.', day: '', what: partWords(w), who: '' }
  }
  if (w && w.k === 'sansback') return sansBackWords(n, w)
  /* (a bid it replaced on the Leave War is said after the rest, never cut by the first-two rule — M4 9.3a: "You were added ·
     replaces your LL bid") */
  const rb = (n.what || []).filter(p => p.k === 'rbid')
  const main = (n.what || []).filter(p => p.k !== 'rbid').slice(0, 2).map(partWords).join(', ')
  const tail = rb.length ? `replaces your ${[...new Set(rb.map(p => lwCode((p as any).c)))].join(', ')} bid` : ''
  return { name: n.name, day: noticeDay(n.day), what: main && tail ? `${main} · ${tail}` : main || tail, who: n.by ? cs(n.by) : '' }
}

/** its age, at the line's right: now · 2 min · 1 h · yesterday · 2 d */
export function noticeAge(n: Pick<Notice, 'at'>, now: number = Date.now()): string {
  /* (a line dated a moment still to come — his SANS-days line, dated his posting's date while it waits for it, D2340 — has
     no age to print) */
  if (n.at > now) return ''
  const ms = Math.max(0, now - n.at), min = Math.floor(ms / 60_000)
  if (min < 1) return 'now'
  if (min < 60) return `${min} min`
  const a = new Date(n.at), b = new Date(now)
  const days = Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86_400_000)
  if (days < 1 || ms < 12 * 3_600_000) return `${Math.floor(min / 60)} h`
  return days === 1 ? 'yesterday' : `${days} d`
}
