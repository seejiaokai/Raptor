// @vitest-environment jsdom
/* THE PHONE BOARD'S TOP BAR AND ITS SWIPE (owner, 11 Aug 26).
   The seven Mon–Sun chips left the bar, so the day is reached by swiping the
   board sideways. What is pinned here is the GESTURE's decision table, which
   is the whole risk in this change: the board is wall-to-wall inputs, and it
   already hosts two other pointer machines (rowdrag.ts carries a row from its
   grip, drag.ts carries a puck), so a swipe that claimed too much would break
   editing rather than merely misfire.
   Geometry — that the bar is ONE row, and that the open drawer clears it —
   is not testable here: jsdom reports every rect as 0x0. It is pinned in
   e2e/geometry.spec.ts, the gate that exists for exactly this. */
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import * as view from '../state/view'
import { openScheduler, toggleWide, SBWIDE } from './board'
import { HOOKS } from '../engine/hooks'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]

/* one swipe, expressed the way a finger makes it: down somewhere, up
   somewhere else. The handler reads only the two client points, so this is
   the real event path and not a shortcut around it. */
const swipe = async (dx: number, dy = 0, target?: Element | null) => {
  const main = $('.sb-main')
  const from = (target || main) as Element
  await act(async () => {
    from.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 200, clientY: 400, pointerType: 'touch', buttons: 1 } as any))
    main.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 200 + dx, clientY: 400 + dy, pointerType: 'touch' } as any))
  })
}

beforeAll(async () => {
  initStore()
  const host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await act(async () => { view.setPage('editsched'); notify() })
})

beforeEach(async () => {
  if (SBWIDE) { await act(async () => { toggleWide(); notify() }) }
  await act(async () => { openScheduler(2); notify() })      // Wednesday, middle of the week
})

describe('the top bar carries the day, undo/redo and no + Line', () => {
  it('shows the day and the date, and nothing else identifying', () => {
    expect($('#sbDay').textContent).toBe(DAYS[2].dow)
    expect($('#sbDate').textContent).toBe(DAYS[2].dt)
  })

  it('has an undo and a redo button, disabled exactly as the shell pair is', async () => {
    const undo = $('#sbUndo') as HTMLButtonElement
    const redo = $('#sbRedo') as HTMLButtonElement
    expect(undo, 'undo reaches the board — the shell pair is unreachable under a full-screen modal').toBeTruthy()
    expect(redo).toBeTruthy()
    /* nothing has been redone, so redo is always disabled at the top of a
       stack — the assertion that matters is that the button READS the stack
       rather than being decorative */
    expect(redo.disabled).toBe(true)
  })

  it('no longer carries + Line, and still carries + Wave', () => {
    expect(document.querySelector('#sbAddLine'), '+ Line left the bar on 11 Aug 26').toBeFalsy()
    expect(document.querySelector('#sbAddGo'), '+ Wave is the only way to create a wave, so it stays').toBeTruthy()
  })

  /* the chips became dots in CSS, not in the DOM — same seven elements and
     the same click handler, which is what keeps a tap-to-jump working */
  it('still renders one day control per day, so a tap still jumps straight to that day', async () => {
    expect($$('#sbDays [data-sbtab]').length).toBe(DAYS.length)
    await act(async () => { $$('#sbDays [data-sbtab]')[5].dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    expect(view.SBDAY).toBe(5)
  })
})

describe('swiping the board changes the day', () => {
  it('a swipe LEFT pulls in the next day', async () => {
    await swipe(-90)
    expect(view.SBDAY).toBe(3)
  })

  it('a swipe RIGHT goes back a day', async () => {
    await swipe(90)
    expect(view.SBDAY).toBe(1)
  })

  it('stops at both ends of the week rather than wrapping', async () => {
    await act(async () => { openScheduler(0); notify() })
    await swipe(90)
    expect(view.SBDAY, 'Monday has no day before it — the loaded week is one week').toBe(0)
    await act(async () => { openScheduler(DAYS.length - 1); notify() })
    await swipe(-90)
    expect(view.SBDAY).toBe(DAYS.length - 1)
  })
})

describe('the swipe refuses every gesture that belongs to something else', () => {
  it('a short drag is reading, not swiping', async () => {
    await swipe(-30)
    expect(view.SBDAY).toBe(2)
  })

  /* the board is a tall scroller and a thumb travelling down it wanders
     sideways; without the 2x bias, ordinary reading changes the day */
  it('a mostly-vertical drag is a scroll, however far sideways it wanders', async () => {
    await swipe(-90, 200)
    expect(view.SBDAY).toBe(2)
  })

  /* rowdrag.ts claims the grip on pointerdown, immediately — the one target
     a swipe must not start from */
  it('a gesture that starts on a row grip belongs to the row-reorder machine', async () => {
    const grip = document.querySelector('#sbBoard .sb-grip') as HTMLElement
    expect(grip, 'the seed board has a movable row to grip').toBeTruthy()
    await swipe(-120, 0, grip)
    expect(view.SBDAY).toBe(2)
  })

  /* drag.ts arms a puck drag only after a hold, and sets `tdrag` while it is
     armed. A swipe cannot arm it (the finger moves at once), but one armed
     BEFORE the gesture owns the finger and must not also change the day. */
  it('does nothing while a puck drag is armed', async () => {
    document.body.classList.add('tdrag')
    try {
      await swipe(-120)
      expect(view.SBDAY).toBe(2)
    } finally { document.body.classList.remove('tdrag') }
  })
})

/* THE GUARD THAT HAD TO BE LOOSENED, pinned so it is not "tidied" back.
   Excluding inputs, buttons and seats at pointerdown is the obvious
   defensive list, and it is wrong here: the board is wall-to-wall controls,
   so it made the gesture work once and then fail depending on what happened
   to sit under the thumb after the day changed. Measured in a real browser —
   Monday to Tuesday worked, Tuesday onwards did not. */
describe('a swipe may start on the controls the board is made of', () => {
  it('swipes when the gesture starts on an input, because a tap does not travel', async () => {
    const input = document.querySelector('#sbBoard input') as HTMLElement
    expect(input, 'the board has inputs to start a gesture on').toBeTruthy()
    await swipe(-120, 0, input)
    expect(view.SBDAY, 'a 120px travel from an input is a swipe, not typing').toBe(3)
  })

  it('and a TAP on that same input still changes nothing', async () => {
    const input = document.querySelector('#sbBoard input') as HTMLElement
    await swipe(0, 0, input)
    expect(view.SBDAY).toBe(2)
  })

  it('swipes when the gesture starts on a seat', async () => {
    const seat = document.querySelector('#sbBoard [data-slot]') as HTMLElement
    expect(seat, 'the board has seats to start a gesture on').toBeTruthy()
    await swipe(-120, 0, seat)
    expect(view.SBDAY).toBe(3)
  })

  /* in desktop layout the whole board IS a horizontal scroller, so sideways
     already means "pan across the day's columns" */
  it('does nothing in desktop layout, where sideways means panning the board', async () => {
    await act(async () => { toggleWide(); notify() })
    try {
      await swipe(-120)
      expect(view.SBDAY).toBe(2)
    } finally {
      await act(async () => { toggleWide(); notify() })
    }
  })
})

afterEach(() => { HOOKS.editMode = HOOKS.editMode })
