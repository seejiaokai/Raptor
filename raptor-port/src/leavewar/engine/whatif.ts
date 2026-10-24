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
  /** the day already holds him away, so the bid changes nothing there (his D1296 — the window reopened on a day holding
   *  the bid): `avail` is his row as it stands (before = after) and `turned` every Manning row now amber or red */
  standing?: true
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
  if (avail || turned.length) return { date, avail, turned }
  /* NOTHING MOVES — but is that because he is already away that day (his D1296: the window reopened on a day holding the
     bid read "No manning row turns amber or red" while Available P stood red)? Asked by taking his day off the war: where
     that raises a row, the day already counts him out, and the line shows the day as it stands — his row's figure and
     level, and every Manning row now amber or red. Where it raises nothing (a SANS man, ground crew), the plain answer. */
  const { [date]: _gone, ...restOfRow } = war.views[personId] ?? {}
  const without: Views = { ...war.views, [personId]: restOfRow }
  for (const seat of ['p', 'w'] as const) {
    const rule = war.avail[seat]
    const have = availHave(rule, war.people, war.grid, war.states, date, war.views)
    if (availHave(rule, war.people, war.grid, war.states, date, without) === have) continue
    avail = { seat, label: rule.label, before: have, after: have, level: judge(seat, have, date) || null }
    break
  }
  if (!avail) return { date, avail: null, turned }
  for (const r of was.results) {
    if (r.verdict === 'ok') continue
    turned.push({ ruleId: r.ruleId, label: r.label, before: r.have, after: r.have, level: r.verdict })
  }
  return { date, avail, turned, standing: true }
}

/** A run of days (a range, a drag): the day the bid hurts most — first by how bad it is (a row or his Available turned red,
 *  then amber, then none), then the most rows turned, then the lowest Available figure after it, then the earliest — so the
 *  window's one line never reads calm while another day of the run turns red (the fresh read's 1: D1144 "where none would,
 *  the line says so" — the lowest figure used to win over a red row). */
export function worstWhatIf(days: readonly DayWhatIf[]): DayWhatIf | null {
  const sev = (d: DayWhatIf) => Math.max(d.avail?.level === 'red' ? 2 : d.avail?.level === 'amber' ? 1 : 0, ...d.turned.map(t => (t.level === 'red' ? 2 : 1)))
  let best: DayWhatIf | null = null
  for (const d of days) {
    if (!best) { best = d; continue }
    const k1 = [sev(d), d.turned.length, -(d.avail ? d.avail.after : Infinity)]
    const k0 = [sev(best), best.turned.length, -(best.avail ? best.avail.after : Infinity)]
    for (let i = 0; i < 3; i++) { if (k1[i]! > k0[i]!) { best = d; break } if (k1[i]! < k0[i]!) break }
  }
  return best
}
