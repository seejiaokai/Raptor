/* THE TOP OF THE LEAVE WAR ON A PHONE IS TWO LINES ([LW-PHONE-HEADER-SPACE] — owner, D678, 8 Oct 26: "A looks good",
   of three ideas drawn into the running build after "how can we optimise the space such that we don't use so much
   vertical space?"), AND A DESKTOP'S IS AS IT WAS (D679 — "keep the same for desktop").

   On a phone: the words "Period", "Stage", "Bidding on" and "Under-manned" go (the buttons beside them say it); "+ New"
   reads "+"; the bidding dates read without their year; under-manned reads "Under 0 days"; and an admin's two stage
   moves are behind the stage button — a member's stage is a label that opens nothing.

   What these tests can and cannot see: jsdom lays nothing out, so that the two lines ARE two lines, that nothing runs
   off a 360px screen and that the menu opens inside it are the browser tests' (e2e/leavewar.spec.ts, "the top of the
   Leave War on a phone is two lines"). Here: the words, which control is which, and who is offered what.

   "A phone" is the Leave War's own phone width — `(max-width: 430px)`, the query its stylesheets and the Required
   panel already use (ui/phone.ts). jsdom has no matchMedia at all, which is why every older test of this strip still
   sees the desktop's; the phone tests below stand one up. */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { advanceStage, getState, initStore, setRole, setViewer } from '../state/store'
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

