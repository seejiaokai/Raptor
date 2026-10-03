import { useEffect } from 'react'
import { SESSION } from '../state/auth'
import { sessionNow } from '../state/accounts'
import { notify, resetSession } from '../state/store'
import { roleOf } from '../state/perms'
import { useVersion } from './useStore'
import { Login } from './Login'
import { AccessScreen } from './AccessScreen'
import { GuestApp } from './GuestApp'
import { Shell } from './Shell'
import { SchedBoard, CxDialog, SortAllDialog } from './SchedBoard'
import { InputEditor } from './inputedit'
import { DocViewer } from './DocViewer'
import { ChangesWindow } from './ChangesWindow'
import { MedMoveConfirm } from './MedMoveConfirm'
import { DutyTplModal } from './DutyTplModal'
import { WaveTplModal } from './WaveTplModal'
import { DayTplModal } from './DayTplModal'
import { DraftsModal } from './DraftsModal'
import { SecDefaultSnackbar } from './SecDefaultSnackbar'
import { AvailWindow } from './AvailWindow'
import { installMissionRoleOffers, reconcileMissionRoleOffer } from './mission-role-offer'

export function App() {
  useVersion()
  useEffect(()=>installMissionRoleOffers(),[])
  useEffect(()=>reconcileMissionRoleOffer())
  /* [ONE-DOOR] round 1 (Fable F8 / Astra 4): a session whose account went off, or whose person was archived or deleted,
     since he signed in is turned off on the next repaint — the suspended screen, his writes refused from then on; and
     (the final code read, Astra 1) one whose account was deleted is turned off too, one whose role or person another
     admin changed is made again from the account as it now stands. React runs this before it handles the next tap or
     key, so no command of the old session goes through in between; at the database step the server is the boundary. */
  useEffect(() => {
    const next = sessionNow()
    if (next === undefined) return
    resetSession(next)
    notify()
  })
  /* WHO IS SIGNED IN DECIDES THE WHOLE TREE ([ACCOUNTS], D204, 26 Sep 26): nobody —
     the sign-in; signed in but on no list, or switched off — the access screens (ask
     for access, waiting, switched off); a guest (asked, the admin's guest switch on) —
     the separate read-only GuestApp, which mounts none of what follows; an admin or a
     member — the app.
     The scheduler board overlay is a SIBLING of the shell, as in the
     reference — logout unmounts both. The changes list is a sibling of the
     BOARD for the same reason the board is one of the shell: it opens from
     the board's own bar and must paint over it, and the board is a
     full-screen modal that a child dialog would be trapped inside. */
  if (!SESSION) return <Login />
  const who = roleOf()
  if (who === 'pending' || who === 'off') return <AccessScreen />
  if (who === 'guest') return <GuestApp />
  return <><Shell /><SchedBoard /><CxDialog /><SortAllDialog /><InputEditor /><MedMoveConfirm /><DocViewer /><DutyTplModal /><WaveTplModal /><DayTplModal /><DraftsModal /><SecDefaultSnackbar /><AvailWindow /><ChangesWindow /></>
}
