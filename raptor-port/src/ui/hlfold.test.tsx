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
  await act(async () => { view.HLSET.clear(); view.setSearch(''); view.setHlOpen(false); notify() })
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
    expect(chips.length).toBe(10)
    expect(chips.map(c => c.dataset.hl)).toContain('OCU')
    expect($('#page-viewsched .filters .hl-div'), 'and the divider between the two groups').toBeTruthy()
  })
})
