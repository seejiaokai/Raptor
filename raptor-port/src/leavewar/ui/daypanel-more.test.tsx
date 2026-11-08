/* "↓ N MORE" AT THE DAY WINDOW'S FOOT (his D1295, answered by D1788, 8 Nov 26): the bell's grey foot under the window's
   scrolling body, not pressable, counting the Away lines NOT WHOLLY in view — the line cut at the foot as well as every
   line below — and gone at the list's end. jsdom lays nothing out, so each line's box is given here: the window's body
   ends at 300; line i ends at 100 + 40·i, less what the body is scrolled. The real browser's count is the walk's. */
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { initStore, setCellRange, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { _resetFloatWins } from '../../ui/winorder'
import { countNotWhollyInView } from '../../ui/morebelow'
import { Matrix } from './Matrix'
import { closeDayPanel } from './daypanelopen'

const BODY_BOTTOM = 300
const box = (bottom: number) => ({ top: bottom - 30, bottom, left: 0, right: 100, width: 100, height: 30, x: 0, y: bottom - 30, toJSON() {} }) as DOMRect
let rect: ReturnType<typeof vi.spyOn>
beforeEach(() => {
  initStore(memoryBackend()); setRole('admin')
  rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    if (this.classList.contains('win-body')) return box(BODY_BOTTOM)
    if (this.classList.contains('ll-row')) {
      const body = this.closest('.win-body') as HTMLElement | null
      const i = Array.from(body?.querySelectorAll('.lwday-away .ll-row') ?? []).indexOf(this)
      return box(100 + 40 * i - (body?.scrollTop ?? 0))
    }
    return box(0)
  })
})
afterEach(() => { act(() => { closeDayPanel() }); _resetFloatWins(); rect.mockRestore() })

/* twelve men filed away on 11 Feb (the store may refuse one): their lines end at 100, 140 … — 300 shows lines 0–5 whole */
const twelveAway = () => {
  const who = ['ramp', 'tata', 'splice', 'jaguar', 'switcher', 'asics', 'pipper', 'dusk', 'miles', 'roulette', 'cross', 'decal']
  for (const p of who) setCellRange(p, '2026-02-10', '2026-02-12', 'LL')
}
const open = (iso: string) => {
  render(<Matrix />)
  fireEvent.click(screen.getByTestId(`head-${iso}`))
  return screen.getByTestId('win-lwday')
}

describe('the day window says how many are not wholly in view', () => {
  it('the counter counts a line cut at the foot as well as every line below (D1788), never a line ending at the foot', () => {
    const s = document.createElement('div'); s.className = 'win-body'
    for (const b of [100, 300, 301, 302, 500]) { const l = document.createElement('div'); l.className = 'll-row x'; l.dataset.b = String(b); s.appendChild(l) }
    rect.mockImplementation(function (this: HTMLElement) { return box(this.classList.contains('win-body') ? BODY_BOTTOM : Number(this.dataset.b)) })
    // 300 ends at the foot, 301 within the 1px the browser rounds: in view; 302 is cut; 500 is below
    expect(countNotWhollyInView(s, '.x')).toBe(2)
  })

  it('at the top it reads "↓ N more" under the list, outside it, and is not a button', () => {
    twelveAway()
    const w = open('2026-02-11')
    const lines = w.querySelectorAll('.lwday-away .ll-row').length
    expect(lines, 'more are listed than the body shows (lines 0 to 5)').toBeGreaterThan(7)
    const shown = lines - Array.from({ length: lines }, (_, i) => 100 + 40 * i).filter(b => b <= BODY_BOTTOM + 1).length
    const cue = within(w).getByTestId('lwday-more')
    expect(cue.textContent).toBe(`↓ ${shown} more`)
    expect(cue.closest('.win-body'), 'outside the list that scrolls').toBeNull()
    expect(cue.previousElementSibling?.classList.contains('win-body'), 'straight under it').toBe(true)
    expect(cue.querySelector('button, [role="button"], a'), 'not pressable (D1788)').toBeNull()
    expect(cue.querySelector('.bl-more'), 'the bell’s own words').toBeTruthy()
  })

  it('part way down the count follows the scroll; at the list’s end the cue is gone', () => {
    twelveAway()
    const w = open('2026-02-11')
    const body = w.querySelector('.win-body') as HTMLElement
    const lines = w.querySelectorAll('.lwday-away .ll-row').length
    const out = (top: number) => Array.from({ length: lines }, (_, i) => 100 + 40 * i - top).filter(b => b > BODY_BOTTOM + 1).length
    act(() => { body.scrollTop = 120; body.dispatchEvent(new Event('scroll')) })
    expect(within(w).getByTestId('lwday-more').textContent).toBe(`↓ ${out(120)} more`)
    act(() => { body.scrollTop = 100 + 40 * (lines - 1) - BODY_BOTTOM; body.dispatchEvent(new Event('scroll')) })
    expect(within(w).queryByTestId('lwday-more'), 'gone at the end').toBeNull()
  })

  it('a day whose whole list is in view shows no cue', () => {
    setCellRange('dusk', '2026-02-10', '2026-02-12', 'LL')
    const w = open('2026-02-11')
    expect(within(w).queryByTestId('lwday-more')).toBeNull()
  })
})
