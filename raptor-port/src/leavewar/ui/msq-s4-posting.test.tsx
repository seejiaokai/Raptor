/* SECTION 4 — THE LEAVE WAR'S POSTING SHEET IN WAY C (his D2648, D2653; his go D2732, "All four as recommended";
   D2659 "Transfer to Sqn" left out; D2660 the Undo redesigned, design A taken; D2727 "Place leave or OIL here instead…"
   removed). The plan: Build 1 §21.4 and §22 (on the batch branch), PT1–PT9, with the step-0 Fable read's findings.
   What the sheet DOES is unchanged (every posting rule: D309, D310, D2087, D2634, D1626–D1628, D294, D306, D1709, D328,
   D332) — these tests hold the new look and order and pin that the posting calls are the same; the rules themselves are
   pinned by po.test, pi.test, postout-date-delete.test and leavewar/postout-*.test, kept green.
   Three squadrons (D2630): its own world, msq-s4-world.ts — 150 and its one admin Mako made through the real doors. */
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { pickDate } from '../../ui/datecal-testkit'
import { getState } from '../state/store'
import { Matrix } from './Matrix'
import { SelectSheet } from './SelectSheet'
import { more } from './more-testkit'
import { useS4World, signInAs, PID, ids } from './msq-s4-world'

useS4World()

const DAY = '2026-12-14'
const cinch = () => getState().people.find(x => x.id === PID.cinch)!
const sheetOf = (id: string) => screen.getByTestId(id)
const head = (sheet: HTMLElement) => sheet.querySelector('.bidsheet-hd') as HTMLElement
/* a before b in the page's order */
const before = (a: Element, b: Element) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)
const openPostOut = (pid: string = PID.cinch, day = DAY) => {
  fireEvent.click(screen.getByTestId(`cell-${pid}-${day}`))
  fireEvent.click(more('bid-postout'))
  return sheetOf('bid-picker')
}
const chipWords = (sheet: HTMLElement) => [...sheet.querySelectorAll('.po-chips .pchip')].map(c => c.textContent!.replace('✓ ', ''))

describe('PT1 — ⋯ → Post out on a day: the sheet is the posting\'s alone, its head names the act (D2653 a, d, f; D2732 Q2)', () => {
  it('the head reads "Cinch" and "Post out", no day in it; none of the leave\'s parts are on the sheet', () => {
    signInAs('hunter')
    render(<Matrix />)
    const s = openPostOut()
    expect(head(s).querySelector('.who')!.textContent).toBe('Cinch')
    expect(head(s).querySelector('.po-act')!.textContent).toBe('Post out')
    expect(head(s).textContent, 'no day in the head — the day is in the "PO from" box only').not.toMatch(/Dec|Mon/)
    expect(within(s).queryByTestId('bid-approve-tick'), 'the Auto-approve switch is the leave\'s; it steps aside').toBeNull()
    expect(within(s).queryByRole('group', { name: 'Which leave' }), 'no leave button').toBeNull()
    expect(within(s).queryByRole('group', { name: 'Duration' })).toBeNull()
    expect(within(s).queryByTestId('bid-dayline')).toBeNull()
    expect(within(s).queryByTestId('bid-actions')).toBeNull()
    expect(within(s).queryByTestId('bid-extra-row')).toBeNull()
    expect(s.querySelector('textarea, .rq-words'), 'no Remarks box').toBeNull()
  })
})

