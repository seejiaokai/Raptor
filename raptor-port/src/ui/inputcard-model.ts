/* WHAT AN INPUT'S CARD SAYS — the one pure body behind the card of the Inputs calendar's opened day and of the Inputs
   list on a phone (owner D718–D724, 10 Oct 26 — `[INPUT-LIST-AS-DAY-CARD]`; the plan
   docs/superpowers/plans/2026-10-10-input-card-plan.md §2.1; the pictures of record
   docs/mock/img/input-card-final/day-final.png, list-final.png).

     D718  "the agreed layout can be used for the input list view too" — one card, two screens.
     D721  "Instead of doing a +1 hiding the info … Like wrap text" — every name of a shared input.
     D722  "the title always start on the left as a new row".
     D723  the kind in small grey capitals — the KIND'S OWN NAME, always; the title only where it is not that name.
     D720  "Just put By Saber. Since the ranger is already at the title."
     D723  …and only where someone other than the input's own person placed it; no day, no time on the card.
     D724  "multiple people in 1 input it's better to show who made that input" — several people: always.
     D728  "till 17 Jul" is said ONCE: where the corner says it, the remark's automatic "till 17 Jul" is left out.

   PURE — no screen, no store. `ui/InputCard.tsx` draws what this answers; nothing else works a card's words out, so the
   day and the list cannot disagree (the roll-call of the plan's §4 names the surfaces that must NOT draw it: the SANS
   day keeps its pucks with the CAT — D647, D649).

   SINCE THE ONE-RULE BUILD (owner D756, 11 Oct 26; the plan docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.5) AN
   INPUT IS ONE RECORD with the list of its people: `rows` is that record as a list of one, who it is for is the
   record's people (never `person`, never how many records), its filer is its `by`, and a person's own late date rides
   his entry — read through engine/inputs.ts facesOf, one frozen view a person, for words only. A record stored before
   that build (one `person`) reads as the one-person input it is. */
import { facesOf, idsOf, inpKindTag, inpLabel, placeholderOf, remarksTyped } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { namesOf, toneOf } from './inputscal-model'
import { filerName, filerOf } from './placedline'
import { hoursOf } from './sanscal-model'

export interface CardFacts {
  /** everyone it is for — one callsign, or a shared input's, A to Z, joined ", " (D721) */
  names: string
  /** its kind's own name (the top line's small grey capitals) */
  kind: string
  /** its own title, where it has one that is not its kind's name; '' otherwise */
  title: string
  /** its remark; '' where there is none */
  remark: string
  /** who filed it, where the card says so (D723, D724); '' otherwise */
  by: string
  /** red for an absence, amber for a duty or a commitment */
  tone: 'red' | 'amb'
  /** the scheduler cancelled it — a CX on its row on the schedule cancels the INPUT (D760); it stays listed */
  cx: boolean
  /** the reason he gave ("WX"); '' where none was typed, and always '' on an input that is not cancelled (D767) */
  why: string
}

/* A CANCELLED INPUT (owner D760, 11 Oct 26; its look D767, 12 Oct 26 — the one-rule plan's step 5). The CX is the
   INPUT's own mark (`cx`, with its reason `cxr` only while cancelled; `cx: false` once brought back — engine/schema.ts),
   so every screen that draws an input asks these two and nothing else: the card and the List's row draw a small red CX
   tag before the title, the title struck through and the reason after it in red; the month's bar is struck through
   and faded, with no room for either (D767: "for those areas that have no space to show reason it's ok"). */
export const cxOf = (r: any): boolean => !!(r && r.cx)
export const cxWhy = (r: any): string => (cxOf(r) ? String(r.cxr || '').trim() : '')
/** …and in words, for whoever cannot see a strike — a screen reader's label, a bar's tooltip */
export const cxSays = (r: any): string => (cxOf(r) ? 'Cancelled' + (cxWhy(r) ? ' — ' + cxWhy(r) : '') : '')

const csOf = (id: unknown, people: Record<string, any>): string => {
  const p = people[String(id)]
  return p && p.cs ? String(p.cs) : String(id ?? '')
}
const az = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: 'base' })

/* "TILL" SAID ONCE (owner D728, 10 Oct 26 — "1 now, 2 later"; step 2, the app no longer writing it at all, is
   `[TILL-FROM-DATES]`). The calendar writes "till 17 Jul" into the remark of an input of several days
   (engine/inputs.ts withRemarksTail), and the card's corner says that day too — so a card read "till 17 Jul" at its
   right and again in its remark. ON THE CARD ONLY the automatic words are left out, and only where they repeat the
   corner's OWN day: anything typed before or after them stays, a remark that was nothing else is no remark, and a
   "till" for another day — somebody's own words — is left alone. The record is not changed: the schedule's row, the
   desktop list's Remarks column and the input's window read the whole remark, as before.
   `corner` is the card's corner as it is printed (cardWhen, below): "till 17 Jul", "10:00–11:00 · till 17 Jul", or —
   for an input that runs into another year — "till 1 Jan 2027", where the remark's own words carry no year. A card
   whose corner says no "till" (a one-day input; an input shown under its last day) keeps its remark whole. */
