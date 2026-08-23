// @vitest-environment jsdom
/* THE PHONE BOARD'S TOP BAR AND HOW A DAY IS REACHED (owner, 11–12 Aug 26).
   The seven Mon–Sun chips became dots to get the bar down to one line, and the
   day was reached by SWIPING for a day and a half — three shapes of swipe, all
   removed on 12 Aug 26 ("remove the swipe for the mobile scheduler board too.
   Just put arrows at the edges of the bar at the top to navigate left and right
   between days"). What is pinned here now is the pair of arrows, the dots that
   still scrub, the parked aircrew handle that still forwards its scroll — and
   that a drag across the board does NOTHING, which is the removal itself.
   Geometry — that the bar is ONE row, that the arrows sit at the screen's edges,
   and that the open drawer clears the bar — is not testable here: jsdom reports
   every rect as 0x0. It is pinned in e2e/geometry.spec.ts, the gate that exists
   for exactly this. */
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, loadWeek } from '../state/store'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import * as view from '../state/view'
import { openScheduler, toggleWide, SBWIDE, boardTab, boardDayStep } from './board'
import { HOOKS } from '../engine/hooks'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]

/* a sideways drag across the board, expressed the way a finger makes it. It is
   here to prove the swipe is GONE: down, move, up, and then a wait longer than
   the settle animation the carousel used to run. */
const drag = async (dx: number, dy = 0, target?: Element | null) => {
  const main = $('.sb-main')
  const from = (target || main) as Element
  await act(async () => {
    from.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 200, clientY: 400, pointerType: 'touch', buttons: 1 } as any))
    main.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 200 + dx, clientY: 400 + dy, pointerType: 'touch' } as any))
    main.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 200 + dx, clientY: 400 + dy, pointerType: 'touch' } as any))
  })
  await act(async () => { await new Promise(r => setTimeout(r, 320)) })
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
  // the continuous-arrow tests load an adjacent week; reset to the seed so each
  // test starts on the week its DAYS[] assertions assume
  if (CURWEEK !== '13/07/2026') await act(async () => { loadWeek('13/07/2026') })
  await act(async () => { openScheduler(2); notify() })      // Wednesday, middle of the week
})

