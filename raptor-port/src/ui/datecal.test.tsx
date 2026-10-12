// @vitest-environment jsdom
/* THE APP'S ONE DATE CALENDAR (ui/DateCal.tsx) — [ONE-DATE-CALENDAR] step one; the design of record
   docs/superpowers/specs/2026-10-13-one-date-calendar.md.

   Owner, D796 (13 Oct 26): "design the calendar the app uses something like this [his iPhone's] … instead of reset, we
   have a today's icon on the right of the year. And there isn't a need for the tick … the style is raptor app style";
   "Same like Apple where u can scroll to the month and year as well". D797: "Monday". D795: "Any date" — the weekday
   standing out.

   What is pinned HERE is the calendar itself, whoever draws it: its head, its Monday-first weeks, its six rows, what a
   tap does in each of its two modes, the weekday that stands out, the dates that may not be picked, the month-and-year
   lists, the Today icon, the keyboard. Where it floats and what closes it is the date box's (ui/datebox.test.tsx). */
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { DateCal } from './DateCal'
import { calMonth, calPage, calRow, calShow } from './datecal-testkit'

afterEach(() => cleanup())

const t = (id: string) => screen.getByTestId(id)
const q = (id: string) => screen.queryByTestId(id)
const day = (iso: string) => t(`dcal-day-${iso}`)
const has = (iso: string, cls: string) => day(iso).classList.contains(cls)

describe('the head', () => {
  it('says the month and the year, with the Today icon and the two arrows', () => {
    render(<DateCal value="2026-11-05" today="2026-11-03" onPick={() => {}} />)
    expect(t('dcal-title').textContent).toContain('November 2026')
    expect(t('dcal-today').getAttribute('aria-label')).toBe('Go to today')
    /* the icon is the page with today's number — the one "Jump to a date" has */
    expect(t('dcal-today').querySelector('.wc-pg .wc-n')!.textContent).toBe('3')
    expect(t('dcal-prev').getAttribute('aria-label')).toBe('Previous month')
    expect(t('dcal-next').getAttribute('aria-label')).toBe('Next month')
  })
  it('opens on the month of the picked date; with none picked, on the month it is told; failing both, on today’s', () => {
    const { unmount } = render(<DateCal value="2027-02-14" today="2026-11-03" onPick={() => {}} />)
    expect(calMonth()).toBe('2027-02'); unmount()
    const b = render(<DateCal value="" at="2026-07-14" today="2026-11-03" onPick={() => {}} />)
    expect(calMonth()).toBe('2026-07'); b.unmount()
    render(<DateCal value="" today="2026-11-03" onPick={() => {}} />)
    expect(calMonth()).toBe('2026-11')
  })
  it('the arrows turn the month, across a year’s end both ways', () => {
    render(<DateCal value="2026-12-10" today="2026-11-03" onPick={() => {}} />)
    fireEvent.click(t('dcal-next')); expect(t('dcal-title').textContent).toContain('January 2027')
    fireEvent.click(t('dcal-prev')); fireEvent.click(t('dcal-prev')); expect(t('dcal-title').textContent).toContain('November 2026')
  })
})

