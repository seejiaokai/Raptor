import { SESSION } from '../state/auth'
import { useVersion } from './useStore'
import { Login } from './Login'
import { Shell } from './Shell'
import { SchedBoard, CxDialog, SortAllDialog } from './SchedBoard'
import { InputEditor } from './inputedit'

export function App() {
  useVersion()
  /* the scheduler board overlay is a SIBLING of the shell, as in the
     reference — logout unmounts both */
  return SESSION ? <><Shell /><SchedBoard /><CxDialog /><SortAllDialog /><InputEditor /></> : <Login />
}
