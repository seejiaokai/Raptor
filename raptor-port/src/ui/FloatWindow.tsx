/* THE WINDOWS SHELL — one body for every window of the Inputs / SANS calendar job (the build plan
   docs/superpowers/plans/2026-10-07-inputs-sans-redesign-plan.md §3.7).

   Owner, D641 (7 Oct 26): "all those pop up windows that u showed me in the mock up should be able to drag around and
   the background still works (clickable editable) when this window is up." It sets aside, for these windows, the
   4 Sep 26 rule that a pop-up closes on a click outside it (docs/guide-full.md carries the exception): a press outside
   one of them acts on the PAGE and the window stays. It closes by its own ✕, by Escape, or by the button that finishes
   it (Apply, Save, Done — the caller's).

   A SHELL, NOT A SECOND SET OF PLACEMENT RULES. Where a window sits, the drag, the clamp into the screen, the phone
   layout (≤620px: the stylesheet's bottom panel, only its height his to drag) and which window is in front are the
   app's ONE movable-window body, ui/floatwin.ts `useFloatWin` — written for the ALL AVAIL window and shared with the
   changes window, each rule there with the finding that made it. This adds what those two did by hand and what D641
   asks of every window of this job:
     · a title bar it is dragged by (the six-dot grip, the title, a small second line), and ✕;
     · `role="dialog"` with `aria-modal="false"` — it does NOT take the page away: no veil is drawn, nothing outside it
       is made inert, and Tab is not held inside it;
     · focus is moved INTO the window when it opens and back to whatever opened it when it closes;
     · a press anywhere on a window brings it to the front (two bounded layers, as the two older windows have);
     · Escape closes the FRONT window — when the keyboard is in a window, or nowhere. Escape typed in a box on the page
       BEHIND is that box's own (a cell being edited puts its text back on Escape): the window stays.
   WHERE HE PUT IT IS KEPT per window id for the life of the page (never stored — the changes window's own rule), and
   only the PLACE: these windows size themselves to what they hold, so the size a drag happened to freeze is let go.

   What it carries is the plan's list (§3.7): each calendar's settings, Days and "Every <weekday>", a day opened on a
   calendar, the input editor on the Inputs page. What it does NOT: a question that must be answered before going on
   (those stay blocking), a small menu or picker (they still close on a click outside), and the Leave War's own
   windows — the war's non-blocking form is its `Sheet`'s `modal={false}` (leavewar/ui/Sheet.tsx), a different chassis
   with the same manners. Its look: ui/scheduler/22-float-windows.css.

   TWO REST HEIGHTS ON A PHONE (`rests` — the plan §3.5; owner D648, 7 Oct 26: a day opened on a calendar "does not open
   full screen, but on a phone it can be pulled up by its top bar to nearly the full screen and back down"). A window
   that asks for it is a panel standing on the foot of the screen: it opens at the lower height, its bar pulls it up to
   nearly the whole screen and back, and it rests at one of the two — never in between, where a list would be cut at an
   odd line. A tap on the bar goes to the other height (a drag is not the only way to say "more"). It opens at the lower
   height EVERY time: the calendar behind it is what he came from (D641), and a window that remembered being tall would
   open over all of it. On a desktop `rests` changes nothing — the bar moves the window, as every window's does. */
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { frontWin, phoneLayout, raiseWin, useFloatWin, type FloatBox } from './floatwin'
import { useVersion } from './useStore'
import { notify } from '../state/store'

/* where he left each window, by its id — module state, never component state: the page behind re-renders on every
   keystroke, and component state would throw a window back to its corner mid-drag (floatwin.ts) */
const BOXES = new Map<string, FloatBox | null>()
/** test-only: forget every window's place and which was in front */
export function _resetFloatWins(): void { BOXES.clear(); raiseWin('') }

/* how far the bar must be dragged for the panel to go to its other height — less is a wobble, and it stays put */
const PULL = 40

