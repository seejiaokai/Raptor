/* The Admin page — the seventh tab, always last (owner, 23 Aug 26). The
   admin-only tools that used to be scattered as topbar buttons and modal
   pencils gather on a page of their own: Manage users moved here whole from
   the old #userModal, and the two template editors get front-door openers
   beside the picker pencils that already reach them. The NAV hides the tab
   from a member, but the PAGE is the gate, not the nav (the 6 Aug lesson —
   role checks live at the page and the write path): a member forced onto
   this page by URL-less state poking gets #admDeny, and the write handlers
   below still check canEditSched() themselves, so neither guard trusts the
   other. */
import { useRef } from 'react'
import { SESSION, canEditSched } from '../state/auth'
import { USERS, addUser, delUser } from '../state/users'
import { esc } from '../state/view'
import { notify } from '../state/store'
import { HOOKS } from '../engine/hooks'
import { setTplEdit, setDayTplEdit } from './pops'
import { useVersion } from './useStore'

export function AdminPage() {
  useVersion()
  const nameRef = useRef<HTMLInputElement>(null)
  const roleRef = useRef<HTMLSelectElement>(null)
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
  return (
    <div className="adm-inner">
      <h2>Admin</h2>
      <div className="adm-grid">
        {/* ---- Manage users — the reference's userModal body verbatim
            (ids, classes and mutations unchanged so the tests port);
            prototype-only, no server ---- */}
        <div className="adm-sec" id="admUsers">
          <h3>Manage users</h3>
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
        </div>
        {/* ---- Squadron configuration — front doors to the two template
            editors. The modals are App-level siblings (App.tsx), so they
            paint over this page exactly as they do over any other; these
            buttons just set the same pops.ts flags the picker pencils set. ---- */}
        <div className="adm-sec" id="admConfig">
          <h3>Squadron configuration</h3>
          <button className="abtn" id="admDutyTpl" onClick={() => { setTplEdit(true); notify() }}>Duty templates…</button>
          <p className="adm-note">A duty template is a saved duty block — its rows and times — that "+ Block" copies onto any day as a plain, conflict-checked desk.</p>
          <button className="abtn" id="admDayTpl" onClick={() => { setDayTplEdit(true); notify() }}>Day templates…</button>
          <p className="adm-note">A day template is a whole captured day — waves, duties, sims and ground rows — recaptured off a real day and re-applied from the day-templates picker.</p>
        </div>
      </div>
      {/* ---- Data & persistence — the honesty card. This page is where the
          real controls land when the shared database arrives; until then the
          truth is stated rather than implied. ---- */}
      <div className="adm-sec" id="admData">
        <h3>Data &amp; persistence</h3>
        <p className="adm-note">Everything typed into this prototype is session-only — the schedule, quals, inputs and the Leave War alike are forgotten on reload and never leave this browser. A shared database for the squadron is the planned next step, and this page is where its controls will live.</p>
      </div>
    </div>
  )
}
