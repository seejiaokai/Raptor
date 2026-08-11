import { SESSION } from '../state/auth'
import { useVersion } from './useStore'
import { Login } from './Login'
import { Shell } from './Shell'
import { SchedBoard, CxDialog, SortAllDialog } from './SchedBoard'
import { InputEditor } from './inputedit'
import { HistoryModal } from './HistoryModal'

export function App() {
  useVersion()
  /* the scheduler board overlay is a SIBLING of the shell, as in the
     reference — logout unmounts both. The changes list is a sibling of the
     BOARD for the same reason the board is one of the shell: it opens from
     the board's own bar and must paint over it, and the board is a
     full-screen modal that a child dialog would be trapped inside. */
  return SESSION ? <><Shell /><SchedBoard /><CxDialog /><SortAllDialog /><HistoryModal /><InputEditor /></> : <Login />
}
