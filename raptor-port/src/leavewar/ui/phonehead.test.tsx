/* THE TOP OF THE LEAVE WAR ON A PHONE IS TWO LINES ([LW-PHONE-HEADER-SPACE] — owner, D678, 8 Oct 26: "A looks good",
   of three ideas drawn into the running build after "how can we optimise the space such that we don't use so much
   vertical space?"), AND A DESKTOP'S IS AS IT WAS (D679 — "keep the same for desktop").

   On a phone: the words "Period" and "Under-manned" go (the buttons beside them say it); "+ New" reads "+"; the one open
   chip reads "Open 1 Jan – 31 Mar" (on a desktop "Open for bidding …"); under-manned reads "Under 0 days". The stage
   chip, its phone menu and the dates chip went with the stages (D1177, 21 Oct 26): the open chip opens the "Open for
   bidding" window, for an admin to change the dates and a member to read them.

   What these tests can and cannot see: jsdom lays nothing out, so that the two lines ARE two lines, that nothing runs
   off a 360px screen and that the window opens inside it are the browser tests' (e2e/leavewar.spec.ts, "the top of the
   Leave War on a phone is two lines"). Here: the words, which control is which, and who is offered what.

   "A phone" is the Leave War's own phone width — `(max-width: 430px)`, the query its stylesheets and the Required
   panel already use (ui/phone.ts). jsdom has no matchMedia at all, which is why every older test of this strip still
   sees the desktop's; the phone tests below stand one up. */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { setMemberTodayForTests } from '../engine'
import { closeDates, getState, initStore, setRole, setViewer } from '../state/store'
import { memoryBackend } from '../state/storage'
import { elevenCounters } from '../testkit'
import { StageBar, Topbar } from './Chrome'
import { PHONE_QUERY, usePhone } from './phone'

/** A stand-in for the browser's media query: `phone` says whether the Leave War's phone width matches, and `flip`
 *  changes it and tells whoever is listening — a phone turned on its side, a window dragged narrow. */
function standUpMatchMedia(phone: boolean) {
  const listeners = new Set<() => void>()
  let on = phone
  ;(window as any).matchMedia = (q: string) => ({
    media: q,
    get matches() { return q === PHONE_QUERY ? on : false },
    addEventListener: (_: string, fn: () => void) => { listeners.add(fn) },
    removeEventListener: (_: string, fn: () => void) => { listeners.delete(fn) },
  })
  return { flip(next: boolean) { on = next; listeners.forEach(fn => fn()) } }
}

beforeEach(() => {
  initStore(memoryBackend())
  elevenCounters()   // the app starts with no counters (D669); the under-manned tally needs some to count against
})
afterEach(() => { delete (window as any).matchMedia })

describe('on a phone — the Period line (D678)', () => {
  beforeEach(() => { standUpMatchMedia(true) })

  it('drops the word "Period": the picker beside it says so, and still names itself to a screen reader', () => {
    render(<Topbar />)
    expect(screen.queryByTestId('period-label')).toBeNull()
    expect(screen.queryByText('Period')).toBeNull()
    expect(screen.getByTestId('war-picker').getAttribute('aria-label')).toContain('Period')
  })

  it('"+ New" reads "+", and says what it makes to a screen reader', () => {
    act(() => setRole('admin'))
    render(<Topbar />)
    const plus = screen.getByTestId('war-new')
    expect(plus.textContent).toBe('+')
    expect(plus.getAttribute('aria-label')).toBe('New period')
    /* and it is still the one way to the New-period sheet */
    fireEvent.click(plus)
    expect(screen.getByTestId('war-sheet')).toBeTruthy()
  })

  it('a member has no "+" at all — as on a desktop', () => {
    act(() => setRole('member'))
    render(<Topbar />)
    expect(screen.queryByTestId('war-new')).toBeNull()
  })

  it('"Viewing as" keeps its words and the callsign (D365\'s "words kept" stands; only its line changed)', () => {
    act(() => setViewer('ramp'))
    render(<Topbar />)
    const chip = screen.getByTestId('lw-viewing')
    expect(chip.querySelector('.vlab')!.textContent).toBe('Viewing as')
    expect(chip.querySelector('.vwho')!.textContent).toBe(getState().people.find(p => p.id === 'ramp')!.callsign)
  })
})

