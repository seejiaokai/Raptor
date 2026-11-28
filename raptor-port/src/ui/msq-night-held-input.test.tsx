// @vitest-environment jsdom
/* A HELD INPUT WINDOW (the night of 24 Nov 26, the fix list's item 7 — the walk's F3; his D2389, the drawing
   docs/mock/2026-11-24-msq-new-words/img/i1-desk-input-window.png). Hunter on 149's Inputs opens another man's input, types
   a remark and presses his role chip: the window is held, its band saying "Switch back to the admin view to change this,
   or close it." The window's shade stood over the chip, so the way back could not be pressed or reached by Tab, and a
   press there closed the window and lost his words. The chip stays pressable while so held, and the form keeps the PERSON
   line and the note it had.
   And the security read's lead, pressed on the real window: held by a pick, through the member view and back, nothing
   under the band comes live (it did not reproduce; this pins it). */
import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import { act, fireEvent } from '@testing-library/react'
import { createRoot, type Root } from 'react-dom/client'
import { useMsqWorld, signInAs, ACCT } from '../test-support/msq-world'
import { saveAccess } from '../state/accounts'
import { pickSquadron } from '../state/pick'
import { notify, switchRoleViewRaw } from '../state/store'
import { rawEnter } from '../test-support/raw-entry'
import { isAdmin } from '../state/perms'
import { InputEditor } from './InputWindow'
import { INPEDIT, setInpEdit } from './pops'
import { setPage, setInpView, CURPAGE } from '../state/view'
import { PEOPLE } from '../engine/people'
import { INPUTS } from '../engine/inputs'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

useMsqWorld()
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const dead = (el: Element | null) => !!el && !!el.closest('[inert]')

/* STEP K5 (his D2403, D2590): the switch to the member view now asks the guard first, so an Input window open at it refuses
   it and the window the member view holds is reached by no press. It is made by the raw switch (state/store.ts
   switchRoleViewRaw — the switch as it was, asking nothing), named so; the chip is still pressed for real: it is the held
   window's own way back, and its press leaves the Input window out of the guard's count (the plan §4.1 row 5) */
describe('an Input window held by the switch to the member view — reached by no press since D2403 (step K5: the switch is refused while a window is open), so by the raw switch; removed with the band in Build 2', () => {
  let host: HTMLDivElement, root: Root, chip: HTMLButtonElement
  beforeEach(() => {
    host = document.createElement('div'); document.body.append(host); root = createRoot(host)
    /* the top bar's role chip, where Shell draws it */
    chip = document.createElement('button'); chip.id = 'roleBadge'; chip.className = 'abtn rolechip tgl'; chip.textContent = 'HUNTER · MEMBER'
    chip.getBoundingClientRect = () => ({ left: 1360, top: 14, right: 1520, bottom: 42, width: 160, height: 28, x: 1360, y: 14, toJSON() { return {} } }) as DOMRect
    document.body.append(chip)
  })
  afterEach(async () => { await act(async () => { root.unmount(); setInpEdit(null) }); host.remove(); chip.remove() })

  async function held() {
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
    signInAs('hunter')
    await act(async () => { await pickSquadron('u149') })
    setPage('inputs'); setInpView('cal')
    await act(async () => { root.render(<InputEditor />) })
    const other = INPUTS.find((x: any) => x.person && PEOPLE[x.person] && x.person !== 'prowler')!
    await act(async () => { setInpEdit(other); notify() })
    await act(async () => { fireEvent.change($('#inpEditRmk')!, { target: { value: 'H5 typed words' } }) })
    await act(async () => { switchRoleViewRaw() })
    expect(CURPAGE, 'the premise: the switch lands on View-only Sched').toBe('viewsched')
    expect($('[data-testid="inped-moveband"]'), 'the premise: held, with its band').not.toBeNull()
    return other
  }

  it('the way back stands over the shade at the chip\'s own place, live, in the Tab order, and gives the form back with his words', async () => {
    await held()
    const way = $('.airpop [data-testid="inped-rolechip"]')
    expect(way, 'the chip can be pressed above the shade').not.toBeNull()
    expect(way!.textContent).toBe('HUNTER · MEMBER')
    expect(way!.style.position).toBe('fixed')
    expect([way!.style.left, way!.style.top, way!.style.width]).toEqual(['1360px', '14px', '160px'])
    expect(dead(way), 'not under the hold\'s lock').toBe(false)
    expect((way as HTMLButtonElement).tabIndex, 'Tab reaches it').toBe(0)
    await act(async () => { way!.click() })
    expect(isAdmin(), 'back in the admin view').toBe(true)
    expect(INPEDIT, 'the window stays').toBeTruthy()
    expect($('[data-testid="inped-moveband"]')).toBeNull()
    expect(($('#inpEditRmk') as HTMLInputElement).value, 'his words are there').toBe('H5 typed words')
    expect(dead($('#inpEditRmk')), 'and live again').toBe(false)
    expect($('[data-testid="inped-rolechip"]'), 'nothing extra once the hold is over').toBeNull()
  })

  it('the form keeps its PERSON line and the note it had, as drawn', async () => {
    const other = await held()
    const person = $('#inpEditPerson') as HTMLSelectElement | null
    expect(person, 'the drawn PERSON line').not.toBeNull()
    expect(person!.value).toBe(other.person)
    expect(dead(person), 'greyed and dead under the band').toBe(true)
    expect($('.inped-hint')?.textContent).toBe('The dates are changed on the Inputs page.')
  })
})

describe('a window held by a pick, through the member view and back (the security read\'s lead)', () => {
  it.each(['hunter', 'saber'] as const)('%s: its boxes and its Document button stay locked under the band — the pick\'s hold reached by no press since D2403 (step K4: a pick is refused while a window is open), so by the raw entry, and the member view and back by the raw switch (step K5: the switch is refused while a window is open); removed with the band in Build 2', async who => {
    const host = document.createElement('div'); document.body.append(host)
    const root = createRoot(host)
    signInAs('saber')
    expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
    signInAs(who)
    setPage('inputs'); setInpView('cal')
    await act(async () => { root.render(<InputEditor />) })
    const other = INPUTS.find((x: any) => x.person && PEOPLE[x.person] && x.person !== 'prowler' && x.person !== 'stiff' && (x.unit == null || x.unit === 'u142'))!
    await act(async () => { setInpEdit(other); notify() })
    expect($('.inped-body')?.hasAttribute('inert'), 'the premise: he may change it, before the pick').toBe(false)
    /* (the raw entry the pick runs — state/store.ts enterSquadron, by pick: since K4 the pick's own door refuses this press;
       through the test kit's raw entry since K7, which tells the entry checker it is made on purpose) */
    await act(async () => { rawEnter('u149'); notify() })
    expect($('[data-testid="inped-moveband"]'), 'the premise: held by the pick').not.toBeNull()
    await act(async () => { switchRoleViewRaw() })
    await act(async () => { switchRoleViewRaw() })
    await act(async () => { await new Promise(r => setTimeout(r, 0)) })
    expect($('[data-testid="inped-moveband"]'), 'still held').not.toBeNull()
    const body = $('.inped-body')!
    expect(dead(body), 'the form is locked').toBe(true)
    for (const el of body.querySelectorAll('input, select, textarea, button')) expect(dead(el), 'no box or button live under the band').toBe(true)
    await act(async () => { root.unmount(); setInpEdit(null) }); host.remove()
  })
})

