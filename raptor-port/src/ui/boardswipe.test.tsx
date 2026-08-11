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

/* one swipe, expressed the way a finger makes it: down, MOVE, up. The move
   matters — the day changes on the move now, with the finger still down
   (owner, 11 Aug 26: waiting for the lift is what "unresponsive" was), so a
   harness that only sent down/up would test a path the app no longer has. */
const swipe = async (dx: number, dy = 0, target?: Element | null) => {
  const main = $('.sb-main')
  const from = (target || main) as Element
  await act(async () => {
    from.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 200, clientY: 400, pointerType: 'touch', buttons: 1 } as any))
    main.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 200 + dx, clientY: 400 + dy, pointerType: 'touch' } as any))
    main.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 200 + dx, clientY: 400 + dy, pointerType: 'touch' } as any))
  })
}

/* a press-and-slide along the day dots, in one or more steps */
const scrub = async (...xs: number[]) => {
  const dots = $('#sbDays')
  await act(async () => {
    dots.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: xs[0], clientY: 50, pointerType: 'touch', buttons: 1, pointerId: 1 } as any))
  })
  for (const x of xs.slice(1)) {
    layOutDots()                       // the strip rebuilds on every day change
    await act(async () => {
      dots.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: x, clientY: 50, pointerType: 'touch', pointerId: 1 } as any))
    })
  }
  await act(async () => {
    dots.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: xs[xs.length - 1], clientY: 50, pointerType: 'touch', pointerId: 1 } as any))
  })
}

/* jsdom gives every element a 0x0 rect, so nearest-CENTRE would always pick
   dot 0. Stub each dot onto its own 20px slot so the mapping is testable
   here; the real geometry is the geometry gate's job. */
const layOutDots = () => {
  $$('#sbDays [data-sbtab]').forEach((d, i) => {
    (d as any).getBoundingClientRect = () => ({ left: i * 20, width: 20, right: i * 20 + 20, top: 40, bottom: 60, height: 20, x: i * 20, y: 40 })
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

  /* THE BIAS THAT WAS TOO STRICT (owner, 11 Aug 26 — "feels unresponsive").
     At 2x, a deliberate 120px sideways drag that arced 70px down was refused
     outright, which reads as the app ignoring you. At 1.25x it lands. */
  it('takes a swipe that arcs, the way a real thumb travels', async () => {
    await swipe(-120, 70)
    expect(view.SBDAY, 'a 120px drag arcing 70px down is still a swipe').toBe(3)
  })

  it('and still refuses an ordinary vertical scroll that drifts sideways', async () => {
    await swipe(-90, 240)
    expect(view.SBDAY).toBe(2)
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

/* THE DOTS ARE A SCRUB BAR (owner, 11 Aug 26 — "the dots should allow me to
   drag to select the pages, like a drag bar"). Seven taps still work; this is
   the drag on top of them. */
describe('dragging along the day dots runs through the week', () => {
  it('slides the open day to whichever dot is under the finger', async () => {
    layOutDots()
    await scrub(50, 110)                       // dot 2 → dot 5
    expect(view.SBDAY).toBe(5)
  })

  it('follows the finger continuously, not only where it lets go', async () => {
    layOutDots()
    const seen: number[] = []
    const dots = $('#sbDays')
    await act(async () => {
      dots.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 50, clientY: 50, pointerType: 'touch', buttons: 1, pointerId: 1 } as any))
    })
    for (const x of [70, 90, 110, 130]) {
      /* the strip's innerHTML is rebuilt on every day change (dayTabsHTML),
         so the stubbed rects go with it — re-stub, exactly as a real browser
         would hand back real rects for the fresh elements. The listeners
         survive because they are delegated on the container. */
      layOutDots()
      await act(async () => {
        dots.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: x, clientY: 50, pointerType: 'touch', pointerId: 1 } as any))
      })
      seen.push(view.SBDAY as number)
    }
    await act(async () => {
      dots.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 130, clientY: 50, pointerType: 'touch', pointerId: 1 } as any))
    })
    expect(seen, 'the day changed at every step of the drag').toEqual([3, 4, 5, 6])
  })

  it('runs backwards too', async () => {
    layOutDots()
    await scrub(110, 30)
    expect(view.SBDAY).toBe(1)
  })

  /* the release fires a click naming the dot the finger went DOWN on; left
     alone it would undo the whole drag */
  it('the click after a scrub does not snap back to where the drag started', async () => {
    layOutDots()
    await scrub(50, 130)
    expect(view.SBDAY).toBe(6)
    await act(async () => {
      $$('#sbDays [data-sbtab]')[2].dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(view.SBDAY, 'the swallowed click left the scrubbed day alone').toBe(6)
  })

  /* a plain tap must still reach the ordinary click handler — the scrub
     machine deliberately does nothing until the finger has moved */
  it('a tap still jumps straight to that day', async () => {
    layOutDots()
    await act(async () => {
      $$('#sbDays [data-sbtab]')[4].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 90, clientY: 50, pointerType: 'touch', buttons: 1, pointerId: 2 } as any))
      $$('#sbDays [data-sbtab]')[4].dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 90, clientY: 50, pointerType: 'touch', pointerId: 2 } as any))
      $$('#sbDays [data-sbtab]')[4].dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(view.SBDAY).toBe(4)
  })
})
