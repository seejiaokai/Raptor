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
import { dateOrd, inpLabel, namedOf, placeholderOf } from '../engine/inputs'
import { hhmm } from '../engine/time'

export type NoticePart =
  | { k: 'del' }                                   // the input was deleted
  | { k: 'in' }                                    // HE was put in it (or it was filed for him)
  | { k: 'out' }                                   // HE was taken out of it
  | { k: 'cx'; why?: string }                      // cancelled, with its reason (D760)
  | { k: 'uncx' }                                  // brought back
  | { k: 'off' } | { k: 'on' }                     // taken off the programme / put back on it
  | { k: 'when'; a?: string; b?: string; t?: string }   // what it is NOW: its day(s) where they moved, its hours where they did
  | { k: 'add'; who: string[] }                    // others put in — ids; a placeholder is one of them
  | { k: 'rem'; who: string[] }                    // others taken out
  | { k: 'title'; was: string }                    // renamed
  | { k: 'rmk' }                                   // its remark changed

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
/* the remark as a person typed it: the calendar's own "till 17 Jul" (engine/inputs.ts withRemarksTail) follows the
   dates, and a change of dates is already said as one */
const typed = (r: any): string => String(r.remarks || '').replace(/[\s,·—–-]*\btill \d{1,2} [A-Za-z]{3}(?: \d{4})?/gi, '').trim()
/* is he still someone the app can tell? */
const here = (p: string): boolean => { const x: any = PEOPLE[p]; return !!x && !x.deleted && !x.archived && !x.special }

/* what changed about the INPUT ITSELF, for someone who is in it before and after (or filed it) — in the order a reader
   needs it: is it still on, is it still when he thought, who is in it, what it is called */
function common(b: any, a: any, him: string): NoticePart[] {
  const out: NoticePart[] = []
  const why = String(a.cxr || '').trim()
  if (a.cx && (!b.cx || String(b.cxr || '').trim() !== why)) out.push(why ? { k: 'cx', why } : { k: 'cx' })
  else if (b.cx && !a.cx) out.push({ k: 'uncx' })
  if (b.acc !== 'r' && a.acc === 'r') out.push({ k: 'off' })
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

/* ---- reading them --------------------------------------------------------------------------------------------- */
const LIST_MAX = 30
/** one person's notices, newest first — the bell's list */
export function noticesFor(pid: string | null | undefined): Notice[] {
  if (!pid) return []
  return NOTICES.filter(n => n.to === pid).sort((x, y) => y.at - x.at || (x.id < y.id ? 1 : -1)).slice(0, LIST_MAX)
}

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/* '2026-07-15' → 'Wed 15 Jul' — worked out from the date's own numbers, never through a time zone */
export function noticeDay(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '')
  if (!m) return ''
  const y = +m[1]!, mo = +m[2]!, d = +m[3]!
  return `${DOW[new Date(Date.UTC(y, mo - 1, d)).getUTCDay()]} ${d} ${MON[mo - 1]}`
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
    case 'when': {
      const days = p.a ? (p.b && p.b !== p.a ? `${noticeDay(p.a)} – ${noticeDay(p.b)}` : noticeDay(p.a)) : ''
      return 'Now ' + [days, p.t || ''].filter(Boolean).join(' ')
    }
    case 'add': return `${names(p.who)} added`
    case 'rem': return `${names(p.who)} taken off`
    case 'title': return `Renamed — was ${p.was}`
    case 'rmk': return 'Remark changed'
  }
}
/** A LINE OF THE LIST, IN THE SHORTER WORDING (D769): the input and its date; what happened — the first two things,
 *  where a save changed several — and who did it ('' where the app did). */
export function noticeWords(n: Notice): { name: string; day: string; what: string; who: string } {
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
