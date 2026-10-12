/* THE INPUTS MONTH — which bar sits on which line of which week (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.6, §3.13).

   Owner, D626 (7 Oct 26): "I like bars the way Google calendar does." An input is ONE bar across the days it covers,
   cut at a week's end and carried on in the next. D632 / D639: a desktop shows seven a day before "+N more", compact,
   with no roomy / compact switch. D653 / D664: on a phone the week rows share the height the screen gives, the bars are
   thin, and the lines a day are whatever fits — never fewer than three and the "+N more" line; where the screen cannot
   hold that, the row is taller than its share and the WHOLE PAGE scrolls (the month is never a box scrolled inside it).
   D655: a group filing is one shared input — ONE bar. D627: a public holiday, an Off day and a no-fly day show as on the
   SANS calendar, tint and tag; the sun and the moon are that calendar's alone. D620: SANS availability is on no bar.

   PURE — no screen, no store. The month (ui/InputsCal.tsx) hands it the list of inputs and draws what comes back; the
   opened day and the bar a pointer picks up read the same items, so the three cannot disagree about what a day holds.
   SINCE THE ONE-RULE BUILD (owner D756, 11 Oct 26 — "an input is stored as ONE record with the list of its people"; the
   plan docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.5) AN INPUT IS ITS RECORD: a list of inputs IS the list of
   bars, and who is in one is the record's own list, read through engine/inputs.ts (namedOf / placeholderOf) — never
   `person`, never how many records. A record stored before that build (one `person`) reads as the one-person input it
   is; one that still carries an old group id is one man's input too (D759 reading 10 — nothing is converted). */
import { dateOrd, inpLabel, inpKindTag, isSansAvail, isUnavail, isUpchit, namedOf, placeholderOf } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import type { DayAnswer } from '../state/flyplan-model'

export interface BarItem {
  /** the input's address: its record's id */
  key: string
  /** the input's record, as a list of one — the screens hand it to the card, the window and the writers */
  rows: any[]
  /** everyone in it — ids: the named people A to Z by callsign, then its placeholder (ALL AVAIL / ALL) last (D721, D727) */
  people: string[]
  /** its placeholder's callsign ("ALL AVAIL"), '' where it has none */
  ph: string
  /** its first and last day, yyyy-mm-dd */
  a: string
  b: string
  /** red for an absence, amber for a duty or a commitment — the List's own row colours */
  tone: 'red' | 'amb'
  /** the first callsign of `people` */
  who: string
  /** how many more are in it — `people.length - 1`; "several people" is this, never how many records */
  more: number
  /** its name, as the app labels an input everywhere: its own title where it has one, else its kind (inpLabel) */
  word: string
  /** its kind, where it is named by something else — kept in sight small beside the name (D717); '' otherwise */
  kind: string
  allday: boolean
  /** minutes into the day it starts — 0 for an all-day input */
  s: number
  /** the scheduler cancelled it (D760): its bar is struck through and faded, its words and its PLACE as they were
   *  (D767, D768 — "it keeps its place in the day's order"; nothing below sorts by this) */
  cx: boolean
}
export interface BarSeg {
  item: BarItem
  /** which line of the week, from 0 */
  lane: number
  /** its first and last column in this week, Monday = 0 */
  c0: number
  c1: number
  /** the input's own first day is in this week (else the bar is carried on from the week before) */
  head: boolean
  /** its own last day is in this week (else it carries on) */
  tail: boolean
}
export interface WeekBars {
  /** the bars that have a line */
  segs: BarSeg[]
  /** per column, how many inputs of that day had no line */
  more: number[]
  /** how many lines the week uses, at most the lines it was given */
  lanes: number
}
export interface CalFilter { fPerson: string; fType: string; fSearch: string }

