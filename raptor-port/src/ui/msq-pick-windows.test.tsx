// @vitest-environment jsdom
/* A WINDOW OPEN AT A PICK (batch 1's second half, the plan docs/superpowers/plans/2026-11-22-multi-sqn-b1-second-half.md
   §16 D2, §9 F7; his D2323 — the approved drawings docs/mock/2026-11-22-msq-b1-screens/img/f7a-*.png (a Leave War window)
   and f7b-*.png (an Input window), words as drawn). Saber, on 142's pages with a window open, picks 149 in the Schedules
   menu: the window stays, held, its band reading "This is 142's. You picked 149 — close this to go on." — no longer "This
   change could not be saved.", which said a change had failed when nothing was tried — and every control under the band
   greyed and dead, the window's ✕ and the band's Close still working. Picking 142 again gives the window back as it was.
   His own move at midnight keeps its own words and live controls (ui/msq-fix-sched-windows-midnight.test.tsx).
   Red first: before the change the band read the generic words and nothing was greyed. */
import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
import { createRoot, type Root } from 'react-dom/client'
import { useState } from 'react'
import { useMsqWorld, signInAs, ACCT, PID } from '../test-support/msq-world'
import { saveAccess, signIn, sessionFor } from '../state/accounts'
import { setSession, SESSION } from '../state/auth'
import { setGrant } from '../state/units'
import { pickSquadron } from '../state/pick'
import { notify, switchRoleView } from '../state/store'
import { UNIT } from '../engine/unitview'
import { worldUnit } from '../leavewar/state/store'
import { Sheet } from '../leavewar/ui/Sheet'
import { InputEditor } from './InputWindow'
import { newInputSeed } from './inputedit'
import { INPEDIT, setInpEdit } from './pops'
import { setPage, setInpView, CURPAGE } from '../state/view'
import { pageOffered } from '../state/perms'
import { INPUTS } from '../engine/inputs'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

useMsqWorld()
afterEach(() => cleanup())

const LEAD = "This is 142's."
const REST = 'You picked 149 — close this to go on.'
const dead = (el: Element | null) => !!el && !!el.closest('[inert]')
const greyed = (el: Element | null) => !!el && !!el.closest('[data-heldro]')

