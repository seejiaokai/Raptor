/* THE SANS CALENDAR'S READING OF A DAY — pure: no DOM, no store writes (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.5; owner D617, D626, D627, D642, D648).

   IT WORKS NOTHING OUT ABOUT THE DAY. A day's class, its required pilots and WSOs, how many more are needed and its
   colour are the ONE resolver's answer (state/flyplan-model.ts planFor, reached through leavewar/sync.ts flyAnswer /
   flyMonth); who has committed is state/flyplan.ts sansCommittedOn. Two things are decided here and nowhere else:

   · WHAT A DATE PRINTS (sansCell): the sun or the moon, or the tag that takes its place — NF, or the Leave War's own
     short form for a public holiday or an Off day; the still-needed pair, pilots then WSOs — or nothing, where no
     figure is set or no leave period covers the date (the screen prints a dash); F, O and A as pairs of the SANS
     committed.
   · WHO AN OPENED DAY LISTS (sansDayGroups): EVERY commitment covering the date (D648 — no "+ more"), one line each,
     in three groups — WSOs to fly, pilots to fly, and those who offered only OFT or AMT. A man stands in ONE group:
     if any filing of his for the day offers flying he is "to fly", and every filing of his is listed with him — so a
     group's head-count is people, and equals the figure the date shows. A commitment of a man the count leaves out
     (no longer SANS, archived, not aircrew) is listed apart with the reason: the SANS calendar has no List (D620), so
     this window is the only place such a record can be reached and removed. */
import { INPUTS, inputCoversDate, isSansAvail, isLateInput, inputOwnDueISO, cutRuleText } from '../engine/inputs'
import { getCut } from '../state/cutoff'
import { PEOPLE } from '../engine/people'
import { hhmm } from '../engine/time'
import type { DayAnswer, Tone } from '../state/flyplan-model'
import { sansCommittedOn, sansDateLabel, type SansCommitted } from '../state/flyplan'
import { placedLine } from './placedline'

export interface Pair { p: number; w: number }
export interface SansCell {
  iso: string
  /** in place of the sun or moon: NF, or the holiday's short form — coloured by its kind */
  tag: { text: string; kind: 'nf' | 'ph' | 'off' } | null
  icon: 'day' | 'night' | null
  /** how many more are needed to fly, pilots and WSOs; a seat with no known figure is null; null = neither is known */
  need: { p: number | null; w: number | null } | null
  tone: Tone
  f: Pair; o: Pair; a: Pair
}
const pair = (s: { p: readonly string[]; w: readonly string[] }): Pair => ({ p: s.p.length, w: s.w.length })

export function sansCell(a: DayAnswer, short: string, c: SansCommitted): SansCell {
  const tag: SansCell['tag'] = a.kind ? { text: short || (a.kind === 'ph' ? 'PH' : 'OFF'), kind: a.kind }
    : a.cls === 'nf' ? { text: 'NF', kind: 'nf' } : null
  const known = a.need.p !== null || a.need.w !== null
  return {
    iso: a.iso, tag,
    icon: tag ? null : a.cls === 'day' ? 'day' : a.cls === 'night' ? 'night' : null,
    need: known ? { p: a.need.p, w: a.need.w } : null,
    tone: a.tone,
    f: pair(c.f), o: pair(c.o), a: pair(c.a),
  }
}

/** HIGHLIGHT (D619, D626): which of F, O and A the picked man offered on a date — null where he offered nothing, so
 *  the date wears no ring. Asked of the SAME lists the date's counts are made from, so a ringed day is always a day
 *  he is counted on. */
export function sansMine(c: SansCommitted, id: string | null): { f: boolean; o: boolean; a: boolean } | null {
  if (!id) return null
  const has = (s: { p: readonly string[]; w: readonly string[] }) => s.p.includes(id) || s.w.includes(id)
  const out = { f: has(c.f), o: has(c.o), a: has(c.a) }
  return out.f || out.o || out.a ? out : null
}
/** the SANS aircrew on the roster today, A to Z by callsign — who the Highlight list offers (the people the count
 *  itself takes: state/flyplan.ts sansCommittedOn) */
export function sansRoster(people: Record<string, any> = PEOPLE): string[] {
  return Object.keys(people)
    .filter(id => { const p = people[id]; return !!p && p.san && !p.archived && !p.deleted && !p.special && !p.pers && (p.seat === 'FCP' || p.seat === 'RCP') })
    .sort((a, b) => String(people[a].cs).localeCompare(String(people[b].cs)))
}

/** THE CUT-OFF LINE OF "HOW THIS WORKS" (D628: it "always states the cut-off as it is set"; D646: the rule only — no
 *  worked date, no "later is marked LATE"; "before the week" kept, so "two weeks before" has something to count
 *  from). The rule's own words are the engine's (engine/inputs.ts cutRuleText — the Logic page says the same); this
 *  only makes the sentence. A number of days reads "at least N days before": the last day on time is the Monday less
 *  N, so N days or more before the week is exactly it. */
