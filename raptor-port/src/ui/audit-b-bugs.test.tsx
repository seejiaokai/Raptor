// @vitest-environment jsdom
/* AUDIT B (12 Aug 26, overnight adversarial pass) — REPRODUCTIONS.
   Every test in this file asserts the CONTRACT the code claims to hold, so a
   failure here is the finding, reproduced. Deliberately separate from
   audit-b-daystep.test.tsx (the gap-closures, all green): a red repro must
   not hide a green regression. See the audit report for classification,
   root cause and the suggested minimal fix for each.

   DO NOT "fix" a repro by weakening its assertion — fix the code or move the
   test to the gaps file once the behaviour is ruled deliberate and documented. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { txtGet } from '../engine/slots'
import * as view from '../state/view'
import { openScheduler, toggleWide, SBWIDE } from './board'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]

const layOutDots = () => {
  $$('#sbDays [data-sbtab]').forEach((d, i) => {
    (d as any).getBoundingClientRect = () => ({ left: i * 20, width: 20, right: i * 20 + 20, top: 40, bottom: 60, height: 20, x: i * 20, y: 40 })
  })
}
const scrub = async (...xs: number[]) => {
  const dots = $('#sbDays')
  await act(async () => {
    dots.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: xs[0], clientY: 50, pointerType: 'touch', buttons: 1, pointerId: 1 } as any))
  })
  for (const x of xs.slice(1)) {
    layOutDots()
    await act(async () => {
      dots.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: x, clientY: 50, pointerType: 'touch', pointerId: 1 } as any))
    })
  }
  await act(async () => {
    dots.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: xs[xs.length - 1], clientY: 50, pointerType: 'touch', pointerId: 1 } as any))
  })
}

beforeAll(async () => {
  initStore()
  const host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
})

beforeEach(async () => {
  if (SBWIDE) { await act(async () => { toggleWide(); notify() }) }
  await act(async () => { view.setPage('editsched'); openScheduler(2); notify() })
})

/* FINDING B1 — the board's day-carry is clobbered when the board is closed by
   setPage instead of its own Close.
   docs/ui-contracts.md §The day carries across a page switch: "Closing the
   SCHEDULER BOARD writes the carry too … It is the same one mechanism, not a
   second one — a board close is just another producer." And §The page behind
   the board does not scroll: "Closing the board leaves the week on the
   board's day."
   state/view.ts setPage(): closeBoardState() runs FIRST (writes
   CARRYDAY=SBDAY), then the leaving-a-week-page capture runs and OVERWRITES
   it with weekLeftDay(eWeek) — the day the week UNDER the board happens to be
   parked on, which is precisely the "wherever it was parked" the owner asked
   to stop landing on. Reachable for real: the nav drawer is z-index 440,
   ABOVE the board's 400, so a scheduler on the board CAN nav away without
   touching Close. */
describe('B1 — closing the board via setPage must carry the board’s day', () => {
  it('nav away from an open board keeps SBDAY as the carry, not the parked week', async () => {
    await act(async () => { openScheduler(4); notify() })    // reading Friday on the board
    expect(view.SBDAY).toBe(4)
    /* read the carry BEFORE any repaint — the destination week consumes it on
       its next paint. jsdom's 0x0 rects make weekLeftDay(eWeek) return day 0
       (its first-day fallback); in a real browser it returns wherever eWeek is
       parked. The contract answer on this path is the BOARD’s day either way. */
    await act(async () => { view.setPage('viewsched') })
    expect(view.SBDAY, 'setPage closed the board').toBe(null)
    expect(view.CARRYDAY, 'the board’s day comes back out with you — same as the Close button').toBe(4)
    await act(async () => { notify() })                      // let the view week settle

  })
})

/* FINDING B2 — a day scrub re-hangs #sbBoard around a focused, uncommitted
   <input data-bfld>, and nothing in THIS APP commits it.
   Every data-bfld field commits on the CHANGE event (board.ts boardChange →
   txtSet), which fires on blur. SchedBoard's panel effect guards on
   editingText() — which knows data-txt, data-inp and contenteditable but NOT
   the board's own <input data-bfld> grammar — so a boardTab mid-edit replaces
   the panel's innerHTML around the focused input.
   Measured in real Chromium (audit pw3, 12 Aug 26): the input stays focused
   through touchStart on the strip, and at the FIRST touchMove the repaint
   tears it out — the value survives there only because Chromium happens to
   fire change during that teardown while the input is still attached. jsdom
   (like engines that do not fire change on programmatic removal) shows the
   app's own behaviour: the element goes, change never reaches the delegated
   listener, and the typed value lands on NO day at all. The app must not
   lean on an engine teardown quirk for a scheduler's typed data — commit or
   defer, but do not destroy. */
