// @vitest-environment jsdom
/* fable3 — a figure typed on the Balances page (no war window: nothing holds the swap) across the midnight of his own move */
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
import { useMsqWorld, signInAs, PID, on, moveMan, pastMidnight } from '../../test-support/msq-world'
import { worldUnit, leaveFiguresOf } from '../state/store'
import { warBand, warWindowOpen } from '../../state/typing-hold'
import { BalancesPage } from './BalancesPage'

useMsqWorld()
afterEach(() => { cleanup() })

describe('fable3 — the Balances page left open at midnight of his move', () => {
  it('Ranger’s figure typed while 142’s war was on the page is not saved into 149’s war', () => {
    signInAs('saber'); moveMan(PID.ranger, 'u149')
    signInAs('ranger')
    on(15, 23, 58)
    expect(worldUnit()).toBe('u142')
    render(<BalancesPage />)
    const b = screen.getByTestId(`bal-LVE-${PID.ranger}`) as HTMLInputElement
    fireEvent.focus(b)
    fireEvent.change(b, { target: { value: '33' } })
    expect(warWindowOpen(), 'no war window: nothing holds the swap').toBe(false)
    act(() => { pastMidnight() })
    expect(worldUnit(), 'the war swapped under the page').toBe('u149')
    const before = leaveFiguresOf(PID.ranger).kinds.LVE.app
    const still = screen.queryByTestId(`bal-LVE-${PID.ranger}`) as HTMLInputElement | null
    if (still) act(() => { fireEvent.blur(still) })
    const after = leaveFiguresOf(PID.ranger).kinds.LVE.app
    expect(after, 'what he typed looking at 142’s figures is not saved into 149’s war').not.toBe(33)
  })
})
