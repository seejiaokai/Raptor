/* WHAT A BID WOULD DO TO MANNING — the bid windows' day line (owner D1144, D1213; the Leave War overhaul's M3, batch 5).

   Before he places a bid the window says, in one line at its top, what it does: the Available row of his own seat before
   and after it, and each Manning row it would turn amber or red. That answer is read here, off the SAME rules the grid
   draws — `evaluateDay` for the Manning rows, `availHave` for the two Available rows — on the war's views as the bid would
   leave them (`fillRow`, the one body the balance ask uses too), so the line and the grid can never disagree. Pure: the
   caller hands in the war and how an Available figure is judged (its Required and points live with the scheduler's plan,
   which the war does not hold — leavewar/sync.ts). */

import { fillRow } from './counters'
import { evaluateDay, type Verdict } from './evaluate'
import { availHave } from './availrows'
import type { Grid } from './availability'
import type { States } from './bids'
import type { Views } from './dayview'
import type { Person } from './people'
import type { ManningRule, Requirements } from './requirements'

export type WhatIfLevel = 'amber' | 'red'

/** The war as the window reads it */
export interface WhatIfWar {
  people: Person[]
  grid: Grid
  states: States
  requirements: Requirements
  views: Views
  /** the two Available rows as they stand (their names are the squadron's own — D640) */
  avail: { p: ManningRule; w: ManningRule }
}

/** One day's answer */
export interface DayWhatIf {
  date: string
  /** his seat's Available row before → after, and where it then stands; null where the bid moves neither row (a SANS man,
   *  ground crew — they are never counted) */
  avail: { seat: 'p' | 'w'; label: string; before: number; after: number; level: WhatIfLevel | null } | null
  /** each Manning row the bid makes WORSE — to amber or red, or amber to red — at its level after; the bubble's rule */
  turned: Array<{ ruleId: string; label: string; before: number; after: number; level: WhatIfLevel }>
}

const RANK: Record<Verdict, number> = { ok: 0, amber: 1, red: 2 }

/** One day: `judge` says where an Available figure stands that day ('' when it is fine, or the day requires nobody). */
export function dayWhatIf(
  war: WhatIfWar,
  personId: string,
  date: string,
  code: string,
  judge: (seat: 'p' | 'w', have: number, date: string) => '' | WhatIfLevel,
): DayWhatIf {
  const after: Views = { ...war.views, [personId]: fillRow(war.views[personId] ?? {}, [date], code) }
  const was = evaluateDay(war.people, war.grid, war.states, war.requirements, date, war.views)
  const now = evaluateDay(war.people, war.grid, war.states, war.requirements, date, after)
  const turned: DayWhatIf['turned'] = []
  for (const r of now.results) {
    const b = was.results.find(x => x.ruleId === r.ruleId)
    if (r.verdict === 'ok' || RANK[r.verdict] <= RANK[b?.verdict ?? 'ok']) continue
    turned.push({ ruleId: r.ruleId, label: r.label, before: b ? b.have : r.have, after: r.have, level: r.verdict })
  }
  let avail: DayWhatIf['avail'] = null
  for (const seat of ['p', 'w'] as const) {
    const rule = war.avail[seat]
    const before = availHave(rule, war.people, war.grid, war.states, date, war.views)
    const a = availHave(rule, war.people, war.grid, war.states, date, after)
    if (a === before) continue
    const level = judge(seat, a, date)
    avail = { seat, label: rule.label, before, after: a, level: level || null }
    break
  }
  return { date, avail, turned }
}

/** A run of days (a range, a drag): the day the bid hurts most — the lowest Available figure after it, then the most
 *  rows turned, then the earliest — so the window's one line names the day that matters (the agent's reading, M3 §7.1). */
export function worstWhatIf(days: readonly DayWhatIf[]): DayWhatIf | null {
  let best: DayWhatIf | null = null
  const score = (d: DayWhatIf) => [d.avail ? d.avail.after : Infinity, -(d.turned.length)]
  for (const d of days) {
    if (!best) { best = d; continue }
    const [a1, t1] = score(d), [a0, t0] = score(best)
    if (a1 < a0 || (a1 === a0 && t1 < t0)) best = d
  }
  return best
}
