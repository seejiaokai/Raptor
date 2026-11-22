// @vitest-environment jsdom
/* F3 OF THE SECOND HALF'S WALK (docs/handpass/2026-11-23-msq-b1-second-half.md §15): an Undo or Redo of "+ New
   squadron" pressed on Admin → Squadrons moved Admin to the Users panel, so the squadron's going (or coming back) was
   out of sight. The Undo's landing (state/undo-wire.ts landingOf) asked for Admin → Users for every squadron row; a
   step of squadrons and places — the Squadrons panel's — now leaves an Admin page that is up on the panel he is on.
   An account's step still opens Users (where it shows). Red first: before the fix the Users panel came up. */
import { describe, it, expect, afterEach } from 'vitest'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { useMsqWorld, signInAs, ACCT } from '../test-support/msq-world'
import { addUnit, placeOfOn, todayIso, units, unitsLoad } from '../state/units'
import { saveAccess } from '../state/accounts'
import { setPage } from '../state/view'
import { notify } from '../state/store'
import { globalUndo, globalRedo } from '../undo/timeline'
import { AdminPage } from './AdminPage'

useMsqWorld()
afterEach(() => cleanup())

function adminOn(label: RegExp) {
  act(() => { setPage('admin'); notify() })
  const page = render(<AdminPage />)
  const c = page.container
  const cat = [...c.querySelectorAll('button.adm-cat')].find(b => label.test(b.textContent || '')) as HTMLElement
  act(() => { fireEvent.click(cat) })
  const on = () => (c.querySelector('section.adm-panel.on') as HTMLElement | null)?.id
  return { c, on }
}

describe('an Undo or Redo of "+ New squadron" on Admin → Squadrons stays on Squadrons (F3)', () => {
  it('Saber makes 150, then Undo, then Redo: the Squadrons panel stays up each time', async () => {
    signInAs('saber')
    const a = adminOn(/Squadrons/)
    expect(a.on()).toBe('admSquadrons')
    await act(async () => { expect(addUnit('150', placeOfOn('u142', todayIso())!.id, ACCT.hunter)).toMatchObject({ ok: true }); notify() })
    expect(a.on()).toBe('admSquadrons')
    await act(async () => { expect(globalUndo().ok).toBe(true); notify() })
    unitsLoad()
    expect(units().some(u => u.num === '150'), 'the Undo took 150 away').toBe(false)
    expect(a.on(), 'after the Undo').toBe('admSquadrons')
    await act(async () => { expect(globalRedo().ok).toBe(true); notify() })
    unitsLoad()
    expect(units().some(u => u.num === '150'), 'the Redo put 150 back').toBe(true)
    expect(a.on(), 'after the Redo').toBe('admSquadrons')
  })
  it('an account\'s step undone from the Squadrons panel still opens Users, where it shows', async () => {
    signInAs('saber')
    const a = adminOn(/Squadrons/)
    await act(async () => { expect(saveAccess(ACCT.hunter, { grants: { u149: 'view' } })).toBeNull(); notify() })
    await act(async () => { expect(globalUndo().ok).toBe(true); notify() })
    expect(a.on()).toBe('admUsers')
  })
})
