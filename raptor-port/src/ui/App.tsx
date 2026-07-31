import { SESSION } from '../state/auth'
import { useVersion } from './useStore'
import { Login } from './Login'
import { Shell } from './Shell'

export function App() {
  useVersion()
  return SESSION ? <Shell /> : <Login />
}
