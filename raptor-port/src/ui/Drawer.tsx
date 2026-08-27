/* The mobile drawer — burger menu, page nav (admin-gated Edit tab), view-as
   chips, week chips and logout, markup 1:1 with the reference. Open/close is
   the DRAWER flag in pops.ts; every action closes the drawer, as the
   reference's handlers all end with classList.remove('open'). */
import { PEOPLE } from '../engine/people'
import { SESSION, ME, setMe, canToggleRole } from '../state/auth'
import { CURPAGE } from '../state/view'
import { notify, setPage, resetSession, toggleRole } from '../state/store'
import { DRAWER, setDrawer, setWeekCal, setInsights } from './pops'
import { useVersion } from './useStore'

export function Drawer() {
  useVersion()
  const admin = SESSION && SESSION.role === 'admin'
  const items: [string, string, boolean][] = [
    ['editsched', 'Edit Schedule', !!admin], ['viewsched', 'View-only Sched', true],
    ['inputs', 'Inputs', true], ['quals', 'Quals', true], ['logic', 'Logic', true],
    ['leavewar', 'Leave War', true],
    /* Help for everyone (owner, 25 Aug 26), then Admin last, always
       (owner, 23 Aug 26) — same order as the topnav */
    ['help', 'Help', true],
    ['admin', 'Admin', !!admin],
  ]
  const close = () => { setDrawer(false); notify() }
  const people = Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived)
    .sort((a, b) => PEOPLE[a].cs.localeCompare(PEOPLE[b].cs))
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
              onClick={go} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go() } }}>{label}</a>
          })}
        </nav>
        <h4>View as</h4>
        <div className="drawer-row" id="drawerViewAs">
          {people.map(id => <button key={id} className={'fchip' + (id === ME ? ' on' : '')} data-va={id}
            onClick={() => { setMe(id); setDrawer(false); notify() }}>{PEOPLE[id].cs}</button>)}
        </div>
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
        <div className="drawer-row"><button className="abtn" id="drawerLogout"
          onClick={() => { setDrawer(false); resetSession(null); notify() }}>Logout</button>
          {/* the phone home of the admin's role toggle (owner, 27 Aug 26) —
              the topbar badge is hidden on the tight phone bar, so the
              switch lives here; same LOGINROLE gate, so a member account
              never sees it (toggleRole itself refuses too — the button is
              convenience, the gate is in store/auth). */}
          {canToggleRole() && <button className="abtn" id="drawerRole"
            onClick={() => { setDrawer(false); toggleRole() }}>
            {admin ? 'View as member' : 'Back to admin'}</button>}</div>
      </div>
    </div>
  )
}