describe('the top bar carries the day, undo/redo and no + Line', () => {
  it('shows the day and the date, and nothing else identifying', () => {
    expect($('#sbDay').textContent).toBe(DAYS[2].dow)
    expect($('#sbDate').textContent).toBe(DAYS[2].dt)
  })

  /* THE DAY NAME IS SPLIT SO A PHONE CAN DROP ITS TAIL (owner, 12 Aug 26 —
     "Seems like the Wednesday blocked off the date"). `.sb-title` ellipses
     under 820px, and the long day names were eating the date. jsdom loads no
     stylesheet, so all this can prove is the SHAPE the CSS hangs off: three
     letters outside the hidden label, the remainder inside it, and the whole
     word still in the text so desktop and the accessible name are unchanged.
     What it looks like painted is `e2e/geometry.spec.ts`. */
  it('splits the day name so the phone reads three letters and desktop the whole word', () => {
    const day = $('#sbDay')
    const tail = day.querySelector('.bl') as HTMLElement
    expect(tail, 'the tail is a .bl — the same class every control on this bar hides by').toBeTruthy()
    expect(day.firstChild!.nodeValue, 'Wed, matching the day strip and dowShort').toBe('Wed')
    expect(tail.textContent).toBe('nesday')
    expect(day.textContent, 'and the full word survives for the surfaces with room').toBe(DAYS[2].dow)
  })

  /* Saturday and Sunday collide on three letters, so the DATE beside them is
     the only thing separating them — which is the reason this fix exists */
  it('keeps the date beside the short name on every day of the week', async () => {
    for (const di of [0, 5, 6]) {
      await act(async () => { boardTab(di); notify() })
      expect($('#sbDay').firstChild!.nodeValue).toBe(DAYS[di].dow.slice(0, 3))
      expect($('#sbDate').textContent, `${DAYS[di].dow} keeps its date`).toBe(DAYS[di].dt)
    }
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

  it('carries neither + Line nor + Wave — both left the bar; + Wave is now inline on the board', () => {
    expect(document.querySelector('#sbAddLine'), '+ Line left the bar on 11 Aug 26').toBeFalsy()
    expect(document.querySelector('#sbAddGo'), '+ Wave left the bar on 13 Aug 26 — it is a section control now').toBeFalsy()
    /* it moved into the board, between Common Programme and the flying waves */
    expect(document.querySelector('#sbBoard [data-wvadd]'), 'the wave-add control is inline on the board').toBeTruthy()
  })

  /* the chips became dots in CSS, not in the DOM — same seven elements and
     the same click handler, which is what keeps a tap-to-jump working */
  it('still renders one day control per day, so a tap still jumps straight to that day', async () => {
    expect($$('#sbDays [data-sbtab]').length).toBe(DAYS.length)
    await act(async () => { $$('#sbDays [data-sbtab]')[5].dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    expect(view.SBDAY).toBe(5)
  })
})

/* THE ARROWS (owner, 12 Aug 26 — "just put arrows at the edges of the bar at the
   top to navigate left and right between days"). */
describe('the day is stepped by the two arrows on the bar', () => {
  it('carries a previous and a next arrow', () => {
    expect($('#sbPrevDay'), 'the left edge of the day row').toBeTruthy()
    expect($('#sbNextDay'), 'and the right').toBeTruthy()
  })

  it('the next arrow moves a day forward', async () => {
    await act(async () => { $('#sbNextDay').click() })
    expect(view.SBDAY).toBe(3)
  })

  it('the previous arrow moves a day back', async () => {
    await act(async () => { $('#sbPrevDay').click() })
    expect(view.SBDAY).toBe(1)
  })

  it('steps a day at a time across the whole week', async () => {
    await act(async () => { openScheduler(0); notify() })
    for (let i = 1; i < DAYS.length; i++) {
      await act(async () => { $('#sbNextDay').click() })
      expect(view.SBDAY).toBe(i)
    }
    for (let i = DAYS.length - 2; i >= 0; i--) {
      await act(async () => { $('#sbPrevDay').click() })
      expect(view.SBDAY).toBe(i)
    }
  })

  /* CONTINUOUS ACROSS WEEKS (owner, 22 Aug 26 — "continuous arrow between
     weeks"). The arrows are no longer disabled at the week's ends; stepping off
     an end loads the adjacent week and opens Sunday/Monday there. This replaced
     the earlier "disabled at the ends" shape — the board swipe stays gone. */
  it('the arrows stay enabled at both ends of the week', async () => {
    await act(async () => { openScheduler(0); notify() })
    expect(($('#sbPrevDay') as HTMLButtonElement).disabled).toBe(false)
    await act(async () => { openScheduler(DAYS.length - 1); notify() })
    expect(($('#sbNextDay') as HTMLButtonElement).disabled).toBe(false)
  })

  it('stepping back off Monday loads the previous week and opens its Sunday', async () => {
    await act(async () => { openScheduler(0); notify() })       // Monday of the seed week
    await act(async () => { $('#sbPrevDay').click() })
    expect(CURWEEK, 'the previous week is loaded').toBe('06/07/2026')
    expect(view.SBDAY, 'and the board opens on its Sunday').toBe(6)
  })

  it('stepping forward off Sunday loads the next week and opens its Monday', async () => {
    await act(async () => { openScheduler(DAYS.length - 1); notify() })   // Sunday of the seed week
    await act(async () => { $('#sbNextDay').click() })
    expect(CURWEEK, 'the next week is loaded').toBe('20/07/2026')
    expect(view.SBDAY, 'and the board opens on its Monday').toBe(0)
  })

  it('crosses the week boundary when boardDayStep is called directly at an end', async () => {
    await act(async () => { openScheduler(0); notify(); boardDayStep(-1) })
    expect(CURWEEK).toBe('06/07/2026')
    expect(view.SBDAY).toBe(6)
    await act(async () => { loadWeek('13/07/2026'); openScheduler(DAYS.length - 1); notify(); boardDayStep(1) })
    expect(CURWEEK).toBe('20/07/2026')
    expect(view.SBDAY).toBe(0)
  })

  /* the dots are the only thing that says WHICH of the seven you are on, which
     is why they stayed when the swipe went */
  it('moves the marked dot with it', async () => {
    await act(async () => { $('#sbNextDay').click() })
    const on = $$('#sbDays [data-sbtab]').filter(d => d.classList.contains('on'))
    expect(on.length).toBe(1)
    expect(on[0].dataset.sbtab).toBe('3')
  })

  it('is a day-only navigation, so it does not wake the week behind the board', async () => {
    const before = view.BOARDREV
    await act(async () => { $('#sbNextDay').click() })
    expect(view.BOARDREV, 'the board lane moved').toBe(before + 1)
  })
})

/* THE SWIPE IS GONE (owner, 12 Aug 26). It ran in three shapes over a day and a
   half — a jump on a distance threshold, then a carousel that tracked the finger
   behind a preview pane, then that carousel with its hit-testing, its settle and
   its animation all reworked — and the owner replaced the lot with two buttons.
   These are the removal, pinned: the board is an ordinary vertical scroller
   again, and a sideways drag across it is nothing at all. */
describe('a sideways drag across the board no longer changes the day', () => {
  it('a long drag left does nothing', async () => {
    await drag(-160)
    expect(view.SBDAY).toBe(2)
    expect(document.querySelectorAll('.sb-pane').length, 'and no preview pane exists to build').toBe(0)
  })

  it('a long drag right does nothing', async () => {
    await drag(160)
    expect(view.SBDAY).toBe(2)
  })

  it('a fast flick does nothing', async () => {
    const main = $('.sb-main')
    await act(async () => {
      main.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 300, clientY: 400, pointerType: 'touch', buttons: 1 } as any))
      main.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 240, clientY: 400, pointerType: 'touch' } as any))
      main.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 238, clientY: 400, pointerType: 'touch' } as any))
    })
    await act(async () => { await new Promise(r => setTimeout(r, 320)) })
    expect(view.SBDAY).toBe(2)
  })

  it('leaves no transform on the scroller it used to move', async () => {
    await drag(-160)
    expect($('.sb-main').style.transform).toBe('')
    expect($('.sb-main').style.willChange).toBe('')
  })

  it('and a drag that starts on a board control is just a drag', async () => {
    const input = $('#sbBoard input')
    await drag(-160, 0, input)
    expect(view.SBDAY).toBe(2)
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

/* SEARCH + HIGHLIGHT ON THE BAR (owner, 23 Aug 26 — the phone dots left the
   day row and this pair took the freed middle). jsdom pins the wiring: the
   uncontrolled #searchB writes view.SEARCH, #sbHl drives view.HLOPEN and the
   strip's open class, and a chip inside #sbHlStrip toggles the SAME HLSET the
   week pages read. Which of it is visible at which width is the geometry
   gate's question. */
describe('the day row carries a search box and the highlight fold', () => {
  beforeEach(async () => {
    await act(async () => { view.HLSET.clear(); view.setSearch(''); view.setHlOpen(false); notify() })
  })

  it('typing in #searchB sets view.SEARCH', async () => {
    const box = $('#searchB') as HTMLInputElement
    expect(box, 'the search box is on the bar').toBeTruthy()
    await act(async () => {
      box.value = 'bane'
      box.dispatchEvent(new Event('input', { bubbles: true }))
    })
    expect(view.SEARCH).toBe('bane')
  })

  it('#sbHl flips HLOPEN and the chips strip gains open', async () => {
    const strip = $('#sbHlStrip')
    expect(strip, 'the strip is rendered unconditionally').toBeTruthy()
    expect(strip.className).not.toContain('open')
    await act(async () => { $('#sbHl').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    expect(view.HLOPEN).toBe(true)
    expect($('#sbHlStrip').className).toContain('open')
    await act(async () => { $('#sbHl').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    expect(view.HLOPEN).toBe(false)
    expect($('#sbHlStrip').className).not.toContain('open')
  })

  it('a chip inside the strip toggles the shared HLSET', async () => {
    const chip = $('#sbHlStrip .fchip[data-hl="SUP"]')
    expect(chip, 'the same HlChips set as the week pages').toBeTruthy()
    await act(async () => { chip.dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    expect(view.HLSET.has('SUP')).toBe(true)
    expect($('#sbHlStrip .fchip[data-hl="SUP"]').className).toContain('on')
    await act(async () => { $('#sbHlStrip .fchip[data-hl="SUP"]').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    expect(view.HLSET.has('SUP')).toBe(false)
  })
})

/* THE PARKED AIRCREW HANDLE HANDS ITS SCROLL BACK (owner, 11 Aug 26 — a
   screenshot of a drag down the right-hand edge that moved nothing).
   A position:fixed element gives its touch scroll to the VIEWPORT, not to
   the overflow ancestor it sits inside, and the viewport cannot scroll here
   (.schedboard is fixed, inset:0) — so the gesture went nowhere. The drag is
   forwarded by hand instead. Measured in a browser at 0px before and 220px
   after; what jsdom can pin is the arithmetic and, more importantly, the
   two states it must tell apart. */
describe('a vertical drag on the parked aircrew handle scrolls the board', () => {
  const dragOn = async (sel: string, dy: number) => {
    const main = $('.sb-main')
    const from = document.querySelector(sel) as HTMLElement
    expect(from, `there is a ${sel} to drag on`).toBeTruthy()
    await act(async () => {
      from.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 378, clientY: 400, pointerType: 'touch', buttons: 1 } as any))
      main.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 378, clientY: 400 + dy, pointerType: 'touch' } as any))
      main.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 378, clientY: 400 + dy, pointerType: 'touch' } as any))
    })
  }

  beforeEach(() => { document.body.classList.remove('ros-open'); $('.sb-main').scrollTop = 500 })

  it('drags the board by the distance travelled', async () => {
    await dragOn('#schedBoard .sb-ros .ros-tab', -200)
    expect($('.sb-main').scrollTop, 'dragging up scrolls the board down').toBe(700)
  })

  it('and the other way', async () => {
    await dragOn('#schedBoard .sb-ros .ros-tab', 150)
    expect($('.sb-main').scrollTop).toBe(350)
  })

  it('does nothing once the drawer is OPEN — the crew list owns that gesture', async () => {
    document.body.classList.add('ros-open')
    try {
      await dragOn('#schedBoard .sb-ros .ros-tab', -200)
      expect($('.sb-main').scrollTop, 'the open drawer scrolls its own list, not the board').toBe(500)
    } finally { document.body.classList.remove('ros-open') }
  })

  it('leaves a drag that started anywhere else to the browser', async () => {
    await dragOn('#sbBoard', -200)
    expect($('.sb-main').scrollTop, 'the board scrolls itself everywhere else').toBe(500)
  })

  /* a tap travels ~0px, so the forwarding is a no-op and the tap still
     reaches the toggle */
  it('a tap on the handle scrolls nothing', async () => {
    await dragOn('#schedBoard .sb-ros .ros-tab', 0)
    expect($('.sb-main').scrollTop).toBe(500)
  })
})

/* THE REPORTED FAULT, AND IT IS THE CLICK THAT CAUSES IT (owner, 11 Aug 26 —
   "after I move the bar at the top and tried to scroll vertically I can't").
   A two-step trap: the handle sits at the right edge where a thumb rests and
   the browser's tap slop is generous — measured on the real build, a drag of
   up to 15px still fired a click — so beginning a scroll there OPENED the
   aircrew drawer. The drawer then covers 58% of the width over a crew list
   with 39px to scroll, so the next drag moved nothing, which reads as the
   board having seized rather than as a panel having opened over it. */
describe('a scroll on the parked handle must not open the drawer', () => {
  const gesture = async (dy: number) => {
    const main = $('.sb-main')
    const tab = document.querySelector('#schedBoard .sb-ros .ros-tab') as HTMLElement
    await act(async () => {
      tab.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 378, clientY: 500, pointerType: 'touch', buttons: 1 } as any))
      main.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 378, clientY: 500 - dy, pointerType: 'touch' } as any))
      main.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 378, clientY: 500 - dy, pointerType: 'touch' } as any))
      /* the click the browser fires after a short touch — the whole problem */
      tab.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
  }
  beforeEach(() => { document.body.classList.remove('ros-open'); $('.sb-main').scrollTop = 500 })
  afterEach(() => { document.body.classList.remove('ros-open') })

  it('a 15px scroll does not open it — that was the fault', async () => {
    await gesture(15)
    expect(document.body.classList.contains('ros-open'), 'a scroll is not a tap').toBe(false)
    expect($('.sb-main').scrollTop, 'and it scrolled the board instead').toBe(515)
  })

  it('a long scroll does not open it either', async () => {
    await gesture(200)
    expect(document.body.classList.contains('ros-open')).toBe(false)
    expect($('.sb-main').scrollTop).toBe(700)
  })

  /* a deliberate tap wobbles, and that is still a tap */
  it('a real tap still opens it', async () => {
    await gesture(0)
    expect(document.body.classList.contains('ros-open'), 'the handle still works as a button').toBe(true)
  })

  it('and so does a tap that wobbles a couple of pixels', async () => {
    await gesture(3)
    expect(document.body.classList.contains('ros-open')).toBe(true)
  })
})