describe('PT2 — the order: the choices, then "PO from", then the line, then the button (D2653 e; D2659)', () => {
  it('three choices for an aircrew man, no "Transfer to Sqn" and no "To squadron" box', () => {
    signInAs('hunter')
    render(<Matrix />)
    const s = openPostOut()
    expect(chipWords(s)).toEqual(['Overseas Sqn', 'Delete', 'SANS'])
    expect(s.textContent).not.toMatch(/Transfer|To squadron/)
    expect(screen.getByTestId('po-overseas').getAttribute('aria-pressed'), 'the sheet still opens on Overseas Sqn').toBe('true')
    const chips = s.querySelector('.po-chips')!, date = screen.getByTestId('po-date'), line = screen.getByTestId('po-line'), go = screen.getByTestId('po-confirm')
    expect(before(chips, date) && before(date, line) && before(line, go)).toBe(true)
    expect(s.querySelector('.po-fields .lab')!.textContent).toBe('PO from')
    expect(s.querySelector('.po-outcomes .lab')!.textContent).toBe('Posting')
    expect(line.textContent).toMatch(/^On 14 Dec: archived/)
  })
  it('a ground-crew man: two choices, Overseas Sqn and Delete (D1709, D2659)', () => {
    signInAs('hunter')
    render(<Matrix />)
    const s = openPostOut(PID.cotter)
    expect(chipWords(s)).toEqual(['Overseas Sqn', 'Delete'])
    expect((s.querySelector('.po-chips') as HTMLElement).style.getPropertyValue('--po-n')).toBe('2')
  })
  it('a refusal\'s reason stands under the button; the last admin\'s line between the line and the button (as drawn)', () => {
    signInAs('saber')
    render(<Matrix />)
    const s = openPostOut(ids.mako)
    const blocked = screen.queryByTestId('po-blocked')
    expect(blocked, 'Mako is 150\'s only admin: the app\'s own line').toBeTruthy()
    expect(before(screen.getByTestId('po-line'), blocked!) && before(blocked!, screen.getByTestId('po-confirm'))).toBe(true)
    expect(s.contains(blocked!)).toBe(true)
  })
})

describe('PT3 — ✕ closes it; the day pressed after it opens the day\'s sheet afresh (D2653 d; D2732 Q3 — two presses)', () => {
  it('✕: nothing posted; the day again: its leave buttons, no posting rows', () => {
    signInAs('hunter')
    render(<Matrix />)
    openPostOut()
    fireEvent.click(screen.getByTestId('bid-cancel'))
    expect(screen.queryByTestId('bid-picker')).toBeNull()
    expect(cinch().to ?? null).toBeNull()
    fireEvent.click(screen.getByTestId(`cell-${PID.cinch}-${DAY}`))
    const s = sheetOf('bid-picker')
    expect(within(s).getByRole('group', { name: 'Which leave' })).toBeTruthy()
    expect(within(s).queryByTestId('po-date')).toBeNull()
    expect(head(s).querySelector('.po-act')).toBeNull()
  })
})

describe('PT4 — "Post out" is the app\'s blue main button and posts exactly as today (D2653 b)', () => {
  it.each([['overseas', null], ['sans', 'po-sans'], ['none', 'po-overseas']] as const)('%s: one posting, the same date and outcome', (want, press) => {
    signInAs('hunter')
    render(<Matrix />)
    openPostOut()
    const go = screen.getByTestId('po-confirm')
    expect(go.className).toMatch(/\bpo-main\b/)
    expect(go.className, 'not the old hatched chip').not.toMatch(/\bpo\b(?!-)/)
    if (press) fireEvent.click(screen.getByTestId(press))
    fireEvent.click(go)
    expect(cinch().to).toBe('2026-12-13')
    expect(cinch().poOutcome ?? 'none').toBe(want)
  })
})

describe('PT5 — Delete: the card hangs from "Post out", its Delete the dashed grey Delete look (D1628; D2732 Q4, D332)', () => {
  it('first press asks; the card\'s Delete wears the Leave War\'s Delete look; Cancel stays the blue one; Delete posts', () => {
    signInAs('hunter')
    render(<Matrix />)
    openPostOut()
    fireEvent.click(screen.getByTestId('po-delete'))
    fireEvent.click(screen.getByTestId('po-confirm'))
    expect(cinch().to ?? null).toBeNull()
    const go = screen.getByTestId('po-delete-go')
    expect(go.className).toMatch(/\bpo-del\b/)
    expect(go.className).not.toMatch(/\bdanger\b/)
    expect(screen.getByTestId('po-delete-cancel').className).toMatch(/\bprimary\b/)
    fireEvent.click(go)
    expect(cinch().to).toBe('2026-12-13')
    expect(cinch().poOutcome).toBe('delete')
  })
})

