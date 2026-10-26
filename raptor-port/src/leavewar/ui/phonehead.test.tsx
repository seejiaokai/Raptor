/* THE TOP OF THE LEAVE WAR — on a phone and on a desktop.

   WAS two lines on a phone ([LW-PHONE-HEADER-SPACE] — owner, D678, 8 Oct 26) — "Period" and "+" on the first, the stage
   strip on the second — and a desktop's as it was (D679). CHANGED by the navigation as drawn in round 19 (D1254, 22 Oct 26,
   narrowing D678, D679 and D1141): ONE tab row — Grid · OIL (Approvals and Balances join with their pages, M4 / M5) — with
   ⚙ at its right end for an admin; then "View" (never "Period" — D1174), the period picker and My leave: on a desktop in
   that same row, on a phone a second line under the tabs. No "Viewing as" chip (D1173). "+ New period" is the period
   list's last line, an admin's only (D1244). The grid's own bar — [▸ Manning | n red ›] · the open dates · … · Legend —
   stands on the grid card (`StageBar`), the same for everyone; its count is the red days only (D1243).

   What these tests can and cannot see: jsdom lays nothing out, so that the lines ARE lines, that nothing runs off a 360px
   screen and that the window opens inside it are the browser tests'. Here: the words, which control is which, and who is
   offered what.

   "A phone" is the Leave War's own phone width — `(max-width: 700px)` since D1000 (ui/phone.ts). jsdom has no matchMedia
   at all, which is why every older test of this strip still sees the desktop's; the phone tests below stand one up. */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { setMemberTodayForTests } from '../engine'
import { closeDates, figureCtxOf, getState, initStore, setBidState, setCell, setRole, setViewer } from '../state/store'
import { memoryBackend } from '../state/storage'
import { elevenCounters } from '../testkit'
import { StageBar, Topbar } from './Chrome'
import { setOilUp } from './lwnav'
import { Matrix } from './Matrix'
import { fig, myLeaveOf } from './myleave'
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

/* "+ New period" is the period list's last line since D1244: choosing it is a change of the native list's value */
const chooseNewPeriod = () => fireEvent.change(screen.getByTestId('war-picker'), { target: { value: '\u0000new' } })

beforeEach(() => {
  initStore(memoryBackend())
  elevenCounters()   // the app starts with no counters (D669); the red count needs some to count against
  /* the OIL tab's lit state is the grid's answer (ui/lwnav.ts), kept outside the store — a grid unmounted with the tracker
     up by an earlier test would leave it lit for the next */
  setOilUp(false)
})
afterEach(() => { delete (window as any).matchMedia })

describe('on a phone — the View line (D678 as narrowed by D1174, D1173, D1244, D1254)', () => {
  beforeEach(() => { standUpMatchMedia(true) })

  /* WAS 'drops the word "Period"'. D1174: the picker is labelled "View" — "and View can also now be on the mobile" — on
     the line under the tabs (D1254). */
  it('reads "View", never "Period", on the line under the tabs; the picker still names itself to a screen reader', () => {
    render(<Topbar />)
    const label = screen.getByTestId('period-label')
    expect(label.textContent).toBe('View')
    expect(label.closest('.lw-viewline')).toBeTruthy()
    expect(label.closest('.topbar')).toBeNull()
    expect(screen.queryByText('Period')).toBeNull()
    expect(screen.getByTestId('war-picker').getAttribute('aria-label')).toContain('View')
    expect(screen.getByTestId('war-picker').closest('.lw-viewline')).toBeTruthy()
  })

  /* WAS '"+ New" reads "+"'. D1244: the "+" left the row for the period list's last line, "+ New period", and choosing
     it opens the same new-period window; the period on screen stays as it was. */
  it('"+ New period" is the period list\'s last line, and choosing it opens the new-period window with the period kept', () => {
    act(() => setRole('admin'))
    render(<Topbar />)
    const picker = screen.getByTestId('war-picker') as HTMLSelectElement
    const opts = [...picker.options]
    expect(opts[opts.length - 1]!.textContent).toBe('+ New period')
    expect(opts[opts.length - 1]!.getAttribute('data-testid')).toBe('war-new')
    expect(document.querySelectorAll('button[data-testid="war-new"]')).toHaveLength(0)   // no button on the row
    const before = getState().period.id
    chooseNewPeriod()
    expect(screen.getByTestId('war-sheet')).toBeTruthy()
    expect(getState().period.id).toBe(before)
    expect(picker.value).toBe(before)
  })

  it('a member has no "+ New period" at all — as on a desktop', () => {
    act(() => setRole('member'))
    render(<Topbar />)
    expect(screen.queryByTestId('war-new')).toBeNull()
    expect([...(screen.getByTestId('war-picker') as HTMLSelectElement).options].map(o => o.textContent)).not.toContain('+ New period')
  })

  /* WAS '"Viewing as" keeps its words and the callsign' (D365, replaced). D1173: the chip goes — the person signed in
     knows who he is, and My leave carries his own figures; on a phone My leave stands on the View line (D1254). */
  it('has no "Viewing as" chip; My leave stands on the View line', () => {
    act(() => setViewer('ramp'))
    render(<Topbar />)
    expect(screen.queryByTestId('lw-viewing')).toBeNull()
    expect(screen.queryByText(/Viewing as/)).toBeNull()
    expect(screen.getByTestId('my-leave').closest('.lw-viewline')).toBeTruthy()
  })
})

