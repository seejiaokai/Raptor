/* The mobile drawer — burger menu, page nav (admin-gated Edit tab), view-as
   chips, week chips and logout, markup 1:1 with the reference. Open/close is
   the DRAWER flag in pops.ts; every action closes the drawer, as the
   reference's handlers all end with classList.remove('open'). */
import { PEOPLE } from '../engine/people'
import { WEEKS, CURWEEK } from '../engine/waves'
import { SESSION, ME, setMe } from '../state/auth'
import { CURPAGE } from '../state/view'
import { notify, setPage, resetSession } from '../state/store'
import { DRAWER, setDrawer, setUserModal } from './pops'
import { useVersion } from './useStore'

export function Drawer() {
  useVersion()
  const admin = SESSION && SESSION.role === 'admin'
  const items: [string, string, boolean][] = [
    ['editsched', 'Edit Schedule', !!admin], ['viewsched', 'View-only Sched', true],
    ['inputs', 'Inputs', true], ['quals', 'Quals', true], ['logic', 'Logic', true],
    ['leavewar', 'Leave War', true],
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
        <h4>Week</h4>
        <div className="drawer-row" id="drawerWeeks">
          {WEEKS.map((w: any) => <button key={w.v} className={'wk' + (w.v === CURWEEK ? ' on' : '')} data-wk={w.v}>{w.lbl}</button>)}
        </div>
        <h4>Account</h4>
        {/* resetSession (state/store.ts) is the one session-change path — see Shell.tsx's
            logout button for why setUserModal(false) still has to happen here, at the
            call site, rather than inside resetSession itself. */}
        {/* The menu unmounts with the outgoing shell, but its module flag does
            not. Clear it here so a second login in the same tab does not
            reopen the drawer from the previous user's session. */}
        <div className="drawer-row"><button className="abtn" id="drawerLogout"
          onClick={() => { setDrawer(false); setUserModal(false); resetSession(null); notify() }}>Logout</button></div>
      </div>
    </div>
  )
}
