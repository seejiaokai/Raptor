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
import { PEOPLE } from '../engine/people'
import { dateOrd, inpLabel, namedOf, placeholderOf, remarksTyped } from '../engine/inputs'
import { hhmm } from '../engine/time'
import { mayEditSched } from './perms'

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
  /* A DAY MADE A PUBLIC HOLIDAY AFTER WHAT STANDS ON IT WAS FILED ([OIL-ASK-NOTIFY] — owner D780: "There should be a notification
     to the schedulers to award oil on those inputs. And should not be silent."; D783 (6): "one bell line a holiday,
     counting only what is left unanswered, a tap opening the list"). ITS OWN KIND OF NOTICE: it is about no one input
     (`iid` is ''), `name` is the holiday's and `day` its first day; `a`..`b` is the run of dates that became non-working.
     IT STORES NO COUNT — how many inputs still need an answer is read live when the bell draws (noticeWords), so what
     an admin answers tells nobody (D781), and a line with nothing left is not listed at all (noticeLive). */
  | { k: 'oilhol'; a: string; b: string }

export interface Notice {
  id: string
  to: string
  by: string | null
  at: number
  iid: string
  name: string
  day: string
  what: NoticePart[]
}

/* the live list — restored IN PLACE by the snapshot (state/history.ts), like the inputs and the planning notes */
export const NOTICES: Notice[] = []

/* ---- working one out ------------------------------------------------------------------------------------------ */
const ids = (r: any): string[] => namedOf(r).map((e: any) => String(e.p))
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
function common(b: any, a: any, him: string): NoticePart[] {
  const out: NoticePart[] = []
  const why = String(a.cxr || '').trim()
  if (a.cx && (!b.cx || String(b.cxr || '').trim() !== why)) out.push(why ? { k: 'cx', why } : { k: 'cx' })
  else if (b.cx && !a.cx) out.push({ k: 'uncx' })
  /* A FILING UNDER UNAVAILABLE IS NOT THE PROGRAMME (owner D815, 13 Oct 26). These two knew only "taken off" against
     everything else, so an Other filed with "→ Unavail" told its man "Back on the programme", and taken out again
     "Taken off the programme" — it was on neither. Asked FIRST; the two lines below keep their meaning. */
  if (a.acc === 'u' && b.acc !== 'u') out.push({ k: 'unav' })
  else if (b.acc === 'u' && a.acc === 'r') out.push({ k: 'unavoff' })
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
  if (typed(b) !== typed(a)) out.push({ k: 'rmk' })
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
      if (!after || b.type !== a.type || !ids(b).includes(mine[0]!) || ids(after).includes(mine[0]!)) continue
      return b
    }
    return null
  }
  let made = 0
  const tell = (to: string, r: any, what: NoticePart[]) => {
    if (!what.length || to === o.actor || !here(to)) return
    NOTICES.push({ id: mint(at), to, by, at, iid: String(r.iid), name: String(inpLabel(r)), day: firstDay(r), what })
    made++
  }
  const split = new Map<string, string>()             // old input id → the man split out of it, told under his new one
  for (const [iid, a] of now) {
    if (before.has(iid)) continue
    /* a leave the Leave War approved is told by the war's own page; nothing here */
    if (a.lw) continue
    const from = splitFrom(a)
    /* (who else was in the shared one is no change to HIS part: only what his own input now says differently) */
    if (from) { const him = ids(a)[0]!; split.set(String(from.iid), him); tell(him, a, common(from, a, him).filter(x => x.k !== 'add' && x.k !== 'rem')); continue }
    for (const p of ids(a)) tell(p, a, [{ k: 'in' }])
  }
  for (const [iid, b] of before) {
    const a = now.get(iid)
    const was = ids(b)
    if (!a) {
      for (const p of new Set([...was, b.by != null ? String(b.by) : ''])) if (p) tell(p, b, [{ k: 'del' }])
      continue
    }
    const is = ids(a)
    const everyone = new Set<string>([...was, ...is, b.by != null ? String(b.by) : '', a.by != null ? String(a.by) : ''])
    let shared: NoticePart[] | null = null
    for (const p of everyone) {
      if (!p) continue
      if (was.includes(p) && !is.includes(p)) { if (split.get(iid) !== p) tell(p, a, [{ k: 'out' }]); continue }
      if (!was.includes(p) && is.includes(p)) { tell(p, a, [{ k: 'in' }]); continue }
      /* in it before and after, or its filer: what changed about the input — the same words for each of them (nobody
         who reaches here was put in or taken out, so nobody is in the lists of who was) */
      tell(p, a, shared || (shared = common(b, a, p)))
    }
  }
  return made
}

