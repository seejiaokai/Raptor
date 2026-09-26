/* The mobile drawer — burger menu, page nav (admin-gated Edit tab), week chips,
   the account and logout, markup 1:1 with the reference. The View-as chips and the
   admin's role toggle are GONE ([ACCOUNTS], D166 (3), 26 Sep 26): signing in makes you
   your own callsign, and the Account row names him. Open/close is
   the DRAWER flag in pops.ts; every action closes the drawer, as the
   reference's handlers all end with classList.remove('open'). */
import { useEffect } from 'react'
import { PEOPLE } from '../engine/people'
import { isAdmin, me, mayViewAsMember } from '../state/perms'
import { waitingCount } from '../state/accounts'
import { CURPAGE } from '../state/view'
import { notify, setPage, switchRoleView } from '../state/store'
import { logOut } from './logout'
import { DRAWER, setDrawer, setWeekCal, setInsights } from './pops'
import { useVersion } from './useStore'

export function Drawer() {
  useVersion()
  const admin = isAdmin()
  const mine = me()
  const mineCs = mine && PEOPLE[mine] ? PEOPLE[mine].cs : ''
  const waiting = admin ? waitingCount() : 0
  const items: [string, string, boolean][] = [
    ['editsched', 'Edit Schedule', !!admin], ['viewsched', 'View-only Sched', true],
    ['inputs', 'Inputs', true], ['quals', 'Quals', true], ['logic', 'Logic', true],
    ['leavewar', 'Leave War', true],
    ['tracker', 'Tracker', true],
    /* Help for everyone (owner, 25 Aug 26), then Admin last, always
       (owner, 23 Aug 26) — same order as the topnav */
    ['help', 'Help', true],
    ['admin', 'Admin', !!admin],
  ]
  const close = () => { setDrawer(false); notify() }
  /* THE PAGE BEHIND THE DRAWER DOES NOT SCROLL (owner's iPhone, 6 Sep 26 — "I
     should not be able to slide scroll when I'm on this page with a page
     behind me … sometimes instead of scrolling the side bar, it scrolls the
     page behind it as well"). The same two holes the board had (SchedBoard.tsx,
     11 Aug 26): the panel is the drawer's one scroller and a swipe that reached
     its end CHAINED to the document (closed in CSS — `.drawer-panel` carries
     `overscroll-behavior: contain`, and the scrim `touch-action: none`), and
     the document itself stayed live under the fixed drawer (closed here —
     `body.dw-lock`, `overflow: hidden`, its OWN class rather than the board's
     `sb-lock` because the drawer opens OVER the board (z440 over z400) and
     closing it must not unlock a board that is still open). Scroll position
     captured and put back by hand, the board's reasoning: `overflow:hidden`
     keeps it today, not by guarantee. */
  useEffect(() => {
    if (!DRAWER) return
    const el = document.scrollingElement || document.documentElement
    const y = el.scrollTop, x = el.scrollLeft
    document.body.classList.add('dw-lock')
    return () => {
      document.body.classList.remove('dw-lock')
      el.scrollTop = y; el.scrollLeft = x
    }
  }, [DRAWER])
  return (
    <div className={'drawer' + (DRAWER ? ' open' : '')} id="drawer"
      onClick={e => { if ((e.target as HTMLElement).id === 'drawer') close() }}>
      <div className="drawer-panel">
        <h4>Menu</h4>
        {/* role="button" + tabIndex + Enter/Space, same reason as the topbar nav
            in Shell.tsx (design critique, 15 Aug 26 — a hrefless <a> is not in the
            tab order and has no button role, so a keyboard user could not reach
            these). Tag stays <a> so `#drawerNav a[data-page]` selectors hold. */}
        <nav className="drawer-nav" id="drawerNav">
          {items.filter(i => i[2]).map(([p, label]) => {
            const go = () => { setPage(p); setDrawer(false); notify() }
            return <a key={p} data-page={p} role="button" tabIndex={0} className={p === CURPAGE ? 'on' : ''}
              onClick={go} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go() } }}>{label}{p === 'admin' && waiting > 0 && <span className="navbadge" id="drawerWaitBadge">{waiting}</span>}</a>
          })}
        </nav>
        {/* Week chips became a single calendar opener (owner, 22 Aug 26): the
            phone jumps weeks from the month picker, and steps day-to-day by
            swiping the schedule (continuous across weeks). */}
        <h4>Week</h4>
        <div className="drawer-row" id="drawerWeeks">
          <button className="abtn" id="drawerPickWeek"
            onClick={() => { setDrawer(false); setWeekCal('view'); notify() }}>Pick a date…</button>
          {/* Insights lives here on a phone (owner, 24 Aug 26): the topbar dropped
              its Insights + Logout buttons so the phone bar could be a clean,
              non-scrolling row, and this is where the week-insights modal is
              reached instead. On desktop the topbar button is untouched. */}
          <button className="abtn" id="drawerInsights"
            onClick={() => { setDrawer(false); setInsights(true); notify() }}>Week insights</button>
        </div>
        <h4>Account</h4>
        {/* resetSession (state/store.ts) is the one session-change path — the
            Manage-users modal it used to close here moved onto the Admin PAGE
            (23 Aug 26), which unmounts with the session on its own. */}
        {/* The menu unmounts with the outgoing shell, but its module flag does
            not. Clear it here so a second login in the same tab does not
            reopen the drawer from the previous user's session. */}
        <p className="drawer-acct" id="drawerAcct">Signed in as <b>{mineCs || '—'}</b> · {admin ? 'Admin' : 'Member'}</p>
        {/* D292 (27 Sep 26): on a phone the badge is hidden, so the admin's switch to the member view and back sits
            here, under his name (the approved picture 7c); it closes the menu first, as every drawer action does */}
        {mayViewAsMember() && <div className="drawer-row"><button className="abtn" id="drawerRole"
          onClick={() => { setDrawer(false); switchRoleView() }}>{admin ? 'Switch to the member view' : 'Back to the admin view'}</button></div>}
        <div className="drawer-row"><button className="abtn" id="drawerLogout"
          onClick={() => { setDrawer(false); void logOut() }}>Logout</button></div>
      </div>
    </div>
  )
}
