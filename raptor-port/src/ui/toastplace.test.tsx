// @vitest-environment jsdom
/* WHERE THE PASSING NOTE STANDS ON A PHONE (owner D731 (1), 10 Oct 26 — "on a phone, while a window is open, the passing
   note is shown at the TOP of the screen, not over the window's buttons at its foot"; `[CARD-CHECK-SEEN]` 3 — walker B:
   "OIL answer saved" lay between "Take me out" and "Close" for as long as it showed).

   A window of the shell (ui/FloatWindow.tsx) stands on the foot of a phone's screen with its buttons at its own foot —
   exactly where the note is drawn. So while one is up, and only on a phone, the note is drawn at the top. A desktop,
   and a phone with no window up, keep the note where it always was. What jsdom can see is pinned here (which place
   the note was given, and that it follows a window opened under it); that the note then really clears the window's
   buttons is e2e/inputs-batch2.spec.ts. */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { toast, clearToast } from './toast'
import { FloatWin, _resetFloatWins } from './FloatWindow'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const realMM = (window as any).matchMedia
/* the shell's own width for "a phone" (ui/floatwin.ts phoneLayout) */
const asPhone = (on: boolean) => {
  ;(window as any).matchMedia = (q: string) => ({ matches: on && /max-width:\s*620px/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
}
const face = () => document.getElementById('toastEl') as HTMLElement
let host: HTMLDivElement, root: Root
const openWin = async () => act(async () => { root.render(<FloatWin id="t-win" title="A window" onClose={() => {}}><button>Close</button></FloatWin>) })
const closeWin = async () => act(async () => { root.render(<></>) })

beforeEach(() => { host = document.createElement('div'); document.body.append(host); root = createRoot(host) })
afterEach(async () => {
  await act(async () => { root.unmount() })
  host.remove(); _resetFloatWins(); clearToast(); (window as any).matchMedia = realMM
  document.getElementById('toastEl')?.remove()
})

describe('D731 (1) — on a phone, while a window is open, the passing note is shown at the top', () => {
  it('a phone with a window up: the note is at the top, not at the foot', async () => {
    asPhone(true); await openWin()
    toast('Input updated', 'ok')
    expect(face().dataset.at).toBe('top')
    expect(face().style.bottom).toBe('auto')
    expect(face().textContent).toBe('Input updated')
  })
  it('a phone with NO window up: at the foot, as before', () => {
    asPhone(true)
    toast('CSV downloaded', 'ok')
    expect(face().dataset.at).toBe('foot')
    expect(face().style.bottom).toBe('26px')
    expect(face().style.top).toBe('')
  })
  it('a desktop with a window up: at the foot, as before — a desktop window is not at the foot of the screen', async () => {
    asPhone(false); await openWin()
    toast('Input updated', 'ok')
    expect(face().dataset.at).toBe('foot')
    expect(face().style.bottom).toBe('26px')
  })
  it('a note already showing moves up when a window opens under it', async () => {
    asPhone(true)
    toast('Only a scheduler can move someone else’s input', 'warn')
    expect(face().dataset.at).toBe('foot')
    await openWin()
    expect(face().dataset.at, 'the window’s buttons are where the note was').toBe('top')
  })
  it('…and the next note after the window has closed is at the foot again', async () => {
    asPhone(true); await openWin()
    toast('first', 'ok')
    expect(face().dataset.at).toBe('top')
    await closeWin()
    toast('second', 'ok')
    expect(face().dataset.at).toBe('foot')
    expect(face().style.bottom).toBe('26px')
  })
  it('the note is still never a thing a press can land on', async () => {
    asPhone(true); await openWin()
    toast('Input updated', 'ok')
    expect(face().style.pointerEvents).toBe('none')
  })
})
