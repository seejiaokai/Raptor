// @vitest-environment jsdom
/* THE HIGHLIGHT STRIP ON BOTH WEEKS, AND ITS PHONE FOLD (owner, 23 Aug 26).
   The chips moved to ui/hlchips.tsx (one definition, three surfaces) and the
   edit page grew the same strip the view page has; on a phone both fold away
   behind a highlighter-icon toggle (.hl-tog) driving view.HLOPEN.
   jsdom pins the MARKUP and the state machine — which elements are rendered,
   what a click changes — and nothing about width: which of .hl-lab/.hl-tog is
   painted, and whether a folded chip really has no size, are media-query
   questions answered in e2e/geometry.spec.ts. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import * as view from '../state/view'
import { HL_GROUPS } from './hlchips'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
})

beforeEach(async () => {
  await act(async () => { view.HLSET.clear(); view.setSearch(''); view.setHlOpen(false); view.setHlGroup(''); notify() })
})

describe('the edit page carries the Highlight chips (owner, 23 Aug 26)', () => {
  it('renders the same data-hl chips as the view page, and a chip click toggles HLSET and .on', async () => {
    await click($('.nav a[data-page="editsched"]'))
    const chips = $$('#page-editsched .filters .fchip[data-hl]')
    expect(chips.length, 'the full chip set, not a subset').toBe(
      $$('#page-viewsched .filters .fchip[data-hl]').length)
    const sup = chips.find(c => c.dataset.hl === 'SUP')!
    await click(sup)
    expect(view.HLSET.has('SUP'), 'the click landed in the shared HLSET').toBe(true)
    expect($$('#page-editsched .filters .fchip[data-hl="SUP"]')[0].className).toContain('on')
    /* the SAME set lights the view page's copy — one definition, no drift */
    expect($$('#page-viewsched .filters .fchip[data-hl="SUP"]')[0].className).toContain('on')
    await click($$('#page-editsched .filters .fchip[data-hl="SUP"]')[0])
    expect(view.HLSET.has('SUP')).toBe(false)
  })
})

describe('the phone fold toggle (.hl-tog / view.HLOPEN)', () => {
  it('flips HLOPEN and the row gains/loses hl-open', async () => {
    await act(async () => { view.setPage('viewsched'); notify() })
    const tog = $('#page-viewsched .filters .hl-tog')
    expect(tog, 'the toggle is in the row').toBeTruthy()
    expect($('#viewChrome').className, 'folded to begin with').not.toContain('hl-open')
    await click(tog)
    expect(view.HLOPEN).toBe(true)
    expect($('#viewChrome').className).toContain('hl-open')
    expect(tog.getAttribute('aria-expanded'), 'the state is announced').toBe('true')
    await click(tog)
    expect(view.HLOPEN).toBe(false)
    expect($('#viewChrome').className).not.toContain('hl-open')
  })

  it('the edit row folds off the same flag', async () => {
    await act(async () => { view.setPage('editsched'); notify() })
    const row = $('#page-editsched .filters')
    expect(row.className).not.toContain('hl-open')
    await click($('#page-editsched .filters .hl-tog'))
    expect(view.HLOPEN).toBe(true)
    expect(row.className, 'one flag, every surface').toContain('hl-open')
  })
})

describe('the two-element lead — CSS picks one by width', () => {
  /* both are ALWAYS rendered, the histln/histln-top precedent: a resize
     answers instantly instead of waiting for a repaint. jsdom cannot say
     which is painted; it pins that both exist to be picked from. */
  it('the view page markup carries both .hl-lab and .hl-tog', () => {
    expect($('#page-viewsched .filters .hl-lab'), 'the desktop label').toBeTruthy()
    expect($('#page-viewsched .filters .hl-tog'), 'and the phone toggle').toBeTruthy()
  })

  it('the view page still carries its chips (regression — the move to hlchips.tsx)', () => {
    const chips = $$('#page-viewsched .filters .fchip[data-hl]')
    /* CAT(5) + Type(4) + Quals(6) = 15 keys, all in the DOM (the accordion
       only hides them with CSS). OCU stayed in CAT; DAAR is one of the new
       Quals keys (owner, 24 Aug 26). */
    expect(chips.length).toBe(15)
    expect(chips.map(c => c.dataset.hl)).toContain('OCU')
    expect(chips.map(c => c.dataset.hl)).toContain('DAAR')
    /* the three category tabs replace the old single divider */
    const tabs = $$('#page-viewsched .filters [data-hlgrp]')
    expect(tabs.map(t => t.dataset.hlgrp)).toEqual(['cat', 'type', 'quals'])
  })
})