describe('an open Leave War window (the drawing f7a)', () => {
  function BidWindow() {
    const [open, setOpen] = useState(true)
    if (!open) return null
    return (
      <Sheet testid="bid-sheet" label="Ranger" onClose={() => setOpen(false)}>
        <div className="bidsheet-hd"><b>Ranger</b> Wed 15 Jul<button type="button" aria-label="Close Ranger" onClick={() => setOpen(false)}>✕</button></div>
        <textarea data-testid="remarks" defaultValue="Back Sunday" />
        <button type="button" data-testid="save">Save</button>
      </Sheet>
    )
  }
  it('picking 149: held on 142\'s war, the band\'s words, its controls greyed and dead, ✕ and Close live', () => {
    signInAs('saber')
    render(<BidWindow />)
    act(() => { void pickSquadron('u149') })
    expect(UNIT).toBe('u149')
    expect(worldUnit(), 'the war held by the open window').toBe('u142')
    const band = screen.getByTestId('move-band')
    expect(band.querySelector('b')!.textContent).toBe(LEAD)
    expect(band.querySelector('.sv-rest')!.textContent).toBe(REST)
    expect(dead(screen.getByTestId('remarks')) && greyed(screen.getByTestId('remarks'))).toBe(true)
    expect(dead(screen.getByTestId('save')) && greyed(screen.getByTestId('save'))).toBe(true)
    expect((screen.getByTestId('remarks') as HTMLTextAreaElement).value, 'his words stay in view').toBe('Back Sunday')
    expect(dead(screen.getByRole('button', { name: 'Close Ranger' })), 'the ✕ works').toBe(false)
    expect(dead(screen.getByRole('button', { name: 'Close' })), 'the band\'s Close works').toBe(false)
  })
  it('picking 142 again gives the window back as it was', () => {
    signInAs('saber')
    render(<BidWindow />)
    act(() => { void pickSquadron('u149') })
    act(() => { void pickSquadron('u142') })
    expect(screen.queryByTestId('move-band')).toBeNull()
    expect(dead(screen.getByTestId('save'))).toBe(false)
    expect(greyed(screen.getByTestId('remarks'))).toBe(false)
  })
  it('(control) a Plan lowered under a window on the squadron he picked: not a pick\'s words — the generic band, nothing greyed', () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
    signInAs('hunter')
    act(() => { void pickSquadron('u149') })
    expect(worldUnit()).toBe('u149')
    render(<BidWindow />)
    const mine = SESSION
    setSession(sessionFor(signIn('ad', 'a')))
    expect(setGrant(ACCT.hunter, 'u149', 'view', PID.hunter)).toMatchObject({ ok: true })
    setSession(mine)
    act(() => { notify() })
    const band = screen.getByTestId('move-band')
    expect(band.querySelector('b')!.textContent).toBe('This change could not be saved.')
    expect(dead(screen.getByTestId('save'))).toBe(false)
  })
  it('Close closes it, and 149\'s war loads', async () => {
    signInAs('saber')
    render(<BidWindow />)
    act(() => { void pickSquadron('u149') })
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    await act(async () => { await Promise.resolve(); await Promise.resolve() })
    expect(screen.queryByTestId('bid-sheet')).toBeNull()
    expect(worldUnit()).toBe('u149')
  })
  /* The fix rounds' read of 23 Nov 26 (Astra 1, the fresh Opus reader's 1 — docs/superpowers/briefs/
     2026-11-23-msq-view-only-fixread-*.md), a repeat of the earlier Opus F1: a View holder's own pages and his war stay
     142's at a pick of 149, so no band was up — and the close of his window told the page only while a band was up, so
     the landing it held (D2381) never ran: he stayed on the Leave War with 149 in view. No notify() after the close here:
     the window's own going must be what runs the landing. Red first. */
  const viewHolderOnWar = () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'view' } })).toBeNull()
    signInAs('hunter')
    act(() => { setPage('leavewar'); notify() })
    render(<BidWindow />)
    act(() => { void pickSquadron('u149') })
    expect(UNIT).toBe('u149')
    expect(pageOffered('leavewar'), 'the premise: 149 is View only').toBe(false)
    expect(CURPAGE, 'held while the window is up').toBe('leavewar')
  }
  const settle = async () => { await act(async () => { await Promise.resolve(); await Promise.resolve() }) }
  it('a View holder picks 149 with his window open: its ✕ closes it and he lands on 149\'s View-only Sched', async () => {
    viewHolderOnWar()
    fireEvent.click(screen.getByRole('button', { name: 'Close Ranger' }))
    await settle()
    expect(screen.queryByTestId('bid-sheet'), 'the window closed').toBeNull()
    expect(CURPAGE, 'the landing ran once the window closed').toBe('viewsched')
    expect(worldUnit(), 'his own war stays 142\'s').toBe('u142')
  })
  it('…and with two windows open the landing waits for the last', async () => {
    viewHolderOnWar()
    const second = render(<BidWindow />)
    second.unmount()
    await settle()
    expect(CURPAGE, 'one window still open: held').toBe('leavewar')
    fireEvent.click(screen.getByRole('button', { name: 'Close Ranger' }))
    await settle()
    expect(CURPAGE).toBe('viewsched')
  })
  /* its twin (D2323): that window, left open over a squadron he only views, is held as every window open at a pick is —
     the pick's band, its controls greyed and dead, ✕ and Close live; the band's Close lands him too; 142 picked again
     gives it back. Before, it stood live under 149's number with no band. Red first. */
  it('a View holder\'s window at a pick of 149 wears the pick\'s band, greyed; Close lands him; 142 gives it back', async () => {
    viewHolderOnWar()
    const band = screen.getByTestId('move-band')
    expect(band.querySelector('b')!.textContent).toBe(LEAD)
    expect(band.querySelector('.sv-rest')!.textContent).toBe(REST)
    expect(dead(screen.getByTestId('save')) && greyed(screen.getByTestId('save'))).toBe(true)
    expect(dead(screen.getByRole('button', { name: 'Close Ranger' })), 'the ✕ works').toBe(false)
    act(() => { void pickSquadron('u142') })
    expect(screen.queryByTestId('move-band'), '142 picked again: the window as it was').toBeNull()
    expect(dead(screen.getByTestId('save'))).toBe(false)
    act(() => { void pickSquadron('u149') })
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    await settle()
    expect(screen.queryByTestId('bid-sheet')).toBeNull()
    expect(CURPAGE).toBe('viewsched')
  })
})

