// @vitest-environment jsdom
/* "SAVE THEM BEFORE SWITCHING TO 149?" TAKES THE KEYS ON THE TRACKER'S OWN TAB TOO (the night of 24 Nov 26, the re-walk's A1 —
   docs/handpass/2026-11-24-msq-night-check.md §15; the design guide §2: a question is answered without a mouse, and the
   keys go back to the button that raised it). On the Tracker tab, with an unsaved chart edit, he opens the squadron list
   by the keys and picks 149. The question came up — and the keys stayed on the squadron button behind it: Enter opened
   the list again over the question, and its three answers were sixteen Tabs away. Asked from any other page the question
   already took the keys, on Stay (tracker/TrackerPage.tsx TrkAskOnly); on its own tab nothing moved them.
   The keys go into the question, on its safe answer, wherever it is asked; answered, they are back on the button he
   pressed. The harness is tracker/msq-bell-input-ask.test.tsx's, the Tracker's tab on screen.
   Red first: the keys were on the squadron button. */
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { act, createElement } from 'react'
import { fireEvent } from '@testing-library/react'
import { createRoot, type Root } from 'react-dom/client'
import { useMsqWorld, signInAs, ACCT } from '../test-support/msq-world'
import * as core from './app/core.js'
import * as st from './storage.js'
import { TrackerPage } from './TrackerPage'
import { Whiteboard } from '../storage/whiteboard'
import { trackerTarget } from '../storage/adapters'
import { saveAccess } from '../state/accounts'
import { todayIso } from '../state/units'
import { pageUnit, setTrkUnitProbe } from '../state/perms'
import { notify } from '../state/store'
import { setPage } from '../state/view'
import { pickSquadron } from '../state/pick'
import { UNIT } from '../engine/unitview'
import { SqnMark } from '../ui/topbits'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const C: any = core
const S: any = st
const wb = new Whiteboard()
const tick = () => new Promise(r => setTimeout(r, 0))
const until = async (f: () => any) => { for (let i = 0; i < 800; i++) { if (f()) return; await tick() } throw new Error('timed out waiting') }
const settle = async () => { for (let i = 0; i < 4; i++) { await C.whenUnitSettled?.(); await C.whenLoaded(); await tick() } }
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null

let host: HTMLElement | null = null, root: Root | null = null
let barHost: HTMLElement | null = null, barRoot: Root | null = null
beforeAll(() => {
  S.setStorageMaker((u: string) => trackerTarget(wb, u), () => pageUnit('own', todayIso()))
  setTrkUnitProbe(() => S.storageUnit())
})
useMsqWorld()
afterAll(() => {
  if (barRoot) act(() => barRoot!.unmount())
  if (root) act(() => root!.unmount())
  barHost?.remove(); host?.remove(); setTrkUnitProbe(null); S.setStorageMaker(null, null); S.setStorageImpl(null)
})
const show = async (active: boolean) => { await act(async () => { root!.render(createElement(TrackerPage, { active })); await settle() }) }
beforeEach(async () => {
  signInAs('saber')
  expect(saveAccess(ACCT.hunter, { grants: { u149: 'plan' } })).toBeNull()
  signInAs('hunter')
  if (!host) {
    /* the top bar with its squadron button, and the Tracker's tab under it */
    barHost = document.createElement('div'); barHost.className = 'topbar'; document.body.appendChild(barHost)
    barRoot = createRoot(barHost)
    host = document.createElement('div'); host.id = 'page-tracker'; document.body.appendChild(host)
    root = createRoot(host)
    await act(async () => { root!.render(createElement(TrackerPage, { active: true })) })
    for (let i = 0; i < 200 && !C.ready; i++) await act(async () => { await tick() })
    await act(async () => { await settle() })
  }
  await act(async () => { barRoot!.render(createElement(SqnMark)); notify(); await settle() })
  if (C.dlg) await act(async () => { C.dlgClose(false); await settle() })
  if (C.sylDirty) await act(async () => { await C.discardForTests?.(); })
  if (C.arrangeMode) act(() => { C.toggleArrange() })
  if (S.storageUnit() !== 'u142') await act(async () => { await pickSquadron('u142'); await settle() })
})

async function chartEdit(name: string) {
  await act(async () => {
    if (!C.arrangeMode) C.toggleArrange()
    const p = C.addModule('acad'); await until(() => C.dlg); C.dlgClose(name); await p
    C.toggleArrange()
    await settle()
  })
  expect(C.sylDirty, 'the premise: an unsaved chart edit').toBe(true)
}
/* the squadron list opened by the keys from its button, and 149 picked there by Enter */
async function pick149ByKeys() {
  const btn = $('#sqnMenuBtn') as HTMLButtonElement
  expect(btn, 'the premise: the squadron button').not.toBeNull()
  btn.focus()
  await act(async () => { fireEvent.keyDown(btn, { key: 'ArrowDown' }) })
  const row = $('#sqnMenu .sqm-row[data-unit="u149"]') as HTMLButtonElement
  expect(row, 'the premise: the list is open, 149 in it').not.toBeNull()
  row.focus()
  await act(async () => { fireEvent.click(row, { detail: 0 }); await until(() => C.dlg); await tick() })
  expect(C.dlg?.msg, 'the premise: the question is asked').toContain('Save them before switching to 149?')
}

describe('the Tracker\'s question after a pick made by the keys (A1)', () => {
  it('on the Tracker\'s own tab: the keys go into the question, on Stay — and back to the squadron button once answered', async () => {
    await show(true)
    act(() => { setPage('tracker'); notify() })
    await chartEdit('A1-ON-TAB')
    await pick149ByKeys()
    expect(document.activeElement?.id, 'the keys are in the question, on its safe answer').toBe('dlgCancel')
    expect(document.activeElement?.textContent).toBe('Stay')
    expect($('#sqnMenu'), 'the list is not open over the question').toBeNull()
    /* Enter on Stay: a button's own press */
    await act(async () => { (document.activeElement as HTMLElement).click(); await tick(); await tick(); await settle() })
    expect(C.dlg, 'answered').toBeNull()
    expect([UNIT, C.sylDirty], 'Stay: no pick, the draft kept').toEqual(['u142', true])
    expect(document.activeElement?.id, 'the keys are back on the button he pressed').toBe('sqnMenuBtn')
  })

  it('(control) asked over another page: the keys go into the question, on Stay, as before', async () => {
    await show(false)
    act(() => { setPage('viewsched'); notify() })
    await chartEdit('A1-OFF-TAB')
    await pick149ByKeys()
    expect(document.activeElement?.id).toBe('dlgCancel')
    await act(async () => { C.dlgClose(false); await tick(); await tick(); await settle() })
    expect([UNIT, C.sylDirty]).toEqual(['u142', true])
  })
})
