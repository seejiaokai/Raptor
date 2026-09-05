// The sheet every decision in this app is made in, and the backdrop that
// dismisses it.
//
// Closing a sheet used to be its own ✕ or nothing, so a tap on the grid
// behind it — which is what most people try first — did nothing at all. The
// owner hit that on the counter sheet (10 Aug 26).
//
// The scrim lives HERE, in the wrapper, rather than in each of the seven
// places a sheet is opened: a sheet cannot be written without one, which is a
// stronger guarantee than a component everybody has to remember to add beside
// their own. It is transparent rather than dimmed — these sheets never dimmed
// the grid, and the manning counts behind an open sheet are exactly what
// somebody is reading while they decide.

import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import './bidpicker.css'

/* THE PAGE STAYS FULLY SCROLLABLE UNDER A SHEET (owner, 28 Aug 26 — "enable
   me to still scroll up and down when this window is opened … on the desktop
   if i decide to use the horizontal bar or vertical bar to scroll, this is
   allowed as well"). This REVERSES the 17 Aug "one-scroll" body lock: the page
   used to be frozen (`body.lw-sheet-lock { overflow:hidden }`) so a swipe could
   never jump the grid under a reader. The owner now wants exactly that jump —
   to read the grid behind the panel — so the lock is GONE. The panel itself is
   `position: fixed`, so it does not move with the page; only the grid behind it
   scrolls. The sheet's OWN inner list still keeps `overscroll-behavior: contain`
   (bidpicker.css) so scrolling to the end of the list does not also drag the
   page — that was never the complaint. */

const PAN_THRESH = 6 // px before a gesture commits to an axis

/* A FINGER SCROLLS THE GRID ITSELF (owner, 6 Sep 26 — "when a window like
   this is open, the swipe on the background of the leave war doesn't
   decelerate smoothly. Like it stops immediately … fix the swipe animation to
   be exactly the same"; then, of the first fix, "the scrolling is fix …
   however it feels more laggy/stuttery as compared to a window that's
   closed"). Since 28 Aug the scrim forwarded a sideways drag onto `.mx-wrap`
   by hand from pointer events: 1:1 under the finger and dead the instant it
   lifted, because a hand-written scrollLeft carries no momentum. The first
   fix (same day, superseded within hours) made the scrim a native scroller of
   its own, mirrored onto the grid: it coasted, but every step of the coast
   reached the grid as a `scrollLeft` write from a scroll event, so the columns
   moved only when the main thread got round to it. A bare fling runs on the
   compositor and never waits for the main thread; a mirrored one waits behind
   everything a scroll event sets off — the in-motion month draw (Matrix.tsx
   onWrapScroll, 5 Sep), the date-bar sync, the rest timers — and every frame
   that ran long showed as a stutter, which is exactly what the owner then saw.
   Nothing that drives the grid from JavaScript can be "exactly the same"; only
   the grid being the thing under the finger is.

   So on a touch screen (`(pointer: coarse)`) the scrim no longer takes the
   finger at all: it is `pointer-events: none`, the finger lands on `.mx-wrap`
   and the browser scrolls it the way it does with no sheet up — the same
   drag, fling, deceleration and edge bounce, on the same thread, with
   nothing of ours in between. What the scrim used to do by being in the way —
   swallow a tap (a bare tap on a cell behind an open sheet would open a second
   cell sheet; a press would start a drag-select or a row drag) and dismiss on
   it — a document-level CAPTURE listener does instead: for a press, a tap or a
   click aimed under the sheet it stops propagation before the grid's handlers
   (React's root listener and the grid's own) can see it, closes the sheet on
   the click, and never `preventDefault`s the touch — a stopped touchstart
   still scrolls, a cancelled one would not. The one default it does cancel is
   the compat `mousedown` of a tap, so a tapped cell is not focused (a focus
   scrolls its cell into view: a jump). Moves are left alone: the grid handles
   none, and a listener on every move frame is a cost for nothing.

   A mouse cannot drag-scroll a native scroller, so on a fine pointer the scrim
   stays the interceptor it has been since 28 Aug: drag-to-pan by hand, wheel
   forwarded, click dismisses, hover kept off the grid. A touch screen on a
   fine-pointer device (a touch laptop) gets that hand pan too — 1:1, no coast
   — the pre-6 Sep behaviour; docs/leavewar/known-gaps.md records it. */

