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
import { SECDEFOFFER, setSecDefOffer, secDefOfferSeq } from '../state/view'
import { canEditSched } from '../state/auth'
import { notify } from '../state/store'
import { toast } from './toast'
import { useVersion } from './useStore'

export function SecDefaultSnackbar() {
  useVersion()
  const di = SECDEFOFFER
  /* a prompt should never linger — clear it after a few seconds if untouched.
     Keyed on the RAISE SEQUENCE, not the day, so re-dragging the SAME day
     restarts the timer instead of inheriting the previous drag's countdown
     (the [di] key left the second offer running out the first's clock). */
  const seq = di == null ? -1 : secDefOfferSeq()
  useEffect(() => {
    if (di == null) return
    const t = setTimeout(() => { setSecDefOffer(null); notify() }, 7000)
    return () => clearTimeout(t)
  }, [seq])

  /* Withheld for a non-admin (the write below promotes the squadron house
     default, so it is gated at the write path per the role doctrine, not only
     at the drag that raised it — an offer can outlive its admin context across
     a logout/login inside the 7s window) and when the day has gone (a week
     switch clears the offer, but fail safe anyway). */
  if (di == null || !DAYS[di] || !canEditSched()) return <div className="secdef-snack" hidden />
  const close = () => { setSecDefOffer(null); notify() }
  const apply = () => {
    if (!canEditSched()) { setSecDefOffer(null); notify(); return }
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
