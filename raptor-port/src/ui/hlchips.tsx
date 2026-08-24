/* The Highlight chips — ONE definition, THREE surfaces (the view week, the
   edit week and the board's bar). The chip lists and the rendered strip lived
   in Shell.tsx while the view page was the only surface that drew them; the
   moment a second surface wanted the same strip they became a drift seam —
   two copies of one rule is where this app's recurring bugs come from
   (docs/feature-impact.md), so the strip moved into its own module and every
   surface renders <HlChips />. The chips read and mutate HLSET directly, the
   same in-place-Set idiom as every other view flag, so a chip toggled on any
   surface lights the other two on the same notify. */
import { HLSET, HLGROUP, toggleHlGroup } from '../state/view'
import { notify } from '../state/store'

/* THREE GROUPS behind three tabs (owner, 24 Aug 26 — "categorise them into CAT
   which includes A B C D Ocu, Then Type which consist of SANS, Ins, FL, SUP.
   Then Quals, which includes SXO, SC D, SC N, DAAR, NAAR, TF. So these sub
   categories will expand when selected"). Each tuple is [key, label, title];
   the key is what personMatchesCat (state/view.ts) reads, so adding a chip here
   is one edit, not two. OCU stays in CAT (it IS a rung on the A–D ladder), and
   SXO moved from the old tag row into Quals where the owner grouped it. */
const HL_CAT: [string, string, string][] = [
  ['A', 'A', 'Cat A (4-ship FL)'], ['B', 'B', 'Cat B (2-ship FL)'], ['C', 'C', 'Cat C (operational wingman)'], ['D', 'D', 'Cat D (wingman)'],
  ['OCU', 'OCU', 'OCU (ab-initio)'],
]
const HL_TYPE: [string, string, string][] = [
  ['SANS', 'SANS', 'SANS — staff-assigned & NS aircrew'], ['INS', 'Ins', 'Instructors (IW / IP / IR / FI)'],
  ['FL', 'FL', 'All flight leads (Cat A & B)'], ['SUP', 'SUP', 'Supervisors — Cat A & B'],
]
const HL_QUAL: [string, string, string][] = [
  ['SXO', 'SXO', 'SXO-qualified'], ['SCD', 'SC D', 'SC Day current'], ['SCN', 'SC N', 'SC Night current'],
  ['DAAR', 'DAAR', 'Day AAR qualified'], ['NAAR', 'NAAR', 'Night AAR qualified'], ['TF', 'TF', 'TF (terrain-following) qualified'],
]
const HL_GROUPS: [string, string, [string, string, string][]][] = [
  ['cat', 'CAT', HL_CAT], ['type', 'Type', HL_TYPE], ['quals', 'Quals', HL_QUAL],
]
/* the same category keys/labels the calendar puck-picker lights up by (owner,
   23 Aug 26 — "highlight buttons to select and light up those who are in that
   category"). Exported so the picker reads ONE list, not a second copy that
   could drift from these chips; it stays FLAT (a modal has the room, and a
   quick multi-select is faster without an accordion), but every key the strip
   knows, the picker knows too. */
export const HL_CATS: [string, string, string][] = [...HL_CAT, ...HL_TYPE, ...HL_QUAL]

export function HlChips() {
  const chip = ([k, t, ttl]: [string, string, string]) => (
    <button key={k} className={'fchip' + (HLSET.has(k) ? ' on' : '')} data-hl={k} title={ttl}
      onClick={() => { HLSET.has(k) ? HLSET.delete(k) : HLSET.add(k); notify() }}>{t}</button>
  )
  return (
    <>
      {HL_GROUPS.map(([gk, glabel, chips]) => {
        const open = HLGROUP === gk
        const active = chips.filter(([k]) => HLSET.has(k)).length
        return (
          /* the whole group — tab + its chips — is ONE .hl-grp unit so the
             phone fold hides it by class in a single selector, and the chips
             sit inline right after their own tab. .hl-gchips is display:none
             until .hl-grp.open, so all keys stay in the DOM (jsdom tests and
             the drift-seam doctrine both want them present); only their
             visibility is the accordion. */
          <span key={gk} className={'hl-grp' + (open ? ' open' : '')} data-hlgrp={gk}>
            <button type="button" className={'hl-gtab' + (open ? ' open' : '') + (active ? ' has' : '')}
              data-hlgrp-btn={gk} aria-expanded={open} title={`${glabel} filters — tap to ${open ? 'collapse' : 'expand'}`}
              onClick={() => { toggleHlGroup(gk); notify() }}>{glabel}{active ? <span className="hl-gn">{active}</span> : null}</button>
            <span className="hl-gchips">{chips.map(chip)}</span>
          </span>
        )
      })}
    </>
  )
}