/* Everything a bare tap or press on the grid sets off, in the order a touch
   produces them; `click` is the one the shield also acts on. */
const SHIELDED = ['pointerdown', 'pointerup', 'pointercancel', 'touchstart', 'touchend', 'touchcancel', 'mousedown', 'mouseup', 'click', 'dblclick', 'contextmenu'] as const

function useGridPan(movedRef: { current: boolean }, closeRef: { current: () => void }) {
  const scrimRef = useRef<HTMLDivElement>(null)
  // A layout effect: the scrim must be out of the finger's way, and the
  // shield in place, before a finger can land on the freshly-opened sheet.
  useLayoutEffect(() => {
    const scrim = scrimRef.current
    if (!scrim) return
    // `.mx-wrap` is Leave War's own (and only) sideways scroller — the class
    // appears nowhere in Raptor's scheduler, so no page scope is needed.
    const grid = () => document.querySelector<HTMLElement>('.mx-wrap')

    // ---- the touch screen: the finger goes to the grid, the shield takes the tap
    // Decided ONCE, here, and the scrim's own pointer-events follow the same
    // answer as an inline style (React never sets `style` on the scrim, so it
    // is left alone), so the two can never disagree. jsdom has no matchMedia:
    // a fine pointer, the scrim in the way, as every scrim test expects.
    const coarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches
    scrim.style.pointerEvents = coarse ? 'none' : ''
    const shield = (e: Event) => {
      // KEPT-MOUNTED guard, as the Escape listener's: the Leave War tab stays
      // mounted behind a tab switch, so a sheet left open would otherwise eat
      // every tap on a RAPTOR page. Act only while this section is showing.
      const pg = document.getElementById('page-leavewar')
      if (pg && !pg.classList.contains('on')) return
      const t = e.target
      if (!(t instanceof Node)) return
      // Not "under the sheet": the scrim itself, and ANY sheet panel — two are
      // never up at once, but a lower one's shield must not eat the upper's taps.
      if (scrim.contains(t)) return
      const el = t instanceof Element ? t : t.parentElement
      if (el?.closest('.bidsheet')) return
      e.stopPropagation()
      if (e.type === 'mousedown') e.preventDefault()
      if (e.type === 'click') closeRef.current()
    }
    if (coarse) for (const type of SHIELDED) document.addEventListener(type, shield, true)

    // ---- the fine pointer: drag-to-pan by hand, as since 28 Aug -------------
    let x0 = 0, y0 = 0, sl0 = 0, axis: '' | 'x' | 'y' = '', captured = false
    // Whether a press is in progress. A mouse fires `pointermove` on a bare
    // HOVER too, and the scrim covers the whole page behind a sheet — so
    // without this, the first mouse motion after a sheet opened was read as a
    // drag from (0,0), forwarded as `scrollLeft = 0 − clientX`, and the grid
    // snapped back to January (owner, 2 Sep 26 — "when I click on a date in
    // September the month in the background jumps back to JAN"). `buttons`
    // alone is not enough: a touch reports it too, but pointer capture can
    // deliver a move after the release on some browsers, so the press is
    // tracked here as well — and a mouse whose button has gone up (released
    // over the panel, say, where the scrim never hears the `pointerup`) ends
    // the press on its next move rather than panning from the stale origin.
    let pressed = false
    const down = (e: PointerEvent) => {
      const g = grid()
      x0 = e.clientX; y0 = e.clientY; sl0 = g ? g.scrollLeft : 0
      axis = ''; movedRef.current = false; captured = false; pressed = true
    }
    const move = (e: PointerEvent) => {
      if (!pressed) return
      if (e.pointerType === 'mouse' && e.buttons === 0) { pressed = false; return }
      const dx = e.clientX - x0, dy = e.clientY - y0
      if (!axis) {
        if (Math.abs(dx) < PAN_THRESH && Math.abs(dy) < PAN_THRESH) return
        axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
        movedRef.current = true // a committed drag, either axis, is no longer a tap
      }
      if (axis === 'x') {
        // Capture only now, so a vertical drag is left to the browser's own
        // page pan (touch-action: pan-y) rather than swallowed here.
        if (!captured) { try { scrim.setPointerCapture(e.pointerId); captured = true } catch { /* jsdom / unsupported */ } }
        const g = grid()
        if (g) g.scrollLeft = sl0 - dx
        e.preventDefault()
      }
      // axis === 'y': do nothing — the browser pans the page up-down natively.
    }
    const upOrCancel = (e: PointerEvent) => {
      if (captured) { try { scrim.releasePointerCapture(e.pointerId) } catch { /* ignore */ } }
      captured = false; pressed = false
    }
    const wheel = (e: WheelEvent) => {
      const g = grid()
      if (!g) return
      const d = Math.abs(e.deltaX) > 0 ? e.deltaX : (e.shiftKey ? e.deltaY : 0)
      if (!d) return // a plain vertical wheel: let the page scroll up-down, as asked
      g.scrollLeft += d
      e.preventDefault()
    }

    scrim.addEventListener('pointerdown', down)
    scrim.addEventListener('pointermove', move)
    scrim.addEventListener('pointerup', upOrCancel)
    scrim.addEventListener('pointercancel', upOrCancel)
    scrim.addEventListener('wheel', wheel, { passive: false })
    return () => {
      if (coarse) for (const type of SHIELDED) document.removeEventListener(type, shield, true)
      scrim.removeEventListener('pointerdown', down)
      scrim.removeEventListener('pointermove', move)
      scrim.removeEventListener('pointerup', upOrCancel)
      scrim.removeEventListener('pointercancel', upOrCancel)
      scrim.removeEventListener('wheel', wheel)
    }
  }, [movedRef, closeRef])
  return scrimRef
}

