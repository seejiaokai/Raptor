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
import { HL_GROUPS } from './hlchips-model'

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
