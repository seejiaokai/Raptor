// @vitest-environment jsdom
/* AUDIT FOLLOW-UP — the last two suspects (owner, 12 Aug 26: "fix all").

   1. A pinned History bubble used to keep describing a deleted row until the
      next scroll happened to notice, because its only re-check ran on scroll
      and resize. A panel repaint is the OTHER way its anchor can vanish, so
      SchedBoard.tsx now calls histBubRecheck() after every repaint.

   2. The day-dot scrub could start under a finger already holding a puck. A
      day change repaints the panels, detaching the node the drag machine
      carries, and its drop then resolves against the NEW day's markup — a
      plant on a day nobody aimed at. The strip now refuses the gesture while
      a touch drag is in flight (drag.ts's touchDragBusy). */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, notify, subscribeBoard } from '../state/store'
import { setSession } from '../state/auth'
import { DAYS } from '../engine/data'
import { setSlotVal } from '../engine/slots'
import { elogClear } from '../engine/editlog'
import * as view from '../state/view'
import { openScheduler, boardTab } from './board'
import { hideHistBub, pinHistBubAt, findHistCell, histBubPinned } from './histbubble'
import { initDrag } from './drag'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const bub = () => document.querySelector('.histbub') as HTMLElement | null
const mutate = async () => { await act(async () => { view.afterSchedMutate(); notify() }) }

const layOutDots = () => {
  $$('#sbDays [data-sbtab]').forEach((d, i) => {
    (d as any).getBoundingClientRect = () => ({ left: i * 20, width: 20, right: i * 20 + 20, top: 40, bottom: 60, height: 20, x: i * 20, y: 40 })
  })
}

/* jsdom defines no `document.elementFromPoint`, and this file arms the board's
   TOUCH drag (drag.ts's tdArm → tdOver, and onPointerUp) which hit-tests
   through it. Whether the abandoned hold-timer fires before its pointerup is a
   race: fast locally it is cleared in time, but on the ~30%-slower CI runner it
   fires mid-test and throws `elementFromPoint is not a function` — an uncaught
   async error that poisons the run (this failed main-bound CI once at exactly
   `SBDAY expected 6 got 2`). Stub it the way caldrag.test.tsx already does for
   the same reason; null = "nothing under the finger", which is a harmless drop
   for every gesture this file drives. */
beforeAll(async () => {
  (document as any).elementFromPoint = () => null
  initStore()
  const host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await act(async () => { view.setPage('editsched'); notify() })
})

beforeEach(async () => {
  elogClear(); hideHistBub()
  await act(async () => { view.setPage('editsched'); openScheduler(0); view.setHistMode(false); notify() })
})

describe('a pinned bubble does not outlive the row it describes', () => {
  it('a repaint that deletes the anchor takes the bubble down with it', async () => {
    const notes = DAYS[0].notes
    const ni = notes.length
    notes.push('AUDIT NOTE')
    await mutate()
    /* log an edit on the note so it has a story, then pin the bubble on it */
    await act(async () => { setSlotVal(`dn:0.${ni}`, 'AUDIT NOTE'); notify() })
    const cell = findHistCell(document.getElementById('sbBoard')!, `dn:0.${ni}`)
      || $(`#sbBoard [data-bfld="dn:0.${ni}"]`)
    expect(cell, 'the note cell is on the board').toBeTruthy()
    await act(async () => { pinHistBubAt(cell as HTMLElement) })
    expect(bub(), 'the bubble is up').toBeTruthy()
    expect(histBubPinned()).toBe(true)

    /* the row goes away and the panel is re-hung — no scroll, no resize */
    notes.splice(ni, 1)
    await mutate()
    expect(bub(), 'the bubble went with the row it described').toBe(null)
  })

  it('a repaint that keeps the anchor keeps the bubble up', async () => {
    const notes = DAYS[0].notes
    const ni = notes.length
    notes.push('AUDIT NOTE 2')
    await mutate()
    await act(async () => { setSlotVal(`dn:0.${ni}`, 'AUDIT NOTE 2'); notify() })
    const cell = $(`#sbBoard [data-bfld="dn:0.${ni}"]`)
    await act(async () => { pinHistBubAt(cell) })
    expect(bub()).toBeTruthy()

    /* an unrelated repaint — the note is untouched */
    await mutate()
    expect(bub(), 'still describing a row that is still there').toBeTruthy()

    notes.splice(ni, 1)
    await mutate()
  })
})

describe('the dot strip will not scrub under a finger holding a puck', () => {
  it('a second finger on the dots is refused while a touch drag is in flight', async () => {
    await act(async () => { boardTab(2); notify() })
    const was = view.SBDAY
    /* finger one lands on a draggable puck — initDrag's own pointerdown arms
       the touch-drag machine (a hold, not yet a drop) */
    await act(async () => { initDrag() })
    const puck = $$('#sbBoard [data-drag]')[0]
    expect(puck, 'the board draws a draggable puck in edit mode').toBeTruthy()
    await act(async () => {
      puck.dispatchEvent(new PointerEvent('pointerdown', {
        bubbles: true, clientX: 200, clientY: 300, pointerType: 'touch', isPrimary: true, pointerId: 7,
      } as any))
    })

    /* finger two tries to scrub the day strip */
    layOutDots()
    const dots = $('#sbDays')
    await act(async () => {
      dots.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 50, clientY: 50, pointerType: 'touch', isPrimary: false, pointerId: 8 } as any))
    })
    layOutDots()
    await act(async () => {
      dots.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 130, clientY: 50, pointerType: 'touch', isPrimary: false, pointerId: 8 } as any))
    })
    expect(view.SBDAY, 'the day never moved under the drag').toBe(was)

    /* the drag ends; the strip takes gestures again */
    await act(async () => {
      document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 200, clientY: 300, pointerType: 'touch', isPrimary: true, pointerId: 7 } as any))
    })
    layOutDots()
    await act(async () => {
      dots.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 50, clientY: 50, pointerType: 'touch', isPrimary: true, pointerId: 9, buttons: 1 } as any))
    })
    layOutDots()
    await act(async () => {
      dots.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 130, clientY: 50, pointerType: 'touch', isPrimary: true, pointerId: 9 } as any))
    })
    expect(view.SBDAY, 'with no drag in flight the scrub works as before').toBe(6)
    await act(async () => {
      dots.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 130, clientY: 50, pointerType: 'touch', isPrimary: true, pointerId: 9 } as any))
    })
  })

  it('the board lane is untouched by the refused gesture', async () => {
    await act(async () => { boardTab(3); notify() })
    await act(async () => { initDrag() })
    const puck = $$('#sbBoard [data-drag]')[0]
    await act(async () => {
      puck.dispatchEvent(new PointerEvent('pointerdown', {
        bubbles: true, clientX: 200, clientY: 300, pointerType: 'touch', isPrimary: true, pointerId: 11,
      } as any))
    })
    let fired = 0
    const off = subscribeBoard(() => { fired++ })
    layOutDots()
    const dots = $('#sbDays')
    await act(async () => {
      dots.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 50, clientY: 50, pointerType: 'touch', isPrimary: false, pointerId: 12 } as any))
      dots.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 130, clientY: 50, pointerType: 'touch', isPrimary: false, pointerId: 12 } as any))
    })
    off()
    expect(fired, 'a refused scrub repaints nothing').toBe(0)
    await act(async () => {
      document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 200, clientY: 300, pointerType: 'touch', isPrimary: true, pointerId: 11 } as any))
    })
  })
})