describe('the CAT / Type / Quals accordion (owner, 24 Aug 26)', () => {
  it('a group tab flips view.HLGROUP and marks its .hl-grp open', async () => {
    await act(async () => { view.setPage('viewsched'); view.setHlGroup(''); notify() })
    const quals = $('#page-viewsched .filters [data-hlgrp="quals"] .hl-gtab')
    expect(quals, 'the Quals tab is present').toBeTruthy()
    await click(quals)
    expect(view.HLGROUP).toBe('quals')
    expect($('#page-viewsched .filters [data-hlgrp="quals"]').className).toContain('open')
    /* picking another collapses the first — one group open at a time */
    await click($('#page-viewsched .filters [data-hlgrp="cat"] .hl-gtab'))
    expect(view.HLGROUP).toBe('cat')
    expect($('#page-viewsched .filters [data-hlgrp="quals"]').className).not.toContain('open')
    /* tapping the open tab again collapses it */
    await click($('#page-viewsched .filters [data-hlgrp="cat"] .hl-gtab'))
    expect(view.HLGROUP).toBe('')
  })

  it('a collapsed group whose chip is active lights its tab with a count', async () => {
    await act(async () => { view.setPage('viewsched'); view.setHlGroup(''); view.HLSET.clear(); view.HLSET.add('TF'); notify() })
    const tab = $('#page-viewsched .filters [data-hlgrp="quals"] .hl-gtab')
    expect(tab.className, 'the Quals tab shows it holds a live filter').toContain('has')
    expect($('#page-viewsched .filters [data-hlgrp="quals"] .hl-gn')?.textContent).toBe('1')
  })
})

/* the MATCH SEMANTICS behind the chips (owner, 24 Aug 26): chips in the SAME
   category are ALTERNATIVES (OR), chips across DIFFERENT categories NARROW (AND).
   First ask — "SC D and CAT A … only those who are both" (different groups).
   Second ask — "CAT A and B for SC D" = (A or B) and SC-Day (same group OR, then
   AND across). Pure predicate, no DOM. */
describe('personMatchesHL — OR within a category, AND across categories', () => {
  beforeEach(() => { view.HLSET.clear(); view.setSearch('') })
  const both = { q: 'A', quals: { scDay: true } }        // CAT A AND SC-Day
  const catAonly = { q: 'A', quals: {} }                 // CAT A, no SC-Day
  const catBonly = { q: 'B', quals: {} }                 // CAT B, no SC-Day
  const catConly = { q: 'C', quals: {} }                 // CAT C, no SC-Day
  const scdOnly = { q: 'C', quals: { scDay: true } }     // SC-Day, not CAT A/B

  it('DIFFERENT categories narrow — CAT A and SC-Day lights only those who are both', () => {
    view.HLSET.add('A'); view.HLSET.add('SCD')
    expect(view.personMatchesHL(both), 'CAT A + SC-Day → lit').toBe(true)
    expect(view.personMatchesHL(catAonly), 'CAT A only → faded').toBe(false)
    expect(view.personMatchesHL(scdOnly), 'SC-Day only → faded').toBe(false)
  })

  it('the SAME category is alternatives — CAT A and CAT B lights either', () => {
    view.HLSET.add('A'); view.HLSET.add('B')
    expect(view.personMatchesHL(catAonly), 'a CAT A man → lit').toBe(true)
    expect(view.personMatchesHL(catBonly), 'a CAT B man → lit').toBe(true)
    expect(view.personMatchesHL(catConly), 'a CAT C man → faded').toBe(false)
  })

  it("the owner's case — (CAT A or B) and SC-Day", () => {
    view.HLSET.add('A'); view.HLSET.add('B'); view.HLSET.add('SCD')
    expect(view.personMatchesHL({ q: 'A', quals: { scDay: true } }), 'A + SC-Day → lit').toBe(true)
    expect(view.personMatchesHL({ q: 'B', quals: { scDay: true } }), 'B + SC-Day → lit').toBe(true)
    expect(view.personMatchesHL(catAonly), 'A but no SC-Day → faded').toBe(false)
    expect(view.personMatchesHL(scdOnly), 'SC-Day but CAT C → faded').toBe(false)
  })

  it('one lit chip still lights everyone in that category', () => {
    view.HLSET.add('A')
    expect(view.personMatchesHL(both)).toBe(true)
    expect(view.personMatchesHL(catAonly)).toBe(true)
    expect(view.personMatchesHL(scdOnly)).toBe(false)
  })

  it('search stays an independent highlight, lighting its name matches regardless of the chips', () => {
    view.HLSET.add('A'); view.HLSET.add('SCD')
    const ghost = { ...catAonly, cs: 'Ghost', name: 'Ghost' }   // fails the AND (no SC-Day)
    expect(view.personMatchesHL(ghost), 'no search, fails a chip → faded').toBe(false)
    view.setSearch('ghost')
    expect(view.personMatchesHL(ghost), 'name matches search → lit anyway').toBe(true)
    view.setSearch('')
  })
})

/* the group map behind that OR/AND must stay in step with the chips the tabs
   actually render: a chip added to HL_GROUPS but not HL_GROUP_OF would silently
   fall into its own group and AND when it should OR. Pin it both ways. */
describe('HL_GROUP_OF matches the rendered chip groups (drift guard)', () => {
  it('every rendered chip maps to its own tab group, and nothing extra', () => {
    const fromChips: Record<string, string> = {}
    for (const [gk, , chips] of HL_GROUPS) for (const [k] of chips) fromChips[k] = gk
    expect(view.HL_GROUP_OF).toEqual(fromChips)
  })
})
