// @vitest-environment jsdom
/* THE APP'S OWN DATE BOX (ui/DateBox.tsx) — [ONE-DATE-CALENDAR] step one; the design of record
   docs/superpowers/specs/2026-10-13-one-date-calendar.md §Where it sits.

   Owner, D795 (13 Oct 26): the From box is "the app's own field" — not the phone's date box, which an iPhone gives a
   width of its own (his picture: it ran off the screen). D797: a date that is one box among others opens the calendar
   OVER its form — "a tap picks and it goes; a tap outside closes it and changes nothing".

   What is pinned HERE is the box and its floating layer: the words it reads, what opens and closes the calendar, where
   the keyboard goes, and that Escape closes the calendar FIRST and the window behind it only on a second press. The
   calendar itself is ui/datecal.test.tsx; that the layer is really on top of each surface it opens over is a browser
   test (e2e/datebox.spec.ts) — jsdom has no layout. */
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { DateBox } from './DateBox'
import { FloatWin, _resetFloatWins } from './FloatWindow'
import { boxValue, calMonth, pickDate } from './datecal-testkit'

beforeEach(() => {
  /* today is Tue 3 Nov 2026 — only the clock's date is held still */
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 10, 3, 12, 0, 0))
})
afterEach(() => { cleanup(); _resetFloatWins(); vi.useRealTimers() })

const t = (id: string) => screen.getByTestId(id)
const q = (id: string) => screen.queryByTestId(id)
/* the calendar's layer — not the small patch that stands for a moment after it has gone, which wears the same class */
const layer = () => document.querySelector('.dcal-layer:not(.dcal-patch)')

function Box(p: { value0?: string; onChange?: (v: string) => void; min?: string; markWd?: number; at?: string; disabled?: boolean }) {
  const [v, setV] = useState(p.value0 ?? '2026-11-05')
  return <DateBox id="theBox" testid="box" label="From" value={v} min={p.min} markWd={p.markWd} at={p.at} disabled={p.disabled}
    onChange={x => { setV(x); p.onChange?.(x) }} />
}

describe('the box', () => {
  it('reads its date in words, and "Pick a date" when it has none', () => {
    const a = render(<Box />)
    expect(t('box').textContent).toContain('Thu 5 Nov 2026')
    expect(boxValue(t('box'))).toBe('2026-11-05')
    a.unmount()
    render(<Box value0="" />)
    expect(t('box').textContent).toContain('Pick a date')
    expect(boxValue(t('box'))).toBe('')
    expect(t('box').classList.contains('is-empty')).toBe(true)
  })
  it('is a button of the app’s own — nothing of the phone’s date box is left in it', () => {
    render(<Box />)
    expect(t('box').tagName).toBe('BUTTON')
    expect(t('box').getAttribute('type')).toBe('button')
    expect(document.querySelector('input[type="date"]')).toBeNull()
    expect(t('box').id).toBe('theBox')
  })
  it('says what it is and what it holds to a screen reader, and that it opens something', () => {
    render(<Box />)
    expect(t('box').getAttribute('aria-label')).toBe('From: Thu 5 Nov 2026')
    expect(t('box').getAttribute('aria-haspopup')).toBe('dialog')
    expect(t('box').getAttribute('aria-expanded')).toBe('false')
  })
  /* the Tracker's two End date boxes are 108px wide on a phone: "Wed 28 Oct 2026" was cut to "Wed 28 Oct 20…" there
     (the host's look, 13 Oct 26). A box told it is narrow leaves the weekday out of what it SHOWS — the date is whole,
     still in words — and still says the whole of it to a screen reader. */
  it('a narrow box leaves the weekday out of its words, never out of what it says aloud', () => {
    render(<DateBox testid="nb" label="End date A" value="2026-10-28" noWeekday onChange={() => {}} />)
    expect(t('nb').querySelector('.datebox-txt')!.textContent).toBe('28 Oct 2026')
    expect(t('nb').getAttribute('aria-label')).toBe('End date A: Wed 28 Oct 2026')
    expect(boxValue(t('nb'))).toBe('2026-10-28')
  })
})

