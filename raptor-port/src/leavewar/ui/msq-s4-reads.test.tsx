/* SECTION 4's CODE READS, KEPT — the proof tests the three blind readers of chat 196 wrote (Astra, a fresh Opus, a fresh
   Fable), each seen failing on the build they read before chat 197's fixes (or, for the doors, passing as they should),
   gathered here unchanged in what they assert. Their own world: test-support/msq-s4-world.ts (three squadrons, D2630).

   The day BEFORE a man's post-in holding an entry (the Opus read's F1, Fable's A) waited for his answer: D2743, build it. */
import type { ReactNode } from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getState, grantOilDays, setCell, setPostIn, setPostOut } from '../state/store'
import { Matrix } from './Matrix'
import { PostInSheet, PostOutSheet } from './BidPicker'
import { SelectSheet } from './SelectSheet'
import { keepCellAboveSheet } from './cellinsight'
import { more } from './more-testkit'
import { useS4World, signInAs, PID } from '../../test-support/msq-s4-world'

useS4World()

const PO = '2026-12-14', AFTER = '2026-12-15', AFTER2 = '2026-12-16', BEFORE = '2026-12-10'
const noop = () => {}
const reqsOn = (pid: string, date: string) => (getState().views[pid]?.[date]?.all ?? []).filter((c: any) => c.kind === 'request')
const tapLL = () => {
  fireEvent.click(screen.getByTestId('bid-LL'))
  if (screen.queryByText(/Tap the same leave again/)) fireEvent.click(screen.getByTestId('bid-LL'))
}
const postOutVia = (outcome: 'delete' | 'overseas') => {
  fireEvent.click(screen.getByTestId(`cell-${PID.cinch}-${PO}`))
  fireEvent.click(more('bid-postout'))
  const chip = screen.getByTestId(`po-${outcome}`)
  if (chip.getAttribute('aria-pressed') !== 'true') fireEvent.click(chip)
  fireEvent.click(screen.getByTestId('po-confirm'))
  if (outcome === 'delete') fireEvent.click(screen.getByTestId('po-delete-go'))
  expect(getState().people.find(x => x.id === PID.cinch)!.to).toBe('2026-12-13')
}

/* ── the doors the three cut browser tests' state is still reached by (the coordinator's question): an admin's tap on a gone
   day that already holds an entry opens the one-day window, Auto-approve and all (D1722, D1725) ── */