const SEP = '[\\s,·—–-]'
export function remarkOnce(remark: string, corner: string): string {
  const m = /\btill (\d{1,2}) ([A-Za-z]{3})(?: (\d{4}))?/.exec(corner || '')
  if (!m || !remark) return remark
  /* the corner's year, where it says one, may follow the words; any other year after them was typed, and is his */
  const tok = new RegExp(`${SEP}*\\btill\\s+${m[1]}\\s+${m[2]}\\b${m[3] ? `(?:\\s+${m[3]}\\b)?` : ''}(?!\\s+\\d{4}\\b)`, 'i')
  const hit = tok.exec(remark)
  if (!hit) return remark
  /* ONLY THE JOIN IS TIDIED (Astra's read of the code, 10 Oct 26): `hit` is the words and whatever separators led up to
     them. What stood before is kept to the character; what stands after is kept too — losing its own leading
     separators only where the words OPENED the remark ("till 17 Jul — Bangkok" → "Bangkok"). Nothing else of the
     remark is touched: the first version stripped separators from both ends of the WHOLE remark, and
     "-5°C cold-weather kit till 17 Jul" lost its minus sign. */
  const before = remark.slice(0, hit.index)
  let after = remark.slice(hit.index + hit[0].length)
  /* …and there only a separator that stands BY ITSELF is a join — a comma or a dash followed by a space. A sign attached
     to the next word is that word's own: "till 17 Jul -5°C kit" keeps its minus (Sol's read of the code, 10 Oct 26). */
  if (!before.trim()) after = after.replace(/^\s*(?:[,·—–-]\s+)*/, '')
  return (before + after).trim()
}

/** the facts of one input's card — `rows` is its record, as the list of one the screens carry; `corner` is what the
 *  card's right corner says (cardWhen), by which the remark leaves out the "till <date>" the corner already says */
export function cardOf(rows: readonly any[], people: Record<string, any> = PEOPLE, corner = ''): CardFacts {
  const list = (rows || []).filter(Boolean)
  const r = list[0] || {}
  const filer = filerOf(list)
  /* everyone it holds — "several people" is how many are IN it, never how many records (D756) */
  const ids = list.flatMap(x => idsOf(x))
  /* one person: only where someone ELSE placed it (D723) — the card already begins with his name (D720).
     several people: always (D724) — with many names on the card, none of them says who made it */
  const said = filer != null && (ids.length > 1 || String(filer) !== String(ids[0]))
  return {
    /* every named person A to Z, then the placeholder's own name last (D721, D727 — ui/inputscal-model.ts namesOf, the
       one order the bar's tooltip and the List's row print too) */
    names: list.flatMap(x => namesOf(x, people)).join(', '),
    kind: String(r.type || ''),
    title: inpKindTag(r) ? inpLabel(r) : '',
    /* the typed words only: the date is the corner's (D728), and since D948 it is never in the remark either — a remark
       saved with one before the build is read without it (engine/inputs.ts remarksTyped) */
    remark: remarksTyped(r.remarks, r),
    by: said ? filerName(filer, people) : '',
    tone: toneOf(r.type),
    cx: cxOf(r),
    why: cxWhy(r),
  }
}

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/* '2026-07-20' → '20 Jul'; a day in another year than the one it is shown under keeps its year */
const dayMon = (iso: string, under: string) =>
  `${+iso.slice(8, 10)} ${MON[+iso.slice(5, 7) - 1]}` + (iso.slice(0, 4) !== under.slice(0, 4) ? ' ' + iso.slice(0, 4) : '')

/** WHEN it is, as the card's right corner says it: its hours, "All day", a half day — or, for one that runs on past
 *  the day it is shown under (`iso`: the opened day; on the list, its own first day), the day it runs till (`last`). */
export function cardWhen(r: any, last: string, iso: string): string {
  if (last > iso) return (r && r.allday ? '' : hoursOf(r) + ' · ') + 'till ' + dayMon(last, iso)
  return hoursOf(r)
}

/** THE LATE TAG'S NOTE (D646 — pressed, the tag says the cut-off that was missed). '' where nobody is late: no tag.
 *  A shared input says LATE once; where only some of its people are late — a man added later can be late alone — or
 *  their cut-offs differ, the note names who (the List's own rule, 8 Oct 26; the per-man tags went with the pucks —
 *  D721). `lateWord` is the day's own sentence for one record (ui/sanscal-model.ts), '' for one that is not late.
 *  ON THE ONE RECORD (the one-rule plan §4.5 "The late mark"): an input is late when its own `mod` is; a person in it is
 *  late when HIS entry's `mod` is later still. So the sentence is asked of each person's FACE (engine/inputs.ts facesOf
 *  — the record's fields with his id and his own late date), the placeholder's too: ALL AVAIL is late with the input. */
export function lateNoteOf(rows: readonly any[], lateWord: (r: any) => string, people: Record<string, any> = PEOPLE): string {
  const list = (rows || []).filter(Boolean).flatMap(x => facesOf(x))
  /* is this face the input's placeholder? (a face carries its record's fields, so the record's own reader answers) */
  const isPh = (f: any) => { const ph = placeholderOf(f); return !!ph && String(ph.p) === String(f.person) }
  const lates = list.map(f => ({ who: csOf(f.person, people), ph: isPh(f), note: lateWord(f) })).filter(x => x.note)
  if (!lates.length) return ''
  const same = lates.every(x => x.note === lates[0].note)
  if (same && lates.length === list.length) return lates[0].note
  /* named people A to Z, the placeholder last — the card's own order of names (D721, D727) */
  lates.sort((a, b) => (a.ph === b.ph ? az(a.who, b.who) : a.ph ? 1 : -1))
  if (same) return `${lates.map(x => x.who).join(', ')}: ${lates[0].note}`
  return lates.map(x => `${x.who}: ${x.note}`).join(' · ')
}
