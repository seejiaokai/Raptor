/* [LW-PHONE-AWAY-ROW-MISSING] (seen 13 Oct 26 by [ONE-DATE-CALENDAR]'s walk; reproduced and fixed the night of 21 Oct 26).
   On a phone the grid draws only the men whose time in the squadron touches the month on screen. A man added for
   October (post-in 31 Oct), archived, then restored for November (post-in 11 Nov) had no row on a phone in November —
   the desktop drew him. The cause: the measure compared the rows it would draw with the rows it had last MEASURED, not
   the rows on screen. October's last measure had held him (then due on 31 Oct); his roster changed while the grid was
   not being measured (the page away, on Admin → Users); November's row set — him included — read as "already drawn",
   and nothing repainted. Here the geometry is stated the way monthstrip.test.tsx states it (one month in view, as on a
   phone), and his dates move the way the store's own posting writer moves them. */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { getState, initStore, setPostIn, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

beforeEach(() => {
  initStore(memoryBackend())
  setRole('admin')
})

/* the year laid out 300px a month; a view of 162..400 (162px of frozen columns) shows ONE month — the month starting
   at `offset + 162`, as a phone's narrow grid does */
function layout(month: number) {
  const wrap = document.querySelector<HTMLElement>('.mx-wrap')!
  const rect = (left: number, width: number) => () => ({
    left, width, right: left + width, x: left, top: 0, bottom: 0, y: 0, height: 0, toJSON: () => '',
  }) as unknown as DOMRect
  wrap.getBoundingClientRect = rect(0, 400)
  wrap.querySelector<HTMLElement>('.who')!.getBoundingClientRect = rect(0, 118)
  wrap.querySelector<HTMLElement>('.bal')!.getBoundingClientRect = rect(118, 44)
  const onScreen = (left: number, width: number) => () => rect(left - wrap.scrollLeft, width)()
  ;['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].forEach((mm, i) => {
    screen.getByTestId(`head-2026-${mm}-01`).getBoundingClientRect = onScreen(i * 300, 41)
  })
  screen.getByTestId('head-2026-12-31').getBoundingClientRect = onScreen(3600 - 41, 41)
  if (!Object.getOwnPropertyDescriptor(wrap, 'scrollLeft')?.configurable) {
    let at = 0
    Object.defineProperty(wrap, 'scrollLeft', { configurable: true, get: () => at, set: (v: number) => { at = v } })
  }
  wrap.scrollLeft = (month - 1) * 300 - 162
  fireEvent.scroll(wrap)
}
/* the scroll comes to rest — the measure runs on the grid's own rest debounce */
const rest = () => act(async () => { await new Promise(r => setTimeout(r, 250)) })
const drawn = (id: string) => !!screen.queryByTestId(`row-${id}`)
/* a man with nothing on the war (no bid, no leave): his row is his dates alone — a record outside them would stretch it */
const plainMan = (): string => {
  const { people, grid } = getState() as any
  return people.find((p: any) => p.from === null && p.to === null && !p.past && !Object.keys(grid[p.id] || {}).length).id
}

describe('[LW-PHONE-AWAY-ROW-MISSING] the rows drawn follow the month on screen after the roster changed under them', () => {
  it('a man due in October, moved to November while October was on screen, is drawn when November is', async () => {
    const id = plainMan()
    expect(setPostIn(id, '2026-10-31')).toBe(true)
    render(<Matrix />)
    act(() => layout(10)); await rest()
    expect(drawn(id), 'October: due on the 31st, drawn').toBe(true)
    /* his roster changes while October is on screen (on the phone: Admin → Users, the page away, Archive then Restore
       for 11 Nov) — the store repaints the grid, and October rightly drops him */
    act(() => { setPostIn(id, '2026-11-11') })
    expect(drawn(id), 'October: he now joins in November').toBe(false)
    act(() => layout(11)); await rest()
    expect(drawn(id), 'November: his row').toBe(true)
  })
  it('and back: moved again to October while November is on screen, October draws him', async () => {
    const id = plainMan()
    expect(setPostIn(id, '2026-11-11')).toBe(true)
    render(<Matrix />)
    act(() => layout(11)); await rest()
    expect(drawn(id)).toBe(true)
    act(() => layout(10)); await rest()
    expect(drawn(id), 'October: not yet here').toBe(false)
    act(() => { setPostIn(id, '2026-10-20') })
    expect(drawn(id), 'October: due on the 20th, drawn by the store\'s repaint').toBe(true)
  })
})