/* THE PANEL IS MOVABLE (owner, 28 Aug 26 — "make this window movable, so that
   it doesnt block my view"). Its title strip (`.bidsheet-hd`, present on every
   sheet) is the drag handle: pressing anywhere on it but a button and dragging
   slides the whole panel via a translate offset, clamped so the handle can
   never be lost off-screen. The offset lives in CSS custom properties on the
   panel so it composes with the panel's own `translateX(-50%)` centering
   without React re-rendering the sheet on every pointer frame. It resets to
   zero whenever the sheet remounts (a fresh open), which is the behaviour the
   owner expects — a panel opens where it always did, then he moves it. */
function useSheetDrag(enabled = true) {
  const panelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const panel = panelRef.current
    if (!panel || !enabled) return
    const handle = panel.querySelector<HTMLElement>('.bidsheet-hd')
    if (!handle) return

    let dx = 0, dy = 0            // committed offset
    let px = 0, py = 0           // pointer at drag start
    let dx0 = 0, dy0 = 0         // offset at drag start
    let rect0: DOMRect | null = null
    let dragging = false

    const setVars = () => {
      panel.style.setProperty('--lw-dx', `${dx}px`)
      panel.style.setProperty('--lw-dy', `${dy}px`)
    }
    const down = (e: PointerEvent) => {
      // The ✕ and any control on the header keep doing their own job.
      if ((e.target as HTMLElement).closest('button')) return
      dragging = true
      px = e.clientX; py = e.clientY; dx0 = dx; dy0 = dy
      rect0 = panel.getBoundingClientRect()
      try { handle.setPointerCapture(e.pointerId) } catch { /* jsdom / unsupported */ }
      e.preventDefault()
    }
    const move = (e: PointerEvent) => {
      if (!dragging || !rect0) return
      const rawDx = dx0 + (e.clientX - px)
      const rawDy = dy0 + (e.clientY - py)
      // Clamp against the viewport so at least a strip of the handle always
      // stays reachable — never lose the panel behind the top bar or an edge.
      // Prefer the VISUAL viewport when there is one: a phone keyboard shrinks
      // and pans it while innerWidth/innerHeight stay the layout size, so a
      // keyboard-up drag clamped to the layout size could still shove the panel
      // behind the keys. jsdom has no visualViewport, so this falls straight
      // back to the layout size and the drag-clamp tests are byte-identical.
      const KEEP = 48
      const topbar = document.querySelector('.topbar')?.getBoundingClientRect().bottom ?? 0
      const vv = window.visualViewport
      const vLeft = vv ? vv.offsetLeft : 0, vTop = vv ? vv.offsetTop : 0
      const vw = vv ? vv.width : window.innerWidth, vh = vv ? vv.height : window.innerHeight
      const left0 = rect0.left, top0 = rect0.top
      const minLeft = vLeft + KEEP - rect0.width, maxLeft = vLeft + vw - KEEP
      const minTop = Math.max(topbar, vTop), maxTop = vTop + vh - KEEP
      const clampedLeft = Math.min(Math.max(left0 + (rawDx - dx0), minLeft), maxLeft)
      const clampedTop = Math.min(Math.max(top0 + (rawDy - dy0), minTop), maxTop)
      dx = dx0 + (clampedLeft - left0)
      dy = dy0 + (clampedTop - top0)
      setVars()
      e.preventDefault()
    }
    const up = (e: PointerEvent) => {
      dragging = false
      try { handle.releasePointerCapture(e.pointerId) } catch { /* ignore */ }
    }
    handle.addEventListener('pointerdown', down)
    handle.addEventListener('pointermove', move)
    handle.addEventListener('pointerup', up)
    handle.addEventListener('pointercancel', up)
    return () => {
      handle.removeEventListener('pointerdown', down)
      handle.removeEventListener('pointermove', move)
      handle.removeEventListener('pointerup', up)
      handle.removeEventListener('pointercancel', up)
    }
  }, [])
  return panelRef
}