describe('on a phone — the grid\'s bar (D678; the stage chip went with the stages, D1177; the bar as drawn, D1254)', () => {
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

  /* WAS 'under-manned reads "Under 4 days"'. D1243: the count is the Manning button's right half and reads "4 red ›" —
     the red days only; it still names what it counts to a screen reader, and still opens the list of those days. */
  it('the Manning button\'s right half reads "4 red ›", says what it counts, and opens the list', () => {
    render(<StageBar />)
    const chip = screen.getByTestId('undermanned')
    expect(chip.textContent).toBe('4 red ›')          // the test roster breaks a rule on four days once it has counters
    expect(chip.closest('.lw-manning')).toBe(screen.getByTestId('counts-toggle').closest('.lw-manning'))
    expect(chip.getAttribute('aria-label')).toBe('4 red days: show the days that break a manning rule')
    fireEvent.click(chip)
    expect(screen.getByTestId('undermanned-list')).toBeTruthy()
  })

  /* WAS 'with nothing under-manned it reads "Under 0 days" and cannot be pressed'. D1243: with no red day the right half
     goes and the button reads "Manning" alone. */
  it('with no red day the right half goes, and the button reads "Manning" alone', () => {
    initStore(memoryBackend())                              // no counters at all (D669): nothing can be red
    render(<StageBar />)
    expect(screen.queryByTestId('undermanned')).toBeNull()
    expect(screen.getByTestId('counts-toggle').textContent!.replace(/[▸▾]/, '').trim()).toBe('Manning')
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

/* A TABLET AND A DESKTOP. WAS "the top is as it was (D679)". CHANGED by D1254: the tabs, View and its picker, My leave and
   ⚙ are ONE row (D679 as narrowed); the grid's bar is the same as a phone's but for the open chip's longer words. Two ways
   the desktop is reached: no matchMedia at all (jsdom, an old browser) and a matchMedia that says the phone width does not
   match (a tablet, a desktop). Both must draw the one row. */
describe.each([
  ['with no matchMedia at all', () => {}],
  ['with a screen wider than a phone', () => { standUpMatchMedia(false) }],
])('on a tablet and a desktop the top is one row (D1254) — %s', (_name, arrange) => {
  beforeEach(() => { arrange() })

  /* WAS 'the Period line keeps the word "Period" and the whole "+ New"'. D1174: "View"; D1244: "+ New period" is the
     list's last line, not a button; D1254: the tabs, View, My leave and ⚙ in that order, one row. */
  it('is the tabs · View and its picker · My leave · ⚙ in one row, and "+ New period" is in the list', () => {
    act(() => { setRole('admin'); setViewer('ramp') })
    const { container } = render(<Topbar />)
    expect(container.querySelector('.lw-viewline')).toBeNull()
    const row = container.querySelector('.topbar')!
    const order = [...row.querySelectorAll('[data-testid="lw-tab-grid"], [data-testid="oil-tracker"], [data-testid="period-label"], [data-testid="war-picker"], [data-testid="my-leave"], [data-testid="settings-open"]')]
      .map(el => el.getAttribute('data-testid'))
    expect(order).toEqual(['lw-tab-grid', 'oil-tracker', 'period-label', 'war-picker', 'my-leave', 'settings-open'])
    expect(screen.getByTestId('period-label').textContent).toBe('View')
    const plus = screen.getByTestId('war-new')
    expect(plus.tagName).toBe('OPTION')
    expect(plus.textContent).toBe('+ New period')
    expect(document.querySelectorAll('button[data-testid="war-new"]')).toHaveLength(0)
  })

  /* WAS 'the strip keeps the word "Under-manned"'. D1243: the count is the Manning button's right half — the bar carries
     no label at all; Manning leads it (D1254). */
  it('the bar carries no labels — Manning leads it, its red count its right half; the open chip carries its own words', () => {
    act(() => setRole('admin'))
    const { container } = render(<StageBar />)
    expect(container.querySelectorAll('.filters > .lab').length).toBe(0)
    expect(screen.queryByText('Under-manned')).toBeNull()
    expect(screen.queryByText('Stage')).toBeNull()
    expect(screen.queryByText('Bidding on')).toBeNull()
    const buttons = [...container.querySelectorAll('.filters button')].map(b => b.getAttribute('data-testid'))
    expect(buttons.slice(0, 3)).toEqual(['counts-toggle', 'undermanned', 'open-chip'])
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
     every width — the period picker says it. WAS "under-manned reads the bare count" with no label; D1243: "4 red ›" on
     every width, with the words a screen reader needs. */
  it('the open dates read without the year, "+1" for a second stretch, and the red count reads the same as a phone\'s', () => {
    render(<StageBar />)
    expect(screen.getByTestId('open-chip').textContent).toBe('Open for bidding 1 Jan – 31 Mar')
    act(() => { setRole('admin'); closeDates('2026-02-01', '2026-02-28') })
    expect(screen.getByTestId('open-chip').textContent).toBe('Open for bidding 1 Jan – 31 Jan +1')
    expect(screen.getByTestId('undermanned').textContent).toBe('4 red ›')
    expect(screen.getByTestId('undermanned').getAttribute('aria-label')).toBe('4 red days: show the days that break a manning rule')
  })
})

/* THE TAB ROW (D1254): the Inputs page's own tab row — Grid and OIL now — whose presses ask the grid (ui/lwnav.ts), since
   the windows are the grid's. The top row and the grid are drawn together here, as the page draws them. */
describe('the tab row (D1254)', () => {
  const selected = (id: string) => screen.getByTestId(id).getAttribute('aria-selected')

  it('Grid is the chosen tab; the OIL tab opens the OIL tracker and reads as chosen while it is up; Grid closes it', () => {
    render(<><Topbar /><Matrix /></>)
    expect(screen.getByTestId('lw-tab-grid').getAttribute('role')).toBe('tab')
    expect(selected('lw-tab-grid')).toBe('true')
    expect(selected('oil-tracker')).toBe('false')
    expect(screen.queryByTestId('oil-sheet')).toBeNull()
    fireEvent.click(screen.getByTestId('oil-tracker'))
    expect(screen.getByTestId('oil-sheet')).toBeTruthy()
    expect(selected('oil-tracker')).toBe('true')
    expect(selected('lw-tab-grid')).toBe('false')
    fireEvent.click(screen.getByTestId('lw-tab-grid'))
    expect(screen.queryByTestId('oil-sheet')).toBeNull()
    expect(selected('lw-tab-grid')).toBe('true')
    expect(selected('oil-tracker')).toBe('false')
  })

  it('the tracker closed its own way (its ✕) hands the chosen tab back to Grid', () => {
    render(<><Topbar /><Matrix /></>)
    fireEvent.click(screen.getByTestId('oil-tracker'))
    fireEvent.click(screen.getByTestId('oil-close'))
    expect(screen.queryByTestId('oil-sheet')).toBeNull()
    expect(selected('lw-tab-grid')).toBe('true')
  })

  it('is one tab stop: the arrow keys move along it and open what they land on', () => {
    render(<><Topbar /><Matrix /></>)
    expect(screen.getByTestId('lw-tab-grid').tabIndex).toBe(0)
    expect(screen.getByTestId('oil-tracker').tabIndex).toBe(-1)
    fireEvent.keyDown(screen.getByTestId('lw-tab-grid'), { key: 'ArrowRight' })
    expect(screen.getByTestId('oil-sheet')).toBeTruthy()
    expect(screen.getByTestId('oil-tracker').tabIndex).toBe(0)
    fireEvent.keyDown(screen.getByTestId('oil-tracker'), { key: 'ArrowLeft' })
    expect(screen.queryByTestId('oil-sheet')).toBeNull()
  })

  it('⚙ is an admin\'s only, at the row\'s right end, and opens ⚙ Settings on the grid', () => {
    const member = render(<><Topbar /><Matrix /></>)
    expect(screen.queryByTestId('settings-open')).toBeNull()
    member.unmount()
    act(() => setRole('admin'))
    render(<><Topbar /><Matrix /></>)
    const gear = screen.getByTestId('settings-open')
    expect(gear.closest('.topbar')).toBeTruthy()
    expect(gear.getAttribute('aria-label')).toBe('Settings')
    fireEvent.click(gear)
    expect(screen.getByTestId('settings-sheet')).toBeTruthy()
  })
})

/* MY LEAVE (D1141 as narrowed by D1173, D1254): the person signed in sees his own LVE, OIL, days pending and next leave;
   a tap opens his person window. The figures are ONE reader, `myLeaveOf` — pinned here on the seed's own rows:
   MILES holds two pending bids (2 Feb LL, a whole day; 3 Feb LL*, the afternoon), opens on annual 7 less a correction of 1,
   OIL 6; RESET's four pending LL are in next year's period (13–16 Apr 27), not the one on screen. */
describe('My leave\'s figures (D1141; pending in days, D1217; a half .5, D1246)', () => {
  const mine = (id: string, today: string) => myLeaveOf(figureCtxOf(), getState().wars, id, today)

  it('LVE takes his waiting bids off, OIL is his balance, pending counts days — a half .5', () => {
    const m = mine('miles', '2026-01-05')
    expect(m.pending).toBe(1.5)
    expect(m.oil).toBe(6)
    expect(m.lve).toBe(7 - 1 - 1.5)                 // D1153: a bid already takes its leave off
    expect(m.next).toBe('2026-02-02')
  })

  it('moves with a bid placed, a half placed, and a refusal — a refused bid counts nothing', () => {
    const was = mine('miles', '2026-01-05')
    act(() => { setRole('member'); setViewer('miles') })
    expect(setCell('miles', '2026-01-20', 'LL')).toBe(true)
    expect(setCell('miles', '2026-01-21', '*LL')).toBe(true)
    const now = mine('miles', '2026-01-05')
    expect(now.pending).toBe(was.pending + 1.5)
    expect(now.lve).toBe(was.lve - 1.5)
    expect(now.next).toBe('2026-01-20')
    act(() => { setRole('admin'); setBidState('miles', '2026-01-20', 'refused') })
    const after = mine('miles', '2026-01-05')
    expect(after.pending).toBe(was.pending + 0.5)
    expect(after.next).toBe('2026-01-21')           // a refused day is not his next leave
  })

  it('"next" is the first day from today, across every period — not only the one on screen', () => {
    expect(getState().period.id).toBe('y2026')
    const r = mine('reset', '2026-01-05')
    expect(r.next).toBe('2027-04-13')
    expect(r.pending).toBe(4)
    /* from a later today the past leave is not "next" */
    expect(mine('miles', '2026-02-03').next).toBe('2026-02-03')
    expect(mine('miles', '2026-02-04').next).toBeNull()
  })

  it('writes a figure whole when whole and .5 for a half — never ½ or 14.50 (D1246)', () => {
    expect(fig(4.5)).toBe('4.5')
    expect(fig(2)).toBe('2')
    expect(fig(0.5)).toBe('0.5')
    expect(fig(-4.5)).toBe('-4.5')
  })

  it('the button shows the same figures, and a tap opens his own person window', () => {
    setMemberTodayForTests('2026-01-05')
    act(() => setViewer('miles'))
    render(<><Topbar /><Matrix /></>)
    expect(screen.getByTestId('my-leave-lve').textContent).toBe('LVE 4.5')
    expect(screen.getByTestId('my-leave-oil').textContent).toBe('OIL 6')
    expect(screen.getByTestId('my-leave-pending').textContent).toBe('1.5 pending')
    expect(screen.getByTestId('my-leave').textContent).toContain('next 2 Feb')
    fireEvent.click(screen.getByTestId('my-leave'))
    expect(screen.getByTestId('person-figures').getAttribute('aria-label') ?? screen.getByTestId('person-figures').textContent).toContain('MILES')
  })

  it('an admin with no row on the war has no My leave', () => {
    act(() => { setRole('admin'); setViewer(null) })
    render(<Topbar />)
    expect(screen.queryByTestId('my-leave')).toBeNull()
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
