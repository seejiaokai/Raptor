/* The mobile drawer — burger menu, page nav (admin-gated Edit tab), view-as
   chips, week chips and logout, markup 1:1 with the reference. Open/close is
   the DRAWER flag in pops.ts; every action closes the drawer, as the
   reference's handlers all end with classList.remove('open'). */
import { PEOPLE } from '../engine/people'
import { WEEKS, CURWEEK } from '../engine/waves'
import { SESSION, ME, setMe, setSession } from '../state/auth'
import { setBoardDay } from '../state/view'
import { notify, setPage } from '../state/store'
import { DRAWER, setDrawer } from './pops'
import { useVersion } from './useStore'

export function Drawer({ page, onNav }: { page: string, onNav: (p: string) => void }) {
  useVersion()
  const admin = SESSION && SESSION.role === 'admin'
  const items: [string, string, boolean][] = [
    ['editsched', 'Edit Schedule', !!admin], ['viewsched', 'View-only Sched', true],
    ['inputs', 'Inputs', true], ['quals', 'Quals', true], ['logic', 'Logic', true],
  ]
  const close = () => { setDrawer(false); notify() }
  const people = Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived)
    .sort((a, b) => PEOPLE[a].cs.localeCompare(PEOPLE[b].cs))
  return (
    <div className={'drawer' + (DRAWER ? ' open' : '')} id="drawer"
      onClick={e => { if ((e.target as HTMLElement).id === 'drawer') close() }}>
      <div className="drawer-panel">
        <h4>Menu</h4>
        <nav className="drawer-nav" id="drawerNav">
          {items.filter(i => i[2]).map(([p, label]) =>
            <a key={p} data-page={p} className={p === page ? 'on' : ''}
              onClick={() => { onNav(p); setPage(p); setDrawer(false); notify() }}>{label}</a>)}
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
        <div className="drawer-row"><button className="abtn" id="drawerLogout"
          onClick={() => { setBoardDay(null); setSession(null); notify() }}>Logout</button></div>
      </div>
    </div>
  )
}