/* ---- a day made a holiday ([OIL-ASK-NOTIFY]) ------------------------------------------------------------------- */
/** THE HOLIDAY'S NOTICES — one a scheduler, pushed INSIDE the command that made the day a holiday (leavewar/sync.ts
 *  tellHoliday, through the scheduler store's own input command), so that command's Undo takes them away and its Redo
 *  puts them back. `to` — every scheduler, the one who made the holiday too: what he leaves for "Later" is on his own
 *  bell as well. Answers how many were made. */
export function noticeHoliday(to: readonly string[], by: string | null, name: string, a: string, b: string, at: number = Date.now()): number {
  let made = 0
  for (const p of new Set(to.map(String))) {
    if (!here(p)) continue
    NOTICES.push({ id: mint(at), to: p, by, at, iid: '', name, day: a, what: [{ k: 'oilhol', a, b }] })
    made++
  }
  return made
}
/* how many inputs on a run of dates still need an OIL answer — the Leave War's to say (leavewar/sync.ts oilOpenOn),
   handed over by the sync's wiring so state/ never imports the war (the inputgate-hook way). No reader installed (a
   scheduler-only test): nothing is left. */
let HOL_LEFT: ((a: string, b: string) => number) | null = null
export function setHolidayLeft(fn: ((a: string, b: string) => number) | null): void { HOL_LEFT = fn }
const holOf = (n: Notice): { a: string; b: string } | null => { const p: any = (n.what || [])[0]; return p && p.k === 'oilhol' ? { a: String(p.a), b: String(p.b || p.a) } : null }
/* THE DAYS OF A NOTICE'S RUN THAT ARE STILL A HOLIDAY — read from the war as it stands, the same way as the count (the
   two code reads of the finished code, 13 Oct 26 — Fable F1, the Opus read F3). A notice keeps the dates as they were
   when it was made; a holiday is then shortened, lengthened, or taken away and made again over other dates, and a line
   that printed its STORED dates named days that were working days again, or stood beside a second line for the same
   holiday. So the stored run is only where to look: what the line says, what it counts, which day it covers and which
   list it opens are all its days that are a holiday NOW. No reader installed: the run as stored. */
export type HolidaySpan = { a: string; b: string; /** the holiday's own name NOW ('' — none of its own); absent where no reader is installed */ name?: string }
let HOL_SPAN: ((a: string, b: string) => HolidaySpan | null) | null = null
export function setHolidaySpan(fn: ((a: string, b: string) => HolidaySpan | null) | null): void { HOL_SPAN = fn }
/** a holiday notice's dates — and its name — as the holiday stands now; null for any other notice, and where no day of it is a holiday any more */
export function noticeSpan(n: Notice): HolidaySpan | null { const h = holOf(n); return !h ? null : HOL_SPAN ? HOL_SPAN(h.a, h.b) : h }
/** how many inputs a holiday's notice still counts (0 for any other notice) */
export function noticeLeft(n: Notice): number { const s = noticeSpan(n); return s && HOL_LEFT ? HOL_LEFT(s.a, s.b) : 0 }
/** IS THIS NOTICE ONE TO SHOW? Every notice about an input is. A holiday's is only while an input on its dates still
 *  needs an answer — and, where the same dates were made a holiday more than once (made, taken away, made again), only
 *  the NEWEST of them: one line a holiday (D783 (6); Fable's read of the plan, A7). ONE BODY, read by the bell's list,
 *  by what counts as unread (state/noticeseen.ts) and so by whether the bell is lit: a line the list leaves out can
 *  never light it. */
