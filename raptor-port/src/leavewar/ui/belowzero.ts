// THE WORDS THE ASK BEFORE A BALANCE GOES BELOW ZERO USES — one wording for both sheets that fill leave (his ruling
// D418, 29 Sep 26 — "Drag asks too": a drag across days that goes below zero asks first, as a one-day bid does). The
// one-day sheet (a day, or a picked range) names one man; the drag-selection sheet may name several, and asks ONCE
// for the whole block — never a question per man. Never a refusal: a balance may run negative (the owner was explicit);
// what was wrong was doing it silently. The balance is named as the column names it (+LVE's "LVE", not the counter's
// inner name "annual"), so the ask and the red number it predicts read the same.

import { FIGURES, type CounterName } from '../engine'

export type BelowZero = { callsign: string; counter: CounterName; after: number }

/** What a fill does to one balance — the store's `balanceAfterFill`. */
export type BalanceAfter = { counter: CounterName; before: number; after: number }

/** Does this fill take the balance below zero? Only when it ends below zero AND lower than it started: a fill that
 *  spends nothing (a weekend, the same leave again) never asks, even of a man already in the red (Astra's final read,
 *  F4, 29 Sep 26 — it asked "takes him to -2" of a Saturday that left him at -2). */
export const goesBelow = (r: BalanceAfter | null | undefined): r is BalanceAfter => !!r && r.after < 0 && r.after < r.before

/** The column's short name for a counter's balance: "LVE", "OIL", "CCL"… */
export const balanceLabel = (counter: CounterName): string =>
  FIGURES.find(f => f.kind === 'bal' && f.counter === counter)?.label ?? counter.toUpperCase()

/** "That takes DUSK to -3 LVE. Tap the same leave again to go ahead." — or, for several,
 *  "That takes DUSK to -3 LVE and RAVEN to -1 LVE. …" (a comma between all but the last two). */
export function belowZeroAsk(list: readonly BelowZero[]): string {
  const each = list.map(b => `${b.callsign} to ${b.after} ${balanceLabel(b.counter)}`)
  const named = each.length > 1 ? `${each.slice(0, -1).join(', ')} and ${each[each.length - 1]}` : each[0] ?? ''
  return `That takes ${named}. Tap the same leave again to go ahead.`
}
