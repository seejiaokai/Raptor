/* The Admin page — the seventh tab, always last (owner, 23 Aug 26; laid out as
   a settings console 25 Aug 26). The admin-only tools that used to be scattered
   as topbar buttons and modal pencils gather on a page of their own: Manage
   users moved here whole from the old #userModal, and the two template editors
   get front-door openers beside the picker pencils that already reach them.

   The LAYOUT is a category rail on the left and one content pane on the right,
   the way a settings screen reads (owner, 25 Aug 26 — "the smaller left side has
   the categories and the right side is the pages for settings"). On a wide
   screen the rail and pane sit side by side; on a phone the rail IS the screen
   and tapping a category drills into its pane with a back arrow, which is how a
   two-pane settings layout survives a narrow phone. More categories are one
   entry in CATS each — the owner is filling this in over time.

   The NAV hides the tab from a member, but the PAGE is the gate, not the nav
   (the 6 Aug lesson — role checks live at the page and the write path): a member
   forced onto this page by URL-less state poking gets #admDeny, and the write
   handlers below still check canEditSched() themselves, so neither guard trusts
   the other. Every category panel stays mounted (only the active one shows), so
   the template openers and the user tools keep their stable ids wherever the
   rail happens to be pointing. */
import { useRef, useState } from 'react'
import { SESSION, canEditSched } from '../state/auth'
import { USERS, addUser, delUser } from '../state/users'
import { esc } from '../state/view'
import { notify } from '../state/store'
import { HOOKS } from '../engine/hooks'
import { setTplEdit, setDayTplEdit } from './pops'
import { clearHistoryBefore } from './inputedit'
import { useVersion } from './useStore'
import { UsersIcon, SlidersIcon, DatabaseIcon } from './icons'

/* The rail is data-driven so a new settings category is one row here plus its
   panel below — nothing else in the layout moves. */
const CATS = [
  { id: 'users', label: 'Users', sub: 'Who can sign in', icon: <UsersIcon /> },
  { id: 'config', label: 'Squadron config', sub: 'Duty & day templates', icon: <SlidersIcon /> },
  { id: 'data', label: 'Data', sub: 'Storage & the shared database', icon: <DatabaseIcon /> },
]

