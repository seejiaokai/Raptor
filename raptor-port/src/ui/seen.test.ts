// @vitest-environment jsdom
/* A SAVE THE SCREEN SHOWS SAYS NOTHING (ui/seen.ts — owner D851, D854; the design guide's §1, D850).
   jsdom lays nothing out, so the browser's two answers — how big a box is, and what stands at a point — are handed in
   here; the same rule on real boxes is the browser tests' (e2e/feedback-marks.spec.ts). */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { HOOKS } from '../engine/hooks'
import { inView, noteUnlessSeen, SEEN_FIRST_MS, SEEN_SETTLE_MS } from './seen'
import { toast as theToast } from './toast'

const toast = HOOKS.toast
let SAID: Array<[string, any]> = []
const box = (el: Element, r: { top: number, left: number, width: number, height: number } | null) => {
  (el as any).getBoundingClientRect = () => r
    ? { ...r, right: r.left + r.width, bottom: r.top + r.height, x: r.left, y: r.top, toJSON() {} }
    : { top: 0, left: 0, width: 0, height: 0, right: 0, bottom: 0, x: 0, y: 0, toJSON() {} }
}
/** the page is laid out, and `at` says what stands at a point */
const layOut = (at: (x: number, y: number) => Element | null) => {
  box(document.documentElement, { top: 0, left: 0, width: 390, height: 844 })
  ;(document as any).elementFromPoint = at
}
const card = (iid: string, r: { top: number, left: number, width: number, height: number } | null = { top: 100, left: 20, width: 300, height: 40 }) => {
  const el = document.createElement('div')
  el.setAttribute('data-fresh', iid)
  el.appendChild(document.createElement('span'))
  document.body.appendChild(el); box(el, r)
  return el
}
const spoken = () => document.getElementById('srSay')?.textContent || ''

beforeEach(() => {
  vi.useFakeTimers()
  SAID = []
  HOOKS.toast = ((m: any, k: any) => { SAID.push([String(m), k]) }) as any
})
afterEach(() => {
  vi.useRealTimers()
  HOOKS.toast = toast
  document.body.innerHTML = ''
  delete (document as any).elementFromPoint
  delete (document.documentElement as any).getBoundingClientRect
})

describe('in view — wholly on screen, with nothing drawn over it (D672)', () => {
  it('a box whose top, middle and foot are all its own is in view', () => {
    const el = card('a')
    layOut(() => el.firstElementChild)
    expect(inView(el)).toBe(true)
  })
  it('one covered at any of the three is not — a window over it, the top bar over its head, a scroller cutting its foot', () => {
    const el = card('a'), over = document.createElement('div')
    document.body.appendChild(over)
    for (const cut of [0, 1, 2]) {
      let n = 0
      layOut(() => (n++ % 3 === cut ? over : el))
      expect(inView(el), `point ${cut}`).toBe(false)
    }
  })
  it('one off the screen is not (nothing stands at its points), nor one that is not laid out', () => {
    const el = card('a')
    layOut(() => null)
    expect(inView(el)).toBe(false)
    const flat = card('b', null)
    layOut(() => flat)
    expect(inView(flat)).toBe(false)
    expect(inView(null)).toBe(false)
  })
})