describe('the dates', () => {
  it('run Monday first, in SIX rows every month — so nothing under them hops as the months change', () => {
    render(<DateCal value="" at="2026-11-01" today="2026-11-03" onPick={() => {}} />)
    expect([...t('dcal-dow').children].map(e => e.textContent)).toEqual(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'])
    /* November 2026 begins on a Sunday: six places stand empty before the 1st */
    const cells = () => [...t('dcal-grid').children]
    expect(cells()).toHaveLength(42)
    expect(cells()[6].getAttribute('data-testid')).toBe('dcal-day-2026-11-01')
    /* February 2027 begins on a Monday and takes four rows: still 42 places */
    calShow(2027, 2)
    expect(cells()).toHaveLength(42)
    expect(cells()[0].getAttribute('data-testid')).toBe('dcal-day-2027-02-01')
    expect(cells().filter(c => c.tagName === 'BUTTON')).toHaveLength(28)
  })
  it('a Saturday and a Sunday are quiet, today is marked, the picked date is lit', () => {
    render(<DateCal value="2026-11-05" today="2026-11-03" onPick={() => {}} />)
    expect(has('2026-11-07', 'is-we')).toBe(true); expect(has('2026-11-08', 'is-we')).toBe(true); expect(has('2026-11-06', 'is-we')).toBe(false)
    expect(has('2026-11-03', 'is-today')).toBe(true); expect(has('2026-11-04', 'is-today')).toBe(false)
    expect(has('2026-11-05', 'is-sel')).toBe(true); expect(day('2026-11-05').getAttribute('aria-pressed')).toBe('true')
    expect(day('2026-11-04').getAttribute('aria-pressed')).toBe('false')
  })
  it('each date says itself in words to a screen reader', () => {
    render(<DateCal value="2026-11-05" today="2026-11-03" onPick={() => {}} />)
    expect(day('2026-11-05').getAttribute('aria-label')).toBe('Thu 5 Nov 2026, picked')
    expect(day('2026-11-03').getAttribute('aria-label')).toBe('Tue 3 Nov 2026, today')
    expect(day('2026-11-10').getAttribute('aria-label')).toBe('Tue 10 Nov 2026')
  })
  it('a tap picks — no tick, no second press', () => {
    const onPick = vi.fn()
    render(<DateCal value="2026-11-05" today="2026-11-03" onPick={onPick} />)
    fireEvent.click(day('2026-11-19'))
    expect(onPick).toHaveBeenCalledTimes(1)
    expect(onPick).toHaveBeenCalledWith('2026-11-19')
  })
  it('there is no Reset, no Clear and no tick anywhere on it', () => {
    render(<DateCal value="2026-11-05" today="2026-11-03" onPick={() => {}} />)
    const words = [...t('dcal').querySelectorAll('button')].map(b => (b.textContent || '') + ' ' + (b.getAttribute('aria-label') || ''))
    expect(words.filter(w => /reset|clear|done|\bok\b|✓/i.test(w))).toEqual([])
  })
})

describe('a weekday that stands out (D795 — "Every Thursday")', () => {
  it('lights its heading and its dates, and every other date may still be picked', () => {
    const onPick = vi.fn()
    render(<DateCal value="2026-11-05" markWd={3} today="2026-11-03" onPick={onPick} />)
    expect(t('dcal').classList.contains('is-marked')).toBe(true)
    expect([...t('dcal-dow').children].map(e => e.classList.contains('is-mk'))).toEqual([false, false, false, true, false, false, false])
    for (const iso of ['2026-11-05', '2026-11-12', '2026-11-19', '2026-11-26']) expect(has(iso, 'is-mk')).toBe(true)
    expect(has('2026-11-06', 'is-mk')).toBe(false)
    fireEvent.click(day('2026-11-10'))                                   // a Tuesday
    expect(onPick).toHaveBeenCalledWith('2026-11-10')
  })
  it('with no weekday told, nothing stands out', () => {
    render(<DateCal value="2026-11-05" today="2026-11-03" onPick={() => {}} />)
    expect(t('dcal').classList.contains('is-marked')).toBe(false)
    expect(t('dcal-grid').querySelector('.is-mk')).toBeNull()
  })
})

describe('a date that may not be picked', () => {
  it('is faint, says so, and a tap on it picks nothing', () => {
    const onPick = vi.fn()
    render(<DateCal value="" at="2026-11-01" min="2026-11-12" today="2026-11-03" onPick={onPick} />)
    expect((day('2026-11-11') as HTMLButtonElement).disabled).toBe(true)
    expect(has('2026-11-11', 'is-out')).toBe(true)
    expect((day('2026-11-12') as HTMLButtonElement).disabled).toBe(false)
    fireEvent.click(day('2026-11-11'))
    expect(onPick).not.toHaveBeenCalled()
    fireEvent.click(day('2026-11-12'))
    expect(onPick).toHaveBeenCalledWith('2026-11-12')
  })
})

describe('a run of dates', () => {
  function Run({ from0 = '', to0 = '' }: { from0?: string; to0?: string }) {
    /* the calendar is given its run and tells of a new one, as every form of the app keeps a value */
    const [r, setR] = useState({ from: from0, to: to0 })
    return <DateCal mode="run" from={r.from} to={r.to} at="2026-11-01" today="2026-11-03" onRun={(from, to) => setR({ from, to })} foot={<span data-testid="said">{r.from}|{r.to}</span>} />
  }
  it('two taps make it: the first day and the last lit, the days between on the band', () => {
    render(<Run />)
    fireEvent.click(day('2026-11-09'))
    expect(t('said').textContent).toBe('2026-11-09|2026-11-09')          // one tap is a run of one day
    expect(has('2026-11-09', 'is-sel')).toBe(true)
    fireEvent.click(day('2026-11-12'))
    expect(t('said').textContent).toBe('2026-11-09|2026-11-12')
    expect(has('2026-11-09', 'is-sel')).toBe(true); expect(has('2026-11-12', 'is-sel')).toBe(true)
    expect(has('2026-11-09', 'is-from')).toBe(true); expect(has('2026-11-12', 'is-to')).toBe(true)
    expect(has('2026-11-10', 'is-in')).toBe(true); expect(has('2026-11-11', 'is-in')).toBe(true)
    expect(has('2026-11-10', 'is-sel')).toBe(false)
    expect(has('2026-11-13', 'is-in')).toBe(false)
  })
  it('a tap on a new day starts a finished run over — there is no Clear (D796)', () => {
    render(<Run from0="2026-11-09" to0="2026-11-12" />)
    fireEvent.click(day('2026-11-20'))
    expect(t('said').textContent).toBe('2026-11-20|2026-11-20')
    expect(t('dcal-grid').querySelector('.is-in')).toBeNull()
  })
  it('a second tap BEFORE the first starts over there, never a run backwards', () => {
    render(<Run />)
    fireEvent.click(day('2026-11-12')); fireEvent.click(day('2026-11-09'))
    expect(t('said').textContent).toBe('2026-11-09|2026-11-09')
  })
  it('a run across a month’s end keeps its band on both months', () => {
    render(<Run from0="2026-11-28" to0="2026-12-02" />)
    expect(has('2026-11-28', 'is-from')).toBe(true); expect(has('2026-11-30', 'is-in')).toBe(true)
    fireEvent.click(t('dcal-next'))
    expect(has('2026-12-01', 'is-in')).toBe(true); expect(has('2026-12-02', 'is-to')).toBe(true); expect(has('2026-12-03', 'is-in')).toBe(false)
  })
  it('says the run in words beneath, as its form gives them', () => {
    render(<Run from0="2026-11-09" to0="2026-11-12" />)
    expect(t('dcal-foot').textContent).toBe('2026-11-09|2026-11-12')
  })
})

describe('the month-and-year lists', () => {
  it('a tap on the title swaps the dates for the two lists and hides the arrows; a tap again brings the dates back', () => {
    render(<DateCal value="2026-11-05" today="2026-11-03" onPick={() => {}} />)
    expect(q('dcal-lists')).toBeNull()
    expect(t('dcal-title').getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(t('dcal-title'))
    expect(t('dcal-title').getAttribute('aria-expanded')).toBe('true')
    expect(t('dcal-title').classList.contains('is-open')).toBe(true)
    expect(t('dcal-lists')).toBeTruthy()
    expect(q('dcal-grid')).toBeNull(); expect(q('dcal-prev')).toBeNull(); expect(q('dcal-next')).toBeNull()
    expect(t('dcal-today')).toBeTruthy()                                   // the Today icon stays where it is
    fireEvent.click(t('dcal-title'))
    expect(q('dcal-lists')).toBeNull(); expect(t('dcal-grid')).toBeTruthy(); expect(t('dcal-prev')).toBeTruthy()
  })
  it('the lists open on the month and year shown, each in the band', () => {
    render(<DateCal value="2026-11-05" today="2026-11-03" onPick={() => {}} />)
    fireEvent.click(t('dcal-title'))
    expect(t('dcal-months').querySelector('[aria-selected="true"]')!.textContent).toBe('November')
    expect(t('dcal-years').querySelector('[aria-selected="true"]')!.textContent).toBe('2026')
  })
  it('a tap on a month or a year chooses it — the title follows, and no date is picked by it', () => {
    const onPick = vi.fn()
    render(<DateCal value="2026-11-05" today="2026-11-03" onPick={onPick} />)
    fireEvent.click(t('dcal-title'))
    fireEvent.click(calRow('months', 'March'))
    expect(t('dcal-title').textContent).toContain('March 2026')
    fireEvent.click(calRow('years', '2031'))
    expect(t('dcal-title').textContent).toContain('March 2031')
    expect(onPick).not.toHaveBeenCalled()
    fireEvent.click(t('dcal-title'))
    expect(calMonth()).toBe('2031-03')
    expect(day('2031-03-01')).toBeTruthy()
  })
  it('the months go round — December is followed by January — and the years have no end either way', () => {
    render(<DateCal value="2026-12-05" today="2026-11-03" onPick={() => {}} />)
    fireEvent.click(t('dcal-title'))
    const months = [...t('dcal-months').querySelectorAll('[role="option"]')].map(e => e.textContent)
    const at = months.findIndex((_, i) => t('dcal-months').querySelectorAll('[role="option"]')[i].getAttribute('aria-selected') === 'true')
    expect(months.slice(at - 1, at + 3)).toEqual(['November', 'December', 'January', 'February'])
    /* a posting may be years back or ahead (owner, 19 Aug 26): walk the years far past any list a calendar could hold */
    for (let y = 2045; y <= 2140; y += 19) fireEvent.click(calRow('years', String(y)))
    expect(t('dcal-title').textContent).toContain('2140')
    for (let y = 2120; y >= 1890; y -= 23) fireEvent.click(calRow('years', String(y)))
    expect(t('dcal-title').textContent).toContain('December 1890')
  })
  it('the months go round upward too — above January is December, and the year is the other list’s', () => {
    render(<DateCal value="2026-02-10" today="2026-11-03" onPick={() => {}} />)
    fireEvent.click(t('dcal-title'))
    fireEvent.keyDown(t('dcal-months'), { key: 'ArrowUp' })
    expect(t('dcal-title').textContent).toContain('January 2026')
    fireEvent.keyDown(t('dcal-months'), { key: 'ArrowUp' })
    expect(t('dcal-title').textContent).toContain('December 2026')
    fireEvent.keyDown(t('dcal-months'), { key: 'ArrowUp' })
    expect(t('dcal-title').textContent).toContain('November 2026')
    fireEvent.click(calRow('months', 'September'))
    expect(t('dcal-title').textContent).toContain('September 2026')
    fireEvent.click(t('dcal-title'))
    expect(calMonth()).toBe('2026-09')
  })
  it('the keyboard moves a list one row at a time', () => {
    render(<DateCal value="2026-11-05" today="2026-11-03" onPick={() => {}} />)
    fireEvent.click(t('dcal-title'))
    fireEvent.keyDown(t('dcal-months'), { key: 'ArrowDown' })
    fireEvent.keyDown(t('dcal-months'), { key: 'ArrowDown' })
    expect(t('dcal-title').textContent).toContain('January 2026')         // the months go round; the year is the other list's
    fireEvent.keyDown(t('dcal-years'), { key: 'ArrowUp' })
    expect(t('dcal-title').textContent).toContain('January 2025')
  })
})

describe('the Today icon', () => {
  it('goes to today’s month and picks nothing', () => {
    const onPick = vi.fn()
    render(<DateCal value="2027-02-14" today="2026-11-03" onPick={onPick} />)
    fireEvent.click(t('dcal-today'))
    expect(calMonth()).toBe('2026-11')
    expect(onPick).not.toHaveBeenCalled()
    expect(has('2026-11-03', 'is-today')).toBe(true)
  })
  it('with the lists open, it brings the dates back on today’s month', () => {
    render(<DateCal value="2027-02-14" today="2026-11-03" onPick={() => {}} />)
    fireEvent.click(t('dcal-title'))
    fireEvent.click(t('dcal-today'))
    expect(q('dcal-lists')).toBeNull()
    expect(calMonth()).toBe('2026-11')
  })
})

describe('the keyboard on the dates', () => {
  it('one date is the tab stop — the picked one, else today, else the first that may be picked', () => {
    const stops = () => [...t('dcal-grid').querySelectorAll('button')].filter(b => b.tabIndex === 0).map(b => b.getAttribute('data-testid'))
    const a = render(<DateCal value="2026-11-05" today="2026-11-03" onPick={() => {}} />)
    expect(stops()).toEqual(['dcal-day-2026-11-05']); a.unmount()
    const b = render(<DateCal value="" today="2026-11-03" onPick={() => {}} />)
    expect(stops()).toEqual(['dcal-day-2026-11-03']); b.unmount()
    render(<DateCal value="" at="2026-12-01" min="2026-12-10" today="2026-11-03" onPick={() => {}} />)
    expect(stops()).toEqual(['dcal-day-2026-12-10'])
  })
  it('the arrow keys walk the dates, a week up and down, and across a month’s end', () => {
    render(<DateCal value="2026-11-05" today="2026-11-03" onPick={() => {}} />)
    day('2026-11-05').focus()
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' }); expect(document.activeElement).toBe(day('2026-11-06'))
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' }); expect(document.activeElement).toBe(day('2026-11-13'))
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' }); expect(document.activeElement).toBe(day('2026-11-12'))
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' }); expect(document.activeElement).toBe(day('2026-11-05'))
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' }); expect(calMonth()).toBe('2026-10')
    expect(document.activeElement).toBe(day('2026-10-29'))
    fireEvent.keyDown(document.activeElement!, { key: 'PageDown' }); expect(calMonth()).toBe('2026-11')
    expect(document.activeElement).toBe(day('2026-11-29'))
  })
  it('never walks onto a date that may not be picked', () => {
    render(<DateCal value="2026-11-12" min="2026-11-12" today="2026-11-03" onPick={() => {}} />)
    day('2026-11-12').focus()
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(day('2026-11-12'))
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' })
    expect(document.activeElement).toBe(day('2026-11-12'))
  })
})

describe('a control tapped repeatedly does not move', () => {
  it('the test kit’s page-turner lands on any month by the arrows alone', () => {
    render(<DateCal value="2026-11-05" today="2026-11-03" onPick={() => {}} />)
    calPage(2027, 4); expect(calMonth()).toBe('2027-04')
    calPage(2025, 12); expect(calMonth()).toBe('2025-12')
  })
})
