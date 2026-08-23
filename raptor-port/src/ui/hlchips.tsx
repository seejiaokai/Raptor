/* The Highlight chips — ONE definition, THREE surfaces (the view week, the
   edit week and the board's bar). The chip lists and the rendered strip lived
   in Shell.tsx while the view page was the only surface that drew them; the
   moment a second surface wanted the same strip they became a drift seam —
   two copies of one rule is where this app's recurring bugs come from
   (docs/feature-impact.md), so the strip moved into its own module and every
   surface renders <HlChips />. The chips read and mutate HLSET directly, the
   same in-place-Set idiom as every other view flag, so a chip toggled on any
   surface lights the other two on the same notify. */
import { HLSET } from '../state/view'
import { notify } from '../state/store'

// OCU sits with the CAT levels (right of D), not with the tag group (owner,
// 22 Aug 26 — "move ocu to the right of D"): it IS a category, so it reads as
// one more rung on the A–D ladder rather than a tag beside SXO/SANS.
const HL_CHIPS: [string, string, string][] = [
  ['A', 'A', 'Cat A (4-ship FL)'], ['B', 'B', 'Cat B (2-ship FL)'], ['C', 'C', 'Cat C (operational wingman)'], ['D', 'D', 'Cat D (wingman)'],
  ['OCU', 'OCU', 'OCU (ab-initio)'],
]
const HL_CHIPS2: [string, string, string][] = [
  ['SUP', 'SUP', 'Supervisors — Cat A & B'], ['FL', 'FL', 'All flight leads (Cat A & B)'], ['INS', 'Ins', 'Instructors (IW / IP / IR / FI)'],
  ['SXO', 'SXO', 'SXO-qualified'], ['SANS', 'SANS', 'SANS — staff-assigned & NS aircrew'],
]
/* the same category keys/labels the calendar puck-picker lights up by (owner,
   23 Aug 26 — "highlight buttons to select and light up those who are in that
   category"). Exported so the picker reads ONE list, not a second copy that
   could drift from these chips. */
export const HL_CATS: [string, string, string][] = [...HL_CHIPS, ...HL_CHIPS2]

export function HlChips() {
  const chip = ([k, t, ttl]: [string, string, string]) => (
    <button key={k} className={'fchip' + (HLSET.has(k) ? ' on' : '')} data-hl={k} title={ttl}
      onClick={() => { HLSET.has(k) ? HLSET.delete(k) : HLSET.add(k); notify() }}>{t}</button>
  )
  return (
    <>
      {HL_CHIPS.map(chip)}
      {/* .hl-div, not a bare .div: the phone fold hides the chips AND this
          divider by class, and a bare .div could not be told apart from the
          week seg's .wkdiv sitting in the same row */}
      <span className="div hl-div"></span>
      {HL_CHIPS2.map(chip)}
    </>
  )
}
