// @vitest-environment jsdom
/* [UNDO-TOPBAR] — the owner's D347–D349 (28 Sep 26), the ROLL-CALL of the Undo / Redo pair (bug-check order §6: every
   place the app draws it, each with has-it / must-not). "All undo and redo buttons should be at the top bar …
   standardised … like how the edit schedule is" (D347): the pair sits in the top bar on every page where the signed-in
   person can change something — Edit Schedule, the Leave War, Inputs, Quals for anyone who has them; Admin and Logic for
   an admin (a member's Logic is read-only — the plan's §11.6); the Tracker, which draws the TRACKER'S OWN history (D349
   (2)). View-only Sched and Help change nothing and carry none. An admin in the member view is a member here (D292). The
   Leave War's own pair left its Period row. The board's bar: the pair, History, Sync, the bell, ✓ Done — ✕ Close gone
   (D349 (3)). Replaces the Leave War header's own "the undo / redo buttons" tests (leavewar/ui/chrome.test.tsx). */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, resetSession, notify, setPage, switchRoleView } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { setCell, getState, setRole, initStore as lwInitStore } from '../leavewar/state/store'
import { memoryBackend } from '../leavewar/state/storage'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { openScheduler } from './board'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root
const $ = (sel: string) => host.querySelector(sel) as HTMLElement | null
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const go = async (p: string) => { await act(async () => { setPage(p); notify() }) }
const pairOnBar = () => ({
  undo: !!host.querySelector('.topbar .tb-hist #undoBtn'), redo: !!host.querySelector('.topbar .tb-hist #redoBtn'),
  trUndo: !!host.querySelector('.topbar .tb-hist #trUndoBtn'),
})

beforeAll(async () => {
  initStore(); accountsLoad()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
})
afterAll(async () => { await act(async () => { root.unmount() }); host.remove() })

/* the pages and who sees the pair there — the roll-call */
const ONE_UNDO = ['editsched', 'leavewar', 'inputs', 'quals', 'admin', 'logic']
const NONE = ['viewsched', 'help']
describe('the roll-call: where the pair shows, by page and role', () => {
  it('an admin: the one pair on every page he changes something on; the Tracker’s own on the Tracker; none on View-only Sched or Help', async () => {
    await act(async () => { resetSession(sessionFor(signIn('ad', 'a'))); notify() })
    for (const p of ONE_UNDO) { await go(p); expect(pairOnBar(), p).toEqual({ undo: true, redo: true, trUndo: false }) }
    for (const p of NONE) { await go(p); expect(pairOnBar(), p).toEqual({ undo: false, redo: false, trUndo: false }) }
    await go('tracker'); expect(pairOnBar(), 'tracker').toEqual({ undo: false, redo: false, trUndo: true })
    expect($('.topbar')!.className, 'the Tracker page wears the phone sync-dot class, not Edit Schedule’s tint').toMatch(/has-undo/)
    expect($('.topbar')!.className).not.toMatch(/editing/)
  })
  it('a member: Leave War, Inputs, Quals and the Tracker — not Logic (read-only for him)', async () => {
    await act(async () => { resetSession(sessionFor(signIn('us', 'us'))); notify() })
    for (const p of ['leavewar', 'inputs', 'quals']) { await go(p); expect(pairOnBar(), p).toEqual({ undo: true, redo: true, trUndo: false }) }
    for (const p of ['logic', ...NONE]) { await go(p); expect(pairOnBar(), p).toEqual({ undo: false, redo: false, trUndo: false }) }
  })
  it('an admin in the member view is a member here (D292)', async () => {
    await act(async () => { resetSession(sessionFor(signIn('ad', 'a'))); notify() })
    await go('logic')
    expect(pairOnBar().undo).toBe(true)
    await act(async () => { switchRoleView() })
    await go('logic'); expect(pairOnBar().undo, 'logic in the member view').toBe(false)
    await go('quals'); expect(pairOnBar().undo, 'quals in the member view').toBe(true)
    await act(async () => { switchRoleView() })
  })
  it('the clock stays Edit Schedule’s (D348)', async () => {
    await act(async () => { resetSession(sessionFor(signIn('ad', 'a'))); notify() })
    await go('editsched'); expect($('.topbar #histBtn')).toBeTruthy()
    await go('quals'); expect($('.topbar #histBtn')).toBeFalsy()
  })
})

describe('the pair drives the one undo from the Leave War; its own Period-row pair is gone', () => {
  beforeEach(async () => {
    await act(async () => { resetSession(sessionFor(signIn('ad', 'a'))); notify() })
    lwInitStore(memoryBackend())         // the war's own store, as main.tsx boots it (its demo war holds 20 Jan 26)
    _resetTimeline(); installGlobalUndo()
  })
  it('greyed with nothing to undo, then undo and redo a bid', async () => {
    await go('leavewar')
    expect($('[data-testid="lw-undo"]'), 'no pair in the war’s own Period row').toBeFalsy()
    const undo = () => $('#undoBtn') as HTMLButtonElement, redo = () => $('#redoBtn') as HTMLButtonElement
    expect(undo().disabled).toBe(true)
    await act(async () => { setRole('admin'); setCell('ramp', '2026-01-20', 'LL'); notify() })
    expect(undo().disabled).toBe(false)
    await click(undo())
    expect(getState().grid.ramp?.['2026-01-20']).toBeUndefined()
    expect(redo().disabled).toBe(false)
    await click(redo())
    expect(getState().grid.ramp['2026-01-20']).toBe('LL')
  })
})

describe('the board’s bar (D349 (3)): Undo · Redo · History · Sync · the bell · ✓ Done — no ✕ Close', () => {
  it('carries the group, in that order, with its own ids; one Sync state with the top bar', async () => {
    await act(async () => { resetSession(sessionFor(signIn('ad', 'a'))); notify() })
    await go('editsched')
    await act(async () => { openScheduler(0) })
    const ids = [...host.querySelectorAll('#schedBoard .sb-actions button')].map(b => b.id).filter(Boolean)
    const at = (id: string) => ids.indexOf(id)
    expect(ids).not.toContain('sbClose')
    for (const id of ['sbUndo', 'sbRedo', 'sbHist', 'sbSync', 'sbBell', 'sbDone']) expect(ids, id).toContain(id)
    expect(at('sbUndo') < at('sbRedo') && at('sbRedo') < at('sbHist') && at('sbHist') < at('sbSync') && at('sbSync') < at('sbBell') && at('sbBell') < at('sbDone')).toBe(true)
    await click($('#sbSync'))
    expect($('#sbSync')!.className).toMatch(/\bon\b/)
    expect($('#fastSync')!.className, 'the top bar’s chip agrees').toMatch(/\bon\b/)
    await click($('#sbSync'))
  })
  it('the ⋯ menu opens, offers Sort all and the layout switch, and closes on a tap outside', async () => {
    await act(async () => { openScheduler(0) })
    expect($('#sbMoreMenu')).toBeFalsy()
    await click($('#sbMore'))
    expect($('#sbMoreMenu')).toBeTruthy()
    expect($('#sbMoreSort')).toBeTruthy()
    expect($('#sbMoreWide')).toBeTruthy()
    await act(async () => { document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true })) })
    expect($('#sbMoreMenu'), 'a tap outside closes it').toBeFalsy()
    await click($('#sbMore'))
    await click($('#sbMoreWide'))
    expect($('#sbMoreMenu'), 'and a choice closes it').toBeFalsy()
    expect($('#schedBoard')!.className).toMatch(/sb-wide/)
    await click($('#sbMore')); await click($('#sbMoreWide'))
  })
})
