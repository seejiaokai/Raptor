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
import { setTplEdit, setDayTplEdit, setWaveEdit } from './pops'
import { kindLabel } from '../engine/wavetpl'
import { secDefault, moveSecDefault, secDefaultSave, secDefaultReset, waveDefault, waveDefaultView, moveWaveDefault, waveDefaultSave, waveDefaultReset } from '../engine'
import { clearHistoryData, clearEditHistory, type ClearMode } from './inputedit'
import { useVersion } from './useStore'
import { UsersIcon, SlidersIcon, DatabaseIcon } from './icons'

/* The rail is data-driven so a new settings category is one row here plus its
   panel below — nothing else in the layout moves. */
const CATS = [
  { id: 'users', label: 'Users', sub: 'Who can sign in', icon: <UsersIcon /> },
  { id: 'config', label: 'Squadron config', sub: 'Duty, day & wave templates', icon: <SlidersIcon /> },
  { id: 'data', label: 'Data', sub: 'Storage & cleanup', icon: <DatabaseIcon /> },
]

/* ---- One clearing control (owner, 25 Aug 26 — "There should be an option
   for data range selected, specific date and option for anything older than
   this date"): the period grammar, the date fields it needs, and the two-tap
   confirm, shared by the two sweeps on the Data panel so their behaviour
   cannot drift. `run` is the gated funnel in inputedit.tsx — the control
   itself never touches data, it only asks (dry) and then asks for real.
   First tap: dry-count and arm the button with the number; second tap: act.
   Changing the period or any date DISARMS — an armed count must always be
   the count the second tap clears. A zero count never arms: the toast says
   so instead of offering a no-op confirm (a silent no-op reads as a broken
   button — the 12 Aug 26 audit rule). State is chrome, like `drilled`. */
function ClearControl(props: {
  idp: string; act: string; note: string; zero: string; unit: [string, string]
  run: (mode: ClearMode, a: string, b: string, dry?: boolean) => number
}) {
  const [mode, setMode] = useState<ClearMode>('before')
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [armed, setArmed] = useState(-1)
  const ready = !!a && (mode !== 'range' || !!b)
  const go = () => {
    if (!canEditSched() || !ready) return
    if (armed < 0) {
      const n = props.run(mode, a, b, true)
      if (!n) return HOOKS.toast(props.zero)
      setArmed(n)
      return
    }
    const n = props.run(mode, a, b)
    setArmed(-1)
    HOOKS.toast(n ? `Cleared ${n} ${n === 1 ? props.unit[0] : props.unit[1]}` : props.zero)
  }
  const date = (lbl: string, v: string, set: (x: string) => void, id: string) => (
    <div className="mfield"><label>{lbl}</label>
      <input type="date" id={id} value={v} onChange={e => { set(e.target.value); setArmed(-1) }} /></div>
  )
  return (<div className="adm-clear">
    <div className="mfield"><label>Period</label>
      <select id={props.idp + 'Mode'} value={mode} aria-label="Which period to clear"
        onChange={e => { setMode(e.target.value as ClearMode); setArmed(-1) }}>
        <option value="before">Anything older than a date</option>
        <option value="on">A specific date</option>
        <option value="range">A date range</option>
      </select></div>
    {mode === 'range'
      ? <div className="adm-2col">
          {date('From', a, setA, props.idp + 'Date')}
          {date('To', b, setB, props.idp + 'Date2')}
        </div>
      : date(mode === 'before' ? 'Older than' : 'Date', a, setA, props.idp + 'Date')}
    <button className={'abtn' + (armed >= 0 ? ' danger' : '')} id={props.idp} style={{ width: '100%' }}
      onClick={go} disabled={!ready}>
      {armed >= 0 ? `Tap again to clear ${armed} ${armed === 1 ? props.unit[0] : props.unit[1]}` : props.act}
    </button>
    <p className="adm-note">{props.note}</p>
  </div>)
}

/* The "Show / hide each + Wave entry" list used to live here (owner, 25 Aug 26).
   It moved to the + Wave menu on 29 Aug 26 pt.3, and on 30 Aug 26 folded into the
   one Flying-waves sheet (ui/WaveTplModal.tsx) — editing a wave and showing/hiding/
   deleting it now happen in the single sheet, opened where a wave is added and from
   the button below. Same admin-only gate either way (canEditSched === admin). */