/* ---- THE PERSON FILTER'S VALUES — ONE BODY FOR THE LIST, THE MONTH AND THE OPENED DAY ([INPUT-ALL-AVAIL], 9 Oct 26) ----
   The filter's "Everyone" has always been the string 'all' — which is also the id of the ALL placeholder (people.ts),
   and since an input can be filed FOR that placeholder (D700) the two meet: three places each compared the filter's
   value with a record's person by hand, so choosing ALL would have shown everyone, and there was no way to ask for the
   ALL inputs alone (both first-round readers of the plan).

   WHICH SIDE MOVED, AND WHY. "Everyone" keeps 'all': seventeen walk scripts and three browser tests choose it by that
   value, and had it changed each of them would have gone on choosing — silently — the ALL placeholder instead. So it is
   the PLACEHOLDER's value in a filter that is its own: 'ph:' + its id. A named person's value is his id, as always.
   Every reader asks `personFilterPasses`; nothing compares the filter with a person by hand any more. */
export const EVERYONE = 'all'
const PH = 'ph:'
/** the value a person carries in a person filter */
export const personFilterValue = (pid: any, people: Record<string, any> = PEOPLE): string => {
  const id = String(pid ?? ''), p = people[id]
  return p && p.special ? PH + id : id
}
/** the person a filter value names ('' for Everyone) */
export const personFilterId = (fPerson: any): string => {
  const v = String(fPerson ?? '')
  return v === EVERYONE ? '' : v.startsWith(PH) ? v.slice(PH.length) : v
}
/** does a record of this person pass the filter? */
export const personFilterPasses = (fPerson: any, pid: any, people: Record<string, any> = PEOPLE): boolean =>
  String(fPerson ?? EVERYONE) === EVERYONE || personFilterValue(pid, people) === String(fPerson)

/* ---- WHO IS IN AN INPUT, AS A SCREEN SAYS IT — ONE BODY FOR THE MONTH, THE OPENED DAY, THE LIST AND THE CARD (the
   one-rule build, 12 Oct 26 — the plan docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.5 "Names and counts") -----
   A card, a List row and a tooltip name every NAMED person A to Z by callsign, then the placeholder's callsign last
   (owner D721: "Instead of doing a +1 hiding the info"; D727: never "Drifter +3"). The person filter passes an input
   when ANY of its people passes, or its placeholder does (`ph:`), and the search matches any of their callsigns —
   asked here by all three lists, so a filter can never show an input on one and hide it on another. */
const csIn = (people: Record<string, any>) => (p: any): string => { const x = people[String(p)]; return x && x.cs ? String(x.cs) : String(p ?? '') }
/** everyone in an input — ids: the named people A to Z by callsign, then its placeholder last */
export function peopleAZ(r: any, people: Record<string, any> = PEOPLE): string[] {
  const cs = csIn(people)
  const named = namedOf(r).map((e: any) => e.p).filter((p: any) => p != null && p !== '').map(String)
    .sort((a: string, b: string) => cs(a).localeCompare(cs(b), undefined, { sensitivity: 'base' }))
  const ph = placeholderOf(r)
  return ph && ph.p != null ? [...named, String(ph.p)] : named
}
/** their callsigns, in that order — what a card, a List row and a tooltip print */
export const namesOf = (r: any, people: Record<string, any> = PEOPLE): string[] => peopleAZ(r, people).map(csIn(people))
/** does an input pass the person filter? — when ANY of its people does (its placeholder by its own `ph:` value) */
export const inputPassesPerson = (fPerson: any, r: any, people: Record<string, any> = PEOPLE): boolean =>
  String(fPerson ?? EVERYONE) === EVERYONE || peopleAZ(r, people).some(p => personFilterPasses(fPerson, p, people))
/** does an input match the search box? — a word in its remarks, its name, or the callsign of anyone in it */
export function inputMatchesSearch(r: any, fSearch: any, people: Record<string, any> = PEOPLE): boolean {
  const s = String(fSearch || '').trim().toLowerCase()
  return !s || String(r.remarks || '').toLowerCase().includes(s) || inpLabel(r).toLowerCase().includes(s) ||
    namesOf(r, people).some(n => n.toLowerCase().includes(s))
}

