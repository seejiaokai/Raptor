// @vitest-environment jsdom
/* [VIEW-ARROW-OVER-LIST] — the room the week keeps beside its floating arrows (state/view.ts weekInset). jsdom lays
   nothing out, so the boxes and the declared room are stubbed: the rule under test is WHICH side has room when.
   W4's walk (26 Sep 26) found the right-hand room applied on Edit Schedule, where the week box ends at the crew
   palette and the › arrow floats over the palette, not the week — a warning tap on a man fully visible beside the
   palette swung the week sideways, against the owner's "hold the lateral view" (6 Aug 26). The right room counts only
   where the › arrow actually sits over the week box. */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { weekInset } from './view'

const rect = (left: number, width: number) => ({ left, right: left + width, width, top: 0, bottom: 10, height: 10, x: left, y: 0, toJSON() {} })
let week: HTMLElement, next: HTMLButtonElement
beforeEach(() => {
  week = document.createElement('div'); document.body.appendChild(week)
  next = document.createElement('button'); next.id = 'weekNext'; document.body.appendChild(next)
  vi.spyOn(window, 'getComputedStyle').mockImplementation(() => ({ scrollPaddingLeft: '54px', scrollPaddingRight: '54px' }) as any)
})
afterEach(() => { vi.restoreAllMocks(); document.body.innerHTML = '' })

describe('weekInset — the room beside the arrows', () => {
  it('the left room is the declared room', () => {
    expect(weekInset(week)).toBe(54)
  })
  it('the right room counts where the › arrow sits over the week (View-only Sched: the week runs to the window edge)', () => {
    week.getBoundingClientRect = () => rect(0, 1440) as any
    next.getBoundingClientRect = () => rect(1394, 38) as any
    expect(weekInset(week, 'right')).toBe(54)
  })
  it('…and NOT where the week ends before the arrow (Edit Schedule: the › floats over the crew palette)', () => {
    week.getBoundingClientRect = () => rect(0, 1163) as any
    next.getBoundingClientRect = () => rect(1394, 38) as any
    expect(weekInset(week, 'right')).toBe(0)
  })
  it('no › arrow drawn (a phone, or hidden) — no right room', () => {
    week.getBoundingClientRect = () => rect(0, 1440) as any
    next.getBoundingClientRect = () => rect(1394, 38) as any
    next.hidden = true
    expect(weekInset(week, 'right')).toBe(0)
  })
  it('nothing declared (a phone) — no room either side', () => {
    vi.spyOn(window, 'getComputedStyle').mockImplementation(() => ({ scrollPaddingLeft: 'auto', scrollPaddingRight: 'auto' }) as any)
    expect(weekInset(week)).toBe(0)
    expect(weekInset(week, 'right')).toBe(0)
  })
})
