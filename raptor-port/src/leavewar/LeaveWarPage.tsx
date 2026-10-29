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
import { memo, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Topbar } from './ui/Chrome'
import { Matrix } from './ui/Matrix'
import { WarSheet } from './ui/WarSheet'
import { lwLeft, setLwOnScreen } from './state/screen'
import { focusDay, getState, rawState, subscribe } from './state/store'
import { focusDateOf, memberToday } from './engine'
import { installDayClock } from './ui/dayclock'
import { ApprovalsPage, SlimBar } from './ui/ApprovalsPage'
import { apprMode, lwNavVersion, lwPage, setApprMode, setBalancesUp, subscribeLwNav, takeRingAsk } from './ui/lwnav'
import { BalancesPage } from './ui/BalancesPage'
import { ringCell } from './ui/cellring'

/* The RENDER FIREWALL that makes staying mounted affordable. Every Raptor
   notify re-renders the Shell, and a plain child here would make React
   re-walk the whole ~28k-node grid each time — while the tab is HIDDEN that
   would tax every board keystroke, and on RETURN it made the "instant" show
   cost nearly a first build (measured 1.6s at 1280px). memo with no props
   stops the parent's render at this line; the three children each subscribe
   to the Leave War store themselves (useVersion), and every fact this tab
   renders arrives THROUGH that store — the sync seam mirrors Raptor's
   roster/role/viewer into it with its own notify (sync.ts; the role by resetSession and the admin's member-view switch, switchRoleView — the old toggleRole's successor, D292) — so
   nothing here can go stale behind the firewall. The one Raptor import in
   this UI (RemarksSheet's save) is a write path, not rendered state.
   Re-measured with the memo AND scheduler.css's `.page.doze`
   content-visibility cache: a return commits in ~3ms and paints within two
   frames (~0.1s at 390px, ~0.2s at 1280px) against a ~1s first build. */
/* THE GRID, NEVER RE-WALKED BY THE TAB ROW (M4): the Approvals page takes the grid card's place, and the grid stays mounted
   behind it — its scroll and window of months kept for "Back" — so it is hidden, not unmounted, and this memo keeps a
   switch of tab from re-rendering its ~28k nodes. */
const GridM = memo(Matrix)
/* IS THE LEAVE WAR THE PAGE ON SCREEN? (the fixes' M6 — the Opus read's 3). Set by the page's own activation effect below,
   and cleared there BEFORE it ends the Approvals visit — so the mode change that leaving makes is seen by `Body` as what
   it is: he left the page, not the grid coming back. Without it `Body`'s effect, which runs after the page's cleanup,
   flagged the hidden grid on screen again (a desktop then filled the whole year in the background, on other pages) and
   scrolled the window — the next page's — to the grid's old place. A module flag, not state: nothing re-renders for it. */
let pageOn = false
/* where he was on the GRID (not on the Approvals page) — the page's return lands there when he left from Approvals */
let gridYNow = 0
/* APPROVALS IN THE GRID CARD'S PLACE (the overhaul's M4, 8.1 — D1254, D1420): while its page is up the grid is hidden; with
   the slim bar up (a request's dates tapped) the grid shows and the page waits, kept as he left it. Leaving Approvals ends
   the visit. Coming back to the grid from the page restores where he was on it — the page scroll is the window's (the
   standalone "one vertical scroll" rule) — and kicks the grid's measures, as a return to the tab does. */
/* …AND BALANCES THE SAME WAY (the overhaul's M5a — D1254, D1483): the page in the grid card's place is general now — the
   grid, Approvals' page or the Balances page (ui/lwnav.ts `lwPage`). Each keeps its own page scroll; Balances fills the
   screen under the tab row and scrolls inside itself (its drawing, `full-m5a-balances.mjs`), so it opens at the window's
   top. It is drawn only while up — 50 rows of figures are not kept working behind the grid. */