/* KEYBOARD-AWARE ANCHORING (owner, 31 Aug 26 — "can this fit the top area of
   the screen [so] the save buttons and calendar don't get blocked by the
   keyboard"). A sheet with a focused field raises a phone's on-screen keyboard;
   because the panel is `position:fixed` with `bottom:14px` — LAYOUT coordinates
   — while the keyboard shrinks and pans the VISUAL viewport, the panel's lower
   half (calendar, Save/Delete) lands behind the keys. When the visual viewport
   is shrunk by a keyboard, re-anchor the panel to the top of the visible slice
   and cap its height to that slice, so the whole sheet sits above the keyboard
   and scrolls inside. Mirrors histbubble.ts:place() — the same visual-viewport
   idiom, the same resize+scroll signals (a keyboard pan fires neither a
   document scroll nor a resize on `window`, only on `visualViewport`), the same
   jsdom guard (jsdom has no visualViewport at all). It is a strict no-op
   whenever no keyboard is up, so the default bottom-anchor — and every geometry
   assertion, which all run without a keyboard — is untouched. */
function useKeyboardInset(panelRef: { current: HTMLDivElement | null }) {
  useEffect(() => {
    const vv = window.visualViewport
    const panel = panelRef.current
    if (!vv || !panel) return
    const GAP = 8
    // The viewport must lose more than a chunk before we call it a keyboard —
    // the URL bar showing/hiding shifts it a little and must not re-anchor.
    const KEY = 120
    const place = () => {
      if (window.innerHeight - vv.height <= KEY) {
        // No keyboard: drop the overrides, the CSS bottom-anchor + dvh cap
        // take back over.
        panel.style.top = ''
        panel.style.bottom = ''
        panel.style.maxHeight = ''
        return
      }
      // Zero any drag offset so the top anchor composes cleanly with the
      // panel's own translateX(-50%) centering.
      panel.style.setProperty('--lw-dx', '0px')
      panel.style.setProperty('--lw-dy', '0px')
      // Sit just below the app top bar, but never above the visible slice's
      // own top (a pinch-zoom pan moves it down); cap the height to the slice.
      const bar = document.querySelector('.topbar')?.getBoundingClientRect().bottom ?? 0
      const top = Math.round(Math.max(vv.offsetTop + GAP, bar + GAP))
      panel.style.top = `${top}px`
      panel.style.bottom = 'auto'
      panel.style.maxHeight = `${Math.round(vv.offsetTop + vv.height - top - GAP)}px`
    }
    place()
    vv.addEventListener('resize', place)
    vv.addEventListener('scroll', place)
    return () => {
      vv.removeEventListener('resize', place)
      vv.removeEventListener('scroll', place)
    }
  }, [panelRef])
}