describe('B2 — a typed value must survive a day scrub', () => {
  it('scrubbing 2 → 5 with an uncommitted remark commits it to the day being left', async () => {
    const inp = $('#sbBoard input[data-bfld^="fr:2."]') as HTMLInputElement
    expect(inp, 'day 2 renders a flying-line remarks input').toBeTruthy()
    const p = inp.dataset.bfld!
    const before = txtGet(p)
    await act(async () => { inp.focus() })
    inp.value = 'AUDIT-VANISH'
    layOutDots()
    await scrub(50, 110)                                     // 2 → 5
    expect(view.SBDAY).toBe(5)
    /* mechanism, demonstrated: the focused input was torn out by the repaint
       before its change event could ever fire */
    expect(document.contains(inp), 'the input the user was typing into is gone').toBe(false)
    expect($$('#sbBoard input').some(i => (i as HTMLInputElement).value === 'AUDIT-VANISH'),
      'and no field on screen holds the typed text').toBe(false)
    /* the contract: a value the user typed must not vanish — it belongs to
       the day whose cell it was typed into (data-bfld carries that day) */
    expect(txtGet(p), 'the typed remark landed on the day it was typed on').toBe('AUDIT-VANISH')
    // unreached while the bug stands; restores if it ever passes
    const { writeText } = await import('../state/store')
    await act(async () => { writeText(p, before) })
  })
})

/* FINDING B3 — the dot strip keeps scrubbing after the button is up.
   wireDayDots takes pointer capture only on the first move past 4px. A MOUSE
   press that leaves the 21px strip before travelling 4px horizontally ends
   with pointerup outside the strip — no capture was taken, so onUp never
   fires and `live` stays true. Mouse pointerId is constant, so the next time
   the pointer merely PASSES OVER the strip — no button down — onMove runs and
   boardTab follows the hover until the next pointerdown resets the machine.
   Touch is immune (implicit capture); this is the desktop chips / sb-wide
   strip. */
describe('B3 — a hover with no button down must never change the day', () => {
  it('press, slip off the strip, release elsewhere: a later hover across the strip stays put', async () => {
    const dots = $('#sbDays')
    layOutDots()
    await act(async () => {
      dots.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 50, clientY: 50, pointerType: 'mouse', buttons: 1, pointerId: 7 } as any))
      /* 2px of travel — under the 4px slop, so no capture is taken yet */
      dots.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 52, clientY: 50, pointerType: 'mouse', buttons: 1, pointerId: 7 } as any))
    })
    /* the pointer has left the strip; the release lands on the board below —
       without capture the strip never hears it */
    await act(async () => {
      document.body.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 52, clientY: 300, pointerType: 'mouse', pointerId: 7 } as any))
    })
    /* … later, the bare pointer crosses the strip on its way to a button */
    layOutDots()
    await act(async () => {
      dots.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 130, clientY: 50, pointerType: 'mouse', buttons: 0, pointerId: 7 } as any))
    })
    expect(view.SBDAY, 'no button is down — the hover must not scrub').toBe(2)
  })
})

/* FINDING B4 — the parked aircrew handle's forwarded scroll has the same
   missing-release hole. wireParkedRosScroll listens for pointerup on .sb-main
   only and takes no capture at all. A mouse drag that starts on the parked
   handle and releases OUTSIDE .sb-main (the fixed top bar is not inside it —
   one thumb-length up from the handle) leaves `live` true, and the next bare
   hover across the board drives .sb-main.scrollTop by hundreds of px. Touch
   is immune (implicit capture on the handle bubbles the up through main);
   this bites the mouse at phone widths / .sb-wide. */
describe('B4 — a hover with no button down must never scroll the board', () => {
  it('drag the handle, release on the top bar: a later hover over the board leaves scrollTop alone', async () => {
    document.body.classList.remove('ros-open')
    const main = $('.sb-main')
    const tab = $('#schedBoard .sb-ros .ros-tab')
    main.scrollTop = 500
    await act(async () => {
      tab.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 378, clientY: 400, pointerType: 'mouse', buttons: 1, pointerId: 9 } as any))
      main.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 378, clientY: 380, pointerType: 'mouse', buttons: 1, pointerId: 9 } as any))
    })
    expect(main.scrollTop, 'the drag itself forwards — that is the feature').toBe(520)
    /* release over the top bar — .sb-top is .sb-main's SIBLING, so main's
       pointerup listener never hears it */
    await act(async () => {
      $('.sb-top').dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 378, clientY: 60, pointerType: 'mouse', pointerId: 9 } as any))
    })
    const settled = main.scrollTop
    /* … later, the bare pointer drifts across the board */
    await act(async () => {
      main.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 200, clientY: 100, pointerType: 'mouse', buttons: 0, pointerId: 9 } as any))
    })
    expect(main.scrollTop, 'no button is down — the hover must not drive the scroll').toBe(settled)
  })
})
