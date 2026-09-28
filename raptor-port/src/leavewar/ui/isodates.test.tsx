/* [LW-ISO-DATES] (28 Sep 26) — NO LEAVE WAR SHEET PRINTS THE STORED `2026-07-17`. The bid sheet's header, its "moved
   from", the award, the Raptor sheet, the posting sheets and their notes, the one-day selection header, the move
   banner's refusal, the PO tag's hover and the absence door's refusals printed the machine date while the day's list
   beside them read "Sat 18 Jul" (the absence-record re-test, W4-2). Two voices, each the one its neighbours already
   speak: a sheet HEADED by one day reads like the day's list ("Fri 17 Jul"); a date inside a sentence or a span reads
   "17 Jul 26" (the range voice). ONE roll-call over every place (bug-check order §6: a wording fix gets a test that
   renders each place), so a new sheet printing the raw date goes red. Machine attributes (test ids, input values) stay
   ISO — only what a person reads is checked. */
import { readFileSync } from 'node:fs'
import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { AwardSheet, BidPicker, PostInSheet, PostOutSheet, RaptorSheet } from './BidPicker'
import { SelectSheet } from './SelectSheet'
import { dayLabel, inputDayLabel, shortDate } from './dates'
import { initStore } from '../state/store'
import { memoryBackend } from '../state/storage'

const ISO = /\d{4}-\d{2}-\d{2}/   // no \b: the page's text runs spans together (\"Ranger2026-02-11\")
const noop = () => {}
/* every text node a person reads, plus the tooltips and labels — never data-* or an input's value */
const readable = (root: HTMLElement) => {
  const words = [root.textContent || '']
  root.querySelectorAll('[title],[aria-label]').forEach(e => words.push(e.getAttribute('title') || '', e.getAttribute('aria-label') || ''))
  return words.join(' | ')
}

describe('the two voices', () => {
  it('a one-day header reads like the day\'s list; a date in a sentence reads day-first with its year', () => {
    expect(dayLabel('2026-07-17')).toBe('Fri 17 Jul')
    expect(shortDate('2026-07-17')).toBe('17 Jul 26')
    expect(inputDayLabel('Jul 13')).toBe('13 Jul')
    expect(inputDayLabel('Jan 3 2027'), 'another year keeps its year').toBe('3 Jan 2027')
  })
})

describe('every sheet a person reads', () => {
  beforeEach(() => { initStore(memoryBackend()) })
  const sheets: Array<[string, () => ReturnType<typeof render>]> = [
    ['the bid sheet (its header, and the decide row\'s "moved from")', () => render(<BidPicker callsign="Ranger" personId="dusk" date="2026-02-11" current="LL" dates={['2026-02-04', '2026-02-11']} decide={{ state: 'pending', movedFrom: '2026-02-04' }} onClose={noop} />)],
    ['the Raptor sheet (leave from Raptor / OIL the app credited)', () => render(<RaptorSheet callsign="Grit" date="2026-07-14" code="LL" onClose={noop} />)],
    ['the member\'s own OIL award (D261)', () => render(<AwardSheet callsign="Grit" date="2026-07-14" award={{ code: 'FO', days: 1, note: 'weekend', giver: 'Saber' }} onClose={noop} />)],
    ['the Posted out sheet', () => render(<PostOutSheet callsign="HEX" date="2026-08-01" poFrom="2026-07-15" outcome="overseas" onChange={noop} onUndo={noop} onClose={noop} />)],
    ['the Posted in sheet of a man back from a posting (its note)', () => render(<PostInSheet callsign="HEX" date="2026-08-01" piFrom="2026-09-01" backFrom="2026-06-15" onChange={noop} onUndo={noop} onClose={noop} />)],
    ['the Posted in sheet (its note)', () => render(<PostInSheet callsign="HEX" date="2026-01-15" piFrom="2026-02-01" onChange={noop} onUndo={noop} onClose={noop} />)],
    ['the selection sheet over ONE day', () => render(<SelectSheet sel={{ people: ['dusk'], from: '2026-02-11', to: '2026-02-11', cells: [{ personId: 'dusk', date: '2026-02-11' }] }} people={id => id} role="admin" canDecide={true} onDone={noop} onMove={noop} onClose={noop} />)],
    ['the selection sheet over a range', () => render(<SelectSheet sel={{ people: ['dusk'], from: '2026-02-11', to: '2026-02-12', cells: [{ personId: 'dusk', date: '2026-02-11' }, { personId: 'dusk', date: '2026-02-12' }] }} people={id => id} role="admin" canDecide={true} onDone={noop} onMove={noop} onClose={noop} />)],
  ]
  for (const [what, open] of sheets) {
    it(`${what}: no raw machine date`, () => {
      const { unmount } = open()
      /* a sheet draws into the page (a portal), not the test's container — so the PAGE is read, and it must hold the
         sheet's own words (a check that reads an empty box proves nothing) */
      const t = readable(document.body)
      expect(t.replace(/\s+/g, '').length, 'the sheet is on the page').toBeGreaterThan(8)
      expect(t, t).not.toMatch(ISO)
      unmount()
    })
  }
})

/* The sentences built outside a sheet — the move banner's refusal, the PO tag's hover, the absence door's refusals shown
   on the day's list. Each is asked of its source: no bare `${…date}` in what a person reads; every one goes through the
   day-first voice. (The door's refusal for a changed leave is also driven for real in review-fixes.test.ts.) */
describe('the sentences built beside the sheets', () => {
  const src = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8')
  it('the absence door\'s refusals (approve, change, delete) print the day day-first', () => {
    const s = src('../sync.ts')
    const why = [...s.matchAll(/why\.push\(`([^`]*)`\)/g)].map(m => m[1]!)
    expect(why.length, 'the door still says why').toBeGreaterThan(3)
    for (const w of why) expect(w, w).not.toMatch(/\$\{it\.date\}/)
  })
  it('the move banner\'s refusal and the PO tag\'s hover print the day day-first', () => {
    const s = src('./Matrix.tsx')
    expect(s).not.toMatch(/That lands on \$\{r\.at\}/)
    expect(s).not.toMatch(/posts out \$\{addDays\(/)
    expect(s).not.toMatch(/was posted out \$\{addDays\(/)
  })
})
