// @vitest-environment jsdom
/* HIS TYPED WORDS STAY IN THE REAL BID WINDOW ACROSS MIDNIGHT (his D2243 Q7: "His typed words stay visible"; the reshape plan
   §3.2 A-iv). Found by helper "session"'s drawing check, phase 3 — typing-hold.test.tsx drives a stand-in window, so it
   could not see it: at midnight of Ranger's move Wed 15 Jul becomes a day closed to him, and the grid
   (leavewar/ui/Matrix.tsx) swapped his open bid window for the closed note — the band held the war, but his words were
   gone. Driven through the war's own grid and the app's own midnight wake. */
import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
import { useMsqWorld, signInAs, PID, on, moveMan, pastMidnight } from '../test-support/msq-world'
import { Matrix } from '../leavewar/ui/Matrix'
import { worldUnit, openDates } from '../leavewar/state/store'
import { warBand } from './typing-hold'

useMsqWorld()
afterEach(() => cleanup())

const WORDS = 'Family wedding in Perth, back Sunday'

describe("Ranger's bid window open at midnight of his move", () => {
  it('stays the bid window, his words in it, under the band', () => {
    signInAs('saber'); moveMan(PID.ranger, 'u149'); openDates('2026-07-01', '2026-07-31')   // July open for bidding (setup — the demo's war is closed)
    signInAs('ranger')
    on(15, 23, 58)
    const { rerender } = render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${PID.ranger}-2026-07-15`))
    fireEvent.change(screen.getByTestId('bid-remarks'), { target: { value: WORDS } })
    act(() => { pastMidnight() })
    /* (the page draws again after midnight — the app re-renders on its notify; drawn here by hand, Matrix standing alone) */
    act(() => { rerender(<Matrix />) })
    expect(worldUnit(), 'the war waits for the window').toBe('u142')
    expect(warBand(), 'the band is up').not.toBeNull()
    expect(screen.queryByTestId('bid-remarks'), 'the bid window is still the one open').not.toBeNull()
    expect((screen.getByTestId('bid-remarks') as HTMLInputElement).value, 'his typed words stay').toBe(WORDS)
  })
  it('(control) before midnight the window is his bid window, with his words', () => {
    signInAs('saber'); moveMan(PID.ranger, 'u149'); openDates('2026-07-01', '2026-07-31')   // July open for bidding (setup — the demo's war is closed)
    signInAs('ranger')
    on(15, 23, 58)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${PID.ranger}-2026-07-15`))
    fireEvent.change(screen.getByTestId('bid-remarks'), { target: { value: WORDS } })
    expect((screen.getByTestId('bid-remarks') as HTMLInputElement).value).toBe(WORDS)
  })
})
