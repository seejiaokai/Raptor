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

/* Leaving the page. FLUSH FIRST: the Browser backend writes inside put()
   before its first await, so every letter still in its 300 ms coalesce wait
   lands synchronously here and a reload right after an edit keeps the edit
   (8 Sep 26 bug pass: it was lost, and on a phone SILENTLY — iOS Safari never
   fires beforeunload; pagehide and a hidden visibilitychange are what it does
   fire, so they flush too). Then, only if letters are still unsent (a backend
   that has failed, or a genuinely asynchronous one), ask the browser's "are
   you sure?" — the only UI the postman has besides the indicator. A letter
   merely in flight after the flush is on its way and must not prompt. */
export function guardUnload(postman: Postman, win: Window = window): void {
  const flush = () => { void postman.flush() }
  win.addEventListener('pagehide', flush)
  win.addEventListener('visibilitychange', () => { if (win.document.visibilityState === 'hidden') flush() })
  win.addEventListener('beforeunload', e => {
    flush()
    const s = postman.status
    if (s !== 'failed' && s !== 'unsaved') return
    e.preventDefault()
    e.returnValue = ''
  })
}
