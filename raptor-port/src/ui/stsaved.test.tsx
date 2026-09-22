// @vitest-environment jsdom
/* THE STORES FREE-TEXT SAVE CONFIRM (owner, 26 Aug 26 — "there's like no
   indication or feedback that when I type in free text on config that it's
   accepting my input… idk if it's saved or not. But it's actually saved.")

   The box commits on blur with nothing shown, so a commit that CHANGED the
   load pulses the box green (.stsaved). The class cannot live on the DOM
   node alone: the commit's own deferred repaint rebuilds the day and would
   swallow the flash — so textedit.ts records the address in STSAVED
   (state/view.ts) and both builders re-add the class while that short
   window is open. These pin the three halves: a changed commit flashes and
   the flash SURVIVES the repaint; an untouched blur claims nothing; and an
   expired window renders clean again (with the registry pruned on read). */
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { HOOKS } from '../engine/hooks'
import { STSAVED, stSavedOn } from '../state/view'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const blur = async (el: Element) => {
  await act(async () => { el.dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
  /* long enough for txtCommit's deferred afterSchedMutate — the repaint the
     flash has to survive */
  await act(async () => { await new Promise(r => setTimeout(r, 5)) })
}

let host: HTMLDivElement
let root: Root

/* THE WINDOW IS 1400ms OF REAL CLOCK TIME (STSAVED_MS), and three of the tests
   below read a window opened earlier — one of them across a TEST BOUNDARY
   ("the board builder re-reads the same window", which reads the key the first
   test left). So the file was asserting on a race between its own speed and a
   1.4-second timer.

   It lost that race twice on 22 Sep 26, on the two full-suite runs taken while
   the tracker smoke and the browser gate were running alongside: vitest's own
   timings recorded these tests at 1557ms and 2439ms — LONGER than the window
   they depend on — and the failure was `expected false to be true`, the flash
   already expired. Reproduced deliberately by stalling 1500ms before the read,
   which gives the identical assertion failure. The file passes 6/6 alone, so
   nothing here is wrong about the product: the 1400ms window is the owner's
   26 Aug contract and is correct.

   FREEZE THE CLOCK, so elapsed REAL time cannot decide the result. Only
   `Date.now` is stubbed, not the timers, so the deferred-repaint waits in
   `blur()` still work as they did. The expiry test is untouched by this and
   still tests expiry: it stamps its own PAST timestamp (`Date.now() - 1`),
   which is still in the past against a frozen now. */
const NOW = Date.UTC(2026, 8, 22, 9, 0, 0)
let nowSpy: ReturnType<typeof vi.spyOn> | null = null

beforeAll(async () => {
  nowSpy = vi.spyOn(Date, 'now').mockReturnValue(NOW)
  initStore()
  HOOKS.isPhone = () => false
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
})

/* Unmount before the file ends: a render task left queued by the last test
   would otherwise fire after vitest tears jsdom down and die with "window is
   not defined" — an unhandled error that fails the job while every test
   passed (the teardown race closed across the suite, 10 Sep 26). */
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
  nowSpy?.mockRestore()
})

describe('the .stsaved confirm on the stores free-text box', () => {
  it('a CHANGED commit flashes, and the flash survives the deferred repaint', async () => {
    const bo = $('#eWeek .bombs[data-bombs]') as any
    expect(bo, 'a bombs box renders on the edit week').toBeTruthy()
    const addr = bo.dataset.bombs!
    bo.textContent = '2 X GBU-38'
    await blur(bo)
    /* the repaint rebuilt the day — find the box at the same address and it
       still wears the class, because the builder re-reads STSAVED */
    const fresh = $$('#eWeek .bombs[data-bombs]').find(e => e.dataset.bombs === addr)!
    expect(fresh.classList.contains('stsaved'),
      'the rebuilt box still carries the confirm').toBe(true)
    expect(stSavedOn(addr), 'the registry holds the address').toBe(true)
  })

  it('the board builder re-reads the same window for the same address', async () => {
    /* the week commit above is still inside its window; the board renders
       the identical cell off its own builder and must agree */
    const addr = [...STSAVED.keys()][0]
    expect(addr, 'the window from the previous commit is open').toBeTruthy()
    const { openScheduler } = await import('./board')
    await act(async () => { openScheduler(+addr.split('.')[0]) })
    const cell = $$('.sb-boardwrap .bombs[data-bombs]').find(e => e.dataset.bombs === addr)!
    expect(cell, 'the board renders the same box').toBeTruthy()
    expect(cell.classList.contains('stsaved'), 'and it wears the confirm too').toBe(true)
  })

  it('an untouched blur saves nothing and claims nothing', async () => {
    STSAVED.clear()
    const bo = $$('#eWeek .bombs[data-bombs]').find(e => !(e.textContent || '').trim())!
    expect(bo, 'an empty bombs box exists to tab through').toBeTruthy()
    await blur(bo)
    expect(STSAVED.size, 'no window opened').toBe(0)
    expect(bo.classList.contains('stsaved')).toBe(false)
  })

  /* Enter/Escape reached this box on 26 Aug 26 (owner, twice — "there's no
     feedback when adding config in the free text": Enter only inserted an
     invisible line break, committing nothing). Enter is intercepted and
     commits by blurring into routeFocusOut; Escape restores the model text.
     jsdom's blur() does not reliably fire focusout, so the commit half is
     driven by the explicit focusout the other tests already use. */
  it('Enter in the box is intercepted — it can never type a line break', async () => {
    STSAVED.clear()
    const bo = $('#eWeek .bombs[data-bombs]') as any
    bo.textContent = 'PODS'
    const ev = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    await act(async () => { bo.dispatchEvent(ev) })
    expect(ev.defaultPrevented).toBe(true)
    await blur(bo)
    expect(stSavedOn(bo.dataset.bombs), 'and the commit that follows flashes').toBe(true)
  })

  it('Escape restores the model text mid-type', async () => {
    const bo = $('#eWeek .bombs[data-bombs]') as any
    bo.textContent = 'KNOWN'
    await blur(bo)
    const fresh = $$('#eWeek .bombs[data-bombs]').find(e => e.dataset.bombs === bo.dataset.bombs)! as any
    fresh.textContent = 'half-typed garba'
    const ev = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    await act(async () => { fresh.dispatchEvent(ev) })
    expect(ev.defaultPrevented).toBe(true)
    expect(fresh.textContent, 'the committed value is back').toBe('KNOWN')
  })

  it('an expired window renders clean and is pruned on read', async () => {
    const bo = $('#eWeek .bombs[data-bombs]') as any
    const addr = bo.dataset.bombs!
    STSAVED.set(addr, Date.now() - 1)
    expect(stSavedOn(addr), 'expired reads false').toBe(false)
    expect(STSAVED.has(addr), 'and the read pruned the key').toBe(false)
    await act(async () => { notify() })
    const fresh = $$('#eWeek .bombs[data-bombs]').find(e => e.dataset.bombs === addr)!
    expect(fresh.classList.contains('stsaved')).toBe(false)
  })
})
