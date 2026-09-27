// THE WORDS A CONFIRM USES TO NAME THE OIL AWARDS IT WILL TAKE (owner, D260, 27 Sep 26 — "the confirm names each
// award first"). One wording for both doors that clear a day — a dragged block's Delete and the bid sheet's Clear (its
// range too) — so the two never describe the same award two ways. What is named comes from `store.ts awardsIn`, which
// asks the same question the clear itself does.

import { shortDate } from './dates'

export type AwardNamed = { personId: string; date: string; days: number }

/** An award's worth in the confirms' voice: "1 day", "half a day", "3 days" (his own example reads "Dash 1 day"). */
export const awardDays = (n: number): string => (n === 0.5 ? 'half a day' : `${n} day${n === 1 ? '' : 's'}`)

/** "2 OIL awards (DASH 1 day, FABLE 3 days)" — each award by whose it is and what it is worth; the DAY is added only
 *  when one man has more than one in the list, so each line still names one award. */
export function awardsClause(awards: readonly AwardNamed[], callsign: (id: string) => string): string {
  const n = awards.length
  const twice = new Set(awards.map(a => a.personId)).size < n
  const each = awards.map(a => `${callsign(a.personId)}${twice ? ` ${shortDate(a.date).slice(0, -3)}` : ''} ${awardDays(a.days)}`)
  return `${n} OIL award${n === 1 ? '' : 's'} (${each.join(', ')})`
}