export function noticeLive(n: Notice): boolean {
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
     days only the older one covers would lose their line. */
  for (const x of NOTICES) {
    if (x === n || x.to !== n.to || !(x.at > n.at || (x.at === n.at && x.id > n.id))) continue
    const o = noticeSpan(x)
    if (o && o.a <= s.a && s.b <= o.b) return false
  }
  return true
}
/** the holiday line that covers this date for this person, if one is live — the bell's tap asks it (ui/topbits.tsx) */
export function holidayLineOn(pid: string | null | undefined, iso: string): Notice | null {
  if (!pid) return null
  for (const n of NOTICES) { const s = n.to === pid ? noticeSpan(n) : null; if (s && s.a <= iso && iso <= s.b && noticeLive(n)) return n }
  return null
}

/** is a holiday line live on this date for ANY scheduler — "the schedulers' bells" (ui/OilDayList.tsx's foot). A
 *  scheduler with no line of his own (his sign-in was off when the holiday was made, or his account is newer) is still
 *  told the truth about the others' (the narrow read of 14 Oct 26, L2). */
export function holidayLineAny(iso: string): boolean {
  for (const n of NOTICES) { const s = noticeSpan(n); if (s && s.a <= iso && iso <= s.b && noticeLive(n)) return true }
  return false
}

/* ---- reading them --------------------------------------------------------------------------------------------- */
const LIST_MAX = 30
/** one person's notices, newest first — the bell's list (a holiday's line with nothing left to answer is left out
 *  BEFORE the thirty are cut, so it never takes a place from a notice he should see) */
export function noticesFor(pid: string | null | undefined): Notice[] {
  if (!pid) return []
  /* …and a LIVE HOLIDAY LINE IS NEVER ONE OF THE LINES CUT (the Opus read of the finished code, F4 — 13 Oct 26): the
     bell's tap leaves a scheduler's own unanswered input on that day to this line (ui/topbits.tsx bellTap), so with
     more than thirty newer notices the line was cut from the list while the tap still deferred to it — his own
     question, and the one list, could no longer be reached from his bell. The thirty are of the other notices. */
  let others = 0
  return NOTICES.filter(n => n.to === pid && noticeLive(n)).sort((x, y) => y.at - x.at || (x.id < y.id ? 1 : -1)).filter(n => holOf(n) != null || others++ < LIST_MAX)
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
  }
}
/** A LINE OF THE LIST, IN THE SHORTER WORDING (D769): the input and its date; what happened — the first two things,
 *  where a save changed several — and who did it ('' where the app did). */
export function noticeWords(n: Notice): { name: string; day: string; what: string; who: string } {
  /* A HOLIDAY'S LINE (D783 (6) — the picture of record, docs/mock/2026-10-12-oil-notify/*-hol-6-bell.png): the holiday
     and its date(s); how many inputs are LEFT to answer, counted now; who made it a holiday */
  const h = holOf(n)
  if (h) {
    const left = noticeLeft(n), s: HolidaySpan = noticeSpan(n) || h
    /* (its name as the holiday is called NOW — a holiday renamed since its notice was made is not called by its old name) */
    return { name: (s.name != null ? s.name : n.name) || 'Public holiday', day: noticeRun(s.a, s.b), what: left === 1 ? '1 input needs an OIL answer' : `${left} inputs need an OIL answer`, who: n.by ? cs(n.by) : '' }
  }
  return { name: n.name, day: noticeDay(n.day), what: (n.what || []).slice(0, 2).map(partWords).join(', '), who: n.by ? cs(n.by) : '' }
}

/** its age, at the line's right: now · 2 min · 1 h · yesterday · 2 d */
export function noticeAge(n: Pick<Notice, 'at'>, now: number = Date.now()): string {
  const ms = Math.max(0, now - n.at), min = Math.floor(ms / 60_000)
  if (min < 1) return 'now'
  if (min < 60) return `${min} min`
  const a = new Date(n.at), b = new Date(now)
  const days = Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 86_400_000)
  if (days < 1 || ms < 12 * 3_600_000) return `${Math.floor(min / 60)} h`
  return days === 1 ? 'yesterday' : `${days} d`
}
