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
import { worldUnit, getState } from '../leavewar/state/store'
import { Sheet } from '../leavewar/ui/Sheet'
import { PersonWindow } from '../leavewar/ui/PersonWindow'
import { InputEditor } from './InputWindow'
import { newInputSeed, commitInputEdit, draftOf } from './inputedit'
import { INPEDIT, setInpEdit } from './pops'
import { setPage, setInpView, CURPAGE } from '../state/view'
import { pageOffered } from '../state/perms'
import { INPUTS } from '../engine/inputs'
import { globalUndo, globalRedo } from '../undo'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

useMsqWorld()
afterEach(() => cleanup())

const LEAD = "This is 142's."
const REST = 'You picked 149 — close this to go on.'
const MV_LEAD = 'Member view.'
const MV_REST = 'Switch back to the admin view to change this, or close it.'
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
  /* HIS D2389, D2400 — the drawings docs/mock/2026-11-24-msq-new-words/img/w1-*.png: a Leave War window left open when an
     admin switches to the member view read "This change could not be saved." though nothing was tried, its controls live.
     It reads "Member view." and "Switch back to the admin view to change this, or close it.", greyed as D2323's is, Close
     and ✕ live. Red first. */
  describe('a Leave War window left open at the switch to the member view (D2389)', () => {
    const on149 = async () => {
      signInAs('saber')
      act(() => { setPage('leavewar'); void pickSquadron('u149') })
      expect(worldUnit(), 'the premise: 149\'s war').toBe('u149')
      render(<BidWindow />)
      expect(screen.queryByTestId('move-band'), 'no band on 149\'s own war').toBeNull()
      act(() => { switchRoleView() })
    }
    it('reads "Member view.", every control greyed and dead, ✕ and Close live', async () => {
      await on149()
      const band = screen.getByTestId('move-band')
      expect(band.querySelector('b')!.textContent).toBe(MV_LEAD)
      expect(band.querySelector('.sv-rest')!.textContent).toBe(MV_REST)
      expect(dead(screen.getByTestId('remarks')) && greyed(screen.getByTestId('remarks'))).toBe(true)
      expect(dead(screen.getByTestId('save')) && greyed(screen.getByTestId('save'))).toBe(true)
      expect((screen.getByTestId('remarks') as HTMLTextAreaElement).value, 'his words stay in view').toBe('Back Sunday')
      expect(dead(screen.getByRole('button', { name: 'Close Ranger' })), 'the ✕ works').toBe(false)
      expect(dead(screen.getByRole('button', { name: 'Close' })), 'the band\'s Close works').toBe(false)
    })
    it('the switch back to the admin view gives the window back as it was', async () => {
      await on149()
      act(() => { switchRoleView() })
      expect(screen.queryByTestId('move-band')).toBeNull()
      expect(dead(screen.getByTestId('save'))).toBe(false)
      expect(greyed(screen.getByTestId('remarks'))).toBe(false)
    })
    /* the drawing w1 draws the person window with its figure boxes, greyed: the member view's role would swap them for a
       member's plain figures under the band, and the switch back swap them again. Red first. */
    it('the person window keeps its figure boxes under the band, greyed and dead, as drawn', () => {
      signInAs('saber')
      act(() => { setPage('leavewar'); void pickSquadron('u149') })
      const man = getState().people.find(p => p.id === PID.kestrel)!
      render(<PersonWindow person={man} since={null} hasRow onClose={() => {}} onOil={() => {}} onGo={() => {}} />)
      const boxes = () => [...document.querySelectorAll<HTMLInputElement>('[data-testid="person-window"] input')]
      const had = boxes().length
      expect(had, 'an admin\'s boxes').toBeGreaterThan(0)
      act(() => { switchRoleView() })
      expect(screen.getByTestId('move-band').querySelector('b')!.textContent).toBe(MV_LEAD)
      expect(boxes().length, 'the same boxes under the band').toBe(had)
      expect(boxes().every(b => dead(b) && greyed(b)), 'each greyed and dead').toBe(true)
      act(() => { switchRoleView() })
      expect(boxes().length, 'back in the admin view').toBe(had)
      expect(boxes().some(b => dead(b))).toBe(false)
    })
    it('Close closes it', async () => {
      await on149()
      fireEvent.click(screen.getByRole('button', { name: 'Close' }))
      await act(async () => { await Promise.resolve(); await Promise.resolve() })
      expect(screen.queryByTestId('bid-sheet')).toBeNull()
    })
    it('(pin, D2323) in the member view, a pick that moves the page off the window still reads the pick\'s band', async () => {
      await on149()
      act(() => { void pickSquadron('u142') })
      const band = screen.getByTestId('move-band')
      expect(band.querySelector('b')!.textContent).toBe("This is 149's.")
      expect(band.querySelector('.sv-rest')!.textContent).toBe('You picked 142 — close this to go on.')
    })
    it('(control) his Plan lowered while he is in the member view: switching back would not give it back, so not these words', () => {
      signInAs('saber')
      expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
      signInAs('hunter')
      act(() => { setPage('leavewar'); void pickSquadron('u149') })
      render(<BidWindow />)
      act(() => { switchRoleView() })
      expect(screen.getByTestId('move-band').querySelector('b')!.textContent).toBe(MV_LEAD)
      const mine = SESSION
      setSession(sessionFor(signIn('ad', 'a')))
      expect(setGrant(ACCT.hunter, 'u149', 'view', PID.hunter)).toMatchObject({ ok: true })
      setSession(mine)
      act(() => { notify() })
      expect(screen.getByTestId('move-band').querySelector('b')!.textContent).toBe('This change could not be saved.')
    })
    it('(pin) an admin on his own squadron switching to the member view: no hold, no band, as today', () => {
      signInAs('saber')
      act(() => { setPage('leavewar'); notify() })
      render(<BidWindow />)
      act(() => { switchRoleView() })
      expect(screen.queryByTestId('move-band')).toBeNull()
      expect(dead(screen.getByTestId('save'))).toBe(false)
    })
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
    /* held, with his D2389's band (below): "Member view.", greyed as a window held at a pick is */
    expect($('[data-testid="inped-moveband"]'), 'the window held, with its band').not.toBeNull()
    await act(async () => { switchRoleView() })
  })
  /* HIS D2389, D2400 — the drawings docs/mock/2026-11-24-msq-new-words/img/i1-*.png: an Input window left open when an admin
     switches to the member view read "This change could not be saved." though nothing was tried, its controls live. It
     reads "Member view." and "Switch back to the admin view to change this, or close it.", greyed as D2323's is, Close and
     ✕ live; the switch back gives the window back. Red first. */
  it('the member view over an Input window on 149: its words, every control greyed and dead, Close live, the switch back gives it back', async () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
    signInAs('hunter')
    await act(async () => { await pickSquadron('u149') })
    setPage('inputs'); setInpView('cal')
    await act(async () => { root.render(<InputEditor />) })
    await act(async () => { setInpEdit(INPUTS[0]); notify() })
    await act(async () => { switchRoleView() })
    const band = $('[data-testid="inped-moveband"]')
    expect(band!.querySelector('b')!.textContent).toBe(MV_LEAD)
    expect(band!.querySelector('.sv-rest')!.textContent).toBe(MV_REST)
    /* the window keeps the form he had, as drawn — every box and Save and Delete there, greyed — not a member's plainer
       read-only form of another man's input */
    const box = $('.inpedbox input, .inpedbox select, .inpedbox textarea')
    expect(dead(box) && greyed(box), 'the form greyed and dead').toBe(true)
    expect(dead($('#inpEditSave')) && greyed($('#inpEditSave')), 'Save greyed and dead').toBe(true)
    expect(dead($('#inpEditDel')) && greyed($('#inpEditDel')), 'Delete greyed and dead').toBe(true)
    expect(dead(band!.querySelector('button')), 'Close works').toBe(false)
    const before = JSON.stringify(INPUTS[0])
    await act(async () => { $('#inpEditSave')!.click(); $('#inpEditDel')!.click() })
    expect(JSON.stringify(INPUTS[0]), 'nothing saved or deleted').toBe(before)
    await act(async () => { switchRoleView() })
    expect($('[data-testid="inped-moveband"]'), 'back in the admin view: the window as it was').toBeNull()
    expect(dead($('#inpEditSave'))).toBe(false)
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
  /* The second fix round's fresh Opus read (23 Nov 26), the third time a held input window came back live (D2233): the
     window took its "opened on" note afresh whenever its record became a new OBJECT — and an Undo, a Redo and a refused
     command all put the list back as new objects, which the window follows — so the fresh note read the squadron in view
     now and both holds were forgotten. The note now stays for as long as the window shows the same input. Red first. */
  const heldPlan = async () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
    signInAs('hunter')
    setPage('inputs'); setInpView('cal')
    await act(async () => { root.render(<InputEditor />) })
    /* one change of his own on 142's Inputs, so Undo has a step */
    const iid0 = INPUTS[0].iid
    await act(async () => { expect(commitInputEdit(INPUTS[0], { ...draftOf(INPUTS[0]), remarks: 'PROBE-UNDO' })).toBe(true); notify() })
    await act(async () => { setInpEdit(INPUTS.find((x: any) => x.iid === iid0)); notify() })
    expect($('[data-testid="inped-moveband"]')).toBeNull()
    await act(async () => { await pickSquadron('u149') })
    expect(UNIT).toBe('u149')
    expect(CURPAGE, 'Full access: Inputs is offered, the page stays').toBe('inputs')
    expect($('[data-testid="inped-moveband"]'), 'held at the pick').not.toBeNull()
  }
  const stillHeld = (when: string) => {
    expect($('.inpedbox'), `the window still open ${when}`).not.toBeNull()
    const sv = $('#inpEditSave')
    expect([dead(sv), greyed(sv)], `Save dead and greyed ${when}`).toEqual([true, true])
    const band = $('[data-testid="inped-moveband"]')
    expect(band, `still held ${when}`).not.toBeNull()
    expect(band!.querySelector('b')!.textContent).toBe(LEAD)
  }
  it('a Plan holder\'s window held at a pick of 149 stays held through an Undo and a Redo; 142 picked again gives it back', async () => {
    await heldPlan()
    const before = INPEDIT
    await act(async () => { globalUndo(); notify() })
    await act(async () => { notify() })
    expect([CURPAGE, UNIT, INPEDIT !== before, INPUTS.some((x: any) => x.remarks === 'PROBE-UNDO')], 'after the Undo: page, unit, record replaced, change gone').toEqual(['inputs', 'u149', true, false])
    stillHeld('after the Undo')
    const mid = INPEDIT
    await act(async () => { globalRedo(); notify() })
    await act(async () => { notify() })
    expect([INPEDIT !== mid, INPUTS.some((x: any) => x.remarks === 'PROBE-UNDO')], 'after the Redo: record replaced, change back').toEqual([true, true])
    stillHeld('after the Redo')
    await act(async () => { await pickSquadron('u142') })
    expect($('[data-testid="inped-moveband"]'), '142 picked again: the window as it was').toBeNull()
    expect(dead($('#inpEditSave'))).toBe(false)
  })
  it('a View holder\'s window held over 149\'s View-only Sched stays held when its record is put back as a new object', async () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'view' } })).toBeNull()
    signInAs('hunter')
    setPage('inputs'); setInpView('cal')
    await act(async () => { root.render(<InputEditor />) })
    await act(async () => { setInpEdit(INPUTS[0]); notify() })
    await act(async () => { await pickSquadron('u149') })
    expect(CURPAGE).toBe('viewsched')
    expect($('[data-testid="inped-moveband"]'), 'held after the pick').not.toBeNull()
    /* a refused command or an Undo puts the list back as new objects (InputWindow.tsx "the record behind the window") */
    await act(async () => { INPUTS[0] = { ...INPUTS[0] }; notify() })
    await act(async () => { notify() })
    stillHeld('after its record is found again')
  })
  /* the same cause by another door: another input asked for over unsaved words is the window's record for one paint,
     then the first is put back (InputWindow.tsx "one editor at a time") — and the note was taken afresh both times */
  it('another input asked for over the held window\'s unsaved words: the window keeps the first, and stays held', async () => {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
    signInAs('hunter')
    setPage('inputs'); setInpView('cal')
    await act(async () => { root.render(<InputEditor />) })
    await act(async () => { setInpEdit(INPUTS[0]); notify() })
    await act(async () => { fireEvent.change($('#inpEditRmk')!, { target: { value: 'UNSAVED-WORDS' } }) })
    await act(async () => { await pickSquadron('u149') })
    expect($('[data-testid="inped-moveband"]'), 'held at the pick').not.toBeNull()
    const first = INPEDIT
    await act(async () => { setInpEdit(INPUTS[1]); notify() })
    await act(async () => { notify() })
    expect(INPEDIT, 'the window keeps the first input').toBe(first)
    stillHeld('after the other input was asked for')
  })
  it('(control) a different input opened in the held window takes a fresh note: not held', async () => {
    await heldPlan()
    const first = INPEDIT
    const other = INPUTS.find((x: any) => x.iid !== first.iid)
    await act(async () => { setInpEdit(other); notify() })
    await act(async () => { notify() })
    expect(INPEDIT).toBe(other)
    expect($('[data-testid="inped-moveband"]'), 'a different input: judged afresh').toBeNull()
    /* …and the first, opened again, is judged afresh too — its old note went when the other was taken up */
    await act(async () => { setInpEdit(INPUTS.find((x: any) => x.iid === first.iid)); notify() })
    await act(async () => { notify() })
    expect($('[data-testid="inped-moveband"]')).toBeNull()
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