describe('PT7 — Post in in the same shape (D2653: "Cinch  Post in")', () => {
  it('the head, "PI from", the note on its strip, a blue "Post in" — and it posts as today', () => {
    signInAs('hunter')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${PID.cinch}-${DAY}`))
    fireEvent.click(more('bid-postin'))
    const s = sheetOf('bid-picker')
    expect(head(s).querySelector('.po-act')!.textContent).toBe('Post in')
    expect(within(s).queryByRole('group', { name: 'Which leave' })).toBeNull()
    expect(s.querySelector('.po-fields .lab')!.textContent).toBe('PI from')
    const date = screen.getByTestId('pi-date'), line = s.querySelector('.po-line')!, go = screen.getByTestId('pi-confirm')
    expect(line.textContent).toMatch(/^Their first day in the squadron/)
    expect(before(date, line) && before(line, go)).toBe(true)
    expect(go.className).toMatch(/\bpo-main\b/)
    fireEvent.click(go)
    expect(cinch().from).toBe(DAY)
  })
})

describe('PT10 — on a phone the day stays in sight as the sheet becomes the posting (D1290; chat 196\'s find)', () => {
  /* The browser test's phone Q3 case found it: the one-day window scrolls the tapped day just above itself as it opens
     (D1290), but Post out's sheet is taller than the leave's, so it rose over the very day it was opened from — a press
     on that day then landed on the sheet. jsdom lays nothing out, so the heights are given: the day's foot at 378, the
     leave's sheet from 385 (clear of the day — no scroll as it opens), the posting's from 332 (over it). */
  for (const [act, btn] of [['Post out', 'bid-postout'], ['Post in', 'bid-postin']] as const) {
    it(`${act}: the page scrolls the day back just above the sheet`, () => {
      /* jsdom has no matchMedia: a phone's width is given once the day's sheet is open (the grid's own phone layout —
         its rolling window of months — is not this test's; nothing else asked matches, so the pointer stays fine) */
      const phoneWidth = () => vi.stubGlobal('matchMedia', (q: string) => ({ matches: q === '(max-width: 700px)', media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false }) as MediaQueryList)
      const mm = { mockRestore: () => vi.unstubAllGlobals() }
      const rect = (top: number, bottom: number) => ({ top, bottom, height: bottom - top, left: 0, right: 390, width: 390, x: 0, y: top, toJSON() {} }) as DOMRect
      const jsdomRect = Element.prototype.getBoundingClientRect
      const gbr = vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
        const tid = this.getAttribute('data-testid')
        if (tid === `cell-${PID.cinch}-${DAY}`) return rect(360, 378)
        if (tid === 'bid-picker') return this.querySelector('.po-form') ? rect(332, 650) : rect(385, 650)
        return jsdomRect.call(this)   // every other box as jsdom draws it (all zero), so the grid's own measuring is unchanged
      })
      const scroll = vi.spyOn(window, 'scrollBy').mockImplementation(() => {})
      try {
        signInAs('hunter')
        render(<div id="page-leavewar" className="page on"><Matrix /></div>)   // the app's page box, where the day is looked for
        fireEvent.click(screen.getByTestId(`cell-${PID.cinch}-${DAY}`))
        phoneWidth()
        expect(scroll, 'the leave\'s sheet leaves the day clear: nothing moves').not.toHaveBeenCalled()
        fireEvent.click(more(btn))
        expect(head(sheetOf('bid-picker')).querySelector('.po-act')!.textContent).toBe(act)
        expect(scroll, 'the day brought back above the posting\'s sheet: its foot 378, the sheet from 332, 8 to spare').toHaveBeenCalledWith(0, 54)
      } finally { mm.mockRestore(); gbr.mockRestore(); scroll.mockRestore() }
    })
  }
})

describe('PT8 — an existing posting\'s sheet, the drag sheet\'s posting: the same shape (D2732 Q1 design A, Q2)', () => {
  it('an existing post-out: "Cinch  Post out", the choices, the date, the line, "Undo post out" alone at the foot', () => {
    signInAs('hunter')
    render(<Matrix />)
    openPostOut()
    fireEvent.click(screen.getByTestId('po-confirm'))
    fireEvent.click(screen.getByTestId(`cell-${PID.cinch}-2026-12-15`))
    const s = sheetOf('postout-sheet')
    expect(head(s).querySelector('.po-act')!.textContent).toBe('Post out')
    expect(head(s).textContent).not.toMatch(/Dec|Tue/)
    expect(chipWords(s)).toEqual(['Overseas Sqn', 'Delete', 'SANS'])
    const undo = screen.getByTestId('postout-undo')
    expect(undo.textContent).toBe('↶Undo post out')
    expect(undo.querySelector('.mvarr')!.textContent).toBe('↶')
    expect(undo.className).toMatch(/\bdchip\b.*\bmove\b/)
    expect(s.querySelector('.po-foot')!.querySelectorAll('button')).toHaveLength(1)
    expect(screen.queryByTestId('postout-place'), 'D2727').toBeNull()
    const chips = s.querySelector('.po-chips')!, date = screen.getByTestId('postout-date'), line = screen.getByTestId('postout-line')
    expect(before(chips, date) && before(date, line) && before(line, undo)).toBe(true)
    fireEvent.click(undo)
    expect(cinch().to ?? null).toBeNull()
  })
  it('an existing post-in: "Cinch  Post in", "PI from", then its note, then "Undo post in"', () => {
    signInAs('hunter')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${PID.cinch}-${DAY}`))
    fireEvent.click(more('bid-postin'))
    fireEvent.click(screen.getByTestId('pi-confirm'))
    fireEvent.click(screen.getByTestId(`cell-${PID.cinch}-2026-12-10`))
    const s = sheetOf('postin-sheet')
    expect(head(s).querySelector('.po-act')!.textContent).toBe('Post in')
    const date = screen.getByTestId('postin-date'), note = screen.getByTestId('postin-note'), undo = screen.getByTestId('postin-undo')
    expect(before(date, note) && before(note, undo)).toBe(true)
    expect(note.closest('.po-line')).toBeTruthy()
    expect(undo.textContent).toBe('↶Undo post in')
    expect(screen.queryByTestId('postin-place'), 'D2727').toBeNull()
  })
  it('the drag sheet: "Cinch  Post out", only the posting, the range\'s first day in "PO from"; Post in its twin', () => {
    signInAs('hunter')
    const posted: unknown[] = []
    const sel = { people: [PID.cinch], from: DAY, to: '2026-12-18', cells: ['14', '15', '16', '17', '18'].map(d => ({ personId: PID.cinch, date: `2026-12-${d}` })) }
    const { unmount } = render(<SelectSheet sel={sel as any} people={() => 'Cinch'} role="admin" canDecide onDone={() => {}} onMove={() => {}} onClose={() => {}}
      onPostOut={(...a) => { posted.push(a); return undefined }} onPostIn={() => undefined} />)
    fireEvent.click(screen.getByTestId('sel-more'))
    fireEvent.click(screen.getByTestId('sel-postout'))
    const s = sheetOf('select-sheet')
    expect(head(s).querySelector('.po-act')!.textContent).toBe('Post out')
    expect(head(s).textContent).not.toMatch(/Dec|days/)
    expect(within(s).queryByRole('group', { name: 'Which leave' })).toBeNull()
    expect(within(s).queryByRole('group', { name: 'Duration' })).toBeNull()
    expect(within(s).queryByTestId('sel-approve-tick')).toBeNull()
    expect(chipWords(s)).toEqual(['Overseas Sqn', 'Delete', 'SANS'])
    expect(screen.getByTestId('sel-po-confirm').className).toMatch(/\bpo-main\b/)
    pickDate(screen.getByTestId('sel-po-date'), '2026-12-16')
    fireEvent.click(screen.getByTestId('sel-po-confirm'))
    expect(posted).toEqual([[PID.cinch, '2026-12-16', 'overseas']])
    unmount()
    render(<SelectSheet sel={sel as any} people={() => 'Cinch'} role="admin" canDecide onDone={() => {}} onMove={() => {}} onClose={() => {}}
      onPostOut={() => undefined} onPostIn={() => undefined} />)
    fireEvent.click(screen.getByTestId('sel-more'))
    fireEvent.click(screen.getByTestId('sel-postin'))
    const t = sheetOf('select-sheet')
    expect(head(t).querySelector('.po-act')!.textContent).toBe('Post in')
    expect(screen.getByTestId('sel-pi-confirm').className).toMatch(/\bpo-main\b/)
  })
})

describe('PT9 — "Place leave or OIL here instead…" is gone from both posting sheets (D2727)', () => {
  it('an admin\'s tap on a day after the posting opens the posting sheet only — no way through to the leave buttons there', () => {
    signInAs('hunter')
    render(<Matrix />)
    openPostOut()
    fireEvent.click(screen.getByTestId('po-confirm'))
    fireEvent.click(screen.getByTestId(`cell-${PID.cinch}-2026-12-20`))
    expect(screen.getByTestId('postout-sheet')).toBeTruthy()
    expect(screen.queryByText(/Place leave or OIL here instead/)).toBeNull()
  })
})
