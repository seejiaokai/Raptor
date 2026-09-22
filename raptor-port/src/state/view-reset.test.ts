/* THE SESSION-STATE RESET REGISTRY (ARCH-STACK 1b, RC6/ARCH-06).
   view.ts's VIEW_RESET is the ONE declared home for which transient view-state
   resets on a login/logout ('session') and which on a week swap ('week').
   resetSession and loadWeek (store.ts) iterate it instead of hand-listing the
   clears, which is what kept the two lists from drifting.

   This file pins three things:
     · resetViewState('session') clears every session-scoped field;
     · resetViewState('week') clears every week-scoped field AND leaves the
       session-only ones (Inputs-page view, Highlight fold) standing, because a
       cross-week scrub must not refold the strip or drop the calendar month;
     · THE DRIFT GUARD — every Set/Map the module exports is either registered
       in VIEW_RESET or explicitly exempted here with a reason. Add a new panel
       Set and forget its reset policy, and this test fails instead of the leak
       shipping silently. */
import { afterEach, describe, expect, it } from 'vitest'
import * as view from './view'

/* put every registry field into a non-default state, so a clear is observable */
function dirtyAll() {
  view.DPREV.set(0, 'orig'); view.VWORK.add(0); view.AVSHUT.add(1); view.PIOPEN.add(2)
  view.LATEOFF.add('i1'); view.BELLLIT.add('viewsched|bane'); view.WARNOFF.add('w1')
  view.WMOPEN.add(3); view.NOTEPUB.add('pn:0')
  view.setHistMode(true); view.setCarryDay(5)
  view.setHlOpen(true); view.setHlGroup('cat'); view.setInpView('cal'); view.setCalMonth({ y: 2026, m: 7 }); view.setMedAsOf('2026-07-01')
  view.setRestArm(1, 'orig')
  view.setRosDay(4); view.setSecDefOffer(2)
  view.setAvailWin({ di: 0, item: 'r:x', ver: '', name: 'OPS BRIEF', when: '', tab: 'who' })
}
const setsEmpty = () =>
  view.DPREV.size === 0 && view.VWORK.size === 0 && view.AVSHUT.size === 0 && view.PIOPEN.size === 0 &&
  view.LATEOFF.size === 0 && view.BELLLIT.size === 0 && view.WARNOFF.size === 0 && view.WMOPEN.size === 0 &&
  view.NOTEPUB.size === 0

afterEach(() => { view.resetViewState('session'); view.resetViewState('week') })

describe('the reset registry', () => {
  it("resetViewState('session') clears every session-scoped field", () => {
    dirtyAll()
    view.resetViewState('session')
    expect(setsEmpty(), 'the panel/preview sets are cleared').toBe(true)
    expect(view.HISTMODE).toBe(false)
    expect(view.CARRYDAY).toBe(null)
    expect(view.HLOPEN).toBe(false)
    expect(view.HLGROUP, 'the expanded highlight group tab resets (leak the registry closed)').toBe('')
    expect(view.INPVIEW).toBe('table')
    expect(view.CALMONTH).toBe(null)
    expect(view.MEDASOF).toBe(null)
    expect(view.RESTARM, 'the load-onto-working-copy confirm resets (leak the registry closed)').toBe(null)
    expect(view.AVAILWIN, "the counter's window closes on a login/logout (D66, Fable S12)").toBe(null)
  })

  it("resetViewState('week') clears the week fields but leaves the session-only page state standing", () => {
    dirtyAll()
    view.resetViewState('week')
    expect(setsEmpty(), 'the panel/preview sets are cleared').toBe(true)
    expect(view.HISTMODE).toBe(false)
    expect(view.CARRYDAY).toBe(null)
    expect(view.ROSDAY).toBe(0)
    expect(view.SECDEFOFFER).toBe(null)
    expect(view.RESTARM, 'the working-copy confirm is cancelled by a week swap too').toBe(null)
    expect(view.AVAILWIN, "the counter's window closes on a week swap (D66, Fable S4)").toBe(null)
    /* session-only view state survives a week swap on purpose */
    expect(view.HLGROUP, 'Highlight group tab survives a week swap').toBe('cat')
    expect(view.HLOPEN, 'Highlight fold survives a week swap').toBe(true)
    expect(view.INPVIEW, 'Inputs-page view survives a week swap').toBe('cal')
    expect(view.CALMONTH, 'calendar month survives a week swap').toEqual({ y: 2026, m: 7 })
    expect(view.MEDASOF, 'medical as-of survives a week swap').toBe('2026-07-01')
  })

  it("resetViewState('session') does not touch the week-only fields (they belong to the week swap)", () => {
    view.setRosDay(6); view.setSecDefOffer(4)
    view.resetViewState('session')
    expect(view.ROSDAY).toBe(6)
    expect(view.SECDEFOFFER).toBe(4)
  })

  /* THE DRIFT GUARD. Every exported Set/Map is either in VIEW_RESET or exempt
     here for a stated reason. A new panel Set added without a reset policy trips
     this — the whole point of the registry. */
  it('every exported Set/Map has a declared reset policy or a stated exemption', () => {
    const registered = new Set(view.VIEW_RESET.map(e => e.name))
    /* cleared by a DEDICATED path, or self-expiring — not part of the flat
       session/week clear list, so intentionally outside VIEW_RESET */
    const EXEMPT: Record<string, string> = {
      HLSET: 'cleared by clearOtherHL (highlight chips + search together)',
      DWOPEN: 'cleared by selDrop (with the person/warning selection)',
      STSAVED: 'self-expiring "just saved" flash map, pruned on read',
      FRESHADD: 'self-expiring freshly-added flash set, per-key timers',
      FRESHOUT: 'self-expiring fade-out set, per-key timers',
    }
    const unaccounted: string[] = []
    for (const [name, val] of Object.entries(view)) {
      if (val instanceof Set || val instanceof Map) {
        if (!registered.has(name) && !(name in EXEMPT)) unaccounted.push(name)
      }
    }
    expect(unaccounted, `these exported Set/Map view-state fields have no reset policy — add them to VIEW_RESET (with a 'session'/'week' scope) or exempt them in this test with a reason: ${unaccounted.join(', ')}`).toEqual([])
  })

  it('every VIEW_RESET entry names a real export and carries at least one scope', () => {
    for (const e of view.VIEW_RESET) {
      expect((view as any)[e.name] !== undefined || ['HISTMODE', 'CARRYDAY', 'HLOPEN', 'INPVIEW', 'CALMONTH', 'MEDASOF', 'ROSDAY', 'SECDEFOFFER'].includes(e.name), `${e.name} is a real view export`).toBe(true)
      expect(e.scopes.length, `${e.name} has a scope`).toBeGreaterThan(0)
    }
  })
})
