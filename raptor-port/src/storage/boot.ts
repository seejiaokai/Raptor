/* THE GATE. The one place the app waits: loadAll, fill the whiteboard,
   start the postman, and only then may main.tsx run today's boot sequence
   and draw. A rejected loadAll boots nothing (main.tsx shows Retry). */
import type { Backend } from './backend'
import { Whiteboard } from './whiteboard'
import { Postman } from './postman'
import { MemoryBackend } from './memory'
import { BrowserBackend } from './browser'

export async function bootStorage(backend: Backend): Promise<{ wb: Whiteboard; postman: Postman }> {
  const snap = await backend.loadAll()
  const wb = new Whiteboard()
  wb.fill(snap)
  const postman = new Postman(backend)
  postman.attach(wb)
  return { wb, postman }
}

/* Which backend (spec §Backend choice): ?fresh=1 → Memory; tests or
   VITE_STORAGE=memory → Memory; `vite` dev → Memory unless
   VITE_STORAGE=browser; a built site → Browser, or Memory when browser
   storage cannot even be touched (locked-down / private browsing). */
export function chooseBackend(
  env: Record<string, any> = import.meta.env as any,
  search: string = typeof location !== 'undefined' ? location.search : '',
  ls?: Storage,
): Backend {
  if (/[?&]fresh=1(&|$)/.test(search)) return new MemoryBackend()
  if (env.MODE === 'test' || env.VITE_STORAGE === 'memory') return new MemoryBackend()
  if (env.DEV && env.VITE_STORAGE !== 'browser') return new MemoryBackend()
  try {
    const store = ls ?? localStorage
    void store.length
    return new BrowserBackend(store)
  } catch (e) {
    return new MemoryBackend()
  }
}

/* Leaving the page with letters still queued or failed asks the browser's
   "are you sure?" — the only UI the postman has besides the indicator. */
export function guardUnload(postman: Postman, win: Window = window): void {
  win.addEventListener('beforeunload', e => {
    if (!postman.hasWork()) return
    e.preventDefault()
    e.returnValue = ''
  })
}
