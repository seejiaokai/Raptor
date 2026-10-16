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
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
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

/* SEVERAL SEPARATE DAYS — the OIL question's "Only some days…" (owner D923, 15 Oct 26: "use the new calendar format but
   allow to tap separate days for this function"). Only the days it is given take a tap; each tap turns one on or off. */
describe('several separate days (D923)', () => {
  /* the weekends of a Fri 17 Jul – Sun 2 Aug input: what the OIL question asks about */
  const ONLY = ['2026-07-18', '2026-07-19', '2026-07-25', '2026-07-26', '2026-08-01', '2026-08-02']
  function Many({ on0 = [] as string[], only = ONLY, today = '2026-07-21' }) {
    const [on, setOn] = useState(on0)
    return <DateCal mode="many" only={only} picked={on} at={only[0]} today={today}
      onToggle={iso => setOn(o => o.includes(iso) ? o.filter(d => d !== iso) : [...o, iso])}
      foot={<span data-testid="said">{[...on].sort().join(',')}</span>} />
  }
  it('only the days it is given take a tap: every other date is faint and a tap there does nothing', () => {
    render(<Many />)
    expect(calMonth()).toBe('2026-07')
    expect(t('dcal').classList.contains('is-many')).toBe(true)
    for (const d of ['2026-07-18', '2026-07-19', '2026-07-25', '2026-07-26']) {
      expect((day(d) as HTMLButtonElement).disabled).toBe(false); expect(has(d, 'is-out')).toBe(false)
    }
    for (const d of ['2026-07-17', '2026-07-20', '2026-07-11', '2026-07-21']) {
      expect((day(d) as HTMLButtonElement).disabled).toBe(true); expect(has(d, 'is-out')).toBe(true)
    }
    fireEvent.click(day('2026-07-17'))
    expect(t('said').textContent).toBe('')
  })
  it('a tap turns a day on, a second tap turns it off; several stay on at once, and nothing between them is joined', () => {
    render(<Many />)
    fireEvent.click(day('2026-07-18')); fireEvent.click(day('2026-07-26')); fireEvent.click(day('2026-07-19'))
    expect(t('said').textContent).toBe('2026-07-18,2026-07-19,2026-07-26')
    for (const d of ['2026-07-18', '2026-07-19', '2026-07-26']) { expect(has(d, 'is-sel')).toBe(true); expect(day(d).getAttribute('aria-pressed')).toBe('true') }
    expect(has('2026-07-25', 'is-sel')).toBe(false); expect(day('2026-07-25').getAttribute('aria-pressed')).toBe('false')
    expect(t('dcal-grid').querySelector('.is-in'), 'no run band between picked days').toBeNull()
    fireEvent.click(day('2026-07-19'))
    expect(t('said').textContent).toBe('2026-07-18,2026-07-26')
    expect(has('2026-07-19', 'is-sel')).toBe(false)
  })
  it('the days already on are lit as it opens (an answer asked again), and stay on across a turn of the month', () => {
    render(<Many on0={['2026-07-25', '2026-08-01']} />)
    expect(has('2026-07-25', 'is-sel')).toBe(true); expect(has('2026-07-18', 'is-sel')).toBe(false)
    fireEvent.click(t('dcal-next'))
    expect(has('2026-08-01', 'is-sel')).toBe(true); expect(has('2026-08-02', 'is-sel')).toBe(false)
    fireEvent.click(day('2026-08-02'))
    fireEvent.click(t('dcal-prev'))
    expect(has('2026-07-25', 'is-sel')).toBe(true)
    expect(t('said').textContent).toBe('2026-07-25,2026-08-01,2026-08-02')
  })
  it('the tab stop is the first day on in the month, else the first that takes a tap', () => {
    const stops = () => [...t('dcal-grid').querySelectorAll('button')].filter(b => b.tabIndex === 0).map(b => b.getAttribute('data-testid'))
    const a = render(<Many on0={['2026-07-26']} />)
    expect(stops()).toEqual(['dcal-day-2026-07-26']); a.unmount()
    render(<Many />)
    expect(stops()).toEqual(['dcal-day-2026-07-18'])
  })
  it('the keys step over the faint dates to the next day that takes a tap, the way they were going — across a month too', () => {
    render(<Many />)
    day('2026-07-18').focus()
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' }); expect(document.activeElement).toBe(day('2026-07-19'))
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' }); expect(document.activeElement).toBe(day('2026-07-25'))
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' }); expect(document.activeElement).toBe(day('2026-07-19'))
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' }); expect(document.activeElement).toBe(day('2026-07-26'))
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' }); expect(calMonth()).toBe('2026-08')
    expect(document.activeElement).toBe(day('2026-08-02'))
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' }); expect(calMonth()).toBe('2026-07')
    expect(document.activeElement).toBe(day('2026-07-26'))
    fireEvent.keyDown(document.activeElement!, { key: 'Home' }); expect(document.activeElement).toBe(day('2026-07-19'))
  })
  it('with nothing further that way, a key leaves the keyboard where it is', () => {
    render(<Many />)
    day('2026-07-18').focus()
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' }); expect(document.activeElement).toBe(day('2026-07-18'))
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' }); expect(document.activeElement).toBe(day('2026-07-18'))
    fireEvent.keyDown(document.activeElement!, { key: 'PageUp' }); expect(document.activeElement).toBe(day('2026-07-18'))
    expect(calMonth()).toBe('2026-07')
  })
  it('a date it is given that is also today keeps today’s look, and still takes a tap', () => {
    render(<Many today="2026-07-19" />)
    expect(has('2026-07-19', 'is-today')).toBe(true); expect((day('2026-07-19') as HTMLButtonElement).disabled).toBe(false)
    fireEvent.click(day('2026-07-19'))
    expect(t('said').textContent).toBe('2026-07-19')
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

/* D800 (owner, 13 Oct 26 — "All as recommended"): a sideways finger on the calendar's dates turns its month, as in the
   Calendar window and on his iPhone's own calendar; a swipe that begins on a date picks nothing. */
describe('a sideways finger turns the month (D800)', () => {
  /* a finger: a touch that lands at one point and lifts at another; its later events go to the element it landed on */
  const touch = (type: string, el: Element, x: number, y: number) => {
    const e = new Event(type, { bubbles: true, cancelable: true })
    const pts = [{ clientX: x, clientY: y, target: el }]
    Object.defineProperty(e, 'touches', { value: type === 'touchend' ? [] : pts })
    Object.defineProperty(e, 'changedTouches', { value: pts })
    act(() => { el.dispatchEvent(e) })
  }
  const swipe = (el: Element, dx: number, dy = 0) => { touch('touchstart', el, 200, 300); touch('touchend', el, 200 + dx, 300 + dy) }

  it('left is the next month, right the last — across a year’s end', () => {
    render(<DateCal value="2026-12-10" today="2026-11-03" onPick={() => {}} />)
    swipe(t('dcal-grid'), -80); expect(calMonth()).toBe('2027-01')
    swipe(t('dcal-grid'), 80); swipe(t('dcal-grid'), 80); expect(calMonth()).toBe('2026-11')
  })
  it('a swipe that begins ON a date turns the month and picks nothing — nor does the click that may follow it', () => {
    const onPick = vi.fn()
    render(<DateCal value="2026-11-05" today="2026-11-03" onPick={onPick} />)
    const d = day('2026-11-19')
    swipe(d, -80)
    act(() => { if (d.isConnected) d.click() })
    expect(calMonth()).toBe('2026-12')
    /* the click a browser may send lands on whatever date is now under the finger */
    act(() => { day('2026-12-17').click() })
    expect(onPick).not.toHaveBeenCalled()
    /* a real press afterwards is its own */
    fireEvent.pointerDown(day('2026-12-17')); fireEvent.click(day('2026-12-17'))
    expect(onPick).toHaveBeenCalledWith('2026-12-17')
  })
  it('less than the Calendar window’s own distance, or more up-and-down than sideways, turns nothing', () => {
    render(<DateCal value="2026-11-05" today="2026-11-03" onPick={() => {}} />)
    swipe(t('dcal-grid'), -40); swipe(t('dcal-grid'), -80, 90)
    expect(calMonth()).toBe('2026-11')
  })
  it('a run is kept while the months are swiped, and its band is on the month it reaches', () => {
    render(<DateCal mode="run" from="2026-11-28" to="2026-12-02" today="2026-11-03" onRun={() => {}} />)
    swipe(t('dcal-grid'), -80)
    expect(calMonth()).toBe('2026-12')
    expect(has('2026-12-01', 'is-in')).toBe(true); expect(has('2026-12-02', 'is-to')).toBe(true)
  })
  it('the month-and-year lists are scrolled, not swiped: a sideways finger on them turns nothing', () => {
    render(<DateCal value="2026-11-05" today="2026-11-03" onPick={() => {}} />)
    fireEvent.click(t('dcal-title'))
    swipe(t('dcal-months'), -80); swipe(t('dcal-lists'), 80)
    expect(t('dcal-title').textContent).toContain('November 2026')
    /* and back on the dates the swipe is there again */
    fireEvent.click(t('dcal-title'))
    swipe(t('dcal-grid'), -80)
    expect(calMonth()).toBe('2026-12')
  })
  it('the arrows still turn it, one month a press, straight after a swipe', () => {
    render(<DateCal value="2026-11-05" today="2026-11-03" onPick={() => {}} />)
    swipe(t('dcal-grid'), -80)
    fireEvent.pointerDown(t('dcal-next')); fireEvent.click(t('dcal-next'))
    expect(calMonth()).toBe('2027-01')
  })
})

/* THE DESIGN LOOK OF 13 OCT 26 (docs/handpass/2026-10-13-design-look.md; owner D830 — "L1 to L17 and K1 to K4, K7 to
   K10, K12", none left out). What the look found missing on the calendar itself: an UPPER limit (L14 — the Tracker's
   boxes that refuse a day after today showed tomorrow as pickable), and four keys (K1–K4). Each test below was written
   first and failed first. The keys are pinned as a table: each key × the dates showing / the lists open / a first or
   last date in the way / a month's edge / a year's edge. */
describe('a last date that may be picked (L14 — `max`, the mirror of `min`)', () => {
  it('a date after it is faint, says so, and a tap on it picks nothing', () => {
    const onPick = vi.fn()
    render(<DateCal value="" at="2026-11-01" max="2026-11-12" today="2026-11-03" onPick={onPick} />)
    expect(t('dcal').getAttribute('data-max')).toBe('2026-11-12')
    expect((day('2026-11-13') as HTMLButtonElement).disabled).toBe(true)
    expect(has('2026-11-13', 'is-out')).toBe(true)
    expect((day('2026-11-12') as HTMLButtonElement).disabled).toBe(false)
    expect(has('2026-11-12', 'is-out')).toBe(false)
    fireEvent.click(day('2026-11-13'))
    expect(onPick).not.toHaveBeenCalled()
    fireEvent.click(day('2026-11-12'))
    expect(onPick).toHaveBeenCalledWith('2026-11-12')
  })
  it('with none told, no date is faint and nothing says there is one', () => {
    render(<DateCal value="" at="2026-11-01" today="2026-11-03" onPick={() => {}} />)
    expect(t('dcal').getAttribute('data-max')).toBeNull()
    expect(t('dcal-grid').querySelector('.is-out')).toBeNull()
  })
  it('a first and a last date together leave only the dates between them', () => {
    render(<DateCal value="" at="2026-11-01" min="2026-11-10" max="2026-11-12" today="2026-11-03" onPick={() => {}} />)
    const live = [...t('dcal-grid').querySelectorAll('button')].filter(b => !b.disabled).map(b => b.getAttribute('data-iso'))
    expect(live).toEqual(['2026-11-10', '2026-11-11', '2026-11-12'])
  })
  it('the arrow keys never walk past it, as they never walk before the first', () => {
    render(<DateCal value="2026-11-12" max="2026-11-12" today="2026-11-03" onPick={() => {}} />)
    day('2026-11-12').focus()
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(day('2026-11-12'))
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(day('2026-11-12'))
    fireEvent.keyDown(document.activeElement!, { key: 'PageDown' })
    expect(document.activeElement).toBe(day('2026-11-12')); expect(calMonth()).toBe('2026-11')
    /* and back from it is free */
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(day('2026-11-11'))
  })
  it('the tab stop is never a date past it; a month wholly past it has no date to stop on', () => {
    const stops = () => [...t('dcal-grid').querySelectorAll('button')].filter(b => b.tabIndex === 0).map(b => b.getAttribute('data-iso'))
    /* today is past the last date: the stop is the first date that may be picked, not today */
    render(<DateCal value="" at="2026-11-01" max="2026-11-02" today="2026-11-03" onPick={() => {}} />)
    expect(stops()).toEqual(['2026-11-01'])
    fireEvent.click(t('dcal-next'))
    expect(stops()).toEqual([])
  })
  it('with nothing picked and today already past it, the calendar opens on ITS month — as it opens on a first date still to come', () => {
    render(<DateCal value="" max="2026-08-20" today="2026-11-03" onPick={() => {}} />)
    expect(calMonth()).toBe('2026-08')
  })
})

describe('the keys the look found missing on the dates (K1, K2 — D830)', () => {
  const at = (iso: string) => { day(iso).focus(); return (key: string, extra: object = {}) => fireEvent.keyDown(document.activeElement!, { key, ...extra }) }
  const on = () => document.activeElement!.getAttribute('data-iso')

  it('K1 — Home is the Monday of the week and End its Sunday (the weeks run Monday first — D797)', () => {
    render(<DateCal value="2026-11-05" today="2026-11-03" onPick={() => {}} />)
    const key = at('2026-11-05')                                          // a Thursday
    key('Home'); expect(on()).toBe('2026-11-02')
    key('Home'); expect(on(), 'on the Monday already: it stays').toBe('2026-11-02')
    key('End'); expect(on()).toBe('2026-11-08')
    key('End'); expect(on(), 'on the Sunday already: it stays').toBe('2026-11-08')
  })
  it('K1 — the key is the calendar’s own: the page behind does not jump to its top or its foot', () => {
    render(<DateCal value="2026-11-05" today="2026-11-03" onPick={() => {}} />)
    day('2026-11-05').focus()
    /* fireEvent answers false when the key was taken */
    expect(fireEvent.keyDown(document.activeElement!, { key: 'Home' })).toBe(false)
    expect(fireEvent.keyDown(document.activeElement!, { key: 'End' })).toBe(false)
  })
  it('K1 — at a month’s edge the week’s end is in the next month, and the calendar turns to it', () => {
    render(<DateCal value="2026-11-01" today="2026-11-03" onPick={() => {}} />)
    /* 1 Nov 2026 is a Sunday: its week began on Monday 26 Oct */
    at('2026-11-01')('Home')
    expect(calMonth()).toBe('2026-10'); expect(on()).toBe('2026-10-26')
    /* Monday 30 Nov: its week ends on Sunday 6 Dec */
    calShow(2026, 11)
    at('2026-11-30')('End')
    expect(calMonth()).toBe('2026-12'); expect(on()).toBe('2026-12-06')
  })
  it('K1 — at a year’s edge too', () => {
    render(<DateCal value="2027-01-01" today="2026-11-03" onPick={() => {}} />)
    at('2027-01-01')('Home')                                              // a Friday
    expect(calMonth()).toBe('2026-12'); expect(on()).toBe('2026-12-28')
    at('2026-12-31')('End')                                               // a Thursday
    expect(calMonth()).toBe('2027-01'); expect(on()).toBe('2027-01-03')
  })
  it('K1 — a week’s end that may not be picked is not walked onto: the keyboard stays where it is', () => {
    const a = render(<DateCal value="2026-11-05" min="2026-11-04" today="2026-11-03" onPick={() => {}} />)
    at('2026-11-05')('Home')
    expect(on()).toBe('2026-11-05'); a.unmount()
    render(<DateCal value="2026-11-05" max="2026-11-06" today="2026-11-03" onPick={() => {}} />)
    at('2026-11-05')('End')
    expect(on()).toBe('2026-11-05')
  })

  it('K2 — Shift + Page Down / Up is a year; Page Down / Up alone is still a month', () => {
    render(<DateCal value="2026-11-05" today="2026-11-03" onPick={() => {}} />)
    const key = at('2026-11-05')
    key('PageDown', { shiftKey: true }); expect(calMonth()).toBe('2027-11'); expect(on()).toBe('2027-11-05')
    key('PageUp', { shiftKey: true }); key('PageUp', { shiftKey: true }); expect(calMonth()).toBe('2025-11'); expect(on()).toBe('2025-11-05')
    key('PageDown'); expect(calMonth()).toBe('2025-12'); expect(on()).toBe('2025-12-05')
    key('PageUp'); expect(calMonth()).toBe('2025-11'); expect(on()).toBe('2025-11-05')
  })
  it('K2 — from the 29th of February it is the 28th a year on, and a year back', () => {
    render(<DateCal value="2028-02-29" today="2026-11-03" onPick={() => {}} />)
    at('2028-02-29')('PageDown', { shiftKey: true })
    expect(calMonth()).toBe('2029-02'); expect(on()).toBe('2029-02-28')
    calShow(2028, 2)
    at('2028-02-29')('PageUp', { shiftKey: true })
    expect(calMonth()).toBe('2027-02'); expect(on()).toBe('2027-02-28')
  })
  it('K2 — from a year’s last day it is the next year’s last day, never a day into the year after', () => {
    render(<DateCal value="2026-12-31" today="2026-11-03" onPick={() => {}} />)
    at('2026-12-31')('PageDown', { shiftKey: true })
    expect(on()).toBe('2027-12-31')
    at('2027-12-31')('PageUp', { shiftKey: true })
    expect(on()).toBe('2026-12-31')
  })
  it('K2 — a year on that may not be picked is not walked onto', () => {
    const a = render(<DateCal value="2026-11-05" max="2027-06-01" today="2026-11-03" onPick={() => {}} />)
    at('2026-11-05')('PageDown', { shiftKey: true })
    expect(calMonth()).toBe('2026-11'); expect(on()).toBe('2026-11-05'); a.unmount()
    render(<DateCal value="2026-11-05" min="2026-01-01" today="2026-11-03" onPick={() => {}} />)
    at('2026-11-05')('PageUp', { shiftKey: true })
    expect(calMonth()).toBe('2026-11'); expect(on()).toBe('2026-11-05')
  })
  /* "NOT TAKEN" WAS THE FAULT (the check's walk, 14 Oct 26). This test first asked that the key be left alone — and in a
     real browser a key left alone by a scrolling box that holds the keyboard SCROLLS it: End ran the years to the foot
     of their window, and once the scrolling stopped the row left in the band was chosen — 2086 from 2026, by a key the
     calendar gives no meaning in a list. (Seen by the walk's own script one run in four: it read the year before the
     scrolling had settled.) There is no scrolling here to see it by, so what is pinned is the cause: in a list the
     browser is not left these keys — Home, End, Page Up, Page Down, with Shift or without, and Space. */
  it('K1, K2 — with the lists open those keys are not the lists’: nothing moves, and the browser is not left them to scroll the list by', () => {
    render(<DateCal value="2026-11-05" today="2026-11-03" onPick={() => {}} />)
    fireEvent.click(t('dcal-title'))
    for (const which of ['dcal-months', 'dcal-years']) {
      for (const [key, shiftKey] of [['Home', false], ['End', false], ['PageDown', false], ['PageUp', false], ['PageDown', true], ['PageUp', true], [' ', false]] as const) {
        expect(fireEvent.keyDown(t(which), { key, shiftKey }), `${JSON.stringify(key)}${shiftKey ? ' with Shift' : ''} on ${which} is taken from the browser`).toBe(false)
      }
    }
    expect(t('dcal-title').textContent).toContain('November 2026')
    expect(t('dcal-lists')).toBeTruthy()
  })
})

describe('the keyboard’s way into and out of the month-and-year lists (K3, K4 — D830)', () => {
  /* a click made by a key has no pointer's count (`detail` 0) — as the date box tells the two apart (ui/DateBox.tsx) */
  const byKey = { detail: 0 }, byPointer = { detail: 1 }
  const on = () => document.activeElement!.getAttribute('data-iso')

  it('K3 — Enter on the title opens the lists with the keyboard IN the month list', () => {
    render(<DateCal value="2026-11-05" today="2026-11-03" onPick={() => {}} />)
    t('dcal-title').focus()
    fireEvent.click(t('dcal-title'), byKey)
    expect(t('dcal-lists')).toBeTruthy()
    expect(document.activeElement).toBe(t('dcal-months'))
    /* and the arrows are at once the list's */
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowDown' })
    expect(t('dcal-title').textContent).toContain('December 2026')
  })
  it('K3 — a tap or a click on the title opens the lists and takes the keyboard nowhere', () => {
    render(<DateCal value="2026-11-05" today="2026-11-03" onPick={() => {}} />)
    t('dcal-title').focus()
    fireEvent.click(t('dcal-title'), byPointer)
    expect(t('dcal-lists')).toBeTruthy()
    expect(document.activeElement).toBe(t('dcal-title'))
  })
  it('K3 — Enter on the title with the lists open brings the dates back, the keyboard still on the title (as built)', () => {
    render(<DateCal value="2026-11-05" today="2026-11-03" onPick={() => {}} />)
    t('dcal-title').focus()
    fireEvent.click(t('dcal-title'), byPointer)
    fireEvent.click(t('dcal-title'), byKey)
    expect(q('dcal-lists')).toBeNull(); expect(t('dcal-grid')).toBeTruthy()
    expect(document.activeElement).toBe(t('dcal-title'))
  })

  it('K4 — Enter in the month list closes the lists onto that month’s dates, the keyboard on the 1st where nothing of it is picked', () => {
    const onPick = vi.fn()
    render(<DateCal value="2026-11-05" today="2026-11-03" onPick={onPick} />)
    fireEvent.click(t('dcal-title'), byKey)
    fireEvent.keyDown(t('dcal-months'), { key: 'ArrowDown' })
    expect(fireEvent.keyDown(t('dcal-months'), { key: 'Enter' }), 'the key is taken').toBe(false)
    expect(q('dcal-lists')).toBeNull()
    expect(calMonth()).toBe('2026-12')
    expect(on()).toBe('2026-12-01')
    expect(onPick, 'choosing a month picks no date').not.toHaveBeenCalled()
    /* the arrows are the dates' again */
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' })
    expect(on()).toBe('2026-12-02')
  })
  it('K4 — Enter in the year list does the same', () => {
    render(<DateCal value="2026-11-05" today="2026-11-03" onPick={() => {}} />)
    fireEvent.click(t('dcal-title'), byKey)
    fireEvent.keyDown(t('dcal-years'), { key: 'ArrowDown' })
    fireEvent.keyDown(t('dcal-years'), { key: 'Enter' })
    expect(q('dcal-lists')).toBeNull()
    expect(calMonth()).toBe('2027-11'); expect(on()).toBe('2027-11-01')
  })
  it('K4 — the keyboard lands on the picked date where the month holds it, else on today', () => {
    const a = render(<DateCal value="2026-11-05" today="2026-11-03" onPick={() => {}} />)
    fireEvent.click(t('dcal-title'), byKey)
    fireEvent.keyDown(t('dcal-months'), { key: 'Enter' })
    expect(on()).toBe('2026-11-05'); a.unmount()
    render(<DateCal value="" at="2027-02-01" today="2026-11-03" onPick={() => {}} />)
    fireEvent.click(t('dcal-title'), byKey)
    fireEvent.click(calRow('months', 'November')); fireEvent.click(calRow('years', '2026'))
    fireEvent.keyDown(t('dcal-years'), { key: 'Enter' })
    expect(calMonth()).toBe('2026-11'); expect(on()).toBe('2026-11-03')
  })
  it('K4 — the months go round at the year’s edge: Enter on January, reached below December, shows that January', () => {
    render(<DateCal value="2026-12-10" today="2026-11-03" onPick={() => {}} />)
    fireEvent.click(t('dcal-title'), byKey)
    fireEvent.keyDown(t('dcal-months'), { key: 'ArrowDown' })
    fireEvent.keyDown(t('dcal-months'), { key: 'Enter' })
    /* the year is the other list's (as built): January of the year shown */
    expect(calMonth()).toBe('2026-01'); expect(on()).toBe('2026-01-01')
  })
  it('K4 — with a first date in the way the keyboard lands on the first date that may be picked', () => {
    render(<DateCal value="" at="2026-11-01" min="2026-12-10" today="2026-11-03" onPick={() => {}} />)
    fireEvent.click(t('dcal-title'), byKey)
    fireEvent.click(calRow('months', 'December'))
    fireEvent.keyDown(t('dcal-months'), { key: 'Enter' })
    expect(calMonth()).toBe('2026-12'); expect(on()).toBe('2026-12-10')
  })
  it('K4 — a month with no date that may be picked: the dates come back and the keyboard is on the title, never on nothing', () => {
    render(<DateCal value="" at="2026-11-01" max="2026-11-20" today="2026-11-03" onPick={() => {}} />)
    fireEvent.click(t('dcal-title'), byKey)
    fireEvent.keyDown(t('dcal-months'), { key: 'ArrowDown' })
    fireEvent.keyDown(t('dcal-months'), { key: 'Enter' })
    expect(calMonth()).toBe('2026-12'); expect(q('dcal-lists')).toBeNull()
    expect(document.activeElement).toBe(t('dcal-title'))
  })
  /* (Space was first written here as "not taken". A real browser scrolls a list by it — six years on — so it is one of
     the keys the list keeps from the browser: the test above, 14 Oct 26.) */
  it('K4 — every other key in a list is as it was: the arrows move a row; Tab and a letter are left to the browser', () => {
    render(<DateCal value="2026-11-05" today="2026-11-03" onPick={() => {}} />)
    fireEvent.click(t('dcal-title'), byKey)
    expect(fireEvent.keyDown(t('dcal-months'), { key: 'a' })).toBe(true)
    expect(fireEvent.keyDown(t('dcal-months'), { key: 'Tab' })).toBe(true)
    expect(t('dcal-lists')).toBeTruthy()
    expect(fireEvent.keyDown(t('dcal-months'), { key: 'ArrowUp' })).toBe(false)
    expect(t('dcal-title').textContent).toContain('October 2026')
  })
})

describe('Enter on the calendar never sends the form it is drawn in', () => {
  /* Enter on a button is a click; a button that is not said to be a plain one SENDS its form. Every button of the
     calendar says so — pinned here because a calendar drawn inside its form (D797) has a form around it. */
  it('every button of it is a plain button, with the dates showing and with the lists open', () => {
    render(<DateCal mode="run" from="2026-11-09" to="2026-11-12" today="2026-11-03" onRun={() => {}} foot="x" />)
    const plain = () => [...t('dcal').querySelectorAll('button')].map(b => b.getAttribute('type'))
    expect(plain().length).toBeGreaterThan(30); expect(new Set(plain())).toEqual(new Set(['button']))
    fireEvent.click(t('dcal-title'))
    expect(plain().length).toBeGreaterThan(1); expect(new Set(plain())).toEqual(new Set(['button']))
  })
  it('a date, the title, Today, an arrow and Enter in a list: none of them sends the form', () => {
    const sent = vi.fn((e: { preventDefault: () => void }) => e.preventDefault())
    const onPick = vi.fn()
    render(<form onSubmit={sent}><DateCal value="2026-11-05" today="2026-11-03" onPick={onPick} /><button data-testid="send">Save</button></form>)
    fireEvent.click(day('2026-11-19')); fireEvent.click(t('dcal-next')); fireEvent.click(t('dcal-today'))
    fireEvent.click(t('dcal-title')); fireEvent.keyDown(t('dcal-months'), { key: 'Enter' })
    expect(onPick).toHaveBeenCalledWith('2026-11-19')
    expect(sent).not.toHaveBeenCalled()
    /* the premise: this form does send when its own button is pressed */
    fireEvent.click(t('send'))
    expect(sent).toHaveBeenCalledTimes(1)
  })
})

describe('the title’s words (L13 — D830)', () => {
  it('the month, the year and the small arrow sit together inside the title, so its keyboard ring can go round the words and not the room kept beside them', () => {
    render(<DateCal value="2026-11-05" today="2026-11-03" onPick={() => {}} />)
    const words = t('dcal-title').querySelector('.dcal-tw')!
    expect(words, 'the title has no element round its words').toBeTruthy()
    expect(t('dcal-title').children).toHaveLength(1)
    expect(words.querySelector('.dcal-my')!.textContent).toBe('November 2026')
    expect(words.querySelector('i')!.textContent).toBe('›')
    fireEvent.click(t('dcal-title'))
    expect(t('dcal-title').querySelector('.dcal-tw i')!.textContent).toBe('▾')
  })
})

describe('a control tapped repeatedly does not move', () => {
  it('the test kit’s page-turner lands on any month by the arrows alone', () => {
    render(<DateCal value="2026-11-05" today="2026-11-03" onPick={() => {}} />)
    calPage(2027, 4); expect(calMonth()).toBe('2027-04')
    calPage(2025, 12); expect(calMonth()).toBe('2025-12')
  })
})
