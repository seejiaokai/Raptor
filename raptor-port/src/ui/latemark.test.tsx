// @vitest-environment jsdom
/* THE LATE MARK IS DISMISSED PER INPUT (owner, 21 Aug 26 — "show a late tag
   beside the applicable inputs … when I click on the late orange icon beside
   the line, it will remove the late icon, if I click the same area again it
   will show"). This replaced the 20 Aug global "Hide LATE marks" switch.

   What this pins is the SHAPE of the answer, which is the part a later pass
   could get wrong:
     - each late input carries its OWN clickable chip on the board's live rows,
       and tapping it is reversible by tapping the same spot again (the chip
       stays, as a ghost) — not a one-way delete;
     - it is a UI gate, so `isLateInput` goes on answering and the mark stays
       what §Stable decisions says it is — a mark, never a warning;
     - dropping one hides it on the board AND the week (both read `lateShown`),
       but leaves every OTHER late input showing;
     - the Inputs page keeps its own mark — that page is the paperwork record;
     - a member cannot drop it, on their own late input or anyone else's.

   The seed carries four genuinely late inputs, all on Jul 14 (day 1), and the
   deadline is derived from CURWEEK rather than the clock — so this is
   deterministic whatever day it is run on. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, resetSession } from '../state/store'
import { INPUTS, isLateInput, inpId } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import * as view from '../state/view'
import { openScheduler } from './board'
import { sbInputsGroupPanel } from './board-html'
import { lateTag, lateChip, dayHTML } from './html'
import { DAYS } from '../engine/data'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
/* Jul 14 — the day the seed's late inputs sit on */
const LATE_DI = 1
const lateSeeds = () => INPUTS.filter((i: any) => isLateInput(i))

let TOASTS: string[] = []

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  /* the board's controls are gated on HOOKS.editMode(), which is
     canEditSched() AND being on Edit Schedule — a duty crew who left the page
     with a board open must not get live controls */
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
  HOOKS.toast = (m: any) => { TOASTS.push(String(m)) }
})
beforeEach(async () => {
  TOASTS = []
  view.PIOPEN.add(LATE_DI)   // Personal Inputs folds by default now — expand the day this file drives so its rows render
  if (view.LATEOFF.size) await act(async () => { view.LATEOFF.clear(); notify() })
})