/* THE DEFAULT ARRANGEMENT (owner, 29 Aug 26 pt.2 — "allow the default arrangement
   of a schedule to be configured in admin … even to the arrangement of the waves
   under display"). Two ordered lists an admin sets ONCE:
   • Section order — the house order the five schedule blocks show in on Edit
     Schedule and the Scheduler Board (engine/order.ts secDefault → secOrder). A day
     someone has arranged by hand keeps its own order; every other day follows this.
     Pure display — it moves no data and cannot touch the rules.
   • Flying-wave order — the house order NEW waves are placed in (engine/reorder.ts
     waveDefault → board.ts addWave), applied only as a wave is added to a schedule
     that has not been signed off, so a fresh week builds up SC-on-top (or whatever
     the admin chose). It never re-orders a planned day and never touches a signed
     -off one. Off by default: with no order set, a new wave is added at the bottom,
     exactly as before.
   Same ▲▼ nudge idiom as the per-day Arrange sheet, reusing its .arrsec and .tnudge
   styles. Each nudge persists at once (secDefaultSave / waveDefaultSave). */
const ADEF_SEC_LABEL: Record<string, string> = {
  notes: 'Overall notes', prog: 'Common Programme', waves: 'Flying waves', duty: 'Duties', sims: 'Sims', ground: 'Ground Programme',
  inputs: 'Personal Inputs', avail: 'Available crew', sans: 'SANS availability', unav: 'Unavailable',
}
function ArrangeDefaults() {
  const sec = secDefault()
  const wav = waveDefaultView()
  const waveOn = waveDefault().length > 0
  const nudgeSec = (key: string, dir: number) => { if (!canEditSched()) return; if (moveSecDefault(key, dir)) { secDefaultSave(); notify() } }
  const nudgeWav = (key: string, dir: number) => { if (!canEditSched()) return; if (moveWaveDefault(key, dir)) { waveDefaultSave(); notify() } }
  const resetSec = () => { if (!canEditSched()) return; secDefaultReset(); secDefaultSave(); notify() }
  const resetWav = () => { if (!canEditSched()) return; waveDefaultReset(); waveDefaultSave(); notify() }
  const row = (key: string, i: number, len: number, label: string, up: () => void, down: () => void) => (
    <div className="arrsec-row" key={key} data-adefrow={key}>
      <span className="grip">
        <button className="tnudge" aria-label={`Move ${label} up`} disabled={i === 0} onClick={up}>▲</button>
        <button className="tnudge" aria-label={`Move ${label} down`} disabled={i === len - 1} onClick={down}>▼</button>
      </span>
      <span className="arrsec-name">{label}</span>
      <span className="arrsec-pos">{i + 1}</span>
    </div>
  )
  return (
    <div className="adm-arrdef">
      <div className="arrsec-subh">Section order</div>
      <div className="arrsec-list" id="admSecDefault">
        {sec.map((key, i) => row(key, i, sec.length, ADEF_SEC_LABEL[key] || key,
          () => nudgeSec(key, -1), () => nudgeSec(key, 1)))}
      </div>
      <p className="adm-note">The order the day’s panels show in. The schedule sections apply on both Edit Schedule and the Scheduler Board; the crew lists (Personal Inputs, Available crew, SANS, Unavailable) reorder on the Scheduler Board only. A day arranged on its own keeps its own order.</p>
      <button className="abtn" id="admSecDefReset" onClick={resetSec} style={{ marginTop: 2 }}>Reset to standard order</button>
      <div className="arrsec-subh" style={{ marginTop: 16 }}>Flying-wave order</div>
      <div className="arrsec-list" id="admWaveDefault">
        {wav.map((key, i) => row(key, i, wav.length, kindLabel(key as any),
          () => nudgeWav(key, -1), () => nudgeWav(key, 1)))}
      </div>
      <p className="adm-note">
        {waveOn
          ? 'A new wave added to a schedule that isn’t signed off lands in this order (e.g. SC on top). It never re-orders a day already planned, or a signed-off day.'
          : 'Off — a new wave is added at the bottom. Move a wave type to set the order new waves are placed in on a fresh schedule.'}
      </p>
      {waveOn && <button className="abtn" id="admWaveDefOff" onClick={resetWav} style={{ marginTop: 2 }}>Turn off wave order</button>}
    </div>
  )
}

