/* A CLASH IN ANOTHER LEAVE PERIOD ([LW-CLASH-NOTE-PHONE] — owner D827: "a tap opens that day for that person"). The clash
   list covers EVERY period, not only the one on screen, and the grid draws one period at a time — so a tap on a clash
   that sits in another period must put ITS period on screen first, then ask for the day and the person. Without that
   the grid is asked for a date it does not hold, and the tap does nothing anyone can see.
   A real clash in a second period needs a published weekend in another year's schedule; what is pinned here is the
   route itself, with the list the strip reads handed in: the period switches, then the day is asked for, with the
   person, once. The clash's own period is written by the pass that finds it (clashwayout.test.tsx — "every clash
   carries the period that holds its date"). */
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const fake = vi.hoisted(() => ({ list: null as any[] | null }))
vi.mock('./sync', async orig => {
  const real = await orig<typeof import('./sync')>()
  return { ...real, getClashes: () => fake.list ?? real.getClashes() }
})

import { createWar, getState, initStore, setRole, takeFocusOpen } from './state/store'
import { memoryBackend } from './state/storage'
import { StageBar } from './ui/Chrome'
import { PHONE_QUERY } from './ui/phone'

const origMM = window.matchMedia
beforeEach(() => { initStore(memoryBackend()); setRole('admin'); takeFocusOpen(''); fake.list = null })
afterEach(() => { cleanup(); (window as any).matchMedia = origMM })

describe('a clash in a period that is not on screen', () => {
  const setUp = () => {
    const here = getState().period.id
    expect(createWar('JUL 28', '2028-07-01', '2028-07-31')).toBe('created')
    const other = getState().wars.find(w => w.period.name === 'JUL 28')!.period.id
    const who = getState().people[0]!
    /* creating a period may put it on screen: the test starts from the first one, whichever the store chose */
    fake.list = [{ person: who.id, date: '2028-07-08', inputCode: 'FO', bidCode: 'LL', kind: 'duty', wayOut: 'bid', war: other }]
    return { here, other, who }
  }

  it('the day is said with its year, because it is not the year on screen', () => {
    const { other } = setUp()
    if (getState().period.id === other) return        // the store opened the new period: its year IS on screen
    const { getByTestId } = render(<StageBar />)
    expect(getByTestId('sync-clashes').textContent).toContain('Sat 8 Jul 28')
  })

  it('a tap puts the clash’s own period on screen, then asks the grid for that day and that person', () => {
    const { other, who } = setUp()
    const { getByTestId } = render(<StageBar />)
    fireEvent.click(getByTestId('clash-go-0'))
    expect(getState().period.id, 'the period that holds the clash').toBe(other)
    expect(getState().focusDate).toBe('2028-07-08')
    expect(takeFocusOpen('2028-07-08')).toBe(who.id)
  })

  it('on a phone the row does the same', () => {
    ;(window as any).matchMedia = (q: string) => ({ matches: q === PHONE_QUERY, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false } })
    const { other, who } = setUp()
    const { getByTestId } = render(<StageBar />)
    fireEvent.click(getByTestId('clash-row-0'))
    expect(getState().period.id).toBe(other)
    expect(takeFocusOpen('2028-07-08')).toBe(who.id)
  })
})