export function Sheet({
  testid,
  label,
  onClose,
  narrow,
  full,
  children,
}: {
  testid: string
  label: string
  onClose: () => void
  /** A read-only info sheet (a figure breakdown, a person's figures) — drawn
   *  narrower and tighter, since its rows are read, not tapped (owner,
   *  28 Aug 26: "make all the window smaller … theres alot of empty space"). */
  narrow?: boolean
  /** A sheet that FILLS the screen (the OIL tracker grid — owner, 2 Sep 26:
   *  "on the desktop it fills the entire screen"). It does not scroll
   *  itself — its content owns a 2-D scroller (frozen columns, sticky
   *  header) — and it is not movable, there being nowhere to move it to. */
  full?: boolean
  children: ReactNode
}) {
  // A drag that scrolled the grid ends in a trailing click on the scrim
  // (mouse) — swallow that one so a sideways scroll never dismisses the sheet.
  // A real tap sets this false at pointerdown, so it still closes.
  const movedRef = useRef(false)
  // The latest onClose, for listeners armed once: the Escape key below and, on
  // a touch screen, the tap shield in useGridPan.
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  const scrimRef = useGridPan(movedRef, closeRef)
  const panelRef = useSheetDrag(!full)
  useKeyboardInset(panelRef)
  const onScrimClick = () => {
    if (movedRef.current) { movedRef.current = false; return }
    onClose()
  }
  /* ESCAPE CLOSES IT (bug sweep, 28 Aug 26). Every other dismissible surface in
     the app already answers Escape — the input editor peels one layer at a
     time, the Medical as-of picker closes — but no Leave War sheet did: its ✕
     and a scrim tap were the only ways out. That leaves anyone on a keyboard
     stuck inside a `role="dialog"`, and it reads as broken next to the sibling
     surfaces. Fixed HERE, in the one wrapper every sheet is built from, for the
     same reason the scrim lives here: a sheet cannot then be written without it.
     Only the TOPMOST sheet acts. Today that guard never fires — Leave War
     sheets REPLACE one another (the person editor takes the figures sheet's
     place, a decision sheet yields to the remarks editor), so there is only
     ever one — but the day two are mounted at once, one press must peel one
     layer rather than clearing the pile. The listener captures so a field's own
     Escape handler cannot swallow it first. */
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      /* KEPT-MOUNTED guard (bug-hunt fix, 1 Sep 26): since the Leave War tab
         stays mounted behind a tab switch (LeaveWarPage), a sheet left open
         when the reader switched away keeps this capture listener alive on a
         RAPTOR page — where its stopPropagation used to swallow the Escape
         that Raptor's own cell editing (textedit.ts) restores on, and close
         the hidden sheet behind the reader's back. Act only while the Leave
         War section is the one showing; no wrapper (the standalone app) means
         always. */
      const pg = document.getElementById('page-leavewar')
      if (pg && !pg.classList.contains('on')) return
      const all = document.querySelectorAll('.bidsheet')
      if (all.length && all[all.length - 1] !== panelRef.current) return
      e.stopPropagation()
      closeRef.current()
    }
    document.addEventListener('keydown', esc, true)
    return () => document.removeEventListener('keydown', esc, true)
  }, [panelRef])
  return (
    <>
      {/* Not a button and not focusable: it carries nothing a screen reader
          needs, and every sheet already has a real labelled ✕. This is a
          pointer convenience on top of that, never the only way out. On a
          touch screen useGridPan turns its pointer-events OFF, so a finger
          falls through to the grid and its click here never fires there. */}
      <div ref={scrimRef} className="sheetscrim" data-testid="sheet-scrim" aria-hidden="true" onClick={onScrimClick} />
      <div ref={panelRef} className={`bidsheet${narrow ? ' narrow' : ''}${full ? ' full' : ''}`} data-testid={testid} role="dialog" aria-label={label}>
        {children}
      </div>
    </>
  )
}
