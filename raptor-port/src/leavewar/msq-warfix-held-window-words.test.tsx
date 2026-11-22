// @vitest-environment jsdom
/* W3-F1 AND W3-F5 (the reshape walk of 21 Nov 26, walker W3's W3-01 and W3-02) — HIS TYPED WORDS STAY IN A BID WINDOW HELD
   ACROSS MIDNIGHT OF HIS MOVE, AND THE WINDOW STAYS. His D2243 Q7: the band "You are 149's from today. This can't be saved
   in 142's Leave War." with "Close", "typed words kept visible, nothing saved into either squadron".
   The walk: in the window of a bid already PLACED, leaving the remarks box after midnight (or pressing a leave chip)
   emptied the words he had typed — the save was refused, and the box fell back to the bid's stored words (W3-F1; a
   new-bid window kept them). And Hunter, an admin who moved, pressed a leave chip in his held window after midnight: the
   window closed with no word, his remarks gone (W3-F5).
   Now: words whose save is refused stay in the box; and while the band is up a leave chip writes nothing and closes
   nothing — the band is the refusal. The world: test-support/msq-world.ts; the grid and its window are the app's own. */
import { describe, expect, it, afterEach } from 'vitest'
import { act } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { setCell, worldUnit, openDates, rawState } from './state/store'
import { setHome } from '../state/units'
import { useMsqWorld, signInAs, on, pastMidnight } from '../test-support/msq-world'
import { warHolding } from './engine'
import { recsAt, type RequestRec } from './engine/warrecs'
import { warBand } from '../state/typing-hold'
import { Matrix } from './ui/Matrix'

useMsqWorld()
afterEach(() => { cleanup() })

const WED = '2026-07-15'
const WORDS = 'Family wedding in Perth, back Sunday'
const reqs = (pid: string, date: string) => recsAt(warHolding(rawState().wars, date)!.recs, pid, date).filter((r): r is RequestRec => r.kind === 'request')
const box = () => screen.getByTestId('bid-remarks') as HTMLTextAreaElement
const type = (words: string) => { fireEvent.focus(box()); fireEvent.change(box(), { target: { value: words } }) }

/* Saber opens July and moves `pid` to 149 from Thu 16 Jul; the clock at Wed 15, 23:54 */
function setup(pid: string): void {
  signInAs('saber')
  expect(openDates('2026-07-01', '2026-07-31')).toBe('set')
  expect(setHome(pid, 'u149').ok, 'the move saved').toBe(true)
  on(15, 23, 54)
}

describe('W3-F1 — a placed bid’s window held across midnight keeps his typed words', () => {
  it('leaving the remarks box after midnight: the words stay in the box, nothing saved', () => {
    setup('bane')
    signInAs('ranger')
    expect(setCell('bane', WED, 'LL'), 'his pending LL on Wed 15').toBe(true)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-bane-${WED}`))
    type(WORDS)
    act(() => { pastMidnight() })
    expect(warBand(), 'the band is up').toEqual({ lead: "You are 149's from today.", rest: "This can't be saved in 142's Leave War." })
    expect(worldUnit(), 'the war waits for the window').toBe('u142')
    fireEvent.blur(box())
    expect(box().value, 'his words still in the box').toBe(WORDS)
    expect(reqs('bane', WED).map(r => r.remarks ?? ''), 'nothing saved into 142’s war').toEqual([''])
  })
  it('a leave chip pressed after midnight: the words stay, the window stays, nothing is written', () => {
    setup('bane')
    signInAs('ranger')
    expect(setCell('bane', WED, 'LL')).toBe(true)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-bane-${WED}`))
    type(WORDS)
    act(() => { pastMidnight() })
    fireEvent.click(screen.getByTestId('bid-OL'))
    expect(box().value, 'his words still in the box').toBe(WORDS)
    expect(screen.getByTestId('move-band')).toBeTruthy()
    expect(reqs('bane', WED).map(r => [r.code, r.remarks ?? '']), 'the bid as it was').toEqual([['LL', '']])
  })
  it('(control) before midnight the words save to the bid when the box is left', () => {
    setup('bane')
    signInAs('ranger')
    expect(setCell('bane', WED, 'LL')).toBe(true)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-bane-${WED}`))
    type(WORDS)
    fireEvent.blur(box())
    expect(box().value).toBe(WORDS)
    expect(reqs('bane', WED).map(r => r.remarks ?? '')).toEqual([WORDS])
  })
})

describe('W3-F5 — an admin who moved: his held window never closes on a leave chip', () => {
  it('Hunter’s new-bid window on his own Wed 15, a chip pressed after midnight: the window and his words stay, nothing written', () => {
    setup('prowler')
    signInAs('hunter')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-prowler-${WED}`))
    type(WORDS)
    act(() => { pastMidnight() })
    expect(screen.getByTestId('move-band'), 'the band is up').toBeTruthy()
    /* twice: where his balance would go below zero the first press only asks, and the second goes ahead */
    fireEvent.click(screen.getByTestId('bid-LL'))
    const asked = !!screen.queryByTestId('span-note')
    fireEvent.click(screen.queryByTestId('bid-LL') ?? document.body)
    expect(screen.queryByTestId('move-band'), 'the window is still open, its band on it').toBeTruthy()
    expect(box().value, 'his words still in the box').toBe(WORDS)
    expect(reqs('prowler', WED), 'nothing written into 142’s war').toEqual([])
    /* the band is the refusal: no question about a leave that cannot be placed */
    expect(asked, 'no note beside the band').toBe(false)
  })
  it('(control) before midnight the same press places his leave and closes the window', () => {
    setup('prowler')
    signInAs('hunter')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-prowler-${WED}`))
    type(WORDS)
    fireEvent.click(screen.getByTestId('bid-LL'))
    fireEvent.click(screen.queryByTestId('bid-LL') ?? document.body)   // (a below-zero ask, if any, answered by the same press)
    expect(screen.queryByTestId('bid-remarks'), 'the window closed').toBeNull()
  })
})
