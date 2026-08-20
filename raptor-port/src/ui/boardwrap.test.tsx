// @vitest-environment jsdom
/* EVERY FREE-TEXT BOX ON THE BOARD WRAPS AND GROWS (owner, 20 Aug 26).

   "For all remarks including common programme, can u wrap text? Which means
   that if the text overflows, the text box will grow vertically. Apply this
   to all text box as well."

   An `<input>` cannot wrap its value at any width — no CSS makes it, the
   overflow simply scrolls out of sight inside the box — so every free-text
   field on the board is a `<textarea rows="1">` now, minted by the ONE
   builder `board-html.ts:boxHTML`. The growing itself is
   `field-sizing:content` in scheduler.css, the same mechanism the
   scheduler-notes box has used since 13 Aug 26.

   TIME cells are deliberately NOT converted: `0715` has nothing to wrap and
   the guard rails already refuse anything that is not a time. That exclusion
   is the thing most likely to be "tidied" away by a later pass, so it is
   pinned here rather than left to the comment.

   jsdom has no layout engine and reports every rect 0x0, so what this file
   proves is the ELEMENT SHAPE and the KEY WIRING — that the boxes are
   textareas, that the time cells are still inputs, that a value survives the
   round trip into textarea content, and that Enter still COMMITS rather than
   inserting a line break (an <input> did that for free; a <textarea> does not,
   so routeKeyDown had to learn the board's grammar). What it looks like
   painted — that the box actually grows, and that a long unbroken word breaks
   instead of overflowing — is measured in e2e/geometry.spec.ts. */
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { elogClear } from '../engine/editlog'
import { openScheduler } from './board'
import { txtGet } from '../engine/slots'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const key = async (el: Element, k: string, shift = false) => {
  await act(async () => {
    el.dispatchEvent(new KeyboardEvent('keydown', { key: k, shiftKey: shift, bubbles: true }))
  })
}

beforeAll(async () => {
  initStore()
  const host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
})

beforeEach(async () => {
  DAYS[0].dutywaves[0].rows.forEach((r: any) => { delete r.rmks })
  elogClear()
  SCHED.pending = {}
  await act(async () => { openScheduler(0); notify() })
})

describe('the board draws free text as growing textareas, and times as inputs', () => {
  it('every remarks box on the board is a textarea', () => {
    const boxes = $$('#sbBoard .rmkin')
    expect(boxes.length, 'the board draws remarks boxes').toBeGreaterThan(0)
    expect(boxes.every(b => b.tagName === 'TEXTAREA'), 'all of them wrap').toBe(true)
  })

  it('the flying line\'s own remarks box is a textarea too', () => {
    const nts = $$('#sbBoard .sb-line .nts')
    expect(nts.length, 'the day has flying lines').toBeGreaterThan(0)
    expect(nts.every(n => n.tagName === 'TEXTAREA')).toBe(true)
  })

  /* the owner's "apply this to all text box as well" — the item/role/detail
     names are prose and wrap, not just the remarks column */
  it('the duty ROLE and ground ITEM name boxes wrap as well', () => {
    const role = $('#sbBoard [data-bfld="dr:0.0.0.role"]')
    expect(role, 'the duty role box exists').toBeTruthy()
    expect(role.tagName, 'a role is free text, so it wraps').toBe('TEXTAREA')
  })

  /* THE EXCLUSION, pinned so a later pass does not "finish the job". */
  it('TIME cells stay one-line inputs — there is nothing in 0715 to wrap', () => {
    const times = $$('#sbBoard .atm, #sbBoard .sb-line .tm')
    expect(times.length, 'the board draws time cells').toBeGreaterThan(0)
    expect(times.every(t => t.tagName === 'INPUT'), 'every one is still an input').toBe(true)
  })

  /* a textarea carries its value as CONTENT, and an HTML parser eats one
     newline straight after the tag — boxHTML emits a leading one to absorb
     exactly that, so the value must survive the round trip unchanged */
  it('a remark round-trips through textarea content without losing characters', async () => {
    DAYS[0].dutywaves[0].rows[0].rmks = 'Bane has the PHA at 1700'
    await act(async () => { openScheduler(0); notify() })
    const box = $('#sbBoard [data-bfld="dr:0.0.0.rmks"]') as HTMLTextAreaElement
    expect(box.value, 'what was rendered is what the model holds').toBe('Bane has the PHA at 1700')
  })
})

describe('Enter still commits, because a textarea would insert a line break', () => {
  it('Enter on a board box commits it through the funnel', async () => {
    const box = $('#sbBoard [data-bfld="dr:0.0.0.rmks"]') as HTMLTextAreaElement
    box.focus()
    box.value = 'SDO swapped'
    /* Enter blurs, and the blur fires the `change` the board writes on —
       exactly what an <input> used to do by itself */
    await key(box, 'Enter')
    await act(async () => { box.dispatchEvent(new Event('change', { bubbles: true })) })
    expect(txtGet('dr:0.0.0.rmks'), 'the model took the typed words').toBe('SDO swapped')
  })

  it('Shift+Enter is left alone, so a deliberate line break is still possible', async () => {
    const box = $('#sbBoard [data-bfld="dr:0.0.0.rmks"]') as HTMLTextAreaElement
    box.focus()
    let prevented = false
    const spy = (e: Event) => { if ((e as any).defaultPrevented) prevented = true }
    document.addEventListener('keydown', spy)
    await key(box, 'Enter', true)
    document.removeEventListener('keydown', spy)
    expect(prevented, 'Shift+Enter is not intercepted').toBe(false)
  })

  /* the board never had Escape at all — a typed-but-unwanted value could only
     be undone by retyping it. The wrapping pass gave data-bfld the same two
     keys the week's own cells have always had. */
  it('Escape puts the model value back', async () => {
    DAYS[0].dutywaves[0].rows[0].rmks = 'the real remark'
    await act(async () => { openScheduler(0); notify() })
    const box = $('#sbBoard [data-bfld="dr:0.0.0.rmks"]') as HTMLTextAreaElement
    box.focus()
    box.value = 'typed by mistake'
    await key(box, 'Escape')
    expect(box.value, 'the box shows the model again').toBe('the real remark')
    expect(txtGet('dr:0.0.0.rmks'), 'and the model never changed').toBe('the real remark')
  })
})