const two = (n: number) => String(n).padStart(2, '0')
const isoOfOrd = (o: number) => `${Math.floor(o / 10000)}-${two(Math.floor(o / 100) % 100)}-${two(o % 100)}`
const TONE_ORDER = { red: 0, amb: 1 } as const
/** red for an absence, amber for a duty or a commitment (an upchit too) — the month's bar and the input card read it */
export const toneOf = (t: any): 'red' | 'amb' => !isUpchit(t) && isUnavail(t) ? 'red' : 'amb'

/** HOW MANY AN INPUT OF SEVERAL HOLDS, in words — for the question a delete asks and the note that answers it: "4
 *  people"; with a placeholder among them the count is of the NAMED people and the placeholder is said beside it, as on
 *  the bar ("3 people and ALL AVAIL"; one named person keeps his callsign, "Saber and ALL AVAIL") — ALL AVAIL stands
 *  for whoever is free on the day (D702), so it is nobody to count. */
export function everyoneIn(it: Pick<BarItem, 'people' | 'ph' | 'who'>): string {
  const n = it.people.length - (it.ph ? 1 : 0)
  return it.ph ? `${n === 1 ? it.who : n + ' people'} and ${it.ph}` : `${n} people`
}

/** Every input the Inputs month may show — one item a record — filtered as the List filters its rows (an input stays
 *  when ANY of its people passes), in the order a day lists them: absences, then commitments; all-day before timed;
 *  the earlier start; then the callsign. */
export function monthItems(inputs: readonly any[], f: CalFilter, people: Record<string, any> = PEOPLE): BarItem[] {
  const cs = csIn(people)
  const out: BarItem[] = []
  for (const r of (inputs || [])) {
    if (!r || isSansAvail(r.type)) continue
    if (f.fType !== 'all' && r.type !== f.fType) continue
    if (!inputPassesPerson(f.fPerson, r, people) || !inputMatchesSearch(r, f.fSearch, people)) continue
    const who = peopleAZ(r, people)
    const ph = placeholderOf(r)
    const a = dateOrd(r.date, r.yr)
    if (a == null) continue                                  // a date no calendar can read is on no day of a month
    const b0 = r.endDate ? dateOrd(r.endDate, r.yr) : null
    const b = b0 != null && b0 > a ? b0 : a
    out.push({
      key: String(r.iid), rows: [r], people: who, ph: ph && ph.p != null ? cs(ph.p) : '',
      a: isoOfOrd(a), b: isoOfOrd(b), tone: toneOf(r.type),
      who: who.length ? cs(who[0]) : '', more: Math.max(0, who.length - 1), word: inpLabel(r), kind: inpKindTag(r), allday: !!r.allday, s: r.allday ? 0 : (r.s ?? 0),
      cx: !!r.cx,
    })
  }
  const at = new Map(out.map((it, i) => [it, i] as const))
  return out.sort((x, y) =>
    TONE_ORDER[x.tone] - TONE_ORDER[y.tone] || (x.allday === y.allday ? 0 : x.allday ? -1 : 1) || x.s - y.s ||
    x.who.localeCompare(y.who, undefined, { sensitivity: 'base' }) || at.get(x)! - at.get(y)!)
}

/** the inputs covering one day, in the month's own order */
export const itemsOn = (iso: string, items: readonly BarItem[]): BarItem[] => items.filter(it => it.a <= iso && iso <= it.b)

/** One week's bars. `week` is its seven dates, Monday first, null for a date outside the month — a bar never runs into
 *  those. Lines are given long bars first (the earlier start, then the longer run, then the month's own order), each
 *  the first line free across its days; a bar with no line under `maxLanes` is counted on every day it covers. */
