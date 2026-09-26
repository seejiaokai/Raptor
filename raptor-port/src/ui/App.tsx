import { SESSION } from '../state/auth'
import { roleOf } from '../state/perms'
import { useVersion } from './useStore'
import { Login } from './Login'
import { AccessScreen } from './AccessScreen'
import { GuestApp } from './GuestApp'
import { Shell } from './Shell'
import { SchedBoard, CxDialog, SortAllDialog } from './SchedBoard'
import { InputEditor } from './inputedit'
import { DocViewer } from './DocViewer'
import { HistoryModal } from './HistoryModal'
import { MedMoveConfirm } from './MedMoveConfirm'
import { DutyTplModal } from './DutyTplModal'
import { WaveTplModal } from './WaveTplModal'
import { DayTplModal } from './DayTplModal'
import { DraftsModal } from './DraftsModal'
import { SecDefaultSnackbar } from './SecDefaultSnackbar'
import { AvailWindow } from './AvailWindow'

export function App() {
  useVersion()
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
  return <><Shell /><SchedBoard /><CxDialog /><SortAllDialog /><HistoryModal /><InputEditor /><MedMoveConfirm /><DocViewer /><DutyTplModal /><WaveTplModal /><DayTplModal /><DraftsModal /><SecDefaultSnackbar /><AvailWindow /></>
}
