// @vitest-environment jsdom
/* THE "OPEN THE OTHER INPUT AND LOSE THEM?" QUESTION LEFT UP ACROSS A PICK (the night of 24 Nov 26, the re-walk's C1 —
   docs/handpass/2026-11-24-msq-night-check.md §15; his D2323). Saber on 142's Inputs types in one input's Remarks and
   presses another row: "This input has unsaved changes. Open …'s input and lose them?". With that up he picks 149. The
   first window is rightly held — but the question stayed, and "Discard and open" then took up the OTHER 142 input as the
   window's own, noted as opened on the squadron now in view (149): no band, every control live under a bar saying 149, its
   Save and Delete changing 142's record.
   The question is about an input of the squadron it was asked on: it goes with the pick, and no answer to it can open that
   input once the page shows another squadron. The window keeps the first input, held, his typed words in it.
   Red first: after "Discard and open" the other input stood in the window with no band. */
import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import { act, fireEvent } from '@testing-library/react'
import { createRoot, type Root } from 'react-dom/client'
import { useMsqWorld, signInAs } from '../test-support/msq-world'
import { pickSquadron } from '../state/pick'
import { notify } from '../state/store'
import { UNIT } from '../engine/unitview'
import { InputEditor } from './InputWindow'
import { INPEDIT, setInpEdit } from './pops'
import { setPage, setInpView } from '../state/view'
import { PEOPLE } from '../engine/people'
import { INPUTS } from '../engine/inputs'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

useMsqWorld()
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const dead = (el: Element | null) => !!el && !!el.closest('[inert]')
const LEAD = "This is 142's."

describe('the "open the other input and lose them?" question, up at a pick (C1)', () => {
  let host: HTMLDivElement, root: Root
  beforeEach(() => { host = document.createElement('div'); document.body.append(host); root = createRoot(host) })
  afterEach(async () => { await act(async () => { root.unmount(); setInpEdit(null) }); host.remove() })

  const of142 = () => INPUTS.filter((x: any) => x.person && PEOPLE[x.person] && x.iid != null && (x.unit == null || x.unit === 'u142'))
  /* Saber, 142's Inputs: the first input open with typed words, the second asked for — the question up */
  async function asked() {
    signInAs('saber')
    setPage('inputs'); setInpView('table')
    await act(async () => { root.render(<InputEditor />) })
    const [first, other] = of142()
    expect(first && other && first.iid !== other.iid, 'the premise: two inputs of 142').toBe(true)
    await act(async () => { setInpEdit(first); notify() })
    await act(async () => { fireEvent.change($('#inpEditRmk')!, { target: { value: 'C1 typed words' } }) })
    await act(async () => { setInpEdit(other); notify() })
    await act(async () => { notify() })
    expect($('[data-testid="inped-swap"]'), 'the premise: the question is up').not.toBeNull()
    expect(INPEDIT.iid, 'the premise: the window keeps the first').toBe(first.iid)
    return { first, other }
  }

  it('a pick of 149, then "Discard and open": the other 142 input never stands live under 149', async () => {
    const { first, other } = await asked()
    await act(async () => { await pickSquadron('u149') })
    expect(UNIT).toBe('u149')
    const go = $('[data-testid="inped-swap-go"]')
    if (go) await act(async () => { go.click() })
    await act(async () => { notify() })
    const liveOther = !!INPEDIT && INPEDIT.iid === other.iid && !$('[data-testid="inped-moveband"]')
    expect(liveOther, 'the other 142 input open with no band, under 149').toBe(false)
    /* the window as D2323 has a window left open across a pick: the first input, held, his words kept */
    expect(INPEDIT?.iid, 'the window keeps the first input').toBe(first.iid)
    const band = $('[data-testid="inped-moveband"]')
    expect(band, 'held, with its band').not.toBeNull()
    expect(band!.querySelector('b')!.textContent).toBe(LEAD)
    expect(($('#inpEditRmk') as HTMLInputElement).value, 'his typed words are kept').toBe('C1 typed words')
    expect(dead($('#inpEditSave')), 'Save dead under the band').toBe(true)
    expect($('[data-testid="inped-swap"]'), 'the question went with the pick').toBeNull()
  })

  it('…and 142 picked again gives the first window back as it was, the question not coming back by itself', async () => {
    const { first } = await asked()
    await act(async () => { await pickSquadron('u149') })
    await act(async () => { await pickSquadron('u142') })
    await act(async () => { notify() })
    expect($('[data-testid="inped-moveband"]')).toBeNull()
    expect(INPEDIT?.iid).toBe(first.iid)
    expect(($('#inpEditRmk') as HTMLInputElement).value).toBe('C1 typed words')
    expect(dead($('#inpEditSave'))).toBe(false)
    expect($('[data-testid="inped-swap"]')).toBeNull()
  })

  it('(control) no pick: "Discard and open" opens the other input as before', async () => {
    const { other } = await asked()
    await act(async () => { $('[data-testid="inped-swap-go"]')!.click() })
    await act(async () => { notify() })
    expect(INPEDIT?.iid).toBe(other.iid)
    expect($('[data-testid="inped-moveband"]')).toBeNull()
    expect(dead($('#inpEditSave'))).toBe(false)
  })
})