describe('on a phone — the Stage line (D678)', () => {
  beforeEach(() => { standUpMatchMedia(true) })

  it('drops the words "Stage", "Bidding on" and "Under-manned"', () => {
    act(() => setRole('admin'))
    const { container } = render(<StageBar />)
    expect(container.querySelectorAll('.filters > .lab').length).toBe(0)
    for (const word of ['Stage', 'Bidding on', 'Under-manned']) expect(screen.queryByText(word)).toBeNull()
  })

  it('the bidding dates read without their year, and the whole dates are still said to a screen reader', () => {
    render(<StageBar />)
    const win = screen.getByTestId('bid-window')
    expect(win.textContent).toBe('1 Jan – 31 Mar')
    expect(win.getAttribute('aria-label')).toBe('Bidding on 1 Jan 26 – 31 Mar 26')
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

  describe('an admin\'s stage button', () => {
    beforeEach(() => { act(() => setRole('admin')) })

    it('is a button naming the stage, with the two moves OUT of sight until it is pressed', () => {
      render(<StageBar />)
      const now = screen.getByTestId('stage-now')
      expect(now.tagName).toBe('BUTTON')
      expect(now.textContent).toBe('OPEN FOR BIDDING')
      expect(now.getAttribute('aria-expanded')).toBe('false')
      expect(now.className).toContain('stage-open')            // the green of an open war, kept
      expect(screen.queryByTestId('stage-menu')).toBeNull()
      expect(screen.queryByTestId('stage-advance')).toBeNull()
      expect(screen.queryByTestId('stage-back')).toBeNull()
    })

    it('pressed, it opens a menu holding both moves, each naming the stage it moves to', () => {
      render(<StageBar />)
      fireEvent.click(screen.getByTestId('stage-now'))
      const menu = screen.getByTestId('stage-menu')
      expect(screen.getByTestId('stage-now').getAttribute('aria-expanded')).toBe('true')
      expect(menu.textContent).toContain('Move the stage')
      expect(menu.contains(screen.getByTestId('stage-advance'))).toBe(true)
      expect(menu.contains(screen.getByTestId('stage-back'))).toBe(true)
      expect(screen.getByTestId('stage-advance').textContent).toContain('BIDDING CLOSED')
      expect(screen.getByTestId('stage-back').textContent).toContain('DRAFT')
    })

    it('a move chosen in the menu moves the stage and puts the menu away — forward, then back', () => {
      render(<StageBar />)
      fireEvent.click(screen.getByTestId('stage-now'))
      fireEvent.click(screen.getByTestId('stage-advance'))
      expect(getState().period.stage).toBe('closed')
      expect(screen.getByTestId('stage-now').textContent).toBe('BIDDING CLOSED')
      expect(screen.queryByTestId('stage-menu')).toBeNull()
      expect(screen.queryByTestId('bid-window')).toBeNull()      // a closed war advertises no dates, as on a desktop
      fireEvent.click(screen.getByTestId('stage-now'))
      expect(screen.getByTestId('stage-back').textContent).toContain('OPEN FOR BIDDING')
      fireEvent.click(screen.getByTestId('stage-back'))
      expect(getState().period.stage).toBe('open')
      expect(screen.queryByTestId('stage-menu')).toBeNull()
    })

    it('back first, then forward — the other order', () => {
      render(<StageBar />)
      fireEvent.click(screen.getByTestId('stage-now'))
      fireEvent.click(screen.getByTestId('stage-back'))
      expect(getState().period.stage).toBe('draft')
      expect(screen.getByTestId('stage-now').textContent).toBe('DRAFT')
      fireEvent.click(screen.getByTestId('stage-now'))
      expect(screen.queryByTestId('stage-back')).toBeNull()      // nothing is before draft
      fireEvent.click(screen.getByTestId('stage-advance'))
      expect(getState().period.stage).toBe('open')
    })

    it('at the end of the cycle the menu still opens: forward is there and cannot be pressed, back can', () => {
      act(() => { advanceStage(); advanceStage() })
      expect(getState().period.stage).toBe('published')
      render(<StageBar />)
      fireEvent.click(screen.getByTestId('stage-now'))
      expect((screen.getByTestId('stage-advance') as HTMLButtonElement).disabled).toBe(true)
      expect(screen.getByTestId('stage-advance').textContent).toContain('END OF CYCLE')
      expect(screen.getByTestId('stage-back').textContent).toContain('BIDDING CLOSED')
    })

    it('a press outside the menu, Escape, or the button again each put it away and move nothing (the 4 Sep 26 rule)', () => {
      render(<StageBar />)
      const now = screen.getByTestId('stage-now')
      fireEvent.click(now)
      fireEvent.click(screen.getByTestId('stage-scrim'))
      expect(screen.queryByTestId('stage-menu')).toBeNull()
      fireEvent.click(now)
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(screen.queryByTestId('stage-menu')).toBeNull()
      fireEvent.click(now)
      fireEvent.click(now)
      expect(screen.queryByTestId('stage-menu')).toBeNull()
      expect(getState().period.stage).toBe('open')
    })

    it('an open menu goes when he stops being an admin — a member is never left holding the two moves', () => {
      render(<StageBar />)
      fireEvent.click(screen.getByTestId('stage-now'))
      expect(screen.getByTestId('stage-menu')).toBeTruthy()
      act(() => setRole('member'))
      expect(screen.queryByTestId('stage-menu')).toBeNull()
      expect(screen.queryByTestId('stage-advance')).toBeNull()
      /* and it does not spring back open when he is an admin again */
      act(() => setRole('admin'))
      expect(screen.queryByTestId('stage-menu')).toBeNull()
    })
  })

  it('a member\'s stage is a label: it says the stage, is no button, and a press opens nothing', () => {
    act(() => setRole('member'))
    render(<StageBar />)
    const now = screen.getByTestId('stage-now')
    expect(now.tagName).toBe('SPAN')
    expect(now.textContent).toBe('OPEN FOR BIDDING')
    expect(now.hasAttribute('aria-expanded')).toBe(false)
    fireEvent.click(now)
    expect(screen.queryByTestId('stage-menu')).toBeNull()
    expect(screen.queryByTestId('stage-advance')).toBeNull()
    expect(screen.queryByTestId('stage-back')).toBeNull()
  })
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

  it('the Stage line keeps its three words, in their order', () => {
    act(() => setRole('admin'))
    const { container } = render(<StageBar />)
    expect([...container.querySelectorAll('.filters > .lab')].map(el => el.textContent)).toEqual(['Stage', 'Bidding on', 'Under-manned'])
  })

  it('the stage is a label with its two moves IN SIGHT beside it — no menu, and a press on the stage opens none', () => {
    act(() => setRole('admin'))
    const { container } = render(<StageBar />)
    const now = screen.getByTestId('stage-now')
    expect(now.tagName).toBe('SPAN')
    expect(now.hasAttribute('aria-expanded')).toBe(false)
    const strip = container.querySelector('.filters')!
    expect(screen.getByTestId('stage-advance').parentElement).toBe(strip)
    expect(screen.getByTestId('stage-back').parentElement).toBe(strip)
    fireEvent.click(now)
    expect(screen.queryByTestId('stage-menu')).toBeNull()
    expect(screen.queryByTestId('stage-scrim')).toBeNull()
  })

  it('the bidding dates keep their year and under-manned reads the bare count', () => {
    render(<StageBar />)
    expect(screen.getByTestId('bid-window').textContent).toBe('1 Jan 26 – 31 Mar 26')
    expect(screen.getByTestId('bid-window').hasAttribute('aria-label')).toBe(false)
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

  it('an open stage menu goes when the screen widens: the two moves are back in sight on the strip itself', () => {
    const mq = standUpMatchMedia(true)
    act(() => setRole('admin'))
    const { container } = render(<StageBar />)
    fireEvent.click(screen.getByTestId('stage-now'))
    expect(screen.getByTestId('stage-menu')).toBeTruthy()
    act(() => mq.flip(false))
    expect(screen.queryByTestId('stage-menu')).toBeNull()
    expect(screen.getByTestId('stage-advance').parentElement).toBe(container.querySelector('.filters'))
    /* and narrowing again does not spring the menu back open */
    act(() => mq.flip(true))
    expect(screen.queryByTestId('stage-menu')).toBeNull()
  })
})
