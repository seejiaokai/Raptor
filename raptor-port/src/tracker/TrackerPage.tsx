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
import { memo, useEffect, useLayoutEffect, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import App, { PAGE_ID } from './App.jsx'
import { wireTrackerPeople } from './peoplewire'
import * as core from './app/core.js'
import { seedDemoNow } from '../state/seeds'
import { subscribeBands, trackerBand } from '../state/typing-hold'
import './tracker.css'

/* The render firewall (LeaveWarPage.tsx has the measured why): every Raptor
   notify re-renders the Shell, and the Tracker subscribes to its OWN store
   (core.js subscribe/getVersion) — nothing it draws arrives through props,
   so the parent's render can stop at this line. `active` is the one prop, and
   a tab switch is exactly when it must re-render. */
/* THE BOOT POLICY ([DB-READINESS] group A, phase 5 — D463): the Tracker boots at its first mount, long after Raptor's
   boot, so this page — the seam between the two — tells it the policy Raptor booted with (state/seeds.ts): on a shared
   store it makes no course and no demo student. Set as this chunk loads, before the first mount's init. */
core.setTrackerSeedDemo(seedDemoNow())
/* Wired as this chunk loads, not only on the first mount: the engine's boot (a
   child's effect, which runs BEFORE this page's own) reads the signed-in person to
   open on his own course and student (D376). Idempotent — the mount's call below
   is then a no-op. */
wireTrackerPeople()

const TrBody = memo(function TrBody({ active }: { active: boolean }) {
  return <App active={active} />
})

/* THE BAND ACROSS THE CHART EDITOR WHEN HIS SQUADRON CHANGES UNDER IT (the reshape plan §3.2 A-iv "Typed work at the swap";
   his D2243 Q7, "as drawn" — docs/mock/2026-11-20-multi-sqn-reshape/page.html §7, pictures q7c-d and q7c-p, D1478).
   The Tracker cannot be re-read in place once it has loaded (the plan §14 item 3 — its records sit in module caches of
   app/core.js; tracker/storage.js rebindStorageUnit): at his move's midnight the schedule and the Leave War move to his
   new squadron, and this page keeps the squadron it loaded until he signs in again, the gate's 7f refusing his changes
   to it. So while "Edit chart layout" is open on a Tracker that is no longer his page's own squadron, one band stands
   across the chart's top, between the editing tools and the editing hint, in the failed-save band's own look
   (ui/scheduler/17-save-status.css): "You are 149's from today. This can't be saved in 142's Tracker." — the words
   state/store.ts writes into state/typing-hold.ts — and one button, "Close", the editing row's own button look. Close
   leaves Edit chart layout as "✓ Done editing chart" does: the edits stay unsaved, never saved by the band, and the bar
   says they are unsaved. On the iPhone the band takes two lines. Nothing else of the Tracker carries it (the drawing drew
   the chart editor alone, D1625). Drawn from this page, the seam between the two stores, in a slot of its own put after
   the editing tools (`.arrwrap`): nothing under app/ or components/ reads Raptor's state (tracker.test.tsx). */
const TrkMoveBand = memo(function TrkMoveBand() {
  const band = useSyncExternalStore(subscribeBands, trackerBand, trackerBand)
  useSyncExternalStore(core.subscribe, core.getVersion)
  const up = !!band && core.arrangeMode
  const [slot, setSlot] = useState<HTMLElement | null>(null)
  useLayoutEffect(() => {
    const tools = up ? document.querySelector(`#${PAGE_ID} .arrwrap`) : null
    const host = tools?.parentElement
    if (!tools || !host) return
    const el = document.createElement('div')
    el.className = 'moveband-slot'
    /* across the chart's top, let out past its column's padding as the board's band is past its bar's */
    const cs = getComputedStyle(host)
    const pl = parseFloat(cs.paddingLeft) || 0, pr = parseFloat(cs.paddingRight) || 0
    el.style.margin = `0 -${pr}px 8px -${pl}px`
    el.style.width = `calc(100% + ${pl + pr}px)`
    tools.after(el)
    setSlot(el)
    return () => { el.remove(); setSlot(null) }
  }, [up])
  if (!band || !up || !slot) return null
  return createPortal(
    <div className="saveband moveband" role="status" data-testid="trk-move-band">
      <span className="sv-msg">
        <span className="sv-sign" aria-hidden="true" /><b>{band.lead}</b>
        {band.rest ? <><span className="sv-sep"> </span><span className="sv-rest">{band.rest}</span></> : null}
      </span>
      <button type="button" onClick={() => { if (core.arrangeMode) core.toggleArrange() }}>Close</button>
    </div>,
    slot,
  )
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
  return <><TrBody active={active} /><TrkMoveBand /></>
}
