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
import { ChangesWindow } from './ChangesWindow'
import { setChgWin } from '../state/view'
import { initStore, setSession } from '../state/store'
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
  /* [BUBBLE-SMALL-SEEN] (3) (the change-recording re-walk, 29 Sep 26): the changes window is a panel at the foot on a
     phone — a note at the foot sat over its first lines. Its placeholder is always mounted, hidden: that one is no window. */
  it('a phone with the changes window up: the note is at the top; its hidden placeholder alone changes nothing', () => {
    asPhone(true)
    const cw = document.createElement('div'); cw.className = 'chgwin'; cw.hidden = true; document.body.append(cw)
    try {
      toast('Undid: a take-off time', 'ok')
      expect(face().dataset.at, 'the hidden placeholder is no window').toBe('foot')
      cw.hidden = false
      toast('Undid: a take-off time', 'ok')
      expect(face().dataset.at, 'the open changes window is').toBe('top')
    } finally { cw.remove() }
  })
  /* …AND THE ALL AVAIL WINDOW, the changes window's twin at the foot of a phone (D997) — the look-and-keys walk, 21 Oct 26:
     "ALL AVAIL planned" stood over the window's last lines (docs/img/handpass/2026-10-21-look-keys/walk/w11-avail-phone.png).
     Its placeholder is always mounted, hidden: that one is no window either. */
  it('a phone with the ALL AVAIL window up: the note is at the top; its hidden placeholder alone changes nothing', () => {
    asPhone(true)
    const aw = document.createElement('div'); aw.className = 'availwin'; aw.hidden = true; document.body.append(aw)
    try {
      toast('ALL AVAIL planned', 'ok')
      expect(face().dataset.at, 'the hidden placeholder is no window').toBe('foot')
      aw.hidden = false
      toast('ALL AVAIL planned', 'ok')
      expect(face().dataset.at, 'the open ALL AVAIL window is').toBe('top')
    } finally { aw.remove() }
  })
  /* …and the backlog's own order: the note is ALREADY up (an Undo's) when the changes window opens — the window moves it
     (the batch's check, 19 Oct 26 — the scenario designer's S3-03: the test above raised the note after the window) */
  it('a phone: a note already up when the changes window opens goes to the top', async () => {
    asPhone(true)
    initStore(); setSession({ user: 'a', role: 'admin' })
    toast('Undid: a take-off time', 'ok')
    expect(face().dataset.at, 'no window yet: at the foot').toBe('foot')
    try {
      await act(async () => { setChgWin({ day: 'week', tab: 'all', group: 'item' }); root.render(<ChangesWindow />) })
      expect(document.querySelector('.chgwin:not([hidden])'), 'the window is up (or this test proves nothing)').toBeTruthy()
      expect(face().dataset.at, 'the note it found there moved to the top').toBe('top')
    } finally { await act(async () => { setChgWin(null) }) }
  })
  /* …and NOT when it closes: a note is not moved about while it is being read (ui/toast.ts placeToast — the
     look-and-keys read, finding 5: the window's own placing ran on its close too) */
  it('a phone: a note at the top while the changes window is up stays there when the window closes', async () => {
    asPhone(true)
    initStore(); setSession({ user: 'a', role: 'admin' })
    await act(async () => { setChgWin({ day: 'week', tab: 'all', group: 'item' }); root.render(<ChangesWindow />) })
    toast('Undid: a take-off time', 'ok')
    expect(face().dataset.at).toBe('top')
    await act(async () => { setChgWin(null); root.render(<ChangesWindow />) })
    expect(document.querySelector('.chgwin:not([hidden])'), 'the window has closed (or this test proves nothing)').toBeNull()
    expect(face().dataset.at, 'the note stays where it is being read').toBe('top')
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

/* HOW WIDE THE NOTE IS ON A PHONE (owner D828, 13 Oct 26 — "on a phone a passing note takes the screen's full width less
   a small margin — never half the screen; the desktop's note stays as it is"). The note was centred by `left:50%` and a
   shift back of half its own width, which leaves a box only the right half of the screen to be wide in: 195 of 390, and
   his two notes five lines deep. jsdom has no layout, so what is pinned here is the PLACE the note is given — held 12px
   from each side and not shifted on a phone; `left:50%` and the shift, untouched, on a desktop — and that the rise-in
   moves it from that same place. How wide and how deep it then really is, is a look on a real phone. */
describe('D828 — on a phone the passing note takes the screen’s width, less a small margin', () => {
  const place = () => ({ left: face().style.left, right: face().style.right, transform: face().style.transform })
  it('a phone: 12px from each side, and no shift of half its own width', () => {
    asPhone(true)
    toast('Monday unpublished. It is a draft again, and publishing reissues the Original.', undefined)
    expect(place()).toEqual({ left: '12px', right: '12px', transform: 'none' })
    expect(face().style.transform).not.toContain('translateX(-50%)')
    expect(face().style.textAlign, 'its words centred in the wider box, as the picture put to him drew them').toBe('center')
  })
  it('a phone with a window up: the same width, at the top', async () => {
    asPhone(true); await openWin()
    toast('Input updated', 'ok')
    expect(place()).toEqual({ left: '12px', right: '12px', transform: 'none' })
    expect(face().dataset.at).toBe('top')
  })
  it('a desktop: exactly as it was — centred by left:50% and the shift, no right edge, no centring of its words', async () => {
    asPhone(false)
    toast('CSV downloaded', 'ok')
    expect(place()).toEqual({ left: '50%', right: '', transform: 'translateX(-50%)' })
    expect(face().style.textAlign).toBe('')
    await openWin()
    toast('Input updated', 'ok')
    expect(place(), 'with a window up too').toEqual({ left: '50%', right: '', transform: 'translateX(-50%)' })
  })
  it('the ONE note is reused: narrowed to a phone between two notes it takes the phone’s place, and widened again the desktop’s', () => {
    asPhone(false)
    toast('first', undefined)
    const el = face()
    asPhone(true)
    toast('second', undefined)
    expect(face(), 'the same element').toBe(el)
    expect(place()).toEqual({ left: '12px', right: '12px', transform: 'none' })
    asPhone(false)
    toast('third', undefined)
    expect(place()).toEqual({ left: '50%', right: '', transform: 'translateX(-50%)' })
    expect(face().style.textAlign).toBe('')
  })
  it('the rise-in starts from the place the note has: no sideways shift on a phone, the desktop’s shift kept', () => {
    const frames: any[] = []
    const realAnimate = (HTMLElement.prototype as any).animate
    ;(HTMLElement.prototype as any).animate = function (k: any) { frames.push(k); return {} }
    try {
      asPhone(true)
      toast('on a phone', undefined)
      expect(frames.pop()).toEqual([{ transform: 'translateY(8px)' }, { transform: 'none' }])
      asPhone(false)
      toast('on a desktop', undefined)
      expect(frames.pop()).toEqual([{ transform: 'translateX(-50%) translateY(8px)' }, { transform: 'translateX(-50%)' }])
    } finally { (HTMLElement.prototype as any).animate = realAnimate }
  })
})
