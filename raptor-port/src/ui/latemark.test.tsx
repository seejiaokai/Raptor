// @vitest-environment jsdom
/* THE LATE MARKS CAN BE SWITCHED OFF (owner, 20 Aug 26 — "can u give the
   scheduler board the option to remove late input tags?").

   The mark has never had an off switch: VCONF.inputLead's most permissive
   value is 0 ("due by the Monday itself"), so a squadron that runs no input
   deadline could not silence it short of a rule change. HANDOFF has carried
   that as a known gap since the mark shipped on 9 Aug 26.

   What this pins is the SHAPE of the answer, which is the part a later pass
   could get wrong:
     - it is a SWITCH, reversible by pressing it again, not a per-badge delete
       that would need a way back;
     - it is a UI gate, so `isLateInput` goes on answering and the mark stays
       what §Stable decisions says it is — a mark, never a warning;
     - it covers every SCHEDULE surface at once (board and week), because all
       four helpers funnel through one read;
     - the Inputs page keeps its own mark — that page is the paperwork record;
     - a member cannot throw it, on their own late input or anyone else's.

   The seed carries four genuinely late inputs, all on Jul 14 (day 1), and the
   deadline is derived from CURWEEK rather than the clock — so this is
   deterministic whatever day it is run on. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, resetSession } from '../state/store'
import { INPUTS, isLateInput } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import * as view from '../state/view'
import { openScheduler } from './board'
import { sbInputsGroupPanel } from './board-html'
import { lateTag, dayHTML } from './html'
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
  if (!view.LATEMARK) await act(async () => { view.setLateMark(true); notify() })
})

describe('the LATE-mark switch', () => {
  it('the seed really does carry late inputs, so the rest of this file is not vacuous', () => {
    expect(lateSeeds().length, 'late inputs in the seed').toBeGreaterThan(0)
    expect(lateSeeds().some((i: any) => i.date === 'Jul 14'), 'some on the day this file drives').toBe(true)
  })

  it('a live Personal Inputs panel carries the switch; a read-only one does not', () => {
    expect(sbInputsGroupPanel(DAYS[LATE_DI], LATE_DI)).toContain('data-latetog')   // ro undefined → live
    expect(sbInputsGroupPanel(DAYS[LATE_DI], LATE_DI, true), 'a preview offers no controls').not.toContain('data-latetog')
  })

  /* The label is the board bar's `.bi`/`.bl` idiom — "LATE" on a phone, "LATE
     marks" on a desktop — because spelling out "Hide LATE marks" made this
     panel head the tallest on the board (79px to 145px at 390px; it is 90px
     now, level with Unavailable). So the STATE cannot ride the words: it rides
     the `on` class and aria-pressed, lit when the marks are suppressed, which
     is the board History toggle's precedent. The full sentence is in the title
     for both states. */
  it('the state rides the pressed class, not the label — the label is too short to carry it', () => {
    const on = sbInputsGroupPanel(DAYS[LATE_DI], LATE_DI)
    expect(on).toContain('aria-pressed="false"')
    expect(on, 'not lit while the marks are showing').not.toContain('latetog on')
    expect(on, 'and the tooltip says what pressing it does').toContain('Hide the LATE marks')

    view.setLateMark(false)
    const off = sbInputsGroupPanel(DAYS[LATE_DI], LATE_DI)
    expect(off).toContain('aria-pressed="true"')
    expect(off, 'lit while the marks are suppressed').toContain('latetog on')
    expect(off).toContain('Show the LATE marks')
    view.setLateMark(true)
  })

  it('throwing it clears every LATE mark on the board, and a second press brings them back', async () => {
    await act(async () => { openScheduler(LATE_DI); notify() })
    const before = $$('#schedBoard .latetag').length
    expect(before, 'the board draws the marks by default').toBeGreaterThan(0)

    await click($('#schedBoard [data-latetog]'))
    expect($$('#schedBoard .latetag').length, 'every mark is gone').toBe(0)
    expect(TOASTS.join(' '), 'and it says where they still are').toContain('Inputs page')

    await click($('#schedBoard [data-latetog]'))
    expect($$('#schedBoard .latetag').length, 'pressing it again is the way back').toBe(before)
  })

  it('the week is covered by the same switch — one read, every schedule surface', () => {
    expect(dayHTML(LATE_DI, true), 'the week draws them').toContain('latetag')
    view.setLateMark(false)
    expect(dayHTML(LATE_DI, true), 'and stops with the board').not.toContain('latetag')
    view.setLateMark(true)
  })

  /* The mark is a display of an engine fact, not the fact itself. Turning the
     display off must not change what the engine says an input IS — that is
     what keeps the Inputs page (which reads `isLateInput` straight) still
     telling a member their input was filed late, and what keeps this from
     quietly becoming a rule change. */
  it('the engine is untouched — the input is still late, it is only unprinted', () => {
    const inp = lateSeeds()[0]
    view.setLateMark(false)
    expect(isLateInput(inp), 'the engine still answers').toBe(true)
    expect(lateTag(inp), 'the schedule surfaces simply print nothing').toBe('')
    view.setLateMark(true)
    expect(lateTag(inp)).toContain('LATE')
  })

  it('a member cannot throw it, even with a hand-made button', async () => {
    await act(async () => { openScheduler(LATE_DI); notify() })
    await act(async () => { setSession({ user: 'user', role: 'main' }); notify() })
    const bait = document.createElement('button')
    bait.setAttribute('data-latetog', '1')
    document.body.appendChild(bait)
    await click(bait)
    expect(view.LATEMARK, 'the marks stay').toBe(true)
    expect(TOASTS.join(' ')).toContain('Only a scheduler')
    bait.remove()
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  })

  /* A view mode, so it belongs to the session that set it — the same rule
     HISTMODE and the Available-crew folds follow. The next user must not
     inherit a board with the marks quietly switched off. */
  it('a session change puts the marks back on', async () => {
    view.setLateMark(false)
    await act(async () => { resetSession(null); notify() })
    expect(view.LATEMARK).toBe(true)
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  })
})
