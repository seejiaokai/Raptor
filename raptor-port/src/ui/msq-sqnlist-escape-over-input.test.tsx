// @vitest-environment jsdom
/* ESCAPE WITH THE SQUADRON LIST OPEN OVER AN INPUT'S WINDOW CLOSES THE LIST, AND ONLY THE LIST (the night of 24 Nov 26, the
   re-walk's C2 — docs/handpass/2026-11-24-msq-night-check.md §15; the design guide §2: Escape closes what opened last).
   Saber on Inputs opens an input, then opens the top bar's squadron list over it and presses Escape:
   - with nothing typed, the WINDOW closed and the list stayed open;
   - with words typed, the window put up "Close it and lose them?" for a press meant for the list;
   - with that question already up, Escape answered it "Keep editing" and the list stayed open.
   Over the Calendar window and the Admin forms one Escape closes only the list. The window's own Escape listener ran
   beside the one Escape list (ui/sheetfocus.ts) and never asked whether something of that list had opened over it.
   Red first: each case above. */
import { describe, it, expect, afterEach, beforeEach } from 'vitest'
import { act, fireEvent } from '@testing-library/react'
import { createRoot, type Root } from 'react-dom/client'
import { useMsqWorld, signInAs } from '../test-support/msq-world'
import { notify } from '../state/store'
import { UNIT } from '../engine/unitview'
import { InputEditor } from './InputWindow'
import { SqnMark } from './topbits'
import { INPEDIT, setInpEdit } from './pops'
import { setPage, setInpView } from '../state/view'
import { PEOPLE } from '../engine/people'
import { INPUTS } from '../engine/inputs'
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

useMsqWorld()
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const esc = async () => { await act(async () => { fireEvent.keyDown(document.activeElement && document.activeElement !== document.body ? document.activeElement : document.body, { key: 'Escape' }) }) }

describe('Escape with the squadron list open over an Input window (C2)', () => {
  let host: HTMLDivElement, root: Root
  beforeEach(() => { host = document.createElement('div'); document.body.append(host); root = createRoot(host) })
  afterEach(async () => { await act(async () => { root.unmount(); setInpEdit(null) }); host.remove() })

  /* Saber (a master admin: the squadron list is his), 142's Inputs, one input's window open */
  async function windowOpen() {
    signInAs('saber')
    setPage('inputs'); setInpView('table')
    await act(async () => { root.render(<><div className="topbar"><SqnMark /></div><InputEditor /></>) })
    const first = INPUTS.find((x: any) => x.person && PEOPLE[x.person] && x.iid != null && (x.unit == null || x.unit === 'u142'))!
    await act(async () => { setInpEdit(first); notify() })
    expect($('#inpEditRmk'), 'the premise: the window is open on the Inputs page').not.toBeNull()
    return first
  }
  const openList = async () => {
    await act(async () => { $('#sqnMenuBtn')!.click() })
    expect($('#sqnMenu'), 'the premise: the squadron list is open').not.toBeNull()
  }

  it('nothing typed: one Escape closes the list and leaves the window; the next is the window\'s own', async () => {
    const first = await windowOpen()
    await openList()
    await esc()
    expect($('#sqnMenu'), 'the list closed').toBeNull()
    expect(INPEDIT?.iid, 'the window is still open').toBe(first.iid)
    await esc()
    expect(INPEDIT, 'the next Escape closes the window, as before').toBeNull()
    expect(UNIT, 'nothing was picked').toBe('u142')
  })

  it('words typed: one Escape closes the list and asks nothing; the next asks "Close it and lose them?"', async () => {
    const first = await windowOpen()
    await act(async () => { fireEvent.change($('#inpEditRmk')!, { target: { value: 'C2 typed words' } }) })
    await openList()
    await esc()
    expect($('#sqnMenu'), 'the list closed').toBeNull()
    expect($('[data-testid="inped-escask"]'), 'no question for a press meant for the list').toBeNull()
    expect(INPEDIT?.iid).toBe(first.iid)
    expect(($('#inpEditRmk') as HTMLInputElement).value, 'his words are kept').toBe('C2 typed words')
    await esc()
    expect($('[data-testid="inped-escask"]'), 'the next Escape is the window\'s own, and asks').not.toBeNull()
    expect(INPEDIT?.iid).toBe(first.iid)
  })

  it('the close question already up, then the list opened: Escape closes the list and the question stays', async () => {
    await windowOpen()
    await act(async () => { fireEvent.change($('#inpEditRmk')!, { target: { value: 'C2 typed words' } }) })
    await esc()
    expect($('[data-testid="inped-escask"]'), 'the premise: the question is up').not.toBeNull()
    await openList()
    await esc()
    expect($('#sqnMenu'), 'the list closed').toBeNull()
    expect($('[data-testid="inped-escask"]'), 'the question is still his to answer').not.toBeNull()
    await esc()
    expect($('[data-testid="inped-escask"]'), 'the next Escape answers it "Keep editing", as before').toBeNull()
    expect(INPEDIT, 'and the window stays').toBeTruthy()
  })

  it('(control) no list open: Escape is the window\'s own, as before', async () => {
    await windowOpen()
    await esc()
    expect(INPEDIT).toBeNull()
  })
})
