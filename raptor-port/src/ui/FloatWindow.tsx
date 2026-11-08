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
   open over all of it. On a desktop `rests` changes nothing — the bar moves the window, as every window's does.

   `tallFirst` (owner D683, 9 Oct 26 — his look at the day opened on the Inputs calendar, on his phone: "show the window
   to like a tall size when someone clicks on a day for input"): the same two heights, opened at the TALL one. It is
   still pulled down by its bar and back, and it opens tall every time — what it remembers is nothing, as before.

   `tools` (D683: "+note and pucks can shift … to beside the day title"): a window's own few buttons, drawn in the bar
   between its title and its cross. A press on one is the button's, never the bar's — it does not start a drag, and on
   a phone it does not send the panel to its other height.

   `mark` (owner D849, 14 Oct 26 — "2 yes"; D771: "beside the window's title"): something the window SAYS about what it
   holds — a cancelled input's red CX tag and its reason — drawn straight after the title. Not a tool: it does nothing,
   so the bar is dragged by it as by the title. The title then takes only the room its words need and the mark what is
   left, so a long reason is cut short before the title is (22-float-windows.css `.has-mark`). */
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { frontWin, holdPageScroll, phoneLayout, useFloatWin } from './floatwin'
import { forward, gone, winBox, setWinBox, takeBeside } from './winorder'
import { putBack, refit } from './kbscroll'
import { useVersion } from './useStore'
import { notify } from '../state/store'
import { placeToast } from './toast'

/* how far the bar must be dragged for the panel to go to its other height — less is a wobble, and it stays put */
const PULL = 40

export function FloatWin({ id, title, sub, onClose, testid, className, rests, tallFirst, tools, mark, foot, children }: {
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
  /** with `rests`: the phone panel opens at its TALL height (D683) */
  tallFirst?: boolean
  /** the window's own buttons, in the bar after the title (D683) */
  tools?: ReactNode
  /** what the window says about what it holds, straight after its title — a mark, never a control */
  mark?: ReactNode
  /** drawn under the window's scrolling body, outside it, so it never covers a line of it nor scrolls away — the Leave
      War day window's "↓ N more" (D1788) */
  foot?: ReactNode
  children: ReactNode
}) {
  useVersion()                                         // which window is in front is said through the app's own signal
  /* a place just chosen re-draws THIS window once (never the page): its height is then fitted to the room under it */
  const [, placed] = useState(0)
  const { el, onBarDown, onBarMove, onBarUp } = useFloatWin({
    open: true,
    getBox: () => winBox(id),
    setBox: b => { setWinBox(id, b); placed(n => n + 1) },
    deps: [id],
    closeSel: '.win-x, .win-tools',
  })
  /* THE SIZE IS THE CONTENT'S. The shared body writes back the width and height a window had when it was dragged — right
     for the two list windows he resizes by hand, wrong here: Days is a month on one tab and a list on the other. So
     after every placement the size is handed back to the stylesheet; the place he chose stays. (Declared after the
     hook, so it runs after the hook's own placement.) */
  /* AND WHERE HE PUT IT, IT STILL ENDS ON THE SCREEN. A window dragged low kept its full height and ran off the foot of
     the screen — its Save with it (found by the settings window's browser test, 8 Oct 26: dragged 140px down, the
     button could not be pressed). A placed window is capped at the room under its top; its body scrolls. Only on a
     desktop — a phone's panel is the stylesheet's. */
  useLayoutEffect(() => {
    const n = el.current
    if (!n) return
    n.style.width = ''; n.style.height = ''
    const b = winBox(id)
    if (b && !b.phone && !phoneLayout()) n.style.maxHeight = Math.max(160, window.innerHeight - n.getBoundingClientRect().top - 8) + 'px'
    /* …AND ON A PHONE TOO, ONCE DRAGGED (F5 of the 3 Nov 26 re-check): a dragged window keeps only its top there, so it lost
       its foot and took its whole height — the Calendar window on a 320 × 568 phone grew from 508 to 653, dragged low and
       back, its last week under the screen's foot. It is capped at the room under its top, as a desktop's placed window
       is; its body scrolls. Not a panel with two rest heights — its own pull sets those. */
    else if (b && b.phone && phoneLayout() && !rests) n.style.maxHeight = Math.max(160, window.innerHeight - n.getBoundingClientRect().top - 6) + 'px'
  })

  /* OPENED BESIDE ANOTHER WINDOW (F9 of the 3 Nov 26 re-check — winorder.ts openBeside): asked for by a door in that window,
     and with no place of his yet, this one opens to the LEFT of it, its top where the stylesheet puts it, so neither covers
     the other; where that would run off the screen's left edge it opens at its own corner, as before. A desktop's alone.
     Its place is then remembered as any window's is; its size stays the content's (above). */
  useLayoutEffect(() => {
    const by = takeBeside(id), n = el.current
    if (!by || !n || phoneLayout() || winBox(id)) return
    const other = document.querySelector(`.floatwin[data-winid="${by}"]`)
    if (!other) return
    const a = other.getBoundingClientRect(), r = n.getBoundingClientRect()
    /* WHERE THE LEFT HAS NOT ROOM ENOUGH, AS FAR LEFT AS IT GOES — so long as the other window's own end, its ✕ with it,
       stays clear (the bug check of 3 Nov 26, walker W1 S21: at his PC's 1536 wide the SANS day stood at 1090, the
       Calendar window is 1094 wide, and it fell back to its corner, right over the day and its ✕). Less room than that:
       its own corner, as before. */
    const x = Math.max(8, Math.round(a.left - r.width - 12))
    if (x + r.width > a.right - 72) return
    setWinBox(id, { x, y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), phone: false })
    placed(k => k + 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, as the window opens: the request is taken and gone
  }, [])

  /* THE PHONE PANEL'S TWO HEIGHTS. While a finger holds the bar the panel's top follows it, written straight onto the
     element (no re-render per frame, as a window's drag is); let go, the inline styles are taken away and the
     stylesheet's two heights decide — `is-tall` or not. */
  const sheet = !!rests && phoneLayout()
  const [tall, setTall] = useState(!!tallFirst)
  const pull = useRef<{ y0: number; top0: number; top: number; moved: boolean } | null>(null)
  /* a drag just ended on the bar: the click that may follow it is not a tap */
  const dragged = useRef(false)
  const sheetDown = (e: React.PointerEvent) => {
    const n = el.current
    dragged.current = false
    if (!n || (e.target as HTMLElement).closest('.win-x, .win-tools')) return
    putBack(n)   // raised or held for the keys: the pull starts from where it really stands
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
    if (!d.moved) { requestAnimationFrame(refit); return }   // a tap, not a pull: back above the keys (kbscroll.ts)
    dragged.current = true
    if (d.top0 - d.top > PULL) setTall(true)
    else if (d.top - d.top0 > PULL) setTall(false)
  }
  /* A TAP GOES TO THE OTHER HEIGHT — ON THE CLICK, never on the release: the panel moves under the finger as it
     changes height, and a click that came AFTER the move would press whatever had arrived there (found on the first
     look at the running build, 8 Oct 26: a tap on the bar pulled the panel up and its "+ Commitment" took the click). */
  const sheetTap = (e: React.MouseEvent) => {
    if (dragged.current) { dragged.current = false; return }
    if ((e.target as HTMLElement).closest('.win-x, .win-tools')) return
    setTall(t => !t)
  }
  const bar = sheet
    ? { onPointerDown: sheetDown, onPointerMove: sheetMove, onPointerUp: sheetUp, onPointerCancel: sheetUp, onClick: sheetTap }
    : { onPointerDown: onBarDown, onPointerMove: onBarMove, onPointerUp: onBarUp, onPointerCancel: onBarUp }

  /* OPENED LAST, IN FRONT — and the keyboard goes into it; closed, the keyboard goes back to what opened it */
  /* today's onClose for the Escape listener below — written after each commit, never during a render React may throw
     away (its one reader is that listener, run on a key press) */
  const closeRef = useRef(onClose)
  useLayoutEffect(() => { closeRef.current = onClose })
  useLayoutEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const n = el.current
    if (forward(id)) notify()
    if (n && !n.contains(document.activeElement)) n.focus({ preventScroll: true })
    /* a passing note already on screen moves clear of the buttons this window has just put at the foot of a phone's
       screen (D731 (1) — ui/toast.ts placeToast) */
    placeToast()
    return () => {
      /* the one left comes forward - and is repainted, so it wears the mark */
      if (gone(id)) notify()
      const at = document.activeElement
      if (opener && opener.isConnected && typeof opener.focus === 'function' && (!at || at === document.body || (n && n.contains(at)))) {
        opener.focus({ preventScroll: true })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, for the life of this window
  }, [])

  /* A FINGER ON A WINDOW NEVER SCROLLS THE PAGE BEHIND IT (owner D686, 9 Oct 26 — found on his iPhone: with the
     new-input window up, a finger moved on it scrolled the page behind). A window does not block the page (D641), so
     the page behind is free to scroll — and where what is in the window FITS, or has reached its top or its foot, an
     iPhone hands the swipe on to that page; the stylesheet's `overscroll-behavior:contain` holds it only where there
     is something to scroll (it does hold in the build PC's browser, which is why no test here saw it). So the window
     decides itself: a swipe up or down that began on it is left alone while something INSIDE it can still move that
     way, and is otherwise taken by nobody. A native listener, not React's: only a non-passive one may stop a touch
     move. Sideways swipes are not its business, nor is a finger on the page behind. (The body is floatwin.ts
     holdPageScroll, shared since 18 Oct 26 with the schedule's own input window — [SCHED-INPUT-WINDOW-PHONE].) */
  useEffect(() => {
    const n = el.current
    if (!n) return
    return holdPageScroll(n)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the window's own element, for its life
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented || frontWin() !== id) return
      const at = document.activeElement as HTMLElement | null
      const inWindow = !!(at && typeof at.closest === 'function' && at.closest('.floatwin'))
      /* in a box on the page behind, Escape is that box's own — a box he types in (a cell being edited puts its text
         back on Escape). A BUTTON behind that still holds the keys owns no Escape (F7 of the 3 Nov 26 re-check: with the
         month's arrow last pressed, Escape did nothing, the window staying up); the window in front closes. */
      if (!inWindow && at && at !== document.body && (/^(INPUT|TEXTAREA|SELECT)$/.test(at.tagName) || at.isContentEditable)) return
      /* ONE ESCAPE, ONE WINDOW (F2 of the re-check): the key is marked used, so the window that comes to the front as
         this one goes does not take the same press and close too — the input's window behind the day closed with what
         was typed in it. Every window here asks `defaultPrevented` first. */
      e.preventDefault()
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
      /* eslint-disable-next-line react-doctor/prefer-html-dialog -- a <dialog> opens in the browser's top layer, above the app's own stacking order, with its own backdrop, focus and Escape rules; these windows leave the page behind them working (D641, aria-modal false), stand one over another in the order they were pressed, and close on Escape front-first through this module's own order — layered on purpose */
      role="dialog"
      aria-modal="false"
      aria-label={title}
      tabIndex={-1}
      data-testid={testid}
      data-winid={id}
      /* a press ON this window brings it forward — not one on something it draws inside ANOTHER window (a question hanging
         from a card of the opened day, ui/AskCard.tsx portal): React hands that press to this window too, and it jumped
         over the very card the question hangs from (the walk of 4 Nov 26, S3 on a phone) */
      onPointerDownCapture={e => { if (!(e.currentTarget as HTMLElement).contains(e.target as Node)) return; if (forward(id)) notify() }}
    >
      <div className={'win-bar' + (mark ? ' has-mark' : '')} {...bar}>
        {/* the app's own six-dot grip, "drag me" (D40) */}
        <span className="win-grip" aria-hidden="true">&#10303;</span>
        <span className="win-ttl">{title}{sub ? <small>{sub}</small> : null}</span>
        {mark ? <span className="win-mark">{mark}</span> : null}
        {tools ? <span className="win-tools">{tools}</span> : null}
        <button type="button" className="win-x" data-testid={testid ? `${testid}-x` : undefined} onClick={onClose} title="Close" aria-label={`Close ${title}`}>&#10005;</button>
      </div>
      <div className="win-body">{children}</div>
      {foot}
    </div>
  )
}