describe('an open Input window on Inputs (the drawing f7b)', () => {
  let host: HTMLDivElement, root: Root
  const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
  beforeEach(() => { host = document.createElement('div'); document.body.append(host); root = createRoot(host) })
  afterEach(async () => { await act(async () => { root.unmount(); setInpEdit(null) }); host.remove() })
  const openNew = async () => {
    setPage('inputs'); setInpView('cal')
    await act(async () => { root.render(<InputEditor />) })
    await act(async () => { setInpEdit({ ...newInputSeed('2026-07-20'), remarks: 'PICKF7B' }); notify() })
  }
  /* Fable's read of 23 Nov 26, finding 1 (docs/superpowers/briefs/2026-11-23-msq-view-only-read-fable.md): an existing
     input's window opened on Inputs, then the page landed on View-only Sched (D2381) — the window judged its squadron by
     the page now in view (149's schedule) and came back live over it. Red first. */
  it('Fable 1: an input window opened on 149\'s Inputs stays held through the member view\'s landing on View-only Sched', async () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
    signInAs('hunter')
    await act(async () => { await pickSquadron('u149') })
    setPage('inputs'); setInpView('cal')
    await act(async () => { root.render(<InputEditor />) })
    await act(async () => { setInpEdit(INPUTS[0]); notify() })
    expect($('[data-testid="inped-moveband"]'), 'no band while on 149\'s Inputs').toBeNull()
    await act(async () => { switchRoleView() })
    /* held, with the band — not a pick, so the generic band with nothing greyed, as for a Plan lowered (the control test
       below); the gate refuses its saves */
    expect($('[data-testid="inped-moveband"]'), 'the window held, with its band').not.toBeNull()
    await act(async () => { switchRoleView() })
  })
  /* The fix rounds' read of 23 Nov 26 (the fresh Opus reader's 2), a repeat of Fable 1 above, brought by its fix: a VIEW
     holder's own pages never leave 142, so his Inputs window, carried by the landing over 149's View-only Sched, judged
     itself not held — no band, Save and Delete live over a squadron he only views. Held as any window open at a pick
     (D2323): the pick's band, every control greyed and dead, ✕ and Close live; 142 picked again gives it back. Red first. */
  it('a View holder picks 149 with an input window open on his Inputs: held over 149\'s View-only Sched, the pick\'s band, greyed', async () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'view' } })).toBeNull()
    signInAs('hunter')
    setPage('inputs'); setInpView('cal')
    await act(async () => { root.render(<InputEditor />) })
    await act(async () => { setInpEdit(INPUTS[0]); notify() })
    expect($('[data-testid="inped-moveband"]'), 'no band on his own Inputs').toBeNull()
    await act(async () => { await pickSquadron('u149') })
    expect(UNIT).toBe('u149')
    expect(CURPAGE, 'landed on 149\'s View-only Sched').toBe('viewsched')
    expect($('.inpedbox'), 'the window still open over View-only Sched').not.toBeNull()
    const band = $('[data-testid="inped-moveband"]')
    expect(band, 'the window held, with its band').not.toBeNull()
    expect(band!.querySelector('b')!.textContent).toBe(LEAD)
    expect(band!.querySelector('.sv-rest')!.textContent).toBe(REST)
    expect(dead($('#inpEditSave')) && greyed($('#inpEditSave')), 'Save greyed and dead').toBe(true)
    expect(dead(band!.querySelector('button')), 'Close works').toBe(false)
    const before = JSON.stringify(INPUTS[0])
    await act(async () => { $('#inpEditSave')!.click() })
    expect(JSON.stringify(INPUTS[0]), 'nothing saved').toBe(before)
    await act(async () => { await pickSquadron('u142') })
    expect($('[data-testid="inped-moveband"]'), '142 picked again: the window as it was').toBeNull()
    expect(dead($('#inpEditSave'))).toBe(false)
  })
  it('picking 149: the band\'s words, every control greyed and dead, Add saves nothing; ✕ and Close live; 142 gives it back', async () => {
    signInAs('saber')
    await openNew()
    expect($('[data-testid="inped-moveband"]'), 'no band before the pick').toBeNull()
    await act(async () => { await pickSquadron('u149') })
    expect(UNIT).toBe('u149')
    const band = $('[data-testid="inped-moveband"]')!
    expect(band.querySelector('b')!.textContent).toBe(LEAD)
    expect(band.querySelector('.sv-rest')!.textContent).toBe(REST)
    for (const sel of ['#inpEditSave', '#inpEditRmk']) {
      expect(dead($(sel)), `${sel} dead`).toBe(true)
      expect(greyed($(sel)), `${sel} greyed`).toBe(true)
    }
    expect(($('#inpEditRmk') as HTMLInputElement).value, 'his words stay in view').toBe('PICKF7B')
    const n = INPUTS.length
    await act(async () => { $('#inpEditSave')!.click() })
    expect(INPUTS.length, 'nothing saved').toBe(n)
    expect($('[data-testid="win-inputedit-x"]'), 'the window\'s ✕').toBeTruthy()
    expect(dead($('[data-testid="win-inputedit-x"]')), 'the ✕ works').toBe(false)
    expect(band.querySelector('button'), 'the band\'s Close').toBeTruthy()
    expect(dead(band.querySelector('button')), 'Close works').toBe(false)
    await act(async () => { await pickSquadron('u142') })
    expect($('[data-testid="inped-moveband"]')).toBeNull()
    expect(dead($('#inpEditSave'))).toBe(false)
    await act(async () => { await pickSquadron('u149') })
    await act(async () => { ($('[data-testid="inped-moveband"]')!.querySelector('button') as HTMLElement).click() })
    expect(INPEDIT, 'Close closes the window').toBeNull()
  })
})
