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

   PURE — no screen, no store. `ui/InputCard.tsx` draws what this answers; nothing else works a card's words out, so the
   day and the list cannot disagree (the roll-call of the plan's §4 names the surfaces that must NOT draw it: the SANS
   day keeps its pucks with the CAT — D647, D649). */
import { inpKindTag, inpLabel } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { toneOf } from './inputscal-model'
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
}

const csOf = (id: unknown, people: Record<string, any>): string => {
  const p = people[String(id)]
  return p && p.cs ? String(p.cs) : String(id ?? '')
}
const az = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: 'base' })

/** the facts of one entry's card — `rows` is one record, or the records of one shared input */
export function cardOf(rows: readonly any[], people: Record<string, any> = PEOPLE): CardFacts {
  const list = (rows || []).filter(Boolean)
  const r = list[0] || {}
  const filer = filerOf(list)
  /* one person: only where someone ELSE placed it (D723) — the card already begins with his name (D720).
     several people: always (D724) — with many names on the card, none of them says who made it */
  const said = filer != null && (list.length > 1 || String(filer) !== String(r.person))
  return {
    names: list.map(x => csOf(x.person, people)).sort(az).join(', '),
    kind: String(r.type || ''),
    title: inpKindTag(r) ? inpLabel(r) : '',
    remark: String(r.remarks || '').trim() ? String(r.remarks) : '',
    by: said ? filerName(filer, people) : '',
    tone: toneOf(r.type),
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
 *  D721). `lateWord` is the day's own sentence for one record (ui/sanscal-model.ts), '' for one that is not late. */
export function lateNoteOf(rows: readonly any[], lateWord: (r: any) => string, people: Record<string, any> = PEOPLE): string {
  const list = (rows || []).filter(Boolean)
  const lates = list.map(x => ({ who: csOf(x.person, people), note: lateWord(x) })).filter(x => x.note)
  if (!lates.length) return ''
  const same = lates.every(x => x.note === lates[0].note)
  if (same && lates.length === list.length) return lates[0].note
  lates.sort((a, b) => az(a.who, b.who))
  if (same) return `${lates.map(x => x.who).join(', ')}: ${lates[0].note}`
  return lates.map(x => `${x.who}: ${x.note}`).join(' · ')
}
