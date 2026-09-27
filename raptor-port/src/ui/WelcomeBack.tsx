/* HIS OWN "WELCOME BACK" ([ONE-DOOR], owner D305, 27 Sep 26 — "I also want that option for the user to update his own
   quals"). Restore on Admin → Users sets `back` on his Person (leavewar/sync.ts restoreBody — every Restore, with or
   without an account: round 1, Fable F12 / Astra 5); on his first sign-in after it he is told, under the top bar on
   every page, to check his quals and CAT. It changes nothing (D284). "Check my quals" opens his own Quals row (he edits
   it — D149); "Later" puts it away. Either clears `back` — his OWN row only (state/accounts.ts markBackSeen, the
   `person.backSeen` command). An admin in the member view (D292) sees his own, never another's; a guest, a person
   waiting and an account suspended never reach the Shell. The words are the approved mock-up's (docs/mock/one-door.html
   §6, D322). */
import { PEOPLE } from '../engine/people'
import { HOOKS } from '../engine/hooks'
import { me, roleOf } from '../state/perms'
import { markBackSeen } from '../state/accounts'
import { focusQualsRow, setPage } from '../state/view'
import { notify } from '../state/store'
import './postout.css'

export function WelcomeBack() {
  const id = me()
  const who = roleOf()
  if (!id || (who !== 'admin' && who !== 'member')) return null
  const p = (PEOPLE as any)[id]
  if (!p || !p.back || p.archived || p.deleted) return null
  const seen = (then?: () => void) => {
    const bad = markBackSeen()
    if (bad) { HOOKS.toast(bad, 'warn'); return }
    if (then) then()
    notify()
  }
  return (
    <div className="back-prompt welcome-back" id="welcomeBack">
      <span><b>Welcome back, {p.cs}</b> — check your quals and CAT.</span>
      <button className="abtn primary" id="welcomeCheck" onClick={() => seen(() => { focusQualsRow(id); setPage('quals') })}>Check my quals</button>
      <button className="abtn" id="welcomeLater" onClick={() => seen()}>Later</button>
    </div>
  )
}
