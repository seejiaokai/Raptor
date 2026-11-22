// @vitest-environment jsdom
/* the fix read of the reshape, astra-3 F4 (D2243 Q7): bid remarks typed before the midnight of his own move are kept on
   screen and saved nowhere while the "can't be saved" band is up — the reader's own proof (its F3, the Tracker's, is
   helper "core"'s and lives with it) */
import { afterEach, expect, it } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useMsqWorld, signInAs, pastMidnight } from '../test-support/msq-world'
import { setMaster } from './accounts'
import { setHome } from './units'
import { warBand } from './typing-hold'
import { setCell, openDates, rawState } from '../leavewar/state/store'
import { warHolding } from '../leavewar/engine'
import { recsAt, type RequestRec } from '../leavewar/engine/warrecs'
import { Matrix } from '../leavewar/ui/Matrix'

useMsqWorld()
afterEach(() => { cleanup() })
function movingMaster() {
  signInAs('saber')
  expect(setMaster('acad2', true).ok).toBe(true)
  expect(setHome('prowler', 'u149').ok).toBe(true)
  signInAs('hunter')
}

it('F4: a moved master cannot blur-save held bid remarks', () => {
  movingMaster()
  const day = '2026-07-15'
  expect(openDates('2026-07-01', '2026-07-31')).toBe('set')
  expect(setCell('prowler', day, 'LL')).toBe(true)
  render(<Matrix />)
  fireEvent.click(screen.getByTestId(`cell-prowler-${day}`))
  const box = () => screen.getByTestId('bid-remarks') as HTMLTextAreaElement
  fireEvent.focus(box())
  fireEvent.change(box(), { target: { value: 'Keep these words' } })
  act(() => { pastMidnight() })
  expect(warBand()?.rest).toBe("This can't be saved in 142's Leave War.")
  fireEvent.blur(box())
  expect(box().value).toBe('Keep these words')
  const rs = recsAt(warHolding(rawState().wars, day)!.recs, 'prowler', day)
    .filter((r): r is RequestRec => r.kind === 'request')
  expect(
    rs.map(r => r.remarks ?? ''),
    'F4: remarks remain unsaved',
  ).toEqual([''])
})
