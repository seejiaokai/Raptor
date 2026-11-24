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
import { memo, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import App, { PAGE_ID } from './App.jsx'
import { wireTrackerPeople } from './peoplewire'
import * as core from './app/core.js'
import { seedDemoNow } from '../state/seeds'
import { subscribeBands, trackerBand, trackerCover, type TrkCover } from '../state/typing-hold'
import { MoveBandView } from '../ui/MoveBand'
import { keysBack } from '../ui/sheetfocus'
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

const TrBody = memo(function TrBody({ active, locked }: { active: boolean; locked: boolean }) {
  return <App active={active} locked={locked} />
})

/* THE ONE COVER LEFT (his D2395, 23 Nov 26): the Tracker follows the squadron picked, so the read-only and hidden bands of
   D2318 are gone. What is left is the switch to the member view while this Tracker holds his unsaved chart edits (the door
   held — tracker/storage.js): the page says so in one band across its top, in the band's own look with no button
   (ui/MoveBand.tsx), its words written by state/store.ts (state/typing-hold.ts trackerCover), and nothing of the Tracker
   is shown — its bar, chart and panel — but kept: no reset, so the edits are not lost; leaving the member view brings them
   back as they were. No press, focus or key reaches it (`inert` on its host, and App's document keys off).
   The host wraps the Tracker always, so the cover coming or going never remounts it. The band stands above the Tracker's
   column, whose height is measured to the band's foot (below). */
function useCover(): TrkCover { return useSyncExternalStore(subscribeBands, trackerCover, trackerCover) }

/* THE PICK'S QUESTION ASKED FROM ANOTHER PAGE (§16 D2′ — "never jumping to the Tracker page first"; core.js
   onBeforeTrackerSwitch): while the Tracker asks "Save them before switching to 142?" and its tab is not the one on screen,
   the Tracker's section shows that question alone — over the page he is on, the rest of the Tracker unseen
   (`.trk-askonly`, tracker.css) — and Escape answers Stay, as on the Tracker's own page. */
const TrkAskOnly = memo(function TrkAskOnly({ active }: { active: boolean }) {
  useSyncExternalStore(core.subscribe, core.getVersion)
  const up = !active && core.switchAsking && !!core.dlg
  useLayoutEffect(() => {
    const el = up ? document.getElementById(PAGE_ID) : null
    if (!el) return
    el.classList.add('trk-askonly')
    /* (a child's layout effect runs before the page's: the cover's lock comes off first, or the focus below would not land) */
    el.querySelector('.trk-host')?.removeAttribute('inert')
    /* the keys into the question, on its safe answer (Stay), so it is answered without a mouse (the design guide §2) */
    document.getElementById('dlgCancel')?.focus()
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape' && core.dlg) { e.preventDefault(); core.dlgClose(false) } }
    document.addEventListener('keydown', esc)
    return () => { el.classList.remove('trk-askonly'); document.removeEventListener('keydown', esc) }
  }, [up])
  /* …AND ON THE TRACKER'S OWN TAB THE QUESTION TAKES THE KEYS TOO (the night of 24 Nov 26, the re-walk's A1 —
     tracker/msq-trk-ask-keys.test.tsx). The pick's and the Logout's question is raised from the top bar, outside the
     Tracker's page: after a pick made by the keys they stayed on the squadron button behind the question, so Enter opened
     the list again over it and its answers were sixteen Tabs away. The same step as above, on the same safe answer; and
     once it is answered the keys go back to the button that raised it, where they were — if they are nowhere, or still
     in the question as it goes (ui/sheetfocus.ts keysBack), never taken from where he has put them since. */
  const here = active && core.switchAsking && !!core.dlg
  useLayoutEffect(() => {
    if (!here) return
    const was = document.activeElement as HTMLElement | null
    document.getElementById('dlgCancel')?.focus()
    return () => keysBack(() => (was && was !== document.body ? was : null), document.getElementById('dlgModal'))
  }, [here])
  return null
})

/* THE BAND ACROSS THE CHART EDITOR WHEN HIS SQUADRON CHANGES UNDER IT (the reshape plan §3.2 A-iv "Typed work at the swap";
   his D2243 Q7, "as drawn" — docs/mock/2026-11-20-multi-sqn-reshape/page.html §7, pictures q7c-d and q7c-p, D1478).
   At his move's midnight the schedule and the Leave War move to his new squadron, and the Tracker follows them unless
   chart work is open (his D2395 — core.js followUnit): the door then stays until that work is gone, the gate's 7f refusing
   his changes to it. So while "Edit chart layout" is open on a Tracker that is no longer his page's own squadron, one band stands
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
    <MoveBandView band={band} testid="trk-move-band" onClose={() => { if (core.arrangeMode) core.toggleArrange() }} />,
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
  const cover = useCover()
  /* WHILE THE TRACKER ASKS ITS QUESTION OVER ANOTHER PAGE the cover steps aside, or the question stands inside a hidden,
     locked host at no size and every later pick waits on it unseen (the walk of 24 Nov 26, F2; Fable F2). `.trk-askonly`
     still shows nothing of the Tracker but the question. */
  const asking = useSyncExternalStore(core.subscribe, () => core.switchAsking && !!core.dlg, () => false)
  const covered = !!cover && !asking
  const host = useRef<HTMLDivElement>(null)
  const bandRef = useRef<HTMLDivElement>(null)
  /* the host locked while covered (above): no press, no focus — set on the node, the cover's one switch */
  useLayoutEffect(() => {
    const h = host.current
    if (!h) return
    if (covered) h.setAttribute('inert', ''); else h.removeAttribute('inert')
  }, [covered])
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
      /* …and, after a pick, the cover's band above the Tracker's column (above): the column ends at the screen's foot */
      const band = bandRef.current ? bandRef.current.getBoundingClientRect().height : 0
      if (el) el.style.setProperty('--tr-top', Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY + band)) + 'px')
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
    /* the cover coming or going changes the band above the column — measured again, and the board refitted to a box it
       may only now have (a hidden Tracker shown again) */
  }, [active, cover])
  return (
    <>
      {cover ? <div ref={bandRef} className="trk-cover-band"><MoveBandView band={cover} testid="trk-cover-band" /></div> : null}
      <div ref={host} className={'trk-host' + (covered ? ' trk-gone' : '')} data-testid="trk-host">
        <TrBody active={active} locked={!!cover} />
      </div>
      <TrkMoveBand />
      <TrkAskOnly active={active} />
    </>
  )
}