function Body() {
  const mode = useSyncExternalStore(subscribeLwNav, apprMode, apprMode)
  const page = useSyncExternalStore(subscribeLwNav, lwPage, lwPage)
  useSyncExternalStore(subscribeLwNav, lwNavVersion, lwNavVersion)
  const apprY = useRef(0), was = useRef(page)
  useEffect(() => {
    const from = was.current
    was.current = page
    /* Approvals left from its slim bar (the grid already up): the visit is over, its place forgotten */
    if (from === page) { if (mode === 'off') apprY.current = 0; return }
    /* he left the Leave War (another page, the bell): the visit is over and the page's own cleanup has already flagged the
       grid off screen — nothing of the grid's is touched, and no other page's scroll (M6) */
    if (!pageOn) { if (mode === 'off') apprY.current = 0; return }
    /* a hidden grid fills nothing in the background (state/screen.ts — the same flag a hidden tab sets) */
    setLwOnScreen(page === 'grid')
    if (page === 'approvals') { window.scrollTo(0, apprY.current); return }
    if (page === 'balances') { window.scrollTo(0, 0); return }
    /* back on the grid: where he was on it */
    window.scrollTo(0, gridYNow); window.dispatchEvent(new Event('resize'))
    if (mode === 'off') apprY.current = 0
  }, [page, mode])
  useEffect(() => {
    /* only while the Leave War is the page on screen — the window's scroll is every page's (M6) */
    const on = () => {
      if (!pageOn) return
      const p = lwPage()
      if (p === 'approvals') apprY.current = window.scrollY
      else if (p === 'grid') gridYNow = window.scrollY
    }
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <>
      <div className="lw-gridhost" hidden={page !== 'grid'}>
        {/* the grid's own bar now stands on the grid card (Matrix renders StageBar — D1254) */}
        <GridM />
      </div>
      {mode !== 'off' && <ApprovalsPage shown={mode === 'page'} />}
      {mode === 'bar' && <SlimBar />}
      {page === 'balances' && <BalancesPage />}
    </>
  )
}
const LwFull = memo(function LwFull() {
  return (
    <>
      <Topbar />
      <Body />
    </>
  )
})

/* NO LEAVE PERIOD YET ([DB-READINESS] group A, phase 5). A shared store starts with no leave war — nothing demo reaches
   it (src/bootpolicy.ts) — and an admin creates the first; a started store is read as it stands. Until one exists
   there is no grid to draw, so the page says so: an admin gets the way in (the New-war sheet the picker's "+ New"
   opens), a member is told who makes it. The firewall above still holds: this subscribes to ONE fact — whether any
   war exists — so the grid's own renders never re-run it, and it re-renders only when that flips. */
const hasNoWar = () => rawState().wars.length === 0
function NoWar() {
  const [making, setMaking] = useState(false)
  const admin = useSyncExternalStore(subscribe, () => getState().role === 'admin')
  return (
    <div className="lw-empty" data-testid="lw-empty" role="status">
      <h2>No leave period yet</h2>
      {admin ? (
        <>
          <p>Create the first leave period — its name and dates. Nothing in it is open for bidding until you open dates.</p>
          <button className="lw-first" data-testid="lw-first-war" onClick={() => setMaking(true)}>Create the first period</button>
        </>
      ) : (
        <p>An admin creates the leave period. It shows here as soon as it is made.</p>
      )}
      {making && <WarSheet onClose={() => setMaking(false)} />}
    </div>
  )
}
const LwBody = memo(function LwBody() {
  const empty = useSyncExternalStore(subscribe, hasNoWar)
  return empty ? <NoWar /> : <LwFull />
})

export function LeaveWarPage({ active = true }: { active?: boolean }) {
  const savedY = useRef(0)
  /* Has the tab landed on its default view yet? The FIRST time it comes on
     screen we snap the grid to the first open date from today, else today (D1177's reading — once the start of the
     war's bidding window, owner 7 Sep 26); which war that is was already decided at boot by the same rule (store
     `landingOf`). Once only — a later return to the
     tab restores where the reader actually was (the DOM never went away and
     `savedY` holds the page scroll), so re-landing would yank them off it. A
     hidden pre-warm mount never runs this, because the effect returns early
     while `active` is false. */
  const landedRef = useRef(false)
  /* today moves at midnight with the page left open (D1266) — one clock for the page's life, mounted or merely kept */
  useEffect(() => installDayClock(), [])
  useEffect(() => {
    if (!active) return
    pageOn = true
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
    /* The default landing, once. AFTER the resize kick, so the jump reads a
       freshly measured grid (the frozen columns and the strip re-measure on
       that event). `focusDay` bumps the store's focus, which the Matrix turns
       into a jump — the same proven path the under-manned list uses — so it
       both draws the target months (the preload the owner asked for) and
       scrolls to them. For the seeded war the window opens in January, so this
       lands where the grid already sits and moves nothing; it earns its keep
       when the bidding window starts later in the year. */
    /* a day asked for from outside the page (the bell's Leave War line — M4 9.6) lands INSTEAD of the first-visit
       landing, which must not override it */
    const ring = takeRingAsk()
    if (ring && !hasNoWar()) { landedRef.current = true; ringCell(ring.personId, ring.date) }
    else if (!landedRef.current) {
      landedRef.current = true
      /* no war yet (the page's empty state) has no day to land on */
      if (!hasNoWar()) focusDay(focusDateOf(getState().period, memberToday()))
    }
    /* Track the spot continuously rather than reading scrollY on the way
       out: by the time a leave-effect runs the section is already hidden,
       the page is shorter, and the browser has clamped the scroll. */
    const onScroll = () => { savedY.current = window.scrollY }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      /* off the page FIRST, so the mode change below is read as leaving (M6) — and, left from the Approvals page, the next
         return lands on the grid where he was on it, not at the page's scroll */
      pageOn = false
      if (lwPage() !== 'grid') savedY.current = gridYNow
      /* another page: he has left Approvals (M4 8.3 — the visit ends), and the Balances page with it (M5a) — the next
         return lands on the grid */
      setApprMode('off')
      setBalancesUp(false)
      /* Off screen now: BEFORE the resize kick, so the Matrix sees the flag
         false and shrinks its drawn window back to a few months around the
         current view. That is what keeps the NEXT return cheap — the browser
         re-styles a small grid on reveal, not the whole year (owner, 5 Sep 26).
         The fill rebuilds the year again once the tab is shown. */
      lwLeft()
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