export function FloatWin({ id, title, sub, onClose, testid, className, rests, children }: {
  /** which window this is — its remembered place and its turn in front are kept by it; one window per id at a time */
  id: string
  title: string
  /** a small second line under the title (who may use it, what it is showing) */
  sub?: string
  /** ✕ and Escape call this; the caller unmounts the window */
  onClose: () => void
  testid?: string
  /** a size or a look of the caller's own, beside `floatwin` */
  className?: string
  /** on a phone: a panel with two rest heights, pulled up and down by its bar (see the head of this file) */
  rests?: boolean
  children: ReactNode
}) {
  useVersion()                                         // which window is in front is said through the app's own signal
  const { el, onBarDown, onBarMove, onBarUp } = useFloatWin({
    open: true,
    getBox: () => BOXES.get(id) ?? null,
    setBox: b => { BOXES.set(id, b) },
    deps: [id],
  })
  /* THE SIZE IS THE CONTENT'S. The shared body writes back the width and height a window had when it was dragged — right
     for the two list windows he resizes by hand, wrong here: Days is a month on one tab and a list on the other. So
     after every placement the size is handed back to the stylesheet; the place he chose stays. (Declared after the
     hook, so it runs after the hook's own placement.) */
  useLayoutEffect(() => {
    const n = el.current
    if (n) { n.style.width = ''; n.style.height = '' }
  })

  /* THE PHONE PANEL'S TWO HEIGHTS. While a finger holds the bar the panel's top follows it, written straight onto the
     element (no re-render per frame, as a window's drag is); let go, the inline styles are taken away and the
     stylesheet's two heights decide — `is-tall` or not. */
  const sheet = !!rests && phoneLayout()
  const [tall, setTall] = useState(false)
  const pull = useRef<{ y0: number; top0: number; top: number; moved: boolean } | null>(null)
  /* a drag just ended on the bar: the click that may follow it is not a tap */
  const dragged = useRef(false)
  const sheetDown = (e: React.PointerEvent) => {
    const n = el.current
    dragged.current = false
    if (!n || (e.target as HTMLElement).closest('.win-x')) return
    const top = n.getBoundingClientRect().top
    pull.current = { y0: e.clientY, top0: top, top, moved: false }
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch { /* jsdom */ }
    e.preventDefault()
  }
  const sheetMove = (e: React.PointerEvent) => {
    const d = pull.current, n = el.current
    if (!d || !n) return
    if (Math.abs(e.clientY - d.y0) > 3) d.moved = true
    if (!d.moved) return
    /* never above the screen's top, never so low that the bar itself leaves the screen */
    d.top = Math.min(Math.max(8, d.top0 + e.clientY - d.y0), Math.max(8, window.innerHeight - 120))
    n.style.top = d.top + 'px'; n.style.height = 'auto'; n.style.maxHeight = 'none'
  }
  const sheetUp = () => {
    const d = pull.current, n = el.current
    pull.current = null
    if (!d) return
    if (n) { n.style.top = ''; n.style.height = ''; n.style.maxHeight = '' }
    if (!d.moved) return
    dragged.current = true
    if (d.top0 - d.top > PULL) setTall(true)
    else if (d.top - d.top0 > PULL) setTall(false)
  }
  /* A TAP GOES TO THE OTHER HEIGHT — ON THE CLICK, never on the release: the panel moves under the finger as it
     changes height, and a click that came AFTER the move would press whatever had arrived there (found on the first
     look at the running build, 8 Oct 26: a tap on the bar pulled the panel up and its "+ Commitment" took the click). */
  const sheetTap = (e: React.MouseEvent) => {
    if (dragged.current) { dragged.current = false; return }
    if ((e.target as HTMLElement).closest('.win-x')) return
    setTall(t => !t)
  }
  const bar = sheet
    ? { onPointerDown: sheetDown, onPointerMove: sheetMove, onPointerUp: sheetUp, onPointerCancel: sheetUp, onClick: sheetTap }
    : { onPointerDown: onBarDown, onPointerMove: onBarMove, onPointerUp: onBarUp, onPointerCancel: onBarUp }

  /* OPENED LAST, IN FRONT — and the keyboard goes into it; closed, the keyboard goes back to what opened it */
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  useLayoutEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const n = el.current
    if (raiseWin(id)) notify()
    if (n && !n.contains(document.activeElement)) n.focus({ preventScroll: true })
    return () => {
      const at = document.activeElement
      if (opener && opener.isConnected && typeof opener.focus === 'function' && (!at || at === document.body || (n && n.contains(at)))) {
        opener.focus({ preventScroll: true })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, for the life of this window
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented || frontWin() !== id) return
      const at = document.activeElement as HTMLElement | null
      const inWindow = !!(at && typeof at.closest === 'function' && at.closest('.floatwin'))
      /* in a box on the page behind, Escape is that box's own */
      if (!inWindow && at && at !== document.body) return
      e.stopPropagation()
      closeRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [id])

  return (
    <div
      className={'floatwin' + (className ? ' ' + className : '') + (rests ? ' rests' : '') + (sheet && tall ? ' is-tall' : '') + (frontWin() === id ? ' front' : '')}
      ref={el}
      role="dialog"
      aria-modal="false"
      aria-label={title}
      tabIndex={-1}
      data-testid={testid}
      onPointerDownCapture={() => { if (raiseWin(id)) notify() }}
    >
      <div className="win-bar" {...bar}>
        {/* the app's own six-dot grip, "drag me" (D40) */}
        <span className="win-grip" aria-hidden="true">&#10303;</span>
        <span className="win-ttl">{title}{sub ? <small>{sub}</small> : null}</span>
        <button type="button" className="win-x" data-testid={testid ? `${testid}-x` : undefined} onClick={onClose} title="Close" aria-label={`Close ${title}`}>&#10005;</button>
      </div>
      <div className="win-body">{children}</div>
    </div>
  )
}
