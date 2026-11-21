// @vitest-environment jsdom
import { expect, it } from 'vitest'
import { act, fireEvent, render } from '@testing-library/react'
import {
  useMsqWorld, signInAs, PID, ACCT, on, moveMan, pastMidnight,
} from '../../test-support/msq-world'
import { setMaster } from '../../state/accounts'
import { warBand } from '../../state/typing-hold'
import { getState, worldUnit, leaveFiguresOf } from '../state/store'
import { PersonWindow } from './PersonWindow'

useMsqWorld()

it('keeps a typed balance unsaved beneath the midnight band', () => {
  signInAs('saber')
  expect(setMaster(ACCT.hunter, true).ok).toBe(true)
  expect(moveMan(PID.hunter, 'u149').ok).toBe(true)
  signInAs('hunter')
  on(15, 23, 58)
  const before = leaveFiguresOf(PID.ranger).kinds.LVE.app
  const page = render(<PersonWindow
    person={getState().people.find(p => p.id === PID.ranger)!}
    since={null} hasRow
    onClose={() => {}} onOil={() => {}} onGo={() => {}}
  />)
  try {
    const box = page.getByTestId('pw-LVE') as HTMLInputElement
    fireEvent.focus(box)
    fireEvent.change(box, { target: { value: '33' } })
    act(() => { pastMidnight() })
    expect(worldUnit()).toBe('u142')
    expect(warBand()?.rest).toBe("This can't be saved in 142's Leave War.")
    fireEvent.blur(box)
    expect(leaveFiguresOf(PID.ranger).kinds.LVE.app).toBe(before)
    expect(box.value).toBe('33')
  } finally {
    page.unmount()
  }
})