describe('on a phone — the open dates line (D678; the stage chip went with the stages, D1177)', () => {
  beforeEach(() => { standUpMatchMedia(true) })

  it('drops the words "Stage", "Bidding on" and "Under-manned"', () => {
    act(() => setRole('admin'))
    const { container } = render(<StageBar />)
    expect(container.querySelectorAll('.filters > .lab').length).toBe(0)
    for (const word of ['Stage', 'Bidding on', 'Under-manned']) expect(screen.queryByText(word)).toBeNull()
  })

  /* WAS "the bidding dates read without their year …" on the old dates chip. The one open chip says "Open" and the
     first open stretch, no year — the period picker says it (D1177, drawn r7-17). */
  it('the open chip reads "Open" and the first open stretch, without the year', () => {
    render(<StageBar />)
    const chip = screen.getByTestId('open-chip')
    expect(chip.tagName).toBe('BUTTON')
    expect(chip.textContent).toBe('Open 1 Jan – 31 Mar')
  })

  it('with two stretches open it names the first and counts the rest: "+1"', () => {
    act(() => { setRole('admin'); closeDates('2026-02-01', '2026-02-28') })
    render(<StageBar />)
    expect(screen.getByTestId('open-chip').textContent).toBe('Open 1 Jan – 31 Jan +1')
  })

  it('with nothing open it reads "Bidding closed"', () => {
    act(() => { setRole('admin'); closeDates('2026-01-01', '2026-12-31') })
    render(<StageBar />)
    expect(screen.getByTestId('open-chip').textContent).toBe('Bidding closed')
  })

  // D1211: a member never bids before today, so his chip reads the open dates from HIS today — and since D1268 (23 Oct 26)
  // the admin's reads from today too: open dates no member can use a day of say "Bidding closed" to him as well.
  it('the chip reads from today for a member and the admin alike; past every stretch, "Bidding closed" for both (D1268)', () => {
    setMemberTodayForTests('2026-02-10')
    act(() => setRole('member'))
    render(<StageBar />)
    expect(screen.getByTestId('open-chip').textContent).toBe('Open 10 Feb – 31 Mar')
    act(() => setMemberTodayForTests('2026-04-01'))
    act(() => setRole('admin'))
    act(() => setRole('member'))
    expect(screen.getByTestId('open-chip').textContent).toBe('Bidding closed')
    act(() => setRole('admin'))
    expect(screen.getByTestId('open-chip').textContent).toBe('Bidding closed')
  })

  it('under-manned reads "Under 4 days" — the same count the desktop shows, with the one word that says what it counts', () => {
    render(<StageBar />)
    const chip = screen.getByTestId('undermanned')
    expect(chip.textContent).toBe('Under 4 days')          // the test roster breaks a rule on four days once it has counters
    expect((chip as HTMLButtonElement).disabled).toBe(false)
    expect(chip.getAttribute('aria-label')).toBe('Under-manned: 4 days')
    /* and it still opens the list of those days */
    fireEvent.click(chip)
    expect(screen.getByTestId('undermanned-list')).toBeTruthy()
  })

  it('with nothing under-manned it reads "Under 0 days" and cannot be pressed', () => {
    initStore(memoryBackend())                              // no counters at all (D669): nothing can be under-manned
    render(<StageBar />)
    const chip = screen.getByTestId('undermanned')
    expect(chip.textContent).toBe('Under 0 days')
    expect((chip as HTMLButtonElement).disabled).toBe(true)
    expect(chip.getAttribute('aria-label')).toBe('Under-manned: 0 days')
  })

  it('Legend is still there, and still opens the key', () => {
    render(<StageBar />)
    fireEvent.click(screen.getByTestId('legend-open'))
    expect(screen.getByTestId('legend').textContent).toContain('Approved')
  })

  /* WAS "an admin's stage button" — a button naming the stage whose menu held the two stage moves. The stages went
     (D1177): the one chip opens the "Open for bidding" window, for an admin to change the dates (its own tests:
     window.test.tsx). What the menu's tests pinned that still applies is pinned here: the chip opens it, a press
     outside or Escape puts it away and changes nothing (the 4 Sep 26 rule), and a man who stops being an admin is never
     left holding the controls. */
  describe('an admin\'s open chip', () => {
    beforeEach(() => { act(() => setRole('admin')) })

    it('is a button that opens the "Open for bidding" window', () => {
      render(<StageBar />)
      const chip = screen.getByTestId('open-chip')
      expect(chip.getAttribute('aria-expanded')).toBe('false')
      expect(screen.queryByTestId('open-dates')).toBeNull()
      fireEvent.click(chip)
      expect(screen.getByTestId('open-dates')).toBeTruthy()
      expect(chip.getAttribute('aria-expanded')).toBe('true')
      expect((screen.getByTestId('od-month-2026-04') as HTMLButtonElement).disabled).toBe(false)
    })

    it('a month closed in the window changes the chip, and the window stays up for the next', () => {
      render(<StageBar />)
      fireEvent.click(screen.getByTestId('open-chip'))
      fireEvent.click(screen.getByTestId('od-month-2026-01'))
      expect(getState().period.open).toEqual([{ from: '2026-02-01', to: '2026-03-31' }])
      expect(screen.getByTestId('open-chip').textContent).toBe('Open 1 Feb – 31 Mar')
      expect(screen.getByTestId('open-dates')).toBeTruthy()
    })

    it('a press outside the window, Escape, or its ✕ each put it away and change nothing (the 4 Sep 26 rule)', () => {
      render(<StageBar />)
      const chip = screen.getByTestId('open-chip')
      fireEvent.click(chip)
      fireEvent.click(screen.getByTestId('sheet-scrim'))
      expect(screen.queryByTestId('open-dates')).toBeNull()
      fireEvent.click(chip)
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(screen.queryByTestId('open-dates')).toBeNull()
      fireEvent.click(chip)
      fireEvent.click(screen.getByTestId('open-dates-close'))
      expect(screen.queryByTestId('open-dates')).toBeNull()
      expect(getState().period.open).toEqual([{ from: '2026-01-01', to: '2026-03-31' }])
    })

    it('an open window loses its controls when he stops being an admin — a member is never left holding them', () => {
      render(<StageBar />)
      fireEvent.click(screen.getByTestId('open-chip'))
      expect(screen.getByTestId('od-more')).toBeTruthy()
      act(() => setRole('member'))
      expect(screen.queryByTestId('od-more')).toBeNull()
      expect(screen.queryByTestId('od-cal-2026-01-01')).toBeNull()
      expect((screen.getByTestId('od-month-2026-04') as HTMLButtonElement).disabled).toBe(true)
    })
  })

  /* WAS "a member's stage is a label … a press opens nothing". CHANGED by D1177's reading: the chip is a button for
     everyone — a member's tap opens the window to READ the dates (and, with nothing open, the last open stretch and who
     closed it), never to change them. */
  it('a member\'s chip opens the window read only', () => {
    act(() => setRole('member'))
    render(<StageBar />)
    const chip = screen.getByTestId('open-chip')
    expect(chip.tagName).toBe('BUTTON')
    expect(chip.textContent).toBe('Open 1 Jan – 31 Mar')
    fireEvent.click(chip)
    expect(screen.getByTestId('open-dates')).toBeTruthy()
    expect((screen.getByTestId('od-month-2026-01') as HTMLButtonElement).disabled).toBe(true)
    expect(screen.queryByTestId('od-more')).toBeNull()
  })
})