describe('opening it', () => {
  it('a tap opens the calendar as a layer over the whole page, on the month of its date', () => {
    render(<Box />)
    expect(layer()).toBeNull()
    fireEvent.click(t('box'))
    expect(layer()).toBeTruthy()
    /* on the page itself, not inside the form that holds the box: so it floats over every window and sheet */
    expect(layer()!.parentElement).toBe(document.body)
    expect(t('box').getAttribute('aria-expanded')).toBe('true')
    expect(t('box').classList.contains('is-open')).toBe(true)
    const card = t('dcal-card')
    expect(card.getAttribute('role')).toBe('dialog')
    expect(card.getAttribute('aria-modal')).toBe('true')
    expect(card.getAttribute('aria-label')).toBe('From — pick a date')
    expect(calMonth()).toBe('2026-11')
    expect(t('dcal-day-2026-11-05').classList.contains('is-sel')).toBe(true)
  })
  it('an empty box opens on the month it is told, else on today’s', () => {
    const a = render(<Box value0="" at="2026-07-14" />)
    fireEvent.click(t('box')); expect(calMonth()).toBe('2026-07'); a.unmount()
    render(<Box value0="" />)
    fireEvent.click(t('box')); expect(calMonth()).toBe('2026-11')
  })
  it('hands the calendar the weekday that stands out and the first date that may be picked', () => {
    render(<Box value0="" markWd={3} min="2026-11-12" />)
    fireEvent.click(t('box'))
    expect(t('dcal').classList.contains('is-marked')).toBe(true)
    expect((t('dcal-day-2026-11-11') as HTMLButtonElement).disabled).toBe(true)
  })
  it('a box that is switched off opens nothing', () => {
    render(<Box disabled />)
    expect((t('box') as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(t('box'))
    expect(layer()).toBeNull()
  })
  it('the keyboard goes onto the picked date when it opens', () => {
    render(<Box />)
    fireEvent.click(t('box'))
    expect(document.activeElement).toBe(t('dcal-day-2026-11-05'))
  })
})

describe('picking', () => {
  it('a tap on a date picks it and the calendar goes — one change, the date as the form takes it', () => {
    const onChange = vi.fn()
    render(<Box onChange={onChange} />)
    fireEvent.click(t('box'))
    fireEvent.click(t('dcal-day-2026-11-19'))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('2026-11-19')
    expect(layer()).toBeNull()
    expect(t('box').textContent).toContain('Thu 19 Nov 2026')
    expect(t('box').getAttribute('aria-expanded')).toBe('false')
  })
  it('a tap on the date already picked changes nothing and still closes', () => {
    const onChange = vi.fn()
    render(<Box onChange={onChange} />)
    fireEvent.click(t('box'))
    fireEvent.click(t('dcal-day-2026-11-05'))
    expect(onChange).not.toHaveBeenCalled()
    expect(layer()).toBeNull()
  })
  it('a date years away is reached and picked (the test kit’s own route, by the arrows)', () => {
    const onChange = vi.fn()
    render(<Box onChange={onChange} />)
    pickDate(t('box'), '2029-02-28')
    expect(onChange).toHaveBeenCalledWith('2029-02-28')
    expect(boxValue(t('box'))).toBe('2029-02-28')
  })
  it('the keyboard is back on the box once the calendar has gone', () => {
    render(<Box />)
    t('box').focus()
    fireEvent.click(t('box'))
    fireEvent.click(t('dcal-day-2026-11-19'))
    expect(document.activeElement).toBe(t('box'))
  })
})

describe('closing it without picking', () => {
  it('a tap outside closes it and changes nothing', () => {
    const onChange = vi.fn()
    render(<Box onChange={onChange} />)
    fireEvent.click(t('box'))
    fireEvent.click(t('dcal-scrim'))
    expect(layer()).toBeNull()
    expect(onChange).not.toHaveBeenCalled()
    expect(boxValue(t('box'))).toBe('2026-11-05')
  })
  it('a press on the calendar itself — its head, an empty place — is not "outside"', () => {
    render(<Box />)
    fireEvent.click(t('box'))
    fireEvent.pointerDown(t('dcal-card')); fireEvent.click(t('dcal-card'))
    fireEvent.click(t('dcal-dow'))
    fireEvent.click(t('dcal-next'))
    expect(layer()).toBeTruthy()
    expect(calMonth()).toBe('2026-12')
  })
  it('turning the months and choosing a month and year pick nothing: the box keeps its date', () => {
    const onChange = vi.fn()
    render(<Box onChange={onChange} />)
    fireEvent.click(t('box'))
    fireEvent.click(t('dcal-next')); fireEvent.click(t('dcal-title')); fireEvent.click(t('dcal-today'))
    fireEvent.click(t('dcal-scrim'))
    expect(onChange).not.toHaveBeenCalled()
  })
  it('a second tap on the open box closes it and changes nothing', () => {
    const onChange = vi.fn()
    render(<Box onChange={onChange} />)
    fireEvent.click(t('box')); fireEvent.click(t('box'))
    expect(layer()).toBeNull()
    expect(onChange).not.toHaveBeenCalled()
  })
  it('the layer leaves the page with its box', () => {
    const a = render(<Box />)
    fireEvent.click(t('box'))
    a.unmount()
    expect(layer()).toBeNull()
  })
})

describe('Escape', () => {
  it('closes the calendar and puts the keyboard back on the box', () => {
    render(<Box />)
    fireEvent.click(t('box'))
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
    expect(layer()).toBeNull()
    expect(document.activeElement).toBe(t('box'))
  })
  it('closes the calendar FIRST — the window behind it closes only on a second press', () => {
    const onClose = vi.fn()
    render(<FloatWin id="w" title="A form" testid="win-w" onClose={onClose}><Box /></FloatWin>)
    fireEvent.click(t('box'))
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
    expect(layer()).toBeNull()
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
  it('with no calendar open the box takes no Escape: the window behind closes at once', () => {
    const onClose = vi.fn()
    render(<FloatWin id="w" title="A form" testid="win-w" onClose={onClose}><Box /></FloatWin>)
    t('box').focus()
    fireEvent.keyDown(t('box'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
  it('with the month-and-year lists open, Escape still closes the whole calendar', () => {
    render(<Box />)
    fireEvent.click(t('box')); fireEvent.click(t('dcal-title'))
    fireEvent.keyDown(t('dcal-months'), { key: 'Escape' })
    expect(layer()).toBeNull()
  })
})

describe('the keyboard stays in the calendar while it is up', () => {
  const stops = () => [...t('dcal-card').querySelectorAll<HTMLElement>('button, [tabindex]')].filter(e => !(e as HTMLButtonElement).disabled && e.tabIndex >= 0)
  it('Tab from its last stop goes to its first, and Shift+Tab from its first to its last', () => {
    render(<Box />)
    fireEvent.click(t('box'))
    const all = stops()
    expect(all.length).toBeGreaterThan(3)
    all[all.length - 1].focus()
    fireEvent.keyDown(document.activeElement!, { key: 'Tab' })
    expect(document.activeElement).toBe(all[0])
    fireEvent.keyDown(document.activeElement!, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(all[all.length - 1])
  })
  it('a key pressed in the calendar is not heard by the form behind it', () => {
    const heard = vi.fn()
    render(<div onKeyDown={heard} onClick={heard}><Box /></div>)
    fireEvent.click(t('box'))
    heard.mockClear()
    fireEvent.keyDown(t('dcal-day-2026-11-05'), { key: 'ArrowRight' })
    fireEvent.keyDown(t('dcal-day-2026-11-06'), { key: 'Enter' })
    fireEvent.click(t('dcal-next'))
    expect(heard).not.toHaveBeenCalled()
  })
})

/* THE READ'S F1 (13 Oct 26): the calendar goes at the first click of a double-click, and the second click fell on
   whatever of the form lay under that date — Save, a rule's Remove, a leave chip, the shade that closes a Leave War
   sheet. For a moment after a pick or a tap outside made by a pointer, a small see-through patch stands where the click
   landed and takes the click that may follow there. By place AND time, as the Leave War guards its Move button: a
   time alone would eat a deliberate quick click somewhere else. */
describe('the same tap made twice does nothing more', () => {
  const at = { detail: 1, clientX: 140, clientY: 260 }
  it('a date picked by a pointer leaves a patch where the click landed, and it takes the click that follows', () => {
    const behind = vi.fn()
    render(<div onClick={behind}><Box /></div>)
    fireEvent.click(t('box'))
    fireEvent.click(t('dcal-day-2026-11-19'), at)
    expect(layer()).toBeNull()
    const patch = t('dcal-patch')
    expect(patch.parentElement).toBe(document.body)
    expect(patch.style.left).toBe('128px'); expect(patch.style.top).toBe('248px')
    expect(patch.style.width).toBe('24px'); expect(patch.style.height).toBe('24px')
    /* it carries the layer's own class, so a Leave War sheet's tap shield lets it through as it does the calendar */
    expect(patch.classList.contains('dcal-layer')).toBe(true)
    behind.mockClear()
    fireEvent.pointerDown(patch); fireEvent.mouseDown(patch); fireEvent.click(patch, at)
    expect(behind).not.toHaveBeenCalled()
    expect(q('dcal-patch'), 'the patch is spent by the click it took').toBeNull()
    expect(boxValue(t('box'))).toBe('2026-11-19')
  })
  it('the patch goes by itself after a moment, so a later press there is its own', () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] })
    vi.setSystemTime(new Date(2026, 10, 3, 12, 0, 0))
    render(<Box />)
    fireEvent.click(t('box'))
    fireEvent.click(t('dcal-day-2026-11-19'), at)
    expect(q('dcal-patch')).toBeTruthy()
    act(() => { vi.advanceTimersByTime(399) })
    expect(q('dcal-patch')).toBeTruthy()
    act(() => { vi.advanceTimersByTime(2) })
    expect(q('dcal-patch')).toBeNull()
  })
  it('a tap outside made by a pointer leaves one too; a pick by the keyboard, and Escape, leave none', () => {
    render(<Box />)
    fireEvent.click(t('box'))
    fireEvent.click(t('dcal-scrim'), at)
    expect(layer()).toBeNull(); expect(q('dcal-patch')).toBeTruthy()
    cleanup()
    render(<Box />)
    fireEvent.click(t('box'))
    fireEvent.click(t('dcal-day-2026-11-19'))                              // Enter on a date is a click with no pointer
    expect(q('dcal-patch')).toBeNull()
    fireEvent.click(t('box'))
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
    expect(q('dcal-patch')).toBeNull()
  })
  it('opening the box again while a patch stands takes the patch away', () => {
    render(<Box />)
    fireEvent.click(t('box'))
    fireEvent.click(t('dcal-day-2026-11-19'), at)
    fireEvent.click(t('box'))
    expect(q('dcal-patch')).toBeNull(); expect(layer()).toBeTruthy()
  })
  it('the patch leaves the page with its box', () => {
    const a = render(<Box />)
    fireEvent.click(t('box'))
    fireEvent.click(t('dcal-day-2026-11-19'), at)
    a.unmount()
    expect(q('dcal-patch')).toBeNull()
  })
})

/* THE READ'S F7 (latent): a box switched off while its calendar is up must not spring open again when switched on */
describe('a box switched off while its calendar is up', () => {
  it('is closed for good: switched on again, no calendar is up', () => {
    const view = render(<DateBox testid="box" label="From" value="2026-11-05" onChange={() => {}} />)
    fireEvent.click(t('box'))
    expect(layer()).toBeTruthy()
    view.rerender(<DateBox testid="box" label="From" value="2026-11-05" onChange={() => {}} disabled />)
    expect(layer()).toBeNull()
    view.rerender(<DateBox testid="box" label="From" value="2026-11-05" onChange={() => {}} />)
    expect(layer(), 'the calendar came back up by itself').toBeNull()
    expect(t('box').getAttribute('aria-expanded')).toBe('false')
  })
})

describe('the page behind does not scroll under the calendar (the walk, 13 Oct 26)', () => {
  const wheel = (el: Element) => { const e = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 120 }); el.dispatchEvent(e); return e.defaultPrevented }
  it('a mouse wheel over the veil or the dates scrolls nothing; over a month-and-year list it scrolls that list', () => {
    render(<Box />)
    fireEvent.click(t('box'))
    expect(wheel(t('dcal-scrim')), 'the wheel over the veil is left to scroll the page').toBe(true)
    expect(wheel(t('dcal-day-2026-11-05')), 'the wheel over the dates is left to scroll the page').toBe(true)
    expect(wheel(t('dcal-title'))).toBe(true)
    fireEvent.click(t('dcal-title'))
    expect(wheel(t('dcal-years').querySelector('[role="option"]')!), 'the wheel over the year list is taken from it').toBe(false)
    expect(wheel(t('dcal-months'))).toBe(false)
    expect(wheel(t('dcal-today'))).toBe(true)
  })
  it('with no calendar up, the wheel is nobody’s but the page’s', () => {
    render(<Box />)
    expect(wheel(t('box'))).toBe(false)
    fireEvent.click(t('box')); fireEvent.click(t('dcal-scrim'))
    expect(wheel(t('box'))).toBe(false)
  })
})

describe('a phone turned on its side with the calendar up (the walk, 13 Oct 26)', () => {
  const realMM = window.matchMedia
  const screenIs = (phone: boolean) => { (window as any).matchMedia = (q: string) => ({ matches: phone && /max-width:\s*620px/.test(q), addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }) }
  afterEach(() => { (window as any).matchMedia = realMM })
  it('the layout is asked again when the screen changes size, and the desktop panel’s place is given back', () => {
    screenIs(false)
    render(<Box />)
    fireEvent.click(t('box'))
    expect(layer()!.classList.contains('is-phone')).toBe(false)
    /* a desktop's panel is placed under its box: its place is written on the card */
    expect(t('dcal-card').style.left).not.toBe('')
    screenIs(true)
    fireEvent(window, new Event('resize'))
    expect(layer()!.classList.contains('is-phone'), 'still the desktop layout on a phone-wide screen').toBe(true)
    expect(t('dcal-card').style.left, 'the desktop panel’s place is still written on the phone’s card').toBe('')
    expect(t('dcal-card').style.top).toBe('')
    screenIs(false)
    fireEvent(window, new Event('resize'))
    expect(layer()!.classList.contains('is-phone')).toBe(false)
    expect(t('dcal-card').style.left).not.toBe('')
    /* and it is still the same calendar, open, with its date */
    expect(t('dcal-day-2026-11-05').classList.contains('is-sel')).toBe(true)
  })
})

describe('two boxes on one form', () => {
  it('only one calendar is up at a time, and each picks for its own box', () => {
    function Two() {
      const [a, setA] = useState('2026-11-05'); const [b, setB] = useState('')
      return <><DateBox testid="a" label="From" value={a} onChange={setA} /><DateBox testid="b" label="Until" value={b} min={a} onChange={setB} /></>
    }
    render(<Two />)
    pickDate(t('a'), '2026-11-12')
    expect(boxValue(t('a'))).toBe('2026-11-12'); expect(boxValue(t('b'))).toBe('')
    fireEvent.click(t('b'))
    expect(document.querySelectorAll('.dcal-layer')).toHaveLength(1)
    /* an empty box with a first date opens on that date's month, and what comes before it is faint */
    expect((t('dcal-day-2026-11-11') as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(t('dcal-day-2026-11-26'))
    expect(boxValue(t('b'))).toBe('2026-11-26'); expect(boxValue(t('a'))).toBe('2026-11-12')
    expect(q('dcal-card')).toBeNull()
  })
})