describe('the note after a save — said only where the saved thing cannot be seen', () => {
  it('where nothing is laid out (a hidden page, jsdom) it is said at once — nothing can be seen', () => {
    card('a')
    noteUnlessSeen('a', 'Input added', 'ok')
    expect(SAID).toEqual([['Input added', 'ok']])
  })
  it('in view, wearing the mark: no note — and a screen reader is told the same words', () => {
    const el = card('a')
    layOut(() => el)
    noteUnlessSeen('a', 'Input added', 'ok')
    expect(SAID, 'nothing at once').toEqual([])
    vi.advanceTimersByTime(SEEN_FIRST_MS + SEEN_SETTLE_MS + 50)
    expect(SAID, 'and nothing later').toEqual([])
    const live = document.getElementById('srSay')!
    expect(live.getAttribute('role')).toBe('status')
    expect(live.getAttribute('aria-live')).toBe('polite')
    expect(spoken()).toBe('Input added')
  })
  it('the same words twice are told twice (the region is emptied first)', () => {
    const el = card('a')
    layOut(() => el)
    noteUnlessSeen('a', 'Input updated', 'ok'); vi.advanceTimersByTime(SEEN_FIRST_MS + 50)
    expect(spoken()).toBe('Input updated')
    noteUnlessSeen('a', 'Input updated', 'ok'); vi.advanceTimersByTime(SEEN_FIRST_MS)
    expect(spoken(), 'emptied, then said').toBe('')
    vi.advanceTimersByTime(50)
    expect(spoken()).toBe('Input updated')
  })
  it('marked but not yet on screen: it waits for the page to come to it, then says nothing', () => {
    const el = card('a')
    let there = false
    layOut(() => (there ? el : null))
    noteUnlessSeen('a', 'Input added', 'ok')
    vi.advanceTimersByTime(SEEN_FIRST_MS)
    expect(SAID).toEqual([])
    there = true
    vi.advanceTimersByTime(SEEN_SETTLE_MS + 50)
    expect(SAID).toEqual([])
    expect(spoken()).toBe('Input added')
  })
  it('marked and still covered once the page has settled: the note is raised', () => {
    const el = card('a'), over = document.createElement('div')
    document.body.appendChild(over)
    layOut(() => over)
    noteUnlessSeen('a', 'Input added', 'ok')
    vi.advanceTimersByTime(SEEN_FIRST_MS)
    expect(SAID, 'not before the page has had its time').toEqual([])
    vi.advanceTimersByTime(SEEN_SETTLE_MS)
    expect(SAID).toEqual([['Input added', 'ok']])
    expect(el.isConnected).toBe(true)
  })
  it('nothing on the page wears its mark: the note is raised at the first look, without the wait', () => {
    const other = card('someone-else')
    layOut(() => other)
    noteUnlessSeen('a', 'Input added', 'ok')
    vi.advanceTimersByTime(SEEN_FIRST_MS)
    expect(SAID).toEqual([['Input added', 'ok']])
  })
  it('what wears the mark is not laid out (a hidden view): the note at the first look — no scroll can bring it', () => {
    const hidden = card('a', null), other = card('someone-else')
    layOut(() => other)
    noteUnlessSeen('a', 'Input added', 'ok')
    vi.advanceTimersByTime(SEEN_FIRST_MS)
    expect(SAID).toEqual([['Input added', 'ok']])
    expect(hidden.isConnected).toBe(true)
  })
  it('one of two marks in view is enough (the list stays mounted under the calendar)', () => {
    const hidden = card('a', null), shown = card('a')
    layOut(() => shown)
    noteUnlessSeen('a', 'Input added', 'ok')
    vi.advanceTimersByTime(SEEN_FIRST_MS + SEEN_SETTLE_MS)
    expect(SAID).toEqual([])
    expect(hidden.isConnected).toBe(true)
  })
  /* THE FRESH READ'S F3 (14 Oct 26). A save's own after-pass raises its warning a beat AFTER the save returns — on
     purpose, so that it stands over the window's plain line (state/holderbase.ts: "LL does not go on the Ground
     Programme — its row has been removed"). The plain line now comes later still, and replaced it. A note raised
     since the save asked keeps the screen; the late words go to a screen reader only. With the app's real note. */
  for (const [how, covered] of [['nothing wears the mark', false], ['the mark is covered when the page has settled', true]] as const) {
    it(`a note raised since the save asked is not replaced by the late words (${how})`, () => {
      HOOKS.toast = theToast as any
      const over = document.createElement('div'); document.body.appendChild(over)
      if (covered) card('a')
      layOut(() => over)
      noteUnlessSeen('a', 'Input updated', 'ok')
      theToast('LL does not go on the Ground Programme — its row has been removed', 'warn')
      vi.advanceTimersByTime(SEEN_FIRST_MS + SEEN_SETTLE_MS + 50)
      expect(document.getElementById('toastEl')!.textContent, 'the warning stands').toBe('LL does not go on the Ground Programme — its row has been removed')
      expect(spoken(), 'and the words are still told to a screen reader').toBe('Input updated')
    })
  }
  it('with no note raised meanwhile the late words ARE the note, as before', () => {
    HOOKS.toast = theToast as any
    const over = document.createElement('div'); document.body.appendChild(over)
    theToast('an older note, from before the save', 'ok')
    layOut(() => over)
    noteUnlessSeen('a', 'Input updated', 'ok')
    vi.advanceTimersByTime(SEEN_FIRST_MS + 50)
    expect(document.getElementById('toastEl')!.textContent).toBe('Input updated')
  })
  /* a live region made and filled in the same breath is often not read the first time: it is made when the save asks,
     a beat before anything is put in it (the read's "worth a look") */
  it('the screen reader\'s region is on the page from the moment the save asks, empty', () => {
    const el = card('a')
    layOut(() => el)
    noteUnlessSeen('a', 'Input added', 'ok')
    const live = document.getElementById('srSay')
    expect(live, 'made at once').toBeTruthy()
    expect(live!.textContent).toBe('')
    vi.advanceTimersByTime(SEEN_FIRST_MS + 50)
    expect(spoken()).toBe('Input added')
  })
  it('an id that would break a selector is looked up safely', () => {
    const el = card('a"]b')
    layOut(() => el)
    noteUnlessSeen('a"]b', 'Input added', 'ok')
    vi.advanceTimersByTime(SEEN_FIRST_MS + SEEN_SETTLE_MS)
    expect(SAID).toEqual([])
  })
})