export function AdminPage() {
  useVersion()
  const nameRef = useRef<HTMLInputElement>(null)
  const roleRef = useRef<HTMLSelectElement>(null)
  /* which category the pane shows; `drilled` only matters on a phone, where the
     rail and pane share the screen — it flips from the list to the detail */
  const [cat, setCat] = useState('users')
  const [drilled, setDrilled] = useState(false)
  /* the Data panel's clear-old-data control: the chosen cutoff, and the armed
     count (-1 = not armed; >=0 = first tap done, showing what a second tap
     clears). Kept here, not in the store — it is chrome, like `drilled`. */
  const [wipeIso, setWipeIso] = useState('')
  const [armed, setArmed] = useState(-1)
  const admin = SESSION && SESSION.role === 'admin'
  /* the forced-member render — this is what makes the page gate non-vacuous:
     the nav already hides the tab, so the only way here as a member is state
     poking, and the answer is a message, never the tools */
  if (!admin) return <div className="adm-deny" id="admDeny">Admin tools are for schedulers. Ask an admin to change users or templates.</div>
  const add = () => {
    if (!canEditSched()) return
    const name = nameRef.current!.value.trim(), role = roleRef.current!.value
    /* a silent no-op reads as a broken button (audit, 12 Aug 26): pressing Add
       with an empty box did nothing at all and said nothing about why */
    if (!name) return HOOKS.toast('A user needs a name')
    addUser(name, role); nameRef.current!.value = ''; notify()
  }
  /* first tap: dry-count and arm; second tap: clear, report, disarm. A zero
     count never arms — the button says so instead of offering a no-op
     confirm (a silent no-op reads as a broken button, the same audit rule
     as Add above). */
  const wipe = () => {
    if (!canEditSched() || !wipeIso) return
    if (armed < 0) {
      const n = clearHistoryBefore(wipeIso, true)
      if (!n) return HOOKS.toast('Nothing on file from before that date')
      setArmed(n)
      return
    }
    const n = clearHistoryBefore(wipeIso)
    setArmed(-1)
    HOOKS.toast(n ? `Cleared ${n} old record${n === 1 ? '' : 's'}` : 'Nothing on file from before that date')
  }
  const open = (id: string) => { setCat(id); setDrilled(true) }
  const active = CATS.find(c => c.id === cat) || CATS[0]
  return (
    <div className="adm-inner">
      <div className={'adm-shell' + (drilled ? ' drilled' : '')}>
        {/* ---- the category rail: the page's index, and the whole screen on a
            phone until a category is tapped ---- */}
        <nav className="adm-rail" aria-label="Admin categories">
          <h2>Admin</h2>
          {CATS.map(c => (
            <button key={c.id} type="button" className={'adm-cat' + (c.id === cat ? ' on' : '')}
              aria-current={c.id === cat ? 'page' : undefined} onClick={() => open(c.id)}>
              <span className="adm-cat-ic">{c.icon}</span>
              <span className="adm-cat-tx">
                <span className="adm-cat-l">{c.label}</span>
                <span className="adm-cat-s">{c.sub}</span>
              </span>
              <span className="adm-cat-chev" aria-hidden="true">›</span>
            </button>
          ))}
        </nav>
        {/* ---- the content pane: the active category's page. The back arrow is
            phone-only (the rail is always in view on a wide screen) ---- */}
        <div className="adm-pane">
          <div className="adm-pane-head">
            <button type="button" className="adm-back" onClick={() => setDrilled(false)} aria-label="Back to categories">‹</button>
            <h3>{active.label}</h3>
          </div>
          <div className="adm-pane-body">
            {/* ---- Manage users — the reference's userModal body verbatim
                (ids, classes and mutations unchanged so the tests port);
                prototype-only, no server ---- */}
            <section className={'adm-panel' + (cat === 'users' ? ' on' : '')} id="admUsers">
              <div className="mfield"><label>Callsign / name</label><input id="newName" ref={nameRef} placeholder="e.g. Viper" maxLength={24} /></div>
              <div className="mfield"><label>Role</label><select id="newRole" ref={roleRef} aria-label="Role for the new user"><option value="main">Squadron member (own inputs &amp; quals)</option><option value="admin">Scheduler / admin (edit)</option></select></div>
              <button className="abtn primary" id="userAdd" style={{ width: '100%' }} onClick={add}>Add user</button>
              <div className="userlist" id="userList" dangerouslySetInnerHTML={{
                __html: USERS.map((u: any, i: number) =>
                  `<div class="urow"><span>${esc(u.name)}</span><span class="ub ${u.role}">${u.role === 'admin' ? 'Admin' : 'Member'}</span>
      <button class="abtn" data-deluser="${i}" style="padding:2px 8px">Remove</button></div>`).join('')
              }} onClick={e => {
                if (!canEditSched()) return
                const d = (e.target as HTMLElement).closest('[data-deluser]') as HTMLElement | null
                if (d) { delUser(+d.dataset.deluser!); notify() }
              }} />
              <p className="adm-note">This list drives the demo login only — there is no server behind it yet, so a user added here lasts for this browser session.</p>
            </section>
            {/* ---- Squadron configuration — front doors to the two template
                editors. The modals are App-level siblings (App.tsx), so they
                paint over this page exactly as they do over any other; these
                buttons just set the same pops.ts flags the picker pencils set. ---- */}
            <section className={'adm-panel' + (cat === 'config' ? ' on' : '')} id="admConfig">
              <button className="abtn" id="admDutyTpl" onClick={() => { setTplEdit(true); notify() }}>Duty templates…</button>
              <p className="adm-note">A duty template is a saved duty block — its rows and times — that "+ Block" copies onto any day as a plain, conflict-checked desk.</p>
              <button className="abtn" id="admDayTpl" onClick={() => { setDayTplEdit(true); notify() }}>Day templates…</button>
              <p className="adm-note">A day template is a whole captured day — waves, duties, sims and ground rows — recaptured off a real day and re-applied from the day-templates picker.</p>
            </section>
            {/* ---- Data & persistence — the honesty card. This page is where the
                real controls land when the shared database arrives; until then the
                truth is stated rather than implied. ---- */}
            <section className={'adm-panel' + (cat === 'data' ? ' on' : '')} id="admData">
              {/* Clear old data (owner, 25 Aug 26 — "clear a set date of history
                  data. Wipe it clean so that the app stays snappy"). Two-tap
                  confirm: the first tap counts what would go (dry run of the
                  same selection the wipe uses) and arms the button with that
                  number; the second tap acts. Changing the date disarms. The
                  inputs/pucks/titles part is one undo step; the remembered
                  past weeks are not, and the note says so up front. */}
              <div className="mfield"><label>Clear data older than</label><input type="date" id="admWipeDate" value={wipeIso} onChange={e => { setWipeIso(e.target.value); setArmed(-1) }} /></div>
              <button className={'abtn' + (armed >= 0 ? ' danger' : '')} id="admWipe" style={{ width: '100%' }} onClick={wipe}
                disabled={!wipeIso}>{armed >= 0 ? `Tap again to clear ${armed} old record${armed === 1 ? '' : 's'}` : 'Clear old data…'}</button>
              <p className="adm-note">Removes personal inputs, calendar pucks and day titles wholly before that date, and the app's memory of edits to weeks that ended before it. Inputs, pucks and titles come back with Undo — except leave that came from the Leave War tab, which is withdrawn from the war for real, the same as deleting it by hand. The past-week memory does not come back either. Anything touching or crossing the chosen date is kept whole.</p>
              <p className="adm-note">Everything typed into this prototype is session-only — the schedule, quals, inputs and the Leave War alike are forgotten on reload and never leave this browser. A shared database for the squadron is the planned next step, and this page is where its controls will live.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