/* D1000, D1016 (18 Oct 26): the top's phone layout reaches 700 wide — the biggest iPhones and a small tablet */
it('D1000: the top’s phone width is 700, so the words and chrome.css’s top block change together', () => {
  expect(PHONE_QUERY).toBe('(max-width: 700px)')
})

/* D679 — "keep the same for desktop". Two ways the desktop is reached: no matchMedia at all (jsdom, an old browser)
   and a matchMedia that says the phone width does not match (a tablet, a desktop). Both must draw today's strip. */
describe.each([
  ['with no matchMedia at all', () => {}],
  ['with a screen wider than a phone', () => { standUpMatchMedia(false) }],
])('on a tablet and a desktop the top is as it was (D679) — %s', (_name, arrange) => {
  beforeEach(() => { arrange() })

  it('the Period line keeps the word "Period" and the whole "+ New"', () => {
    act(() => setRole('admin'))
    render(<Topbar />)
    expect(screen.getByTestId('period-label').textContent).toBe('Period')
    const plus = screen.getByTestId('war-new')
    expect(plus.textContent!.trim()).toBe('+ New')
    expect(plus.hasAttribute('aria-label')).toBe(false)
  })

  /* WAS "the Stage line keeps its three words" — "Stage", "Bidding on", "Under-manned". The stage chip and the dates
     chip went (D1177): the one open chip carries its own words, "Open for bidding", so only "Under-manned" stays a label. */
  it('the strip keeps the word "Under-manned"; the open chip carries its own words', () => {
    act(() => setRole('admin'))
    const { container } = render(<StageBar />)
    expect([...container.querySelectorAll('.filters > .lab')].map(el => el.textContent)).toEqual(['Under-manned'])
    expect(screen.queryByText('Stage')).toBeNull()
    expect(screen.queryByText('Bidding on')).toBeNull()
  })

  /* WAS "the stage is a label with its two moves IN SIGHT beside it". CHANGED by D1177: the chip is the one control,
     and it opens the same window as on a phone — no menu, no stage moves. */
  it('the open chip reads "Open for bidding" and opens the same window as on a phone', () => {
    act(() => setRole('admin'))
    render(<StageBar />)
    const chip = screen.getByTestId('open-chip')
    expect(chip.tagName).toBe('BUTTON')
    expect(chip.textContent).toBe('Open for bidding 1 Jan – 31 Mar')
    fireEvent.click(chip)
    expect(screen.getByTestId('open-dates')).toBeTruthy()
    expect(screen.queryByTestId('stage-menu')).toBeNull()
  })

  /* WAS "the bidding dates keep their year". CHANGED by D1177 (drawn r7-17): the chip's dates read without the year on
     every width — the period picker says it. Under-manned still reads the bare count. */
  it('the open dates read without the year, "+1" for a second stretch, and under-manned reads the bare count', () => {
    render(<StageBar />)
    expect(screen.getByTestId('open-chip').textContent).toBe('Open for bidding 1 Jan – 31 Mar')
    act(() => { setRole('admin'); closeDates('2026-02-01', '2026-02-28') })
    expect(screen.getByTestId('open-chip').textContent).toBe('Open for bidding 1 Jan – 31 Jan +1')
    expect(screen.getByTestId('undermanned').textContent).toBe('4 days')
    expect(screen.getByTestId('undermanned').hasAttribute('aria-label')).toBe(false)
  })
})