describe('the cut tests\' state is still reachable (Opus proof 1, Fable B)', () => {
  it('R3b: a Delete posting, an award on the day after: the one-day window opens with Auto-approve, LL is kept pending with the reason', () => {
    signInAs('hunter')
    expect(setPostOut(PID.cinch, PO, 'delete')).toBe(true)
    expect(grantOilDays([{ personId: PID.cinch, date: AFTER }], 1, { note: 'x' })).toBeNull()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${PID.cinch}-${AFTER}`))
    expect(screen.queryByTestId('postout-sheet'), 'not the posting sheet').toBeNull()
    expect(screen.getByTestId('bid-approve-tick').getAttribute('aria-checked')).toBe('true')
    tapLL()
    expect(document.body.textContent).toMatch(/kept pending — He posts out on 14 Dec: refuse or delete it/)
  })
  it('D1541: an Overseas posting, an award on the day after: LL lands approved, nothing kept pending', () => {
    signInAs('hunter')
    expect(setPostOut(PID.cinch, PO, 'overseas')).toBe(true)
    expect(grantOilDays([{ personId: PID.cinch, date: AFTER }], 1, { note: 'x' })).toBeNull()
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${PID.cinch}-${AFTER}`))
    expect(screen.getByTestId('bid-approve-tick').getAttribute('aria-checked')).toBe('true')
    tapLL()
    expect(document.body.textContent).not.toMatch(/kept pending/)
  })
  it('control: a posted-OUT day holding a pending bid opens the bid window (D1722)', () => {
    signInAs('hunter')
    expect(setCell(PID.cinch, AFTER2, 'LL')).toBe(true)
    render(<Matrix />)
    postOutVia('overseas')
    fireEvent.click(screen.getByTestId(`cell-${PID.cinch}-${AFTER2}`))
    expect(screen.queryByTestId('postout-sheet')).toBeNull()
    expect(screen.getByTestId('bid-picker')).toBeTruthy()
    expect(screen.getByTestId('bid-actions')).toBeTruthy()
  })
  it('R3b and R3c-2 by a bid already there: Delete posting ahead, Auto-approve on, the lit leave pressed — kept pending, said; closed and opened again, not said again', () => {
    signInAs('hunter')
    expect(setCell(PID.cinch, AFTER2, 'LL')).toBe(true)
    render(<Matrix />)
    postOutVia('delete')
    fireEvent.click(screen.getByTestId(`cell-${PID.cinch}-${AFTER2}`))
    const s = screen.getByTestId('bid-picker')
    const tick = within(s).getByTestId('bid-approve-tick')
    if (tick.getAttribute('aria-checked') !== 'true') fireEvent.click(tick)
    fireEvent.click(within(s).getByTestId('bid-LL'))
    if (screen.queryByText(/Tap the same leave again/)) fireEvent.click(within(s).getByTestId('bid-LL'))
    expect(screen.getByText(/kept pending — He posts out on 14 Dec: refuse or delete it/)).toBeTruthy()
    expect(screen.getByTestId('bid-picker'), 'the window stays').toBeTruthy()
    fireEvent.click(screen.getByTestId('bid-cancel'))
    fireEvent.click(screen.getByTestId(`cell-${PID.cinch}-${AFTER2}`))
    expect(screen.getByTestId('bid-picker')).toBeTruthy()
    expect(screen.queryByText(/kept pending/)).toBeNull()
  })
  it('D1541 by a bid already there: an Overseas posting — the lit leave pressed with Auto-approve on lands approved, nothing kept pending', () => {
    signInAs('hunter')
    expect(setCell(PID.cinch, AFTER2, 'LL')).toBe(true)
    render(<Matrix />)
    postOutVia('overseas')
    fireEvent.click(screen.getByTestId(`cell-${PID.cinch}-${AFTER2}`))
    const s = screen.getByTestId('bid-picker')
    const tick = within(s).getByTestId('bid-approve-tick')
    if (tick.getAttribute('aria-checked') !== 'true') fireEvent.click(tick)
    fireEvent.click(within(s).getByTestId('bid-LL'))
    if (screen.queryByText(/Tap the same leave again/)) fireEvent.click(within(s).getByTestId('bid-LL'))
    expect(screen.queryByText(/kept pending/)).toBeNull()
    expect(reqsOn(PID.cinch, AFTER2).filter((r: any) => r.state === 'pending'), 'no bid left pending').toHaveLength(0)
  })
})

/* ── the day BEFORE a man's post-in that holds an entry (Opus F1, Fable A — his D2743, 26 Nov 26, through the
   coordinator): the admin's tap opens that entry's own window, as after a post-out (D1722); an empty such day still
   opens the Post in sheet ── */
describe('a day before his post-in that holds an entry (D2743)', () => {
  it('leave placed first, then the post-in: the admin\'s tap opens the day\'s usual window, not the Post in sheet alone', () => {
    signInAs('hunter')
    expect(setCell(PID.cinch, BEFORE, 'LL'), 'leave placed first, while he is in').toBe(true)
    expect(setPostIn(PID.cinch, PO)).toBe(true)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${PID.cinch}-${BEFORE}`))
    expect(screen.queryByTestId('postin-sheet'), 'not the Post in sheet').toBeNull()
    expect(screen.getByTestId('bid-picker'), 'the bid window, its bid\'s own actions').toBeTruthy()
    expect(screen.getByTestId('bid-actions')).toBeTruthy()
  })
  it('an EMPTY day before his post-in still opens the Post in sheet', () => {
    signInAs('hunter')
    expect(setPostIn(PID.cinch, PO)).toBe(true)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${PID.cinch}-${BEFORE}`))
    expect(screen.getByTestId('postin-sheet')).toBeTruthy()
    expect(screen.queryByTestId('bid-picker')).toBeNull()
  })
})