export function cutSentence(set: 'sans' | 'inputs' = 'sans', verb = 'Commit'): string {
  const p = cutParts(set, verb)
  return p.before + p.cut + p.after
}
/** The same sentence in three pieces, so the fold can print THE CUT-OFF ITSELF IN BOLD (owner D691, 9 Oct 26 - "bold the
 *  late input date which is in this case Wednesday two weeks etc"): `cut` is the one thing a man must remember - "the
 *  end of the Wednesday two weeks before", "at least 3 days before" - and changes with the setting, as the sentence
 *  does (D628). One body, so the sentence a screen reads and the words it marks cannot drift apart. */
export function cutParts(set: 'sans' | 'inputs' = 'sans', verb = 'Commit'): { before: string; cut: string; after: string } {
  const c = getCut(set)
  if (c.mode === 1) return { before: `${verb} by `, cut: `the end of ${cutRuleText(set)}`, after: `${c.weeks > 1 ? ' the week' : ''}.` }
  if (c.lead > 0) return { before: `${verb} `, cut: `at least ${c.lead} day${c.lead === 1 ? '' : 's'} before`, after: ' the week starts.' }
  return { before: `${verb} by `, cut: `the end of ${cutRuleText(set)}`, after: '.' }
}

/** a commitment's hours, as the opened day prints them (D572: "show their available hours") */
export function hoursOf(r: any): string {
  if (!r || r.allday) return 'All day'
  if (r.half === 'am') return 'AM'
  if (r.half === 'pm') return 'PM'
  return `${hhmm(r.s ?? 0)}–${hhmm(r.e ?? 0)}`
}
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/** '2026-10-07' → 'Wed 7 Oct' */
export function dayWord(iso: string): string {
  const d = new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)))
  return `${WD[d.getUTCDay()]} ${d.getUTCDate()} ${MON[d.getUTCMonth()]}`
}
/** what a LATE tag says when it is pressed: the cut-off the entry missed (D646) — '' for an entry that is not late */
export function lateWord(r: any): string {
  if (!isLateInput(r)) return ''
  const due = inputOwnDueISO(r)
  return due ? `after the cut-off, ${dayWord(due)}` : ''
}

export interface SansEntry {
  /** the input record itself — a tap opens it in the editor */
  r: any
  /** whose it is */
  id: string
  /** "F · O · A" */
  letters: string
  hours: string
  /** '' or "after the cut-off, Wed 7 Oct" */
  late: string
  /** who placed it and when — '' for a record that never recorded it */
  placed: string
}
export interface SansDayGroups {
  w: SansEntry[]; p: SansEntry[]; other: SansEntry[]
  out: Array<SansEntry & { why: string }>
  /** the head-counts the group headings print: people, each once (D572) */
  flyW: number; flyP: number; otherN: number
}
const lettersOf = (r: any): string =>
  [r.sans && r.sans.f ? 'F' : '', r.sans && r.sans.o ? 'O' : '', r.sans && r.sans.a ? 'A' : ''].filter(Boolean).join(' · ')

export function sansDayGroups(iso: string, rows: readonly any[] = INPUTS, people: Record<string, any> = PEOPLE): SansDayGroups {
  const out: SansDayGroups = { w: [], p: [], other: [], out: [], flyW: 0, flyP: 0, otherN: 0 }
  const com = sansCommittedOn(iso, rows, people)
  const flies = new Set<string>([...com.f.p, ...com.f.w])
  const counted = new Set<string>([...flies, ...com.o.p, ...com.o.w, ...com.a.p, ...com.a.w])
  const label = sansDateLabel(iso)
  if (!label) return out
  const others = new Set<string>()
  for (const r of rows) {
    if (!r || !r.person || !isSansAvail(r.type) || !inputCoversDate(r, label)) continue
    const id = String(r.person), man = people[id]
    const e: SansEntry = { r, id, letters: lettersOf(r), hours: hoursOf(r), late: lateWord(r), placed: placedLine(r, people) }
    if (!counted.has(id)) {
      /* the count's own reasons, in its order (state/flyplan.ts sansCommittedOn) */
      const why = !man ? 'no longer on the roster' : man.archived || man.deleted ? 'archived' : !man.san ? 'no longer SANS'
        : man.seat !== 'FCP' && man.seat !== 'RCP' ? 'not aircrew' : 'no activity chosen'
      out.out.push({ ...e, why })
    } else if (flies.has(id)) (man.seat === 'FCP' ? out.p : out.w).push(e)
    else { out.other.push(e); others.add(id) }
  }
  out.flyP = com.f.p.length; out.flyW = com.f.w.length; out.otherN = others.size
  return out
}