describe('the phone width is followed live', () => {
  function Probe() { return <span data-testid="probe">{usePhone() ? 'phone' : 'wide'}</span> }

  it('is "wide" where the browser has no matchMedia', () => {
    render(<Probe />)
    expect(screen.getByTestId('probe').textContent).toBe('wide')
  })

  it('follows the screen as it narrows and widens — a phone turned on its side gets the wide strip', () => {
    const mq = standUpMatchMedia(true)
    render(<Probe />)
    expect(screen.getByTestId('probe').textContent).toBe('phone')
    act(() => mq.flip(false))
    expect(screen.getByTestId('probe').textContent).toBe('wide')
    act(() => mq.flip(true))
    expect(screen.getByTestId('probe').textContent).toBe('phone')
  })

  /* WAS "an open stage menu goes when the screen widens". The menu went with the stages (D1177); the chip's words follow
     the width live, and an open window stays open through it. */
  it('the chip\'s words follow the screen as it widens and narrows, and an open window stays up', () => {
    const mq = standUpMatchMedia(true)
    act(() => setRole('admin'))
    render(<StageBar />)
    expect(screen.getByTestId('open-chip').textContent).toBe('Open 1 Jan – 31 Mar')
    fireEvent.click(screen.getByTestId('open-chip'))
    act(() => mq.flip(false))
    expect(screen.getByTestId('open-chip').textContent).toBe('Open for bidding 1 Jan – 31 Mar')
    expect(screen.getByTestId('open-dates')).toBeTruthy()
    act(() => mq.flip(true))
    expect(screen.getByTestId('open-chip').textContent).toBe('Open 1 Jan – 31 Mar')
  })
})