export function layoutBars(week: readonly (string | null)[], items: readonly BarItem[], maxLanes: number): WeekBars {
  const cols = week.map((iso, c) => (iso ? c : -1)).filter(c => c >= 0)
  const more = week.map(() => 0)
  if (!cols.length) return { segs: [], more, lanes: 0 }
  const first = week[cols[0]] as string, last = week[cols[cols.length - 1]] as string
  const cand: BarSeg[] = []
  for (const item of items) {
    if (item.b < first || item.a > last) continue
    const c0 = item.a <= first ? cols[0] : week.indexOf(item.a)
    const c1 = item.b >= last ? cols[cols.length - 1] : week.indexOf(item.b)
    cand.push({ item, lane: -1, c0, c1, head: item.a >= first, tail: item.b <= last })
  }
  const at = new Map(cand.map((s, i) => [s, i] as const))
  cand.sort((x, y) => x.c0 - y.c0 || (y.c1 - y.c0) - (x.c1 - x.c0) || at.get(x)! - at.get(y)!)
  const taken: boolean[][] = []                               // taken[lane][column]
  const segs: BarSeg[] = []
  let lanes = 0
  for (const s of cand) {
    let lane = 0
    for (;; lane++) {
      const row = taken[lane] || (taken[lane] = [])
      let free = true
      for (let c = s.c0; c <= s.c1; c++) if (row[c]) { free = false; break }
      if (free) break
    }
    if (lane >= maxLanes) { for (let c = s.c0; c <= s.c1; c++) more[c]++; continue }
    for (let c = s.c0; c <= s.c1; c++) taken[lane][c] = true
    s.lane = lane
    segs.push(s)
    if (lane + 1 > lanes) lanes = lane + 1
  }
  return { segs, more, lanes }
}

/** What a bar says: the callsign and the kind. On a phone a bar one day wide has room for the callsign alone — its
 *  kind is one tap away, in the opened day.
 *  A SHARED INPUT'S BAR SAYS HOW MANY, FIRST (owner D729 — the design vet's V4, 10 Oct 26: "4 · Meeting"). It used to
 *  lead with whoever comes first in the alphabet ("Drifter +3 · Meeting"): Saber's own meeting did not show his name,
 *  and a bar cut short by its day lost the "+3". Now the count leads — so a cut-off bar never loses it — then what it
 *  is; who is in it is the opened day's to say (every name — D721) and the bar's tooltip's. On a phone too: a count
 *  alone would say nothing, so a shared bar always carries its word.
 *  THE COUNT IS OF NAMED PEOPLE, AND A PLACEHOLDER IS SAID BESIDE IT (the one-rule plan §4.5: the bar's count "counts
 *  named people and says '+ ALL AVAIL'" — ALL AVAIL stands for whoever is free on the day, D702, so it is nobody to
 *  count): "3 + ALL AVAIL · Meeting"; one named person beside it keeps his callsign, "Saber + ALL AVAIL · Meeting". */
export function barText(it: BarItem, narrow: boolean): string {
  if (it.more > 0) {
    if (!it.ph) return `${it.more + 1} · ${it.word}`
    return `${it.more > 1 ? it.more : it.who} + ${it.ph} · ${it.word}`
  }
  return narrow && it.a === it.b ? it.who : `${it.who} · ${it.word}`
}

/** THE PHONE'S LINES (D653, D664): the week rows share `fillPx` — the height from the month's top to the foot of the
 *  screen — and a row holds its date line, as many bar lines as fit, and the "+N more" line. A FLOOR, never a limit:
 *  a row is never squeezed under three lines, so a short screen or a six-week month makes the month taller than the
 *  screen and the page scrolls. `m` is the measured heights of the three parts, in px. */
export function fitLanes(fillPx: number, weeks: number, m: { head: number; lane: number; more: number }): { row: number; lanes: number } {
  const MIN = 3
  const floor = m.head + MIN * m.lane + m.more
  const share = Number.isFinite(fillPx) && weeks > 0 ? Math.floor(fillPx / weeks) : 0
  const row = Math.max(floor, share)
  return { row, lanes: Math.max(MIN, Math.floor((row - m.head - m.more) / m.lane)) }
}

/** The tag beside a date (D627): the Leave War's own short form for a public holiday or an Off day, NF for a no-fly
 *  day; nothing for a day-flying or night-flying day — the sun and the moon show on the SANS calendar only. */
export function dayTag(a: DayAnswer, short: string): { text: string; kind: 'ph' | 'off' | 'nf' } | null {
  if (a.kind) return { text: short || (a.kind === 'ph' ? 'PH' : 'OFF'), kind: a.kind }
  return a.cls === 'nf' ? { text: 'NF', kind: 'nf' } : null
}