export function AdminPage() {
  useVersion()
  const nameRef = useRef<HTMLInputElement>(null)
  const roleRef = useRef<HTMLSelectElement>(null)
  /* which category the pane shows; `drilled` only matters on a phone, where the
     rail and pane share the screen — it flips from the list to the detail */
  const [cat, setCat] = useState('users')
  const [drilled, setDrilled] = useState(false)
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
              {/* PROTOTYPE TRUTH, off-screen by owner's word (25 Aug 26 — "design
                  it and word it such that when this goes to database what would
                  the user actually see"): this list drives the demo login only;
                  no server behind it, a user added here lasts one browser
                  session. When the shared database lands, these become real
                  accounts and this comment comes out. Until then the UI reads
                  production — the caveat lives here and in HANDOFF, not on the
                  screen. */}
            </section>
            {/* ---- Squadron configuration — front doors to the two template
                editors. The modals are App-level siblings (App.tsx), so they
                paint over this page exactly as they do over any other; these
                buttons just set the same pops.ts flags the picker pencils set. ---- */}
            <section className={'adm-panel' + (cat === 'config' ? ' on' : '')} id="admConfig">
              <h4 className="adm-sub">Default arrangement</h4>
              <ArrangeDefaults />
              <hr className="adm-sep" />
              <button className="abtn" id="admDutyTpl" onClick={() => { setTplEdit(true); notify() }}>Duty templates…</button>
              <p className="adm-note">A duty template is a saved duty block — its rows and times — that "+ Block" copies onto any day as a plain, conflict-checked desk.</p>
              <button className="abtn" id="admDayTpl" onClick={() => { setDayTplEdit(true); notify() }}>Day templates…</button>
              <p className="adm-note">A day template is a whole captured day — waves, duties, sims and ground rows — recaptured off a real day and re-applied from the day-templates picker.</p>
              <button className="abtn" id="admWaveTpl" onClick={() => { setWaveEdit(true); notify() }}>Wave templates…</button>
              <p className="adm-note">A wave template is a saved flying wave — its rule-set and lines — that "+ Wave" drops onto any day.</p>
            </section>
            {/* ---- Data & persistence — the honesty card. This page is where the
                real controls land when the shared database arrives; until then the
                truth is stated rather than implied. ---- */}
            <section className={'adm-panel' + (cat === 'data' ? ' on' : '')} id="admData">
              {/* Clear old data (owner, 25 Aug 26 — "clear a set date of history
                  data. Wipe it clean so that the app stays snappy", widened the
                  same day to the full period grammar). The ids the pins hold:
                  #admWipeMode/#admWipeDate/#admWipeDate2/#admWipe. */}
              <h4 className="adm-sub">Schedule data</h4>
              <ClearControl idp="admWipe" act="Clear old data…"
                zero="Nothing on file in that period" unit={['record', 'records']}
                note="Permanently removes personal inputs, calendar notes and past week edits in the chosen period. Anything only partly inside the period is kept whole."
                run={clearHistoryData} />
              {/* PROTOTYPE TRUTHS, off-screen by owner's word (25 Aug 26): the
                  on-screen note above is the DATABASE-ERA wording — it calls the
                  wipe permanent, because the two-tap confirm is the safety and a
                  DB-era wipe won't ride the session undo. What it deliberately
                  does not say, kept here so the database migration remembers:
                  - TODAY the inputs/pucks/titles half IS one session-undo step
                    (writeInputsBatch), except Leave-War-synced leave, which is
                    withdrawn from the war for real (no shared undo) — same as
                    deleting such a row by hand. Stashed past weeks don't come
                    back either (outside the history snapshot).
                  - Everything in this prototype is session-only (reload forgets;
                    nothing leaves this browser). The shared live database is the
                    stated end-state (HANDOFF.md), this panel is where its real
                    controls land, and this wipe becomes a DB delete behind the
                    same button. */}
              <hr className="adm-sep" />
              {/* Clear edit history (owner, 25 Aug 26 — "also be able to just
                  clear the history of edits"). Same grammar, same two-tap; acts
                  on WHEN the edit was made (the date the History list prints),
                  and the schedule itself is untouched. Permanent for real even
                  today — the edit log was never inside the undo snapshot. */}
              <h4 className="adm-sub">Edit history</h4>
              <ClearControl idp="admLog" act="Clear edit history…"
                zero="No edits on record in that period" unit={['entry', 'entries']}
                note="Permanently removes entries from the edit history — the record of who changed what — made in the chosen period. The schedule itself is not touched."
                run={clearEditHistory} />
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
