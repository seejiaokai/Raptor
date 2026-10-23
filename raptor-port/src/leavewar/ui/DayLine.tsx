/* THE BID WINDOWS' DAY LINE (owner D1144, D1213; the Leave War overhaul's M3, batch 5 — red-team fix A3's stacked rows):
   at the top of both bid windows, what the bid would do to manning before it is placed. His seat's Available row before
   → after the bid, then each Manning row it would turn amber or red, each on its own line, flush left — names in one
   column, figures in a second (his design lessons 20 and 29) — each in its colour; where none would, one calm line. A
   range or a drag reads the day it hurts most, its date first. The answer is the store's (engine/whatif.ts, on the
   grid's own rules); this only draws it. It follows Duration and the range, not the kind of leave — every leave lowers
   manning the same (D998). */

import type { Portion } from '../engine'
import { worstWhatIf, type DayWhatIf } from '../engine/whatif'
import { dayLabel } from './dates'

/** the code the line asks with: any leave, at the half picked ('*LL' a morning, 'LL*' an afternoon) */
export const dayLineCode = (portion: Portion): string => (portion === 'am' ? '*LL' : portion === 'pm' ? 'LL*' : 'LL')

/** a figure as the grid writes it: halves ".5", never "½" (D1246) */
const fig = (n: number) => String(Math.round(n * 2) / 2)

export function DayLine({ days, label }: {
  /** the store's answer for each day the bid would write (`sync.ts bidDayLine`) */
  days: readonly DayWhatIf[]
  /** where the window names who: a drag across several people puts the callsign first */
  label?: string
}) {
  const w = worstWhatIf(days)
  if (!w) return null
  const many = days.length > 1
  return (
    <div className="bidsheet-dayline" data-testid="bid-dayline">
      {(many || label) && (
        <div className="dl-when" data-testid="bid-dayline-when">{[label, many ? dayLabel(w.date) : ''].filter(Boolean).join(' · ')}</div>
      )}
      {w.avail && (
        <div className={`dl-row${w.avail.level ? ` dl-${w.avail.level}` : ''}`} data-testid="bid-dayline-avail">
          <span className="dl-name">{w.avail.label}</span>
          <span className="dl-fig">{fig(w.avail.before)} → {fig(w.avail.after)}{w.avail.level ? ` · ${w.avail.level}` : ''}</span>
        </div>
      )}
      {w.turned.map(t => (
        <div key={t.ruleId} className={`dl-row dl-${t.level}`} data-testid={`bid-dayline-${t.ruleId}`}>
          <span className="dl-name">{t.label}</span>
          <span className="dl-fig">{fig(t.before)} → {fig(t.after)} · {t.level}</span>
        </div>
      ))}
      {!w.turned.length && !w.avail?.level && (
        <div className="dl-row dl-calm" data-testid="bid-dayline-calm">No manning row turns amber or red</div>
      )}
    </div>
  )
}
