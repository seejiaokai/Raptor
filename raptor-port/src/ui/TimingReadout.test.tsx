// @vitest-environment jsdom
/* THE TIMING WINDOW ([APP-SPEED] step 1 — owner D2481, D2483): one of the app's movable windows, as its mock-up of
   24 Nov 26 shows it — Copy all, which reads "Copied" for two seconds; the ✕ folds it to a corner button carrying the
   newest page's time, which opens it again; open at the start on a computer, folded on a phone. */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TimingReadout } from './TimingReadout'
import { copyText, type TimingView } from './timingtext'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const VIEW: TimingView = {
  site: 300, app: 812, first: { screen: 'signin', t: 840 }, signin: 1700,
  pages: [{ name: 'View-only Sched', first: false, ms: 912, downloaded: 0 }, { name: 'Edit Schedule', first: true, ms: 806, downloaded: 0 }],
  freezes: { supported: true, n: 2, total: 300, max: 200 },
  files: { supported: true, n: 14, bytes: 831_488, kept: 0, asked: 0 },
  env: { browser: { name: 'Edge', version: '131' }, cores: 4, memGB: 8, screen: '1366×768', window: '1366×657', scale: 1, openFor: 240_000 },
}

let host: HTMLDivElement, root: Root
beforeEach(() => { host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host) })
afterEach(() => { act(() => root.unmount()); host.remove(); vi.useRealTimers() })

function draw(view: TimingView, startOpen: boolean, copy = vi.fn(async () => true)) {
  act(() => root.render(<TimingReadout read={() => view} subscribe={() => () => {}} version={() => 0} startOpen={startOpen} copy={copy} now={() => new Date(2026, 10, 24, 14, 5)} />))
  return copy
}
const win = () => document.querySelector('.floatwin.timingwin')
const pill = () => document.querySelector('button.timing-pill') as HTMLButtonElement | null

describe('the window', () => {
  it('open: the title, its line "This computer only", the three sections and their rows', () => {
    draw(VIEW, true)
    expect(win()).not.toBeNull()
    expect(win()!.querySelector('.win-ttl')!.textContent).toBe('TimingThis computer only. Shown because the address ends in ?timing')
    expect([...win()!.querySelectorAll('.tm-h')].map(h => h.textContent)).toEqual(['Start-up, from opening the address', 'Pages opened, newest first', 'This computer'])
    expect(win()!.textContent).toContain('Sign in pressed → week shown')
    expect(win()!.querySelector('.tm-r.tm-gap')!.textContent).toBe('Sign in pressed → week showntook 1.7 s')
    expect(pill()).toBeNull()
  })
  it('Copy all puts the plain text in hand and reads "Copied" for two seconds, then "Copy all" again', async () => {
    vi.useFakeTimers()
    const copy = draw(VIEW, true)
    const btn = () => [...win()!.querySelectorAll('.win-tools button')].find(b => /Cop/.test(b.textContent!)) as HTMLButtonElement
    expect(btn().textContent).toBe('Copy all')
    await act(async () => { btn().click() })
    expect(copy).toHaveBeenCalledWith(copyText(VIEW, new Date(2026, 10, 24, 14, 5)))
    expect(btn().textContent).toBe('Copied')
    await act(async () => { vi.advanceTimersByTime(2100) })
    expect(btn().textContent).toBe('Copy all')
  })
  it('a copy the browser refuses does not claim "Copied"', async () => {
    const copy = draw(VIEW, true, vi.fn(async () => false))
    const btn = () => [...win()!.querySelectorAll('.win-tools button')].find(b => /Cop/.test(b.textContent!)) as HTMLButtonElement
    await act(async () => { btn().click() })
    expect(copy).toHaveBeenCalled()
    expect(btn().textContent).toBe('Copy all')
  })
  it('the ✕ folds it to the corner button with the newest page\'s time; that button opens it again', () => {
    draw(VIEW, true)
    act(() => { (win()!.querySelector('.win-x') as HTMLButtonElement).click() })
    expect(win()).toBeNull()
    expect(pill()!.textContent).toBe('Timing 0.9 s')
    act(() => { pill()!.click() })
    expect(win()).not.toBeNull()
    expect(pill()).toBeNull()
  })
  it('folded at the start (a phone), before any page is opened, the button reads just "Timing"', () => {
    draw({ ...VIEW, pages: [] }, false)
    expect(win()).toBeNull()
    expect(pill()!.textContent).toBe('Timing')
  })
  it('F5: opening by itself at the start leaves the caret where it was — he types his name straight away', () => {
    const user = document.createElement('input'); user.id = 'luser'; document.body.appendChild(user); user.focus()
    draw(VIEW, true)
    expect(win()).not.toBeNull()
    expect(document.activeElement).toBe(user)
    user.remove()
  })
  it('a copy that fails after one that worked takes "Copied" away at once — it never speaks for the last press', async () => {
    let ok = true
    draw(VIEW, true, vi.fn(async () => ok))
    const btn = () => [...win()!.querySelectorAll('.win-tools button')].find(b => /Cop/.test(b.textContent!)) as HTMLButtonElement
    await act(async () => { btn().click() })
    expect(btn().textContent).toBe('Copied')
    ok = false
    await act(async () => { btn().click() })
    expect(btn().textContent).toBe('Copy all')
  })
  it('a section with nothing yet says so', () => {
    draw({ ...VIEW, pages: [], signin: null }, true)
    expect(win()!.textContent).toContain('No page opened yet')
    expect(win()!.textContent).toContain('not yet')
  })
})
