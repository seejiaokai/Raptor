// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it } from 'vitest'
import {
  act, cleanup, fireEvent, render, screen,
} from '@testing-library/react'
import {
  useMsqWorld, signInAs, acrossMove, PID,
} from '../test-support/msq-world'
import { notify, switchUnit } from '../state/store'
import { setPage, setInpView } from '../state/view'
import { unitSetting } from '../engine/hooks'
import { INPUTS } from '../engine/inputs'
import {
  openWinFor, forgetWin,
} from '../state/cutoff'
import {
  setInpSet, setInpEdit, setDaysWin, DAYSWIN,
} from './pops'
import { setMembersFile } from '../state/memberfile'
import { _resetFloatWins } from './winorder'
import { InputsSettings } from './InputsSettings'
import { InputEditor } from './InputWindow'
import { DaysWindow } from './DaysWindow'
import { SansDay } from './SansDay'
import { commitInput } from './inputedit'
import { swapWarWorld } from '../leavewar/sync'
import { holidayAdd, setRole } from '../leavewar/state/store'

useMsqWorld()
beforeEach(() => {
  setPage('inputs')
  setInpView('cal')
})
afterEach(() => {
  cleanup()
  setInpSet(false)
  setInpEdit(null)
  setDaysWin(null)
  for (const k of ['inputs', 'sans', 'days'] as const)
    forgetWin(k)
  _resetFloatWins()
})
const t = (id: string) => screen.getByTestId(id)

it('1: retained Inputs settings change only their captured squadron', () => {
  signInAs('saber')
  render(<InputsSettings />)
  act(() => {
    openWinFor('inputs', 'u142')
    setInpSet(true)
    notify()
  })
  fireEvent.click(t('iset-memberfile'))
  act(() => {
    switchUnit('u149')
    notify()
  })
  /* RE-SHAPED by the fix helper (22 Nov 26): the window is not retained across the pick — it closes with its page's
     squadron (state/cutoff.ts winStale), so there is no Save to press, and neither squadron's switch moved */
  expect(screen.queryByTestId('iset-save')).toBeNull()
  expect(unitSetting('u142', 'memberfile', null)).toBeNull()
  expect(unitSetting('u149', 'memberfile', null)).toBeNull()
  /* …and the switch written for a NAMED squadron is that squadron's, whatever the page shows (149 here) */
  expect(setMembersFile(false, 'u142')).toMatchObject({ ok: true })
  expect(unitSetting('u142', 'memberfile', null)).toBe(false)
  expect(unitSetting('u149', 'memberfile', null)).toBeNull()
})

it('2: Kestrel can add an ALL AVAIL meeting through the window', () => {
  signInAs('kestrel')
  render(<InputEditor />)
  act(() => {
    setInpEdit({
      _new: true, _calendar: true, _ctx: 'i',
      person: 'allavail', type: 'Meeting',
      date: 'Jul 20', allday: true,
      remarks: 'astra-placeholder',
    })
    notify()
  })
  const save = document.querySelector('#inpEditSave')
  expect(save).not.toBeNull()
  fireEvent.click(save!)
  expect(INPUTS.find(
    (r: any) => r.remarks === 'astra-placeholder',
  )).toMatchObject({ u: 'u149' })
})

it('3: retained Calendar holidays remain the captured squadron’s', () => {
  signInAs('saber')
  switchUnit('u149')
  swapWarWorld('u149')
  setRole('admin')
  expect(holidayAdd({
    kind: 'ph', name: 'Astra 149 holiday',
    from: '2026-07-17', to: '2026-07-17',
  }).ok).toBe(true)
  render(<DaysWindow />)
  act(() => {
    openWinFor('days', 'u149')
    setDaysWin('2026-07-01')
    notify()
  })
  act(() => {
    switchUnit('u142')
    swapWarWorld('u142')
    setRole('admin')
    notify()
  })
  /* RE-SHAPED by the fix helper (22 Nov 26): the Holidays half is the loaded war's (leavewar/ — another helper's files),
     so the window is not retained across the pick: it closes with its page's squadron, and 142's holidays are never
     shown in a window opened for 149 */
  expect(screen.queryByTestId('hol-list')).toBeNull()
  expect(DAYSWIN).toBeNull()
})

it('4: Ranger’s future SANS day still lists today’s page squadron', () => {
  signInAs('saber')
  expect(commitInput(null, {
    type: 'SANS Availability', start: '2026-07-17',
    allday: true, sans: { f: true }, remarks: 'astra-sans',
  }, ['nick'])).toBe(true)
  const row = INPUTS.find((r: any) => r.remarks === 'astra-sans')!
  acrossMove(PID.ranger, 'u142', 'u149')
  signInAs('ranger')
  render(<SansDay iso="2026-07-17" hi={null} onClose={() => {}} />)
  expect(screen.queryByTestId(`sd-row-${row.iid}`)).not.toBeNull()
})