describe('the per-input LATE dismissal', () => {
  it('the seed really does carry late inputs, so the rest of this file is not vacuous', () => {
    expect(lateSeeds().length, 'late inputs in the seed').toBeGreaterThan(0)
    expect(lateSeeds().some((i: any) => i.date === 'Jul 14'), 'some on the day this file drives').toBe(true)
  })

  it('a live board input row carries a clickable LATE chip; the old header switch is gone', () => {
    const live = sbInputsGroupPanel(DAYS[LATE_DI], LATE_DI)  // ro undefined → live
    expect(live, 'no global switch any more').not.toContain('data-latetog')
    expect(live, 'the chip rides the row instead').toContain('data-lateoff')
    const ro = sbInputsGroupPanel(DAYS[LATE_DI], LATE_DI, true)
    expect(ro, 'a read-only preview shows the passive badge, no chip').not.toContain('data-lateoff')
  })

  it('the chip is solid while the mark shows and a pressed ghost once dropped', () => {
    const inp = lateSeeds().find((i: any) => i.date === 'Jul 14')!
    const on = lateChip(inp)
    expect(on).toContain('data-lateoff')
    expect(on).toContain('aria-pressed="false"')
    expect(on, 'not ghosted while showing').not.toContain('latechip off')

    view.LATEOFF.add(inpId(inp))
    const off = lateChip(inp)
    expect(off).toContain('aria-pressed="true"')
    expect(off, 'ghosted once dropped').toContain('latechip off')
    view.LATEOFF.clear()
  })

  it('dropping one mark clears only that input, and pressing its spot again brings it back', async () => {
    await act(async () => { openScheduler(LATE_DI); notify() })
    const chips = $$('#schedBoard [data-lateoff]')
    expect(chips.length, 'a late day draws a chip per late row').toBeGreaterThan(0)
    /* asserted PER INPUT since 22 Aug 26 — the board's read-only "Inputs ·
       day" summary band, which the old board-wide `.latetag` count read, was
       removed, and a raw badge count was never quite the claim anyway: an
       auto-landed activity input legitimately draws its badge on BOTH its
       Personal Inputs row and its promoted Ground row, so "one input
       dropped" can be two badges fewer. lateTag IS the one gate every
       passive surface prints through, so reading it per input is exact. */
    const dropped: any = INPUTS.find((i: any) => inpId(i) === chips[0].getAttribute('data-lateoff'))
    expect(dropped, 'the chip addresses a real input').toBeTruthy()
    const others = lateSeeds().filter((i: any) => i.date === 'Jul 14' && i !== dropped)

    await click(chips[0])
    expect(lateTag(dropped), 'the dropped input stops showing').toBe('')
    for (const o of others) expect(lateTag(o), `${o.person}'s mark stays`).not.toBe('')
    expect($$('#schedBoard [data-lateoff]').length, 'the chip itself stays, as a ghost').toBe(chips.length)
    expect(TOASTS.join(' '), 'and it says where it still is').toContain('Inputs page')

    await click($('#schedBoard [data-lateoff]'))
    expect(lateTag(dropped), 'pressing the same spot is the way back').not.toBe('')
  })

  it('the week is covered by the same read — one gate, every schedule surface', () => {
    const inp = lateSeeds().find((i: any) => i.date === 'Jul 14')!
    expect(dayHTML(LATE_DI, true), 'the week draws it').toContain('latetag')
    view.LATEOFF.add(inpId(inp))
    // the dropped input's badge is gone from the week too; others may remain,
    // so assert on the specific input via lateTag rather than the whole day.
    expect(lateTag(inp), 'the dropped one stops on the week as well').toBe('')
    view.LATEOFF.clear()
  })

  /* The mark is a display of an engine fact, not the fact itself. Turning the
     display off must not change what the engine says an input IS — that is
     what keeps the Inputs page (which reads `isLateInput` straight) still
     telling a member their input was filed late, and what keeps this from
     quietly becoming a rule change. */
  it('the engine is untouched — the input is still late, it is only unprinted', () => {
    const inp = lateSeeds()[0]
    view.LATEOFF.add(inpId(inp))
    expect(isLateInput(inp), 'the engine still answers').toBe(true)
    expect(lateTag(inp), 'the passive badge prints nothing').toBe('')
    view.LATEOFF.clear()
    expect(lateTag(inp)).toContain('LATE')
  })

  it('a member cannot drop it, even with a hand-made chip', async () => {
    await act(async () => { openScheduler(LATE_DI); notify() })
    const inp = lateSeeds().find((i: any) => i.date === 'Jul 14')!
    await act(async () => { setSession({ user: 'user', role: 'main' }); notify() })
    const bait = document.createElement('button')
    bait.setAttribute('data-lateoff', inpId(inp))
    document.body.appendChild(bait)
    await click(bait)
    expect(view.LATEOFF.has(inpId(inp)), 'the mark stays').toBe(false)
    expect(TOASTS.join(' ')).toContain('Only a scheduler')
    bait.remove()
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  })

  /* A view mode, so it belongs to the session that set it — the same rule
     HISTMODE and the Available-crew folds follow. The next user must not
     inherit a board with a mark quietly dropped. */
  it('a session change brings every dropped mark back', async () => {
    const inp = lateSeeds()[0]
    view.LATEOFF.add(inpId(inp))
    await act(async () => { resetSession(null); notify() })
    expect(view.LATEOFF.size).toBe(0)
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  })
})
