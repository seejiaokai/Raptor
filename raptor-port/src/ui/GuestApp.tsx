/* THE GUEST VIEW ([ACCOUNTS], D204, 26 Sep 26).

   Owner, D204: "both ways, waiting screen and the guest view option?" — the agent's
   reading, stated to him: while waiting for access a person sees the waiting screen;
   an ADMIN SWITCH (Admin → Users, OFF by default) can let people waiting see the
   programme read-only as a guest.

   This is a SEPARATE tree (Fable R1-2, Astra R1-3), not the Shell with pages hidden:
   none of the Shell, the scheduler board, the history list, the input editor, the
   document viewer, the ALL AVAIL window, the template sheets, Leave War, Tracker, Quals,
   Logic, Inputs, Help or Admin is mounted, and none of the Shell's document-wide click,
   change, drag or keyboard listeners. What is here: a slim bar (the mark, the week
   window, "Waiting for access — view only", Sign out) and the published week from the
   same builder the view page uses (ui/html.ts viewDayHTML), which for a guest draws a
   published day's ISSUED face only — no working copy — says "Not published yet" on any
   other day, and shows a medical input in full as members see it (D211, D213 — asked of
   perms.ts mayReadMedicalOf). The day swipe / arrows (ui/pan.ts) move the week — reading
   is not editing. Every write refuses him anyway, at the command gate (perms.ts). */
import { useEffect } from 'react'
import { CURWEEK } from '../engine/waves'
import { weekWindow } from './weeknav'
import { SESSION } from '../state/auth'
import { loadWeek, notify } from '../state/store'
import { logOut } from './logout'
import { initPan, updateWeekNav } from './pan'
import { ViewWeek } from './ViewWeek'
import { useVersion } from './useStore'
import { SaveStatus, useBandUp } from './SaveStatus'
import { TalonMark } from './icons'

export function GuestApp() {
  useVersion()
  useEffect(() => initPan(), [])
  useEffect(() => { const t = setTimeout(updateWeekNav, 0); return () => clearTimeout(t) })
  const name = String((SESSION && SESSION.name) || '')
  /* a failed save's band is the bar's last line here as on every page (D587) — his request may be what did not save (D1657); a browser's "Not kept" band the same (D1901) */
  const bandUp = useBandUp()
  return (
    <div id="guestApp">
      <div className={'topbar guestbar' + (bandUp ? ' save-failed' : '')}>
        <TalonMark />
        <span className="guest-note" id="guestNote" title={name ? `Signed in as ${name}` : undefined}>Waiting for access — view only</span>
        <div className="right">
          <button className="abtn ghost" id="guestOut" onClick={() => { void logOut() }}>Sign out</button>
        </div>
        <SaveStatus />
      </div>
      <section className="page on" id="page-viewsched">
        <div className="filters" id="guestChrome">
          <span className="wkseg guest-wks" id="weekSeg">
            {weekWindow(CURWEEK).map(w => <button key={w.v}
              className={'wk' + (w.sel ? ' on' : '') + (w.today ? ' todaywk' : '')} data-wk={w.v}
              onClick={() => { loadWeek(w.v); notify() }}>{w.lbl}</button>)}
          </span>
        </div>
        <ViewWeek />
      </section>
    </div>
  )
}
