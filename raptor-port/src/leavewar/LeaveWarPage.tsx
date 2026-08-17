/* The Leave War page — the vendored leave-bidding calendar, mounted as a
   Raptor tab (16 Aug 26). This wrapper is the whole seam: it renders exactly
   what the standalone app's main.tsx rendered (Topbar / StageBar / Matrix),
   minus the StrictMode root and the boot call — lwInitStore() runs ONCE from
   Raptor's main.tsx, never here, because this section unmounts on every tab
   switch and Leave War's initStore clears its store subscribers.
   The standalone app's theme.css is gone rather than vendored: its :root
   tokens, `*`, `html` and `body` rules were byte-copies of scheduler.css's
   globals (copied FROM Raptor by design), so inside Raptor they were pure
   duplicates. Every remaining Leave War stylesheet is scoped under
   #page-leavewar — see the comment at the top of each. */
import { useEffect } from 'react'
import { StageBar, Topbar } from './ui/Chrome'
import { Matrix } from './ui/Matrix'

export function LeaveWarPage() {
  /* The page's vertical scroll is the WINDOW's (the standalone app's "one
     vertical scroll" rule), and Raptor keeps the window scroll across a tab
     switch — so arriving from a week page the user had scrolled deep, this
     tab would open with its date header already off the top of the screen.
     A tab opens at its own top; mount is exactly the moment of arrival. */
  useEffect(() => { window.scrollTo(0, 0) }, [])
  return (
    <>
      <Topbar />
      <StageBar />
      <Matrix />
    </>
  )
}
