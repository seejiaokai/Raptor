// @vitest-environment jsdom
/* A HELD INPUT WINDOW (the night of 24 Nov 26, the fix list's item 7 — the walk's F3; his D2389, the drawing
   docs/mock/2026-11-24-msq-new-words/img/i1-desk-input-window.png). Hunter on 149's Inputs opens another man's input, types
   a remark and presses his role chip: the window is held, its band saying "Switch back to the admin view to change this,
   or close it." The window's shade stood over the chip, so the way back could not be pressed or reached by Tab, and a
   press there closed the window and lost his words. The chip stays pressable while so held, and the form keeps the PERSON
   line and the note it had.
   And the security read's lead: React taking its own `inert` off a part the hold had locked left that part live under
   the grey band (ui/heldro.ts). */
import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import { act, fireEvent } from '@testing-library/react'
import { createRoot, type Root } from 'react-dom/client'
import { useMsqWorld, signInAs, ACCT } from '../test-support/msq-world'
import { saveAccess } from '../state/accounts'
import { pickSquadron } from '../state/pick'
import { notify, switchRoleView } from '../state/store'
import { isAdmin } from '../state/perms'
import { InputEditor } from './InputWindow'
import { INPEDIT, setInpEdit } from './pops'
import { setPage, setInpView, CURPAGE } from '../state/view'
import { PEOPLE } from '../engine/people'
import { INPUTS } from '../engine/inputs'
import { holdReadOnly } from './heldro'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

useMsqWorld()
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const dead = (el: Element | null) => !!el && !!el.closest('[inert]')

describe('an Input window held by the switch to the member view', () => {
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
    await act(async () => { switchRoleView() })
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

describe('the hold\'s lock (ui/heldro.ts)', () => {
  it('a part locked by the hold stays locked when its own window takes its `inert` off', async () => {
    const root = document.createElement('div')
    root.innerHTML = '<div class="live">x</div><div class="form"><input id="f"></div>'
    document.body.append(root)
    const undo = holdReadOnly(root, '.live')
    const form = root.querySelector('.form')!
    expect(form.hasAttribute('inert')).toBe(true)
    form.removeAttribute('inert')   /* as React does when the form's own read-only state turns off */
    await new Promise(r => setTimeout(r, 0))
    expect(form.hasAttribute('inert'), 'locked again').toBe(true)
    undo()
    expect(form.hasAttribute('inert'), 'the undo still frees it').toBe(false)
    root.remove()
  })
})
