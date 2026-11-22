// @vitest-environment jsdom
/* Fable, share 1 — proof: in "Several people" a man already picked drops out of sight when the draft's first day moves
   to a day he is another squadron's. ui/inputedit.tsx offersFor keeps a picked man ("a man already picked always stays"),
   but ui/peoplepick-model.ts pickRoster filters the day's roster first, and the several-people pucks are drawn from that
   roster alone — so Ranger stays IN the draft (the count still says 2 picked), has no puck to press to take him out,
   and the save is refused in the generic words. */
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/react'
import { useMsqWorld, signInAs, acrossMove, PID } from '../test-support/msq-world'
import { PeoplePick } from './PeoplePick'
import { offersFor, whoDoorRefusal, draftImage } from './inputedit'

useMsqWorld()
afterEach(() => cleanup())

const R = PID.ranger, H = PID.hunter
const draft = (start: string) => ({ type: 'LL', start, end: '', allday: true, remarks: '' })

describe('Hunter picks Ranger and himself for Tue 14 Jul, then moves the draft to Fri 17 Jul', () => {
  it('Ranger, still picked, still has his puck — the one press that takes him out', () => {
    acrossMove(R, 'u142', 'u149')
    signInAs('hunter')
    const people = [R, H]
    const on14 = render(<PeoplePick people={people} several type="LL" sansOnly={false} unit="u142" iso="2026-07-14" offers={offersFor(null, draft('2026-07-14'), people, true)} onChange={() => {}} />)
    expect(on14.container.querySelector(`[data-pp="${R}"]`), 'control: shown on 14 Jul').not.toBeNull()
    on14.unmount()
    const on17 = render(<PeoplePick people={people} several type="LL" sansOnly={false} unit="u142" iso="2026-07-17" offers={offersFor(null, draft('2026-07-17'), people, true)} onChange={() => {}} />)
    expect(on17.getByTestId('pp-count').textContent, 'he is still in the draft').toBe('2 picked')
    expect(whoDoorRefusal(null, draftImage(null, draft('2026-07-17'), people)), 'and its save is refused').not.toBeNull()
    expect(on17.container.querySelector(`[data-pp="${R}"]`), 'his puck').not.toBeNull()
  })
})
