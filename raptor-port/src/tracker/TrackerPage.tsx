/* The Tracker page — the vendored OCU Progress Tracker, mounted as a Raptor
   tab (7 Sep 26; github.com/seejiaokai/Tracker at bf9a47a). This wrapper is
   the whole seam on the screen side: it renders the standalone app's own
   <App/> (App.jsx — header, edit strip, legend, flow board, side panel and its
   modals) inside Raptor's `#page-tracker` section and does the two things
   living inside another app's page needs.

   KEPT MOUNTED once visited (Shell.tsx, the Leave War precedent): the flow
   board is drawn IMPERATIVELY into #board by core.init(), which runs once per
   page load and is guarded against a second run — so an unmount/remount
   would hand it a fresh, empty #board and nothing would redraw it. `active`
   is the tab's visibility; App.jsx switches its document-level key/click
   listeners off while another tab is up.

   THE TAB IS A VIEWPORT-TALL COLUMN, not a scrolling page. The standalone app
   sized itself off <body> (100dvh, overflow hidden — the chart scrolls inside
   its own box). Under Raptor's sticky top bar that column is the viewport
   MINUS the bar, which no stylesheet can know on its own (the bar wraps to a
   different height on a phone), so it is measured here on show and on resize
   and handed to tracker.css as `--tr-top`. Hidden, the section is display:none
   and measures 0×0, so the measurement is taken only while active — the same
   rule LeaveWarPage follows for its own re-measure. */
import { memo, useEffect } from 'react'
import App, { PAGE_ID } from './App.jsx'
import { wireTrackerPeople } from './peoplewire'
import './tracker.css'

/* The render firewall (LeaveWarPage.tsx has the measured why): every Raptor
   notify re-renders the Shell, and the Tracker subscribes to its OWN store
   (core.js subscribe/getVersion) — nothing it draws arrives through props,
   so the parent's render can stop at this line. `active` is the one prop, and
   a tab switch is exactly when it must re-render. */
const TrBody = memo(function TrBody({ active }: { active: boolean }) {
  return <App active={active} />
})

export function TrackerPage({ active = true }: { active?: boolean }) {
  /* The people bridge (9 Sep 26): this page is the one seam Raptor's store
     and the Tracker share, so the squadron roster is projected into the
     Tracker's no-import bridge from here — once, on the first mount (the
     wire is idempotent; a logout → login remount is a second call, not a
     second subscriber). Before the effect the chart engine may already be
     booting; the + Add dialog reads the bridge when it opens, so the order
     does not matter. */
  useEffect(() => { wireTrackerPeople() }, [])
  useEffect(() => {
    if (!active) return
    const el = document.getElementById(PAGE_ID)
    /* The window never scrolls while this tab is up — the chart and the side
       panel scroll inside their own boxes, the standalone app's one rule —
       and Raptor's body keeps a 120px bottom pad for the week pages' pinned
       chrome, which would otherwise leave the whole page scrolling by exactly
       that much under a full-height column. `body.tr-on` (tracker.css) drops
       the pad and locks the document, the same shape as body.sb-lock. */
    document.body.classList.add('tr-on')
    window.scrollTo(0, 0)
    const measure = () => {
      /* whatever Raptor draws above the page section — the top bar, the
         "View as" row — measured as the section's own top edge at scroll 0,
         so a wrapped phone bar or a future extra row is never a stale number */
      if (el) el.style.setProperty('--tr-top', Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY)) + 'px')
    }
    measure()
    window.addEventListener('resize', measure)
    /* the flow board fits itself to its box on a resize (core.init's listener)
       — a show after a hidden spell is the same event to it, and the section
       has just gone from 0×0 to real */
    window.dispatchEvent(new Event('resize'))
    return () => {
      window.removeEventListener('resize', measure)
      document.body.classList.remove('tr-on')
    }
  }, [active])
  return <TrBody active={active} />
}
