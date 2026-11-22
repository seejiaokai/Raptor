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

/* ---- helper "r2close": Enter and the box leaving the screen come through the same check; before midnight it saves ---- */
const open = () => {
  signInAs('saber')
  expect(setMaster(ACCT.hunter, true).ok).toBe(true)
  expect(moveMan(PID.hunter, 'u149').ok).toBe(true)
  signInAs('hunter')
  on(15, 23, 58)
  return render(<PersonWindow
    person={getState().people.find(p => p.id === PID.ranger)!}
    since={null} hasRow
    onClose={() => {}} onOil={() => {}} onGo={() => {}}
  />)
}

it('Enter under the band saves nothing, says the app’s generic words and keeps his figure', () => {
  const page = open()
  try {
    const before = leaveFiguresOf(PID.ranger).kinds.LVE.app
    const box = page.getByTestId('pw-LVE') as HTMLInputElement
    fireEvent.focus(box)
    fireEvent.change(box, { target: { value: '33' } })
    act(() => { pastMidnight() })
    expect(warBand()).toBeTruthy()
    fireEvent.keyDown(box, { key: 'Enter' })
    expect(leaveFiguresOf(PID.ranger).kinds.LVE.app).toBe(before)
    expect(box.value).toBe('33')
    expect(page.getByTestId('pw-LVE-err').textContent).toBe('This change could not be saved.')
    /* leaving the box after it saves nothing either */
    fireEvent.blur(box)
    expect(leaveFiguresOf(PID.ranger).kinds.LVE.app).toBe(before)
    expect(box.value).toBe('33')
  } finally {
    page.unmount()
  }
})

it('the window taken off the screen under the band, his figure still in the box, saves nothing', () => {
  const page = open()
  const before = leaveFiguresOf(PID.ranger).kinds.LVE.app
  const box = page.getByTestId('pw-LVE') as HTMLInputElement
  fireEvent.focus(box)
  fireEvent.change(box, { target: { value: '33' } })
  act(() => { pastMidnight() })
  expect(warBand()).toBeTruthy()
  page.unmount()
  expect(worldUnit()).toBe('u142')
  expect(leaveFiguresOf(PID.ranger).kinds.LVE.app).toBe(before)
})

it('before midnight, no band up, the figure saves as ever', () => {
  const page = open()
  try {
    const box = page.getByTestId('pw-LVE') as HTMLInputElement
    fireEvent.focus(box)
    fireEvent.change(box, { target: { value: '33' } })
    expect(warBand()).toBeNull()
    fireEvent.blur(box)
    expect(leaveFiguresOf(PID.ranger).kinds.LVE.app).toBe(33)
  } finally {
    page.unmount()
  }
})
