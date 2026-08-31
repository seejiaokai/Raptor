/* THE "SET DEFAULT ORDER?" SNACKBAR (owner, 29 Aug 26 pt.3 — the in-place drag
   that replaced the Arrange sheet: "a 'Set default order?' snackbar sets the house
   default"). After an admin drags a SECTION into a new place (rowdrag.ts →
   store.moveSectionTo), this offers to make that day's section order the squadron's
   house default (engine/order.ts SEC_DEFAULT), so every un-arranged day follows it
   from now on — the same default the Admin → Squadron config panel edits, written
   through the same setSecDefault/secDefaultSave, so the two can't drift.

   The app's toast (ui/toast.ts) is a fading, un-clickable bubble — it cannot host a
   button — so an ACTIONABLE prompt is its own small bar, following the store-
   subscribed shell every modal here uses (a hidden node when there is no offer).
   Only a section drag opens it, and that drag is admin-gated (canEditSched), so no
   further role check is needed. It auto-dismisses so a prompt never lingers. */
import { useEffect } from 'react'
import { DAYS } from '../engine/data'
import { secOrder, setSecDefault, secDefaultSave } from '../engine'
import { SECDEFOFFER, setSecDefOffer } from './pops'
import { notify } from '../state/store'
import { toast } from './toast'
import { useVersion } from './useStore'

export function SecDefaultSnackbar() {
  useVersion()
  const di = SECDEFOFFER
  /* a prompt should never linger — clear it after a few seconds if untouched.
     Keyed on the day so a fresh drag restarts the timer rather than inheriting
     the previous one. */
  useEffect(() => {
    if (di == null) return
    const t = setTimeout(() => { setSecDefOffer(null); notify() }, 7000)
    return () => clearTimeout(t)
  }, [di])

  /* the day could have gone (a week switch under an open offer) — fail safe */
  if (di == null || !DAYS[di]) return <div className="secdef-snack" hidden />
  const close = () => { setSecDefOffer(null); notify() }
  const apply = () => {
    setSecDefault(secOrder(DAYS[di]))
    secDefaultSave()
    setSecDefOffer(null)
    notify()
    toast('Saved as the default section order for every day', '')
  }

  return (
    <div className="secdef-snack" role="status">
      <span className="secdef-msg">Use this section order as the default for every day?</span>
      <button className="secdef-btn yes" onClick={apply}>Set as default</button>
      <button className="secdef-btn" onClick={close}>Not now</button>
    </div>
  )
}