/* ── the drag window: a decision's note does not stand on the posting (Opus F2, Fable C) ── */
describe('drag window: a leave note does not stand on the posting', () => {
  it('Approve over a bid and an empty day, then ⋯ → Post out: the decision\'s note is gone with the leave\'s parts', () => {
    signInAs('hunter')
    expect(setCell(PID.cinch, PO, 'LL')).toBe(true)
    const sel = { people: [PID.cinch], from: PO, to: AFTER, cells: [{ personId: PID.cinch, date: PO }, { personId: PID.cinch, date: AFTER }] } as any
    render(<SelectSheet sel={sel} people={() => 'Cinch'} role="admin" canDecide onDone={noop} onMove={noop} onClose={noop}
      onPostOut={() => undefined} />)
    fireEvent.click(screen.getByTestId('sel-approve'))
    expect(screen.queryByTestId('sel-note'), 'set-up: the decision left its note').toBeTruthy()
    fireEvent.click(more('sel-postout'))
    expect(screen.getByTestId('sel-po-confirm'), 'the posting is open').toBeTruthy()
    expect(screen.queryByTestId('sel-note'), 'the leave\'s note steps aside with the leave\'s parts (way C, D2653 a)').toBeNull()
  })
  it('Approve refused ("not approved: He posts out…"), then ⋯ → Post out: the posting stands alone, no leftover leave note', () => {
    signInAs('hunter')
    expect(setCell(PID.cinch, AFTER2, 'LL')).toBe(true)
    const { unmount } = render(<Matrix />)
    postOutVia('delete')
    unmount()
    const sel = { people: [PID.cinch], from: AFTER2, to: AFTER2, cells: [{ personId: PID.cinch, date: AFTER2 }] }
    render(<SelectSheet sel={sel as any} people={() => 'Cinch'} role="admin" canDecide onDone={noop} onMove={noop} onClose={noop}
      onPostOut={() => undefined} onPostIn={() => undefined} />)
    fireEvent.click(screen.getByTestId('sel-approve'))
    expect(screen.getByTestId('sel-note').textContent, 'the refusal, said').toMatch(/not approved: He posts out on 14 Dec/)
    fireEvent.click(screen.getByTestId('sel-more'))
    fireEvent.click(screen.getByTestId('sel-postout'))
    expect(screen.getByTestId('sel-po-confirm')).toBeTruthy()
    expect(screen.queryByTestId('sel-note'), 'the posting alone — the leave\'s note stepped aside with the leave\'s parts').toBeNull()
  })
})

/* ── the spoken name (Opus F4) ── */
describe('the posting window says what it is to a screen reader', () => {
  it('one-day window turned posting: the dialog is named for the posting, not "Place a bid"', () => {
    signInAs('hunter')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${PID.cinch}-${PO}`))
    expect(screen.getByTestId('bid-picker').getAttribute('aria-label')).toBe('Place a bid')
    fireEvent.click(more('bid-postout'))
    expect(screen.getByTestId('bid-picker').getAttribute('aria-label')).toMatch(/Post out/)
  })
  it('the drag window turned posting: named "Post in", not "Selected days"', () => {
    signInAs('hunter')
    const sel = { people: [PID.cinch], from: PO, to: PO, cells: [{ personId: PID.cinch, date: PO }] } as any
    render(<SelectSheet sel={sel} people={() => 'Cinch'} role="admin" canDecide onDone={noop} onMove={noop} onClose={noop}
      onPostOut={() => undefined} onPostIn={() => undefined} />)
    expect(screen.getByTestId('select-sheet').getAttribute('aria-label')).toBe('Selected days')
    fireEvent.click(more('sel-postin'))
    expect(screen.getByTestId('select-sheet').getAttribute('aria-label')).toBe('Post in')
  })
})

/* ── the keyboard (Fable K) and a member's doors (Fable M, a pin) ── */
describe('the keyboard', () => {
  it('K1: ⋯ → Post out by the keyboard: the keys land inside the posting', () => {
    signInAs('hunter')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${PID.cinch}-${PO}`))
    const moreBtn = screen.getByTestId('bid-more')
    moreBtn.focus()
    fireEvent.click(moreBtn)
    const item = screen.getByTestId('bid-postout')
    item.focus()
    expect(document.activeElement).toBe(item)
    fireEvent.click(item)
    const sheet = screen.getByTestId('bid-picker')
    expect(screen.getByTestId('po-confirm')).toBeTruthy()
    expect(sheet.contains(document.activeElement), `the keyboard is on <${document.activeElement?.tagName}>`).toBe(true)
  })
  it('K1 over a drag: ⋯ → Post in by the keyboard lands on its date box', () => {
    signInAs('hunter')
    const sel = { people: [PID.cinch], from: PO, to: PO, cells: [{ personId: PID.cinch, date: PO }] } as any
    render(<SelectSheet sel={sel} people={() => 'Cinch'} role="admin" canDecide onDone={noop} onMove={noop} onClose={noop}
      onPostOut={() => undefined} onPostIn={() => undefined} />)
    const moreBtn = screen.getByTestId('sel-more')
    moreBtn.focus()
    fireEvent.click(moreBtn)
    const item = screen.getByTestId('sel-postin')
    item.focus()
    fireEvent.click(item)
    expect(screen.getByTestId('select-sheet').contains(document.activeElement), `the keyboard is on <${document.activeElement?.tagName}>`).toBe(true)
  })
  it('K2: Escape with the posting open closes the sheet, nothing posted; with the Delete card up it closes the card only', () => {
    signInAs('hunter')
    render(<div id="page-leavewar" className="page on"><Matrix /></div>)
    fireEvent.click(screen.getByTestId(`cell-${PID.cinch}-${PO}`))
    fireEvent.click(screen.getByTestId('bid-more'))
    fireEvent.click(screen.getByTestId('bid-postout'))
    fireEvent.click(screen.getByTestId('po-delete'))
    fireEvent.click(screen.getByTestId('po-confirm'))
    expect(screen.getByTestId('po-delete-ask')).toBeTruthy()
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.queryByTestId('po-delete-ask'), 'the card goes').toBeNull()
    expect(screen.getByTestId('po-confirm'), 'the posting stays').toBeTruthy()
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.queryByTestId('bid-picker'), 'the sheet closes').toBeNull()
    expect(getState().people.find(x => x.id === PID.cinch)!.to ?? null).toBeNull()
  })
})

