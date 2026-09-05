/* The Leave War page — the vendored leave-bidding calendar, mounted as a
   Raptor tab (16 Aug 26). This wrapper is the whole seam: it renders exactly
   what the standalone app's main.tsx rendered (Topbar / StageBar / Matrix),
   minus the StrictMode root and the boot call — lwInitStore() runs ONCE from
   Raptor's main.tsx, never here, because Leave War's initStore clears its
   store subscribers.
   KEPT MOUNTED between visits since 1 Sep 26 (owner — the tab was slow to
   open): the Shell hides this section on a tab switch instead of unmounting
   it, so the ~28k-node year grid is built once per session, not once per
   visit. `active` is that visibility — the component stays subscribed to the
   store while hidden (so it can never show stale data on return) and this
   effect handles the two things CSS hiding breaks:
   · a display:none grid measures every rect as 0×0, so the moment the tab
     shows again we restore the page scroll and dispatch a window `resize` —
     every measurement the Matrix owns (the frozen header/columns, the month
     strip, the bottom scrollbar) already re-measures on resize, and each
     guards the hidden case, so one event re-pins the lot without a second
     wiring;
   · the page's vertical scroll is the WINDOW's (the standalone "one vertical
     scroll" rule), which Raptor shares across tabs — so where the reader WAS
     is tracked while the tab is up and put back on return. A first visit
     restores 0, the old open-at-the-top behaviour; later visits come back to
     the same spot (the grid's own sideways scroll survives for free, the DOM
     never went away).
   The standalone app's theme.css is gone rather than vendored: its :root
   tokens, `*`, `html` and `body` rules were byte-copies of scheduler.css's
   globals (copied FROM Raptor by design), so inside Raptor they were pure
   duplicates. Every remaining Leave War stylesheet is scoped under
   #page-leavewar — see the comment at the top of each. */
import { memo, useEffect, useRef } from 'react'
import { StageBar, Topbar } from './ui/Chrome'
import { Matrix } from './ui/Matrix'
import { setLwOnScreen } from './state/screen'

/* The RENDER FIREWALL that makes staying mounted affordable. Every Raptor
   notify re-renders the Shell, and a plain child here would make React
   re-walk the whole ~28k-node grid each time — while the tab is HIDDEN that
   would tax every board keystroke, and on RETURN it made the "instant" show
   cost nearly a first build (measured 1.6s at 1280px). memo with no props
   stops the parent's render at this line; the three children each subscribe
   to the Leave War store themselves (useVersion), and every fact this tab
   renders arrives THROUGH that store — the sync seam mirrors Raptor's
   roster/role/viewer into it with its own notify (sync.ts, toggleRole) — so
   nothing here can go stale behind the firewall. The one Raptor import in
   this UI (RemarksSheet's save) is a write path, not rendered state.
   Re-measured with the memo AND scheduler.css's `.page.doze`
   content-visibility cache: a return commits in ~3ms and paints within two
   frames (~0.1s at 390px, ~0.2s at 1280px) against a ~1s first build. */
const LwBody = memo(function LwBody() {
  return (
    <>
      <Topbar />
      <StageBar />
      <Matrix />
    </>
  )
})

export function LeaveWarPage({ active = true }: { active?: boolean }) {
  const savedY = useRef(0)
  useEffect(() => {
    if (!active) return
    /* Tell the Matrix the tab is on screen BEFORE the resize kick, so its
       background fill switches from the small hidden window to filling the whole
       year (desktop) and the fill kick below finds the flag already true. The
       signal is a plain listener set, NOT the store — see state/screen.ts for
       why flipping it must not re-render the grid. */
    setLwOnScreen(true)
    /* Restore before the resize kick, so the re-measure reads the grid at
       the position the reader is actually returned to. */
    window.scrollTo(0, savedY.current)
    window.dispatchEvent(new Event('resize'))
    /* Track the spot continuously rather than reading scrollY on the way
       out: by the time a leave-effect runs the section is already hidden,
       the page is shorter, and the browser has clamped the scroll. */
    const onScroll = () => { savedY.current = window.scrollY }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      /* Off screen now: BEFORE the resize kick, so the Matrix sees the flag
         false and shrinks its drawn window back to a few months around the
         current view. That is what keeps the NEXT return cheap — the browser
         re-styles a small grid on reveal, not the whole year (owner, 5 Sep 26).
         The fill rebuilds the year again once the tab is shown. */
      setLwOnScreen(false)
      /* The hide-side kick. The same measured-at-zero sweep that makes the
         show-side resize safe makes this one USEFUL: the Matrix's fixed
         bottom scrollbar is React state fed by a rect measurement, so one
         resize against the now-hidden section measures 0×0 and unmounts it —
         keeping the geometry gate's "nothing leaks onto the Raptor pages"
         contract byte-true even though the grid itself stays in the DOM. */
      window.dispatchEvent(new Event('resize'))
    }
  }, [active])
  return <LwBody />
}