describe('a member never opens a posting sheet', () => {
  it('his own day after his posting-out date opens the bid window, its ⋯ with no Post out / Post in; another man\'s gone day opens no posting sheet', () => {
    signInAs('hunter')
    expect(setPostOut(PID.ranger, PO, 'none')).toBe(true)
    expect(setPostOut(PID.cinch, PO, 'none')).toBe(true)
    signInAs('ranger')
    expect(getState().role).toBe('member')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${PID.ranger}-${AFTER2}`))
    const what = ['postout-sheet', 'postin-sheet', 'bid-picker', 'closed-note'].filter(t => screen.queryByTestId(t))
    expect(what).not.toContain('postout-sheet')
    const moreBtn = screen.queryByTestId('bid-more')
    if (moreBtn) {
      fireEvent.click(moreBtn)
      expect(screen.queryByTestId('bid-postout')).toBeNull()
      expect(screen.queryByTestId('bid-postin')).toBeNull()
    }
    const x = screen.queryByTestId('bid-cancel'); if (x) fireEvent.click(x)
    fireEvent.click(screen.getByTestId(`cell-${PID.cinch}-${AFTER2}`))
    expect(screen.queryByTestId('postout-sheet')).toBeNull()
    expect(screen.queryByTestId('postin-sheet')).toBeNull()
  })
})

/* ── on a phone the day stays in sight above every posting window (his D1290 — Opus F3, Astra's finding 1) ── */
describe('phone: the tapped day stays in sight above the sheet, through the grid (Opus proof 3)', () => {
  let mm: any, gbr: any, sb: any
  beforeEach(() => {
    mm = window.matchMedia; gbr = Element.prototype.getBoundingClientRect; sb = window.scrollBy
    ;(window as any).matchMedia = (q: string) => ({ matches: q === '(max-width: 700px)', media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} })
    Element.prototype.getBoundingClientRect = function (this: Element) {
      const id = this.getAttribute('data-testid') || ''
      const r = (top: number, h: number) => ({ top, bottom: top + h, height: h, left: 0, right: 100, width: 100, x: 0, y: top, toJSON() {} }) as DOMRect
      if (id.startsWith(`cell-${PID.cinch}-`)) return r(600, 40)          // the day tapped, low on the screen
      if (id === 'bid-picker' || id === 'postout-sheet' || id === 'postin-sheet') return r(500, 340)   // the sheet over it
      return r(0, 0)
    }
    ;(window as any).scrollBy = vi.fn()
  })
  afterEach(() => { (window as any).matchMedia = mm; Element.prototype.getBoundingClientRect = gbr; (window as any).scrollBy = sb })

  it('control — the bid window on a day in his time scrolls the day above it', () => {
    signInAs('hunter')
    render(<div id="page-leavewar" className="page on"><Matrix /></div>)
    fireEvent.click(screen.getByTestId('month-DEC'))
    fireEvent.click(screen.getByTestId(`cell-${PID.cinch}-${BEFORE}`))
    expect(screen.getByTestId('bid-picker')).toBeTruthy()
    expect((window.scrollBy as any).mock.calls.length, 'the grid scrolled').toBeGreaterThan(0)
  })
  it('an existing posting\'s sheet on a gone day scrolls the day above it too', () => {
    signInAs('hunter')
    expect(setPostOut(PID.cinch, PO, 'overseas')).toBe(true)
    render(<div id="page-leavewar" className="page on"><Matrix /></div>)
    fireEvent.click(screen.getByTestId('month-DEC'))
    fireEvent.click(screen.getByTestId(`cell-${PID.cinch}-${AFTER}`))
    expect(screen.getByTestId('postout-sheet')).toBeTruthy()
    expect((window.scrollBy as any).mock.calls.length, 'the grid scrolled the gone day above the posting sheet').toBeGreaterThan(0)
  })
})

describe('phone: the existing posting windows and the drag window (Astra\'s finding 1, its own tests)', () => {
  const DAY = '2026-12-14'
  const CELL = `cell-${PID.cinch}-${DAY}`
  afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
  function phone() {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: q === '(max-width: 700px)', media: q, onchange: null,
      addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
    }) as MediaQueryList)
  }
  function rect(top: number, bottom: number): DOMRect {
    return { top, bottom, height: bottom - top, left: 0, right: 390, width: 390, x: 0, y: top, toJSON() {} } as DOMRect
  }
  function geometry(sheetId: string, changesIntoPosting = false) {
    const original = Element.prototype.getBoundingClientRect
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      const id = this.getAttribute('data-testid')
      if (id === CELL) return rect(360, 378)
      if (id === sheetId) return rect(changesIntoPosting && !this.querySelector('.po-form') ? 385 : 332, 650)
      return original.call(this)
    })
    return vi.spyOn(window, 'scrollBy').mockImplementation(() => {})
  }
  function page(children: ReactNode) {
    return render(<div id="page-leavewar" className="page on"><div data-testid={CELL}>14</div>{children}</div>)
  }

  it.each(['out', 'in'] as const)('existing Post %s', kind => {
    signInAs('hunter')
    phone()
    const id = kind === 'out' ? 'postout-sheet' : 'postin-sheet'
    const scroll = geometry(id)
    page(kind === 'out'
      ? <PostOutSheet callsign="Cinch" date={DAY} poFrom="2026-12-10" outcome="none" onChange={noop} onUndo={noop} onClose={noop} />
      : <PostInSheet callsign="Cinch" date={DAY} piFrom="2026-12-18" onChange={noop} onUndo={noop} onClose={noop} />)
    expect(screen.getByTestId(id)).toBeTruthy()
    keepCellAboveSheet(PID.cinch, DAY)   // the same helper Matrix calls after opening the day
    expect(scroll).toHaveBeenCalledWith(0, 54)
  })

  it.each(['out', 'in'] as const)('the drag window becoming Post %s keeps the first day visible', kind => {
    signInAs('hunter')
    phone()
    const scroll = geometry('select-sheet', true)
    const dates = [DAY, '2026-12-15', '2026-12-16']
    const sel = { people: [PID.cinch], from: dates[0]!, to: dates[2]!, cells: dates.map(date => ({ personId: PID.cinch, date })) }
    page(<SelectSheet sel={sel} people={() => 'Cinch'} role="admin" canDecide onDone={noop} onMove={noop} onClose={noop}
      onPostOut={noop} onPostIn={noop} />)
    expect(scroll, 'opening over days already clear of it moves nothing').not.toHaveBeenCalled()
    fireEvent.click(screen.getByTestId('sel-more'))
    fireEvent.click(screen.getByTestId(`sel-post${kind}`))
    expect(screen.getByTestId('sel-po-title').textContent).toBe(`Post ${kind}`)
    expect(scroll).toHaveBeenCalledWith(0, 54)
  })
})
